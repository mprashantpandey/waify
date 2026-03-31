<?php

namespace App\Modules\Developer\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\AccountApiKey;
use App\Models\TenantWebhookDelivery;
use App\Models\TenantWebhookEndpoint;
use App\Models\TenantWebhookSubscription;
use App\Models\InboundAutomationWebhook;
use App\Models\InboundAutomationWebhookLog;
use App\Modules\Developer\Jobs\DeliverTenantWebhookJob;
use App\Modules\Developer\Services\InboundAutomationWebhookService;
use App\Modules\Developer\Services\TenantWebhookService;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use App\Modules\Contacts\Models\ContactCustomField;
use App\Modules\Broadcasts\Models\CampaignSequence;
use App\Modules\WhatsApp\Models\WhatsAppConnection;
use App\Modules\WhatsApp\Models\WhatsAppTemplate;
use Inertia\Inertia;
use Inertia\Response;

class DeveloperController extends Controller
{
    protected const AVAILABLE_SCOPES = [
        'account.read',
        'connections.read',
        'contacts.read',
        'conversations.read',
    ];

    protected function ensureDeveloperManager(Request $request): void
    {
        $user = $request->user();
        $account = $request->attributes->get('account') ?? current_account();

        if (!$user || !$account) {
            abort(403);
        }

        if ((int) $account->owner_id === (int) $user->id) {
            return;
        }

        $membership = $account->users()->where('user_id', $user->id)->first();
        $role = (string) ($membership?->pivot?->role ?? '');
        if ($role !== 'admin') {
            abort(403, 'Only account owners/admins can manage API keys.');
        }
    }

    /**
     * Developer page: API keys and link to docs.
     */
    public function index(Request $request): Response
    {
        $account = $request->attributes->get('account') ?? current_account();
        $this->ensureDeveloperManager($request);

        $keys = AccountApiKey::where('account_id', $account->id)
            ->orderByDesc('created_at')
            ->get(['id', 'name', 'key_prefix', 'is_active', 'scopes', 'last_used_at', 'last_used_ip', 'expires_at', 'revoked_at', 'created_at'])
            ->map(function (AccountApiKey $key) {
                return [
                    'id' => $key->id,
                    'name' => $key->name,
                    'key_prefix' => $key->key_prefix,
                    'is_active' => (bool) ($key->is_active ?? true),
                    'scopes' => array_values((array) ($key->scopes ?? [])),
                    'last_used_at' => $key->last_used_at?->toIso8601String(),
                    'last_used_ip' => $key->last_used_ip,
                    'expires_at' => $key->expires_at?->toIso8601String(),
                    'revoked_at' => $key->revoked_at?->toIso8601String(),
                    'created_at' => $key->created_at->toIso8601String(),
                ];
            });

        $endpoints = TenantWebhookEndpoint::query()
            ->where('account_id', $account->id)
            ->with(['subscriptions', 'deliveries' => fn ($q) => $q->latest('id')])
            ->orderByDesc('id')
            ->get()
            ->map(function (TenantWebhookEndpoint $endpoint) {
                $enabled = $endpoint->subscriptions
                    ->where('is_enabled', true)
                    ->pluck('event_key')
                    ->values()
                    ->toArray();

                return [
                    'id' => $endpoint->id,
                    'name' => $endpoint->name,
                    'url' => $endpoint->url,
                    'is_active' => (bool) $endpoint->is_active,
                    'timeout_seconds' => (int) $endpoint->timeout_seconds,
                    'max_retries' => (int) $endpoint->max_retries,
                    'enabled_events' => $enabled,
                    'created_at' => $endpoint->created_at?->toIso8601String(),
                    'updated_at' => $endpoint->updated_at?->toIso8601String(),
                    'last_delivery_at' => $endpoint->last_delivery_at?->toIso8601String(),
                    'last_delivery_status_code' => $endpoint->last_delivery_status_code,
                    'last_delivery_error' => $endpoint->last_delivery_error,
                    'deliveries' => $endpoint->deliveries
                        ->sortByDesc('id')
                        ->take(10)
                        ->map(fn (TenantWebhookDelivery $delivery) => $this->formatDelivery($delivery))
                        ->values()
                        ->toArray(),
                ];
            });

        return Inertia::render('Developer/Index', [
            'account' => $account,
            'api_keys' => $keys,
            'base_url' => config('app.url') . '/api/v1',
            'available_scopes' => self::AVAILABLE_SCOPES,
            'webhook_event_keys' => TenantWebhookService::EVENT_KEYS,
            'webhook_endpoints' => $endpoints,
            'inbound_webhook_action_types' => collect(InboundAutomationWebhookService::ACTION_TYPES)->map(fn (string $type) => [
                'value' => $type,
                'label' => $type === 'start_sequence' ? 'Start sequence' : 'Send template',
            ])->values()->all(),
            'inbound_webhooks' => InboundAutomationWebhook::query()
                ->where('account_id', $account->id)
                ->with(['sequence', 'connection', 'template', 'logs' => fn ($q) => $q->latest('id')])
                ->orderByDesc('id')
                ->get()
                ->map(fn (InboundAutomationWebhook $webhook) => $this->formatInboundWebhook($webhook))
                ->values()
                ->all(),
            'inbound_sequences' => CampaignSequence::query()
                ->where('account_id', $account->id)
                ->orderBy('name')
                ->get(['id', 'name', 'status', 'whatsapp_connection_id'])
                ->map(fn (CampaignSequence $sequence) => [
                    'id' => $sequence->id,
                    'name' => $sequence->name,
                    'status' => $sequence->status,
                    'whatsapp_connection_id' => $sequence->whatsapp_connection_id,
                ])
                ->values()
                ->all(),
            'inbound_connections' => WhatsAppConnection::query()
                ->where('account_id', $account->id)
                ->where('is_active', true)
                ->orderBy('name')
                ->get(['id', 'name'])
                ->map(fn (WhatsAppConnection $connection) => [
                    'id' => $connection->id,
                    'name' => $connection->name,
                ])
                ->values()
                ->all(),
            'inbound_templates' => WhatsAppTemplate::query()
                ->where('account_id', $account->id)
                ->whereIn('status', ['approved', 'APPROVED'])
                ->orderBy('name')
                ->get(['id', 'name', 'whatsapp_connection_id', 'body_text'])
                ->map(fn (WhatsAppTemplate $template) => [
                    'id' => $template->id,
                    'name' => $template->name,
                    'whatsapp_connection_id' => $template->whatsapp_connection_id,
                    'variable_count' => (int) $template->variable_count,
                ])
                ->values()
                ->all(),
            'inbound_custom_fields' => ContactCustomField::query()
                ->where('account_id', $account->id)
                ->orderBy('order')
                ->orderBy('id')
                ->get(['key', 'name'])
                ->map(fn (ContactCustomField $field) => [
                    'key' => $field->key,
                    'name' => $field->name,
                ])
                ->values()
                ->all(),
            'inbound_base_url' => route('hooks.inbound.handle', ['publicKey' => 'PUBLIC_KEY_PLACEHOLDER']),
        ]);
    }

    /**
     * API documentation page (external API reference for tenants).
     */
    public function docs(Request $request): Response
    {
        $account = $request->attributes->get('account') ?? current_account();
        $this->ensureDeveloperManager($request);
        $baseUrl = config('app.url') . '/api/v1';

        $endpoints = $this->getDocumentedEndpoints($baseUrl);

        return Inertia::render('Developer/Docs', [
            'account' => $account,
            'base_url' => $baseUrl,
            'endpoints' => $endpoints,
            'available_scopes' => self::AVAILABLE_SCOPES,
            'webhook_event_keys' => TenantWebhookService::EVENT_KEYS,
            'webhook_sample_payloads' => $this->webhookSamplePayloads(),
            'webhook_signature_example' => [
                'timestamp_header' => 'X-Waify-Timestamp',
                'signature_header' => 'X-Waify-Signature',
                'signature_format' => 'v1=' . str_repeat('a', 64),
                'algorithm' => 'HMAC SHA256',
                'canonical_input' => 'timestamp + "." + raw_request_body',
            ],
        ]);
    }

    /**
     * Create a new API key. Plaintext key is returned only in this response.
     */
    public function store(Request $request)
    {
        $account = $request->attributes->get('account') ?? current_account();
        $this->ensureDeveloperManager($request);

        $validated = $request->validate([
            'name' => 'required|string|max:100',
            'scopes' => 'nullable|array',
            'scopes.*' => 'string|in:' . implode(',', self::AVAILABLE_SCOPES),
            'expires_in_days' => 'nullable|integer|min:1|max:3650',
        ]);

        $plaintext = AccountApiKey::generateKey();
        $hash = AccountApiKey::hashKey($plaintext);
        $prefix = AccountApiKey::prefixForDisplay($plaintext);

        AccountApiKey::create([
            'account_id' => $account->id,
            'name' => $validated['name'],
            'key_hash' => $hash,
            'key_prefix' => $prefix,
            'scopes' => array_values(array_unique((array) ($validated['scopes'] ?? self::AVAILABLE_SCOPES))),
            'is_active' => true,
            'expires_at' => !empty($validated['expires_in_days']) ? now()->addDays((int) $validated['expires_in_days']) : null,
        ]);

        return back()->with('new_api_key', [
            'name' => $validated['name'],
            'key' => $plaintext,
            'key_prefix' => $prefix,
        ]);
    }

    public function update(Request $request, int $id)
    {
        $account = $request->attributes->get('account') ?? current_account();
        $this->ensureDeveloperManager($request);

        $apiKey = AccountApiKey::where('account_id', $account->id)->findOrFail($id);

        $validated = $request->validate([
            'name' => 'sometimes|required|string|max:100',
            'is_active' => 'sometimes|boolean',
            'scopes' => 'sometimes|array',
            'scopes.*' => 'string|in:' . implode(',', self::AVAILABLE_SCOPES),
            'expires_in_days' => 'nullable|integer|min:1|max:3650',
            'clear_expiry' => 'nullable|boolean',
        ]);

        if (array_key_exists('name', $validated)) {
            $apiKey->name = $validated['name'];
        }
        if (array_key_exists('is_active', $validated)) {
            $apiKey->is_active = (bool) $validated['is_active'];
            if (!(bool) $validated['is_active']) {
                $apiKey->revoked_at = now();
            } elseif ($apiKey->revoked_at) {
                $apiKey->revoked_at = null;
            }
        }
        if (array_key_exists('scopes', $validated)) {
            $apiKey->scopes = array_values(array_unique((array) $validated['scopes']));
        }
        if (!empty($validated['clear_expiry'])) {
            $apiKey->expires_at = null;
        } elseif (array_key_exists('expires_in_days', $validated) && $validated['expires_in_days']) {
            $apiKey->expires_at = now()->addDays((int) $validated['expires_in_days']);
        }

        $apiKey->save();

        return back()->with('success', 'API key updated.');
    }

    /**
     * Revoke (delete) an API key.
     */
    public function destroy(Request $request, int $id)
    {
        $account = $request->attributes->get('account') ?? current_account();
        $this->ensureDeveloperManager($request);

        $apiKey = AccountApiKey::where('account_id', $account->id)->findOrFail($id);
        $apiKey->delete();

        return back()->with('success', 'API key revoked.');
    }

    public function storeWebhookEndpoint(Request $request)
    {
        $account = $request->attributes->get('account') ?? current_account();
        $this->ensureDeveloperManager($request);

        $validated = $request->validate([
            'name' => 'required|string|max:120',
            'url' => 'required|url|max:1000',
            'is_active' => 'nullable|boolean',
            'timeout_seconds' => 'nullable|integer|min:3|max:30',
            'max_retries' => 'nullable|integer|min:1|max:10',
            'signing_secret' => 'nullable|string|min:16|max:255',
            'event_keys' => 'required|array|min:1',
            'event_keys.*' => 'string|in:' . implode(',', TenantWebhookService::EVENT_KEYS),
        ]);

        /** @var TenantWebhookEndpoint $endpoint */
        $endpoint = TenantWebhookEndpoint::create([
            'account_id' => $account->id,
            'name' => trim((string) $validated['name']),
            'url' => trim((string) $validated['url']),
            'is_active' => (bool) ($validated['is_active'] ?? true),
            'timeout_seconds' => (int) ($validated['timeout_seconds'] ?? 10),
            'max_retries' => (int) ($validated['max_retries'] ?? 5),
            'signing_secret' => (string) ($validated['signing_secret'] ?? Str::random(48)),
        ]);

        $this->syncEndpointSubscriptions($endpoint, (array) $validated['event_keys']);

        return back()->with('success', 'Webhook endpoint created.');
    }

    public function updateWebhookEndpoint(Request $request, int $id)
    {
        $account = $request->attributes->get('account') ?? current_account();
        $this->ensureDeveloperManager($request);

        /** @var TenantWebhookEndpoint $endpoint */
        $endpoint = TenantWebhookEndpoint::query()
            ->where('account_id', $account->id)
            ->findOrFail($id);

        $validated = $request->validate([
            'name' => 'sometimes|required|string|max:120',
            'url' => 'sometimes|required|url|max:1000',
            'is_active' => 'sometimes|boolean',
            'timeout_seconds' => 'sometimes|integer|min:3|max:30',
            'max_retries' => 'sometimes|integer|min:1|max:10',
            'rotate_secret' => 'nullable|boolean',
            'signing_secret' => 'nullable|string|min:16|max:255',
            'event_keys' => 'sometimes|array|min:1',
            'event_keys.*' => 'string|in:' . implode(',', TenantWebhookService::EVENT_KEYS),
        ]);

        if (array_key_exists('name', $validated)) {
            $endpoint->name = trim((string) $validated['name']);
        }
        if (array_key_exists('url', $validated)) {
            $endpoint->url = trim((string) $validated['url']);
        }
        if (array_key_exists('is_active', $validated)) {
            $endpoint->is_active = (bool) $validated['is_active'];
        }
        if (array_key_exists('timeout_seconds', $validated)) {
            $endpoint->timeout_seconds = (int) $validated['timeout_seconds'];
        }
        if (array_key_exists('max_retries', $validated)) {
            $endpoint->max_retries = (int) $validated['max_retries'];
        }
        if (!empty($validated['rotate_secret'])) {
            $endpoint->signing_secret = Str::random(48);
        } elseif (!empty($validated['signing_secret'])) {
            $endpoint->signing_secret = (string) $validated['signing_secret'];
        }
        $endpoint->save();

        if (array_key_exists('event_keys', $validated)) {
            $this->syncEndpointSubscriptions($endpoint, (array) $validated['event_keys']);
        }

        return back()->with('success', 'Webhook endpoint updated.');
    }

    public function destroyWebhookEndpoint(Request $request, int $id)
    {
        $account = $request->attributes->get('account') ?? current_account();
        $this->ensureDeveloperManager($request);

        $endpoint = TenantWebhookEndpoint::query()
            ->where('account_id', $account->id)
            ->findOrFail($id);
        $endpoint->delete();

        return back()->with('success', 'Webhook endpoint removed.');
    }

    public function testWebhookEndpoint(Request $request, int $id)
    {
        $account = $request->attributes->get('account') ?? current_account();
        $this->ensureDeveloperManager($request);

        /** @var TenantWebhookEndpoint $endpoint */
        $endpoint = TenantWebhookEndpoint::query()
            ->where('account_id', $account->id)
            ->findOrFail($id);

        $eventKey = (string) $request->input('event_key', 'message.sent');
        if (!in_array($eventKey, TenantWebhookService::EVENT_KEYS, true)) {
            return back()->with('error', 'Invalid webhook test event key.');
        }

        $delivery = TenantWebhookDelivery::create([
            'account_id' => $account->id,
            'tenant_webhook_endpoint_id' => $endpoint->id,
            'event_key' => $eventKey,
            'event_id' => (string) Str::uuid(),
            'idempotency_key' => 'test_' . Str::random(12),
            'payload' => [
                'test' => true,
                'sent_from' => 'developer.webhooks.test',
                'account' => [
                    'id' => $account->id,
                    'name' => $account->name,
                ],
                'occurred_at' => now()->toIso8601String(),
            ],
            'status' => 'pending',
            'attempts' => 0,
        ]);

        DeliverTenantWebhookJob::dispatch($delivery->id);

        return back()->with('success', 'Webhook test sent.');
    }

    public function replayWebhookDelivery(Request $request, int $id, TenantWebhookService $tenantWebhookService)
    {
        $account = $request->attributes->get('account') ?? current_account();
        $this->ensureDeveloperManager($request);

        /** @var TenantWebhookDelivery $delivery */
        $delivery = TenantWebhookDelivery::query()
            ->where('account_id', $account->id)
            ->findOrFail($id);

        $tenantWebhookService->replayDelivery($delivery);

        return back()->with('success', 'Webhook delivery queued for replay.');
    }

    /**
     * Documented API endpoints for the external docs page.
     */
    protected function getDocumentedEndpoints(string $baseUrl): array
    {
        return [
            [
                'method' => 'GET',
                'path' => '/account',
                'summary' => 'Get current account',
                'description' => 'Returns the authenticated account profile (id, name, slug).',
                'auth' => true,
                'scope' => 'account.read',
                'example' => "curl -X GET \"{$baseUrl}/account\" \\\n  -H \"Authorization: Bearer YOUR_API_KEY\"",
            ],
            [
                'method' => 'GET',
                'path' => '/connections',
                'summary' => 'List WhatsApp connections',
                'description' => 'Returns WhatsApp connections for the account (id, name, status).',
                'auth' => true,
                'scope' => 'connections.read',
                'example' => "curl -X GET \"{$baseUrl}/connections?limit=20\" \\\n  -H \"Authorization: Bearer YOUR_API_KEY\"",
            ],
            [
                'method' => 'GET',
                'path' => '/contacts',
                'summary' => 'List contacts',
                'description' => 'Returns contacts for the account with optional filters.',
                'auth' => true,
                'scope' => 'contacts.read',
                'example' => "curl -X GET \"{$baseUrl}/contacts?search=john&status=active&limit=50\" \\\n  -H \"Authorization: Bearer YOUR_API_KEY\"",
            ],
            [
                'method' => 'GET',
                'path' => '/conversations',
                'summary' => 'List conversations',
                'description' => 'Returns conversations (open/closed) for the account.',
                'auth' => true,
                'scope' => 'conversations.read',
                'example' => "curl -X GET \"{$baseUrl}/conversations?status=open&limit=25\" \\\n  -H \"Authorization: Bearer YOUR_API_KEY\"",
            ],
        ];
    }

    /**
     * @param  array<int,string>  $eventKeys
     */
    protected function syncEndpointSubscriptions(TenantWebhookEndpoint $endpoint, array $eventKeys): void
    {
        $target = array_values(array_unique(array_filter($eventKeys, function ($eventKey) {
            return in_array((string) $eventKey, TenantWebhookService::EVENT_KEYS, true);
        })));

        foreach (TenantWebhookService::EVENT_KEYS as $eventKey) {
            TenantWebhookSubscription::updateOrCreate(
                [
                    'tenant_webhook_endpoint_id' => $endpoint->id,
                    'event_key' => $eventKey,
                ],
                [
                    'is_enabled' => in_array($eventKey, $target, true),
                ]
            );
        }
    }

    /**
     * @return array<string,mixed>
     */

    protected function formatInboundWebhook(InboundAutomationWebhook $webhook): array
    {
        return [
            'id' => $webhook->id,
            'name' => $webhook->name,
            'public_key' => $webhook->public_key,
            'public_url' => route('hooks.inbound.handle', ['publicKey' => $webhook->public_key]),
            'is_active' => (bool) $webhook->is_active,
            'action_type' => $webhook->action_type,
            'campaign_sequence_id' => $webhook->campaign_sequence_id,
            'sequence_name' => $webhook->sequence?->name,
            'whatsapp_connection_id' => $webhook->whatsapp_connection_id,
            'connection_name' => $webhook->connection?->name,
            'whatsapp_template_id' => $webhook->whatsapp_template_id,
            'template_name' => $webhook->template?->name,
            'payload_mappings' => $webhook->payload_mappings ?? [],
            'template_variable_paths' => array_values((array) ($webhook->template_variable_paths ?? [])),
            'template_static_params' => array_values((array) ($webhook->template_static_params ?? [])),
            'last_received_at' => $webhook->last_received_at?->toIso8601String(),
            'last_triggered_at' => $webhook->last_triggered_at?->toIso8601String(),
            'last_error' => $webhook->last_error,
            'created_at' => $webhook->created_at?->toIso8601String(),
            'recent_logs' => $webhook->logs
                ->take(10)
                ->map(fn (InboundAutomationWebhookLog $log) => [
                    'id' => $log->id,
                    'status' => $log->status,
                    'response_summary' => $log->response_summary,
                    'created_at' => $log->created_at?->toIso8601String(),
                    'processed_at' => $log->processed_at?->toIso8601String(),
                ])
                ->values()
                ->all(),
        ];
    }

    protected function formatDelivery(TenantWebhookDelivery $delivery): array
    {
        return [
            'id' => $delivery->id,
            'event_key' => $delivery->event_key,
            'event_id' => $delivery->event_id,
            'status' => $delivery->status,
            'attempts' => (int) $delivery->attempts,
            'http_status' => $delivery->http_status,
            'error_message' => $delivery->error_message,
            'created_at' => $delivery->created_at?->toIso8601String(),
            'delivered_at' => $delivery->delivered_at?->toIso8601String(),
            'next_retry_at' => $delivery->next_retry_at?->toIso8601String(),
        ];
    }

    /**
     * @return array<string,mixed>
     */
    protected function webhookSamplePayloads(): array
    {
        return [
            'message.received' => [
                'event_id' => 'uuid',
                'event' => 'message.received',
                'account_id' => 123,
                'occurred_at' => now()->toIso8601String(),
                'data' => [
                    'message_id' => 999,
                    'conversation_id' => 77,
                    'direction' => 'inbound',
                    'status' => 'delivered',
                    'type' => 'text',
                    'text_body' => 'hello',
                ],
            ],
            'template.status_changed' => [
                'event_id' => 'uuid',
                'event' => 'template.status_changed',
                'account_id' => 123,
                'occurred_at' => now()->toIso8601String(),
                'data' => [
                    'template_id' => 55,
                    'name' => 'order_update',
                    'status' => 'approved',
                    'rejection_reason' => null,
                ],
            ],
            'connection.health_changed' => [
                'event_id' => 'uuid',
                'event' => 'connection.health_changed',
                'account_id' => 123,
                'occurred_at' => now()->toIso8601String(),
                'data' => [
                    'connection_id' => 42,
                    'health_state' => 'warning',
                    'quality_rating' => 'yellow',
                    'restriction_state' => null,
                ],
            ],
        ];
    }
}
