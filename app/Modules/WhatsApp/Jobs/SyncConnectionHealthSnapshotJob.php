<?php

namespace App\Modules\WhatsApp\Jobs;

use App\Modules\WhatsApp\Models\WhatsAppConnection;
use App\Modules\WhatsApp\Services\ConnectionHealthSyncService;
use App\Modules\WhatsApp\Services\ConnectionLifecycleService;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;

class SyncConnectionHealthSnapshotJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public int $tries = 3;

    public array $backoff = [60, 180, 420];

    public function __construct(
        public int $connectionId
    ) {
        $this->onQueue('default');
    }

    public function handle(ConnectionHealthSyncService $syncService, ConnectionLifecycleService $lifecycleService): void
    {
        $connection = WhatsAppConnection::query()->find($this->connectionId);
        if (!$connection || !$connection->is_active) {
            return;
        }

        try {
            $syncService->syncConnection($connection, 'scheduled_sync');
        } catch (\Throwable $e) {
            $lifecycleService->markMetadataSync($connection, 'error', $e->getMessage(), [
                'source' => 'scheduled_sync',
            ]);
            throw $e;
        }
    }

    public function failed(\Throwable $exception): void
    {
        Log::channel('whatsapp')->error('Connection health sync job failed', [
            'connection_id' => $this->connectionId,
            'error' => $exception->getMessage(),
        ]);
    }
}
