<?php

namespace App\Http\Controllers\Platform;

use App\Core\Billing\MetaPricingResolver;
use App\Http\Controllers\Controller;
use App\Models\MetaPricingRate;
use App\Models\MetaPricingVersion;
use App\Modules\WhatsApp\Models\WhatsAppMessageBilling;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
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
        $reconciliation = $this->buildReconciliationSnapshot();

        return Inertia::render('Platform/MetaPricing/Index', [
            'versions' => $versions,
            'legacy_default' => [
                'country_code' => $legacy['country_code'] ?? 'IN',
                'currency' => $legacy['currency'] ?? 'INR',
                'rates' => $legacy['rates'] ?? [],
                'source' => $legacy['source'] ?? 'legacy_settings',
            ],
            'reconciliation' => $reconciliation,
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

    protected function buildReconciliationSnapshot(): array
    {
        if (!Schema::hasTable('whatsapp_message_billings')) {
            return [
                'available' => false,
                'summary' => [],
                'recent_issues' => [],
            ];
        }

        $base = WhatsAppMessageBilling::query();

        $summary = [
            'total_records' => (clone $base)->count(),
            'billable_records' => (clone $base)->where('billable', true)->count(),
            'missing_pricing_version' => (clone $base)->where('billable', true)->whereNull('meta_pricing_version_id')->count(),
            'zero_rate_billable' => (clone $base)->where('billable', true)->where(function ($q) {
                $q->whereNull('rate_minor')->orWhere('rate_minor', '<=', 0);
            })->count(),
            'zero_cost_billable' => (clone $base)->where('billable', true)->where(function ($q) {
                $q->whereNull('estimated_cost_minor')->orWhere('estimated_cost_minor', '<=', 0);
            })->count(),
            'uncategorized' => (clone $base)->where(function ($q) {
                $q->whereNull('category')->orWhere('category', '');
            })->count(),
        ];

        $recentIssues = WhatsAppMessageBilling::query()
            ->leftJoin('accounts', 'accounts.id', '=', 'whatsapp_message_billings.account_id')
            ->select(
                'whatsapp_message_billings.id',
                'whatsapp_message_billings.account_id',
                'accounts.name as account_name',
                'whatsapp_message_billings.meta_message_id',
                'whatsapp_message_billings.billable',
                'whatsapp_message_billings.category',
                'whatsapp_message_billings.meta_pricing_version_id',
                'whatsapp_message_billings.pricing_country_code',
                'whatsapp_message_billings.pricing_currency',
                'whatsapp_message_billings.rate_minor',
                'whatsapp_message_billings.estimated_cost_minor',
                'whatsapp_message_billings.created_at'
            )
            ->where(function ($q) {
                $q->where(function ($qq) {
                    $qq->where('whatsapp_message_billings.billable', true)
                        ->whereNull('whatsapp_message_billings.meta_pricing_version_id');
                })->orWhere(function ($qq) {
                    $qq->where('whatsapp_message_billings.billable', true)
                        ->where(function ($q3) {
                            $q3->whereNull('whatsapp_message_billings.rate_minor')
                                ->orWhere('whatsapp_message_billings.rate_minor', '<=', 0);
                        });
                })->orWhere(function ($qq) {
                    $qq->whereNull('whatsapp_message_billings.category')
                        ->orWhere('whatsapp_message_billings.category', '');
                });
            })
            ->orderByDesc('whatsapp_message_billings.created_at')
            ->limit(50)
            ->get()
            ->map(fn ($row) => [
                'id' => (int) $row->id,
                'account_id' => (int) $row->account_id,
                'account_name' => $row->account_name ?: 'Unknown',
                'meta_message_id' => (string) $row->meta_message_id,
                'billable' => (bool) $row->billable,
                'category' => $row->category,
                'meta_pricing_version_id' => $row->meta_pricing_version_id ? (int) $row->meta_pricing_version_id : null,
                'pricing_country_code' => $row->pricing_country_code,
                'pricing_currency' => $row->pricing_currency,
                'rate_minor' => (int) ($row->rate_minor ?? 0),
                'estimated_cost_minor' => (int) ($row->estimated_cost_minor ?? 0),
                'created_at' => optional($row->created_at)?->toIso8601String() ?? (string) $row->created_at,
            ])
            ->values()
            ->all();

        return [
            'available' => true,
            'summary' => $summary,
            'recent_issues' => $recentIssues,
        ];
    }
}
