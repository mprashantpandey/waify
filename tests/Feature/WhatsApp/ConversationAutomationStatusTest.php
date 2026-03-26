<?php

namespace Tests\Feature\WhatsApp;

use App\Models\Account;
use App\Models\User;
use App\Modules\WhatsApp\Models\WhatsAppConnection;
use App\Modules\WhatsApp\Models\WhatsAppContact;
use App\Modules\WhatsApp\Models\WhatsAppConversation;
use App\Modules\WhatsApp\Services\ConversationAutomationService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ConversationAutomationStatusTest extends TestCase
{
    use RefreshDatabase;

    public function test_chatbot_handoff_is_presented_as_human_assignment(): void
    {
        $owner = User::factory()->create();
        $agent = User::factory()->create(['name' => 'Prashant']);
        $account = Account::factory()->create(['owner_id' => $owner->id]);
        $connection = WhatsAppConnection::factory()->create(['account_id' => $account->id]);
        $contact = WhatsAppContact::factory()->create(['account_id' => $account->id]);
        $conversation = WhatsAppConversation::factory()->create([
            'account_id' => $account->id,
            'whatsapp_connection_id' => $connection->id,
            'whatsapp_contact_id' => $contact->id,
            'assigned_to' => $agent->id,
        ]);

        $service = app(ConversationAutomationService::class);
        $service->markHumanAssigned($conversation, 'chatbot', 'handed_off');

        $presented = $service->present($conversation->fresh('assignee'));

        $this->assertSame('human', $presented['actor']);
        $this->assertSame('Handed to human by chatbot', $presented['label']);
        $this->assertSame('Assigned to Prashant.', $presented['description']);
    }

    public function test_clearing_assignment_stops_human_automation_state(): void
    {
        $owner = User::factory()->create();
        $account = Account::factory()->create(['owner_id' => $owner->id]);
        $connection = WhatsAppConnection::factory()->create(['account_id' => $account->id]);
        $contact = WhatsAppContact::factory()->create(['account_id' => $account->id]);
        $conversation = WhatsAppConversation::factory()->create([
            'account_id' => $account->id,
            'whatsapp_connection_id' => $connection->id,
            'whatsapp_contact_id' => $contact->id,
        ]);

        $service = app(ConversationAutomationService::class);
        $service->markHumanAssigned($conversation, 'human');
        $service->clearHumanAssignment($conversation);

        $presented = $service->present($conversation->fresh());

        $this->assertNull($presented);
    }
}
