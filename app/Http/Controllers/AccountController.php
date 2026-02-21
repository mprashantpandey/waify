<?php

namespace App\Http\Controllers;

use App\Models\Account;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

class AccountController extends Controller
{
    /**
     * Switch to a different account.
     */
    public function switch(Request $request, Account $account)
    {
        $user = Auth::user();

        // Keep switch permissions aligned with global account-access policy.
        // This allows platform admins and avoids edge-cases between owner/member checks.
        if (!$user || !$user->canAccessAccount($account)) {
            abort(403, 'You do not have access to this account');
        }

        session(['current_account_id' => $account->id]);

        return redirect()->route('app.dashboard');
    }

    /**
     * Show modules management page.
     * Shows all modules available on the account's plan with enable/disable options.
     */
    public function modules(Request $request): Response
    {
        $account = $request->attributes->get('account') ?? current_account();
        
        // Get plan modules (all modules available on current plan, not just enabled ones)
        $planResolver = app(\App\Core\Billing\PlanResolver::class);
        $plan = $planResolver->getAccountPlan($account);
        $planModuleKeys = $plan ? ($plan->modules ?? []) : [];
        
        // Get all modules from database that are enabled at platform level
        $allModules = \App\Models\Module::where('is_enabled', true)->get();
        
        // Get account module toggles
        $accountModules = \App\Models\AccountModule::where('account_id', $account->id)
            ->get()
            ->keyBy('module_key');

        // Get current plan info
        $currentPlan = $plan ? [
            'key' => $plan->key,
            'name' => $plan->name] : null;

        return Inertia::render('App/Modules', [
            'account' => $account,
            'current_plan' => $currentPlan,
            'modules' => $allModules->map(function ($module) use ($accountModules, $planModuleKeys) {
                $accountModule = $accountModules->get($module->key);
                $isInPlan = in_array($module->key, $planModuleKeys);
                $isCore = $module->is_core;
                
                // Determine if module is available (in plan or core)
                $isAvailable = $isInPlan || $isCore;
                
                // Determine enabled status:
                // - Core modules are enabled by default if no account module record exists
                // - Plan modules need to be explicitly enabled via AccountModule
                // - If AccountModule exists, use its enabled status
                $enabled = $accountModule 
                    ? $accountModule->enabled 
                    : ($isCore ? true : false); // Core modules enabled by default, plan modules disabled by default
                
                return [
                    'id' => $module->id,
                    'key' => $module->key,
                    'name' => $module->name,
                    'description' => $module->description,
                    'is_core' => $isCore,
                    'is_in_plan' => $isInPlan,
                    'enabled' => $enabled,
                    'available' => $isAvailable,
                    'can_toggle' => $isAvailable, // Can toggle if available (in plan or core)
                ];
            })->filter(function ($module) {
                // Only show modules that are available (in plan) or core
                return $module['available'];
            })->sortBy(function ($module) {
                // Sort: core modules first, then plan modules, then by name
                if ($module['is_core']) return '0-' . $module['name'];
                if ($module['is_in_plan']) return '1-' . $module['name'];
                return '2-' . $module['name'];
            })->values()]);
    }

    /**
     * Toggle module enable/disable status.
     */
    public function toggleModule(Request $request)
    {
        // Get moduleKey from route parameter directly to avoid binding issues
        $moduleKey = $request->route('moduleKey');
        
        if (!$moduleKey) {
            \Log::error('Module key not found in route', [
                'route_params' => $request->route()->parameters(),
                'path' => $request->path()]);
            abort(404, 'Module key not found in route.');
        }
        
        \Log::info('toggleModule called', [
            'moduleKey_param' => $moduleKey,
            'route_params' => $request->route()->parameters(),
            'account_slug' => $request->route('account')]);
        
        $account = $request->attributes->get('account') ?? current_account();
        
        if (!$account) {
            \Log::error('Account not found in toggleModule', [
                'account_slug' => $request->route('account')]);
            abort(404, 'Account not found.');
        }

        // Verify module exists and is available on plan
        $planResolver = app(\App\Core\Billing\PlanResolver::class);
        $plan = $planResolver->getAccountPlan($account);
        $planModuleKeys = $plan ? ($plan->modules ?? []) : [];
        
        $module = \App\Models\Module::where('key', $moduleKey)->first();
        if (!$module) {
            \Log::error('Module not found', [
                'moduleKey' => $moduleKey]);
            abort(404, 'Module not found.');
        }

        // Check if module is enabled at platform level
        if (!$module->is_enabled) {
            abort(403, 'This module is currently disabled at the platform level. Please contact support.');
        }

        $isInPlan = in_array($moduleKey, $planModuleKeys);
        $isCore = $module->is_core;
        
        if (!$isInPlan && !$isCore) {
            abort(403, 'This module is not available on your current plan.');
        }

        // Get or create account module record
        $accountModule = \App\Models\AccountModule::firstOrCreate(
            [
                'account_id' => $account->id,
                'module_key' => $moduleKey],
            [
                'enabled' => false, // Default to disabled for new records
            ]
        );
        
        \Log::info('AccountModule found/created', [
            'account_id' => $account->id,
            'module_key' => $moduleKey,
            'enabled' => $accountModule->enabled]);

        // Toggle enabled status
        $accountModule->enabled = !$accountModule->enabled;
        $accountModule->save();

        return back()->with('success', "Module {$module->name} " . ($accountModule->enabled ? 'enabled' : 'disabled') . ' successfully.');
    }
}
