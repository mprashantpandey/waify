import { Head, Link, useForm } from '@inertiajs/react';
import { useMemo, type FormEvent } from 'react';
import AppShell from '@/Layouts/AppShell';
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/UI/Card';
import Button from '@/Components/UI/Button';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import InputError from '@/Components/InputError';
import { Plus, Trash2 } from 'lucide-react';

type Connection = { id: number; name: string };
type Template = { id: number; name: string; language: string | null; whatsapp_connection_id: number | null };
type Segment = { id: number; name: string; contact_count: number };

type Step = {
    type: 'text' | 'template';
    delay_minutes: number;
    message_text: string;
    whatsapp_template_id: string;
    template_params: string[];
};

export default function SequenceCreate({ connections, templates, segments }: { connections: Connection[]; templates: Template[]; segments: Segment[] }) {
    const { data, setData, post, processing, errors } = useForm({
        name: '',
        description: '',
        whatsapp_connection_id: connections[0]?.id ?? '',
        audience_type: 'contacts',
        audience_filters: { segment_ids: [] as number[] },
        custom_recipients: [{ name: '', phone: '' }],
        steps: [{ type: 'text', delay_minutes: 0, message_text: '', whatsapp_template_id: '', template_params: [] }] as Step[],
    });

    const filteredTemplates = useMemo(() => {
        return templates.filter((template) => !template.whatsapp_connection_id || template.whatsapp_connection_id === Number(data.whatsapp_connection_id));
    }, [templates, data.whatsapp_connection_id]);

    const submit = (e: FormEvent) => {
        e.preventDefault();
        post(route('app.broadcasts.sequences.store'));
    };

    return (
        <AppShell>
            <Head title="Create Sequence" />
            <form onSubmit={submit} className="space-y-6">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-3xl font-semibold text-gray-950 dark:text-white">Create sequence</h1>
                        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                            Set an audience and queue follow-ups by time delay.
                        </p>
                    </div>
                    <div className="flex gap-2">
                        <Link href={route('app.broadcasts.sequences.index')}>
                            <Button variant="secondary">Back</Button>
                        </Link>
                        <Button type="submit" disabled={processing}>Save sequence</Button>
                    </div>
                </div>

                <Card>
                    <CardHeader><CardTitle>Basics</CardTitle></CardHeader>
                    <CardContent className="grid gap-4 md:grid-cols-2">
                        <div>
                            <InputLabel htmlFor="name" value="Sequence name" />
                            <TextInput id="name" value={data.name} onChange={(e) => setData('name', e.target.value)} className="mt-1 block w-full" />
                            <InputError message={errors.name} className="mt-2" />
                        </div>
                        <div>
                            <InputLabel htmlFor="whatsapp_connection_id" value="Connection" />
                            <select id="whatsapp_connection_id" value={data.whatsapp_connection_id} onChange={(e) => setData('whatsapp_connection_id', Number(e.target.value))} className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-700 dark:bg-gray-900">
                                {connections.map((connection) => <option key={connection.id} value={connection.id}>{connection.name}</option>)}
                            </select>
                            <InputError message={errors.whatsapp_connection_id} className="mt-2" />
                        </div>
                        <div className="md:col-span-2">
                            <InputLabel htmlFor="description" value="Description" />
                            <textarea id="description" value={data.description} onChange={(e) => setData('description', e.target.value)} rows={3} className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-700 dark:bg-gray-900" />
                            <InputError message={errors.description} className="mt-2" />
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader><CardTitle>Audience</CardTitle></CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid gap-4 md:grid-cols-3">
                            {['contacts', 'segment', 'custom'].map((option) => (
                                <button key={option} type="button" onClick={() => setData('audience_type', option)} className={`rounded-2xl border p-4 text-left ${data.audience_type === option ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/30' : 'border-gray-200 dark:border-gray-800'}`}>
                                    <div className="font-medium capitalize text-gray-950 dark:text-white">{option}</div>
                                </button>
                            ))}
                        </div>

                        {data.audience_type === 'segment' ? (
                            <div>
                                <InputLabel value="Segments" />
                                <div className="mt-2 grid gap-2 md:grid-cols-2">
                                    {segments.map((segment) => {
                                        const checked = data.audience_filters.segment_ids.includes(segment.id);
                                        return (
                                            <label key={segment.id} className="flex items-center justify-between rounded-xl border border-gray-200 px-3 py-2 dark:border-gray-800">
                                                <span className="text-sm text-gray-900 dark:text-gray-100">{segment.name} <span className="text-gray-500">({segment.contact_count})</span></span>
                                                <input type="checkbox" checked={checked} onChange={(e) => setData('audience_filters', { segment_ids: e.target.checked ? [...data.audience_filters.segment_ids, segment.id] : data.audience_filters.segment_ids.filter((id) => id !== segment.id) })} />
                                            </label>
                                        );
                                    })}
                                </div>
                                <InputError message={errors['audience_filters.segment_ids']} className="mt-2" />
                            </div>
                        ) : null}

                        {data.audience_type === 'custom' ? (
                            <div className="space-y-3">
                                {data.custom_recipients.map((recipient, index) => (
                                    <div key={index} className="grid gap-3 md:grid-cols-[1fr_1fr_auto]">
                                        <TextInput placeholder="Name" value={recipient.name} onChange={(e) => {
                                            const next = [...data.custom_recipients];
                                            next[index].name = e.target.value;
                                            setData('custom_recipients', next);
                                        }} />
                                        <TextInput placeholder="Phone" value={recipient.phone} onChange={(e) => {
                                            const next = [...data.custom_recipients];
                                            next[index].phone = e.target.value;
                                            setData('custom_recipients', next);
                                        }} />
                                        <Button type="button" variant="secondary" onClick={() => setData('custom_recipients', data.custom_recipients.filter((_, i) => i !== index))}>
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                ))}
                                <Button type="button" variant="secondary" onClick={() => setData('custom_recipients', [...data.custom_recipients, { name: '', phone: '' }])}>
                                    <Plus className="mr-2 h-4 w-4" /> Add recipient
                                </Button>
                                <InputError message={errors.custom_recipients} className="mt-2" />
                            </div>
                        ) : null}
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                        <CardTitle>Steps</CardTitle>
                        <Button type="button" variant="secondary" onClick={() => setData('steps', [...data.steps, { type: 'text', delay_minutes: 0, message_text: '', whatsapp_template_id: '', template_params: [] }])}>
                            <Plus className="mr-2 h-4 w-4" /> Add step
                        </Button>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {data.steps.map((step, index) => (
                            <div key={index} className="rounded-2xl border border-gray-200 p-4 dark:border-gray-800">
                                <div className="mb-4 flex items-center justify-between">
                                    <div className="font-medium text-gray-950 dark:text-white">Step {index + 1}</div>
                                    {data.steps.length > 1 ? (
                                        <Button type="button" variant="secondary" onClick={() => setData('steps', data.steps.filter((_, i) => i !== index))}>
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    ) : null}
                                </div>
                                <div className="grid gap-4 md:grid-cols-3">
                                    <div>
                                        <InputLabel value="Step type" />
                                        <select value={step.type} onChange={(e) => {
                                            const next = [...data.steps];
                                            next[index].type = e.target.value as 'text' | 'template';
                                            setData('steps', next);
                                        }} className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-700 dark:bg-gray-900">
                                            <option value="text">Text</option>
                                            <option value="template">Template</option>
                                        </select>
                                    </div>
                                    <div>
                                        <InputLabel value="Delay (minutes)" />
                                        <TextInput type="number" min={0} value={step.delay_minutes} onChange={(e) => {
                                            const next = [...data.steps];
                                            next[index].delay_minutes = Number(e.target.value || 0);
                                            setData('steps', next);
                                        }} className="mt-1 block w-full" />
                                    </div>
                                </div>
                                {step.type === 'text' ? (
                                    <div className="mt-4">
                                        <InputLabel value="Message" />
                                        <textarea value={step.message_text} onChange={(e) => {
                                            const next = [...data.steps];
                                            next[index].message_text = e.target.value;
                                            setData('steps', next);
                                        }} rows={4} className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-700 dark:bg-gray-900" />
                                        <InputError message={errors[`steps.${index}.message_text` as keyof typeof errors]} className="mt-2" />
                                    </div>
                                ) : (
                                    <div className="mt-4">
                                        <InputLabel value="Template" />
                                        <select value={step.whatsapp_template_id} onChange={(e) => {
                                            const next = [...data.steps];
                                            next[index].whatsapp_template_id = e.target.value;
                                            setData('steps', next);
                                        }} className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-700 dark:bg-gray-900">
                                            <option value="">Select a template</option>
                                            {filteredTemplates.map((template) => <option key={template.id} value={template.id}>{template.name}</option>)}
                                        </select>
                                        <InputError message={errors[`steps.${index}.whatsapp_template_id` as keyof typeof errors]} className="mt-2" />
                                    </div>
                                )}
                            </div>
                        ))}
                    </CardContent>
                </Card>
            </form>
        </AppShell>
    );
}
