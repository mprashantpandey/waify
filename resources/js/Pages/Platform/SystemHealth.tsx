import { Head, router } from '@inertiajs/react';
import PlatformShell from '@/Layouts/PlatformShell';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/Components/UI/Card';
import { Badge } from '@/Components/UI/Badge';
import Button from '@/Components/UI/Button';
import { 
    CheckCircle, 
    XCircle, 
    AlertCircle, 
    Database, 
    HardDrive, 
    Activity,
    Link as LinkIcon,
    Clock,
    AlertTriangle
} from 'lucide-react';
import { usePage } from '@inertiajs/react';

interface WebhookHealth {
    total: number;
    subscribed: number;
    with_errors: number;
    recent_activity: number;
    consecutive_failures?: number;
    avg_lag_seconds?: number;
    last_processed_at?: string | null;
}

interface ConnectionDetail {
    id: number;
    name: string;
    account_id: number;
    is_active: boolean;
    webhook_subscribed: boolean;
    has_error: boolean;
    last_received_at: string | null;
    last_processed_at?: string | null;
    consecutive_failures?: number;
    last_lag_seconds?: number | null;
    last_error: string | null;
    is_healthy: boolean;
    quality_rating?: string | null;
    messaging_limit_tier?: string | null;
    health_state?: string | null;
    restriction_state?: string | null;
    warning_state?: string | null;
    health_last_synced_at?: string | null;
}

interface ConnectionHealthRiskSummary {
    total_active: number;
    restricted: number;
    warning: number;
    unknown: number;
    at_risk: Array<{
        id: number;
        name: string;
        account_id: number;
        health_state: string;
        quality_rating: string | null;
        messaging_limit_tier: string | null;
        restriction_state: string | null;
        warning_state: string | null;
        health_last_synced_at: string | null;
    }>;
}

interface QueueStatus {
    driver: string;
    connection: string;
    pending_jobs: number | null;
    failed_jobs: number | null;
    pending_by_queue: Record<string, number>;
    failed_by_queue: Record<string, number>;
}

interface StorageStatus {
    public_available: boolean;
    public_writable: boolean;
    public_size: number | null;
}

interface DatabaseStatus {
    connected: boolean;
    driver?: string;
    connection?: string;
    error?: string;
}

interface RecentError {
    id: number;
    connection: string;
    queue: string;
    payload: any;
    exception: string;
    failed_at: string;
}

interface RecentWebhookEvent {
    id: number;
    status: string;
    correlation_id: string | null;
    connection_id: number;
    connection_name: string | null;
    payload_size: number;
    replay_count: number;
    retry_count?: number;
    event_type?: string | null;
    object_type?: string | null;
    signature_valid?: boolean | null;
    error_message: string | null;
    processed_at: string | null;
    failed_at?: string | null;
    last_replayed_at: string | null;
    created_at: string | null;
}

interface ProductionReadinessCheck {
    key: string;
    label: string;
    status: 'pass' | 'warn' | 'fail';
    value: string;
    hint: string;
}

interface ProductionReadinessSummary {
    pass: number;
    warn: number;
    fail: number;
}

export default function SystemHealth({
    webhook_health,
    connection_details,
    queue_status,
    storage_status,
    database_status,
    recent_errors,
    recent_webhook_events,
    connection_health_risks,
    production_readiness,
    production_readiness_summary}: {
    webhook_health: WebhookHealth;
    connection_details: ConnectionDetail[];
    queue_status: QueueStatus;
    storage_status: StorageStatus;
    database_status: DatabaseStatus;
    recent_errors: RecentError[];
    recent_webhook_events: RecentWebhookEvent[];
    connection_health_risks: ConnectionHealthRiskSummary;
    production_readiness: ProductionReadinessCheck[];
    production_readiness_summary: ProductionReadinessSummary;
}) {
    const { auth } = usePage().props as any;

    const retryFailedJob = (id: number) => {
        router.post(route('platform.system-health.failed-jobs.retry', { id }));
    };

    const forgetFailedJob = (id: number) => {
        router.delete(route('platform.system-health.failed-jobs.forget', { id }));
    };

    const retryAllFailedJobs = () => {
        router.post(route('platform.system-health.failed-jobs.retry-all', {}));
    };

    const clearWebhookError = (connectionId: number) => {
        router.post(route('platform.system-health.connections.clear-webhook-error', { connection: connectionId }));
    };

    const replayWebhookEvent = (id: number) => {
        router.post(route('platform.system-health.webhook-events.replay', { id }));
    };

    const downloadBundle = (params: Record<string, string | number | null | undefined>) => {
        const query = new URLSearchParams();
        Object.entries(params).forEach(([key, value]) => {
            if (value !== null && value !== undefined && value !== '') {
                query.set(key, String(value));
            }
        });
        window.location.href = `${route('platform.operational-alerts.bundle')}?${query.toString()}`;
    };

    const formatBytes = (bytes: number | null) => {
        if (bytes === null || bytes === 0) return '0 B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
    };

    const getHealthStatus = (isHealthy: boolean) => {
        return isHealthy ? (
            <Badge variant="success" className="flex items-center gap-1">
                <CheckCircle className="h-3 w-3" />
                Healthy
            </Badge>
        ) : (
            <Badge variant="danger" className="flex items-center gap-1">
                <XCircle className="h-3 w-3" />
                Unhealthy
            </Badge>
        );
    };

    return (
        <PlatformShell auth={auth}>
            <Head title="System Health" />
            <div className="space-y-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">System Health</h1>
                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                        Monitor system components and infrastructure status
                    </p>
                </div>

                {/* Webhook Health Overview */}
                <Card>
                    <CardHeader>
                        <CardTitle>Webhook Health</CardTitle>
                        <CardDescription>WhatsApp webhook subscription and activity status</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
                            <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                                <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Total Connections</p>
                                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{webhook_health.total}</p>
                            </div>
                            <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                                <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Subscribed</p>
                                <p className="text-2xl font-bold text-green-600 dark:text-green-400">{webhook_health.subscribed}</p>
                            </div>
                            <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                                <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Recent Activity (24h)</p>
                                <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">{webhook_health.recent_activity}</p>
                            </div>
                            <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
                                <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">With Errors</p>
                                <p className="text-2xl font-bold text-red-600 dark:text-red-400">{webhook_health.with_errors}</p>
                            </div>
                            <div className="p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                                <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Consecutive Failures</p>
                                <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">{webhook_health.consecutive_failures ?? 0}</p>
                            </div>
                            <div className="p-4 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg">
                                <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Avg Lag</p>
                                <p className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">{webhook_health.avg_lag_seconds ?? 0}s</p>
                            </div>
                        </div>

                        {/* Connection Details */}
                        <div className="mt-6">
                            <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-3">Connection Details</h3>
                            <div className="space-y-2">
                                {connection_details.map((conn) => (
                                    <div
                                        key={conn.id}
                                        className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg"
                                    >
                                        <div className="flex items-center gap-3">
                                            {conn.is_healthy ? (
                                                <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
                                            ) : (
                                                <XCircle className="h-5 w-5 text-red-600 dark:text-red-400" />
                                            )}
                                            <div>
                                                <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                                    {conn.name}
                                                </p>
                                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                                    Tenant ID: {conn.account_id}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            {conn.last_received_at && (
                                                <div className="text-right">
                                                    <p className="text-xs text-gray-500 dark:text-gray-400">Last Activity</p>
                                                    <p className="text-xs font-medium text-gray-900 dark:text-gray-100">
                                                        {new Date(conn.last_received_at).toLocaleString()}
                                                    </p>
                                                    {conn.last_processed_at && (
                                                        <p className="text-xs text-gray-500 dark:text-gray-400">
                                                            Processed: {new Date(conn.last_processed_at).toLocaleString()}
                                                        </p>
                                                    )}
                                                    {(conn.consecutive_failures ?? 0) > 0 && (
                                                        <p className="text-xs text-red-600 dark:text-red-400">
                                                            Failures: {conn.consecutive_failures}
                                                        </p>
                                                    )}
                                                </div>
                                            )}
                                            {getHealthStatus(conn.is_healthy)}
                                            {conn.has_error && (
                                                <Button
                                                    size="sm"
                                                    variant="secondary"
                                                    onClick={() => clearWebhookError(conn.id)}
                                                >
                                                    Clear Error
                                                </Button>
                                            )}
                                            <Button
                                                size="sm"
                                                variant="secondary"
                                                onClick={() => downloadBundle({ connection_id: conn.id, account_id: conn.account_id })}
                                            >
                                                Diagnostics
                                            </Button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Connection Health Risks</CardTitle>
                        <CardDescription>Quality/tier/verification risk detection from latest health snapshots</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                                <p className="text-xs text-gray-500 dark:text-gray-400">Active</p>
                                <p className="text-xl font-semibold text-gray-900 dark:text-gray-100">{connection_health_risks.total_active}</p>
                            </div>
                            <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
                                <p className="text-xs text-red-600 dark:text-red-300">Restricted</p>
                                <p className="text-xl font-semibold text-red-700 dark:text-red-300">{connection_health_risks.restricted}</p>
                            </div>
                            <div className="p-4 bg-amber-50 dark:bg-amber-900/20 rounded-lg">
                                <p className="text-xs text-amber-600 dark:text-amber-300">Warning</p>
                                <p className="text-xl font-semibold text-amber-700 dark:text-amber-300">{connection_health_risks.warning}</p>
                            </div>
                            <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                                <p className="text-xs text-blue-600 dark:text-blue-300">Unknown</p>
                                <p className="text-xl font-semibold text-blue-700 dark:text-blue-300">{connection_health_risks.unknown}</p>
                            </div>
                        </div>

                        {connection_health_risks.at_risk.length > 0 && (
                            <div className="mt-4 space-y-2">
                                {connection_health_risks.at_risk.map((row) => (
                                    <div key={row.id} className="rounded-lg border border-amber-200 dark:border-amber-800 bg-amber-50/60 dark:bg-amber-900/20 p-3">
                                        <div className="text-sm font-medium text-amber-800 dark:text-amber-200">
                                            {row.name} (Tenant {row.account_id}) · {row.health_state.toUpperCase()}
                                        </div>
                                        <div className="text-xs text-amber-700 dark:text-amber-300">
                                            Quality: {row.quality_rating || 'Unknown'} · Tier: {row.messaging_limit_tier || 'Unknown'}
                                            {row.warning_state ? ` · Warning: ${row.warning_state}` : ''}
                                            {row.restriction_state ? ` · Restriction: ${row.restriction_state}` : ''}
                                        </div>
                                        {row.health_last_synced_at && (
                                            <div className="text-xs text-amber-700 dark:text-amber-300">
                                                Synced: {new Date(row.health_last_synced_at).toLocaleString()}
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Production Readiness</CardTitle>
                        <CardDescription>Critical configuration checks for stable production operation</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="mb-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
                            <div className="rounded-lg bg-green-50 p-3 dark:bg-green-900/20">
                                <p className="text-xs font-medium text-gray-600 dark:text-gray-400">Pass</p>
                                <p className="text-xl font-bold text-green-700 dark:text-green-300">{production_readiness_summary.pass}</p>
                            </div>
                            <div className="rounded-lg bg-yellow-50 p-3 dark:bg-yellow-900/20">
                                <p className="text-xs font-medium text-gray-600 dark:text-gray-400">Warn</p>
                                <p className="text-xl font-bold text-yellow-700 dark:text-yellow-300">{production_readiness_summary.warn}</p>
                            </div>
                            <div className="rounded-lg bg-red-50 p-3 dark:bg-red-900/20">
                                <p className="text-xs font-medium text-gray-600 dark:text-gray-400">Fail</p>
                                <p className="text-xl font-bold text-red-700 dark:text-red-300">{production_readiness_summary.fail}</p>
                            </div>
                        </div>
                        <div className="space-y-2">
                            {production_readiness.map((check) => (
                                <div key={check.key} className="flex flex-col gap-2 rounded-lg border border-gray-200 p-3 dark:border-gray-700 sm:flex-row sm:items-center sm:justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{check.label}</p>
                                        <p className="text-xs text-gray-500 dark:text-gray-400">{check.hint}</p>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className="text-xs text-gray-500 dark:text-gray-400">{check.value}</span>
                                        <Badge
                                            variant={check.status === 'pass' ? 'success' : check.status === 'warn' ? 'warning' : 'danger'}
                                        >
                                            {check.status.toUpperCase()}
                                        </Badge>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                {/* System Components */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Queue Status */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Activity className="h-5 w-5" />
                                Queue Status
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-gray-600 dark:text-gray-400">Driver</span>
                                <Badge variant="info">{queue_status.driver}</Badge>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-gray-600 dark:text-gray-400">Connection</span>
                                <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                    {queue_status.connection || 'N/A'}
                                </span>
                            </div>
                            {queue_status.pending_jobs !== null && (
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-gray-600 dark:text-gray-400">Pending Jobs</span>
                                    <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                        {queue_status.pending_jobs}
                                    </span>
                                </div>
                            )}
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-gray-600 dark:text-gray-400">Failed Jobs</span>
                                <Badge variant={queue_status.failed_jobs && queue_status.failed_jobs > 0 ? 'danger' : 'success'}>
                                    {queue_status.failed_jobs ?? 'N/A'}
                                </Badge>
                            </div>
                            {Object.keys(queue_status.pending_by_queue || {}).length > 0 && (
                                <div>
                                    <p className="text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1">Pending by Queue</p>
                                    <div className="space-y-1">
                                        {Object.entries(queue_status.pending_by_queue).map(([queueName, count]) => (
                                            <div key={`pending-${queueName}`} className="flex items-center justify-between text-xs">
                                                <span className="text-gray-500 dark:text-gray-400">{queueName}</span>
                                                <span className="font-medium text-gray-900 dark:text-gray-100">{count}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                            {Object.keys(queue_status.failed_by_queue || {}).length > 0 && (
                                <div>
                                    <p className="text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1">Failed by Queue</p>
                                    <div className="space-y-1">
                                        {Object.entries(queue_status.failed_by_queue).map(([queueName, count]) => (
                                            <div key={`failed-${queueName}`} className="flex items-center justify-between text-xs">
                                                <span className="text-gray-500 dark:text-gray-400">{queueName}</span>
                                                <span className="font-medium text-gray-900 dark:text-gray-100">{count}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Storage Status */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <HardDrive className="h-5 w-5" />
                                Storage Status
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-gray-600 dark:text-gray-400">Public Available</span>
                                {storage_status.public_available ? (
                                    <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
                                ) : (
                                    <XCircle className="h-5 w-5 text-red-600 dark:text-red-400" />
                                )}
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-gray-600 dark:text-gray-400">Public Writable</span>
                                {storage_status.public_writable ? (
                                    <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
                                ) : (
                                    <XCircle className="h-5 w-5 text-red-600 dark:text-red-400" />
                                )}
                            </div>
                            {storage_status.public_size !== null && (
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-gray-600 dark:text-gray-400">Public Size</span>
                                    <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                        {formatBytes(storage_status.public_size)}
                                    </span>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Database Status */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Database className="h-5 w-5" />
                                Database Status
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-gray-600 dark:text-gray-400">Connection</span>
                                {database_status.connected ? (
                                    <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
                                ) : (
                                    <XCircle className="h-5 w-5 text-red-600 dark:text-red-400" />
                                )}
                            </div>
                            {database_status.connected && (
                                <>
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm text-gray-600 dark:text-gray-400">Driver</span>
                                        <Badge variant="info">{database_status.driver}</Badge>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm text-gray-600 dark:text-gray-400">Database</span>
                                        <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                            {database_status.connection}
                                        </span>
                                    </div>
                                </>
                            )}
                            {database_status.error && (
                                <div className="p-2 bg-red-50 dark:bg-red-900/20 rounded text-xs text-red-600 dark:text-red-400">
                                    {database_status.error}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>

                {/* Recent Errors */}
                {recent_errors.length > 0 && (
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <AlertTriangle className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
                                Recent Errors
                            </CardTitle>
                            <CardDescription>Failed jobs and system errors</CardDescription>
                            <div className="mt-3">
                                <Button size="sm" onClick={retryAllFailedJobs}>
                                    Retry All Failed Jobs
                                </Button>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3">
                                {recent_errors.map((error) => (
                                    <div
                                        key={error.id}
                                        className="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800"
                                    >
                                        <div className="flex items-start justify-between mb-2">
                                            <div>
                                                <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                                    {error.payload?.displayName || error.payload?.job || 'Unknown Job'}
                                                </p>
                                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                                    Queue: {error.queue} | Connection: {error.connection}
                                                </p>
                                            </div>
                                            <span className="text-xs text-gray-500 dark:text-gray-400">
                                                {new Date(error.failed_at).toLocaleString()}
                                            </span>
                                        </div>
                                        <details className="mt-2">
                                            <summary className="text-xs text-red-600 dark:text-red-400 cursor-pointer hover:underline">
                                                View Error Details
                                            </summary>
                                            <pre className="mt-2 text-xs bg-gray-900 text-gray-100 p-2 rounded overflow-auto max-h-40">
                                                {error.exception}
                                            </pre>
                                        </details>
                                        <div className="mt-3 flex items-center gap-2">
                                            <Button size="sm" onClick={() => retryFailedJob(error.id)}>
                                                Retry
                                            </Button>
                                            <Button size="sm" variant="secondary" onClick={() => forgetFailedJob(error.id)}>
                                                Remove
                                            </Button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                )}

                {recent_webhook_events.length > 0 && (
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <LinkIcon className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                                Recent Webhook Events
                            </CardTitle>
                            <CardDescription>Latest webhook payload processing state with replay action</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3">
                                {recent_webhook_events.map((event) => (
                                    <div key={event.id} className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                                        <div className="flex items-start justify-between gap-4">
                                            <div>
                                                <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                                    {event.connection_name || `Connection #${event.connection_id}`}
                                                </p>
                                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                                    Event #{event.id} • {event.correlation_id || 'n/a'} • {event.payload_size} bytes
                                                </p>
                                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                                    {(event.event_type || 'unknown')} / {(event.object_type || 'unknown')} • retry {event.retry_count ?? 0}
                                                </p>
                                                {event.signature_valid === false && (
                                                    <p className="text-xs text-red-600 dark:text-red-400">
                                                        Signature validation failed
                                                    </p>
                                                )}
                                            </div>
                                            <Badge
                                                variant={event.status === 'processed' ? 'success' : event.status === 'failed' ? 'danger' : 'warning'}
                                            >
                                                {event.status}
                                            </Badge>
                                        </div>
                                        {(event.error_message || event.last_replayed_at) && (
                                            <div className="mt-2 text-xs text-gray-600 dark:text-gray-400">
                                                {event.error_message && (
                                                    <p className="text-red-600 dark:text-red-400">Error: {event.error_message}</p>
                                                )}
                                                {event.last_replayed_at && (
                                                    <p>Last replay: {new Date(event.last_replayed_at).toLocaleString()} ({event.replay_count} total)</p>
                                                )}
                                                {event.failed_at && (
                                                    <p className="text-red-600 dark:text-red-400">Failed at: {new Date(event.failed_at).toLocaleString()}</p>
                                                )}
                                            </div>
                                        )}
                                        <div className="mt-3">
                                            <div className="flex items-center gap-2">
                                                <Button size="sm" onClick={() => replayWebhookEvent(event.id)}>
                                                    Replay Event
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    variant="secondary"
                                                    onClick={() => downloadBundle({
                                                        webhook_event_id: event.id,
                                                        connection_id: event.connection_id,
                                                        correlation_id: event.correlation_id,
                                                    })}
                                                >
                                                    Diagnostics
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                )}
            </div>
        </PlatformShell>
    );
}
