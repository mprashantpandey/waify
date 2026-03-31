import { Head, Link, router } from '@inertiajs/react';
import { FormEvent, useState } from 'react';
import AppShell from '@/Layouts/AppShell';
import { Card, CardContent } from '@/Components/UI/Card';
import Button from '@/Components/UI/Button';
import TextInput from '@/Components/TextInput';
import { Plus, Search } from 'lucide-react';

type Product = {
    id: number;
    name: string;
    sku: string | null;
    price: number;
    currency: string;
    status: string;
    stock: number | null;
};

type Props = {
    products: {
        data: Product[];
        links?: Array<{ label: string; url: string | null; active: boolean }>;
    };
    filters: {
        search?: string;
        status?: string;
    };
    statuses: string[];
};

export default function EcommerceProductsIndex({ products, filters, statuses }: Props) {
    const [search, setSearch] = useState(filters.search || '');
    const [status, setStatus] = useState(filters.status || '');

    const onSearch = (e: FormEvent) => {
        e.preventDefault();
        router.get(route('app.ecommerce.products.index'), { search: search || undefined, status: status || undefined }, { preserveState: true, preserveScroll: true });
    };

    const formatPrice = (amount: number, currency: string) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency,
            minimumFractionDigits: 0,
        }).format((amount || 0) / 100);
    };

    return (
        <AppShell>
            <Head title="Commerce Products" />
            <div className="space-y-6">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Products</h1>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Manage the product catalog used in WhatsApp commerce workflows.</p>
                    </div>
                    <Link href={route('app.ecommerce.products.create')}>
                        <Button>
                            <Plus className="h-4 w-4 mr-2" />
                            Add Product
                        </Button>
                    </Link>
                </div>

                <Card>
                    <CardContent className="p-4">
                        <form onSubmit={onSearch} className="flex flex-col gap-3 md:flex-row">
                            <div className="relative flex-1">
                                <Search className="h-4 w-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                                <TextInput className="pl-9 w-full" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by name or SKU..." />
                            </div>
                            <select
                                value={status}
                                onChange={(e) => setStatus(e.target.value)}
                                className="rounded-md border-gray-300 dark:border-gray-700 dark:bg-gray-900 text-sm md:w-44"
                            >
                                <option value="">All statuses</option>
                                {statuses.map((item) => (
                                    <option key={item} value={item}>
                                        {item}
                                    </option>
                                ))}
                            </select>
                            <Button type="submit" variant="secondary">Search</Button>
                        </form>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-0 overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead className="bg-gray-50 dark:bg-gray-800/60">
                                    <tr>
                                        <th className="text-left px-4 py-3 font-semibold">Product</th>
                                        <th className="text-left px-4 py-3 font-semibold">SKU</th>
                                        <th className="text-left px-4 py-3 font-semibold">Price</th>
                                        <th className="text-left px-4 py-3 font-semibold">Stock</th>
                                        <th className="text-left px-4 py-3 font-semibold">Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {products.data.length === 0 ? (
                                        <tr>
                                            <td className="px-4 py-8 text-gray-500 dark:text-gray-400" colSpan={5}>
                                                No products found.
                                            </td>
                                        </tr>
                                    ) : (
                                        products.data.map((product) => (
                                            <tr key={product.id} className="border-t border-gray-200 dark:border-gray-800">
                                                <td className="px-4 py-3 font-medium text-gray-900 dark:text-gray-100">{product.name}</td>
                                                <td className="px-4 py-3 text-gray-600 dark:text-gray-400">{product.sku || '-'}</td>
                                                <td className="px-4 py-3 text-gray-900 dark:text-gray-100">{formatPrice(product.price, product.currency)}</td>
                                                <td className="px-4 py-3 text-gray-600 dark:text-gray-400">{product.stock ?? 'Unlimited'}</td>
                                                <td className="px-4 py-3">
                                                    <span className="inline-flex items-center rounded-full px-2 py-1 text-xs font-medium bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300 capitalize">
                                                        {product.status}
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
