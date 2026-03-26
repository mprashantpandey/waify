<?php

namespace App\Modules\Ecommerce\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Modules\Ecommerce\Models\EcommerceOrder;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class OrderController extends Controller
{
    public function index(Request $request): Response
    {
        $account = $request->attributes->get('account') ?? current_account();
        $status = (string) $request->string('status');

        $orders = EcommerceOrder::query()
            ->where('account_id', $account->id)
            ->with('product:id,name')
            ->when($status !== '', fn ($query) => $query->where('status', $status))
            ->latest('id')
            ->paginate(20)
            ->withQueryString()
            ->through(fn (EcommerceOrder $order) => [
                'id' => $order->id,
                'product' => $order->product ? [
                    'name' => $order->product->name,
                ] : null,
                'customer_name' => $order->customer_name,
                'customer_phone' => $order->customer_phone,
                'quantity' => $order->quantity,
                'total_price' => $order->total_price,
                'currency' => $order->currency,
                'status' => $order->status,
                'ordered_at' => $order->ordered_at?->toIso8601String(),
            ]);

        return Inertia::render('Ecommerce/Orders/Index', [
            'orders' => $orders,
            'filters' => [
                'status' => $status,
            ],
            'statuses' => ['pending', 'confirmed', 'paid', 'shipped', 'cancelled'],
        ]);
    }
}

