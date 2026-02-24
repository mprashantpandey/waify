import { Link } from '@inertiajs/react';
import AppShell from '@/Layouts/AppShell';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/Components/UI/Card';
import { MessageSquare, FileText, Zap, TrendingUp, ArrowLeft, AlertTriangle, Clock } from 'lucide-react';
import { Head } from '@inertiajs/react';
import { Badge } from '@/Components/UI/Badge';
import { Alert } from '@/Components/UI/Alert';

interface Usage {
    messages_sent: number;
    template_sends: number;
    ai_credits_used: number;
    meta_conversations_free_used?: number;
    meta_conversations_paid?: number;
    meta_conversations_marketing?: number;
    meta_conversations_utility?: number;
    meta_conversations_authentication?: number;
    meta_conversations_service?: number;
    meta_estimated_cost_minor?: number;
    storage_bytes: number;
}

interface Limits {
    messages_monthly?: number;
    template_sends_monthly?: number;
    ai_credits_monthly?: number;
}

interface UsageHistory {
    period: string;
    messages_sent: number;
    template_sends: number;
    ai_credits_used: number;
    meta_conversations_free_used?: number;
    meta_conversations_paid?: number;
    meta_estimated_cost_minor?: number;
}

interface MetaBillingSummary {
    free_tier_limit: number;
    free_tier_used: number;
    free_tier_remaining: number;
    estimated_cost_minor: number;
    currency: string;
    pricing_source?: string;
    pricing_country_code?: string | null;
    pricing_version?: {
        id: number;
        country_code?: string | null;
        currency: string;
        effective_from?: string | null;
        effective_to?: string | null;
        notes?: string | null;
    } | null;
    category_breakdown?: Array<{
        category: string;
        free_count: number;
        paid_count: number;
        rate_minor: number;
        estimated_cost_minor: number;
    }>;
    note: string;
}

interface BlockedEvent {
    id: number;
    data: {
        limit_key: string;
        current_usage: number;
        limit: number;
        intended_increment: number;
    };
    created_at: string;
}

export default function BillingUsage({
    account,
    current_usage,
    meta_billing,
    limits,
    usage_history,
    blocked_events}: {
    account: any;
    current_usage: Usage;
    meta_billing?: MetaBillingSummary;
    limits: Limits;
    usage_history: UsageHistory[];
    blocked_events: BlockedEvent[];
}) {
    const moneyFormatter = new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: meta_billing?.currency || 'INR',
        minimumFractionDigits: 2,
    });
    const metaCategoryBreakdown = meta_billing?.category_breakdown ?? [];

    return (
        <AppShell>
            <Head title="Usage Details" />
            <div className="space-y-8">
                <div>
                    <Link
                        href={route('app.billing.index', { })}
                        className="inline-flex items-center gap-2 text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors mb-4"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        Back to Billing
                    </Link>
                    <div>
                        <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-gray-100 dark:to-gray-300 bg-clip-text text-transparent">
                            Usage Details
                        </h1>
                        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                            View your usage history and limits
                        </p>
                    </div>
                </div>

                {/* Current Period Usage */}
                <Card className="border-0 shadow-lg">
                    <CardHeader className="bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-blue-500 rounded-xl">
                                <TrendingUp className="h-5 w-5 text-white" />
                            </div>
                            <div>
                                <CardTitle className="text-xl font-bold">Current Period</CardTitle>
                                <CardDescription>This month's usage statistics</CardDescription>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="p-6">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="p-5 bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-xl border border-blue-200 dark:border-blue-800">
                                <div className="flex items-center gap-3 mb-3">
                                    <div className="p-2 bg-blue-500 rounded-lg">
                                        <MessageSquare className="h-5 w-5 text-white" />
                                    </div>
                                    <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                                        Messages Sent
                                    </span>
                                </div>
                                <div className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-1">
                                    {current_usage.messages_sent.toLocaleString()}
                                </div>
                                {limits.messages_monthly !== undefined && (
                                    <div className="text-xs text-gray-500 dark:text-gray-400">
                                        Limit: {limits.messages_monthly === -1 ? 'Unlimited' : limits.messages_monthly.toLocaleString()}
                                    </div>
                                )}
                            </div>
                            <div className="p-5 bg-gradient-to-r from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 rounded-xl border border-purple-200 dark:border-purple-800">
                                <div className="flex items-center gap-3 mb-3">
                                    <div className="p-2 bg-purple-500 rounded-lg">
                                        <FileText className="h-5 w-5 text-white" />
                                    </div>
                                    <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                                        Template Sends
                                    </span>
                                </div>
                                <div className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-1">
                                    {current_usage.template_sends.toLocaleString()}
                                </div>
                                {limits.template_sends_monthly !== undefined && (
                                    <div className="text-xs text-gray-500 dark:text-gray-400">
                                        Limit: {limits.template_sends_monthly === -1 ? 'Unlimited' : limits.template_sends_monthly.toLocaleString()}
                                    </div>
                                )}
                            </div>
                            <div className="p-5 bg-gradient-to-r from-amber-50 to-amber-100 dark:from-amber-900/20 dark:to-amber-800/20 rounded-xl border border-amber-200 dark:border-amber-800">
                                <div className="flex items-center gap-3 mb-3">
                                    <div className="p-2 bg-amber-500 rounded-lg">
                                        <Zap className="h-5 w-5 text-white" />
                                    </div>
                                    <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                                        AI Credits Used
                                    </span>
                                </div>
                                <div className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-1">
                                    {current_usage.ai_credits_used.toLocaleString()}
                                </div>
                                {limits.ai_credits_monthly !== undefined && (
                                    <div className="text-xs text-gray-500 dark:text-gray-400">
                                        Limit: {limits.ai_credits_monthly === -1 ? 'Unlimited' : limits.ai_credits_monthly.toLocaleString()}
                                    </div>
                                )}
                            </div>
                        </div>
                        <div className="mt-6 p-5 bg-gradient-to-r from-emerald-50 to-emerald-100 dark:from-emerald-900/20 dark:to-emerald-800/20 rounded-xl border border-emerald-200 dark:border-emerald-800">
                            <div className="flex items-center justify-between">
                                <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">Meta Conversation Charges (Estimate)</span>
                                <span className="text-lg font-bold text-gray-900 dark:text-gray-100">
                                    {moneyFormatter.format((meta_billing?.estimated_cost_minor ?? current_usage.meta_estimated_cost_minor ?? 0) / 100)}
                                </span>
                            </div>
                            <div className="mt-2 text-xs text-gray-600 dark:text-gray-400 space-y-1">
                                <p>Free tier remaining: {(meta_billing?.free_tier_remaining ?? 0).toLocaleString()} / {(meta_billing?.free_tier_limit ?? 1000).toLocaleString()}</p>
                                <p>Paid conversations: {(current_usage.meta_conversations_paid ?? 0).toLocaleString()} | Free conversations: {(current_usage.meta_conversations_free_used ?? 0).toLocaleString()}</p>
                                <p>By category: Marketing {(current_usage.meta_conversations_marketing ?? 0).toLocaleString()}, Utility {(current_usage.meta_conversations_utility ?? 0).toLocaleString()}, Authentication {(current_usage.meta_conversations_authentication ?? 0).toLocaleString()}, Service {(current_usage.meta_conversations_service ?? 0).toLocaleString()}</p>
                                <p>
                                    Pricing source: {meta_billing?.pricing_source === 'table' ? 'Versioned Meta pricing table' : 'Legacy platform settings'}
                                    {meta_billing?.pricing_country_code ? ` (${meta_billing.pricing_country_code})` : ''}
                                    {meta_billing?.pricing_version?.id ? ` · Version #${meta_billing.pricing_version.id}` : ''}
                                </p>
                                <p>{meta_billing?.note ?? 'Meta charges are separate from your app plan and shown as estimate only.'}</p>
                            </div>

                            {metaCategoryBreakdown.length > 0 && (
                                <div className="mt-4 overflow-x-auto">
                                    <table className="w-full text-xs">
                                        <thead>
                                            <tr className="text-left text-gray-500 dark:text-gray-400 border-b border-emerald-200 dark:border-emerald-800">
                                                <th className="py-2 pr-3 font-semibold uppercase tracking-wider">Category</th>
                                                <th className="py-2 pr-3 font-semibold uppercase tracking-wider">Free</th>
                                                <th className="py-2 pr-3 font-semibold uppercase tracking-wider">Paid</th>
                                                <th className="py-2 pr-3 font-semibold uppercase tracking-wider">Rate</th>
                                                <th className="py-2 font-semibold uppercase tracking-wider">Estimated Cost</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {metaCategoryBreakdown.map((row) => (
                                                <tr key={row.category} className="border-b border-emerald-100/70 dark:border-emerald-900/40">
                                                    <td className="py-2 pr-3 font-medium text-gray-800 dark:text-gray-200 capitalize">{row.category.replace('_', ' ')}</td>
                                                    <td className="py-2 pr-3 text-gray-700 dark:text-gray-300">{row.free_count.toLocaleString()}</td>
                                                    <td className="py-2 pr-3 text-gray-700 dark:text-gray-300">{row.paid_count.toLocaleString()}</td>
                                                    <td className="py-2 pr-3 text-gray-700 dark:text-gray-300">{moneyFormatter.format((row.rate_minor ?? 0) / 100)}</td>
                                                    <td className="py-2 text-gray-900 dark:text-gray-100 font-semibold">{moneyFormatter.format((row.estimated_cost_minor ?? 0) / 100)}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* Usage History */}
                <Card className="border-0 shadow-lg">
                    <CardHeader className="bg-gradient-to-r from-gray-50 to-white dark:from-gray-800 dark:to-gray-900">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl">
                                <Clock className="h-5 w-5 text-white" />
                            </div>
                            <div>
                                <CardTitle className="text-xl font-bold">Usage History</CardTitle>
                                <CardDescription>Historical usage data by period</CardDescription>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="p-0">
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 border-b border-gray-200 dark:border-gray-700">
                                    <tr>
                                        <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                            Period
                                        </th>
                                        <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                            Messages
                                        </th>
                                        <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                            Templates
                                        </th>
                                        <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                            AI Credits
                                        </th>
                                        <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                            Meta (Free/Paid)
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200 dark:divide-gray-800 bg-white dark:bg-gray-900">
                                    {usage_history.length === 0 ? (
                                        <tr>
                                            <td colSpan={5} className="px-6 py-12 text-center text-gray-500 dark:text-gray-400">
                                                No usage history available
                                            </td>
                                        </tr>
                                    ) : (
                                        usage_history.map((period) => (
                                            <tr key={period.period} className="hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                                                <td className="px-6 py-4 text-sm font-semibold text-gray-900 dark:text-gray-100">
                                                    {period.period}
                                                </td>
                                                <td className="px-6 py-4 text-sm text-gray-700 dark:text-gray-300">
                                                    {period.messages_sent.toLocaleString()}
                                                </td>
                                                <td className="px-6 py-4 text-sm text-gray-700 dark:text-gray-300">
                                                    {period.template_sends.toLocaleString()}
                                                </td>
                                                <td className="px-6 py-4 text-sm text-gray-700 dark:text-gray-300">
                                                    {period.ai_credits_used.toLocaleString()}
                                                </td>
                                                <td className="px-6 py-4 text-sm text-gray-700 dark:text-gray-300">
                                                    {(period.meta_conversations_free_used ?? 0).toLocaleString()} / {(period.meta_conversations_paid ?? 0).toLocaleString()}
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </CardContent>
                </Card>

                {/* Blocked Events */}
                {blocked_events.length > 0 && (
                    <Card className="border-0 shadow-lg border-red-200 dark:border-red-800">
                        <CardHeader className="bg-gradient-to-r from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-800/20">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-red-500 rounded-xl">
                                    <AlertTriangle className="h-5 w-5 text-white" />
                                </div>
                                <div>
                                    <CardTitle className="text-xl font-bold text-red-900 dark:text-red-100">Limit Blocked Events</CardTitle>
                                    <CardDescription className="text-red-700 dark:text-red-300">
                                        Actions that were blocked due to plan limits
                                    </CardDescription>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="p-6">
                            <div className="space-y-3">
                                {blocked_events.map((event) => (
                                    <div
                                        key={event.id}
                                        className="p-4 bg-gradient-to-r from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-800/20 rounded-xl border border-red-200 dark:border-red-800"
                                    >
                                        <div className="flex items-start justify-between mb-2">
                                            <div className="flex items-center gap-2">
                                                <AlertTriangle className="h-4 w-4 text-red-600 dark:text-red-400" />
                                                <span className="text-sm font-semibold text-red-800 dark:text-red-200">
                                                    {event.data.limit_key} limit exceeded
                                                </span>
                                            </div>
                                            <Badge variant="danger" className="px-2 py-1 text-xs">
                                                Blocked
                                            </Badge>
                                        </div>
                                        <div className="text-xs text-red-600 dark:text-red-400 space-y-1">
                                            <p>
                                                Usage: <strong>{event.data.current_usage.toLocaleString()}</strong> / Limit: <strong>{event.data.limit.toLocaleString()}</strong> (Attempted: +{event.data.intended_increment.toLocaleString()})
                                            </p>
                                            <p className="flex items-center gap-1">
                                                <Clock className="h-3 w-3" />
                                                {new Date(event.created_at).toLocaleString()}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                )}
            </div>
        </AppShell>
    );
}
