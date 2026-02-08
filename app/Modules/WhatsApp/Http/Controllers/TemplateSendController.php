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
use App\Modules\WhatsApp\Services\WhatsAppClient;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class TemplateSendController extends Controller
{
    public function __construct(
        protected TemplateComposer $composer,
        protected WhatsAppClient $whatsappClient,
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
                return [
                    'id' => $conv->id,
                    'contact' => [
                        'wa_id' => $conv->contact->wa_id,
                        'name' => $conv->contact->name ?? $conv->contact->wa_id]];
            });

        return \Inertia\Inertia::render('WhatsApp/Templates/Send', [
            'account' => $account,
            'template' => [
                'id' => $template->id,
                'slug' => $template->slug,
                'name' => $template->name,
                'language' => $template->language,
                'body_text' => $template->body_text,
                'header_text' => $template->header_text,
                'footer_text' => $template->footer_text,
                'buttons' => $template->buttons,
                'variable_count' => $template->variable_count,
                'required_variables' => $requiredVars],
            'contacts' => $contacts,
            'conversations' => $conversations]);
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

        $validated = $request->validate([
            'to_wa_id' => 'required|string',
            'variables' => 'required|array',
            'variables.*' => 'nullable|string']);

        // Validate variables count
        $requiredVars = $this->composer->extractRequiredVariables($template);
        if (count($validated['variables']) < $requiredVars['total']) {
            return redirect()->back()->withErrors([
                'variables' => "Template requires {$requiredVars['total']} variables"]);
        }

        // Check limits before sending
        $this->entitlementService->assertWithinLimit($account, 'messages_monthly', 1);
        $this->entitlementService->assertWithinLimit($account, 'template_sends_monthly', 1);

        try {
            DB::beginTransaction();

            // Prepare payload
            $payload = $this->composer->preparePayload(
                $template,
                $validated['to_wa_id'],
                $validated['variables']
            );

            // Get or create conversation (with lock to prevent duplicates)
            $conversation = $this->getOrCreateConversation($account, $template, $validated['to_wa_id']);

            // Create outbound message record (with lock)
            $message = WhatsAppMessage::lockForUpdate()->create([
                'account_id' => $account->id,
                'whatsapp_conversation_id' => $conversation->id,
                'direction' => 'outbound',
                'type' => 'template',
                'text_body' => $this->composer->renderPreview($template, $validated['variables'])['body'],
                'payload' => $payload,
                'status' => 'queued']);

            // Create template send record
            $templateSend = WhatsAppTemplateSend::create([
                'account_id' => $account->id,
                'whatsapp_template_id' => $template->id,
                'whatsapp_message_id' => $message->id,
                'to_wa_id' => $validated['to_wa_id'],
                'variables' => $validated['variables'],
                'status' => 'queued']);

            // Load relationships for broadcast
            $message->load('conversation.contact');
            
            // Broadcast optimistic message created
            event(new MessageCreated($message));

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
}
