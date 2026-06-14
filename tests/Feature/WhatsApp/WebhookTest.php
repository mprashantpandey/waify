<?php

namespace Tests\Feature\WhatsApp;

use App\Models\Account;
use App\Models\AccountMetaLead;
use App\Models\AccountUsage;
use App\Models\PlatformSetting;
use App\Modules\WhatsApp\Models\WhatsAppConnection;
use App\Modules\WhatsApp\Models\WhatsAppContact;
use App\Modules\WhatsApp\Models\WhatsAppConversation;
use App\Modules\WhatsApp\Models\WhatsAppMessage;
use App\Modules\WhatsApp\Models\WhatsAppMessageBilling;
use App\Modules\WhatsApp\Services\WebhookProcessor;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class WebhookTest extends TestCase
{
    use RefreshDatabase;

    protected Account $account;

    protected WhatsAppConnection $connection;

    protected function setUp(): void
    {
        parent::setUp();

        $this->account = Account::factory()->create();
        $this->connection = WhatsAppConnection::factory()->create([
            'account_id' => $this->account->id,
            'webhook_verify_token' => 'test-verify-token',
        ]);
    }

    public function test_webhook_verify_returns_challenge_for_valid_token(): void
    {
        $response = $this->get(route('webhooks.whatsapp.verify', [
            'connection' => $this->connection->slug,
            'hub_mode' => 'subscribe',
            'hub_verify_token' => 'test-verify-token',
            'hub_challenge' => 'test-challenge-123',
        ]));

        $response->assertStatus(200);
        $response->assertSeeText('test-challenge-123');
        $this->assertTrue($this->connection->fresh()->webhook_subscribed);
    }

    public function test_webhook_verify_rejects_invalid_token(): void
    {
        $response = $this->get(route('webhooks.whatsapp.verify', [
            'connection' => $this->connection->slug,
            'hub_mode' => 'subscribe',
            'hub_verify_token' => 'wrong-token',
            'hub_challenge' => 'test-challenge-123',
        ]));

        $response->assertStatus(403);
    }

    public function test_webhook_receive_creates_message_idempotently(): void
    {
        $payload = [
            'entry' => [
                [
                    'changes' => [
                        [
                            'field' => 'messages',
                            'value' => [
                                'messages' => [
                                    [
                                        'id' => 'wamid.test123',
                                        'from' => '1234567890',
                                        'type' => 'text',
                                        'text' => [
                                            'body' => 'Hello, world!',
                                        ],
                                    ],
                                ],
                                'contacts' => [
                                    [
                                        'profile' => [
                                            'name' => 'Test User',
                                        ],
                                    ],
                                ],
                            ],
                        ],
                    ],
                ],
            ],
        ];

        // Send first time
        $response1 = $this->postJson(
            route('webhooks.whatsapp.receive', ['connection' => $this->connection->slug]),
            $payload
        );

        $response1->assertStatus(200);
        $this->assertDatabaseHas('whatsapp_messages', [
            'meta_message_id' => 'wamid.test123',
            'account_id' => $this->account->id,
        ]);

        $messageCount = WhatsAppMessage::where('meta_message_id', 'wamid.test123')->count();

        // Send second time (should not create duplicate)
        $response2 = $this->postJson(
            route('webhooks.whatsapp.receive', ['connection' => $this->connection->slug]),
            $payload
        );

        $response2->assertStatus(200);
        $this->assertEquals(
            $messageCount,
            WhatsAppMessage::where('meta_message_id', 'wamid.test123')->count(),
            'Message should not be created twice'
        );
    }

    public function test_failed_webhook_event_can_be_claimed_again_for_redelivery(): void
    {
        $processor = app(WebhookProcessor::class);
        $claim = new \ReflectionMethod($processor, 'claimWebhookEvent');
        $claim->setAccessible(true);
        $mark = new \ReflectionMethod($processor, 'markWebhookEvent');
        $mark->setAccessible(true);

        $this->assertTrue($claim->invoke($processor, $this->connection, 'message:retry', 'message', []));
        $mark->invoke($processor, $this->connection, 'message:retry', 'failed', 'Temporary failure');

        $this->assertTrue($claim->invoke($processor, $this->connection, 'message:retry', 'message', []));

        $event = DB::table('whatsapp_webhook_events')
            ->where('account_id', $this->account->id)
            ->where('event_key', 'message:retry')
            ->first();

        $this->assertSame('processing', $event->status);
        $this->assertSame(2, (int) $event->attempts);
        $this->assertNull($event->last_error);
    }

    public function test_processed_webhook_event_is_not_claimed_again(): void
    {
        $processor = app(WebhookProcessor::class);
        $claim = new \ReflectionMethod($processor, 'claimWebhookEvent');
        $claim->setAccessible(true);
        $mark = new \ReflectionMethod($processor, 'markWebhookEvent');
        $mark->setAccessible(true);

        $this->assertTrue($claim->invoke($processor, $this->connection, 'message:done', 'message', []));
        $mark->invoke($processor, $this->connection, 'message:done', 'processed');

        $this->assertFalse($claim->invoke($processor, $this->connection, 'message:done', 'message', []));

        $event = DB::table('whatsapp_webhook_events')
            ->where('account_id', $this->account->id)
            ->where('event_key', 'message:done')
            ->first();

        $this->assertSame('processed', $event->status);
        $this->assertSame(2, (int) $event->attempts);
    }

    public function test_webhook_receive_parses_and_stores_sticker_media(): void
    {
        Storage::fake('public');
        Http::fake([
            'https://graph.facebook.com/*/sticker-media-123' => Http::response([
                'url' => 'https://lookaside.test/sticker.webp',
                'mime_type' => 'image/webp',
                'sha256' => 'sticker-sha',
            ], 200),
            'https://lookaside.test/sticker.webp' => Http::response('sticker-binary', 200, [
                'Content-Type' => 'image/webp',
            ]),
        ]);

        $payload = [
            'entry' => [[
                'changes' => [[
                    'field' => 'messages',
                    'value' => [
                        'messages' => [[
                            'id' => 'wamid.sticker123',
                            'from' => '1234567890',
                            'type' => 'sticker',
                            'sticker' => [
                                'id' => 'sticker-media-123',
                                'mime_type' => 'image/webp',
                                'sha256' => 'sticker-sha',
                                'animated' => false,
                            ],
                        ]],
                    ],
                ]],
            ]],
        ];

        $this->postJson(route('webhooks.whatsapp.receive', ['connection' => $this->connection->slug]), $payload)
            ->assertStatus(200);

        $message = WhatsAppMessage::where('meta_message_id', 'wamid.sticker123')->firstOrFail();
        $this->assertSame('sticker', $message->type);
        $this->assertSame('Sticker', $message->text_body);
        $this->assertSame('sticker-media-123', $message->payload['media']['id'] ?? null);
        $this->assertSame('image/webp', $message->payload['media']['mime_type'] ?? null);
        Storage::disk('public')->assertExists($message->payload['media']['local_path']);
    }

    public function test_webhook_receive_creates_contact_and_conversation(): void
    {
        $payload = [
            'entry' => [
                [
                    'changes' => [
                        [
                            'field' => 'messages',
                            'value' => [
                                'messages' => [
                                    [
                                        'id' => 'wamid.test456',
                                        'from' => '9876543210',
                                        'type' => 'text',
                                        'text' => [
                                            'body' => 'Test message',
                                        ],
                                    ],
                                ],
                                'contacts' => [
                                    [
                                        'profile' => [
                                            'name' => 'New Contact',
                                        ],
                                    ],
                                ],
                            ],
                        ],
                    ],
                ],
            ],
        ];

        $this->postJson(
            route('webhooks.whatsapp.receive', ['connection' => $this->connection->slug]),
            $payload
        );

        $this->assertDatabaseHas('whatsapp_contacts', [
            'account_id' => $this->account->id,
            'wa_id' => '9876543210',
            'name' => 'New Contact',
        ]);

        $contact = WhatsAppContact::where('wa_id', '9876543210')->first();
        $this->assertDatabaseHas('whatsapp_conversations', [
            'account_id' => $this->account->id,
            'whatsapp_connection_id' => $this->connection->id,
            'whatsapp_contact_id' => $contact->id,
        ]);
    }

    public function test_webhook_receive_captures_click_to_whatsapp_ad_referral(): void
    {
        $payload = [
            'entry' => [[
                'changes' => [[
                    'field' => 'messages',
                    'value' => [
                        'messages' => [[
                            'id' => 'wamid.ctwa123',
                            'from' => '919999888877',
                            'type' => 'text',
                            'text' => ['body' => 'Interested in the offer'],
                            'referral' => [
                                'headline' => 'Zyptos Business Plan',
                                'body' => 'Automate WhatsApp sales and support.',
                                'source_type' => 'ad',
                                'source_id' => '238500000001',
                                'source_url' => 'https://facebook.com/ads/example',
                                'ctwa_clid' => 'clid_test_123',
                            ],
                        ]],
                        'contacts' => [[
                            'profile' => ['name' => 'CTWA Lead'],
                        ]],
                    ],
                ]],
            ]],
        ];

        $this->postJson(route('webhooks.whatsapp.receive', ['connection' => $this->connection->slug]), $payload)
            ->assertStatus(200);

        $message = WhatsAppMessage::where('meta_message_id', 'wamid.ctwa123')->firstOrFail();
        $contact = WhatsAppContact::where('account_id', $this->account->id)
            ->where('wa_id', '919999888877')
            ->firstOrFail();
        $conversation = WhatsAppConversation::where('account_id', $this->account->id)
            ->where('whatsapp_contact_id', $contact->id)
            ->firstOrFail();

        $this->assertSame('ctwa', $contact->source);
        $this->assertSame('238500000001', $message->payload['ctwa']['source_id'] ?? null);
        $this->assertSame('Zyptos Business Plan', $contact->metadata['ctwa']['latest']['headline'] ?? null);
        $this->assertSame('clid_test_123', $conversation->metadata['ctwa']['latest']['ctwa_clid'] ?? null);

        $lead = AccountMetaLead::where('account_id', $this->account->id)
            ->where('external_id', 'clid_test_123')
            ->firstOrFail();
        $this->assertSame('ctwa', $lead->source_type);
        $this->assertSame('Click-to-WhatsApp Ad', $lead->form_name);
        $this->assertSame($conversation->id, $lead->payload['conversation_id'] ?? null);

        $this->assertDatabaseHas('whatsapp_conversation_audit_events', [
            'account_id' => $this->account->id,
            'whatsapp_conversation_id' => $conversation->id,
            'event_type' => 'ctwa_attribution',
        ]);
    }

    public function test_webhook_receive_rejects_invalid_meta_signature_when_app_secret_is_configured(): void
    {
        PlatformSetting::set('whatsapp.meta_app_secret', 'meta-app-secret', 'string', 'whatsapp');

        $payload = [
            'entry' => [[
                'changes' => [[
                    'field' => 'messages',
                    'value' => [
                        'messages' => [[
                            'id' => 'wamid.invalid-signature',
                            'from' => '1234567890',
                            'type' => 'text',
                            'text' => ['body' => 'Hello'],
                        ]],
                    ],
                ]],
            ]],
        ];

        $this->postJson(
            route('webhooks.whatsapp.receive', ['connection' => $this->connection->slug]),
            $payload,
            ['X-Hub-Signature-256' => 'sha256=bad']
        )->assertUnauthorized();

        $this->assertDatabaseMissing('whatsapp_messages', [
            'meta_message_id' => 'wamid.invalid-signature',
        ]);
    }

    public function test_webhook_receive_accepts_valid_meta_signature_when_app_secret_is_configured(): void
    {
        PlatformSetting::set('whatsapp.meta_app_secret', 'meta-app-secret', 'string', 'whatsapp');

        $payload = [
            'entry' => [[
                'changes' => [[
                    'field' => 'messages',
                    'value' => [
                        'messages' => [[
                            'id' => 'wamid.valid-signature',
                            'from' => '1234567890',
                            'type' => 'text',
                            'text' => ['body' => 'Hello'],
                        ]],
                    ],
                ]],
            ]],
        ];
        $body = json_encode($payload);
        $signature = 'sha256='.hash_hmac('sha256', $body, 'meta-app-secret');

        $this->call(
            'POST',
            route('webhooks.whatsapp.receive', ['connection' => $this->connection->slug]),
            [],
            [],
            [],
            [
                'CONTENT_TYPE' => 'application/json',
                'HTTP_ACCEPT' => 'application/json',
                'HTTP_X_HUB_SIGNATURE_256' => $signature,
            ],
            $body
        )->assertOk();

        $this->assertDatabaseHas('whatsapp_messages', [
            'meta_message_id' => 'wamid.valid-signature',
            'account_id' => $this->account->id,
        ]);
    }

    public function test_webhook_status_tracks_meta_billing_usage_once_per_message(): void
    {
        PlatformSetting::set('whatsapp.meta_billing.rate.marketing_minor', 80, 'integer', 'whatsapp');

        $inboundPayload = [
            'entry' => [[
                'changes' => [[
                    'field' => 'messages',
                    'value' => [
                        'messages' => [[
                            'id' => 'wamid.bill123',
                            'from' => '1112223333',
                            'type' => 'text',
                            'text' => ['body' => 'Hello'],
                        ]],
                        'contacts' => [[
                            'profile' => ['name' => 'Billing Contact'],
                        ]],
                    ],
                ]],
            ]],
        ];

        $this->postJson(route('webhooks.whatsapp.receive', ['connection' => $this->connection->slug]), $inboundPayload)
            ->assertStatus(200);

        $statusPayload = [
            'entry' => [[
                'changes' => [[
                    'field' => 'messages',
                    'value' => [
                        'statuses' => [[
                            'id' => 'wamid.bill123',
                            'status' => 'delivered',
                            'timestamp' => (string) now()->timestamp,
                            'pricing' => [
                                'billable' => true,
                                'pricing_model' => 'CBP',
                                'category' => 'marketing',
                            ],
                            'conversation' => [
                                'id' => 'conv_1',
                                'category' => 'marketing',
                            ],
                        ]],
                    ],
                ]],
            ]],
        ];

        $this->postJson(route('webhooks.whatsapp.receive', ['connection' => $this->connection->slug]), $statusPayload)
            ->assertStatus(200);
        // Duplicate status should not double count
        $this->postJson(route('webhooks.whatsapp.receive', ['connection' => $this->connection->slug]), $statusPayload)
            ->assertStatus(200);

        $usage = AccountUsage::where('account_id', $this->account->id)
            ->where('period', now()->format('Y-m'))
            ->first();

        $this->assertNotNull($usage);
        $this->assertSame(1, (int) $usage->meta_conversations_paid);
        $this->assertSame(1, (int) $usage->meta_conversations_marketing);
        $this->assertSame(80, (int) $usage->meta_estimated_cost_minor);
        $this->assertDatabaseHas('whatsapp_message_billings', [
            'account_id' => $this->account->id,
            'meta_message_id' => 'wamid.bill123',
            'billable' => 1,
            'category' => 'marketing',
        ]);
        $this->assertSame(1, WhatsAppMessageBilling::where('meta_message_id', 'wamid.bill123')->count());
    }

    public function test_webhook_sends_welcome_message_once_for_new_conversation(): void
    {
        Http::fake([
            'graph.facebook.com/*' => Http::response([
                'messages' => [
                    ['id' => 'wamid.welcome123'],
                ],
            ]),
        ]);

        $this->account->update([
            'welcome_message_enabled' => true,
            'welcome_message_body' => 'Hi {{name}}, welcome to {{workspace}}.',
        ]);

        $payload = [
            'entry' => [[
                'changes' => [[
                    'field' => 'messages',
                    'value' => [
                        'messages' => [[
                            'id' => 'wamid.inbound-welcome-1',
                            'from' => '919988776655',
                            'type' => 'text',
                            'text' => ['body' => 'Hello'],
                        ]],
                        'contacts' => [[
                            'profile' => ['name' => 'Jane Customer'],
                        ]],
                    ],
                ]],
            ]],
        ];

        $this->postJson(route('webhooks.whatsapp.receive', ['connection' => $this->connection->slug]), $payload)
            ->assertStatus(200);

        $this->assertDatabaseHas('whatsapp_messages', [
            'meta_message_id' => 'wamid.welcome123',
            'direction' => 'outbound',
            'type' => 'text',
            'text_body' => "Hi Jane Customer, welcome to {$this->account->name}.",
            'status' => 'sent',
        ]);

        $conversation = WhatsAppConversation::where('account_id', $this->account->id)->first();
        $this->assertNotNull($conversation);
        $this->assertNotEmpty($conversation->metadata['welcome_message_sent_at'] ?? null);

        $secondPayload = $payload;
        $secondPayload['entry'][0]['changes'][0]['value']['messages'][0]['id'] = 'wamid.inbound-welcome-2';

        $this->postJson(route('webhooks.whatsapp.receive', ['connection' => $this->connection->slug]), $secondPayload)
            ->assertStatus(200);

        $this->assertSame(
            1,
            WhatsAppMessage::where('account_id', $this->account->id)
                ->where('direction', 'outbound')
                ->where('payload->automation', 'welcome_message')
                ->count()
        );
    }
}
