<?php

namespace App\Core\Billing;

use App\Models\Plan;
use App\Models\Account;

class PlanResolver
{
    /**
     * Get modules available to the account from plan, addons, and core defaults.
     */
    public function getAvailableModules(Account $account): array
    {
        $platformEnabledModules = \App\Models\Module::query()
            ->where('is_enabled', true)
            ->pluck('key')
            ->all();

        $plan = $this->getAccountPlan($account);

        $availableModules = [];

        if ($plan) {
            $availableModules = $plan->modules ?? [];

            $addons = $account->addons()->with('addon')->get();
            foreach ($addons as $accountAddon) {
                $addonModules = $accountAddon->addon->modules_delta ?? [];
                $availableModules = array_merge($availableModules, $addonModules);
            }
        }

        $coreModules = \App\Models\Module::query()
            ->where('is_core', true)
            ->where('is_enabled', true)
            ->pluck('key')
            ->all();

        return array_values(array_unique(array_intersect(
            array_merge($availableModules, $coreModules),
            $platformEnabledModules,
        )));
    }

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
        $availableModules = $this->getAvailableModules($account);
        $accountModules = \App\Models\AccountModule::query()
            ->where('account_id', $account->id)
            ->pluck('enabled', 'module_key');

        return array_values(array_filter($availableModules, function (string $moduleKey) use ($accountModules): bool {
            if (!$accountModules->has($moduleKey)) {
                return true;
            }

            return (bool) $accountModules->get($moduleKey);
        }));
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
