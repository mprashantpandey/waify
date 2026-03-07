<?php

namespace Tests\Unit;

use App\Models\PlatformSetting;
use App\Models\OperationalAlertEvent;
use App\Services\OperationalAlertService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;
use Tests\TestCase;

class OperationalAlertServiceTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        Cache::flush();
        PlatformSetting::set('alerts.dedupe_minutes', 15, 'integer', 'alerts');
        PlatformSetting::set('alerts.webhook_url', 'https://example.com/ops-hook', 'string', 'alerts');
        PlatformSetting::set('alerts.email_to', '', 'string', 'alerts');
        PlatformSetting::set('alerts.slack_webhook_url', '', 'string', 'alerts');
    }

    public function test_dedupe_suppresses_duplicate_queue_failure_alerts_with_same_error(): void
    {
        Http::fake();

        $service = app(OperationalAlertService::class);

        $context = [
            'scope' => 'default:ExampleJob',
            'error' => 'Gateway timeout',
        ];

        $service->send('queue.job_failed', 'Queue job failed', $context, 'critical');
        $service->send('queue.job_failed', 'Queue job failed', $context, 'critical');

        Http::assertSentCount(1);
        $this->assertDatabaseCount('operational_alert_events', 2);
        $this->assertSame('sent', OperationalAlertEvent::query()->orderBy('id')->first()?->status);
        $this->assertSame('skipped', OperationalAlertEvent::query()->latest('id')->first()?->status);
    }

    public function test_dedupe_allows_alerts_for_different_errors_within_same_scope(): void
    {
        Http::fake();

        $service = app(OperationalAlertService::class);

        $service->send('queue.job_failed', 'Queue job failed', [
            'scope' => 'default:ExampleJob',
            'error' => 'Gateway timeout',
        ], 'critical');

        $service->send('queue.job_failed', 'Queue job failed', [
            'scope' => 'default:ExampleJob',
            'error' => 'Connection refused',
        ], 'critical');

        Http::assertSentCount(2);
        $this->assertDatabaseCount('operational_alert_events', 2);
        $this->assertSame(
            ['sent', 'sent'],
            OperationalAlertEvent::orderBy('id')->pluck('status')->all()
        );
    }
}
