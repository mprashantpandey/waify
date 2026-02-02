<?php

namespace App\Http\Controllers;

use App\Models\Workspace;
use App\Models\Plan;
use App\Core\Billing\SubscriptionService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

class OnboardingController extends Controller
{
    /**
     * Show the onboarding page.
     */
    public function create(): Response
    {
        $settingsService = app(\App\Services\PlatformSettingsService::class);
        
        if (!$settingsService->isFeatureEnabled('workspace_creation')) {
            abort(403, 'Workspace creation is currently disabled.');
        }
        
        return Inertia::render('Onboarding');
    }

    /**
     * Store a newly created workspace.
     */
    public function store(Request $request)
    {
        $settingsService = app(\App\Services\PlatformSettingsService::class);
        
        if (!$settingsService->isFeatureEnabled('workspace_creation')) {
            abort(403, 'Workspace creation is currently disabled.');
        }
        
        $validated = $request->validate([
            'name' => 'required|string|max:255',
        ]);

        $user = Auth::user();

        $workspace = Workspace::create([
            'name' => $validated['name'],
            'slug' => Workspace::generateSlug($validated['name']),
            'owner_id' => $user->id,
        ]);

        // Add user as owner
        $workspace->users()->attach($user->id, ['role' => 'owner']);

        // Enable core modules by default
        $coreModules = \App\Models\Module::where('is_core', true)->get();
        foreach ($coreModules as $module) {
            \App\Models\WorkspaceModule::create([
                'workspace_id' => $workspace->id,
                'module_key' => $module->key,
                'enabled' => true,
            ]);
        }

        // Auto-subscribe to selected plan or default plan
        $selectedPlanKey = session('selected_plan_key') ?? env('DEFAULT_PLAN_KEY', 'free');
        $selectedPlan = Plan::where('key', $selectedPlanKey)
            ->where('is_active', true)
            ->where('is_public', true)
            ->first();
        
        // Fallback to default plan if selected plan not found
        if (!$selectedPlan) {
            $defaultPlanKey = env('DEFAULT_PLAN_KEY', 'free');
            $selectedPlan = Plan::where('key', $defaultPlanKey)->first();
        }
        
        if ($selectedPlan) {
            $subscriptionService = app(SubscriptionService::class);
            
            if ($selectedPlan->trial_days > 0) {
                $subscriptionService->startTrial($workspace, $selectedPlan, $user);
            } else {
                $subscriptionService->changePlan($workspace, $selectedPlan, $user);
            }
        }
        
        // Clear selected plan from session
        session()->forget('selected_plan_key');

        session(['current_workspace_id' => $workspace->id]);

        return redirect()->route('app.dashboard', ['workspace' => $workspace->slug]);
    }
}
