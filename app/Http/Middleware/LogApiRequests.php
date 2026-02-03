<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Symfony\Component\HttpFoundation\Response;

class LogApiRequests
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        $settingsService = app(\App\Services\PlatformSettingsService::class);
        $logEnabled = (bool) \App\Models\PlatformSetting::get('analytics.log_api_requests', false);
        $logLevel = \App\Models\PlatformSetting::get('analytics.log_level', 'info');

        if (!$logEnabled) {
            return $next($request);
        }

        $start = microtime(true);
        $response = $next($request);
        $durationMs = (microtime(true) - $start) * 1000;

        Log::log($logLevel, 'API request', [
            'method' => $request->method(),
            'path' => $request->path(),
            'status' => $response->getStatusCode(),
            'duration_ms' => round($durationMs, 2),
            'ip' => $request->ip(),
            'user_id' => $request->user()?->id,
        ]);

        return $response;
    }
}
