import { router, useForm } from '@inertiajs/react';
import AppShell from '@/Layouts/AppShell';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/Components/UI/Card';
import { Badge } from '@/Components/UI/Badge';
import Button from '@/Components/UI/Button';
import { EmptyState } from '@/Components/UI/EmptyState';
import { ArrowLeft, Check, CheckCheck, Copy, Edit, ExternalLink, Eye, FileText, Filter, Globe, Image as ImageIcon, MessageSquareText, MoreVertical, RefreshCw, Reply, Search, Send, Tag, Trash2, Archive, Video, Phone, User, Zap, X, Sparkles, Plus, Upload } from 'lucide-react';
import { FormEvent, useEffect, useMemo, useRef, useState } from 'react';
import type { ChangeEvent } from 'react';
import TextInput from '@/Components/TextInput';
import { Head } from '@inertiajs/react';
import { useToast } from '@/hooks/useToast';
import { useConfirm } from '@/hooks/useConfirm';
import { Drawer, Modal } from '@/Components/UI/Elements';

interface Template {
    id: number;
    slug: string;
    name: string;
    language: string;
    category: string;
    status: string;
    body_text: string | null;
    header_type: 'NONE' | 'TEXT' | 'IMAGE' | 'VIDEO' | 'DOCUMENT';
    header_text: string | null;
    header_media_url: string | null;
    footer_text: string | null;
    buttons: TemplateButton[];
    has_buttons: boolean;
    variable_count: number;
    quality_score?: string | null;
    rejection_reason?: string | null;
    stats?: { sent: number; delivered: number; read: number; failed: number };
    connection: {
        id: number;
        name: string;
    };
    last_synced_at: string | null;
}

interface TemplateButton {
    type: 'QUICK_REPLY' | 'URL' | 'PHONE_NUMBER';
    text: string;
    url?: string;
    url_example?: string;
    phone_number?: string;
}

interface LibraryTemplate {
    id: string;
    name: string;
    title: string;
    category: 'MARKETING' | 'UTILITY' | 'AUTHENTICATION';
    language: string;
    header_type: 'NONE' | 'TEXT' | 'IMAGE' | 'VIDEO' | 'DOCUMENT';
    header_text?: string | null;
    body_text: string;
    body_examples?: string[];
    footer_text?: string | null;
    buttons?: TemplateButton[];
    use_case: string;
}

interface TemplateFormData {
    whatsapp_connection_id: string;
    name: string;
    language: string;
    category: 'MARKETING' | 'UTILITY' | 'AUTHENTICATION';
    header_type: 'NONE' | 'TEXT' | 'IMAGE' | 'VIDEO' | 'DOCUMENT';
    header_text: string;
    header_media_url: string;
    body_text: string;
    body_examples: string[];
    footer_text: string;
    buttons: TemplateButton[];
}

interface Filters {
    connection: string;
    status: string;
    category: string;
    language: string;
    search: string;
}

interface ContactOption {
    id: number;
    wa_id: string;
    name: string | null;
}

interface ConversationOption {
    id: number;
    contact: {
        wa_id: string;
        name: string | null;
    };
}

const categoryTone = (category: string) => {
    const normalized = category.toLowerCase();
    if (normalized.includes('marketing')) return 'bg-pink-50 text-pink-700 dark:bg-pink-500/10 dark:text-pink-300';
    if (normalized.includes('utility')) return 'bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-300';
    if (normalized.includes('authentication')) return 'bg-purple-50 text-purple-700 dark:bg-purple-500/10 dark:text-purple-300';
    return 'bg-gray-50 text-gray-700 dark:bg-slate-700 dark:text-slate-200';
};

const variableNumbersFromText = (text: string) => {
    const numbers = (text.match(/\{\{(\d+)\}\}/g) || [])
        .map((value) => Number(value.match(/\d+/)?.[0] || 0))
        .filter(Boolean);

    return Array.from(new Set(numbers)).sort((a, b) => a - b);
};

const mediaAcceptForHeader = (type: TemplateFormData['header_type']) => {
    if (type === 'IMAGE') return 'image/jpeg,image/jpg,image/png';
    if (type === 'VIDEO') return 'video/mp4';
    if (type === 'DOCUMENT') return 'application/pdf';
    return '';
};

function TemplatePhonePreview({ template }: { template: Template }) {
    const body = template.body_text || 'Template message';
    const parts = body.split(/(\{\{\d+\}\})/g);

    return (
        <div className="relative mx-auto w-[260px] origin-top">
            <div className="rounded-[28px] bg-[#1A1A2E] p-2 shadow-pop ring-1 ring-black/10 dark:ring-white/10">
                <div className="flex h-9 items-center gap-2 rounded-[20px] bg-[#075E54] px-3 text-white">
                    <ArrowLeft className="h-3.5 w-3.5" />
                    <div className="flex h-6 w-6 items-center justify-center rounded-full bg-white/30 text-[10px] font-bold">W</div>
                    <div className="min-w-0 flex-1">
                        <div className="text-[11px] font-semibold leading-tight">Zyptos Business</div>
                        <div className="text-[9px] text-white/70">online</div>
                    </div>
                    <Video className="h-3 w-3" />
                    <Phone className="h-3 w-3" />
                </div>
                <div className="chat-bg min-h-[280px] rounded-b-[20px] p-3">
                    <div className="relative max-w-[88%] rounded-bl-lg rounded-br-lg rounded-tl-md rounded-tr-lg bg-white p-2.5 text-waify-text shadow-sm dark:bg-[#202C33] dark:text-[#E9EDEF]">
                        <div className="mb-2 -mx-1 -mt-1 flex aspect-[16/9] items-center justify-center rounded-md bg-gradient-to-br from-waify-green to-waify-green-dark text-white">
                            <ImageIcon className="h-5 w-5 opacity-80" />
                        </div>
                        <p className="whitespace-pre-wrap text-[12px] leading-snug">
                            {parts.map((part, index) => (/^\{\{\d+\}\}$/.test(part)
                                ? <span key={`${part}-${index}`} className="rounded bg-blue-100 px-1 font-mono text-[11px] font-semibold text-blue-700 dark:bg-blue-900/50 dark:text-blue-300">{part}</span>
                                : <span key={`${part}-${index}`}>{part}</span>
                            ))}
                        </p>
                        <div className="mt-1 flex items-center justify-end gap-0.5 text-[9px] text-gray-400 dark:text-[#8696A0]">
                            10:24 AM <CheckCheck className="h-2.5 w-2.5 text-blue-500" />
                        </div>
                    </div>
                    {template.has_buttons && (
                        <div className="mt-1.5 space-y-1">
                            <div className="flex w-[88%] items-center justify-center gap-1 rounded-md bg-white py-1.5 text-[11px] font-medium text-blue-600 shadow-sm dark:bg-[#2A3942] dark:text-[#53BDEB]">
                                <Reply className="h-2.5 w-2.5" />
                                Quick reply
                            </div>
                            <div className="flex w-[88%] items-center justify-center gap-1 rounded-md bg-white py-1.5 text-[11px] font-medium text-blue-600 shadow-sm dark:bg-[#2A3942] dark:text-[#53BDEB]">
                                <ExternalLink className="h-2.5 w-2.5" />
                                Visit website
                            </div>
                        </div>
                    )}
                </div>
            </div>
            <div className="absolute left-1/2 top-1 h-1 w-12 -translate-x-1/2 rounded-full bg-white/20" />
        </div>
    );
}

function TemplateBuilderDrawer({
    open,
    onClose,
    template,
    connections,
}: {
    open: boolean;
    onClose: () => void;
    template: Template | null;
    connections: Array<{ id: number; name: string }>;
}) {
    const { toast } = useToast();
    const editing = Boolean(template && template.id > 0);

    const [submitting, setSubmitting] = useState(false);
    const [uploadingMedia, setUploadingMedia] = useState(false);
    const fileInputRef = useRef<HTMLInputElement | null>(null);
    const { data, setData, errors, reset } = useForm<TemplateFormData>({
        whatsapp_connection_id: template?.connection?.id?.toString() || connections?.[0]?.id?.toString() || '',
        name: template?.name || '',
        language: template?.language || 'en_US',
        category: (template?.category as TemplateFormData['category']) || 'UTILITY',
        header_type: template?.header_type || 'NONE',
        header_text: template?.header_text || '',
        header_media_url: template?.header_media_url || '',
        body_text: template?.body_text || 'Hi {{1}}, ',
        body_examples: [],
        footer_text: template?.footer_text || '',
        buttons: template?.buttons || [],
    });

    const previewTemplate = useMemo<Template>(() => ({
        id: template?.id || 0,
        slug: template?.slug || 'preview',
        name: data.name || 'new_template',
        language: data.language,
        category: data.category,
        status: template?.status || 'pending',
        body_text: data.body_text,
        header_type: data.header_type,
        header_text: data.header_text,
        header_media_url: data.header_media_url,
        footer_text: data.footer_text,
        buttons: data.buttons,
        has_buttons: data.buttons.length > 0,
        variable_count: (data.body_text.match(/\{\{\d+\}\}/g) || []).length,
        connection: template?.connection || { id: Number(data.whatsapp_connection_id || connections?.[0]?.id || 0), name: connections?.find((connection) => connection.id.toString() === data.whatsapp_connection_id)?.name || 'Zyptos Business' },
        last_synced_at: template?.last_synced_at || null,
    }), [connections, data, template]);

    const bodyVariables = useMemo(() => variableNumbersFromText(data.body_text), [data.body_text]);

    const insertVariable = () => {
        const used = (data.body_text.match(/\{\{(\d+)\}\}/g) || []).map((value) => Number(value.match(/\d+/)?.[0] || 0));
        const next = used.length ? Math.max(...used) + 1 : 1;
        setData('body_text', `${data.body_text}{{${next}}}`);
    };

    const updateBodyExample = (variableNumber: number, value: string) => {
        const next = [...data.body_examples];
        next[variableNumber - 1] = value;
        setData('body_examples', next);
    };

    const uploadHeaderMedia = async (file: File) => {
        setUploadingMedia(true);
        try {
            const formData = new FormData();
            formData.append('file', file);
            formData.append('type', data.header_type);

            const csrf = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '';
            const response = await fetch(route('app.whatsapp.templates.upload-media', {}), {
                method: 'POST',
                headers: {
                    Accept: 'application/json',
                    'X-CSRF-TOKEN': csrf,
                },
                body: formData,
            });

            const result = await response.json();
            if (!response.ok) {
                throw new Error(result.message || result.error || 'Failed to upload file.');
            }

            setData('header_media_url', result.url);
            toast.success('File uploaded', 'Header sample attached to this template.');
        } catch (error: any) {
            toast.error('Upload failed', error.message || 'Failed to upload file.');
        } finally {
            setUploadingMedia(false);
        }
    };

    const handleMediaFileChange = (event: ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            uploadHeaderMedia(file);
        }
        event.target.value = '';
    };

    const addButton = (type: 'QUICK_REPLY' | 'URL' | 'PHONE_NUMBER') => {
        if (data.buttons.length >= 3) {
            toast.error('Maximum 3 buttons allowed');
            return;
        }
        setData('buttons', [
            ...data.buttons,
            { type, text: type === 'URL' ? 'Visit Website' : type === 'PHONE_NUMBER' ? 'Call us' : 'Reply' },
        ]);
    };

    const updateButton = (index: number, field: keyof TemplateButton, value: string) => {
        const next = [...data.buttons];
        next[index] = { ...next[index], [field]: value };
        setData('buttons', next);
    };

    const removeButton = (index: number) => {
        setData('buttons', data.buttons.filter((_, buttonIndex) => buttonIndex !== index));
    };

    const firstError = Object.values(errors)[0];

    const closeDrawer = () => {
        reset();
        onClose();
    };

    const submit = () => {
        if (submitting) {
            return;
        }

        const cleanedButtons = data.buttons.filter((button) => button.text.trim());
        const cleanedExamples = bodyVariables.map((variableNumber) => data.body_examples[variableNumber - 1] || '').filter((example) => example.trim());
        const payload: Record<string, any> = {
            ...data,
            name: data.name.trim(),
            body_text: data.body_text.trim(),
            footer_text: data.footer_text.trim(),
            header_text: data.header_text.trim(),
            header_media_url: data.header_media_url.trim(),
            body_examples: cleanedExamples,
            buttons: cleanedButtons,
        };

        const options = {
            preserveScroll: true,
            onSuccess: () => {
                toast.success(editing ? 'Template updated' : 'Template submitted for approval');
                closeDrawer();
            },
            onError: (serverErrors: Record<string, string>) => {
                const message = Object.values(serverErrors || {}).filter(Boolean)[0];
                toast.error(
                    editing ? 'Failed to update template' : 'Failed to create template',
                    message || 'Check the highlighted fields and try again.'
                );
            },
            onFinish: () => setSubmitting(false),
        };

        setSubmitting(true);

        if (editing && template) {
            router.put(route('app.whatsapp.templates.update', { template: template.slug }), payload, options);
        } else {
            router.post(route('app.whatsapp.templates.store', {}), payload, options);
        }
    };

    return (
        <Drawer
            open={open}
            onClose={closeDrawer}
            title={editing ? 'Edit template' : 'Create new template'}
            description="Build a reusable WhatsApp template with live preview."
            className="max-w-6xl"
            footer={
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div className="text-xs text-waify-text-muted dark:text-waify-dark-text-muted">
                        Status remains pending until Meta approval.
                    </div>
                    <div className="grid grid-cols-2 gap-2 sm:flex">
                        <Button type="button" variant="ghost" onClick={closeDrawer} className="w-full sm:w-auto">Cancel</Button>
                        <Button type="button" onClick={submit} disabled={submitting} className="w-full sm:w-auto">
                            <Send className="h-4 w-4" />
                            {editing ? 'Submit update' : 'Submit'}
                        </Button>
                    </div>
                </div>
            }
        >
            {firstError && (
                <div className="mb-4 rounded-card border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-200">
                    {firstError}
                </div>
            )}
            <div className="grid min-h-full min-w-0 gap-6 xl:grid-cols-[minmax(0,1fr)_340px]">
                <div className="min-w-0 space-y-5">
                    <div className="grid gap-3 sm:grid-cols-2">
                        <div>
                            <label className="mb-1 block text-xs font-medium text-waify-text dark:text-waify-dark-text">Template name</label>
                            <TextInput value={data.name} onChange={(event) => setData('name', event.target.value)} placeholder="diwali_sale_2026" className="h-10 rounded-btn border-gray-200 dark:border-waify-dark-border dark:bg-waify-dark-surface-2" />
                            <p className="mt-1 text-[10px] text-waify-text-muted dark:text-waify-dark-text-muted">Letters, numbers, and underscores only.</p>
                            {errors.name && <p className="mt-1 text-xs text-red-600 dark:text-red-300">{errors.name}</p>}
                        </div>
                        <div>
                            <label className="mb-1 block text-xs font-medium text-waify-text dark:text-waify-dark-text">Language</label>
                            <select value={data.language} onChange={(event) => setData('language', event.target.value)} className="h-10 w-full rounded-btn border-gray-200 bg-white px-3 text-sm text-waify-text shadow-sm focus:border-waify-green focus:ring-waify-green/20 dark:border-waify-dark-border dark:bg-waify-dark-surface-2 dark:text-waify-dark-text">
                                <option value="en_US">English (US)</option>
                                <option value="en_GB">English (UK)</option>
                                <option value="hi_IN">Hindi</option>
                                <option value="mr_IN">Marathi</option>
                                <option value="ta_IN">Tamil</option>
                            </select>
                        </div>
                    </div>

                    <div>
                        <label className="mb-2 block text-xs font-medium text-waify-text dark:text-waify-dark-text">Category</label>
                        <div className="grid gap-2 sm:grid-cols-3">
                            {[
                                { id: 'MARKETING', label: 'Marketing', desc: 'Promotions & offers' },
                                { id: 'UTILITY', label: 'Utility', desc: 'Order and account updates' },
                                { id: 'AUTHENTICATION', label: 'Authentication', desc: 'OTP and login codes' },
                            ].map((category) => (
                                <button
                                    key={category.id}
                                    type="button"
                                    onClick={() => setData('category', category.id as TemplateFormData['category'])}
                                    className={`rounded-btn p-3 text-left ring-1 transition ${data.category === category.id ? 'bg-waify-green-soft ring-waify-green dark:bg-waify-dark-green-soft' : 'bg-white ring-gray-200 hover:ring-gray-300 dark:bg-waify-dark-surface-2 dark:ring-waify-dark-border'}`}
                                >
                                    <div className="text-sm font-semibold text-waify-text dark:text-waify-dark-text">{category.label}</div>
                                    <div className="mt-1 text-[11px] text-waify-text-muted dark:text-waify-dark-text-muted">{category.desc}</div>
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="border-t border-gray-100 pt-4 dark:border-waify-dark-border">
                        <div className="mb-2 flex items-center justify-between gap-3">
                            <label className="text-xs font-medium text-waify-text dark:text-waify-dark-text">Header</label>
                            <div className="flex flex-wrap items-center gap-1">
                                {(['NONE', 'TEXT', 'IMAGE', 'VIDEO', 'DOCUMENT'] as TemplateFormData['header_type'][]).map((type) => (
                                    <button
                                        key={type}
                                        type="button"
                                        onClick={() => setData('header_type', type)}
                                        className={`h-7 rounded-md px-2 text-[11px] font-medium transition ${data.header_type === type ? 'bg-waify-green text-white' : 'bg-gray-100 text-waify-text-muted hover:text-waify-text dark:bg-waify-dark-surface-2 dark:text-waify-dark-text-muted dark:hover:text-waify-dark-text'}`}
                                    >
                                        {type === 'NONE' ? 'None' : type}
                                    </button>
                                ))}
                            </div>
                        </div>
                        {data.header_type === 'TEXT' && (
                            <TextInput value={data.header_text} onChange={(event) => setData('header_text', event.target.value)} placeholder="Header text" maxLength={60} className="h-10 rounded-btn border-gray-200 dark:border-waify-dark-border dark:bg-waify-dark-surface-2" />
                        )}
                        {['IMAGE', 'VIDEO', 'DOCUMENT'].includes(data.header_type) && (
                            <div className="space-y-3">
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept={mediaAcceptForHeader(data.header_type)}
                                    onChange={handleMediaFileChange}
                                    className="hidden"
                                    disabled={uploadingMedia}
                                />
                                <div className="grid gap-2 sm:grid-cols-[auto_minmax(0,1fr)]">
                                    <Button type="button" variant="secondary" onClick={() => fileInputRef.current?.click()} disabled={uploadingMedia} className="w-full sm:w-auto">
                                        <Upload className="h-4 w-4" />
                                        {uploadingMedia ? 'Uploading...' : 'Upload sample'}
                                    </Button>
                                    <TextInput value={data.header_media_url} onChange={(event) => setData('header_media_url', event.target.value)} placeholder="Or paste a public Meta-accessible sample URL" className="h-10 rounded-btn border-gray-200 dark:border-waify-dark-border dark:bg-waify-dark-surface-2" />
                                </div>
                                {data.header_media_url && (
                                    <div className="rounded-btn border border-gray-100 bg-gray-50 p-3 text-xs text-waify-text-muted dark:border-waify-dark-border dark:bg-waify-dark-surface-2 dark:text-waify-dark-text-muted">
                                        <div className="mb-2 flex items-center justify-between gap-3">
                                            <span className="font-semibold text-waify-text dark:text-waify-dark-text">Header sample attached</span>
                                            <button type="button" onClick={() => setData('header_media_url', '')} className="text-red-600 hover:underline dark:text-red-300">Remove</button>
                                        </div>
                                        <div className="break-all">{data.header_media_url}</div>
                                        {data.header_type === 'IMAGE' && (
                                            <img src={data.header_media_url} alt="Header sample" className="mt-3 max-h-40 rounded-card object-contain" />
                                        )}
                                    </div>
                                )}
                                {errors.header_media_url && <p className="text-xs text-red-600 dark:text-red-300">{errors.header_media_url}</p>}
                            </div>
                        )}
                    </div>

                    <div>
                        <div className="mb-1 flex items-center justify-between">
                            <label className="text-xs font-medium text-waify-text dark:text-waify-dark-text">Body</label>
                            <button type="button" onClick={insertVariable} className="inline-flex items-center gap-1 text-[11px] font-medium text-waify-green-dark hover:underline dark:text-emerald-300">
                                <Plus className="h-3 w-3" />
                                Insert variable
                            </button>
                        </div>
                        <textarea
                            rows={6}
                            value={data.body_text}
                            onChange={(event) => setData('body_text', event.target.value)}
                            maxLength={1024}
                            className="w-full resize-none rounded-btn border border-gray-200 bg-white p-3 text-sm text-waify-text outline-none focus:border-waify-green focus:ring-2 focus:ring-waify-green/15 dark:border-waify-dark-border dark:bg-waify-dark-surface-2 dark:text-waify-dark-text"
                            placeholder="Enter message body. Use {{1}}, {{2}} for variables."
                        />
                        <div className="mt-1 flex justify-between text-[10px] text-waify-text-muted dark:text-waify-dark-text-muted">
                            <span>Use variables for personalized values.</span>
                            <span>{data.body_text.length}/1024</span>
                        </div>
                        {errors.body_text && <p className="mt-1 text-xs text-red-600 dark:text-red-300">{errors.body_text}</p>}
                        {bodyVariables.length > 0 && (
                            <div className="mt-3 rounded-btn border border-gray-100 bg-gray-50 p-3 dark:border-waify-dark-border dark:bg-waify-dark-surface-2">
                                <div className="mb-2 text-xs font-semibold text-waify-text dark:text-waify-dark-text">Sample values for Meta approval</div>
                                <div className="grid gap-2 sm:grid-cols-2">
                                    {bodyVariables.map((variableNumber) => (
                                        <TextInput
                                            key={variableNumber}
                                            value={data.body_examples[variableNumber - 1] || ''}
                                            onChange={(event) => updateBodyExample(variableNumber, event.target.value)}
                                            placeholder={`Example for {{${variableNumber}}}`}
                                            className="h-9 rounded-btn border-gray-200 dark:border-waify-dark-border dark:bg-waify-dark-surface"
                                        />
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    <div>
                        <label className="mb-1 block text-xs font-medium text-waify-text dark:text-waify-dark-text">Footer</label>
                        <TextInput value={data.footer_text} onChange={(event) => setData('footer_text', event.target.value)} placeholder="e.g. Reply STOP to unsubscribe" maxLength={60} className="h-10 rounded-btn border-gray-200 dark:border-waify-dark-border dark:bg-waify-dark-surface-2" />
                    </div>

                    <div>
                        <div className="mb-2 flex items-center justify-between">
                            <label className="text-xs font-medium text-waify-text dark:text-waify-dark-text">Buttons</label>
                            <div className="flex items-center gap-1">
                                <Button type="button" variant="secondary" size="xs" onClick={() => addButton('QUICK_REPLY')} disabled={data.buttons.length >= 3}>+ Quick reply</Button>
                                <Button type="button" variant="secondary" size="xs" onClick={() => addButton('URL')} disabled={data.buttons.length >= 3}>+ CTA</Button>
                                <Button type="button" variant="secondary" size="xs" onClick={() => addButton('PHONE_NUMBER')} disabled={data.buttons.length >= 3}>+ Call</Button>
                            </div>
                        </div>
                        <div className="space-y-2">
                            {data.buttons.length === 0 && (
                                <div className="rounded-btn border border-dashed border-gray-200 py-3 text-center text-xs text-waify-text-muted dark:border-waify-dark-border dark:text-waify-dark-text-muted">
                                    No buttons yet.
                                </div>
                            )}
                            {data.buttons.map((button, index) => (
                                <div key={index} className="rounded-btn bg-gray-50 p-2 dark:bg-waify-dark-surface-2">
                                    <div className="flex items-center gap-2">
                                        <input value={button.text} onChange={(event) => updateButton(index, 'text', event.target.value)} className="h-9 flex-1 rounded-md border border-gray-200 bg-white px-3 text-sm dark:border-waify-dark-border dark:bg-waify-dark-surface dark:text-waify-dark-text" />
                                        <button type="button" onClick={() => removeButton(index)} className="rounded-md p-2 text-waify-text-muted hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-500/10 dark:hover:text-red-200">
                                            <X className="h-4 w-4" />
                                        </button>
                                    </div>
                                    {button.type === 'URL' && (
                                        <div className="mt-2 grid gap-2 sm:grid-cols-2">
                                            <input value={button.url || ''} onChange={(event) => updateButton(index, 'url', event.target.value)} placeholder="https://example.com" className="h-9 w-full rounded-md border border-gray-200 bg-white px-3 text-sm dark:border-waify-dark-border dark:bg-waify-dark-surface dark:text-waify-dark-text" />
                                            <input value={button.url_example || ''} onChange={(event) => updateButton(index, 'url_example', event.target.value)} placeholder="Dynamic URL example" className="h-9 w-full rounded-md border border-gray-200 bg-white px-3 text-sm dark:border-waify-dark-border dark:bg-waify-dark-surface dark:text-waify-dark-text" />
                                        </div>
                                    )}
                                    {button.type === 'PHONE_NUMBER' && (
                                        <input value={button.phone_number || ''} onChange={(event) => updateButton(index, 'phone_number', event.target.value)} placeholder="+919988776655" className="mt-2 h-9 w-full rounded-md border border-gray-200 bg-white px-3 text-sm dark:border-waify-dark-border dark:bg-waify-dark-surface dark:text-waify-dark-text" />
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                <aside className="rounded-card border border-gray-100 bg-gray-50/70 p-5 dark:border-waify-dark-border dark:bg-slate-950">
                    <div className="mb-3 text-[11px] font-bold uppercase tracking-wider text-waify-text-muted dark:text-waify-dark-text-muted">Live Preview</div>
                    <TemplatePhonePreview template={previewTemplate} />
                    <div className="mt-4 rounded-card border border-gray-100 bg-white p-3 text-[11px] leading-relaxed text-waify-text-muted dark:border-waify-dark-border dark:bg-waify-dark-surface dark:text-waify-dark-text-muted">
                        Templates require Meta approval before use in campaigns.
                    </div>
                </aside>
            </div>
        </Drawer>
    );
}

function SendTemplateModal({
    template,
    contacts,
    conversations,
    onClose,
}: {
    template: Template | null;
    contacts: ContactOption[];
    conversations: ConversationOption[];
    onClose: () => void;
}) {
    const { toast } = useToast();
    const [recipientType, setRecipientType] = useState<'conversation' | 'contact' | 'manual'>('conversation');
    const [contactSearch, setContactSearch] = useState('');
    const variableNumbers = useMemo(() => {
        if (!template) return [];
        const buttonText = (template.buttons || []).map((button) => `${button.url || ''} ${button.url_example || ''}`).join(' ');
        return variableNumbersFromText(`${template.header_text || ''}\n${template.body_text || ''}\n${buttonText}`);
    }, [template]);
    const { data, setData, post, processing, errors, reset } = useForm({
        to_wa_id: '',
        variables: [] as string[],
    });

    useEffect(() => {
        setData('variables', variableNumbers.map(() => ''));
    }, [template?.id, variableNumbers.length]);

    const filteredContacts = useMemo(() => {
        const search = contactSearch.trim().toLowerCase();
        if (!search) return contacts.slice(0, 60);
        return contacts.filter((contact) => `${contact.name || ''} ${contact.wa_id}`.toLowerCase().includes(search)).slice(0, 60);
    }, [contactSearch, contacts]);

    const previewBody = useMemo(() => {
        if (!template) return '';
        let body = [template.header_text, template.body_text, template.footer_text].filter(Boolean).join('\n\n');
        variableNumbers.forEach((variableNumber, index) => {
            body = body.replaceAll(`{{${variableNumber}}}`, data.variables[index] || `{{${variableNumber}}}`);
        });
        return body;
    }, [data.variables, template, variableNumbers]);

    const close = () => {
        reset();
        setRecipientType('conversation');
        setContactSearch('');
        onClose();
    };

    const submit = (event: FormEvent) => {
        event.preventDefault();
        if (!template) return;
        post(route('app.whatsapp.templates.send.store', { template: template.slug }) as string, {
            preserveScroll: true,
            onSuccess: () => {
                toast.success('Template sent');
                close();
            },
            onError: () => toast.error('Failed to send template'),
        });
    };

    return (
        <Modal open={Boolean(template)} onClose={close} title={template ? `Use ${template.name}` : 'Use template'} description="Send an approved template without leaving the template library." className="max-w-5xl">
            {template && (
                <form onSubmit={submit} className="grid min-w-0 gap-5 lg:grid-cols-[minmax(0,1fr)_320px]">
                    <div className="min-w-0 space-y-4">
                        {template.status.toLowerCase() !== 'approved' && (
                            <div className="rounded-card border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-200">
                                Only approved templates can be sent through Meta.
                            </div>
                        )}
                        <div className="rounded-card border border-gray-100 bg-white p-4 dark:border-waify-dark-border dark:bg-waify-dark-surface">
                            <p className="text-xs font-semibold uppercase tracking-wide text-waify-text-muted dark:text-waify-dark-text-muted">Recipient</p>
                            <div className="mt-3 grid gap-2 sm:grid-cols-3">
                                {[
                                    ['conversation', 'Conversation', MessageSquareText],
                                    ['contact', 'Contact', User],
                                    ['manual', 'Manual', Phone],
                                ].map(([value, label, Icon]) => (
                                    <button
                                        key={value as string}
                                        type="button"
                                        onClick={() => {
                                            setRecipientType(value as 'conversation' | 'contact' | 'manual');
                                            setData('to_wa_id', '');
                                        }}
                                        className={`flex items-center justify-center gap-2 rounded-btn border px-3 py-2 text-sm font-medium transition ${recipientType === value ? 'border-waify-green bg-waify-green/10 text-waify-green-dark dark:text-emerald-300' : 'border-gray-200 text-waify-text-muted hover:text-waify-text dark:border-waify-dark-border dark:text-waify-dark-text-muted dark:hover:text-waify-dark-text'}`}
                                    >
                                        <Icon className="h-4 w-4" />
                                        {label as string}
                                    </button>
                                ))}
                            </div>
                            {recipientType === 'conversation' && (
                                <select value={data.to_wa_id} onChange={(event) => setData('to_wa_id', event.target.value)} className="mt-3 h-10 w-full rounded-btn border border-gray-200 bg-white px-3 text-sm text-waify-text outline-none focus:border-waify-green focus:ring-2 focus:ring-waify-green/20 dark:border-waify-dark-border dark:bg-waify-dark-surface-2 dark:text-waify-dark-text">
                                    <option value="">Select conversation...</option>
                                    {conversations.map((conversation) => (
                                        <option key={conversation.id} value={conversation.contact.wa_id}>{conversation.contact.name || conversation.contact.wa_id} ({conversation.contact.wa_id})</option>
                                    ))}
                                </select>
                            )}
                            {recipientType === 'contact' && (
                                <div className="mt-3 space-y-2">
                                    <TextInput value={contactSearch} onChange={(event) => setContactSearch(event.target.value)} placeholder="Search contacts..." className="w-full" />
                                    <select value={data.to_wa_id} onChange={(event) => setData('to_wa_id', event.target.value)} className="h-10 w-full rounded-btn border border-gray-200 bg-white px-3 text-sm text-waify-text outline-none focus:border-waify-green focus:ring-2 focus:ring-waify-green/20 dark:border-waify-dark-border dark:bg-waify-dark-surface-2 dark:text-waify-dark-text">
                                        <option value="">Select contact...</option>
                                        {filteredContacts.map((contact) => (
                                            <option key={contact.id} value={contact.wa_id}>{contact.name || contact.wa_id} ({contact.wa_id})</option>
                                        ))}
                                    </select>
                                </div>
                            )}
                            {recipientType === 'manual' && (
                                <TextInput value={data.to_wa_id} onChange={(event) => setData('to_wa_id', event.target.value)} placeholder="Enter WhatsApp number with country code" className="mt-3 w-full" />
                            )}
                            {errors.to_wa_id && <p className="mt-2 text-xs text-red-600 dark:text-red-300">{errors.to_wa_id}</p>}
                        </div>
                        {variableNumbers.length > 0 && (
                            <div className="rounded-card border border-gray-100 bg-white p-4 dark:border-waify-dark-border dark:bg-waify-dark-surface">
                                <p className="text-xs font-semibold uppercase tracking-wide text-waify-text-muted dark:text-waify-dark-text-muted">Variables</p>
                                <div className="mt-3 grid gap-3 sm:grid-cols-2">
                                    {variableNumbers.map((variableNumber, index) => (
                                        <TextInput key={variableNumber} value={data.variables[index] || ''} onChange={(event) => {
                                            const next = [...data.variables];
                                            next[index] = event.target.value;
                                            setData('variables', next);
                                        }} placeholder={`Value for {{${variableNumber}}}`} className="w-full" />
                                    ))}
                                </div>
                                {errors.variables && <p className="mt-2 text-xs text-red-600 dark:text-red-300">{errors.variables}</p>}
                            </div>
                        )}
                        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                            <Button type="button" variant="secondary" onClick={close}>Cancel</Button>
                            <Button type="submit" disabled={processing || template.status.toLowerCase() !== 'approved'}>
                                <Send className="h-4 w-4" />
                                {processing ? 'Sending...' : 'Send template'}
                            </Button>
                        </div>
                    </div>
                    <div className="space-y-3">
                        <TemplatePhonePreview template={template} />
                        <div className="rounded-card border border-gray-100 bg-gray-50 p-3 dark:border-waify-dark-border dark:bg-waify-dark-surface-2">
                            <p className="text-xs font-semibold uppercase tracking-wide text-waify-text-muted dark:text-waify-dark-text-muted">Personalized preview</p>
                            <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-waify-text dark:text-waify-dark-text">{previewBody || 'No preview content.'}</p>
                        </div>
                    </div>
                </form>
            )}
        </Modal>
    );
}

export default function TemplatesIndex({
    account,
    templates,
    connections,
    filters,
    contacts,
    conversations,
    selected_template,
    sync_report,
    library_templates = []}: {
    account: any;
    templates: {
        data: Template[];
        links: any;
        meta: any;
    };
    connections: Array<{ id: number; name: string; last_synced_at?: string | null; last_sync_error?: string | null }>;
    filters: Filters;
    contacts: ContactOption[];
    conversations: ConversationOption[];
    selected_template?: Template | null;
    library_templates?: LibraryTemplate[];
    sync_report?: {
        total: number;
        created: number;
        updated: number;
        errors_count: number;
        errors?: Array<{ template: string; error: string }>;
    } | null;
}) {
    const { toast } = useToast();
    const confirm = useConfirm();
    const [localFilters, setLocalFilters] = useState<Filters>(filters);
    const [showFilters, setShowFilters] = useState(false);
    const [showSyncReport, setShowSyncReport] = useState(Boolean(sync_report));
    const [copied, setCopied] = useState<string | null>(null);
    const [archiving, setArchiving] = useState<string | null>(null);
    const [deleting, setDeleting] = useState<string | null>(null);
    const [builderTemplate, setBuilderTemplate] = useState<Template | null>(null);
    const [builderOpen, setBuilderOpen] = useState(false);
    const [libraryOpen, setLibraryOpen] = useState(false);
    const [librarySearch, setLibrarySearch] = useState('');
    const [viewTemplate, setViewTemplate] = useState<Template | null>(null);
    const [sendTemplate, setSendTemplate] = useState<Template | null>(null);
    const hasSyncReport = Boolean(sync_report || connections.some((connection) => connection.last_synced_at || connection.last_sync_error));

    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const sendSlug = params.get('use_template');
        const templateSlug = params.get('template');
        const panel = params.get('panel');

        if (panel === 'create' && !builderOpen) {
            setBuilderTemplate(null);
            setBuilderOpen(true);
            return;
        }
        if (panel === 'library' && !libraryOpen) {
            setLibraryOpen(true);
        }

        const matchSlug = sendSlug || templateSlug;
        if (!matchSlug) return;

        const match = selected_template || templates.data.find((template) => template.slug === matchSlug);
        if (!match) return;

        if ((panel === 'send' || sendSlug) && !sendTemplate) {
            setSendTemplate(match);
        } else if (panel === 'edit' && !builderOpen) {
            setBuilderTemplate(match);
            setBuilderOpen(true);
        } else if (!viewTemplate) {
            setViewTemplate(match);
        }
    }, [selected_template, sendTemplate, templates.data, builderOpen, libraryOpen, viewTemplate]);

    const filteredLibraryTemplates = useMemo(() => {
        const search = librarySearch.trim().toLowerCase();
        if (!search) return library_templates;

        return library_templates.filter((template) => [
            template.title,
            template.name,
            template.category,
            template.body_text,
            template.use_case,
        ].join(' ').toLowerCase().includes(search));
    }, [library_templates, librarySearch]);

    const applyLibraryTemplate = (preset: LibraryTemplate) => {
        setBuilderTemplate({
            id: 0,
            slug: `library-${preset.id}`,
            name: preset.name,
            language: preset.language,
            category: preset.category,
            status: 'draft',
            body_text: preset.body_text,
            header_type: preset.header_type || 'NONE',
            header_text: preset.header_text || null,
            header_media_url: null,
            footer_text: preset.footer_text || null,
            buttons: preset.buttons || [],
            has_buttons: Boolean(preset.buttons?.length),
            variable_count: variableNumbersFromText(preset.body_text).length,
            connection: { id: connections[0]?.id || 0, name: connections[0]?.name || 'Zyptos Business' },
            last_synced_at: null,
        });
        setLibraryOpen(false);
        setBuilderOpen(true);
    };

    const applyFilters = () => {
        router.get(route('app.whatsapp.templates.index', {}), localFilters as any, {
            preserveState: true,
            preserveScroll: true});
    };

    const clearFilters = () => {
        const emptyFilters = {
            connection: '',
            status: '',
            category: '',
            language: '',
            search: ''};
        setLocalFilters(emptyFilters);
        router.get(route('app.whatsapp.templates.index', {}), emptyFilters);
    };

    const copyTemplateName = (name: string, language: string) => {
        const fullName = `${name}:${language}`;
        navigator.clipboard.writeText(fullName);
        setCopied(fullName);
        toast.success('Template name copied');
        setTimeout(() => setCopied(null), 2000);
    };

    const syncTemplates = () => {
        router.post(route('app.whatsapp.templates.sync', {}), {
            connection_id: localFilters.connection || connections[0]?.id}, {
            onSuccess: () => {
                toast.success('Templates synced successfully');
                setShowSyncReport(true);
            },
            onError: () => {
                toast.error('Failed to sync templates');
            }});
    };

    const setQuickFilter = (type: 'category' | 'status' | 'all', value = '') => {
        const nextFilters = type === 'all'
            ? { ...localFilters, category: '', status: '' }
            : { ...localFilters, [type]: value };
        setLocalFilters(nextFilters);
        router.get(route('app.whatsapp.templates.index', {}), nextFilters as any, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const handleArchive = async (template: Template) => {
        const confirmed = await confirm({
            title: 'Archive Template',
            message: `Are you sure you want to archive "${template.name}"? You can restore it later.`,
            variant: 'warning'});

        if (!confirmed) return;

        setArchiving(template.slug);
        router.post(
            route('app.whatsapp.templates.archive', {
                template: template.slug}),
            {},
            {
                onSuccess: () => {
                    toast.success('Template archived successfully');
                    router.reload({ only: ['templates'] });
                },
                onError: () => {
                    toast.error('Failed to archive template');
                },
                onFinish: () => setArchiving(null)}
        );
    };

    const handleDelete = async (template: Template) => {
        const confirmed = await confirm({
            title: 'Delete Template',
            message: `Are you sure you want to permanently delete "${template.name}"? This action cannot be undone.`,
            variant: 'danger',
            confirmText: 'Delete'});

        if (!confirmed) return;

        setDeleting(template.slug);
        router.delete(
            route('app.whatsapp.templates.destroy', {
                template: template.slug}),
            {
                onSuccess: () => {
                    toast.success('Template deleted successfully');
                    router.reload({ only: ['templates'] });
                },
                onError: () => {
                    toast.error('Failed to delete template');
                },
                onFinish: () => setDeleting(null)}
        );
    };

    const getStatusBadge = (status: string) => {
        const statusMap: Record<string, { variant: 'success' | 'warning' | 'danger' | 'default' | 'info'; label: string }> = {
            approved: { variant: 'success', label: 'Approved' },
            pending: { variant: 'warning', label: 'Pending' },
            rejected: { variant: 'danger', label: 'Rejected' },
            paused: { variant: 'default', label: 'Paused' },
            disabled: { variant: 'default', label: 'Disabled' }};

        const config = statusMap[status.toLowerCase()] || { variant: 'default' as const, label: status };
        return <Badge variant={config.variant} className="px-3 py-1">{config.label}</Badge>;
    };

    return (
        <AppShell>
            <Head title="Message Templates" />
            <div className="mx-auto max-w-[1600px] space-y-5 p-0">
                <div className="flex flex-wrap items-end justify-between gap-3">
                    <div>
                        <h1 className="text-xl font-bold text-waify-text dark:text-waify-dark-text">Message Templates</h1>
                        <p className="mt-1 text-sm text-waify-text-muted dark:text-waify-dark-text-muted">Pre-approved WhatsApp templates ready to use in any campaign.</p>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button
                            onClick={syncTemplates}
                            variant="secondary"
                        >
                            <RefreshCw className="h-4 w-4 mr-2" />
                            Sync from Meta
                        </Button>
                        {hasSyncReport && (
                            <Button
                                type="button"
                                onClick={() => setShowSyncReport(true)}
                                variant="secondary"
                            >
                                <Eye className="h-4 w-4 mr-2" />
                                Sync report
                            </Button>
                        )}
                        <Button type="button" variant="secondary" onClick={() => setLibraryOpen(true)}>
                            <Sparkles className="h-4 w-4 mr-2" />
                            Template Library
                        </Button>
                        <Button
                            type="button"
                            onClick={() => {
                                setBuilderTemplate(null);
                                setBuilderOpen(true);
                            }}
                        >
                            <FileText className="h-4 w-4 mr-2" />
                            New Template
                        </Button>
                    </div>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                    {[
                        { id: 'all', label: 'All', type: 'all', value: '' },
                        { id: 'marketing', label: 'Marketing', type: 'category', value: 'MARKETING' },
                        { id: 'utility', label: 'Utility', type: 'category', value: 'UTILITY' },
                        { id: 'authentication', label: 'Authentication', type: 'category', value: 'AUTHENTICATION' },
                        { id: 'approved', label: 'Approved', type: 'status', value: 'approved' },
                        { id: 'pending', label: 'Pending', type: 'status', value: 'pending' },
                        { id: 'rejected', label: 'Rejected', type: 'status', value: 'rejected' },
                    ].map((filter) => {
                        const active = filter.type === 'all'
                            ? !localFilters.category && !localFilters.status
                            : localFilters[filter.type as 'category' | 'status'] === filter.value;
                        return (
                            <button
                                key={filter.id}
                                type="button"
                                onClick={() => setQuickFilter(filter.type as 'category' | 'status' | 'all', filter.value)}
                                className={`h-8 rounded-full px-3 text-xs font-medium transition ${active ? 'bg-waify-text text-white dark:bg-waify-dark-text dark:text-waify-dark-bg' : 'bg-white text-waify-text-muted ring-1 ring-gray-200 hover:text-waify-text dark:bg-slate-900 dark:text-waify-dark-text-muted dark:ring-waify-dark-border dark:hover:text-waify-dark-text'}`}
                            >
                                {filter.label}
                            </button>
                        );
                    })}
                    <button
                        type="button"
                        onClick={() => setShowFilters(!showFilters)}
                        className="ml-auto inline-flex h-8 items-center gap-1 rounded-full bg-white px-3 text-xs font-medium text-waify-text-muted ring-1 ring-gray-200 hover:text-waify-text dark:bg-slate-900 dark:text-waify-dark-text-muted dark:ring-waify-dark-border"
                    >
                        <Filter className="h-3.5 w-3.5" />
                        Advanced
                    </button>
                </div>

                {showFilters && (
                    <Card>
                        <CardContent className="p-4">
                            <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
                                <div>
                                    <label className="mb-2 block text-sm font-semibold text-gray-700 dark:text-gray-300">
                                        Search
                                    </label>
                                    <div className="relative">
                                        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                                        <TextInput
                                            type="text"
                                            value={localFilters.search}
                                            onChange={(e) =>
                                                setLocalFilters({ ...localFilters, search: e.target.value })
                                            }
                                            onKeyDown={(e) => e.key === 'Enter' && applyFilters()}
                                            className="pl-10"
                                            placeholder="Search templates..."
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="mb-2 block text-sm font-semibold text-gray-700 dark:text-gray-300">
                                        Connection
                                    </label>
                                    <select
                                        value={localFilters.connection}
                                        onChange={(e) => setLocalFilters({ ...localFilters, connection: e.target.value })}
                                        className="w-full rounded-btn border-gray-200 px-4 py-2.5 shadow-sm focus:border-waify-green focus:ring-waify-green/20 dark:border-gray-700 dark:bg-gray-800"
                                    >
                                        <option value="">All Connections</option>
                                        {connections.map((conn) => (
                                            <option key={conn.id} value={conn.id.toString()}>
                                                {conn.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="mb-2 block text-sm font-semibold text-gray-700 dark:text-gray-300">
                                        Status
                                    </label>
                                    <select
                                        value={localFilters.status}
                                        onChange={(e) => setLocalFilters({ ...localFilters, status: e.target.value })}
                                        className="w-full rounded-btn border-gray-200 px-4 py-2.5 shadow-sm focus:border-waify-green focus:ring-waify-green/20 dark:border-gray-700 dark:bg-gray-800"
                                    >
                                        <option value="">All Statuses</option>
                                        <option value="approved">Approved</option>
                                        <option value="pending">Pending</option>
                                        <option value="rejected">Rejected</option>
                                        <option value="paused">Paused</option>
                                        <option value="disabled">Disabled</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="mb-2 block text-sm font-semibold text-gray-700 dark:text-gray-300">
                                        Category
                                    </label>
                                    <select
                                        value={localFilters.category}
                                        onChange={(e) => setLocalFilters({ ...localFilters, category: e.target.value })}
                                        className="w-full rounded-btn border-gray-200 px-4 py-2.5 shadow-sm focus:border-waify-green focus:ring-waify-green/20 dark:border-gray-700 dark:bg-gray-800"
                                    >
                                        <option value="">All Categories</option>
                                        <option value="MARKETING">Marketing</option>
                                        <option value="UTILITY">Utility</option>
                                        <option value="AUTHENTICATION">Authentication</option>
                                    </select>
                                </div>
                            </div>
                            <div className="mt-6 flex items-center gap-3">
                                <Button onClick={applyFilters}>
                                    Apply Filters
                                </Button>
                                <Button onClick={clearFilters} variant="secondary">
                                    <X className="h-4 w-4 mr-2" />
                                    Clear
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                )}

                {hasSyncReport && (
                    <Modal
                        open={showSyncReport}
                        onClose={() => setShowSyncReport(false)}
                        title="Sync Status Report"
                        description="Latest sync summary and per-connection status"
                        className="max-w-2xl"
                        footer={
                            <Button type="button" variant="secondary" onClick={() => setShowSyncReport(false)}>
                                Close
                            </Button>
                        }
                    >
                        <div className="space-y-4 text-sm">
                            {sync_report ? (
                                <div className="rounded-card border border-gray-100 bg-gray-50/80 p-4 dark:border-waify-dark-border dark:bg-waify-dark-surface-2/70">
                                    <div className="flex items-start justify-between gap-3">
                                        <div>
                                            <p className="font-semibold text-waify-text dark:text-waify-dark-text">Last run</p>
                                            <p className="mt-1 text-waify-text-muted dark:text-waify-dark-text-muted">
                                                {sync_report.total} total, {sync_report.created} created, {sync_report.updated} updated, {sync_report.errors_count} errors.
                                            </p>
                                        </div>
                                        <Badge variant={sync_report.errors_count > 0 ? 'warning' : 'success'}>
                                            {sync_report.errors_count > 0 ? 'Needs review' : 'Synced'}
                                        </Badge>
                                    </div>
                                    {Array.isArray(sync_report.errors) && sync_report.errors.length > 0 && (
                                        <div className="mt-3 rounded-card border border-red-200 bg-red-50 p-3 dark:border-red-500/30 dark:bg-red-500/10">
                                            <p className="text-xs font-semibold uppercase tracking-wide text-red-700 dark:text-red-200">Errors</p>
                                            <ul className="mt-2 space-y-1 text-xs text-red-700 dark:text-red-200">
                                                {sync_report.errors.map((err, idx) => (
                                                    <li key={idx}>{err.template}: {err.error}</li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div className="rounded-card border border-gray-100 bg-gray-50/80 p-4 text-waify-text-muted dark:border-waify-dark-border dark:bg-waify-dark-surface-2/70 dark:text-waify-dark-text-muted">
                                    No sync run summary is available yet.
                                </div>
                            )}

                            <div className="grid gap-3 md:grid-cols-2">
                                {connections.map((connection) => (
                                    <div key={connection.id} className="rounded-card border border-gray-100 bg-white p-4 shadow-sm dark:border-waify-dark-border dark:bg-waify-dark-surface">
                                        <div className="flex items-start justify-between gap-3">
                                            <div className="min-w-0">
                                                <p className="truncate font-semibold text-waify-text dark:text-waify-dark-text">{connection.name}</p>
                                                <p className="mt-1 text-xs text-waify-text-muted dark:text-waify-dark-text-muted">
                                                    Last sync: {connection.last_synced_at ? new Date(connection.last_synced_at).toLocaleString() : 'Never'}
                                                </p>
                                            </div>
                                            <Badge variant={connection.last_sync_error ? 'danger' : connection.last_synced_at ? 'success' : 'secondary'}>
                                                {connection.last_sync_error ? 'Error' : connection.last_synced_at ? 'Synced' : 'Never'}
                                            </Badge>
                                        </div>
                                        {connection.last_sync_error && (
                                            <p className="mt-3 rounded-md bg-red-50 px-3 py-2 text-xs text-red-700 dark:bg-red-500/10 dark:text-red-200">
                                                Last error: {connection.last_sync_error}
                                            </p>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </Modal>
                )}

                {/* Templates List */}
                {templates.data.length === 0 ? (
                    <Card className="border-0 shadow-xl">
                        <CardContent className="py-16">
                            <EmptyState
                                icon={FileText}
                                title="No templates found"
                                description="Sync templates from Meta to import your WhatsApp message templates."
                                action={
                                    <Button onClick={syncTemplates}>
                                        <RefreshCw className="h-4 w-4 mr-2" />
                                        Sync Templates
                                    </Button>
                                }
                            />
                        </CardContent>
                    </Card>
                ) : (
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                        {templates.data.map((template) => (
                            <div key={template.id} className="surface group overflow-hidden rounded-card border border-transparent bg-white shadow-card transition-all hover:shadow-card-lg dark:border-slate-700/80 dark:bg-slate-800">
                                <div className="relative bg-gradient-to-br from-gray-50 to-gray-100 px-4 pb-3 pt-4 dark:from-slate-800 dark:to-slate-900">
                                    <div className="mb-3 flex items-center justify-between gap-2">
                                        <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-semibold ${categoryTone(template.category)}`}>
                                            <Tag className="h-3 w-3" />
                                            {template.category}
                                        </span>
                                        {getStatusBadge(template.status)}
                                    </div>
                                    <div className="-mb-12 scale-[0.78]">
                                        <TemplatePhonePreview template={template} />
                                    </div>
                                </div>
                                <div className="border-t border-gray-100 px-4 py-4 dark:border-slate-700">
                                    <div className="flex items-start gap-2">
                                        <button
                                            type="button"
                                            onClick={() => setViewTemplate(template)}
                                            className="min-w-0 flex-1 truncate text-left font-mono text-[12px] font-semibold text-waify-text hover:text-waify-green-dark dark:text-waify-dark-text dark:hover:text-waify-green"
                                        >
                                            {template.name}
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => copyTemplateName(template.name, template.language)}
                                            className="rounded-md p-1.5 text-gray-400 transition hover:bg-gray-100 hover:text-waify-text dark:hover:bg-slate-700 dark:hover:text-waify-dark-text"
                                            title="Copy template name"
                                        >
                                            {copied === `${template.name}:${template.language}` ? (
                                                <Check className="h-4 w-4 text-green-600 dark:text-green-400" />
                                            ) : (
                                                <Copy className="h-4 w-4" />
                                            )}
                                        </button>
                                    </div>
                                    <div className="mt-1 flex items-center gap-2 text-xs text-waify-text-muted dark:text-waify-dark-text-muted">
                                        <Globe className="h-3.5 w-3.5" />
                                        <span>{template.language}</span>
                                        <span>·</span>
                                        <span>{template.has_buttons ? 'Buttons' : 'No buttons'}</span>
                                        {template.variable_count > 0 && (
                                            <>
                                                <span>·</span>
                                                <span>{template.variable_count} vars</span>
                                            </>
                                        )}
                                    </div>
                                    <p className="mt-2 line-clamp-2 min-h-[34px] text-xs leading-relaxed text-waify-text-muted dark:text-waify-dark-text-muted">
                                        {template.body_text || 'No body text available.'}
                                    </p>
                                    {template.status.toLowerCase() === 'rejected' && template.rejection_reason && (
                                        <div className="mt-3 rounded-btn border border-red-100 bg-red-50 p-2 text-xs text-red-700 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-200">
                                            {template.rejection_reason}
                                        </div>
                                    )}
                                    {template.stats && (
                                        <div className="mt-3 grid grid-cols-4 gap-1 text-center text-[10px] text-waify-text-muted dark:text-waify-dark-text-muted">
                                            <span>{template.stats.sent} sent</span>
                                            <span>{template.stats.delivered} del.</span>
                                            <span>{template.stats.read} read</span>
                                            <span>{template.stats.failed} fail</span>
                                        </div>
                                    )}
                                    <div className="mt-3 flex items-center gap-2">
                                        <Button type="button" size="sm" className="flex-1" disabled={template.status.toLowerCase() !== 'approved'} onClick={() => setSendTemplate(template)}>
                                            <Send className="h-3.5 w-3.5" />
                                            Use
                                        </Button>
                                        <Button type="button" size="sm" variant="secondary" className="flex-1" onClick={() => setViewTemplate(template)}>
                                                View
                                        </Button>
                                        <div className="group/menu relative">
                                            <button type="button" className="flex h-8 w-8 items-center justify-center rounded-btn bg-gray-50 text-waify-text-muted transition hover:bg-gray-100 hover:text-waify-text dark:bg-slate-900 dark:text-waify-dark-text-muted dark:hover:bg-slate-700 dark:hover:text-waify-dark-text">
                                                <MoreVertical className="h-4 w-4" />
                                            </button>
                                            <div className="invisible absolute right-0 top-9 z-20 w-36 overflow-hidden rounded-card bg-white py-1 opacity-0 shadow-pop ring-1 ring-gray-100 transition group-hover/menu:visible group-hover/menu:opacity-100 dark:bg-slate-900 dark:ring-slate-700">
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        setBuilderTemplate(template);
                                                        setBuilderOpen(true);
                                                    }}
                                                    className="flex w-full items-center gap-2 px-3 py-2 text-left text-xs text-waify-text hover:bg-gray-50 dark:text-waify-dark-text dark:hover:bg-waify-dark-surface-2"
                                                >
                                                    <Edit className="h-3.5 w-3.5" />
                                                    {template.status.toLowerCase() === 'rejected' ? 'Edit & resubmit' : 'Edit'}
                                                </button>
                                                <button type="button" onClick={() => handleArchive(template)} disabled={archiving === template.slug} className="flex w-full items-center gap-2 px-3 py-2 text-left text-xs text-orange-600 hover:bg-orange-50 disabled:opacity-50 dark:hover:bg-orange-500/10">
                                                    <Archive className="h-3.5 w-3.5" />
                                                    Archive
                                                </button>
                                                <button type="button" onClick={() => handleDelete(template)} disabled={deleting === template.slug} className="flex w-full items-center gap-2 px-3 py-2 text-left text-xs text-red-600 hover:bg-red-50 disabled:opacity-50 dark:hover:bg-red-500/10">
                                                    <Trash2 className="h-3.5 w-3.5" />
                                                    Delete
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                <Modal
                    open={libraryOpen}
                    onClose={() => setLibraryOpen(false)}
                    title="Template Library"
                    description="Start from a pre-approved structure and submit it from the same page."
                    className="max-w-6xl"
                >
                    <div className="space-y-4">
                        <div className="relative">
                            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-waify-text-muted dark:text-waify-dark-text-muted" />
                            <TextInput
                                value={librarySearch}
                                onChange={(event) => setLibrarySearch(event.target.value)}
                                placeholder="Search use case, category, or content"
                                className="h-11 rounded-btn border-gray-200 pl-9 dark:border-waify-dark-border dark:bg-waify-dark-surface-2"
                            />
                        </div>
                        <div className="grid max-h-[68vh] gap-3 overflow-y-auto pr-1 md:grid-cols-2">
                            {filteredLibraryTemplates.map((preset) => (
                                <Card key={preset.id} className="border-gray-200/80 dark:border-waify-dark-border">
                                    <CardContent className="p-4">
                                        <div className="flex items-start justify-between gap-3">
                                            <div className="min-w-0">
                                                <p className="truncate font-semibold text-waify-text dark:text-waify-dark-text">{preset.title}</p>
                                                <p className="mt-1 text-xs text-waify-text-muted dark:text-waify-dark-text-muted">{preset.use_case}</p>
                                            </div>
                                            <span className={`inline-flex shrink-0 items-center rounded-full px-2.5 py-1 text-[11px] font-semibold ${categoryTone(preset.category)}`}>
                                                {preset.category}
                                            </span>
                                        </div>
                                        <p className="mt-3 line-clamp-3 whitespace-pre-wrap text-sm text-waify-text-muted dark:text-waify-dark-text-muted">{preset.body_text}</p>
                                        <div className="mt-4 flex items-center justify-between gap-3">
                                            <span className="text-xs font-medium text-waify-text-muted dark:text-waify-dark-text-muted">{preset.language}</span>
                                            <Button type="button" size="sm" onClick={() => applyLibraryTemplate(preset)}>
                                                <Plus className="h-3.5 w-3.5" />
                                                Use preset
                                            </Button>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                            {filteredLibraryTemplates.length === 0 && (
                                <div className="rounded-card border border-dashed border-gray-200 p-8 text-center text-sm text-waify-text-muted dark:border-waify-dark-border dark:text-waify-dark-text-muted md:col-span-2">
                                    No presets match this search.
                                </div>
                            )}
                        </div>
                    </div>
                </Modal>

                <TemplateBuilderDrawer
                    key={builderTemplate?.slug ?? 'new-template'}
                    open={builderOpen}
                    onClose={() => setBuilderOpen(false)}
                    template={builderTemplate}
                    connections={connections}
                />

                <Modal
                    open={Boolean(viewTemplate)}
                    onClose={() => setViewTemplate(null)}
                    title={viewTemplate?.name ?? 'Template preview'}
                    description="Review content, status, variables, and buttons without leaving templates."
                    className="max-w-4xl"
                    footer={
                        <div className="flex w-full flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                            <Button type="button" variant="secondary" onClick={() => setViewTemplate(null)}>
                                Close
                            </Button>
                            {viewTemplate && (
                                <Button
                                    type="button"
                                    onClick={() => {
                                        setSendTemplate(viewTemplate);
                                        setViewTemplate(null);
                                    }}
                                    disabled={viewTemplate.status.toLowerCase() !== 'approved'}
                                >
                                    <Send className="h-4 w-4" />
                                    Use template
                                </Button>
                            )}
                        </div>
                    }
                >
                    {viewTemplate && (
                        <div className="grid gap-5 lg:grid-cols-[320px_1fr]">
                            <TemplatePhonePreview template={viewTemplate} />
                            <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-3">
                                    <div className="rounded-card border border-gray-100 bg-gray-50 p-3 dark:border-waify-dark-border dark:bg-waify-dark-surface-2">
                                        <p className="text-[11px] font-semibold uppercase tracking-wide text-waify-text-muted dark:text-waify-dark-text-muted">Status</p>
                                        <div className="mt-2">{getStatusBadge(viewTemplate.status)}</div>
                                    </div>
                                    <div className="rounded-card border border-gray-100 bg-gray-50 p-3 dark:border-waify-dark-border dark:bg-waify-dark-surface-2">
                                        <p className="text-[11px] font-semibold uppercase tracking-wide text-waify-text-muted dark:text-waify-dark-text-muted">Language</p>
                                        <p className="mt-2 flex items-center gap-2 text-sm font-semibold text-waify-text dark:text-waify-dark-text">
                                            <Globe className="h-4 w-4 text-waify-green" />
                                            {viewTemplate.language}
                                        </p>
                                    </div>
                                    <div className="rounded-card border border-gray-100 bg-gray-50 p-3 dark:border-waify-dark-border dark:bg-waify-dark-surface-2">
                                        <p className="text-[11px] font-semibold uppercase tracking-wide text-waify-text-muted dark:text-waify-dark-text-muted">Category</p>
                                        <span className={`mt-2 inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-semibold ${categoryTone(viewTemplate.category)}`}>
                                            <Tag className="h-3 w-3" />
                                            {viewTemplate.category}
                                        </span>
                                    </div>
                                    <div className="rounded-card border border-gray-100 bg-gray-50 p-3 dark:border-waify-dark-border dark:bg-waify-dark-surface-2">
                                        <p className="text-[11px] font-semibold uppercase tracking-wide text-waify-text-muted dark:text-waify-dark-text-muted">Variables</p>
                                        <p className="mt-2 text-sm font-semibold text-waify-text dark:text-waify-dark-text">{viewTemplate.variable_count}</p>
                                    </div>
                                </div>
                                <div className="rounded-card border border-gray-100 bg-white p-4 dark:border-waify-dark-border dark:bg-waify-dark-surface">
                                    <p className="text-[11px] font-semibold uppercase tracking-wide text-waify-text-muted dark:text-waify-dark-text-muted">Body</p>
                                    <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-waify-text dark:text-waify-dark-text">
                                        {viewTemplate.body_text || 'No body content available.'}
                                    </p>
                                </div>
                                {viewTemplate.status.toLowerCase() === 'rejected' && viewTemplate.rejection_reason && (
                                    <div className="rounded-card border border-red-100 bg-red-50 p-4 text-sm text-red-800 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-100">
                                        <p className="text-[11px] font-semibold uppercase tracking-wide">Rejection reason</p>
                                        <p className="mt-2">{viewTemplate.rejection_reason}</p>
                                    </div>
                                )}
                                {viewTemplate.stats && (
                                    <div className="grid grid-cols-4 gap-3">
                                        {Object.entries(viewTemplate.stats).map(([label, value]) => (
                                            <div key={label} className="rounded-card border border-gray-100 bg-gray-50 p-3 text-center dark:border-waify-dark-border dark:bg-waify-dark-surface-2">
                                                <p className="text-lg font-bold text-waify-text dark:text-waify-dark-text">{value}</p>
                                                <p className="text-[11px] uppercase tracking-wide text-waify-text-muted dark:text-waify-dark-text-muted">{label}</p>
                                            </div>
                                        ))}
                                    </div>
                                )}
                                {viewTemplate.footer_text && (
                                    <div className="rounded-card border border-gray-100 bg-white p-4 dark:border-waify-dark-border dark:bg-waify-dark-surface">
                                        <p className="text-[11px] font-semibold uppercase tracking-wide text-waify-text-muted dark:text-waify-dark-text-muted">Footer</p>
                                        <p className="mt-2 text-sm text-waify-text dark:text-waify-dark-text">{viewTemplate.footer_text}</p>
                                    </div>
                                )}
                                {viewTemplate.buttons?.length > 0 && (
                                    <div className="rounded-card border border-gray-100 bg-white p-4 dark:border-waify-dark-border dark:bg-waify-dark-surface">
                                        <p className="text-[11px] font-semibold uppercase tracking-wide text-waify-text-muted dark:text-waify-dark-text-muted">Buttons</p>
                                        <div className="mt-3 flex flex-wrap gap-2">
                                            {viewTemplate.buttons.map((button, index) => (
                                                <span key={`${button.text}-${index}`} className="inline-flex items-center gap-2 rounded-full border border-gray-200 px-3 py-1.5 text-xs font-semibold text-waify-text dark:border-waify-dark-border dark:text-waify-dark-text">
                                                    {button.type === 'URL' ? <ExternalLink className="h-3.5 w-3.5" /> : button.type === 'PHONE_NUMBER' ? <Phone className="h-3.5 w-3.5" /> : <Reply className="h-3.5 w-3.5" />}
                                                    {button.text}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </Modal>

                <SendTemplateModal
                    template={sendTemplate}
                    contacts={contacts}
                    conversations={conversations}
                    onClose={() => setSendTemplate(null)}
                />
            </div>
        </AppShell>
    );
}
