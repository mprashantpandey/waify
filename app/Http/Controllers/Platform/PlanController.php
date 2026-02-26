<?php

namespace App\Http\Controllers\Platform;

use App\Http\Controllers\Controller;
use App\Core\Billing\SubscriptionService;
use App\Models\Plan;
use App\Models\Subscription;
use App\Models\Account;
use App\Services\PlatformSettingsService;
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
                    'subscriptions_count' => $plan->subscriptions()->count()];
            });

        return Inertia::render('Platform/Plans/Index', [
            'plans' => $plans,
            'default_currency' => $defaultCurrency]);
    }

    /**
     * Show the form for creating a new plan.
     */
    public function create(): Response
    {
        $modules = \App\Models\Module::orderBy('name')->get(['id', 'key', 'name']);
        
        // Get default currency from platform settings
        $settingsService = app(PlatformSettingsService::class);
        $defaultCurrency = $settingsService->get('payment.default_currency', 'USD');

        return Inertia::render('Platform/Plans/Create', [
            'modules' => $modules,
            'default_currency' => $defaultCurrency]);
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

        Plan::create($validated);

        return redirect()->route('platform.plans.index')
            ->with('success', 'Plan created successfully.');
    }

    /**
     * Display the specified plan.
     */
    public function show($plan): Response
    {
        $plan->load('subscriptions.account');

        // Fetch all modules from database to get accurate names
        $modules = \App\Models\Module::all()->keyBy('key');
        $moduleNames = $modules->mapWithKeys(function ($module) {
            return [$module->key => $module->name];
        })->toArray();

        // Normalize old module keys to new ones for display
        $normalizedModules = $this->normalizeModuleKeys($plan->modules ?? []);

        // Get default currency from platform settings
        $settingsService = app(PlatformSettingsService::class);
        $defaultCurrency = $settingsService->get('payment.default_currency', 'USD');
        
        return Inertia::render('Platform/Plans/Show', [
            'plan' => [
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
                'limits' => $plan->limits,
                'modules' => $normalizedModules,
                'subscriptions' => $plan->subscriptions->map(function ($sub) {
                    return [
                        'id' => $sub->id,
                        'account' => [
                            'id' => $sub->account->id,
                            'name' => $sub->account->name,
                            'slug' => $sub->account->slug],
                        'status' => $sub->status,
                        'started_at' => $sub->started_at->toIso8601String()];
                })],
            'moduleNames' => $moduleNames,
            'default_currency' => $defaultCurrency]);
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
     * Show the form for editing the specified plan.
     */
    public function edit($plan): Response
    {
        $modules = \App\Models\Module::orderBy('name')->get(['id', 'key', 'name']);

        // Normalize old module keys to new ones
        $normalizedModules = $this->normalizeModuleKeys($plan->modules ?? []);

        // Get default currency from platform settings
        $settingsService = app(PlatformSettingsService::class);
        $defaultCurrency = $settingsService->get('payment.default_currency', 'USD');
        
        return Inertia::render('Platform/Plans/Edit', [
            'plan' => [
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
                'limits' => $plan->limits,
                'modules' => $normalizedModules],
            'modules' => $modules,
            'default_currency' => $defaultCurrency]);
    }

    /**
     * Update the specified plan.
     */
    public function update(Request $request, $plan)
    {
        $validated = $request->validate([
            'key' => 'required|string|max:255|unique:plans,key,' . $plan->id,
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

        return redirect()->route('platform.plans.index')
            ->with('success', 'Plan updated successfully.');
    }

    /**
     * Toggle plan active status.
     */
    public function toggle($plan)
    {
        $plan->update(['is_active' => !$plan->is_active]);

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
            ->through(function ($subscription) {
                $account = $subscription->account;
                $plan = $subscription->plan;
                $usageService = app(\App\Core\Billing\UsageService::class);
                $currentUsage = $account ? $usageService->getCurrentUsage($account) : null;

                return [
                    'id' => $subscription->id,
                    'slug' => $subscription->slug,
                    'account' => $account ? [
                        'id' => $account->id,
                        'name' => $account->name,
                        'slug' => $account->slug] : [
                        'id' => null,
                        'name' => 'Missing account',
                        'slug' => null],
                    'plan' => $plan ? [
                        'key' => $plan->key,
                        'name' => $plan->name] : [
                        'key' => 'missing',
                        'name' => 'Missing plan'],
                    'status' => $subscription->status,
                    'trial_ends_at' => $subscription->trial_ends_at?->toIso8601String(),
                    'current_period_end' => $subscription->current_period_end?->toIso8601String(),
                    'usage' => [
                        'messages_sent' => (int) ($currentUsage->messages_sent ?? 0),
                        'template_sends' => (int) ($currentUsage->template_sends ?? 0)],
                    'started_at' => $subscription->started_at->toIso8601String()];
            });

        return Inertia::render('Platform/Subscriptions/Index', [
            'subscriptions' => $subscriptions,
            'filters' => [
                'status' => $request->status]]);
    }

    /**
     * Display a specific subscription.
     */
    public function showSubscription(Subscription $subscription): Response
    {
        $subscription->load(['account', 'plan']);
        $account = $subscription->account;
        $plan = $subscription->plan;
        if (! $account) {
            abort(404, 'Subscription account not found.');
        }
        
        $usageService = app(\App\Core\Billing\UsageService::class);
        $currentUsage = $usageService->getCurrentUsage($account);
        
        $planResolver = app(\App\Core\Billing\PlanResolver::class);
        $limits = $planResolver->getEffectiveLimits($account);

        return Inertia::render('Platform/Subscriptions/Show', [
            'subscription' => [
                'id' => $subscription->id,
                'slug' => $subscription->slug,
                'account' => [
                    'id' => $account->id,
                    'name' => $account->name,
                    'slug' => $account->slug],
                'plan' => $plan ? [
                    'key' => $plan->key,
                    'name' => $plan->name] : null,
                'status' => $subscription->status,
                'trial_ends_at' => $subscription->trial_ends_at?->toIso8601String(),
                'current_period_start' => $subscription->current_period_start?->toIso8601String(),
                'current_period_end' => $subscription->current_period_end?->toIso8601String(),
                'cancel_at_period_end' => $subscription->cancel_at_period_end,
                'canceled_at' => $subscription->canceled_at?->toIso8601String(),
                'started_at' => $subscription->started_at->toIso8601String(),
                'usage' => [
                    'messages_sent' => $currentUsage->messages_sent,
                    'template_sends' => $currentUsage->template_sends,
                    'ai_credits_used' => $currentUsage->ai_credits_used],
                'limits' => $limits]]);
    }
}
