import { Head, Link, router, useForm } from '@inertiajs/react';
import type { ChangeEvent, FormEvent } from 'react';
import AppShell from '@/Layouts/AppShell';
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/UI/Card';
import Button from '@/Components/UI/Button';
import { Input } from '@/Components/UI/Input';
import { Label } from '@/Components/UI/Label';
import { Switch } from '@/Components/UI/Switch';
import { Package, ShoppingCart, Clock3, ArrowRight, Store, RefreshCcw, Trash2, Link as LinkIcon } from 'lucide-react';

type SequenceOption = {
    id: number;
    name: string;
    status: string;
};

type ShopifyLog = {
    id: number;
    topic: string | null;
    status: string;
    processed_at: string | null;
    error_message: string | null;
};

type ShopifyIntegration = {
    id: number;
    name: string;
    shop_domain: string;
    shop_name: string | null;
    admin_url: string;
    is_active: boolean;
    auto_register_webhooks: boolean;
    webhook_topics: string[];
    abandoned_checkout_sequence_id: number | null;
    abandoned_checkout_sequence_name: string | null;
    last_sync_at: string | null;
    last_error: string | null;
    webhook_url: string;
    recent_webhook_logs: ShopifyLog[];
};

type Props = {
    summary: {
        products_count: number;
        active_products_count: number;
        orders_count: number;
        pending_orders_count: number;
        low_stock_products_count: number;
    };
    recent_orders: Array<{
        id: number;
        customer_name: string | null;
        customer_phone: string | null;
        total_price: number;
        currency: string;
        status: string;
        source: string;
        ordered_at: string | null;
    }>;
    shopify_integrations: ShopifyIntegration[];
    sequences: SequenceOption[];
};

type ShopifyForm = {
    name: string;
    shop_domain: string;
    access_token: string;
    webhook_secret: string;
    abandoned_checkout_sequence_id: string;
    auto_register_webhooks: boolean;
};

export default function EcommerceIndex({ summary, recent_orders, shopify_integrations, sequences }: Props) {
    const form = useForm<ShopifyForm>({
        name: '',
        shop_domain: '',
        access_token: '',
        webhook_secret: '',
        abandoned_checkout_sequence_id: '',
        auto_register_webhooks: true,
    });

    const formatPrice = (amount: number, currency: string) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency,
            minimumFractionDigits: 0,
        }).format((amount || 0) / 100);
    };

    const submitShopify = (e: FormEvent) => {
        e.preventDefault();
        form.post(route('app.ecommerce.shopify.store'));
    };

    const runSync = (integrationId: number) => {
        router.post(route('app.ecommerce.shopify.sync', { id: integrationId }));
    };

    const toggleIntegration = (integration: ShopifyIntegration) => {
        router.patch(route('app.ecommerce.shopify.update', { id: integration.id }), {
            is_active: !integration.is_active,
        });
    };

    const removeIntegration = (integrationId: number) => {
        if (!window.confirm('Remove this Shopify connection?')) {
            return;
        }

        router.delete(route('app.ecommerce.shopify.destroy', { id: integrationId }));
    };

    return (
        <AppShell>
            <Head title="Commerce" />
            <div className="space-y-6">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">WhatsApp Commerce</h1>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                            Manage products, sync Shopify orders, and turn abandoned checkouts into WhatsApp follow-ups.
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

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                    <MetricCard icon={Package} label="Products" value={summary.products_count} />
                    <MetricCard icon={Package} label="Active Products" value={summary.active_products_count} />
                    <MetricCard icon={ShoppingCart} label="Orders" value={summary.orders_count} />
                    <MetricCard icon={Clock3} label="Pending Orders" value={summary.pending_orders_count} />
                    <MetricCard icon={Package} label="Low Stock" value={summary.low_stock_products_count} />
                </div>

                <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
                    <Card>
                        <CardHeader>
                            <CardTitle>Shopify</CardTitle>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                Connect a Shopify store with a custom app token and webhook secret. Zyptos will sync customers, orders, and abandoned checkout triggers.
                            </p>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <form onSubmit={submitShopify} className="grid gap-4 md:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor="shopify_name">Connection name</Label>
                                    <Input id="shopify_name" value={form.data.name} onChange={(e: ChangeEvent<HTMLInputElement>) => form.setData('name', e.target.value)} placeholder="Main Shopify store" />
                                    {form.errors.name && <p className="text-xs text-red-600">{form.errors.name}</p>}
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="shop_domain">Store domain</Label>
                                    <Input id="shop_domain" value={form.data.shop_domain} onChange={(e: ChangeEvent<HTMLInputElement>) => form.setData('shop_domain', e.target.value)} placeholder="store.myshopify.com" />
                                    {form.errors.shop_domain && <p className="text-xs text-red-600">{form.errors.shop_domain}</p>}
                                </div>
                                <div className="space-y-2 md:col-span-2">
                                    <Label htmlFor="access_token">Admin API access token</Label>
                                    <Input type="password" id="access_token" value={form.data.access_token} onChange={(e: ChangeEvent<HTMLInputElement>) => form.setData('access_token', e.target.value)} placeholder="shpat_..." />
                                    {form.errors.access_token && <p className="text-xs text-red-600">{form.errors.access_token}</p>}
                                </div>
                                <div className="space-y-2 md:col-span-2">
                                    <Label htmlFor="webhook_secret">Webhook secret</Label>
                                    <Input type="password" id="webhook_secret" value={form.data.webhook_secret} onChange={(e: ChangeEvent<HTMLInputElement>) => form.setData('webhook_secret', e.target.value)} placeholder="Shopify app client secret / webhook secret" />
                                    {form.errors.webhook_secret && <p className="text-xs text-red-600">{form.errors.webhook_secret}</p>}
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="sequence">Abandoned checkout sequence</Label>
                                    <select id="sequence" value={form.data.abandoned_checkout_sequence_id} onChange={(e: ChangeEvent<HTMLSelectElement>) => form.setData('abandoned_checkout_sequence_id', e.target.value)} className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100">
                                        <option value="">No sequence</option>
                                        {sequences.map((sequence) => (
                                            <option key={sequence.id} value={String(sequence.id)}>{sequence.name}</option>
                                        ))}
                                    </select>
                                    {form.errors.abandoned_checkout_sequence_id && <p className="text-xs text-red-600">{form.errors.abandoned_checkout_sequence_id}</p>}
                                </div>
                                <div className="rounded-lg border border-gray-200 dark:border-gray-800 p-4 flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-gray-900 dark:text-gray-100">Auto-register webhooks</p>
                                        <p className="text-xs text-gray-600 dark:text-gray-400">Registers `customers/create`, `orders/create`, and `checkouts/update` automatically.</p>
                                    </div>
                                    <Switch checked={form.data.auto_register_webhooks} onCheckedChange={(checked: boolean) => form.setData('auto_register_webhooks', checked)} />
                                </div>
                                <div className="md:col-span-2 flex justify-end">
                                    <Button type="submit" disabled={form.processing}>{form.processing ? 'Connecting...' : 'Connect Shopify'}</Button>
                                </div>
                            </form>

                            <div className="space-y-4">
                                {shopify_integrations.length === 0 ? (
                                    <div className="rounded-lg border border-dashed border-gray-300 dark:border-gray-700 p-6 text-sm text-gray-600 dark:text-gray-400">
                                        No Shopify stores connected yet.
                                    </div>
                                ) : shopify_integrations.map((integration) => (
                                    <div key={integration.id} className="rounded-xl border border-gray-200 dark:border-gray-800 p-4 space-y-4">
                                        <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                                            <div>
                                                <div className="flex items-center gap-2">
                                                    <Store className="h-4 w-4 text-emerald-600" />
                                                    <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100">{integration.name}</h3>
                                                    <span className={`rounded-full px-2 py-0.5 text-xs ${integration.is_active ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300' : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300'}`}>
                                                        {integration.is_active ? 'Active' : 'Paused'}
                                                    </span>
                                                </div>
                                                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                                    {integration.shop_name || integration.shop_domain}
                                                </p>
                                                <div className="mt-2 flex flex-wrap gap-2 text-xs text-gray-500 dark:text-gray-400">
                                                    {integration.webhook_topics.map((topic) => (
                                                        <span key={topic} className="rounded-full bg-gray-100 dark:bg-gray-800 px-2 py-1">{topic}</span>
                                                    ))}
                                                </div>
                                            </div>
                                            <div className="flex flex-wrap gap-2">
                                                <a href={integration.admin_url} target="_blank" rel="noreferrer">
                                                    <Button variant="secondary" size="sm">Open Store</Button>
                                                </a>
                                                <Button variant="secondary" size="sm" onClick={() => navigator.clipboard.writeText(integration.webhook_url)}>
                                                    <LinkIcon className="mr-2 h-4 w-4" />Copy Webhook URL
                                                </Button>
                                                <Button variant="secondary" size="sm" onClick={() => runSync(integration.id)}>
                                                    <RefreshCcw className="mr-2 h-4 w-4" />Sync Recent Data
                                                </Button>
                                                <Button variant="secondary" size="sm" onClick={() => toggleIntegration(integration)}>
                                                    {integration.is_active ? 'Pause' : 'Resume'}
                                                </Button>
                                                <Button variant="danger" size="sm" onClick={() => removeIntegration(integration.id)}>
                                                    <Trash2 className="mr-2 h-4 w-4" />Remove
                                                </Button>
                                            </div>
                                        </div>

                                        <div className="grid gap-3 md:grid-cols-3 text-sm">
                                            <div className="rounded-lg bg-gray-50 dark:bg-gray-900/50 p-3">
                                                <p className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">Webhook URL</p>
                                                <p className="mt-1 break-all text-gray-900 dark:text-gray-100">{integration.webhook_url}</p>
                                            </div>
                                            <div className="rounded-lg bg-gray-50 dark:bg-gray-900/50 p-3">
                                                <p className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">Abandoned cart follow-up</p>
                                                <p className="mt-1 text-gray-900 dark:text-gray-100">{integration.abandoned_checkout_sequence_name || 'Not connected'}</p>
                                            </div>
                                            <div className="rounded-lg bg-gray-50 dark:bg-gray-900/50 p-3">
                                                <p className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">Last sync</p>
                                                <p className="mt-1 text-gray-900 dark:text-gray-100">{integration.last_sync_at ? new Date(integration.last_sync_at).toLocaleString() : 'Not synced yet'}</p>
                                                {integration.last_error && <p className="mt-2 text-xs text-red-600">{integration.last_error}</p>}
                                            </div>
                                        </div>

                                        <div>
                                            <p className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">Recent webhook activity</p>
                                            {integration.recent_webhook_logs.length === 0 ? (
                                                <p className="text-sm text-gray-600 dark:text-gray-400">No Shopify webhook events received yet.</p>
                                            ) : (
                                                <div className="space-y-2">
                                                    {integration.recent_webhook_logs.map((log) => (
                                                        <div key={log.id} className="flex items-start justify-between rounded-lg border border-gray-200 dark:border-gray-800 px-3 py-2 text-sm gap-3">
                                                            <div>
                                                                <p className="font-medium text-gray-900 dark:text-gray-100">{log.topic || 'shopify'}</p>
                                                                <p className="text-xs text-gray-500 dark:text-gray-400">{log.processed_at ? new Date(log.processed_at).toLocaleString() : 'Pending'}</p>
                                                            </div>
                                                            <div className="text-right">
                                                                <p className={`text-xs font-medium ${log.status === 'processed' ? 'text-emerald-600' : log.status === 'failed' ? 'text-red-600' : 'text-gray-500'}`}>{log.status}</p>
                                                                {log.error_message && <p className="text-xs text-red-600 max-w-xs">{log.error_message}</p>}
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>

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
                                <p className="text-sm text-gray-600 dark:text-gray-400">No orders yet. Orders captured through WhatsApp or Shopify will appear here.</p>
                            ) : (
                                <div className="space-y-3">
                                    {recent_orders.map((order) => (
                                        <div key={order.id} className="rounded-lg border border-gray-200 dark:border-gray-800 p-3 flex items-center justify-between gap-4">
                                            <div>
                                                <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                                    {order.customer_name || 'Unnamed customer'}
                                                </p>
                                                <p className="text-xs text-gray-600 dark:text-gray-400">{order.customer_phone || 'No phone provided'}</p>
                                                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400 capitalize">Source: {order.source}</p>
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
