<?php

namespace Tests\Feature;

use App\Core\Billing\PlanResolver;
use App\Core\Billing\SubscriptionService;
use App\Models\Account;
use App\Models\AccountModule;
use App\Models\Plan;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class WorkspaceTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        $this->artisan('db:seed', ['--class' => 'ModuleSeeder']);
        $this->artisan('db:seed', ['--class' => 'PlanSeeder']);
    }

    public function test_owner_can_open_create_workspace_drawer(): void
    {
        $account = $this->createAccountWithPlan('starter');
        $this->actingAsAccountOwner($account);

        $response = $this->get(route('app.workspaces.index', ['panel' => 'create']));

        $response->assertOk();
        $response->assertInertia(fn ($page) => $page
            ->component('App/Workspaces/Index')
            ->where('showCreatePanel', true)
            ->has('plans')
        );
    }

    public function test_owner_can_create_and_switch_to_new_workspace(): void
    {
        $account = $this->createAccountWithPlan('starter');
        $owner = $this->actingAsAccountOwner($account);
        $freePlan = Plan::where('key', 'starter')->firstOrFail();

        $response = $this->post(route('app.workspaces.store'), [
            'name' => 'Client Workspace',
            'workspace_type' => 'client',
            'industry' => 'Retail',
            'plan_key' => $freePlan->key,
        ]);

        $response->assertRedirect(route('app.dashboard'));
        $response->assertSessionHas('success');

        $workspace = Account::where('name', 'Client Workspace')->firstOrFail();

        $this->assertSame($owner->id, (int) $workspace->owner_id);
        $this->assertSame('client', $workspace->workspace_type);
        $this->assertSame('Retail', $workspace->industry);
        $this->assertSame(config('app.timezone'), $workspace->timezone);
        $this->assertSame($workspace->id, session('current_account_id'));
        $this->assertDatabaseHas('subscriptions', [
            'account_id' => $workspace->id,
            'plan_id' => $freePlan->id,
        ]);
        $this->assertDatabaseHas('account_modules', [
            'account_id' => $workspace->id,
            'module_key' => 'core.dashboard',
            'enabled' => true,
        ]);
        $this->assertDatabaseHas('account_modules', [
            'account_id' => $workspace->id,
            'module_key' => 'whatsapp.cloud',
            'enabled' => true,
        ]);
    }

    public function test_platform_admin_cannot_create_user_workspace(): void
    {
        $account = $this->createAccountWithPlan('starter');
        $admin = User::factory()->create([
            'is_platform_admin' => true,
        ]);

        $this->actingAs($admin)->withSession(['current_account_id' => $account->id]);

        $this->get(route('app.workspaces.index'))->assertForbidden();
        $this->post(route('app.workspaces.store'), [
            'name' => 'Admin Workspace',
            'workspace_type' => 'business',
            'plan_key' => 'starter',
        ])->assertForbidden();

        $this->assertDatabaseMissing('accounts', [
            'name' => 'Admin Workspace',
        ]);
    }

    public function test_user_can_switch_between_accessible_workspaces(): void
    {
        $first = $this->createAccountWithPlan('starter');
        $owner = $this->actingAsAccountOwner($first);
        $second = Account::factory()->create(['owner_id' => $owner->id]);

        $response = $this->post(route('app.accounts.switch', ['account' => $second->id]));

        $response->assertRedirect(route('app.dashboard'));
        $this->assertSame($second->id, session('current_account_id'));
    }

    public function test_user_cannot_switch_to_someone_elses_workspace(): void
    {
        $first = $this->createAccountWithPlan('starter');
        $this->actingAsAccountOwner($first);
        $other = Account::factory()->create();

        $response = $this->post(route('app.accounts.switch', ['account' => $other->id]));

        $response->assertForbidden();
        $this->assertSame($first->id, session('current_account_id'));
    }

    public function test_owner_can_delete_extra_workspace_with_name_confirmation(): void
    {
        $first = $this->createAccountWithPlan('starter');
        $owner = $this->actingAsAccountOwner($first);
        $second = Account::factory()->create([
            'owner_id' => $owner->id,
            'name' => 'Client Delete Workspace',
        ]);
        app(SubscriptionService::class)->changePlan($second, Plan::where('key', 'starter')->firstOrFail());

        $response = $this->delete(route('app.workspaces.destroy', ['account' => $second->id]), [
            'confirmation_name' => 'Client Delete Workspace',
        ]);

        $response->assertRedirect(route('app.workspaces.index'));
        $response->assertSessionHas('success');
        $this->assertDatabaseMissing('accounts', ['id' => $second->id]);
        $this->assertDatabaseHas('destructive_audit_logs', [
            'action' => 'workspace_deleted',
            'actor_id' => $owner->id,
        ]);
        $this->assertSame($first->id, session('current_account_id'));
    }

    public function test_owner_cannot_delete_only_workspace(): void
    {
        $account = $this->createAccountWithPlan('starter');
        $this->actingAsAccountOwner($account);

        $response = $this->delete(route('app.workspaces.destroy', ['account' => $account->id]), [
            'confirmation_name' => $account->name,
        ]);

        $response->assertSessionHasErrors('workspace');
        $this->assertDatabaseHas('accounts', ['id' => $account->id]);
    }

    public function test_workspace_delete_requires_exact_name_confirmation(): void
    {
        $first = $this->createAccountWithPlan('starter');
        $owner = $this->actingAsAccountOwner($first);
        $second = Account::factory()->create(['owner_id' => $owner->id]);
        app(SubscriptionService::class)->changePlan($second, Plan::where('key', 'starter')->firstOrFail());

        $response = $this->delete(route('app.workspaces.destroy', ['account' => $second->id]), [
            'confirmation_name' => 'wrong name',
        ]);

        $response->assertSessionHasErrors('confirmation_name');
        $this->assertDatabaseHas('accounts', ['id' => $second->id]);
    }

    public function test_member_cannot_delete_workspace(): void
    {
        $first = $this->createAccountWithPlan('starter');
        $owner = $this->actingAsAccountOwner($first);
        $member = User::factory()->create();
        $second = Account::factory()->create(['owner_id' => $owner->id]);
        app(SubscriptionService::class)->changePlan($second, Plan::where('key', 'starter')->firstOrFail());
        $second->users()->attach($member->id, ['role' => 'admin']);

        $this->actingAs($member)->withSession(['current_account_id' => $second->id]);

        $this->delete(route('app.workspaces.destroy', ['account' => $second->id]), [
            'confirmation_name' => $second->name,
        ])->assertForbidden();

        $this->assertDatabaseHas('accounts', ['id' => $second->id]);
    }

    public function test_plan_modules_are_available_without_phantom_inbox_module(): void
    {
        $account = $this->createAccountWithPlan('starter');

        $availableModules = app(PlanResolver::class)->getAvailableModuleKeys($account);
        $effectiveModules = app(PlanResolver::class)->getEffectiveModules($account);

        $this->assertContains('whatsapp.cloud', $availableModules);
        $this->assertContains('templates', $availableModules);
        $this->assertContains('contacts', $availableModules);
        $this->assertContains('broadcasts', $availableModules);
        $this->assertNotContains('inbox', $availableModules);
        $this->assertContains('templates', $effectiveModules);

        AccountModule::create([
            'account_id' => $account->id,
            'module_key' => 'templates',
            'enabled' => false,
        ]);

        $this->assertNotContains('templates', app(PlanResolver::class)->getEffectiveModules($account));
    }
}
