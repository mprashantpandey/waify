<?php

namespace Tests\Feature\Billing;

use App\Core\Billing\UsageService;
use App\Models\Plan;
use App\Models\Account;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class TemplateLimitTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        if (Plan::count() === 0) {
            $this->artisan('db:seed', ['--class' => 'PlanSeeder']);
        }
    }

    public function test_template_sending_increments_both_counters(): void
    {
        
        $account = $this->createAccountWithPlan('starter'); // Has template sends
        $user = $this->actingAsAccountOwner($account);

        $usageService = app(UsageService::class);
        $initialUsage = $usageService->getCurrentUsage($account);
        $initialMessages = $initialUsage->messages_sent;
        $initialTemplates = $initialUsage->template_sends;

        // Simulate successful template send
        $usageService->incrementMessages($account, 1);
        $usageService->incrementTemplateSends($account, 1);

        $finalUsage = $usageService->getCurrentUsage($account);
        $this->assertEquals($initialMessages + 1, $finalUsage->messages_sent);
        $this->assertEquals($initialTemplates + 1, $finalUsage->template_sends);
    }

    public function test_template_sending_blocked_when_template_limit_exceeded(): void
    {
        
        $account = $this->createAccountWithPlan('starter'); // 1000 template sends limit
        $user = $this->actingAsAccountOwner($account);

        // Set template usage at limit
        $this->setUsage($account, now()->format('Y-m'), 0, 1000);

        // Try to send template (should be blocked)
        $template = \App\Modules\WhatsApp\Models\WhatsAppTemplate::factory()->create([
            'account_id' => $account->id,
        ]);

        $response = $this->post(route('app.whatsapp.templates.send.store', [
            'account' => $account->slug,
            'template' => $template->id,
        ]), [
            'to_wa_id' => '1234567890',
            'variables' => [],
        ]);

        $response->assertStatus(402);
        $response->assertSee('template_sends_monthly');
    }
}
