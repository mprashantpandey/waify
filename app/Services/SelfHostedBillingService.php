<?php

namespace App\Services;

use App\Core\Billing\DiscountService;
use App\Core\Billing\PlanResolver;
use App\Core\Billing\SubscriptionService;
use App\Models\Account;
use App\Models\BillingEvent;
use App\Models\BillingDiscount;
use App\Models\PaymentOrder;
use App\Models\Plan;
use App\Models\User;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class SelfHostedBillingService
{
    public function __construct(
        protected DiscountService $discountService,
        protected BillingTaxService $taxService,
        protected SubscriptionService $subscriptionService,
        protected PlanResolver $planResolver,
        protected BillingEmailService $emailService
    ) {}

    public function createOrder(Account $account, Plan $plan, User $actor, array $data = []): PaymentOrder
    {
        if ($plan->requiresAdminApproval() && ! $actor->isSuperAdmin()) {
            throw new \InvalidArgumentException('Enterprise plan activation requires platform admin approval.');
        }

        $billingCycle = in_array($data['billing_cycle'] ?? 'monthly', ['monthly', 'yearly'], true)
            ? $data['billing_cycle']
            : 'monthly';
        $paymentMethod = $this->normalizePaymentMethod($data['payment_method'] ?? 'manual');
        $currency = strtoupper((string) app(PlatformSettingsService::class)->get('payment.default_currency', 'INR'));
        $baseAmount = $billingCycle === 'yearly'
            ? (int) ($plan->price_yearly ?? 0)
            : (int) ($plan->price_monthly ?? 0);

        if ($baseAmount <= 0) {
            throw new \InvalidArgumentException('Plan is not billable.');
        }

        $discountPreview = $this->discountService->preview($data['promo_code'] ?? null, $plan, $baseAmount, $currency, $account);
        $taxQuote = $this->taxService->quote(
            $account,
            $baseAmount,
            (int) ($discountPreview['amount_off_minor'] ?? 0),
            $currency
        );

        $metadata = [
            'billing_cycle' => $billingCycle,
            'discount' => $discountPreview,
            'payment_method_label' => $this->paymentMethodLabel($paymentMethod),
            'payment_instructions' => $this->paymentInstructions($paymentMethod),
        ];

        $order = PaymentOrder::create([
            'account_id' => $account->id,
            'plan_id' => $plan->id,
            'provider' => $paymentMethod === 'razorpay' ? 'razorpay' : 'zyptos',
            'payment_method' => $paymentMethod,
            'provider_order_id' => $this->nextOrderReference(),
            'currency' => $currency,
            'billing_cycle' => $billingCycle,
            ...$this->taxService->orderTaxFields($taxQuote),
            'discount_code' => $discountPreview['code'] ?? null,
            'status' => 'created',
            'metadata' => $metadata,
            'created_by' => $actor->id,
        ]);

        $this->recordOrderEvent($order, 'invoice_created', 'Invoice created', $actor, [
            'payment_method' => $paymentMethod,
            'amount' => (int) $order->amount,
            'currency' => $currency,
        ]);

        if ($data['send_email'] ?? true) {
            $this->emailService->invoiceCreated($order->fresh(['account.owner', 'plan']));
            $this->recordOrderEvent($order, 'invoice_email_sent', 'Invoice email sent', $actor);
        }

        return $order->fresh(['account.owner', 'plan']);
    }

    public function attachProof(PaymentOrder $order, UploadedFile $file, User $actor): PaymentOrder
    {
        if (! in_array($order->status, ['created', 'pending_approval', 'rejected'], true)) {
            throw new \RuntimeException('Proof can only be uploaded for unpaid orders.');
        }

        if ($order->proof_path) {
            Storage::disk('local')->delete($order->proof_path);
        }

        $path = $file->store("payment-proofs/{$order->account_id}", 'local');
        $meta = is_array($order->metadata) ? $order->metadata : [];
        $meta['proof_uploaded_by'] = $actor->id;

        $order->update([
            'proof_path' => $path,
            'proof_original_name' => $file->getClientOriginalName(),
            'proof_uploaded_at' => now(),
            'status' => 'pending_approval',
            'rejected_at' => null,
            'rejection_reason' => null,
            'metadata' => $meta,
        ]);

        $this->recordOrderEvent($order, 'proof_uploaded', 'Payment proof uploaded', $actor, [
            'file_name' => $file->getClientOriginalName(),
        ]);

        return $order->fresh(['account.owner', 'plan']);
    }

    public function approve(PaymentOrder $order, User $actor, ?string $paymentReference = null): PaymentOrder
    {
        return DB::transaction(function () use ($order, $actor, $paymentReference) {
            $order = PaymentOrder::query()->lockForUpdate()->with(['account.owner', 'plan'])->findOrFail($order->id);
            if ($order->status === 'paid') {
                return $order;
            }

            $order->update([
                'status' => 'paid',
                'provider_payment_id' => $paymentReference ?: $order->provider_payment_id ?: 'approved-'.$order->id,
                'approved_by' => $actor->id,
                'approved_at' => now(),
                'paid_at' => now(),
                'failed_at' => null,
                'rejected_at' => null,
                'rejection_reason' => null,
            ]);

            $this->recordOrderEvent($order, 'payment_approved', 'Payment approved', $actor, [
                'payment_reference' => $order->provider_payment_id,
            ]);

            $this->activateSubscription($order, $actor);

            if ($order->discount_code) {
                BillingDiscount::where('code', $order->discount_code)->first()?->increment('redemptions');
            }

            $this->emailService->paymentReceived($order->fresh(['account.owner', 'plan']));
            $this->recordOrderEvent($order, 'receipt_email_sent', 'Payment receipt email sent', $actor);

            return $order->fresh(['account.owner', 'plan']);
        });
    }

    public function reject(PaymentOrder $order, User $actor, string $reason): PaymentOrder
    {
        $order->update([
            'status' => 'rejected',
            'approved_by' => null,
            'approved_at' => null,
            'rejected_at' => now(),
            'rejection_reason' => $reason,
            'failed_at' => now(),
        ]);

        $this->emailService->paymentFailed($order->fresh(['account.owner', 'plan']), $reason);
        $this->recordOrderEvent($order, 'payment_rejected', 'Payment rejected', $actor, [
            'reason' => $reason,
        ]);
        app(AppNotificationService::class)->platform(
            'failed_payment',
            'Payment proof rejected',
            "Invoice {$order->invoice_number}: {$reason}",
            'warning',
            route('platform.transactions.index', ['status' => 'rejected']),
            ['payment_order_id' => $order->id, 'account_id' => $order->account_id, 'dedupe_key' => 'payment_order_'.$order->id]
        );
        app(AppNotificationService::class)->workspace(
            $order->account_id,
            'payment_failed',
            'Payment rejected',
            $reason,
            'warning',
            route('app.billing.index', ['tab' => 'invoices']),
            ['payment_order_id' => $order->id, 'dedupe_key' => 'payment_order_'.$order->id]
        );

        return $order->fresh(['account.owner', 'plan']);
    }

    public function sendReminder(PaymentOrder $order, User $actor): PaymentOrder
    {
        if ($order->status === 'paid') {
            throw new \RuntimeException('Paid orders do not need reminders.');
        }

        $this->emailService->invoiceCreated($order->fresh(['account.owner', 'plan']));
        $this->recordOrderEvent($order, 'payment_reminder_sent', 'Payment reminder sent', $actor);
        app(AppNotificationService::class)->workspace(
            $order->account_id,
            'payment_due',
            'Payment reminder sent',
            "Invoice {$order->invoice_number} is pending payment.",
            'warning',
            route('app.billing.index', ['tab' => 'invoices']),
            ['payment_order_id' => $order->id, 'dedupe_key' => 'payment_order_'.$order->id],
            $actor
        );

        return $order->fresh(['account.owner', 'plan']);
    }

    public function activateSubscription(PaymentOrder $order, User $actor): void
    {
        $account = $order->account;
        $plan = $order->plan;
        if (! $account || ! $plan) {
            throw new \RuntimeException('Payment order is missing account or plan.');
        }

        $subscription = $account->subscription;
        $currentPlan = $this->planResolver->getAccountPlan($account);
        $metadata = [
            'payment_id' => $order->provider_payment_id,
            'order_id' => $order->provider_order_id,
            'paid_at' => now(),
            'discount_code' => $order->discount_code,
            'discount_snapshot' => $order->metadata['discount'] ?? null,
            'tax_snapshot' => $order->tax_snapshot,
            'billing_cycle' => $order->billing_cycle ?? ($order->metadata['billing_cycle'] ?? 'monthly'),
            'skip_proration' => true,
        ];

        if (
            $subscription
            && $currentPlan
            && (int) $currentPlan->id === (int) $plan->id
            && $this->canRenewSamePlan($subscription)
        ) {
            $this->subscriptionService->renew($account, $plan, $actor, 'manual', $metadata + ['source' => 'same_plan_renewal']);
            $this->recordOrderEvent($order, 'subscription_renewed', 'Subscription renewed', $actor);

            return;
        }

        $this->subscriptionService->changePlan($account, $plan, $actor, 'manual', $metadata);
        $this->recordOrderEvent($order, 'subscription_activated', 'Subscription activated', $actor);
    }

    public function recordOrderEvent(PaymentOrder $order, string $event, string $label, ?User $actor = null, array $meta = []): void
    {
        $order->refresh();
        $metadata = is_array($order->metadata) ? $order->metadata : [];
        $timeline = is_array($metadata['timeline'] ?? null) ? $metadata['timeline'] : [];

        $entry = [
            'event' => $event,
            'label' => $label,
            'at' => now()->toIso8601String(),
            'actor_id' => $actor?->id,
            'actor_name' => $actor?->name,
            'meta' => $meta,
        ];

        $timeline[] = $entry;
        $metadata['timeline'] = array_values($timeline);
        $order->forceFill(['metadata' => $metadata])->save();

        BillingEvent::create([
            'account_id' => $order->account_id,
            'actor_id' => $actor?->id,
            'type' => $event,
            'data' => [
                'payment_order_id' => $order->id,
                'invoice_number' => $order->invoice_number,
                'provider_order_id' => $order->provider_order_id,
                'amount' => (int) $order->amount,
                'currency' => $order->currency,
                'label' => $label,
                'meta' => $meta,
            ],
        ]);
    }

    public function paymentInstructions(string $paymentMethod): array
    {
        $settings = app(PlatformSettingsService::class);

        return match ($paymentMethod) {
            'bank', 'upi' => [
                'upi_id' => $settings->get('payment.upi_id'),
                'upi_payee_name' => $settings->get('payment.upi_payee_name', $settings->get('payment.legal_name', config('app.name', 'Zyptos'))),
                'account_name' => $settings->get('payment.bank_account_name', $settings->get('payment.legal_name', config('app.name', 'Zyptos'))),
                'account_number' => $settings->get('payment.bank_account_number'),
                'ifsc' => $settings->get('payment.bank_ifsc'),
                'bank_name' => $settings->get('payment.bank_name'),
            ],
            default => [
                'note' => $settings->get('payment.manual_payment_note', 'Pay using the agreed offline method and upload proof for approval.'),
            ],
        };
    }

    public function normalizePaymentMethod(string $method): string
    {
        return in_array($method, ['bank', 'razorpay'], true) ? $method : 'bank';
    }

    public function paymentMethodLabel(string $method): string
    {
        return match ($method) {
            'upi', 'bank' => 'Bank Transfer / UPI',
            'razorpay' => 'Razorpay one-time',
            default => 'Manual payment',
        };
    }

    private function nextOrderReference(): string
    {
        do {
            $reference = 'ZYP-'.now()->format('ymd').'-'.Str::upper(Str::random(6));
        } while (PaymentOrder::where('provider_order_id', $reference)->exists());

        return $reference;
    }

    private function canRenewSamePlan(?\App\Models\Subscription $subscription): bool
    {
        if (! $subscription) {
            return false;
        }

        return in_array($subscription->status, ['canceled', 'cancelled', 'expired', 'past_due'], true)
            || ($subscription->current_period_end && $subscription->current_period_end->isPast());
    }
}
