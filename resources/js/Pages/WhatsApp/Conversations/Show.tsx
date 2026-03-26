import { useForm, Link, router, usePage } from '@inertiajs/react';
import { FormEventHandler, useRef, useEffect, useState, useCallback, useMemo } from 'react';
import AppShell from '@/Layouts/AppShell';
import Button from '@/Components/UI/Button';
import Modal from '@/Components/Modal';
import TextInput from '@/Components/TextInput';
import { Textarea } from '@/Components/UI/Textarea';
import { Badge } from '@/Components/UI/Badge';
import { ArrowLeft, Send, Check, CheckCheck, Clock, Menu, Phone, Wifi, WifiOff, X, Smile, Paperclip, Image as ImageIcon, MapPin, FileText, Zap, List, Square, Plus, Sparkles, ThumbsUp, ThumbsDown, Info } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useRealtime } from '@/Providers/RealtimeProvider';
import { MessageSkeleton } from '@/Components/UI/Skeleton';
import { useToast } from '@/hooks/useToast';
import axios from 'axios';
import { Head } from '@inertiajs/react';

interface Message {
    id: number;
    direction: 'inbound' | 'outbound';
    meta_message_id?: string | null;
    type: string;
    text_body: string | null;
    payload?: any;
    status: string;
    error_message?: string | null;
    created_at: string;
    updated_at?: string | null;
    sent_at: string | null;
    delivered_at: string | null;
    read_at: string | null;
}

interface Conversation {
    id: number;
    contact: {
        id: number;
        wa_id: string;
        name: string;
    };
    connection: {
        id: number;
        name: string;
    };
    status: string;
    customer_care_window?: {
        is_open: boolean;
        last_inbound_at: string | null;
        expires_at: string | null;
        seconds_remaining: number;
    };
    assigned_to?: number | null;
    priority?: string | null;
}

interface TemplateItem {
    id: number;
    name: string;
    language: string;
    body_text: string | null;
    header_type?: string | null;
    header_text: string | null;
    header_media_url?: string | null;
    header_media_status?: {
        state: 'ready' | 'missing' | 'reupload_required' | 'not_required';
        label: string;
        description?: string | null;
    } | null;
    footer_text: string | null;
    buttons: any[];
    variable_count: number;
    header_count: number;
    body_count: number;
    button_count: number;
    has_buttons: boolean;
}

interface ListItem {
    id: number;
    name: string;
    button_text: string;
    description: string | null;
}

interface NoteItem {
    id: number;
    note: string;
    created_at: string;
    created_by: {
        id: number;
        name: string;
        email: string;
    } | null;
}

interface AuditEventItem {
    id: number;
    event_type: string;
    description: string | null;
    meta?: any;
    created_at: string;
    actor: {
        id: number;
        name: string;
        email: string;
    } | null;
}

interface AgentItem {
    id: number;
    name: string;
    email: string;
    role: string;
}

const extractList = <T,>(value: unknown): T[] => {
    if (Array.isArray(value)) return value as T[];
    if (value && typeof value === 'object') {
        const maybeData = (value as any).data;
        if (Array.isArray(maybeData)) return maybeData as T[];
        const values = Object.values(value as Record<string, unknown>);
        if (values.every((item) => item && typeof item === 'object')) {
            return values as T[];
        }
    }
    return [];
};

const asBool = (value: unknown): boolean => {
    if (typeof value === 'boolean') return value;
    if (typeof value === 'number') return value === 1;
    if (typeof value === 'string') {
        const normalized = value.trim().toLowerCase();
        return ['1', 'true', 'yes', 'on'].includes(normalized);
    }
    return Boolean(value);
};

const createClientRequestId = (prefix: string): string => {
    try {
        if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
            return `${prefix}:${crypto.randomUUID()}`;
        }
    } catch {
        // Fallback below.
    }

    return `${prefix}:${Date.now()}:${Math.random().toString(36).slice(2, 12)}`;
};

const CUSTOMER_CARE_WINDOW_CLOSED_MESSAGE =
    '24-hour customer care window is closed. Send an approved template message to reopen the conversation.';

const isTemporaryMetaHostedUrl = (url: string | null | undefined): boolean => {
    if (!url) return false;
    try {
        const host = new URL(url).hostname.toLowerCase();
        return (
            host.includes('facebook.com') ||
            host.includes('fbcdn.net') ||
            host.includes('fbsbx.com') ||
            host.includes('lookaside')
        );
    } catch {
        return false;
    }
};

const formatWindowCountdown = (expiresAt: string | null | undefined, nowTick: number) => {
    if (!expiresAt) return null;

    const diffSeconds = Math.max(0, Math.floor((new Date(expiresAt).getTime() - nowTick) / 1000));

    if (diffSeconds <= 0) return 'Closed';

    const totalMinutes = Math.ceil(diffSeconds / 60);
    if (totalMinutes < 60) {
        return `Closes in ${totalMinutes}m`;
    }

    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;

    return minutes === 0 ? `Closes in ${hours}h` : `Closes in ${hours}h ${minutes}m`;
};

const normalizeMessage = (value: any): Message | null => {
    if (!value || value.id == null || !value.created_at) return null;
    const id = Number(value.id);
    if (!Number.isInteger(id) || id < 1) return null;

    return {
        id,
        direction: value.direction === 'inbound' ? 'inbound' : 'outbound',
        meta_message_id: value.meta_message_id ?? null,
        type: String(value.type ?? 'text'),
        text_body: value.text_body ?? null,
        payload: value.payload ?? null,
        status: String(value.status ?? 'queued'),
        error_message: value.error_message ?? null,
        created_at: String(value.created_at),
        updated_at: value.updated_at ?? null,
        sent_at: value.sent_at ?? null,
        delivered_at: value.delivered_at ?? null,
        read_at: value.read_at ?? null,
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

const mergeAuditEvents = (existing: AuditEventItem[], incoming: AuditEventItem[]) => {
    const byId = new Map<number, AuditEventItem>();
    [...existing, ...incoming].forEach((event) => byId.set(event.id, event));

    return Array.from(byId.values()).sort(
        (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
};

const maxId = (items: Array<{ id: number }>) =>
    items.length > 0 ? Math.max(...items.map((item) => item.id)) : 0;

const assignmentEventLabel = (eventType?: string | null) => {
    switch (String(eventType ?? '').toLowerCase()) {
        case 'auto_assigned':
            return 'Auto-assigned';
        case 'transferred':
            return 'Transferred';
        case 'unassigned':
            return 'Unassigned';
        default:
            return 'Assigned';
    }
};

const getAuditEventMeta = (event: AuditEventItem) => {
    const type = String(event.event_type || '').toLowerCase();
    const actor = event.actor?.name || 'System';
    const assignedTo = event.meta?.assigned_to_name || event.meta?.assigned_to;

    const labels: Record<string, { label: string; tone: string; description?: string | null }> = {
        assigned: {
            label: assignmentEventLabel(event.event_type),
            tone: 'text-emerald-600 dark:text-emerald-400',
            description: assignedTo ? `Assigned to ${assignedTo}` : event.description,
        },
        transferred: {
            label: assignmentEventLabel(event.event_type),
            tone: 'text-blue-600 dark:text-blue-400',
            description: assignedTo ? `Transferred to ${assignedTo}` : event.description,
        },
        unassigned: {
            label: assignmentEventLabel(event.event_type),
            tone: 'text-amber-600 dark:text-amber-400',
            description: event.description || `Unassigned by ${actor}`,
        },
        auto_assigned: {
            label: assignmentEventLabel(event.event_type),
            tone: 'text-emerald-600 dark:text-emerald-400',
            description: assignedTo ? `Automatically assigned to ${assignedTo}` : event.description,
        },
        note_added: {
            label: 'Note added',
            tone: 'text-gray-600 dark:text-gray-300',
            description: event.description,
        },
        status_changed: {
            label: 'Status changed',
            tone: 'text-gray-600 dark:text-gray-300',
            description: event.description,
        },
        priority_changed: {
            label: 'Priority changed',
            tone: 'text-gray-600 dark:text-gray-300',
            description: event.description,
        },
    };

    return labels[type] || {
        label: type.replaceAll('_', ' '),
        tone: 'text-gray-500 dark:text-gray-400',
        description: event.description,
    };
};

export default function ConversationsShow({
    account,
    conversation: initialConversation,
    messages: initialMessages = [],
    total_messages,
    templates = [],
    lists = [],
    notes: initialNotes = [],
    audit_events: initialAuditEvents = [],
    agents = [],
    inbox_settings: inboxSettings = {
        auto_assign_enabled: false,
        auto_assign_strategy: 'round_robin',
    },
    ai_available: aiAvailable = false,
    embedded = false,
}: {
    account: any;
    conversation: Conversation;
    messages: Message[];
    total_messages?: number;
    templates: TemplateItem[];
    lists?: ListItem[];
    notes: NoteItem[];
    audit_events: AuditEventItem[];
    agents: AgentItem[];
    inbox_settings: {
        auto_assign_enabled: boolean;
        auto_assign_strategy: string;
    };
    ai_available?: boolean;
    embedded?: boolean;
}) {
    const pageProps = usePage().props as any;
    const resolvedConversation: Conversation | null = initialConversation ?? pageProps?.conversation ?? null;
    const resolvedMessages: Message[] = extractList<Message>(initialMessages).length > 0
        ? extractList<Message>(initialMessages)
        : extractList<Message>(pageProps?.messages);
    const resolvedNotes: NoteItem[] = extractList<NoteItem>(initialNotes).length > 0
        ? extractList<NoteItem>(initialNotes)
        : extractList<NoteItem>(pageProps?.notes);
    const resolvedAuditEvents: AuditEventItem[] = extractList<AuditEventItem>(initialAuditEvents).length > 0
        ? extractList<AuditEventItem>(initialAuditEvents)
        : extractList<AuditEventItem>(pageProps?.audit_events);
    const resolvedAgents: AgentItem[] = extractList<AgentItem>(agents).length > 0
        ? extractList<AgentItem>(agents)
        : extractList<AgentItem>(pageProps?.agents);
    const resolvedTemplates: TemplateItem[] = extractList<TemplateItem>(templates).length > 0
        ? extractList<TemplateItem>(templates)
        : extractList<TemplateItem>(pageProps?.templates);
    const resolvedLists: ListItem[] = extractList<ListItem>(lists).length > 0
        ? extractList<ListItem>(lists)
        : extractList<ListItem>(pageProps?.lists);
    const initialTotalMessages = Number(total_messages ?? pageProps?.total_messages ?? 0);
    const resolvedAiAvailable = Boolean(aiAvailable ?? pageProps?.ai_available ?? false);
    const platformAiEnabled = asBool(pageProps?.ai?.enabled ?? false);
    const isEmbedded = Boolean(embedded ?? pageProps?.embedded ?? false);

    if (!resolvedConversation) {
        return (
            <AppShell>
                <Head title="Conversation" />
                <div className="p-6 text-sm text-gray-600 dark:text-gray-300">
                    Unable to load conversation data. Please refresh the page.
                </div>
            </AppShell>
        );
    }
    const toArray = <T,>(value: T[] | null | undefined): T[] => (Array.isArray(value) ? value : []);
    const normalizedMessages = useMemo(
        () =>
            toArray(resolvedMessages)
                .map(normalizeMessage)
                .filter((message): message is Message => message !== null)
                .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()),
        [resolvedMessages]
    );
    const normalizedNotes = resolvedNotes;
    const normalizedAuditEvents = resolvedAuditEvents;
    const normalizedAgents = resolvedAgents;
    const normalizedTemplates = resolvedTemplates;
    const normalizedLists = resolvedLists;
    const { subscribe, connected } = useRealtime();
    const { addToast } = useToast();
    const { auth, support_access: supportAccess = false } = usePage().props as any;
    const currentUserId = auth?.user?.id;
    const notifyAssignmentEnabled = auth?.user?.notify_assignment_enabled ?? true;
    const notifyMentionEnabled = auth?.user?.notify_mention_enabled ?? true;
    const soundEnabled = auth?.user?.notify_sound_enabled ?? true;
    const aiSuggestionsEnabled = auth?.user?.ai_suggestions_enabled ?? false;
    const showAiSuggest = Boolean(resolvedAiAvailable);
    const canUseAiSuggest = Boolean(resolvedAiAvailable && aiSuggestionsEnabled && platformAiEnabled);
    const [messages, setMessages] = useState<Message[]>(normalizedMessages);
    const [conversation, setConversation] = useState<Conversation>(resolvedConversation);
    const [loading, setLoading] = useState<boolean>(normalizedMessages.length === 0 && initialTotalMessages > 0);
    const [initialSyncPending, setInitialSyncPending] = useState<boolean>(
        normalizedMessages.length === 0 && initialTotalMessages > 0
    );
    const [streamSyncError, setStreamSyncError] = useState<string | null>(null);
    const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
    const [showEmojiBar, setShowEmojiBar] = useState(false);
    const [showQuickReplies, setShowQuickReplies] = useState(false);
    const [showTemplates, setShowTemplates] = useState(false);
    const [showLists, setShowLists] = useState(false);
    const [showComposerTools, setShowComposerTools] = useState(false);
    const [aiSuggestLoading, setAiSuggestLoading] = useState(false);
    const [showButtons, setShowButtons] = useState(false);
    const [showLocation, setShowLocation] = useState(false);
    const [textSending, setTextSending] = useState(false);
    const [listSending, setListSending] = useState(false);
    const [buttonsSending, setButtonsSending] = useState(false);
    const [locationSending, setLocationSending] = useState(false);
    const [attachmentsSending, setAttachmentsSending] = useState(false);
    const [lastAiSuggestion, setLastAiSuggestion] = useState<string | null>(null);
    const [aiFeedbackSending, setAiFeedbackSending] = useState<null | 'up' | 'down'>(null);
    const [aiFeedbackSent, setAiFeedbackSent] = useState<null | 'up' | 'down'>(null);
    const [selectedList, setSelectedList] = useState<ListItem | null>(null);
    const [interactiveButtons, setInteractiveButtons] = useState<Array<{ id: string; text: string }>>([
        { id: '', text: '' },
    ]);
    const [buttonBodyText, setButtonBodyText] = useState('');
    const [buttonHeaderText, setButtonHeaderText] = useState('');
    const [buttonFooterText, setButtonFooterText] = useState('');
    const [attachments, setAttachments] = useState<File[]>([]);
    const [locationInput, setLocationInput] = useState({ label: '', lat: '', lng: '' });
    const [selectedTemplate, setSelectedTemplate] = useState<TemplateItem | null>(null);
    const [templateVariables, setTemplateVariables] = useState<string[]>([]);
    const [templateSending, setTemplateSending] = useState(false);
    const [diagnosticMessage, setDiagnosticMessage] = useState<Message | null>(null);
    const [emojiSearch, setEmojiSearch] = useState('');
    const [recentEmojis, setRecentEmojis] = useState<string[]>([]);
    const [notes, setNotes] = useState<NoteItem[]>(normalizedNotes);
    const [auditEvents, setAuditEvents] = useState<AuditEventItem[]>(normalizedAuditEvents);
    const [timeTick, setTimeTick] = useState<number>(Date.now());
    const [noteDraft, setNoteDraft] = useState('');
    const [metaUpdating, setMetaUpdating] = useState(false);
    const [showConversationSettings, setShowConversationSettings] = useState(false);
    const [showInternalNotes, setShowInternalNotes] = useState(false);
    const [pendingAssignedTo, setPendingAssignedTo] = useState<number | null | undefined>(undefined);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const messagesContainerRef = useRef<HTMLDivElement>(null);
    const [shouldAutoScroll, setShouldAutoScroll] = useState(true);
    const pollTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const pollFailureCountRef = useRef(0);
    const pollErrorToastAtRef = useRef(0);
    const [isTabVisible, setIsTabVisible] = useState<boolean>(
        typeof document === 'undefined' ? true : !document.hidden
    );
    const lastMessageIdRef = useRef<number>(maxId(normalizedMessages));
    const processedMessageIds = useRef<Set<number>>(new Set(normalizedMessages.map((m) => m.id)));
    const lastMessageUpdatedAtRef = useRef<string>(
        normalizedMessages.reduce((latest, current) => {
            const candidate = current.updated_at ?? current.created_at;
            if (!latest) return candidate;
            return new Date(candidate).getTime() > new Date(latest).getTime() ? candidate : latest;
        }, '')
    );
    const lastNoteIdRef = useRef<number>(maxId(normalizedNotes));
    const lastAuditIdRef = useRef<number>(maxId(normalizedAuditEvents));
    const assignedToRef = useRef<number | null>(resolvedConversation.assigned_to ?? null);
    const hydratedConversationIdRef = useRef<number | null>(null);
    const historyBootstrapAttemptedRef = useRef<boolean>(normalizedMessages.length > 0);
    const forcedHistoryResyncRef = useRef<boolean>(false);

    const { data, setData, processing, errors, reset } = useForm({
        message: ''});

    useEffect(() => {
        if (!resolvedConversation) return;

        const conversationChanged = hydratedConversationIdRef.current !== resolvedConversation.id;
        setConversation((prev) => (conversationChanged ? resolvedConversation : { ...prev, ...resolvedConversation }));

        if (conversationChanged) {
            setMessages(normalizedMessages);
            setNotes(normalizedNotes);
            setAuditEvents(normalizedAuditEvents);
            setLoading(normalizedMessages.length === 0 && initialTotalMessages > 0);
            setInitialSyncPending(normalizedMessages.length === 0 && initialTotalMessages > 0);
            forcedHistoryResyncRef.current = false;
            hydratedConversationIdRef.current = resolvedConversation.id;
            assignedToRef.current = resolvedConversation.assigned_to ?? null;
            historyBootstrapAttemptedRef.current = normalizedMessages.length > 0;
            lastMessageIdRef.current = maxId(normalizedMessages);
            processedMessageIds.current = new Set(normalizedMessages.map((m) => m.id));
            lastMessageUpdatedAtRef.current = normalizedMessages.reduce((latest, current) => {
                const candidate = current.updated_at ?? current.created_at;
                if (!latest) return candidate;
                return new Date(candidate).getTime() > new Date(latest).getTime() ? candidate : latest;
            }, '');
            lastNoteIdRef.current = maxId(normalizedNotes);
            lastAuditIdRef.current = maxId(normalizedAuditEvents);
            return;
        }

        // Same conversation: merge props into live state, never wipe to empty on partial updates.
        if (normalizedMessages.length > 0) {
            setMessages((prev) => mergeMessages(prev, normalizedMessages));
            setLoading(false);
            setInitialSyncPending(false);
            historyBootstrapAttemptedRef.current = true;
            lastMessageIdRef.current = Math.max(
                ...normalizedMessages.map((m) => m.id),
                lastMessageIdRef.current
            );
        }
        if (normalizedNotes.length > 0) {
            setNotes((prev) => {
                const byId = new Map(prev.map((note) => [note.id, note]));
                normalizedNotes.forEach((note) => byId.set(note.id, note));
                return Array.from(byId.values()).sort(
                    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
                );
            });
            lastNoteIdRef.current = Math.max(
                ...normalizedNotes.map((n) => n.id),
                lastNoteIdRef.current
            );
        }
        if (normalizedAuditEvents.length > 0) {
            setAuditEvents((prev) => mergeAuditEvents(prev, normalizedAuditEvents));
            lastAuditIdRef.current = Math.max(
                ...normalizedAuditEvents.map((e) => e.id),
                lastAuditIdRef.current
            );
        }
    }, [resolvedConversation, normalizedMessages, normalizedNotes, normalizedAuditEvents, initialTotalMessages]);

    useEffect(() => {
        const interval = window.setInterval(() => setTimeTick(Date.now()), 30000);
        return () => window.clearInterval(interval);
    }, []);

    const emojiList = ['😀', '😁', '😂', '🤣', '😍', '😘', '😊', '🥰', '😎', '🤝', '👍', '🙏', '🎉', '🔥', '✨', '💡', '😢', '😮', '😡', '🤔', '😅', '🙌', '✅', '❌'];
    const quickReplies = [
        { id: 'greeting', label: 'Greeting', text: 'Hi! How can I help you today?' },
        { id: 'followup', label: 'Follow-up', text: 'Just checking in—did that solve the issue?' },
        { id: 'thanks', label: 'Thanks', text: 'Thanks for reaching out! We’re on it.' },
        { id: 'handover', label: 'Handover', text: 'I’m looping in a specialist to assist you.' },
    ];
    const availableTemplates = normalizedTemplates;
    const agentMap = new Map(normalizedAgents.map((agent) => [agent.id, agent]));
    const isCustomerCareWindowOpen = Boolean(conversation.customer_care_window?.is_open);
    const customerCareWindowStatusText = isCustomerCareWindowOpen
        ? formatWindowCountdown(conversation.customer_care_window?.expires_at, timeTick) ?? 'Open'
        : 'Closed';
    const customerCareWindowHelperText = isCustomerCareWindowOpen
        ? `Free replies stay open until ${new Date(
              conversation.customer_care_window?.expires_at ?? ''
          ).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}.`
        : 'Send an approved template to reopen the conversation.';
    const mentionTokens = useMemo(() => {
        if (!auth?.user) return [];
        const name = auth.user.name || '';
        const email = auth.user.email || '';
        const simpleName = name.split(' ')[0] || '';
        const compactName = name.replace(/\s+/g, '');
        return [email, name, simpleName, compactName]
            .filter(Boolean)
            .map((token: string) => `@${token.toLowerCase()}`);
    }, [auth?.user]);

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

    const noteMentionsCurrentUser = useCallback(
        (noteText: string, authorId?: number | null) => {
            if (!notifyMentionEnabled || !currentUserId) return false;
            if (authorId && authorId === currentUserId) return false;
            const text = noteText.toLowerCase();
            return mentionTokens.some((token) => text.includes(token));
        },
        [notifyMentionEnabled, currentUserId, mentionTokens]
    );

    const appendMessage = (text: string) => {
        setData('message', `${data.message || ''}${text}`);
    };

    useEffect(() => {
        const stored = localStorage.getItem('waify.recentEmojis');
        if (stored) {
            try {
                const parsed = JSON.parse(stored);
                if (Array.isArray(parsed)) {
                    setRecentEmojis(parsed.slice(0, 12));
                }
            } catch (error) {
                console.warn('[Emoji] Failed to parse recent emojis');
            }
        }
    }, []);

    const handleEmojiSelect = (emoji: string) => {
        appendMessage(emoji);
        setRecentEmojis((prev) => {
            const next = [emoji, ...prev.filter((item) => item !== emoji)].slice(0, 12);
            localStorage.setItem('waify.recentEmojis', JSON.stringify(next));
            return next;
        });
    };

    const insertMessage = (text: string) => {
        setData('message', text);
    };

    const handleAttachmentChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(event.target.files || []);
        if (files.length === 0) return;
        setAttachments((prev) => [...prev, ...files]);
        event.target.value = '';
        addToast({
            title: 'Attachment added',
            description: 'Attachments will be supported for sending soon.',
            variant: 'info'});
    };

    const removeAttachment = (index: number) => {
        setAttachments((prev) => prev.filter((_, i) => i !== index));
    };

    const notifyClosedCustomerCareWindow = useCallback(() => {
        addToast({
            title: '24-hour window closed',
            description: CUSTOMER_CARE_WINDOW_CLOSED_MESSAGE,
            variant: 'warning',
            duration: 7000,
        });
    }, [addToast]);

    const sendList = useCallback(async () => {
        if (listSending) return;
        if (!isCustomerCareWindowOpen) {
            notifyClosedCustomerCareWindow();
            return;
        }
        if (!selectedList) {
            addToast({ title: 'List needed', description: 'Please select a list to send.', variant: 'warning' });
            return;
        }

        try {
            setListSending(true);
            const response = await axios.post(
                route('app.whatsapp.conversations.send-list', {
                    conversation: conversation.id}),
                {
                    list_id: selectedList.id,
                    client_request_id: createClientRequestId('list'),
                }
            );
            const message = response?.data?.message || 'List sent successfully.';
            const isDuplicate = typeof message === 'string' && message.toLowerCase().includes('duplicate');
            addToast({ title: isDuplicate ? 'Duplicate ignored' : 'List accepted', description: message, variant: isDuplicate ? 'info' : 'success' });
            setShowLists(false);
            setSelectedList(null);
        } catch (error: any) {
            addToast({
                title: 'Failed to send list',
                description: error?.response?.data?.message || 'Please try again',
                variant: 'error'});
        } finally {
            setListSending(false);
        }
    }, [addToast, conversation.id, selectedList, account.slug, listSending, isCustomerCareWindowOpen, notifyClosedCustomerCareWindow]);

    const sendInteractiveButtons = useCallback(async () => {
        if (buttonsSending) return;
        if (!isCustomerCareWindowOpen) {
            notifyClosedCustomerCareWindow();
            return;
        }
        const validButtons = interactiveButtons.filter((btn) => btn.id.trim() && btn.text.trim());
        if (validButtons.length === 0) {
            addToast({ title: 'Buttons needed', description: 'Please add at least one button.', variant: 'warning' });
            return;
        }
        if (!buttonBodyText.trim()) {
            addToast({ title: 'Body text needed', description: 'Please enter body text.', variant: 'warning' });
            return;
        }

        try {
            setButtonsSending(true);
            const response = await axios.post(
                route('app.whatsapp.conversations.send-buttons', {
                    conversation: conversation.id}),
                {
                    body_text: buttonBodyText,
                    buttons: validButtons,
                    header_text: buttonHeaderText || null,
                    footer_text: buttonFooterText || null,
                    client_request_id: createClientRequestId('buttons'),
                }
            );
            const message = response?.data?.message || 'Interactive buttons sent successfully.';
            const isDuplicate = typeof message === 'string' && message.toLowerCase().includes('duplicate');
            addToast({ title: isDuplicate ? 'Duplicate ignored' : 'Buttons accepted', description: message, variant: isDuplicate ? 'info' : 'success' });
            setShowButtons(false);
            setInteractiveButtons([{ id: '', text: '' }]);
            setButtonBodyText('');
            setButtonHeaderText('');
            setButtonFooterText('');
        } catch (error: any) {
            addToast({
                title: 'Failed to send buttons',
                description: error?.response?.data?.message || 'Please try again',
                variant: 'error'});
        } finally {
            setButtonsSending(false);
        }
    }, [addToast, conversation.id, interactiveButtons, buttonBodyText, buttonHeaderText, buttonFooterText, account.slug, buttonsSending, isCustomerCareWindowOpen, notifyClosedCustomerCareWindow]);

    const addButton = () => {
        if (interactiveButtons.length >= 3) {
            addToast({ title: 'Maximum 3 buttons allowed', variant: 'warning' });
            return;
        }
        setInteractiveButtons([...interactiveButtons, { id: '', text: '' }]);
    };

    const removeButton = (index: number) => {
        const buttons = [...interactiveButtons];
        buttons.splice(index, 1);
        if (buttons.length === 0) {
            buttons.push({ id: '', text: '' });
        }
        setInteractiveButtons(buttons);
    };

    const updateButton = (index: number, field: 'id' | 'text', value: string) => {
        const buttons = [...interactiveButtons];
        buttons[index] = { ...buttons[index], [field]: value };
        setInteractiveButtons(buttons);
    };

    const sendLocation = useCallback(async () => {
        if (locationSending) return;
        if (!isCustomerCareWindowOpen) {
            notifyClosedCustomerCareWindow();
            return;
        }
        const { label, lat, lng } = locationInput;
        if (!lat || !lng) {
            addToast({ title: 'Location needed', description: 'Add latitude and longitude.', variant: 'warning' });
            return;
        }

        try {
            setLocationSending(true);
            const response = await axios.post(
                route('app.whatsapp.conversations.send-location', {
                    conversation: conversation.id}),
                {
                    latitude: Number(lat),
                    longitude: Number(lng),
                    name: label || null,
                    address: null,
                    client_request_id: createClientRequestId('location'),
                }
            );

            const message = response?.data?.message || 'Location sent successfully.';
            const isDuplicate = typeof message === 'string' && message.toLowerCase().includes('duplicate');
            addToast({ title: isDuplicate ? 'Duplicate ignored' : 'Location accepted', description: message, variant: isDuplicate ? 'info' : 'success' });
            setShowLocation(false);
            setLocationInput({ label: '', lat: '', lng: '' });
        } catch (error: any) {
            addToast({
                title: 'Failed to send location',
                description: error?.response?.data?.message || 'Please try again',
                variant: 'error'});
        } finally {
            setLocationSending(false);
        }
    }, [addToast, conversation.id, locationInput, account.slug, locationSending, isCustomerCareWindowOpen, notifyClosedCustomerCareWindow]);

    const sendAttachments = useCallback(async (caption?: string) => {
        if (attachmentsSending) return;
        if (attachments.length === 0) return;
        if (!isCustomerCareWindowOpen) {
            notifyClosedCustomerCareWindow();
            return;
        }

        try {
            setAttachmentsSending(true);
            for (let i = 0; i < attachments.length; i += 1) {
                const file = attachments[i];
                const fileType = file.type.startsWith('image/')
                    ? 'image'
                    : file.type.startsWith('video/')
                    ? 'video'
                    : 'document';

                const formData = new FormData();
                formData.append('type', fileType);
                formData.append('attachment', file);
                if (caption && i === 0) {
                    formData.append('caption', caption);
                }
                formData.append('client_request_id', createClientRequestId('media'));

                try {
                    const response = await axios.post(
                        route('app.whatsapp.conversations.send-media', {
                            conversation: conversation.id}),
                        formData,
                        {
                            headers: { 'Content-Type': 'multipart/form-data' }}
                    );
                    const message = response?.data?.message;
                    if (typeof message === 'string' && message.toLowerCase().includes('duplicate')) {
                        addToast({ title: 'Duplicate ignored', description: message, variant: 'info' });
                    }
                } catch (error: any) {
                    addToast({
                        title: 'Failed to send attachment',
                        description: error?.response?.data?.message || 'Please try again',
                        variant: 'error'});
                    return;
                }
            }

            addToast({ title: 'Attachments sent', variant: 'success' });
            setAttachments([]);
        } finally {
            setAttachmentsSending(false);
        }
    }, [addToast, attachments, conversation.id, account.slug, attachmentsSending, isCustomerCareWindowOpen, notifyClosedCustomerCareWindow]);

    const sendTemplate = useCallback(async () => {
        if (!selectedTemplate || templateSending) return;

        const headerType = (selectedTemplate.header_type || '').toUpperCase();
        const requiresHeaderMedia = ['IMAGE', 'VIDEO', 'DOCUMENT'].includes(headerType);
        const headerMediaUrl = (selectedTemplate.header_media_url || '').trim();
        if (requiresHeaderMedia && !headerMediaUrl) {
            addToast({
                title: 'Template requires header media',
                description: `This template expects ${headerType.toLowerCase()} header media. Upload media in template edit before sending.`,
                variant: 'error',
            });
            return;
        }
        if (requiresHeaderMedia && isTemporaryMetaHostedUrl(headerMediaUrl)) {
            addToast({
                title: 'Template header media expired',
                description: 'This template uses a temporary Meta-hosted media URL. Re-upload header media in template edit and sync.',
                variant: 'error',
            });
            return;
        }

        try {
            setTemplateSending(true);
            const response = await axios.post(
                route('app.whatsapp.conversations.send-template', {
                    conversation: conversation.id}),
                {
                    template_id: selectedTemplate.id,
                    variables: templateVariables,
                    client_request_id: createClientRequestId('tpl'),
                }
            );

            const message = response?.data?.message || 'Accepted by WhatsApp. Delivery/read status will update from webhook events.';
            const isDuplicate = typeof message === 'string' && message.toLowerCase().includes('duplicate');
            addToast({
                title: isDuplicate ? 'Duplicate ignored' : 'Template accepted',
                description: message,
                variant: isDuplicate ? 'info' : 'success',
            });
            setSelectedTemplate(null);
            setTemplateVariables([]);
            setShowTemplates(false);
        } catch (error: any) {
            addToast({
                title: 'Failed to send template',
                description: error?.response?.data?.message || 'Please try again',
                variant: 'error'});
        } finally {
            setTemplateSending(false);
        }
    }, [addToast, conversation.id, selectedTemplate, templateVariables, account.slug, templateSending]);

    const scrollMessagesToBottom = useCallback((behavior: ScrollBehavior = 'smooth') => {
        const container = messagesContainerRef.current;
        if (!container) return;

        container.scrollTo({
            top: container.scrollHeight,
            behavior,
        });
    }, []);

    // Auto-scroll detection - only scroll if user is near bottom
    const checkScrollPosition = useCallback(() => {
        const container = messagesContainerRef.current;
        if (!container) return;

        const isNearBottom =
            container.scrollHeight - container.scrollTop - container.clientHeight < 150;
        setShouldAutoScroll(isNearBottom);
    }, []);

    useEffect(() => {
        const container = messagesContainerRef.current;
        if (!container) return;

        container.addEventListener('scroll', checkScrollPosition);
        checkScrollPosition();

        return () => container.removeEventListener('scroll', checkScrollPosition);
    }, [checkScrollPosition]);

    // Auto-scroll on new messages (only if user is near bottom)
    useEffect(() => {
        if (shouldAutoScroll && messages.length > 0) {
            setTimeout(() => {
                scrollMessagesToBottom('smooth');
            }, 100);
        }
    }, [messages, scrollMessagesToBottom, shouldAutoScroll]);

    const recoverHistory = useCallback(async () => {
        if (!account?.id || !conversation?.id) return;

        setLoading(true);
        setInitialSyncPending(true);
        try {
            const response = await axios.get(
                route('app.whatsapp.inbox.conversation.stream', {
                    conversation: conversation.id}),
                {
                    params: {
                        after_message_id: 0,
                        after_note_id: Math.max(0, lastNoteIdRef.current || 0),
                        after_audit_id: Math.max(0, lastAuditIdRef.current || 0),
                    }}
            );

            const recoveredMessages = toArray<any>(response.data?.new_messages)
                .map(normalizeMessage)
                .filter((message): message is Message => message !== null);

            if (recoveredMessages.length > 0) {
                setMessages((prev) => (prev.length > 0 ? mergeMessages(prev, recoveredMessages) : recoveredMessages));
                lastMessageIdRef.current = Math.max(lastMessageIdRef.current, maxId(recoveredMessages));
                for (const message of recoveredMessages) {
                    processedMessageIds.current.add(message.id);
                    const updatedAt = message.updated_at ?? message.created_at;
                    if (
                        !lastMessageUpdatedAtRef.current ||
                        new Date(updatedAt).getTime() > new Date(lastMessageUpdatedAtRef.current).getTime()
                    ) {
                        lastMessageUpdatedAtRef.current = updatedAt;
                    }
                }
            }
            setInitialSyncPending(false);
            setStreamSyncError(null);
        } catch (error) {
            console.error('[Conversation] History recovery failed:', error);
            setStreamSyncError('Could not recover conversation history. Please retry.');
        } finally {
            historyBootstrapAttemptedRef.current = true;
            setLoading(false);
        }
    }, [account?.id, conversation?.id]);

    useEffect(() => {
        if (!conversation?.id) return;
        if (messages.length > 0) return;
        if (initialTotalMessages <= 0) return;
        if (historyBootstrapAttemptedRef.current) return;

        historyBootstrapAttemptedRef.current = true;
        recoverHistory();
    }, [conversation?.id, messages.length, initialTotalMessages, recoverHistory]);

    // Realtime subscription with dedup
    useEffect(() => {
        if (!account?.id || !conversation?.id) return;

        const conversationChannel = `account.${account.id}.whatsapp.conversation.${conversation.id}`;

        const unsubscribeMessageCreated = subscribe(
            conversationChannel,
            '.whatsapp.message.created',
            (data: any) => {
                const newMessage = normalizeMessage(data?.message);
                if (newMessage && !processedMessageIds.current.has(newMessage.id)) {
                    processedMessageIds.current.add(newMessage.id);
                    setMessages((prev) => mergeMessages(prev, [newMessage]));
                    lastMessageIdRef.current = Math.max(lastMessageIdRef.current, newMessage.id);
                    lastMessageUpdatedAtRef.current = newMessage.updated_at ?? newMessage.created_at;

                    if (newMessage.direction === 'inbound') {
                        addToast({
                            title: 'New message',
                            description: newMessage.text_body?.substring(0, 50) || 'New message received',
                            variant: 'info',
                            duration: 3000});
                    }
                }
            }
        );

        const unsubscribeMessageUpdated = subscribe(
            conversationChannel,
            '.whatsapp.message.updated',
            (data: any) => {
                const messageId = Number(data?.message?.id);
                if (!Number.isInteger(messageId) || messageId < 1) return;
                const updatedAt = data?.message?.updated_at ?? new Date().toISOString();
                lastMessageUpdatedAtRef.current = updatedAt;
                setMessages((prev) =>
                    prev.map((msg) =>
                        msg.id === messageId
                            ? {
                              ...msg,
                                  meta_message_id: data.message.meta_message_id ?? msg.meta_message_id,
                                  status: data.message.status ?? msg.status,
                                  error_message: data.message.error_message ?? msg.error_message,
                                  payload: data.message.payload ?? msg.payload,
                                  updated_at: updatedAt,
                                  sent_at: data.message.sent_at ?? msg.sent_at,
                                  delivered_at: data.message.delivered_at ?? msg.delivered_at,
                                  read_at: data.message.read_at ?? msg.read_at,
                              }
                            : msg
                    )
                );
            }
        );

        const unsubscribeConversationUpdated = subscribe(
            conversationChannel,
            '.whatsapp.conversation.updated',
            (data: any) => {
                if (data.conversation) {
                    setConversation((prev) => ({
                        ...prev,
                        status: data.conversation.status ?? prev.status,
                        customer_care_window:
                            data.conversation.customer_care_window ?? prev.customer_care_window,
                        assigned_to: data.conversation.assignee_id ?? prev.assigned_to,
                        priority: data.conversation.priority ?? prev.priority,
                    }));

                    if (
                        currentUserId &&
                        notifyAssignmentEnabled &&
                        data.conversation.assignee_id === currentUserId &&
                        assignedToRef.current !== currentUserId
                    ) {
                        addToast({
                            title: 'Assigned to you',
                            description: 'This chat was assigned to you.',
                            variant: 'info',
                            duration: 3000});
                        playNotificationSound();
                    }

                    assignedToRef.current = data.conversation.assignee_id ?? assignedToRef.current;
                }
            }
        );

        const unsubscribeNoteAdded = subscribe(
            conversationChannel,
            '.whatsapp.note.added',
            (data: any) => {
                if (data.note) {
                    setNotes((prev) => [data.note, ...prev]);
                    lastNoteIdRef.current = Math.max(lastNoteIdRef.current, data.note.id);
                    if (noteMentionsCurrentUser(data.note.note || '', data.note.created_by?.id)) {
                        addToast({
                            title: 'You were mentioned',
                            description: data.note.note?.slice(0, 80) || 'A note mentioned you.',
                            variant: 'info',
                            duration: 4000});
                        playNotificationSound();
                    }
                }
            }
        );

        const unsubscribeAuditAdded = subscribe(
            conversationChannel,
            '.whatsapp.audit.added',
            (data: any) => {
                if (data.audit_event) {
                    setAuditEvents((prev) => mergeAuditEvents(prev, [data.audit_event]));
                    lastAuditIdRef.current = Math.max(lastAuditIdRef.current, data.audit_event.id);
                    const ev = data.audit_event;
                    const isAssignment = ['assigned', 'transferred', 'unassigned', 'auto_assigned'].includes(ev.event_type);
                    const assignedToSomeoneElse = ev.meta?.assigned_to != null && ev.meta.assigned_to !== currentUserId;
                    if (isAssignment && ev.description && assignedToSomeoneElse) {
                        addToast({
                            title: assignmentEventLabel(ev.event_type),
                            description: ev.description,
                            variant: 'info',
                            duration: 4000,
                        });
                    }
                }
            }
        );

        return () => {
            unsubscribeMessageCreated();
            unsubscribeMessageUpdated();
            unsubscribeConversationUpdated();
            unsubscribeNoteAdded();
            unsubscribeAuditAdded();
        };
    }, [
        account?.id,
        conversation?.id,
        subscribe,
        addToast,
        currentUserId,
        notifyAssignmentEnabled,
        noteMentionsCurrentUser,
        playNotificationSound,
    ]);

    // Poll conversation updates continuously.
    // Keep polling even when Echo reports connected, because transport can be connected
    // while server-side broadcasting is misconfigured and events are not delivered.
    useEffect(() => {
        if (!account?.id || !conversation?.id) {
            if (pollTimerRef.current) {
                clearTimeout(pollTimerRef.current);
                pollTimerRef.current = null;
            }
            return;
        }

        let cancelled = false;
        const baseIntervalMs = isTabVisible
            ? (connected ? 12000 : 7000)
            : 45000;

        const scheduleNextPoll = (delayMs: number) => {
            if (cancelled) return;
            if (pollTimerRef.current) {
                clearTimeout(pollTimerRef.current);
            }
            pollTimerRef.current = setTimeout(() => {
                void poll();
            }, delayMs);
        };

        const poll = async () => {
            try {
                const response = await axios.get(
                    route('app.whatsapp.inbox.conversation.stream', {
                        conversation: conversation.id}),
                    {
                        params: {
                            after_message_id: Math.max(0, lastMessageIdRef.current || 0),
                            after_updated_at: lastMessageUpdatedAtRef.current || undefined,
                            after_note_id: Math.max(0, lastNoteIdRef.current || 0),
                            after_audit_id: Math.max(0, lastAuditIdRef.current || 0)}}
                );

                const newMessagesFromServer = toArray<any>(response.data?.new_messages)
                    .map(normalizeMessage)
                    .filter((message): message is Message => message !== null);
                const updatedMessagesFromServer = toArray<any>(response.data?.updated_messages);
                const newNotesFromServer = toArray<NoteItem>(response.data?.new_notes);
                const newAuditEventsFromServer = toArray<AuditEventItem>(response.data?.new_audit_events);

                if (newMessagesFromServer.length > 0) {
                    setMessages((prev) => mergeMessages(prev, newMessagesFromServer));
                    historyBootstrapAttemptedRef.current = true;
                    setInitialSyncPending(false);
                    lastMessageIdRef.current = Math.max(maxId(newMessagesFromServer), lastMessageIdRef.current);
                    for (const message of newMessagesFromServer) {
                        processedMessageIds.current.add(message.id);
                        const updatedAt = message.updated_at ?? message.created_at;
                        if (
                            !lastMessageUpdatedAtRef.current ||
                            new Date(updatedAt).getTime() > new Date(lastMessageUpdatedAtRef.current).getTime()
                        ) {
                            lastMessageUpdatedAtRef.current = updatedAt;
                        }
                    }
                }

                if (updatedMessagesFromServer.length > 0) {
                    setMessages((prev) =>
                        prev.map((msg) => {
                            const updated = updatedMessagesFromServer.find(
                                (um: any) => Number(um.id) === msg.id
                            );
                            return updated
                                ? {
                                      ...msg,
                                      meta_message_id: updated.meta_message_id ?? msg.meta_message_id,
                                      status: updated.status ?? msg.status,
                                      error_message: updated.error_message ?? msg.error_message,
                                      payload: updated.payload ?? msg.payload,
                                      updated_at: updated.updated_at ?? msg.updated_at,
                                      sent_at: updated.sent_at ?? msg.sent_at,
                                      delivered_at: updated.delivered_at ?? msg.delivered_at,
                                      read_at: updated.read_at ?? msg.read_at,
                                  }
                                : msg;
                        })
                    );
                    const latestUpdatedAt = updatedMessagesFromServer
                        .map((message: any) => message?.updated_at)
                        .filter(Boolean)
                        .sort()
                        .pop();
                    if (latestUpdatedAt) {
                        lastMessageUpdatedAtRef.current = latestUpdatedAt;
                    }
                }

                if (newNotesFromServer.length > 0) {
                    setNotes((prev) => [...newNotesFromServer.slice().reverse(), ...prev]);
                    lastNoteIdRef.current = Math.max(maxId(newNotesFromServer), lastNoteIdRef.current);
                }

                if (newAuditEventsFromServer.length > 0) {
                    setAuditEvents((prev) => mergeAuditEvents(prev, newAuditEventsFromServer));
                    lastAuditIdRef.current = Math.max(maxId(newAuditEventsFromServer), lastAuditIdRef.current);
                }

                if (response.data.conversation) {
                    setConversation((prev) => ({
                        ...prev,
                        ...response.data.conversation,
                        customer_care_window:
                            response.data.conversation.customer_care_window ?? prev.customer_care_window,
                    }));
                }

                if (
                    initialSyncPending &&
                    initialTotalMessages > 0 &&
                    lastMessageIdRef.current === 0 &&
                    newMessagesFromServer.length === 0 &&
                    !forcedHistoryResyncRef.current
                ) {
                    forcedHistoryResyncRef.current = true;
                    await recoverHistory();
                }

                if (initialSyncPending && initialTotalMessages > 0) {
                    setInitialSyncPending(false);
                }

                if (response.data?.server_time) {
                    lastMessageUpdatedAtRef.current = response.data.server_time;
                }
                pollFailureCountRef.current = 0;
                if (streamSyncError) {
                    setStreamSyncError(null);
                }
                setLoading(false);
                scheduleNextPoll(baseIntervalMs);
            } catch (error) {
                console.error('[Conversation] Polling error:', error);
                pollFailureCountRef.current = Math.min(pollFailureCountRef.current + 1, 6);

                const now = Date.now();
                if (now - pollErrorToastAtRef.current > 60_000) {
                    addToast({
                        title: 'Conversation sync delayed',
                        description: 'Realtime updates are delayed. Background recovery is retrying.',
                        variant: 'warning',
                        duration: 4000,
                    });
                    pollErrorToastAtRef.current = now;
                }

                const backoffMultiplier = Math.pow(2, Math.max(0, pollFailureCountRef.current - 1));
                const nextDelay = Math.min(60000, baseIntervalMs * backoffMultiplier);
                if (pollFailureCountRef.current >= 3) {
                    setStreamSyncError('Realtime updates are delayed. New messages, assignments, or audit events may appear late.');
                }
                scheduleNextPoll(nextDelay);
                setLoading(false);
            }
        };

        void poll();

        return () => {
            cancelled = true;
            if (pollTimerRef.current) {
                clearTimeout(pollTimerRef.current);
                pollTimerRef.current = null;
            }
        };
    }, [connected, isTabVisible, account?.id, conversation?.id, addToast, initialSyncPending, initialTotalMessages, recoverHistory, streamSyncError]);

    const handleSend = useCallback(async () => {
        if (processing || textSending || attachmentsSending) return;
        if (!isCustomerCareWindowOpen) {
            notifyClosedCustomerCareWindow();
            return;
        }

        const trimmed = data.message.trim();

        if (attachments.length > 0) {
            await sendAttachments(trimmed || undefined);
            reset('message');
            return;
        }

        if (!trimmed) return;
        try {
            setTextSending(true);
            await axios.post(
                route('app.whatsapp.conversations.send', {
                    conversation: conversation.id}),
                {
                    message: trimmed,
                    client_request_id: createClientRequestId('msg'),
                }
            );
            reset('message');
        } catch (error: any) {
            const payload = error?.response?.data ?? {};
            const msg = payload?.message || error?.message;
            const detail = payload?.message_detail;
            const is24h = msg === 'outside_24h' || (typeof msg === 'string' && (msg.includes('template') || msg.includes('24 hour') || msg.includes('recovery')));
            addToast({
                title: is24h ? 'Use a template to start the conversation' : 'Failed to send message',
                description: detail || msg || (is24h ? CUSTOMER_CARE_WINDOW_CLOSED_MESSAGE : 'Please try again'),
                variant: 'error',
                duration: 8000});
            if (is24h) {
                setTimeout(() => {
                    const templateSection = document.querySelector('[data-template-section]');
                    templateSection?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
                }, 300);
            }
        } finally {
            setTextSending(false);
        }
    }, [processing, textSending, attachmentsSending, data.message, attachments.length, sendAttachments, account.slug, conversation.id, reset, addToast, isCustomerCareWindowOpen, notifyClosedCustomerCareWindow]);

    const submitNote = async () => {
        const trimmed = noteDraft.trim();
        if (!trimmed) return;

        try {
            const response = await axios.post(
                route('app.whatsapp.conversations.notes.store', {
                    conversation: conversation.id}),
                { note: trimmed }
            );

            if (response.data?.note) {
                setNotes((prev) => [response.data.note, ...prev]);
                lastNoteIdRef.current = Math.max(lastNoteIdRef.current, response.data.note.id);
            }
            setNoteDraft('');
            addToast({ title: 'Note added', variant: 'success' });
        } catch (error: any) {
            addToast({
                title: 'Failed to add note',
                description: error?.response?.data?.message || 'Please try again',
                variant: 'error'});
        }
    };

    const updateConversationMeta = useCallback(
        (updates: Partial<{ status: string; assigned_to: number | null; priority: string | null }>) => {
            if (metaUpdating) return;
            const previousConversation = conversation;
            setMetaUpdating(true);
            if (Object.prototype.hasOwnProperty.call(updates, 'assigned_to')) {
                setPendingAssignedTo(updates.assigned_to ?? null);
            }
            setConversation((prev) => ({
                ...prev,
                ...updates,
            }));

            router.post(
                route('app.whatsapp.conversations.update', {
                    conversation: conversation.id}),
                updates,
                {
                    preserveScroll: true,
                    preserveState: true,
                    onSuccess: () => {},
                    onError: (errs) => {
                        setConversation(previousConversation);
                        addToast({
                            title: 'Update failed',
                            description: errs?.assigned_to || errs?.status || errs?.priority || 'Please try again.',
                            variant: 'error'});
                    },
                    onFinish: () => {
                        setMetaUpdating(false);
                        setPendingAssignedTo(undefined);
                    }});
        },
        [addToast, conversation, metaUpdating]
    );

    const handleAiSuggest = useCallback(() => {
        if (!showAiSuggest || aiSuggestLoading) return;
        setAiSuggestLoading(true);
        axios
            .post(route('app.whatsapp.conversations.ai-suggest', { conversation: conversation.id }))
            .then((res) => {
                const suggestion = res.data?.suggestion;
                if (typeof suggestion === 'string' && suggestion.trim()) {
                    const normalized = suggestion.trim();
                    setData('message', normalized);
                    setLastAiSuggestion(normalized);
                    setAiFeedbackSent(null);
                    addToast({ title: 'AI suggestion added', description: 'Edit or send as is.', variant: 'info', duration: 2000 });
                }
            })
            .catch((err) => {
                const msg = err?.response?.data?.error || err?.message || 'AI suggestion failed.';
                addToast({ title: 'AI suggestion failed', description: msg, variant: 'error' });
            })
            .finally(() => setAiSuggestLoading(false));
    }, [showAiSuggest, aiSuggestLoading, conversation.id, setData, addToast]);

    const handleAiFeedback = useCallback((verdict: 'up' | 'down') => {
        if (!lastAiSuggestion || aiFeedbackSending) return;
        setAiFeedbackSending(verdict);
        axios
            .post(route('app.whatsapp.conversations.ai-feedback', { conversation: conversation.id }), {
                suggestion: lastAiSuggestion,
                verdict,
                reason: null,
            })
            .then(() => {
                setAiFeedbackSent(verdict);
                addToast({ title: 'Feedback saved', variant: 'success', duration: 1500 });
            })
            .catch(() => {
                addToast({ title: 'Failed to save feedback', variant: 'error' });
            })
            .finally(() => setAiFeedbackSending(null));
    }, [lastAiSuggestion, aiFeedbackSending, conversation.id, addToast]);

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        handleSend();
    };

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape' && mobileDrawerOpen) {
                setMobileDrawerOpen(false);
            }

            if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
                e.preventDefault();
                handleSend();
            }

            if ((e.metaKey || e.ctrlKey) && e.shiftKey) {
                if (e.key.toLowerCase() === 'e') {
                    e.preventDefault();
                    setShowEmojiBar((prev) => !prev);
                }
                if (e.key.toLowerCase() === 'k') {
                    e.preventDefault();
                    setShowQuickReplies((prev) => !prev);
                }
                if (e.key.toLowerCase() === 't') {
                    e.preventDefault();
                    setShowTemplates((prev) => !prev);
                }
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [mobileDrawerOpen, handleSend]);

    useEffect(() => {
        if (typeof document === 'undefined') return;
        const onVisibility = () => setIsTabVisible(!document.hidden);
        document.addEventListener('visibilitychange', onVisibility);
        return () => document.removeEventListener('visibilitychange', onVisibility);
    }, []);

    const getStatusIcon = (message: Message) => {
        if (message.direction === 'inbound') return null;

        switch (message.status) {
            case 'accepted':
            case 'sent':
                return <Check className="h-3.5 w-3.5 text-gray-400" />;
            case 'delivered':
                return <CheckCheck className="h-3.5 w-3.5 text-gray-400" />;
            case 'read':
                return <CheckCheck className="h-3.5 w-3.5 text-blue-500" />;
            case 'failed':
                return <span className="text-xs text-red-500 font-medium">Failed</span>;
            default:
                return <Clock className="h-3.5 w-3.5 text-gray-400" />;
        }
    };

    const getStatusLabel = (message: Message): string | null => {
        if (message.direction === 'inbound') return null;

        switch (message.status) {
            case 'queued':
                return 'Queued';
            case 'processing':
                return 'Processing';
            case 'accepted':
                return 'Accepted';
            case 'sent':
                return 'Sent';
            case 'delivered':
                return 'Delivered';
            case 'read':
                return 'Read';
            case 'failed':
                return 'Failed';
            default:
                return null;
        }
    };

    const getStatusBadgeClassName = (message: Message): string => {
        if (message.status === 'read') return 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300';
        if (message.status === 'delivered') return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300';
        if (message.status === 'accepted') return 'bg-sky-100 text-sky-700 dark:bg-sky-900/40 dark:text-sky-300';
        if (message.status === 'sent') return 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300';
        if (message.status === 'failed') return 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300';
        return 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300';
    };

    const getMessageDiagnosticError = (message: Message): string | null => {
        const payload = message.payload ?? {};
        const payloadError = payload?.error?.message
            || payload?.errors?.[0]?.message
            || payload?.errors?.[0]?.title
            || payload?.errors?.[0]?.details
            || null;

        return message.error_message || payloadError || null;
    };

    const formatDiagnosticTime = (value?: string | null): string => {
        if (!value) return '-';
        const parsed = new Date(value);
        if (Number.isNaN(parsed.getTime())) return '-';
        return parsed.toLocaleString();
    };

    const downloadMessageDiagnosticsBundle = (message: Message) => {
        const query = new URLSearchParams({
            conversation_id: String(conversation.id),
            message_id: String(message.id),
            scope: `message:${message.id}`,
        });
        if (message.meta_message_id) {
            query.set('meta_message_id', message.meta_message_id);
        }
        window.location.href = `${route('app.alerts.bundle')}?${query.toString()}`;
    };

    const getDeliveryLatencyLabel = (message: Message): string | null => {
        if (message.direction !== 'outbound' || !message.sent_at) return null;

        const sentTs = new Date(message.sent_at).getTime();
        const deliveredTs = message.delivered_at ? new Date(message.delivered_at).getTime() : null;
        const readTs = message.read_at ? new Date(message.read_at).getTime() : null;
        const targetTs = readTs ?? deliveredTs;
        if (!targetTs || Number.isNaN(sentTs) || Number.isNaN(targetTs) || targetTs < sentTs) {
            return null;
        }

        const seconds = Math.max(0, Math.round((targetTs - sentTs) / 1000));
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        const duration = mins > 0 ? `${mins}m ${secs}s` : `${secs}s`;

        return readTs ? `Read in ${duration}` : `Delivered in ${duration}`;
    };

    const renderMessageBody = (message: Message) => {
        const payload = message.payload || {};

        if (message.type === 'image' && payload.link) {
            return (
                <div className="space-y-2">
                    <img
                        src={payload.link}
                        alt="Image attachment"
                        className="max-h-48 rounded-lg border border-gray-200 object-cover"
                    />
                    {message.text_body && <p className="text-sm whitespace-pre-wrap break-words">{message.text_body}</p>}
                </div>
            );
        }

        if (message.type === 'video' && payload.link) {
            return (
                <div className="space-y-2">
                    <video controls className="max-h-48 rounded-lg border border-gray-200 w-full">
                        <source src={payload.link} />
                    </video>
                    {message.text_body && <p className="text-sm whitespace-pre-wrap break-words">{message.text_body}</p>}
                </div>
            );
        }

        if (message.type === 'document' && payload.link) {
            return (
                <div className="space-y-2">
                    <a
                        href={payload.link}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-2 text-sm font-semibold text-emerald-700 hover:text-emerald-800"
                    >
                        <FileText className="h-4 w-4" />
                        {payload.filename || 'Document'}
                    </a>
                    {message.text_body && <p className="text-sm whitespace-pre-wrap break-words">{message.text_body}</p>}
                </div>
            );
        }

        if (message.type === 'location' && payload.latitude && payload.longitude) {
            const mapUrl = `https://maps.google.com/?q=${payload.latitude},${payload.longitude}`;
            return (
                <div className="space-y-1">
                    <a
                        href={mapUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-2 text-sm font-semibold text-emerald-700 hover:text-emerald-800"
                    >
                        <MapPin className="h-4 w-4" />
                        View location
                    </a>
                    {payload.name && <p className="text-sm text-gray-700">{payload.name}</p>}
                    {payload.address && <p className="text-xs text-gray-500">{payload.address}</p>}
                </div>
            );
        }

        return message.text_body ? (
            <p className="text-sm whitespace-pre-wrap break-words leading-relaxed">{message.text_body}</p>
        ) : null;
    };

    const hasComposerPanels =
        showComposerTools || showLocation || showQuickReplies || showTemplates || showLists || showButtons;

    const content = (
        <>
            <Head title={`${conversation.contact.name || conversation.contact.wa_id} - Inbox`} />
            <div
                className={cn(
                    'flex flex-col overflow-hidden border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900',
                    isEmbedded ? 'h-full rounded-none border-0 shadow-none' : 'h-[calc(100vh-8rem)] rounded-3xl shadow-xl lg:h-[calc(100vh-6rem)]'
                )}
            >
                {/* Header */}
                <div className="sticky top-0 z-20 flex flex-shrink-0 flex-col gap-3 border-b border-[#054c44] bg-[#075E54] px-4 py-3 text-white shadow-sm sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center gap-3 min-w-0 w-full">
                        {!isEmbedded && (
                            <Link
                                href={route('app.whatsapp.conversations.index', { })}
                                className="inline-flex items-center text-sm font-medium text-white/90 hover:text-white transition-colors"
                                aria-label="Back to conversations"
                            >
                                <ArrowLeft className="h-4 w-4 mr-1" />
                                <span className="hidden sm:inline">Back</span>
                            </Link>
                        )}
                        <div className="h-10 w-10 rounded-full bg-[#25D366] flex items-center justify-center text-white font-bold text-lg shadow-lg flex-shrink-0">
                            {conversation.contact.name?.charAt(0).toUpperCase() || conversation.contact.wa_id.charAt(0)}
                        </div>
                        <div className="min-w-0">
                            <h1 className="text-base sm:text-lg font-semibold truncate">
                                {conversation.contact.name || conversation.contact.wa_id}
                            </h1>
                            <div className="flex flex-wrap items-center gap-2 text-xs text-white/80">
                                <Phone className="h-3 w-3" />
                                <span className="truncate">{conversation.contact.wa_id}</span>
                                <span className="text-white/60">•</span>
                                <span className="truncate">{conversation.connection.name}</span>
                                {!connected && (
                                    <>
                                        <span className="text-white/60">•</span>
                                        <span className="inline-flex items-center gap-1">
                                            <WifiOff className="h-3 w-3 text-amber-200" />
                                            Polling
                                        </span>
                                    </>
                                )}
                                {connected && (
                                    <span className="inline-flex items-center gap-1">
                                        <Wifi className="h-3 w-3 text-green-200" />
                                        Live
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center gap-2 self-end sm:self-auto">
                        <span className="hidden sm:inline-flex rounded-full bg-white/15 px-3 py-1 text-xs uppercase tracking-wide">
                            {conversation.status}
                        </span>
                        <span
                            className={cn(
                                'hidden sm:inline-flex rounded-full px-3 py-1 text-xs uppercase tracking-wide',
                                isCustomerCareWindowOpen
                                    ? 'bg-emerald-500/20 text-emerald-100'
                                    : 'bg-amber-500/20 text-amber-100'
                            )}
                        >
                            {customerCareWindowStatusText}
                        </span>
                        <button
                            onClick={() => setMobileDrawerOpen(!mobileDrawerOpen)}
                            className="lg:hidden p-2 rounded-lg text-white/90 hover:bg-white/10 transition-colors"
                            aria-label="Toggle menu"
                        >
                            {mobileDrawerOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                        </button>
                    </div>
                </div>

                {/* Mobile drawer */}
                {mobileDrawerOpen && (
                    <>
                        <div
                            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
                            onClick={() => setMobileDrawerOpen(false)}
                            aria-hidden="true"
                        />
                        <div className="fixed right-0 top-0 h-full w-full max-w-sm bg-white dark:bg-gray-900 shadow-2xl z-50 lg:hidden p-6 border-l border-gray-200 dark:border-gray-800">
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">Conversation Info</h3>
                                <button
                                    onClick={() => setMobileDrawerOpen(false)}
                                    className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
                                    aria-label="Close conversation info"
                                >
                                    <X className="h-5 w-5" aria-hidden />
                                </button>
                            </div>
                            <div className="space-y-6">
                                <div className="p-4 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 rounded-xl border border-gray-200 dark:border-gray-700">
                                    <div className="flex items-center gap-3 mb-4">
                                        <div className="h-12 w-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-lg shadow-lg">
                                            {conversation.contact.name?.charAt(0).toUpperCase() || conversation.contact.wa_id.charAt(0)}
                                        </div>
                                        <div>
                                            <p className="font-semibold text-gray-900 dark:text-gray-100">{conversation.contact.name || 'Unknown'}</p>
                                            <p className="text-sm text-gray-500 dark:text-gray-400">{conversation.contact.wa_id}</p>
                                        </div>
                                    </div>
                                </div>
                                <div className="space-y-4">
                                    <div>
                                        <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Connection</p>
                                        <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{conversation.connection.name}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Status</p>
                                        <Badge variant={conversation.status === 'open' ? 'success' : 'default'} className="px-3 py-1">
                                            {conversation.status}
                                        </Badge>
                                    </div>
                                    <div>
                                        <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">24h Window</p>
                                        <Badge variant={isCustomerCareWindowOpen ? 'success' : 'warning'} className="px-3 py-1">
                                            {customerCareWindowStatusText}
                                        </Badge>
                                        <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">{customerCareWindowHelperText}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </>
                )}

                <div className="flex flex-1 min-h-0 overflow-hidden">
                {/* Messages */}
                <div
                    ref={messagesContainerRef}
                    className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden px-4 py-6 space-y-4 bg-[#efeae2] dark:bg-gray-950 focus:outline-none"
                    style={{
                        backgroundImage:
                            'radial-gradient(rgba(0,0,0,0.04) 1px, transparent 1px)',
                        backgroundSize: '16px 16px'}}
                    tabIndex={0}
                >
                        {streamSyncError && (
                            <div className="sticky top-0 z-10 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-900 shadow-sm dark:border-amber-700/50 dark:bg-amber-500/10 dark:text-amber-100">
                                <div className="flex items-center justify-between gap-2">
                                    <span>{streamSyncError}</span>
                                    <Button type="button" variant="secondary" size="sm" onClick={recoverHistory}>
                                        Retry now
                                    </Button>
                                </div>
                            </div>
                        )}
                        {loading ? (
                            <>
                                {[...Array(3)].map((_, i) => (
                                    <MessageSkeleton key={i} />
                                ))}
                            </>
                        ) : messages.length === 0 ? (
                            <div className="text-center py-16">
                                <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-white/80 dark:bg-gray-900 mb-4 shadow-sm">
                                    <Send className="h-8 w-8 text-gray-400" />
                                </div>
                                <p className="text-gray-500 dark:text-gray-400 font-medium mb-1">
                                    {initialSyncPending ? 'Syncing conversation...' : 'No messages yet'}
                                </p>
                                <p className="text-sm text-gray-400 dark:text-gray-500">
                                    {initialTotalMessages > 0
                                        ? initialSyncPending
                                            ? 'Loading history in the background.'
                                            : 'History did not load yet.'
                                        : 'Start the conversation!'}
                                </p>
                                {initialTotalMessages > 0 && !initialSyncPending && (
                                    <div className="mt-3">
                                        <Button type="button" variant="secondary" onClick={recoverHistory}>
                                            Retry Loading History
                                        </Button>
                                    </div>
                                )}
                            </div>
                        ) : (
                            messages.map((message, index) => {
                                const showDateSeparator = index === 0 || 
                                    new Date(message.created_at).toDateString() !== 
                                    new Date(messages[index - 1].created_at).toDateString();
                                
                                return (
                                    <div key={message.id}>
                                        {showDateSeparator && (
                                            <div className="flex items-center justify-center my-4">
                                                <div className="px-3 py-1 bg-gray-100 dark:bg-gray-800 rounded-full text-xs font-medium text-gray-600 dark:text-gray-400">
                                                    {new Date(message.created_at).toLocaleDateString('en-US', { 
                                                        weekday: 'long', 
                                                        year: 'numeric', 
                                                        month: 'long', 
                                                        day: 'numeric' 
                                                    })}
                                                </div>
                                            </div>
                                        )}
                                        <div className={cn('flex', message.direction === 'outbound' ? 'justify-end' : 'justify-start')}>
                                            <div
                                                className={cn(
                                                    'max-w-xs lg:max-w-md px-4 py-2.5 rounded-2xl shadow-sm',
                                                    message.direction === 'outbound'
                                                        ? 'bg-[#d9fdd3] text-gray-900 rounded-tr-md'
                                                        : 'bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border border-gray-200 dark:border-gray-700 rounded-tl-md'
                                                )}
                                            >
                                                {renderMessageBody(message)}
                                                <div className="flex items-center justify-end gap-1.5 mt-2">
                                                    {message.direction === 'outbound' && getStatusLabel(message) && (
                                                        <button
                                                            type="button"
                                                            onClick={() => supportAccess && setDiagnosticMessage(message)}
                                                            className={cn(
                                                                'inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold transition hover:opacity-90',
                                                                getStatusBadgeClassName(message)
                                                            )}
                                                            title={supportAccess ? 'Open delivery details' : 'Message status'}
                                                        >
                                                            <Info className="h-3 w-3" />
                                                            {getStatusLabel(message)}
                                                        </button>
                                                    )}
                                                    {message.direction === 'outbound' && getDeliveryLatencyLabel(message) && (
                                                        <span className="text-[11px] text-gray-400 dark:text-gray-500">
                                                            {getDeliveryLatencyLabel(message)}
                                                        </span>
                                                    )}
                                                    {supportAccess && message.direction === 'outbound' && message.status === 'failed' && getMessageDiagnosticError(message) && (
                                                        <button
                                                            type="button"
                                                            onClick={() => supportAccess && setDiagnosticMessage(message)}
                                                            className="text-[11px] font-medium text-red-600 underline decoration-dotted underline-offset-2 dark:text-red-400"
                                                        >
                                                            View error
                                                        </button>
                                                    )}
                                                    <span className={cn(
                                                        'text-[11px]',
                                                        message.direction === 'outbound' ? 'text-gray-600' : 'text-gray-500 dark:text-gray-400'
                                                    )}>
                                                        {new Date(message.created_at).toLocaleTimeString([], {
                                                            hour: '2-digit',
                                                            minute: '2-digit'})}
                                                    </span>
                                                    {getStatusIcon(message)}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })
                        )}
                        <div ref={messagesEndRef} />
                </div>

                {/* Right panel */}
                <aside className="hidden lg:flex lg:w-80 xl:w-96 flex-col border-l border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 overflow-y-auto">
                    <div className="p-5 border-b border-gray-200 dark:border-gray-800">
                        <div className="flex items-center gap-3">
                            <div className="h-11 w-11 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-base">
                                {conversation.contact.name?.charAt(0).toUpperCase() || conversation.contact.wa_id.charAt(0)}
                            </div>
                            <div>
                                <p className="font-semibold text-gray-900 dark:text-gray-100">{conversation.contact.name || 'Unknown'}</p>
                                <p className="text-sm text-gray-500 dark:text-gray-400">{conversation.contact.wa_id}</p>
                            </div>
                        </div>
                        <div className="mt-4 space-y-2 text-sm text-gray-600 dark:text-gray-300">
                            <div className="flex items-center justify-between">
                                <span className="text-xs font-semibold uppercase tracking-wider text-gray-500">Number</span>
                                <span className="font-medium">{conversation.connection.name}</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-xs font-semibold uppercase tracking-wider text-gray-500">Status</span>
                                <Badge variant={conversation.status === 'open' ? 'success' : 'default'} className="px-3 py-1">
                                    {conversation.status}
                                </Badge>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-xs font-semibold uppercase tracking-wider text-gray-500">24h Window</span>
                                <Badge variant={isCustomerCareWindowOpen ? 'success' : 'warning'} className="px-3 py-1">
                                    {customerCareWindowStatusText}
                                </Badge>
                            </div>
                            <p className="text-xs text-gray-500 dark:text-gray-400">{customerCareWindowHelperText}</p>
                        </div>
                    </div>

                    <div className="p-5 border-b border-gray-200 dark:border-gray-800">
                        <button
                            type="button"
                            onClick={() => setShowConversationSettings((value) => !value)}
                            className="flex w-full items-center justify-between text-left"
                        >
                            <div className="flex items-center gap-2">
                                <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">Chat settings</h3>
                                {metaUpdating && <span className="text-xs text-gray-400">Saving…</span>}
                            </div>
                            <span className="text-xs text-gray-500 dark:text-gray-400">{showConversationSettings ? 'Hide' : 'Show'}</span>
                        </button>
                        {showConversationSettings && (
                        <div className="mt-4 space-y-4 text-sm">
                            <div className="space-y-2">
                                <span className="text-xs font-semibold uppercase tracking-wider text-gray-500">Assignee</span>
                                <select
                                    value={(pendingAssignedTo !== undefined ? pendingAssignedTo : conversation.assigned_to) ?? ''}
                                    onChange={(e) => {
                                        const value = e.target.value ? Number(e.target.value) : null;
                                        updateConversationMeta({ assigned_to: value });
                                    }}
                                    disabled={metaUpdating}
                                    className="mt-1 block w-full rounded-xl border-gray-200 bg-white px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-800"
                                >
                                    <option value="">Unassigned</option>
                                    {normalizedAgents.map((agent) => (
                                        <option key={agent.id} value={agent.id}>
                                            {agent.name} ({agent.role})
                                        </option>
                                    ))}
                                </select>
                                {(pendingAssignedTo !== undefined ? pendingAssignedTo : conversation.assigned_to) && (
                                    <div className="text-xs text-gray-500 dark:text-gray-400">
                                        Assigned to {agentMap.get((pendingAssignedTo !== undefined ? pendingAssignedTo : conversation.assigned_to) as number)?.name || 'Unknown'}
                                    </div>
                                )}
                                {currentUserId && (pendingAssignedTo !== undefined ? pendingAssignedTo : conversation.assigned_to) !== currentUserId && normalizedAgents.some((a) => a.id === currentUserId) && (
                                    <button
                                        type="button"
                                        onClick={() => updateConversationMeta({ assigned_to: currentUserId })}
                                        disabled={metaUpdating}
                                        className="mt-2 text-xs font-medium text-[#25D366] hover:text-[#20BD5A] dark:text-[#34C759] disabled:opacity-50"
                                    >
                                        Assign to me
                                    </button>
                                )}
                            </div>

                            <div className="space-y-2">
                                <span className="text-xs font-semibold uppercase tracking-wider text-gray-500">Priority</span>
                                <select
                                    value={conversation.priority ?? ''}
                                    onChange={(e) => {
                                        const value = e.target.value || null;
                                        updateConversationMeta({ priority: value });
                                    }}
                                    disabled={metaUpdating}
                                    className="mt-1 block w-full rounded-xl border-gray-200 bg-white px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-800"
                                >
                                    <option value="">Not set</option>
                                    <option value="low">Low</option>
                                    <option value="normal">Normal</option>
                                    <option value="high">High</option>
                                    <option value="urgent">Urgent</option>
                                </select>
                            </div>

                            <div className="space-y-2">
                                <span className="text-xs font-semibold uppercase tracking-wider text-gray-500">Status</span>
                                <select
                                    value={conversation.status}
                                    onChange={(e) => updateConversationMeta({ status: e.target.value })}
                                    disabled={metaUpdating}
                                    className="mt-1 block w-full rounded-xl border-gray-200 bg-white px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-800"
                                >
                                    <option value="open">Open</option>
                                    <option value="closed">Closed</option>
                                </select>
                            </div>

                            <div className="rounded-xl border border-gray-200 bg-gray-50 p-3 text-xs text-gray-600 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300">
                                <div className="font-semibold text-gray-700 dark:text-gray-200">Auto-assign</div>
                                <div className="mt-1">
                                    {inboxSettings?.auto_assign_enabled
                                        ? `Enabled (${inboxSettings.auto_assign_strategy.replace('_', ' ')})`
                                        : 'Disabled'}
                                </div>
                                <Link
                                    href={route('app.settings', {})}
                                    className="mt-2 inline-flex text-xs font-semibold text-blue-600 hover:text-blue-700 dark:text-blue-400"
                                >
                                    Manage inbox settings
                                </Link>
                            </div>
                        </div>
                        )}
                    </div>

                    <div className="p-5 border-b border-gray-200 dark:border-gray-800">
                        <button
                            type="button"
                            onClick={() => setShowInternalNotes((value) => !value)}
                            className="flex w-full items-center justify-between text-left"
                        >
                            <div className="flex items-center gap-2">
                                <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">Internal notes</h3>
                                <span className="text-xs text-gray-500">{notes.length}</span>
                            </div>
                            <span className="text-xs text-gray-500 dark:text-gray-400">{showInternalNotes ? 'Hide' : 'Show'}</span>
                        </button>
                        {showInternalNotes && (
                        <>
                        <div className="mt-4 space-y-3">
                            <Textarea
                                value={noteDraft}
                                onChange={(e) => setNoteDraft(e.target.value)}
                                placeholder="Add a private note..."
                                className="min-h-[80px] rounded-xl"
                            />
                            <Button type="button" onClick={submitNote} className="w-full bg-[#25D366] hover:bg-[#1DAA57] text-white">
                                Add Note
                            </Button>
                        </div>
                        <div className="mt-4 space-y-3">
                            {notes.length === 0 && (
                                <div className="text-xs text-gray-500 dark:text-gray-400">No notes yet.</div>
                            )}
                            {notes.map((note) => (
                                <div key={note.id} className="rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 p-3">
                                    <p className="text-sm text-gray-700 dark:text-gray-200 whitespace-pre-wrap">{note.note}</p>
                                    <div className="mt-2 text-[11px] text-gray-500 dark:text-gray-400">
                                        {note.created_by?.name || 'System'} • {new Date(note.created_at).toLocaleString()}
                                    </div>
                                </div>
                            ))}
                        </div>
                        </>
                        )}
                    </div>

                    <div className="p-6">
                        <div className="flex items-center justify-between mb-3">
                            <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">Audit Events</h3>
                            <span className="text-xs text-gray-500">{auditEvents.length}</span>
                        </div>
                        <div className="space-y-3">
                            {auditEvents.length === 0 && (
                                <div className="text-xs text-gray-500 dark:text-gray-400">No audit events yet.</div>
                            )}
                            {auditEvents.map((event) => {
                                const eventMeta = getAuditEventMeta(event);

                                return (
                                    <div key={event.id} className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-3">
                                        <div className={cn('text-xs font-semibold uppercase tracking-wider', eventMeta.tone)}>
                                            {eventMeta.label}
                                        </div>
                                        {eventMeta.description && (
                                            <p className="mt-1 text-sm text-gray-700 dark:text-gray-200">
                                                {eventMeta.description}
                                            </p>
                                        )}
                                        <div className="mt-2 text-[11px] text-gray-500 dark:text-gray-400">
                                            {event.actor?.name || 'System'} • {new Date(event.created_at).toLocaleString()}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </aside>
                </div>

                {/* Composer - sticky on mobile so it stays visible when keyboard or panels open */}
                <div className="sticky bottom-0 z-20 flex-shrink-0 border-t border-gray-200 bg-[#f0f2f5] p-3 shadow-[0_-8px_24px_rgba(17,27,33,0.08)] dark:border-gray-800 dark:bg-gray-900">
                    <div className="space-y-3">
                        <div className="relative">
                            <div className="flex items-center gap-2 overflow-x-auto whitespace-nowrap pb-1 -mx-1 px-1">
                            <button
                                type="button"
                                onClick={() => setShowEmojiBar((prev) => !prev)}
                                className="shrink-0 inline-flex items-center gap-2 rounded-full border border-gray-200 bg-white px-3 py-1.5 text-xs font-semibold text-gray-600 shadow-sm hover:bg-gray-100 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300"
                            >
                                <Smile className="h-3.5 w-3.5" />
                                Emoji
                            </button>
                            <button
                                type="button"
                                onClick={() => fileInputRef.current?.click()}
                                disabled={!isCustomerCareWindowOpen}
                                className="shrink-0 inline-flex items-center gap-2 rounded-full border border-gray-200 bg-white px-3 py-1.5 text-xs font-semibold text-gray-600 shadow-sm hover:bg-gray-100 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300"
                            >
                                <Paperclip className="h-3.5 w-3.5" />
                                Add file
                            </button>
                            <button
                                type="button"
                                data-template-section
                                onClick={() => setShowTemplates((prev) => !prev)}
                                className="shrink-0 inline-flex items-center gap-2 rounded-full border border-gray-200 bg-white px-3 py-1.5 text-xs font-semibold text-gray-600 shadow-sm hover:bg-gray-100 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300"
                                aria-label="Send template message"
                            >
                                <FileText className="h-3.5 w-3.5" />
                                Template
                            </button>
                            <button
                                type="button"
                                onClick={() => setShowComposerTools((prev) => !prev)}
                                disabled={!isCustomerCareWindowOpen}
                                className="shrink-0 inline-flex items-center gap-2 rounded-full border border-gray-200 bg-white px-3 py-1.5 text-xs font-semibold text-gray-600 shadow-sm hover:bg-gray-100 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300"
                            >
                                <Plus className="h-3.5 w-3.5" />
                                More ways to reply
                            </button>
                            <input
                                ref={fileInputRef}
                                type="file"
                                multiple
                                accept="image/*,video/*,application/pdf"
                                className="hidden"
                                onChange={handleAttachmentChange}
                            />
                            </div>
                            {showEmojiBar && (
                                <div className="absolute bottom-full left-0 mb-3 z-20 flex flex-wrap items-center gap-2 rounded-2xl border border-gray-200 bg-white/95 p-3 text-lg shadow-lg dark:border-gray-700 dark:bg-gray-800">
                                    <div className="w-full">
                                        <TextInput
                                            value={emojiSearch}
                                            onChange={(e) => setEmojiSearch(e.target.value)}
                                            placeholder="Search emojis"
                                            className="rounded-xl text-sm"
                                        />
                                    </div>
                                    {recentEmojis.length > 0 && (
                                        <div className="w-full">
                                            <div className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-gray-500">Recent</div>
                                            <div className="flex flex-wrap gap-2">
                                                {recentEmojis.map((emoji) => (
                                                    <button
                                                        key={`recent-${emoji}`}
                                                        type="button"
                                                        onClick={() => handleEmojiSelect(emoji)}
                                                        className="rounded-lg px-2 py-1 hover:bg-gray-100 dark:hover:bg-gray-700"
                                                    >
                                                        {emoji}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                    {(emojiSearch.trim()
                                        ? emojiList.filter((emoji) => emoji.includes(emojiSearch.trim()))
                                        : emojiList
                                    ).map((emoji) => (
                                        <button
                                            key={emoji}
                                            type="button"
                                            onClick={() => handleEmojiSelect(emoji)}
                                            className="rounded-lg px-2 py-1 hover:bg-gray-100 dark:hover:bg-gray-700"
                                        >
                                            {emoji}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>

                        {hasComposerPanels && (
                            <div className="absolute bottom-full left-0 right-0 z-20 mb-3 px-3">
                                <div className="max-h-[min(32rem,calc(100vh-15rem))] overflow-y-auto rounded-2xl pr-1">
                                    <div className="space-y-3">
                        {showComposerTools && (
                            <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-800">
                                <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-4">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setShowLocation((prev) => !prev);
                                            setShowLists(false);
                                            setShowButtons(false);
                                            setShowQuickReplies(false);
                                        }}
                                        className="rounded-xl border border-gray-200 px-3 py-3 text-left text-sm text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-200 dark:hover:bg-gray-700"
                                    >
                                        <div className="flex items-center gap-2 font-medium"><MapPin className="h-4 w-4" /> Location</div>
                                        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">Send a place pin.</p>
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setShowLists((prev) => !prev);
                                            setShowButtons(false);
                                            setShowLocation(false);
                                            setShowQuickReplies(false);
                                        }}
                                        className="rounded-xl border border-gray-200 px-3 py-3 text-left text-sm text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-200 dark:hover:bg-gray-700"
                                    >
                                        <div className="flex items-center gap-2 font-medium"><List className="h-4 w-4" /> Lists</div>
                                        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">Share a saved options list.</p>
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setShowButtons((prev) => !prev);
                                            setShowLists(false);
                                            setShowLocation(false);
                                            setShowQuickReplies(false);
                                        }}
                                        className="rounded-xl border border-gray-200 px-3 py-3 text-left text-sm text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-200 dark:hover:bg-gray-700"
                                    >
                                        <div className="flex items-center gap-2 font-medium"><Square className="h-4 w-4" /> Buttons</div>
                                        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">Offer quick tap choices.</p>
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setShowQuickReplies((prev) => !prev);
                                            setShowLists(false);
                                            setShowButtons(false);
                                            setShowLocation(false);
                                        }}
                                        className="rounded-xl border border-gray-200 px-3 py-3 text-left text-sm text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-200 dark:hover:bg-gray-700"
                                    >
                                        <div className="flex items-center gap-2 font-medium"><Zap className="h-4 w-4" /> Quick replies</div>
                                        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">Insert a saved reply.</p>
                                    </button>
                                </div>
                            </div>
                        )}

                        {showLocation && (
                            <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-800">
                                <div className="grid gap-3 sm:grid-cols-3">
                                    <TextInput
                                        value={locationInput.label}
                                        onChange={(e) => setLocationInput((prev) => ({ ...prev, label: e.target.value }))}
                                        placeholder="Label (optional)"
                                        disabled={locationSending || !isCustomerCareWindowOpen}
                                        className="rounded-xl"
                                    />
                                    <TextInput
                                        value={locationInput.lat}
                                        onChange={(e) => setLocationInput((prev) => ({ ...prev, lat: e.target.value }))}
                                        placeholder="Latitude"
                                        disabled={locationSending || !isCustomerCareWindowOpen}
                                        className="rounded-xl"
                                    />
                                    <TextInput
                                        value={locationInput.lng}
                                        onChange={(e) => setLocationInput((prev) => ({ ...prev, lng: e.target.value }))}
                                        placeholder="Longitude"
                                        disabled={locationSending || !isCustomerCareWindowOpen}
                                        className="rounded-xl"
                                    />
                                </div>
                                <div className="mt-3 flex justify-end gap-2">
                                    <Button type="button" variant="secondary" onClick={() => setShowLocation(false)} disabled={locationSending}>
                                        Cancel
                                    </Button>
                                    <Button type="button" onClick={sendLocation} disabled={locationSending || !isCustomerCareWindowOpen} className="bg-[#25D366] hover:bg-[#1DAA57] text-white">
                                        {locationSending ? 'Sending...' : 'Send Location'}
                                    </Button>
                                </div>
                            </div>
                        )}

                        {showQuickReplies && (
                            <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-800">
                                <div className="grid gap-2">
                                    {quickReplies.map((reply) => (
                                        <button
                                            key={reply.id}
                                            type="button"
                                            onClick={() => {
                                                insertMessage(reply.text);
                                                setShowQuickReplies(false);
                                            }}
                                            className="w-full rounded-xl border border-gray-200 px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-200 dark:hover:bg-gray-700"
                                        >
                                            <p className="font-semibold">{reply.label}</p>
                                            <p className="text-xs text-gray-500 dark:text-gray-400">{reply.text}</p>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {showTemplates && (
                            <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-800" data-template-section>
                                <div className="grid gap-3">
                                    {availableTemplates.length === 0 && (
                                        <div className="text-sm text-gray-500 dark:text-gray-400">
                                            No ready templates found for this number yet.
                                        </div>
                                    )}
                                    {availableTemplates.map((template) => (
                                        <button
                                            key={template.id}
                                            type="button"
                                            onClick={() => {
                                                setSelectedTemplate(template);
                                                setTemplateVariables(
                                                    Array.from({ length: template.variable_count || 0 }, () => '')
                                                );
                                            }}
                                            className={cn(
                                                'w-full rounded-xl border px-3 py-2 text-left text-sm hover:bg-gray-50 dark:hover:bg-gray-700',
                                                selectedTemplate?.id === template.id
                                                    ? 'border-emerald-400 bg-emerald-50/70 text-emerald-900 dark:border-emerald-500/70 dark:bg-emerald-500/10 dark:text-emerald-100'
                                                    : 'border-gray-200 text-gray-700 dark:border-gray-700 dark:text-gray-200'
                                            )}
                                        >
                                            <p className="font-semibold">{template.name}</p>
                                            <p className="text-xs text-gray-500 dark:text-gray-400">
                                                {template.body_text || 'Template message'}
                                            </p>
                                        </button>
                                    ))}
                                </div>

                                {selectedTemplate && (
                                    <div className="mt-4 rounded-xl border border-gray-200 bg-gray-50 p-3 dark:border-gray-700 dark:bg-gray-900">
                                        <div className="mb-3 text-sm font-semibold text-gray-700 dark:text-gray-200">
                                            Fill template variables
                                        </div>
                                        {['IMAGE', 'VIDEO', 'DOCUMENT'].includes((selectedTemplate.header_type || '').toUpperCase()) && selectedTemplate.header_media_status && (
                                            <div
                                                className={cn(
                                                    'mb-3 rounded-lg border px-3 py-2 text-xs',
                                                    selectedTemplate.header_media_status.state === 'ready'
                                                        ? 'border-emerald-200 bg-emerald-50 text-emerald-900 dark:border-emerald-700/40 dark:bg-emerald-500/10 dark:text-emerald-200'
                                                        : 'border-amber-200 bg-amber-50 text-amber-900 dark:border-amber-700/40 dark:bg-amber-500/10 dark:text-amber-200'
                                                )}
                                            >
                                                <div className="font-semibold">{selectedTemplate.header_media_status.label}</div>
                                                {selectedTemplate.header_media_status.description && (
                                                    <div className="mt-1">{selectedTemplate.header_media_status.description}</div>
                                                )}
                                            </div>
                                        )}
                                        {templateVariables.length === 0 && (
                                            <div className="text-xs text-gray-500 dark:text-gray-400">
                                                This template has no variables.
                                            </div>
                                        )}
                                        <div className="grid gap-4">
                                            {selectedTemplate.header_count > 0 && (
                                                <div className="grid gap-2">
                                                    <div className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                                                        Header variables
                                                    </div>
                                                    {templateVariables
                                                        .slice(0, selectedTemplate.header_count)
                                                        .map((value, index) => (
                                                            <TextInput
                                                                key={`${selectedTemplate.id}-header-${index}`}
                                                                value={value}
                                                                onChange={(e) => {
                                                                    const next = [...templateVariables];
                                                                    next[index] = e.target.value;
                                                                    setTemplateVariables(next);
                                                                }}
                                                                placeholder={`Header variable ${index + 1}`}
                                                                className="rounded-xl"
                                                            />
                                                        ))}
                                                </div>
                                            )}
                                            {selectedTemplate.body_count > 0 && (
                                                <div className="grid gap-2">
                                                    <div className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                                                        Body variables
                                                    </div>
                                                    {templateVariables
                                                        .slice(
                                                            selectedTemplate.header_count,
                                                            selectedTemplate.header_count + selectedTemplate.body_count
                                                        )
                                                        .map((value, index) => (
                                                            <TextInput
                                                                key={`${selectedTemplate.id}-body-${index}`}
                                                                value={value}
                                                                onChange={(e) => {
                                                                    const next = [...templateVariables];
                                                                    next[selectedTemplate.header_count + index] = e.target.value;
                                                                    setTemplateVariables(next);
                                                                }}
                                                                placeholder={`Body variable ${index + 1}`}
                                                                className="rounded-xl"
                                                            />
                                                        ))}
                                                </div>
                                            )}
                                            {selectedTemplate.button_count > 0 && (
                                                <div className="grid gap-2">
                                                    <div className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                                                        Button variables
                                                    </div>
                                                    {templateVariables
                                                        .slice(
                                                            selectedTemplate.header_count + selectedTemplate.body_count,
                                                            selectedTemplate.variable_count
                                                        )
                                                        .map((value, index) => (
                                                            <TextInput
                                                                key={`${selectedTemplate.id}-button-${index}`}
                                                                value={value}
                                                                onChange={(e) => {
                                                                    const next = [...templateVariables];
                                                                    next[
                                                                        selectedTemplate.header_count +
                                                                            selectedTemplate.body_count +
                                                                            index
                                                                    ] = e.target.value;
                                                                    setTemplateVariables(next);
                                                                }}
                                                                placeholder={`Button variable ${index + 1}`}
                                                                className="rounded-xl"
                                                            />
                                                        ))}
                                                </div>
                                            )}
                                        </div>
                                        <div className="mt-3 flex justify-end gap-2">
                                            <Button
                                                type="button"
                                                variant="secondary"
                                                onClick={() => {
                                                    setSelectedTemplate(null);
                                                    setTemplateVariables([]);
                                                }}
                                            >
                                                Clear
                                            </Button>
                                            <Button
                                                type="button"
                                                onClick={sendTemplate}
                                                disabled={templateSending}
                                                className="bg-[#25D366] hover:bg-[#1DAA57] text-white"
                                            >
                                                {templateSending ? 'Sending...' : 'Send Template'}
                                            </Button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        {showLists && (
                            <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-800">
                                <div className="grid gap-3">
                                    {normalizedLists.length === 0 && (
                                        <div className="text-sm text-gray-500 dark:text-gray-400">
                                            No lists available.{' '}
                                            <Link
                                                href={route('app.whatsapp.lists.index')}
                                                className="font-medium text-emerald-600 hover:text-emerald-500 dark:text-emerald-400 dark:hover:text-emerald-300"
                                            >
                                                Create lists in the Lists section
                                            </Link>
                                            .
                                        </div>
                                    )}
                                    {normalizedLists.map((list) => (
                                        <button
                                            key={list.id}
                                            type="button"
                                            onClick={() => setSelectedList(list)}
                                            disabled={listSending}
                                            className={cn(
                                                'w-full rounded-xl border px-3 py-2 text-left text-sm hover:bg-gray-50 dark:hover:bg-gray-700',
                                                selectedList?.id === list.id
                                                    ? 'border-emerald-400 bg-emerald-50/70 text-emerald-900 dark:border-emerald-500/70 dark:bg-emerald-500/10 dark:text-emerald-100'
                                                    : 'border-gray-200 text-gray-700 dark:border-gray-700 dark:text-gray-200'
                                            )}
                                        >
                                            <p className="font-semibold">{list.name}</p>
                                            <p className="text-xs text-gray-500 dark:text-gray-400">
                                                {list.description || list.button_text}
                                            </p>
                                        </button>
                                    ))}
                                </div>

                                {selectedList && (
                                    <div className="mt-4 rounded-xl border border-gray-200 bg-gray-50 p-3 dark:border-gray-700 dark:bg-gray-900">
                                        <div className="mb-3 text-sm font-semibold text-gray-700 dark:text-gray-200">
                                            Selected List: {selectedList.name}
                                        </div>
                                        <div className="mt-3 flex justify-end gap-2">
                                            <Button
                                                type="button"
                                                variant="secondary"
                                                disabled={listSending}
                                                onClick={() => {
                                                    setSelectedList(null);
                                                }}
                                            >
                                                Clear
                                            </Button>
                                            <Button
                                                type="button"
                                                onClick={sendList}
                                                disabled={listSending || !isCustomerCareWindowOpen}
                                                className="bg-[#25D366] hover:bg-[#1DAA57] text-white"
                                            >
                                                {listSending ? 'Sending...' : 'Send List'}
                                            </Button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        {showButtons && (
                            <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-800">
                                <div className="space-y-4">
                                    <div>
                                        <label className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2 block">
                                            Body Text * (Max 1024 chars)
                                        </label>
                                        <Textarea
                                            value={buttonBodyText}
                                            onChange={(e) => setButtonBodyText(e.target.value)}
                                            placeholder="Enter message body text"
                                            maxLength={1024}
                                            rows={3}
                                            disabled={buttonsSending}
                                            className="rounded-xl"
                                        />
                                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                            {buttonBodyText.length}/1024 characters
                                        </p>
                                    </div>

                                    <div>
                                        <label className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2 block">
                                            Header Text (Optional, Max 60 chars)
                                        </label>
                                        <TextInput
                                            value={buttonHeaderText}
                                            onChange={(e) => setButtonHeaderText(e.target.value)}
                                            placeholder="Optional header text"
                                            maxLength={60}
                                            disabled={buttonsSending}
                                            className="rounded-xl"
                                        />
                                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                            {buttonHeaderText.length}/60 characters
                                        </p>
                                    </div>

                                    <div>
                                        <label className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2 block">
                                            Footer Text (Optional, Max 60 chars)
                                        </label>
                                        <TextInput
                                            value={buttonFooterText}
                                            onChange={(e) => setButtonFooterText(e.target.value)}
                                            placeholder="Optional footer text"
                                            maxLength={60}
                                            disabled={buttonsSending}
                                            className="rounded-xl"
                                        />
                                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                            {buttonFooterText.length}/60 characters
                                        </p>
                                    </div>

                                    <div>
                                        <div className="flex items-center justify-between mb-2">
                                            <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                                                Buttons (Max 3)
                                            </label>
                                            {interactiveButtons.length < 3 && (
                                                <Button
                                                    type="button"
                                                    onClick={addButton}
                                                    variant="secondary"
                                                    size="sm"
                                                    disabled={buttonsSending}
                                                >
                                                    <Plus className="h-3 w-3 mr-1" />
                                                    Add Button
                                                </Button>
                                            )}
                                        </div>
                                        <div className="space-y-2">
                                            {interactiveButtons.map((button, index) => (
                                                <div
                                                    key={index}
                                                    className="flex items-center gap-2 border border-gray-200 dark:border-gray-700 rounded-lg p-2"
                                                >
                                                    <TextInput
                                                        value={button.id}
                                                        onChange={(e) => updateButton(index, 'id', e.target.value)}
                                                        placeholder="Button ID (unique)"
                                                        maxLength={256}
                                                        disabled={buttonsSending}
                                                        className="flex-1 text-sm rounded-lg"
                                                    />
                                                    <TextInput
                                                        value={button.text}
                                                        onChange={(e) => updateButton(index, 'text', e.target.value)}
                                                        placeholder="Button text (max 20)"
                                                        maxLength={20}
                                                        disabled={buttonsSending}
                                                        className="flex-1 text-sm rounded-lg"
                                                    />
                                                    {interactiveButtons.length > 1 && (
                                                        <Button
                                                            type="button"
                                                            onClick={() => removeButton(index)}
                                                            variant="ghost"
                                                            size="sm"
                                                            disabled={buttonsSending}
                                                        >
                                                            <X className="h-3 w-3 text-red-500" />
                                                        </Button>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="mt-4 flex justify-end gap-2">
                                        <Button
                                            type="button"
                                            variant="secondary"
                                            disabled={buttonsSending}
                                            onClick={() => {
                                                setShowButtons(false);
                                                setInteractiveButtons([{ id: '', text: '' }]);
                                                setButtonBodyText('');
                                                setButtonHeaderText('');
                                                setButtonFooterText('');
                                            }}
                                        >
                                            Cancel
                                        </Button>
                                        <Button
                                            type="button"
                                            onClick={sendInteractiveButtons}
                                            disabled={buttonsSending || !isCustomerCareWindowOpen}
                                            className="bg-[#25D366] hover:bg-[#1DAA57] text-white"
                                        >
                                            {buttonsSending ? 'Sending...' : 'Send Buttons'}
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        )}

                                    </div>
                                </div>
                            </div>
                        )}

                        {attachments.length > 0 && (
                            <div className="flex flex-wrap gap-2">
                                {attachments.map((file, index) => (
                                    <div
                                        key={`${file.name}-${index}`}
                                        className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-1 text-xs text-gray-600 shadow-sm dark:bg-gray-800 dark:text-gray-300"
                                    >
                                        <span className="truncate max-w-[160px]">{file.name}</span>
                                        <button type="button" onClick={() => removeAttachment(index)} disabled={attachmentsSending} className="text-gray-400 hover:text-gray-600 disabled:opacity-50" aria-label={`Remove ${file.name}`}>
                                            <X className="h-3.5 w-3.5" aria-hidden />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}

                        {!isCustomerCareWindowOpen && (
                            <div className="rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-900 dark:border-amber-700/50 dark:bg-amber-500/10 dark:text-amber-100">
                                {CUSTOMER_CARE_WINDOW_CLOSED_MESSAGE}
                            </div>
                        )}
                        {isCustomerCareWindowOpen && conversation.customer_care_window?.expires_at && (
                            <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs text-emerald-900 dark:border-emerald-700/50 dark:bg-emerald-500/10 dark:text-emerald-100">
                                {customerCareWindowStatusText}. You can keep replying normally until then.
                            </div>
                        )}

                        <form onSubmit={submit} className="flex items-center gap-3">
                            <TextInput
                                value={data.message}
                                onChange={(e) => setData('message', e.target.value)}
                                placeholder="Type a message"
                                className="flex-1 rounded-full bg-white dark:bg-gray-800"
                                disabled={processing || textSending || attachmentsSending || !isCustomerCareWindowOpen}
                                autoFocus
                                aria-label="Message input"
                            />
                            {showAiSuggest && (
                                <div className="flex items-center gap-1">
                                    <Button
                                        type="button"
                                        onClick={handleAiSuggest}
                                        disabled={
                                            processing ||
                                            textSending ||
                                            attachmentsSending ||
                                            aiSuggestLoading ||
                                            !canUseAiSuggest ||
                                            !isCustomerCareWindowOpen
                                        }
                                        aria-label="Get AI reply suggestion"
                                        title={
                                            !aiSuggestionsEnabled
                                                ? 'Enable AI suggestions in AI settings'
                                                : !platformAiEnabled
                                                ? 'AI is disabled in platform settings'
                                                : 'Suggest reply with AI'
                                        }
                                        variant="secondary"
                                        className="shrink-0 rounded-full px-3 py-2.5 border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800"
                                    >
                                        {aiSuggestLoading ? (
                                            <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-gray-400 border-t-transparent" aria-hidden />
                                        ) : (
                                            <Sparkles className="h-4 w-4 text-amber-500" />
                                        )}
                                    </Button>
                                    {lastAiSuggestion && (
                                        <>
                                            <button
                                                type="button"
                                                className={cn(
                                                    'rounded-full border p-2',
                                                    aiFeedbackSent === 'up'
                                                        ? 'border-green-600 text-green-600'
                                                        : 'border-gray-300 text-gray-500'
                                                )}
                                                onClick={() => handleAiFeedback('up')}
                                                disabled={Boolean(aiFeedbackSending)}
                                                aria-label="Mark AI suggestion helpful"
                                            >
                                                <ThumbsUp className="h-3.5 w-3.5" />
                                            </button>
                                            <button
                                                type="button"
                                                className={cn(
                                                    'rounded-full border p-2',
                                                    aiFeedbackSent === 'down'
                                                        ? 'border-red-600 text-red-600'
                                                        : 'border-gray-300 text-gray-500'
                                                )}
                                                onClick={() => handleAiFeedback('down')}
                                                disabled={Boolean(aiFeedbackSending)}
                                                aria-label="Mark AI suggestion not helpful"
                                            >
                                                <ThumbsDown className="h-3.5 w-3.5" />
                                            </button>
                                        </>
                                    )}
                                </div>
                            )}
                            <Button
                                type="submit"
                                disabled={
                                    processing ||
                                    textSending ||
                                    attachmentsSending ||
                                    !isCustomerCareWindowOpen ||
                                    (!data.message.trim() && attachments.length === 0)
                                }
                                aria-label="Send message"
                                className="bg-[#25D366] hover:bg-[#1DAA57] text-white rounded-full px-5"
                            >
                                <Send className="h-4 w-4" />
                            </Button>
                        </form>
                    </div>
                    {errors.message && (
                        <p className="text-sm text-red-600 dark:text-red-400 mt-2" role="alert">
                            {errors.message}
                        </p>
                    )}
                </div>
            </div>

            <Modal
                show={supportAccess && Boolean(diagnosticMessage)}
                onClose={() => setDiagnosticMessage(null)}
                maxWidth="xl"
            >
                <div className="p-5 sm:p-6">
                    <div className="flex items-start justify-between gap-3">
                        <div>
                            <h3 className="text-lg font-semibold text-gray-900">Delivery Diagnostics</h3>
                            <p className="mt-1 text-sm text-gray-600">
                                Message #{diagnosticMessage?.id ?? '-'} delivery and provider status details.
                            </p>
                        </div>
                        <div className="flex items-center gap-2">
                            {diagnosticMessage && (
                                <Button
                                    type="button"
                                    variant="secondary"
                                    size="sm"
                                    onClick={() => downloadMessageDiagnosticsBundle(diagnosticMessage)}
                                >
                                    Download Bundle
                                </Button>
                            )}
                            <button
                                type="button"
                                onClick={() => setDiagnosticMessage(null)}
                                className="rounded-md p-1 text-gray-500 hover:bg-gray-100 hover:text-gray-700"
                                aria-label="Close diagnostics"
                            >
                                <X className="h-4 w-4" />
                            </button>
                        </div>
                    </div>

                    {diagnosticMessage && (
                        <div className="mt-5 space-y-5">
                            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                                <div className="rounded-xl border border-gray-200 p-3">
                                    <div className="text-xs font-medium uppercase tracking-wide text-gray-500">Status</div>
                                    <div className={cn('mt-1 inline-flex rounded-full px-2 py-1 text-xs font-semibold', getStatusBadgeClassName(diagnosticMessage))}>
                                        {getStatusLabel(diagnosticMessage) ?? diagnosticMessage.status}
                                    </div>
                                </div>
                                <div className="rounded-xl border border-gray-200 p-3">
                                    <div className="text-xs font-medium uppercase tracking-wide text-gray-500">Type</div>
                                    <div className="mt-1 text-sm font-medium text-gray-900">{diagnosticMessage.type}</div>
                                </div>
                                <div className="rounded-xl border border-gray-200 p-3 sm:col-span-2">
                                    <div className="text-xs font-medium uppercase tracking-wide text-gray-500">Meta Message ID</div>
                                    <div className="mt-1 break-all font-mono text-xs text-gray-700">{diagnosticMessage.meta_message_id || '-'}</div>
                                </div>
                            </div>

                            <div className="rounded-xl border border-gray-200 p-3">
                                <div className="text-xs font-medium uppercase tracking-wide text-gray-500">Timeline</div>
                                <div className="mt-2 grid grid-cols-1 gap-2 text-sm sm:grid-cols-2">
                                    <div><span className="text-gray-500">Created:</span> {formatDiagnosticTime(diagnosticMessage.created_at)}</div>
                                    <div><span className="text-gray-500">Accepted:</span> {formatDiagnosticTime(diagnosticMessage.sent_at)}</div>
                                    <div><span className="text-gray-500">Delivered:</span> {formatDiagnosticTime(diagnosticMessage.delivered_at)}</div>
                                    <div><span className="text-gray-500">Read:</span> {formatDiagnosticTime(diagnosticMessage.read_at)}</div>
                                </div>
                                {getDeliveryLatencyLabel(diagnosticMessage) && (
                                    <div className="mt-2 text-xs font-medium text-emerald-700">{getDeliveryLatencyLabel(diagnosticMessage)}</div>
                                )}
                            </div>

                            <div className="rounded-xl border border-gray-200 p-3">
                                <div className="text-xs font-medium uppercase tracking-wide text-gray-500">Error</div>
                                <div className="mt-1 text-sm text-gray-800">
                                    {getMessageDiagnosticError(diagnosticMessage) || 'No provider error captured.'}
                                </div>
                            </div>

                            <div className="rounded-xl border border-gray-200 p-3">
                                <div className="text-xs font-medium uppercase tracking-wide text-gray-500">Payload Snapshot</div>
                                <pre className="mt-2 max-h-48 overflow-auto rounded-lg bg-gray-50 p-3 text-xs text-gray-700">
                                    {JSON.stringify(diagnosticMessage.payload ?? {}, null, 2)}
                                </pre>
                            </div>
                        </div>
                    )}
                </div>
            </Modal>
        </>
    );

    return isEmbedded ? content : <AppShell>{content}</AppShell>;
}
