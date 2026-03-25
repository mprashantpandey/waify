import { Head, Link, useForm, usePage } from '@inertiajs/react';
import AppShell from '@/Layouts/AppShell';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/Components/UI/Card';
import { Badge } from '@/Components/UI/Badge';
import Button from '@/Components/UI/Button';
import Modal from '@/Components/Modal';
import {
    MessageSquare,
    Inbox,
    Link as LinkIcon,
    FileText,
    Users,
    TrendingUp,
    Activity,
    ArrowRight,
    CheckCircle,
    Copy,
    QrCode,
    AlertCircle,
    Clock,
    Sparkles,
} from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
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
    recent_conversations,
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

    const hasRoute = (routeName: string) => {
        return navigation?.some((nav: any) => nav.href === routeName) ?? false;
    };

    const formatNumber = (num: number) => {
        if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
        if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
        return num.toString();
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

        QRCode.toDataURL(link, { width: 200, margin: 1 })
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
            hint: `${stats.messages.today} today`,
            icon: MessageSquare,
        },
        {
            label: 'Connected numbers',
            value: stats.connections.active,
            hint: `${stats.connections.total} saved`,
            icon: LinkIcon,
        },
        {
            label: 'Open chats',
            value: stats.conversations.open,
            hint: `${stats.conversations.total} total`,
            icon: Inbox,
        },
        {
            label: 'Team members',
            value: stats.team.total_members,
            hint: `${stats.team.admins} admins`,
            icon: Users,
        },
    ];

    const quickActions = [
        hasRoute('app.whatsapp.connections.index')
            ? {
                  href: route('app.whatsapp.connections.index', {}),
                  label: 'Connections',
                  description: 'Connect, review, or fix your WhatsApp numbers.',
                  icon: LinkIcon,
              }
            : null,
        hasRoute('app.whatsapp.templates.index')
            ? {
                  href: route('app.whatsapp.templates.index', {}),
                  label: 'Templates',
                  description: 'Create and manage approved WhatsApp templates.',
                  icon: FileText,
              }
            : null,
        hasRoute('app.whatsapp.conversations.index')
            ? {
                  href: route('app.whatsapp.conversations.index', {}),
                  label: 'Inbox',
                  description: 'Reply faster and manage active customer chats.',
                  icon: Inbox,
              }
            : null,
        {
            href: route('app.settings', {}),
            label: 'Team settings',
            description: 'Invite teammates and control access.',
            icon: Users,
        },
        {
            href: route('app.billing.index', {}),
            label: 'Billing & usage',
            description: 'Check plan, payments, and current usage.',
            icon: TrendingUp,
        },
    ].filter(Boolean) as Array<{
        href: string;
        label: string;
        description: string;
        icon: any;
    }>;

    const accountSummary = useMemo(() => {
        const needsReview = (connection_health_summary?.warning ?? 0) + (connection_health_summary?.restricted ?? 0);
        if ((connection_alerts?.length ?? 0) > 0 || needsReview > 0) {
            return {
                tone: 'amber' as const,
                title: 'Needs attention',
                description: 'One or more numbers still need setup or review before everything is ready.',
            };
        }

        if ((connection_health_summary?.healthy ?? 0) > 0) {
            return {
                tone: 'emerald' as const,
                title: 'Ready to use',
                description: 'Your account is connected and ready for sales and support activity.',
            };
        }

        return {
            tone: 'slate' as const,
            title: 'Setup in progress',
            description: 'Finish the remaining steps to start handling conversations in one place.',
        };
    }, [connection_alerts, connection_health_summary]);

    const maxTrendValue = Math.max(...message_trends.map((item) => item.count || 0), 1);

    return (
        <AppShell>
            <Head title="Dashboard" />
            <div className="space-y-6">
                <section className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
                    <div className="flex flex-col gap-6 xl:flex-row xl:items-start xl:justify-between">
                        <div className="max-w-3xl">
                            <div className="flex flex-wrap items-center gap-3">
                                <Badge variant="default" className="rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em]">
                                    {accountSummary.title}
                                </Badge>
                                {stats.connections.active > 0 && (
                                    <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
                                        {stats.connections.active} active number{stats.connections.active === 1 ? '' : 's'}
                                    </span>
                                )}
                            </div>
                            <h1 className="mt-4 text-3xl font-semibold tracking-tight text-gray-950 dark:text-white sm:text-4xl">
                                Turn WhatsApp activity into replies, follow-ups, and customers.
                            </h1>
                            <p className="mt-3 text-base leading-7 text-gray-600 dark:text-gray-400">
                                See what needs attention, continue setup, and jump back into the pages you use every day.
                            </p>
                            <div className="mt-5 flex flex-wrap gap-3">
                                {hasRoute('app.whatsapp.conversations.index') && (
                                    <Link href={route('app.whatsapp.conversations.index', {})}>
                                        <Button className="rounded-xl px-5">Open Inbox</Button>
                                    </Link>
                                )}
                                {hasRoute('app.whatsapp.connections.index') && (
                                    <Link href={route('app.whatsapp.connections.index', {})}>
                                        <Button variant="secondary" className="rounded-xl px-5">Review setup</Button>
                                    </Link>
                                )}
                                {onboarding_checklist?.next_item && (
                                    <Button variant="secondary" className="rounded-xl px-5" onClick={() => openSetupWizard(onboarding_checklist.next_item?.key)}>
                                        {onboarding_checklist.next_item.cta}
                                    </Button>
                                )}
                            </div>
                        </div>

                        <div className="grid gap-3 sm:grid-cols-3 xl:w-[360px] xl:grid-cols-1">
                            <div className="rounded-2xl border border-gray-200 bg-gray-50 px-4 py-4 dark:border-gray-800 dark:bg-gray-950">
                                <div className="text-xs font-semibold uppercase tracking-[0.18em] text-gray-500 dark:text-gray-400">Today</div>
                                <div className="mt-2 text-2xl font-semibold text-gray-950 dark:text-white">{formatNumber(stats.messages.today)}</div>
                                <div className="mt-1 text-sm text-gray-500 dark:text-gray-400">messages handled</div>
                            </div>
                            <div className="rounded-2xl border border-gray-200 bg-gray-50 px-4 py-4 dark:border-gray-800 dark:bg-gray-950">
                                <div className="text-xs font-semibold uppercase tracking-[0.18em] text-gray-500 dark:text-gray-400">Open chats</div>
                                <div className="mt-2 text-2xl font-semibold text-gray-950 dark:text-white">{formatNumber(stats.conversations.open)}</div>
                                <div className="mt-1 text-sm text-gray-500 dark:text-gray-400">need a reply</div>
                            </div>
                            <div className="rounded-2xl border border-gray-200 bg-gray-50 px-4 py-4 dark:border-gray-800 dark:bg-gray-950">
                                <div className="text-xs font-semibold uppercase tracking-[0.18em] text-gray-500 dark:text-gray-400">This month</div>
                                <div className="mt-2 text-2xl font-semibold text-gray-950 dark:text-white">{formatNumber(stats.messages.this_month)}</div>
                                <div className="mt-1 text-sm text-gray-500 dark:text-gray-400">messages sent and received</div>
                            </div>
                        </div>
                    </div>
                </section>

                {connection_alerts.length > 0 && (
                    <section className="rounded-2xl border border-amber-200 bg-amber-50 p-4 shadow-sm dark:border-amber-900/60 dark:bg-amber-950/20">
                        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                            <div className="flex items-start gap-3">
                                <div className="rounded-xl bg-amber-100 p-2 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300">
                                    <AlertCircle className="h-5 w-5" />
                                </div>
                                <div>
                                    <p className="text-sm font-semibold text-amber-900 dark:text-amber-200">Connection review needed</p>
                                    <p className="mt-1 text-sm text-amber-800/80 dark:text-amber-300/80">
                                        {connection_alerts[0].name} still needs setup or review. Fix this first so messages keep flowing normally.
                                    </p>
                                </div>
                            </div>
                            {hasRoute('app.whatsapp.connections.index') && (
                                <Link href={route('app.whatsapp.connections.index', {})}>
                                    <Button variant="secondary" size="sm" className="rounded-xl">Review connections</Button>
                                </Link>
                            )}
                        </div>
                    </section>
                )}

                <div className="grid grid-cols-1 gap-4 xl:grid-cols-[minmax(0,1.5fr)_380px]">
                    <div className="space-y-4">
                        <section className="grid grid-cols-2 gap-4 xl:grid-cols-4">
                            {statCards.map((stat) => {
                                const Icon = stat.icon;
                                return (
                                    <Card key={stat.label} className="overflow-hidden border border-gray-200 shadow-sm dark:border-gray-800">
                                        <CardContent className="p-5">
                                            <div className="flex items-start justify-between gap-3">
                                                <div>
                                                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{stat.label}</p>
                                                    <p className="mt-2 text-3xl font-semibold tracking-tight text-gray-950 dark:text-white">{stat.value}</p>
                                                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{stat.hint}</p>
                                                </div>
                                                <div className="rounded-2xl bg-gray-50 p-3 text-gray-700 dark:bg-gray-800 dark:text-gray-200">
                                                    <Icon className="h-5 w-5" />
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                );
                            })}
                        </section>

                        <section className="grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)]">
                            <Card className="border border-gray-200 shadow-sm dark:border-gray-800">
                                <CardHeader className="pb-4">
                                    <div className="flex items-start justify-between gap-4">
                                        <div>
                                            <CardTitle className="text-lg">Setup and readiness</CardTitle>
                                            <CardDescription>
                                                Finish the next steps and keep your WhatsApp account ready for sending and support.
                                            </CardDescription>
                                        </div>
                                        {onboarding_checklist?.show && (
                                            <Badge variant="default" className="rounded-full px-3 py-1">
                                                {onboarding_checklist.completed}/{onboarding_checklist.total}
                                            </Badge>
                                        )}
                                    </div>
                                </CardHeader>
                                <CardContent className="space-y-5">
                                    {onboarding_checklist?.show ? (
                                        <>
                                            <div>
                                                <div className="flex items-center justify-between text-sm">
                                                    <span className="font-medium text-gray-700 dark:text-gray-200">Setup progress</span>
                                                    <span className="text-gray-500 dark:text-gray-400">{onboarding_checklist.progress_percent}% complete</span>
                                                </div>
                                                <div className="mt-2 h-2 overflow-hidden rounded-full bg-gray-100 dark:bg-gray-800">
                                                    <div className="h-full rounded-full bg-blue-600 transition-all" style={{ width: `${onboarding_checklist.progress_percent}%` }} />
                                                </div>
                                            </div>
                                            <div className="space-y-2">
                                                {onboarding_checklist.items.slice(0, 4).map((item) => (
                                                    <button
                                                        key={item.key}
                                                        type="button"
                                                        onClick={() => openSetupWizard(item.key)}
                                                        className="flex w-full items-start gap-3 rounded-2xl border border-gray-200 p-4 text-left transition hover:border-gray-300 hover:bg-gray-50 dark:border-gray-800 dark:hover:border-gray-700 dark:hover:bg-gray-900"
                                                    >
                                                        <div className={`mt-0.5 rounded-full p-1 ${item.done ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-300' : 'bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-300'}`}>
                                                            <CheckCircle className="h-4 w-4" />
                                                        </div>
                                                        <div className="min-w-0 flex-1">
                                                            <div className="flex items-center justify-between gap-3">
                                                                <p className="text-sm font-medium text-gray-950 dark:text-white">{item.label}</p>
                                                                <span className="text-xs font-medium text-gray-500 dark:text-gray-400">{item.done ? 'Done' : 'Next'}</span>
                                                            </div>
                                                            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{item.description}</p>
                                                        </div>
                                                    </button>
                                                ))}
                                            </div>
                                        </>
                                    ) : (
                                        <div className="rounded-2xl border border-gray-200 bg-gray-50 p-4 text-sm text-gray-600 dark:border-gray-800 dark:bg-gray-950 dark:text-gray-400">
                                            Your account is already set up. Use the inbox, templates, and campaigns from the shortcuts below.
                                        </div>
                                    )}

                                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                                        <div className="rounded-2xl border border-gray-200 p-4 dark:border-gray-800">
                                            <div className="text-xs font-semibold uppercase tracking-[0.16em] text-gray-500 dark:text-gray-400">Healthy numbers</div>
                                            <div className="mt-2 text-2xl font-semibold text-gray-950 dark:text-white">{connection_health_summary?.healthy ?? 0}</div>
                                        </div>
                                        <div className="rounded-2xl border border-gray-200 p-4 dark:border-gray-800">
                                            <div className="text-xs font-semibold uppercase tracking-[0.16em] text-gray-500 dark:text-gray-400">Need review</div>
                                            <div className="mt-2 text-2xl font-semibold text-gray-950 dark:text-white">{(connection_health_summary?.warning ?? 0) + (connection_health_summary?.restricted ?? 0)}</div>
                                        </div>
                                        <div className="rounded-2xl border border-gray-200 p-4 dark:border-gray-800">
                                            <div className="text-xs font-semibold uppercase tracking-[0.16em] text-gray-500 dark:text-gray-400">Last updated</div>
                                            <div className="mt-2 text-sm font-medium text-gray-950 dark:text-white">
                                                {connection_health_summary?.last_synced_at
                                                    ? new Date(connection_health_summary.last_synced_at).toLocaleString()
                                                    : 'Not available'}
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card className="border border-gray-200 shadow-sm dark:border-gray-800">
                                <CardHeader className="pb-4">
                                    <CardTitle className="text-lg">Recent conversations</CardTitle>
                                    <CardDescription>Jump back into the latest customer chats.</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    {recent_conversations.length === 0 ? (
                                        <div className="rounded-2xl border border-dashed border-gray-300 p-5 text-sm text-gray-600 dark:border-gray-700 dark:text-gray-400">
                                            No conversations yet. Once customers start messaging you, chats will appear here.
                                        </div>
                                    ) : (
                                        <div className="space-y-2">
                                            {recent_conversations.slice(0, 5).map((conversation) => {
                                                const convId = Number(conversation.id);
                                                const conversationRoute = hasRoute('app.whatsapp.conversations.index') && Number.isInteger(convId) && convId >= 1
                                                    ? route('app.whatsapp.conversations.show', { conversation: convId })
                                                    : '#';

                                                return (
                                                    <Link
                                                        key={conversation.id}
                                                        href={conversationRoute}
                                                        className="flex items-center justify-between gap-4 rounded-2xl border border-gray-200 px-4 py-3 transition hover:border-gray-300 hover:bg-gray-50 dark:border-gray-800 dark:hover:border-gray-700 dark:hover:bg-gray-900"
                                                    >
                                                        <div className="min-w-0 flex-1">
                                                            <div className="flex items-center gap-2">
                                                                <p className="truncate text-sm font-medium text-gray-950 dark:text-white">
                                                                    {conversation.contact_name}
                                                                </p>
                                                                <Badge variant={conversation.status === 'open' ? 'success' : 'default'} className="text-[10px]">
                                                                    {conversation.status}
                                                                </Badge>
                                                            </div>
                                                            <p className="mt-1 truncate text-sm text-gray-500 dark:text-gray-400">
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
                                                <Button variant="secondary" size="sm" className="rounded-xl">Open inbox</Button>
                                            </Link>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </section>

                        <section className="grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
                            <Card className="border border-gray-200 shadow-sm dark:border-gray-800">
                                <CardHeader className="pb-4">
                                    <CardTitle className="text-lg">Message activity</CardTitle>
                                    <CardDescription>Quick view of your message volume.</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-3">
                                    <div className="grid grid-cols-2 gap-3">
                                        <div className="rounded-2xl border border-gray-200 p-4 dark:border-gray-800">
                                            <div className="text-sm text-gray-500 dark:text-gray-400">Inbound</div>
                                            <div className="mt-2 text-2xl font-semibold text-gray-950 dark:text-white">{formatNumber(stats.messages.inbound)}</div>
                                        </div>
                                        <div className="rounded-2xl border border-gray-200 p-4 dark:border-gray-800">
                                            <div className="text-sm text-gray-500 dark:text-gray-400">Outbound</div>
                                            <div className="mt-2 text-2xl font-semibold text-gray-950 dark:text-white">{formatNumber(stats.messages.outbound)}</div>
                                        </div>
                                        <div className="rounded-2xl border border-gray-200 p-4 dark:border-gray-800">
                                            <div className="text-sm text-gray-500 dark:text-gray-400">This week</div>
                                            <div className="mt-2 text-2xl font-semibold text-gray-950 dark:text-white">{formatNumber(stats.messages.this_week)}</div>
                                        </div>
                                        <div className="rounded-2xl border border-gray-200 p-4 dark:border-gray-800">
                                            <div className="text-sm text-gray-500 dark:text-gray-400">This month</div>
                                            <div className="mt-2 text-2xl font-semibold text-gray-950 dark:text-white">{formatNumber(stats.messages.this_month)}</div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card className="border border-gray-200 shadow-sm dark:border-gray-800">
                                <CardHeader className="pb-4">
                                    <CardTitle className="text-lg">Quick actions</CardTitle>
                                    <CardDescription>Go straight to the pages you use most.</CardDescription>
                                </CardHeader>
                                <CardContent className="grid gap-3 md:grid-cols-2">
                                    {quickActions.map((action) => {
                                        const Icon = action.icon;
                                        return (
                                            <Link
                                                key={action.label}
                                                href={action.href}
                                                className="flex items-start gap-3 rounded-2xl border border-gray-200 p-4 transition hover:border-gray-300 hover:bg-gray-50 dark:border-gray-800 dark:hover:border-gray-700 dark:hover:bg-gray-900"
                                            >
                                                <div className="rounded-2xl bg-gray-50 p-3 text-gray-700 dark:bg-gray-800 dark:text-gray-200">
                                                    <Icon className="h-5 w-5" />
                                                </div>
                                                <div className="min-w-0 flex-1">
                                                    <p className="text-sm font-semibold text-gray-950 dark:text-white">{action.label}</p>
                                                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{action.description}</p>
                                                </div>
                                                <ArrowRight className="mt-1 h-4 w-4 shrink-0 text-gray-400" />
                                            </Link>
                                        );
                                    })}
                                </CardContent>
                            </Card>
                        </section>
                    </div>

                    <div className="space-y-4">
                        {customer_start_conversation && (
                            <Card className="border border-gray-200 shadow-sm dark:border-gray-800">
                                <CardHeader className="pb-4">
                                    <CardTitle className="text-lg">Customer start link</CardTitle>
                                    <CardDescription>
                                        Share one link or QR code so customers can message you directly.
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    {customer_start_conversation.start_link ? (
                                        <>
                                            <div className="rounded-2xl border border-gray-200 bg-gray-50 p-4 dark:border-gray-800 dark:bg-gray-950">
                                                <div className="flex items-center justify-between gap-3">
                                                    <div>
                                                        <p className="text-sm font-medium text-gray-950 dark:text-white">{customer_start_conversation.widget_name}</p>
                                                        <p className="mt-1 text-xs uppercase tracking-[0.16em] text-gray-500 dark:text-gray-400">
                                                            {customer_start_conversation.widget_type}
                                                        </p>
                                                    </div>
                                                    <Badge variant="default" className="rounded-full px-3 py-1">Ready</Badge>
                                                </div>
                                                <div className="mt-4 rounded-xl border border-gray-200 bg-white p-3 text-xs break-all text-gray-700 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300">
                                                    {customer_start_conversation.start_link}
                                                </div>
                                                <div className="mt-3 flex flex-wrap gap-2">
                                                    <Button
                                                        variant="secondary"
                                                        size="sm"
                                                        className="rounded-xl"
                                                        onClick={() => navigator.clipboard.writeText(customer_start_conversation.start_link || '')}
                                                    >
                                                        <Copy className="mr-2 h-4 w-4" />
                                                        Copy link
                                                    </Button>
                                                    <Link href={route('app.widgets.edit', { widget: customer_start_conversation.widget_slug })}>
                                                        <Button variant="secondary" size="sm" className="rounded-xl">Manage widget</Button>
                                                    </Link>
                                                </div>
                                            </div>

                                            <div className="rounded-2xl border border-gray-200 bg-gray-50 p-4 dark:border-gray-800 dark:bg-gray-950">
                                                <div className="mb-3 flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                                                    <QrCode className="h-4 w-4" />
                                                    Scan to chat
                                                </div>
                                                {dashboardWidgetQr ? (
                                                    <div className="flex justify-center">
                                                        <img
                                                            src={dashboardWidgetQr}
                                                            alt="Customer start conversation QR"
                                                            className="h-52 w-52 rounded-2xl border border-gray-200 bg-white p-3 dark:border-gray-700"
                                                        />
                                                    </div>
                                                ) : (
                                                    <div className="flex h-52 items-center justify-center rounded-2xl border border-dashed border-gray-300 text-sm text-gray-500 dark:border-gray-700">
                                                        QR unavailable
                                                    </div>
                                                )}
                                            </div>
                                        </>
                                    ) : (
                                        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800 dark:border-amber-900/60 dark:bg-amber-950/20 dark:text-amber-300">
                                            Configure a valid WhatsApp phone in your widget to generate a start link.
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        )}

                        <Card className="border border-gray-200 shadow-sm dark:border-gray-800">
                            <CardHeader className="pb-4">
                                <CardTitle className="text-lg">7-day message trend</CardTitle>
                                <CardDescription>How activity has moved over the last week.</CardDescription>
                            </CardHeader>
                            <CardContent>
                                {message_trends.length === 0 ? (
                                    <div className="flex flex-col items-center justify-center py-12">
                                        <Activity className="mb-4 h-10 w-10 text-gray-400" />
                                        <p className="text-sm text-gray-500 dark:text-gray-400">No message trend yet</p>
                                    </div>
                                ) : (
                                    <div className="space-y-3">
                                        {message_trends.map((trend) => {
                                            const percentage = (trend.count / maxTrendValue) * 100;

                                            return (
                                                <div key={trend.date} className="flex items-center gap-4">
                                                    <div className="w-20 text-xs font-medium text-gray-500 dark:text-gray-400">
                                                        {new Date(trend.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                                    </div>
                                                    <div className="h-2 flex-1 overflow-hidden rounded-full bg-gray-100 dark:bg-gray-800">
                                                        <div className="h-full rounded-full bg-gray-900 transition-all dark:bg-gray-100" style={{ width: `${percentage}%` }} />
                                                    </div>
                                                    <div className="w-12 text-right text-sm font-semibold text-gray-950 dark:text-white">
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
                                <CardTitle className="text-lg">At a glance</CardTitle>
                                <CardDescription>Simple summary of what needs your next click.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <div className="rounded-2xl border border-gray-200 p-4 dark:border-gray-800">
                                    <div className="flex items-center gap-3">
                                        <div className="rounded-xl bg-gray-100 p-2 text-gray-700 dark:bg-gray-800 dark:text-gray-200">
                                            <Clock className="h-4 w-4" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-gray-950 dark:text-white">Next best action</p>
                                            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                                                {onboarding_checklist?.next_item?.label ?? 'Open your inbox and continue customer replies.'}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                                <div className="rounded-2xl border border-gray-200 p-4 dark:border-gray-800">
                                    <div className="flex items-center gap-3">
                                        <div className="rounded-xl bg-gray-100 p-2 text-gray-700 dark:bg-gray-800 dark:text-gray-200">
                                            <Sparkles className="h-4 w-4" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-gray-950 dark:text-white">Approved templates</p>
                                            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                                                {stats.templates.approved} ready to send out of {stats.templates.total} total templates.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>

            <Modal show={setupWizardOpen} onClose={() => setSetupWizardOpen(false)} maxWidth="2xl">
                <div className="space-y-6 p-6">
                    <div className="flex items-start justify-between gap-4">
                        <div>
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Setup guide</h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                Complete your initial setup without leaving the dashboard.
                            </p>
                        </div>
                        <Button variant="secondary" size="sm" onClick={() => setSetupWizardOpen(false)}>Close</Button>
                    </div>

                    <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                        {(onboarding_checklist?.items ?? []).map((item) => (
                            <button
                                key={item.key}
                                type="button"
                                onClick={() => setWizardStepKey(item.key)}
                                className={`rounded-2xl border p-4 text-left ${
                                    wizardStepKey === item.key ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/20' : 'border-gray-200 dark:border-gray-800'
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
                            <CardContent className="space-y-4 p-5">
                                <div>
                                    <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">Connect WhatsApp via Meta Embedded Signup</p>
                                    <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                                        Open the connection page in a new tab, complete Meta Embedded Signup, then return here.
                                    </p>
                                </div>
                                <div className="flex flex-wrap gap-3">
                                    <Button onClick={() => launchInNewTab(route('app.whatsapp.connections.create', {}))}>Open connection setup</Button>
                                    <Button variant="secondary" onClick={() => launchInNewTab(route('app.whatsapp.connections.wizard', {}))}>Open guided wizard</Button>
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {wizardStepKey === 'team' && (
                        <Card className="border border-blue-200 dark:border-blue-800">
                            <CardContent className="space-y-4 p-5">
                                <div>
                                    <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">Invite a teammate</p>
                                    <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                                        Send an invite directly from the dashboard.
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
                                        {inviteForm.processing ? 'Sending...' : 'Send invite'}
                                    </Button>
                                    <Button variant="secondary" onClick={() => launchInNewTab(route('app.team.index', {}))}>Open team page</Button>
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {wizardStepKey === 'template' && (
                        <Card className="border border-purple-200 dark:border-purple-800">
                            <CardContent className="space-y-4 p-5">
                                <div>
                                    <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">Create your first template</p>
                                    <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                                        Open the template builder in a new tab, save your template, then return here.
                                    </p>
                                </div>
                                <div className="flex flex-wrap gap-3">
                                    <Button onClick={() => launchInNewTab(route('app.whatsapp.templates.create', {}))}>Open template builder</Button>
                                    <Button variant="secondary" onClick={() => launchInNewTab(route('app.whatsapp.templates.index', {}))}>View templates</Button>
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {wizardStepKey === 'profile' && (
                        <Card className="border border-amber-200 dark:border-amber-800">
                            <CardContent className="space-y-4 p-5">
                                <div>
                                    <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">Complete your profile</p>
                                    <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                                        Keep your profile complete for notifications, security, and team operations.
                                    </p>
                                </div>
                                <div className="flex flex-wrap gap-3">
                                    <Link href={route('profile.edit')}>
                                        <Button>Open profile settings</Button>
                                    </Link>
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {wizardStepKey === 'test_message' && (
                        <Card className="border border-indigo-200 dark:border-indigo-800">
                            <CardContent className="space-y-4 p-5">
                                <div>
                                    <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">Send a test message</p>
                                    <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                                        Open the inbox in a new tab and confirm inbound and outbound messaging on your connected number.
                                    </p>
                                </div>
                                <div className="flex flex-wrap gap-3">
                                    <Button onClick={() => launchInNewTab(route('app.whatsapp.conversations.index', {}))}>Open inbox</Button>
                                </div>
                            </CardContent>
                        </Card>
                    )}
                </div>
            </Modal>
        </AppShell>
    );
}
