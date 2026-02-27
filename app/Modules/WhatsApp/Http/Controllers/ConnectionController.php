<?php

namespace App\Modules\WhatsApp\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Core\Billing\EntitlementService;
use App\Modules\WhatsApp\Models\WhatsAppConnection;
use App\Models\PlatformSetting;
use App\Modules\WhatsApp\Services\ConnectionService;
use App\Modules\WhatsApp\Services\MetaGraphService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class ConnectionController extends Controller
{
    public function __construct(
        protected ConnectionService $connectionService,
        protected EntitlementService $entitlementService,
        protected MetaGraphService $metaGraphService
    ) {
    }

    /**
     * Display a listing of connections.
     */
    public function index(Request $request): Response
    {
        $account = $request->attributes->get('account') ?? current_account();

        $connections = WhatsAppConnection::where('account_id', $account->id)
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(function ($connection) {
                return [
                    'id' => $connection->id,
                    'slug' => $connection->slug ?? (string) $connection->id,
                    'name' => $connection->name,
                    'phone_number_id' => $connection->phone_number_id,
                    'business_phone' => $connection->business_phone,
                    'is_active' => $connection->is_active,
                    'throughput_cap_per_minute' => $connection->throughput_cap_per_minute,
                    'quiet_hours_start' => $connection->quiet_hours_start,
                    'quiet_hours_end' => $connection->quiet_hours_end,
                    'quiet_hours_timezone' => $connection->quiet_hours_timezone,
                    'webhook_subscribed' => $connection->webhook_subscribed,
                    'webhook_last_received_at' => $connection->webhook_last_received_at?->toIso8601String(),
                    'webhook_url' => $this->connectionService->getWebhookUrl($connection),
                    'created_at' => $connection->created_at->toIso8601String()];
            });

        return Inertia::render('WhatsApp/Connections/Index', [
            'account' => $account,
            'connections' => $connections,
            'canCreate' => Gate::allows('create', WhatsAppConnection::class)]);
    }

    /**
     * Show the form for creating a new connection.
     */
    public function create(Request $request): Response
    {
        $account = $request->attributes->get('account') ?? current_account();

        Gate::authorize('create', WhatsAppConnection::class);

        $embeddedSignup = $this->getEmbeddedSignupConfig();

        return Inertia::render('WhatsApp/Connections/Create', [
            'account' => $account,
            'embeddedSignup' => $embeddedSignup,
            'defaultApiVersion' => config('whatsapp.meta.api_version', 'v21.0')]);
    }

    /**
     * Show the Embedded Signup wizard.
     */
    public function wizard(Request $request): Response
    {
        $account = $request->attributes->get('account') ?? current_account();

        Gate::authorize('create', WhatsAppConnection::class);

        $embeddedSignup = $this->getEmbeddedSignupConfig();

        return Inertia::render('WhatsApp/Connections/EmbeddedWizard', [
            'account' => $account,
            'embeddedSignup' => $embeddedSignup,
            'defaultApiVersion' => config('whatsapp.meta.api_version', 'v21.0')]);
    }

    /**
     * Store a newly created connection.
     */
    public function store(Request $request)
    {
        $account = $request->attributes->get('account') ?? current_account();

        Gate::authorize('create', WhatsAppConnection::class);

        if (!$this->entitlementService->canCreateConnection($account)) {
            abort(402, 'You have reached your connections limit. Please upgrade your plan to add more connections.');
        }

        $validated = $request->validate([
            'name' => 'nullable|string|max:255',
            'waba_id' => 'nullable|string|max:255',
            'phone_number_id' => 'required|string|max:255',
            'business_phone' => 'nullable|string|max:255',
            'access_token' => 'required|string',
            'api_version' => 'nullable|string|max:10',
            'throughput_cap_per_minute' => 'nullable|integer|min:1|max:1000',
            'quiet_hours_start' => ['nullable', 'regex:/^\d{2}:\d{2}$/'],
            'quiet_hours_end' => ['nullable', 'regex:/^\d{2}:\d{2}$/'],
            'quiet_hours_timezone' => 'nullable|timezone']);

        if (!isset($validated['name']) || trim((string) $validated['name']) === '') {
            $seed = $validated['business_phone'] ?? $validated['phone_number_id'];
            $digits = preg_replace('/\D+/', '', (string) $seed);
            $tail = $digits !== '' ? substr($digits, -4) : substr((string) $seed, -4);
            $validated['name'] = trim('WhatsApp '.($tail ?: 'Connection'));
        }

        $connection = $this->connectionService->create($account, $validated);

        return redirect()->route('app.whatsapp.connections.index')->with('success', 'Connection created successfully.');
    }

    /**
     * Test a WhatsApp connection before saving.
     */
    public function testConnection(Request $request)
    {
        $account = $request->attributes->get('account') ?? current_account();

        Gate::authorize('create', WhatsAppConnection::class);

        $validated = $request->validate([
            'phone_number_id' => 'required|string|max:255',
            'access_token' => 'required|string',
            'waba_id' => 'nullable|string|max:255']);

        $accessToken = $validated['access_token'];
        $phoneNumberId = $validated['phone_number_id'];
        $wabaId = $validated['waba_id'] ?? null;

        try {
            $details = $this->metaGraphService->getPhoneNumberDetails($phoneNumberId, $accessToken);

            $result = [
                'ok' => true,
                'display_phone_number' => $details['display_phone_number'] ?? null,
                'verified_name' => $details['verified_name'] ?? null];

            if ($wabaId) {
                $numbers = $this->metaGraphService->listPhoneNumbers($wabaId, $accessToken);
                $matches = collect($numbers)->first(fn ($n) => ($n['id'] ?? null) === $phoneNumberId);
                $result['waba_match'] = $matches ? true : false;
            }

            return response()->json($result);
        } catch (\Throwable $e) {
            return response()->json([
                'ok' => false,
                'error' => $e->getMessage()], 422);
        }
    }

    /**
     * Store a connection via Embedded Signup.
     */
    public function storeEmbedded(Request $request)
    {
        $account = $request->attributes->get('account') ?? current_account();

        Gate::authorize('create', WhatsAppConnection::class);

        $embeddedSignup = $this->getEmbeddedSignupConfig();
        if (!($embeddedSignup['enabled'] ?? false)) {
            return redirect()->back()->withErrors([
                'embedded' => 'Embedded Signup is disabled. Please contact the platform administrator.']);
        }

        $validated = $request->validate([
            'name' => 'nullable|string|max:255',
            'waba_id' => 'nullable|string|max:255',
            'phone_number_id' => 'nullable|string|max:255',
            'business_phone' => 'nullable|string|max:255',
            'access_token' => 'nullable|string',
            'code' => 'nullable|string',
            'redirect_uri' => 'nullable|url',
            'pin' => 'nullable|digits:6']);

        if (empty($validated['access_token']) && empty($validated['code'])) {
            return redirect()->back()->withErrors([
                'embedded' => 'Missing Meta OAuth code or access token.']);
        }

        try {
            $accessToken = $validated['access_token'] ?? null;
            if (!$accessToken && !empty($validated['code'])) {
                $redirectUri = $this->resolveEmbeddedRedirectUri($validated['redirect_uri'] ?? null);
                $tokenData = $this->metaGraphService->exchangeCodeForToken($validated['code'], $redirectUri);
                $accessToken = $tokenData['access_token'] ?? null;
            }

            if (!$accessToken) {
                throw new \RuntimeException('Unable to obtain access token from Meta.');
            }

            $longLivedTokenData = $this->metaGraphService->exchangeForLongLivedToken($accessToken);
            if (!empty($longLivedTokenData['access_token'])) {
                $accessToken = $longLivedTokenData['access_token'];
            }

            $systemUserToken = config('whatsapp.meta.system_user_token');
            $effectiveToken = $systemUserToken ?: $accessToken;

            $wabaId = $validated['waba_id'] ?? null;
            if (!$wabaId) {
                $debugData = $this->metaGraphService->debugToken($accessToken, $effectiveToken);
                $wabaId = $this->extractWabaIdFromDebugToken($debugData);
            }

            $phoneNumberId = $validated['phone_number_id'] ?? null;
            if (!$phoneNumberId && $wabaId) {
                $numbers = $this->metaGraphService->listPhoneNumbers($wabaId, $effectiveToken);
                if (count($numbers) === 1) {
                    $phoneNumberId = $numbers[0]['id'] ?? null;
                }
            }

            if (!$wabaId || !$phoneNumberId) {
                throw new \RuntimeException('Unable to resolve WABA ID and Phone Number ID from Embedded Signup.');
            }

            $businessPhone = $validated['business_phone'] ?? null;
            if (!$businessPhone) {
                try {
                    $details = $this->metaGraphService->getPhoneNumberDetails($phoneNumberId, $effectiveToken);
                    $businessPhone = $details['display_phone_number'] ?? null;
                } catch (\Throwable $e) {
                    Log::channel('whatsapp')->warning('Phone number details lookup failed', [
                        'phone_number_id' => $phoneNumberId,
                        'error' => $e->getMessage()]);
                }
            }

            // Subscribe app to WABA (best practice)
            try {
                $this->metaGraphService->subscribeAppToWaba($wabaId, $effectiveToken);
            } catch (\Throwable $e) {
                Log::channel('whatsapp')->warning('Subscribe app to WABA failed (continuing)', [
                    'waba_id' => $wabaId,
                    'error' => $e->getMessage()]);
            }

            // Register phone number if PIN provided
            if (!empty($validated['pin'])) {
                $this->metaGraphService->registerPhoneNumber($phoneNumberId, $validated['pin'], $effectiveToken);
            }

            $connectionName = $validated['name'] ?: ($businessPhone ? "WhatsApp {$businessPhone}" : 'WhatsApp Connection');

            $existing = WhatsAppConnection::where('account_id', $account->id)
                ->where('phone_number_id', $phoneNumberId)
                ->first();

            if ($existing) {
                $this->connectionService->update($existing, [
                    'name' => $connectionName,
                    'waba_id' => $wabaId,
                    'business_phone' => $businessPhone,
                    'access_token' => $effectiveToken,
                    'api_version' => $this->metaGraphService->getApiVersion()]);

                return redirect()->route('app.whatsapp.connections.index')->with('success', 'Connection updated successfully.');
            }

            $this->connectionService->create($account, [
                'name' => $connectionName,
                'waba_id' => $wabaId,
                'phone_number_id' => $phoneNumberId,
                'business_phone' => $businessPhone,
                'access_token' => $effectiveToken,
                'api_version' => $this->metaGraphService->getApiVersion()]);

            return redirect()->route('app.whatsapp.connections.index')->with('success', 'Connection created successfully.');
        } catch (\Throwable $e) {
            Log::channel('whatsapp')->error('Embedded signup failed', [
                'account_id' => $account?->id,
                'error' => $e->getMessage()]);

            return redirect()->back()->withErrors([
                'embedded' => $e->getMessage()]);
        }
    }

    public function embeddedTelemetry(Request $request)
    {
        $account = $request->attributes->get('account') ?? current_account();

        $validated = $request->validate([
            'step' => 'required|string|max:64',
            'status' => 'required|string|in:started,progress,success,error,cancelled',
            'message' => 'nullable|string|max:500',
            'context' => 'nullable|array',
        ]);

        DB::table('activity_logs')->insert([
            'type' => 'system_event',
            'description' => sprintf('Embedded Signup %s: %s', $validated['status'], $validated['step']),
            'user_id' => $request->user()?->id,
            'account_id' => $account?->id,
            'metadata' => json_encode([
                'module' => 'whatsapp.embedded_signup',
                'step' => $validated['step'],
                'status' => $validated['status'],
                'message' => $validated['message'] ?? null,
                'context' => $validated['context'] ?? [],
            ]),
            'ip_address' => $request->ip(),
            'user_agent' => substr((string) $request->userAgent(), 0, 65535),
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        return response()->json(['ok' => true]);
    }

    private function getEmbeddedSignupConfig(): array
    {
        $appId = PlatformSetting::get('whatsapp.meta_app_id', config('whatsapp.meta.app_id'));
        $configId = PlatformSetting::get('whatsapp.embedded_signup_config_id', config('whatsapp.meta.embedded_signup_config_id'));
        $apiVersion = PlatformSetting::get('whatsapp.api_version', config('whatsapp.meta.api_version', 'v21.0'));
        $oauthRedirectUri = PlatformSetting::get(
            'whatsapp.embedded_oauth_redirect_uri',
            route('app.whatsapp.connections.create')
        );
        $enabledSetting = PlatformSetting::get('whatsapp.embedded_enabled', null);
        $enabled = $enabledSetting !== null ? (bool) $enabledSetting : (bool) ($appId && $configId);

        return [
            'enabled' => $enabled,
            'appId' => $enabled ? $appId : null,
            'configId' => $enabled ? $configId : null,
            'apiVersion' => $apiVersion ?: 'v21.0',
            'oauthRedirectUri' => $enabled ? $oauthRedirectUri : null];
    }

    /**
     * Meta requires the token exchange redirect_uri to exactly match the OAuth dialog redirect_uri.
     * Normalize client-provided values to a stable allowlisted URI (strip query/hash, allow only known paths).
     */
    private function resolveEmbeddedRedirectUri(?string $requestedRedirectUri): string
    {
        $platformConfigured = (string) PlatformSetting::get(
            'whatsapp.embedded_oauth_redirect_uri',
            route('app.whatsapp.connections.create')
        );

        $allowed = [
            $platformConfigured,
            route('app.whatsapp.connections.create'),
            route('app.whatsapp.connections.wizard'),
        ];

        if ($requestedRedirectUri) {
            $parts = parse_url($requestedRedirectUri);
            if ($parts !== false && !empty($parts['scheme']) && !empty($parts['host']) && !empty($parts['path'])) {
                $normalized = $parts['scheme'].'://'.$parts['host']
                    .(isset($parts['port']) ? ':'.$parts['port'] : '')
                    .$parts['path'];

                foreach ($allowed as $uri) {
                    if (rtrim($normalized, '/') === rtrim($uri, '/')) {
                        return $uri;
                    }
                }
            }
        }

        return route('app.whatsapp.connections.create');
    }

    /**
     * Resolve connection from route parameter (handles both string ID and model instance).
     */
    protected function resolveConnection($connection, $account): WhatsAppConnection
    {
        // Always resolve fresh from database with account scoping for security
        // Even if route binding provided an instance, we verify it belongs to the account
        $connectionValue = $connection instanceof WhatsAppConnection ? ($connection->slug ?? $connection->id) : $connection;
        
        // Try to resolve by slug first, then by ID (for backward compatibility)
        // Always scope by account for security
        $resolved = WhatsAppConnection::where('account_id', $account->id)
            ->where(function ($query) use ($connectionValue) {
                $query->where('slug', $connectionValue);
                // Also try as ID if the value is numeric
                if (is_numeric($connectionValue)) {
                    $query->orWhere('id', $connectionValue);
                }
            })
            ->first();
        
        if (!$resolved) {
            abort(404, 'Connection not found in this account.');
        }
        
        return $resolved;
    }

    protected function extractWabaIdFromDebugToken(array $debugData): ?string
    {
        $granularScopes = $debugData['granular_scopes'] ?? [];
        foreach ($granularScopes as $scope) {
            if (($scope['scope'] ?? '') === 'whatsapp_business_management') {
                $targetIds = $scope['target_ids'] ?? [];
                if (!empty($targetIds)) {
                    return (string) $targetIds[0];
                }
            }
        }

        return null;
    }

    /**
     * Show the form for editing a connection.
     */
    public function edit(Request $request, $connection): Response
    {
        $account = $request->attributes->get('account') ?? current_account();
        $connection = $this->resolveConnection($connection, $account);

        Gate::authorize('update', $connection);

        // Mask sensitive tokens (only show last 4 chars)
        $verifyToken = $connection->webhook_verify_token;
        $maskedVerifyToken = $verifyToken ? substr($verifyToken, 0, 4) . str_repeat('*', max(0, strlen($verifyToken) - 4)) : null;

        return Inertia::render('WhatsApp/Connections/Edit', [
            'account' => $account,
            'connection' => [
                'id' => $connection->id,
                'slug' => $connection->slug ?? (string) $connection->id,
                'name' => $connection->name,
                'waba_id' => $connection->waba_id,
                'phone_number_id' => $connection->phone_number_id,
                'business_phone' => $connection->business_phone,
                'api_version' => $connection->api_version,
                'webhook_verify_token' => $maskedVerifyToken, // Masked
                'webhook_verify_token_full' => $verifyToken, // Full token for copy (only if owner/admin)
                'webhook_url' => $this->connectionService->getWebhookUrl($connection),
                'webhook_subscribed' => $connection->webhook_subscribed,
                'webhook_last_received_at' => $connection->webhook_last_received_at?->toIso8601String(),
                'webhook_last_error' => $connection->webhook_last_error,
                'throughput_cap_per_minute' => $connection->throughput_cap_per_minute,
                'quiet_hours_start' => $connection->quiet_hours_start,
                'quiet_hours_end' => $connection->quiet_hours_end,
                'quiet_hours_timezone' => $connection->quiet_hours_timezone],
            'canViewSecrets' => $account->isOwnedBy($request->user()) || 
                               $account->users()->where('user_id', $request->user()->id)->where('role', 'admin')->exists() ||
                               Gate::allows('update', $connection)]);
    }

    /**
     * Show health check page for a connection.
     */
    public function showHealth(Request $request, $connection): Response
    {
        $account = $request->attributes->get('account') ?? current_account();
        $connection = $this->resolveConnection($connection, $account);

        Gate::authorize('view', $connection);

        return Inertia::render('WhatsApp/Connections/HealthCheck', [
            'account' => $account,
            'connection' => [
                'id' => $connection->id,
                'slug' => $connection->slug ?? (string) $connection->id,
                'name' => $connection->name]]);
    }

    /**
     * Update the specified connection.
     */
    public function update(Request $request, $connection)
    {
        $account = $request->attributes->get('account') ?? current_account();
        $connection = $this->resolveConnection($connection, $account);

        Gate::authorize('update', $connection);

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'waba_id' => 'nullable|string|max:255',
            'phone_number_id' => 'required|string|max:255',
            'business_phone' => 'nullable|string|max:255',
            'access_token' => 'nullable|string', // Optional on update
            'api_version' => 'nullable|string|max:10',
            'throughput_cap_per_minute' => 'nullable|integer|min:1|max:1000',
            'quiet_hours_start' => ['nullable', 'regex:/^\d{2}:\d{2}$/'],
            'quiet_hours_end' => ['nullable', 'regex:/^\d{2}:\d{2}$/'],
            'quiet_hours_timezone' => 'nullable|timezone']);

        $this->connectionService->update($connection, $validated);

        return redirect()->route('app.whatsapp.connections.index')->with('success', 'Connection updated successfully.');
    }

    /**
     * Rotate the webhook verify token.
     */
    public function rotateVerifyToken(Request $request, $connection)
    {
        $account = $request->attributes->get('account') ?? current_account();
        $connection = $this->resolveConnection($connection, $account);

        Gate::authorize('update', $connection);

        $this->connectionService->rotateVerifyToken($connection);

        return redirect()->back()->with('success', 'Verify token rotated successfully.');
    }

    /**
     * Test the webhook endpoint for this connection (internal verification).
     */
    public function testWebhook(Request $request, $connection)
    {
        $account = $request->attributes->get('account') ?? current_account();
        $connection = $this->resolveConnection($connection, $account);

        Gate::authorize('update', $connection);

        $challenge = Str::random(16);
        $url = $this->connectionService->getWebhookUrl($connection);

        try {
            $response = Http::timeout(10)->get($url, [
                'hub.mode' => 'subscribe',
                'hub.verify_token' => $connection->webhook_verify_token,
                'hub.challenge' => $challenge]);

            $ok = $response->ok() && trim((string) $response->body()) === $challenge;

            return response()->json([
                'ok' => $ok,
                'status' => $response->status(),
                'message' => $ok ? 'Webhook verified successfully.' : 'Webhook verification failed.'], $ok ? 200 : 422);
        } catch (\Throwable $e) {
            Log::warning('Webhook test failed', [
                'connection_id' => $connection->id,
                'account_id' => $account->id,
                'error' => $e->getMessage(),
                'url' => $url]);
            return response()->json([
                'ok' => false,
                'error' => 'Webhook test failed. Please check that your webhook URL is reachable and try again.'], 422);
        }
    }

    /**
     * Test an existing connection using the stored access token.
     */
    public function testSavedConnection(Request $request, $connection)
    {
        $account = $request->attributes->get('account') ?? current_account();
        $connection = $this->resolveConnection($connection, $account);

        Gate::authorize('update', $connection);

        $accessToken = $connection->access_token;
        if (!$accessToken) {
            return response()->json([
                'ok' => false,
                'error' => 'No access token is stored for this connection.'], 422);
        }

        try {
            $details = $this->metaGraphService->getPhoneNumberDetails($connection->phone_number_id, $accessToken);

            return response()->json([
                'ok' => true,
                'display_phone_number' => $details['display_phone_number'] ?? null,
                'verified_name' => $details['verified_name'] ?? null,
                'quality_rating' => $details['quality_rating'] ?? null,
                'messaging_limit_tier' => $details['messaging_limit_tier'] ?? null,
                'code_verification_status' => $details['code_verification_status'] ?? null,
            ]);
        } catch (\Throwable $e) {
            Log::warning('Connection test failed', [
                'connection_id' => $connection->id,
                'account_id' => $account->id,
                'error' => $e->getMessage()]);
            return response()->json([
                'ok' => false,
                'error' => 'Connection test failed. Please verify your WhatsApp credentials and try again.'], 422);
        }
    }

    /**
     * Fetch Meta-side WABA/phone/verification insights for the connection.
     */
    public function metaInsights(Request $request, $connection)
    {
        $account = $request->attributes->get('account') ?? current_account();
        $connection = $this->resolveConnection($connection, $account);

        Gate::authorize('view', $connection);

        if (!$connection->access_token) {
            return response()->json([
                'ok' => false,
                'error' => 'No access token is stored for this connection.',
            ], 422);
        }

        $insights = [
            'waba' => null,
            'phone_numbers' => [],
            'selected_phone' => null,
            'business_verification' => [
                'status' => 'UNKNOWN',
                'help_url' => 'https://business.facebook.com/settings/security-center',
            ],
            'manage_numbers_url' => 'https://business.facebook.com/latest/whatsapp_manager/phone_numbers',
        ];

        if (!empty($connection->waba_id)) {
            try {
                $waba = $this->metaGraphService->getWabaDetails($connection->waba_id, $connection->access_token);
                $insights['waba'] = [
                    'id' => $waba['id'] ?? $connection->waba_id,
                    'name' => $waba['name'] ?? null,
                    'currency' => $waba['currency'] ?? null,
                    'timezone_id' => $waba['timezone_id'] ?? null,
                    'account_review_status' => $waba['account_review_status'] ?? null,
                ];

                $verificationStatus = $waba['business_verification_status'] ?? null;
                if (is_string($verificationStatus) && $verificationStatus !== '') {
                    $insights['business_verification']['status'] = strtoupper($verificationStatus);
                }
            } catch (\Throwable $e) {
                Log::channel('whatsapp')->warning('WABA insights lookup failed', [
                    'connection_id' => $connection->id,
                    'waba_id' => $connection->waba_id,
                    'error' => $e->getMessage(),
                ]);
            }

            try {
                $numbers = $this->metaGraphService->listPhoneNumbers($connection->waba_id, $connection->access_token);
                $insights['phone_numbers'] = collect($numbers)->map(function (array $number) {
                    return [
                        'id' => $number['id'] ?? null,
                        'display_phone_number' => $number['display_phone_number'] ?? null,
                        'verified_name' => $number['verified_name'] ?? null,
                        'quality_rating' => $number['quality_rating'] ?? null,
                        'messaging_limit_tier' => $number['messaging_limit_tier'] ?? null,
                        'code_verification_status' => $number['code_verification_status'] ?? null,
                    ];
                })->values()->all();
            } catch (\Throwable $e) {
                Log::channel('whatsapp')->warning('WABA phone list lookup failed', [
                    'connection_id' => $connection->id,
                    'waba_id' => $connection->waba_id,
                    'error' => $e->getMessage(),
                ]);
            }
        }

        if (!empty($connection->phone_number_id)) {
            try {
                $selectedPhone = $this->metaGraphService->getPhoneNumberDetails($connection->phone_number_id, $connection->access_token);
                $insights['selected_phone'] = [
                    'id' => $connection->phone_number_id,
                    'display_phone_number' => $selectedPhone['display_phone_number'] ?? null,
                    'verified_name' => $selectedPhone['verified_name'] ?? null,
                    'quality_rating' => $selectedPhone['quality_rating'] ?? null,
                    'messaging_limit_tier' => $selectedPhone['messaging_limit_tier'] ?? null,
                    'code_verification_status' => $selectedPhone['code_verification_status'] ?? null,
                    'name_status' => $selectedPhone['name_status'] ?? null,
                ];
            } catch (\Throwable $e) {
                Log::channel('whatsapp')->warning('Selected phone details lookup failed', [
                    'connection_id' => $connection->id,
                    'phone_number_id' => $connection->phone_number_id,
                    'error' => $e->getMessage(),
                ]);
            }
        }

        return response()->json([
            'ok' => true,
            'insights' => $insights,
        ]);
    }
}
