import { Link, usePage } from '@inertiajs/react';
import AppShell from '@/Layouts/AppShell';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/Components/UI/Card';
import { Badge } from '@/Components/UI/Badge';
import Button from '@/Components/UI/Button';
import { Alert } from '@/Components/UI/Alert';
import { Head } from '@inertiajs/react';
import { AlertCircle, CheckCircle2, Receipt, RotateCcw } from 'lucide-react';

interface Payment {
    id: number;
    invoice_no: string;
    provider: string;
    provider_order_id: string;
    provider_payment_id: string | null;
    amount: number;
    currency: string;
    status: string;
    plan: { id: number; name: string } | null;
    failure_reason?: string | null;
    created_at: string;
    paid_at: string | null;
    failed_at: string | null;
}

export default function BillingHistory({
    account,
    payments}: {
    account: any;
    payments: Payment[];
}) {
    const { auth } = usePage().props as any;
    const isOwner = Number(account?.owner_id) === Number(auth?.user?.id);

    const formatAmount = (amount: number, currency: string) => {
        const major = amount / 100;
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency,
            minimumFractionDigits: 0}).format(major);
    };

    const getEventTimestamp = (payment: Payment) => payment.paid_at || payment.failed_at || payment.created_at;

    const statusBadge = (status: string) => {
        const map: Record<string, { label: string; variant: 'success' | 'warning' | 'danger' | 'default' }> = {
            created: { label: 'Created', variant: 'default' },
            paid: { label: 'Paid', variant: 'success' },
            failed: { label: 'Failed', variant: 'danger' },
            past_due: { label: 'Past Due', variant: 'warning' }};
        const config = map[status] || { label: status, variant: 'default' as const };
        return <Badge variant={config.variant}>{config.label}</Badge>;
    };

    return (
        <AppShell>
            <Head title="Payment History" />
            <div className="space-y-8">
                <div>
                    <Link
                        href={route('app.billing.index', {})}
                        className="inline-flex items-center gap-2 text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors mb-4"
                    >
                        ← Back to Billing
                    </Link>
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-gray-100 dark:to-gray-300 bg-clip-text text-transparent">
                        Payment History
                    </h1>
                    <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                        Recent payment orders and recovery state
                    </p>
                </div>

                {!isOwner && (
                    <Alert variant="warning" className="border-yellow-200 dark:border-yellow-800">
                        <AlertCircle className="h-5 w-5" />
                        <div className="flex-1">
                            <h3 className="font-semibold text-yellow-800 dark:text-yellow-200">Owner action required for billing recovery</h3>
                            <p className="mt-1 text-sm text-yellow-700 dark:text-yellow-300">
                                You can review invoices and failure reasons here. Only the account owner can retry renewal, resume a canceled subscription, or update payment details.
                            </p>
                        </div>
                    </Alert>
                )}

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
                                        <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Invoice</th>
                                        <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Plan</th>
                                        <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Amount</th>
                                        <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
                                        <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Provider</th>
                                        <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Order ID</th>
                                        <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Event Time</th>
                                        <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Recovery</th>
                                        <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200 dark:divide-gray-800 bg-white dark:bg-gray-900">
                                    {payments.length === 0 && (
                                        <tr>
                                            <td colSpan={9} className="px-6 py-8 text-center text-sm text-gray-500 dark:text-gray-400">
                                                No payments recorded yet.
                                            </td>
                                        </tr>
                                    )}
                                    {payments.map((payment) => (
                                        <tr key={payment.id}>
                                            <td className="px-6 py-4 text-xs font-mono text-gray-700 dark:text-gray-300">{payment.invoice_no}</td>
                                            <td className="px-6 py-4 text-sm font-medium text-gray-900 dark:text-gray-100">{payment.plan?.name ?? 'Unknown'}</td>
                                            <td className="px-6 py-4 text-sm text-gray-700 dark:text-gray-300">{formatAmount(payment.amount, payment.currency)}</td>
                                            <td className="px-6 py-4 text-sm">{statusBadge(payment.status)}</td>
                                            <td className="px-6 py-4 text-sm text-gray-700 dark:text-gray-300">{payment.provider}</td>
                                            <td className="px-6 py-4 text-xs font-mono text-gray-600 dark:text-gray-400">{payment.provider_order_id}</td>
                                            <td className="px-6 py-4 text-sm text-gray-700 dark:text-gray-300">
                                                {getEventTimestamp(payment) ? new Date(getEventTimestamp(payment) as string).toLocaleString() : '—'}
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-700 dark:text-gray-300">
                                                {payment.status === 'paid' ? (
                                                    <div className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-300">
                                                        <CheckCircle2 className="h-3.5 w-3.5" />
                                                        Settled
                                                    </div>
                                                ) : (
                                                    <div className="space-y-1">
                                                        <div className="inline-flex items-center gap-2 rounded-full bg-red-50 px-3 py-1 text-xs font-medium text-red-700 dark:bg-red-900/20 dark:text-red-300">
                                                            <RotateCcw className="h-3.5 w-3.5" />
                                                            {isOwner ? 'Needs owner action' : 'Awaiting owner action'}
                                                        </div>
                                                        {payment.failure_reason && (
                                                            <p className="max-w-[240px] truncate text-xs text-red-600 dark:text-red-400" title={payment.failure_reason}>
                                                                {payment.failure_reason}
                                                            </p>
                                                        )}
                                                    </div>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 text-sm">
                                                <div className="flex flex-wrap items-center gap-2">
                                                    <Link href={route('app.billing.history.show', { paymentOrder: payment.id })}>
                                                        <Button size="sm" variant="secondary" className="rounded-lg">
                                                            <Receipt className="mr-1 h-3.5 w-3.5" />
                                                            View
                                                        </Button>
                                                    </Link>
                                                    <a href={route('app.billing.history.download', { paymentOrder: payment.id })}>
                                                        <Button size="sm" variant="secondary" className="rounded-lg">
                                                            Download
                                                        </Button>
                                                    </a>
                                                    {payment.status !== 'paid' && (
                                                        <Link href={route('app.billing.index', {})}>
                                                            <Button size="sm" variant="secondary" className="rounded-lg">
                                                                {isOwner ? 'Open Billing Recovery' : 'View Billing Recovery'}
                                                            </Button>
                                                        </Link>
                                                    )}
                                                </div>
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
