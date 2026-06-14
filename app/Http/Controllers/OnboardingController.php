<?php

namespace App\Http\Controllers;

use App\Models\PlatformSetting;
use App\Services\AccountProvisioner;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

class OnboardingController extends Controller
{
    /**
     * Show the onboarding page.
     */
    public function create(AccountProvisioner $provisioner): Response
    {
        $settingsService = app(\App\Services\PlatformSettingsService::class);

        if (! $settingsService->isFeatureEnabled('account_creation')) {
            abort(403, 'Account creation is currently disabled.');
        }

        return Inertia::render('Onboarding', [
            'plans' => $provisioner->publicPlans()->map(fn ($plan) => $provisioner->serializePlan($plan))->values(),
            'defaultPlanKey' => $provisioner->defaultPlanKey(),
            'workspaceTypes' => \App\Models\Account::workspaceTypes(),
            'embeddedSignup' => $this->embeddedSignupConfig(),
        ]);
    }

    /**
     * Store a newly created account.
     */
    public function store(Request $request, AccountProvisioner $provisioner)
    {
        $settingsService = app(\App\Services\PlatformSettingsService::class);

        if (! $settingsService->isFeatureEnabled('account_creation')) {
            abort(403, 'Account creation is currently disabled.');
        }

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'workspace_type' => 'required|string|in:business,agency,client,branch,project',
            'industry' => 'nullable|string|max:120',
            'plan_key' => 'nullable|string|max:100',
            'connection_method' => 'required|string|in:embedded,manual,qr,later',
        ]);

        $user = Auth::user();

        try {
            $account = $provisioner->create($user, $validated['name'], $validated['plan_key'] ?? null, [
                'workspace_type' => $validated['workspace_type'],
                'industry' => $validated['industry'] ?? null,
            ]);
        } catch (\Throwable $e) {
            report($e);

            return back()
                ->withErrors(['workspace' => 'Workspace could not be created: '.$e->getMessage()])
                ->with('error', 'Workspace could not be created. '.$e->getMessage());
        }

        // Clear selected plan from session
        session()->forget('selected_plan_key');

        session(['current_account_id' => $account->id]);
        session(['redirect_after_profile_complete' => true]);

        $subscription = $account->fresh('subscription')->subscription;
        if (
            in_array($validated['connection_method'], ['embedded', 'manual', 'qr'], true)
            && ! $this->canConnectWabaAfterPayment($account)
        ) {
            return redirect()->route('app.billing.index', [
                'tab' => 'plans',
                'checkout_plan' => $subscription?->plan?->key,
            ])
                ->with('error', $subscription?->last_error ?: 'Payment is required before connecting WhatsApp.');
        }

        if ($validated['connection_method'] === 'embedded') {
            return redirect()->route('app.whatsapp.connections.index', ['setup' => $validated['connection_method']])
                ->with('success', 'Workspace created. Start Meta embedded signup to connect your WABA account.');
        }

        if ($validated['connection_method'] === 'manual') {
            return redirect()->route('app.whatsapp.connections.index', ['setup' => 'manual'])
                ->with('success', 'Workspace created. Add your WABA IDs and token to connect manually.');
        }

        if ($validated['connection_method'] === 'qr') {
            return redirect()->route('app.whatsapp.connections.index', ['setup' => 'qr'])
                ->with('success', 'Workspace created. Link WhatsApp QR if you want to use the unofficial connection.');
        }

        return redirect()->route('app.dashboard')
            ->with('success', 'Workspace created successfully.');
    }

    private function embeddedSignupConfig(): array
    {
        $appId = PlatformSetting::get('whatsapp.meta_app_id', config('whatsapp.meta.app_id'));
        $configId = PlatformSetting::get('whatsapp.embedded_signup_config_id', config('whatsapp.meta.embedded_signup_config_id'));
        $coexistenceConfigId = PlatformSetting::get('whatsapp.coexistence_signup_config_id', config('whatsapp.meta.coexistence_signup_config_id'));
        $apiVersion = PlatformSetting::get('whatsapp.api_version', config('whatsapp.meta.api_version', 'v25.0'));
        $enabledSetting = PlatformSetting::get('whatsapp.embedded_enabled', null);
        $enabled = $enabledSetting !== null ? (bool) $enabledSetting : (bool) ($appId && $configId);

        return [
            'enabled' => $enabled,
            'appId' => $enabled ? $appId : null,
            'configId' => $enabled ? $configId : null,
            'coexistenceEnabled' => (bool) ($enabled && $coexistenceConfigId),
            'coexistenceConfigId' => $enabled ? $coexistenceConfigId : null,
            'apiVersion' => $apiVersion ?: 'v25.0',
        ];
    }

    private function canConnectWabaAfterPayment($account): bool
    {
        $account->loadMissing('subscription.plan');
        $subscription = $account->subscription;
        $plan = $subscription?->plan;

        if (! $subscription || ! $plan) {
            return false;
        }

        $isZeroAmountPlan = (int) ($plan->price_monthly ?? 0) <= 0;
        if ($isZeroAmountPlan && $subscription->isActive()) {
            return true;
        }

        if ($subscription->isInTrial()) {
            return true;
        }

        return $subscription->isActive() && $subscription->last_payment_at !== null;
    }
}
