<?php

namespace App\Core\Billing;

use App\Models\MetaPricingRate;
use App\Models\MetaPricingVersion;
use App\Models\PlatformSetting;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Str;
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
            $raw = (string) $response->body();

            return $this->decodePayload($raw);
        }

        if (!is_file($source)) {
            throw new RuntimeException('Official pricing feed file not found: '.$source);
        }

        $raw = file_get_contents($source);

        return $this->decodePayload((string) $raw);
    }

    protected function decodePayload(string $raw): array
    {
        $decoded = json_decode($raw, true);
        if (is_array($decoded) && isset($decoded['versions'])) {
            return $decoded;
        }

        return $this->parseCsvPayload($raw);
    }

    /**
     * Parse Meta pricing CSV exports into the JSON payload shape expected by this service.
     */
    protected function parseCsvPayload(string $raw): array
    {
        $records = $this->readCsvRecords($raw);
        $effectiveFrom = $this->extractEffectiveFrom($raw);

        $headerIndex = null;
        $header = [];
        foreach ($records as $i => $cells) {
            $normalized = array_map(fn ($v) => Str::of((string) $v)->lower()->replace(["\n", "\r"], ' ')->squish()->value(), $cells);
            if (in_array('market', $normalized, true) && in_array('utility', $normalized, true) && in_array('authentication', $normalized, true)) {
                $headerIndex = $i;
                $header = $normalized;
                break;
            }
            if (in_array('market (per rate card)', $normalized, true) && in_array('rate type', $normalized, true)) {
                $headerIndex = $i;
                $header = $normalized;
                break;
            }
        }

        if ($headerIndex === null) {
            throw new RuntimeException('CSV feed format not recognized.');
        }

        $versions = [];
        $market = null;

        for ($i = $headerIndex + 1; $i < count($records); $i++) {
            $row = $records[$i];
            if (count(array_filter($row, fn ($v) => trim((string) $v) !== '')) === 0) {
                continue;
            }

            $assoc = [];
            foreach ($header as $idx => $key) {
                $assoc[$key] = trim((string) ($row[$idx] ?? ''));
            }

            // Flat per-message CSV.
            if (array_key_exists('marketing', $assoc) && array_key_exists('utility', $assoc)) {
                $marketName = $assoc['market'] ?: null;
                if (!$marketName) {
                    continue;
                }
                $code = $this->mapMarketToCountryCode($marketName);
                if ($code === null) {
                    continue;
                }

                $versions[] = [
                    'country_code' => $code,
                    'currency' => $this->normalizeCurrency($assoc['currency'] ?? ''),
                    'effective_from' => $effectiveFrom->toIso8601String(),
                    'effective_to' => null,
                    'is_active' => true,
                    'rates' => [
                        'marketing' => $this->toMinor($assoc['marketing'] ?? null),
                        'utility' => $this->toMinor($assoc['utility'] ?? null),
                        'authentication' => $this->toMinor($assoc['authentication'] ?? null),
                        'service' => $this->toMinor($assoc['service'] ?? null),
                    ],
                ];
                continue;
            }

            // Volume-tier CSV (only utility/auth at list or tier rates).
            if (array_key_exists('market (per rate card)', $assoc) && array_key_exists('rate type', $assoc)) {
                if ($assoc['market (per rate card)'] !== '') {
                    $market = $assoc['market (per rate card)'];
                }
                if (!$market) {
                    continue;
                }
                if (strtolower($assoc['rate type']) !== 'list rate') {
                    continue;
                }

                $code = $this->mapMarketToCountryCode($market);
                if ($code === null) {
                    continue;
                }

                // In this export, utility/auth list rates exist; marketing/service are not present.
                $versions[] = [
                    'country_code' => $code,
                    'currency' => $this->normalizeCurrency($assoc['currency'] ?? ''),
                    'effective_from' => $effectiveFrom->toIso8601String(),
                    'effective_to' => null,
                    'is_active' => true,
                    'rates' => [
                        'marketing' => 0,
                        'utility' => $this->toMinor($assoc['rate'] ?? null),
                        'authentication' => $this->toMinor($assoc['rate'] ?? null),
                        'service' => 0,
                    ],
                ];
            }
        }

        if (count($versions) === 0) {
            throw new RuntimeException('No pricing rows could be parsed from CSV feed.');
        }

        return [
            'source' => 'meta_csv_import',
            'versions' => $versions,
        ];
    }

    protected function readCsvRecords(string $raw): array
    {
        $handle = fopen('php://temp', 'r+');
        fwrite($handle, $raw);
        rewind($handle);

        $records = [];
        while (($row = fgetcsv($handle)) !== false) {
            $records[] = $row;
        }

        fclose($handle);

        return $records;
    }

    protected function extractEffectiveFrom(string $raw): Carbon
    {
        if (preg_match('/effective\s+([A-Za-z]+\s+\d{1,2},\s+\d{4})/i', $raw, $m)) {
            return Carbon::parse($m[1])->startOfDay();
        }

        return now()->startOfDay();
    }

    protected function normalizeCurrency(string $raw): string
    {
        $value = trim($raw);
        if ($value === '' || $value === '₹') {
            return 'INR';
        }

        $value = strtoupper($value);
        return strlen($value) >= 3 ? substr($value, 0, 3) : 'INR';
    }

    protected function toMinor(?string $raw): int
    {
        $value = trim((string) $raw);
        if ($value === '' || strtolower($value) === 'n/a' || $value === '--') {
            return 0;
        }

        $value = str_replace([',', '₹'], '', $value);
        if (!is_numeric($value)) {
            return 0;
        }

        return max(0, (int) round(((float) $value) * 100));
    }

    protected function mapMarketToCountryCode(string $market): ?string
    {
        $map = [
            'argentina' => 'AR',
            'brazil' => 'BR',
            'chile' => 'CL',
            'colombia' => 'CO',
            'egypt' => 'EG',
            'france' => 'FR',
            'germany' => 'DE',
            'india' => 'IN',
            'indonesia' => 'ID',
            'israel' => 'IL',
            'italy' => 'IT',
            'malaysia' => 'MY',
            'mexico' => 'MX',
            'netherlands' => 'NL',
            'nigeria' => 'NG',
            'pakistan' => 'PK',
            'peru' => 'PE',
            'russia' => 'RU',
            'saudi arabia' => 'SA',
            'south africa' => 'ZA',
            'spain' => 'ES',
            'turkey' => 'TR',
            'united arab emirates' => 'AE',
            'united kingdom' => 'GB',
            'north america' => 'XA',
            'rest of africa' => 'XB',
            'rest of asia pacific' => 'XC',
            'rest of central & eastern europe' => 'XD',
            'rest of latin america' => 'XE',
            'rest of middle east' => 'XF',
            'rest of western europe' => 'XG',
            'other' => 'XO',
        ];

        $key = Str::of($market)->lower()->replace(["\n", "\r"], ' ')->squish()->value();

        return $map[$key] ?? null;
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
