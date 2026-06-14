import { Head, Link, router, usePage } from '@inertiajs/react';
import { useEffect, useMemo, useState } from 'react';
import PlatformShell from '@/Layouts/PlatformShell';
import { Card, CardContent } from '@/Components/UI/Card';
import { Badge } from '@/Components/UI/Badge';
import Button from '@/Components/UI/Button';
import { Drawer } from '@/Components/UI/Elements';
import { useNotifications } from '@/hooks/useNotifications';
import { Ban, Building2, CheckCircle2, CreditCard, Download, Eye, LogIn, MessageSquare, Search, Users, Wallet, Zap } from 'lucide-react';

interface Tenant {
    id: number;
    name: string;
    slug: string;
    workspace_type?: string | null;
    workspace_type_label?: string | null;
    industry?: string | null;
    timezone?: string | null;
    status: string;
    disabled_reason: string | null;
    disabled_at: string | null;
    owner: {
        id: number;
        name: string;
        email: string;
    };
    members_count?: number;
    modules_enabled?: number;
    whatsapp_connections_count?: number;
    conversations_count?: number;
    wallet?: {
        balance_minor: number;
        currency: string;
    };
    subscription?: {
        id: number;
        status: string;
        provider?: string | null;
        current_period_end?: string | null;
        plan?: {
            id: number;
            key: string;
            name: string;
        } | null;
    } | null;
    created_at: string;
}

interface PlanOption {
    id: number;
    key: string;
    name: string;
    price_monthly: number | null;
    price_yearly: number | null;
    currency: string;
}

type Filters = {
    search?: string | null;
    status?: string | null;
};

function WorkspaceStatusBadge({ status }: { status: string }) {
    const map: Record<string, 'success' | 'warning' | 'danger' | 'info' | 'default'> = {
        active: 'success',
        trial: 'info',
        trialing: 'info',
        suspended: 'warning',
        disabled: 'danger',
    };

    return <Badge variant={map[status] || 'default'}>{status.replace('_', ' ')}</Badge>;
}

function initials(name: string) {
    return name
        .split(' ')
        .filter(Boolean)
        .slice(0, 2)
        .map((part) => part.charAt(0).toUpperCase())
        .join('');
}

function colorFor(name: string) {
    const palette = ['#00A548', '#3B82F6', '#8B5CF6', '#EC4899', '#F59E0B', '#14B8A6', '#EF4444', '#6366F1'];
    let hash = 0;
    for (let index = 0; index < name.length; index += 1) {
        hash = name.charCodeAt(index) + ((hash << 5) - hash);
    }
    return palette[Math.abs(hash) % palette.length];
}

function plainPaginationLabel(label: string) {
    return label.replace('&laquo;', 'Prev').replace('&raquo;', 'Next');
}

function formatMoney(amount: number, currency: string) {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: currency || 'INR' }).format((amount || 0) / 100);
}

export default function PlatformTenantsIndex({
    accounts,
    plans = [],
    filters,
    selectedAccount,
}: {
    accounts: {
        data: Tenant[];
        links: Array<{ url: string | null; label: string; active: boolean }>;
        meta: any;
    };
    plans?: PlanOption[];
    filters: Filters;
    selectedAccount?: Tenant | null;
}) {
    const { auth } = usePage().props as any;
    const { confirm, toast } = useNotifications();
    const [localFilters, setLocalFilters] = useState<Filters>(filters || {});
    const [selected, setSelected] = useState<Tenant | null>(selectedAccount || null);
    const [selectedIds, setSelectedIds] = useState<number[]>([]);
    const [walletAmount, setWalletAmount] = useState('0');
    const [planKey, setPlanKey] = useState('');
    const [planCycle, setPlanCycle] = useState<'monthly' | 'yearly'>('monthly');
    const [planNotes, setPlanNotes] = useState('');
    const [assigningPlan, setAssigningPlan] = useState(false);
    const [assignPlanError, setAssignPlanError] = useState<string | null>(null);
    const [assignPlanStatus, setAssignPlanStatus] = useState<string | null>(null);
    const [walletBusy, setWalletBusy] = useState(false);

    const stats = useMemo(() => ({
        total: accounts.meta?.total ?? accounts.data.length,
        active: accounts.data.filter((account) => account.status === 'active').length,
        disabled: accounts.data.filter((account) => account.status === 'disabled').length,
        selected: selectedIds.length,
    }), [accounts.data, accounts.meta?.total, selectedIds.length]);

    const applyFilters = () => {
        router.get(route('platform.accounts.index'), localFilters as any, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const clearFilters = () => {
        setLocalFilters({});
        router.get(route('platform.accounts.index'), {}, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const toggleSelect = (id: number) => {
        setSelectedIds((ids) => ids.includes(id) ? ids.filter((value) => value !== id) : [...ids, id]);
    };

    const handleDisable = async (accountId: number, accountName: string) => {
        const confirmed = await confirm({
            title: 'Disable workspace',
            message: `Disable "${accountName}"? Users will not be able to access it.`,
            variant: 'danger',
            confirmText: 'Disable',
            cancelText: 'Cancel',
        });

        if (confirmed) {
            router.post(
                route('platform.accounts.disable', { account: accountId }),
                { reason: 'Disabled by platform admin' },
                {
                    preserveScroll: true,
                    onSuccess: () => toast.success('Workspace disabled successfully'),
                    onError: () => toast.error('Failed to disable workspace'),
                }
            );
        }
    };

    const handleEnable = async (accountId: number, accountName: string) => {
        const confirmed = await confirm({
            title: 'Enable workspace',
            message: `Enable "${accountName}"?`,
            variant: 'info',
            confirmText: 'Enable',
            cancelText: 'Cancel',
        });

        if (confirmed) {
            router.post(
                route('platform.accounts.enable', { account: accountId }),
                {},
                {
                    preserveScroll: true,
                    onSuccess: () => toast.success('Workspace enabled successfully'),
                    onError: () => toast.error('Failed to enable workspace'),
                }
            );
        }
    };

    useEffect(() => {
        setSelected(selectedAccount || null);
        setPlanKey(selectedAccount?.subscription?.plan?.key || plans[0]?.key || '');
        setAssignPlanError(null);
        setAssignPlanStatus(null);
    }, [selectedAccount, plans]);

    const openAccount = (account: Tenant) => {
        router.get(route('platform.accounts.index'), { ...(filters || {}), account: account.id }, {
            preserveState: true,
            preserveScroll: true,
            replace: true,
        });
    };

    const closeAccount = () => {
        setSelected(null);
        router.get(route('platform.accounts.index'), filters as any, {
            preserveState: true,
            preserveScroll: true,
            replace: true,
        });
    };

    const assignPlan = async () => {
        if (!selected || !planKey) return;

        const plan = plans.find((candidate) => candidate.key === planKey);

        setAssigningPlan(true);
        setAssignPlanError(null);
        setAssignPlanStatus(`Assigning ${plan?.name || planKey}...`);

        try {
            router.visit(`/platform/accounts/${selected.id}/plan`, {
                method: 'post',
                data: {
                    plan_key: planKey,
                    billing_cycle: planCycle,
                    notes: planNotes || undefined,
                },
                preserveScroll: true,
                onSuccess: () => {
                    const updatedSelected = {
                        ...selected,
                        subscription: {
                            ...(selected.subscription || { id: 0, status: 'active' }),
                            status: 'active',
                            provider: 'manual',
                            plan: plan ? { id: plan.id, key: plan.key, name: plan.name } : selected.subscription?.plan || null,
                        },
                    };
                    setSelected(updatedSelected);
                    setAssignPlanStatus(`${plan?.name || planKey} assigned. Refreshing workspace details...`);
                    toast.success('Plan assigned successfully');
                    router.reload({
                        only: ['accounts', 'selectedAccount', 'plans', 'flash'],
                    });
                },
                onError: (errors) => {
                    const message = String(errors.plan_key || errors.plan || Object.values(errors)[0] || 'Failed to assign plan');
                    setAssignPlanError(message);
                    setAssignPlanStatus(null);
                    toast.error('Failed to assign plan', message);
                },
                onFinish: () => setAssigningPlan(false),
            });
        } catch (error: any) {
            const message = error?.message || 'Could not send plan assignment request.';
            setAssignPlanError(message);
            setAssignPlanStatus(null);
            setAssigningPlan(false);
            toast.error('Failed to assign plan', message);
        }
    };

    const adjustWallet = async (direction: 'credit' | 'debit') => {
        if (!selected) return;

        const amountMinor = Number(walletAmount);
        if (!Number.isFinite(amountMinor) || amountMinor <= 0) {
            toast.error('Enter a valid wallet amount');
            return;
        }

        const label = direction === 'credit' ? 'Credit wallet' : 'Debit wallet';
        const confirmed = await confirm({
            title: label,
            message: `${direction === 'credit' ? 'Add' : 'Remove'} ${formatMoney(amountMinor, selected.wallet?.currency || 'INR')} ${direction === 'credit' ? 'to' : 'from'} ${selected.name}?`,
            variant: direction === 'credit' ? 'info' : 'danger',
            confirmText: direction === 'credit' ? 'Credit' : 'Debit',
            cancelText: 'Cancel',
        });
        if (!confirmed) return;

        setWalletBusy(true);
        router.post(
            route(direction === 'credit' ? 'platform.accounts.wallet.credit' : 'platform.accounts.wallet.debit', { account: selected.id }),
            { amount_minor: amountMinor, notes: direction === 'credit' ? 'Platform credit' : 'Platform debit' },
            {
                preserveScroll: true,
                onSuccess: () => {
                    toast.success(direction === 'credit' ? 'Wallet credited' : 'Wallet debited');
                    const delta = direction === 'credit' ? amountMinor : -amountMinor;
                    setSelected((current) => current?.wallet
                        ? { ...current, wallet: { ...current.wallet, balance_minor: current.wallet.balance_minor + delta } }
                        : current);
                    router.reload({ only: ['accounts', 'selectedAccount', 'flash'] });
                },
                onError: (errors) => {
                    toast.error(direction === 'credit' ? 'Credit failed' : 'Debit failed', String(Object.values(errors)[0] || 'Could not update wallet balance.'));
                },
                onFinish: () => setWalletBusy(false),
            }
        );
    };

    return (
        <PlatformShell auth={auth}>
            <Head title="Workspaces" />
            <div className="space-y-4">
                {selectedIds.length > 0 && (
                    <div className="sticky top-0 z-20 flex flex-wrap items-center gap-3 rounded-card border border-waify-green/25 bg-waify-green-soft px-4 py-3 text-sm shadow-card dark:border-waify-green/30 dark:bg-waify-green/10">
                        <span className="font-semibold text-waify-text dark:text-waify-dark-text">{selectedIds.length} selected</span>
                        <div className="ml-auto flex flex-wrap gap-2">
                            <Button size="sm" variant="secondary" onClick={() => toast.info('Bulk email is not wired yet')}>Email</Button>
                            <Button size="sm" variant="secondary" onClick={() => toast.info('Bulk plan change is not wired yet')}>Change plan</Button>
                            <Button size="sm" variant="danger" onClick={() => toast.info('Use row actions for now')}>Suspend</Button>
                            <Button size="sm" variant="ghost" onClick={() => setSelectedIds([])}>Clear</Button>
                        </div>
                    </div>
                )}

                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                    {[
                        { label: 'Workspaces', value: stats.total, icon: Building2, tone: 'bg-blue-50 text-blue-600 dark:bg-blue-950/40' },
                        { label: 'Active on page', value: stats.active, icon: CheckCircle2, tone: 'bg-waify-green-soft text-waify-green-dark' },
                        { label: 'Disabled on page', value: stats.disabled, icon: Ban, tone: 'bg-red-50 text-red-600 dark:bg-red-950/40' },
                        { label: 'Selected', value: stats.selected, icon: Users, tone: 'bg-purple-50 text-purple-600 dark:bg-purple-950/40' },
                    ].map((item) => {
                        const Icon = item.icon;
                        return (
                            <Card key={item.label} className="transition-shadow hover:shadow-card-lg">
                                <CardContent className="p-4">
                                    <span className={`flex h-9 w-9 items-center justify-center rounded-lg ${item.tone}`}>
                                        <Icon className="h-[18px] w-[18px]" />
                                    </span>
                                    <div className="mt-3 text-2xl font-bold tabular-nums text-waify-text dark:text-waify-dark-text">{item.value}</div>
                                    <div className="mt-1 text-xs text-waify-text-muted dark:text-waify-dark-text-muted">{item.label}</div>
                                </CardContent>
                            </Card>
                        );
                    })}
                </div>

                <div className="mb-4 flex flex-wrap items-center gap-3">
                    <div className="relative min-w-[200px] flex-1 max-w-md">
                        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                        <input
                            value={localFilters.search || ''}
                            onChange={(event) => setLocalFilters({ ...localFilters, search: event.target.value })}
                            onKeyDown={(event) => event.key === 'Enter' && applyFilters()}
                            placeholder="Search..."
                            className="h-10 w-full rounded-btn border border-waify-border bg-white pl-10 pr-3 text-sm outline-none focus:ring-2 focus:ring-waify-green/20 dark:border-slate-600 dark:bg-slate-900"
                        />
                    </div>
                    <select
                        value={localFilters.status || ''}
                        onChange={(event) => setLocalFilters({ ...localFilters, status: event.target.value || null })}
                        className="h-10 w-40 rounded-btn border border-waify-border bg-white px-3 text-sm outline-none focus:ring-2 focus:ring-waify-green/20 dark:border-slate-600 dark:bg-slate-900"
                    >
                        <option value="">All status</option>
                        <option value="active">Active</option>
                        <option value="suspended">Suspended</option>
                        <option value="disabled">Disabled</option>
                    </select>
                    <div className="ml-auto flex items-center gap-2">
                        <Button size="sm" variant="secondary" onClick={clearFilters}>Reset</Button>
                        <Button size="sm" variant="secondary" onClick={() => toast.info('Export will use filtered workspace data')}><Download className="h-4 w-4" />Export</Button>
                        <Button size="sm" onClick={applyFilters}>Apply</Button>
                    </div>
                </div>

                <Card className="overflow-hidden">
                    <CardContent className="p-0">
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b border-gray-100 bg-gray-50/50 text-left text-xs uppercase tracking-wider text-waify-text-muted dark:border-slate-700 dark:bg-slate-800/40">
                                        <th className="w-10 px-3 py-3"><span className="sr-only">Select</span></th>
                                        <th className="px-5 py-3 font-semibold">Workspace</th>
                                        <th className="px-5 py-3 font-semibold">Owner</th>
                                        <th className="px-5 py-3 font-semibold">Type</th>
                                        <th className="px-5 py-3 font-semibold">Status</th>
                                        <th className="px-5 py-3 font-semibold">Created</th>
                                        <th className="px-5 py-3 font-semibold"></th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {accounts.data.map((account) => (
                                        <tr
                                            key={account.id}
                                            className={`border-b border-gray-100 transition hover:bg-gray-50/50 dark:border-slate-700/80 dark:hover:bg-slate-800/30 ${selectedIds.includes(account.id) ? 'bg-waify-green/5' : ''}`}
                                        >
                                            <td className="px-3 py-3">
                                                <input type="checkbox" checked={selectedIds.includes(account.id)} onChange={() => toggleSelect(account.id)} className="rounded border-gray-300" />
                                            </td>
                                            <td className="px-5 py-3">
                                                <div className="flex items-center gap-2">
                                                    <span className="flex h-8 w-8 items-center justify-center rounded-lg text-xs font-bold text-white" style={{ background: colorFor(account.name) }}>
                                                        {initials(account.name)}
                                                    </span>
                                                    <div className="min-w-0">
                                                        <div className="font-medium text-waify-text dark:text-waify-dark-text">{account.name}</div>
                                                        <div className="text-[11px] text-waify-text-muted dark:text-waify-dark-text-muted">{account.slug}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-5 py-3">
                                                <div className="font-medium text-waify-text dark:text-waify-dark-text">{account.owner.name}</div>
                                                <div className="text-xs text-waify-text-muted dark:text-waify-dark-text-muted">{account.owner.email}</div>
                                            </td>
                                            <td className="px-5 py-3 text-waify-text-muted dark:text-waify-dark-text-muted">{account.workspace_type_label || account.workspace_type || '-'}</td>
                                            <td className="px-5 py-3"><WorkspaceStatusBadge status={account.status} /></td>
                                            <td className="px-5 py-3 text-waify-text-muted dark:text-waify-dark-text-muted">{new Date(account.created_at).toLocaleDateString()}</td>
                                            <td className="px-5 py-3 text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    <Button size="sm" variant="secondary" onClick={() => openAccount(account)}>Manage</Button>
                                                    <Button size="sm" variant="ghost" onClick={() => openAccount(account)}><Eye className="h-4 w-4" />View</Button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        {accounts.data.length === 0 && (
                            <div className="p-8 text-center text-sm text-waify-text-muted dark:text-waify-dark-text-muted">No workspaces match these filters.</div>
                        )}
                    </CardContent>
                </Card>

                {accounts.links && accounts.links.length > 3 && (
                    <div className="flex flex-wrap items-center justify-center gap-2">
                        {accounts.links.map((link, index) => (
                            link.url ? (
                                <Link
                                    key={`${link.label}-${index}`}
                                    href={link.url}
                                    className={`rounded-btn px-3 py-2 text-sm font-semibold ${
                                        link.active
                                            ? 'bg-waify-green text-white'
                                            : 'surface ring-1 ring-gray-100 hover:bg-gray-50 dark:ring-slate-700'
                                    }`}
                                >
                                    {plainPaginationLabel(link.label)}
                                </Link>
                            ) : (
                                <span key={`${link.label}-${index}`} className="rounded-btn bg-gray-100 px-3 py-2 text-sm text-waify-text-muted opacity-60 dark:bg-slate-800">
                                    {plainPaginationLabel(link.label)}
                                </span>
                            )
                        ))}
                    </div>
                )}
            </div>

            <Drawer open={Boolean(selected)} onClose={closeAccount} title={selected?.name} className="sm:max-w-4xl">
                {selected && (
                    <div className="space-y-5">
                        <div className="flex items-center gap-3">
                            <span className="flex h-12 w-12 items-center justify-center rounded-xl text-base font-bold text-white" style={{ background: colorFor(selected.name) }}>
                                {initials(selected.name)}
                            </span>
                            <div>
                                <div className="font-semibold text-waify-text dark:text-waify-dark-text">{selected.name}</div>
                                <div className="font-mono text-xs text-waify-text-muted dark:text-waify-dark-text-muted">{selected.slug}</div>
                            </div>
                        </div>
                        <dl className="grid grid-cols-2 gap-3 text-sm">
                            {[
                                ['Owner', selected.owner.name],
                                ['Email', selected.owner.email],
                                ['Type', selected.workspace_type_label || selected.workspace_type || '-'],
                                ['Industry', selected.industry || '-'],
                                ['Timezone', selected.timezone || '-'],
                                ['Created', new Date(selected.created_at).toLocaleDateString()],
                            ].map(([key, value]) => (
                                <div key={key}>
                                    <dt className="text-xs text-waify-text-muted dark:text-waify-dark-text-muted">{key}</dt>
                                    <dd className="mt-0.5 font-medium text-waify-text dark:text-waify-dark-text">{value}</dd>
                                </div>
                            ))}
                        </dl>
                        <div className="flex flex-wrap gap-2">
                            <WorkspaceStatusBadge status={selected.status} />
                            {selected.disabled_reason && <Badge variant="warning">{selected.disabled_reason}</Badge>}
                            {selected.subscription?.plan && <Badge variant="info">{selected.subscription.plan.name}</Badge>}
                            {selected.subscription && <Badge variant="secondary">{selected.subscription.status}</Badge>}
                        </div>
                        <div className="rounded-card border border-gray-100 p-4 dark:border-waify-dark-border">
                            <div className="flex flex-wrap items-start justify-between gap-3">
                                <div>
                                    <p className="text-sm font-semibold text-waify-text dark:text-waify-dark-text">Assign plan</p>
                                    <p className="mt-1 text-xs text-waify-text-muted dark:text-waify-dark-text-muted">
                                        Platform admin override. This activates the workspace subscription without payment collection.
                                    </p>
                                </div>
                                {selected.subscription?.current_period_end && (
                                    <Badge variant="secondary">Renews {new Date(selected.subscription.current_period_end).toLocaleDateString()}</Badge>
                                )}
                            </div>
                            <div className="mt-4 grid gap-2 md:grid-cols-[minmax(0,1fr)_130px]">
                                <select
                                    value={planKey}
                                    onChange={(event) => setPlanKey(event.target.value)}
                                    className="waify-input"
                                >
                                    {plans.map((plan) => (
                                        <option key={plan.key} value={plan.key}>
                                            {plan.name} · {formatMoney(plan.price_monthly || 0, plan.currency)}/mo
                                        </option>
                                    ))}
                                </select>
                                <select
                                    value={planCycle}
                                    onChange={(event) => setPlanCycle(event.target.value as typeof planCycle)}
                                    className="waify-input"
                                >
                                    <option value="monthly">Monthly</option>
                                    <option value="yearly">Yearly</option>
                                </select>
                            </div>
                            <input
                                value={planNotes}
                                onChange={(event) => setPlanNotes(event.target.value)}
                                className="waify-input mt-2"
                                placeholder="Admin note, optional"
                            />
                            {assignPlanError && (
                                <div className="mt-2 rounded-card border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-200">
                                    {assignPlanError}
                                </div>
                            )}
                            {assignPlanStatus && (
                                <div className="mt-2 rounded-card border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs text-emerald-700 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-200">
                                    {assignPlanStatus}
                                </div>
                            )}
                            <Button type="button" size="sm" className="mt-3" onClick={assignPlan} disabled={!planKey || assigningPlan}>
                                {assigningPlan ? 'Assigning...' : 'Assign plan'}
                            </Button>
                        </div>
                        {selected.wallet && (
                            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                                {[
                                    { label: 'Members', value: selected.members_count || 0, icon: Users },
                                    { label: 'Modules', value: selected.modules_enabled || 0, icon: Zap },
                                    { label: 'WABA links', value: selected.whatsapp_connections_count || 0, icon: Building2 },
                                    { label: 'Conversations', value: selected.conversations_count || 0, icon: MessageSquare },
                                ].map((item) => {
                                    const Icon = item.icon;
                                    return (
                                        <div key={item.label} className="rounded-card border border-gray-100 p-3 dark:border-waify-dark-border">
                                            <Icon className="h-4 w-4 text-waify-green dark:text-emerald-300" />
                                            <p className="mt-2 text-lg font-bold text-waify-text dark:text-waify-dark-text">{item.value}</p>
                                            <p className="text-xs text-waify-text-muted dark:text-waify-dark-text-muted">{item.label}</p>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                        {selected.wallet && (
                            <div className="rounded-card border border-gray-100 p-4 dark:border-waify-dark-border">
                                <div className="flex flex-wrap items-center justify-between gap-3">
                                    <div className="flex items-center gap-3">
                                        <span className="flex h-10 w-10 items-center justify-center rounded-btn bg-waify-green-soft text-waify-green-dark dark:bg-emerald-400/10 dark:text-emerald-200">
                                            <Wallet className="h-5 w-5" />
                                        </span>
                                        <div>
                                            <p className="text-sm font-semibold text-waify-text dark:text-waify-dark-text">Wallet balance</p>
                                            <p className="text-2xl font-bold tabular-nums text-waify-text dark:text-waify-dark-text">{formatMoney(selected.wallet.balance_minor, selected.wallet.currency)}</p>
                                        </div>
                                    </div>
                                    <Link href={route('platform.transactions.index')} className="text-sm font-semibold text-waify-green-dark hover:underline dark:text-emerald-300">Transactions</Link>
                                </div>
                                <div className="mt-4 flex flex-col gap-2 sm:flex-row">
                                    <input
                                        type="number"
                                        min={1}
                                        value={walletAmount}
                                        onChange={(event) => setWalletAmount(event.target.value)}
                                        className="waify-input"
                                        placeholder="Amount in minor units"
                                    />
                                    <Button size="sm" onClick={() => adjustWallet('credit')} disabled={walletBusy}>
                                        <CreditCard className="h-4 w-4" />
                                        {walletBusy ? 'Working...' : 'Credit'}
                                    </Button>
                                    <Button size="sm" variant="danger" onClick={() => adjustWallet('debit')} disabled={walletBusy}>
                                        Debit
                                    </Button>
                                </div>
                            </div>
                        )}
                        <div className="flex flex-col gap-2 border-t border-gray-100 pt-2 dark:border-slate-700">
                            <Button
                                className="w-full"
                                onClick={() => router.post(
                                    route('platform.accounts.impersonate', { account: selected.id }),
                                    {},
                                    { onError: () => toast.error('Failed to start workspace impersonation') },
                                )}
                            >
                                <LogIn className="h-4 w-4" />
                                Impersonate workspace
                            </Button>
                            {selected.status === 'active' ? (
                                <Button className="w-full" variant="danger" onClick={() => handleDisable(selected.id, selected.name)}><Ban className="h-4 w-4" />Disable workspace</Button>
                            ) : (
                                <Button className="w-full" variant="secondary" onClick={() => handleEnable(selected.id, selected.name)}><CheckCircle2 className="h-4 w-4" />Enable workspace</Button>
                            )}
                        </div>
                    </div>
                )}
            </Drawer>
        </PlatformShell>
    );
}
