import { Link } from '@inertiajs/react';
import AppShell from '@/Layouts/AppShell';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/Components/UI/Card';
import { Badge } from '@/Components/UI/Badge';
import { Head } from '@inertiajs/react';

interface Payment {
    id: number;
    provider: string;
    provider_order_id: string;
    provider_payment_id: string | null;
    amount: number;
    currency: string;
    status: string;
    plan: { id: number; name: string } | null;
    created_at: string;
    paid_at: string | null;
    failed_at: string | null;
}

export default function BillingHistory({
    workspace,
    payments,
}: {
    workspace: any;
    payments: Payment[];
}) {
    const formatAmount = (amount: number, currency: string) => {
        const major = amount / 100;
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency,
            minimumFractionDigits: 0,
        }).format(major);
    };

    const statusBadge = (status: string) => {
        const map: Record<string, { label: string; variant: 'success' | 'warning' | 'danger' | 'default' }> = {
            created: { label: 'Created', variant: 'default' },
            paid: { label: 'Paid', variant: 'success' },
            failed: { label: 'Failed', variant: 'danger' },
        };
        const config = map[status] || { label: status, variant: 'default' as const };
        return <Badge variant={config.variant}>{config.label}</Badge>;
    };

    return (
        <AppShell>
            <Head title="Payment History" />
            <div className="space-y-8">
                <div>
                    <Link
                        href={route('app.billing.index', { workspace: workspace.slug })}
                        className="inline-flex items-center gap-2 text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors mb-4"
                    >
                        ← Back to Billing
                    </Link>
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-gray-100 dark:to-gray-300 bg-clip-text text-transparent">
                        Payment History
                    </h1>
                    <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                        Recent payment orders and status updates
                    </p>
                </div>

                <Card className="border-0 shadow-lg">
                    <CardHeader className="bg-gradient-to-r from-gray-50 to-white dark:from-gray-800 dark:to-gray-900">
                        <CardTitle className="text-xl font-bold">Recent Payments</CardTitle>
                        <CardDescription>Last 50 payment orders</CardDescription>
                    </CardHeader>
                    <CardContent className="p-0">
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                            Plan
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                            Amount
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                            Status
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                            Provider
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                            Order ID
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                            Paid At
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200 dark:divide-gray-800 bg-white dark:bg-gray-900">
                                    {payments.length === 0 && (
                                        <tr>
                                            <td colSpan={6} className="px-6 py-8 text-center text-sm text-gray-500 dark:text-gray-400">
                                                No payments recorded yet.
                                            </td>
                                        </tr>
                                    )}
                                    {payments.map((payment) => (
                                        <tr key={payment.id}>
                                            <td className="px-6 py-4 text-sm font-medium text-gray-900 dark:text-gray-100">
                                                {payment.plan?.name ?? 'Unknown'}
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-700 dark:text-gray-300">
                                                {formatAmount(payment.amount, payment.currency)}
                                            </td>
                                            <td className="px-6 py-4 text-sm">{statusBadge(payment.status)}</td>
                                            <td className="px-6 py-4 text-sm text-gray-700 dark:text-gray-300">
                                                {payment.provider}
                                            </td>
                                            <td className="px-6 py-4 text-xs font-mono text-gray-600 dark:text-gray-400">
                                                {payment.provider_order_id}
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-700 dark:text-gray-300">
                                                {payment.paid_at ? new Date(payment.paid_at).toLocaleString() : '—'}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </AppShell>
    );
}
