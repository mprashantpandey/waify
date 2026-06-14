import AppShell from '@/Layouts/AppShell';
import { Head, router, useForm } from '@inertiajs/react';
import { useEffect, useMemo, useState } from 'react';
import { Paperclip, Plus, Send } from 'lucide-react';
import Button from '@/Components/UI/Button';
import { Badge } from '@/Components/UI/Badge';
import { Card } from '@/Components/UI/Card';
import { FileDropzone, Modal, UploadedFileRow } from '@/Components/UI/Elements';
import TextInput from '@/Components/TextInput';
import InputError from '@/Components/InputError';
import { cn } from '@/lib/utils';

interface Thread {
    id: number;
    slug: string;
    subject: string;
    status: string;
    channel?: string;
    priority?: string;
    category?: string | null;
    tags?: string[];
    last_message_at: string | null;
    created_at: string;
}

interface Message {
    id: number;
    sender_type: string;
    sender_id: number | null;
    body: string;
    created_at: string;
    attachments?: {
        id: number;
        file_name: string;
        mime_type?: string | null;
        file_size?: number;
        url: string;
    }[];
}

const ticketStatus: Record<string, { label: string; variant: 'default' | 'success' | 'warning' | 'danger' | 'info' | 'secondary' | 'outline' }> = {
    open: { label: 'Open', variant: 'warning' },
    in_progress: { label: 'In progress', variant: 'info' },
    pending: { label: 'Waiting on you', variant: 'secondary' },
    waiting: { label: 'Waiting on you', variant: 'secondary' },
    resolved: { label: 'Resolved', variant: 'success' },
    closed: { label: 'Resolved', variant: 'success' },
};

const priorityClass: Record<string, string> = {
    urgent: 'bg-red-50 text-red-700 ring-red-200 dark:bg-red-500/15 dark:text-red-100 dark:ring-red-400/25',
    high: 'bg-amber-50 text-amber-700 ring-amber-200 dark:bg-amber-500/15 dark:text-amber-100 dark:ring-amber-400/25',
    normal: 'bg-blue-50 text-blue-700 ring-blue-200 dark:bg-blue-500/15 dark:text-blue-100 dark:ring-blue-400/25',
    low: 'bg-gray-50 text-gray-700 ring-gray-200 dark:bg-slate-800 dark:text-slate-300 dark:ring-slate-700',
};

function relativeTime(value?: string | null) {
    if (!value) return 'Never';
    const diff = Date.now() - new Date(value).getTime();
    const minutes = Math.max(1, Math.round(diff / 60000));
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.round(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    return `${Math.round(hours / 24)}d ago`;
}

function PriorityBadge({ priority = 'normal' }: { priority?: string }) {
    return (
        <span className={cn('rounded-full px-2 py-0.5 text-[11px] font-medium capitalize ring-1', priorityClass[priority] ?? priorityClass.normal)}>
            {priority}
        </span>
    );
}

export default function SupportIndex({
    threads,
    selectedThreadId,
    messages = [],
}: {
    account: any;
    threads: Thread[];
    selectedThreadId?: number | null;
    messages?: Message[];
}) {
    const [selectedId, setSelectedId] = useState<number | null>(selectedThreadId ?? threads[0]?.id ?? null);
    const [filter, setFilter] = useState('all');
    const [newOpen, setNewOpen] = useState(false);

    useEffect(() => {
        setSelectedId(selectedThreadId ?? threads[0]?.id ?? null);
    }, [selectedThreadId, threads]);

    const selected = useMemo(
        () => threads.find((thread) => thread.id === selectedId) ?? threads[0] ?? null,
        [selectedId, threads]
    );

    const filtered = useMemo(() => {
        if (filter === 'all') return threads;
        if (filter === 'resolved') return threads.filter((thread) => ['resolved', 'closed'].includes(thread.status));
        return threads.filter((thread) => thread.status === filter);
    }, [filter, threads]);

    const createForm = useForm({
        subject: '',
        message: '',
        category: 'Templates',
        tags: '',
        attachments: [] as File[],
    });

    const replyForm = useForm({
        message: '',
        attachments: [] as File[],
    });

    const submitTicket = (event: React.FormEvent) => {
        event.preventDefault();
        createForm.post(route('app.support.store', {}) as string, {
            forceFormData: true,
            onSuccess: () => {
                createForm.reset();
                setNewOpen(false);
            },
        });
    };

    const submitReply = (event: React.FormEvent) => {
        event.preventDefault();
        if (!selected) return;
        replyForm.post(route('app.support.message', { thread: selected.slug ?? selected.id }) as string, {
            forceFormData: true,
            preserveScroll: true,
            onSuccess: () => replyForm.reset(),
        });
    };

    const openThread = (thread: Thread) => {
        setSelectedId(thread.id);
        router.get(
            route('app.support.index', { thread: thread.slug ?? thread.id }) as string,
            {},
            {
                preserveScroll: true,
                preserveState: true,
                only: ['selectedThreadId', 'messages'],
            }
        );
    };

    return (
        <AppShell>
            <Head title="Support" />
            <div className="mx-auto max-w-[1400px] space-y-4 p-0">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                    <div>
                        <h1 className="text-2xl font-semibold text-waify-text dark:text-waify-dark-text">Support</h1>
                        <p className="mt-1 text-sm text-waify-text-muted dark:text-waify-dark-text-muted">Tickets, help, and account assistance</p>
                    </div>
                    <Button onClick={() => setNewOpen(true)}><Plus className="h-4 w-4" /> New ticket</Button>
                </div>

                <div className="mb-4 flex flex-wrap gap-2">
                    {['all', 'open', 'in_progress', 'waiting', 'resolved'].map((item) => (
                        <button
                            key={item}
                            type="button"
                            onClick={() => setFilter(item)}
                            className={cn(
                                'rounded-full px-3 py-1.5 text-xs font-medium transition',
                                filter === item
                                    ? 'bg-waify-green text-white dark:text-waify-ink'
                                    : 'bg-gray-100 text-waify-text-muted hover:bg-gray-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700'
                            )}
                        >
                            {item === 'all' ? 'All' : ticketStatus[item]?.label || item}
                        </button>
                    ))}
                </div>

                <div className="grid min-h-[480px] grid-cols-1 gap-4 lg:grid-cols-5">
                    <Card className="flex max-h-[640px] flex-col overflow-hidden p-0 lg:col-span-2">
                        <div className="border-b border-gray-100 px-4 py-3 text-sm font-semibold text-waify-text dark:border-slate-700 dark:text-waify-dark-text">
                            {filtered.length} tickets
                        </div>
                        <ul className="flex-1 divide-y divide-gray-100 overflow-y-auto dark:divide-slate-700">
                            {filtered.length === 0 && (
                                <li className="p-6 text-sm text-waify-text-muted dark:text-waify-dark-text-muted">No tickets found.</li>
                            )}
                            {filtered.map((thread) => (
                                <li key={thread.id}>
                                    <button
                                        type="button"
                                        onClick={() => openThread(thread)}
                                        className={cn(
                                            'w-full px-4 py-3 text-left transition hover:bg-gray-50 dark:hover:bg-slate-800/50',
                                            selected?.id === thread.id && 'border-l-2 border-waify-green bg-waify-green/5'
                                        )}
                                    >
                                        <div className="flex items-center justify-between gap-2">
                                            <span className="font-mono text-xs text-waify-text-muted dark:text-waify-dark-text-muted">TKT-{thread.id}</span>
                                            <PriorityBadge priority={thread.priority ?? 'normal'} />
                                        </div>
                                        <p className="mt-1 line-clamp-2 text-sm font-medium text-waify-text dark:text-waify-dark-text">{thread.subject}</p>
                                        <div className="mt-2 flex items-center gap-2">
                                            <Badge variant={ticketStatus[thread.status]?.variant || 'secondary'}>{ticketStatus[thread.status]?.label || thread.status}</Badge>
                                            <span className="text-[11px] text-waify-text-muted dark:text-waify-dark-text-muted">
                                                {relativeTime(thread.last_message_at ?? thread.created_at)}
                                            </span>
                                        </div>
                                    </button>
                                </li>
                            ))}
                        </ul>
                    </Card>

                    <Card className="flex max-h-[640px] flex-col overflow-hidden p-0 lg:col-span-3">
                        {selected ? (
                            <>
                                <div className="border-b border-gray-100 px-5 py-4 dark:border-slate-700">
                                    <div className="flex items-start justify-between gap-3">
                                        <div>
                                            <h3 className="font-semibold text-waify-text dark:text-waify-dark-text">{selected.subject}</h3>
                                            <p className="mt-1 text-xs text-waify-text-muted dark:text-waify-dark-text-muted">
                                                TKT-{selected.id} · {selected.category || 'General'} · Support inbox
                                            </p>
                                        </div>
                                        <Badge variant={ticketStatus[selected.status]?.variant || 'secondary'}>{ticketStatus[selected.status]?.label || selected.status}</Badge>
                                    </div>
                                </div>

                                <div className="flex-1 space-y-3 overflow-y-auto bg-gray-50/50 p-5 dark:bg-slate-950/30">
                                    {messages.length === 0 && (
                                        <div className="rounded-card border border-dashed border-waify-border bg-white/70 p-4 text-sm text-waify-text-muted dark:border-waify-dark-border dark:bg-waify-dark-surface-2/70 dark:text-waify-dark-text-muted">
                                            No messages yet. Add details using the reply box below.
                                        </div>
                                    )}
                                    {messages.map((message) => {
                                        const fromMe = message.sender_type === 'user';
                                        return (
                                        <div key={message.id} className={cn('flex', fromMe ? 'justify-end' : 'justify-start')}>
                                            <div
                                                className={cn(
                                                    'max-w-[85%] rounded-lg px-3 py-2 text-sm shadow-sm',
                                                    fromMe
                                                        ? 'bg-waify-green/15 dark:bg-waify-green/20'
                                                        : 'border border-gray-100 bg-white dark:border-slate-700 dark:bg-slate-800'
                                                )}
                                            >
                                                <p className="text-waify-text dark:text-waify-dark-text">{message.body}</p>
                                                {message.attachments && message.attachments.length > 0 && (
                                                    <div className="mt-2 space-y-1">
                                                        {message.attachments.map((attachment) => (
                                                            <a
                                                                key={attachment.id}
                                                                href={attachment.url}
                                                                target="_blank"
                                                                rel="noreferrer"
                                                                className="block text-xs font-medium text-waify-green-dark underline-offset-2 hover:underline dark:text-emerald-200"
                                                            >
                                                                {attachment.file_name}
                                                            </a>
                                                        ))}
                                                    </div>
                                                )}
                                                <span className="mt-1 block text-[10px] text-waify-text-muted dark:text-waify-dark-text-muted">{relativeTime(message.created_at)}</span>
                                            </div>
                                        </div>
                                    );
                                    })}
                                </div>

                                <form onSubmit={submitReply} className="flex gap-2 border-t border-gray-100 p-4 dark:border-slate-700">
                                    <input
                                        value={replyForm.data.message}
                                        onChange={(event) => replyForm.setData('message', event.target.value)}
                                        placeholder="Reply to support..."
                                        className="h-10 flex-1 rounded-btn border border-waify-border px-3 text-sm text-waify-text outline-none focus:ring-2 focus:ring-waify-green/20 dark:border-slate-600 dark:bg-slate-900 dark:text-waify-dark-text"
                                    />
                                    <label className="inline-flex h-10 cursor-pointer items-center justify-center rounded-btn border border-waify-border px-3 text-waify-text-muted hover:bg-gray-50 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-800">
                                        <Paperclip className="h-4 w-4" />
                                        <input type="file" multiple className="hidden" onChange={(event) => replyForm.setData('attachments', Array.from(event.target.files || []))} />
                                    </label>
                                    <Button type="submit" disabled={replyForm.processing || (replyForm.data.message.trim().length === 0 && replyForm.data.attachments.length === 0)}>
                                        Send
                                    </Button>
                                </form>
                            </>
                        ) : (
                            <div className="flex flex-1 items-center justify-center p-8 text-sm text-waify-text-muted dark:text-waify-dark-text-muted">Select a ticket</div>
                        )}
                    </Card>
                </div>

                <Modal open={newOpen} onClose={() => setNewOpen(false)} title="Create support ticket">
                    <form onSubmit={submitTicket} className="space-y-4">
                        <div>
                            <label htmlFor="subject" className="mb-1.5 block text-sm font-medium text-waify-text dark:text-waify-dark-text">Subject</label>
                            <TextInput id="subject" value={createForm.data.subject} onChange={(event) => createForm.setData('subject', event.target.value)} placeholder="Brief summary of your issue" className="w-full" />
                            <InputError message={createForm.errors.subject} className="mt-2" />
                        </div>
                        <div>
                            <label htmlFor="category" className="mb-1.5 block text-sm font-medium text-waify-text dark:text-waify-dark-text">Category</label>
                            <select
                                id="category"
                                value={createForm.data.category}
                                onChange={(event) => createForm.setData('category', event.target.value)}
                                className="h-10 w-full rounded-btn border border-waify-border bg-white px-3 text-sm text-waify-text outline-none focus:ring-2 focus:ring-waify-green/20 dark:border-slate-600 dark:bg-slate-900 dark:text-waify-dark-text"
                            >
                                {['Templates', 'Billing', 'Developer', 'Integrations', 'Other'].map((category) => <option key={category} value={category}>{category}</option>)}
                            </select>
                            <InputError message={createForm.errors.category} className="mt-2" />
                        </div>
                        <div>
                            <label htmlFor="message" className="mb-1.5 block text-sm font-medium text-waify-text dark:text-waify-dark-text">Description</label>
                            <textarea
                                id="message"
                                rows={4}
                                value={createForm.data.message}
                                onChange={(event) => createForm.setData('message', event.target.value)}
                                className="w-full rounded-btn border border-waify-border px-3 py-2 text-sm text-waify-text outline-none focus:ring-2 focus:ring-waify-green/20 dark:border-slate-600 dark:bg-slate-900 dark:text-waify-dark-text"
                                placeholder="Describe what happened..."
                            />
                            <InputError message={createForm.errors.message} className="mt-2" />
                        </div>
                        <FileDropzone
                            label="Attach files"
                            description="Screenshots, PDFs, logs, or CSV samples."
                            onFile={(file) => createForm.setData('attachments', [...createForm.data.attachments, file])}
                        />
                        {createForm.data.attachments.map((file, index) => (
                            <UploadedFileRow
                                key={`${file.name}-${index}`}
                                name={file.name}
                                meta={`${Math.max(1, Math.round(file.size / 1024))} KB`}
                                status="done"
                                onRemove={() => createForm.setData('attachments', createForm.data.attachments.filter((_, itemIndex) => itemIndex !== index))}
                            />
                        ))}
                        <div className="flex justify-end gap-2">
                            <Button type="button" variant="secondary" onClick={() => setNewOpen(false)}>Cancel</Button>
                            <Button type="submit" disabled={createForm.processing}><Send className="h-4 w-4" /> Submit</Button>
                        </div>
                    </form>
                </Modal>
            </div>
        </AppShell>
    );
}
