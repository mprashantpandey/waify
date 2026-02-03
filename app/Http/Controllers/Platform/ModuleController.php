<?php

namespace App\Http\Controllers\Platform;

use App\Http\Controllers\Controller;
use App\Models\Module;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ModuleController extends Controller
{
    /**
     * Display all modules for platform management.
     */
    public function index(Request $request): Response
    {
        $modules = Module::orderBy('is_core', 'desc')
            ->orderBy('name', 'asc')
            ->get()
            ->map(function ($module) {
                return [
                    'id' => $module->id,
                    'key' => $module->key,
                    'name' => $module->name,
                    'description' => $module->description,
                    'is_core' => $module->is_core,
                    'is_enabled' => $module->is_enabled,
                    'account_count' => $module->accountModules()->where('enabled', true)->count()];
            });

        return Inertia::render('Platform/Modules/Index', [
            'modules' => $modules]);
    }

    /**
     * Toggle module enabled status at platform level.
     */
    public function toggle(Request $request, Module $module)
    {
        // Core modules cannot be disabled at platform level
        if ($module->is_core) {
            return back()->with('error', 'Core modules cannot be disabled at the platform level.');
        }

        $module->is_enabled = !$module->is_enabled;
        $module->save();

        $action = $module->is_enabled ? 'enabled' : 'disabled';
        
        return back()->with('success', "Module {$module->name} has been {$action} at the platform level.");
    }

    /**
     * Update module status.
     */
    public function update(Request $request, Module $module)
    {
        $request->validate([
            'is_enabled' => 'sometimes|boolean',
            'name' => 'sometimes|string|max:255',
            'description' => 'sometimes|nullable|string']);

        // Core modules cannot be disabled
        if ($module->is_core && isset($request->is_enabled) && !$request->is_enabled) {
            return back()->with('error', 'Core modules cannot be disabled at the platform level.');
        }

        $module->fill($request->only(['is_enabled', 'name', 'description']));
        $module->save();

        return back()->with('success', 'Module updated successfully.');
    }
}
