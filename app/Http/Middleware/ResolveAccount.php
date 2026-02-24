<?php

namespace App\Http\Middleware;

use App\Models\Account;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class ResolveAccount
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();
        if (!$user) {
            return $next($request);
        }

        // Super admins should use platform panel directly unless they are in an active impersonation session.
        if ($user->isSuperAdmin() && !$request->session()->has('impersonator_id')) {
            return redirect()
                ->route('platform.dashboard')
                ->with('info', 'Platform admins must use the Platform Panel. Use impersonation to access a tenant workspace.');
        }

        $account = null;
        $accountId = session('current_account_id');
        if ($accountId) {
            $account = Account::find($accountId);
        }

        if (!$account) {
            $account = $user->ownedAccounts()->first();
        }

        if (!$account) {
            $account = $user->accounts()->first();
        }

        if (!$account) {
            return redirect()->route('onboarding');
        }

        // Ensure user has access to resolved account
        if (!$user->canAccessAccount($account)) {
            abort(403, 'You do not have access to this account');
        }

        $request->attributes->set('account', $account);
        session(['current_account_id' => $account->id]);

        return $next($request);
    }
}
