<?php

namespace App\Http\Middleware;

use App\Core\Billing\EntitlementService;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureModuleEntitled
{
    public function __construct(
        protected EntitlementService $entitlementService
    ) {}

    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next, string $moduleKey): Response
    {
        $account = $request->attributes->get('account') ?? current_account();

        if (!$account) {
            abort(404, 'Account not found.');
        }

        $this->entitlementService->assertModuleEnabled($account, $moduleKey);

        return $next($request);
    }
}
