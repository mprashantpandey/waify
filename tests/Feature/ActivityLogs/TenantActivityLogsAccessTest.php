<?php

namespace Tests\Feature\ActivityLogs;

use App\Core\Billing\SubscriptionService;
use App\Models\Account;
use App\Models\Plan;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class TenantActivityLogsAccessTest extends TestCase
{
    use RefreshDatabase;

    public function test_tenant_user_cannot_open_activity_logs(): void
    {
        $owner = User::factory()->create();
        $account = Account::factory()->create(['owner_id' => $owner->id]);
        $account->users()->attach($owner->id, ['role' => 'owner']);

        $this->artisan('db:seed', ['--class' => 'ModuleSeeder']);
        $this->artisan('db:seed', ['--class' => 'PlanSeeder']);
        $starter = Plan::where('key', 'starter')->firstOrFail();
        app(SubscriptionService::class)->changePlan($account, $starter, $owner);

        $response = $this->actingAs($owner)
            ->withSession(['current_account_id' => $account->id])
            ->get(route('app.activity-logs'));

        $response->assertForbidden();
    }

    public function test_platform_support_can_open_activity_logs_while_impersonating(): void
    {
        $owner = User::factory()->create();
        $account = Account::factory()->create(['owner_id' => $owner->id]);
        $account->users()->attach($owner->id, ['role' => 'owner']);

        $this->artisan('db:seed', ['--class' => 'ModuleSeeder']);
        $this->artisan('db:seed', ['--class' => 'PlanSeeder']);
        $starter = Plan::where('key', 'starter')->firstOrFail();
        app(SubscriptionService::class)->changePlan($account, $starter, $owner);

        $response = $this->actingAs($owner)
            ->withSession([
                'current_account_id' => $account->id,
                'impersonator_id' => 999,
                'impersonator_is_super_admin' => true,
            ])
            ->get(route('app.activity-logs'));

        $response->assertOk();
    }
}
