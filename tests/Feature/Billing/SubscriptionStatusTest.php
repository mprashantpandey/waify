<?php

namespace Tests\Feature\Billing;

use App\Models\Plan;
use App\Models\Subscription;
use App\Models\Workspace;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class SubscriptionStatusTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        if (Plan::count() === 0) {
            $this->artisan('db:seed', ['--class' => 'PlanSeeder']);
        }
    }

    public function test_past_due_subscription_blocks_app_routes(): void
    {
        
        $workspace = $this->createWorkspaceWithPlan('free');
        $user = $this->actingAsWorkspaceOwner($workspace);

        // Mark subscription as past_due
        $workspace->subscription->update([
            'status' => 'past_due',
            'last_payment_failed_at' => now(),
            'last_error' => 'Payment failed',
        ]);

        // Try to access dashboard
        $response = $this->get(route('app.dashboard', ['workspace' => $workspace->slug]));

        $response->assertStatus(402);
        $response->assertSee('Past Due');
    }

    public function test_billing_pages_remain_accessible_when_past_due(): void
    {
        
        $workspace = $this->createWorkspaceWithPlan('free');
        $user = $this->actingAsWorkspaceOwner($workspace);

        // Mark subscription as past_due
        $workspace->subscription->update([
            'status' => 'past_due',
        ]);

        // Billing pages should still be accessible
        $response = $this->get(route('app.billing.index', ['workspace' => $workspace->slug]));
        $response->assertStatus(200);

        $response = $this->get(route('app.billing.plans', ['workspace' => $workspace->slug]));
        $response->assertStatus(200);
    }

    public function test_canceled_subscription_blocks_app_routes(): void
    {
        
        $workspace = $this->createWorkspaceWithPlan('free');
        $user = $this->actingAsWorkspaceOwner($workspace);

        // Mark subscription as canceled
        $workspace->subscription->update([
            'status' => 'canceled',
            'canceled_at' => now(),
        ]);

        // Try to access dashboard
        $response = $this->get(route('app.dashboard', ['workspace' => $workspace->slug]));

        $response->assertStatus(402);
    }
}
