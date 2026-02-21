import { Head, Link, router, usePage } from '@inertiajs/react';
import { useMemo, useState } from 'react';
import PlatformShell from '@/Layouts/PlatformShell';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/Components/UI/Card';
import { Badge } from '@/Components/UI/Badge';
import { Label } from '@/Components/UI/Label';
import { Filter, Building2, Search } from 'lucide-react';
import { Input } from '@/Components/UI/Input';

interface TransactionRow {
    id: string;
    kind: 'wallet' | 'payment';
    account: { id: number; name: string | null; slug: string | null };
    direction: string;
    amount_minor: number;
    currency: string;
    status: string;
    source: string;
    reference: string | null;
    notes: string | null;
    created_at: string;
}

interface PaginatedTransactions {
    data: TransactionRow[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    from: number;
    to: number;
}

interface Filters {
    account_id?: number | null;
    status?: string;
    source?: string;
    search?: string;
    per_page?: number;
}

export default function PlatformTransactionsIndex({
    transactions,
    filters,
    accounts = [],
}: {
    transactions: PaginatedTransactions;
    filters: Filters;
    accounts: Array<{ id: number; name: string; slug: string | null }>;
}) {
    const { auth } = usePage().props as any;
    const [localFilters, setLocalFilters] = useState<Filters>({
        account_id: filters?.account_id ?? undefined,
        status: filters?.status ?? '',
        source: filters?.source ?? '',
        search: filters?.search ?? '',
        per_page: filters?.per_page ?? transactions?.per_page ?? 25,
    });

    const amount = (minor: number, currency: string) =>
        new Intl.NumberFormat('en-IN', { style: 'currency', currency: currency || 'INR' }).format((minor || 0) / 100);

    const statusOptions = useMemo(() => {
        const values = new Set<string>();
        transactions?.data?.forEach((row) => {
            if (row.status) values.add(row.status);
        });
        return Array.from(values).sort();
    }, [transactions?.data]);

    const sourceOptions = useMemo(() => {
        const values = new Set<string>();
        transactions?.data?.forEach((row) => {
            if (row.source) values.add(row.source);
        });
        return Array.from(values).sort();
    }, [transactions?.data]);

    const runQuery = (next: Filters) => {
        router.get(route('platform.transactions.index'), next as any, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const applyFilters = () => {
        runQuery({ ...localFilters, page: 1 } as any);
    };

    const clearFilters = () => {
        const reset: Filters = { per_page: 25 };
        setLocalFilters(reset);
        runQuery({ ...reset, page: 1 } as any);
    };

    const gotoPage = (page: number) => {
        runQuery({ ...localFilters, page } as any);
    };

    return (
        <PlatformShell auth={auth}>
            <Head title="Transactions" />
            <div className="space-y-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Transactions</h1>
                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                        Platform-wide wallet and payment transactions
                    </p>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Filter className="h-5 w-5" />
                            DataTable Filters
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                            <div>
                                <Label htmlFor="tx-search">Search</Label>
                                <div className="relative">
                                    <Search className="h-4 w-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                                    <Input
                                        id="tx-search"
                                        className="pl-9"
                                        placeholder="Ref, source, tenant..."
                                        value={localFilters.search || ''}
                                        onChange={(e) => setLocalFilters({ ...localFilters, search: e.target.value })}
                                        onKeyDown={(e) => e.key === 'Enter' && applyFilters()}
                                    />
                                </div>
                            </div>
                            <div>
                                <Label htmlFor="tx-account">Tenant</Label>
                                <select
                                    id="tx-account"
                                    value={localFilters.account_id ?? ''}
                                    onChange={(e) =>
                                        setLocalFilters({
                                            ...localFilters,
                                            account_id: e.target.value ? Number(e.target.value) : undefined,
                                        })
                                    }
                                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100"
                                >
                                    <option value="">All Tenants</option>
                                    {accounts.map((account) => (
                                        <option key={account.id} value={account.id}>
                                            {account.name} (#{account.id})
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <Label htmlFor="tx-status">Status</Label>
                                <select
                                    id="tx-status"
                                    value={localFilters.status || ''}
                                    onChange={(e) => setLocalFilters({ ...localFilters, status: e.target.value || undefined })}
                                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100"
                                >
                                    <option value="">All Statuses</option>
                                    {statusOptions.map((status) => (
                                        <option key={status} value={status}>
                                            {status}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <Label htmlFor="tx-source">Source</Label>
                                <select
                                    id="tx-source"
                                    value={localFilters.source || ''}
                                    onChange={(e) => setLocalFilters({ ...localFilters, source: e.target.value || undefined })}
                                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100"
                                >
                                    <option value="">All Sources</option>
                                    {sourceOptions.map((source) => (
                                        <option key={source} value={source}>
                                            {source}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <Label htmlFor="tx-per-page">Rows</Label>
                                <select
                                    id="tx-per-page"
                                    value={localFilters.per_page || 25}
                                    onChange={(e) => setLocalFilters({ ...localFilters, per_page: Number(e.target.value) })}
                                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100"
                                >
                                    <option value={10}>10</option>
                                    <option value={25}>25</option>
                                    <option value={50}>50</option>
                                    <option value={100}>100</option>
                                </select>
                            </div>
                        </div>
                        <div className="mt-4 flex items-center gap-2">
                            <button
                                type="button"
                                onClick={applyFilters}
                                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                            >
                                Apply Filters
                            </button>
                            <button
                                type="button"
                                onClick={clearFilters}
                                className="px-4 py-2 bg-gray-100 text-gray-800 rounded-md hover:bg-gray-200 transition-colors dark:bg-gray-800 dark:text-gray-100 dark:hover:bg-gray-700"
                            >
                                Clear
                            </button>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Transactions DataTable</CardTitle>
                        <CardDescription>
                            {transactions.total} rows • showing {transactions.from} to {transactions.to}
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="p-0">
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-800 text-sm">
                                <thead className="bg-gray-50 dark:bg-gray-900">
                                    <tr>
                                        <th className="px-4 py-3 text-left">Type</th>
                                        <th className="px-4 py-3 text-left">Tenant</th>
                                        <th className="px-4 py-3 text-left">Direction</th>
                                        <th className="px-4 py-3 text-left">Amount</th>
                                        <th className="px-4 py-3 text-left">Source</th>
                                        <th className="px-4 py-3 text-left">Status</th>
                                        <th className="px-4 py-3 text-left">Reference</th>
                                        <th className="px-4 py-3 text-left">Date</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                                    {transactions.data.length === 0 && (
                                        <tr>
                                            <td colSpan={8} className="px-4 py-8 text-center text-gray-500">
                                                No transactions found.
                                            </td>
                                        </tr>
                                    )}
                                    {transactions.data.map((tx) => (
                                        <tr key={tx.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                                            <td className="px-4 py-3">{tx.kind}</td>
                                            <td className="px-4 py-3">
                                                <div className="flex flex-col">
                                                    {tx.account?.id ? (
                                                        <Link
                                                            href={route('platform.accounts.show', { account: tx.account.id })}
                                                            className="inline-flex items-center gap-1 text-blue-600 hover:underline dark:text-blue-400"
                                                        >
                                                            <Building2 className="h-3.5 w-3.5" />
                                                            {tx.account?.name || `Tenant #${tx.account.id}`}
                                                        </Link>
                                                    ) : (
                                                        <span>{tx.account?.name || '—'}</span>
                                                    )}
                                                    <span className="text-xs text-gray-500">#{tx.account?.id ?? '—'}</span>
                                                </div>
                                            </td>
                                            <td className="px-4 py-3">{tx.direction}</td>
                                            <td className="px-4 py-3 font-medium">{amount(tx.amount_minor, tx.currency)}</td>
                                            <td className="px-4 py-3">{tx.source || '—'}</td>
                                            <td className="px-4 py-3">
                                                <Badge
                                                    variant={
                                                        tx.status === 'success' || tx.status === 'paid'
                                                            ? 'success'
                                                            : tx.status === 'failed'
                                                            ? 'danger'
                                                            : 'default'
                                                    }
                                                >
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
                        {transactions.last_page > 1 && (
                            <div className="p-4 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between">
                                <div className="text-sm text-gray-600 dark:text-gray-300">
                                    Page {transactions.current_page} of {transactions.last_page}
                                </div>
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => gotoPage(Math.max(1, transactions.current_page - 1))}
                                        disabled={transactions.current_page <= 1}
                                        className="px-3 py-2 rounded-md text-sm bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 disabled:opacity-50"
                                    >
                                        Previous
                                    </button>
                                    <button
                                        onClick={() => gotoPage(Math.min(transactions.last_page, transactions.current_page + 1))}
                                        disabled={transactions.current_page >= transactions.last_page}
                                        className="px-3 py-2 rounded-md text-sm bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 disabled:opacity-50"
                                    >
                                        Next
                                    </button>
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </PlatformShell>
    );
}

