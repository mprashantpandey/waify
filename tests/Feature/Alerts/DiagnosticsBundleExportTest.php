<?php

namespace Tests\Feature\Alerts;

use App\Models\Account;
use App\Models\OperationalAlertEvent;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class DiagnosticsBundleExportTest extends TestCase
{
    use RefreshDatabase;

    public function test_tenant_can_download_diagnostics_bundle_for_alert(): void
    {
        $this->withoutMiddleware();

        $owner = User::factory()->create();
        $account = Account::factory()->create(['owner_id' => $owner->id]);

        $event = OperationalAlertEvent::create([
            'account_id' => $account->id,
            'event_key' => 'whatsapp.webhook.repeated_failures',
            'title' => 'Repeated webhook failures',
            'severity' => 'critical',
            'scope' => 'connection:1',
            'dedupe_key' => 'dedupe_tenant_bundle_1',
            'status' => 'failed',
            'context' => [
                'account_id' => $account->id,
                'connection_id' => 1,
                'correlation_id' => 'req_tenant_bundle_1',
            ],
            'correlation_id' => 'req_tenant_bundle_1',
            'sent_at' => now(),
        ]);

        $response = $this->actingAs($owner)
            ->withSession(['current_account_id' => $account->id])
            ->get(route('app.alerts.bundle', ['event_id' => $event->id]));

        $response->assertStatus(200);
        $response->assertHeader('content-type', 'application/json; charset=UTF-8');

        $json = json_decode($response->streamedContent(), true);
        $this->assertIsArray($json);
        $this->assertSame($event->id, data_get($json, 'trigger_alert.id'));
        $this->assertSame($account->id, data_get($json, 'meta.targets.account_id'));
    }

    public function test_platform_can_download_diagnostics_bundle_for_specific_alert(): void
    {
        $this->withoutMiddleware();

        $user = User::factory()->create();
        $account = Account::factory()->create();

        $event = OperationalAlertEvent::create([
            'account_id' => $account->id,
            'event_key' => 'campaign.error_rate.high',
            'title' => 'High campaign failure rate detected',
            'severity' => 'warning',
            'scope' => 'campaign:22',
            'dedupe_key' => 'dedupe_platform_bundle_1',
            'status' => 'sent',
            'context' => [
                'account_id' => $account->id,
                'campaign_id' => 22,
                'correlation_id' => 'req_platform_bundle_1',
            ],
            'correlation_id' => 'req_platform_bundle_1',
            'sent_at' => now(),
        ]);

        $response = $this->actingAs($user)
            ->get(route('platform.operational-alerts.bundle', ['event_id' => $event->id]));

        $response->assertStatus(200);
        $response->assertHeader('content-type', 'application/json; charset=UTF-8');

        $json = json_decode($response->streamedContent(), true);
        $this->assertIsArray($json);
        $this->assertSame($event->id, data_get($json, 'trigger_alert.id'));
        $this->assertSame($account->id, data_get($json, 'meta.targets.account_id'));
    }

    public function test_tenant_can_download_targeted_diagnostics_bundle_without_alert_id(): void
    {
        $this->withoutMiddleware();

        $owner = User::factory()->create();
        $account = Account::factory()->create(['owner_id' => $owner->id]);

        $response = $this->actingAs($owner)
            ->withSession(['current_account_id' => $account->id])
            ->get(route('app.alerts.bundle', [
                'connection_id' => 5,
                'scope' => 'connection:5',
                'correlation_id' => 'req_target_bundle_1',
            ]));

        $response->assertStatus(200);
        $json = json_decode($response->streamedContent(), true);
        $this->assertIsArray($json);
        $this->assertNull(data_get($json, 'trigger_alert'));
        $this->assertSame($account->id, data_get($json, 'meta.targets.account_id'));
        $this->assertSame(5, data_get($json, 'meta.targets.connection_id'));
    }
}
