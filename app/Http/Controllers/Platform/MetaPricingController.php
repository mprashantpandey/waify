<?php

namespace App\Http\Controllers\Platform;

use App\Core\Billing\MetaPricingResolver;
use App\Http\Controllers\Controller;
use App\Models\MetaPricingRate;
use App\Models\MetaPricingVersion;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class MetaPricingController extends Controller
{
    public function __construct(
        protected MetaPricingResolver $metaPricingResolver
    ) {}

    public function index(Request $request): Response
    {
        $versions = MetaPricingVersion::query()
            ->with('rates')
            ->orderByDesc('effective_from')
            ->orderByDesc('id')
            ->get()
            ->map(function (MetaPricingVersion $version) {
                return [
                    'id' => $version->id,
                    'provider' => $version->provider,
                    'country_code' => $version->country_code,
                    'currency' => $version->currency,
                    'effective_from' => $version->effective_from?->toIso8601String(),
                    'effective_to' => $version->effective_to?->toIso8601String(),
                    'is_active' => (bool) $version->is_active,
                    'notes' => $version->notes,
                    'rates' => $version->rates->map(fn (MetaPricingRate $rate) => [
                        'id' => $rate->id,
                        'category' => $rate->category,
                        'pricing_model' => $rate->pricing_model,
                        'amount_minor' => (int) $rate->amount_minor,
                    ])->values()->all(),
                ];
            });

        $legacy = $this->metaPricingResolver->resolve(now());

        return Inertia::render('Platform/MetaPricing/Index', [
            'versions' => $versions,
            'legacy_default' => [
                'country_code' => $legacy['country_code'] ?? 'IN',
                'currency' => $legacy['currency'] ?? 'INR',
                'rates' => $legacy['rates'] ?? [],
                'source' => $legacy['source'] ?? 'legacy_settings',
            ],
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'country_code' => 'nullable|string|size:2',
            'currency' => 'required|string|size:3',
            'effective_from' => 'required|date',
            'effective_to' => 'nullable|date|after:effective_from',
            'is_active' => 'nullable|boolean',
            'notes' => 'nullable|string|max:5000',
            'rates' => 'required|array',
            'rates.marketing' => 'required|integer|min:0',
            'rates.utility' => 'required|integer|min:0',
            'rates.authentication' => 'required|integer|min:0',
            'rates.service' => 'required|integer|min:0',
        ]);

        DB::transaction(function () use ($validated, $request) {
            $countryCode = $this->normalizeCountryCode($validated['country_code'] ?? null);
            $isActive = (bool) ($validated['is_active'] ?? true);

            if ($isActive) {
                $this->deactivateCountryVersions($countryCode);
            }

            $version = MetaPricingVersion::create([
                'provider' => 'meta_whatsapp',
                'country_code' => $countryCode,
                'currency' => strtoupper((string) $validated['currency']),
                'effective_from' => $validated['effective_from'],
                'effective_to' => $validated['effective_to'] ?? null,
                'is_active' => $isActive,
                'notes' => $validated['notes'] ?? null,
                'created_by' => $request->user()?->id,
            ]);

            foreach (['marketing', 'utility', 'authentication', 'service'] as $category) {
                MetaPricingRate::create([
                    'meta_pricing_version_id' => $version->id,
                    'category' => $category,
                    'pricing_model' => 'conversation',
                    'amount_minor' => (int) ($validated['rates'][$category] ?? 0),
                ]);
            }
        });

        return redirect()->route('platform.meta-pricing.index')
            ->with('success', 'Meta pricing version created.');
    }

    public function update(Request $request, MetaPricingVersion $version)
    {
        $validated = $request->validate([
            'country_code' => 'nullable|string|size:2',
            'currency' => 'required|string|size:3',
            'effective_from' => 'required|date',
            'effective_to' => 'nullable|date|after:effective_from',
            'is_active' => 'nullable|boolean',
            'notes' => 'nullable|string|max:5000',
            'rates' => 'required|array',
            'rates.marketing' => 'required|integer|min:0',
            'rates.utility' => 'required|integer|min:0',
            'rates.authentication' => 'required|integer|min:0',
            'rates.service' => 'required|integer|min:0',
        ]);

        DB::transaction(function () use ($validated, $version) {
            $countryCode = $this->normalizeCountryCode($validated['country_code'] ?? null);
            $isActive = (bool) ($validated['is_active'] ?? false);

            if ($isActive) {
                $this->deactivateCountryVersions($countryCode, exceptId: (int) $version->id);
            }

            $version->update([
                'country_code' => $countryCode,
                'currency' => strtoupper((string) $validated['currency']),
                'effective_from' => $validated['effective_from'],
                'effective_to' => $validated['effective_to'] ?? null,
                'is_active' => $isActive,
                'notes' => $validated['notes'] ?? null,
            ]);

            foreach (['marketing', 'utility', 'authentication', 'service'] as $category) {
                MetaPricingRate::updateOrCreate(
                    [
                        'meta_pricing_version_id' => $version->id,
                        'category' => $category,
                    ],
                    [
                        'pricing_model' => 'conversation',
                        'amount_minor' => (int) ($validated['rates'][$category] ?? 0),
                    ]
                );
            }
        });

        return redirect()->route('platform.meta-pricing.index')
            ->with('success', 'Meta pricing version updated.');
    }

    public function toggle(MetaPricingVersion $version)
    {
        DB::transaction(function () use ($version) {
            $target = !$version->is_active;
            if ($target) {
                $this->deactivateCountryVersions($version->country_code, exceptId: (int) $version->id);
            }
            $version->update(['is_active' => $target]);
        });

        return redirect()->route('platform.meta-pricing.index')
            ->with('success', $version->is_active ? 'Meta pricing version activated.' : 'Meta pricing version deactivated.');
    }

    public function importLegacy(Request $request)
    {
        $legacy = $this->metaPricingResolver->resolve(now());

        DB::transaction(function () use ($legacy, $request) {
            $countryCode = $this->normalizeCountryCode($legacy['country_code'] ?? null);
            $this->deactivateCountryVersions($countryCode);

            $version = MetaPricingVersion::create([
                'provider' => 'meta_whatsapp',
                'country_code' => $countryCode,
                'currency' => strtoupper((string) ($legacy['currency'] ?? 'INR')),
                'effective_from' => now()->startOfMinute(),
                'effective_to' => null,
                'is_active' => true,
                'notes' => 'Imported from legacy platform Meta billing rate settings',
                'created_by' => $request->user()?->id,
            ]);

            foreach (['marketing', 'utility', 'authentication', 'service'] as $category) {
                MetaPricingRate::create([
                    'meta_pricing_version_id' => $version->id,
                    'category' => $category,
                    'pricing_model' => 'conversation',
                    'amount_minor' => (int) ($legacy['rates'][$category] ?? 0),
                ]);
            }
        });

        return redirect()->route('platform.meta-pricing.index')
            ->with('success', 'Legacy Meta rates imported into a versioned pricing record.');
    }

    protected function deactivateCountryVersions(?string $countryCode, ?int $exceptId = null): void
    {
        MetaPricingVersion::query()
            ->where('provider', 'meta_whatsapp')
            ->when($countryCode, fn ($q) => $q->where('country_code', $countryCode), fn ($q) => $q->whereNull('country_code'))
            ->when($exceptId, fn ($q) => $q->where('id', '!=', $exceptId))
            ->where('is_active', true)
            ->update(['is_active' => false]);
    }

    protected function normalizeCountryCode(?string $value): ?string
    {
        $value = strtoupper(trim((string) $value));
        return $value !== '' ? $value : null;
    }
}

