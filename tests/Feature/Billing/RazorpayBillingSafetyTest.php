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
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Mail;
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

        $free = Plan::where('key', 'starter')->firstOrFail();
        $subscriptionService = app(SubscriptionService::class);
        $subscriptionService->changePlan($accountA, $free, $owner);
        $subscriptionService->changePlan($accountB, $free, $owner);

        PlatformSetting::set('payment.razorpay_enabled', true, 'boolean', 'payment');
        PlatformSetting::set('payment.default_currency', 'INR', 'string', 'payment');
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

    public function test_paid_plan_checkout_creates_one_time_order_and_confirm_activates_local_plan(): void
    {
        Mail::fake();
        $account = $this->createAccountWithPlan('starter');
        $owner = $this->actingAsAccountOwner($account);
        $starter = Plan::where('key', 'pro')->firstOrFail();

        PlatformSetting::set('payment.razorpay_enabled', true, 'boolean', 'payment');
        PlatformSetting::set('payment.default_currency', 'INR', 'string', 'payment');
        PlatformSetting::set('payment.razorpay_key_id', 'rzp_test_123', 'string', 'payment');
        PlatformSetting::set('payment.razorpay_key_secret', 'secret_123', 'string', 'payment');

        Http::fake([
            'https://api.razorpay.com/v1/orders' => Http::response([
                'id' => 'order_test_123',
                'entity' => 'order',
                'amount' => 9900,
                'currency' => 'INR',
                'status' => 'created',
            ], 200),
        ]);

        $response = $this->postJson(route('app.billing.razorpay.order', [
            'account' => $account->slug,
            'plan' => $starter->key,
        ]));

        $response->assertOk()
            ->assertJsonPath('order_id', 'order_test_123');

        $this->assertDatabaseMissing('subscriptions', [
            'account_id' => $account->id,
            'plan_id' => $starter->id,
            'provider' => 'razorpay',
            'provider_ref' => 'order_test_123',
        ]);

        $this->assertDatabaseHas('payment_orders', [
            'account_id' => $account->id,
            'plan_id' => $starter->id,
            'provider_order_id' => 'order_test_123',
            'created_by' => $owner->id,
            'status' => 'created',
        ]);

        $paymentId = 'pay_test_123';
        $signature = hash_hmac('sha256', 'order_test_123|'.$paymentId, 'secret_123');

        $confirm = $this->postJson(route('app.billing.razorpay.confirm'), [
            'order_id' => 'order_test_123',
            'payment_id' => $paymentId,
            'signature' => $signature,
        ]);

        $confirm->assertOk();

        $this->assertDatabaseHas('subscriptions', [
            'account_id' => $account->id,
            'plan_id' => $starter->id,
            'provider' => 'manual',
            'provider_ref' => $paymentId,
            'status' => 'active',
        ]);
    }

    public function test_payment_captured_webhook_activates_subscription(): void
    {
        Mail::fake();
        $account = $this->createAccountWithPlan('starter');
        $starter = Plan::where('key', 'starter')->firstOrFail();

        PlatformSetting::set('payment.razorpay_enabled', true, 'boolean', 'payment');
        PlatformSetting::set('payment.razorpay_key_id', 'rzp_test_123', 'string', 'payment');
        PlatformSetting::set('payment.razorpay_key_secret', 'secret_123', 'string', 'payment');
        PlatformSetting::set('payment.razorpay_webhook_secret', 'webhook_secret', 'string', 'payment');

        PaymentOrder::create([
            'account_id' => $account->id,
            'plan_id' => $starter->id,
            'provider' => 'razorpay',
            'provider_order_id' => 'order_test_123',
            'amount' => 9900,
            'currency' => 'INR',
            'status' => 'created',
            'created_by' => $account->owner_id,
            'metadata' => ['billing_cycle' => 'monthly'],
        ]);

        $payload = [
            'event' => 'payment.captured',
            'payload' => [
                'payment' => [
                    'entity' => [
                        'id' => 'pay_test_123',
                        'order_id' => 'order_test_123',
                    ],
                ],
            ],
        ];

        $body = json_encode($payload);
        $signature = hash_hmac('sha256', $body, 'webhook_secret');

        $response = $this->call('POST', '/webhooks/razorpay', [], [], [], [
            'HTTP_X_RAZORPAY_SIGNATURE' => $signature,
            'HTTP_X_RAZORPAY_EVENT_ID' => 'evt_test_123',
            'CONTENT_TYPE' => 'application/json',
            'HTTP_ACCEPT' => 'application/json',
        ], $body);

        $response->assertOk();

        $subscription = $account->fresh()->subscription;
        $this->assertEquals('active', $subscription->status);
        $this->assertEquals('manual', $subscription->provider);
        $this->assertEquals('pay_test_123', $subscription->provider_ref);
        $this->assertNotNull($subscription->last_payment_at);
        $this->assertTrue($subscription->current_period_end->isFuture());
    }

    public function test_razorpay_webhook_blocked_when_gateway_disabled(): void
    {
        PlatformSetting::set('payment.razorpay_enabled', false, 'boolean', 'payment');
        PlatformSetting::set('payment.razorpay_webhook_secret', 'webhook_secret', 'string', 'payment');

        $payload = [
            'event' => 'payment.captured',
            'payload' => [
                'payment' => [
                    'entity' => [
                        'id' => 'pay_blocked_123',
                        'order_id' => 'order_blocked_123',
                    ],
                ],
            ],
        ];

        $body = json_encode($payload);
        $signature = hash_hmac('sha256', $body, 'webhook_secret');

        $response = $this->call('POST', '/webhooks/razorpay', [], [], [], [
            'HTTP_X_RAZORPAY_SIGNATURE' => $signature,
            'HTTP_X_RAZORPAY_EVENT_ID' => 'evt_blocked_123',
            'CONTENT_TYPE' => 'application/json',
            'HTTP_ACCEPT' => 'application/json',
        ], $body);

        $response->assertStatus(503)
            ->assertJson([
                'success' => false,
                'message' => 'Razorpay webhooks are currently disabled.',
            ]);
    }

    public function test_razorpay_webhook_blocked_when_gateway_string_zero(): void
    {
        PlatformSetting::set('payment.razorpay_enabled', '0', 'string', 'payment');

        $response = $this->call('POST', '/webhooks/razorpay', [], [], [], [
            'CONTENT_TYPE' => 'application/json',
            'HTTP_ACCEPT' => 'application/json',
        ], '{"event":"payment.captured"}');

        $response->assertStatus(503)
            ->assertJsonPath('message', 'Razorpay webhooks are currently disabled.');
    }

    public function test_owner_can_preview_yearly_billing_cycle_before_checkout(): void
    {
        $account = $this->createAccountWithPlan('starter');
        $this->actingAsAccountOwner($account);
        $starter = Plan::where('key', 'starter')->firstOrFail();
        $starter->forceFill([
            'price_monthly' => 9900,
            'price_yearly' => 99000,
        ])->save();

        PlatformSetting::set('payment.default_currency', 'INR', 'string', 'payment');

        $response = $this->postJson(route('app.billing.preview', [
            'plan' => $starter->key,
        ]), [
            'billing_cycle' => 'yearly',
        ]);

        $response->assertOk()
            ->assertJsonPath('billing_cycle', 'yearly')
            ->assertJsonPath('base_amount', 99000)
            ->assertJsonPath('amount_due', 99000);
    }

    public function test_cancel_subscription_marks_local_period_end_without_razorpay_subscription_api(): void
    {
        $account = $this->createAccountWithPlan('starter');
        $this->actingAsAccountOwner($account);
        $subscription = $account->subscription;
        $subscription->update([
            'provider' => 'razorpay',
            'provider_ref' => 'sub_test_123',
            'provider_status' => 'active',
            'status' => 'active',
        ]);

        PlatformSetting::set('payment.razorpay_enabled', true, 'boolean', 'payment');
        PlatformSetting::set('payment.razorpay_key_id', 'rzp_test_123', 'string', 'payment');
        PlatformSetting::set('payment.razorpay_key_secret', 'secret_123', 'string', 'payment');

        Http::fake();

        $response = $this->post(route('app.billing.cancel'));

        $response->assertRedirect();
        Http::assertNothingSent();

        $subscription->refresh();
        $this->assertTrue((bool) $subscription->cancel_at_period_end);
    }
}
