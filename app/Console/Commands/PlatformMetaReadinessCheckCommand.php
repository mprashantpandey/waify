<?php

namespace App\Console\Commands;

use App\Services\Operations\MetaReadinessCheckService;
use Illuminate\Console\Command;

class PlatformMetaReadinessCheckCommand extends Command
{
    protected $signature = 'platform:meta-readiness-check {--json : Output machine-readable JSON only}';

    protected $description = 'Run platform-level Meta readiness checks (webhooks, sync freshness, queue and pricing baselines)';

    public function handle(MetaReadinessCheckService $service): int
    {
        $result = $service->run();
        $summary = $result['summary'];
        $checks = $result['checks'];

        if ((bool) $this->option('json')) {
            $this->line(json_encode([
                'generated_at' => now()->toIso8601String(),
                'summary' => $summary,
                'checks' => $checks,
            ], JSON_PRETTY_PRINT));

            return ($summary['fail'] ?? 0) > 0 ? self::FAILURE : self::SUCCESS;
        }

        $this->info('Meta readiness check completed.');
        $this->line(sprintf(
            'Summary: pass=%d warn=%d fail=%d',
            (int) ($summary['pass'] ?? 0),
            (int) ($summary['warn'] ?? 0),
            (int) ($summary['fail'] ?? 0)
        ));

        $rows = array_map(function (array $check): array {
            return [
                $check['name'],
                strtoupper($check['status']),
                $check['detail'],
            ];
        }, $checks);

        $this->table(['Check', 'Status', 'Detail'], $rows);

        foreach ($checks as $check) {
            if (!empty($check['meta'])) {
                $this->line(sprintf('- %s meta: %s', $check['name'], json_encode($check['meta'])));
            }
        }

        return ($summary['fail'] ?? 0) > 0 ? self::FAILURE : self::SUCCESS;
    }
}
