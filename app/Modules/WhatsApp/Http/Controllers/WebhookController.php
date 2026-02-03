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
        // Rate limit webhook verification
        $key = 'webhook-verify-' . $connection->id . '-' . $request->ip();
        if (RateLimiter::tooManyAttempts($key, 10)) {
            abort(429, 'Too many requests');
        }
        RateLimiter::hit($key, 60);

        $mode = $request->query('hub_mode') ?? $request->query('hub.mode');
        $token = $request->query('hub_verify_token') ?? $request->query('hub.verify_token');
        $challenge = $request->query('hub_challenge') ?? $request->query('hub.challenge');

        if ($mode === 'subscribe' && $token === $connection->webhook_verify_token) {
            // Mark as subscribed
            $connection->update(['webhook_subscribed' => true]);

            Log::channel('whatsapp')->info('Webhook verified', [
                'connection_id' => $connection->id,
                'ip' => $request->ip()]);

            return response($challenge, 200);
        }

        Log::channel('whatsapp')->warning('Webhook verification failed', [
            'connection_id' => $connection->id,
            'ip' => $request->ip(),
            'mode' => $mode,
            'token_match' => $token === $connection->webhook_verify_token]);

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
