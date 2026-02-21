import { Link, router } from '@inertiajs/react';
import { usePage } from '@inertiajs/react';
import AppShell from '@/Layouts/AppShell';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/Components/UI/Card';
import { Badge } from '@/Components/UI/Badge';
import Button from '@/Components/UI/Button';
import { Progress } from '@/Components/UI/Progress';
import { CreditCard, TrendingUp, Users, MessageSquare, FileText, Zap, AlertCircle, Clock, CheckCircle, ArrowRight } from 'lucide-react';
import { useNotifications } from '@/hooks/useNotifications';
import { Head } from '@inertiajs/react';
import { Alert } from '@/Components/UI/Alert';

interface Subscription {
    status: string;
    trial_ends_at: string | null;
    current_period_end: string | null;
    cancel_at_period_end: boolean;
    canceled_at: string | null;
    last_error: string | null;
}

interface Plan {
    name: string;
    key: string;
    price_monthly: number | null;
    price_yearly: number | null;
    currency: string;
    limits: Record<string, number>;
    modules: string[];
}

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

interface Account {
    slug: string;
    owner_id: number | string;
}

interface Wallet {
    balance_minor: number;
    currency: string;
}

interface MetaBillingSummary {
    free_tier_limit: number;
    free_tier_used: number;
    free_tier_remaining: number;
    estimated_cost_minor: number;
    currency: string;
    note: string;
}

export default function BillingIndex({
    account,
    subscription,
    plan,
    usage,
    meta_billing,
    wallet,
    current_connections_count,
    current_agents_count}: {
    account: Account;
    subscription: Subscription | null;
    plan: Plan | null;
    usage: Usage;
    meta_billing?: MetaBillingSummary;
    wallet: Wallet;
    current_connections_count?: number;
    current_agents_count?: number;
}) {
    const { auth } = usePage().props as any;
    const { confirm } = useNotifications();
    const isOwner = Number(account.owner_id) === Number(auth?.user?.id);

    const getStatusBadge = (status: string) => {
        const statusMap: Record<string, { variant: 'success' | 'warning' | 'danger' | 'default'; label: string }> = {
            trialing: { variant: 'default', label: 'Trial' },
            active: { variant: 'success', label: 'Active' },
            past_due: { variant: 'warning', label: 'Past Due' },
            canceled: { variant: 'danger', label: 'Canceled' }};

        const config = statusMap[status] || { variant: 'default' as const, label: status };
        return <Badge variant={config.variant} className="px-3 py-1">{config.label}</Badge>;
    };

    const formatPrice = (price: number | null, currency: string) => {
        if (price === null) return 'Custom';
        if (price === 0) return 'Free';
        const major = price / 100;
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: currency,
            minimumFractionDigits: 0}).format(major);
    };

    const getUsagePercentage = (used: number, limit: number | undefined) => {
        if (!limit || limit === -1 || limit === 9999 || limit === 9999999) return 0;
        return Math.min((used / limit) * 100, 100);
    };

    const getUsageColor = (percentage: number) => {
        if (percentage >= 90) return 'bg-red-600';
        if (percentage >= 75) return 'bg-yellow-600';
        return 'bg-blue-600';
    };

    const getTrialDaysRemaining = (trialEndsAt: string | null) => {
        if (!trialEndsAt) return null;
        const now = new Date();
        const end = new Date(trialEndsAt);
        const diffTime = end.getTime() - now.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays > 0 ? diffDays : 0;
    };

    const trialDays = subscription ? getTrialDaysRemaining(subscription.trial_ends_at) : null;
    const estimatedMetaCost = (meta_billing?.estimated_cost_minor ?? usage.meta_estimated_cost_minor ?? 0) / 100;
    const walletBalance = (wallet?.balance_minor ?? 0) / 100;

    const renderUsageMeter = (
        label: string,
        icon: any,
        used: number,
        limit: number | undefined,
        currentCount?: number
    ) => {
        if (limit === undefined) return null;

        const isUnlimited = limit === -1 || limit === 9999 || limit === 9999999;
        const percentage = isUnlimited ? 0 : getUsagePercentage(used, limit);
        const variant = percentage >= 90 ? 'danger' : percentage >= 75 ? 'warning' : 'default';

        return (
            <div className="p-5 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 space-y-3">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-500 rounded-lg">
                            {icon}
                        </div>
                        <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">{label}</span>
                    </div>
                    <span className="text-sm font-bold text-gray-900 dark:text-gray-100">
                        {used.toLocaleString()} / {isUnlimited ? '∞' : limit.toLocaleString()}
                        {currentCount !== undefined && (
                            <span className="ml-1 text-xs text-gray-500 font-normal">
                                ({currentCount} active)
                            </span>
                        )}
                    </span>
                </div>
                {!isUnlimited && (
                    <>
                        <Progress value={percentage} variant={variant} className="h-2.5" />
                        {percentage >= 90 && (
                            <p className="text-xs text-red-600 dark:text-red-400 font-medium">
                                Near limit. <Link href={route('app.billing.plans', {})} className="underline hover:no-underline">Upgrade</Link>
                            </p>
                        )}
                    </>
                )}
            </div>
        );
    };

    return (
        <AppShell>
            <Head title="Billing Overview" />
            <div className="space-y-8">
                <div>
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-gray-100 dark:to-gray-300 bg-clip-text text-transparent">
                        Billing Overview
                    </h1>
                    <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                        Manage your subscription and view usage
                    </p>
                </div>

                {/* Status Banners */}
                {subscription?.status === 'past_due' && (
                    <Alert variant="warning" className="border-yellow-200 dark:border-yellow-800">
                        <AlertCircle className="h-5 w-5" />
                        <div className="flex-1">
                            <h3 className="font-semibold text-yellow-800 dark:text-yellow-200 mb-1">
                                Payment Past Due
                            </h3>
                            <p className="text-sm text-yellow-700 dark:text-yellow-300 mb-3">
                                Your subscription payment is past due. Please update your payment method to continue using all features.
                            </p>
                            {subscription.last_error && (
                                <p className="text-xs text-yellow-600 dark:text-yellow-400 italic mb-3">
                                    {subscription.last_error}
                                </p>
                            )}
                            <Link href={route('app.billing.plans', {})}>
                                <Button variant="secondary" size="sm" className="rounded-xl">
                                    Update Payment
                                </Button>
                            </Link>
                        </div>
                    </Alert>
                )}

                {subscription?.status === 'canceled' && (
                    <Alert variant="error" className="border-red-200 dark:border-red-800">
                        <AlertCircle className="h-5 w-5" />
                        <div className="flex-1">
                            <h3 className="font-semibold text-red-800 dark:text-red-200 mb-1">
                                Subscription Canceled
                            </h3>
                            <p className="text-sm text-red-700 dark:text-red-300 mb-3">
                                Your subscription was canceled on {subscription.canceled_at ? new Date(subscription.canceled_at).toLocaleDateString() : 'a previous date'}. 
                                You can reactivate it or choose a new plan.
                            </p>
                            <Link href={route('app.billing.plans', {})}>
                                <Button variant="secondary" size="sm" className="rounded-xl">
                                    View Plans
                                </Button>
                            </Link>
                        </div>
                    </Alert>
                )}

                {/* Current Plan Card */}
                <Card className="border-0 shadow-lg">
                    <CardHeader className="bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-blue-500 rounded-xl">
                                    <CreditCard className="h-5 w-5 text-white" />
                                </div>
                                <div>
                                    <CardTitle className="text-xl font-bold">Current Plan</CardTitle>
                                    <CardDescription>Your active subscription details</CardDescription>
                                </div>
                            </div>
                            {subscription && getStatusBadge(subscription.status)}
                        </div>
                    </CardHeader>
                    <CardContent className="p-6">
                        {plan ? (
                            <div className="space-y-6">
                                <div>
                                    <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-1">
                                        {plan.name}
                                    </h3>
                                </div>
                                <div className="flex items-center gap-6">
                                    <div className="p-4 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 rounded-xl flex-1">
                                        <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Monthly</p>
                                        <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                                            {formatPrice(plan.price_monthly, plan.currency)}
                                        </p>
                                    </div>
                                    {plan.price_yearly && (
                                        <div className="p-4 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 rounded-xl flex-1">
                                            <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Yearly</p>
                                            <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                                                {formatPrice(plan.price_yearly, plan.currency)}
                                            </p>
                                        </div>
                                    )}
                                </div>

                                {/* Trial Banner */}
                                {subscription?.status === 'trialing' && trialDays !== null && (
                                    <div className="p-4 bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-xl border border-blue-200 dark:border-blue-800">
                                        <div className="flex items-center gap-3">
                                            <Clock className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                                            <div>
                                                <p className="font-semibold text-blue-800 dark:text-blue-200">
                                                    {trialDays} {trialDays === 1 ? 'day' : 'days'} left in trial
                                                </p>
                                                <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
                                                    Trial ends on {subscription.trial_ends_at ? new Date(subscription.trial_ends_at).toLocaleDateString() : 'soon'}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {subscription?.cancel_at_period_end && (
                                    <div className="p-4 bg-gradient-to-r from-yellow-50 to-yellow-100 dark:from-yellow-900/20 dark:to-yellow-800/20 rounded-xl border border-yellow-200 dark:border-yellow-800">
                                        <p className="text-sm text-yellow-800 dark:text-yellow-200 font-medium">
                                            Subscription will be canceled on{' '}
                                            {subscription.current_period_end
                                                ? new Date(subscription.current_period_end).toLocaleDateString()
                                                : 'period end'}
                                        </p>
                                    </div>
                                )}
                                <div className="flex items-center gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                                    <Link href={route('app.billing.plans', {})}>
                                        <Button className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 shadow-lg shadow-blue-500/50 rounded-xl">
                                            Change Plan
                                        </Button>
                                    </Link>
                                    {isOwner && subscription && subscription.status === 'active' && !subscription.cancel_at_period_end && (
                                        <Button
                                            variant="secondary"
                                            onClick={async () => {
                                                const confirmed = await confirm({
                                                    title: 'Cancel Subscription',
                                                    message: 'Are you sure you want to cancel your subscription?',
                                                    variant: 'warning'});
                                                if (confirmed) {
                                                    router.post(route('app.billing.cancel', {}));
                                                }
                                            }}
                                            className="rounded-xl"
                                        >
                                            Cancel Subscription
                                        </Button>
                                    )}
                                    {isOwner && subscription && subscription.cancel_at_period_end && (
                                        <Button
                                            variant="success"
                                            onClick={() => {
                                                router.post(route('app.billing.resume', {}));
                                            }}
                                            className="rounded-xl"
                                        >
                                            Resume Subscription
                                        </Button>
                                    )}
                                </div>
                            </div>
                        ) : (
                            <p className="text-gray-500 dark:text-gray-400">No plan assigned</p>
                        )}
                    </CardContent>
                </Card>

                {/* Usage Meters */}
                <Card className="border-0 shadow-lg">
                    <CardHeader className="bg-gradient-to-r from-gray-50 to-white dark:from-gray-800 dark:to-gray-900">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl">
                                    <TrendingUp className="h-5 w-5 text-white" />
                                </div>
                                <div>
                                    <CardTitle className="text-xl font-bold">Current Usage (This Month)</CardTitle>
                                    <CardDescription>Track your usage against plan limits</CardDescription>
                                </div>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="p-6 space-y-4">
                        {renderUsageMeter(
                            'Messages Sent',
                            <MessageSquare className="h-4 w-4 text-white" />,
                            usage.messages_sent,
                            plan?.limits.messages_monthly
                        )}
                        {renderUsageMeter(
                            'Template Sends',
                            <FileText className="h-4 w-4 text-white" />,
                            usage.template_sends,
                            plan?.limits.template_sends_monthly
                        )}
                        {renderUsageMeter(
                            'WhatsApp Connections',
                            <Zap className="h-4 w-4 text-white" />,
                            current_connections_count || 0,
                            plan?.limits.whatsapp_connections,
                            current_connections_count
                        )}
                        {renderUsageMeter(
                            'Agents',
                            <Users className="h-4 w-4 text-white" />,
                            current_agents_count || 0,
                            plan?.limits.agents,
                            current_agents_count
                        )}
                        <div className="p-5 bg-gradient-to-r from-emerald-50 to-emerald-100 dark:from-emerald-900/20 dark:to-emerald-800/20 rounded-xl border border-emerald-200 dark:border-emerald-800 space-y-3">
                            <div className="flex items-center justify-between">
                                <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">Meta Conversation Billing (Estimate)</span>
                                <span className="text-sm font-bold text-gray-900 dark:text-gray-100">
                                    {new Intl.NumberFormat('en-IN', { style: 'currency', currency: meta_billing?.currency || 'INR', minimumFractionDigits: 2 }).format(estimatedMetaCost)}
                                </span>
                            </div>
                            <div className="text-xs text-gray-600 dark:text-gray-400 space-y-1">
                                <p>Free tier used: {(meta_billing?.free_tier_used ?? usage.meta_conversations_free_used ?? 0).toLocaleString()} / {(meta_billing?.free_tier_limit ?? 1000).toLocaleString()}</p>
                                <p>Paid conversations: {(usage.meta_conversations_paid ?? 0).toLocaleString()}</p>
                                <p>{meta_billing?.note ?? 'Meta charges are separate from your app plan. These values are usage estimates based on webhook data.'}</p>
                            </div>
                        </div>
                        <div className="pt-4 border-t border-gray-200 dark:border-gray-700 flex flex-wrap gap-4">
                            <Link
                                href={route('app.billing.usage', {})}
                                className="inline-flex items-center gap-2 text-sm font-medium text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors"
                            >
                                View detailed usage
                                <ArrowRight className="h-4 w-4" />
                            </Link>
                            <Link
                                href={route('app.billing.history', { })}
                                className="inline-flex items-center gap-2 text-sm font-medium text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors"
                            >
                                View payment history
                                <ArrowRight className="h-4 w-4" />
                            </Link>
                            <Link
                                href={route('app.billing.transactions', {})}
                                className="inline-flex items-center gap-2 text-sm font-medium text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors"
                            >
                                View transactions & wallet
                                <ArrowRight className="h-4 w-4" />
                            </Link>
                            <span className="inline-flex items-center text-sm text-gray-600 dark:text-gray-400">
                                Wallet: {new Intl.NumberFormat('en-IN', { style: 'currency', currency: wallet?.currency || 'INR' }).format(walletBalance)}
                            </span>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </AppShell>
    );
}
