<?php

namespace App\Modules\WhatsApp\Jobs;

use App\Modules\WhatsApp\Models\WhatsAppConnection;
use App\Modules\WhatsApp\Models\WhatsAppWebhookEvent;
use App\Modules\WhatsApp\Services\WebhookProcessor;
use App\Services\OperationalAlertService;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class ProcessWebhookEventJob implements ShouldQueue
{
    use Dispatchable;
    use InteractsWithQueue;
    use Queueable;
    use SerializesModels;

    public int $tries = 5;
    public array $backoff = [5, 20, 60, 180, 600];
    public int $timeout = 120;

    public function __construct(public int $webhookEventId)
    {
        $this->onQueue('webhooks');
    }

    public function handle(WebhookProcessor $webhookProcessor, OperationalAlertService $alertService): void
    {
        /** @var WhatsAppWebhookEvent|null $event */
        $event = WhatsAppWebhookEvent::query()->find($this->webhookEventId);
        if (!$event) {
            return;
        }

        if ($event->status === 'processed') {
            return;
        }

        /** @var WhatsAppConnection|null $connection */
        $connection = WhatsAppConnection::query()->find($event->whatsapp_connection_id);
        if (!$connection) {
            $event->update([
                'status' => 'failed',
                'failed_at' => now(),
                'error_message' => 'Connection not found for webhook event processing.',
                'retry_count' => (int) $event->retry_count + 1,
            ]);
            return;
        }

        $payload = $event->payload;
        if (!is_array($payload) || empty($payload)) {
            $event->update([
                'status' => 'failed',
                'failed_at' => now(),
                'error_message' => 'Webhook payload missing/invalid.',
                'retry_count' => (int) $event->retry_count + 1,
            ]);
            return;
        }

        try {
            $event->update([
                'status' => 'processing',
            ]);

            $webhookProcessor->process($payload, $connection, $event->correlation_id);

            $receivedAt = $event->created_at ?? now();
            $lagSeconds = max(0, (int) $receivedAt->diffInSeconds(now()));

            DB::transaction(function () use ($event, $connection, $lagSeconds) {
                $event->update([
                    'status' => 'processed',
                    'processed_at' => now(),
                    'failed_at' => null,
                    'error_message' => null,
                ]);

                $connection->update([
                    'webhook_last_processed_at' => now(),
                    'webhook_consecutive_failures' => 0,
                    'webhook_last_lag_seconds' => $lagSeconds,
                    'webhook_last_received_at' => $connection->webhook_last_received_at ?: now(),
                    'webhook_last_error' => null,
                ]);
            });
        } catch (\Throwable $e) {
            $retryCount = (int) $event->retry_count + 1;
            $errorMessage = mb_substr($e->getMessage(), 0, 2000);

            $event->update([
                'status' => 'failed',
                'failed_at' => now(),
                'processed_at' => now(),
                'retry_count' => $retryCount,
                'error_message' => $errorMessage,
            ]);

            $connection->update([
                'webhook_last_error' => $errorMessage,
                'webhook_consecutive_failures' => (int) $connection->webhook_consecutive_failures + 1,
            ]);

            $threshold = (int) config('whatsapp.webhook.failure_alert_threshold', 5);
            if ($threshold > 0 && (int) $connection->webhook_consecutive_failures >= $threshold) {
                $alertService->send(
                    eventKey: 'whatsapp.webhook.repeated_failures',
                    title: 'Repeated WhatsApp webhook failures',
                    severity: 'critical',
                    context: [
                        'scope' => "connection:{$connection->id}",
                        'tenant_id' => $connection->account_id,
                        'connection_id' => $connection->id,
                        'consecutive_failures' => (int) $connection->webhook_consecutive_failures,
                        'event_id' => $event->id,
                        'error' => $errorMessage,
                    ]
                );
            }

            Log::channel('whatsapp')->error('Webhook event job failed', [
                'event_id' => $event->id,
                'connection_id' => $connection->id,
                'retry_count' => $retryCount,
                'error' => $errorMessage,
            ]);

            throw $e;
        }
    }
}

