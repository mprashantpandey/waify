<?php

namespace App\Http\Controllers\Billing;

use App\Core\Billing\BillingProviderManager;
use App\Http\Controllers\Controller;
use App\Models\PaymentOrder;
use App\Services\BillingEmailService;
use App\Services\SelfHostedBillingService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;

class RazorpayWebhookController extends Controller
{
    public function __construct(
        protected BillingProviderManager $providerManager,
        protected SelfHostedBillingService $selfHostedBilling,
        protected BillingEmailService $billingEmail
    ) {
        // Disable CSRF for webhooks
        $this->middleware(\Illuminate\Foundation\Http\Middleware\ValidateCsrfToken::class)->except(['handle']);
    }

    public function handle(Request $request)
    {
        $provider = $this->providerManager->get('razorpay');
        if (! $provider || ! $provider->isEnabled() || ! method_exists($provider, 'getWebhookSecret')) {
            return response()->json(['success' => false, 'error' => 'Razorpay not configured'], 400);
        }

        $signature = $request->header('X-Razorpay-Signature');
        $secret = $provider->getWebhookSecret();
        $payload = $request->getContent();
        $expected = hash_hmac('sha256', $payload, $secret);

        if (! $signature || ! hash_equals($expected, $signature)) {
            Log::channel('stack')->warning('Razorpay webhook signature invalid');

            return response()->json(['success' => false, 'error' => 'Invalid signature'], 401);
        }

        $data = $request->json()->all();
        $event = $data['event'] ?? null;
        $eventId = $request->header('X-Razorpay-Event-Id');
        $entityId = $data['payload']['order']['entity']['id']
            ?? $data['payload']['payment']['entity']['id']
            ?? sha1($payload);
        $idempotencyKey = 'razorpay_webhook:'.($eventId ?: (($event ?? 'unknown').':'.$entityId));
        if (! Cache::add($idempotencyKey, true, now()->addDays(7))) {
            return response()->json(['success' => true]);
        }

        $provider->handleWebhook($data);

        if ($event === 'payment.captured' || $event === 'order.paid') {
            $orderId = $data['payload']['order']['entity']['id'] ?? $data['payload']['payment']['entity']['order_id'] ?? null;
            $paymentId = $data['payload']['payment']['entity']['id'] ?? null;

            if ($orderId) {
                $paymentOrder = PaymentOrder::where('provider', 'razorpay')
                    ->where('provider_order_id', $orderId)
                    ->first();

                if ($paymentOrder) {
                    if ($paymentOrder->status !== 'paid') {
                        $paymentOrder->update([
                            'status' => 'paid',
                            'provider_payment_id' => $paymentId ?: $paymentOrder->provider_payment_id,
                            'paid_at' => $paymentOrder->paid_at ?: now(),
                        ]);
                    }

                    $this->selfHostedBilling->recordOrderEvent($paymentOrder, 'razorpay_webhook_paid', 'Razorpay webhook marked payment paid', $paymentOrder->account?->owner, [
                        'event' => $event,
                        'payment_id' => $paymentId,
                    ]);

                    $account = $paymentOrder->account;
                    if ($account && $paymentOrder->plan) {
                        try {
                            $this->selfHostedBilling->activateSubscription($paymentOrder->fresh(['account', 'plan']), $account->owner);
                            $this->billingEmail->paymentReceived($paymentOrder->fresh(['account.owner', 'plan']));
                        } catch (\Throwable $e) {
                            Log::channel('stack')->error('Razorpay webhook plan activation failed', [
                                'order_id' => $orderId,
                                'error' => $e->getMessage()]);
                        }
                    }
                }
            }
        }

        return response()->json(['success' => true]);
    }
}
