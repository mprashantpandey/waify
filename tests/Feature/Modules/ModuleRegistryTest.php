<?php

namespace Tests\Feature\Modules;

use App\Core\Modules\ModuleRegistry;
use App\Models\AccountModule;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ModuleRegistryTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        $this->artisan('db:seed', ['--class' => 'ModuleSeeder']);
        $this->artisan('db:seed', ['--class' => 'PlanSeeder']);
    }

    public function test_registry_loads_modules_in_deterministic_key_order(): void
    {
        $registry = app(ModuleRegistry::class);

        $keys = $registry->all()->keys()->values()->all();
        $sorted = $keys;
        sort($sorted, SORT_NATURAL | SORT_FLAG_CASE);

        $this->assertSame($sorted, $keys);
    }

    public function test_registry_respects_explicit_account_disable_for_plan_module(): void
    {
        $account = $this->createAccountWithPlan('starter');

        AccountModule::updateOrCreate(
            ['account_id' => $account->id, 'module_key' => 'whatsapp.cloud'],
            ['enabled' => false]
        );

        $enabled = app(ModuleRegistry::class)
            ->getEnabledForAccount($account)
            ->pluck('key')
            ->all();

        $this->assertNotContains('whatsapp.cloud', $enabled);
        $this->assertContains('core.dashboard', $enabled);
    }
}
