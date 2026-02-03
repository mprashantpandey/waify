import { router, useForm } from '@inertiajs/react';
import AppShell from '@/Layouts/AppShell';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/Components/UI/Card';
import Button from '@/Components/UI/Button';
import { ArrowLeft, Plus, Trash2, AlertCircle, Info } from 'lucide-react';
import { Head, Link } from '@inertiajs/react';
import { useState } from 'react';
import TextInput from '@/Components/TextInput';
import { Label } from '@/Components/UI/Label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/Components/UI/Select';
import { Textarea } from '@/Components/UI/Textarea';
import { Alert } from '@/Components/UI/Alert';
import { useToast } from '@/hooks/useToast';

interface Section {
    title: string;
    rows: Row[];
}

interface Row {
    id: string;
    title: string;
    description?: string;
}

interface ListFormData {
    whatsapp_connection_id: string;
    name: string;
    button_text: string;
    description?: string;
    footer_text?: string;
    sections: Section[];
}

export default function ListsCreate({
    account,
    connections}: {
    account: any;
    connections: Array<{ id: number; name: string }>;
}) {
    const { toast } = useToast();

    const { data, setData, post, processing, errors } = useForm<ListFormData>({
        whatsapp_connection_id: connections?.[0]?.id?.toString() || '',
        name: '',
        button_text: '',
        description: '',
        footer_text: '',
        sections: [
            {
                title: '',
                rows: [
                    { id: '', title: '', description: '' },
                ],
            },
        ],
    });

    const addSection = () => {
        if (data.sections.length >= 10) {
            toast.error('Maximum 10 sections allowed');
            return;
        }
        setData('sections', [
            ...data.sections,
            { title: '', rows: [{ id: '', title: '', description: '' }] },
        ]);
    };

    const removeSection = (index: number) => {
        const sections = [...data.sections];
        sections.splice(index, 1);
        setData('sections', sections);
    };

    const updateSection = (index: number, field: 'title', value: string) => {
        const sections = [...data.sections];
        sections[index] = { ...sections[index], [field]: value };
        setData('sections', sections);
    };

    const addRow = (sectionIndex: number) => {
        const sections = [...data.sections];
        if (sections[sectionIndex].rows.length >= 10) {
            toast.error('Maximum 10 rows per section allowed');
            return;
        }
        const totalRows = sections.reduce((sum, s) => sum + s.rows.length, 0);
        if (totalRows >= 10) {
            toast.error('Maximum 10 total rows across all sections');
            return;
        }
        sections[sectionIndex].rows.push({ id: '', title: '', description: '' });
        setData('sections', sections);
    };

    const removeRow = (sectionIndex: number, rowIndex: number) => {
        const sections = [...data.sections];
        sections[sectionIndex].rows.splice(rowIndex, 1);
        if (sections[sectionIndex].rows.length === 0) {
            sections[sectionIndex].rows.push({ id: '', title: '', description: '' });
        }
        setData('sections', sections);
    };

    const updateRow = (sectionIndex: number, rowIndex: number, field: keyof Row, value: string) => {
        const sections = [...data.sections];
        sections[sectionIndex].rows[rowIndex] = {
            ...sections[sectionIndex].rows[rowIndex],
            [field]: value,
        };
        setData('sections', sections);
    };

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('app.whatsapp.lists.store', {}), {
            onSuccess: () => {
                toast.success('List created successfully');
            },
            onError: (errors) => {
                toast.error('Failed to create list', Object.values(errors).flat().join(', '));
            },
        });
    };

    const totalRows = data.sections.reduce((sum, s) => sum + s.rows.length, 0);

    return (
        <AppShell>
            <Head title="Create WhatsApp List" />
            <div className="space-y-6">
                <div className="flex items-center gap-4">
                    <Link href={route('app.whatsapp.lists.index', {})}>
                        <Button variant="ghost" size="sm">
                            <ArrowLeft className="h-4 w-4 mr-2" />
                            Back
                        </Button>
                    </Link>
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Create List</h1>
                        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                            Create an interactive list message for WhatsApp
                        </p>
                    </div>
                </div>

                <Alert variant="info" className="mb-6">
                    <Info className="h-5 w-5" />
                    <div>
                        <p className="font-semibold mb-1">List Message Guidelines</p>
                        <ul className="text-sm space-y-1 list-disc list-inside">
                            <li>Button text: Max 20 characters</li>
                            <li>Description: Max 1024 characters (optional)</li>
                            <li>Footer: Max 60 characters (optional)</li>
                            <li>Max 10 sections, each with max 10 rows</li>
                            <li>Total rows across all sections: Max 10</li>
                            <li>Section title: Max 24 characters</li>
                            <li>Row ID: Max 200 characters (unique identifier)</li>
                            <li>Row title: Max 24 characters</li>
                            <li>Row description: Max 72 characters (optional)</li>
                        </ul>
                    </div>
                </Alert>

                <form onSubmit={submit} className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Basic Information</CardTitle>
                            <CardDescription>Configure the list name and connection</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <Label htmlFor="connection">WhatsApp Connection *</Label>
                                <Select
                                    value={data.whatsapp_connection_id}
                                    onValueChange={(value) => setData('whatsapp_connection_id', value)}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select connection" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {connections.map((conn) => (
                                            <SelectItem key={conn.id} value={conn.id.toString()}>
                                                {conn.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                {errors.whatsapp_connection_id && (
                                    <p className="text-sm text-red-600 dark:text-red-400 mt-1">
                                        {errors.whatsapp_connection_id}
                                    </p>
                                )}
                            </div>

                            <div>
                                <Label htmlFor="name">List Name *</Label>
                                <TextInput
                                    id="name"
                                    value={data.name}
                                    onChange={(e) => setData('name', e.target.value)}
                                    placeholder="e.g., Product Catalog, Support Options"
                                    maxLength={255}
                                />
                                {errors.name && (
                                    <p className="text-sm text-red-600 dark:text-red-400 mt-1">{errors.name}</p>
                                )}
                            </div>

                            <div>
                                <Label htmlFor="button_text">Button Text * (Max 20 chars)</Label>
                                <TextInput
                                    id="button_text"
                                    value={data.button_text}
                                    onChange={(e) => setData('button_text', e.target.value)}
                                    placeholder="e.g., View Options, Browse"
                                    maxLength={20}
                                />
                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                    {data.button_text.length}/20 characters
                                </p>
                                {errors.button_text && (
                                    <p className="text-sm text-red-600 dark:text-red-400 mt-1">
                                        {errors.button_text}
                                    </p>
                                )}
                            </div>

                            <div>
                                <Label htmlFor="description">Description (Optional, Max 1024 chars)</Label>
                                <Textarea
                                    id="description"
                                    value={data.description || ''}
                                    onChange={(e) => setData('description', e.target.value)}
                                    placeholder="Optional description text"
                                    maxLength={1024}
                                    rows={3}
                                />
                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                    {(data.description || '').length}/1024 characters
                                </p>
                                {errors.description && (
                                    <p className="text-sm text-red-600 dark:text-red-400 mt-1">
                                        {errors.description}
                                    </p>
                                )}
                            </div>

                            <div>
                                <Label htmlFor="footer_text">Footer Text (Optional, Max 60 chars)</Label>
                                <TextInput
                                    id="footer_text"
                                    value={data.footer_text || ''}
                                    onChange={(e) => setData('footer_text', e.target.value)}
                                    placeholder="Optional footer text"
                                    maxLength={60}
                                />
                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                    {(data.footer_text || '').length}/60 characters
                                </p>
                                {errors.footer_text && (
                                    <p className="text-sm text-red-600 dark:text-red-400 mt-1">
                                        {errors.footer_text}
                                    </p>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <div>
                                    <CardTitle>Sections & Rows</CardTitle>
                                    <CardDescription>
                                        Configure list sections and rows ({data.sections.length} sections, {totalRows}{' '}
                                        rows)
                                    </CardDescription>
                                </div>
                                <Button type="button" onClick={addSection} variant="secondary" size="sm">
                                    <Plus className="h-4 w-4 mr-2" />
                                    Add Section
                                </Button>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            {data.sections.map((section, sectionIndex) => (
                                <div
                                    key={sectionIndex}
                                    className="border border-gray-200 dark:border-gray-700 rounded-xl p-4 space-y-4"
                                >
                                    <div className="flex items-center justify-between">
                                        <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                                            Section {sectionIndex + 1}
                                        </h3>
                                        {data.sections.length > 1 && (
                                            <Button
                                                type="button"
                                                onClick={() => removeSection(sectionIndex)}
                                                variant="ghost"
                                                size="sm"
                                            >
                                                <Trash2 className="h-4 w-4 text-red-500" />
                                            </Button>
                                        )}
                                    </div>

                                    <div>
                                        <Label>Section Title * (Max 24 chars)</Label>
                                        <TextInput
                                            value={section.title}
                                            onChange={(e) =>
                                                updateSection(sectionIndex, 'title', e.target.value)
                                            }
                                            placeholder="Section title"
                                            maxLength={24}
                                        />
                                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                            {section.title.length}/24 characters
                                        </p>
                                        {errors[`sections.${sectionIndex}.title`] && (
                                            <p className="text-sm text-red-600 dark:text-red-400 mt-1">
                                                {errors[`sections.${sectionIndex}.title`]}
                                            </p>
                                        )}
                                    </div>

                                    <div className="space-y-3">
                                        <div className="flex items-center justify-between">
                                            <Label>Rows ({section.rows.length}/10)</Label>
                                            <Button
                                                type="button"
                                                onClick={() => addRow(sectionIndex)}
                                                variant="secondary"
                                                size="sm"
                                            >
                                                <Plus className="h-4 w-4 mr-2" />
                                                Add Row
                                            </Button>
                                        </div>

                                        {section.rows.map((row, rowIndex) => (
                                            <div
                                                key={rowIndex}
                                                className="border border-gray-200 dark:border-gray-700 rounded-lg p-3 space-y-2"
                                            >
                                                <div className="flex items-center justify-between">
                                                    <span className="text-xs font-semibold text-gray-500">
                                                        Row {rowIndex + 1}
                                                    </span>
                                                    {section.rows.length > 1 && (
                                                        <Button
                                                            type="button"
                                                            onClick={() => removeRow(sectionIndex, rowIndex)}
                                                            variant="ghost"
                                                            size="sm"
                                                        >
                                                            <Trash2 className="h-3 w-3 text-red-500" />
                                                        </Button>
                                                    )}
                                                </div>

                                                <div>
                                                    <Label className="text-xs">Row ID * (Max 200 chars)</Label>
                                                    <TextInput
                                                        value={row.id}
                                                        onChange={(e) =>
                                                            updateRow(sectionIndex, rowIndex, 'id', e.target.value)
                                                        }
                                                        placeholder="Unique identifier (e.g., product_1)"
                                                        maxLength={200}
                                                        className="text-sm"
                                                    />
                                                    {errors[`sections.${sectionIndex}.rows.${rowIndex}.id`] && (
                                                        <p className="text-xs text-red-600 dark:text-red-400 mt-1">
                                                            {errors[`sections.${sectionIndex}.rows.${rowIndex}.id`]}
                                                        </p>
                                                    )}
                                                </div>

                                                <div>
                                                    <Label className="text-xs">Row Title * (Max 24 chars)</Label>
                                                    <TextInput
                                                        value={row.title}
                                                        onChange={(e) =>
                                                            updateRow(sectionIndex, rowIndex, 'title', e.target.value)
                                                        }
                                                        placeholder="Row title"
                                                        maxLength={24}
                                                        className="text-sm"
                                                    />
                                                    {errors[`sections.${sectionIndex}.rows.${rowIndex}.title`] && (
                                                        <p className="text-xs text-red-600 dark:text-red-400 mt-1">
                                                            {errors[`sections.${sectionIndex}.rows.${rowIndex}.title`]}
                                                        </p>
                                                    )}
                                                </div>

                                                <div>
                                                    <Label className="text-xs">
                                                        Row Description (Optional, Max 72 chars)
                                                    </Label>
                                                    <TextInput
                                                        value={row.description || ''}
                                                        onChange={(e) =>
                                                            updateRow(
                                                                sectionIndex,
                                                                rowIndex,
                                                                'description',
                                                                e.target.value
                                                            )
                                                        }
                                                        placeholder="Optional description"
                                                        maxLength={72}
                                                        className="text-sm"
                                                    />
                                                    {errors[`sections.${sectionIndex}.rows.${rowIndex}.description`] && (
                                                        <p className="text-xs text-red-600 dark:text-red-400 mt-1">
                                                            {
                                                                errors[
                                                                    `sections.${sectionIndex}.rows.${rowIndex}.description`
                                                                ]
                                                            }
                                                        </p>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))}

                            {errors.sections && (
                                <Alert variant="error">
                                    <AlertCircle className="h-5 w-5" />
                                    <div>
                                        {Array.isArray(errors.sections) ? (
                                            <ul className="list-disc list-inside">
                                                {errors.sections.map((error, i) => (
                                                    <li key={i}>{error}</li>
                                                ))}
                                            </ul>
                                        ) : (
                                            <p>{errors.sections}</p>
                                        )}
                                    </div>
                                </Alert>
                            )}
                        </CardContent>
                    </Card>

                    <div className="flex items-center justify-end gap-4">
                        <Link href={route('app.whatsapp.lists.index', {})}>
                            <Button type="button" variant="secondary">
                                Cancel
                            </Button>
                        </Link>
                        <Button type="submit" disabled={processing}>
                            {processing ? 'Creating...' : 'Create List'}
                        </Button>
                    </div>
                </form>
            </div>
        </AppShell>
    );
}

