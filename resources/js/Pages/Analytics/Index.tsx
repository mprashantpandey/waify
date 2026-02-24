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
        ai_credits_used?: number;
        ai_credits_limit?: number;
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

    const formatNumber = (num: number) => {
        if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
        if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
        return num.toString();
    };

    const getUsagePercentage = (current: number, limit: number) => {
        if (limit === -1) return 0; // Unlimited
        if (limit === 0) return 100;
        return Math.min((current / limit) * 100, 100);
    };

    return (
        <AppShell>
            <Head title="Analytics" />
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-gray-100 dark:to-gray-300 bg-clip-text text-transparent">
                            Analytics
                        </h1>
                        <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                            Insights into your WhatsApp messaging activity
                        </p>
                    </div>
                    <div className="flex items-center gap-2">
                        <select
                            value={selectedRange}
                            onChange={(e) => handleRangeChange(e.target.value)}
                            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                                            className="bg-blue-600 h-2 rounded-full transition-all"
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

                    {(usage.ai_credits_used !== undefined || usage.ai_credits_limit !== undefined) && (
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <BarChart3 className="h-5 w-5 text-amber-500" />
                                    AI credits (this month)
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-2">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-600 dark:text-gray-400">Used</span>
                                        <span className="font-semibold">
                                            {formatNumber(usage.ai_credits_used ?? 0)} / {usage.ai_credits_limit === -1 || usage.ai_credits_limit === undefined ? '∞' : formatNumber(usage.ai_credits_limit)}
                                        </span>
                                    </div>
                                    {(usage.ai_credits_limit ?? 0) > 0 && (
                                        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                                            <div
                                                className="bg-amber-500 h-2 rounded-full transition-all"
                                                style={{ width: `${getUsagePercentage(usage.ai_credits_used ?? 0, usage.ai_credits_limit ?? 0)}%` }}
                                            />
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    )}
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
                                <Users className="h-8 w-8 text-blue-500" />
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
                                        {formatNumber(message_trends.reduce((sum, t) => sum + t.total, 0))}
                                    </p>
                                </div>
                                <MessageSquare className="h-8 w-8 text-green-500" />
                            </div>
                            <div className="mt-4 flex gap-2 text-xs">
                                <Badge variant="info">
                                    {formatNumber(message_trends.reduce((sum, t) => sum + t.inbound, 0))} Inbound
                                </Badge>
                                <Badge variant="default">
                                    {formatNumber(message_trends.reduce((sum, t) => sum + t.outbound, 0))} Outbound
                                </Badge>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="pt-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">Avg Daily Messages</p>
                                    <p className="text-2xl font-bold">
                                        {formatNumber(Math.round(message_trends.reduce((sum, t) => sum + t.total, 0) / Math.max(message_trends.length, 1)))}
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
                                    <p className="text-sm text-gray-600 dark:text-gray-400">Top Templates</p>
                                    <p className="text-2xl font-bold">{template_performance.length}</p>
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
                                    const maxValue = Math.max(...message_trends.map(t => Math.max(t.inbound, t.outbound, 1)));
                                    return (
                                        <div key={index} className="flex-1 flex flex-col items-center gap-1">
                                            <div className="w-full flex flex-col-reverse gap-0.5 h-48">
                                                <div
                                                    className="bg-blue-500 rounded-t"
                                                    style={{ height: `${(trend.outbound / maxValue) * 100}%` }}
                                                    title={`Outbound: ${trend.outbound}`}
                                                />
                                                <div
                                                    className="bg-green-500 rounded-t"
                                                    style={{ height: `${(trend.inbound / maxValue) * 100}%` }}
                                                    title={`Inbound: ${trend.inbound}`}
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
                                            <Badge variant="success">{template.delivery_rate.toFixed(1)}% Delivery</Badge>
                                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                                {template.read_rate.toFixed(1)}% Read Rate
                                            </p>
                                        </div>
                                    </div>
                                ))}
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
                                                className="w-full bg-gradient-to-t from-blue-500 to-blue-400 rounded-t"
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

