<?php

namespace Tests\Feature\WhatsApp;

use App\Models\User;
use App\Models\Workspace;
use App\Modules\WhatsApp\Events\Inbox\ConversationUpdated;
use App\Modules\WhatsApp\Events\Inbox\MessageCreated;
use App\Modules\WhatsApp\Models\WhatsAppConnection;
use App\Modules\WhatsApp\Models\WhatsAppConversation;
use App\Modules\WhatsApp\Models\WhatsAppContact;
use App\Modules\WhatsApp\Models\WhatsAppMessage;
use App\Modules\WhatsApp\Services\WebhookProcessor;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Broadcast;
use Illuminate\Support\Facades\Http;
use Tests\TestCase;

class RealtimeTest extends TestCase
{
    use RefreshDatabase;

    protected User $user;
    protected User $nonMember;
    protected Workspace $workspace;
    protected WhatsAppConnection $connection;

    protected function setUp(): void
    {
        parent::setUp();

        $this->user = User::factory()->create();
        $this->nonMember = User::factory()->create();
        $this->workspace = Workspace::factory()->create([
            'owner_id' => $this->user->id,
        ]);
        $this->workspace->users()->attach($this->user->id, ['role' => 'member']);

        $this->connection = WhatsAppConnection::factory()->create([
            'workspace_id' => $this->workspace->id,
        ]);

        session(['current_workspace_id' => $this->workspace->id]);
    }

    public function test_workspace_member_can_authorize_inbox_channel(): void
    {
        $response = $this->actingAs($this->user)
            ->post('/broadcasting/auth', [
                'socket_id' => 'test-socket-id',
                'channel_name' => "private-workspace.{$this->workspace->id}.whatsapp.inbox",
            ]);

        $response->assertStatus(200);
        $response->assertJsonStructure(['auth']);
    }

    public function test_non_member_cannot_authorize_inbox_channel(): void
    {
        $response = $this->actingAs($this->nonMember)
            ->post('/broadcasting/auth', [
                'socket_id' => 'test-socket-id',
                'channel_name' => "private-workspace.{$this->workspace->id}.whatsapp.inbox",
            ]);

        $response->assertStatus(403);
    }

    public function test_member_can_authorize_conversation_channel(): void
    {
        $contact = WhatsAppContact::factory()->create([
            'workspace_id' => $this->workspace->id,
        ]);

        $conversation = WhatsAppConversation::factory()->create([
            'workspace_id' => $this->workspace->id,
            'whatsapp_connection_id' => $this->connection->id,
            'whatsapp_contact_id' => $contact->id,
        ]);

        $response = $this->actingAs($this->user)
            ->post('/broadcasting/auth', [
                'socket_id' => 'test-socket-id',
                'channel_name' => "private-workspace.{$this->workspace->id}.whatsapp.conversation.{$conversation->id}",
            ]);

        $response->assertStatus(200);
    }

    public function test_non_member_cannot_authorize_conversation_channel(): void
    {
        $contact = WhatsAppContact::factory()->create([
            'workspace_id' => $this->workspace->id,
        ]);

        $conversation = WhatsAppConversation::factory()->create([
            'workspace_id' => $this->workspace->id,
            'whatsapp_connection_id' => $this->connection->id,
            'whatsapp_contact_id' => $contact->id,
        ]);

        $response = $this->actingAs($this->nonMember)
            ->post('/broadcasting/auth', [
                'socket_id' => 'test-socket-id',
                'channel_name' => "private-workspace.{$this->workspace->id}.whatsapp.conversation.{$conversation->id}",
            ]);

        $response->assertStatus(403);
    }

    public function test_webhook_broadcasts_message_created(): void
    {
        Broadcast::fake();

        Http::fake([
            '*' => Http::response(['status' => 'ok'], 200),
        ]);

        $webhookPayload = [
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
                                            'body' => 'Hello test',
                                        ],
                                    ],
                                ],
                                'contacts' => [
                                    [
                                        'profile' => [
                                            'name' => 'Test Contact',
                                        ],
                                    ],
                                ],
                            ],
                        ],
                    ],
                ],
            ],
        ];

        $processor = app(WebhookProcessor::class);
        $processor->process($webhookPayload, $this->connection);

        Broadcast::assertDispatched(MessageCreated::class, function ($event) {
            return $event->message->workspace_id === $this->workspace->id;
        });

        Broadcast::assertDispatched(ConversationUpdated::class);
    }

    public function test_inbox_stream_requires_workspace_membership(): void
    {
        $response = $this->actingAs($this->nonMember)
            ->get(route('app.whatsapp.inbox.stream', ['workspace' => $this->workspace->slug]));

        $response->assertForbidden();
    }

    public function test_inbox_stream_returns_updated_conversations(): void
    {
        $contact = WhatsAppContact::factory()->create([
            'workspace_id' => $this->workspace->id,
        ]);

        $conversation = WhatsAppConversation::factory()->create([
            'workspace_id' => $this->workspace->id,
            'whatsapp_connection_id' => $this->connection->id,
            'whatsapp_contact_id' => $contact->id,
            'last_message_at' => now(),
        ]);

        $response = $this->actingAs($this->user)
            ->get(route('app.whatsapp.inbox.stream', [
                'workspace' => $this->workspace->slug,
                'since' => now()->subMinutes(10)->toIso8601String(),
            ]));

        $response->assertStatus(200);
        $response->assertJsonStructure([
            'server_time',
            'updated_conversations',
            'new_message_notifications',
        ]);

        $data = $response->json();
        $this->assertIsArray($data['updated_conversations']);
    }

    public function test_conversation_stream_returns_incremental_messages(): void
    {
        $contact = WhatsAppContact::factory()->create([
            'workspace_id' => $this->workspace->id,
        ]);

        $conversation = WhatsAppConversation::factory()->create([
            'workspace_id' => $this->workspace->id,
            'whatsapp_connection_id' => $this->connection->id,
            'whatsapp_contact_id' => $contact->id,
        ]);

        $message1 = WhatsAppMessage::factory()->create([
            'workspace_id' => $this->workspace->id,
            'whatsapp_conversation_id' => $conversation->id,
            'direction' => 'inbound',
        ]);

        $message2 = WhatsAppMessage::factory()->create([
            'workspace_id' => $this->workspace->id,
            'whatsapp_conversation_id' => $conversation->id,
            'direction' => 'inbound',
        ]);

        $response = $this->actingAs($this->user)
            ->get(route('app.whatsapp.inbox.conversation.stream', [
                'workspace' => $this->workspace->slug,
                'conversation' => $conversation->id,
                'after_message_id' => $message1->id,
            ]));

        $response->assertStatus(200);
        $response->assertJsonStructure([
            'new_messages',
            'updated_messages',
            'new_notes',
            'new_audit_events',
            'conversation',
        ]);

        $data = $response->json();
        $this->assertCount(1, $data['new_messages']);
        $this->assertEquals($message2->id, $data['new_messages'][0]['id']);
    }

    public function test_conversation_stream_forbids_non_members(): void
    {
        $contact = WhatsAppContact::factory()->create([
            'workspace_id' => $this->workspace->id,
        ]);

        $conversation = WhatsAppConversation::factory()->create([
            'workspace_id' => $this->workspace->id,
            'whatsapp_connection_id' => $this->connection->id,
            'whatsapp_contact_id' => $contact->id,
        ]);

        $response = $this->actingAs($this->nonMember)
            ->get(route('app.whatsapp.inbox.conversation.stream', [
                'workspace' => $this->workspace->slug,
                'conversation' => $conversation->id,
            ]));

        $response->assertForbidden();
    }
}
