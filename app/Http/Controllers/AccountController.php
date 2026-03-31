<?php

namespace App\Http\Controllers;

use App\Core\Billing\PlanResolver;
use App\Models\Account;
use App\Models\AccountModule;
use App\Models\Module;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

class AccountController extends Controller
{
    /**
     * Switch to a different account.
     */
    public function switch(Request $request, Account $account)
    {
        $user = Auth::user();

        // Keep switch permissions aligned with global account-access policy.
        // This allows platform admins and avoids edge-cases between owner/member checks.
        if (!$user || !$user->canAccessAccount($account)) {
            abort(403, 'You do not have access to this account');
        }

        session(['current_account_id' => $account->id]);

        return redirect()->route('app.dashboard');
    }

    /**
     * Show modules management page.
     * Shows all modules available on the account's plan with enable/disable options.
     */
    public function modules(Request $request): Response
    {
        $account = $request->attributes->get('account') ?? current_account();
        $user = $request->user();
        $this->authorizeModuleManagement($account, $user);

        $planResolver = app(PlanResolver::class);
        $plan = $planResolver->getAccountPlan($account);
        $availableModuleKeys = $planResolver->getAvailableModules($account);
        $enabledModuleKeys = array_flip($planResolver->getEffectiveModules($account));

        $allModules = Module::query()
            ->where('is_enabled', true)
            ->whereIn('key', $availableModuleKeys)
            ->get();

        $accountModules = AccountModule::query()
            ->where('account_id', $account->id)
            ->get()
            ->keyBy('module_key');

        $currentPlan = $plan ? [
            'key' => $plan->key,
            'name' => $plan->name] : null;

        return Inertia::render('App/Modules', [
            'account' => $account,
            'current_plan' => $currentPlan,
            'modules' => $allModules->map(function ($module) use ($accountModules, $availableModuleKeys, $enabledModuleKeys) {
                $accountModule = $accountModules->get($module->key);
                $isInPlan = in_array($module->key, $availableModuleKeys, true);
                $isCore = $module->is_core;
                $isAvailable = $isInPlan || $isCore;
                $enabled = isset($enabledModuleKeys[$module->key]);

                return [
                    'id' => $module->id,
                    'key' => $module->key,
                    'name' => $module->name,
                    'description' => $module->description,
                    'is_core' => $isCore,
                    'is_in_plan' => $isInPlan,
                    'enabled' => $enabled,
                    'available' => $isAvailable,
                    'can_toggle' => $isAvailable,
                    'explicit_override' => $accountModule ? (bool) $accountModule->enabled : null,
                ];
            })->sortBy(function ($module) {
                if ($module['is_core']) {
                    return '0-' . $module['name'];
                }
                if ($module['is_in_plan']) {
                    return '1-' . $module['name'];
                }

                return '2-' . $module['name'];
            })->values(),
        ]);
    }

    /**
     * Toggle module enable/disable status.
     */
    public function toggleModule(Request $request)
    {
        $moduleKey = $request->route('moduleKey');

        if (!$moduleKey) {
            \Log::error('Module key not found in route', [
                'route_params' => $request->route()->parameters(),
                'path' => $request->path()]);
            abort(404, 'Module key not found in route.');
        }
        
        $account = $request->attributes->get('account') ?? current_account();
        $user = $request->user();
        $this->authorizeModuleManagement($account, $user);

        if (!$account) {
            \Log::error('Account not found in toggleModule', [
                'account_slug' => $request->route('account')]);
            abort(404, 'Account not found.');
        }

        $planResolver = app(PlanResolver::class);
        $availableModuleKeys = $planResolver->getAvailableModules($account);

        $module = Module::query()->where('key', $moduleKey)->first();
        if (!$module) {
            abort(404, 'Module not found.');
        }

        if (!$module->is_enabled) {
            abort(403, 'This module is currently disabled at the platform level. Please contact support.');
        }

        if (!in_array($moduleKey, $availableModuleKeys, true)) {
            abort(403, 'This module is not available on your current plan.');
        }

        $accountModule = AccountModule::query()->firstOrCreate(
            [
                'account_id' => $account->id,
                'module_key' => $moduleKey],
            [
                'enabled' => false,
            ]
        );

        $accountModule->enabled = !$accountModule->enabled;
        $accountModule->save();

        return back()->with('success', "Module {$module->name} " . ($accountModule->enabled ? 'enabled' : 'disabled') . ' successfully.');
    }

    protected function authorizeModuleManagement(?Account $account, ?User $user): void
    {
        if (!$account || !$user) {
            abort(404, 'Account not found.');
        }

        if ($account->isOwnedBy($user)) {
            return;
        }

        $membership = $account->users()
            ->where('users.id', $user->id)
            ->first();

        if (in_array($membership?->pivot?->role, ['owner', 'admin'], true)) {
            return;
        }

        abort(403, 'Only account admins can manage modules.');
    }
}
