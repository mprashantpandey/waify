<?php

namespace App\Http\Controllers;

use App\Models\Account;
use App\Models\Plan;
use App\Core\Billing\SubscriptionService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

class OnboardingController extends Controller
{
    /**
     * Show the onboarding page.
     */
    public function create(): Response
    {
        $settingsService = app(\App\Services\PlatformSettingsService::class);
        
        if (!$settingsService->isFeatureEnabled('account_creation')) {
            abort(403, 'Account creation is currently disabled.');
        }
        
        // Get available public plans for selection
        $plans = Plan::where('is_public', true)
            ->where('is_active', true)
            ->orderBy('sort_order')
            ->orderBy('price_monthly')
            ->get()
            ->map(function ($plan) use ($settingsService) {
                $defaultCurrency = $settingsService->get('payment.default_currency', 'USD');
                return [
                    'id' => $plan->id,
                    'key' => $plan->key,
                    'name' => $plan->name,
                    'description' => $plan->description,
                    'price_monthly' => $plan->price_monthly,
                    'price_yearly' => $plan->price_yearly,
                    'currency' => $defaultCurrency,
                    'trial_days' => $plan->trial_days ?? 0,
                    'limits' => $plan->limits ?? [],
                    'modules' => $plan->modules ?? [],
                ];
            });
        
        // Get default plan key from session or env
        $defaultPlanKey = session('selected_plan_key') ?? env('DEFAULT_PLAN_KEY', 'free');
        
        return Inertia::render('Onboarding', [
            'plans' => $plans,
            'defaultPlanKey' => $defaultPlanKey,
        ]);
    }

    /**
     * Store a newly created account.
     */
    public function store(Request $request)
    {
        $settingsService = app(\App\Services\PlatformSettingsService::class);
        
        if (!$settingsService->isFeatureEnabled('account_creation')) {
            abort(403, 'Account creation is currently disabled.');
        }
        
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'plan_key' => 'nullable|string|exists:plans,key']);

        $user = Auth::user();

        $account = Account::create([
            'name' => $validated['name'],
            'slug' => Account::generateSlug($validated['name']),
            'owner_id' => $user->id]);

        // Note: Owner is not added to account_users table - they're identified by owner_id
        // Only non-owner members are added to account_users table

        // Enable core modules by default
        $coreModules = \App\Models\Module::where('is_core', true)->get();
        foreach ($coreModules as $module) {
            \App\Models\AccountModule::create([
                'account_id' => $account->id,
                'module_key' => $module->key,
                'enabled' => true]);
        }

        // Auto-subscribe to selected plan or default plan
        $selectedPlanKey = $validated['plan_key'] 
            ?? session('selected_plan_key') 
            ?? env('DEFAULT_PLAN_KEY', 'free');
        
        // Try to find the selected plan (must be active and public)
        $selectedPlan = Plan::where('key', $selectedPlanKey)
            ->where('is_active', true)
            ->where('is_public', true)
            ->first();
        
        // Fallback 1: Try default plan key from env (without public check)
        if (!$selectedPlan) {
            $defaultPlanKey = env('DEFAULT_PLAN_KEY', 'free');
            $selectedPlan = Plan::where('key', $defaultPlanKey)
                ->where('is_active', true)
                ->first();
        }
        
        // Fallback 2: Find first free plan (price_monthly = 0 or null)
        if (!$selectedPlan) {
            $selectedPlan = Plan::where('is_active', true)
                ->where('is_public', true)
                ->where(function ($query) {
                    $query->whereNull('price_monthly')
                          ->orWhere('price_monthly', 0);
                })
                ->orderBy('sort_order')
                ->first();
        }
        
        // Fallback 3: Find cheapest active public plan
        if (!$selectedPlan) {
            $selectedPlan = Plan::where('is_active', true)
                ->where('is_public', true)
                ->orderBy('price_monthly', 'asc')
                ->orderBy('sort_order')
                ->first();
        }
        
        // Fallback 4: Find any active plan
        if (!$selectedPlan) {
            $selectedPlan = Plan::where('is_active', true)
                ->orderBy('sort_order')
                ->first();
        }
        
        // If we still don't have a plan, create a basic free plan on the fly
        if (!$selectedPlan) {
            \Log::warning('No plan found for account creation, creating default free plan', [
                'account_id' => $account->id,
                'user_id' => $user->id,
                'selected_plan_key' => $selectedPlanKey,
            ]);
            
            // Create a basic free plan
            $settingsService = app(\App\Services\PlatformSettingsService::class);
            $selectedPlan = Plan::create([
                'key' => 'free',
                'name' => 'Free Plan',
                'description' => 'Basic free plan with limited features',
                'price_monthly' => 0,
                'currency' => $settingsService->get('payment.default_currency', 'USD'),
                'is_active' => true,
                'is_public' => true,
                'trial_days' => 0,
                'sort_order' => 0,
                'limits' => [
                    'whatsapp_connections' => 1,
                    'agents' => 1,
                    'messages_monthly' => 500,
                    'template_sends_monthly' => 0,
                    'ai_credits_monthly' => 0,
                    'retention_days' => 30,
                ],
                'modules' => ['whatsapp.cloud'],
            ]);
        }
        
        // Always assign a plan
        $subscriptionService = app(SubscriptionService::class);
        
        if ($selectedPlan->trial_days > 0) {
            $subscriptionService->startTrial($account, $selectedPlan, $user);
        } else {
            $subscriptionService->changePlan($account, $selectedPlan, $user);
        }
        
        // Clear selected plan from session
        session()->forget('selected_plan_key');

        session(['current_account_id' => $account->id]);
        session(['redirect_after_profile_complete' => true]);

        // Redirect to profile to complete user information
        return redirect()->route('profile.edit')->with('status', 'Please complete your profile to continue. Name, Email, and Phone are required.');
    }
}
