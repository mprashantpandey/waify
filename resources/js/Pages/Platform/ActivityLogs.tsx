import { Head, Link, router } from '@inertiajs/react';
import PlatformShell from '@/Layouts/PlatformShell';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/Components/UI/Card';
import { Badge } from '@/Components/UI/Badge';
import { Input } from '@/Components/UI/Input';
import { Label } from '@/Components/UI/Label';
import Button from '@/Components/UI/Button';
import { 
    Filter,
    AlertCircle,
    CheckCircle,
    XCircle,
    Building2,
    Activity
} from 'lucide-react';
import { usePage } from '@inertiajs/react';
import { useState } from 'react';

interface ActivityLog {
    id: string;
    type: string;
    description: string;
    account_id: number | null;
    entity_type?: string | null;
    entity_id?: number | null;
    correlation_id?: string | null;
    metadata: Record<string, any>;
    created_at: string;
}

interface PaginatedLogs {
    data: ActivityLog[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
}

type FilterPreset = {
    id: number;
    name: string;
    kind: 'preset' | 'correlation';
    correlation_id?: string | null;
    is_shared: boolean;
    user_id?: number | null;
    filters: { type?: string; account_id?: number; q?: string; correlation_id?: string; entity_type?: string; entity_id?: number };
};

export default function ActivityLogs({
    logs,
    filters,
    filter_options,
    saved_views,
    can_manage_shared_views}: {
    logs: PaginatedLogs;
    filters: { type?: string; account_id?: number; q?: string; correlation_id?: string; entity_type?: string; entity_id?: number };
    filter_options: { types: string[]; entity_types: string[]; accounts: Array<{ id: number; name: string }> };
    saved_views: FilterPreset[];
    can_manage_shared_views: boolean;
}) {
    const { auth } = usePage().props as any;
    const [localFilters, setLocalFilters] = useState(filters);
    const [previewLog, setPreviewLog] = useState<ActivityLog | null>(null);
    const [selectedPresetId, setSelectedPresetId] = useState<number | null>(null);

    const applyFilters = () => {
        router.get(route('platform.activity-logs'), localFilters as any, {
            preserveState: true,
            preserveScroll: true});
    };

    const saveCurrentFiltersAsPreset = () => {
        const name = window.prompt('Preset name');
        if (!name) return;
        const clean = name.trim();
        if (!clean) return;
        router.post(route('platform.activity-logs.saved-views.store'), {
            name: clean,
            kind: 'preset',
            filters: { ...localFilters },
            is_shared: true,
        }, { preserveScroll: true });
    };

    const applySelectedPreset = () => {
        const preset = (saved_views || []).find((p) => p.id === selectedPresetId);
        if (!preset) return;
        setLocalFilters(preset.filters);
        router.get(route('platform.activity-logs'), preset.filters as any, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const deleteSelectedPreset = () => {
        if (!selectedPresetId) return;
        router.delete(route('platform.activity-logs.saved-views.delete', { savedView: selectedPresetId }), { preserveScroll: true });
        setSelectedPresetId(null);
    };

    const renameSelectedPreset = () => {
        if (!selectedPresetId) return;
        const current = (saved_views || []).find((p) => p.id === selectedPresetId);
        if (!current) return;
        const next = window.prompt('Rename preset', current.name);
        if (!next) return;
        const clean = next.trim();
        if (!clean || clean === current.name) return;
        router.patch(route('platform.activity-logs.saved-views.update', { savedView: selectedPresetId }), {
            name: clean,
        }, { preserveScroll: true });
    };

    const toggleShareSelectedPreset = () => {
        if (!selectedPresetId) return;
        const current = (saved_views || []).find((p) => p.id === selectedPresetId);
        if (!current) return;
        router.patch(route('platform.activity-logs.saved-views.update', { savedView: selectedPresetId }), {
            is_shared: !current.is_shared,
        }, { preserveScroll: true });
    };

    const exportLogs = () => {
        const params = new URLSearchParams({
            type: String(localFilters.type || ''),
            account_id: String(localFilters.account_id || ''),
            q: String(localFilters.q || ''),
            correlation_id: String(localFilters.correlation_id || ''),
            entity_type: String(localFilters.entity_type || ''),
            entity_id: String(localFilters.entity_id || ''),
        });
        window.location.href = `${route('platform.activity-logs.export')}?${params.toString()}`;
    };

    const drillBy = (next: Record<string, string | number | null | undefined>) => {
        const merged = { ...localFilters, ...next };
        setLocalFilters(merged);
        router.get(route('platform.activity-logs'), merged as any, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const resolveDiagnosticsParams = (log: ActivityLog): URLSearchParams => {
        const params = new URLSearchParams();
        if (log.correlation_id) params.set('correlation_id', log.correlation_id);

        const entityType = log.entity_type || '';
        const entityId = log.entity_id || 0;
        if (entityType === 'connection' && entityId) params.set('connection_id', String(entityId));
        if (entityType === 'campaign' && entityId) params.set('campaign_id', String(entityId));
        if (entityType === 'conversation' && entityId) params.set('conversation_id', String(entityId));
        if (entityType === 'message' && entityId) params.set('message_id', String(entityId));
        if (entityType === 'template' && entityId) params.set('template_id', String(entityId));
        if (entityType === 'webhook_event' && entityId) params.set('webhook_event_id', String(entityId));
        if (entityType === 'alert' && entityId) params.set('event_id', String(entityId));

        return params;
    };

    const resolveEntityLink = (log: ActivityLog): string | null => {
        if (log.account_id) {
            return route('platform.accounts.show', { account: log.account_id });
        }
        return null;
    };

    const getTypeBadge = (type: string) => {
        const typeMap: Record<string, { variant: 'success' | 'warning' | 'danger' | 'info' | 'default'; label: string }> = {
            webhook_success: { variant: 'success', label: 'Webhook' },
            webhook_error: { variant: 'danger', label: 'Webhook Error' },
            system_error: { variant: 'danger', label: 'System Error' },
            account_status_change: { variant: 'warning', label: 'Tenant' },
            user_action: { variant: 'info', label: 'User Action' },
            api_call: { variant: 'info', label: 'API Call' }};

        const config = typeMap[type] || { variant: 'default' as const, label: type };
        return <Badge variant={config.variant}>{config.label}</Badge>;
    };

    const getTypeIcon = (type: string) => {
        if (type.includes('error')) return <XCircle className="h-4 w-4 text-red-600 dark:text-red-400" />;
        if (type.includes('success')) return <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />;
        return <AlertCircle className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />;
    };

    return (
        <PlatformShell auth={auth}>
            <Head title="Activity Logs" />
            <div className="space-y-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Activity Logs</h1>
                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                        Audit trail and system activity monitoring
                    </p>
                </div>

                {/* Filters */}
                <Card>
                    <CardHeader>
                        <div className="flex flex-wrap items-center justify-between gap-2">
                            <CardTitle className="flex items-center gap-2">
                                <Filter className="h-5 w-5" />
                                Filters
                            </CardTitle>
                            <div className="flex flex-wrap items-center gap-2">
                                <Button type="button" variant="secondary" onClick={saveCurrentFiltersAsPreset}>Save Preset</Button>
                                <select
                                    value={selectedPresetId || ''}
                                    onChange={(e) => setSelectedPresetId(e.target.value ? Number(e.target.value) : null)}
                                    className="rounded-md border-gray-300 dark:border-gray-700 dark:bg-gray-900 text-sm"
                                >
                                    <option value="">Presets</option>
                                    {(saved_views || []).map((preset) => (
                                        <option key={preset.id} value={preset.id}>
                                            {preset.kind === 'correlation' ? '[Pin] ' : ''}{preset.name}{preset.is_shared ? ' (Shared)' : ''}
                                        </option>
                                    ))}
                                </select>
                                <Button type="button" variant="secondary" onClick={applySelectedPreset} disabled={!selectedPresetId}>Apply Preset</Button>
                                <Button type="button" variant="secondary" onClick={renameSelectedPreset} disabled={!selectedPresetId}>Rename</Button>
                                <Button type="button" variant="secondary" onClick={toggleShareSelectedPreset} disabled={!selectedPresetId || !can_manage_shared_views}>
                                    {((saved_views || []).find((p) => p.id === selectedPresetId)?.is_shared) ? 'Make Private' : 'Make Shared'}
                                </Button>
                                <Button type="button" variant="secondary" onClick={deleteSelectedPreset} disabled={!selectedPresetId}>Delete Preset</Button>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
                            <div>
                                <Label htmlFor="filter-type">Type</Label>
                                <select
                                    id="filter-type"
                                    value={localFilters.type || ''}
                                    onChange={(e) => setLocalFilters({ ...localFilters, type: e.target.value || undefined })}
                                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100"
                                >
                                    <option value="">All Types</option>
                                    {filter_options.types.map((type) => (
                                        <option key={type} value={type}>
                                            {type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <Label htmlFor="filter-account">Tenant</Label>
                                <select
                                    id="filter-account"
                                    value={localFilters.account_id || ''}
                                    onChange={(e) => setLocalFilters({ ...localFilters, account_id: e.target.value ? Number(e.target.value) : undefined })}
                                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100"
                                >
                                    <option value="">All Tenants</option>
                                    {filter_options.accounts.map((account) => (
                                        <option key={account.id} value={account.id}>
                                            {account.name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <Label htmlFor="filter-correlation">Correlation</Label>
                                <Input
                                    id="filter-correlation"
                                    value={localFilters.correlation_id || ''}
                                    onChange={(e) => setLocalFilters({ ...localFilters, correlation_id: e.target.value || undefined })}
                                    placeholder="req_... / wh_..."
                                />
                            </div>
                            <div>
                                <Label htmlFor="filter-entity-type">Entity Type</Label>
                                <select
                                    id="filter-entity-type"
                                    value={localFilters.entity_type || ''}
                                    onChange={(e) => setLocalFilters({ ...localFilters, entity_type: e.target.value || undefined })}
                                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100"
                                >
                                    <option value="">All Entities</option>
                                    {(filter_options.entity_types || []).map((type) => (
                                        <option key={type} value={type}>{type}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <Label htmlFor="filter-entity-id">Entity ID</Label>
                                <Input
                                    id="filter-entity-id"
                                    type="number"
                                    min={1}
                                    value={localFilters.entity_id || ''}
                                    onChange={(e) => setLocalFilters({ ...localFilters, entity_id: e.target.value ? Number(e.target.value) : undefined })}
                                    placeholder="e.g. 123"
                                />
                            </div>
                            <div className="flex items-end">
                                <div className="w-full flex gap-2">
                                    <button
                                        onClick={applyFilters}
                                        className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                                    >
                                        Apply
                                    </button>
                                    <Button type="button" variant="secondary" onClick={exportLogs}>Export</Button>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Logs Table */}
                <Card>
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <div>
                                <CardTitle>Activity Logs</CardTitle>
                                <CardDescription>
                                    {logs.total} total log entries
                                </CardDescription>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        {logs.data.length === 0 ? (
                            <div className="text-center py-12">
                                <Activity className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                                <p className="text-gray-500 dark:text-gray-400">No activity logs found</p>
                            </div>
                        ) : (
                            <>
                                <div className="overflow-x-auto">
                                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-800">
                                        <thead className="bg-gray-50 dark:bg-gray-900">
                                            <tr>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Type</th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Description</th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Tenant</th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Time</th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Details</th>
                                            </tr>
                                        </thead>
                                        <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                                            {logs.data.map((log) => (
                                                <tr key={log.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <div className="flex items-center gap-2">
                                                            {getTypeIcon(log.type)}
                                                            {getTypeBadge(log.type)}
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <p className="text-sm text-gray-900 dark:text-gray-100">
                                                            {log.description}
                                                        </p>
                                                        <div className="mt-2 flex flex-wrap gap-2">
                                                            {log.entity_type && log.entity_id ? (
                                                                <button
                                                                    type="button"
                                                                    onClick={() => drillBy({ entity_type: log.entity_type, entity_id: log.entity_id })}
                                                                    className="text-xs px-2 py-1 rounded border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
                                                                >
                                                                    {log.entity_type} #{log.entity_id}
                                                                </button>
                                                            ) : null}
                                                            {log.correlation_id ? (
                                                                <button
                                                                    type="button"
                                                                    onClick={() => drillBy({ correlation_id: log.correlation_id })}
                                                                    className="text-xs px-2 py-1 rounded border border-blue-300 dark:border-blue-700 text-blue-700 dark:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-900/20"
                                                                >
                                                                    {log.correlation_id}
                                                                </button>
                                                            ) : null}
                                                        </div>
                                                        <div className="mt-2 flex flex-wrap gap-2">
                                                            <Button
                                                                type="button"
                                                                size="sm"
                                                                variant="secondary"
                                                                onClick={() => setPreviewLog(log)}
                                                            >
                                                                Diagnostics Bundle
                                                            </Button>
                                                            {resolveEntityLink(log) && (
                                                                <Link href={resolveEntityLink(log)!}>
                                                                    <Button type="button" size="sm" variant="secondary">Open Tenant</Button>
                                                                </Link>
                                                            )}
                                                            {log.correlation_id && (
                                                                <Link href={`${route('platform.operational-alerts.index')}?q=${encodeURIComponent(log.correlation_id)}`}>
                                                                    <Button type="button" size="sm" variant="secondary">Related Alerts</Button>
                                                                </Link>
                                                            )}
                                                            {log.correlation_id && (
                                                                <Button
                                                                    type="button"
                                                                    size="sm"
                                                                    variant="secondary"
                                                                    onClick={() => {
                                                                        router.post(route('platform.activity-logs.saved-views.store'), {
                                                                            name: `Pinned ${log.correlation_id}`,
                                                                            kind: 'correlation',
                                                                            correlation_id: log.correlation_id,
                                                                            filters: { correlation_id: log.correlation_id },
                                                                            is_shared: true,
                                                                        }, { preserveScroll: true });
                                                                    }}
                                                                >
                                                                    Pin Correlation
                                                                </Button>
                                                            )}
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        {log.account_id ? (
                                                            <Link
                                                                href={route('platform.accounts.show', { account: log.account_id })}
                                                                className="flex items-center gap-1 text-sm text-blue-600 dark:text-blue-400 hover:underline"
                                                            >
                                                                <Building2 className="h-3 w-3" />
                                                                Tenant #{log.account_id}
                                                            </Link>
                                                        ) : (
                                                            <span className="text-sm text-gray-400">N/A</span>
                                                        )}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                                        {new Date(log.created_at).toLocaleString()}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        {Object.keys(log.metadata || {}).length > 0 && (
                                                            <details className="cursor-pointer">
                                                                <summary className="text-xs text-blue-600 dark:text-blue-400 hover:underline">
                                                                    View Details
                                                                </summary>
                                                                <pre className="mt-2 text-xs bg-gray-900 text-gray-100 p-2 rounded overflow-auto max-h-40">
                                                                    {JSON.stringify(log.metadata, null, 2)}
                                                                </pre>
                                                            </details>
                                                        )}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>

                                {/* Pagination */}
                                {logs.last_page > 1 && (
                                    <div className="mt-4 flex items-center justify-between">
                                        <div className="text-sm text-gray-700 dark:text-gray-300">
                                            Showing {logs.per_page * (logs.current_page - 1) + 1} to{' '}
                                            {Math.min(logs.per_page * logs.current_page, logs.total)} of{' '}
                                            {logs.total} results
                                        </div>
                                        <div className="flex gap-2">
                                            {Array.from({ length: logs.last_page }, (_, i) => i + 1).map((page) => (
                                                <button
                                                    key={page}
                                                    onClick={() => {
                                                        router.get(route('platform.activity-logs'), { ...localFilters, page }, {
                                                            preserveState: true,
                                                            preserveScroll: true});
                                                    }}
                                                    className={`px-3 py-2 rounded-md text-sm ${
                                                        page === logs.current_page
                                                            ? 'bg-blue-600 text-white'
                                                            : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                                                    }`}
                                                >
                                                    {page}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </>
                        )}
                    </CardContent>
                </Card>
            </div>
            {previewLog && (
                <div className="fixed inset-0 z-50">
                    <div className="absolute inset-0 bg-black/40" onClick={() => setPreviewLog(null)} />
                    <div className="absolute right-0 top-0 h-full w-full max-w-2xl bg-white dark:bg-gray-900 shadow-2xl border-l border-gray-200 dark:border-gray-800 overflow-y-auto">
                        <div className="p-4 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between">
                            <div>
                                <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Diagnostics Preview</h2>
                                <p className="text-xs text-gray-500">{previewLog.id}</p>
                            </div>
                            <Button variant="secondary" onClick={() => setPreviewLog(null)}>Close</Button>
                        </div>
                        <div className="p-4 space-y-4">
                            <div className="text-sm text-gray-700 dark:text-gray-300">
                                <span className="font-medium">Description:</span> {previewLog.description}
                            </div>
                            <div>
                                <div className="text-sm font-medium text-gray-700 dark:text-gray-300">Bundle Query Params</div>
                                <pre className="mt-1 text-xs bg-gray-100 dark:bg-gray-800 p-3 rounded overflow-x-auto">
                                    {resolveDiagnosticsParams(previewLog).toString() || '(none)'}
                                </pre>
                            </div>
                            <div>
                                <div className="text-sm font-medium text-gray-700 dark:text-gray-300">Metadata Snapshot</div>
                                <pre className="mt-1 text-xs bg-gray-900 text-gray-100 p-3 rounded overflow-auto max-h-80">
                                    {JSON.stringify(previewLog.metadata || {}, null, 2)}
                                </pre>
                            </div>
                            <div className="flex flex-wrap items-center gap-2">
                                <Button
                                    type="button"
                                    onClick={() => {
                                        const params = resolveDiagnosticsParams(previewLog);
                                        window.location.href = `${route('platform.operational-alerts.bundle')}?${params.toString()}`;
                                    }}
                                >
                                    Download Bundle
                                </Button>
                                {resolveEntityLink(previewLog) && (
                                    <Link href={resolveEntityLink(previewLog)!}>
                                        <Button type="button" variant="secondary">Open Tenant</Button>
                                    </Link>
                                )}
                                {previewLog.correlation_id && (
                                    <Link href={`${route('platform.operational-alerts.index')}?q=${encodeURIComponent(previewLog.correlation_id)}`}>
                                        <Button type="button" variant="secondary">Related Alerts</Button>
                                    </Link>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </PlatformShell>
    );
}
