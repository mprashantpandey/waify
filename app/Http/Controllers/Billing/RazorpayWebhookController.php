<?php

namespace App\Http\Controllers\Billing;

use App\Core\Billing\BillingProviderManager;
use App\Core\Billing\SubscriptionService;
use App\Http\Controllers\Controller;
use App\Models\PaymentOrder;
use App\Models\Plan;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class RazorpayWebhookController extends Controller
{
    public function __construct(
        protected BillingProviderManager $providerManager,
        protected SubscriptionService $subscriptionService
    ) {
        // Disable CSRF for webhooks
        $this->middleware(\Illuminate\Foundation\Http\Middleware\ValidateCsrfToken::class)->except(['handle']);
    }

    public function handle(Request $request)
    {
        $provider = $this->providerManager->get('razorpay');
        if (!$provider || !$provider->isEnabled() || !method_exists($provider, 'getWebhookSecret')) {
            return response()->json(['success' => false, 'error' => 'Razorpay not configured'], 400);
        }

        $signature = $request->header('X-Razorpay-Signature');
        $secret = $provider->getWebhookSecret();
        $payload = $request->getContent();
        $expected = hash_hmac('sha256', $payload, $secret);

        if (!$signature || !hash_equals($expected, $signature)) {
            Log::channel('stack')->warning('Razorpay webhook signature invalid');
            return response()->json(['success' => false, 'error' => 'Invalid signature'], 401);
        }

        $data = $request->json()->all();
        $provider->handleWebhook($data);

        $event = $data['event'] ?? null;
        if ($event === 'payment.captured' || $event === 'order.paid') {
            $orderId = $data['payload']['order']['entity']['id'] ?? $data['payload']['payment']['entity']['order_id'] ?? null;
            $paymentId = $data['payload']['payment']['entity']['id'] ?? null;

            if ($orderId) {
                $paymentOrder = PaymentOrder::where('provider', 'razorpay')
                    ->where('provider_order_id', $orderId)
                    ->first();

                if ($paymentOrder) {
                    $plan = Plan::find($paymentOrder->plan_id);
                    $workspace = $paymentOrder->workspace;
                    if ($plan && $workspace) {
                        try {
                            $this->subscriptionService->changePlan(
                                $workspace,
                                $plan,
                                $workspace->owner,
                                'razorpay',
                                [
                                    'payment_id' => $paymentId,
                                    'order_id' => $orderId,
                                    'paid_at' => now(),
                                ]
                            );
                        } catch (\Throwable $e) {
                            Log::channel('stack')->error('Razorpay webhook plan activation failed', [
                                'order_id' => $orderId,
                                'error' => $e->getMessage(),
                            ]);
                        }
                    }
                }
            }
        }

        return response()->json(['success' => true]);
    }
}
