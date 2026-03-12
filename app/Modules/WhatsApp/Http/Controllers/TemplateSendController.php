<?php

namespace App\Modules\WhatsApp\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Core\Billing\EntitlementService;
use App\Core\Billing\UsageService;
use App\Modules\WhatsApp\Events\Inbox\ConversationUpdated;
use App\Modules\WhatsApp\Events\Inbox\MessageCreated;
use App\Modules\WhatsApp\Events\Inbox\MessageUpdated;
use App\Modules\WhatsApp\Models\WhatsAppContact;
use App\Modules\WhatsApp\Models\WhatsAppConversation;
use App\Modules\WhatsApp\Models\WhatsAppMessage;
use App\Modules\WhatsApp\Models\WhatsAppTemplate;
use App\Modules\WhatsApp\Models\WhatsAppTemplateSend;
use App\Modules\WhatsApp\Services\TemplateComposer;
use App\Modules\WhatsApp\Services\ContactComplianceService;
use App\Modules\WhatsApp\Services\OutboundMessagePipelineService;
use App\Modules\WhatsApp\Services\TemplateLifecycleService;
use App\Modules\WhatsApp\Services\TemplateManagementService;
use App\Modules\WhatsApp\Services\WhatsAppClient;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class TemplateSendController extends Controller
{
    public function __construct(
        protected TemplateComposer $composer,
        protected WhatsAppClient $whatsappClient,
        protected TemplateManagementService $templateManagementService,
        protected TemplateLifecycleService $templateLifecycleService,
        protected ContactComplianceService $contactComplianceService,
        protected OutboundMessagePipelineService $outboundPipeline,
        protected EntitlementService $entitlementService,
        protected UsageService $usageService
    ) {
    }

    /**
     * Show the send template form.
     */
    public function create(Request $request, WhatsAppTemplate $template)
    {
        $account = $request->attributes->get('account') ?? current_account();

        // Ensure template belongs to account
        if (!account_ids_match($template->account_id, $account->id)) {
            abort(404);
        }

        $template->load('connection');

        if (!$template->connection) {
            return redirect()->route('app.whatsapp.templates.index')
                ->withErrors(['template' => 'This template is not linked to a WhatsApp connection.']);
        }

        // Get required variables
        $requiredVars = $this->composer->extractRequiredVariables($template);

        // Get contacts and conversations for selection
        $contacts = WhatsAppContact::where('account_id', $account->id)
            ->orderBy('name')
            ->get(['id', 'wa_id', 'name']);

        $conversations = WhatsAppConversation::where('account_id', $account->id)
            ->with('contact')
            ->orderBy('last_message_at', 'desc')
            ->limit(50)
            ->get()
            ->map(function ($conv) {
                if (!$conv->contact) {
                    return null;
                }

                return [
                    'id' => $conv->id,
                    'contact' => [
                        'wa_id' => $conv->contact->wa_id,
                        'name' => $conv->contact->name ?? $conv->contact->wa_id]];
            })
            ->filter()
            ->values();

        $recentSends = $template->sends()
            ->with('message')
            ->latest('id')
            ->limit(10)
            ->get()
            ->map(function ($send) {
                return [
                    'id' => $send->id,
                    'to_wa_id' => $send->to_wa_id,
                    'status' => $send->status,
                    'error_message' => $send->error_message,
                    'sent_at' => $send->sent_at?->toIso8601String(),
                    'created_at' => $send->created_at?->toIso8601String(),
                    'message' => $send->message ? [
                        'id' => $send->message->id,
                        'status' => $send->message->status,
                        'error_message' => $send->message->error_message,
                        'meta_message_id' => $send->message->meta_message_id,
                    ] : null,
                ];
            })
            ->values();

        return \Inertia\Inertia::render('WhatsApp/Templates/Send', [
            'account' => $account,
            'template' => [
                'id' => $template->id,
                'slug' => $template->slug,
                'name' => $template->name,
                'language' => $template->language,
                'header_type' => $template->header_type,
                'header_media_url' => $template->header_media_url,
                'body_text' => $template->body_text,
                'header_text' => $template->header_text,
                'footer_text' => $template->footer_text,
                'buttons' => $template->buttons,
                'variable_count' => $template->variable_count,
                'required_variables' => $requiredVars],
            'contacts' => $contacts,
            'conversations' => $conversations,
            'recent_sends' => $recentSends,
        ]);
    }

    /**
     * Send a template message.
     */
    public function store(Request $request, WhatsAppTemplate $template)
    {
        $account = $request->attributes->get('account') ?? current_account();

        // Ensure template belongs to account
        if (!account_ids_match($template->account_id, $account->id)) {
            abort(404);
        }

        $template->load('connection');

        if (!$template->connection) {
            return redirect()->back()->withErrors([
                'template' => 'Template connection is missing. Re-sync templates or reconnect WhatsApp.',
            ]);
        }

        if (!$template->connection->is_active) {
            return redirect()->back()->withErrors([
                'template' => 'Selected WhatsApp connection is inactive.',
            ]);
        }

        // Enforce billing limits before template validations so limit blocks are deterministic.
        $this->entitlementService->assertWithinLimit($account, 'messages_monthly', 1);
        $this->entitlementService->assertWithinLimit($account, 'template_sends_monthly', 1);

        $sendability = $this->templateLifecycleService->evaluateSendability($template);
        if (!$sendability['ok']) {
            return redirect()->back()->withErrors([
                'template' => $sendability['reason'] ?? 'Template is not sendable.',
            ]);
        }

        // Check suppression early so we do not call Meta status APIs for blocked recipients.
        $basicRecipient = $request->validate([
            'to_wa_id' => 'required|string',
        ]);
        $targetContact = WhatsAppContact::where('account_id', $account->id)
            ->where('wa_id', $basicRecipient['to_wa_id'])
            ->first();
        if ($this->contactComplianceService->isSuppressed($targetContact)) {
            return redirect()->back()->withErrors([
                'to_wa_id' => 'This contact is suppressed (opted out/blocked/do-not-contact).',
            ]);
        }

        // Re-validate live status from Meta to avoid stale local status sending outdated versions.
        // If template has no Meta ID yet, continue with local approval status and let send API decide.
        if (!empty($template->meta_template_id)) {
            try {
                $statusData = $this->templateManagementService->getTemplateStatus($template->connection, (string) $template->meta_template_id);
                $liveStatus = $this->templateLifecycleService->normalizeStatus((string) ($statusData['status'] ?? $template->status ?? ''));
                $liveName = strtolower(trim((string) ($statusData['name'] ?? '')));
                $localName = strtolower(trim((string) $template->name));
                $liveLanguage = strtolower(trim((string) ($statusData['language'] ?? '')));
                $localLanguage = strtolower(trim((string) $template->language));
                $rejectionReason = $statusData['rejected_reason'] ?? $statusData['rejection_reason'] ?? null;
                $template->update([
                    'status' => $liveStatus ?: $template->status,
                    'remote_status' => $liveStatus ?: $template->remote_status,
                    'last_synced_at' => now(),
                    'last_meta_sync_at' => now(),
                    'last_meta_error' => $rejectionReason,
                    'meta_rejection_reason' => $rejectionReason,
                    'sync_state' => $this->templateLifecycleService->computeSyncState(
                        $liveStatus ?: (string) $template->status,
                        now(),
                        (bool) ($template->is_remote_deleted ?? false),
                        $rejectionReason
                    ),
                ]);

                if ($liveName !== '' && $liveName !== $localName) {
                    return redirect()->back()->withErrors([
                        'template' => 'Template mismatch detected on Meta. Please re-sync templates and try again.',
                    ]);
                }

                if ($liveLanguage !== '' && $liveLanguage !== $localLanguage) {
                    return redirect()->back()->withErrors([
                        'template' => 'Template language mismatch detected on Meta. Please re-sync templates and try again.',
                    ]);
                }

                if (!$this->templateLifecycleService->isSendableStatus($liveStatus)) {
                    return redirect()->back()->withErrors([
                        'template' => 'Template is not approved on Meta yet (current status: '.$liveStatus.').',
                    ]);
                }

                // Meta delivery resolves template by name + language.
                // Ensure currently deliverable version is exactly this local template version.
                $deliverable = $this->templateManagementService->getDeliverableTemplateByNameLanguage(
                    $template->connection,
                    (string) $template->name,
                    (string) $template->language
                );

                if ($deliverable && (string) ($deliverable['id'] ?? '') !== (string) $template->meta_template_id) {
                    return redirect()->back()->withErrors([
                        'template' => 'A different approved version of this template is currently deliverable on Meta. Wait for this new version approval, then sync templates.',
                    ]);
                }
            } catch (\Throwable $e) {
                \Log::channel('whatsapp')->warning('Template live status verification failed before send', [
                    'template_id' => $template->id,
                    'meta_template_id' => $template->meta_template_id,
                    'error' => $e->getMessage(),
                ]);
                // Fail open: sending can still succeed because delivery is resolved by name/language.
                // Meta API response handling below will mark failed sends explicitly when invalid.
            }
        }

        if (!$request->has('variables') || $request->input('variables') === null || $request->input('variables') === '') {
            $request->merge(['variables' => []]);
        }

        if (is_string($request->input('variables'))) {
            $decoded = json_decode((string) $request->input('variables'), true);
            if (json_last_error() === JSON_ERROR_NONE && is_array($decoded)) {
                $request->merge(['variables' => $decoded]);
            }
        }

        $validated = $request->validate([
            'to_wa_id' => 'required|string',
            'variables' => 'sometimes|array',
            'variables.*' => 'nullable|string|max:1024',
            'header_media_url' => 'nullable|url|max:2048',
            'client_request_id' => 'nullable|string|max:120',
        ]);

        // Validate variables count
        $requiredVars = $this->composer->extractRequiredVariables($template);
        $variables = $this->normalizeTemplateVariables($validated['variables'] ?? []);
        $clientRequestId = $this->normalizeClientRequestId($validated['client_request_id'] ?? null);

        $nonEmptyCount = count(array_filter($variables, static fn (string $value) => $value !== ''));
        if ($nonEmptyCount < $requiredVars['total']) {
            return redirect()->back()->withErrors([
                'variables' => "Template requires {$requiredVars['total']} variable(s), but only {$nonEmptyCount} non-empty value(s) were provided."]);
        }

        try {
            DB::beginTransaction();

            $this->outboundPipeline->assertSendPrerequisites($template->connection, (string) $validated['to_wa_id'], 'template');
            $this->outboundPipeline->assertRateLimits($account, $template->connection);

            $templateFingerprint = hash('sha256', implode('|', [
                'template',
                (string) $template->id,
                (string) $validated['to_wa_id'],
                json_encode($variables, JSON_UNESCAPED_UNICODE) ?: '',
            ]));
            $pipelineIdempotencyKey = $this->outboundPipeline->buildIdempotencyKey(
                (int) $account->id,
                0,
                'template',
                $clientRequestId,
                $templateFingerprint
            );
            $outboundJob = $this->outboundPipeline->begin([
                'account_id' => $account->id,
                'whatsapp_connection_id' => $template->whatsapp_connection_id,
                'message_type' => 'template',
                'to_wa_id' => $validated['to_wa_id'],
                'client_request_id' => $clientRequestId,
                'idempotency_key' => $pipelineIdempotencyKey,
                'request_payload' => [
                    'template_id' => $template->id,
                    'template_name' => $template->name,
                    'language' => $template->language,
                    'variables' => $variables,
                ],
            ]);
            if ($outboundJob) {
                $this->outboundPipeline->markValidating($outboundJob);
            }

            // Prepare payload
            $payload = $this->composer->preparePayload(
                $template,
                $validated['to_wa_id'],
                $variables,
                ['header_media_url' => $validated['header_media_url'] ?? null]
            );

            // Get or create conversation (with lock to prevent duplicates)
            $conversation = $this->getOrCreateConversation($account, $template, $validated['to_wa_id']);

            // Create outbound message record (with lock)
            $message = WhatsAppMessage::lockForUpdate()->create([
                'account_id' => $account->id,
                'whatsapp_conversation_id' => $conversation->id,
                'direction' => 'outbound',
                'type' => 'template',
                'text_body' => $this->composer->renderPreview($template, $variables)['body'],
                'payload' => $payload,
                'status' => 'queued']);

            // Create template send record
            $templateSend = WhatsAppTemplateSend::create([
                'account_id' => $account->id,
                'whatsapp_template_id' => $template->id,
                'whatsapp_message_id' => $message->id,
                'to_wa_id' => $validated['to_wa_id'],
                'variables' => $variables,
                'status' => 'queued']);

            // Load relationships for broadcast
            $message->load('conversation.contact');
            
            // Broadcast optimistic message created
            event(new MessageCreated($message));
            if ($outboundJob) {
                $outboundJob->update([
                    'whatsapp_conversation_id' => $conversation->id,
                    'whatsapp_message_id' => $message->id,
                ]);
                $this->outboundPipeline->markSending($outboundJob);
            }

            // Send via WhatsApp API
            $response = $this->whatsappClient->sendTemplateMessage(
                $template->connection,
                $validated['to_wa_id'],
                $template->name,
                $template->language,
                $payload['template']['components'] ?? []
            );

            // Update message with Meta message ID and status
            $metaMessageId = $response['messages'][0]['id'] ?? null;
            $message->update([
                'meta_message_id' => $metaMessageId,
                'status' => 'sent',
                'sent_at' => now()]);
            if ($outboundJob) {
                $this->outboundPipeline->markSentToProvider($outboundJob, $metaMessageId, $response);
            }

            // Update template send
            $templateSend->update([
                'status' => 'sent',
                'sent_at' => now()]);

            // Track usage (only on successful send)
            $this->usageService->incrementMessages($account, 1);
            $this->usageService->incrementTemplateSends($account, 1);

            // Update conversation
            $conversation->update([
                'last_message_at' => now(),
                'last_message_preview' => substr($message->text_body, 0, 100)]);

            // Broadcast message update and conversation update
            event(new MessageUpdated($message));
            event(new ConversationUpdated($conversation));

            DB::commit();

            return redirect()->route('app.whatsapp.conversations.show', [
                'conversation' => $message->whatsapp_conversation_id])->with('success', 'Template message sent successfully.');
        } catch (\Exception $e) {
            DB::rollBack();

            if (isset($message)) {
                $message->update([
                    'status' => 'failed',
                    'error_message' => $e->getMessage()]);
                // Broadcast failed status
                event(new MessageUpdated($message));
            }

            if (isset($templateSend)) {
                $templateSend->update([
                    'status' => 'failed',
                    'error_message' => $e->getMessage()]);
            }
            if (isset($outboundJob) && $outboundJob) {
                $failure = $this->outboundPipeline->classifyFailure($e);
                $this->outboundPipeline->markFailed(
                    $outboundJob,
                    $e->getMessage(),
                    $this->outboundPipeline->safeSerializeProviderError($e),
                    $failure['retryable'],
                    $failure['retry_after_seconds']
                );
            }

            return redirect()->back()->withErrors([
                'send' => 'Failed to send template: ' . $e->getMessage()]);
        }
    }

    /**
     * Get or create conversation for template send.
     */
    protected function getOrCreateConversation(
        $account,
        WhatsAppTemplate $template,
        string $toWaId
    ): WhatsAppConversation {
        // Use transaction with locks to prevent race conditions
        return DB::transaction(function () use ($account, $template, $toWaId) {
            // Get or create contact (with lock)
            $contact = WhatsAppContact::lockForUpdate()
                ->firstOrCreate(
                    [
                        'account_id' => $account->id,
                        'wa_id' => $toWaId],
                    [
                        'source' => 'template_send']
                );

            // Get or create conversation (with lock)
            return WhatsAppConversation::lockForUpdate()
                ->firstOrCreate(
                    [
                        'account_id' => $account->id,
                        'whatsapp_connection_id' => $template->whatsapp_connection_id,
                        'whatsapp_contact_id' => $contact->id],
                    [
                        'status' => 'open']
                );
        });
    }

    private function normalizeTemplateVariables(mixed $variables): array
    {
        if (!is_array($variables)) {
            return [];
        }

        return array_values(array_map(
            static fn ($value) => is_scalar($value) ? trim((string) $value) : '',
            $variables
        ));
    }

    private function normalizeClientRequestId(mixed $raw): ?string
    {
        if (!is_scalar($raw)) {
            return null;
        }

        $value = trim((string) $raw);
        if ($value === '') {
            return null;
        }

        if (!preg_match('/^[A-Za-z0-9:_\-]{8,120}$/', $value)) {
            return null;
        }

        return $value;
    }
}
