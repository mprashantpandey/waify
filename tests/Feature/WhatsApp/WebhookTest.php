<?php

namespace Tests\Feature\WhatsApp;

use App\Models\Account;
use App\Models\AccountUsage;
use App\Models\PlatformSetting;
use App\Modules\WhatsApp\Models\WhatsAppConnection;
use App\Modules\WhatsApp\Models\WhatsAppContact;
use App\Modules\WhatsApp\Models\WhatsAppConversation;
use App\Modules\WhatsApp\Models\WhatsAppMessageBilling;
use App\Modules\WhatsApp\Models\WhatsAppMessage;
use Illuminate\Foundation\Testing\RefreshDatabase;
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
}
