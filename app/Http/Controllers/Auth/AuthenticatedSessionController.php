<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\LoginRequest;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use Inertia\Response;

class AuthenticatedSessionController extends Controller
{
    /**
     * Display the login view.
     */
    public function create(): Response
    {
        return Inertia::render('Auth/Login', [
            'canResetPassword' => Route::has('password.request'),
            'status' => session('status'),
        ]);
    }

    /**
     * Handle an incoming authentication request.
     */
    public function store(LoginRequest $request): RedirectResponse
    {
        $request->authenticate();

        $request->session()->regenerate();

        $user = $request->user();
        
        // Check if there's an intended URL (e.g., user was trying to access /platform)
        $intendedUrl = $request->session()->pull('url.intended');
        
        if ($intendedUrl) {
            // If super admin and intended URL is platform route, allow it
            if ($user->isSuperAdmin() && str_starts_with($intendedUrl, '/platform')) {
                return redirect($intendedUrl);
            }
            
            // For other intended URLs, try to redirect there
            // But validate it's not a platform route for non-super-admins
            if (!$user->isSuperAdmin() && str_starts_with($intendedUrl, '/platform')) {
                // Non-super-admin tried to access platform, redirect to default
                $intendedUrl = null;
            }
        }
        
        // If we have a valid intended URL, use it
        if ($intendedUrl) {
            return redirect($intendedUrl);
        }
        
        // Default redirect logic
        // Check if user has workspaces
        $workspaces = $user->workspaces()->get()->merge($user->ownedWorkspaces()->get());
        
        if ($workspaces->isEmpty()) {
            // Redirect to onboarding
            return redirect()->route('onboarding');
        }
        
        // Redirect to first workspace dashboard
        $firstWorkspace = $workspaces->first();
        return redirect()->route('app.dashboard', ['workspace' => $firstWorkspace->slug]);
    }

    /**
     * Destroy an authenticated session.
     */
    public function destroy(Request $request): RedirectResponse
    {
        Auth::guard('web')->logout();

        $request->session()->invalidate();

        $request->session()->regenerateToken();

        return redirect('/');
    }
}
