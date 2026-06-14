import { Head, router, usePage } from '@inertiajs/react';
import { useMemo, useState } from 'react';
import {
    BarChart3,
    Calendar,
    Clock,
    Download,
    FileText,
    MailOpen,
    MessageSquare,
    MousePointerClick,
    Reply,
    Send,
    TrendingUp,
    UserMinus,
} from 'lucide-react';
import PlatformShell from '@/Layouts/PlatformShell';
import { Card, CardContent } from '@/Components/UI/Card';
import { Badge } from '@/Components/UI/Badge';
import Button from '@/Components/UI/Button';
import { cn } from '@/lib/utils';

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

function formatNumber(num: number) {
    return new Intl.NumberFormat('en-IN', {
        maximumFractionDigits: 1,
        notation: num >= 1000 ? 'compact' : 'standard',
    }).format(num);
}

function formatDate(date: string) {
    return new Intl.DateTimeFormat('en-IN', { day: '2-digit', month: 'short' }).format(new Date(date));
}

function percent(part: number, total: number) {
    return total > 0 ? (part / total) * 100 : 0;
}

function StatCard({
    label,
    value,
    suffix = '',
    trend,
    icon: Icon,
    tone,
}: {
    label: string;
    value: string;
    suffix?: string;
    trend: string;
    icon: typeof Send;
    tone: string;
}) {
    return (
        <Card>
            <CardContent className="p-4">
                <div className="mb-2 flex items-center justify-between">
                    <div className={cn('flex h-8 w-8 items-center justify-center rounded-md', tone)}>
                        <Icon className="h-4 w-4" />
                    </div>
                    <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-semibold text-waify-green dark:bg-emerald-400/10 dark:text-emerald-200">
                        {trend}
                    </span>
                </div>
                <div className="text-[11px] text-waify-text-muted dark:text-waify-dark-text-muted">{label}</div>
                <div className="mt-0.5 flex items-baseline gap-0.5">
                    <span className="text-xl font-bold tabular-nums text-waify-text dark:text-waify-dark-text">{value}</span>
                    {suffix && <span className="text-sm font-semibold text-waify-text-muted dark:text-waify-dark-text-muted">{suffix}</span>}
                </div>
            </CardContent>
        </Card>
    );
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
}: {
    date_range: string;
    message_trends: MessageTrend[];
    message_status_distribution: Record<string, number>;
    template_performance: TemplatePerformance[];
    account_growth: TenantGrowth[];
    subscription_distribution: Record<string, number>;
    peak_hours: PeakHour[];
    top_accounts: TopTenant[];
}) {
    const { auth } = usePage().props as any;
    const [selectedRange, setSelectedRange] = useState(date_range);

    const metrics = useMemo(() => {
        const totalMessages = message_trends.reduce((sum, row) => sum + row.total, 0);
        const inbound = message_trends.reduce((sum, row) => sum + row.inbound, 0);
        const outbound = message_trends.reduce((sum, row) => sum + row.outbound, 0);
        const sent = template_performance.reduce((sum, row) => sum + row.send_count, 0);
        const delivered = template_performance.reduce((sum, row) => sum + row.delivered, 0);
        const read = template_performance.reduce((sum, row) => sum + row.read_count, 0);
        const statusTotal = Object.values(message_status_distribution).reduce((sum, count) => sum + count, 0);

        return {
            totalMessages,
            inbound,
            outbound,
            deliveryRate: percent(delivered, sent),
            readRate: percent(read, sent),
            replyShare: percent(inbound, totalMessages),
            optOutRate: percent(message_status_distribution.failed || 0, statusTotal),
        };
    }, [message_trends, message_status_distribution, template_performance]);

    const maxTrend = Math.max(1, ...message_trends.map((trend) => trend.total));
    const maxPeak = Math.max(1, ...peak_hours.map((peak) => peak.count));
    const maxGrowth = Math.max(1, ...account_growth.map((growth) => growth.count));

    const handleRangeChange = (range: string) => {
        setSelectedRange(range);
        router.get(route('platform.analytics'), { range }, { preserveState: true, preserveScroll: true });
    };

    return (
        <PlatformShell auth={auth}>
            <Head title="Analytics" />

            <div className="mx-auto max-w-[1600px] space-y-5">
                <div className="flex flex-wrap items-end justify-between gap-3">
                    <div>
                        <h1 className="text-xl font-bold text-waify-text dark:text-waify-dark-text">Analytics</h1>
                        <p className="mt-1 text-sm text-waify-text-muted dark:text-waify-dark-text-muted">
                            Track delivery, engagement, template performance, and workspace activity.
                        </p>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                        <div className="flex h-9 items-center gap-2 rounded-btn bg-white px-3 text-sm text-waify-text ring-1 ring-inset ring-gray-200 dark:bg-waify-dark-surface dark:text-waify-dark-text dark:ring-waify-dark-border">
                            <Calendar className="h-4 w-4 text-waify-text-muted dark:text-waify-dark-text-muted" />
                            <select
                                value={selectedRange}
                                onChange={(event) => handleRangeChange(event.target.value)}
                                className="border-0 bg-transparent p-0 text-sm focus:ring-0 dark:bg-transparent"
                            >
                                <option value="7">Last 7 days</option>
                                <option value="30">Last 30 days</option>
                                <option value="90">Last 90 days</option>
                                <option value="365">Last year</option>
                            </select>
                        </div>
                        <Button variant="secondary" onClick={() => window.print()}>
                            <Download className="h-4 w-4" />
                            Export
                        </Button>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-3 lg:grid-cols-5">
                    <StatCard
                        label="Delivery rate"
                        value={metrics.deliveryRate.toFixed(1)}
                        suffix="%"
                        trend={`${formatNumber(metrics.outbound)} sent`}
                        icon={Send}
                        tone="bg-emerald-50 text-emerald-600 dark:bg-emerald-400/10 dark:text-emerald-200"
                    />
                    <StatCard
                        label="Read rate"
                        value={metrics.readRate.toFixed(1)}
                        suffix="%"
                        trend={`${formatNumber(metrics.totalMessages)} total`}
                        icon={MailOpen}
                        tone="bg-sky-50 text-sky-600 dark:bg-sky-400/10 dark:text-sky-200"
                    />
                    <StatCard
                        label="Inbound share"
                        value={metrics.replyShare.toFixed(1)}
                        suffix="%"
                        trend={`${formatNumber(metrics.inbound)} inbound`}
                        icon={Reply}
                        tone="bg-pink-50 text-pink-600 dark:bg-pink-400/10 dark:text-pink-200"
                    />
                    <StatCard
                        label="Template reads"
                        value={formatNumber(template_performance.reduce((sum, row) => sum + row.read_count, 0))}
                        trend={`${template_performance.length} templates`}
                        icon={MousePointerClick}
                        tone="bg-violet-50 text-violet-600 dark:bg-violet-400/10 dark:text-violet-200"
                    />
                    <StatCard
                        label="Failure share"
                        value={metrics.optOutRate.toFixed(1)}
                        suffix="%"
                        trend="Status based"
                        icon={UserMinus}
                        tone="bg-amber-50 text-amber-600 dark:bg-amber-400/10 dark:text-amber-200"
                    />
                </div>

                <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
                    <Card className="lg:col-span-2">
                        <CardContent className="p-5">
                            <div className="mb-3 flex items-start justify-between gap-3">
                                <div>
                                    <h3 className="text-base font-semibold text-waify-text dark:text-waify-dark-text">Message Volume</h3>
                                    <p className="text-xs text-waify-text-muted dark:text-waify-dark-text-muted">Inbound and outbound over time</p>
                                </div>
                                <div className="flex items-center gap-3 text-xs">
                                    <span className="inline-flex items-center gap-1 text-waify-text-muted dark:text-waify-dark-text-muted">
                                        <span className="h-2.5 w-2.5 rounded bg-sky-400" />
                                        Inbound
                                    </span>
                                    <span className="inline-flex items-center gap-1 text-waify-text-muted dark:text-waify-dark-text-muted">
                                        <span className="h-2.5 w-2.5 rounded bg-waify-green" />
                                        Outbound
                                    </span>
                                </div>
                            </div>
                            {message_trends.length === 0 ? (
                                <div className="py-12 text-center text-sm text-waify-text-muted dark:text-waify-dark-text-muted">No data available for this period.</div>
                            ) : (
                                <div className="flex h-64 items-end gap-2 overflow-x-auto pb-2">
                                    {message_trends.map((trend) => (
                                        <div key={trend.date} className="flex min-w-10 flex-1 flex-col items-center gap-2">
                                            <div className="flex h-48 w-full items-end justify-center gap-1">
                                                <div
                                                    className="w-3 rounded-t bg-sky-400"
                                                    title={`Inbound: ${trend.inbound}`}
                                                    style={{ height: `${Math.max(3, percent(trend.inbound, maxTrend))}%` }}
                                                />
                                                <div
                                                    className="w-3 rounded-t bg-waify-green"
                                                    title={`Outbound: ${trend.outbound}`}
                                                    style={{ height: `${Math.max(3, percent(trend.outbound, maxTrend))}%` }}
                                                />
                                            </div>
                                            <span className="text-[10px] text-waify-text-muted dark:text-waify-dark-text-muted">{formatDate(trend.date)}</span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="p-5">
                            <h3 className="text-base font-semibold text-waify-text dark:text-waify-dark-text">Top Workspaces</h3>
                            <p className="mb-3 text-xs text-waify-text-muted dark:text-waify-dark-text-muted">By message activity</p>
                            {top_accounts.length === 0 ? (
                                <div className="py-12 text-center text-sm text-waify-text-muted dark:text-waify-dark-text-muted">No workspace activity yet.</div>
                            ) : (
                                <div className="space-y-3">
                                    {top_accounts.slice(0, 6).map((account, index) => (
                                        <div key={account.id} className="flex items-center gap-3">
                                            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-50 text-sm font-bold text-waify-green dark:bg-emerald-400/10 dark:text-emerald-200">
                                                {index + 1}
                                            </div>
                                            <div className="min-w-0 flex-1">
                                                <div className="truncate text-sm font-medium text-waify-text dark:text-waify-dark-text">{account.name}</div>
                                                <div className="text-xs text-waify-text-muted dark:text-waify-dark-text-muted">{account.slug}</div>
                                            </div>
                                            <div className="text-right text-sm font-semibold tabular-nums text-waify-text dark:text-waify-dark-text">
                                                {formatNumber(account.message_count)}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>

                <Card>
                    <CardContent className="p-5">
                        <div className="mb-4 flex items-start justify-between gap-3">
                            <div>
                                <h3 className="text-base font-semibold text-waify-text dark:text-waify-dark-text">Hourly Activity</h3>
                                <p className="text-xs text-waify-text-muted dark:text-waify-dark-text-muted">Message activity by hour of day.</p>
                            </div>
                            <div className="flex items-center gap-2 text-[11px] text-waify-text-muted dark:text-waify-dark-text-muted">
                                <span>Low</span>
                                <div className="flex">
                                    {[0.15, 0.3, 0.5, 0.7, 0.9].map((opacity) => (
                                        <span key={opacity} className="h-4 w-4 ring-1 ring-white dark:ring-waify-dark-bg" style={{ background: `rgba(0, 165, 72, ${opacity})` }} />
                                    ))}
                                </div>
                                <span>High</span>
                            </div>
                        </div>
                        {peak_hours.length === 0 ? (
                            <div className="py-10 text-center text-sm text-waify-text-muted dark:text-waify-dark-text-muted">No hourly data available.</div>
                        ) : (
                            <div className="grid grid-cols-12 gap-1 sm:grid-cols-24">
                                {peak_hours.map((peak) => {
                                    const intensity = 0.12 + percent(peak.count, maxPeak) / 115;
                                    return (
                                        <div key={peak.hour} className="group">
                                            <div
                                                className="aspect-square rounded heat-cell"
                                                title={`${peak.hour}:00 · ${peak.count} messages`}
                                                style={{ background: `rgba(0, 165, 72, ${intensity})` }}
                                            />
                                            <div className="mt-1 text-center text-[9px] text-waify-text-muted dark:text-waify-dark-text-muted">
                                                {peak.hour % 3 === 0 ? `${peak.hour}h` : ''}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                        <div className="mt-4 flex flex-wrap items-center gap-x-6 gap-y-2 border-t border-gray-100 pt-4 text-xs text-waify-text-muted dark:border-waify-dark-border dark:text-waify-dark-text-muted">
                            <span className="flex items-center gap-1.5">
                                <TrendingUp className="h-3 w-3 text-waify-green dark:text-emerald-300" />
                                Peak count: <span className="font-semibold text-waify-text dark:text-waify-dark-text">{formatNumber(maxPeak)}</span>
                            </span>
                            <span className="flex items-center gap-1.5">
                                <Clock className="h-3 w-3" />
                                Range: <span className="font-semibold text-waify-text dark:text-waify-dark-text">{selectedRange} days</span>
                            </span>
                        </div>
                    </CardContent>
                </Card>

                <div className="grid gap-4 lg:grid-cols-2">
                    <Card>
                        <CardContent className="p-5">
                            <h3 className="text-base font-semibold text-waify-text dark:text-waify-dark-text">Message Status</h3>
                            <p className="mb-4 text-xs text-waify-text-muted dark:text-waify-dark-text-muted">Distribution by delivery state.</p>
                            {Object.keys(message_status_distribution).length === 0 ? (
                                <div className="py-10 text-center text-sm text-waify-text-muted dark:text-waify-dark-text-muted">No status data available.</div>
                            ) : (
                                <div className="space-y-3">
                                    {Object.entries(message_status_distribution).map(([status, count]) => {
                                        const total = Object.values(message_status_distribution).reduce((sum, value) => sum + value, 0);
                                        const value = percent(count, total);
                                        return (
                                            <div key={status}>
                                                <div className="mb-1 flex items-center justify-between">
                                                    <span className="text-sm font-medium capitalize text-waify-text dark:text-waify-dark-text">{status}</span>
                                                    <span className="text-sm tabular-nums text-waify-text-muted dark:text-waify-dark-text-muted">
                                                        {formatNumber(count)} ({value.toFixed(1)}%)
                                                    </span>
                                                </div>
                                                <div className="h-2 rounded-full bg-gray-100 dark:bg-waify-dark-surface-2">
                                                    <div className="h-2 rounded-full bg-waify-green" style={{ width: `${value}%` }} />
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="p-5">
                            <h3 className="text-base font-semibold text-waify-text dark:text-waify-dark-text">Workspace Growth</h3>
                            <p className="mb-4 text-xs text-waify-text-muted dark:text-waify-dark-text-muted">New workspace count by date.</p>
                            {account_growth.length === 0 ? (
                                <div className="py-10 text-center text-sm text-waify-text-muted dark:text-waify-dark-text-muted">No growth data available.</div>
                            ) : (
                                <div className="flex h-40 items-end gap-2">
                                    {account_growth.map((row) => (
                                        <div key={row.date} className="flex min-w-6 flex-1 flex-col items-center gap-2">
                                            <div
                                                className="w-full rounded-t bg-sky-400 dark:bg-sky-300"
                                                title={`${formatDate(row.date)} · ${row.count}`}
                                                style={{ height: `${Math.max(4, percent(row.count, maxGrowth))}%` }}
                                            />
                                            <span className="text-[10px] text-waify-text-muted dark:text-waify-dark-text-muted">{formatDate(row.date)}</span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>

                <Card className="overflow-hidden">
                    <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4 dark:border-waify-dark-border">
                        <div>
                            <h3 className="text-base font-semibold text-waify-text dark:text-waify-dark-text">Template Performance</h3>
                            <p className="text-xs text-waify-text-muted dark:text-waify-dark-text-muted">Delivery and read rates from real template counters.</p>
                        </div>
                        <BarChart3 className="h-5 w-5 text-waify-green dark:text-emerald-300" />
                    </div>
                    {template_performance.length === 0 ? (
                        <CardContent className="py-12 text-center text-sm text-waify-text-muted dark:text-waify-dark-text-muted">No template data available.</CardContent>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="bg-gray-50/60 text-left text-[11px] uppercase tracking-wider text-waify-text-muted dark:bg-waify-dark-surface-2/40 dark:text-waify-dark-text-muted">
                                        <th className="px-5 py-3 font-medium">Template</th>
                                        <th className="px-5 py-3 font-medium">Status</th>
                                        <th className="px-5 py-3 font-medium text-right">Sent</th>
                                        <th className="px-5 py-3 font-medium text-right">Delivered</th>
                                        <th className="px-5 py-3 font-medium text-right">Read</th>
                                        <th className="px-5 py-3 font-medium">Delivery</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100 dark:divide-waify-dark-border">
                                    {template_performance.map((template, index) => {
                                        const deliveryRate = percent(template.delivered, template.send_count);
                                        return (
                                            <tr key={`${template.name}-${index}`} className="hover:bg-gray-50/60 dark:hover:bg-waify-dark-surface-2/40">
                                                <td className="px-5 py-3">
                                                    <div className="font-medium text-waify-text dark:text-waify-dark-text">{template.name}</div>
                                                </td>
                                                <td className="px-5 py-3">
                                                    <Badge variant={template.status === 'APPROVED' ? 'success' : 'warning'}>{template.status}</Badge>
                                                </td>
                                                <td className="px-5 py-3 text-right tabular-nums text-waify-text dark:text-waify-dark-text">{formatNumber(template.send_count)}</td>
                                                <td className="px-5 py-3 text-right tabular-nums text-waify-text dark:text-waify-dark-text">{formatNumber(template.delivered)}</td>
                                                <td className="px-5 py-3 text-right tabular-nums text-waify-text dark:text-waify-dark-text">{formatNumber(template.read_count)}</td>
                                                <td className="px-5 py-3">
                                                    <div className="flex items-center gap-2">
                                                        <div className="h-2 w-24 rounded-full bg-gray-100 dark:bg-waify-dark-surface-2">
                                                            <div className="h-2 rounded-full bg-waify-green" style={{ width: `${deliveryRate}%` }} />
                                                        </div>
                                                        <span className="text-xs tabular-nums text-waify-text-muted dark:text-waify-dark-text-muted">{deliveryRate.toFixed(1)}%</span>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    )}
                </Card>

                {Object.keys(subscription_distribution).length > 0 && (
                    <Card>
                        <CardContent className="p-5">
                            <h3 className="text-base font-semibold text-waify-text dark:text-waify-dark-text">Subscription Distribution</h3>
                            <p className="mb-4 text-xs text-waify-text-muted dark:text-waify-dark-text-muted">Current plan spread across workspaces.</p>
                            <div className="space-y-3">
                                {Object.entries(subscription_distribution).map(([plan, count]) => {
                                    const total = Object.values(subscription_distribution).reduce((sum, value) => sum + value, 0);
                                    const value = percent(count, total);
                                    return (
                                        <div key={plan} className="flex items-center gap-4">
                                            <span className="w-32 truncate text-sm text-waify-text dark:text-waify-dark-text">{plan}</span>
                                            <div className="flex-1">
                                                <div className="h-2 rounded-full bg-gray-100 dark:bg-waify-dark-surface-2">
                                                    <div className="h-2 rounded-full bg-waify-green" style={{ width: `${value}%` }} />
                                                </div>
                                            </div>
                                            <span className="w-16 text-right text-sm tabular-nums text-waify-text-muted dark:text-waify-dark-text-muted">{count}</span>
                                        </div>
                                    );
                                })}
                            </div>
                        </CardContent>
                    </Card>
                )}
            </div>
        </PlatformShell>
    );
}
