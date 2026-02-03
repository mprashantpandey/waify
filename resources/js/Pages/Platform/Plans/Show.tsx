import { Head, Link } from '@inertiajs/react';
import PlatformShell from '@/Layouts/PlatformShell';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/Components/UI/Card';
import Button from '@/Components/UI/Button';
import { Badge } from '@/Components/UI/Badge';
import { ArrowLeft, Edit, Building2, Users, CreditCard, Infinity } from 'lucide-react';
import { usePage } from '@inertiajs/react';

interface Subscription {
    id: number;
    account: {
        id: number;
        name: string;
        slug: string;
    };
    status: string;
    started_at: string;
}

interface Plan {
    id: number;
    key: string;
    name: string;
    description: string | null;
    price_monthly: number | null;
    price_yearly: number | null;
    currency: string;
    is_active: boolean;
    is_public: boolean;
    trial_days: number;
    sort_order: number;
    limits: Record<string, number>;
    modules: string[];
    subscriptions: Subscription[];
}

interface PlansShowProps {
    plan: Plan;
    moduleNames?: Record<string, string>;
}

export default function PlansShow({ plan, moduleNames = {} }: PlansShowProps) {
    const { auth } = usePage().props as any;

    const formatPrice = (amount: number | null, currency: string) => {
        if (amount === null || amount === 0) return 'Free';
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: currency || 'USD'}).format(amount / 100);
    };

    const formatLimit = (value: number) => {
        if (value === -1) return <span className="flex items-center gap-1"><Infinity className="h-4 w-4" /> Unlimited</span>;
        return value.toLocaleString();
    };

    const getStatusBadge = (status: string) => {
        const variants: Record<string, 'success' | 'warning' | 'danger' | 'info' | 'default'> = {
            active: 'success',
            trialing: 'info',
            past_due: 'warning',
            canceled: 'danger'};
        return <Badge variant={variants[status] || 'default'}>{status}</Badge>;
    };

    return (
        <PlatformShell auth={auth}>
            <Head title={`Plan: ${plan.name}`} />
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link href={route('platform.plans.index')}>
                            <Button variant="ghost" size="sm">
                                <ArrowLeft className="h-4 w-4 mr-2" />
                                Back to Plans
                            </Button>
                        </Link>
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">{plan.name}</h1>
                            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                                {plan.description || 'No description'}
                            </p>
                        </div>
                    </div>
                    <Link href={route('platform.plans.edit', { plan: plan.key })}>
                        <Button>
                            <Edit className="h-4 w-4 mr-2" />
                            Edit Plan
                        </Button>
                    </Link>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2 space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Plan Details</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <p className="text-sm text-gray-500 dark:text-gray-400">Plan Key</p>
                                        <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{plan.key}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500 dark:text-gray-400">Status</p>
                                        <Badge variant={plan.is_active ? 'success' : 'default'}>
                                            {plan.is_active ? 'Active' : 'Inactive'}
                                        </Badge>
                                        {plan.is_public && (
                                            <Badge variant="info" className="ml-2">Public</Badge>
                                        )}
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500 dark:text-gray-400">Trial Days</p>
                                        <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{plan.trial_days}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500 dark:text-gray-400">Sort Order</p>
                                        <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{plan.sort_order}</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Pricing</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <p className="text-sm text-gray-500 dark:text-gray-400">Monthly</p>
                                        <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                                            {formatPrice(plan.price_monthly, plan.currency)}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500 dark:text-gray-400">Yearly</p>
                                        <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                                            {formatPrice(plan.price_yearly, plan.currency)}
                                        </p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Limits</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <p className="text-sm text-gray-500 dark:text-gray-400">Agents</p>
                                        <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                            {formatLimit(plan.limits.agents || 0)}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500 dark:text-gray-400">WhatsApp Connections</p>
                                        <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                            {formatLimit(plan.limits.whatsapp_connections || 0)}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500 dark:text-gray-400">Messages Monthly</p>
                                        <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                            {formatLimit(plan.limits.messages_monthly || 0)}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500 dark:text-gray-400">Template Sends Monthly</p>
                                        <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                            {formatLimit(plan.limits.template_sends_monthly || 0)}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500 dark:text-gray-400">AI Credits Monthly</p>
                                        <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                            {formatLimit(plan.limits.ai_credits_monthly || 0)}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500 dark:text-gray-400">Data Retention (Days)</p>
                                        <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                            {formatLimit(plan.limits.retention_days || 0)}
                                        </p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Modules</CardTitle>
                            </CardHeader>
                            <CardContent>
                                {plan.modules && plan.modules.length > 0 ? (
                                    <div className="flex flex-wrap gap-2">
                                        {plan.modules.map((moduleKey) => (
                                            <Badge key={moduleKey} variant="info">
                                                {moduleNames[moduleKey] || moduleKey}
                                            </Badge>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-sm text-gray-500 dark:text-gray-400">No modules included</p>
                                )}
                            </CardContent>
                        </Card>
                    </div>

                    <div>
                        <Card>
                            <CardHeader>
                                <CardTitle>Subscriptions</CardTitle>
                                <CardDescription>
                                    {plan.subscriptions.length} tenant{plan.subscriptions.length !== 1 ? 's' : ''} using this plan
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                {plan.subscriptions.length === 0 ? (
                                    <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-4">
                                        No subscriptions yet
                                    </p>
                                ) : (
                                    <div className="space-y-3">
                                        {plan.subscriptions.map((subscription) => (
                                            <Link
                                                key={subscription.id}
                                                href={route('platform.accounts.show', { account: subscription.account.id })}
                                                className="block p-3 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                                            >
                                                <div className="flex items-center justify-between mb-2">
                                                    <div className="flex items-center gap-2">
                                                        <Building2 className="h-4 w-4 text-gray-400" />
                                                        <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                                            {subscription.account.name}
                                                        </span>
                                                    </div>
                                                    {getStatusBadge(subscription.status)}
                                                </div>
                                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                                    Started {new Date(subscription.started_at).toLocaleDateString()}
                                                </p>
                                            </Link>
                                        ))}
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </PlatformShell>
    );
}
