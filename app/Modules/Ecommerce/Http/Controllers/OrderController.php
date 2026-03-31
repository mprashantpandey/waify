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
        $search = trim((string) $request->string('search'));
        $statuses = ['pending', 'confirmed', 'paid', 'shipped', 'cancelled'];
        if ($status !== '' && !in_array($status, $statuses, true)) {
            $status = '';
        }

        $orders = EcommerceOrder::query()
            ->where('account_id', $account->id)
            ->with('product:id,name')
            ->when($status !== '', fn ($query) => $query->where('status', $status))
            ->when($search !== '', function ($query) use ($search) {
                $query->where(function ($q) use ($search) {
                    $q->where('customer_name', 'like', "%{$search}%")
                        ->orWhere('customer_phone', 'like', "%{$search}%")
                        ->orWhere('customer_wa_id', 'like', "%{$search}%")
                        ->orWhereHas('product', function ($productQuery) use ($search) {
                            $productQuery->where('name', 'like', "%{$search}%");
                        });
                });
            })
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
                'search' => $search,
            ],
            'statuses' => $statuses,
        ]);
    }
}
