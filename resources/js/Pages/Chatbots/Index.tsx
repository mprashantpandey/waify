import { Link, router } from '@inertiajs/react';
import AppShell from '@/Layouts/AppShell';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/Components/UI/Card';
import { Badge } from '@/Components/UI/Badge';
import Button from '@/Components/UI/Button';
import { Bot, Plus, Play, Pause, Edit, Trash2, AlertCircle, Zap, Activity, Sparkles } from 'lucide-react';
import { Head } from '@inertiajs/react';
import { useToast } from '@/hooks/useNotifications';

interface Bot {
    id: number;
    name: string;
    description: string | null;
    status: string;
    is_default: boolean;
    applies_to: {
        all_connections: boolean;
        connection_ids: number[];
    };
    version: number;
    flows_count: number;
    enabled_flows_count?: number;
    runnable_flows_count?: number;
    is_runnable?: boolean;
    executions_count: number;
    errors_count: number;
    last_run_at: string | null;
    created_at: string;
}

export default function ChatbotsIndex({
    account,
    bots}: {
    account: any;
    bots: Bot[];
}) {
    const { toast } = useToast();

    const getStatusBadge = (status: string) => {
        const statusMap: Record<string, { variant: 'success' | 'warning' | 'default'; label: string }> = {
            active: { variant: 'success', label: 'Active' },
            paused: { variant: 'warning', label: 'Paused' },
            draft: { variant: 'default', label: 'Draft' }};

        const config = statusMap[status] || { variant: 'default' as const, label: status };
        return <Badge variant={config.variant} className="px-3 py-1">{config.label}</Badge>;
    };

    const deleteBot = (botId: number, botName: string) => {
        if (!confirm(`Delete bot "${botName}"? This will also delete flows and execution logs.`)) {
            return;
        }
        router.post(route('app.chatbots.destroy.post', { bot: botId }), { _method: 'delete' }, {
            preserveScroll: true,
            onSuccess: () => toast.success('Bot deleted'),
            onError: () => toast.error('Failed to delete bot'),
        });
    };

    return (
        <AppShell>
            <Head title="Chatbots" />
            <div className="space-y-8">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-gray-100 dark:to-gray-300 bg-clip-text text-transparent">
                            Chatbots
                        </h1>
                        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                            Build automation bots for WhatsApp conversations
                        </p>
                    </div>
                    <div className="flex items-center gap-2">
                        <Link href={route('app.chatbots.executions.index', {})}>
                            <Button variant="secondary" className="rounded-xl">
                                <Activity className="h-4 w-4 mr-2" />
                                Execution Logs
                            </Button>
                        </Link>
                        <Link href={route('app.chatbots.create', {})}>
                            <Button className="bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 shadow-lg shadow-purple-500/50">
                                <Plus className="h-4 w-4 mr-2" />
                                Create Bot
                            </Button>
                        </Link>
                    </div>
                </div>

                {bots.length === 0 ? (
                    <Card className="border-0 shadow-xl">
                        <CardContent className="py-16 text-center">
                            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-purple-100 to-purple-200 dark:from-purple-900/20 dark:to-purple-800/20 mb-6">
                                <Bot className="h-10 w-10 text-purple-600 dark:text-purple-400" />
                            </div>
                            <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
                                No chatbots yet
                            </h3>
                            <p className="text-gray-500 dark:text-gray-400 mb-6 max-w-md mx-auto">
                                Create your first chatbot to automate WhatsApp conversations and improve customer engagement.
                            </p>
                            <Link href={route('app.chatbots.create', {})}>
                                <Button className="bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 shadow-lg shadow-purple-500/50">
                                    <Plus className="h-4 w-4 mr-2" />
                                    Create Your First Bot
                                </Button>
                            </Link>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {bots.map((bot) => (
                            <Card key={bot.id} className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 group overflow-hidden">
                                <CardHeader className="bg-gradient-to-r from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 pb-4">
                                    <div className="flex items-start justify-between">
                                        <div className="flex items-center gap-3 flex-1">
                                            <div className="p-2 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl group-hover:scale-110 transition-transform duration-200">
                                                <Bot className="h-5 w-5 text-white" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <CardTitle className="text-lg font-bold text-gray-900 dark:text-gray-100 truncate">
                                                    {bot.name}
                                                </CardTitle>
                                                {bot.description && (
                                                    <CardDescription className="mt-1 text-xs line-clamp-2">
                                                        {bot.description}
                                                    </CardDescription>
                                                )}
                                            </div>
                                        </div>
                                        {getStatusBadge(bot.status)}
                                    </div>
                                </CardHeader>
                                <CardContent className="p-6 space-y-4">
                                    <div className="grid grid-cols-2 gap-3">
                                        <div className="p-3 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 rounded-xl">
                                            <div className="flex items-center gap-2 mb-1">
                                                <Zap className="h-3.5 w-3.5 text-purple-600 dark:text-purple-400" />
                                                <span className="text-xs font-semibold text-gray-500 dark:text-gray-400">Flows</span>
                                            </div>
                                            <p className="text-lg font-bold text-gray-900 dark:text-gray-100">
                                                {bot.flows_count}
                                            </p>
                                        </div>
                                        <div className="p-3 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 rounded-xl">
                                            <div className="flex items-center gap-2 mb-1">
                                                <Activity className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
                                                <span className="text-xs font-semibold text-gray-500 dark:text-gray-400">Executions</span>
                                            </div>
                                            <p className="text-lg font-bold text-gray-900 dark:text-gray-100">
                                                {bot.executions_count}
                                            </p>
                                        </div>
                                    </div>

                                    {bot.status === 'active' && bot.is_runnable === false && (
                                        <div className="flex items-center gap-2 p-2 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-200 dark:border-amber-700">
                                            <AlertCircle className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                                            <span className="text-xs font-medium text-amber-800 dark:text-amber-200">
                                                Active but no runnable flow
                                            </span>
                                        </div>
                                    )}

                                    {bot.errors_count > 0 && (
                                        <div className="flex items-center gap-2 p-2 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
                                            <AlertCircle className="h-4 w-4 text-red-600 dark:text-red-400" />
                                            <span className="text-xs font-medium text-red-800 dark:text-red-200">
                                                {bot.errors_count} error{bot.errors_count !== 1 ? 's' : ''}
                                            </span>
                                        </div>
                                    )}

                                    {bot.last_run_at && (
                                        <div className="text-xs text-gray-500 dark:text-gray-400">
                                            Last run: {new Date(bot.last_run_at).toLocaleString()}
                                        </div>
                                    )}

                                    <div className="flex items-center gap-2 pt-4 border-t border-gray-200 dark:border-gray-700">
                                        <Link
                                            href={route('app.chatbots.show', { bot: bot.id })}
                                            className="flex-1"
                                        >
                                            <Button variant="secondary" className="w-full rounded-xl group-hover:bg-purple-50 dark:group-hover:bg-purple-900/20 transition-colors">
                                                <Edit className="h-4 w-4 mr-2" />
                                                Edit
                                            </Button>
                                        </Link>
                                        <Button
                                            type="button"
                                            variant="danger"
                                            className="rounded-xl"
                                            onClick={() => deleteBot(bot.id, bot.name)}
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}
            </div>
        </AppShell>
    );
}
