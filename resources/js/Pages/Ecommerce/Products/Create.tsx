import { Head, useForm } from '@inertiajs/react';
import AppShell from '@/Layouts/AppShell';
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/UI/Card';
import Button from '@/Components/UI/Button';
import TextInput from '@/Components/TextInput';
import InputError from '@/Components/InputError';

type CreateProductForm = {
    name: string;
    sku: string;
    description: string;
    price: number;
    currency: string;
    status: 'draft' | 'active' | 'archived';
    stock: number | '';
};

export default function EcommerceProductCreate() {
    const { data, setData, post, processing, errors } = useForm<CreateProductForm>({
        name: '',
        sku: '',
        description: '',
        price: 0,
        currency: 'INR',
        status: 'draft',
        stock: '',
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('app.ecommerce.products.store'));
    };

    return (
        <AppShell>
            <Head title="Add Commerce Product" />
            <div className="max-w-3xl space-y-6">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Add Product</h1>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Create products for your WhatsApp commerce catalog.</p>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Product Details</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={submit} className="space-y-5">
                            <div>
                                <label className="block text-sm font-medium mb-1">Name</label>
                                <TextInput value={data.name} onChange={(e) => setData('name', e.target.value)} className="w-full" required />
                                <InputError message={errors.name} className="mt-1" />
                            </div>

                            <div className="grid md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium mb-1">SKU</label>
                                    <TextInput value={data.sku} onChange={(e) => setData('sku', e.target.value)} className="w-full" />
                                    <InputError message={errors.sku} className="mt-1" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">Status</label>
                                    <select
                                        value={data.status}
                                        onChange={(e) => setData('status', e.target.value as CreateProductForm['status'])}
                                        className="w-full rounded-md border-gray-300 dark:border-gray-700 dark:bg-gray-900"
                                    >
                                        <option value="draft">Draft</option>
                                        <option value="active">Active</option>
                                        <option value="archived">Archived</option>
                                    </select>
                                    <InputError message={errors.status} className="mt-1" />
                                </div>
                            </div>

                            <div className="grid md:grid-cols-3 gap-4">
                                <div>
                                    <label className="block text-sm font-medium mb-1">Price (minor unit)</label>
                                    <TextInput
                                        type="number"
                                        min={0}
                                        value={data.price}
                                        onChange={(e) => setData('price', Number(e.target.value))}
                                        className="w-full"
                                        required
                                    />
                                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">For INR, enter paise. Example: 9999 = Rs 99.99.</p>
                                    <InputError message={errors.price} className="mt-1" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">Currency</label>
                                    <TextInput value={data.currency} onChange={(e) => setData('currency', e.target.value.toUpperCase())} className="w-full" maxLength={3} />
                                    <InputError message={errors.currency} className="mt-1" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">Stock (optional)</label>
                                    <TextInput
                                        type="number"
                                        min={0}
                                        value={data.stock}
                                        onChange={(e) => setData('stock', e.target.value === '' ? '' : Number(e.target.value))}
                                        className="w-full"
                                    />
                                    <InputError message={errors.stock} className="mt-1" />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-1">Description</label>
                                <textarea
                                    value={data.description}
                                    onChange={(e) => setData('description', e.target.value)}
                                    rows={5}
                                    className="w-full rounded-md border-gray-300 dark:border-gray-700 dark:bg-gray-900"
                                />
                                <InputError message={errors.description} className="mt-1" />
                            </div>

                            <div className="pt-2 flex items-center gap-3">
                                <Button type="submit" disabled={processing}>
                                    {processing ? 'Saving...' : 'Create Product'}
                                </Button>
                                <Button type="button" variant="secondary" onClick={() => history.back()}>
                                    Cancel
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </AppShell>
    );
}
