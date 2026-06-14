import { Head, Link, router, useForm, usePage } from '@inertiajs/react';
import { useEffect, useMemo, useState } from 'react';
import {
    Archive,
    Check,
    CreditCard,
    Eye,
    Globe2,
    IndianRupee,
    Layers3,
    Pencil,
    Plus,
    Sparkles,
    Users,
} from 'lucide-react';
import PlatformShell from '@/Layouts/PlatformShell';
import { Card, CardContent } from '@/Components/UI/Card';
import Button from '@/Components/UI/Button';
import { Badge } from '@/Components/UI/Badge';
import { Drawer } from '@/Components/UI/Elements';
import { useToast } from '@/hooks/useToast';
import { cn } from '@/lib/utils';

interface Plan {
    id: number;
    key: string;
    name: string;
    description: string | null;
    price_monthly: number | null;
    price_yearly: number | null;
    currency: string;
    is_active: boolean;
    is_public: boolean;
    trial_days: number;
    sort_order: number;
    limits?: Record<string, number>;
    modules?: string[];
    subscriptions_count: number;
}

interface Module {
    id: number;
    key: string;
    name: string;
}

interface PlanDetail extends Plan {
    limits: Record<string, number>;
    modules: string[];
    subscriptions?: Array<{
        id: number;
        account: { id: number; name: string; slug: string };
        status: string;
        started_at: string | null;
    }>;
}

interface Props {
    plans: Plan[];
    modules?: Module[];
    moduleNames?: Record<string, string>;
    selectedPlan?: PlanDetail | null;
    default_currency?: string;
}

function formatMoney(amount: number | null | undefined, currency: string) {
    if (amount === null || amount === undefined) {
        return 'Custom';
    }

    if (amount === 0) {
        return '₹0';
    }

    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: currency || 'INR',
        maximumFractionDigits: 0,
    }).format(amount / 100);
}

function compactNumber(value: number) {
    return new Intl.NumberFormat('en-IN', { maximumFractionDigits: 1, notation: 'compact' }).format(value);
}

function InfoBanner() {
    return (
        <div className="flex items-start gap-3 rounded-card border border-sky-100 bg-sky-50 px-4 py-3 text-sm text-sky-900 dark:border-sky-400/20 dark:bg-sky-500/10 dark:text-sky-100">
            <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-btn bg-white text-sky-600 shadow-sm dark:bg-sky-400/15 dark:text-sky-100">
                <Sparkles className="h-4 w-4" />
            </div>
            <div>
                <p className="font-semibold">Plans control checkout pricing, entitlements, and workspace limits.</p>
                <p className="mt-1 text-xs text-sky-700 dark:text-sky-200/80">
                    Changes use the existing billing rules and apply wherever the plan is consumed by subscriptions.
                </p>
            </div>
        </div>
    );
}

function StatCard({
    label,
    value,
    sub,
    icon: Icon,
}: {
    label: string;
    value: string | number;
    sub: string;
    icon: typeof Users;
}) {
    return (
        <Card>
            <CardContent className="flex items-center gap-4 p-4">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-btn bg-emerald-50 text-waify-green dark:bg-emerald-400/10 dark:text-emerald-200">
                    <Icon className="h-5 w-5" />
                </div>
                <div className="min-w-0">
                    <p className="text-xs font-medium uppercase tracking-[0.12em] text-waify-text-muted dark:text-waify-dark-text-muted">{label}</p>
                    <p className="mt-1 text-2xl font-bold tabular-nums text-waify-text dark:text-waify-dark-text">{value}</p>
                    <p className="mt-0.5 truncate text-xs text-waify-text-muted dark:text-waify-dark-text-muted">{sub}</p>
                </div>
            </CardContent>
        </Card>
    );
}

function PlanFeatures({ plan }: { plan: Plan }) {
    const features = [
        `${plan.trial_days || 0} day trial window`,
        plan.price_monthly === null ? 'Custom monthly checkout' : `${formatMoney(plan.price_monthly, plan.currency)} monthly checkout`,
        plan.price_yearly === null ? 'Custom annual checkout' : `${formatMoney(plan.price_yearly, plan.currency)} annual checkout`,
        plan.is_public ? 'Visible on public pricing' : 'Private/admin-assigned only',
    ];

    return (
        <ul className="min-h-[132px] space-y-2 px-5 py-4 text-sm text-waify-text dark:text-waify-dark-text">
            {features.map((feature) => (
                <li key={feature} className="flex items-start gap-2">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-waify-green dark:text-emerald-300" />
                    <span>{feature}</span>
                </li>
            ))}
        </ul>
    );
}

const defaultLimits = {
    agents: 1,
    whatsapp_connections: 1,
    messages_monthly: 500,
    template_sends_monthly: 0,
    ai_credits_monthly: 0,
    retention_days: 30,
};

function PlanFormDrawer({
    mode,
    open,
    plan,
    modules,
    defaultCurrency,
    onClose,
}: {
    mode: 'create' | 'edit';
    open: boolean;
    plan?: PlanDetail | null;
    modules: Module[];
    defaultCurrency: string;
    onClose: () => void;
}) {
    const form = useForm({
        key: plan?.key || '',
        name: plan?.name || '',
        description: plan?.description || '',
        price_monthly: plan?.price_monthly ?? null as number | null,
        price_yearly: plan?.price_yearly ?? null as number | null,
        is_active: plan?.is_active ?? true,
        is_public: plan?.is_public ?? true,
        trial_days: plan?.trial_days ?? 0,
        sort_order: plan?.sort_order ?? 0,
        limits: { ...defaultLimits, ...(plan?.limits || {}) },
        modules: plan?.modules || [] as string[],
    });

    useEffect(() => {
        form.setData({
            key: plan?.key || '',
            name: plan?.name || '',
            description: plan?.description || '',
            price_monthly: plan?.price_monthly ?? null,
            price_yearly: plan?.price_yearly ?? null,
            is_active: plan?.is_active ?? true,
            is_public: plan?.is_public ?? true,
            trial_days: plan?.trial_days ?? 0,
            sort_order: plan?.sort_order ?? 0,
            limits: { ...defaultLimits, ...(plan?.limits || {}) },
            modules: plan?.modules || [],
        });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [plan?.id, open, mode]);

    const toggleModule = (moduleKey: string) => {
        form.setData('modules', form.data.modules.includes(moduleKey)
            ? form.data.modules.filter((key) => key !== moduleKey)
            : [...form.data.modules, moduleKey]);
    };

    const updateLimit = (key: string, value: string) => {
        form.setData('limits', {
            ...form.data.limits,
            [key]: value === '' || value === '-1' ? -1 : parseInt(value, 10) || 0,
        });
    };

    const submit = (event: React.FormEvent) => {
        event.preventDefault();
        if (mode === 'edit' && plan) {
            form.patch(route('platform.plans.update', { plan: plan.key }), {
                preserveScroll: true,
                onSuccess: onClose,
            });
            return;
        }

        form.post(route('platform.plans.store'), {
            preserveScroll: true,
            onSuccess: onClose,
        });
    };

    return (
        <Drawer
            open={open}
            onClose={onClose}
            title={mode === 'edit' ? `Edit ${plan?.name || 'plan'}` : 'Create plan'}
            description={`Prices use ${defaultCurrency}. Enter values in the smallest unit, for example 99900 for 999.`}
            className="sm:max-w-5xl"
            footer={
                <div className="flex justify-end gap-2">
                    <Button type="button" variant="secondary" onClick={onClose}>Cancel</Button>
                    <Button type="submit" form="platform-plan-form" disabled={form.processing}>
                        {form.processing ? 'Saving...' : mode === 'edit' ? 'Save plan' : 'Create plan'}
                    </Button>
                </div>
            }
        >
            <form id="platform-plan-form" onSubmit={submit} className="space-y-5">
                <div className="grid gap-4 md:grid-cols-2">
                    <div>
                        <label className="mb-1.5 block text-sm font-medium text-waify-text dark:text-waify-dark-text">Plan key</label>
                        <input
                            value={form.data.key}
                            onChange={(event) => form.setData('key', event.target.value)}
                            disabled={mode === 'edit'}
                            placeholder="growth"
                            className="waify-input"
                        />
                        {form.errors.key && <p className="mt-1 text-xs text-red-600 dark:text-red-300">{form.errors.key}</p>}
                    </div>
                    <div>
                        <label className="mb-1.5 block text-sm font-medium text-waify-text dark:text-waify-dark-text">Plan name</label>
                        <input value={form.data.name} onChange={(event) => form.setData('name', event.target.value)} placeholder="Growth" className="waify-input" />
                        {form.errors.name && <p className="mt-1 text-xs text-red-600 dark:text-red-300">{form.errors.name}</p>}
                    </div>
                </div>

                <div>
                    <label className="mb-1.5 block text-sm font-medium text-waify-text dark:text-waify-dark-text">Description</label>
                    <textarea value={form.data.description} onChange={(event) => form.setData('description', event.target.value)} rows={3} className="waify-input min-h-24 py-2" />
                </div>

                <div className="grid gap-4 md:grid-cols-4">
                    <div>
                        <label className="mb-1.5 block text-sm font-medium text-waify-text dark:text-waify-dark-text">Monthly price</label>
                        <input type="number" min="0" value={form.data.price_monthly ?? ''} onChange={(event) => form.setData('price_monthly', event.target.value ? Number(event.target.value) : null)} className="waify-input" />
                    </div>
                    <div>
                        <label className="mb-1.5 block text-sm font-medium text-waify-text dark:text-waify-dark-text">Yearly price</label>
                        <input type="number" min="0" value={form.data.price_yearly ?? ''} onChange={(event) => form.setData('price_yearly', event.target.value ? Number(event.target.value) : null)} className="waify-input" />
                    </div>
                    <div>
                        <label className="mb-1.5 block text-sm font-medium text-waify-text dark:text-waify-dark-text">Trial days</label>
                        <input type="number" min="0" value={form.data.trial_days} onChange={(event) => form.setData('trial_days', Number(event.target.value) || 0)} className="waify-input" />
                    </div>
                    <div>
                        <label className="mb-1.5 block text-sm font-medium text-waify-text dark:text-waify-dark-text">Sort order</label>
                        <input type="number" min="0" value={form.data.sort_order} onChange={(event) => form.setData('sort_order', Number(event.target.value) || 0)} className="waify-input" />
                    </div>
                </div>

                <div className="grid gap-3 md:grid-cols-2">
                    <label className="flex items-center justify-between rounded-card border border-gray-100 p-3 dark:border-waify-dark-border">
                        <span>
                            <span className="block text-sm font-medium text-waify-text dark:text-waify-dark-text">Active</span>
                            <span className="text-xs text-waify-text-muted dark:text-waify-dark-text-muted">Available for new and existing subscription operations.</span>
                        </span>
                        <input type="checkbox" checked={form.data.is_active} onChange={(event) => form.setData('is_active', event.target.checked)} className="rounded border-gray-300 text-waify-green focus:ring-waify-green/30" />
                    </label>
                    <label className="flex items-center justify-between rounded-card border border-gray-100 p-3 dark:border-waify-dark-border">
                        <span>
                            <span className="block text-sm font-medium text-waify-text dark:text-waify-dark-text">Public</span>
                            <span className="text-xs text-waify-text-muted dark:text-waify-dark-text-muted">Visible on customer pricing and billing screens.</span>
                        </span>
                        <input type="checkbox" checked={form.data.is_public} onChange={(event) => form.setData('is_public', event.target.checked)} className="rounded border-gray-300 text-waify-green focus:ring-waify-green/30" />
                    </label>
                </div>

                <div>
                    <p className="mb-3 text-sm font-semibold text-waify-text dark:text-waify-dark-text">Limits</p>
                    <div className="grid gap-3 md:grid-cols-3">
                        {Object.entries(form.data.limits).map(([key, value]) => (
                            <div key={key}>
                                <label className="mb-1.5 block text-xs font-medium capitalize text-waify-text-muted dark:text-waify-dark-text-muted">{key.replaceAll('_', ' ')}</label>
                                <input type="number" value={value === -1 ? '' : value} onChange={(event) => updateLimit(key, event.target.value)} placeholder="-1 for unlimited" className="waify-input" />
                            </div>
                        ))}
                    </div>
                    {form.errors.limits && <p className="mt-2 text-xs text-red-600 dark:text-red-300">{form.errors.limits}</p>}
                </div>

                <div>
                    <p className="mb-3 text-sm font-semibold text-waify-text dark:text-waify-dark-text">Included modules</p>
                    <div className="grid gap-2 md:grid-cols-2 xl:grid-cols-3">
                        {modules.map((module) => (
                            <label key={module.id} className="flex cursor-pointer items-center gap-2 rounded-card border border-gray-100 p-3 transition hover:bg-gray-50 dark:border-waify-dark-border dark:hover:bg-waify-dark-surface-2">
                                <input type="checkbox" checked={form.data.modules.includes(module.key)} onChange={() => toggleModule(module.key)} className="rounded border-gray-300 text-waify-green focus:ring-waify-green/30" />
                                <span className="text-sm font-medium text-waify-text dark:text-waify-dark-text">{module.name}</span>
                            </label>
                        ))}
                    </div>
                    {form.errors.modules && <p className="mt-2 text-xs text-red-600 dark:text-red-300">{form.errors.modules}</p>}
                </div>
            </form>
        </Drawer>
    );
}

function PlanDetailDrawer({
    plan,
    moduleNames,
    onClose,
    onEdit,
}: {
    plan: PlanDetail | null;
    moduleNames: Record<string, string>;
    onClose: () => void;
    onEdit: () => void;
}) {
    if (!plan) return null;

    return (
        <Drawer open={!!plan} onClose={onClose} title={plan.name} description="Plan pricing, entitlements, limits, and current workspace subscriptions." className="sm:max-w-5xl">
            <div className="space-y-5">
                <div className="grid gap-4 sm:grid-cols-4">
                    <StatCard label="Monthly" value={formatMoney(plan.price_monthly, plan.currency)} sub="Checkout price" icon={CreditCard} />
                    <StatCard label="Annual" value={formatMoney(plan.price_yearly, plan.currency)} sub="Checkout price" icon={CreditCard} />
                    <StatCard label="Trial" value={`${plan.trial_days || 0}d`} sub="Trial window" icon={Sparkles} />
                    <StatCard label="Subscribers" value={plan.subscriptions_count} sub="Current workspaces" icon={Users} />
                </div>
                <Card>
                    <CardContent className="p-5">
                        <div className="mb-3 flex items-center justify-between gap-3">
                            <div>
                                <p className="font-semibold text-waify-text dark:text-waify-dark-text">Plan configuration</p>
                                <p className="text-sm text-waify-text-muted dark:text-waify-dark-text-muted">{plan.description || 'No description added.'}</p>
                            </div>
                            <Button type="button" onClick={onEdit}><Pencil className="h-4 w-4" />Edit</Button>
                        </div>
                        <div className="grid gap-3 md:grid-cols-2">
                            <div className="rounded-card bg-gray-50 p-3 dark:bg-waify-dark-surface-2">
                                <p className="text-xs text-waify-text-muted dark:text-waify-dark-text-muted">Visibility</p>
                                <div className="mt-2 flex gap-2">
                                    <Badge variant={plan.is_active ? 'success' : 'default'}>{plan.is_active ? 'Active' : 'Archived'}</Badge>
                                    <Badge variant={plan.is_public ? 'info' : 'default'}>{plan.is_public ? 'Public' : 'Private'}</Badge>
                                </div>
                            </div>
                            <div className="rounded-card bg-gray-50 p-3 dark:bg-waify-dark-surface-2">
                                <p className="text-xs text-waify-text-muted dark:text-waify-dark-text-muted">Included modules</p>
                                <div className="mt-2 flex flex-wrap gap-1.5">
                                    {plan.modules?.length ? plan.modules.map((key) => <Badge key={key} variant="secondary">{moduleNames[key] || key}</Badge>) : <span className="text-sm text-waify-text-muted dark:text-waify-dark-text-muted">No modules</span>}
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <div className="grid gap-4 lg:grid-cols-[1fr,360px]">
                    <Card>
                        <CardContent className="p-5">
                            <p className="font-semibold text-waify-text dark:text-waify-dark-text">Limits</p>
                            <div className="mt-4 grid gap-3 sm:grid-cols-2">
                                {Object.entries(plan.limits || {}).map(([key, value]) => (
                                    <div key={key} className="rounded-card border border-gray-100 bg-gray-50/80 p-3 dark:border-waify-dark-border dark:bg-waify-dark-surface-2">
                                        <p className="text-xs capitalize text-waify-text-muted dark:text-waify-dark-text-muted">{key.replaceAll('_', ' ')}</p>
                                        <p className="mt-1 font-semibold text-waify-text dark:text-waify-dark-text">{value === -1 ? 'Unlimited' : compactNumber(value)}</p>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-5">
                            <p className="font-semibold text-waify-text dark:text-waify-dark-text">Subscriptions</p>
                            <div className="mt-4 space-y-2">
                                {plan.subscriptions?.length ? plan.subscriptions.map((subscription) => (
                                    <Link key={subscription.id} href={route('platform.accounts.show', { account: subscription.account.id })} className="block rounded-card border border-gray-100 p-3 transition hover:bg-gray-50 dark:border-waify-dark-border dark:hover:bg-waify-dark-surface-2">
                                        <div className="flex items-center justify-between gap-2">
                                            <span className="truncate text-sm font-medium text-waify-text dark:text-waify-dark-text">{subscription.account.name}</span>
                                            <Badge variant={subscription.status === 'active' ? 'success' : 'default'}>{subscription.status}</Badge>
                                        </div>
                                        <p className="mt-1 text-xs text-waify-text-muted dark:text-waify-dark-text-muted">{subscription.account.slug}</p>
                                    </Link>
                                )) : (
                                    <div className="rounded-card bg-gray-50 p-4 text-center text-sm text-waify-text-muted dark:bg-waify-dark-surface-2 dark:text-waify-dark-text-muted">No subscriptions yet.</div>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </Drawer>
    );
}

export default function PlansIndex({ plans, modules = [], moduleNames = {}, selectedPlan = null, default_currency = 'INR' }: Props) {
    const { auth } = usePage().props as any;
    const { addToast } = useToast();
    const [togglePlan, setTogglePlan] = useState<Plan | null>(null);
    const [createOpen, setCreateOpen] = useState(() => new URLSearchParams(window.location.search).get('panel') === 'create');
    const [editPlan, setEditPlan] = useState<PlanDetail | null>(() => new URLSearchParams(window.location.search).get('panel') === 'edit' ? selectedPlan || null : null);
    const [activePlan, setActivePlan] = useState<PlanDetail | null>(selectedPlan || null);

    useEffect(() => {
        setActivePlan(selectedPlan || null);
        if (new URLSearchParams(window.location.search).get('panel') === 'edit') {
            setEditPlan(selectedPlan || null);
        }
    }, [selectedPlan]);

    const closePlanPanels = () => {
        setCreateOpen(false);
        setEditPlan(null);
        setActivePlan(null);
        router.get(route('platform.plans.index'), {}, { preserveScroll: true, preserveState: true, replace: true });
    };

    const metrics = useMemo(() => {
        const totalSubscribers = plans.reduce((sum, plan) => sum + plan.subscriptions_count, 0);
        const publicPlans = plans.filter((plan) => plan.is_public).length;
        const activePlans = plans.filter((plan) => plan.is_active).length;
        const monthlyEstimate = plans.reduce((sum, plan) => sum + (plan.price_monthly || 0) * plan.subscriptions_count, 0);
        const mostUsedCount = Math.max(0, ...plans.map((plan) => plan.subscriptions_count));

        return { totalSubscribers, publicPlans, activePlans, monthlyEstimate, mostUsedCount };
    }, [plans]);

    const confirmToggle = () => {
        if (!togglePlan) {
            return;
        }

        router.post(
            route('platform.plans.toggle', { plan: togglePlan.key }),
            {},
            {
                preserveScroll: true,
                onSuccess: () => {
                    addToast({
                        title: 'Plan updated',
                        description: `${togglePlan.name} is now ${togglePlan.is_active ? 'archived' : 'active'}.`,
                        variant: 'success',
                    });
                    setTogglePlan(null);
                },
                onError: () => {
                    addToast({
                        title: 'Plan update failed',
                        description: 'The platform could not update this plan status.',
                        variant: 'error',
                    });
                },
            }
        );
    };

    return (
        <PlatformShell auth={auth}>
            <Head title="Plans" />

            <div className="space-y-6">
                <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="min-w-[280px] flex-1">
                        <InfoBanner />
                    </div>
                    <Button type="button" onClick={() => setCreateOpen(true)}>
                        <Plus className="h-4 w-4" />
                        Create plan
                    </Button>
                </div>

                <div className="grid gap-4 sm:grid-cols-3">
                    <StatCard label="Total subscribers" value={metrics.totalSubscribers.toLocaleString('en-IN')} sub="Across all plans" icon={Users} />
                    <StatCard
                        label="Monthly estimate"
                        value={formatMoney(metrics.monthlyEstimate, default_currency)}
                        sub="Based on current subscriptions"
                        icon={IndianRupee}
                    />
                    <StatCard label="Public plans" value={`${metrics.publicPlans}/${plans.length}`} sub={`${metrics.activePlans} active plans`} icon={Globe2} />
                </div>

                {plans.length === 0 ? (
                    <Card>
                        <CardContent className="py-16 text-center">
                            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-card bg-emerald-50 text-waify-green dark:bg-emerald-400/10 dark:text-emerald-200">
                                <CreditCard className="h-7 w-7" />
                            </div>
                            <h3 className="mt-4 text-lg font-semibold text-waify-text dark:text-waify-dark-text">No plans yet</h3>
                            <p className="mx-auto mt-2 max-w-md text-sm text-waify-text-muted dark:text-waify-dark-text-muted">
                                Create your first plan to power subscriptions, workspace billing, and public checkout.
                            </p>
                            <Button type="button" className="mt-5" onClick={() => setCreateOpen(true)}>
                                <Plus className="h-4 w-4" />
                                Create plan
                            </Button>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="grid gap-4 lg:grid-cols-2 xl:grid-cols-4">
                        {plans.map((plan) => {
                            const isMostUsed = metrics.mostUsedCount > 0 && plan.subscriptions_count === metrics.mostUsedCount;

                            return (
                                <Card
                                    key={plan.id}
                                    className={cn('overflow-hidden', isMostUsed && 'ring-2 ring-waify-green dark:ring-emerald-300/70')}
                                >
                                    <div className="border-b border-gray-100 p-5 dark:border-waify-dark-border">
                                        <div className="flex items-start justify-between gap-3">
                                            <div className="min-w-0">
                                                {isMostUsed && (
                                                    <Badge variant="success" className="mb-2">
                                                        Most used
                                                    </Badge>
                                                )}
                                                <h3 className="truncate text-lg font-bold text-waify-text dark:text-waify-dark-text">{plan.name}</h3>
                                                <p className="mt-1 text-2xl font-bold tabular-nums text-waify-text dark:text-waify-dark-text">
                                                    {formatMoney(plan.price_monthly, plan.currency)}
                                                    {!!plan.price_monthly && (
                                                        <span className="text-sm font-normal text-waify-text-muted dark:text-waify-dark-text-muted">/mo</span>
                                                    )}
                                                </p>
                                            </div>
                                            <Badge variant={plan.is_active ? 'success' : 'default'}>{plan.is_active ? 'Active' : 'Archived'}</Badge>
                                        </div>
                                        <p className="mt-2 line-clamp-2 min-h-[32px] text-xs text-waify-text-muted dark:text-waify-dark-text-muted">
                                            {plan.description || 'No public description has been added to this plan.'}
                                        </p>
                                    </div>

                                    <PlanFeatures plan={plan} />

                                    <div className="grid grid-cols-3 gap-2 border-t border-gray-100 bg-gray-50/80 px-5 py-3 text-center text-xs dark:border-waify-dark-border dark:bg-waify-dark-surface-2/60">
                                        <div>
                                            <div className="font-semibold tabular-nums text-waify-text dark:text-waify-dark-text">
                                                {formatMoney(plan.price_monthly, plan.currency)}
                                            </div>
                                            <div className="text-waify-text-muted dark:text-waify-dark-text-muted">Monthly</div>
                                        </div>
                                        <div>
                                            <div className="font-semibold tabular-nums text-waify-text dark:text-waify-dark-text">
                                                {formatMoney(plan.price_yearly, plan.currency)}
                                            </div>
                                            <div className="text-waify-text-muted dark:text-waify-dark-text-muted">Annual</div>
                                        </div>
                                        <div>
                                            <div className="font-semibold tabular-nums text-waify-text dark:text-waify-dark-text">
                                                {compactNumber(plan.subscriptions_count)}
                                            </div>
                                            <div className="text-waify-text-muted dark:text-waify-dark-text-muted">Subs</div>
                                        </div>
                                    </div>

                                    <div className="flex flex-wrap gap-2 border-t border-gray-100 p-4 dark:border-waify-dark-border">
                                        <Button size="sm" variant="secondary" onClick={() => {
                                            router.get(route('platform.plans.index'), { plan: plan.key, panel: 'edit' }, { preserveScroll: true, preserveState: true, replace: true });
                                        }}>
                                                <Pencil className="h-4 w-4" />
                                                Edit
                                        </Button>
                                        <Button size="sm" variant="ghost" onClick={() => {
                                            router.get(route('platform.plans.index'), { plan: plan.key }, { preserveScroll: true, preserveState: true, replace: true });
                                        }}>
                                                <Eye className="h-4 w-4" />
                                                View
                                        </Button>
                                        <Button size="sm" variant={plan.is_active ? 'danger' : 'secondary'} onClick={() => setTogglePlan(plan)}>
                                            <Archive className="h-4 w-4" />
                                            {plan.is_active ? 'Archive' : 'Activate'}
                                        </Button>
                                    </div>
                                </Card>
                            );
                        })}
                    </div>
                )}

                {plans.length > 0 && (
                    <Card className="overflow-hidden">
                        <div className="border-b border-gray-100 px-5 py-4 dark:border-waify-dark-border">
                            <div className="flex items-center gap-2">
                                <Layers3 className="h-4 w-4 text-waify-green dark:text-emerald-300" />
                                <h3 className="text-sm font-semibold text-waify-text dark:text-waify-dark-text">Plan limits matrix</h3>
                            </div>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b border-gray-100 bg-gray-50/60 text-left text-xs uppercase text-waify-text-muted dark:border-waify-dark-border dark:bg-waify-dark-surface-2/40 dark:text-waify-dark-text-muted">
                                        <th className="px-5 py-3">Plan</th>
                                        <th className="px-5 py-3">Monthly</th>
                                        <th className="px-5 py-3">Annual</th>
                                        <th className="px-5 py-3">Trial</th>
                                        <th className="px-5 py-3">Public</th>
                                        <th className="px-5 py-3">Status</th>
                                        <th className="px-5 py-3">Subscribers</th>
                                        <th className="px-5 py-3">Sort</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100 dark:divide-waify-dark-border">
                                    {plans.map((plan) => (
                                        <tr key={plan.id} className="text-waify-text dark:text-waify-dark-text">
                                            <td className="px-5 py-3 font-medium">{plan.name}</td>
                                            <td className="px-5 py-3 tabular-nums">{formatMoney(plan.price_monthly, plan.currency)}</td>
                                            <td className="px-5 py-3 tabular-nums">{formatMoney(plan.price_yearly, plan.currency)}</td>
                                            <td className="px-5 py-3">{plan.trial_days || 0} days</td>
                                            <td className="px-5 py-3">
                                                <Badge variant={plan.is_public ? 'success' : 'default'}>{plan.is_public ? 'Yes' : 'No'}</Badge>
                                            </td>
                                            <td className="px-5 py-3">
                                                <Badge variant={plan.is_active ? 'success' : 'default'}>{plan.is_active ? 'Active' : 'Archived'}</Badge>
                                            </td>
                                            <td className="px-5 py-3 tabular-nums">{plan.subscriptions_count.toLocaleString('en-IN')}</td>
                                            <td className="px-5 py-3 tabular-nums">{plan.sort_order}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </Card>
                )}
            </div>

            <Drawer
                open={!!togglePlan}
                onClose={() => setTogglePlan(null)}
                title={togglePlan?.is_active ? 'Archive plan' : 'Activate plan'}
                description={togglePlan ? `${togglePlan.name} will be updated across platform billing surfaces.` : undefined}
                footer={
                    <div className="flex justify-end gap-2">
                        <Button variant="secondary" onClick={() => setTogglePlan(null)}>
                            Cancel
                        </Button>
                        <Button variant={togglePlan?.is_active ? 'danger' : 'primary'} onClick={confirmToggle}>
                            {togglePlan?.is_active ? 'Archive plan' : 'Activate plan'}
                        </Button>
                    </div>
                }
            >
                <div className="space-y-4 text-sm text-waify-text dark:text-waify-dark-text">
                    <p>
                        {togglePlan?.is_active
                            ? 'Archiving hides this plan from new selection, while existing subscription records remain intact.'
                            : 'Activating makes this plan available wherever its visibility rules allow it.'}
                    </p>
                    {togglePlan && (
                        <div className="rounded-card border border-gray-100 bg-gray-50 p-4 dark:border-waify-dark-border dark:bg-waify-dark-surface-2">
                            <div className="font-semibold">{togglePlan.name}</div>
                            <div className="mt-1 text-waify-text-muted dark:text-waify-dark-text-muted">
                                {formatMoney(togglePlan.price_monthly, togglePlan.currency)} monthly · {togglePlan.subscriptions_count} subscribers
                            </div>
                        </div>
                    )}
                </div>
            </Drawer>
            <PlanFormDrawer mode="create" open={createOpen} modules={modules} defaultCurrency={default_currency} onClose={closePlanPanels} />
            <PlanFormDrawer mode="edit" open={!!editPlan} plan={editPlan} modules={modules} defaultCurrency={default_currency} onClose={closePlanPanels} />
            <PlanDetailDrawer
                plan={activePlan && !editPlan ? activePlan : null}
                moduleNames={moduleNames}
                onClose={closePlanPanels}
                onEdit={() => {
                    setEditPlan(activePlan);
                    router.get(route('platform.plans.index'), { plan: activePlan?.key, panel: 'edit' }, { preserveScroll: true, preserveState: true, replace: true });
                }}
            />
        </PlatformShell>
    );
}
