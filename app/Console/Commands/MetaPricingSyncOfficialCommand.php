<?php

namespace App\Console\Commands;

use App\Core\Billing\MetaPricingSyncService;
use App\Models\PlatformSetting;
use Illuminate\Console\Command;
use Throwable;

class MetaPricingSyncOfficialCommand extends Command
{
    protected $signature = 'meta-pricing:sync-official
        {--source= : HTTP URL or absolute file path for official pricing JSON/CSV feed}
        {--dry-run : Validate source availability only, do not persist}';

    protected $description = 'Sync versioned WhatsApp Meta pricing from an official JSON feed';

    public function handle(MetaPricingSyncService $syncService): int
    {
        $source = (string) ($this->option('source')
            ?: PlatformSetting::get('whatsapp.meta_pricing_sync.feed_url')
            ?: env('META_PRICING_SYNC_URL', ''));

        if ($source === '') {
            $this->error('Missing source. Set --source=... or configure whatsapp.meta_pricing_sync.feed_url (JSON/CSV).');
            return self::FAILURE;
        }

        try {
            if ((bool) $this->option('dry-run')) {
                $this->warn('Dry-run validates source format only (no DB writes).');
                $result = $syncService->syncFromOfficialFeed($source, null, false);
                $this->info(sprintf(
                    'Validated source. Versions found: %d.',
                    $result['total'],
                ));
                return self::SUCCESS;
            }

            $result = $syncService->syncFromOfficialFeed($source, null);
            $this->info(sprintf(
                'Meta pricing sync completed. total=%d created=%d updated=%d',
                $result['total'],
                $result['created'],
                $result['updated']
            ));

            return self::SUCCESS;
        } catch (Throwable $e) {
            PlatformSetting::set('whatsapp.meta_pricing_sync.last_status', 'error', 'string', 'integrations');
            PlatformSetting::set('whatsapp.meta_pricing_sync.last_error', $e->getMessage(), 'string', 'integrations');
            $this->error('Meta pricing sync failed: '.$e->getMessage());

            return self::FAILURE;
        }
    }
}
