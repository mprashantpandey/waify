<?php

namespace App\Modules\WhatsApp\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Modules\WhatsApp\Models\WhatsAppConnection;
use App\Modules\WhatsApp\Services\WebhookProcessor;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;

class WebhookController extends Controller
{
    public function __construct(
        protected WebhookProcessor $webhookProcessor
    ) {
        // Disable CSRF for webhook endpoints
        $this->middleware(\Illuminate\Foundation\Http\Middleware\ValidateCsrfToken::class)->except(['verify', 'receive']);
    }

    /**
     * Verify webhook endpoint (GET).
     */
    public function verify(Request $request, WhatsAppConnection $connection)
    {
        // Log immediately when method is called
        Log::channel('whatsapp')->info('WebhookController::verify called', [
            'connection_id' => $connection->id,
            'connection_slug' => $connection->slug,
            'ip' => $request->ip(),
            'method' => $request->method(),
            'path' => $request->path(),
            'full_url' => $request->fullUrl(),
        ]);

        // Rate limit webhook verification
        $key = 'webhook-verify-' . $connection->id . '-' . $request->ip();
        if (RateLimiter::tooManyAttempts($key, 10)) {
            Log::channel('whatsapp')->warning('Webhook verification rate limited', [
                'connection_id' => $connection->id,
                'ip' => $request->ip()]);
            abort(429, 'Too many requests');
        }
        RateLimiter::hit($key, 60);

        // Meta sends parameters as query string: ?hub.mode=subscribe&hub.verify_token=xxx&hub.challenge=xxx
        // Also check for underscore format: hub_mode, hub_verify_token, hub_challenge
        $mode = $request->query('hub.mode') 
            ?? $request->query('hub_mode')
            ?? $request->input('hub.mode')
            ?? $request->input('hub_mode');
            
        $token = $request->query('hub.verify_token')
            ?? $request->query('hub_verify_token')
            ?? $request->input('hub.verify_token')
            ?? $request->input('hub_verify_token');
            
        $challenge = $request->query('hub.challenge')
            ?? $request->query('hub_challenge')
            ?? $request->input('hub.challenge')
            ?? $request->input('hub_challenge');

        // Log all incoming parameters for debugging
        Log::channel('whatsapp')->info('Webhook verification attempt', [
            'connection_id' => $connection->id,
            'connection_slug' => $connection->slug,
            'ip' => $request->ip(),
            'user_agent' => $request->userAgent(),
            'mode' => $mode,
            'token_received' => $token ? (strlen($token) > 4 ? substr($token, 0, 4) . '...' : '***') : null,
            'token_received_length' => $token ? strlen($token) : 0,
            'token_expected' => $connection->webhook_verify_token ? (strlen($connection->webhook_verify_token) > 4 ? substr($connection->webhook_verify_token, 0, 4) . '...' : '***') : null,
            'token_expected_length' => $connection->webhook_verify_token ? strlen($connection->webhook_verify_token) : 0,
            'has_challenge' => !empty($challenge),
            'challenge_length' => $challenge ? strlen($challenge) : 0,
            'all_query_params' => $request->query(),
            'all_input' => $request->all(),
        ]);

        // Check if connection has a verify token
        if (empty($connection->webhook_verify_token)) {
            Log::channel('whatsapp')->error('Webhook verification failed: connection has no verify token', [
                'connection_id' => $connection->id,
                'connection_slug' => $connection->slug,
                'ip' => $request->ip()]);
            abort(403, 'Connection not configured for webhooks');
        }

        // Verify mode and token - Meta requires exact match
        $modeValid = $mode === 'subscribe';
        $tokenValid = !empty($token) && hash_equals($connection->webhook_verify_token, $token);
        
        Log::channel('whatsapp')->info('Webhook verification checks', [
            'connection_id' => $connection->id,
            'mode_valid' => $modeValid,
            'token_valid' => $tokenValid,
            'has_challenge' => !empty($challenge),
        ]);

        if ($modeValid && $tokenValid && !empty($challenge)) {
            // Mark as subscribed
            $connection->update(['webhook_subscribed' => true]);

            Log::channel('whatsapp')->info('Webhook verified successfully - returning challenge', [
                'connection_id' => $connection->id,
                'connection_slug' => $connection->slug,
                'ip' => $request->ip(),
                'challenge_length' => strlen($challenge),
            ]);

            // Meta expects the challenge string as plain text response (200 OK)
            // Must return exactly the challenge value, nothing else
            return response($challenge, 200)
                ->header('Content-Type', 'text/plain; charset=UTF-8');
        }

        Log::channel('whatsapp')->warning('Webhook verification failed', [
            'connection_id' => $connection->id,
            'connection_slug' => $connection->slug,
            'ip' => $request->ip(),
            'mode' => $mode,
            'mode_valid' => $modeValid,
            'token_received' => $token ? (strlen($token) > 4 ? substr($token, 0, 4) . '...' : '***') : null,
            'token_expected' => substr($connection->webhook_verify_token, 0, 4) . '...',
            'token_valid' => $tokenValid,
            'has_challenge' => !empty($challenge),
            'all_checks_passed' => $modeValid && $tokenValid && !empty($challenge)]);

        abort(403, 'Forbidden');
    }

    /**
     * Receive webhook endpoint (POST).
     */
    public function receive(Request $request, WhatsAppConnection $connection)
    {
        $correlationId = $request->attributes->get('webhook_correlation_id', Str::uuid()->toString());

        // Rate limit webhook reception per connection
        $key = 'webhook-receive-' . $connection->id;
        $maxAttempts = config('whatsapp.webhook.rate_limit', 100);
        $decayMinutes = config('whatsapp.webhook.rate_limit_decay', 1);

        if (RateLimiter::tooManyAttempts($key, $maxAttempts)) {
            Log::channel('whatsapp')->warning('Webhook rate limit exceeded', [
                'correlation_id' => $correlationId,
                'connection_id' => $connection->id,
                'ip' => $request->ip()]);

            return response()->json([
                'success' => false,
                'error' => 'Rate limit exceeded',
                'correlation_id' => $correlationId], 429);
        }
        RateLimiter::hit($key, $decayMinutes * 60);

        // Validate payload structure (basic check)
        $payload = $request->all();
        if (empty($payload) || !isset($payload['entry'])) {
            Log::channel('whatsapp')->warning('Invalid webhook payload structure', [
                'correlation_id' => $correlationId,
                'connection_id' => $connection->id]);

            return response()->json([
                'success' => false,
                'error' => 'Invalid payload',
                'correlation_id' => $correlationId], 400);
        }

        // Log payload size (for monitoring)
        $payloadSize = strlen(json_encode($payload));
        if ($payloadSize > 100000) { // 100KB
            Log::channel('whatsapp')->warning('Large webhook payload', [
                'correlation_id' => $correlationId,
                'connection_id' => $connection->id,
                'size_bytes' => $payloadSize]);
        }

        try {
            // Process webhook with correlation ID
            $this->webhookProcessor->process($payload, $connection, $correlationId);

            return response()->json([
                'success' => true,
                'correlation_id' => $correlationId], 200);
        } catch (\Exception $e) {
            Log::channel('whatsapp')->error('Webhook processing error', [
                'correlation_id' => $correlationId,
                'connection_id' => $connection->id,
                'error' => $e->getMessage(),
                'file' => basename($e->getFile()),
                'line' => $e->getLine()]);

            // Still return 200 to Meta to prevent retries for processing errors
            // But log the error for investigation
            return response()->json([
                'success' => false,
                'error' => 'Processing failed',
                'correlation_id' => $correlationId], 200);
        }
    }
}
