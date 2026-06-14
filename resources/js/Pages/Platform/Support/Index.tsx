import { Head, Link, router, useForm, usePage } from '@inertiajs/react';
import { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import PlatformShell from '@/Layouts/PlatformShell';
import { Card, CardContent } from '@/Components/UI/Card';
import Button from '@/Components/UI/Button';
import { Drawer, PageHeader, StatusBadge, ThemedIconTile, Toolbar } from '@/Components/UI/Elements';
import { useToast } from '@/hooks/useToast';
import { useRealtime } from '@/Providers/RealtimeProvider';
import {
    Bot,
    Building2,
    Clock,
    FileText,
    Headphones,
    Inbox,
    Mail,
    MessageCircle,
    Paperclip,
    Phone,
    RefreshCw,
    Search,
    Send,
    Sparkles,
    TicketCheck,
    UserRound,
} from 'lucide-react';

interface Thread {
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
    assignee?: { id: number; name: string; email: string } | null;
    account: { id: number; name: string; slug: string; owner?: { id?: number; name?: string; email?: string } } | null;
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

interface PaginatedThreads {
    data: Thread[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
}

type Filters = { q?: string; status?: string; per_page?: number };

function statusTone(status: string): 'success' | 'warning' | 'danger' | 'info' | 'default' {
    if (status === 'closed' || status === 'resolved') return 'success';
    if (status === 'pending' || status === 'waiting') return 'warning';
    if (status === 'urgent' || status === 'overdue') return 'danger';
    if (status === 'open') return 'info';
    return 'default';
}

function priorityTone(priority?: string | null): 'success' | 'warning' | 'danger' | 'info' | 'default' {
    if (priority === 'urgent') return 'danger';
    if (priority === 'high') return 'warning';
    if (priority === 'low') return 'default';
    return 'info';
}

function iconTone(status: string): 'green' | 'blue' | 'amber' | 'red' {
    const tone = statusTone(status);
    if (tone === 'success') return 'green';
    if (tone === 'warning') return 'amber';
    if (tone === 'danger') return 'red';
    return 'blue';
}

function isImage(attachment: { mime_type?: string | null; file_name: string }) {
    return attachment.mime_type?.startsWith('image/') || /\.(png|jpe?g|gif|webp|svg)$/i.test(attachment.file_name);
}

function isPdf(attachment: { mime_type?: string | null; file_name: string }) {
    return attachment.mime_type === 'application/pdf' || /\.pdf$/i.test(attachment.file_name);
}

function StatCard({ label, value, icon: Icon, tone = 'green' }: { label: string; value: string | number; icon: any; tone?: 'green' | 'blue' | 'amber' | 'purple' }) {
    return (
        <Card>
            <CardContent className="p-5">
                <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                        <p className="text-sm text-waify-text-muted dark:text-waify-dark-text-muted">{label}</p>
                        <p className="mt-2 text-2xl font-bold text-waify-text dark:text-waify-dark-text">{value}</p>
                    </div>
                    <ThemedIconTile tone={tone}>
                        <Icon className="h-5 w-5" />
                    </ThemedIconTile>
                </div>
            </CardContent>
        </Card>
    );
}

export default function PlatformSupportIndex({
    threads,
    filters,
    stats,
    selectedThread,
    messages = [],
    admins = [],
    auditLogs = [],
}: {
    threads: PaginatedThreads;
    filters: Filters;
    stats: { total: number; open: number; closed: number; urgent: number };
    selectedThread: Thread | null;
    messages: Message[];
    admins: { id: number; name: string; email: string }[];
    auditLogs: { id: number; action: string; meta?: Record<string, any>; created_at?: string | null; user?: { name: string; email: string } | null }[];
}) {
    const { branding, auth, ai } = usePage().props as any;
    const { subscribe } = useRealtime();
    const { addToast } = useToast();
    const [localFilters, setLocalFilters] = useState<Filters>({
        q: filters?.q || '',
        status: filters?.status || 'all',
        per_page: filters?.per_page || 15,
    });
    const [items, setItems] = useState<Thread[]>(threads.data || []);
    const [drawerMessages, setDrawerMessages] = useState<Message[]>(messages || []);
    const [assistLoading, setAssistLoading] = useState(false);
    const [aiNote, setAiNote] = useState<{ title: string; content: string } | null>(null);
    const [ticketData, setTicketData] = useState({
        status: selectedThread?.status || 'open',
        priority: selectedThread?.priority || 'normal',
        assigned_to: selectedThread?.assigned_to ? String(selectedThread.assigned_to) : '',
        category: selectedThread?.category || '',
        tags: (selectedThread?.tags || []).join(', '),
    });
    const { data, setData, post, processing, reset } = useForm({
        message: '',
        attachments: [] as File[],
    });

    useEffect(() => setItems(threads.data || []), [threads.data]);

    useEffect(() => {
        setDrawerMessages(messages || []);
        setTicketData({
            status: selectedThread?.status || 'open',
            priority: selectedThread?.priority || 'normal',
            assigned_to: selectedThread?.assigned_to ? String(selectedThread.assigned_to) : '',
            category: selectedThread?.category || '',
            tags: (selectedThread?.tags || []).join(', '),
        });
        setAiNote(null);
        reset();
    }, [selectedThread?.id]);

    useEffect(() => {
        const unsubscribe = subscribe('platform.support', 'support.message.created', (payload: { thread_id?: number; created_at?: string }) => {
            if (!payload.thread_id) return;
            setItems((prev) => {
                const index = prev.findIndex((thread) => thread.id === payload.thread_id);
                if (index === -1) return prev;
                const next = [...prev];
                const updated = { ...next[index], last_message_at: payload.created_at ?? next[index].last_message_at };
                next.splice(index, 1);
                next.unshift(updated);
                return next;
            });
        });

        return () => unsubscribe();
    }, [subscribe]);

    useEffect(() => {
        if (!selectedThread?.account?.id) return;
        const channel = `account.${selectedThread.account.id}.support.thread.${selectedThread.id}`;
        const unsubscribe = subscribe(channel, 'support.message.created', (payload: Message & { thread_id?: number }) => {
            if (payload.thread_id && Number(payload.thread_id) !== selectedThread.id) return;
            if (!payload.id || !payload.created_at) return;
            setDrawerMessages((prev) => {
                const map = new Map(prev.map((message) => [message.id, message]));
                map.set(payload.id, { ...map.get(payload.id), ...payload });
                return Array.from(map.values()).sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
            });
        });

        return () => unsubscribe();
    }, [subscribe, selectedThread?.id, selectedThread?.account?.id]);

    const supportContacts = useMemo(() => ({
        email: branding?.support_email as string | undefined,
        phone: branding?.support_phone as string | undefined,
    }), [branding?.support_email, branding?.support_phone]);

    const queryParams = (extra: Record<string, any> = {}) => ({
        q: localFilters.q || undefined,
        status: localFilters.status && localFilters.status !== 'all' ? localFilters.status : undefined,
        per_page: localFilters.per_page || 15,
        ...extra,
    });

    const applyFilters = () => {
        router.get(route('platform.support.index'), queryParams({ page: undefined }), {
            preserveScroll: true,
        });
    };

    const refresh = () => {
        router.reload({ only: ['threads', 'selectedThread', 'messages', 'auditLogs'] });
    };

    const openTicket = (thread: Thread) => {
        router.get(route('platform.support.index'), queryParams({ ticket: thread.slug ?? thread.id, page: threads.current_page }), {
            preserveScroll: true,
        });
    };

    const closeDrawer = () => {
        router.get(route('platform.support.index'), queryParams({ page: threads.current_page }), {
            preserveScroll: true,
        });
    };

    const goToPage = (page: number) => {
        router.get(route('platform.support.index'), queryParams({ page }), {
            preserveScroll: true,
        });
    };

    const submit = (event: React.FormEvent) => {
        event.preventDefault();
        if (!selectedThread) return;
        post(route('platform.support.message', { thread: selectedThread.slug ?? selectedThread.id }) as string, {
            forceFormData: true,
            preserveScroll: true,
            onSuccess: () => reset(),
        });
    };

    const closeThread = () => {
        if (!selectedThread) return;
        post(route('platform.support.close', { thread: selectedThread.slug ?? selectedThread.id }) as string, { preserveScroll: true });
    };

    const updateTicket = (event: React.FormEvent) => {
        event.preventDefault();
        if (!selectedThread) return;
        router.post(
            route('platform.support.update', { thread: selectedThread.slug ?? selectedThread.id }) as string,
            {
                status: ticketData.status,
                priority: ticketData.priority,
                assigned_to: ticketData.assigned_to || null,
                category: ticketData.category || null,
                tags: ticketData.tags.split(',').map((tag) => tag.trim()).filter(Boolean),
            },
            { preserveScroll: true }
        );
    };

    const generateSuggestion = async (action: 'reply' | 'summary' | 'next_steps') => {
        if (!selectedThread) return;
        setAssistLoading(true);
        try {
            const response = await axios.post(
                route('platform.support.assistant', { thread: selectedThread.slug ?? selectedThread.id }) as string,
                { action },
                { headers: { Accept: 'application/json' } }
            );
            const suggestion = response.data?.suggestion;
            if (suggestion && action === 'reply') {
                setData('message', suggestion);
                setAiNote(null);
            } else if (suggestion) {
                setAiNote({ title: action === 'summary' ? 'AI summary' : 'AI next steps', content: suggestion });
            }
        } catch (error: any) {
            addToast({
                title: 'AI assistant',
                description: error?.response?.data?.error || 'Unable to generate a suggestion.',
                variant: 'error',
            });
        } finally {
            setAssistLoading(false);
        }
    };

    const firstResult = threads.total === 0 ? 0 : threads.per_page * (threads.current_page - 1) + 1;
    const lastResult = Math.min(threads.per_page * threads.current_page, threads.total);

    return (
        <PlatformShell auth={auth}>
            <Head title="Support Requests" />
            <div className="space-y-6">
                <PageHeader
                    title="Support requests"
                    description="Tenant tickets, replies, assignment, and audit activity without leaving the support inbox."
                    actions={<Button type="button" variant="secondary" onClick={refresh}><RefreshCw className="h-4 w-4" />Refresh</Button>}
                />

                <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
                    <StatCard label="Threads" value={stats.total} icon={Inbox} />
                    <StatCard label="Open" value={stats.open} icon={MessageCircle} tone="blue" />
                    <StatCard label="Closed" value={stats.closed} icon={TicketCheck} tone="purple" />
                    <StatCard label="Urgent" value={stats.urgent} icon={Headphones} tone="amber" />
                </div>

                <div className="grid gap-4 lg:grid-cols-2">
                    <Card>
                        <CardContent className="p-5">
                            <div className="flex items-start gap-3">
                                <ThemedIconTile tone="blue">
                                    <Inbox className="h-5 w-5" />
                                </ThemedIconTile>
                                <div>
                                    <p className="font-semibold text-waify-text dark:text-waify-dark-text">Support inbox</p>
                                    <p className="mt-1 text-sm text-waify-text-muted dark:text-waify-dark-text-muted">Click a ticket to inspect the full thread in a drawer. The list remains paginated for larger data.</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-5">
                            <div className="flex items-start gap-3">
                                <ThemedIconTile tone="green">
                                    <Mail className="h-5 w-5" />
                                </ThemedIconTile>
                                <div>
                                    <p className="font-semibold text-waify-text dark:text-waify-dark-text">Support contact</p>
                                    <div className="mt-2 flex flex-wrap gap-2 text-sm text-waify-text-muted dark:text-waify-dark-text-muted">
                                        <span className="inline-flex items-center gap-1"><Mail className="h-3.5 w-3.5" />{supportContacts.email || 'Not configured'}</span>
                                        <span className="inline-flex items-center gap-1"><Phone className="h-3.5 w-3.5" />{supportContacts.phone || 'Not configured'}</span>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <Toolbar
                    search={{ value: localFilters.q || '', onChange: (value) => setLocalFilters({ ...localFilters, q: value }), placeholder: 'Search tickets or workspace...' }}
                    filters={(
                        <>
                            <select
                                value={localFilters.status || 'all'}
                                onChange={(event) => setLocalFilters({ ...localFilters, status: event.target.value })}
                                className="waify-input min-w-36"
                            >
                                <option value="all">All tickets</option>
                                <option value="open">Open</option>
                                <option value="pending">Pending</option>
                                <option value="closed">Closed</option>
                            </select>
                            <select
                                value={localFilters.per_page || 15}
                                onChange={(event) => setLocalFilters({ ...localFilters, per_page: Number(event.target.value) })}
                                className="waify-input min-w-28"
                            >
                                <option value={10}>10 / page</option>
                                <option value={15}>15 / page</option>
                                <option value={25}>25 / page</option>
                                <option value={50}>50 / page</option>
                            </select>
                        </>
                    )}
                    actions={<Button type="button" onClick={applyFilters}><Search className="h-4 w-4" />Apply</Button>}
                />

                {items.length === 0 ? (
                    <Card>
                        <CardContent className="flex flex-col items-center justify-center py-16 text-center">
                            <ThemedIconTile tone="gray" size="lg">
                                <Search className="h-5 w-5" />
                            </ThemedIconTile>
                            <p className="mt-4 text-sm font-semibold text-waify-text dark:text-waify-dark-text">No support requests found</p>
                            <p className="mt-1 text-sm text-waify-text-muted dark:text-waify-dark-text-muted">New tenant tickets will appear here when they are created.</p>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="overflow-hidden rounded-card border border-gray-100 bg-white shadow-card dark:border-waify-dark-border dark:bg-waify-dark-surface dark:shadow-none">
                        <div className="hidden grid-cols-[minmax(0,1.5fr)_1fr_120px_120px_150px] gap-4 border-b border-gray-100 px-4 py-3 text-xs font-semibold uppercase tracking-wide text-waify-text-muted dark:border-waify-dark-border dark:text-waify-dark-text-muted lg:grid">
                            <span>Ticket</span>
                            <span>Workspace</span>
                            <span>Status</span>
                            <span>Priority</span>
                            <span>Last message</span>
                        </div>
                        <div className="divide-y divide-gray-100 dark:divide-waify-dark-border">
                            {items.map((thread) => (
                                <button
                                    key={thread.id}
                                    type="button"
                                    onClick={() => openTicket(thread)}
                                    className="grid w-full gap-4 px-4 py-4 text-left transition hover:bg-gray-50 dark:hover:bg-waify-dark-surface-2 lg:grid-cols-[minmax(0,1.5fr)_1fr_120px_120px_150px] lg:items-center"
                                >
                                    <div className="flex min-w-0 items-start gap-3">
                                        <ThemedIconTile tone={iconTone(thread.status)}>
                                            <MessageCircle className="h-5 w-5" />
                                        </ThemedIconTile>
                                        <div className="min-w-0">
                                            <p className="truncate font-semibold text-waify-text dark:text-waify-dark-text">{thread.subject}</p>
                                            <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-waify-text-muted dark:text-waify-dark-text-muted">
                                                <span>#{thread.id}</span>
                                                <span>Created {new Date(thread.created_at).toLocaleString()}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2 text-sm text-waify-text-muted dark:text-waify-dark-text-muted">
                                        <Building2 className="h-4 w-4" />
                                        <span className="truncate">{thread.account?.name || 'Unknown workspace'}</span>
                                    </div>
                                    <StatusBadge tone={statusTone(thread.status)} dot className="w-fit capitalize">{thread.status}</StatusBadge>
                                    <StatusBadge tone={priorityTone(thread.priority)} className="w-fit capitalize">{thread.priority || 'normal'}</StatusBadge>
                                    <span className="text-xs text-waify-text-muted dark:text-waify-dark-text-muted">
                                        {thread.last_message_at ? new Date(thread.last_message_at).toLocaleString() : 'Never'}
                                    </span>
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {threads.last_page > 1 && (
                    <div className="flex flex-col gap-3 rounded-card border border-gray-100 bg-white p-3 shadow-card dark:border-waify-dark-border dark:bg-waify-dark-surface dark:shadow-none sm:flex-row sm:items-center sm:justify-between">
                        <p className="text-sm text-waify-text-muted dark:text-waify-dark-text-muted">
                            Showing {firstResult} to {lastResult} of {threads.total}
                        </p>
                        <div className="flex flex-wrap gap-2">
                            {Array.from({ length: threads.last_page }, (_, index) => index + 1).map((page) => (
                                <button
                                    key={page}
                                    type="button"
                                    onClick={() => goToPage(page)}
                                    className={`h-9 min-w-9 rounded-btn px-3 text-sm font-semibold transition ${
                                        page === threads.current_page
                                            ? 'bg-waify-green text-white'
                                            : 'border border-gray-200 bg-white text-waify-text hover:bg-gray-50 dark:border-waify-dark-border dark:bg-waify-dark-surface dark:text-waify-dark-text dark:hover:bg-waify-dark-surface-2'
                                    }`}
                                >
                                    {page}
                                </button>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            <Drawer
                open={Boolean(selectedThread)}
                onClose={closeDrawer}
                title={selectedThread?.subject || 'Support ticket'}
                description={selectedThread?.account?.name || 'Workspace ticket'}
                className="sm:max-w-5xl"
            >
                {selectedThread && (
                    <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_340px]">
                        <div className="space-y-4">
                            <div className="rounded-card border border-gray-100 bg-gray-50/80 p-4 dark:border-waify-dark-border dark:bg-waify-dark-surface-2/70">
                                <div className="flex flex-wrap items-center gap-2">
                                    <StatusBadge tone={statusTone(selectedThread.status)} dot className="capitalize">{selectedThread.status}</StatusBadge>
                                    <StatusBadge tone={priorityTone(selectedThread.priority)} className="capitalize">{selectedThread.priority || 'normal'} priority</StatusBadge>
                                    <span className="inline-flex items-center gap-1 text-xs text-waify-text-muted dark:text-waify-dark-text-muted">
                                        <Clock className="h-3.5 w-3.5" />
                                        Created {new Date(selectedThread.created_at).toLocaleString()}
                                    </span>
                                </div>
                                {selectedThread.account && (
                                    <div className="mt-3 flex flex-wrap items-center gap-3 text-sm text-waify-text-muted dark:text-waify-dark-text-muted">
                                        <span className="inline-flex items-center gap-1"><Building2 className="h-4 w-4" />{selectedThread.account.name}</span>
                                        <span className="inline-flex items-center gap-1"><UserRound className="h-4 w-4" />{selectedThread.account.owner?.name || 'Owner unavailable'}</span>
                                        <Link href={route('platform.accounts.show', { account: selectedThread.account.id })} className="font-semibold text-waify-green-dark hover:underline dark:text-emerald-300">
                                            View workspace
                                        </Link>
                                        <Link href={route('platform.accounts.impersonate', { account: selectedThread.account.id })} method="post" className="font-semibold text-waify-green-dark hover:underline dark:text-emerald-300">
                                            Open dashboard
                                        </Link>
                                    </div>
                                )}
                            </div>

                            {aiNote && (
                                <div className="rounded-card border border-sky-200 bg-sky-50 p-4 text-sm text-sky-950 dark:border-sky-400/20 dark:bg-sky-500/10 dark:text-sky-100">
                                    <p className="mb-2 text-xs font-bold uppercase tracking-wide">{aiNote.title}</p>
                                    <div className="whitespace-pre-wrap">{aiNote.content}</div>
                                </div>
                            )}

                            <div className="space-y-3">
                                {drawerMessages.length === 0 ? (
                                    <Card>
                                        <CardContent className="py-10 text-center text-sm text-waify-text-muted dark:text-waify-dark-text-muted">
                                            No messages have been added to this ticket yet.
                                        </CardContent>
                                    </Card>
                                ) : drawerMessages.map((message) => {
                                    const isAdmin = message.sender_type === 'admin' || message.sender_type === 'bot';
                                    const isSystem = message.sender_type === 'system';
                                    return (
                                        <div
                                            key={message.id}
                                            className={`rounded-card border px-4 py-3 ${
                                                isSystem
                                                    ? 'border-amber-200 bg-amber-50 text-amber-950 dark:border-amber-400/20 dark:bg-amber-500/10 dark:text-amber-100'
                                                    : isAdmin
                                                    ? 'border-emerald-200 bg-emerald-50 text-emerald-950 dark:border-emerald-400/20 dark:bg-emerald-500/10 dark:text-emerald-100'
                                                    : 'border-gray-100 bg-white text-waify-text dark:border-waify-dark-border dark:bg-waify-dark-surface dark:text-waify-dark-text'
                                            }`}
                                        >
                                            <div className="mb-2 flex items-center justify-between gap-2 text-xs font-semibold uppercase tracking-wide opacity-75">
                                                <span className="inline-flex items-center gap-1">
                                                    {message.sender_type === 'bot' ? <Bot className="h-3.5 w-3.5" /> : <MessageCircle className="h-3.5 w-3.5" />}
                                                    {message.sender_type === 'admin' ? 'Support' : message.sender_type === 'bot' ? 'Assistant' : message.sender_type === 'system' ? 'System' : 'Tenant'}
                                                </span>
                                                <span>{new Date(message.created_at).toLocaleString()}</span>
                                            </div>
                                            <div className="whitespace-pre-wrap text-sm">{message.body}</div>
                                            {message.attachments && message.attachments.length > 0 && (
                                                <div className="mt-3 space-y-2">
                                                    {message.attachments.map((attachment) => (
                                                        <div key={attachment.id} className="rounded-lg border border-current/10 bg-white/60 p-2 dark:bg-black/10">
                                                            <a href={attachment.url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-xs font-semibold underline">
                                                                <Paperclip className="h-3.5 w-3.5" />
                                                                {attachment.file_name}
                                                            </a>
                                                            {isImage(attachment) && <img src={attachment.url} alt={attachment.file_name} className="mt-2 max-h-48 rounded-md border border-current/10" />}
                                                            {isPdf(attachment) && (
                                                                <details className="mt-2 text-xs">
                                                                    <summary className="cursor-pointer">Preview PDF</summary>
                                                                    <iframe src={attachment.url} className="mt-2 h-56 w-full rounded-md border border-current/10" />
                                                                </details>
                                                            )}
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>

                            <form onSubmit={submit} className="rounded-card border border-gray-100 bg-white p-4 dark:border-waify-dark-border dark:bg-waify-dark-surface">
                                <textarea
                                    value={data.message}
                                    onChange={(event) => setData('message', event.target.value)}
                                    className="waify-input min-h-28 w-full resize-y"
                                    placeholder="Write a reply..."
                                />
                                <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                                    <input
                                        type="file"
                                        multiple
                                        onChange={(event) => setData('attachments', Array.from(event.target.files || []))}
                                        className="block text-sm text-waify-text-muted file:mr-3 file:rounded-btn file:border-0 file:bg-gray-100 file:px-3 file:py-2 file:text-sm file:font-semibold file:text-waify-text hover:file:bg-gray-200 dark:text-waify-dark-text-muted dark:file:bg-waify-dark-surface-2 dark:file:text-waify-dark-text"
                                    />
                                    <div className="flex flex-wrap justify-end gap-2">
                                        {ai?.enabled && (
                                            <>
                                                <Button type="button" variant="secondary" onClick={() => generateSuggestion('reply')} disabled={assistLoading}>
                                                    <Sparkles className="h-4 w-4" />Reply
                                                </Button>
                                                <Button type="button" variant="secondary" onClick={() => generateSuggestion('summary')} disabled={assistLoading}>Summary</Button>
                                                <Button type="button" variant="secondary" onClick={() => generateSuggestion('next_steps')} disabled={assistLoading}>Next steps</Button>
                                            </>
                                        )}
                                        <Button type="submit" disabled={processing || selectedThread.status === 'closed' || (data.message.trim().length === 0 && data.attachments.length === 0)}>
                                            <Send className="h-4 w-4" />{processing ? 'Sending...' : 'Send'}
                                        </Button>
                                    </div>
                                </div>
                            </form>
                        </div>

                        <aside className="space-y-4">
                            <Card>
                                <CardContent className="p-4">
                                    <p className="font-semibold text-waify-text dark:text-waify-dark-text">Ticket management</p>
                                    <form onSubmit={updateTicket} className="mt-4 space-y-3">
                                        <label className="block text-sm font-semibold text-waify-text dark:text-waify-dark-text">
                                            Status
                                            <select value={ticketData.status} onChange={(event) => setTicketData({ ...ticketData, status: event.target.value })} className="waify-input mt-1 w-full">
                                                <option value="open">Open</option>
                                                <option value="pending">Pending</option>
                                                <option value="closed">Closed</option>
                                            </select>
                                        </label>
                                        <label className="block text-sm font-semibold text-waify-text dark:text-waify-dark-text">
                                            Priority
                                            <select value={ticketData.priority} onChange={(event) => setTicketData({ ...ticketData, priority: event.target.value })} className="waify-input mt-1 w-full">
                                                <option value="low">Low</option>
                                                <option value="normal">Normal</option>
                                                <option value="high">High</option>
                                                <option value="urgent">Urgent</option>
                                            </select>
                                        </label>
                                        <label className="block text-sm font-semibold text-waify-text dark:text-waify-dark-text">
                                            Assignee
                                            <select value={ticketData.assigned_to} onChange={(event) => setTicketData({ ...ticketData, assigned_to: event.target.value })} className="waify-input mt-1 w-full">
                                                <option value="">Unassigned</option>
                                                {admins.map((admin) => <option key={admin.id} value={admin.id}>{admin.name}</option>)}
                                            </select>
                                        </label>
                                        <label className="block text-sm font-semibold text-waify-text dark:text-waify-dark-text">
                                            Category
                                            <input value={ticketData.category} onChange={(event) => setTicketData({ ...ticketData, category: event.target.value })} className="waify-input mt-1 w-full" placeholder="Billing, WhatsApp, API" />
                                        </label>
                                        <label className="block text-sm font-semibold text-waify-text dark:text-waify-dark-text">
                                            Tags
                                            <input value={ticketData.tags} onChange={(event) => setTicketData({ ...ticketData, tags: event.target.value })} className="waify-input mt-1 w-full" placeholder="urgent, whatsapp" />
                                        </label>
                                        <div className="flex justify-between gap-2 pt-1">
                                            {selectedThread.status === 'open' && <Button type="button" variant="secondary" onClick={closeThread}>Close</Button>}
                                            <Button type="submit">Save</Button>
                                        </div>
                                    </form>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardContent className="p-4">
                                    <p className="font-semibold text-waify-text dark:text-waify-dark-text">SLA details</p>
                                    <div className="mt-3 space-y-2 text-sm text-waify-text-muted dark:text-waify-dark-text-muted">
                                        <p>First response: {selectedThread.first_response_due_at ? new Date(selectedThread.first_response_due_at).toLocaleString() : 'Not set'}</p>
                                        <p>Resolution: {selectedThread.due_at ? new Date(selectedThread.due_at).toLocaleString() : 'Not set'}</p>
                                        <p>Escalation level: {selectedThread.escalation_level ?? 0}</p>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardContent className="p-4">
                                    <p className="font-semibold text-waify-text dark:text-waify-dark-text">Audit log</p>
                                    <div className="mt-3 space-y-2">
                                        {auditLogs.length === 0 ? (
                                            <p className="text-sm text-waify-text-muted dark:text-waify-dark-text-muted">No audit entries yet.</p>
                                        ) : auditLogs.map((log) => (
                                            <div key={log.id} className="rounded-lg border border-gray-100 p-3 text-sm dark:border-waify-dark-border">
                                                <p className="text-xs font-semibold uppercase tracking-wide text-waify-text-muted dark:text-waify-dark-text-muted">{log.action.replace(/_/g, ' ')}</p>
                                                <p className="mt-1 text-waify-text dark:text-waify-dark-text">{log.user?.name || 'System'}</p>
                                                {log.meta && Object.keys(log.meta).length > 0 && <p className="mt-1 break-words text-xs text-waify-text-muted dark:text-waify-dark-text-muted">{JSON.stringify(log.meta)}</p>}
                                                <p className="mt-1 text-xs text-waify-text-muted dark:text-waify-dark-text-muted">{log.created_at ? new Date(log.created_at).toLocaleString() : 'No time'}</p>
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        </aside>
                    </div>
                )}
            </Drawer>
        </PlatformShell>
    );
}
