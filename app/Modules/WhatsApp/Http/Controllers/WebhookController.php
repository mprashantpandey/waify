<?php

namespace App\Modules\WhatsApp\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\PlatformSetting;
use App\Modules\WhatsApp\Jobs\ProcessWebhookEventJob;
use App\Modules\WhatsApp\Models\WhatsAppConnection;
use App\Modules\WhatsApp\Models\WhatsAppWebhookEvent;
use App\Modules\WhatsApp\Services\WebhookConnectionResolver;
use App\Modules\WhatsApp\Services\WebhookEventClassifier;
use App\Modules\WhatsApp\Services\WebhookProcessor;
use App\Modules\WhatsApp\Support\WebhookLogSanitizer;
use Illuminate\Database\QueryException;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Str;

class WebhookController extends Controller
{
    public function __construct(
        protected WebhookProcessor $webhookProcessor,
        protected WebhookEventClassifier $webhookEventClassifier,
        protected WebhookConnectionResolver $webhookConnectionResolver
    ) {
        $this->middleware(\Illuminate\Foundation\Http\Middleware\ValidateCsrfToken::class)->except(['verify', 'receive']);
    }

    public function verify(Request $request)
    {
        try {
            $verifyToken = (string) PlatformSetting::get('whatsapp.webhook_verify_token', config('whatsapp.webhook.verify_token', ''));

            if (config('whatsapp.webhook.debug_logging', false)) {
                Log::channel('whatsapp')->info('Central webhook verify called', WebhookLogSanitizer::requestContext($request));
            }

            $key = 'webhook-verify-central-'.$request->ip();
            if (RateLimiter::tooManyAttempts($key, 10)) {
                abort(429, 'Too many requests');
            }
            RateLimiter::hit($key, 60);

            $mode = $this->queryValue($request, 'hub.mode', 'hub_mode');
            $token = $this->queryValue($request, 'hub.verify_token', 'hub_verify_token');
            $challenge = $this->queryValue($request, 'hub.challenge', 'hub_challenge');

            if (config('whatsapp.webhook.debug_logging', false)) {
                Log::channel('whatsapp')->info('Central webhook verification attempt', WebhookLogSanitizer::verifyAttemptContext(
                    $request,
                    $mode,
                    $challenge,
                    $verifyToken !== ''
                ));
            }

            if ($verifyToken === '') {
                abort(403, 'Central webhook verify token is not configured');
            }

            $modeValid = $mode === 'subscribe';
            $tokenValid = !empty($token) && hash_equals(trim($verifyToken), trim((string) $token));

            if ($modeValid && $tokenValid && !empty($challenge)) {
                return response((string) $challenge, 200)
                    ->header('Content-Type', 'text/plain; charset=UTF-8');
            }

            abort(403, 'Forbidden');
        } catch (\Throwable $e) {
            Log::channel('whatsapp')->error('Central webhook verification exception', WebhookLogSanitizer::exceptionContext($e, [
                'ip' => $request->ip(),
                'path' => $request->path(),
            ]));

            throw $e;
        }
    }

    public function receive(Request $request)
    {
        $correlationId = $request->attributes->get('webhook_correlation_id', Str::uuid()->toString());
        $signatureValid = $request->attributes->get('webhook_signature_valid');
        $payload = $request->all();

        if (empty($payload) || !isset($payload['entry'])) {
            Log::channel('whatsapp')->warning('Invalid central webhook payload structure', [
                'correlation_id' => $correlationId,
                'payload_keys' => array_keys($payload),
            ]);

            return response()->json([
                'success' => false,
                'error' => 'Invalid payload',
                'correlation_id' => $correlationId,
            ], 400);
        }

        $resolution = $this->webhookConnectionResolver->resolve($payload);
        /** @var WhatsAppConnection|null $connection */
        $connection = $resolution['connection'];
        $phoneNumberId = $resolution['phone_number_id'];
        $wabaId = $resolution['waba_id'];

        if (!$connection) {
            Log::channel('whatsapp')->warning('Central webhook payload could not be mapped to a connection', [
                'correlation_id' => $correlationId,
                'phone_number_id' => $phoneNumberId,
                'waba_id' => $wabaId,
            ]);

            return response()->json([
                'success' => true,
                'queued' => false,
                'ignored' => true,
                'correlation_id' => $correlationId,
                'error' => 'No matching WhatsApp connection found for this webhook payload.',
            ], 202);
        }

        $entryCount = is_array($payload['entry'] ?? null) ? count($payload['entry']) : 0;
        Log::channel('whatsapp')->info('Central webhook received', [
            'correlation_id' => $correlationId,
            'connection_id' => $connection->id,
            'phone_number_id' => $phoneNumberId,
            'waba_id' => $wabaId,
            'entry_count' => $entryCount,
        ]);

        $rateKey = 'webhook-receive-'.$connection->id;
        $maxAttempts = (int) config('whatsapp.webhook.rate_limit', 100);
        $decayMinutes = (int) config('whatsapp.webhook.rate_limit_decay', 1);

        if (RateLimiter::tooManyAttempts($rateKey, $maxAttempts)) {
            return response()->json([
                'success' => false,
                'error' => 'Rate limit exceeded',
                'correlation_id' => $correlationId,
            ], 429);
        }
        RateLimiter::hit($rateKey, $decayMinutes * 60);

        $entries = $payload['entry'] ?? [];
        $firstChange = $entries[0]['changes'][0] ?? null;
        $firstValue = $firstChange['value'] ?? [];
        $messageCount = isset($firstValue['messages']) ? count($firstValue['messages']) : 0;
        $payloadSize = strlen(json_encode($payload) ?: '{}');

        if ($payloadSize > 100000) {
            Log::channel('whatsapp')->warning('Large central webhook payload', [
                'correlation_id' => $correlationId,
                'connection_id' => $connection->id,
                'size_bytes' => $payloadSize,
            ]);
        }

        $serializedPayload = json_encode($payload, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES) ?: '{}';
        $payloadFingerprint = sha1($serializedPayload);
        $signatureHeader = (string) ($request->header('X-Hub-Signature-256') ?? '');
        $idempotencySource = $signatureHeader !== '' ? $signatureHeader : $payloadFingerprint;
        $idempotencyKey = sha1(implode('|', ['whatsapp_meta', (string) $connection->id, $idempotencySource]));
        $dedupeTtlSeconds = max(30, (int) config('whatsapp.webhook.dedupe_ttl', 300));
        $dedupeKey = "wa:webhook:processed:{$connection->id}:{$idempotencyKey}";

        if (!Cache::add($dedupeKey, [
            'status' => 'processing',
            'correlation_id' => $correlationId,
            'claimed_at' => now()->timestamp,
        ], now()->addSeconds($dedupeTtlSeconds))) {
            return response()->json([
                'success' => true,
                'duplicate' => true,
                'correlation_id' => $correlationId,
            ], 200);
        }

        $releaseDedupeKey = true;

        try {
            if (!Schema::hasTable('whatsapp_webhook_events')) {
                try {
                    $this->webhookProcessor->process($payload, $connection, $correlationId);
                    Cache::put($dedupeKey, [
                        'status' => 'processed',
                        'correlation_id' => $correlationId,
                        'processed_at' => now()->timestamp,
                    ], now()->addSeconds($dedupeTtlSeconds));
                    $releaseDedupeKey = false;

                    return response()->json([
                        'success' => true,
                        'queued' => false,
                        'correlation_id' => $correlationId,
                    ], 200);
                } catch (\Throwable $e) {
                    Log::channel('whatsapp')->error('Fallback inline central webhook processing failed', [
                        'connection_id' => $connection->id,
                        'correlation_id' => $correlationId,
                        'exception' => $e::class,
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
                'x_request_id' => (string) ($request->header('X-Request-Id') ?? ''),
                'message_count' => $messageCount,
                'phone_number_id' => $phoneNumberId,
                'waba_id' => $wabaId,
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
                    'payload_size' => $payloadSize,
                    'ip' => $request->ip(),
                    'user_agent' => (string) $request->userAgent(),
                ]);

                $connection->update([
                    'webhook_last_received_at' => now(),
                ]);
            } catch (QueryException $e) {
                if (str_contains(strtolower($e->getMessage()), 'wa_webhook_events_provider_conn_idem_uq')) {
                    Cache::put($dedupeKey, [
                        'status' => 'duplicate',
                        'correlation_id' => $correlationId,
                        'processed_at' => now()->timestamp,
                    ], now()->addSeconds($dedupeTtlSeconds));
                    $releaseDedupeKey = false;

                    return response()->json([
                        'success' => true,
                        'duplicate' => true,
                        'correlation_id' => $correlationId,
                    ], 200);
                }

                throw $e;
            }

            ProcessWebhookEventJob::dispatch($event->id);
            Cache::put($dedupeKey, [
                'status' => 'queued',
                'correlation_id' => $correlationId,
                'event_id' => $event->id,
                'queued_at' => now()->timestamp,
            ], now()->addSeconds($dedupeTtlSeconds));
            $releaseDedupeKey = false;

            return response()->json([
                'success' => true,
                'queued' => true,
                'event_id' => $event->id,
                'correlation_id' => $correlationId,
            ], 200);
        } finally {
            if ($releaseDedupeKey) {
                Cache::forget($dedupeKey);
            }
        }
    }

    protected function queryValue(Request $request, string $dotKey, string $underscoreKey): ?string
    {
        $value = $request->query($dotKey)
            ?? $request->query($underscoreKey)
            ?? $request->input($dotKey)
            ?? $request->input($underscoreKey);

        if ($value === null) {
            return null;
        }

        $value = trim((string) $value);

        return $value === '' ? null : $value;
    }
}
