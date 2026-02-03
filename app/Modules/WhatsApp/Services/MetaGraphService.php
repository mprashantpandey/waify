<?php

namespace App\Modules\WhatsApp\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class MetaGraphService
{
    protected string $baseUrl;
    protected string $apiVersion;

    public function __construct()
    {
        $this->baseUrl = rtrim(config('whatsapp.meta.base_url', 'https://graph.facebook.com'), '/');
        $this->apiVersion = config('whatsapp.meta.api_version', 'v21.0');
    }

    public function exchangeCodeForToken(string $code, string $redirectUri): array
    {
        $appId = config('whatsapp.meta.app_id');
        $appSecret = config('whatsapp.meta.app_secret');
        if (empty($appId) || empty($appSecret)) {
            throw new \RuntimeException('Meta App ID/Secret not configured.');
        }

        $response = Http::get("{$this->baseUrl}/{$this->apiVersion}/oauth/access_token", [
            'client_id' => $appId,
            'client_secret' => $appSecret,
            'redirect_uri' => $redirectUri,
            'code' => $code]);

        $data = $response->json();
        if (!$response->successful()) {
            Log::channel('whatsapp')->error('Meta OAuth code exchange failed', [
                'status' => $response->status(),
                'error' => $data['error'] ?? $data]);
            throw new \RuntimeException($data['error']['message'] ?? 'Meta OAuth code exchange failed');
        }

        return $data;
    }

    public function debugToken(string $inputToken, ?string $accessToken = null): array
    {
        $effectiveToken = $accessToken ?: config('whatsapp.meta.system_user_token') ?: $inputToken;

        $response = Http::get("{$this->baseUrl}/{$this->apiVersion}/debug_token", [
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
        $response = Http::withToken($accessToken)
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

    public function listPhoneNumbers(string $wabaId, string $accessToken): array
    {
        $response = Http::withToken($accessToken)
            ->get("{$this->baseUrl}/{$this->apiVersion}/{$wabaId}/phone_numbers");

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
        $response = Http::withToken($accessToken)
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
        $response = Http::withToken($accessToken)
            ->get("{$this->baseUrl}/{$this->apiVersion}/{$phoneNumberId}", [
                'fields' => 'display_phone_number,verified_name']);

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

    public function getApiVersion(): string
    {
        return $this->apiVersion;
    }
}
