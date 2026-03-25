import { Link, router, usePage } from '@inertiajs/react';
import AppShell from '@/Layouts/AppShell';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/Components/UI/Card';
import { Badge } from '@/Components/UI/Badge';
import Button from '@/Components/UI/Button';
import { ArrowLeft, Send, AlertCircle, FileText, Globe, Tag, Sparkles, Clock, CheckCircle2, Archive, Trash2, Edit, RefreshCw, Loader2 } from 'lucide-react';
import { Head } from '@inertiajs/react';
import { Alert } from '@/Components/UI/Alert';
import { useConfirm } from '@/hooks/useConfirm';
import { useEffect, useState } from 'react';
import { useRealtime } from '@/Providers/RealtimeProvider';
import { cn } from '@/lib/utils';

interface Template {
    id: number;
    slug: string;
    name: string;
    language: string;
    category: string;
    status: string;
    sync_state?: string;
    is_remote_deleted?: boolean;
    is_stale?: boolean;
    sendability?: {
        ok: boolean;
        reason?: string | null;
        code?: string | null;
    };
    quality_score: string | null;
    body_text: string | null;
    header_type: string | null;
    header_media_url?: string | null;
    header_media_status?: {
        state: 'ready' | 'missing' | 'reupload_required' | 'not_required';
        label: string;
        description?: string | null;
    };
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
    last_synced_at: string | null;
    last_meta_sync_at?: string | null;
    last_meta_error: string | null;
    rejection_reason?: string | null;
    meta_rejection_reason?: string | null;
    meta_template_id?: string | null;
    connection: {
        id: number;
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

export default function TemplatesShow({
    account,
    template,
    recent_sends = []}: {
    account: any;
    template: Template;
    recent_sends?: RecentSend[];
}) {
    const confirm = useConfirm();
    const { support_access: supportAccess = false } = usePage<any>().props;
    const { subscribe } = useRealtime();
    const [liveTemplate, setLiveTemplate] = useState<Template>(template);
    const [actionState, setActionState] = useState<string | null>(null);
    const [highlightedSendId, setHighlightedSendId] = useState<number | null>(null);
    const mediaStatusTone = (state?: string) => {
        if (state === 'ready') return 'border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-800 dark:bg-emerald-900/20 dark:text-emerald-200';
        if (state === 'missing' || state === 'reupload_required') return 'border-amber-200 bg-amber-50 text-amber-800 dark:border-amber-800 dark:bg-amber-900/20 dark:text-amber-200';
        return 'border-gray-200 bg-gray-50 text-gray-700 dark:border-gray-800 dark:bg-gray-900/20 dark:text-gray-300';
    };

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
                    id: liveTemplate.id,
                    slug: liveTemplate.slug,
                    name: liveTemplate.name,
                    language: liveTemplate.language,
                    status: liveTemplate.status,
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

    useEffect(() => {
        setLiveTemplate(template);
    }, [template]);

    useEffect(() => {
        if (typeof window === 'undefined') return;
        const match = window.location.hash.match(/recent-send-(\d+)/);
        setHighlightedSendId(match ? Number(match[1]) : null);
    }, []);

    const handleCheckStatus = () => {
        router.post(
            route('app.whatsapp.templates.check-status', {
                template: liveTemplate.slug}),
            {},
            {
                onStart: () => setActionState('check-status'),
                onSuccess: () => {
                    router.reload({ only: ['template'] });
                },
                onError: () => {},
                onFinish: () => setActionState(null),
            }
        );
    };

    useEffect(() => {
        if (!account?.id) return;

        const channel = `account.${account.id}.whatsapp.templates`;
        const unsubscribe = subscribe(channel, '.whatsapp.template.status.updated', (data: any) => {
            const incoming = data?.template;
            if (!incoming) return;
            if (incoming.id !== liveTemplate.id && incoming.slug !== liveTemplate.slug) return;

            setLiveTemplate((prev) => ({
                ...prev,
                status: incoming.status ?? prev.status,
                sync_state: incoming.sync_state ?? prev.sync_state,
                is_remote_deleted: incoming.is_remote_deleted ?? prev.is_remote_deleted,
                is_stale: incoming.is_stale ?? prev.is_stale,
                last_meta_error: incoming.last_meta_error ?? prev.last_meta_error,
                rejection_reason: incoming.rejection_reason ?? incoming.meta_rejection_reason ?? prev.rejection_reason,
                meta_rejection_reason: incoming.meta_rejection_reason ?? prev.meta_rejection_reason,
                last_synced_at: incoming.last_synced_at ?? prev.last_synced_at,
                last_meta_sync_at: incoming.last_meta_sync_at ?? prev.last_meta_sync_at,
            }));
        });

        return unsubscribe;
    }, [account?.id, liveTemplate.id, liveTemplate.slug, subscribe]);

    const handleArchive = async () => {
        const confirmed = await confirm({
            title: 'Archive Template',
            message: `Are you sure you want to archive "${liveTemplate.name}"? You can restore it later.`,
            variant: 'warning'});

        if (!confirmed) return;

        router.post(
            route('app.whatsapp.templates.archive', {
                template: liveTemplate.slug}),
            {},
            {
                onStart: () => setActionState('archive'),
                onSuccess: () => {
                    router.visit(route('app.whatsapp.templates.index', {}));
                },
                onError: () => {},
                onFinish: () => setActionState(null),
            }
        );
    };

    const handleDelete = async () => {
        const confirmed = await confirm({
            title: 'Delete Template',
            message: `Are you sure you want to permanently delete "${liveTemplate.name}"? This action cannot be undone.`,
            variant: 'danger',
            confirmText: 'Delete'});

        if (!confirmed) return;

        router.delete(
            route('app.whatsapp.templates.destroy', {
                template: liveTemplate.slug}),
            {
                onStart: () => setActionState('delete'),
                onSuccess: () => {
                    router.visit(route('app.whatsapp.templates.index', {}));
                },
                onError: () => {},
                onFinish: () => setActionState(null),
            }
        );
    };

    const getStatusBadge = (status: string) => {
        const statusMap: Record<string, { variant: 'success' | 'warning' | 'danger' | 'default' | 'info'; label: string }> = {
            approved: { variant: 'success', label: 'Approved' },
            active: { variant: 'success', label: 'Active' },
            pending: { variant: 'warning', label: 'Pending' },
            rejected: { variant: 'danger', label: 'Rejected' },
            paused: { variant: 'default', label: 'Paused' },
            disabled: { variant: 'default', label: 'Disabled' }};

        const config = statusMap[status.toLowerCase()] || { variant: 'default' as const, label: status };
        return <Badge variant={config.variant} className="px-3 py-1">{config.label}</Badge>;
    };

    return (
        <AppShell>
            <Head title={`${liveTemplate.name} - Template`} />
            <div className="space-y-8">
                <div>
                    <Link
                        href={route('app.whatsapp.templates.index', {})}
                        className="inline-flex items-center gap-2 text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors mb-4"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        Back to Templates
                    </Link>
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-3 mb-2">
                                {liveTemplate.name}
                                {getStatusBadge(liveTemplate.status)}
                            </h1>
                            <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                                <div className="flex items-center gap-1.5">
                                    <Globe className="h-4 w-4" />
                                    {liveTemplate.language}
                                </div>
                                <div className="flex items-center gap-1.5">
                                    <Tag className="h-4 w-4" />
                                    {liveTemplate.category}
                                </div>
                                <div className="flex items-center gap-1.5">
                                    <FileText className="h-4 w-4" />
                                    {liveTemplate.connection.name}
                                </div>
                            </div>
                        </div>
                        <div className="flex flex-wrap items-stretch sm:items-center gap-2">
                            <Link
                                href={route('app.whatsapp.templates.edit', {
                                    template: liveTemplate.slug})}
                                className="w-full sm:w-auto"
                            >
                                <Button variant="secondary" className="w-full sm:w-auto">
                                    <Edit className="h-4 w-4 mr-2" />
                                    Edit
                                </Button>
                            </Link>
                            {liveTemplate.meta_template_id && (
                                <Button
                                    variant="secondary"
                                    onClick={handleCheckStatus}
                                    disabled={actionState !== null}
                                    className="w-full sm:w-auto"
                                >
                                    {actionState === 'check-status' ? (
                                        <>
                                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                            Checking...
                                        </>
                                    ) : (
                                        <>
                                            <RefreshCw className="h-4 w-4 mr-2" />
                                            Check Status
                                        </>
                                    )}
                                </Button>
                            )}
                            <Link
                                href={route('app.whatsapp.templates.send', {
                                    template: liveTemplate.slug})}
                                className="w-full sm:w-auto"
                            >
                                <Button className="w-full sm:w-auto">
                                    <Send className="h-4 w-4 mr-2" />
                                    Send Template
                                </Button>
                            </Link>
                            <Button
                                variant="secondary"
                                onClick={handleArchive}
                                disabled={actionState !== null}
                                className="w-full sm:w-auto text-orange-600 hover:text-orange-700 hover:bg-orange-50 dark:hover:bg-orange-900/20"
                            >
                                {actionState === 'archive' ? (
                                    <>
                                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                        Archiving...
                                    </>
                                ) : (
                                    <>
                                        <Archive className="h-4 w-4 mr-2" />
                                        Archive
                                    </>
                                )}
                            </Button>
                            <Button
                                variant="secondary"
                                onClick={handleDelete}
                                disabled={actionState !== null}
                                className="w-full sm:w-auto text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                            >
                                {actionState === 'delete' ? (
                                    <>
                                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                        Deleting...
                                    </>
                                ) : (
                                    <>
                                        <Trash2 className="h-4 w-4 mr-2" />
                                        Delete
                                    </>
                                )}
                            </Button>
                        </div>
                    </div>
                </div>

                {liveTemplate.rejection_reason && (
                    <Alert variant="error" className="border-red-200 dark:border-red-800">
                        <AlertCircle className="h-5 w-5" />
                        <div>
                            <h3 className="font-semibold text-red-800 dark:text-red-200 mb-1">Rejection Reason</h3>
                            <p className="text-sm text-red-600 dark:text-red-400">{liveTemplate.rejection_reason}</p>
                        </div>
                    </Alert>
                )}

                {liveTemplate.meta_rejection_reason && liveTemplate.meta_rejection_reason !== liveTemplate.rejection_reason && (
                    <Alert variant="error" className="border-red-200 dark:border-red-800">
                        <AlertCircle className="h-5 w-5" />
                        <div>
                            <h3 className="font-semibold text-red-800 dark:text-red-200 mb-1">More detail</h3>
                            <p className="text-sm text-red-600 dark:text-red-400">{liveTemplate.meta_rejection_reason}</p>
                        </div>
                    </Alert>
                )}

                {liveTemplate.last_meta_error && (
                    <Alert variant="error" className="border-red-200 dark:border-red-800">
                        <AlertCircle className="h-5 w-5" />
                        <div>
                            <h3 className="font-semibold text-red-800 dark:text-red-200 mb-1">WhatsApp returned an error</h3>
                            <p className="text-sm text-red-600 dark:text-red-400">{liveTemplate.last_meta_error}</p>
                        </div>
                    </Alert>
                )}

                {(liveTemplate.is_remote_deleted || liveTemplate.is_stale || (liveTemplate.sendability && !liveTemplate.sendability.ok)) && (
                    <Alert variant="warning">
                        <AlertCircle className="h-5 w-5" />
                        <div className="space-y-1">
                            <h3 className="font-semibold text-amber-900 dark:text-amber-100">Check this template before sending</h3>
                            {liveTemplate.is_remote_deleted && (
                                <p className="text-sm text-amber-800 dark:text-amber-200">This template is no longer available on WhatsApp. Refresh templates before sending.</p>
                            )}
                            {liveTemplate.is_stale && !liveTemplate.is_remote_deleted && (
                                <p className="text-sm text-amber-800 dark:text-amber-200">This template needs a fresh status check before sending.</p>
                            )}
                            {liveTemplate.sendability && !liveTemplate.sendability.ok && liveTemplate.sendability.reason && (
                                <p className="text-sm text-amber-800 dark:text-amber-200">{liveTemplate.sendability.reason}</p>
                            )}
                        </div>
                    </Alert>
                )}

                {liveTemplate.header_media_status && liveTemplate.header_type && ['IMAGE', 'VIDEO', 'DOCUMENT'].includes(liveTemplate.header_type) && (
                    <div className={cn('rounded-xl border px-4 py-3', mediaStatusTone(liveTemplate.header_media_status.state))}>
                        <div className="flex items-start justify-between gap-3">
                            <div>
                                <p className="text-sm font-semibold">{liveTemplate.header_media_status.label}</p>
                                {liveTemplate.header_media_status.description && (
                                    <p className="mt-1 text-sm opacity-90">{liveTemplate.header_media_status.description}</p>
                                )}
                            </div>
                            {(liveTemplate.header_media_status.state === 'missing' || liveTemplate.header_media_status.state === 'reupload_required') && (
                                <Link href={route('app.whatsapp.templates.edit', { template: liveTemplate.slug })}>
                                    <Button variant="secondary" size="sm">Re-upload media</Button>
                                </Link>
                            )}
                        </div>
                    </div>
                )}

                <Card className="shadow-sm">
                    <CardHeader className="border-b border-gray-100 dark:border-gray-800">
                        <div className="flex items-center gap-3">
                            <div className="p-2 rounded-xl bg-amber-500">
                                <Clock className="h-5 w-5 text-white" />
                            </div>
                            <div>
                                <CardTitle className="text-xl font-bold">Recent Sends</CardTitle>
                                <CardDescription>Latest send attempts and their current status</CardDescription>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="p-4">
                        {recent_sends.length === 0 ? (
                            <div className="p-6 text-sm text-gray-500 dark:text-gray-400">No send history yet for this template.</div>
                        ) : (
                            <div className="space-y-3">
                                {recent_sends.map((send) => {
                                    const statusMeta = getRecentSendStatusMeta(send);
                                    const effectiveError = getRecentSendError(send);
                                    const timeline = getRecentSendTimeline(send);
                                    return (
                                        <div
                                            id={`recent-send-${send.id}`}
                                            key={send.id}
                                            className={cn(
                                                'scroll-mt-24 rounded-xl border border-gray-200 p-4 dark:border-gray-700',
                                                highlightedSendId === send.id && 'ring-2 ring-amber-400 dark:ring-amber-500'
                                            )}
                                        >
                                            <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                                                <div className="space-y-1">
                                                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{send.to_wa_id}</p>
                                                    <p className="text-xs text-gray-500 dark:text-gray-400">
                                                        {send.sent_at
                                                            ? new Date(send.sent_at).toLocaleString()
                                                            : send.created_at
                                                            ? new Date(send.created_at).toLocaleString()
                                                            : '-'}
                                                    </p>
                                                </div>
                                                <div className="space-y-1">
                                                    <Badge variant={statusMeta.variant} className="px-2 py-1 text-[10px]">
                                                        {statusMeta.label}
                                                    </Badge>
                                                    {timeline && <div className="text-[11px] text-gray-500 dark:text-gray-400">{timeline}</div>}
                                                </div>
                                            </div>
                                            <div className="mt-3 text-xs font-mono text-gray-500 dark:text-gray-400 break-all">
                                                {send.message?.meta_message_id || '-'}
                                            </div>
                                            {effectiveError && (
                                                <div className="mt-3 text-xs text-red-600 dark:text-red-400 break-words">
                                                    {effectiveError}
                                                </div>
                                            )}
                                            <details className="mt-3 rounded-lg border border-gray-200 bg-gray-50 p-3 text-gray-700 dark:border-gray-700 dark:bg-gray-950/40 dark:text-gray-200">
                                                <summary className="cursor-pointer text-[11px] font-semibold">More details</summary>
                                                <div className="mt-2">
                                                    <div className="mt-2 flex flex-wrap gap-3">
                                                        <Link
                                                            href={`${route('app.whatsapp.templates.send', { template: liveTemplate.slug })}#recent-send-${send.id}`}
                                                            className="text-[11px] font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                                                        >
                                                            Try again
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
                                                    <dl className="mt-2 space-y-1.5">
                                                        {getRecentSendDiagnostics(send).map(([label, value]) => (
                                                            <div key={label} className="grid gap-1 sm:grid-cols-[110px_1fr] sm:gap-2">
                                                                <dt className="text-gray-500 dark:text-gray-400">{label}</dt>
                                                                <dd className="break-all">
                                                                    {value.includes('T') ? new Date(value).toLocaleString() : value}
                                                                </dd>
                                                            </div>
                                                        ))}
                                                        {supportAccess && send.message?.payload && (
                                                            <div className="pt-2">
                                                                <dt className="mb-1 text-gray-500 dark:text-gray-400">Provider payload</dt>
                                                                <dd className="overflow-x-auto rounded bg-white p-2 font-mono text-[11px] dark:bg-gray-900">
                                                                    <pre>{JSON.stringify(send.message.payload, null, 2)}</pre>
                                                                </dd>
                                                            </div>
                                                        )}
                                                        {send.message?.provider_error?.details && (
                                                            <div className="grid gap-1 sm:grid-cols-[110px_1fr] sm:gap-2">
                                                                <dt className="text-gray-500 dark:text-gray-400">Details</dt>
                                                                <dd>{send.message.provider_error.details}</dd>
                                                            </div>
                                                        )}
                                                        {send.message?.provider_error?.code && (
                                                            <div className="grid gap-1 sm:grid-cols-[110px_1fr] sm:gap-2">
                                                                <dt className="text-gray-500 dark:text-gray-400">Code</dt>
                                                                <dd>{send.message.provider_error.code}</dd>
                                                            </div>
                                                        )}
                                                    </dl>
                                                </div>
                                            </details>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Template Preview */}
                <Card className="shadow-sm">
                    <CardHeader className="border-b border-gray-100 dark:border-gray-800">
                        <div className="flex items-center gap-3">
                            <div className="p-2 rounded-xl bg-blue-600">
                                <FileText className="h-5 w-5 text-white" />
                            </div>
                            <div>
                                <CardTitle className="text-xl font-bold">Template Preview</CardTitle>
                                <CardDescription>How your template will appear to recipients</CardDescription>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="p-6">
                        <div className="rounded-2xl border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-900">
                            <div className="space-y-3 text-sm text-gray-900 dark:text-gray-100">
                        {liveTemplate.header_type && liveTemplate.header_text && (
                            <div>
                                <div className="mb-1 text-[11px] font-semibold uppercase tracking-wide text-gray-500">Header</div>
                                <p className="font-medium">
                                    {liveTemplate.header_text}
                                </p>
                            </div>
                        )}

                        {liveTemplate.body_text && (
                            <div>
                                <div className="mb-1 flex items-center gap-2">
                                    <span className="text-[11px] font-semibold uppercase tracking-wide text-gray-500">Body</span>
                                    {liveTemplate.variable_count > 0 && (
                                        <span className="text-[11px] text-gray-500">{liveTemplate.variable_count} variables</span>
                                    )}
                                </div>
                                <p className="whitespace-pre-wrap leading-relaxed">
                                    {liveTemplate.body_text}
                                </p>
                            </div>
                        )}

                        {liveTemplate.footer_text && (
                            <div>
                                <div className="mb-1 text-[11px] font-semibold uppercase tracking-wide text-gray-500">Footer</div>
                                <p>
                                    {liveTemplate.footer_text}
                                </p>
                            </div>
                        )}

                        {liveTemplate.has_buttons && liveTemplate.buttons.length > 0 && (
                            <div>
                                <div className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-gray-500">Buttons</div>
                                <div className="space-y-2">
                                    {liveTemplate.buttons.map((button, index) => (
                                        <div
                                            key={index}
                                            className="flex items-center justify-between rounded-lg border border-gray-200 bg-white px-3 py-2 dark:border-gray-700 dark:bg-gray-950"
                                        >
                                            <span className="font-medium text-gray-900 dark:text-gray-100">{button.text}</span>
                                            <span className="text-[11px] text-gray-500">{button.type}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Template Details */}
                <Card className="shadow-sm">
                    <CardHeader className="border-b border-gray-100 dark:border-gray-800">
                        <div className="flex items-center gap-3">
                            <div className="p-2 rounded-xl bg-gray-900 dark:bg-gray-100">
                                <Sparkles className="h-5 w-5 text-white" />
                            </div>
                            <div>
                                <CardTitle className="text-xl font-bold">Template Details</CardTitle>
                                <CardDescription>Template status and saved details</CardDescription>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="p-6">
                        <dl className="space-y-3">
                            <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-xl">
                                <dt className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">Name</dt>
                                <dd className="text-sm font-semibold text-gray-900 dark:text-gray-100">{liveTemplate.name}</dd>
                            </div>
                            <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-xl">
                                <dt className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">Language</dt>
                                <dd className="text-sm font-semibold text-gray-900 dark:text-gray-100">{liveTemplate.language}</dd>
                            </div>
                            <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-xl">
                                <dt className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">Category</dt>
                                <dd className="text-sm font-semibold text-gray-900 dark:text-gray-100">{liveTemplate.category}</dd>
                            </div>
                            <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-xl">
                                <dt className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">Status</dt>
                                <dd>{getStatusBadge(liveTemplate.status)}</dd>
                            </div>
                            {liveTemplate.quality_score && (
                                <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-xl">
                                    <dt className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">Quality Score</dt>
                                    <dd className="text-sm font-semibold text-gray-900 dark:text-gray-100">{liveTemplate.quality_score}</dd>
                                </div>
                            )}
                            {liveTemplate.last_synced_at && (
                                <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-xl">
                                    <dt className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1 flex items-center gap-1">
                                        <Clock className="h-3.5 w-3.5" />
                                        Last Synced
                                    </dt>
                                    <dd className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                                        {new Date(liveTemplate.last_synced_at).toLocaleString()}
                                    </dd>
                                </div>
                            )}
                        </dl>
                    </CardContent>
                </Card>
            </div>
        </AppShell>
    );
}
