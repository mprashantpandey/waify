<?php

namespace App\Core\Billing;

use App\Models\MetaPricingVersion;
use App\Models\PlatformSetting;
use Carbon\CarbonInterface;

class MetaPricingResolver
{
    public function resolve(?CarbonInterface $at = null, ?string $countryCode = null): array
    {
        $timestamp = ($at ?? now())->copy();
        $country = strtoupper(trim((string) ($countryCode ?: PlatformSetting::get('whatsapp.meta_billing.default_country_code', 'IN'))));
        $currency = strtoupper((string) PlatformSetting::get('payment.default_currency', 'INR'));

        $version = MetaPricingVersion::query()
            ->where('provider', 'meta_whatsapp')
            ->where('is_active', true)
            ->where(function ($q) use ($country) {
                $q->where('country_code', $country)
                    ->orWhereNull('country_code');
            })
            ->where('effective_from', '<=', $timestamp)
            ->where(function ($q) use ($timestamp) {
                $q->whereNull('effective_to')
                    ->orWhere('effective_to', '>', $timestamp);
            })
            ->orderByRaw('CASE WHEN country_code = ? THEN 0 ELSE 1 END', [$country])
            ->orderByDesc('effective_from')
            ->with('rates')
            ->first();

        if ($version) {
            $rates = $version->rates
                ->mapWithKeys(fn ($rate) => [strtolower((string) $rate->category) => (int) $rate->amount_minor])
                ->all();

            return [
                'source' => 'table',
                'country_code' => $version->country_code ?: $country,
                'currency' => strtoupper((string) ($version->currency ?: $currency)),
                'version' => $version,
                'rates' => [
                    'marketing' => (int) ($rates['marketing'] ?? 0),
                    'utility' => (int) ($rates['utility'] ?? 0),
                    'authentication' => (int) ($rates['authentication'] ?? 0),
                    'service' => (int) ($rates['service'] ?? 0),
                ],
            ];
        }

        return [
            'source' => 'legacy_settings',
            'country_code' => $country,
            'currency' => $currency,
            'version' => null,
            'rates' => [
                'marketing' => (int) PlatformSetting::get('whatsapp.meta_billing.rate.marketing_minor', 0),
                'utility' => (int) PlatformSetting::get('whatsapp.meta_billing.rate.utility_minor', 0),
                'authentication' => (int) PlatformSetting::get('whatsapp.meta_billing.rate.authentication_minor', 0),
                'service' => (int) PlatformSetting::get('whatsapp.meta_billing.rate.service_minor', 0),
            ],
        ];
    }

    public function normalizeCountryCode(?string $countryCode): ?string
    {
        $country = strtoupper(trim((string) $countryCode));
        return $country !== '' ? $country : null;
    }

    public function estimateCostMinor(bool $billable, ?string $category, ?CarbonInterface $at = null, ?string $countryCode = null): array
    {
        $resolved = $this->resolve($at, $countryCode);
        $normalizedCategory = strtolower(trim((string) $category));
        $rateMinor = $billable ? (int) ($resolved['rates'][$normalizedCategory] ?? 0) : 0;

        return [
            'estimated_cost_minor' => $rateMinor,
            'rate_minor' => $rateMinor,
            'currency' => (string) $resolved['currency'],
            'country_code' => (string) $resolved['country_code'],
            'version_id' => $resolved['version']?->id,
            'version_label' => $resolved['version']
                ? sprintf(
                    '#%d (%s)',
                    $resolved['version']->id,
                    optional($resolved['version']->effective_from)->format('Y-m-d') ?? 'n/a'
                )
                : 'Legacy settings',
            'source' => (string) $resolved['source'],
            'rates' => $resolved['rates'],
            'version' => $resolved['version'],
        ];
    }
}
