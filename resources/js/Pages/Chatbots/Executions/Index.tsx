import { Link } from '@inertiajs/react';
import AppShell from '@/Layouts/AppShell';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/Components/UI/Card';
import { Badge } from '@/Components/UI/Badge';
import Button from '@/Components/UI/Button';
import { ArrowLeft, Clock, CheckCircle, XCircle, AlertCircle, Activity, Eye } from 'lucide-react';
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
    duration: number | null;
}

export default function ChatbotsExecutionsIndex({
    workspace,
    executions,
}: {
    workspace: any;
    executions: {
        data: Execution[];
        links: any;
        meta: any;
    };
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

    return (
        <AppShell>
            <Head title="Execution Logs" />
            <div className="space-y-8">
                <div>
                    <Link
                        href={route('app.chatbots.index', { workspace: workspace.slug })}
                        className="inline-flex items-center gap-2 text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors mb-4"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        Back to Chatbots
                    </Link>
                    <div>
                        <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-gray-100 dark:to-gray-300 bg-clip-text text-transparent">
                            Execution Logs
                        </h1>
                        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                            View bot execution history and debug issues
                        </p>
                    </div>
                </div>

                <Card className="border-0 shadow-lg">
                    <CardHeader className="bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-blue-500 rounded-xl">
                                <Activity className="h-5 w-5 text-white" />
                            </div>
                            <div>
                                <CardTitle className="text-xl font-bold">Recent Executions</CardTitle>
                                <CardDescription>Track bot flow executions and their results</CardDescription>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="p-0">
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 border-b border-gray-200 dark:border-gray-700">
                                    <tr>
                                        <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                            Time
                                        </th>
                                        <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                            Bot / Flow
                                        </th>
                                        <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                            Conversation
                                        </th>
                                        <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                            Status
                                        </th>
                                        <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                            Duration
                                        </th>
                                        <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                            Actions
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200 dark:divide-gray-800 bg-white dark:bg-gray-900">
                                    {executions.data.length === 0 ? (
                                        <tr>
                                            <td colSpan={6} className="px-6 py-12 text-center">
                                                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-800 mb-4">
                                                    <Activity className="h-8 w-8 text-gray-400" />
                                                </div>
                                                <p className="text-gray-500 dark:text-gray-400 font-medium">No executions yet</p>
                                                <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">Bot executions will appear here</p>
                                            </td>
                                        </tr>
                                    ) : (
                                        executions.data.map((execution) => (
                                            <tr key={execution.id} className="hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                                                <td className="px-6 py-4 text-sm font-medium text-gray-900 dark:text-gray-100">
                                                    {new Date(execution.started_at).toLocaleString()}
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                                                        {execution.bot.name}
                                                    </div>
                                                    <div className="text-xs text-gray-500 dark:text-gray-400">
                                                        {execution.flow.name}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 text-sm text-gray-700 dark:text-gray-300">
                                                    {execution.conversation ? (
                                                        <div>
                                                            <div className="font-medium">{execution.conversation.contact.name || 'Unknown'}</div>
                                                            <div className="text-xs text-gray-500">{execution.conversation.contact.wa_id}</div>
                                                        </div>
                                                    ) : (
                                                        <span className="text-gray-400">—</span>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4">
                                                    {getStatusBadge(execution.status)}
                                                    {execution.error_message && (
                                                        <div className="text-xs text-red-600 dark:text-red-400 mt-1 truncate max-w-xs" title={execution.error_message}>
                                                            {execution.error_message}
                                                        </div>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4 text-sm text-gray-700 dark:text-gray-300">
                                                    {execution.duration !== null ? `${execution.duration}ms` : '—'}
                                                </td>
                                                <td className="px-6 py-4">
                                                    <Link
                                                        href={route('app.chatbots.executions.show', {
                                                            workspace: workspace.slug,
                                                            execution: execution.id,
                                                        })}
                                                    >
                                                        <Button variant="ghost" size="sm" className="rounded-xl">
                                                            <Eye className="h-4 w-4 mr-1" />
                                                            View
                                                        </Button>
                                                    </Link>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                        {executions.meta.last_page > 1 && (
                            <div className="flex justify-between items-center p-4 border-t border-gray-200 dark:border-gray-700">
                                <Button
                                    onClick={() => window.location.href = executions.links.prev}
                                    disabled={!executions.links.prev}
                                    variant="secondary"
                                    size="sm"
                                    className="rounded-xl"
                                >
                                    Previous
                                </Button>
                                <span className="text-sm text-gray-700 dark:text-gray-300">
                                    Page {executions.meta.current_page} of {executions.meta.last_page}
                                </span>
                                <Button
                                    onClick={() => window.location.href = executions.links.next}
                                    disabled={!executions.links.next}
                                    variant="secondary"
                                    size="sm"
                                    className="rounded-xl"
                                >
                                    Next
                                </Button>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </AppShell>
    );
}
