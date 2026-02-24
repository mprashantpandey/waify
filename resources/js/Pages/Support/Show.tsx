import { Link, useForm } from '@inertiajs/react';
import AppShell from '@/Layouts/AppShell';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/Components/UI/Card';
import Button from '@/Components/UI/Button';
import { Head } from '@inertiajs/react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useRealtime } from '@/Providers/RealtimeProvider';
import { useNotifications } from '@/hooks/useNotifications';

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

export default function SupportShow({
    account,
    thread,
    messages}: {
    account: any;
    thread: {
        id: number;
        slug: string;
        subject: string;
        status: string;
        channel?: string | null;
        category?: string | null;
        tags?: string[];
        due_at?: string | null;
        first_response_due_at?: string | null;
        escalation_level?: number;
    };
    messages: Message[];
}) {
    const { toast } = useNotifications();
    const { data, setData, post, processing, reset } = useForm({
        message: '',
        attachments: [] as File[]});
    const { subscribe } = useRealtime();
    const normalizedInitialMessages = useMemo(
        () => (Array.isArray(messages) ? messages : [])
            .map(normalizeMessage)
            .filter((message): message is Message => message !== null),
        [messages]
    );
    const [items, setItems] = useState<Message[]>(normalizedInitialMessages);
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
        const channel = `account.${account.id}.support.thread.${thread.id}`;
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
    }, [subscribe, account.id, thread.id]);

    useEffect(() => {
        if ((thread.channel ?? 'ticket') !== 'live') {
            return;
        }

        const poll = async () => {
            try {
                const res = await window.axios.get(route('app.support.live', {}) as string, {
                    headers: { Accept: 'application/json' },
                });
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
    }, [thread.channel, thread.id, mergeIncomingMessages]);

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('app.support.message', { thread: thread.slug ?? thread.id }) as string, {
            forceFormData: true,
            onSuccess: () => reset()});
    };

    const closeThread = () => {
        post(route('app.support.close', { thread: thread.slug ?? thread.id }) as string);
    };

    const suggestReply = async () => {
        try {
            const res = await window.axios.post(
                route('app.support.assistant', { thread: thread.slug ?? thread.id }) as string,
                { action: 'reply' },
                { headers: { Accept: 'application/json' } }
            );
            const suggestion = String(res?.data?.suggestion || '').trim();
            if (!suggestion) {
                toast.warning('No suggestion', 'AI did not return a response.');
                return;
            }
            setData('message', suggestion);
        } catch (error: any) {
            toast.error('AI suggestion failed', error?.response?.data?.error || 'Unable to generate AI suggestion.');
        }
    };

    return (
        <AppShell>
            <Head title={`Support - ${thread.subject}`} />
            <div className="space-y-6">
                <Link
                    href={route('app.support.hub', {})}
                    className="inline-flex items-center gap-2 text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors"
                >
                    ← Back to Support Hub
                </Link>

                <Card className="border-0 shadow-lg">
                    <CardHeader className="bg-gradient-to-r from-gray-50 to-white dark:from-gray-800 dark:to-gray-900">
                        <CardTitle className="text-xl font-bold">{thread.subject}</CardTitle>
                        <CardDescription>Status: {thread.status}</CardDescription>
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
                                This chat is closed. You can start a new request anytime.
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
                                            : 'You'}
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
                                placeholder="Write your reply..."
                            />
                            <input
                                type="file"
                                multiple
                                onChange={(e) => setData('attachments', Array.from(e.target.files || []))}
                                className="block w-full text-sm text-gray-500 file:mr-4 file:rounded-md file:border-0 file:bg-gray-100 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-gray-700 hover:file:bg-gray-200 dark:file:bg-gray-800 dark:file:text-gray-200 dark:hover:file:bg-gray-700"
                            />
                            <div className="flex justify-end">
                                <Button type="button" variant="secondary" onClick={suggestReply} className="mr-2">
                                    AI Suggest Reply
                                </Button>
                                {thread.status === 'open' && (
                                    <Button type="button" variant="secondary" onClick={closeThread} className="mr-2">
                                        Close Chat
                                    </Button>
                                )}
                                {thread.status === 'closed' && (
                                    <Button
                                        type="button"
                                        variant="secondary"
                                        onClick={() =>
                                            post(route('app.support.reopen', { thread: thread.slug ?? thread.id }) as string)
                                        }
                                        className="mr-2"
                                    >
                                        Reopen Chat
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
                                    {processing ? 'Sending...' : 'Send Message'}
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </AppShell>
    );
}
