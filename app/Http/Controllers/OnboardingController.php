<?php

namespace App\Http\Controllers;

use App\Models\Account;
use App\Models\Plan;
use App\Core\Billing\SubscriptionService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
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
            'plan_key' => 'required|string|exists:plans,key'], [
                'plan_key.required' => 'Please select a plan to continue.',
                'plan_key.exists' => 'The selected plan is no longer available. Please choose another plan.',
            ]);

        $user = Auth::user();
        $accountName = $this->resolveAccountName($user);

        // Auto-subscribe to selected plan or default plan
        $selectedPlanKey = (string) $validated['plan_key'];
        
        // Selected plan must be active and public.
        $selectedPlan = Plan::where('key', $selectedPlanKey)
            ->where('is_active', true)
            ->where('is_public', true)
            ->first();

        if (!$selectedPlan) {
            return back()->withErrors([
                'plan_key' => 'The selected plan is not available. Please choose another plan.',
            ])->with('error', 'Selected plan is unavailable.');
        }

        // Enforce payment requirement for paid plans without trial during onboarding.
        $hasPaidAmount = (int) ($selectedPlan->price_monthly ?? 0) > 0 || (int) ($selectedPlan->price_yearly ?? 0) > 0;
        if ($hasPaidAmount && (int) ($selectedPlan->trial_days ?? 0) <= 0) {
            return back()->withErrors([
                'plan_key' => 'This paid plan requires payment checkout before account creation.',
            ])->with('error', 'Paid plans require payment before onboarding completion.');
        }
        
        // Always assign a plan
        $subscriptionService = app(SubscriptionService::class);
        $account = DB::transaction(function () use ($accountName, $user, $selectedPlan, $subscriptionService) {
            $account = Account::create([
                'name' => $accountName,
                'slug' => Account::generateSlug($accountName),
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

            if ($selectedPlan->trial_days > 0) {
                $subscriptionService->startTrial($account, $selectedPlan, $user);
            } else {
                $subscriptionService->changePlan($account, $selectedPlan, $user);
            }

            return $account;
        });
        
        // Clear selected plan from session
        session()->forget('selected_plan_key');

        session(['current_account_id' => $account->id]);
        session(['redirect_after_profile_complete' => true]);

        // Redirect to profile to complete user information
        return redirect()->route('profile.edit')->with('status', 'Please complete your profile to continue. Name, Email, and Phone are required.');
    }

    protected function resolveAccountName($user): string
    {
        $base = trim((string) ($user?->name ?: 'My Account'));
        if ($base === '') {
            $base = 'My Account';
        }

        return mb_substr($base, 0, 255);
    }
}
