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
    Sparkles,
    Zap,
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

interface CustomerStartConversation {
    widget_id: number;
    widget_slug: string;
    widget_name: string;
    start_link: string | null;
}

export default function Dashboard({ 
    account, 
    stats, 
    onboarding_checklist,
    connection_alerts = [],
    customer_start_conversation = null,
    message_trends, 
    recent_conversations 
}: { 
    account: any;
    stats: Stats;
    onboarding_checklist?: OnboardingChecklist;
    connection_alerts?: ConnectionAlert[];
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
            label: 'Total Messages',
            value: formatNumber(stats.messages.total),
            change: `${stats.messages.today} today`,
            icon: MessageSquare,
            gradient: 'from-blue-500 to-blue-600',
            bgGradient: 'from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20'},
        {
            label: 'Active Connections',
            value: stats.connections.active,
            change: `${stats.connections.total} total`,
            icon: LinkIcon,
            gradient: 'from-green-500 to-emerald-600',
            bgGradient: 'from-green-50 to-emerald-100 dark:from-green-900/20 dark:to-emerald-800/20'},
        {
            label: 'Open Conversations',
            value: stats.conversations.open,
            change: `${stats.conversations.total} total`,
            icon: Inbox,
            gradient: 'from-purple-500 to-purple-600',
            bgGradient: 'from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20'},
        {
            label: 'Team Members',
            value: stats.team.total_members,
            change: `${stats.team.admins} admins`,
            icon: Users,
            gradient: 'from-amber-500 to-orange-600',
            bgGradient: 'from-amber-50 to-orange-100 dark:from-amber-900/20 dark:to-orange-800/20'},
    ];

    return (
        <AppShell>
            <Head title="Dashboard" />
            <div className="space-y-8">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-gray-100 dark:to-gray-300 bg-clip-text text-transparent">
                            Dashboard
                        </h1>
                        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                            Welcome back
                        </p>
                    </div>
                </div>

                {connection_alerts.length > 0 && (
                    <Card className="border-amber-200 dark:border-amber-800 bg-amber-50/70 dark:bg-amber-900/20">
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

                {customer_start_conversation && (
                    <Card className="border-0 shadow-lg">
                        <CardHeader className="bg-gradient-to-r from-emerald-50 to-teal-100 dark:from-emerald-900/20 dark:to-teal-800/20">
                            <CardTitle className="text-base font-semibold">Customer Start Conversation</CardTitle>
                            <CardDescription>
                                Share this link or QR code with customers to start a WhatsApp chat instantly.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="p-4">
                            {customer_start_conversation.start_link ? (
                                <div className="grid gap-4 md:grid-cols-[1fr,220px]">
                                    <div className="space-y-3">
                                        <div className="text-xs text-gray-500 dark:text-gray-400">
                                            Source widget: <span className="font-semibold text-gray-700 dark:text-gray-200">{customer_start_conversation.widget_name}</span>
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

                {/* Key Metrics */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {statCards.map((stat, index) => {
                        const Icon = stat.icon;
                        return (
                            <Card key={index} className="overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-300 group">
                                <CardContent className="p-6">
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1">
                                            <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                                                {stat.label}
                                            </p>
                                            <p className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                                                {stat.value}
                                            </p>
                                            <p className="text-xs font-medium text-blue-600 dark:text-blue-400">
                                                {stat.change}
                                            </p>
                                        </div>
                                        <div className={`p-3 rounded-xl bg-gradient-to-br ${stat.bgGradient} group-hover:scale-110 transition-transform duration-300`}>
                                            <Icon className={`h-6 w-6 bg-gradient-to-br ${stat.gradient} bg-clip-text text-transparent`} style={{ WebkitTextFillColor: 'transparent' }} />
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        );
                    })}
                </div>

                {onboarding_checklist?.show && (
                    <Card className="border-0 shadow-lg overflow-hidden">
                        <CardHeader className="bg-gradient-to-r from-indigo-50 to-blue-100 dark:from-indigo-900/20 dark:to-blue-900/20">
                            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                                <div>
                                    <CardTitle className="text-lg font-semibold flex items-center gap-2">
                                        <Sparkles className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                                        Getting Started Checklist
                                    </CardTitle>
                                    <CardDescription>
                                        Complete the setup steps to get your workspace production-ready.
                                    </CardDescription>
                                </div>
                                <div className="text-sm text-gray-700 dark:text-gray-300">
                                    {onboarding_checklist.completed}/{onboarding_checklist.total} completed
                                </div>
                            </div>
                            <div className="mt-3">
                                <div className="h-2 w-full rounded-full bg-white/60 dark:bg-gray-800/60 overflow-hidden">
                                    <div
                                        className="h-full bg-gradient-to-r from-indigo-500 to-blue-600 transition-all duration-500"
                                        style={{ width: `${onboarding_checklist.progress_percent}%` }}
                                    />
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="p-6 space-y-4">
                                    {onboarding_checklist.next_item && (
                                <div className="rounded-xl border border-indigo-200 dark:border-indigo-800 bg-indigo-50/60 dark:bg-indigo-900/10 p-4 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                                    <div>
                                        <p className="text-xs uppercase tracking-wide text-indigo-600 dark:text-indigo-400 font-semibold">Next Recommended Step</p>
                                        <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">{onboarding_checklist.next_item.label}</p>
                                    </div>
                                    <Button size="sm" onClick={() => openSetupWizard(onboarding_checklist.next_item?.key)}>
                                            {onboarding_checklist.next_item.cta}
                                            <ArrowRight className="h-4 w-4 ml-2" />
                                    </Button>
                                </div>
                            )}

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                {onboarding_checklist.items.map((item) => (
                                    <button
                                        key={item.key}
                                        type="button"
                                        onClick={() => openSetupWizard(item.key)}
                                        className={`rounded-xl border p-4 transition ${
                                            item.done
                                                ? 'border-emerald-200 dark:border-emerald-800 bg-emerald-50/60 dark:bg-emerald-900/10'
                                                : 'border-gray-200 dark:border-gray-800 hover:border-blue-300 dark:hover:border-blue-700'
                                        }`}
                                    >
                                        <div className="flex items-start gap-3">
                                            <div className={`mt-0.5 flex h-6 w-6 items-center justify-center rounded-full ${item.done ? 'bg-emerald-600' : 'bg-gray-300 dark:bg-gray-700'}`}>
                                                <CheckCircle className="h-3.5 w-3.5 text-white" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2 flex-wrap">
                                                    <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">{item.label}</p>
                                                    <Badge variant={item.done ? 'success' : 'default'} className="text-[10px]">
                                                        {item.done ? 'Done' : 'Pending'}
                                                    </Badge>
                                                </div>
                                                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">{item.description}</p>
                                                {!item.done && (
                                                    <p className="mt-2 text-xs font-semibold text-blue-600 dark:text-blue-400">{item.cta} →</p>
                                                )}
                                            </div>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Message Breakdown & Trends */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <Card className="border-0 shadow-lg">
                        <CardHeader className="pb-4">
                            <CardTitle className="text-lg font-semibold">Message Statistics</CardTitle>
                            <CardDescription>Message volume breakdown</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="p-5 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-xl border border-blue-200/50 dark:border-blue-800/50">
                                    <div className="flex items-center gap-2 mb-3">
                                        <div className="p-2 bg-blue-500 rounded-lg">
                                            <Inbox className="h-4 w-4 text-white" />
                                        </div>
                                        <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Inbound</p>
                                    </div>
                                    <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                                        {formatNumber(stats.messages.inbound)}
                                    </p>
                                </div>
                                <div className="p-5 bg-gradient-to-br from-green-50 to-emerald-100 dark:from-green-900/20 dark:to-emerald-800/20 rounded-xl border border-green-200/50 dark:border-green-800/50">
                                    <div className="flex items-center gap-2 mb-3">
                                        <div className="p-2 bg-green-500 rounded-lg">
                                            <Send className="h-4 w-4 text-white" />
                                        </div>
                                        <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Outbound</p>
                                    </div>
                                    <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                                        {formatNumber(stats.messages.outbound)}
                                    </p>
                                </div>
                                <div className="p-5 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 rounded-xl border border-gray-200/50 dark:border-gray-700/50">
                                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">This Week</p>
                                    <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                                        {formatNumber(stats.messages.this_week)}
                                    </p>
                                </div>
                                <div className="p-5 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 rounded-xl border border-gray-200/50 dark:border-gray-700/50">
                                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">This Month</p>
                                    <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                                        {formatNumber(stats.messages.this_month)}
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-0 shadow-lg">
                        <CardHeader className="pb-4">
                            <CardTitle className="text-lg font-semibold">Message Trends</CardTitle>
                            <CardDescription>Last 7 days activity</CardDescription>
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
                                                <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-3 overflow-hidden">
                                                    <div
                                                        className="h-full bg-gradient-to-r from-blue-500 to-blue-600 rounded-full transition-all duration-500"
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
                </div>

                {/* Recent Conversations & Quick Actions */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <Card className="border-0 shadow-lg">
                        <CardHeader className="pb-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <CardTitle className="text-lg font-semibold">Recent Conversations</CardTitle>
                                    <CardDescription>Latest activity</CardDescription>
                                </div>
                                {hasRoute('app.whatsapp.conversations.index') && (
                                <Link
                                    href={route('app.whatsapp.conversations.index', {})}
                                    className="text-sm font-medium text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors"
                                >
                                    View All →
                                </Link>
                                )}
                            </div>
                        </CardHeader>
                        <CardContent>
                            {recent_conversations.length === 0 ? (
                                <div className="flex flex-col items-center justify-center py-12">
                                    <Inbox className="h-12 w-12 text-gray-400 mb-4" />
                                    <p className="text-gray-500 dark:text-gray-400 mb-2">No conversations yet</p>
                                    <p className="text-xs text-gray-400 dark:text-gray-500">Start a conversation to see it here</p>
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
                                            className="block p-4 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-all duration-200 border border-transparent hover:border-gray-200 dark:hover:border-gray-700 group"
                                        >
                                            <div className="flex items-center justify-between">
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <p className="text-sm font-semibold text-gray-900 dark:text-gray-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                                                            {conversation.contact_name}
                                                        </p>
                                                        <Badge variant={conversation.status === 'open' ? 'success' : 'default'} className="text-xs">
                                                            {conversation.status}
                                                        </Badge>
                                                    </div>
                                                    {conversation.last_message && (
                                                        <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                                                            {conversation.last_message}
                                                        </p>
                                                    )}
                                                </div>
                                                <ArrowRight className="h-4 w-4 text-gray-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors ml-4" />
                                            </div>
                                        </Link>
                                        );
                                    })}
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    <Card className="border-0 shadow-lg">
                        <CardHeader className="pb-4">
                            <CardTitle className="text-lg font-semibold">Quick Actions</CardTitle>
                            <CardDescription>Common tasks and shortcuts</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-2">
                                {hasRoute('app.whatsapp.connections.index') && (
                                <Link
                                    href={route('app.whatsapp.connections.index', {})}
                                    className="flex items-center gap-4 p-4 rounded-xl hover:bg-gradient-to-r hover:from-blue-50 hover:to-blue-100 dark:hover:from-blue-900/20 dark:hover:to-blue-800/20 transition-all duration-200 border border-transparent hover:border-blue-200 dark:hover:border-blue-800 group"
                                >
                                    <div className="p-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl group-hover:scale-110 transition-transform duration-200 shadow-lg">
                                        <LinkIcon className="h-5 w-5 text-white" />
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-sm font-semibold text-gray-900 dark:text-gray-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                                            Manage Connections
                                        </p>
                                        <p className="text-xs text-gray-500 dark:text-gray-400">Add or configure WhatsApp connections</p>
                                    </div>
                                    <ArrowRight className="h-4 w-4 text-gray-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors" />
                                </Link>
                                )}
                                
                                {hasRoute('app.whatsapp.templates.index') && (
                                <Link
                                    href={route('app.whatsapp.templates.index', {})}
                                    className="flex items-center gap-4 p-4 rounded-xl hover:bg-gradient-to-r hover:from-green-50 hover:to-emerald-100 dark:hover:from-green-900/20 dark:hover:to-emerald-800/20 transition-all duration-200 border border-transparent hover:border-green-200 dark:hover:border-green-800 group"
                                >
                                    <div className="p-3 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl group-hover:scale-110 transition-transform duration-200 shadow-lg">
                                        <FileText className="h-5 w-5 text-white" />
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-sm font-semibold text-gray-900 dark:text-gray-100 group-hover:text-green-600 dark:group-hover:text-green-400 transition-colors">
                                            Message Templates
                                        </p>
                                        <p className="text-xs text-gray-500 dark:text-gray-400">Create and manage templates</p>
                                    </div>
                                    <ArrowRight className="h-4 w-4 text-gray-400 group-hover:text-green-600 dark:group-hover:text-green-400 transition-colors" />
                                </Link>
                                )}

                                <Link
                                    href={route('app.settings', {})}
                                    className="flex items-center gap-4 p-4 rounded-xl hover:bg-gradient-to-r hover:from-purple-50 hover:to-purple-100 dark:hover:from-purple-900/20 dark:hover:to-purple-800/20 transition-all duration-200 border border-transparent hover:border-purple-200 dark:hover:border-purple-800 group"
                                >
                                    <div className="p-3 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl group-hover:scale-110 transition-transform duration-200 shadow-lg">
                                        <Users className="h-5 w-5 text-white" />
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-sm font-semibold text-gray-900 dark:text-gray-100 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                                            Team Settings
                                        </p>
                                        <p className="text-xs text-gray-500 dark:text-gray-400">Manage team members and roles</p>
                                    </div>
                                    <ArrowRight className="h-4 w-4 text-gray-400 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors" />
                                </Link>

                                <Link
                                    href={route('app.billing.index', { })}
                                    className="flex items-center gap-4 p-4 rounded-xl hover:bg-gradient-to-r hover:from-amber-50 hover:to-orange-100 dark:hover:from-amber-900/20 dark:hover:to-orange-800/20 transition-all duration-200 border border-transparent hover:border-amber-200 dark:hover:border-amber-800 group"
                                >
                                    <div className="p-3 bg-gradient-to-br from-amber-500 to-orange-600 rounded-xl group-hover:scale-110 transition-transform duration-200 shadow-lg">
                                        <TrendingUp className="h-5 w-5 text-white" />
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-sm font-semibold text-gray-900 dark:text-gray-100 group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
                                            Billing & Usage
                                        </p>
                                        <p className="text-xs text-gray-500 dark:text-gray-400">View usage and manage subscription</p>
                                    </div>
                                    <ArrowRight className="h-4 w-4 text-gray-400 group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors" />
                                </Link>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>

            <Modal show={setupWizardOpen} onClose={() => setSetupWizardOpen(false)} maxWidth="2xl">
                <div className="p-6 space-y-6">
                    <div className="flex items-start justify-between gap-4">
                        <div>
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">First-Run Setup Wizard</h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                Complete your initial workspace setup without losing dashboard context.
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
