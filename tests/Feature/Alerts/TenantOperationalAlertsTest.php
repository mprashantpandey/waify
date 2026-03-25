<?php

namespace Tests\Feature\Alerts;

use App\Models\Account;
use App\Models\OperationalAlertEvent;
use App\Models\User;
use App\Models\Plan;
use App\Services\OperationalAlertService;
use App\Core\Billing\SubscriptionService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class TenantOperationalAlertsTest extends TestCase
{
    use RefreshDatabase;

    public function test_alert_service_persists_account_and_correlation_from_context(): void
    {
        $account = Account::factory()->create();

        app(OperationalAlertService::class)->send(
            eventKey: 'test.tenant.alert',
            title: 'Tenant alert test',
            context: [
                'scope' => 'connection:1',
                'account_id' => $account->id,
                'correlation_id' => 'req_12345',
                'error' => 'sample',
            ],
            severity: 'warning'
        );

        $this->assertDatabaseHas('operational_alert_events', [
            'event_key' => 'test.tenant.alert',
            'account_id' => $account->id,
            'correlation_id' => 'req_12345',
        ]);
    }

    public function test_tenant_alert_center_shows_only_current_account_alerts(): void
    {
        $owner = User::factory()->create();
        $accountA = Account::factory()->create(['owner_id' => $owner->id]);
        $accountB = Account::factory()->create();
        $accountA->users()->attach($owner->id, ['role' => 'owner']);

        $this->artisan('db:seed', ['--class' => 'ModuleSeeder']);
        $this->artisan('db:seed', ['--class' => 'PlanSeeder']);
        $starter = Plan::where('key', 'starter')->firstOrFail();
        app(SubscriptionService::class)->changePlan($accountA, $starter, $owner);

        OperationalAlertEvent::create([
            'event_key' => 'tenant.a',
            'title' => 'Account A alert',
            'severity' => 'warning',
            'scope' => 'connection:1',
            'dedupe_key' => 'a_1',
            'status' => 'sent',
            'account_id' => $accountA->id,
            'context' => ['account_id' => $accountA->id],
            'sent_at' => now(),
        ]);
        OperationalAlertEvent::create([
            'event_key' => 'tenant.b',
            'title' => 'Account B alert',
            'severity' => 'warning',
            'scope' => 'connection:2',
            'dedupe_key' => 'b_1',
            'status' => 'sent',
            'account_id' => $accountB->id,
            'context' => ['account_id' => $accountB->id],
            'sent_at' => now(),
        ]);

        $response = $this->actingAs($owner)
            ->withSession(['current_account_id' => $accountA->id])
            ->get(route('app.alerts.index'));

        $response->assertForbidden();
    }

    public function test_platform_support_can_open_tenant_alert_center_while_impersonating(): void
    {
        $owner = User::factory()->create();
        $account = Account::factory()->create(['owner_id' => $owner->id]);
        $account->users()->attach($owner->id, ['role' => 'owner']);

        $this->artisan('db:seed', ['--class' => 'ModuleSeeder']);
        $this->artisan('db:seed', ['--class' => 'PlanSeeder']);
        $starter = Plan::where('key', 'starter')->firstOrFail();
        app(SubscriptionService::class)->changePlan($account, $starter, $owner);

        OperationalAlertEvent::create([
            'event_key' => 'tenant.a',
            'title' => 'Account A alert',
            'severity' => 'warning',
            'scope' => 'connection:1',
            'dedupe_key' => 'a_1',
            'status' => 'sent',
            'account_id' => $account->id,
            'context' => ['account_id' => $account->id],
            'sent_at' => now(),
        ]);

        $response = $this->actingAs($owner)
            ->withSession([
                'current_account_id' => $account->id,
                'impersonator_id' => 999,
                'impersonator_is_super_admin' => true,
            ])
            ->get(route('app.alerts.index'));

        $response->assertOk();
    }
}
