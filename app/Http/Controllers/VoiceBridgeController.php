<?php

namespace App\Http\Controllers;

use App\Models\AiAgent;
use App\Models\PlatformSetting;
use App\Models\WhatsAppCall;
use App\Models\WhatsAppCallVoiceSession;
use App\Modules\WhatsApp\Models\WhatsAppContact;
use App\Modules\WhatsApp\Models\WhatsAppConversation;
use App\Modules\WhatsApp\Models\WhatsAppMessage;
use App\Modules\WhatsApp\Services\WhatsAppClient;
use App\Services\AI\ConversationAssistantService;
use App\Services\Voice\VoiceProviderService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class VoiceBridgeController extends Controller
{
    public function __construct(
        protected WhatsAppClient $whatsAppClient,
        protected ConversationAssistantService $assistant,
        protected VoiceProviderService $voiceProvider
    ) {}

    public function claim(Request $request)
    {
        $this->authorizeBridge($request);
        $validated = $request->validate([
            'worker_id' => ['required', 'string', 'max:120'],
        ]);

        $session = DB::transaction(function () use ($validated) {
            $session = WhatsAppCallVoiceSession::with(['call', 'connection', 'agent'])
                ->whereIn('status', ['queued', 'retry'])
                ->orderBy('created_at')
                ->lockForUpdate()
                ->first();

            if (! $session) {
                return null;
            }

            $session->forceFill([
                'status' => 'claimed',
                'worker_id' => $validated['worker_id'],
                'claimed_at' => now(),
            ])->save();

            return $session;
        });

        if (! $session) {
            return response()->json(['session' => null]);
        }

        return response()->json(['session' => $this->formatSession($session)]);
    }

    public function connect(Request $request, WhatsAppCallVoiceSession $session)
    {
        $this->authorizeBridge($request);
        $validated = $request->validate([
            'worker_id' => ['required', 'string', 'max:120'],
            'sdp' => ['required', 'string', 'max:30000'],
        ]);
        $this->assertWorker($session, $validated['worker_id']);

        try {
            $call = $session->call;
            $connection = $session->connection;
            $payload = [
                'messaging_product' => 'whatsapp',
                'to' => preg_replace('/\D+/', '', (string) $call->phone_number),
                'action' => 'connect',
                'session' => [
                    'sdp_type' => 'offer',
                    'sdp' => $validated['sdp'],
                ],
            ];

            $result = $this->whatsAppClient->manageCall($connection, $payload);
            $providerCallId = $result['calls'][0]['id'] ?? $result['call_id'] ?? $result['id'] ?? $call->provider_call_id;

            $call->forceFill([
                'provider_call_id' => $providerCallId,
                'status' => 'initiated',
                'metadata' => array_merge($call->metadata ?? [], [
                    'voice_bridge_connect_response' => $result,
                ]),
            ])->save();

            $session->forceFill([
                'local_sdp' => $validated['sdp'],
                'status' => 'connecting',
                'metadata' => array_merge($session->metadata ?? [], ['connect_response' => $result]),
            ])->save();

            return response()->json([
                'session' => $this->formatSession($session->fresh(['call', 'connection', 'agent'])),
                'result' => $result,
            ]);
        } catch (\Throwable $e) {
            $this->markFailed($session, $e->getMessage());

            return response()->json(['message' => $e->getMessage()], 422);
        }
    }

    public function accept(Request $request, WhatsAppCallVoiceSession $session)
    {
        $this->authorizeBridge($request);
        $validated = $request->validate([
            'worker_id' => ['required', 'string', 'max:120'],
            'sdp' => ['required', 'string', 'max:30000'],
        ]);
        $this->assertWorker($session, $validated['worker_id']);

        try {
            $call = $session->call;
            $connection = $session->connection;
            $payload = [
                'messaging_product' => 'whatsapp',
                'call_id' => $call->provider_call_id,
                'action' => 'accept',
                'session' => [
                    'sdp_type' => 'answer',
                    'sdp' => $validated['sdp'],
                ],
            ];

            if (! $payload['call_id']) {
                throw new \RuntimeException('Meta call ID is not available yet.');
            }

            $result = $this->whatsAppClient->manageCall($connection, $payload);

            $call->forceFill([
                'status' => 'answered',
                'metadata' => array_merge($call->metadata ?? [], [
                    'voice_bridge_accept_response' => $result,
                ]),
            ])->save();

            $session->forceFill([
                'local_sdp' => $validated['sdp'],
                'status' => 'connected',
                'connected_at' => $session->connected_at ?: now(),
                'metadata' => array_merge($session->metadata ?? [], ['accept_response' => $result]),
            ])->save();

            return response()->json([
                'session' => $this->formatSession($session->fresh(['call', 'connection', 'agent'])),
                'result' => $result,
            ]);
        } catch (\Throwable $e) {
            $this->markFailed($session, $e->getMessage());

            return response()->json(['message' => $e->getMessage()], 422);
        }
    }

    public function poll(Request $request, WhatsAppCallVoiceSession $session)
    {
        $this->authorizeBridge($request);
        $workerId = (string) $request->query('worker_id', '');
        $this->assertWorker($session, $workerId);

        return response()->json(['session' => $this->formatSession($session->fresh(['call', 'connection', 'agent']))]);
    }

    public function transcript(Request $request, WhatsAppCallVoiceSession $session)
    {
        $this->authorizeBridge($request);
        $validated = $request->validate([
            'worker_id' => ['required', 'string', 'max:120'],
            'speaker' => ['required', 'string', 'in:customer,agent,system'],
            'text' => ['required', 'string', 'max:4000'],
        ]);
        $this->assertWorker($session, $validated['worker_id']);

        $entry = [
            'speaker' => $validated['speaker'],
            'text' => trim($validated['text']),
            'at' => now()->toIso8601String(),
        ];
        $transcript = array_values(array_merge($session->transcript ?? [], [$entry]));
        $session->forceFill(['transcript' => $transcript])->save();
        $session->call?->forceFill(['transcript' => $this->plainTranscript($transcript)])->save();

        return response()->json(['ok' => true]);
    }

    public function transcribe(Request $request, WhatsAppCallVoiceSession $session)
    {
        $this->authorizeBridge($request);
        $validated = $request->validate([
            'worker_id' => ['required', 'string', 'max:120'],
            'audio' => ['required', 'file', 'max:10240'],
        ]);
        $this->assertWorker($session, $validated['worker_id']);

        try {
            $result = $this->voiceProvider->transcribe($request->file('audio'));
            $text = trim((string) ($result['text'] ?? ''));
            if ($text !== '') {
                $this->appendTranscript($session, [
                    'speaker' => 'customer',
                    'text' => $text,
                    'provider' => $result['provider'] ?? null,
                ]);
            }

            return response()->json([
                'text' => $text,
                'provider' => $result['provider'] ?? null,
                'fallback_used' => $result['fallback_used'] ?? false,
            ]);
        } catch (\Throwable $e) {
            $this->markVoiceIssue($session, 'Speech-to-text failed: '.$e->getMessage());

            return response()->json(['message' => $e->getMessage()], 422);
        }
    }

    public function agentReply(Request $request, WhatsAppCallVoiceSession $session)
    {
        $this->authorizeBridge($request);
        $validated = $request->validate([
            'worker_id' => ['required', 'string', 'max:120'],
            'customer_text' => ['required', 'string', 'max:4000'],
        ]);
        $this->assertWorker($session, $validated['worker_id']);

        try {
            $conversation = $this->conversationForSession($session);
            $agent = $session->agent;
            $message = WhatsAppMessage::create([
                'account_id' => $session->account_id,
                'whatsapp_conversation_id' => $conversation->id,
                'direction' => 'inbound',
                'type' => 'text',
                'text_body' => $validated['customer_text'],
                'payload' => ['source' => 'voice_bridge', 'voice_session_id' => $session->id],
                'status' => 'received',
                'received_at' => now(),
            ]);

            $this->appendTranscript($session, [
                'speaker' => 'customer',
                'text' => $validated['customer_text'],
                'source' => 'agent_reply_request',
            ]);

            $reply = trim($this->assistant->suggestReply(
                $conversation,
                8,
                'You are speaking live on a phone call. Reply with exactly one complete sentence, 8 to 22 words. Never end with an unfinished phrase. If unsure, ask one clear follow-up question.',
                $agent,
                true,
                350
            ));
            $reply = $this->normalizeVoiceReply($reply);

            WhatsAppMessage::create([
                'account_id' => $session->account_id,
                'whatsapp_conversation_id' => $conversation->id,
                'direction' => 'outbound',
                'type' => 'text',
                'text_body' => $reply,
                'payload' => ['source' => 'voice_bridge', 'voice_session_id' => $session->id, 'inbound_message_id' => $message->id],
                'status' => 'generated',
            ]);

            $this->appendTranscript($session, [
                'speaker' => 'agent',
                'text' => $reply,
                'source' => 'ai_agent',
            ]);

            return response()->json(['reply' => $reply]);
        } catch (\Throwable $e) {
            $this->markVoiceIssue($session, 'AI voice reply failed: '.$e->getMessage());

            return response()->json(['message' => $e->getMessage()], 422);
        }
    }

    protected function normalizeVoiceReply(string $reply): string
    {
        $reply = trim(preg_replace('/\s+/', ' ', $reply) ?? $reply);
        if ($reply === '') {
            return 'I can help with that. Could you please repeat your question?';
        }

        $reply = Str::of($reply)
            ->replaceMatches('/^(Agent|Assistant|AI)\s*:\s*/i', '')
            ->trim()
            ->toString();

        $words = preg_split('/\s+/', $reply) ?: [];
        $lastWord = strtolower(trim(end($words) ?: '', " \t\n\r\0\x0B.,!?;:"));
        $incompleteEndings = [
            'a', 'an', 'and', 'are', 'as', 'at', 'but', 'by', 'can', 'could', 'for',
            'from', 'if', 'in', 'is', 'of', 'on', 'or', 'our', 'the', 'their', 'to',
            'with', 'would', 'your',
        ];

        if (! preg_match('/[.!?]$/', $reply) || in_array($lastWord, $incompleteEndings, true)) {
            return 'I can help with that. Which service or pricing detail would you like to discuss?';
        }

        if (count($words) > 34) {
            $sentences = preg_split('/(?<=[.!?])\s+/', $reply, 2) ?: [];
            $reply = trim($sentences[0] ?? $reply);
            if (! preg_match('/[.!?]$/', $reply)) {
                $reply .= '.';
            }
        }

        return $reply;
    }

    public function synthesize(Request $request, WhatsAppCallVoiceSession $session)
    {
        $this->authorizeBridge($request);
        $validated = $request->validate([
            'worker_id' => ['required', 'string', 'max:120'],
            'text' => ['required', 'string', 'max:1000'],
        ]);
        $this->assertWorker($session, $validated['worker_id']);

        try {
            $result = $this->voiceProvider->synthesize($validated['text']);

            return response()->json($result);
        } catch (\Throwable $e) {
            $this->markVoiceIssue($session, 'Text-to-speech failed: '.$e->getMessage());

            return response()->json(['message' => $e->getMessage()], 422);
        }
    }

    public function finish(Request $request, WhatsAppCallVoiceSession $session)
    {
        $this->authorizeBridge($request);
        $validated = $request->validate([
            'worker_id' => ['required', 'string', 'max:120'],
            'status' => ['nullable', 'string', 'in:completed,failed'],
            'error' => ['nullable', 'string', 'max:1000'],
        ]);
        $this->assertWorker($session, $validated['worker_id']);

        $transcript = trim((string) ($session->call?->transcript ?: ''));
        $status = $validated['status'] ?? 'completed';
        $summary = $status === 'failed'
            ? ($validated['error'] ?: 'Voice bridge session failed.')
            : ($transcript !== '' ? Str::limit($transcript, 500) : 'Call completed, but no transcript was captured by the voice bridge.');

        $session->forceFill([
            'status' => $validated['status'] ?? 'completed',
            'ended_at' => now(),
            'last_error' => $validated['error'] ?? null,
        ])->save();
        $session->call?->forceFill([
            'status' => $status === 'failed' ? 'failed' : 'completed',
            'ended_at' => now(),
            'summary' => $summary,
            'metadata' => array_merge($session->call?->metadata ?? [], [
                'voice_bridge_has_transcript' => $transcript !== '',
                'voice_bridge_finished_at' => now()->toIso8601String(),
            ]),
        ])->save();

        return response()->json(['ok' => true]);
    }

    protected function authorizeBridge(Request $request): void
    {
        $expected = (string) (PlatformSetting::get('ai.voice_bridge_secret') ?: config('services.voice_bridge.secret'));
        abort_if($expected === '' || ! hash_equals($expected, (string) $request->header('X-Voice-Bridge-Secret')), 401);
    }

    protected function assertWorker(WhatsAppCallVoiceSession $session, string $workerId): void
    {
        abort_if($session->worker_id && ! hash_equals((string) $session->worker_id, $workerId), 409, 'Session is claimed by another worker.');
    }

    protected function formatSession(WhatsAppCallVoiceSession $session): array
    {
        return [
            'id' => $session->id,
            'status' => $session->status,
            'direction' => $session->direction,
            'remote_sdp' => $session->remote_sdp,
            'call' => [
                'id' => $session->call?->id,
                'provider_call_id' => $session->call?->provider_call_id,
                'phone_number' => $session->call?->phone_number,
                'status' => $session->call?->status,
            ],
            'agent' => [
                'id' => $session->agent?->id,
                'name' => $session->agent?->name,
                'role' => $session->agent?->role,
                'language' => $session->agent?->language,
            ],
        ];
    }

    protected function conversationForSession(WhatsAppCallVoiceSession $session): WhatsAppConversation
    {
        $call = $session->call;
        $waId = preg_replace('/\D+/', '', (string) $call->phone_number);
        $contact = WhatsAppContact::firstOrCreate(
            ['account_id' => $session->account_id, 'wa_id' => $waId],
            ['name' => $waId, 'phone' => $waId, 'status' => 'active', 'source' => 'voice_bridge']
        );

        return WhatsAppConversation::firstOrCreate(
            [
                'account_id' => $session->account_id,
                'whatsapp_connection_id' => $session->whatsapp_connection_id,
                'whatsapp_contact_id' => $contact->id,
            ],
            ['status' => 'open', 'last_message_at' => now(), 'last_message_preview' => 'Voice call']
        );
    }

    protected function plainTranscript(array $entries): string
    {
        return collect($entries)
            ->map(fn ($entry) => ucfirst($entry['speaker'] ?? 'speaker').': '.($entry['text'] ?? ''))
            ->implode("\n");
    }

    protected function appendTranscript(WhatsAppCallVoiceSession $session, array $entry): void
    {
        $entry = array_merge($entry, ['at' => now()->toIso8601String()]);
        $transcript = array_values(array_merge($session->transcript ?? [], [$entry]));

        $session->forceFill([
            'transcript' => $transcript,
            'last_error' => null,
        ])->save();

        $session->call?->forceFill([
            'transcript' => $this->plainTranscript($transcript),
            'metadata' => array_merge($session->call?->metadata ?? [], [
                'voice_bridge_last_transcript_at' => now()->toIso8601String(),
            ]),
        ])->save();
    }

    protected function markVoiceIssue(WhatsAppCallVoiceSession $session, string $message): void
    {
        $session->forceFill([
            'last_error' => Str::limit($message, 1000),
            'metadata' => array_merge($session->metadata ?? [], [
                'last_voice_issue_at' => now()->toIso8601String(),
            ]),
        ])->save();

        $session->call?->forceFill([
            'summary' => Str::limit($message, 500),
            'metadata' => array_merge($session->call?->metadata ?? [], [
                'voice_bridge_last_error' => Str::limit($message, 1000),
                'voice_bridge_last_error_at' => now()->toIso8601String(),
            ]),
        ])->save();
    }

    protected function markFailed(WhatsAppCallVoiceSession $session, string $message): void
    {
        $session->forceFill(['status' => 'failed', 'last_error' => $message, 'ended_at' => now()])->save();
        $session->call?->forceFill(['status' => 'failed', 'summary' => $message, 'ended_at' => now()])->save();
    }
}
