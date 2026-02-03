import { useForm, router } from '@inertiajs/react';
import AppShell from '@/Layouts/AppShell';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/Components/UI/Card';
import Button from '@/Components/UI/Button';
import TextInput from '@/Components/TextInput';
import InputLabel from '@/Components/InputLabel';
import InputError from '@/Components/InputError';
import { Bot, ArrowLeft, Sparkles, Link as LinkIcon, CheckCircle2 } from 'lucide-react';
import { Link, Head } from '@inertiajs/react';
import { useToast } from '@/hooks/useNotifications';
import Checkbox from '@/Components/Checkbox';

interface Connection {
    id: number;
    name: string;
}

export default function ChatbotsCreate({
    account,
    connections}: {
    account: any;
    connections: Connection[];
}) {
    const { toast } = useToast();
    const { data, setData, post, processing, errors } = useForm({
        name: '',
        description: '',
        status: 'draft',
        applies_to: {
            all_connections: false,
            connection_ids: [] as number[]}});

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('app.chatbots.store', {}), {
            onSuccess: () => {
                toast.success('Bot created successfully');
            },
            onError: () => {
                toast.error('Failed to create bot');
            }});
    };

    const toggleConnection = (connectionId: number) => {
        const ids = data.applies_to.connection_ids || [];
        if (ids.includes(connectionId)) {
            setData('applies_to', {
                ...data.applies_to,
                connection_ids: ids.filter((id) => id !== connectionId)});
        } else {
            setData('applies_to', {
                ...data.applies_to,
                connection_ids: [...ids, connectionId]});
        }
    };

    return (
        <AppShell>
            <Head title="Create Chatbot" />
            <div className="space-y-8">
                <div>
                    <Link
                        href={route('app.chatbots.index', {})}
                        className="inline-flex items-center gap-2 text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors mb-4"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        Back to Chatbots
                    </Link>
                    <div>
                        <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-gray-100 dark:to-gray-300 bg-clip-text text-transparent">
                            Create Chatbot
                        </h1>
                        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                            Build an automation bot for WhatsApp conversations
                        </p>
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
                                    <CardTitle className="text-xl font-bold">Bot Details</CardTitle>
                                    <CardDescription>Basic information about your chatbot</CardDescription>
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
                                    placeholder="My WhatsApp Bot"
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
                        </CardContent>
                    </Card>

                    <Card className="border-0 shadow-lg">
                        <CardHeader className="bg-gradient-to-r from-gray-50 to-white dark:from-gray-800 dark:to-gray-900">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl">
                                    <LinkIcon className="h-5 w-5 text-white" />
                                </div>
                                <div>
                                    <CardTitle className="text-xl font-bold">Applies To</CardTitle>
                                    <CardDescription>Select which connections this bot should apply to</CardDescription>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="p-6 space-y-5">
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
                                <div>
                                    <InputLabel value="Select Connections" className="text-sm font-semibold mb-3" />
                                    <div className="space-y-2">
                                        {connections.length === 0 ? (
                                            <p className="text-sm text-gray-500 dark:text-gray-400 p-4 bg-gray-50 dark:bg-gray-800 rounded-xl">
                                                No connections available. Create a connection first.
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
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    <div className="flex items-center justify-end gap-4">
                        <Link href={route('app.chatbots.index', { })}>
                            <Button type="button" variant="secondary" className="rounded-xl">
                                Cancel
                            </Button>
                        </Link>
                        <Button 
                            type="submit" 
                            disabled={processing}
                            className="bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 shadow-lg shadow-purple-500/50 rounded-xl"
                        >
                            {processing ? 'Creating...' : (
                                <>
                                    <Sparkles className="h-4 w-4 mr-2" />
                                    Create Bot
                                </>
                            )}
                        </Button>
                    </div>
                </form>
            </div>
        </AppShell>
    );
}
