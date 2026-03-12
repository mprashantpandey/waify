<?php

namespace Tests\Unit\WhatsApp;

use App\Models\Account;
use App\Modules\WhatsApp\Models\WhatsAppConnection;
use App\Modules\WhatsApp\Models\WhatsAppContact;
use App\Modules\WhatsApp\Models\WhatsAppConversation;
use App\Modules\WhatsApp\Models\WhatsAppMessage;
use App\Modules\WhatsApp\Services\SendPolicyService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Carbon;
use Tests\TestCase;

class SendPolicyServiceTest extends TestCase
{
    use RefreshDatabase;

    public function test_conversation_free_form_is_blocked_outside_24h_window(): void
    {
        $conversation = $this->makeConversationGraph();
        WhatsAppMessage::factory()->create([
            'account_id' => $conversation->account_id,
            'whatsapp_conversation_id' => $conversation->id,
            'direction' => 'inbound',
            'received_at' => now()->subHours(25),
            'created_at' => now()->subHours(25),
        ]);

        $policy = app(SendPolicyService::class)->evaluateConversationFreeForm($conversation);

        $this->assertFalse($policy['allowed']);
        $this->assertSame('outside_24h', $policy['reason_code']);
    }

    public function test_conversation_free_form_is_allowed_on_24h_boundary(): void
    {
        $conversation = $this->makeConversationGraph();
        $anchor = Carbon::parse('2026-03-12 10:00:00', 'Asia/Kolkata');

        WhatsAppMessage::factory()->create([
            'account_id' => $conversation->account_id,
            'whatsapp_conversation_id' => $conversation->id,
            'direction' => 'inbound',
            'received_at' => $anchor->copy(),
            'created_at' => $anchor->copy(),
        ]);

        $policy = app(SendPolicyService::class)->evaluateConversationFreeForm(
            $conversation,
            $anchor->copy()->addHours(24)
        );

        $this->assertTrue($policy['allowed']);
    }

    public function test_recipient_free_form_requires_template_when_conversation_missing(): void
    {
        $account = Account::factory()->create();
        $connection = WhatsAppConnection::factory()->create(['account_id' => $account->id]);

        $policy = app(SendPolicyService::class)->evaluateRecipientFreeForm(
            (int) $account->id,
            (int) $connection->id,
            '919999999999'
        );

        $this->assertFalse($policy['allowed']);
        $this->assertSame('template_required', $policy['reason_code']);
    }

    public function test_recipient_free_form_is_allowed_when_recent_inbound_exists(): void
    {
        $conversation = $this->makeConversationGraph('919000000001');
        WhatsAppMessage::factory()->create([
            'account_id' => $conversation->account_id,
            'whatsapp_conversation_id' => $conversation->id,
            'direction' => 'inbound',
            'received_at' => now()->subMinutes(10),
            'created_at' => now()->subMinutes(10),
        ]);

        $policy = app(SendPolicyService::class)->evaluateRecipientFreeForm(
            (int) $conversation->account_id,
            (int) $conversation->whatsapp_connection_id,
            '919000000001'
        );

        $this->assertTrue($policy['allowed']);
        $this->assertSame($conversation->id, $policy['conversation_id']);
    }

    private function makeConversationGraph(string $waId = '919000000000'): WhatsAppConversation
    {
        $account = Account::factory()->create();
        $connection = WhatsAppConnection::factory()->create([
            'account_id' => $account->id,
        ]);
        $contact = WhatsAppContact::factory()->create([
            'account_id' => $account->id,
            'wa_id' => $waId,
        ]);

        return WhatsAppConversation::factory()->create([
            'account_id' => $account->id,
            'whatsapp_connection_id' => $connection->id,
            'whatsapp_contact_id' => $contact->id,
        ]);
    }
}

