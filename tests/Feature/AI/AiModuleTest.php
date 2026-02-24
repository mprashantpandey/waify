<?php

namespace Tests\Feature\AI;

use App\Models\Account;
use App\Models\AccountModule;
use App\Models\Plan;
use App\Models\PlatformSetting;
use App\Models\User;
use App\Modules\WhatsApp\Models\WhatsAppConnection;
use App\Modules\WhatsApp\Models\WhatsAppContact;
use App\Modules\WhatsApp\Models\WhatsAppConversation;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class AiModuleTest extends TestCase
{
    use RefreshDatabase;

    protected User $owner;
    protected Account $account;

    protected function setUp(): void
    {
        parent::setUp();

        $this->artisan('db:seed', ['--class' => 'ModuleSeeder']);
        $this->artisan('db:seed', ['--class' => 'PlanSeeder']);
        \App\Models\Module::where('key', 'ai')->update(['is_enabled' => true]);

        $this->owner = User::factory()->create();
        $this->account = Account::factory()->create([
            'owner_id' => $this->owner->id,
        ]);
        $this->account->users()->attach($this->owner->id, ['role' => 'owner']);

        app(\App\Core\Billing\SubscriptionService::class)->changePlan(
            $this->account,
            Plan::where('key', 'enterprise')->firstOrFail(),
            $this->owner
        );

        AccountModule::updateOrCreate(
            ['account_id' => $this->account->id, 'module_key' => 'ai'],
            ['enabled' => true]
        );
    }

    public function test_owner_can_open_ai_page_with_normalized_platform_ai_flags(): void
    {
        PlatformSetting::set('ai.enabled', '0', 'string', 'ai');
        PlatformSetting::set('ai.provider', 'openai', 'string', 'ai');

        $response = $this->actingAs($this->owner)
            ->withSession(['current_account_id' => $this->account->id])
            ->get(route('app.ai.index'));

        $response->assertStatus(200);
        $response->assertInertia(fn (Assert $page) => $page
            ->component('Ai/Index')
            ->where('platform_ai_enabled', false)
            ->where('platform_ai_provider', 'openai')
        );
    }

    public function test_chat_agent_member_can_access_ai_page(): void
    {
        $member = User::factory()->create();
        $this->account->users()->attach($member->id, ['role' => 'member']);

        $response = $this->actingAs($member)
            ->withSession(['current_account_id' => $this->account->id])
            ->get(route('app.ai.index'));

        $response->assertStatus(200);
    }

    public function test_ai_suggest_endpoint_respects_platform_toggle_even_with_string_zero_setting(): void
    {
        PlatformSetting::set('ai.enabled', '0', 'string', 'ai');

        $this->owner->update([
            'ai_suggestions_enabled' => true,
        ]);

        $connection = WhatsAppConnection::factory()->create([
            'account_id' => $this->account->id,
            'is_active' => true,
        ]);

        $contact = WhatsAppContact::factory()->create([
            'account_id' => $this->account->id,
        ]);

        $conversation = WhatsAppConversation::factory()->create([
            'account_id' => $this->account->id,
            'whatsapp_connection_id' => $connection->id,
            'whatsapp_contact_id' => $contact->id,
        ]);

        $response = $this->actingAs($this->owner)
            ->withSession(['current_account_id' => $this->account->id])
            ->post(route('app.whatsapp.conversations.ai-suggest', [
                'conversation' => $conversation->id,
            ]));

        $response
            ->assertStatus(403)
            ->assertJson([
                'error' => 'AI is disabled in platform settings.',
            ]);
    }
}
