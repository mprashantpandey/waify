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
        // Verify request signature (required when Meta Verified Tech Provider mode is on)
        $appSecret = config('whatsapp.meta.app_secret');
        $signatureHeader = $request->header('X-Hub-Signature-256');
        $requireSignature = config('whatsapp.tech_provider.verified_mode', false);

        if ($request->isMethod('post')) {
            if ($requireSignature && empty($appSecret)) {
                Log::channel('whatsapp')->error('Webhook POST rejected: META_VERIFIED_TECH_PROVIDER is on but META_APP_SECRET is not set');
                abort(401, 'Webhook signature verification is required');
            }

            if (!empty($appSecret)) {
                if (!$signatureHeader) {
                    Log::warning('[Meta-WhatsApp-Webhook] POST rejected: missing X-Hub-Signature-256 (app_secret is set)');
                    Log::channel('whatsapp')->warning('Webhook POST rejected: missing X-Hub-Signature-256 (app_secret is set)');
                    abort(401, 'Missing signature');
                }

                $rawBody = $request->getContent();
                $expected = 'sha256=' . hash_hmac('sha256', $rawBody, $appSecret);

                if (!hash_equals($expected, $signatureHeader)) {
                    Log::warning('[Meta-WhatsApp-Webhook] POST rejected: invalid signature (check META_APP_SECRET matches Meta App Secret)');
                    Log::channel('whatsapp')->warning('Webhook POST rejected: invalid signature (check META_APP_SECRET matches Meta App Secret)');
                    abort(401, 'Invalid signature');
                }
            }
        }

        // Check IP allowlist if configured
        $allowedIpsConfig = config('whatsapp.webhook.allowed_ips', '');
        if (!empty($allowedIpsConfig)) {
            $allowedIps = array_map('trim', explode(',', $allowedIpsConfig));
            $requestIp = $request->ip();

            // Check exact match or CIDR notation (IPv4)
            $allowed = false;
            foreach ($allowedIps as $allowedIp) {
                if ($requestIp === $allowedIp) {
                    $allowed = true;
                    break;
                }
                if (str_contains($allowedIp, '/')) {
                    $parts = explode('/', $allowedIp, 2);
                    if (count($parts) === 2) {
                        $network = trim($parts[0]);
                        $prefix = (int) $parts[1];
                        if ($prefix >= 0 && $prefix <= 32 && $this->ipInCidr($requestIp, $network, $prefix)) {
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
        $connectionParam = $request->route('connection');
        $connection = $connectionParam instanceof \App\Modules\WhatsApp\Models\WhatsAppConnection
            ? $connectionParam
            : \App\Modules\WhatsApp\Models\WhatsAppConnection::where('slug', (string) $connectionParam)
                ->orWhere('id', (string) $connectionParam)
                ->first();
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

    /**
     * Check if an IPv4 address is within a CIDR range.
     */
    private function ipInCidr(string $ip, string $network, int $prefixLen): bool
    {
        $ipLong = @ip2long($ip);
        $networkLong = @ip2long($network);
        if ($ipLong === false || $networkLong === false) {
            return false;
        }
        // 32-bit safe: use unsigned
        $ipLong = $ipLong & 0xFFFFFFFF;
        $networkLong = $networkLong & 0xFFFFFFFF;
        $mask = $prefixLen === 0 ? 0 : (0xFFFFFFFF << (32 - $prefixLen)) & 0xFFFFFFFF;
        return ($ipLong & $mask) === ($networkLong & $mask);
    }
}
