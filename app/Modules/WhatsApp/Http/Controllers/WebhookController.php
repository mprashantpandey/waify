<?php

namespace App\Modules\WhatsApp\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Modules\WhatsApp\Jobs\ProcessWebhookEventJob;
use App\Modules\WhatsApp\Models\WhatsAppConnection;
use App\Modules\WhatsApp\Models\WhatsAppWebhookEvent;
use App\Modules\WhatsApp\Services\WebhookEventClassifier;
use App\Modules\WhatsApp\Services\WebhookProcessor;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Str;

class WebhookController extends Controller
{
    public function __construct(
        protected WebhookProcessor $webhookProcessor,
        protected WebhookEventClassifier $webhookEventClassifier
    ) {
        // Disable CSRF for webhook endpoints
        $this->middleware(\Illuminate\Foundation\Http\Middleware\ValidateCsrfToken::class)->except(['verify', 'receive']);
    }

    /**
     * Verify webhook endpoint (GET).
     */
    public function verify(Request $request, WhatsAppConnection $connection)
    {
        try {
            // Connection is already resolved by route model binding
            Log::info('[Meta-WhatsApp-Webhook] GET verify called', [
                'connection_id' => $connection->id,
                'connection_slug' => $connection->slug,
                'path' => $request->path(),
            ]);
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
            $mode = is_string($mode) ? trim($mode) : $mode;
                
            $token = $request->query('hub.verify_token')
                ?? $request->query('hub_verify_token')
                ?? $request->input('hub.verify_token')
                ?? $request->input('hub_verify_token');
            $token = is_string($token) ? trim($token) : $token;
                
            $challenge = $request->query('hub.challenge')
                ?? $request->query('hub_challenge')
                ?? $request->input('hub.challenge')
                ?? $request->input('hub_challenge');
            $challenge = is_string($challenge) ? trim($challenge) : $challenge;

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
            $expectedToken = $connection->webhook_verify_token;
            $expectedToken = is_string($expectedToken) ? trim($expectedToken) : $expectedToken;
            $tokenValid = !empty($token) && !empty($expectedToken) && hash_equals($expectedToken, $token);
            
            Log::channel('whatsapp')->info('Webhook verification checks', [
                'connection_id' => $connection->id,
                'mode_valid' => $modeValid,
                'token_valid' => $tokenValid,
                'has_challenge' => !empty($challenge),
            ]);

            if ($modeValid && $tokenValid && !empty($challenge)) {
                // Mark as subscribed
                $connection->update(['webhook_subscribed' => true]);

                Log::info('[Meta-WhatsApp-Webhook] GET verify success', ['connection_id' => $connection->id]);
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
        } catch (\Exception $e) {
            Log::channel('whatsapp')->error('Webhook verification exception', [
                'connection_id' => $connection->id ?? null,
                'connection_slug' => $connection->slug ?? null,
                'ip' => $request->ip(),
                'error' => $e->getMessage(),
                'file' => $e->getFile(),
                'line' => $e->getLine(),
                'trace' => $e->getTraceAsString(),
            ]);
            
            // Re-throw to let Laravel handle it, but log first
            throw $e;
        }
    }

    /**
     * Receive webhook endpoint (POST).
     * Connection is resolved by route model binding (slug or id).
     */
    public function receive(Request $request, WhatsAppConnection $connection)
    {
        $correlationId = $request->attributes->get('webhook_correlation_id', Str::uuid()->toString());
        $signatureValid = $request->attributes->get('webhook_signature_valid');

        $entryCount = is_array($request->input('entry')) ? count($request->input('entry')) : 0;
        Log::info('[Meta-WhatsApp-Webhook] POST receive hit', [
            'connection_id' => $connection->id,
            'connection_slug' => $connection->slug,
            'entry_count' => $entryCount,
            'payload_keys' => array_keys($request->all()),
        ]);
        Log::channel('whatsapp')->info('WebhookController::receive POST', [
            'correlation_id' => $correlationId,
            'connection_id' => $connection->id,
            'connection_slug' => $connection->slug,
            'payload_keys' => array_keys($request->all()),
            'entry_count' => $entryCount,
        ]);

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
            Log::warning('[Meta-WhatsApp-Webhook] POST rejected: invalid payload (empty or no entry)', [
                'connection_id' => $connection->id,
                'payload_keys' => array_keys($payload),
            ]);
            Log::channel('whatsapp')->warning('Invalid webhook payload structure', [
                'correlation_id' => $correlationId,
                'connection_id' => $connection->id]);

            return response()->json([
                'success' => false,
                'error' => 'Invalid payload',
                'correlation_id' => $correlationId], 400);
        }

        // Log message presence for debugging (Meta sends entry[].changes[].value.messages)
        $entries = $payload['entry'] ?? [];
        $firstChange = $entries[0]['changes'][0] ?? null;
        $firstValue = $firstChange['value'] ?? [];
        $messageCount = isset($firstValue['messages']) ? count($firstValue['messages']) : 0;
        Log::info('[Meta-WhatsApp-Webhook] POST payload', [
            'connection_id' => $connection->id,
            'messages_count' => $messageCount,
            'field' => $firstChange['field'] ?? null,
        ]);
        Log::channel('whatsapp')->info('Webhook payload messages check', [
            'correlation_id' => $correlationId,
            'connection_id' => $connection->id,
            'first_change_field' => $firstChange['field'] ?? null,
            'value_keys' => array_keys($firstValue),
            'messages_count' => $messageCount,
        ]);

        // Log payload size (for monitoring)
        $payloadSize = strlen(json_encode($payload));
        if ($payloadSize > 100000) { // 100KB
            Log::channel('whatsapp')->warning('Large webhook payload', [
                'correlation_id' => $correlationId,
                'connection_id' => $connection->id,
                'size_bytes' => $payloadSize]);
        }

        $serializedPayload = json_encode($payload, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES) ?: '{}';
        $payloadFingerprint = sha1($serializedPayload);
        $signatureHeader = (string) ($request->header('X-Hub-Signature-256') ?? '');
        $idempotencySource = $signatureHeader !== '' ? $signatureHeader : $payloadFingerprint;
        $idempotencyKey = sha1(implode('|', [
            'whatsapp_meta',
            (string) $connection->id,
            $idempotencySource,
        ]));
        $dedupeTtlSeconds = max(30, (int) config('whatsapp.webhook.dedupe_ttl', 300));
        $dedupeKey = "wa:webhook:processed:{$connection->id}:{$idempotencyKey}";

        if (Cache::has($dedupeKey)) {
            Log::channel('whatsapp')->info('Duplicate webhook payload ignored (cache)', [
                'correlation_id' => $correlationId,
                'connection_id' => $connection->id,
                'idempotency_key' => $idempotencyKey,
            ]);

            return response()->json([
                'success' => true,
                'duplicate' => true,
                'correlation_id' => $correlationId,
            ], 200);
        }

        if (!Schema::hasTable('whatsapp_webhook_events')) {
            Log::channel('whatsapp')->warning('Webhook events table is missing; falling back to inline processing.', [
                'connection_id' => $connection->id,
            ]);
            try {
                $this->webhookProcessor->process($payload, $connection, $correlationId);
                Cache::put($dedupeKey, now()->timestamp, now()->addSeconds($dedupeTtlSeconds));

                return response()->json([
                    'success' => true,
                    'queued' => false,
                    'correlation_id' => $correlationId,
                ], 200);
            } catch (\Throwable $e) {
                Log::channel('whatsapp')->error('Fallback inline webhook processing failed', [
                    'connection_id' => $connection->id,
                    'correlation_id' => $correlationId,
                    'error' => $e->getMessage(),
                ]);

                return response()->json([
                    'success' => false,
                    'queued' => false,
                    'correlation_id' => $correlationId,
                    'error' => 'Processing failed',
                ], 200);
            }
        }

        $classification = $this->webhookEventClassifier->classify($payload);
        $headersSubset = [
            'x_hub_signature_256' => $signatureHeader,
            'x_forwarded_for' => (string) ($request->header('X-Forwarded-For') ?? ''),
            'x_request_id' => (string) ($request->header('X-Request-Id') ?? ''),
            'user_agent' => (string) ($request->userAgent() ?? ''),
        ];

        try {
            $event = WhatsAppWebhookEvent::create([
                'account_id' => $connection->account_id,
                'tenant_id' => $connection->account_id,
                'whatsapp_connection_id' => $connection->id,
                'provider' => 'whatsapp_meta',
                'event_type' => $classification['event_type'] ?? 'unknown',
                'object_type' => $classification['object_type'] ?? 'whatsapp_business_account',
                'idempotency_key' => $idempotencyKey,
                'correlation_id' => $correlationId,
                'status' => 'received',
                'payload' => $payload,
                'delivery_headers' => $headersSubset,
                'signature_valid' => is_bool($signatureValid) ? $signatureValid : null,
                'payload_size' => (int) $payloadSize,
                'ip' => $request->ip(),
                'user_agent' => (string) $request->userAgent(),
            ]);

            $connection->update([
                'webhook_last_received_at' => now(),
            ]);
        } catch (\Illuminate\Database\QueryException $e) {
            if (str_contains(strtolower($e->getMessage()), 'wa_webhook_events_provider_conn_idem_uq')) {
                Cache::put($dedupeKey, now()->timestamp, now()->addSeconds($dedupeTtlSeconds));
                return response()->json([
                    'success' => true,
                    'duplicate' => true,
                    'correlation_id' => $correlationId,
                ], 200);
            }

            throw $e;
        }

        ProcessWebhookEventJob::dispatch($event->id);
        Cache::put($dedupeKey, now()->timestamp, now()->addSeconds($dedupeTtlSeconds));

        return response()->json([
            'success' => true,
            'queued' => true,
            'event_id' => $event->id,
            'correlation_id' => $correlationId,
        ], 200);
    }

    /**
     * Resolve a connection by slug or ID.
     */
    protected function resolveConnection($value): ?WhatsAppConnection
    {
        if ($value instanceof WhatsAppConnection) {
            return $value;
        }

        $value = is_string($value) ? trim($value) : (string) $value;
        if ($value === '') {
            return null;
        }

        return WhatsAppConnection::where('slug', $value)
            ->orWhere('id', $value)
            ->first();
    }
}
