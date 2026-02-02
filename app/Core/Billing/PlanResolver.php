<?php

namespace App\Core\Billing;

use App\Models\Plan;
use App\Models\Workspace;

class PlanResolver
{
    /**
     * Get the plan for a workspace.
     */
    public function getWorkspacePlan(Workspace $workspace): ?Plan
    {
        $subscription = $workspace->subscription;
        
        if (!$subscription) {
            // Return default plan if no subscription
            $defaultPlanKey = env('DEFAULT_PLAN_KEY', 'free');
            return Plan::where('key', $defaultPlanKey)->first();
        }

        return $subscription->plan;
    }

    /**
     * Get effective modules for a workspace.
     * 
     * Returns array of module keys that are enabled for this workspace.
     * Order: plan modules + addon modules → intersect with workspace toggles
     */
    public function getEffectiveModules(Workspace $workspace): array
    {
        // Get platform-enabled modules first
        $platformEnabledModules = \App\Models\Module::where('is_enabled', true)
            ->pluck('key')
            ->toArray();
        
        // Get workspace-enabled modules
        $workspaceModules = \App\Models\WorkspaceModule::where('workspace_id', $workspace->id)
            ->where('enabled', true)
            ->pluck('module_key')
            ->toArray();
        
        $plan = $this->getWorkspacePlan($workspace);
        
        $effectiveModules = [];
        
        if ($plan) {
            // Start with plan modules
            $modules = $plan->modules ?? [];

            // Add modules from active addons
            $addons = $workspace->addons()->with('addon')->get();
            foreach ($addons as $workspaceAddon) {
                $addonModules = $workspaceAddon->addon->modules_delta ?? [];
                $modules = array_merge($modules, $addonModules);
            }

            // Remove duplicates
            $modules = array_unique($modules);
            
            // Filter plan modules to only include platform-enabled ones
            $modules = array_intersect($modules, $platformEnabledModules);
            
            // Get effective modules from plan (intersect with workspace-enabled)
            $effectiveModules = array_intersect($modules, $workspaceModules);
        }
        
        // Also include core modules that are enabled at platform level
        // Core modules are available if they're enabled at platform level
        // (they don't need to be in the plan's modules array)
        $coreModules = \App\Models\Module::where('is_core', true)
            ->where('is_enabled', true)
            ->pluck('key')
            ->toArray();
        
        // Filter core modules to only those enabled in workspace (or enabled by default)
        // For core modules, if they're enabled at platform level, they're available
        // if they're enabled in workspace OR if no workspace module record exists (enabled by default)
        $availableCoreModules = [];
        foreach ($coreModules as $moduleKey) {
            // Must be enabled at platform level (already filtered above)
            if (!in_array($moduleKey, $platformEnabledModules)) {
                continue;
            }
            
            // Check if enabled in workspace
            $workspaceModule = \App\Models\WorkspaceModule::where('workspace_id', $workspace->id)
                ->where('module_key', $moduleKey)
                ->first();
            
            // Core modules are available if:
            // 1. No workspace module record exists (enabled by default), OR
            // 2. Workspace module exists and is enabled
            if (!$workspaceModule || $workspaceModule->enabled) {
                $availableCoreModules[] = $moduleKey;
            }
        }
        
        // Merge plan modules with core modules
        return array_unique(array_merge($effectiveModules, $availableCoreModules));
    }

    /**
     * Get effective limits for a workspace.
     * 
     * Returns array of limit keys with their values.
     * Base plan limits + addon limits_delta * quantity
     */
    public function getEffectiveLimits(Workspace $workspace): array
    {
        $plan = $this->getWorkspacePlan($workspace);
        
        if (!$plan) {
            return [];
        }

        // Start with plan limits
        $limits = $plan->limits ?? [];

        // Add limits from active addons
        $addons = $workspace->addons()->with('addon')->get();
        foreach ($addons as $workspaceAddon) {
            $addonLimits = $workspaceAddon->addon->limits_delta ?? [];
            $quantity = $workspaceAddon->quantity;
            
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

