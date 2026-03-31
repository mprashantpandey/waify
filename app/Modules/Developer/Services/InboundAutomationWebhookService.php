<?php

namespace App\Modules\Developer\Services;

use App\Models\InboundAutomationWebhook;
use App\Models\InboundAutomationWebhookLog;
use App\Modules\Broadcasts\Models\CampaignSequence;
use App\Modules\Broadcasts\Services\SequenceService;
use App\Modules\WhatsApp\Events\Inbox\ConversationUpdated;
use App\Modules\WhatsApp\Events\Inbox\MessageCreated;
use App\Modules\WhatsApp\Events\Inbox\MessageUpdated;
use App\Modules\WhatsApp\Models\WhatsAppContact;
use App\Modules\WhatsApp\Models\WhatsAppConversation;
use App\Modules\WhatsApp\Models\WhatsAppMessage;
use App\Modules\WhatsApp\Models\WhatsAppTemplate;
use App\Modules\WhatsApp\Models\WhatsAppTemplateSend;
use App\Modules\WhatsApp\Services\OutboundMessagePipelineService;
use App\Modules\WhatsApp\Services\TemplateComposer;
use App\Modules\WhatsApp\Services\WhatsAppClient;
use App\Core\Billing\UsageService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class InboundAutomationWebhookService
{
    public const ACTION_TYPES = [
        'start_sequence',
        'send_template',
    ];

    public function __construct(
        protected SequenceService $sequenceService,
        protected TemplateComposer $templateComposer,
        protected WhatsAppClient $whatsappClient,
        protected OutboundMessagePipelineService $outboundPipeline,
        protected UsageService $usageService,
    ) {
    }

    public function verifySecret(InboundAutomationWebhook $webhook, Request $request): bool
    {
        $headerSecret = trim((string) $request->header('X-Zyptos-Secret', ''));
        if ($headerSecret !== '' && hash_equals($webhook->signing_secret, $headerSecret)) {
            return true;
        }

        $signature = trim((string) $request->header('X-Zyptos-Signature', ''));
        if ($signature === '') {
            return false;
        }

        $rawBody = (string) $request->getContent();
        $expected = hash_hmac('sha256', $rawBody, $webhook->signing_secret);
        $normalized = str_starts_with($signature, 'sha256=') ? substr($signature, 7) : $signature;

        return hash_equals($expected, $normalized);
    }

    public function resolveIdempotencyKey(InboundAutomationWebhook $webhook, array $payload, Request $request): string
    {
        $headerKey = trim((string) $request->header('X-Idempotency-Key', ''));
        if ($headerKey !== '') {
            return mb_substr($headerKey, 0, 191);
        }

        $path = trim((string) data_get($webhook->payload_mappings, 'idempotency_path', ''));
        if ($path !== '') {
            $value = data_get($payload, $path);
            if (is_scalar($value) && trim((string) $value) !== '') {
                return mb_substr((string) $value, 0, 191);
            }
        }

        foreach (['event_id', 'id', 'request_id'] as $candidate) {
            $value = data_get($payload, $candidate);
            if (is_scalar($value) && trim((string) $value) !== '') {
                return mb_substr((string) $value, 0, 191);
            }
        }

        return 'body:' . hash('sha256', json_encode($payload));
    }

    public function logDuplicate(InboundAutomationWebhook $webhook, string $idempotencyKey, array $payload, Request $request): InboundAutomationWebhookLog
    {
        return InboundAutomationWebhookLog::query()->create([
            'account_id' => $webhook->account_id,
            'inbound_automation_webhook_id' => $webhook->id,
            'request_id' => (string) Str::uuid(),
            'idempotency_key' => null,
            'status' => 'duplicate',
            'payload' => $payload,
            'headers' => $this->extractHeaders($request),
            'response_summary' => 'Duplicate webhook request ignored.',
            'result' => ['idempotency_key' => $idempotencyKey],
            'processed_at' => now(),
        ]);
    }

    public function handle(InboundAutomationWebhook $webhook, array $payload, Request $request, string $idempotencyKey): InboundAutomationWebhookLog
    {
        $log = InboundAutomationWebhookLog::query()->create([
            'account_id' => $webhook->account_id,
            'inbound_automation_webhook_id' => $webhook->id,
            'request_id' => (string) Str::uuid(),
            'idempotency_key' => $idempotencyKey,
            'status' => 'received',
            'payload' => $payload,
            'headers' => $this->extractHeaders($request),
        ]);

        $webhook->forceFill([
            'last_received_at' => now(),
            'last_error' => null,
        ])->save();

        try {
            $contact = $this->resolveContact($webhook, $payload);
            $result = match ($webhook->action_type) {
                'send_template' => $this->sendTemplate($webhook, $contact, $payload),
                default => $this->startSequence($webhook, $contact),
            };

            $log->forceFill([
                'status' => 'processed',
                'response_summary' => 'Automation executed successfully.',
                'result' => $result,
                'processed_at' => now(),
            ])->save();

            $webhook->forceFill([
                'last_triggered_at' => now(),
                'last_error' => null,
            ])->save();
        } catch (\Throwable $e) {
            $log->forceFill([
                'status' => 'failed',
                'response_summary' => mb_substr($e->getMessage(), 0, 255),
                'result' => [
                    'exception' => class_basename($e),
                ],
                'processed_at' => now(),
            ])->save();

            $webhook->forceFill([
                'last_error' => mb_substr($e->getMessage(), 0, 1000),
            ])->save();

            throw $e;
        }

        return $log->fresh();
    }

    protected function resolveContact(InboundAutomationWebhook $webhook, array $payload): WhatsAppContact
    {
        $phonePath = trim((string) data_get($webhook->payload_mappings, 'phone_path', 'phone'));
        $waId = $this->normalizeWaId((string) data_get($payload, $phonePath, ''));

        if ($waId === '') {
            throw new \RuntimeException('Webhook payload did not include a valid phone number.');
        }

        $name = trim((string) data_get($payload, data_get($webhook->payload_mappings, 'name_path', 'name'), ''));
        $email = trim((string) data_get($payload, data_get($webhook->payload_mappings, 'email_path', 'email'), ''));
        $company = trim((string) data_get($payload, data_get($webhook->payload_mappings, 'company_path', 'company'), ''));

        $contact = WhatsAppContact::query()->firstOrCreate(
            [
                'account_id' => $webhook->account_id,
                'wa_id' => $waId,
            ],
            [
                'name' => $name !== '' ? $name : $waId,
                'phone' => '+' . $waId,
                'email' => $email !== '' ? $email : null,
                'company' => $company !== '' ? $company : null,
                'source' => 'inbound_webhook',
            ]
        );

        $updates = [];
        if ($name !== '' && $contact->name !== $name) {
            $updates['name'] = $name;
        }
        if ($email !== '' && $contact->email !== $email) {
            $updates['email'] = $email;
        }
        if ($company !== '' && $contact->company !== $company) {
            $updates['company'] = $company;
        }

        $customFieldPaths = (array) data_get($webhook->payload_mappings, 'custom_field_paths', []);
        if ($customFieldPaths !== []) {
            $customFields = $contact->custom_fields ?? [];
            foreach ($customFieldPaths as $fieldKey => $path) {
                $path = trim((string) $path);
                if ($fieldKey === '' || $path === '') {
                    continue;
                }

                $value = data_get($payload, $path);
                if ($value !== null && $value !== '') {
                    $customFields[$fieldKey] = $value;
                }
            }
            $updates['custom_fields'] = $customFields;
        }

        if ($updates !== []) {
            $contact->update($updates);
        }

        return $contact->fresh();
    }

    protected function startSequence(InboundAutomationWebhook $webhook, WhatsAppContact $contact): array
    {
        /** @var CampaignSequence|null $sequence */
        $sequence = $webhook->sequence;
        if (!$sequence) {
            throw new \RuntimeException('Webhook sequence is no longer available.');
        }

        $enrollment = $this->sequenceService->triggerForContact($sequence, $contact);

        return [
            'action' => 'start_sequence',
            'sequence_id' => $sequence->id,
            'sequence_name' => $sequence->name,
            'enrollment_id' => $enrollment->id,
            'contact_id' => $contact->id,
            'wa_id' => $contact->wa_id,
        ];
    }

    protected function sendTemplate(InboundAutomationWebhook $webhook, WhatsAppContact $contact, array $payload): array
    {
        $template = $webhook->template;
        $connection = $webhook->connection;

        if (!$template || !$connection) {
            throw new \RuntimeException('Webhook template action is not configured correctly.');
        }

        $conversation = WhatsAppConversation::query()->firstOrCreate(
            [
                'account_id' => $webhook->account_id,
                'whatsapp_connection_id' => $connection->id,
                'whatsapp_contact_id' => $contact->id,
            ],
            [
                'status' => 'open',
                'last_message_preview' => null,
            ]
        );

        $variables = $this->resolveTemplateVariables($webhook, $payload);
        $this->outboundPipeline->assertSendPrerequisites($connection, (string) $contact->wa_id, 'template');

        DB::beginTransaction();

        try {
            $prepared = $this->templateComposer->preparePayload($template, (string) $contact->wa_id, $variables);
            $preview = $this->templateComposer->renderPreview($template, $variables);

            $message = WhatsAppMessage::create([
                'account_id' => $webhook->account_id,
                'whatsapp_conversation_id' => $conversation->id,
                'direction' => 'outbound',
                'type' => 'template',
                'text_body' => $preview['body'],
                'payload' => array_merge($prepared, [
                    'source' => 'inbound_automation_webhook',
                    'inbound_automation_webhook_id' => $webhook->id,
                ]),
                'status' => 'queued',
            ]);

            $templateSend = WhatsAppTemplateSend::create([
                'account_id' => $webhook->account_id,
                'whatsapp_template_id' => $template->id,
                'whatsapp_message_id' => $message->id,
                'to_wa_id' => $contact->wa_id,
                'variables' => $variables,
                'status' => 'queued',
            ]);

            event(new MessageCreated($message));

            $response = $this->whatsappClient->sendTemplateMessage(
                $connection,
                (string) $contact->wa_id,
                (string) $template->name,
                (string) $template->language,
                $prepared['template']['components'] ?? []
            );

            $metaMessageId = data_get($response, 'messages.0.id');

            $message->update([
                'meta_message_id' => $metaMessageId,
                'status' => 'sent',
                'sent_at' => now(),
            ]);
            $templateSend->update([
                'status' => 'sent',
                'sent_at' => now(),
            ]);
            $conversation->update([
                'last_message_at' => now(),
                'last_message_preview' => mb_substr((string) $message->text_body, 0, 100),
            ]);

            $this->usageService->incrementMessages($webhook->account, 1);
            $this->usageService->incrementTemplateSends($webhook->account, 1);

            DB::commit();

            event(new MessageUpdated($message));
            event(new ConversationUpdated($conversation));

            return [
                'action' => 'send_template',
                'template_id' => $template->id,
                'template_name' => $template->name,
                'contact_id' => $contact->id,
                'wa_id' => $contact->wa_id,
                'conversation_id' => $conversation->id,
                'message_id' => $message->id,
                'meta_message_id' => $metaMessageId,
            ];
        } catch (\Throwable $e) {
            DB::rollBack();

            if (isset($message)) {
                $message->update([
                    'status' => 'failed',
                    'error_message' => $e->getMessage(),
                ]);
                event(new MessageUpdated($message));
            }

            if (isset($templateSend)) {
                $templateSend->update([
                    'status' => 'failed',
                    'error_message' => $e->getMessage(),
                ]);
            }

            throw $e;
        }
    }

    protected function resolveTemplateVariables(InboundAutomationWebhook $webhook, array $payload): array
    {
        $variablePaths = collect($webhook->template_variable_paths ?? [])
            ->map(fn ($path) => trim((string) $path))
            ->filter()
            ->values();

        $values = $variablePaths
            ->map(fn (string $path) => (string) data_get($payload, $path, ''))
            ->all();

        $static = collect($webhook->template_static_params ?? [])
            ->map(fn ($value) => (string) $value)
            ->values()
            ->all();

        if ($static !== []) {
            foreach ($static as $index => $value) {
                if ($value !== '') {
                    $values[$index] = $value;
                }
            }
        }

        return array_values($values);
    }

    protected function extractHeaders(Request $request): array
    {
        return [
            'user_agent' => (string) $request->userAgent(),
            'content_type' => (string) $request->header('Content-Type', ''),
            'idempotency_key' => (string) $request->header('X-Idempotency-Key', ''),
        ];
    }

    protected function normalizeWaId(string $value): string
    {
        return preg_replace('/\D+/', '', $value) ?? '';
    }
}
