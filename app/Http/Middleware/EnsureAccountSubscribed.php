<?php

namespace App\Http\Middleware;

use App\Core\Billing\SubscriptionService;
use App\Core\Billing\SubscriptionAccessService;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureAccountSubscribed
{
    public function __construct(
        protected SubscriptionService $subscriptionService,
        protected SubscriptionAccessService $subscriptionAccessService
    ) {
    }

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
        if ($subscription) {
            $subscription = $this->subscriptionService->syncAndNormalize($subscription);
        }

        $gate = $this->subscriptionAccessService->evaluate($account, $subscription);
        $route = $request->route()?->getName();

        if ($gate['state'] === 'no_subscription') {
            if ($this->subscriptionAccessService->routeAllowedWhenBlocked($route)) {
                return $next($request);
            }
            return redirect()->route('app.billing.plans')
                ->with('warning', $gate['reason']);
        }

        if (($gate['blocked'] ?? false) === true && !$this->subscriptionAccessService->routeAllowedWhenBlocked($route)) {
            return inertia('Billing/PastDue', [
                'account' => [
                    'name' => $account->name,
                    'slug' => $account->slug],
                'subscription' => [
                    'status' => $subscription?->status,
                    'last_error' => $gate['reason']],
                'gate' => [
                    'state' => $gate['state'] ?? 'unknown',
                    'reason' => $gate['reason'] ?? null,
                    'recovery_actions' => $gate['recovery_actions'] ?? [],
                ],
            ])->toResponse($request)->setStatusCode(402);
        }

        return $next($request);
    }
}
