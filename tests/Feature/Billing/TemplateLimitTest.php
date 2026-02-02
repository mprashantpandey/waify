<?php

namespace Tests\Feature\Billing;

use App\Core\Billing\UsageService;
use App\Models\Plan;
use App\Models\Workspace;
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
        
        $workspace = $this->createWorkspaceWithPlan('starter'); // Has template sends
        $user = $this->actingAsWorkspaceOwner($workspace);

        $usageService = app(UsageService::class);
        $initialUsage = $usageService->getCurrentUsage($workspace);
        $initialMessages = $initialUsage->messages_sent;
        $initialTemplates = $initialUsage->template_sends;

        // Simulate successful template send
        $usageService->incrementMessages($workspace, 1);
        $usageService->incrementTemplateSends($workspace, 1);

        $finalUsage = $usageService->getCurrentUsage($workspace);
        $this->assertEquals($initialMessages + 1, $finalUsage->messages_sent);
        $this->assertEquals($initialTemplates + 1, $finalUsage->template_sends);
    }

    public function test_template_sending_blocked_when_template_limit_exceeded(): void
    {
        
        $workspace = $this->createWorkspaceWithPlan('starter'); // 1000 template sends limit
        $user = $this->actingAsWorkspaceOwner($workspace);

        // Set template usage at limit
        $this->setUsage($workspace, now()->format('Y-m'), 0, 1000);

        // Try to send template (should be blocked)
        $template = \App\Modules\WhatsApp\Models\WhatsAppTemplate::factory()->create([
            'workspace_id' => $workspace->id,
        ]);

        $response = $this->post(route('app.whatsapp.templates.send.store', [
            'workspace' => $workspace->slug,
            'template' => $template->id,
        ]), [
            'to_wa_id' => '1234567890',
            'variables' => [],
        ]);

        $response->assertStatus(402);
        $response->assertSee('template_sends_monthly');
    }
}
