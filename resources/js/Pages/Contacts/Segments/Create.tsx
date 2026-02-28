import { useForm } from '@inertiajs/react';
import AppShell from '@/Layouts/AppShell';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/Components/UI/Card';
import Button from '@/Components/UI/Button';
import TextInput from '@/Components/TextInput';
import InputLabel from '@/Components/InputLabel';
import InputError from '@/Components/InputError';
import { ArrowLeft, Plus, X } from 'lucide-react';
import { Link, Head } from '@inertiajs/react';
import { useToast } from '@/hooks/useToast';

interface FilterField {
    value: string;
    label: string;
}

const OPERATORS = [
    { value: 'equals', label: 'equals' },
    { value: 'not_equals', label: 'not equals' },
    { value: 'contains', label: 'contains' },
    { value: 'not_contains', label: 'does not contain' },
    { value: 'starts_with', label: 'starts with' },
    { value: 'ends_with', label: 'ends with' },
    { value: 'is_empty', label: 'is empty' },
    { value: 'is_not_empty', label: 'is not empty' },
];

export default function SegmentsCreate({
    account,
    filter_fields,
}: {
    account: any;
    filter_fields: FilterField[];
}) {
    const { toast } = useToast();

    const { data, setData, post, processing, errors } = useForm({
        name: '',
        description: '',
        filters: [] as Array<{ field: string; operator: string; value: string }>,
    });

    const addFilter = () => {
        setData('filters', [...data.filters, { field: filter_fields[0]?.value ?? 'name', operator: 'equals', value: '' }]);
    };

    const removeFilter = (index: number) => {
        setData('filters', data.filters.filter((_, i) => i !== index));
    };

    const updateFilter = (index: number, key: 'field' | 'operator' | 'value', value: string) => {
        const next = [...data.filters];
        next[index] = { ...next[index], [key]: value };
        setData('filters', next);
    };

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('app.contacts.segments.store'), {
            onError: () => toast.error('Failed to create segment'),
        });
    };

    return (
        <AppShell>
            <Head title="New Segment" />
            <div className="space-y-6">
                <div>
                    <Link
                        href={route('app.contacts.segments.index')}
                        className="inline-flex items-center gap-2 text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 mb-4"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        Back to Segments
                    </Link>
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-gray-100 dark:to-gray-300 bg-clip-text text-transparent">
                        New Segment
                    </h1>
                </div>

                <form onSubmit={submit}>
                    <Card>
                        <CardHeader>
                            <CardTitle>Segment details</CardTitle>
                            <CardDescription>Name and optional description</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <InputLabel value="Name *" />
                                <TextInput
                                    value={data.name}
                                    onChange={(e) => setData('name', e.target.value)}
                                    className="mt-1 w-full max-w-md"
                                    required
                                />
                                <InputError message={errors.name} />
                            </div>
                            <div>
                                <InputLabel value="Description (optional)" />
                                <textarea
                                    value={data.description}
                                    onChange={(e) => setData('description', e.target.value)}
                                    className="mt-1 w-full max-w-md rounded-md border border-gray-300 dark:border-gray-700 dark:bg-gray-800 px-3 py-2"
                                    rows={2}
                                />
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="mt-6">
                        <CardHeader>
                            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                                <div>
                                    <CardTitle>Filters</CardTitle>
                                    <CardDescription>Contacts that match all rules below will be in this segment</CardDescription>
                                </div>
                                <Button type="button" variant="secondary" size="sm" className="w-full sm:w-auto" onClick={addFilter}>
                                    <Plus className="h-4 w-4 mr-2" />
                                    Add rule
                                </Button>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {data.filters.length === 0 ? (
                                <p className="text-sm text-gray-500 dark:text-gray-400">No filters. Add a rule to limit which contacts are in this segment, or leave empty to leave the segment empty until you add rules later.</p>
                            ) : (
                                data.filters.map((filter, index) => (
                                    <div key={index} className="grid grid-cols-1 sm:grid-cols-[10rem_9rem_minmax(0,1fr)_auto] items-end gap-2 p-3 rounded-lg bg-gray-50 dark:bg-gray-800/50">
                                        <div className="w-full">
                                            <InputLabel value="Field" />
                                            <select
                                                value={filter.field}
                                                onChange={(e) => updateFilter(index, 'field', e.target.value)}
                                                className="mt-1 block w-full rounded-md border border-gray-300 dark:border-gray-700 dark:bg-gray-800"
                                            >
                                                {filter_fields.map((f) => (
                                                    <option key={f.value} value={f.value}>{f.label}</option>
                                                ))}
                                            </select>
                                        </div>
                                        <div className="w-full">
                                            <InputLabel value="Operator" />
                                            <select
                                                value={filter.operator}
                                                onChange={(e) => updateFilter(index, 'operator', e.target.value)}
                                                className="mt-1 block w-full rounded-md border border-gray-300 dark:border-gray-700 dark:bg-gray-800"
                                            >
                                                {OPERATORS.map((op) => (
                                                    <option key={op.value} value={op.value}>{op.label}</option>
                                                ))}
                                            </select>
                                        </div>
                                        {filter.operator !== 'is_empty' && filter.operator !== 'is_not_empty' && (
                                            <div className="flex-1 min-w-[120px]">
                                                <InputLabel value="Value" />
                                                <TextInput
                                                    value={filter.value}
                                                    onChange={(e) => updateFilter(index, 'value', e.target.value)}
                                                    className="mt-1"
                                                />
                                            </div>
                                        )}
                                        <Button type="button" variant="secondary" size="sm" className="w-full sm:w-auto" onClick={() => removeFilter(index)}>
                                            <X className="h-4 w-4" />
                                        </Button>
                                    </div>
                                ))
                            )}
                        </CardContent>
                    </Card>

                    <div className="mt-6 flex flex-col-reverse sm:flex-row gap-3 sm:gap-4">
                        <Button type="submit" className="w-full sm:w-auto" disabled={processing}>Create segment</Button>
                        <Link href={route('app.contacts.segments.index')} className="w-full sm:w-auto">
                            <Button type="button" variant="secondary" className="w-full sm:w-auto">Cancel</Button>
                        </Link>
                    </div>
                </form>
            </div>
        </AppShell>
    );
}
