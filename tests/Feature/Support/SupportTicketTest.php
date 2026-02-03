<?php

namespace Tests\Feature\Support;

use App\Models\Plan;
use App\Models\User;
use App\Modules\Support\Models\SupportThread;
use App\Notifications\SupportTicketCreated;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Notification;
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

        $account = $this->createAccountWithPlan('free');
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
}
