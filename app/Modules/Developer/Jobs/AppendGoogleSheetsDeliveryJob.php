<?php

namespace App\Modules\Developer\Jobs;

use App\Models\GoogleSheetsDelivery;
use App\Modules\Developer\Services\GoogleSheetsIntegrationService;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;

class AppendGoogleSheetsDeliveryJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public int $tries = 5;

    public function __construct(public int $deliveryId)
    {
    }

    public function backoff(): array
    {
        return [10, 30, 120, 300, 900];
    }

    public function handle(GoogleSheetsIntegrationService $service): void
    {
        $delivery = GoogleSheetsDelivery::query()->with('integration')->find($this->deliveryId);
        if (!$delivery || !$delivery->integration) {
            return;
        }

        if (!$delivery->integration->is_active) {
            $delivery->update([
                'status' => 'giving_up',
                'error_message' => 'Integration is disabled.',
            ]);
            return;
        }

        try {
            $service->deliver($delivery);
        } catch (\Throwable $e) {
            $attempts = ((int) $delivery->attempts) + 1;
            $isGivingUp = $attempts >= $this->tries;

            $delivery->update([
                'attempts' => $attempts,
                'status' => $isGivingUp ? 'giving_up' : 'failed',
                'error_message' => mb_substr($e->getMessage(), 0, 1000),
            ]);

            $delivery->integration->update([
                'last_delivery_at' => now(),
                'last_delivery_error' => mb_substr($e->getMessage(), 0, 1000),
            ]);

            if ($isGivingUp) {
                Log::warning('Google Sheets delivery giving up', [
                    'delivery_id' => $delivery->id,
                    'integration_id' => $delivery->integration->id,
                    'event_key' => $delivery->event_key,
                    'attempts' => $attempts,
                    'error' => $e->getMessage(),
                ]);
                return;
            }

            throw $e;
        }
    }
}
