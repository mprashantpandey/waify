import { useForm, Link } from '@inertiajs/react';
import { FormEventHandler, useRef, useEffect, useState, useCallback } from 'react';
import AppShell from '@/Layouts/AppShell';
import Button from '@/Components/UI/Button';
import TextInput from '@/Components/TextInput';
import { Badge } from '@/Components/UI/Badge';
import { ArrowLeft, Send, Check, CheckCheck, Clock, Menu, Phone, Wifi, WifiOff, X, Smile, Paperclip, Image as ImageIcon, MapPin, FileText, Zap } from 'lucide-react';
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

export default function ConversationsShow({
    workspace,
    conversation: initialConversation,
    messages: initialMessages,
    templates,
}: {
    workspace: any;
    conversation: Conversation;
    messages: Message[];
    templates: TemplateItem[];
}) {
    const { subscribe, connected } = useRealtime();
    const { addToast } = useToast();
    const [messages, setMessages] = useState<Message[]>(initialMessages);
    const [conversation, setConversation] = useState<Conversation>(initialConversation);
    const [loading, setLoading] = useState(false);
    const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
    const [showEmojiBar, setShowEmojiBar] = useState(false);
    const [showQuickReplies, setShowQuickReplies] = useState(false);
    const [showTemplates, setShowTemplates] = useState(false);
    const [showLocation, setShowLocation] = useState(false);
    const [attachments, setAttachments] = useState<File[]>([]);
    const [locationInput, setLocationInput] = useState({ label: '', lat: '', lng: '' });
    const [selectedTemplate, setSelectedTemplate] = useState<TemplateItem | null>(null);
    const [templateVariables, setTemplateVariables] = useState<string[]>([]);
    const [emojiSearch, setEmojiSearch] = useState('');
    const [recentEmojis, setRecentEmojis] = useState<string[]>([]);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const messagesContainerRef = useRef<HTMLDivElement>(null);
    const [shouldAutoScroll, setShouldAutoScroll] = useState(true);
    const [pollingInterval, setPollingInterval] = useState<NodeJS.Timeout | null>(null);
    const lastMessageIdRef = useRef<number>(Math.max(...initialMessages.map((m) => m.id), 0));
    const processedMessageIds = useRef<Set<number>>(new Set(initialMessages.map((m) => m.id)));

    const { data, setData, post, processing, errors, reset } = useForm({
        message: '',
    });

    const emojiList = ['😀', '😁', '😂', '🤣', '😍', '😘', '😊', '🥰', '😎', '🤝', '👍', '🙏', '🎉', '🔥', '✨', '💡', '😢', '😮', '😡', '🤔', '😅', '🙌', '✅', '❌'];
    const quickReplies = [
        { id: 'greeting', label: 'Greeting', text: 'Hi! How can I help you today?' },
        { id: 'followup', label: 'Follow-up', text: 'Just checking in—did that solve the issue?' },
        { id: 'thanks', label: 'Thanks', text: 'Thanks for reaching out! We’re on it.' },
        { id: 'handover', label: 'Handover', text: 'I’m looping in a specialist to assist you.' },
    ];
    const availableTemplates = templates || [];

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
            variant: 'info',
        });
    };

    const removeAttachment = (index: number) => {
        setAttachments((prev) => prev.filter((_, i) => i !== index));
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
                    workspace: workspace.slug,
                    conversation: conversation.id,
                }),
                {
                    latitude: Number(lat),
                    longitude: Number(lng),
                    name: label || null,
                    address: null,
                }
            );

            addToast({ title: 'Location sent', variant: 'success' });
            setShowLocation(false);
            setLocationInput({ label: '', lat: '', lng: '' });
        } catch (error: any) {
            addToast({
                title: 'Failed to send location',
                description: error?.response?.data?.message || 'Please try again',
                variant: 'error',
            });
        }
    }, [addToast, conversation.id, locationInput, workspace.slug]);

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
                        workspace: workspace.slug,
                        conversation: conversation.id,
                    }),
                    formData,
                    {
                        headers: { 'Content-Type': 'multipart/form-data' },
                    }
                );
            } catch (error: any) {
                addToast({
                    title: 'Failed to send attachment',
                    description: error?.response?.data?.message || 'Please try again',
                    variant: 'error',
                });
                return;
            }
        }

        addToast({ title: 'Attachments sent', variant: 'success' });
        setAttachments([]);
    }, [addToast, attachments, conversation.id, workspace.slug]);

    const sendTemplate = useCallback(async () => {
        if (!selectedTemplate) return;

        try {
            await axios.post(
                route('app.whatsapp.conversations.send-template', {
                    workspace: workspace.slug,
                    conversation: conversation.id,
                }),
                {
                    template_id: selectedTemplate.id,
                    variables: templateVariables,
                }
            );

            addToast({ title: 'Template sent', variant: 'success' });
            setSelectedTemplate(null);
            setTemplateVariables([]);
            setShowTemplates(false);
        } catch (error: any) {
            addToast({
                title: 'Failed to send template',
                description: error?.response?.data?.message || 'Please try again',
                variant: 'error',
            });
        }
    }, [addToast, conversation.id, selectedTemplate, templateVariables, workspace.slug]);

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
        if (!workspace?.id || !conversation?.id) return;

        const conversationChannel = `private-workspace.${workspace.id}.whatsapp.conversation.${conversation.id}`;

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
                            duration: 3000,
                        });
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
                                  read_at: data.message.read_at,
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
                    }));
                }
            }
        );

        return () => {
            unsubscribeMessageCreated();
            unsubscribeMessageUpdated();
            unsubscribeConversationUpdated();
        };
    }, [workspace?.id, conversation?.id, subscribe, addToast]);

    // Fallback polling when disconnected
    useEffect(() => {
        if (connected || !workspace?.id || !conversation?.id) {
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
                        workspace: workspace.slug,
                        conversation: conversation.id,
                    }),
                    {
                        params: {
                            after_message_id: lastMessageIdRef.current,
                        },
                    }
                );

                if (response.data.new_messages?.length > 0) {
                    setMessages((prev) => {
                        const existingIds = new Set(prev.map((m) => m.id));
                        const newMessages = response.data.new_messages.filter(
                            (m: Message) => !existingIds.has(m.id)
                        );
                        return [...prev, ...newMessages].sort(
                            (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
                        );
                    });
                    lastMessageIdRef.current = Math.max(
                        ...response.data.new_messages.map((m: Message) => m.id),
                        lastMessageIdRef.current
                    );
                }

                if (response.data.updated_messages?.length > 0) {
                    setMessages((prev) =>
                        prev.map((msg) => {
                            const updated = response.data.updated_messages.find(
                                (um: Message) => um.id === msg.id
                            );
                            return updated ? { ...msg, ...updated } : msg;
                        })
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
    }, [connected, workspace?.id, workspace?.slug, conversation?.id]);

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
                workspace: workspace.slug,
                conversation: conversation.id,
            }),
            {
                onSuccess: () => {
                    reset('message');
                    addToast({
                        title: 'Message sent',
                        variant: 'success',
                        duration: 2000,
                    });
                },
                onError: (errors) => {
                    addToast({
                        title: 'Failed to send message',
                        description: errors.message || 'Please try again',
                        variant: 'error',
                    });
                },
            }
        );
    }, [processing, data.message, attachments.length, sendAttachments, post, workspace.slug, conversation.id, reset, addToast]);

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
                            href={route('app.whatsapp.conversations.index', { workspace: workspace.slug })}
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

                {/* Messages */}
                <div
                    ref={messagesContainerRef}
                    className="flex-1 overflow-y-auto px-4 py-6 space-y-4 bg-[#efeae2] dark:bg-gray-950 focus:outline-none"
                    style={{
                        backgroundImage:
                            'radial-gradient(rgba(0,0,0,0.04) 1px, transparent 1px)',
                        backgroundSize: '16px 16px',
                    }}
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
                                                            minute: '2-digit',
                                                        })}
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
