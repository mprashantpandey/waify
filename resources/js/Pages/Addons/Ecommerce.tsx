import { Head, router, useForm } from '@inertiajs/react';
import { useState } from 'react';
import AppShell from '@/Layouts/AppShell';
import Button from '@/Components/UI/Button';
import { Card, CardContent } from '@/Components/UI/Card';
import { AddonPage, EmptyPanel, MiniStatus, PaginationMeta, ServerListControls, StatGrid } from './Shared';
import { Modal, ThemedIconTile } from '@/Components/UI/Elements';
import { Input } from '@/Components/UI/Input';
import type { LucideIcon } from 'lucide-react';
import { BadgeIndianRupee, Bot, CreditCard, Edit3, PackageCheck, Plus, RefreshCw, Send, ShoppingBag, Store, Trash2, Truck, UserPlus } from 'lucide-react';
import { useConfirm } from '@/hooks/useConfirm';

type Integration = { id: string; platform: string; connected: boolean; store: string | null; orders: number; revenue: number; abandoned: number };
type Order = { id: number; orderNumber: string; customerName: string; customerPhone?: string | null; amount: number; status: string; source: string; paymentUrl?: string | null; recoveryStatus?: string | null; placedAt: string | null };
type CommercePlaybook = {
    title: string;
    description: string;
    status: 'ready' | 'setup' | 'missing';
    icon: LucideIcon;
    action: string;
    routeName?: string;
    onClick?: () => void;
};

function money(value: number) {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(value / 100);
}

export default function Ecommerce({ integrations = [], orders = [], filters = {}, pagination = null }: { integrations: Integration[]; orders: Order[]; filters?: Record<string, any>; pagination?: PaginationMeta | null }) {
    const confirm = useConfirm();
    const [open, setOpen] = useState(false);
    const [editing, setEditing] = useState<Order | null>(null);
    const form = useForm({ order_number: '', customer_name: '', customer_phone: '', amount: 0, status: 'pending', source: 'manual', payment_url: '', recovery_status: 'none', placed_at: '' });
    const totalOrders = orders.length;
    const totalRevenue = orders.filter((order) => ['paid', 'fulfilled', 'completed'].includes(order.status)).reduce((sum, item) => sum + item.amount, 0);
    const openCreate = () => {
        setEditing(null);
        form.setData({ order_number: '', customer_name: '', customer_phone: '', amount: 0, status: 'pending', source: integrations[0]?.id || 'manual', payment_url: '', recovery_status: 'none', placed_at: '' });
        setOpen(true);
    };
    const openEdit = (order: Order) => {
        setEditing(order);
        form.setData({ order_number: order.orderNumber, customer_name: order.customerName, customer_phone: order.customerPhone || '', amount: order.amount, status: order.status, source: order.source, payment_url: order.paymentUrl || '', recovery_status: order.recoveryStatus || 'none', placed_at: order.placedAt ? order.placedAt.slice(0, 16) : '' });
        setOpen(true);
    };
    const save = () => {
        const options = { preserveScroll: true, onSuccess: () => setOpen(false) };
        editing ? form.patch(route('app.ecommerce.orders.update', editing.id), options) : form.post(route('app.ecommerce.orders.store'), options);
    };
    const remove = async (order: Order) => {
        const confirmed = await confirm({
            title: 'Delete order',
            message: `Delete order ${order.orderNumber}?`,
            confirmText: 'Delete order',
            variant: 'danger',
        });
        if (confirmed) router.delete(route('app.ecommerce.orders.destroy', order.id), { preserveScroll: true });
    };
    const convert = (order: Order) => {
        router.post(route('app.ecommerce.orders.contact', order.id), {}, { preserveScroll: true });
    };
    const createPaymentLink = (order: Order) => {
        router.post(route('app.ecommerce.orders.payment-link', order.id), {}, { preserveScroll: true });
    };
    const connectedPlatforms = integrations.filter((item) => item.connected);
    const hasStore = connectedPlatforms.some((item) => ['shopify', 'woocommerce', 'meta-catalog'].includes(item.id));
    const hasOrders = orders.length > 0;
    const hasAbandoned = orders.some((order) => order.status === 'abandoned');
    const hasPaymentReady = connectedPlatforms.some((item) => item.id.includes('razorpay') || item.id.includes('pay') || item.id === 'cashfree')
        || orders.some((order) => Boolean(order.paymentUrl));
    const commercePlaybooks: CommercePlaybook[] = [
        {
            title: 'Catalog messages',
            description: 'Sync products, then send Meta product cards and product lists from the inbox.',
            status: hasStore ? 'ready' : 'setup',
            icon: ShoppingBag,
            action: 'Manage catalog',
            routeName: 'app.catalog.index',
        },
        {
            title: 'Abandoned cart recovery',
            description: 'Track abandoned orders, create payment links, and trigger recovery flows from automations.',
            status: hasAbandoned ? 'ready' : hasOrders ? 'setup' : 'missing',
            icon: RefreshCw,
            action: hasOrders ? 'Create recovery flow' : 'Add order',
            onClick: hasOrders ? () => router.visit(route('app.chatbots.index', { panel: 'create' })) : openCreate,
        },
        {
            title: 'Payment reminders',
            description: 'Use Razorpay payment links and template follow-ups for pending or unpaid orders.',
            status: hasPaymentReady ? 'ready' : 'setup',
            icon: CreditCard,
            action: hasPaymentReady ? 'Open templates' : 'Connect payments',
            routeName: hasPaymentReady ? 'app.whatsapp.templates.index' : 'app.integrations.index',
        },
        {
            title: 'Order confirmation',
            description: 'Create a template for paid orders and use automation or campaigns for confirmations.',
            status: hasOrders ? 'setup' : 'missing',
            icon: PackageCheck,
            action: 'Create template',
            routeName: 'app.whatsapp.templates.index',
        },
        {
            title: 'Shipping updates',
            description: 'Use order status and tracking fields to send dispatch and delivery updates.',
            status: hasOrders ? 'setup' : 'missing',
            icon: Truck,
            action: 'Open automations',
            routeName: 'app.chatbots.index',
        },
        {
            title: 'Post-purchase AI support',
            description: 'Route order questions to an AI support agent with handoff rules for refunds or returns.',
            status: 'setup',
            icon: Bot,
            action: 'Open AI agents',
            routeName: 'app.ai.index',
        },
    ];

    return (
        <AppShell>
            <Head title="Ecommerce" />
            <AddonPage title="Ecommerce" description="Catalog, order, payment, and recovery workflows for WhatsApp commerce." actions={<Button onClick={openCreate}><Plus className="mr-2 h-4 w-4" />Add order</Button>}>
                <StatGrid stats={[
                    { label: 'Connected platforms', value: connectedPlatforms.length, icon: Store, tone: 'green' },
                    { label: 'Orders 24h', value: totalOrders, icon: ShoppingBag, tone: 'blue' },
                    { label: 'Revenue 24h', value: money(totalRevenue), icon: BadgeIndianRupee, tone: 'amber' },
                    { label: 'Recovery queue', value: orders.filter((order) => order.status === 'abandoned' || order.recoveryStatus === 'queued').length, icon: RefreshCw, tone: 'purple' },
                ]} />
                <Card>
                    <CardContent className="p-5">
                        <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                            <div>
                                <p className="text-lg font-semibold text-waify-text dark:text-waify-dark-text">Commerce playbooks</p>
                                <p className="mt-1 text-sm text-waify-text-muted dark:text-waify-dark-text-muted">
                                    Packaged WhatsApp commerce workflows. Each card shows the setup path instead of hiding commerce work across catalog, templates, automations, and inbox.
                                </p>
                            </div>
                            <Button type="button" variant="secondary" onClick={() => router.visit(route('app.integrations.index', { category: 'commerce' }))}>
                                <Store className="h-4 w-4" />
                                Commerce integrations
                            </Button>
                        </div>
                        <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                            {commercePlaybooks.map((playbook) => {
                                const Icon = playbook.icon;
                                const status = playbook.status === 'ready'
                                    ? { label: 'Ready', className: 'bg-emerald-50 text-emerald-700 ring-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-200 dark:ring-emerald-500/30' }
                                    : playbook.status === 'missing'
                                        ? { label: 'Needs data', className: 'bg-amber-50 text-amber-700 ring-amber-200 dark:bg-amber-500/10 dark:text-amber-200 dark:ring-amber-500/30' }
                                        : { label: 'Setup', className: 'bg-blue-50 text-blue-700 ring-blue-200 dark:bg-blue-500/10 dark:text-blue-200 dark:ring-blue-500/30' };

                                return (
                                    <div key={playbook.title} className="rounded-card border border-gray-100 bg-gray-50/70 p-4 dark:border-waify-dark-border dark:bg-waify-dark-surface-2">
                                        <div className="flex items-start justify-between gap-3">
                                            <ThemedIconTile tone={playbook.status === 'ready' ? 'green' : playbook.status === 'missing' ? 'amber' : 'blue'}>
                                                <Icon className="h-5 w-5" />
                                            </ThemedIconTile>
                                            <span className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ring-1 ${status.className}`}>{status.label}</span>
                                        </div>
                                        <p className="mt-3 font-semibold text-waify-text dark:text-waify-dark-text">{playbook.title}</p>
                                        <p className="mt-1 min-h-12 text-xs leading-5 text-waify-text-muted dark:text-waify-dark-text-muted">{playbook.description}</p>
                                        <Button
                                            type="button"
                                            size="sm"
                                            variant="secondary"
                                            className="mt-3"
                                            onClick={() => playbook.onClick ? playbook.onClick() : playbook.routeName ? router.visit(route(playbook.routeName as any)) : undefined}
                                        >
                                            {playbook.title.includes('Payment') ? <CreditCard className="h-3.5 w-3.5" /> : playbook.title.includes('Catalog') ? <ShoppingBag className="h-3.5 w-3.5" /> : <Send className="h-3.5 w-3.5" />}
                                            {playbook.action}
                                        </Button>
                                    </div>
                                );
                            })}
                        </div>
                    </CardContent>
                </Card>
                {integrations.length === 0 && orders.length === 0 ? <EmptyPanel title="Start order tracking" description="Add orders manually. No fake Shopify, WooCommerce, Razorpay, or Cashfree order feed is displayed until a real connector is available." action={<Button onClick={openCreate}>Add order</Button>} /> : (
                    <div className="grid gap-4 xl:grid-cols-2">
                        {integrations.map((item) => (
                            <Card key={item.id}>
                                <CardContent className="p-5">
                                    <div className="flex items-start justify-between gap-4">
                                        <div className="flex min-w-0 gap-4">
                                            <ThemedIconTile tone={item.id.includes('pay') || item.id === 'cashfree' ? 'amber' : 'green'}>
                                                {item.id.includes('pay') || item.id === 'cashfree' ? <CreditCard className="h-5 w-5" /> : <Store className="h-5 w-5" />}
                                            </ThemedIconTile>
                                            <div>
                                                <h3 className="font-semibold text-waify-text dark:text-waify-dark-text">{item.platform}</h3>
                                                <p className="mt-1 text-sm text-waify-text-muted dark:text-waify-dark-text-muted">{item.store || 'Workspace integration'}</p>
                                            </div>
                                        </div>
                                        <MiniStatus status={item.connected ? 'connected' : 'draft'} />
                                    </div>
                                    <div className="mt-5 grid grid-cols-3 gap-3 text-sm">
                                        <div><span className="text-waify-text-muted dark:text-waify-dark-text-muted">Orders</span><p className="font-semibold">{item.orders}</p></div>
                                        <div><span className="text-waify-text-muted dark:text-waify-dark-text-muted">Revenue</span><p className="font-semibold">{money(item.revenue)}</p></div>
                                        <div><span className="text-waify-text-muted dark:text-waify-dark-text-muted">Abandoned</span><p className="font-semibold">{item.abandoned}</p></div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}
                <ServerListControls routeName="app.ecommerce.index" filters={filters} pagination={pagination} searchPlaceholder="Search orders, customer, phone" />
                {orders.length > 0 && (
                    <Card>
                        <CardContent className="p-0">
                            <div className="divide-y divide-gray-100 dark:divide-waify-dark-border">
                                {orders.map((order) => (
                                    <div key={order.id} className="flex flex-col gap-3 p-4 md:flex-row md:items-center md:justify-between">
                                        <div>
                                            <p className="font-semibold text-waify-text dark:text-waify-dark-text">{order.orderNumber} · {order.customerName}</p>
                                            <p className="mt-1 text-sm text-waify-text-muted dark:text-waify-dark-text-muted">{order.customerPhone || 'No phone'} · {order.source}</p>
                                        </div>
                                        <div className="flex flex-wrap items-center gap-3">
                                            <span className="font-semibold">{money(order.amount)}</span>
                                            <MiniStatus status={order.recoveryStatus && order.recoveryStatus !== 'none' ? order.recoveryStatus : order.status} />
                                            <Button size="sm" variant="secondary" onClick={() => createPaymentLink(order)}><CreditCard className="h-3.5 w-3.5" />Create link</Button>
                                            <Button size="sm" variant="secondary" disabled={!order.customerPhone} onClick={() => convert(order)}><UserPlus className="h-3.5 w-3.5" />Contact</Button>
                                            <Button size="sm" variant="secondary" onClick={() => openEdit(order)}><Edit3 className="h-3.5 w-3.5" />Edit</Button>
                                            <Button size="sm" variant="ghost" onClick={() => remove(order)}><Trash2 className="h-3.5 w-3.5" />Delete</Button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                )}
                <Modal open={open} onClose={() => setOpen(false)} title={editing ? 'Edit order' : 'Add order'} description="Saved to this workspace." footer={<><Button variant="secondary" onClick={() => setOpen(false)}>Cancel</Button><Button onClick={save} disabled={form.processing}>Save order</Button></>}>
                    <div className="grid gap-3 sm:grid-cols-2">
                        <label className="text-sm font-medium text-waify-text dark:text-waify-dark-text">Order number<Input disabled={Boolean(editing)} className="mt-1" value={form.data.order_number} onChange={(e) => form.setData('order_number', e.target.value)} /></label>
                        <label className="text-sm font-medium text-waify-text dark:text-waify-dark-text">Customer<Input className="mt-1" value={form.data.customer_name} onChange={(e) => form.setData('customer_name', e.target.value)} /></label>
                        <label className="text-sm font-medium text-waify-text dark:text-waify-dark-text">Phone<Input className="mt-1" value={form.data.customer_phone} onChange={(e) => form.setData('customer_phone', e.target.value)} /></label>
                        <label className="text-sm font-medium text-waify-text dark:text-waify-dark-text">Amount paise<Input className="mt-1" type="number" value={form.data.amount} onChange={(e) => form.setData('amount', Number(e.target.value))} /></label>
                        <label className="text-sm font-medium text-waify-text dark:text-waify-dark-text">Source<Input className="mt-1" value={form.data.source} onChange={(e) => form.setData('source', e.target.value)} /></label>
                        <label className="text-sm font-medium text-waify-text dark:text-waify-dark-text sm:col-span-2">Payment link<Input className="mt-1" value={form.data.payment_url} onChange={(e) => form.setData('payment_url', e.target.value)} placeholder="https://rzp.io/i/..." /></label>
                        <label className="text-sm font-medium text-waify-text dark:text-waify-dark-text">Placed at<Input className="mt-1" type="datetime-local" value={form.data.placed_at} onChange={(e) => form.setData('placed_at', e.target.value)} /></label>
                        <label className="text-sm font-medium text-waify-text dark:text-waify-dark-text">Status<select className="waify-input mt-1" value={form.data.status} onChange={(e) => form.setData('status', e.target.value)}><option value="pending">Pending</option><option value="paid">Paid</option><option value="fulfilled">Fulfilled</option><option value="completed">Completed</option><option value="abandoned">Abandoned</option><option value="cancelled">Cancelled</option><option value="refunded">Refunded</option></select></label>
                        <label className="text-sm font-medium text-waify-text dark:text-waify-dark-text">Recovery<select className="waify-input mt-1" value={form.data.recovery_status} onChange={(e) => form.setData('recovery_status', e.target.value)}><option value="none">None</option><option value="queued">Queued</option><option value="sent">Sent</option><option value="recovered">Recovered</option><option value="failed">Failed</option></select></label>
                    </div>
                </Modal>
            </AddonPage>
        </AppShell>
    );
}
