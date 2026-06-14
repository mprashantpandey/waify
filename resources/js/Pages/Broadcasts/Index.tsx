import { Head, Link, router, useForm } from '@inertiajs/react';
import { useEffect, useMemo, useState } from 'react';
import {
    BarChart3,
    Calendar,
    CheckCircle2,
    Clock,
    Copy,
    Download,
    Megaphone,
    MoreVertical,
    Pause,
    Play,
    Plus,
    RotateCcw,
    Search,
    Send,
    Trash2,
    Users,
    XCircle,
} from 'lucide-react';
import AppShell from '@/Layouts/AppShell';
import { Badge } from '@/Components/UI/Badge';
import Button from '@/Components/UI/Button';
import { Card, CardContent } from '@/Components/UI/Card';
import { EmptyState } from '@/Components/UI/EmptyState';
import { Drawer, IconButton, ThemedIconTile } from '@/Components/UI/Elements';
import { Progress } from '@/Components/UI/Progress';
import TextInput from '@/Components/TextInput';
import InputError from '@/Components/InputError';
import { useConfirm } from '@/hooks/useConfirm';

interface Campaign {
    id: number;
    slug: string;
    name: string;
    description: string | null;
    status: string;
    type: string;
    total_recipients: number;
    sent_count: number;
    delivered_count: number;
    read_count: number;
    failed_count: number;
    completion_percentage: number;
    scheduled_at: string | null;
    started_at: string | null;
    completed_at: string | null;
    connection: { id: number; name: string } | null;
    template: { id: number; name: string } | null;
    created_by: { id: number; name: string } | null;
    created_at: string;
}

function paginationLabel(label: unknown) {
    return String(label ?? '')
        .replace(/&laquo;\s*/g, 'Previous')
        .replace(/\s*&raquo;/g, 'Next')
        .replace(/&amp;/g, '&')
        .replace(/<[^>]*>/g, '')
        .trim();
}

interface CampaignDetail extends Campaign {
    recipient_type: string;
    message_text: string | null;
    media_url: string | null;
    media_type: string | null;
    template_params: Record<string, unknown> | unknown[];
    send_delay_seconds: number;
    respect_opt_out: boolean;
    dry_run: boolean;
    recipient_sample_size: number;
    tracking?: {
        source?: string | null;
        ctwa_ad_id?: string | null;
        ctwa_post_id?: string | null;
        utm_source?: string | null;
        utm_medium?: string | null;
        utm_campaign?: string | null;
        ab_test_enabled?: boolean;
        ab_variant?: string | null;
        retargeting_basis?: string | null;
    };
    connection: { id: number; name: string; phone_number_id?: string | null } | null;
    template: { id: number; name: string; language?: string | null; category?: string | null; body_text?: string | null } | null;
    stats: {
        total_recipients: number;
        sent_count: number;
        delivered_count: number;
        read_count: number;
        failed_count: number;
        pending_count: number;
        completion_percentage: number;
        delivery_rate: number;
        read_rate: number;
    };
    recipients: Array<{
        id: number;
        name: string | null;
        phone_number: string | null;
        status: string;
        sent_at: string | null;
        delivered_at: string | null;
        read_at: string | null;
        failed_at: string | null;
        failure_reason: string | null;
        message_id: string | null;
        timeline?: Array<{ label: string; at: string | null; status: string }>;
    }>;
    diagnostics?: {
        preflight?: { ok?: boolean; errors?: string[]; warnings?: string[] };
        queue?: {
            pending_recipients: number;
            sending_recipients: number;
            failed_recipients: number;
            oldest_pending_at: string | null;
        };
        connection_backoff_until?: string | null;
    };
    testTargetPhone?: string | null;
}

interface CreateOptions {
    connections: Array<{ id: number; name: string; phone_number_id?: string | null }>;
    templates: Array<{ id: number; name: string; language: string; category: string; body_text?: string | null; connection_id?: number | null }>;
    contactsCount: number;
    contacts: Array<{ id: number; name: string | null; wa_id: string; phone: string | null; status: string }>;
    segments: Array<{ id: number; name: string; contact_count?: number | null }>;
}

function formatNumber(value: number | string | null | undefined) {
    const numeric = Number(value ?? 0);
    return Number.isFinite(numeric) ? new Intl.NumberFormat('en-IN').format(numeric) : '0';
}

function clampRate(value: number) {
    return Math.max(0, Math.min(100, Math.round(Number.isFinite(value) ? value : 0)));
}

function formatDate(date: string | null) {
    if (!date) return 'Not scheduled';
    const parsed = new Date(date);
    if (Number.isNaN(parsed.getTime())) return date;
    return parsed.toLocaleString('en-IN', {
        day: 'numeric',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit',
    });
}

function campaignStatus(status: string): { variant: 'success' | 'warning' | 'danger' | 'default' | 'info'; label: string; icon: typeof Clock } {
    const statusMap: Record<string, { variant: 'success' | 'warning' | 'danger' | 'default' | 'info'; label: string; icon: typeof Clock }> = {
        draft: { variant: 'default', label: 'Draft', icon: Clock },
        scheduled: { variant: 'info', label: 'Scheduled', icon: Clock },
        sending: { variant: 'info', label: 'Sending', icon: Play },
        paused: { variant: 'warning', label: 'Paused', icon: Pause },
        completed: { variant: 'success', label: 'Completed', icon: CheckCircle2 },
        cancelled: { variant: 'danger', label: 'Cancelled', icon: XCircle },
    };

    return statusMap[status] || { variant: 'default', label: status, icon: Clock };
}

function CampaignCard({ campaign }: { campaign: Campaign }) {
    const confirm = useConfirm();
    const [menuOpen, setMenuOpen] = useState(false);
    const status = campaignStatus(campaign.status);
    const StatusIcon = status.icon;
    const totalRecipients = Math.max(0, Number(campaign.total_recipients || 0));
    const sentCount = Math.max(0, Number(campaign.sent_count || 0));
    const deliveredCount = Math.min(totalRecipients, Math.max(0, Number(campaign.delivered_count || 0)));
    const readCount = Math.min(deliveredCount, Math.max(0, Number(campaign.read_count || 0)));
    const failedCount = Math.max(0, Number(campaign.failed_count || 0));
    const readRate = deliveredCount > 0 ? clampRate((readCount / deliveredCount) * 100) : 0;
    const deliveryRate = totalRecipients > 0 ? clampRate((deliveredCount / totalRecipients) * 100) : 0;
    const processed = Math.min(totalRecipients, sentCount + failedCount);
    const processedRate = totalRecipients > 0 ? clampRate((processed / totalRecipients) * 100) : 0;
    const date = campaign.scheduled_at || campaign.completed_at || campaign.started_at || campaign.created_at;
    const canStart = ['draft', 'scheduled', 'paused'].includes(campaign.status) && campaign.total_recipients > 0;
    const canPause = campaign.status === 'sending';
    const canCancel = ['draft', 'scheduled', 'sending', 'paused'].includes(campaign.status);
    const canDelete = ['draft', 'cancelled', 'completed'].includes(campaign.status);
    const canRetry = failedCount > 0 && ['sending', 'completed', 'paused', 'cancelled'].includes(campaign.status);

    const postAction = (routeName: string) => {
        setMenuOpen(false);
        router.post(route(routeName, { campaign: campaign.slug }), {}, {
            preserveScroll: true,
        });
    };

    const duplicate = () => postAction('app.broadcasts.duplicate');

    const deleteCampaign = async () => {
        setMenuOpen(false);
        const confirmed = await confirm({
            title: 'Move campaign to recovery bin',
            message: `Move "${campaign.name}" to the recovery bin?`,
            confirmText: 'Move campaign',
            variant: 'danger',
        });
        if (!confirmed) return;

        router.delete(route('app.broadcasts.destroy', { campaign: campaign.slug }), {
            preserveScroll: true,
        });
    };

    const cancelCampaign = async () => {
        setMenuOpen(false);
        const confirmed = await confirm({
            title: 'Cancel campaign',
            message: `Cancel "${campaign.name}"? Queued sends for this campaign will stop.`,
            confirmText: 'Cancel campaign',
            variant: 'warning',
        });
        if (!confirmed) return;

        router.post(route('app.broadcasts.cancel', { campaign: campaign.slug }), {}, {
            preserveScroll: true,
        });
    };

    const menuItemClass = 'flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-sm font-medium text-waify-text transition hover:bg-gray-100 dark:text-waify-dark-text dark:hover:bg-waify-dark-surface-2 disabled:cursor-not-allowed disabled:opacity-45';
    const dangerMenuItemClass = 'flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-sm font-medium text-red-600 transition hover:bg-red-50 dark:text-red-300 dark:hover:bg-red-500/10 disabled:cursor-not-allowed disabled:opacity-45';

    return (
        <Card className="group border-transparent transition-all hover:-translate-y-0.5 hover:shadow-card-lg dark:border-slate-700/80">
            <CardContent className="p-5">
                <div className="mb-3 flex items-start justify-between gap-3">
                    <div className="flex min-w-0 items-center gap-2">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-waify-green-soft text-waify-green-dark dark:bg-waify-dark-green-soft dark:text-emerald-200">
                            <Megaphone className="h-4 w-4" />
                        </div>
                        <div className="min-w-0">
                            <p className="text-[11px] font-semibold uppercase tracking-wide text-waify-text-muted dark:text-waify-dark-text-muted">WhatsApp · {campaign.type}</p>
                            <Link href={route('app.broadcasts.index', { campaign: campaign.slug })} className="line-clamp-2 min-h-10 font-semibold leading-snug text-waify-text hover:text-waify-green-dark dark:text-waify-dark-text dark:hover:text-emerald-300">
                                {campaign.name}
                            </Link>
                        </div>
                    </div>
                    <Badge variant={status.variant} className="gap-1">
                        <StatusIcon className="h-3 w-3" />
                        {status.label}
                    </Badge>
                </div>

                {campaign.description && <p className="mb-3 line-clamp-2 text-sm text-waify-text-muted dark:text-waify-dark-text-muted">{campaign.description}</p>}

                <div className="flex flex-wrap items-center gap-x-3 gap-y-2 text-xs text-waify-text-muted dark:text-waify-dark-text-muted">
                    <span className="flex items-center gap-1"><Users className="h-3.5 w-3.5" />{formatNumber(campaign.total_recipients)} contacts</span>
                    <span className="flex items-center gap-1"><Calendar className="h-3.5 w-3.5" />{formatDate(date)}</span>
                    {campaign.connection && <span className="truncate">via {campaign.connection.name}</span>}
                </div>

                {campaign.status !== 'draft' && campaign.status !== 'scheduled' ? (
                    <div className="mt-4 space-y-3">
                        <div className={`rounded-lg border p-3 ${failedCount > 0 ? 'border-red-100 bg-red-50 text-red-700 dark:border-red-500/20 dark:bg-red-500/10 dark:text-red-200' : 'border-emerald-100 bg-emerald-50 text-emerald-700 dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-200'}`}>
                            <div className="mb-1.5 flex items-center justify-between text-xs font-semibold">
                                <span>{failedCount > 0 ? `${formatNumber(failedCount)} failed recipient${failedCount === 1 ? '' : 's'}` : 'Sending progress'}</span>
                                <span>{failedCount > 0 ? 'Retry available' : `${processedRate}%`}</span>
                            </div>
                            <Progress value={processedRate} variant={failedCount > 0 ? 'danger' : 'success'} />
                            <div className="mt-2 flex items-center justify-between gap-2 text-[11px]">
                                <span>{formatNumber(processed)} of {formatNumber(campaign.total_recipients)} processed</span>
                                {canRetry && (
                                    <button type="button" onClick={() => postAction('app.broadcasts.retry-failed')} className="font-semibold hover:underline">
                                        Retry failed
                                    </button>
                                )}
                            </div>
                        </div>
                        <div>
                            <div className="mb-1.5 flex items-center justify-between text-xs">
                                <span className="text-waify-text-muted dark:text-waify-dark-text-muted">Delivery rate · audience</span>
                                <span className="font-semibold text-waify-text tabular-nums dark:text-waify-dark-text">{deliveryRate}%</span>
                            </div>
                            <Progress value={deliveryRate} />
                        </div>
                        <div>
                            <div className="mb-1.5 flex items-center justify-between text-xs">
                                <span className="text-waify-text-muted dark:text-waify-dark-text-muted">Read rate · delivered</span>
                                <span className="font-semibold text-waify-text tabular-nums dark:text-waify-dark-text">{readRate}%</span>
                            </div>
                            <Progress value={readRate} variant="success" />
                        </div>
                        <div className="grid grid-cols-3 gap-2 border-t border-gray-100 pt-3 text-xs dark:border-waify-dark-border">
                            <div>
                                <p className="text-waify-text-muted dark:text-waify-dark-text-muted">Sent</p>
                                <p className="font-semibold text-waify-text dark:text-waify-dark-text">{formatNumber(sentCount)}</p>
                            </div>
                            <div>
                                <p className="text-waify-text-muted dark:text-waify-dark-text-muted">Read</p>
                                <p className="font-semibold text-waify-text dark:text-waify-dark-text">{formatNumber(readCount)}</p>
                            </div>
                            <div>
                                <p className="text-waify-text-muted dark:text-waify-dark-text-muted">Failed</p>
                                <p className="font-semibold text-waify-text dark:text-waify-dark-text">{formatNumber(failedCount)}</p>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="mt-4 rounded-md bg-gray-50 px-3 py-2.5 text-xs text-waify-text-muted ring-1 ring-gray-100 dark:bg-waify-dark-surface-2 dark:text-waify-dark-text-muted dark:ring-waify-dark-border">
                        {campaign.status === 'scheduled' ? 'Awaiting scheduled send' : 'Draft, not yet sent'}
                    </div>
                )}

                <div className="mt-4 flex items-center gap-2 border-t border-gray-100 pt-4 dark:border-waify-dark-border">
                    <Link href={route('app.broadcasts.index', { campaign: campaign.slug })} className="flex-1">
                        <Button variant="secondary" size="sm" className="w-full">
                            <BarChart3 className="h-3.5 w-3.5" />
                            Report
                        </Button>
                    </Link>
                    <Button type="button" variant="secondary" size="sm" className="flex-1" onClick={duplicate}>
                        <Copy className="h-3.5 w-3.5" />
                        Duplicate
                    </Button>
                    <div className="relative">
                        <IconButton
                            size="sm"
                            variant="ghost"
                            aria-label="More campaign actions"
                            aria-expanded={menuOpen}
                            onClick={() => setMenuOpen((open) => !open)}
                        >
                            <MoreVertical className="h-4 w-4" />
                        </IconButton>
                        {menuOpen && (
                            <>
                                <button
                                    type="button"
                                    aria-label="Close campaign menu"
                                    className="fixed inset-0 z-30 cursor-default"
                                    onClick={() => setMenuOpen(false)}
                                />
                                <div className="absolute bottom-10 right-0 z-40 w-56 rounded-lg border border-gray-200 bg-white p-1.5 shadow-dropdown dark:border-waify-dark-border dark:bg-waify-dark-surface">
                                    <button type="button" className={menuItemClass} onClick={() => postAction('app.broadcasts.start')} disabled={!canStart}>
                                        <Play className="h-4 w-4" />
                                        Start campaign
                                    </button>
                                    <button type="button" className={menuItemClass} onClick={() => postAction('app.broadcasts.pause')} disabled={!canPause}>
                                        <Pause className="h-4 w-4" />
                                        Pause sending
                                    </button>
                                    <button type="button" className={menuItemClass} onClick={() => postAction('app.broadcasts.retry-failed')} disabled={!canRetry}>
                                        <RotateCcw className="h-4 w-4" />
                                        Retry failed
                                    </button>
                                    <button type="button" className={menuItemClass} onClick={duplicate}>
                                        <Copy className="h-4 w-4" />
                                        Duplicate
                                    </button>
                                    <div className="my-1 border-t border-gray-100 dark:border-waify-dark-border" />
                                    <button type="button" className={dangerMenuItemClass} onClick={cancelCampaign} disabled={!canCancel}>
                                        <XCircle className="h-4 w-4" />
                                        Cancel campaign
                                    </button>
                                    <button type="button" className={dangerMenuItemClass} onClick={deleteCampaign} disabled={!canDelete}>
                                        <Trash2 className="h-4 w-4" />
                                        Delete campaign
                                    </button>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}

function CampaignCreateDrawer({
    open,
    onClose,
    options,
}: {
    open: boolean;
    onClose: () => void;
    options: CreateOptions;
}) {
    const workspaceConnection = options.connections[0] || null;
    const form = useForm({
        name: '',
        description: '',
        type: 'template',
        whatsapp_connection_id: workspaceConnection ? String(workspaceConnection.id) : '',
        whatsapp_template_id: '',
        message_text: '',
        media_url: '',
        media_type: 'image',
        recipient_type: 'contacts',
        recipient_filters: {} as Record<string, any>,
        custom_recipients: [] as Array<{ phone: string; name?: string }>,
        scheduled_at: '',
        send_delay_seconds: 0,
        respect_opt_out: true,
        dry_run: false,
        recipient_sample_size: 0,
        tracking: {
            source: '',
            ctwa_ad_id: '',
            ctwa_post_id: '',
            utm_source: 'facebook',
            utm_medium: 'whatsapp',
            utm_campaign: '',
            ab_test_enabled: false,
            ab_variant: '',
            retargeting_basis: '',
        },
    });
    const [customText, setCustomText] = useState('');

    const selectedTemplate = options.templates.find((template) => String(template.id) === String(form.data.whatsapp_template_id));

    const submit = (event: React.FormEvent) => {
        event.preventDefault();
        const customRecipients = customText
            .split(/\n|,/)
            .map((value) => ({ phone: value.trim() }))
            .filter((item) => item.phone.length > 0);

        form.transform((data) => ({
            ...data,
            whatsapp_template_id: data.type === 'template' ? data.whatsapp_template_id : '',
            message_text: data.type === 'text' ? data.message_text : '',
            media_url: data.type === 'media' ? data.media_url : '',
            custom_recipients: data.recipient_type === 'custom' ? customRecipients : [],
        }));
        form.post(route('app.broadcasts.store', {}), {
            preserveScroll: true,
            onSuccess: onClose,
        });
    };

    return (
        <Drawer
            open={open}
            onClose={onClose}
            title="Create campaign"
            description="Build a focused WhatsApp campaign without leaving the campaigns page."
            className="sm:max-w-3xl"
            footer={
                <div className="flex justify-end gap-2">
                    <Button type="button" variant="secondary" onClick={onClose}>Cancel</Button>
                    <Button type="submit" form="campaign-create-form" disabled={form.processing}>
                        {form.processing ? 'Creating...' : 'Create campaign'}
                    </Button>
                </div>
            }
        >
            <form id="campaign-create-form" onSubmit={submit} className="space-y-5">
                {options.connections.length === 0 && (
                    <div className="rounded-btn border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-100">
                        Connect a WABA account before creating campaigns.
                    </div>
                )}
                <div className="grid gap-4 md:grid-cols-2">
                    <div>
                        <label className="mb-1.5 block text-sm font-medium text-waify-text dark:text-waify-dark-text">Campaign name</label>
                        <TextInput value={form.data.name} onChange={(event) => form.setData('name', event.target.value)} placeholder="Diwali offer follow-up" />
                        <InputError message={form.errors.name} className="mt-2" />
                    </div>
                    <div>
                        <label className="mb-1.5 block text-sm font-medium text-waify-text dark:text-waify-dark-text">Message type</label>
                        <select value={form.data.type} onChange={(event) => form.setData('type', event.target.value)} className="h-10 w-full rounded-btn border border-gray-200 bg-white px-3 text-sm dark:border-waify-dark-border dark:bg-waify-dark-surface dark:text-waify-dark-text">
                            <option value="template">Approved template</option>
                            <option value="text">Session text</option>
                            <option value="media">Media URL</option>
                        </select>
                    </div>
                </div>
                <div>
                    <label className="mb-1.5 block text-sm font-medium text-waify-text dark:text-waify-dark-text">Description</label>
                    <textarea value={form.data.description} onChange={(event) => form.setData('description', event.target.value)} rows={2} className="w-full rounded-btn border border-gray-200 bg-white px-3 py-2 text-sm dark:border-waify-dark-border dark:bg-waify-dark-surface dark:text-waify-dark-text" />
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                    <div>
                        <label className="mb-1.5 block text-sm font-medium text-waify-text dark:text-waify-dark-text">WABA account</label>
                        <select value={form.data.whatsapp_connection_id} onChange={(event) => form.setData('whatsapp_connection_id', event.target.value)} className="h-10 w-full rounded-btn border border-gray-200 bg-white px-3 text-sm dark:border-waify-dark-border dark:bg-waify-dark-surface dark:text-waify-dark-text">
                            {options.connections.map((connection) => <option key={connection.id} value={connection.id}>{connection.name}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="mb-1.5 block text-sm font-medium text-waify-text dark:text-waify-dark-text">Audience</label>
                        <select value={form.data.recipient_type} onChange={(event) => form.setData('recipient_type', event.target.value)} className="h-10 w-full rounded-btn border border-gray-200 bg-white px-3 text-sm dark:border-waify-dark-border dark:bg-waify-dark-surface dark:text-waify-dark-text">
                            <option value="contacts">All eligible contacts ({formatNumber(options.contactsCount)})</option>
                            <option value="custom">Custom phone numbers</option>
                            <option value="segment">Segment</option>
                        </select>
                    </div>
                </div>
                {form.data.recipient_type === 'custom' && (
                    <div>
                        <label className="mb-1.5 block text-sm font-medium text-waify-text dark:text-waify-dark-text">Phone numbers</label>
                        <textarea value={customText} onChange={(event) => setCustomText(event.target.value)} rows={4} placeholder="+919988776655, +919876543210" className="w-full rounded-btn border border-gray-200 bg-white px-3 py-2 text-sm dark:border-waify-dark-border dark:bg-waify-dark-surface dark:text-waify-dark-text" />
                        <InputError message={form.errors.custom_recipients} className="mt-2" />
                    </div>
                )}
                {form.data.recipient_type === 'segment' && (
                    <div>
                        <label className="mb-1.5 block text-sm font-medium text-waify-text dark:text-waify-dark-text">Segment</label>
                        <select
                            value={form.data.recipient_filters.segment_ids?.[0] ?? ''}
                            onChange={(event) => form.setData('recipient_filters', { segment_ids: event.target.value ? [Number(event.target.value)] : [] })}
                            className="h-10 w-full rounded-btn border border-gray-200 bg-white px-3 text-sm dark:border-waify-dark-border dark:bg-waify-dark-surface dark:text-waify-dark-text"
                        >
                            <option value="">Choose segment</option>
                            {options.segments.map((segment) => <option key={segment.id} value={segment.id}>{segment.name}</option>)}
                        </select>
                    </div>
                )}
                {form.data.type === 'template' && (
                    <div>
                        <label className="mb-1.5 block text-sm font-medium text-waify-text dark:text-waify-dark-text">Template</label>
                        <select value={form.data.whatsapp_template_id} onChange={(event) => form.setData('whatsapp_template_id', event.target.value)} className="h-10 w-full rounded-btn border border-gray-200 bg-white px-3 text-sm dark:border-waify-dark-border dark:bg-waify-dark-surface dark:text-waify-dark-text">
                            <option value="">Choose approved template</option>
                            {options.templates.map((template) => <option key={template.id} value={template.id}>{template.name} · {template.language}</option>)}
                        </select>
                        <InputError message={form.errors.whatsapp_template_id} className="mt-2" />
                    </div>
                )}
                {form.data.type === 'text' && (
                    <div>
                        <label className="mb-1.5 block text-sm font-medium text-waify-text dark:text-waify-dark-text">Message</label>
                        <textarea value={form.data.message_text} onChange={(event) => form.setData('message_text', event.target.value)} rows={4} className="w-full rounded-btn border border-gray-200 bg-white px-3 py-2 text-sm dark:border-waify-dark-border dark:bg-waify-dark-surface dark:text-waify-dark-text" />
                        <InputError message={form.errors.message_text} className="mt-2" />
                    </div>
                )}
                {form.data.type === 'media' && (
                    <div className="grid gap-4 md:grid-cols-[160px,1fr]">
                        <select value={form.data.media_type} onChange={(event) => form.setData('media_type', event.target.value)} className="h-10 rounded-btn border border-gray-200 bg-white px-3 text-sm dark:border-waify-dark-border dark:bg-waify-dark-surface dark:text-waify-dark-text">
                            <option value="image">Image</option>
                            <option value="video">Video</option>
                            <option value="document">Document</option>
                            <option value="audio">Audio</option>
                        </select>
                        <TextInput value={form.data.media_url} onChange={(event) => form.setData('media_url', event.target.value)} placeholder="https://example.com/file.jpg" />
                    </div>
                )}
                <div className="grid gap-4 rounded-card border border-gray-100 bg-gray-50 p-4 dark:border-waify-dark-border dark:bg-waify-dark-surface-2 md:grid-cols-2">
                    <div>
                        <label className="mb-1.5 block text-sm font-medium text-waify-text dark:text-waify-dark-text">Schedule send</label>
                        <input
                            type="datetime-local"
                            value={form.data.scheduled_at}
                            onChange={(event) => form.setData('scheduled_at', event.target.value)}
                            className="h-10 w-full rounded-btn border border-gray-200 bg-white px-3 text-sm text-waify-text focus:border-waify-green focus:ring-waify-green/20 dark:border-waify-dark-border dark:bg-waify-dark-surface dark:text-waify-dark-text"
                        />
                        <p className="mt-1 text-xs text-waify-text-muted dark:text-waify-dark-text-muted">Leave blank to keep the campaign as a draft until you start it.</p>
                        <InputError message={form.errors.scheduled_at} className="mt-2" />
                    </div>
                    <div>
                        <label className="mb-1.5 block text-sm font-medium text-waify-text dark:text-waify-dark-text">Send delay / throttle</label>
                        <select
                            value={String(form.data.send_delay_seconds)}
                            onChange={(event) => form.setData('send_delay_seconds', Number(event.target.value))}
                            className="h-10 w-full rounded-btn border border-gray-200 bg-white px-3 text-sm text-waify-text focus:border-waify-green focus:ring-waify-green/20 dark:border-waify-dark-border dark:bg-waify-dark-surface dark:text-waify-dark-text"
                        >
                            <option value="0">Fastest safe send</option>
                            <option value="1">1 second between contacts</option>
                            <option value="2">2 seconds between contacts</option>
                            <option value="5">5 seconds between contacts</option>
                            <option value="10">10 seconds between contacts</option>
                            <option value="30">30 seconds between contacts</option>
                            <option value="60">60 seconds between contacts</option>
                        </select>
                        <p className="mt-1 text-xs text-waify-text-muted dark:text-waify-dark-text-muted">Use slower sends when warming up a number or protecting quality rating.</p>
                        <InputError message={form.errors.send_delay_seconds} className="mt-2" />
                    </div>
                </div>
                <div className="rounded-card border border-gray-100 bg-gray-50 p-4 dark:border-waify-dark-border dark:bg-waify-dark-surface-2">
                    <div className="flex flex-col gap-1">
                        <p className="font-semibold text-waify-text dark:text-waify-dark-text">Acquisition & attribution</p>
                        <p className="text-xs text-waify-text-muted dark:text-waify-dark-text-muted">
                            Tag campaigns from CTWA ads, retargeting lists, or experiments so reporting can connect replies and conversions back to source.
                        </p>
                    </div>
                    <div className="mt-4 grid gap-4 md:grid-cols-2">
                        <div>
                            <label className="mb-1.5 block text-sm font-medium text-waify-text dark:text-waify-dark-text">Source</label>
                            <select
                                value={form.data.tracking.source}
                                onChange={(event) => form.setData('tracking', { ...form.data.tracking, source: event.target.value })}
                                className="h-10 w-full rounded-btn border border-gray-200 bg-white px-3 text-sm text-waify-text focus:border-waify-green focus:ring-waify-green/20 dark:border-waify-dark-border dark:bg-waify-dark-surface dark:text-waify-dark-text"
                            >
                                <option value="">No source tag</option>
                                <option value="ctwa">Click-to-WhatsApp ad</option>
                                <option value="retargeting">Retargeting campaign</option>
                                <option value="organic">Organic WhatsApp</option>
                                <option value="manual">Manual upload</option>
                            </select>
                        </div>
                        <div>
                            <label className="mb-1.5 block text-sm font-medium text-waify-text dark:text-waify-dark-text">Retargeting basis</label>
                            <TextInput
                                value={form.data.tracking.retargeting_basis}
                                onChange={(event) => form.setData('tracking', { ...form.data.tracking, retargeting_basis: event.target.value })}
                                placeholder="Read last campaign, clicked payment, replied support..."
                            />
                        </div>
                        <div>
                            <label className="mb-1.5 block text-sm font-medium text-waify-text dark:text-waify-dark-text">Meta ad ID</label>
                            <TextInput
                                value={form.data.tracking.ctwa_ad_id}
                                onChange={(event) => form.setData('tracking', { ...form.data.tracking, ctwa_ad_id: event.target.value })}
                                placeholder="Optional CTWA ad ID"
                            />
                        </div>
                        <div>
                            <label className="mb-1.5 block text-sm font-medium text-waify-text dark:text-waify-dark-text">Meta post ID</label>
                            <TextInput
                                value={form.data.tracking.ctwa_post_id}
                                onChange={(event) => form.setData('tracking', { ...form.data.tracking, ctwa_post_id: event.target.value })}
                                placeholder="Optional post or creative ID"
                            />
                        </div>
                        <div>
                            <label className="mb-1.5 block text-sm font-medium text-waify-text dark:text-waify-dark-text">UTM source</label>
                            <TextInput
                                value={form.data.tracking.utm_source}
                                onChange={(event) => form.setData('tracking', { ...form.data.tracking, utm_source: event.target.value })}
                                placeholder="facebook"
                            />
                        </div>
                        <div>
                            <label className="mb-1.5 block text-sm font-medium text-waify-text dark:text-waify-dark-text">UTM campaign</label>
                            <TextInput
                                value={form.data.tracking.utm_campaign}
                                onChange={(event) => form.setData('tracking', { ...form.data.tracking, utm_campaign: event.target.value })}
                                placeholder="summer_offer_june"
                            />
                        </div>
                        <label className="flex items-start gap-3 rounded-btn border border-gray-200 bg-white p-3 text-sm dark:border-waify-dark-border dark:bg-waify-dark-surface">
                            <input
                                type="checkbox"
                                checked={Boolean(form.data.tracking.ab_test_enabled)}
                                onChange={(event) => form.setData('tracking', { ...form.data.tracking, ab_test_enabled: event.target.checked })}
                                className="mt-1 h-4 w-4 rounded border-gray-300 text-waify-green focus:ring-waify-green"
                            />
                            <span>
                                <span className="block font-medium text-waify-text dark:text-waify-dark-text">Mark as A/B test variant</span>
                                <span className="text-xs text-waify-text-muted dark:text-waify-dark-text-muted">Use this when sending Template A vs B or creative variants.</span>
                            </span>
                        </label>
                        <div>
                            <label className="mb-1.5 block text-sm font-medium text-waify-text dark:text-waify-dark-text">Variant label</label>
                            <TextInput
                                value={form.data.tracking.ab_variant}
                                onChange={(event) => form.setData('tracking', { ...form.data.tracking, ab_variant: event.target.value })}
                                placeholder="Variant A, Variant B..."
                            />
                        </div>
                    </div>
                </div>
                <div className="rounded-card border border-gray-100 bg-gray-50 p-4 text-sm dark:border-waify-dark-border dark:bg-waify-dark-surface-2">
                    <p className="font-semibold text-waify-text dark:text-waify-dark-text">Preview</p>
                    <p className="mt-2 whitespace-pre-wrap text-waify-text-muted dark:text-waify-dark-text-muted">
                        {form.data.type === 'template' ? (selectedTemplate?.body_text || 'Select a template to preview content.') : form.data.type === 'text' ? (form.data.message_text || 'Write a message.') : (form.data.media_url || 'Add a media URL.')}
                    </p>
                </div>
            </form>
        </Drawer>
    );
}

function CampaignDetailDrawer({
    campaign,
    onClose,
}: {
    campaign: CampaignDetail | null;
    onClose: () => void;
}) {
    const testForm = useForm({
        phone: campaign?.testTargetPhone || '',
    });

    useEffect(() => {
        testForm.setData('phone', campaign?.testTargetPhone || '');
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [campaign?.id]);

    if (!campaign) return null;

    const status = campaignStatus(campaign.status);
    const StatusIcon = status.icon;
    const canStart = ['draft', 'scheduled', 'paused'].includes(campaign.status) && campaign.stats.total_recipients > 0;
    const canPause = campaign.status === 'sending';
    const canCancel = ['draft', 'scheduled', 'sending', 'paused'].includes(campaign.status);
    const canRetry = campaign.stats.failed_count > 0 && ['sending', 'completed', 'paused', 'cancelled'].includes(campaign.status);

    const close = () => {
        onClose();
        router.get(route('app.broadcasts.index', {}), {}, {
            preserveScroll: true,
            preserveState: true,
            replace: true,
        });
    };

    const action = (name: 'start' | 'pause' | 'cancel' | 'retry-failed') => {
        router.post(route(`app.broadcasts.${name}`, { campaign: campaign.slug }), {}, {
            preserveScroll: true,
            only: ['selectedCampaign', 'campaigns', 'flash', 'errors'],
        });
    };

    const sendTest = (event: React.FormEvent) => {
        event.preventDefault();
        testForm.post(route('app.broadcasts.send-test', { campaign: campaign.slug }), {
            preserveScroll: true,
            only: ['selectedCampaign', 'flash', 'errors'],
        });
    };

    const messagePreview = campaign.type === 'template'
        ? (campaign.template?.body_text || 'Template content will be pulled from Meta.')
        : campaign.type === 'media'
            ? (campaign.media_url || 'Media URL not set.')
            : (campaign.message_text || 'Message text not set.');

    return (
        <Drawer
            open={Boolean(campaign)}
            onClose={close}
            title={campaign.name}
            description={`${campaign.type} campaign · ${campaign.recipient_type} audience`}
            className="sm:max-w-5xl"
            footer={
                <div className="flex flex-wrap justify-end gap-2">
                    {canRetry && (
                        <Button type="button" variant="secondary" onClick={() => action('retry-failed')}>
                            Retry failed
                        </Button>
                    )}
                    {canCancel && (
                        <Button type="button" variant="secondary" onClick={() => action('cancel')}>
                            Cancel campaign
                        </Button>
                    )}
                    {canPause && (
                        <Button type="button" variant="warning" onClick={() => action('pause')}>
                            <Pause className="h-4 w-4" />
                            Pause
                        </Button>
                    )}
                    {canStart && (
                        <Button type="button" onClick={() => action('start')}>
                            <Play className="h-4 w-4" />
                            Start
                        </Button>
                    )}
                </div>
            }
        >
            <div className="space-y-5">
                <div className="flex flex-wrap items-center justify-between gap-3 rounded-card border border-gray-100 bg-gray-50 p-4 dark:border-waify-dark-border dark:bg-waify-dark-surface-2">
                    <div className="flex items-center gap-3">
                        <ThemedIconTile tone="green" size="lg">
                            <Megaphone className="h-5 w-5" />
                        </ThemedIconTile>
                        <div>
                            <div className="flex flex-wrap items-center gap-2">
                                <Badge variant={status.variant} className="gap-1">
                                    <StatusIcon className="h-3 w-3" />
                                    {status.label}
                                </Badge>
                                {campaign.dry_run && <Badge variant="warning">Dry run</Badge>}
                            </div>
                            <p className="mt-1 text-sm text-waify-text-muted dark:text-waify-dark-text-muted">
                                {campaign.connection?.name || 'No WABA account'} · Created {formatDate(campaign.created_at)}
                            </p>
                        </div>
                    </div>
                    <form onSubmit={sendTest} className="flex w-full gap-2 sm:w-auto">
                        <TextInput
                            value={testForm.data.phone}
                            onChange={(event) => testForm.setData('phone', event.target.value)}
                            placeholder="+91 test number"
                            className="h-9 min-w-0 flex-1 sm:w-48"
                        />
                        <Button type="submit" variant="secondary" disabled={testForm.processing}>
                            <Send className="h-4 w-4" />
                            Test
                        </Button>
                    </form>
                </div>
                <InputError message={testForm.errors.phone || (testForm.errors as Record<string, string>).error} />

                <div className="grid grid-cols-2 gap-3 lg:grid-cols-5">
                    {([
                        { label: 'Audience', value: campaign.stats.total_recipients, Icon: Users, tone: 'blue' },
                        { label: 'Sent', value: campaign.stats.sent_count, Icon: Send, tone: 'green' },
                        { label: 'Delivered', value: campaign.stats.delivered_count, Icon: CheckCircle2, tone: 'green' },
                        { label: 'Read', value: campaign.stats.read_count, Icon: BarChart3, tone: 'purple' },
                        { label: 'Failed', value: campaign.stats.failed_count, Icon: XCircle, tone: 'red' },
                    ] as const).map(({ label, value, Icon, tone }) => (
                        <Card key={String(label)} className="border-transparent dark:border-slate-700/80">
                            <CardContent className="flex items-center gap-3 p-4">
                                <ThemedIconTile tone={tone} size="sm">
                                    <Icon className="h-4 w-4" />
                                </ThemedIconTile>
                                <div>
                                    <p className="text-xs text-waify-text-muted dark:text-waify-dark-text-muted">{label}</p>
                                    <p className="text-lg font-bold text-waify-text dark:text-waify-dark-text">{formatNumber(value)}</p>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                <div className="grid gap-4 lg:grid-cols-[1fr,360px]">
                    <Card className="border-transparent dark:border-slate-700/80">
                        <CardContent className="p-5">
                            <div className="mb-4 flex items-center justify-between">
                                <div>
                                    <p className="font-semibold text-waify-text dark:text-waify-dark-text">Delivery progress</p>
                                    <p className="text-sm text-waify-text-muted dark:text-waify-dark-text-muted">Live campaign counts from the campaign recipient ledger.</p>
                                </div>
                                <span className="text-sm font-semibold text-waify-text dark:text-waify-dark-text">{Math.round(campaign.stats.completion_percentage)}%</span>
                            </div>
                            <Progress value={campaign.stats.completion_percentage} />
                            <div className="mt-4 grid gap-3 sm:grid-cols-3">
                                <div className="rounded-btn bg-gray-50 p-3 dark:bg-waify-dark-surface-2">
                                    <p className="text-xs text-waify-text-muted dark:text-waify-dark-text-muted">Delivery rate · audience</p>
                                    <p className="text-lg font-semibold text-waify-text dark:text-waify-dark-text">{Math.round(campaign.stats.delivery_rate)}%</p>
                                </div>
                                <div className="rounded-btn bg-gray-50 p-3 dark:bg-waify-dark-surface-2">
                                    <p className="text-xs text-waify-text-muted dark:text-waify-dark-text-muted">Read rate · delivered</p>
                                    <p className="text-lg font-semibold text-waify-text dark:text-waify-dark-text">{Math.round(campaign.stats.read_rate)}%</p>
                                </div>
                                <div className="rounded-btn bg-gray-50 p-3 dark:bg-waify-dark-surface-2">
                                    <p className="text-xs text-waify-text-muted dark:text-waify-dark-text-muted">Pending</p>
                                    <p className="text-lg font-semibold text-waify-text dark:text-waify-dark-text">{formatNumber(campaign.stats.pending_count)}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-transparent dark:border-slate-700/80">
                        <CardContent className="p-5">
                            <p className="font-semibold text-waify-text dark:text-waify-dark-text">Campaign preview</p>
                            <div className="mt-3 rounded-2xl bg-[#e7f7e8] p-3 dark:bg-emerald-500/10">
                                <div className="rounded-2xl rounded-tr-sm bg-white px-3 py-2 text-sm text-waify-text shadow-sm dark:bg-waify-dark-surface dark:text-waify-dark-text">
                                    <p className="whitespace-pre-wrap">{messagePreview}</p>
                                    {campaign.media_url && (
                                        <a href={campaign.media_url} target="_blank" rel="noreferrer" className="mt-2 block truncate text-xs font-semibold text-waify-green-dark dark:text-emerald-300">
                                            {campaign.media_type || 'media'} · {campaign.media_url}
                                        </a>
                                    )}
                                </div>
                            </div>
                            <dl className="mt-4 space-y-2 text-sm">
                                <div className="flex justify-between gap-4">
                                    <dt className="text-waify-text-muted dark:text-waify-dark-text-muted">Template</dt>
                                    <dd className="text-right font-medium text-waify-text dark:text-waify-dark-text">{campaign.template?.name || 'Not used'}</dd>
                                </div>
                                <div className="flex justify-between gap-4">
                                    <dt className="text-waify-text-muted dark:text-waify-dark-text-muted">Scheduled</dt>
                                    <dd className="text-right font-medium text-waify-text dark:text-waify-dark-text">{formatDate(campaign.scheduled_at)}</dd>
                                </div>
                                <div className="flex justify-between gap-4">
                                    <dt className="text-waify-text-muted dark:text-waify-dark-text-muted">Send delay</dt>
                                    <dd className="text-right font-medium text-waify-text dark:text-waify-dark-text">{campaign.send_delay_seconds}s</dd>
                                </div>
                                <div className="flex justify-between gap-4">
                                    <dt className="text-waify-text-muted dark:text-waify-dark-text-muted">Source</dt>
                                    <dd className="text-right font-medium capitalize text-waify-text dark:text-waify-dark-text">{campaign.tracking?.source || 'Not tagged'}</dd>
                                </div>
                                {campaign.tracking?.utm_campaign && (
                                    <div className="flex justify-between gap-4">
                                        <dt className="text-waify-text-muted dark:text-waify-dark-text-muted">UTM campaign</dt>
                                        <dd className="text-right font-medium text-waify-text dark:text-waify-dark-text">{campaign.tracking.utm_campaign}</dd>
                                    </div>
                                )}
                                {campaign.tracking?.ab_test_enabled && (
                                    <div className="flex justify-between gap-4">
                                        <dt className="text-waify-text-muted dark:text-waify-dark-text-muted">A/B variant</dt>
                                        <dd className="text-right font-medium text-waify-text dark:text-waify-dark-text">{campaign.tracking.ab_variant || 'Variant'}</dd>
                                    </div>
                                )}
                            </dl>
                        </CardContent>
                    </Card>
                </div>

                <Card className="border-transparent dark:border-slate-700/80">
                    <CardContent className="p-5">
                        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                            <div>
                                <p className="font-semibold text-waify-text dark:text-waify-dark-text">Delivery diagnostics</p>
                                <p className="mt-1 text-sm text-waify-text-muted dark:text-waify-dark-text-muted">Preflight checks, queue state, and the recipient timeline used by campaign recovery.</p>
                            </div>
                            <Badge variant={campaign.diagnostics?.preflight?.ok === false ? 'danger' : 'success'}>
                                {campaign.diagnostics?.preflight?.ok === false ? 'Needs attention' : 'Preflight ready'}
                            </Badge>
                        </div>
                        <div className="mt-4 grid gap-3 md:grid-cols-4">
                            {[
                                ['Pending', campaign.diagnostics?.queue?.pending_recipients ?? campaign.stats.pending_count],
                                ['Sending', campaign.diagnostics?.queue?.sending_recipients ?? 0],
                                ['Failed', campaign.diagnostics?.queue?.failed_recipients ?? campaign.stats.failed_count],
                                ['Oldest pending', campaign.diagnostics?.queue?.oldest_pending_at ? formatDate(campaign.diagnostics.queue.oldest_pending_at) : '-'],
                            ].map(([label, value]) => (
                                <div key={String(label)} className="rounded-btn bg-gray-50 p-3 dark:bg-waify-dark-surface-2">
                                    <p className="text-xs text-waify-text-muted dark:text-waify-dark-text-muted">{label}</p>
                                    <p className="mt-1 text-sm font-semibold text-waify-text dark:text-waify-dark-text">{value}</p>
                                </div>
                            ))}
                        </div>
                        {campaign.diagnostics?.preflight?.errors?.length ? (
                            <div className="mt-4 rounded-btn border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-500/20 dark:bg-red-500/10 dark:text-red-200">
                                {campaign.diagnostics.preflight.errors.map((error) => <p key={error}>{error}</p>)}
                            </div>
                        ) : null}
                        {campaign.diagnostics?.preflight?.warnings?.length ? (
                            <div className="mt-4 rounded-btn border border-amber-200 bg-amber-50 p-3 text-sm text-amber-700 dark:border-amber-500/20 dark:bg-amber-500/10 dark:text-amber-200">
                                {campaign.diagnostics.preflight.warnings.map((warning) => <p key={warning}>{warning}</p>)}
                            </div>
                        ) : null}
                    </CardContent>
                </Card>

                <Card className="border-transparent dark:border-slate-700/80">
                    <CardContent className="p-0">
                        <div className="border-b border-gray-100 px-5 py-4 dark:border-waify-dark-border">
                            <p className="font-semibold text-waify-text dark:text-waify-dark-text">Recipients</p>
                            <p className="text-sm text-waify-text-muted dark:text-waify-dark-text-muted">Showing latest 100 recipients, with failed and pending first.</p>
                        </div>
                        <div className="max-h-80 overflow-auto">
                            {campaign.recipients.length === 0 ? (
                                <div className="p-6 text-sm text-waify-text-muted dark:text-waify-dark-text-muted">No recipients prepared yet.</div>
                            ) : campaign.recipients.map((recipient) => (
                                <div key={recipient.id} className="grid gap-2 border-b border-gray-100 px-5 py-3 text-sm last:border-0 dark:border-waify-dark-border md:grid-cols-[1fr,150px,120px,1fr]">
                                    <div className="min-w-0">
                                        <p className="truncate font-medium text-waify-text dark:text-waify-dark-text">{recipient.name || recipient.phone_number || 'Unknown recipient'}</p>
                                        <p className="truncate text-xs text-waify-text-muted dark:text-waify-dark-text-muted">{recipient.phone_number || 'No phone'}</p>
                                    </div>
                                    <Badge variant={recipient.status === 'failed' ? 'danger' : recipient.status === 'read' ? 'success' : 'default'} className="w-fit">
                                        {recipient.status}
                                    </Badge>
                                    <span className="text-xs text-waify-text-muted dark:text-waify-dark-text-muted">{formatDate(recipient.sent_at || recipient.failed_at)}</span>
                                    <div className="min-w-0">
                                        <span className="block truncate text-xs text-waify-text-muted dark:text-waify-dark-text-muted">{recipient.failure_reason || recipient.message_id || 'No message event yet'}</span>
                                        {recipient.timeline?.length ? (
                                            <span className="mt-1 block truncate text-[11px] text-waify-text-muted dark:text-waify-dark-text-muted">
                                                {recipient.timeline.map((event) => `${event.label}${event.at ? ` ${formatDate(event.at)}` : ''}`).join(' · ')}
                                            </span>
                                        ) : null}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </Drawer>
    );
}

export default function BroadcastsIndex({
    campaigns,
    filters,
    createOptions,
    selectedCampaign,
}: {
    account: any;
    campaigns: {
        data: Campaign[];
        links: any;
        meta: any;
    };
    filters: { status?: string; search?: string };
    createOptions: CreateOptions;
    selectedCampaign?: CampaignDetail | null;
}) {
    const [search, setSearch] = useState(filters.search || '');
    const [status, setStatus] = useState(filters.status || '');
    const [createOpen, setCreateOpen] = useState(() => new URLSearchParams(window.location.search).get('panel') === 'create');
    const [activeCampaign, setActiveCampaign] = useState<CampaignDetail | null>(selectedCampaign || null);

    useEffect(() => {
        setActiveCampaign(selectedCampaign || null);
    }, [selectedCampaign]);

    const statusCounts = useMemo(() => {
        return campaigns.data.reduce<Record<string, number>>((acc, campaign) => {
            acc[campaign.status] = (acc[campaign.status] || 0) + 1;
            return acc;
        }, {});
    }, [campaigns.data]);

    const totalCampaigns = campaigns.meta?.total ?? campaigns.data.length;
    const totalRecipients = campaigns.data.reduce((sum, campaign) => sum + Number(campaign.total_recipients || 0), 0);
    const totalDelivered = campaigns.data.reduce((sum, campaign) => sum + Number(campaign.delivered_count || 0), 0);
    const totalRead = campaigns.data.reduce((sum, campaign) => sum + Number(campaign.read_count || 0), 0);
    const hasActiveCampaigns = campaigns.data.some((campaign) => ['sending', 'scheduled', 'paused'].includes(campaign.status))
        || Boolean(activeCampaign && ['sending', 'scheduled', 'paused'].includes(activeCampaign.status));

    const activeFilters = useMemo(() => {
        const payload: Record<string, string> = {};
        if (search.trim()) payload.search = search.trim();
        if (status) payload.status = status;
        return payload;
    }, [search, status]);

    const applyFilters = () => {
        router.get(route('app.broadcasts.index', {}), activeFilters, {
            preserveState: true,
            preserveScroll: true,
            replace: true,
        });
    };

    useEffect(() => {
        if (!hasActiveCampaigns) return;

        const timer = window.setInterval(() => {
            router.reload({
                only: ['campaigns', 'selectedCampaign', 'flash', 'errors'],
            });
        }, 4000);

        return () => window.clearInterval(timer);
    }, [hasActiveCampaigns]);

    const tabs = [
        { value: '', label: 'All Campaigns', count: totalCampaigns },
        { value: 'sending', label: 'Active', count: statusCounts.sending || 0 },
        { value: 'scheduled', label: 'Scheduled', count: statusCounts.scheduled || 0 },
        { value: 'completed', label: 'Completed', count: statusCounts.completed || 0 },
        { value: 'draft', label: 'Draft', count: statusCounts.draft || 0 },
    ];

    return (
        <AppShell>
            <Head title="Campaigns" />
            <div className="module-page max-w-[1600px]">
                <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
                    <Card className="border-transparent dark:border-slate-700/80">
                        <CardContent className="flex items-center gap-3 p-4">
                            <ThemedIconTile tone="green">
                                <Megaphone className="h-5 w-5" />
                            </ThemedIconTile>
                            <div>
                                <p className="text-xs text-waify-text-muted dark:text-waify-dark-text-muted">Campaigns</p>
                                <p className="text-xl font-bold text-waify-text dark:text-waify-dark-text">{formatNumber(totalCampaigns)}</p>
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="border-transparent dark:border-slate-700/80">
                        <CardContent className="flex items-center gap-3 p-4">
                            <ThemedIconTile tone="blue">
                                <Users className="h-5 w-5" />
                            </ThemedIconTile>
                            <div>
                                <p className="text-xs text-waify-text-muted dark:text-waify-dark-text-muted">Audience</p>
                                <p className="text-xl font-bold text-waify-text dark:text-waify-dark-text">{formatNumber(totalRecipients)}</p>
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="border-transparent dark:border-slate-700/80">
                        <CardContent className="flex items-center gap-3 p-4">
                            <ThemedIconTile tone="green">
                                <Send className="h-5 w-5" />
                            </ThemedIconTile>
                            <div>
                                <p className="text-xs text-waify-text-muted dark:text-waify-dark-text-muted">Delivered</p>
                                <p className="text-xl font-bold text-waify-text dark:text-waify-dark-text">{formatNumber(totalDelivered)}</p>
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="border-transparent dark:border-slate-700/80">
                        <CardContent className="flex items-center gap-3 p-4">
                            <ThemedIconTile tone="purple">
                                <BarChart3 className="h-5 w-5" />
                            </ThemedIconTile>
                            <div>
                                <p className="text-xs text-waify-text-muted dark:text-waify-dark-text-muted">Read</p>
                                <p className="text-xl font-bold text-waify-text dark:text-waify-dark-text">{formatNumber(totalRead)}</p>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <Card className="overflow-hidden border-transparent dark:border-slate-700/80">
                    <div className="border-b border-gray-100 px-4 pt-4 dark:border-waify-dark-border">
                        <div className="flex gap-1 overflow-x-auto">
                            {tabs.map((tab) => {
                                const active = status === tab.value;
                                return (
                                    <button
                                        key={tab.value || 'all'}
                                        type="button"
                                        onClick={() => {
                                            setStatus(tab.value);
                                            router.get(route('app.broadcasts.index', {}), { ...activeFilters, status: tab.value || undefined }, {
                                                preserveState: true,
                                                preserveScroll: true,
                                                replace: true,
                                            });
                                        }}
                                        className={`relative flex h-10 items-center gap-2 whitespace-nowrap px-3 text-sm font-medium transition ${
                                            active ? 'text-waify-text dark:text-waify-dark-text' : 'text-waify-text-muted hover:text-waify-text dark:text-waify-dark-text-muted dark:hover:text-waify-dark-text'
                                        }`}
                                    >
                                        {tab.label}
                                        <span className={`rounded-full px-1.5 py-0.5 text-[10px] font-semibold ${
                                            active
                                                ? 'bg-waify-green-soft text-waify-green-dark dark:bg-waify-dark-green-soft dark:text-emerald-200'
                                                : 'bg-gray-100 text-gray-500 dark:bg-waify-dark-surface-2 dark:text-waify-dark-text-muted'
                                        }`}>
                                            {formatNumber(tab.count)}
                                        </span>
                                        {active && <span className="absolute bottom-0 left-2 right-2 h-0.5 rounded-full bg-waify-green" />}
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                    <CardContent className="flex flex-col gap-2 p-3 lg:flex-row lg:items-center">
                        <div className="relative min-w-[220px] flex-1">
                            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-waify-text-muted dark:text-waify-dark-text-muted" />
                            <TextInput
                                value={search}
                                onChange={(event) => setSearch(event.target.value)}
                                onKeyDown={(event) => event.key === 'Enter' && applyFilters()}
                                placeholder="Search campaigns..."
                                className="h-9 rounded-btn border-gray-200 pl-10 text-sm focus:border-waify-green focus:ring-waify-green/20 dark:border-waify-dark-border dark:bg-waify-dark-surface-2"
                            />
                        </div>
                        <select
                            value={status}
                            onChange={(event) => setStatus(event.target.value)}
                            className="h-9 rounded-btn border-gray-200 bg-white px-3 text-sm text-waify-text shadow-sm focus:border-waify-green focus:ring-waify-green/20 dark:border-waify-dark-border dark:bg-waify-dark-surface-2 dark:text-waify-dark-text"
                        >
                            <option value="">All statuses</option>
                            <option value="draft">Draft</option>
                            <option value="scheduled">Scheduled</option>
                            <option value="sending">Sending</option>
                            <option value="paused">Paused</option>
                            <option value="completed">Completed</option>
                            <option value="cancelled">Cancelled</option>
                        </select>
                        <Button type="button" variant="secondary" onClick={() => {
                            setSearch('');
                            setStatus('');
                            router.get(route('app.broadcasts.index', {}), {}, {
                                preserveState: true,
                                preserveScroll: true,
                                replace: true,
                            });
                        }}>
                            Reset
                        </Button>
                        <Button type="button" onClick={applyFilters}>Apply</Button>
                        <div className="hidden flex-1 lg:block" />
                        <Button type="button" variant="secondary" disabled>
                            <Download className="h-4 w-4" />
                            Export
                        </Button>
                        <Button type="button" onClick={() => setCreateOpen(true)}>
                            <Plus className="h-4 w-4" />
                            New Campaign
                        </Button>
                    </CardContent>
                </Card>

                {campaigns.data.length === 0 ? (
                    <Card className="border-transparent dark:border-slate-700/80">
                        <CardContent className="py-16 text-center">
                            <EmptyState
                                icon={Megaphone}
                                title="No campaigns yet"
                                description="Create your first WhatsApp campaign to reach a targeted audience."
                                action={
                                    <Button onClick={() => setCreateOpen(true)}>
                                        <Plus className="h-4 w-4" />
                                        Create Campaign
                                    </Button>
                                }
                            />
                        </CardContent>
                    </Card>
                ) : (
                    <>
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
                            {campaigns.data.map((campaign) => (
                                <CampaignCard key={campaign.id} campaign={campaign} />
                            ))}
                        </div>

                        {campaigns.links && campaigns.links.length > 3 && (
                            <div className="flex flex-wrap justify-center gap-1">
                                {campaigns.links.map((link: any, index: number) => (
                                    <button
                                        key={index}
                                        type="button"
                                        onClick={() => link.url && router.visit(link.url)}
                                        disabled={!link.url}
                                        className={`h-8 min-w-8 rounded-md px-2 text-xs font-semibold transition ${
                                            link.active
                                                ? 'bg-waify-text text-white dark:bg-waify-dark-text dark:text-waify-dark-bg'
                                                : 'border border-gray-200 bg-white text-waify-text hover:bg-gray-50 dark:border-waify-dark-border dark:bg-waify-dark-surface dark:text-waify-dark-text dark:hover:bg-waify-dark-surface-2'
                                        } ${!link.url ? 'cursor-not-allowed opacity-45' : ''}`}
                                    >
                                        {paginationLabel(link.label)}
                                    </button>
                                ))}
                            </div>
                        )}
                    </>
                )}
            </div>
            <CampaignCreateDrawer open={createOpen} onClose={() => setCreateOpen(false)} options={createOptions} />
            <CampaignDetailDrawer campaign={activeCampaign} onClose={() => setActiveCampaign(null)} />
        </AppShell>
    );
}
