import { Head, Link, usePage } from '@inertiajs/react';
import AppShell from '@/Layouts/AppShell';
import {
    ArrowRight,
    BarChart3,
    Calendar,
    Clock,
    FileText,
    Inbox,
    Link as LinkIcon,
    MailOpen,
    Megaphone,
    MessageCircle,
    MousePointerClick,
    Send,
    Sparkles,
    UploadCloud,
    Users,
    Workflow,
} from 'lucide-react';
import { useMemo, useState } from 'react';

interface Stats {
    messages: {
        total: number;
        today: number;
        this_week: number;
        this_month: number;
        outbound_this_month?: number;
        delivered_this_month?: number;
        read_this_month?: number;
        failed_this_month?: number;
        inbound: number;
        outbound: number;
        delivered: number;
        read: number;
        failed: number;
    };
    connections: {
        total: number;
        active: number;
    };
    templates: {
        total: number;
        approved: number;
    };
    conversations: {
        total: number;
        open: number;
        assigned: number;
    };
    team: {
        total_members: number;
        admins: number;
    };
    usage: Record<string, any>;
}

interface MessageTrend {
    date: string;
    count: number;
    outbound: number;
    inbound: number;
    delivered: number;
    read: number;
    failed: number;
}

interface RecentConversation {
    id: number;
    contact_name: string;
    last_message: string | null;
    status: string;
    last_activity_at: string | null;
}

type Period = '7d' | '30d';

function formatNumber(num: number) {
    if (num >= 10000000) return `${(num / 10000000).toFixed(1)}Cr`;
    if (num >= 100000) return `${(num / 100000).toFixed(1)}L`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return String(num ?? 0);
}

function clampRate(value: number) {
    return Math.max(0, Math.min(100, Math.round(Number.isFinite(value) ? value : 0)));
}

function formatDate(date: string | null) {
    if (!date) return 'No activity';
    return new Date(date).toLocaleString('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });
}

function Card({ children, className = '' }: { children: React.ReactNode; className?: string }) {
    return (
        <div className={`rounded-card border border-transparent bg-white shadow-card dark:border-slate-700/80 dark:bg-slate-800 dark:shadow-none ${className}`}>
            {children}
        </div>
    );
}

function MetricChip({ value }: { value: string }) {
    return (
        <span className="inline-flex items-center rounded-md bg-gray-100 px-1.5 py-0.5 text-[11px] font-semibold text-waify-text-muted dark:bg-waify-dark-surface-2 dark:text-waify-dark-text-muted">
            {value}
        </span>
    );
}

function ProgressBar({ value, color = 'green' }: { value: number; color?: 'green' | 'blue' | 'purple' | 'amber' }) {
    const colors = {
        green: 'bg-waify-green',
        blue: 'bg-blue-500',
        purple: 'bg-purple-500',
        amber: 'bg-amber-500',
    };

    return (
        <div className="h-1.5 w-full overflow-hidden rounded-full bg-gray-100 dark:bg-waify-dark-surface-2">
            <div className={`h-full rounded-full ${colors[color]} transition-all duration-500`} style={{ width: `${Math.max(0, Math.min(100, value))}%` }} />
        </div>
    );
}

function KpiCard({
    icon: Icon,
    iconBg,
    label,
    value,
    trend,
    trendNote = 'current workspace',
    suffix,
    footer,
}: {
    icon: any;
    iconBg: string;
    label: string;
    value: string | number;
    trend: string;
    trendNote?: string;
    suffix?: string;
    footer?: React.ReactNode;
}) {
    return (
        <Card className="p-5 transition-shadow hover:shadow-card-lg">
            <div className="flex items-start justify-between">
                <div>
                    <div className="text-[11px] font-medium uppercase tracking-wide text-waify-text-muted dark:text-waify-dark-text-muted">{label}</div>
                    <div className="mt-1.5 flex items-baseline gap-1">
                        <span className="text-2xl font-bold tracking-tight text-waify-text tabular-nums dark:text-waify-dark-text">{value}</span>
                        {suffix && <span className="text-lg font-semibold text-waify-text-muted dark:text-waify-dark-text-muted">{suffix}</span>}
                    </div>
                    <div className="mt-1.5 flex items-center gap-1">
                        <MetricChip value={trend} />
                        <span className="text-xs text-waify-text-muted dark:text-waify-dark-text-muted">{trendNote}</span>
                    </div>
                </div>
                <div className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl ${iconBg}`}>
                    <Icon className="h-[18px] w-[18px]" />
                </div>
            </div>
            {footer}
        </Card>
    );
}

function PeriodToggle({ value, onChange }: { value: Period; onChange: (period: Period) => void }) {
    const options: Period[] = ['7d', '30d'];

    return (
        <div className="flex items-center gap-1 rounded-lg bg-gray-100 p-0.5 text-xs font-medium dark:bg-waify-dark-surface-2">
            {options.map((option) => (
                <button
                    key={option}
                    type="button"
                    onClick={() => onChange(option)}
                    className={`rounded-md px-2.5 py-1.5 transition ${
                        value === option
                            ? 'bg-white text-waify-text shadow-sm dark:bg-waify-dark-surface dark:text-waify-dark-text'
                            : 'text-waify-text-muted hover:text-waify-text dark:text-waify-dark-text-muted dark:hover:text-waify-dark-text'
                    }`}
                >
                    {option}
                </button>
            ))}
        </div>
    );
}

function AreaTrendChart({ data }: { data: Array<{ label: string; sent: number; delivered: number }> }) {
    const width = 760;
    const height = 260;
    const max = Math.max(...data.flatMap((item) => [item.sent, item.delivered]), 1);
    const makePath = (key: 'sent' | 'delivered') => data.map((item, index) => {
        const x = (index / Math.max(data.length - 1, 1)) * width;
        const y = height - (item[key] / max) * (height - 26) - 14;
        return `${index === 0 ? 'M' : 'L'}${x},${y}`;
    }).join(' ');
    const sentPath = makePath('sent');
    const deliveredPath = makePath('delivered');

    return (
        <div className="h-[260px] w-full overflow-hidden">
            <svg viewBox={`0 0 ${width} ${height}`} className="h-full w-full" preserveAspectRatio="none">
                <defs>
                    <linearGradient id="dashboardSent" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#00A548" stopOpacity="0.25" />
                        <stop offset="100%" stopColor="#00A548" stopOpacity="0" />
                    </linearGradient>
                    <linearGradient id="dashboardDelivered" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#60A5FA" stopOpacity="0.2" />
                        <stop offset="100%" stopColor="#60A5FA" stopOpacity="0" />
                    </linearGradient>
                </defs>
                {[0, 1, 2, 3].map((line) => (
                    <line key={line} x1="0" x2={width} y1={(height / 4) * line + 12} y2={(height / 4) * line + 12} stroke="currentColor" className="text-gray-100 dark:text-slate-700" strokeDasharray="4 4" />
                ))}
                <path d={`${sentPath} L${width},${height} L0,${height} Z`} fill="url(#dashboardSent)" />
                <path d={`${deliveredPath} L${width},${height} L0,${height} Z`} fill="url(#dashboardDelivered)" />
                <path d={sentPath} stroke="#00A548" strokeWidth="3" fill="none" strokeLinecap="round" strokeLinejoin="round" />
                <path d={deliveredPath} stroke="#60A5FA" strokeWidth="3" fill="none" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
        </div>
    );
}

function StatusBadge({ status }: { status: string }) {
    const normalized = status?.toLowerCase() || 'open';
    const map: Record<string, { label: string; className: string; dot: string }> = {
        open: { label: 'Open', className: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300', dot: 'bg-emerald-500' },
        assigned: { label: 'Assigned', className: 'bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-300', dot: 'bg-blue-500' },
        closed: { label: 'Closed', className: 'bg-purple-50 text-purple-700 dark:bg-purple-500/10 dark:text-purple-300', dot: 'bg-purple-500' },
        pending: { label: 'Pending', className: 'bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-300', dot: 'bg-amber-500' },
    };
    const item = map[normalized] || { label: normalized, className: 'bg-gray-100 text-gray-700 dark:bg-slate-700 dark:text-slate-200', dot: 'bg-gray-400' };

    return (
        <span className={`inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[11px] font-medium capitalize ${item.className}`}>
            <span className={`h-1.5 w-1.5 rounded-full ${item.dot}`} />
            {item.label}
        </span>
    );
}

function routeExists(navigation: any[] | undefined, routeName: string) {
    return navigation?.some((nav: any) => nav.href === routeName || nav.route === routeName || nav.name === routeName) ?? true;
}

function safeRoute(routeName: string, fallback = '#', params?: Record<string, any>) {
    try {
        return params ? route(routeName, params) : route(routeName);
    } catch {
        return fallback;
    }
}

export default function Dashboard({
    account,
    stats,
    message_trends,
    recent_conversations,
}: {
    account: any;
    stats: Stats;
    message_trends: MessageTrend[];
    recent_conversations: RecentConversation[];
}) {
    const { navigation, auth } = usePage().props as any;
    const [period, setPeriod] = useState<Period>('30d');
    const visibleTrends = useMemo(() => (message_trends || []).slice(period === '7d' ? -7 : -30), [period, message_trends]);
    const chartData = visibleTrends.map((item) => ({
        label: item.date ? new Date(item.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' }) : '-',
        sent: Number(item.outbound || 0),
        delivered: Number(item.delivered || 0),
    }));
    const chartTotal = chartData.reduce((sum, item) => sum + item.sent, 0);
    const totalMessages = Math.max(Number(stats.messages.total || 0), 1);
    const outboundThisMonth = Math.max(0, Number(stats.messages.outbound_this_month ?? stats.usage?.messages_sent ?? stats.messages.outbound ?? 0));
    const deliveredThisMonth = Math.max(0, Number(stats.messages.delivered_this_month ?? stats.messages.delivered ?? 0));
    const readThisMonth = Math.max(0, Number(stats.messages.read_this_month ?? stats.messages.read ?? 0));
    const outboundTotal = Math.max(outboundThisMonth, 1);
    const deliveredTotal = Math.min(outboundTotal, deliveredThisMonth);
    const readTotal = Math.min(deliveredTotal, readThisMonth);
    const deliveryRate = outboundThisMonth > 0 ? clampRate((deliveredTotal / outboundTotal) * 100) : 0;
    const readRate = deliveredTotal > 0 ? clampRate((readTotal / deliveredTotal) * 100) : 0;

    const quickStats = [
        { icon: MousePointerClick, color: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-300', label: 'Inbound mix', sub: 'Share of total messages', value: `${Math.round((stats.messages.inbound / totalMessages) * 100)}%` },
        { icon: Workflow, color: 'bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-300', label: 'Connections', sub: 'Active channels', value: `${stats.connections.active}/${stats.connections.total}` },
        { icon: FileText, color: 'bg-purple-50 text-purple-600 dark:bg-purple-500/10 dark:text-purple-300', label: 'Approved templates', sub: 'Ready to use', value: stats.templates.approved },
        { icon: Clock, color: 'bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-300', label: 'Assigned chats', sub: 'Team workload', value: stats.conversations.assigned },
        { icon: MessageCircle, color: 'bg-red-50 text-red-600 dark:bg-red-500/10 dark:text-red-300', label: 'Open inbox', sub: 'Needs attention', value: stats.conversations.open, highlight: true },
    ];

    const quickActions = [
        { label: 'Get started', subtitle: 'Complete setup wizard', icon: Sparkles, href: safeRoute('onboarding'), color: 'bg-waify-green-soft text-waify-green-dark dark:bg-waify-green/10 dark:text-waify-green' },
        { label: 'Create Campaign', subtitle: 'Launch a broadcast', icon: Megaphone, href: `${safeRoute('app.broadcasts.index')}?panel=create`, color: 'bg-emerald-50 text-waify-green-dark dark:bg-emerald-500/10 dark:text-emerald-300' },
        { label: 'Import Contacts', subtitle: 'Bulk add from CSV', icon: UploadCloud, href: safeRoute('app.contacts.index'), color: 'bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-300' },
        { label: 'Build Template', subtitle: 'Design a message', icon: FileText, href: safeRoute('app.whatsapp.templates.index'), color: 'bg-purple-50 text-purple-600 dark:bg-purple-500/10 dark:text-purple-300' },
        { label: 'View Reports', subtitle: 'Open analytics', icon: BarChart3, href: safeRoute('app.analytics.index'), color: 'bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-300' },
    ].filter((action) => action.href !== '#' || routeExists(navigation, action.label));

    return (
        <AppShell>
            <Head title="Dashboard" />

            <div className="mx-auto max-w-[1600px] space-y-6 p-2 sm:p-4 lg:p-0">
                <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight text-waify-text dark:text-waify-dark-text">
                            Good morning{auth?.user?.name ? `, ${auth.user.name.split(' ')[0]}` : account?.name ? `, ${account.name}` : ''}
                        </h1>
                        <p className="mt-1 text-sm text-waify-text-muted dark:text-waify-dark-text-muted">Here is what is happening with your WhatsApp operations today.</p>
                    </div>
                    <button type="button" className="inline-flex h-9 items-center gap-2 self-start rounded-btn bg-white px-3 text-sm text-waify-text ring-1 ring-gray-200 dark:bg-waify-dark-surface dark:text-waify-dark-text dark:ring-waify-dark-border" disabled>
                        <Calendar className="h-3.5 w-3.5" />
                        Live workspace data
                    </button>
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
                    <KpiCard
                        icon={Send}
                        iconBg="bg-emerald-50 text-waify-green-dark dark:bg-emerald-500/10 dark:text-emerald-300"
                        label="Messages Sent"
                        value={formatNumber(outboundThisMonth)}
                        trend={`${stats.messages.today} today`}
                        footer={<div className="mt-4 text-xs text-waify-text-muted dark:text-waify-dark-text-muted">{formatNumber(stats.messages.this_month)} total messages this month</div>}
                    />
                    <KpiCard
                        icon={MailOpen}
                        iconBg="bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-300"
                        label="Delivery Rate"
                        value={deliveryRate}
                        suffix="%"
                        trend={`${formatNumber(deliveredTotal)} delivered`}
                        footer={
                            <>
                                <div className="mt-4"><ProgressBar value={deliveryRate} color="blue" /></div>
                                <div className="mt-1.5 flex items-center justify-between text-[11px] text-waify-text-muted dark:text-waify-dark-text-muted">
                                    <span>Read rate</span>
                                    <span className="font-medium text-blue-600 dark:text-blue-300">{readRate}% of delivered</span>
                                </div>
                            </>
                        }
                    />
                    <KpiCard
                        icon={LinkIcon}
                        iconBg="bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-300"
                        label="Active Connections"
                        value={stats.connections.active}
                        trend={`${stats.connections.total} total`}
                        footer={<div className="mt-4"><ProgressBar value={stats.connections.total > 0 ? (stats.connections.active / stats.connections.total) * 100 : 0} /></div>}
                    />
                    <KpiCard
                        icon={Users}
                        iconBg="bg-purple-50 text-purple-600 dark:bg-purple-500/10 dark:text-purple-300"
                        label="Team Members"
                        value={stats.team.total_members}
                        trend={`${stats.team.admins} admins`}
                        trendNote="active workspace"
                        footer={<div className="mt-4 text-xs text-waify-text-muted dark:text-waify-dark-text-muted">{stats.conversations.assigned} conversations assigned</div>}
                    />
                </div>

                <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
                    <Card className="p-5 lg:col-span-2">
                        <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
                            <div>
                                <h2 className="text-base font-semibold text-waify-text dark:text-waify-dark-text">Outbound Sent vs Delivered</h2>
                                <p className="mt-0.5 text-xs text-waify-text-muted dark:text-waify-dark-text-muted">
                                    Last {period === '7d' ? '7' : '30'} days · {formatNumber(chartTotal)} outbound messages
                                </p>
                            </div>
                            <div className="flex flex-wrap items-center gap-3">
                                <div className="flex items-center gap-4 text-xs text-waify-text dark:text-waify-dark-text">
                                    <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-waify-green" /> Sent</span>
                                    <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-blue-400" /> Delivered</span>
                                </div>
                                <PeriodToggle value={period} onChange={setPeriod} />
                            </div>
                        </div>
                        <AreaTrendChart data={chartData} />
                    </Card>

                    <Card className="flex h-full flex-col p-5">
                        <h2 className="text-base font-semibold text-waify-text dark:text-waify-dark-text">Quick stats</h2>
                        <div className="mt-4 flex-1 space-y-3">
                            {quickStats.map(({ icon: Icon, color, label, sub, value, highlight }) => (
                                <div key={label} className="flex items-center justify-between">
                                    <div className="flex min-w-0 items-center gap-3">
                                        <div className={`flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg ${color}`}>
                                            <Icon className="h-4 w-4" />
                                        </div>
                                        <div className="min-w-0">
                                            <div className="text-sm font-medium text-waify-text dark:text-waify-dark-text">{label}</div>
                                            <div className="text-xs text-waify-text-muted dark:text-waify-dark-text-muted">{sub}</div>
                                        </div>
                                    </div>
                                    <span className={`ml-2 flex-shrink-0 text-sm font-bold tabular-nums ${highlight ? 'text-red-600 dark:text-red-300' : 'text-waify-text dark:text-waify-dark-text'}`}>
                                        {value}
                                    </span>
                                </div>
                            ))}
                        </div>
                        <Link href={safeRoute('app.whatsapp.conversations.index')} className="mt-4 flex h-9 w-full items-center justify-center gap-1.5 rounded-btn bg-waify-green-soft text-sm font-medium text-waify-green-dark transition hover:bg-emerald-100 dark:bg-waify-green/10 dark:text-waify-green dark:hover:bg-waify-green/15">
                            Open inbox <ArrowRight className="h-3.5 w-3.5" />
                        </Link>
                    </Card>
                </div>

                <Card className="overflow-hidden p-0">
                    <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4 dark:border-waify-dark-border">
                        <div>
                            <h2 className="text-base font-semibold text-waify-text dark:text-waify-dark-text">Recent Conversations</h2>
                            <p className="mt-0.5 text-xs text-waify-text-muted dark:text-waify-dark-text-muted">Latest customer activity</p>
                        </div>
                        <Link href={safeRoute('app.whatsapp.conversations.index')} className="flex items-center gap-1 text-sm font-medium text-waify-green-dark hover:underline dark:text-waify-green">
                            View all <ArrowRight className="h-3.5 w-3.5" />
                        </Link>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full min-w-[760px] text-sm">
                            <thead>
                                <tr className="bg-gray-50/60 text-left text-[11px] uppercase tracking-wider text-waify-text-muted dark:bg-waify-dark-surface-2/70 dark:text-waify-dark-text-muted">
                                    <th className="px-5 py-3 font-medium">Contact</th>
                                    <th className="px-4 py-3 font-medium">Status</th>
                                    <th className="px-4 py-3 font-medium">Last message</th>
                                    <th className="px-4 py-3 font-medium text-right">Activity</th>
                                </tr>
                            </thead>
                            <tbody>
                                {recent_conversations.length === 0 ? (
                                    <tr>
                                        <td colSpan={4} className="px-5 py-14 text-center">
                                            <Inbox className="mx-auto mb-3 h-10 w-10 text-gray-300 dark:text-waify-dark-text-muted" />
                                            <p className="text-sm font-medium text-waify-text dark:text-waify-dark-text">No conversations yet</p>
                                            <p className="mt-1 text-xs text-waify-text-muted dark:text-waify-dark-text-muted">New WhatsApp conversations will appear here.</p>
                                        </td>
                                    </tr>
                                ) : recent_conversations.slice(0, 6).map((conversation) => {
                                    const href = safeRoute('app.whatsapp.conversations.index', safeRoute('app.whatsapp.conversations.index'), { conversation: conversation.id });
                                    return (
                                        <tr key={conversation.id} className="cursor-pointer border-t border-gray-100 transition hover:bg-gray-50/60 dark:border-waify-dark-border dark:hover:bg-waify-dark-surface-2/60">
                                            <td className="px-5 py-3.5">
                                                <Link href={href} className="flex items-center gap-3">
                                                    <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-waify-green text-sm font-bold text-waify-ink">
                                                        {conversation.contact_name?.charAt(0) || 'C'}
                                                    </div>
                                                    <div>
                                                        <div className="font-medium text-waify-text dark:text-waify-dark-text">{conversation.contact_name || 'Unknown contact'}</div>
                                                        <div className="mt-0.5 text-[11px] text-waify-text-muted dark:text-waify-dark-text-muted">WhatsApp conversation</div>
                                                    </div>
                                                </Link>
                                            </td>
                                            <td className="px-4 py-3.5"><StatusBadge status={conversation.status} /></td>
                                            <td className="max-w-sm truncate px-4 py-3.5 text-waify-text-muted dark:text-waify-dark-text-muted">{conversation.last_message || 'No message preview'}</td>
                                            <td className="px-4 py-3.5 text-right text-xs text-waify-text-muted dark:text-waify-dark-text-muted">{formatDate(conversation.last_activity_at)}</td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </Card>

                <div>
                    <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-waify-text dark:text-waify-dark-text">Quick Actions</h2>
                    <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-5">
                        {quickActions.map(({ label, subtitle, icon: Icon, href, color }) => (
                            <Link key={label} href={href} className="group rounded-card border border-transparent bg-white p-4 text-left shadow-card transition-all hover:-translate-y-0.5 hover:shadow-card-lg dark:border-slate-700/80 dark:bg-slate-800 dark:shadow-none">
                                <div className={`mb-3 flex h-10 w-10 items-center justify-center rounded-lg transition-transform group-hover:scale-110 ${color}`}>
                                    <Icon className="h-5 w-5" />
                                </div>
                                <div className="text-sm font-semibold text-waify-text dark:text-waify-dark-text">{label}</div>
                                <div className="mt-0.5 text-xs text-waify-text-muted dark:text-waify-dark-text-muted">{subtitle}</div>
                            </Link>
                        ))}
                    </div>
                </div>
            </div>
        </AppShell>
    );
}
