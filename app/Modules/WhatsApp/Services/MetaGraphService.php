<?php

namespace App\Modules\WhatsApp\Services;

use Illuminate\Http\Client\PendingRequest;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class MetaGraphService
{
    protected string $baseUrl;
    protected string $apiVersion;
    protected int $connectTimeout = 10;
    protected int $requestTimeout = 30;
    protected int $requestRetries = 2;
    protected int $retryDelayMs = 250;

    public function __construct()
    {
        $this->baseUrl = rtrim(config('whatsapp.meta.base_url', 'https://graph.facebook.com'), '/');
        $this->apiVersion = config('whatsapp.meta.api_version', 'v21.0');
    }

    private function graphRequest(): PendingRequest
    {
        return Http::connectTimeout($this->connectTimeout)
            ->timeout($this->requestTimeout)
            ->retry($this->requestRetries, $this->retryDelayMs, throw: false);
    }

    private function graphRequestWithToken(string $token): PendingRequest
    {
        return $this->graphRequest()->withToken($token);
    }

    public function appAccessToken(): ?string
    {
        $appId = (string) config('whatsapp.meta.app_id', '');
        $appSecret = (string) config('whatsapp.meta.app_secret', '');

        if ($appId === '' || $appSecret === '') {
            return null;
        }

        return sprintf('%s|%s', $appId, $appSecret);
    }

    public function exchangeCodeForToken(string $code, ?string $redirectUri = null): array
    {
        $appId = config('whatsapp.meta.app_id');
        $appSecret = config('whatsapp.meta.app_secret');
        if (empty($appId) || empty($appSecret)) {
            throw new \RuntimeException('Meta App ID/Secret not configured.');
        }

        Log::channel('whatsapp')->info('Meta OAuth code exchange request', [
            'redirect_uri' => $redirectUri,
            'code_length' => strlen($code),
            'code_prefix' => substr($code, 0, 12),
            'code_sha1' => sha1($code),
        ]);

        $params = [
            'client_id' => $appId,
            'client_secret' => $appSecret,
            'code' => $code,
        ];

        if ($redirectUri) {
            $params['redirect_uri'] = $redirectUri;
        }

        $response = $this->graphRequest()->get("{$this->baseUrl}/{$this->apiVersion}/oauth/access_token", $params);

        $data = $response->json();
        if (!$response->successful()) {
            Log::channel('whatsapp')->error('Meta OAuth code exchange failed', [
                'status' => $response->status(),
                'redirect_uri' => $redirectUri,
                'code_length' => strlen($code),
                'code_prefix' => substr($code, 0, 12),
                'code_sha1' => sha1($code),
                'error' => $data['error'] ?? $data]);
            throw new \RuntimeException($data['error']['message'] ?? 'Meta OAuth code exchange failed');
        }

        Log::channel('whatsapp')->info('Meta OAuth code exchange succeeded', [
            'redirect_uri' => $redirectUri,
            'code_length' => strlen($code),
            'code_prefix' => substr($code, 0, 12),
            'code_sha1' => sha1($code),
        ]);

        return $data;
    }

    /**
     * Exchange a user token for a longer-lived token when possible.
     * Falls back to original token flow if Meta does not allow exchange for this token type.
     */
    public function exchangeForLongLivedToken(string $accessToken): ?array
    {
        $appId = config('whatsapp.meta.app_id');
        $appSecret = config('whatsapp.meta.app_secret');

        if (empty($appId) || empty($appSecret)) {
            return null;
        }

        $response = $this->graphRequest()->get("{$this->baseUrl}/{$this->apiVersion}/oauth/access_token", [
            'grant_type' => 'fb_exchange_token',
            'client_id' => $appId,
            'client_secret' => $appSecret,
            'fb_exchange_token' => $accessToken,
        ]);

        $data = $response->json();
        if (!$response->successful()) {
            Log::channel('whatsapp')->warning('Meta long-lived token exchange skipped', [
                'status' => $response->status(),
                'error' => $data['error'] ?? $data,
            ]);
            return null;
        }

        return $data;
    }

    public function debugToken(string $inputToken, ?string $accessToken = null): array
    {
        $effectiveToken = $accessToken ?: config('whatsapp.meta.system_user_token') ?: $inputToken;

        $response = $this->graphRequest()->get("{$this->baseUrl}/{$this->apiVersion}/debug_token", [
            'input_token' => $inputToken,
            'access_token' => $effectiveToken]);

        $data = $response->json();
        if (!$response->successful()) {
            Log::channel('whatsapp')->error('Meta debug_token failed', [
                'status' => $response->status(),
                'error' => $data['error'] ?? $data]);
            throw new \RuntimeException($data['error']['message'] ?? 'Meta debug_token failed');
        }

        return $data['data'] ?? $data;
    }

    public function subscribeAppToWaba(string $wabaId, string $accessToken): array
    {
        $response = $this->graphRequestWithToken($accessToken)
            ->post("{$this->baseUrl}/{$this->apiVersion}/{$wabaId}/subscribed_apps");

        $data = $response->json();
        if (!$response->successful()) {
            Log::channel('whatsapp')->warning('Subscribe app to WABA failed', [
                'waba_id' => $wabaId,
                'status' => $response->status(),
                'error' => $data['error'] ?? $data]);
            throw new \RuntimeException($data['error']['message'] ?? 'Subscribe app to WABA failed');
        }

        return $data;
    }

    public function getSubscribedApps(string $wabaId, string $accessToken): array
    {
        $response = $this->graphRequestWithToken($accessToken)
            ->get("{$this->baseUrl}/{$this->apiVersion}/{$wabaId}/subscribed_apps");

        $data = $response->json();
        if (!$response->successful()) {
            Log::channel('whatsapp')->warning('Get subscribed apps failed', [
                'waba_id' => $wabaId,
                'status' => $response->status(),
                'error' => $data['error'] ?? $data,
            ]);
            throw new \RuntimeException($data['error']['message'] ?? 'Get subscribed apps failed');
        }

        return $data['data'] ?? $data;
    }

    public function ensureAppSubscribedToWaba(string $wabaId, string $accessToken): array
    {
        $apps = $this->getSubscribedApps($wabaId, $accessToken);
        if (!empty($apps)) {
            return [
                'already_subscribed' => true,
                'data' => $apps,
            ];
        }

        return $this->subscribeAppToWaba($wabaId, $accessToken);
    }

    public function listPhoneNumbers(string $wabaId, string $accessToken): array
    {
        $response = $this->graphRequestWithToken($accessToken)
            ->get("{$this->baseUrl}/{$this->apiVersion}/{$wabaId}/phone_numbers", [
                'fields' => 'id,display_phone_number,verified_name,quality_rating,messaging_limit_tier,code_verification_status',
            ]);

        $data = $response->json();
        if (!$response->successful()) {
            Log::channel('whatsapp')->error('List WABA phone numbers failed', [
                'waba_id' => $wabaId,
                'status' => $response->status(),
                'error' => $data['error'] ?? $data]);
            throw new \RuntimeException($data['error']['message'] ?? 'List phone numbers failed');
        }

        return $data['data'] ?? [];
    }

    public function registerPhoneNumber(string $phoneNumberId, string $pin, string $accessToken): array
    {
        $response = $this->graphRequestWithToken($accessToken)
            ->post("{$this->baseUrl}/{$this->apiVersion}/{$phoneNumberId}/register", [
                'messaging_product' => 'whatsapp',
                'pin' => $pin]);

        $data = $response->json();
        if (!$response->successful()) {
            Log::channel('whatsapp')->warning('Register phone number failed', [
                'phone_number_id' => $phoneNumberId,
                'status' => $response->status(),
                'error' => $data['error'] ?? $data]);
            throw new \RuntimeException($data['error']['message'] ?? 'Register phone number failed');
        }

        return $data;
    }

    public function getPhoneNumberDetails(string $phoneNumberId, string $accessToken): array
    {
        $response = $this->graphRequestWithToken($accessToken)
            ->get("{$this->baseUrl}/{$this->apiVersion}/{$phoneNumberId}", [
                'fields' => 'display_phone_number,verified_name,quality_rating,messaging_limit_tier,code_verification_status,name_status,new_name_status']);

        $data = $response->json();
        if (!$response->successful()) {
            Log::channel('whatsapp')->warning('Get phone number details failed', [
                'phone_number_id' => $phoneNumberId,
                'status' => $response->status(),
                'error' => $data['error'] ?? $data]);
            throw new \RuntimeException($data['error']['message'] ?? 'Get phone number details failed');
        }

        return $data;
    }


    public function getWhatsAppBusinessProfile(string $phoneNumberId, string $accessToken): array
    {
        $params = [
            'messaging_product' => 'whatsapp',
            'fields' => 'about,address,description,email,profile_picture_url,websites,vertical',
        ];

        $tokens = array_values(array_unique(array_filter([
            $accessToken,
            config('whatsapp.meta.system_user_token'),
        ])));

        $lastError = null;

        foreach ($tokens as $token) {
            $response = $this->graphRequestWithToken($token)
                ->get("{$this->baseUrl}/{$this->apiVersion}/{$phoneNumberId}/whatsapp_business_profile", $params);

            $data = $response->json();
            if ($response->successful()) {
                return $data['data'][0] ?? $data;
            }

            $lastError = $data['error']['message'] ?? 'Get WhatsApp business profile failed';

            Log::channel('whatsapp')->warning('Get WhatsApp business profile failed', [
                'phone_number_id' => $phoneNumberId,
                'status' => $response->status(),
                'token_source' => $token === $accessToken ? 'connection' : 'system_user',
                'error' => $data['error'] ?? $data,
            ]);
        }

        throw new \RuntimeException($lastError ?? 'Get WhatsApp business profile failed');
    }

    public function updateWhatsAppBusinessProfile(string $phoneNumberId, string $accessToken, array $profile): array
    {
        $payload = array_filter([
            'messaging_product' => 'whatsapp',
            'about' => $profile['about'] ?? null,
            'address' => $profile['address'] ?? null,
            'description' => $profile['description'] ?? null,
            'email' => $profile['email'] ?? null,
            'vertical' => $profile['vertical'] ?? null,
            'websites' => !empty($profile['websites']) ? array_values(array_filter((array) $profile['websites'])) : null,
        ], static fn ($value) => $value !== null && $value !== '');

        $response = $this->graphRequestWithToken($accessToken)
            ->post("{$this->baseUrl}/{$this->apiVersion}/{$phoneNumberId}/whatsapp_business_profile", $payload);

        $data = $response->json();
        if (!$response->successful()) {
            Log::channel('whatsapp')->warning('Update WhatsApp business profile failed', [
                'phone_number_id' => $phoneNumberId,
                'status' => $response->status(),
                'error' => $data['error'] ?? $data,
            ]);
            throw new \RuntimeException($data['error']['message'] ?? 'Update WhatsApp business profile failed');
        }

        return $data;
    }


    public function getWabaDetails(string $wabaId, string $accessToken): array
    {
        $response = $this->graphRequestWithToken($accessToken)
            ->get("{$this->baseUrl}/{$this->apiVersion}/{$wabaId}", [
                'fields' => 'id,name,currency,timezone_id,account_review_status,business_verification_status',
            ]);

        $data = $response->json();
        if (!$response->successful()) {
            Log::channel('whatsapp')->warning('Get WABA details failed', [
                'waba_id' => $wabaId,
                'status' => $response->status(),
                'error' => $data['error'] ?? $data,
            ]);
            throw new \RuntimeException($data['error']['message'] ?? 'Get WABA details failed');
        }

        return $data;
    }

    /**
     * Ensure partner System User is assigned to tenant WABA with required tasks.
     * Best-effort: if assignment already exists Meta may return an error; caller decides strictness.
     */
    public function assignSystemUserToWaba(
        string $wabaId,
        string $systemUserId,
        string $accessToken,
        array $tasks = ['MANAGE', 'DEVELOP']
    ): array {
        $response = $this->graphRequestWithToken($accessToken)
            ->post("{$this->baseUrl}/{$this->apiVersion}/{$wabaId}/assigned_users", [
                'user' => $systemUserId,
                'tasks' => $tasks,
            ]);

        $data = $response->json();
        if (!$response->successful()) {
            Log::channel('whatsapp')->warning('Assign system user to WABA failed', [
                'waba_id' => $wabaId,
                'system_user_id' => $systemUserId,
                'status' => $response->status(),
                'error' => $data['error'] ?? $data,
            ]);
            throw new \RuntimeException($data['error']['message'] ?? 'Assign system user to WABA failed');
        }

        return $data;
    }

    public function getAssignedUsers(string $wabaId, string $accessToken): array
    {
        $response = $this->graphRequestWithToken($accessToken)
            ->get("{$this->baseUrl}/{$this->apiVersion}/{$wabaId}/assigned_users");

        $data = $response->json();
        if (!$response->successful()) {
            Log::channel('whatsapp')->warning('Get assigned users failed', [
                'waba_id' => $wabaId,
                'status' => $response->status(),
                'error' => $data['error'] ?? $data,
            ]);
            throw new \RuntimeException($data['error']['message'] ?? 'Get assigned users failed');
        }

        return $data['data'] ?? $data;
    }

    public function ensureSystemUserAssignedToWaba(
        string $wabaId,
        string $systemUserId,
        string $accessToken,
        array $tasks = ['MANAGE', 'DEVELOP']
    ): array {
        $assignedUsers = $this->getAssignedUsers($wabaId, $accessToken);
        $alreadyAssigned = collect($assignedUsers)->contains(function ($user) use ($systemUserId) {
            return (string) ($user['id'] ?? $user['user'] ?? '') === $systemUserId;
        });

        if ($alreadyAssigned) {
            return [
                'already_assigned' => true,
                'data' => $assignedUsers,
            ];
        }

        return $this->assignSystemUserToWaba($wabaId, $systemUserId, $accessToken, $tasks);
    }

    /**
     * Attempt to share partner credit line with tenant WABA.
     * Meta has different edge shapes by account setup/version, so we try known paths.
     */
    public function attachCreditLineToWaba(
        string $creditLineId,
        string $wabaId,
        string $accessToken
    ): array {
        $attempts = [
            [
                'url' => "{$this->baseUrl}/{$this->apiVersion}/{$creditLineId}/owning_credit_allocation_configs",
                'payload' => ['recipient' => $wabaId],
            ],
            [
                'url' => "{$this->baseUrl}/{$this->apiVersion}/{$creditLineId}/credit_allocations",
                'payload' => ['whatsapp_business_account' => $wabaId],
            ],
        ];

        $lastError = null;
        foreach ($attempts as $attempt) {
            $response = $this->graphRequestWithToken($accessToken)->post($attempt['url'], $attempt['payload']);
            $data = $response->json();
            if ($response->successful()) {
                return $data;
            }
            $lastError = $data['error']['message'] ?? 'Credit line attachment failed';
            Log::channel('whatsapp')->warning('Credit line attach attempt failed', [
                'waba_id' => $wabaId,
                'credit_line_id' => $creditLineId,
                'url' => $attempt['url'],
                'status' => $response->status(),
                'error' => $data['error'] ?? $data,
            ]);
        }

        throw new \RuntimeException((string) $lastError);
    }

    public function getApiVersion(): string
    {
        return $this->apiVersion;
    }
}
