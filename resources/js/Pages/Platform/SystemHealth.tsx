import { Head } from '@inertiajs/react';
import PlatformShell from '@/Layouts/PlatformShell';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/Components/UI/Card';
import { Badge } from '@/Components/UI/Badge';
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
import { usePage, Link } from '@inertiajs/react';

interface WebhookHealth {
    total: number;
    subscribed: number;
    with_errors: number;
    recent_activity: number;
}

interface ConnectionDetail {
    id: number;
    name: string;
    account_id: number;
    is_active: boolean;
    webhook_subscribed: boolean;
    has_error: boolean;
    last_received_at: string | null;
    last_error: string | null;
    is_healthy: boolean;
}

interface QueueStatus {
    driver: string;
    connection: string;
    pending_jobs: number | null;
    failed_jobs: number | null;
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

export default function SystemHealth({
    webhook_health,
    connection_details,
    queue_status,
    storage_status,
    database_status,
    recent_errors}: {
    webhook_health: WebhookHealth;
    connection_details: ConnectionDetail[];
    queue_status: QueueStatus;
    storage_status: StorageStatus;
    database_status: DatabaseStatus;
    recent_errors: RecentError[];
}) {
    const { auth } = usePage().props as any;

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
                                                </div>
                                            )}
                                            {getHealthStatus(conn.is_healthy)}
                                        </div>
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
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-gray-600 dark:text-gray-400">Failed Jobs</span>
                                <Badge variant={queue_status.failed_jobs && queue_status.failed_jobs > 0 ? 'danger' : 'success'}>
                                    {queue_status.failed_jobs ?? 'N/A'}
                                </Badge>
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

