<?php

namespace Tests\Feature\Billing;

use App\Core\Billing\UsageService;
use App\Models\BillingEvent;
use App\Models\Plan;
use App\Models\Account;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class MessageLimitTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->artisan('db:seed', ['--class' => 'ModuleSeeder']);
        $this->artisan('db:seed', ['--class' => 'PlanSeeder']);
    }

    public function test_message_sending_increments_usage_on_success(): void
    {
        
        $account = $this->createAccountWithPlan('free');
        $user = $this->actingAsAccountOwner($account);

        // Create connection and conversation
        $connection = \App\Modules\WhatsApp\Models\WhatsAppConnection::factory()->create([
            'account_id' => $account->id,
        ]);
        $contact = \App\Modules\WhatsApp\Models\WhatsAppContact::factory()->create([
            'account_id' => $account->id,
        ]);
        $conversation = \App\Modules\WhatsApp\Models\WhatsAppConversation::factory()->create([
            'account_id' => $account->id,
            'whatsapp_connection_id' => $connection->id,
            'whatsapp_contact_id' => $contact->id,
        ]);

        $usageService = app(UsageService::class);
        $initialUsage = $usageService->getCurrentUsage($account);
        $initialCount = $initialUsage->messages_sent;

        // Mock successful send (we'll need to mock WhatsAppClient)
        // For now, just test the usage increment logic
        $usageService->incrementMessages($account, 1);

        $finalUsage = $usageService->getCurrentUsage($account);
        $this->assertEquals($initialCount + 1, $finalUsage->messages_sent);
    }

    public function test_message_sending_blocked_when_limit_exceeded(): void
    {
        
        $account = $this->createAccountWithPlan('free'); // 500 messages limit
        $user = $this->actingAsAccountOwner($account);

        // Set usage near limit
        $this->setUsage($account, now()->format('Y-m'), 500, 0);

        // Try to send message (should be blocked)
        $connection = \App\Modules\WhatsApp\Models\WhatsAppConnection::factory()->create([
            'account_id' => $account->id,
        ]);
        $contact = \App\Modules\WhatsApp\Models\WhatsAppContact::factory()->create([
            'account_id' => $account->id,
        ]);
        $conversation = \App\Modules\WhatsApp\Models\WhatsAppConversation::factory()->create([
            'account_id' => $account->id,
            'whatsapp_connection_id' => $connection->id,
            'whatsapp_contact_id' => $contact->id,
        ]);

        $response = $this->post(route('app.whatsapp.conversations.send', [
            'account' => $account->slug,
            'conversation' => $conversation->id,
        ]), [
            'message' => 'Test message',
        ]);

        $response->assertStatus(402);

        // Check billing event was created
        $this->assertDatabaseHas('billing_events', [
            'account_id' => $account->id,
            'type' => 'limit_blocked',
        ]);
    }
}
