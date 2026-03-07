<?php

namespace App\Console\Commands;

use App\Services\OperationalAlertService;
use Illuminate\Console\Command;

class OpsTestAlertCommand extends Command
{
    protected $signature = 'ops:alert:test {--scope=manual : Scope value used for dedupe key}';
    protected $description = 'Send a test operational alert through configured email/webhook/slack channels';

    public function handle(OperationalAlertService $alerts): int
    {
        $scope = (string) $this->option('scope');

        $alerts->send(
            eventKey: 'ops.test_alert',
            title: 'Test operational alert',
            severity: 'info',
            context: [
                'scope' => $scope,
                'source' => 'artisan',
                'host' => gethostname() ?: 'unknown-host',
                'timestamp' => now()->toIso8601String(),
            ]
        );

        $this->info('Test alert dispatched (subject to dedupe window).');

        return self::SUCCESS;
    }
}
