import { useForm, Link, router, usePage } from '@inertiajs/react';
import { FormEventHandler, useRef, useEffect, useState, useCallback, useMemo } from 'react';
import AppShell from '@/Layouts/AppShell';
import Button from '@/Components/UI/Button';
import TextInput from '@/Components/TextInput';
import { Textarea } from '@/Components/UI/Textarea';
import { Badge } from '@/Components/UI/Badge';
import { ArrowLeft, Send, Check, CheckCheck, Clock, Menu, Phone, Wifi, WifiOff, X, Smile, Paperclip, Image as ImageIcon, MapPin, FileText, Zap, List, Square, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useRealtime } from '@/Providers/RealtimeProvider';
import { MessageSkeleton } from '@/Components/UI/Skeleton';
import { useToast } from '@/hooks/useToast';
import axios from 'axios';
import { Head } from '@inertiajs/react';

interface Message {
    id: number;
    direction: 'inbound' | 'outbound';
    type: string;
    text_body: string | null;
    payload?: any;
    status: string;
    created_at: string;
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
    assigned_to?: number | null;
    priority?: string | null;
}

interface TemplateItem {
    id: number;
    name: string;
    language: string;
    body_text: string | null;
    header_text: string | null;
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

export default function ConversationsShow({
    account,
    conversation: initialConversation,
    messages: initialMessages = [],
    templates = [],
    lists = [],
    notes: initialNotes = [],
    audit_events: initialAuditEvents = [],
    agents = [],
    inbox_settings: inboxSettings = {
        auto_assign_enabled: false,
        auto_assign_strategy: 'round_robin',
    }}: {
    account: any;
    conversation: Conversation;
    messages: Message[];
    templates: TemplateItem[];
    lists?: ListItem[];
    notes: NoteItem[];
    audit_events: AuditEventItem[];
    agents: AgentItem[];
    inbox_settings: {
        auto_assign_enabled: boolean;
        auto_assign_strategy: string;
    };
}) {
    const pageProps = usePage().props as any;
    const resolvedConversation: Conversation | null = initialConversation ?? pageProps?.conversation ?? null;
    const resolvedMessages: Message[] = Array.isArray(initialMessages) ? initialMessages : (Array.isArray(pageProps?.messages) ? pageProps.messages : []);
    const resolvedNotes: NoteItem[] = Array.isArray(initialNotes) ? initialNotes : (Array.isArray(pageProps?.notes) ? pageProps.notes : []);
    const resolvedAuditEvents: AuditEventItem[] = Array.isArray(initialAuditEvents) ? initialAuditEvents : (Array.isArray(pageProps?.audit_events) ? pageProps.audit_events : []);
    const resolvedAgents: AgentItem[] = Array.isArray(agents) ? agents : (Array.isArray(pageProps?.agents) ? pageProps.agents : []);
    const resolvedTemplates: TemplateItem[] = Array.isArray(templates) ? templates : (Array.isArray(pageProps?.templates) ? pageProps.templates : []);
    const resolvedLists: ListItem[] = Array.isArray(lists) ? lists : (Array.isArray(pageProps?.lists) ? pageProps.lists : []);

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
    const normalizedMessages = resolvedMessages;
    const normalizedNotes = resolvedNotes;
    const normalizedAuditEvents = resolvedAuditEvents;
    const normalizedAgents = resolvedAgents;
    const normalizedTemplates = resolvedTemplates;
    const normalizedLists = resolvedLists;
    const { subscribe, connected } = useRealtime();
    const { addToast } = useToast();
    const { auth } = usePage().props as any;
    const currentUserId = auth?.user?.id;
    const notifyAssignmentEnabled = auth?.user?.notify_assignment_enabled ?? true;
    const notifyMentionEnabled = auth?.user?.notify_mention_enabled ?? true;
    const soundEnabled = auth?.user?.notify_sound_enabled ?? true;
    const [messages, setMessages] = useState<Message[]>(normalizedMessages);
    const [conversation, setConversation] = useState<Conversation>(resolvedConversation);
    const [loading, setLoading] = useState(false);
    const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
    const [showEmojiBar, setShowEmojiBar] = useState(false);
    const [showQuickReplies, setShowQuickReplies] = useState(false);
    const [showTemplates, setShowTemplates] = useState(false);
    const [showLists, setShowLists] = useState(false);
    const [showButtons, setShowButtons] = useState(false);
    const [showLocation, setShowLocation] = useState(false);
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
    const [emojiSearch, setEmojiSearch] = useState('');
    const [recentEmojis, setRecentEmojis] = useState<string[]>([]);
    const [notes, setNotes] = useState<NoteItem[]>(normalizedNotes);
    const [auditEvents, setAuditEvents] = useState<AuditEventItem[]>(normalizedAuditEvents);
    const [noteDraft, setNoteDraft] = useState('');
    const [metaUpdating, setMetaUpdating] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const messagesContainerRef = useRef<HTMLDivElement>(null);
    const [shouldAutoScroll, setShouldAutoScroll] = useState(true);
    const [pollingInterval, setPollingInterval] = useState<NodeJS.Timeout | null>(null);
    const lastMessageIdRef = useRef<number>(Math.max(...normalizedMessages.map((m) => m.id), 0));
    const processedMessageIds = useRef<Set<number>>(new Set(normalizedMessages.map((m) => m.id)));
    const lastNoteIdRef = useRef<number>(Math.max(...normalizedNotes.map((n) => n.id), 0));
    const lastAuditIdRef = useRef<number>(Math.max(...normalizedAuditEvents.map((e) => e.id), 0));
    const assignedToRef = useRef<number | null>(initialConversation.assigned_to ?? null);

    const { data, setData, post, processing, errors, reset } = useForm({
        message: ''});

    const emojiList = ['😀', '😁', '😂', '🤣', '😍', '😘', '😊', '🥰', '😎', '🤝', '👍', '🙏', '🎉', '🔥', '✨', '💡', '😢', '😮', '😡', '🤔', '😅', '🙌', '✅', '❌'];
    const quickReplies = [
        { id: 'greeting', label: 'Greeting', text: 'Hi! How can I help you today?' },
        { id: 'followup', label: 'Follow-up', text: 'Just checking in—did that solve the issue?' },
        { id: 'thanks', label: 'Thanks', text: 'Thanks for reaching out! We’re on it.' },
        { id: 'handover', label: 'Handover', text: 'I’m looping in a specialist to assist you.' },
    ];
    const availableTemplates = normalizedTemplates;
    const agentMap = new Map(normalizedAgents.map((agent) => [agent.id, agent]));
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

    const sendList = useCallback(async () => {
        if (!selectedList) {
            addToast({ title: 'List needed', description: 'Please select a list to send.', variant: 'warning' });
            return;
        }

        try {
            await axios.post(
                route('app.whatsapp.conversations.send-list', {
                    conversation: conversation.id}),
                {
                    list_id: selectedList.id,
                }
            );
            addToast({ title: 'List sent', variant: 'success' });
            setShowLists(false);
            setSelectedList(null);
        } catch (error: any) {
            addToast({
                title: 'Failed to send list',
                description: error?.response?.data?.message || 'Please try again',
                variant: 'error'});
        }
    }, [addToast, conversation.id, selectedList, account.slug]);

    const sendInteractiveButtons = useCallback(async () => {
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
            await axios.post(
                route('app.whatsapp.conversations.send-buttons', {
                    conversation: conversation.id}),
                {
                    body_text: buttonBodyText,
                    buttons: validButtons,
                    header_text: buttonHeaderText || null,
                    footer_text: buttonFooterText || null,
                }
            );
            addToast({ title: 'Interactive buttons sent', variant: 'success' });
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
        }
    }, [addToast, conversation.id, interactiveButtons, buttonBodyText, buttonHeaderText, buttonFooterText, account.slug]);

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
        const { label, lat, lng } = locationInput;
        if (!lat || !lng) {
            addToast({ title: 'Location needed', description: 'Add latitude and longitude.', variant: 'warning' });
            return;
        }

        try {
            await axios.post(
                route('app.whatsapp.conversations.send-location', {
                    conversation: conversation.id}),
                {
                    latitude: Number(lat),
                    longitude: Number(lng),
                    name: label || null,
                    address: null}
            );

            addToast({ title: 'Location sent', variant: 'success' });
            setShowLocation(false);
            setLocationInput({ label: '', lat: '', lng: '' });
        } catch (error: any) {
            addToast({
                title: 'Failed to send location',
                description: error?.response?.data?.message || 'Please try again',
                variant: 'error'});
        }
    }, [addToast, conversation.id, locationInput, account.slug]);

    const sendAttachments = useCallback(async (caption?: string) => {
        if (attachments.length === 0) return;

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

            try {
                await axios.post(
                    route('app.whatsapp.conversations.send-media', {
                        conversation: conversation.id}),
                    formData,
                    {
                        headers: { 'Content-Type': 'multipart/form-data' }}
                );
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
    }, [addToast, attachments, conversation.id, account.slug]);

    const sendTemplate = useCallback(async () => {
        if (!selectedTemplate) return;

        try {
            await axios.post(
                route('app.whatsapp.conversations.send-template', {
                    conversation: conversation.id}),
                {
                    template_id: selectedTemplate.id,
                    variables: templateVariables}
            );

            addToast({ title: 'Template sent', variant: 'success' });
            setSelectedTemplate(null);
            setTemplateVariables([]);
            setShowTemplates(false);
        } catch (error: any) {
            addToast({
                title: 'Failed to send template',
                description: error?.response?.data?.message || 'Please try again',
                variant: 'error'});
        }
    }, [addToast, conversation.id, selectedTemplate, templateVariables, account.slug]);

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
                messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
            }, 100);
        }
    }, [messages, shouldAutoScroll]);

    // Realtime subscription with dedup
    useEffect(() => {
        if (!account?.id || !conversation?.id) return;

        const conversationChannel = `account.${account.id}.whatsapp.conversation.${conversation.id}`;

        const unsubscribeMessageCreated = subscribe(
            conversationChannel,
            '.whatsapp.message.created',
            (data: any) => {
                const newMessage = data.message;
                if (newMessage && !processedMessageIds.current.has(newMessage.id)) {
                    processedMessageIds.current.add(newMessage.id);
                    setMessages((prev) => {
                        if (prev.find((m) => m.id === newMessage.id)) {
                            return prev;
                        }
                        return [...prev, newMessage].sort(
                            (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
                        );
                    });
                    lastMessageIdRef.current = Math.max(lastMessageIdRef.current, newMessage.id);

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
                setMessages((prev) =>
                    prev.map((msg) =>
                        msg.id === data.message.id
                            ? {
                                  ...msg,
                                  status: data.message.status,
                                  error_message: data.message.error_message,
                                  sent_at: data.message.sent_at,
                                  delivered_at: data.message.delivered_at,
                                  read_at: data.message.read_at}
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
                            title: 'Conversation assigned',
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
                    setAuditEvents((prev) => [data.audit_event, ...prev]);
                    lastAuditIdRef.current = Math.max(lastAuditIdRef.current, data.audit_event.id);
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

    // Fallback polling when disconnected
    useEffect(() => {
        if (connected || !account?.id || !conversation?.id) {
            if (pollingInterval) {
                clearInterval(pollingInterval);
                setPollingInterval(null);
            }
            return;
        }

        const poll = async () => {
            try {
                const response = await axios.get(
                    route('app.whatsapp.inbox.conversation.stream', {
                        conversation: conversation.id}),
                    {
                        params: {
                            after_message_id: lastMessageIdRef.current,
                            after_note_id: lastNoteIdRef.current,
                            after_audit_id: lastAuditIdRef.current}}
                );

                const newMessagesFromServer = toArray<Message>(response.data?.new_messages);
                const updatedMessagesFromServer = toArray<Message>(response.data?.updated_messages);
                const newNotesFromServer = toArray<NoteItem>(response.data?.new_notes);
                const newAuditEventsFromServer = toArray<AuditEventItem>(response.data?.new_audit_events);

                if (newMessagesFromServer.length > 0) {
                    setMessages((prev) => {
                        const existingIds = new Set(prev.map((m) => m.id));
                        const newMessages = newMessagesFromServer.filter(
                            (m: Message) => !existingIds.has(m.id)
                        );
                        return [...prev, ...newMessages].sort(
                            (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
                        );
                    });
                    lastMessageIdRef.current = Math.max(
                        ...newMessagesFromServer.map((m: Message) => m.id),
                        lastMessageIdRef.current
                    );
                }

                if (updatedMessagesFromServer.length > 0) {
                    setMessages((prev) =>
                        prev.map((msg) => {
                            const updated = updatedMessagesFromServer.find(
                                (um: Message) => um.id === msg.id
                            );
                            return updated ? { ...msg, ...updated } : msg;
                        })
                    );
                }

                if (newNotesFromServer.length > 0) {
                    setNotes((prev) => [...newNotesFromServer.slice().reverse(), ...prev]);
                    lastNoteIdRef.current = Math.max(
                        ...newNotesFromServer.map((n: NoteItem) => n.id),
                        lastNoteIdRef.current
                    );
                }

                if (newAuditEventsFromServer.length > 0) {
                    setAuditEvents((prev) => [...newAuditEventsFromServer.slice().reverse(), ...prev]);
                    lastAuditIdRef.current = Math.max(
                        ...newAuditEventsFromServer.map((e: AuditEventItem) => e.id),
                        lastAuditIdRef.current
                    );
                }

                if (response.data.conversation) {
                    setConversation((prev) => ({ ...prev, ...response.data.conversation }));
                }
            } catch (error) {
                console.error('[Conversation] Polling error:', error);
            }
        };

        const interval = setInterval(poll, 15000);
        setPollingInterval(interval);
        poll();

        return () => {
            clearInterval(interval);
        };
    }, [connected, account?.id, account?.slug, conversation?.id]);

    const handleSend = useCallback(async () => {
        if (processing) return;

        const trimmed = data.message.trim();

        if (attachments.length > 0) {
            await sendAttachments(trimmed || undefined);
            reset('message');
            return;
        }

        if (!trimmed) return;

        post(
            route('app.whatsapp.conversations.send', {
                conversation: conversation.id}),
            {
                onSuccess: () => {
                    reset('message');
                    addToast({
                        title: 'Message sent',
                        variant: 'success',
                        duration: 2000});
                },
                onError: (errors) => {
                    addToast({
                        title: 'Failed to send message',
                        description: errors.message || 'Please try again',
                        variant: 'error'});
                }}
        );
    }, [processing, data.message, attachments.length, sendAttachments, post, account.slug, conversation.id, reset, addToast]);

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
            setMetaUpdating(true);

            router.post(
                route('app.whatsapp.conversations.update', {
                    conversation: conversation.id}),
                updates,
                {
                    preserveScroll: true,
                    preserveState: true,
                    onSuccess: () => {
                        setConversation((prev) => ({
                            ...prev,
                            ...updates,
                        }));
                        addToast({
                            title: 'Conversation updated',
                            variant: 'success',
                            duration: 2000});
                    },
                    onError: (errs) => {
                        addToast({
                            title: 'Update failed',
                            description: errs?.assigned_to || errs?.status || errs?.priority || 'Please try again.',
                            variant: 'error'});
                    },
                    onFinish: () => {
                        setMetaUpdating(false);
                    }});
        },
        [addToast, conversation.id, metaUpdating]
    );

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

    const getStatusIcon = (message: Message) => {
        if (message.direction === 'inbound') return null;

        switch (message.status) {
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

    return (
        <AppShell>
            <Head title={`${conversation.contact.name || conversation.contact.wa_id} - Inbox`} />
            <div className="flex flex-col h-[calc(100vh-8rem)] lg:h-[calc(100vh-6rem)] rounded-3xl overflow-hidden border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-xl">
                {/* Header */}
                <div className="flex items-center justify-between px-4 py-3 bg-[#075E54] text-white">
                    <div className="flex items-center gap-3 min-w-0">
                        <Link
                            href={route('app.whatsapp.conversations.index', { })}
                            className="inline-flex items-center text-sm font-medium text-white/90 hover:text-white transition-colors"
                            aria-label="Back to conversations"
                        >
                            <ArrowLeft className="h-4 w-4 mr-1" />
                            <span className="hidden sm:inline">Back</span>
                        </Link>
                        <div className="h-10 w-10 rounded-full bg-[#25D366] flex items-center justify-center text-white font-bold text-lg shadow-lg flex-shrink-0">
                            {conversation.contact.name?.charAt(0).toUpperCase() || conversation.contact.wa_id.charAt(0)}
                        </div>
                        <div className="min-w-0">
                            <h1 className="text-base sm:text-lg font-semibold truncate">
                                {conversation.contact.name || conversation.contact.wa_id}
                            </h1>
                            <div className="flex items-center gap-2 text-xs text-white/80">
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
                    <div className="flex items-center gap-2">
                        <span className="hidden sm:inline-flex rounded-full bg-white/15 px-3 py-1 text-xs uppercase tracking-wide">
                            {conversation.status}
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
                        <div className="fixed right-0 top-0 h-full w-80 bg-white dark:bg-gray-900 shadow-2xl z-50 lg:hidden p-6 border-l border-gray-200 dark:border-gray-800">
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">Conversation Info</h3>
                                <button
                                    onClick={() => setMobileDrawerOpen(false)}
                                    className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
                                >
                                    <X className="h-5 w-5" />
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
                                </div>
                            </div>
                        </div>
                    </>
                )}

                <div className="flex flex-1 overflow-hidden">
                {/* Messages */}
                <div
                    ref={messagesContainerRef}
                    className="flex-1 overflow-y-auto px-4 py-6 space-y-4 bg-[#efeae2] dark:bg-gray-950 focus:outline-none"
                    style={{
                        backgroundImage:
                            'radial-gradient(rgba(0,0,0,0.04) 1px, transparent 1px)',
                        backgroundSize: '16px 16px'}}
                    tabIndex={0}
                >
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
                                <p className="text-gray-500 dark:text-gray-400 font-medium mb-1">No messages yet</p>
                                <p className="text-sm text-gray-400 dark:text-gray-500">Start the conversation!</p>
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
                    <div className="p-6 border-b border-gray-200 dark:border-gray-800">
                        <div className="flex items-center gap-3">
                            <div className="h-12 w-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-lg shadow-lg">
                                {conversation.contact.name?.charAt(0).toUpperCase() || conversation.contact.wa_id.charAt(0)}
                            </div>
                            <div>
                                <p className="font-semibold text-gray-900 dark:text-gray-100">{conversation.contact.name || 'Unknown'}</p>
                                <p className="text-sm text-gray-500 dark:text-gray-400">{conversation.contact.wa_id}</p>
                            </div>
                        </div>
                        <div className="mt-4 space-y-2 text-sm text-gray-600 dark:text-gray-300">
                            <div className="flex items-center justify-between">
                                <span className="text-xs font-semibold uppercase tracking-wider text-gray-500">Connection</span>
                                <span className="font-medium">{conversation.connection.name}</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-xs font-semibold uppercase tracking-wider text-gray-500">Status</span>
                                <Badge variant={conversation.status === 'open' ? 'success' : 'default'} className="px-3 py-1">
                                    {conversation.status}
                                </Badge>
                            </div>
                        </div>
                    </div>

                    <div className="p-6 border-b border-gray-200 dark:border-gray-800">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">Assignment & Priority</h3>
                            {metaUpdating && (
                                <span className="text-xs text-gray-400">Saving…</span>
                            )}
                        </div>
                        <div className="space-y-4 text-sm">
                            <div className="space-y-2">
                                <span className="text-xs font-semibold uppercase tracking-wider text-gray-500">Assignee</span>
                                <select
                                    value={conversation.assigned_to ?? ''}
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
                                {conversation.assigned_to && (
                                    <div className="text-xs text-gray-500 dark:text-gray-400">
                                        Assigned to {agentMap.get(conversation.assigned_to)?.name || 'Unknown'}
                                    </div>
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
                    </div>

                    <div className="p-6 border-b border-gray-200 dark:border-gray-800">
                        <div className="flex items-center justify-between mb-3">
                            <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">Internal Notes</h3>
                            <span className="text-xs text-gray-500">{notes.length}</span>
                        </div>
                        <div className="space-y-3">
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
                            {auditEvents.map((event) => (
                                <div key={event.id} className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-3">
                                    <div className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                                        {event.event_type.replaceAll('_', ' ')}
                                    </div>
                                    {event.description && (
                                        <p className="mt-1 text-sm text-gray-700 dark:text-gray-200">
                                            {event.description}
                                        </p>
                                    )}
                                    <div className="mt-2 text-[11px] text-gray-500 dark:text-gray-400">
                                        {event.actor?.name || 'System'} • {new Date(event.created_at).toLocaleString()}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </aside>
                </div>

                {/* Composer */}
                <div className="border-t border-gray-200 dark:border-gray-800 bg-[#f0f2f5] dark:bg-gray-900 p-3">
                    <div className="space-y-3">
                        <div className="relative">
                            <div className="flex flex-wrap items-center gap-2">
                            <button
                                type="button"
                                onClick={() => setShowEmojiBar((prev) => !prev)}
                                className="inline-flex items-center gap-2 rounded-full border border-gray-200 bg-white px-3 py-1.5 text-xs font-semibold text-gray-600 shadow-sm hover:bg-gray-100 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300"
                            >
                                <Smile className="h-3.5 w-3.5" />
                                Emoji
                            </button>
                            <button
                                type="button"
                                onClick={() => fileInputRef.current?.click()}
                                className="inline-flex items-center gap-2 rounded-full border border-gray-200 bg-white px-3 py-1.5 text-xs font-semibold text-gray-600 shadow-sm hover:bg-gray-100 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300"
                            >
                                <Paperclip className="h-3.5 w-3.5" />
                                Attach
                            </button>
                            <button
                                type="button"
                                onClick={() => fileInputRef.current?.click()}
                                className="inline-flex items-center gap-2 rounded-full border border-gray-200 bg-white px-3 py-1.5 text-xs font-semibold text-gray-600 shadow-sm hover:bg-gray-100 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300"
                            >
                                <ImageIcon className="h-3.5 w-3.5" />
                                Photo/Video
                            </button>
                            <button
                                type="button"
                                onClick={() => setShowLocation((prev) => !prev)}
                                className="inline-flex items-center gap-2 rounded-full border border-gray-200 bg-white px-3 py-1.5 text-xs font-semibold text-gray-600 shadow-sm hover:bg-gray-100 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300"
                            >
                                <MapPin className="h-3.5 w-3.5" />
                                Location
                            </button>
                            <button
                                type="button"
                                onClick={() => setShowTemplates((prev) => !prev)}
                                className="inline-flex items-center gap-2 rounded-full border border-gray-200 bg-white px-3 py-1.5 text-xs font-semibold text-gray-600 shadow-sm hover:bg-gray-100 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300"
                            >
                                <FileText className="h-3.5 w-3.5" />
                                Templates
                            </button>
                            <button
                                type="button"
                                onClick={() => {
                                    setShowLists((prev) => !prev);
                                    setShowButtons(false);
                                }}
                                className="inline-flex items-center gap-2 rounded-full border border-gray-200 bg-white px-3 py-1.5 text-xs font-semibold text-gray-600 shadow-sm hover:bg-gray-100 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300"
                            >
                                <List className="h-3.5 w-3.5" />
                                Lists
                            </button>
                            <button
                                type="button"
                                onClick={() => {
                                    setShowButtons((prev) => !prev);
                                    setShowLists(false);
                                }}
                                className="inline-flex items-center gap-2 rounded-full border border-gray-200 bg-white px-3 py-1.5 text-xs font-semibold text-gray-600 shadow-sm hover:bg-gray-100 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300"
                            >
                                <Square className="h-3.5 w-3.5" />
                                Buttons
                            </button>
                            <button
                                type="button"
                                onClick={() => setShowQuickReplies((prev) => !prev)}
                                className="inline-flex items-center gap-2 rounded-full border border-gray-200 bg-white px-3 py-1.5 text-xs font-semibold text-gray-600 shadow-sm hover:bg-gray-100 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300"
                            >
                                <Zap className="h-3.5 w-3.5" />
                                Quick Replies
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

                        {showLocation && (
                            <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-800">
                                <div className="grid gap-3 sm:grid-cols-3">
                                    <TextInput
                                        value={locationInput.label}
                                        onChange={(e) => setLocationInput((prev) => ({ ...prev, label: e.target.value }))}
                                        placeholder="Label (optional)"
                                        className="rounded-xl"
                                    />
                                    <TextInput
                                        value={locationInput.lat}
                                        onChange={(e) => setLocationInput((prev) => ({ ...prev, lat: e.target.value }))}
                                        placeholder="Latitude"
                                        className="rounded-xl"
                                    />
                                    <TextInput
                                        value={locationInput.lng}
                                        onChange={(e) => setLocationInput((prev) => ({ ...prev, lng: e.target.value }))}
                                        placeholder="Longitude"
                                        className="rounded-xl"
                                    />
                                </div>
                                <div className="mt-3 flex justify-end gap-2">
                                    <Button type="button" variant="secondary" onClick={() => setShowLocation(false)}>
                                        Cancel
                                    </Button>
                                    <Button type="button" onClick={sendLocation} className="bg-[#25D366] hover:bg-[#1DAA57] text-white">
                                        Send Location
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
                            <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-800">
                                <div className="grid gap-3">
                                    {availableTemplates.length === 0 && (
                                        <div className="text-sm text-gray-500 dark:text-gray-400">
                                            No approved templates found for this connection.
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
                                                className="bg-[#25D366] hover:bg-[#1DAA57] text-white"
                                            >
                                                Send Template
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
                                            No lists available. Create lists in the Lists section.
                                        </div>
                                    )}
                                    {normalizedLists.map((list) => (
                                        <button
                                            key={list.id}
                                            type="button"
                                            onClick={() => setSelectedList(list)}
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
                                                onClick={() => {
                                                    setSelectedList(null);
                                                }}
                                            >
                                                Clear
                                            </Button>
                                            <Button
                                                type="button"
                                                onClick={sendList}
                                                className="bg-[#25D366] hover:bg-[#1DAA57] text-white"
                                            >
                                                Send List
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
                                                        className="flex-1 text-sm rounded-lg"
                                                    />
                                                    <TextInput
                                                        value={button.text}
                                                        onChange={(e) => updateButton(index, 'text', e.target.value)}
                                                        placeholder="Button text (max 20)"
                                                        maxLength={20}
                                                        className="flex-1 text-sm rounded-lg"
                                                    />
                                                    {interactiveButtons.length > 1 && (
                                                        <Button
                                                            type="button"
                                                            onClick={() => removeButton(index)}
                                                            variant="ghost"
                                                            size="sm"
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
                                            className="bg-[#25D366] hover:bg-[#1DAA57] text-white"
                                        >
                                            Send Buttons
                                        </Button>
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
                                        <button type="button" onClick={() => removeAttachment(index)} className="text-gray-400 hover:text-gray-600">
                                            <X className="h-3.5 w-3.5" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}

                        <form onSubmit={submit} className="flex items-center gap-3">
                            <TextInput
                                value={data.message}
                                onChange={(e) => setData('message', e.target.value)}
                                placeholder="Type a message"
                                className="flex-1 rounded-full bg-white dark:bg-gray-800"
                                disabled={processing}
                                autoFocus
                                aria-label="Message input"
                            />
                            <Button
                                type="submit"
                                disabled={processing || (!data.message.trim() && attachments.length === 0)}
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
        </AppShell>
    );
}
