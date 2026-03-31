<?php

namespace App\Modules\Ecommerce\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\ShopifyIntegration;
use App\Modules\Broadcasts\Models\CampaignSequence;
use App\Modules\Ecommerce\Models\EcommerceOrder;
use App\Modules\Ecommerce\Models\EcommerceProduct;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class EcommerceController extends Controller
{
    public function index(Request $request): Response
    {
        $account = $request->attributes->get('account') ?? current_account();

        $productsCount = EcommerceProduct::query()
            ->where('account_id', $account->id)
            ->count();

        $activeProductsCount = EcommerceProduct::query()
            ->where('account_id', $account->id)
            ->where('status', 'active')
            ->count();

        $ordersCount = EcommerceOrder::query()
            ->where('account_id', $account->id)
            ->count();

        $pendingOrdersCount = EcommerceOrder::query()
            ->where('account_id', $account->id)
            ->whereIn('status', ['pending', 'confirmed'])
            ->count();

        $lowStockProductsCount = EcommerceProduct::query()
            ->where('account_id', $account->id)
            ->where('status', 'active')
            ->whereNotNull('stock')
            ->where('stock', '<=', 5)
            ->count();

        $recentOrders = EcommerceOrder::query()
            ->where('account_id', $account->id)
            ->latest('id')
            ->limit(8)
            ->get()
            ->map(fn (EcommerceOrder $order) => [
                'id' => $order->id,
                'customer_name' => $order->customer_name,
                'customer_phone' => $order->customer_phone,
                'total_price' => $order->total_price,
                'currency' => $order->currency,
                'status' => $order->status,
                'source' => $order->source,
                'ordered_at' => $order->ordered_at?->toIso8601String(),
            ]);

        $shopifyIntegrations = ShopifyIntegration::query()
            ->where('account_id', $account->id)
            ->with(['abandonedCheckoutSequence:id,name', 'webhookLogs' => fn ($query) => $query->latest('id')->limit(5)])
            ->latest('id')
            ->get()
            ->map(fn (ShopifyIntegration $integration) => [
                'id' => $integration->id,
                'name' => $integration->name,
                'shop_domain' => $integration->shop_domain,
                'shop_name' => $integration->shop_name,
                'admin_url' => $integration->admin_url,
                'is_active' => (bool) $integration->is_active,
                'auto_register_webhooks' => (bool) $integration->auto_register_webhooks,
                'webhook_topics' => $integration->webhook_topics ?? [],
                'abandoned_checkout_sequence_id' => $integration->abandoned_checkout_sequence_id,
                'abandoned_checkout_sequence_name' => $integration->abandonedCheckoutSequence?->name,
                'last_sync_at' => $integration->last_sync_at?->toIso8601String(),
                'last_error' => $integration->last_error,
                'webhook_url' => route('hooks.shopify.handle', ['integration' => $integration->id]),
                'recent_webhook_logs' => $integration->webhookLogs->map(fn ($log) => [
                    'id' => $log->id,
                    'topic' => $log->topic,
                    'status' => $log->status,
                    'processed_at' => $log->processed_at?->toIso8601String(),
                    'error_message' => $log->error_message,
                ])->values(),
            ])
            ->values();

        $sequences = CampaignSequence::query()
            ->where('account_id', $account->id)
            ->orderBy('name')
            ->get(['id', 'name', 'status'])
            ->map(fn (CampaignSequence $sequence) => [
                'id' => $sequence->id,
                'name' => $sequence->name,
                'status' => $sequence->status,
            ]);

        return Inertia::render('Ecommerce/Index', [
            'summary' => [
                'products_count' => $productsCount,
                'active_products_count' => $activeProductsCount,
                'orders_count' => $ordersCount,
                'pending_orders_count' => $pendingOrdersCount,
                'low_stock_products_count' => $lowStockProductsCount,
            ],
            'recent_orders' => $recentOrders,
            'shopify_integrations' => $shopifyIntegrations,
            'sequences' => $sequences,
        ]);
    }
}
