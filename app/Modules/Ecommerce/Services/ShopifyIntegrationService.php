<?php

namespace App\Modules\Ecommerce\Services;

use App\Models\Account;
use App\Models\ShopifyIntegration;
use App\Models\ShopifyWebhookLog;
use App\Modules\Broadcasts\Models\CampaignSequence;
use App\Modules\Broadcasts\Services\SequenceService;
use App\Modules\Contacts\Services\ContactService;
use App\Modules\Ecommerce\Models\EcommerceOrder;
use App\Modules\Ecommerce\Models\EcommerceProduct;
use App\Modules\WhatsApp\Models\WhatsAppContact;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class ShopifyIntegrationService
{
    public const WEBHOOK_TOPICS = [
        'customers/create',
        'orders/create',
        'checkouts/update',
    ];

    public function __construct(
        protected ShopifyClient $client,
        protected ContactService $contactService,
        protected SequenceService $sequenceService,
    ) {
    }

    public function create(Account $account, array $validated): ShopifyIntegration
    {
        $integration = ShopifyIntegration::create([
            'account_id' => $account->id,
            'name' => trim((string) $validated['name']),
            'shop_domain' => $this->client->normalizeShopDomain((string) $validated['shop_domain']),
            'access_token' => trim((string) $validated['access_token']),
            'webhook_secret' => trim((string) $validated['webhook_secret']),
            'webhook_topics' => self::WEBHOOK_TOPICS,
            'abandoned_checkout_sequence_id' => $validated['abandoned_checkout_sequence_id'] ?? null,
            'auto_register_webhooks' => (bool) ($validated['auto_register_webhooks'] ?? true),
            'is_active' => true,
        ]);

        $this->refreshShopMetadata($integration);
        if ($integration->auto_register_webhooks) {
            $this->ensureWebhookSubscriptions($integration);
        }

        return $integration->fresh();
    }

    public function update(ShopifyIntegration $integration, array $validated): ShopifyIntegration
    {
        $updates = [];
        foreach (['name', 'abandoned_checkout_sequence_id', 'is_active', 'auto_register_webhooks'] as $field) {
            if (array_key_exists($field, $validated)) {
                $updates[$field] = $validated[$field];
            }
        }
        if (!empty($validated['shop_domain'])) {
            $updates['shop_domain'] = $this->client->normalizeShopDomain((string) $validated['shop_domain']);
        }
        if (!empty($validated['access_token'])) {
            $updates['access_token'] = trim((string) $validated['access_token']);
        }
        if (!empty($validated['webhook_secret'])) {
            $updates['webhook_secret'] = trim((string) $validated['webhook_secret']);
        }

        $integration->update($updates);
        $this->refreshShopMetadata($integration);
        if ($integration->auto_register_webhooks) {
            $this->ensureWebhookSubscriptions($integration);
        }

        return $integration->fresh();
    }

    public function refreshShopMetadata(ShopifyIntegration $integration): void
    {
        $shop = $this->client->getShop($integration);

        $integration->update([
            'shop_name' => $shop['name'] ?? $integration->shop_name,
            'last_error' => null,
        ]);
    }

    public function ensureWebhookSubscriptions(ShopifyIntegration $integration): void
    {
        $existing = collect($this->client->listWebhooks($integration));
        $callbackUrl = route('hooks.shopify.handle', ['integration' => $integration->id]);

        foreach (self::WEBHOOK_TOPICS as $topic) {
            $alreadyExists = $existing->contains(fn (array $webhook) =>
                ($webhook['topic'] ?? null) === $topic && ($webhook['address'] ?? null) === $callbackUrl
            );

            if (!$alreadyExists) {
                $this->client->registerWebhook($integration, $topic, $callbackUrl);
            }
        }

        $integration->update([
            'webhook_topics' => self::WEBHOOK_TOPICS,
            'last_error' => null,
        ]);
    }

    public function syncRecentData(ShopifyIntegration $integration, int $limit = 50): void
    {
        foreach ($this->client->fetchRecentCustomers($integration, $limit) as $customer) {
            $this->syncCustomerPayload($integration, $customer);
        }

        foreach ($this->client->fetchRecentOrders($integration, $limit) as $order) {
            $this->syncOrderPayload($integration, $order);
        }

        $integration->update([
            'last_sync_at' => now(),
            'last_error' => null,
        ]);
    }

    public function handleWebhook(ShopifyIntegration $integration, Request $request): array
    {
        $rawBody = (string) $request->getContent();
        $hmac = (string) $request->header('X-Shopify-Hmac-Sha256', '');
        $shopDomain = strtolower((string) $request->header('X-Shopify-Shop-Domain', ''));
        $topic = strtolower((string) $request->header('X-Shopify-Topic', ''));
        $eventId = (string) $request->header('X-Shopify-Event-Id', Str::uuid()->toString());

        if ($shopDomain === '' || $shopDomain !== strtolower((string) $integration->shop_domain)) {
            abort(401, 'Shop domain mismatch.');
        }

        if (!$this->isValidWebhookSignature($integration, $rawBody, $hmac)) {
            abort(401, 'Invalid webhook signature.');
        }

        $lockKey = sprintf('shopify:webhook:%d:%s', $integration->id, $eventId);
        if (!Cache::add($lockKey, true, 300)) {
            return ['duplicate' => true];
        }

        $payload = json_decode($rawBody, true);
        if (!is_array($payload)) {
            $payload = [];
        }

        $log = ShopifyWebhookLog::firstOrCreate(
            [
                'shopify_integration_id' => $integration->id,
                'event_id' => $eventId,
            ],
            [
                'account_id' => $integration->account_id,
                'topic' => $topic,
                'shop_domain' => $shopDomain,
                'status' => 'received',
                'payload' => $payload,
            ]
        );

        if (!$log->wasRecentlyCreated && in_array($log->status, ['processed', 'duplicate'], true)) {
            return ['duplicate' => true];
        }

        try {
            match ($topic) {
                'customers/create' => $this->syncCustomerPayload($integration, $payload),
                'orders/create' => $this->syncOrderPayload($integration, $payload),
                'checkouts/update' => $this->handleCheckoutUpdate($integration, $payload),
                default => null,
            };

            $log->update([
                'topic' => $topic,
                'status' => 'processed',
                'payload' => $payload,
                'processed_at' => now(),
                'error_message' => null,
            ]);
            $integration->update(['last_sync_at' => now(), 'last_error' => null]);

            return ['ok' => true];
        } catch (\Throwable $e) {
            $log->update([
                'topic' => $topic,
                'status' => 'failed',
                'payload' => $payload,
                'error_message' => $e->getMessage(),
                'processed_at' => now(),
            ]);
            $integration->update(['last_error' => Str::limit($e->getMessage(), 500)]);
            throw $e;
        }
    }

    public function isValidWebhookSignature(ShopifyIntegration $integration, string $rawBody, string $hmacHeader): bool
    {
        if ($hmacHeader === '' || !$integration->webhook_secret) {
            return false;
        }

        $calculated = base64_encode(hash_hmac('sha256', $rawBody, (string) $integration->webhook_secret, true));

        return hash_equals($calculated, $hmacHeader);
    }

    public function syncCustomerPayload(ShopifyIntegration $integration, array $payload): ?WhatsAppContact
    {
        $waId = $this->normalizeWaId((string) ($payload['phone'] ?? data_get($payload, 'default_address.phone', '')));
        $email = $this->nullableString($payload['email'] ?? null);

        if (!$waId && !$email) {
            return null;
        }

        $contact = WhatsAppContact::query()
            ->where('account_id', $integration->account_id)
            ->when($waId, fn ($query) => $query->where('wa_id', $waId), fn ($query) => $query->where('email', $email))
            ->first();

        $metadata = is_array($contact?->metadata) ? $contact->metadata : [];
        $metadata['shopify'] = array_filter([
            'customer_id' => $payload['id'] ?? null,
            'shop_domain' => $integration->shop_domain,
            'last_synced_at' => now()->toIso8601String(),
            'accepts_marketing' => $payload['accepts_marketing'] ?? null,
            'tags' => $payload['tags'] ?? null,
        ], fn ($value) => $value !== null && $value !== '');

        $data = [
            'name' => trim((string) (($payload['first_name'] ?? '') . ' ' . ($payload['last_name'] ?? ''))) ?: ($payload['first_name'] ?? $payload['email'] ?? $waId),
            'email' => $email,
            'phone' => $payload['phone'] ?? data_get($payload, 'default_address.phone'),
            'company' => data_get($payload, 'default_address.company'),
            'source' => 'shopify',
            'status' => 'active',
            'metadata' => $metadata,
        ];

        if ($waId) {
            $data['wa_id'] = $waId;
        }

        if ($contact) {
            $contact->update(array_filter($data, fn ($value) => $value !== null && $value !== ''));
            return $contact->fresh();
        }

        if (!$waId) {
            return null;
        }

        return WhatsAppContact::query()->create($data + [
            'account_id' => $integration->account_id,
            'wa_id' => $waId,
        ]);
    }

    public function syncOrderPayload(ShopifyIntegration $integration, array $payload): ?EcommerceOrder
    {
        $externalId = (string) ($payload['id'] ?? '');
        if ($externalId === '') {
            return null;
        }

        $contact = $this->syncCustomerPayload($integration, array_merge(
            is_array($payload['customer'] ?? null) ? $payload['customer'] : [],
            [
                'phone' => $payload['phone'] ?? data_get($payload, 'customer.phone') ?? data_get($payload, 'billing_address.phone'),
                'email' => $payload['email'] ?? data_get($payload, 'customer.email'),
            ]
        ));

        $lineItem = collect($payload['line_items'] ?? [])->first() ?: [];
        $product = $this->syncProductFromOrderLineItem($integration, is_array($lineItem) ? $lineItem : []);

        $order = EcommerceOrder::query()->firstOrNew([
            'account_id' => $integration->account_id,
            'external_source' => 'shopify',
            'external_id' => $externalId,
        ]);

        $order->fill([
            'product_id' => $product?->id,
            'customer_name' => $payload['customer']['first_name'] ?? $contact?->name,
            'customer_phone' => $payload['phone'] ?? $contact?->phone,
            'customer_wa_id' => $contact?->wa_id,
            'quantity' => (int) ($lineItem['quantity'] ?? 1),
            'unit_price' => $this->priceMinor($lineItem['price'] ?? $payload['subtotal_price'] ?? 0),
            'total_price' => $this->priceMinor($payload['current_total_price'] ?? $payload['total_price'] ?? 0),
            'currency' => strtoupper((string) ($payload['currency'] ?? 'INR')),
            'status' => $this->mapOrderStatus($payload),
            'source' => 'shopify',
            'notes' => $payload['name'] ?? ('Shopify order #' . ($payload['order_number'] ?? $externalId)),
            'ordered_at' => $payload['created_at'] ?? now(),
            'metadata' => [
                'shop_domain' => $integration->shop_domain,
                'order_name' => $payload['name'] ?? null,
                'order_number' => $payload['order_number'] ?? null,
                'financial_status' => $payload['financial_status'] ?? null,
                'fulfillment_status' => $payload['fulfillment_status'] ?? null,
                'line_items' => $payload['line_items'] ?? [],
            ],
        ]);
        $order->save();

        return $order;
    }

    public function handleCheckoutUpdate(ShopifyIntegration $integration, array $payload): void
    {
        if (!$this->isAbandonedCheckoutPayload($payload)) {
            return;
        }

        $contact = $this->syncCustomerPayload($integration, [
            'phone' => $payload['phone'] ?? data_get($payload, 'shipping_address.phone') ?? data_get($payload, 'billing_address.phone'),
            'email' => $payload['email'] ?? null,
            'first_name' => data_get($payload, 'billing_address.first_name') ?? data_get($payload, 'shipping_address.first_name'),
            'last_name' => data_get($payload, 'billing_address.last_name') ?? data_get($payload, 'shipping_address.last_name'),
        ]);

        if (!$contact || !$integration->abandoned_checkout_sequence_id) {
            return;
        }

        $sequence = CampaignSequence::query()
            ->where('account_id', $integration->account_id)
            ->find($integration->abandoned_checkout_sequence_id);

        if (!$sequence) {
            return;
        }

        $this->sequenceService->triggerForContact($sequence, $contact);
    }

    protected function syncProductFromOrderLineItem(ShopifyIntegration $integration, array $lineItem): ?EcommerceProduct
    {
        $externalId = (string) ($lineItem['product_id'] ?? $lineItem['variant_id'] ?? '');
        $name = trim((string) ($lineItem['name'] ?? ''));
        if ($externalId === '' || $name === '') {
            return null;
        }

        $product = EcommerceProduct::query()->firstOrNew([
            'account_id' => $integration->account_id,
            'external_source' => 'shopify',
            'external_id' => $externalId,
        ]);

        $slugBase = Str::slug($name);
        $product->fill([
            'name' => $name,
            'slug' => $product->exists ? $product->slug : $this->uniqueProductSlug($integration->account_id, $slugBase !== '' ? $slugBase : 'shopify-product-' . $externalId),
            'sku' => $lineItem['sku'] ?? null,
            'description' => $lineItem['variant_title'] ?? null,
            'price' => $this->priceMinor($lineItem['price'] ?? 0),
            'currency' => 'INR',
            'status' => 'active',
            'metadata' => array_filter([
                'shop_domain' => $integration->shop_domain,
                'variant_id' => $lineItem['variant_id'] ?? null,
                'vendor' => $lineItem['vendor'] ?? null,
            ], fn ($value) => $value !== null && $value !== ''),
        ]);
        $product->save();

        return $product;
    }

    protected function uniqueProductSlug(int $accountId, string $base): string
    {
        $slug = $base;
        $counter = 1;

        while (EcommerceProduct::query()->where('account_id', $accountId)->where('slug', $slug)->exists()) {
            $slug = $base . '-' . $counter;
            $counter++;
        }

        return $slug;
    }

    protected function normalizeWaId(string $value): ?string
    {
        $digits = preg_replace('/\D+/', '', trim($value)) ?? '';
        if ($digits === '') {
            return null;
        }
        if (str_starts_with($digits, '00')) {
            $digits = ltrim(substr($digits, 2), '0');
        }
        if (strlen($digits) < 6 || strlen($digits) > 20) {
            return null;
        }
        return $digits;
    }

    protected function priceMinor(mixed $value): int
    {
        if (is_int($value)) {
            return $value;
        }

        return (int) round(((float) $value) * 100);
    }

    protected function mapOrderStatus(array $payload): string
    {
        $financial = strtolower((string) ($payload['financial_status'] ?? ''));
        $fulfillment = strtolower((string) ($payload['fulfillment_status'] ?? ''));
        $cancelled = $payload['cancelled_at'] ?? null;

        if ($cancelled) {
            return 'cancelled';
        }
        if (in_array($fulfillment, ['fulfilled', 'partial'], true)) {
            return 'shipped';
        }
        if (in_array($financial, ['paid', 'partially_paid'], true)) {
            return 'paid';
        }
        if (in_array($financial, ['authorized', 'pending'], true)) {
            return 'confirmed';
        }

        return 'pending';
    }

    protected function isAbandonedCheckoutPayload(array $payload): bool
    {
        if (!empty($payload['completed_at']) || !empty($payload['closed_at'])) {
            return false;
        }

        return !empty($payload['abandoned_checkout_url']) || !empty($payload['line_items']);
    }

    protected function nullableString(mixed $value): ?string
    {
        $value = is_string($value) ? trim($value) : null;
        return $value !== '' ? $value : null;
    }
}
