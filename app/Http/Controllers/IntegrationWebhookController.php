<?php

namespace App\Http\Controllers;

use App\Core\Billing\UsageService;
use App\Models\AccountCatalogProduct;
use App\Models\AccountEcommerceOrder;
use App\Models\AccountIntegration;
use App\Models\AccountIntegrationSyncLog;
use App\Models\AccountMetaLead;
use App\Models\PlatformSetting;
use App\Modules\WhatsApp\Models\WhatsAppContact;
use App\Services\MetaLeadIntakeService;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Str;

class IntegrationWebhookController extends Controller
{
    public function verifyMetaLeadsProvider(Request $request)
    {
        $token = (string) PlatformSetting::get('whatsapp.central_webhook_verify_token', '');
        if ($token !== '' && hash_equals($token, (string) $request->query('hub_verify_token'))) {
            return response((string) $request->query('hub_challenge'), 200);
        }

        return response('Invalid verify token.', 403);
    }

    public function receiveMetaLeadsProvider(Request $request)
    {
        try {
            $this->verifyMetaPlatformSignature($request);
        } catch (\Throwable $e) {
            return response()->json(['ok' => false, 'message' => $e->getMessage()], 403);
        }

        $created = 0;
        $updated = 0;
        $skipped = 0;
        $errors = [];

        foreach ($request->input('entry', []) as $entry) {
            foreach ($entry['changes'] ?? [] as $change) {
                if (($change['field'] ?? null) !== 'leadgen') {
                    $skipped++;

                    continue;
                }

                $value = $change['value'] ?? [];
                $leadId = (string) ($value['leadgen_id'] ?? '');
                $pageId = (string) ($value['page_id'] ?? $entry['id'] ?? '');
                $formId = (string) ($value['form_id'] ?? '');

                $integration = $this->findMetaLeadIntegration($pageId, $formId);
                if (! $integration || $leadId === '') {
                    $skipped++;

                    continue;
                }

                $startedAt = now();
                $log = AccountIntegrationSyncLog::create([
                    'account_id' => $integration->account_id,
                    'account_integration_id' => $integration->id,
                    'provider' => 'meta-leads',
                    'status' => 'running',
                    'trigger' => 'webhook',
                    'started_at' => $startedAt,
                    'source_ip' => $request->ip(),
                ]);

                try {
                    $lead = $this->fetchMetaLead($integration, $leadId);
                    $record = $this->upsertMetaLead($integration, $lead);
                    app(MetaLeadIntakeService::class)->handle($integration, $record, $record->wasRecentlyCreated, 'meta_leads_webhook');
                    $record->wasRecentlyCreated ? $created++ : $updated++;

                    $integration->update([
                        'health' => 'healthy',
                        'last_sync_at' => now(),
                        'events_24h' => (int) ($integration->events_24h ?? 0) + 1,
                        'last_error' => null,
                    ]);

                    $this->finishLog($log, 'success', $startedAt, [
                        'created' => $record->wasRecentlyCreated ? 1 : 0,
                        'updated' => $record->wasRecentlyCreated ? 0 : 1,
                        'skipped' => 0,
                        'lead_id' => $leadId,
                        'page_id' => $pageId,
                        'form_id' => $formId,
                        'type' => 'meta_leads',
                    ]);
                } catch (\Throwable $e) {
                    $errors[] = $e->getMessage();
                    $integration->update([
                        'health' => 'error',
                        'last_error' => $e->getMessage(),
                    ]);
                    $this->finishLog($log, 'failed', $startedAt, [
                        'created' => 0,
                        'updated' => 0,
                        'skipped' => 0,
                        'lead_id' => $leadId,
                        'page_id' => $pageId,
                        'form_id' => $formId,
                        'error' => $e->getMessage(),
                    ], $e->getMessage());
                }
            }
        }

        return response()->json([
            'ok' => empty($errors),
            'result' => [
                'created' => $created,
                'updated' => $updated,
                'skipped' => $skipped,
                'errors' => $errors,
                'type' => 'meta_leads',
            ],
        ], empty($errors) ? 200 : 422);
    }

    public function verify(Request $request, string $provider, AccountIntegration $integration)
    {
        abort_unless($provider === 'meta-leads' && $integration->provider === $provider, 404);

        $token = (string) ($integration->config['webhook_verify_token'] ?? '');
        if ($token !== '' && hash_equals($token, (string) $request->query('hub_verify_token'))) {
            return response((string) $request->query('hub_challenge'), 200);
        }

        return response('Invalid verify token.', 403);
    }

    public function receive(Request $request, string $provider, AccountIntegration $integration)
    {
        abort_unless($integration->provider === $provider, 404);

        $startedAt = now();
        $log = AccountIntegrationSyncLog::create([
            'account_id' => $integration->account_id,
            'account_integration_id' => $integration->id,
            'provider' => $provider,
            'status' => 'running',
            'trigger' => 'webhook',
            'started_at' => $startedAt,
            'source_ip' => $request->ip(),
        ]);

        try {
            $payload = $request->all();
            $result = match ($provider) {
                'shopify' => $this->handleShopify($request, $integration, $payload),
                'woocommerce' => $this->handleWooCommerce($request, $integration, $payload),
                'meta-leads' => $this->handleMetaLeads($request, $integration, $payload),
                'razorpay-payments' => $this->handleRazorpayPayments($request, $integration, $payload),
                default => throw new \RuntimeException('Unsupported integration webhook provider.'),
            };

            $integration->update([
                'health' => 'healthy',
                'last_sync_at' => now(),
                'events_24h' => (int) ($integration->events_24h ?? 0) + 1,
                'last_error' => null,
            ]);

            $this->finishLog($log, 'success', $startedAt, $result);

            return response()->json(['ok' => true, 'result' => $result]);
        } catch (\Throwable $e) {
            $integration->update([
                'health' => 'error',
                'last_error' => $e->getMessage(),
            ]);
            $this->finishLog($log, 'failed', $startedAt, ['error' => $e->getMessage()], $e->getMessage());

            return response()->json(['ok' => false, 'message' => $e->getMessage()], 422);
        }
    }

    private function handleShopify(Request $request, AccountIntegration $integration, array $payload): array
    {
        $this->verifyShopifySignature($request, $integration);
        $topic = (string) $request->header('X-Shopify-Topic', '');

        if (str_starts_with($topic, 'products/')) {
            if (str_ends_with($topic, '/delete')) {
                return $this->deleteProduct($integration, 'shopify', (string) ($payload['id'] ?? ''));
            }

            return $this->upsertProduct($integration, 'shopify', $payload);
        }

        if (str_starts_with($topic, 'orders/')) {
            if (str_ends_with($topic, '/delete')) {
                return $this->deleteOrder($integration, 'shopify', (string) ($payload['id'] ?? ''));
            }

            return $this->upsertOrder($integration, 'shopify', [
                'order_number' => (string) ($payload['name'] ?? $payload['order_number'] ?? $payload['id']),
                'customer_name' => trim(($payload['customer']['first_name'] ?? '').' '.($payload['customer']['last_name'] ?? '')) ?: 'Shopify customer',
                'customer_phone' => $payload['phone'] ?? $payload['customer']['phone'] ?? null,
                'amount' => (int) round(((float) ($payload['total_price'] ?? 0)) * 100),
                'currency' => strtoupper((string) ($payload['currency'] ?? $integration->config['currency'] ?? 'INR')),
                'status' => $this->normalizeOrderStatus($payload['financial_status'] ?? $payload['fulfillment_status'] ?? null),
                'placed_at' => isset($payload['created_at']) ? Carbon::parse($payload['created_at']) : now(),
                'metadata' => $payload,
            ]);
        }

        return ['created' => 0, 'updated' => 0, 'skipped' => 1, 'topic' => $topic];
    }

    private function handleWooCommerce(Request $request, AccountIntegration $integration, array $payload): array
    {
        $this->verifyWooSignature($request, $integration);
        $topic = (string) ($request->header('X-WC-Webhook-Topic') ?: $request->header('X-WC-Webhook-Event'));
        $resource = (string) $request->header('X-WC-Webhook-Resource', '');

        if ($resource === 'product' || str_contains($topic, 'product')) {
            if (str_contains($topic, 'deleted')) {
                return $this->deleteProduct($integration, 'woocommerce', (string) ($payload['id'] ?? ''));
            }

            return $this->upsertProduct($integration, 'woocommerce', $payload);
        }

        if ($resource === 'order' || str_contains($topic, 'order')) {
            if (str_contains($topic, 'deleted')) {
                return $this->deleteOrder($integration, 'woocommerce', (string) ($payload['id'] ?? ''));
            }

            return $this->upsertOrder($integration, 'woocommerce', [
                'order_number' => (string) ($payload['number'] ?? $payload['id']),
                'customer_name' => trim(($payload['billing']['first_name'] ?? '').' '.($payload['billing']['last_name'] ?? '')) ?: 'WooCommerce customer',
                'customer_phone' => $payload['billing']['phone'] ?? null,
                'amount' => (int) round(((float) ($payload['total'] ?? 0)) * 100),
                'currency' => strtoupper((string) ($payload['currency'] ?? $integration->config['currency'] ?? 'INR')),
                'status' => $this->normalizeOrderStatus($payload['status'] ?? null),
                'placed_at' => isset($payload['date_created_gmt']) ? Carbon::parse($payload['date_created_gmt']) : now(),
                'metadata' => $payload,
            ]);
        }

        return ['created' => 0, 'updated' => 0, 'skipped' => 1, 'topic' => $topic];
    }

    private function handleMetaLeads(Request $request, AccountIntegration $integration, array $payload): array
    {
        $this->verifyMetaSignature($request, $integration);

        $created = 0;
        $updated = 0;
        $skipped = 0;
        foreach ($payload['entry'] ?? [] as $entry) {
            foreach ($entry['changes'] ?? [] as $change) {
                if (($change['field'] ?? null) !== 'leadgen') {
                    $skipped++;

                    continue;
                }

                $leadId = (string) ($change['value']['leadgen_id'] ?? '');
                if ($leadId === '') {
                    $skipped++;

                    continue;
                }

                $lead = $this->fetchMetaLead($integration, $leadId);
                $record = $this->upsertMetaLead($integration, $lead);
                app(MetaLeadIntakeService::class)->handle($integration, $record, $record->wasRecentlyCreated, 'meta_leads_webhook');
                $record->wasRecentlyCreated ? $created++ : $updated++;
            }
        }

        return ['created' => $created, 'updated' => $updated, 'skipped' => $skipped, 'type' => 'meta_leads'];
    }

    private function handleRazorpayPayments(Request $request, AccountIntegration $integration, array $payload): array
    {
        $this->verifyRazorpaySignature($request, $integration);

        $event = (string) ($payload['event'] ?? '');
        $paymentLink = $payload['payload']['payment_link']['entity'] ?? [];
        $payment = $payload['payload']['payment']['entity'] ?? [];
        $linkId = (string) ($paymentLink['id'] ?? $payment['payment_link_id'] ?? '');
        $referenceId = (string) ($paymentLink['reference_id'] ?? $payment['notes']['reference_id'] ?? '');

        if ($linkId === '' && $referenceId === '') {
            return ['created' => 0, 'updated' => 0, 'skipped' => 1, 'type' => 'razorpay_payment_link', 'event' => $event];
        }

        $query = AccountEcommerceOrder::where('account_id', $integration->account_id);
        $query->where(function ($orderQuery) use ($linkId, $referenceId) {
            if ($linkId !== '') {
                $orderQuery->orWhere('metadata->razorpay_payment_link->id', $linkId);
            }
            if ($referenceId !== '') {
                $orderQuery->orWhere('metadata->razorpay_payment_link->reference_id', $referenceId);
            }
        });

        $order = $query->first();
        if (! $order && preg_match('/^order_(\d+)_/', $referenceId, $matches)) {
            $order = AccountEcommerceOrder::where('account_id', $integration->account_id)
                ->whereKey((int) $matches[1])
                ->first();
        }

        if (! $order) {
            return ['created' => 0, 'updated' => 0, 'skipped' => 1, 'type' => 'razorpay_payment_link', 'event' => $event, 'link_id' => $linkId];
        }

        $status = (string) ($paymentLink['status'] ?? $payment['status'] ?? '');
        $paid = in_array($event, ['payment_link.paid', 'payment.captured'], true)
            || in_array($status, ['paid', 'captured'], true);
        $failed = in_array($event, ['payment.failed', 'payment_link.cancelled', 'payment_link.expired'], true)
            || in_array($status, ['cancelled', 'expired', 'failed'], true);

        $metadata = $order->metadata ?: [];
        $metadata['razorpay_last_webhook'] = [
            'event' => $event,
            'link_id' => $linkId ?: null,
            'payment_id' => $payment['id'] ?? null,
            'status' => $status ?: null,
            'received_at' => now()->toIso8601String(),
        ];

        if ($paid) {
            $order->update([
                'status' => 'paid',
                'recovery_status' => in_array($order->recovery_status, ['queued', 'sent', 'failed'], true) ? 'recovered' : $order->recovery_status,
                'recovered_at' => $order->recovered_at ?: now(),
                'metadata' => $metadata,
            ]);
            app(UsageService::class)->incrementRazorpayPaymentLinksPaid($order->account);

            return ['created' => 0, 'updated' => 1, 'skipped' => 0, 'type' => 'razorpay_payment_paid', 'order_id' => $order->id, 'event' => $event];
        }

        if ($failed) {
            $order->update([
                'recovery_status' => 'failed',
                'metadata' => $metadata,
            ]);

            return ['created' => 0, 'updated' => 1, 'skipped' => 0, 'type' => 'razorpay_payment_failed', 'order_id' => $order->id, 'event' => $event];
        }

        $order->update(['metadata' => $metadata]);

        return ['created' => 0, 'updated' => 1, 'skipped' => 0, 'type' => 'razorpay_payment_observed', 'order_id' => $order->id, 'event' => $event];
    }

    private function verifyShopifySignature(Request $request, AccountIntegration $integration): void
    {
        $secret = (string) ($integration->config['webhook_secret'] ?? '');
        if ($secret === '') {
            return;
        }

        $sent = (string) $request->header('X-Shopify-Hmac-Sha256', '');
        $calculated = base64_encode(hash_hmac('sha256', $request->getContent(), $secret, true));
        if ($sent === '' || ! hash_equals($calculated, $sent)) {
            throw new \RuntimeException('Invalid Shopify webhook signature.');
        }
    }

    private function verifyWooSignature(Request $request, AccountIntegration $integration): void
    {
        $secret = (string) ($integration->config['webhook_secret'] ?? '');
        if ($secret === '') {
            return;
        }

        $sent = (string) $request->header('X-WC-Webhook-Signature', '');
        $calculated = base64_encode(hash_hmac('sha256', $request->getContent(), $secret, true));
        if ($sent === '' || ! hash_equals($calculated, $sent)) {
            throw new \RuntimeException('Invalid WooCommerce webhook signature.');
        }
    }

    private function verifyMetaSignature(Request $request, AccountIntegration $integration): void
    {
        $secret = (string) ($integration->config['app_secret'] ?? '');
        if ($secret === '') {
            return;
        }

        $sent = (string) $request->header('X-Hub-Signature-256', '');
        $calculated = 'sha256='.hash_hmac('sha256', $request->getContent(), $secret);
        if ($sent === '' || ! hash_equals($calculated, $sent)) {
            throw new \RuntimeException('Invalid Meta webhook signature.');
        }
    }

    private function verifyMetaPlatformSignature(Request $request): void
    {
        $secret = (string) PlatformSetting::get('whatsapp.meta_app_secret', config('whatsapp.meta.app_secret'));
        if ($secret === '') {
            return;
        }

        $sent = (string) $request->header('X-Hub-Signature-256', '');
        $calculated = 'sha256='.hash_hmac('sha256', $request->getContent(), $secret);
        if ($sent === '' || ! hash_equals($calculated, $sent)) {
            throw new \RuntimeException('Invalid Meta webhook signature.');
        }
    }

    private function findMetaLeadIntegration(string $pageId, string $formId): ?AccountIntegration
    {
        return AccountIntegration::query()
            ->where('provider', 'meta-leads')
            ->whereIn('status', ['connected', 'configured'])
            ->get()
            ->first(function (AccountIntegration $integration) use ($pageId, $formId) {
                $config = $integration->config ?? [];
                $configuredPageId = (string) ($config['page_id'] ?? '');
                $configuredFormId = (string) ($config['form_id'] ?? '');

                if ($formId !== '' && $configuredFormId !== '' && $configuredFormId !== $formId) {
                    return false;
                }

                return $pageId !== '' && $configuredPageId === $pageId;
            });
    }

    private function verifyRazorpaySignature(Request $request, AccountIntegration $integration): void
    {
        $secret = $integration->secret('webhook_secret');
        if (! $secret) {
            return;
        }

        $sent = (string) $request->header('X-Razorpay-Signature', '');
        $calculated = hash_hmac('sha256', $request->getContent(), $secret);
        if ($sent === '' || ! hash_equals($calculated, $sent)) {
            throw new \RuntimeException('Invalid Razorpay webhook signature.');
        }
    }

    private function upsertProduct(AccountIntegration $integration, string $source, array $product): array
    {
        $variant = $product['variants'][0] ?? null;
        $externalId = (string) ($product['id'] ?? '');
        $sku = (string) ($variant['sku'] ?? $product['sku'] ?? $source.'-'.$externalId);
        $price = $variant['price'] ?? $product['price'] ?? 0;

        $record = AccountCatalogProduct::updateOrCreate(
            ['account_id' => $integration->account_id, 'sku' => $sku],
            [
                'name' => $product['title'] ?? $product['name'] ?? 'Product',
                'category' => $product['product_type'] ?? ($product['categories'][0]['name'] ?? null),
                'price' => (int) round(((float) $price) * 100),
                'currency' => strtoupper((string) ($product['currency'] ?? $integration->config['currency'] ?? 'INR')),
                'stock' => (int) ($variant['inventory_quantity'] ?? $product['stock_quantity'] ?? 0),
                'image_url' => $product['image']['src'] ?? $product['images'][0]['src'] ?? null,
                'description' => strip_tags((string) ($product['body_html'] ?? $product['description'] ?? '')),
                'status' => in_array(($product['status'] ?? 'active'), ['active', 'publish'], true) ? 'active' : 'draft',
                'metadata' => ['source' => $source, 'external_id' => $externalId, 'payload' => $product],
            ]
        );

        return ['created' => $record->wasRecentlyCreated ? 1 : 0, 'updated' => $record->wasRecentlyCreated ? 0 : 1, 'type' => 'product'];
    }

    private function deleteProduct(AccountIntegration $integration, string $source, string $externalId): array
    {
        if ($externalId === '') {
            return ['created' => 0, 'updated' => 0, 'skipped' => 1, 'type' => 'product'];
        }

        $updated = AccountCatalogProduct::where('account_id', $integration->account_id)
            ->where('metadata->source', $source)
            ->where('metadata->external_id', $externalId)
            ->update(['status' => 'archived']);

        return ['created' => 0, 'updated' => $updated, 'type' => 'product_deleted'];
    }

    private function upsertOrder(AccountIntegration $integration, string $source, array $data): array
    {
        $record = AccountEcommerceOrder::updateOrCreate(
            ['account_id' => $integration->account_id, 'order_number' => $source.'-'.$data['order_number']],
            [...$data, 'source' => $source]
        );

        return ['created' => $record->wasRecentlyCreated ? 1 : 0, 'updated' => $record->wasRecentlyCreated ? 0 : 1, 'type' => 'order'];
    }

    private function deleteOrder(AccountIntegration $integration, string $source, string $externalId): array
    {
        if ($externalId === '') {
            return ['created' => 0, 'updated' => 0, 'skipped' => 1, 'type' => 'order'];
        }

        $updated = AccountEcommerceOrder::where('account_id', $integration->account_id)
            ->where('order_number', $source.'-'.$externalId)
            ->update(['status' => 'cancelled']);

        return ['created' => 0, 'updated' => $updated, 'type' => 'order_deleted'];
    }

    private function fetchMetaLead(AccountIntegration $integration, string $leadId): array
    {
        $token = (string) ($integration->config['access_token'] ?? $integration->config['page_access_token'] ?? '');
        if ($token === '') {
            throw new \RuntimeException('Meta page access token is required.');
        }

        return Http::acceptJson()
            ->timeout(20)
            ->get($this->metaGraphUrl($leadId), [
                'access_token' => $token,
                'fields' => 'id,created_time,ad_id,ad_name,campaign_id,campaign_name,form_id,field_data,platform',
            ])
            ->throw()
            ->json();
    }

    private function upsertMetaLead(AccountIntegration $integration, array $lead): AccountMetaLead
    {
        $fields = collect($lead['field_data'] ?? [])->mapWithKeys(function ($field) {
            $name = Str::of((string) ($field['name'] ?? ''))->lower()->replace(' ', '_')->toString();

            return [$name => $field['values'][0] ?? null];
        });

        return AccountMetaLead::updateOrCreate(
            ['account_id' => $integration->account_id, 'external_id' => (string) $lead['id']],
            [
                'name' => $this->mappedLeadField($integration, $fields, 'name', ['full_name', 'name']) ?: 'Meta lead',
                'phone' => $this->mappedLeadField($integration, $fields, 'phone', ['phone_number', 'phone', 'mobile_number', 'mobile', 'whatsapp']),
                'email' => $this->mappedLeadField($integration, $fields, 'email', ['email', 'email_address']),
                'city' => $this->mappedLeadField($integration, $fields, 'city', ['city', 'location']),
                'stage' => 'new',
                'platform' => $this->normalizeLeadPlatform((string) ($lead['platform'] ?? $lead['platform_name'] ?? 'Facebook')),
                'form_name' => $integration->config['form_name'] ?? 'Meta lead form',
                'ad_name' => $lead['ad_name'] ?? null,
                'campaign_name' => $this->mappedLeadField($integration, $fields, 'campaign_name', ['campaign_name', 'campaign']),
                'source_type' => $this->mappedLeadField($integration, $fields, 'source_type', ['source', 'source_type']) ?: 'meta_lead_form',
                'auto_tags' => $this->configuredAutoTags($integration),
                'captured_at' => isset($lead['created_time']) ? Carbon::parse($lead['created_time']) : now(),
                'payload' => $lead,
            ]
        );
    }

    private function maybeCreateLeadContact(AccountIntegration $integration, AccountMetaLead $lead): ?WhatsAppContact
    {
        return app(MetaLeadIntakeService::class)->createOrUpdateContact($integration, $lead, 'meta_leads_webhook');
    }

    private function normalizeLeadPlatform(string $platform): string
    {
        $platform = strtolower(trim($platform));

        return str_contains($platform, 'instagram') ? 'Instagram' : 'Facebook';
    }

    private function mappedLeadField(AccountIntegration $integration, \Illuminate\Support\Collection $fields, string $target, array $fallbacks): ?string
    {
        $configured = (string) ($integration->config['map_'.$target] ?? '');
        $keys = collect(explode(',', $configured))
            ->map(fn ($key) => Str::of($key)->lower()->replace(' ', '_')->trim()->toString())
            ->filter()
            ->merge($fallbacks)
            ->unique()
            ->values();

        foreach ($keys as $key) {
            $value = $fields->get($key);
            if (is_scalar($value) && trim((string) $value) !== '') {
                return trim((string) $value);
            }
        }

        return null;
    }

    private function configuredAutoTags(AccountIntegration $integration): array
    {
        $tags = $integration->config['auto_tags'] ?? [];
        if (is_string($tags)) {
            $tags = explode(',', $tags);
        }

        return collect(is_array($tags) ? $tags : [])
            ->map(fn ($tag) => trim((string) $tag))
            ->filter()
            ->values()
            ->all();
    }

    private function normalizeOrderStatus(?string $status): string
    {
        return match ($status) {
            'paid', 'authorized', 'processing' => 'paid',
            'fulfilled', 'completed' => 'completed',
            'refunded' => 'refunded',
            'cancelled', 'canceled', 'voided' => 'cancelled',
            default => 'pending',
        };
    }

    private function metaGraphUrl(string $path): string
    {
        $baseUrl = rtrim((string) config('whatsapp.meta.base_url', 'https://graph.facebook.com'), '/');
        $version = trim((string) config('whatsapp.meta.api_version', 'v25.0'), '/');

        return $baseUrl.'/'.$version.'/'.ltrim($path, '/');
    }

    private function finishLog(AccountIntegrationSyncLog $log, string $status, Carbon $startedAt, array $result, ?string $error = null): void
    {
        $finishedAt = now();
        $log->update([
            'status' => $status,
            'finished_at' => $finishedAt,
            'duration_ms' => $startedAt->diffInMilliseconds($finishedAt),
            'created_count' => (int) ($result['created'] ?? 0),
            'updated_count' => (int) ($result['updated'] ?? 0),
            'skipped_count' => (int) ($result['skipped'] ?? 0),
            'error_count' => $status === 'failed' ? 1 : (int) ($result['errors'] ?? 0),
            'summary' => $result,
            'error_message' => $error,
        ]);
    }
}
