<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;
use App\Services\PlatformSettingsService;

class EnsureMaintenanceMode
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        // Skip maintenance mode check for webhooks (they need to work even during maintenance)
        if ($request->is('webhooks/*')) {
            return $next($request);
        }
        
        $settingsService = app(PlatformSettingsService::class);
        
        if ($settingsService->isMaintenanceMode()) {
            // Allow super admins to access during maintenance
            if (!$request->user() || !$request->user()->isSuperAdmin()) {
                $general = $settingsService->getGeneral();
                $message = $general['maintenance_message'] ?? 'We are currently performing scheduled maintenance. Please check back shortly.';
                
                if ($request->expectsJson()) {
                    return response()->json([
                        'message' => $message,
                        'maintenance' => true], 503);
                }
                
                return response()->view('maintenance', [
                    'message' => $message], 503);
            }
        }

        return $next($request);
    }
}

