<?php

namespace Tests\Feature\Billing;

use App\Models\Plan;
use App\Models\Workspace;
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
        
        $workspace = $this->createWorkspaceWithPlan('free');
        $user = $this->actingAsWorkspaceOwner($workspace);

        // Ensure templates module is NOT in free plan
        $plan = $workspace->subscription->plan;
        $this->assertNotContains('templates', $plan->modules ?? []);

        // Try to access templates route
        $response = $this->get(route('app.whatsapp.templates.index', ['workspace' => $workspace->slug]));

        $response->assertStatus(403);
        $response->assertSee('not available on your current plan');
    }

    public function test_starter_plan_can_access_templates_module(): void
    {
        
        $workspace = $this->createWorkspaceWithPlan('starter');
        $user = $this->actingAsWorkspaceOwner($workspace);

        // Enable templates module in workspace
        \App\Models\WorkspaceModule::create([
            'workspace_id' => $workspace->id,
            'module_key' => 'templates',
            'enabled' => true,
        ]);

        // Try to access templates route
        $response = $this->get(route('app.whatsapp.templates.index', ['workspace' => $workspace->slug]));

        // Should succeed (200 or redirect, not 403)
        $this->assertNotEquals(403, $response->status());
    }
}
