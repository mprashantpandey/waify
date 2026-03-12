<?php

namespace Tests\Unit\Billing;

use App\Core\Billing\SubscriptionAccessService;
use App\Models\Account;
use App\Models\Subscription;
use Carbon\Carbon;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class SubscriptionAccessServiceTest extends TestCase
{
    use RefreshDatabase;

    protected SubscriptionAccessService $service;

    protected function setUp(): void
    {
        parent::setUp();
        $this->service = app(SubscriptionAccessService::class);
    }

    public function test_evaluate_returns_no_subscription_state(): void
    {
        $account = Account::factory()->create();
        $result = $this->service->evaluate($account, null);

        $this->assertSame('no_subscription', $result['state']);
        $this->assertTrue($result['blocked']);
        $this->assertFalse($result['can_access_modules']);
        $this->assertContains('choose_plan', $result['recovery_actions']);
    }

    public function test_trial_active_is_not_blocked(): void
    {
        Carbon::setTestNow('2026-03-12 12:00:00');
        $account = Account::factory()->create();
        $subscription = Subscription::factory()->create([
            'account_id' => $account->id,
            'status' => 'trialing',
            'trial_ends_at' => now()->addDays(3),
        ]);

        $result = $this->service->evaluate($account, $subscription);
        $this->assertSame('trial_active', $result['state']);
        $this->assertFalse($result['blocked']);
        $this->assertTrue($result['can_access_modules']);
    }

    public function test_trial_expired_is_blocked(): void
    {
        Carbon::setTestNow('2026-03-12 12:00:00');
        $account = Account::factory()->create();
        $subscription = Subscription::factory()->create([
            'account_id' => $account->id,
            'status' => 'trialing',
            'trial_ends_at' => now()->subDay(),
        ]);

        $result = $this->service->evaluate($account, $subscription);
        $this->assertSame('trial_expired', $result['state']);
        $this->assertTrue($result['blocked']);
    }

    public function test_canceled_with_future_period_end_is_grace_state(): void
    {
        Carbon::setTestNow('2026-03-12 12:00:00');
        $account = Account::factory()->create();
        $subscription = Subscription::factory()->create([
            'account_id' => $account->id,
            'status' => 'canceled',
            'current_period_end' => now()->addDays(2),
        ]);

        $result = $this->service->evaluate($account, $subscription);
        $this->assertSame('canceled_grace', $result['state']);
        $this->assertFalse($result['blocked']);
        $this->assertTrue($result['can_access_modules']);
    }

    public function test_past_due_is_blocked(): void
    {
        $account = Account::factory()->create();
        $subscription = Subscription::factory()->create([
            'account_id' => $account->id,
            'status' => 'past_due',
            'last_error' => 'Payment failed',
        ]);

        $result = $this->service->evaluate($account, $subscription);
        $this->assertSame('past_due', $result['state']);
        $this->assertTrue($result['blocked']);
        $this->assertSame('Payment failed', $result['reason']);
        $this->assertContains('renew_now', $result['recovery_actions']);
    }

    public function test_route_allowlist_for_blocked_accounts(): void
    {
        $this->assertTrue($this->service->routeAllowedWhenBlocked('app.billing.index'));
        $this->assertTrue($this->service->routeAllowedWhenBlocked('app.settings'));
        $this->assertTrue($this->service->routeAllowedWhenBlocked('app.support.index'));
        $this->assertTrue($this->service->routeAllowedWhenBlocked('onboarding.store'));
        $this->assertFalse($this->service->routeAllowedWhenBlocked('app.dashboard'));
    }
}
