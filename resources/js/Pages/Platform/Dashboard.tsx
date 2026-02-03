import PlatformShell from '@/Layouts/PlatformShell';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/Components/UI/Card';
import { Badge } from '@/Components/UI/Badge';
import MisconfiguredSettingsAlert from '@/Components/Platform/MisconfiguredSettingsAlert';
import { 
    Building2, 
    Users, 
    Shield, 
    TrendingUp, 
    MessageSquare, 
    Send, 
    Inbox,
    Link as LinkIcon,
    FileText,
    CreditCard,
    AlertCircle,
    CheckCircle,
    Clock,
    XCircle,
    BarChart3
} from 'lucide-react';
import { Link, usePage } from '@inertiajs/react';

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

export default function PlatformDashboard({
    stats,
    recent_accounts,
    message_trends,
    top_accounts,
    misconfigured_settings}: {
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
    
    const getStatusBadge = (status: string) => {
        const statusMap: Record<string, { variant: 'success' | 'warning' | 'danger' | 'default'; label: string }> = {
            active: { variant: 'success', label: 'Active' },
            suspended: { variant: 'warning', label: 'Suspended' },
            disabled: { variant: 'danger', label: 'Disabled' }};

        const config = statusMap[status] || { variant: 'default' as const, label: status };
        return <Badge variant={config.variant}>{config.label}</Badge>;
    };

    const formatNumber = (num: number) => {
        if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
        if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
        return num.toString();
    };

    return (
        <PlatformShell auth={auth}>
            <div className="space-y-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Platform Dashboard</h1>
                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                        Comprehensive overview of your WhatsApp Cloud Platform
                    </p>
                </div>

                {/* Misconfiguration Alerts */}
                {misconfigured_settings && misconfigured_settings.length > 0 && (
                    <MisconfiguredSettingsAlert 
                        misconfiguredSettings={misconfigured_settings}
                        variant="dashboard"
                    />
                )}

                {/* Core Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <Card>
                        <CardContent className="pt-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Tenants</p>
                                    <p className="text-3xl font-bold text-gray-900 dark:text-gray-100 mt-2">
                                        {formatNumber(stats.total_accounts)}
                                    </p>
                                    <p className="text-xs text-green-600 dark:text-green-400 mt-1">
                                        {stats.active_accounts} active
                                    </p>
                                </div>
                                <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg">
                                    <Building2 className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="pt-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Messages</p>
                                    <p className="text-3xl font-bold text-gray-900 dark:text-gray-100 mt-2">
                                        {formatNumber(stats.total_messages)}
                                    </p>
                                    <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                                        {stats.messages_today} today
                                    </p>
                                </div>
                                <div className="bg-green-50 dark:bg-green-900/20 p-3 rounded-lg">
                                    <MessageSquare className="h-8 w-8 text-green-600 dark:text-green-400" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="pt-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Active Connections</p>
                                    <p className="text-3xl font-bold text-gray-900 dark:text-gray-100 mt-2">
                                        {stats.active_connections}
                                    </p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                        {stats.total_connections} total
                                    </p>
                                </div>
                                <div className="bg-purple-50 dark:bg-purple-900/20 p-3 rounded-lg">
                                    <LinkIcon className="h-8 w-8 text-purple-600 dark:text-purple-400" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="pt-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Active Subscriptions</p>
                                    <p className="text-3xl font-bold text-gray-900 dark:text-gray-100 mt-2">
                                        {stats.active_subscriptions}
                                    </p>
                                    <p className="text-xs text-green-600 dark:text-green-400 mt-1">
                                        {stats.trialing_subscriptions} trialing
                                    </p>
                                </div>
                                <div className="bg-yellow-50 dark:bg-yellow-900/20 p-3 rounded-lg">
                                    <CreditCard className="h-8 w-8 text-yellow-600 dark:text-yellow-400" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Message Statistics */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Message Statistics</CardTitle>
                            <CardDescription>Message volume and direction breakdown</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                                    <div className="flex items-center gap-2 mb-2">
                                        <Inbox className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                                        <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Inbound</p>
                                    </div>
                                    <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                                        {formatNumber(stats.inbound_messages)}
                                    </p>
                                </div>
                                <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                                    <div className="flex items-center gap-2 mb-2">
                                        <Send className="h-5 w-5 text-green-600 dark:text-green-400" />
                                        <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Outbound</p>
                                    </div>
                                    <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                                        {formatNumber(stats.outbound_messages)}
                                    </p>
                                </div>
                                <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">This Week</p>
                                    <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                                        {formatNumber(stats.messages_this_week)}
                                    </p>
                                </div>
                                <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">This Month</p>
                                    <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                                        {formatNumber(stats.messages_this_month)}
                                    </p>
                                </div>
                            </div>
                            
                            {/* Message Status Breakdown */}
                            {Object.keys(stats.message_statuses).length > 0 && (
                                <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-800">
                                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Status Breakdown</p>
                                    <div className="space-y-2">
                                        {Object.entries(stats.message_statuses).map(([status, count]) => (
                                            <div key={status} className="flex items-center justify-between">
                                                <span className="text-sm text-gray-600 dark:text-gray-400 capitalize">{status}</span>
                                                <span className="text-sm font-medium text-gray-900 dark:text-gray-100">{formatNumber(count)}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Template Statistics</CardTitle>
                            <CardDescription>Template approval and status overview</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                                    <div className="flex items-center gap-2 mb-2">
                                        <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
                                        <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Approved</p>
                                    </div>
                                    <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                                        {formatNumber(stats.approved_templates)}
                                    </p>
                                </div>
                                <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                                    <div className="flex items-center gap-2 mb-2">
                                        <Clock className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
                                        <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Pending</p>
                                    </div>
                                    <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                                        {formatNumber(stats.pending_templates)}
                                    </p>
                                </div>
                                <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
                                    <div className="flex items-center gap-2 mb-2">
                                        <XCircle className="h-5 w-5 text-red-600 dark:text-red-400" />
                                        <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Rejected</p>
                                    </div>
                                    <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                                        {formatNumber(stats.rejected_templates)}
                                    </p>
                                </div>
                                <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">Total</p>
                                    <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                                        {formatNumber(stats.total_templates)}
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Connection Health & Alerts */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Connection Health</CardTitle>
                            <CardDescription>WhatsApp connection status monitoring</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                <div className="flex items-center justify-between p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                                    <div className="flex items-center gap-3">
                                        <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-400" />
                                        <div>
                                            <p className="font-medium text-gray-900 dark:text-gray-100">Active Connections</p>
                                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                                {stats.active_connections} of {stats.total_connections} connections
                                            </p>
                                        </div>
                                    </div>
                                    <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                                        {stats.total_connections > 0 
                                            ? Math.round((stats.active_connections / stats.total_connections) * 100) 
                                            : 0}%
                                    </p>
                                </div>
                                
                                {stats.connections_with_errors > 0 && (
                                    <div className="flex items-center justify-between p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
                                        <div className="flex items-center gap-3">
                                            <AlertCircle className="h-6 w-6 text-red-600 dark:text-red-400" />
                                            <div>
                                                <p className="font-medium text-gray-900 dark:text-gray-100">Connections with Errors</p>
                                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                                    Requires attention
                                                </p>
                                            </div>
                                        </div>
                                        <p className="text-2xl font-bold text-red-600 dark:text-red-400">
                                            {stats.connections_with_errors}
                                        </p>
                                    </div>
                                )}

                                {stats.past_due_subscriptions > 0 && (
                                    <div className="flex items-center justify-between p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                                        <div className="flex items-center gap-3">
                                            <AlertCircle className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
                                            <div>
                                                <p className="font-medium text-gray-900 dark:text-gray-100">Past Due Subscriptions</p>
                                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                                    Payment required
                                                </p>
                                            </div>
                                        </div>
                                        <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
                                            {stats.past_due_subscriptions}
                                        </p>
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Top Tenants by Volume</CardTitle>
                            <CardDescription>Most active tenants (last 30 days)</CardDescription>
                        </CardHeader>
                        <CardContent>
                            {top_accounts.length === 0 ? (
                                <p className="text-gray-500 dark:text-gray-400 text-center py-8">No message data available</p>
                            ) : (
                                <div className="space-y-3">
                                    {top_accounts.map((account, index) => (
                                        <Link
                                            key={account.id}
                                            href={route('platform.accounts.show', { account: account.id })}
                                            className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 font-bold text-sm">
                                                    {index + 1}
                                                </div>
                                                <div>
                                                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                                        {account.name}
                                                    </p>
                                                    <p className="text-xs text-gray-500 dark:text-gray-400">
                                                        {account.slug}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <BarChart3 className="h-4 w-4 text-gray-400" />
                                                <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                                                    {formatNumber(account.message_count)}
                                                </span>
                                            </div>
                                        </Link>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>

                {/* Recent Tenants */}
                <Card>
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <div>
                                <CardTitle>Recent Tenants</CardTitle>
                                <CardDescription>Newly created tenants</CardDescription>
                            </div>
                            <Link
                                href={route('platform.accounts.index')}
                                className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
                            >
                                View All
                            </Link>
                        </div>
                    </CardHeader>
                    <CardContent>
                        {recent_accounts.length === 0 ? (
                            <p className="text-gray-500 dark:text-gray-400 text-center py-8">No tenants yet</p>
                        ) : (
                            <div className="divide-y divide-gray-200 dark:divide-gray-800">
                                {recent_accounts.map((account) => (
                                    <Link
                                        key={account.id}
                                        href={route('platform.accounts.show', { account: account.id })}
                                        className="block p-4 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                                    >
                                        <div className="flex items-center justify-between">
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                                        {account.name}
                                                    </p>
                                                    {getStatusBadge(account.status)}
                                                </div>
                                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                                    Owner: {account.owner.name} ({account.owner.email})
                                                </p>
                                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                                    Created: {new Date(account.created_at).toLocaleString()}
                                                </p>
                                            </div>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </PlatformShell>
    );
}
