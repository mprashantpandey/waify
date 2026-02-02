<?php

namespace Tests\Feature\Billing;

use App\Core\Billing\SubscriptionService;
use App\Models\BillingEvent;
use App\Models\Plan;
use App\Models\Workspace;
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

    public function test_workspace_owner_can_change_plan(): void
    {
        
        $workspace = $this->createWorkspaceWithPlan('free');
        $user = $this->actingAsWorkspaceOwner($workspace);

        $starterPlan = Plan::where('key', 'starter')->firstOrFail();

        $response = $this->post(route('app.billing.switch-plan', [
            'workspace' => $workspace->slug,
            'plan' => $starterPlan->id,
        ]));

        $response->assertRedirect();
        
        $workspace->refresh();
        $this->assertEquals($starterPlan->id, $workspace->subscription->plan_id);

        // Check billing event
        $this->assertDatabaseHas('billing_events', [
            'workspace_id' => $workspace->id,
            'type' => 'plan_changed',
            'actor_id' => $user->id,
        ]);
    }

    public function test_non_owner_cannot_change_plan(): void
    {
        
        $workspace = $this->createWorkspaceWithPlan('free');
        $otherUser = \App\Models\User::factory()->create();
        $this->actingAs($otherUser);

        $starterPlan = Plan::where('key', 'starter')->firstOrFail();

        $response = $this->post(route('app.billing.switch-plan', [
            'workspace' => $workspace->slug,
            'plan' => $starterPlan->id,
        ]));

        $response->assertStatus(403);
    }

    public function test_downgrade_does_not_delete_data(): void
    {
        
        $workspace = $this->createWorkspaceWithPlan('starter');
        $user = $this->actingAsWorkspaceOwner($workspace);

        // Create some connections
        \App\Modules\WhatsApp\Models\WhatsAppConnection::factory()->count(2)->create([
            'workspace_id' => $workspace->id,
        ]);

        // Downgrade to free (1 connection limit)
        $freePlan = Plan::where('key', 'free')->firstOrFail();
        
        $response = $this->post(route('app.billing.switch-plan', [
            'workspace' => $workspace->slug,
            'plan' => $freePlan->id,
        ]));

        $response->assertRedirect();
        
        // Connections should still exist
        $this->assertEquals(2, \App\Modules\WhatsApp\Models\WhatsAppConnection::where('workspace_id', $workspace->id)->count());
        
        // But new connections should be blocked
        $response = $this->post(route('app.whatsapp.connections.store', ['workspace' => $workspace->slug]), [
            'name' => 'New Connection',
            'phone_number_id' => '999',
            'access_token' => 'token',
        ]);

        $response->assertStatus(402);
    }
}
