import { Head, Link, router } from '@inertiajs/react';
import PlatformShell from '@/Layouts/PlatformShell';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/Components/UI/Card';
import { Badge } from '@/Components/UI/Badge';
import { Input } from '@/Components/UI/Input';
import { Label } from '@/Components/UI/Label';
import { 
    FileText, 
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
    workspace_id: number | null;
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

export default function ActivityLogs({
    logs,
    filters,
    filter_options,
}: {
    logs: PaginatedLogs;
    filters: { type?: string; workspace_id?: string };
    filter_options: { types: string[]; workspaces: Array<{ id: number; name: string }> };
}) {
    const { auth } = usePage().props as any;
    const [localFilters, setLocalFilters] = useState(filters);

    const applyFilters = () => {
        router.get(route('platform.activity-logs'), localFilters as any, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const getTypeBadge = (type: string) => {
        const typeMap: Record<string, { variant: 'success' | 'warning' | 'danger' | 'info' | 'default'; label: string }> = {
            webhook_success: { variant: 'success', label: 'Webhook' },
            webhook_error: { variant: 'danger', label: 'Webhook Error' },
            system_error: { variant: 'danger', label: 'System Error' },
            workspace_status_change: { variant: 'warning', label: 'Workspace' },
            user_action: { variant: 'info', label: 'User Action' },
            api_call: { variant: 'info', label: 'API Call' },
        };

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
                        <CardTitle className="flex items-center gap-2">
                            <Filter className="h-5 w-5" />
                            Filters
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                                <Label htmlFor="filter-workspace">Workspace</Label>
                                <select
                                    id="filter-workspace"
                                    value={localFilters.workspace_id || ''}
                                    onChange={(e) => setLocalFilters({ ...localFilters, workspace_id: e.target.value || undefined })}
                                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100"
                                >
                                    <option value="">All Workspaces</option>
                                    {filter_options.workspaces.map((workspace) => (
                                        <option key={workspace.id} value={workspace.id}>
                                            {workspace.name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div className="flex items-end">
                                <button
                                    onClick={applyFilters}
                                    className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                                >
                                    Apply Filters
                                </button>
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
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Workspace</th>
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
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        {log.workspace_id ? (
                                                            <Link
                                                                href={route('platform.workspaces.show', { workspace: log.workspace_id })}
                                                                className="flex items-center gap-1 text-sm text-blue-600 dark:text-blue-400 hover:underline"
                                                            >
                                                                <Building2 className="h-3 w-3" />
                                                                Workspace #{log.workspace_id}
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
                                                            preserveScroll: true,
                                                        });
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
        </PlatformShell>
    );
}

