<?php

namespace Tests\Feature\Billing;

use App\Core\Billing\BillingProviderManager;
use App\Core\Billing\SubscriptionService;
use App\Models\Account;
use App\Models\PaymentOrder;
use App\Models\Plan;
use App\Models\PlatformSetting;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class RazorpayBillingSafetyTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->artisan('db:seed', ['--class' => 'ModuleSeeder']);
        $this->artisan('db:seed', ['--class' => 'PlanSeeder']);
    }

    public function test_razorpay_provider_treats_string_zero_as_disabled(): void
    {
        PlatformSetting::set('payment.razorpay_enabled', '0', 'string', 'payment');
        PlatformSetting::set('payment.razorpay_key_id', 'rzp_test_123', 'string', 'payment');
        PlatformSetting::set('payment.razorpay_key_secret', 'secret_123', 'string', 'payment');

        $provider = app(BillingProviderManager::class)->get('razorpay');

        $this->assertNotNull($provider);
        $this->assertFalse($provider->isEnabled());
    }

    public function test_confirm_payment_rejects_order_from_another_account(): void
    {
        $owner = User::factory()->create();

        $accountA = Account::factory()->create(['owner_id' => $owner->id]);
        $accountA->users()->attach($owner->id, ['role' => 'owner']);

        $accountB = Account::factory()->create(['owner_id' => $owner->id]);
        $accountB->users()->attach($owner->id, ['role' => 'owner']);

        $free = Plan::where('key', 'free')->firstOrFail();
        $subscriptionService = app(SubscriptionService::class);
        $subscriptionService->changePlan($accountA, $free, $owner);
        $subscriptionService->changePlan($accountB, $free, $owner);

        PlatformSetting::set('payment.razorpay_enabled', true, 'boolean', 'payment');
        PlatformSetting::set('payment.razorpay_key_id', 'rzp_test_123', 'string', 'payment');
        PlatformSetting::set('payment.razorpay_key_secret', 'secret_123', 'string', 'payment');

        $orderId = 'order_test_123';
        $paymentId = 'pay_test_456';
        $signature = hash_hmac('sha256', $orderId.'|'.$paymentId, 'secret_123');

        PaymentOrder::create([
            'account_id' => $accountA->id,
            'plan_id' => $free->id,
            'provider' => 'razorpay',
            'provider_order_id' => $orderId,
            'amount' => 0,
            'currency' => 'INR',
            'status' => 'created',
            'created_by' => $owner->id,
        ]);

        $response = $this->actingAs($owner)
            ->withSession(['current_account_id' => $accountB->id])
            ->post(route('app.billing.razorpay.confirm'), [
                'order_id' => $orderId,
                'payment_id' => $paymentId,
                'signature' => $signature,
            ]);

        $response->assertStatus(403);

        $this->assertDatabaseHas('payment_orders', [
            'provider_order_id' => $orderId,
            'status' => 'created',
        ]);
    }
}
