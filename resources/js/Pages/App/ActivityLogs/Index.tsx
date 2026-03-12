import { Head, Link, router } from '@inertiajs/react';
import AppShell from '@/Layouts/AppShell';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/Components/UI/Card';
import { Badge } from '@/Components/UI/Badge';
import Button from '@/Components/UI/Button';
import TextInput from '@/Components/TextInput';
import { 
    Activity, 
    MessageSquare,
    CheckCircle,
    XCircle,
    AlertCircle,
    Clock,
    Sparkles
} from 'lucide-react';
import { useMemo, useState, type FormEvent } from 'react';

interface ActivityLog {
    id: string;
    type: string;
    description: string;
    metadata: Record<string, any>;
    entity_type?: string | null;
    entity_id?: number | null;
    correlation_id?: string | null;
    created_at: string;
}

type FiltersState = { type?: string; q?: string; correlation_id?: string; entity_type?: string; entity_id?: number };
type SavedView = {
    id: number;
    name: string;
    kind: 'preset' | 'correlation';
    correlation_id?: string | null;
    filters: FiltersState;
    is_shared: boolean;
    user_id?: number | null;
};

export default function ActivityLogsIndex({ 
    account, 
    logs,
    filters,
    filter_options,
    saved_views,
    can_manage_shared_views,
}: { 
    account: any;
    logs: ActivityLog[];
    filters: FiltersState;
    filter_options: { types: string[]; entity_types: string[] };
    saved_views: SavedView[];
    can_manage_shared_views: boolean;
}) {
    const [previewLog, setPreviewLog] = useState<ActivityLog | null>(null);
    const [selectedPresetId, setSelectedPresetId] = useState<number | null>(null);

    const activeFilterCount = useMemo(() => {
        return ['type', 'q', 'correlation_id', 'entity_type', 'entity_id'].filter((k) => {
            const value = (filters as any)?.[k];
            return value !== undefined && value !== null && String(value).trim() !== '' && String(value) !== '0';
        }).length;
    }, [filters]);

    const applyFilters = (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const form = new FormData(e.currentTarget);
        router.get(route('app.activity-logs'), {
            type: form.get('type') || '',
            q: form.get('q') || '',
            correlation_id: form.get('correlation_id') || '',
            entity_type: form.get('entity_type') || '',
            entity_id: form.get('entity_id') || '',
        }, { preserveState: true, preserveScroll: true, replace: true });
    };

    const clearFilters = () => {
        router.get(route('app.activity-logs'), {}, { preserveState: false, preserveScroll: true });
    };

    const exportLogs = () => {
        const params = new URLSearchParams({
            type: String(filters?.type || ''),
            q: String(filters?.q || ''),
            correlation_id: String(filters?.correlation_id || ''),
            entity_type: String(filters?.entity_type || ''),
            entity_id: String(filters?.entity_id || ''),
        });
        window.location.href = `${route('app.activity-logs.export')}?${params.toString()}`;
    };

    const drillBy = (next: Record<string, string | number | null | undefined>) => {
        const payload: Record<string, string | number> = {};
        const merged = { ...(filters || {}), ...next };
        Object.entries(merged).forEach(([key, value]) => {
            if (value === null || value === undefined || String(value).trim() === '' || String(value) === '0') {
                return;
            }
            payload[key] = value as string | number;
        });
        router.get(route('app.activity-logs'), payload, { preserveState: true, preserveScroll: true });
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

        return params;
    };

    const resolveEntityLink = (log: ActivityLog): string | null => {
        const entityType = log.entity_type || '';
        const entityId = log.entity_id || 0;
        if (!entityId) return null;

        if (entityType === 'connection') return route('app.whatsapp.connections.edit', { connection: entityId });
        if (entityType === 'campaign') return route('app.broadcasts.show', { campaign: entityId });
        if (entityType === 'conversation') return route('app.whatsapp.conversations.show', { conversation: entityId });
        if (entityType === 'webhook_event') {
            const connectionId = Number(log?.metadata?.connection_id || 0);
            if (connectionId > 0) {
                return `${route('app.whatsapp.connections.webhook-diagnostics', { connection: connectionId })}?event_id=${entityId}`;
            }
        }
        return null;
    };

    const currentFilters: FiltersState = {
        type: filters?.type || '',
        q: filters?.q || '',
        correlation_id: filters?.correlation_id || '',
        entity_type: filters?.entity_type || '',
        entity_id: filters?.entity_id || undefined,
    };

    const saveCurrentFiltersAsPreset = () => {
        const name = window.prompt('Preset name');
        if (!name) return;
        const cleanName = name.trim();
        if (!cleanName) return;
        router.post(route('app.activity-logs.saved-views.store'), {
            name: cleanName,
            kind: 'preset',
            filters: currentFilters,
            is_shared: false,
        }, { preserveScroll: true });
    };

    const applySelectedPreset = () => {
        const preset = (saved_views || []).find((p) => p.id === selectedPresetId);
        if (!preset) return;
        const payload: Record<string, string | number> = {};
        Object.entries(preset.filters || {}).forEach(([key, value]) => {
            if (value === null || value === undefined || String(value).trim() === '' || String(value) === '0') return;
            payload[key] = value as string | number;
        });
        router.get(route('app.activity-logs'), payload, { preserveState: true, preserveScroll: true });
    };

    const deleteSelectedPreset = () => {
        if (!selectedPresetId) return;
        router.delete(route('app.activity-logs.saved-views.delete', { savedView: selectedPresetId }), { preserveScroll: true });
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
        router.patch(route('app.activity-logs.saved-views.update', { savedView: selectedPresetId }), {
            name: clean,
        }, { preserveScroll: true });
    };

    const toggleShareSelectedPreset = () => {
        if (!selectedPresetId) return;
        const current = (saved_views || []).find((p) => p.id === selectedPresetId);
        if (!current) return;
        router.patch(route('app.activity-logs.saved-views.update', { savedView: selectedPresetId }), {
            is_shared: !current.is_shared,
        }, { preserveScroll: true });
    };

    const getTypeBadge = (type: string) => {
        const typeMap: Record<string, { variant: 'success' | 'warning' | 'danger' | 'info' | 'default'; icon: any; label: string; color: string }> = {
            message: { variant: 'info', icon: MessageSquare, label: 'Message', color: 'blue' },
            connection_success: { variant: 'success', icon: CheckCircle, label: 'Connection', color: 'green' },
            connection_error: { variant: 'danger', icon: XCircle, label: 'Error', color: 'red' }};

        const config = typeMap[type] || { variant: 'default' as const, icon: AlertCircle, label: type, color: 'gray' };
        const Icon = config.icon;
        
        return (
            <Badge variant={config.variant} className="flex items-center gap-1.5 px-3 py-1">
                <Icon className="h-3.5 w-3.5" />
                {config.label}
            </Badge>
        );
    };

    return (
        <AppShell>
            <Head title="Activity Logs" />
            <div className="space-y-8">
                <div>
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-gray-100 dark:to-gray-300 bg-clip-text text-transparent">
                        Activity Logs
                    </h1>
                    <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                        View recent activity and events in your account
                    </p>
                </div>

                <Card className="border-0 shadow-lg">
                    <CardHeader className="border-b border-gray-100 dark:border-gray-800 bg-white/60 dark:bg-gray-900/40">
                        <div className="flex items-center justify-between gap-3">
                            <div>
                                <CardTitle className="text-base">Filters</CardTitle>
                                <CardDescription>{activeFilterCount} active</CardDescription>
                            </div>
                            <div className="flex items-center gap-2">
                                <Button type="button" variant="secondary" onClick={exportLogs}>Export CSV</Button>
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
                        <form onSubmit={applyFilters} className="mt-3 grid grid-cols-1 md:grid-cols-6 gap-3">
                            <select
                                name="type"
                                defaultValue={filters?.type || ''}
                                className="rounded-md border-gray-300 dark:border-gray-700 dark:bg-gray-900"
                            >
                                <option value="">All types</option>
                                {(filter_options?.types || []).map((type) => (
                                    <option key={type} value={type}>{type}</option>
                                ))}
                            </select>
                            <TextInput name="q" defaultValue={filters?.q || ''} placeholder="Search description/details..." />
                            <TextInput name="correlation_id" defaultValue={filters?.correlation_id || ''} placeholder="Correlation ID" />
                            <select
                                name="entity_type"
                                defaultValue={filters?.entity_type || ''}
                                className="rounded-md border-gray-300 dark:border-gray-700 dark:bg-gray-900"
                            >
                                <option value="">All entities</option>
                                {(filter_options?.entity_types || []).map((type) => (
                                    <option key={type} value={type}>{type}</option>
                                ))}
                            </select>
                            <TextInput name="entity_id" type="number" min={1} defaultValue={filters?.entity_id || ''} placeholder="Entity ID" />
                            <div className="flex items-center gap-2">
                                <Button type="submit">Apply</Button>
                                <Button type="button" variant="secondary" onClick={clearFilters}>Clear</Button>
                            </div>
                        </form>
                    </CardHeader>
                    <CardHeader className="bg-gradient-to-r from-gray-50 to-white dark:from-gray-800 dark:to-gray-900">
                        <div className="flex items-center justify-between">
                            <div>
                                <CardTitle className="text-xl font-bold flex items-center gap-2">
                                    <Activity className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                                    Recent Activity
                                </CardTitle>
                                <CardDescription className="mt-1">{logs.length} recent events</CardDescription>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="p-6">
                        {logs.length === 0 ? (
                            <div className="text-center py-16">
                                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-800 mb-4">
                                    <Activity className="h-8 w-8 text-gray-400" />
                                </div>
                                <p className="text-gray-500 dark:text-gray-400 font-medium">No activity logs found</p>
                                <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">Activity will appear here as events occur</p>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {logs.map((log, index) => (
                                    <div
                                        key={log.id}
                                        className="flex items-start gap-4 p-5 bg-gradient-to-r from-gray-50 to-white dark:from-gray-800 dark:to-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 hover:shadow-md transition-all duration-200 group"
                                    >
                                        <div className="flex-shrink-0 mt-1">
                                            <div className="h-2 w-2 rounded-full bg-blue-500"></div>
                                            {index < logs.length - 1 && (
                                                <div className="h-full w-0.5 bg-gray-200 dark:bg-gray-700 ml-0.5 mt-1"></div>
                                            )}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-3 mb-2">
                                                {getTypeBadge(log.type)}
                                                <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                                                    {log.description}
                                                </p>
                                            </div>
                                            <div className="flex flex-wrap items-center gap-2 mb-2">
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
                                            <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                                                <Clock className="h-3.5 w-3.5" />
                                                {new Date(log.created_at).toLocaleString()}
                                            </div>
                                            {Object.keys(log.metadata || {}).length > 0 && (
                                                <details className="mt-3">
                                                    <summary className="text-xs font-medium text-blue-600 dark:text-blue-400 cursor-pointer hover:text-blue-700 dark:hover:text-blue-300 transition-colors flex items-center gap-1">
                                                        <Sparkles className="h-3 w-3" />
                                                        View Details
                                                    </summary>
                                                    <pre className="mt-3 text-xs bg-gray-900 text-gray-100 p-4 rounded-lg overflow-auto max-h-48 border border-gray-700">
                                                        {JSON.stringify(log.metadata, null, 2)}
                                                    </pre>
                                                </details>
                                            )}
                                            <div className="mt-3 flex flex-wrap items-center gap-2">
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
                                                        <Button type="button" size="sm" variant="secondary">Open Entity</Button>
                                                    </Link>
                                                )}
                                                {log.correlation_id && (
                                                    <Link href={`${route('app.alerts.index')}?q=${encodeURIComponent(log.correlation_id)}`}>
                                                        <Button type="button" size="sm" variant="secondary">Related Alerts</Button>
                                                    </Link>
                                                )}
                                                {log.correlation_id && (
                                                    <Button
                                                        type="button"
                                                        size="sm"
                                                        variant="secondary"
                                                        onClick={() => {
                                                            router.post(route('app.activity-logs.saved-views.store'), {
                                                                name: `Pinned ${log.correlation_id}`,
                                                                kind: 'correlation',
                                                                correlation_id: log.correlation_id,
                                                                filters: { correlation_id: log.correlation_id },
                                                                is_shared: can_manage_shared_views,
                                                            }, { preserveScroll: true });
                                                        }}
                                                    >
                                                        Pin Correlation
                                                    </Button>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
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
                                        window.location.href = `${route('app.alerts.bundle')}?${params.toString()}`;
                                    }}
                                >
                                    Download Bundle
                                </Button>
                                {resolveEntityLink(previewLog) && (
                                    <Link href={resolveEntityLink(previewLog)!}>
                                        <Button type="button" variant="secondary">Open Entity</Button>
                                    </Link>
                                )}
                                {previewLog.correlation_id && (
                                    <Link href={`${route('app.alerts.index')}?q=${encodeURIComponent(previewLog.correlation_id)}`}>
                                        <Button type="button" variant="secondary">Related Alerts</Button>
                                    </Link>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </AppShell>
    );
}
