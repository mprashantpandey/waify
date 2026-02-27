<?php

namespace App\Core\Billing;

use App\Models\MetaPricingRate;
use App\Models\MetaPricingVersion;
use App\Models\PlatformSetting;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Http;
use RuntimeException;

class MetaPricingSyncService
{
    /**
     * Sync pricing versions from an external JSON feed.
     *
     * Expected JSON shape:
     * {
     *   "source": "meta_docs_snapshot",
     *   "versions": [
     *     {
     *       "country_code": "IN",
     *       "currency": "INR",
     *       "effective_from": "2026-01-01T00:00:00Z",
     *       "effective_to": null,
     *       "rates": {
     *         "marketing": 120,
     *         "utility": 60,
     *         "authentication": 30,
     *         "service": 0
     *       }
     *     }
     *   ]
     * }
     *
     * @return array{created:int,updated:int,total:int,source:string}
     */
    public function syncFromOfficialFeed(string $source, ?int $actorUserId = null, bool $persist = true): array
    {
        $payload = $this->loadPayload($source);
        $versions = $payload['versions'] ?? null;
        if (!is_array($versions) || count($versions) === 0) {
            throw new RuntimeException('Official pricing feed does not contain versions.');
        }

        if (!$persist) {
            // Validate each row shape and date parseability.
            foreach ($versions as $row) {
                $this->normalizeVersionRow($row);
            }

            return [
                'created' => 0,
                'updated' => 0,
                'total' => count($versions),
                'source' => $source,
            ];
        }

        $created = 0;
        $updated = 0;
        $feedSource = (string) ($payload['source'] ?? 'official_meta_feed');

        DB::transaction(function () use ($versions, $actorUserId, $feedSource, &$created, &$updated) {
            foreach ($versions as $row) {
                $normalized = $this->normalizeVersionRow($row);
                if (!$normalized) {
                    continue;
                }

                $version = MetaPricingVersion::query()->firstOrNew([
                    'provider' => 'meta_whatsapp',
                    'country_code' => $normalized['country_code'],
                    'currency' => $normalized['currency'],
                    'effective_from' => $normalized['effective_from'],
                ]);

                if ($normalized['is_active']) {
                    MetaPricingVersion::query()
                        ->where('provider', 'meta_whatsapp')
                        ->where('country_code', $normalized['country_code'])
                        ->where('id', '!=', $version->id ?? 0)
                        ->update(['is_active' => false]);
                }

                $isNew = !$version->exists;
                $version->effective_to = $normalized['effective_to'];
                $version->is_active = $normalized['is_active'];
                $version->notes = 'Official sync: '.$feedSource;
                if ($isNew) {
                    $version->created_by = $actorUserId;
                }
                $version->save();

                MetaPricingRate::query()
                    ->where('meta_pricing_version_id', $version->id)
                    ->delete();

                foreach (['marketing', 'utility', 'authentication', 'service'] as $category) {
                    MetaPricingRate::query()->create([
                        'meta_pricing_version_id' => $version->id,
                        'category' => $category,
                        'pricing_model' => 'conversation',
                        'amount_minor' => (int) ($normalized['rates'][$category] ?? 0),
                    ]);
                }

                if ($isNew) {
                    $created++;
                } else {
                    $updated++;
                }
            }
        });

        PlatformSetting::set('whatsapp.meta_pricing_sync.last_run_at', now()->toIso8601String(), 'string', 'integrations');
        PlatformSetting::set('whatsapp.meta_pricing_sync.last_source', $source, 'string', 'integrations');
        PlatformSetting::set('whatsapp.meta_pricing_sync.last_status', 'success', 'string', 'integrations');
        PlatformSetting::set('whatsapp.meta_pricing_sync.last_error', '', 'string', 'integrations');
        PlatformSetting::set('whatsapp.meta_pricing_sync.last_versions_count', $created + $updated, 'integer', 'integrations');

        return [
            'created' => $created,
            'updated' => $updated,
            'total' => $created + $updated,
            'source' => $source,
        ];
    }

    protected function loadPayload(string $source): array
    {
        if (str_starts_with($source, 'http://') || str_starts_with($source, 'https://')) {
            $response = Http::timeout(30)->acceptJson()->get($source);
            if (!$response->ok()) {
                throw new RuntimeException('Unable to fetch official pricing feed (HTTP '.$response->status().').');
            }
            $decoded = $response->json();
            if (!is_array($decoded)) {
                throw new RuntimeException('Official pricing feed returned invalid JSON.');
            }

            return $decoded;
        }

        if (!is_file($source)) {
            throw new RuntimeException('Official pricing feed file not found: '.$source);
        }

        $raw = file_get_contents($source);
        $decoded = json_decode((string) $raw, true);
        if (!is_array($decoded)) {
            throw new RuntimeException('Official pricing feed file contains invalid JSON.');
        }

        return $decoded;
    }

    protected function normalizeVersionRow(mixed $row): ?array
    {
        if (!is_array($row)) {
            return null;
        }

        $countryCode = strtoupper(trim((string) ($row['country_code'] ?? 'IN')));
        $currency = strtoupper(trim((string) ($row['currency'] ?? 'INR')));
        $effectiveFromRaw = $row['effective_from'] ?? now()->toIso8601String();
        $effectiveToRaw = $row['effective_to'] ?? null;
        $rates = is_array($row['rates'] ?? null) ? $row['rates'] : [];

        return [
            'country_code' => $countryCode !== '' ? substr($countryCode, 0, 2) : 'IN',
            'currency' => $currency !== '' ? substr($currency, 0, 3) : 'INR',
            'effective_from' => Carbon::parse((string) $effectiveFromRaw)->startOfMinute(),
            'effective_to' => $effectiveToRaw ? Carbon::parse((string) $effectiveToRaw)->startOfMinute() : null,
            'is_active' => (bool) ($row['is_active'] ?? true),
            'rates' => [
                'marketing' => max(0, (int) ($rates['marketing'] ?? 0)),
                'utility' => max(0, (int) ($rates['utility'] ?? 0)),
                'authentication' => max(0, (int) ($rates['authentication'] ?? 0)),
                'service' => max(0, (int) ($rates['service'] ?? 0)),
            ],
        ];
    }
}
