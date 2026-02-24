import { Head, router, useForm, usePage } from '@inertiajs/react';
import PlatformShell from '@/Layouts/PlatformShell';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/Components/UI/Card';
import Button from '@/Components/UI/Button';
import { Label } from '@/Components/UI/Label';
import { Input } from '@/Components/UI/Input';
import InputError from '@/Components/InputError';
import { Badge } from '@/Components/UI/Badge';

type PricingVersion = {
    id: number;
    provider: string;
    country_code?: string | null;
    currency: string;
    effective_from: string;
    effective_to?: string | null;
    is_active: boolean;
    notes?: string | null;
    rates: Array<{
        id: number;
        category: string;
        pricing_model?: string | null;
        amount_minor: number;
    }>;
};

type LegacyDefault = {
    country_code: string;
    currency: string;
    rates: Record<string, number>;
    source: string;
};

type FormData = {
    country_code: string;
    currency: string;
    effective_from: string;
    effective_to: string;
    is_active: boolean;
    notes: string;
    rates: {
        marketing: number;
        utility: number;
        authentication: number;
        service: number;
    };
};

export default function PlatformMetaPricingIndex({
    versions,
    legacy_default,
}: {
    versions: PricingVersion[];
    legacy_default: LegacyDefault;
}) {
    const { auth } = usePage().props as any;
    const { data, setData, post, processing, errors, reset } = useForm<FormData>({
        country_code: legacy_default?.country_code || 'IN',
        currency: legacy_default?.currency || 'INR',
        effective_from: new Date().toISOString().slice(0, 16),
        effective_to: '',
        is_active: true,
        notes: 'Meta WhatsApp conversation pricing (versioned)',
        rates: {
            marketing: Number(legacy_default?.rates?.marketing || 0),
            utility: Number(legacy_default?.rates?.utility || 0),
            authentication: Number(legacy_default?.rates?.authentication || 0),
            service: Number(legacy_default?.rates?.service || 0),
        },
    });

    const money = (minor: number, currency: string) =>
        new Intl.NumberFormat('en-IN', { style: 'currency', currency, minimumFractionDigits: 2 }).format((minor || 0) / 100);

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('platform.meta-pricing.store'), {
            preserveScroll: true,
            onSuccess: () => {
                reset('notes');
                setData('effective_from', new Date().toISOString().slice(0, 16));
            },
        });
    };

    return (
        <PlatformShell auth={auth}>
            <Head title="Meta Pricing" />
            <div className="space-y-6">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Meta Pricing</h1>
                        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                            Versioned WhatsApp conversation pricing for tenant billing estimates.
                        </p>
                    </div>
                    <Button
                        type="button"
                        variant="secondary"
                        onClick={() => router.post(route('platform.meta-pricing.import-legacy'), {}, { preserveScroll: true })}
                    >
                        Import Legacy Rates
                    </Button>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Create Pricing Version</CardTitle>
                        <CardDescription>
                            Legacy source: {legacy_default.source} ({legacy_default.country_code}/{legacy_default.currency})
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={submit} className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                <div>
                                    <Label htmlFor="country_code">Country Code</Label>
                                    <Input id="country_code" value={data.country_code} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setData('country_code', e.target.value.toUpperCase())} maxLength={2} />
                                    <InputError message={(errors as any).country_code} className="mt-1" />
                                </div>
                                <div>
                                    <Label htmlFor="currency">Currency</Label>
                                    <Input id="currency" value={data.currency} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setData('currency', e.target.value.toUpperCase())} maxLength={3} />
                                    <InputError message={(errors as any).currency} className="mt-1" />
                                </div>
                                <div>
                                    <Label htmlFor="effective_from">Effective From</Label>
                                    <Input id="effective_from" type="datetime-local" value={data.effective_from} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setData('effective_from', e.target.value)} />
                                    <InputError message={(errors as any).effective_from} className="mt-1" />
                                </div>
                                <div>
                                    <Label htmlFor="effective_to">Effective To (Optional)</Label>
                                    <Input id="effective_to" type="datetime-local" value={data.effective_to} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setData('effective_to', e.target.value)} />
                                    <InputError message={(errors as any).effective_to} className="mt-1" />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                {(['marketing', 'utility', 'authentication', 'service'] as const).map((category) => (
                                    <div key={category}>
                                        <Label htmlFor={`rate_${category}`}>{category[0].toUpperCase() + category.slice(1)} Rate (minor)</Label>
                                        <Input
                                            id={`rate_${category}`}
                                            type="number"
                                            min={0}
                                            value={data.rates[category]}
                                            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                                                setData('rates', {
                                                    ...data.rates,
                                                    [category]: Number(e.target.value || 0),
                                                })
                                            }
                                        />
                                        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                                            {money(Number(data.rates[category] || 0), data.currency || 'INR')}
                                        </p>
                                        <InputError message={(errors as any)[`rates.${category}`]} className="mt-1" />
                                    </div>
                                ))}
                            </div>

                            <div>
                                <Label htmlFor="notes">Notes</Label>
                                <textarea
                                    id="notes"
                                    rows={3}
                                    value={data.notes}
                                    onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setData('notes', e.target.value)}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100"
                                />
                                <InputError message={(errors as any).notes} className="mt-1" />
                            </div>

                            <label className="inline-flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                                <input
                                    type="checkbox"
                                    checked={data.is_active}
                                    onChange={(e) => setData('is_active', e.target.checked)}
                                    className="rounded border-gray-300"
                                />
                                Activate immediately (deactivates existing active version for same country)
                            </label>

                            <div className="flex justify-end">
                                <Button type="submit" disabled={processing}>
                                    {processing ? 'Saving...' : 'Create Version'}
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Pricing Versions</CardTitle>
                        <CardDescription>{versions.length} version(s)</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {versions.length === 0 && (
                            <p className="text-sm text-gray-500 dark:text-gray-400">No versioned Meta pricing configured yet.</p>
                        )}

                        {versions.map((version) => {
                            const rateMap = Object.fromEntries(version.rates.map((r) => [r.category, r.amount_minor]));
                            return (
                                <div key={version.id} className="rounded-lg border border-gray-200 dark:border-gray-800 p-4">
                                    <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                                        <div className="space-y-2">
                                            <div className="flex items-center gap-2 flex-wrap">
                                                <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">Version #{version.id}</span>
                                                <Badge variant={version.is_active ? 'success' : 'default'}>
                                                    {version.is_active ? 'Active' : 'Inactive'}
                                                </Badge>
                                                <Badge variant="info">
                                                    {(version.country_code || 'GLOBAL')}/{version.currency}
                                                </Badge>
                                            </div>
                                            <div className="text-xs text-gray-500 dark:text-gray-400">
                                                Effective: {new Date(version.effective_from).toLocaleString()}
                                                {version.effective_to ? ` → ${new Date(version.effective_to).toLocaleString()}` : ' → open-ended'}
                                            </div>
                                            {version.notes && (
                                                <p className="text-sm text-gray-700 dark:text-gray-300">{version.notes}</p>
                                            )}
                                            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
                                                {(['marketing', 'utility', 'authentication', 'service'] as const).map((category) => (
                                                    <div key={category} className="rounded bg-gray-50 dark:bg-gray-800 px-2 py-1">
                                                        <div className="text-gray-500 dark:text-gray-400 capitalize">{category}</div>
                                                        <div className="font-semibold text-gray-900 dark:text-gray-100">
                                                            {money(Number(rateMap[category] || 0), version.currency)}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                        <div className="flex gap-2">
                                            <Button
                                                type="button"
                                                variant={version.is_active ? 'secondary' : 'primary'}
                                                onClick={() => router.post(route('platform.meta-pricing.toggle', { version: version.id }), {}, { preserveScroll: true })}
                                            >
                                                {version.is_active ? 'Deactivate' : 'Activate'}
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </CardContent>
                </Card>
            </div>
        </PlatformShell>
    );
}
