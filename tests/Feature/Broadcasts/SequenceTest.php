<?php

namespace Tests\Feature\Broadcasts;

use App\Modules\Broadcasts\Jobs\SendSequenceStepJob;
use App\Modules\Broadcasts\Models\CampaignSequence;
use App\Modules\Broadcasts\Models\CampaignSequenceEnrollment;
use App\Modules\Broadcasts\Models\CampaignSequenceStep;
use App\Modules\Broadcasts\Services\SequenceService;
use App\Modules\WhatsApp\Models\WhatsAppConnection;
use App\Modules\WhatsApp\Models\WhatsAppContact;
use App\Modules\WhatsApp\Models\WhatsAppConversation;
use App\Modules\WhatsApp\Services\WhatsAppClient;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Queue;
use Tests\TestCase;

class SequenceTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->artisan('db:seed', ['--class' => 'ModuleSeeder']);
        $this->artisan('db:seed', ['--class' => 'PlanSeeder']);
    }

    public function test_owner_can_create_sequence(): void
    {
        $account = $this->createAccountWithPlan('starter');
        $this->actingAsAccountOwner($account);

        $connection = WhatsAppConnection::factory()->create([
            'account_id' => $account->id,
            'is_active' => true,
        ]);

        $response = $this->post(route('app.broadcasts.sequences.store'), [
            'name' => 'Welcome follow-up',
            'description' => 'Send a welcome and a reminder.',
            'whatsapp_connection_id' => $connection->id,
            'audience_type' => 'custom',
            'custom_recipients' => [
                ['name' => 'Lead One', 'phone' => '+91 99999 00001'],
            ],
            'steps' => [
                [
                    'type' => 'text',
                    'delay_minutes' => 0,
                    'message_text' => 'Thanks for reaching out.',
                ],
                [
                    'type' => 'text',
                    'delay_minutes' => 60,
                    'message_text' => 'Checking back in after an hour.',
                ],
            ],
        ]);

        $response->assertRedirect();

        $sequence = CampaignSequence::query()->where('account_id', $account->id)->firstOrFail();
        $this->assertSame('Welcome follow-up', $sequence->name);
        $this->assertSame('draft', $sequence->status);
        $this->assertCount(2, $sequence->steps);
    }

    public function test_activating_sequence_enrolls_audience_and_queues_steps(): void
    {
        Queue::fake();

        $account = $this->createAccountWithPlan('starter');
        $this->actingAsAccountOwner($account);

        $connection = WhatsAppConnection::factory()->create([
            'account_id' => $account->id,
            'is_active' => true,
        ]);

        WhatsAppContact::factory()->create([
            'account_id' => $account->id,
            'wa_id' => '919999900001',
        ]);
        WhatsAppContact::factory()->create([
            'account_id' => $account->id,
            'wa_id' => '919999900002',
        ]);

        $sequence = CampaignSequence::create([
            'account_id' => $account->id,
            'whatsapp_connection_id' => $connection->id,
            'created_by' => $account->owner_id,
            'name' => 'Lead nurture',
            'status' => 'draft',
            'audience_type' => 'contacts',
        ]);

        CampaignSequenceStep::create([
            'campaign_sequence_id' => $sequence->id,
            'step_order' => 1,
            'delay_minutes' => 0,
            'type' => 'text',
            'message_text' => 'Welcome',
        ]);
        CampaignSequenceStep::create([
            'campaign_sequence_id' => $sequence->id,
            'step_order' => 2,
            'delay_minutes' => 120,
            'type' => 'text',
            'message_text' => 'Reminder',
        ]);

        $this->post(route('app.broadcasts.sequences.activate', ['sequence' => $sequence->slug]))
            ->assertRedirect();

        $sequence->refresh();
        $this->assertSame('active', $sequence->status);
        $this->assertSame(2, $sequence->enrolled_count);
        $this->assertDatabaseCount('campaign_sequence_enrollments', 2);
        Queue::assertPushed(SendSequenceStepJob::class, 4);
    }

    public function test_sequence_service_sends_text_step_and_completes_enrollment(): void
    {
        $account = $this->createAccountWithPlan('starter');

        $connection = WhatsAppConnection::factory()->create([
            'account_id' => $account->id,
            'is_active' => true,
            'activation_state' => 'active',
        ]);
        $contact = WhatsAppContact::factory()->create([
            'account_id' => $account->id,
            'wa_id' => '919999900010',
        ]);
        $conversation = WhatsAppConversation::factory()->create([
            'account_id' => $account->id,
            'whatsapp_connection_id' => $connection->id,
            'whatsapp_contact_id' => $contact->id,
            'last_inbound_at' => now(),
            'service_window_expires_at' => now()->addHours(24),
        ]);

        $sequence = CampaignSequence::create([
            'account_id' => $account->id,
            'whatsapp_connection_id' => $connection->id,
            'created_by' => $account->owner_id,
            'name' => 'Window follow-up',
            'status' => 'active',
            'audience_type' => 'contacts',
        ]);

        $step = CampaignSequenceStep::create([
            'campaign_sequence_id' => $sequence->id,
            'step_order' => 1,
            'delay_minutes' => 0,
            'type' => 'text',
            'message_text' => 'Thanks for your interest.',
        ]);

        $enrollment = CampaignSequenceEnrollment::create([
            'campaign_sequence_id' => $sequence->id,
            'whatsapp_contact_id' => $contact->id,
            'wa_id' => $contact->wa_id,
            'name' => $contact->name,
            'status' => 'active',
            'enrolled_at' => now(),
            'metadata' => ['sent_step_ids' => []],
        ]);

        $this->mock(WhatsAppClient::class, function ($mock): void {
            $mock->shouldReceive('sendTextMessage')
                ->once()
                ->andReturn(['messages' => [['id' => 'wamid.sequence.1']]]);
        });

        app(SequenceService::class)->executeStep($sequence->id, $enrollment->id, $step->id);

        $this->assertDatabaseHas('whatsapp_messages', [
            'account_id' => $account->id,
            'whatsapp_conversation_id' => $conversation->id,
            'direction' => 'outbound',
            'status' => 'sent',
            'meta_message_id' => 'wamid.sequence.1',
        ]);

        $enrollment->refresh();
        $this->assertSame('completed', $enrollment->status);
        $this->assertSame(1, $enrollment->sent_steps_count);
    }
}
