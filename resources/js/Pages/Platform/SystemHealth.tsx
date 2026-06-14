import { Head, router, usePage } from '@inertiajs/react';
import PlatformShell from '@/Layouts/PlatformShell';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/Components/UI/Card';
import { Badge } from '@/Components/UI/Badge';
import Button from '@/Components/UI/Button';
import { 
    CheckCircle, 
    XCircle, 
    Database, 
    HardDrive, 
    Activity,
    AlertTriangle,
    Megaphone,
    RefreshCw,
    Send,
    Trash2,
    RotateCcw,
    PlayCircle
} from 'lucide-react';
import { useConfirm } from '@/hooks/useConfirm';

interface WebhookHealth {
    total: number;
    subscribed: number;
    with_errors: number;
    recent_activity: number;
}

interface WebhookEventHealth {
    total_24h: number;
    processed_24h: number;
    skipped_24h: number;
    failed_24h: number;
    processing_24h: number;
    stuck_processing: number;
}

interface RecentWebhookEvent {
    id: number;
    account: string;
    connection: string;
    event_key: string;
    event_type: string | null;
    status: string;
    attempts: number;
    last_error: string | null;
    first_received_at: string | null;
    last_received_at: string | null;
    updated_at: string | null;
}

interface ConnectionDetail {
    id: number;
    name: string;
    account_id: number;
    waba_id?: string | null;
    phone_number_id?: string | null;
    quality_rating?: string | null;
    phone_number_status?: string | null;
    is_active: boolean;
    webhook_subscribed: boolean;
    has_error: boolean;
    last_received_at: string | null;
    last_error: string | null;
    webhook_age_minutes?: number | null;
    diagnostics?: string[];
    is_healthy: boolean;
}

interface QueueStatus {
    driver: string;
    connection: string;
    pending_jobs: number | null;
    pending_by_queue: Array<{ queue: string; count: number }>;
    required_queues?: string[];
    pending_required_queues?: string[];
    recommended_worker?: string;
    failed_jobs: number | null;
    oldest_pending_at: number | string | null;
    cron?: {
        last_status: string | null;
        last_run_at: string | null;
        last_error: string | null;
        external_url_configured: boolean;
        last_summary?: Record<string, any>;
    };
}

interface CampaignHealth {
    sending: number;
    scheduled_due: number;
    scheduled_future: number;
    stalled_sending: number;
    pending_recipients: number;
    failed_recipients: number;
    latest_campaign_activity_at: string | null;
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
    uuid: string | null;
    connection: string;
    queue: string;
    payload: any;
    exception: string;
    exception_summary?: string;
    failed_at: string;
}

interface IntegrationSyncLog {
    id: number;
    account: string;
    provider: string;
    status: string;
    trigger: string;
    started_at: string | null;
    duration_ms: number | null;
    created_count: number;
    updated_count: number;
    error_count: number;
    error_message: string | null;
}

export default function SystemHealth({
    webhook_health,
    webhook_event_health,
    recent_webhook_events = [],
    connection_details,
    queue_status,
    campaign_health,
    storage_status,
    database_status,
    recent_errors,
    integration_sync_logs = []}: {
    webhook_health: WebhookHealth;
    webhook_event_health: WebhookEventHealth;
    recent_webhook_events: RecentWebhookEvent[];
    connection_details: ConnectionDetail[];
    queue_status: QueueStatus;
    campaign_health: CampaignHealth;
    storage_status: StorageStatus;
    database_status: DatabaseStatus;
    recent_errors: RecentError[];
    integration_sync_logs: IntegrationSyncLog[];
}) {
    const { auth } = usePage().props as any;
    const confirm = useConfirm();

    const formatBytes = (bytes: number | null) => {
        if (bytes === null || bytes === 0) return '0 B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
    };

    const recoverCampaigns = () => {
        router.post(route('platform.system-health.campaigns.recover'), {}, {
            preserveScroll: true,
        });
    };
    const replayWebhookEvent = async (id: number) => {
        const confirmed = await confirm({
            title: 'Replay webhook event',
            message: 'Re-process this webhook event from its stored payload? Use this only after fixing the underlying error.',
            confirmText: 'Replay event',
            variant: 'warning',
        });
        if (confirmed) router.post(route('platform.system-health.webhooks.replay', id), {}, { preserveScroll: true });
    };

    const runQueueOnce = () => router.post(route('platform.system-health.queue.run'), {}, { preserveScroll: true });
    const retryAllFailedJobs = () => router.post(route('platform.system-health.queue.retry-all'), {}, { preserveScroll: true });
    const flushFailedJobs = async () => {
        const confirmed = await confirm({
            title: 'Flush failed jobs',
            message: 'Remove all failed job records? Retry them first if they are still needed.',
            confirmText: 'Flush failed jobs',
            variant: 'danger',
        });
        if (confirmed) router.post(route('platform.system-health.queue.flush'), {}, { preserveScroll: true });
    };
    const retryFailedJob = (id: number) => router.post(route('platform.system-health.queue.retry', id), {}, { preserveScroll: true });
    const forgetFailedJob = async (id: number) => {
        const confirmed = await confirm({
            title: 'Remove failed job',
            message: 'Remove this failed job record?',
            confirmText: 'Remove job',
            variant: 'danger',
        });
        if (confirmed) router.delete(route('platform.system-health.queue.forget', id), { preserveScroll: true });
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

    const eventStatusVariant = (status: string): 'default' | 'success' | 'warning' | 'danger' | 'info' | 'secondary' | 'outline' => {
        if (status === 'processed') return 'success';
        if (status === 'failed') return 'danger';
        if (status === 'processing') return 'warning';
        return 'default';
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
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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
                        </div>

                        <div className="mt-6 rounded-lg border border-gray-100 bg-gray-50 p-4 dark:border-waify-dark-border dark:bg-waify-dark-surface-2">
                            <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                                <div>
                                    <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">Webhook Event Processing</h3>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">Last 24 hours plus failed and stuck event detection.</p>
                                </div>
                                {webhook_event_health.stuck_processing > 0 || webhook_event_health.failed_24h > 0 ? (
                                    <Badge variant="danger">Needs attention</Badge>
                                ) : (
                                    <Badge variant="success">Stable</Badge>
                                )}
                            </div>
                            <div className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-6">
                                {[
                                    ['Total', webhook_event_health.total_24h],
                                    ['Processed', webhook_event_health.processed_24h],
                                    ['Skipped', webhook_event_health.skipped_24h],
                                    ['Failed', webhook_event_health.failed_24h],
                                    ['Processing', webhook_event_health.processing_24h],
                                    ['Stuck', webhook_event_health.stuck_processing],
                                ].map(([label, value]) => (
                                    <div key={label} className="rounded-md bg-white p-3 dark:bg-waify-dark-surface">
                                        <p className="text-xs text-gray-500 dark:text-waify-dark-text-muted">{label}</p>
                                        <p className="mt-1 text-xl font-bold text-gray-900 dark:text-waify-dark-text">{value}</p>
                                    </div>
                                ))}
                            </div>

                            {recent_webhook_events.length > 0 && (
                                <div className="mt-4 overflow-x-auto rounded-lg border border-gray-100 bg-white dark:border-waify-dark-border dark:bg-waify-dark-surface">
                                    <table className="min-w-full divide-y divide-gray-100 text-sm dark:divide-waify-dark-border">
                                        <thead>
                                            <tr className="text-left text-xs uppercase tracking-wide text-gray-500 dark:text-waify-dark-text-muted">
                                                <th className="px-3 py-2">Workspace</th>
                                                <th className="px-3 py-2">Event</th>
                                                <th className="px-3 py-2">Status</th>
                                                <th className="px-3 py-2">Attempts</th>
                                                <th className="px-3 py-2">Last seen</th>
                                                <th className="px-3 py-2">Error</th>
                                                <th className="px-3 py-2 text-right">Action</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-100 dark:divide-waify-dark-border">
                                            {recent_webhook_events.map((event) => (
                                                <tr key={event.id} className="align-top">
                                                    <td className="px-3 py-2">
                                                        <p className="font-medium text-gray-900 dark:text-waify-dark-text">{event.account}</p>
                                                        <p className="text-xs text-gray-500 dark:text-waify-dark-text-muted">{event.connection}</p>
                                                    </td>
                                                    <td className="px-3 py-2">
                                                        <p className="font-medium text-gray-900 dark:text-waify-dark-text">{event.event_type || 'event'}</p>
                                                        <p className="max-w-xs truncate text-xs text-gray-500 dark:text-waify-dark-text-muted">{event.event_key}</p>
                                                    </td>
                                                    <td className="px-3 py-2">
                                                        <Badge variant={eventStatusVariant(event.status) as any}>{event.status}</Badge>
                                                    </td>
                                                    <td className="px-3 py-2 text-gray-700 dark:text-waify-dark-text-muted">{event.attempts}</td>
                                                    <td className="px-3 py-2 text-gray-700 dark:text-waify-dark-text-muted">
                                                        {event.last_received_at ? new Date(event.last_received_at).toLocaleString() : 'Unknown'}
                                                    </td>
                                                    <td className="px-3 py-2">
                                                        <p className="max-w-sm text-xs text-red-700 dark:text-red-300">{event.last_error || 'Processing exceeded 10 minutes.'}</p>
                                                    </td>
                                                    <td className="px-3 py-2 text-right">
                                                        <Button type="button" size="sm" variant="secondary" onClick={() => replayWebhookEvent(event.id)}>
                                                            <RotateCcw className="h-3.5 w-3.5" />
                                                            Replay
                                                        </Button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>

                        {/* Connection Details */}
                        <div className="mt-6">
                            <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-3">Connection Details</h3>
                            <div className="space-y-2">
                                {connection_details.map((conn) => (
                                    <div key={conn.id} className="rounded-lg bg-gray-50 p-3 dark:bg-gray-800">
                                        <div className="flex items-start justify-between gap-4">
                                            <div className="flex min-w-0 items-start gap-3">
                                                {conn.is_healthy ? (
                                                    <CheckCircle className="mt-0.5 h-5 w-5 shrink-0 text-green-600 dark:text-green-400" />
                                                ) : (
                                                    <XCircle className="mt-0.5 h-5 w-5 shrink-0 text-red-600 dark:text-red-400" />
                                                )}
                                                <div className="min-w-0">
                                                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{conn.name}</p>
                                                    <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                                                        Workspace #{conn.account_id} · WABA {conn.waba_id || '-'} · Phone ID {conn.phone_number_id || '-'}
                                                    </p>
                                                    <div className="mt-2 flex flex-wrap gap-2">
                                                        <Badge variant={conn.webhook_subscribed ? 'success' : 'warning'}>{conn.webhook_subscribed ? 'Subscribed' : 'Not subscribed'}</Badge>
                                                        <Badge variant={conn.is_active ? 'success' : 'default'}>{conn.is_active ? 'Active' : 'Inactive'}</Badge>
                                                        {conn.quality_rating && <Badge variant="info">Quality {conn.quality_rating}</Badge>}
                                                        {conn.phone_number_status && <Badge variant="default">{conn.phone_number_status}</Badge>}
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="shrink-0 text-right">
                                                {getHealthStatus(conn.is_healthy)}
                                                <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">Last activity</p>
                                                <p className="text-xs font-medium text-gray-900 dark:text-gray-100">
                                                    {conn.last_received_at ? new Date(conn.last_received_at).toLocaleString() : 'Never'}
                                                </p>
                                            </div>
                                        </div>
                                        {(conn.diagnostics || []).length > 0 && (
                                            <div className="mt-3 rounded-md border border-red-100 bg-red-50 p-3 text-xs text-red-800 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-100">
                                                {(conn.diagnostics || []).map((item, index) => (
                                                    <p key={`${conn.id}-diag-${index}`} className={index > 0 ? 'mt-1' : ''}>{item}</p>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
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
                            {queue_status.pending_by_queue?.length > 0 && (
                                <div className="rounded-lg bg-gray-50 p-3 dark:bg-waify-dark-surface-2">
                                    <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-waify-dark-text-muted">Pending by queue</p>
                                    <div className="space-y-1.5">
                                        {queue_status.pending_by_queue.map((item) => (
                                            <div key={item.queue} className="flex items-center justify-between text-sm">
                                                <span className="text-gray-600 dark:text-waify-dark-text-muted">{item.queue}</span>
                                                <span className="font-semibold text-gray-900 dark:text-waify-dark-text">{item.count}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                            {queue_status.required_queues && (
                                <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm dark:border-amber-500/30 dark:bg-amber-500/10">
                                    <p className="font-semibold text-amber-900 dark:text-amber-100">Worker coverage</p>
                                    <p className="mt-1 text-amber-800 dark:text-amber-200">
                                        Required queues: {queue_status.required_queues.join(', ')}
                                    </p>
                                    {queue_status.pending_required_queues && queue_status.pending_required_queues.length > 0 && (
                                        <p className="mt-1 text-amber-800 dark:text-amber-200">
                                            Pending required queues: {queue_status.pending_required_queues.join(', ')}
                                        </p>
                                    )}
                                    {queue_status.recommended_worker && (
                                        <code className="mt-2 block rounded bg-white/80 px-2 py-1 text-xs text-amber-950 dark:bg-black/20 dark:text-amber-100">
                                            {queue_status.recommended_worker}
                                        </code>
                                    )}
                                </div>
                            )}
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-gray-600 dark:text-gray-400">Failed Jobs</span>
                                <Badge variant={queue_status.failed_jobs && queue_status.failed_jobs > 0 ? 'danger' : 'success'}>
                                    {queue_status.failed_jobs ?? 'N/A'}
                                </Badge>
                            </div>
                            {queue_status.cron && (
                                <div className="rounded-lg bg-gray-50 p-3 dark:bg-waify-dark-surface-2">
                                    <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-waify-dark-text-muted">External cron</p>
                                    <div className="space-y-1.5 text-sm">
                                        <div className="flex items-center justify-between">
                                            <span className="text-gray-600 dark:text-waify-dark-text-muted">Token</span>
                                            <Badge variant={queue_status.cron.external_url_configured ? 'success' : 'warning'}>
                                                {queue_status.cron.external_url_configured ? 'Configured' : 'Missing'}
                                            </Badge>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <span className="text-gray-600 dark:text-waify-dark-text-muted">Last run</span>
                                            <span className="font-medium text-gray-900 dark:text-waify-dark-text">
                                                {queue_status.cron.last_run_at ? new Date(queue_status.cron.last_run_at).toLocaleString() : 'Never'}
                                            </span>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <span className="text-gray-600 dark:text-waify-dark-text-muted">Status</span>
                                            <Badge variant={queue_status.cron.last_status === 'failed' ? 'danger' : queue_status.cron.last_status ? 'success' : 'warning'}>
                                                {queue_status.cron.last_status ?? 'Unknown'}
                                            </Badge>
                                        </div>
                                        {queue_status.cron.last_error && (
                                            <p className="rounded-md bg-red-50 p-2 text-xs text-red-700 dark:bg-red-500/10 dark:text-red-200">
                                                {queue_status.cron.last_error}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            )}
                            <div className="grid grid-cols-1 gap-2 pt-2">
                                <Button type="button" variant="secondary" size="sm" onClick={runQueueOnce}>
                                    <PlayCircle className="h-4 w-4" />
                                    Run worker once
                                </Button>
                                <Button type="button" variant="secondary" size="sm" onClick={retryAllFailedJobs}>
                                    <RotateCcw className="h-4 w-4" />
                                    Retry failed jobs
                                </Button>
                                <Button type="button" variant="danger" size="sm" onClick={flushFailedJobs}>
                                    <Trash2 className="h-4 w-4" />
                                    Flush failed jobs
                                </Button>
                            </div>
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

                <Card>
                    <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                            <CardTitle className="flex items-center gap-2">
                                <Megaphone className="h-5 w-5" />
                                Campaign Delivery Health
                            </CardTitle>
                            <CardDescription>Detects scheduled campaigns that missed their job and sending campaigns with pending recipients.</CardDescription>
                        </div>
                        <Button type="button" onClick={recoverCampaigns}>
                            <RefreshCw className="h-4 w-4" />
                            Recover campaigns
                        </Button>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-2 gap-3 md:grid-cols-6">
                            {[
                                ['Sending', campaign_health.sending],
                                ['Due scheduled', campaign_health.scheduled_due],
                                ['Future scheduled', campaign_health.scheduled_future],
                                ['Stalled', campaign_health.stalled_sending],
                                ['Pending recipients', campaign_health.pending_recipients],
                                ['Failed recipients', campaign_health.failed_recipients],
                            ].map(([label, value]) => (
                                <div key={label} className="rounded-lg border border-gray-100 bg-gray-50 p-3 dark:border-waify-dark-border dark:bg-waify-dark-surface-2">
                                    <p className="text-xs text-gray-500 dark:text-waify-dark-text-muted">{label}</p>
                                    <p className="mt-1 text-xl font-bold text-gray-900 dark:text-waify-dark-text">{value}</p>
                                </div>
                            ))}
                        </div>
                        <div className="mt-4 flex items-center gap-2 rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-800 dark:bg-emerald-500/10 dark:text-emerald-100">
                            <Send className="h-4 w-4" />
                            Cron now runs campaign recovery before processing the queue.
                        </div>
                    </CardContent>
                </Card>

                {integration_sync_logs.length > 0 && (
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Activity className="h-5 w-5" />
                                Integration Sync Logs
                            </CardTitle>
                            <CardDescription>Latest manual, scheduled, and provider webhook sync activity across workspaces.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-100 text-sm dark:divide-waify-dark-border">
                                    <thead>
                                        <tr className="text-left text-xs uppercase tracking-wide text-gray-500 dark:text-waify-dark-text-muted">
                                            <th className="px-3 py-2">Workspace</th>
                                            <th className="px-3 py-2">Provider</th>
                                            <th className="px-3 py-2">Status</th>
                                            <th className="px-3 py-2">Trigger</th>
                                            <th className="px-3 py-2">Records</th>
                                            <th className="px-3 py-2">Started</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100 dark:divide-waify-dark-border">
                                        {integration_sync_logs.map((log) => (
                                            <tr key={log.id} className="align-top">
                                                <td className="px-3 py-2 font-medium text-gray-900 dark:text-waify-dark-text">{log.account}</td>
                                                <td className="px-3 py-2 capitalize text-gray-700 dark:text-waify-dark-text-muted">{log.provider.replace(/-/g, ' ')}</td>
                                                <td className="px-3 py-2">
                                                    <Badge variant={log.status === 'success' ? 'success' : log.status === 'failed' ? 'danger' : 'warning'}>
                                                        {log.status}
                                                    </Badge>
                                                    {log.error_message && <p className="mt-1 max-w-xs text-xs text-red-600 dark:text-red-300">{log.error_message}</p>}
                                                </td>
                                                <td className="px-3 py-2 text-gray-700 dark:text-waify-dark-text-muted">{log.trigger}</td>
                                                <td className="px-3 py-2 text-gray-700 dark:text-waify-dark-text-muted">{log.created_count} created · {log.updated_count} updated · {log.error_count} errors</td>
                                                <td className="px-3 py-2 text-gray-700 dark:text-waify-dark-text-muted">{log.started_at ? new Date(log.started_at).toLocaleString() : 'Queued'}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Recent Errors */}
                {recent_errors.length > 0 && (
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <AlertTriangle className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
                                Recent Errors
                            </CardTitle>
                            <CardDescription>Failed jobs and system errors</CardDescription>
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
                                            <div className="flex flex-col items-end gap-2">
                                                <span className="text-xs text-gray-500 dark:text-gray-400">
                                                    {new Date(error.failed_at).toLocaleString()}
                                                </span>
                                                <div className="flex items-center gap-2">
                                                    <Button type="button" size="xs" variant="secondary" onClick={() => retryFailedJob(error.id)}>
                                                        <RotateCcw className="h-3.5 w-3.5" />
                                                        Retry
                                                    </Button>
                                                    <Button type="button" size="xs" variant="danger" onClick={() => forgetFailedJob(error.id)}>
                                                        <Trash2 className="h-3.5 w-3.5" />
                                                        Forget
                                                    </Button>
                                                </div>
                                            </div>
                                        </div>
                                        {error.exception_summary && (
                                            <p className="text-xs text-red-700 dark:text-red-200">{error.exception_summary}</p>
                                        )}
                                        <details className="mt-2">
                                            <summary className="text-xs text-red-600 dark:text-red-400 cursor-pointer hover:underline">
                                                View Error Details
                                            </summary>
                                            <pre className="mt-2 text-xs bg-gray-900 text-gray-100 p-2 rounded overflow-auto max-h-40">
                                                {error.exception}
                                            </pre>
                                        </details>
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
