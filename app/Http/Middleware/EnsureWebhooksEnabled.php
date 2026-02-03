<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureWebhooksEnabled
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        $settingsService = app(\App\Services\PlatformSettingsService::class);
        $features = $settingsService->getFeatures();
        $webhooksEnabled = (bool) ($features['webhooks'] ?? true);
        $integrationsEnabled = (bool) \App\Models\PlatformSetting::get('integrations.webhooks_enabled', true);
        $razorpayEnabled = (bool) \App\Models\PlatformSetting::get('payment.razorpay_enabled', false);

        if (!$webhooksEnabled || !$integrationsEnabled) {
            return response()->json([
                'success' => false,
                'message' => 'Webhooks are currently disabled.',
            ], 503);
        }

        if ($request->is('webhooks/razorpay') && !$razorpayEnabled) {
            return response()->json([
                'success' => false,
                'message' => 'Razorpay webhooks are currently disabled.',
            ], 503);
        }

        return $next($request);
    }
}
