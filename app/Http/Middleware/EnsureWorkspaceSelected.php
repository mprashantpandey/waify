<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Symfony\Component\HttpFoundation\Response;

class EnsureWorkspaceSelected
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        $user = Auth::user();

        if (!$user) {
            return redirect()->route('login');
        }

        $workspace = current_workspace();

        if (!$workspace) {
            // Check if user has any workspaces
            $workspaces = $user->workspaces()->get()->merge($user->ownedWorkspaces()->get());

            if ($workspaces->isEmpty()) {
                // Redirect to onboarding
                return redirect()->route('onboarding');
            }

            // Redirect to first workspace
            $firstWorkspace = $workspaces->first();
            return redirect()->route('app.dashboard', ['workspace' => $firstWorkspace->slug]);
        }

        return $next($request);
    }
}
