<?php

namespace App\Http\Controllers\Billing;

use App\Http\Controllers\Controller;
use App\Core\Billing\PlanResolver;
use App\Core\Billing\SubscriptionService;
use App\Core\Billing\UsageService;
use App\Core\Billing\BillingProviderManager;
use App\Models\PaymentOrder;
use App\Models\Plan;
use App\Models\Account;
use App\Services\PlatformSettingsService;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class BillingController extends Controller
{
    public function __construct(
        protected PlanResolver $planResolver,
        protected SubscriptionService $subscriptionService,
        protected UsageService $usageService,
        protected BillingProviderManager $providerManager
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
                'ai_credits_used' => $usage->ai_credits_used],
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

        // Get default currency from platform settings
        $settingsService = app(PlatformSettingsService::class);
        $defaultCurrency = $settingsService->get('payment.default_currency', 'USD');
        
        $plans = Plan::where('is_public', true)
            ->where('is_active', true)
            ->orderBy('sort_order')
            ->get()
            ->map(function ($plan) use ($currentPlan, $currentUsage, $currentLimits, $defaultCurrency) {
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
                                    default => 0,
                                };
                                if ($currentValue > $limit) {
                                    $warnings[] = "Your current {$key} usage ({$currentValue}) exceeds the {$plan->name} plan limit ({$limit}).";
                                }
                            }
                        }
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

        $paymentOrder = PaymentOrder::where('provider', 'razorpay')
            ->where('provider_order_id', $validated['order_id'])
            ->first();

        if (!$paymentOrder) {
            \Log::error('Payment order not found', [
                'order_id' => $validated['order_id'],
                'account_id' => $account->id,
                'user_id' => $request->user()->id,
            ]);
            abort(404, 'Payment order not found.');
        }

        // Check if payment belongs to this account (with type casting for safety)
        if (!account_ids_match($paymentOrder->account_id, $account->id)) {
            \Log::error('Payment order account mismatch', [
                'payment_order_id' => $paymentOrder->id,
                'payment_order_account_id' => $paymentOrder->account_id,
                'current_account_id' => $account->id,
                'order_id' => $validated['order_id'],
                'user_id' => $request->user()->id,
                'payment_created_by' => $paymentOrder->created_by,
            ]);
            
            // Check if the user owns the account that the payment order belongs to
            $paymentOrderAccount = Account::find($paymentOrder->account_id);
            if ($paymentOrderAccount && $paymentOrderAccount->isOwnedBy($request->user())) {
                // User owns the account that the payment was created for
                // Update the current account context to match the payment order
                $account = $paymentOrderAccount;
                session(['current_account_id' => $account->id]);
                \Log::info('Account context updated to match payment order', [
                    'account_id' => $account->id,
                    'user_id' => $request->user()->id,
                ]);
            } else {
                abort(403, 'Payment does not belong to this account.');
            }
        }

        if ($paymentOrder->status !== 'paid') {
            $paymentOrder->update([
                'status' => 'paid',
                'provider_payment_id' => $validated['payment_id'],
                'paid_at' => now()]);
        }

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
                'paid_at' => now()]
        );

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
                'ai_credits_used' => $currentUsage->ai_credits_used],
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
}
