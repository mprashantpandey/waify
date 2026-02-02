import { Head, Link } from '@inertiajs/react';
import PlatformShell from '@/Layouts/PlatformShell';
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/UI/Card';
import { Badge } from '@/Components/UI/Badge';
import { Input } from '@/Components/UI/Input';
import { Label } from '@/Components/UI/Label';
import { useToast } from '@/hooks/useToast';
import { FileText, Search, Building2 } from 'lucide-react';
import { usePage } from '@inertiajs/react';
import { useEffect } from 'react';

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
    current_period_end: string | null;
    usage: {
        messages_sent: number;
        template_sends: number;
    };
    started_at: string;
}

interface PaginatedSubscriptions {
    data: Subscription[];
    links: any[];
    meta: {
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
    };
}

export default function SubscriptionsIndex({ 
    subscriptions, 
    filters 
}: { 
    subscriptions: PaginatedSubscriptions;
    filters: { status?: string };
}) {
    const { auth, flash } = usePage().props as any;
    const { addToast } = useToast();

    useEffect(() => {
        if (flash?.success) {
            addToast({
                title: 'Success',
                description: flash.success,
                variant: 'success',
            });
        }
        if (flash?.error) {
            addToast({
                title: 'Error',
                description: flash.error,
                variant: 'error',
            });
        }
    }, [flash, addToast]);

    const getStatusBadge = (status: string) => {
        const variants: Record<string, 'success' | 'warning' | 'danger' | 'info' | 'default'> = {
            active: 'success',
            trialing: 'info',
            past_due: 'warning',
            canceled: 'danger',
        };
        return <Badge variant={variants[status] || 'default'}>{status}</Badge>;
    };

    const formatDate = (dateString: string | null) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleDateString();
    };

    return (
        <PlatformShell auth={auth}>
            <Head title="Subscriptions" />
            <div className="space-y-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Subscriptions</h1>
                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                        View and manage all workspace subscriptions
                    </p>
                </div>

                <Card>
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <CardTitle>All Subscriptions</CardTitle>
                            <div className="flex items-center gap-4">
                                <div className="flex items-center gap-2">
                                    <Label htmlFor="status-filter" className="text-sm">Status:</Label>
                                    <select
                                        id="status-filter"
                                        value={filters?.status || ''}
                                        onChange={(e) => {
                                            const url = new URL(window.location.href);
                                            if (e.target.value) {
                                                url.searchParams.set('status', e.target.value);
                                            } else {
                                                url.searchParams.delete('status');
                                            }
                                            window.location.href = url.toString();
                                        }}
                                        className="rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100"
                                    >
                                        <option value="">All</option>
                                        <option value="active">Active</option>
                                        <option value="trialing">Trialing</option>
                                        <option value="past_due">Past Due</option>
                                        <option value="canceled">Canceled</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        {subscriptions.data.length === 0 ? (
                            <div className="py-12 text-center">
                                <FileText className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                                <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                                    No subscriptions found
                                </h3>
                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                    {filters?.status 
                                        ? `No subscriptions with status "${filters.status}"`
                                        : 'No subscriptions have been created yet.'}
                                </p>
                            </div>
                        ) : (
                            <>
                                <div className="overflow-x-auto">
                                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-800">
                                        <thead className="bg-gray-50 dark:bg-gray-900">
                                            <tr>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                                    Workspace
                                                </th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                                    Plan
                                                </th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                                    Status
                                                </th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                                    Usage
                                                </th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                                    Period End
                                                </th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                                    Started
                                                </th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                                    Actions
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                                            {subscriptions.data.map((subscription) => (
                                                <tr key={subscription.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <Link
                                                            href={route('platform.subscriptions.show', { subscription: subscription.slug })}
                                                            className="flex items-center gap-2 text-sm font-medium text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300"
                                                        >
                                                            <Building2 className="h-4 w-4" />
                                                            {subscription.workspace.name}
                                                        </Link>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <div className="text-sm text-gray-900 dark:text-gray-100">
                                                            {subscription.plan.name}
                                                        </div>
                                                        <div className="text-xs text-gray-500 dark:text-gray-400">
                                                            {subscription.plan.key}
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        {getStatusBadge(subscription.status)}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                                                        <div>Messages: {subscription.usage.messages_sent}</div>
                                                        <div>Templates: {subscription.usage.template_sends}</div>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                                        {formatDate(subscription.current_period_end)}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                                        {formatDate(subscription.started_at)}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                                                        <Link
                                                            href={route('platform.subscriptions.show', { subscription: subscription.slug })}
                                                            className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300"
                                                        >
                                                            View Details
                                                        </Link>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>

                                {/* Pagination */}
                                {subscriptions.meta && subscriptions.meta.last_page > 1 && (
                                    <div className="mt-4 flex items-center justify-between">
                                        <div className="text-sm text-gray-700 dark:text-gray-300">
                                            Showing {subscriptions.meta.per_page * (subscriptions.meta.current_page - 1) + 1} to{' '}
                                            {Math.min(subscriptions.meta.per_page * subscriptions.meta.current_page, subscriptions.meta.total)} of{' '}
                                            {subscriptions.meta.total} results
                                        </div>
                                        <div className="flex gap-2">
                                            {subscriptions.links && subscriptions.links.map((link: any, index: number) => (
                                                link.url ? (
                                                    <Link
                                                        key={index}
                                                        href={link.url}
                                                        className={`px-3 py-2 rounded-md text-sm ${
                                                            link.active
                                                                ? 'bg-blue-600 text-white'
                                                                : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                                                        }`}
                                                        dangerouslySetInnerHTML={{ __html: link.label }}
                                                    />
                                                ) : (
                                                    <span
                                                        key={index}
                                                        className="px-3 py-2 rounded-md text-sm opacity-50 cursor-not-allowed bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300"
                                                        dangerouslySetInnerHTML={{ __html: link.label }}
                                                    />
                                                )
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </>
                        )}
                    </CardContent>
                </Card>
            </div>
        </PlatformShell>
    );
}
