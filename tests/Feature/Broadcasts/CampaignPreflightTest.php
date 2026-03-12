<?php

namespace Tests\Feature\Broadcasts;

use App\Models\User;
use App\Modules\Broadcasts\Models\Campaign;
use App\Modules\Broadcasts\Models\CampaignRecipient;
use App\Modules\Broadcasts\Services\CampaignService;
use App\Modules\WhatsApp\Models\WhatsAppConnection;
use App\Modules\WhatsApp\Models\WhatsAppContact;
use App\Modules\WhatsApp\Models\WhatsAppConversation;
use App\Modules\WhatsApp\Models\WhatsAppMessage;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Queue;
use Tests\TestCase;

class CampaignPreflightTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->artisan('db:seed', ['--class' => 'ModuleSeeder']);
        $this->artisan('db:seed', ['--class' => 'PlanSeeder']);
    }

    public function test_start_campaign_applies_policy_guards_and_skips_blocked_recipients(): void
    {
        Queue::fake();

        $account = $this->createAccountWithPlan('pro');
        $owner = User::findOrFail($account->owner_id);
        $connection = WhatsAppConnection::factory()->create([
            'account_id' => $account->id,
            'is_active' => true,
        ]);

        $suppressedContact = WhatsAppContact::factory()->create([
            'account_id' => $account->id,
            'wa_id' => '919001111111',
            'do_not_contact' => true,
            'status' => 'active',
        ]);
        $outsideWindowContact = WhatsAppContact::factory()->create([
            'account_id' => $account->id,
            'wa_id' => '919002222222',
            'do_not_contact' => false,
            'status' => 'active',
        ]);
        $eligibleContact = WhatsAppContact::factory()->create([
            'account_id' => $account->id,
            'wa_id' => '919003333333',
            'do_not_contact' => false,
            'status' => 'active',
        ]);

        $eligibleConversation = WhatsAppConversation::factory()->create([
            'account_id' => $account->id,
            'whatsapp_connection_id' => $connection->id,
            'whatsapp_contact_id' => $eligibleContact->id,
        ]);
        WhatsAppMessage::factory()->create([
            'account_id' => $account->id,
            'whatsapp_conversation_id' => $eligibleConversation->id,
            'direction' => 'inbound',
            'received_at' => now()->subMinutes(10),
            'created_at' => now()->subMinutes(10),
        ]);

        $campaign = Campaign::create([
            'account_id' => $account->id,
            'whatsapp_connection_id' => $connection->id,
            'created_by' => $owner->id,
            'name' => 'Policy Test Campaign',
            'type' => 'text',
            'status' => 'draft',
            'message_text' => 'Hello from policy test',
            'recipient_type' => 'custom',
            'custom_recipients' => [],
            'total_recipients' => 3,
            'respect_opt_out' => true,
        ]);

        CampaignRecipient::create([
            'campaign_id' => $campaign->id,
            'whatsapp_contact_id' => $suppressedContact->id,
            'phone_number' => $suppressedContact->wa_id,
            'status' => 'pending',
        ]);
        CampaignRecipient::create([
            'campaign_id' => $campaign->id,
            'whatsapp_contact_id' => $outsideWindowContact->id,
            'phone_number' => $outsideWindowContact->wa_id,
            'status' => 'pending',
        ]);
        CampaignRecipient::create([
            'campaign_id' => $campaign->id,
            'whatsapp_contact_id' => $eligibleContact->id,
            'phone_number' => $eligibleContact->wa_id,
            'status' => 'pending',
        ]);

        app(CampaignService::class)->startCampaign($campaign->fresh());

        $statuses = CampaignRecipient::query()
            ->where('campaign_id', $campaign->id)
            ->orderBy('phone_number')
            ->get(['phone_number', 'status', 'failure_reason'])
            ->keyBy('phone_number');

        $this->assertSame('skipped', $statuses['919001111111']->status);
        $this->assertStringContainsString('suppressed', strtolower((string) $statuses['919001111111']->failure_reason));

        $this->assertSame('skipped', $statuses['919002222222']->status);
        $this->assertStringContainsString('approved template message', strtolower((string) $statuses['919002222222']->failure_reason));

        $this->assertSame('pending', $statuses['919003333333']->status);
    }

    public function test_preflight_includes_recipient_risk_summary(): void
    {
        $account = $this->createAccountWithPlan('pro');
        $owner = User::findOrFail($account->owner_id);
        $connection = WhatsAppConnection::factory()->create([
            'account_id' => $account->id,
            'is_active' => true,
            'webhook_last_received_at' => now(),
        ]);

        $campaign = Campaign::create([
            'account_id' => $account->id,
            'whatsapp_connection_id' => $connection->id,
            'created_by' => $owner->id,
            'name' => 'Risk Summary Campaign',
            'type' => 'text',
            'status' => 'draft',
            'message_text' => 'Hello',
            'recipient_type' => 'custom',
            'custom_recipients' => [],
            'total_recipients' => 2,
            'respect_opt_out' => true,
        ]);

        CampaignRecipient::create([
            'campaign_id' => $campaign->id,
            'phone_number' => '919004444444',
            'status' => 'pending',
        ]);
        CampaignRecipient::create([
            'campaign_id' => $campaign->id,
            'phone_number' => '919005555555',
            'status' => 'skipped',
            'failure_reason' => 'Contact is suppressed (opted out/blocked/do-not-contact).',
        ]);

        $preflight = app(CampaignService::class)->runPreflightChecks($campaign->fresh());

        $this->assertArrayHasKey('recipient_risk', $preflight);
        $this->assertSame(1, $preflight['recipient_risk']['pending']);
        $this->assertSame(1, $preflight['recipient_risk']['skipped_total']);
        $this->assertSame(
            1,
            $preflight['recipient_risk']['skipped_by_reason']['Contact is suppressed (opted out/blocked/do-not-contact).'] ?? 0
        );
    }
}
