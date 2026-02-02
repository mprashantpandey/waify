import { useEffect, useMemo, useState } from 'react';
import { usePage } from '@inertiajs/react';
import { MessageSquare, X } from 'lucide-react';
import Button from '@/Components/UI/Button';
import { useRealtime } from '@/Providers/RealtimeProvider';
import axios from 'axios';

interface Thread {
    id: number;
    subject: string;
    status: string;
    mode?: string | null;
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

export default function LiveChatWidget() {
    const { workspace, branding } = usePage().props as any;
    const { subscribe } = useRealtime();
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [thread, setThread] = useState<Thread | null>(null);
    const [messages, setMessages] = useState<Message[]>([]);
    const [draft, setDraft] = useState('');
    const [attachments, setAttachments] = useState<File[]>([]);
    const [requestingHuman, setRequestingHuman] = useState(false);

    const supportContacts = useMemo(() => {
        return {
            email: branding?.support_email as string | undefined,
            phone: branding?.support_phone as string | undefined,
        };
    }, [branding?.support_email, branding?.support_phone]);

    useEffect(() => {
        if (!open || !workspace?.slug) {
            return;
        }

        let active = true;
        setLoading(true);
        axios
            .get(route('app.support.live', { workspace: workspace.slug }) as string, {
                headers: { Accept: 'application/json' },
            })
            .then((res) => {
                const data = res.data as LiveChatResponse;
                if (!active) return;
                setThread(data.thread);
                setMessages(data.messages || []);
            })
            .finally(() => {
                if (active) setLoading(false);
            });

        return () => {
            active = false;
        };
    }, [open, workspace?.slug]);

    useEffect(() => {
        if (!thread || !workspace?.id) return;
        const channel = `workspace.${workspace.id}.support.thread.${thread.id}`;
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
    }, [subscribe, thread?.id, workspace?.id]);

    const sendMessage = async () => {
        if ((!draft.trim() && attachments.length === 0) || !workspace?.slug) return;
        const payload = new FormData();
        if (draft.trim()) {
            payload.append('message', draft.trim());
        }
        payload.append('subject', thread?.subject ?? 'Live chat');
        if (thread?.id && thread.status !== 'closed') {
            payload.append('thread_id', String(thread.id));
        }
        attachments.forEach((file) => payload.append('attachments[]', file));
        setDraft('');
        setAttachments([]);
        const res = await axios.post(
            route('app.support.live.message', { workspace: workspace.slug }) as string,
            payload,
            { headers: { Accept: 'application/json' } }
        );
        const data = res.data as { thread?: Thread | null; message?: Message; bot?: Message | null };
        if (data.thread) {
            setThread(data.thread);
        }
        const newMessage = data.message;
        if (newMessage) {
            setMessages((prev) => {
                if (prev.some((m) => m.id === newMessage.id)) {
                    return prev;
                }
                return [...prev, newMessage];
            });
        }
        const botMessage = data.bot;
        if (botMessage) {
            setMessages((prev) => {
                if (prev.some((m) => m.id === botMessage.id)) {
                    return prev;
                }
                return [...prev, botMessage];
            });
        }
    };

    const closeLiveChat = async () => {
        if (!workspace?.slug) return;
        await axios.post(
            route('app.support.live.close', { workspace: workspace.slug }) as string,
            {},
            { headers: { Accept: 'application/json' } }
        );
        setThread((prev) => (prev ? { ...prev, status: 'closed' } : prev));
    };

    const startNewChat = () => {
        setThread(null);
        setMessages([]);
        setDraft('');
        setAttachments([]);
    };

    const requestHuman = async () => {
        if (!workspace?.slug) return;
        setRequestingHuman(true);
        try {
            const res = await axios.post(
                route('app.support.live.request-human', { workspace: workspace.slug }) as string,
                {},
                { headers: { Accept: 'application/json' } }
            );
            const data = res.data as { thread?: Thread | null };
            if (data.thread) {
                setThread(data.thread);
            }
        } finally {
            setRequestingHuman(false);
        }
    };

    return (
        <div className="fixed bottom-6 right-6 z-40">
            {!open && (
                <button
                    onClick={() => setOpen(true)}
                    className="flex items-center gap-2 rounded-full bg-blue-600 text-white px-4 py-3 shadow-lg hover:bg-blue-700 transition"
                >
                    <MessageSquare className="h-4 w-4" />
                    <span className="text-sm font-semibold">Live Chat</span>
                </button>
            )}
            {open && (
                <div className="w-80 max-w-[90vw] rounded-2xl bg-white dark:bg-gray-900 shadow-xl border border-gray-200 dark:border-gray-800 overflow-hidden">
                    <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
                        <div>
                            <div className="text-sm font-semibold">Support Live Chat</div>
                            <div className="text-xs opacity-90">We typically reply in a few minutes</div>
                        </div>
                        <button onClick={() => setOpen(false)} className="p-1 hover:opacity-80">
                            <X className="h-4 w-4" />
                        </button>
                    </div>
                    <div className="px-4 py-3 text-xs text-gray-500 dark:text-gray-400 border-b border-gray-200 dark:border-gray-800">
                        {supportContacts.email || supportContacts.phone
                            ? `Email ${supportContacts.email ?? '—'}${supportContacts.phone ? ` · ${supportContacts.phone}` : ''}`
                            : 'Share details and we will assist you.'}
                    </div>
                    <div className="h-64 overflow-y-auto px-4 py-3 space-y-3">
                        {loading && (
                            <div className="text-xs text-gray-500 dark:text-gray-400">Loading chat...</div>
                        )}
                        {!loading && messages.length === 0 && (
                            <div className="text-xs text-gray-500 dark:text-gray-400">
                                Start a conversation with our support team.
                            </div>
                        )}
                        {thread?.mode === 'human' && (
                            <div className="text-xs text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-md px-3 py-2">
                                A live agent has been requested. We will join shortly.
                            </div>
                        )}
                        {thread?.status === 'closed' && (
                            <div className="text-xs text-gray-600 dark:text-gray-300 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md px-3 py-2">
                                This chat is closed. Start a new conversation anytime.
                            </div>
                        )}
                        {messages.map((message) => (
                            <div
                                key={message.id}
                                className={`rounded-lg px-3 py-2 text-xs leading-relaxed ${
                                    message.sender_type === 'admin' || message.sender_type === 'bot'
                                        ? 'bg-blue-50 dark:bg-blue-900/30 text-gray-900 dark:text-gray-100'
                                        : message.sender_type === 'system'
                                        ? 'bg-amber-50 dark:bg-amber-900/30 text-gray-900 dark:text-gray-100'
                                        : 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100'
                                }`}
                            >
                                <div className="text-[10px] uppercase tracking-wider opacity-60 mb-1">
                                    {message.sender_type === 'admin'
                                        ? 'Support'
                                        : message.sender_type === 'bot'
                                        ? 'Assistant'
                                        : message.sender_type === 'system'
                                        ? 'System'
                                        : 'You'}
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
                        {thread?.status !== 'closed' && thread?.mode !== 'human' && (
                            <div className="flex justify-end">
                                <button
                                    type="button"
                                    onClick={requestHuman}
                                    disabled={requestingHuman}
                                    className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline"
                                >
                                    {requestingHuman ? 'Requesting live agent...' : 'Talk to a live agent'}
                                </button>
                            </div>
                        )}
                        <textarea
                            value={draft}
                            onChange={(e) => setDraft(e.target.value)}
                            rows={2}
                            disabled={thread?.status === 'closed'}
                            className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100 text-sm disabled:opacity-60"
                            placeholder={thread?.status === 'closed' ? 'Start a new chat to send messages.' : 'Type your message...'}
                        />
                        <input
                            type="file"
                            multiple
                            disabled={thread?.status === 'closed'}
                            onChange={(e) => setAttachments(Array.from(e.target.files || []))}
                            className="block w-full text-xs text-gray-500 file:mr-4 file:rounded-md file:border-0 file:bg-gray-100 file:px-3 file:py-1.5 file:text-xs file:font-semibold file:text-gray-700 hover:file:bg-gray-200 dark:file:bg-gray-800 dark:file:text-gray-200 dark:hover:file:bg-gray-700 disabled:opacity-60"
                        />
                        <div className="flex justify-end gap-2">
                            {thread?.status === 'closed' && (
                                <Button type="button" variant="secondary" onClick={startNewChat}>
                                    New Chat
                                </Button>
                            )}
                            {thread?.status === 'open' && (
                                <Button type="button" variant="secondary" onClick={closeLiveChat}>
                                    End Chat
                                </Button>
                            )}
                            <Button
                                type="button"
                                onClick={sendMessage}
                                disabled={(draft.trim().length === 0 && attachments.length === 0) || thread?.status === 'closed'}
                            >
                                Send
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
