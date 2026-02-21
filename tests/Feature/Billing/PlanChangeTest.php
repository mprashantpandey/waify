<?php

namespace Tests\Feature\Billing;

use App\Core\Billing\SubscriptionService;
use App\Models\BillingEvent;
use App\Models\Plan;
use App\Models\Account;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class PlanChangeTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->artisan('db:seed', ['--class' => 'ModuleSeeder']);
        $this->artisan('db:seed', ['--class' => 'PlanSeeder']);
    }

    public function test_account_owner_can_change_plan(): void
    {
        
        $account = $this->createAccountWithPlan('starter');
        $user = $this->actingAsAccountOwner($account);

        $freePlan = Plan::where('key', 'free')->firstOrFail();

        $response = $this->post(route('app.billing.switch-plan', [
            'account' => $account->slug,
            'plan' => $freePlan->id,
        ]));

        $response->assertRedirect();
        
        $account->refresh();
        $this->assertEquals($freePlan->id, $account->subscription->plan_id);

        // Check billing event
        $this->assertDatabaseHas('billing_events', [
            'account_id' => $account->id,
            'type' => 'plan_changed',
            'actor_id' => $user->id,
        ]);
    }

    public function test_non_owner_cannot_change_plan(): void
    {
        
        $account = $this->createAccountWithPlan('starter');
        $otherUser = \App\Models\User::factory()->create();
        $account->users()->attach($otherUser->id, ['role' => 'admin']);
        $this->actingAs($otherUser)->withSession(['current_account_id' => $account->id]);

        $freePlan = Plan::where('key', 'free')->firstOrFail();

        $response = $this->post(route('app.billing.switch-plan', [
            'account' => $account->slug,
            'plan' => $freePlan->id,
        ]));

        $response->assertStatus(403);
    }

    public function test_switching_to_same_plan_is_noop(): void
    {
        $account = $this->createAccountWithPlan('starter');
        $this->actingAsAccountOwner($account);

        $starterPlan = Plan::where('key', 'starter')->firstOrFail();

        $response = $this->post(route('app.billing.switch-plan', [
            'account' => $account->slug,
            'plan' => $starterPlan->id,
        ]));

        $response->assertRedirect(route('app.billing.plans'));
        $response->assertSessionHas('info');

        $account->refresh();
        $this->assertEquals($starterPlan->id, $account->subscription->plan_id);
    }

    public function test_downgrade_is_blocked_when_current_usage_exceeds_target_plan_limits(): void
    {
        
        $account = $this->createAccountWithPlan('starter');
        $this->actingAsAccountOwner($account);

        // Create some connections
        \App\Modules\WhatsApp\Models\WhatsAppConnection::factory()->count(2)->create([
            'account_id' => $account->id,
            'is_active' => true,
        ]);

        // Downgrade to free (1 connection limit)
        $freePlan = Plan::where('key', 'free')->firstOrFail();
        
        $response = $this->post(route('app.billing.switch-plan', [
            'account' => $account->slug,
            'plan' => $freePlan->id,
        ]));

        $response->assertRedirect();
        $response->assertSessionHas('error');

        $account->refresh();
        $this->assertEquals(Plan::where('key', 'starter')->value('id'), $account->subscription->plan_id);
    }
}
