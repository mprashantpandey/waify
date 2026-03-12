<?php

namespace App\Modules\Developer\Services;

use App\Models\Account;
use App\Models\TenantWebhookDelivery;
use App\Models\TenantWebhookEndpoint;
use App\Modules\Developer\Jobs\DeliverTenantWebhookJob;
use Illuminate\Support\Collection;
use Illuminate\Support\Str;

class TenantWebhookService
{
    public const EVENT_KEYS = [
        'message.received',
        'message.sent',
        'message.delivered',
        'message.read',
        'message.failed',
        'conversation.created',
        'conversation.updated',
        'contact.created',
        'contact.updated',
        'campaign.started',
        'campaign.completed',
        'template.status_changed',
        'connection.health_changed',
    ];

    /**
     * @param  array<string,mixed>  $payload
     */
    public function dispatchEvent(Account $account, string $eventKey, array $payload, ?string $idempotencyKey = null): int
    {
        if (!in_array($eventKey, self::EVENT_KEYS, true)) {
            return 0;
        }

        $endpoints = $this->eligibleEndpoints($account, $eventKey);
        if ($endpoints->isEmpty()) {
            return 0;
        }

        $eventId = (string) Str::uuid();
        $created = 0;

        foreach ($endpoints as $endpoint) {
            $delivery = TenantWebhookDelivery::firstOrCreate(
                [
                    'tenant_webhook_endpoint_id' => $endpoint->id,
                    'event_id' => $eventId,
                ],
                [
                    'account_id' => $account->id,
                    'event_key' => $eventKey,
                    'idempotency_key' => $idempotencyKey,
                    'payload' => $payload,
                    'status' => 'pending',
                    'attempts' => 0,
                ]
            );

            if ($delivery->wasRecentlyCreated) {
                $created++;
                DeliverTenantWebhookJob::dispatch($delivery->id);
            }
        }

        return $created;
    }

    public function replayDelivery(TenantWebhookDelivery $delivery): void
    {
        $delivery->update([
            'status' => 'pending',
            'error_message' => null,
            'next_retry_at' => null,
        ]);

        DeliverTenantWebhookJob::dispatch($delivery->id);
    }

    /**
     * @return Collection<int, TenantWebhookEndpoint>
     */
    protected function eligibleEndpoints(Account $account, string $eventKey): Collection
    {
        return TenantWebhookEndpoint::query()
            ->where('account_id', $account->id)
            ->where('is_active', true)
            ->whereHas('subscriptions', function ($query) use ($eventKey) {
                $query->where('event_key', $eventKey)->where('is_enabled', true);
            })
            ->with(['subscriptions' => fn ($q) => $q->where('event_key', $eventKey)->where('is_enabled', true)])
            ->get();
    }
}

