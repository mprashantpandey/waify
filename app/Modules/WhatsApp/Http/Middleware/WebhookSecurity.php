<?php

namespace App\Modules\WhatsApp\Http\Middleware;

use App\Modules\WhatsApp\Support\WebhookLogSanitizer;
use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpKernel\Exception\HttpExceptionInterface;

class WebhookSecurity
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        $appSecret = config('whatsapp.meta.app_secret');
        $signatureHeader = $request->header('X-Hub-Signature-256');
        $requireSignature = config('whatsapp.tech_provider.verified_mode', false);
        $signatureValid = null;

        if ($request->isMethod('post')) {
            if ($requireSignature && empty($appSecret)) {
                Log::channel('whatsapp')->error('Webhook POST rejected: missing Meta app secret in verified mode', WebhookLogSanitizer::requestContext($request));
                abort(401, 'Webhook signature verification is required');
            }

            if (!empty($appSecret)) {
                if (!$signatureHeader) {
                    Log::channel('whatsapp')->warning('Webhook POST rejected: missing signature', WebhookLogSanitizer::requestContext($request));
                    abort(401, 'Missing signature');
                }

                $rawBody = $request->getContent();
                $expected = 'sha256=' . hash_hmac('sha256', $rawBody, $appSecret);
                $signatureValid = hash_equals($expected, $signatureHeader);

                if (!$signatureValid) {
                    Log::channel('whatsapp')->warning('Webhook POST rejected: invalid signature', WebhookLogSanitizer::requestContext($request));
                    abort(401, 'Invalid signature');
                }
            }
        }

        $allowedIpsConfig = config('whatsapp.webhook.allowed_ips', '');
        if (!empty($allowedIpsConfig)) {
            $allowedIps = array_values(array_filter(array_map('trim', explode(',', $allowedIpsConfig))));
            $requestIp = $request->ip();
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
                Log::channel('whatsapp')->warning('Webhook blocked: IP not in allowlist', WebhookLogSanitizer::requestContext($request, [
                    'allowlist_count' => count($allowedIps),
                ]));

                abort(403, 'Forbidden');
            }
        }

        $correlationId = uniqid('wh_', true);
        $request->attributes->set('webhook_correlation_id', $correlationId);
        $request->attributes->set('webhook_signature_valid', $signatureValid);

        if (config('whatsapp.webhook.debug_logging', false)) {
            Log::channel('whatsapp')->info('Webhook request received', WebhookLogSanitizer::requestContext($request, [
                'correlation_id' => $correlationId,
                'has_entry' => $request->has('entry'),
            ]));
        }

        try {
            $response = $next($request);

            if (config('whatsapp.webhook.debug_logging', false)) {
                Log::channel('whatsapp')->info('Webhook request processed', [
                    'correlation_id' => $correlationId,
                    'status' => $response->getStatusCode(),
                ]);
            }

            return $response;
        } catch (HttpExceptionInterface $e) {
            throw $e;
        } catch (\Throwable $e) {
            Log::channel('whatsapp')->error('Webhook processing exception', WebhookLogSanitizer::exceptionContext($e, [
                'correlation_id' => $correlationId,
            ]));

            return response()->json([
                'success' => false,
                'error' => 'Webhook processing failed',
                'correlation_id' => $correlationId,
            ], 500);
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
        $ipLong = $ipLong & 0xFFFFFFFF;
        $networkLong = $networkLong & 0xFFFFFFFF;
        $mask = $prefixLen === 0 ? 0 : (0xFFFFFFFF << (32 - $prefixLen)) & 0xFFFFFFFF;

        return ($ipLong & $mask) === ($networkLong & $mask);
    }
}
