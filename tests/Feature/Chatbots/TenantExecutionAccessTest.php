<?php

namespace Tests\Feature\Chatbots;

use App\Core\Billing\SubscriptionService;
use App\Models\Account;
use App\Models\Plan;
use App\Models\User;
use App\Modules\Chatbots\Models\Bot;
use App\Modules\Chatbots\Models\BotExecution;
use App\Modules\Chatbots\Models\BotFlow;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class TenantExecutionAccessTest extends TestCase
{
    use RefreshDatabase;

    public function test_tenant_user_cannot_open_chatbot_execution_pages(): void
    {
        [$owner, $account, $execution] = $this->createExecutionFixture();

        $this->actingAs($owner)
            ->withSession(['current_account_id' => $account->id])
            ->get(route('app.chatbots.executions.index'))
            ->assertForbidden();

        $this->actingAs($owner)
            ->withSession(['current_account_id' => $account->id])
            ->get(route('app.chatbots.executions.show', $execution))
            ->assertForbidden();
    }

    public function test_platform_support_can_open_chatbot_execution_pages_while_impersonating(): void
    {
        [$owner, $account, $execution] = $this->createExecutionFixture();

        $session = [
            'current_account_id' => $account->id,
            'impersonator_id' => 999,
            'impersonator_is_super_admin' => true,
        ];

        $this->actingAs($owner)
            ->withSession($session)
            ->get(route('app.chatbots.executions.index'))
            ->assertOk();

        $this->actingAs($owner)
            ->withSession($session)
            ->get(route('app.chatbots.executions.show', $execution))
            ->assertOk();
    }

    /**
     * @return array{0: User, 1: Account, 2: BotExecution}
     */
    private function createExecutionFixture(): array
    {
        $owner = User::factory()->create();
        $account = Account::factory()->create(['owner_id' => $owner->id]);
        $account->users()->attach($owner->id, ['role' => 'owner']);

        $this->artisan('db:seed', ['--class' => 'ModuleSeeder']);
        $this->artisan('db:seed', ['--class' => 'PlanSeeder']);
        $pro = Plan::where('key', 'pro')->firstOrFail();
        app(SubscriptionService::class)->changePlan($account, $pro, $owner);

        $bot = Bot::create([
            'account_id' => $account->id,
            'name' => 'Welcome Bot',
            'status' => 'active',
            'created_by' => $owner->id,
            'updated_by' => $owner->id,
        ]);

        $flow = BotFlow::create([
            'account_id' => $account->id,
            'bot_id' => $bot->id,
            'name' => 'Default Flow',
            'trigger' => ['type' => 'message_received'],
            'enabled' => true,
            'priority' => 1,
        ]);

        $execution = BotExecution::create([
            'account_id' => $account->id,
            'bot_id' => $bot->id,
            'bot_flow_id' => $flow->id,
            'status' => 'success',
            'trigger_event_id' => 'evt_123',
            'started_at' => now()->subSecond(),
            'finished_at' => now(),
            'logs' => [['message' => 'Execution completed']],
        ]);

        return [$owner, $account, $execution];
    }
}
