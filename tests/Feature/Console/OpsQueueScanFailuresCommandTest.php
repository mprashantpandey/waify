<?php

namespace Tests\Feature\Console;

use App\Models\PlatformSetting;
use App\Services\OperationalAlertService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use Mockery\MockInterface;
use Tests\TestCase;

class OpsQueueScanFailuresCommandTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        Cache::forget('ops:queue:last_failed_job_id');
        PlatformSetting::query()->where('key', 'alerts.queue_failed_jobs_last_id')->delete();
    }

    public function test_command_sends_alert_and_advances_cursor_for_new_failed_jobs(): void
    {
        DB::table('failed_jobs')->insert([
            'uuid' => (string) \Illuminate\Support\Str::uuid(),
            'connection' => 'database',
            'queue' => 'default',
            'payload' => '{"displayName":"App\\\\Jobs\\\\DemoJob"}',
            'exception' => "RuntimeException: Boom\n#0 /app/...",
            'failed_at' => now(),
        ]);

        $this->mock(OperationalAlertService::class, function (MockInterface $mock): void {
            $mock->shouldReceive('send')
                ->once()
                ->withArgs(function (string $eventKey, string $title, array $context, string $severity): bool {
                    return $eventKey === 'queue.failed_jobs.scan'
                        && $title === 'Queued jobs failed (failed_jobs backup scan)'
                        && $severity === 'critical'
                        && ($context['failed_count'] ?? 0) === 1;
                });
        });

        $this->artisan('ops:queue:scan-failures')
            ->assertExitCode(0);

        $this->assertSame(1, (int) Cache::get('ops:queue:last_failed_job_id'));
        $this->assertSame(1, (int) PlatformSetting::get('alerts.queue_failed_jobs_last_id', 0));
    }

    public function test_command_does_not_send_alert_when_no_new_failed_jobs(): void
    {
        Cache::forever('ops:queue:last_failed_job_id', 999);

        $this->mock(OperationalAlertService::class, function (MockInterface $mock): void {
            $mock->shouldNotReceive('send');
        });

        $this->artisan('ops:queue:scan-failures')
            ->expectsOutput('No new failed jobs.')
            ->assertExitCode(0);
    }

    public function test_command_recovers_when_cursor_is_stale_after_failed_jobs_reset(): void
    {
        Cache::forever('ops:queue:last_failed_job_id', 999);
        PlatformSetting::set('alerts.queue_failed_jobs_last_id', '999', 'integer', 'alerts');

        DB::table('failed_jobs')->insert([
            'uuid' => (string) \Illuminate\Support\Str::uuid(),
            'connection' => 'database',
            'queue' => 'default',
            'payload' => '{"displayName":"App\\\\Jobs\\\\DemoJob"}',
            'exception' => "RuntimeException: After reset\n#0 /app/...",
            'failed_at' => now(),
        ]);

        $this->mock(OperationalAlertService::class, function (MockInterface $mock): void {
            $mock->shouldReceive('send')->once();
        });

        $this->artisan('ops:queue:scan-failures')
            ->assertExitCode(0);

        $this->assertSame(1, (int) Cache::get('ops:queue:last_failed_job_id'));
        $this->assertSame(1, (int) PlatformSetting::get('alerts.queue_failed_jobs_last_id', 0));
    }
}
