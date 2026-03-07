<?php

namespace Tests\Feature\Platform;

use App\Models\OperationalAlertEvent;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Artisan;
use Tests\TestCase;

class OperationalAlertsTest extends TestCase
{
    use RefreshDatabase;

    public function test_super_admin_can_view_operational_alerts_page(): void
    {
        $superAdmin = User::factory()->create([
            'is_platform_admin' => true,
        ]);

        OperationalAlertEvent::create([
            'event_key' => 'queue.job_failed',
            'title' => 'Queue job failed',
            'severity' => 'critical',
            'scope' => 'default:JobA',
            'dedupe_key' => 'ops-alert:test-1',
            'status' => 'sent',
            'channels' => ['email' => 'sent'],
            'context' => ['error' => 'boom'],
            'sent_at' => now(),
        ]);

        $response = $this->actingAs($superAdmin)
            ->get(route('platform.operational-alerts.index'));

        $response->assertStatus(200);
        $response->assertInertia(fn ($page) => $page
            ->component('Platform/OperationalAlerts/Index')
            ->has('events.data', 1)
            ->where('events.data.0.event_key', 'queue.job_failed')
        );
    }

    public function test_non_super_admin_cannot_view_operational_alerts_page(): void
    {
        $user = User::factory()->create([
            'is_platform_admin' => false,
        ]);

        $response = $this->actingAs($user)
            ->get(route('platform.operational-alerts.index'));

        $response->assertStatus(403);
    }

    public function test_super_admin_can_trigger_test_alert_from_platform_ui(): void
    {
        $superAdmin = User::factory()->create([
            'is_platform_admin' => true,
        ]);

        Artisan::spy();

        $response = $this->actingAs($superAdmin)
            ->post(route('platform.operational-alerts.test'));

        $response->assertRedirect();
        $response->assertSessionHas('success', 'Test operational alert dispatched.');

        Artisan::shouldHaveReceived('call')
            ->once()
            ->withArgs(function (string $command, array $params): bool {
                return $command === 'ops:alert:test'
                    && array_key_exists('--scope', $params)
                    && str_starts_with((string) $params['--scope'], 'platform-ui-');
            });
    }

    public function test_super_admin_can_acknowledge_operational_alert(): void
    {
        $superAdmin = User::factory()->create([
            'is_platform_admin' => true,
        ]);

        $event = OperationalAlertEvent::create([
            'event_key' => 'queue.job_failed',
            'title' => 'Queue job failed',
            'severity' => 'critical',
            'scope' => 'default:JobA',
            'dedupe_key' => 'ops-alert:test-ack',
            'status' => 'failed',
            'channels' => ['webhook' => 'failed:http_500'],
            'context' => ['error' => 'boom'],
            'sent_at' => now(),
        ]);

        $response = $this->actingAs($superAdmin)
            ->post(route('platform.operational-alerts.acknowledge', ['event' => $event->id]), [
                'resolve_note' => 'Handled by queue restart',
            ]);

        $response->assertRedirect();
        $response->assertSessionHas('success', 'Operational alert acknowledged.');

        $event->refresh();
        $this->assertNotNull($event->acknowledged_at);
        $this->assertSame($superAdmin->id, $event->acknowledged_by);
        $this->assertSame('Handled by queue restart', $event->resolve_note);
    }

    public function test_super_admin_can_bulk_acknowledge_operational_alerts(): void
    {
        $superAdmin = User::factory()->create([
            'is_platform_admin' => true,
        ]);

        $first = OperationalAlertEvent::create([
            'event_key' => 'queue.job_failed',
            'title' => 'Queue A failed',
            'severity' => 'critical',
            'scope' => 'default:A',
            'dedupe_key' => 'ops-alert:bulk-a',
            'status' => 'failed',
            'channels' => ['webhook' => 'failed:http_500'],
            'context' => ['error' => 'a'],
            'sent_at' => now(),
        ]);
        $second = OperationalAlertEvent::create([
            'event_key' => 'queue.job_failed',
            'title' => 'Queue B failed',
            'severity' => 'critical',
            'scope' => 'default:B',
            'dedupe_key' => 'ops-alert:bulk-b',
            'status' => 'failed',
            'channels' => ['webhook' => 'failed:http_500'],
            'context' => ['error' => 'b'],
            'sent_at' => now(),
        ]);

        $response = $this->actingAs($superAdmin)
            ->post(route('platform.operational-alerts.acknowledge.bulk'), [
                'ids' => [$first->id, $second->id],
                'resolve_note' => 'Bulk-acked after incident review',
            ]);

        $response->assertRedirect();
        $response->assertSessionHas('success', 'Acknowledged 2 alert(s).');

        $this->assertNotNull($first->fresh()->acknowledged_at);
        $this->assertNotNull($second->fresh()->acknowledged_at);
        $this->assertSame('Bulk-acked after incident review', $first->fresh()->resolve_note);
        $this->assertSame('Bulk-acked after incident review', $second->fresh()->resolve_note);
    }

    public function test_super_admin_can_export_operational_alerts_csv(): void
    {
        $superAdmin = User::factory()->create([
            'is_platform_admin' => true,
        ]);

        OperationalAlertEvent::create([
            'event_key' => 'queue.job_failed',
            'title' => 'Queue export failed',
            'severity' => 'critical',
            'scope' => 'default:export',
            'dedupe_key' => 'ops-alert:export',
            'status' => 'failed',
            'channels' => ['webhook' => 'failed:http_500'],
            'context' => ['error' => 'export'],
            'sent_at' => now(),
        ]);

        $response = $this->actingAs($superAdmin)
            ->get(route('platform.operational-alerts.export'));

        $response->assertStatus(200);
        $response->assertHeader('content-type', 'text/csv; charset=UTF-8');
        $response->assertHeader('content-disposition');
        $this->assertStringContainsString('queue.job_failed', $response->streamedContent());
    }
}
