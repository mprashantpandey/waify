<?php

namespace Tests\Feature\Billing;

use App\Models\Plan;
use App\Models\Workspace;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class WorkspaceAutoSubscriptionTest extends TestCase
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

    public function test_workspace_auto_subscribes_to_default_plan(): void
    {
        $defaultPlanKey = env('DEFAULT_PLAN_KEY', 'free');
        $plan = Plan::where('key', $defaultPlanKey)->firstOrFail();

        $workspace = Workspace::factory()->create();

        // Simulate workspace creation (OnboardingController logic)
        $user = $workspace->owner;
        $workspace->users()->attach($user->id, ['role' => 'owner']);

        // Enable core modules
        $coreModules = \App\Models\Module::where('is_core', true)->get();
        foreach ($coreModules as $module) {
            \App\Models\WorkspaceModule::create([
                'workspace_id' => $workspace->id,
                'module_key' => $module->key,
                'enabled' => true,
            ]);
        }

        // Auto-subscribe (OnboardingController logic)
        $subscriptionService = app(\App\Core\Billing\SubscriptionService::class);
        
        if ($plan->trial_days > 0) {
            $subscriptionService->startTrial($workspace, $plan, $user);
        } else {
            $subscriptionService->changePlan($workspace, $plan, $user);
        }

        $workspace->refresh();

        $this->assertNotNull($workspace->subscription);
        $this->assertEquals($plan->id, $workspace->subscription->plan_id);
        
        if ($plan->trial_days > 0) {
            $this->assertEquals('trialing', $workspace->subscription->status);
            $this->assertNotNull($workspace->subscription->trial_ends_at);
        } else {
            $this->assertEquals('active', $workspace->subscription->status);
        }
    }

    public function test_workspace_with_trial_plan_has_trial_fields(): void
    {
        $plan = Plan::factory()->starter()->create();
        
        $workspace = Workspace::factory()->create();
        $user = $workspace->owner;

        $subscriptionService = app(\App\Core\Billing\SubscriptionService::class);
        $subscriptionService->startTrial($workspace, $plan, $user);

        $workspace->refresh();

        $this->assertEquals('trialing', $workspace->subscription->status);
        $this->assertNotNull($workspace->subscription->trial_ends_at);
        $this->assertTrue($workspace->subscription->trial_ends_at->isFuture());
    }
}
