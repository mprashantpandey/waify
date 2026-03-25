import { Link, router } from '@inertiajs/react';
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
    const { subscribe } = useRealtime();
    const [liveTemplate, setLiveTemplate] = useState<Template>(template);
    const [actionState, setActionState] = useState<string | null>(null);
    const [highlightedSendId, setHighlightedSendId] = useState<number | null>(null);

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
                            <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-gray-100 dark:to-gray-300 bg-clip-text text-transparent flex items-center gap-3 mb-2">
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
                                <Button className="w-full sm:w-auto bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 shadow-lg shadow-green-500/50">
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
                            <h3 className="font-semibold text-red-800 dark:text-red-200 mb-1">Meta Rejection Detail</h3>
                            <p className="text-sm text-red-600 dark:text-red-400">{liveTemplate.meta_rejection_reason}</p>
                        </div>
                    </Alert>
                )}

                {liveTemplate.last_meta_error && (
                    <Alert variant="error" className="border-red-200 dark:border-red-800">
                        <AlertCircle className="h-5 w-5" />
                        <div>
                            <h3 className="font-semibold text-red-800 dark:text-red-200 mb-1">Meta Error</h3>
                            <p className="text-sm text-red-600 dark:text-red-400">{liveTemplate.last_meta_error}</p>
                        </div>
                    </Alert>
                )}

                {(liveTemplate.is_remote_deleted || liveTemplate.is_stale || (liveTemplate.sendability && !liveTemplate.sendability.ok)) && (
                    <Alert variant="warning">
                        <AlertCircle className="h-5 w-5" />
                        <div className="space-y-1">
                            <h3 className="font-semibold text-amber-900 dark:text-amber-100">Template Sendability Warning</h3>
                            {liveTemplate.is_remote_deleted && (
                                <p className="text-sm text-amber-800 dark:text-amber-200">This template was not found in the latest Meta sync. Run Sync from Meta before sending.</p>
                            )}
                            {liveTemplate.is_stale && !liveTemplate.is_remote_deleted && (
                                <p className="text-sm text-amber-800 dark:text-amber-200">Template status is stale. Refresh status or run Sync from Meta before sending.</p>
                            )}
                            {liveTemplate.sendability && !liveTemplate.sendability.ok && liveTemplate.sendability.reason && (
                                <p className="text-sm text-amber-800 dark:text-amber-200">{liveTemplate.sendability.reason}</p>
                            )}
                        </div>
                    </Alert>
                )}

                <Card className="border-0 shadow-lg">
                    <CardHeader className="bg-gradient-to-r from-amber-50 to-orange-100 dark:from-amber-900/20 dark:to-orange-900/20">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-amber-500 rounded-xl">
                                <Clock className="h-5 w-5 text-white" />
                            </div>
                            <div>
                                <CardTitle className="text-xl font-bold">Recent Send Diagnostics</CardTitle>
                                <CardDescription>Latest send attempts and exact provider error details</CardDescription>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="p-0">
                        {recent_sends.length === 0 ? (
                            <div className="p-6 text-sm text-gray-500 dark:text-gray-400">No send history yet for this template.</div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead className="bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                                        <tr>
                                            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">Recipient</th>
                                            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">Status</th>
                                            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">Message ID</th>
                                            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">Error</th>
                                            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">Time</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
                                        {recent_sends.map((send) => {
                                            const statusMeta = getRecentSendStatusMeta(send);
                                            const effectiveError = getRecentSendError(send);
                                            const timeline = getRecentSendTimeline(send);
                                            return (
                                            <tr
                                                id={`recent-send-${send.id}`}
                                                key={send.id}
                                                className={cn(
                                                    'align-top scroll-mt-24',
                                                    highlightedSendId === send.id && 'bg-amber-50/70 dark:bg-amber-900/10'
                                                )}
                                            >
                                                    <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100">{send.to_wa_id}</td>
                                                    <td className="px-4 py-3">
                                                        <div className="space-y-1">
                                                            <Badge variant={statusMeta.variant} className="px-2 py-1 text-[10px]">
                                                                {statusMeta.label}
                                                            </Badge>
                                                            {timeline && (
                                                                <div className="text-[11px] text-gray-500 dark:text-gray-400">
                                                                    {timeline}
                                                                </div>
                                                            )}
                                                        </div>
                                                    </td>
                                                    <td className="px-4 py-3 text-xs font-mono text-gray-600 dark:text-gray-300 break-all">
                                                        {send.message?.meta_message_id || '-'}
                                                    </td>
                                                    <td className="px-4 py-3 text-xs text-red-600 dark:text-red-400 max-w-[420px]">
                                                        {effectiveError ? (
                                                            <div className="space-y-2">
                                                                <span title={effectiveError}>{effectiveError}</span>
                                                                <details className="rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-950/40 p-2 text-gray-700 dark:text-gray-200">
                                                                    <summary className="cursor-pointer text-[11px] font-semibold">
                                                                        Diagnostics
                                                                    </summary>
                                                                    <div className="mt-2">
                                                        <button
                                                            type="button"
                                                            onClick={() => downloadRecentSendDiagnostics(send)}
                                                            className="text-[11px] font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                                                        >
                                                            Download bundle
                                                        </button>
                                                        <div className="mt-2 flex flex-wrap gap-3">
                                                            <Link
                                                                href={`${route('app.whatsapp.templates.send', { template: liveTemplate.slug })}#recent-send-${send.id}`}
                                                                className="text-[11px] font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                                                            >
                                                                Retry with context
                                                            </Link>
                                                        </div>
                                                    </div>
                                                                    <dl className="mt-2 space-y-1.5">
                                                                        {getRecentSendDiagnostics(send).map(([label, value]) => (
                                                                            <div key={label} className="grid grid-cols-[110px_1fr] gap-2">
                                                                                <dt className="text-gray-500 dark:text-gray-400">{label}</dt>
                                                                                <dd className="break-all">
                                                                                    {value.includes('T') ? new Date(value).toLocaleString() : value}
                                                                                </dd>
                                                                            </div>
                                                                        ))}
                                                                        {send.message?.payload && (
                                                                            <div className="pt-2">
                                                                                <dt className="mb-1 text-gray-500 dark:text-gray-400">Provider payload</dt>
                                                                                <dd className="overflow-x-auto rounded bg-white p-2 font-mono text-[11px] dark:bg-gray-900">
                                                                                    <pre>{JSON.stringify(send.message.payload, null, 2)}</pre>
                                                                                </dd>
                                                                            </div>
                                                                        )}
                                                                        {send.message?.provider_error?.details && (
                                                                            <div className="grid grid-cols-[110px_1fr] gap-2">
                                                                                <dt className="text-gray-500 dark:text-gray-400">Details</dt>
                                                                                <dd>{send.message.provider_error.details}</dd>
                                                                            </div>
                                                                        )}
                                                                        {send.message?.provider_error?.code && (
                                                                            <div className="grid grid-cols-[110px_1fr] gap-2">
                                                                                <dt className="text-gray-500 dark:text-gray-400">Code</dt>
                                                                                <dd>{send.message.provider_error.code}</dd>
                                                                            </div>
                                                                        )}
                                                                    </dl>
                                                                </details>
                                                            </div>
                                                        ) : (
                                                            <span className="text-gray-400">-</span>
                                                        )}
                                                    </td>
                                                    <td className="px-4 py-3 text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap">
                                                        {send.sent_at
                                                            ? new Date(send.sent_at).toLocaleString()
                                                            : send.created_at
                                                            ? new Date(send.created_at).toLocaleString()
                                                            : '-'}
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Template Preview */}
                <Card className="border-0 shadow-lg">
                    <CardHeader className="bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-blue-500 rounded-xl">
                                <FileText className="h-5 w-5 text-white" />
                            </div>
                            <div>
                                <CardTitle className="text-xl font-bold">Template Preview</CardTitle>
                                <CardDescription>How your template will appear to recipients</CardDescription>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="p-6 space-y-6">
                        {liveTemplate.header_type && liveTemplate.header_text && (
                            <div className="p-5 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 rounded-xl border border-gray-200 dark:border-gray-700">
                                <div className="flex items-center gap-2 mb-3">
                                    <Badge variant="info" className="px-2 py-1 text-xs">
                                        Header ({liveTemplate.header_type})
                                    </Badge>
                                </div>
                                <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                    {liveTemplate.header_text}
                                </p>
                            </div>
                        )}

                        {liveTemplate.body_text && (
                            <div className="p-5 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 rounded-xl border border-gray-200 dark:border-gray-700">
                                <div className="flex items-center gap-2 mb-3">
                                    <Badge variant="default" className="px-2 py-1 text-xs">
                                        Body
                                    </Badge>
                                    {liveTemplate.variable_count > 0 && (
                                        <Badge variant="info" className="px-2 py-1 text-xs">
                                            {liveTemplate.variable_count} variables
                                        </Badge>
                                    )}
                                </div>
                                <p className="text-sm text-gray-900 dark:text-gray-100 whitespace-pre-wrap leading-relaxed">
                                    {liveTemplate.body_text}
                                </p>
                            </div>
                        )}

                        {liveTemplate.footer_text && (
                            <div className="p-5 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 rounded-xl border border-gray-200 dark:border-gray-700">
                                <div className="flex items-center gap-2 mb-3">
                                    <Badge variant="default" className="px-2 py-1 text-xs">
                                        Footer
                                    </Badge>
                                </div>
                                <p className="text-sm text-gray-900 dark:text-gray-100">
                                    {liveTemplate.footer_text}
                                </p>
                            </div>
                        )}

                        {liveTemplate.has_buttons && liveTemplate.buttons.length > 0 && (
                            <div>
                                <div className="flex items-center gap-2 mb-3">
                                    <Badge variant="default" className="px-2 py-1 text-xs">
                                        Buttons
                                    </Badge>
                                </div>
                                <div className="space-y-2">
                                    {liveTemplate.buttons.map((button, index) => (
                                        <div
                                            key={index}
                                            className="p-4 bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-xl border border-blue-200 dark:border-blue-800 flex items-center justify-between hover:shadow-md transition-shadow"
                                        >
                                            <span className="font-semibold text-gray-900 dark:text-gray-100">{button.text}</span>
                                            <Badge variant="info" className="px-3 py-1">
                                                {button.type}
                                            </Badge>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Template Details */}
                <Card className="border-0 shadow-lg">
                    <CardHeader className="bg-gradient-to-r from-gray-50 to-white dark:from-gray-800 dark:to-gray-900">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl">
                                <Sparkles className="h-5 w-5 text-white" />
                            </div>
                            <div>
                                <CardTitle className="text-xl font-bold">Template Details</CardTitle>
                                <CardDescription>Metadata and sync information</CardDescription>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="p-6">
                        <dl className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="p-4 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 rounded-xl">
                                <dt className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">Name</dt>
                                <dd className="text-sm font-semibold text-gray-900 dark:text-gray-100">{liveTemplate.name}</dd>
                            </div>
                            <div className="p-4 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 rounded-xl">
                                <dt className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">Language</dt>
                                <dd className="text-sm font-semibold text-gray-900 dark:text-gray-100">{liveTemplate.language}</dd>
                            </div>
                            <div className="p-4 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 rounded-xl">
                                <dt className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">Category</dt>
                                <dd className="text-sm font-semibold text-gray-900 dark:text-gray-100">{liveTemplate.category}</dd>
                            </div>
                            <div className="p-4 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 rounded-xl">
                                <dt className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">Status</dt>
                                <dd>{getStatusBadge(liveTemplate.status)}</dd>
                            </div>
                            {liveTemplate.quality_score && (
                                <div className="p-4 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 rounded-xl">
                                    <dt className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">Quality Score</dt>
                                    <dd className="text-sm font-semibold text-gray-900 dark:text-gray-100">{liveTemplate.quality_score}</dd>
                                </div>
                            )}
                            {liveTemplate.last_synced_at && (
                                <div className="p-4 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 rounded-xl">
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
