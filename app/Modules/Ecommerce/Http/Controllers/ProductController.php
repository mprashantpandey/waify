<?php

namespace App\Modules\Ecommerce\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Modules\Ecommerce\Models\EcommerceProduct;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class ProductController extends Controller
{
    public function index(Request $request): Response
    {
        $account = $request->attributes->get('account') ?? current_account();
        $search = (string) $request->string('search');

        $products = EcommerceProduct::query()
            ->where('account_id', $account->id)
            ->when($search !== '', function ($query) use ($search) {
                $query->where(function ($q) use ($search) {
                    $q->where('name', 'like', "%{$search}%")
                        ->orWhere('sku', 'like', "%{$search}%");
                });
            })
            ->latest('id')
            ->paginate(20)
            ->withQueryString()
            ->through(fn (EcommerceProduct $product) => [
                'id' => $product->id,
                'name' => $product->name,
                'slug' => $product->slug,
                'sku' => $product->sku,
                'price' => $product->price,
                'currency' => $product->currency,
                'status' => $product->status,
                'stock' => $product->stock,
                'created_at' => $product->created_at?->toIso8601String(),
            ]);

        return Inertia::render('Ecommerce/Products/Index', [
            'products' => $products,
            'filters' => [
                'search' => $search,
            ],
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('Ecommerce/Products/Create');
    }

    public function store(Request $request)
    {
        $account = $request->attributes->get('account') ?? current_account();

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'sku' => 'nullable|string|max:100',
            'description' => 'nullable|string|max:3000',
            'price' => 'required|integer|min:0',
            'currency' => 'nullable|string|size:3',
            'status' => 'required|in:draft,active,archived',
            'stock' => 'nullable|integer|min:0',
        ]);

        $baseSlug = Str::slug($validated['name']);
        $slug = $baseSlug;
        $suffix = 1;

        while (EcommerceProduct::query()->where('account_id', $account->id)->where('slug', $slug)->exists()) {
            $suffix++;
            $slug = "{$baseSlug}-{$suffix}";
        }

        EcommerceProduct::query()->create([
            'account_id' => $account->id,
            'name' => $validated['name'],
            'slug' => $slug,
            'sku' => $validated['sku'] ?? null,
            'description' => $validated['description'] ?? null,
            'price' => $validated['price'],
            'currency' => strtoupper($validated['currency'] ?? 'INR'),
            'status' => $validated['status'],
            'stock' => $validated['stock'] ?? null,
            'metadata' => [],
        ]);

        return redirect()
            ->route('app.ecommerce.products.index')
            ->with('success', 'Product created successfully.');
    }
}

