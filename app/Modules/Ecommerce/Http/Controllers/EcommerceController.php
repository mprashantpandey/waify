<?php

namespace App\Modules\Ecommerce\Http\Controllers;

use App\Http\Controllers\Controller;
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
                'ordered_at' => $order->ordered_at?->toIso8601String(),
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
        ]);
    }
}
