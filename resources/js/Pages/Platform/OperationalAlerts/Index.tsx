import { Head, Link, router, usePage } from '@inertiajs/react';
import { FormEvent, useMemo, useState } from 'react';
import PlatformShell from '@/Layouts/PlatformShell';
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/UI/Card';
import { Badge } from '@/Components/UI/Badge';
import Button from '@/Components/UI/Button';
import TextInput from '@/Components/TextInput';

type AlertEvent = {
    id: number;
    event_key: string;
    title: string;
    account_id: number | null;
    severity: 'info' | 'warning' | 'critical';
    scope: string | null;
    correlation_id: string | null;
    status: 'sent' | 'skipped' | 'failed';
    channels: Record<string, string>;
    context: Record<string, any>;
    error_message: string | null;
    troubleshoot_link?: string | null;
    acknowledged_at: string | null;
    acknowledged_by: number | null;
    resolve_note: string | null;
    sent_at: string | null;
    created_at: string | null;
};

type PaginationLink = { url: string | null; label: string; active: boolean };

export default function OperationalAlertsIndex({
    filters,
    stats,
    events,
}: any) {
    const { auth } = usePage().props as any;
    const rows: AlertEvent[] = events?.data || [];
    const links: PaginationLink[] = events?.links || [];
    const [selectedIds, setSelectedIds] = useState<number[]>([]);
    const [bulkResolveNote, setBulkResolveNote] = useState('');
    const [detailEvent, setDetailEvent] = useState<AlertEvent | null>(null);
    const [detailResolveNote, setDetailResolveNote] = useState('');
    const selectedIdSet = useMemo(() => new Set(selectedIds), [selectedIds]);

    const toggleSelection = (id: number, checked: boolean) => {
        setSelectedIds((prev) => checked ? [...new Set([...prev, id])] : prev.filter((item) => item !== id));
    };

    const toggleSelectPage = (checked: boolean) => {
        const pageIds = rows.map((row) => row.id);
        setSelectedIds((prev) => checked ? [...new Set([...prev, ...pageIds])] : prev.filter((id) => !pageIds.includes(id)));
    };

    const bulkAcknowledge = () => {
        if (selectedIds.length === 0) return;
        router.post(route('platform.operational-alerts.acknowledge.bulk'), {
            ids: selectedIds,
            resolve_note: bulkResolveNote || null,
        }, {
            preserveScroll: true,
            onSuccess: () => {
                setSelectedIds([]);
                setBulkResolveNote('');
            },
        });
    };

    const exportCsv = () => {
        const params = new URLSearchParams({
            status: String(filters?.status || ''),
            severity: String(filters?.severity || ''),
            ack: String(filters?.ack || ''),
            q: String(filters?.q || ''),
            account_id: String(filters?.account_id || ''),
        });
        window.location.href = `${route('platform.operational-alerts.export')}?${params.toString()}`;
    };

    const downloadBundle = (row?: AlertEvent) => {
        const params = new URLSearchParams();
        if (row?.id) {
            params.set('event_id', String(row.id));
        } else if (filters?.account_id) {
            params.set('account_id', String(filters.account_id));
        }
        window.location.href = `${route('platform.operational-alerts.bundle')}?${params.toString()}`;
    };

    const openDetails = (row: AlertEvent) => {
        setDetailEvent(row);
        setDetailResolveNote(row.resolve_note || '');
    };

    const acknowledgeFromDrawer = () => {
        if (!detailEvent) return;
        router.post(route('platform.operational-alerts.acknowledge', { event: detailEvent.id }), {
            resolve_note: detailResolveNote || null,
        }, {
            preserveScroll: true,
            onSuccess: () => setDetailEvent(null),
        });
    };

    const onFilterSubmit = (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const form = new FormData(e.currentTarget);
        router.get(
            route('platform.operational-alerts.index'),
            {
                status: form.get('status') || '',
                severity: form.get('severity') || '',
                ack: form.get('ack') || '',
                q: form.get('q') || '',
                account_id: form.get('account_id') || '',
            },
            { preserveState: true, preserveScroll: true, replace: true },
        );
    };

    const severityBadge = (severity: AlertEvent['severity']) => {
        if (severity === 'critical') return <Badge variant="danger">critical</Badge>;
        if (severity === 'warning') return <Badge variant="warning">warning</Badge>;
        return <Badge variant="info">info</Badge>;
    };

    const statusBadge = (status: AlertEvent['status']) => {
        if (status === 'sent') return <Badge variant="success">sent</Badge>;
        if (status === 'failed') return <Badge variant="danger">failed</Badge>;
        return <Badge variant="secondary">skipped</Badge>;
    };

    return (
        <PlatformShell auth={auth}>
            <Head title="Operational Alerts" />

            <div className="space-y-6">
                <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Operational Alerts</h1>
                        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                            Queue failure and ops alert delivery history.
                        </p>
                    </div>
                    <Button onClick={() => router.post(route('platform.operational-alerts.test'))}>
                        Send Test Alert
                    </Button>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <Card><CardContent className="p-4"><div className="text-xs text-gray-500">Total</div><div className="text-2xl font-bold">{stats?.total || 0}</div></CardContent></Card>
                    <Card><CardContent className="p-4"><div className="text-xs text-gray-500">Failed</div><div className="text-2xl font-bold text-red-600 dark:text-red-400">{stats?.failed || 0}</div></CardContent></Card>
                    <Card><CardContent className="p-4"><div className="text-xs text-gray-500">Skipped</div><div className="text-2xl font-bold text-gray-700 dark:text-gray-300">{stats?.skipped || 0}</div></CardContent></Card>
                    <Card><CardContent className="p-4"><div className="text-xs text-gray-500">Critical (24h)</div><div className="text-2xl font-bold text-amber-600 dark:text-amber-400">{stats?.critical_24h || 0}</div></CardContent></Card>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Filters</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={onFilterSubmit} className="grid grid-cols-1 md:grid-cols-6 gap-3">
                            <select
                                name="status"
                                defaultValue={filters?.status || ''}
                                className="rounded-md border-gray-300 dark:border-gray-700 dark:bg-gray-900"
                            >
                                <option value="">All status</option>
                                <option value="sent">sent</option>
                                <option value="skipped">skipped</option>
                                <option value="failed">failed</option>
                            </select>
                            <select
                                name="severity"
                                defaultValue={filters?.severity || ''}
                                className="rounded-md border-gray-300 dark:border-gray-700 dark:bg-gray-900"
                            >
                                <option value="">All severity</option>
                                <option value="info">info</option>
                                <option value="warning">warning</option>
                                <option value="critical">critical</option>
                            </select>
                            <TextInput name="q" defaultValue={filters?.q || ''} placeholder="Search event/scope/error..." />
                            <TextInput name="account_id" defaultValue={filters?.account_id || ''} placeholder="Tenant account ID" />
                            <select
                                name="ack"
                                defaultValue={filters?.ack || ''}
                                className="rounded-md border-gray-300 dark:border-gray-700 dark:bg-gray-900"
                            >
                                <option value="">All acknowledgement</option>
                                <option value="no">unacknowledged</option>
                                <option value="yes">acknowledged</option>
                            </select>
                            <div className="flex items-center gap-2">
                                <Button type="submit">Apply</Button>
                                <Button
                                    type="button"
                                    variant="secondary"
                                    onClick={() => router.get(route('platform.operational-alerts.index'))}
                                >
                                    Clear
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <div className="flex items-center justify-between gap-3">
                            <CardTitle>Recent Events</CardTitle>
                            <div className="flex items-center gap-2">
                                <Button type="button" variant="secondary" onClick={() => downloadBundle()}>
                                    Diagnostics Bundle
                                </Button>
                                <TextInput
                                    value={bulkResolveNote}
                                    onChange={(e) => setBulkResolveNote(e.target.value)}
                                    placeholder="Resolve note for selected..."
                                />
                                <Button type="button" variant="secondary" onClick={exportCsv}>
                                    Export CSV
                                </Button>
                                <Button type="button" onClick={bulkAcknowledge} disabled={selectedIds.length === 0}>
                                    Acknowledge Selected ({selectedIds.length})
                                </Button>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="p-0">
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-800">
                                <thead className="bg-gray-50 dark:bg-gray-900">
                                    <tr>
                                        <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-500">
                                            <input
                                                type="checkbox"
                                                checked={rows.length > 0 && rows.every((row) => selectedIdSet.has(row.id))}
                                                onChange={(e) => toggleSelectPage(e.target.checked)}
                                            />
                                        </th>
                                        <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-500">Event</th>
                                        <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-500">Severity</th>
                                        <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-500">Status</th>
                                        <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-500">Ack</th>
                                        <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-500">Tenant</th>
                                        <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-500">Scope</th>
                                        <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-500">Correlation</th>
                                        <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-500">Channels</th>
                                        <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-500">Time</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                                    {rows.length === 0 && (
                                        <tr>
                                            <td colSpan={10} className="px-4 py-8 text-center text-sm text-gray-500">No alert events found.</td>
                                        </tr>
                                    )}
                                    {rows.map((row) => (
                                        <tr key={row.id} className="align-top">
                                            <td className="px-4 py-3">
                                                <input
                                                    type="checkbox"
                                                    checked={selectedIdSet.has(row.id)}
                                                    onChange={(e) => toggleSelection(row.id, e.target.checked)}
                                                />
                                            </td>
                                            <td className="px-4 py-3">
                                                <div className="text-sm font-semibold text-gray-900 dark:text-gray-100">{row.title}</div>
                                                <div className="text-xs text-gray-500">{row.event_key}</div>
                                                {row.error_message && (
                                                    <div className="mt-1 text-xs text-red-600 dark:text-red-400 max-w-md break-words">{row.error_message}</div>
                                                )}
                                                <div className="mt-2 flex items-center gap-2">
                                                    <Button size="sm" variant="secondary" onClick={() => openDetails(row)}>
                                                        View Details
                                                    </Button>
                                                    <Button size="sm" variant="secondary" onClick={() => downloadBundle(row)}>
                                                        Download Bundle
                                                    </Button>
                                                    {row.troubleshoot_link && (
                                                        <Link href={row.troubleshoot_link}>
                                                            <Button size="sm" variant="secondary">Troubleshoot</Button>
                                                        </Link>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-4 py-3">{severityBadge(row.severity)}</td>
                                            <td className="px-4 py-3">{statusBadge(row.status)}</td>
                                            <td className="px-4 py-3">
                                                {row.acknowledged_at ? (
                                                    <div className="space-y-1">
                                                        <Badge variant="success">acknowledged</Badge>
                                                        {row.resolve_note && (
                                                            <div className="text-xs text-gray-500 max-w-xs break-words">{row.resolve_note}</div>
                                                        )}
                                                    </div>
                                                ) : (
                                                    <Button
                                                        size="sm"
                                                        variant="secondary"
                                                        onClick={() => openDetails(row)}
                                                    >
                                                        Acknowledge
                                                    </Button>
                                                )}
                                            </td>
                                            <td className="px-4 py-3 text-xs text-gray-600 dark:text-gray-300">{row.account_id ?? '-'}</td>
                                            <td className="px-4 py-3 text-xs text-gray-600 dark:text-gray-300">{row.scope || '-'}</td>
                                            <td className="px-4 py-3 text-xs text-gray-600 dark:text-gray-300">{row.correlation_id || '-'}</td>
                                            <td className="px-4 py-3 text-xs text-gray-600 dark:text-gray-300">
                                                {Object.entries(row.channels || {}).map(([k, v]) => (
                                                    <div key={`${row.id}-${k}`}>
                                                        <span className="font-medium">{k}:</span> {String(v)}
                                                    </div>
                                                ))}
                                            </td>
                                            <td className="px-4 py-3 text-xs text-gray-600 dark:text-gray-300 whitespace-nowrap">
                                                {row.created_at ? new Date(row.created_at).toLocaleString() : '-'}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        {links.length > 0 && (
                            <div className="p-4 border-t border-gray-200 dark:border-gray-800 flex flex-wrap items-center gap-2">
                                {links.map((link, idx) => (
                                    <Link
                                        key={`${idx}-${link.label}`}
                                        href={link.url || '#'}
                                        className={`px-3 py-1.5 text-sm rounded border ${
                                            link.active
                                                ? 'bg-blue-600 border-blue-600 text-white'
                                                : 'border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300'
                                        } ${!link.url ? 'opacity-50 pointer-events-none' : ''}`}
                                        dangerouslySetInnerHTML={{ __html: link.label }}
                                    />
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
            {detailEvent && (
                <div className="fixed inset-0 z-50">
                    <div className="absolute inset-0 bg-black/40" onClick={() => setDetailEvent(null)} />
                    <div className="absolute right-0 top-0 h-full w-full max-w-xl bg-white dark:bg-gray-900 shadow-2xl border-l border-gray-200 dark:border-gray-800 overflow-y-auto">
                        <div className="p-4 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between">
                            <div>
                                <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Alert Details</h2>
                                <p className="text-xs text-gray-500">{detailEvent.event_key}</p>
                            </div>
                            <Button variant="secondary" onClick={() => setDetailEvent(null)}>Close</Button>
                        </div>
                        <div className="p-4 space-y-4">
                            <div>
                                <div className="text-sm font-medium text-gray-700 dark:text-gray-300">Title</div>
                                <div className="text-sm text-gray-900 dark:text-gray-100">{detailEvent.title}</div>
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div>{severityBadge(detailEvent.severity)}</div>
                                <div>{statusBadge(detailEvent.status)}</div>
                            </div>
                            <div>
                                <div className="text-sm font-medium text-gray-700 dark:text-gray-300">Scope</div>
                                <div className="text-sm text-gray-900 dark:text-gray-100">{detailEvent.scope || '-'}</div>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <div>
                                    <div className="text-sm font-medium text-gray-700 dark:text-gray-300">Acknowledged At</div>
                                    <div className="text-sm text-gray-900 dark:text-gray-100">
                                        {detailEvent.acknowledged_at ? new Date(detailEvent.acknowledged_at).toLocaleString() : '-'}
                                    </div>
                                </div>
                                <div>
                                    <div className="text-sm font-medium text-gray-700 dark:text-gray-300">Acknowledged By</div>
                                    <div className="text-sm text-gray-900 dark:text-gray-100">
                                        {detailEvent.acknowledged_by ? `User #${detailEvent.acknowledged_by}` : '-'}
                                    </div>
                                </div>
                            </div>
                            {detailEvent.correlation_id && (
                                <div>
                                    <div className="text-sm font-medium text-gray-700 dark:text-gray-300">Correlation ID</div>
                                    <div className="text-sm text-gray-900 dark:text-gray-100">{detailEvent.correlation_id}</div>
                                </div>
                            )}
                            <div>
                                <div className="text-sm font-medium text-gray-700 dark:text-gray-300">Channels</div>
                                <pre className="mt-1 text-xs bg-gray-100 dark:bg-gray-800 p-3 rounded overflow-x-auto">
                                    {JSON.stringify(detailEvent.channels || {}, null, 2)}
                                </pre>
                            </div>
                            <div>
                                <div className="text-sm font-medium text-gray-700 dark:text-gray-300">Context / Payload</div>
                                <pre className="mt-1 text-xs bg-gray-100 dark:bg-gray-800 p-3 rounded overflow-x-auto">
                                    {JSON.stringify(detailEvent.context || {}, null, 2)}
                                </pre>
                            </div>
                            <div>
                                <div className="text-sm font-medium text-gray-700 dark:text-gray-300">Error</div>
                                <div className="text-sm text-red-600 dark:text-red-400 break-words">{detailEvent.error_message || '-'}</div>
                            </div>
                            <div>
                                <div className="text-sm font-medium text-gray-700 dark:text-gray-300">Resolve Note</div>
                                <textarea
                                    value={detailResolveNote}
                                    onChange={(e) => setDetailResolveNote(e.target.value)}
                                    rows={4}
                                    className="mt-1 w-full rounded-md border-gray-300 dark:border-gray-700 dark:bg-gray-900"
                                    placeholder="Optional note for audit trail..."
                                />
                            </div>
                            <div className="flex items-center justify-between gap-2">
                                <div className="flex items-center gap-2">
                                    <Button type="button" variant="secondary" onClick={() => downloadBundle(detailEvent)}>
                                        Download Bundle
                                    </Button>
                                    {detailEvent.troubleshoot_link && (
                                        <Link href={detailEvent.troubleshoot_link}>
                                            <Button type="button" variant="secondary">Troubleshoot</Button>
                                        </Link>
                                    )}
                                </div>
                                <div className="flex items-center gap-2">
                                <Button
                                    onClick={acknowledgeFromDrawer}
                                    disabled={!!detailEvent.acknowledged_at && detailResolveNote === (detailEvent.resolve_note || '')}
                                >
                                    {detailEvent.acknowledged_at ? 'Update Note' : 'Acknowledge'}
                                </Button>
                                <Button variant="secondary" onClick={() => setDetailEvent(null)}>Done</Button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </PlatformShell>
    );
}
