import { Head } from '@inertiajs/react';
import AppShell from '@/Layouts/AppShell';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/Components/UI/Card';
import { Badge } from '@/Components/UI/Badge';
import { 
    Activity, 
    MessageSquare,
    Link as LinkIcon,
    CheckCircle,
    XCircle,
    AlertCircle,
    Clock,
    Sparkles
} from 'lucide-react';

interface ActivityLog {
    id: string;
    type: string;
    description: string;
    metadata: Record<string, any>;
    created_at: string;
}

export default function ActivityLogsIndex({ 
    workspace, 
    logs 
}: { 
    workspace: any;
    logs: ActivityLog[];
}) {
    const getTypeBadge = (type: string) => {
        const typeMap: Record<string, { variant: 'success' | 'warning' | 'danger' | 'info' | 'default'; icon: any; label: string; color: string }> = {
            message: { variant: 'info', icon: MessageSquare, label: 'Message', color: 'blue' },
            connection_success: { variant: 'success', icon: CheckCircle, label: 'Connection', color: 'green' },
            connection_error: { variant: 'danger', icon: XCircle, label: 'Error', color: 'red' },
        };

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
                        View recent activity and events in your workspace
                    </p>
                </div>

                <Card className="border-0 shadow-lg">
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
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </AppShell>
    );
}
