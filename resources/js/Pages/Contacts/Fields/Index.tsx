import { Head, Link, router, useForm } from '@inertiajs/react';
import { useMemo, useState } from 'react';
import AppShell from '@/Layouts/AppShell';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/Components/UI/Card';
import Button from '@/Components/UI/Button';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import InputError from '@/Components/InputError';
import { ArrowLeft, Pencil, Plus, Trash2 } from 'lucide-react';

interface CustomField {
    id: number;
    key: string;
    name: string;
    type: string;
    options: string[];
    required: boolean;
    order: number;
}

interface FieldType {
    value: string;
    label: string;
}

export default function ContactFieldsIndex({
    fields,
    field_types,
}: {
    fields: CustomField[];
    field_types: FieldType[];
}) {
    const [editingId, setEditingId] = useState<number | null>(null);
    const currentField = useMemo(() => fields.find((field) => field.id === editingId) ?? null, [fields, editingId]);

    const { data, setData, transform, post, put, processing, errors, reset } = useForm({
        name: currentField?.name ?? '',
        type: currentField?.type ?? 'text',
        optionsText: currentField?.options?.join('\n') ?? '',
        required: currentField?.required ?? false,
        order: currentField?.order ?? 0,
    });

    const syncFromCurrent = (field: CustomField | null) => {
        setEditingId(field?.id ?? null);
        setData({
            name: field?.name ?? '',
            type: field?.type ?? 'text',
            optionsText: field?.options?.join('\n') ?? '',
            required: field?.required ?? false,
            order: field?.order ?? 0,
        });
    };

    const submit = (e: React.FormEvent) => {
        e.preventDefault();

        transform(() => ({
            name: data.name,
            type: data.type,
            required: data.required,
            order: data.order,
            options: data.optionsText.split('\n').map((entry) => entry.trim()).filter(Boolean),
        }));

        if (editingId) {
            put(route('app.contacts.fields.update', { field: editingId }), {
                preserveScroll: true,
                onSuccess: () => syncFromCurrent(null),
            });
            return;
        }

        post(route('app.contacts.fields.store'), {
            preserveScroll: true,
            onSuccess: () => {
                reset();
                setData('type', 'text');
                setData('required', false);
                setData('order', 0);
            },
        });
    };

    const destroyField = (field: CustomField) => {
        if (!confirm(`Delete custom field "${field.name}"? Existing saved values will be removed from contacts.`)) {
            return;
        }

        router.delete(route('app.contacts.fields.destroy', { field: field.id }), {
            preserveScroll: true,
            onSuccess: () => {
                if (editingId === field.id) {
                    syncFromCurrent(null);
                }
            },
        });
    };

    const isChoiceField = data.type === 'select' || data.type === 'multiselect';

    return (
        <AppShell>
            <Head title="Custom fields" />
            <div className="space-y-6">
                <div>
                    <Link
                        href={route('app.contacts.index')}
                        className="mb-4 inline-flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        Back to Contacts
                    </Link>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Custom fields</h1>
                    <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                        Add CRM fields for lead source, plan, city, lifecycle stage, or any data you want to segment on later.
                    </p>
                </div>

                <div className="grid gap-6 lg:grid-cols-[minmax(0,1.2fr)_24rem]">
                    <Card>
                        <CardHeader>
                            <CardTitle>Saved fields</CardTitle>
                            <CardDescription>These fields will appear on contact forms and can be used in segment rules.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            {fields.length === 0 ? (
                                <div className="rounded-xl border border-dashed border-gray-300 px-4 py-8 text-sm text-gray-500 dark:border-gray-700 dark:text-gray-400">
                                    No custom fields yet.
                                </div>
                            ) : (
                                fields.map((field) => (
                                    <div key={field.id} className="flex items-start justify-between rounded-xl border border-gray-200 px-4 py-3 dark:border-gray-800">
                                        <div className="min-w-0">
                                            <div className="flex items-center gap-2">
                                                <div className="font-medium text-gray-900 dark:text-gray-100">{field.name}</div>
                                                <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-600 dark:bg-gray-800 dark:text-gray-300">{field.type}</span>
                                                {field.required ? <span className="rounded-full bg-blue-50 px-2 py-0.5 text-xs text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">Required</span> : null}
                                            </div>
                                            <div className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                                                Key: {field.key}{field.options.length > 0 ? ` · ${field.options.join(', ')}` : ''}
                                            </div>
                                        </div>
                                        <div className="ml-4 flex items-center gap-2">
                                            <Button type="button" variant="secondary" size="sm" onClick={() => syncFromCurrent(field)}>
                                                <Pencil className="mr-2 h-4 w-4" />
                                                Edit
                                            </Button>
                                            <Button type="button" variant="danger" size="sm" onClick={() => destroyField(field)}>
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </div>
                                ))
                            )}
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>{editingId ? 'Edit field' : 'Add field'}</CardTitle>
                            <CardDescription>Use select or multi-select for values you want to segment reliably.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={submit} className="space-y-4">
                                <div>
                                    <InputLabel value="Label" />
                                    <TextInput value={data.name} onChange={(e) => setData('name', e.target.value)} className="mt-1 w-full" />
                                    <InputError message={errors.name} className="mt-2" />
                                </div>

                                <div>
                                    <InputLabel value="Type" />
                                    <select
                                        value={data.type}
                                        onChange={(e) => setData('type', e.target.value)}
                                        className="mt-1 block w-full rounded-md border border-gray-300 dark:border-gray-700 dark:bg-gray-800"
                                    >
                                        {field_types.map((type) => (
                                            <option key={type.value} value={type.value}>{type.label}</option>
                                        ))}
                                    </select>
                                    <InputError message={errors.type} className="mt-2" />
                                </div>

                                {isChoiceField ? (
                                    <div>
                                        <InputLabel value="Options" />
                                        <textarea
                                            value={data.optionsText}
                                            onChange={(e) => setData('optionsText', e.target.value)}
                                            rows={5}
                                            placeholder="One option per line"
                                            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 dark:border-gray-700 dark:bg-gray-800"
                                        />
                                        <InputError message={(errors as Record<string, string>).options} className="mt-2" />
                                    </div>
                                ) : null}

                                <div>
                                    <InputLabel value="Display order" />
                                    <TextInput type="number" min={0} value={String(data.order)} onChange={(e) => setData('order', Number(e.target.value))} className="mt-1 w-full" />
                                </div>

                                <label className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                                    <input type="checkbox" checked={data.required} onChange={(e) => setData('required', e.target.checked)} className="rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                                    Required on contact forms
                                </label>

                                <div className="flex gap-2">
                                    <Button type="submit" disabled={processing}>
                                        <Plus className="mr-2 h-4 w-4" />
                                        {editingId ? 'Save field' : 'Add field'}
                                    </Button>
                                    {editingId ? <Button type="button" variant="secondary" onClick={() => syncFromCurrent(null)}>Cancel</Button> : null}
                                </div>
                            </form>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AppShell>
    );
}
