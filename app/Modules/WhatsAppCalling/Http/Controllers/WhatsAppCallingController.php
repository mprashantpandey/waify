<?php

namespace App\Modules\WhatsAppCalling\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\Account;
use App\Models\AccountModule;
use App\Models\AiAgent;
use App\Models\PlatformSetting;
use App\Models\WhatsAppCall;
use App\Models\WhatsAppCallConsent;
use App\Models\WhatsAppCallVoiceSession;
use App\Modules\WhatsApp\Events\Inbox\CallUpdated;
use App\Modules\WhatsApp\Models\WhatsAppConnection;
use App\Modules\WhatsApp\Services\MetaGraphService;
use App\Modules\WhatsApp\Services\WhatsAppClient;
use App\Services\WorkspacePermissionService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Schema;
use Inertia\Inertia;
use Inertia\Response;

class WhatsAppCallingController extends Controller
{
    public function __construct(
        protected MetaGraphService $metaGraph,
        protected WhatsAppClient $whatsAppClient,
        protected WorkspacePermissionService $permissions
    ) {}

    public function index(Request $request): Response
    {
        $account = $request->attributes->get('account') ?? current_account();
        abort_unless($account, 404);

        return Inertia::render('WhatsAppCalling/Index', [
            'settings' => $this->voiceSettings($account),
            'agents' => $this->agentsForAccount($account),
            'connections' => $this->whatsAppConnections($account),
            'diagnostics' => $this->diagnostics($account),
            'calls' => $this->recentCalls($account),
            'canManage' => $this->canManage($request, $account),
            'webhookUrl' => url('/webhooks/whatsapp'),
        ]);
    }

    public function updateSettings(Request $request)
    {
        $account = $request->attributes->get('account') ?? current_account();
        abort_unless($account, 404);
        abort_unless($this->canManage($request, $account), 403, 'Only workspace owners and admins can update WhatsApp calling settings.');

        $validated = $request->validate([
            'enabled' => ['required', 'boolean'],
            'inbound_enabled' => ['required', 'boolean'],
            'outbound_enabled' => ['required', 'boolean'],
            'record_calls' => ['required', 'boolean'],
            'human_handoff_enabled' => ['required', 'boolean'],
            'business_hours_only' => ['required', 'boolean'],
            'outbound_requires_consent' => ['required', 'boolean'],
            'whatsapp_connection_id' => ['nullable', 'integer', 'exists:whatsapp_connections,id'],
            'whatsapp_call_button_enabled' => ['required', 'boolean'],
            'calling_eligibility_status' => ['required', 'string', 'in:unknown,eligible,not_eligible'],
            'routing_mode' => ['required', 'string', 'in:ai_first,human_first,ai_only,human_only'],
            'phone_number_id' => ['nullable', 'string', 'max:80'],
            'business_phone' => ['nullable', 'string', 'max:60'],
            'transfer_number' => ['nullable', 'string', 'max:60'],
            'default_agent_id' => ['nullable', 'integer', 'exists:ai_agents,id'],
            'voice_name' => ['nullable', 'string', 'max:120'],
            'language' => ['required', 'string', 'max:20'],
            'greeting' => ['nullable', 'string', 'max:600'],
            'fallback_message' => ['nullable', 'string', 'max:600'],
            'max_call_minutes' => ['required', 'integer', 'min:1', 'max:60'],
            'silence_timeout_seconds' => ['required', 'integer', 'min:5', 'max:120'],
        ]);

        if ($validated['default_agent_id']) {
            $agentExists = AiAgent::where('account_id', $account->id)
                ->where('id', $validated['default_agent_id'])
                ->exists();

            abort_unless($agentExists, 422, 'Selected AI agent does not belong to this workspace.');
        }

        if ($validated['whatsapp_connection_id']) {
            $connection = WhatsAppConnection::where('account_id', $account->id)
                ->where('id', $validated['whatsapp_connection_id'])
                ->first();

            abort_unless($connection, 422, 'Selected WhatsApp connection does not belong to this workspace.');

            $validated['phone_number_id'] = $validated['phone_number_id'] ?: $connection->phone_number_id;
            $validated['business_phone'] = $validated['business_phone'] ?: $connection->business_phone;
        }

        $settings = array_merge($this->defaults(), $validated, ['provider' => 'whatsapp']);

        AccountModule::updateOrCreate(
            [
                'account_id' => $account->id,
                'module_key' => 'whatsapp.calling',
            ],
            [
                'enabled' => true,
                'config' => $settings,
            ]
        );

        return back()->with('success', 'WhatsApp calling settings saved.');
    }

    public function storeConsent(Request $request)
    {
        $account = $request->attributes->get('account') ?? current_account();
        abort_unless($account, 404);
        abort_unless($this->canManage($request, $account), 403, 'Only workspace owners and admins can record call consent.');

        $validated = $request->validate([
            'phone_number' => ['required', 'string', 'max:60'],
            'contact_name' => ['nullable', 'string', 'max:255'],
            'status' => ['required', 'string', 'in:granted,revoked,expired'],
            'source' => ['required', 'string', 'max:80'],
            'consented_at' => ['nullable', 'date'],
            'expires_at' => ['nullable', 'date', 'after_or_equal:consented_at'],
            'notes' => ['nullable', 'string', 'max:1000'],
        ]);

        $settings = $this->voiceSettings($account);
        $connectionId = $settings['whatsapp_connection_id'] ?? null;

        WhatsAppCallConsent::updateOrCreate(
            [
                'account_id' => $account->id,
                'phone_number' => $validated['phone_number'],
            ],
            [
                'whatsapp_connection_id' => $connectionId,
                'contact_name' => $validated['contact_name'] ?? null,
                'status' => $validated['status'],
                'source' => $validated['source'],
                'consented_at' => $validated['consented_at'] ?? now(),
                'expires_at' => $validated['expires_at'] ?? null,
                'notes' => $validated['notes'] ?? null,
                'metadata' => ['recorded_by' => $request->user()?->id],
            ]
        );

        return back()->with('success', 'Outbound call consent saved.');
    }

    public function checkConnection(Request $request, WhatsAppConnection $connection)
    {
        $account = $request->attributes->get('account') ?? current_account();
        abort_unless($account && (int) $connection->account_id === (int) $account->id, 404);
        abort_unless($this->canManage($request, $account), 403, 'Only workspace owners and admins can check WhatsApp calling.');

        try {
            $this->assertConnectionReadyForMetaCalling($connection);

            $details = $this->metaGraph->getPhoneNumberDetails($connection->phone_number_id, $connection->access_token);
            $settings = $this->metaGraph->getPhoneNumberSettings($connection->phone_number_id, $connection->access_token);
            $calling = $this->extractCallingSettings($settings);
            $enabled = strtoupper((string) ($calling['status'] ?? '')) === 'ENABLED';

            $connection->update([
                'calling_status' => $enabled ? 'eligible' : 'not_enabled',
                'calling_enabled' => $enabled,
                'calling_settings' => [
                    'details' => $details,
                    'settings' => $settings,
                    'calling' => $calling,
                    'checked_by' => $request->user()?->id,
                ],
                'calling_last_checked_at' => now(),
                'calling_last_error' => null,
            ]);

            $this->syncModuleCallingState($account, $connection);

            return back()->with('success', $enabled
                ? 'Meta confirms WhatsApp Calling is enabled for this number.'
                : 'Meta settings were checked. Calling is available to configure but not enabled yet.');
        } catch (\Throwable $e) {
            $connection->update([
                'calling_status' => 'not_eligible',
                'calling_enabled' => false,
                'calling_last_checked_at' => now(),
                'calling_last_error' => $e->getMessage(),
            ]);
            $this->syncModuleCallingState($account, $connection);

            return back()->with('error', 'Calling eligibility check failed: '.$e->getMessage());
        }
    }

    public function enableConnection(Request $request, WhatsAppConnection $connection)
    {
        $account = $request->attributes->get('account') ?? current_account();
        abort_unless($account && (int) $connection->account_id === (int) $account->id, 404);
        abort_unless($this->canManage($request, $account), 403, 'Only workspace owners and admins can enable WhatsApp calling.');

        try {
            $this->assertConnectionReadyForMetaCalling($connection);

            $result = $this->metaGraph->enablePhoneNumberCalling($connection->phone_number_id, $connection->access_token, [
                'callback_permission_status' => true,
            ]);
            $settings = $this->metaGraph->getPhoneNumberSettings($connection->phone_number_id, $connection->access_token);
            $calling = $this->extractCallingSettings($settings) ?: ($result['calling'] ?? []);

            $connection->update([
                'calling_status' => 'eligible',
                'calling_enabled' => true,
                'calling_settings' => [
                    'enable_result' => $result,
                    'settings' => $settings,
                    'calling' => $calling,
                    'enabled_by' => $request->user()?->id,
                ],
                'calling_last_checked_at' => now(),
                'calling_last_error' => null,
            ]);

            $this->syncModuleCallingState($account, $connection);

            return back()->with('success', 'WhatsApp Calling enable request completed for this number.');
        } catch (\Throwable $e) {
            $connection->update([
                'calling_status' => 'not_eligible',
                'calling_enabled' => false,
                'calling_last_checked_at' => now(),
                'calling_last_error' => $e->getMessage(),
            ]);
            $this->syncModuleCallingState($account, $connection);

            return back()->with('error', 'Unable to enable WhatsApp Calling: '.$e->getMessage());
        }
    }

    public function subscribeCallsWebhook(Request $request, WhatsAppConnection $connection)
    {
        $account = $request->attributes->get('account') ?? current_account();
        abort_unless($account && (int) $connection->account_id === (int) $account->id, 404);
        abort_unless($this->canManage($request, $account), 403, 'Only workspace owners and admins can refresh webhook subscriptions.');

        try {
            if (! $connection->waba_id || ! $connection->access_token) {
                throw new \RuntimeException('WABA ID and access token are required.');
            }

            $callbackUrl = route('webhooks.whatsapp.central.receive');
            $verifyToken = \App\Modules\WhatsApp\Http\Controllers\WebhookController::centralVerifyToken();
            $this->metaGraph->subscribeAppToWabaWithCallback($connection->waba_id, $connection->access_token, $callbackUrl, $verifyToken);
            $subscribedApps = $this->metaGraph->listSubscribedApps($connection->waba_id, $connection->access_token);

            $connection->update([
                'webhook_subscribed' => true,
                'calling_webhook_subscribed' => true,
                'meta_subscribed_apps' => $subscribedApps,
                'calling_last_checked_at' => now(),
                'calling_last_error' => null,
            ]);
            $this->syncModuleCallingState($account, $connection);

            return back()->with('success', 'WABA webhook subscription refreshed. Ensure the Meta App webhook product includes the calls field.');
        } catch (\Throwable $e) {
            $connection->update([
                'calling_webhook_subscribed' => false,
                'calling_last_checked_at' => now(),
                'calling_last_error' => $e->getMessage(),
            ]);

            return back()->with('error', 'Unable to refresh calls webhook subscription: '.$e->getMessage());
        }
    }

    public function checkCallPermission(Request $request, WhatsAppConnection $connection)
    {
        $account = $this->accountForConnection($request, $connection);
        abort_unless($this->canManage($request, $account), 403, 'Only workspace owners and admins can check call permissions.');

        $validated = $request->validate([
            'to' => ['required', 'string', 'max:60'],
        ]);

        try {
            $this->assertConnectionReadyForMetaCalling($connection);
            $to = $this->normalizeWaId($validated['to']);
            $result = $this->whatsAppClient->checkCallPermission($connection, $to);

            return response()->json([
                'ok' => true,
                'permission' => $result,
                'message' => 'Call permission checked.',
            ]);
        } catch (\Throwable $e) {
            return response()->json([
                'ok' => false,
                'message' => $e->getMessage(),
            ], 422);
        }
    }

    public function requestCallPermission(Request $request, WhatsAppConnection $connection)
    {
        $account = $this->accountForConnection($request, $connection);
        abort_unless($this->canManage($request, $account), 403, 'Only workspace owners and admins can request call permissions.');

        $validated = $request->validate([
            'to' => ['required', 'string', 'max:60'],
            'message' => ['nullable', 'string', 'max:600'],
        ]);

        try {
            $this->assertConnectionReadyForMetaCalling($connection);
            $to = $this->normalizeWaId($validated['to']);
            $result = $this->whatsAppClient->sendCallPermissionRequest(
                $connection,
                $to,
                $validated['message'] ?? 'Can we call you on WhatsApp about this conversation?'
            );

            return response()->json([
                'ok' => true,
                'result' => $result,
                'message' => 'WhatsApp call permission request sent.',
            ]);
        } catch (\Throwable $e) {
            return response()->json([
                'ok' => false,
                'message' => $e->getMessage(),
            ], 422);
        }
    }

    public function startOutboundCall(Request $request, WhatsAppConnection $connection)
    {
        $account = $this->accountForConnection($request, $connection);
        abort_unless($this->canHandleCalls($request, $account), 403, 'Your role does not have permission to start WhatsApp calls.');

        $validated = $request->validate([
            'to' => ['required', 'string', 'max:60'],
            'sdp' => ['nullable', 'string', 'max:30000'],
            'sdp_type' => ['nullable', 'string', 'in:offer'],
            'bridge_mode' => ['nullable', 'string', 'in:browser,ai'],
        ]);

        try {
            $settings = $this->voiceSettings($account);
            if (! ($settings['enabled'] ?? false)) {
                throw new \RuntimeException('WhatsApp Calling module is not enabled for this workspace.');
            }
            if (! ($settings['outbound_enabled'] ?? false)) {
                throw new \RuntimeException('Outbound WhatsApp Calling is not enabled in calling settings.');
            }
            if (! $connection->calling_enabled) {
                throw new \RuntimeException('Meta has not marked calling enabled for this number.');
            }

            $this->assertConnectionReadyForMetaCalling($connection);
            $to = $this->normalizeWaId($validated['to']);
            $wantsAiBridge = ($validated['bridge_mode'] ?? null) === 'ai'
                || (! isset($validated['sdp']) && in_array((string) ($settings['routing_mode'] ?? ''), ['ai_first', 'ai_only'], true));

            if ($wantsAiBridge) {
                if (! PlatformSetting::get('ai.voice_enabled', false)) {
                    throw new \RuntimeException('Voice AI is not enabled in Platform Settings -> AI.');
                }
                if (empty($settings['default_agent_id'])) {
                    throw new \RuntimeException('Select an AI agent in WhatsApp Calling settings before starting AI calls.');
                }

                $call = WhatsAppCall::create([
                    'account_id' => $account->id,
                    'whatsapp_connection_id' => $connection->id,
                    'ai_agent_id' => $settings['default_agent_id'],
                    'direction' => 'outbound',
                    'phone_number' => $to,
                    'provider' => 'whatsapp',
                    'status' => 'queued',
                    'route_mode' => 'ai_voice_bridge',
                    'routed_to' => 'ai_agent',
                    'consent_status' => 'not_required',
                    'metadata' => [
                        'started_by' => $request->user()?->id,
                        'requested_route_mode' => $settings['routing_mode'] ?? null,
                        'voice_bridge' => 'node_worker',
                    ],
                ]);

                $session = WhatsAppCallVoiceSession::create([
                    'account_id' => $account->id,
                    'whatsapp_call_id' => $call->id,
                    'whatsapp_connection_id' => $connection->id,
                    'ai_agent_id' => $settings['default_agent_id'],
                    'direction' => 'outbound',
                    'status' => 'queued',
                    'metadata' => [
                        'created_by' => $request->user()?->id,
                    ],
                ]);

                event(new CallUpdated($call->fresh('agent:id,name') ?? $call));

                return response()->json([
                    'ok' => true,
                    'call' => $this->formatCall($call->fresh('agent:id,name')),
                    'voice_session' => ['id' => $session->id, 'status' => $session->status],
                    'message' => 'AI voice bridge session queued.',
                ]);
            }

            if (empty($validated['sdp'])) {
                throw new \RuntimeException('Browser WebRTC SDP offer is required for human/browser calls.');
            }

            $payload = [
                'messaging_product' => 'whatsapp',
                'to' => $to,
                'action' => 'connect',
                'session' => [
                    'sdp_type' => 'offer',
                    'sdp' => $validated['sdp'],
                ],
            ];
            $result = $this->whatsAppClient->manageCall($connection, $payload);
            $providerCallId = $result['calls'][0]['id'] ?? $result['call_id'] ?? $result['id'] ?? null;

            $call = WhatsAppCall::create([
                'account_id' => $account->id,
                'whatsapp_connection_id' => $connection->id,
                'ai_agent_id' => null,
                'direction' => 'outbound',
                'phone_number' => $to,
                'provider' => 'whatsapp',
                'provider_call_id' => $providerCallId,
                'status' => 'initiated',
                'route_mode' => 'browser_webrtc',
                'routed_to' => $request->user()?->email ?: 'browser_agent',
                'consent_status' => 'not_required',
                'started_at' => now(),
                'metadata' => [
                    'connect_payload' => $payload,
                    'connect_response' => $result,
                    'started_by' => $request->user()?->id,
                    'requested_route_mode' => $settings['routing_mode'] ?? null,
                    'requested_ai_agent_id' => $settings['default_agent_id'] ?? null,
                    'voice_bridge' => 'browser_webrtc',
                ],
            ]);

            event(new CallUpdated($call));

            return response()->json([
                'ok' => true,
                'call' => $this->formatCall($call),
                'result' => $result,
                'message' => 'Outbound WhatsApp call started.',
            ]);
        } catch (\Throwable $e) {
            return response()->json([
                'ok' => false,
                'message' => $e->getMessage(),
            ], 422);
        }
    }

    public function showCall(Request $request, WhatsAppCall $call)
    {
        $account = $request->attributes->get('account') ?? current_account();
        abort_unless($account && (int) $call->account_id === (int) $account->id, 404);

        return response()->json([
            'call' => $this->formatCall($call->fresh('agent:id,name')),
        ]);
    }

    public function acceptInboundCall(Request $request, WhatsAppCall $call)
    {
        $account = $request->attributes->get('account') ?? current_account();
        abort_unless($account && (int) $call->account_id === (int) $account->id, 404);
        abort_unless($this->canHandleCalls($request, $account), 403, 'Your role does not have permission to answer WhatsApp calls.');

        $validated = $request->validate([
            'sdp' => ['required', 'string', 'max:30000'],
            'sdp_type' => ['nullable', 'string', 'in:answer'],
        ]);

        return $this->performCallAction($request, $call, 'accept', [
            'session' => [
                'sdp_type' => 'answer',
                'sdp' => $validated['sdp'],
            ],
        ], 'answered');
    }

    public function rejectCall(Request $request, WhatsAppCall $call)
    {
        $account = $request->attributes->get('account') ?? current_account();
        abort_unless($account && (int) $call->account_id === (int) $account->id, 404);
        abort_unless($this->canHandleCalls($request, $account), 403, 'Your role does not have permission to reject WhatsApp calls.');

        return $this->performCallAction($request, $call, 'reject', [], 'rejected');
    }

    public function terminateCall(Request $request, WhatsAppCall $call)
    {
        $account = $request->attributes->get('account') ?? current_account();
        abort_unless($account && (int) $call->account_id === (int) $account->id, 404);
        abort_unless($this->canHandleCalls($request, $account), 403, 'Your role does not have permission to end WhatsApp calls.');

        return $this->performCallAction($request, $call, 'terminate', [], 'completed');
    }

    protected function voiceSettings(Account $account): array
    {
        $module = AccountModule::where('account_id', $account->id)
            ->whereIn('module_key', ['whatsapp.calling', 'ai.voice'])
            ->first();

        return array_merge($this->defaults(), $module?->config ?? []);
    }

    protected function defaults(): array
    {
        return [
            'enabled' => false,
            'provider' => 'whatsapp',
            'inbound_enabled' => true,
            'outbound_enabled' => true,
            'record_calls' => false,
            'human_handoff_enabled' => true,
            'business_hours_only' => false,
            'outbound_requires_consent' => false,
            'whatsapp_connection_id' => null,
            'whatsapp_call_button_enabled' => false,
            'calling_eligibility_status' => 'unknown',
            'calling_webhook_subscribed' => false,
            'calling_settings' => [],
            'routing_mode' => 'ai_first',
            'phone_number_id' => '',
            'business_phone' => '',
            'transfer_number' => '',
            'default_agent_id' => null,
            'voice_name' => 'alloy',
            'language' => 'en-IN',
            'greeting' => 'Hi, thanks for calling. How can I help you today?',
            'fallback_message' => 'I am connecting you to a team member for better help.',
            'max_call_minutes' => 10,
            'silence_timeout_seconds' => 20,
        ];
    }

    protected function accountForConnection(Request $request, WhatsAppConnection $connection): Account
    {
        $account = $request->attributes->get('account') ?? current_account();
        abort_unless($account && (int) $connection->account_id === (int) $account->id, 404);

        return $account;
    }

    protected function normalizeWaId(string $value): string
    {
        $waId = preg_replace('/\D+/', '', $value);
        if (! $waId) {
            throw new \RuntimeException('A valid WhatsApp phone number is required.');
        }

        return $waId;
    }

    protected function performCallAction(Request $request, WhatsAppCall $call, string $action, array $extraPayload, string $status)
    {
        try {
            $connection = $call->connection;
            if (! $connection) {
                throw new \RuntimeException('WhatsApp connection for this call was not found.');
            }
            $this->assertConnectionReadyForMetaCalling($connection);

            $payload = array_merge([
                'messaging_product' => 'whatsapp',
                'call_id' => $call->provider_call_id,
                'action' => $action,
            ], $extraPayload);

            if (! $payload['call_id']) {
                throw new \RuntimeException('Meta call ID is not available yet.');
            }

            $result = $this->whatsAppClient->manageCall($connection, $payload);
            $metadata = $call->metadata ?? [];
            $metadata[$action.'_payload'] = $payload;
            $metadata[$action.'_response'] = $result;
            $metadata[$action.'_by'] = $request->user()?->id;

            $call->forceFill([
                'status' => $status,
                'ended_at' => in_array($status, ['completed', 'rejected'], true) ? now() : $call->ended_at,
                'metadata' => $metadata,
            ])->save();

            event(new CallUpdated($call->fresh('agent:id,name') ?? $call));

            return response()->json([
                'ok' => true,
                'call' => $this->formatCall($call->fresh('agent:id,name')),
                'result' => $result,
                'message' => 'WhatsApp call '.$action.' request sent.',
            ]);
        } catch (\Throwable $e) {
            return response()->json([
                'ok' => false,
                'message' => $e->getMessage(),
            ], 422);
        }
    }

    protected function formatCall(WhatsAppCall $call): array
    {
        return [
            'id' => $call->id,
            'whatsapp_connection_id' => $call->whatsapp_connection_id,
            'direction' => $call->direction,
            'phone_number' => $call->phone_number,
            'contact_name' => $call->contact_name,
            'provider' => $call->provider,
            'provider_call_id' => $call->provider_call_id,
            'status' => $call->status,
            'route_mode' => $call->route_mode,
            'routed_to' => $call->routed_to,
            'duration_seconds' => $call->duration_seconds,
            'summary' => $call->summary,
            'transcript' => $call->transcript,
            'metadata' => $call->metadata ?? [],
            'agent' => $call->agent ? [
                'id' => $call->agent->id,
                'name' => $call->agent->name,
            ] : null,
            'created_at' => $call->created_at?->toIso8601String(),
            'started_at' => $call->started_at?->toIso8601String(),
            'ended_at' => $call->ended_at?->toIso8601String(),
        ];
    }

    protected function agentsForAccount(Account $account): array
    {
        if (! Schema::hasTable('ai_agents')) {
            return [];
        }

        return AiAgent::where('account_id', $account->id)
            ->where('is_active', true)
            ->orderBy('name')
            ->get(['id', 'name', 'role', 'language', 'tone', 'mode'])
            ->map(fn (AiAgent $agent) => [
                'id' => $agent->id,
                'name' => $agent->name,
                'role' => $agent->role,
                'language' => $agent->language,
                'tone' => $agent->tone,
                'mode' => $agent->mode,
            ])
            ->values()
            ->all();
    }

    protected function whatsAppConnections(Account $account): array
    {
        if (! Schema::hasTable('whatsapp_connections')) {
            return [];
        }

        return WhatsAppConnection::where('account_id', $account->id)
            ->latest()
            ->get(['id', 'name', 'slug', 'waba_id', 'phone_number_id', 'business_phone', 'meta_verified_name', 'phone_number_status', 'webhook_subscribed', 'calling_status', 'calling_enabled', 'calling_webhook_subscribed', 'calling_settings', 'calling_last_checked_at', 'calling_last_error', 'is_active'])
            ->map(fn (WhatsAppConnection $connection) => [
                'id' => $connection->id,
                'name' => $connection->name,
                'slug' => $connection->slug,
                'waba_id' => $connection->waba_id,
                'phone_number_id' => $connection->phone_number_id,
                'business_phone' => $connection->business_phone,
                'meta_verified_name' => $connection->meta_verified_name,
                'phone_number_status' => $connection->phone_number_status,
                'webhook_subscribed' => (bool) $connection->webhook_subscribed,
                'calling_status' => $connection->calling_status ?? 'unknown',
                'calling_enabled' => (bool) $connection->calling_enabled,
                'calling_webhook_subscribed' => (bool) $connection->calling_webhook_subscribed,
                'calling_settings' => $connection->calling_settings ?? [],
                'calling_last_checked_at' => $connection->calling_last_checked_at?->toIso8601String(),
                'calling_last_error' => $connection->calling_last_error,
                'is_active' => (bool) $connection->is_active,
            ])
            ->values()
            ->all();
    }

    protected function diagnostics(Account $account): array
    {
        $settings = $this->voiceSettings($account);
        $connection = null;

        if (! empty($settings['whatsapp_connection_id']) && Schema::hasTable('whatsapp_connections')) {
            $connection = WhatsAppConnection::where('account_id', $account->id)
                ->where('id', $settings['whatsapp_connection_id'])
                ->first();
        }

        if (! $connection && Schema::hasTable('whatsapp_connections')) {
            $connection = WhatsAppConnection::where('account_id', $account->id)
                ->where('is_active', true)
                ->first();
        }

        $phoneStatus = strtoupper((string) ($connection?->phone_number_status ?? ''));
        $usesAiRouting = in_array((string) ($settings['routing_mode'] ?? 'ai_first'), ['ai_first', 'ai_only'], true);
        $voiceEnabled = (bool) PlatformSetting::get('ai.voice_enabled', false);
        $voiceSttProvider = (string) PlatformSetting::get('ai.voice_stt_provider', 'elevenlabs');
        $voiceTtsProvider = (string) PlatformSetting::get('ai.voice_tts_provider', 'elevenlabs');
        $phoneNumberId = trim((string) ($settings['phone_number_id'] ?? '')) ?: (string) ($connection?->phone_number_id ?? '');

        $checks = [
            [
                'key' => 'module_enabled',
                'label' => 'Module enabled',
                'ok' => (bool) ($settings['enabled'] ?? false),
                'message' => ($settings['enabled'] ?? false) ? 'Zyptos call routing is enabled for this workspace.' : 'Enable call routing for this workspace before using calls in inbox.',
            ],
            [
                'key' => 'connection',
                'label' => 'WABA number selected',
                'ok' => (bool) $connection,
                'message' => $connection ? ($connection->business_phone ?: $connection->name) : 'Select a connected WhatsApp number.',
            ],
            [
                'key' => 'phone_number_id',
                'label' => 'Meta phone number ID',
                'ok' => $phoneNumberId !== '',
                'message' => $phoneNumberId !== '' ? 'Phone number ID is synced.' : 'Sync or enter the Meta phone number ID.',
            ],
            [
                'key' => 'webhook',
                'label' => 'Webhook subscribed',
                'ok' => (bool) ($connection?->calling_webhook_subscribed),
                'message' => $connection?->calling_webhook_subscribed ? 'Calls webhook subscription was refreshed.' : 'Refresh the WABA webhook subscription and enable the calls field in Meta App webhooks.',
            ],
            [
                'key' => 'phone_status',
                'label' => 'Phone connected',
                'ok' => in_array($phoneStatus, ['CONNECTED', 'VERIFIED', 'APPROVED'], true),
                'message' => $connection ? 'Phone status: '.($connection->phone_number_status ?: 'unknown') : 'No selected phone number.',
            ],
            [
                'key' => 'meta_calling',
                'label' => 'Meta calling enabled',
                'ok' => (bool) ($connection?->calling_enabled),
                'message' => $connection?->calling_enabled
                    ? 'Meta confirms WhatsApp Calling is enabled for this number.'
                    : match ($settings['calling_eligibility_status'] ?? 'unknown') {
                        'eligible' => 'Eligible, but calling has not been enabled on this number yet.',
                        'not_eligible' => 'Marked not eligible for WhatsApp Calling.',
                        default => $connection?->calling_last_error ?: 'Run Check eligibility against Meta phone settings.',
                    },
            ],
            [
                'key' => 'voice_ai',
                'label' => 'Voice AI providers',
                'ok' => ! $usesAiRouting || $voiceEnabled,
                'message' => $usesAiRouting
                    ? ($voiceEnabled ? "Voice AI enabled. STT: {$voiceSttProvider}, TTS: {$voiceTtsProvider}." : 'Enable Voice AI in Platform Settings -> AI for AI-routed calls.')
                    : 'Not required for human-only routing.',
            ],
        ];

        $eligible = collect($checks)->every(fn ($check) => $check['ok']);
        $metaEligible = (bool) ($connection?->calling_enabled) || ($settings['calling_eligibility_status'] ?? 'unknown') === 'eligible';

        return [
            'eligible' => $eligible,
            'label' => $eligible ? 'Ready for calls' : ($metaEligible ? 'Setup incomplete' : 'Calling not enabled'),
            'checks' => $checks,
        ];
    }

    protected function recentCalls(Account $account): array
    {
        if (! Schema::hasTable('ai_voice_calls')) {
            return [];
        }

        return WhatsAppCall::with('agent:id,name')
            ->where('account_id', $account->id)
            ->latest()
            ->limit(20)
            ->get()
            ->map(fn (WhatsAppCall $call) => $this->formatCall($call))
            ->values()
            ->all();
    }

    protected function recentConsents(Account $account): array
    {
        if (! Schema::hasTable('ai_voice_consents')) {
            return [];
        }

        return WhatsAppCallConsent::where('account_id', $account->id)
            ->latest()
            ->limit(20)
            ->get()
            ->map(fn (WhatsAppCallConsent $consent) => [
                'id' => $consent->id,
                'phone_number' => $consent->phone_number,
                'contact_name' => $consent->contact_name,
                'status' => $consent->status,
                'source' => $consent->source,
                'consented_at' => $consent->consented_at?->toIso8601String(),
                'expires_at' => $consent->expires_at?->toIso8601String(),
                'notes' => $consent->notes,
            ])
            ->values()
            ->all();
    }

    protected function canManage(Request $request, Account $account): bool
    {
        $user = $request->user();

        if (! $user) {
            return false;
        }

        if ($user->isPlatformAdmin() || (int) $account->owner_id === (int) $user->id || $account->isOwnedBy($user)) {
            return true;
        }

        $membership = $account->users()
            ->where('users.id', $user->id)
            ->first();

        return in_array($membership?->pivot?->role, ['owner', 'admin'], true);
    }

    protected function canHandleCalls(Request $request, Account $account): bool
    {
        $user = $request->user();

        if (! $user) {
            return false;
        }

        return $this->canManage($request, $account)
            || $this->permissions->can($user, $account, 'inbox');
    }

    protected function assertConnectionReadyForMetaCalling(WhatsAppConnection $connection): void
    {
        if (! $connection->phone_number_id) {
            throw new \RuntimeException('Meta phone number ID is required.');
        }
        if (! $connection->access_token) {
            throw new \RuntimeException('Meta access token is required.');
        }
    }

    protected function extractCallingSettings(array $settings): array
    {
        if (isset($settings['calling']) && is_array($settings['calling'])) {
            return $settings['calling'];
        }

        $data = $settings['data'][0] ?? $settings['data'] ?? null;
        if (is_array($data) && isset($data['calling']) && is_array($data['calling'])) {
            return $data['calling'];
        }

        return [];
    }

    protected function syncModuleCallingState(Account $account, WhatsAppConnection $connection): void
    {
        $module = AccountModule::firstOrNew([
            'account_id' => $account->id,
            'module_key' => 'whatsapp.calling',
        ]);

        $config = array_merge($this->defaults(), $module->config ?? []);
        if ((int) ($config['whatsapp_connection_id'] ?? 0) !== (int) $connection->id) {
            return;
        }

        $config['calling_eligibility_status'] = $connection->calling_enabled ? 'eligible' : (
            ($connection->calling_status ?? 'unknown') === 'not_eligible' ? 'not_eligible' : 'unknown'
        );
        $config['calling_webhook_subscribed'] = (bool) $connection->calling_webhook_subscribed;
        $config['calling_settings'] = $connection->calling_settings ?? [];
        $config['phone_number_id'] = $connection->phone_number_id ?: ($config['phone_number_id'] ?? '');
        $config['business_phone'] = $connection->business_phone ?: ($config['business_phone'] ?? '');

        $module->forceFill([
            'enabled' => true,
            'config' => $config,
        ])->save();
    }
}
