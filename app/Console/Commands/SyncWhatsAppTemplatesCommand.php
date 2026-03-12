<?php

namespace App\Console\Commands;

use App\Modules\WhatsApp\Models\WhatsAppConnection;
use App\Modules\WhatsApp\Services\TemplateSyncService;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Log;

class SyncWhatsAppTemplatesCommand extends Command
{
    protected $signature = 'whatsapp:sync-templates
        {--connection= : Sync only specific connection ID}
        {--account= : Sync only one tenant/account ID}
        {--chunk=50 : Chunk size}
        {--fail-fast : Stop on first failure}';

    protected $description = 'Sync WhatsApp template lifecycle/status from Meta for active connections';

    public function handle(TemplateSyncService $templateSyncService): int
    {
        $query = WhatsAppConnection::query()
            ->where('is_active', true)
            ->whereNotNull('waba_id');

        if ($this->option('connection')) {
            $query->where('id', (int) $this->option('connection'));
        }
        if ($this->option('account')) {
            $query->where('account_id', (int) $this->option('account'));
        }

        $chunk = max(10, (int) $this->option('chunk'));
        $failFast = (bool) $this->option('fail-fast');

        $scanned = 0;
        $ok = 0;
        $failed = 0;

        $query->orderBy('id')->chunk($chunk, function ($connections) use ($templateSyncService, &$scanned, &$ok, &$failed, $failFast) {
            foreach ($connections as $connection) {
                $scanned++;
                try {
                    $templateSyncService->sync($connection);
                    $ok++;
                } catch (\Throwable $e) {
                    $failed++;
                    Log::channel('whatsapp')->warning('Scheduled template sync failed', [
                        'connection_id' => $connection->id,
                        'account_id' => $connection->account_id,
                        'error' => $e->getMessage(),
                    ]);
                    $this->warn("Connection {$connection->id} failed: {$e->getMessage()}");
                    if ($failFast) {
                        return false;
                    }
                }
            }

            return true;
        });

        $this->info("Template sync completed. scanned={$scanned}, ok={$ok}, failed={$failed}");

        return $failed > 0 ? self::FAILURE : self::SUCCESS;
    }
}

