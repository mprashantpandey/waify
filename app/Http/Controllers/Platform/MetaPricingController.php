<?php

namespace App\Http\Controllers\Platform;

use App\Core\Billing\MetaPricingSyncService;
use App\Core\Billing\MetaPricingResolver;
use App\Http\Controllers\Controller;
use App\Models\Account;
use App\Models\MetaPricingRate;
use App\Models\MetaPricingVersion;
use App\Models\PlatformSetting;
use App\Modules\WhatsApp\Models\WhatsAppMessageBilling;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Inertia\Inertia;
use Inertia\Response;

class MetaPricingController extends Controller
{
    public function __construct(
        protected MetaPricingResolver $metaPricingResolver,
        protected MetaPricingSyncService $metaPricingSyncService
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
            'sync_status' => [
                'last_run_at' => PlatformSetting::get('whatsapp.meta_pricing_sync.last_run_at'),
                'last_status' => PlatformSetting::get('whatsapp.meta_pricing_sync.last_status', 'never'),
                'last_error' => PlatformSetting::get('whatsapp.meta_pricing_sync.last_error'),
                'last_source' => PlatformSetting::get('whatsapp.meta_pricing_sync.last_source'),
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
        // Import from raw legacy platform settings only (not from already-versioned pricing),
        // otherwise this action can accidentally clone the active table-based version.
        $legacyCountry = PlatformSetting::get('whatsapp.meta_billing.default_country_code', 'IN');
        $legacyCurrency = PlatformSetting::get('payment.default_currency', 'INR');
        $legacy = [
            'country_code' => $legacyCountry,
            'currency' => $legacyCurrency,
            'rates' => [
                'marketing' => (int) PlatformSetting::get('whatsapp.meta_billing.rate.marketing_minor', 0),
                'utility' => (int) PlatformSetting::get('whatsapp.meta_billing.rate.utility_minor', 0),
                'authentication' => (int) PlatformSetting::get('whatsapp.meta_billing.rate.authentication_minor', 0),
                'service' => (int) PlatformSetting::get('whatsapp.meta_billing.rate.service_minor', 0),
            ],
        ];

        $hasAnyLegacyRate = collect($legacy['rates'])->contains(fn ($value) => (int) $value > 0);
        if (!$hasAnyLegacyRate) {
            return redirect()->route('platform.meta-pricing.index')
                ->with('error', 'Legacy Meta rates are empty (all categories are 0). Configure legacy Meta billing rates first, then import.');
        }

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

    public function syncOfficial(Request $request)
    {
        $validated = $request->validate([
            'source' => 'nullable|string|max:2048',
        ]);

        $source = trim((string) ($validated['source']
            ?? PlatformSetting::get('whatsapp.meta_pricing_sync.feed_url')
            ?? env('META_PRICING_SYNC_URL', '')));

        if ($source === '') {
            return redirect()->route('platform.meta-pricing.index')
                ->with('error', 'Missing official pricing feed URL. Configure whatsapp.meta_pricing_sync.feed_url first.');
        }

        try {
            $result = $this->metaPricingSyncService->syncFromOfficialFeed($source, $request->user()?->id);

            return redirect()->route('platform.meta-pricing.index')
                ->with('success', sprintf(
                    'Official Meta pricing sync completed. %d processed (%d created, %d updated).',
                    $result['total'],
                    $result['created'],
                    $result['updated']
                ));
        } catch (\Throwable $e) {
            PlatformSetting::set('whatsapp.meta_pricing_sync.last_status', 'error', 'string', 'integrations');
            PlatformSetting::set('whatsapp.meta_pricing_sync.last_error', $e->getMessage(), 'string', 'integrations');

            return redirect()->route('platform.meta-pricing.index')
                ->with('error', 'Official sync failed: '.$e->getMessage());
        }
    }

    public function recalculateBillingSnapshot(Request $request, WhatsAppMessageBilling $billing)
    {
        $validated = $request->validate([
            'meta_pricing_version_id' => 'nullable|integer|exists:meta_pricing_versions,id',
        ]);

        $explicitVersionId = isset($validated['meta_pricing_version_id']) ? (int) $validated['meta_pricing_version_id'] : null;
        $this->recalculateBillingRecord(
            billing: $billing,
            explicitVersionId: $explicitVersionId,
            actorUserId: $request->user()?->id
        );

        return redirect()->route('platform.meta-pricing.index')
            ->with('success', "Billing snapshot #{$billing->id} recalculated.");
    }

    public function bulkRecalculateBillingSnapshots(Request $request)
    {
        $validated = $request->validate([
            'issue_type' => 'required|string|in:all_issues,missing_pricing_version,zero_rate_billable,zero_cost_billable,uncategorized',
            'account_id' => 'nullable|integer|exists:accounts,id',
            'date_from' => 'nullable|date',
            'date_to' => 'nullable|date|after_or_equal:date_from',
            'limit' => 'nullable|integer|min:1|max:500',
        ]);

        if (!Schema::hasTable('whatsapp_message_billings')) {
            return redirect()->route('platform.meta-pricing.index')
                ->with('error', 'whatsapp_message_billings table is not available on this environment.');
        }

        $limit = (int) ($validated['limit'] ?? 200);
        $query = WhatsAppMessageBilling::query()->orderBy('id');

        if (!empty($validated['account_id'])) {
            $query->where('account_id', (int) $validated['account_id']);
        }
        if (!empty($validated['date_from'])) {
            $query->where('created_at', '>=', $validated['date_from']);
        }
        if (!empty($validated['date_to'])) {
            $query->where('created_at', '<=', $validated['date_to']);
        }

        $issueType = (string) $validated['issue_type'];
        $query->where(function ($q) use ($issueType) {
            if ($issueType === 'all_issues' || $issueType === 'missing_pricing_version') {
                $q->orWhere(function ($qq) {
                    $qq->where('billable', true)->whereNull('meta_pricing_version_id');
                });
            }
            if ($issueType === 'all_issues' || $issueType === 'zero_rate_billable') {
                $q->orWhere(function ($qq) {
                    $qq->where('billable', true)->where(function ($q3) {
                        $q3->whereNull('rate_minor')->orWhere('rate_minor', '<=', 0);
                    });
                });
            }
            if ($issueType === 'all_issues' || $issueType === 'zero_cost_billable') {
                $q->orWhere(function ($qq) {
                    $qq->where('billable', true)->where(function ($q3) {
                        $q3->whereNull('estimated_cost_minor')->orWhere('estimated_cost_minor', '<=', 0);
                    });
                });
            }
            if ($issueType === 'all_issues' || $issueType === 'uncategorized') {
                $q->orWhere(function ($qq) {
                    $qq->whereNull('category')->orWhere('category', '');
                });
            }
        });

        $records = $query->limit($limit)->get();
        $processed = 0;
        $failed = 0;

        foreach ($records as $billing) {
            try {
                $this->recalculateBillingRecord(
                    billing: $billing,
                    explicitVersionId: null,
                    actorUserId: $request->user()?->id
                );
                $processed++;
            } catch (\Throwable $e) {
                $failed++;
            }
        }

        return redirect()->route('platform.meta-pricing.index')
            ->with('success', "Bulk recalculation complete. Processed: {$processed}, Failed: {$failed}, Selected: {$records->count()}.");
    }

    protected function recalculateBillingRecord(
        WhatsAppMessageBilling $billing,
        ?int $explicitVersionId = null,
        ?int $actorUserId = null
    ): void {
        $account = Account::find($billing->account_id);
        $category = strtolower(trim((string) $billing->category));
        $countedAt = $billing->counted_at ?? $billing->created_at ?? now();

        if ($explicitVersionId) {
            $version = MetaPricingVersion::with('rates')->findOrFail($explicitVersionId);
            $rates = $version->rates->mapWithKeys(fn ($r) => [strtolower((string) $r->category) => (int) $r->amount_minor])->all();
            $rateMinor = $billing->billable ? (int) ($rates[$category] ?? 0) : 0;
            $quote = [
                'estimated_cost_minor' => $rateMinor,
                'rate_minor' => $rateMinor,
                'currency' => strtoupper((string) ($version->currency ?: ($billing->pricing_currency ?: 'INR'))),
                'country_code' => $version->country_code ?: ($account?->billing_country_code ?: $billing->pricing_country_code),
                'version_id' => $version->id,
                'version_label' => sprintf('#%d (%s)', $version->id, optional($version->effective_from)->format('Y-m-d') ?? 'n/a'),
                'source' => 'manual_version',
            ];
        } else {
            $quote = $this->metaPricingResolver->estimateCostMinor(
                billable: (bool) $billing->billable,
                category: $category,
                at: $countedAt,
                countryCode: $account?->billing_country_code ?: $billing->pricing_country_code
            );
        }

        $meta = is_array($billing->meta) ? $billing->meta : [];
        $reconciliationLog = is_array($meta['reconciliation'] ?? null) ? $meta['reconciliation'] : [];

        $before = [
            'meta_pricing_version_id' => $billing->meta_pricing_version_id,
            'pricing_country_code' => $billing->pricing_country_code,
            'pricing_currency' => $billing->pricing_currency,
            'rate_minor' => (int) ($billing->rate_minor ?? 0),
            'estimated_cost_minor' => (int) ($billing->estimated_cost_minor ?? 0),
        ];

        $billing->update([
            'meta_pricing_version_id' => $quote['version_id'] ?? null,
            'pricing_country_code' => $quote['country_code'] ?? $billing->pricing_country_code,
            'pricing_currency' => $quote['currency'] ?? $billing->pricing_currency,
            'rate_minor' => (int) ($quote['rate_minor'] ?? 0),
            'estimated_cost_minor' => (int) ($quote['estimated_cost_minor'] ?? 0),
            'meta' => array_merge($meta, [
                'pricing_resolver' => array_merge((array) ($meta['pricing_resolver'] ?? []), [
                    'source' => $quote['source'] ?? 'unknown',
                    'version_label' => $quote['version_label'] ?? null,
                    'recalculated_at' => now()->toIso8601String(),
                ]),
                'reconciliation' => array_values(array_slice(array_merge($reconciliationLog, [[
                    'action' => 'recalculate',
                    'at' => now()->toIso8601String(),
                    'by_user_id' => $actorUserId,
                    'source' => $quote['source'] ?? null,
                    'selected_version_id' => $explicitVersionId,
                    'before' => $before,
                    'after' => [
                        'meta_pricing_version_id' => $quote['version_id'] ?? null,
                        'pricing_country_code' => $quote['country_code'] ?? $billing->pricing_country_code,
                        'pricing_currency' => $quote['currency'] ?? $billing->pricing_currency,
                        'rate_minor' => (int) ($quote['rate_minor'] ?? 0),
                        'estimated_cost_minor' => (int) ($quote['estimated_cost_minor'] ?? 0),
                    ],
                ]]), -20)),
            ]),
        ]);
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
