<?php

namespace Tests\Feature\AI;

use App\Core\Billing\SubscriptionService;
use App\Core\Billing\UsageService;
use App\Models\Account;
use App\Models\AccountModule;
use App\Models\AiKnowledgeItem;
use App\Models\Plan;
use App\Models\PlatformSetting;
use App\Models\User;
use App\Modules\WhatsApp\Models\WhatsAppConversation;
use App\Modules\WhatsApp\Models\WhatsAppConversationAuditEvent;
use App\Modules\WhatsApp\Models\WhatsAppContact;
use App\Modules\WhatsApp\Models\WhatsAppConnection;
use App\Modules\WhatsApp\Models\WhatsAppMessage;
use App\Modules\WhatsApp\Services\WhatsAppClient;
use App\Services\AI\AiAutoReplyService;
use App\Services\AI\ConversationAssistantService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AiAutoReplyTest extends TestCase
{
    use RefreshDatabase;

    protected User $owner;
    protected Account $account;

    protected function setUp(): void
    {
        parent::setUp();

        $this->artisan('db:seed', ['--class' => 'ModuleSeeder']);
        $this->artisan('db:seed', ['--class' => 'PlanSeeder']);
        \App\Models\Module::where('key', 'ai')->update(['is_enabled' => true]);

        $this->owner = User::factory()->create();
        $this->account = Account::factory()->create([
            'owner_id' => $this->owner->id,
            'ai_auto_reply_enabled' => true,
            'ai_auto_reply_mode' => 'auto_reply_window',
            'ai_auto_reply_stop_when_assigned' => true,
            'ai_auto_reply_prompt' => 'Reply briefly and only using approved facts.',
            'ai_auto_reply_handoff_message' => 'A team member will get back to you shortly.',
            'ai_auto_reply_handoff_keywords' => ['refund'],
        ]);
        $this->account->users()->attach($this->owner->id, ['role' => 'owner']);

        app(SubscriptionService::class)->changePlan(
            $this->account,
            Plan::where('key', 'enterprise')->firstOrFail(),
            $this->owner
        );

        AccountModule::updateOrCreate(
            ['account_id' => $this->account->id, 'module_key' => 'ai'],
            ['enabled' => true]
        );

        PlatformSetting::set('ai.enabled', true, 'boolean', 'ai');
        PlatformSetting::set('ai.provider', 'openai', 'string', 'ai');
    }

    public function test_owner_can_save_auto_reply_settings_and_knowledge_items(): void
    {
        $response = $this->actingAs($this->owner)
            ->withSession(['current_account_id' => $this->account->id])
            ->post(route('app.ai.settings'), [
                'ai_suggestions_enabled' => true,
                'ai_prompts' => [],
                'account_ai' => [
                    'enabled' => true,
                    'mode' => 'auto_reply_window',
                    'prompt' => 'Reply in a calm support tone.',
                    'handoff_message' => 'Our team will review this shortly.',
                    'handoff_keywords' => 'refund, complaint',
                    'stop_when_assigned' => true,
                ],
                'knowledge_items' => [
                    [
                        'title' => 'Working hours',
                        'content' => 'We are available Monday to Saturday from 9 AM to 6 PM IST.',
                        'is_enabled' => true,
                        'sort_order' => 0,
                    ],
                ],
            ]);

        $response->assertSessionHas('success', 'AI settings saved.');

        $this->assertTrue((bool) $this->owner->fresh()->ai_suggestions_enabled);
        $this->assertTrue((bool) $this->account->fresh()->ai_auto_reply_enabled);
        $this->assertSame('auto_reply_window', $this->account->fresh()->ai_auto_reply_mode);
        $this->assertSame(['refund', 'complaint'], $this->account->fresh()->ai_auto_reply_handoff_keywords);
        $this->assertDatabaseHas('ai_knowledge_items', [
            'account_id' => $this->account->id,
            'title' => 'Working hours',
        ]);
    }

    public function test_member_cannot_change_account_level_auto_reply_settings(): void
    {
        $member = User::factory()->create();
        $this->account->users()->attach($member->id, ['role' => 'member']);

        $response = $this->actingAs($member)
            ->withSession(['current_account_id' => $this->account->id])
            ->post(route('app.ai.settings'), [
                'ai_suggestions_enabled' => true,
                'ai_prompts' => [],
                'account_ai' => [
                    'enabled' => false,
                    'mode' => 'suggest_only',
                    'prompt' => 'Do not save this.',
                    'handoff_message' => 'No change.',
                    'handoff_keywords' => 'legal',
                    'stop_when_assigned' => false,
                ],
                'knowledge_items' => [
                    [
                        'title' => 'Unauthorized',
                        'content' => 'Should not be saved.',
                        'is_enabled' => true,
                        'sort_order' => 0,
                    ],
                ],
            ]);

        $response->assertSessionHas('success', 'AI settings saved.');

        $this->assertTrue((bool) $member->fresh()->ai_suggestions_enabled);
        $this->assertTrue((bool) $this->account->fresh()->ai_auto_reply_enabled);
        $this->assertDatabaseCount('ai_knowledge_items', 0);
    }

    public function test_ai_auto_reply_service_sends_reply_when_eligible(): void
    {
        AiKnowledgeItem::create([
            'account_id' => $this->account->id,
            'title' => 'Working hours',
            'content' => 'We are open Monday to Saturday from 9 AM to 6 PM IST.',
            'is_enabled' => true,
            'sort_order' => 0,
        ]);

        $connection = WhatsAppConnection::factory()->create([
            'account_id' => $this->account->id,
            'is_active' => true,
            'activation_state' => 'active',
        ]);
        $contact = WhatsAppContact::factory()->create([
            'account_id' => $this->account->id,
        ]);
        $conversation = WhatsAppConversation::factory()->create([
            'account_id' => $this->account->id,
            'whatsapp_connection_id' => $connection->id,
            'whatsapp_contact_id' => $contact->id,
            'assigned_to' => null,
            'last_inbound_at' => now(),
            'service_window_expires_at' => now()->addHours(24),
        ]);
        $message = WhatsAppMessage::create([
            'account_id' => $this->account->id,
            'whatsapp_conversation_id' => $conversation->id,
            'direction' => 'inbound',
            'type' => 'text',
            'text_body' => 'What are your working hours?',
            'status' => 'received',
            'received_at' => now(),
        ]);

        $this->mock(ConversationAssistantService::class, function ($mock): void {
            $mock->shouldReceive('suggestReply')
                ->once()
                ->andReturn('We are open Monday to Saturday from 9 AM to 6 PM IST.');
        });

        $this->mock(WhatsAppClient::class, function ($mock): void {
            $mock->shouldReceive('sendTextMessage')
                ->once()
                ->andReturn(['messages' => [['id' => 'wamid.auto.reply.1']]]);
        });

        app(AiAutoReplyService::class)->processInboundMessage($message);

        $this->assertDatabaseHas('whatsapp_messages', [
            'whatsapp_conversation_id' => $conversation->id,
            'direction' => 'outbound',
            'text_body' => 'We are open Monday to Saturday from 9 AM to 6 PM IST.',
            'status' => 'sent',
        ]);
        $this->assertDatabaseHas('whatsapp_conversation_audit_events', [
            'whatsapp_conversation_id' => $conversation->id,
            'event_type' => 'ai_auto_reply_sent',
        ]);

        $usage = app(UsageService::class)->getCurrentUsage($this->account);
        $this->assertSame(1, (int) $usage->ai_credits_used);
        $this->assertSame(1, (int) $usage->messages_sent);
        $this->assertSame('ai', data_get($conversation->fresh()->metadata, 'automation.current_actor'));
    }

    public function test_ai_auto_reply_service_skips_assigned_conversations(): void
    {
        $connection = WhatsAppConnection::factory()->create([
            'account_id' => $this->account->id,
        ]);
        $contact = WhatsAppContact::factory()->create([
            'account_id' => $this->account->id,
        ]);
        $conversation = WhatsAppConversation::factory()->create([
            'account_id' => $this->account->id,
            'whatsapp_connection_id' => $connection->id,
            'whatsapp_contact_id' => $contact->id,
            'assigned_to' => $this->owner->id,
            'last_inbound_at' => now(),
            'service_window_expires_at' => now()->addHours(24),
        ]);
        $message = WhatsAppMessage::create([
            'account_id' => $this->account->id,
            'whatsapp_conversation_id' => $conversation->id,
            'direction' => 'inbound',
            'type' => 'text',
            'text_body' => 'Need help',
            'status' => 'received',
            'received_at' => now(),
        ]);

        app(AiAutoReplyService::class)->processInboundMessage($message);

        $this->assertDatabaseMissing('whatsapp_messages', [
            'whatsapp_conversation_id' => $conversation->id,
            'direction' => 'outbound',
        ]);
        $this->assertDatabaseHas('whatsapp_conversation_audit_events', [
            'whatsapp_conversation_id' => $conversation->id,
            'event_type' => 'ai_auto_reply_skipped',
        ]);

        $audit = WhatsAppConversationAuditEvent::query()
            ->where('whatsapp_conversation_id', $conversation->id)
            ->latest('id')
            ->first();

        $this->assertSame('assigned_to_human', data_get($audit?->meta, 'reason_code'));
    }
}
