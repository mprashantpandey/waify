import { Head, Link, router, useForm } from '@inertiajs/react';
import AppShell from '@/Layouts/AppShell';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/Components/UI/Card';
import Button from '@/Components/UI/Button';
import TextInput from '@/Components/TextInput';
import InputLabel from '@/Components/InputLabel';
import InputError from '@/Components/InputError';
import { Textarea } from '@/Components/UI/Textarea';

type ThreadRow = {
    id: number;
    slug: string;
    subject: string;
    status: string;
    priority?: string | null;
    category?: string | null;
    messages_count?: number;
    last_message_at?: string | null;
    created_at?: string | null;
    creator?: { name?: string | null } | null;
};

export default function SupportIndex({ threads, filters }: { threads: any; filters: { status?: string; search?: string } }) {
    const createForm = useForm<{ subject: string; message: string; priority: string; category: string; attachments: File[] }>({
        subject: '', message: '', priority: 'normal', category: '', attachments: [],
    });
    const status = filters?.status || '';
    const search = filters?.search || '';

    const applyFilters = (next: Record<string, string>) => {
        router.get(route('app.support.index'), { ...filters, ...next }, { preserveState: true, replace: true });
    };

    return (
        <AppShell>
            <Head title="Support Tickets" />
            <div className="space-y-6">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Support Tickets</h1>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Create and track support requests for your account.</p>
                    </div>
                </div>

                <div className="grid gap-6 lg:grid-cols-3">
                    <Card className="lg:col-span-2">
                        <CardHeader>
                            <CardTitle>Tickets</CardTitle>
                            <CardDescription>Open and closed support tickets</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex flex-col gap-3 sm:flex-row">
                                <TextInput
                                    value={search}
                                    onChange={(e) => applyFilters({ search: e.target.value })}
                                    placeholder="Search subject or ticket"
                                    className="w-full"
                                />
                                <select
                                    value={status}
                                    onChange={(e) => applyFilters({ status: e.target.value })}
                                    className="rounded-md border border-gray-300 bg-white px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-900"
                                >
                                    <option value="">All statuses</option>
                                    <option value="open">Open</option>
                                    <option value="closed">Closed</option>
                                    <option value="pending">Pending</option>
                                </select>
                            </div>

                            <div className="divide-y divide-gray-200 dark:divide-gray-800 rounded-lg border border-gray-200 dark:border-gray-800">
                                {(threads?.data || []).length === 0 && (
                                    <div className="px-4 py-8 text-center text-sm text-gray-500 dark:text-gray-400">
                                        No support tickets yet.
                                    </div>
                                )}
                                {(threads?.data || []).map((thread: ThreadRow) => (
                                    <Link
                                        key={thread.id}
                                        href={route('app.support.show', { thread: thread.slug })}
                                        className="block px-4 py-4 hover:bg-gray-50 dark:hover:bg-gray-800/50"
                                    >
                                        <div className="flex items-start justify-between gap-3">
                                            <div className="min-w-0">
                                                <p className="truncate text-sm font-semibold text-gray-900 dark:text-gray-100">{thread.subject}</p>
                                                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                                                    #{thread.slug} · {thread.messages_count ?? 0} messages · {thread.creator?.name || 'Unknown'}
                                                </p>
                                            </div>
                                            <div className="flex shrink-0 items-center gap-2 text-xs">
                                                <span className={`rounded-full px-2 py-1 ${thread.status === 'closed' ? 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300' : 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300'}`}>
                                                    {thread.status}
                                                </span>
                                                {thread.priority && (
                                                    <span className="rounded-full bg-blue-100 px-2 py-1 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">
                                                        {thread.priority}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Create Ticket</CardTitle>
                            <CardDescription>Open a new support request</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={(e) => { e.preventDefault(); createForm.post(route('app.support.store'), { forceFormData: true }); }} className="space-y-4">
                                <div>
                                    <InputLabel htmlFor="subject" value="Subject" />
                                    <TextInput id="subject" value={createForm.data.subject} onChange={(e) => createForm.setData('subject', e.target.value)} className="mt-1 w-full" />
                                    <InputError message={createForm.errors.subject} className="mt-1" />
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <InputLabel htmlFor="priority" value="Priority" />
                                        <select
                                            id="priority"
                                            value={createForm.data.priority}
                                            onChange={(e) => createForm.setData('priority', e.target.value)}
                                            className="mt-1 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-900"
                                        >
                                            <option value="low">Low</option>
                                            <option value="normal">Normal</option>
                                            <option value="high">High</option>
                                            <option value="urgent">Urgent</option>
                                        </select>
                                    </div>
                                    <div>
                                        <InputLabel htmlFor="category" value="Category" />
                                        <TextInput id="category" value={createForm.data.category} onChange={(e) => createForm.setData('category', e.target.value)} className="mt-1 w-full" placeholder="billing / setup" />
                                    </div>
                                </div>
                                <div>
                                    <InputLabel htmlFor="message" value="Message" />
                                    <Textarea id="message" value={createForm.data.message} onChange={(e) => createForm.setData('message', e.target.value)} className="mt-1 min-h-[140px]" />
                                    <InputError message={createForm.errors.message} className="mt-1" />
                                </div>
                                <div>
                                    <InputLabel htmlFor="attachments" value="Attachments (Optional)" />
                                    <input
                                        id="attachments"
                                        type="file"
                                        multiple
                                        onChange={(e) => createForm.setData('attachments', Array.from(e.target.files || []))}
                                        className="mt-1 block w-full text-sm text-gray-700 dark:text-gray-300 file:mr-3 file:rounded-md file:border-0 file:bg-gray-100 file:px-3 file:py-2 dark:file:bg-gray-800"
                                    />
                                    <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">Up to 5 files, 10MB each.</p>
                                    <InputError message={createForm.errors.attachments as any} className="mt-1" />
                                    {createForm.data.attachments.length > 0 && (
                                        <ul className="mt-2 space-y-1 text-xs text-gray-600 dark:text-gray-400">
                                            {createForm.data.attachments.map((f, i) => <li key={`${f.name}-${i}`}>{f.name}</li>)}
                                        </ul>
                                    )}
                                </div>
                                <Button type="submit" disabled={createForm.processing} className="w-full">
                                    {createForm.processing ? 'Creating...' : 'Create Ticket'}
                                </Button>
                            </form>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AppShell>
    );
}
