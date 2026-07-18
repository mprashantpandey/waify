<?php

namespace Tests\Feature\Billing;

use App\Core\Billing\UsageService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class TemplateLimitTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->artisan('db:seed', ['--class' => 'ModuleSeeder']);
        $this->artisan('db:seed', ['--class' => 'PlanSeeder']);
    }

    public function test_template_sending_increments_both_counters(): void
    {

        $account = $this->createAccountWithPlan('starter'); // Has template sends
        $user = $this->actingAsAccountOwner($account);

        $usageService = app(UsageService::class);
        $initialUsage = $usageService->getCurrentUsage($account);
        $initialMessages = $initialUsage->messages_sent;
        $initialTemplates = $initialUsage->template_sends;

        $connection = \App\Modules\WhatsApp\Models\WhatsAppConnection::factory()->create([
            'account_id' => $account->id,
        ]);
        $contact = \App\Modules\WhatsApp\Models\WhatsAppContact::factory()->create([
            'account_id' => $account->id,
        ]);
        $conversation = \App\Modules\WhatsApp\Models\WhatsAppConversation::factory()->create([
            'account_id' => $account->id,
            'whatsapp_connection_id' => $connection->id,
            'whatsapp_contact_id' => $contact->id,
        ]);
        $template = \App\Modules\WhatsApp\Models\WhatsAppTemplate::factory()->create([
            'account_id' => $account->id,
            'body_text' => 'Hello {{1}}',
        ]);
        $message = \App\Modules\WhatsApp\Models\WhatsAppMessage::factory()->create([
            'account_id' => $account->id,
            'whatsapp_conversation_id' => $conversation->id,
            'direction' => 'outbound',
            'type' => 'template',
            'status' => 'sent',
            'sent_at' => now(),
        ]);
        \App\Modules\WhatsApp\Models\WhatsAppTemplateSend::create([
            'account_id' => $account->id,
            'whatsapp_template_id' => $template->id,
            'whatsapp_message_id' => $message->id,
            'to_wa_id' => '1234567890',
            'variables' => ['Test'],
            'status' => 'sent',
            'sent_at' => now(),
        ]);

        $usageService->incrementMessages($account, 1);
        $usageService->incrementTemplateSends($account, 1);

        $finalUsage = $usageService->getCurrentUsage($account);
        $this->assertEquals($initialMessages + 1, $finalUsage->messages_sent);
        $this->assertEquals($initialTemplates + 1, $finalUsage->template_sends);
    }

    public function test_template_sending_blocked_when_template_limit_exceeded(): void
    {

        $account = $this->createAccountWithPlan('starter'); // 1000 template sends limit
        $user = $this->actingAsAccountOwner($account);

        // Set template usage at limit
        $connection = \App\Modules\WhatsApp\Models\WhatsAppConnection::factory()->create([
            'account_id' => $account->id,
        ]);
        $contact = \App\Modules\WhatsApp\Models\WhatsAppContact::factory()->create([
            'account_id' => $account->id,
        ]);
        $conversation = \App\Modules\WhatsApp\Models\WhatsAppConversation::factory()->create([
            'account_id' => $account->id,
            'whatsapp_connection_id' => $connection->id,
            'whatsapp_contact_id' => $contact->id,
        ]);

        // Try to send template (should be blocked)
        $template = \App\Modules\WhatsApp\Models\WhatsAppTemplate::factory()->create([
            'account_id' => $account->id,
            'whatsapp_connection_id' => $connection->id,
            'body_text' => 'Hello there',
        ]);

        $now = now();
        $messages = [];
        for ($i = 0; $i < 1000; $i++) {
            $messages[] = [
                'account_id' => $account->id,
                'whatsapp_conversation_id' => $conversation->id,
                'direction' => 'outbound',
                'meta_message_id' => 'wamid.template-quota-'.$i,
                'type' => 'template',
                'text_body' => 'Template quota seed',
                'status' => 'sent',
                'sent_at' => $now,
                'created_at' => $now,
                'updated_at' => $now,
            ];
        }
        \App\Modules\WhatsApp\Models\WhatsAppMessage::insert($messages);

        $messageIds = \App\Modules\WhatsApp\Models\WhatsAppMessage::where('account_id', $account->id)
            ->where('type', 'template')
            ->pluck('id');
        $templateSends = $messageIds->map(fn ($messageId, $index) => [
            'account_id' => $account->id,
            'whatsapp_template_id' => $template->id,
            'whatsapp_message_id' => $messageId,
            'to_wa_id' => '1234567890',
            'variables' => json_encode(['Test']),
            'status' => 'sent',
            'sent_at' => $now,
            'created_at' => $now,
            'updated_at' => $now,
        ])->all();
        \App\Modules\WhatsApp\Models\WhatsAppTemplateSend::insert($templateSends);

        $response = $this->post(route('app.whatsapp.templates.send.store', [
            'account' => $account->slug,
            'template' => $template->id,
        ]), [
            'to_wa_id' => '1234567890',
            'variables' => ['Test'],
        ]);

        $response->assertStatus(402);
    }
}
