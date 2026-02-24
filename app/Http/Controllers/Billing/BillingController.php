<?php

namespace App\Http\Controllers\Billing;

use App\Http\Controllers\Controller;
use App\Core\Billing\PlanResolver;
use App\Core\Billing\SubscriptionService;
use App\Core\Billing\UsageService;
use App\Core\Billing\MetaPricingResolver;
use App\Core\Billing\BillingProviderManager;
use App\Models\PaymentOrder;
use App\Models\Plan;
use App\Models\WalletTransaction;
use App\Models\WalletTopupOrder;
use App\Modules\WhatsApp\Models\WhatsAppMessageBilling;
use App\Services\PlatformSettingsService;
use App\Services\WalletService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class BillingController extends Controller
{
    public function __construct(
        protected PlanResolver $planResolver,
        protected SubscriptionService $subscriptionService,
        protected UsageService $usageService,
        protected MetaPricingResolver $metaPricingResolver,
        protected BillingProviderManager $providerManager,
        protected WalletService $walletService
    ) {}

    /**
     * Display billing overview.
     */
    public function index(Request $request): Response
    {
        $account = $request->attributes->get('account') ?? current_account();
        $subscription = $account->subscription;
        $plan = $this->planResolver->getAccountPlan($account);
        $limits = $this->planResolver->getEffectiveLimits($account);
        $usage = $this->usageService->getCurrentUsage($account);
        $metaBilling = $this->buildMetaBillingSummary($usage, $account);
        $wallet = $this->walletService->getOrCreateWallet($account);

        // Get current counts
        $currentConnectionsCount = \App\Modules\WhatsApp\Models\WhatsAppConnection::where('account_id', $account->id)
            ->where('is_active', true)
            ->count();

        $currentAgentsCount = $account->users()->count();
        
        // Get default currency from platform settings
        $settingsService = app(PlatformSettingsService::class);
        $defaultCurrency = $settingsService->get('payment.default_currency', 'USD');

        return Inertia::render('Billing/Index', [
            'account' => $account,
            'subscription' => $subscription ? [
                'id' => $subscription->id,
                'status' => $subscription->status,
                'trial_ends_at' => $subscription->trial_ends_at?->toIso8601String(),
                'current_period_end' => $subscription->current_period_end?->toIso8601String(),
                'cancel_at_period_end' => $subscription->cancel_at_period_end,
                'canceled_at' => $subscription->canceled_at?->toIso8601String(),
                'last_error' => $subscription->last_error] : null,
            'plan' => $plan ? [
                'id' => $plan->id,
                'key' => $plan->key,
                'name' => $plan->name,
                'description' => $plan->description,
                'price_monthly' => $plan->price_monthly,
                'price_yearly' => $plan->price_yearly,
                'currency' => $defaultCurrency, // Use platform default currency
                'limits' => $limits,
                'modules' => $this->planResolver->getEffectiveModules($account)] : null,
            'usage' => [
                'messages_sent' => $usage->messages_sent,
                'template_sends' => $usage->template_sends,
                'ai_credits_used' => $usage->ai_credits_used,
                'meta_conversations_free_used' => $usage->meta_conversations_free_used ?? 0,
                'meta_conversations_paid' => $usage->meta_conversations_paid ?? 0,
                'meta_conversations_marketing' => $usage->meta_conversations_marketing ?? 0,
                'meta_conversations_utility' => $usage->meta_conversations_utility ?? 0,
                'meta_conversations_authentication' => $usage->meta_conversations_authentication ?? 0,
                'meta_conversations_service' => $usage->meta_conversations_service ?? 0,
                'meta_estimated_cost_minor' => $usage->meta_estimated_cost_minor ?? 0,
            ],
            'meta_billing' => $metaBilling,
            'wallet' => [
                'balance_minor' => (int) $wallet->balance_minor,
                'currency' => $wallet->currency,
            ],
            'current_connections_count' => $currentConnectionsCount,
            'current_agents_count' => $currentAgentsCount]);
    }

    /**
     * Display available plans.
     */
    public function plans(Request $request): Response
    {
        $account = $request->attributes->get('account') ?? current_account();
        $currentPlan = $this->planResolver->getAccountPlan($account);
        $currentUsage = $this->usageService->getCurrentUsage($account);
        $currentLimits = $this->planResolver->getEffectiveLimits($account);
        $currentConnectionsCount = \App\Modules\WhatsApp\Models\WhatsAppConnection::where('account_id', $account->id)
            ->where('is_active', true)
            ->count();
        $currentAgentsCount = $account->users()->count();

        // Get default currency from platform settings
        $settingsService = app(PlatformSettingsService::class);
        $defaultCurrency = $settingsService->get('payment.default_currency', 'USD');
        
        $plans = Plan::where('is_public', true)
            ->where('is_active', true)
            ->orderBy('sort_order')
            ->get()
            ->map(function ($plan) use ($currentPlan, $currentUsage, $currentLimits, $defaultCurrency, $currentConnectionsCount, $currentAgentsCount) {
                $planLimits = $plan->limits ?? [];
                $warnings = [];

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
                    'trial_days' => $plan->trial_days,
                    'limits' => $planLimits,
                    'modules' => $plan->modules ?? [],
                    'is_current' => $currentPlan && $currentPlan->id === $plan->id,
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

        return Inertia::render('Billing/Plans', [
            'account' => $account,
            'plans' => $plans,
            'current_plan_key' => $currentPlan?->key,
            'current_modules' => $currentModules,
            'razorpay_enabled' => $razorpayEnabled,
            'razorpay_key_id' => $razorpayKeyId]);
    }

    /**
     * Switch account plan.
     */
    public function switchPlan(Request $request, $plan)
    {
        $account = $request->attributes->get('account') ?? current_account();
        
        // Plan is now resolved via route model binding (by key or ID)
        if (!$plan instanceof Plan) {
            $plan = $this->resolvePlan($plan);
        }

        // Only account owner can change plan
        if (!$account->isOwnedBy($request->user())) {
            if ($request->header('X-Inertia')) {
                return back()
                    ->withErrors(['plan' => 'Only the account owner can change the plan.'])
                    ->with('error', 'Only the account owner can change the plan.');
            }
            abort(403, 'Only account owner can change plan.');
        }

        $subscription = $account->subscription;
        $isNewSubscription = !$subscription;
        $currentPlan = $this->planResolver->getAccountPlan($account);

        if ($currentPlan && (int) $currentPlan->id === (int) $plan->id) {
            return redirect()->route('app.billing.plans')
                ->with('info', "You're already on the {$plan->name} plan.");
        }

        // For paid plans, require Razorpay checkout (redirect to create order)
        if (($plan->price_monthly ?? 0) > 0) {
            $razorpayProvider = $this->providerManager->get('razorpay');
            if (!$razorpayProvider || !$razorpayProvider->isEnabled()) {
                // Return error for Inertia requests
                return back()->withErrors([
                    'plan' => 'Payment gateway is not configured. Please contact support to enable payments for paid plans.'
                ])->with('error', 'Payment gateway is not configured. Please contact support.');
            }
            // For paid plans, user should use createRazorpayOrder endpoint
            // This endpoint is only for free plans
            return back()->withErrors([
                'plan' => 'Paid plans require payment checkout. Please use the checkout flow.'
            ])->with('error', 'Paid plans require payment checkout. Please use the checkout flow.');
        }

        // For free plans, allow direct switching (or initial subscription)
        try {
            if ($isNewSubscription && $plan->trial_days > 0) {
                // Start trial for new subscriptions with trial days
                $this->subscriptionService->startTrial($account, $plan, $request->user());
            } else {
                // Change plan (or create new subscription for accounts without one)
                $this->subscriptionService->changePlan($account, $plan, $request->user(), null);
            }
            
            \Log::info('Plan ' . ($isNewSubscription ? 'assigned' : 'changed') . ' successfully', [
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
                    'plan' => 'Failed to ' . ($isNewSubscription ? 'assign' : 'change') . ' plan: ' . $e->getMessage()
                ])->with('error', 'Failed to ' . ($isNewSubscription ? 'assign' : 'change') . ' plan: ' . $e->getMessage());
            }
            
            return redirect()->back()->with('error', 'Failed to ' . ($isNewSubscription ? 'assign' : 'change') . ' plan: ' . $e->getMessage());
        }

        // Redirect back to plans page or dashboard
        $successMessage = $isNewSubscription 
            ? 'Plan assigned successfully! You can now use all features.' 
            : 'Plan changed successfully.';
        
        if ($request->header('X-Inertia')) {
            return redirect()->route('app.billing.plans')
                ->with('success', $successMessage);
        }
        
        return redirect()->route('app.billing.plans')
            ->with('success', $successMessage);
    }

    /**
     * Create a Razorpay order for a plan.
     */
    public function createRazorpayOrder(Request $request, $plan = null)
    {
        $account = $request->attributes->get('account') ?? current_account();
        
        if (!$account) {
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

        if (!$account->isOwnedBy($request->user())) {
            if ($request->header('X-Inertia')) {
                return back()
                    ->withErrors(['plan' => 'Only the account owner can purchase a plan.'])
                    ->with('error', 'Only the account owner can purchase a plan.');
            }
            abort(403, 'Only account owner can purchase a plan.');
        }

        if (($plan->price_monthly ?? 0) <= 0) {
            abort(422, 'Plan is not billable.');
        }

        // Get default currency from platform settings
        $settingsService = app(PlatformSettingsService::class);
        $defaultCurrency = $settingsService->get('payment.default_currency', 'USD');
        
        // For Razorpay, only INR is supported
        if ($defaultCurrency !== 'INR') {
            abort(422, 'Razorpay only supports INR currency. Please set the platform default currency to INR in Platform Settings → Payment.');
        }

        $provider = $this->providerManager->get('razorpay');
        if (!$provider || !$provider->isEnabled() || !method_exists($provider, 'createOrder')) {
            \Log::error('Razorpay order creation failed - provider not available', [
                'provider_exists' => $provider !== null,
                'is_enabled' => $provider ? $provider->isEnabled() : false,
                'has_createOrder' => $provider && method_exists($provider, 'createOrder')]);
            abort(422, 'Razorpay is not available. Please ensure Razorpay is enabled and configured in platform settings.');
        }

        try {
            $orderData = $provider->createOrder($account, $plan, $request->user());
        } catch (\Exception $e) {
            \Log::error('Razorpay order creation failed', [
                'account_id' => $account->id,
                'plan_id' => $plan->id,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()]);
            abort(422, 'Failed to create payment order: ' . $e->getMessage());
        }

        $paymentOrder = PaymentOrder::create([
            'account_id' => $account->id,
            'plan_id' => $plan->id,
            'provider' => 'razorpay',
            'provider_order_id' => $orderData['id'],
            'amount' => (int) ($orderData['amount'] ?? $plan->price_monthly),
            'currency' => $orderData['currency'] ?? $defaultCurrency,
            'status' => 'created',
            'metadata' => [
                'order' => $orderData],
            'created_by' => $request->user()->id]);

        // Get the order amount from the Razorpay response (in paise)
        $orderAmount = (int) ($orderData['amount'] ?? $plan->price_monthly);

        $keyId = method_exists($provider, 'getKeyId') ? $provider->getKeyId() : null;
        if (is_string($keyId)) {
            $keyId = trim($keyId);
        }

        return response()->json([
            'order_id' => $paymentOrder->provider_order_id,
            'amount' => $orderAmount,
            'currency' => $paymentOrder->currency,
            'key_id' => $keyId,
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

        if (!$account->isOwnedBy($request->user())) {
            abort(403, 'Only account owner can confirm payment.');
        }

        $validated = $request->validate([
            'order_id' => 'required|string',
            'payment_id' => 'required|string',
            'signature' => 'required|string']);

        $provider = $this->providerManager->get('razorpay');
        if (!$provider || !$provider->isEnabled() || !method_exists($provider, 'getKeySecret')) {
            abort(422, 'Razorpay is not available.');
        }

        $secret = $provider->getKeySecret();
        $payload = $validated['order_id'] . '|' . $validated['payment_id'];
        $expected = hash_hmac('sha256', $payload, $secret);

        if (!hash_equals($expected, $validated['signature'])) {
            abort(400, 'Invalid payment signature.');
        }

        DB::transaction(function () use ($validated, $request, $account) {
            $paymentOrder = PaymentOrder::where('provider', 'razorpay')
                ->where('provider_order_id', $validated['order_id'])
                ->lockForUpdate()
                ->first();

            if (!$paymentOrder) {
                \Log::error('Payment order not found', [
                    'order_id' => $validated['order_id'],
                    'account_id' => $account->id,
                    'user_id' => $request->user()->id,
                ]);
                abort(404, 'Payment order not found.');
            }

            if ((int) ($paymentOrder->created_by ?? 0) !== (int) $request->user()->id) {
                abort(403, 'Payment does not belong to this user.');
            }

            if (!account_ids_match($paymentOrder->account_id, $account->id)) {
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
                !empty($paymentOrder->provider_payment_id) &&
                (string) $paymentOrder->provider_payment_id !== (string) $validated['payment_id']
            ) {
                abort(409, 'Payment order is already settled with a different payment id.');
            }

            $paymentOrder->update([
                'status' => 'paid',
                'provider_payment_id' => $validated['payment_id'],
                'paid_at' => now(),
            ]);

            $plan = Plan::find($paymentOrder->plan_id);
            if (!$plan) {
                abort(404, 'Plan not found.');
            }

            $this->subscriptionService->changePlan(
                $account,
                $plan,
                $request->user(),
                'razorpay',
                [
                    'payment_id' => $validated['payment_id'],
                    'order_id' => $validated['order_id'],
                    'paid_at' => now(),
                ]
            );
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

        if (!$account->isOwnedBy($request->user())) {
            abort(403, 'Only account owner can cancel subscription.');
        }

        $this->subscriptionService->cancelAtPeriodEnd($account, $request->user());

        return redirect()->back()->with('success', 'Subscription will be canceled at the end of the current period.');
    }

    /**
     * Resume subscription.
     */
    public function resume(Request $request)
    {
        $account = $request->attributes->get('account') ?? current_account();

        if (!$account->isOwnedBy($request->user())) {
            abort(403, 'Only account owner can resume subscription.');
        }

        $this->subscriptionService->resume($account, $request->user());

        return redirect()->back()->with('success', 'Subscription resumed.');
    }

    /**
     * Display usage details.
     */
    public function usage(Request $request): Response
    {
        $account = $request->attributes->get('account') ?? current_account();
        $usageHistory = $this->usageService->getUsageHistory($account, 3);
        $currentUsage = $this->usageService->getCurrentUsage($account);
        $limits = $this->planResolver->getEffectiveLimits($account);
        $metaBilling = $this->buildMetaBillingSummary($currentUsage, $account);

        // Get limit blocked events
        $blockedEvents = \App\Models\BillingEvent::where('account_id', $account->id)
            ->where('type', 'limit_blocked')
            ->orderBy('created_at', 'desc')
            ->limit(20)
            ->get()
            ->map(function ($event) {
                return [
                    'id' => $event->id,
                    'data' => $event->data,
                    'created_at' => $event->created_at->toIso8601String()];
            });

        return Inertia::render('Billing/Usage', [
            'account' => $account,
            'current_usage' => [
                'messages_sent' => $currentUsage->messages_sent,
                'template_sends' => $currentUsage->template_sends,
                'ai_credits_used' => $currentUsage->ai_credits_used,
                'meta_conversations_free_used' => $currentUsage->meta_conversations_free_used ?? 0,
                'meta_conversations_paid' => $currentUsage->meta_conversations_paid ?? 0,
                'meta_conversations_marketing' => $currentUsage->meta_conversations_marketing ?? 0,
                'meta_conversations_utility' => $currentUsage->meta_conversations_utility ?? 0,
                'meta_conversations_authentication' => $currentUsage->meta_conversations_authentication ?? 0,
                'meta_conversations_service' => $currentUsage->meta_conversations_service ?? 0,
                'meta_estimated_cost_minor' => $currentUsage->meta_estimated_cost_minor ?? 0,
            ],
            'meta_billing' => $metaBilling,
            'limits' => $limits,
            'usage_history' => $usageHistory,
            'blocked_events' => $blockedEvents]);
    }

    /**
     * Display payment history.
     */
    public function history(Request $request): Response
    {
        $account = $request->attributes->get('account') ?? current_account();

        $payments = PaymentOrder::with('plan')
            ->where('account_id', $account->id)
            ->orderBy('created_at', 'desc')
            ->limit(50)
            ->get()
            ->map(function (PaymentOrder $order) {
                return [
                    'id' => $order->id,
                    'provider' => $order->provider,
                    'provider_order_id' => $order->provider_order_id,
                    'provider_payment_id' => $order->provider_payment_id,
                    'amount' => $order->amount,
                    'currency' => $order->currency,
                    'status' => $order->status,
                    'plan' => $order->plan ? [
                        'id' => $order->plan->id,
                        'name' => $order->plan->name] : null,
                    'created_at' => $order->created_at->toIso8601String(),
                    'paid_at' => $order->paid_at?->toIso8601String(),
                    'failed_at' => $order->failed_at?->toIso8601String()];
            });

        return Inertia::render('Billing/History', [
            'account' => $account,
            'payments' => $payments]);
    }

    public function transactions(Request $request): Response
    {
        $account = $request->attributes->get('account') ?? current_account();
        $wallet = $this->walletService->getOrCreateWallet($account);

        $payments = PaymentOrder::where('account_id', $account->id)
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
                'notes' => $order->provider_payment_id,
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

        $transactions = $payments
            ->concat($walletTransactions)
            ->sortByDesc('created_at')
            ->values()
            ->take(200)
            ->all();

        return Inertia::render('Billing/Transactions', [
            'account' => $account,
            'wallet' => [
                'balance_minor' => (int) $wallet->balance_minor,
                'currency' => $wallet->currency,
            ],
            'transactions' => $transactions,
        ]);
    }

    public function walletTopup(Request $request)
    {
        $account = $request->attributes->get('account') ?? current_account();

        if (!$account->isOwnedBy($request->user())) {
            abort(403, 'Only account owner can top up wallet.');
        }

        $enabled = (bool) app(PlatformSettingsService::class)->get('payment.wallet_self_topup_enabled', false);
        if (!$enabled) {
            abort(403, 'Wallet self top-up is disabled by platform admin.');
        }

        $validated = $request->validate([
            'amount_minor' => 'required|integer|min:100|max:100000000',
            'notes' => 'nullable|string|max:255',
        ]);

        $provider = $this->providerManager->get('razorpay');
        if (!$provider || !$provider->isEnabled() || !method_exists($provider, 'createCustomOrder')) {
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
            receipt: "ws_{$account->id}_wallet_" . time(),
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

        if (!$account->isOwnedBy($request->user())) {
            abort(403, 'Only account owner can confirm wallet top-up.');
        }

        $enabled = (bool) app(PlatformSettingsService::class)->get('payment.wallet_self_topup_enabled', false);
        if (!$enabled) {
            abort(403, 'Wallet self top-up is disabled by platform admin.');
        }

        $validated = $request->validate([
            'order_id' => 'required|string',
            'payment_id' => 'required|string',
            'signature' => 'required|string',
        ]);

        $provider = $this->providerManager->get('razorpay');
        if (!$provider || !$provider->isEnabled() || !method_exists($provider, 'getKeySecret')) {
            abort(422, 'Razorpay is not available.');
        }

        $secret = $provider->getKeySecret();
        $payload = $validated['order_id'] . '|' . $validated['payment_id'];
        $expected = hash_hmac('sha256', $payload, $secret);

        if (!hash_equals($expected, $validated['signature'])) {
            abort(400, 'Invalid payment signature.');
        }

        DB::transaction(function () use ($validated, $request, $account): void {
            $order = WalletTopupOrder::where('provider', 'razorpay')
                ->where('provider_order_id', $validated['order_id'])
                ->lockForUpdate()
                ->first();

            if (!$order) {
                abort(404, 'Top-up order not found.');
            }

            if ((int) ($order->created_by ?? 0) !== (int) $request->user()->id) {
                abort(403, 'Top-up order does not belong to this user.');
            }

            if (!account_ids_match($order->account_id, $account->id)) {
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
                !empty($order->provider_payment_id) &&
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

    protected function buildMetaBillingSummary(\App\Models\AccountUsage $usage, ?\App\Models\Account $account = null): array
    {
        $settingsService = app(PlatformSettingsService::class);
        $freeTierLimit = (int) $settingsService->get('whatsapp.meta_billing.free_tier_limit', 1000);
        $resolvedPricing = $this->metaPricingResolver->resolve(now());
        $currency = strtoupper((string) ($resolvedPricing['currency'] ?? $settingsService->get('payment.default_currency', 'INR')));
        $pricePerConversationMinor = $resolvedPricing['rates'] ?? [];

        $freeUsed = (int) ($usage->meta_conversations_free_used ?? 0);
        $breakdown = collect();
        if ($account) {
            $periodStart = now()->startOfMonth();
            $periodEnd = now()->endOfMonth();

            $rows = WhatsAppMessageBilling::query()
                ->where('account_id', $account->id)
                ->whereBetween('created_at', [$periodStart, $periodEnd])
                ->select(
                    DB::raw('COALESCE(NULLIF(category, \'\'), \'uncategorized\') as category'),
                    'billable',
                    DB::raw('COUNT(*) as conversations_count'),
                    DB::raw('SUM(COALESCE(estimated_cost_minor, 0)) as estimated_cost_minor')
                )
                ->groupBy('category', 'billable')
                ->get();

            $categories = ['marketing', 'utility', 'authentication', 'service', 'uncategorized'];
            $breakdown = collect($categories)->map(function (string $category) use ($rows, $pricePerConversationMinor) {
                $freeRow = $rows->first(fn ($r) => (string) $r->category === $category && !(bool) $r->billable);
                $paidRow = $rows->first(fn ($r) => (string) $r->category === $category && (bool) $r->billable);

                return [
                    'category' => $category,
                    'free_count' => (int) ($freeRow->conversations_count ?? 0),
                    'paid_count' => (int) ($paidRow->conversations_count ?? 0),
                    'rate_minor' => (int) ($pricePerConversationMinor[$category] ?? 0),
                    'estimated_cost_minor' => (int) ($paidRow->estimated_cost_minor ?? 0),
                ];
            })->values();
        }

        return [
            'free_tier_limit' => $freeTierLimit,
            'free_tier_used' => $freeUsed,
            'free_tier_remaining' => max(0, $freeTierLimit - $freeUsed),
            'estimated_cost_minor' => (int) ($usage->meta_estimated_cost_minor ?? 0),
            'currency' => $currency,
            'price_per_conversation_minor' => $pricePerConversationMinor,
            'pricing_source' => $resolvedPricing['source'] ?? 'legacy_settings',
            'pricing_country_code' => $resolvedPricing['country_code'] ?? null,
            'pricing_version' => $resolvedPricing['version'] ? [
                'id' => $resolvedPricing['version']->id,
                'country_code' => $resolvedPricing['version']->country_code,
                'currency' => $resolvedPricing['version']->currency,
                'effective_from' => $resolvedPricing['version']->effective_from?->toIso8601String(),
                'effective_to' => $resolvedPricing['version']->effective_to?->toIso8601String(),
                'notes' => $resolvedPricing['version']->notes,
            ] : null,
            'category_breakdown' => $breakdown->all(),
            'note' => 'Meta bills WhatsApp conversations separately. Values shown here are webhook-based estimates and can differ from your official Meta invoice.',
        ];
    }
}
