<?php

namespace Tests\Feature\Billing;

use App\Models\Plan;
use App\Models\Subscription;
use App\Models\Account;
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
        $user = $this->actingAsAccountOwner($account);

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
        $user = $this->actingAsAccountOwner($account);

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
        $user = $this->actingAsAccountOwner($account);

        // Mark subscription as canceled
        $account->subscription->update([
            'status' => 'canceled',
            'canceled_at' => now(),
        ]);

        // Try to access dashboard
        $response = $this->get(route('app.dashboard', ['account' => $account->slug]));

        $response->assertStatus(402);
    }
}
