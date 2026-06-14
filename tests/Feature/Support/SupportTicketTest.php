<?php

namespace Tests\Feature\Support;

use App\Models\Plan;
use App\Models\User;
use App\Modules\Support\Models\SupportThread;
use App\Notifications\SupportTicketCreated;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Notification;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class SupportTicketTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        if (Plan::count() === 0) {
            $this->artisan('db:seed', ['--class' => 'PlanSeeder']);
        }
    }

    public function test_account_owner_can_create_ticket_with_tags_and_category(): void
    {
        Notification::fake();

        $account = $this->createAccountWithPlan('starter');
        $owner = $this->actingAsAccountOwner($account);

        $admin = User::factory()->create([
            'is_platform_admin' => true,
        ]);

        $response = $this->post(route('app.support.store', [
            'account' => $account->slug,
        ]), [
            'subject' => 'Webhook failure',
            'message' => 'We are seeing 403 on callbacks.',
            'category' => 'WhatsApp',
            'tags' => 'webhook, urgent',
        ]);

        $response->assertRedirect();

        $thread = SupportThread::where('account_id', $account->id)->first();
        $this->assertNotNull($thread);
        $this->assertSame('WhatsApp', $thread->category);
        $this->assertSame(['webhook', 'urgent'], $thread->tags);
        $this->assertSame($owner->id, $thread->created_by);

        Notification::assertSentTo($admin, SupportTicketCreated::class);
    }

    public function test_platform_support_index_paginates_and_loads_selected_ticket_drawer_data(): void
    {
        $account = $this->createAccountWithPlan('starter');
        $admin = User::factory()->create(['is_platform_admin' => true]);

        $thread = SupportThread::create([
            'account_id' => $account->id,
            'created_by' => $account->owner_id,
            'subject' => 'Billing question',
            'status' => 'open',
            'priority' => 'normal',
            'category' => 'Billing',
            'tags' => ['billing'],
            'last_message_at' => now(),
        ]);

        $response = $this->actingAs($admin)->get(route('platform.support.index', [
            'ticket' => $thread->fresh()->slug,
            'per_page' => 10,
        ]));

        $response->assertOk();
        $response->assertInertia(fn (Assert $page) => $page
            ->component('Platform/Support/Index')
            ->where('threads.per_page', 10)
            ->where('selectedThread.id', $thread->id)
            ->has('messages')
            ->has('admins'));
    }

    public function test_platform_support_show_route_redirects_to_drawer_index(): void
    {
        $account = $this->createAccountWithPlan('starter');
        $admin = User::factory()->create(['is_platform_admin' => true]);
        $thread = SupportThread::create([
            'account_id' => $account->id,
            'created_by' => $account->owner_id,
            'subject' => 'Legacy route',
            'status' => 'open',
        ])->fresh();

        $response = $this->actingAs($admin)->get(route('platform.support.show', ['thread' => $thread->slug]));

        $response->assertRedirect(route('platform.support.index', ['ticket' => $thread->slug]));
    }
}
