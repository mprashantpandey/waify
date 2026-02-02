<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureSuperAdmin
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
            // Store intended URL for redirect after login
            return redirect()->guest(route('login'));
        }

        if (!$user->isSuperAdmin()) {
            abort(403, 'Access denied. Super admin privileges required.');
        }

        return $next($request);
    }
}
