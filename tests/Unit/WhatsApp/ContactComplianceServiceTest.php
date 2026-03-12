<?php

namespace Tests\Unit\WhatsApp;

use App\Models\Account;
use App\Models\AccountModule;
use App\Models\Module;
use App\Models\PlatformSetting;
use App\Modules\WhatsApp\Services\ContactComplianceService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ContactComplianceServiceTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->artisan('db:seed', ['--class' => 'ModuleSeeder']);
    }

    public function test_detects_global_opt_out_keyword_with_punctuation(): void
    {
        PlatformSetting::updateOrCreate(
            ['key' => 'integrations.whatsapp_opt_out_keywords'],
            [
                'value' => json_encode(['STOP', 'UNSUBSCRIBE']),
                'type' => 'json',
                'group' => 'integrations',
            ]
        );
        $account = Account::factory()->create();

        $service = app(ContactComplianceService::class);
        $matched = $service->detectOptOutKeyword($account, 'STOP!!!');

        $this->assertSame('STOP', $matched);
    }

    public function test_detects_tenant_custom_opt_out_keyword(): void
    {
        PlatformSetting::updateOrCreate(
            ['key' => 'integrations.whatsapp_opt_out_keywords'],
            [
                'value' => json_encode(['STOP']),
                'type' => 'json',
                'group' => 'integrations',
            ]
        );
        $account = Account::factory()->create();
        Module::firstOrCreate(
            ['key' => 'whatsapp'],
            ['name' => 'WhatsApp', 'description' => 'WhatsApp module', 'is_core' => false]
        );

        AccountModule::create([
            'account_id' => $account->id,
            'module_key' => 'whatsapp',
            'enabled' => true,
            'config' => [
                'compliance' => [
                    'opt_out_keywords' => ['रोकें'],
                ],
            ],
        ]);

        $service = app(ContactComplianceService::class);
        $matched = $service->detectOptOutKeyword($account, 'रोकें अब');

        $this->assertSame('रोकें', $matched);
    }
}
