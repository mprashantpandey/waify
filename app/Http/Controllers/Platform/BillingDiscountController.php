<?php

namespace App\Http\Controllers\Platform;

use App\Http\Controllers\Controller;
use App\Models\BillingDiscount;
use App\Models\Plan;
use App\Services\PlatformSettingsService;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class BillingDiscountController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('Platform/Discounts/Index', [
            'discounts' => BillingDiscount::orderByDesc('created_at')
                ->get()
                ->map(fn (BillingDiscount $discount) => [
                    'id' => $discount->id,
                    'code' => $discount->code,
                    'name' => $discount->name,
                    'description' => $discount->description,
                    'discount_type' => $discount->discount_type,
                    'percent_off' => $discount->percent_off,
                    'amount_off' => $discount->amount_off,
                    'currency' => $discount->currency,
                    'duration' => $discount->duration,
                    'duration_cycles' => $discount->duration_cycles,
                    'is_active' => $discount->is_active,
                    'redemptions' => $discount->redemptions,
                    'max_redemptions' => $discount->max_redemptions,
                    'plan_keys' => $discount->plan_keys,
                    'new_user_only' => $discount->isNewUserOnly(),
                    'created_at' => $discount->created_at?->toIso8601String(),
                ]),
            'plans' => Plan::orderBy('sort_order')->get(['key', 'name']),
            'default_currency' => app(PlatformSettingsService::class)->get('payment.default_currency', 'INR'),
        ]);
    }

    public function store(Request $request)
    {
        $validated = $this->validateDiscount($request);
        $validated['code'] = strtoupper($validated['code']);
        $validated = $this->normalizeDiscountPayload($validated);

        BillingDiscount::create($validated);

        return redirect()->back()->with('success', 'Discount created.');
    }

    public function update(Request $request, BillingDiscount $discount)
    {
        $validated = $this->validateDiscount($request, $discount);
        $validated['code'] = strtoupper($validated['code']);
        $validated = $this->normalizeDiscountPayload($validated, $discount);

        $discount->update($validated);

        return redirect()->back()->with('success', 'Discount updated.');
    }

    public function toggle(BillingDiscount $discount)
    {
        $discount->update(['is_active' => ! $discount->is_active]);

        return redirect()->back()->with('success', 'Discount status updated.');
    }

    protected function validateDiscount(Request $request, ?BillingDiscount $discount = null): array
    {
        $id = $discount?->id;

        return $request->validate([
            'code' => ['required', 'string', 'max:64', 'regex:/^[A-Za-z0-9_-]+$/', 'unique:billing_discounts,code,'.$id],
            'name' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'discount_type' => ['required', 'in:percent,fixed'],
            'percent_off' => ['nullable', 'required_if:discount_type,percent', 'integer', 'min:1', 'max:100'],
            'amount_off' => ['nullable', 'required_if:discount_type,fixed', 'integer', 'min:1'],
            'currency' => ['required', 'string', 'size:3'],
            'duration' => ['required', 'in:once,recurring,forever'],
            'duration_cycles' => ['nullable', 'required_if:duration,recurring', 'integer', 'min:1'],
            'is_active' => ['boolean'],
            'max_redemptions' => ['nullable', 'integer', 'min:1'],
            'starts_at' => ['nullable', 'date'],
            'ends_at' => ['nullable', 'date', 'after_or_equal:starts_at'],
            'plan_keys' => ['nullable', 'array'],
            'plan_keys.*' => ['string', 'exists:plans,key'],
            'new_user_only' => ['boolean'],
            'metadata' => ['nullable', 'array'],
        ]);
    }

    protected function normalizeDiscountPayload(array $validated, ?BillingDiscount $discount = null): array
    {
        $metadata = is_array($discount?->metadata) ? $discount->metadata : [];
        if (is_array($validated['metadata'] ?? null)) {
            $metadata = array_merge($metadata, $validated['metadata']);
        }

        $metadata['new_user_only'] = (bool) ($validated['new_user_only'] ?? false);

        unset($validated['new_user_only']);
        $validated['metadata'] = $metadata;
        $validated['provider'] = null;
        $validated['provider_offer_id'] = null;

        return $validated;
    }
}
