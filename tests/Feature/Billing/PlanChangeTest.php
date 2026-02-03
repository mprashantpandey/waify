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
        if (Plan::count() === 0) {
            $this->artisan('db:seed', ['--class' => 'PlanSeeder']);
        }
    }

    public function test_account_owner_can_change_plan(): void
    {
        
        $account = $this->createAccountWithPlan('free');
        $user = $this->actingAsAccountOwner($account);

        $starterPlan = Plan::where('key', 'starter')->firstOrFail();

        $response = $this->post(route('app.billing.switch-plan', [
            'account' => $account->slug,
            'plan' => $starterPlan->id,
        ]));

        $response->assertRedirect();
        
        $account->refresh();
        $this->assertEquals($starterPlan->id, $account->subscription->plan_id);

        // Check billing event
        $this->assertDatabaseHas('billing_events', [
            'account_id' => $account->id,
            'type' => 'plan_changed',
            'actor_id' => $user->id,
        ]);
    }

    public function test_non_owner_cannot_change_plan(): void
    {
        
        $account = $this->createAccountWithPlan('free');
        $otherUser = \App\Models\User::factory()->create();
        $this->actingAs($otherUser);

        $starterPlan = Plan::where('key', 'starter')->firstOrFail();

        $response = $this->post(route('app.billing.switch-plan', [
            'account' => $account->slug,
            'plan' => $starterPlan->id,
        ]));

        $response->assertStatus(403);
    }

    public function test_downgrade_does_not_delete_data(): void
    {
        
        $account = $this->createAccountWithPlan('starter');
        $user = $this->actingAsAccountOwner($account);

        // Create some connections
        \App\Modules\WhatsApp\Models\WhatsAppConnection::factory()->count(2)->create([
            'account_id' => $account->id,
        ]);

        // Downgrade to free (1 connection limit)
        $freePlan = Plan::where('key', 'free')->firstOrFail();
        
        $response = $this->post(route('app.billing.switch-plan', [
            'account' => $account->slug,
            'plan' => $freePlan->id,
        ]));

        $response->assertRedirect();
        
        // Connections should still exist
        $this->assertEquals(2, \App\Modules\WhatsApp\Models\WhatsAppConnection::where('account_id', $account->id)->count());
        
        // But new connections should be blocked
        $response = $this->post(route('app.whatsapp.connections.store', ['account' => $account->slug]), [
            'name' => 'New Connection',
            'phone_number_id' => '999',
            'access_token' => 'token',
        ]);

        $response->assertStatus(402);
    }
}
