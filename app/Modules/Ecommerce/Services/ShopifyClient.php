<?php

namespace App\Modules\Ecommerce\Services;

use App\Models\ShopifyIntegration;
use Illuminate\Http\Client\PendingRequest;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Str;

class ShopifyClient
{
    public const API_VERSION = '2025-10';

    public function normalizeShopDomain(string $value): string
    {
        $value = strtolower(trim($value));
        $value = preg_replace('#^https?://#', '', $value) ?? $value;
        $value = trim($value, '/');

        if ($value === '' || !Str::endsWith($value, '.myshopify.com')) {
            throw new \InvalidArgumentException('Enter a valid Shopify store domain ending in .myshopify.com');
        }

        return $value;
    }

    public function getShop(ShopifyIntegration $integration): array
    {
        return $this->request($integration, 'GET', '/shop.json')['shop'] ?? [];
    }

    public function listWebhooks(ShopifyIntegration $integration): array
    {
        return $this->request($integration, 'GET', '/webhooks.json')['webhooks'] ?? [];
    }

    public function registerWebhook(ShopifyIntegration $integration, string $topic, string $address): array
    {
        return $this->request($integration, 'POST', '/webhooks.json', [
            'webhook' => [
                'topic' => $topic,
                'address' => $address,
                'format' => 'json',
            ],
        ])['webhook'] ?? [];
    }

    public function fetchRecentCustomers(ShopifyIntegration $integration, int $limit = 50): array
    {
        return $this->request($integration, 'GET', '/customers.json', query: [
            'limit' => max(1, min(250, $limit)),
            'order' => 'updated_at desc',
        ])['customers'] ?? [];
    }

    public function fetchRecentOrders(ShopifyIntegration $integration, int $limit = 50): array
    {
        return $this->request($integration, 'GET', '/orders.json', query: [
            'limit' => max(1, min(250, $limit)),
            'status' => 'any',
            'order' => 'updated_at desc',
        ])['orders'] ?? [];
    }

    protected function request(ShopifyIntegration $integration, string $method, string $path, array $body = [], array $query = []): array
    {
        $response = $this->http($integration)->send($method, $path, [
            'query' => $query,
            'json' => $body,
        ]);

        $response->throw();

        return $response->json() ?: [];
    }

    protected function http(ShopifyIntegration $integration): PendingRequest
    {
        return Http::baseUrl(sprintf('https://%s/admin/api/%s', $integration->shop_domain, self::API_VERSION))
            ->withHeaders([
                'X-Shopify-Access-Token' => (string) $integration->access_token,
                'Accept' => 'application/json',
            ])
            ->timeout(20)
            ->retry(2, 250);
    }
}
