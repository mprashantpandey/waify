<?php

namespace App\Http\Controllers;

use App\Jobs\SyncAccountIntegration;
use App\Models\AccountIntegration;
use App\Models\AccountIntegrationSyncLog;
use App\Models\AccountRole;
use App\Models\AccountUser;
use App\Models\AccountWebhookEndpoint;
use App\Models\PlatformSetting;
use App\Models\User;
use App\Modules\WhatsApp\Models\WhatsAppConnection;
use App\Services\AI\AiProviderFactory;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Bus;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;
use Laravel\Socialite\Facades\Socialite;

class IntegrationController extends Controller
{
    public function index(Request $request): Response
    {
        $account = $request->attributes->get('account') ?? current_account();
        $canManageCredentials = $this->canManageCredentials($request->user(), $account);
        $stored = AccountIntegration::where('account_id', $account->id)->get()->keyBy('provider');
        $waba = WhatsAppConnection::where('account_id', $account->id)
            ->orderByDesc('is_active')
            ->first();

        return Inertia::render('Integrations/Index', [
            'integrations' => collect($this->catalog())->map(function (array $provider) use ($stored, $waba, $account, $canManageCredentials) {
                $record = $stored->get($provider['id']);
                $connected = $record?->status === 'connected';

                if ($provider['id'] === 'meta' && $waba) {
                    $connected = true;
                }
                if ($provider['id'] === 'developer-webhooks') {
                    $connected = AccountWebhookEndpoint::where('account_id', $account->id)->where('is_enabled', true)->exists();
                }
                if (($provider['always_available'] ?? false) === true) {
                    $connected = true;
                }

                return [
                    ...$provider,
                    'connected' => $connected,
                    'status' => $connected ? 'connected' : ($record?->status ?? 'disconnected'),
                    'lastSync' => $record?->last_sync_at?->diffForHumans() ?? ($provider['id'] === 'meta' && $waba ? 'Real-time' : null),
                    'lastSyncAt' => $record?->last_sync_at?->toIso8601String(),
                    'events24h' => $record?->events_24h ?? 0,
                    'health' => $this->formatHealthStatus($record?->health, $connected),
                    'healthDetails' => $this->healthDetails($provider['id'], $record, $connected),
                    'lastError' => $record?->last_error,
                    'config' => $this->publicConfig($record?->config ?? [], $provider['fields'] ?? []),
                    'systemManaged' => (bool) ($provider['system_managed'] ?? false),
                    'oauth' => $provider['oauth'] ?? null,
                    'webhookUrl' => $record ? $this->providerWebhookUrl($provider['id'], $record->id) : null,
                    'recentLogs' => $record ? $this->syncLogs($record->id, 5) : [],
                    'canManageCredentials' => $canManageCredentials,
                ];
            })->values(),
            'sync_logs' => AccountIntegrationSyncLog::query()
                ->where('account_id', $account->id)
                ->latest()
                ->limit(20)
                ->get()
                ->map(fn (AccountIntegrationSyncLog $log) => $this->formatSyncLog($log))
                ->values(),
            'summary' => [
                'connected' => collect($this->catalog())->filter(function (array $provider) use ($stored, $waba, $account) {
                    if ($provider['id'] === 'meta') {
                        return (bool) $waba;
                    }
                    if ($provider['id'] === 'developer-webhooks') {
                        return AccountWebhookEndpoint::where('account_id', $account->id)->where('is_enabled', true)->exists();
                    }

                    return $stored->get($provider['id'])?->status === 'connected';
                })->count(),
                'events_today' => $stored->where('status', 'connected')->sum('events_24h'),
                'healthy' => $stored
                    ->where('status', 'connected')
                    ->filter(fn (AccountIntegration $integration) => in_array($this->formatHealthStatus($integration->health, true), ['healthy', 'configured'], true))
                    ->count() + ($waba ? 1 : 0),
                'webhook_url' => route('webhooks.whatsapp.central.receive'),
                'api_base_url' => rtrim((string) config('app.url'), '/').'/api/v1/whatsapp',
            ],
            'waba' => $waba ? [
                'name' => $waba->name,
                'phone' => $waba->business_phone,
                'waba_id' => $waba->waba_id,
                'phone_number_id' => $waba->phone_number_id,
                'setup_method' => $waba->setup_method,
                'webhook_subscribed' => (bool) $waba->webhook_subscribed,
            ] : null,
        ]);
    }

    public function connect(Request $request, string $provider): RedirectResponse
    {
        $providerConfig = $this->findProvider($provider);
        $account = $request->attributes->get('account') ?? current_account();
        $this->authorizeCredentialManagement($request->user(), $account);

        if (($providerConfig['stage'] ?? 'live') === 'roadmap') {
            return back()->with('info', $providerConfig['name'].' is on the Zyptos roadmap. It is visible here so customers know what is planned, but it is not connectable yet.');
        }

        if (($providerConfig['oauth'] ?? null) === 'google') {
            return redirect()->route('app.integrations.oauth', $provider);
        }

        if (($providerConfig['system_managed'] ?? false) === true) {
            return redirect()->route($providerConfig['route'])
                ->with('info', $providerConfig['name'].' is managed from its dedicated Zyptos page.');
        }

        return back()->with('info', 'Add the required configuration before connecting '.$providerConfig['name'].'.');
    }

	    public function redirectOAuth(Request $request, string $provider): RedirectResponse
	    {
	        $providerConfig = $this->findProvider($provider);
	        abort_unless(in_array(($providerConfig['oauth'] ?? null), ['google', 'facebook'], true), 404);
	        $account = $request->attributes->get('account') ?? current_account();
	        $this->authorizeCredentialManagement($request->user(), $account);
	
	        if (($providerConfig['oauth'] ?? null) === 'facebook') {
	            $this->applyFacebookOAuthConfig($provider);
	            if (! filled(config('services.facebook.client_id')) || ! filled(config('services.facebook.client_secret'))) {
	                return redirect()->route('app.integrations.index')
	                    ->with('error', 'Facebook Login is not configured. Add Meta App ID and App Secret in platform settings.');
	            }

	            $request->session()->put('integration_oauth_provider', $provider);

	            return Socialite::driver('facebook')
	                ->redirectUrl(route('app.integrations.oauth.callback', $provider))
	                ->scopes($providerConfig['oauth_scopes'] ?? [])
	                ->with(['auth_type' => 'rerequest'])
	                ->redirect();
	        }

	        if (! filled(config('services.google.client_id')) || ! filled(config('services.google.client_secret'))) {
	            return redirect()->route('app.integrations.index')
	                ->with('error', 'Google OAuth client is not configured in platform settings.');
	        }

        $request->session()->put('integration_oauth_provider', $provider);

        return Socialite::driver('google')
            ->redirectUrl(route('app.integrations.oauth.callback', $provider))
            ->scopes($providerConfig['oauth_scopes'] ?? ['openid', 'profile', 'email'])
            ->with([
                'access_type' => 'offline',
                'prompt' => 'consent',
                'include_granted_scopes' => 'true',
            ])
            ->redirect();
    }

	    public function oauthCallback(Request $request, string $provider): RedirectResponse
	    {
	        $providerConfig = $this->findProvider($provider);
	        abort_unless(in_array(($providerConfig['oauth'] ?? null), ['google', 'facebook'], true), 404);

        if ($request->session()->pull('integration_oauth_provider') !== $provider) {
            return redirect()->route('app.integrations.index')
                ->with('error', 'OAuth state expired. Please try connecting again.');
        }

	        $account = $request->attributes->get('account') ?? current_account();
	        $this->authorizeCredentialManagement($request->user(), $account);

	        if (($providerConfig['oauth'] ?? null) === 'facebook') {
	            return $this->facebookOAuthCallback($request, $provider, $providerConfig, $account);
	        }
	
	        try {
	            $googleUser = Socialite::driver('google')
	                ->redirectUrl(route('app.integrations.oauth.callback', $provider))
	                ->user();
	        } catch (\Throwable $e) {
	            Log::warning('Google integration OAuth callback failed', [
	                'provider' => $provider,
	                'message' => $e->getMessage(),
	                'exception' => get_class($e),
	                'redirect_uri' => route('app.integrations.oauth.callback', $provider),
	                'has_code' => $request->filled('code'),
	                'has_state' => $request->filled('state'),
	                'error' => $request->query('error'),
	                'error_description' => $request->query('error_description'),
	            ]);

	            return redirect()->route('app.integrations.index')
	                ->with('error', $providerConfig['name'].' connection failed. Check that this redirect URI is authorized in Google Cloud: '.route('app.integrations.oauth.callback', $provider));
	        }

        $existing = AccountIntegration::firstOrNew(['account_id' => $account->id, 'provider' => $provider]);
        $existing->fill([
            'status' => filled($googleUser->token) ? 'connected' : 'configured',
            'config' => array_filter([
                ...($existing->config ?? []),
                'access_token' => $googleUser->token,
                'refresh_token' => $googleUser->refreshToken ?: ($existing->config['refresh_token'] ?? null),
                'expires_at' => $googleUser->expiresIn ? now()->addSeconds((int) $googleUser->expiresIn)->toIso8601String() : null,
                'google_id' => $googleUser->getId(),
                'account_email' => $googleUser->getEmail(),
                'account_name' => $googleUser->getName(),
                'connected_by' => $request->user()?->id,
            ], fn ($value) => $value !== null && $value !== ''),
            'features' => $providerConfig['features'] ?? [],
            'health' => 'configured',
            'last_error' => null,
        ])->save();

        return redirect()->route('app.integrations.index')
            ->with('success', $providerConfig['name'].' connected. Add the sheet/calendar ID if needed, then run Sync now.');
    }

    public function update(Request $request, string $provider): RedirectResponse
    {
        $providerConfig = $this->findProvider($provider);
        $account = $request->attributes->get('account') ?? current_account();
        $this->authorizeCredentialManagement($request->user(), $account);

        if (($providerConfig['stage'] ?? 'live') === 'roadmap') {
            return back()->with('info', $providerConfig['name'].' is planned and cannot be configured yet.');
        }

        if (($providerConfig['system_managed'] ?? false) === true) {
            return redirect()->route($providerConfig['route'])
                ->with('info', $providerConfig['name'].' is managed from its dedicated Zyptos page.');
        }

        $rules = $this->rulesFor($providerConfig);

        $validated = $request->validate($rules);
        foreach ($this->secretFieldNames($providerConfig['fields'] ?? []) as $secretField) {
            if (($validated[$secretField] ?? null) === '••••••••') {
                unset($validated[$secretField]);
            } elseif (array_key_exists($secretField, $validated) && $this->shouldEncryptWorkspaceSecret($provider, $secretField)) {
                $validated[$secretField] = AccountIntegration::encryptedSecret($validated[$secretField]);
            }
        }
        $existing = AccountIntegration::firstOrNew(['account_id' => $account->id, 'provider' => $provider]);
        $config = array_filter([
            ...($existing->config ?? []),
            ...$validated,
        ], fn ($value) => $value !== null && $value !== '');

        $status = (($providerConfig['oauth'] ?? null) === 'google' && blank($config['access_token'] ?? null))
            ? 'configured'
            : 'connected';

        $existing->fill([
            'status' => $status,
            'config' => $config,
            'features' => $providerConfig['features'] ?? [],
            'health' => 'configured',
            'last_error' => null,
        ])->save();

        $this->writeIntegrationLog($existing, $request, 'credentials_updated', 'success', [
            'changed_fields' => array_values(array_keys($validated)),
            'masked_secret_fields' => $this->secretFieldNames($providerConfig['fields'] ?? []),
        ]);

        return back()->with('success', $providerConfig['name'].' settings saved. Use Sync now to validate and import real data.');
    }

    public function sync(Request $request, string $provider): RedirectResponse
    {
        $providerConfig = $this->findProvider($provider);
        $account = $request->attributes->get('account') ?? current_account();
        $this->authorizeCredentialManagement($request->user(), $account);
        $integration = AccountIntegration::where('account_id', $account->id)
            ->where('provider', $provider)
            ->first();

        if (($providerConfig['system_managed'] ?? false) === true) {
            return redirect()->route($providerConfig['route'])
                ->with('info', $providerConfig['name'].' is managed from its dedicated Zyptos page.');
        }

        if (($providerConfig['stage'] ?? 'live') === 'roadmap') {
            return back()->with('info', $providerConfig['name'].' is planned and cannot be synced yet.');
        }

        if (! $integration || $integration->status !== 'connected') {
            return back()->with('error', 'Configure '.$providerConfig['name'].' before syncing.');
        }

        try {
            if (($providerConfig['sync_handler'] ?? null) === 'import') {
                $result = Bus::dispatchSync(new SyncAccountIntegration(
                    $integration->id,
                    'manual',
                    $request->user()?->id,
                    $request->ip()
                ));

                return back()->with('success', $providerConfig['name'].' synced. '.(($result['created'] ?? 0) + ($result['updated'] ?? 0)).' record(s) processed.');
            }

            if (($providerConfig['sync_handler'] ?? null) === 'validate-config') {
                $result = $this->testIntegrationCredentials($providerConfig, $integration);
                $integration->update([
                    'health' => 'healthy',
                    'last_sync_at' => now(),
                    'events_24h' => 0,
                    'last_error' => null,
                ]);
                $this->writeIntegrationLog($integration, $request, 'credential_test', 'success', $result);

                return back()->with('success', $providerConfig['name'].' connection test passed.');
            }

            $this->deliverWebhookTest($providerConfig, $integration);

            $integration->update([
                'health' => 'healthy',
                'last_sync_at' => now(),
                'events_24h' => 0,
                'last_error' => null,
            ]);
            $this->writeIntegrationLog($integration, $request, 'webhook_test', 'success', ['type' => 'outbound_webhook_test']);

            return back()->with('success', $providerConfig['name'].' test event delivered.');
        } catch (\Throwable $e) {
            $integration->update([
                'health' => 'error',
                'last_error' => $e->getMessage(),
            ]);
            if ($integration) {
                $this->writeIntegrationLog($integration, $request, 'credential_test', 'failed', ['error' => $e->getMessage()], $e->getMessage());
            }

            return back()->with('error', $providerConfig['name'].' sync failed: '.$e->getMessage());
        }
    }

	    public function resources(Request $request, string $provider)
	    {
	        $providerConfig = $this->findProvider($provider);
	        abort_unless(in_array(($providerConfig['oauth'] ?? null), ['google', 'facebook'], true), 404);

        $account = $request->attributes->get('account') ?? current_account();
        $this->authorizeCredentialManagement($request->user(), $account);
        $integration = AccountIntegration::where('account_id', $account->id)
            ->where('provider', $provider)
            ->first();

	        if (! $integration || blank($integration->config['access_token'] ?? null)) {
	            return response()->json(['message' => (($providerConfig['oauth'] ?? null) === 'facebook' ? 'Connect Facebook' : 'Connect Google').' before loading resources.'], 422);
	        }
	
	        try {
	            if (($providerConfig['oauth'] ?? null) === 'facebook') {
	                return response()->json([
                        'items' => $provider === 'meta-catalog'
                            ? $this->facebookCatalogResources($integration)
                            : $this->facebookLeadForms($integration),
                    ]);
	            }

	            $token = $this->googleAccessToken($integration);
            $items = $provider === 'google-sheets'
                ? $this->googleSheets($token)
                : $this->googleCalendars($token);

            return response()->json(['items' => $items]);
        } catch (\Throwable $e) {
            return response()->json(['message' => $e->getMessage()], 422);
        }
    }

    public function disconnect(Request $request, string $provider): RedirectResponse
    {
        $providerConfig = $this->findProvider($provider);
        $account = $request->attributes->get('account') ?? current_account();
        $this->authorizeCredentialManagement($request->user(), $account);

        if (($providerConfig['system_managed'] ?? false) === true) {
            return redirect()->route($providerConfig['route'])
                ->with('info', $providerConfig['name'].' is managed from its dedicated Zyptos page.');
        }

        $integration = AccountIntegration::where('account_id', $account->id)
            ->where('provider', $provider)
            ->first();

        $integration?->update([
            'status' => 'disconnected',
            'health' => null,
            'events_24h' => 0,
            'last_error' => null,
        ]);
        if ($integration) {
            $this->writeIntegrationLog($integration, $request, 'credentials_disconnected', 'success', ['provider' => $provider]);
        }

        return back()->with('success', $providerConfig['name'].' disconnected.');
    }

    private function publicConfig(array $config, array $fields): array
    {
        foreach ($this->secretFieldNames($fields) as $field) {
            if (! empty($config[$field])) {
                $config[$field] = '••••••••';
            }
        }

        return $config;
    }

    private function formatHealthStatus(mixed $health, bool $connected): ?string
    {
        if (! $connected) {
            return null;
        }

        if (is_array($health)) {
            $status = trim((string) ($health['status'] ?? ''));

            return $status !== '' ? $status : 'configured';
        }

        $status = trim((string) $health);

        return $status !== '' ? $status : 'healthy';
    }

    private function healthDetails(string $provider, ?AccountIntegration $record, bool $connected): array
    {
        if (! $connected) {
            return [
                ['label' => 'Connection', 'value' => 'Not connected'],
            ];
        }

        $health = is_array($record?->health) ? $record->health : [];
        $config = is_array($record?->config) ? $record->config : [];
        $details = [
            ['label' => 'Connection', 'value' => ucfirst((string) ($record?->status ?? 'connected'))],
            ['label' => 'Last test', 'value' => $health['tested_at'] ?? $record?->last_sync_at?->diffForHumans() ?? 'Not tested yet'],
        ];

        if ($provider === 'razorpay-payments') {
            $keyId = (string) ($config['key_id'] ?? '');
            $details[] = ['label' => 'Mode', 'value' => str_starts_with($keyId, 'rzp_live_') ? 'Live keys' : (str_starts_with($keyId, 'rzp_test_') ? 'Test keys' : 'Unknown')];
            $details[] = ['label' => 'Payment links', 'value' => 'Dynamic links enabled'];
        } elseif ($provider === 'workspace-ai') {
            $details[] = ['label' => 'Provider', 'value' => ucfirst((string) ($config['provider'] ?? 'Not selected'))];
            $details[] = ['label' => 'Fallback', 'value' => str_replace('_', ' ', (string) ($config['fallback_mode'] ?? 'workspace key only'))];
        } elseif (in_array($provider, ['meta-leads', 'meta-catalog'], true)) {
            $details[] = ['label' => 'OAuth', 'value' => filled($config['access_token'] ?? null) ? 'Connected' : 'Needs Facebook login'];
            $details[] = ['label' => $provider === 'meta-catalog' ? 'Catalog' : 'Lead form', 'value' => (string) ($config[$provider === 'meta-catalog' ? 'catalog_id' : 'form_id'] ?? 'Not selected')];
        } elseif (str_starts_with($provider, 'google-')) {
            $details[] = ['label' => 'OAuth', 'value' => filled($config['access_token'] ?? null) ? 'Connected' : 'Needs Google login'];
        }

        if ($record?->last_error) {
            $details[] = ['label' => 'Last error', 'value' => $record->last_error];
        }

        return $details;
    }

    private function authorizeCredentialManagement(?User $user, $account): void
    {
        abort_unless($this->canManageCredentials($user, $account), 403, 'Only workspace owners and admins can manage integration credentials.');
    }

    private function canManageCredentials(?User $user, $account): bool
    {
        if (! $user || ! $account) {
            return false;
        }

        if ($user->isSuperAdmin()) {
            return true;
        }

        if ((int) $account->owner_id === (int) $user->id) {
            return true;
        }

        $accountUser = AccountUser::where('account_id', $account->id)
            ->where('user_id', $user->id)
            ->first();

        if (! $accountUser) {
            return false;
        }

        if (in_array($accountUser->role, ['owner', 'admin'], true)) {
            return true;
        }

        $role = AccountRole::where('account_id', $account->id)
            ->where('key', $accountUser->role)
            ->first();

        return $role ? in_array('settings', $role->permissions ?? [], true) : false;
    }

    private function secretFieldNames(array $fields): array
    {
        $secretFields = collect($fields)
            ->filter(fn ($field) => ($field['secret'] ?? false) === true)
            ->pluck('name')
            ->all();

        return array_values(array_unique([
            ...$secretFields,
            'access_token',
            'refresh_token',
            'consumer_secret',
            'client_secret',
            'webhook_secret',
            'webhook_verify_token',
            'app_secret',
            'password',
        ]));
    }

    private function shouldEncryptWorkspaceSecret(string $provider, string $field): bool
    {
        return in_array($provider, ['razorpay-payments', 'workspace-ai'], true)
            && in_array($field, $this->encryptedWorkspaceSecretFields(), true);
    }

    private function encryptedWorkspaceSecretFields(): array
    {
        return [
            'key_secret',
            'webhook_secret',
            'openai_api_key',
            'anthropic_api_key',
            'gemini_api_key',
        ];
    }

    private function syncLogs(int $integrationId, int $limit): array
    {
        return AccountIntegrationSyncLog::where('account_integration_id', $integrationId)
            ->latest()
            ->limit($limit)
            ->get()
            ->map(fn (AccountIntegrationSyncLog $log) => $this->formatSyncLog($log))
            ->values()
            ->all();
    }

    private function writeIntegrationLog(
        AccountIntegration $integration,
        Request $request,
        string $trigger,
        string $status,
        array $summary = [],
        ?string $error = null
    ): void {
        AccountIntegrationSyncLog::create([
            'account_id' => $integration->account_id,
            'account_integration_id' => $integration->id,
            'initiated_by' => $request->user()?->id,
            'provider' => $integration->provider,
            'status' => $status,
            'trigger' => $trigger,
            'started_at' => now(),
            'finished_at' => now(),
            'duration_ms' => 0,
            'created_count' => (int) ($summary['created'] ?? 0),
            'updated_count' => (int) ($summary['updated'] ?? 0),
            'skipped_count' => (int) ($summary['skipped'] ?? 0),
            'error_count' => $status === 'failed' ? 1 : 0,
            'summary' => $summary,
            'error_message' => $error,
            'source_ip' => $request->ip(),
        ]);
    }

    private function formatSyncLog(AccountIntegrationSyncLog $log): array
    {
        return [
            'id' => $log->id,
            'provider' => $log->provider,
            'status' => $log->status,
            'trigger' => $log->trigger,
            'started_at' => $log->started_at?->toIso8601String(),
            'finished_at' => $log->finished_at?->toIso8601String(),
            'duration_ms' => $log->duration_ms,
            'created_count' => $log->created_count,
            'updated_count' => $log->updated_count,
            'skipped_count' => $log->skipped_count,
            'error_count' => $log->error_count,
            'summary' => $log->summary,
            'error_message' => $log->error_message,
        ];
    }

	    private function providerWebhookUrl(string $provider, int $integrationId): ?string
	    {
	        return in_array($provider, ['shopify', 'woocommerce', 'razorpay-payments'], true)
	            ? route('webhooks.integrations.receive', [$provider, $integrationId])
	            : null;
	    }

	    private function facebookOAuthCallback(Request $request, string $provider, array $providerConfig, $account): RedirectResponse
	    {
	        $this->applyFacebookOAuthConfig($provider);

	        try {
	            $facebookUser = Socialite::driver('facebook')
	                ->redirectUrl(route('app.integrations.oauth.callback', $provider))
	                ->user();
	        } catch (\Throwable $e) {
	            Log::warning('Facebook integration OAuth callback failed', [
	                'provider' => $provider,
	                'message' => $e->getMessage(),
	                'exception' => get_class($e),
	                'redirect_uri' => route('app.integrations.oauth.callback', $provider),
	                'has_code' => $request->filled('code'),
	                'has_state' => $request->filled('state'),
	                'error' => $request->query('error'),
	                'error_description' => $request->query('error_description'),
	            ]);

	            return redirect()->route('app.integrations.index')
	                ->with('error', 'Facebook Login failed. Check that this redirect URI is allowed in Meta: '.route('app.integrations.oauth.callback', $provider));
	        }

	        $accessToken = $this->facebookLongLivedToken((string) $facebookUser->token);
            if ($provider === 'meta-catalog') {
                return $this->facebookCatalogOAuthCallback($request, $provider, $providerConfig, $account, $facebookUser, $accessToken);
            }

	        $pages = $this->facebookPages($accessToken);
	        $firstPage = $pages[0] ?? null;
	        $leadForms = $firstPage ? $this->facebookPageLeadForms((string) $firstPage['id'], (string) $firstPage['access_token']) : [];
	        $firstForm = $leadForms[0] ?? null;

	        $existing = AccountIntegration::firstOrNew(['account_id' => $account->id, 'provider' => $provider]);
	        $existing->fill([
	            'status' => filled($accessToken) ? 'connected' : 'configured',
	            'config' => array_filter([
	                ...($existing->config ?? []),
	                'access_token' => $accessToken,
	                'facebook_user_id' => $facebookUser->getId(),
	                'account_email' => $facebookUser->getEmail(),
	                'account_name' => $facebookUser->getName(),
	                'pages' => $pages,
	                'page_id' => $firstPage['id'] ?? ($existing->config['page_id'] ?? null),
	                'page_name' => $firstPage['name'] ?? ($existing->config['page_name'] ?? null),
	                'page_access_token' => $firstPage['access_token'] ?? ($existing->config['page_access_token'] ?? null),
	                'access_token' => $firstPage['access_token'] ?? $accessToken,
	                'lead_forms' => $leadForms,
	                'form_id' => $firstForm['id'] ?? ($existing->config['form_id'] ?? null),
	                'form_name' => $firstForm['name'] ?? ($existing->config['form_name'] ?? null),
	                'connected_by' => $request->user()?->id,
	                'webhook_mode' => 'provider_app',
	            ], fn ($value) => $value !== null && $value !== ''),
	            'features' => $providerConfig['features'] ?? [],
	            'health' => 'configured',
	            'last_error' => null,
	        ])->save();

	        return redirect()->route('app.integrations.index')
	            ->with('success', 'Facebook connected for Meta Leads. Select the correct page/form if needed, then run Sync now.');
	    }

        private function facebookCatalogOAuthCallback(Request $request, string $provider, array $providerConfig, $account, $facebookUser, string $accessToken): RedirectResponse
        {
            $businesses = $this->facebookBusinesses($accessToken);
            $catalogs = $this->facebookCatalogs($accessToken, $businesses);
            $firstCatalog = $catalogs[0] ?? null;

            $existing = AccountIntegration::firstOrNew(['account_id' => $account->id, 'provider' => $provider]);
            $existing->fill([
                'status' => filled($accessToken) ? 'connected' : 'configured',
                'config' => array_filter([
                    ...($existing->config ?? []),
                    'access_token' => $accessToken,
                    'facebook_user_id' => $facebookUser->getId(),
                    'account_email' => $facebookUser->getEmail(),
                    'account_name' => $facebookUser->getName(),
                    'businesses' => $businesses,
                    'business_id' => $firstCatalog['business_id'] ?? ($existing->config['business_id'] ?? null),
                    'business_name' => $firstCatalog['business_name'] ?? ($existing->config['business_name'] ?? null),
                    'catalogs' => $catalogs,
                    'catalog_id' => $firstCatalog['id'] ?? ($existing->config['catalog_id'] ?? null),
                    'catalog_name' => $firstCatalog['name'] ?? ($existing->config['catalog_name'] ?? null),
                    'connected_by' => $request->user()?->id,
                ], fn ($value) => $value !== null && $value !== ''),
                'features' => $providerConfig['features'] ?? [],
                'health' => 'configured',
                'last_error' => null,
            ])->save();

            return redirect()->route('app.integrations.index')
                ->with('success', 'Facebook connected for Meta Catalog. Select the correct catalog if needed, then run Sync now.');
        }

	    private function applyFacebookOAuthConfig(string $provider): void
	    {
	        config([
	            'services.facebook.client_id' => PlatformSetting::get('whatsapp.meta_app_id', config('services.facebook.client_id')),
	            'services.facebook.client_secret' => PlatformSetting::get('whatsapp.meta_app_secret', config('services.facebook.client_secret')),
	            'services.facebook.redirect' => route('app.integrations.oauth.callback', $provider),
	        ]);
	    }

	    private function facebookLongLivedToken(string $shortLivedToken): string
	    {
	        if ($shortLivedToken === '' || blank(config('services.facebook.client_id')) || blank(config('services.facebook.client_secret'))) {
	            return $shortLivedToken;
	        }

	        try {
	            $response = Http::acceptJson()
	                ->timeout(20)
	                ->get($this->metaGraphUrl('oauth/access_token'), [
	                    'grant_type' => 'fb_exchange_token',
	                    'client_id' => config('services.facebook.client_id'),
	                    'client_secret' => config('services.facebook.client_secret'),
	                    'fb_exchange_token' => $shortLivedToken,
	                ])
	                ->throw()
	                ->json();

	            return (string) ($response['access_token'] ?? $shortLivedToken);
	        } catch (\Throwable $e) {
	            Log::warning('Facebook token exchange failed', ['message' => $e->getMessage()]);

	            return $shortLivedToken;
	        }
	    }

	    private function facebookPages(string $accessToken): array
	    {
	        if ($accessToken === '') {
	            return [];
	        }

	        $pages = Http::withToken($accessToken)
	            ->acceptJson()
	            ->timeout(20)
	            ->get($this->metaGraphUrl('me/accounts'), [
	                'fields' => 'id,name,category,access_token,tasks',
	                'limit' => 100,
	            ])
	            ->throw()
	            ->json('data', []);

	        return collect($pages)->map(fn (array $page) => [
	            'id' => (string) ($page['id'] ?? ''),
	            'name' => (string) ($page['name'] ?? 'Facebook Page'),
	            'category' => $page['category'] ?? null,
	            'access_token' => (string) ($page['access_token'] ?? ''),
	            'tasks' => $page['tasks'] ?? [],
	        ])->filter(fn (array $page) => $page['id'] !== '' && $page['access_token'] !== '')->values()->all();
	    }

	    private function facebookPageLeadForms(string $pageId, string $pageAccessToken): array
	    {
	        if ($pageId === '' || $pageAccessToken === '') {
	            return [];
	        }

	        $forms = Http::withToken($pageAccessToken)
	            ->acceptJson()
	            ->timeout(20)
	            ->get($this->metaGraphUrl($pageId.'/leadgen_forms'), [
	                'fields' => 'id,name,status,leads_count,created_time',
	                'limit' => 100,
	            ])
	            ->throw()
	            ->json('data', []);

	        return collect($forms)->map(fn (array $form) => [
	            'id' => (string) ($form['id'] ?? ''),
	            'name' => (string) ($form['name'] ?? 'Lead form'),
	            'status' => $form['status'] ?? null,
	            'leads_count' => $form['leads_count'] ?? null,
	            'created_time' => $form['created_time'] ?? null,
	        ])->filter(fn (array $form) => $form['id'] !== '')->values()->all();
	    }

	    private function facebookLeadForms(AccountIntegration $integration): array
	    {
	        $pageId = (string) ($integration->config['page_id'] ?? '');
	        $forms = $integration->config['lead_forms'] ?? [];
	        if (is_array($forms) && ! empty($forms)) {
	            return collect($forms)->map(fn (array $form) => [
	                'id' => $form['id'] ?? '',
	                'name' => $form['name'] ?? 'Lead form',
	                'meta' => $form['status'] ?? null,
                    'url' => $pageId !== '' ? 'https://business.facebook.com/latest/instant_forms/forms?asset_id='.$pageId : null,
	            ])->values()->all();
	        }

	        $pageToken = (string) ($integration->config['page_access_token'] ?? $integration->config['access_token'] ?? '');

	        return collect($this->facebookPageLeadForms($pageId, $pageToken))->map(fn (array $form) => [
	            'id' => $form['id'] ?? '',
	            'name' => $form['name'] ?? 'Lead form',
	            'meta' => trim(collect([
                    $form['status'] ?? null,
                    isset($form['leads_count']) ? ((int) $form['leads_count']).' leads' : null,
                    $form['created_time'] ?? null,
                ])->filter()->join(' · ')),
                'url' => $pageId !== '' ? 'https://business.facebook.com/latest/instant_forms/forms?asset_id='.$pageId : null,
	        ])->values()->all();
	    }

        private function facebookBusinesses(string $accessToken): array
        {
            if ($accessToken === '') {
                return [];
            }

            try {
                $businesses = Http::withToken($accessToken)
                    ->acceptJson()
                    ->timeout(20)
                    ->get($this->metaGraphUrl('me/businesses'), [
                        'fields' => 'id,name,verification_status',
                        'limit' => 100,
                    ])
                    ->throw()
                    ->json('data', []);
            } catch (\Throwable $e) {
                Log::warning('Facebook businesses lookup failed', ['message' => $e->getMessage()]);

                return [];
            }

            return collect($businesses)->map(fn (array $business) => [
                'id' => (string) ($business['id'] ?? ''),
                'name' => (string) ($business['name'] ?? 'Meta Business'),
                'verification_status' => $business['verification_status'] ?? null,
            ])->filter(fn (array $business) => $business['id'] !== '')->values()->all();
        }

        private function facebookCatalogs(string $accessToken, array $businesses): array
        {
            if ($accessToken === '') {
                return [];
            }

            $catalogs = collect();
            foreach ($businesses as $business) {
                $businessId = (string) ($business['id'] ?? '');
                if ($businessId === '') {
                    continue;
                }

                try {
                    $items = Http::withToken($accessToken)
                        ->acceptJson()
                        ->timeout(20)
                        ->get($this->metaGraphUrl($businessId.'/owned_product_catalogs'), [
                            'fields' => 'id,name,product_count,vertical',
                            'limit' => 100,
                        ])
                        ->throw()
                        ->json('data', []);
                } catch (\Throwable $e) {
                    Log::warning('Facebook catalog lookup failed', [
                        'business_id' => $businessId,
                        'message' => $e->getMessage(),
                    ]);

                    continue;
                }

                $catalogs = $catalogs->merge(collect($items)->map(fn (array $catalog) => [
                    'id' => (string) ($catalog['id'] ?? ''),
                    'name' => (string) ($catalog['name'] ?? 'Meta Catalog'),
                    'business_id' => $businessId,
                    'business_name' => $business['name'] ?? null,
                    'product_count' => $catalog['product_count'] ?? null,
                    'vertical' => $catalog['vertical'] ?? null,
                ]));
            }

            return $catalogs
                ->filter(fn (array $catalog) => $catalog['id'] !== '')
                ->unique('id')
                ->values()
                ->all();
        }

        private function facebookCatalogResources(AccountIntegration $integration): array
        {
            $catalogs = $integration->config['catalogs'] ?? [];
            if (is_array($catalogs) && ! empty($catalogs)) {
                return collect($catalogs)->map(fn (array $catalog) => [
                    'id' => $catalog['id'] ?? '',
                    'name' => $catalog['name'] ?? 'Meta Catalog',
                    'meta' => trim(collect([
                        $catalog['business_name'] ?? null,
                        isset($catalog['product_count']) ? ((int) $catalog['product_count']).' products' : null,
                        $catalog['vertical'] ?? null,
                    ])->filter()->join(' · ')),
                    'businessId' => $catalog['business_id'] ?? null,
                    'businessName' => $catalog['business_name'] ?? null,
                    'url' => 'https://business.facebook.com/commerce/catalogs/'.$catalog['id'],
                ])->values()->all();
            }

            $accessToken = (string) ($integration->config['access_token'] ?? '');
            $businesses = $this->facebookBusinesses($accessToken);

            return collect($this->facebookCatalogs($accessToken, $businesses))->map(fn (array $catalog) => [
                'id' => $catalog['id'] ?? '',
                'name' => $catalog['name'] ?? 'Meta Catalog',
                'meta' => trim(collect([
                    $catalog['business_name'] ?? null,
                    isset($catalog['product_count']) ? ((int) $catalog['product_count']).' products' : null,
                    $catalog['vertical'] ?? null,
                ])->filter()->join(' · ')),
                'businessId' => $catalog['business_id'] ?? null,
                'businessName' => $catalog['business_name'] ?? null,
                'url' => 'https://business.facebook.com/commerce/catalogs/'.$catalog['id'],
            ])->values()->all();
        }

	    private function googleAccessToken(AccountIntegration $integration): string
	    {
        $token = (string) ($integration->config['access_token'] ?? '');
        $expiresAt = isset($integration->config['expires_at'])
            ? \Illuminate\Support\Carbon::parse($integration->config['expires_at'])
            : null;

        if ($token !== '' && (! $expiresAt || $expiresAt->isFuture())) {
            return $token;
        }

        $refreshToken = (string) ($integration->config['refresh_token'] ?? '');
        if ($refreshToken === '') {
            throw new \RuntimeException('Google refresh token is missing. Reconnect Google.');
        }

        try {
            $response = Http::asForm()
                ->timeout(20)
                ->post('https://oauth2.googleapis.com/token', [
                    'client_id' => config('services.google.client_id'),
                    'client_secret' => config('services.google.client_secret'),
                    'refresh_token' => $refreshToken,
                    'grant_type' => 'refresh_token',
                ])
                ->throw()
                ->json();
        } catch (\Throwable $e) {
            $message = $this->googleTokenErrorMessage($e);
            if (str_contains(strtolower($message), 'invalid_grant')) {
                $integration->update([
                    'status' => 'configured',
                    'health' => 'error',
                    'last_error' => 'Google access was revoked or expired. Reconnect Google from Integrations.',
                ]);
                throw new \RuntimeException('Google access was revoked or expired. Reconnect Google from Integrations.');
            }

            throw $e;
        }

        $newToken = (string) ($response['access_token'] ?? '');
        if ($newToken === '') {
            throw new \RuntimeException('Google did not return a refreshed access token.');
        }

        $integration->update([
            'config' => [
                ...($integration->config ?? []),
                'access_token' => $newToken,
                'expires_at' => now()->addSeconds((int) ($response['expires_in'] ?? 3600))->toIso8601String(),
            ],
        ]);

        return $newToken;
    }

    private function googleSheets(string $token): array
    {
        $files = Http::withToken($token)
            ->acceptJson()
            ->timeout(20)
            ->get('https://www.googleapis.com/drive/v3/files', [
                'q' => "mimeType='application/vnd.google-apps.spreadsheet' and trashed=false",
                'fields' => 'files(id,name,modifiedTime,webViewLink)',
                'orderBy' => 'modifiedTime desc',
                'pageSize' => 50,
            ])
            ->throw()
            ->json('files', []);

        return collect($files)->map(function (array $file) use ($token) {
            $sheetNames = [];
            try {
                $sheetNames = Http::withToken($token)
                    ->acceptJson()
                    ->timeout(10)
                    ->get('https://sheets.googleapis.com/v4/spreadsheets/'.$file['id'], [
                        'fields' => 'sheets(properties(title))',
                    ])
                    ->throw()
                    ->json('sheets', []);
            } catch (\Throwable) {
                $sheetNames = [];
            }

            $tabs = collect($sheetNames)
                ->map(fn (array $sheet) => $sheet['properties']['title'] ?? null)
                ->filter()
                ->values()
                ->all();

            return [
                'id' => $file['id'] ?? '',
                'name' => $file['name'] ?? 'Untitled spreadsheet',
                'meta' => trim(($file['modifiedTime'] ?? '').($tabs ? ' · tabs: '.implode(', ', array_slice($tabs, 0, 3)) : '')),
                'url' => $file['webViewLink'] ?? null,
                'defaultSheet' => $tabs[0] ?? null,
            ];
        })->values()->all();
    }

    private function googleCalendars(string $token): array
    {
        $calendars = Http::withToken($token)
            ->acceptJson()
            ->timeout(20)
            ->get('https://www.googleapis.com/calendar/v3/users/me/calendarList', [
                'maxResults' => 100,
            ])
            ->throw()
            ->json('items', []);

        return collect($calendars)->map(fn (array $calendar) => [
            'id' => $calendar['id'] ?? '',
            'name' => $calendar['summary'] ?? $calendar['id'] ?? 'Calendar',
            'meta' => trim(collect([
                ($calendar['primary'] ?? false) ? 'Primary calendar' : ($calendar['accessRole'] ?? null),
                $calendar['timeZone'] ?? null,
            ])->filter()->join(' · ')),
            'url' => 'https://calendar.google.com/calendar/u/0/r?cid='.rawurlencode((string) ($calendar['id'] ?? '')),
        ])->values()->all();
    }

    private function metaGraphUrl(string $path): string
    {
        $baseUrl = rtrim((string) config('whatsapp.meta.base_url', 'https://graph.facebook.com'), '/');
        $version = trim((string) config('whatsapp.meta.api_version', 'v25.0'), '/');

        return $baseUrl.'/'.$version.'/'.ltrim($path, '/');
    }

    private function googleTokenErrorMessage(\Throwable $e): string
    {
        if ($e instanceof \Illuminate\Http\Client\RequestException && $e->response) {
            return $e->response->body();
        }

        return $e->getMessage();
    }

    private function findProvider(string $provider): array
    {
        $match = collect($this->catalog())->firstWhere('id', $provider);

        abort_unless($match, 404);

        return $match;
    }

    private function rulesFor(array $providerConfig): array
    {
        $rules = [
            'auto_sync' => ['nullable', 'boolean'],
            'webhook_url' => ['nullable', 'url', 'max:500'],
            'notes' => ['nullable', 'string', 'max:1000'],
            'sync_direction' => ['nullable', Rule::in(['import', 'export', 'bidirectional'])],
        ];

        foreach ($providerConfig['fields'] ?? [] as $field) {
            $name = $field['name'] ?? null;
            if (! $name || isset($rules[$name])) {
                continue;
            }

            if (($field['type'] ?? null) === 'boolean') {
                $rules[$name] = [($field['required'] ?? false) ? 'required' : 'nullable', 'boolean'];

                continue;
            }

            $fieldRules = ($field['required'] ?? false) ? ['required'] : ['nullable'];
            $fieldRules[] = 'string';
            $fieldRules[] = ($field['type'] ?? null) === 'textarea' ? 'max:2000' : 'max:500';

            if (($field['type'] ?? null) === 'select' && ! empty($field['options'])) {
                $fieldRules[] = Rule::in(collect($field['options'])->pluck('value')->all());
            }

            if (($field['type'] ?? null) === 'url' || str_contains($name, 'url')) {
                $fieldRules[] = 'url';
            }

            $rules[$name] = $fieldRules;
        }

        if (isset($providerConfig['fields'])) {
            foreach ($providerConfig['fields'] as $field) {
                if (($field['name'] ?? null) === 'webhook_url' && ($field['required'] ?? false)) {
                    $rules['webhook_url'] = ['required', 'url', 'max:500'];
                }
            }
        }

        return $rules;
    }

    private function testIntegrationCredentials(array $providerConfig, AccountIntegration $integration): array
    {
        return match ($providerConfig['id']) {
            'razorpay-payments' => $this->testRazorpayCredentials($integration),
            'workspace-ai' => $this->testWorkspaceAiCredentials($integration),
            default => ['type' => 'config_validation'],
        };
    }

    private function testRazorpayCredentials(AccountIntegration $integration): array
    {
        $keyId = trim((string) $integration->configValue('key_id'));
        $keySecret = $integration->secret('key_secret');

        if ($keyId === '' || ! $keySecret) {
            throw new \RuntimeException('Workspace Razorpay key ID or key secret is missing.');
        }

        $response = Http::withBasicAuth($keyId, $keySecret)
            ->acceptJson()
            ->timeout(15)
            ->get('https://api.razorpay.com/v1/payments', ['count' => 1]);

        if (! $response->successful()) {
            throw new \RuntimeException('Razorpay test failed: '.($response->json('error.description') ?: 'HTTP '.$response->status()));
        }

        return [
            'type' => 'razorpay_credentials',
            'endpoint' => '/v1/payments',
            'status' => $response->status(),
        ];
    }

    private function testWorkspaceAiCredentials(AccountIntegration $integration): array
    {
        $provider = trim((string) $integration->configValue('provider', 'openai')) ?: 'openai';
        $secretField = match ($provider) {
            'openai' => 'openai_api_key',
            'anthropic' => 'anthropic_api_key',
            'gemini' => 'gemini_api_key',
            default => null,
        };

        if (! $secretField || ! $integration->secret($secretField)) {
            throw new \RuntimeException('Workspace '.$provider.' API key is missing.');
        }

        $reply = AiProviderFactory::forAccount($integration->account)->generate(
            'Reply with only the word ok.',
            'Health check',
            0,
            8
        );

        if (trim($reply) === '') {
            throw new \RuntimeException('AI provider returned an empty response.');
        }

        return [
            'type' => 'workspace_ai_credentials',
            'provider' => $provider,
            'response_length' => strlen($reply),
        ];
    }

    private function deliverWebhookTest(array $providerConfig, AccountIntegration $integration): void
    {
        $url = (string) ($integration->config['webhook_url'] ?? '');
        if ($url === '') {
            throw new \RuntimeException('Webhook URL is required.');
        }

        $payload = [
            'event' => 'zyptos.integration.test',
            'provider' => $providerConfig['id'],
            'workspace_id' => $integration->account_id,
            'created_at' => now()->toIso8601String(),
            'data' => [
                'message' => 'Real Zyptos integration test event',
                'source' => 'integrations.sync',
            ],
        ];

        $response = $providerConfig['id'] === 'slack'
            ? Http::timeout(10)->post($url, [
                'text' => 'Zyptos integration test delivered.',
                'blocks' => [
                    [
                        'type' => 'section',
                        'text' => [
                            'type' => 'mrkdwn',
                            'text' => '*Zyptos integration test delivered.*',
                        ],
                    ],
                    [
                        'type' => 'context',
                        'elements' => [
                            ['type' => 'mrkdwn', 'text' => 'Workspace ID: '.$integration->account_id],
                        ],
                    ],
                ],
            ])
            : Http::timeout(10)
                ->acceptJson()
                ->post($url, $payload);

        if (! $response->successful()) {
            throw new \RuntimeException('HTTP '.$response->status().': '.substr($response->body(), 0, 500));
        }
    }

    private function catalog(): array
    {
        return [
            [
                'id' => 'razorpay-payments',
                'name' => 'Razorpay Payments',
                'category' => 'payments',
                'stage' => 'live',
                'desc' => 'Use your own Razorpay account for customer payment links created from orders, carts, and chatbot payment actions.',
                'color' => '#3395FF',
                'popular' => true,
                'sync_handler' => 'validate-config',
                'features' => ['Dynamic payment links', 'Order recovery', 'Chatbot payment actions'],
                'fields' => [
                    ['name' => 'key_id', 'label' => 'Key ID', 'required' => true],
                    ['name' => 'key_secret', 'label' => 'Key secret', 'required' => true, 'secret' => true],
                    ['name' => 'webhook_secret', 'label' => 'Webhook secret', 'required' => false, 'secret' => true],
                    ['name' => 'account_name', 'label' => 'Account name', 'required' => false],
                    ['name' => 'currency', 'label' => 'Currency', 'required' => false, 'placeholder' => 'INR'],
                ],
            ],
            [
                'id' => 'workspace-ai',
                'name' => 'Workspace AI',
                'category' => 'ai',
                'stage' => 'live',
                'desc' => 'Use this workspace’s own OpenAI, Anthropic, or Gemini key for agent replies and automation, with platform fallback when allowed.',
                'color' => '#10B981',
                'popular' => true,
                'sync_handler' => 'validate-config',
                'features' => ['Workspace API keys', 'Encrypted secrets', 'Platform fallback'],
                'fields' => [
                    [
                        'name' => 'provider',
                        'label' => 'Provider',
                        'required' => true,
                        'type' => 'select',
                        'options' => [
                            ['value' => 'openai', 'label' => 'OpenAI'],
                            ['value' => 'anthropic', 'label' => 'Anthropic'],
                            ['value' => 'gemini', 'label' => 'Gemini'],
                        ],
                    ],
                    ['name' => 'openai_api_key', 'label' => 'OpenAI API key', 'required' => false, 'secret' => true, 'visible_when' => ['provider' => 'openai']],
                    ['name' => 'openai_model', 'label' => 'OpenAI model', 'required' => false, 'placeholder' => 'gpt-4o-mini', 'visible_when' => ['provider' => 'openai']],
                    ['name' => 'anthropic_api_key', 'label' => 'Anthropic API key', 'required' => false, 'secret' => true, 'visible_when' => ['provider' => 'anthropic']],
                    ['name' => 'anthropic_model', 'label' => 'Anthropic model', 'required' => false, 'placeholder' => 'claude-3-5-haiku-20241022', 'visible_when' => ['provider' => 'anthropic']],
                    ['name' => 'gemini_api_key', 'label' => 'Gemini API key', 'required' => false, 'secret' => true, 'visible_when' => ['provider' => 'gemini']],
                    ['name' => 'gemini_model', 'label' => 'Gemini model', 'required' => false, 'placeholder' => 'gemini-2.0-flash', 'visible_when' => ['provider' => 'gemini']],
                    ['name' => 'system_prompt', 'label' => 'Workspace system prompt', 'type' => 'textarea', 'required' => false],
                    ['name' => 'temperature', 'label' => 'Temperature', 'required' => false, 'placeholder' => '0.3'],
                    ['name' => 'max_tokens', 'label' => 'Max tokens', 'required' => false, 'placeholder' => '250'],
                    [
                        'name' => 'fallback_mode',
                        'label' => 'Fallback behavior',
                        'type' => 'select',
                        'required' => false,
                        'description' => 'Choose what Zyptos should do if this workspace key is not usable.',
                        'options' => [
                            ['value' => 'platform_fallback', 'label' => 'Use platform fallback'],
                            ['value' => 'workspace_only', 'label' => 'Use workspace key only'],
                            ['value' => 'disable_ai', 'label' => 'Disable AI if key fails'],
                        ],
                    ],
                ],
            ],
            [
                'id' => 'zapier',
                'name' => 'Zapier',
                'category' => 'automation',
                'stage' => 'live',
                'desc' => 'Send real Zyptos webhook events to a Zapier catch hook.',
                'color' => '#FF4A00',
                'popular' => true,
                'features' => ['Catch hook delivery', 'Developer API', 'Webhook test events'],
                'fields' => [
                    ['name' => 'webhook_url', 'label' => 'Zapier catch hook URL', 'required' => true],
                    ['name' => 'notes', 'label' => 'Workflow notes', 'type' => 'textarea'],
                ],
            ],
            [
                'id' => 'make',
                'name' => 'Make',
                'category' => 'automation',
                'stage' => 'live',
                'desc' => 'Send real Zyptos webhook events to a Make custom webhook.',
                'color' => '#6D00CC',
                'popular' => false,
                'features' => ['Custom webhook delivery', 'Developer API', 'Webhook test events'],
                'fields' => [
                    ['name' => 'webhook_url', 'label' => 'Make webhook URL', 'required' => true],
                    ['name' => 'notes', 'label' => 'Scenario notes', 'type' => 'textarea'],
                ],
            ],
            [
                'id' => 'slack',
                'name' => 'Slack',
                'category' => 'communication',
                'stage' => 'live',
                'desc' => 'Send real test notifications to a Slack incoming webhook.',
                'color' => '#4A154B',
                'popular' => false,
                'features' => ['Incoming webhook delivery', 'Test notifications'],
                'fields' => [
                    ['name' => 'webhook_url', 'label' => 'Incoming webhook URL', 'required' => true],
                    ['name' => 'notes', 'label' => 'Channel notes', 'type' => 'textarea'],
                ],
            ],
            [
                'id' => 'shopify',
                'name' => 'Shopify',
                'category' => 'commerce',
                'stage' => 'live',
                'desc' => 'Import real Shopify products and recent orders into catalog and ecommerce pages.',
                'color' => '#95BF47',
                'popular' => true,
                'sync_handler' => 'import',
                'features' => ['Product import', 'Order import', 'Catalog sync'],
                'fields' => [
                    ['name' => 'store_url', 'label' => 'Shopify store domain', 'required' => true],
                    ['name' => 'access_token', 'label' => 'Admin API access token', 'required' => true, 'secret' => true],
                    ['name' => 'webhook_secret', 'label' => 'Webhook shared secret', 'required' => false, 'secret' => true],
                    ['name' => 'currency', 'label' => 'Currency', 'required' => false],
                ],
            ],
            [
                'id' => 'woocommerce',
                'name' => 'WooCommerce',
                'category' => 'commerce',
                'stage' => 'live',
                'desc' => 'Import real WooCommerce products and recent orders from the REST API.',
                'color' => '#96588A',
                'popular' => false,
                'sync_handler' => 'import',
                'features' => ['Product import', 'Order import', 'Catalog sync'],
                'fields' => [
                    ['name' => 'store_url', 'label' => 'WooCommerce store URL', 'required' => true, 'type' => 'url'],
                    ['name' => 'consumer_key', 'label' => 'Consumer key', 'required' => true, 'secret' => true],
                    ['name' => 'consumer_secret', 'label' => 'Consumer secret', 'required' => true, 'secret' => true],
                    ['name' => 'webhook_secret', 'label' => 'Webhook shared secret', 'required' => false, 'secret' => true],
                    ['name' => 'currency', 'label' => 'Currency', 'required' => false],
                ],
            ],
            [
                'id' => 'meta-catalog',
                'name' => 'Meta Catalog',
                'category' => 'commerce',
                'stage' => 'live',
                'desc' => 'Sync products from a Meta Commerce catalog linked to the workspace WABA, then send those products from the inbox.',
                'color' => '#1877F2',
                'popular' => true,
                'oauth' => 'facebook',
                'oauth_scopes' => [
                    'email',
                    'business_management',
                    'catalog_management',
                    'whatsapp_business_management',
                ],
                'sync_handler' => 'import',
                'features' => ['Meta product sync', 'WhatsApp product cards', 'Inbox product picker'],
                'fields' => [
                    ['name' => 'catalog_id', 'label' => 'Meta catalog ID', 'required' => false],
                    ['name' => 'catalog_name', 'label' => 'Catalog name', 'required' => false],
                    ['name' => 'business_id', 'label' => 'Meta business ID', 'required' => false],
                    ['name' => 'access_token', 'label' => 'Catalog access token', 'required' => false, 'secret' => true, 'description' => 'Optional. If empty, Zyptos uses the active WABA connection token.'],
                    ['name' => 'currency', 'label' => 'Currency', 'required' => false, 'placeholder' => 'INR'],
                ],
            ],
            [
                'id' => 'meta-leads',
                'name' => 'Meta Leads',
                'category' => 'marketing',
                'stage' => 'live',
                'desc' => 'Import real Facebook lead form submissions into the Meta Leads page.',
                'color' => '#1877F2',
                'popular' => true,
                'oauth' => 'facebook',
                'oauth_scopes' => [
                    'email',
                    'pages_show_list',
                    'pages_read_engagement',
                    'leads_retrieval',
                    'business_management',
                ],
                'sync_handler' => 'import',
                'features' => ['Meta form mapping', 'Webhook automation', 'Lead generation insight'],
                'fields' => [
                    ['name' => 'form_id', 'label' => 'Lead form ID', 'required' => false],
                    ['name' => 'page_id', 'label' => 'Facebook Page ID', 'required' => false],
                    ['name' => 'access_token', 'label' => 'Page access token', 'required' => false, 'secret' => true],
                    ['name' => 'webhook_verify_token', 'label' => 'Webhook verify token', 'required' => false, 'secret' => true],
                    ['name' => 'app_secret', 'label' => 'Meta app secret for webhook signature', 'required' => false, 'secret' => true],
                    ['name' => 'form_name', 'label' => 'Form name', 'required' => false],
                    ['name' => 'map_name', 'label' => 'Name field aliases', 'required' => false, 'placeholder' => 'full_name,name'],
                    ['name' => 'map_phone', 'label' => 'Phone field aliases', 'required' => false, 'placeholder' => 'phone_number,phone,mobile'],
                    ['name' => 'map_email', 'label' => 'Email field aliases', 'required' => false, 'placeholder' => 'email,email_address'],
                    ['name' => 'map_city', 'label' => 'City field aliases', 'required' => false, 'placeholder' => 'city,location'],
                    ['name' => 'map_campaign_name', 'label' => 'Campaign field aliases', 'required' => false, 'placeholder' => 'campaign_name,campaign'],
                    ['name' => 'auto_tags', 'label' => 'Auto tags', 'required' => false, 'placeholder' => 'meta-lead,hot-lead'],
                    ['name' => 'auto_create_contact', 'label' => 'Auto-create WhatsApp contact', 'required' => false, 'type' => 'boolean', 'description' => 'Create/update a contact immediately when a Meta lead has a phone number.'],
                    ['name' => 'lead_alerts_enabled', 'label' => 'New lead alerts', 'required' => false, 'type' => 'boolean', 'description' => 'Show in-app/browser alerts and notification-center entries for new Meta leads.'],
                    ['name' => 'lead_assignee_name', 'label' => 'Default assignee name', 'required' => false, 'placeholder' => 'Sales team or agent name'],
                    ['name' => 'lead_routing_rules', 'label' => 'Routing rules', 'required' => false, 'type' => 'textarea', 'placeholder' => "instagram => Priya\nenterprise => Senior Sales", 'description' => 'One rule per line. If form, campaign, ad, city, platform, or source contains the left side, assignee becomes the right side.'],
                    ['name' => 'lead_automation_enabled', 'label' => 'Start automation for new leads', 'required' => false, 'type' => 'boolean', 'description' => 'Runs the selected active chatbot flow after contact creation.'],
                    ['name' => 'lead_automation_flow_id', 'label' => 'Automation flow ID', 'required' => false, 'type' => 'number', 'placeholder' => 'Bot flow ID'],
                ],
            ],
            [
                'id' => 'google-sheets',
                'name' => 'Google Sheets',
                'category' => 'productivity',
                'stage' => 'live',
                'desc' => 'Import real contacts from a Google Sheet with name, phone, and email columns.',
                'color' => '#0F9D58',
                'popular' => false,
                'oauth' => 'google',
                'oauth_scopes' => [
                    'openid',
                    'profile',
                    'email',
                    'https://www.googleapis.com/auth/drive.metadata.readonly',
                    'https://www.googleapis.com/auth/spreadsheets.readonly',
                ],
                'sync_handler' => 'import',
                'features' => ['Google Sheets sync', 'Column mapping', 'Auto tags', 'Sheet row metadata'],
                'fields' => [
                    ['name' => 'spreadsheet_id', 'label' => 'Spreadsheet ID', 'required' => true],
                    ['name' => 'sheet_name', 'label' => 'Sheet name', 'required' => false],
                    ['name' => 'range', 'label' => 'Range', 'required' => false, 'placeholder' => 'A1:Z1000'],
                    ['name' => 'map_name', 'label' => 'Name column aliases', 'required' => false, 'placeholder' => 'name,full_name'],
                    ['name' => 'map_phone', 'label' => 'Phone column aliases', 'required' => false, 'placeholder' => 'phone,mobile,whatsapp'],
                    ['name' => 'map_email', 'label' => 'Email column aliases', 'required' => false, 'placeholder' => 'email,email_address'],
                    ['name' => 'auto_tags', 'label' => 'Auto tags', 'required' => false, 'placeholder' => 'sheet-import,lead'],
                ],
            ],
            [
                'id' => 'google-calendar',
                'name' => 'Google Calendar',
                'category' => 'productivity',
                'stage' => 'live',
                'desc' => 'Import real upcoming calendar events into workspace appointments.',
                'color' => '#4285F4',
                'popular' => false,
                'oauth' => 'google',
                'oauth_scopes' => [
                    'openid',
                    'profile',
                    'email',
                    'https://www.googleapis.com/auth/calendar.events',
                    'https://www.googleapis.com/auth/calendar.readonly',
                ],
                'sync_handler' => 'import',
                'features' => ['Google Calendar sync', 'Create/update events', 'Stable event dedupe', 'Meeting links'],
                'fields' => [
                    [
                        'name' => 'sync_direction',
                        'label' => 'Sync mode',
                        'type' => 'select',
                        'required' => false,
                        'options' => [
                            ['value' => 'import', 'label' => 'Import Google events only'],
                            ['value' => 'export', 'label' => 'Create/update Google events from Zyptos'],
                            ['value' => 'bidirectional', 'label' => 'Import and create/update events'],
                        ],
                    ],
                    ['name' => 'calendar_id', 'label' => 'Calendar ID', 'required' => false],
                    ['name' => 'time_min', 'label' => 'Import from date', 'required' => false, 'placeholder' => '2026-05-01'],
                    ['name' => 'create_google_meet', 'label' => 'Create Google Meet link for new Zyptos appointments', 'required' => false, 'type' => 'boolean'],
                ],
            ],
            [
                'id' => 'whatsapp-flows',
                'name' => 'WhatsApp Flows',
                'category' => 'whatsapp',
                'stage' => 'live',
                'desc' => 'Create, sync, validate, publish, and send Meta WhatsApp Flows for structured in-chat forms and booking journeys.',
                'color' => '#00A548',
                'popular' => true,
                'system_managed' => true,
                'always_available' => true,
                'route' => 'app.whatsapp.flows.index',
                'features' => ['Flow builder', 'Meta publish', 'Inbox send action', 'Webhook data capture'],
                'fields' => [],
            ],
            [
                'id' => 'whatsapp-commerce',
                'name' => 'WhatsApp Commerce',
                'category' => 'commerce',
                'stage' => 'beta',
                'desc' => 'Use synced catalog products inside inbox conversations, payment flows, abandoned-cart style journeys, and order follow-ups.',
                'color' => '#00A548',
                'popular' => true,
                'system_managed' => true,
                'always_available' => true,
                'route' => 'app.catalog.index',
                'features' => ['Product picker', 'Catalog messages', 'Payment-link handoff', 'Order follow-ups'],
                'fields' => [],
            ],
            [
                'id' => 'ctwa-ads',
                'name' => 'Click-to-WhatsApp Ads',
                'category' => 'marketing',
                'stage' => 'beta',
                'desc' => 'Track CTWA leads by source, ad/post IDs, auto-tags, and automation entry points. Meta ad creation remains handled in Meta Ads Manager for now.',
                'color' => '#1877F2',
                'popular' => true,
                'features' => ['Source tracking', 'Auto-tagging', 'Ad-to-flow routing', 'Lead attribution notes'],
                'fields' => [
                    ['name' => 'ad_account_id', 'label' => 'Meta ad account ID', 'required' => false],
                    ['name' => 'default_source_tag', 'label' => 'Default CTWA tag', 'required' => false, 'placeholder' => 'ctwa-lead'],
                    ['name' => 'auto_start_flow_id', 'label' => 'Default automation flow ID', 'required' => false, 'placeholder' => 'Bot flow ID'],
                    ['name' => 'utm_source', 'label' => 'Default UTM source', 'required' => false, 'placeholder' => 'facebook'],
                    ['name' => 'notes', 'label' => 'Tracking notes', 'type' => 'textarea'],
                ],
            ],
            [
                'id' => 'template-carousels',
                'name' => 'Carousel Templates',
                'category' => 'marketing',
                'stage' => 'roadmap',
                'desc' => 'Create and manage Meta carousel templates for richer product and offer campaigns.',
                'color' => '#00A548',
                'popular' => false,
                'features' => ['Product cards', 'Offer cards', 'Template approval workflow'],
                'fields' => [],
            ],
            [
                'id' => 'hubspot',
                'name' => 'HubSpot CRM',
                'category' => 'crm',
                'stage' => 'roadmap',
                'desc' => 'Sync contacts, leads, lifecycle stages, and deal activity between Zyptos and HubSpot.',
                'color' => '#FF5C35',
                'popular' => false,
                'features' => ['Contact sync', 'Deal sync', 'Handoff activity logs'],
                'fields' => [],
            ],
            [
                'id' => 'salesforce',
                'name' => 'Salesforce CRM',
                'category' => 'crm',
                'stage' => 'roadmap',
                'desc' => 'Sync leads, accounts, opportunities, and WhatsApp conversation activity with Salesforce.',
                'color' => '#00A1E0',
                'popular' => false,
                'features' => ['Lead sync', 'Opportunity updates', 'Conversation activity'],
                'fields' => [],
            ],
            [
                'id' => 'omnichannel-inbox',
                'name' => 'Omnichannel Inbox',
                'category' => 'communication',
                'stage' => 'roadmap',
                'desc' => 'Bring Instagram, Messenger, email, and website chat into the same agent queue as WhatsApp.',
                'color' => '#6366F1',
                'popular' => false,
                'features' => ['Unified queue', 'Channel labels', 'Shared assignments'],
                'fields' => [],
            ],
            [
                'id' => 'developer-webhooks',
                'name' => 'Developer Webhooks',
                'category' => 'automation',
                'stage' => 'live',
                'desc' => 'Real workspace webhook endpoints, API keys, delivery signing, and request docs.',
                'color' => '#111827',
                'popular' => true,
                'system_managed' => true,
                'route' => 'app.developer.index',
                'features' => ['API keys', 'Signed webhooks', 'Delivery tests', 'Usage ledger'],
                'fields' => [],
            ],
        ];
    }
}
