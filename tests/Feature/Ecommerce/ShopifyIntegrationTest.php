<?php

namespace Tests\Feature\Ecommerce;

use App\Models\Account;
use App\Models\ShopifyIntegration;
use App\Models\User;
use App\Modules\Broadcasts\Jobs\SendSequenceStepJob;
use App\Modules\Broadcasts\Models\CampaignSequence;
use App\Modules\Broadcasts\Models\CampaignSequenceEnrollment;
use App\Modules\Broadcasts\Models\CampaignSequenceStep;
use App\Modules\Ecommerce\Models\EcommerceOrder;
use App\Modules\Ecommerce\Models\EcommerceProduct;
use App\Modules\WhatsApp\Models\WhatsAppConnection;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Queue;
use Tests\TestCase;

class ShopifyIntegrationTest extends TestCase
{
    use RefreshDatabase;

    protected function createOwnedAccount(): Account
    {
        $owner = User::factory()->create();
        $account = Account::factory()->create([
            'owner_id' => $owner->id,
        ]);
        $account->users()->attach($owner->id, ['role' => 'owner']);

        return $account->fresh();
    }

    protected function shopifyHeaders(string $secret, string $payload, string $topic = 'orders/create', string $shop = 'demo-shop.myshopify.com', string $eventId = 'evt-1'): array
    {
        return [
            'CONTENT_TYPE' => 'application/json',
            'HTTP_X_SHOPIFY_HMAC_SHA256' => base64_encode(hash_hmac('sha256', $payload, $secret, true)),
            'HTTP_X_SHOPIFY_TOPIC' => $topic,
            'HTTP_X_SHOPIFY_SHOP_DOMAIN' => $shop,
            'HTTP_X_SHOPIFY_EVENT_ID' => $eventId,
        ];
    }

    public function test_owner_can_create_shopify_integration(): void
    {
        $this->withoutMiddleware();

        Http::fake([
            'https://demo-shop.myshopify.com/admin/api/2025-10/shop.json' => Http::response([
                'shop' => ['name' => 'Demo Shop'],
            ], 200),
            'https://demo-shop.myshopify.com/admin/api/2025-10/webhooks.json' => Http::sequence()
                ->push(['webhooks' => []], 200)
                ->push(['webhook' => ['id' => 1]], 201)
                ->push(['webhook' => ['id' => 2]], 201)
                ->push(['webhook' => ['id' => 3]], 201),
        ]);

        $account = $this->createOwnedAccount();
        $owner = $account->owner;

        $this->actingAs($owner)
            ->withSession(['current_account_id' => $account->id])
            ->post(route('app.ecommerce.shopify.store'), [
                'name' => 'Main Shopify',
                'shop_domain' => 'demo-shop.myshopify.com',
                'access_token' => 'shpat_test',
                'webhook_secret' => 'secret123',
                'auto_register_webhooks' => true,
            ])
            ->assertRedirect();

        $this->assertDatabaseHas('shopify_integrations', [
            'account_id' => $account->id,
            'name' => 'Main Shopify',
            'shop_domain' => 'demo-shop.myshopify.com',
            'shop_name' => 'Demo Shop',
        ]);
    }

    public function test_order_webhook_syncs_contact_product_and_order(): void
    {
        $account = $this->createOwnedAccount();
        $integration = ShopifyIntegration::create([
            'account_id' => $account->id,
            'name' => 'Main Shopify',
            'shop_domain' => 'demo-shop.myshopify.com',
            'access_token' => 'shpat_test',
            'webhook_secret' => 'secret123',
            'is_active' => true,
            'webhook_topics' => ['orders/create'],
        ]);

        $payload = json_encode([
            'id' => 901,
            'name' => '#901',
            'order_number' => 901,
            'financial_status' => 'paid',
            'currency' => 'INR',
            'phone' => '+91 94106 50131',
            'email' => 'buyer@example.com',
            'customer' => [
                'id' => 55,
                'first_name' => 'Prashant',
                'last_name' => 'Pandey',
                'email' => 'buyer@example.com',
            ],
            'line_items' => [[
                'product_id' => 601,
                'variant_id' => 777,
                'name' => 'Demo Product',
                'quantity' => 2,
                'price' => '499.00',
                'sku' => 'DP-1',
            ]],
            'total_price' => '998.00',
            'created_at' => now()->toIso8601String(),
        ], JSON_THROW_ON_ERROR);

        $response = $this->call('POST', route('hooks.shopify.handle', ['integration' => $integration->id]), [], [], [], $this->shopifyHeaders('secret123', $payload), $payload);

        $response->assertOk()->assertJson(['ok' => true]);

        $this->assertDatabaseHas('whatsapp_contacts', [
            'account_id' => $account->id,
            'wa_id' => '919410650131',
            'email' => 'buyer@example.com',
            'source' => 'shopify',
        ]);
        $this->assertDatabaseHas('ecommerce_products', [
            'account_id' => $account->id,
            'name' => 'Demo Product',
            'external_source' => 'shopify',
            'external_id' => '601',
        ]);
        $this->assertDatabaseHas('ecommerce_orders', [
            'account_id' => $account->id,
            'source' => 'shopify',
            'external_source' => 'shopify',
            'external_id' => '901',
            'status' => 'paid',
        ]);
    }

    public function test_abandoned_checkout_webhook_enrolls_sequence(): void
    {
        Queue::fake();

        $account = $this->createOwnedAccount();
        $connection = WhatsAppConnection::factory()->create([
            'account_id' => $account->id,
            'is_active' => true,
            'activation_state' => 'active',
        ]);
        $sequence = CampaignSequence::create([
            'account_id' => $account->id,
            'whatsapp_connection_id' => $connection->id,
            'created_by' => $account->owner_id,
            'name' => 'Abandoned cart',
            'status' => 'draft',
            'audience_type' => 'custom',
        ]);
        CampaignSequenceStep::create([
            'campaign_sequence_id' => $sequence->id,
            'step_order' => 1,
            'delay_minutes' => 0,
            'type' => 'text',
            'message_text' => 'You left something behind.',
        ]);

        $integration = ShopifyIntegration::create([
            'account_id' => $account->id,
            'name' => 'Main Shopify',
            'shop_domain' => 'demo-shop.myshopify.com',
            'access_token' => 'shpat_test',
            'webhook_secret' => 'secret123',
            'is_active' => true,
            'abandoned_checkout_sequence_id' => $sequence->id,
            'webhook_topics' => ['checkouts/update'],
        ]);

        $payload = json_encode([
            'id' => 3001,
            'token' => 'checkout-3001',
            'email' => 'lead@example.com',
            'phone' => '+91 99999 00011',
            'abandoned_checkout_url' => 'https://demo-shop.myshopify.com/123',
            'line_items' => [['title' => 'Cart Item', 'quantity' => 1]],
            'billing_address' => ['first_name' => 'Lead', 'last_name' => 'One'],
        ], JSON_THROW_ON_ERROR);

        $response = $this->call('POST', route('hooks.shopify.handle', ['integration' => $integration->id]), [], [], [], $this->shopifyHeaders('secret123', $payload, 'checkouts/update', 'demo-shop.myshopify.com', 'evt-checkout-1'), $payload);

        $response->assertOk()->assertJson(['ok' => true]);

        $this->assertDatabaseHas('whatsapp_contacts', [
            'account_id' => $account->id,
            'wa_id' => '919999900011',
            'source' => 'shopify',
        ]);
        $this->assertDatabaseHas('campaign_sequence_enrollments', [
            'campaign_sequence_id' => $sequence->id,
            'wa_id' => '919999900011',
            'status' => 'active',
        ]);
        Queue::assertPushed(SendSequenceStepJob::class);
    }

    public function test_sync_recent_data_imports_customers_and_orders(): void
    {
        $this->withoutMiddleware();

        Http::fake([
            'https://demo-shop.myshopify.com/admin/api/2025-10/customers.json*' => Http::response([
                'customers' => [[
                    'id' => 501,
                    'first_name' => 'Riya',
                    'last_name' => 'Sharma',
                    'email' => 'riya@example.com',
                    'phone' => '+91 99999 00022',
                ]],
            ], 200),
            'https://demo-shop.myshopify.com/admin/api/2025-10/orders.json*' => Http::response([
                'orders' => [[
                    'id' => 801,
                    'name' => '#801',
                    'order_number' => 801,
                    'currency' => 'INR',
                    'financial_status' => 'pending',
                    'phone' => '+91 99999 00022',
                    'customer' => [
                        'id' => 501,
                        'first_name' => 'Riya',
                        'last_name' => 'Sharma',
                        'email' => 'riya@example.com',
                    ],
                    'line_items' => [[
                        'product_id' => 701,
                        'name' => 'Imported Product',
                        'quantity' => 1,
                        'price' => '199.00',
                    ]],
                    'total_price' => '199.00',
                    'created_at' => now()->toIso8601String(),
                ]],
            ], 200),
        ]);

        $account = $this->createOwnedAccount();
        $owner = $account->owner;
        $integration = ShopifyIntegration::create([
            'account_id' => $account->id,
            'name' => 'Main Shopify',
            'shop_domain' => 'demo-shop.myshopify.com',
            'access_token' => 'shpat_test',
            'webhook_secret' => 'secret123',
            'is_active' => true,
            'webhook_topics' => ['customers/create', 'orders/create'],
        ]);

        $this->actingAs($owner)
            ->withSession(['current_account_id' => $account->id])
            ->post(route('app.ecommerce.shopify.sync', ['id' => $integration->id]))
            ->assertRedirect();

        $this->assertDatabaseHas('whatsapp_contacts', [
            'account_id' => $account->id,
            'wa_id' => '919999900022',
            'name' => 'Riya Sharma',
        ]);
        $this->assertDatabaseHas('ecommerce_orders', [
            'account_id' => $account->id,
            'external_id' => '801',
            'source' => 'shopify',
        ]);
    }
}
