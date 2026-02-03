<?php

namespace Tests\Feature\Billing;

use App\Models\Plan;
use App\Models\Account;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ModuleEntitlementTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        if (Plan::count() === 0) {
            $this->artisan('db:seed', ['--class' => 'PlanSeeder']);
        }
    }

    public function test_free_plan_cannot_access_templates_module(): void
    {
        
        $account = $this->createAccountWithPlan('free');
        $user = $this->actingAsAccountOwner($account);

        // Ensure templates module is NOT in free plan
        $plan = $account->subscription->plan;
        $this->assertNotContains('templates', $plan->modules ?? []);

        // Try to access templates route
        $response = $this->get(route('app.whatsapp.templates.index', ['account' => $account->slug]));

        $response->assertStatus(403);
        $response->assertSee('not available on your current plan');
    }

    public function test_starter_plan_can_access_templates_module(): void
    {
        
        $account = $this->createAccountWithPlan('starter');
        $user = $this->actingAsAccountOwner($account);

        // Enable templates module in account
        \App\Models\AccountModule::create([
            'account_id' => $account->id,
            'module_key' => 'templates',
            'enabled' => true,
        ]);

        // Try to access templates route
        $response = $this->get(route('app.whatsapp.templates.index', ['account' => $account->slug]));

        // Should succeed (200 or redirect, not 403)
        $this->assertNotEquals(403, $response->status());
    }
}
