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
     * Get enabled modules for a workspace.
     * This checks both workspace module toggles AND plan entitlements.
     */
    public function getEnabledForWorkspace($workspace): Collection
    {
        // First, get all modules that are enabled at platform level
        $platformEnabledModules = \App\Models\Module::where('is_enabled', true)
            ->pluck('key')
            ->toArray();

        // Get modules available on the workspace's plan
        $planResolver = app(\App\Core\Billing\PlanResolver::class);
        $availableModuleKeys = $planResolver->getEffectiveModules($workspace);

        // Also get workspace-enabled modules (for core modules that are always available)
        $workspaceModuleKeys = \App\Models\WorkspaceModule::where('workspace_id', $workspace->id)
            ->where('enabled', true)
            ->pluck('module_key')
            ->toArray();

        // Combine: modules must be:
        // 1. Enabled at platform level
        // 2. Either on the plan AND enabled in workspace, OR core/enabled_by_default AND enabled in workspace
        return $this->all()->filter(function ($module) use ($platformEnabledModules, $availableModuleKeys, $workspaceModuleKeys) {
            $moduleKey = $module['key'];
            
            // First check: module must be enabled at platform level
            if (!in_array($moduleKey, $platformEnabledModules)) {
                return false;
            }
            
            $isOnPlan = in_array($moduleKey, $availableModuleKeys);
            $isEnabledInWorkspace = in_array($moduleKey, $workspaceModuleKeys);
            $isCore = $module['is_core'] ?? false;
            $enabledByDefault = $module['enabled_by_default'] ?? false;

            // Module is available if:
            // 1. It's on the plan AND enabled in workspace, OR
            // 2. It's core/enabled_by_default AND enabled in workspace
            return $isOnPlan || (($isCore || $enabledByDefault) && $isEnabledInWorkspace);
        });
    }

    /**
     * Get navigation items for enabled modules.
     * Only shows navigation for modules that are both on the plan AND enabled in workspace.
     */
    public function getNavigationForWorkspace($workspace): array
    {
        $enabledModules = $this->getEnabledForWorkspace($workspace);

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

