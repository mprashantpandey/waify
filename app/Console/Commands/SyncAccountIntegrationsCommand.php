<?php

namespace App\Console\Commands;

use App\Jobs\SyncAccountIntegration;
use App\Models\AccountIntegration;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Bus;

class SyncAccountIntegrationsCommand extends Command
{
    protected $signature = 'integrations:sync {--provider=} {--account=} {--limit=25} {--fail-on-error : Return a non-zero exit code when one integration fails}';

    protected $description = 'Sync connected workspace integrations that support real import handlers.';

    public function handle(): int
    {
        $providers = ['shopify', 'woocommerce', 'meta-catalog', 'meta-leads', 'google-sheets', 'google-calendar'];
        $limit = max(1, min(100, (int) $this->option('limit')));

        $query = AccountIntegration::query()
            ->where('status', 'connected')
            ->whereIn('provider', $providers)
            ->where(function ($query) {
                $query->where('config->auto_sync', true)
                    ->orWhereNull('config->auto_sync');
            });

        if ($this->option('provider')) {
            $query->where('provider', (string) $this->option('provider'));
        }

        if ($this->option('account')) {
            $query->where('account_id', (int) $this->option('account'));
        }

        $integrations = $query
            ->orderByRaw('last_sync_at is not null')
            ->orderBy('last_sync_at')
            ->limit($limit)
            ->get();

        $synced = 0;
        $failed = 0;

        foreach ($integrations as $integration) {
            try {
                $result = Bus::dispatchSync(new SyncAccountIntegration($integration->id, 'scheduled'));
                $synced++;
                $this->line("Synced {$integration->provider} for account {$integration->account_id}: ".json_encode($result));
            } catch (\Throwable $e) {
                $failed++;
                $integration->update([
                    'health' => 'error',
                    'last_error' => $e->getMessage(),
                ]);
                $this->error("Failed {$integration->provider} for account {$integration->account_id}: {$e->getMessage()}");
            }
        }

        $this->info("Integration sync complete. Synced: {$synced}. Failed: {$failed}.");

        return $failed > 0 && $this->option('fail-on-error') ? self::FAILURE : self::SUCCESS;
    }
}
