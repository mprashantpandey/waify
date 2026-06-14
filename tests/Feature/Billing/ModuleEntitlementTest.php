<?php

namespace Tests\Feature\Billing;

use App\Models\Account;
use App\Models\Plan;
use App\Core\Billing\EntitlementService;
use App\Modules\WhatsApp\Models\WhatsAppConnection;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ModuleEntitlementTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->artisan('db:seed', ['--class' => 'ModuleSeeder']);
        $this->artisan('db:seed', ['--class' => 'PlanSeeder']);
    }

    public function test_plan_without_templates_cannot_access_templates_module(): void
    {
        $plan = Plan::factory()->state([
            'key' => 'starter_without_templates',
            'modules' => ['whatsapp.cloud', 'contacts'],
            'limits' => ['whatsapp_connections' => 1],
            'is_active' => true,
            'is_public' => false,
        ])->create();

        $account = $this->createAccountWithPlan($plan->key);
        $user = $this->actingAsAccountOwner($account);

        $this->assertNotContains('templates', $plan->modules ?? []);

        // Try to access templates route
        $response = $this->get(route('app.whatsapp.templates.index', ['account' => $account->slug]));

        $response->assertStatus(403);
    }

    public function test_starter_plan_can_access_templates_module(): void
    {

        $account = $this->createAccountWithPlan('starter');
        $user = $this->actingAsAccountOwner($account);

        // Enable templates module in account
        \App\Models\AccountModule::create([
            'account_id' => $account->id,
            'module_key' => 'templates',
            'enabled' => true,
        ]);

        // Try to access templates route
        $response = $this->get(route('app.whatsapp.templates.index', ['account' => $account->slug]));

        // Should succeed (200 or redirect, not 403)
        $this->assertNotEquals(403, $response->status());
    }

    public function test_inactive_whatsapp_connection_does_not_block_reconnect(): void
    {
        $plan = Plan::factory()->state([
            'key' => 'single_connection_plan',
            'modules' => ['whatsapp.cloud'],
            'limits' => ['whatsapp_connections' => 1],
            'is_active' => true,
            'is_public' => false,
        ])->create();
        $account = $this->createAccountWithPlan($plan->key);

        WhatsAppConnection::factory()->create([
            'account_id' => $account->id,
            'is_active' => false,
        ]);

        $this->assertTrue(app(EntitlementService::class)->canCreateConnection($account->fresh()));
    }
}
