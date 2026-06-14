<?php

namespace Tests\Feature\Billing;

use App\Models\Account;
use App\Models\AccountIntegration;
use App\Services\RazorpayPaymentLinkService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Http;
use Tests\TestCase;

class RazorpayPaymentLinkServiceTest extends TestCase
{
    use RefreshDatabase;

    public function test_invalid_customer_email_is_not_sent_to_razorpay(): void
    {
        $account = Account::factory()->create();
        AccountIntegration::create([
            'account_id' => $account->id,
            'provider' => 'razorpay-payments',
            'status' => 'connected',
            'config' => [
                'key_id' => 'rzp_test_123',
                'key_secret' => AccountIntegration::encryptedSecret('secret_123'),
                'currency' => 'INR',
            ],
        ]);

        Http::fake([
            'https://api.razorpay.com/v1/payment_links' => Http::response([
                'id' => 'plink_test',
                'short_url' => 'https://rzp.io/i/test',
            ]),
        ]);

        app(RazorpayPaymentLinkService::class)->createForAccount($account, [
            'amount' => 49900,
            'currency' => 'INR',
            'customer_name' => 'Test Customer',
            'customer_phone' => '+91 99999 99999',
            'customer_email' => 'not-a-real-email',
        ]);

        Http::assertSent(function ($request) {
            $payload = $request->data();

            return $request->url() === 'https://api.razorpay.com/v1/payment_links'
                && ! array_key_exists('email', $payload['customer'] ?? []);
        });
    }
}
