import { useForm, usePage, router } from '@inertiajs/react';
import PlatformShell from '@/Layouts/PlatformShell';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/Components/UI/Card';
import Button from '@/Components/UI/Button';
import { Head, Link } from '@inertiajs/react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useRealtime } from '@/Providers/RealtimeProvider';
import axios from 'axios';
import { useToast } from '@/hooks/useToast';

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

const normalizeMessage = (value: any): Message | null => {
    if (!value || value.id == null || !value.created_at) {
        return null;
    }

    const id = Number(value.id);
    if (!Number.isInteger(id) || id < 1) {
        return null;
    }

    return {
        id,
        sender_type: String(value.sender_type ?? 'user'),
        sender_id: value.sender_id == null ? null : Number(value.sender_id),
        body: String(value.body ?? ''),
        created_at: String(value.created_at),
        attachments: Array.isArray(value.attachments) ? value.attachments : [],
    };
};

const mergeMessages = (existing: Message[], incoming: Message[]) => {
    const map = new Map<number, Message>();
    for (const message of existing) {
        map.set(message.id, message);
    }
    for (const message of incoming) {
        const prev = map.get(message.id);
        map.set(message.id, prev ? { ...prev, ...message } : message);
    }

    return Array.from(map.values()).sort(
        (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
    );
};

const isImage = (attachment: { mime_type?: string | null; file_name: string }) => {
    if (attachment.mime_type) {
        return attachment.mime_type.startsWith('image/');
    }
    return /\.(png|jpe?g|gif|webp|svg)$/i.test(attachment.file_name);
};

const isPdf = (attachment: { mime_type?: string | null; file_name: string }) => {
    if (attachment.mime_type) {
        return attachment.mime_type === 'application/pdf';
    }
    return /\.pdf$/i.test(attachment.file_name);
};

export default function PlatformSupportShow({
    thread,
    messages,
    admins,
    auditLogs}: {
    thread: {
        id: number;
        slug: string;
        subject: string;
        status: string;
        mode?: string | null;
        channel?: string | null;
        priority?: string | null;
        category?: string | null;
        tags?: string[];
        due_at?: string | null;
        first_response_due_at?: string | null;
        escalation_level?: number;
        assigned_to?: number | null;
        account: { id: number; name: string; slug: string; owner?: { name?: string; email?: string } } | null;
    };
    messages: Message[];
    admins: { id: number; name: string; email: string }[];
    auditLogs: {
        id: number;
        action: string;
        meta?: Record<string, any>;
        created_at?: string | null;
        user?: { id: number; name: string; email: string } | null;
    }[];
}) {
    const { data, setData, post, processing, reset } = useForm({
        message: '',
        attachments: [] as File[]});
    const { subscribe } = useRealtime();
    const { addToast } = useToast();
    const { ai } = usePage().props as any;
    const normalizedInitialMessages = useMemo(
        () => (Array.isArray(messages) ? messages : [])
            .map(normalizeMessage)
            .filter((message): message is Message => message !== null),
        [messages]
    );
    const [items, setItems] = useState<Message[]>(normalizedInitialMessages);
    const [assistLoading, setAssistLoading] = useState(false);
    const [ticketData, setTicketData] = useState({
        status: thread.status,
        priority: thread.priority || 'normal',
        assigned_to: thread.assigned_to || '',
        category: thread.category || '',
        tags: (thread.tags || []).join(', ')});
    const [aiNote, setAiNote] = useState<{ title: string; content: string } | null>(null);
    const hydratedThreadIdRef = useRef<number | null>(null);

    useEffect(() => {
        const incoming = (Array.isArray(messages) ? messages : [])
            .map(normalizeMessage)
            .filter((message): message is Message => message !== null);

        const threadChanged = hydratedThreadIdRef.current !== thread.id;
        if (threadChanged) {
            setItems(incoming);
            hydratedThreadIdRef.current = thread.id;
            return;
        }

        if (incoming.length > 0) {
            setItems((prev) => mergeMessages(prev, incoming));
        }
    }, [messages, thread.id]);

    const mergeIncomingMessages = useCallback((incomingRaw: unknown) => {
        const incoming = Array.isArray(incomingRaw)
            ? incomingRaw.map(normalizeMessage).filter((message): message is Message => message !== null)
            : [];
        if (incoming.length === 0) {
            return;
        }
        setItems((prev) => mergeMessages(prev, incoming));
    }, []);

    useEffect(() => {
        if (!thread.account) {
            return;
        }
        const channel = `account.${thread.account.id}.support.thread.${thread.id}`;
        const unsubscribe = subscribe(channel, 'support.message.created', (payload: Message) => {
            if ((payload as any)?.thread_id && Number((payload as any).thread_id) !== thread.id) {
                return;
            }
            const normalized = normalizeMessage(payload);
            if (!normalized) {
                return;
            }
            setItems((prev) => mergeMessages(prev, [normalized]));
        });

        return () => {
            unsubscribe();
        };
    }, [subscribe, thread.id, thread.account?.id]);

    useEffect(() => {
        if ((thread.channel ?? 'ticket') !== 'live') {
            return;
        }

        const poll = async () => {
            try {
                const res = await axios.get(
                    route('platform.support.live.thread', { thread: thread.slug ?? thread.id }) as string,
                    { headers: { Accept: 'application/json' } }
                );
                const data = res.data as { thread?: { id?: number } | null; messages?: unknown[] };
                if (!data?.thread?.id || Number(data.thread.id) !== thread.id) {
                    return;
                }
                mergeIncomingMessages(data.messages ?? []);
            } catch (_error) {
                // Realtime remains primary; polling is best-effort fallback only.
            }
        };

        const interval = window.setInterval(() => {
            void poll();
        }, 5000);

        return () => window.clearInterval(interval);
    }, [thread.channel, thread.id, thread.slug, mergeIncomingMessages]);

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('platform.support.message', { thread: thread.slug ?? thread.id }) as string, {
            forceFormData: true,
            onSuccess: () => reset()});
    };

    const closeThread = () => {
        post(route('platform.support.close', { thread: thread.slug ?? thread.id }) as string);
    };

    const updateTicket = (e: React.FormEvent) => {
        e.preventDefault();
        const tags = ticketData.tags
            .split(',')
            .map((tag) => tag.trim())
            .filter(Boolean);
        router.post(
            route('platform.support.update', { thread: thread.slug ?? thread.id }) as string,
            {
                status: ticketData.status,
                priority: ticketData.priority,
                assigned_to: ticketData.assigned_to || null,
                category: ticketData.category || null,
                tags}
        );
    };

    const generateSuggestion = async (action: 'reply' | 'summary' | 'next_steps') => {
        setAssistLoading(true);
        try {
            const response = await axios.post(
                route('platform.support.assistant', { thread: thread.slug ?? thread.id }) as string,
                { action },
                { headers: { Accept: 'application/json' } }
            );
            const suggestion = response.data?.suggestion;
            if (suggestion && action === 'reply') {
                setData('message', suggestion);
                setAiNote(null);
            } else if (suggestion) {
                setAiNote({
                    title: action === 'summary' ? 'AI Summary' : 'AI Next Steps',
                    content: suggestion});
            }
        } catch (error: any) {
            addToast({
                title: 'AI Assistant',
                description: error?.response?.data?.error || 'Unable to generate a suggestion.',
                variant: 'error'});
        } finally {
            setAssistLoading(false);
        }
    };

    return (
        <PlatformShell>
            <Head title={`Support - ${thread.subject}`} />
            <div className="space-y-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">{thread.subject}</h1>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                        Tenant: {thread.account?.name ?? 'Unknown'} · Status: {thread.status}
                    </p>
                    {thread.account && (
                        <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-gray-600 dark:text-gray-300">
                            <span>Owner: {thread.account.owner?.name || '—'}</span>
                            <span>·</span>
                            <span>{thread.account.owner?.email || '—'}</span>
                            <span>·</span>
                            <a
                                href={route('platform.accounts.show', { account: thread.account.id })}
                                className="text-blue-600 dark:text-blue-300 hover:underline"
                            >
                                View Tenant
                            </a>
                            <span>·</span>
                            <Link
                                href={route('platform.accounts.impersonate', { account: thread.account.id })}
                                method="post"
                                className="text-blue-600 dark:text-blue-300 hover:underline"
                            >
                                Open Dashboard
                            </Link>
                        </div>
                    )}
                </div>

                <Card className="border-0 shadow-lg">
                    <CardHeader className="bg-gradient-to-r from-gray-50 to-white dark:from-gray-800 dark:to-gray-900">
                        <CardTitle className="text-xl font-bold">Conversation</CardTitle>
                        <CardDescription>Reply to the tenant</CardDescription>
                    </CardHeader>
                    <CardContent className="p-6 space-y-4">
                        <div className="grid gap-2 text-xs text-gray-500 dark:text-gray-400 md:grid-cols-2">
                            <div>Category: {thread.category || '—'}</div>
                            <div>Tags: {thread.tags && thread.tags.length > 0 ? thread.tags.join(', ') : '—'}</div>
                            <div>
                                First response due:{' '}
                                {thread.first_response_due_at ? new Date(thread.first_response_due_at).toLocaleString() : '—'}
                            </div>
                            <div>Resolution due: {thread.due_at ? new Date(thread.due_at).toLocaleString() : '—'}</div>
                            <div>Escalation level: {thread.escalation_level ?? 0}</div>
                        </div>
                        {thread.status === 'closed' && (
                            <div className="rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-sm text-gray-700 dark:text-gray-200 px-4 py-3">
                                This chat is closed.
                            </div>
                        )}
                        {aiNote && (
                            <div className="rounded-lg border border-indigo-200 dark:border-indigo-800 bg-indigo-50/60 dark:bg-indigo-900/20 p-4 text-sm text-gray-800 dark:text-gray-200">
                                <div className="text-xs uppercase tracking-wider text-indigo-600 dark:text-indigo-300 mb-2">
                                    {aiNote.title}
                                </div>
                                <div className="whitespace-pre-wrap">{aiNote.content}</div>
                            </div>
                        )}
                        <div className="space-y-3">
                            {items.map((message) => (
                                <div
                                    key={message.id}
                                    className={`rounded-lg px-4 py-3 ${
                                        message.sender_type === 'admin' || message.sender_type === 'bot'
                                            ? 'bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800'
                                            : message.sender_type === 'system'
                                            ? 'bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800'
                                            : 'bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700'
                                    }`}
                                >
                                    <div className="text-xs uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-1">
                                        {message.sender_type === 'admin'
                                            ? 'Support'
                                            : message.sender_type === 'bot'
                                            ? 'Assistant'
                                            : message.sender_type === 'system'
                                            ? 'System'
                                            : 'Tenant'}
                                    </div>
                                    <div className="text-sm text-gray-900 dark:text-gray-100 whitespace-pre-wrap">
                                        {message.body}
                                    </div>
                                    {message.attachments && message.attachments.length > 0 && (
                                        <div className="mt-2 space-y-2">
                                            {message.attachments.map((attachment) => (
                                                <div key={attachment.id} className="space-y-2">
                                                    <a
                                                        href={attachment.url}
                                                        target="_blank"
                                                        rel="noreferrer"
                                                        className="block text-xs text-blue-600 dark:text-blue-300 hover:underline"
                                                    >
                                                        {attachment.file_name}
                                                    </a>
                                                    {isImage(attachment) && (
                                                        <img
                                                            src={attachment.url}
                                                            alt={attachment.file_name}
                                                            className="max-h-40 rounded-md border border-gray-200 dark:border-gray-700"
                                                        />
                                                    )}
                                                    {isPdf(attachment) && (
                                                        <details className="text-xs text-gray-600 dark:text-gray-300">
                                                            <summary className="cursor-pointer">Preview PDF</summary>
                                                            <iframe
                                                                src={attachment.url}
                                                                className="mt-2 h-48 w-full rounded-md border border-gray-200 dark:border-gray-700"
                                                            />
                                                        </details>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                    <div className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                                        {new Date(message.created_at).toLocaleString()}
                                    </div>
                                </div>
                            ))}
                        </div>

                        <form onSubmit={submit} className="space-y-3">
                            <textarea
                                value={data.message}
                                onChange={(e) => setData('message', e.target.value)}
                                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100"
                                rows={4}
                                placeholder="Write a reply..."
                            />
                            <input
                                type="file"
                                multiple
                                onChange={(e) => setData('attachments', Array.from(e.target.files || []))}
                                className="block w-full text-sm text-gray-500 file:mr-4 file:rounded-md file:border-0 file:bg-gray-100 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-gray-700 hover:file:bg-gray-200 dark:file:bg-gray-800 dark:file:text-gray-200 dark:hover:file:bg-gray-700"
                            />
                            <div className="flex justify-end gap-2">
                                {thread.status === 'open' && (
                                    <Button type="button" variant="secondary" onClick={closeThread}>
                                        Close Chat
                                    </Button>
                                )}
                                {ai?.enabled && (
                                    <Button
                                        type="button"
                                        variant="secondary"
                                        onClick={() => generateSuggestion('reply')}
                                        disabled={assistLoading}
                                    >
                                        {assistLoading ? 'Generating...' : 'AI Suggest'}
                                    </Button>
                                )}
                                {ai?.enabled && (
                                    <Button
                                        type="button"
                                        variant="secondary"
                                        onClick={() => generateSuggestion('summary')}
                                        disabled={assistLoading}
                                    >
                                        {assistLoading ? 'Generating...' : 'Summarize'}
                                    </Button>
                                )}
                                {ai?.enabled && (
                                    <Button
                                        type="button"
                                        variant="secondary"
                                        onClick={() => generateSuggestion('next_steps')}
                                        disabled={assistLoading}
                                    >
                                        {assistLoading ? 'Generating...' : 'Next Steps'}
                                    </Button>
                                )}
                                <Button
                                    type="submit"
                                    disabled={
                                        processing ||
                                        thread.status === 'closed' ||
                                        (data.message.trim().length === 0 && data.attachments.length === 0)
                                    }
                                >
                                    {processing ? 'Sending...' : 'Send Reply'}
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>

                {thread.channel !== 'live' ? (
                    <Card className="border-0 shadow-lg">
                        <CardHeader className="bg-gradient-to-r from-indigo-50 to-indigo-100 dark:from-indigo-900/20 dark:to-indigo-800/20">
                            <CardTitle className="text-xl font-bold">Ticket Management</CardTitle>
                            <CardDescription>Update status, priority, and assignee</CardDescription>
                        </CardHeader>
                        <CardContent className="p-6">
                            <form onSubmit={updateTicket} className="grid gap-4 md:grid-cols-3">
                                <div>
                                    <label className="text-sm font-semibold text-gray-700 dark:text-gray-200">Status</label>
                                    <select
                                        value={ticketData.status}
                                        onChange={(e) => setTicketData({ ...ticketData, status: e.target.value })}
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100"
                                    >
                                        <option value="open">Open</option>
                                        <option value="pending">Pending</option>
                                        <option value="closed">Closed</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="text-sm font-semibold text-gray-700 dark:text-gray-200">Priority</label>
                                    <select
                                        value={ticketData.priority}
                                        onChange={(e) => setTicketData({ ...ticketData, priority: e.target.value })}
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100"
                                    >
                                        <option value="low">Low</option>
                                        <option value="normal">Normal</option>
                                        <option value="high">High</option>
                                        <option value="urgent">Urgent</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="text-sm font-semibold text-gray-700 dark:text-gray-200">Assignee</label>
                                    <select
                                        value={ticketData.assigned_to}
                                        onChange={(e) => setTicketData({ ...ticketData, assigned_to: e.target.value })}
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100"
                                    >
                                        <option value="">Unassigned</option>
                                        {admins.map((admin) => (
                                            <option key={admin.id} value={admin.id}>
                                                {admin.name} ({admin.email})
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="text-sm font-semibold text-gray-700 dark:text-gray-200">Category</label>
                                    <input
                                        value={ticketData.category}
                                        onChange={(e) => setTicketData({ ...ticketData, category: e.target.value })}
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100"
                                        placeholder="Billing, WhatsApp, Templates..."
                                    />
                                </div>
                                <div className="md:col-span-2">
                                    <label className="text-sm font-semibold text-gray-700 dark:text-gray-200">Tags (comma separated)</label>
                                    <input
                                        value={ticketData.tags}
                                        onChange={(e) => setTicketData({ ...ticketData, tags: e.target.value })}
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100"
                                        placeholder="urgent, whatsapp, api"
                                    />
                                </div>
                                <div className="md:col-span-3 flex justify-end">
                                    <Button type="submit">Save Changes</Button>
                                </div>
                            </form>
                            <div className="mt-4 grid gap-2 text-xs text-gray-500 dark:text-gray-400">
                                <div>First response due: {thread.first_response_due_at ? new Date(thread.first_response_due_at).toLocaleString() : '—'}</div>
                                <div>Resolution due: {thread.due_at ? new Date(thread.due_at).toLocaleString() : '—'}</div>
                                <div>Escalation level: {thread.escalation_level ?? 0}</div>
                            </div>
                        </CardContent>
                    </Card>
                ) : (
                    <Card className="border-0 shadow-lg">
                        <CardHeader className="bg-gradient-to-r from-indigo-50 to-indigo-100 dark:from-indigo-900/20 dark:to-indigo-800/20">
                            <CardTitle className="text-xl font-bold">Live Chat Summary</CardTitle>
                            <CardDescription>Live chat sessions do not use ticket management fields.</CardDescription>
                        </CardHeader>
                        <CardContent className="p-6 text-sm text-gray-600 dark:text-gray-300">
                            Convert this chat to a ticket if you need assignments, priorities, and SLA tracking.
                        </CardContent>
                    </Card>
                )}

                <Card className="border-0 shadow-lg">
                    <CardHeader className="bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-900/20 dark:to-slate-800/20">
                        <CardTitle className="text-xl font-bold">Audit Log</CardTitle>
                        <CardDescription>Recent activity on this ticket</CardDescription>
                    </CardHeader>
                    <CardContent className="p-6 space-y-3">
                        {auditLogs.length === 0 && (
                            <div className="text-sm text-gray-500 dark:text-gray-400">No audit entries yet.</div>
                        )}
                        {auditLogs.map((log) => (
                            <div key={log.id} className="rounded-lg border border-gray-200 dark:border-gray-800 p-3">
                                <div className="text-xs uppercase tracking-wider text-gray-500 dark:text-gray-400">
                                    {log.action.replace(/_/g, ' ')}
                                </div>
                                <div className="text-sm text-gray-700 dark:text-gray-200 mt-1">
                                    {log.user?.name || 'System'} · {log.user?.email || '—'}
                                </div>
                                {log.meta && Object.keys(log.meta).length > 0 && (
                                    <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                        {JSON.stringify(log.meta)}
                                    </div>
                                )}
                                <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                    {log.created_at ? new Date(log.created_at).toLocaleString() : '—'}
                                </div>
                            </div>
                        ))}
                    </CardContent>
                </Card>
            </div>
        </PlatformShell>
    );
}
