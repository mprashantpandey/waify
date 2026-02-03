<?php

namespace App\Http\Controllers;

use App\Core\Modules\ModuleRegistry;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ModuleController extends Controller
{
    public function __construct(
        protected ModuleRegistry $moduleRegistry
    ) {
    }

    /**
     * Show a module placeholder page.
     */
    public function show(Request $request): Response
    {
        $account = $request->attributes->get('account') ?? current_account();
        
        // Get module from route parameter or defaults
        $module = $request->route('module') ?? $request->route()->defaults['module'] ?? null;
        
        if (!$module) {
            // Try to extract from path (app/{module})
            $path = trim($request->path(), '/');
            $pathParts = explode('/', $path);
            if (count($pathParts) >= 2 && $pathParts[0] === 'app') {
                $module = $pathParts[1];
            }
        }
        
        if (!$module) {
            abort(404, 'Module parameter not found.');
        }
        
        // Map route names to module keys
        $moduleKeyMap = [
            'whatsapp' => 'whatsapp.cloud',
            'templates' => 'templates',
            'chatbots' => 'automation.chatbots',
            'ai' => 'ai',
            'floaters' => 'floaters',
            'analytics' => 'analytics',
            'billing' => 'billing'];

        $moduleKey = $moduleKeyMap[$module] ?? null;
        
        if (!$moduleKey) {
            abort(404);
        }

        $moduleDefinition = $this->moduleRegistry->get($moduleKey);
        $dbModule = \App\Models\Module::where('key', $moduleKey)->first();
        
        // Check if module exists
        if (!$dbModule) {
            abort(404, "Module '{$moduleKey}' not found.");
        }
        
        // Check if module is enabled at platform level
        // Placeholder pages should be accessible if module is enabled at platform level
        // (even if not on plan - they'll show a message)
        if (!$dbModule->is_enabled) {
            abort(404, "This module is currently disabled at the platform level. Please contact support.");
        }
        
        $accountModule = \App\Models\AccountModule::where('account_id', $account->id)
            ->where('module_key', $moduleKey)
            ->first();

        $enabled = $accountModule ? $accountModule->enabled : ($dbModule && $dbModule->is_core ? true : false);

        if ($moduleKey === 'floaters') {
            return Inertia::render('Floaters/Index', [
                'account' => $account]);
        }

        return Inertia::render('App/ModulePlaceholder', [
            'account' => $account,
            'module' => [
                'key' => $moduleKey,
                'name' => $moduleDefinition['name'] ?? $dbModule->name ?? ucfirst($module),
                'description' => $moduleDefinition['description'] ?? $dbModule->description ?? '',
                'enabled' => $enabled]]);
    }
}
