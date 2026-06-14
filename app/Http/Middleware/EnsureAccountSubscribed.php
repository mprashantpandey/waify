<?php

namespace App\Http\Middleware;

use App\Core\Billing\SubscriptionService;
use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Symfony\Component\HttpFoundation\Response;

class EnsureAccountSubscribed
{
    public function __construct(
        protected SubscriptionService $subscriptionService
    ) {}

    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        $account = $request->attributes->get('account') ?? current_account();

        if (! $account) {
            abort(404, 'Account not found.');
        }

        $subscription = $account->subscription;
        if ($subscription) {
            $subscription = $this->subscriptionService->syncAndNormalize($subscription);
        }

        // Allow access to billing pages always
        $route = $request->route()?->getName();
        if ($route && Str::contains($route, ['billing', 'settings', 'workspaces'])) {
            return $next($request);
        }

        // Read-only pages stay accessible; only actions require an active plan.
        if ($request->isMethodSafe()) {
            return $next($request);
        }

        if (! $subscription) {
            return $this->blockedActionResponse($request, 'Please select a plan before using this action.');
        }

        if ($subscription->isPastDue() || $subscription->isCanceled()) {
            return $this->blockedActionResponse($request, $subscription->last_error ?: 'Your plan is not active. Renew your plan before using this action.');
        }

        return $next($request);
    }

    protected function blockedActionResponse(Request $request, string $message): Response
    {
        if ($request->expectsJson()) {
            return response()->json([
                'message' => $message,
                'billing_required' => true,
            ], 402);
        }

        return redirect()->route('app.billing.index', ['tab' => 'plans'])
            ->withErrors(['billing' => $message])
            ->with('error', $message);
    }
}
