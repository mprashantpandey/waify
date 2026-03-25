<?php

namespace Tests\Feature\WhatsApp;

use App\Models\User;
use App\Models\Account;
use App\Models\Plan;
use App\Modules\WhatsApp\Models\WhatsAppConnection;
use App\Modules\WhatsApp\Models\WhatsAppContact;
use App\Modules\WhatsApp\Models\WhatsAppConversation;
use App\Modules\WhatsApp\Models\WhatsAppMessage;
use App\Modules\WhatsApp\Models\WhatsAppTemplate;
use App\Modules\WhatsApp\Models\WhatsAppTemplateSend;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Http;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class TemplateTest extends TestCase
{
    use RefreshDatabase;

    protected User $user;
    protected Account $account;
    protected WhatsAppConnection $connection;

    protected function setUp(): void
    {
        parent::setUp();

        $this->artisan('db:seed', ['--class' => 'ModuleSeeder']);
        $this->artisan('db:seed', ['--class' => 'PlanSeeder']);
        $this->user = User::factory()->create();
        $this->account = Account::factory()->create([
            'owner_id' => $this->user->id,
        ]);
        $this->account->users()->attach($this->user->id, ['role' => 'owner']);
        app(\App\Core\Billing\SubscriptionService::class)->changePlan(
            $this->account,
            Plan::where('key', 'starter')->firstOrFail(),
            $this->user
        );

        $this->connection = WhatsAppConnection::factory()->create([
            'account_id' => $this->account->id,
            'waba_id' => '123456789',
        ]);

        session(['current_account_id' => $this->account->id]);
    }

    public function test_owner_can_sync_templates(): void
    {
        // Mock Meta API response
        Http::fake([
            'graph.facebook.com/*' => Http::response([
                'data' => [
                    [
                        'id' => 'meta_template_123',
                        'name' => 'welcome_message',
                        'language' => 'en_US',
                        'status' => 'APPROVED',
                        'category' => 'UTILITY',
                        'components' => [
                            [
                                'type' => 'BODY',
                                'text' => 'Hello {{1}}, welcome to {{2}}!',
                            ],
                            [
                                'type' => 'FOOTER',
                                'text' => 'Thank you',
                            ],
                        ],
                    ],
                ],
            ], 200),
        ]);

        $response = $this->actingAs($this->user)
            ->post(route('app.whatsapp.templates.sync', ['account' => $this->account->slug]), [
                'connection_id' => $this->connection->id,
            ]);

        $response->assertRedirect();
        $this->assertDatabaseHas('whatsapp_templates', [
            'account_id' => $this->account->id,
            'whatsapp_connection_id' => $this->connection->id,
            'name' => 'welcome_message',
            'language' => 'en_US',
            'status' => 'approved',
        ]);
    }

    public function test_sync_is_idempotent(): void
    {
        // Mock Meta API response
        $mockResponse = [
            'data' => [
                [
                    'id' => 'meta_template_123',
                    'name' => 'welcome_message',
                    'language' => 'en_US',
                    'status' => 'APPROVED',
                    'category' => 'UTILITY',
                    'components' => [
                        [
                            'type' => 'BODY',
                            'text' => 'Hello {{1}}!',
                        ],
                    ],
                ],
            ],
        ];

        Http::fake([
            'graph.facebook.com/*' => Http::response($mockResponse, 200),
        ]);

        // First sync
        $this->actingAs($this->user)
            ->post(route('app.whatsapp.templates.sync', ['account' => $this->account->slug]), [
                'connection_id' => $this->connection->id,
            ]);

        $firstCount = WhatsAppTemplate::count();

        // Second sync (should update, not create duplicate)
        $this->actingAs($this->user)
            ->post(route('app.whatsapp.templates.sync', ['account' => $this->account->slug]), [
                'connection_id' => $this->connection->id,
            ]);

        $secondCount = WhatsAppTemplate::count();

        $this->assertEquals($firstCount, $secondCount, 'Template count should remain the same after second sync');
    }

    public function test_sync_updates_existing_template_when_meta_id_changes_for_same_name_language(): void
    {
        $template = WhatsAppTemplate::factory()->create([
            'account_id' => $this->account->id,
            'whatsapp_connection_id' => $this->connection->id,
            'meta_template_id' => 'meta_old_template_123',
            'name' => 'welcome_message',
            'language' => 'en_US',
            'status' => 'pending',
            'is_archived' => true,
        ]);

        Http::fake([
            'graph.facebook.com/*' => Http::response([
                'data' => [
                    [
                        'id' => 'meta_template_456',
                        'name' => 'welcome_message',
                        'language' => 'en_US',
                        'status' => 'APPROVED',
                        'category' => 'UTILITY',
                        'components' => [
                            [
                                'type' => 'BODY',
                                'text' => 'Hello {{1}}, welcome back!',
                            ],
                        ],
                    ],
                ],
            ], 200),
        ]);

        $this->actingAs($this->user)
            ->post(route('app.whatsapp.templates.sync', ['account' => $this->account->slug]), [
                'connection_id' => $this->connection->id,
            ])
            ->assertRedirect();

        $template->refresh();

        $this->assertSame('meta_template_456', $template->meta_template_id);
        $this->assertSame('approved', $template->status);
        $this->assertFalse((bool) $template->is_archived);
        $this->assertSame(1, WhatsAppTemplate::query()
            ->where('account_id', $this->account->id)
            ->where('whatsapp_connection_id', $this->connection->id)
            ->where('name', 'welcome_message')
            ->where('language', 'en_US')
            ->count());
    }

    public function test_template_list_shows_filters(): void
    {
        WhatsAppTemplate::factory()->create([
            'account_id' => $this->account->id,
            'whatsapp_connection_id' => $this->connection->id,
            'name' => 'test_template',
            'status' => 'approved',
            'category' => 'MARKETING',
        ]);

        $response = $this->actingAs($this->user)
            ->get(route('app.whatsapp.templates.index', [
                'account' => $this->account->slug,
                'status' => 'approved',
            ]));

        $response->assertStatus(200);
        $response->assertInertia(fn ($page) => $page
            ->component('WhatsApp/Templates/Index')
            ->has('templates.data', 1)
        );
    }

    public function test_template_list_includes_latest_failed_send_reason(): void
    {
        $template = WhatsAppTemplate::factory()->create([
            'account_id' => $this->account->id,
            'whatsapp_connection_id' => $this->connection->id,
            'name' => 'failure_template',
            'status' => 'approved',
        ]);

        $message = WhatsAppMessage::factory()->create([
            'account_id' => $this->account->id,
            'type' => 'template',
            'status' => 'failed',
            'error_message' => null,
            'payload' => ['error' => ['message' => 'Template parameter mismatch']],
        ]);

        WhatsAppTemplateSend::create([
            'account_id' => $this->account->id,
            'whatsapp_template_id' => $template->id,
            'whatsapp_message_id' => $message->id,
            'to_wa_id' => '919999999999',
            'variables' => ['A'],
            'status' => 'failed',
            'error_message' => null,
            'sent_at' => now()->subMinute(),
        ]);

        $this->actingAs($this->user)
            ->get(route('app.whatsapp.templates.index', ['account' => $this->account->slug]))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('WhatsApp/Templates/Index')
                ->where('templates.data.0.latest_failed_send.error_message', 'Template parameter mismatch')
            );
    }

    public function test_template_list_includes_latest_failed_send_diagnostics(): void
    {
        $template = WhatsAppTemplate::factory()->create([
            'account_id' => $this->account->id,
            'whatsapp_connection_id' => $this->connection->id,
            'name' => 'failure_template_diagnostics',
            'status' => 'approved',
            'last_meta_error' => 'Sync warning',
            'sync_state' => 'sync_error',
        ]);

        $conversation = WhatsAppConversation::factory()->create([
            'account_id' => $this->account->id,
            'whatsapp_connection_id' => $this->connection->id,
        ]);

        $message = WhatsAppMessage::factory()->create([
            'account_id' => $this->account->id,
            'whatsapp_conversation_id' => $conversation->id,
            'type' => 'template',
            'status' => 'failed',
            'meta_message_id' => 'wamid.test.failed.1',
            'error_message' => null,
            'payload' => ['error' => ['message' => 'Provider payload mismatch']],
            'sent_at' => now()->subMinute(),
        ]);

        WhatsAppTemplateSend::create([
            'account_id' => $this->account->id,
            'whatsapp_template_id' => $template->id,
            'whatsapp_message_id' => $message->id,
            'to_wa_id' => '919999999999',
            'variables' => ['A'],
            'status' => 'failed',
            'error_message' => null,
            'sent_at' => now()->subMinute(),
        ]);

        $this->actingAs($this->user)
            ->get(route('app.whatsapp.templates.index', ['account' => $this->account->slug]))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('WhatsApp/Templates/Index')
                ->where('templates.data.0.latest_failed_send.meta_message_id', 'wamid.test.failed.1')
                ->where('templates.data.0.latest_failed_send.timeline.0', 'accepted')
                ->where('templates.data.0.latest_failed_send.payload.error.message', 'Provider payload mismatch')
                ->where('templates.data.0.last_meta_error', 'Sync warning')
                ->where('templates.data.0.sync_state', 'sync_error')
            );
    }

    public function test_sending_template_creates_outbound_message(): void
    {
        $template = WhatsAppTemplate::factory()->create([
            'account_id' => $this->account->id,
            'whatsapp_connection_id' => $this->connection->id,
            'name' => 'test_template',
            'language' => 'en_US',
            'body_text' => 'Hello {{1}}!',
            'status' => 'approved',
        ]);

        // Mock WhatsApp API response
        Http::fake([
            'graph.facebook.com/*' => Http::response([
                'messages' => [
                    ['id' => 'wamid.test123'],
                ],
            ], 200),
        ]);

        $response = $this->actingAs($this->user)
            ->post(route('app.whatsapp.templates.send.store', [
                'account' => $this->account->slug,
                'template' => $template->id,
            ]), [
                'to_wa_id' => '1234567890',
                'variables' => ['World'],
            ]);

        $this->assertDatabaseHas('whatsapp_messages', [
            'account_id' => $this->account->id,
            'direction' => 'outbound',
            'type' => 'template',
            'status' => 'sent',
        ]);

        $this->assertDatabaseHas('whatsapp_template_sends', [
            'account_id' => $this->account->id,
            'whatsapp_template_id' => $template->id,
            'to_wa_id' => '1234567890',
            'status' => 'sent',
        ]);
    }

    public function test_member_cannot_sync_templates(): void
    {
        $member = User::factory()->create();
        $this->account->users()->attach($member->id, ['role' => 'member']);

        $response = $this->actingAs($member)
            ->withSession(['current_account_id' => $this->account->id])
            ->post(route('app.whatsapp.templates.sync', ['account' => $this->account->slug]), [
                'connection_id' => $this->connection->id,
            ]);

        $response->assertStatus(302);
    }

    public function test_sync_marks_missing_remote_templates_as_non_sendable(): void
    {
        $template = WhatsAppTemplate::factory()->create([
            'account_id' => $this->account->id,
            'whatsapp_connection_id' => $this->connection->id,
            'meta_template_id' => 'meta_template_old',
            'name' => 'legacy_template',
            'language' => 'en_US',
            'status' => 'approved',
            'is_remote_deleted' => false,
            'sync_state' => 'synced',
        ]);

        Http::fake([
            'graph.facebook.com/*' => Http::response([
                'data' => [],
            ], 200),
        ]);

        $this->actingAs($this->user)
            ->post(route('app.whatsapp.templates.sync', ['account' => $this->account->slug]), [
                'connection_id' => $this->connection->id,
            ])
            ->assertRedirect();

        $template->refresh();

        $this->assertTrue((bool) $template->is_remote_deleted);
        $this->assertSame('missing_remote', $template->sync_state);
        $this->assertSame('disabled', $template->status);
        $this->assertNotNull($template->remote_deleted_at);
    }

    public function test_send_blocks_non_sendable_template_before_provider_call(): void
    {
        $template = WhatsAppTemplate::factory()->create([
            'account_id' => $this->account->id,
            'whatsapp_connection_id' => $this->connection->id,
            'name' => 'pending_template',
            'language' => 'en_US',
            'body_text' => 'Hello {{1}}',
            'status' => 'pending',
            'meta_template_id' => 'meta_pending_1',
            'is_remote_deleted' => false,
            'last_meta_sync_at' => now(),
            'sync_state' => 'pending_review',
        ]);

        Http::fake();

        $response = $this->actingAs($this->user)
            ->post(route('app.whatsapp.templates.send.store', [
                'account' => $this->account->slug,
                'template' => $template->id,
            ]), [
                'to_wa_id' => '1234567890',
                'variables' => ['Test'],
            ]);

        $response->assertSessionHasErrors('template');
        Http::assertNothingSent();
    }

    public function test_send_blocks_suppressed_contact(): void
    {
        $template = WhatsAppTemplate::factory()->create([
            'account_id' => $this->account->id,
            'whatsapp_connection_id' => $this->connection->id,
            'name' => 'approved_template',
            'language' => 'en_US',
            'body_text' => 'Hello {{1}}',
            'status' => 'approved',
            'meta_template_id' => 'meta_ok_1',
            'last_meta_sync_at' => now(),
            'sync_state' => 'synced',
        ]);

        \App\Modules\WhatsApp\Models\WhatsAppContact::factory()->create([
            'account_id' => $this->account->id,
            'wa_id' => '1234567890',
            'status' => 'opt_out',
            'do_not_contact' => true,
            'opted_out_at' => now(),
        ]);

        Http::fake();

        $response = $this->actingAs($this->user)
            ->post(route('app.whatsapp.templates.send.store', [
                'account' => $this->account->slug,
                'template' => $template->id,
            ]), [
                'to_wa_id' => '1234567890',
                'variables' => ['Test'],
            ]);

        $response->assertSessionHasErrors('to_wa_id');
        Http::assertNothingSent();
    }

    public function test_active_templates_are_available_in_conversation_template_picker(): void
    {
        $contact = WhatsAppContact::factory()->create([
            'account_id' => $this->account->id,
        ]);

        $conversation = WhatsAppConversation::factory()->create([
            'account_id' => $this->account->id,
            'whatsapp_connection_id' => $this->connection->id,
            'whatsapp_contact_id' => $contact->id,
        ]);

        $activeTemplate = WhatsAppTemplate::factory()->create([
            'account_id' => $this->account->id,
            'whatsapp_connection_id' => $this->connection->id,
            'name' => 'active_template',
            'status' => 'active',
        ]);

        $this->actingAs($this->user)
            ->get(route('app.whatsapp.conversations.show', [
                'account' => $this->account->slug,
                'conversation' => $conversation->id,
            ]))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('WhatsApp/Conversations/Show')
                ->where('templates.0.id', $activeTemplate->id)
                ->where('templates.0.name', 'active_template')
            );
    }
}
