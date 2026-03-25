<?php

namespace App\Http\Middleware;

use App\Models\User;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureSupportAccess
{
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();

        if ($user && $user->isSuperAdmin()) {
            return $next($request);
        }

        if ((bool) $request->session()->get('impersonator_is_super_admin', false)) {
            return $next($request);
        }

        $impersonatorId = $request->session()->get('impersonator_id');
        if ($impersonatorId) {
            $impersonator = User::find($impersonatorId);

            if ($impersonator?->isSuperAdmin()) {
                return $next($request);
            }
        }

        abort(403, 'This page is restricted to platform support.');
    }
}
