<?php

namespace App\Jobs;

use App\Models\AccountAppointment;
use App\Models\AccountCatalogProduct;
use App\Models\AccountEcommerceOrder;
use App\Models\AccountIntegration;
use App\Models\AccountIntegrationSyncLog;
use App\Models\AccountMetaLead;
use App\Modules\Contacts\Models\ContactTag;
use App\Modules\WhatsApp\Models\WhatsAppConnection;
use App\Modules\WhatsApp\Models\WhatsAppContact;
use App\Services\MetaLeadIntakeService;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Str;

class SyncAccountIntegration implements ShouldQueue
{
    use Queueable;

    public function __construct(
        public int $integrationId,
        public string $trigger = 'manual',
        public ?int $initiatedBy = null,
        public ?string $sourceIp = null,
    ) {}

    public function handle(): array
    {
        $integration = AccountIntegration::findOrFail($this->integrationId);
        $startedAt = now();
        $log = AccountIntegrationSyncLog::create([
            'account_id' => $integration->account_id,
            'account_integration_id' => $integration->id,
            'initiated_by' => $this->initiatedBy,
            'provider' => $integration->provider,
            'status' => 'running',
            'trigger' => $this->trigger,
            'started_at' => $startedAt,
            'source_ip' => $this->sourceIp,
        ]);

        try {
            $result = match ($integration->provider) {
                'shopify' => $this->syncShopify($integration),
                'woocommerce' => $this->syncWooCommerce($integration),
                'meta-catalog' => $this->syncMetaCatalog($integration),
                'meta-leads' => $this->syncMetaLeads($integration),
                'google-sheets' => $this->syncGoogleSheets($integration),
                'google-calendar' => $this->syncGoogleCalendar($integration),
                default => throw new \RuntimeException('This provider does not have an import sync handler.'),
            };

            $integration->update([
                'health' => 'healthy',
                'last_sync_at' => now(),
                'events_24h' => (int) ($result['created'] ?? 0) + (int) ($result['updated'] ?? 0),
                'last_error' => null,
            ]);

            $this->finishLog($log, 'success', $startedAt, $result);

            return $result;
        } catch (\Throwable $e) {
            $integration->update([
                'health' => 'error',
                'last_error' => $e->getMessage(),
            ]);
            $this->finishLog($log, 'failed', $startedAt, [
                'error' => $e->getMessage(),
            ], $e->getMessage());

            throw $e;
        }
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

    private function syncShopify(AccountIntegration $integration): array
    {
        $storeUrl = $this->normalStoreUrl($integration->config['store_url'] ?? null);
        $token = (string) ($integration->secret('access_token') ?? $integration->configValue('access_token', ''));
        $this->requireConfig($storeUrl, 'Shopify store URL is required.');
        $this->requireConfig($token, 'Shopify admin access token is required.');

        $client = Http::withHeaders(['X-Shopify-Access-Token' => $token])->acceptJson()->timeout(25);
        $products = $client->get($storeUrl.'/admin/api/2025-01/products.json', ['limit' => 50])->throw()->json('products', []);
        $orders = $client->get($storeUrl.'/admin/api/2025-01/orders.json', ['limit' => 50, 'status' => 'any'])->throw()->json('orders', []);

        return [
            ...$this->upsertProducts($integration, $products, 'shopify'),
            ...$this->upsertShopifyOrders($integration, $orders),
        ];
    }

    private function syncWooCommerce(AccountIntegration $integration): array
    {
        $storeUrl = $this->normalStoreUrl($integration->config['store_url'] ?? null);
        $consumerKey = (string) ($integration->config['consumer_key'] ?? '');
        $consumerSecret = (string) ($integration->config['consumer_secret'] ?? '');
        $this->requireConfig($storeUrl, 'WooCommerce store URL is required.');
        $this->requireConfig($consumerKey, 'WooCommerce consumer key is required.');
        $this->requireConfig($consumerSecret, 'WooCommerce consumer secret is required.');

        $client = Http::acceptJson()->timeout(25)->withBasicAuth($consumerKey, $consumerSecret);
        $products = $client->get($storeUrl.'/wp-json/wc/v3/products', ['per_page' => 50])->throw()->json();
        $orders = $client->get($storeUrl.'/wp-json/wc/v3/orders', ['per_page' => 50])->throw()->json();

        return [
            ...$this->upsertProducts($integration, is_array($products) ? $products : [], 'woocommerce'),
            ...$this->upsertWooCommerceOrders($integration, is_array($orders) ? $orders : []),
        ];
    }

    private function syncMetaCatalog(AccountIntegration $integration): array
    {
        $catalogId = trim((string) ($integration->config['catalog_id'] ?? ''));
        $this->requireConfig($catalogId, 'Meta catalog ID is required.');

        $token = (string) ($integration->config['access_token'] ?? '');
        if ($token === '') {
            $token = (string) optional(
                WhatsAppConnection::where('account_id', $integration->account_id)
                    ->where('is_active', true)
                    ->orderByDesc('updated_at')
                    ->first()
            )->access_token;
        }
        $this->requireConfig($token, 'Meta catalog access token is required. Add it to the integration or reconnect the WABA.');

        $products = Http::acceptJson()
            ->timeout(25)
            ->get($this->metaGraphUrl($catalogId.'/products'), [
                'access_token' => $token,
                'fields' => 'id,retailer_id,name,description,availability,condition,price,currency,image_url,url,brand,category',
                'limit' => 100,
            ])
            ->throw()
            ->json('data', []);

        return $this->upsertProducts($integration, is_array($products) ? $products : [], 'meta-catalog');
    }

    private function syncMetaLeads(AccountIntegration $integration): array
    {
        $token = (string) ($integration->config['access_token'] ?? $integration->config['page_access_token'] ?? '');
        $this->requireConfig($token, 'Meta page access token is required.');

        $forms = $this->metaLeadFormsToSync($integration);
        if (empty($forms)) {
            $forms = $this->fetchMetaLeadForms($integration, $token);
        }
        if (empty($forms)) {
            throw new \RuntimeException('No Meta lead forms found for the connected Facebook Page. Check page permissions or select a lead form.');
        }

        $created = 0;
        $updated = 0;
        $syncedForms = 0;
        foreach ($forms as $form) {
            $formId = (string) ($form['id'] ?? '');
            if ($formId === '') {
                continue;
            }

            $leads = Http::acceptJson()
                ->timeout(25)
                ->get($this->metaGraphUrl($formId.'/leads'), [
                    'access_token' => $token,
                    'fields' => 'id,created_time,ad_id,ad_name,campaign_id,campaign_name,form_id,field_data,platform',
                    'limit' => 100,
                ])
                ->throw()
                ->json('data', []);

            $syncedForms++;
            foreach ($leads as $lead) {
                $record = $this->upsertMetaLead($integration, $lead, (string) ($form['name'] ?? $integration->config['form_name'] ?? 'Meta lead form'));
                app(MetaLeadIntakeService::class)->handle($integration, $record, $record->wasRecentlyCreated, 'meta_leads_sync');
                $record->wasRecentlyCreated ? $created++ : $updated++;
            }
        }

        return ['created' => $created, 'updated' => $updated, 'forms' => $syncedForms, 'type' => 'meta_leads'];
    }

    private function metaLeadFormsToSync(AccountIntegration $integration): array
    {
        $formId = (string) ($integration->config['form_id'] ?? '');
        if ($formId !== '') {
            return [[
                'id' => $formId,
                'name' => (string) ($integration->config['form_name'] ?? 'Meta lead form'),
            ]];
        }

        $forms = $integration->config['lead_forms'] ?? [];
        if (! is_array($forms)) {
            return [];
        }

        return collect($forms)
            ->map(fn (array $form) => [
                'id' => (string) ($form['id'] ?? ''),
                'name' => (string) ($form['name'] ?? 'Meta lead form'),
            ])
            ->filter(fn (array $form) => $form['id'] !== '')
            ->values()
            ->all();
    }

    private function fetchMetaLeadForms(AccountIntegration $integration, string $token): array
    {
        $pageId = (string) ($integration->config['page_id'] ?? '');
        if ($pageId === '') {
            return [];
        }

        $forms = Http::withToken($token)
            ->acceptJson()
            ->timeout(25)
            ->get($this->metaGraphUrl($pageId.'/leadgen_forms'), [
                'fields' => 'id,name,status,leads_count,created_time',
                'limit' => 100,
            ])
            ->throw()
            ->json('data', []);

        if (! empty($forms)) {
            $config = $integration->config ?? [];
            $config['lead_forms'] = $forms;
            $integration->forceFill(['config' => $config])->save();
        }

        return collect($forms)
            ->map(fn (array $form) => [
                'id' => (string) ($form['id'] ?? ''),
                'name' => (string) ($form['name'] ?? 'Meta lead form'),
            ])
            ->filter(fn (array $form) => $form['id'] !== '')
            ->values()
            ->all();
    }

    private function upsertMetaLead(AccountIntegration $integration, array $lead, string $formName): AccountMetaLead
    {
        $fields = collect($lead['field_data'] ?? [])->mapWithKeys(function ($field) {
            $name = Str::of((string) ($field['name'] ?? ''))->lower()->replace(' ', '_')->toString();

            return [$name => $field['values'][0] ?? null];
        });

        $record = AccountMetaLead::updateOrCreate(
            ['account_id' => $integration->account_id, 'external_id' => (string) $lead['id']],
            [
                'name' => $this->mappedLeadField($integration, $fields, 'name', ['full_name', 'name']) ?: 'Meta lead',
                'phone' => $this->mappedLeadField($integration, $fields, 'phone', ['phone_number', 'phone', 'mobile_number', 'mobile', 'whatsapp']),
                'email' => $this->mappedLeadField($integration, $fields, 'email', ['email', 'email_address']),
                'city' => $this->mappedLeadField($integration, $fields, 'city', ['city', 'location']),
                'stage' => 'new',
                'platform' => $this->normalizeLeadPlatform((string) ($lead['platform'] ?? $lead['platform_name'] ?? 'Facebook')),
                'form_name' => $formName,
                'ad_name' => $lead['ad_name'] ?? null,
                'campaign_name' => $lead['campaign_name'] ?? $this->mappedLeadField($integration, $fields, 'campaign_name', ['campaign_name', 'campaign']),
                'source_type' => $this->mappedLeadField($integration, $fields, 'source_type', ['source', 'source_type']) ?: 'meta_lead_form',
                'auto_tags' => $this->configuredAutoTags($integration),
                'captured_at' => isset($lead['created_time']) ? Carbon::parse($lead['created_time']) : now(),
                'payload' => [
                    ...$lead,
                    'normalized_fields' => $fields->all(),
                ],
            ]
        );

        if ((bool) ($integration->config['auto_create_contact'] ?? false)) {
            $this->upsertLeadContact($integration, $record);
        }

        return $record;
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

    private function syncGoogleSheets(AccountIntegration $integration): array
    {
        $token = $this->googleAccessToken($integration);
        $spreadsheetId = (string) ($integration->config['spreadsheet_id'] ?? '');
        $sheetName = trim((string) ($integration->config['sheet_name'] ?? 'Sheet1')) ?: 'Sheet1';
        $range = trim((string) ($integration->config['range'] ?? 'A1:Z1000')) ?: 'A1:Z1000';
        $this->requireConfig($spreadsheetId, 'Google spreadsheet ID is required.');

        $values = Http::withToken($token)
            ->acceptJson()
            ->timeout(25)
            ->get('https://sheets.googleapis.com/v4/spreadsheets/'.$spreadsheetId.'/values/'.rawurlencode($sheetName.'!'.$range))
            ->throw()
            ->json('values', []);

        if (count($values) < 2) {
            return ['created' => 0, 'updated' => 0, 'skipped' => 0, 'type' => 'contacts', 'sheet' => $sheetName];
        }

        $headers = array_map(fn ($header) => $this->normalizeFieldKey((string) $header), $values[0] ?? []);
        $created = 0;
        $updated = 0;
        $skipped = 0;

        foreach (array_slice($values, 1) as $row) {
            $data = array_combine($headers, array_pad($row, count($headers), null)) ?: [];
            $phone = preg_replace('/\D+/', '', (string) $this->mappedSheetField($integration, $data, 'phone', ['phone', 'mobile', 'whatsapp', 'phone_number']));
            if ($phone === '') {
                $skipped++;
                continue;
            }

            $contact = WhatsAppContact::withTrashed()->firstOrNew(['account_id' => $integration->account_id, 'wa_id' => $phone]);
            $contact->fill([
                'name' => $this->mappedSheetField($integration, $data, 'name', ['name', 'full_name', 'first_name']) ?: $phone,
                'phone' => $this->mappedSheetField($integration, $data, 'phone', ['phone', 'mobile', 'whatsapp', 'phone_number']) ?: $phone,
                'email' => $this->mappedSheetField($integration, $data, 'email', ['email', 'email_address']) ?: null,
                'status' => 'active',
                'source' => 'google_sheets',
                'metadata' => [
                    ...($contact->metadata ?: []),
                    'sheet_row' => $data,
                    'spreadsheet_id' => $spreadsheetId,
                    'sheet_name' => $sheetName,
                ],
            ])->save();
            if (method_exists($contact, 'restore') && $contact->trashed()) {
                $contact->restore();
            }
            foreach ($this->configuredAutoTags($integration) as $tagName) {
                $tag = ContactTag::firstOrCreate(
                    ['account_id' => $integration->account_id, 'name' => $tagName],
                    ['color' => '#10b981']
                );
                $contact->tags()->syncWithoutDetaching([$tag->id]);
            }
            $contact->wasRecentlyCreated ? $created++ : $updated++;
        }

        return ['created' => $created, 'updated' => $updated, 'skipped' => $skipped, 'type' => 'contacts', 'sheet' => $sheetName];
    }

    private function syncGoogleCalendar(AccountIntegration $integration): array
    {
        $token = $this->googleAccessToken($integration);
        $calendarId = (string) ($integration->config['calendar_id'] ?? 'primary');

        $timeMin = Carbon::parse($integration->config['time_min'] ?? now()->subDays(7))->toRfc3339String();
        $events = Http::withToken($token)
            ->acceptJson()
            ->timeout(25)
            ->get('https://www.googleapis.com/calendar/v3/calendars/'.rawurlencode($calendarId).'/events', [
                'singleEvents' => 'true',
                'orderBy' => 'startTime',
                'timeMin' => $timeMin,
                'maxResults' => 100,
            ])
            ->throw()
            ->json('items', []);

        $created = 0;
        $updated = 0;
        foreach ($events as $event) {
            $externalId = (string) ($event['id'] ?? '');
            if ($externalId === '') {
                continue;
            }
            $start = $event['start']['dateTime'] ?? $event['start']['date'] ?? null;
            $end = $event['end']['dateTime'] ?? $event['end']['date'] ?? null;
            $startsAt = $start ? Carbon::parse($start) : now();
            $endsAt = $end ? Carbon::parse($end) : $startsAt->copy()->addMinutes(30);
            $duration = max(5, $startsAt->diffInMinutes($endsAt) ?: 30);
            $attendee = collect($event['attendees'] ?? [])->firstWhere('responseStatus', 'accepted') ?: ($event['attendees'][0] ?? []);

            $record = AccountAppointment::updateOrCreate(
                ['account_id' => $integration->account_id, 'external_source' => 'google_calendar', 'external_id' => $externalId],
                [
                    'title' => '[Google] '.($event['summary'] ?? $externalId),
                    'contact_name' => $attendee['displayName'] ?? $attendee['email'] ?? 'Google Calendar',
                    'contact_phone' => null,
                    'scheduled_at' => $startsAt,
                    'duration_minutes' => $duration,
                    'staff_name' => $event['organizer']['email'] ?? null,
                    'status' => $this->googleEventStatus($event),
                    'type' => 'Google Calendar',
                    'location' => $event['location'] ?? null,
                    'meeting_url' => $event['hangoutLink'] ?? $event['conferenceData']['entryPoints'][0]['uri'] ?? null,
                    'description' => isset($event['description']) ? Str::limit(strip_tags((string) $event['description']), 2000, '') : null,
                    'reminder_enabled' => false,
                    'metadata' => [
                        'calendar_id' => $calendarId,
                        'html_link' => $event['htmlLink'] ?? null,
                        'creator' => $event['creator'] ?? null,
                        'attendees' => $event['attendees'] ?? [],
                    ],
                ]
            );
            $record->wasRecentlyCreated ? $created++ : $updated++;
        }

        return ['created' => $created, 'updated' => $updated, 'type' => 'appointments'];
    }

    private function upsertProducts(AccountIntegration $integration, array $products, string $source): array
    {
        $created = 0;
        $updated = 0;
        foreach ($products as $product) {
            $variant = $product['variants'][0] ?? null;
            $sku = (string) ($product['retailer_id'] ?? $variant['sku'] ?? $product['sku'] ?? $source.'-'.$product['id']);
            $price = $variant['price'] ?? $product['price'] ?? 0;
            $priceValue = is_numeric($price)
                ? (float) $price
                : (float) preg_replace('/[^\d.]/', '', (string) $price);
            $priceMinor = $priceValue > 1000
                ? (int) round($priceValue)
                : (int) round($priceValue * 100);
            $status = strtolower((string) ($product['status'] ?? $product['availability'] ?? 'active'));
            $record = AccountCatalogProduct::updateOrCreate(
                ['account_id' => $integration->account_id, 'sku' => $sku],
                [
                    'name' => $product['title'] ?? $product['name'] ?? 'Product',
                    'category' => $product['product_type'] ?? $product['category'] ?? ($product['categories'][0]['name'] ?? null),
                    'price' => $priceMinor,
                    'currency' => strtoupper((string) ($product['currency'] ?? $integration->config['currency'] ?? 'INR')),
                    'stock' => (int) ($variant['inventory_quantity'] ?? $product['stock_quantity'] ?? 0),
                    'image_url' => $product['image_url'] ?? $product['image']['src'] ?? $product['images'][0]['src'] ?? null,
                    'description' => strip_tags((string) ($product['body_html'] ?? $product['description'] ?? '')),
                    'status' => in_array($status, ['active', 'publish', 'in stock', 'available'], true) ? 'active' : 'draft',
                    'metadata' => [
                        'source' => $source,
                        'external_id' => $product['id'] ?? null,
                        'catalog_id' => $source === 'meta-catalog' ? ($integration->config['catalog_id'] ?? null) : ($product['catalog_id'] ?? null),
                        'product_retailer_id' => $product['retailer_id'] ?? $sku,
                        'payload' => $product,
                    ],
                ]
            );
            $record->wasRecentlyCreated ? $created++ : $updated++;
        }

        return ['products_created' => $created, 'products_updated' => $updated, 'created' => $created, 'updated' => $updated];
    }

    private function upsertShopifyOrders(AccountIntegration $integration, array $orders): array
    {
        return $this->upsertOrders($integration, $orders, 'shopify', fn ($order) => [
            'order_number' => (string) ($order['name'] ?? $order['order_number'] ?? $order['id']),
            'customer_name' => trim(($order['customer']['first_name'] ?? '').' '.($order['customer']['last_name'] ?? '')) ?: 'Shopify customer',
            'customer_phone' => $order['phone'] ?? $order['customer']['phone'] ?? null,
            'amount' => (int) round(((float) ($order['total_price'] ?? 0)) * 100),
            'status' => $this->normalizeOrderStatus($order['financial_status'] ?? $order['fulfillment_status'] ?? null),
            'placed_at' => isset($order['created_at']) ? Carbon::parse($order['created_at']) : now(),
            'metadata' => $order,
        ]);
    }

    private function upsertWooCommerceOrders(AccountIntegration $integration, array $orders): array
    {
        return $this->upsertOrders($integration, $orders, 'woocommerce', fn ($order) => [
            'order_number' => (string) ($order['number'] ?? $order['id']),
            'customer_name' => trim(($order['billing']['first_name'] ?? '').' '.($order['billing']['last_name'] ?? '')) ?: 'WooCommerce customer',
            'customer_phone' => $order['billing']['phone'] ?? null,
            'amount' => (int) round(((float) ($order['total'] ?? 0)) * 100),
            'status' => $this->normalizeOrderStatus($order['status'] ?? null),
            'placed_at' => isset($order['date_created_gmt']) ? Carbon::parse($order['date_created_gmt']) : now(),
            'metadata' => $order,
        ]);
    }

    private function upsertOrders(AccountIntegration $integration, array $orders, string $source, callable $mapper): array
    {
        $created = 0;
        $updated = 0;
        foreach ($orders as $order) {
            $data = $mapper($order);
            $record = AccountEcommerceOrder::updateOrCreate(
                ['account_id' => $integration->account_id, 'order_number' => $source.'-'.$data['order_number']],
                [...$data, 'source' => $source]
            );
            $record->wasRecentlyCreated ? $created++ : $updated++;
        }

        return ['orders_created' => $created, 'orders_updated' => $updated];
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

    private function upsertLeadContact(AccountIntegration $integration, AccountMetaLead $lead): ?WhatsAppContact
    {
        return app(MetaLeadIntakeService::class)->createOrUpdateContact($integration, $lead, 'meta_leads_sync');
    }

    private function mappedSheetField(AccountIntegration $integration, array $data, string $target, array $fallbacks): ?string
    {
        $configured = (string) ($integration->config['map_'.$target] ?? '');
        $keys = collect(explode(',', $configured))
            ->map(fn ($key) => $this->normalizeFieldKey($key))
            ->filter()
            ->merge($fallbacks)
            ->map(fn ($key) => $this->normalizeFieldKey($key))
            ->unique()
            ->values();

        foreach ($keys as $key) {
            $value = $data[$key] ?? null;
            if (is_scalar($value) && trim((string) $value) !== '') {
                return trim((string) $value);
            }
        }

        return null;
    }

    private function normalizeFieldKey(string $value): string
    {
        return Str::of($value)->lower()->replace([' ', '-'], '_')->replaceMatches('/[^a-z0-9_]/', '')->trim('_')->toString();
    }

    private function googleEventStatus(array $event): string
    {
        return match ((string) ($event['status'] ?? 'confirmed')) {
            'cancelled' => 'cancelled',
            default => 'scheduled',
        };
    }

    private function normalStoreUrl(?string $url): string
    {
        $url = trim((string) $url);
        if ($url !== '' && ! str_starts_with($url, 'http://') && ! str_starts_with($url, 'https://')) {
            $url = 'https://'.$url;
        }

        return rtrim($url, '/');
    }

    private function requireConfig(?string $value, string $message): void
    {
        if (trim((string) $value) === '') {
            throw new \RuntimeException($message);
        }
    }

    private function googleAccessToken(AccountIntegration $integration): string
    {
        $token = (string) ($integration->config['access_token'] ?? '');
        $expiresAt = isset($integration->config['expires_at'])
            ? Carbon::parse($integration->config['expires_at'])
            : null;

        if ($token !== '' && (! $expiresAt || $expiresAt->isFuture())) {
            return $token;
        }

        $refreshToken = (string) ($integration->config['refresh_token'] ?? '');
        $this->requireConfig($refreshToken, 'Google refresh token is required. Reconnect Google from Integrations.');
        $this->requireConfig(config('services.google.client_id'), 'Google client ID is not configured.');
        $this->requireConfig(config('services.google.client_secret'), 'Google client secret is not configured.');

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
        $this->requireConfig($newToken, 'Google did not return a refreshed access token.');

        $integration->update([
            'config' => [
                ...($integration->config ?? []),
                'access_token' => $newToken,
                'expires_at' => now()->addSeconds((int) ($response['expires_in'] ?? 3600))->toIso8601String(),
            ],
        ]);

        return $newToken;
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
}
