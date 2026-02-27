import { Head, router } from '@inertiajs/react';
import PlatformShell from '@/Layouts/PlatformShell';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/Components/UI/Card';
import { Badge } from '@/Components/UI/Badge';
import { Input } from '@/Components/UI/Input';
import { Label } from '@/Components/UI/Label';
import { 
    BarChart3, 
    TrendingUp, 
    MessageSquare, 
    FileText,
    Clock,
    Building2,
    Sparkles
} from 'lucide-react';
import { usePage } from '@inertiajs/react';
import { useState } from 'react';

interface MessageTrend {
    date: string;
    total: number;
    inbound: number;
    outbound: number;
}

interface TemplatePerformance {
    name: string;
    status: string;
    send_count: number;
    delivered: number;
    read_count: number;
}

interface TenantGrowth {
    date: string;
    count: number;
}

interface PeakHour {
    hour: number;
    count: number;
}

interface TopTenant {
    id: number;
    name: string;
    slug: string;
    message_count: number;
}

export default function Analytics({
    date_range,
    message_trends,
    message_status_distribution,
    template_performance,
    account_growth,
    subscription_distribution,
    peak_hours,
    top_accounts,
    ai_credits_platform = 0,
    ai_credits_period = '',
    embedded_onboarding_funnel = {
        started: 0,
        authorized: 0,
        payload_received: 0,
        connection_created: 0,
        errors: 0,
        cancelled: 0,
    } }: {
    date_range: string;
    message_trends: MessageTrend[];
    message_status_distribution: Record<string, number>;
    template_performance: TemplatePerformance[];
    account_growth: TenantGrowth[];
    subscription_distribution: Record<string, number>;
    peak_hours: PeakHour[];
    top_accounts: TopTenant[];
    ai_credits_platform?: number;
    ai_credits_period?: string;
    embedded_onboarding_funnel?: {
        started: number;
        authorized: number;
        payload_received: number;
        connection_created: number;
        errors: number;
        cancelled: number;
    };
}) {
    const { auth } = usePage().props as any;
    const [selectedRange, setSelectedRange] = useState(date_range);

    const handleRangeChange = (range: string) => {
        setSelectedRange(range);
        router.get(route('platform.analytics'), { range }, {
            preserveState: true,
            preserveScroll: true});
    };

    const formatNumber = (num: number) => {
        if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
        if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
        return num.toString();
    };

    const getMaxValue = (data: any[]) => {
        if (data.length === 0) return 100;
        return Math.max(...data.map(d => d.count || d.total || 0));
    };

    return (
        <PlatformShell auth={auth}>
            <Head title="Analytics" />
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Analytics & Reports</h1>
                        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                            Comprehensive analytics and insights for your platform
                        </p>
                    </div>
                    <div className="flex items-center gap-2">
                        <Label htmlFor="date-range" className="text-sm">Date Range:</Label>
                        <select
                            id="date-range"
                            value={selectedRange}
                            onChange={(e) => handleRangeChange(e.target.value)}
                            className="rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100"
                        >
                            <option value="7">Last 7 days</option>
                            <option value="30">Last 30 days</option>
                            <option value="90">Last 90 days</option>
                            <option value="365">Last year</option>
                        </select>
                    </div>
                </div>

                {/* AI credits (billing period) */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Sparkles className="h-5 w-5 text-amber-500" />
                            AI credits (platform)
                        </CardTitle>
                        <CardDescription>
                            Total AI credits used across all accounts this billing period {ai_credits_period ? `(${ai_credits_period})` : ''}
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                            {formatNumber(ai_credits_platform)}
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Embedded Signup Funnel</CardTitle>
                        <CardDescription>Where onboarding users drop during WhatsApp Embedded Signup.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
                            {[
                                { label: 'Started', value: embedded_onboarding_funnel.started, color: 'text-sky-600' },
                                { label: 'Authorized', value: embedded_onboarding_funnel.authorized, color: 'text-blue-600' },
                                { label: 'Payload', value: embedded_onboarding_funnel.payload_received, color: 'text-indigo-600' },
                                { label: 'Connected', value: embedded_onboarding_funnel.connection_created, color: 'text-green-600' },
                                { label: 'Errors', value: embedded_onboarding_funnel.errors, color: 'text-red-600' },
                                { label: 'Cancelled', value: embedded_onboarding_funnel.cancelled, color: 'text-amber-600' },
                            ].map((item) => (
                                <div key={item.label} className="rounded-lg border border-gray-200 dark:border-gray-700 p-3">
                                    <div className="text-xs text-gray-500 dark:text-gray-400">{item.label}</div>
                                    <div className={`text-xl font-semibold ${item.color}`}>{formatNumber(item.value)}</div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                {/* Message Trends Chart */}
                <Card>
                    <CardHeader>
                        <CardTitle>Message Trends</CardTitle>
                        <CardDescription>Message volume over time (inbound vs outbound)</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {message_trends.length === 0 ? (
                            <p className="text-gray-500 dark:text-gray-400 text-center py-8">No data available for selected period</p>
                        ) : (
                            <div className="space-y-4">
                                <div className="flex items-center gap-4 mb-4">
                                    <div className="flex items-center gap-2">
                                        <div className="w-3 h-3 bg-blue-500 rounded"></div>
                                        <span className="text-sm text-gray-600 dark:text-gray-400">Inbound</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <div className="w-3 h-3 bg-green-500 rounded"></div>
                                        <span className="text-sm text-gray-600 dark:text-gray-400">Outbound</span>
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    {message_trends.map((trend) => {
                                        const maxValue = getMaxValue(message_trends);
                                        const inboundPercent = (trend.inbound / maxValue) * 100;
                                        const outboundPercent = (trend.outbound / maxValue) * 100;
                                        
                                        return (
                                            <div key={trend.date} className="flex items-center gap-4">
                                                <div className="w-24 text-xs text-gray-600 dark:text-gray-400">
                                                    {new Date(trend.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                                </div>
                                                <div className="flex-1 flex items-end gap-1 h-8">
                                                    <div
                                                        className="bg-blue-500 rounded-t"
                                                        style={{ height: `${inboundPercent}%`, width: '48%' }}
                                                        title={`Inbound: ${trend.inbound}`}
                                                    />
                                                    <div
                                                        className="bg-green-500 rounded-t"
                                                        style={{ height: `${outboundPercent}%`, width: '48%' }}
                                                        title={`Outbound: ${trend.outbound}`}
                                                    />
                                                </div>
                                                <div className="w-20 text-right text-xs font-medium text-gray-900 dark:text-gray-100">
                                                    {formatNumber(trend.total)}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Message Status Distribution */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Message Status Distribution</CardTitle>
                            <CardDescription>Breakdown by delivery status</CardDescription>
                        </CardHeader>
                        <CardContent>
                            {Object.keys(message_status_distribution).length === 0 ? (
                                <p className="text-gray-500 dark:text-gray-400 text-center py-8">No data available</p>
                            ) : (
                                <div className="space-y-3">
                                    {Object.entries(message_status_distribution).map(([status, count]) => {
                                        const total = Object.values(message_status_distribution).reduce((a, b) => a + b, 0);
                                        const percentage = total > 0 ? (count / total) * 100 : 0;
                                        
                                        return (
                                            <div key={status}>
                                                <div className="flex items-center justify-between mb-1">
                                                    <span className="text-sm font-medium text-gray-900 dark:text-gray-100 capitalize">
                                                        {status}
                                                    </span>
                                                    <span className="text-sm text-gray-600 dark:text-gray-400">
                                                        {formatNumber(count)} ({percentage.toFixed(1)}%)
                                                    </span>
                                                </div>
                                                <div className="w-full bg-gray-200 rounded-full h-2 dark:bg-gray-700">
                                                    <div
                                                        className="bg-blue-600 h-2 rounded-full"
                                                        style={{ width: `${percentage}%` }}
                                                    />
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Peak Hours */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Peak Hours</CardTitle>
                            <CardDescription>Message activity by hour of day</CardDescription>
                        </CardHeader>
                        <CardContent>
                            {peak_hours.length === 0 ? (
                                <p className="text-gray-500 dark:text-gray-400 text-center py-8">No data available</p>
                            ) : (
                                <div className="space-y-2">
                                    {peak_hours.map((peak) => {
                                        const maxCount = getMaxValue(peak_hours);
                                        const percentage = (peak.count / maxCount) * 100;
                                        
                                        return (
                                            <div key={peak.hour} className="flex items-center gap-3">
                                                <div className="w-12 text-sm text-gray-600 dark:text-gray-400">
                                                    {peak.hour.toString().padStart(2, '0')}:00
                                                </div>
                                                <div className="flex-1 bg-gray-200 rounded-full h-4 dark:bg-gray-700">
                                                    <div
                                                        className="bg-green-600 h-4 rounded-full"
                                                        style={{ width: `${percentage}%` }}
                                                    />
                                                </div>
                                                <div className="w-16 text-right text-sm font-medium text-gray-900 dark:text-gray-100">
                                                    {formatNumber(peak.count)}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>

                {/* Template Performance */}
                <Card>
                    <CardHeader>
                        <CardTitle>Template Performance</CardTitle>
                        <CardDescription>Top performing message templates</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {template_performance.length === 0 ? (
                            <p className="text-gray-500 dark:text-gray-400 text-center py-8">No template data available</p>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-800">
                                    <thead className="bg-gray-50 dark:bg-gray-900">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Template</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Status</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Sent</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Delivered</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Read</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Delivery Rate</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                                        {template_performance.map((template, index) => {
                                            const deliveryRate = template.send_count > 0 
                                                ? (template.delivered / template.send_count) * 100 
                                                : 0;
                                            const readRate = template.send_count > 0 
                                                ? (template.read_count / template.send_count) * 100 
                                                : 0;
                                            
                                            return (
                                                <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-100">
                                                        {template.name}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <Badge variant={template.status === 'APPROVED' ? 'success' : 'warning'}>
                                                            {template.status}
                                                        </Badge>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                                                        {formatNumber(template.send_count)}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                                                        {formatNumber(template.delivered)}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                                                        {formatNumber(template.read_count)}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <div className="flex items-center gap-2">
                                                            <div className="w-24 bg-gray-200 rounded-full h-2 dark:bg-gray-700">
                                                                <div
                                                                    className="bg-green-600 h-2 rounded-full"
                                                                    style={{ width: `${deliveryRate}%` }}
                                                                />
                                                            </div>
                                                            <span className="text-xs text-gray-600 dark:text-gray-400">
                                                                {deliveryRate.toFixed(1)}%
                                                            </span>
                                                        </div>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Top Tenants */}
                <Card>
                    <CardHeader>
                        <CardTitle>Top Tenants by Activity</CardTitle>
                        <CardDescription>Most active tenants in the selected period</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {top_accounts.length === 0 ? (
                            <p className="text-gray-500 dark:text-gray-400 text-center py-8">No tenant data available</p>
                        ) : (
                            <div className="space-y-3">
                                {top_accounts.map((account, index) => (
                                    <div
                                        key={account.id}
                                        className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg"
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
                                            <MessageSquare className="h-4 w-4 text-gray-400" />
                                            <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                                                {formatNumber(account.message_count)} messages
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </PlatformShell>
    );
}
