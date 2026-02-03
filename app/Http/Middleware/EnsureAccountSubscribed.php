<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureAccountSubscribed
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        $account = $request->attributes->get('account') ?? current_account();

        if (!$account) {
            abort(404, 'Account not found.');
        }

        $subscription = $account->subscription;

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
                'account' => [
                    'name' => $account->name,
                    'slug' => $account->slug],
                'subscription' => [
                    'status' => $subscription->status,
                    'last_error' => $subscription->last_error]])->toResponse($request)->setStatusCode(402);
        }

        return $next($request);
    }
}
