<?php

namespace Tests\Feature\Billing;

use App\Models\Plan;
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

        $freePlan = Plan::factory()->state([
            'key' => 'internal_admin_assigned',
            'price_monthly' => 0,
            'price_yearly' => 0,
            'limits' => ['whatsapp_connections' => 1],
            'modules' => ['whatsapp.cloud'],
            'is_public' => false,
            'is_active' => true,
        ])->create();

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

        $freePlan = Plan::factory()->state([
            'key' => 'internal_zero_amount',
            'price_monthly' => 0,
            'price_yearly' => 0,
            'limits' => ['whatsapp_connections' => 2],
            'modules' => ['whatsapp.cloud'],
            'is_public' => false,
            'is_active' => true,
        ])->create();

        $response = $this->post(route('app.billing.switch-plan', [
            'account' => $account->slug,
            'plan' => $freePlan->id,
        ]));

        $response->assertStatus(403);
    }

    public function test_account_owner_cannot_self_service_enterprise_plan(): void
    {
        $account = $this->createAccountWithPlan('starter');
        $this->actingAsAccountOwner($account);
        $enterprisePlan = Plan::where('key', 'enterprise')->firstOrFail();

        $response = $this->post(route('app.billing.switch-plan', [
            'account' => $account->slug,
            'plan' => $enterprisePlan->id,
        ]));

        $response->assertStatus(403);

        $account->refresh();
        $this->assertEquals(Plan::where('key', 'starter')->value('id'), $account->subscription->plan_id);
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

        $response->assertRedirect(route('app.billing.index', ['tab' => 'plans']));
        $response->assertSessionHas('info');

        $account->refresh();
        $this->assertEquals($starterPlan->id, $account->subscription->plan_id);
    }

    public function test_owner_can_renew_same_zero_amount_plan_after_billing_period_ended(): void
    {
        $renewalPlan = Plan::factory()->state([
            'key' => 'renewable_zero_amount',
            'price_monthly' => 0,
            'price_yearly' => 0,
            'limits' => ['whatsapp_connections' => 2],
            'modules' => ['whatsapp.cloud'],
            'is_public' => false,
            'is_active' => true,
        ])->create();
        $account = $this->createAccountWithPlan($renewalPlan->key);
        $user = $this->actingAsAccountOwner($account);
        $freePlan = $renewalPlan;

        $account->subscription->update([
            'status' => 'past_due',
            'current_period_start' => now()->subMonths(2),
            'current_period_end' => now()->subDay(),
            'last_payment_failed_at' => now()->subDay(),
            'last_error' => 'Subscription period ended. Renew to continue.',
        ]);

        $response = $this->post(route('app.billing.switch-plan', [
            'account' => $account->slug,
            'plan' => $freePlan->id,
        ]));

        $response->assertRedirect(route('app.billing.index', ['tab' => 'plans']));
        $response->assertSessionHas('success', 'Plan renewed successfully.');

        $account->refresh();
        $subscription = $account->subscription;

        $this->assertEquals($freePlan->id, $subscription->plan_id);
        $this->assertEquals('active', $subscription->status);
        $this->assertNull($subscription->last_error);
        $this->assertNull($subscription->last_payment_failed_at);
        $this->assertFalse((bool) $subscription->cancel_at_period_end);
        $this->assertTrue($subscription->current_period_end->isFuture());

        $this->assertDatabaseHas('billing_events', [
            'account_id' => $account->id,
            'type' => 'subscription_renewed',
            'actor_id' => $user->id,
        ]);
    }

    public function test_owner_can_renew_same_zero_amount_plan_after_cancellation(): void
    {
        $renewalPlan = Plan::factory()->state([
            'key' => 'renewable_zero_amount',
            'price_monthly' => 0,
            'price_yearly' => 0,
            'limits' => ['whatsapp_connections' => 2],
            'modules' => ['whatsapp.cloud'],
            'is_public' => false,
            'is_active' => true,
        ])->create();
        $account = $this->createAccountWithPlan($renewalPlan->key);
        $this->actingAsAccountOwner($account);
        $freePlan = $renewalPlan;

        $account->subscription->update([
            'status' => 'canceled',
            'current_period_end' => now()->subDay(),
            'cancel_at_period_end' => false,
            'canceled_at' => now()->subDay(),
            'last_error' => 'Canceled.',
        ]);

        $response = $this->post(route('app.billing.switch-plan', [
            'account' => $account->slug,
            'plan' => $freePlan->id,
        ]));

        $response->assertRedirect(route('app.billing.index', ['tab' => 'plans']));
        $response->assertSessionHas('success', 'Plan renewed successfully.');

        $account->refresh();
        $this->assertEquals('active', $account->subscription->status);
        $this->assertNull($account->subscription->canceled_at);
        $this->assertTrue($account->subscription->current_period_end->isFuture());
    }

    public function test_downgrade_is_blocked_when_current_usage_exceeds_target_plan_limits(): void
    {

        $account = $this->createAccountWithPlan('pro');
        $this->actingAsAccountOwner($account);

        // Create usage above the starter plan's connection limit.
        \App\Modules\WhatsApp\Models\WhatsAppConnection::factory()->count(3)->create([
            'account_id' => $account->id,
            'is_active' => true,
        ]);

        $freePlan = Plan::factory()->state([
            'key' => 'limited_internal_zero_amount',
            'price_monthly' => 0,
            'price_yearly' => 0,
            'limits' => ['whatsapp_connections' => 2],
            'modules' => ['whatsapp.cloud'],
            'is_public' => false,
            'is_active' => true,
        ])->create();

        $response = $this->post(route('app.billing.switch-plan', [
            'account' => $account->slug,
            'plan' => $freePlan->id,
        ]));

        $response->assertRedirect();
        $response->assertSessionHas('error');

        $account->refresh();
        $this->assertEquals(Plan::where('key', 'pro')->value('id'), $account->subscription->plan_id);
    }
}
