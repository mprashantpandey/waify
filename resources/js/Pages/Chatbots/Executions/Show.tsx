import { Link } from '@inertiajs/react';
import AppShell from '@/Layouts/AppShell';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/Components/UI/Card';
import { Badge } from '@/Components/UI/Badge';
import { ArrowLeft, CheckCircle, XCircle, Clock, AlertCircle, Activity, Bot, Zap, MessageSquare, Info } from 'lucide-react';
import { Head } from '@inertiajs/react';

interface Execution {
    id: number;
    bot: { id: number; name: string };
    flow: { id: number; name: string };
    conversation: { id: number; contact: { wa_id: string; name: string } } | null;
    status: string;
    trigger_event_id: string;
    started_at: string;
    finished_at: string | null;
    error_message: string | null;
    logs: Array<{
        node_id: number;
        type: string;
        result: string;
        reason?: string;
        data?: any;
    }>;
}

export default function ChatbotsExecutionsShow({
    workspace,
    execution,
}: {
    workspace: any;
    execution: Execution;
}) {
    const getStatusBadge = (status: string) => {
        const statusMap: Record<string, { variant: 'success' | 'danger' | 'default' | 'warning'; icon: any; label: string }> = {
            success: { variant: 'success', icon: CheckCircle, label: 'Success' },
            failed: { variant: 'danger', icon: XCircle, label: 'Failed' },
            running: { variant: 'warning', icon: Clock, label: 'Running' },
            skipped: { variant: 'default', icon: AlertCircle, label: 'Skipped' },
        };

        const config = statusMap[status] || { variant: 'default' as const, icon: AlertCircle, label: status };
        const Icon = config.icon;

        return (
            <Badge variant={config.variant} className="flex items-center gap-1.5 px-3 py-1">
                <Icon className="h-3.5 w-3.5" />
                {config.label}
            </Badge>
        );
    };

    const getLogResultBadge = (result: string) => {
        const resultMap: Record<string, { variant: 'success' | 'danger' | 'default' | 'warning'; label: string }> = {
            success: { variant: 'success', label: 'Success' },
            failed: { variant: 'danger', label: 'Failed' },
            passed: { variant: 'success', label: 'Passed' },
            skipped: { variant: 'default', label: 'Skipped' },
        };

        const config = resultMap[result] || { variant: 'default' as const, label: result };
        return <Badge variant={config.variant} className="px-2 py-1 text-xs">{config.label}</Badge>;
    };

    return (
        <AppShell>
            <Head title={`Execution #${execution.id} - Details`} />
            <div className="space-y-8">
                <div>
                    <Link
                        href={route('app.chatbots.executions.index', { workspace: workspace.slug })}
                        className="inline-flex items-center gap-2 text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors mb-4"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        Back to Executions
                    </Link>
                    <div>
                        <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-gray-100 dark:to-gray-300 bg-clip-text text-transparent">
                            Execution Details
                        </h1>
                        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                            View detailed execution logs and debug issues
                        </p>
                    </div>
                </div>

                <Card className="border-0 shadow-lg">
                    <CardHeader className="bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-blue-500 rounded-xl">
                                <Info className="h-5 w-5 text-white" />
                            </div>
                            <div>
                                <CardTitle className="text-xl font-bold">Execution Information</CardTitle>
                                <CardDescription>Basic details about this execution</CardDescription>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="p-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="p-4 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 rounded-xl">
                                <div className="flex items-center gap-2 mb-2">
                                    <Bot className="h-4 w-4 text-gray-500" />
                                    <div className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Bot</div>
                                </div>
                                <div className="font-semibold text-gray-900 dark:text-gray-100">{execution.bot.name}</div>
                            </div>
                            <div className="p-4 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 rounded-xl">
                                <div className="flex items-center gap-2 mb-2">
                                    <Zap className="h-4 w-4 text-gray-500" />
                                    <div className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Flow</div>
                                </div>
                                <div className="font-semibold text-gray-900 dark:text-gray-100">{execution.flow.name}</div>
                            </div>
                            <div className="p-4 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 rounded-xl">
                                <div className="flex items-center gap-2 mb-2">
                                    <MessageSquare className="h-4 w-4 text-gray-500" />
                                    <div className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Conversation</div>
                                </div>
                                <div className="font-semibold text-gray-900 dark:text-gray-100">
                                    {execution.conversation ? (
                                        <div>
                                            <div>{execution.conversation.contact.name || 'Unknown'}</div>
                                            <div className="text-xs text-gray-500 font-normal">{execution.conversation.contact.wa_id}</div>
                                        </div>
                                    ) : (
                                        '—'
                                    )}
                                </div>
                            </div>
                            <div className="p-4 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 rounded-xl">
                                <div className="flex items-center gap-2 mb-2">
                                    <Activity className="h-4 w-4 text-gray-500" />
                                    <div className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</div>
                                </div>
                                <div>{getStatusBadge(execution.status)}</div>
                            </div>
                            <div className="p-4 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 rounded-xl">
                                <div className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Started At</div>
                                <div className="font-semibold text-gray-900 dark:text-gray-100">
                                    {new Date(execution.started_at).toLocaleString()}
                                </div>
                            </div>
                            {execution.finished_at && (
                                <div className="p-4 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 rounded-xl">
                                    <div className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Finished At</div>
                                    <div className="font-semibold text-gray-900 dark:text-gray-100">
                                        {new Date(execution.finished_at).toLocaleString()}
                                    </div>
                                </div>
                            )}
                            <div className="p-4 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 rounded-xl">
                                <div className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Trigger Event ID</div>
                                <div className="font-mono text-sm text-gray-900 dark:text-gray-100 break-all">
                                    {execution.trigger_event_id}
                                </div>
                            </div>
                        </div>

                        {execution.error_message && (
                            <div className="mt-6 p-4 bg-gradient-to-r from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-800/20 rounded-xl border border-red-200 dark:border-red-800">
                                <div className="flex items-start gap-3">
                                    <XCircle className="h-5 w-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
                                    <div>
                                        <div className="font-semibold text-red-800 dark:text-red-200 mb-1">Error Message</div>
                                        <div className="text-sm text-red-600 dark:text-red-400">{execution.error_message}</div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>

                <Card className="border-0 shadow-lg">
                    <CardHeader className="bg-gradient-to-r from-gray-50 to-white dark:from-gray-800 dark:to-gray-900">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl">
                                <Activity className="h-5 w-5 text-white" />
                            </div>
                            <div>
                                <CardTitle className="text-xl font-bold">Execution Logs</CardTitle>
                                <CardDescription>Step-by-step execution details</CardDescription>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="p-6">
                        {execution.logs.length === 0 ? (
                            <div className="text-center py-12">
                                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-800 mb-4">
                                    <Activity className="h-8 w-8 text-gray-400" />
                                </div>
                                <p className="text-gray-500 dark:text-gray-400 font-medium">No logs available</p>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {execution.logs.map((log, index) => (
                                    <div
                                        key={index}
                                        className="p-4 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 rounded-xl border border-gray-200 dark:border-gray-700"
                                    >
                                        <div className="flex items-center justify-between mb-2">
                                            <div className="flex items-center gap-3">
                                                <div className="text-xs font-mono text-gray-500 dark:text-gray-400">
                                                    Node #{log.node_id}
                                                </div>
                                                <Badge variant="info" className="px-2 py-1 text-xs">
                                                    {log.type}
                                                </Badge>
                                            </div>
                                            {getLogResultBadge(log.result)}
                                        </div>
                                        {log.reason && (
                                            <div className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                                                <strong>Reason:</strong> {log.reason}
                                            </div>
                                        )}
                                        {log.data && (
                                            <div className="mt-2 p-2 bg-white dark:bg-gray-950 rounded-lg border border-gray-200 dark:border-gray-700">
                                                <pre className="text-xs text-gray-700 dark:text-gray-300 overflow-x-auto">
                                                    {JSON.stringify(log.data, null, 2)}
                                                </pre>
                                            </div>
                                        )}
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
