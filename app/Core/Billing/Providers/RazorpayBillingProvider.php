<?php

namespace App\Core\Billing\Providers;

use App\Core\Billing\Contracts\BillingProvider;
use App\Models\PaymentOrder;
use App\Models\Plan;
use App\Models\PlatformSetting;
use App\Models\Subscription;
use App\Models\User;
use App\Models\Account;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class RazorpayBillingProvider implements BillingProvider
{
    protected string $baseUrl = 'https://api.razorpay.com/v1';

    public function getName(): string
    {
        return 'razorpay';
    }

    public function isEnabled(): bool
    {
        return (bool) PlatformSetting::get('payment.razorpay_enabled', false)
            && !empty($this->getKeyId())
            && !empty($this->getKeySecret());
    }

    public function createSubscription(Account $account, Plan $plan, User $actor, array $metadata = []): Subscription
    {
        $now = now();
        $periodEnd = $now->copy()->addMonth();

        return Subscription::updateOrCreate(
            ['account_id' => $account->id],
            [
                'plan_id' => $plan->id,
                'status' => 'active',
                'started_at' => $now,
                'trial_ends_at' => null,
                'current_period_start' => $now,
                'current_period_end' => $periodEnd,
                'provider' => $this->getName(),
                'provider_ref' => $metadata['payment_id'] ?? $metadata['order_id'] ?? null,
                'last_payment_at' => $now,
                'last_payment_failed_at' => null,
                'last_error' => null,
                'cancel_at_period_end' => false,
                'canceled_at' => null]
        );
    }

    public function updateSubscription(Subscription $subscription, Plan $newPlan, User $actor, array $metadata = []): Subscription
    {
        $subscription->update([
            'plan_id' => $newPlan->id,
            'status' => 'active',
            'provider' => $this->getName(),
            'provider_ref' => $metadata['payment_id'] ?? $metadata['order_id'] ?? $subscription->provider_ref,
            'last_payment_at' => $metadata['paid_at'] ?? now(),
            'last_payment_failed_at' => null,
            'last_error' => null,
            'cancel_at_period_end' => false,
            'canceled_at' => null]);

        return $subscription->fresh();
    }

    public function cancelSubscription(Subscription $subscription, User $actor, bool $immediately = false): Subscription
    {
        if ($immediately) {
            $subscription->update([
                'status' => 'canceled',
                'canceled_at' => now(),
                'cancel_at_period_end' => false]);
        } else {
            $subscription->update([
                'cancel_at_period_end' => true]);
        }

        return $subscription->fresh();
    }

    public function resumeSubscription(Subscription $subscription, User $actor): Subscription
    {
        $subscription->update([
            'status' => 'active',
            'cancel_at_period_end' => false,
            'canceled_at' => null]);

        return $subscription->fresh();
    }

    public function syncSubscription(Subscription $subscription): Subscription
    {
        // One-time payments: no external subscription to sync
        return $subscription->fresh();
    }

    public function handleWebhook(array $payload): void
    {
        $event = $payload['event'] ?? null;
        if (!$event) {
            return;
        }

        if ($event === 'payment.captured' || $event === 'order.paid') {
            $orderId = $payload['payload']['order']['entity']['id'] ?? $payload['payload']['payment']['entity']['order_id'] ?? null;
            $paymentId = $payload['payload']['payment']['entity']['id'] ?? null;

            if (!$orderId) {
                return;
            }

            $paymentOrder = PaymentOrder::where('provider', $this->getName())
                ->where('provider_order_id', $orderId)
                ->first();

            if (!$paymentOrder || $paymentOrder->status === 'paid') {
                return;
            }

            $paymentOrder->update([
                'status' => 'paid',
                'provider_payment_id' => $paymentId ?? $paymentOrder->provider_payment_id,
                'paid_at' => now()]);
        }

        if ($event === 'payment.failed') {
            $orderId = $payload['payload']['payment']['entity']['order_id'] ?? null;
            $paymentId = $payload['payload']['payment']['entity']['id'] ?? null;

            if (!$orderId) {
                return;
            }

            $paymentOrder = PaymentOrder::where('provider', $this->getName())
                ->where('provider_order_id', $orderId)
                ->first();

            if (!$paymentOrder || $paymentOrder->status === 'paid') {
                return;
            }

            $paymentOrder->update([
                'status' => 'failed',
                'provider_payment_id' => $paymentId ?? $paymentOrder->provider_payment_id,
                'failed_at' => now()]);
        }
    }

    public function getCheckoutUrl(Account $account, Plan $plan, User $actor, array $metadata = []): ?string
    {
        return null;
    }

    public function createOrder(Account $account, Plan $plan, User $actor): array
    {
        if (!$this->isEnabled()) {
            throw new \RuntimeException('Razorpay is not enabled.');
        }

        // Razorpay expects amount in paise (smallest currency unit)
        // Prices are stored in paise (e.g., 10000 = ₹100)
        $amount = (int) ($plan->price_monthly ?? 0);
        if ($amount <= 0) {
            throw new \RuntimeException('Plan is not billable.');
        }

        $payload = [
            'amount' => $amount,
            'currency' => 'INR',
            'receipt' => "ws_{$account->id}_plan_{$plan->id}_" . time(),
            'notes' => [
                'account_id' => (string) $account->id,
                'plan_id' => (string) $plan->id,
                'user_id' => (string) $actor->id]];

        $response = Http::withBasicAuth($this->getKeyId(), $this->getKeySecret())
            ->post("{$this->baseUrl}/orders", $payload);

        $data = $response->json();
        if (!$response->successful()) {
            Log::channel('stack')->error('Razorpay order creation failed', [
                'status' => $response->status(),
                'error' => $data]);
            throw new \RuntimeException($data['error']['description'] ?? 'Unable to create Razorpay order');
        }

        return $data;
    }

    public function getKeyId(): ?string
    {
        $key = PlatformSetting::get('payment.razorpay_key_id');
        if (is_string($key)) {
            $key = trim($key);
        }
        return $key ?: null;
    }

    public function getKeySecret(): ?string
    {
        $secret = PlatformSetting::get('payment.razorpay_key_secret');
        if (is_string($secret)) {
            $secret = trim($secret);
        }
        return $secret ?: null;
    }

    public function getWebhookSecret(): ?string
    {
        return PlatformSetting::get('payment.razorpay_webhook_secret');
    }
}
