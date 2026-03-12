<?php

namespace App\Modules\WhatsApp\Services;

use App\Models\Account;
use App\Modules\WhatsApp\Exceptions\WhatsAppApiException;
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
            'is_retryable' => false,
            'next_retry_at' => null,
        ]);
    }

    public function markFailed(
        WhatsAppOutboundMessageJob $job,
        string $errorMessage,
        ?array $providerErrorPayload = null,
        ?bool $isRetryable = null,
        ?int $retryAfterSeconds = null
    ): void
    {
        $retryAfterSeconds = $retryAfterSeconds !== null ? max(0, $retryAfterSeconds) : null;
        $job->update([
            'status' => 'failed',
            'error_message' => mb_substr($errorMessage, 0, 2000),
            'provider_error_payload' => $providerErrorPayload,
            'failed_at' => now(),
            'is_retryable' => (bool) $isRetryable,
            'next_retry_at' => $isRetryable && $retryAfterSeconds !== null ? now()->addSeconds($retryAfterSeconds) : null,
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

    public function assertSendPrerequisites(WhatsAppConnection $connection, string $toWaId, string $messageType): void
    {
        if (!(bool) $connection->is_active) {
            throw new \RuntimeException('Connection is inactive. Reconnect the WhatsApp account and retry.');
        }

        if (trim((string) $connection->phone_number_id) === '') {
            throw new \RuntimeException('Connection is missing phone number ID.');
        }

        if (trim((string) $connection->access_token) === '') {
            throw new \RuntimeException('Connection is missing access token.');
        }

        $normalizedToWaId = preg_replace('/\D+/', '', $toWaId) ?? '';
        if ($normalizedToWaId === '' || strlen($normalizedToWaId) < 6 || strlen($normalizedToWaId) > 20) {
            throw new \RuntimeException("Invalid recipient format for {$messageType} send.");
        }
    }

    /**
     * @return array{retryable: bool, retry_after_seconds: int|null}
     */
    public function classifyFailure(\Throwable $exception): array
    {
        $message = strtolower($exception->getMessage());
        $code = (int) $exception->getCode();

        $rateLimited = $code === 4 || $code === 429 || str_contains($message, 'rate limit') || str_contains($message, 'throttle');
        $temporary = $rateLimited
            || str_contains($message, 'timeout')
            || str_contains($message, 'temporar')
            || str_contains($message, 'connection reset')
            || str_contains($message, 'service unavailable')
            || str_contains($message, 'gateway timeout');

        if ($exception instanceof WhatsAppApiException) {
            $response = method_exists($exception, 'getResponseData')
                ? $exception->getResponseData()
                : (method_exists($exception, 'getResponseBody') ? $exception->getResponseBody() : []);
            $providerCode = (int) ($response['error']['code'] ?? 0);
            $subCode = (int) ($response['error']['error_subcode'] ?? 0);
            if (in_array($providerCode, [1, 2, 4, 17, 32, 613, 80007], true)) {
                $temporary = true;
            }
            if (in_array($providerCode, [131026, 131047, 132000, 132001, 132012], true) || in_array($subCode, [2494073, 36008], true)) {
                $temporary = false;
            }
        }

        return [
            'retryable' => $temporary,
            'retry_after_seconds' => $temporary ? ($rateLimited ? 120 : 45) : null,
        ];
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
        if (method_exists($exception, 'getResponseData') || method_exists($exception, 'getResponseBody')) {
            try {
                $responseData = method_exists($exception, 'getResponseData')
                    ? $exception->getResponseData()
                    : $exception->getResponseBody();
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
