<?php

namespace Tests\Feature\Chatbots;

use App\Core\Billing\SubscriptionService;
use App\Models\Account;
use App\Models\Plan;
use App\Models\User;
use App\Modules\Chatbots\Models\Bot;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class BotManagementTest extends TestCase
{
    use RefreshDatabase;

    public function test_owner_can_pause_a_bot(): void
    {
        [$owner, $account, $bot] = $this->createBotFixture();

        $this->actingAs($owner)
            ->withSession(['current_account_id' => $account->id])
            ->patch(route('app.chatbots.update', $bot), [
                'name' => $bot->name,
                'description' => $bot->description,
                'status' => 'paused',
                'applies_to' => $bot->applies_to,
                'stop_on_first_flow' => true,
            ])
            ->assertRedirect();

        $this->assertSame('paused', $bot->fresh()->status);
    }

    public function test_owner_can_delete_a_bot_with_delete_route(): void
    {
        [$owner, $account, $bot] = $this->createBotFixture();

        $this->actingAs($owner)
            ->withSession(['current_account_id' => $account->id])
            ->delete(route('app.chatbots.destroy', $bot))
            ->assertRedirect(route('app.chatbots.index'));

        $this->assertDatabaseMissing('bots', [
            'id' => $bot->id,
        ]);
    }

    /**
     * @return array{0: User, 1: Account, 2: Bot}
     */
    private function createBotFixture(): array
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
            'name' => 'Support Bot',
            'description' => 'Handles first replies',
            'status' => 'active',
            'applies_to' => [
                'all_connections' => true,
                'connection_ids' => [],
            ],
            'stop_on_first_flow' => true,
            'created_by' => $owner->id,
            'updated_by' => $owner->id,
        ]);

        return [$owner, $account, $bot];
    }
}
