import { Head, Link, router, usePage } from '@inertiajs/react';
import axios from 'axios';
import { useState } from 'react';
import AppShell from '@/Layouts/AppShell';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/Components/UI/Card';
import { Badge } from '@/Components/UI/Badge';
import Button from '@/Components/UI/Button';
import { Progress } from '@/Components/UI/Progress';
import { Alert } from '@/Components/UI/Alert';
import { AlertCircle, ArrowRight, Clock, FileText, MessageSquare, WalletCards, Users, Zap } from 'lucide-react';
import { useNotifications } from '@/hooks/useNotifications';

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

interface RecentPayment {
    id: number;
    invoice_no: string;
    amount: number;
    currency: string;
    status: string;
    plan_name: string | null;
    created_at: string;
    failure_reason?: string | null;
}

function formatPrice(price: number | null, currency: string) {
    if (price === null) return 'Custom';
    if (price === 0) return 'Free';

    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency,
        minimumFractionDigits: 0,
    }).format(price / 100);
}

function getStatusBadge(status: string) {
    const statusMap: Record<string, { variant: 'success' | 'warning' | 'danger' | 'default'; label: string }> = {
        trialing: { variant: 'default', label: 'Trial' },
        active: { variant: 'success', label: 'Active' },
        past_due: { variant: 'warning', label: 'Past due' },
        canceled: { variant: 'danger', label: 'Canceled' },
    };

    const config = statusMap[status] || { variant: 'default' as const, label: status };
    return <Badge variant={config.variant} className="px-3 py-1">{config.label}</Badge>;
}

function getTrialDaysRemaining(trialEndsAt: string | null) {
    if (!trialEndsAt) return null;

    const now = new Date();
    const end = new Date(trialEndsAt);
    const diffTime = end.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 0;
}

function getUsagePercentage(used: number, limit: number | undefined) {
    if (!limit || limit === -1 || limit === 9999 || limit === 9999999) return 0;
    return Math.min((used / limit) * 100, 100);
}

function isUnlimitedLimit(limit: number | undefined) {
    return limit === -1 || limit === 9999 || limit === 9999999;
}

function UsageRow({
    label,
    icon,
    used,
    limit,
    helper,
}: {
    label: string;
    icon: React.ReactNode;
    used: number;
    limit: number | undefined;
    helper?: string;
}) {
    if (limit === undefined) return null;

    const unlimited = isUnlimitedLimit(limit);
    const percent = unlimited ? 0 : getUsagePercentage(used, limit);
    const remaining = unlimited ? null : Math.max((limit ?? 0) - used, 0);
    return (
        <div className="rounded-2xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900">
            <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-3 min-w-0">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-200">
                        {icon}
                    </div>
                    <div className="min-w-0">
                        <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">{label}</p>
                        {helper ? <p className="text-xs text-gray-500 dark:text-gray-400">{helper}</p> : null}
                    </div>
                </div>
                <div className="text-right">
                    <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                        {used.toLocaleString()} / {unlimited ? 'Unlimited' : limit?.toLocaleString()}
                    </p>
                    {!unlimited ? (
                        <p className="text-xs text-gray-500 dark:text-gray-400">{remaining?.toLocaleString()} left</p>
                    ) : (
                        <p className="text-xs text-gray-500 dark:text-gray-400">No cap</p>
                    )}
                </div>
            </div>
            {!unlimited ? (
                <div className="mt-3 space-y-2">
                    <Progress value={percent} className="h-2.5" />
                    <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                        <span>{Math.round(percent)}% used</span>
                        {percent >= 90 ? <span className="font-medium text-red-600 dark:text-red-400">Close to limit</span> : null}
                    </div>
                </div>
            ) : null}
        </div>
    );
}

export default function BillingIndex({
    account,
    subscription,
    plan,
    usage,
    meta_billing,
    wallet,
    latest_paid_payment = null,
    latest_failed_payment = null,
    current_connections_count,
    current_agents_count,
    razorpay_enabled = false,
    razorpay_key_id = null,
}: {
    account: Account;
    subscription: Subscription | null;
    plan: Plan | null;
    usage: Usage;
    meta_billing?: MetaBillingSummary;
    wallet: Wallet;
    recent_payments?: RecentPayment[];
    latest_paid_payment?: RecentPayment | null;
    latest_failed_payment?: RecentPayment | null;
    current_connections_count?: number;
    current_agents_count?: number;
    razorpay_enabled?: boolean;
    razorpay_key_id?: string | null;
}) {
    const { auth } = usePage().props as any;
    const { confirm } = useNotifications();
    const [renewing, setRenewing] = useState(false);
    const isOwner = Number(account.owner_id) === Number(auth?.user?.id);
    const razorpayEnabled = razorpay_enabled && Boolean(razorpay_key_id);

    const trialDays = subscription ? getTrialDaysRemaining(subscription.trial_ends_at) : null;
    const estimatedMetaCost = (meta_billing?.estimated_cost_minor ?? usage.meta_estimated_cost_minor ?? 0) / 100;
    const walletBalance = (wallet?.balance_minor ?? 0) / 100;
    const canRenewNow = Boolean(
        isOwner
            && subscription?.status === 'past_due'
            && plan
            && (plan.price_monthly ?? 0) > 0
            && razorpayEnabled,
    );
    const renewalUnavailableReason = !isOwner
        ? 'Only the account owner can renew this subscription.'
        : !plan
        ? 'Plan details are unavailable right now.'
        : (plan.price_monthly ?? 0) <= 0
        ? 'This plan is free. No payment is required.'
        : !razorpayEnabled
        ? 'Online checkout is currently unavailable right now.'
        : null;
    const canResumeSubscription = Boolean(
        isOwner
        && subscription
        && (subscription.cancel_at_period_end || subscription.status === 'canceled'),
    );

    const loadRazorpay = () => new Promise<void>((resolve, reject) => {
        if (typeof window !== 'undefined' && (window as any).Razorpay) {
            resolve();
            return;
        }

        const existingScript = document.querySelector('script[src="https://checkout.razorpay.com/v1/checkout.js"]');
        if (existingScript) {
            existingScript.addEventListener('load', () => resolve());
            existingScript.addEventListener('error', () => reject(new Error('Failed to load Razorpay script')));
            return;
        }

        const script = document.createElement('script');
        script.src = 'https://checkout.razorpay.com/v1/checkout.js';
        script.async = true;
        script.crossOrigin = 'anonymous';
        script.onload = () => resolve();
        script.onerror = () => reject(new Error('Failed to load Razorpay script'));
        document.head.appendChild(script);
    });

    const handleRenewNow = async () => {
        if (!plan || !canRenewNow) return;

        const confirmed = await confirm({
            title: 'Renew Subscription',
            message: `Proceed to renew ${plan.name}?`,
            variant: 'info',
        });
        if (!confirmed) return;

        setRenewing(true);
        try {
            await loadRazorpay();
            const orderResponse = await axios.post(route('app.billing.razorpay.order', { plan: plan.key }), {}, {
                headers: { 'X-Requested-With': 'XMLHttpRequest', Accept: 'application/json' },
            });
            const { order_id, amount, currency, key_id } = orderResponse.data || {};
            if (!order_id || !amount || !key_id || !(window as any).Razorpay) {
                throw new Error('Invalid payment order response');
            }

            const razorpay = new (window as any).Razorpay({
                key: key_id,
                amount: Number(amount),
                currency: currency || 'INR',
                order_id,
                name: account.slug,
                description: `Renew ${plan.name}`,
                handler: async (response: any) => {
                    await axios.post(route('app.billing.razorpay.confirm', {}), {
                        order_id: response.razorpay_order_id,
                        payment_id: response.razorpay_payment_id,
                        signature: response.razorpay_signature,
                    });
                    router.reload({ only: ['subscription', 'plan', 'latest_paid_payment', 'latest_failed_payment', 'flash'] });
                },
                modal: {
                    ondismiss: () => setRenewing(false),
                },
            });
            razorpay.on('payment.failed', () => setRenewing(false));
            razorpay.open();
        } catch {
            setRenewing(false);
            router.reload({ only: ['flash'] });
        }
    };

    return (
        <AppShell>
            <Head title="Billing" />
            <div className="space-y-6">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                    <div>
                        <h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">Billing</h1>
                        <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">Current plan, usage, and payment actions.</p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        <Link href={route('app.billing.plans', {})}>
                            <Button className="rounded-xl">Review plans</Button>
                        </Link>
                        <Link href={route('app.billing.usage', {})}>
                            <Button variant="secondary" className="rounded-xl">Detailed usage</Button>
                        </Link>
                    </div>
                </div>

                {subscription?.status === 'past_due' && (
                    <Alert variant="warning" className="border-yellow-200 dark:border-yellow-800">
                        <AlertCircle className="h-5 w-5" />
                        <div className="flex-1">
                            <h3 className="mb-1 font-semibold text-yellow-800 dark:text-yellow-200">Renewal payment pending</h3>
                            <p className="mb-3 text-sm text-yellow-700 dark:text-yellow-300">Your current billing cycle has ended and payment is still pending.</p>
                            {subscription.last_error ? (
                                <p className="mb-3 text-xs italic text-yellow-700 dark:text-yellow-300">{subscription.last_error}</p>
                            ) : null}
                            <div className="flex flex-col gap-2 sm:flex-row">
                                {canRenewNow ? (
                                    <Button variant="secondary" size="sm" className="w-full rounded-xl sm:w-auto" onClick={handleRenewNow} disabled={renewing}>
                                        {renewing ? 'Opening checkout...' : 'Renew now'}
                                    </Button>
                                ) : (
                                    <Link href={route('app.billing.plans', {})}>
                                        <Button variant="secondary" size="sm" className="w-full rounded-xl sm:w-auto">Review plans</Button>
                                    </Link>
                                )}
                                {latest_failed_payment ? (
                                    <Link href={route('app.billing.history.show', { paymentOrder: latest_failed_payment.id })}>
                                        <Button variant="secondary" size="sm" className="w-full rounded-xl sm:w-auto">Review failed invoice</Button>
                                    </Link>
                                ) : null}
                            </div>
                            {renewalUnavailableReason ? <p className="mt-2 text-xs text-yellow-700 dark:text-yellow-300">{renewalUnavailableReason}</p> : null}
                        </div>
                    </Alert>
                )}

                {subscription?.status === 'canceled' && (
                    <Alert variant="error" className="border-red-200 dark:border-red-800">
                        <AlertCircle className="h-5 w-5" />
                        <div className="flex-1">
                            <h3 className="mb-1 font-semibold text-red-800 dark:text-red-200">Subscription canceled</h3>
                            <p className="mb-3 text-sm text-red-700 dark:text-red-300">
                                Your subscription was canceled on {subscription.canceled_at ? new Date(subscription.canceled_at).toLocaleDateString() : 'a previous date'}.
                            </p>
                            <div className="flex flex-col gap-2 sm:flex-row">
                                {canResumeSubscription ? (
                                    <Button variant="secondary" size="sm" className="rounded-xl" onClick={() => router.post(route('app.billing.resume', {}))}>
                                        Resume subscription
                                    </Button>
                                ) : null}
                                <Link href={route('app.billing.plans', {})}>
                                    <Button variant="secondary" size="sm" className="rounded-xl">View plans</Button>
                                </Link>
                            </div>
                        </div>
                    </Alert>
                )}

                <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
                    <Card className="border border-gray-200 shadow-sm dark:border-gray-800">
                        <CardHeader className="border-b border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900">
                            <div className="flex items-start justify-between gap-4">
                                <div>
                                    <CardTitle className="text-lg font-semibold">Current plan</CardTitle>
                                    <CardDescription>Plan status, renewal, and wallet balance.</CardDescription>
                                </div>
                                {subscription ? getStatusBadge(subscription.status) : null}
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-5 p-6">
                            {plan ? (
                                <>
                                    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                                        <div className="rounded-2xl border border-gray-200 bg-gray-50 p-4 dark:border-gray-800 dark:bg-gray-950">
                                            <p className="text-xs font-medium text-gray-500 dark:text-gray-400">Plan</p>
                                            <p className="mt-1 text-lg font-semibold text-gray-900 dark:text-gray-100">{plan.name}</p>
                                        </div>
                                        <div className="rounded-2xl border border-gray-200 bg-gray-50 p-4 dark:border-gray-800 dark:bg-gray-950">
                                            <p className="text-xs font-medium text-gray-500 dark:text-gray-400">Monthly price</p>
                                            <p className="mt-1 text-lg font-semibold text-gray-900 dark:text-gray-100">{formatPrice(plan.price_monthly, plan.currency)}</p>
                                        </div>
                                        <div className="rounded-2xl border border-gray-200 bg-gray-50 p-4 dark:border-gray-800 dark:bg-gray-950">
                                            <p className="text-xs font-medium text-gray-500 dark:text-gray-400">Next renewal</p>
                                            <p className="mt-1 text-lg font-semibold text-gray-900 dark:text-gray-100">
                                                {subscription?.current_period_end ? new Date(subscription.current_period_end).toLocaleDateString() : 'Not scheduled'}
                                            </p>
                                        </div>
                                        <div className="rounded-2xl border border-gray-200 bg-gray-50 p-4 dark:border-gray-800 dark:bg-gray-950">
                                            <p className="text-xs font-medium text-gray-500 dark:text-gray-400">Wallet balance</p>
                                            <p className="mt-1 text-lg font-semibold text-gray-900 dark:text-gray-100">
                                                {new Intl.NumberFormat('en-IN', { style: 'currency', currency: wallet?.currency || 'INR' }).format(walletBalance)}
                                            </p>
                                        </div>
                                    </div>

                                    {subscription?.status === 'trialing' && trialDays !== null ? (
                                        <div className="rounded-2xl border border-blue-200 bg-blue-50 p-4 dark:border-blue-800 dark:bg-blue-900/20">
                                            <div className="flex items-start gap-3">
                                                <Clock className="mt-0.5 h-5 w-5 text-blue-600 dark:text-blue-400" />
                                                <div>
                                                    <p className="font-semibold text-blue-800 dark:text-blue-200">{trialDays} {trialDays === 1 ? 'day' : 'days'} left in trial</p>
                                                    <p className="mt-1 text-sm text-blue-700 dark:text-blue-300">Trial ends on {subscription.trial_ends_at ? new Date(subscription.trial_ends_at).toLocaleDateString() : 'soon'}.</p>
                                                </div>
                                            </div>
                                        </div>
                                    ) : null}

                                    {subscription?.cancel_at_period_end ? (
                                        <div className="rounded-2xl border border-yellow-200 bg-yellow-50 p-4 dark:border-yellow-800 dark:bg-yellow-900/20">
                                            <p className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                                                This subscription will end on {subscription.current_period_end ? new Date(subscription.current_period_end).toLocaleDateString() : 'period end'}.
                                            </p>
                                        </div>
                                    ) : null}

                                    <div className="flex flex-wrap gap-2 pt-1">
                                        {subscription?.status === 'past_due' && canRenewNow ? (
                                            <Button className="rounded-xl" onClick={handleRenewNow} disabled={renewing}>
                                                {renewing ? 'Opening checkout...' : 'Renew now'}
                                            </Button>
                                        ) : null}
                                        {isOwner && subscription && subscription.status === 'active' && !subscription.cancel_at_period_end ? (
                                            <Button
                                                variant="secondary"
                                                className="rounded-xl"
                                                onClick={async () => {
                                                    const confirmed = await confirm({
                                                        title: 'Cancel Subscription',
                                                        message: 'Are you sure you want to cancel your subscription?',
                                                        variant: 'warning',
                                                    });
                                                    if (confirmed) {
                                                        router.post(route('app.billing.cancel', {}));
                                                    }
                                                }}
                                            >
                                                Cancel subscription
                                            </Button>
                                        ) : null}
                                        {canResumeSubscription ? (
                                            <Button variant="success" className="rounded-xl" onClick={() => router.post(route('app.billing.resume', {}))}>
                                                Resume subscription
                                            </Button>
                                        ) : null}
                                    </div>
                                </>
                            ) : (
                                <p className="text-sm text-gray-500 dark:text-gray-400">No plan is assigned yet.</p>
                            )}
                        </CardContent>
                    </Card>

                    <Card className="border border-gray-200 shadow-sm dark:border-gray-800">
                        <CardHeader className="border-b border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900">
                            <div>
                                <CardTitle className="text-lg font-semibold">Billing links</CardTitle>
                                <CardDescription>Open the detailed pages when you need invoices, transactions, or deeper usage.</CardDescription>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-3 p-6">
                            <Link href={route('app.billing.usage', {})} className="block rounded-2xl border border-gray-200 bg-white p-4 transition hover:border-blue-300 hover:shadow-sm dark:border-gray-800 dark:bg-gray-900">
                                <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">Detailed usage</p>
                                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Monthly history, blocked events, Meta category breakdown, and cost drivers.</p>
                                <span className="mt-3 inline-flex items-center gap-2 text-sm font-medium text-blue-600 dark:text-blue-400">Open usage <ArrowRight className="h-4 w-4" /></span>
                            </Link>
                            <Link href={route('app.billing.history', {})} className="block rounded-2xl border border-gray-200 bg-white p-4 transition hover:border-blue-300 hover:shadow-sm dark:border-gray-800 dark:bg-gray-900">
                                <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">Invoices</p>
                                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">View invoices and payment history on the dedicated page.</p>
                                <span className="mt-3 inline-flex items-center gap-2 text-sm font-medium text-blue-600 dark:text-blue-400">Open invoices <ArrowRight className="h-4 w-4" /></span>
                            </Link>
                            <Link href={route('app.billing.transactions', {})} className="block rounded-2xl border border-gray-200 bg-white p-4 transition hover:border-blue-300 hover:shadow-sm dark:border-gray-800 dark:bg-gray-900">
                                <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">Transactions</p>
                                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Payments, wallet credits, and manual adjustments in one place.</p>
                                <span className="mt-3 inline-flex items-center gap-2 text-sm font-medium text-blue-600 dark:text-blue-400">Open transactions <ArrowRight className="h-4 w-4" /></span>
                            </Link>
                        </CardContent>
                    </Card>
                </div>

                <Card className="border border-gray-200 shadow-sm dark:border-gray-800">
                    <CardHeader className="border-b border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900">
                        <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                            <div>
                                <CardTitle className="text-lg font-semibold">Usage this month</CardTitle>
                                <CardDescription>Track plan limits clearly before they become a problem.</CardDescription>
                            </div>
                            <Link href={route('app.billing.usage', {})} className="text-sm font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400">
                                View full usage
                            </Link>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-4 p-6">
                        <div className="grid gap-4 xl:grid-cols-2">
                            <UsageRow
                                label="Messages sent"
                                icon={<MessageSquare className="h-4 w-4" />}
                                used={usage.messages_sent}
                                limit={plan?.limits.messages_monthly}
                            />
                            <UsageRow
                                label="Template sends"
                                icon={<FileText className="h-4 w-4" />}
                                used={usage.template_sends}
                                limit={plan?.limits.template_sends_monthly}
                            />
                            <UsageRow
                                label="WhatsApp connections"
                                icon={<Zap className="h-4 w-4" />}
                                used={current_connections_count || 0}
                                limit={plan?.limits.whatsapp_connections}
                                helper={`${current_connections_count || 0} active now`}
                            />
                            <UsageRow
                                label="Team members"
                                icon={<Users className="h-4 w-4" />}
                                used={current_agents_count || 0}
                                limit={plan?.limits.agents}
                                helper={`${current_agents_count || 0} active now`}
                            />
                        </div>

                        <div className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
                            <div className="rounded-2xl border border-gray-200 bg-gray-50 p-4 dark:border-gray-800 dark:bg-gray-950">
                                <div className="flex items-center gap-3">
                                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300">
                                        <WalletCards className="h-4 w-4" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">Meta conversation charges</p>
                                        <p className="text-xs text-gray-500 dark:text-gray-400">Estimated from current month usage.</p>
                                    </div>
                                </div>
                                <div className="mt-4 grid gap-3 sm:grid-cols-3">
                                    <div className="rounded-xl border border-gray-200 bg-white p-3 dark:border-gray-800 dark:bg-gray-900">
                                        <p className="text-xs text-gray-500 dark:text-gray-400">Estimated cost</p>
                                        <p className="mt-1 text-base font-semibold text-gray-900 dark:text-gray-100">
                                            {new Intl.NumberFormat('en-IN', { style: 'currency', currency: meta_billing?.currency || 'INR', minimumFractionDigits: 2 }).format(estimatedMetaCost)}
                                        </p>
                                    </div>
                                    <div className="rounded-xl border border-gray-200 bg-white p-3 dark:border-gray-800 dark:bg-gray-900">
                                        <p className="text-xs text-gray-500 dark:text-gray-400">Free tier used</p>
                                        <p className="mt-1 text-base font-semibold text-gray-900 dark:text-gray-100">
                                            {(meta_billing?.free_tier_used ?? usage.meta_conversations_free_used ?? 0).toLocaleString()} / {(meta_billing?.free_tier_limit ?? 1000).toLocaleString()}
                                        </p>
                                    </div>
                                    <div className="rounded-xl border border-gray-200 bg-white p-3 dark:border-gray-800 dark:bg-gray-900">
                                        <p className="text-xs text-gray-500 dark:text-gray-400">Paid conversations</p>
                                        <p className="mt-1 text-base font-semibold text-gray-900 dark:text-gray-100">{(usage.meta_conversations_paid ?? 0).toLocaleString()}</p>
                                    </div>
                                </div>
                                <p className="mt-3 text-xs text-gray-600 dark:text-gray-400">
                                    {meta_billing?.note ?? 'Meta charges are separate from your app plan. These values are estimates based on usage data.'}
                                </p>
                            </div>

                            <div className="rounded-2xl border border-gray-200 bg-gray-50 p-4 dark:border-gray-800 dark:bg-gray-950 space-y-4">
                                <div>
                                    <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">Recent billing status</p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">Quick summary. Open invoices for full history.</p>
                                </div>
                                <div className="rounded-xl border border-gray-200 bg-white p-3 dark:border-gray-800 dark:bg-gray-900">
                                    <p className="text-xs text-gray-500 dark:text-gray-400">Latest paid invoice</p>
                                    {latest_paid_payment ? (
                                        <>
                                            <p className="mt-1 text-sm font-semibold text-gray-900 dark:text-gray-100">{latest_paid_payment.invoice_no}</p>
                                            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                                                {formatPrice(latest_paid_payment.amount, latest_paid_payment.currency)} · {new Date(latest_paid_payment.created_at).toLocaleDateString()}
                                            </p>
                                        </>
                                    ) : (
                                        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">No paid invoice yet.</p>
                                    )}
                                </div>
                                <div className="rounded-xl border border-gray-200 bg-white p-3 dark:border-gray-800 dark:bg-gray-900">
                                    <p className="text-xs text-gray-500 dark:text-gray-400">Latest failed payment</p>
                                    {latest_failed_payment ? (
                                        <>
                                            <p className="mt-1 text-sm font-semibold text-gray-900 dark:text-gray-100">{latest_failed_payment.invoice_no}</p>
                                            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                                                {new Date(latest_failed_payment.created_at).toLocaleDateString()}
                                                {latest_failed_payment.failure_reason ? ` · ${latest_failed_payment.failure_reason}` : ''}
                                            </p>
                                        </>
                                    ) : (
                                        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">No failed payment to review.</p>
                                    )}
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </AppShell>
    );
}
