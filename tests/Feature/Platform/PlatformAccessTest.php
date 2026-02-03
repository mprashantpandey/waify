<?php

namespace Tests\Feature\Platform;

use App\Models\User;
use App\Models\Account;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class PlatformAccessTest extends TestCase
{
    use RefreshDatabase;

    protected User $superAdmin;
    protected User $regularUser;
    protected Account $account;

    protected function setUp(): void
    {
        parent::setUp();

        $this->superAdmin = User::factory()->create([
            'is_platform_admin' => true,
        ]);

        $this->regularUser = User::factory()->create([
            'is_platform_admin' => false,
        ]);

        $this->account = Account::factory()->create([
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

    public function test_non_super_admin_cannot_access_platform_accounts(): void
    {
        $response = $this->actingAs($this->regularUser)
            ->get(route('platform.accounts.index'));

        $response->assertStatus(403);
    }

    public function test_super_admin_can_access_platform_accounts(): void
    {
        $response = $this->actingAs($this->superAdmin)
            ->get(route('platform.accounts.index'));

        $response->assertStatus(200);
    }

    public function test_super_admin_can_disable_account(): void
    {
        $response = $this->actingAs($this->superAdmin)
            ->post(route('platform.accounts.disable', ['account' => $this->account->id]), [
                'reason' => 'Test disable',
            ]);

        $response->assertRedirect();
        $this->account->refresh();
        $this->assertEquals('disabled', $this->account->status);
        $this->assertEquals('Test disable', $this->account->disabled_reason);
    }

    public function test_super_admin_can_enable_account(): void
    {
        $this->account->disable('Test');
        $this->account->refresh();

        $response = $this->actingAs($this->superAdmin)
            ->post(route('platform.accounts.enable', ['account' => $this->account->id]));

        $response->assertRedirect();
        $this->account->refresh();
        $this->assertEquals('active', $this->account->status);
        $this->assertNull($this->account->disabled_reason);
    }

    public function test_disabled_account_blocks_access_for_regular_users(): void
    {
        $this->account->disable('Test disable');
        session(['current_account_id' => $this->account->id]);

        $response = $this->actingAs($this->regularUser)
            ->get(route('app.dashboard', ['account' => $this->account->slug]));

        $response->assertStatus(403);
    }

    public function test_super_admin_can_access_disabled_account(): void
    {
        $this->account->disable('Test disable');
        session(['current_account_id' => $this->account->id]);

        $response = $this->actingAs($this->superAdmin)
            ->get(route('app.dashboard', ['account' => $this->account->slug]));

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
