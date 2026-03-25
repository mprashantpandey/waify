import { useForm, usePage } from '@inertiajs/react';
import { FormEventHandler, useEffect, useState } from 'react';
import AppShell from '@/Layouts/AppShell';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/Components/UI/Card';
import Button from '@/Components/UI/Button';
import TextInput from '@/Components/TextInput';
import InputLabel from '@/Components/InputLabel';
import InputError from '@/Components/InputError';
import { Badge } from '@/Components/UI/Badge';
import { ArrowLeft, Send, User, MessageSquare, Phone, Sparkles, Eye } from 'lucide-react';
import { Link, Head } from '@inertiajs/react';

interface Template {
    id: number;
    slug: string;
    name: string;
    language: string;
    body_text: string | null;
    header_type: string | null;
    header_media_url: string | null;
    header_text: string | null;
    footer_text: string | null;
    buttons: Array<{
        type: string;
        text: string;
        url?: string;
        phone_number?: string;
    }>;
    variable_count: number;
    has_buttons: boolean;
    required_variables: {
        header: number[];
        body: number[];
        button: number;
        header_count: number;
        body_count: number;
        button_count: number;
        total: number;
    };
}

interface Contact {
    id: number;
    wa_id: string;
    name: string | null;
}

interface Conversation {
    id: number;
    contact: {
        wa_id: string;
        name: string;
    };
}

interface RecentSend {
    id: number;
    to_wa_id: string;
    status: string;
    error_message?: string | null;
    sent_at?: string | null;
    created_at?: string | null;
    message?: {
        id: number;
        status: string;
        error_message?: string | null;
        meta_message_id?: string | null;
        payload?: Record<string, any> | null;
        provider_error?: {
            message?: string | null;
            title?: string | null;
            details?: string | null;
            code?: string | number | null;
        } | null;
        sent_at?: string | null;
        delivered_at?: string | null;
        read_at?: string | null;
    } | null;
}

export default function TemplatesSend({
    account,
    template,
    contacts,
    conversations,
    recent_sends = []}: {
    account: any;
    template: Template;
    contacts: Contact[];
    conversations: Conversation[];
    recent_sends?: RecentSend[];
}) {
    const [highlightedSendId, setHighlightedSendId] = useState<number | null>(null);
    const { support_access: supportAccess = false } = usePage<any>().props;

    useEffect(() => {
        if (typeof window === 'undefined') return;
        const match = window.location.hash.match(/recent-send-(\d+)/);
        setHighlightedSendId(match ? Number(match[1]) : null);
    }, []);

    const getRecentSendStatusMeta = (send: RecentSend) => {
        const effectiveStatus = String(send.message?.status || send.status || 'unknown').toLowerCase();
        const map: Record<string, { variant: 'success' | 'warning' | 'danger' | 'default' | 'info'; label: string }> = {
            read: { variant: 'success', label: 'Read' },
            delivered: { variant: 'success', label: 'Delivered' },
            sent: { variant: 'info', label: 'Sent' },
            accepted: { variant: 'info', label: 'Accepted' },
            queued: { variant: 'default', label: 'Queued' },
            processing: { variant: 'default', label: 'Processing' },
            failed: { variant: 'danger', label: 'Failed' },
        };

        return map[effectiveStatus] || { variant: 'default' as const, label: effectiveStatus };
    };

    const getRecentSendError = (send: RecentSend): string | null => {
        const payload = send.message?.payload ?? {};
        const payloadError = payload?.error?.message
            || payload?.errors?.[0]?.message
            || payload?.errors?.[0]?.title
            || payload?.errors?.[0]?.details
            || null;

        return send.error_message || send.message?.error_message || payloadError || null;
    };

    const getRecentSendTimeline = (send: RecentSend): string | null => {
        const parts: string[] = [];
        if (send.message?.sent_at) parts.push('accepted');
        if (send.message?.delivered_at) parts.push('delivered');
        if (send.message?.read_at) parts.push('read');

        if (parts.length === 0) {
            const fallback = String(send.message?.status || send.status || '').trim();
            return fallback !== '' ? fallback : null;
        }

        return parts.join(' -> ');
    };

    const getRecentSendDiagnostics = (send: RecentSend) => {
        return [
            ['Final status', String(send.message?.status || send.status || 'unknown')],
            ['Meta message ID', send.message?.meta_message_id || '-'],
            ['Accepted at', send.message?.sent_at || send.sent_at || null],
            ['Delivered at', send.message?.delivered_at || null],
            ['Read at', send.message?.read_at || null],
        ].filter(([, value]) => value) as Array<[string, string]>;
    };

    const downloadRecentSendDiagnostics = (send: RecentSend) => {
        const blob = new Blob([
            JSON.stringify({
                template: {
                    id: template.id,
                    slug: template.slug,
                    name: template.name,
                    language: template.language,
                },
                send: {
                    id: send.id,
                    to_wa_id: send.to_wa_id,
                    status: send.status,
                    error_message: getRecentSendError(send),
                    timeline: getRecentSendTimeline(send),
                    sent_at: send.sent_at,
                    created_at: send.created_at,
                    message: send.message ?? null,
                },
            }, null, 2),
        ], { type: 'application/json;charset=utf-8' });

        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `template-send-diagnostics-${send.id}.json`;
        document.body.appendChild(link);
        link.click();
        link.remove();
        URL.revokeObjectURL(url);
    };

    const [recipientType, setRecipientType] = useState<'contact' | 'conversation' | 'manual'>('conversation');
    const [selectedContact, setSelectedContact] = useState<string>('');
    const [selectedConversation, setSelectedConversation] = useState<string>('');

    const { data, setData, post, processing, errors } = useForm({
        to_wa_id: '',
        header_media_url: template.header_media_url || '',
        variables: Array(template.required_variables.total).fill('')});

    const handleRecipientChange = (type: 'contact' | 'conversation' | 'manual') => {
        setRecipientType(type);
        setData('to_wa_id', '');
        setSelectedContact('');
        setSelectedConversation('');
    };

    const handleContactSelect = (waId: string) => {
        setSelectedContact(waId);
        setData('to_wa_id', waId);
    };

    const handleConversationSelect = (waId: string) => {
        setSelectedConversation(waId);
        setData('to_wa_id', waId);
    };

    const mediaHeaderRequired = ['IMAGE', 'VIDEO', 'DOCUMENT'].includes((template.header_type || '').toUpperCase());
    const hasRecipient = Boolean(String(data.to_wa_id || '').trim());
    const hasRequiredMediaHeader = !mediaHeaderRequired || Boolean(String(data.header_media_url || '').trim());
    const allVariablesFilled = (template.required_variables.total || 0) === 0
        || data.variables.slice(0, template.required_variables.total).every((value) => String(value || '').trim() !== '');
    const canSubmit = hasRecipient && hasRequiredMediaHeader && allVariablesFilled && !processing;
    const blockedReasons = [
        !hasRecipient ? 'Select or enter a recipient' : null,
        !hasRequiredMediaHeader ? 'Provide header media URL for this template' : null,
        !allVariablesFilled ? 'Fill all required template variables' : null,
    ].filter(Boolean) as string[];

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route('app.whatsapp.templates.send.store', {
            template: template.slug}));
    };

    // Render preview
    const renderPreview = () => {
        const preview: string[] = [];

        if (template.header_text) {
            let headerText = template.header_text;
            template.required_variables.header.forEach((varIndex) => {
                const varValue = data.variables[varIndex - 1] || `{{${varIndex}}}`;
                headerText = headerText.replace(`{{${varIndex}}}`, varValue);
            });
            preview.push(`📌 ${headerText}`);
        }

        if (template.body_text) {
            let bodyText = template.body_text;
            template.required_variables.body.forEach((varIndex) => {
                const varValue = data.variables[varIndex - 1] || `{{${varIndex}}}`;
                bodyText = bodyText.replace(`{{${varIndex}}}`, varValue);
            });
            preview.push(bodyText);
        }

        if (template.footer_text) {
            preview.push(`\n${template.footer_text}`);
        }

        return preview.join('\n\n');
    };

    return (
        <AppShell>
            <Head title={`Send ${template.name} - Template`} />
            <div className="space-y-8">
                <div>
                        <Link
                            href={route('app.whatsapp.templates.show', {
                                template: template.slug})}
                        className="inline-flex items-center gap-2 text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors mb-4"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        Back to Template
                    </Link>
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                            Send Template
                        </h1>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                            {template.name} ({template.language})
                        </p>
                    </div>
                </div>

                <div className="mx-auto max-w-5xl space-y-6">
                    {/* Form */}
                    <Card className="shadow-sm">
                        <CardHeader className="border-b border-gray-100 dark:border-gray-800">
                            <div className="flex items-center gap-3">
                                <div className="p-2 rounded-xl bg-green-600">
                                    <Send className="h-5 w-5 text-white" />
                                </div>
                                <div>
                                    <CardTitle className="text-xl font-bold">Recipient & Variables</CardTitle>
                                    <CardDescription>Select recipient and fill template variables</CardDescription>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="p-6">
                            <form onSubmit={submit} className="space-y-6">
                                {/* Recipient Selection */}
                                <div>
                                    <InputLabel value="Recipient" className="text-sm font-semibold mb-3" />
                                    <div className="space-y-3">
                                        <div className="flex items-center gap-4 p-3 bg-gray-50 dark:bg-gray-800 rounded-xl">
                                            <label className="flex items-center gap-2 cursor-pointer flex-1">
                                                <input
                                                    type="radio"
                                                    checked={recipientType === 'conversation'}
                                                    onChange={() => handleRecipientChange('conversation')}
                                                    className="w-4 h-4 text-blue-600"
                                                />
                                                <MessageSquare className="h-4 w-4 text-gray-500" />
                                                <span className="text-sm font-medium">From Conversation</span>
                                            </label>
                                            <label className="flex items-center gap-2 cursor-pointer flex-1">
                                                <input
                                                    type="radio"
                                                    checked={recipientType === 'contact'}
                                                    onChange={() => handleRecipientChange('contact')}
                                                    className="w-4 h-4 text-blue-600"
                                                />
                                                <User className="h-4 w-4 text-gray-500" />
                                                <span className="text-sm font-medium">From Contact</span>
                                            </label>
                                            <label className="flex items-center gap-2 cursor-pointer flex-1">
                                                <input
                                                    type="radio"
                                                    checked={recipientType === 'manual'}
                                                    onChange={() => handleRecipientChange('manual')}
                                                    className="w-4 h-4 text-blue-600"
                                                />
                                                <Phone className="h-4 w-4 text-gray-500" />
                                                <span className="text-sm font-medium">Manual Entry</span>
                                            </label>
                                        </div>

                                        {recipientType === 'conversation' && (
                                            <>
                                                <select
                                                    value={selectedConversation}
                                                    onChange={(e) => handleConversationSelect(e.target.value)}
                                                    className="w-full rounded-xl border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-700 px-4 py-2.5"
                                                    required
                                                >
                                                    <option value="">Select conversation...</option>
                                                    {conversations.map((conv) => (
                                                        <option key={conv.id} value={conv.contact.wa_id}>
                                                            {conv.contact.name} ({conv.contact.wa_id})
                                                        </option>
                                                    ))}
                                                </select>
                                                {conversations.length === 0 && (
                                                    <p className="text-xs text-amber-600 dark:text-amber-400">
                                                        No conversations found. Switch to Contact or Manual Entry.
                                                    </p>
                                                )}
                                            </>
                                        )}

                                        {recipientType === 'contact' && (
                                            <>
                                                <select
                                                    value={selectedContact}
                                                    onChange={(e) => handleContactSelect(e.target.value)}
                                                    className="w-full rounded-xl border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-700 px-4 py-2.5"
                                                    required
                                                >
                                                    <option value="">Select contact...</option>
                                                    {contacts.map((contact) => (
                                                        <option key={contact.id} value={contact.wa_id}>
                                                            {contact.name || contact.wa_id} ({contact.wa_id})
                                                        </option>
                                                    ))}
                                                </select>
                                                {contacts.length === 0 && (
                                                    <p className="text-xs text-amber-600 dark:text-amber-400">
                                                        No contacts found. Switch to Conversation or Manual Entry.
                                                    </p>
                                                )}
                                            </>
                                        )}

                                        {recipientType === 'manual' && (
                                            <TextInput
                                                type="text"
                                                value={data.to_wa_id}
                                                onChange={(e) => setData('to_wa_id', e.target.value)}
                                                placeholder="Enter WhatsApp ID (e.g., 1234567890)"
                                                className="rounded-xl"
                                                required
                                            />
                                        )}
                                    </div>
                                    <InputError message={errors.to_wa_id} className="mt-2" />
                                </div>

                                {/* Variables */}
                                {template.required_variables.total > 0 && (
                                    <div>
                                        <InputLabel value={`Template Variables (${template.required_variables.total} required)`} className="text-sm font-semibold mb-3" />
                                        <div className="space-y-3">
                                            {Array.from({ length: template.required_variables.total }, (_, index) => {
                                                const varIndex = index + 1;
                                                const isHeader = template.required_variables.header.includes(varIndex);
                                                const isBody = template.required_variables.body.includes(varIndex);
                                                const label = isHeader
                                                    ? `Header Variable {{${varIndex}}}`
                                                    : isBody
                                                    ? `Body Variable {{${varIndex}}}`
                                                    : `Button Variable {{${varIndex}}}`;

                                                return (
                                                    <div key={index}>
                                                        <TextInput
                                                            type="text"
                                                            value={data.variables[index] || ''}
                                                            onChange={(e) => {
                                                                const newVars = [...data.variables];
                                                                newVars[index] = e.target.value;
                                                                setData('variables', newVars);
                                                            }}
                                                            placeholder={label}
                                                            className="rounded-xl"
                                                            required
                                                        />
                                                    </div>
                                                );
                                            })}
                                        </div>
                                        <InputError message={errors.variables} className="mt-2" />
                                    </div>
                                )}

                                {['IMAGE', 'VIDEO', 'DOCUMENT'].includes((template.header_type || '').toUpperCase()) && (
                                    <div>
                                        <InputLabel
                                            value="Header Media URL"
                                            className="text-sm font-semibold mb-2"
                                        />
                                        <TextInput
                                            type="url"
                                            value={data.header_media_url}
                                            onChange={(e) => setData('header_media_url', e.target.value)}
                                            placeholder="https://example.com/media.jpg"
                                            className="rounded-xl"
                                            required
                                        />
                                        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                                            This template needs a media file link that WhatsApp can reach.
                                        </p>
                                        <InputError message={errors.header_media_url} className="mt-2" />
                                    </div>
                                )}

                                {blockedReasons.length > 0 && (
                                    <div className="rounded-xl border border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-900/20 p-3">
                                        <p className="text-xs font-semibold text-amber-900 dark:text-amber-100 mb-1">Complete these before sending:</p>
                                        <ul className="text-xs text-amber-800 dark:text-amber-200 space-y-1">
                                            {blockedReasons.map((reason) => (
                                                <li key={reason}>• {reason}</li>
                                            ))}
                                        </ul>
                                    </div>
                                )}

                                <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-end gap-3 sm:gap-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                                        <Link
                                            href={route('app.whatsapp.templates.show', {
                                                template: template.slug})}
                                            className="w-full sm:w-auto"
                                    >
                                        <Button type="button" variant="secondary" className="w-full sm:w-auto rounded-xl">
                                            Cancel
                                        </Button>
                                    </Link>
                                    <Button 
                                        type="submit" 
                                        disabled={!canSubmit}
                                        className="w-full sm:w-auto rounded-xl"
                                    >
                                        {processing ? 'Sending...' : (
                                            <>
                                                <Send className="h-4 w-4 mr-2" />
                                                Send Template
                                            </>
                                        )}
                                    </Button>
                                </div>
                            </form>
                        </CardContent>
                    </Card>

                    {/* Preview */}
                    <Card className="shadow-sm">
                        <CardHeader className="border-b border-gray-100 dark:border-gray-800">
                            <div className="flex items-center gap-3">
                                <div className="p-2 rounded-xl bg-blue-600">
                                    <Eye className="h-5 w-5 text-white" />
                                </div>
                                <div>
                                    <CardTitle className="text-xl font-bold">Preview</CardTitle>
                                    <CardDescription>How your message will appear</CardDescription>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="p-6">
                            <div className="space-y-4">
                                <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700">
                                    <div className="flex items-center gap-2 mb-3">
                                        <Sparkles className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                                        <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                                            Template: {template.name}
                                        </span>
                                    </div>
                                    <div className="bg-white dark:bg-gray-950 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                                        <pre className="text-sm whitespace-pre-wrap text-gray-900 dark:text-gray-100 leading-relaxed">
                                            {renderPreview()}
                                        </pre>
                                    </div>
                                </div>
                                {template.has_buttons && template.buttons.length > 0 && (
                                    <div className="space-y-2">
                                        <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Buttons</p>
                                        {template.buttons.map((button, index) => (
                                            <div
                                                key={index}
                                                className="p-4 bg-blue-50 dark:bg-blue-900/10 rounded-xl border border-blue-200 dark:border-blue-800 hover:border-blue-300 dark:hover:border-blue-700 transition-colors"
                                            >
                                                <div className="flex items-center justify-between">
                                                    <span className="font-semibold text-gray-900 dark:text-gray-100">{button.text}</span>
                                                    <Badge variant="info" className="px-3 py-1">
                                                        {button.type}
                                                    </Badge>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="shadow-sm">
                        <CardHeader className="border-b border-gray-100 dark:border-gray-800">
                            <div className="flex items-center gap-3">
                                <div className="p-2 rounded-xl bg-amber-500">
                                    <Eye className="h-5 w-5 text-white" />
                                </div>
                                <div>
                                    <CardTitle className="text-xl font-bold">Recent Send Attempts</CardTitle>
                                    <CardDescription>Recent sends and what happened next</CardDescription>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="p-4">
                            {recent_sends.length === 0 ? (
                                <p className="text-sm text-gray-500 dark:text-gray-400">No send attempts yet for this template.</p>
                            ) : (
                                <div className="space-y-3">
                                    {recent_sends.map((send) => {
                                        const statusMeta = getRecentSendStatusMeta(send);
                                        const errorText = getRecentSendError(send);
                                        const timeline = getRecentSendTimeline(send);
                                        return (
                                            <div
                                                id={`recent-send-${send.id}`}
                                                key={send.id}
                                                className={`scroll-mt-24 rounded-xl border border-gray-200 dark:border-gray-700 p-3 bg-white dark:bg-gray-900 ${
                                                    highlightedSendId === send.id ? 'ring-2 ring-amber-400 dark:ring-amber-500' : ''
                                                }`}
                                            >
                                                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                                                    <div className="text-sm font-semibold text-gray-900 dark:text-gray-100">{send.to_wa_id}</div>
                                                    <Badge variant={statusMeta.variant} className="px-2 py-1 text-[10px] w-fit">
                                                        {statusMeta.label}
                                                    </Badge>
                                                </div>
                                                {timeline && (
                                                    <div className="mt-2 text-[11px] text-gray-500">
                                                        {timeline}
                                                    </div>
                                                )}
                                                <div className="mt-2 text-xs font-mono text-gray-500 break-all">
                                                    {send.message?.meta_message_id || '-'}
                                                </div>
                                                {errorText && (
                                                    <div className="mt-2 text-xs text-red-600 dark:text-red-400 break-words">
                                                        {errorText}
                                                    </div>
                                                )}
                                                <details className="mt-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-950/40 p-3">
                                                    <summary className="cursor-pointer text-xs font-semibold text-gray-700 dark:text-gray-200">
                                                        Diagnostics
                                                    </summary>
                                                    <div className="mt-2">
                                                        <div className="mt-2 flex flex-wrap gap-3">
                                                            <Link
                                                                href={`${route('app.whatsapp.templates.show', { template: template.slug })}#recent-send-${send.id}`}
                                                                className="text-[11px] font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                                                            >
                                                                Open full details
                                                            </Link>
                                                            {supportAccess && (
                                                                <button
                                                                    type="button"
                                                                    onClick={() => downloadRecentSendDiagnostics(send)}
                                                                    className="text-[11px] font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                                                                >
                                                                    Download bundle
                                                                </button>
                                                            )}
                                                        </div>
                                                    </div>
                                                    <dl className="mt-3 space-y-1.5 text-xs">
                                                        {getRecentSendDiagnostics(send).map(([label, value]) => (
                                                            <div key={label} className="grid gap-1 sm:grid-cols-[120px_1fr] sm:gap-2">
                                                                <dt className="text-gray-500 dark:text-gray-400">{label}</dt>
                                                                <dd className="break-all text-gray-800 dark:text-gray-100">
                                                                    {value.includes('T') ? new Date(value).toLocaleString() : value}
                                                                </dd>
                                                            </div>
                                                        ))}
                                                        {supportAccess && send.message?.payload && (
                                                            <div className="pt-2">
                                                                <dt className="mb-1 text-gray-500 dark:text-gray-400">Provider payload</dt>
                                                                <dd className="overflow-x-auto rounded bg-white p-2 font-mono text-[11px] text-gray-700 dark:bg-gray-900 dark:text-gray-200">
                                                                    <pre>{JSON.stringify(send.message.payload, null, 2)}</pre>
                                                                </dd>
                                                            </div>
                                                        )}
                                                        {send.message?.provider_error?.details && (
                                                            <div className="grid gap-1 sm:grid-cols-[120px_1fr] sm:gap-2">
                                                                <dt className="text-gray-500 dark:text-gray-400">Details</dt>
                                                                <dd className="break-words text-gray-800 dark:text-gray-100">
                                                                    {send.message.provider_error.details}
                                                                </dd>
                                                            </div>
                                                        )}
                                                        {send.message?.provider_error?.code && (
                                                            <div className="grid gap-1 sm:grid-cols-[120px_1fr] sm:gap-2">
                                                                <dt className="text-gray-500 dark:text-gray-400">Code</dt>
                                                                <dd className="break-words text-gray-800 dark:text-gray-100">
                                                                    {send.message.provider_error.code}
                                                                </dd>
                                                            </div>
                                                        )}
                                                    </dl>
                                                </details>
                                                <div className="mt-2 text-[11px] text-gray-500">
                                                    {(send.sent_at || send.created_at) ? new Date(send.sent_at || send.created_at || '').toLocaleString() : '-'}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AppShell>
    );
}
