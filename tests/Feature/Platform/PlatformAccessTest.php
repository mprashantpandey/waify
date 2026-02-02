<?php

namespace Tests\Feature\Platform;

use App\Models\User;
use App\Models\Workspace;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class PlatformAccessTest extends TestCase
{
    use RefreshDatabase;

    protected User $superAdmin;
    protected User $regularUser;
    protected Workspace $workspace;

    protected function setUp(): void
    {
        parent::setUp();

        $this->superAdmin = User::factory()->create([
            'is_platform_admin' => true,
        ]);

        $this->regularUser = User::factory()->create([
            'is_platform_admin' => false,
        ]);

        $this->workspace = Workspace::factory()->create([
            'owner_id' => $this->regularUser->id,
            'status' => 'active',
        ]);
    }

    public function test_non_super_admin_cannot_access_platform_dashboard(): void
    {
        $response = $this->actingAs($this->regularUser)
            ->get(route('platform.dashboard'));

        $response->assertStatus(403);
    }

    public function test_super_admin_can_access_platform_dashboard(): void
    {
        $response = $this->actingAs($this->superAdmin)
            ->get(route('platform.dashboard'));

        $response->assertStatus(200);
    }

    public function test_non_super_admin_cannot_access_platform_workspaces(): void
    {
        $response = $this->actingAs($this->regularUser)
            ->get(route('platform.workspaces.index'));

        $response->assertStatus(403);
    }

    public function test_super_admin_can_access_platform_workspaces(): void
    {
        $response = $this->actingAs($this->superAdmin)
            ->get(route('platform.workspaces.index'));

        $response->assertStatus(200);
    }

    public function test_super_admin_can_disable_workspace(): void
    {
        $response = $this->actingAs($this->superAdmin)
            ->post(route('platform.workspaces.disable', ['workspace' => $this->workspace->id]), [
                'reason' => 'Test disable',
            ]);

        $response->assertRedirect();
        $this->workspace->refresh();
        $this->assertEquals('disabled', $this->workspace->status);
        $this->assertEquals('Test disable', $this->workspace->disabled_reason);
    }

    public function test_super_admin_can_enable_workspace(): void
    {
        $this->workspace->disable('Test');
        $this->workspace->refresh();

        $response = $this->actingAs($this->superAdmin)
            ->post(route('platform.workspaces.enable', ['workspace' => $this->workspace->id]));

        $response->assertRedirect();
        $this->workspace->refresh();
        $this->assertEquals('active', $this->workspace->status);
        $this->assertNull($this->workspace->disabled_reason);
    }

    public function test_disabled_workspace_blocks_access_for_regular_users(): void
    {
        $this->workspace->disable('Test disable');
        session(['current_workspace_id' => $this->workspace->id]);

        $response = $this->actingAs($this->regularUser)
            ->get(route('app.dashboard', ['workspace' => $this->workspace->slug]));

        $response->assertStatus(403);
    }

    public function test_super_admin_can_access_disabled_workspace(): void
    {
        $this->workspace->disable('Test disable');
        session(['current_workspace_id' => $this->workspace->id]);

        $response = $this->actingAs($this->superAdmin)
            ->get(route('app.dashboard', ['workspace' => $this->workspace->slug]));

        $response->assertStatus(200);
    }

    public function test_super_admin_can_make_user_super_admin(): void
    {
        $response = $this->actingAs($this->superAdmin)
            ->post(route('platform.users.make-super-admin', ['user' => $this->regularUser->id]));

        $response->assertRedirect();
        $this->regularUser->refresh();
        $this->assertTrue($this->regularUser->isSuperAdmin());
    }

    public function test_super_admin_can_remove_super_admin_status(): void
    {
        $anotherSuperAdmin = User::factory()->create([
            'is_platform_admin' => true,
        ]);

        $response = $this->actingAs($this->superAdmin)
            ->post(route('platform.users.remove-super-admin', ['user' => $anotherSuperAdmin->id]));

        $response->assertRedirect();
        $anotherSuperAdmin->refresh();
        $this->assertFalse($anotherSuperAdmin->isSuperAdmin());
    }

    public function test_cannot_remove_last_super_admin(): void
    {
        $response = $this->actingAs($this->superAdmin)
            ->post(route('platform.users.remove-super-admin', ['user' => $this->superAdmin->id]));

        $response->assertRedirect();
        $response->assertSessionHasErrors(['error']);
        $this->superAdmin->refresh();
        $this->assertTrue($this->superAdmin->isSuperAdmin());
    }
}
