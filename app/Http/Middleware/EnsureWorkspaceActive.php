<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureWorkspaceActive
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        $workspace = $request->attributes->get('workspace') ?? current_workspace();

        if (!$workspace) {
            abort(404, 'Workspace not found.');
        }

        // Super admins can access disabled workspaces
        $user = $request->user();
        if ($user && $user->isSuperAdmin()) {
            return $next($request);
        }

        // Always allow access to billing routes (needed for payment processing)
        $route = $request->route()?->getName();
        $path = $request->path();
        if (($route && (str_contains($route, 'billing') || str_contains($route, 'settings'))) 
            || str_contains($path, 'billing') || str_contains($path, 'settings')) {
            return $next($request);
        }

        // Check if workspace is active
        if (!$workspace->isActive()) {
            return inertia('WorkspaceSuspended', [
                'workspace' => [
                    'name' => $workspace->name,
                    'status' => $workspace->status,
                    'disabled_reason' => $workspace->disabled_reason,
                ],
            ])->toResponse($request)->setStatusCode(403);
        }

        return $next($request);
    }
}
