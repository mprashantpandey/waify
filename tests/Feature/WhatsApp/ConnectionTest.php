<?php

namespace Tests\Feature\WhatsApp;

use App\Models\User;
use App\Models\Workspace;
use App\Modules\WhatsApp\Models\WhatsAppConnection;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ConnectionTest extends TestCase
{
    use RefreshDatabase;

    protected User $user;
    protected Workspace $workspace;

    protected function setUp(): void
    {
        parent::setUp();

        $this->user = User::factory()->create();
        $this->workspace = Workspace::factory()->create([
            'owner_id' => $this->user->id,
        ]);
        $this->workspace->users()->attach($this->user->id, ['role' => 'owner']);

        session(['current_workspace_id' => $this->workspace->id]);
    }

    public function test_workspace_member_can_view_connections(): void
    {
        $member = User::factory()->create();
        $this->workspace->users()->attach($member->id, ['role' => 'member']);

        $connection = WhatsAppConnection::factory()->create([
            'workspace_id' => $this->workspace->id,
        ]);

        $response = $this->actingAs($member)
            ->get(route('app.whatsapp.connections.index', ['workspace' => $this->workspace->slug]));

        $response->assertStatus(200);
        $response->assertInertia(fn ($page) => $page
            ->component('WhatsApp/Connections/Index')
            ->has('connections', 1)
        );
    }

    public function test_owner_can_create_connection(): void
    {
        $response = $this->actingAs($this->user)
            ->post(route('app.whatsapp.connections.store', ['workspace' => $this->workspace->slug]), [
                'name' => 'Test Connection',
                'phone_number_id' => '123456789',
                'access_token' => 'test-token',
                'api_version' => 'v20.0',
            ]);

        $response->assertRedirect();
        $this->assertDatabaseHas('whatsapp_connections', [
            'workspace_id' => $this->workspace->id,
            'name' => 'Test Connection',
            'phone_number_id' => '123456789',
        ]);
    }

    public function test_member_cannot_create_connection(): void
    {
        $member = User::factory()->create();
        $this->workspace->users()->attach($member->id, ['role' => 'member']);

        $response = $this->actingAs($member)
            ->post(route('app.whatsapp.connections.store', ['workspace' => $this->workspace->slug]), [
                'name' => 'Test Connection',
                'phone_number_id' => '123456789',
                'access_token' => 'test-token',
            ]);

        $response->assertForbidden();
    }

    public function test_owner_can_update_connection(): void
    {
        $connection = WhatsAppConnection::factory()->create([
            'workspace_id' => $this->workspace->id,
            'name' => 'Original Name',
        ]);

        $response = $this->actingAs($this->user)
            ->put(route('app.whatsapp.connections.update', [
                'workspace' => $this->workspace->slug,
                'connection' => $connection->id,
            ]), [
                'name' => 'Updated Name',
                'phone_number_id' => $connection->phone_number_id,
            ]);

        $response->assertRedirect();
        $this->assertDatabaseHas('whatsapp_connections', [
            'id' => $connection->id,
            'name' => 'Updated Name',
        ]);
    }

    public function test_owner_can_rotate_verify_token(): void
    {
        $connection = WhatsAppConnection::factory()->create([
            'workspace_id' => $this->workspace->id,
        ]);

        $originalToken = $connection->webhook_verify_token;

        $response = $this->actingAs($this->user)
            ->post(route('app.whatsapp.connections.rotate-verify-token', [
                'workspace' => $this->workspace->slug,
                'connection' => $connection->id,
            ]));

        $response->assertRedirect();
        $connection->refresh();
        $this->assertNotEquals($originalToken, $connection->webhook_verify_token);
        $this->assertFalse($connection->webhook_subscribed);
    }
}
