import { Head, Link } from '@inertiajs/react';
import AppShell from '@/Layouts/AppShell';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/Components/UI/Card';
import { Badge } from '@/Components/UI/Badge';
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
    Zap
} from 'lucide-react';
import { usePage } from '@inertiajs/react';

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

export default function Dashboard({ 
    account, 
    stats, 
    message_trends, 
    recent_conversations 
}: { 
    account: any;
    stats: Stats;
    message_trends: MessageTrend[];
    recent_conversations: RecentConversation[];
}) {
    const { navigation } = usePage().props as any;
    
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
        </AppShell>
    );
}
