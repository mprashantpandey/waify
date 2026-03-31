<?php

namespace Tests\Feature\Developer;

use App\Models\Account;
use App\Models\InboundAutomationWebhook;
use App\Models\InboundAutomationWebhookLog;
use App\Models\User;
use App\Modules\Broadcasts\Jobs\SendSequenceStepJob;
use App\Modules\Broadcasts\Models\CampaignSequence;
use App\Modules\Broadcasts\Models\CampaignSequenceEnrollment;
use App\Modules\Broadcasts\Models\CampaignSequenceStep;
use App\Modules\WhatsApp\Models\WhatsAppConnection;
use App\Modules\WhatsApp\Models\WhatsAppMessage;
use App\Modules\WhatsApp\Models\WhatsAppTemplate;
use App\Modules\WhatsApp\Services\WhatsAppClient;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Queue;
use Tests\TestCase;

class InboundAutomationWebhookTest extends TestCase
{
    use RefreshDatabase;

    public function test_owner_can_create_inbound_automation_webhook(): void
    {
        $this->withoutMiddleware();

        $owner = User::factory()->create();
        $account = Account::factory()->create(['owner_id' => $owner->id]);
        $connection = WhatsAppConnection::factory()->create([
            'account_id' => $account->id,
            'is_active' => true,
        ]);
        $sequence = CampaignSequence::create([
            'account_id' => $account->id,
            'whatsapp_connection_id' => $connection->id,
            'created_by' => $owner->id,
            'name' => 'Webhook nurture',
            'status' => 'draft',
            'audience_type' => 'custom',
        ]);

        $this->actingAs($owner)
            ->withSession(['current_account_id' => $account->id])
            ->post(route('app.developer.inbound-webhooks.store'), [
                'name' => 'Lead form listener',
                'action_type' => 'start_sequence',
                'campaign_sequence_id' => $sequence->id,
                'phone_path' => 'lead.phone',
                'name_path' => 'lead.name',
                'idempotency_path' => 'event_id',
            ])
            ->assertRedirect();

        $webhook = InboundAutomationWebhook::query()->where('account_id', $account->id)->first();
        $this->assertNotNull($webhook);
        $this->assertSame('Lead form listener', $webhook->name);
        $this->assertSame('start_sequence', $webhook->action_type);
        $this->assertSame('lead.phone', data_get($webhook->payload_mappings, 'phone_path'));
        $this->assertNotEmpty($webhook->public_key);
        $this->assertNotEmpty($webhook->signing_secret);
    }


    public function test_public_inbound_webhook_rejects_invalid_secret(): void
    {
        $account = Account::factory()->create();
        $webhook = InboundAutomationWebhook::create([
            'account_id' => $account->id,
            'name' => 'Protected webhook',
            'action_type' => 'start_sequence',
            'payload_mappings' => ['phone_path' => 'phone'],
        ]);

        $this->postJson(route('hooks.inbound.handle', ['publicKey' => $webhook->public_key]), [
            'phone' => '+91 99999 00033',
        ], [
            'X-Zyptos-Secret' => 'wrong-secret',
        ])->assertStatus(401)->assertJson(['ok' => false]);
    }

    public function test_public_inbound_webhook_can_enroll_contact_into_sequence_and_dedupe(): void
    {
        Queue::fake();

        $account = Account::factory()->create();
        $connection = WhatsAppConnection::factory()->create([
            'account_id' => $account->id,
            'is_active' => true,
            'activation_state' => 'active',
        ]);
        $sequence = CampaignSequence::create([
            'account_id' => $account->id,
            'whatsapp_connection_id' => $connection->id,
            'created_by' => $account->owner_id,
            'name' => 'Inbound nurture',
            'status' => 'draft',
            'audience_type' => 'custom',
        ]);
        CampaignSequenceStep::create([
            'campaign_sequence_id' => $sequence->id,
            'step_order' => 1,
            'delay_minutes' => 0,
            'type' => 'text',
            'message_text' => 'Welcome from webhook',
        ]);

        $webhook = InboundAutomationWebhook::create([
            'account_id' => $account->id,
            'name' => 'CRM lead webhook',
            'action_type' => 'start_sequence',
            'campaign_sequence_id' => $sequence->id,
            'payload_mappings' => [
                'phone_path' => 'lead.phone',
                'name_path' => 'lead.name',
                'idempotency_path' => 'event.id',
            ],
        ]);

        $payload = [
            'event' => ['id' => 'crm_123'],
            'lead' => [
                'phone' => '+91 99999 00011',
                'name' => 'Lead One',
            ],
        ];

        $this->postJson(route('hooks.inbound.handle', ['publicKey' => $webhook->public_key]), $payload, [
            'X-Zyptos-Secret' => $webhook->signing_secret,
        ])->assertOk()->assertJson(['ok' => true]);

        $this->assertDatabaseHas('whatsapp_contacts', [
            'account_id' => $account->id,
            'wa_id' => '919999900011',
            'name' => 'Lead One',
        ]);
        $this->assertDatabaseHas('campaign_sequence_enrollments', [
            'campaign_sequence_id' => $sequence->id,
            'wa_id' => '919999900011',
            'status' => 'active',
        ]);
        Queue::assertPushed(SendSequenceStepJob::class, 1);

        $this->postJson(route('hooks.inbound.handle', ['publicKey' => $webhook->public_key]), $payload, [
            'X-Zyptos-Secret' => $webhook->signing_secret,
        ])->assertStatus(202)->assertJson(['duplicate' => true]);

        $this->assertSame(1, CampaignSequenceEnrollment::query()->where('campaign_sequence_id', $sequence->id)->count());
        $this->assertSame(2, InboundAutomationWebhookLog::query()->where('inbound_automation_webhook_id', $webhook->id)->count());
    }

    public function test_public_inbound_webhook_can_send_template_with_mapped_variables(): void
    {
        $account = Account::factory()->create();
        $connection = WhatsAppConnection::factory()->create([
            'account_id' => $account->id,
            'is_active' => true,
            'activation_state' => 'active',
        ]);
        $template = WhatsAppTemplate::create([
            'account_id' => $account->id,
            'whatsapp_connection_id' => $connection->id,
            'name' => 'order_update',
            'language' => 'en_US',
            'category' => 'utility',
            'status' => 'approved',
            'body_text' => 'Hello {{1}}, your order {{2}} is ready.',
            'header_type' => null,
            'buttons' => [],
            'components' => [],
        ]);

        $webhook = InboundAutomationWebhook::create([
            'account_id' => $account->id,
            'name' => 'Order status webhook',
            'action_type' => 'send_template',
            'whatsapp_connection_id' => $connection->id,
            'whatsapp_template_id' => $template->id,
            'payload_mappings' => [
                'phone_path' => 'customer.phone',
                'name_path' => 'customer.name',
                'idempotency_path' => 'event_id',
            ],
            'template_variable_paths' => ['customer.name', 'order.number'],
        ]);

        $this->mock(WhatsAppClient::class, function ($mock): void {
            $mock->shouldReceive('sendTemplateMessage')
                ->once()
                ->andReturn(['messages' => [['id' => 'wamid.inbound.template.1']]]);
        });

        $payload = [
            'event_id' => 'order_1001',
            'customer' => [
                'phone' => '+91 99999 00022',
                'name' => 'Riya',
            ],
            'order' => [
                'number' => 'A-1001',
            ],
        ];

        $this->postJson(route('hooks.inbound.handle', ['publicKey' => $webhook->public_key]), $payload, [
            'X-Zyptos-Secret' => $webhook->signing_secret,
        ])->assertOk()->assertJson(['ok' => true]);

        $this->assertDatabaseHas('whatsapp_contacts', [
            'account_id' => $account->id,
            'wa_id' => '919999900022',
            'name' => 'Riya',
        ]);
        $this->assertDatabaseHas('whatsapp_messages', [
            'account_id' => $account->id,
            'direction' => 'outbound',
            'type' => 'template',
            'status' => 'sent',
            'meta_message_id' => 'wamid.inbound.template.1',
        ]);

        $message = WhatsAppMessage::query()->where('account_id', $account->id)->latest('id')->first();
        $this->assertNotNull($message);
        $this->assertStringContainsString('Hello Riya, your order A-1001 is ready.', (string) $message->text_body);
    }
}
