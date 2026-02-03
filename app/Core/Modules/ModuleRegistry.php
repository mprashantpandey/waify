<?php

namespace App\Core\Modules;

use Illuminate\Support\Collection;

class ModuleRegistry
{
    protected array $modules = [];

    /**
     * Register a module.
     */
    public function register(array $definition): void
    {
        $this->modules[$definition['key']] = $definition;
    }

    /**
     * Get all registered modules.
     */
    public function all(): Collection
    {
        return collect($this->modules);
    }

    /**
     * Get a specific module by key.
     */
    public function get(string $key): ?array
    {
        return $this->modules[$key] ?? null;
    }

    /**
     * Get enabled modules for a account.
     * This checks both account module toggles AND plan entitlements.
     */
    public function getEnabledForAccount($account): Collection
    {
        // First, get all modules that are enabled at platform level
        $platformEnabledModules = \App\Models\Module::where('is_enabled', true)
            ->pluck('key')
            ->toArray();

        $settingsService = app(\App\Services\PlatformSettingsService::class);
        $analyticsEnabled = $settingsService->isFeatureEnabled('analytics');
        $aiEnabled = (bool) \App\Models\PlatformSetting::get('ai.enabled', false);

        // Get modules available on the account's plan
        $planResolver = app(\App\Core\Billing\PlanResolver::class);
        $availableModuleKeys = $planResolver->getEffectiveModules($account);

        // Also get account-enabled modules (for core modules that are always available)
        $accountModuleKeys = \App\Models\AccountModule::where('account_id', $account->id)
            ->where('enabled', true)
            ->pluck('module_key')
            ->toArray();

        // Combine: modules must be:
        // 1. Enabled at platform level
        // 2. Either on the plan AND enabled in account, OR core/enabled_by_default AND enabled in account
        return $this->all()->filter(function ($module) use ($platformEnabledModules, $availableModuleKeys, $accountModuleKeys, $analyticsEnabled, $aiEnabled) {
            $moduleKey = $module['key'];

            // First check: module must be enabled at platform level
            if (!in_array($moduleKey, $platformEnabledModules)) {
                return false;
            }

            if ($moduleKey === 'analytics' && !$analyticsEnabled) {
                return false;
            }

            if ($moduleKey === 'ai' && !$aiEnabled) {
                return false;
            }
            
            $isOnPlan = in_array($moduleKey, $availableModuleKeys);
            $isEnabledInAccount = in_array($moduleKey, $accountModuleKeys);
            $isCore = $module['is_core'] ?? false;
            $enabledByDefault = $module['enabled_by_default'] ?? false;

            // Module is available if:
            // 1. It's on the plan AND enabled in account, OR
            // 2. It's core/enabled_by_default AND enabled in account
            return $isOnPlan || (($isCore || $enabledByDefault) && $isEnabledInAccount);
        });
    }

    /**
     * Get navigation items for enabled modules.
     * Only shows navigation for modules that are both on the plan AND enabled in account.
     */
    public function getNavigationForAccount($account): array
    {
        $enabledModules = $this->getEnabledForAccount($account);

        $navItems = [];

        foreach ($enabledModules as $module) {
            if (isset($module['nav']) && is_array($module['nav'])) {
                foreach ($module['nav'] as $navItem) {
                    // Only include nav items if the module is enabled at platform level
                    $moduleKey = $module['key'];
                    $platformModule = \App\Models\Module::where('key', $moduleKey)->first();
                    
                    if ($platformModule && $platformModule->is_enabled) {
                        $navItems[] = $navItem;
                    }
                }
            }
        }

        return $navItems;
    }
}
