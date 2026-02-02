<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;
use App\Services\PlatformSettingsService;

class ApplyPlatformSettings
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        $settingsService = app(PlatformSettingsService::class);
        
        // Apply localization settings
        $settingsService->applyLocalization();
        
        // Apply mail configuration
        $settingsService->applyMailConfig();
        
        // Apply Pusher configuration
        $settingsService->applyPusherConfig();
        
        // Apply WhatsApp Meta configuration
        $settingsService->applyWhatsAppConfig();

        return $next($request);
    }
}
