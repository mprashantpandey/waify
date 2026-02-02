import { useEffect, useState } from 'react';
import { usePage } from '@inertiajs/react';
import { MessageSquare, X } from 'lucide-react';
import Button from '@/Components/UI/Button';
import { useRealtime } from '@/Providers/RealtimeProvider';
import axios from 'axios';
import { useToast } from '@/hooks/useToast';

interface Thread {
    id: number;
    slug: string;
    subject: string;
    status: string;
    workspace: { id: number; name: string; slug: string } | null;
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

interface LiveChatResponse {
    thread: Thread | null;
    messages: Message[];
}

export default function PlatformLiveChatWidget() {
    const { branding, ai } = usePage().props as any;
    const { subscribe } = useRealtime();
    const { addToast } = useToast();
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [thread, setThread] = useState<Thread | null>(null);
    const [threads, setThreads] = useState<Thread[]>([]);
    const [activeThreadSlug, setActiveThreadSlug] = useState<string | null>(null);
    const [messages, setMessages] = useState<Message[]>([]);
    const [draft, setDraft] = useState('');
    const [attachments, setAttachments] = useState<File[]>([]);
    const [assistLoading, setAssistLoading] = useState(false);

    const loadThreads = async () => {
        const res = await axios.get(route('platform.support.live.list') as string, {
            headers: { Accept: 'application/json' },
        });
        const data = res.data as { threads: Thread[] };
        setThreads(data.threads || []);
        if ((!activeThreadSlug || !data.threads?.some((t) => t.slug === activeThreadSlug)) && data.threads?.length) {
            setActiveThreadSlug(data.threads[0].slug);
        }
    };

    const loadThread = async (threadSlug: string) => {
        setLoading(true);
        const res = await axios.get(route('platform.support.live.thread', { thread: threadSlug }) as string, {
            headers: { Accept: 'application/json' },
        });
        const data = res.data as LiveChatResponse;
        setThread(data.thread);
        setMessages(data.messages || []);
        setLoading(false);
    };

    useEffect(() => {
        if (!open) return;
        let active = true;
        setLoading(true);
        loadThreads()
            .then(() => {
                if (activeThreadSlug) {
                    return loadThread(activeThreadSlug);
                }
            })
            .finally(() => {
                if (active) setLoading(false);
            });

        return () => {
            active = false;
        };
    }, [open]);

    useEffect(() => {
        if (!open || !activeThreadSlug) return;
        loadThread(activeThreadSlug);
    }, [activeThreadSlug]);

    useEffect(() => {
        if (!open) return;
        const unsubscribe = subscribe('platform.support', 'support.message.created', () => {
            loadThreads();
        });
        return () => unsubscribe();
    }, [open, subscribe]);

    useEffect(() => {
        if (!thread?.workspace?.id) return;
        const channel = `workspace.${thread.workspace.id}.support.thread.${thread.id}`;
        const unsubscribe = subscribe(channel, 'support.message.created', (payload: Message) => {
            setMessages((prev) => {
                if (prev.some((m) => m.id === payload.id)) {
                    return prev;
                }
                return [...prev, payload];
            });
        });

        return () => {
            unsubscribe();
        };
    }, [subscribe, thread?.id, thread?.workspace?.id]);

    const sendMessage = async () => {
        if ((!draft.trim() && attachments.length === 0) || !thread?.id) return;
        const payload = new FormData();
        if (draft.trim()) {
            payload.append('message', draft.trim());
        }
        payload.append('thread_id', String(thread.id));
        attachments.forEach((file) => payload.append('attachments[]', file));
        setDraft('');
        setAttachments([]);
        const res = await axios.post(route('platform.support.live.message') as string, payload, {
            headers: { Accept: 'application/json' },
        });
        const data = res.data as { message?: Message };
        const newMessage = data.message;
        if (newMessage) {
            setMessages((prev) => {
                if (prev.some((m) => m.id === newMessage.id)) {
                    return prev;
                }
                return [...prev, newMessage];
            });
        }
        loadThreads();
    };

    const generateSuggestion = async () => {
        if (!thread?.id) return;
        setAssistLoading(true);
        try {
            const res = await axios.post(
                route('platform.support.assistant', { thread: thread.slug ?? thread.id }) as string,
                { action: 'reply' },
                { headers: { Accept: 'application/json' } }
            );
            const suggestion = res.data?.suggestion;
            if (suggestion) {
                setDraft(suggestion);
            }
        } catch (error: any) {
            addToast({
                title: 'AI Assistant',
                description: error?.response?.data?.error || 'AI assistant is disabled.',
                variant: 'error',
            });
        } finally {
            setAssistLoading(false);
        }
    };

    return (
        <div className="fixed bottom-6 right-6 z-40">
            {!open && (
                <button
                    onClick={() => setOpen(true)}
                    className="flex items-center gap-2 rounded-full bg-gray-900 text-white px-4 py-3 shadow-lg hover:bg-gray-800 transition"
                >
                    <MessageSquare className="h-4 w-4" />
                    <span className="text-sm font-semibold">Support Live</span>
                </button>
            )}
            {open && (
                <div className="w-[28rem] max-w-[95vw] rounded-2xl bg-white dark:bg-gray-900 shadow-xl border border-gray-200 dark:border-gray-800 overflow-hidden">
                    <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-gray-900 to-gray-700 text-white">
                        <div>
                            <div className="text-sm font-semibold">Support Inbox</div>
                            <div className="text-xs opacity-80">
                                {thread?.workspace?.name ? `Workspace: ${thread.workspace.name}` : 'Live conversations'}
                            </div>
                        </div>
                        <button onClick={() => setOpen(false)} className="p-1 hover:opacity-80">
                            <X className="h-4 w-4" />
                        </button>
                    </div>
                    <div className="px-4 py-3 text-xs text-gray-500 dark:text-gray-400 border-b border-gray-200 dark:border-gray-800">
                        {branding?.support_email ? `Primary support email: ${branding.support_email}` : 'Reply to keep the thread active.'}
                    </div>
                    <div className="grid grid-cols-5 gap-0">
                        <div className="col-span-2 border-r border-gray-200 dark:border-gray-800 max-h-[26rem] overflow-y-auto">
                            {threads.length === 0 && (
                                <div className="p-4 text-xs text-gray-500 dark:text-gray-400">
                                    No active live chats.
                                </div>
                            )}
                            {threads.map((t) => (
                                <button
                                    key={t.id}
                                    onClick={() => setActiveThreadSlug(t.slug)}
                                    className={`w-full text-left px-4 py-3 border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/40 ${
                                        activeThreadSlug === t.slug ? 'bg-gray-50 dark:bg-gray-800/60' : ''
                                    }`}
                                >
                                    <div className="text-xs font-semibold text-gray-900 dark:text-gray-100">
                                        {t.workspace?.name ?? 'Workspace'}
                                    </div>
                                    <div className="text-[11px] text-gray-500 dark:text-gray-400 truncate">
                                        {t.subject}
                                    </div>
                                </button>
                            ))}
                        </div>
                        <div className="col-span-3 flex flex-col">
                            <div className="h-64 overflow-y-auto px-4 py-3 space-y-3">
                        {loading && (
                            <div className="text-xs text-gray-500 dark:text-gray-400">Loading latest conversation...</div>
                        )}
                        {!loading && messages.length === 0 && (
                            <div className="text-xs text-gray-500 dark:text-gray-400">
                                No messages yet. Open the support inbox for more details.
                            </div>
                        )}
                        {thread?.status === 'closed' && (
                            <div className="text-xs text-gray-600 dark:text-gray-300 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md px-3 py-2">
                                This chat is closed.
                            </div>
                        )}
                        {messages.map((message) => (
                            <div
                                key={message.id}
                                className={`rounded-lg px-3 py-2 text-xs leading-relaxed ${
                                    message.sender_type === 'admin'
                                        ? 'bg-blue-50 dark:bg-blue-900/30 text-gray-900 dark:text-gray-100'
                                        : 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100'
                                }`}
                            >
                                <div className="text-[10px] uppercase tracking-wider opacity-60 mb-1">
                                    {message.sender_type === 'admin' ? 'Support' : 'Tenant'}
                                </div>
                                {message.body}
                                {message.attachments && message.attachments.length > 0 && (
                                    <div className="mt-2 space-y-1">
                                        {message.attachments.map((attachment) => (
                                            <div key={attachment.id} className="space-y-1">
                                                <a
                                                    href={attachment.url}
                                                    target="_blank"
                                                    rel="noreferrer"
                                                    className="block text-[11px] text-blue-600 dark:text-blue-300 hover:underline"
                                                >
                                                    {attachment.file_name}
                                                </a>
                                                {isImage(attachment) && (
                                                    <img
                                                        src={attachment.url}
                                                        alt={attachment.file_name}
                                                        className="max-h-32 rounded-md border border-gray-200 dark:border-gray-700"
                                                    />
                                                )}
                                                {isPdf(attachment) && (
                                                    <details className="text-[11px] text-gray-600 dark:text-gray-300">
                                                        <summary className="cursor-pointer">Preview PDF</summary>
                                                        <iframe
                                                            src={attachment.url}
                                                            className="mt-2 h-36 w-full rounded-md border border-gray-200 dark:border-gray-700"
                                                        />
                                                    </details>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        ))}
                            </div>
                            <div className="border-t border-gray-200 dark:border-gray-800 p-3 space-y-2">
                        <textarea
                            value={draft}
                            onChange={(e) => setDraft(e.target.value)}
                            rows={2}
                            className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100 text-sm"
                            placeholder="Reply to tenant..."
                        />
                        <input
                            type="file"
                            multiple
                            onChange={(e) => setAttachments(Array.from(e.target.files || []))}
                            className="block w-full text-xs text-gray-500 file:mr-4 file:rounded-md file:border-0 file:bg-gray-100 file:px-3 file:py-1.5 file:text-xs file:font-semibold file:text-gray-700 hover:file:bg-gray-200 dark:file:bg-gray-800 dark:file:text-gray-200 dark:hover:file:bg-gray-700"
                        />
                        <div className="flex justify-end gap-2">
                            {ai?.enabled && (
                                <Button type="button" variant="secondary" onClick={generateSuggestion} disabled={assistLoading || !thread}>
                                    {assistLoading ? 'Generating...' : 'AI Suggest'}
                                </Button>
                            )}
                            {thread?.status === 'open' && (
                                <Button
                                    type="button"
                                    variant="secondary"
                                    onClick={async () => {
                                        if (!thread) return;
                                        await axios.post(route('platform.support.close', { thread: thread.slug ?? thread.id }) as string);
                                        setThread({ ...thread, status: 'closed' });
                                        loadThreads();
                                    }}
                                >
                                    Close Chat
                                </Button>
                            )}
                            <Button
                                type="button"
                                onClick={sendMessage}
                                disabled={(draft.trim().length === 0 && attachments.length === 0) || !thread || thread?.status === 'closed'}
                            >
                                Send
                            </Button>
                        </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
