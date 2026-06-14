<?php

namespace Tests\Feature;

use App\Models\AccountCatalogProduct;
use App\Models\AccountEcommerceOrder;
use App\Models\AccountIntegration;
use App\Models\AccountMediaAsset;
use App\Models\AccountMetaLead;
use App\Models\AccountSurvey;
use App\Models\Plan;
use App\Modules\Chatbots\Models\Bot;
use App\Modules\Chatbots\Models\BotFlow;
use App\Modules\Chatbots\Models\BotNode;
use App\Modules\WhatsApp\Models\WhatsAppConnection;
use App\Modules\WhatsApp\Models\WhatsAppContact;
use App\Modules\WhatsApp\Models\WhatsAppMessage;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class WorkspaceAddonTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        if (Plan::count() === 0) {
            $this->artisan('db:seed', ['--class' => 'PlanSeeder']);
        }
    }

    public function test_workspace_catalog_products_are_real_records(): void
    {
        $account = $this->createAccountWithPlan('starter');
        $this->actingAsAccountOwner($account);

        $response = $this->post(route('app.catalog.products.store'), [
            'name' => 'Starter kit',
            'sku' => 'KIT-1',
            'category' => 'Bundles',
            'price' => 129900,
            'stock' => 12,
            'status' => 'active',
        ]);

        $response->assertRedirect();
        $product = AccountCatalogProduct::where('account_id', $account->id)->firstOrFail();
        $this->assertSame('Starter kit', $product->name);

        $this->patch(route('app.catalog.products.update', $product), [
            'name' => 'Starter kit pro',
            'sku' => 'KIT-1',
            'category' => 'Bundles',
            'price' => 149900,
            'stock' => 9,
            'status' => 'active',
        ])->assertRedirect();

        $this->assertDatabaseHas('account_catalog_products', [
            'id' => $product->id,
            'name' => 'Starter kit pro',
            'price' => 149900,
        ]);
    }

    public function test_workspace_addon_records_can_be_created(): void
    {
        $account = $this->createAccountWithPlan('starter');
        $this->actingAsAccountOwner($account);

        $this->post(route('app.surveys.store'), [
            'name' => 'Post purchase CSAT',
            'type' => 'CSAT',
            'trigger' => 'After order delivery',
            'status' => 'active',
            'questions' => ['How was delivery?'],
        ])->assertRedirect();

        $this->post(route('app.appointments.store'), [
            'title' => 'Product demo',
            'contact_name' => 'Prashant',
            'contact_phone' => '+919999999999',
            'scheduled_at' => now()->addDay()->toDateTimeString(),
            'duration_minutes' => 30,
            'status' => 'confirmed',
        ])->assertRedirect();

        $this->post(route('app.meta-leads.store'), [
            'name' => 'Meta Lead',
            'phone' => '+919888888888',
            'stage' => 'qualified',
            'platform' => 'Facebook',
            'score' => 82,
        ])->assertRedirect();

        $this->post(route('app.ecommerce.orders.store'), [
            'order_number' => 'ORD-1001',
            'customer_name' => 'Customer One',
            'amount' => 259900,
            'status' => 'paid',
            'source' => 'manual',
        ])->assertRedirect();

        $this->assertDatabaseHas('account_surveys', ['account_id' => $account->id, 'name' => 'Post purchase CSAT']);
        $this->assertDatabaseHas('account_appointments', ['account_id' => $account->id, 'title' => 'Product demo']);
        $this->assertDatabaseHas('account_meta_leads', ['account_id' => $account->id, 'name' => 'Meta Lead']);
        $this->assertDatabaseHas('account_ecommerce_orders', ['account_id' => $account->id, 'order_number' => 'ORD-1001']);
    }

    public function test_media_library_uploads_real_workspace_assets(): void
    {
        Storage::fake('public');

        $account = $this->createAccountWithPlan('starter');
        $this->actingAsAccountOwner($account);

        $response = $this->post(route('app.media-library.store'), [
            'file' => UploadedFile::fake()->image('catalog.png', 640, 480),
        ]);

        $response->assertRedirect();
        $asset = AccountMediaAsset::where('account_id', $account->id)->firstOrFail();
        $this->assertSame('image', $asset->type);
        Storage::disk('public')->assertExists($asset->path);
    }

    public function test_public_survey_collects_real_responses(): void
    {
        $account = $this->createAccountWithPlan('starter');
        $survey = AccountSurvey::create([
            'account_id' => $account->id,
            'name' => 'NPS',
            'type' => 'NPS',
            'status' => 'active',
            'questions' => ['Why did you choose this score?'],
            'auto_create_contact' => true,
            'auto_tag_names' => ['Survey lead'],
        ]);

        $this->get(route('public.surveys.show', $survey))
            ->assertOk()
            ->assertInertia(fn ($page) => $page->component('Public/SurveyForm'));

        $this->post(route('public.surveys.submit', $survey), [
            'respondent_name' => 'Customer',
            'respondent_phone' => '+919999999999',
            'score' => 5,
            'answers' => ['0' => 'Fast support'],
        ])->assertRedirect();

        $this->assertDatabaseHas('account_survey_responses', [
            'account_survey_id' => $survey->id,
            'score' => 5,
        ]);
        $this->assertSame(1, $survey->fresh()->responses_count);
        $this->assertSame('5.00', (string) $survey->fresh()->average_score);
        $contact = WhatsAppContact::where('account_id', $account->id)->where('wa_id', '919999999999')->firstOrFail();
        $this->assertSame('Customer', $contact->name);
        $this->assertSame('public_form', $contact->source);
        $this->assertDatabaseHas('contact_tags', [
            'account_id' => $account->id,
            'name' => 'Survey lead',
        ]);
    }

    public function test_public_survey_can_start_selected_automation_flow(): void
    {
        $account = $this->createAccountWithPlan('starter');
        WhatsAppConnection::factory()->create(['account_id' => $account->id, 'is_active' => true]);

        $bot = Bot::create([
            'account_id' => $account->id,
            'name' => 'Form lead bot',
            'status' => 'active',
            'applies_to' => ['all_connections' => true, 'connection_ids' => []],
            'stop_on_first_flow' => true,
            'session_timeout_minutes' => 120,
            'session_resume_mode' => 'resume',
        ]);
        $flow = BotFlow::create([
            'account_id' => $account->id,
            'bot_id' => $bot->id,
            'name' => 'Tag form lead',
            'trigger' => ['type' => 'form_submission'],
            'enabled' => true,
            'priority' => 10,
        ]);
        BotNode::create([
            'account_id' => $account->id,
            'bot_flow_id' => $flow->id,
            'type' => 'action',
            'config' => ['action_type' => 'add_tag', 'tag_name' => 'Automation started'],
            'sort_order' => 1,
        ]);

        $survey = AccountSurvey::create([
            'account_id' => $account->id,
            'name' => 'Lead capture',
            'type' => 'Lead form',
            'status' => 'active',
            'questions' => ['Requirement'],
            'auto_create_contact' => true,
            'automation_enabled' => true,
            'automation_bot_flow_id' => $flow->id,
        ]);

        $this->post(route('public.surveys.submit', $survey), [
            'respondent_name' => 'Lead Customer',
            'respondent_phone' => '+919888888888',
            'answers' => ['0' => 'Need WhatsApp automation'],
        ])->assertRedirect();

        $contact = WhatsAppContact::where('account_id', $account->id)->where('wa_id', '919888888888')->firstOrFail();
        $this->assertTrue($contact->tags()->where('name', 'Automation started')->exists());
        $this->assertDatabaseHas('bot_executions', [
            'account_id' => $account->id,
            'bot_flow_id' => $flow->id,
            'status' => 'success',
        ]);
    }

    public function test_leads_and_orders_convert_to_contacts(): void
    {
        $account = $this->createAccountWithPlan('starter');
        $this->actingAsAccountOwner($account);

        $lead = AccountMetaLead::create([
            'account_id' => $account->id,
            'name' => 'Lead One',
            'phone' => '+91 98888 88888',
            'email' => 'lead@example.com',
            'stage' => 'qualified',
        ]);
        $this->post(route('app.meta-leads.contact', $lead))->assertRedirect();

        $order = AccountEcommerceOrder::create([
            'account_id' => $account->id,
            'order_number' => 'ORD-2002',
            'customer_name' => 'Buyer One',
            'customer_phone' => '+91 97777 77777',
            'amount' => 1000,
            'status' => 'paid',
        ]);
        $this->post(route('app.ecommerce.orders.contact', $order))->assertRedirect();

        $this->assertSame(2, WhatsAppContact::where('account_id', $account->id)->count());
        $this->assertDatabaseHas('whatsapp_contacts', [
            'account_id' => $account->id,
            'wa_id' => '919888888888',
            'source' => 'meta_lead',
        ]);
        $this->assertDatabaseHas('whatsapp_contacts', [
            'account_id' => $account->id,
            'wa_id' => '919777777777',
            'source' => 'ecommerce_order',
        ]);
    }

    public function test_appointment_reminder_sends_whatsapp_message(): void
    {
        Http::fake([
            'graph.facebook.com/*' => Http::response([
                'messages' => [['id' => 'wamid.reminder']],
            ]),
        ]);

        $account = $this->createAccountWithPlan('starter');
        $this->actingAsAccountOwner($account);
        $connection = new WhatsAppConnection([
            'account_id' => $account->id,
            'name' => 'Primary WABA',
            'phone_number_id' => '123456789',
            'business_phone' => '+919900000000',
            'api_version' => 'v21.0',
            'webhook_verify_token' => 'verify-token-reminder',
            'is_active' => true,
        ]);
        $connection->access_token = 'test-token';
        $connection->save();

        $this->post(route('app.appointments.store'), [
            'title' => 'Product demo',
            'contact_name' => 'Reminder Customer',
            'contact_phone' => '+91 96666 66666',
            'scheduled_at' => now()->addDay()->toDateTimeString(),
            'status' => 'confirmed',
        ])->assertRedirect();

        $appointment = $account->appointments()->firstOrFail();
        $this->post(route('app.appointments.reminder', $appointment))->assertRedirect();

        $this->assertDatabaseHas('whatsapp_contacts', [
            'account_id' => $account->id,
            'wa_id' => '919666666666',
            'source' => 'appointment',
        ]);
        $this->assertDatabaseHas('whatsapp_messages', [
            'account_id' => $account->id,
            'meta_message_id' => 'wamid.reminder',
            'status' => 'sent',
        ]);
        $this->assertNotNull($appointment->fresh()->reminder_sent_at);
        $this->assertSame(1, WhatsAppMessage::where('account_id', $account->id)->count());
    }

    public function test_appointment_creates_google_calendar_event_when_export_enabled(): void
    {
        Http::fake([
            'www.googleapis.com/calendar/v3/*' => Http::response([
                'id' => 'google-event-1',
                'htmlLink' => 'https://calendar.google.com/event?eid=google-event-1',
                'hangoutLink' => 'https://meet.google.com/abc-defg-hij',
            ]),
        ]);

        $account = $this->createAccountWithPlan('starter');
        $this->actingAsAccountOwner($account);

        AccountIntegration::create([
            'account_id' => $account->id,
            'provider' => 'google-calendar',
            'status' => 'connected',
            'config' => [
                'access_token' => 'google-token',
                'calendar_id' => 'primary',
                'sync_direction' => 'export',
                'create_google_meet' => true,
            ],
            'features' => [],
            'health' => 'configured',
        ]);

        $this->post(route('app.appointments.store'), [
            'title' => 'Google demo',
            'contact_name' => 'Calendar Customer',
            'contact_phone' => '+91 94444 44444',
            'scheduled_at' => now()->addDay()->toDateTimeString(),
            'duration_minutes' => 45,
            'status' => 'confirmed',
        ])->assertRedirect();

        $appointment = $account->appointments()->firstOrFail();
        $this->assertSame('google_calendar', $appointment->external_source);
        $this->assertSame('google-event-1', $appointment->external_id);
        $this->assertSame('https://meet.google.com/abc-defg-hij', $appointment->meeting_url);

        Http::assertSent(fn ($request) => $request->method() === 'POST'
            && str_contains($request->url(), '/calendar/v3/calendars/primary/events')
            && ($request['summary'] ?? null) === 'Google demo');
    }

    public function test_meta_lead_webhook_creates_real_lead_and_contact_when_enabled(): void
    {
        Http::fake([
            'graph.facebook.com/*' => Http::response([
                'id' => 'lead-123',
                'created_time' => now()->toIso8601String(),
                'ad_name' => 'Launch Ad',
                'campaign_name' => 'Launch Campaign',
                'form_id' => 'form-123',
                'platform' => 'instagram',
                'field_data' => [
                    ['name' => 'full_name', 'values' => ['Webhook Lead']],
                    ['name' => 'phone_number', 'values' => ['+91 93333 33333']],
                    ['name' => 'email', 'values' => ['webhook@example.com']],
                ],
            ]),
        ]);

        $account = $this->createAccountWithPlan('starter');
        AccountIntegration::create([
            'account_id' => $account->id,
            'provider' => 'meta-leads',
            'status' => 'connected',
            'config' => [
                'access_token' => 'page-token',
                'page_id' => 'page-123',
                'form_id' => 'form-123',
                'form_name' => 'Demo form',
                'auto_create_contact' => true,
                'auto_tags' => 'meta-lead,hot',
            ],
            'features' => [],
            'health' => 'configured',
        ]);

        $payload = [
            'entry' => [[
                'id' => 'page-123',
                'changes' => [[
                    'field' => 'leadgen',
                    'value' => [
                        'leadgen_id' => 'lead-123',
                        'page_id' => 'page-123',
                        'form_id' => 'form-123',
                    ],
                ]],
            ]],
        ];

        $this->postJson(route('webhooks.integrations.meta-leads.receive'), $payload)
            ->assertOk()
            ->assertJsonPath('result.created', 1);

        $this->assertDatabaseHas('account_meta_leads', [
            'account_id' => $account->id,
            'external_id' => 'lead-123',
            'name' => 'Webhook Lead',
            'platform' => 'Instagram',
            'stage' => 'contacted',
        ]);
        $this->assertDatabaseHas('whatsapp_contacts', [
            'account_id' => $account->id,
            'wa_id' => '919333333333',
            'source' => 'meta_lead',
        ]);
        $this->assertDatabaseHas('app_notifications', [
            'account_id' => $account->id,
            'scope' => 'workspace',
            'type' => 'new_meta_lead',
            'title' => 'New Meta lead received',
        ]);
    }

    public function test_due_appointment_reminders_are_sent_by_scheduler_command(): void
    {
        Http::fake([
            'graph.facebook.com/*' => Http::response([
                'messages' => [['id' => 'wamid.scheduled.reminder']],
            ]),
        ]);

        $account = $this->createAccountWithPlan('starter');
        $connection = new WhatsAppConnection([
            'account_id' => $account->id,
            'name' => 'Primary WABA',
            'phone_number_id' => '123456789',
            'business_phone' => '+919900000000',
            'api_version' => 'v21.0',
            'webhook_verify_token' => 'verify-token-scheduled-reminder',
            'is_active' => true,
        ]);
        $connection->access_token = 'test-token';
        $connection->save();

        $appointment = $account->appointments()->create([
            'title' => 'Launch demo',
            'contact_name' => 'Scheduled Customer',
            'contact_phone' => '+91 95555 55555',
            'scheduled_at' => now()->addMinutes(30),
            'duration_minutes' => 30,
            'status' => 'confirmed',
            'reminder_enabled' => true,
            'reminder_minutes_before' => 60,
        ]);

        $this->artisan('appointments:send-reminders')->assertSuccessful();

        $this->assertNotNull($appointment->fresh()->reminder_sent_at);
        $this->assertDatabaseHas('whatsapp_messages', [
            'account_id' => $account->id,
            'meta_message_id' => 'wamid.scheduled.reminder',
            'status' => 'sent',
        ]);

        $this->artisan('appointments:send-reminders')->assertSuccessful();
        $this->assertSame(1, WhatsAppMessage::where('account_id', $account->id)->count());
    }
}
