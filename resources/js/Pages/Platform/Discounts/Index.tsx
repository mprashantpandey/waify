import { Head, router, usePage } from '@inertiajs/react';
import { useEffect, useMemo, useState } from 'react';
import PlatformShell from '@/Layouts/PlatformShell';
import { Card, CardContent } from '@/Components/UI/Card';
import Button from '@/Components/UI/Button';
import { Badge } from '@/Components/UI/Badge';
import TextInput from '@/Components/TextInput';
import { Drawer, PageHeader, StatusBadge, ThemedIconTile, Toolbar } from '@/Components/UI/Elements';
import { BadgePercent, CheckCircle2, Edit3, Gift, IndianRupee, Plus, Search, TicketPercent, ToggleLeft, ToggleRight } from 'lucide-react';
import { useToast } from '@/hooks/useToast';

interface Discount {
    id: number;
    code: string;
    name: string;
    discount_type: 'percent' | 'fixed';
    percent_off: number | null;
    amount_off: number | null;
    currency: string;
    duration: 'once' | 'recurring' | 'forever';
    duration_cycles: number | null;
    is_active: boolean;
    redemptions: number;
    max_redemptions: number | null;
    plan_keys: string[] | null;
    new_user_only: boolean;
}

interface PlanOption {
    key: string;
    name: string;
}

type DiscountForm = {
    code: string;
    name: string;
    discount_type: 'percent' | 'fixed';
    percent_off: number;
    amount_off: number;
    currency: string;
    duration: 'once' | 'recurring' | 'forever';
    duration_cycles: string;
    max_redemptions: string;
    plan_keys: string[];
    new_user_only: boolean;
    is_active: boolean;
};

function blankForm(defaultCurrency: string): DiscountForm {
    return {
        code: '',
        name: '',
        discount_type: 'percent',
        percent_off: 10,
        amount_off: 0,
        currency: defaultCurrency || 'INR',
        duration: 'once',
        duration_cycles: '',
        max_redemptions: '',
        plan_keys: [],
        new_user_only: true,
        is_active: true,
    };
}

function formFromDiscount(discount: Discount): DiscountForm {
    return {
        code: discount.code,
        name: discount.name,
        discount_type: discount.discount_type,
        percent_off: discount.percent_off || 10,
        amount_off: discount.amount_off || 0,
        currency: discount.currency,
        duration: discount.duration,
        duration_cycles: discount.duration_cycles ? String(discount.duration_cycles) : '',
        max_redemptions: discount.max_redemptions ? String(discount.max_redemptions) : '',
        plan_keys: discount.plan_keys || [],
        new_user_only: Boolean(discount.new_user_only),
        is_active: discount.is_active,
    };
}

function formatAmount(discount: Pick<Discount, 'discount_type' | 'percent_off' | 'amount_off' | 'currency'>) {
    if (discount.discount_type === 'percent') return `${discount.percent_off || 0}%`;
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: discount.currency || 'INR' }).format((discount.amount_off || 0) / 100);
}

function StatCard({ label, value, icon: Icon, tone = 'green' }: { label: string; value: string | number; icon: any; tone?: 'green' | 'blue' | 'amber' | 'purple' }) {
    return (
        <Card>
            <CardContent className="p-5">
                <div className="flex items-start justify-between">
                    <div>
                        <p className="text-sm text-waify-text-muted dark:text-waify-dark-text-muted">{label}</p>
                        <p className="mt-2 text-2xl font-bold text-waify-text dark:text-waify-dark-text">{value}</p>
                    </div>
                    <ThemedIconTile tone={tone}><Icon className="h-5 w-5" /></ThemedIconTile>
                </div>
            </CardContent>
        </Card>
    );
}

function DiscountDrawer({
    open,
    discount,
    plans,
    defaultCurrency,
    onClose,
}: {
    open: boolean;
    discount: Discount | null;
    plans: PlanOption[];
    defaultCurrency: string;
    onClose: () => void;
}) {
    const { addToast } = useToast();
    const [form, setForm] = useState<DiscountForm>(() => discount ? formFromDiscount(discount) : blankForm(defaultCurrency));

    useEffect(() => {
        setForm(discount ? formFromDiscount(discount) : blankForm(defaultCurrency));
    }, [discount, defaultCurrency]);

    const submit = () => {
        const payload = {
            ...form,
            code: form.code.toUpperCase().trim(),
            duration_cycles: form.duration_cycles ? Number(form.duration_cycles) : null,
            max_redemptions: form.max_redemptions ? Number(form.max_redemptions) : null,
            amount_off: form.discount_type === 'fixed' ? Number(form.amount_off) : null,
            percent_off: form.discount_type === 'percent' ? Number(form.percent_off) : null,
        };

        const options = {
            preserveScroll: true,
            onSuccess: () => {
                addToast({ title: discount ? 'Discount updated' : 'Discount created', variant: 'success' });
                onClose();
            },
            onError: () => addToast({ title: discount ? 'Failed to update discount' : 'Failed to create discount', variant: 'error' }),
        };

        if (discount) {
            router.patch(route('platform.discounts.update', { discount: discount.id }), payload, options);
        } else {
            router.post(route('platform.discounts.store'), payload, options);
        }
    };

    return (
        <Drawer
            open={open}
            onClose={onClose}
            title={discount ? `Edit ${discount.code}` : 'Create promo'}
            description="Promo code, duration, first-purchase eligibility, and eligible plans."
            className="sm:max-w-2xl"
            footer={(
                <div className="flex justify-end gap-2">
                    <Button type="button" variant="secondary" onClick={onClose}>Cancel</Button>
                    <Button type="button" onClick={submit}>{discount ? 'Save discount' : 'Create discount'}</Button>
                </div>
            )}
        >
            <div className="space-y-5">
                <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                        <label className="mb-1.5 block text-sm font-medium text-waify-text dark:text-waify-dark-text">Code</label>
                        <TextInput value={form.code} onChange={(event) => setForm({ ...form, code: event.target.value.toUpperCase() })} placeholder="WELCOME20" className="w-full font-mono" />
                    </div>
                    <div>
                        <label className="mb-1.5 block text-sm font-medium text-waify-text dark:text-waify-dark-text">Name</label>
                        <TextInput value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} placeholder="Launch offer" className="w-full" />
                    </div>
                    <div>
                        <label className="mb-1.5 block text-sm font-medium text-waify-text dark:text-waify-dark-text">Type</label>
                        <select className="waify-input" value={form.discount_type} onChange={(event) => setForm({ ...form, discount_type: event.target.value as DiscountForm['discount_type'] })}>
                            <option value="percent">Percent</option>
                            <option value="fixed">Fixed amount</option>
                        </select>
                    </div>
                    <div>
                        <label className="mb-1.5 block text-sm font-medium text-waify-text dark:text-waify-dark-text">{form.discount_type === 'percent' ? 'Percent off' : 'Amount off (minor units)'}</label>
                        <TextInput
                            type="number"
                            min="1"
                            max={form.discount_type === 'percent' ? 100 : undefined}
                            value={form.discount_type === 'percent' ? form.percent_off : form.amount_off}
                            onChange={(event) => setForm(form.discount_type === 'percent' ? { ...form, percent_off: Number(event.target.value) } : { ...form, amount_off: Number(event.target.value) })}
                            className="w-full"
                        />
                    </div>
                    <div>
                        <label className="mb-1.5 block text-sm font-medium text-waify-text dark:text-waify-dark-text">Duration</label>
                        <select className="waify-input" value={form.duration} onChange={(event) => setForm({ ...form, duration: event.target.value as DiscountForm['duration'] })}>
                            <option value="once">One time</option>
                            <option value="recurring">Recurring cycles</option>
                            <option value="forever">Forever</option>
                        </select>
                    </div>
                    <div>
                        <label className="mb-1.5 block text-sm font-medium text-waify-text dark:text-waify-dark-text">Cycles</label>
                        <TextInput disabled={form.duration !== 'recurring'} value={form.duration_cycles} onChange={(event) => setForm({ ...form, duration_cycles: event.target.value })} placeholder="Only for recurring" className="w-full" />
                    </div>
                    <div>
                        <label className="mb-1.5 block text-sm font-medium text-waify-text dark:text-waify-dark-text">Max redemptions</label>
                        <TextInput value={form.max_redemptions} onChange={(event) => setForm({ ...form, max_redemptions: event.target.value })} placeholder="Unlimited" className="w-full" />
                    </div>
                </div>

                <div>
                    <label className="mb-1.5 block text-sm font-medium text-waify-text dark:text-waify-dark-text">Eligible plans</label>
                    <select
                        multiple
                        className="min-h-32 w-full rounded-btn border border-gray-200 bg-white px-3 py-2 text-sm text-waify-text outline-none focus:border-waify-green focus:ring-2 focus:ring-waify-green/20 dark:border-waify-dark-border dark:bg-waify-dark-surface dark:text-waify-dark-text"
                        value={form.plan_keys}
                        onChange={(event) => setForm({ ...form, plan_keys: Array.from(event.target.selectedOptions).map((option) => option.value) })}
                    >
                        {plans.map((plan) => <option key={plan.key} value={plan.key}>{plan.name}</option>)}
                    </select>
                    <p className="mt-1 text-xs text-waify-text-muted dark:text-waify-dark-text-muted">Leave empty to allow all plans.</p>
                </div>

                <label className="flex items-center justify-between rounded-card border border-gray-100 p-4 dark:border-waify-dark-border">
                    <span>
                        <span className="block text-sm font-semibold text-waify-text dark:text-waify-dark-text">Active</span>
                        <span className="text-xs text-waify-text-muted dark:text-waify-dark-text-muted">Inactive codes are rejected during checkout preview and checkout.</span>
                    </span>
                    <input type="checkbox" checked={form.is_active} onChange={(event) => setForm({ ...form, is_active: event.target.checked })} className="h-4 w-4 rounded border-gray-300 text-waify-green focus:ring-waify-green" />
                </label>
                <label className="flex items-center justify-between rounded-card border border-gray-100 p-4 dark:border-waify-dark-border">
                    <span>
                        <span className="block text-sm font-semibold text-waify-text dark:text-waify-dark-text">New customer only</span>
                        <span className="text-xs text-waify-text-muted dark:text-waify-dark-text-muted">Apply this promo only when the owner email has no paid Zyptos order yet.</span>
                    </span>
                    <input type="checkbox" checked={form.new_user_only} onChange={(event) => setForm({ ...form, new_user_only: event.target.checked })} className="h-4 w-4 rounded border-gray-300 text-waify-green focus:ring-waify-green" />
                </label>
            </div>
        </Drawer>
    );
}

export default function DiscountsIndex({ discounts, plans, default_currency }: { discounts: Discount[]; plans: PlanOption[]; default_currency: string }) {
    const { auth } = usePage().props as any;
    const { addToast } = useToast();
    const [query, setQuery] = useState('');
    const [scope, setScope] = useState<'all' | 'active' | 'inactive'>('all');
    const [editing, setEditing] = useState<Discount | null>(null);
    const [createOpen, setCreateOpen] = useState(false);

    const filtered = useMemo(() => discounts.filter((discount) => {
        const q = query.trim().toLowerCase();
        const matchesQuery = !q || discount.code.toLowerCase().includes(q) || discount.name.toLowerCase().includes(q);
        const matchesScope = scope === 'all' || (scope === 'active' ? discount.is_active : !discount.is_active);

        return matchesQuery && matchesScope;
    }), [discounts, query, scope]);

    const toggle = (discount: Discount) => {
        router.post(route('platform.discounts.toggle', { discount: discount.id }), {}, {
            preserveScroll: true,
            onSuccess: () => addToast({ title: 'Discount status updated', variant: 'success' }),
            onError: () => addToast({ title: 'Failed to update discount', variant: 'error' }),
        });
    };

    return (
        <PlatformShell auth={auth}>
            <Head title="Discounts" />
            <div className="space-y-6">
                <PageHeader
                    title="Discounts"
                    description="Manage promo codes, first-purchase offers, duration, and plan eligibility."
                    actions={<Button type="button" onClick={() => setCreateOpen(true)}><Plus className="h-4 w-4" />Create promo</Button>}
                />

                <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
                    <StatCard label="Discounts" value={discounts.length} icon={TicketPercent} />
                    <StatCard label="Active" value={discounts.filter((discount) => discount.is_active).length} icon={CheckCircle2} tone="blue" />
                    <StatCard label="Redemptions" value={discounts.reduce((sum, discount) => sum + discount.redemptions, 0)} icon={Gift} tone="purple" />
                    <StatCard label="Fixed amount promos" value={discounts.filter((discount) => discount.discount_type === 'fixed').length} icon={IndianRupee} tone="amber" />
                </div>

                <Toolbar
                    search={{ value: query, onChange: setQuery, placeholder: 'Search discounts' }}
                    filters={(
                        <div className="flex gap-1.5">
                            {[
                                ['all', 'All'],
                                ['active', 'Active'],
                                ['inactive', 'Inactive'],
                            ].map(([id, label]) => (
                                <button key={id} type="button" onClick={() => setScope(id as any)} className={`h-8 rounded-btn px-3 text-xs font-semibold ${scope === id ? 'bg-waify-text text-white dark:bg-waify-dark-text dark:text-waify-dark-bg' : 'bg-gray-100 text-waify-text-muted dark:bg-waify-dark-surface-2 dark:text-waify-dark-text-muted'}`}>
                                    {label}
                                </button>
                            ))}
                        </div>
                    )}
                />

                <div className="grid gap-4 xl:grid-cols-2">
                    {filtered.map((discount) => (
                        <Card key={discount.id} className="transition hover:border-waify-green/40 hover:shadow-card-lg dark:hover:border-emerald-400/30">
                            <CardContent className="p-5">
                                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                                    <div className="flex min-w-0 gap-4">
                                        <ThemedIconTile tone={discount.is_active ? 'green' : 'gray'} size="lg">
                                            <BadgePercent className="h-5 w-5" />
                                        </ThemedIconTile>
                                        <div className="min-w-0">
                                            <div className="flex flex-wrap items-center gap-2">
                                                <h3 className="font-mono text-base font-bold text-waify-text dark:text-waify-dark-text">{discount.code}</h3>
                                                <Badge variant={discount.is_active ? 'success' : 'secondary'}>{discount.is_active ? 'Active' : 'Inactive'}</Badge>
                                                <StatusBadge tone="info">{formatAmount(discount)}</StatusBadge>
                                            </div>
                                            <p className="mt-1 text-sm font-semibold text-waify-text dark:text-waify-dark-text">{discount.name}</p>
                                            <p className="mt-2 text-sm text-waify-text-muted dark:text-waify-dark-text-muted">
                                                {discount.duration}{discount.duration_cycles ? ` · ${discount.duration_cycles} cycles` : ''} · {discount.plan_keys?.length ? discount.plan_keys.join(', ') : 'All plans'}
                                            </p>
                                            <p className="mt-2 text-xs text-waify-text-muted dark:text-waify-dark-text-muted">
                                                Uses: {discount.redemptions}{discount.max_redemptions ? ` / ${discount.max_redemptions}` : ''}{discount.new_user_only ? ' · New customers only' : ''}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex shrink-0 flex-wrap gap-2 sm:justify-end">
                                        <Button type="button" size="sm" variant="secondary" onClick={() => setEditing(discount)}><Edit3 className="h-4 w-4" />Edit</Button>
                                        <Button type="button" size="sm" variant={discount.is_active ? 'warning' : 'primary'} onClick={() => toggle(discount)}>
                                            {discount.is_active ? <ToggleRight className="h-4 w-4" /> : <ToggleLeft className="h-4 w-4" />}
                                            {discount.is_active ? 'Disable' : 'Enable'}
                                        </Button>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                {filtered.length === 0 && (
                    <Card>
                        <CardContent className="p-10 text-center">
                            <Search className="mx-auto h-10 w-10 text-waify-text-muted dark:text-waify-dark-text-muted" />
                            <p className="mt-3 font-semibold text-waify-text dark:text-waify-dark-text">No discounts found</p>
                            <p className="mt-1 text-sm text-waify-text-muted dark:text-waify-dark-text-muted">Create a promo or adjust your filters.</p>
                        </CardContent>
                    </Card>
                )}
            </div>

            <DiscountDrawer open={createOpen} discount={null} plans={plans} defaultCurrency={default_currency} onClose={() => setCreateOpen(false)} />
            <DiscountDrawer open={!!editing} discount={editing} plans={plans} defaultCurrency={default_currency} onClose={() => setEditing(null)} />
        </PlatformShell>
    );
}
