import { Head, Link } from '@inertiajs/react';
import AppShell from '@/Layouts/AppShell';
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/UI/Card';
import Button from '@/Components/UI/Button';
import { Package, ShoppingCart, Clock3, ArrowRight } from 'lucide-react';

type Props = {
    summary: {
        products_count: number;
        active_products_count: number;
        orders_count: number;
        pending_orders_count: number;
    };
    recent_orders: Array<{
        id: number;
        customer_name: string | null;
        customer_phone: string | null;
        total_price: number;
        currency: string;
        status: string;
        ordered_at: string | null;
    }>;
};

export default function EcommerceIndex({ summary, recent_orders }: Props) {
    const formatPrice = (amount: number, currency: string) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency,
            minimumFractionDigits: 0,
        }).format((amount || 0) / 100);
    };

    return (
        <AppShell>
            <Head title="Commerce" />
            <div className="space-y-6">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">WhatsApp Commerce</h1>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                            Manage products and capture commerce orders from WhatsApp conversations.
                        </p>
                    </div>
                    <div className="flex gap-2">
                        <Link href={route('app.ecommerce.products.create')}>
                            <Button>Add Product</Button>
                        </Link>
                        <Link href={route('app.ecommerce.orders.index')}>
                            <Button variant="secondary">View Orders</Button>
                        </Link>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <MetricCard icon={Package} label="Products" value={summary.products_count} />
                    <MetricCard icon={Package} label="Active Products" value={summary.active_products_count} />
                    <MetricCard icon={ShoppingCart} label="Orders" value={summary.orders_count} />
                    <MetricCard icon={Clock3} label="Pending Orders" value={summary.pending_orders_count} />
                </div>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                        <CardTitle>Recent Orders</CardTitle>
                        <Link href={route('app.ecommerce.orders.index')} className="text-sm text-blue-600 dark:text-blue-400 inline-flex items-center gap-1">
                            See all
                            <ArrowRight className="h-4 w-4" />
                        </Link>
                    </CardHeader>
                    <CardContent>
                        {recent_orders.length === 0 ? (
                            <p className="text-sm text-gray-600 dark:text-gray-400">No orders yet. Orders captured through your WhatsApp commerce flow will appear here.</p>
                        ) : (
                            <div className="space-y-3">
                                {recent_orders.map((order) => (
                                    <div key={order.id} className="rounded-lg border border-gray-200 dark:border-gray-800 p-3 flex items-center justify-between">
                                        <div>
                                            <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                                {order.customer_name || 'Unnamed customer'}
                                            </p>
                                            <p className="text-xs text-gray-600 dark:text-gray-400">{order.customer_phone || 'No phone provided'}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                                                {formatPrice(order.total_price, order.currency)}
                                            </p>
                                            <p className="text-xs text-gray-600 dark:text-gray-400 capitalize">{order.status}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </AppShell>
    );
}

function MetricCard({ icon: Icon, label, value }: { icon: any; label: string; value: number }) {
    return (
        <Card>
            <CardContent className="p-4">
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">{label}</p>
                        <p className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mt-1">{value}</p>
                    </div>
                    <div className="w-10 h-10 rounded-lg bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center">
                        <Icon className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}

