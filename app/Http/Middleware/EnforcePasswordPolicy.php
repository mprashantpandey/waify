<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;
use App\Services\PlatformSettingsService;

class EnforcePasswordPolicy
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        // This middleware can be used to check password expiry, etc.
        // Password validation rules are applied in form requests/controllers
        
        return $next($request);
    }
}

