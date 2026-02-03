import { Link, usePage } from '@inertiajs/react';
import { useEffect, useState, useRef, useMemo, useCallback } from 'react';
import AppShell from '@/Layouts/AppShell';
import { Badge } from '@/Components/UI/Badge';
import { MessageSquare, Search, X, Phone, Wifi, WifiOff } from 'lucide-react';
import { useRealtime } from '@/Providers/RealtimeProvider';
import { ConversationSkeleton } from '@/Components/UI/Skeleton';
import { useToast } from '@/hooks/useToast';
import axios from 'axios';
import TextInput from '@/Components/TextInput';
import { Head } from '@inertiajs/react';

interface Conversation {
    id: number;
    contact: {
        id: number;
        wa_id: string;
        name: string;
    };
    status: string;
    last_message_preview: string | null;
    last_message_at: string | null;
    connection: {
        id: number;
        name: string;
    };
    assigned_to?: number | null;
    priority?: string | null;
}

export default function ConversationsIndex({
    account,
    conversations: initialConversations,
    connections}: {
    account: any;
    conversations: {
        data: Conversation[];
        links: any;
        meta: any;
    };
    connections?: Array<{ id: number; name: string }>;
}) {
    const { subscribe, connected } = useRealtime();
    const { addToast } = useToast();
    const { auth } = usePage().props as any;
    const currentUserId = auth?.user?.id;
    const notifyAssignmentEnabled = auth?.user?.notify_assignment_enabled ?? true;
    const soundEnabled = auth?.user?.notify_sound_enabled ?? true;
    const [conversations, setConversations] = useState<Conversation[]>(initialConversations.data);
    const [loading, setLoading] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState<string>('all');
    const [connectionFilter, setConnectionFilter] = useState<number | 'all'>('all');
    const [pollingInterval, setPollingInterval] = useState<NodeJS.Timeout | null>(null);
    const lastPollRef = useRef<Date>(new Date());
    const processedMessageIds = useRef<Set<string>>(new Set());
    const assignmentStateRef = useRef<Map<number, number | null>>(
        new Map(initialConversations.data.map((c) => [c.id, c.assigned_to ?? null]))
    );

    const playNotificationSound = useCallback(() => {
        if (!soundEnabled) return;
        try {
            const AudioContextRef = (window as any).AudioContext || (window as any).webkitAudioContext;
            if (!AudioContextRef) return;
            const context = new AudioContextRef();
            const oscillator = context.createOscillator();
            const gain = context.createGain();
            oscillator.type = 'sine';
            oscillator.frequency.value = 880;
            gain.gain.value = 0.04;
            oscillator.connect(gain);
            gain.connect(context.destination);
            oscillator.start();
            oscillator.stop(context.currentTime + 0.12);
        } catch (error) {
            console.warn('[Notifications] Unable to play sound');
        }
    }, [soundEnabled]);

    const formatTime = (value: string | null) => {
        if (!value) return '';
        const date = new Date(value);
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    // Filter conversations
    const filteredConversations = useMemo(() => {
        return conversations.filter((conv) => {
            // Search filter
            if (searchQuery) {
                const query = searchQuery.toLowerCase();
                const matchesName = conv.contact.name?.toLowerCase().includes(query);
                const matchesWaId = conv.contact.wa_id?.toLowerCase().includes(query);
                const matchesPreview = conv.last_message_preview?.toLowerCase().includes(query);
                if (!matchesName && !matchesWaId && !matchesPreview) {
                    return false;
                }
            }

            // Status filter
            if (statusFilter !== 'all' && conv.status !== statusFilter) {
                return false;
            }

            // Connection filter
            if (connectionFilter !== 'all' && conv.connection.id !== connectionFilter) {
                return false;
            }

            return true;
        });
    }, [conversations, searchQuery, statusFilter, connectionFilter]);

    // Helper functions for realtime updates
    const applyConversationUpdated = (prev: Conversation[], updated: Conversation) => {
        const index = prev.findIndex((c) => c.id === updated.id);
        if (index >= 0) {
            const newList = [...prev];
            newList[index] = updated;
            return newList.sort((a, b) => {
                const timeA = a.last_message_at ? new Date(a.last_message_at).getTime() : 0;
                const timeB = b.last_message_at ? new Date(b.last_message_at).getTime() : 0;
                return timeB - timeA;
            });
        } else {
            return [updated, ...prev].sort((a, b) => {
                const timeA = a.last_message_at ? new Date(a.last_message_at).getTime() : 0;
                const timeB = b.last_message_at ? new Date(b.last_message_at).getTime() : 0;
                return timeB - timeA;
            });
        }
    };

    const applyMessageCreated = (prev: Conversation[], data: any) => {
        const convId = data.conversation_id;
        const index = prev.findIndex((c) => c.id === convId);
        if (index >= 0) {
            const updated = { ...prev[index] };
            updated.last_message_preview = data.message?.text || data.message?.body || 'New message';
            updated.last_message_at = data.message?.timestamp || new Date().toISOString();
            const newList = [...prev];
            newList[index] = updated;
            return newList.sort((a, b) => {
                const timeA = a.last_message_at ? new Date(a.last_message_at).getTime() : 0;
                const timeB = b.last_message_at ? new Date(b.last_message_at).getTime() : 0;
                return timeB - timeA;
            });
        }
        return prev;
    };

    // Realtime subscription with dedup
    useEffect(() => {
        if (!account?.id) return;

        const channel = `account.${account.id}.whatsapp.inbox`;
        
        const unsubscribeConversationUpdated = subscribe(
            channel,
            '.whatsapp.conversation.updated',
            (data: any) => {
                const eventId = `conv-updated-${data.conversation?.id}-${data.conversation?.updated_at || data.conversation?.last_message_at || ''}`;
                if (!processedMessageIds.current.has(eventId)) {
                    processedMessageIds.current.add(eventId);
                    const incoming = {
                        ...data.conversation,
                        assigned_to: data.conversation?.assignee_id ?? data.conversation?.assigned_to ?? null,
                        priority: data.conversation?.priority ?? null,
                    };
                    setConversations((prev) => applyConversationUpdated(prev, incoming));

                    if (currentUserId && notifyAssignmentEnabled && incoming.assigned_to === currentUserId) {
                        const previous = assignmentStateRef.current.get(incoming.id);
                        if (previous !== incoming.assigned_to) {
                            addToast({
                                title: 'Conversation assigned',
                                description: 'A chat was assigned to you.',
                                variant: 'info',
                                duration: 3000});
                            playNotificationSound();
                        }
                    }
                    assignmentStateRef.current.set(incoming.id, incoming.assigned_to);
                    if (processedMessageIds.current.size > 100) {
                        const ids = Array.from(processedMessageIds.current);
                        processedMessageIds.current = new Set(ids.slice(-50));
                    }
                }
            }
        );

        const unsubscribeMessageCreated = subscribe(
            channel,
            '.whatsapp.message.created',
            (data: any) => {
                const eventId = `msg-created-${data.message?.id}-${data.conversation_id}`;
                if (!processedMessageIds.current.has(eventId)) {
                    processedMessageIds.current.add(eventId);
                    setConversations((prev) => {
                        const updated = applyMessageCreated(prev, data);
                        if (data.message?.direction === 'inbound') {
                            addToast({
                                title: 'New message',
                                description: `From ${data.contact?.name || data.message?.from}`,
                                variant: 'info',
                                duration: 3000});
                        }
                        return updated;
                    });
                    if (processedMessageIds.current.size > 100) {
                        const ids = Array.from(processedMessageIds.current);
                        processedMessageIds.current = new Set(ids.slice(-50));
                    }
                }
            }
        );

        return () => {
            unsubscribeConversationUpdated();
            unsubscribeMessageCreated();
        };
    }, [account?.id, subscribe, addToast, currentUserId, notifyAssignmentEnabled, playNotificationSound]);

    // Fallback polling when disconnected
    useEffect(() => {
        if (connected || !account?.id) {
            if (pollingInterval) {
                clearInterval(pollingInterval);
                setPollingInterval(null);
            }
            return;
        }

        const poll = async () => {
            try {
                const response = await axios.get(
                    route('app.whatsapp.inbox.stream', {}),
                    {
                        params: {
                            since: lastPollRef.current.toISOString()}}
                );

                if (response.data.updated_conversations?.length > 0) {
                    setConversations((prev) => {
                        let updated = [...prev];
                        response.data.updated_conversations.forEach((conv: Conversation) => {
                            const index = updated.findIndex((c) => c.id === conv.id);
                            if (index >= 0) {
                                updated[index] = conv;
                            } else {
                                updated.unshift(conv);
                            }
                        });
                        return updated.sort((a, b) => {
                            const timeA = a.last_message_at ? new Date(a.last_message_at).getTime() : 0;
                            const timeB = b.last_message_at ? new Date(b.last_message_at).getTime() : 0;
                            return timeB - timeA;
                        });
                    });
                }

                lastPollRef.current = new Date(response.data.server_time || new Date());
            } catch (error) {
                console.error('[Inbox] Polling error:', error);
            }
        };

        const interval = setInterval(poll, 30000);
        setPollingInterval(interval);
        poll();

        return () => {
            clearInterval(interval);
        };
    }, [connected, account?.id, account?.slug]);

    // Keyboard shortcuts
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
                e.preventDefault();
                const searchInput = document.querySelector('input[type="search"]') as HTMLInputElement;
                searchInput?.focus();
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, []);

    return (
        <AppShell>
            <Head title="Inbox" />
            <div className="h-[calc(100vh-8rem)] lg:h-[calc(100vh-6rem)]">
                <div className="grid h-full lg:grid-cols-[360px_1fr] rounded-3xl overflow-hidden border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-xl">
                    <section className="flex flex-col border-r border-gray-200 dark:border-gray-800">
                        <div className="px-5 py-4 bg-[#075E54] text-white">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-xs uppercase tracking-wider text-white/70">WhatsApp</p>
                                    <h1 className="text-xl font-semibold">Chats</h1>
                                </div>
                                <div className="flex items-center gap-2 text-xs">
                                    {connected ? (
                                        <span className="inline-flex items-center gap-1 rounded-full bg-white/15 px-2 py-1">
                                            <Wifi className="h-3 w-3" />
                                            Live
                                        </span>
                                    ) : (
                                        <span className="inline-flex items-center gap-1 rounded-full bg-white/15 px-2 py-1">
                                            <WifiOff className="h-3 w-3" />
                                            Polling
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                                <TextInput
                                    type="search"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    placeholder="Search or start new chat"
                                    className="pl-9 rounded-full bg-white dark:bg-gray-800"
                                />
                            </div>
                            <div className="mt-3 flex items-center gap-2">
                                <select
                                    value={statusFilter}
                                    onChange={(e) => setStatusFilter(e.target.value)}
                                    className="rounded-full border-gray-300 shadow-sm focus:border-[#25D366] focus:ring-[#25D366] dark:bg-gray-800 dark:border-gray-700 text-xs px-3 py-1.5"
                                >
                                    <option value="all">All</option>
                                    <option value="open">Open</option>
                                    <option value="pending">Pending</option>
                                    <option value="closed">Closed</option>
                                </select>
                                {connections && connections.length > 0 && (
                                    <select
                                        value={connectionFilter}
                                        onChange={(e) => setConnectionFilter(e.target.value === 'all' ? 'all' : Number(e.target.value))}
                                        className="rounded-full border-gray-300 shadow-sm focus:border-[#25D366] focus:ring-[#25D366] dark:bg-gray-800 dark:border-gray-700 text-xs px-3 py-1.5"
                                    >
                                        <option value="all">All numbers</option>
                                        {connections.map((conn) => (
                                            <option key={conn.id} value={conn.id}>
                                                {conn.name}
                                            </option>
                                        ))}
                                    </select>
                                )}
                                {(searchQuery || statusFilter !== 'all' || connectionFilter !== 'all') && (
                                    <button
                                        onClick={() => {
                                            setSearchQuery('');
                                            setStatusFilter('all');
                                            setConnectionFilter('all');
                                        }}
                                        className="ml-auto text-xs text-gray-500 hover:text-gray-900 dark:hover:text-gray-100 inline-flex items-center gap-1"
                                        aria-label="Clear filters"
                                    >
                                        <X className="h-3.5 w-3.5" />
                                        Clear
                                    </button>
                                )}
                            </div>
                        </div>

                        <div className="flex-1 overflow-y-auto">
                            {loading ? (
                                <div className="p-2">
                                    {[...Array(5)].map((_, i) => (
                                        <ConversationSkeleton key={i} />
                                    ))}
                                </div>
                            ) : filteredConversations.length === 0 ? (
                                <div className="p-10 text-center">
                                    <div className="mx-auto mb-4 h-12 w-12 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                                        <MessageSquare className="h-6 w-6 text-gray-400" />
                                    </div>
                                    <p className="text-sm text-gray-500">
                                        {searchQuery || statusFilter !== 'all' || connectionFilter !== 'all'
                                            ? 'No chats match your filters.'
                                            : 'No chats yet.'}
                                    </p>
                                </div>
                            ) : (
                                <div className="divide-y divide-gray-200 dark:divide-gray-800">
                                    {filteredConversations.map((conversation) => (
                                        <Link
                                            key={conversation.id}
                                            href={route('app.whatsapp.conversations.show', {
                                                conversation: conversation.id})}
                                            className="group block px-4 py-3 hover:bg-[#f0f2f5] dark:hover:bg-gray-800 transition-colors"
                                        >
                                            <div className="flex items-start gap-3">
                                                <div className="h-11 w-11 rounded-full bg-[#25D366] text-white flex items-center justify-center font-semibold text-lg">
                                                    {conversation.contact.name?.charAt(0).toUpperCase() || conversation.contact.wa_id.charAt(0)}
                                                </div>
                                                <div className="min-w-0 flex-1">
                                                    <div className="flex items-center justify-between">
                                                        <p className="truncate text-sm font-semibold text-gray-900 dark:text-gray-100">
                                                            {conversation.contact.name || conversation.contact.wa_id}
                                                        </p>
                                                        <span className="text-[11px] text-gray-500 dark:text-gray-400">
                                                            {formatTime(conversation.last_message_at)}
                                                        </span>
                                                    </div>
                                                    <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                                                        <span className="truncate">
                                                            {conversation.last_message_preview || 'No messages yet'}
                                                        </span>
                                                    </div>
                                                    <div className="mt-1 flex items-center gap-2">
                                                        <Badge variant={conversation.status === 'open' ? 'success' : 'default'} className="px-2 py-0.5 text-[10px]">
                                                            {conversation.status}
                                                        </Badge>
                                                        <span className="text-[11px] text-gray-400">•</span>
                                                        <div className="flex items-center gap-1 text-[11px] text-gray-500">
                                                            <Phone className="h-3 w-3" />
                                                            {conversation.connection.name}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </Link>
                                    ))}
                                </div>
                            )}
                        </div>
                    </section>

                    <section className="hidden lg:flex flex-col items-center justify-center bg-[#efeae2] dark:bg-gray-950">
                        <div className="text-center max-w-md px-8">
                            <div className="mx-auto mb-5 h-16 w-16 rounded-2xl bg-white/70 dark:bg-gray-900 flex items-center justify-center shadow-sm">
                                <MessageSquare className="h-8 w-8 text-[#075E54]" />
                            </div>
                            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">WhatsApp Inbox</h2>
                            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                                Select a chat to start messaging. Your conversations update live as messages arrive.
                            </p>
                        </div>
                    </section>
                </div>
            </div>
        </AppShell>
    );
}
