import { useForm, Link, router } from '@inertiajs/react';
import AppShell from '@/Layouts/AppShell';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/Components/UI/Card';
import { Badge } from '@/Components/UI/Badge';
import Button from '@/Components/UI/Button';
import TextInput from '@/Components/TextInput';
import InputLabel from '@/Components/InputLabel';
import InputError from '@/Components/InputError';
import { Bot, ArrowLeft, Plus, Play, Pause, Trash2, Sparkles, Zap, Link as LinkIcon, Save } from 'lucide-react';
import { Head } from '@inertiajs/react';
import { useToast } from '@/hooks/useNotifications';
import Checkbox from '@/Components/Checkbox';

interface Flow {
    id: number;
    name: string;
    trigger: any;
    enabled: boolean;
    priority: number;
    nodes: any[];
}

interface Bot {
    id: number;
    name: string;
    description: string | null;
    status: string;
    is_default: boolean;
    applies_to: any;
    version: number;
    flows: Flow[];
}

export default function ChatbotsShow({
    account,
    bot,
    connections}: {
    account: any;
    bot: Bot;
    connections: any[];
}) {
    const { toast } = useToast();
    const { data, setData, patch, processing, errors } = useForm({
        name: bot.name,
        description: bot.description || '',
        status: bot.status,
        applies_to: bot.applies_to});

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        patch(route('app.chatbots.update', { bot: bot.id }), {
            onSuccess: () => {
                toast.success('Bot updated successfully');
            },
            onError: () => {
                toast.error('Failed to update bot');
            }});
    };

    const getStatusBadge = (status: string) => {
        const statusMap: Record<string, { variant: 'success' | 'warning' | 'default'; label: string }> = {
            active: { variant: 'success', label: 'Active' },
            paused: { variant: 'warning', label: 'Paused' },
            draft: { variant: 'default', label: 'Draft' }};

        const config = statusMap[status] || { variant: 'default' as const, label: status };
        return <Badge variant={config.variant} className="px-3 py-1">{config.label}</Badge>;
    };

    const toggleConnection = (connectionId: number) => {
        const ids: number[] = data.applies_to.connection_ids || [];
        if (ids.includes(connectionId)) {
            setData('applies_to', {
                ...data.applies_to,
                connection_ids: ids.filter((id: number) => id !== connectionId)});
        } else {
            setData('applies_to', {
                ...data.applies_to,
                connection_ids: [...ids, connectionId]});
        }
    };

    return (
        <AppShell>
            <Head title={`${bot.name} - Chatbot`} />
            <div className="space-y-8">
                <div>
                    <Link
                        href={route('app.chatbots.index', { })}
                        className="inline-flex items-center gap-2 text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors mb-4"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        Back to Chatbots
                    </Link>
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-gray-100 dark:to-gray-300 bg-clip-text text-transparent flex items-center gap-3 mb-2">
                                <Bot className="h-8 w-8 text-purple-600 dark:text-purple-400" />
                                {bot.name}
                            </h1>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                {bot.description || 'No description'}
                            </p>
                        </div>
                        {getStatusBadge(bot.status)}
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <Card className="border-0 shadow-lg">
                        <CardHeader className="bg-gradient-to-r from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-purple-500 rounded-xl">
                                    <Bot className="h-5 w-5 text-white" />
                                </div>
                                <div>
                                    <CardTitle className="text-xl font-bold">Bot Settings</CardTitle>
                                    <CardDescription>Update your chatbot configuration</CardDescription>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="p-6 space-y-5">
                            <div>
                                <InputLabel htmlFor="name" value="Bot Name" className="text-sm font-semibold mb-2" />
                                <TextInput
                                    id="name"
                                    type="text"
                                    value={data.name}
                                    onChange={(e) => setData('name', e.target.value)}
                                    className="mt-1 rounded-xl"
                                    required
                                />
                                <InputError message={errors.name} className="mt-2" />
                            </div>

                            <div>
                                <InputLabel htmlFor="description" value="Description" className="text-sm font-semibold mb-2" />
                                <textarea
                                    id="description"
                                    value={data.description}
                                    onChange={(e) => setData('description', e.target.value)}
                                    className="mt-1 w-full rounded-xl border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500 dark:bg-gray-800 dark:border-gray-700 px-4 py-2.5"
                                    rows={3}
                                    placeholder="Describe what this bot does..."
                                />
                                <InputError message={errors.description} className="mt-2" />
                            </div>

                            <div>
                                <InputLabel htmlFor="status" value="Status" className="text-sm font-semibold mb-2" />
                                <select
                                    id="status"
                                    value={data.status}
                                    onChange={(e) => setData('status', e.target.value)}
                                    className="mt-1 w-full rounded-xl border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500 dark:bg-gray-800 dark:border-gray-700 px-4 py-2.5"
                                >
                                    <option value="draft">Draft</option>
                                    <option value="active">Active</option>
                                    <option value="paused">Paused</option>
                                </select>
                                <InputError message={errors.status} className="mt-2" />
                            </div>

                            <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                                <InputLabel value="Applies To" className="text-sm font-semibold mb-3" />
                                <div className="space-y-3">
                                    <div className="p-4 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 rounded-xl border border-gray-200 dark:border-gray-700">
                                        <label className="flex items-center gap-3 cursor-pointer">
                                            <Checkbox
                                                checked={data.applies_to.all_connections}
                                                onChange={(e) =>
                                                    setData('applies_to', {
                                                        ...data.applies_to,
                                                        all_connections: e.target.checked})
                                                }
                                            />
                                            <div>
                                                <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">All connections</span>
                                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                                                    Apply this bot to all WhatsApp connections
                                                </p>
                                            </div>
                                        </label>
                                    </div>

                                    {!data.applies_to.all_connections && (
                                        <div className="space-y-2">
                                            {connections.length === 0 ? (
                                                <p className="text-sm text-gray-500 dark:text-gray-400 p-4 bg-gray-50 dark:bg-gray-800 rounded-xl">
                                                    No connections available
                                                </p>
                                            ) : (
                                                connections.map((connection) => (
                                                    <label 
                                                        key={connection.id} 
                                                        className="flex items-center gap-3 p-3 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 hover:border-purple-300 dark:hover:border-purple-700 cursor-pointer transition-colors"
                                                    >
                                                        <Checkbox
                                                            checked={data.applies_to.connection_ids?.includes(connection.id)}
                                                            onChange={() => toggleConnection(connection.id)}
                                                        />
                                                        <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                                            {connection.name}
                                                        </span>
                                                    </label>
                                                ))
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="flex items-center justify-end gap-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                                <Button 
                                    type="submit" 
                                    disabled={processing}
                                    className="bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 shadow-lg shadow-purple-500/50 rounded-xl"
                                >
                                    {processing ? 'Saving...' : (
                                        <>
                                            <Save className="h-4 w-4 mr-2" />
                                            Save Changes
                                        </>
                                    )}
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </form>

                <Card className="border-0 shadow-lg">
                    <CardHeader className="bg-gradient-to-r from-gray-50 to-white dark:from-gray-800 dark:to-gray-900">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl">
                                    <Zap className="h-5 w-5 text-white" />
                                </div>
                                <div>
                                    <CardTitle className="text-xl font-bold">Flows</CardTitle>
                                    <CardDescription>Define when and how the bot responds</CardDescription>
                                </div>
                            </div>
                            <Button variant="secondary" size="sm" className="rounded-xl">
                                <Plus className="h-4 w-4 mr-2" />
                                Add Flow
                            </Button>
                        </div>
                    </CardHeader>
                    <CardContent className="p-6">
                        {bot.flows.length === 0 ? (
                            <div className="text-center py-12">
                                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900 mb-4">
                                    <Zap className="h-8 w-8 text-gray-400" />
                                </div>
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                                    No flows yet
                                </h3>
                                <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                                    Add a flow to define when and how the bot responds to messages.
                                </p>
                                <Button variant="secondary" className="rounded-xl">
                                    <Plus className="h-4 w-4 mr-2" />
                                    Add Your First Flow
                                </Button>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {bot.flows.map((flow) => (
                                    <div
                                        key={flow.id}
                                        className="p-5 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 hover:border-purple-300 dark:hover:border-purple-700 hover:shadow-md transition-all duration-200"
                                    >
                                        <div className="flex items-center justify-between">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-3 mb-2">
                                                    <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                                                        {flow.name}
                                                    </h3>
                                                    <Badge variant={flow.enabled ? 'success' : 'default'} className="px-2 py-1 text-xs">
                                                        {flow.enabled ? 'Enabled' : 'Disabled'}
                                                    </Badge>
                                                </div>
                                                <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
                                                    <span>Trigger: {flow.trigger.type}</span>
                                                    <span>•</span>
                                                    <span>Priority: {flow.priority}</span>
                                                    <span>•</span>
                                                    <span>Nodes: {flow.nodes.length}</span>
                                                </div>
                                            </div>
                                            <Button variant="secondary" size="sm" className="rounded-xl">
                                                Edit
                                            </Button>
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
