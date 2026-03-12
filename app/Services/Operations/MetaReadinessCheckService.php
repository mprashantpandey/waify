<?php

namespace App\Services\Operations;

use App\Models\MetaPricingVersion;
use App\Modules\WhatsApp\Models\WhatsAppConnection;
use App\Modules\WhatsApp\Models\WhatsAppOutboundMessageJob;
use App\Modules\WhatsApp\Models\WhatsAppTemplate;
use App\Modules\WhatsApp\Models\WhatsAppWebhookEvent;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

class MetaReadinessCheckService
{
    /**
     * @return array{summary: array<string,int>, checks: array<int,array<string,mixed>>}
     */
    public function run(): array
    {
        $checks = [
            $this->checkActiveConnections(),
            $this->checkWebhookFreshness(),
            $this->checkWebhookFailures(),
            $this->checkMetadataFreshness(),
            $this->checkTemplateSyncFreshness(),
            $this->checkSendFailureRate(),
            $this->checkFailedJobsBacklog(),
            $this->checkPricingSnapshotCoverage(),
        ];

        $summary = [
            'pass' => 0,
            'warn' => 0,
            'fail' => 0,
        ];

        foreach ($checks as $check) {
            $summary[$check['status']] = ($summary[$check['status']] ?? 0) + 1;
        }

        return [
            'summary' => $summary,
            'checks' => $checks,
        ];
    }

    /** @return array{name:string,status:'pass'|'warn'|'fail',detail:string,meta:array<string,mixed>} */
    private function checkActiveConnections(): array
    {
        $activeConnections = WhatsAppConnection::query()->where('is_active', true)->count();

        if ($activeConnections === 0) {
            return $this->check('active_connections', 'warn', 'No active WhatsApp connections found.', [
                'active_connections' => 0,
            ]);
        }

        return $this->check('active_connections', 'pass', 'Active WhatsApp connections found.', [
            'active_connections' => $activeConnections,
        ]);
    }

    /** @return array{name:string,status:'pass'|'warn'|'fail',detail:string,meta:array<string,mixed>} */
    private function checkWebhookFreshness(): array
    {
        $activeConnectionCount = WhatsAppConnection::query()->where('is_active', true)->count();

        if ($activeConnectionCount === 0) {
            return $this->check('webhook_freshness', 'warn', 'Skipped freshness check because there are no active connections.', [
                'active_connections' => 0,
                'fresh_connections' => 0,
            ]);
        }

        $cutoff = now()->subHours(24);
        $freshConnections = WhatsAppConnection::query()
            ->where('is_active', true)
            ->whereNotNull('webhook_last_received_at')
            ->where('webhook_last_received_at', '>=', $cutoff)
            ->count();

        if ($freshConnections === 0) {
            return $this->check('webhook_freshness', 'fail', 'No active connection received webhook events in the last 24 hours.', [
                'active_connections' => $activeConnectionCount,
                'fresh_connections' => 0,
                'cutoff' => $cutoff->toIso8601String(),
            ]);
        }

        if ($freshConnections < $activeConnectionCount) {
            return $this->check('webhook_freshness', 'warn', 'Some active connections are stale on webhook heartbeat.', [
                'active_connections' => $activeConnectionCount,
                'fresh_connections' => $freshConnections,
                'stale_connections' => $activeConnectionCount - $freshConnections,
                'cutoff' => $cutoff->toIso8601String(),
            ]);
        }

        return $this->check('webhook_freshness', 'pass', 'Webhook heartbeat is fresh for all active connections.', [
            'active_connections' => $activeConnectionCount,
            'fresh_connections' => $freshConnections,
            'cutoff' => $cutoff->toIso8601String(),
        ]);
    }

    /** @return array{name:string,status:'pass'|'warn'|'fail',detail:string,meta:array<string,mixed>} */
    private function checkWebhookFailures(): array
    {
        $windowStart = now()->subHours(24);
        $failedEvents = WhatsAppWebhookEvent::query()
            ->whereNotNull('failed_at')
            ->where('created_at', '>=', $windowStart)
            ->count();

        if ($failedEvents === 0) {
            return $this->check('webhook_failures', 'pass', 'No webhook processing failures in the last 24 hours.', [
                'failed_events_24h' => 0,
            ]);
        }

        $status = $failedEvents >= 25 ? 'fail' : 'warn';

        return $this->check(
            'webhook_failures',
            $status,
            "Webhook failures detected in the last 24 hours ({$failedEvents}).",
            [
                'failed_events_24h' => $failedEvents,
                'window_start' => $windowStart->toIso8601String(),
            ]
        );
    }

    /** @return array{name:string,status:'pass'|'warn'|'fail',detail:string,meta:array<string,mixed>} */
    private function checkMetadataFreshness(): array
    {
        $staleAfterHours = max(1, (int) config('whatsapp.connection.health_stale_after_hours', 24));
        $cutoff = now()->subHours($staleAfterHours);

        $activeConnections = WhatsAppConnection::query()->where('is_active', true)->count();

        if ($activeConnections === 0) {
            return $this->check('connection_metadata_freshness', 'warn', 'Skipped metadata freshness check because there are no active connections.', [
                'active_connections' => 0,
                'stale_connections' => 0,
            ]);
        }

        $staleConnections = WhatsAppConnection::query()
            ->where('is_active', true)
            ->where(function ($query) use ($cutoff) {
                $query->whereNull('health_last_synced_at')
                    ->orWhere('health_last_synced_at', '<', $cutoff)
                    ->orWhere('metadata_sync_status', 'error');
            })
            ->count();

        if ($staleConnections === 0) {
            return $this->check('connection_metadata_freshness', 'pass', 'Connection metadata is fresh.', [
                'active_connections' => $activeConnections,
                'stale_connections' => 0,
                'stale_after_hours' => $staleAfterHours,
            ]);
        }

        $status = $staleConnections === $activeConnections ? 'fail' : 'warn';

        return $this->check(
            'connection_metadata_freshness',
            $status,
            "{$staleConnections} active connection(s) have stale or failed metadata sync.",
            [
                'active_connections' => $activeConnections,
                'stale_connections' => $staleConnections,
                'stale_after_hours' => $staleAfterHours,
            ]
        );
    }

    /** @return array{name:string,status:'pass'|'warn'|'fail',detail:string,meta:array<string,mixed>} */
    private function checkTemplateSyncFreshness(): array
    {
        $staleAfterHours = max(1, (int) config('whatsapp.templates.stale_after_hours', 24));
        $cutoff = now()->subHours($staleAfterHours);

        $sendableTemplates = WhatsAppTemplate::query()
            ->whereIn('status', ['approved'])
            ->where(function ($query) {
                $query->whereNull('is_archived')->orWhere('is_archived', false);
            })
            ->where(function ($query) {
                $query->whereNull('is_remote_deleted')->orWhere('is_remote_deleted', false);
            });

        $totalSendable = (clone $sendableTemplates)->count();

        if ($totalSendable === 0) {
            return $this->check('template_sync_freshness', 'warn', 'No sendable templates found to evaluate freshness.', [
                'sendable_templates' => 0,
                'stale_templates' => 0,
            ]);
        }

        $staleTemplates = (clone $sendableTemplates)
            ->where(function ($query) use ($cutoff) {
                $query->whereNull('last_meta_sync_at')
                    ->orWhere('last_meta_sync_at', '<', $cutoff)
                    ->orWhereNotNull('last_meta_error');
            })
            ->count();

        if ($staleTemplates === 0) {
            return $this->check('template_sync_freshness', 'pass', 'Template sync is fresh for sendable templates.', [
                'sendable_templates' => $totalSendable,
                'stale_templates' => 0,
                'stale_after_hours' => $staleAfterHours,
            ]);
        }

        $status = $staleTemplates === $totalSendable ? 'fail' : 'warn';

        return $this->check(
            'template_sync_freshness',
            $status,
            "{$staleTemplates} sendable template(s) are stale or have sync errors.",
            [
                'sendable_templates' => $totalSendable,
                'stale_templates' => $staleTemplates,
                'stale_after_hours' => $staleAfterHours,
            ]
        );
    }

    /** @return array{name:string,status:'pass'|'warn'|'fail',detail:string,meta:array<string,mixed>} */
    private function checkSendFailureRate(): array
    {
        $windowStart = now()->subHour();

        $base = WhatsAppOutboundMessageJob::query()
            ->where('created_at', '>=', $windowStart);

        $total = (clone $base)->count();
        if ($total === 0) {
            return $this->check('send_failure_rate', 'warn', 'No outbound jobs in the last hour.', [
                'window_start' => $windowStart->toIso8601String(),
                'total_jobs' => 0,
                'failed_jobs' => 0,
                'failed_ratio' => 0,
            ]);
        }

        $failed = (clone $base)->where('status', 'failed')->count();
        $ratio = $failed / max(1, $total);

        if ($failed === 0) {
            return $this->check('send_failure_rate', 'pass', 'No outbound failures in the last hour.', [
                'window_start' => $windowStart->toIso8601String(),
                'total_jobs' => $total,
                'failed_jobs' => 0,
                'failed_ratio' => 0,
            ]);
        }

        $status = $ratio >= 0.4 ? 'fail' : 'warn';

        return $this->check(
            'send_failure_rate',
            $status,
            sprintf('Outbound failures in last hour: %d/%d (%.1f%%).', $failed, $total, $ratio * 100),
            [
                'window_start' => $windowStart->toIso8601String(),
                'total_jobs' => $total,
                'failed_jobs' => $failed,
                'failed_ratio' => round($ratio, 4),
            ]
        );
    }

    /** @return array{name:string,status:'pass'|'warn'|'fail',detail:string,meta:array<string,mixed>} */
    private function checkFailedJobsBacklog(): array
    {
        if (!Schema::hasTable('failed_jobs')) {
            return $this->check('failed_jobs_backlog', 'warn', 'failed_jobs table is not available.', [
                'failed_jobs' => 0,
            ]);
        }

        $failedJobs = DB::table('failed_jobs')->count();

        if ($failedJobs === 0) {
            return $this->check('failed_jobs_backlog', 'pass', 'No queued job failures in failed_jobs.', [
                'failed_jobs' => 0,
            ]);
        }

        $status = $failedJobs >= 100 ? 'fail' : 'warn';

        return $this->check('failed_jobs_backlog', $status, "failed_jobs backlog has {$failedJobs} row(s).", [
            'failed_jobs' => $failedJobs,
        ]);
    }

    /** @return array{name:string,status:'pass'|'warn'|'fail',detail:string,meta:array<string,mixed>} */
    private function checkPricingSnapshotCoverage(): array
    {
        $latest = MetaPricingVersion::query()
            ->where('provider', 'meta')
            ->orderByDesc('effective_from')
            ->first();

        if (!$latest) {
            return $this->check('pricing_snapshot_coverage', 'fail', 'No Meta pricing snapshot found.', [
                'latest_effective_from' => null,
            ]);
        }

        if ($latest->effective_from && $latest->effective_from->isFuture()) {
            return $this->check('pricing_snapshot_coverage', 'warn', 'Latest Meta pricing snapshot is not yet effective.', [
                'latest_effective_from' => $latest->effective_from->toDateString(),
                'version_id' => $latest->id,
            ]);
        }

        return $this->check('pricing_snapshot_coverage', 'pass', 'Meta pricing snapshot is available.', [
            'latest_effective_from' => $latest->effective_from?->toDateString(),
            'version_id' => $latest->id,
        ]);
    }

    /** @return array{name:string,status:'pass'|'warn'|'fail',detail:string,meta:array<string,mixed>} */
    private function check(string $name, string $status, string $detail, array $meta): array
    {
        return [
            'name' => $name,
            'status' => $status,
            'detail' => $detail,
            'meta' => $meta,
        ];
    }
}
