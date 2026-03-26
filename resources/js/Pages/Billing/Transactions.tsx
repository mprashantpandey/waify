import { FormEvent, useMemo, useState } from 'react';
import { Link, router, usePage } from '@inertiajs/react';
import AppShell from '@/Layouts/AppShell';
import { Head } from '@inertiajs/react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/Components/UI/Card';
import { Badge } from '@/Components/UI/Badge';
import Button from '@/Components/UI/Button';
import { Alert } from '@/Components/UI/Alert';
import { useNotifications } from '@/hooks/useNotifications';
import { AlertCircle } from 'lucide-react';

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
    account,
    wallet,
    transactions,
}: {
    account: any;
    wallet: WalletSummary;
    transactions: TransactionRow[];
}) {
    const { auth } = usePage().props as any;
    const { toast } = useNotifications();
    const isOwner = Number(account?.owner_id) === Number(auth?.user?.id);
    const [topupAmountMajor, setTopupAmountMajor] = useState<string>('');
    const [topupNotes, setTopupNotes] = useState<string>('');
    const [selectedTx, setSelectedTx] = useState<TransactionRow | null>(null);

    const formatMoney = (minor: number, currency: string) =>
        new Intl.NumberFormat('en-IN', { style: 'currency', currency: currency || 'INR' }).format((minor || 0) / 100);

    const sourceLabel = (source: string) => {
        const map: Record<string, string> = {
            subscription_payment: 'Subscription Payment',
            wallet_topup: 'Wallet Top-up',
            wallet_adjustment: 'Wallet Adjustment',
            billing_proration_charge: 'Proration Charge',
            billing_proration_credit: 'Proration Credit',
        };
        return map[source] || source.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
    };

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
        if (!isOwner) {
            toast.error('Owner action required', 'Only the account owner can add wallet credits.');
            return;
        }
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
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                        <Link href={route('app.billing.index')} className="text-sm text-gray-500 hover:text-gray-700">
                            ← Back to Billing
                        </Link>
                        <h1 className="mt-2 text-2xl font-semibold text-gray-900 dark:text-gray-100">Transactions</h1>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Payments and wallet activity.</p>
                    </div>
                    <div className="text-left sm:text-right">
                        <p className="text-xs text-gray-500 dark:text-gray-400">Wallet Balance</p>
                        <p className="text-xl font-semibold text-gray-900 dark:text-gray-100">{formatMoney(wallet.balance_minor, wallet.currency)}</p>
                    </div>
                </div>

                <div className="grid gap-4 md:grid-cols-3">
                    <Card className="border border-gray-200 shadow-sm dark:border-gray-800">
                        <CardContent className="pt-5">
                            <p className="text-xs text-gray-500">Total</p>
                            <p className="text-2xl font-semibold">{groupedCounts.total}</p>
                        </CardContent>
                    </Card>
                    <Card className="border border-gray-200 shadow-sm dark:border-gray-800">
                        <CardContent className="pt-5">
                            <p className="text-xs text-gray-500">Success</p>
                            <p className="text-2xl font-semibold text-emerald-600">{groupedCounts.success}</p>
                        </CardContent>
                    </Card>
                    <Card className="border border-gray-200 shadow-sm dark:border-gray-800">
                        <CardContent className="pt-5">
                            <p className="text-xs text-gray-500">Failed</p>
                            <p className="text-2xl font-semibold text-red-600">{groupedCounts.failed}</p>
                        </CardContent>
                    </Card>
                </div>

                {!isOwner && (
                    <Alert variant="warning" className="border-yellow-200 dark:border-yellow-800">
                        <AlertCircle className="h-5 w-5" />
                        <div className="flex-1">
                            <h3 className="font-semibold text-yellow-800 dark:text-yellow-200">Owner approval required</h3>
                            <p className="mt-1 text-sm text-yellow-700 dark:text-yellow-300">
                                You can inspect payment and wallet history here. Only the account owner can create wallet top-ups or complete checkout actions.
                            </p>
                            <div className="mt-3 flex flex-wrap gap-2">
                                <Link href={route('app.billing.index', {})}>
                                    <Button variant="secondary" size="sm">View Billing Recovery</Button>
                                </Link>
                                <Link href={route('app.billing.plans', {})}>
                                    <Button variant="secondary" size="sm">View Plans</Button>
                                </Link>
                            </div>
                        </div>
                    </Alert>
                )}

                <Card className="border border-gray-200 shadow-sm dark:border-gray-800">
                    <CardHeader className="border-b border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900">
                        <CardTitle className="text-lg font-semibold">Wallet top-up</CardTitle>
                        <CardDescription>
                            {isOwner
                                ? 'Add wallet credits (if enabled by platform admin)'
                                : 'Wallet top-up is restricted to the account owner'}
                        </CardDescription>
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
                                    disabled={!isOwner}
                                    className="mt-1 w-44 rounded-md border-gray-300 dark:border-gray-700 dark:bg-gray-900"
                                />
                            </div>
                            <div className="flex-1 min-w-[220px]">
                                <label className="text-xs text-gray-500">Notes</label>
                                <input
                                    type="text"
                                    value={topupNotes}
                                    onChange={(e) => setTopupNotes(e.target.value)}
                                    disabled={!isOwner}
                                    className="mt-1 w-full rounded-md border-gray-300 dark:border-gray-700 dark:bg-gray-900"
                                />
                            </div>
                            <Button type="submit" disabled={!isOwner}>{isOwner ? 'Add Credits' : 'Owner Only'}</Button>
                        </form>
                    </CardContent>
                </Card>

                <Card className="border border-gray-200 shadow-sm dark:border-gray-800">
                    <CardHeader className="border-b border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900">
                        <CardTitle className="text-lg font-semibold">Transaction history</CardTitle>
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
                                        <th className="px-4 py-3 text-left">Details</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {transactions.length === 0 && (
                                        <tr>
                                            <td colSpan={8} className="px-4 py-6 text-center text-gray-500">
                                                No transactions found.
                                            </td>
                                        </tr>
                                    )}
                                    {transactions.map((tx, idx) => (
                                        <tr key={`${tx.type}-${tx.id}-${idx}`} className="border-t border-gray-200 dark:border-gray-800">
                                            <td className="px-4 py-3">{tx.type}</td>
                                            <td className="px-4 py-3">{tx.direction}</td>
                                            <td className="px-4 py-3 font-medium">{formatMoney(tx.amount_minor, tx.currency)}</td>
                                            <td className="px-4 py-3">{sourceLabel(tx.source)}</td>
                                            <td className="px-4 py-3">
                                                <Badge variant={tx.status === 'failed' ? 'danger' : tx.status === 'success' || tx.status === 'paid' ? 'success' : 'default'}>
                                                    {tx.status}
                                                </Badge>
                                            </td>
                                            <td className="px-4 py-3 text-xs font-mono">{tx.reference || '—'}</td>
                                            <td className="px-4 py-3">{new Date(tx.created_at).toLocaleString()}</td>
                                            <td className="px-4 py-3">
                                                <button
                                                    type="button"
                                                    className="text-blue-600 hover:underline"
                                                    onClick={() => setSelectedTx(tx)}
                                                >
                                                    View
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </CardContent>
                </Card>

                {selectedTx && (
                    <Card className="border border-gray-200 shadow-sm dark:border-gray-800">
                        <CardHeader className="border-b border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900">
                            <CardTitle className="text-lg font-semibold">Transaction details</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2 text-sm">
                            <p><span className="text-gray-500">Type:</span> {selectedTx.type}</p>
                            <p><span className="text-gray-500">Direction:</span> {selectedTx.direction}</p>
                            <p><span className="text-gray-500">Amount:</span> {formatMoney(selectedTx.amount_minor, selectedTx.currency)}</p>
                            <p><span className="text-gray-500">Status:</span> {selectedTx.status}</p>
                            <p><span className="text-gray-500">Source:</span> {sourceLabel(selectedTx.source)}</p>
                            <p><span className="text-gray-500">Reference:</span> <span className="font-mono">{selectedTx.reference || 'N/A'}</span></p>
                            <p><span className="text-gray-500">Notes:</span> {selectedTx.notes || 'N/A'}</p>
                            <p><span className="text-gray-500">Created:</span> {new Date(selectedTx.created_at).toLocaleString()}</p>
                            <div className="pt-2">
                                <Button variant="secondary" size="sm" onClick={() => setSelectedTx(null)}>Close</Button>
                            </div>
                        </CardContent>
                    </Card>
                )}
            </div>
        </AppShell>
    );
}
