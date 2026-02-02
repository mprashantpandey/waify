<?php

namespace Tests\Feature\Billing;

use App\Modules\WhatsApp\Models\WhatsAppConnection;
use App\Models\Plan;
use App\Models\Workspace;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ConnectionLimitTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        if (Plan::count() === 0) {
            $this->artisan('db:seed', ['--class' => 'PlanSeeder']);
        }
    }

    public function test_free_plan_allows_one_connection(): void
    {
        
        $workspace = $this->createWorkspaceWithPlan('free');
        $user = $this->actingAsWorkspaceOwner($workspace);

        // Create first connection (should succeed)
        $response = $this->post(route('app.whatsapp.connections.store', ['workspace' => $workspace->slug]), [
            'name' => 'Test Connection',
            'phone_number_id' => '123456789',
            'access_token' => 'test_token',
        ]);

        $response->assertRedirect();
        $this->assertEquals(1, WhatsAppConnection::where('workspace_id', $workspace->id)->count());

        // Try to create second connection (should fail)
        $response = $this->post(route('app.whatsapp.connections.store', ['workspace' => $workspace->slug]), [
            'name' => 'Test Connection 2',
            'phone_number_id' => '987654321',
            'access_token' => 'test_token_2',
        ]);

        $response->assertStatus(402);
        $response->assertSee('connections limit');
        $this->assertEquals(1, WhatsAppConnection::where('workspace_id', $workspace->id)->count());
    }

    public function test_starter_plan_allows_two_connections(): void
    {
        
        $workspace = $this->createWorkspaceWithPlan('starter');
        $user = $this->actingAsWorkspaceOwner($workspace);

        // Create first connection
        $this->post(route('app.whatsapp.connections.store', ['workspace' => $workspace->slug]), [
            'name' => 'Connection 1',
            'phone_number_id' => '111',
            'access_token' => 'token1',
        ]);

        // Create second connection
        $this->post(route('app.whatsapp.connections.store', ['workspace' => $workspace->slug]), [
            'name' => 'Connection 2',
            'phone_number_id' => '222',
            'access_token' => 'token2',
        ]);

        $this->assertEquals(2, WhatsAppConnection::where('workspace_id', $workspace->id)->count());

        // Try third (should fail)
        $response = $this->post(route('app.whatsapp.connections.store', ['workspace' => $workspace->slug]), [
            'name' => 'Connection 3',
            'phone_number_id' => '333',
            'access_token' => 'token3',
        ]);

        $response->assertStatus(402);
        $this->assertEquals(2, WhatsAppConnection::where('workspace_id', $workspace->id)->count());
    }
}
