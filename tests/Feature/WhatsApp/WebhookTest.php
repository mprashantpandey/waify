<?php

namespace Tests\Feature\WhatsApp;

use App\Models\Workspace;
use App\Modules\WhatsApp\Models\WhatsAppConnection;
use App\Modules\WhatsApp\Models\WhatsAppContact;
use App\Modules\WhatsApp\Models\WhatsAppConversation;
use App\Modules\WhatsApp\Models\WhatsAppMessage;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class WebhookTest extends TestCase
{
    use RefreshDatabase;

    protected Workspace $workspace;
    protected WhatsAppConnection $connection;

    protected function setUp(): void
    {
        parent::setUp();

        $this->workspace = Workspace::factory()->create();
        $this->connection = WhatsAppConnection::factory()->create([
            'workspace_id' => $this->workspace->id,
            'webhook_verify_token' => 'test-verify-token',
        ]);
    }

    public function test_webhook_verify_returns_challenge_for_valid_token(): void
    {
        $response = $this->get(route('webhooks.whatsapp.verify', ['connection' => $this->connection->id]), [
            'hub_mode' => 'subscribe',
            'hub_verify_token' => 'test-verify-token',
            'hub_challenge' => 'test-challenge-123',
        ]);

        $response->assertStatus(200);
        $response->assertSeeText('test-challenge-123');
        $this->assertTrue($this->connection->fresh()->webhook_subscribed);
    }

    public function test_webhook_verify_rejects_invalid_token(): void
    {
        $response = $this->get(route('webhooks.whatsapp.verify', ['connection' => $this->connection->id]), [
            'hub_mode' => 'subscribe',
            'hub_verify_token' => 'wrong-token',
            'hub_challenge' => 'test-challenge-123',
        ]);

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
            route('webhooks.whatsapp.receive', ['connection' => $this->connection->id]),
            $payload
        );

        $response1->assertStatus(200);
        $this->assertDatabaseHas('whatsapp_messages', [
            'meta_message_id' => 'wamid.test123',
            'workspace_id' => $this->workspace->id,
        ]);

        $messageCount = WhatsAppMessage::where('meta_message_id', 'wamid.test123')->count();

        // Send second time (should not create duplicate)
        $response2 = $this->postJson(
            route('webhooks.whatsapp.receive', ['connection' => $this->connection->id]),
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
            route('webhooks.whatsapp.receive', ['connection' => $this->connection->id]),
            $payload
        );

        $this->assertDatabaseHas('whatsapp_contacts', [
            'workspace_id' => $this->workspace->id,
            'wa_id' => '9876543210',
            'name' => 'New Contact',
        ]);

        $contact = WhatsAppContact::where('wa_id', '9876543210')->first();
        $this->assertDatabaseHas('whatsapp_conversations', [
            'workspace_id' => $this->workspace->id,
            'whatsapp_connection_id' => $this->connection->id,
            'whatsapp_contact_id' => $contact->id,
        ]);
    }
}
