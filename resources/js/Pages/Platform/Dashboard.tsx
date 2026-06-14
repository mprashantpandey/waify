import { Head, Link, usePage } from '@inertiajs/react';
import { useMemo, useState } from 'react';
import PlatformShell from '@/Layouts/PlatformShell';
import { Card, CardContent } from '@/Components/UI/Card';
import { Badge } from '@/Components/UI/Badge';
import Button from '@/Components/UI/Button';
import MisconfiguredSettingsAlert from '@/Components/Platform/MisconfiguredSettingsAlert';
import {
    Activity,
    AlertCircle,
    BarChart3,
    Building2,
    CheckCircle2,
    CreditCard,
    Download,
    FileText,
    History,
    Inbox,
    Layers,
    LifeBuoy,
    Link as LinkIcon,
    MessageSquare,
    Plus,
    Send,
    Shield,
    TrendingUp,
    Users,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

interface Stat {
    total_accounts: number;
    active_accounts: number;
    suspended_accounts: number;
    disabled_accounts: number;
    total_users: number;
    super_admins: number;
    total_messages: number;
    messages_today: number;
    messages_this_week: number;
    messages_this_month: number;
    inbound_messages: number;
    outbound_messages: number;
    message_statuses: Record<string, number>;
    total_connections: number;
    active_connections: number;
    connections_with_errors: number;
    total_templates: number;
    approved_templates: number;
    pending_templates: number;
    rejected_templates: number;
    total_subscriptions: number;
    active_subscriptions: number;
    trialing_subscriptions: number;
    past_due_subscriptions: number;
}

interface RecentTenant {
    id: number;
    name: string;
    slug: string;
    status: string;
    owner: {
        name: string;
        email: string;
    };
    created_at: string;
}

interface TopTenant {
    id: number;
    name: string;
    slug: string;
    message_count: number;
}

interface MessageTrend {
    date: string;
    count: number;
}

function formatNumber(num: number) {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return String(num || 0);
}

function statusVariant(status: string): 'success' | 'warning' | 'danger' | 'info' | 'default' {
    if (['active', 'approved', 'success'].includes(status)) return 'success';
    if (['trial', 'trialing', 'pending'].includes(status)) return 'info';
    if (['past_due', 'suspended'].includes(status)) return 'warning';
    if (['disabled', 'rejected', 'failed'].includes(status)) return 'danger';
    return 'default';
}

function SegmentedControl({
    value,
    onChange,
    options,
}: {
    value: string;
    onChange: (value: string) => void;
    options: Array<{ id: string; label: string }>;
}) {
    return (
        <div className="inline-flex rounded-lg bg-gray-100 p-1 dark:bg-slate-800">
            {options.map((option) => (
                <button
                    key={option.id}
                    type="button"
                    onClick={() => onChange(option.id)}
                    className={`rounded-md px-3 py-1.5 text-xs font-semibold transition ${
                        value === option.id
                            ? 'bg-white text-waify-text shadow-sm dark:bg-slate-700 dark:text-waify-dark-text'
                            : 'text-waify-text-muted hover:text-waify-text dark:text-waify-dark-text-muted dark:hover:text-waify-dark-text'
                    }`}
                >
                    {option.label}
                </button>
            ))}
        </div>
    );
}

function TrendBadge({ value, positive = true }: { value: string; positive?: boolean }) {
    return (
        <span className={`inline-flex items-center gap-0.5 rounded-md px-1.5 py-0.5 text-[11px] font-semibold ${positive ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'}`}>
            <TrendingUp className={`h-3 w-3 ${positive ? '' : 'rotate-180'}`} />
            {value}
        </span>
    );
}

function ProgressBar({ value, color = 'green' }: { value: number; color?: 'green' | 'purple' | 'amber' | 'red' }) {
    const colors = {
        green: 'bg-waify-green',
        purple: 'bg-purple-500',
        amber: 'bg-amber-500',
        red: 'bg-red-500',
    };

    return (
        <div className="progress-track h-2 overflow-hidden rounded-full bg-gray-200">
            <div className={`${colors[color]} h-full rounded-full`} style={{ width: `${Math.max(0, Math.min(value, 100))}%` }} />
        </div>
    );
}

function StatCard({
    label,
    value,
    delta,
    icon: Icon,
    bg,
    color,
}: {
    label: string;
    value: string;
    delta: string;
    icon: any;
    bg: string;
    color: string;
}) {
    return (
        <Card className="transition-shadow hover:shadow-card-lg">
            <CardContent className="p-4">
                <div className="flex items-center justify-between">
                    <span className={`flex h-9 w-9 items-center justify-center rounded-lg ${bg}`}>
                        <Icon className={`h-[18px] w-[18px] ${color}`} />
                    </span>
                    <TrendBadge value={delta} positive={!delta.startsWith('-')} />
                </div>
                <div className="mt-3 text-2xl font-bold tabular-nums text-waify-text dark:text-waify-dark-text">{value}</div>
                <div className="mt-1 text-xs text-waify-text-muted dark:text-waify-dark-text-muted">{label}</div>
            </CardContent>
        </Card>
    );
}

function QuickLink({ href, icon: Icon, label }: { href: string; icon: any; label: string }) {
    return (
        <Link href={href} className="surface rounded-card p-4 text-left ring-1 ring-gray-100 transition hover:shadow-card-lg dark:ring-slate-700">
            <Icon className="mb-2 h-5 w-5 text-waify-green" />
            <div className="text-sm font-semibold text-waify-text dark:text-waify-dark-text">{label}</div>
            <div className="mt-0.5 text-xs text-waify-text-muted dark:text-waify-dark-text-muted">Open</div>
        </Link>
    );
}

export default function PlatformDashboard({
    stats,
    recent_accounts,
    message_trends,
    top_accounts,
    misconfigured_settings,
}: {
    stats: Stat;
    recent_accounts: RecentTenant[];
    message_trends: MessageTrend[];
    top_accounts: TopTenant[];
    misconfigured_settings?: Array<{
        group: string;
        name: string;
        required: boolean;
        issues: string[];
        impact: string;
        route: string;
        tab: string;
    }>;
}) {
    const { auth } = usePage().props as any;
    const [period, setPeriod] = useState('30d');

    const barHeights = useMemo(() => {
        const values = (message_trends || []).map((trend) => Number(trend.count || 0));
        const max = Math.max(...values, 1);
        return values.length > 0 ? values.map((value) => Math.max(8, Math.round((value / max) * 100))) : [8, 8, 8, 8, 8, 8, 8];
    }, [message_trends]);

    const distribution = useMemo(() => {
        const total = Math.max(stats.total_subscriptions, 1);
        return [
            { label: 'Active', value: stats.active_subscriptions, pct: Math.round((stats.active_subscriptions / total) * 100), color: 'green' as const },
            { label: 'Trialing', value: stats.trialing_subscriptions, pct: Math.round((stats.trialing_subscriptions / total) * 100), color: 'purple' as const },
            { label: 'Past due', value: stats.past_due_subscriptions, pct: Math.round((stats.past_due_subscriptions / total) * 100), color: 'amber' as const },
        ];
    }, [stats.active_subscriptions, stats.past_due_subscriptions, stats.total_subscriptions, stats.trialing_subscriptions]);

    const alerts = [
        stats.connections_with_errors > 0 ? {
            title: `${stats.connections_with_errors} WABA connection ${stats.connections_with_errors === 1 ? 'error' : 'errors'}`,
            message: 'Review connection health and webhook status.',
            href: route('platform.system-health'),
            icon: LinkIcon,
            color: 'text-amber-500',
        } : null,
        stats.past_due_subscriptions > 0 ? {
            title: `${stats.past_due_subscriptions} past due subscription${stats.past_due_subscriptions === 1 ? '' : 's'}`,
            message: 'Billing follow-up may be required.',
            href: route('platform.subscriptions.index', { status: 'past_due' }),
            icon: CreditCard,
            color: 'text-red-500',
        } : null,
        stats.pending_templates > 0 ? {
            title: `${stats.pending_templates} pending template${stats.pending_templates === 1 ? '' : 's'}`,
            message: 'Templates are waiting for Meta review or sync.',
            href: route('platform.templates.index', { status: 'PENDING' }),
            icon: FileText,
            color: 'text-blue-500',
        } : null,
    ].filter(Boolean) as Array<{ title: string; message: string; href: string; icon: any; color: string }>;
    const messageDirections: Array<[string, number, LucideIcon, 'green' | 'purple' | 'amber']> = [
        ['Inbound', stats.inbound_messages, Inbox, 'green'],
        ['Outbound', stats.outbound_messages, Send, 'purple'],
        ['Today', stats.messages_today, Activity, 'amber'],
    ];

    return (
        <PlatformShell auth={auth}>
            <Head title="Platform admin" />
            <div className="space-y-6">
                <div className="flex flex-wrap items-center justify-between gap-3">
                    <SegmentedControl
                        value={period}
                        onChange={setPeriod}
                        options={[
                            { id: '7d', label: '7d' },
                            { id: '30d', label: '30d' },
                            { id: '90d', label: '90d' },
                        ]}
                    />
                    <div className="flex gap-2">
                        <Button variant="secondary" size="sm"><Download className="h-4 w-4" />Export</Button>
                        <Link href={route('platform.accounts.index')}>
                            <Button size="sm"><Plus className="h-4 w-4" />Add workspace</Button>
                        </Link>
                    </div>
                </div>

                {misconfigured_settings && misconfigured_settings.length > 0 && (
                    <MisconfiguredSettingsAlert misconfiguredSettings={misconfigured_settings} variant="dashboard" />
                )}

                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                    <StatCard
                        label="Active workspaces"
                        value={formatNumber(stats.active_accounts)}
                        delta={`${stats.total_accounts} total`}
                        icon={Building2}
                        bg="bg-blue-50 dark:bg-blue-950/40"
                        color="text-blue-600"
                    />
                    <StatCard
                        label={`Messages (${period})`}
                        value={formatNumber(period === '7d' ? stats.messages_this_week : stats.messages_this_month)}
                        delta={`${formatNumber(stats.messages_today)} today`}
                        icon={Send}
                        bg="bg-waify-green-soft"
                        color="text-waify-green-dark"
                    />
                    <StatCard
                        label="Active subscriptions"
                        value={formatNumber(stats.active_subscriptions)}
                        delta={`${stats.trialing_subscriptions} trials`}
                        icon={CreditCard}
                        bg="bg-purple-50 dark:bg-purple-950/40"
                        color="text-purple-600"
                    />
                    <StatCard
                        label="Open operational issues"
                        value={formatNumber(stats.connections_with_errors + stats.past_due_subscriptions + stats.rejected_templates)}
                        delta={stats.connections_with_errors + stats.past_due_subscriptions + stats.rejected_templates > 0 ? '- attention' : '0 issues'}
                        icon={LifeBuoy}
                        bg="bg-amber-50 dark:bg-amber-950/40"
                        color="text-amber-600"
                    />
                </div>

                <div className="grid gap-4 lg:grid-cols-3">
                    <Card className="lg:col-span-2">
                        <CardContent className="p-5">
                            <h3 className="mb-1 text-sm font-semibold text-waify-text dark:text-waify-dark-text">Message volume</h3>
                            <p className="mb-4 text-xs text-waify-text-muted dark:text-waify-dark-text-muted">Outbound + inbound across all workspaces</p>
                            <div className="flex h-24 items-end gap-1">
                                {barHeights.map((height, index) => (
                                    <div
                                        key={`${height}-${index}`}
                                        className="flex-1 rounded-sm bg-waify-green"
                                        style={{ height: `${height}%`, opacity: 0.35 + (index / Math.max(barHeights.length, 1)) * 0.65 }}
                                    />
                                ))}
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="p-5">
                            <h3 className="mb-4 text-sm font-semibold text-waify-text dark:text-waify-dark-text">Subscription distribution</h3>
                            <ul className="space-y-3">
                                {distribution.map((item) => (
                                    <li key={item.label}>
                                        <div className="mb-1 flex justify-between text-sm">
                                            <span className="text-waify-text dark:text-waify-dark-text">{item.label}</span>
                                            <span className="tabular-nums text-waify-text-muted dark:text-waify-dark-text-muted">{item.value}</span>
                                        </div>
                                        <ProgressBar value={item.pct} color={item.color} />
                                    </li>
                                ))}
                            </ul>
                        </CardContent>
                    </Card>
                </div>

                <div className="grid gap-4 lg:grid-cols-2">
                    <Card>
                        <CardContent className="p-5">
                            <div className="mb-4 flex items-center justify-between">
                                <h3 className="text-sm font-semibold text-waify-text dark:text-waify-dark-text">Recent workspaces</h3>
                                <Link href={route('platform.accounts.index')}>
                                    <Button variant="ghost" size="sm">View all</Button>
                                </Link>
                            </div>
                            <ul className="divide-y divide-gray-100 dark:divide-slate-700">
                                {recent_accounts.slice(0, 5).map((account) => (
                                    <li key={account.id} className="flex items-center justify-between py-3 first:pt-0 last:pb-0">
                                        <Link href={route('platform.accounts.show', { account: account.id })} className="flex min-w-0 items-center gap-2">
                                            <span className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-waify-green text-xs font-bold text-white">
                                                {account.name.charAt(0).toUpperCase()}
                                            </span>
                                            <div className="min-w-0">
                                                <div className="truncate text-sm font-medium text-waify-text dark:text-waify-dark-text">{account.name}</div>
                                                <div className="text-[11px] text-waify-text-muted dark:text-waify-dark-text-muted">{account.owner.name}</div>
                                            </div>
                                        </Link>
                                        <Badge variant={statusVariant(account.status)}>{account.status}</Badge>
                                    </li>
                                ))}
                                {recent_accounts.length === 0 && (
                                    <li className="py-8 text-center text-sm text-waify-text-muted dark:text-waify-dark-text-muted">No workspaces yet.</li>
                                )}
                            </ul>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="p-5">
                            <div className="mb-4 flex items-center justify-between">
                                <h3 className="text-sm font-semibold text-waify-text dark:text-waify-dark-text">System health</h3>
                                <Link href={route('platform.system-health')}>
                                    <Button variant="ghost" size="sm">Details</Button>
                                </Link>
                            </div>
                            <ul className="space-y-3">
                                {[
                                    ['WhatsApp send API', stats.active_connections > 0 ? 'Operational' : 'No active connection', stats.active_connections > 0 ? 'success' : 'warning'],
                                    ['Webhook delivery', stats.connections_with_errors > 0 ? `${stats.connections_with_errors} errors` : 'No connection errors', stats.connections_with_errors > 0 ? 'warning' : 'success'],
                                    ['Meta templates', stats.rejected_templates > 0 ? `${stats.rejected_templates} rejected` : `${stats.approved_templates} approved`, stats.rejected_templates > 0 ? 'warning' : 'success'],
                                    ['Billing status', stats.past_due_subscriptions > 0 ? `${stats.past_due_subscriptions} past due` : 'Operational', stats.past_due_subscriptions > 0 ? 'warning' : 'success'],
                                ].map(([name, status, variant]) => (
                                    <li key={name} className="flex items-center justify-between text-sm">
                                        <span className="text-waify-text dark:text-waify-dark-text">{name}</span>
                                        <Badge variant={variant as any}>{status}</Badge>
                                    </li>
                                ))}
                            </ul>
                        </CardContent>
                    </Card>
                </div>

                <div className="grid gap-4 lg:grid-cols-3">
                    <Card>
                        <CardContent className="p-5">
                            <h3 className="mb-4 text-sm font-semibold text-waify-text dark:text-waify-dark-text">Operational alerts</h3>
                            <div className="space-y-3">
                                {alerts.length === 0 ? (
                                    <div className="rounded-card border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-700 dark:border-emerald-400/30 dark:bg-emerald-950/30 dark:text-emerald-300">
                                        No active platform alerts.
                                    </div>
                                ) : alerts.map((alert) => {
                                    const Icon = alert.icon;
                                    return (
                                        <Link key={alert.title} href={alert.href} className="flex gap-3 rounded-card border border-gray-100 p-3 transition hover:bg-gray-50 dark:border-slate-700 dark:hover:bg-slate-800/60">
                                            <Icon className={`h-5 w-5 flex-shrink-0 ${alert.color}`} />
                                            <div>
                                                <p className="text-sm font-medium text-waify-text dark:text-waify-dark-text">{alert.title}</p>
                                                <p className="text-xs text-waify-text-muted dark:text-waify-dark-text-muted">{alert.message}</p>
                                            </div>
                                        </Link>
                                    );
                                })}
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="p-5">
                            <h3 className="mb-4 text-sm font-semibold text-waify-text dark:text-waify-dark-text">Top workspaces</h3>
                            <div className="space-y-3">
                                {top_accounts.length === 0 ? (
                                    <p className="py-6 text-center text-sm text-waify-text-muted dark:text-waify-dark-text-muted">No message data available.</p>
                                ) : top_accounts.map((account, index) => (
                                    <Link key={account.id} href={route('platform.accounts.show', { account: account.id })} className="flex items-center justify-between rounded-card p-2 transition hover:bg-gray-50 dark:hover:bg-slate-800/60">
                                        <div className="flex min-w-0 items-center gap-2">
                                            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50 text-xs font-bold text-blue-600 dark:bg-blue-950/40">{index + 1}</span>
                                            <div className="min-w-0">
                                                <p className="truncate text-sm font-medium text-waify-text dark:text-waify-dark-text">{account.name}</p>
                                                <p className="text-[11px] text-waify-text-muted dark:text-waify-dark-text-muted">{account.slug}</p>
                                            </div>
                                        </div>
                                        <span className="text-sm font-semibold tabular-nums text-waify-text dark:text-waify-dark-text">{formatNumber(account.message_count)}</span>
                                    </Link>
                                ))}
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="p-5">
                            <h3 className="mb-4 text-sm font-semibold text-waify-text dark:text-waify-dark-text">Message direction</h3>
                            <ul className="space-y-3">
                                {messageDirections.map(([label, value, Icon, color]) => (
                                    <li key={String(label)}>
                                        <div className="mb-1 flex items-center justify-between text-sm">
                                            <span className="inline-flex items-center gap-2 text-waify-text dark:text-waify-dark-text">
                                                <Icon className="h-4 w-4 text-waify-green" />
                                                {label}
                                            </span>
                                            <span className="tabular-nums text-waify-text-muted dark:text-waify-dark-text-muted">{formatNumber(Number(value))}</span>
                                        </div>
                                        <ProgressBar value={stats.total_messages > 0 ? Math.round((Number(value) / stats.total_messages) * 100) : 0} color={color} />
                                    </li>
                                ))}
                            </ul>
                        </CardContent>
                    </Card>
                </div>

                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                    <QuickLink href={route('platform.accounts.index')} icon={Building2} label="Workspaces" />
                    <QuickLink href={route('platform.users.index')} icon={Users} label="Users" />
                    <QuickLink href={route('platform.subscriptions.index')} icon={CreditCard} label="Subscriptions" />
                    <QuickLink href={route('platform.transactions.index')} icon={BarChart3} label="Transactions" />
                    <QuickLink href={route('platform.plans.index')} icon={Layers} label="Plans" />
                    <QuickLink href={route('platform.support.index')} icon={LifeBuoy} label="Support queue" />
                    <QuickLink href={route('platform.templates.index')} icon={FileText} label="Templates" />
                    <QuickLink href={route('platform.activity-logs')} icon={History} label="Audit logs" />
                    <QuickLink href={route('platform.modules.index')} icon={Shield} label="Modules" />
                    <QuickLink href={route('platform.system-health')} icon={CheckCircle2} label="System health" />
                    <QuickLink href={route('platform.analytics')} icon={MessageSquare} label="Analytics" />
                    <QuickLink href={route('platform.settings')} icon={AlertCircle} label="Settings" />
                </div>
            </div>
        </PlatformShell>
    );
}
