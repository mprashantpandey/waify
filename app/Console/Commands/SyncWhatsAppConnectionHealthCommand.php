<?php

namespace App\Console\Commands;

use App\Modules\WhatsApp\Jobs\SyncConnectionHealthSnapshotJob;
use App\Modules\WhatsApp\Models\WhatsAppConnection;
use App\Modules\WhatsApp\Services\ConnectionHealthSyncService;
use Illuminate\Console\Command;

class SyncWhatsAppConnectionHealthCommand extends Command
{
    protected $signature = 'whatsapp:sync-connection-health
        {--connection= : Sync only a specific connection ID}
        {--account= : Sync only one tenant/account ID}
        {--sync : Run synchronously instead of queueing jobs}
        {--chunk=100 : Chunk size for queued dispatch}';

    protected $description = 'Sync WhatsApp connection quality/tier/verification health metadata into snapshots';

    public function handle(ConnectionHealthSyncService $syncService): int
    {
        $query = WhatsAppConnection::query()->where('is_active', true);

        if ($this->option('connection')) {
            $query->where('id', (int) $this->option('connection'));
        }

        if ($this->option('account')) {
            $query->where('account_id', (int) $this->option('account'));
        }

        $total = 0;
        $synced = 0;
        $failed = 0;
        $synchronous = (bool) $this->option('sync');
        $chunkSize = max(10, (int) $this->option('chunk'));

        $query->orderBy('id')->chunk($chunkSize, function ($connections) use (&$total, &$synced, &$failed, $synchronous, $syncService) {
            foreach ($connections as $connection) {
                $total++;
                if ($synchronous) {
                    try {
                        $snapshot = $syncService->syncConnection($connection, 'manual_sync');
                        if ($snapshot) {
                            $synced++;
                        }
                    } catch (\Throwable $e) {
                        $failed++;
                        $this->warn("Failed sync for connection {$connection->id}: {$e->getMessage()}");
                    }
                    continue;
                }

                SyncConnectionHealthSnapshotJob::dispatch((int) $connection->id);
                $synced++;
            }
        });

        $mode = $synchronous ? 'sync' : 'queued';
        $this->info("Connection health {$mode} run complete. scanned={$total}, dispatched_or_synced={$synced}, failed={$failed}");

        return self::SUCCESS;
    }
}

