<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Auth\Events\Registered;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rules;
use Inertia\Inertia;
use Inertia\Response;

class RegisteredUserController extends Controller
{
    /**
     * Display the registration view.
     */
    public function create(Request $request): Response
    {
        $settingsService = app(\App\Services\PlatformSettingsService::class);
        
        if (!$settingsService->isFeatureEnabled('user_registration')) {
            abort(403, 'User registration is currently disabled.');
        }
        
        $selectedPlanKey = $request->query('plan');
        $selectedPlan = null;
        
        if ($selectedPlanKey) {
            $selectedPlan = \App\Models\Plan::where('key', $selectedPlanKey)
                ->where('is_active', true)
                ->where('is_public', true)
                ->first();
        }

        $inviteToken = $request->query('invite');
        $invite = null;
        if ($inviteToken) {
            $invitation = \App\Models\WorkspaceInvitation::where('token', $inviteToken)
                ->whereNull('accepted_at')
                ->first();
            if ($invitation && ! $invitation->isExpired()) {
                $invite = [
                    'token' => $invitation->token,
                    'email' => $invitation->email,
                    'workspace_name' => $invitation->workspace?->name,
                    'role' => $invitation->role,
                ];
            }
        }
        
        return Inertia::render('Auth/Register', [
            'selectedPlan' => $selectedPlan ? [
                'id' => $selectedPlan->id,
                'key' => $selectedPlan->key,
                'name' => $selectedPlan->name,
                'description' => $selectedPlan->description,
                'price_monthly' => $selectedPlan->price_monthly,
                'trial_days' => $selectedPlan->trial_days ?? 0,
            ] : null,
            'invite' => $invite,
        ]);
    }

    /**
     * Handle an incoming registration request.
     *
     * @throws \Illuminate\Validation\ValidationException
     */
    public function store(\App\Http\Requests\RegisterRequest $request): RedirectResponse
    {
        $validated = $request->validated();

        $user = User::create([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'password' => Hash::make($validated['password']),
        ]);

        event(new Registered($user));

        Auth::login($user);

        // Store selected plan in session for onboarding
        if ($request->has('plan_key')) {
            session(['selected_plan_key' => $request->input('plan_key')]);
        }

        // Accept workspace invite if present
        if (!empty($validated['invite_token'])) {
            $invitation = \App\Models\WorkspaceInvitation::where('token', $validated['invite_token'])
                ->whereNull('accepted_at')
                ->first();
            if ($invitation && ! $invitation->isExpired()) {
                $workspace = $invitation->workspace;
                if ($workspace && ! $workspace->users()->where('user_id', $user->id)->exists()) {
                    $workspace->users()->attach($user->id, [
                        'role' => $invitation->role,
                    ]);
                }
                $invitation->update([
                    'accepted_at' => now(),
                ]);
                return redirect()->route('app.dashboard', ['workspace' => $workspace->slug]);
            }
            if ($invitation && $invitation->isExpired()) {
                return redirect(route('onboarding'))
                    ->with('error', 'Your invitation has expired. Please ask the workspace owner to resend it.');
            }
        }

        // Redirect to onboarding since new users don't have a workspace yet
        return redirect(route('onboarding'));
    }
}
