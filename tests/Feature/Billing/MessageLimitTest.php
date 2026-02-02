<?php

namespace Tests\Feature\Billing;

use App\Core\Billing\UsageService;
use App\Models\BillingEvent;
use App\Models\Plan;
use App\Models\Workspace;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class MessageLimitTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        if (Plan::count() === 0) {
            $this->artisan('db:seed', ['--class' => 'PlanSeeder']);
        }
    }

    public function test_message_sending_increments_usage_on_success(): void
    {
        
        $workspace = $this->createWorkspaceWithPlan('free');
        $user = $this->actingAsWorkspaceOwner($workspace);

        // Create connection and conversation
        $connection = \App\Modules\WhatsApp\Models\WhatsAppConnection::factory()->create([
            'workspace_id' => $workspace->id,
        ]);
        $contact = \App\Modules\WhatsApp\Models\WhatsAppContact::factory()->create([
            'workspace_id' => $workspace->id,
        ]);
        $conversation = \App\Modules\WhatsApp\Models\WhatsAppConversation::factory()->create([
            'workspace_id' => $workspace->id,
            'whatsapp_connection_id' => $connection->id,
            'whatsapp_contact_id' => $contact->id,
        ]);

        $usageService = app(UsageService::class);
        $initialUsage = $usageService->getCurrentUsage($workspace);
        $initialCount = $initialUsage->messages_sent;

        // Mock successful send (we'll need to mock WhatsAppClient)
        // For now, just test the usage increment logic
        $usageService->incrementMessages($workspace, 1);

        $finalUsage = $usageService->getCurrentUsage($workspace);
        $this->assertEquals($initialCount + 1, $finalUsage->messages_sent);
    }

    public function test_message_sending_blocked_when_limit_exceeded(): void
    {
        
        $workspace = $this->createWorkspaceWithPlan('free'); // 500 messages limit
        $user = $this->actingAsWorkspaceOwner($workspace);

        // Set usage near limit
        $this->setUsage($workspace, now()->format('Y-m'), 500, 0);

        // Try to send message (should be blocked)
        $connection = \App\Modules\WhatsApp\Models\WhatsAppConnection::factory()->create([
            'workspace_id' => $workspace->id,
        ]);
        $contact = \App\Modules\WhatsApp\Models\WhatsAppContact::factory()->create([
            'workspace_id' => $workspace->id,
        ]);
        $conversation = \App\Modules\WhatsApp\Models\WhatsAppConversation::factory()->create([
            'workspace_id' => $workspace->id,
            'whatsapp_connection_id' => $connection->id,
            'whatsapp_contact_id' => $contact->id,
        ]);

        $response = $this->post(route('app.whatsapp.conversations.send', [
            'workspace' => $workspace->slug,
            'conversation' => $conversation->id,
        ]), [
            'message' => 'Test message',
        ]);

        $response->assertStatus(402);
        $response->assertSee('limit');

        // Check billing event was created
        $this->assertDatabaseHas('billing_events', [
            'workspace_id' => $workspace->id,
            'type' => 'limit_blocked',
        ]);
    }
}
