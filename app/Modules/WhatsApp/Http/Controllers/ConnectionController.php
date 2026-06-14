<?php

namespace App\Modules\WhatsApp\Http\Controllers;

use App\Core\Billing\EntitlementService;
use App\Http\Controllers\Controller;
use App\Models\PlatformSetting;
use App\Modules\WhatsApp\Models\WhatsAppConnection;
use App\Modules\WhatsApp\Models\WhatsAppMetaEventLog;
use App\Modules\WhatsApp\Services\ConnectionService;
use App\Modules\WhatsApp\Services\MetaGraphService;
use Illuminate\Http\Request;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Schema;
use Inertia\Inertia;
use Inertia\Response;

class ConnectionController extends Controller
{
    public function __construct(
        protected ConnectionService $connectionService,
        protected EntitlementService $entitlementService,
        protected MetaGraphService $metaGraphService
    ) {}

    /**
     * Display a listing of connections.
     */
    public function index(Request $request): Response|RedirectResponse
    {
        $account = $request->attributes->get('account') ?? current_account();

        if (! $this->canConnectWabaAfterPayment($account)) {
            return $this->paymentRequiredRedirect($account);
        }

        $connections = WhatsAppConnection::where('account_id', $account->id)
            ->orderBy('created_at', 'desc')
            ->get()
            ->each(fn ($connection) => $this->syncBusinessProfileFromMeta($connection))
            ->map(function ($connection) {
                return [
                    'id' => $connection->id,
                    'slug' => $connection->slug ?? (string) $connection->id,
                    'name' => $connection->name,
                    'waba_id' => $connection->waba_id,
                    'meta_business_id' => $connection->meta_business_id,
                    'meta_waba_name' => $connection->meta_waba_name,
                    'meta_account_review_status' => $connection->meta_account_review_status,
                    'meta_business_verification_status' => $connection->meta_business_verification_status,
                    'meta_timezone_id' => $connection->meta_timezone_id,
                    'meta_template_namespace' => $connection->meta_template_namespace,
                    'meta_subscribed_apps' => $connection->meta_subscribed_apps ?? [],
                    'phone_number_id' => $connection->phone_number_id,
                    'business_phone' => $connection->business_phone,
                    'meta_verified_name' => $connection->meta_verified_name,
                    'phone_number_status' => $connection->phone_number_status,
                    'quality_rating' => $connection->quality_rating,
                    'code_verification_status' => $connection->code_verification_status,
                    'business_category' => $connection->business_category ?? 'Retail',
                    'business_about' => $connection->business_about ?? 'Turn conversations into conversions - WhatsApp marketing made simple.',
                    'business_address' => $connection->business_address,
                    'business_description' => $connection->business_description,
                    'business_email' => $connection->business_email,
                    'business_websites' => $connection->business_websites ?? [],
                    'business_vertical' => $connection->business_vertical ?? 'RETAIL',
                    'profile_picture_url' => $connection->profile_picture_url,
                    'profile_picture_handle' => $connection->profile_picture_handle,
                    'profile_synced_at' => $connection->profile_synced_at?->toIso8601String(),
                    'profile_sync_error' => $connection->profile_sync_error,
                    'setup_method' => $connection->setup_method ?? 'manual',
                    'connection_mode' => $connection->connection_mode ?? $this->connectionModeFromSetupMethod($connection->setup_method ?? 'manual'),
                    'qr_session_id' => $connection->qr_session_id,
                    'qr_status' => $connection->qr_status,
                    'qr_last_seen_at' => $connection->qr_last_seen_at?->toIso8601String(),
                    'qr_last_error' => $connection->qr_last_error,
                    'qr_safety_settings' => $connection->qr_safety_settings ?? [],
                    'coexistence_status' => $connection->coexistence_status,
                    'coexistence_metadata' => $connection->coexistence_metadata ?? [],
                    'coexistence_last_checked_at' => $connection->coexistence_last_checked_at?->toIso8601String(),
                    'coexistence_last_error' => $connection->coexistence_last_error,
                    'webhook_url' => $this->connectionService->getWebhookUrl($connection),
                    'webhook_verify_token' => $connection->webhook_verify_token,
                    'webhook_subscribed' => $connection->webhook_subscribed,
                    'webhook_last_received_at' => $connection->webhook_last_received_at?->toIso8601String(),
                    'webhook_last_error' => $connection->webhook_last_error,
                    'is_active' => $connection->is_active,
                    'api_version' => $connection->api_version,
                    'throughput_cap_per_minute' => $connection->throughput_cap_per_minute,
                    'quiet_hours_start' => $connection->quiet_hours_start,
                    'quiet_hours_end' => $connection->quiet_hours_end,
                    'quiet_hours_timezone' => $connection->quiet_hours_timezone,
                    'meta_event_logs' => $this->recentMetaEventLogs($connection),
                    'created_at' => $connection->created_at->toIso8601String()];
            });

        return Inertia::render('WhatsApp/Connections/Index', [
            'account' => $account,
            'connections' => $connections,
            'canCreate' => Gate::allows('create', WhatsAppConnection::class),
            'embeddedSignup' => $this->getEmbeddedSignupConfig(),
            'centralWebhook' => [
                'url' => route('webhooks.whatsapp.central.receive'),
                'verify_token' => WebhookController::centralVerifyToken(),
            ],
            'defaultApiVersion' => config('whatsapp.meta.api_version', 'v25.0')]);
    }

    protected function recentMetaEventLogs(WhatsAppConnection $connection): array
    {
        if (! Schema::hasTable('whatsapp_meta_event_logs')) {
            return [];
        }

        return WhatsAppMetaEventLog::where('whatsapp_connection_id', $connection->id)
            ->orderByDesc('received_at')
            ->orderByDesc('id')
            ->limit(8)
            ->get(['id', 'field', 'event_type', 'status', 'message', 'received_at', 'created_at'])
            ->map(fn (WhatsAppMetaEventLog $log) => [
                'id' => $log->id,
                'field' => $log->field,
                'event_type' => $log->event_type,
                'status' => $log->status,
                'message' => $log->message,
                'received_at' => ($log->received_at ?? $log->created_at)?->toIso8601String(),
            ])
            ->values()
            ->all();
    }

    protected function canConnectWabaAfterPayment($account): bool
    {
        $account->loadMissing('subscription.plan');
        $subscription = $account->subscription;
        $plan = $subscription?->plan;

        if (! $subscription || ! $plan) {
            return false;
        }

        $isZeroAmountPlan = (int) ($plan->price_monthly ?? 0) <= 0;
        if ($isZeroAmountPlan && $subscription->isActive()) {
            return true;
        }

        if ($subscription->isInTrial()) {
            return true;
        }

        return $subscription->isActive() && $subscription->last_payment_at !== null;
    }

    protected function paymentRequiredRedirect($account): RedirectResponse
    {
        $account->loadMissing('subscription.plan');
        $planKey = $account->subscription?->plan?->key;

        return redirect()->route('app.billing.index', [
            'tab' => 'plans',
            'checkout_plan' => $planKey,
        ])->with('error', 'Payment is required before connecting WhatsApp.');
    }

    /**
     * Store a newly created connection.
     */
    public function store(Request $request)
    {
        $account = $request->attributes->get('account') ?? current_account();

        if (! $this->canConnectWabaAfterPayment($account)) {
            return $this->paymentRequiredRedirect($account);
        }

        if ($this->accountHasWabaAccount($account)) {
            return redirect()->route('app.whatsapp.connections.index')
                ->with('error', 'Only one WABA account can be connected to a workspace.');
        }

        Gate::authorize('create', WhatsAppConnection::class);

        if (! $this->entitlementService->canCreateConnection($account)) {
            abort(402, 'Only one WABA account can be connected to a workspace.');
        }

        $validated = $request->validate([
            'name' => 'nullable|string|max:255',
            'waba_id' => 'nullable|string|max:255',
            'phone_number_id' => 'required|string|max:255',
            'business_phone' => 'nullable|string|max:255',
            'business_category' => 'nullable|string|max:255',
            'business_about' => 'nullable|string|min:1|max:139',
            'business_address' => 'nullable|string|max:256',
            'business_description' => 'nullable|string|max:512',
            'business_email' => 'nullable|email|max:128',
            'business_websites' => 'nullable|array|max:2',
            'business_websites.*' => 'nullable|url|max:256',
            'business_vertical' => 'nullable|string|max:80',
            'access_token' => 'required|string',
            'api_version' => 'nullable|string|max:10',
            'throughput_cap_per_minute' => 'nullable|integer|min:1|max:1000',
            'quiet_hours_start' => ['nullable', 'regex:/^\d{2}:\d{2}$/'],
            'quiet_hours_end' => ['nullable', 'regex:/^\d{2}:\d{2}$/'],
            'quiet_hours_timezone' => 'nullable|timezone']);

        $validated['setup_method'] = 'manual';
        $validated['connection_mode'] = 'cloud_api';

        if (! isset($validated['name']) || trim((string) $validated['name']) === '') {
            $seed = $validated['business_phone'] ?? $validated['phone_number_id'];
            $digits = preg_replace('/\D+/', '', (string) $seed);
            $tail = $digits !== '' ? substr($digits, -4) : substr((string) $seed, -4);
            $validated['name'] = trim('WhatsApp '.($tail ?: 'Connection'));
        }

        $this->connectionService->ensurePhoneAvailable(
            $account,
            $validated['phone_number_id'] ?? null,
            $validated['business_phone'] ?? null
        );

        $connection = $this->connectionService->create($account, $validated);

        return redirect()->route('app.whatsapp.connections.index')->with('success', 'WABA account connected successfully.');
    }

    /**
     * Test a WhatsApp connection before saving.
     */
    public function testConnection(Request $request)
    {
        $account = $request->attributes->get('account') ?? current_account();

        if (! $this->canConnectWabaAfterPayment($account)) {
            abort(402, 'Payment is required before connecting WhatsApp.');
        }

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

        if (! $this->canConnectWabaAfterPayment($account)) {
            return $this->paymentRequiredRedirect($account);
        }

        Gate::authorize('create', WhatsAppConnection::class);

        $embeddedSignup = $this->getEmbeddedSignupConfig();
        if (! ($embeddedSignup['enabled'] ?? false)) {
            return redirect()->back()->withErrors([
                'embedded' => 'Embedded Signup is disabled. Please contact the platform administrator.']);
        }

        $validated = $request->validate([
            'name' => 'nullable|string|max:255',
            'waba_id' => 'nullable|string|max:255',
            'phone_number_id' => 'nullable|string|max:255',
            'business_phone' => 'nullable|string|max:255',
            'business_id' => 'nullable|string|max:255',
            'session_info' => 'nullable',
            'access_token' => 'nullable|string',
            'code' => 'nullable|string',
            'redirect_uri' => 'nullable|url',
            'connection_mode' => 'nullable|string|in:cloud_api,coexistence',
            'pin' => 'nullable|digits:6']);

        if (empty($validated['access_token']) && empty($validated['code'])) {
            return redirect()->back()->withErrors([
                'embedded' => 'Missing Meta OAuth code or access token.']);
        }

        try {
            $sessionInfo = $this->parseEmbeddedSessionInfo($validated['session_info'] ?? null);
            $sessionData = $sessionInfo['data'] ?? $sessionInfo;
            $connectionMode = ($validated['connection_mode'] ?? null) === 'coexistence' ? 'coexistence' : 'cloud_api';
            $accessToken = $validated['access_token'] ?? null;
            if (! $accessToken && ! empty($validated['code'])) {
                $redirectUri = $validated['redirect_uri'] ?? null;
                $tokenData = $this->metaGraphService->exchangeCodeForToken($validated['code'], $redirectUri);
                $accessToken = $tokenData['access_token'] ?? null;
            }

            if (! $accessToken) {
                throw new \RuntimeException('Unable to obtain access token from Meta.');
            }

            try {
                $longLived = $this->metaGraphService->exchangeForLongLivedToken($accessToken);
                $accessToken = $longLived['access_token'] ?? $accessToken;
            } catch (\Throwable $e) {
                Log::channel('whatsapp')->warning('Long-lived token exchange failed (continuing with original token)', [
                    'account_id' => $account?->id,
                    'error' => $e->getMessage(),
                ]);
            }

            $businessId = $validated['business_id']
                ?? $sessionData['business_id']
                ?? $sessionInfo['business_id']
                ?? null;

            $wabaId = $validated['waba_id']
                ?? $sessionData['waba_id']
                ?? $sessionInfo['waba_id']
                ?? null;
            if (! $wabaId) {
                $debugData = $this->metaGraphService->debugToken($accessToken);
                $wabaId = $this->extractWabaIdFromDebugToken($debugData);
            }

            if (! $wabaId && $businessId) {
                $ownedWabas = $this->metaGraphService->listOwnedWhatsAppBusinessAccounts((string) $businessId, $accessToken);
                if (count($ownedWabas) === 1) {
                    $wabaId = $ownedWabas[0]['id'] ?? null;
                }
            }

            $phoneNumberId = $validated['phone_number_id']
                ?? $sessionData['phone_number_id']
                ?? $sessionInfo['phone_number_id']
                ?? null;
            if (! $phoneNumberId && $wabaId) {
                $numbers = $this->metaGraphService->listPhoneNumbers($wabaId, $accessToken);
                if (count($numbers) === 1) {
                    $phoneNumberId = $numbers[0]['id'] ?? null;
                }
            }

            if (! $wabaId || ! $phoneNumberId) {
                throw new \RuntimeException('Unable to resolve WABA ID and Phone Number ID from Embedded Signup.');
            }

            $workspaceConnection = WhatsAppConnection::where('account_id', $account->id)
                ->where('is_active', true)
                ->first();
            if ($workspaceConnection && $workspaceConnection->phone_number_id !== $phoneNumberId) {
                return redirect()->route('app.whatsapp.connections.index')
                    ->with('error', 'Only one WABA account can be connected to a workspace. Manage the existing account or contact support to replace it.');
            }

            $businessPhone = $validated['business_phone'] ?? null;
            $businessPhone = $businessPhone
                ?: ($sessionData['phone_number'] ?? null)
                ?: ($sessionData['display_phone_number'] ?? null)
                ?: ($sessionInfo['phone_number'] ?? null)
                ?: ($sessionInfo['display_phone_number'] ?? null);
            $phoneDetails = [];
            try {
                $phoneDetails = $this->metaGraphService->getPhoneNumberDetails($phoneNumberId, $accessToken);
                if (! $businessPhone) {
                    $businessPhone = $phoneDetails['display_phone_number'] ?? null;
                }
            } catch (\Throwable $e) {
                Log::channel('whatsapp')->warning('Phone number details lookup failed', [
                    'phone_number_id' => $phoneNumberId,
                    'error' => $e->getMessage()]);
            }

            $wabaDetails = $this->fetchWabaDetailsSafely($wabaId, $accessToken);
            $subscribedApps = [];
            $webhookSubscribed = false;

            try {
                $this->metaGraphService->subscribeAppToWabaWithCallback(
                    $wabaId,
                    $accessToken,
                    route('webhooks.whatsapp.central.receive'),
                    WebhookController::centralVerifyToken()
                );
                $subscribedApps = $this->metaGraphService->listSubscribedApps($wabaId, $accessToken);
                $webhookSubscribed = count($subscribedApps) > 0;
            } catch (\Throwable $e) {
                Log::channel('whatsapp')->warning('Subscribe app to WABA failed (continuing)', [
                    'waba_id' => $wabaId,
                    'error' => $e->getMessage()]);
            }

            // Register phone number if PIN provided
            if (! empty($validated['pin'])) {
                $this->metaGraphService->registerPhoneNumber($phoneNumberId, $validated['pin'], $accessToken);
            }

            $connectionName = ($validated['name'] ?? null) ?: ($businessPhone ? "WhatsApp {$businessPhone}" : 'WhatsApp Connection');

            $existing = WhatsAppConnection::where('account_id', $account->id)
                ->where('phone_number_id', $phoneNumberId)
                ->first();

            $this->connectionService->ensurePhoneAvailable($account, $phoneNumberId, $businessPhone, $existing);

            if ($existing) {
                $this->connectionService->update($existing, [
                    'name' => $connectionName,
                    'waba_id' => $wabaId,
                    'business_phone' => $businessPhone,
                    'meta_business_id' => $businessId,
                    'meta_waba_name' => $wabaDetails['name'] ?? $existing->meta_waba_name,
                    'meta_account_review_status' => $wabaDetails['account_review_status'] ?? $existing->meta_account_review_status,
                    'meta_business_verification_status' => $wabaDetails['business_verification_status'] ?? $existing->meta_business_verification_status,
                    'meta_timezone_id' => isset($wabaDetails['timezone_id']) ? (string) $wabaDetails['timezone_id'] : $existing->meta_timezone_id,
                    'meta_template_namespace' => $wabaDetails['message_template_namespace'] ?? $existing->meta_template_namespace,
                    'meta_subscribed_apps' => $subscribedApps ?: $existing->meta_subscribed_apps,
                    'meta_verified_name' => $phoneDetails['verified_name'] ?? $existing->meta_verified_name,
                    'phone_number_status' => $phoneDetails['status'] ?? $existing->phone_number_status,
                    'quality_rating' => $phoneDetails['quality_rating'] ?? $existing->quality_rating,
                    'code_verification_status' => $phoneDetails['code_verification_status'] ?? $existing->code_verification_status,
                    'webhook_subscribed' => $webhookSubscribed ?: $existing->webhook_subscribed,
                    'access_token' => $accessToken,
                    'setup_method' => 'embedded',
                    'connection_mode' => $connectionMode,
                    'coexistence_status' => $this->coexistenceStatus($connectionMode, $phoneDetails),
                    'coexistence_metadata' => $connectionMode === 'coexistence' ? $this->coexistenceMetadata($sessionInfo, $phoneDetails) : $existing->coexistence_metadata,
                    'coexistence_last_checked_at' => $connectionMode === 'coexistence' ? now() : $existing->coexistence_last_checked_at,
                    'coexistence_last_error' => null,
                    'api_version' => $this->metaGraphService->getApiVersion()]);

                return redirect()->route('app.whatsapp.connections.index')->with('success', 'WABA account updated successfully.');
            }

            $this->connectionService->create($account, [
                'name' => $connectionName,
                'waba_id' => $wabaId,
                'meta_business_id' => $businessId,
                'meta_waba_name' => $wabaDetails['name'] ?? null,
                'meta_account_review_status' => $wabaDetails['account_review_status'] ?? null,
                'meta_business_verification_status' => $wabaDetails['business_verification_status'] ?? null,
                'meta_timezone_id' => isset($wabaDetails['timezone_id']) ? (string) $wabaDetails['timezone_id'] : null,
                'meta_template_namespace' => $wabaDetails['message_template_namespace'] ?? null,
                'meta_subscribed_apps' => $subscribedApps,
                'phone_number_id' => $phoneNumberId,
                'business_phone' => $businessPhone,
                'meta_verified_name' => $phoneDetails['verified_name'] ?? null,
                'phone_number_status' => $phoneDetails['status'] ?? null,
                'quality_rating' => $phoneDetails['quality_rating'] ?? null,
                'code_verification_status' => $phoneDetails['code_verification_status'] ?? null,
                'webhook_subscribed' => $webhookSubscribed,
                'access_token' => $accessToken,
                'setup_method' => 'embedded',
                'connection_mode' => $connectionMode,
                'coexistence_status' => $this->coexistenceStatus($connectionMode, $phoneDetails),
                'coexistence_metadata' => $connectionMode === 'coexistence' ? $this->coexistenceMetadata($sessionInfo, $phoneDetails) : null,
                'coexistence_last_checked_at' => $connectionMode === 'coexistence' ? now() : null,
                'coexistence_last_error' => null,
                'api_version' => $this->metaGraphService->getApiVersion()]);

            return redirect()->route('app.whatsapp.connections.index')->with('success', 'WABA account connected successfully.');
        } catch (\Throwable $e) {
            Log::channel('whatsapp')->error('Embedded signup failed', [
                'account_id' => $account?->id,
                'error' => $e->getMessage()]);

            return redirect()->back()->withErrors([
                'embedded' => $e->getMessage()]);
        }
    }

    private function getEmbeddedSignupConfig(): array
    {
        $appId = PlatformSetting::get('whatsapp.meta_app_id', config('whatsapp.meta.app_id'));
        $configId = PlatformSetting::get('whatsapp.embedded_signup_config_id', config('whatsapp.meta.embedded_signup_config_id'));
        $coexistenceConfigId = PlatformSetting::get('whatsapp.coexistence_signup_config_id', config('whatsapp.meta.coexistence_signup_config_id')) ?: $configId;
        $apiVersion = PlatformSetting::get('whatsapp.api_version', config('whatsapp.meta.api_version', 'v25.0'));
        $enabledSetting = PlatformSetting::get('whatsapp.embedded_enabled', null);
        $enabled = $enabledSetting !== null ? (bool) $enabledSetting : (bool) ($appId && ($configId || $coexistenceConfigId));

        return [
            'enabled' => $enabled,
            'appId' => $enabled ? $appId : null,
            'configId' => $enabled ? $configId : null,
            'coexistenceEnabled' => $enabled && (bool) $coexistenceConfigId,
            'coexistenceConfigId' => $enabled ? $coexistenceConfigId : null,
            'apiVersion' => $apiVersion ?: 'v25.0'];
    }

    protected function connectionModeFromSetupMethod(?string $setupMethod): string
    {
        return $setupMethod === 'manual' ? 'cloud_api' : 'cloud_api';
    }

    protected function coexistenceStatus(string $connectionMode, array $phoneDetails): ?string
    {
        if ($connectionMode !== 'coexistence') {
            return null;
        }

        $status = strtolower((string) ($phoneDetails['status'] ?? ''));
        if ($status === '' || in_array($status, ['connected', 'active'], true)) {
            return 'connected';
        }

        return 'needs_attention';
    }

    protected function coexistenceMetadata(array $sessionInfo, array $phoneDetails): array
    {
        return [
            'source' => 'embedded_signup',
            'session_event' => $sessionInfo['event'] ?? null,
            'phone_platform_type' => $phoneDetails['platform_type'] ?? null,
            'phone_name_status' => $phoneDetails['name_status'] ?? null,
            'phone_messaging_limit_tier' => $phoneDetails['messaging_limit_tier'] ?? null,
            'phone_throughput' => $phoneDetails['throughput'] ?? null,
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

        if (! $resolved) {
            abort(404, 'Connection not found in this account.');
        }

        return $resolved;
    }

    protected function accountHasWabaAccount($account): bool
    {
        return $account && WhatsAppConnection::where('account_id', $account->id)
            ->where('is_active', true)
            ->exists();
    }

    protected function extractWabaIdFromDebugToken(array $debugData): ?string
    {
        $granularScopes = $debugData['granular_scopes'] ?? [];
        foreach ($granularScopes as $scope) {
            if (($scope['scope'] ?? '') === 'whatsapp_business_management') {
                $targetIds = $scope['target_ids'] ?? [];
                if (! empty($targetIds)) {
                    return (string) $targetIds[0];
                }
            }
        }

        return null;
    }

    protected function parseEmbeddedSessionInfo(mixed $sessionInfo): array
    {
        if (is_array($sessionInfo)) {
            return $sessionInfo;
        }

        if (! is_string($sessionInfo) || trim($sessionInfo) === '') {
            return [];
        }

        $decoded = json_decode($sessionInfo, true);

        return is_array($decoded) ? $decoded : [];
    }

    protected function fetchWabaDetailsSafely(?string $wabaId, ?string $accessToken): array
    {
        if (! $wabaId || ! $accessToken) {
            return [];
        }

        try {
            return $this->metaGraphService->getWabaDetails($wabaId, $accessToken);
        } catch (\Throwable $e) {
            Log::channel('whatsapp')->warning('WABA details lookup failed', [
                'waba_id' => $wabaId,
                'error' => $e->getMessage()]);

            return [];
        }
    }

    protected function syncBusinessProfileFromMeta(WhatsAppConnection $connection): void
    {
        if ($connection->connection_mode === 'baileys_qr') {
            return;
        }

        if (! $connection->phone_number_id || ! $connection->access_token) {
            return;
        }

        try {
            $profile = $this->metaGraphService->getBusinessProfile($connection->phone_number_id, $connection->access_token);
            $phoneDetails = $this->metaGraphService->getPhoneNumberDetails($connection->phone_number_id, $connection->access_token);
            $wabaDetails = $this->fetchWabaDetailsSafely($connection->waba_id, $connection->access_token);
            $subscribedApps = [];
            if ($connection->waba_id) {
                try {
                    $subscribedApps = $this->metaGraphService->listSubscribedApps($connection->waba_id, $connection->access_token);
                } catch (\Throwable $e) {
                    Log::channel('whatsapp')->warning('Subscribed apps lookup failed', [
                        'waba_id' => $connection->waba_id,
                        'error' => $e->getMessage()]);
                }
            }

            $connection->forceFill([
                'business_phone' => $phoneDetails['display_phone_number'] ?? $connection->business_phone,
                'meta_waba_name' => $wabaDetails['name'] ?? $connection->meta_waba_name,
                'meta_account_review_status' => $wabaDetails['account_review_status'] ?? $connection->meta_account_review_status,
                'meta_business_verification_status' => $wabaDetails['business_verification_status'] ?? $connection->meta_business_verification_status,
                'meta_timezone_id' => isset($wabaDetails['timezone_id']) ? (string) $wabaDetails['timezone_id'] : $connection->meta_timezone_id,
                'meta_template_namespace' => $wabaDetails['message_template_namespace'] ?? $connection->meta_template_namespace,
                'meta_subscribed_apps' => $subscribedApps ?: $connection->meta_subscribed_apps,
                'meta_verified_name' => $phoneDetails['verified_name'] ?? $connection->meta_verified_name,
                'phone_number_status' => $phoneDetails['status'] ?? $connection->phone_number_status,
                'quality_rating' => $phoneDetails['quality_rating'] ?? $connection->quality_rating,
                'code_verification_status' => $phoneDetails['code_verification_status'] ?? $connection->code_verification_status,
                'webhook_subscribed' => $subscribedApps ? true : $connection->webhook_subscribed,
                'coexistence_status' => ($connection->connection_mode ?? null) === 'coexistence' ? $this->coexistenceStatus('coexistence', $phoneDetails) : $connection->coexistence_status,
                'coexistence_metadata' => ($connection->connection_mode ?? null) === 'coexistence' ? array_merge($connection->coexistence_metadata ?? [], $this->coexistenceMetadata([], $phoneDetails)) : $connection->coexistence_metadata,
                'coexistence_last_checked_at' => ($connection->connection_mode ?? null) === 'coexistence' ? now() : $connection->coexistence_last_checked_at,
                'coexistence_last_error' => null,
                'business_about' => $profile['about'] ?? $connection->business_about,
                'business_address' => $profile['address'] ?? $connection->business_address,
                'business_description' => $profile['description'] ?? $connection->business_description,
                'business_email' => $profile['email'] ?? $connection->business_email,
                'business_websites' => $profile['websites'] ?? $connection->business_websites,
                'business_vertical' => $profile['vertical'] ?? $connection->business_vertical,
                'profile_picture_url' => $profile['profile_picture_url'] ?? $connection->profile_picture_url,
                'profile_synced_at' => now(),
                'profile_sync_error' => null,
            ])->save();
        } catch (\Throwable $e) {
            $connection->forceFill([
                'profile_sync_error' => $e->getMessage(),
                'coexistence_last_error' => ($connection->connection_mode ?? null) === 'coexistence' ? $e->getMessage() : $connection->coexistence_last_error,
            ])->save();
        }
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
            'business_category' => 'nullable|string|max:255',
            'business_about' => 'nullable|string|min:1|max:139',
            'business_address' => 'nullable|string|max:256',
            'business_description' => 'nullable|string|max:512',
            'business_email' => 'nullable|email|max:128',
            'business_websites' => 'nullable|array|max:2',
            'business_websites.*' => 'nullable|url|max:256',
            'business_vertical' => 'nullable|string|max:80',
            'profile_picture_handle' => 'nullable|string|max:2048',
            'profile_picture_file' => 'nullable|image|mimes:jpg,jpeg,png|max:5120',
            'access_token' => 'nullable|string', // Optional on update
            'api_version' => 'nullable|string|max:10',
            'throughput_cap_per_minute' => 'nullable|integer|min:1|max:1000',
            'quiet_hours_start' => ['nullable', 'regex:/^\d{2}:\d{2}$/'],
            'quiet_hours_end' => ['nullable', 'regex:/^\d{2}:\d{2}$/'],
            'quiet_hours_timezone' => 'nullable|timezone']);

        $profilePictureFile = $request->file('profile_picture_file');
        unset($validated['profile_picture_file']);

        $businessWebsites = collect($validated['business_websites'] ?? [])
            ->filter(fn ($url) => is_string($url) && trim($url) !== '')
            ->values()
            ->all();
        $validated['business_websites'] = $businessWebsites;

        try {
            $profilePictureHandle = $validated['profile_picture_handle'] ?? null;
            if ($profilePictureFile) {
                $profilePictureHandle = $this->metaGraphService->uploadProfilePicture($profilePictureFile, $connection->access_token);
                $validated['profile_picture_handle'] = $profilePictureHandle;
            }

            if ($connection->access_token) {
                $this->metaGraphService->updateBusinessProfile($connection->phone_number_id, $connection->access_token, [
                    'about' => $validated['business_about'] ?? null,
                    'address' => $validated['business_address'] ?? null,
                    'description' => $validated['business_description'] ?? null,
                    'email' => $validated['business_email'] ?? null,
                    'websites' => $businessWebsites,
                    'vertical' => $validated['business_vertical'] ?? null,
                    'profile_picture_handle' => $profilePictureHandle,
                ]);

                $validated['profile_synced_at'] = now();
                $validated['profile_sync_error'] = null;
            }
        } catch (\Throwable $e) {
            $validated['profile_sync_error'] = $e->getMessage();
            $this->connectionService->update($connection, $validated);

            return redirect()->route('app.whatsapp.connections.index')
                ->with('error', 'Business profile saved locally, but Meta sync failed: '.$e->getMessage());
        }

        $this->connectionService->update($connection, $validated);

        return redirect()->route('app.whatsapp.connections.index')->with('success', 'Connection updated successfully.');
    }

    public function syncMeta(Request $request, $connection)
    {
        $account = $request->attributes->get('account') ?? current_account();
        $connection = $this->resolveConnection($connection, $account);

        Gate::authorize('update', $connection);

        $this->syncBusinessProfileFromMeta($connection);

        return redirect()->route('app.whatsapp.connections.index')->with('success', 'Meta connection details synced.');
    }

    public function destroy(Request $request, $connection)
    {
        $account = $request->attributes->get('account') ?? current_account();
        $connection = $this->resolveConnection($connection, $account);

        Gate::authorize('delete', $connection);

        $unsubscribeError = null;
        if ($connection->waba_id && $connection->access_token && $connection->webhook_subscribed) {
            try {
                $this->metaGraphService->unsubscribeAppFromWaba($connection->waba_id, $connection->access_token);
            } catch (\Throwable $e) {
                $unsubscribeError = $e->getMessage();
                Log::channel('whatsapp')->warning('WABA webhook unsubscribe failed during disconnect', [
                    'account_id' => $account?->id,
                    'connection_id' => $connection->id,
                    'waba_id' => $connection->waba_id,
                    'error' => $unsubscribeError,
                ]);
            }
        }

        $connectionName = $connection->name;
        $connection->delete();

        if ($unsubscribeError) {
            return redirect()->route('app.whatsapp.connections.index')
                ->with('warning', "WABA account {$connectionName} was disconnected locally, but Meta webhook unsubscribe failed: {$unsubscribeError}");
        }

        return redirect()->route('app.whatsapp.connections.index')->with('success', "WABA account {$connectionName} disconnected.");
    }

    public function subscribeWebhook(Request $request, $connection)
    {
        $account = $request->attributes->get('account') ?? current_account();
        $connection = $this->resolveConnection($connection, $account);

        Gate::authorize('update', $connection);

        if (! $connection->waba_id || ! $connection->access_token) {
            return redirect()->route('app.whatsapp.connections.index')
                ->with('error', 'WABA ID and access token are required before webhook subscription.');
        }

        try {
            $this->metaGraphService->subscribeAppToWabaWithCallback(
                $connection->waba_id,
                $connection->access_token,
                route('webhooks.whatsapp.central.receive'),
                WebhookController::centralVerifyToken()
            );

            $subscribedApps = $this->metaGraphService->listSubscribedApps($connection->waba_id, $connection->access_token);

            $connection->forceFill([
                'webhook_subscribed' => count($subscribedApps) > 0,
                'meta_subscribed_apps' => $subscribedApps,
                'webhook_last_error' => null,
            ])->save();

            return redirect()->route('app.whatsapp.connections.index')->with('success', 'Webhook subscribed through Meta.');
        } catch (\Throwable $e) {
            $connection->forceFill([
                'webhook_last_error' => $e->getMessage(),
            ])->save();

            return redirect()->route('app.whatsapp.connections.index')->with('error', 'Webhook subscription failed: '.$e->getMessage());
        }
    }

    public function unsubscribeWebhook(Request $request, $connection)
    {
        $account = $request->attributes->get('account') ?? current_account();
        $connection = $this->resolveConnection($connection, $account);

        Gate::authorize('update', $connection);

        if (! $connection->waba_id || ! $connection->access_token) {
            return redirect()->route('app.whatsapp.connections.index')
                ->with('error', 'WABA ID and access token are required before webhook unsubscribe.');
        }

        try {
            $this->metaGraphService->unsubscribeAppFromWaba($connection->waba_id, $connection->access_token);

            $connection->forceFill([
                'webhook_subscribed' => false,
                'meta_subscribed_apps' => [],
            ])->save();

            return redirect()->route('app.whatsapp.connections.index')->with('success', 'Webhook unsubscribed through Meta.');
        } catch (\Throwable $e) {
            $connection->forceFill([
                'webhook_last_error' => $e->getMessage(),
            ])->save();

            return redirect()->route('app.whatsapp.connections.index')->with('error', 'Webhook unsubscribe failed: '.$e->getMessage());
        }
    }

    public function rotateVerifyToken(Request $request, $connection)
    {
        $account = $request->attributes->get('account') ?? current_account();
        $connection = $this->resolveConnection($connection, $account);

        Gate::authorize('update', $connection);

        $this->connectionService->rotateVerifyToken($connection);

        return redirect()->route('app.whatsapp.connections.index')->with('success', 'Webhook verify token rotated.');
    }
}
