<?php

namespace App\Modules\WhatsApp\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Core\Billing\EntitlementService;
use App\Modules\WhatsApp\Models\WhatsAppConnection;
use App\Models\PlatformSetting;
use App\Modules\WhatsApp\Services\ConnectionService;
use App\Modules\WhatsApp\Services\ConnectionHealthSyncService;
use App\Modules\WhatsApp\Services\ConnectionLifecycleService;
use App\Modules\WhatsApp\Models\WhatsAppEmbeddedSignupEvent;
use App\Modules\WhatsApp\Services\EmbeddedSignupProvisioningService;
use App\Modules\WhatsApp\Services\EmbeddedSignupEventService;
use App\Modules\WhatsApp\Services\MetaGraphService;
use App\Modules\WhatsApp\Services\TechProviderProvisioningService;
use Illuminate\Http\Request;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class ConnectionController extends Controller
{
    protected const WHATSAPP_PROFILE_VERTICALS = [
        'UNDEFINED' => 'Unspecified',
        'OTHER' => 'Other',
        'AUTO' => 'Automotive',
        'BEAUTY' => 'Beauty, Spa, and Salon',
        'APPAREL' => 'Clothing and Apparel',
        'EDU' => 'Education',
        'ENTERTAIN' => 'Arts and Entertainment',
        'EVENT_PLAN' => 'Event Planning and Service',
        'FINANCE' => 'Finance and Banking',
        'GROCERY' => 'Food and Grocery',
        'GOVT' => 'Public Service',
        'HOTEL' => 'Hotel and Lodging',
        'HEALTH' => 'Medical and Health',
        'NONPROFIT' => 'Non-profit',
        'PROF_SERVICES' => 'Professional Services',
        'RETAIL' => 'Shopping and Retail',
        'TRAVEL' => 'Travel and Transportation',
        'RESTAURANT' => 'Restaurant',
        'NOT_A_BIZ' => 'Not a business',
        'ALCOHOL' => 'Alcohol',
        'ONLINE_GAMBLING' => 'Online Gambling',
        'PHYSICAL_GAMBLING' => 'Physical Gambling',
        'OTC_DRUGS' => 'OTC Drugs',
        'MATRIMONY_SERVICE' => 'Matrimony Service',
    ];

    public function __construct(
        protected ConnectionService $connectionService,
        protected EntitlementService $entitlementService,
        protected MetaGraphService $metaGraphService,
        protected ConnectionHealthSyncService $connectionHealthSyncService,
        protected ConnectionLifecycleService $connectionLifecycleService,
        protected EmbeddedSignupProvisioningService $embeddedSignupProvisioningService,
        protected EmbeddedSignupEventService $embeddedSignupEventService,
        protected TechProviderProvisioningService $techProviderProvisioningService
    ) {
    }

    /**
     * Display a listing of connections.
     */
    public function index(Request $request): Response
    {
        $account = $request->attributes->get('account') ?? current_account();
        $staleAfterHours = (int) config('whatsapp.connection.health_stale_after_hours', 24);
        $staleCutoff = now()->subHours(max(1, $staleAfterHours));

        $connections = WhatsAppConnection::where('account_id', $account->id)
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(function ($connection) use ($staleCutoff, $staleAfterHours) {
                $lastSyncedAt = $connection->health_last_synced_at;
                $isStale = !$lastSyncedAt || $lastSyncedAt->lt($staleCutoff);
                $cachedProfile = $this->getCachedBusinessProfile($connection);

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
                    'quality_rating' => $connection->quality_rating,
                    'messaging_limit_tier' => $connection->messaging_limit_tier,
                    'health_state' => $connection->health_state,
                    'restriction_state' => $connection->restriction_state,
                    'warning_state' => $connection->warning_state,
                    'health_last_synced_at' => $connection->health_last_synced_at?->toIso8601String(),
                    'metadata_sync_status' => $connection->metadata_sync_status ?: ($isStale ? 'stale' : 'fresh'),
                    'metadata_last_sync_error' => $connection->metadata_last_sync_error,
                    'metadata_stale' => $isStale,
                    'metadata_stale_after_hours' => $staleAfterHours,
                    'activation_state' => $connection->activation_state ?: 'active',
                    'activation_last_error' => $connection->activation_last_error,
                    'activation_updated_at' => $connection->activation_updated_at?->toIso8601String(),
                    'provisioning_step' => $connection->provisioning_step,
                    'provisioning_status' => $connection->provisioning_status ?: 'pending',
                    'provisioning_last_error' => $connection->provisioning_last_error,
                    'provisioning_completed_at' => $connection->provisioning_completed_at?->toIso8601String(),
                    'provisioning_context' => $connection->provisioning_context,
                    'business_profile' => $cachedProfile,
                    'webhook_mode' => 'central',
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

        try {
            $connection = $this->connectionService->create($account, $validated);
        } catch (\RuntimeException $e) {
            return redirect()->back()->withInput()->withErrors([
                'connection' => $e->getMessage(),
            ]);
        }

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

        $targetConnection = null;
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
            'code_source' => 'nullable|string|max:64',
            'signup_variant' => 'nullable|string|max:64',
            'redirect_uri' => 'nullable|url',
            'session_waba_id' => 'nullable|string|max:255',
            'session_phone_number_id' => 'nullable|string|max:255',
            'pin' => 'nullable|digits:6']);

        if (empty($validated['access_token']) && empty($validated['code'])) {
            return redirect()->back()->withErrors([
                'embedded' => 'Missing Meta OAuth code or access token.']);
        }

        Log::channel('whatsapp')->info('Embedded signup submission received', [
            'account_id' => $account?->id,
            'request_path' => $request->path(),
            'has_code' => !empty($validated['code']),
            'code_summary' => $this->summarizeOAuthCode($validated['code'] ?? null),
            'has_access_token' => !empty($validated['access_token']),
            'signup_variant' => $validated['signup_variant'] ?? null,
            'requested_redirect_uri' => $validated['redirect_uri'] ?? null,
        ]);

        $targetConnection = null;
        try {
            $accessToken = $validated['access_token'] ?? null;
            if (!$accessToken && !empty($validated['code'])) {
                $redirectCandidates = $this->buildEmbeddedRedirectUriCandidates(
                    $validated['redirect_uri'] ?? null,
                    $validated['code_source'] ?? null
                );
                Log::channel('whatsapp')->info('Embedded signup redirect URI candidates resolved', [
                    'account_id' => $account?->id,
                    'request_path' => $request->path(),
                    'requested_redirect_uri' => $validated['redirect_uri'] ?? null,
                    'code_source' => $validated['code_source'] ?? null,
                    'resolved_redirect_uri' => $this->resolveEmbeddedRedirectUri($validated['redirect_uri'] ?? null),
                    'redirect_candidates' => $redirectCandidates,
                    'code_summary' => $this->summarizeOAuthCode($validated['code'] ?? null),
                ]);
                $lastExchangeError = null;

                foreach ($redirectCandidates as $redirectUri) {
                    try {
                        Log::channel('whatsapp')->info('Embedded signup OAuth exchange redirect URI attempt', [
                            'account_id' => $account?->id,
                            'request_path' => $request->path(),
                            'requested_redirect_uri' => $validated['redirect_uri'] ?? null,
                            'code_source' => $validated['code_source'] ?? null,
                            'attempt_redirect_uri' => $redirectUri,
                            'code_summary' => $this->summarizeOAuthCode($validated['code'] ?? null),
                        ]);

                        $tokenData = $this->metaGraphService->exchangeCodeForToken($validated['code'], $redirectUri);
                        $accessToken = $tokenData['access_token'] ?? null;
                        $lastExchangeError = null;
                        Log::channel('whatsapp')->info('Embedded signup OAuth exchange succeeded', [
                            'account_id' => $account?->id,
                            'request_path' => $request->path(),
                            'attempt_redirect_uri' => $redirectUri,
                            'code_summary' => $this->summarizeOAuthCode($validated['code'] ?? null),
                        ]);
                        break;
                    } catch (\Throwable $exchangeError) {
                        $lastExchangeError = $exchangeError;
                        Log::channel('whatsapp')->warning('Embedded signup OAuth exchange attempt failed', [
                            'account_id' => $account?->id,
                            'request_path' => $request->path(),
                            'attempt_redirect_uri' => $redirectUri,
                            'code_summary' => $this->summarizeOAuthCode($validated['code'] ?? null),
                            'is_redirect_uri_mismatch' => $this->isRedirectUriMismatchError($exchangeError),
                            'error' => $exchangeError->getMessage(),
                        ]);
                        if (!$this->isRedirectUriMismatchError($exchangeError)) {
                            throw $exchangeError;
                        }
                    }
                }

                if (!$accessToken && $lastExchangeError) {
                    if ($this->isRedirectUriMismatchError($lastExchangeError)) {
                        throw new \RuntimeException(
                            'Embedded signup could not complete because the OAuth redirect URI did not match exactly. '.
                            'Use the same redirect URI in Meta App settings and in the signup flow (including trailing slash/query).'
                        );
                    }
                    throw $lastExchangeError;
                }
            }

            if (!$accessToken) {
                throw new \RuntimeException('Unable to obtain access token from Meta.');
            }

            // Meta Tech Provider mode: use partner System User token for durable access.
            // Do not rely on exchanging client token to a long-lived user token.
            $systemUserToken = (string) config('whatsapp.meta.system_user_token');
            $strictProvisioning = filter_var(
                config('whatsapp.meta.strict_embedded_provisioning', false),
                FILTER_VALIDATE_BOOLEAN
            );
            $effectiveToken = $systemUserToken !== '' ? $systemUserToken : $accessToken;
            $appAccessToken = $this->metaGraphService->appAccessToken();

            $wabaId = ($validated['session_waba_id'] ?? null) ?: ($validated['waba_id'] ?? null);
            if (!$wabaId) {
                $debugData = $this->metaGraphService->debugToken($accessToken, $appAccessToken ?: $effectiveToken);
                $wabaId = $this->extractWabaIdFromDebugToken($debugData);
            }

            $phoneNumberId = ($validated['session_phone_number_id'] ?? null) ?: ($validated['phone_number_id'] ?? null);
            if (!$phoneNumberId && $wabaId) {
                $numbers = $this->metaGraphService->listPhoneNumbers($wabaId, $effectiveToken);
                if (count($numbers) === 1) {
                    $phoneNumberId = $numbers[0]['id'] ?? null;
                }
            }

            if (!$wabaId || !$phoneNumberId) {
                throw new \RuntimeException('Unable to resolve WABA ID and Phone Number ID from Embedded Signup.');
            }

            $this->connectionService->assertEmbeddedAssetOwnership($account, $phoneNumberId, $wabaId);

            // Prevent duplicate assets in the same tenant when reconnecting/re-authorizing.
            $existingByAssets = WhatsAppConnection::query()
                ->where('account_id', $account->id)
                ->where(function ($query) use ($phoneNumberId, $wabaId) {
                    $query->where('phone_number_id', $phoneNumberId);
                    if (!empty($wabaId)) {
                        $query->orWhere('waba_id', $wabaId);
                    }
                })
                ->orderByDesc('updated_at')
                ->first();

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
                $this->metaGraphService->subscribeAppToWaba($wabaId, $appAccessToken ?: $effectiveToken);
            } catch (\Throwable $e) {
                Log::channel('whatsapp')->warning('Subscribe app to WABA failed (continuing)', [
                    'waba_id' => $wabaId,
                    'error' => $e->getMessage()]);
            }

            // Register phone number if PIN provided
            if (!empty($validated['pin'])) {
                $this->metaGraphService->registerPhoneNumber($phoneNumberId, $validated['pin'], $effectiveToken);
            }

            $connectionName = ($validated['name'] ?? null) ?: ($businessPhone ? "WhatsApp {$businessPhone}" : 'WhatsApp Connection');
            $targetConnection = $existingByAssets;
            $tokenDebugData = $this->metaGraphService->debugToken($accessToken, $appAccessToken ?: $effectiveToken);
            $tokenMetadata = [
                'debug' => [
                    'app_id' => $tokenDebugData['app_id'] ?? null,
                    'type' => $tokenDebugData['type'] ?? null,
                    'application' => $tokenDebugData['application'] ?? null,
                    'expires_at' => $tokenDebugData['expires_at'] ?? null,
                    'granular_scopes' => $tokenDebugData['granular_scopes'] ?? [],
                    'scopes' => $tokenDebugData['scopes'] ?? [],
                ],
                'session' => [
                    'waba_id' => $validated['session_waba_id'] ?? null,
                    'phone_number_id' => $validated['session_phone_number_id'] ?? null,
                ],
            ];
            if ($targetConnection) {
                $this->connectionLifecycleService->transition($targetConnection, 'provisioning', null, [
                    'source' => 'embedded_signup_reauth',
                ]);
                $this->connectionService->update($targetConnection, [
                    'name' => $connectionName,
                    'waba_id' => $wabaId,
                    'business_phone' => $businessPhone,
                    'access_token' => $effectiveToken,
                    'token_type' => $systemUserToken !== '' ? 'system_user' : 'business_exchange',
                    'token_source' => $systemUserToken !== '' ? 'provider_system_user' : 'embedded_code_exchange',
                    'token_last_validated_at' => now(),
                    'token_metadata' => $tokenMetadata,
                    'api_version' => $this->metaGraphService->getApiVersion(),
                    'provisioning_context' => null,
                    'provisioning_completed_at' => null,
                    'provisioning_last_error' => null,
                    'provisioning_step' => null,
                    'provisioning_status' => EmbeddedSignupProvisioningService::STATUS_PENDING,
                ]);
                $targetConnection->refresh();
            } else {
                $targetConnection = $this->connectionService->create($account, [
                    'name' => $connectionName,
                    'waba_id' => $wabaId,
                    'phone_number_id' => $phoneNumberId,
                    'business_phone' => $businessPhone,
                    'access_token' => $effectiveToken,
                    'token_type' => $systemUserToken !== '' ? 'system_user' : 'business_exchange',
                    'token_source' => $systemUserToken !== '' ? 'provider_system_user' : 'embedded_code_exchange',
                    'token_last_validated_at' => now(),
                    'token_metadata' => $tokenMetadata,
                    'api_version' => $this->metaGraphService->getApiVersion(),
                    'activation_state' => 'provisioning',
                    'activation_updated_at' => now(),
                    'metadata_sync_status' => 'pending',
                    'provisioning_status' => EmbeddedSignupProvisioningService::STATUS_PENDING,
                ]);
            }

            $this->embeddedSignupProvisioningService->complete($targetConnection, 'oauth_complete', [
                'used_code' => !empty($validated['code']),
                'used_access_token' => !empty($validated['access_token']),
                'token_type' => $systemUserToken !== '' ? 'system_user' : 'business_exchange',
            ]);
            $this->embeddedSignupProvisioningService->complete($targetConnection, 'assets_resolved', [
                'waba_id' => $wabaId,
                'phone_number_id' => $phoneNumberId,
                'business_phone' => $businessPhone,
                'source' => [
                    'session_waba_id' => $validated['session_waba_id'] ?? null,
                    'session_phone_number_id' => $validated['session_phone_number_id'] ?? null,
                ],
            ]);
            $targetConnection = $this->techProviderProvisioningService->provision(
                connection: $targetConnection,
                wabaId: $wabaId,
                phoneNumberId: $phoneNumberId,
                rawAccessToken: $accessToken,
                pin: !empty($validated['pin']) ? $validated['pin'] : null,
                strict: $strictProvisioning
            );

            return redirect()->route('app.whatsapp.connections.index')->with('success', $existingByAssets
                ? 'Connection re-authorized and synced successfully.'
                : 'Connection created successfully.');
        } catch (\Throwable $e) {
            if ($targetConnection instanceof WhatsAppConnection) {
                if ($targetConnection->provisioning_step) {
                    $this->embeddedSignupProvisioningService->fail(
                        $targetConnection,
                        (string) $targetConnection->provisioning_step,
                        $e->getMessage()
                    );
                }
                $this->connectionLifecycleService->markMetadataSync($targetConnection, 'error', $e->getMessage(), [
                    'source' => 'embedded_signup',
                    'phase' => 'store_embedded',
                ]);
                $this->connectionLifecycleService->transition($targetConnection, 'failed', $e->getMessage(), [
                    'source' => 'embedded_signup',
                    'phase' => 'store_embedded',
                ]);
            }
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

        $this->embeddedSignupEventService->record(
            $account,
            $request->user()?->id,
            $validated,
            $request
        );

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
     * Keep the exact client URI (including query string) when it matches an allowlisted base URI.
     */
    private function resolveEmbeddedRedirectUri(?string $requestedRedirectUri): string
    {
        $platformConfiguredRaw = (string) PlatformSetting::get(
            'whatsapp.embedded_oauth_redirect_uri',
            route('app.whatsapp.connections.create')
        );
        $platformConfigured = $this->normalizeRedirectUriWithQuery($platformConfiguredRaw)
            ?? $this->normalizeRedirectUriWithQuery(route('app.whatsapp.connections.create'))
            ?? route('app.whatsapp.connections.create');

        $allowedRaw = [
            $platformConfigured,
            (string) route('app.whatsapp.connections.create'),
            (string) route('app.whatsapp.connections.wizard'),
        ];
        $allowed = array_values(array_unique(array_filter(array_map(
            fn ($uri) => $this->normalizeRedirectUriWithQuery((string) $uri),
            $allowedRaw
        ))));

        if ($requestedRedirectUri) {
            $normalizedRequested = $this->normalizeRedirectUriWithQuery($requestedRedirectUri);
            if ($normalizedRequested) {
                $requestedBase = $this->normalizeRedirectUriBase($normalizedRequested);
                foreach ($allowed as $allowedUri) {
                    if (
                        $requestedBase !== null
                        && $requestedBase === $this->normalizeRedirectUriBase($allowedUri)
                    ) {
                        return $normalizedRequested;
                    }
                }
            }
        }

        return $platformConfigured;
    }

    /**
     * Build a short allowlisted candidate list for Meta code exchange, including slash variants.
     */
    private function buildEmbeddedRedirectUriCandidates(?string $requestedRedirectUri, ?string $codeSource = null): array
    {
        if ($codeSource === 'fb_login_callback' || $codeSource === 'postmessage') {
            return [null];
        }

        $primary = $this->resolveEmbeddedRedirectUri($requestedRedirectUri);
        $platformConfiguredRaw = (string) PlatformSetting::get(
            'whatsapp.embedded_oauth_redirect_uri',
            route('app.whatsapp.connections.create')
        );

        $rawCandidates = array_filter([
            $primary,
            $requestedRedirectUri,
            $platformConfiguredRaw,
            (string) route('app.whatsapp.connections.create'),
            (string) route('app.whatsapp.connections.wizard'),
        ]);

        $normalized = [];
        foreach ($rawCandidates as $candidate) {
            $uri = $this->normalizeRedirectUriWithQuery((string) $candidate);
            if (!$uri) {
                continue;
            }

            $normalized[] = $uri;

            $parts = parse_url($uri);
            if ($parts !== false && isset($parts['path']) && !isset($parts['query'])) {
                $path = $parts['path'];
                if ($path !== '/') {
                    $altPath = str_ends_with($path, '/') ? rtrim($path, '/') : $path.'/';
                    if ($altPath !== '') {
                        $altUri = $parts['scheme'].'://'.$parts['host']
                            .(isset($parts['port']) ? ':'.$parts['port'] : '')
                            .$altPath;
                        $normalized[] = $altUri;
                    }
                }
            }
        }

        return array_values(array_unique($normalized));
    }

    private function isRedirectUriMismatchError(\Throwable $error): bool
    {
        $message = strtolower($error->getMessage());
        return str_contains($message, 'redirect_uri is identical')
            || str_contains($message, 'redirect_uri');
    }

    private function provisionTechProviderOwnership(
        string $wabaId,
        string $accessToken,
        string $systemUserId,
        string $systemUserToken,
        string $creditLineId,
        bool $strict
    ): void {
        $provisioningToken = $systemUserToken !== '' ? $systemUserToken : $accessToken;

        if ($systemUserId !== '') {
            try {
                $this->metaGraphService->assignSystemUserToWaba(
                    wabaId: $wabaId,
                    systemUserId: $systemUserId,
                    accessToken: $provisioningToken
                );
            } catch (\Throwable $e) {
                if ($strict) {
                    throw new \RuntimeException('System User assignment failed: '.$e->getMessage(), 0, $e);
                }
                Log::channel('whatsapp')->warning('System User assignment skipped (non-strict)', [
                    'waba_id' => $wabaId,
                    'system_user_id' => $systemUserId,
                    'error' => $e->getMessage(),
                ]);
            }
        } elseif ($strict) {
            throw new \RuntimeException('System User ID is required for strict embedded provisioning.');
        }

        if ($creditLineId !== '') {
            try {
                $this->metaGraphService->attachCreditLineToWaba(
                    creditLineId: $creditLineId,
                    wabaId: $wabaId,
                    accessToken: $provisioningToken
                );
            } catch (\Throwable $e) {
                if ($strict) {
                    throw new \RuntimeException('Credit line attachment failed: '.$e->getMessage(), 0, $e);
                }
                Log::channel('whatsapp')->warning('Credit line attach skipped (non-strict)', [
                    'waba_id' => $wabaId,
                    'credit_line_id' => $creditLineId,
                    'error' => $e->getMessage(),
                ]);
            }
        }
    }

    private function normalizeRedirectUriWithQuery(?string $uri): ?string
    {
        if (!$uri) {
            return null;
        }

        $parts = parse_url($uri);
        if ($parts === false || empty($parts['scheme']) || empty($parts['host']) || !array_key_exists('path', $parts)) {
            return null;
        }

        $normalized = $parts['scheme'].'://'.$parts['host']
            .(isset($parts['port']) ? ':'.$parts['port'] : '')
            .$parts['path'];

        if (isset($parts['query']) && $parts['query'] !== '') {
            $normalized .= '?'.$parts['query'];
        }

        return $normalized;
    }

    private function normalizeRedirectUriBase(?string $uri): ?string
    {
        $normalized = $this->normalizeRedirectUriWithQuery($uri);
        if (!$normalized) {
            return null;
        }

        $parts = parse_url($normalized);
        if ($parts === false || empty($parts['scheme']) || empty($parts['host']) || !array_key_exists('path', $parts)) {
            return null;
        }

        return rtrim(
            $parts['scheme'].'://'.$parts['host']
            .(isset($parts['port']) ? ':'.$parts['port'] : '')
            .$parts['path'],
            '/'
        );
    }

    private function summarizeOAuthCode(?string $code): ?array
    {
        if (!$code) {
            return null;
        }

        return [
            'length' => strlen($code),
            'prefix' => substr($code, 0, 12),
            'sha1' => sha1($code),
        ];
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
        $staleAfterHours = (int) config('whatsapp.connection.health_stale_after_hours', 24);
        $staleCutoff = now()->subHours(max(1, $staleAfterHours));
        $metadataStale = !$connection->health_last_synced_at || $connection->health_last_synced_at->lt($staleCutoff);

        Gate::authorize('update', $connection);

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
                'webhook_mode' => 'central',
                'webhook_url' => $this->connectionService->getWebhookUrl($connection),
                'webhook_subscribed' => $connection->webhook_subscribed,
                'webhook_last_received_at' => $connection->webhook_last_received_at?->toIso8601String(),
                'webhook_last_error' => $connection->webhook_last_error,
                'quality_rating' => $connection->quality_rating,
                'messaging_limit_tier' => $connection->messaging_limit_tier,
                'account_review_status' => $connection->account_review_status,
                'business_verification_status' => $connection->business_verification_status,
                'display_name_status' => $connection->display_name_status,
                'health_state' => $connection->health_state,
                'restriction_state' => $connection->restriction_state,
                'warning_state' => $connection->warning_state,
                'health_last_synced_at' => $connection->health_last_synced_at?->toIso8601String(),
                'metadata_sync_status' => $connection->metadata_sync_status ?: ($metadataStale ? 'stale' : 'fresh'),
                'metadata_last_sync_error' => $connection->metadata_last_sync_error,
                'metadata_stale' => $metadataStale,
                'metadata_stale_after_hours' => $staleAfterHours,
                'activation_state' => $connection->activation_state ?: 'active',
                'activation_last_error' => $connection->activation_last_error,
                'activation_updated_at' => $connection->activation_updated_at?->toIso8601String(),
                'token_type' => $connection->token_type,
                'token_source' => $connection->token_source,
                'token_last_validated_at' => $connection->token_last_validated_at?->toIso8601String(),
                'token_metadata' => $connection->token_metadata,
                'throughput_cap_per_minute' => $connection->throughput_cap_per_minute,
                'quiet_hours_start' => $connection->quiet_hours_start,
                'quiet_hours_end' => $connection->quiet_hours_end,
                'quiet_hours_timezone' => $connection->quiet_hours_timezone,
                'business_profile' => $this->getCachedBusinessProfile($connection),
            ],
            'embeddedSignupEvents' => WhatsAppEmbeddedSignupEvent::query()
                ->where('account_id', $account->id)
                ->where(function ($query) use ($connection) {
                    $query->where('whatsapp_connection_id', $connection->id);
                    if ($connection->waba_id) {
                        $query->orWhere('waba_id', $connection->waba_id);
                    }
                    if ($connection->phone_number_id) {
                        $query->orWhere('phone_number_id', $connection->phone_number_id);
                    }
                })
                ->latest('id')
                ->limit(10)
                ->get()
                ->map(fn (WhatsAppEmbeddedSignupEvent $event) => [
                    'id' => $event->id,
                    'event' => $event->event,
                    'status' => $event->status,
                    'current_step' => $event->current_step,
                    'message' => $event->message,
                    'waba_id' => $event->waba_id,
                    'phone_number_id' => $event->phone_number_id,
                    'created_at' => $event->created_at?->toIso8601String(),
                ]),
        ]);
    }

    public function editProfile(Request $request, $connection): Response
    {
        $account = $request->attributes->get('account') ?? current_account();
        $connection = $this->resolveConnection($connection, $account);

        Gate::authorize('update', $connection);

        $businessProfile = $this->loadBusinessProfile($connection);

        return Inertia::render('WhatsApp/Connections/Profile', [
            'account' => $account,
            'connection' => [
                'id' => $connection->id,
                'slug' => $connection->slug ?? (string) $connection->id,
                'name' => $connection->name,
                'business_phone' => $connection->business_phone,
                'phone_number_id' => $connection->phone_number_id,
                'business_profile' => $businessProfile['profile'],
                'business_profile_error' => $businessProfile['error'],
            ],
            'verticalOptions' => $this->businessProfileVerticalOptions(),
        ]);
    }

    public function syncHealth(Request $request, $connection)
    {
        $account = $request->attributes->get('account') ?? current_account();
        $connection = $this->resolveConnection($connection, $account);

        Gate::authorize('update', $connection);

        try {
            $snapshot = $this->connectionHealthSyncService->syncConnection($connection, 'manual_sync');
            if (!$snapshot) {
                $this->connectionLifecycleService->markMetadataSync($connection, 'stale', 'No metadata returned from Meta during manual sync.', [
                    'source' => 'manual_sync',
                ]);
                return redirect()->back()->withErrors([
                    'error' => 'Unable to sync health right now. Confirm access token and phone number are configured.',
                ]);
            }

            return redirect()->back()->with('success', 'Connection health synced successfully.');
        } catch (\Throwable $e) {
            Log::channel('whatsapp')->warning('Manual connection health sync failed', [
                'connection_id' => $connection->id,
                'error' => $e->getMessage(),
            ]);
            $this->connectionLifecycleService->markMetadataSync($connection, 'error', $e->getMessage(), [
                'source' => 'manual_sync',
            ]);

            return redirect()->back()->withErrors([
                'error' => 'Failed to sync connection health: '.$e->getMessage(),
            ]);
        }
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
            'quiet_hours_timezone' => 'nullable|timezone',
        ]);

        try {
            $this->connectionService->update($connection, $validated);
        } catch (\RuntimeException $e) {
            return redirect()->back()->withInput()->withErrors([
                'connection' => $e->getMessage(),
            ]);
        }

        return redirect()->route('app.whatsapp.connections.index')->with('success', 'Connection updated successfully.');
    }

    public function updateProfile(Request $request, $connection)
    {
        $account = $request->attributes->get('account') ?? current_account();
        $connection = $this->resolveConnection($connection, $account);

        Gate::authorize('update', $connection);

        $validated = $request->validate([
            'profile_about' => 'nullable|string|max:140',
            'profile_description' => 'nullable|string|max:512',
            'profile_address' => 'nullable|string|max:256',
            'profile_email' => 'nullable|email|max:255',
            'profile_website' => 'nullable|url|max:255',
            'profile_website_secondary' => 'nullable|url|max:255',
            'profile_vertical' => 'nullable|string|in:' . implode(',', array_keys(self::WHATSAPP_PROFILE_VERTICALS)),
            'profile_image' => 'nullable|image|mimes:jpeg,jpg,png|max:5120',
        ]);

        try {
            $this->syncBusinessProfile($connection, $validated);
        } catch (\RuntimeException $e) {
            return redirect()->back()->withInput()->withErrors([
                'connection' => $e->getMessage(),
            ]);
        }

        return redirect()
            ->route('app.whatsapp.connections.profile.edit', ['connection' => $connection->slug ?? $connection->id])
            ->with('success', 'WhatsApp profile updated successfully.');
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
        $verifyToken = (string) PlatformSetting::get('whatsapp.webhook_verify_token', config('whatsapp.webhook.verify_token', ''));

        if ($verifyToken === '') {
            return response()->json([
                'ok' => false,
                'error' => 'Central webhook verify token is not configured.',
            ], 422);
        }

        try {
            $response = Http::timeout(10)->get($url, [
                'hub.mode' => 'subscribe',
                'hub.verify_token' => $verifyToken,
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

    protected function loadBusinessProfile(WhatsAppConnection $connection): array
    {
        $empty = [
            'about' => '',
            'description' => '',
            'address' => '',
            'email' => '',
            'website' => '',
            'vertical' => '',
            'profile_picture_url' => null,
        ];

        if (!$connection->phone_number_id || !$connection->access_token) {
            return ['profile' => $empty, 'error' => null];
        }

        try {
            $profile = $this->normalizeBusinessProfile(
                $this->metaGraphService->getWhatsAppBusinessProfile($connection->phone_number_id, $connection->access_token)
            );

            $this->storeBusinessProfileCache($connection, $profile);

            return [
                'profile' => $profile,
                'error' => null,
            ];
        } catch (\Throwable $e) {
            Log::channel('whatsapp')->warning('Unable to load WhatsApp business profile', [
                'connection_id' => $connection->id,
                'phone_number_id' => $connection->phone_number_id,
                'error' => $e->getMessage(),
            ]);

            $cachedProfile = $this->getCachedBusinessProfile($connection);
            if ($cachedProfile !== null) {
                return [
                    'profile' => $cachedProfile,
                    'error' => 'Showing your last saved WhatsApp profile details. WhatsApp is not returning a live refresh right now.',
                ];
            }

            return [
                'profile' => $empty,
                'error' => 'WhatsApp is not returning profile details right now. You can still update the profile below.',
            ];
        }
    }

    protected function syncBusinessProfile(WhatsAppConnection $connection, array &$validated): void
    {
        $profileFields = [
            'profile_about',
            'profile_description',
            'profile_address',
            'profile_email',
            'profile_website',
            'profile_website_secondary',
            'profile_vertical',
            'profile_image',
        ];

        $profileProvided = collect($profileFields)->contains(fn (string $field) => array_key_exists($field, $validated));

        if (!$profileProvided) {
            return;
        }

        if (!$connection->phone_number_id || !$connection->access_token) {
            throw new \RuntimeException('This connection is missing WhatsApp credentials required to update the business profile.');
        }

        $profilePayload = [
            'about' => trim((string) ($validated['profile_about'] ?? '')),
            'description' => trim((string) ($validated['profile_description'] ?? '')),
            'address' => trim((string) ($validated['profile_address'] ?? '')),
            'email' => trim((string) ($validated['profile_email'] ?? '')),
            'vertical' => $this->normalizeBusinessProfileVertical($validated['profile_vertical'] ?? null),
            'websites' => array_values(array_filter([
                trim((string) ($validated['profile_website'] ?? '')),
                trim((string) ($validated['profile_website_secondary'] ?? '')),
            ])),
        ];

        if (($validated['profile_image'] ?? null) instanceof UploadedFile) {
            $profilePayload['profile_picture_handle'] = $this->metaGraphService->uploadWhatsAppBusinessProfilePicture(
                $connection->phone_number_id,
                $connection->access_token,
                $validated['profile_image']
            );
        }

        $this->metaGraphService->updateWhatsAppBusinessProfile($connection->phone_number_id, $connection->access_token, $profilePayload);

        try {
            $liveProfile = $this->normalizeBusinessProfile(
                $this->metaGraphService->getWhatsAppBusinessProfile($connection->phone_number_id, $connection->access_token)
            );
            $this->storeBusinessProfileCache($connection, $liveProfile);
        } catch (\Throwable) {
            $this->storeBusinessProfileCache($connection, $this->normalizeBusinessProfile([
                ...($this->getCachedBusinessProfile($connection) ?? []),
                ...$profilePayload,
            ]));
        }

        foreach ($profileFields as $field) {
            unset($validated[$field]);
        }
    }

    protected function normalizeBusinessProfile(array $profile): array
    {
        $vertical = $this->normalizeBusinessProfileVertical($profile['vertical'] ?? null);

        return [
            'about' => (string) ($profile['about'] ?? ''),
            'description' => (string) ($profile['description'] ?? ''),
            'address' => (string) ($profile['address'] ?? ''),
            'email' => (string) ($profile['email'] ?? ''),
            'website' => (string) (($profile['website'] ?? $profile['websites'][0] ?? '') ?: ''),
            'website_secondary' => (string) (($profile['websites'][1] ?? '') ?: ''),
            'vertical' => $vertical,
            'vertical_label' => $vertical !== '' ? (self::WHATSAPP_PROFILE_VERTICALS[$vertical] ?? $vertical) : '',
            'profile_picture_url' => $profile['profile_picture_url'] ?? null,
        ];
    }

    protected function businessProfileVerticalOptions(): array
    {
        return collect(self::WHATSAPP_PROFILE_VERTICALS)
            ->map(fn (string $label, string $value) => ['value' => $value, 'label' => $label])
            ->values()
            ->all();
    }

    protected function normalizeBusinessProfileVertical(mixed $value): string
    {
        $raw = trim((string) ($value ?? ''));
        if ($raw === '') {
            return '';
        }

        $upper = strtoupper(str_replace([' ', '/', '&', ',', '-'], ['_', '_', '_', '', '_'], $raw));
        $aliases = [
            'PROFESSIONAL_SERVICES' => 'PROF_SERVICES',
            'IT_SOFTWARE' => 'PROF_SERVICES',
            'IT___SOFTWARE' => 'PROF_SERVICES',
            'IT' => 'PROF_SERVICES',
            'SOFTWARE' => 'PROF_SERVICES',
            'SHOPPING_AND_RETAIL' => 'RETAIL',
            'FOOD_AND_GROCERY' => 'GROCERY',
            'MEDICAL_AND_HEALTH' => 'HEALTH',
            'ARTS_AND_ENTERTAINMENT' => 'ENTERTAIN',
            'EVENT_PLANNING_AND_SERVICE' => 'EVENT_PLAN',
            'FINANCE_AND_BANKING' => 'FINANCE',
            'HOTEL_AND_LODGING' => 'HOTEL',
            'PUBLIC_SERVICE' => 'GOVT',
            'CLOTHING_AND_APPAREL' => 'APPAREL',
            'BEAUTY_SPA_AND_SALON' => 'BEAUTY',
            'TRAVEL_AND_TRANSPORTATION' => 'TRAVEL',
        ];

        $normalized = $aliases[$upper] ?? $upper;

        if (array_key_exists($normalized, self::WHATSAPP_PROFILE_VERTICALS)) {
            return $normalized;
        }

        $byLabel = array_change_key_case(array_flip(self::WHATSAPP_PROFILE_VERTICALS), CASE_UPPER);

        return $byLabel[strtoupper($raw)] ?? '';
    }

    protected function getCachedBusinessProfile(WhatsAppConnection $connection): ?array
    {
        $cached = $connection->token_metadata['business_profile_cache'] ?? null;

        if (!is_array($cached)) {
            return null;
        }

        return $this->normalizeBusinessProfile($cached);
    }

    protected function storeBusinessProfileCache(WhatsAppConnection $connection, array $profile): void
    {
        $metadata = $connection->token_metadata ?? [];
        $metadata['business_profile_cache'] = [
            ...$profile,
            'cached_at' => now()->toIso8601String(),
        ];

        $connection->forceFill([
            'token_metadata' => $metadata,
        ])->save();
    }
}
