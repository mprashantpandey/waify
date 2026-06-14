<?php

namespace App\Http\Controllers\Billing;

use App\Core\Billing\BillingProviderManager;
use App\Core\Billing\DiscountService;
use App\Core\Billing\PlanResolver;
use App\Core\Billing\SubscriptionService;
use App\Core\Billing\UsageService;
use App\Http\Controllers\Controller;
use App\Models\PaymentOrder;
use App\Models\Plan;
use App\Models\Subscription;
use App\Models\WalletTopupOrder;
use App\Models\WalletTransaction;
use App\Services\PlatformSettingsService;
use App\Services\BrandingService;
use App\Services\BillingTaxService;
use App\Services\InvoicePdfService;
use App\Services\SelfHostedBillingService;
use App\Services\WalletService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;

class BillingController extends Controller
{
    public function __construct(
        protected PlanResolver $planResolver,
        protected SubscriptionService $subscriptionService,
        protected UsageService $usageService,
        protected BillingProviderManager $providerManager,
        protected WalletService $walletService,
        protected DiscountService $discountService
    ) {}

    /**
     * Display billing overview.
     */
    public function index(Request $request): Response
    {
        $tab = $request->query('tab', 'overview');
        $tab = in_array($tab, ['overview', 'plans', 'usage', 'invoices', 'payment'], true) ? $tab : 'overview';

        return Inertia::render('Billing/Index', $this->billingPageProps($request, $tab));
    }

    protected function planListForAccount($account)
    {
        $currentPlan = $this->planResolver->getAccountPlan($account);
        $currentUsage = $this->usageService->getCurrentUsage($account);
        $currentLimits = $this->planResolver->getEffectiveLimits($account);
        $currentConnectionsCount = \App\Modules\WhatsApp\Models\WhatsAppConnection::where('account_id', $account->id)
            ->where('is_active', true)
            ->count();
        $currentAgentsCount = $account->users()
            ->where('users.is_platform_admin', false)
            ->count();

        // Get default currency from platform settings
        $settingsService = app(PlatformSettingsService::class);
        $defaultCurrency = $settingsService->get('payment.default_currency', 'USD');

        $plans = Plan::where('is_public', true)
            ->where('is_active', true)
            ->orderBy('sort_order')
            ->get()
            ->map(function ($plan) use ($account, $currentPlan, $currentUsage, $currentLimits, $defaultCurrency, $currentConnectionsCount, $currentAgentsCount) {
                $planLimits = $plan->limits ?? [];
                $warnings = [];
                $isCurrent = $currentPlan && (int) $currentPlan->id === (int) $plan->id;

                // Check if downgrade would exceed limits
                if ($currentPlan && $currentPlan->id !== $plan->id) {
                    foreach ($planLimits as $key => $limit) {
                        if ($limit !== -1 && isset($currentLimits[$key])) {
                            $currentLimit = $currentLimits[$key];
                            if ($currentLimit === -1 || $limit < $currentLimit) {
                                $currentValue = match ($key) {
                                    'messages_monthly' => $currentUsage->messages_sent,
                                    'template_sends_monthly' => $currentUsage->template_sends,
                                    'ai_credits_monthly' => $currentUsage->ai_credits_used,
                                    default => 0,
                                };
                                if ($currentValue > $limit) {
                                    $warnings[] = "Your current {$key} usage ({$currentValue}) exceeds the {$plan->name} plan limit ({$limit}).";
                                }
                            }
                        }
                    }
                }

                if (isset($planLimits['whatsapp_connections']) && $planLimits['whatsapp_connections'] !== -1) {
                    if ($currentConnectionsCount > (int) $planLimits['whatsapp_connections']) {
                        $warnings[] = "Your active connections ({$currentConnectionsCount}) exceed this plan limit ({$planLimits['whatsapp_connections']}).";
                    }
                }

                if (isset($planLimits['agents']) && $planLimits['agents'] !== -1) {
                    if ($currentAgentsCount > (int) $planLimits['agents']) {
                        $warnings[] = "Your team size ({$currentAgentsCount}) exceeds this plan limit ({$planLimits['agents']}).";
                    }
                }

                return [
                    'id' => $plan->id,
                    'key' => $plan->key,
                    'name' => $plan->name,
                    'description' => $plan->description,
                    'price_monthly' => $plan->price_monthly,
                    'price_yearly' => $plan->price_yearly,
                    'currency' => $defaultCurrency, // Use platform default currency
                    'billing_period' => $plan->billing_period,
                    'billing_interval' => $plan->billing_interval,
                    'trial_days' => $plan->trial_days,
                    'requires_admin_approval' => $plan->requiresAdminApproval(),
                    'limits' => $planLimits,
                    'modules' => $plan->modules ?? [],
                    'features' => $plan->publicFeatures(),
                    'is_current' => $isCurrent,
                    'can_renew' => $isCurrent && $this->canRenewSamePlan($account->subscription),
                    'warnings' => $warnings];
            });

        $currentModules = $this->planResolver->getEffectiveModules($account);

        // Check if Razorpay is enabled
        $razorpayProvider = $this->providerManager->get('razorpay');
        $razorpayEnabled = $razorpayProvider?->isEnabled() ?? false;
        $razorpayKeyId = method_exists($razorpayProvider, 'getKeyId') ? $razorpayProvider->getKeyId() : null;
        if (is_string($razorpayKeyId)) {
            $razorpayKeyId = trim($razorpayKeyId);
        }

        return [
            'plans' => $plans,
            'current_plan_key' => $currentPlan?->key,
            'current_modules' => $currentModules,
            'razorpay_enabled' => $razorpayEnabled,
            'razorpay_key_id' => $razorpayKeyId,
            'payment_methods' => $this->enabledSelfHostedPaymentMethods(),
        ];
    }

    public function previewPlan(Request $request, $plan)
    {
        $account = $request->attributes->get('account') ?? current_account();

        if (! $account?->isOwnedBy($request->user())) {
            abort(403, 'Only account owner can preview checkout.');
        }

        if (! $plan instanceof Plan) {
            $plan = $this->resolvePlan($plan);
        }
        $this->abortIfSelfServiceEnterprise($plan, $request);

        $validated = $request->validate([
            'billing_cycle' => ['nullable', 'string', 'in:monthly,yearly'],
            'promo_code' => ['nullable', 'string', 'max:80'],
        ]);

        $billingCycle = $validated['billing_cycle'] ?? 'monthly';
        $settingsService = app(PlatformSettingsService::class);
        $defaultCurrency = $settingsService->get('payment.default_currency', 'USD');
        $amount = $this->priceForBillingCycle($plan, $billingCycle);

        if ($amount <= 0) {
            return response()->json([
                'plan_name' => $plan->name,
                'billing_cycle' => $billingCycle,
                'base_amount' => 0,
                'discount_amount' => 0,
                'taxable_amount' => 0,
                'tax_amount' => 0,
                'cgst_amount' => 0,
                'sgst_amount' => 0,
                'igst_amount' => 0,
                'tax_rate' => 0,
                'tax_type' => 'NONE',
                'amount_due' => 0,
                'currency' => $defaultCurrency,
                'discount' => null,
                'tax' => null,
            ]);
        }

        $discountPreview = $this->discountService->preview(
            $validated['promo_code'] ?? null,
            $plan,
            $amount,
            $defaultCurrency,
            $account
        );
        $taxQuote = app(BillingTaxService::class)->quote(
            $account,
            $amount,
            (int) ($discountPreview['amount_off_minor'] ?? 0),
            $defaultCurrency
        );

        return response()->json([
            'plan_name' => $plan->name,
            'billing_cycle' => $billingCycle,
            'base_amount' => $amount,
            'discount_amount' => (int) ($discountPreview['amount_off_minor'] ?? 0),
            'taxable_amount' => $taxQuote['taxable_amount'],
            'tax_amount' => $taxQuote['tax_amount'],
            'cgst_amount' => $taxQuote['cgst_amount'],
            'sgst_amount' => $taxQuote['sgst_amount'],
            'igst_amount' => $taxQuote['igst_amount'],
            'tax_rate' => $taxQuote['tax_rate'],
            'tax_type' => $taxQuote['tax_type'],
            'amount_due' => $taxQuote['total_amount'],
            'currency' => $defaultCurrency,
            'discount' => $discountPreview,
            'tax' => $taxQuote,
        ]);
    }

    /**
     * Switch account plan.
     */
    public function switchPlan(Request $request, $plan)
    {
        $account = $request->attributes->get('account') ?? current_account();

        // Plan is now resolved via route model binding (by key or ID)
        if (! $plan instanceof Plan) {
            $plan = $this->resolvePlan($plan);
        }
        $this->abortIfSelfServiceEnterprise($plan, $request);

        // Only account owner can change plan
        if (! $account->isOwnedBy($request->user())) {
            if ($request->header('X-Inertia')) {
                return back()
                    ->withErrors(['plan' => 'Only the account owner can change the plan.'])
                    ->with('error', 'Only the account owner can change the plan.');
            }
            abort(403, 'Only account owner can change plan.');
        }

        $subscription = $account->subscription;
        $currentPlan = $this->planResolver->getAccountPlan($account);
        $isNewSubscription = $subscription === null;
        $isSamePlan = $currentPlan && (int) $currentPlan->id === (int) $plan->id;
        $isSamePlanRenewal = $isSamePlan && $this->canRenewSamePlan($subscription);

        if ($isSamePlan && ! $isSamePlanRenewal) {
            return redirect()->route('app.billing.index', ['tab' => 'plans'])
                ->with('info', "You're already on the {$plan->name} plan.");
        }

        // Paid plans must use the invoice/checkout flow.
        if (($plan->price_monthly ?? 0) > 0) {
            $razorpayProvider = $this->providerManager->get('razorpay');
            if (! $razorpayProvider || ! $razorpayProvider->isEnabled()) {
                // Return error for Inertia requests
                return back()->withErrors([
                    'plan' => 'Payment gateway is not configured. Please contact support to enable payments for paid plans.',
                ])->with('error', 'Payment gateway is not configured. Please contact support.');
            }

            return back()->withErrors([
                'plan' => 'Paid plans require payment checkout. Please use the checkout flow.',
            ])->with('error', 'Paid plans require payment checkout. Please use the checkout flow.');
        }

        // Zero-amount private/admin plans can still be assigned directly.
        try {
            if ($isSamePlanRenewal) {
                $this->subscriptionService->renew($account, $plan, $request->user(), null, [
                    'source' => 'same_plan_renewal',
                ]);
            } elseif ($isNewSubscription && $plan->trial_days > 0 && $this->subscriptionService->canStartSelfServiceTrial($account, $request->user())) {
                // Start trial for new subscriptions with trial days
                $this->subscriptionService->startTrial($account, $plan, $request->user());
            } else {
                // Change plan (or create new subscription for accounts without one)
                $this->subscriptionService->changePlan($account, $plan, $request->user(), null, [
                    'suppress_trial' => $isNewSubscription && $plan->trial_days > 0,
                    'trial_skipped' => $isNewSubscription && $plan->trial_days > 0,
                ]);
            }

            \Log::info('Plan '.($isNewSubscription ? 'assigned' : 'changed').' successfully', [
                'account_id' => $account->id,
                'plan_id' => $plan->id,
                'plan_name' => $plan->name,
                'is_new_subscription' => $isNewSubscription]);
        } catch (\Exception $e) {
            \Log::error('Plan change failed', [
                'account_id' => $account->id,
                'plan_id' => $plan->id,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()]);

            if ($request->header('X-Inertia')) {
                return back()->withErrors([
                    'plan' => 'Failed to '.($isNewSubscription ? 'assign' : 'change').' plan: '.$e->getMessage(),
                ])->with('error', 'Failed to '.($isNewSubscription ? 'assign' : 'change').' plan: '.$e->getMessage());
            }

            return redirect()->back()->with('error', 'Failed to '.($isNewSubscription ? 'assign' : 'change').' plan: '.$e->getMessage());
        }

        // Redirect back to plans page or dashboard
        $successMessage = $isSamePlanRenewal
            ? 'Plan renewed successfully.'
            : ($isNewSubscription
            ? 'Plan assigned successfully! You can now use all features.'
            : 'Plan changed successfully.');

        if ($request->header('X-Inertia')) {
            return redirect()->route('app.billing.index', ['tab' => 'plans'])
                ->with('success', $successMessage);
        }

        return redirect()->route('app.billing.index', ['tab' => 'plans'])
            ->with('success', $successMessage);
    }

    /**
     * Create a self-hosted Zyptos invoice/order for a plan.
     */
    public function createOrder(Request $request, SelfHostedBillingService $billing, $plan = null)
    {
        $account = $request->attributes->get('account') ?? current_account();
        abort_unless($account, 404, 'Account not found');
        abort_unless($account->isOwnedBy($request->user()), 403, 'Only account owner can purchase a plan.');

        $plan = $plan instanceof Plan ? $plan : $this->resolvePlan($request->route('plan') ?? $plan);
        $this->abortIfSelfServiceEnterprise($plan, $request);

        $currentPlan = $this->planResolver->getAccountPlan($account);
        if (
            $currentPlan
            && (int) $currentPlan->id === (int) $plan->id
            && ! $this->canRenewSamePlan($account->subscription)
        ) {
            abort(422, "You're already on an active {$plan->name} plan.");
        }

        $validated = $request->validate([
            'billing_cycle' => ['nullable', 'string', 'in:monthly,yearly'],
            'promo_code' => ['nullable', 'string', 'max:80'],
            'payment_method' => ['required', 'string', 'in:bank,razorpay'],
        ]);

        $enabledMethods = collect($this->enabledSelfHostedPaymentMethods())
            ->where('enabled', true)
            ->pluck('key')
            ->all();
        if (! in_array($validated['payment_method'], $enabledMethods, true)) {
            abort(422, 'Selected payment method is not available.');
        }

        $order = $billing->createOrder($account, $plan, $request->user(), $validated + [
            'send_email' => false,
        ]);

        if ($order->payment_method === 'razorpay') {
            $provider = $this->providerManager->get('razorpay');
            if (! $provider || ! $provider->isEnabled() || ! method_exists($provider, 'createCustomOrder')) {
                abort(422, 'Razorpay one-time payments are not configured.');
            }

            $remote = $provider->createCustomOrder(
                amount: max(100, (int) $order->amount),
                receipt: $order->provider_order_id,
                notes: [
                    'account_id' => (string) $account->id,
                    'plan_id' => (string) $plan->id,
                    'payment_order_id' => (string) $order->id,
                    'invoice_number' => (string) $order->invoice_number,
                    'checkout_brand' => $this->checkoutBrand()['name'],
                ]
            );

            $meta = is_array($order->metadata) ? $order->metadata : [];
            $meta['razorpay_order'] = $remote;
            $order->update([
                'provider' => 'razorpay',
                'provider_order_id' => $remote['id'],
                'currency' => $remote['currency'] ?? $order->currency,
                'metadata' => $meta,
            ]);
            $order->refresh();
        }

        $this->sendInvoiceEmailAfterResponse($order);

        return response()->json($this->paymentOrderPayload($order->loadMissing(['account.owner', 'plan'])));
    }

    public function purchaseWithCredits(Request $request, $plan = null)
    {
        $account = $request->attributes->get('account') ?? current_account();
        abort_unless($account, 404, 'Account not found');
        abort_unless($account->isOwnedBy($request->user()), 403, 'Only account owner can purchase a plan.');

        $plan = $plan instanceof Plan ? $plan : $this->resolvePlan($request->route('plan') ?? $plan);
        $this->abortIfSelfServiceEnterprise($plan, $request);
        abort_unless($plan->is_active, 422, 'Selected plan is not active.');

        $currentPlan = $this->planResolver->getAccountPlan($account);
        $subscription = $account->subscription;
        if (
            $currentPlan
            && (int) $currentPlan->id === (int) $plan->id
            && ! $this->canRenewSamePlan($subscription)
        ) {
            abort(422, "You're already on an active {$plan->name} plan.");
        }

        $validated = $request->validate([
            'billing_cycle' => ['nullable', 'string', 'in:monthly,yearly'],
            'promo_code' => ['nullable', 'string', 'max:80'],
        ]);

        $billingCycle = $validated['billing_cycle'] ?? 'monthly';
        $baseAmount = $this->priceForBillingCycle($plan, $billingCycle);
        $currency = app(PlatformSettingsService::class)->get('payment.default_currency', 'USD');
        $discountPreview = $this->discountService->preview($validated['promo_code'] ?? null, $plan, $baseAmount, $currency, $account);
        $taxQuote = app(BillingTaxService::class)->quote(
            $account,
            $baseAmount,
            (int) ($discountPreview['amount_off_minor'] ?? 0),
            $currency
        );
        $amountDue = (int) $taxQuote['total_amount'];

        try {
            DB::transaction(function () use ($account, $plan, $request, $subscription, $billingCycle, $amountDue, $currency, $discountPreview, $taxQuote) {
                $wallet = $this->walletService->getOrCreateWallet($account, $currency);
                if (strtoupper($wallet->currency) !== strtoupper((string) $currency)) {
                    throw new \RuntimeException("Wallet currency {$wallet->currency} does not match billing currency {$currency}.");
                }

                if ($amountDue > 0) {
                    $transaction = $this->walletService->debit(
                        $account,
                        $amountDue,
                        source: 'plan_purchase',
                        actor: $request->user(),
                        reference: 'plan_'.$plan->key.'_'.time(),
                        notes: "Plan purchase: {$plan->name}",
                        meta: [
                            'plan_id' => $plan->id,
                            'plan_key' => $plan->key,
                            'billing_cycle' => $billingCycle,
                            'discount' => $discountPreview,
                            'tax' => $taxQuote,
                        ]
                    );

                    if ($transaction->status !== 'success') {
                        throw new \RuntimeException(sprintf(
                            'Insufficient wallet credits. Required %s, available %s.',
                            number_format($amountDue / 100, 2),
                            number_format($wallet->balance_minor / 100, 2)
                        ));
                    }
                }

                $metadata = [
                    'source' => 'wallet_credits',
                    'skip_proration' => true,
                    'billing_cycle' => $billingCycle,
                    'paid_at' => now(),
                    'amount_paid' => $amountDue,
                    'currency' => $currency,
                    'discount' => $discountPreview,
                    'tax' => $taxQuote,
                ];

                if ($subscription && ((int) $subscription->plan_id === (int) $plan->id || $this->canRenewSamePlan($subscription))) {
                    $this->subscriptionService->renew($account, $plan, $request->user(), 'manual', $metadata);
                } else {
                    $updated = $this->subscriptionService->changePlan($account, $plan, $request->user(), 'manual', $metadata);
                    $periodEnd = $billingCycle === 'yearly' ? now()->addYear() : now()->addMonth();
                    $updated->update([
                        'status' => 'active',
                        'trial_ends_at' => null,
                        'current_period_start' => now(),
                        'current_period_end' => $periodEnd,
                        'last_payment_at' => $amountDue > 0 ? now() : $updated->last_payment_at,
                        'last_payment_failed_at' => null,
                        'last_error' => null,
                    ]);
                }
            });
        } catch (\Throwable $e) {
            return back()->withErrors(['plan' => $e->getMessage()])
                ->with('error', 'Plan purchase failed: '.$e->getMessage());
        }

        return redirect()->route('app.billing.index', ['tab' => 'plans'])
            ->with('success', "{$plan->name} activated using wallet credits.");
    }

    public function uploadProof(Request $request, PaymentOrder $paymentOrder, SelfHostedBillingService $billing)
    {
        $account = $request->attributes->get('account') ?? current_account();
        abort_unless(account_ids_match($paymentOrder->account_id, $account?->id), 404);
        abort_unless($account->isOwnedBy($request->user()), 403, 'Only account owner can upload payment proof.');

        $validated = $request->validate([
            'proof' => ['required', 'file', 'mimes:jpg,jpeg,png,webp,pdf', 'max:5120'],
        ]);

        $order = $billing->attachProof($paymentOrder, $validated['proof'], $request->user());

        return response()->json($this->paymentOrderPayload($order));
    }

    public function proof(Request $request, PaymentOrder $paymentOrder)
    {
        $account = $request->attributes->get('account') ?? current_account();
        abort_unless(account_ids_match($paymentOrder->account_id, $account?->id) || $request->user()?->isSuperAdmin(), 404);
        abort_unless($paymentOrder->proof_path && Storage::disk('local')->exists($paymentOrder->proof_path), 404);

        return Storage::disk('local')->download($paymentOrder->proof_path, $paymentOrder->proof_original_name ?: 'payment-proof');
    }

    /**
     * Create a Razorpay order for a plan.
     */
    public function createRazorpayOrder(Request $request, $plan = null)
    {
        $account = $request->attributes->get('account') ?? current_account();

        if (! $account) {
            \Log::error('No account found in createRazorpayOrder');
            abort(404, 'Account not found');
        }

        // Get plan from route parameter (route model binding should have resolved it)
        $planParam = $request->route('plan') ?? $plan;

        // Resolve plan (by key or ID)
        if ($plan instanceof Plan) {
            // Already resolved by route model binding
        } elseif ($planParam) {
            try {
                $plan = $this->resolvePlan($planParam);
            } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
                \Log::error('Plan not found in createRazorpayOrder', [
                    'plan_param' => $planParam,
                    'route_plan' => $request->route('plan'),
                    'error' => $e->getMessage()]);
                abort(404, 'Plan not found');
            }
        } else {
            \Log::error('Plan parameter not found in createRazorpayOrder', [
                'route_plan' => $request->route('plan'),
                'plan_param' => $plan]);
            abort(404, 'Plan not found');
        }

        if (! $account->isOwnedBy($request->user())) {
            if ($request->header('X-Inertia')) {
                return back()
                    ->withErrors(['plan' => 'Only the account owner can purchase a plan.'])
                    ->with('error', 'Only the account owner can purchase a plan.');
            }
            abort(403, 'Only account owner can purchase a plan.');
        }
        $this->abortIfSelfServiceEnterprise($plan, $request);

        $validated = $request->validate([
            'billing_cycle' => ['nullable', 'string', 'in:monthly,yearly'],
            'promo_code' => ['nullable', 'string', 'max:80'],
        ]);

        $billingCycle = $validated['billing_cycle'] ?? 'monthly';
        $amount = $this->priceForBillingCycle($plan, $billingCycle);

        if ($amount <= 0) {
            abort(422, 'Plan is not billable.');
        }

        $subscription = $account->subscription;
        $isNewSubscription = ! $subscription;
        $currentPlan = $this->planResolver->getAccountPlan($account);
        if (
            $currentPlan
            && (int) $currentPlan->id === (int) $plan->id
            && ! $this->canRenewSamePlan($subscription)
        ) {
            abort(422, "You're already on an active {$plan->name} plan.");
        }

        // Get default currency from platform settings
        $settingsService = app(PlatformSettingsService::class);
        $defaultCurrency = $settingsService->get('payment.default_currency', 'USD');

        // For Razorpay, only INR is supported
        if ($defaultCurrency !== 'INR') {
            abort(422, 'Razorpay only supports INR currency. Please set the platform default currency to INR in Platform Settings → Payment.');
        }

        $provider = $this->providerManager->get('razorpay');
        if (! $provider || ! $provider->isEnabled()) {
            \Log::error('Razorpay order creation failed - provider not available', [
                'provider_exists' => $provider !== null,
                'is_enabled' => $provider ? $provider->isEnabled() : false,
                'has_createOrder' => $provider && method_exists($provider, 'createOrder')]);
            abort(422, 'Razorpay is not available. Please ensure Razorpay is enabled and configured in platform settings.');
        }

        $razorpayMethodEnabled = collect($this->enabledSelfHostedPaymentMethods())
            ->contains(fn (array $method) => $method['key'] === 'razorpay' && $method['enabled']);
        if (! $razorpayMethodEnabled) {
            abort(422, 'Razorpay one-time checkout is disabled.');
        }

        $promoCode = $validated['promo_code'] ?? null;
        $discountPreview = $this->discountService->preview($promoCode, $plan, $amount, $defaultCurrency, $account);
        $taxQuote = app(BillingTaxService::class)->quote(
            $account,
            $amount,
            (int) ($discountPreview['amount_off_minor'] ?? 0),
            $defaultCurrency
        );
        $amountDue = (int) $taxQuote['total_amount'];
        try {
            if (method_exists($provider, 'createCustomOrder')) {
                $orderData = $provider->createCustomOrder(
                    amount: max(100, $amountDue),
                    receipt: "ws_{$account->id}_plan_{$plan->id}_".time(),
                    notes: [
                        'account_id' => (string) $account->id,
                        'plan_id' => (string) $plan->id,
                        'user_id' => (string) $request->user()->id,
                        'billing_cycle' => $billingCycle,
                        'discount_code' => (string) ($discountPreview['code'] ?? ''),
                        'tax_amount' => (string) $taxQuote['tax_amount'],
                        'checkout_brand' => $this->checkoutBrand()['name'],
                    ]
                );
            } else {
                $orderData = $provider->createOrder($account, $plan, $request->user());
            }
        } catch (\Exception $e) {
            \Log::error('Razorpay order creation failed', [
                'account_id' => $account->id,
                'plan_id' => $plan->id,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()]);
            abort(422, 'Failed to create payment order: '.$e->getMessage());
        }

        $paymentOrder = PaymentOrder::create([
            'account_id' => $account->id,
            'plan_id' => $plan->id,
            'provider' => 'razorpay',
            'provider_order_id' => $orderData['id'],
            'currency' => $orderData['currency'] ?? $defaultCurrency,
            'billing_cycle' => $billingCycle,
            ...app(BillingTaxService::class)->orderTaxFields($taxQuote),
            'discount_code' => $discountPreview['code'] ?? null,
            'status' => 'created',
            'metadata' => [
                'order' => $orderData,
                'discount' => $discountPreview,
                'billing_cycle' => $billingCycle,
            ],
            'created_by' => $request->user()->id]);

        // Get the order amount from the Razorpay response (in paise)
        $orderAmount = (int) ($orderData['amount'] ?? $plan->price_monthly);

        $keyId = $provider && method_exists($provider, 'getKeyId') ? $provider->getKeyId() : null;
        if (is_string($keyId)) {
            $keyId = trim($keyId);
        }

        return response()->json([
            'order_id' => $paymentOrder->provider_order_id,
            'amount' => $orderAmount,
            'base_amount' => $amount,
            'amount_due' => $orderAmount,
            'tax' => $taxQuote,
            'discount' => $discountPreview,
            'billing_cycle' => $billingCycle,
            'currency' => $paymentOrder->currency,
            'key_id' => $keyId,
            'checkout_brand' => $this->checkoutBrand(),
            'plan' => [
                'id' => $plan->id,
                'name' => $plan->name,
                'description' => $plan->description],
            'account' => [
                'id' => $account->id,
                'name' => $account->name]]);
    }

    /**
     * Confirm Razorpay payment and activate plan.
     */
    public function confirmRazorpayPayment(Request $request)
    {
        $account = $request->attributes->get('account') ?? current_account();

        if (! $account->isOwnedBy($request->user())) {
            abort(403, 'Only account owner can confirm payment.');
        }

        $validated = $request->validate([
            'order_id' => 'required|string',
            'payment_id' => 'required|string',
            'signature' => 'required|string']);

        $provider = $this->providerManager->get('razorpay');
        if (! $provider || ! $provider->isEnabled() || ! method_exists($provider, 'getKeySecret')) {
            abort(422, 'Razorpay is not available.');
        }

        $secret = $provider->getKeySecret();
        $payload = $validated['order_id'].'|'.$validated['payment_id'];
        $expected = hash_hmac('sha256', $payload, $secret);

        if (! hash_equals($expected, $validated['signature'])) {
            abort(400, 'Invalid payment signature.');
        }

        DB::transaction(function () use ($validated, $request, $account) {
            $providerReference = $validated['order_id'];
            $paymentOrder = PaymentOrder::where('provider', 'razorpay')
                ->where('provider_order_id', $providerReference)
                ->lockForUpdate()
                ->first();

            if (! $paymentOrder) {
                \Log::error('Payment order not found', [
                    'order_id' => $providerReference,
                    'account_id' => $account->id,
                    'user_id' => $request->user()->id,
                ]);
                abort(404, 'Payment order not found.');
            }

            if ((int) ($paymentOrder->created_by ?? 0) !== (int) $request->user()->id) {
                abort(403, 'Payment does not belong to this user.');
            }

            if (! account_ids_match($paymentOrder->account_id, $account->id)) {
                abort(403, 'Payment does not belong to this account.');
            }

            if (
                $paymentOrder->status === 'paid' &&
                (string) $paymentOrder->provider_payment_id === (string) $validated['payment_id']
            ) {
                return;
            }

            if (
                $paymentOrder->status === 'paid' &&
                ! empty($paymentOrder->provider_payment_id) &&
                (string) $paymentOrder->provider_payment_id !== (string) $validated['payment_id']
            ) {
                abort(409, 'Payment order is already settled with a different payment id.');
            }

            $paymentOrder->update([
                'status' => 'paid',
                'provider_payment_id' => $validated['payment_id'],
                'paid_at' => now(),
            ]);
            app(SelfHostedBillingService::class)->recordOrderEvent($paymentOrder, 'razorpay_payment_captured', 'Razorpay payment captured', $request->user(), [
                'payment_id' => $validated['payment_id'],
            ]);

            $plan = Plan::find($paymentOrder->plan_id);
            if (! $plan) {
                abort(404, 'Plan not found.');
            }

            app(SelfHostedBillingService::class)->activateSubscription($paymentOrder->fresh(['account', 'plan']), $request->user());
            app(\App\Services\BillingEmailService::class)->paymentReceived($paymentOrder->fresh(['account.owner', 'plan']));
            app(SelfHostedBillingService::class)->recordOrderEvent($paymentOrder, 'receipt_email_sent', 'Payment receipt email sent', $request->user());
        });

        return response()->json([
            'success' => true]);
    }

    /**
     * Cancel subscription.
     */
    public function cancel(Request $request)
    {
        $account = $request->attributes->get('account') ?? current_account();

        if (! $account->isOwnedBy($request->user())) {
            abort(403, 'Only account owner can cancel subscription.');
        }

        try {
            $this->subscriptionService->cancelAtPeriodEnd($account, $request->user());
        } catch (\Throwable $e) {
            \Log::error('Subscription cancellation failed', [
                'account_id' => $account->id,
                'error' => $e->getMessage(),
            ]);

            return redirect()->back()->with('error', 'Unable to cancel subscription: '.$e->getMessage());
        }

        return redirect()->back()->with('success', 'Subscription will be canceled at the end of the current period.');
    }

    public function walletTopup(Request $request)
    {
        $account = $request->attributes->get('account') ?? current_account();

        if (! $account->isOwnedBy($request->user())) {
            abort(403, 'Only account owner can top up wallet.');
        }

        $enabled = (bool) app(PlatformSettingsService::class)->get('payment.wallet_self_topup_enabled', false);
        if (! $enabled) {
            abort(403, 'Wallet self top-up is disabled by platform admin.');
        }

        $validated = $request->validate([
            'amount_minor' => 'required|integer|min:100|max:100000000',
            'notes' => 'nullable|string|max:255',
        ]);

        $provider = $this->providerManager->get('razorpay');
        if (! $provider || ! $provider->isEnabled() || ! method_exists($provider, 'createCustomOrder')) {
            abort(422, 'Wallet top-up requires an active Razorpay configuration.');
        }

        $settingsService = app(PlatformSettingsService::class);
        $defaultCurrency = strtoupper((string) $settingsService->get('payment.default_currency', 'INR'));
        if ($defaultCurrency !== 'INR') {
            abort(422, 'Wallet top-up is only available in INR with Razorpay.');
        }

        $amountMinor = (int) $validated['amount_minor'];
        $orderData = $provider->createCustomOrder(
            amount: $amountMinor,
            receipt: "ws_{$account->id}_wallet_".time(),
            notes: [
                'account_id' => (string) $account->id,
                'user_id' => (string) $request->user()->id,
                'purpose' => 'wallet_topup',
            ]
        );

        WalletTopupOrder::create([
            'account_id' => $account->id,
            'created_by' => $request->user()->id,
            'provider' => 'razorpay',
            'provider_order_id' => (string) $orderData['id'],
            'amount' => $amountMinor,
            'currency' => 'INR',
            'status' => 'created',
            'metadata' => [
                'notes' => $validated['notes'] ?? null,
                'order' => $orderData,
            ],
        ]);

        $keyId = method_exists($provider, 'getKeyId') ? $provider->getKeyId() : null;
        if (is_string($keyId)) {
            $keyId = trim($keyId);
        }

        return response()->json([
            'order_id' => (string) $orderData['id'],
            'amount' => $amountMinor,
            'currency' => 'INR',
            'key_id' => $keyId,
        ]);
    }

    public function confirmWalletTopup(Request $request)
    {
        $account = $request->attributes->get('account') ?? current_account();

        if (! $account->isOwnedBy($request->user())) {
            abort(403, 'Only account owner can confirm wallet top-up.');
        }

        $enabled = (bool) app(PlatformSettingsService::class)->get('payment.wallet_self_topup_enabled', false);
        if (! $enabled) {
            abort(403, 'Wallet self top-up is disabled by platform admin.');
        }

        $validated = $request->validate([
            'order_id' => 'required|string',
            'payment_id' => 'required|string',
            'signature' => 'required|string',
        ]);

        $provider = $this->providerManager->get('razorpay');
        if (! $provider || ! $provider->isEnabled() || ! method_exists($provider, 'getKeySecret')) {
            abort(422, 'Razorpay is not available.');
        }

        $secret = $provider->getKeySecret();
        $payload = $validated['order_id'].'|'.$validated['payment_id'];
        $expected = hash_hmac('sha256', $payload, $secret);

        if (! hash_equals($expected, $validated['signature'])) {
            abort(400, 'Invalid payment signature.');
        }

        DB::transaction(function () use ($validated, $request, $account): void {
            $order = WalletTopupOrder::where('provider', 'razorpay')
                ->where('provider_order_id', $validated['order_id'])
                ->lockForUpdate()
                ->first();

            if (! $order) {
                abort(404, 'Top-up order not found.');
            }

            if ((int) ($order->created_by ?? 0) !== (int) $request->user()->id) {
                abort(403, 'Top-up order does not belong to this user.');
            }

            if (! account_ids_match($order->account_id, $account->id)) {
                abort(403, 'Top-up order does not belong to this account.');
            }

            if (
                $order->status === 'paid' &&
                (string) $order->provider_payment_id === (string) $validated['payment_id']
            ) {
                return;
            }

            if (
                $order->status === 'paid' &&
                ! empty($order->provider_payment_id) &&
                (string) $order->provider_payment_id !== (string) $validated['payment_id']
            ) {
                abort(409, 'Top-up order already settled with another payment id.');
            }

            $order->update([
                'status' => 'paid',
                'provider_payment_id' => $validated['payment_id'],
                'paid_at' => now(),
            ]);

            $meta = is_array($order->metadata) ? $order->metadata : [];
            $this->walletService->credit(
                account: $account,
                amountMinor: (int) $order->amount,
                source: 'self_topup',
                actor: $request->user(),
                reference: 'self_topup:'.$order->provider_order_id,
                notes: (string) ($meta['notes'] ?? 'Self wallet top-up via Razorpay'),
                meta: ['provider' => 'razorpay', 'payment_id' => $validated['payment_id']]
            );
        });

        return response()->json(['success' => true]);
    }

    public function downloadInvoice(Request $request, PaymentOrder $paymentOrder, InvoicePdfService $pdf)
    {
        $account = $request->attributes->get('account') ?? current_account();
        abort_unless(account_ids_match($paymentOrder->account_id, $account->id), 404);

        $paymentOrder->loadMissing(['account.owner', 'plan']);
        $fileName = ($paymentOrder->invoice_number ?: $paymentOrder->provider_order_id).'.pdf';

        return response($pdf->render($paymentOrder), 200, [
            'Content-Type' => 'application/pdf',
            'Content-Disposition' => 'attachment; filename="'.$fileName.'"',
        ]);
    }

    protected function billingPageProps(Request $request, string $activeTab = 'overview'): array
    {
        $account = $request->attributes->get('account') ?? current_account();
        $subscription = $account->subscription;
        $plan = $this->planResolver->getAccountPlan($account);
        $limits = $this->planResolver->getEffectiveLimits($account);
        $usage = $this->usageService->getCurrentUsage($account);
        $wallet = $this->walletService->getOrCreateWallet($account);
        $settingsService = app(PlatformSettingsService::class);
        $defaultCurrency = $settingsService->get('payment.default_currency', 'USD');

        $currentConnectionsCount = \App\Modules\WhatsApp\Models\WhatsAppConnection::where('account_id', $account->id)
            ->where('is_active', true)
            ->count();
        $currentAgentsCount = $account->users()
            ->where('users.is_platform_admin', false)
            ->count();

        $usageHistory = $this->usageService->getUsageHistory($account, 3);
        $blockedEvents = \App\Models\BillingEvent::where('account_id', $account->id)
            ->where('type', 'limit_blocked')
            ->orderBy('created_at', 'desc')
            ->limit(20)
            ->get()
            ->map(fn ($event) => [
                'id' => $event->id,
                'data' => $event->data,
                'created_at' => $event->created_at->toIso8601String(),
            ]);

        $payments = PaymentOrder::with('plan')
            ->where('account_id', $account->id)
            ->orderBy('created_at', 'desc')
            ->limit(50)
            ->get()
            ->map(fn (PaymentOrder $order) => [
                'id' => $order->id,
                'provider' => $order->provider,
                'payment_method' => $order->payment_method,
                'provider_order_id' => $order->provider_order_id,
                'provider_payment_id' => $order->provider_payment_id,
                'amount' => $order->amount,
                'currency' => $order->currency,
                'billing_cycle' => $order->billing_cycle ?? ($order->metadata['billing_cycle'] ?? null),
                'invoice_number' => $order->invoice_number,
                'discount_code' => $order->discount_code,
                'base_amount' => $order->base_amount,
                'discount_amount' => $order->discount_amount,
                'taxable_amount' => $order->taxable_amount,
                'tax_amount' => $order->tax_amount,
                'tax_rate' => (float) $order->tax_rate,
                'cgst_amount' => $order->cgst_amount,
                'sgst_amount' => $order->sgst_amount,
                'igst_amount' => $order->igst_amount,
                'tax_snapshot' => $order->tax_snapshot,
                'proof_uploaded_at' => $order->proof_uploaded_at?->toIso8601String(),
                'proof_original_name' => $order->proof_original_name,
                'has_proof' => (bool) $order->proof_path,
                'rejection_reason' => $order->rejection_reason,
                'metadata' => $order->metadata,
                'timeline' => is_array($order->metadata['timeline'] ?? null) ? $order->metadata['timeline'] : [],
                'status' => $order->status,
                'plan' => $order->plan ? [
                    'id' => $order->plan->id,
                    'name' => $order->plan->name,
                ] : null,
                'created_at' => $order->created_at->toIso8601String(),
                'paid_at' => $order->paid_at?->toIso8601String(),
                'failed_at' => $order->failed_at?->toIso8601String(),
            ]);

        $paymentTransactions = PaymentOrder::where('account_id', $account->id)
            ->orderByDesc('created_at')
            ->limit(100)
            ->get()
            ->map(fn (PaymentOrder $order) => [
                'type' => 'payment',
                'id' => $order->id,
                'direction' => 'credit',
                'amount_minor' => (int) $order->amount,
                'currency' => $order->currency,
                'status' => $order->status,
                'source' => 'subscription_payment',
                'reference' => $order->provider_order_id,
                'notes' => $order->payment_method ?: $order->provider_payment_id,
                'created_at' => $order->created_at->toIso8601String(),
            ]);

        $walletTransactions = WalletTransaction::where('account_id', $account->id)
            ->orderByDesc('created_at')
            ->limit(200)
            ->get()
            ->map(fn (WalletTransaction $tx) => [
                'type' => 'wallet',
                'id' => $tx->id,
                'direction' => $tx->direction,
                'amount_minor' => (int) $tx->amount_minor,
                'currency' => $tx->currency,
                'status' => $tx->status,
                'source' => $tx->source,
                'reference' => $tx->reference,
                'notes' => $tx->notes,
                'created_at' => $tx->created_at->toIso8601String(),
            ]);

        $transactions = $paymentTransactions
            ->concat($walletTransactions)
            ->sortByDesc('created_at')
            ->values()
            ->take(200)
            ->all();

        return array_merge([
            'active_tab' => $activeTab,
            'auto_checkout_plan_key' => $request->query('checkout_plan'),
            'account' => $account,
            'subscription' => $subscription ? [
                'id' => $subscription->id,
                'status' => $subscription->status,
                'provider' => $subscription->provider,
                'provider_ref' => $subscription->provider_ref,
                'provider_plan_ref' => $subscription->provider_plan_ref,
                'provider_status' => $subscription->provider_status,
                'trial_ends_at' => $subscription->trial_ends_at?->toIso8601String(),
                'current_period_start' => $subscription->current_period_start?->toIso8601String(),
                'current_period_end' => $subscription->current_period_end?->toIso8601String(),
                'cancel_at_period_end' => $subscription->cancel_at_period_end,
                'canceled_at' => $subscription->canceled_at?->toIso8601String(),
                'last_payment_at' => $subscription->last_payment_at?->toIso8601String(),
                'last_payment_failed_at' => $subscription->last_payment_failed_at?->toIso8601String(),
                'last_error' => $subscription->last_error,
                'discount_code' => $subscription->discount_code,
            ] : null,
            'plan' => $plan ? [
                'id' => $plan->id,
                'key' => $plan->key,
                'name' => $plan->name,
                'description' => $plan->description,
                'price_monthly' => $plan->price_monthly,
                'price_yearly' => $plan->price_yearly,
                'currency' => $defaultCurrency,
                'limits' => $limits,
                'modules' => $this->planResolver->getEffectiveModules($account),
            ] : null,
            'usage' => [
                'messages_sent' => $usage->messages_sent,
                'template_sends' => $usage->template_sends,
                'ai_credits_used' => $usage->ai_credits_used,
                'storage_bytes' => $usage->storage_bytes ?? 0,
            ],
            'current_usage' => [
                'messages_sent' => $usage->messages_sent,
                'template_sends' => $usage->template_sends,
                'ai_credits_used' => $usage->ai_credits_used,
                'storage_bytes' => $usage->storage_bytes ?? 0,
            ],
            'limits' => $limits,
            'usage_history' => $usageHistory,
            'blocked_events' => $blockedEvents,
            'payments' => $payments,
            'wallet' => [
                'balance_minor' => (int) $wallet->balance_minor,
                'currency' => $wallet->currency,
            ],
            'transactions' => $transactions,
            'billing_profile' => app(BillingTaxService::class)->customerProfile($account),
            'supplier_tax_profile' => app(BillingTaxService::class)->supplierProfile(),
            'current_connections_count' => $currentConnectionsCount,
            'current_agents_count' => $currentAgentsCount,
        ], $this->planListForAccount($account));
    }

    protected function resolvePlan(Plan|string|int $plan): Plan
    {
        if ($plan instanceof Plan) {
            return $plan;
        }

        // Try to resolve by key first (for slug-based URLs)
        $resolved = Plan::where('key', $plan)->first();
        if ($resolved) {
            return $resolved;
        }

        // Fallback to ID if numeric
        if (is_numeric($plan)) {
            return Plan::findOrFail((int) $plan);
        }

        // If still not found, try one more time with the exact value
        $resolved = Plan::where('key', $plan)->orWhere('id', $plan)->first();
        if ($resolved) {
            return $resolved;
        }

        throw new \Illuminate\Database\Eloquent\ModelNotFoundException(
            "No query results for model [App\Models\Plan] with key/id: {$plan}"
        );
    }

    protected function paymentOrderPayload(PaymentOrder $order): array
    {
        $provider = $this->providerManager->get('razorpay');
        $keyId = method_exists($provider, 'getKeyId') ? $provider->getKeyId() : null;

        return [
            'id' => $order->id,
            'provider' => $order->provider,
            'payment_method' => $order->payment_method,
            'provider_order_id' => $order->provider_order_id,
            'invoice_number' => $order->invoice_number,
            'discount_code' => $order->discount_code,
            'amount' => (int) $order->amount,
            'base_amount' => (int) $order->base_amount,
            'discount_amount' => (int) $order->discount_amount,
            'taxable_amount' => (int) $order->taxable_amount,
            'tax_amount' => (int) $order->tax_amount,
            'cgst_amount' => (int) $order->cgst_amount,
            'sgst_amount' => (int) $order->sgst_amount,
            'igst_amount' => (int) $order->igst_amount,
            'tax_rate' => (float) $order->tax_rate,
            'currency' => $order->currency,
            'status' => $order->status,
            'metadata' => $order->metadata,
            'timeline' => is_array($order->metadata['timeline'] ?? null) ? $order->metadata['timeline'] : [],
            'tax_snapshot' => $order->tax_snapshot,
            'plan' => $order->plan ? [
                'id' => $order->plan->id,
                'name' => $order->plan->name,
            ] : null,
            'razorpay' => $order->payment_method === 'razorpay' ? [
                'key_id' => is_string($keyId) ? trim($keyId) : null,
                'order_id' => $order->provider_order_id,
                'amount' => (int) $order->amount,
                'currency' => $order->currency,
                'checkout_brand' => $this->checkoutBrand(),
            ] : null,
        ];
    }

    protected function checkoutBrand(): array
    {
        $branding = app(BrandingService::class)->getAll();
        $image = $branding['logo_url'] ?: ($branding['favicon_url'] ?? null);

        if (is_string($image) && str_starts_with($image, '/')) {
            $image = url($image);
        }

        return [
            'name' => trim((string) ($branding['platform_name'] ?? '')) ?: 'Zyptos',
            'image' => $image,
        ];
    }

    protected function sendInvoiceEmailAfterResponse(PaymentOrder $order): void
    {
        app()->terminating(function () use ($order) {
            try {
                $freshOrder = $order->fresh(['account.owner', 'plan']);
                if ($freshOrder) {
                    app(\App\Services\BillingEmailService::class)->invoiceCreated($freshOrder);
                }
            } catch (\Throwable $exception) {
                \Log::warning('Deferred billing invoice email failed', [
                    'payment_order_id' => $order->id,
                    'error' => $exception->getMessage(),
                ]);
            }
        });
    }

    protected function canRenewSamePlan(?Subscription $subscription): bool
    {
        if (! $subscription) {
            return false;
        }

        if (in_array($subscription->status, ['past_due', 'canceled'], true)) {
            return true;
        }

        if (
            $subscription->status === 'trialing'
            && $subscription->trial_ends_at
            && $subscription->trial_ends_at->isPast()
        ) {
            return true;
        }

        return $subscription->status === 'active'
            && $subscription->current_period_end
            && $subscription->current_period_end->isPast();
    }

    protected function priceForBillingCycle(Plan $plan, string $billingCycle): int
    {
        return (int) ($billingCycle === 'yearly'
            ? ($plan->price_yearly ?? 0)
            : ($plan->price_monthly ?? 0));
    }

    protected function abortIfSelfServiceEnterprise(Plan $plan, Request $request): void
    {
        if (! $plan->requiresAdminApproval()) {
            return;
        }

        if ($request->user()?->isSuperAdmin()) {
            return;
        }

        abort(403, 'Enterprise plan activation requires platform admin approval.');
    }

    protected function enabledSelfHostedPaymentMethods(): array
    {
        $settings = app(PlatformSettingsService::class);
        $selfHostedEnabled = filter_var($settings->get('payment.self_hosted_payments_enabled', true), FILTER_VALIDATE_BOOLEAN);
        $razorpayProvider = $this->providerManager->get('razorpay');
        $razorpayEnabled = $selfHostedEnabled
            && filter_var($settings->get('payment.method_razorpay_enabled', true), FILTER_VALIDATE_BOOLEAN)
            && ($razorpayProvider?->isEnabled() ?? false);

        $methods = [
            [
                'key' => 'bank',
                'label' => 'Bank Transfer / UPI',
                'enabled' => $selfHostedEnabled && (
                    filter_var($settings->get('payment.method_bank_enabled', true), FILTER_VALIDATE_BOOLEAN)
                    || filter_var($settings->get('payment.method_upi_enabled', false), FILTER_VALIDATE_BOOLEAN)
                    || filter_var($settings->get('payment.method_manual_enabled', false), FILTER_VALIDATE_BOOLEAN)
                ),
            ],
            [
                'key' => 'razorpay',
                'label' => 'Razorpay one-time',
                'enabled' => $razorpayEnabled,
            ],
        ];

        return array_map(fn (array $method) => [
            ...$method,
            'enabled' => (bool) $method['enabled'],
        ], $methods);
    }
}
