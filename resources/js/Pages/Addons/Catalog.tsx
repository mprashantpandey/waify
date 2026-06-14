import { Head, router, useForm } from '@inertiajs/react';
import AppShell from '@/Layouts/AppShell';
import Button from '@/Components/UI/Button';
import { Card, CardContent } from '@/Components/UI/Card';
import { AddonPage, EmptyPanel, MiniStatus, PaginationMeta, ServerListControls, StatGrid } from './Shared';
import { Modal, ThemedIconTile } from '@/Components/UI/Elements';
import { Edit3, Package, Plus, RefreshCw, ShoppingBag, Store, Tag, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { Input } from '@/Components/UI/Input';
import { useConfirm } from '@/hooks/useConfirm';

type Product = { id: number; name: string; sku: string | null; category: string; price: number; stock: number; image: string; imageUrl?: string | null; description?: string | null; status: string };

function money(value: number) {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(value / 100);
}

export default function Catalog({ integration, products = [], filters = {}, pagination = null }: { integration: { provider: string; lastSync: string | null; health: string | null } | null; products: Product[]; filters?: Record<string, any>; pagination?: PaginationMeta | null }) {
    const confirm = useConfirm();
    const [preview, setPreview] = useState<Product | null>(null);
    const [editing, setEditing] = useState<Product | null>(null);
    const [formOpen, setFormOpen] = useState(false);
    const form = useForm({
        name: '',
        sku: '',
        category: '',
        price: 0,
        stock: 0,
        image_url: '',
        description: '',
        status: 'active',
    });

    const openCreate = () => {
        setEditing(null);
        form.reset();
        form.setData({
            name: '',
            sku: '',
            category: '',
            price: 0,
            stock: 0,
            image_url: '',
            description: '',
            status: 'active',
        });
        setFormOpen(true);
    };

    const openEdit = (product: Product) => {
        setEditing(product);
        form.setData({
            name: product.name,
            sku: product.sku || '',
            category: product.category || '',
            price: product.price || 0,
            stock: product.stock || 0,
            image_url: product.imageUrl || '',
            description: product.description || '',
            status: product.status || 'active',
        });
        setFormOpen(true);
    };

    const saveProduct = () => {
        const options = { preserveScroll: true, onSuccess: () => setFormOpen(false) };
        if (editing) {
            form.patch(route('app.catalog.products.update', editing.id), options);
        } else {
            form.post(route('app.catalog.products.store'), options);
        }
    };

    const deleteProduct = async (product: Product) => {
        const confirmed = await confirm({
            title: 'Delete product',
            message: `Delete "${product.name}" from this workspace catalog?`,
            confirmText: 'Delete product',
            variant: 'danger',
        });
        if (confirmed) {
            router.delete(route('app.catalog.products.destroy', product.id), { preserveScroll: true });
        }
    };

    return (
        <AppShell>
            <Head title="Catalog" />
            <AddonPage
                title="Catalog"
                description="Manual workspace catalog for WhatsApp-ready product cards and campaign previews. External store sync is not enabled until a real store integration is connected."
                actions={<Button onClick={openCreate}><Plus className="mr-2 h-4 w-4" />Add product</Button>}
            >
                <StatGrid stats={[
                    { label: 'Products', value: products.length, icon: Package, tone: 'green' },
                    { label: 'Connected store', value: integration ? integration.provider : 'None', icon: Store, tone: integration ? 'blue' : 'gray' },
                    { label: 'Catalog health', value: integration?.health || 'Setup needed', icon: RefreshCw, tone: integration ? 'green' : 'amber' },
                    { label: 'Low stock', value: products.filter((item) => item.stock < 30).length, icon: Tag, tone: 'amber' },
                ]} />
                {!integration && products.length === 0 && <EmptyPanel title="Build your catalog" description="Add products manually. This page does not show imported store data unless a real commerce integration is configured later." action={<Button onClick={openCreate}>Add first product</Button>} />}
                <ServerListControls routeName="app.catalog.index" filters={filters} pagination={pagination} searchPlaceholder="Search products, SKU, category" />
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
                    {products.map((product) => (
                        <Card key={product.id} className="overflow-hidden">
                            <div role="button" tabIndex={0} onClick={() => setPreview(product)} onKeyDown={(event) => { if (event.key === 'Enter') setPreview(product); }} className="block w-full cursor-pointer text-left">
                                <div className="flex h-36 items-center justify-center bg-gray-50 dark:bg-waify-dark-surface-2">
                                    {product.imageUrl ? <img src={product.imageUrl} alt={product.name} className="h-full w-full object-cover" /> : <span className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white text-xl font-bold text-waify-green shadow-card dark:bg-waify-dark-surface">{product.image}</span>}
                                </div>
                                <CardContent className="p-5">
                                    <div className="flex items-start justify-between gap-3">
                                        <div className="min-w-0">
                                            <h3 className="truncate font-semibold text-waify-text dark:text-waify-dark-text">{product.name}</h3>
                                            <p className="mt-1 text-sm text-waify-text-muted dark:text-waify-dark-text-muted">{product.sku} · {product.category}</p>
                                        </div>
                                        <MiniStatus status={product.status || (product.stock > 0 ? 'active' : 'draft')} />
                                    </div>
                                    <div className="mt-4 flex items-end justify-between">
                                        <p className="text-lg font-bold text-waify-text dark:text-waify-dark-text">{money(product.price)}</p>
                                        <p className="text-sm text-waify-text-muted dark:text-waify-dark-text-muted">{product.stock} in stock</p>
                                    </div>
                                    <div className="mt-4 flex gap-2" onClick={(event) => event.stopPropagation()}>
                                        <Button size="sm" variant="secondary" onClick={() => openEdit(product)}><Edit3 className="h-3.5 w-3.5" />Edit</Button>
                                        <Button size="sm" variant="ghost" onClick={() => deleteProduct(product)}><Trash2 className="h-3.5 w-3.5" />Delete</Button>
                                    </div>
                                </CardContent>
                            </div>
                        </Card>
                    ))}
                </div>
                <Modal open={!!preview} onClose={() => setPreview(null)} title="WhatsApp product preview" description={preview?.name}>
                    <div className="space-y-4">
                        <div className="rounded-card border border-gray-100 p-4 dark:border-waify-dark-border">
                            <ThemedIconTile tone="green"><ShoppingBag className="h-5 w-5" /></ThemedIconTile>
                            <h3 className="mt-3 font-semibold text-waify-text dark:text-waify-dark-text">{preview?.name}</h3>
                            <p className="mt-1 text-sm text-waify-text-muted dark:text-waify-dark-text-muted">{preview?.category}</p>
                            <p className="mt-3 text-xl font-bold">{money(preview?.price || 0)}</p>
                        </div>
                        <Button className="w-full">Use in campaign</Button>
                    </div>
                </Modal>
                <Modal
                    open={formOpen}
                    onClose={() => setFormOpen(false)}
                    title={editing ? 'Edit product' : 'Add product'}
                    description="Stored in this workspace catalog."
                    footer={<><Button variant="secondary" onClick={() => setFormOpen(false)}>Cancel</Button><Button onClick={saveProduct} disabled={form.processing}>{form.processing ? 'Saving...' : 'Save product'}</Button></>}
                >
                    <div className="grid gap-3 sm:grid-cols-2">
                        <label className="sm:col-span-2 text-sm font-medium text-waify-text dark:text-waify-dark-text">Name<Input className="mt-1" value={form.data.name} onChange={(e) => form.setData('name', e.target.value)} /></label>
                        <label className="text-sm font-medium text-waify-text dark:text-waify-dark-text">SKU<Input className="mt-1" value={form.data.sku} onChange={(e) => form.setData('sku', e.target.value)} /></label>
                        <label className="text-sm font-medium text-waify-text dark:text-waify-dark-text">Category<Input className="mt-1" value={form.data.category} onChange={(e) => form.setData('category', e.target.value)} /></label>
                        <label className="text-sm font-medium text-waify-text dark:text-waify-dark-text">Price in paise<Input className="mt-1" type="number" value={form.data.price} onChange={(e) => form.setData('price', Number(e.target.value))} /></label>
                        <label className="text-sm font-medium text-waify-text dark:text-waify-dark-text">Stock<Input className="mt-1" type="number" value={form.data.stock} onChange={(e) => form.setData('stock', Number(e.target.value))} /></label>
                        <label className="sm:col-span-2 text-sm font-medium text-waify-text dark:text-waify-dark-text">Image URL<Input className="mt-1" value={form.data.image_url} onChange={(e) => form.setData('image_url', e.target.value)} placeholder="https://..." /></label>
                        <label className="sm:col-span-2 text-sm font-medium text-waify-text dark:text-waify-dark-text">Description<textarea className="waify-input mt-1 min-h-24" value={form.data.description} onChange={(e) => form.setData('description', e.target.value)} /></label>
                        <label className="text-sm font-medium text-waify-text dark:text-waify-dark-text">Status<select className="waify-input mt-1" value={form.data.status} onChange={(e) => form.setData('status', e.target.value)}><option value="active">Active</option><option value="draft">Draft</option><option value="archived">Archived</option></select></label>
                    </div>
                </Modal>
            </AddonPage>
        </AppShell>
    );
}
