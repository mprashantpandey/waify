<?php

namespace Tests\Feature\Billing;

use App\Models\PaymentOrder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class BillingOverviewTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        $this->artisan('db:seed', ['--class' => 'ModuleSeeder']);
        $this->artisan('db:seed', ['--class' => 'PlanSeeder']);
    }

    public function test_billing_overview_exposes_latest_paid_and_failed_payments_separately(): void
    {
        $account = $this->createAccountWithPlan('starter');
        $this->actingAsAccountOwner($account);

        PaymentOrder::create([
            'account_id' => $account->id,
            'plan_id' => $account->subscription?->plan_id,
            'provider' => 'razorpay',
            'provider_order_id' => 'ord_failed',
            'amount' => 499900,
            'currency' => 'INR',
            'status' => 'failed',
            'created_by' => $account->owner_id,
            'failed_at' => now()->subHour(),
            'created_at' => now()->subHour(),
            'updated_at' => now()->subHour(),
        ]);

        $paid = PaymentOrder::create([
            'account_id' => $account->id,
            'plan_id' => $account->subscription?->plan_id,
            'provider' => 'razorpay',
            'provider_order_id' => 'ord_paid',
            'provider_payment_id' => 'pay_paid',
            'amount' => 499900,
            'currency' => 'INR',
            'status' => 'paid',
            'created_by' => $account->owner_id,
            'paid_at' => now()->subDays(2),
            'created_at' => now()->subDays(2),
            'updated_at' => now()->subDays(2),
        ]);

        $response = $this->get(route('app.billing.index', ['account' => $account->slug]));

        $response->assertOk();
        $response->assertInertia(fn (Assert $page) => $page
            ->component('Billing/Index')
            ->where('latest_failed_payment.status', 'failed')
            ->where('latest_paid_payment.id', $paid->id)
            ->where('latest_paid_payment.status', 'paid')
        );
    }

    public function test_failed_payment_details_page_remains_accessible_for_recovery(): void
    {
        $account = $this->createAccountWithPlan('starter');
        $this->actingAsAccountOwner($account);

        $payment = PaymentOrder::create([
            'account_id' => $account->id,
            'plan_id' => $account->subscription?->plan_id,
            'provider' => 'razorpay',
            'provider_order_id' => 'ord_failed_recovery',
            'amount' => 499900,
            'currency' => 'INR',
            'status' => 'failed',
            'created_by' => $account->owner_id,
            'failed_at' => now()->subMinutes(15),
        ]);

        $this->get(route('app.billing.history.show', [
            'account' => $account->slug,
            'paymentOrder' => $payment->id,
        ]))->assertOk();
    }
}
