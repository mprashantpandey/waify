<?php

namespace App\Http\Controllers\Platform;

use App\Http\Controllers\Controller;
use App\Core\Billing\SubscriptionService;
use App\Models\Plan;
use App\Models\Subscription;
use App\Models\Workspace;
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
        $plans = Plan::orderBy('sort_order')
            ->get()
            ->map(function ($plan) {
                return [
                    'id' => $plan->id,
                    'key' => $plan->key,
                    'name' => $plan->name,
                    'description' => $plan->description,
                    'price_monthly' => $plan->price_monthly,
                    'price_yearly' => $plan->price_yearly,
                    'currency' => $plan->currency,
                    'is_active' => $plan->is_active,
                    'is_public' => $plan->is_public,
                    'trial_days' => $plan->trial_days,
                    'sort_order' => $plan->sort_order,
                    'subscriptions_count' => $plan->subscriptions()->count(),
                ];
            });

        return Inertia::render('Platform/Plans/Index', [
            'plans' => $plans,
        ]);
    }

    /**
     * Show the form for creating a new plan.
     */
    public function create(): Response
    {
        $modules = \App\Models\Module::orderBy('name')->get(['id', 'key', 'name']);

        return Inertia::render('Platform/Plans/Create', [
            'modules' => $modules,
        ]);
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
            'currency' => 'required|string|max:3',
            'is_active' => 'boolean',
            'is_public' => 'boolean',
            'trial_days' => 'integer|min:0',
            'sort_order' => 'integer',
            'limits' => 'required|array',
            'modules' => 'required|array',
        ]);

        // Ensure limits and modules are properly formatted
        $validated['limits'] = $validated['limits'] ?? [];
        $validated['modules'] = $validated['modules'] ?? [];

        Plan::create($validated);

        return redirect()->route('platform.plans.index')
            ->with('success', 'Plan created successfully.');
    }

    /**
     * Display the specified plan.
     */
    public function show($plan): Response
    {
        $plan->load('subscriptions.workspace');

        // Fetch all modules from database to get accurate names
        $modules = \App\Models\Module::all()->keyBy('key');
        $moduleNames = $modules->mapWithKeys(function ($module) {
            return [$module->key => $module->name];
        })->toArray();

        // Normalize old module keys to new ones for display
        $normalizedModules = $this->normalizeModuleKeys($plan->modules ?? []);

        return Inertia::render('Platform/Plans/Show', [
            'plan' => [
                'id' => $plan->id,
                'key' => $plan->key,
                'name' => $plan->name,
                'description' => $plan->description,
                'price_monthly' => $plan->price_monthly,
                'price_yearly' => $plan->price_yearly,
                'currency' => $plan->currency,
                'is_active' => $plan->is_active,
                'is_public' => $plan->is_public,
                'trial_days' => $plan->trial_days,
                'sort_order' => $plan->sort_order,
                'limits' => $plan->limits,
                'modules' => $normalizedModules,
                'subscriptions' => $plan->subscriptions->map(function ($sub) {
                    return [
                        'id' => $sub->id,
                        'workspace' => [
                            'id' => $sub->workspace->id,
                            'name' => $sub->workspace->name,
                            'slug' => $sub->workspace->slug,
                        ],
                        'status' => $sub->status,
                        'started_at' => $sub->started_at->toIso8601String(),
                    ];
                }),
            ],
            'moduleNames' => $moduleNames,
        ]);
    }

    /**
     * Normalize old module keys to new module keys.
     */
    protected function normalizeModuleKeys(array $moduleKeys): array
    {
        $keyMap = [
            'whatsapp' => 'whatsapp.cloud',
            'chatbots' => 'automation.chatbots',
        ];

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

        return Inertia::render('Platform/Plans/Edit', [
            'plan' => [
                'id' => $plan->id,
                'key' => $plan->key,
                'name' => $plan->name,
                'description' => $plan->description,
                'price_monthly' => $plan->price_monthly,
                'price_yearly' => $plan->price_yearly,
                'currency' => $plan->currency,
                'is_active' => $plan->is_active,
                'is_public' => $plan->is_public,
                'trial_days' => $plan->trial_days,
                'sort_order' => $plan->sort_order,
                'limits' => $plan->limits,
                'modules' => $normalizedModules,
            ],
            'modules' => $modules,
        ]);
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
            'currency' => 'required|string|max:3',
            'is_active' => 'boolean',
            'is_public' => 'boolean',
            'trial_days' => 'integer|min:0',
            'sort_order' => 'integer',
            'limits' => 'required|array',
            'modules' => 'required|array',
        ]);

        // Ensure limits and modules are properly formatted
        $validated['limits'] = $validated['limits'] ?? [];
        
        // Normalize module keys to ensure we're using the new keys
        $validated['modules'] = $this->normalizeModuleKeys($validated['modules'] ?? []);

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
        $query = Subscription::with(['workspace', 'plan']);

        if ($request->has('status') && $request->status) {
            $query->where('status', $request->status);
        }

        $subscriptions = $query->orderBy('created_at', 'desc')
            ->paginate(20)
            ->through(function ($subscription) {
                $workspace = $subscription->workspace;
                $usageService = app(\App\Core\Billing\UsageService::class);
                $currentUsage = $usageService->getCurrentUsage($workspace);

                return [
                    'id' => $subscription->id,
                    'slug' => $subscription->slug,
                    'workspace' => [
                        'id' => $workspace->id,
                        'name' => $workspace->name,
                        'slug' => $workspace->slug,
                    ],
                    'plan' => [
                        'key' => $subscription->plan->key,
                        'name' => $subscription->plan->name,
                    ],
                    'status' => $subscription->status,
                    'trial_ends_at' => $subscription->trial_ends_at?->toIso8601String(),
                    'current_period_end' => $subscription->current_period_end?->toIso8601String(),
                    'usage' => [
                        'messages_sent' => $currentUsage->messages_sent,
                        'template_sends' => $currentUsage->template_sends,
                    ],
                    'started_at' => $subscription->started_at->toIso8601String(),
                ];
            });

        return Inertia::render('Platform/Subscriptions/Index', [
            'subscriptions' => $subscriptions,
            'filters' => [
                'status' => $request->status,
            ],
        ]);
    }

    /**
     * Display a specific subscription.
     */
    public function showSubscription(Subscription $subscription): Response
    {
        $subscription->load(['workspace', 'plan']);
        $workspace = $subscription->workspace;
        
        $usageService = app(\App\Core\Billing\UsageService::class);
        $currentUsage = $usageService->getCurrentUsage($workspace);
        
        $planResolver = app(\App\Core\Billing\PlanResolver::class);
        $limits = $planResolver->getEffectiveLimits($workspace);

        return Inertia::render('Platform/Subscriptions/Show', [
            'subscription' => [
                'id' => $subscription->id,
                'slug' => $subscription->slug,
                'workspace' => [
                    'id' => $workspace->id,
                    'name' => $workspace->name,
                    'slug' => $workspace->slug,
                ],
                'plan' => [
                    'key' => $subscription->plan->key,
                    'name' => $subscription->plan->name,
                ],
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
                    'ai_credits_used' => $currentUsage->ai_credits_used,
                ],
                'limits' => $limits,
            ],
        ]);
    }
}
