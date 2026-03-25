<?php

namespace Tests\Feature\WhatsApp;

use App\Models\Account;
use App\Modules\WhatsApp\Jobs\ProcessWebhookEventJob;
use App\Modules\WhatsApp\Models\WhatsAppConnection;
use App\Modules\WhatsApp\Models\WhatsAppMessage;
use App\Modules\WhatsApp\Models\WhatsAppWebhookEvent;
use App\Modules\WhatsApp\Services\WebhookProcessor;
use App\Services\OperationalAlertService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Queue;
use Tests\TestCase;

class WebhookReliabilityTest extends TestCase
{
    use RefreshDatabase;

    public function test_receive_stores_raw_event_and_queues_processing_job(): void
    {
        Queue::fake();

        $account = Account::factory()->create();
        $connection = WhatsAppConnection::factory()->create([
            'account_id' => $account->id,
            'phone_number_id' => '150215621517428',
            'waba_id' => '131698056692862',
        ]);

        $payload = [
            'object' => 'whatsapp_business_account',
            'entry' => [[
                'id' => $connection->waba_id,
                'changes' => [[
                    'field' => 'messages',
                    'value' => [
                        'metadata' => [
                            'phone_number_id' => $connection->phone_number_id,
                        ],
                        'messages' => [[
                            'id' => 'wamid.rel.1',
                            'from' => '919999999999',
                            'type' => 'text',
                            'text' => ['body' => 'hi'],
                        ]],
                        'contacts' => [[
                            'profile' => ['name' => 'Reliability User'],
                        ]],
                    ],
                ]],
            ]],
        ];

        $signature = 'sha256='.hash_hmac('sha256', json_encode($payload, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES) ?: '{}', 'test-secret');
        config()->set('whatsapp.meta.app_secret', 'test-secret');

        $response = $this
            ->withHeaders(['X-Hub-Signature-256' => $signature])
            ->postJson(route('webhooks.whatsapp.receive'), $payload);

        $response->assertStatus(200)
            ->assertJson(['success' => true, 'queued' => true]);

        $this->assertDatabaseHas('whatsapp_webhook_events', [
            'account_id' => $account->id,
            'tenant_id' => $account->id,
            'whatsapp_connection_id' => $connection->id,
            'provider' => 'whatsapp_meta',
            'status' => 'received',
            'signature_valid' => 1,
        ]);

        Queue::assertPushed(ProcessWebhookEventJob::class, 1);
    }

    public function test_receive_uses_configured_webhook_queue(): void
    {
        Queue::fake();
        config()->set('whatsapp.webhook.queue', 'default');

        $account = Account::factory()->create();
        $connection = WhatsAppConnection::factory()->create([
            'account_id' => $account->id,
            'phone_number_id' => '150215621517428',
            'waba_id' => '131698056692862',
        ]);

        $payload = [
            'object' => 'whatsapp_business_account',
            'entry' => [[
                'id' => $connection->waba_id,
                'changes' => [[
                    'field' => 'messages',
                    'value' => [
                        'metadata' => [
                            'phone_number_id' => $connection->phone_number_id,
                        ],
                        'messages' => [[
                            'id' => 'wamid.rel.queue.1',
                            'from' => '919111111111',
                            'type' => 'text',
                            'text' => ['body' => 'queue me'],
                        ]],
                    ],
                ]],
            ]],
        ];

        $this->postJson(route('webhooks.whatsapp.receive'), $payload)
            ->assertStatus(200)
            ->assertJson(['success' => true, 'queued' => true]);

        Queue::assertPushed(ProcessWebhookEventJob::class, function (ProcessWebhookEventJob $job) {
            return $job->queue === 'default';
        });
    }

    public function test_receive_is_idempotent_for_duplicate_payloads(): void
    {
        Queue::fake();

        $account = Account::factory()->create();
        $connection = WhatsAppConnection::factory()->create([
            'account_id' => $account->id,
            'phone_number_id' => '150215621517428',
            'waba_id' => '131698056692862',
        ]);

        $payload = [
            'entry' => [[
                'id' => $connection->waba_id,
                'changes' => [[
                    'field' => 'messages',
                    'value' => [
                        'metadata' => [
                            'phone_number_id' => $connection->phone_number_id,
                        ],
                        'messages' => [[
                            'id' => 'wamid.rel.dup.1',
                            'from' => '918888888888',
                            'type' => 'text',
                            'text' => ['body' => 'hello'],
                        ]],
                    ],
                ]],
            ]],
        ];

        $this->postJson(route('webhooks.whatsapp.receive'), $payload)
            ->assertStatus(200);
        $this->postJson(route('webhooks.whatsapp.receive'), $payload)
            ->assertStatus(200)
            ->assertJson(['duplicate' => true]);

        $this->assertSame(
            1,
            WhatsAppWebhookEvent::query()->where('whatsapp_connection_id', $connection->id)->count()
        );
    }

    public function test_processing_job_marks_event_processed_and_creates_message(): void
    {
        $account = Account::factory()->create();
        $connection = WhatsAppConnection::factory()->create([
            'account_id' => $account->id,
        ]);

        $event = WhatsAppWebhookEvent::query()->create([
            'account_id' => $account->id,
            'tenant_id' => $account->id,
            'whatsapp_connection_id' => $connection->id,
            'provider' => 'whatsapp_meta',
            'event_type' => 'messages.text',
            'object_type' => 'whatsapp_business_account',
            'status' => 'received',
            'payload' => [
                'entry' => [[
                    'changes' => [[
                        'field' => 'messages',
                        'value' => [
                            'messages' => [[
                                'id' => 'wamid.rel.process.1',
                                'from' => '917777777777',
                                'type' => 'text',
                                'text' => ['body' => 'process me'],
                            ]],
                            'contacts' => [[
                                'profile' => ['name' => 'Processor'],
                            ]],
                        ],
                    ]],
                ]],
            ],
            'payload_size' => 100,
        ]);

        $job = new ProcessWebhookEventJob($event->id);
        $job->handle(app(WebhookProcessor::class), app(OperationalAlertService::class));

        $this->assertDatabaseHas('whatsapp_messages', [
            'account_id' => $account->id,
            'meta_message_id' => 'wamid.rel.process.1',
        ]);
        $this->assertDatabaseHas('whatsapp_webhook_events', [
            'id' => $event->id,
            'status' => 'processed',
        ]);

        $this->assertTrue(
            WhatsAppMessage::query()->where('meta_message_id', 'wamid.rel.process.1')->exists()
        );

        $conversation = \App\Modules\WhatsApp\Models\WhatsAppConversation::query()
            ->where('account_id', $account->id)
            ->first();

        $this->assertNotNull($conversation);
        $this->assertNotNull($conversation->last_inbound_at);
        $this->assertNotNull($conversation->service_window_expires_at);
        $this->assertTrue($conversation->service_window_expires_at->gt($conversation->last_inbound_at));
    }
}
