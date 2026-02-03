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
            'status' => session('status')]);
    }

    /**
     * Handle an incoming authentication request.
     */
    public function store(LoginRequest $request): RedirectResponse
    {
        $request->authenticate();

        $request->session()->regenerate();

        $user = $request->user();
        
        // Super admins should go directly to platform dashboard
        if ($user->isSuperAdmin()) {
            // Check if there's an intended URL
            $intendedUrl = $request->session()->pull('url.intended');
            
            // If intended URL is a platform route, use it
            if ($intendedUrl && str_starts_with($intendedUrl, '/platform')) {
                return redirect($intendedUrl);
            }
            
            // Otherwise, redirect to platform dashboard
            return redirect()->route('platform.dashboard');
        }
        
        // Regular users: Check if there's an intended URL
        $intendedUrl = $request->session()->pull('url.intended');
        
        if ($intendedUrl) {
            // Validate it's not a platform route for non-super-admins
            if (str_starts_with($intendedUrl, '/platform')) {
                // Non-super-admin tried to access platform, redirect to default
                $intendedUrl = null;
            }
        }
        
        // If we have a valid intended URL, use it
        if ($intendedUrl) {
            return redirect($intendedUrl);
        }
        
        // Default redirect logic for regular users
        // Check if user has accounts
        $accounts = $user->accounts()->get()->merge($user->ownedAccounts()->get());
        
        if ($accounts->isEmpty()) {
            // Redirect to onboarding
            return redirect()->route('onboarding');
        }
        
        // Redirect to first account dashboard
        $firstAccount = $accounts->first();
        return redirect()->route('app.dashboard');
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
