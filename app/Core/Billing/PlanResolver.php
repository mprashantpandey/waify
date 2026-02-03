<?php

namespace App\Core\Billing;

use App\Models\Plan;
use App\Models\Account;

class PlanResolver
{
    /**
     * Get the plan for a account.
     */
    public function getAccountPlan(Account $account): ?Plan
    {
        $subscription = $account->subscription;
        
        if (!$subscription) {
            // Return default plan if no subscription
            $defaultPlanKey = env('DEFAULT_PLAN_KEY', 'free');
            return Plan::where('key', $defaultPlanKey)->first();
        }

        return $subscription->plan;
    }

    /**
     * Get effective modules for a account.
     * 
     * Returns array of module keys that are enabled for this account.
     * Order: plan modules + addon modules → intersect with account toggles
     */
    public function getEffectiveModules(Account $account): array
    {
        // Get platform-enabled modules first
        $platformEnabledModules = \App\Models\Module::where('is_enabled', true)
            ->pluck('key')
            ->toArray();
        
        // Get account-enabled modules
        $accountModules = \App\Models\AccountModule::where('account_id', $account->id)
            ->where('enabled', true)
            ->pluck('module_key')
            ->toArray();
        
        $plan = $this->getAccountPlan($account);
        
        $effectiveModules = [];
        
        if ($plan) {
            // Start with plan modules
            $modules = $plan->modules ?? [];

            // Add modules from active addons
            $addons = $account->addons()->with('addon')->get();
            foreach ($addons as $accountAddon) {
                $addonModules = $accountAddon->addon->modules_delta ?? [];
                $modules = array_merge($modules, $addonModules);
            }

            // Remove duplicates
            $modules = array_unique($modules);
            
            // Filter plan modules to only include platform-enabled ones
            $modules = array_intersect($modules, $platformEnabledModules);
            
            // Get effective modules from plan (intersect with account-enabled)
            $effectiveModules = array_intersect($modules, $accountModules);
        }
        
        // Also include core modules that are enabled at platform level
        // Core modules are available if they're enabled at platform level
        // (they don't need to be in the plan's modules array)
        $coreModules = \App\Models\Module::where('is_core', true)
            ->where('is_enabled', true)
            ->pluck('key')
            ->toArray();
        
        // Filter core modules to only those enabled in account (or enabled by default)
        // For core modules, if they're enabled at platform level, they're available
        // if they're enabled in account OR if no account module record exists (enabled by default)
        $availableCoreModules = [];
        foreach ($coreModules as $moduleKey) {
            // Must be enabled at platform level (already filtered above)
            if (!in_array($moduleKey, $platformEnabledModules)) {
                continue;
            }
            
            // Check if enabled in account
            $accountModule = \App\Models\AccountModule::where('account_id', $account->id)
                ->where('module_key', $moduleKey)
                ->first();
            
            // Core modules are available if:
            // 1. No account module record exists (enabled by default), OR
            // 2. Account module exists and is enabled
            if (!$accountModule || $accountModule->enabled) {
                $availableCoreModules[] = $moduleKey;
            }
        }
        
        // Merge plan modules with core modules
        return array_unique(array_merge($effectiveModules, $availableCoreModules));
    }

    /**
     * Get effective limits for a account.
     * 
     * Returns array of limit keys with their values.
     * Base plan limits + addon limits_delta * quantity
     */
    public function getEffectiveLimits(Account $account): array
    {
        $plan = $this->getAccountPlan($account);
        
        if (!$plan) {
            return [];
        }

        // Start with plan limits
        $limits = $plan->limits ?? [];

        // Add limits from active addons
        $addons = $account->addons()->with('addon')->get();
        foreach ($addons as $accountAddon) {
            $addonLimits = $accountAddon->addon->limits_delta ?? [];
            $quantity = $accountAddon->quantity;
            
            foreach ($addonLimits as $key => $value) {
                if (isset($limits[$key])) {
                    // If limit is -1 (unlimited), keep it
                    if ($limits[$key] === -1) {
                        continue;
                    }
                    $limits[$key] = ($limits[$key] ?? 0) + ($value * $quantity);
                } else {
                    $limits[$key] = $value * $quantity;
                }
            }
        }

        return $limits;
    }
}

