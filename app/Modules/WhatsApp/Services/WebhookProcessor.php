<?php

namespace App\Modules\WhatsApp\Services;

use App\Modules\WhatsApp\Events\Inbox\ConversationUpdated;
use App\Modules\WhatsApp\Events\Inbox\AuditEventAdded;
use App\Modules\WhatsApp\Events\Inbox\MessageCreated;
use App\Modules\WhatsApp\Models\WhatsAppConnection;
use App\Modules\WhatsApp\Models\WhatsAppContact;
use App\Modules\WhatsApp\Models\WhatsAppConversation;
use App\Modules\WhatsApp\Models\WhatsAppConversationAuditEvent;
use App\Modules\WhatsApp\Models\WhatsAppMessage;
use App\Modules\WhatsApp\Models\WhatsAppMessageBilling;
use App\Modules\WhatsApp\Models\WhatsAppTemplate;
use App\Modules\WhatsApp\Models\WhatsAppTemplateSend;
use App\Models\Account;
use App\Core\Billing\MetaPricingResolver;
use App\Core\Billing\UsageService;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Schema;

class WebhookProcessor
{
    public function __construct(
        protected UsageService $usageService,
        protected MetaPricingResolver $metaPricingResolver
    ) {
    }

    /**
     * Process incoming webhook payload.
     * Uses lock to prevent concurrent processing of the same webhook.
     */
    public function process(array $payload, WhatsAppConnection $connection, ?string $correlationId = null): void
    {
        // Use lock to prevent concurrent webhook processing for the same connection
        $lockKey = "webhook_process:connection:{$connection->id}";
        $lock = Cache::lock($lockKey, 60); // 1 minute lock

        if (!$lock->get()) {
            Log::channel('whatsapp')->warning('Webhook processing already in progress', [
                'connection_id' => $connection->id,
                'correlation_id' => $correlationId]);
            // Don't throw, just skip to prevent webhook retries
            return;
        }

        try {
            $this->performProcess($payload, $connection, $correlationId);
        } finally {
            $lock->release();
        }
    }

    /**
     * Perform the actual webhook processing.
     */
    protected function performProcess(array $payload, WhatsAppConnection $connection, ?string $correlationId = null): void
    {
        try {
            DB::beginTransaction();

            $entries = $payload['entry'] ?? [];
            if (empty($entries)) {
                throw new \Exception('Invalid webhook payload: missing entry');
            }

            $messagesProcessed = 0;
            $statusesProcessed = 0;

            foreach ($entries as $entryIndex => $entry) {
                $changes = $entry['changes'] ?? [];
                foreach ($changes as $changeIndex => $change) {
                    $value = $change['value'] ?? [];
                    $messages = $value['messages'] ?? [];
                    $statuses = $value['statuses'] ?? [];
                    $field = $change['field'] ?? null;

                    // If payload has phone_number_id, it must match this connection (when one URL is used for multiple numbers)
                    $payloadPhoneNumberId = $value['metadata']['phone_number_id'] ?? null;
                    if ($payloadPhoneNumberId !== null && $connection->phone_number_id !== null && $payloadPhoneNumberId !== $connection->phone_number_id) {
                        Log::channel('whatsapp')->info('Webhook change skipped: phone_number_id does not match connection', [
                            'correlation_id' => $correlationId,
                            'connection_id' => $connection->id,
                            'payload_phone_number_id' => $payloadPhoneNumberId,
                            'connection_phone_number_id' => $connection->phone_number_id,
                        ]);
                        continue;
                    }

                    Log::channel('whatsapp')->info('Webhook processing change', [
                        'correlation_id' => $correlationId,
                        'connection_id' => $connection->id,
                        'entry_index' => $entryIndex,
                        'change_index' => $changeIndex,
                        'field' => $field,
                        'messages_count' => count($messages),
                        'statuses_count' => count($statuses),
                    ]);

                    foreach ($messages as $messageData) {
                        $this->processMessage($messageData, $value, $connection, $correlationId);
                        $messagesProcessed++;
                    }

                    foreach ($statuses as $statusData) {
                        $this->processStatus($statusData, $connection);
                        $statusesProcessed++;
                    }

                    if (empty($messages) && empty($statuses)) {
                        $this->processTemplateLifecycleChange($field, $value, $connection);
                    }
                }
            }

            // Update connection webhook status
            $connection->update([
                'webhook_last_received_at' => now(),
                'webhook_last_error' => null]);

            DB::commit();

            Log::channel('whatsapp')->info('Webhook processed successfully', [
                'correlation_id' => $correlationId,
                'connection_id' => $connection->id,
                'messages_count' => $messagesProcessed,
                'statuses_count' => $statusesProcessed]);
        } catch (\Exception $e) {
            DB::rollBack();

            // Truncate error message to prevent huge logs
            $errorMessage = substr($e->getMessage(), 0, 500);

            Log::channel('whatsapp')->error('Webhook processing failed', [
                'correlation_id' => $correlationId,
                'connection_id' => $connection->id,
                'error' => $errorMessage,
                'payload_size' => strlen(json_encode($payload))]);

            $connection->update([
                'webhook_last_error' => $errorMessage]);

            throw $e;
        }
    }

    /**
     * Process a single message from webhook.
     */
    protected function processMessage(array $messageData, array $value, WhatsAppConnection $connection, ?string $correlationId = null): void
    {
        $metaMessageId = $messageData['id'] ?? null;
        if (!$metaMessageId) {
            return;
        }

        // Check if message already exists (idempotency) - use lock to prevent race conditions
        $messageLockKey = "webhook_message:{$metaMessageId}";
        $messageLock = Cache::lock($messageLockKey, 30);

        if (!$messageLock->get()) {
            // Another process is handling this message
            return;
        }

        try {
            $existingMessage = WhatsAppMessage::where('account_id', $connection->account_id)
                ->where('meta_message_id', $metaMessageId)
                ->lockForUpdate() // Row-level lock
                ->first();

            if ($existingMessage) {
                // Message already processed, skip
                return;
            }

            $fromWaId = $messageData['from'] ?? null;
            if (!$fromWaId) {
                return;
            }

            $contactName = isset($value['contacts'][0]['profile']['name'])
                ? $value['contacts'][0]['profile']['name']
                : null;

            // Get or create contact with lock to prevent conflicts with ContactService
            $contact = DB::transaction(function () use ($connection, $fromWaId, $contactName) {
                return WhatsAppContact::lockForUpdate()
                    ->firstOrCreate(
                        [
                            'account_id' => $connection->account_id,
                            'wa_id' => $fromWaId],
                        [
                            'name' => $contactName,
                            'source' => 'webhook']
                    );
            });

            // Update contact name if provided (with lock)
            if ($contactName !== null) {
                $contact->lockForUpdate();
                $contact->update(['name' => $contactName]);
            }

            // Get or create conversation
            $conversation = WhatsAppConversation::lockForUpdate()
                ->firstOrCreate(
                    [
                        'account_id' => $connection->account_id,
                        'whatsapp_connection_id' => $connection->id,
                        'whatsapp_contact_id' => $contact->id],
                    [
                        'status' => 'open']
                );

            // Extract message type and text
            $messageType = $messageData['type'] ?? 'text';
            $textBody = null;

            if ($messageType === 'text') {
                $textBody = $messageData['text']['body'] ?? null;
            } elseif ($messageType === 'interactive') {
                $textBody = $messageData['interactive']['button_reply']['title'] ??
                           $messageData['interactive']['list_reply']['title'] ??
                           null;
            }

            // Create message
            $message = WhatsAppMessage::create([
                'account_id' => $connection->account_id,
                'whatsapp_conversation_id' => $conversation->id,
                'direction' => 'inbound',
                'meta_message_id' => $metaMessageId,
                'type' => $messageType,
                'text_body' => $textBody,
                'payload' => $messageData,
                'status' => 'delivered', // Inbound messages are considered delivered
                'received_at' => now()]);

            Log::channel('whatsapp')->info('Inbound message created', [
                'correlation_id' => $correlationId,
                'connection_id' => $connection->id,
                'message_id' => $message->id,
                'conversation_id' => $conversation->id,
                'meta_message_id' => $metaMessageId,
                'from' => $fromWaId,
                'type' => $messageType,
            ]);

            // Update conversation
            $conversation->update([
                'last_message_at' => now(),
                'last_message_preview' => $textBody ? substr($textBody, 0, 100) : "[{$messageType}]"]);

            // Update contact stats for inbound message
            $contact->increment('message_count');
            $contact->forceFill([
                'last_seen_at' => now(),
            ])->save();

            // Auto-assign if enabled and conversation is unassigned
            $this->autoAssignConversation($conversation, $connection);

            // Load relationships for broadcast
            $message->load('conversation.contact');
            $conversation->load('contact');

            // Broadcast events
            event(new MessageCreated($message));
            event(new ConversationUpdated($conversation));

            // Process bots for inbound messages (queued to prevent webhook timeout)
            $account = $conversation->account ?? $connection->account ?? Account::find($connection->account_id);
            if (!$account) {
                Log::channel('whatsapp')->warning('Skipping bot dispatch: account not resolved', [
                    'correlation_id' => $correlationId,
                    'connection_id' => $connection->id,
                    'connection_account_id' => $connection->account_id,
                    'conversation_id' => $conversation->id,
                    'message_id' => $message->id,
                ]);
                return;
            }

            $chatbotsEnabled = $message->direction === 'inbound' && module_enabled($account, 'automation.chatbots');
            Log::channel('chatbots')->debug('Inbound message bot dispatch check', [
                'correlation_id' => $correlationId,
                'account_id' => $account->id,
                'connection_id' => $connection->id,
                'conversation_id' => $conversation->id,
                'message_id' => $message->id,
                'meta_message_id' => $metaMessageId,
                'enabled' => $chatbotsEnabled,
            ]);

            if ($chatbotsEnabled) {
                // Dispatch on default queue by default so it works on hosts that only
                // run a single queue worker. If you want isolation, configure your
                // worker to listen to multiple queues and reintroduce onQueue().
                \App\Modules\Chatbots\Jobs\ProcessInboundMessageForBots::dispatch($message->id, $conversation->id);
            }
        } finally {
            $messageLock->release();
        }
    }

    /**
     * Process a single status update from webhook.
     * Handles status updates for both regular messages and campaign messages.
     */
    protected function processStatus(array $statusData, WhatsAppConnection $connection): void
    {
        $metaMessageId = $statusData['id'] ?? null;
        if (!$metaMessageId) {
            return;
        }

        // Use lock to prevent concurrent status updates
        $statusLockKey = "webhook_status:{$metaMessageId}";
        $statusLock = Cache::lock($statusLockKey, 30);

        if (!$statusLock->get()) {
            return;
        }

        try {
            // Check both regular messages and campaign messages
            $message = WhatsAppMessage::where('account_id', $connection->account_id)
                ->where('meta_message_id', $metaMessageId)
                ->lockForUpdate()
                ->first();

            // Also check campaign messages
            $campaignMessage = null;
            if (!$message) {
                $campaignMessage = \App\Modules\Broadcasts\Models\CampaignMessage::where('wamid', $metaMessageId)
                    ->lockForUpdate()
                    ->first();
            }

            if (!$message && !$campaignMessage) {
                return;
            }

            $status = $statusData['status'] ?? null;
            $timestamp = isset($statusData['timestamp']) ? (int) $statusData['timestamp'] : null;
            $statusAt = $timestamp ? now()->setTimestamp($timestamp) : now();

            if ($message) {
                // Update regular message
                $updates = [
                    'status' => $status ?: $message->status];

                if ($status === 'sent') {
                    $updates['sent_at'] = $statusAt;
                } elseif ($status === 'delivered') {
                    $updates['delivered_at'] = $statusAt;
                } elseif ($status === 'read') {
                    $updates['read_at'] = $statusAt;
                } elseif ($status === 'failed') {
                    $errors = $statusData['errors'][0] ?? null;
                    $updates['error_message'] = $errors['title'] ?? $errors['message'] ?? 'Delivery failed';
                }

                $message->update($updates);
                $message->refresh();
                $this->syncTemplateSendStatusFromMessage($message, $statusData, $statusAt);

                event(new \App\Modules\WhatsApp\Events\Inbox\MessageUpdated($message));
            } elseif ($campaignMessage) {
                // Update campaign message via service to maintain consistency
                $campaignService = app(\App\Modules\Broadcasts\Services\CampaignService::class);
                $campaignService->updateMessageStatus($metaMessageId, $status, $statusAt);
            }

            $this->recordMetaBillingUsage(
                statusData: $statusData,
                connection: $connection,
                message: $message,
                campaignMessage: $campaignMessage,
                metaMessageId: $metaMessageId,
            );
        } finally {
            $statusLock->release();
        }
    }

    protected function syncTemplateSendStatusFromMessage(WhatsAppMessage $message, array $statusData, \Carbon\Carbon $statusAt): void
    {
        if ($message->type !== 'template') {
            return;
        }

        $status = strtolower((string) ($statusData['status'] ?? ''));
        if ($status === '') {
            return;
        }

        $templateSend = WhatsAppTemplateSend::where('whatsapp_message_id', $message->id)
            ->lockForUpdate()
            ->first();

        if (!$templateSend) {
            return;
        }

        $updates = ['status' => $status];
        if (in_array($status, ['sent', 'delivered', 'read'], true) && !$templateSend->sent_at) {
            $updates['sent_at'] = $statusAt;
        }

        if ($status === 'failed') {
            $errors = $statusData['errors'][0] ?? null;
            $updates['error_message'] = $errors['title'] ?? $errors['message'] ?? 'Delivery failed';
        } elseif ($templateSend->error_message !== null) {
            $updates['error_message'] = null;
        }

        $templateSend->update($updates);
    }

    protected function recordMetaBillingUsage(
        array $statusData,
        WhatsAppConnection $connection,
        ?WhatsAppMessage $message,
        $campaignMessage,
        string $metaMessageId
    ): void {
        $pricing = is_array($statusData['pricing'] ?? null) ? $statusData['pricing'] : [];
        $conversation = is_array($statusData['conversation'] ?? null) ? $statusData['conversation'] : [];

        $hasBillingHints = !empty($pricing) || !empty($conversation);
        if (!$hasBillingHints) {
            return;
        }

        $billable = $this->toBoolean($pricing['billable'] ?? false);
        $category = strtolower((string) ($pricing['category'] ?? $conversation['category'] ?? ''));
        $pricingModel = (string) ($pricing['pricing_model'] ?? '');
        $account = $connection->account ?: Account::find($connection->account_id);
        $pricingQuote = $this->metaPricingResolver->estimateCostMinor(
            billable: $billable,
            category: $category,
            at: now(),
            countryCode: $account?->billing_country_code ?? null
        );
        $estimatedCostMinor = (int) ($pricingQuote['estimated_cost_minor'] ?? 0);

        $billing = WhatsAppMessageBilling::firstOrCreate(
            [
                'account_id' => $connection->account_id,
                'meta_message_id' => $metaMessageId,
            ],
            [
                'whatsapp_message_id' => $message?->id,
                'campaign_message_id' => $campaignMessage?->id,
                'billable' => $billable,
                'category' => $category ?: null,
                'pricing_model' => $pricingModel ?: null,
                'meta_pricing_version_id' => $pricingQuote['version_id'] ?? null,
                'pricing_country_code' => $pricingQuote['country_code'] ?? null,
                'pricing_currency' => $pricingQuote['currency'] ?? null,
                'rate_minor' => $pricingQuote['rate_minor'] ?? 0,
                'estimated_cost_minor' => $estimatedCostMinor,
                'meta' => [
                    'pricing' => $pricing,
                    'conversation' => $conversation,
                    'status' => $statusData['status'] ?? null,
                    'pricing_resolver' => [
                        'source' => $pricingQuote['source'] ?? null,
                        'version_label' => $pricingQuote['version_label'] ?? null,
                    ],
                ],
                'counted_at' => now(),
            ]
        );

        if (!$billing->wasRecentlyCreated) {
            return;
        }

        if (!$account) {
            return;
        }

        $this->usageService->incrementMetaConversationUsage(
            account: $account,
            billable: $billable,
            category: $category,
            estimatedCostMinor: $estimatedCostMinor
        );
    }

    protected function toBoolean(mixed $value): bool
    {
        if (is_bool($value)) {
            return $value;
        }
        if (is_numeric($value)) {
            return (int) $value === 1;
        }
        if (is_string($value)) {
            $normalized = strtolower(trim($value));
            return in_array($normalized, ['1', 'true', 'yes', 'on'], true);
        }
        return (bool) $value;
    }

    protected function processTemplateLifecycleChange(?string $field, array $value, WhatsAppConnection $connection): void
    {
        $normalizedField = strtolower(trim((string) $field));

        if ($normalizedField === 'template_category_update') {
            $metaTemplateId = (string) ($value['message_template_id'] ?? '');
            $newCategory = strtoupper(trim((string) ($value['new_category'] ?? '')));
            if ($metaTemplateId === '' || $newCategory === '') {
                return;
            }

            WhatsAppTemplate::where('account_id', $connection->account_id)
                ->where('whatsapp_connection_id', $connection->id)
                ->where('meta_template_id', $metaTemplateId)
                ->update([
                    'category' => $newCategory,
                    'last_synced_at' => now(),
                ]);

            Log::channel('whatsapp')->info('Template category updated from webhook', [
                'connection_id' => $connection->id,
                'meta_template_id' => $metaTemplateId,
                'category' => $newCategory,
            ]);

            return;
        }

        if ($normalizedField === 'message_template_status_update') {
            $metaTemplateId = (string) ($value['message_template_id'] ?? '');
            $name = trim((string) ($value['message_template_name'] ?? ''));
            $language = trim((string) ($value['message_template_language'] ?? ''));
            $event = strtolower(trim((string) ($value['event'] ?? '')));
            $reason = trim((string) ($value['reason'] ?? ''));
            $category = strtoupper(trim((string) ($value['message_template_category'] ?? '')));

            if ($event === '') {
                return;
            }

            $query = WhatsAppTemplate::where('account_id', $connection->account_id)
                ->where('whatsapp_connection_id', $connection->id);

            if ($metaTemplateId !== '') {
                $query->where('meta_template_id', $metaTemplateId);
            } elseif ($name !== '' && $language !== '') {
                $query->where('name', $name)->where('language', $language);
            } else {
                return;
            }

            $updates = [
                'status' => $event,
                'last_synced_at' => now(),
                'last_meta_error' => $reason !== '' ? $reason : null,
            ];
            if ($category !== '') {
                $updates['category'] = $category;
            }

            $query->update($updates);

            Log::channel('whatsapp')->info('Template status updated from webhook', [
                'connection_id' => $connection->id,
                'meta_template_id' => $metaTemplateId,
                'name' => $name,
                'language' => $language,
                'status' => $event,
                'category' => $category ?: null,
                'reason' => $reason ?: null,
            ]);
        }
    }

    /**
     * Auto-assign a conversation when enabled.
     */
    protected function autoAssignConversation(WhatsAppConversation $conversation, WhatsAppConnection $connection): void
    {
        if (!Schema::hasColumn('whatsapp_conversations', 'assigned_to')) {
            return;
        }

        if ($conversation->assigned_to) {
            return;
        }

        $account = $connection->account ?: Account::find($connection->account_id);
        if (!$account || !$account->auto_assign_enabled) {
            return;
        }

        if (($account->auto_assign_strategy ?? 'round_robin') !== 'round_robin') {
            return;
        }

        $agentIds = $account->getAssignableAgentIds();
        if (empty($agentIds)) {
            return;
        }

        $counterKey = "account:{$account->id}:auto_assign_rr";
        $next = Cache::increment($counterKey);
        if ($next === 1) {
            Cache::put($counterKey, 1, now()->addDays(7));
        }

        $index = ($next - 1) % count($agentIds);
        $assigneeId = $agentIds[$index] ?? null;

        if (!$assigneeId) {
            return;
        }

        $conversation->update([
            'assigned_to' => $assigneeId,
        ]);

        $assigneeName = \App\Models\User::find($assigneeId)?->name ?? 'Unknown';
        $description = "Assigned to {$assigneeName} (auto-assign)";

        $audit = WhatsAppConversationAuditEvent::create([
            'account_id' => $account->id,
            'whatsapp_conversation_id' => $conversation->id,
            'actor_id' => null,
            'event_type' => 'auto_assigned',
            'description' => $description,
            'meta' => [
                'assigned_to' => $assigneeId,
            ],
        ]);

        event(new AuditEventAdded($conversation, [
            'id' => $audit->id,
            'event_type' => $audit->event_type,
            'description' => $audit->description,
            'meta' => $audit->meta,
            'created_at' => $audit->created_at->toIso8601String(),
            'actor' => null,
        ]));

        event(new ConversationUpdated($conversation));
    }
}
