<?php

if (!function_exists('module_enabled')) {
    /**
     * Check if a module is enabled for a account.
     */
    function module_enabled($account, string $moduleKey): bool
    {
        if (!$account) {
            return false;
        }

        // First check: module must be enabled at platform level
        $module = \App\Models\Module::where('key', $moduleKey)->first();
        if (!$module || !$module->is_enabled) {
            return false;
        }

        $accountModule = \App\Models\AccountModule::where('account_id', $account->id)
            ->where('module_key', $moduleKey)
            ->first();

        if ($accountModule) {
            return $accountModule->enabled;
        }

        // Check if module is enabled by default (core modules)
        if ($module && $module->is_core) {
            return true; // Core modules are enabled by default
        }

        return false;
    }
}

if (!function_exists('current_account')) {
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
        if (!$user) {
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

if (!function_exists('is_super_admin')) {
    /**
     * Check if the current user is a super admin (platform owner).
     */
    function is_super_admin(): bool
    {
        $user = auth()->user();
        return $user && $user->isSuperAdmin();
    }
}

if (!function_exists('is_platform_admin')) {
    /**
     * Alias for is_super_admin (backward compatibility).
     */
    function is_platform_admin(): bool
    {
        return is_super_admin();
    }
}

if (!function_exists('account_ids_match')) {
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
