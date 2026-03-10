<?php

namespace App\Modules\WhatsApp\Services;

use App\Models\Account;
use App\Modules\WhatsApp\Models\WhatsAppConnection;
use App\Modules\WhatsApp\Models\WhatsAppOutboundMessageJob;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;

class OutboundMessagePipelineService
{
    public function begin(array $attributes): ?WhatsAppOutboundMessageJob
    {
        try {
            return WhatsAppOutboundMessageJob::create(array_merge([
                'channel' => 'whatsapp_meta',
                'status' => 'queued',
                'queued_at' => now(),
                'attempt_count' => 1,
                'retry_count' => 0,
            ], $attributes));
        } catch (\Illuminate\Database\QueryException $e) {
            if (str_contains(strtolower($e->getMessage()), 'wa_outbound_jobs_account_idem_uq')) {
                return WhatsAppOutboundMessageJob::query()
                    ->where('account_id', $attributes['account_id'] ?? null)
                    ->where('idempotency_key', $attributes['idempotency_key'] ?? null)
                    ->latest('id')
                    ->first();
            }

            throw $e;
        }
    }

    public function markValidating(WhatsAppOutboundMessageJob $job): void
    {
        $job->update([
            'status' => 'validating',
            'validated_at' => now(),
        ]);
    }

    public function markSending(WhatsAppOutboundMessageJob $job): void
    {
        $job->update([
            'status' => 'sending',
            'sending_at' => now(),
        ]);
    }

    public function markSentToProvider(WhatsAppOutboundMessageJob $job, ?string $metaMessageId, array $providerResponse): void
    {
        $job->update([
            'status' => 'sent_to_provider',
            'meta_message_id' => $metaMessageId,
            'provider_response' => $providerResponse,
            'sent_to_provider_at' => now(),
            'error_message' => null,
            'provider_error_payload' => null,
            'failed_at' => null,
        ]);
    }

    public function markFailed(WhatsAppOutboundMessageJob $job, string $errorMessage, ?array $providerErrorPayload = null): void
    {
        $job->update([
            'status' => 'failed',
            'error_message' => mb_substr($errorMessage, 0, 2000),
            'provider_error_payload' => $providerErrorPayload,
            'failed_at' => now(),
        ]);
    }

    public function syncProviderDeliveryStatus(string $metaMessageId, string $status): void
    {
        if ($metaMessageId === '') {
            return;
        }

        $job = WhatsAppOutboundMessageJob::query()
            ->where('meta_message_id', $metaMessageId)
            ->latest('id')
            ->first();

        if (!$job) {
            return;
        }

        $normalized = strtolower(trim($status));
        $updates = [];
        if ($normalized === 'delivered') {
            $updates['status'] = 'delivered';
            $updates['delivered_at'] = now();
        } elseif ($normalized === 'read') {
            $updates['status'] = 'read';
            $updates['read_at'] = now();
        } elseif ($normalized === 'failed') {
            $updates['status'] = 'failed';
            $updates['failed_at'] = now();
        }

        if (!empty($updates)) {
            $job->update($updates);
        }
    }

    public function assertRateLimits(Account $account, ?WhatsAppConnection $connection = null, ?int $campaignId = null): void
    {
        $globalCap = (int) config('whatsapp.outbound.global_per_minute', 0);
        if ($globalCap > 0) {
            $globalKey = 'wa:outbound:global:'.now()->format('YmdHi');
            $current = (int) Cache::increment($globalKey);
            if ($current === 1) {
                Cache::put($globalKey, 1, now()->addMinutes(2));
            }
            if ($current > $globalCap) {
                throw new \RuntimeException('Global emergency throttle is active. Please retry in a minute.');
            }
        }

        $tenantCap = (int) config('whatsapp.outbound.per_tenant_per_minute', 120);
        if ($tenantCap > 0) {
            $tenantKey = 'wa:outbound:tenant:'.$account->id.':'.now()->format('YmdHi');
            $current = (int) Cache::increment($tenantKey);
            if ($current === 1) {
                Cache::put($tenantKey, 1, now()->addMinutes(2));
            }
            if ($current > $tenantCap) {
                throw new \RuntimeException('Tenant outbound rate limit reached. Please retry shortly.');
            }
        }

        if ($connection) {
            $connectionCap = (int) ($connection->throughput_cap_per_minute ?: config('whatsapp.outbound.per_connection_per_minute', 60));
            if ($connectionCap > 0) {
                $connectionKey = 'wa:outbound:connection:'.$connection->id.':'.now()->format('YmdHi');
                $current = (int) Cache::increment($connectionKey);
                if ($current === 1) {
                    Cache::put($connectionKey, 1, now()->addMinutes(2));
                }
                if ($current > $connectionCap) {
                    throw new \RuntimeException('Connection outbound rate limit reached. Please retry shortly.');
                }
            }
        }

        if ($campaignId !== null) {
            $campaignCap = (int) config('whatsapp.outbound.per_campaign_per_minute', 40);
            if ($campaignCap > 0) {
                $campaignKey = 'wa:outbound:campaign:'.$campaignId.':'.now()->format('YmdHi');
                $current = (int) Cache::increment($campaignKey);
                if ($current === 1) {
                    Cache::put($campaignKey, 1, now()->addMinutes(2));
                }
                if ($current > $campaignCap) {
                    throw new \RuntimeException('Campaign outbound rate limit reached. Please retry shortly.');
                }
            }
        }
    }

    public function buildIdempotencyKey(
        int $accountId,
        int $conversationId,
        string $messageType,
        ?string $clientRequestId,
        string $fingerprint
    ): string {
        if ($clientRequestId) {
            return sha1(implode('|', [$accountId, $conversationId, $messageType, 'client', $clientRequestId]));
        }

        return sha1(implode('|', [$accountId, $conversationId, $messageType, 'fp', $fingerprint]));
    }

    public function safeSerializeProviderError(\Throwable $exception): array
    {
        $payload = ['message' => $exception->getMessage()];
        if (method_exists($exception, 'getResponseData')) {
            try {
                $responseData = $exception->getResponseData();
                if (is_array($responseData)) {
                    $payload['provider'] = $responseData;
                }
            } catch (\Throwable) {
                // ignore
            }
        }

        return $payload;
    }
}

