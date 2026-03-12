<?php

namespace App\Modules\Developer\Jobs;

use App\Models\TenantWebhookDelivery;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class DeliverTenantWebhookJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public int $tries = 6;

    public function __construct(public int $deliveryId)
    {
    }

    public function backoff(): array
    {
        return [5, 15, 60, 180, 300, 600];
    }

    public function handle(): void
    {
        /** @var TenantWebhookDelivery|null $delivery */
        $delivery = TenantWebhookDelivery::query()
            ->with('endpoint')
            ->find($this->deliveryId);

        if (!$delivery || !$delivery->endpoint) {
            return;
        }

        $endpoint = $delivery->endpoint;
        if (!$endpoint->is_active) {
            $delivery->update([
                'status' => 'giving_up',
                'error_message' => 'Endpoint is disabled.',
            ]);
            return;
        }

        $payload = is_array($delivery->payload) ? $delivery->payload : [];
        $body = [
            'event_id' => $delivery->event_id,
            'event' => $delivery->event_key,
            'account_id' => $delivery->account_id,
            'occurred_at' => now()->toIso8601String(),
            'data' => $payload,
        ];
        $rawBody = json_encode($body, JSON_UNESCAPED_SLASHES);
        $timestamp = (string) now()->timestamp;
        $secret = (string) ($endpoint->signing_secret ?? '');
        $signature = hash_hmac('sha256', "{$timestamp}.{$rawBody}", $secret);

        $attempts = (int) $delivery->attempts + 1;

        try {
            $response = Http::timeout(max(3, (int) $endpoint->timeout_seconds))
                ->retry(0, 0)
                ->withHeaders([
                    'Content-Type' => 'application/json',
                    'X-Waify-Event' => $delivery->event_key,
                    'X-Waify-Event-Id' => $delivery->event_id,
                    'X-Waify-Timestamp' => $timestamp,
                    'X-Waify-Signature' => "v1={$signature}",
                    'X-Waify-Idempotency-Key' => (string) ($delivery->idempotency_key ?: $delivery->event_id),
                ])
                ->post($endpoint->url, $body);

            $statusCode = $response->status();
            $ok = $statusCode >= 200 && $statusCode < 300;

            $delivery->update([
                'attempts' => $attempts,
                'http_status' => $statusCode,
                'response_body' => mb_substr((string) $response->body(), 0, 10000),
                'response_headers' => $response->headers(),
                'error_message' => $ok ? null : ("HTTP {$statusCode}"),
                'status' => $ok ? 'delivered' : 'failed',
                'delivered_at' => $ok ? now() : null,
                'next_retry_at' => null,
            ]);

            $endpoint->update([
                'last_delivery_at' => now(),
                'last_delivery_status_code' => $statusCode,
                'last_delivery_error' => $ok ? null : ("HTTP {$statusCode}"),
            ]);

            if (!$ok && $attempts < (int) $endpoint->max_retries) {
                throw new \RuntimeException("Webhook delivery failed with HTTP {$statusCode}");
            }
        } catch (\Throwable $e) {
            $maxRetries = max(1, (int) $endpoint->max_retries);
            $isGivingUp = $attempts >= $maxRetries;

            $delivery->update([
                'attempts' => $attempts,
                'status' => $isGivingUp ? 'giving_up' : 'failed',
                'error_message' => mb_substr($e->getMessage(), 0, 1000),
                'next_retry_at' => $isGivingUp ? null : now()->addSeconds($this->guessRetryDelay($attempts)),
            ]);

            $endpoint->update([
                'last_delivery_at' => now(),
                'last_delivery_error' => mb_substr($e->getMessage(), 0, 1000),
            ]);

            if ($isGivingUp) {
                Log::warning('Tenant webhook delivery giving up', [
                    'delivery_id' => $delivery->id,
                    'endpoint_id' => $endpoint->id,
                    'event_key' => $delivery->event_key,
                    'attempts' => $attempts,
                    'error' => $e->getMessage(),
                ]);
                return;
            }

            throw $e;
        }
    }

    protected function guessRetryDelay(int $attempts): int
    {
        return match (true) {
            $attempts <= 1 => 5,
            $attempts === 2 => 15,
            $attempts === 3 => 60,
            $attempts === 4 => 180,
            default => 300,
        };
    }
}

