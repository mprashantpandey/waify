<?php

namespace Tests\Feature\Billing;

use App\Core\Billing\DiscountService;
use App\Models\Account;
use App\Models\BillingDiscount;
use App\Models\PaymentOrder;
use App\Models\Plan;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class DiscountEligibilityTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->artisan('db:seed', ['--class' => 'ModuleSeeder']);
        $this->artisan('db:seed', ['--class' => 'PlanSeeder']);
    }

    public function test_new_customer_discount_applies_before_first_paid_order(): void
    {
        $plan = Plan::where('key', 'starter')->firstOrFail();
        $account = Account::factory()->create();
        BillingDiscount::create([
            'code' => 'WELCOME20',
            'name' => 'Welcome offer',
            'discount_type' => 'percent',
            'percent_off' => 20,
            'currency' => 'INR',
            'duration' => 'once',
            'is_active' => true,
            'metadata' => ['new_user_only' => true],
        ]);

        $preview = app(DiscountService::class)->preview('welcome20', $plan, 100000, 'INR', $account);

        $this->assertSame('WELCOME20', $preview['code']);
        $this->assertSame(20000, $preview['amount_off_minor']);
        $this->assertTrue($preview['new_user_only']);
    }

    public function test_new_customer_discount_is_rejected_after_paid_order_for_same_owner_email(): void
    {
        $plan = Plan::where('key', 'starter')->firstOrFail();
        $user = User::factory()->create(['email' => 'paid-owner@example.com']);
        $firstAccount = Account::factory()->create(['owner_id' => $user->id]);
        $secondAccount = Account::factory()->create(['owner_id' => $user->id]);
        BillingDiscount::create([
            'code' => 'WELCOME20',
            'name' => 'Welcome offer',
            'discount_type' => 'percent',
            'percent_off' => 20,
            'currency' => 'INR',
            'duration' => 'once',
            'is_active' => true,
            'metadata' => ['new_user_only' => true],
        ]);
        PaymentOrder::create([
            'account_id' => $firstAccount->id,
            'plan_id' => $plan->id,
            'provider' => 'zyptos',
            'payment_method' => 'bank',
            'provider_order_id' => 'test-paid-order',
            'amount' => 100000,
            'currency' => 'INR',
            'status' => 'paid',
            'created_by' => $user->id,
            'paid_at' => now(),
        ]);

        $preview = app(DiscountService::class)->preview('WELCOME20', $plan, 100000, 'INR', $secondAccount);

        $this->assertNull($preview);
    }
}
