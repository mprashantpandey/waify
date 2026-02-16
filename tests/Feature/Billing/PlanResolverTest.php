<?php

namespace Tests\Feature\Billing;

use App\Core\Billing\PlanResolver;
use App\Models\Plan;
use App\Models\Account;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class PlanResolverTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->artisan('db:seed', ['--class' => 'ModuleSeeder']);
        $this->artisan('db:seed', ['--class' => 'PlanSeeder']);
    }

    public function test_get_account_plan_returns_subscription_plan(): void
    {
        $plan = Plan::where('key', 'free')->firstOrFail();
        $account = $this->createAccountWithPlan('free');

        $resolver = app(PlanResolver::class);
        $resolvedPlan = $resolver->getAccountPlan($account);

        $this->assertNotNull($resolvedPlan);
        $this->assertEquals($plan->id, $resolvedPlan->id);
    }

    public function test_effective_modules_intersects_with_account_toggles(): void
    {
        $plan = Plan::factory()->state([
            'modules' => ['whatsapp.cloud', 'templates', 'inbox'],
        ])->create();

        $account = $this->createAccountWithPlan($plan->key);

        // Enable only whatsapp.cloud and templates in account
        \App\Models\AccountModule::create([
            'account_id' => $account->id,
            'module_key' => 'whatsapp.cloud',
            'enabled' => true,
        ]);
        \App\Models\AccountModule::create([
            'account_id' => $account->id,
            'module_key' => 'templates',
            'enabled' => true,
        ]);
        // inbox is NOT enabled

        $resolver = app(PlanResolver::class);
        $effectiveModules = $resolver->getEffectiveModules($account);

        $this->assertContains('whatsapp.cloud', $effectiveModules);
        $this->assertContains('templates', $effectiveModules);
        $this->assertNotContains('inbox', $effectiveModules);
    }

    public function test_effective_limits_returns_plan_limits(): void
    {
        $plan = Plan::where('key', 'free')->firstOrFail();
        $account = $this->createAccountWithPlan('free');

        $resolver = app(PlanResolver::class);
        $limits = $resolver->getEffectiveLimits($account);

        $this->assertEquals(1, $limits['agents']);
        $this->assertEquals(1, $limits['whatsapp_connections']);
        $this->assertEquals(500, $limits['messages_monthly']);
    }
}
