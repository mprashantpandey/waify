import PlatformShell from '@/Layouts/PlatformShell';
import { Head, usePage } from '@inertiajs/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/UI/Card';
import { Badge } from '@/Components/UI/Badge';

export default function PlatformTransactionsIndex({ transactions = [] }: any) {
    const { auth } = usePage().props as any;

    const amount = (minor: number, currency: string) =>
        new Intl.NumberFormat('en-IN', { style: 'currency', currency: currency || 'INR' }).format((minor || 0) / 100);

    return (
        <PlatformShell auth={auth}>
            <Head title="Transactions" />
            <Card>
                <CardHeader>
                    <CardTitle>Transactions (Success + Failed)</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead className="bg-gray-50 dark:bg-gray-900">
                                <tr>
                                    <th className="px-4 py-3 text-left">Type</th>
                                    <th className="px-4 py-3 text-left">Account</th>
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
                                        <td colSpan={8} className="px-4 py-6 text-center text-gray-500">No transactions</td>
                                    </tr>
                                )}
                                {transactions.map((tx: any) => (
                                    <tr key={tx.id} className="border-t border-gray-200 dark:border-gray-800">
                                        <td className="px-4 py-3">{tx.kind}</td>
                                        <td className="px-4 py-3">{tx.account?.name || '—'}</td>
                                        <td className="px-4 py-3">{tx.direction}</td>
                                        <td className="px-4 py-3 font-medium">{amount(tx.amount_minor, tx.currency)}</td>
                                        <td className="px-4 py-3">{tx.source}</td>
                                        <td className="px-4 py-3">
                                            <Badge variant={tx.status === 'success' || tx.status === 'paid' ? 'success' : tx.status === 'failed' ? 'danger' : 'default'}>
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
        </PlatformShell>
    );
}
