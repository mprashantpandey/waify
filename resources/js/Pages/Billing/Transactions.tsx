import { FormEvent, useMemo, useState } from 'react';
import { Link, router } from '@inertiajs/react';
import AppShell from '@/Layouts/AppShell';
import { Head } from '@inertiajs/react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/Components/UI/Card';
import { Badge } from '@/Components/UI/Badge';
import Button from '@/Components/UI/Button';
import { useNotifications } from '@/hooks/useNotifications';

interface WalletSummary {
    balance_minor: number;
    currency: string;
}

interface TransactionRow {
    type: 'payment' | 'wallet';
    id: number;
    direction: 'credit' | 'debit';
    amount_minor: number;
    currency: string;
    status: string;
    source: string;
    reference: string | null;
    notes: string | null;
    created_at: string;
}

export default function BillingTransactions({
    wallet,
    transactions,
}: {
    account: any;
    wallet: WalletSummary;
    transactions: TransactionRow[];
}) {
    const { toast } = useNotifications();
    const [topupAmountMajor, setTopupAmountMajor] = useState<string>('');
    const [topupNotes, setTopupNotes] = useState<string>('');

    const formatMoney = (minor: number, currency: string) =>
        new Intl.NumberFormat('en-IN', { style: 'currency', currency: currency || 'INR' }).format((minor || 0) / 100);

    const groupedCounts = useMemo(() => {
        return transactions.reduce(
            (acc, tx) => {
                acc.total += 1;
                if (tx.status === 'failed') acc.failed += 1;
                if (tx.status === 'success' || tx.status === 'paid') acc.success += 1;
                return acc;
            },
            { total: 0, success: 0, failed: 0 }
        );
    }, [transactions]);

    const loadRazorpayScript = async (): Promise<boolean> => {
        if ((window as any).Razorpay) {
            return true;
        }
        return new Promise((resolve) => {
            const script = document.createElement('script');
            script.src = 'https://checkout.razorpay.com/v1/checkout.js';
            script.async = true;
            script.onload = () => resolve(true);
            script.onerror = () => resolve(false);
            document.body.appendChild(script);
        });
    };

    const submitTopup = async (e: FormEvent) => {
        e.preventDefault();
        const major = Number(topupAmountMajor);
        if (!Number.isFinite(major) || major <= 0) {
            toast.error('Invalid amount', 'Enter a valid top-up amount.');
            return;
        }

        const scriptLoaded = await loadRazorpayScript();
        if (!scriptLoaded) {
            toast.error('Payment gateway unavailable', 'Unable to load Razorpay checkout script.');
            return;
        }

        const amountMinor = Math.round(major * 100);

        try {
            const orderResponse = await window.axios.post(route('app.billing.wallet.topup'), {
                amount_minor: amountMinor,
                notes: topupNotes || undefined,
            });

            const order = orderResponse?.data;
            if (!order?.order_id || !order?.key_id) {
                throw new Error('Invalid top-up order response');
            }

            const options = {
                key: order.key_id,
                amount: order.amount,
                currency: order.currency || 'INR',
                name: 'Wallet Top-up',
                description: 'Add credits to wallet',
                order_id: order.order_id,
                handler: async (response: any) => {
                    await window.axios.post(route('app.billing.wallet.topup.confirm'), {
                        order_id: response.razorpay_order_id,
                        payment_id: response.razorpay_payment_id,
                        signature: response.razorpay_signature,
                    });
                    toast.success('Top-up successful', 'Wallet balance has been updated.');
                    router.reload({ only: ['wallet', 'transactions'] });
                },
                modal: {
                    ondismiss: () => {
                        toast.warning('Top-up cancelled', 'Payment was cancelled before completion.');
                    },
                },
            };

            const razorpay = new (window as any).Razorpay(options);
            razorpay.on('payment.failed', (response: any) => {
                toast.error('Top-up failed', response?.error?.description || 'Payment failed.');
            });
            razorpay.open();
        } catch (error: any) {
            toast.error('Top-up failed', error?.response?.data?.message || error?.message || 'Could not create top-up order.');
        }
    };

    return (
        <AppShell>
            <Head title="Transactions" />
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <Link href={route('app.billing.index')} className="text-sm text-gray-500 hover:text-gray-700">
                            ← Back to Billing
                        </Link>
                        <h1 className="mt-2 text-2xl font-bold text-gray-900 dark:text-gray-100">Transactions</h1>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Payment and wallet activity (success + failed)</p>
                    </div>
                    <div className="text-right">
                        <p className="text-xs text-gray-500 dark:text-gray-400">Wallet Balance</p>
                        <p className="text-xl font-semibold text-gray-900 dark:text-gray-100">{formatMoney(wallet.balance_minor, wallet.currency)}</p>
                    </div>
                </div>

                <div className="grid gap-4 md:grid-cols-3">
                    <Card>
                        <CardContent className="pt-5">
                            <p className="text-xs text-gray-500">Total</p>
                            <p className="text-2xl font-semibold">{groupedCounts.total}</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="pt-5">
                            <p className="text-xs text-gray-500">Success</p>
                            <p className="text-2xl font-semibold text-emerald-600">{groupedCounts.success}</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="pt-5">
                            <p className="text-xs text-gray-500">Failed</p>
                            <p className="text-2xl font-semibold text-red-600">{groupedCounts.failed}</p>
                        </CardContent>
                    </Card>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Wallet Top-up</CardTitle>
                        <CardDescription>Add wallet credits (if enabled by platform admin)</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form className="flex flex-wrap items-end gap-3" onSubmit={submitTopup}>
                            <div>
                                <label className="text-xs text-gray-500">Amount ({wallet.currency})</label>
                                <input
                                    type="number"
                                    min="0.01"
                                    step="0.01"
                                    value={topupAmountMajor}
                                    onChange={(e) => setTopupAmountMajor(e.target.value)}
                                    className="mt-1 w-44 rounded-md border-gray-300 dark:border-gray-700 dark:bg-gray-900"
                                />
                            </div>
                            <div className="flex-1 min-w-[220px]">
                                <label className="text-xs text-gray-500">Notes</label>
                                <input
                                    type="text"
                                    value={topupNotes}
                                    onChange={(e) => setTopupNotes(e.target.value)}
                                    className="mt-1 w-full rounded-md border-gray-300 dark:border-gray-700 dark:bg-gray-900"
                                />
                            </div>
                            <Button type="submit">Add Credits</Button>
                        </form>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Transaction History</CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead className="bg-gray-50 dark:bg-gray-900">
                                    <tr>
                                        <th className="px-4 py-3 text-left">Type</th>
                                        <th className="px-4 py-3 text-left">Direction</th>
                                        <th className="px-4 py-3 text-left">Amount</th>
                                        <th className="px-4 py-3 text-left">Source</th>
                                        <th className="px-4 py-3 text-left">Status</th>
                                        <th className="px-4 py-3 text-left">Reference</th>
                                        <th className="px-4 py-3 text-left">Date</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {transactions.length === 0 && (
                                        <tr>
                                            <td colSpan={7} className="px-4 py-6 text-center text-gray-500">
                                                No transactions found.
                                            </td>
                                        </tr>
                                    )}
                                    {transactions.map((tx, idx) => (
                                        <tr key={`${tx.type}-${tx.id}-${idx}`} className="border-t border-gray-200 dark:border-gray-800">
                                            <td className="px-4 py-3">{tx.type}</td>
                                            <td className="px-4 py-3">{tx.direction}</td>
                                            <td className="px-4 py-3 font-medium">{formatMoney(tx.amount_minor, tx.currency)}</td>
                                            <td className="px-4 py-3">{tx.source}</td>
                                            <td className="px-4 py-3">
                                                <Badge variant={tx.status === 'failed' ? 'danger' : tx.status === 'success' || tx.status === 'paid' ? 'success' : 'default'}>
                                                    {tx.status}
                                                </Badge>
                                            </td>
                                            <td className="px-4 py-3 text-xs font-mono">{tx.reference || '—'}</td>
                                            <td className="px-4 py-3">{new Date(tx.created_at).toLocaleString()}</td>
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
