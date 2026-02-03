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
use App\Models\Account;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Schema;

class WebhookProcessor
{
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

            foreach ($entries as $entry) {
                $changes = $entry['changes'] ?? [];
                foreach ($changes as $change) {
                    $value = $change['value'] ?? [];
                    $messages = $value['messages'] ?? [];
                    $statuses = $value['statuses'] ?? [];

                    foreach ($messages as $messageData) {
                        $this->processMessage($messageData, $value, $connection, $correlationId);
                        $messagesProcessed++;
                    }

                    foreach ($statuses as $statusData) {
                        $this->processStatus($statusData, $connection);
                        $statusesProcessed++;
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

            // Get or create contact with lock to prevent conflicts with ContactService
            $contact = DB::transaction(function () use ($connection, $fromWaId, $value) {
                return WhatsAppContact::lockForUpdate()
                    ->firstOrCreate(
                        [
                            'account_id' => $connection->account_id,
                            'wa_id' => $fromWaId],
                        [
                            'name' => $value['contacts'][0]['profile']['name'] ?? null,
                            'source' => 'webhook']
                    );
            });

            // Update contact name if provided (with lock)
            if (isset($value['contacts'][0]['profile']['name'])) {
                $contact->lockForUpdate();
                $contact->update([
                    'name' => $value['contacts'][0]['profile']['name']]);
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

            // Update conversation
            $conversation->update([
                'last_message_at' => now(),
                'last_message_preview' => $textBody ? substr($textBody, 0, 100) : "[{$messageType}]"]);

            // Auto-assign if enabled and conversation is unassigned
            $this->autoAssignConversation($conversation, $connection);

            // Load relationships for broadcast
            $message->load('conversation.contact');
            $conversation->load('contact');

            // Broadcast events
            event(new MessageCreated($message));
            event(new ConversationUpdated($conversation));

            // Process bots for inbound messages (queued to prevent webhook timeout)
            if ($message->direction === 'inbound') {
                \App\Modules\Chatbots\Jobs\ProcessInboundMessageForBots::dispatch($message, $conversation)
                    ->onQueue('chatbots'); // Use dedicated queue
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

                event(new \App\Modules\WhatsApp\Events\Inbox\MessageUpdated($message));
            } elseif ($campaignMessage) {
                // Update campaign message via service to maintain consistency
                $campaignService = app(\App\Modules\Broadcasts\Services\CampaignService::class);
                $campaignService->updateMessageStatus($metaMessageId, $status, $statusAt);
            }
        } finally {
            $statusLock->release();
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

        $agentIds = $this->getAssignableAgentIds($account);
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

        $audit = WhatsAppConversationAuditEvent::create([
            'account_id' => $account->id,
            'whatsapp_conversation_id' => $conversation->id,
            'actor_id' => null,
            'event_type' => 'auto_assigned',
            'description' => 'Auto-assigned by round robin',
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

    /**
     * Build a list of assignable agent IDs.
     */
    protected function getAssignableAgentIds(Account $account): array
    {
        $ids = [];

        if ($account->owner_id) {
            $ids[] = $account->owner_id;
        }

        $memberIds = $account->users()
            ->whereIn('account_users.role', ['admin', 'member'])
            ->pluck('users.id')
            ->toArray();

        $ids = array_values(array_unique(array_merge($ids, $memberIds)));
        sort($ids);

        return $ids;
    }
}
