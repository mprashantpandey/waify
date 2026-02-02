<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureWorkspaceSubscribed
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

        $subscription = $workspace->subscription;

        // Allow access to billing pages always
        $route = $request->route()?->getName();
        if ($route && (str_contains($route, 'billing') || str_contains($route, 'settings'))) {
            return $next($request);
        }

        // If no subscription, allow (will be on free plan)
        if (!$subscription) {
            return $next($request);
        }

        // Block if past_due or canceled (no grace period for now)
        if ($subscription->isPastDue() || $subscription->isCanceled()) {
            return inertia('Billing/PastDue', [
                'workspace' => [
                    'name' => $workspace->name,
                    'slug' => $workspace->slug,
                ],
                'subscription' => [
                    'status' => $subscription->status,
                    'last_error' => $subscription->last_error,
                ],
            ])->toResponse($request)->setStatusCode(402);
        }

        return $next($request);
    }
}
