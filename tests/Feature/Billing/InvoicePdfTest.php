<?php

namespace Tests\Feature\Billing;

use App\Models\PaymentOrder;
use App\Models\Plan;
use App\Models\PlatformSetting;
use App\Services\InvoicePdfService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class InvoicePdfTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        $this->artisan('db:seed', ['--class' => 'ModuleSeeder']);
        $this->artisan('db:seed', ['--class' => 'PlanSeeder']);
    }

    public function test_invoice_pdf_service_renders_non_empty_pdf_from_payment_order_snapshot(): void
    {
        $account = $this->createAccountWithPlan('starter');
        $plan = Plan::where('key', 'pro')->firstOrFail();

        PlatformSetting::set('branding.platform_name', 'Zyptos', 'string', 'branding');
        PlatformSetting::set('branding.primary_color', '#16a34a', 'string', 'branding');

        $order = $this->createPaidOrder($account->id, $plan->id, $account->owner_id);

        $pdf = app(InvoicePdfService::class)->render($order->fresh(['account.owner', 'plan']));

        $this->assertStringStartsWith('%PDF', $pdf);
        $this->assertGreaterThan(1000, strlen($pdf));
    }

    public function test_invoice_download_route_returns_pdf_response(): void
    {
        $account = $this->createAccountWithPlan('starter');
        $owner = $this->actingAsAccountOwner($account);
        $plan = Plan::where('key', 'pro')->firstOrFail();
        $order = $this->createPaidOrder($account->id, $plan->id, $owner->id);

        $response = $this->get(route('app.billing.invoices.download', ['paymentOrder' => $order]));

        $response->assertOk();
        $this->assertSame('application/pdf', $response->headers->get('Content-Type'));
        $this->assertStringContainsString('filename="ZY-TEST-001.pdf"', $response->headers->get('Content-Disposition'));
        $this->assertStringStartsWith('%PDF', $response->getContent());
    }

    private function createPaidOrder(int $accountId, int $planId, int $ownerId): PaymentOrder
    {
        return PaymentOrder::create([
            'account_id' => $accountId,
            'plan_id' => $planId,
            'provider' => 'manual',
            'payment_method' => 'upi',
            'provider_order_id' => 'order_test_invoice',
            'provider_payment_id' => 'pay_test_invoice',
            'invoice_number' => 'ZY-TEST-001',
            'amount' => 105020,
            'currency' => 'INR',
            'base_amount' => 99900,
            'discount_code' => 'LAUNCH',
            'discount_amount' => 10000,
            'taxable_amount' => 89900,
            'tax_amount' => 16182,
            'tax_rate' => 18,
            'cgst_amount' => 8091,
            'sgst_amount' => 8091,
            'igst_amount' => 0,
            'tax_snapshot' => [
                'supplier_legal_name' => 'Zyptos',
                'supplier_gstin' => '29ABCDE1234F1Z5',
                'supplier_address' => 'Bengaluru, Karnataka',
                'supplier_state_code' => '29',
                'customer_billing_name' => 'Demo Workspace',
                'customer_gstin' => '29ABCDE1234F2Z4',
                'customer_address' => 'Mysuru, Karnataka',
                'customer_state_code' => '29',
                'sac_code' => '998314',
                'tax_type' => 'intra_state',
            ],
            'status' => 'paid',
            'metadata' => [
                'billing_cycle' => 'monthly',
                'discount' => ['code' => 'LAUNCH', 'name' => 'Launch offer'],
            ],
            'created_by' => $ownerId,
            'paid_at' => now(),
        ]);
    }
}
