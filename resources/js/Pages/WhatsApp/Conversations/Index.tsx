import { Link, usePage, router } from '@inertiajs/react';
import { Fragment, useEffect, useState, useRef, useMemo, useCallback } from 'react';
import type { MouseEvent } from 'react';
import AppShell from '@/Layouts/AppShell';
import { Badge } from '@/Components/UI/Badge';
import {
    ArrowLeft,
    AlertCircle,
    BellRing,
    Check,
    ChevronDown,
    CheckCircle,
    CheckCheck,
    CheckSquare,
    ClipboardList,
    Clock,
    CreditCard,
    ExternalLink,
    Edit3,
    Flag,
    File as FileIcon,
    FileText,
    Film,
    Image as ImageIcon,
    Link2,
    Lock,
    MapPin,
    MessageSquare,
    Mic,
    MoreVertical,
    PanelRight,
    Paperclip,
    Pause,
    Phone,
    Play,
    Plus,
    Reply,
    RotateCcw,
    Search,
    Send,
    ShoppingBag,
    Smile,
    Sparkles,
    Star,
    StickyNote,
    Trash2,
    User,
    UserX,
    type LucideIcon,
    Wifi,
    WifiOff,
    X,
    Zap,
} from 'lucide-react';
import { useRealtime } from '@/Providers/RealtimeProvider';
import { ConversationSkeleton } from '@/Components/UI/Skeleton';
import { EmptyState } from '@/Components/UI/EmptyState';
import { useToast } from '@/hooks/useToast';
import { useConfirm } from '@/hooks/useConfirm';
import { isSameAccountId } from '@/lib/utils';
import axios from 'axios';
import TextInput from '@/Components/TextInput';
import Button from '@/Components/UI/Button';
import { Head } from '@inertiajs/react';

const inboxDebug = import.meta.env.VITE_INBOX_DEBUG === 'true';

function shortcutFromButtonLabel(label: string) {
    return label
        .toLowerCase()
        .replace(/[^a-z0-9\s_-]/g, '')
        .replace(/[\s-]+/g, '_')
        .replace(/^_+|_+$/g, '')
        .slice(0, 60) || 'button';
}

interface Agent {
    id: number;
    name: string;
    email?: string;
    role?: string;
}

interface AiAgentOption {
    id: number;
    name: string;
    avatar?: string | null;
    role?: string;
    tone?: string;
    mode?: 'suggest' | 'approval' | 'autopilot';
}

interface Conversation {
    id: number;
    account_id?: number | string;
    contact: {
        id: number;
        slug?: string | null;
        wa_id: string;
        name: string;
        display_phone?: string | null;
        is_unresolved_lid?: boolean;
        email?: string | null;
        phone?: string | null;
        company?: string | null;
        notes?: string | null;
        status?: string | null;
        source?: string | null;
        ctwa?: {
            source?: string | null;
            source_type?: string | null;
            source_id?: string | null;
            source_url?: string | null;
            ctwa_clid?: string | null;
            headline?: string | null;
            body?: string | null;
            media_type?: string | null;
            captured_at?: string | null;
        } | null;
        tags?: Array<{ id: number; name: string; color?: string | null }>;
    };
    status: string;
    last_message_preview: string | null;
    last_message_at: string | null;
    last_inbound_message_at?: string | null;
    connection: {
        id: number;
        name: string;
        slug?: string;
        calling_status?: string | null;
        calling_enabled?: boolean;
        calling_webhook_subscribed?: boolean;
    };
    assigned_to?: number | null;
    priority?: string | null;
    automation_state?: AutomationState | null;
    automation_processing?: boolean;
    automation_processing_mode?: string | null;
    bot_paused?: boolean;
    bot_paused_reason?: string | null;
    handoff_status?: string | null;
    handoff_reason?: string | null;
    unread_count?: number;
}

interface AutomationState {
    bot_id?: number | null;
    flow_id: number;
    flow_name: string;
    waiting_node_id?: number | null;
    waiting_node_label?: string | null;
    status?: string;
    invalid_replies?: number;
    updated_at?: string | null;
}

interface ChatMessage {
    id: number | string;
    direction: 'inbound' | 'outbound';
    type: string;
    text_body: string | null;
    payload?: any;
    status?: string;
    meta_message_id?: string | null;
    created_at: string;
    updated_at?: string | null;
    sent_at?: string | null;
    delivered_at?: string | null;
    read_at?: string | null;
    optimistic?: boolean;
    reply_to?: string | null;
    reply_to_message_id?: number | string | null;
    reply_to_meta_message_id?: string | null;
}

interface ConversationNote {
    id: number;
    note: string;
    created_at: string;
    created_by?: {
        id: number;
        name: string;
        email?: string;
    } | null;
}

interface ConversationAuditEvent {
    id: number;
    event_type: string;
    description: string;
    meta?: any;
    created_at: string;
    actor?: {
        id: number;
        name: string;
        email?: string;
    } | null;
}

interface InboxCallRecord {
    id: number;
    whatsapp_connection_id?: number | null;
    direction: string;
    phone_number?: string | null;
    contact_name?: string | null;
    status: string;
    route_mode?: string | null;
    routed_to?: string | null;
    provider_call_id?: string | null;
    duration_seconds?: number;
    summary?: string | null;
    metadata?: Record<string, any> | null;
    agent?: { id: number; name: string } | null;
    created_at?: string | null;
    updated_at?: string | null;
}

interface InboxCallingSettings {
    enabled: boolean;
    routing_mode?: string;
    whatsapp_connection_id?: number | string | null;
    calling_eligibility_status?: string | null;
    calling_webhook_subscribed?: boolean;
    default_agent_id?: number | null;
    outbound_enabled?: boolean;
    transfer_number?: string | null;
    setup_url?: string;
}

interface TemplateOption {
    id: number;
    name: string;
    language?: string;
    body_text?: string | null;
    variable_count?: number;
}

interface CatalogProductOption {
    id: number;
    name: string;
    sku?: string | null;
    catalog_id?: string | null;
    retailer_id?: string | null;
    price?: number | null;
    currency?: string | null;
    image_url?: string | null;
    source?: string | null;
}

interface SavedButtonOption {
    id: number;
    type?: string | null;
    label: string;
    shortcut?: string | null;
    message?: string | null;
    button_text?: string | null;
}

interface SavedListOption {
    id: number;
    connection_id?: number | null;
    name: string;
    button_text?: string | null;
    description?: string | null;
    footer_text?: string | null;
    sections?: any[];
}

interface SavedFormOption {
    id: number;
    connection_id?: number | null;
    meta_flow_id: string;
    name: string;
    status?: string | null;
    category?: string | null;
}

type InteractiveMode = 'buttons' | 'list' | 'form' | 'product' | 'link' | 'payment' | 'contact';

const callSessionSdpFrom = (value: any): string | null => {
    const candidates = [
        value?.session?.sdp,
        value?.call?.metadata?.call?.session?.sdp,
        value?.call?.metadata?.connect_response?.session?.sdp,
        value?.call?.metadata?.connect_response?.calls?.[0]?.session?.sdp,
        value?.metadata?.call?.session?.sdp,
        value?.metadata?.connect_response?.session?.sdp,
        value?.metadata?.connect_response?.calls?.[0]?.session?.sdp,
        value?.metadata?.first_sdp,
        value?.metadata?.latest_sdp,
    ];

    return candidates.find((candidate) => typeof candidate === 'string' && candidate.trim().length > 0) || null;
};

const isIncomingActionableCall = (call?: InboxCallRecord | null): call is InboxCallRecord => {
    if (!call) return false;

    return call.direction === 'inbound' && ['received', 'ringing', 'queued'].includes(call.status);
};

const isIncomingVisibleCall = (call?: InboxCallRecord | null): call is InboxCallRecord => {
    if (!call) return false;

    return call.direction === 'inbound' && ['received', 'ringing', 'queued', 'initiated', 'answered'].includes(call.status);
};

const mergeCallRecords = (current: InboxCallRecord[], incoming: InboxCallRecord[]): InboxCallRecord[] => {
    if (!incoming.length) return current;

    const byId = new Map(current.map((call) => [Number(call.id), call]));
    incoming.forEach((call) => {
        if (!call?.id) return;
        byId.set(Number(call.id), { ...(byId.get(Number(call.id)) ?? {}), ...call });
    });

    return Array.from(byId.values())
        .sort((a, b) => new Date(b.updated_at || b.created_at || 0).getTime() - new Date(a.updated_at || a.created_at || 0).getTime())
        .slice(0, 100);
};

const normalizeConversation = (value: any): Conversation | null => {
    if (!value || value.id == null) return null;

    const id = Number(value.id);
    const connectionId = Number(value?.connection?.id);
    if (!Number.isInteger(id) || id < 1 || !Number.isInteger(connectionId) || connectionId < 1) {
        return null;
    }

    const waId = String(value?.contact?.wa_id ?? '').trim();
    const name = String(value?.contact?.name ?? waId ?? '').trim();

    return {
        id,
        account_id: value.account_id,
        contact: {
            id: Number(value?.contact?.id ?? 0),
            slug: value?.contact?.slug ?? null,
            wa_id: waId,
            name: name || waId || 'Unknown',
            display_phone: value?.contact?.display_phone ?? null,
            is_unresolved_lid: Boolean(value?.contact?.is_unresolved_lid ?? false),
            email: value?.contact?.email ?? null,
            phone: value?.contact?.phone ?? null,
            company: value?.contact?.company ?? null,
            notes: value?.contact?.notes ?? null,
            status: value?.contact?.status ?? null,
            source: value?.contact?.source ?? null,
            ctwa: value?.contact?.ctwa ?? null,
            tags: Array.isArray(value?.contact?.tags) ? value.contact.tags : [],
        },
        status: String(value.status ?? 'open'),
        last_message_preview: value.last_message_preview ?? null,
        last_message_at: value.last_message_at ?? null,
        last_inbound_message_at: value.last_inbound_message_at ?? null,
        connection: {
            id: connectionId,
            name: String(value?.connection?.name ?? 'Unknown'),
            slug: value?.connection?.slug ? String(value.connection.slug) : undefined,
            calling_status: value?.connection?.calling_status ?? null,
            calling_enabled: Boolean(value?.connection?.calling_enabled ?? false),
            calling_webhook_subscribed: Boolean(value?.connection?.calling_webhook_subscribed ?? false),
        },
        assigned_to: value.assigned_to == null ? null : Number(value.assigned_to),
        priority: value.priority ?? null,
        automation_state: value.automation_state ?? null,
        automation_processing: Boolean(value.automation_processing ?? false),
        automation_processing_mode: value.automation_processing_mode ?? null,
        bot_paused: Boolean(value.bot_paused ?? false),
        bot_paused_reason: value.bot_paused_reason ?? null,
        handoff_status: value.handoff_status ?? null,
        handoff_reason: value.handoff_reason ?? null,
        unread_count: Number(value.unread_count ?? value.unread ?? 0),
    };
};

const normalizeConversationList = (items: unknown): Conversation[] => {
    if (!Array.isArray(items)) return [];
    return items
        .map(normalizeConversation)
        .filter((item): item is Conversation => item !== null);
};

const contactDisplayPhone = (conversation?: Conversation | null): string => {
    if (!conversation) return '';
    return conversation.contact.display_phone || conversation.contact.phone || conversation.contact.wa_id || '';
};

const conversationSourceLabel = (conversation?: Conversation | null): string => {
    if (!conversation) return 'WhatsApp';
    if (conversation.contact.ctwa?.source_type || conversation.contact.ctwa?.source || conversation.contact.ctwa?.ctwa_clid) {
        return 'Click-to-WhatsApp';
    }

    const source = String(conversation.contact.source || '').trim();
    if (!source) return 'WhatsApp';

    return source
        .replace(/[_-]+/g, ' ')
        .replace(/\b\w/g, (letter) => letter.toUpperCase());
};

const conversationSlaLabel = (conversation?: Conversation | null): { label: string; tone: 'muted' | 'ok' | 'warn' | 'danger' } => {
    if (!conversation?.last_message_at) return { label: 'No SLA', tone: 'muted' };
    if (conversation.status === 'closed') return { label: 'Resolved', tone: 'ok' };

    const timestamp = new Date(conversation.last_message_at).getTime();
    if (!Number.isFinite(timestamp)) return { label: 'No SLA', tone: 'muted' };

    const minutes = Math.max(0, Math.floor((Date.now() - timestamp) / 60000));
    if (minutes >= 1440) return { label: `${Math.floor(minutes / 1440)}d`, tone: 'danger' };
    if (minutes >= 240) return { label: `${Math.floor(minutes / 60)}h`, tone: 'warn' };
    if (minutes >= 60) return { label: `${Math.floor(minutes / 60)}h`, tone: 'ok' };
    return { label: `${Math.max(1, minutes)}m`, tone: 'ok' };
};

const slaClasses = (tone: 'muted' | 'ok' | 'warn' | 'danger'): string => {
    const classes = {
        muted: 'bg-gray-100 text-gray-600 dark:bg-slate-800 dark:text-slate-300',
        ok: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300',
        warn: 'bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-300',
        danger: 'bg-red-50 text-red-700 dark:bg-red-500/10 dark:text-red-300',
    };

    return classes[tone];
};

interface CustomerServiceWindow {
    state: 'open' | 'closing' | 'closed' | 'none';
    isOpen: boolean;
    label: string;
    detail: string;
    lastInboundAt: string | null;
    expiresAt: string | null;
    tone: 'muted' | 'ok' | 'warn' | 'danger';
}

const formatReplyWindowRemaining = (milliseconds: number): string => {
    const minutes = Math.max(1, Math.ceil(milliseconds / 60000));
    if (minutes >= 60) {
        const hours = Math.floor(minutes / 60);
        const remainder = minutes % 60;
        return remainder > 0 ? `${hours}h ${remainder}m left` : `${hours}h left`;
    }

    return `${minutes}m left`;
};

const customerServiceWindowFor = (
    conversation?: Conversation | null,
    messages: ChatMessage[] = [],
    nowMs: number = Date.now(),
): CustomerServiceWindow => {
    const latestInboundFromMessages = [...messages].reverse().find((message) => message.direction === 'inbound')?.created_at ?? null;
    const lastInboundAt = latestInboundFromMessages ?? conversation?.last_inbound_message_at ?? null;

    if (!lastInboundAt) {
        return {
            state: 'none',
            isOpen: false,
            label: 'Template required',
            detail: 'No recent customer message found. Send an approved template to start the chat.',
            lastInboundAt: null,
            expiresAt: null,
            tone: 'muted',
        };
    }

    const inboundTime = new Date(lastInboundAt).getTime();
    if (!Number.isFinite(inboundTime)) {
        return {
            state: 'none',
            isOpen: false,
            label: 'Template required',
            detail: 'Latest customer message time is unavailable. Use an approved template.',
            lastInboundAt,
            expiresAt: null,
            tone: 'muted',
        };
    }

    const expiresAtMs = inboundTime + 24 * 60 * 60 * 1000;
    const remainingMs = expiresAtMs - nowMs;
    const expiresAt = new Date(expiresAtMs).toISOString();

    if (remainingMs <= 0) {
        return {
            state: 'closed',
            isOpen: false,
            label: '24h window closed',
            detail: 'Meta allows free-form replies only within 24 hours of the customer message. Use an approved template.',
            lastInboundAt,
            expiresAt,
            tone: 'danger',
        };
    }

    const closingSoon = remainingMs <= 2 * 60 * 60 * 1000;

    return {
        state: closingSoon ? 'closing' : 'open',
        isOpen: true,
        label: `Reply window ${formatReplyWindowRemaining(remainingMs)}`,
        detail: `Free-form replies allowed until ${new Date(expiresAtMs).toLocaleString()}.`,
        lastInboundAt,
        expiresAt,
        tone: closingSoon ? 'warn' : 'ok',
    };
};

const mergeLastInboundAt = (
    previous?: string | null,
    incoming?: string | null,
    message?: Pick<ChatMessage, 'direction' | 'created_at'> | null,
): string | null => {
    if (message?.direction === 'inbound' && message.created_at) {
        const messageTime = new Date(message.created_at).getTime();
        const previousTime = previous ? new Date(previous).getTime() : 0;
        if (Number.isFinite(messageTime) && messageTime >= (Number.isFinite(previousTime) ? previousTime : 0)) {
            return message.created_at;
        }
    }

    if (incoming) {
        const incomingTime = new Date(incoming).getTime();
        const previousTime = previous ? new Date(previous).getTime() : 0;
        if (Number.isFinite(incomingTime) && incomingTime >= (Number.isFinite(previousTime) ? previousTime : 0)) {
            return incoming;
        }
    }

    return previous ?? null;
};

const isUsableAiSuggestion = (value: unknown): value is string => {
    if (typeof value !== 'string') {
        return false;
    }

    const text = value.trim();
    if (text.length < 24) {
        return false;
    }

    return ![
        /\bto help me understand\s*$/i,
        /\bplease share\s*$/i,
        /\bcan you share\s*$/i,
        /\bcould you share\s*$/i,
        /\bmay i know\s*$/i,
        /\btell me more about\s*$/i,
    ].some((pattern) => pattern.test(text));
};

const conversationModeLabel = (conversation?: Conversation | null): string => {
    if (!conversation) return 'No chat selected';
    if (conversation.automation_processing) return conversation.automation_processing_mode === 'ai' ? 'AI replying' : 'Bot replying';
    if (conversation.bot_paused || conversation.handoff_status === 'manual') return 'Manual mode';
    if (conversation.automation_state) return 'Automation waiting';
    return 'Bot ready';
};

const timelineBadgeForMessage = (message: ChatMessage): { label: string; icon: LucideIcon; classes: string } | null => {
    if (isCallTranscriptMessage(message)) {
        return null;
    }

    if (message.type === 'template') {
        return {
            label: 'Template sent',
            icon: FileText,
            classes: 'bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-200',
        };
    }

    if (message.type === 'interactive') {
        const interactiveType = String(message.payload?.interactive_type ?? message.payload?.interactive?.type ?? '');
        const isPayment = interactiveType === 'payment' || message.payload?.payment_link || message.payload?.payment_order_id;
        const isProduct = interactiveType.includes('product') || message.payload?.catalog_product_id || message.payload?.product_id;
        const isForm = interactiveType === 'flow' || message.payload?.flow_id;

        return {
            label: isPayment ? 'Payment link' : isProduct ? 'Product shared' : isForm ? 'WhatsApp form' : interactiveType === 'list' ? 'List sent' : 'Buttons sent',
            icon: isPayment ? CreditCard : isProduct ? ShoppingBag : ClipboardList,
            classes: isPayment
                ? 'bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-200'
                : 'bg-purple-50 text-purple-700 dark:bg-purple-500/10 dark:text-purple-200',
        };
    }

    if (message.status === 'failed') {
        return {
            label: 'Send failed',
            icon: AlertCircle,
            classes: 'bg-red-50 text-red-700 dark:bg-red-500/10 dark:text-red-200',
        };
    }

    return null;
};

const EMOJI_QUICK = ['👍', '🙏', '😊', '🎉', '✅', '❤️', '🔥', '👋'];
const HOVER_REACTIONS = ['👍', '❤️', '😂', '🙏'];

const QUICK_REPLIES = [
    { id: 'catalog', label: 'Send catalog', text: 'Hi {{name}}, I will send the latest catalog right away.' },
    { id: 'tracking', label: 'Tracking update', text: 'Your order is being checked. I will share the tracking link shortly.' },
    { id: 'callback', label: 'Callback', text: 'Can I arrange a quick call with our team to help you faster?' },
    { id: 'thanks', label: 'Thank you', text: 'Thanks for confirming. Let me know if you need anything else.' },
];

const INBOX_LABELS = [
    { id: 'vip', label: 'VIP', color: 'emerald' },
    { id: 'order', label: 'Order', color: 'blue' },
    { id: 'support', label: 'Support', color: 'purple' },
    { id: 'lead', label: 'Lead', color: 'amber' },
];

const getConversationLabels = (conversation: Conversation): string[] => {
    const labels = new Set<string>();
    const contactTagNames = (conversation.contact.tags ?? []).map((tag) => tag.name.toLowerCase());
    if (conversation.priority === 'urgent') labels.add('vip');
    if (contactTagNames.includes('vip')) labels.add('vip');
    if ((conversation.last_message_preview || '').toLowerCase().match(/order|shipping|tracking|delivery/)) labels.add('order');
    if (contactTagNames.includes('order')) labels.add('order');
    if ((conversation.last_message_preview || '').toLowerCase().match(/help|issue|problem|support/)) labels.add('support');
    if (contactTagNames.includes('support')) labels.add('support');
    if (conversation.status === 'pending') labels.add('lead');
    if (contactTagNames.includes('lead')) labels.add('lead');
    return Array.from(labels);
};

const labelClasses = (color: string) => {
    const classes: Record<string, string> = {
        emerald: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300',
        blue: 'bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-300',
        purple: 'bg-purple-50 text-purple-700 dark:bg-purple-500/10 dark:text-purple-300',
        amber: 'bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-300',
    };
    return classes[color] ?? classes.emerald;
};

const isCallTranscriptMessage = (message: ChatMessage): boolean => (
    message.payload?.source === 'voice_bridge'
    || message.payload?.voice_session_id != null
);

const callTranscriptSpeaker = (message: ChatMessage): string => {
    if (message.direction === 'inbound') return 'Caller';
    if (message.payload?.source === 'ai_agent') return 'AI agent';

    return 'Agent';
};

const noteToTimelineMessage = (note: ConversationNote): ChatMessage => ({
    id: `note-${note.id}`,
    direction: 'inbound',
    type: 'internal_note',
    text_body: note.note,
    payload: {
        note_id: note.id,
        created_by: note.created_by,
    },
    status: 'saved',
    created_at: note.created_at,
});

const auditToTimelineMessage = (event: ConversationAuditEvent): ChatMessage => ({
    id: `audit-${event.id}`,
    direction: 'inbound',
    type: 'automation_status',
    text_body: event.description,
    payload: {
        audit_id: event.id,
        event_type: event.event_type,
        meta: event.meta ?? {},
        actor: event.actor ?? null,
    },
    status: event.event_type,
    created_at: event.created_at,
});

const normalizeChatMessage = (value: any): ChatMessage | null => {
    if (!value || value.id == null) return null;

    return {
        id: value.id,
        direction: value.direction === 'outbound' ? 'outbound' : 'inbound',
        type: String(value.type ?? 'text'),
        text_body: value.text_body ?? value.text ?? null,
        payload: value.payload ?? {},
        status: value.status ?? undefined,
        meta_message_id: value.meta_message_id ?? null,
        created_at: value.created_at ?? new Date().toISOString(),
        updated_at: value.updated_at ?? null,
        sent_at: value.sent_at ?? null,
        delivered_at: value.delivered_at ?? null,
        read_at: value.read_at ?? null,
        reply_to: value.reply_to ?? value.payload?.reply?.preview ?? value.payload?.context?.preview ?? null,
        reply_to_message_id: value.reply_to_message_id ?? value.payload?.reply?.message_id ?? null,
        reply_to_meta_message_id: value.reply_to_meta_message_id ?? value.payload?.reply?.meta_message_id ?? value.payload?.context?.id ?? null,
    };
};

const isRenderableMessageUpdate = (message: ChatMessage): boolean => {
    if (message.type && message.type !== 'text') return true;
    if (message.text_body) return true;
    if (message.payload && Object.keys(message.payload).length > 0) return true;

    return false;
};

const messageTimestamp = (message: Pick<ChatMessage, 'created_at'>): number => {
    const timestamp = new Date(message.created_at).getTime();
    return Number.isFinite(timestamp) ? timestamp : 0;
};

const sortMessages = (messages: ChatMessage[]): ChatMessage[] => (
    [...messages].sort((a, b) => messageTimestamp(a) - messageTimestamp(b))
);

const isOptimisticMatch = (optimistic: ChatMessage, incoming: ChatMessage): boolean => {
    if (!String(optimistic.id).startsWith('optimistic-')) return false;
    if (String(incoming.id).startsWith('optimistic-')) return false;
    if (optimistic.direction !== incoming.direction || optimistic.type !== incoming.type) return false;
    if ((optimistic.text_body ?? '') !== (incoming.text_body ?? '')) return false;

    return Math.abs(messageTimestamp(optimistic) - messageTimestamp(incoming)) < 120000;
};

const isSameProviderMessage = (existing: ChatMessage, incoming: ChatMessage): boolean => {
    if (!existing.meta_message_id || !incoming.meta_message_id) return false;
    return String(existing.meta_message_id) === String(incoming.meta_message_id);
};

const canReactToMessage = (message: ChatMessage): boolean => (
    Boolean(message.meta_message_id)
    && !message.optimistic
    && !String(message.id).startsWith('note-')
    && !['internal_note', 'reaction'].includes(message.type)
    && !isCallTranscriptMessage(message)
);

interface MediaPreview {
    type: string;
    url: string;
    title: string;
    filename?: string;
}

interface GalleryItem {
    id: number | string;
    message_id?: number | string;
    direction?: 'inbound' | 'outbound';
    type: string;
    url?: string | null;
    title?: string | null;
    filename?: string | null;
    mime_type?: string | null;
    file_size?: number | null;
    caption?: string | null;
    created_at?: string | null;
}

interface ContactGallery {
    media: GalleryItem[];
    documents: GalleryItem[];
    links: GalleryItem[];
    counts: {
        media: number;
        documents: number;
        links: number;
        total: number;
    };
}

const emptyContactGallery = (): ContactGallery => ({
    media: [],
    documents: [],
    links: [],
    counts: {
        media: 0,
        documents: 0,
        links: 0,
        total: 0,
    },
});

const messageStatusIcon = (message: ChatMessage) => {
    if (message.optimistic || message.status === 'queued') {
        return <Clock className="h-3.5 w-3.5" aria-label="Sending" />;
    }

    if (message.status === 'failed') {
        return <AlertCircle className="h-3.5 w-3.5 text-red-500" aria-label="Failed" />;
    }

    if (message.read_at || message.status === 'read') {
        return <CheckCheck className="h-3.5 w-3.5 text-sky-500" aria-label="Read" />;
    }

    if (message.delivered_at || message.status === 'delivered') {
        return <CheckCheck className="h-3.5 w-3.5" aria-label="Delivered" />;
    }

    return <Check className="h-3.5 w-3.5" aria-label="Sent" />;
};

const formatFileSize = (bytes: number): string => {
    if (!Number.isFinite(bytes) || bytes <= 0) return '0 KB';
    if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

const AUDIO_EXTENSIONS = new Set(['aac', 'm4a', 'mp4', 'mp3', 'amr', 'ogg', 'oga', 'wav', 'wave']);
const VIDEO_EXTENSIONS = new Set(['mp4', 'mov', '3gp', '3gpp']);
const IMAGE_EXTENSIONS = new Set(['jpg', 'jpeg', 'png', 'gif', 'webp']);

const fileExtension = (file: File): string => {
    const name = file.name || '';
    const parts = name.split('.');
    return parts.length > 1 ? (parts.pop() || '').toLowerCase() : '';
};

const isRecordedVoiceFile = (file: File): boolean => file.name.startsWith('voice-message-');

const messageReplyPreview = (message?: ChatMessage | null): string | null => {
    if (!message) return null;
    if (message.text_body) return message.text_body.slice(0, 160);

    const payload = message.payload || {};
    const filename = payload.filename || payload.document?.filename || payload.media?.filename;
    if (filename) return String(filename).slice(0, 160);

    if (message.type === 'audio') return payload.voice ? 'Voice message' : 'Audio message';
    if (message.type === 'image') return 'Image message';
    if (message.type === 'video') return 'Video message';
    if (message.type === 'document') return 'Document message';
    if (message.type === 'location') return 'Location message';

    return `${message.type || 'Message'} message`;
};

const messageReplyMetaId = (message?: ChatMessage | null): string | null => {
    if (!message) return null;
    return message.meta_message_id || message.payload?.context?.id || message.payload?.reply?.meta_message_id || null;
};

let lameLoader: Promise<any> | null = null;

const loadLameEncoder = (): Promise<any> => {
    if (typeof window === 'undefined') {
        return Promise.reject(new Error('Voice encoder is only available in the browser.'));
    }

    const existing = (window as any).lamejs?.Mp3Encoder;
    if (existing) {
        return Promise.resolve((window as any).lamejs);
    }

    if (!lameLoader) {
        lameLoader = new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.src = '/vendor/lame.all.js';
            script.async = true;
            script.onload = () => {
                const lame = (window as any).lamejs;
                if (lame?.Mp3Encoder) {
                    resolve(lame);
                } else {
                    reject(new Error('Voice encoder did not initialize.'));
                }
            };
            script.onerror = () => reject(new Error('Voice encoder could not be loaded.'));
            document.head.appendChild(script);
        });
    }

    return lameLoader;
};

const flattenAudioSamples = (chunks: Float32Array[]): Float32Array => {
    const length = chunks.reduce((total, chunk) => total + chunk.length, 0);
    const samples = new Float32Array(length);
    let offset = 0;
    chunks.forEach((chunk) => {
        samples.set(chunk, offset);
        offset += chunk.length;
    });

    return samples;
};

const floatTo16BitPcm = (samples: Float32Array): Int16Array => {
    const pcm = new Int16Array(samples.length);
    for (let index = 0; index < samples.length; index += 1) {
        const sample = Math.max(-1, Math.min(1, samples[index]));
        pcm[index] = sample < 0 ? sample * 0x8000 : sample * 0x7fff;
    }

    return pcm;
};

const encodeMp3 = (lame: any, samples: Float32Array, sampleRate: number): Blob => {
    const encoder = new lame.Mp3Encoder(1, sampleRate, 64);
    const pcm = floatTo16BitPcm(samples);
    const chunks: ArrayBuffer[] = [];
    const blockSize = 1152;

    for (let offset = 0; offset < pcm.length; offset += blockSize) {
        const buffer = encoder.encodeBuffer(pcm.subarray(offset, offset + blockSize));
        if (buffer.length > 0) {
            chunks.push(buffer.slice().buffer as ArrayBuffer);
        }
    }

    const flush = encoder.flush();
    if (flush.length > 0) {
        chunks.push(flush.slice().buffer as ArrayBuffer);
    }

    return new Blob(chunks, { type: 'audio/mpeg' });
};

const formatAudioTime = (seconds: number): string => {
    if (!Number.isFinite(seconds) || seconds < 0) return '0:00';
    const minutes = Math.floor(seconds / 60);
    const remainder = Math.floor(seconds % 60).toString().padStart(2, '0');
    return `${minutes}:${remainder}`;
};

function ChatAudioPlayer({
    src,
    title,
    outbound,
    voice = false,
    onPreview,
}: {
    src: string;
    title: string;
    outbound: boolean;
    voice?: boolean;
    onPreview?: () => void;
}) {
    const audioRef = useRef<HTMLAudioElement | null>(null);
    const [playing, setPlaying] = useState(false);
    const [duration, setDuration] = useState(0);
    const [currentTime, setCurrentTime] = useState(0);

    useEffect(() => {
        const audio = audioRef.current;
        if (!audio) return;

        const sync = () => setCurrentTime(audio.currentTime || 0);
        const loaded = () => setDuration(Number.isFinite(audio.duration) ? audio.duration : 0);
        const ended = () => setPlaying(false);

        audio.addEventListener('timeupdate', sync);
        audio.addEventListener('loadedmetadata', loaded);
        audio.addEventListener('durationchange', loaded);
        audio.addEventListener('ended', ended);

        return () => {
            audio.removeEventListener('timeupdate', sync);
            audio.removeEventListener('loadedmetadata', loaded);
            audio.removeEventListener('durationchange', loaded);
            audio.removeEventListener('ended', ended);
        };
    }, [src]);

    const toggle = () => {
        const audio = audioRef.current;
        if (!audio) return;

        if (audio.paused) {
            audio.play()
                .then(() => setPlaying(true))
                .catch(() => setPlaying(false));
        } else {
            audio.pause();
            setPlaying(false);
        }
    };

    const seek = (value: string) => {
        const audio = audioRef.current;
        if (!audio || !duration) return;

        const nextTime = (Number(value) / 100) * duration;
        audio.currentTime = nextTime;
        setCurrentTime(nextTime);
    };

    const progress = duration ? Math.min(100, Math.max(0, (currentTime / duration) * 100)) : 0;
    const label = voice ? 'Voice message' : title || 'Audio message';

    return (
        <div className={`mb-2 min-w-[240px] max-w-[320px] rounded-lg px-3 py-2 ring-1 ${outbound ? 'bg-white/45 ring-emerald-900/10 dark:bg-white/10 dark:ring-white/10' : 'bg-gray-50 ring-gray-100 dark:bg-slate-800 dark:ring-slate-700'}`}>
            <audio ref={audioRef} src={src} preload="metadata" className="hidden" />
            <div className="flex items-center gap-3">
                <button
                    type="button"
                    onClick={toggle}
                    className={`flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full transition ${outbound ? 'bg-waify-green text-white hover:bg-waify-green-dark' : 'bg-waify-green-soft text-waify-green-dark hover:bg-waify-green-soft/80 dark:bg-waify-green/15 dark:text-waify-green'}`}
                    aria-label={playing ? 'Pause audio' : 'Play audio'}
                >
                    {playing ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4 translate-x-px" />}
                </button>
                <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                        <span className="truncate text-xs font-semibold">{label}</span>
                        {onPreview && (
                            <button type="button" onClick={onPreview} className="text-[10px] font-medium opacity-70 transition hover:opacity-100">
                                Preview
                            </button>
                        )}
                    </div>
                    <input
                        type="range"
                        min="0"
                        max="100"
                        value={progress}
                        onChange={(event) => seek(event.target.value)}
                        className="mt-1 h-1.5 w-full cursor-pointer accent-waify-green"
                        aria-label="Audio progress"
                    />
                    <div className="mt-0.5 flex justify-between text-[10px] opacity-70">
                        <span>{formatAudioTime(currentTime)}</span>
                        <span>{formatAudioTime(duration)}</span>
                    </div>
                </div>
            </div>
        </div>
    );
}

function ChatVideoCard({
    src,
    title,
    outbound,
    onPreview,
}: {
    src: string;
    title: string;
    outbound: boolean;
    onPreview: () => void;
}) {
    const videoRef = useRef<HTMLVideoElement | null>(null);
    const [duration, setDuration] = useState(0);

    useEffect(() => {
        const video = videoRef.current;
        if (!video) return;

        const loaded = () => setDuration(Number.isFinite(video.duration) ? video.duration : 0);
        video.addEventListener('loadedmetadata', loaded);
        video.addEventListener('durationchange', loaded);

        return () => {
            video.removeEventListener('loadedmetadata', loaded);
            video.removeEventListener('durationchange', loaded);
        };
    }, [src]);

    return (
        <button
            type="button"
            onClick={onPreview}
            className={`mb-2 block w-full min-w-[240px] max-w-[320px] overflow-hidden rounded-lg text-left shadow-sm ring-1 transition hover:scale-[1.01] ${outbound ? 'bg-white/45 ring-emerald-900/10 dark:bg-white/10 dark:ring-white/10' : 'bg-gray-50 ring-gray-100 dark:bg-slate-800 dark:ring-slate-700'}`}
        >
            <div className="relative aspect-video bg-slate-900">
                <video
                    ref={videoRef}
                    src={src}
                    preload="metadata"
                    muted
                    playsInline
                    className="h-full w-full object-cover"
                />
                <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                    <span className="flex h-12 w-12 items-center justify-center rounded-full bg-black/55 text-white shadow-lg backdrop-blur-sm">
                        <Play className="h-5 w-5 translate-x-px" />
                    </span>
                </div>
                {duration > 0 && (
                    <span className="absolute bottom-2 right-2 rounded bg-black/65 px-1.5 py-0.5 text-[10px] font-medium text-white">
                        {formatAudioTime(duration)}
                    </span>
                )}
            </div>
            <div className="flex items-center gap-2 px-3 py-2">
                <Film className="h-4 w-4 flex-shrink-0 opacity-70" />
                <span className="min-w-0 flex-1 truncate text-xs font-semibold">{title || 'Video message'}</span>
                <span className="text-[10px] font-medium opacity-70">Preview</span>
            </div>
        </button>
    );
}

function ContactGalleryPanel({
    gallery,
    loading,
    onPreview,
}: {
    gallery: ContactGallery;
    loading: boolean;
    onPreview: (item: GalleryItem) => void;
}) {
    const [activeTab, setActiveTab] = useState<'media' | 'documents' | 'links'>('media');
    const tabs = [
        { id: 'media', label: 'Media', count: gallery.counts.media, icon: ImageIcon },
        { id: 'documents', label: 'Docs', count: gallery.counts.documents, icon: FileText },
        { id: 'links', label: 'Links', count: gallery.counts.links, icon: Link2 },
    ] as const;
    const items = activeTab === 'media' ? gallery.media : activeTab === 'documents' ? gallery.documents : gallery.links;

    return (
        <div className="space-y-3">
            <div className="grid grid-cols-3 gap-1 rounded-lg bg-gray-50 p-1 dark:bg-slate-800">
                {tabs.map(({ id, label, count, icon: Icon }) => (
                    <button
                        key={id}
                        type="button"
                        onClick={() => setActiveTab(id)}
                        className={`flex items-center justify-center gap-1.5 rounded-md px-2 py-1.5 text-[11px] font-semibold transition ${activeTab === id ? 'bg-white text-waify-text shadow-sm dark:bg-slate-900 dark:text-waify-dark-text' : 'text-waify-text-muted hover:text-waify-text dark:text-waify-dark-text-muted dark:hover:text-waify-dark-text'}`}
                    >
                        <Icon className="h-3.5 w-3.5" />
                        <span>{label}</span>
                        <span className="rounded bg-gray-100 px-1 text-[10px] dark:bg-slate-700">{count}</span>
                    </button>
                ))}
            </div>

            {loading ? (
                <div className="space-y-2">
                    {[0, 1, 2].map((item) => (
                        <div key={item} className="h-14 animate-pulse rounded-lg bg-gray-100 dark:bg-slate-800" />
                    ))}
                </div>
            ) : items.length === 0 ? (
                <div className="rounded-lg border border-dashed border-gray-200 p-5 text-center dark:border-waify-dark-border">
                    <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-gray-50 text-waify-text-muted dark:bg-slate-800 dark:text-waify-dark-text-muted">
                        {activeTab === 'links' ? <Link2 className="h-4 w-4" /> : activeTab === 'documents' ? <FileText className="h-4 w-4" /> : <ImageIcon className="h-4 w-4" />}
                    </div>
                    <p className="mt-2 text-xs font-medium text-waify-text dark:text-waify-dark-text">No {activeTab === 'documents' ? 'documents' : activeTab} yet</p>
                    <p className="mt-1 text-[11px] text-waify-text-muted dark:text-waify-dark-text-muted">Shared items from this chat will appear here.</p>
                </div>
            ) : activeTab === 'media' ? (
                <div className="grid grid-cols-3 gap-2">
                    {items.map((item) => {
                        const title = item.filename || item.title || `${item.type} message`;
                        return (
                            <button
                                key={item.id}
                                type="button"
                                onClick={() => item.url && onPreview(item)}
                                disabled={!item.url}
                                className="group relative aspect-square overflow-hidden rounded-lg bg-gray-100 text-left ring-1 ring-gray-100 transition hover:ring-waify-green/40 disabled:cursor-not-allowed dark:bg-slate-800 dark:ring-slate-700"
                                title={title}
                            >
                                {item.url && ['image', 'sticker'].includes(item.type) ? (
                                    <img src={item.url} alt={title} className="h-full w-full object-cover transition group-hover:scale-105" />
                                ) : (
                                    <span className="flex h-full w-full items-center justify-center text-waify-text-muted dark:text-waify-dark-text-muted">
                                        {item.type === 'video' ? <Film className="h-5 w-5" /> : item.type === 'audio' ? <Mic className="h-5 w-5" /> : <ImageIcon className="h-5 w-5" />}
                                    </span>
                                )}
                                {item.type === 'video' && <span className="absolute bottom-1 right-1 rounded bg-black/60 p-1 text-white"><Play className="h-3 w-3" /></span>}
                                {!item.url && <span className="absolute inset-x-1 bottom-1 truncate rounded bg-black/55 px-1 py-0.5 text-[9px] text-white">Not downloaded</span>}
                            </button>
                        );
                    })}
                </div>
            ) : activeTab === 'documents' ? (
                <div className="space-y-2">
                    {items.map((item) => (
                        <button
                            key={item.id}
                            type="button"
                            onClick={() => item.url && onPreview(item)}
                            disabled={!item.url}
                            className="flex w-full items-center gap-3 rounded-lg border border-gray-100 bg-white p-3 text-left transition hover:border-waify-green/40 disabled:cursor-not-allowed dark:border-waify-dark-border dark:bg-slate-800"
                        >
                            <span className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-md bg-gray-50 text-waify-text-muted dark:bg-slate-900 dark:text-waify-dark-text-muted"><FileIcon className="h-4 w-4" /></span>
                            <span className="min-w-0 flex-1">
                                <span className="block truncate text-xs font-semibold text-waify-text dark:text-waify-dark-text">{item.filename || item.title || 'Document'}</span>
                                <span className="block text-[11px] text-waify-text-muted dark:text-waify-dark-text-muted">{item.file_size ? formatFileSize(item.file_size) : item.mime_type || 'Document'}{item.created_at ? ` · ${new Date(item.created_at).toLocaleDateString()}` : ''}</span>
                            </span>
                            <ExternalLink className="h-3.5 w-3.5 flex-shrink-0 text-waify-text-muted" />
                        </button>
                    ))}
                </div>
            ) : (
                <div className="space-y-2">
                    {items.map((item) => (
                        <a
                            key={item.id}
                            href={item.url || '#'}
                            target="_blank"
                            rel="noreferrer"
                            className="flex items-start gap-3 rounded-lg border border-gray-100 bg-white p-3 text-left transition hover:border-waify-green/40 dark:border-waify-dark-border dark:bg-slate-800"
                        >
                            <span className="mt-0.5 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-md bg-gray-50 text-waify-text-muted dark:bg-slate-900 dark:text-waify-dark-text-muted"><Link2 className="h-4 w-4" /></span>
                            <span className="min-w-0 flex-1">
                                <span className="block truncate text-xs font-semibold text-waify-text dark:text-waify-dark-text">{item.title || item.url}</span>
                                <span className="block truncate text-[11px] text-waify-text-muted dark:text-waify-dark-text-muted">{item.url}</span>
                                {item.created_at && <span className="mt-1 block text-[10px] text-waify-text-muted dark:text-waify-dark-text-muted">{new Date(item.created_at).toLocaleString()}</span>}
                            </span>
                        </a>
                    ))}
                </div>
            )}
        </div>
    );
}

function InboxCallingPanel({
    conversation,
    calling,
    calls,
    callingReady,
}: {
    conversation: Conversation;
    calling: InboxCallingSettings;
    calls: InboxCallRecord[];
    callingReady: boolean;
}) {
    const status = conversation.connection.calling_enabled
        ? 'enabled'
        : conversation.connection.calling_status || 'unknown';
    const setupUrl = calling.setup_url || (typeof route !== 'undefined' ? route('app.whatsapp-calls.index') : '/app/whatsapp-calls');
    const { addToast } = useToast();
    const [callBusy, setCallBusy] = useState<string | null>(null);
    const peerRef = useRef<RTCPeerConnection | null>(null);
    const localStreamRef = useRef<MediaStream | null>(null);
    const remoteAudioRef = useRef<HTMLAudioElement | null>(null);

    const contactWaId = String(conversation.contact.wa_id || '').replace(/\D+/g, '');
    const canStartOutbound = callingReady && Boolean(calling.outbound_enabled ?? true);
    const connectionRouteKey = conversation.connection.slug || conversation.connection.id;
    const aiBridgeMode = ['ai_first', 'ai_only'].includes(calling.routing_mode || '');

    const stopLocalCall = () => {
        peerRef.current?.close();
        peerRef.current = null;
        localStreamRef.current?.getTracks().forEach((track) => track.stop());
        localStreamRef.current = null;
        if (remoteAudioRef.current) {
            remoteAudioRef.current.pause();
            remoteAudioRef.current.srcObject = null;
            remoteAudioRef.current = null;
        }
    };

    const createPeer = async () => {
        stopLocalCall();

        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        const peer = new RTCPeerConnection();
        stream.getTracks().forEach((track) => peer.addTrack(track, stream));
        peer.ontrack = (event) => {
            const [remoteStream] = event.streams;
            if (!remoteStream) return;
            const audio = remoteAudioRef.current || new Audio();
            audio.autoplay = true;
            audio.srcObject = remoteStream;
            remoteAudioRef.current = audio;
            void audio.play().catch(() => undefined);
        };

        peerRef.current = peer;
        localStreamRef.current = stream;

        return peer;
    };

    const waitForRemoteAnswer = async (callId: number, peer: RTCPeerConnection) => {
        for (let attempt = 0; attempt < 12; attempt += 1) {
            await new Promise((resolve) => window.setTimeout(resolve, 2000));
            const response = await axios.get(route('app.whatsapp-calls.calls.show', { call: callId }), { headers: { Accept: 'application/json' } });
            const sdp = callSessionSdpFrom(response.data);
            if (sdp && peer.signalingState !== 'stable') {
                await peer.setRemoteDescription({ type: 'answer', sdp });
                addToast({ title: 'WhatsApp call connected', variant: 'success' });
                return;
            }
        }

        addToast({
            title: 'Call is waiting',
            description: 'Meta has not returned the call answer yet. The call will still appear in call history.',
            variant: 'info',
        });
    };

    const checkCallPermission = async () => {
        if (!contactWaId) return;
        setCallBusy('permission-check');
        try {
            const response = await axios.post(route('app.whatsapp-calls.connections.call-permission.check', { connection: connectionRouteKey }), { to: contactWaId }, { headers: { Accept: 'application/json' } });
            addToast({
                title: 'Permission checked',
                description: response.data?.permission?.status || response.data?.message || 'WhatsApp returned the current call permission.',
                variant: 'success',
            });
        } catch (error: any) {
            addToast({ title: 'Permission check failed', description: error?.response?.data?.message || 'Please retry after checking Meta Calling setup.', variant: 'error' });
        } finally {
            setCallBusy(null);
        }
    };

    const requestCallPermission = async () => {
        if (!contactWaId) return;
        setCallBusy('permission-request');
        try {
            await axios.post(route('app.whatsapp-calls.connections.call-permission.request', { connection: connectionRouteKey }), {
                to: contactWaId,
                message: 'Can we call you on WhatsApp about this conversation?',
            }, { headers: { Accept: 'application/json' } });
            addToast({ title: 'Call permission request sent', variant: 'success' });
        } catch (error: any) {
            addToast({ title: 'Permission request failed', description: error?.response?.data?.message || 'Please retry after checking Meta Calling setup.', variant: 'error' });
        } finally {
            setCallBusy(null);
        }
    };

    const startOutboundCall = async () => {
        if (!canStartOutbound || !contactWaId) return;
        setCallBusy('start');
        try {
            if (aiBridgeMode) {
                await axios.post(route('app.whatsapp-calls.connections.calls.start', { connection: connectionRouteKey }), {
                    to: contactWaId,
                    bridge_mode: 'ai',
                }, { headers: { Accept: 'application/json' } });
                addToast({ title: 'AI voice call queued', description: 'The voice bridge worker will connect the WhatsApp call.', variant: 'success' });
                return;
            }

            const peer = await createPeer();
            const offer = await peer.createOffer({ offerToReceiveAudio: true });
            await peer.setLocalDescription(offer);
            const response = await axios.post(route('app.whatsapp-calls.connections.calls.start', { connection: connectionRouteKey }), {
                to: contactWaId,
                sdp: offer.sdp,
                sdp_type: 'offer',
                bridge_mode: 'browser',
            }, { headers: { Accept: 'application/json' } });
            addToast({ title: 'WhatsApp call started', description: 'Waiting for Meta to return the call answer.', variant: 'success' });
            const immediateAnswer = callSessionSdpFrom(response.data);
            if (immediateAnswer) {
                await peer.setRemoteDescription({ type: 'answer', sdp: immediateAnswer });
            } else if (response.data?.call?.id) {
                void waitForRemoteAnswer(Number(response.data.call.id), peer);
            }
        } catch (error: any) {
            stopLocalCall();
            addToast({ title: 'WhatsApp call failed', description: error?.response?.data?.message || error?.message || 'Please retry after checking microphone permission.', variant: 'error' });
        } finally {
            setCallBusy(null);
        }
    };

    const acceptInboundCall = async (call: InboxCallRecord) => {
        const offerSdp = callSessionSdpFrom(call);
        if (!offerSdp) {
            addToast({ title: 'Cannot answer yet', description: 'This call webhook did not include a WebRTC offer from Meta.', variant: 'warning' });
            return;
        }

        setCallBusy(`accept-${call.id}`);
        try {
            const peer = await createPeer();
            await peer.setRemoteDescription({ type: 'offer', sdp: offerSdp });
            const answer = await peer.createAnswer();
            await peer.setLocalDescription(answer);
            await axios.post(route('app.whatsapp-calls.calls.accept', { call: call.id }), {
                sdp: answer.sdp,
                sdp_type: 'answer',
            }, { headers: { Accept: 'application/json' } });
            addToast({ title: 'WhatsApp call answered', variant: 'success' });
        } catch (error: any) {
            stopLocalCall();
            addToast({ title: 'Answer failed', description: error?.response?.data?.message || error?.message || 'Please retry.', variant: 'error' });
        } finally {
            setCallBusy(null);
        }
    };

    const postCallAction = async (call: InboxCallRecord, action: 'reject' | 'terminate') => {
        setCallBusy(`${action}-${call.id}`);
        try {
            await axios.post(route(`app.whatsapp-calls.calls.${action}`, { call: call.id }), {}, { headers: { Accept: 'application/json' } });
            if (action === 'terminate') stopLocalCall();
            addToast({ title: action === 'reject' ? 'Call rejected' : 'Call ended', variant: 'success' });
        } catch (error: any) {
            addToast({ title: 'Call action failed', description: error?.response?.data?.message || 'Please retry.', variant: 'error' });
        } finally {
            setCallBusy(null);
        }
    };

    useEffect(() => stopLocalCall, [conversation.id]);

    return (
        <div className="space-y-3">
            <div className="rounded-lg border border-gray-100 bg-white p-3 dark:border-waify-dark-border dark:bg-slate-800">
                <div className="flex items-start justify-between gap-3">
                    <div>
                        <p className="text-sm font-semibold text-waify-text dark:text-waify-dark-text">WhatsApp Calling</p>
                        <p className="mt-1 text-xs text-waify-text-muted dark:text-waify-dark-text-muted">{conversation.connection.name}</p>
                    </div>
                    <Badge variant={callingReady ? 'success' : status === 'not_eligible' ? 'danger' : 'warning'}>
                        {callingReady ? 'ready' : status.replaceAll('_', ' ')}
                    </Badge>
                </div>
                <dl className="mt-3 space-y-2 text-xs">
                    <div className="flex justify-between gap-3"><dt className="text-waify-text-muted dark:text-waify-dark-text-muted">Module</dt><dd className="font-medium text-waify-text dark:text-waify-dark-text">{calling.enabled ? 'Enabled' : 'Off'}</dd></div>
                    <div className="flex justify-between gap-3"><dt className="text-waify-text-muted dark:text-waify-dark-text-muted">Route</dt><dd className="text-right font-medium text-waify-text dark:text-waify-dark-text">{(calling.routing_mode || 'ai_first').replaceAll('_', ' ')}</dd></div>
                    <div className="flex justify-between gap-3"><dt className="text-waify-text-muted dark:text-waify-dark-text-muted">Calls webhook</dt><dd className="font-medium text-waify-text dark:text-waify-dark-text">{conversation.connection.calling_webhook_subscribed ? 'Subscribed' : 'Not subscribed'}</dd></div>
                </dl>
                <div className="mt-3 grid gap-2">
                    {callingReady ? (
                        <div className="rounded-btn bg-emerald-50 px-3 py-2 text-center text-sm font-medium text-emerald-800 ring-1 ring-inset ring-emerald-100 dark:bg-emerald-500/10 dark:text-emerald-200 dark:ring-emerald-500/20">
                            WhatsApp Calling enabled
                        </div>
                    ) : (
                        <Link href={setupUrl} className="inline-flex h-9 items-center justify-center rounded-btn bg-waify-green px-3 text-sm font-medium text-white transition hover:bg-waify-green-dark">
                            Configure WhatsApp calling
                        </Link>
                    )}
                    {callingReady && (
                        <>
                            <button type="button" onClick={checkCallPermission} disabled={Boolean(callBusy)} className="inline-flex h-9 items-center justify-center rounded-btn bg-white px-3 text-sm font-medium text-waify-text ring-1 ring-inset ring-gray-200 transition hover:bg-gray-50 disabled:opacity-60 dark:bg-slate-900 dark:text-waify-dark-text dark:ring-waify-dark-border dark:hover:bg-slate-800">
                                Check call permission
                            </button>
                            <button type="button" onClick={requestCallPermission} disabled={Boolean(callBusy)} className="inline-flex h-9 items-center justify-center rounded-btn bg-white px-3 text-sm font-medium text-waify-text ring-1 ring-inset ring-gray-200 transition hover:bg-gray-50 disabled:opacity-60 dark:bg-slate-900 dark:text-waify-dark-text dark:ring-waify-dark-border dark:hover:bg-slate-800">
                                Request WhatsApp call
                            </button>
                            <button type="button" onClick={startOutboundCall} disabled={!canStartOutbound || Boolean(callBusy)} className="inline-flex h-9 items-center justify-center gap-2 rounded-btn bg-waify-green px-3 text-sm font-medium text-white transition hover:bg-waify-green-dark disabled:opacity-60">
                                <Phone className="h-4 w-4" />
                                Start WhatsApp call
                            </button>
                        </>
                    )}
                    {callingReady && (
                        <Link href={setupUrl} className="inline-flex h-9 items-center justify-center rounded-btn bg-white px-3 text-sm font-medium text-waify-text ring-1 ring-inset ring-gray-200 transition hover:bg-gray-50 dark:bg-slate-900 dark:text-waify-dark-text dark:ring-waify-dark-border dark:hover:bg-slate-800">
                            Calling settings
                        </Link>
                    )}
                </div>
            </div>

            {calls.length === 0 ? (
                <div className="rounded-lg border border-dashed border-gray-200 p-5 text-center dark:border-waify-dark-border">
                    <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-gray-50 text-waify-text-muted dark:bg-slate-800 dark:text-waify-dark-text-muted">
                        <Phone className="h-4 w-4" />
                    </div>
                    <p className="mt-2 text-xs font-medium text-waify-text dark:text-waify-dark-text">No WhatsApp call events</p>
                    <p className="mt-1 text-[11px] text-waify-text-muted dark:text-waify-dark-text-muted">Incoming call webhooks for this contact will appear here.</p>
                </div>
            ) : (
                <div className="space-y-2">
                    {calls.map((call) => (
                        <div key={call.id} className="rounded-lg border border-gray-100 bg-white p-3 text-xs dark:border-waify-dark-border dark:bg-slate-800">
                            <div className="flex items-start justify-between gap-3">
                                <div className="min-w-0">
                                    <p className="font-semibold capitalize text-waify-text dark:text-waify-dark-text">{call.direction} call</p>
                                    <p className="mt-1 text-waify-text-muted dark:text-waify-dark-text-muted">{call.created_at ? new Date(call.created_at).toLocaleString() : '-'}</p>
                                </div>
                                <Badge variant={['completed', 'answered'].includes(call.status) ? 'success' : ['failed', 'missed', 'rejected'].includes(call.status) ? 'danger' : 'warning'}>{call.status}</Badge>
                            </div>
                            <div className="mt-2 text-waify-text-muted dark:text-waify-dark-text-muted">
                                Routed to {call.agent?.name || call.routed_to || call.route_mode || 'not routed'}
                                {call.duration_seconds ? ` · ${Math.round(call.duration_seconds / 60)} min` : ''}
                            </div>
                            {callingReady && ['received', 'ringing', 'queued', 'initiated', 'answered'].includes(call.status) && (
                                <div className="mt-3 flex flex-wrap gap-2">
                                    {call.direction === 'inbound' && ['received', 'ringing', 'queued'].includes(call.status) && (
                                        <>
                                            <button type="button" onClick={() => acceptInboundCall(call)} disabled={Boolean(callBusy)} className="inline-flex h-8 items-center rounded-btn bg-waify-green px-3 text-[11px] font-medium text-white disabled:opacity-60">Answer</button>
                                            <button type="button" onClick={() => postCallAction(call, 'reject')} disabled={Boolean(callBusy)} className="inline-flex h-8 items-center rounded-btn bg-white px-3 text-[11px] font-medium text-red-700 ring-1 ring-inset ring-red-200 disabled:opacity-60 dark:bg-slate-900 dark:text-red-300 dark:ring-red-500/30">Reject</button>
                                        </>
                                    )}
                                    {['initiated', 'answered', 'ringing'].includes(call.status) && (
                                        <button type="button" onClick={() => postCallAction(call, 'terminate')} disabled={Boolean(callBusy)} className="inline-flex h-8 items-center rounded-btn bg-white px-3 text-[11px] font-medium text-waify-text ring-1 ring-inset ring-gray-200 disabled:opacity-60 dark:bg-slate-900 dark:text-waify-dark-text dark:ring-waify-dark-border">End call</button>
                                    )}
                                </div>
                            )}
                            {call.summary && <p className="mt-2 line-clamp-2 text-waify-text-muted dark:text-waify-dark-text-muted">{call.summary}</p>}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

function IncomingCallScreen({
    call,
    conversation,
    callingReady,
    onCallUpdated,
    onClose,
}: {
    call: InboxCallRecord;
    conversation?: Conversation | null;
    callingReady: boolean;
    onCallUpdated: (call: InboxCallRecord) => void;
    onClose: () => void;
}) {
    const { addToast } = useToast();
    const [busy, setBusy] = useState<'answer' | 'reject' | 'end' | null>(null);
    const [localStatus, setLocalStatus] = useState(call.status);
    const peerRef = useRef<RTCPeerConnection | null>(null);
    const localStreamRef = useRef<MediaStream | null>(null);
    const remoteAudioRef = useRef<HTMLAudioElement | null>(null);

    useEffect(() => {
        setLocalStatus(call.status);
    }, [call.status]);

    const stopLocalCall = () => {
        peerRef.current?.close();
        peerRef.current = null;
        localStreamRef.current?.getTracks().forEach((track) => track.stop());
        localStreamRef.current = null;
        if (remoteAudioRef.current) {
            remoteAudioRef.current.pause();
            remoteAudioRef.current.srcObject = null;
            remoteAudioRef.current = null;
        }
    };

    useEffect(() => stopLocalCall, []);

    const createPeer = async () => {
        stopLocalCall();
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        const peer = new RTCPeerConnection();
        stream.getTracks().forEach((track) => peer.addTrack(track, stream));
        peer.ontrack = (event) => {
            const [remoteStream] = event.streams;
            if (!remoteStream) return;
            const audio = remoteAudioRef.current || new Audio();
            audio.autoplay = true;
            audio.srcObject = remoteStream;
            remoteAudioRef.current = audio;
            void audio.play().catch(() => undefined);
        };
        peerRef.current = peer;
        localStreamRef.current = stream;

        return peer;
    };

    const acceptCall = async () => {
        const offerSdp = callSessionSdpFrom(call);
        if (!offerSdp) {
            addToast({ title: 'Cannot answer yet', description: 'Meta has not sent the call WebRTC offer yet.', variant: 'warning' });
            return;
        }

        setBusy('answer');
        try {
            const peer = await createPeer();
            await peer.setRemoteDescription({ type: 'offer', sdp: offerSdp });
            const answer = await peer.createAnswer();
            await peer.setLocalDescription(answer);
            const response = await axios.post(route('app.whatsapp-calls.calls.accept', { call: call.id }), {
                sdp: answer.sdp,
                sdp_type: 'answer',
            }, { headers: { Accept: 'application/json' } });
            const updated = response.data?.call;
            if (updated) onCallUpdated(updated);
            setLocalStatus('answered');
            addToast({ title: 'Call answered', variant: 'success' });
        } catch (error: any) {
            stopLocalCall();
            addToast({ title: 'Answer failed', description: error?.response?.data?.message || error?.message || 'Please retry.', variant: 'error' });
        } finally {
            setBusy(null);
        }
    };

    const postAction = async (action: 'reject' | 'terminate') => {
        setBusy(action === 'reject' ? 'reject' : 'end');
        try {
            const response = await axios.post(route(`app.whatsapp-calls.calls.${action}`, { call: call.id }), {}, { headers: { Accept: 'application/json' } });
            const updated = response.data?.call;
            if (updated) onCallUpdated(updated);
            stopLocalCall();
            setLocalStatus(action === 'reject' ? 'rejected' : 'completed');
            addToast({ title: action === 'reject' ? 'Call rejected' : 'Call ended', variant: 'success' });
            onClose();
        } catch (error: any) {
            addToast({ title: 'Call action failed', description: error?.response?.data?.message || 'Please retry.', variant: 'error' });
        } finally {
            setBusy(null);
        }
    };

    const displayName = conversation?.contact.name || call.contact_name || call.phone_number || 'WhatsApp caller';
    const displayPhone = conversation?.contact.wa_id || call.phone_number || '';
    const isAnswered = localStatus === 'answered';
    const isActionable = isIncomingActionableCall({ ...call, status: localStatus });
    const isAiRouted = call.routed_to === 'ai_agent' || ['ai_first', 'ai_only'].includes(String(call.route_mode || ''));
    const statusText = isAnswered
        ? (isAiRouted ? `AI connected${call.agent?.name ? `: ${call.agent.name}` : ''}` : 'Connected')
        : `${localStatus.replaceAll('_', ' ')} incoming`;

    return (
        <div className="fixed inset-0 z-[360] flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-sm" role="dialog" aria-modal="true">
            <div className="relative flex min-h-[560px] w-full max-w-sm flex-col overflow-hidden rounded-[28px] bg-slate-950 text-white shadow-2xl ring-1 ring-white/10">
                <div className="absolute inset-x-0 top-0 h-48 bg-gradient-to-b from-emerald-500/35 to-transparent" />
                <div className="relative flex flex-1 flex-col items-center px-6 py-8 text-center">
                    <div className="mb-6 flex w-full items-center justify-between text-xs text-white/60">
                        <span>WhatsApp call</span>
                        <button type="button" onClick={onClose} className="flex h-8 w-8 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-white/15" aria-label="Hide call screen">
                            <X className="h-4 w-4" />
                        </button>
                    </div>
                    <div className="relative">
                        {isActionable && <span className="absolute inset-0 animate-ping rounded-full bg-emerald-400/30" />}
                        <div className="relative flex h-28 w-28 items-center justify-center rounded-full bg-emerald-500 text-4xl font-semibold shadow-xl shadow-emerald-950/40">
                            {(String(displayName).trim().charAt(0) || 'C').toUpperCase()}
                        </div>
                    </div>
                    <h2 className="mt-6 max-w-full truncate text-2xl font-semibold">{displayName}</h2>
                    <p className="mt-1 text-sm text-white/65">{displayPhone}</p>
                    <div className="mt-4 rounded-full bg-white/10 px-3 py-1 text-xs font-medium text-white/80">
                        {statusText}
                    </div>
                    {isAnswered && isAiRouted && (
                        <p className="mt-3 max-w-xs text-xs leading-5 text-white/55">
                            AI is handling this call. Switch routing to human first if agents should answer before AI.
                        </p>
                    )}

                    <div className="mt-auto grid w-full grid-cols-3 gap-4 pb-2">
                        <button type="button" disabled className="flex flex-col items-center gap-2 text-xs text-white/45">
                            <span className="flex h-14 w-14 items-center justify-center rounded-full bg-white/10"><Mic className="h-5 w-5" /></span>
                            Mute
                        </button>
                        {isActionable ? (
                            <button type="button" onClick={acceptCall} disabled={!callingReady || Boolean(busy)} className="flex flex-col items-center gap-2 text-xs font-medium text-white disabled:opacity-60">
                                <span className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500 shadow-lg shadow-emerald-950/50"><Phone className="h-6 w-6" /></span>
                                {busy === 'answer' ? 'Answering' : 'Answer'}
                            </button>
                        ) : (
                            <button type="button" disabled className="flex flex-col items-center gap-2 text-xs font-medium text-white/55">
                                <span className="flex h-16 w-16 items-center justify-center rounded-full bg-white/10"><Phone className="h-6 w-6" /></span>
                                Connected
                            </button>
                        )}
                        <button type="button" onClick={() => void postAction(isActionable ? 'reject' : 'terminate')} disabled={Boolean(busy)} className="flex flex-col items-center gap-2 text-xs font-medium text-white disabled:opacity-60">
                            <span className="flex h-14 w-14 items-center justify-center rounded-full bg-red-500 shadow-lg shadow-red-950/50"><Phone className="h-5 w-5 rotate-[135deg]" /></span>
                            {isActionable ? (busy === 'reject' ? 'Rejecting' : 'Reject') : (busy === 'end' ? 'Ending' : 'End')}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

const resolveMediaType = (file: File): 'image' | 'video' | 'audio' | 'document' => {
    const mime = (file.type || '').toLowerCase();
    const extension = fileExtension(file);

    if (mime.startsWith('image/')) return 'image';
    if (mime.startsWith('audio/') || mime === 'application/ogg') return 'audio';
    if (mime.startsWith('video/')) return 'video';
    if (IMAGE_EXTENSIONS.has(extension)) return 'image';
    if (AUDIO_EXTENSIONS.has(extension) && extension !== 'mp4') return 'audio';
    if (VIDEO_EXTENSIONS.has(extension)) return 'video';

    return 'document';
};

type LocationMapState = {
    lat: number;
    lng: number;
    zoom: number;
};

type LocationSearchResult = {
    label: string;
    lat: number;
    lng: number;
};

const LOCATION_MAP_WIDTH = 336;
const LOCATION_MAP_HEIGHT = 192;
const LOCATION_TILE_SIZE = 256;

const clampLocationLat = (lat: number) => Math.max(-85, Math.min(85, lat));
const clampLocationLng = (lng: number) => ((((lng + 180) % 360) + 360) % 360) - 180;

const locationToWorldPixel = (lat: number, lng: number, zoom: number) => {
    const scale = LOCATION_TILE_SIZE * (2 ** zoom);
    const clampedLat = clampLocationLat(lat);
    const sin = Math.sin((clampedLat * Math.PI) / 180);

    return {
        x: ((clampLocationLng(lng) + 180) / 360) * scale,
        y: (0.5 - Math.log((1 + sin) / (1 - sin)) / (4 * Math.PI)) * scale,
    };
};

const worldPixelToLocation = (x: number, y: number, zoom: number) => {
    const scale = LOCATION_TILE_SIZE * (2 ** zoom);
    const lng = (x / scale) * 360 - 180;
    const n = Math.PI - (2 * Math.PI * y) / scale;
    const lat = (180 / Math.PI) * Math.atan(0.5 * (Math.exp(n) - Math.exp(-n)));

    return {
        lat: clampLocationLat(lat),
        lng: clampLocationLng(lng),
    };
};

const locationMapTiles = (center: LocationMapState) => {
    const centerPixel = locationToWorldPixel(center.lat, center.lng, center.zoom);
    const minX = Math.floor((centerPixel.x - LOCATION_MAP_WIDTH / 2) / LOCATION_TILE_SIZE);
    const maxX = Math.floor((centerPixel.x + LOCATION_MAP_WIDTH / 2) / LOCATION_TILE_SIZE);
    const minY = Math.floor((centerPixel.y - LOCATION_MAP_HEIGHT / 2) / LOCATION_TILE_SIZE);
    const maxY = Math.floor((centerPixel.y + LOCATION_MAP_HEIGHT / 2) / LOCATION_TILE_SIZE);
    const tileCount = 2 ** center.zoom;
    const tiles: Array<{ key: string; url: string; left: number; top: number }> = [];

    for (let x = minX; x <= maxX; x += 1) {
        for (let y = minY; y <= maxY; y += 1) {
            if (y < 0 || y >= tileCount) continue;
            const wrappedX = ((x % tileCount) + tileCount) % tileCount;
            tiles.push({
                key: `${center.zoom}-${x}-${y}`,
                url: `https://tile.openstreetmap.org/${center.zoom}/${wrappedX}/${y}.png`,
                left: (x * LOCATION_TILE_SIZE) - (centerPixel.x - LOCATION_MAP_WIDTH / 2),
                top: (y * LOCATION_TILE_SIZE) - (centerPixel.y - LOCATION_MAP_HEIGHT / 2),
            });
        }
    }

    return tiles;
};

export default function ConversationsIndex({
    account,
    conversations: initialConversations,
    connections,
    agents: initialAgents = [],
    templates = [],
    catalog_products: catalogProducts = [],
    saved_buttons: savedButtons = [],
    saved_lists: savedLists = [],
    saved_forms: savedForms = [],
    ai_agents: aiAgents = [],
    filters: initialFilters = { search: '' },
    ai_available: aiAvailable = false,
    whatsapp_calling: whatsappCalling = { enabled: false },
    recent_calls: recentCalls = [],
    selected_conversation_id: selectedConversationId = null,
    new_chat_open: newChatOpen = false,
}: {
    account: any;
    conversations: {
        data: Conversation[];
        links: any;
        meta: any;
    };
    connections?: Array<{ id: number; name: string }>;
    agents?: Agent[];
    templates?: TemplateOption[];
    catalog_products?: CatalogProductOption[];
    saved_buttons?: SavedButtonOption[];
    saved_lists?: SavedListOption[];
    saved_forms?: SavedFormOption[];
    ai_agents?: AiAgentOption[];
    filters?: { search?: string; assignee?: string; status?: string; connection_id?: string | number };
    ai_available?: boolean;
    whatsapp_calling?: InboxCallingSettings;
    recent_calls?: InboxCallRecord[];
    selected_conversation_id?: number | null;
    new_chat_open?: boolean;
}) {
    const { subscribe, connected } = useRealtime();
    const { addToast } = useToast();
    const confirm = useConfirm();
    const { auth, workspace_permissions } = usePage().props as any;
    const currentUserId = auth?.user?.id;
    const canDeleteChats = Boolean(workspace_permissions?.['chats.delete']);
    const notifyAssignmentEnabled = auth?.user?.notify_assignment_enabled ?? true;
    const soundEnabled = auth?.user?.notify_sound_enabled ?? true;
    const aiSuggestionsEnabled = auth?.user?.ai_suggestions_enabled ?? false;
    const platformAiEnabled = Boolean((usePage().props as any)?.ai?.enabled ?? false);
    const [conversations, setConversations] = useState<Conversation[]>(
        normalizeConversationList(initialConversations?.data)
    );
    const [recentCallsState, setRecentCallsState] = useState<InboxCallRecord[]>(Array.isArray(recentCalls) ? recentCalls : []);
    const [dismissedCallIds, setDismissedCallIds] = useState<Set<number>>(new Set());
    const [notificationPermission, setNotificationPermission] = useState<NotificationPermission>(
        typeof window !== 'undefined' && 'Notification' in window ? Notification.permission : 'denied'
    );
    const [loading] = useState(false);
    const [searchQuery, setSearchQuery] = useState(initialFilters?.search ?? '');
    const [statusFilter, setStatusFilter] = useState<string>(initialFilters?.status ?? 'all');
    const [connectionFilter, setConnectionFilter] = useState<number | 'all'>(
        initialFilters?.connection_id !== undefined && initialFilters?.connection_id !== 'all'
            ? Number(initialFilters.connection_id)
            : 'all'
    );
    const [labelFilter, setLabelFilter] = useState<string>('all');
    const [bulkMode, setBulkMode] = useState(false);
    const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
    const [assigneeFilter, setAssigneeFilter] = useState<'all' | 'me' | 'unassigned'>(
        (initialFilters?.assignee as 'all' | 'me' | 'unassigned') ?? 'all'
    );
    const [assigningId, setAssigningId] = useState<number | null>(null);
    const [activeId, setActiveId] = useState<number | null>(selectedConversationId ? Number(selectedConversationId) : null);
    const [mobileShowDetail, setMobileShowDetail] = useState(false);
    const [showContactPanel, setShowContactPanel] = useState(true);
    const [mobileContactPanelOpen, setMobileContactPanelOpen] = useState(false);
    const [editingContact, setEditingContact] = useState(false);
    const [savingContact, setSavingContact] = useState(false);
    const [contactForm, setContactForm] = useState({
        name: '',
        email: '',
        phone: '',
        company: '',
        status: 'active',
        notes: '',
    });
    const [actionsMenuOpen, setActionsMenuOpen] = useState(false);
    const [starredOnly, setStarredOnly] = useState(false);
    const [contactTab, setContactTab] = useState<'profile' | 'media' | 'calls' | 'notes' | 'activity' | 'orders'>('profile');
    const [showNewChat, setShowNewChat] = useState(Boolean(newChatOpen));
    const [newChatForm, setNewChatForm] = useState({
        name: '',
        wa_id: '',
        connection_id: connections?.[0]?.id ? String(connections[0].id) : '',
    });
    const [creatingChat, setCreatingChat] = useState(false);
    const [deletingConversationId, setDeletingConversationId] = useState<number | null>(null);
    const [messagesByConversation, setMessagesByConversation] = useState<Record<number, ChatMessage[]>>({});
    const [loadingConversationId, setLoadingConversationId] = useState<number | null>(null);
    const [messageReactions, setMessageReactions] = useState<Record<string, string>>({});
    const [mediaPreview, setMediaPreview] = useState<MediaPreview | null>(null);
    const [galleryByConversation, setGalleryByConversation] = useState<Record<number, ContactGallery>>({});
    const [galleryLoadingId, setGalleryLoadingId] = useState<number | null>(null);
    const [replyWindowNow, setReplyWindowNow] = useState(() => Date.now());
    const [messageDraft, setMessageDraft] = useState('');
    const [replyTo, setReplyTo] = useState<ChatMessage | null>(null);
    const [selectedAiAgentId, setSelectedAiAgentId] = useState<number | 'default'>(
        aiAgents.length > 0 ? aiAgents[0].id : 'default'
    );
    const [aiAgentMenuOpen, setAiAgentMenuOpen] = useState(false);
    const [sendingMessage, setSendingMessage] = useState(false);
    const [noteMode, setNoteMode] = useState(false);
    const [showEmoji, setShowEmoji] = useState(false);
    const [showAttachments, setShowAttachments] = useState(false);
    const [showLocationPicker, setShowLocationPicker] = useState(false);
    const [showTemplates, setShowTemplates] = useState(false);
    const [showQuickReplies, setShowQuickReplies] = useState(false);
    const [showInteractiveComposer, setShowInteractiveComposer] = useState(false);
    const [interactiveMode, setInteractiveMode] = useState<InteractiveMode>('buttons');
    const [savedButtonOptions, setSavedButtonOptions] = useState<SavedButtonOption[]>(Array.isArray(savedButtons) ? savedButtons : []);
    const [newInteractiveButtonLabel, setNewInteractiveButtonLabel] = useState('');
    const [savingInteractiveButton, setSavingInteractiveButton] = useState(false);
    const [interactiveDraft, setInteractiveDraft] = useState({
        header_text: '',
        body_text: 'How can we help you?',
        footer_text: '',
        buttons: ['Talk to sales', 'Support'],
        saved_button_ids: [] as number[],
        list_id: '',
        list_button_text: 'Choose',
        rows: ['Pricing', 'Book demo', 'Talk to support'],
        form_id: '',
        form_button_text: 'Open form',
        product_id: '',
        catalog_id: '',
        product_retailer_id: '',
        cta_display_text: 'Open link',
        cta_url: '',
        payment_amount: '',
        payment_description: 'WhatsApp payment request',
        payment_button_text: 'Pay now',
        payment_expire_after_days: '',
        contact_name: 'Zyptos Support',
        contact_phone: '',
        contact_email: '',
    });
    const [attachments, setAttachments] = useState<File[]>([]);
    const [aiSuggestLoading, setAiSuggestLoading] = useState(false);
    const [filePickerAccept, setFilePickerAccept] = useState<string | undefined>();
    const [locationInput, setLocationInput] = useState({ label: '', latitude: '', longitude: '' });
    const [locationMap, setLocationMap] = useState<LocationMapState>({ lat: 28.6139, lng: 77.209, zoom: 12 });
    const [locationSearch, setLocationSearch] = useState('');
    const [locationResults, setLocationResults] = useState<LocationSearchResult[]>([]);
    const [locationSearching, setLocationSearching] = useState(false);
    const [recordingVoice, setRecordingVoice] = useState(false);

    useEffect(() => {
        setSavedButtonOptions(Array.isArray(savedButtons) ? savedButtons : []);
    }, [savedButtons]);
    const messagesEndRef = useRef<HTMLDivElement | null>(null);
    const composerRef = useRef<HTMLDivElement | null>(null);
    const attachmentPreviewRef = useRef<HTMLDivElement | null>(null);
    const fileInputRef = useRef<HTMLInputElement | null>(null);
    const voiceStreamRef = useRef<MediaStream | null>(null);
    const voiceAudioContextRef = useRef<AudioContext | null>(null);
    const voiceProcessorRef = useRef<ScriptProcessorNode | null>(null);
    const voiceSourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
    const voiceSamplesRef = useRef<Float32Array[]>([]);
    const agents: Agent[] = Array.isArray(initialAgents) ? initialAgents : [];
    const lastPollRef = useRef<Date>(new Date(Date.now() - 15000));
    const messagesByConversationRef = useRef<Record<number, ChatMessage[]>>({});
    const conversationFetchSequenceRef = useRef<Record<number, number>>({});
    const conversationStatusCursorRef = useRef<Record<number, string>>({});
    const processedMessageIds = useRef<Set<string>>(new Set());
    const browserNotificationIds = useRef<Set<string>>(new Set());
    const browserCallNotificationIds = useRef<Set<string>>(new Set());
    const assignmentStateRef = useRef<Map<number, number | null>>(
        new Map(normalizeConversationList(initialConversations?.data).map((c) => [c.id, c.assigned_to ?? null]))
    );
    const handoffStateRef = useRef<Map<number, string | null>>(
        new Map(normalizeConversationList(initialConversations?.data).map((c) => [c.id, c.handoff_status ?? null]))
    );

    useEffect(() => {
        messagesByConversationRef.current = messagesByConversation;
    }, [messagesByConversation]);

    useEffect(() => {
        const interval = window.setInterval(() => setReplyWindowNow(Date.now()), 60000);
        return () => window.clearInterval(interval);
    }, []);

    const closeComposerPopovers = useCallback(() => {
        setShowEmoji(false);
        setShowAttachments(false);
        setShowLocationPicker(false);
        setShowTemplates(false);
        setShowQuickReplies(false);
        setShowInteractiveComposer(false);
        setAiAgentMenuOpen(false);
    }, []);

    useEffect(() => {
        const hasOpenPopover = showEmoji
            || showAttachments
            || showLocationPicker
            || showTemplates
            || showQuickReplies
            || showInteractiveComposer
            || aiAgentMenuOpen;

        if (!hasOpenPopover) return;

        const handlePointerDown = (event: PointerEvent) => {
            const target = event.target;
            if (target instanceof Node && composerRef.current?.contains(target)) {
                return;
            }

            closeComposerPopovers();
        };

        document.addEventListener('pointerdown', handlePointerDown);
        return () => document.removeEventListener('pointerdown', handlePointerDown);
    }, [
        aiAgentMenuOpen,
        closeComposerPopovers,
        showAttachments,
        showEmoji,
        showInteractiveComposer,
        showLocationPicker,
        showQuickReplies,
        showTemplates,
    ]);

    useEffect(() => {
        const hasOpenPopover = showEmoji
            || showAttachments
            || showLocationPicker
            || showTemplates
            || showQuickReplies
            || showInteractiveComposer
            || aiAgentMenuOpen;

        if (!hasOpenPopover) return;

        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                closeComposerPopovers();
            }
        };

        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [
        aiAgentMenuOpen,
        closeComposerPopovers,
        showAttachments,
        showEmoji,
        showInteractiveComposer,
        showLocationPicker,
        showQuickReplies,
        showTemplates,
    ]);

    useEffect(() => {
        closeComposerPopovers();
    }, [activeId, noteMode, closeComposerPopovers]);

    const playNotificationSound = useCallback(() => {
        if (!soundEnabled) return;
        try {
            const AudioContextRef = (window as any).AudioContext || (window as any).webkitAudioContext;
            if (!AudioContextRef) return;
            const context = new AudioContextRef();
            const gain = context.createGain();
            gain.gain.value = 0.12;
            gain.connect(context.destination);

            [0, 0.16].forEach((offset, index) => {
                const oscillator = context.createOscillator();
                oscillator.type = 'sine';
                oscillator.frequency.value = index === 0 ? 880 : 1174;
                oscillator.connect(gain);
                oscillator.start(context.currentTime + offset);
                oscillator.stop(context.currentTime + offset + 0.14);
            });
            window.setTimeout(() => void context.close?.(), 420);
        } catch (error) {
            if (inboxDebug) {
                console.warn('[Notifications] Unable to play sound', error);
            }
        }
    }, [soundEnabled]);

    const playCallRing = useCallback(() => {
        if (!soundEnabled) return;
        try {
            const AudioContextRef = (window as any).AudioContext || (window as any).webkitAudioContext;
            if (!AudioContextRef) return;
            const context = new AudioContextRef();
            const gain = context.createGain();
            gain.gain.value = 0.045;
            gain.connect(context.destination);

            [0, 0.18, 0.42].forEach((offset, index) => {
                const oscillator = context.createOscillator();
                oscillator.type = 'sine';
                oscillator.frequency.value = index === 1 ? 720 : 560;
                oscillator.connect(gain);
                oscillator.start(context.currentTime + offset);
                oscillator.stop(context.currentTime + offset + 0.14);
            });
        } catch (error) {
            if (inboxDebug) {
                console.warn('[Calls] Unable to play ringtone', error);
            }
        }
    }, [soundEnabled]);

    const requestBrowserNotifications = useCallback(async () => {
        if (typeof window === 'undefined' || !('Notification' in window)) {
            addToast({ title: 'Browser notifications unavailable', description: 'This browser does not support notifications.', variant: 'warning' });
            return;
        }

        const permission = await Notification.requestPermission();
        setNotificationPermission(permission);
        if (permission === 'granted') {
            playNotificationSound();
        }
        addToast({
            title: permission === 'granted' ? 'Browser notifications enabled' : 'Browser notifications blocked',
            description: permission === 'granted' ? 'Incoming messages and calls will show browser alerts and play sound.' : 'Enable notifications from browser site settings to receive call alerts.',
            variant: permission === 'granted' ? 'success' : 'warning',
        });
    }, [addToast, playNotificationSound]);

    const showBrowserNotification = useCallback((id: string, title: string, body?: string, conversationId?: number) => {
        if (typeof window === 'undefined' || !('Notification' in window)) return;
        if (Notification.permission !== 'granted') return;
        if (browserNotificationIds.current.has(id)) return;

        browserNotificationIds.current.add(id);
        if (browserNotificationIds.current.size > 80) {
            const ids = Array.from(browserNotificationIds.current);
            browserNotificationIds.current = new Set(ids.slice(-40));
        }

        const notification = new Notification(title, {
            body,
            tag: id,
            icon: '/favicon.ico',
            badge: '/favicon.ico',
            silent: false,
            renotify: true,
        } as NotificationOptions & { renotify?: boolean });

        notification.onclick = () => {
            window.focus();
            if (conversationId) {
                router.get(route('app.whatsapp.conversations.index', { conversation: conversationId }), {}, {
                    preserveState: true,
                    preserveScroll: true,
                });
            }
            notification.close();
        };
    }, []);

    const notifyInboundMessage = useCallback((payload: {
        id: string;
        conversationId?: number;
        contactName?: string | null;
        preview?: string | null;
        activeConversationId?: number | null;
    }) => {
        const title = payload.contactName ? `New message from ${payload.contactName}` : 'New WhatsApp message';
        const description = payload.preview || 'Open inbox to reply.';

        addToast({
            title: 'New message',
            description: payload.contactName ? `From ${payload.contactName}` : description,
            variant: 'info',
            duration: 3000,
        });
        playNotificationSound();

        if (notificationPermission === 'granted' || (typeof Notification !== 'undefined' && Notification.permission === 'granted')) {
            showBrowserNotification(payload.id, title, description, payload.conversationId);
        }
    }, [addToast, notificationPermission, playNotificationSound, showBrowserNotification]);

    const notifyIncomingCall = useCallback((call: InboxCallRecord, conversation?: Conversation | null) => {
        const id = `call-${call.id}-${call.status}`;
        if (browserCallNotificationIds.current.has(id)) return;
        browserCallNotificationIds.current.add(id);
        if (browserCallNotificationIds.current.size > 50) {
            const ids = Array.from(browserCallNotificationIds.current);
            browserCallNotificationIds.current = new Set(ids.slice(-25));
        }

        const caller = conversation?.contact.name || call.contact_name || call.phone_number || 'WhatsApp caller';
        addToast({
            title: 'Incoming WhatsApp call',
            description: String(caller),
            variant: 'info',
            duration: 6000,
        });
        playCallRing();
        showBrowserNotification(id, 'Incoming WhatsApp call', String(caller), conversation?.id);
    }, [addToast, playCallRing, showBrowserNotification]);

    const parseMessageDate = (value: string | null) => {
        if (!value) return null;
        const date = new Date(value);
        return Number.isNaN(date.getTime()) ? null : date;
    };

    const formatTime = (value: string | null) => {
        const date = parseMessageDate(value);
        if (!date) return '';
        return new Intl.DateTimeFormat(undefined, { hour: '2-digit', minute: '2-digit' }).format(date);
    };

    const formatDateKey = (value: string | null) => {
        const date = parseMessageDate(value);
        if (!date) return 'unknown';
        return `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;
    };

    const formatDateLabel = (value: string | null) => {
        const date = parseMessageDate(value);
        if (!date) return 'Unknown date';

        const today = new Date();
        const yesterday = new Date();
        yesterday.setDate(today.getDate() - 1);

        if (formatDateKey(value) === formatDateKey(today.toISOString())) return 'Today';
        if (formatDateKey(value) === formatDateKey(yesterday.toISOString())) return 'Yesterday';

        return new Intl.DateTimeFormat(undefined, {
            day: '2-digit',
            month: 'short',
            year: date.getFullYear() === today.getFullYear() ? undefined : 'numeric',
        }).format(date);
    };

    const formatExactDateTime = (value: string | null) => {
        const date = parseMessageDate(value);
        if (!date) return '';
        return new Intl.DateTimeFormat(undefined, {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        }).format(date);
    };

    const formatRelative = (value: string | null) => {
        if (!value) return '';
        const diff = Date.now() - new Date(value).getTime();
        const minutes = Math.max(1, Math.round(diff / 60000));
        if (minutes < 60) return `${minutes}m`;
        const hours = Math.round(minutes / 60);
        if (hours < 24) return `${hours}h`;
        return `${Math.round(hours / 24)}d`;
    };

    const api = typeof window !== 'undefined' && (window as any).axios ? (window as any).axios : axios;

    const fetchInboxStreamAndMerge = useCallback(() => {
        if (!account?.id) return;
        const since = lastPollRef.current.toISOString();
        api.get(route('app.whatsapp.inbox.stream', {}), { params: { since } })
            .then((response: any) => {
                const list = response.data?.updated_conversations;
                const currentAccountId = account?.id;
                if (list?.length) {
                    setConversations((prev) => {
                        const byId = new Map(prev.map((c) => [c.id, c]));
                        list.forEach((conv: any) => {
                            const normalized = normalizeConversation(conv);
                            if (!normalized) return;
                            if (
                                currentAccountId != null &&
                                normalized.account_id != null &&
                                !isSameAccountId(normalized.account_id, currentAccountId)
                            ) {
                                return;
                            }
                            const existing = byId.get(normalized.id);
                            byId.set(normalized.id, existing
                                ? {
                                    ...existing,
                                    ...normalized,
                                    last_inbound_message_at: mergeLastInboundAt(existing.last_inbound_message_at, normalized.last_inbound_message_at),
                                }
                                : normalized);
                        });
                        return Array.from(byId.values()).sort((a, b) => {
                            const timeA = a.last_message_at ? new Date(a.last_message_at).getTime() : 0;
                            const timeB = b.last_message_at ? new Date(b.last_message_at).getTime() : 0;
                            return timeB - timeA;
                        });
                    });
                }

                const notifications = Array.isArray(response.data?.new_message_notifications)
                    ? response.data.new_message_notifications
                    : [];
                notifications.forEach((item: any) => {
                    const conversationId = Number(item.conversation_id);
                    const eventId = `poll-inbound-${conversationId}-${item.last_activity_at || ''}`;
                    if (!Number.isFinite(conversationId) || processedMessageIds.current.has(eventId)) return;
                    processedMessageIds.current.add(eventId);
                    notifyInboundMessage({
                        id: eventId,
                        conversationId,
                        contactName: item.contact?.name || item.contact?.wa_id || null,
                        preview: item.last_message_preview || null,
                        activeConversationId: activeId,
                    });
                });
                const updatedCalls = Array.isArray(response.data?.updated_calls)
                    ? response.data.updated_calls
                    : [];
                if (updatedCalls.length) {
                    setRecentCallsState((prev) => mergeCallRecords(prev, updatedCalls));
                }
                const serverTime = new Date(response.data?.server_time || new Date()).getTime();
                lastPollRef.current = new Date((Number.isFinite(serverTime) ? serverTime : Date.now()) - 10000);
            })
            .catch((err: any) => {
                if (inboxDebug) {
                    console.warn('[Inbox] Stream fetch failed:', err?.message);
                }
            });
    }, [account?.id, activeId, notifyInboundMessage]);

    // Keep state in sync with server payload (in case of hydration/props mismatch)
    useEffect(() => {
        setConversations(normalizeConversationList(initialConversations?.data));
    }, [initialConversations]);

    useEffect(() => {
        setRecentCallsState(Array.isArray(recentCalls) ? recentCalls : []);
    }, [recentCalls]);

    // Backend search: debounce and reload with search param
    const lastSearchRef = useRef(initialFilters?.search ?? '');
    useEffect(() => {
        const t = setTimeout(() => {
            if (searchQuery === lastSearchRef.current) return;
            lastSearchRef.current = searchQuery;
            router.get(route('app.whatsapp.conversations.index', {}), {
                search: searchQuery || undefined,
                assignee: assigneeFilter !== 'all' ? assigneeFilter : undefined,
                status: statusFilter !== 'all' ? statusFilter : undefined,
                connection_id: connectionFilter !== 'all' ? connectionFilter : undefined,
            }, { preserveState: true });
        }, 400);
        return () => clearTimeout(t);
    }, [searchQuery]);

    // Reload when assignee, status, or connection filter changes (server-side filter for correct pagination)
    const lastFiltersRef = useRef({ assignee: assigneeFilter, status: statusFilter, connection_id: connectionFilter });
    useEffect(() => {
        if (
            lastFiltersRef.current.assignee === assigneeFilter &&
            lastFiltersRef.current.status === statusFilter &&
            lastFiltersRef.current.connection_id === connectionFilter
        ) {
            return;
        }
        lastFiltersRef.current = { assignee: assigneeFilter, status: statusFilter, connection_id: connectionFilter };
        router.get(route('app.whatsapp.conversations.index', {}), {
            search: searchQuery || undefined,
            assignee: assigneeFilter !== 'all' ? assigneeFilter : undefined,
            status: statusFilter !== 'all' ? statusFilter : undefined,
            connection_id: connectionFilter !== 'all' ? connectionFilter : undefined,
        }, { preserveState: true });
    }, [assigneeFilter, statusFilter, connectionFilter]);

    // Filter conversations (client-side for status/connection; search is server-side when we use backend)
    const filteredConversations = useMemo(() => {
        return conversations.filter((conv) => {
            // Only show conversations for current account (avoid 404 when clicking)
            if (conv.account_id != null && account?.id != null && !isSameAccountId(conv.account_id, account.id)) {
                return false;
            }
            // Client-side search only when we have server results (backend already filtered by search; client refines by status/connection)
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

            // Assignee filter
            if (assigneeFilter === 'me') {
                if (currentUserId == null || conv.assigned_to !== currentUserId) return false;
            } else if (assigneeFilter === 'unassigned') {
                if (conv.assigned_to != null) return false;
            }

            if (starredOnly && conv.priority !== 'urgent') {
                return false;
            }

            if (labelFilter !== 'all' && !getConversationLabels(conv).includes(labelFilter)) {
                return false;
            }

            return true;
        });
    }, [conversations, account?.id, searchQuery, statusFilter, connectionFilter, assigneeFilter, currentUserId, starredOnly, labelFilter]);

    const activeConversation = useMemo(() => {
        return filteredConversations.find((conversation) => conversation.id === activeId) ?? filteredConversations[0] ?? null;
    }, [filteredConversations, activeId]);

    const activeMessages = activeConversation ? messagesByConversation[activeConversation.id] ?? [] : [];
    const activeConversationLoading = Boolean(activeConversation && loadingConversationId === activeConversation.id);
    const activeAutomationState = activeConversation?.automation_state ?? null;
    const activeBotIsReplying = Boolean(activeConversation?.automation_processing);
    const activeManualMode = Boolean(activeConversation?.bot_paused || activeConversation?.handoff_status === 'manual');
    const activeAgentName = activeConversation?.assigned_to
        ? (agents.find((agent) => agent.id === activeConversation.assigned_to)?.name ?? 'Assigned')
        : 'Unassigned';
    const activeLabels = activeConversation ? getConversationLabels(activeConversation) : [];
    const activeDisplayMessages = activeMessages.filter((message) => message.type !== 'reaction');
    const activeTimelineMessages = activeMessages.filter((message) => !['internal_note', 'reaction'].includes(message.type));
    const activeNotes = activeMessages.filter((message) => message.type === 'internal_note');
    const firstAttachment = attachments[0] ?? null;
    const attachmentSummary = firstAttachment
        ? `${firstAttachment.name || 'Attachment'}${attachments.length > 1 ? ` +${attachments.length - 1}` : ''}`
        : null;
    const activeMessageReactions = useMemo(() => {
        const reactions: Record<string, string> = {};
        const byMetaId = new Map<string, ChatMessage>();
        activeMessages.forEach((message) => {
            if (message.meta_message_id) {
                byMetaId.set(message.meta_message_id, message);
            }
        });

        activeMessages
            .filter((message) => message.type === 'reaction')
            .forEach((message) => {
                const emoji = message.payload?.reaction?.emoji || message.text_body;
                const targetLocalId = message.payload?.reaction?.target_local_message_id;
                const targetMetaId = message.payload?.reaction?.message_id;
                const target = targetLocalId
                    ? activeMessages.find((item) => String(item.id) === String(targetLocalId))
                    : targetMetaId
                        ? byMetaId.get(String(targetMetaId))
                        : null;
                if (emoji && target) {
                    reactions[String(target.id)] = emoji;
                }
            });

        return reactions;
    }, [activeMessages]);
    const activeInboundCount = activeTimelineMessages.filter((message) => message.direction === 'inbound').length;
    const activeOutboundCount = activeTimelineMessages.filter((message) => message.direction === 'outbound').length;
    const activeGallery = activeConversation ? galleryByConversation[activeConversation.id] ?? emptyContactGallery() : emptyContactGallery();
    const activeMediaCount = activeGallery.counts.total || activeTimelineMessages.filter((message) => ['image', 'video', 'document', 'audio', 'sticker'].includes(message.type)).length;
    const activeCalls = activeConversation
        ? recentCallsState.filter((call) => {
            const callPhone = String(call.phone_number || '').replace(/\D+/g, '');
            const contactPhone = String(activeConversation.contact.wa_id || '').replace(/\D+/g, '');
            return callPhone === contactPhone && (!call.whatsapp_connection_id || call.whatsapp_connection_id === activeConversation.connection.id);
        })
        : [];
    const incomingCall = useMemo(
        () => recentCallsState.find((call) => isIncomingVisibleCall(call) && !dismissedCallIds.has(Number(call.id))) ?? null,
        [recentCallsState, dismissedCallIds]
    );
    const incomingCallConversation = useMemo(() => {
        if (!incomingCall) return null;
        const callPhone = String(incomingCall.phone_number || '').replace(/\D+/g, '');

        return conversations.find((conversation) => {
            const contactPhone = String(conversation.contact.wa_id || '').replace(/\D+/g, '');

            return callPhone === contactPhone && (!incomingCall.whatsapp_connection_id || incomingCall.whatsapp_connection_id === conversation.connection.id);
        }) ?? null;
    }, [conversations, incomingCall]);
    const callingReady = Boolean(whatsappCalling?.enabled && activeConversation && (
        activeConversation.connection.calling_enabled ||
        whatsappCalling.calling_eligibility_status === 'eligible' ||
        (Number(whatsappCalling.whatsapp_connection_id) === activeConversation.connection.id && whatsappCalling.calling_webhook_subscribed)
    ));
    const incomingCallingReady = Boolean(whatsappCalling?.enabled && incomingCall && (
        incomingCallConversation?.connection.calling_enabled ||
        whatsappCalling.calling_eligibility_status === 'eligible' ||
        (incomingCallConversation && Number(whatsappCalling.whatsapp_connection_id) === incomingCallConversation.connection.id && whatsappCalling.calling_webhook_subscribed) ||
        whatsappCalling.calling_webhook_subscribed
    ));

    useEffect(() => {
        if (!incomingCall || !isIncomingActionableCall(incomingCall)) return;
        notifyIncomingCall(incomingCall, incomingCallConversation);

        const interval = window.setInterval(() => {
            const current = recentCallsState.find((call) => Number(call.id) === Number(incomingCall.id));
            if (!current || !isIncomingActionableCall(current) || dismissedCallIds.has(Number(incomingCall.id))) {
                window.clearInterval(interval);
                return;
            }
            playCallRing();
        }, 3500);

        return () => window.clearInterval(interval);
    }, [incomingCall?.id, incomingCall?.status, incomingCallConversation?.id, notifyIncomingCall, playCallRing, recentCallsState, dismissedCallIds]);

    const activeReplyWindow = customerServiceWindowFor(activeConversation, activeTimelineMessages, replyWindowNow);
    const freeFormReplyBlocked = !noteMode && !activeReplyWindow.isOpen;
    const lastInboundAt = activeReplyWindow.lastInboundAt;
    const lastOutboundAt = [...activeTimelineMessages].reverse().find((message) => message.direction === 'outbound')?.created_at ?? null;
    const selectedAiAgent = selectedAiAgentId === 'default'
        ? null
        : aiAgents.find((agent) => agent.id === selectedAiAgentId) ?? null;
    const selectedAiAgentLabel = selectedAiAgent?.name ?? 'Default assistant';
    const pickedLocation = useMemo(() => {
        const latitude = Number(locationInput.latitude);
        const longitude = Number(locationInput.longitude);

        return Number.isFinite(latitude) && Number.isFinite(longitude)
            ? { latitude, longitude }
            : null;
    }, [locationInput.latitude, locationInput.longitude]);
    const pickedLocationMapUrl = pickedLocation
        ? `https://www.google.com/maps/search/?api=1&query=${pickedLocation.latitude},${pickedLocation.longitude}`
        : null;
    const locationTiles = useMemo(() => locationMapTiles(locationMap), [locationMap]);

    useEffect(() => {
        if (!activeConversation) {
            setActiveId(null);
            return;
        }
        if (activeId !== activeConversation.id) {
            setActiveId(activeConversation.id);
        }
    }, [activeConversation, activeId]);

    useEffect(() => {
        if (selectedConversationId) {
            setActiveId(Number(selectedConversationId));
            setMobileShowDetail(true);
        }
    }, [selectedConversationId]);

    useEffect(() => {
        if (!activeConversation || galleryByConversation[activeConversation.id]) {
            return;
        }

        let cancelled = false;
        setGalleryLoadingId(activeConversation.id);

        axios.get(route('app.whatsapp.conversations.gallery', { conversation: activeConversation.id }))
            .then((response) => {
                if (cancelled) return;
                setGalleryByConversation((current) => ({
                    ...current,
                    [activeConversation.id]: {
                        media: Array.isArray(response.data?.media) ? response.data.media : [],
                        documents: Array.isArray(response.data?.documents) ? response.data.documents : [],
                        links: Array.isArray(response.data?.links) ? response.data.links : [],
                        counts: {
                            media: Number(response.data?.counts?.media ?? 0),
                            documents: Number(response.data?.counts?.documents ?? 0),
                            links: Number(response.data?.counts?.links ?? 0),
                            total: Number(response.data?.counts?.total ?? 0),
                        },
                    },
                }));
            })
            .catch(() => {
                if (cancelled) return;
                setGalleryByConversation((current) => ({
                    ...current,
                    [activeConversation.id]: emptyContactGallery(),
                }));
            })
            .finally(() => {
                if (!cancelled) {
                    setGalleryLoadingId(null);
                }
            });

        return () => {
            cancelled = true;
        };
    }, [activeConversation, galleryByConversation]);

    useEffect(() => {
        if (newChatOpen) {
            setShowNewChat(true);
        }
    }, [newChatOpen]);

    const mergeMessages = useCallback((conversationId: number, incoming: ChatMessage[]) => {
        if (!incoming.length) return;
        setMessagesByConversation((prev) => {
            const existing = prev[conversationId] ?? [];
            const byId = new Map<string, ChatMessage>();
            existing.forEach((message) => byId.set(String(message.id), message));
            incoming.forEach((message) => {
                for (const [id, existingMessage] of byId) {
                    if (isOptimisticMatch(existingMessage, message) || isSameProviderMessage(existingMessage, message)) {
                        byId.delete(id);
                    }
                }

                const id = String(message.id);
                const current = byId.get(id);
                byId.set(id, current ? { ...current, ...message, payload: message.payload ?? current.payload } : message);
            });

            const next = {
                ...prev,
                [conversationId]: sortMessages(Array.from(byId.values())),
            };
            messagesByConversationRef.current = next;

            return next;
        });
    }, []);

    const patchMessage = useCallback((conversationId: number, incoming: ChatMessage) => {
        setMessagesByConversation((prev) => {
            const existing = prev[conversationId] ?? [];
            const index = existing.findIndex((message) => String(message.id) === String(incoming.id));
            if (index === -1) {
                if (!isRenderableMessageUpdate(incoming)) {
                    return prev;
                }

                const next = {
                    ...prev,
                    [conversationId]: sortMessages([...existing, incoming]),
                };
                messagesByConversationRef.current = next;

                return next;
            }

            const updated = [...existing];
            updated[index] = { ...updated[index], ...incoming, payload: incoming.payload ?? updated[index].payload };

            const next = {
                ...prev,
                [conversationId]: sortMessages(updated),
            };
            messagesByConversationRef.current = next;

            return next;
        });
    }, []);

    const fetchConversationMessages = useCallback((conversationId: number, reset = false) => {
        const sequence = (conversationFetchSequenceRef.current[conversationId] ?? 0) + 1;
        conversationFetchSequenceRef.current[conversationId] = sequence;
        if (reset) {
            setLoadingConversationId(conversationId);
        }

        const current = reset ? [] : messagesByConversationRef.current[conversationId] ?? [];
        const afterMessageId = current
            .map((message) => Number(message.id))
            .filter((id) => Number.isFinite(id))
            .reduce((max, id) => Math.max(max, id), 0);
        const afterNoteId = current
            .map((message) => String(message.id).match(/^note-(\d+)$/)?.[1])
            .filter((id): id is string => Boolean(id))
            .map((id) => Number(id))
            .filter((id) => Number.isFinite(id))
            .reduce((max, id) => Math.max(max, id), 0);
        const afterAuditId = current
            .map((message) => String(message.id).match(/^audit-(\d+)$/)?.[1])
            .filter((id): id is string => Boolean(id))
            .map((id) => Number(id))
            .filter((id) => Number.isFinite(id))
            .reduce((max, id) => Math.max(max, id), 0);
        const afterUpdatedAt = conversationStatusCursorRef.current[conversationId];

        return axios.get(route('app.whatsapp.inbox.conversation.stream', { conversation: conversationId }), {
            params: {
                after_message_id: reset ? 0 : afterMessageId,
                after_note_id: reset ? 0 : afterNoteId,
                after_audit_id: reset ? 0 : afterAuditId,
                after_updated_at: reset ? undefined : afterUpdatedAt,
            },
        }).then((response) => {
            if (!reset && conversationFetchSequenceRef.current[conversationId] !== sequence) {
                return;
            }

            if (response.data?.server_time) {
                const serverTime = new Date(response.data.server_time).getTime();
                if (Number.isFinite(serverTime)) {
                    conversationStatusCursorRef.current[conversationId] = new Date(serverTime - 30000).toISOString();
                }
            }

            const incoming = Array.isArray(response.data?.new_messages)
                ? response.data.new_messages.map(normalizeChatMessage).filter(Boolean)
                : [];
            const incomingNotes = Array.isArray(response.data?.new_notes)
                ? response.data.new_notes.map(noteToTimelineMessage)
                : [];
            const incomingAuditEvents = Array.isArray(response.data?.new_audit_events)
                ? response.data.new_audit_events.map(auditToTimelineMessage)
                : [];
            const timelineItems = sortMessages([...incoming, ...incomingNotes, ...incomingAuditEvents]);
            mergeMessages(conversationId, timelineItems);

            const updatedMessages = Array.isArray(response.data?.updated_messages)
                ? response.data.updated_messages.map(normalizeChatMessage).filter(Boolean)
                : [];
            updatedMessages.forEach((message: ChatMessage) => patchMessage(conversationId, message));

            const updatedConversation = response.data?.conversation;
            if (updatedConversation?.id) {
                const normalizedUpdated = normalizeConversation({
                    ...activeConversation,
                    ...updatedConversation,
                    contact: activeConversation?.contact,
                    connection: activeConversation?.connection,
                });
                const patch = normalizedUpdated ?? updatedConversation;
                setConversations((current) => current.map((conversation) => {
                    if (conversation.id !== Number(updatedConversation.id)) {
                        return conversation;
                    }

                    return {
                        ...conversation,
                        ...patch,
                        last_inbound_message_at: mergeLastInboundAt(conversation.last_inbound_message_at, patch.last_inbound_message_at),
                    };
                }));
            }
        }).catch((error) => {
            if (inboxDebug) {
                console.warn('[Inbox] Failed to load conversation messages:', error?.message);
            }
        }).finally(() => {
            if (reset && conversationFetchSequenceRef.current[conversationId] === sequence) {
                setLoadingConversationId((current) => current === conversationId ? null : current);
            }
        });
    }, [activeConversation, mergeMessages, patchMessage]);

    useEffect(() => {
        if (!activeConversation) return;
        fetchConversationMessages(activeConversation.id, true);
        setActionsMenuOpen(false);
    }, [activeConversation?.id]);

    useEffect(() => {
        if (!activeConversation?.id) return;

        const interval = setInterval(() => {
            if (loadingConversationId === activeConversation.id) return;
            fetchConversationMessages(activeConversation.id);
        }, 3000);

        return () => clearInterval(interval);
    }, [activeConversation?.id, fetchConversationMessages, loadingConversationId]);

    useEffect(() => {
        if (!account?.id || !activeConversation?.id) return;

        const channel = `account.${account.id}.whatsapp.conversation.${activeConversation.id}`;
        const unsubscribeMessageCreated = subscribe(channel, '.whatsapp.message.created', (data: any) => {
            const message = normalizeChatMessage(data.message);
            if (!message) return;
            mergeMessages(activeConversation.id, [message]);
        });
        const unsubscribeMessageUpdated = subscribe(channel, '.whatsapp.message.updated', (data: any) => {
            const message = normalizeChatMessage(data.message);
            if (!message) return;
            patchMessage(activeConversation.id, message);
        });
        const unsubscribeNoteAdded = subscribe(channel, '.whatsapp.note.added', (data: any) => {
            if (!data?.note) return;
            mergeMessages(activeConversation.id, [noteToTimelineMessage(data.note)]);
        });
        const unsubscribeAuditAdded = subscribe(channel, '.whatsapp.audit.added', (data: any) => {
            if (!data?.audit_event) return;
            mergeMessages(activeConversation.id, [auditToTimelineMessage(data.audit_event)]);
        });
        const unsubscribeConversationUpdated = subscribe(channel, '.whatsapp.conversation.updated', (data: any) => {
            const incoming = normalizeConversation(data.conversation);
            if (!incoming) return;
            setConversations((prev) => applyConversationUpdated(prev, incoming));
        });

        return () => {
            unsubscribeMessageCreated();
            unsubscribeMessageUpdated();
            unsubscribeNoteAdded();
            unsubscribeAuditAdded();
            unsubscribeConversationUpdated();
        };
    }, [account?.id, activeConversation?.id, subscribe, mergeMessages, patchMessage]);

    useEffect(() => {
        if (!activeConversation?.id) return;
        const hasUnreadInbound = activeTimelineMessages.some((message) => message.direction === 'inbound' && !message.read_at);
        if (!hasUnreadInbound) return;

        const timeout = window.setTimeout(() => {
            axios.post(route('app.whatsapp.conversations.read', { conversation: activeConversation.id }))
                .catch((error) => {
                    if (inboxDebug) {
                        console.warn('[Inbox] Failed to mark conversation read:', error?.message);
                    }
                });
        }, 700);

        return () => window.clearTimeout(timeout);
    }, [activeConversation?.id, activeTimelineMessages.length]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ block: 'end' });
    }, [activeConversation?.id, activeMessages.length]);

    const showReplyWindowClosedToast = () => {
        addToast({
            title: activeReplyWindow.state === 'closed' ? '24-hour reply window closed' : 'Template required',
            description: 'Meta only allows normal replies inside the 24-hour customer service window. Send an approved template instead.',
            variant: 'warning',
            duration: 6000,
        });
        setShowTemplates(true);
        setShowQuickReplies(false);
        setShowInteractiveComposer(false);
    };

    const sendInlineMessage = () => {
        if (!activeConversation || sendingMessage) return;

        if (!noteMode && activeBotIsReplying) {
            addToast({
                title: 'Bot is replying',
                description: 'Switch this chat to Manual if you want to take over now.',
                variant: 'warning',
            });
            return;
        }

        if (!noteMode && !activeReplyWindow.isOpen) {
            showReplyWindowClosedToast();
            return;
        }

        if (!noteMode && attachments.length > 0) {
            sendAttachments(messageDraft.trim() || undefined);
            return;
        }

        if (!messageDraft.trim()) return;

        const body = messageDraft.trim();
        if (noteMode) {
            setMessageDraft('');
            setSendingMessage(true);
            axios.post(route('app.whatsapp.conversations.notes.store', { conversation: activeConversation.id }), { note: body })
                .then((response) => {
                    const note = response.data?.note;
                    mergeMessages(activeConversation.id, [noteToTimelineMessage({
                        id: Number(note?.id ?? Date.now()),
                        note: note?.note ?? body,
                        created_at: note?.created_at ?? new Date().toISOString(),
                        created_by: note?.created_by ?? null,
                    })]);
                    addToast({ title: 'Note added', variant: 'success' });
                    fetchConversationMessages(activeConversation.id);
                })
                .catch((error) => {
                    setMessageDraft(body);
                    addToast({
                        title: 'Note not saved',
                        description: error?.response?.data?.message || 'Please try again.',
                        variant: 'error',
                    });
                })
                .finally(() => setSendingMessage(false));
            return;
        }

        const replyPreview = messageReplyPreview(replyTo);
        const payload = {
            message: body,
            ...(replyTo?.id && typeof replyTo.id === 'number' ? { reply_message_id: replyTo.id } : {}),
        };
        const optimistic: ChatMessage = {
            id: `optimistic-${Date.now()}`,
            direction: 'outbound',
            type: 'text',
            text_body: body,
            status: 'queued',
            created_at: new Date().toISOString(),
            optimistic: true,
            reply_to: replyPreview,
            reply_to_message_id: replyTo?.id ?? null,
            reply_to_meta_message_id: messageReplyMetaId(replyTo),
        };

        setMessageDraft('');
        setReplyTo(null);
        setSendingMessage(true);
        mergeMessages(activeConversation.id, [optimistic]);
        setConversations((prev) => prev.map((conversation) => conversation.id === activeConversation.id
            ? { ...conversation, last_message_preview: body, last_message_at: optimistic.created_at }
            : conversation
        ));

        axios.post(route('app.whatsapp.conversations.send', { conversation: activeConversation.id }), payload, {
            headers: { Accept: 'application/json' },
        }).then((response) => {
            const sentMessage = normalizeChatMessage(response.data?.data?.message);
            if (sentMessage) {
                mergeMessages(activeConversation.id, [sentMessage]);
            }
            fetchConversationMessages(activeConversation.id);
        }).catch((error) => {
            const failedMessage = normalizeChatMessage(error?.response?.data?.data?.message);
            if (failedMessage) {
                patchMessage(activeConversation.id, failedMessage);
            }
            addToast({
                title: 'Message not sent',
                description: error?.response?.data?.message_detail || error?.response?.data?.error || error?.response?.data?.message || 'Please try again.',
                variant: 'error',
            });
            fetchConversationMessages(activeConversation.id);
        }).finally(() => {
            setSendingMessage(false);
        });
    };

    const createNewChat = () => {
        if (creatingChat) return;
        setCreatingChat(true);
        router.post(route('app.whatsapp.conversations.store'), newChatForm, {
            preserveScroll: true,
            onSuccess: () => {
                setShowNewChat(false);
                setNewChatForm({
                    name: '',
                    wa_id: '',
                    connection_id: connections?.[0]?.id ? String(connections[0].id) : '',
                });
                addToast({ title: 'Chat created', variant: 'success' });
            },
            onError: (errors) => {
                addToast({
                    title: 'Chat not created',
                    description: String(errors.wa_id || errors.connection_id || errors.name || 'Check the contact details and try again.'),
                    variant: 'error',
                });
            },
            onFinish: () => setCreatingChat(false),
        });
    };

    const deleteConversation = async () => {
        if (!activeConversation || deletingConversationId) return;
        const confirmed = await confirm({
            title: 'Delete chat',
            message: `Delete chat with ${activeConversation.contact.name || activeConversation.contact.wa_id}? This removes the conversation history from this workspace.`,
            confirmText: 'Delete chat',
            variant: 'danger',
        });
        if (!confirmed) return;

        const conversationId = activeConversation.id;
        setDeletingConversationId(conversationId);
        router.delete(route('app.whatsapp.conversations.destroy', { conversation: conversationId }), {
            preserveScroll: true,
            onSuccess: () => {
                setConversations((current) => current.filter((conversation) => conversation.id !== conversationId));
                setMessagesByConversation((current) => {
                    const next = { ...current };
                    delete next[conversationId];
                    return next;
                });
                setActiveId(null);
                setActionsMenuOpen(false);
                addToast({ title: 'Chat deleted', variant: 'success' });
            },
            onError: () => addToast({ title: 'Chat not deleted', description: 'Please try again.', variant: 'error' }),
            onFinish: () => setDeletingConversationId(null),
        });
    };

    const insertQuickReply = (text: string) => {
        const firstName = activeConversation?.contact.name?.split(' ')[0] || 'there';
        setMessageDraft(text.replace('{{name}}', firstName));
        closeComposerPopovers();
    };

    const applyTemplate = (template: TemplateOption) => {
        if (!activeConversation) return;
        if ((template.variable_count ?? 0) > 0) {
            setMessageDraft((template.body_text || template.name).replace(/\{\{\d+\}\}/g, activeConversation.contact.name?.split(' ')[0] || 'there'));
            setShowTemplates(false);
            addToast({ title: 'Template added to composer', description: 'Review variables before sending.', variant: 'info' });
            return;
        }

        setSendingMessage(true);
        router.post(route('app.whatsapp.conversations.send-template', { conversation: activeConversation.id }), {
            template_id: template.id,
            variables: [],
        }, {
            preserveScroll: true,
            preserveState: true,
            onSuccess: () => {
                setShowTemplates(false);
                fetchConversationMessages(activeConversation.id, true);
            },
            onError: (errors) => addToast({
                title: 'Template not sent',
                description: (errors as any)?.template || 'Please try again.',
                variant: 'error',
            }),
            onFinish: () => setSendingMessage(false),
        });
    };

    const canUseAiSuggest = Boolean(aiAvailable && aiSuggestionsEnabled && platformAiEnabled);

    const saveInteractiveButton = async () => {
        const label = newInteractiveButtonLabel.trim();
        if (!label || savingInteractiveButton) return;

        setSavingInteractiveButton(true);
        try {
            const response = await axios.post(route('app.quick-replies.store'), {
                type: 'button',
                label,
                shortcut: shortcutFromButtonLabel(label),
                message: label,
                is_active: true,
            }, { headers: { Accept: 'application/json' } });

            const saved = response.data?.data;
            if (saved?.id) {
                setSavedButtonOptions((current) => {
                    const withoutDuplicate = current.filter((button) => Number(button.id) !== Number(saved.id));
                    return [saved, ...withoutDuplicate];
                });
                setInteractiveDraft((current) => ({
                    ...current,
                    saved_button_ids: [...current.saved_button_ids.filter((id) => Number(id) !== Number(saved.id)), Number(saved.id)].slice(-3),
                }));
                setNewInteractiveButtonLabel('');
                addToast({ title: 'Button saved', description: `"${label}" is now available for interactive messages.`, variant: 'success' });
            }
        } catch (error: any) {
            addToast({
                title: 'Button not saved',
                description: error?.response?.data?.message || Object.values(error?.response?.data?.errors || {})?.flat()?.[0] || 'Check the label and try again.',
                variant: 'error',
            });
        } finally {
            setSavingInteractiveButton(false);
        }
    };

    const deleteSavedInteractiveButton = async (button: SavedButtonOption) => {
        const confirmed = await confirm({
            title: 'Delete saved button',
            message: `Delete "${button.button_text || button.label}" from saved buttons? This also removes it from Quick Replies.`,
            confirmText: 'Delete button',
            variant: 'danger',
        });

        if (!confirmed) return;

        try {
            await axios.delete(route('app.quick-replies.destroy', { quickReply: button.id }), {
                headers: { Accept: 'application/json' },
            });
            setSavedButtonOptions((current) => current.filter((item) => Number(item.id) !== Number(button.id)));
            setInteractiveDraft((current) => ({
                ...current,
                saved_button_ids: current.saved_button_ids.filter((id) => Number(id) !== Number(button.id)),
            }));
            addToast({ title: 'Button deleted', description: `"${button.button_text || button.label}" was removed.`, variant: 'success' });
        } catch (error: any) {
            addToast({
                title: 'Button not deleted',
                description: error?.response?.data?.message || 'Open Quick Replies to manage this button.',
                variant: 'error',
            });
        }
    };

    const sendInteractiveMessage = async () => {
        if (!activeConversation || sendingMessage) return;
        if (!activeReplyWindow.isOpen) {
            showReplyWindowClosedToast();
            return;
        }

        setSendingMessage(true);
        const body = interactiveDraft.body_text.trim();

        try {
            let endpoint = '';
            let payload: any = {};

            if (interactiveMode === 'buttons') {
                const selectedSavedButtons = savedButtonOptions
                    .filter((button) => interactiveDraft.saved_button_ids.includes(Number(button.id)))
                    .map((button) => button.button_text || button.label)
                    .filter(Boolean);
                const buttons = selectedSavedButtons
                    .map((text, index) => ({ id: `btn_${index + 1}_${text.toLowerCase().replace(/[^a-z0-9]+/g, '_').slice(0, 40)}`, text: text.trim() }))
                    .filter((button) => button.text);
                endpoint = route('app.whatsapp.conversations.send-buttons', { conversation: activeConversation.id });
                payload = {
                    body_text: body,
                    header_text: interactiveDraft.header_text.trim() || undefined,
                    footer_text: interactiveDraft.footer_text.trim() || undefined,
                    buttons,
                };
            } else if (interactiveMode === 'list') {
                endpoint = route('app.whatsapp.conversations.send-list', { conversation: activeConversation.id });
                payload = { list_id: Number(interactiveDraft.list_id) };
            } else if (interactiveMode === 'form') {
                const form = savedForms.find((item) => String(item.id) === String(interactiveDraft.form_id));
                endpoint = route('app.whatsapp.conversations.send-flow', { conversation: activeConversation.id });
                payload = {
                    flow_id: form?.meta_flow_id || '',
                    body_text: body || `Please complete this WhatsApp form: ${form?.name || 'Form'}`,
                    header_text: interactiveDraft.header_text.trim() || undefined,
                    footer_text: interactiveDraft.footer_text.trim() || undefined,
                    cta: interactiveDraft.form_button_text.trim() || 'Open form',
                    flow_action: 'navigate',
                };
            } else if (interactiveMode === 'product') {
                endpoint = route('app.whatsapp.conversations.send-product', { conversation: activeConversation.id });
                payload = {
                    mode: 'single',
                    product_id: Number(interactiveDraft.product_id),
                    body_text: body || 'Here is the product.',
                    footer_text: interactiveDraft.footer_text.trim() || undefined,
                };
            } else if (interactiveMode === 'link') {
                endpoint = route('app.whatsapp.conversations.send-cta-url', { conversation: activeConversation.id });
                payload = {
                    body_text: body,
                    header_text: interactiveDraft.header_text.trim() || undefined,
                    footer_text: interactiveDraft.footer_text.trim() || undefined,
                    display_text: interactiveDraft.cta_display_text.trim() || 'Open link',
                    url: interactiveDraft.cta_url.trim(),
                };
            } else if (interactiveMode === 'payment') {
                endpoint = route('app.whatsapp.conversations.send-payment-link', { conversation: activeConversation.id });
                payload = {
                    amount: interactiveDraft.payment_amount,
                    currency: 'INR',
                    description: interactiveDraft.payment_description.trim() || 'WhatsApp payment request',
                    body_text: body || undefined,
                    display_text: interactiveDraft.payment_button_text.trim() || 'Pay now',
                    expire_after_days: interactiveDraft.payment_expire_after_days ? Number(interactiveDraft.payment_expire_after_days) : undefined,
                };
            } else {
                endpoint = route('app.whatsapp.conversations.send-contact-card', { conversation: activeConversation.id });
                payload = {
                    formatted_name: interactiveDraft.contact_name.trim(),
                    phone: interactiveDraft.contact_phone.trim(),
                    email: interactiveDraft.contact_email.trim() || undefined,
                };
            }

            const response = await axios.post(endpoint, payload, { headers: { Accept: 'application/json' } });
            const sentMessage = response.data?.data?.message;
            if (sentMessage) {
                mergeMessages(activeConversation.id, [sentMessage]);
            }
            setShowInteractiveComposer(false);
            addToast({
                title: interactiveMode === 'form'
                    ? 'Form sent'
                    : interactiveMode === 'product'
                        ? 'Product sent'
                        : interactiveMode === 'payment'
                            ? 'Payment link sent'
                        : interactiveMode === 'link'
                            ? 'Link button sent'
                            : interactiveMode === 'contact'
                                ? 'Contact card sent'
                                : 'Interactive message sent',
                variant: 'success',
            });
            fetchConversationMessages(activeConversation.id, true);
        } catch (error: any) {
            addToast({
                title: 'Interactive message not sent',
                description: error?.response?.data?.error || error?.response?.data?.message || 'Check the fields and try again.',
                variant: 'error',
            });
        } finally {
            setSendingMessage(false);
        }
    };

    const openFilePicker = (accept?: string) => {
        setFilePickerAccept(accept);
        setShowAttachments(false);
        window.setTimeout(() => {
            if (fileInputRef.current) {
                fileInputRef.current.accept = accept ?? '';
                fileInputRef.current.click();
            }
        }, 0);
    };

    const addPickedFiles = (files: FileList | null) => {
        if (!files?.length) {
            addToast({ title: 'No file selected', description: 'Choose an image, video, audio, or document to attach.', variant: 'info' });
            return;
        }
        const picked = Array.from(files);
        const usableFiles = picked.filter((file) => file.size > 0 && (file.name || file.type));

        if (usableFiles.length === 0) {
            addToast({ title: 'File not attached', description: 'The selected file appears to be empty or unavailable.', variant: 'warning' });
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
            return;
        }

        setNoteMode(false);
        setShowEmoji(false);
        setShowTemplates(false);
        setShowQuickReplies(false);
        setShowInteractiveComposer(false);
        setShowLocationPicker(false);
        setShowAttachments(false);
        setAttachments((current) => [...current, ...usableFiles]);
        addToast({
            title: usableFiles.length > 1 ? 'Files attached' : 'File attached',
            description: usableFiles.length === 1 ? usableFiles[0].name || 'Ready to send.' : `${usableFiles.length} files ready to send.`,
            variant: 'success',
            duration: 1600,
        });
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    useEffect(() => {
        if (attachments.length > 0) {
            attachmentPreviewRef.current?.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
        }
    }, [attachments.length]);

    const removeAttachment = (index: number) => {
        setAttachments((current) => current.filter((_, currentIndex) => currentIndex !== index));
    };

    const sendAttachments = async (caption?: string) => {
        if (!activeConversation || attachments.length === 0 || sendingMessage) return;
        if (!activeReplyWindow.isOpen) {
            showReplyWindowClosedToast();
            return;
        }

        setSendingMessage(true);

        for (let index = 0; index < attachments.length; index += 1) {
            const file = attachments[index];
            const fileType = resolveMediaType(file);

            const formData = new FormData();
            formData.append('type', fileType);
            formData.append('attachment', file);
            if (fileType === 'audio' && isRecordedVoiceFile(file)) {
                formData.append('is_voice', '1');
            }
            if (replyTo?.id && typeof replyTo.id === 'number') {
                formData.append('reply_message_id', String(replyTo.id));
            }
            if (caption && index === 0) {
                formData.append('caption', caption);
            }

            try {
                const response = await axios.post(
                    route('app.whatsapp.conversations.send-media', { conversation: activeConversation.id }),
                    formData,
                    { headers: { 'Content-Type': 'multipart/form-data', Accept: 'application/json' } }
                );
                const sentMessage = response.data?.data?.message;
                if (sentMessage) {
                    mergeMessages(activeConversation.id, [sentMessage]);
                }
            } catch (error: any) {
                addToast({
                    title: 'Attachment not sent',
                    description: error?.response?.data?.message || error?.response?.data?.errors?.attachment?.[0] || 'Please try another file.',
                    variant: 'error',
                });
                setSendingMessage(false);
                return;
            }
        }

        addToast({ title: attachments.length > 1 ? 'Attachments sent' : 'Attachment sent', variant: 'success' });
        setAttachments([]);
        setMessageDraft('');
        setReplyTo(null);
        setSendingMessage(false);
        fetchConversationMessages(activeConversation.id, true);
    };

    const handleAiSuggest = () => {
        if (!activeConversation || aiSuggestLoading) return;

        if (!canUseAiSuggest) {
            addToast({
                title: 'AI suggestion unavailable',
                description: !aiSuggestionsEnabled
                    ? 'Enable AI suggestions in AI settings.'
                    : !platformAiEnabled
                        ? 'AI is disabled in platform settings.'
                        : 'AI is not available on this plan.',
                variant: 'warning',
            });
            return;
        }

        setAiSuggestLoading(true);
        axios
            .post(route('app.whatsapp.conversations.ai-suggest', { conversation: activeConversation.id }), {
                agent_id: selectedAiAgentId === 'default' ? null : selectedAiAgentId,
            })
            .then((response) => {
                const suggestion = response.data?.suggestion;
                if (!isUsableAiSuggestion(suggestion)) {
                    addToast({
                        title: 'AI suggestion incomplete',
                        description: 'The draft was too short or ended mid-thought, so it was not inserted. Try regenerate.',
                        variant: 'warning',
                    });
                    return;
                }

                const normalized = suggestion.trim();
                setMessageDraft(normalized);
                const agentName = response.data?.agent?.name;
                addToast({ title: 'AI suggestion added', description: agentName ? `${agentName} drafted this reply.` : 'Review before sending.', variant: 'info' });
            })
            .catch((error) => {
                addToast({
                    title: 'AI suggestion failed',
                    description: error?.response?.data?.error || error?.message || 'Please try again.',
                    variant: 'error',
                });
            })
            .finally(() => setAiSuggestLoading(false));
    };

    const selectLocation = (latitude: number, longitude: number, label?: string) => {
        const lat = Number(latitude.toFixed(6));
        const lng = Number(longitude.toFixed(6));

        setLocationInput((current) => ({
            label: label ?? current.label,
            latitude: String(lat),
            longitude: String(lng),
        }));
        setLocationMap((current) => ({
            ...current,
            lat,
            lng,
            zoom: Math.max(current.zoom, 14),
        }));
    };

    const searchLocations = async () => {
        const query = locationSearch.trim();
        if (!query) {
            setLocationResults([]);
            return;
        }

        setLocationSearching(true);
        try {
            const response = await axios.get('https://nominatim.openstreetmap.org/search', {
                params: {
                    q: query,
                    format: 'jsonv2',
                    limit: 5,
                },
            });
            const results = Array.isArray(response.data)
                ? response.data
                    .map((item: any): LocationSearchResult | null => {
                        const lat = Number(item.lat);
                        const lng = Number(item.lon);
                        if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;

                        return {
                            label: String(item.display_name || query),
                            lat,
                            lng,
                        };
                    })
                    .filter(Boolean) as LocationSearchResult[]
                : [];
            setLocationResults(results);
            if (results.length === 0) {
                addToast({ title: 'No location found', description: 'Try a more specific place, address, or landmark.', variant: 'info' });
            }
        } catch {
            addToast({ title: 'Location search failed', description: 'Use current location or enter coordinates manually.', variant: 'warning' });
        } finally {
            setLocationSearching(false);
        }
    };

    const handleLocationMapClick = (event: MouseEvent<HTMLDivElement>) => {
        const rect = event.currentTarget.getBoundingClientRect();
        const centerPixel = locationToWorldPixel(locationMap.lat, locationMap.lng, locationMap.zoom);
        const worldX = centerPixel.x + (event.clientX - rect.left - rect.width / 2);
        const worldY = centerPixel.y + (event.clientY - rect.top - rect.height / 2);
        const location = worldPixelToLocation(worldX, worldY, locationMap.zoom);

        selectLocation(location.lat, location.lng);
    };

    const useCurrentLocationForPicker = () => {
        if (!navigator.geolocation) {
            addToast({ title: 'Location unavailable', description: 'This browser does not support location sharing.', variant: 'warning' });
            return;
        }

        navigator.geolocation.getCurrentPosition(
            (position) => {
                selectLocation(position.coords.latitude, position.coords.longitude, locationInput.label || 'Current location');
            },
            () => {
                addToast({ title: 'Location blocked', description: 'Allow location access to use your current location.', variant: 'warning' });
            },
            { enableHighAccuracy: true, timeout: 10000 }
        );
    };

    const sendLocation = (latitude: number, longitude: number, label = 'Shared location') => {
        if (!activeConversation) return;
        if (!activeReplyWindow.isOpen) {
            showReplyWindowClosedToast();
            return;
        }
        setSendingMessage(true);
        axios.post(route('app.whatsapp.conversations.send-location', { conversation: activeConversation.id }), {
            latitude,
            longitude,
            name: label,
            address: null,
        }).then(() => {
            addToast({ title: 'Location sent', variant: 'success' });
            setShowLocationPicker(false);
            setLocationInput({ label: '', latitude: '', longitude: '' });
            setLocationResults([]);
            setLocationSearch('');
            fetchConversationMessages(activeConversation.id, true);
        }).catch((error) => {
            addToast({
                title: 'Location not sent',
                description: error?.response?.data?.message || 'Check the coordinates and try again.',
                variant: 'error',
            });
        }).finally(() => setSendingMessage(false));
    };

    const sendManualLocation = () => {
        const latitude = Number(locationInput.latitude);
        const longitude = Number(locationInput.longitude);
        if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
            addToast({ title: 'Coordinates needed', description: 'Enter valid latitude and longitude.', variant: 'warning' });
            return;
        }
        if (latitude < -90 || latitude > 90 || longitude < -180 || longitude > 180) {
            addToast({ title: 'Coordinates invalid', description: 'Latitude must be between -90 and 90, longitude between -180 and 180.', variant: 'warning' });
            return;
        }
        sendLocation(latitude, longitude, locationInput.label || 'Shared location');
    };

    const updateConversationMeta = (updates: Partial<{ status: string; assigned_to: number | null; priority: string | null; tag: string }>) => {
        if (!activeConversation) return;
        const previous = activeConversation;
        const conversationUpdates = { ...updates };
        delete conversationUpdates.tag;
        setConversations((current) => current.map((conversation) => (
            conversation.id === activeConversation.id ? { ...conversation, ...conversationUpdates } : conversation
        )));
        axios.post(route('app.whatsapp.conversations.update', { conversation: activeConversation.id }), updates, {
            headers: { Accept: 'application/json' },
        })
            .then((response) => {
                const updated = response.data?.conversation;
                if (!updated) return;
                setConversations((current) => current.map((conversation) => (
                    conversation.id === activeConversation.id
                        ? {
                            ...conversation,
                            status: Object.prototype.hasOwnProperty.call(updated, 'status') ? updated.status : conversation.status,
                            assigned_to: Object.prototype.hasOwnProperty.call(updated, 'assigned_to') ? updated.assigned_to : conversation.assigned_to,
                            priority: Object.prototype.hasOwnProperty.call(updated, 'priority') ? updated.priority : conversation.priority,
                            contact: {
                                ...conversation.contact,
                                ...(updated.contact ?? {}),
                                tags: updated.contact?.tags ?? conversation.contact.tags ?? [],
                            },
                        }
                        : conversation
                )));
            })
            .catch(() => {
                setConversations((current) => current.map((conversation) => (
                    conversation.id === previous.id ? previous : conversation
                )));
                addToast({ title: 'Conversation update failed', description: 'Please try again.', variant: 'error' });
            });
    };

    const addConversationLabel = (labelId: string) => {
        const label = INBOX_LABELS.find((item) => item.id === labelId);
        if (!label) return;
        if (labelId === 'vip') {
            updateConversationMeta({ priority: 'urgent', tag: label.label });
        } else {
            updateConversationMeta({ tag: label.label });
        }
        addToast({ title: `${label.label} added`, variant: 'success', duration: 1200 });
    };

    const stopAutomation = async () => {
        if (!activeConversation?.automation_state) return;

        const confirmed = await confirm({
            title: 'Stop automation?',
            message: 'This clears the current automation journey for this chat. Future messages can still trigger a new flow.',
            confirmText: 'Stop automation',
            cancelText: 'Keep running',
            variant: 'danger',
        });
        if (!confirmed) return;

        axios.post(route('app.whatsapp.conversations.automation.stop', { conversation: activeConversation.id }))
            .then((response) => {
                const updated = response.data?.conversation;
                setConversations((current) => current.map((conversation) => (
                    conversation.id === activeConversation.id
                        ? { ...conversation, automation_state: updated?.automation_state ?? null }
                        : conversation
                )));
                fetchConversationMessages(activeConversation.id);
                addToast({ title: 'Automation stopped', variant: 'success' });
            })
            .catch(() => {
                addToast({ title: 'Could not stop automation', description: 'Please try again.', variant: 'error' });
            });
    };

    const toggleBotPaused = async (paused: boolean) => {
        if (!activeConversation) return;

        axios.post(route('app.whatsapp.conversations.bot.toggle', { conversation: activeConversation.id }), {
            paused,
            reason: paused ? 'Paused by agent from inbox' : null,
            assign_to_me: paused,
        }).then((response) => {
            const updated = response.data?.conversation ?? {};
            setConversations((current) => current.map((conversation) => (
                conversation.id === activeConversation.id
                    ? {
                        ...conversation,
                        assigned_to: Object.prototype.hasOwnProperty.call(updated, 'assigned_to') ? updated.assigned_to : conversation.assigned_to,
                        automation_state: updated.automation_state ?? null,
                        automation_processing: Boolean(updated.automation_processing ?? false),
                        automation_processing_mode: updated.automation_processing_mode ?? null,
                        bot_paused: Boolean(updated.bot_paused ?? false),
                        bot_paused_reason: updated.bot_paused_reason ?? null,
                        handoff_status: updated.handoff_status ?? null,
                        handoff_reason: updated.handoff_reason ?? null,
                    }
                    : conversation
            )));
            fetchConversationMessages(activeConversation.id);
            addToast({ title: paused ? 'Bot paused' : 'Bot resumed', variant: 'success' });
        }).catch(() => {
            addToast({ title: 'Bot setting failed', description: 'Please try again.', variant: 'error' });
        });
    };

    const toggleSelectedConversation = (conversationId: number) => {
        setSelectedIds((current) => {
            const next = new Set(current);
            if (next.has(conversationId)) {
                next.delete(conversationId);
            } else {
                next.add(conversationId);
            }
            return next;
        });
    };

    const setReaction = (message: ChatMessage, reaction: string) => {
        if (!activeConversation) return;
        if (!canReactToMessage(message)) {
            if (!message.meta_message_id && !message.optimistic) {
                fetchConversationMessages(activeConversation.id, true);
            }
            addToast({
                title: 'Reaction not sent',
                description: message.optimistic
                    ? 'Wait until this outgoing message is sent.'
                    : 'Reactions work only on messages that exist in WhatsApp. Notes, generated drafts, and unsynced system messages cannot receive reactions.',
                variant: 'warning',
            });
            return;
        }

        setMessageReactions((current) => ({ ...current, [String(message.id)]: reaction }));
        axios.post(route('app.whatsapp.conversations.send-reaction', { conversation: activeConversation.id }), {
            message_id: message.id,
            emoji: reaction,
        }).then((response) => {
            const sentMessage = response.data?.data?.message;
            if (sentMessage) {
                mergeMessages(activeConversation.id, [sentMessage]);
            }
            addToast({ title: 'Reaction sent', description: reaction, variant: 'success', duration: 1200 });
        }).catch((error) => {
            setMessageReactions((current) => {
                const next = { ...current };
                delete next[String(message.id)];
                return next;
            });
            addToast({
                title: 'Reaction not sent',
                description: error?.response?.data?.message || 'Please try again.',
                variant: 'error',
            });
        });
    };

    const retryMessage = (message: ChatMessage) => {
        if (!activeConversation || message.status !== 'failed' || sendingMessage) return;

        setSendingMessage(true);
        axios.post(route('app.whatsapp.conversations.retry-message', {
            conversation: activeConversation.id,
            message: message.id,
        })).then((response) => {
            const sentMessage = response.data?.data?.message;
            if (sentMessage) {
                patchMessage(activeConversation.id, sentMessage);
            }
            fetchConversationMessages(activeConversation.id);
            addToast({ title: 'Message resent', variant: 'success' });
        }).catch((error) => {
            const retryError = error?.response?.data?.error || error?.response?.data?.message || 'Please try again.';
            addToast({
                title: 'Retry failed',
                description: retryError,
                variant: 'error',
            });
        }).finally(() => setSendingMessage(false));
    };

    const contactRouteKey = activeConversation?.contact.slug || activeConversation?.contact.id;
    const contactHref = contactRouteKey
        ? route('app.contacts.index', { contact: contactRouteKey })
        : null;

    const openContactEditor = () => {
        if (!activeConversation?.contact?.id) return;

        setContactForm({
            name: activeConversation.contact.name || '',
            email: activeConversation.contact.email || '',
            phone: activeConversation.contact.is_unresolved_lid ? '' : (activeConversation.contact.phone || activeConversation.contact.wa_id || ''),
            company: activeConversation.contact.company || '',
            status: activeConversation.contact.status || 'active',
            notes: activeConversation.contact.notes || '',
        });
        setEditingContact(true);
    };

    const saveContactDetails = () => {
        if (!activeConversation?.contact?.id || savingContact) return;

        const contactId = activeConversation.contact.id;
        const contactRouteKey = activeConversation.contact.slug || contactId;
        const updates = {
            name: contactForm.name.trim() || activeConversation.contact.wa_id,
            email: contactForm.email.trim() || null,
            phone: contactForm.phone.trim() || null,
            company: contactForm.company.trim() || null,
            status: contactForm.status || 'active',
            notes: contactForm.notes.trim() || null,
        };

        setSavingContact(true);
        router.put(route('app.contacts.update', { contact: contactRouteKey }), updates, {
            preserveScroll: true,
            preserveState: true,
            onSuccess: () => {
                setConversations((current) => current.map((conversation) => (
                    conversation.contact.id === contactId
                        ? { ...conversation, contact: { ...conversation.contact, ...updates } }
                        : conversation
                )));
                setEditingContact(false);
                addToast({ title: 'Contact updated', description: 'Details are saved in the inbox and contact record.', variant: 'success' });
            },
            onError: (errors) => {
                const firstError = Object.values(errors || {})[0];
                addToast({
                    title: 'Contact update failed',
                    description: (typeof firstError === 'string' ? firstError : null) || 'Please check the fields and try again.',
                    variant: 'error',
                });
            },
            onFinish: () => setSavingContact(false),
        });
    };

    const toggleVoiceRecording = async () => {
        if (recordingVoice) {
            const context = voiceAudioContextRef.current;
            const sampleRate = context?.sampleRate || 44100;
            const samples = flattenAudioSamples(voiceSamplesRef.current);

            voiceProcessorRef.current?.disconnect();
            voiceSourceRef.current?.disconnect();
            voiceStreamRef.current?.getTracks().forEach((track) => track.stop());
            context?.close().catch(() => undefined);

            voiceProcessorRef.current = null;
            voiceSourceRef.current = null;
            voiceStreamRef.current = null;
            voiceAudioContextRef.current = null;
            voiceSamplesRef.current = [];
            setRecordingVoice(false);

            if (samples.length < sampleRate / 2) {
                addToast({ title: 'Voice message too short', description: 'Record at least half a second.', variant: 'warning' });
                return;
            }

            try {
                const lame = await loadLameEncoder();
                const blob = encodeMp3(lame, samples, sampleRate);
                if (blob.size < 256) {
                    throw new Error('Encoded voice message is empty.');
                }
                const file = new File([blob], `voice-message-${Date.now()}.mp3`, { type: 'audio/mpeg' });
                setAttachments((current) => [...current, file]);
                addToast({ title: 'Voice message ready', description: 'Press Send to deliver it.', variant: 'success' });
            } catch (error: any) {
                addToast({
                    title: 'Voice message not created',
                    description: error?.message || 'Please upload an MP3 audio file instead.',
                    variant: 'error',
                });
            }
            return;
        }

        const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
        if (!navigator.mediaDevices?.getUserMedia || !AudioContextClass) {
            addToast({ title: 'Voice recording unavailable', description: 'This browser does not support audio recording.', variant: 'warning' });
            return;
        }

        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            const context = new AudioContextClass();
            const source = context.createMediaStreamSource(stream);
            const processor = context.createScriptProcessor(4096, 1, 1);
            voiceSamplesRef.current = [];

            processor.onaudioprocess = (event) => {
                voiceSamplesRef.current.push(new Float32Array(event.inputBuffer.getChannelData(0)));
            };

            source.connect(processor);
            processor.connect(context.destination);

            voiceStreamRef.current = stream;
            voiceAudioContextRef.current = context;
            voiceSourceRef.current = source;
            voiceProcessorRef.current = processor;
            setRecordingVoice(true);
        } catch (error) {
            addToast({ title: 'Microphone blocked', description: 'Allow microphone access to record a voice message.', variant: 'warning' });
        }
    };

    const sendCurrentLocation = () => {
        if (!navigator.geolocation) {
            addToast({ title: 'Location unavailable', description: 'This browser does not support location sharing.', variant: 'warning' });
            return;
        }

        setShowAttachments(false);
        setShowLocationPicker(false);
        setSendingMessage(true);
        navigator.geolocation.getCurrentPosition(
            (position) => {
                sendLocation(position.coords.latitude, position.coords.longitude, 'Current location');
            },
            () => {
                addToast({ title: 'Location blocked', description: 'Allow location access to share your current location.', variant: 'warning' });
                setSendingMessage(false);
            },
            { enableHighAccuracy: true, timeout: 10000 }
        );
    };

    // Helper functions for realtime updates
    const applyConversationUpdated = (prev: Conversation[], updated: Conversation) => {
        const index = prev.findIndex((c) => c.id === updated.id);
        if (index >= 0) {
            const newList = [...prev];
            newList[index] = {
                ...prev[index],
                ...updated,
                last_inbound_message_at: mergeLastInboundAt(prev[index].last_inbound_message_at, updated.last_inbound_message_at),
            };
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
        const incomingConversation = normalizeConversation(data.conversation);

        if (index >= 0) {
            const previousLastInboundAt = prev[index].last_inbound_message_at ?? null;
            const updated = {
                ...prev[index],
                ...(incomingConversation ?? {}),
            };
            updated.last_message_preview = incomingConversation?.last_message_preview
                ?? data.message?.text_body
                ?? data.message?.text
                ?? data.message?.body
                ?? 'New message';
            updated.last_message_at = incomingConversation?.last_message_at
                ?? data.message?.created_at
                ?? data.message?.timestamp
                ?? new Date().toISOString();
            updated.last_inbound_message_at = mergeLastInboundAt(
                previousLastInboundAt,
                incomingConversation?.last_inbound_message_at,
                data.message,
            );
            const newList = [...prev];
            newList[index] = updated;
            return newList.sort((a, b) => {
                const timeA = a.last_message_at ? new Date(a.last_message_at).getTime() : 0;
                const timeB = b.last_message_at ? new Date(b.last_message_at).getTime() : 0;
                return timeB - timeA;
            });
        }

        if (incomingConversation) {
            return [incomingConversation, ...prev].sort((a, b) => {
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
                    const conv = data.conversation || {};
                    const incoming = normalizeConversation({
                        ...conv,
                        assigned_to: conv.assignee_id ?? conv.assigned_to ?? null,
                        last_message_at: conv.last_message_at ?? conv.last_activity_at ?? null,
                    });
                    if (!incoming) return;
                    if (
                        account?.id != null &&
                        incoming.account_id != null &&
                        !isSameAccountId(incoming.account_id, account.id)
                    ) {
                        return;
                    }
                    setConversations((prev) => applyConversationUpdated(prev, incoming));

                    const previousHandoff = handoffStateRef.current.get(incoming.id);
                    if (incoming.handoff_status === 'manual' && previousHandoff !== 'manual') {
                        addToast({
                            title: 'Human takeover needed',
                            description: `${incoming.contact.name || incoming.contact.wa_id} was moved to Manual mode.`,
                            variant: 'warning',
                            duration: 5000,
                        });
                        playNotificationSound();
                        showBrowserNotification(`handoff-${incoming.id}-${Date.now()}`, 'Chat needs human attention', incoming.contact.name || incoming.contact.wa_id, incoming.id);
                    }
                    handoffStateRef.current.set(incoming.id, incoming.handoff_status ?? null);

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
                    assignmentStateRef.current.set(incoming.id, incoming.assigned_to ?? null);
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
                        const hadConversation = prev.some((c) => c.id === data.conversation_id);
                        const hasConversationPayload = Boolean(normalizeConversation(data.conversation));
                        const updated = applyMessageCreated(prev, data);
                        if (!hadConversation && !hasConversationPayload && data.conversation_id) {
                            fetchInboxStreamAndMerge();
                        }
                        return updated;
                    });
                    const message = normalizeChatMessage(data.message);
                    const conversationId = Number(data.conversation_id);
                    if (message && Number.isFinite(conversationId)) {
                        mergeMessages(conversationId, [message]);
                    }
                    if (data.message?.direction === 'inbound') {
                        notifyInboundMessage({
                            id: eventId,
                            conversationId: Number(data.conversation_id),
                            contactName: data.contact?.name || data.contact?.wa_id || null,
                            preview: data.message?.text_body || data.message?.type || null,
                            activeConversationId: activeId,
                        });
                    }
                    if (processedMessageIds.current.size > 100) {
                        const ids = Array.from(processedMessageIds.current);
                        processedMessageIds.current = new Set(ids.slice(-50));
                    }
                }
            }
        );

        const unsubscribeCallUpdated = subscribe(
            channel,
            '.whatsapp.call.updated',
            (data: any) => {
                const call = data?.call as InboxCallRecord | undefined;
                if (!call?.id) return;
                setRecentCallsState((prev) => mergeCallRecords(prev, [call]));
                if (isIncomingActionableCall(call)) {
                    fetchInboxStreamAndMerge();
                }
            }
        );

        return () => {
            unsubscribeConversationUpdated();
            unsubscribeMessageCreated();
            unsubscribeCallUpdated();
        };
    }, [account?.id, subscribe, addToast, currentUserId, notifyAssignmentEnabled, playNotificationSound, showBrowserNotification, fetchInboxStreamAndMerge, notifyInboundMessage, activeId, mergeMessages]);

    // Always-on polling so inbox updates even when realtime fails.
    useEffect(() => {
        if (!account?.id) return;

        const interval = setInterval(fetchInboxStreamAndMerge, 3000);
        fetchInboxStreamAndMerge();

        return () => clearInterval(interval);
    }, [account?.id, fetchInboxStreamAndMerge]);

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
            <div className="h-[calc(100vh-8rem)] w-full min-w-0 overflow-hidden lg:h-[calc(100vh-6rem)]">
                <div className={`grid h-full w-full min-w-0 overflow-hidden rounded-card border border-gray-100 bg-white shadow-card dark:border-waify-dark-border dark:bg-waify-dark-surface dark:shadow-none lg:grid-cols-[minmax(320px,360px)_minmax(0,1fr)] ${showContactPanel ? 'xl:grid-cols-[360px_minmax(0,1fr)_320px]' : 'xl:grid-cols-[360px_minmax(0,1fr)]'}`}>
                    <section className={`${mobileShowDetail ? 'hidden lg:flex' : 'flex'} min-h-0 min-w-0 w-full flex-col border-r border-gray-100 bg-white dark:border-waify-dark-border dark:bg-slate-900`}>
                        <div className="flex-shrink-0 border-b border-gray-100 p-4 dark:border-waify-dark-border">
                            <div className="mb-3 flex items-center justify-between">
                                <div>
                                    <h1 className="text-base font-semibold text-waify-text dark:text-waify-dark-text">Inbox</h1>
                                    <p className="text-[11px] text-waify-text-muted dark:text-waify-dark-text-muted">
                                        {filteredConversations.length} conversations
                                    </p>
                                </div>
                                <div className="flex items-center gap-1">
                                    <span className={`mr-1 hidden items-center gap-1 rounded-full px-2 py-1 text-[11px] sm:inline-flex ${connected ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300' : 'bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-300'}`}>
                                        {connected ? <Wifi className="h-3 w-3" /> : <WifiOff className="h-3 w-3" />}
                                        {connected ? 'Live' : 'Polling'}
                                    </span>
                                    {notificationPermission !== 'granted' && (
                                        <button type="button" onClick={() => void requestBrowserNotifications()} className="inline-flex h-9 items-center gap-1 rounded-btn bg-emerald-50 px-2 text-[11px] font-medium text-emerald-700 transition hover:bg-emerald-100 dark:bg-emerald-500/10 dark:text-emerald-300 dark:hover:bg-emerald-500/15" title="Enable browser notifications">
                                            <BellRing className="h-3.5 w-3.5" />
                                            <span className="hidden sm:inline">Alerts</span>
                                        </button>
                                    )}
                                    <button type="button" onClick={() => { setBulkMode(!bulkMode); setSelectedIds(new Set()); }} className={`flex h-9 w-9 items-center justify-center rounded-btn transition ${bulkMode ? 'bg-waify-green-soft text-waify-green-dark dark:bg-waify-green/10 dark:text-waify-green' : 'text-waify-text-muted hover:bg-gray-100 hover:text-waify-text dark:text-waify-dark-text-muted dark:hover:bg-slate-800 dark:hover:text-waify-dark-text'}`} title={bulkMode ? 'Exit bulk select' : 'Bulk select'}>
                                        {bulkMode ? <X className="h-4 w-4" /> : <CheckSquare className="h-4 w-4" />}
                                    </button>
                                    <button type="button" onClick={() => setShowNewChat(true)} className="flex h-9 w-9 items-center justify-center rounded-btn text-waify-text-muted transition hover:bg-gray-100 hover:text-waify-text dark:text-waify-dark-text-muted dark:hover:bg-slate-800 dark:hover:text-waify-dark-text" title="New chat">
                                        <Edit3 className="h-4 w-4" />
                                    </button>
                                </div>
                            </div>
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                                <TextInput type="search" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Search name or message..." className="pl-9 dark:bg-slate-800" />
                            </div>
                            <div className="mt-3 flex items-center gap-2">
                                <select className="flex-1 rounded-btn border-gray-200 px-3 py-1.5 text-xs shadow-sm focus:border-waify-green focus:ring-waify-green/20 dark:border-waify-dark-border dark:bg-slate-800">
                                    <option>Newest first</option>
                                    <option>Priority</option>
                                </select>
                                <button
                                    type="button"
                                    onClick={() => setStarredOnly(!starredOnly)}
                                    className={`flex h-9 w-9 items-center justify-center rounded-btn transition ${starredOnly ? 'bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-300' : 'text-waify-text-muted hover:bg-gray-100 dark:text-waify-dark-text-muted dark:hover:bg-slate-800'}`}
                                    aria-label="Starred only"
                                >
                                    <Star className={`h-4 w-4 ${starredOnly ? 'fill-amber-400' : ''}`} />
                                </button>
                            </div>
                            <div className="mt-3 flex items-center gap-2 overflow-x-auto">
                                {[
                                    ['all', 'All'],
                                    ['mine', 'Mine'],
                                    ['unassigned', 'Unassigned'],
                                    ['starred', 'Starred'],
                                    ['closed', 'Resolved'],
                                ].map(([value, label]) => (
                                    <button
                                        key={value}
                                        type="button"
                                        onClick={() => {
                                            if (value === 'mine') {
                                                setAssigneeFilter('me');
                                                setStatusFilter('all');
                                                setStarredOnly(false);
                                            } else if (value === 'unassigned') {
                                                setAssigneeFilter('unassigned');
                                                setStatusFilter('all');
                                                setStarredOnly(false);
                                            } else if (value === 'starred') {
                                                setStarredOnly(true);
                                                setAssigneeFilter('all');
                                                setStatusFilter('all');
                                            } else {
                                                setStatusFilter(value);
                                                setAssigneeFilter('all');
                                                setStarredOnly(false);
                                            }
                                        }}
                                        className={`h-7 flex-shrink-0 rounded-full px-2.5 text-[11px] font-medium transition ${((value === 'mine' && assigneeFilter === 'me') || (value === 'unassigned' && assigneeFilter === 'unassigned') || (value === 'starred' && starredOnly) || (value === statusFilter && !starredOnly && assigneeFilter === 'all')) ? 'bg-waify-green-soft text-waify-green-dark dark:bg-waify-green/10 dark:text-waify-green' : 'text-waify-text-muted hover:bg-gray-100 dark:text-waify-dark-text-muted dark:hover:bg-slate-800'}`}
                                    >
                                        {label}
                                    </button>
                                ))}
                            </div>
                            <div className="-mx-1 mt-2 flex gap-1 overflow-x-auto px-1">
                                {[{ id: 'all', label: 'All labels', count: filteredConversations.length }, ...INBOX_LABELS.map((label) => ({ ...label, count: conversations.filter((conversation) => getConversationLabels(conversation).includes(label.id)).length }))].map((label: any) => (
                                    <button
                                        key={label.id}
                                        type="button"
                                        onClick={() => setLabelFilter(label.id)}
                                        className={`h-7 flex-shrink-0 rounded-full px-2.5 text-[11px] font-medium transition ${labelFilter === label.id ? 'bg-waify-green-soft text-waify-green-dark dark:bg-waify-green/10 dark:text-waify-green' : 'text-waify-text-muted hover:bg-gray-100 dark:text-waify-dark-text-muted dark:hover:bg-slate-800'}`}
                                    >
                                        {label.label}
                                        {label.count > 0 && <span className="ml-1 opacity-70">{label.count}</span>}
                                    </button>
                                ))}
                            </div>
                            {bulkMode && (
                                <div className="mt-3 flex items-center justify-between rounded-lg bg-gray-50 px-3 py-2 text-xs text-waify-text-muted dark:bg-slate-800 dark:text-waify-dark-text-muted">
                                    <span>{selectedIds.size} selected</span>
                                    <button type="button" onClick={() => setSelectedIds(new Set(filteredConversations.map((conversation) => conversation.id)))} className="font-medium text-waify-green-dark dark:text-waify-green">
                                        Select visible
                                    </button>
                                </div>
                            )}
                            <div className="mt-3 grid grid-cols-2 gap-2">
                                {connections && connections.length > 0 && (
                                    <select value={connectionFilter} onChange={(e) => setConnectionFilter(e.target.value === 'all' ? 'all' : Number(e.target.value))} className="rounded-btn border-gray-200 px-3 py-1.5 text-xs shadow-sm focus:border-waify-green focus:ring-waify-green/20 dark:border-waify-dark-border dark:bg-slate-800">
                                        <option value="all">All numbers</option>
                                        {connections.map((conn) => <option key={conn.id} value={conn.id}>{conn.name}</option>)}
                                    </select>
                                )}
                                <select value={assigneeFilter} onChange={(e) => setAssigneeFilter(e.target.value as 'all' | 'me' | 'unassigned')} className="rounded-btn border-gray-200 px-3 py-1.5 text-xs shadow-sm focus:border-waify-green focus:ring-waify-green/20 dark:border-waify-dark-border dark:bg-slate-800">
                                    <option value="all">All assignees</option>
                                    <option value="me">Mine</option>
                                    <option value="unassigned">Unassigned</option>
                                </select>
                            </div>
                        </div>

                        <div className="min-h-0 flex-1 overflow-y-auto">
                            {loading ? (
                                <div className="p-2">{[...Array(5)].map((_, i) => <ConversationSkeleton key={i} />)}</div>
                            ) : filteredConversations.length === 0 ? (
                                <div className="p-6">
                                    <EmptyState icon={MessageSquare} title="No conversations" description="Try another filter or start a new conversation." />
                                </div>
                            ) : filteredConversations.map((conversation) => {
                                const isActive = activeConversation?.id === conversation.id;
                                const isSelected = selectedIds.has(conversation.id);
                                const assigneeName = conversation.assigned_to ? (agents.find((a) => a.id === conversation.assigned_to)?.name ?? 'Assigned') : 'Unassigned';
                                const labels = getConversationLabels(conversation);
                                const unreadCount = Number(conversation.unread_count ?? 0);
                                const sla = conversationSlaLabel(conversation);
                                const replyWindow = customerServiceWindowFor(conversation, [], replyWindowNow);
                                const sourceLabel = conversationSourceLabel(conversation);
                                const modeLabel = conversationModeLabel(conversation);
                                return (
                                    <div key={conversation.id} className={`flex w-full items-start gap-2 border-b border-gray-50 px-3 py-2.5 text-left transition dark:border-waify-dark-border ${isActive ? 'bg-waify-green-soft/60 dark:bg-emerald-950/40' : 'hover:bg-gray-50 dark:hover:bg-slate-800'}`}>
                                        {bulkMode && (
                                            <input
                                                type="checkbox"
                                                checked={isSelected}
                                                onChange={() => toggleSelectedConversation(conversation.id)}
                                                className="mt-3 rounded border-gray-300 text-waify-green focus:ring-waify-green/30 dark:border-waify-dark-border dark:bg-slate-800"
                                                aria-label={`Select ${conversation.contact.name || conversation.contact.wa_id}`}
                                            />
                                        )}
                                        <button type="button" onClick={() => { if (bulkMode) { toggleSelectedConversation(conversation.id); return; } setActiveId(conversation.id); setMobileShowDetail(true); }} className="flex min-w-0 flex-1 items-start gap-2.5 text-left">
                                        <div className="relative flex-shrink-0">
                                            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-waify-green text-sm font-semibold text-white">
                                                {conversation.contact.name?.charAt(0).toUpperCase() || conversation.contact.wa_id.charAt(0)}
                                            </div>
                                            <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-emerald-500 ring-2 ring-white dark:ring-slate-900" />
                                            {conversation.priority === 'urgent' && <span className="absolute -left-0.5 -top-0.5 h-2.5 w-2.5 rounded-full bg-red-500 ring-2 ring-white dark:ring-slate-900" />}
                                            {unreadCount > 0 && (
                                                <span className="absolute -right-1.5 -top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-waify-green px-1 text-[9px] font-bold text-white ring-2 ring-white dark:ring-slate-900">
                                                    {unreadCount > 9 ? '9+' : unreadCount}
                                                </span>
                                            )}
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <div className="flex items-center justify-between gap-2">
                                                <span className="truncate text-sm font-semibold text-waify-text dark:text-waify-dark-text">{conversation.contact.name || conversation.contact.wa_id}</span>
                                                <span className="flex-shrink-0 text-[11px] text-waify-text-muted dark:text-waify-dark-text-muted">{formatRelative(conversation.last_message_at)}</span>
                                            </div>
                                            <p className="mt-0.5 truncate text-xs text-waify-text-muted dark:text-waify-dark-text-muted">{conversation.last_message_preview || 'No messages yet'}</p>
                                            <div className="mt-1.5 flex min-w-0 items-center gap-1 overflow-hidden">
                                                <span className={`inline-flex flex-shrink-0 items-center gap-1 rounded-full px-1.5 py-0.5 text-[10px] font-medium ${slaClasses(sla.tone)}`}>
                                                    <Clock className="h-2.5 w-2.5" />
                                                    {sla.label}
                                                </span>
                                                <span className={`inline-flex flex-shrink-0 items-center gap-1 rounded-full px-1.5 py-0.5 text-[10px] font-medium ${slaClasses(replyWindow.tone)}`} title={replyWindow.detail}>
                                                    <MessageSquare className="h-2.5 w-2.5" />
                                                    {replyWindow.state === 'closed' ? 'Template required' : replyWindow.state === 'none' ? 'No window' : replyWindow.label.replace('Reply window ', '')}
                                                </span>
                                                <span className="min-w-0 truncate rounded-full bg-gray-100 px-1.5 py-0.5 text-[10px] font-medium text-gray-600 dark:bg-slate-800 dark:text-slate-300">
                                                    {sourceLabel}
                                                </span>
                                                <span className={`min-w-0 truncate rounded-full px-1.5 py-0.5 text-[10px] font-medium ${conversation.assigned_to ? 'bg-white text-waify-text-muted ring-1 ring-gray-100 dark:bg-slate-900 dark:text-waify-dark-text-muted dark:ring-slate-700' : 'bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-300'}`}>
                                                    {assigneeName}
                                                </span>
                                            </div>
                                            <div className="mt-1 flex flex-wrap items-center gap-1">
                                                {conversation.priority === 'urgent' && <Star className="h-3 w-3 fill-amber-400 text-amber-500" />}
                                                <Badge variant={conversation.status === 'open' ? 'success' : conversation.status === 'pending' ? 'warning' : 'default'} className="px-2 py-0.5 text-[10px]">{conversation.status}</Badge>
                                                <span className={`inline-flex items-center gap-1 rounded-full px-1.5 py-0.5 text-[10px] font-medium ${conversation.automation_processing ? 'bg-purple-50 text-purple-700 dark:bg-purple-500/10 dark:text-purple-200' : (conversation.bot_paused || conversation.handoff_status === 'manual') ? 'bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-300' : conversation.automation_state ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300' : 'bg-gray-100 text-gray-600 dark:bg-slate-800 dark:text-slate-300'}`}>
                                                    {conversation.automation_processing ? <Zap className="h-2.5 w-2.5" /> : conversation.bot_paused || conversation.handoff_status === 'manual' ? <User className="h-2.5 w-2.5" /> : <Zap className="h-2.5 w-2.5" />}
                                                    {modeLabel}
                                                </span>
                                                {labels.slice(0, 2).map((labelId) => {
                                                    const label = INBOX_LABELS.find((item) => item.id === labelId);
                                                    return label ? <span key={label.id} className={`rounded-md px-1.5 py-0.5 text-[10px] font-medium ${labelClasses(label.color)}`}>{label.label}</span> : null;
                                                })}
                                            </div>
                                        </div>
                                        </button>
                                    </div>
                                );
                            })}
                        </div>
                    </section>

                    <section className={`${mobileShowDetail ? 'flex' : 'hidden lg:flex'} min-h-0 min-w-0 w-full flex-col bg-gray-50/80 dark:bg-slate-950`}>
                        {activeConversation ? (
                            <>
                                <div className="flex min-h-14 flex-shrink-0 items-center gap-2 border-b border-gray-100 bg-white px-3 py-1.5 dark:border-waify-dark-border dark:bg-slate-900">
                                    <button type="button" onClick={() => setMobileShowDetail(false)} className="flex h-8 w-8 items-center justify-center rounded-md hover:bg-gray-100 dark:hover:bg-slate-800 lg:hidden" aria-label="Back">
                                        <ArrowLeft className="h-5 w-5" />
                                    </button>
                                    <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-waify-green text-sm font-semibold text-white">{activeConversation.contact.name?.charAt(0).toUpperCase() || 'C'}</div>
                                    <div className="min-w-0 flex-1">
                                        <div className="flex min-w-0 items-center gap-2">
                                            <div className="truncate text-sm font-semibold text-waify-text dark:text-waify-dark-text sm:text-base">{activeConversation.contact.name || activeConversation.contact.wa_id}</div>
                                            <Badge variant={activeConversation.status === 'open' ? 'success' : activeConversation.status === 'pending' ? 'warning' : 'default'} className="hidden px-2 py-0.5 text-[10px] sm:inline-flex">{activeConversation.status}</Badge>
                                        </div>
                                        <div className="mt-0.5 flex min-w-0 items-center gap-1.5 overflow-hidden text-[11px] text-waify-text-muted dark:text-waify-dark-text-muted">
                                            <span className="truncate">{contactDisplayPhone(activeConversation)}</span>
                                            <span className="h-1 w-1 flex-shrink-0 rounded-full bg-gray-300 dark:bg-slate-600" />
                                            <span className="hidden truncate md:inline">{conversationSourceLabel(activeConversation)}</span>
                                            <span className="hidden h-1 w-1 flex-shrink-0 rounded-full bg-gray-300 md:inline-block dark:bg-slate-600" />
                                            <span className="truncate">Assigned: {activeAgentName}</span>
                                        </div>
                                    </div>
                                    <button type="button" onClick={() => updateConversationMeta({ priority: activeConversation.priority === 'urgent' ? 'normal' : 'urgent' })} className={`flex h-8 w-8 items-center justify-center rounded-md transition ${activeConversation.priority === 'urgent' ? 'bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-300' : 'text-waify-text-muted hover:bg-gray-100 hover:text-waify-text dark:text-waify-dark-text-muted dark:hover:bg-slate-800 dark:hover:text-waify-dark-text'}`} title="Star">
                                        <Star className={`h-4 w-4 ${activeConversation.priority === 'urgent' ? 'fill-amber-400' : ''}`} />
                                    </button>
                                    {agents.length > 0 && (
                                        <label className="relative hidden sm:block">
                                            <User className="pointer-events-none absolute left-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-waify-text-muted dark:text-waify-dark-text-muted" />
                                            <select value={activeConversation.assigned_to ?? ''} disabled={assigningId === activeConversation.id} onChange={(e) => {
                                                const assignedTo = e.target.value === '' ? null : Number(e.target.value);
                                                setAssigningId(activeConversation.id);
                                                updateConversationMeta({ assigned_to: assignedTo });
                                                setAssigningId(null);
                                            }} className="h-8 max-w-[140px] rounded-btn border-gray-200 bg-white pl-7 pr-7 text-xs font-medium text-waify-text shadow-sm focus:border-waify-green focus:ring-waify-green/20 dark:border-waify-dark-border dark:bg-slate-900 dark:text-waify-dark-text">
                                                <option value="">Unassigned</option>
                                                {agents.map((agent) => <option key={agent.id} value={agent.id}>{agent.id === currentUserId ? 'You' : agent.name}</option>)}
                                            </select>
                                            <ChevronDown className="pointer-events-none absolute right-2 top-1/2 h-3 w-3 -translate-y-1/2 text-waify-text-muted dark:text-waify-dark-text-muted" />
                                        </label>
                                    )}
                                    <div className="relative">
                                        <button type="button" onClick={() => setActionsMenuOpen((open) => !open)} className={`flex h-8 w-8 items-center justify-center rounded-md transition ${actionsMenuOpen ? 'bg-gray-100 text-waify-text dark:bg-slate-800 dark:text-waify-dark-text' : 'text-waify-text-muted hover:bg-gray-100 hover:text-waify-text dark:text-waify-dark-text-muted dark:hover:bg-slate-800 dark:hover:text-waify-dark-text'}`} title="More">
                                            <MoreVertical className="h-4 w-4" />
                                        </button>
                                        {actionsMenuOpen && (
                                            <div className="absolute right-0 top-10 z-30 w-52 overflow-hidden rounded-card bg-white py-1 text-xs shadow-pop ring-1 ring-gray-100 dark:bg-slate-900 dark:ring-slate-700">
                                                <button type="button" onClick={() => { updateConversationMeta({ status: activeConversation.status === 'closed' ? 'open' : 'closed' }); setActionsMenuOpen(false); }} className="flex w-full items-center gap-2 px-3 py-2 text-left text-waify-text hover:bg-gray-50 dark:text-waify-dark-text dark:hover:bg-slate-800">
                                                    {activeConversation.status === 'closed' ? <RotateCcw className="h-4 w-4" /> : <CheckCircle className="h-4 w-4" />}
                                                    {activeConversation.status === 'closed' ? 'Reopen' : 'Resolve'}
                                                </button>
                                                <button type="button" onClick={() => { addToast({ title: 'Snoozed', description: 'Conversation snoozed for 1 hour.', variant: 'info' }); setActionsMenuOpen(false); }} className="flex w-full items-center gap-2 px-3 py-2 text-left text-waify-text hover:bg-gray-50 dark:text-waify-dark-text dark:hover:bg-slate-800">
                                                    <Clock className="h-4 w-4" />
                                                    Snooze 1 hour
                                                </button>
                                                <button type="button" onClick={() => { updateConversationMeta({ priority: 'urgent' }); setActionsMenuOpen(false); }} className="flex w-full items-center gap-2 px-3 py-2 text-left text-waify-text hover:bg-gray-50 dark:text-waify-dark-text dark:hover:bg-slate-800">
                                                    <Flag className="h-4 w-4" />
                                                    Mark urgent
                                                </button>
                                                <button type="button" onClick={() => { updateConversationMeta({ assigned_to: null }); setActionsMenuOpen(false); }} className="flex w-full items-center gap-2 px-3 py-2 text-left text-waify-text hover:bg-gray-50 dark:text-waify-dark-text dark:hover:bg-slate-800">
                                                    <UserX className="h-4 w-4" />
                                                    Unassign
                                                </button>
                                                {canDeleteChats && (
                                                    <button type="button" onClick={() => { setActionsMenuOpen(false); deleteConversation(); }} disabled={deletingConversationId === activeConversation.id} className="flex w-full items-center gap-2 px-3 py-2 text-left text-red-600 hover:bg-red-50 disabled:opacity-60 dark:text-red-300 dark:hover:bg-red-500/10">
                                                        <Trash2 className="h-4 w-4" />
                                                        Delete chat
                                                    </button>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                    <button type="button" onClick={() => setMobileContactPanelOpen(true)} className={`flex h-8 w-8 items-center justify-center rounded-md transition xl:hidden ${mobileContactPanelOpen ? 'bg-waify-green-soft text-waify-green-dark dark:bg-waify-green/10 dark:text-waify-green' : 'text-waify-text-muted hover:bg-gray-100 dark:text-waify-dark-text-muted dark:hover:bg-slate-800'}`} title="Contact details">
                                        <PanelRight className="h-4 w-4" />
                                    </button>
                                    <button type="button" onClick={() => setShowContactPanel(!showContactPanel)} className={`hidden h-8 w-8 items-center justify-center rounded-md transition xl:flex ${showContactPanel ? 'bg-waify-green-soft text-waify-green-dark dark:bg-waify-green/10 dark:text-waify-green' : 'text-waify-text-muted hover:bg-gray-100 dark:text-waify-dark-text-muted dark:hover:bg-slate-800'}`} title="Contact details">
                                        <PanelRight className="h-4 w-4" />
                                    </button>
                                </div>

                                <div className="flex-shrink-0 border-b border-gray-100 bg-gray-50/90 px-3 py-1.5 dark:border-waify-dark-border dark:bg-slate-800/95">
                                    <div className="flex min-w-0 items-center gap-1.5 overflow-x-auto waify-scrollbar">
                                        <span className={`inline-flex h-7 flex-shrink-0 items-center gap-1 rounded-full px-2.5 text-[11px] font-semibold ${activeBotIsReplying ? 'bg-purple-50 text-purple-700 dark:bg-purple-500/10 dark:text-purple-200' : activeManualMode ? 'bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-300' : activeAutomationState ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300' : 'bg-gray-100 text-gray-700 dark:bg-slate-700 dark:text-slate-200'}`}>
                                            {activeManualMode ? <User className="h-3 w-3" /> : <Zap className="h-3 w-3" />}
                                            {conversationModeLabel(activeConversation)}
                                        </span>
                                        <span className={`inline-flex h-7 flex-shrink-0 items-center gap-1 rounded-full px-2.5 text-[11px] font-medium ${slaClasses(conversationSlaLabel(activeConversation).tone)}`}>
                                            <Clock className="h-3 w-3" />
                                            SLA {conversationSlaLabel(activeConversation).label}
                                        </span>
                                        <span className={`inline-flex h-7 flex-shrink-0 items-center gap-1 rounded-full px-2.5 text-[11px] font-semibold ${slaClasses(activeReplyWindow.tone)}`} title={activeReplyWindow.detail}>
                                            <MessageSquare className="h-3 w-3" />
                                            {activeReplyWindow.label}
                                        </span>
                                        <span className="inline-flex h-7 flex-shrink-0 items-center gap-1 rounded-full bg-white px-2.5 text-[11px] font-medium text-waify-text-muted ring-1 ring-gray-100 dark:bg-slate-900 dark:text-waify-dark-text-muted dark:ring-slate-700">
                                            <User className="h-3 w-3" />
                                            {activeAgentName}
                                        </span>
                                        {activeConversation.priority && <span className="inline-flex h-7 flex-shrink-0 items-center gap-1 rounded-full bg-red-50 px-2.5 text-[11px] text-red-700 dark:bg-red-500/10 dark:text-red-300"><Flag className="h-3 w-3" /> {activeConversation.priority}</span>}
                                        <span className="h-5 w-px flex-shrink-0 bg-gray-200 dark:bg-slate-700" />
                                        <button type="button" onClick={() => updateConversationMeta({ status: activeConversation.status === 'closed' ? 'open' : 'closed' })} className={`inbox-resolve-btn inline-flex h-7 flex-shrink-0 items-center gap-1 rounded-md px-2.5 text-[11px] font-medium transition ${activeConversation.status === 'closed' ? 'is-resolved bg-gray-200 text-gray-700 dark:bg-slate-600 dark:text-slate-200' : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 dark:bg-emerald-500/10 dark:text-emerald-300'}`}>
                                            {activeConversation.status === 'closed' ? <RotateCcw className="h-3 w-3" /> : <CheckCircle className="h-3 w-3" />}
                                            {activeConversation.status === 'closed' ? 'Reopen' : 'Resolve'}
                                        </button>
                                        <button type="button" onClick={() => toggleBotPaused(!activeManualMode)} className={`inline-flex h-7 flex-shrink-0 items-center gap-1 rounded-md px-2.5 text-[11px] font-medium transition ${activeManualMode ? 'bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-700 dark:text-slate-100' : 'bg-amber-50 text-amber-700 hover:bg-amber-100 dark:bg-amber-500/10 dark:text-amber-300'}`}>
                                            {activeManualMode ? <Play className="h-3 w-3" /> : <User className="h-3 w-3" />}
                                            {activeManualMode ? 'Resume bot' : 'Manual'}
                                        </button>
                                        {INBOX_LABELS.filter((label) => !getConversationLabels(activeConversation).includes(label.id)).slice(0, 2).map((label) => (
                                            <button key={label.id} type="button" onClick={() => addConversationLabel(label.id)} className="inbox-label-add hidden flex-shrink-0 px-1.5 text-[10px] text-waify-text-muted hover:text-waify-green-dark dark:text-waify-dark-text-muted lg:inline-flex">
                                                + {label.label}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                                {activeBotIsReplying && (
                                    <div className="flex flex-shrink-0 flex-wrap items-center gap-2 border-b border-purple-100 bg-purple-50 px-3 py-2 text-xs text-purple-800 dark:border-purple-500/20 dark:bg-purple-500/10 dark:text-purple-200">
                                        <span className="inline-flex items-center gap-1.5 font-semibold">
                                            <Zap className="h-3.5 w-3.5" />
                                            {activeConversation.automation_processing_mode === 'ai' ? 'AI is replying' : 'Bot is replying'}
                                        </span>
                                        <span className="min-w-0 flex-1 truncate">Human sending is blocked for a few seconds to avoid duplicate replies.</span>
                                        <button type="button" onClick={() => toggleBotPaused(true)} className="inline-flex h-7 items-center gap-1 rounded-md bg-white px-2.5 text-[11px] font-medium text-purple-700 shadow-sm ring-1 ring-purple-100 transition hover:bg-purple-100 dark:bg-slate-900 dark:text-purple-200 dark:ring-purple-500/20">
                                            <User className="h-3 w-3" />
                                            Take over
                                        </button>
                                    </div>
                                )}
                                {activeManualMode && (
                                    <div className="flex flex-shrink-0 flex-wrap items-center gap-2 border-b border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800 dark:border-amber-500/20 dark:bg-amber-500/10 dark:text-amber-200">
                                        <span className="inline-flex items-center gap-1.5 font-semibold">
                                            <User className="h-3.5 w-3.5" />
                                            Manual mode
                                        </span>
                                        <span className="min-w-0 flex-1 truncate">{activeConversation.handoff_reason || activeConversation.bot_paused_reason || 'Automation and AI autopilot will not reply in this chat.'}</span>
                                        <button type="button" onClick={() => toggleBotPaused(false)} className="inline-flex h-7 items-center gap-1 rounded-md bg-white px-2.5 text-[11px] font-medium text-slate-700 shadow-sm ring-1 ring-slate-200 transition hover:bg-slate-100 dark:bg-slate-900 dark:text-slate-100 dark:ring-slate-700">
                                            <Play className="h-3 w-3" />
                                            Resume
                                        </button>
                                    </div>
                                )}
                                {!activeReplyWindow.isOpen && (
                                    <div className="flex flex-shrink-0 flex-wrap items-center gap-2 border-b border-red-100 bg-red-50 px-3 py-2 text-xs text-red-800 dark:border-red-500/20 dark:bg-red-500/10 dark:text-red-200">
                                        <span className="inline-flex items-center gap-1.5 font-semibold">
                                            <AlertCircle className="h-3.5 w-3.5" />
                                            {activeReplyWindow.state === 'closed' ? '24-hour window closed' : 'Template required'}
                                        </span>
                                        <span className="min-w-0 flex-1 truncate">{activeReplyWindow.detail}</span>
                                        <button type="button" onClick={() => { setShowTemplates(true); setShowQuickReplies(false); setShowInteractiveComposer(false); }} className="inline-flex h-7 items-center gap-1 rounded-md bg-white px-2.5 text-[11px] font-medium text-red-700 shadow-sm ring-1 ring-red-100 transition hover:bg-red-100 dark:bg-slate-900 dark:text-red-200 dark:ring-red-500/20">
                                            <FileText className="h-3 w-3" />
                                            Templates
                                        </button>
                                    </div>
                                )}
                                {activeAutomationState && (
                                    <div className="flex flex-shrink-0 flex-wrap items-center gap-2 border-b border-emerald-100 bg-emerald-50 px-3 py-2 text-xs text-emerald-800 dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-200">
                                        <span className="inline-flex items-center gap-1.5 font-semibold">
                                            <Zap className="h-3.5 w-3.5" />
                                            Automation waiting
                                        </span>
                                        <span className="min-w-0 flex-1 truncate">
                                            {activeAutomationState.flow_name}
                                            {activeAutomationState.waiting_node_label ? ` · ${activeAutomationState.waiting_node_label}` : ''}
                                            {(activeAutomationState.invalid_replies ?? 0) > 0 ? ` · ${activeAutomationState.invalid_replies} unmatched reply` : ''}
                                        </span>
                                        <button type="button" onClick={stopAutomation} className="inline-flex h-7 items-center gap-1 rounded-md bg-white px-2.5 text-[11px] font-medium text-red-600 shadow-sm ring-1 ring-emerald-100 transition hover:bg-red-50 dark:bg-slate-900 dark:text-red-300 dark:ring-emerald-500/20 dark:hover:bg-red-500/10">
                                            <Pause className="h-3 w-3" />
                                            Stop
                                        </button>
                                    </div>
                                )}

                                <div className="chat-bg min-h-0 flex-1 overflow-y-auto px-4 py-3 sm:px-6">
                                    <div className="mx-auto max-w-2xl space-y-3">
                                        {activeDisplayMessages.length === 0 && activeConversationLoading ? (
                                            <div className="py-16 text-center">
                                                <span className="mx-auto mb-3 block h-8 w-8 animate-spin rounded-full border-2 border-waify-green/30 border-t-waify-green" />
                                                <p className="text-sm font-medium text-waify-text dark:text-waify-dark-text">Loading messages</p>
                                            </div>
                                        ) : activeDisplayMessages.length === 0 ? (
                                            <div className="py-16 text-center">
                                                <MessageSquare className="mx-auto mb-3 h-10 w-10 text-gray-300" />
                                                <p className="text-sm font-medium text-waify-text dark:text-waify-dark-text">No messages loaded</p>
                                                <p className="mt-1 text-xs text-waify-text-muted dark:text-waify-dark-text-muted">Messages for this chat will appear here.</p>
                                            </div>
                                        ) : activeDisplayMessages.map((message, index) => {
                                            const previousMessage = activeDisplayMessages[index - 1];
                                            const showDateSeparator = !previousMessage || formatDateKey(previousMessage.created_at) !== formatDateKey(message.created_at);
                                            const dateSeparator = showDateSeparator ? (
                                                <div className="flex justify-center">
                                                    <span className="rounded-full bg-white/80 px-3 py-1 text-[11px] font-medium text-waify-text-muted shadow-sm dark:bg-slate-800/90 dark:text-waify-dark-text-muted">
                                                        {formatDateLabel(message.created_at)}
                                                    </span>
                                                </div>
                                            ) : null;

                                            if (message.type === 'automation_status') {
                                                const eventType = String(message.payload?.event_type ?? '');
                                                const isRunning = eventType.endsWith('_running') || eventType === 'ai_replying';
                                                const isFailed = eventType.endsWith('_failed');
                                                const isSkipped = eventType.endsWith('_skipped');
                                                const statusClass = isFailed
                                                    ? 'border-red-200 bg-red-50 text-red-700 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-300'
                                                    : isSkipped
                                                        ? 'border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-300'
                                                        : 'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-300';

                                                return (
                                                    <Fragment key={message.id}>
                                                    {dateSeparator}
                                                    <div className="flex justify-center px-2">
                                                        <div className={`inline-flex max-w-[92%] items-center gap-2 rounded-full border px-3 py-1.5 text-[11px] font-medium shadow-sm sm:max-w-[70%] ${statusClass}`}>
                                                            {isRunning ? <span className="h-2 w-2 animate-pulse rounded-full bg-current" /> : isFailed ? <AlertCircle className="h-3.5 w-3.5" /> : <Zap className="h-3.5 w-3.5" />}
                                                            <span className="truncate">{message.text_body}</span>
                                                            <span className="text-[10px] opacity-75" title={formatExactDateTime(message.created_at)}>{formatTime(message.created_at)}</span>
                                                        </div>
                                                    </div>
                                                    </Fragment>
                                                );
                                            }

                                            if (message.type === 'internal_note') {
                                                const author = message.payload?.created_by?.name ?? 'Team note';
                                                return (
                                                    <Fragment key={message.id}>
                                                    {dateSeparator}
                                                    <div className="flex justify-center px-2">
                                                        <div className="max-w-[92%] rounded-lg border border-waify-border bg-white px-3 py-2 text-xs text-waify-text shadow-sm dark:border-waify-dark-border dark:bg-slate-800 dark:text-waify-dark-text sm:max-w-[70%]">
                                                            <div className="mb-1 flex items-center gap-1.5 font-semibold text-waify-text dark:text-waify-dark-text">
                                                                <Lock className="h-3.5 w-3.5 text-waify-text-muted dark:text-waify-dark-text-muted" />
                                                                Internal note
                                                            </div>
                                                            <p className="whitespace-pre-wrap break-words">{message.text_body}</p>
                                                            <div className="mt-1.5 flex items-center justify-between gap-3 text-[10px] text-waify-text-muted dark:text-waify-dark-text-muted">
                                                                <span className="truncate">{author}</span>
                                                                <span title={formatExactDateTime(message.created_at)}>{formatTime(message.created_at)}</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    </Fragment>
                                                );
                                            }
                                            const outbound = message.direction === 'outbound';
                                            const isCallTranscript = isCallTranscriptMessage(message);
                                            const mediaPayload = message.payload?.[message.type] ?? {};
                                            const text = message.text_body || (message.type === 'template' ? 'Template message' : message.type === 'location' ? 'Location shared' : '');
                                            const mediaUrl = message.payload?.media?.local_url || message.payload?.link || message.payload?.url || mediaPayload?.link || mediaPayload?.url;
                                            const mediaId = message.payload?.media?.id || message.payload?.media_id || mediaPayload?.id;
                                            const filename = message.payload?.filename || mediaPayload?.filename || message.payload?.document?.filename || 'Attachment';
                                            const timelineBadge = timelineBadgeForMessage(message);
                                            return (
                                                <Fragment key={message.id}>
                                                {dateSeparator}
                                                <div className={`flex ${outbound ? 'justify-end' : 'justify-start'}`}>
                                                    <div className={`group relative max-w-[82%] rounded-lg px-4 py-2.5 text-sm shadow-sm ${isCallTranscript ? 'ring-1 ring-emerald-200 dark:ring-emerald-500/30' : ''} ${outbound ? 'bg-[#DCF8C6] text-waify-text dark:bg-[#005C4B] dark:text-white' : 'bg-white text-waify-text dark:bg-[#202C33] dark:text-waify-dark-text'}`}>
                                                        <div
                                                            className={`inbox-message-actionbar pointer-events-none absolute top-1 z-20 flex items-center gap-1 overflow-x-auto rounded-full bg-white/95 px-1.5 py-1 opacity-0 shadow-pop ring-1 ring-gray-100 transition group-hover:pointer-events-auto group-hover:opacity-100 dark:bg-slate-800/95 dark:ring-slate-700 ${outbound ? 'right-1' : 'left-1'}`}
                                                            onClick={(event) => event.stopPropagation()}
                                                            onMouseDown={(event) => event.preventDefault()}
                                                        >
                                                            {canReactToMessage(message) && (
                                                                <>
                                                                    {HOVER_REACTIONS.map((reaction) => (
                                                                        <button key={reaction} type="button" onClick={() => setReaction(message, reaction)} className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full text-base transition hover:bg-gray-100 dark:hover:bg-slate-700" aria-label={`React ${reaction}`}>
                                                                            {reaction}
                                                                        </button>
                                                                    ))}
                                                                    <span className="h-5 w-px bg-gray-100 dark:bg-slate-700" />
                                                                </>
                                                            )}
                                                            <button type="button" onClick={() => setReplyTo(message)} className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full text-waify-text-muted transition hover:bg-gray-100 hover:text-waify-text dark:text-waify-dark-text-muted dark:hover:bg-slate-700 dark:hover:text-waify-dark-text" aria-label="Reply">
                                                                <Reply className="h-3.5 w-3.5" />
                                                            </button>
                                                        </div>
                                                        {(messageReactions[String(message.id)] || activeMessageReactions[String(message.id)]) && (
                                                            <span className={`absolute -bottom-3 flex h-6 min-w-6 items-center justify-center rounded-full bg-white px-1.5 text-sm shadow-sm ring-1 ring-gray-100 dark:bg-slate-800 dark:ring-slate-700 ${outbound ? 'left-2' : 'right-2'}`}>
                                                                {messageReactions[String(message.id)] || activeMessageReactions[String(message.id)]}
                                                            </span>
                                                        )}
                                                        {message.reply_to && (
                                                            <div className="mb-2 border-l-2 border-waify-green bg-white/45 px-2 py-1 text-[11px] text-waify-text-muted dark:bg-black/10 dark:text-waify-dark-text-muted">
                                                                {message.reply_to}
                                                            </div>
                                                        )}
                                                        {timelineBadge && (() => {
                                                            const TimelineIcon = timelineBadge.icon;
                                                            return (
                                                                <div className={`mb-2 inline-flex items-center gap-1.5 rounded-full px-2 py-1 text-[10px] font-semibold uppercase tracking-wide ${timelineBadge.classes}`}>
                                                                    <TimelineIcon className="h-3 w-3" />
                                                                    {timelineBadge.label}
                                                                </div>
                                                            );
                                                        })()}
                                                        {isCallTranscript && (
                                                            <div className={`mb-2 inline-flex items-center gap-1.5 rounded-full px-2 py-1 text-[10px] font-semibold uppercase tracking-wide ${outbound ? 'bg-white/50 text-emerald-800 dark:bg-white/10 dark:text-emerald-100' : 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-200'}`}>
                                                                <Phone className="h-3 w-3" />
                                                                Call transcript · {callTranscriptSpeaker(message)}
                                                            </div>
                                                        )}
                                                        {message.type === 'interactive' && (
                                                            <div className="mb-2 rounded-lg bg-white/50 p-3 text-xs ring-1 ring-black/5 dark:bg-black/10 dark:ring-white/10">
                                                                <div className="mb-1 flex items-center gap-2 font-semibold">
                                                                    <ClipboardList className="h-4 w-4" />
                                                                    {message.payload?.interactive_type === 'flow' ? 'Form' : message.payload?.interactive_type === 'list' ? 'List message' : 'Reply buttons'}
                                                                </div>
                                                                {message.payload?.header_text && <div className="mb-1 font-medium">{message.payload.header_text}</div>}
                                                                <div className="whitespace-pre-wrap">{message.text_body}</div>
                                                                {message.payload?.buttons && (
                                                                    <div className="mt-2 flex flex-wrap gap-1">
                                                                        {message.payload.buttons.map((button: any) => <span key={button.id || button.text} className="rounded-full bg-waify-green-soft px-2 py-1 text-[11px] font-medium text-waify-green-dark dark:bg-waify-green/10 dark:text-waify-green">{button.text}</span>)}
                                                                    </div>
                                                                )}
                                                                {message.payload?.interactive?.action?.sections?.[0]?.rows && (
                                                                    <div className="mt-2 space-y-1">
                                                                        {message.payload.interactive.action.sections[0].rows.slice(0, 4).map((row: any) => <div key={row.id} className="rounded-md bg-white/60 px-2 py-1 dark:bg-slate-900/50">{row.title}</div>)}
                                                                    </div>
                                                                )}
                                                                {message.payload?.flow_id && <div className="mt-2 rounded-md bg-white/60 px-2 py-1 dark:bg-slate-900/50">Flow ID: {message.payload.flow_id}</div>}
                                                            </div>
                                                        )}
                                                        {message.type === 'image' && mediaUrl && (
                                                            <button type="button" onClick={() => setMediaPreview({ type: 'image', url: mediaUrl, title: filename, filename })} className="mb-2 block overflow-hidden rounded-md text-left">
                                                                <img src={mediaUrl} alt={filename} className="max-h-64 w-full object-cover" />
                                                            </button>
                                                        )}
                                                        {message.type === 'image' && !mediaUrl && (
                                                            <div className="mb-2 flex min-h-32 items-center justify-center rounded-md bg-white/50 px-3 py-6 text-center text-xs ring-1 ring-black/5 dark:bg-black/10 dark:ring-white/10">
                                                                <div>
                                                                    <ImageIcon className="mx-auto mb-2 h-6 w-6 text-waify-text-muted dark:text-waify-dark-text-muted" />
                                                                    <div className="font-medium">Image received</div>
                                                                    {mediaId && <div className="mt-1 max-w-48 truncate text-[10px] opacity-70">Meta media ID: {mediaId}</div>}
                                                                </div>
                                                            </div>
                                                        )}
                                                        {message.type === 'sticker' && mediaUrl && (
                                                            <button type="button" onClick={() => setMediaPreview({ type: 'sticker', url: mediaUrl, title: 'Sticker', filename: 'Sticker' })} className="mb-2 block w-fit overflow-hidden rounded-md text-left">
                                                                <img src={mediaUrl} alt="Sticker" className="max-h-40 max-w-40 object-contain" />
                                                            </button>
                                                        )}
                                                        {message.type === 'sticker' && !mediaUrl && (
                                                            <div className="mb-2 flex min-h-28 items-center justify-center rounded-md bg-white/50 px-3 py-5 text-center text-xs ring-1 ring-black/5 dark:bg-black/10 dark:ring-white/10">
                                                                <div>
                                                                    <ImageIcon className="mx-auto mb-2 h-6 w-6 text-waify-text-muted dark:text-waify-dark-text-muted" />
                                                                    <div className="font-medium">Sticker received</div>
                                                                    {mediaId && <div className="mt-1 max-w-48 truncate text-[10px] opacity-70">Meta media ID: {mediaId}</div>}
                                                                </div>
                                                            </div>
                                                        )}
                                                        {message.type === 'video' && mediaUrl && (
                                                            <ChatVideoCard
                                                                src={mediaUrl}
                                                                title={filename}
                                                                outbound={outbound}
                                                                onPreview={() => setMediaPreview({ type: 'video', url: mediaUrl, title: filename, filename })}
                                                            />
                                                        )}
                                                        {message.type === 'video' && !mediaUrl && (
                                                            <div className="mb-2 flex items-center gap-2 rounded-md bg-white/50 px-3 py-3 text-xs ring-1 ring-black/5 dark:bg-black/10 dark:ring-white/10">
                                                                <ImageIcon className="h-4 w-4" />
                                                                <span className="min-w-0 flex-1 truncate">Video received{mediaId ? ` (${mediaId})` : ''}</span>
                                                            </div>
                                                        )}
                                                        {message.type === 'audio' && mediaUrl && (
                                                            <ChatAudioPlayer
                                                                src={mediaUrl}
                                                                title={filename}
                                                                outbound={outbound}
                                                                voice={Boolean(message.payload?.voice || mediaPayload?.voice)}
                                                                onPreview={() => setMediaPreview({ type: 'audio', url: mediaUrl, title: filename, filename })}
                                                            />
                                                        )}
                                                        {message.type === 'audio' && !mediaUrl && (
                                                            <div className="mb-2 flex items-center gap-2 rounded-md bg-white/50 px-3 py-3 text-xs ring-1 ring-black/5 dark:bg-black/10 dark:ring-white/10">
                                                                <Mic className="h-4 w-4" />
                                                                <span className="min-w-0 flex-1 truncate">{mediaPayload?.voice ? 'Voice message received' : 'Audio received'}{mediaId ? ` (${mediaId})` : ''}</span>
                                                            </div>
                                                        )}
                                                        {message.type === 'document' && mediaUrl && (
                                                            <button type="button" onClick={() => setMediaPreview({ type: 'document', url: mediaUrl, title: filename, filename })} className="mb-2 flex w-full items-center gap-2 rounded-md bg-white/50 px-3 py-2 text-left text-xs ring-1 ring-black/5 dark:bg-black/10 dark:ring-white/10">
                                                                <FileIcon className="h-4 w-4" />
                                                                <span className="truncate">{filename}</span>
                                                            </button>
                                                        )}
                                                        {message.type === 'document' && !mediaUrl && (
                                                            <div className="mb-2 flex items-center gap-2 rounded-md bg-white/50 px-3 py-3 text-xs ring-1 ring-black/5 dark:bg-black/10 dark:ring-white/10">
                                                                <FileIcon className="h-4 w-4" />
                                                                <span className="min-w-0 flex-1 truncate">{filename}{mediaId ? ` (${mediaId})` : ''}</span>
                                                            </div>
                                                        )}
                                                        {message.type === 'location' && (
                                                            <div className="mb-2 flex items-center gap-2 rounded-md bg-white/50 px-3 py-2 text-xs ring-1 ring-black/5 dark:bg-black/10 dark:ring-white/10">
                                                                <MapPin className="h-4 w-4" />
                                                                <span>{message.payload?.name || text}</span>
                                                            </div>
                                                        )}
                                                        {text && <p className="whitespace-pre-wrap break-words">{text}</p>}
                                                        <div className={`mt-1.5 flex items-center justify-end gap-1 text-[10px] ${outbound ? 'text-gray-600 dark:text-emerald-100' : 'text-waify-text-muted dark:text-waify-dark-text-muted'}`}>
                                                            <span title={formatExactDateTime(message.created_at)}>{formatTime(message.created_at)}</span>
                                                            {outbound && (
                                                                <span className="inline-flex items-center gap-1">
                                                                    {messageStatusIcon(message)}
                                                                    {message.status === 'failed' && (
                                                                        <button type="button" onClick={() => retryMessage(message)} className="ml-1 rounded px-1 text-[10px] font-semibold text-red-600 transition hover:bg-red-50 dark:text-red-300 dark:hover:bg-red-500/10">
                                                                            Retry
                                                                        </button>
                                                                    )}
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                                </Fragment>
                                            );
                                        })}
                                        <div ref={messagesEndRef} />
                                    </div>
                                </div>

                                <div ref={composerRef} className="relative z-20 flex-shrink-0 border-t border-gray-100 bg-white p-3 dark:border-waify-dark-border dark:bg-slate-900">
                                    {replyTo && (
                                        <div className="mb-2 flex items-center gap-2 rounded-md border-l-2 border-waify-green bg-gray-50 px-3 py-2 dark:bg-slate-800">
                                            <Reply className="h-3.5 w-3.5 flex-shrink-0 text-waify-text-muted dark:text-waify-dark-text-muted" />
                                            <p className="min-w-0 flex-1 truncate text-xs text-waify-text-muted dark:text-waify-dark-text-muted">{messageReplyPreview(replyTo)}</p>
                                            <button type="button" onClick={() => setReplyTo(null)} className="rounded p-1 text-waify-text-muted hover:bg-gray-100 dark:text-waify-dark-text-muted dark:hover:bg-slate-700">
                                                <X className="h-3.5 w-3.5" />
                                            </button>
                                        </div>
                                    )}
                                    {showQuickReplies && (
                                        <div className="absolute bottom-full left-0 right-0 z-20 mx-3 mb-1 max-h-48 overflow-y-auto rounded-card bg-white shadow-pop ring-1 ring-gray-100 dark:bg-slate-900 dark:ring-slate-700">
                                            <div className="border-b border-gray-100 px-3 py-2 text-xs font-semibold text-waify-text-muted dark:border-waify-dark-border dark:text-waify-dark-text-muted">Quick replies</div>
                                            {QUICK_REPLIES.map((reply) => (
                                                <button key={reply.id} type="button" onClick={() => insertQuickReply(reply.text)} className="w-full border-b border-gray-50 px-3 py-2.5 text-left transition last:border-0 hover:bg-gray-50 dark:border-waify-dark-border dark:hover:bg-slate-800">
                                                    <div className="text-xs font-medium text-waify-text dark:text-waify-dark-text">{reply.label}</div>
                                                    <p className="mt-0.5 truncate text-[11px] text-waify-text-muted dark:text-waify-dark-text-muted">{reply.text}</p>
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                    {showTemplates && (
                                        <div className="absolute bottom-full left-0 right-0 z-20 mx-3 mb-1 max-h-56 overflow-y-auto rounded-card bg-white shadow-pop ring-1 ring-gray-100 dark:bg-slate-900 dark:ring-slate-700">
                                            <div className="border-b border-gray-100 px-3 py-2 text-xs font-semibold text-waify-text-muted dark:border-waify-dark-border dark:text-waify-dark-text-muted">Approved templates</div>
                                            {templates.length === 0 ? (
                                                <div className="px-3 py-6 text-center text-xs text-waify-text-muted dark:text-waify-dark-text-muted">No approved templates found.</div>
                                            ) : templates.slice(0, 8).map((template) => (
                                                <button key={template.id} type="button" onClick={() => applyTemplate(template)} className="w-full border-b border-gray-50 px-3 py-2.5 text-left transition last:border-0 hover:bg-gray-50 dark:border-waify-dark-border dark:hover:bg-slate-800">
                                                    <div className="flex items-center justify-between gap-2">
                                                        <div className="truncate text-xs font-medium text-waify-text dark:text-waify-dark-text">{template.name}</div>
                                                        <span className="text-[10px] text-waify-text-muted dark:text-waify-dark-text-muted">{template.language}</span>
                                                    </div>
                                                    <p className="mt-0.5 line-clamp-1 text-[11px] text-waify-text-muted dark:text-waify-dark-text-muted">{template.body_text || 'Template message'}</p>
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                    {showInteractiveComposer && (
                                        <div className="fixed bottom-20 left-3 right-3 z-50 flex max-h-[min(420px,calc(100dvh-7rem))] flex-col overflow-hidden rounded-card bg-white shadow-pop ring-1 ring-gray-100 dark:bg-slate-900 dark:ring-slate-700 sm:absolute sm:bottom-full sm:left-12 sm:right-auto sm:mb-2 sm:w-[420px] sm:max-h-[430px]">
                                            <div className="flex flex-shrink-0 items-center justify-between gap-2 border-b border-gray-100 px-3 py-2 dark:border-waify-dark-border">
                                                <div className="min-w-0">
                                                    <div className="text-xs font-semibold text-waify-text dark:text-waify-dark-text">Interactive message</div>
                                                    <p className="mt-0.5 hidden truncate text-[11px] text-waify-text-muted dark:text-waify-dark-text-muted sm:block">Saved buttons, lists, forms, products, links, payments, or contact cards.</p>
                                                </div>
                                                <button type="button" onClick={() => setShowInteractiveComposer(false)} className="rounded-md p-1 text-waify-text-muted hover:bg-gray-100 dark:text-waify-dark-text-muted dark:hover:bg-slate-800">
                                                    <X className="h-3.5 w-3.5" />
                                                </button>
                                            </div>
                                            <div className="flex flex-shrink-0 gap-1 overflow-x-auto border-b border-gray-100 bg-gray-50 px-2 py-1.5 dark:border-waify-dark-border dark:bg-slate-800/70 waify-scrollbar">
                                                {([
                                                    ['buttons', 'Buttons'],
                                                    ['list', 'List'],
                                                    ['form', 'Form'],
                                                    ['product', 'Product'],
                                                    ['link', 'Link'],
                                                    ['payment', 'Payment'],
                                                    ['contact', 'Contact'],
                                                ] as Array<[InteractiveMode, string]>).map(([mode, label]) => (
                                                    <button key={mode} type="button" onClick={() => setInteractiveMode(mode)} className={`h-7 flex-shrink-0 rounded-md px-2.5 text-[11px] font-medium transition ${interactiveMode === mode ? 'bg-white text-waify-green-dark shadow-sm dark:bg-slate-950 dark:text-waify-green' : 'text-waify-text-muted hover:bg-white/70 hover:text-waify-text dark:text-waify-dark-text-muted dark:hover:bg-slate-950/70 dark:hover:text-waify-dark-text'}`}>
                                                        {label}
                                                    </button>
                                                ))}
                                            </div>
                                            <div className="grid min-h-0 flex-1 gap-1.5 overflow-y-auto p-2.5 waify-scrollbar">
                                                {!['payment', 'contact', 'product'].includes(interactiveMode) && (
                                                    <>
                                                        <input value={interactiveDraft.header_text} onChange={(event) => setInteractiveDraft((current) => ({ ...current, header_text: event.target.value }))} placeholder="Header (optional)" className="rounded-btn border-gray-200 px-3 py-1.5 text-xs dark:border-waify-dark-border dark:bg-slate-800 dark:text-waify-dark-text" />
                                                        <textarea value={interactiveDraft.body_text} onChange={(event) => setInteractiveDraft((current) => ({ ...current, body_text: event.target.value }))} placeholder="Message body" rows={2} className="resize-none rounded-btn border-gray-200 px-3 py-1.5 text-xs dark:border-waify-dark-border dark:bg-slate-800 dark:text-waify-dark-text" />
                                                    </>
                                                )}
                                                {interactiveMode === 'buttons' && (
                                                    <>
                                                        <div className="flex items-center justify-between gap-2 rounded-btn border border-gray-100 bg-gray-50 px-2.5 py-1.5 text-[11px] dark:border-waify-dark-border dark:bg-slate-800">
                                                            <span className="min-w-0 truncate text-waify-text-muted dark:text-waify-dark-text-muted">
                                                                Create quick button labels here, or manage the full saved list.
                                                            </span>
                                                            <Link href={route('app.quick-replies.index')} className="inline-flex flex-shrink-0 items-center gap-1 rounded-md px-2 py-1 font-medium text-waify-green-dark hover:bg-white dark:text-waify-green dark:hover:bg-slate-950">
                                                                Manage
                                                                <ExternalLink className="h-3 w-3" />
                                                            </Link>
                                                        </div>
                                                        <div className="flex gap-2">
                                                            <input
                                                                value={newInteractiveButtonLabel}
                                                                onChange={(event) => setNewInteractiveButtonLabel(event.target.value.slice(0, 20))}
                                                                onKeyDown={(event) => {
                                                                    if (event.key === 'Enter') {
                                                                        event.preventDefault();
                                                                        saveInteractiveButton();
                                                                    }
                                                                }}
                                                                placeholder="Save new button text"
                                                                maxLength={20}
                                                                className="min-w-0 flex-1 rounded-btn border-gray-200 px-3 py-1.5 text-xs dark:border-waify-dark-border dark:bg-slate-800 dark:text-waify-dark-text"
                                                            />
                                                            <Button type="button" size="sm" variant="secondary" onClick={saveInteractiveButton} disabled={savingInteractiveButton || !newInteractiveButtonLabel.trim()}>
                                                                <Plus className="h-3.5 w-3.5" />
                                                                Save
                                                            </Button>
                                                        </div>
                                                        {savedButtonOptions.length > 0 && (
                                                            <div className="max-h-32 overflow-y-auto rounded-btn border border-gray-100 bg-gray-50 p-1.5 dark:border-waify-dark-border dark:bg-slate-800 waify-scrollbar">
                                                                <div className="mb-1 flex items-center justify-between gap-2 px-1 text-[10px] font-semibold uppercase tracking-wide text-waify-text-muted dark:text-waify-dark-text-muted">
                                                                    <span>Saved buttons</span>
                                                                    <span>{interactiveDraft.saved_button_ids.length}/3 selected</span>
                                                                </div>
                                                                <div className="grid gap-1 sm:grid-cols-2">
                                                                {savedButtonOptions.slice(0, 24).map((button) => {
                                                                    const active = interactiveDraft.saved_button_ids.includes(Number(button.id));
                                                                    return (
                                                                        <div
                                                                            key={button.id}
                                                                            className={`flex min-w-0 items-center gap-1 rounded-md px-1.5 py-1 text-[11px] ring-1 ${active ? 'bg-waify-green text-white ring-waify-green' : 'bg-white text-waify-text-muted ring-gray-100 dark:bg-slate-950 dark:text-waify-dark-text-muted dark:ring-slate-700'}`}
                                                                        >
                                                                            <button
                                                                                type="button"
                                                                                onClick={() => setInteractiveDraft((current) => {
                                                                                    const exists = current.saved_button_ids.includes(Number(button.id));
                                                                                    const next = exists
                                                                                        ? current.saved_button_ids.filter((id) => id !== Number(button.id))
                                                                                        : [...current.saved_button_ids, Number(button.id)].slice(0, 3);
                                                                                    return { ...current, saved_button_ids: next };
                                                                                })}
                                                                                className="min-w-0 flex-1 truncate text-left font-medium"
                                                                                title={active ? 'Remove from this message' : 'Add to this message'}
                                                                            >
                                                                                {button.button_text || button.label}
                                                                            </button>
                                                                            <button
                                                                                type="button"
                                                                                onClick={() => void deleteSavedInteractiveButton(button)}
                                                                                className={`flex h-5 w-5 flex-shrink-0 items-center justify-center rounded transition ${active ? 'text-white/80 hover:bg-white/15 hover:text-white' : 'text-waify-text-muted hover:bg-red-50 hover:text-red-600 dark:text-waify-dark-text-muted dark:hover:bg-red-500/10 dark:hover:text-red-300'}`}
                                                                                title="Delete saved button"
                                                                                aria-label={`Delete ${button.button_text || button.label}`}
                                                                            >
                                                                                <Trash2 className="h-3 w-3" />
                                                                            </button>
                                                                        </div>
                                                                    );
                                                                })}
                                                                </div>
                                                            </div>
                                                        )}
                                                        <p className="text-[11px] leading-relaxed text-waify-text-muted dark:text-waify-dark-text-muted">
                                                            Select up to 3 buttons for this message. Add/edit/delete the full library from Quick Replies.
                                                        </p>
                                                    </>
                                                )}
                                                {interactiveMode === 'list' && (
                                                    <>
                                                        <select value={interactiveDraft.list_id} onChange={(event) => setInteractiveDraft((current) => ({ ...current, list_id: event.target.value }))} className="rounded-btn border-gray-200 px-3 py-1.5 text-xs dark:border-waify-dark-border dark:bg-slate-800 dark:text-waify-dark-text">
                                                            <option value="">Choose saved list</option>
                                                            {savedLists.filter((list) => !list.connection_id || list.connection_id === activeConversation?.connection.id).map((list) => (
                                                                <option key={list.id} value={list.id}>{list.name}</option>
                                                            ))}
                                                        </select>
                                                        <p className="text-[11px] leading-relaxed text-waify-text-muted dark:text-waify-dark-text-muted">
                                                            Lists are sent from saved WhatsApp list templates only.
                                                        </p>
                                                    </>
                                                )}
                                                {interactiveMode === 'form' && (
                                                    <>
                                                        <select value={interactiveDraft.form_id} onChange={(event) => setInteractiveDraft((current) => ({ ...current, form_id: event.target.value }))} className="rounded-btn border-gray-200 px-3 py-1.5 text-xs dark:border-waify-dark-border dark:bg-slate-800 dark:text-waify-dark-text">
                                                            <option value="">Choose saved form</option>
                                                            {savedForms.filter((form) => !form.connection_id || form.connection_id === activeConversation?.connection.id).map((form) => (
                                                                <option key={form.id} value={form.id}>{form.name}{form.status && form.status !== 'published' ? ` (${form.status})` : ''}</option>
                                                            ))}
                                                        </select>
                                                        <input value={interactiveDraft.form_button_text} onChange={(event) => setInteractiveDraft((current) => ({ ...current, form_button_text: event.target.value }))} placeholder="Button label" maxLength={30} className="rounded-btn border-gray-200 px-3 py-1.5 text-xs dark:border-waify-dark-border dark:bg-slate-800 dark:text-waify-dark-text" />
                                                        <p className="text-[11px] leading-relaxed text-waify-text-muted dark:text-waify-dark-text-muted">
                                                            Sends an official WhatsApp Flow form inside WhatsApp. Custom surveys and Meta lead forms are not shown here.
                                                        </p>
                                                    </>
                                                )}
                                                {interactiveMode === 'product' && (
                                                    <>
                                                        {catalogProducts.length > 0 ? (
                                                            <div className="max-h-44 overflow-y-auto rounded-btn border border-gray-100 bg-gray-50 p-1 dark:border-waify-dark-border dark:bg-slate-800">
                                                                {catalogProducts.filter((product) => product.catalog_id && product.retailer_id).slice(0, 20).map((product) => (
                                                                    <button
                                                                        key={product.id}
                                                                        type="button"
                                                                        onClick={() => setInteractiveDraft((current) => ({ ...current, product_id: String(product.id) }))}
                                                                        className={`flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-xs ${String(product.id) === String(interactiveDraft.product_id) ? 'bg-waify-green/10 ring-1 ring-waify-green/30' : 'hover:bg-white dark:hover:bg-slate-950'}`}
                                                                    >
                                                                        {product.image_url ? (
                                                                            <img src={product.image_url} alt="" className="h-7 w-7 rounded object-cover" />
                                                                        ) : (
                                                                            <span className="flex h-7 w-7 items-center justify-center rounded bg-white text-waify-text-muted dark:bg-slate-950 dark:text-waify-dark-text-muted">
                                                                                <ShoppingBag className="h-3.5 w-3.5" />
                                                                            </span>
                                                                        )}
                                                                        <span className="min-w-0 flex-1">
                                                                            <span className="block truncate font-medium text-waify-text dark:text-waify-dark-text">{product.name}</span>
                                                                            <span className="block truncate text-[10px] text-waify-text-muted dark:text-waify-dark-text-muted">{product.retailer_id || product.sku} · {product.source || 'catalog'}</span>
                                                                        </span>
                                                                    </button>
                                                                ))}
                                                            </div>
                                                        ) : (
                                                            <p className="rounded-btn border border-amber-200 bg-amber-50 px-3 py-2 text-[11px] text-amber-800 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-200">
                                                                No synced products yet. Connect and sync Meta Catalog from Integrations first.
                                                            </p>
                                                        )}
                                                    </>
                                                )}
                                                {interactiveMode === 'link' && (
                                                    <>
                                                        <input value={interactiveDraft.cta_display_text} onChange={(event) => setInteractiveDraft((current) => ({ ...current, cta_display_text: event.target.value }))} placeholder="Button label" maxLength={20} className="rounded-btn border-gray-200 px-3 py-1.5 text-xs dark:border-waify-dark-border dark:bg-slate-800 dark:text-waify-dark-text" />
                                                        <input value={interactiveDraft.cta_url} onChange={(event) => setInteractiveDraft((current) => ({ ...current, cta_url: event.target.value }))} placeholder="https://example.com" inputMode="url" className="rounded-btn border-gray-200 px-3 py-1.5 text-xs dark:border-waify-dark-border dark:bg-slate-800 dark:text-waify-dark-text" />
                                                    </>
                                                )}
                                                {interactiveMode === 'payment' && (
                                                    <div className="grid gap-1.5 sm:grid-cols-2">
                                                        <input value={interactiveDraft.payment_amount} onChange={(event) => setInteractiveDraft((current) => ({ ...current, payment_amount: event.target.value }))} placeholder="Amount in INR" inputMode="decimal" className="rounded-btn border-gray-200 px-3 py-1.5 text-xs dark:border-waify-dark-border dark:bg-slate-800 dark:text-waify-dark-text" />
                                                        <input value={interactiveDraft.payment_expire_after_days} onChange={(event) => setInteractiveDraft((current) => ({ ...current, payment_expire_after_days: event.target.value }))} placeholder="Expires in days" inputMode="numeric" className="rounded-btn border-gray-200 px-3 py-1.5 text-xs dark:border-waify-dark-border dark:bg-slate-800 dark:text-waify-dark-text" />
                                                        <input value={interactiveDraft.payment_description} onChange={(event) => setInteractiveDraft((current) => ({ ...current, payment_description: event.target.value }))} placeholder="Payment description" className="rounded-btn border-gray-200 px-3 py-1.5 text-xs dark:border-waify-dark-border dark:bg-slate-800 dark:text-waify-dark-text sm:col-span-2" />
                                                        <input value={interactiveDraft.payment_button_text} onChange={(event) => setInteractiveDraft((current) => ({ ...current, payment_button_text: event.target.value }))} placeholder="Button label" maxLength={20} className="rounded-btn border-gray-200 px-3 py-1.5 text-xs dark:border-waify-dark-border dark:bg-slate-800 dark:text-waify-dark-text sm:col-span-2" />
                                                    </div>
                                                )}
                                                {interactiveMode === 'contact' && (
                                                    <>
                                                        <input value={interactiveDraft.contact_name} onChange={(event) => setInteractiveDraft((current) => ({ ...current, contact_name: event.target.value }))} placeholder="Contact name" className="rounded-btn border-gray-200 px-3 py-1.5 text-xs dark:border-waify-dark-border dark:bg-slate-800 dark:text-waify-dark-text" />
                                                        <input value={interactiveDraft.contact_phone} onChange={(event) => setInteractiveDraft((current) => ({ ...current, contact_phone: event.target.value }))} placeholder="Contact phone with country code" inputMode="tel" className="rounded-btn border-gray-200 px-3 py-1.5 text-xs dark:border-waify-dark-border dark:bg-slate-800 dark:text-waify-dark-text" />
                                                        <input value={interactiveDraft.contact_email} onChange={(event) => setInteractiveDraft((current) => ({ ...current, contact_email: event.target.value }))} placeholder="Email (optional)" inputMode="email" className="rounded-btn border-gray-200 px-3 py-1.5 text-xs dark:border-waify-dark-border dark:bg-slate-800 dark:text-waify-dark-text" />
                                                    </>
                                                )}
                                                {!['payment', 'contact', 'product'].includes(interactiveMode) && (
                                                    <input value={interactiveDraft.footer_text} onChange={(event) => setInteractiveDraft((current) => ({ ...current, footer_text: event.target.value }))} placeholder="Footer (optional)" className="rounded-btn border-gray-200 px-3 py-1.5 text-xs dark:border-waify-dark-border dark:bg-slate-800 dark:text-waify-dark-text" />
                                                )}
                                            </div>
                                            <div className="flex flex-shrink-0 items-center justify-end gap-2 border-t border-gray-100 bg-white px-3 py-2 dark:border-waify-dark-border dark:bg-slate-900">
                                                <Button type="button" size="sm" variant="secondary" onClick={() => setShowInteractiveComposer(false)}>
                                                    Cancel
                                                </Button>
                                                <Button type="button" size="sm" onClick={sendInteractiveMessage} disabled={sendingMessage || (!['contact', 'payment', 'form'].includes(interactiveMode) && !interactiveDraft.body_text.trim() && interactiveMode !== 'list') || (interactiveMode === 'buttons' && interactiveDraft.saved_button_ids.length === 0) || (interactiveMode === 'list' && !interactiveDraft.list_id) || (interactiveMode === 'form' && !interactiveDraft.form_id) || (interactiveMode === 'product' && !interactiveDraft.product_id) || (interactiveMode === 'link' && !interactiveDraft.cta_url.trim()) || (interactiveMode === 'payment' && !interactiveDraft.payment_amount.trim()) || (interactiveMode === 'contact' && (!interactiveDraft.contact_name.trim() || !interactiveDraft.contact_phone.trim()))}>
                                                    <Send className="h-3.5 w-3.5" />
                                                    Send {interactiveMode === 'form' ? 'form' : interactiveMode === 'payment' ? 'payment link' : interactiveMode === 'link' ? 'link' : interactiveMode === 'contact' ? 'contact' : interactiveMode}
                                                </Button>
                                            </div>
                                        </div>
                                    )}
                                    {showEmoji && (
                                        <div className="absolute bottom-full left-3 z-20 mb-1 flex gap-1 rounded-card bg-white p-2 shadow-pop ring-1 ring-gray-100 dark:bg-slate-900 dark:ring-slate-700">
                                            {EMOJI_QUICK.map((emoji) => (
                                                <button key={emoji} type="button" onClick={() => { setMessageDraft((draft) => draft + emoji); setShowEmoji(false); }} className="h-8 w-8 rounded-md text-lg transition hover:bg-gray-100 dark:hover:bg-slate-800">{emoji}</button>
                                            ))}
                                        </div>
                                    )}
                                    {showAttachments && (
                                        <div className="absolute bottom-full left-12 z-20 mb-1 w-48 overflow-hidden rounded-card bg-white py-1 shadow-pop ring-1 ring-gray-100 dark:bg-slate-900 dark:ring-slate-700">
                                            {[
                                                ['Photo or video', 'image/*,video/*', ImageIcon],
                                                ['Audio or voice', 'audio/aac,audio/mp4,audio/mpeg,audio/amr,audio/ogg,audio/wav,.aac,.m4a,.mp3,.amr,.ogg,.wav', Mic],
                                                ['Document', '.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.csv,.zip', FileIcon],
                                            ].map(([label, accept, Icon]: any) => (
                                                <button key={label} type="button" onClick={() => openFilePicker(accept)} className="flex w-full items-center gap-2 px-3 py-2 text-left text-xs text-waify-text transition hover:bg-gray-50 dark:text-waify-dark-text dark:hover:bg-slate-800">
                                                    <Icon className="h-4 w-4 text-waify-text-muted dark:text-waify-dark-text-muted" />
                                                    {label}
                                                </button>
                                            ))}
                                            <button type="button" onClick={() => { setShowAttachments(false); setShowLocationPicker(true); }} className="flex w-full items-center gap-2 px-3 py-2 text-left text-xs text-waify-text transition hover:bg-gray-50 dark:text-waify-dark-text dark:hover:bg-slate-800">
                                                <MapPin className="h-4 w-4 text-waify-text-muted dark:text-waify-dark-text-muted" />
                                                Location
                                            </button>
                                        </div>
                                    )}
                                    {showLocationPicker && (
                                        <div className="absolute bottom-full left-0 right-0 z-20 mx-3 mb-1 max-h-[78vh] overflow-y-auto rounded-card bg-white p-3 shadow-pop ring-1 ring-gray-100 dark:bg-slate-900 dark:ring-slate-700 sm:left-12 sm:right-auto sm:w-[380px]">
                                            <div className="mb-2 flex items-center justify-between">
                                                <div>
                                                    <div className="text-xs font-semibold text-waify-text dark:text-waify-dark-text">Send location</div>
                                                    <div className="text-[10px] text-waify-text-muted dark:text-waify-dark-text-muted">Search, use current, or click the map.</div>
                                                </div>
                                                <button type="button" onClick={() => setShowLocationPicker(false)} className="rounded-md p-1 text-waify-text-muted hover:bg-gray-100 dark:text-waify-dark-text-muted dark:hover:bg-slate-800">
                                                    <X className="h-3.5 w-3.5" />
                                                </button>
                                            </div>
                                            <div className="grid gap-2">
                                                <div className="flex gap-2">
                                                    <input
                                                        value={locationSearch}
                                                        onChange={(event) => setLocationSearch(event.target.value)}
                                                        onKeyDown={(event) => {
                                                            if (event.key === 'Enter') {
                                                                event.preventDefault();
                                                                void searchLocations();
                                                            }
                                                        }}
                                                        placeholder="Search address or landmark"
                                                        className="min-w-0 flex-1 rounded-btn border-gray-200 px-3 py-2 text-xs dark:border-waify-dark-border dark:bg-slate-800 dark:text-waify-dark-text"
                                                    />
                                                    <Button type="button" size="sm" variant="secondary" onClick={() => void searchLocations()} disabled={locationSearching}>
                                                        {locationSearching ? <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-waify-text-muted border-t-transparent" /> : <Search className="h-3.5 w-3.5" />}
                                                    </Button>
                                                </div>
                                                {locationResults.length > 0 && (
                                                    <div className="max-h-28 overflow-y-auto rounded-lg border border-gray-100 bg-gray-50 p-1 dark:border-waify-dark-border dark:bg-slate-800/70">
                                                        {locationResults.map((result) => (
                                                            <button
                                                                key={`${result.lat}-${result.lng}-${result.label}`}
                                                                type="button"
                                                                onClick={() => {
                                                                    selectLocation(result.lat, result.lng, result.label.split(',').slice(0, 2).join(', '));
                                                                    setLocationResults([]);
                                                                }}
                                                                className="flex w-full items-start gap-2 rounded-md px-2 py-1.5 text-left text-[11px] text-waify-text transition hover:bg-white dark:text-waify-dark-text dark:hover:bg-slate-900"
                                                            >
                                                                <MapPin className="mt-0.5 h-3.5 w-3.5 flex-shrink-0 text-waify-green" />
                                                                <span className="line-clamp-2">{result.label}</span>
                                                            </button>
                                                        ))}
                                                    </div>
                                                )}
                                                <div
                                                    role="button"
                                                    tabIndex={0}
                                                    onClick={handleLocationMapClick}
                                                    onKeyDown={(event) => {
                                                        if (event.key === 'Enter' || event.key === ' ') {
                                                            event.preventDefault();
                                                            selectLocation(locationMap.lat, locationMap.lng);
                                                        }
                                                    }}
                                                    className="relative h-48 cursor-crosshair overflow-hidden rounded-xl border border-gray-200 bg-slate-100 dark:border-waify-dark-border dark:bg-slate-800"
                                                    aria-label="Click map to choose a location"
                                                >
                                                    {locationTiles.map((tile) => (
                                                        <img
                                                            key={tile.key}
                                                            src={tile.url}
                                                            alt=""
                                                            draggable={false}
                                                            className="absolute h-64 w-64 select-none"
                                                            style={{ left: tile.left, top: tile.top }}
                                                        />
                                                    ))}
                                                    <div className="pointer-events-none absolute left-1/2 top-1/2 flex -translate-x-1/2 -translate-y-full flex-col items-center">
                                                        <MapPin className="h-8 w-8 fill-waify-green text-waify-green drop-shadow" />
                                                        <span className="h-2 w-2 rounded-full bg-waify-green shadow" />
                                                    </div>
                                                    <div className="absolute right-2 top-2 flex overflow-hidden rounded-md bg-white shadow-sm ring-1 ring-gray-200 dark:bg-slate-900 dark:ring-waify-dark-border">
                                                        <button type="button" onClick={(event) => { event.stopPropagation(); setLocationMap((current) => ({ ...current, zoom: Math.min(18, current.zoom + 1) })); }} className="flex h-7 w-7 items-center justify-center text-sm font-semibold text-waify-text hover:bg-gray-50 dark:text-waify-dark-text dark:hover:bg-slate-800">+</button>
                                                        <button type="button" onClick={(event) => { event.stopPropagation(); setLocationMap((current) => ({ ...current, zoom: Math.max(3, current.zoom - 1) })); }} className="flex h-7 w-7 items-center justify-center border-l border-gray-100 text-sm font-semibold text-waify-text hover:bg-gray-50 dark:border-waify-dark-border dark:text-waify-dark-text dark:hover:bg-slate-800">-</button>
                                                    </div>
                                                    <div className="absolute bottom-1 right-2 rounded bg-white/85 px-1.5 py-0.5 text-[9px] text-waify-text-muted dark:bg-slate-950/80 dark:text-waify-dark-text-muted">
                                                        OpenStreetMap
                                                    </div>
                                                </div>
                                                <input
                                                    value={locationInput.label}
                                                    onChange={(event) => setLocationInput((current) => ({ ...current, label: event.target.value }))}
                                                    placeholder="Location name"
                                                    className="rounded-btn border-gray-200 px-3 py-2 text-xs dark:border-waify-dark-border dark:bg-slate-800 dark:text-waify-dark-text"
                                                />
                                                <div className="grid grid-cols-2 gap-2">
                                                    <input
                                                        value={locationInput.latitude}
                                                        onChange={(event) => setLocationInput((current) => ({ ...current, latitude: event.target.value }))}
                                                        placeholder="Latitude"
                                                        inputMode="decimal"
                                                        className="rounded-btn border-gray-200 px-3 py-2 text-xs dark:border-waify-dark-border dark:bg-slate-800 dark:text-waify-dark-text"
                                                    />
                                                    <input
                                                        value={locationInput.longitude}
                                                        onChange={(event) => setLocationInput((current) => ({ ...current, longitude: event.target.value }))}
                                                        placeholder="Longitude"
                                                        inputMode="decimal"
                                                        className="rounded-btn border-gray-200 px-3 py-2 text-xs dark:border-waify-dark-border dark:bg-slate-800 dark:text-waify-dark-text"
                                                    />
                                                </div>
                                                {pickedLocationMapUrl && (
                                                    <a href={pickedLocationMapUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-[11px] font-medium text-waify-green-dark hover:underline dark:text-waify-green">
                                                        <ExternalLink className="h-3 w-3" />
                                                        Preview in Google Maps
                                                    </a>
                                                )}
                                                <div className="flex flex-wrap items-center gap-2">
                                                    <Button type="button" size="sm" variant="secondary" onClick={useCurrentLocationForPicker} disabled={sendingMessage}>
                                                        <MapPin className="h-3.5 w-3.5" />
                                                        Use current
                                                    </Button>
                                                    <Button type="button" size="sm" onClick={sendManualLocation} disabled={sendingMessage}>
                                                        Send location
                                                    </Button>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                    <input
                                        ref={fileInputRef}
                                        type="file"
                                        multiple
                                        accept={filePickerAccept}
                                        className="sr-only"
                                        tabIndex={-1}
                                        onChange={(event) => addPickedFiles(event.target.files)}
                                    />
                                    <div className="mb-1 flex flex-wrap items-center gap-1.5">
                                        <button type="button" onClick={() => { closeComposerPopovers(); setNoteMode(!noteMode); }} className={`whitespace-nowrap rounded-md px-2 py-0.5 text-[11px] font-medium transition ${noteMode ? 'bg-amber-100 text-amber-800 dark:bg-amber-500/10 dark:text-amber-200' : 'text-waify-text-muted hover:bg-gray-100 dark:text-waify-dark-text-muted dark:hover:bg-slate-800'}`}>
                                            <Lock className="mr-1 inline h-3 w-3" />
                                            {noteMode ? 'Note mode' : 'Add note'}
                                        </button>
                                        <button type="button" onClick={handleAiSuggest} disabled={aiSuggestLoading} className="flex items-center gap-1 rounded-md px-2 py-0.5 text-[11px] font-medium text-purple-600 transition hover:bg-purple-50 disabled:opacity-60 dark:text-purple-300 dark:hover:bg-purple-500/10">
                                            {aiSuggestLoading ? <span className="h-3 w-3 animate-spin rounded-full border-2 border-purple-300 border-t-transparent" /> : <Sparkles className="h-3 w-3" />}
                                            {aiSuggestLoading ? 'Thinking' : messageDraft.trim() ? 'Regenerate' : 'AI suggest'}
                                        </button>
                                        {aiAgents.length > 0 && (
                                            <div className="relative">
                                                <button
                                                    type="button"
                                                    onClick={() => setAiAgentMenuOpen((open) => !open)}
                                                    className="flex h-6 max-w-[180px] items-center gap-1.5 rounded-md border border-purple-100 bg-purple-50 px-2 text-[11px] font-medium text-purple-700 transition hover:border-purple-200 hover:bg-purple-100 dark:border-purple-500/20 dark:bg-purple-500/10 dark:text-purple-200 dark:hover:bg-purple-500/15"
                                                    aria-haspopup="listbox"
                                                    aria-expanded={aiAgentMenuOpen}
                                                >
                                                    <Sparkles className="h-3 w-3 flex-shrink-0" />
                                                    <span className="min-w-0 truncate">{selectedAiAgentLabel}</span>
                                                    <ChevronDown className="h-3 w-3 flex-shrink-0" />
                                                </button>
                                                {aiAgentMenuOpen && (
                                                    <div className="absolute bottom-full left-0 z-50 mb-2 w-[min(320px,calc(100vw-2rem))] overflow-hidden rounded-lg border border-purple-100 bg-white shadow-pop dark:border-purple-500/20 dark:bg-slate-900">
                                                        <div className="border-b border-gray-100 px-3 py-2 text-[11px] font-semibold uppercase tracking-wide text-waify-text-muted dark:border-waify-dark-border dark:text-waify-dark-text-muted">
                                                            AI agent
                                                        </div>
                                                        <div className="max-h-64 overflow-y-auto p-1">
                                                            {[
                                                                { id: 'default' as const, name: 'Default assistant', role: 'Platform AI', tone: 'fallback', avatar: null },
                                                                ...aiAgents,
                                                            ].map((agent) => {
                                                                const isSelected = selectedAiAgentId === agent.id;
                                                                return (
                                                                    <button
                                                                        key={agent.id}
                                                                        type="button"
                                                                        onClick={() => {
                                                                            setSelectedAiAgentId(agent.id);
                                                                            setAiAgentMenuOpen(false);
                                                                        }}
                                                                        className={`flex w-full items-start gap-2 rounded-md px-2 py-2 text-left transition ${isSelected ? 'bg-purple-50 text-purple-800 dark:bg-purple-500/10 dark:text-purple-200' : 'text-waify-text hover:bg-gray-50 dark:text-waify-dark-text dark:hover:bg-slate-800'}`}
                                                                        role="option"
                                                                        aria-selected={isSelected}
                                                                    >
                                                                        <span className="mt-0.5 flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-purple-100 text-xs font-semibold text-purple-700 dark:bg-purple-500/15 dark:text-purple-200">
                                                                            {agent.avatar || (agent.name || 'AI').charAt(0).toUpperCase()}
                                                                        </span>
                                                                        <span className="min-w-0 flex-1">
                                                                            <span className="block truncate text-xs font-semibold">{agent.name}</span>
                                                                            <span className="mt-0.5 block truncate text-[10px] capitalize text-waify-text-muted dark:text-waify-dark-text-muted">
                                                                                {[agent.role, agent.tone].filter(Boolean).join(' · ') || 'Assistant'}
                                                                            </span>
                                                                        </span>
                                                                        {isSelected && <Check className="mt-1 h-3.5 w-3.5 flex-shrink-0" />}
                                                                    </button>
                                                                );
                                                            })}
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                    {attachments.length > 0 && (
                                        <div ref={attachmentPreviewRef} className="mb-2 rounded-card border border-waify-green/30 bg-waify-green-soft/70 p-2 shadow-sm dark:border-waify-green/30 dark:bg-waify-green/10">
                                            <div className="mb-2 flex items-center justify-between gap-2">
                                                <div className="text-xs font-semibold text-waify-green-dark dark:text-waify-green">
                                                    {attachments.length} file{attachments.length === 1 ? '' : 's'} ready to send
                                                </div>
                                                <button type="button" onClick={() => setAttachments([])} className="text-[11px] font-medium text-waify-text-muted hover:text-waify-text dark:text-waify-dark-text-muted dark:hover:text-waify-dark-text">
                                                    Clear
                                                </button>
                                            </div>
                                            <div className="grid gap-2 sm:grid-cols-2">
                                            {attachments.map((file, index) => (
                                                <div key={`${file.name}-${index}`} className="flex min-w-0 items-center gap-2 rounded-btn bg-white px-2.5 py-2 text-xs shadow-sm ring-1 ring-gray-100 dark:bg-slate-800 dark:ring-slate-700">
                                                    <span className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-md bg-gray-50 text-waify-text-muted dark:bg-slate-900 dark:text-waify-dark-text-muted">
                                                        {file.type.startsWith('image/') ? <ImageIcon className="h-4 w-4" /> : file.type.startsWith('audio/') ? <Mic className="h-4 w-4" /> : <FileIcon className="h-4 w-4" />}
                                                    </span>
                                                    <span className="min-w-0 flex-1">
                                                        <span className="block truncate font-medium text-waify-text dark:text-waify-dark-text">{file.name}</span>
                                                        <span className="block text-[10px] text-waify-text-muted dark:text-waify-dark-text-muted">{file.type || 'file'} · {formatFileSize(file.size)}</span>
                                                    </span>
                                                    <button type="button" onClick={() => removeAttachment(index)} className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-md text-gray-400 hover:bg-gray-100 hover:text-gray-700 dark:hover:bg-slate-700 dark:hover:text-gray-200" aria-label={`Remove ${file.name}`}>
                                                        <X className="h-3.5 w-3.5" />
                                                    </button>
                                                </div>
                                            ))}
                                            </div>
                                        </div>
                                    )}
                                    <div className={`flex items-end gap-1.5 rounded-btn px-2.5 py-1.5 ${noteMode ? 'bg-white ring-1 ring-waify-border dark:bg-slate-800 dark:ring-waify-dark-border' : 'bg-gray-50 dark:bg-slate-800'}`}>
                                        {!noteMode && <button type="button" onClick={() => { setShowEmoji(!showEmoji); setShowAttachments(false); setShowLocationPicker(false); setShowTemplates(false); setShowQuickReplies(false); }} className="flex h-8 w-8 items-center justify-center rounded-md text-waify-text-muted hover:bg-gray-100 dark:text-waify-dark-text-muted dark:hover:bg-slate-700"><Smile className="h-4 w-4" /></button>}
                                        {!noteMode && (
                                            <button
                                                type="button"
                                                onClick={() => { setShowAttachments(!showAttachments); setShowLocationPicker(false); setShowEmoji(false); setShowTemplates(false); setShowQuickReplies(false); }}
                                                className={`relative flex h-8 w-8 items-center justify-center rounded-md transition ${attachments.length > 0 ? 'bg-waify-green text-white' : 'text-waify-text-muted hover:bg-gray-100 dark:text-waify-dark-text-muted dark:hover:bg-slate-700'}`}
                                                title={attachments.length > 0 ? `${attachments.length} file${attachments.length === 1 ? '' : 's'} attached` : 'Attach file'}
                                            >
                                                <Paperclip className="h-4 w-4" />
                                                {attachments.length > 0 && (
                                                    <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-white px-1 text-[9px] font-bold text-waify-green-dark shadow-sm ring-1 ring-waify-green/20">
                                                        {attachments.length}
                                                    </span>
                                                )}
                                            </button>
                                        )}
                                        {attachmentSummary && (
                                            <button
                                                type="button"
                                                onClick={() => attachmentPreviewRef.current?.scrollIntoView({ block: 'nearest', behavior: 'smooth' })}
                                                className="hidden min-w-0 max-w-[180px] items-center gap-1 rounded-md bg-waify-green-soft px-2 py-1 text-[11px] font-medium text-waify-green-dark ring-1 ring-waify-green/20 dark:bg-waify-green/10 dark:text-waify-green sm:flex"
                                                title={attachmentSummary}
                                            >
                                                <FileIcon className="h-3 w-3 flex-shrink-0" />
                                                <span className="truncate">{attachmentSummary}</span>
                                            </button>
                                        )}
                                        <textarea
                                            rows={1}
                                            value={messageDraft}
                                            onChange={(event) => setMessageDraft(event.target.value)}
                                            onKeyDown={(event) => {
                                                if (event.key === 'Enter' && !event.shiftKey) {
                                                    event.preventDefault();
                                                    sendInlineMessage();
                                                }
                                            }}
                                            placeholder={noteMode ? 'Write an internal note...' : activeBotIsReplying ? 'Bot is replying - take over to send manually' : !activeReplyWindow.isOpen ? '24h window closed - use an approved template' : 'Type a message...'}
                                            disabled={!noteMode && (activeBotIsReplying || !activeReplyWindow.isOpen)}
                                            className="max-h-24 flex-1 resize-none border-0 bg-transparent py-1 text-sm text-waify-text outline-none ring-0 placeholder:text-gray-400 disabled:cursor-not-allowed disabled:opacity-60 dark:text-waify-dark-text"
                                        />
                                        {!noteMode && <button type="button" onClick={toggleVoiceRecording} className={`flex h-8 w-8 items-center justify-center rounded-md transition ${recordingVoice ? 'bg-red-50 text-red-600 dark:bg-red-500/10 dark:text-red-300' : 'text-waify-text-muted hover:bg-gray-100 dark:text-waify-dark-text-muted dark:hover:bg-slate-700'}`} title={recordingVoice ? 'Stop recording' : 'Record voice message'}><Mic className="h-4 w-4" /></button>}
                                        <Button type="button" size="sm" onClick={sendInlineMessage} disabled={sendingMessage || (!noteMode && activeBotIsReplying) || ((!messageDraft.trim() && attachments.length === 0) && !freeFormReplyBlocked)}>
                                            {noteMode ? <Lock className="h-4 w-4" /> : <Send className="h-4 w-4" />}
                                            {sendingMessage ? 'Sending' : activeBotIsReplying && !noteMode ? 'Bot replying' : freeFormReplyBlocked ? 'Template' : noteMode ? 'Save' : 'Send'}
                                        </Button>
                                    </div>
                                    {!noteMode && <div className="mt-1 flex items-center gap-1 overflow-x-auto px-1 pb-0.5 text-[11px] text-waify-text-muted dark:text-waify-dark-text-muted waify-scrollbar">
                                            {[
                                                { label: 'Template', icon: FileText, active: showTemplates, onClick: () => { setShowTemplates(!showTemplates); setShowQuickReplies(false); setShowInteractiveComposer(false); setShowEmoji(false); setShowAttachments(false); setShowLocationPicker(false); } },
                                                { label: 'Quick replies', icon: Zap, active: showQuickReplies, onClick: () => { setShowQuickReplies(!showQuickReplies); setShowTemplates(false); setShowInteractiveComposer(false); setShowEmoji(false); setShowAttachments(false); setShowLocationPicker(false); } },
                                                { label: 'Interactive', icon: ClipboardList, active: showInteractiveComposer && !['payment', 'product'].includes(interactiveMode), onClick: () => { setInteractiveMode(interactiveMode === 'payment' || interactiveMode === 'product' ? 'buttons' : interactiveMode); setShowInteractiveComposer(!showInteractiveComposer || ['payment', 'product'].includes(interactiveMode)); setShowTemplates(false); setShowQuickReplies(false); setShowEmoji(false); setShowAttachments(false); setShowLocationPicker(false); } },
                                            ].map((item) => {
                                                const Icon = item.icon;
                                                return (
                                                    <button
                                                        key={item.label}
                                                        type="button"
                                                        onClick={item.onClick}
                                                        className={`inline-flex h-6 flex-shrink-0 items-center gap-1 rounded-md px-1.5 text-[10px] font-medium transition ${item.active ? 'bg-waify-green-soft text-waify-green-dark ring-1 ring-waify-green/15 dark:bg-waify-green/10 dark:text-waify-green' : 'hover:bg-gray-100 hover:text-waify-text dark:hover:bg-slate-800 dark:hover:text-waify-dark-text'}`}
                                                    >
                                                        <Icon className="h-3 w-3" />
                                                        {item.label}
                                                    </button>
                                                );
                                            })}
                                    </div>}
                                </div>
                            </>
                        ) : (
                            <div className="flex flex-1 items-center justify-center">
                                <EmptyState icon={MessageSquare} title="Select a conversation" description="Choose a chat from the list or start a new one." />
                            </div>
                        )}
                    </section>

                    {showContactPanel && activeConversation && (
                        <aside className="hidden min-h-0 flex-col border-l border-gray-100 bg-white dark:border-waify-dark-border dark:bg-slate-900 xl:flex">
                            <div className="flex h-10 flex-shrink-0 items-center justify-between border-b border-gray-100 px-3 dark:border-waify-dark-border">
                                <span className="text-xs font-semibold uppercase tracking-wide text-waify-text-muted dark:text-waify-dark-text-muted">Contact details</span>
                                <button type="button" onClick={() => setShowContactPanel(false)} className="flex h-8 w-8 items-center justify-center rounded-md text-waify-text-muted hover:bg-gray-100 dark:text-waify-dark-text-muted dark:hover:bg-slate-800">
                                    <X className="h-4 w-4" />
                                </button>
                            </div>
                            <div className="border-b border-gray-100 p-4 text-center dark:border-waify-dark-border">
                                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-waify-green text-2xl font-semibold text-white">{activeConversation.contact.name?.charAt(0).toUpperCase() || 'C'}</div>
                                <div className="mt-2 font-semibold text-waify-text dark:text-waify-dark-text">{activeConversation.contact.name || 'Unknown contact'}</div>
                                <div className="text-xs text-waify-text-muted dark:text-waify-dark-text-muted">{contactDisplayPhone(activeConversation)}</div>
                                <div className="mt-2 flex items-center justify-center gap-1">
                                    <button type="button" onClick={() => setContactTab('calls')} className={`flex h-8 w-8 items-center justify-center rounded-md transition ${callingReady ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 dark:bg-emerald-500/10 dark:text-emerald-300' : 'bg-gray-50 text-waify-text-muted hover:text-waify-text dark:bg-slate-800 dark:text-waify-dark-text-muted dark:hover:text-waify-dark-text'}`} title="WhatsApp calls"><Phone className="h-4 w-4" /></button>
                                    <button type="button" onClick={() => { setContactTab('notes'); setNoteMode(true); }} className="flex h-8 w-8 items-center justify-center rounded-md bg-gray-50 text-waify-text-muted transition hover:text-waify-text dark:bg-slate-800 dark:text-waify-dark-text-muted dark:hover:text-waify-dark-text"><StickyNote className="h-4 w-4" /></button>
                                    <button type="button" onClick={openContactEditor} className="flex h-8 w-8 items-center justify-center rounded-md bg-gray-50 text-waify-text-muted transition hover:text-waify-text dark:bg-slate-800 dark:text-waify-dark-text-muted dark:hover:text-waify-dark-text" title="Edit contact"><Edit3 className="h-4 w-4" /></button>
                                    {contactHref ? <Link href={contactHref} className="flex h-8 w-8 items-center justify-center rounded-md bg-gray-50 text-waify-text-muted transition hover:text-waify-text dark:bg-slate-800 dark:text-waify-dark-text-muted dark:hover:text-waify-dark-text"><ExternalLink className="h-4 w-4" /></Link> : <span className="flex h-8 w-8 items-center justify-center rounded-md bg-gray-50 text-waify-text-muted dark:bg-slate-800 dark:text-waify-dark-text-muted"><ExternalLink className="h-4 w-4" /></span>}
                                </div>
                            </div>
                            <div className="border-b border-gray-100 px-2 pt-2 dark:border-waify-dark-border">
                                <div className="grid grid-cols-6 gap-1">
                                    {[
                                        ['profile', User, 'Profile'],
                                        ['media', Paperclip, 'Media'],
                                        ['calls', Phone, 'Calls'],
                                        ['notes', StickyNote, 'Notes'],
                                        ['activity', RotateCcw, 'Activity'],
                                        ['orders', ShoppingBag, 'Orders'],
                                    ].map(([id, Icon, label]: any) => (
                                        <button
                                            key={id}
                                            type="button"
                                            onClick={() => setContactTab(id)}
                                            className={`flex flex-col items-center gap-1 rounded-md px-1.5 py-2 text-[10px] font-medium transition ${contactTab === id ? 'bg-waify-green-soft text-waify-green-dark dark:bg-waify-green/10 dark:text-waify-green' : 'text-waify-text-muted hover:bg-gray-100 dark:text-waify-dark-text-muted dark:hover:bg-slate-800'}`}
                                        >
                                            <Icon className="h-3.5 w-3.5" />
                                            {label}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <div className="min-h-0 flex-1 overflow-y-auto p-4">
                                {contactTab === 'profile' && (
                                    <div className="space-y-4">
                                        <div>
                                            <div className="mb-1.5 text-[10px] font-medium uppercase tracking-wider text-waify-text-muted dark:text-waify-dark-text-muted">Tags</div>
                                            <div className="flex flex-wrap gap-1">
                                                {activeLabels.length > 0 ? activeLabels.map((labelId) => {
                                                    const label = INBOX_LABELS.find((item) => item.id === labelId);
                                                    return label ? <span key={label.id} className={`rounded-md px-2 py-0.5 text-[11px] font-medium ${labelClasses(label.color)}`}>{label.label}</span> : null;
                                                }) : <span className="text-xs text-waify-text-muted dark:text-waify-dark-text-muted">No labels</span>}
                                            </div>
                                        </div>
                                        <dl className="space-y-3 text-xs">
                                            <div className="flex justify-between gap-3"><dt className="text-waify-text-muted dark:text-waify-dark-text-muted">Phone</dt><dd className="max-w-[160px] truncate text-right font-medium text-waify-text dark:text-waify-dark-text">{contactDisplayPhone(activeConversation)}</dd></div>
                                            <div className="flex justify-between gap-3"><dt className="text-waify-text-muted dark:text-waify-dark-text-muted">Email</dt><dd className="max-w-[160px] truncate text-right font-medium text-waify-text dark:text-waify-dark-text">{activeConversation.contact.email || '-'}</dd></div>
                                            <div className="flex justify-between gap-3"><dt className="text-waify-text-muted dark:text-waify-dark-text-muted">Company</dt><dd className="max-w-[160px] truncate text-right font-medium text-waify-text dark:text-waify-dark-text">{activeConversation.contact.company || '-'}</dd></div>
                                            <div className="flex justify-between gap-3"><dt className="text-waify-text-muted dark:text-waify-dark-text-muted">Source</dt><dd className="text-right font-medium capitalize text-waify-text dark:text-waify-dark-text">{activeConversation.contact.ctwa ? 'Click-to-WhatsApp ad' : (activeConversation.contact.source || 'WhatsApp').replaceAll('_', ' ')}</dd></div>
                                            <div className="flex justify-between gap-3"><dt className="text-waify-text-muted dark:text-waify-dark-text-muted">Contact status</dt><dd className="font-medium capitalize text-waify-text dark:text-waify-dark-text">{activeConversation.contact.status || 'active'}</dd></div>
                                            <div className="flex justify-between gap-3"><dt className="text-waify-text-muted dark:text-waify-dark-text-muted">Status</dt><dd><Badge variant={activeConversation.status === 'open' ? 'success' : 'default'}>{activeConversation.status}</Badge></dd></div>
                                            <div className="flex justify-between gap-3"><dt className="text-waify-text-muted dark:text-waify-dark-text-muted">Assigned</dt><dd className="font-medium text-waify-text dark:text-waify-dark-text">{activeAgentName}</dd></div>
                                            <div className="flex justify-between gap-3"><dt className="text-waify-text-muted dark:text-waify-dark-text-muted">Channel</dt><dd className="font-medium text-waify-text dark:text-waify-dark-text">{activeConversation.connection.name}</dd></div>
                                            <div className="flex justify-between gap-3"><dt className="text-waify-text-muted dark:text-waify-dark-text-muted">Messages</dt><dd className="font-medium text-waify-text dark:text-waify-dark-text">{activeTimelineMessages.length}</dd></div>
                                            <div className="flex justify-between gap-3"><dt className="text-waify-text-muted dark:text-waify-dark-text-muted">Media</dt><dd className="font-medium text-waify-text dark:text-waify-dark-text">{activeMediaCount}</dd></div>
                                            <div className="flex justify-between gap-3"><dt className="text-waify-text-muted dark:text-waify-dark-text-muted">Last activity</dt><dd className="text-right font-medium text-waify-text dark:text-waify-dark-text">{activeConversation.last_message_at ? new Date(activeConversation.last_message_at).toLocaleString() : '-'}</dd></div>
                                        </dl>
                                        {activeConversation.contact.ctwa && (
                                            <div className="rounded-lg border border-emerald-100 bg-emerald-50 p-3 text-xs text-emerald-950 dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-100">
                                                <div className="mb-2 flex items-center justify-between gap-2">
                                                    <span className="font-semibold">Click-to-WhatsApp Ad</span>
                                                    {activeConversation.contact.ctwa.source_url && (
                                                        <a href={activeConversation.contact.ctwa.source_url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-emerald-700 hover:underline dark:text-emerald-300">
                                                            Open <ExternalLink className="h-3 w-3" />
                                                        </a>
                                                    )}
                                                </div>
                                                {activeConversation.contact.ctwa.headline && <p className="font-medium">{activeConversation.contact.ctwa.headline}</p>}
                                                {activeConversation.contact.ctwa.body && <p className="mt-1 leading-relaxed text-emerald-800 dark:text-emerald-200">{activeConversation.contact.ctwa.body}</p>}
                                                <div className="mt-2 space-y-1 text-[11px] text-emerald-700 dark:text-emerald-300">
                                                    {activeConversation.contact.ctwa.source_id && <div>Ad/Post ID: {activeConversation.contact.ctwa.source_id}</div>}
                                                    {activeConversation.contact.ctwa.ctwa_clid && <div className="truncate">Click ID: {activeConversation.contact.ctwa.ctwa_clid}</div>}
                                                    {activeConversation.contact.ctwa.captured_at && <div>Captured: {new Date(activeConversation.contact.ctwa.captured_at).toLocaleString()}</div>}
                                                </div>
                                            </div>
                                        )}
                                        {activeConversation.contact.notes && (
                                            <div className="rounded-lg border border-gray-100 bg-gray-50 p-3 text-xs text-waify-text dark:border-waify-dark-border dark:bg-slate-800 dark:text-waify-dark-text">
                                                <div className="mb-1 text-[10px] font-medium uppercase tracking-wider text-waify-text-muted dark:text-waify-dark-text-muted">Contact notes</div>
                                                <p className="whitespace-pre-wrap break-words">{activeConversation.contact.notes}</p>
                                            </div>
                                        )}
                                    </div>
                                )}
                                {contactTab === 'notes' && (
                                    <div className="space-y-3">
                                        <textarea value={noteMode ? messageDraft : ''} onChange={(event) => { setNoteMode(true); setMessageDraft(event.target.value); }} rows={3} placeholder="Add internal note..." className="w-full resize-none rounded-btn border border-gray-200 bg-white px-3 py-2 text-sm dark:border-waify-dark-border dark:bg-slate-800" />
                                        <Button size="sm" onClick={() => { setNoteMode(true); sendInlineMessage(); }} disabled={!noteMode || !messageDraft.trim()}><Plus className="h-4 w-4" /> Add note</Button>
                                        <div className="rounded-lg border border-amber-100 bg-amber-50 p-3 text-xs text-amber-900 dark:border-amber-500/20 dark:bg-amber-500/10 dark:text-amber-200">
                                            Internal notes are saved to this conversation and visible to your team only.
                                        </div>
                                        <div className="space-y-2">
                                            {activeNotes.length === 0 ? (
                                                <div className="rounded-lg border border-dashed border-gray-200 p-4 text-center text-xs text-waify-text-muted dark:border-waify-dark-border dark:text-waify-dark-text-muted">No saved notes yet.</div>
                                            ) : [...activeNotes].reverse().map((note) => (
                                                <div key={note.id} className="rounded-lg border border-gray-100 bg-white p-3 text-xs shadow-sm dark:border-waify-dark-border dark:bg-slate-800">
                                                    <p className="whitespace-pre-wrap break-words text-waify-text dark:text-waify-dark-text">{note.text_body}</p>
                                                    <div className="mt-2 flex items-center justify-between gap-2 text-[10px] text-waify-text-muted dark:text-waify-dark-text-muted">
                                                        <span className="truncate">{note.payload?.created_by?.name ?? 'Team note'}</span>
                                                        <span>{new Date(note.created_at).toLocaleString()}</span>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                                {contactTab === 'media' && (
                                    <ContactGalleryPanel
                                        gallery={activeGallery}
                                        loading={galleryLoadingId === activeConversation.id}
                                        onPreview={(item) => {
                                            if (!item.url) return;
                                            setMediaPreview({
                                                type: item.type,
                                                url: item.url,
                                                title: item.filename || item.title || `${item.type} message`,
                                                filename: item.filename || item.title || undefined,
                                            });
                                        }}
                                    />
                                )}
                                {contactTab === 'calls' && (
                                    <InboxCallingPanel
                                        conversation={activeConversation}
                                        calling={whatsappCalling}
                                        calls={activeCalls}
                                        callingReady={callingReady}
                                    />
                                )}
                                {contactTab === 'activity' && (
                                    <div className="space-y-4 text-xs">
                                        {[
                                            ['Conversation opened', activeConversation.last_message_at],
                                            [`${activeInboundCount} inbound messages`, lastInboundAt],
                                            [`${activeOutboundCount} outbound messages`, lastOutboundAt],
                                            [`Assigned to ${activeAgentName}`, activeConversation.last_message_at],
                                        ].map(([item, time]) => (
                                            <div key={item} className="flex gap-3">
                                                <span className="mt-0.5 flex h-6 w-6 items-center justify-center rounded-full bg-gray-100 text-gray-600 dark:bg-slate-800 dark:text-slate-300"><RotateCcw className="h-3 w-3" /></span>
                                                <div>
                                                    <div className="font-medium text-waify-text dark:text-waify-dark-text">{item}</div>
                                                    <div className="text-waify-text-muted dark:text-waify-dark-text-muted">{time ? new Date(String(time)).toLocaleString() : '-'}</div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                                {contactTab === 'orders' && (
                                    <div className="space-y-2">
                                        <EmptyState icon={ShoppingBag} title="No linked orders" description="Orders will appear here when ecommerce integrations attach order metadata to this contact." />
                                    </div>
                                )}
                            </div>
                        </aside>
                    )}

                    {mobileContactPanelOpen && activeConversation && (
                        <div className="fixed inset-0 z-[250] flex justify-end xl:hidden">
                            <button
                                type="button"
                                aria-label="Close contact details"
                                className="absolute inset-0 bg-black/40"
                                onClick={() => setMobileContactPanelOpen(false)}
                            />
                            <aside className="relative flex h-full w-full max-w-sm flex-col bg-white shadow-pop dark:bg-slate-900">
                                <div className="flex h-12 flex-shrink-0 items-center justify-between border-b border-gray-100 px-4 dark:border-waify-dark-border">
                                    <span className="text-sm font-semibold text-waify-text dark:text-waify-dark-text">Contact details</span>
                                    <button type="button" onClick={() => setMobileContactPanelOpen(false)} className="flex h-8 w-8 items-center justify-center rounded-md text-waify-text-muted hover:bg-gray-100 dark:text-waify-dark-text-muted dark:hover:bg-slate-800">
                                        <X className="h-4 w-4" />
                                    </button>
                                </div>
                                <div className="border-b border-gray-100 p-4 text-center dark:border-waify-dark-border">
                                    <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-waify-green text-2xl font-semibold text-white">{activeConversation.contact.name?.charAt(0).toUpperCase() || 'C'}</div>
                                <div className="mt-2 font-semibold text-waify-text dark:text-waify-dark-text">{activeConversation.contact.name || 'Unknown contact'}</div>
                                <div className="text-xs text-waify-text-muted dark:text-waify-dark-text-muted">{contactDisplayPhone(activeConversation)}</div>
                                <div className="mt-2 flex items-center justify-center gap-1">
                                        <button type="button" onClick={() => setContactTab('calls')} className={`flex h-8 w-8 items-center justify-center rounded-md transition ${callingReady ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 dark:bg-emerald-500/10 dark:text-emerald-300' : 'bg-gray-50 text-waify-text-muted hover:text-waify-text dark:bg-slate-800 dark:text-waify-dark-text-muted dark:hover:text-waify-dark-text'}`} title="WhatsApp calls"><Phone className="h-4 w-4" /></button>
                                        <button type="button" onClick={() => { setContactTab('notes'); setNoteMode(true); }} className="flex h-8 w-8 items-center justify-center rounded-md bg-gray-50 text-waify-text-muted transition hover:text-waify-text dark:bg-slate-800 dark:text-waify-dark-text-muted dark:hover:text-waify-dark-text"><StickyNote className="h-4 w-4" /></button>
                                        <button type="button" onClick={openContactEditor} className="flex h-8 w-8 items-center justify-center rounded-md bg-gray-50 text-waify-text-muted transition hover:text-waify-text dark:bg-slate-800 dark:text-waify-dark-text-muted dark:hover:text-waify-dark-text" title="Edit contact"><Edit3 className="h-4 w-4" /></button>
                                        {contactHref ? <Link href={contactHref} className="flex h-8 w-8 items-center justify-center rounded-md bg-gray-50 text-waify-text-muted transition hover:text-waify-text dark:bg-slate-800 dark:text-waify-dark-text-muted dark:hover:text-waify-dark-text"><ExternalLink className="h-4 w-4" /></Link> : <span className="flex h-8 w-8 items-center justify-center rounded-md bg-gray-50 text-waify-text-muted dark:bg-slate-800 dark:text-waify-dark-text-muted"><ExternalLink className="h-4 w-4" /></span>}
                                    </div>
                                </div>
                                <div className="border-b border-gray-100 px-2 pt-2 dark:border-waify-dark-border">
                                    <div className="grid grid-cols-6 gap-1">
                                        {[
                                            ['profile', User, 'Profile'],
                                            ['media', Paperclip, 'Media'],
                                            ['calls', Phone, 'Calls'],
                                            ['notes', StickyNote, 'Notes'],
                                            ['activity', RotateCcw, 'Activity'],
                                            ['orders', ShoppingBag, 'Orders'],
                                        ].map(([id, Icon, label]: any) => (
                                            <button
                                                key={id}
                                                type="button"
                                                onClick={() => setContactTab(id)}
                                                className={`flex flex-col items-center gap-1 rounded-md px-1.5 py-2 text-[10px] font-medium transition ${contactTab === id ? 'bg-waify-green-soft text-waify-green-dark dark:bg-waify-green/10 dark:text-waify-green' : 'text-waify-text-muted hover:bg-gray-100 dark:text-waify-dark-text-muted dark:hover:bg-slate-800'}`}
                                            >
                                                <Icon className="h-3.5 w-3.5" />
                                                {label}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                                <div className="min-h-0 flex-1 overflow-y-auto p-4">
                                    {contactTab === 'profile' && (
                                        <dl className="space-y-3 text-xs">
                                            <div className="flex justify-between gap-3"><dt className="text-waify-text-muted dark:text-waify-dark-text-muted">Phone</dt><dd className="max-w-[180px] truncate text-right font-medium text-waify-text dark:text-waify-dark-text">{contactDisplayPhone(activeConversation)}</dd></div>
                                            <div className="flex justify-between gap-3"><dt className="text-waify-text-muted dark:text-waify-dark-text-muted">Email</dt><dd className="max-w-[180px] truncate text-right font-medium text-waify-text dark:text-waify-dark-text">{activeConversation.contact.email || '-'}</dd></div>
                                            <div className="flex justify-between gap-3"><dt className="text-waify-text-muted dark:text-waify-dark-text-muted">Company</dt><dd className="max-w-[180px] truncate text-right font-medium text-waify-text dark:text-waify-dark-text">{activeConversation.contact.company || '-'}</dd></div>
                                            <div className="flex justify-between gap-3"><dt className="text-waify-text-muted dark:text-waify-dark-text-muted">Contact status</dt><dd className="font-medium capitalize text-waify-text dark:text-waify-dark-text">{activeConversation.contact.status || 'active'}</dd></div>
                                            <div className="flex justify-between gap-3"><dt className="text-waify-text-muted dark:text-waify-dark-text-muted">Status</dt><dd><Badge variant={activeConversation.status === 'open' ? 'success' : 'default'}>{activeConversation.status}</Badge></dd></div>
                                            <div className="flex justify-between gap-3"><dt className="text-waify-text-muted dark:text-waify-dark-text-muted">Assigned</dt><dd className="font-medium text-waify-text dark:text-waify-dark-text">{activeAgentName}</dd></div>
                                            <div className="flex justify-between gap-3"><dt className="text-waify-text-muted dark:text-waify-dark-text-muted">Channel</dt><dd className="font-medium text-waify-text dark:text-waify-dark-text">{activeConversation.connection.name}</dd></div>
                                            <div className="flex justify-between gap-3"><dt className="text-waify-text-muted dark:text-waify-dark-text-muted">Messages</dt><dd className="font-medium text-waify-text dark:text-waify-dark-text">{activeTimelineMessages.length}</dd></div>
                                            <div className="flex justify-between gap-3"><dt className="text-waify-text-muted dark:text-waify-dark-text-muted">Media</dt><dd className="font-medium text-waify-text dark:text-waify-dark-text">{activeMediaCount}</dd></div>
                                            <div className="flex justify-between gap-3"><dt className="text-waify-text-muted dark:text-waify-dark-text-muted">Last activity</dt><dd className="text-right font-medium text-waify-text dark:text-waify-dark-text">{activeConversation.last_message_at ? new Date(activeConversation.last_message_at).toLocaleString() : '-'}</dd></div>
                                        </dl>
                                    )}
                                    {contactTab === 'notes' && (
                                        <div className="space-y-3">
                                            <textarea value={noteMode ? messageDraft : ''} onChange={(event) => { setNoteMode(true); setMessageDraft(event.target.value); }} rows={3} placeholder="Add internal note..." className="w-full resize-none rounded-btn border border-gray-200 bg-white px-3 py-2 text-sm dark:border-waify-dark-border dark:bg-slate-800" />
                                            <Button size="sm" onClick={() => { setNoteMode(true); sendInlineMessage(); }} disabled={!noteMode || !messageDraft.trim()}><Plus className="h-4 w-4" /> Add note</Button>
                                            <div className="space-y-2">
                                                {activeNotes.length === 0 ? (
                                                    <div className="rounded-lg border border-dashed border-gray-200 p-4 text-center text-xs text-waify-text-muted dark:border-waify-dark-border dark:text-waify-dark-text-muted">No saved notes yet.</div>
                                                ) : [...activeNotes].reverse().map((note) => (
                                                    <div key={note.id} className="rounded-lg border border-gray-100 bg-white p-3 text-xs shadow-sm dark:border-waify-dark-border dark:bg-slate-800">
                                                        <p className="whitespace-pre-wrap break-words text-waify-text dark:text-waify-dark-text">{note.text_body}</p>
                                                        <div className="mt-2 flex items-center justify-between gap-2 text-[10px] text-waify-text-muted dark:text-waify-dark-text-muted">
                                                            <span className="truncate">{note.payload?.created_by?.name ?? 'Team note'}</span>
                                                            <span>{new Date(note.created_at).toLocaleString()}</span>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                    {contactTab === 'media' && (
                                        <ContactGalleryPanel
                                            gallery={activeGallery}
                                            loading={galleryLoadingId === activeConversation.id}
                                            onPreview={(item) => {
                                                if (!item.url) return;
                                                setMediaPreview({
                                                    type: item.type,
                                                    url: item.url,
                                                    title: item.filename || item.title || `${item.type} message`,
                                                    filename: item.filename || item.title || undefined,
                                                });
                                            }}
                                        />
                                    )}
                                    {contactTab === 'calls' && (
                                        <InboxCallingPanel
                                            conversation={activeConversation}
                                            calling={whatsappCalling}
                                            calls={activeCalls}
                                            callingReady={callingReady}
                                        />
                                    )}
                                    {contactTab === 'activity' && (
                                        <div className="space-y-4 text-xs">
                                            {[
                                                ['Conversation opened', activeConversation.last_message_at],
                                                [`${activeInboundCount} inbound messages`, lastInboundAt],
                                                [`${activeOutboundCount} outbound messages`, lastOutboundAt],
                                                [`Assigned to ${activeAgentName}`, activeConversation.last_message_at],
                                            ].map(([item, time]) => (
                                                <div key={item} className="flex gap-3">
                                                    <span className="mt-0.5 flex h-6 w-6 items-center justify-center rounded-full bg-gray-100 text-gray-600 dark:bg-slate-800 dark:text-slate-300"><RotateCcw className="h-3 w-3" /></span>
                                                    <div>
                                                        <div className="font-medium text-waify-text dark:text-waify-dark-text">{item}</div>
                                                        <div className="text-waify-text-muted dark:text-waify-dark-text-muted">{time ? new Date(String(time)).toLocaleString() : '-'}</div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                    {contactTab === 'orders' && (
                                        <EmptyState icon={ShoppingBag} title="No linked orders" description="Orders will appear here when ecommerce integrations attach order metadata to this contact." />
                                    )}
                                </div>
                            </aside>
                        </div>
                    )}
                </div>
            </div>
            {incomingCall && (
                <IncomingCallScreen
                    call={incomingCall}
                    conversation={incomingCallConversation}
                    callingReady={incomingCallingReady}
                    onCallUpdated={(call) => setRecentCallsState((prev) => mergeCallRecords(prev, [call]))}
                    onClose={() => setDismissedCallIds((prev) => new Set([...prev, Number(incomingCall.id)]))}
                />
            )}
            {editingContact && activeConversation && (
                <div className="fixed inset-0 z-[260] flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-sm" role="dialog" aria-modal="true">
                    <div className="w-full max-w-lg overflow-hidden rounded-xl border border-gray-100 bg-white shadow-2xl dark:border-waify-dark-border dark:bg-slate-900">
                        <div className="flex items-center justify-between gap-3 border-b border-gray-100 px-5 py-4 dark:border-waify-dark-border">
                            <div>
                                <h2 className="text-base font-semibold text-waify-text dark:text-waify-dark-text">Edit contact</h2>
                                <p className="text-xs text-waify-text-muted dark:text-waify-dark-text-muted">{contactDisplayPhone(activeConversation)}</p>
                            </div>
                            <button type="button" onClick={() => setEditingContact(false)} className="flex h-8 w-8 items-center justify-center rounded-md text-waify-text-muted hover:bg-gray-100 dark:text-waify-dark-text-muted dark:hover:bg-slate-800" aria-label="Close">
                                <X className="h-4 w-4" />
                            </button>
                        </div>
                        <div className="grid gap-4 px-5 py-4 sm:grid-cols-2">
                            <label className="block space-y-1.5">
                                <span className="text-xs font-semibold text-waify-text dark:text-waify-dark-text">Name</span>
                                <input
                                    value={contactForm.name}
                                    onChange={(event) => setContactForm((current) => ({ ...current, name: event.target.value }))}
                                    className="h-10 w-full rounded-btn border border-waify-border bg-white px-3 text-sm outline-none focus:ring-2 focus:ring-waify-green/20 dark:border-waify-dark-border dark:bg-slate-800"
                                />
                            </label>
                            <label className="block space-y-1.5">
                                <span className="text-xs font-semibold text-waify-text dark:text-waify-dark-text">Phone</span>
                                <input
                                    value={contactForm.phone}
                                    onChange={(event) => setContactForm((current) => ({ ...current, phone: event.target.value }))}
                                    inputMode="tel"
                                    className="h-10 w-full rounded-btn border border-waify-border bg-white px-3 text-sm outline-none focus:ring-2 focus:ring-waify-green/20 dark:border-waify-dark-border dark:bg-slate-800"
                                />
                            </label>
                            <label className="block space-y-1.5">
                                <span className="text-xs font-semibold text-waify-text dark:text-waify-dark-text">Email</span>
                                <input
                                    value={contactForm.email}
                                    onChange={(event) => setContactForm((current) => ({ ...current, email: event.target.value }))}
                                    type="email"
                                    className="h-10 w-full rounded-btn border border-waify-border bg-white px-3 text-sm outline-none focus:ring-2 focus:ring-waify-green/20 dark:border-waify-dark-border dark:bg-slate-800"
                                />
                            </label>
                            <label className="block space-y-1.5">
                                <span className="text-xs font-semibold text-waify-text dark:text-waify-dark-text">Company</span>
                                <input
                                    value={contactForm.company}
                                    onChange={(event) => setContactForm((current) => ({ ...current, company: event.target.value }))}
                                    className="h-10 w-full rounded-btn border border-waify-border bg-white px-3 text-sm outline-none focus:ring-2 focus:ring-waify-green/20 dark:border-waify-dark-border dark:bg-slate-800"
                                />
                            </label>
                            <label className="block space-y-1.5">
                                <span className="text-xs font-semibold text-waify-text dark:text-waify-dark-text">Status</span>
                                <select
                                    value={contactForm.status}
                                    onChange={(event) => setContactForm((current) => ({ ...current, status: event.target.value }))}
                                    className="h-10 w-full rounded-btn border border-waify-border bg-white px-3 text-sm outline-none focus:ring-2 focus:ring-waify-green/20 dark:border-waify-dark-border dark:bg-slate-800"
                                >
                                    <option value="active">Active</option>
                                    <option value="inactive">Inactive</option>
                                    <option value="blocked">Blocked</option>
                                    <option value="opt_out">Opted out</option>
                                </select>
                            </label>
                            <label className="block space-y-1.5 sm:col-span-2">
                                <span className="text-xs font-semibold text-waify-text dark:text-waify-dark-text">Notes</span>
                                <textarea
                                    value={contactForm.notes}
                                    onChange={(event) => setContactForm((current) => ({ ...current, notes: event.target.value }))}
                                    rows={4}
                                    className="w-full resize-none rounded-btn border border-waify-border bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-waify-green/20 dark:border-waify-dark-border dark:bg-slate-800"
                                />
                            </label>
                        </div>
                        <div className="flex justify-end gap-2 border-t border-gray-100 bg-gray-50 px-5 py-4 dark:border-waify-dark-border dark:bg-slate-800/60">
                            <Button type="button" variant="secondary" onClick={() => setEditingContact(false)}>Cancel</Button>
                            <Button type="button" onClick={saveContactDetails} disabled={savingContact || !contactForm.name.trim()}>
                                <Check className="h-4 w-4" />
                                {savingContact ? 'Saving' : 'Save contact'}
                            </Button>
                        </div>
                    </div>
                </div>
            )}
            {showNewChat && (
                <div className="fixed inset-0 z-[240] flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-sm" role="dialog" aria-modal="true">
                    <div className="w-full max-w-md overflow-hidden rounded-xl border border-gray-100 bg-white shadow-2xl dark:border-waify-dark-border dark:bg-slate-900">
                        <div className="flex items-center justify-between gap-3 border-b border-gray-100 px-5 py-4 dark:border-waify-dark-border">
                            <div>
                                <h2 className="text-base font-semibold text-waify-text dark:text-waify-dark-text">New chat</h2>
                                <p className="text-xs text-waify-text-muted dark:text-waify-dark-text-muted">The contact is saved automatically.</p>
                            </div>
                            <button type="button" onClick={() => setShowNewChat(false)} className="flex h-8 w-8 items-center justify-center rounded-md text-waify-text-muted hover:bg-gray-100 dark:text-waify-dark-text-muted dark:hover:bg-slate-800" aria-label="Close">
                                <X className="h-4 w-4" />
                            </button>
                        </div>
                        <div className="space-y-4 px-5 py-4">
                            <label className="block space-y-1.5">
                                <span className="text-xs font-semibold text-waify-text dark:text-waify-dark-text">Contact name</span>
                                <input
                                    value={newChatForm.name}
                                    onChange={(event) => setNewChatForm((current) => ({ ...current, name: event.target.value }))}
                                    placeholder="Customer name"
                                    className="h-10 w-full rounded-btn border border-waify-border bg-white px-3 text-sm outline-none focus:ring-2 focus:ring-waify-green/20 dark:border-waify-dark-border dark:bg-slate-800"
                                />
                            </label>
                            <label className="block space-y-1.5">
                                <span className="text-xs font-semibold text-waify-text dark:text-waify-dark-text">WhatsApp number</span>
                                <input
                                    value={newChatForm.wa_id}
                                    onChange={(event) => setNewChatForm((current) => ({ ...current, wa_id: event.target.value }))}
                                    placeholder="919999999999"
                                    inputMode="tel"
                                    className="h-10 w-full rounded-btn border border-waify-border bg-white px-3 text-sm outline-none focus:ring-2 focus:ring-waify-green/20 dark:border-waify-dark-border dark:bg-slate-800"
                                />
                            </label>
                            <label className="block space-y-1.5">
                                <span className="text-xs font-semibold text-waify-text dark:text-waify-dark-text">WhatsApp connection</span>
                                <select
                                    value={newChatForm.connection_id}
                                    onChange={(event) => setNewChatForm((current) => ({ ...current, connection_id: event.target.value }))}
                                    className="h-10 w-full rounded-btn border border-waify-border bg-white px-3 text-sm outline-none focus:ring-2 focus:ring-waify-green/20 dark:border-waify-dark-border dark:bg-slate-800"
                                >
                                    <option value="">Select connection</option>
                                    {(connections || []).map((connection) => (
                                        <option key={connection.id} value={connection.id}>{connection.name}</option>
                                    ))}
                                </select>
                            </label>
                        </div>
                        <div className="flex justify-end gap-2 border-t border-gray-100 bg-gray-50 px-5 py-4 dark:border-waify-dark-border dark:bg-slate-800/60">
                            <Button type="button" variant="secondary" onClick={() => setShowNewChat(false)}>Cancel</Button>
                            <Button type="button" onClick={createNewChat} disabled={creatingChat || !newChatForm.wa_id.trim() || !newChatForm.connection_id}>
                                <Edit3 className="h-4 w-4" />
                                {creatingChat ? 'Creating' : 'Create chat'}
                            </Button>
                        </div>
                    </div>
                </div>
            )}
            {mediaPreview && (
                <div className="fixed inset-0 z-[250] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm" role="dialog" aria-modal="true">
                    <div className="flex max-h-[92vh] w-full max-w-4xl flex-col overflow-hidden rounded-xl border border-white/10 bg-white shadow-2xl dark:border-waify-dark-border dark:bg-slate-900">
                        <div className="flex items-center justify-between gap-3 border-b border-gray-100 px-4 py-3 dark:border-waify-dark-border">
                            <div className="min-w-0">
                                <div className="truncate text-sm font-semibold text-waify-text dark:text-waify-dark-text">{mediaPreview.title}</div>
                                <div className="text-xs capitalize text-waify-text-muted dark:text-waify-dark-text-muted">{mediaPreview.type}</div>
                            </div>
                            <div className="flex items-center gap-2">
                                <a href={mediaPreview.url} target="_blank" rel="noreferrer" className="flex h-9 w-9 items-center justify-center rounded-md text-waify-text-muted transition hover:bg-gray-100 hover:text-waify-text dark:text-waify-dark-text-muted dark:hover:bg-slate-800 dark:hover:text-waify-dark-text" aria-label="Open media in new tab">
                                    <ExternalLink className="h-4 w-4" />
                                </a>
                                <button type="button" onClick={() => setMediaPreview(null)} className="flex h-9 w-9 items-center justify-center rounded-md text-waify-text-muted transition hover:bg-gray-100 hover:text-waify-text dark:text-waify-dark-text-muted dark:hover:bg-slate-800 dark:hover:text-waify-dark-text" aria-label="Close media preview">
                                    <X className="h-4 w-4" />
                                </button>
                            </div>
                        </div>
                        <div className="min-h-0 flex-1 overflow-auto bg-gray-50 p-4 dark:bg-slate-950">
                            {['image', 'sticker'].includes(mediaPreview.type) && (
                                <img src={mediaPreview.url} alt={mediaPreview.filename || mediaPreview.title} className="mx-auto max-h-[72vh] max-w-full rounded-lg object-contain" />
                            )}
                            {mediaPreview.type === 'video' && (
                                <video controls autoPlay className="mx-auto max-h-[72vh] max-w-full rounded-lg">
                                    <source src={mediaPreview.url} />
                                </video>
                            )}
                            {mediaPreview.type === 'audio' && (
                                <div className="mx-auto flex min-h-48 max-w-xl items-center justify-center rounded-lg bg-white p-6 shadow-sm dark:bg-slate-900">
                                    <audio controls autoPlay className="w-full">
                                        <source src={mediaPreview.url} />
                                    </audio>
                                </div>
                            )}
                            {mediaPreview.type === 'document' && (
                                <iframe src={mediaPreview.url} title={mediaPreview.title} className="h-[72vh] w-full rounded-lg border border-gray-200 bg-white dark:border-waify-dark-border" />
                            )}
                        </div>
                    </div>
                </div>
            )}
        </AppShell>
    );
}
