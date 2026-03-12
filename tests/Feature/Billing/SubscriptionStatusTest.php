<?php

namespace Tests\Feature\Billing;

use App\Models\Plan;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class SubscriptionStatusTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->artisan('db:seed', ['--class' => 'ModuleSeeder']);
        $this->artisan('db:seed', ['--class' => 'PlanSeeder']);
    }

    public function test_past_due_subscription_blocks_app_routes(): void
    {
        $account = $this->createAccountWithPlan('free');
        $this->actingAsAccountOwner($account);

        // Mark subscription as past_due
        $account->subscription->update([
            'status' => 'past_due',
            'last_payment_failed_at' => now(),
            'last_error' => 'Payment failed',
        ]);

        // Try to access dashboard
        $response = $this->get(route('app.dashboard', ['account' => $account->slug]));

        $response->assertStatus(402);
    }

    public function test_billing_pages_remain_accessible_when_past_due(): void
    {
        $account = $this->createAccountWithPlan('free');
        $this->actingAsAccountOwner($account);

        // Mark subscription as past_due
        $account->subscription->update([
            'status' => 'past_due',
        ]);

        // Billing pages should still be accessible
        $response = $this->get(route('app.billing.index', ['account' => $account->slug]));
        $response->assertStatus(200);

        $response = $this->get(route('app.billing.plans', ['account' => $account->slug]));
        $response->assertStatus(200);
    }

    public function test_canceled_subscription_blocks_app_routes(): void
    {
        $account = $this->createAccountWithPlan('free');
        $this->actingAsAccountOwner($account);

        // Mark subscription as canceled
        $account->subscription->update([
            'status' => 'canceled',
            'canceled_at' => now(),
            'current_period_end' => now()->subMinute(),
        ]);

        // Try to access dashboard
        $response = $this->get(route('app.dashboard', ['account' => $account->slug]));

        $response->assertStatus(402);
    }

    public function test_trial_active_subscription_allows_app_routes(): void
    {
        $account = $this->createAccountWithPlan('starter');
        $this->actingAsAccountOwner($account);

        $account->subscription->update([
            'status' => 'trialing',
            'trial_ends_at' => now()->addDays(3),
        ]);

        $response = $this->get(route('app.dashboard', ['account' => $account->slug]));

        $response->assertOk();
    }

    public function test_trial_expired_state_is_normalized_to_past_due_and_blocks_routes(): void
    {
        $account = $this->createAccountWithPlan('starter');
        $this->actingAsAccountOwner($account);

        $account->subscription->update([
            'status' => 'past_due',
            'trial_ends_at' => now()->subDay(),
            'last_error' => 'Trial ended. Upgrade plan to continue.',
        ]);

        $response = $this->get(route('app.dashboard', ['account' => $account->slug]));

        $response->assertStatus(402);
    }

    public function test_canceled_subscription_in_grace_period_allows_app_routes(): void
    {
        $account = $this->createAccountWithPlan('free');
        $this->actingAsAccountOwner($account);

        $account->subscription->update([
            'status' => 'canceled',
            'canceled_at' => now(),
            'current_period_end' => now()->addDays(7),
        ]);

        $response = $this->get(route('app.dashboard', ['account' => $account->slug]));

        $response->assertOk();
    }

    public function test_renewal_restores_dashboard_access_after_past_due(): void
    {
        $account = $this->createAccountWithPlan('free');
        $this->actingAsAccountOwner($account);

        $account->subscription->update([
            'status' => 'past_due',
            'last_error' => 'Payment failed',
            'last_payment_failed_at' => now(),
        ]);

        $blocked = $this->get(route('app.dashboard', ['account' => $account->slug]));
        $blocked->assertStatus(402);

        $account->subscription->update([
            'status' => 'active',
            'last_error' => null,
            'last_payment_failed_at' => null,
            'current_period_end' => now()->addDays(30),
        ]);

        $restored = $this->get(route('app.dashboard', ['account' => $account->slug]));
        $restored->assertOk();
    }

    public function test_blocked_accounts_can_still_access_billing_support_and_profile_routes(): void
    {
        $account = $this->createAccountWithPlan('free');
        $this->actingAsAccountOwner($account);

        $account->subscription->update([
            'status' => 'past_due',
            'last_error' => 'Payment failed',
        ]);

        $this->get(route('app.billing.index', ['account' => $account->slug]))->assertOk();
        $this->get(route('app.billing.plans', ['account' => $account->slug]))->assertOk();
        $this->get(route('app.support.index', ['account' => $account->slug]))->assertOk();
        $this->get(route('profile.edit'))->assertOk();
    }

    public function test_no_subscription_redirects_to_billing_plans_for_protected_routes(): void
    {
        $account = \App\Models\Account::factory()->create();
        $this->actingAsAccountOwner($account);

        $response = $this->get(route('app.dashboard', ['account' => $account->slug]));

        $response->assertRedirect(route('app.billing.plans'));
    }
}
