<?php

namespace Tests\Feature\Billing;

use App\Core\Billing\PlanResolver;
use App\Models\Plan;
use App\Models\Workspace;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class PlanResolverTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        if (Plan::count() === 0) {
            $this->artisan('db:seed', ['--class' => 'PlanSeeder']);
        }
    }

    public function test_get_workspace_plan_returns_subscription_plan(): void
    {
        $plan = Plan::factory()->free()->create();
        $workspace = $this->createWorkspaceWithPlan('free');

        $resolver = app(PlanResolver::class);
        $resolvedPlan = $resolver->getWorkspacePlan($workspace);

        $this->assertNotNull($resolvedPlan);
        $this->assertEquals($plan->id, $resolvedPlan->id);
    }

    public function test_effective_modules_intersects_with_workspace_toggles(): void
    {
        $plan = Plan::factory()->state([
            'modules' => ['whatsapp', 'templates', 'inbox'],
        ])->create();

        $workspace = $this->createWorkspaceWithPlan($plan->key);

        // Enable only whatsapp and templates in workspace
        \App\Models\WorkspaceModule::create([
            'workspace_id' => $workspace->id,
            'module_key' => 'whatsapp',
            'enabled' => true,
        ]);
        \App\Models\WorkspaceModule::create([
            'workspace_id' => $workspace->id,
            'module_key' => 'templates',
            'enabled' => true,
        ]);
        // inbox is NOT enabled

        $resolver = app(PlanResolver::class);
        $effectiveModules = $resolver->getEffectiveModules($workspace);

        $this->assertContains('whatsapp', $effectiveModules);
        $this->assertContains('templates', $effectiveModules);
        $this->assertNotContains('inbox', $effectiveModules);
    }

    public function test_effective_limits_returns_plan_limits(): void
    {
        $plan = Plan::factory()->free()->create();
        $workspace = $this->createWorkspaceWithPlan('free');

        $resolver = app(PlanResolver::class);
        $limits = $resolver->getEffectiveLimits($workspace);

        $this->assertEquals(1, $limits['agents']);
        $this->assertEquals(1, $limits['whatsapp_connections']);
        $this->assertEquals(500, $limits['messages_monthly']);
    }
}
