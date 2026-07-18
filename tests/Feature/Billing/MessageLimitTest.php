<?php

namespace Tests\Feature\Billing;

use App\Core\Billing\UsageService;
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

        $account = $this->createAccountWithPlan('starter');
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

        \App\Modules\WhatsApp\Models\WhatsAppMessage::factory()->create([
            'account_id' => $account->id,
            'whatsapp_conversation_id' => $conversation->id,
            'direction' => 'outbound',
            'status' => 'sent',
            'sent_at' => now(),
        ]);

        $usageService->incrementMessages($account, 1);

        $finalUsage = $usageService->getCurrentUsage($account);
        $this->assertEquals($initialCount + 1, $finalUsage->messages_sent);
    }

    public function test_message_sending_blocked_when_limit_exceeded(): void
    {

        $account = $this->createAccountWithPlan('starter');
        $user = $this->actingAsAccountOwner($account);

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

        \App\Modules\WhatsApp\Models\WhatsAppMessage::factory()->create([
            'account_id' => $account->id,
            'whatsapp_conversation_id' => $conversation->id,
            'direction' => 'inbound',
            'received_at' => now(),
        ]);

        $rows = [];
        $now = now();
        for ($i = 0; $i < 5000; $i++) {
            $rows[] = [
                'account_id' => $account->id,
                'whatsapp_conversation_id' => $conversation->id,
                'direction' => 'outbound',
                'meta_message_id' => 'wamid.quota-'.$i,
                'type' => 'text',
                'text_body' => 'Quota seed',
                'status' => 'sent',
                'sent_at' => $now,
                'created_at' => $now,
                'updated_at' => $now,
            ];
        }
        \App\Modules\WhatsApp\Models\WhatsAppMessage::insert($rows);

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
