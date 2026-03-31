import { Head, router } from '@inertiajs/react';
import { FormEvent, useState } from 'react';
import AppShell from '@/Layouts/AppShell';
import { Card, CardContent } from '@/Components/UI/Card';
import TextInput from '@/Components/TextInput';
import Button from '@/Components/UI/Button';
import { Search } from 'lucide-react';

type Order = {
    id: number;
    product: { name: string } | null;
    customer_name: string | null;
    customer_phone: string | null;
    quantity: number;
    total_price: number;
    currency: string;
    status: string;
    ordered_at: string | null;
};

type Props = {
    orders: {
        data: Order[];
    };
    filters: {
        status?: string;
        search?: string;
    };
    statuses: string[];
};

export default function EcommerceOrdersIndex({ orders, filters, statuses }: Props) {
    const [search, setSearch] = useState(filters.search || '');
    const [status, setStatus] = useState(filters.status || '');

    const formatPrice = (amount: number, currency: string) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency,
            minimumFractionDigits: 0,
        }).format((amount || 0) / 100);
    };

    const submitFilters = (e: FormEvent) => {
        e.preventDefault();
        router.get(route('app.ecommerce.orders.index'), {
            status: status || undefined,
            search: search || undefined,
        }, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    return (
        <AppShell>
            <Head title="Commerce Orders" />
            <div className="space-y-6">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Orders</h1>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Track orders captured from WhatsApp commerce flows.</p>
                    </div>
                </div>

                <Card>
                    <CardContent className="p-4">
                        <form onSubmit={submitFilters} className="flex flex-col gap-3 md:flex-row">
                            <div className="relative flex-1">
                                <Search className="h-4 w-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                                <TextInput
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    className="w-full pl-9"
                                    placeholder="Search by customer, phone, or product..."
                                />
                            </div>
                            <div>
                        <select
                            value={status}
                            onChange={(e) => setStatus(e.target.value)}
                            className="rounded-md border-gray-300 dark:border-gray-700 dark:bg-gray-900 text-sm"
                        >
                            <option value="">All statuses</option>
                            {statuses.map((status) => (
                                <option key={status} value={status}>
                                    {status}
                                </option>
                            ))}
                        </select>
                            </div>
                            <Button type="submit" variant="secondary">Apply</Button>
                        </form>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-0 overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead className="bg-gray-50 dark:bg-gray-800/60">
                                    <tr>
                                        <th className="text-left px-4 py-3 font-semibold">Order</th>
                                        <th className="text-left px-4 py-3 font-semibold">Product</th>
                                        <th className="text-left px-4 py-3 font-semibold">Customer</th>
                                        <th className="text-left px-4 py-3 font-semibold">Amount</th>
                                        <th className="text-left px-4 py-3 font-semibold">Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {orders.data.length === 0 ? (
                                        <tr>
                                            <td className="px-4 py-8 text-gray-500 dark:text-gray-400" colSpan={5}>
                                                No orders found.
                                            </td>
                                        </tr>
                                    ) : (
                                        orders.data.map((order) => (
                                            <tr key={order.id} className="border-t border-gray-200 dark:border-gray-800">
                                                <td className="px-4 py-3 text-gray-900 dark:text-gray-100 font-medium">#{order.id}</td>
                                                <td className="px-4 py-3 text-gray-600 dark:text-gray-400">{order.product?.name || '-'}</td>
                                                <td className="px-4 py-3 text-gray-600 dark:text-gray-400">
                                                    {order.customer_name || 'Unnamed'}
                                                    {order.customer_phone ? ` (${order.customer_phone})` : ''}
                                                </td>
                                                <td className="px-4 py-3 text-gray-900 dark:text-gray-100">{formatPrice(order.total_price, order.currency)}</td>
                                                <td className="px-4 py-3">
                                                    <span className="inline-flex items-center rounded-full px-2 py-1 text-xs font-medium bg-purple-50 text-purple-700 dark:bg-purple-900/20 dark:text-purple-300 capitalize">
                                                        {order.status}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </AppShell>
    );
}
