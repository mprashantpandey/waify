import { Head, Link } from '@inertiajs/react';
import PlatformShell from '@/Layouts/PlatformShell';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/Components/UI/Card';
import Button from '@/Components/UI/Button';
import { Badge } from '@/Components/UI/Badge';
import { ArrowLeft, Building2 } from 'lucide-react';
import { usePage } from '@inertiajs/react';

interface Subscription {
    id: number;
    slug: string;
    workspace: {
        id: number;
        name: string;
        slug: string;
    };
    plan: {
        key: string;
        name: string;
    };
    status: string;
    trial_ends_at: string | null;
    current_period_start: string | null;
    current_period_end: string | null;
    cancel_at_period_end: boolean;
    canceled_at: string | null;
    started_at: string;
    usage: {
        messages_sent: number;
        template_sends: number;
        ai_credits_used: number;
    };
    limits: Record<string, number>;
}

export default function SubscriptionsShow({ subscription }: { subscription: Subscription }) {
    const { auth } = usePage().props as any;

    const formatDate = (dateString: string | null) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleString();
    };

    const getStatusBadge = (status: string) => {
        const variants: Record<string, 'success' | 'warning' | 'danger' | 'info' | 'default'> = {
            active: 'success',
            trialing: 'info',
            past_due: 'warning',
            canceled: 'danger',
        };
        return <Badge variant={variants[status] || 'default'}>{status}</Badge>;
    };

    const formatLimit = (value: number) => {
        if (value === -1) return 'Unlimited';
        return value.toLocaleString();
    };

    const getUsagePercentage = (used: number, limit: number) => {
        if (limit === -1) return 0;
        if (limit === 0) return 100;
        return Math.min(100, (used / limit) * 100);
    };

    return (
        <PlatformShell auth={auth}>
            <Head title={`Subscription: ${subscription.workspace.name}`} />
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link href={route('platform.subscriptions.index')}>
                            <Button variant="ghost" size="sm">
                                <ArrowLeft className="h-4 w-4 mr-2" />
                                Back to Subscriptions
                            </Button>
                        </Link>
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                                Subscription Details
                            </h1>
                            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                                {subscription.workspace.name}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2 space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Subscription Information</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <p className="text-sm text-gray-500 dark:text-gray-400">Workspace</p>
                                        <Link
                                            href={route('platform.workspaces.show', { workspace: subscription.workspace.id })}
                                            className="flex items-center gap-2 text-sm font-medium text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300"
                                        >
                                            <Building2 className="h-4 w-4" />
                                            {subscription.workspace.name}
                                        </Link>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500 dark:text-gray-400">Plan</p>
                                        <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                            {subscription.plan.name}
                                        </p>
                                        <p className="text-xs text-gray-500 dark:text-gray-400">
                                            {subscription.plan.key}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500 dark:text-gray-400">Status</p>
                                        {getStatusBadge(subscription.status)}
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500 dark:text-gray-400">Started</p>
                                        <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                            {formatDate(subscription.started_at)}
                                        </p>
                                    </div>
                                    {subscription.trial_ends_at && (
                                        <div>
                                            <p className="text-sm text-gray-500 dark:text-gray-400">Trial Ends</p>
                                            <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                                {formatDate(subscription.trial_ends_at)}
                                            </p>
                                        </div>
                                    )}
                                    {subscription.current_period_end && (
                                        <div>
                                            <p className="text-sm text-gray-500 dark:text-gray-400">Period End</p>
                                            <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                                {formatDate(subscription.current_period_end)}
                                            </p>
                                        </div>
                                    )}
                                    {subscription.cancel_at_period_end && (
                                        <div>
                                            <p className="text-sm text-gray-500 dark:text-gray-400">Cancellation</p>
                                            <p className="text-sm font-medium text-red-600 dark:text-red-400">
                                                Will cancel at period end
                                            </p>
                                        </div>
                                    )}
                                    {subscription.canceled_at && (
                                        <div>
                                            <p className="text-sm text-gray-500 dark:text-gray-400">Canceled At</p>
                                            <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                                {formatDate(subscription.canceled_at)}
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Usage & Limits</CardTitle>
                                <CardDescription>
                                    Current usage against plan limits
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div>
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                            Messages Sent
                                        </span>
                                        <span className="text-sm text-gray-500 dark:text-gray-400">
                                            {subscription.usage.messages_sent.toLocaleString()} / {formatLimit(subscription.limits.messages_monthly || 0)}
                                        </span>
                                    </div>
                                    <div className="w-full bg-gray-200 rounded-full h-2 dark:bg-gray-700">
                                        <div
                                            className="bg-blue-600 h-2 rounded-full"
                                            style={{
                                                width: `${getUsagePercentage(
                                                    subscription.usage.messages_sent,
                                                    subscription.limits.messages_monthly || 0
                                                )}%`
                                            }}
                                        />
                                    </div>
                                </div>

                                <div>
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                            Template Sends
                                        </span>
                                        <span className="text-sm text-gray-500 dark:text-gray-400">
                                            {subscription.usage.template_sends.toLocaleString()} / {formatLimit(subscription.limits.template_sends_monthly || 0)}
                                        </span>
                                    </div>
                                    <div className="w-full bg-gray-200 rounded-full h-2 dark:bg-gray-700">
                                        <div
                                            className="bg-blue-600 h-2 rounded-full"
                                            style={{
                                                width: `${getUsagePercentage(
                                                    subscription.usage.template_sends,
                                                    subscription.limits.template_sends_monthly || 0
                                                )}%`
                                            }}
                                        />
                                    </div>
                                </div>

                                {subscription.limits.ai_credits_monthly !== undefined && (
                                    <div>
                                        <div className="flex items-center justify-between mb-2">
                                            <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                                AI Credits Used
                                            </span>
                                            <span className="text-sm text-gray-500 dark:text-gray-400">
                                                {subscription.usage.ai_credits_used.toLocaleString()} / {formatLimit(subscription.limits.ai_credits_monthly || 0)}
                                            </span>
                                        </div>
                                        <div className="w-full bg-gray-200 rounded-full h-2 dark:bg-gray-700">
                                            <div
                                                className="bg-blue-600 h-2 rounded-full"
                                                style={{
                                                    width: `${getUsagePercentage(
                                                        subscription.usage.ai_credits_used,
                                                        subscription.limits.ai_credits_monthly || 0
                                                    )}%`
                                                }}
                                            />
                                        </div>
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Plan Limits</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <p className="text-sm text-gray-500 dark:text-gray-400">Agents</p>
                                        <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                            {formatLimit(subscription.limits.agents || 0)}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500 dark:text-gray-400">WhatsApp Connections</p>
                                        <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                            {formatLimit(subscription.limits.whatsapp_connections || 0)}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500 dark:text-gray-400">Messages Monthly</p>
                                        <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                            {formatLimit(subscription.limits.messages_monthly || 0)}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500 dark:text-gray-400">Template Sends Monthly</p>
                                        <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                            {formatLimit(subscription.limits.template_sends_monthly || 0)}
                                        </p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </PlatformShell>
    );
}
