<?php

if (! function_exists('module_enabled')) {
    /**
     * Check if a module is enabled for a account.
     */
    function module_enabled($account, string $moduleKey): bool
    {
        if (! $account) {
            return false;
        }

        $moduleAliases = [
            'ai.voice' => 'whatsapp.calling',
            'whatsapp.calling' => 'ai.voice',
        ];
        $candidateKeys = array_values(array_unique(array_filter([
            $moduleKey,
            $moduleAliases[$moduleKey] ?? null,
        ])));

        // First check: module must be enabled at platform level
        $module = \App\Models\Module::whereIn('key', $candidateKeys)
            ->where('is_enabled', true)
            ->first();
        if (! $module || ! $module->is_enabled) {
            return false;
        }

        $effectiveModules = app(\App\Core\Billing\PlanResolver::class)->getEffectiveModules($account);

        return count(array_intersect($candidateKeys, $effectiveModules)) > 0;
    }
}

if (! function_exists('current_account')) {
    /**
     * Get the current account from session.
     */
    function current_account()
    {
        $accountId = session('current_account_id');
        if ($accountId) {
            return \App\Models\Account::find($accountId);
        }

        $user = auth()->user();
        if (! $user) {
            return null;
        }

        // Prefer owned account, then any membership.
        $account = \App\Models\Account::where('owner_id', $user->id)->first()
            ?? $user->accounts()->first();

        if ($account) {
            session(['current_account_id' => $account->id]);
        }

        return $account;
    }
}

if (! function_exists('is_super_admin')) {
    /**
     * Check if the current user is a super admin (platform owner).
     */
    function is_super_admin(): bool
    {
        $user = auth()->user();

        return $user && $user->isSuperAdmin();
    }
}

if (! function_exists('is_platform_admin')) {
    /**
     * Alias for is_super_admin (backward compatibility).
     */
    function is_platform_admin(): bool
    {
        return is_super_admin();
    }
}

if (! function_exists('account_ids_match')) {
    /**
     * Compare account ids safely (string vs int).
     */
    function account_ids_match($left, $right): bool
    {
        if ($left === null || $right === null) {
            return false;
        }

        if (is_numeric($left) && is_numeric($right)) {
            return (int) $left === (int) $right;
        }

        return (string) $left === (string) $right;
    }
}
