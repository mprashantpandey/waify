<?php

namespace App\Http\Controllers\Billing;

use App\Core\Billing\BillingProviderManager;
use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;

class RazorpayWebhookController extends Controller
{
    public function __construct(
        protected BillingProviderManager $providerManager
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
        $event = $data['event'] ?? null;
        $orderId = $data['payload']['order']['entity']['id'] ?? $data['payload']['payment']['entity']['order_id'] ?? null;
        $paymentId = $data['payload']['payment']['entity']['id'] ?? null;
        $deliveryId = $request->header('X-Razorpay-Event-Id') ?? null;

        if ($event && ($deliveryId || $orderId || $paymentId)) {
            $idempotencyKey = 'razorpay_webhook:' . ($deliveryId ?: ($event ?? '') . ':' . ($orderId ?? '') . ':' . ($paymentId ?? ''));
            if (!Cache::add($idempotencyKey, true, now()->addDays(7))) {
                Log::channel('stack')->info('Skipping duplicate Razorpay webhook event', [
                    'event' => $event,
                    'order_id' => $orderId,
                    'payment_id' => $paymentId,
                    'event_id' => $deliveryId,
                ]);
                return response()->json(['success' => true]);
            }
        }

        // Keep provider webhook handling as the single source of truth for payment-order state transitions.
        $provider->handleWebhook($data);

        return response()->json(['success' => true]);
    }
}
