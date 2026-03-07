<?php

namespace App\Console\Commands;

use App\Models\PlatformSetting;
use App\Services\OperationalAlertService;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Str;

class OpsQueueScanFailuresCommand extends Command
{
    protected $signature = 'ops:queue:scan-failures {--limit=50 : Max failed_jobs rows processed per run}';
    protected $description = 'Scan failed_jobs as a backup and alert ops for newly failed queued jobs';

    public function handle(OperationalAlertService $alerts): int
    {
        if (!Schema::hasTable('failed_jobs')) {
            $this->line('failed_jobs table not found; skipping.');
            return self::SUCCESS;
        }

        $limit = max(1, min(500, (int) $this->option('limit')));
        $cursorKey = 'ops:queue:last_failed_job_id';
        $lastSeenId = (int) Cache::get($cursorKey, (int) PlatformSetting::get('alerts.queue_failed_jobs_last_id', 0));
        $maxId = (int) DB::table('failed_jobs')->max('id');

        // If failed_jobs table was truncated and cursor is stale, recover automatically.
        if ($lastSeenId > $maxId) {
            $lastSeenId = 0;
            Cache::forever($cursorKey, 0);
            PlatformSetting::set('alerts.queue_failed_jobs_last_id', '0', 'integer', 'alerts');
        }

        $rows = DB::table('failed_jobs')
            ->where('id', '>', $lastSeenId)
            ->orderBy('id')
            ->limit($limit)
            ->get(['id', 'uuid', 'connection', 'queue', 'exception', 'failed_at']);

        if ($rows->isEmpty()) {
            $this->line('No new failed jobs.');
            return self::SUCCESS;
        }

        $batchMaxId = (int) $rows->max('id');
        Cache::forever($cursorKey, $batchMaxId);
        PlatformSetting::set('alerts.queue_failed_jobs_last_id', (string) $batchMaxId, 'integer', 'alerts');

        $samples = $rows->take(5)->map(function ($row) {
            $firstLine = Str::of((string) $row->exception)->before("\n")->limit(180)->value();
            return [
                'id' => (int) $row->id,
                'uuid' => (string) $row->uuid,
                'connection' => (string) $row->connection,
                'queue' => (string) $row->queue,
                'error' => $firstLine,
                'failed_at' => (string) $row->failed_at,
            ];
        })->values()->all();

        $alerts->send(
            eventKey: 'queue.failed_jobs.scan',
            title: 'Queued jobs failed (failed_jobs backup scan)',
            severity: 'critical',
            context: [
                'scope' => "failed_jobs:{$lastSeenId}-{$maxId}",
                'failed_count' => $rows->count(),
                'cursor_from' => $lastSeenId,
                'cursor_to' => $batchMaxId,
                'sample' => $samples,
            ],
        );

        $this->info("Alert dispatched for {$rows->count()} failed job(s). Cursor moved to ID {$batchMaxId}.");

        return self::SUCCESS;
    }
}
