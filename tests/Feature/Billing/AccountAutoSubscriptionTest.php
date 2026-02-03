<?php

namespace Tests\Feature\Billing;

use App\Models\Plan;
use App\Models\Account;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AccountAutoSubscriptionTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        
        // Seed default plans (only if not already seeded)
        if (Plan::count() === 0) {
            $this->artisan('db:seed', ['--class' => 'PlanSeeder']);
        }
    }

    public function test_account_auto_subscribes_to_default_plan(): void
    {
        $defaultPlanKey = env('DEFAULT_PLAN_KEY', 'free');
        $plan = Plan::where('key', $defaultPlanKey)->firstOrFail();

        $account = Account::factory()->create();

        // Simulate account creation (OnboardingController logic)
        $user = $account->owner;
        $account->users()->attach($user->id, ['role' => 'owner']);

        // Enable core modules
        $coreModules = \App\Models\Module::where('is_core', true)->get();
        foreach ($coreModules as $module) {
            \App\Models\AccountModule::create([
                'account_id' => $account->id,
                'module_key' => $module->key,
                'enabled' => true,
            ]);
        }

        // Auto-subscribe (OnboardingController logic)
        $subscriptionService = app(\App\Core\Billing\SubscriptionService::class);
        
        if ($plan->trial_days > 0) {
            $subscriptionService->startTrial($account, $plan, $user);
        } else {
            $subscriptionService->changePlan($account, $plan, $user);
        }

        $account->refresh();

        $this->assertNotNull($account->subscription);
        $this->assertEquals($plan->id, $account->subscription->plan_id);
        
        if ($plan->trial_days > 0) {
            $this->assertEquals('trialing', $account->subscription->status);
            $this->assertNotNull($account->subscription->trial_ends_at);
        } else {
            $this->assertEquals('active', $account->subscription->status);
        }
    }

    public function test_account_with_trial_plan_has_trial_fields(): void
    {
        $plan = Plan::factory()->starter()->create();
        
        $account = Account::factory()->create();
        $user = $account->owner;

        $subscriptionService = app(\App\Core\Billing\SubscriptionService::class);
        $subscriptionService->startTrial($account, $plan, $user);

        $account->refresh();

        $this->assertEquals('trialing', $account->subscription->status);
        $this->assertNotNull($account->subscription->trial_ends_at);
        $this->assertTrue($account->subscription->trial_ends_at->isFuture());
    }
}
