import { Head, Link, useForm } from '@inertiajs/react';
import AppShell from '@/Layouts/AppShell';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/Components/UI/Card';
import { Badge } from '@/Components/UI/Badge';
import Button from '@/Components/UI/Button';
import Modal from '@/Components/Modal';
import { 
    MessageSquare, 
    Send, 
    Inbox, 
    Link as LinkIcon,
    FileText,
    Users,
    TrendingUp,
    Activity,
    ArrowRight,
    CheckCircle,
    Copy,
    QrCode
} from 'lucide-react';
import { usePage } from '@inertiajs/react';
import { useEffect, useState } from 'react';
import { Input } from '@/Components/UI/Input';
import { Label } from '@/Components/UI/Label';
import QRCode from 'qrcode';

interface Stats {
    messages: {
        total: number;
        today: number;
        this_week: number;
        this_month: number;
        inbound: number;
        outbound: number;
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
}

interface RecentConversation {
    id: number;
    contact_name: string;
    last_message: string | null;
    status: string;
    last_activity_at: string | null;
}

interface OnboardingChecklist {
    show: boolean;
    completed: number;
    total: number;
    progress_percent: number;
    next_item?: {
        key: string;
        label: string;
        href: string;
        cta: string;
    } | null;
    items: Array<{
        key: string;
        label: string;
        description: string;
        done: boolean;
        href: string;
        cta: string;
    }>;
}

interface ConnectionAlert {
    id: number;
    slug: string;
    name: string;
    is_active: boolean;
    webhook_subscribed: boolean;
    webhook_last_error: string | null;
    webhook_last_received_at: string | null;
}

interface ConnectionHeartbeat {
    window_minutes: number;
    active_connections: number;
    healthy: number;
    stale: number;
    offline_or_error: number;
    latest_received_at: string | null;
}

interface CustomerStartConversation {
    widget_id: number;
    widget_slug: string;
    widget_name: string;
    widget_type: string;
    start_link: string | null;
}

interface ConnectionHealthSummary {
    total_active: number;
    healthy: number;
    warning: number;
    restricted: number;
    unknown: number;
    last_synced_at: string | null;
    at_risk: Array<{
        id: number;
        slug: string;
        name: string;
        health_state: string;
        quality_rating: string | null;
        messaging_limit_tier: string | null;
        warning_state: string | null;
        restriction_state: string | null;
    }>;
}

export default function Dashboard({ 
    account, 
    stats, 
    onboarding_checklist,
    connection_alerts = [],
    connection_heartbeat = null,
    connection_health_summary = null,
    customer_start_conversation = null,
    message_trends, 
    recent_conversations 
}: { 
    account: any;
    stats: Stats;
    onboarding_checklist?: OnboardingChecklist;
    connection_alerts?: ConnectionAlert[];
    connection_heartbeat?: ConnectionHeartbeat | null;
    connection_health_summary?: ConnectionHealthSummary | null;
    customer_start_conversation?: CustomerStartConversation | null;
    message_trends: MessageTrend[];
    recent_conversations: RecentConversation[];
}) {
    const { navigation } = usePage().props as any;
    const [setupWizardOpen, setSetupWizardOpen] = useState(false);
    const [wizardStepKey, setWizardStepKey] = useState<string | null>(null);
    const [dashboardWidgetQr, setDashboardWidgetQr] = useState<string | null>(null);
    const inviteForm = useForm({
        email: '',
        role: 'member',
    });
    
    // Helper to check if a route exists in navigation (module enabled)
    const hasRoute = (routeName: string) => {
        return navigation?.some((nav: any) => nav.href === routeName) ?? false;
    };

    const formatNumber = (num: number) => {
        if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
        if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
        return num.toString();
    };

    const getMaxValue = (data: MessageTrend[]) => {
        if (data.length === 0) return 100;
        return Math.max(...data.map(d => d.count || 0), 1);
    };

    const openSetupWizard = (stepKey?: string | null) => {
        setWizardStepKey(stepKey ?? null);
        setSetupWizardOpen(true);
    };

    const launchInNewTab = (href: string) => {
        window.open(href, '_blank', 'noopener,noreferrer');
    };

    const submitQuickInvite = () => {
        inviteForm.post(route('app.team.invite', {}), {
            preserveScroll: true,
            onSuccess: () => {
                inviteForm.reset('email');
            },
        });
    };

    useEffect(() => {
        let active = true;
        const link = customer_start_conversation?.start_link;
        if (!link) {
            setDashboardWidgetQr(null);
            return () => {
                active = false;
            };
        }

        QRCode.toDataURL(link, { width: 180, margin: 1 })
            .then((url) => {
                if (active) setDashboardWidgetQr(url);
            })
            .catch(() => {
                if (active) setDashboardWidgetQr(null);
            });

        return () => {
            active = false;
        };
    }, [customer_start_conversation?.start_link]);

    const statCards = [
        {
            label: 'Messages',
            value: formatNumber(stats.messages.total),
            change: `${stats.messages.today} today`,
            icon: MessageSquare,
        },
        {
            label: 'Connections',
            value: stats.connections.active,
            change: `${stats.connections.total} total`,
            icon: LinkIcon,
        },
        {
            label: 'Open chats',
            value: stats.conversations.open,
            change: `${stats.conversations.total} total`,
            icon: Inbox,
        },
        {
            label: 'Team',
            value: stats.team.total_members,
            change: `${stats.team.admins} admins`,
            icon: Users,
        },
    ];

    return (
        <AppShell>
            <Head title="Dashboard" />
            <div className="space-y-6">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                    <div>
                        <h1 className="text-3xl font-semibold text-gray-900 dark:text-gray-100">
                            Dashboard
                        </h1>
                        <p className="mt-2 max-w-2xl text-sm text-gray-600 dark:text-gray-400">
                            See what needs attention, continue setup, and open the pages you use most.
                        </p>
                    </div>

                    <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap">
                        {hasRoute('app.whatsapp.conversations.index') && (
                            <Link href={route('app.whatsapp.conversations.index', {})}>
                                <Button className="w-full sm:w-auto">Open Inbox</Button>
                            </Link>
                        )}
                        {hasRoute('app.whatsapp.templates.create') && (
                            <Link href={route('app.whatsapp.templates.create', {})}>
                                <Button variant="secondary" className="w-full sm:w-auto">Create Template</Button>
                            </Link>
                        )}
                        {hasRoute('app.broadcasts.create') && (
                            <Link href={route('app.broadcasts.create', {})}>
                                <Button variant="secondary" className="w-full sm:w-auto">Create Campaign</Button>
                            </Link>
                        )}
                        {hasRoute('app.whatsapp.connections.index') && (
                            <Link href={route('app.whatsapp.connections.index', {})}>
                                <Button variant="secondary" className="w-full sm:w-auto">Manage Connection</Button>
                            </Link>
                        )}
                    </div>
                </div>

                {connection_alerts.length > 0 && (
                    <Card className="border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-900/20">
                        <CardContent className="p-4">
                            <div className="flex items-start justify-between gap-4">
                                <div>
                                    <p className="text-sm font-semibold text-amber-800 dark:text-amber-200">
                                        Connection attention required
                                    </p>
                                    <p className="text-xs text-amber-700 dark:text-amber-300 mt-1">
                                        One or more WhatsApp connections have webhook or activation issues.
                                    </p>
                                    <div className="mt-2 space-y-1">
                                        {connection_alerts.slice(0, 3).map((alert) => (
                                            <div key={alert.id} className="text-xs text-amber-800 dark:text-amber-200">
                                                {alert.name}: {!alert.is_active ? 'inactive' : !alert.webhook_subscribed ? 'webhook not subscribed' : 'webhook error'}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                                <Link href={route('app.whatsapp.connections.index', {})}>
                                    <Button variant="secondary" size="sm">Review Connections</Button>
                                </Link>
                            </div>
                        </CardContent>
                    </Card>
                )}

                <div className="grid grid-cols-1 gap-4 xl:grid-cols-[minmax(0,1.4fr)_minmax(320px,0.8fr)]">
                    <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
                            {statCards.map((stat, index) => {
                                const Icon = stat.icon;

                                return (
                                    <Card key={index} className="border border-gray-200 shadow-sm dark:border-gray-800">
                                        <CardContent className="p-5">
                                            <div className="flex items-start justify-between gap-3">
                                                <div>
                                                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                                                        {stat.label}
                                                    </p>
                                                    <p className="mt-2 text-2xl font-semibold text-gray-900 dark:text-gray-100">
                                                        {stat.value}
                                                    </p>
                                                    <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                                                        {stat.change}
                                                    </p>
                                                </div>
                                                <div className="rounded-lg border border-gray-200 bg-gray-50 p-2.5 dark:border-gray-700 dark:bg-gray-800">
                                                    <Icon className="h-5 w-5 text-gray-700 dark:text-gray-200" />
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                );
                            })}
                        </div>

                        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                            {onboarding_checklist?.show && (
                                <Card className="border border-gray-200 shadow-sm dark:border-gray-800">
                                    <CardHeader className="pb-3">
                                        <div className="flex items-center justify-between gap-3">
                                            <div>
                                                <CardTitle className="text-base font-semibold">Setup progress</CardTitle>
                                                <CardDescription>
                                                    Finish these steps to start using the account fully.
                                                </CardDescription>
                                            </div>
                                            <Badge variant="default">
                                                {onboarding_checklist.completed}/{onboarding_checklist.total}
                                            </Badge>
                                        </div>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <div className="h-2 overflow-hidden rounded-full bg-gray-100 dark:bg-gray-800">
                                            <div
                                                className="h-full rounded-full bg-gray-900 transition-all dark:bg-gray-100"
                                                style={{ width: `${onboarding_checklist.progress_percent}%` }}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            {onboarding_checklist.items.slice(0, 4).map((item) => (
                                                <button
                                                    key={item.key}
                                                    type="button"
                                                    onClick={() => openSetupWizard(item.key)}
                                                    className="flex w-full items-start justify-between rounded-lg border border-gray-200 px-3 py-3 text-left transition hover:border-gray-300 hover:bg-gray-50 dark:border-gray-800 dark:hover:border-gray-700 dark:hover:bg-gray-900"
                                                >
                                                    <div className="pr-3">
                                                        <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{item.label}</p>
                                                        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">{item.description}</p>
                                                    </div>
                                                    <Badge variant={item.done ? 'success' : 'default'} className="shrink-0 text-[10px]">
                                                        {item.done ? 'Done' : 'Pending'}
                                                    </Badge>
                                                </button>
                                            ))}
                                        </div>
                                        {onboarding_checklist.next_item && (
                                            <Button size="sm" onClick={() => openSetupWizard(onboarding_checklist.next_item?.key)}>
                                                {onboarding_checklist.next_item.cta}
                                            </Button>
                                        )}
                                    </CardContent>
                                </Card>
                            )}

                            <Card className="border border-gray-200 shadow-sm dark:border-gray-800">
                                <CardHeader className="pb-3">
                                    <CardTitle className="text-base font-semibold">Account status</CardTitle>
                                    <CardDescription>
                                        A simple summary of connection health and delivery readiness.
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    {connection_health_summary && connection_health_summary.total_active > 0 ? (
                                        <>
                                            <div className="grid grid-cols-2 gap-3">
                                                <div className="rounded-lg border border-gray-200 p-3 dark:border-gray-800">
                                                    <div className="text-xs text-gray-500 dark:text-gray-400">Healthy connections</div>
                                                    <div className="mt-1 text-xl font-semibold text-gray-900 dark:text-gray-100">{connection_health_summary.healthy}</div>
                                                </div>
                                                <div className="rounded-lg border border-gray-200 p-3 dark:border-gray-800">
                                                    <div className="text-xs text-gray-500 dark:text-gray-400">Need attention</div>
                                                    <div className="mt-1 text-xl font-semibold text-gray-900 dark:text-gray-100">
                                                        {connection_health_summary.warning + connection_health_summary.restricted}
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                                                <div className="flex items-center justify-between gap-4">
                                                    <span>Webhook status</span>
                                                    <span className="font-medium text-gray-900 dark:text-gray-100">
                                                        {connection_heartbeat
                                                            ? `${connection_heartbeat.healthy} healthy / ${connection_heartbeat.offline_or_error} offline`
                                                            : 'No live data'}
                                                    </span>
                                                </div>
                                                <div className="flex items-center justify-between gap-4">
                                                    <span>Last sync</span>
                                                    <span className="font-medium text-gray-900 dark:text-gray-100">
                                                        {connection_health_summary.last_synced_at
                                                            ? new Date(connection_health_summary.last_synced_at).toLocaleString()
                                                            : 'Never'}
                                                    </span>
                                                </div>
                                            </div>
                                            {connection_health_summary.at_risk.length > 0 && (
                                                <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900 dark:border-amber-800 dark:bg-amber-900/20 dark:text-amber-200">
                                                    <p className="font-medium">Needs review</p>
                                                    <p className="mt-1 text-xs">
                                                        {connection_health_summary.at_risk[0].name} has reduced health. Review connection quality and recent sends.
                                                    </p>
                                                </div>
                                            )}
                                            {hasRoute('app.whatsapp.connections.index') && (
                                                <Link href={route('app.whatsapp.connections.index', {})}>
                                                    <Button variant="secondary" size="sm">Open Connections</Button>
                                                </Link>
                                            )}
                                        </>
                                    ) : (
                                        <div className="rounded-lg border border-dashed border-gray-300 p-4 text-sm text-gray-600 dark:border-gray-700 dark:text-gray-400">
                                            No active WhatsApp connection yet. Connect your number to start receiving and sending messages.
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </div>

                        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                            <Card className="border border-gray-200 shadow-sm dark:border-gray-800">
                                <CardHeader className="pb-4">
                                    <CardTitle className="text-base font-semibold">Message volume</CardTitle>
                                    <CardDescription>How your account is being used right now.</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="grid grid-cols-2 gap-3">
                                        <div className="rounded-lg border border-gray-200 p-4 dark:border-gray-800">
                                            <p className="text-sm text-gray-500 dark:text-gray-400">Inbound</p>
                                            <p className="mt-2 text-2xl font-semibold text-gray-900 dark:text-gray-100">
                                                {formatNumber(stats.messages.inbound)}
                                            </p>
                                        </div>
                                        <div className="rounded-lg border border-gray-200 p-4 dark:border-gray-800">
                                            <p className="text-sm text-gray-500 dark:text-gray-400">Outbound</p>
                                            <p className="mt-2 text-2xl font-semibold text-gray-900 dark:text-gray-100">
                                                {formatNumber(stats.messages.outbound)}
                                            </p>
                                        </div>
                                        <div className="rounded-lg border border-gray-200 p-4 dark:border-gray-800">
                                            <p className="text-sm text-gray-500 dark:text-gray-400">This week</p>
                                            <p className="mt-2 text-2xl font-semibold text-gray-900 dark:text-gray-100">
                                                {formatNumber(stats.messages.this_week)}
                                            </p>
                                        </div>
                                        <div className="rounded-lg border border-gray-200 p-4 dark:border-gray-800">
                                            <p className="text-sm text-gray-500 dark:text-gray-400">This month</p>
                                            <p className="mt-2 text-2xl font-semibold text-gray-900 dark:text-gray-100">
                                                {formatNumber(stats.messages.this_month)}
                                            </p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card className="border border-gray-200 shadow-sm dark:border-gray-800">
                                <CardHeader className="pb-4">
                                    <CardTitle className="text-base font-semibold">Recent conversations</CardTitle>
                                    <CardDescription>Latest customer activity from your inbox.</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    {recent_conversations.length === 0 ? (
                                        <div className="rounded-lg border border-dashed border-gray-300 p-5 text-sm text-gray-600 dark:border-gray-700 dark:text-gray-400">
                                            No conversations yet. When customers message you, they will appear here.
                                        </div>
                                    ) : (
                                        <div className="space-y-2">
                                            {recent_conversations.map((conversation) => {
                                                const convId = Number(conversation.id);
                                                const conversationRoute = hasRoute('app.whatsapp.conversations.index') && Number.isInteger(convId) && convId >= 1
                                                    ? route('app.whatsapp.conversations.show', {
                                                        conversation: convId,
                                                    })
                                                    : '#';

                                                return (
                                                    <Link
                                                        key={conversation.id}
                                                        href={conversationRoute}
                                                        className="flex items-center justify-between gap-4 rounded-lg border border-gray-200 px-4 py-3 transition hover:border-gray-300 hover:bg-gray-50 dark:border-gray-800 dark:hover:border-gray-700 dark:hover:bg-gray-900"
                                                    >
                                                        <div className="min-w-0">
                                                            <div className="flex items-center gap-2">
                                                                <p className="truncate text-sm font-medium text-gray-900 dark:text-gray-100">
                                                                    {conversation.contact_name}
                                                                </p>
                                                                <Badge variant={conversation.status === 'open' ? 'success' : 'default'} className="text-[10px]">
                                                                    {conversation.status}
                                                                </Badge>
                                                            </div>
                                                            <p className="mt-1 truncate text-xs text-gray-500 dark:text-gray-400">
                                                                {conversation.last_message || 'No message preview'}
                                                            </p>
                                                        </div>
                                                        <ArrowRight className="h-4 w-4 shrink-0 text-gray-400" />
                                                    </Link>
                                                );
                                            })}
                                        </div>
                                    )}
                                    {hasRoute('app.whatsapp.conversations.index') && recent_conversations.length > 0 && (
                                        <div className="mt-4">
                                            <Link href={route('app.whatsapp.conversations.index', {})}>
                                                <Button variant="secondary" size="sm">Open Inbox</Button>
                                            </Link>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </div>
                    </div>

                    <div className="space-y-4">
                        {customer_start_conversation && (
                            <Card className="border border-gray-200 shadow-sm dark:border-gray-800">
                                <CardHeader className="pb-3">
                                    <CardTitle className="text-base font-semibold">Customer start link</CardTitle>
                                    <CardDescription>
                                        Share one link or QR code so customers can message you directly.
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                            {customer_start_conversation.start_link ? (
                                <div className="space-y-4">
                                    <div>
                                        <div className="text-xs text-gray-500 dark:text-gray-400">
                                            Source widget: <span className="font-semibold text-gray-700 dark:text-gray-200">{customer_start_conversation.widget_name}</span>
                                            <span className="ml-2 rounded px-2 py-0.5 bg-gray-100 dark:bg-gray-800 uppercase tracking-wide">
                                                {customer_start_conversation.widget_type}
                                            </span>
                                        </div>
                                        <div className="rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 p-3 text-xs break-all text-gray-700 dark:text-gray-300">
                                            {customer_start_conversation.start_link}
                                        </div>
                                        <div className="flex flex-wrap gap-2">
                                            <Button
                                                variant="secondary"
                                                size="sm"
                                                onClick={() => navigator.clipboard.writeText(customer_start_conversation.start_link || '')}
                                            >
                                                <Copy className="h-4 w-4 mr-2" />
                                                Copy Link
                                            </Button>
                                            <Link href={route('app.widgets.edit', { widget: customer_start_conversation.widget_slug })}>
                                                <Button variant="secondary" size="sm">Manage Widget</Button>
                                            </Link>
                                        </div>
                                    </div>
                                    <div className="rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 p-3 flex flex-col items-center justify-center">
                                        <div className="text-xs text-gray-500 dark:text-gray-400 mb-2 flex items-center gap-1">
                                            <QrCode className="h-4 w-4" />
                                            Scan to Chat
                                        </div>
                                        {dashboardWidgetQr ? (
                                            <img src={dashboardWidgetQr} alt="Customer start conversation QR" className="h-44 w-44 rounded-lg bg-white border border-gray-200 dark:border-gray-700" />
                                        ) : (
                                            <div className="h-44 w-44 rounded-lg border border-dashed border-gray-300 dark:border-gray-700 flex items-center justify-center text-xs text-gray-500">
                                                QR unavailable
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ) : (
                                <div className="rounded-lg border border-amber-300/70 bg-amber-50 dark:bg-amber-900/20 dark:border-amber-800 p-3 text-sm text-amber-800 dark:text-amber-300">
                                    Configure a valid WhatsApp phone in your widget to generate the start conversation link.
                                </div>
                            )}
                                </CardContent>
                            </Card>
                        )}

                    <Card className="border border-gray-200 shadow-sm dark:border-gray-800">
                        <CardHeader className="pb-4">
                            <CardTitle className="text-base font-semibold">Message trend</CardTitle>
                            <CardDescription>Last 7 days</CardDescription>
                        </CardHeader>
                        <CardContent>
                            {message_trends.length === 0 ? (
                                <div className="flex flex-col items-center justify-center py-12">
                                    <Activity className="h-12 w-12 text-gray-400 mb-4" />
                                    <p className="text-gray-500 dark:text-gray-400">No data available</p>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {message_trends.map((trend) => {
                                        const maxValue = getMaxValue(message_trends);
                                        const percentage = (trend.count / maxValue) * 100;
                                        
                                        return (
                                            <div key={trend.date} className="flex items-center gap-4">
                                                <div className="w-20 text-xs font-medium text-gray-600 dark:text-gray-400">
                                                    {new Date(trend.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                                </div>
                                                <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-2 overflow-hidden">
                                                    <div
                                                        className="h-full rounded-full bg-gray-900 transition-all duration-500 dark:bg-gray-100"
                                                        style={{ width: `${percentage}%` }}
                                                    />
                                                </div>
                                                <div className="w-16 text-right text-xs font-bold text-gray-900 dark:text-gray-100">
                                                    {formatNumber(trend.count)}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    <Card className="border border-gray-200 shadow-sm dark:border-gray-800">
                        <CardHeader className="pb-4">
                            <CardTitle className="text-base font-semibold">Quick actions</CardTitle>
                            <CardDescription>Open the pages you use most often.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-2">
                                {hasRoute('app.whatsapp.connections.index') && (
                                <Link
                                    href={route('app.whatsapp.connections.index', {})}
                                    className="flex items-center gap-4 rounded-lg border border-gray-200 px-4 py-3 transition hover:border-gray-300 hover:bg-gray-50 dark:border-gray-800 dark:hover:border-gray-700 dark:hover:bg-gray-900"
                                >
                                    <div className="rounded-lg border border-gray-200 bg-gray-50 p-2 dark:border-gray-700 dark:bg-gray-800">
                                        <LinkIcon className="h-4 w-4 text-gray-700 dark:text-gray-200" />
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                            Manage Connections
                                        </p>
                                        <p className="text-xs text-gray-500 dark:text-gray-400">Connect and review your WhatsApp numbers</p>
                                    </div>
                                    <ArrowRight className="h-4 w-4 text-gray-400" />
                                </Link>
                                )}
                                
                                {hasRoute('app.whatsapp.templates.index') && (
                                <Link
                                    href={route('app.whatsapp.templates.index', {})}
                                    className="flex items-center gap-4 rounded-lg border border-gray-200 px-4 py-3 transition hover:border-gray-300 hover:bg-gray-50 dark:border-gray-800 dark:hover:border-gray-700 dark:hover:bg-gray-900"
                                >
                                    <div className="rounded-lg border border-gray-200 bg-gray-50 p-2 dark:border-gray-700 dark:bg-gray-800">
                                        <FileText className="h-4 w-4 text-gray-700 dark:text-gray-200" />
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                            Message Templates
                                        </p>
                                        <p className="text-xs text-gray-500 dark:text-gray-400">Create approved WhatsApp message templates</p>
                                    </div>
                                    <ArrowRight className="h-4 w-4 text-gray-400" />
                                </Link>
                                )}

                                <Link
                                    href={route('app.settings', {})}
                                    className="flex items-center gap-4 rounded-lg border border-gray-200 px-4 py-3 transition hover:border-gray-300 hover:bg-gray-50 dark:border-gray-800 dark:hover:border-gray-700 dark:hover:bg-gray-900"
                                >
                                    <div className="rounded-lg border border-gray-200 bg-gray-50 p-2 dark:border-gray-700 dark:bg-gray-800">
                                        <Users className="h-4 w-4 text-gray-700 dark:text-gray-200" />
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                            Team Settings
                                        </p>
                                        <p className="text-xs text-gray-500 dark:text-gray-400">Invite teammates and manage access</p>
                                    </div>
                                    <ArrowRight className="h-4 w-4 text-gray-400" />
                                </Link>

                                <Link
                                    href={route('app.billing.index', { })}
                                    className="flex items-center gap-4 rounded-lg border border-gray-200 px-4 py-3 transition hover:border-gray-300 hover:bg-gray-50 dark:border-gray-800 dark:hover:border-gray-700 dark:hover:bg-gray-900"
                                >
                                    <div className="rounded-lg border border-gray-200 bg-gray-50 p-2 dark:border-gray-700 dark:bg-gray-800">
                                        <TrendingUp className="h-4 w-4 text-gray-700 dark:text-gray-200" />
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                            Billing & Usage
                                        </p>
                                        <p className="text-xs text-gray-500 dark:text-gray-400">Check plan, invoices, and payment status</p>
                                    </div>
                                    <ArrowRight className="h-4 w-4 text-gray-400" />
                                </Link>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
            </div>

            <Modal show={setupWizardOpen} onClose={() => setSetupWizardOpen(false)} maxWidth="2xl">
                <div className="p-6 space-y-6">
                    <div className="flex items-start justify-between gap-4">
                        <div>
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">First-Run Setup Wizard</h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                Complete your initial account setup without losing dashboard context.
                            </p>
                        </div>
                        <Button variant="secondary" size="sm" onClick={() => setSetupWizardOpen(false)}>Close</Button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {(onboarding_checklist?.items ?? []).map((item) => (
                            <button
                                key={item.key}
                                type="button"
                                onClick={() => setWizardStepKey(item.key)}
                                className={`text-left rounded-xl border p-4 ${
                                    wizardStepKey === item.key ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' : 'border-gray-200 dark:border-gray-800'
                                }`}
                            >
                                <div className="flex items-center gap-2">
                                    <Badge variant={item.done ? 'success' : 'default'} className="text-[10px]">{item.done ? 'Done' : 'Pending'}</Badge>
                                    <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">{item.label}</p>
                                </div>
                                <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">{item.description}</p>
                            </button>
                        ))}
                    </div>

                    {wizardStepKey === 'connection' && (
                        <Card className="border border-emerald-200 dark:border-emerald-800">
                            <CardContent className="p-5 space-y-4">
                                <div>
                                    <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">Connect WhatsApp via Meta Embedded Signup</p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                        Open the connection page in a new tab, complete Meta Embedded Signup, then return here.
                                    </p>
                                </div>
                                <div className="flex flex-wrap gap-3">
                                    <Button onClick={() => launchInNewTab(route('app.whatsapp.connections.create', {}))}>
                                        Open Connection Setup
                                    </Button>
                                    <Button variant="secondary" onClick={() => launchInNewTab(route('app.whatsapp.connections.wizard', {}))}>
                                        Open Guided Wizard
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {wizardStepKey === 'team' && (
                        <Card className="border border-blue-200 dark:border-blue-800">
                            <CardContent className="p-5 space-y-4">
                                <div>
                                    <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">Invite a teammate (Chat Agent)</p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                        Send an invite directly from the dashboard. New invites are chat-agent only.
                                    </p>
                                </div>
                                <div>
                                    <Label htmlFor="quick_invite_email">Email</Label>
                                    <Input
                                        id="quick_invite_email"
                                        type="email"
                                        value={inviteForm.data.email}
                                        onChange={(e) => inviteForm.setData('email', e.target.value)}
                                        placeholder="agent@example.com"
                                        className="mt-1"
                                    />
                                    {(inviteForm.errors as any)?.email && (
                                        <p className="mt-1 text-xs text-red-600">{(inviteForm.errors as any).email}</p>
                                    )}
                                </div>
                                <div className="flex flex-wrap gap-3">
                                    <Button onClick={submitQuickInvite} disabled={inviteForm.processing || !inviteForm.data.email}>
                                        {inviteForm.processing ? 'Sending...' : 'Send Invite'}
                                    </Button>
                                    <Button variant="secondary" onClick={() => launchInNewTab(route('app.team.index', {}))}>
                                        Open Team Page
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {wizardStepKey === 'template' && (
                        <Card className="border border-purple-200 dark:border-purple-800">
                            <CardContent className="p-5 space-y-4">
                                <div>
                                    <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">Create your first WhatsApp template</p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                        Open template builder in a new tab, save your template, then return to continue setup.
                                    </p>
                                </div>
                                <div className="flex flex-wrap gap-3">
                                    <Button onClick={() => launchInNewTab(route('app.whatsapp.templates.create', {}))}>
                                        Open Template Builder
                                    </Button>
                                    <Button variant="secondary" onClick={() => launchInNewTab(route('app.whatsapp.templates.index', {}))}>
                                        View Templates
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {wizardStepKey === 'profile' && (
                        <Card className="border border-amber-200 dark:border-amber-800">
                            <CardContent className="p-5 space-y-4">
                                <div>
                                    <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">Complete your profile</p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                        Profile completion is required for notifications, security, and team operations.
                                    </p>
                                </div>
                                <div className="flex flex-wrap gap-3">
                                    <Link href={route('profile.edit')}>
                                        <Button>Open Profile Settings</Button>
                                    </Link>
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {wizardStepKey === 'test_message' && (
                        <Card className="border border-indigo-200 dark:border-indigo-800">
                            <CardContent className="p-5 space-y-4">
                                <div>
                                    <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">Send a test message</p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                        Open inbox in a new tab and verify inbound/outbound messaging on your connected number.
                                    </p>
                                </div>
                                <div className="flex flex-wrap gap-3">
                                    <Button onClick={() => launchInNewTab(route('app.whatsapp.conversations.index', {}))}>
                                        Open Inbox
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    )}
                </div>
            </Modal>
        </AppShell>
    );
}
