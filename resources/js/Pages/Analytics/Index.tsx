import { Head, router } from '@inertiajs/react';
import { useState } from 'react';
import AppShell from '@/Layouts/AppShell';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/Components/UI/Card';
import { Badge } from '@/Components/UI/Badge';
import { BarChart3, MessageSquare, TrendingUp, Clock, FileText, Users, Activity } from 'lucide-react';

interface MessageTrend {
    date: string;
    total: number;
    inbound: number;
    outbound: number;
}

interface TemplatePerformance {
    template_id: number;
    template_name: string;
    total_sends: number;
    delivered: number;
    read: number;
    failed: number;
    delivery_rate: number;
    read_rate: number;
}

interface PeakHour {
    hour: number;
    count: number;
}

interface DailyActivity {
    date: string;
    count: number;
}

const toNumber = (value: number | string | null | undefined) => {
    const numeric = Number(value);
    return Number.isFinite(numeric) ? numeric : 0;
};

const clampRate = (value: number | string | null | undefined) => {
    const numeric = toNumber(value);
    return Math.max(0, Math.min(100, numeric));
};

export default function AnalyticsIndex({
    account,
    date_range,
    message_trends,
    message_status_distribution,
    template_performance,
    conversation_stats,
    peak_hours,
    daily_activity,
    usage}: {
    account: any;
    date_range: string;
    message_trends: MessageTrend[];
    message_status_distribution: Record<string, number>;
    template_performance: TemplatePerformance[];
    conversation_stats: { total: number; open: number; closed: number };
    peak_hours: PeakHour[];
    daily_activity: DailyActivity[];
    usage: {
        messages_sent: number;
        template_sends: number;
        messages_limit: number;
        template_sends_limit: number;
    };
}) {
    const [selectedRange, setSelectedRange] = useState(date_range);

    const handleRangeChange = (range: string) => {
        setSelectedRange(range);
        router.get(route('app.analytics.index', { }), { range }, {
            preserveState: true,
            preserveScroll: true});
    };

    const formatNumber = (value: number | string | null | undefined) => {
        const num = toNumber(value);
        if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
        if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
        return num.toLocaleString('en-IN');
    };

    const messageTotals = message_trends.reduce(
        (totals, trend) => ({
            total: totals.total + toNumber(trend.total),
            inbound: totals.inbound + toNumber(trend.inbound),
            outbound: totals.outbound + toNumber(trend.outbound),
        }),
        { total: 0, inbound: 0, outbound: 0 }
    );
    const averageDailyMessages = Math.round(messageTotals.total / Math.max(message_trends.length, 1));

    const getUsagePercentage = (current: number, limit: number) => {
        if (limit === -1) return 0; // Unlimited
        if (limit === 0) return 100;
        return Math.min((current / limit) * 100, 100);
    };

    return (
        <AppShell>
            <Head title="Analytics" />
            <div className="module-page">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-waify-green-dark">Insights</p>
                        <h1 className="module-heading">Analytics</h1>
                        <p className="module-subheading">Track conversations, templates, usage, and messaging performance.</p>
                    </div>
                    <div className="flex items-center gap-2">
                        <select
                            value={selectedRange}
                            onChange={(e) => handleRangeChange(e.target.value)}
                            className="rounded-btn border border-gray-200 bg-white px-3 py-2 text-sm shadow-sm focus:border-waify-green focus:outline-none focus:ring-2 focus:ring-waify-green/20 dark:border-gray-600 dark:bg-gray-800"
                        >
                            <option value="7">Last 7 days</option>
                            <option value="30">Last 30 days</option>
                            <option value="90">Last 90 days</option>
                            <option value="365">Last year</option>
                        </select>
                    </div>
                </div>

                {/* Usage Overview */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <MessageSquare className="h-5 w-5" />
                                Messages Usage
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-2">
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-600 dark:text-gray-400">Sent</span>
                                    <span className="font-semibold">
                                        {formatNumber(usage.messages_sent)} / {usage.messages_limit === -1 ? '∞' : formatNumber(usage.messages_limit)}
                                    </span>
                                </div>
                                {usage.messages_limit !== -1 && (
                                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                                        <div
                                            className="h-2 rounded-full bg-waify-green transition-all"
                                            style={{ width: `${getUsagePercentage(usage.messages_sent, usage.messages_limit)}%` }}
                                        />
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <FileText className="h-5 w-5" />
                                Template Sends
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-2">
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-600 dark:text-gray-400">Sent</span>
                                    <span className="font-semibold">
                                        {formatNumber(usage.template_sends)} / {usage.template_sends_limit === -1 ? '∞' : formatNumber(usage.template_sends_limit)}
                                    </span>
                                </div>
                                {usage.template_sends_limit !== -1 && (
                                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                                        <div
                                            className="bg-green-600 h-2 rounded-full transition-all"
                                            style={{ width: `${getUsagePercentage(usage.template_sends, usage.template_sends_limit)}%` }}
                                        />
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Stats Overview */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <Card>
                        <CardContent className="pt-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">Total Conversations</p>
                                    <p className="text-2xl font-bold">{conversation_stats.total}</p>
                                </div>
                                <Users className="h-8 w-8 text-waify-green-dark" />
                            </div>
                            <div className="mt-4 flex gap-2 text-xs">
                                <Badge variant="success">{conversation_stats.open} Open</Badge>
                                <Badge variant="default">{conversation_stats.closed} Closed</Badge>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="pt-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">Total Messages</p>
                                    <p className="text-2xl font-bold">
                                        {formatNumber(messageTotals.total)}
                                    </p>
                                </div>
                                <MessageSquare className="h-8 w-8 text-green-500" />
                            </div>
                            <div className="mt-4 grid grid-cols-2 gap-2 text-xs">
                                <div className="rounded-lg bg-blue-50 px-2.5 py-2 text-blue-700 ring-1 ring-blue-100 dark:bg-blue-500/10 dark:text-blue-200 dark:ring-blue-500/20">
                                    <span className="block text-[10px] font-medium uppercase tracking-wide opacity-75">Inbound</span>
                                    <span className="mt-0.5 block font-semibold tabular-nums">{formatNumber(messageTotals.inbound)}</span>
                                </div>
                                <div className="rounded-lg bg-slate-100 px-2.5 py-2 text-slate-700 ring-1 ring-slate-200 dark:bg-slate-800 dark:text-slate-200 dark:ring-slate-700">
                                    <span className="block text-[10px] font-medium uppercase tracking-wide opacity-75">Outbound</span>
                                    <span className="mt-0.5 block font-semibold tabular-nums">{formatNumber(messageTotals.outbound)}</span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="pt-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">Avg Daily Messages</p>
                                    <p className="text-2xl font-bold">
                                        {formatNumber(averageDailyMessages)}
                                    </p>
                                </div>
                                <TrendingUp className="h-8 w-8 text-purple-500" />
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="pt-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">Template Activity</p>
                                    <p className="text-2xl font-bold">{template_performance.length > 0 ? template_performance.length : 'No sends'}</p>
                                </div>
                                <FileText className="h-8 w-8 text-orange-500" />
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Message Trends Chart */}
                <Card>
                    <CardHeader>
                        <CardTitle>Message Trends</CardTitle>
                        <CardDescription>Inbound vs Outbound messages over time</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="h-64 flex items-end justify-between gap-1">
                            {message_trends.length > 0 ? (
                                message_trends.map((trend, index) => {
                                    const inbound = toNumber(trend.inbound);
                                    const outbound = toNumber(trend.outbound);
                                    const maxValue = Math.max(...message_trends.map(t => Math.max(toNumber(t.inbound), toNumber(t.outbound), 1)));
                                    return (
                                        <div key={index} className="flex-1 flex flex-col items-center gap-1">
                                            <div className="w-full flex flex-col-reverse gap-0.5 h-48">
                                                <div
                                                    className="rounded-t bg-waify-green-dark"
                                                    style={{ height: `${(outbound / maxValue) * 100}%` }}
                                                    title={`Outbound: ${outbound}`}
                                                />
                                                <div
                                                    className="bg-green-500 rounded-t"
                                                    style={{ height: `${(inbound / maxValue) * 100}%` }}
                                                    title={`Inbound: ${inbound}`}
                                                />
                                            </div>
                                            <span className="text-xs text-gray-500 dark:text-gray-400">
                                                {new Date(trend.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                            </span>
                                        </div>
                                    );
                                })
                            ) : (
                                <div className="w-full text-center text-gray-500 dark:text-gray-400 py-16">
                                    No message data available for this period
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* Template Performance */}
                {template_performance.length > 0 && (
                    <Card>
                        <CardHeader>
                            <CardTitle>Top Performing Templates</CardTitle>
                            <CardDescription>Template send performance metrics</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {template_performance.map((template) => (
                                    <div key={template.template_id} className="flex items-center justify-between p-4 border rounded-lg">
                                        <div className="flex-1">
                                            <p className="font-semibold">{template.template_name}</p>
                                            <div className="flex gap-4 mt-2 text-sm text-gray-600 dark:text-gray-400">
                                                <span>Sent: {template.total_sends}</span>
                                                <span>Delivered: {template.delivered}</span>
                                                <span>Read: {template.read}</span>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <Badge variant="success">{clampRate(template.delivery_rate).toFixed(1)}% Delivery</Badge>
                                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                                {clampRate(template.read_rate).toFixed(1)}% Read Rate
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                )}
                {template_performance.length === 0 && (
                    <Card>
                        <CardHeader>
                            <CardTitle>Template Performance</CardTitle>
                            <CardDescription>Delivery and read rates will appear after approved templates are sent.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="rounded-lg border border-dashed border-gray-200 px-4 py-10 text-center text-sm text-gray-500 dark:border-gray-700 dark:text-gray-400">
                                No template sends in this period. Try a wider date range or send a campaign with an approved template.
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Peak Hours */}
                {peak_hours.length > 0 && (
                    <Card>
                        <CardHeader>
                            <CardTitle>Peak Activity Hours</CardTitle>
                            <CardDescription>Most active hours of the day</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="h-48 flex items-end justify-between gap-1">
                                {Array.from({ length: 24 }, (_, hour) => {
                                    const hourData = peak_hours.find(h => h.hour === hour);
                                    const maxCount = Math.max(...peak_hours.map(h => h.count), 1);
                                    return (
                                        <div key={hour} className="flex-1 flex flex-col items-center gap-1">
                                            <div
                                                className="w-full rounded-t bg-waify-green"
                                                style={{ height: `${((hourData?.count || 0) / maxCount) * 100}%` }}
                                                title={`${hour}:00 - ${hourData?.count || 0} messages`}
                                            />
                                            <span className="text-xs text-gray-500 dark:text-gray-400">
                                                {hour % 12 || 12}{hour >= 12 ? 'p' : 'a'}
                                            </span>
                                        </div>
                                    );
                                })}
                            </div>
                        </CardContent>
                    </Card>
                )}
            </div>
        </AppShell>
    );
}
