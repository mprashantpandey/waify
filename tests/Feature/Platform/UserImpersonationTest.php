<?php

namespace Tests\Feature\Platform;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class UserImpersonationTest extends TestCase
{
    use RefreshDatabase;

    protected User $admin;

    protected function setUp(): void
    {
        parent::setUp();

        $this->artisan('db:seed', ['--class' => 'ModuleSeeder']);
        $this->artisan('db:seed', ['--class' => 'PlanSeeder']);

        $this->admin = User::factory()->create([
            'is_platform_admin' => true,
        ]);
    }

    public function test_platform_admin_can_impersonate_user_with_workspace(): void
    {
        $account = $this->createAccountWithPlan('starter');
        $target = $account->owner;

        $response = $this->actingAs($this->admin)
            ->post(route('platform.users.impersonate', ['user' => $target->id]));

        $response->assertRedirect(route('app.dashboard'));
        $this->assertAuthenticatedAs($target);
        $this->assertSame($this->admin->id, session('impersonator_id'));
        $this->assertSame($target->id, session('impersonated_user_id'));
        $this->assertSame($account->id, session('current_account_id'));

        $this->get(route('app.dashboard'))->assertOk();
    }

    public function test_platform_admin_can_impersonate_workspace_owner_from_account(): void
    {
        $account = $this->createAccountWithPlan('starter');
        $target = $account->owner;

        $response = $this->actingAs($this->admin)
            ->post(route('platform.accounts.impersonate', ['account' => $account->id]));

        $response->assertRedirect(route('app.dashboard'));
        $this->assertAuthenticatedAs($target);
        $this->assertSame($this->admin->id, session('impersonator_id'));
        $this->assertSame($target->id, session('impersonated_user_id'));
        $this->assertSame($account->id, session('impersonated_account_id'));
        $this->assertSame($account->id, session('current_account_id'));

        $this->get(route('app.dashboard'))->assertOk();
    }

    public function test_platform_admin_can_impersonate_user_without_workspace(): void
    {
        $target = User::factory()->create();

        $response = $this->actingAs($this->admin)
            ->post(route('platform.users.impersonate', ['user' => $target->id]));

        $response->assertRedirect(route('onboarding'));
        $this->assertAuthenticatedAs($target);
        $this->assertSame($this->admin->id, session('impersonator_id'));
        $this->assertSame($target->id, session('impersonated_user_id'));
        $this->assertNull(session('current_account_id'));
    }

    public function test_platform_admin_cannot_impersonate_super_admin(): void
    {
        $target = User::factory()->create([
            'is_platform_admin' => true,
        ]);

        $response = $this->actingAs($this->admin)
            ->from(route('platform.users.index'))
            ->post(route('platform.users.impersonate', ['user' => $target->id]));

        $response->assertRedirect(route('platform.users.index'));
        $this->assertAuthenticatedAs($this->admin);
        $this->assertNull(session('impersonator_id'));
    }

    public function test_platform_admin_cannot_impersonate_self(): void
    {
        $response = $this->actingAs($this->admin)
            ->from(route('platform.users.index'))
            ->post(route('platform.users.impersonate', ['user' => $this->admin->id]));

        $response->assertRedirect(route('platform.users.index'));
        $this->assertAuthenticatedAs($this->admin);
        $this->assertNull(session('impersonator_id'));
    }

    public function test_leaving_impersonation_restores_platform_admin(): void
    {
        $account = $this->createAccountWithPlan('starter');
        $target = $account->owner;

        $this->actingAs($this->admin)
            ->post(route('platform.users.impersonate', ['user' => $target->id]));

        $response = $this->post(route('impersonate.leave'));

        $response->assertRedirect(route('platform.dashboard'));
        $this->assertAuthenticatedAs($this->admin);
        $this->assertNull(session('impersonator_id'));
        $this->assertNull(session('impersonated_user_id'));
        $this->assertNull(session('current_account_id'));
    }

    public function test_platform_route_restores_admin_when_impersonation_is_active(): void
    {
        $account = $this->createAccountWithPlan('starter');
        $target = $account->owner;

        $this->actingAs($this->admin)
            ->post(route('platform.users.impersonate', ['user' => $target->id]));

        $response = $this->get(route('platform.dashboard'));

        $response->assertRedirect(route('platform.dashboard'));
        $this->assertAuthenticatedAs($this->admin);
        $this->assertNull(session('impersonator_id'));
        $this->assertNull(session('impersonated_user_id'));
        $this->assertNull(session('current_account_id'));
    }
}
