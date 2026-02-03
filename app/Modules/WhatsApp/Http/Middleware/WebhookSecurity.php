<?php

namespace App\Modules\WhatsApp\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Symfony\Component\HttpFoundation\Response;

class WebhookSecurity
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        // Verify request signature if app secret configured
        $appSecret = config('whatsapp.meta.app_secret');
        $signatureHeader = $request->header('X-Hub-Signature-256');
        if (!empty($appSecret) && $request->isMethod('post')) {
            if (!$signatureHeader) {
                abort(401, 'Missing signature');
            }

            $rawBody = $request->getContent();
            $expected = 'sha256=' . hash_hmac('sha256', $rawBody, $appSecret);

            if (!hash_equals($expected, $signatureHeader)) {
                abort(401, 'Invalid signature');
            }
        }

        // Check IP allowlist if configured
        $allowedIpsConfig = config('whatsapp.webhook.allowed_ips', '');
        if (!empty($allowedIpsConfig)) {
            $allowedIps = array_map('trim', explode(',', $allowedIpsConfig));
            $requestIp = $request->ip();

            // Check exact match or CIDR notation
            $allowed = false;
            foreach ($allowedIps as $allowedIp) {
                if ($requestIp === $allowedIp) {
                    $allowed = true;
                    break;
                }
                // Basic CIDR check (simplified)
                if (str_contains($allowedIp, '/')) {
                    // For production, use a proper CIDR library
                    // This is a basic check
                    $parts = explode('/', $allowedIp);
                    if (count($parts) === 2) {
                        $network = $parts[0];
                        $prefix = (int) $parts[1];
                        // Simplified: just check if IP starts with network
                        if (str_starts_with($requestIp, $network)) {
                            $allowed = true;
                            break;
                        }
                    }
                }
            }

            if (!$allowed) {
                Log::channel('whatsapp')->warning('Webhook blocked: IP not in allowlist', [
                    'ip' => $requestIp,
                    'connection_id' => $request->route('connection')?->id,
                    'allowed_ips' => $allowedIps]);

                abort(403, 'Forbidden');
            }
        }

        // Generate correlation ID for request tracking
        $correlationId = uniqid('wh_', true);
        $request->attributes->set('webhook_correlation_id', $correlationId);

        // Log request (truncated payload) - log early to catch all requests
        $connection = $request->route('connection');
        Log::channel('whatsapp')->info('Webhook request received in WebhookSecurity', [
            'correlation_id' => $correlationId,
            'ip' => $request->ip(),
            'method' => $request->method(),
            'path' => $request->path(),
            'connection_id' => $connection?->id,
            'connection_slug' => $connection?->slug,
            'connection_param' => $request->route()->parameter('connection'),
            'has_entry' => $request->has('entry'),
            'query_params' => $request->query(),
            'user_agent' => substr($request->userAgent() ?? '', 0, 100), // Truncate
        ]);

        try {
            $response = $next($request);

            Log::channel('whatsapp')->info('Webhook request processed', [
                'correlation_id' => $correlationId,
                'status' => $response->getStatusCode()]);

            return $response;
        } catch (\Exception $e) {
            // Log error safely (no stack trace in response)
            Log::channel('whatsapp')->error('Webhook processing exception', [
                'correlation_id' => $correlationId,
                'error' => $e->getMessage(),
                'file' => basename($e->getFile()),
                'line' => $e->getLine(),
                'trace' => substr($e->getTraceAsString(), 0, 500), // Truncated trace
            ]);

            // Return generic error (no stack trace)
            return response()->json([
                'success' => false,
                'error' => 'Webhook processing failed',
                'correlation_id' => $correlationId], 500);
        }
    }
}
