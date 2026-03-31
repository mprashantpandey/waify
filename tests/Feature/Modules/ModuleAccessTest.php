<?php

namespace Tests\Feature\Modules;

use App\Models\AccountModule;
use App\Models\Module;
use App\Models\Plan;
use App\Models\User;
use App\Http\Middleware\EnsureAccountSubscribed;
use App\Http\Middleware\EnsurePhoneVerifiedForTenant;
use App\Http\Middleware\RestrictChatAgentAccess;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class ModuleAccessTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        $this->artisan('db:seed', ['--class' => 'ModuleSeeder']);
        $this->artisan('db:seed', ['--class' => 'PlanSeeder']);
    }

    public function test_modules_route_redirects_members_to_setup_page(): void
    {
        $this->withoutMiddleware([
            EnsureAccountSubscribed::class,
            EnsurePhoneVerifiedForTenant::class,
            RestrictChatAgentAccess::class,
        ]);

        $account = $this->createAccountWithPlan('starter');
        $member = User::factory()->create();

        $account->users()->attach($member->id, ['role' => 'member']);

        $response = $this->actingAs($member)
            ->withSession(['current_account_id' => $account->id])
            ->get(route('app.modules'));

        $response->assertRedirect(route('app.setup'));
    }

    public function test_admin_can_view_setup_page_with_feature_readiness(): void
    {
        $this->withoutMiddleware([
            EnsureAccountSubscribed::class,
            EnsurePhoneVerifiedForTenant::class,
            RestrictChatAgentAccess::class,
        ]);

        $account = $this->createAccountWithPlan('enterprise');
        $admin = User::factory()->create();

        $account->users()->attach($admin->id, ['role' => 'admin']);

        AccountModule::create([
            'account_id' => $account->id,
            'module_key' => 'ai',
            'enabled' => false,
        ]);

        $response = $this->actingAs($admin)
            ->withSession(['current_account_id' => $account->id])
            ->get(route('app.setup'));

        $response->assertOk();
        $response->assertInertia(fn (Assert $page) => $page
            ->component('App/Setup')
            ->where('features', function ($features): bool {
                $ai = collect($features)->firstWhere('key', 'ai');

                return $ai !== null
                    && ($ai['available'] ?? null) === true
                    && ($ai['state'] ?? null) === 'setup';
            })
        );
    }

    public function test_legacy_toggle_route_is_removed(): void
    {
        $this->assertFalse(app('router')->has('app.modules.toggle'));
    }

    public function test_module_enabled_respects_plan_entitlement_and_not_only_account_override(): void
    {
        $account = $this->createAccountWithPlan('free');

        AccountModule::create([
            'account_id' => $account->id,
            'module_key' => 'ai',
            'enabled' => true,
        ]);

        $this->assertFalse(module_enabled($account, 'ai'));
        $this->assertTrue(module_enabled($account, 'whatsapp.cloud'));
    }

    public function test_module_enabled_allows_plan_module_without_explicit_account_row(): void
    {
        $plan = Plan::factory()->create([
            'modules' => ['whatsapp.cloud', 'ai'],
            'trial_days' => 0,
        ]);
        $account = $this->createAccountWithPlan($plan->key);

        $this->assertTrue(module_enabled($account, 'ai'));
    }

    public function test_disabled_platform_module_is_not_available_even_if_in_plan(): void
    {
        $account = $this->createAccountWithPlan('enterprise');

        Module::query()->where('key', 'ai')->update(['is_enabled' => false]);

        $this->assertFalse(module_enabled($account, 'ai'));
    }
}
