<?php

namespace Tests\Feature\Billing;

use App\Core\Billing\SubscriptionService;
use App\Models\BillingEvent;
use App\Models\Plan;
use App\Models\Account;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class TrialEligibilityTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->artisan('db:seed', ['--class' => 'ModuleSeeder']);
        $this->artisan('db:seed', ['--class' => 'PlanSeeder']);
    }

    public function test_fresh_account_can_use_trial_when_plan_supports_it(): void
    {
        $account = Account::factory()->create();
        $plan = Plan::where('key', 'starter')->firstOrFail();

        $this->assertTrue(app(SubscriptionService::class)->accountCanUseTrial($account, $plan));
    }

    public function test_prior_trial_started_blocks_trial_reuse(): void
    {
        $account = Account::factory()->create();
        $plan = Plan::where('key', 'starter')->firstOrFail();

        BillingEvent::create([
            'account_id' => $account->id,
            'type' => 'trial_started',
            'data' => ['plan_key' => $plan->key],
        ]);

        $this->assertFalse(app(SubscriptionService::class)->accountCanUseTrial($account, $plan));
    }

    public function test_non_trial_subscription_history_blocks_trial_reuse(): void
    {
        $account = $this->createAccountWithPlan('starter');
        $plan = Plan::where('key', 'pro')->firstOrFail();

        $this->assertFalse(app(SubscriptionService::class)->accountCanUseTrial($account, $plan));
    }

    public function test_canceled_or_past_due_non_trial_subscription_history_blocks_trial_reuse(): void
    {
        $account = $this->createAccountWithPlan('starter');
        $service = app(SubscriptionService::class);
        $service->markPastDue($account, 'Card declined');
        $service->cancelAtPeriodEnd($account, null, true);

        $plan = Plan::where('key', 'pro')->firstOrFail();

        $this->assertFalse($service->accountCanUseTrial($account->fresh(), $plan));
    }

    public function test_billing_plans_hide_trial_for_accounts_with_non_trial_history(): void
    {
        $account = $this->createAccountWithPlan('starter');
        $this->actingAsAccountOwner($account);

        $response = $this->get(route('app.billing.plans', ['account' => $account->slug]));

        $response->assertOk();
        $response->assertInertia(fn (Assert $page) => $page
            ->component('Billing/Plans')
            ->has('plans', fn (Assert $plans) => $plans
                ->where('0.trial_available', false)
                ->where('1.trial_available', false)
                ->where('2.trial_available', false)
                ->etc()
            )
        );
    }

    public function test_billing_plans_show_trial_for_fresh_account_without_subscription_history(): void
    {
        $account = Account::factory()->create();
        $this->actingAsAccountOwner($account);

        $response = $this->get(route('app.billing.plans', ['account' => $account->slug]));

        $response->assertOk();
        $response->assertInertia(fn (Assert $page) => $page
            ->component('Billing/Plans')
            ->has('plans', fn (Assert $plans) => $plans
                ->where('1.key', 'starter')
                ->where('1.trial_available', true)
                ->where('2.key', 'pro')
                ->where('2.trial_available', true)
                ->etc()
            )
        );
    }
}
