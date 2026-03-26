<?php

namespace App\Services\AI;

use App\Core\Billing\EntitlementService;
use App\Core\Billing\UsageService;
use App\Models\Account;
use App\Models\PlatformSetting;
use App\Modules\Chatbots\Models\Bot;
use App\Modules\WhatsApp\Events\Inbox\AuditEventAdded;
use App\Modules\WhatsApp\Events\Inbox\ConversationUpdated;
use App\Modules\WhatsApp\Events\Inbox\MessageCreated;
use App\Modules\WhatsApp\Events\Inbox\MessageUpdated;
use App\Modules\WhatsApp\Models\WhatsAppConversation;
use App\Modules\WhatsApp\Models\WhatsAppConversationAuditEvent;
use App\Modules\WhatsApp\Models\WhatsAppMessage;
use App\Modules\WhatsApp\Services\ConversationAutomationService;
use App\Modules\WhatsApp\Services\CustomerCareWindowService;
use App\Modules\WhatsApp\Services\WhatsAppClient;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;

class AiAutoReplyService
{
    public function __construct(
        protected ConversationAssistantService $conversationAssistant,
        protected AiKnowledgeBaseService $knowledgeBase,
        protected WhatsAppClient $whatsappClient,
        protected ConversationAutomationService $conversationAutomationService,
        protected CustomerCareWindowService $customerCareWindowService,
        protected EntitlementService $entitlementService,
        protected UsageService $usageService,
    ) {
    }

    public function processInboundMessage(WhatsAppMessage $message): void
    {
        $lock = Cache::lock('ai:auto-reply:message:' . $message->id, 60);
        if (!$lock->get()) {
            return;
        }

        try {
            $message->loadMissing(['conversation.connection', 'conversation.contact', 'conversation.account']);
            $conversation = $message->conversation;
            $account = $conversation?->account;

            if (!$conversation || !$account) {
                return;
            }

            $eligibility = $this->checkEligibility($account, $conversation, $message);
            if (!$eligibility['allowed']) {
                $this->recordAudit($conversation, 'ai_auto_reply_skipped', $eligibility['reason'], [
                    'message_id' => $message->id,
                    'reason_code' => $eligibility['reason_code'],
                ]);
                return;
            }

            $this->entitlementService->assertWithinLimit($account, 'ai_credits_monthly', 1);

            $reply = $this->buildReply($account, $conversation, $message);
            if ($reply === '') {
                return;
            }

            $outbound = WhatsAppMessage::create([
                'account_id' => $account->id,
                'whatsapp_conversation_id' => $conversation->id,
                'direction' => 'outbound',
                'type' => 'text',
                'text_body' => $reply,
                'status' => 'queued',
                'payload' => ['source' => 'ai_auto_reply'],
            ]);

            event(new MessageCreated($outbound));

            $response = $this->whatsappClient->sendTextMessage(
                $conversation->connection,
                (string) $conversation->contact->wa_id,
                $reply
            );

            $metaMessageId = $response['messages'][0]['id'] ?? null;
            $outbound->update([
                'meta_message_id' => $metaMessageId,
                'status' => 'sent',
                'sent_at' => now(),
                'payload' => array_merge($outbound->payload ?? [], $response, ['source' => 'ai_auto_reply']),
            ]);

            $conversation->update([
                'last_message_at' => now(),
                'last_message_preview' => mb_substr($reply, 0, 100),
            ]);

            $this->usageService->incrementAiCredits($account, 1);
            $this->usageService->incrementMessages($account, 1);

            $this->recordAudit($conversation, 'ai_auto_reply_sent', 'AI sent an automatic reply.', [
                'message_id' => $outbound->id,
                'meta_message_id' => $metaMessageId,
            ]);
            $this->conversationAutomationService->markAiActive($conversation);

            event(new MessageUpdated($outbound));
            event(new ConversationUpdated($conversation));
        } catch (\Throwable $e) {
            Log::warning('AI auto reply failed', [
                'message_id' => $message->id,
                'error' => $e->getMessage(),
            ]);

            if ($message->relationLoaded('conversation') && $message->conversation) {
                $this->recordAudit($message->conversation, 'ai_auto_reply_failed', 'AI auto reply could not be sent.', [
                    'message_id' => $message->id,
                    'error' => $e->getMessage(),
                ]);
            }
        } finally {
            $lock->release();
        }
    }

    public function checkEligibility(Account $account, WhatsAppConversation $conversation, WhatsAppMessage $message): array
    {
        if (!module_enabled($account, 'ai')) {
            return $this->deny('AI module is not enabled for this account.', 'module_disabled');
        }

        if (!$this->platformAiEnabled()) {
            return $this->deny('AI is disabled in platform settings.', 'platform_disabled');
        }

        if (!(bool) $account->ai_auto_reply_enabled) {
            return $this->deny('Auto reply is turned off.', 'auto_reply_disabled');
        }

        if (($account->ai_auto_reply_mode ?? 'suggest_only') !== 'auto_reply_window') {
            return $this->deny('Auto reply mode is not enabled.', 'mode_not_auto');
        }

        if ($message->direction !== 'inbound') {
            return $this->deny('Only inbound messages qualify.', 'not_inbound');
        }

        if (($message->type ?? 'text') !== 'text' || trim((string) $message->text_body) === '') {
            return $this->deny('Only text messages are auto replied.', 'unsupported_message_type');
        }

        if ((bool) $account->ai_auto_reply_stop_when_assigned && !empty($conversation->assigned_to)) {
            return $this->deny('Conversation is assigned to a teammate.', 'assigned_to_human');
        }

        $window = $this->customerCareWindowService->forConversation($conversation);
        if (!($window['is_open'] ?? false)) {
            return $this->deny('24-hour reply window is closed.', 'window_closed');
        }

        if ($this->hasMatchingHandoffKeyword($account, (string) $message->text_body)) {
            return $this->deny('Message matched a handoff keyword.', 'handoff_keyword');
        }

        $activeBotExists = Bot::query()
            ->where('account_id', $account->id)
            ->where('status', 'active')
            ->get()
            ->contains(fn (Bot $bot) => $bot->appliesToConnection((int) $conversation->whatsapp_connection_id));

        if ($activeBotExists) {
            return $this->deny('Active chatbot already handles this connection.', 'chatbot_active');
        }

        return ['allowed' => true];
    }

    protected function buildReply(Account $account, WhatsAppConversation $conversation, WhatsAppMessage $message): string
    {
        $handoffMessage = trim((string) ($account->ai_auto_reply_handoff_message ?: 'A team member will review this and get back to you shortly.'));
        $knowledgeContext = $this->knowledgeBase->promptContext($account, (string) $message->text_body);
        $systemPrompt = trim((string) ($account->ai_auto_reply_prompt ?: 'Reply as the business in a short, clear, helpful WhatsApp message.'));
        $systemPrompt .= "\n\nRules:\n- Output only the reply text.\n- Stay concise.\n- If the answer is not supported by the knowledge base, reply exactly with: __HANDOFF__.\n- Do not invent pricing, policies, or promises.\n- Do not mention AI.";

        if ($knowledgeContext !== '') {
            $systemPrompt .= "\n\nApproved knowledge base:\n{$knowledgeContext}";
        }

        $reply = trim($this->conversationAssistant->suggestReply(
            $conversation,
            20,
            null,
            $systemPrompt,
            'Suggest one short automatic business reply for the latest customer message. If the knowledge base does not clearly answer it, return __HANDOFF__.',
        ));

        if ($reply === '' || $reply === '__HANDOFF__') {
            return $handoffMessage;
        }

        return $this->sanitizeReply($reply, $handoffMessage);
    }

    protected function sanitizeReply(string $reply, string $fallback): string
    {
        $reply = preg_replace('/\s+/', ' ', trim($reply)) ?? '';
        $reply = trim($reply, "\"' \n\r\t");
        $reply = mb_substr($reply, 0, 1024);

        return $reply !== '' ? $reply : $fallback;
    }

    protected function hasMatchingHandoffKeyword(Account $account, string $message): bool
    {
        $keywords = collect(is_array($account->ai_auto_reply_handoff_keywords) ? $account->ai_auto_reply_handoff_keywords : [])
            ->map(fn ($keyword) => trim(mb_strtolower((string) $keyword)))
            ->filter();

        if ($keywords->isEmpty()) {
            return false;
        }

        $haystack = mb_strtolower($message);
        foreach ($keywords as $keyword) {
            if ($keyword !== '' && str_contains($haystack, $keyword)) {
                return true;
            }
        }

        return false;
    }

    protected function platformAiEnabled(): bool
    {
        $value = PlatformSetting::get('ai.enabled', false);
        if (is_bool($value)) {
            return $value;
        }
        if (is_numeric($value)) {
            return (int) $value === 1;
        }

        return in_array(strtolower(trim((string) $value)), ['1', 'true', 'yes', 'on'], true);
    }

    protected function deny(string $reason, string $reasonCode): array
    {
        return [
            'allowed' => false,
            'reason' => $reason,
            'reason_code' => $reasonCode,
        ];
    }

    protected function recordAudit(WhatsAppConversation $conversation, string $eventType, string $description, array $meta = []): void
    {
        $event = WhatsAppConversationAuditEvent::create([
            'account_id' => $conversation->account_id,
            'whatsapp_conversation_id' => $conversation->id,
            'actor_id' => null,
            'event_type' => $eventType,
            'description' => $description,
            'meta' => $meta,
        ]);

        event(new AuditEventAdded($conversation, [
            'id' => $event->id,
            'event_type' => $event->event_type,
            'description' => $event->description,
            'meta' => $event->meta,
            'created_at' => $event->created_at?->toIso8601String(),
            'actor' => null,
        ]));
    }
}
