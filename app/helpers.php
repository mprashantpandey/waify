<?php

if (!function_exists('module_enabled')) {
    /**
     * Check if a module is enabled for a workspace.
     */
    function module_enabled($workspace, string $moduleKey): bool
    {
        if (!$workspace) {
            return false;
        }

        // First check: module must be enabled at platform level
        $module = \App\Models\Module::where('key', $moduleKey)->first();
        if (!$module || !$module->is_enabled) {
            return false;
        }

        $workspaceModule = \App\Models\WorkspaceModule::where('workspace_id', $workspace->id)
            ->where('module_key', $moduleKey)
            ->first();

        if ($workspaceModule) {
            return $workspaceModule->enabled;
        }

        // Check if module is enabled by default (core modules)
        if ($module && $module->is_core) {
            return true; // Core modules are enabled by default
        }

        return false;
    }
}

if (!function_exists('current_workspace')) {
    /**
     * Get the current workspace from session.
     */
    function current_workspace()
    {
        $workspaceId = session('current_workspace_id');

        if (!$workspaceId) {
            return null;
        }

        return \App\Models\Workspace::find($workspaceId);
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

