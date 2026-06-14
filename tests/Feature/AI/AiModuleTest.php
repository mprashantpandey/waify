<?php

namespace Tests\Feature\AI;

use App\Models\Account;
use App\Models\AccountModule;
use App\Models\AiAgent;
use App\Models\Plan;
use App\Models\PlatformSetting;
use App\Models\User;
use App\Modules\WhatsApp\Models\WhatsAppConnection;
use App\Modules\WhatsApp\Models\WhatsAppContact;
use App\Modules\WhatsApp\Models\WhatsAppConversation;
use App\Modules\WhatsApp\Models\WhatsAppMessage;
use App\Modules\WhatsApp\Services\WhatsAppClient;
use App\Services\AI\AiAgentAutopilotService;
use App\Services\AI\ConversationAssistantService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class AiModuleTest extends TestCase
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
        ]);
        $this->account->users()->attach($this->owner->id, ['role' => 'owner']);

        app(\App\Core\Billing\SubscriptionService::class)->changePlan(
            $this->account,
            Plan::where('key', 'business')->firstOrFail(),
            $this->owner
        );

        AccountModule::updateOrCreate(
            ['account_id' => $this->account->id, 'module_key' => 'ai'],
            ['enabled' => true]
        );
    }

    public function test_owner_can_open_ai_page_with_normalized_platform_ai_flags(): void
    {
        PlatformSetting::set('ai.enabled', '0', 'string', 'ai');
        PlatformSetting::set('ai.provider', 'openai', 'string', 'ai');

        $response = $this->actingAs($this->owner)
            ->withSession(['current_account_id' => $this->account->id])
            ->get(route('app.ai.index'));

        $response->assertStatus(200);
        $response->assertInertia(fn (Assert $page) => $page
            ->component('Ai/Index')
            ->where('platform_ai_enabled', false)
            ->where('platform_ai_provider', 'openai')
        );
    }

    public function test_chat_agent_member_can_access_ai_page(): void
    {
        $member = User::factory()->create();
        $this->account->users()->attach($member->id, ['role' => 'member']);

        $response = $this->actingAs($member)
            ->withSession(['current_account_id' => $this->account->id])
            ->get(route('app.ai.index'));

        $response->assertStatus(200);
    }

    public function test_owner_can_manage_workspace_ai_agents(): void
    {
        $payload = [
            'name' => 'Sales concierge',
            'avatar' => '🤖',
            'role' => 'sales_support',
            'language' => 'en',
            'tone' => 'friendly',
            'mode' => 'approval',
            'is_active' => true,
            'instructions' => 'Qualify leads and ask one clear next question.',
            'knowledge_sources' => ['recent_conversation', 'contact_profile', 'quick_replies'],
            'guardrails' => ['handoff_when_unsure', 'no_policy_promises'],
            'escalation_rules' => ['keywords' => ['refund', 'complaint']],
            'max_auto_replies_per_conversation' => 2,
            'confidence_threshold' => 0.8,
        ];

        $response = $this->actingAs($this->owner)
            ->withSession(['current_account_id' => $this->account->id])
            ->post(route('app.ai.agents.store'), $payload);

        $response->assertRedirect();
        $agent = AiAgent::firstOrFail();
        $this->assertSame($this->account->id, $agent->account_id);
        $this->assertSame('Sales concierge', $agent->name);
        $this->assertSame(['refund', 'complaint'], $agent->escalation_rules['keywords']);

        $this->actingAs($this->owner)
            ->withSession(['current_account_id' => $this->account->id])
            ->patch(route('app.ai.agents.update', $agent), array_merge($payload, [
                'name' => 'Support concierge',
                'mode' => 'suggest',
            ]))
            ->assertRedirect();

        $this->assertSame('Support concierge', $agent->fresh()->name);

        $this->actingAs($this->owner)
            ->withSession(['current_account_id' => $this->account->id])
            ->get(route('app.ai.index'))
            ->assertInertia(fn (Assert $page) => $page
                ->component('Ai/Index')
                ->where('ai_agents.0.name', 'Support concierge')
            );
    }

    public function test_member_cannot_manage_workspace_ai_agents(): void
    {
        $member = User::factory()->create();
        $this->account->users()->attach($member->id, ['role' => 'member']);

        $this->actingAs($member)
            ->withSession(['current_account_id' => $this->account->id])
            ->post(route('app.ai.agents.store'), [
                'name' => 'Member agent',
                'role' => 'support',
                'language' => 'en',
                'tone' => 'professional',
                'mode' => 'suggest',
                'is_active' => true,
            ])
            ->assertForbidden();
    }

    public function test_ai_suggest_endpoint_respects_platform_toggle_even_with_string_zero_setting(): void
    {
        PlatformSetting::set('ai.enabled', '0', 'string', 'ai');

        $this->owner->update([
            'ai_suggestions_enabled' => true,
        ]);

        $connection = WhatsAppConnection::factory()->create([
            'account_id' => $this->account->id,
            'is_active' => true,
        ]);

        $contact = WhatsAppContact::factory()->create([
            'account_id' => $this->account->id,
        ]);

        $conversation = WhatsAppConversation::factory()->create([
            'account_id' => $this->account->id,
            'whatsapp_connection_id' => $connection->id,
            'whatsapp_contact_id' => $contact->id,
        ]);

        $response = $this->actingAs($this->owner)
            ->withSession(['current_account_id' => $this->account->id])
            ->post(route('app.whatsapp.conversations.ai-suggest', [
                'conversation' => $conversation->id,
            ]));

        $response
            ->assertStatus(403)
            ->assertJson([
                'error' => 'AI is disabled in platform settings.',
            ]);
    }

    public function test_ai_suggest_endpoint_can_use_selected_workspace_agent(): void
    {
        PlatformSetting::set('ai.enabled', '1', 'string', 'ai');

        $this->owner->update([
            'ai_suggestions_enabled' => true,
        ]);

        $agent = AiAgent::create([
            'account_id' => $this->account->id,
            'created_by' => $this->owner->id,
            'name' => 'Support concierge',
            'role' => 'support',
            'tone' => 'friendly',
            'mode' => 'suggest',
            'is_active' => true,
            'instructions' => 'Keep replies warm and practical.',
        ]);

        $connection = WhatsAppConnection::factory()->create([
            'account_id' => $this->account->id,
            'is_active' => true,
        ]);

        $contact = WhatsAppContact::factory()->create([
            'account_id' => $this->account->id,
        ]);

        $conversation = WhatsAppConversation::factory()->create([
            'account_id' => $this->account->id,
            'whatsapp_connection_id' => $connection->id,
            'whatsapp_contact_id' => $contact->id,
        ]);

        $this->mock(ConversationAssistantService::class, function ($mock) use ($conversation, $agent) {
            $mock->shouldReceive('suggestReply')
                ->once()
                ->withArgs(fn ($actualConversation, $limit, $instruction, $actualAgent) => (
                    $actualConversation->is($conversation)
                    && $limit === 25
                    && $actualAgent?->is($agent)
                ))
                ->andReturn('Happy to help with that.');
        });

        $this->actingAs($this->owner)
            ->withSession(['current_account_id' => $this->account->id])
            ->postJson(route('app.whatsapp.conversations.ai-suggest', [
                'conversation' => $conversation->id,
            ]), ['agent_id' => $agent->id])
            ->assertOk()
            ->assertJson([
                'suggestion' => 'Happy to help with that.',
                'agent' => [
                    'id' => $agent->id,
                    'name' => 'Support concierge',
                    'mode' => 'suggest',
                ],
            ]);
    }

    public function test_autopilot_agent_replies_to_inbound_text_message(): void
    {
        PlatformSetting::set('ai.enabled', '1', 'string', 'ai');

        $agent = AiAgent::create([
            'account_id' => $this->account->id,
            'created_by' => $this->owner->id,
            'name' => 'Auto support',
            'role' => 'support',
            'tone' => 'friendly',
            'mode' => 'autopilot',
            'is_active' => true,
            'instructions' => 'Answer simple support questions.',
            'max_auto_replies_per_conversation' => 3,
        ]);

        $connection = WhatsAppConnection::factory()->create([
            'account_id' => $this->account->id,
            'is_active' => true,
            'access_token' => 'test-token',
            'phone_number_id' => '123456',
        ]);

        $contact = WhatsAppContact::factory()->create([
            'account_id' => $this->account->id,
            'wa_id' => '919876543210',
        ]);

        $conversation = WhatsAppConversation::factory()->create([
            'account_id' => $this->account->id,
            'whatsapp_connection_id' => $connection->id,
            'whatsapp_contact_id' => $contact->id,
            'status' => 'open',
        ]);

        $inbound = WhatsAppMessage::factory()->create([
            'account_id' => $this->account->id,
            'whatsapp_conversation_id' => $conversation->id,
            'direction' => 'inbound',
            'type' => 'text',
            'text_body' => 'Do you ship today?',
            'meta_message_id' => 'wamid.inbound-1',
            'status' => 'delivered',
            'received_at' => now(),
        ]);

        $this->mock(ConversationAssistantService::class, function ($mock) use ($conversation, $agent) {
            $mock->shouldReceive('suggestReply')
                ->once()
                ->withArgs(fn ($actualConversation, $limit, $instruction, $actualAgent) => (
                    $actualConversation->is($conversation)
                    && $limit === 25
                    && str_contains($instruction, 'replying directly')
                    && $actualAgent?->is($agent)
                ))
                ->andReturn('Yes, we can help you with shipping today.');
        });

        $this->mock(WhatsAppClient::class, function ($mock) use ($connection) {
            $mock->shouldReceive('sendTextMessage')
                ->once()
                ->withArgs(fn ($actualConnection, $to, $body, $replyTo) => (
                    $actualConnection->is($connection)
                    && $to === '919876543210'
                    && $body === 'Yes, we can help you with shipping today.'
                    && $replyTo === 'wamid.inbound-1'
                ))
                ->andReturn(['messages' => [['id' => 'wamid.ai-outbound-1']]]);
        });

        app(AiAgentAutopilotService::class)->process($inbound, $conversation);

        $this->assertDatabaseHas('whatsapp_messages', [
            'account_id' => $this->account->id,
            'whatsapp_conversation_id' => $conversation->id,
            'direction' => 'outbound',
            'type' => 'text',
            'text_body' => 'Yes, we can help you with shipping today.',
            'status' => 'sent',
            'meta_message_id' => 'wamid.ai-outbound-1',
        ]);

        $this->assertDatabaseHas('ai_agent_runs', [
            'account_id' => $this->account->id,
            'ai_agent_id' => $agent->id,
            'inbound_message_id' => $inbound->id,
            'status' => 'sent',
        ]);

        $this->assertDatabaseHas('ai_usage_logs', [
            'account_id' => $this->account->id,
            'user_id' => $this->owner->id,
            'feature' => 'agent_autopilot',
        ]);
    }

    public function test_autopilot_normalizes_ai_reply_to_whatsapp_formatting(): void
    {
        PlatformSetting::set('ai.enabled', '1', 'string', 'ai');

        $agent = AiAgent::create([
            'account_id' => $this->account->id,
            'created_by' => $this->owner->id,
            'name' => 'Auto sales',
            'role' => 'sales',
            'tone' => 'friendly',
            'mode' => 'autopilot',
            'is_active' => true,
            'instructions' => 'Answer pricing questions.',
            'max_auto_replies_per_conversation' => 3,
        ]);

        $connection = WhatsAppConnection::factory()->create([
            'account_id' => $this->account->id,
            'is_active' => true,
            'access_token' => 'test-token',
            'phone_number_id' => '123456',
        ]);

        $contact = WhatsAppContact::factory()->create([
            'account_id' => $this->account->id,
            'wa_id' => '919876543210',
        ]);

        $conversation = WhatsAppConversation::factory()->create([
            'account_id' => $this->account->id,
            'whatsapp_connection_id' => $connection->id,
            'whatsapp_contact_id' => $contact->id,
            'status' => 'open',
        ]);

        $inbound = WhatsAppMessage::factory()->create([
            'account_id' => $this->account->id,
            'whatsapp_conversation_id' => $conversation->id,
            'direction' => 'inbound',
            'type' => 'text',
            'text_body' => 'Share pricing',
            'meta_message_id' => 'wamid.inbound-formatting',
            'status' => 'delivered',
            'received_at' => now(),
        ]);

        $expected = "*Starter:* Rs. 999/month\n- Inbox\n- Templates";

        $this->mock(ConversationAssistantService::class, function ($mock) {
            $mock->shouldReceive('suggestReply')
                ->once()
                ->andReturn("**Starter:** Rs. 999/month\n* Inbox\n* Templates");
        });

        $this->mock(WhatsAppClient::class, function ($mock) use ($connection, $expected) {
            $mock->shouldReceive('sendTextMessage')
                ->once()
                ->withArgs(fn ($actualConnection, $to, $body, $replyTo) => (
                    $actualConnection->is($connection)
                    && $to === '919876543210'
                    && $body === $expected
                    && $replyTo === 'wamid.inbound-formatting'
                ))
                ->andReturn(['messages' => [['id' => 'wamid.ai-formatting']]]);
        });

        $result = app(AiAgentAutopilotService::class)->process($inbound, $conversation);

        $this->assertSame('sent', $result['status']);
        $this->assertDatabaseHas('whatsapp_messages', [
            'account_id' => $this->account->id,
            'whatsapp_conversation_id' => $conversation->id,
            'direction' => 'outbound',
            'text_body' => $expected,
            'meta_message_id' => 'wamid.ai-formatting',
        ]);
    }

    public function test_autopilot_agent_skips_escalation_keywords(): void
    {
        PlatformSetting::set('ai.enabled', '1', 'string', 'ai');

        $agent = AiAgent::create([
            'account_id' => $this->account->id,
            'created_by' => $this->owner->id,
            'name' => 'Auto support',
            'role' => 'support',
            'tone' => 'friendly',
            'mode' => 'autopilot',
            'is_active' => true,
            'escalation_rules' => ['keywords' => ['refund']],
        ]);

        $connection = WhatsAppConnection::factory()->create([
            'account_id' => $this->account->id,
            'is_active' => true,
        ]);

        $contact = WhatsAppContact::factory()->create([
            'account_id' => $this->account->id,
        ]);

        $conversation = WhatsAppConversation::factory()->create([
            'account_id' => $this->account->id,
            'whatsapp_connection_id' => $connection->id,
            'whatsapp_contact_id' => $contact->id,
            'status' => 'open',
        ]);

        $inbound = WhatsAppMessage::factory()->create([
            'account_id' => $this->account->id,
            'whatsapp_conversation_id' => $conversation->id,
            'direction' => 'inbound',
            'type' => 'text',
            'text_body' => 'I want a refund.',
            'meta_message_id' => 'wamid.inbound-2',
            'status' => 'delivered',
        ]);

        app(AiAgentAutopilotService::class)->process($inbound, $conversation);

        $this->assertSame(0, WhatsAppMessage::where('direction', 'outbound')->where('whatsapp_conversation_id', $conversation->id)->count());
        $this->assertDatabaseHas('ai_agent_runs', [
            'account_id' => $this->account->id,
            'ai_agent_id' => $agent->id,
            'inbound_message_id' => $inbound->id,
            'status' => 'skipped',
            'reason' => 'escalation_keyword',
        ]);
    }

    public function test_autopilot_does_not_treat_chatbot_outbound_as_human_reply(): void
    {
        PlatformSetting::set('ai.enabled', '1', 'string', 'ai');

        $agent = AiAgent::create([
            'account_id' => $this->account->id,
            'created_by' => $this->owner->id,
            'name' => 'Auto sales',
            'role' => 'sales',
            'tone' => 'friendly',
            'mode' => 'autopilot',
            'is_active' => true,
            'max_auto_replies_per_conversation' => 3,
        ]);

        $connection = WhatsAppConnection::factory()->create([
            'account_id' => $this->account->id,
            'is_active' => true,
            'access_token' => 'test-token',
            'phone_number_id' => '123456',
        ]);
        $contact = WhatsAppContact::factory()->create([
            'account_id' => $this->account->id,
            'wa_id' => '919876543210',
        ]);
        $conversation = WhatsAppConversation::factory()->create([
            'account_id' => $this->account->id,
            'whatsapp_connection_id' => $connection->id,
            'whatsapp_contact_id' => $contact->id,
            'status' => 'open',
        ]);

        WhatsAppMessage::factory()->create([
            'account_id' => $this->account->id,
            'whatsapp_conversation_id' => $conversation->id,
            'direction' => 'outbound',
            'type' => 'text',
            'text_body' => 'Automation first reply',
            'payload' => ['automation' => 'chatbot_flow'],
            'created_at' => now()->subMinute(),
        ]);

        $inbound = WhatsAppMessage::factory()->create([
            'account_id' => $this->account->id,
            'whatsapp_conversation_id' => $conversation->id,
            'direction' => 'inbound',
            'type' => 'text',
            'text_body' => 'Tell me more about pricing',
            'meta_message_id' => 'wamid.inbound-after-bot',
            'status' => 'delivered',
        ]);

        $this->mock(ConversationAssistantService::class, function ($mock) use ($conversation, $agent) {
            $mock->shouldReceive('suggestReply')
                ->once()
                ->withArgs(fn ($actualConversation, $limit, $instruction, $actualAgent) => (
                    $actualConversation->is($conversation)
                    && $limit === 25
                    && $actualAgent?->is($agent)
                ))
                ->andReturn('Starter is ₹999, Pro is ₹1999, and Business is ₹3499 per month.');
        });

        $this->mock(WhatsAppClient::class, function ($mock) use ($connection) {
            $mock->shouldReceive('sendTextMessage')
                ->once()
                ->withArgs(fn ($actualConnection, $to, $body, $replyTo) => (
                    $actualConnection->is($connection)
                    && $to === '919876543210'
                    && $body === 'Starter is ₹999, Pro is ₹1999, and Business is ₹3499 per month.'
                    && $replyTo === 'wamid.inbound-after-bot'
                ))
                ->andReturn(['messages' => [['id' => 'wamid.ai-after-bot']]]);
        });

        $result = app(AiAgentAutopilotService::class)->process($inbound, $conversation);

        $this->assertSame('sent', $result['status']);
    }

    public function test_autopilot_can_reply_to_interactive_reply_text(): void
    {
        PlatformSetting::set('ai.enabled', '1', 'string', 'ai');

        $agent = AiAgent::create([
            'account_id' => $this->account->id,
            'created_by' => $this->owner->id,
            'name' => 'Auto support',
            'role' => 'support',
            'tone' => 'friendly',
            'mode' => 'autopilot',
            'is_active' => true,
            'max_auto_replies_per_conversation' => 3,
        ]);

        $connection = WhatsAppConnection::factory()->create([
            'account_id' => $this->account->id,
            'is_active' => true,
            'access_token' => 'test-token',
            'phone_number_id' => '123456',
        ]);
        $contact = WhatsAppContact::factory()->create([
            'account_id' => $this->account->id,
            'wa_id' => '919876543210',
        ]);
        $conversation = WhatsAppConversation::factory()->create([
            'account_id' => $this->account->id,
            'whatsapp_connection_id' => $connection->id,
            'whatsapp_contact_id' => $contact->id,
            'status' => 'open',
        ]);

        $inbound = WhatsAppMessage::factory()->create([
            'account_id' => $this->account->id,
            'whatsapp_conversation_id' => $conversation->id,
            'direction' => 'inbound',
            'type' => 'interactive',
            'text_body' => null,
            'payload' => [
                'interactive' => [
                    'button_reply' => [
                        'id' => 'pricing',
                        'title' => 'Pricing',
                    ],
                ],
            ],
            'meta_message_id' => 'wamid.interactive-1',
            'status' => 'delivered',
        ]);

        $this->mock(ConversationAssistantService::class, function ($mock) use ($conversation, $agent) {
            $mock->shouldReceive('suggestReply')
                ->once()
                ->withArgs(fn ($actualConversation, $limit, $instruction, $actualAgent) => (
                    $actualConversation->is($conversation)
                    && $limit === 25
                    && $actualAgent?->is($agent)
                ))
                ->andReturn('Here is the pricing summary.');
        });

        $this->mock(WhatsAppClient::class, function ($mock) use ($connection) {
            $mock->shouldReceive('sendTextMessage')
                ->once()
                ->withArgs(fn ($actualConnection, $to, $body, $replyTo) => (
                    $actualConnection->is($connection)
                    && $to === '919876543210'
                    && $body === 'Here is the pricing summary.'
                    && $replyTo === 'wamid.interactive-1'
                ))
                ->andReturn(['messages' => [['id' => 'wamid.ai-interactive']]]);
        });

        $result = app(AiAgentAutopilotService::class)->process($inbound, $conversation);

        $this->assertSame('sent', $result['status']);
    }
}
