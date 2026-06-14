import { Head, Link, router, usePage } from '@inertiajs/react';
import { useEffect, useMemo, useState } from 'react';
import { Building2, CalendarClock, CreditCard, Eye, FileText, MessageSquareText, RefreshCw, Search, Send, Users } from 'lucide-react';
import PlatformShell from '@/Layouts/PlatformShell';
import { Card, CardContent } from '@/Components/UI/Card';
import { Badge } from '@/Components/UI/Badge';
import Button from '@/Components/UI/Button';
import { Drawer } from '@/Components/UI/Elements';
import { cn } from '@/lib/utils';

interface Subscription {
    id: number;
    slug: string;
    account: {
        id: number;
        name: string;
        slug: string;
    };
    plan: {
        key: string;
        name: string;
    };
    status: string;
    trial_ends_at: string | null;
    current_period_start: string | null;
    current_period_end: string | null;
    cancel_at_period_end: boolean;
    canceled_at: string | null;
    provider: string | null;
    provider_ref: string | null;
    provider_plan_ref: string | null;
    provider_customer_ref: string | null;
    provider_status: string | null;
    discount_code: string | null;
    last_payment_at: string | null;
    last_payment_failed_at: string | null;
    last_error: string | null;
    is_razorpay_paid: boolean;
    usage: {
        messages_sent: number;
        template_sends: number;
    };
    started_at: string | null;
}

interface PaginatedSubscriptions {
    data: Subscription[];
    links: Array<{ url: string | null; label: string; active: boolean }>;
    meta?: {
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
    };
    current_page?: number;
    last_page?: number;
    per_page?: number;
    total?: number;
}

function statusVariant(status: string): 'success' | 'warning' | 'danger' | 'info' | 'default' {
    const variants: Record<string, 'success' | 'warning' | 'danger' | 'info' | 'default'> = {
        active: 'success',
        trialing: 'info',
        trial: 'info',
        paused: 'warning',
        past_due: 'warning',
        canceled: 'danger',
        cancelled: 'danger',
    };

    return variants[status] || 'default';
}

function formatDate(dateString: string | null) {
    if (!dateString) {
        return 'Not set';
    }

    return new Intl.DateTimeFormat('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
    }).format(new Date(dateString));
}

function cleanLabel(label: string) {
    return label.replace('&laquo;', 'Previous').replace('&raquo;', 'Next');
}

function StatCard({
    label,
    value,
    sub,
    icon: Icon,
    tone = 'green',
}: {
    label: string;
    value: string | number;
    sub: string;
    icon: typeof Users;
    tone?: 'green' | 'blue' | 'amber' | 'purple';
}) {
    const tones = {
        green: 'bg-emerald-50 text-waify-green dark:bg-emerald-400/10 dark:text-emerald-200',
        blue: 'bg-sky-50 text-sky-600 dark:bg-sky-400/10 dark:text-sky-200',
        amber: 'bg-amber-50 text-amber-600 dark:bg-amber-400/10 dark:text-amber-200',
        purple: 'bg-violet-50 text-violet-600 dark:bg-violet-400/10 dark:text-violet-200',
    };

    return (
        <Card>
            <CardContent className="flex items-center gap-4 p-4">
                <div className={cn('flex h-11 w-11 shrink-0 items-center justify-center rounded-btn', tones[tone])}>
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

export default function SubscriptionsIndex({
    subscriptions,
    filters,
    selectedSubscription,
}: {
    subscriptions: PaginatedSubscriptions;
    filters: { status?: string };
    selectedSubscription?: Subscription | null;
}) {
    const { auth } = usePage().props as any;
    const [selected, setSelected] = useState<Subscription | null>(selectedSubscription || null);
    const pageMeta = {
        current_page: subscriptions.meta?.current_page ?? subscriptions.current_page ?? 1,
        last_page: subscriptions.meta?.last_page ?? subscriptions.last_page ?? 1,
        per_page: subscriptions.meta?.per_page ?? subscriptions.per_page ?? subscriptions.data.length,
        total: subscriptions.meta?.total ?? subscriptions.total ?? subscriptions.data.length,
    };

    const stats = useMemo(() => {
        const rows = subscriptions.data;
        return {
            active: rows.filter((subscription) => subscription.status === 'active').length,
            trialing: rows.filter((subscription) => ['trialing', 'trial'].includes(subscription.status)).length,
            razorpayPaid: rows.filter((subscription) => subscription.is_razorpay_paid).length,
            attention: rows.filter((subscription) => ['past_due', 'paused', 'canceled', 'cancelled'].includes(subscription.status) || subscription.last_error).length,
            messages: rows.reduce((sum, subscription) => sum + subscription.usage.messages_sent, 0),
            templates: rows.reduce((sum, subscription) => sum + subscription.usage.template_sends, 0),
        };
    }, [subscriptions.data]);

    const changeStatus = (status: string) => {
        router.get(
            route('platform.subscriptions.index'),
            status ? { status } : {},
            {
                preserveState: true,
                preserveScroll: true,
                replace: true,
            }
        );
    };

    const statusTabs = [
        { id: '', label: 'All' },
        { id: 'active', label: 'Active' },
        { id: 'trialing', label: 'Trials' },
        { id: 'paused', label: 'Paused' },
        { id: 'past_due', label: 'Past due' },
        { id: 'canceled', label: 'Canceled' },
    ];

    const firstResult = pageMeta.total === 0 ? 0 : pageMeta.per_page * (pageMeta.current_page - 1) + 1;
    const lastResult = Math.min(pageMeta.per_page * pageMeta.current_page, pageMeta.total);
    useEffect(() => {
        setSelected(selectedSubscription || null);
    }, [selectedSubscription]);

    const closeSelected = () => {
        setSelected(null);
        router.get(route('platform.subscriptions.index'), filters as any, {
            preserveState: true,
            preserveScroll: true,
            replace: true,
        });
    };

    return (
        <PlatformShell auth={auth}>
            <Head title="Subscriptions" />

            <div className="space-y-6">
                <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-waify-green dark:text-emerald-300">Billing operations</p>
                        <h1 className="mt-2 text-2xl font-bold text-waify-text dark:text-waify-dark-text">Subscriptions</h1>
                        <p className="mt-1 text-sm text-waify-text-muted dark:text-waify-dark-text-muted">
                            Workspace plan state, usage counters, trial windows, and renewal dates.
                        </p>
                    </div>
                    <Button variant="secondary" onClick={() => router.reload()}>
                        <RefreshCw className="h-4 w-4" />
                        Refresh
                    </Button>
                </div>

                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
                    <StatCard label="Active" value={stats.active} sub="On this result page" icon={Users} />
                    <StatCard label="Trials" value={stats.trialing} sub="Trialing subscriptions" icon={CalendarClock} tone="blue" />
                    <StatCard label="Razorpay paid" value={stats.razorpayPaid} sub="One-time payments" icon={CreditCard} />
                    <StatCard label="Needs attention" value={stats.attention} sub="Past due, paused, or errored" icon={FileText} tone="amber" />
                    <StatCard label="Messages" value={stats.messages.toLocaleString('en-IN')} sub={`${stats.templates.toLocaleString('en-IN')} template sends`} icon={MessageSquareText} tone="purple" />
                </div>

                <Card className="overflow-hidden">
                    <div className="border-b border-gray-100 px-4 py-4 dark:border-waify-dark-border sm:px-5">
                        <div className="flex flex-wrap items-center justify-between gap-3">
                            <div className="flex flex-wrap gap-2">
                                {statusTabs.map((tab) => (
                                    <button
                                        key={tab.id || 'all'}
                                        type="button"
                                        onClick={() => changeStatus(tab.id)}
                                        className={cn(
                                            'rounded-btn px-3 py-2 text-sm font-medium transition',
                                            (filters?.status || '') === tab.id
                                                ? 'bg-waify-green text-white shadow-sm'
                                                : 'bg-gray-100 text-waify-text-muted hover:bg-gray-200 dark:bg-waify-dark-surface-2 dark:text-waify-dark-text-muted dark:hover:bg-slate-700'
                                        )}
                                    >
                                        {tab.label}
                                    </button>
                                ))}
                            </div>
                            <div className="flex min-w-[220px] items-center gap-2 rounded-btn border border-gray-200 bg-white px-3 py-2 text-sm text-waify-text-muted dark:border-waify-dark-border dark:bg-waify-dark-surface-2 dark:text-waify-dark-text-muted">
                                <Search className="h-4 w-4" />
                                <span>Use filters to narrow billing state</span>
                            </div>
                        </div>
                    </div>

                    {subscriptions.data.length === 0 ? (
                        <CardContent className="py-16 text-center">
                            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-card bg-emerald-50 text-waify-green dark:bg-emerald-400/10 dark:text-emerald-200">
                                <FileText className="h-7 w-7" />
                            </div>
                            <h3 className="mt-4 text-lg font-semibold text-waify-text dark:text-waify-dark-text">No subscriptions found</h3>
                            <p className="mx-auto mt-2 max-w-md text-sm text-waify-text-muted dark:text-waify-dark-text-muted">
                                {filters?.status ? `No subscriptions currently match "${filters.status}".` : 'No subscriptions have been created yet.'}
                            </p>
                        </CardContent>
                    ) : (
                        <>
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="border-b border-gray-100 bg-gray-50/60 text-left text-xs uppercase text-waify-text-muted dark:border-waify-dark-border dark:bg-waify-dark-surface-2/40 dark:text-waify-dark-text-muted">
                                            <th className="px-5 py-3">Workspace</th>
                                            <th className="px-5 py-3">Plan</th>
                                            <th className="px-5 py-3">Status</th>
                                            <th className="px-5 py-3">Usage</th>
                                            <th className="px-5 py-3">Period end</th>
                                            <th className="px-5 py-3">Started</th>
                                            <th className="px-5 py-3 text-right">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100 dark:divide-waify-dark-border">
                                        {subscriptions.data.map((subscription) => (
                                            <tr
                                                key={subscription.id}
                                                className="text-waify-text transition hover:bg-gray-50/70 dark:text-waify-dark-text dark:hover:bg-waify-dark-surface-2/40"
                                            >
                                                <td className="px-5 py-3">
                                                    <div className="flex items-center gap-3">
                                                        <div className="flex h-9 w-9 items-center justify-center rounded-btn bg-emerald-50 text-waify-green dark:bg-emerald-400/10 dark:text-emerald-200">
                                                            <Building2 className="h-4 w-4" />
                                                        </div>
                                                        <div>
                                                            <div className="font-semibold">{subscription.account.name}</div>
                                                            <div className="text-xs text-waify-text-muted dark:text-waify-dark-text-muted">{subscription.account.slug}</div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-5 py-3">
                                                    <Badge variant="secondary">{subscription.plan.name}</Badge>
                                                    <div className="mt-1 text-xs text-waify-text-muted dark:text-waify-dark-text-muted">{subscription.plan.key}</div>
                                                </td>
                                                <td className="px-5 py-3">
                                                    <Badge variant={statusVariant(subscription.status)}>{subscription.status.replace('_', ' ')}</Badge>
                                                    {subscription.is_razorpay_paid && (
                                                        <div className="mt-1 text-xs text-waify-text-muted dark:text-waify-dark-text-muted">
                                                            Razorpay {subscription.provider_status || 'paid'}
                                                        </div>
                                                    )}
                                                    {subscription.last_error && (
                                                        <div className="mt-1 max-w-[220px] truncate text-xs text-red-600 dark:text-red-300">{subscription.last_error}</div>
                                                    )}
                                                </td>
                                                <td className="px-5 py-3">
                                                    <div className="flex flex-col gap-1 text-xs">
                                                        <span className="inline-flex items-center gap-1 text-waify-text dark:text-waify-dark-text">
                                                            <Send className="h-3.5 w-3.5 text-waify-green dark:text-emerald-300" />
                                                            {subscription.usage.messages_sent.toLocaleString('en-IN')} messages
                                                        </span>
                                                        <span className="inline-flex items-center gap-1 text-waify-text-muted dark:text-waify-dark-text-muted">
                                                            <MessageSquareText className="h-3.5 w-3.5" />
                                                            {subscription.usage.template_sends.toLocaleString('en-IN')} templates
                                                        </span>
                                                    </div>
                                                </td>
                                                <td className="px-5 py-3 text-waify-text-muted dark:text-waify-dark-text-muted">
                                                    {formatDate(subscription.current_period_end)}
                                                </td>
                                                <td className="px-5 py-3 text-waify-text-muted dark:text-waify-dark-text-muted">
                                                    {formatDate(subscription.started_at)}
                                                </td>
                                                <td className="px-5 py-3">
                                                    <div className="flex justify-end gap-2">
                                                        <Button
                                                            size="sm"
                                                            variant="ghost"
                                                            onClick={() => router.get(
                                                                route('platform.subscriptions.index'),
                                                                { ...(filters || {}), subscription: subscription.slug },
                                                                { preserveState: true, preserveScroll: true, replace: true }
                                                            )}
                                                        >
                                                            <Eye className="h-4 w-4" />
                                                            Inspect
                                                        </Button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            {pageMeta.last_page > 1 && (
                                <div className="flex flex-wrap items-center justify-between gap-3 border-t border-gray-100 px-5 py-4 dark:border-waify-dark-border">
                                    <div className="text-sm text-waify-text-muted dark:text-waify-dark-text-muted">
                                        Showing {firstResult} to {lastResult} of {pageMeta.total} results
                                    </div>
                                    <div className="flex flex-wrap gap-2">
                                        {subscriptions.links.map((link, index) =>
                                            link.url ? (
                                                <Link
                                                    key={`${link.label}-${index}`}
                                                    href={link.url}
                                                    preserveScroll
                                                    className={cn(
                                                        'rounded-btn px-3 py-2 text-sm font-medium transition',
                                                        link.active
                                                            ? 'bg-waify-green text-white'
                                                            : 'bg-white text-waify-text ring-1 ring-gray-200 hover:bg-gray-50 dark:bg-waify-dark-surface-2 dark:text-waify-dark-text dark:ring-waify-dark-border'
                                                    )}
                                                >
                                                    {cleanLabel(link.label)}
                                                </Link>
                                            ) : (
                                                <span
                                                    key={`${link.label}-${index}`}
                                                    className="rounded-btn bg-gray-100 px-3 py-2 text-sm text-waify-text-muted opacity-60 dark:bg-waify-dark-surface-2 dark:text-waify-dark-text-muted"
                                                >
                                                    {cleanLabel(link.label)}
                                                </span>
                                            )
                                        )}
                                    </div>
                                </div>
                            )}
                        </>
                    )}
                </Card>
            </div>

            <Drawer
                open={!!selected}
                onClose={closeSelected}
                title={selected?.account.name || 'Subscription'}
                description={selected ? `${selected.plan.name} · ${selected.status.replace('_', ' ')}` : undefined}
                footer={
                    <div className="flex flex-wrap justify-end gap-2">
                        <Button variant="secondary" onClick={closeSelected}>
                            Close
                        </Button>
                        {selected && (
                            <Button onClick={() => router.visit(route('platform.accounts.show', { account: selected.account.id }))}>
                                Open workspace
                            </Button>
                        )}
                    </div>
                }
            >
                {selected && (
                    <div className="space-y-4">
                        <div className="rounded-card border border-gray-100 bg-gray-50 p-4 dark:border-waify-dark-border dark:bg-waify-dark-surface-2">
                            <div className="flex items-center justify-between gap-3">
                                <div>
                                    <div className="text-sm font-semibold text-waify-text dark:text-waify-dark-text">{selected.account.name}</div>
                                    <div className="mt-1 text-xs text-waify-text-muted dark:text-waify-dark-text-muted">{selected.account.slug}</div>
                                </div>
                                <div className="flex flex-wrap justify-end gap-2">
                                    <Badge variant={statusVariant(selected.status)}>{selected.status.replace('_', ' ')}</Badge>
                                    <Badge variant={selected.is_razorpay_paid ? 'success' : 'secondary'}>
                                        {selected.is_razorpay_paid ? 'Razorpay paid' : selected.provider || 'local'}
                                    </Badge>
                                </div>
                            </div>
                        </div>
                        {selected.last_error && (
                            <div className="rounded-card border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-200">
                                {selected.last_error}
                            </div>
                        )}
                        <div className="grid grid-cols-2 gap-3">
                            <div className="rounded-card border border-gray-100 p-4 dark:border-waify-dark-border">
                                <div className="text-xs text-waify-text-muted dark:text-waify-dark-text-muted">Messages sent</div>
                                <div className="mt-1 text-xl font-bold tabular-nums text-waify-text dark:text-waify-dark-text">
                                    {selected.usage.messages_sent.toLocaleString('en-IN')}
                                </div>
                            </div>
                            <div className="rounded-card border border-gray-100 p-4 dark:border-waify-dark-border">
                                <div className="text-xs text-waify-text-muted dark:text-waify-dark-text-muted">Template sends</div>
                                <div className="mt-1 text-xl font-bold tabular-nums text-waify-text dark:text-waify-dark-text">
                                    {selected.usage.template_sends.toLocaleString('en-IN')}
                                </div>
                            </div>
                        </div>
                        <div className="space-y-3 text-sm">
                            <div className="flex items-center justify-between border-b border-gray-100 pb-3 dark:border-waify-dark-border">
                                <span className="text-waify-text-muted dark:text-waify-dark-text-muted">Plan</span>
                                <span className="font-medium text-waify-text dark:text-waify-dark-text">{selected.plan.name}</span>
                            </div>
                            <div className="flex items-center justify-between border-b border-gray-100 pb-3 dark:border-waify-dark-border">
                                <span className="text-waify-text-muted dark:text-waify-dark-text-muted">Payment reference</span>
                                <span className="max-w-[220px] truncate font-medium text-waify-text dark:text-waify-dark-text">{selected.provider_ref || 'Not linked'}</span>
                            </div>
                            <div className="flex items-center justify-between border-b border-gray-100 pb-3 dark:border-waify-dark-border">
                                <span className="text-waify-text-muted dark:text-waify-dark-text-muted">Provider customer</span>
                                <span className="max-w-[220px] truncate font-medium text-waify-text dark:text-waify-dark-text">{selected.provider_customer_ref || 'Not linked'}</span>
                            </div>
                            <div className="flex items-center justify-between border-b border-gray-100 pb-3 dark:border-waify-dark-border">
                                <span className="text-waify-text-muted dark:text-waify-dark-text-muted">Provider status</span>
                                <span className="font-medium text-waify-text dark:text-waify-dark-text">{selected.provider_status || 'Not set'}</span>
                            </div>
                            <div className="flex items-center justify-between border-b border-gray-100 pb-3 dark:border-waify-dark-border">
                                <span className="text-waify-text-muted dark:text-waify-dark-text-muted">Period start</span>
                                <span className="font-medium text-waify-text dark:text-waify-dark-text">{formatDate(selected.current_period_start)}</span>
                            </div>
                            <div className="flex items-center justify-between border-b border-gray-100 pb-3 dark:border-waify-dark-border">
                                <span className="text-waify-text-muted dark:text-waify-dark-text-muted">Trial ends</span>
                                <span className="font-medium text-waify-text dark:text-waify-dark-text">{formatDate(selected.trial_ends_at)}</span>
                            </div>
                            <div className="flex items-center justify-between border-b border-gray-100 pb-3 dark:border-waify-dark-border">
                                <span className="text-waify-text-muted dark:text-waify-dark-text-muted">Period end</span>
                                <span className="font-medium text-waify-text dark:text-waify-dark-text">{formatDate(selected.current_period_end)}</span>
                            </div>
                            <div className="flex items-center justify-between border-b border-gray-100 pb-3 dark:border-waify-dark-border">
                                <span className="text-waify-text-muted dark:text-waify-dark-text-muted">Last payment</span>
                                <span className="font-medium text-waify-text dark:text-waify-dark-text">{formatDate(selected.last_payment_at)}</span>
                            </div>
                            <div className="flex items-center justify-between border-b border-gray-100 pb-3 dark:border-waify-dark-border">
                                <span className="text-waify-text-muted dark:text-waify-dark-text-muted">Last payment failed</span>
                                <span className="font-medium text-waify-text dark:text-waify-dark-text">{formatDate(selected.last_payment_failed_at)}</span>
                            </div>
                            <div className="flex items-center justify-between border-b border-gray-100 pb-3 dark:border-waify-dark-border">
                                <span className="text-waify-text-muted dark:text-waify-dark-text-muted">Discount</span>
                                <span className="font-medium text-waify-text dark:text-waify-dark-text">{selected.discount_code || 'None'}</span>
                            </div>
                            <div className="flex items-center justify-between border-b border-gray-100 pb-3 dark:border-waify-dark-border">
                                <span className="text-waify-text-muted dark:text-waify-dark-text-muted">Cancel at period end</span>
                                <span className="font-medium text-waify-text dark:text-waify-dark-text">{selected.cancel_at_period_end ? 'Yes' : 'No'}</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-waify-text-muted dark:text-waify-dark-text-muted">Started</span>
                                <span className="font-medium text-waify-text dark:text-waify-dark-text">{formatDate(selected.started_at)}</span>
                            </div>
                        </div>
                    </div>
                )}
            </Drawer>
        </PlatformShell>
    );
}
