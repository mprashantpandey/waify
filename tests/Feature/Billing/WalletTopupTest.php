<?php

namespace Tests\Feature\Billing;

use App\Models\PlatformSetting;
use App\Models\WalletTransaction;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class WalletTopupTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->artisan('db:seed', ['--class' => 'ModuleSeeder']);
        $this->artisan('db:seed', ['--class' => 'PlanSeeder']);
    }

    public function test_wallet_topup_requires_payment_gateway(): void
    {
        $account = $this->createAccountWithPlan('starter');
        $this->actingAsAccountOwner($account);

        PlatformSetting::set('payment.wallet_self_topup_enabled', true);
        PlatformSetting::set('payment.razorpay_enabled', false);

        $response = $this->post(route('app.billing.wallet.topup', ['account' => $account->slug]), [
            'amount_minor' => 1000,
            'notes' => 'test topup',
        ]);

        $response->assertStatus(422);
        $this->assertDatabaseCount('wallet_transactions', 0);
        $this->assertEquals(0, WalletTransaction::query()->count());
    }
}
