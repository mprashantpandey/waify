<?php

namespace App\Http\Controllers\Platform;

use App\Core\Billing\SubscriptionService;
use App\Http\Controllers\Controller;
use App\Models\Plan;
use App\Models\Subscription;
use App\Services\PlatformSettingsService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class PlanController extends Controller
{
    public function __construct(
        protected SubscriptionService $subscriptionService
    ) {}

    /**
     * Display a listing of plans.
     */
    public function index(Request $request): Response
    {
        // Get default currency from platform settings
        $settingsService = app(PlatformSettingsService::class);
        $defaultCurrency = $settingsService->get('payment.default_currency', 'USD');

        $plans = Plan::orderBy('sort_order')
            ->get()
            ->map(function ($plan) use ($defaultCurrency) {
                return [
                    'id' => $plan->id,
                    'key' => $plan->key,
                    'name' => $plan->name,
                    'description' => $plan->description,
                    'price_monthly' => $plan->price_monthly,
                    'price_yearly' => $plan->price_yearly,
                    'currency' => $defaultCurrency, // Use platform default currency
                    'is_active' => $plan->is_active,
                    'is_public' => $plan->is_public,
                    'trial_days' => $plan->trial_days,
                    'sort_order' => $plan->sort_order,
                    'limits' => $plan->limits ?? [],
                    'modules' => $this->normalizeModuleKeys($plan->modules ?? []),
                    'subscriptions_count' => $plan->subscriptions()->count()];
            });

        return Inertia::render('Platform/Plans/Index', [
            'plans' => $plans,
            'modules' => \App\Models\Module::orderBy('name')->get(['id', 'key', 'name']),
            'moduleNames' => \App\Models\Module::query()->pluck('name', 'key')->toArray(),
            'selectedPlan' => $this->selectedPlanPayload($request),
            'default_currency' => $defaultCurrency]);
    }

    protected function selectedPlanPayload(Request $request): ?array
    {
        if (! $request->filled('plan')) {
            return null;
        }

        $plan = Plan::where('key', $request->input('plan'))
            ->orWhere('id', $request->input('plan'))
            ->with('subscriptions.account')
            ->first();

        if (! $plan) {
            return null;
        }

        $settingsService = app(PlatformSettingsService::class);
        $defaultCurrency = $settingsService->get('payment.default_currency', 'USD');

        return $this->planPayload($plan, $defaultCurrency, true);
    }

    protected function planPayload(Plan $plan, string $defaultCurrency, bool $withSubscriptions = false): array
    {
        $payload = [
            'id' => $plan->id,
            'key' => $plan->key,
            'name' => $plan->name,
            'description' => $plan->description,
            'price_monthly' => $plan->price_monthly,
            'price_yearly' => $plan->price_yearly,
            'currency' => $defaultCurrency,
            'is_active' => $plan->is_active,
            'is_public' => $plan->is_public,
            'trial_days' => $plan->trial_days,
            'sort_order' => $plan->sort_order,
            'limits' => $plan->limits ?? [],
            'modules' => $this->normalizeModuleKeys($plan->modules ?? []),
            'subscriptions_count' => $plan->subscriptions()->count(),
        ];

        if ($withSubscriptions) {
            $payload['subscriptions'] = $plan->subscriptions->map(function ($sub) {
                return [
                    'id' => $sub->id,
                    'account' => [
                        'id' => $sub->account->id,
                        'name' => $sub->account->name,
                        'slug' => $sub->account->slug],
                    'status' => $sub->status,
                    'started_at' => $sub->started_at?->toIso8601String()];
            });
        }

        return $payload;
    }

    /**
     * Store a newly created plan.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'key' => 'required|string|max:255|unique:plans,key',
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'price_monthly' => 'nullable|integer|min:0',
            'price_yearly' => 'nullable|integer|min:0',
            'is_active' => 'boolean',
            'is_public' => 'boolean',
            'trial_days' => 'integer|min:0',
            'sort_order' => 'integer',
            'limits' => 'required|array',
            'modules' => 'required|array']);

        // Get default currency from platform settings
        $settingsService = app(PlatformSettingsService::class);
        $defaultCurrency = $settingsService->get('payment.default_currency', 'USD');

        // Ensure limits and modules are properly formatted
        $validated['limits'] = $validated['limits'] ?? [];
        $validated['modules'] = $validated['modules'] ?? [];
        $validated['currency'] = $defaultCurrency; // Use platform default currency

        $plan = Plan::create($validated);

        return redirect()->route('platform.plans.index', ['plan' => $plan->key])
            ->with('success', 'Plan created successfully.');
    }

    /**
     * Normalize old module keys to new module keys.
     */
    protected function normalizeModuleKeys(array $moduleKeys): array
    {
        $keyMap = [
            'whatsapp' => 'whatsapp.cloud',
            'chatbots' => 'automation.chatbots'];

        return array_map(function ($key) use ($keyMap) {
            return $keyMap[$key] ?? $key;
        }, $moduleKeys);
    }

    /**
     * Update the specified plan.
     */
    public function update(Request $request, Plan $plan)
    {
        $validated = $request->validate([
            'key' => 'required|string|max:255|unique:plans,key,'.$plan->id,
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'price_monthly' => 'nullable|integer|min:0',
            'price_yearly' => 'nullable|integer|min:0',
            'is_active' => 'boolean',
            'is_public' => 'boolean',
            'trial_days' => 'integer|min:0',
            'sort_order' => 'integer',
            'limits' => 'required|array',
            'modules' => 'required|array']);

        // Get default currency from platform settings
        $settingsService = app(PlatformSettingsService::class);
        $defaultCurrency = $settingsService->get('payment.default_currency', 'USD');

        // Ensure limits and modules are properly formatted
        $validated['limits'] = $validated['limits'] ?? [];

        // Normalize module keys to ensure we're using the new keys
        $validated['modules'] = $this->normalizeModuleKeys($validated['modules'] ?? []);

        // Always use platform default currency
        $validated['currency'] = $defaultCurrency;

        $plan->update($validated);

        return redirect()->route('platform.plans.index', ['plan' => $plan->key])
            ->with('success', 'Plan updated successfully.');
    }

    /**
     * Toggle plan active status.
     */
    public function toggle(Plan $plan)
    {
        $plan->update(['is_active' => ! $plan->is_active]);

        return redirect()->back()->with('success', 'Plan status updated.');
    }

    /**
     * Display subscriptions overview.
     */
    public function subscriptions(Request $request): Response
    {
        $query = Subscription::with(['account', 'plan']);

        if ($request->has('status') && $request->status) {
            $query->where('status', $request->status);
        }

        $subscriptions = $query->orderBy('created_at', 'desc')
            ->paginate(20)
            ->through(fn (Subscription $subscription) => $this->subscriptionPayload($subscription));

        return Inertia::render('Platform/Subscriptions/Index', [
            'subscriptions' => $subscriptions,
            'filters' => [
                'status' => $request->status],
            'selectedSubscription' => $this->selectedSubscriptionPayload($request)]);
    }

    public function cancelSubscription(Request $request, Subscription $subscription): RedirectResponse
    {
        try {
            $this->assertCurrentSubscription($subscription);
            $this->subscriptionService->cancelAtPeriodEnd($subscription->account, $request->user(), $request->boolean('immediately'));
        } catch (\Throwable $exception) {
            return redirect()->back()->with('error', $exception->getMessage());
        }

        return redirect()->back()->with('success', $request->boolean('immediately')
            ? 'Subscription canceled immediately.'
            : 'Subscription scheduled to cancel at period end.');
    }

    protected function selectedSubscriptionPayload(Request $request): ?array
    {
        if (! $request->filled('subscription')) {
            return null;
        }

        $subscription = Subscription::with(['account', 'plan'])
            ->where('slug', $request->input('subscription'))
            ->orWhere('id', $request->input('subscription'))
            ->first();

        return $subscription ? $this->subscriptionPayload($subscription) : null;
    }

    protected function subscriptionPayload(Subscription $subscription): array
    {
        $account = $subscription->account;
        $usageService = app(\App\Core\Billing\UsageService::class);
        $currentUsage = $usageService->getCurrentUsage($account);
        return [
            'id' => $subscription->id,
            'slug' => $subscription->slug,
            'account' => [
                'id' => $account->id,
                'name' => $account->name,
                'slug' => $account->slug],
            'plan' => [
                'key' => $subscription->plan->key,
                'name' => $subscription->plan->name],
            'status' => $subscription->status,
            'trial_ends_at' => $subscription->trial_ends_at?->toIso8601String(),
            'current_period_start' => $subscription->current_period_start?->toIso8601String(),
            'current_period_end' => $subscription->current_period_end?->toIso8601String(),
            'cancel_at_period_end' => $subscription->cancel_at_period_end,
            'canceled_at' => $subscription->canceled_at?->toIso8601String(),
            'started_at' => $subscription->started_at?->toIso8601String(),
            'provider' => $subscription->provider,
            'provider_ref' => $subscription->provider_ref,
            'provider_plan_ref' => $subscription->provider_plan_ref,
            'provider_customer_ref' => $subscription->provider_customer_ref,
            'provider_status' => $subscription->provider_status,
            'discount_code' => $subscription->discount_code,
            'last_payment_at' => $subscription->last_payment_at?->toIso8601String(),
            'last_payment_failed_at' => $subscription->last_payment_failed_at?->toIso8601String(),
            'last_error' => $subscription->last_error,
            'is_razorpay_paid' => $subscription->provider === 'razorpay' && filled($subscription->provider_ref),
            'usage' => [
                'messages_sent' => $currentUsage->messages_sent,
                'template_sends' => $currentUsage->template_sends],
        ];
    }

    protected function assertCurrentSubscription(Subscription $subscription): void
    {
        $subscription->loadMissing('account.subscription');

        if (! $subscription->account) {
            throw new \InvalidArgumentException('Subscription workspace was not found.');
        }

        if ((int) $subscription->account->subscription?->id !== (int) $subscription->id) {
            throw new \InvalidArgumentException('This is not the workspace current subscription.');
        }
    }
}
