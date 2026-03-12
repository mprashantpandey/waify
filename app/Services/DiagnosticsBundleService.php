<?php

namespace App\Services;

use App\Models\Account;
use App\Models\OperationalAlertEvent;
use App\Modules\Broadcasts\Models\Campaign;
use App\Modules\WhatsApp\Models\WhatsAppConnection;
use App\Modules\WhatsApp\Models\WhatsAppConversation;
use App\Modules\WhatsApp\Models\WhatsAppMessage;
use App\Modules\WhatsApp\Models\WhatsAppTemplate;
use App\Modules\WhatsApp\Models\WhatsAppWebhookEvent;
use Illuminate\Support\Facades\Schema;

class DiagnosticsBundleService
{
    public function buildForAlert(OperationalAlertEvent $alert, ?int $actorUserId = null): array
    {
        $targets = $this->inferTargetsFromAlert($alert);
        return $this->buildForTargets(
            targets: $targets,
            accountId: (int) ($alert->account_id ?: 0) ?: null,
            actorUserId: $actorUserId,
            triggerAlert: $alert
        );
    }

    /**
     * @param array<string,mixed> $targets
     */
    public function buildForTargets(array $targets, ?int $accountId = null, ?int $actorUserId = null, ?OperationalAlertEvent $triggerAlert = null): array
    {
        $contextAccountId = $accountId ?: ((int) ($targets['account_id'] ?? 0) ?: null);
        $account = $contextAccountId ? Account::find($contextAccountId) : null;

        $connectionId = (int) ($targets['connection_id'] ?? 0) ?: null;
        $campaignId = (int) ($targets['campaign_id'] ?? 0) ?: null;
        $conversationId = (int) ($targets['conversation_id'] ?? 0) ?: null;
        $messageId = (int) ($targets['message_id'] ?? 0) ?: null;
        $templateId = (int) ($targets['template_id'] ?? 0) ?: null;
        $webhookEventId = (int) ($targets['webhook_event_id'] ?? 0) ?: null;
        $metaMessageId = trim((string) ($targets['meta_message_id'] ?? ''));
        $correlationId = trim((string) ($targets['correlation_id'] ?? ''));

        $connection = $connectionId ? WhatsAppConnection::query()->find($connectionId) : null;
        $campaign = $campaignId && Schema::hasTable('campaigns') ? Campaign::query()->find($campaignId) : null;
        $conversation = $conversationId ? WhatsAppConversation::query()->find($conversationId) : null;

        $message = null;
        if ($messageId) {
            $message = WhatsAppMessage::query()->find($messageId);
        } elseif ($metaMessageId !== '') {
            $message = WhatsAppMessage::query()->where('meta_message_id', $metaMessageId)->latest('id')->first();
        }

        $template = $templateId ? WhatsAppTemplate::query()->find($templateId) : null;
        $webhookEvent = ($webhookEventId && Schema::hasTable('whatsapp_webhook_events'))
            ? WhatsAppWebhookEvent::query()->find($webhookEventId)
            : null;

        $scopeCandidates = array_values(array_filter([
            (string) ($targets['scope'] ?? ''),
            $connection ? "connection:{$connection->id}" : null,
            $campaign ? "campaign:{$campaign->id}" : null,
            $conversation ? "conversation:{$conversation->id}" : null,
            $message ? "message:{$message->id}" : null,
            $template ? "template:{$template->id}" : null,
            $webhookEvent ? "webhook_event:{$webhookEvent->id}" : null,
        ]));

        $alertsQuery = OperationalAlertEvent::query()->latest('id');
        if ($contextAccountId) {
            $alertsQuery->where('account_id', $contextAccountId);
        }
        $alertsQuery->where(function ($q) use ($scopeCandidates, $correlationId) {
            foreach ($scopeCandidates as $scope) {
                $q->orWhere('scope', $scope);
            }
            if ($correlationId !== '') {
                $q->orWhere('correlation_id', $correlationId);
            }
        });

        $relatedAlerts = $alertsQuery->limit(50)->get()->map(function (OperationalAlertEvent $event) {
            return [
                'id' => $event->id,
                'event_key' => $event->event_key,
                'title' => $event->title,
                'severity' => $event->severity,
                'status' => $event->status,
                'scope' => $event->scope,
                'correlation_id' => $event->correlation_id,
                'error_message' => $event->error_message,
                'acknowledged_at' => $event->acknowledged_at?->toIso8601String(),
                'resolve_note' => $event->resolve_note,
                'created_at' => $event->created_at?->toIso8601String(),
            ];
        })->values()->toArray();

        $conversationMessages = [];
        if ($conversation) {
            $conversationMessages = WhatsAppMessage::query()
                ->where('whatsapp_conversation_id', $conversation->id)
                ->latest('id')
                ->limit(50)
                ->get([
                    'id',
                    'direction',
                    'status',
                    'type',
                    'meta_message_id',
                    'text_body',
                    'error_message',
                    'sent_at',
                    'delivered_at',
                    'read_at',
                    'created_at',
                ])
                ->map(fn (WhatsAppMessage $m) => [
                    'id' => $m->id,
                    'direction' => $m->direction,
                    'status' => $m->status,
                    'type' => $m->type,
                    'meta_message_id' => $m->meta_message_id,
                    'text_body' => $m->text_body,
                    'error_message' => $m->error_message,
                    'sent_at' => $m->sent_at?->toIso8601String(),
                    'delivered_at' => $m->delivered_at?->toIso8601String(),
                    'read_at' => $m->read_at?->toIso8601String(),
                    'created_at' => $m->created_at?->toIso8601String(),
                ])
                ->values()
                ->toArray();
        }

        $campaignRecipients = [];
        if ($campaign && Schema::hasTable('campaign_recipients')) {
            $campaignRecipients = $campaign->recipients()
                ->latest('id')
                ->limit(100)
                ->get([
                    'id',
                    'status',
                    'phone_number',
                    'message_id',
                    'failure_reason',
                    'sent_at',
                    'delivered_at',
                    'read_at',
                    'failed_at',
                    'created_at',
                ])
                ->map(fn ($recipient) => [
                    'id' => $recipient->id,
                    'status' => $recipient->status,
                    'phone_number' => $recipient->phone_number,
                    'message_id' => $recipient->message_id,
                    'failure_reason' => $recipient->failure_reason,
                    'sent_at' => $recipient->sent_at?->toIso8601String(),
                    'delivered_at' => $recipient->delivered_at?->toIso8601String(),
                    'read_at' => $recipient->read_at?->toIso8601String(),
                    'failed_at' => $recipient->failed_at?->toIso8601String(),
                    'created_at' => $recipient->created_at?->toIso8601String(),
                ])
                ->values()
                ->toArray();
        }

        $connectionPayload = null;
        if ($connection) {
            $connectionPayload = [
                'id' => $connection->id,
                'account_id' => $connection->account_id,
                'name' => $connection->name,
                'slug' => $connection->slug,
                'is_active' => (bool) $connection->is_active,
                'webhook_subscribed' => (bool) $connection->webhook_subscribed,
                'webhook_last_received_at' => $connection->webhook_last_received_at?->toIso8601String(),
                'webhook_last_processed_at' => $connection->webhook_last_processed_at?->toIso8601String(),
                'webhook_consecutive_failures' => (int) ($connection->webhook_consecutive_failures ?? 0),
                'webhook_last_lag_seconds' => $connection->webhook_last_lag_seconds,
                'webhook_last_error' => $connection->webhook_last_error,
                'quality_rating' => $connection->quality_rating,
                'messaging_limit_tier' => $connection->messaging_limit_tier,
                'health_state' => $connection->health_state,
                'restriction_state' => $connection->restriction_state,
                'warning_state' => $connection->warning_state,
                'health_last_synced_at' => $connection->health_last_synced_at?->toIso8601String(),
                'updated_at' => $connection->updated_at?->toIso8601String(),
            ];
        }

        return [
            'meta' => [
                'generated_at' => now()->toIso8601String(),
                'actor_user_id' => $actorUserId,
                'targets' => [
                    'account_id' => $contextAccountId,
                    'connection_id' => $connection?->id ?? $connectionId,
                    'campaign_id' => $campaign?->id ?? $campaignId,
                    'conversation_id' => $conversation?->id ?? $conversationId,
                    'message_id' => $message?->id ?? $messageId,
                    'template_id' => $template?->id ?? $templateId,
                    'webhook_event_id' => $webhookEvent?->id ?? $webhookEventId,
                    'correlation_id' => $correlationId !== '' ? $correlationId : null,
                ],
            ],
            'trigger_alert' => $triggerAlert ? [
                'id' => $triggerAlert->id,
                'event_key' => $triggerAlert->event_key,
                'title' => $triggerAlert->title,
                'severity' => $triggerAlert->severity,
                'status' => $triggerAlert->status,
                'scope' => $triggerAlert->scope,
                'correlation_id' => $triggerAlert->correlation_id,
                'context' => $triggerAlert->context ?? [],
                'error_message' => $triggerAlert->error_message,
                'created_at' => $triggerAlert->created_at?->toIso8601String(),
            ] : null,
            'account' => $account ? [
                'id' => $account->id,
                'name' => $account->name,
                'slug' => $account->slug,
                'status' => $account->status,
                'owner_id' => $account->owner_id,
            ] : null,
            'connection' => $connectionPayload,
            'campaign' => $campaign ? [
                'id' => $campaign->id,
                'name' => $campaign->name,
                'slug' => $campaign->slug,
                'status' => $campaign->status,
                'type' => $campaign->type,
                'total_recipients' => (int) $campaign->total_recipients,
                'sent_count' => (int) $campaign->sent_count,
                'delivered_count' => (int) $campaign->delivered_count,
                'read_count' => (int) $campaign->read_count,
                'failed_count' => (int) $campaign->failed_count,
                'started_at' => $campaign->started_at?->toIso8601String(),
                'completed_at' => $campaign->completed_at?->toIso8601String(),
                'updated_at' => $campaign->updated_at?->toIso8601String(),
            ] : null,
            'campaign_recipients' => $campaignRecipients,
            'conversation' => $conversation ? [
                'id' => $conversation->id,
                'status' => $conversation->status,
                'priority' => $conversation->priority,
                'assigned_to' => $conversation->assigned_to,
                'whatsapp_connection_id' => $conversation->whatsapp_connection_id,
                'whatsapp_contact_id' => $conversation->whatsapp_contact_id,
                'last_message_at' => $conversation->last_message_at?->toIso8601String(),
                'last_message_preview' => $conversation->last_message_preview,
                'updated_at' => $conversation->updated_at?->toIso8601String(),
            ] : null,
            'conversation_messages' => $conversationMessages,
            'message' => $message ? [
                'id' => $message->id,
                'account_id' => $message->account_id,
                'whatsapp_conversation_id' => $message->whatsapp_conversation_id,
                'direction' => $message->direction,
                'status' => $message->status,
                'type' => $message->type,
                'meta_message_id' => $message->meta_message_id,
                'text_body' => $message->text_body,
                'error_message' => $message->error_message,
                'sent_at' => $message->sent_at?->toIso8601String(),
                'delivered_at' => $message->delivered_at?->toIso8601String(),
                'read_at' => $message->read_at?->toIso8601String(),
                'created_at' => $message->created_at?->toIso8601String(),
                'payload' => $message->payload ?? [],
            ] : null,
            'template' => $template ? [
                'id' => $template->id,
                'name' => $template->name,
                'slug' => $template->slug,
                'category' => $template->category,
                'language' => $template->language,
                'status' => $template->status,
                'remote_status' => $template->remote_status,
                'meta_rejection_reason' => $template->meta_rejection_reason,
                'last_meta_error' => $template->last_meta_error,
                'last_meta_sync_at' => $template->last_meta_sync_at?->toIso8601String(),
                'updated_at' => $template->updated_at?->toIso8601String(),
            ] : null,
            'webhook_event' => $webhookEvent ? [
                'id' => $webhookEvent->id,
                'account_id' => $webhookEvent->account_id,
                'whatsapp_connection_id' => $webhookEvent->whatsapp_connection_id,
                'event_type' => $webhookEvent->event_type,
                'object_type' => $webhookEvent->object_type,
                'status' => $webhookEvent->status,
                'signature_valid' => $webhookEvent->signature_valid,
                'error_message' => $webhookEvent->error_message,
                'retry_count' => $webhookEvent->retry_count,
                'correlation_id' => $webhookEvent->correlation_id,
                'processed_at' => $webhookEvent->processed_at?->toIso8601String(),
                'failed_at' => $webhookEvent->failed_at?->toIso8601String(),
                'created_at' => $webhookEvent->created_at?->toIso8601String(),
                'payload' => $webhookEvent->payload ?? [],
            ] : null,
            'related_alerts' => $relatedAlerts,
        ];
    }

    protected function inferTargetsFromAlert(OperationalAlertEvent $alert): array
    {
        $context = (array) ($alert->context ?? []);
        $targets = [
            'account_id' => $alert->account_id,
            'scope' => $alert->scope,
            'correlation_id' => $alert->correlation_id,
            'message_id' => $context['message_id'] ?? $context['whatsapp_message_id'] ?? null,
            'meta_message_id' => $context['meta_message_id'] ?? null,
            'conversation_id' => $context['conversation_id'] ?? null,
            'campaign_id' => $context['campaign_id'] ?? null,
            'connection_id' => $context['connection_id'] ?? null,
            'template_id' => $context['template_id'] ?? null,
            'webhook_event_id' => $context['webhook_event_id'] ?? $context['event_id'] ?? null,
        ];

        $scope = (string) ($alert->scope ?? '');
        if (str_starts_with($scope, 'connection:')) {
            $targets['connection_id'] = (int) substr($scope, strlen('connection:'));
        } elseif (str_starts_with($scope, 'campaign:')) {
            $targets['campaign_id'] = (int) substr($scope, strlen('campaign:'));
        } elseif (str_starts_with($scope, 'conversation:')) {
            $targets['conversation_id'] = (int) substr($scope, strlen('conversation:'));
        } elseif (str_starts_with($scope, 'message:')) {
            $targets['message_id'] = (int) substr($scope, strlen('message:'));
        } elseif (str_starts_with($scope, 'template:')) {
            $targets['template_id'] = (int) substr($scope, strlen('template:'));
        } elseif (str_starts_with($scope, 'webhook_event:')) {
            $targets['webhook_event_id'] = (int) substr($scope, strlen('webhook_event:'));
        }

        return $targets;
    }
}
