import { useMemo } from 'react';
import { Link, Head, useForm } from '@inertiajs/react';
import AppShell from '@/Layouts/AppShell';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/Components/UI/Card';
import Button from '@/Components/UI/Button';
import TextInput from '@/Components/TextInput';
import InputLabel from '@/Components/InputLabel';
import InputError from '@/Components/InputError';
import Checkbox from '@/Components/Checkbox';
import { ArrowLeft, Bot, MessageCircle, Search, Wrench, CheckCircle2 } from 'lucide-react';
import { useToast } from '@/hooks/useNotifications';

interface Connection {
    id: number;
    name: string;
}

type StarterFlowMode = 'guided' | 'empty';
type StarterTriggerType = 'inbound_message' | 'keyword';

export default function ChatbotsCreate({
    connections,
}: {
    account: any;
    connections: Connection[];
}) {
    const { toast } = useToast();
    const { data, setData, post, processing, errors } = useForm({
        name: '',
        description: '',
        status: 'active',
        applies_to: {
            all_connections: true,
            connection_ids: [] as number[],
        },
        starter_flow_mode: 'guided' as StarterFlowMode,
        starter_trigger_type: 'inbound_message' as StarterTriggerType,
        starter_keywords: 'hi, hello',
        starter_reply_message: 'Hi! Thanks for messaging us. A team member will get back to you shortly.',
    });

    const canSubmit = useMemo(() => {
        if (data.name.trim() === '') {
            return false;
        }
        if (!data.applies_to.all_connections && (data.applies_to.connection_ids?.length ?? 0) === 0) {
            return false;
        }
        if (data.starter_flow_mode === 'guided' && data.starter_trigger_type === 'keyword' && data.starter_keywords.trim() === '') {
            return false;
        }
        return true;
    }, [data]);

    const setQuickMode = (mode: StarterFlowMode, triggerType?: StarterTriggerType) => {
        setData('starter_flow_mode', mode);
        if (triggerType) {
            setData('starter_trigger_type', triggerType);
        }
    };

    const toggleConnection = (connectionId: number) => {
        const ids = data.applies_to.connection_ids || [];
        setData('applies_to', {
            ...data.applies_to,
            connection_ids: ids.includes(connectionId)
                ? ids.filter((id) => id !== connectionId)
                : [...ids, connectionId],
        });
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('app.chatbots.store', {}), {
            onError: () => toast.error('Please fix the highlighted fields'),
        });
    };

    return (
        <AppShell>
            <Head title="Create Chatbot" />
            <div className="space-y-6">
                <div>
                    <Link
                        href={route('app.chatbots.index', {})}
                        className="inline-flex items-center gap-2 text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors mb-4"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        Back to Chatbots
                    </Link>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Create Chatbot</h1>
                    <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                        Follow these 3 steps. A working starter flow will be created automatically.
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <Card className="border-0 shadow-sm">
                        <CardHeader>
                            <CardTitle className="text-lg">Step 1: Choose How It Starts</CardTitle>
                            <CardDescription>Pick a starter mode. You can fully edit the flow after creation.</CardDescription>
                        </CardHeader>
                        <CardContent className="grid gap-3 md:grid-cols-3">
                            <button
                                type="button"
                                onClick={() => setQuickMode('guided', 'inbound_message')}
                                className={`rounded-xl border p-4 text-left ${data.starter_flow_mode === 'guided' && data.starter_trigger_type === 'inbound_message' ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/30' : 'border-gray-200 dark:border-gray-700'}`}
                            >
                                <div className="mb-2 flex items-center gap-2 font-semibold text-gray-900 dark:text-gray-100">
                                    <MessageCircle className="h-4 w-4" />
                                    Reply To Every Message
                                </div>
                                <p className="text-sm text-gray-600 dark:text-gray-400">Best for first-time setup.</p>
                            </button>

                            <button
                                type="button"
                                onClick={() => setQuickMode('guided', 'keyword')}
                                className={`rounded-xl border p-4 text-left ${data.starter_flow_mode === 'guided' && data.starter_trigger_type === 'keyword' ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/30' : 'border-gray-200 dark:border-gray-700'}`}
                            >
                                <div className="mb-2 flex items-center gap-2 font-semibold text-gray-900 dark:text-gray-100">
                                    <Search className="h-4 w-4" />
                                    Reply On Keywords
                                </div>
                                <p className="text-sm text-gray-600 dark:text-gray-400">Trigger only for matching words.</p>
                            </button>

                            <button
                                type="button"
                                onClick={() => setQuickMode('empty')}
                                className={`rounded-xl border p-4 text-left ${data.starter_flow_mode === 'empty' ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/30' : 'border-gray-200 dark:border-gray-700'}`}
                            >
                                <div className="mb-2 flex items-center gap-2 font-semibold text-gray-900 dark:text-gray-100">
                                    <Wrench className="h-4 w-4" />
                                    Start Empty
                                </div>
                                <p className="text-sm text-gray-600 dark:text-gray-400">Create bot only. Build flow manually.</p>
                            </button>
                        </CardContent>
                    </Card>

                    <Card className="border-0 shadow-sm">
                        <CardHeader>
                            <CardTitle className="text-lg">Step 2: Bot Details</CardTitle>
                            <CardDescription>Keep it simple. You can change all of this later.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <InputLabel htmlFor="name" value="Bot Name" />
                                <TextInput
                                    id="name"
                                    type="text"
                                    value={data.name}
                                    onChange={(e) => setData('name', e.target.value)}
                                    className="mt-1"
                                    placeholder="Support Assistant"
                                    required
                                />
                                <InputError message={errors.name} className="mt-2" />
                            </div>

                            <div>
                                <InputLabel htmlFor="description" value="Description (optional)" />
                                <textarea
                                    id="description"
                                    value={data.description}
                                    onChange={(e) => setData('description', e.target.value)}
                                    className="mt-1 w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-700"
                                    rows={2}
                                    placeholder="Handles basic customer queries"
                                />
                                <InputError message={errors.description} className="mt-2" />
                            </div>

                            <div>
                                <InputLabel htmlFor="status" value="Status" />
                                <select
                                    id="status"
                                    value={data.status}
                                    onChange={(e) => setData('status', e.target.value)}
                                    className="mt-1 w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-700"
                                >
                                    <option value="active">Active</option>
                                    <option value="draft">Draft</option>
                                    <option value="paused">Paused</option>
                                </select>
                                <InputError message={errors.status} className="mt-2" />
                            </div>

                            {data.starter_flow_mode === 'guided' && (
                                <>
                                    {data.starter_trigger_type === 'keyword' && (
                                        <div>
                                            <InputLabel htmlFor="starter_keywords" value="Keywords (comma/new line separated)" />
                                            <textarea
                                                id="starter_keywords"
                                                value={data.starter_keywords}
                                                onChange={(e) => setData('starter_keywords', e.target.value)}
                                                className="mt-1 w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-700"
                                                rows={2}
                                                placeholder="hi, hello, pricing"
                                            />
                                            <InputError message={errors.starter_keywords} className="mt-2" />
                                        </div>
                                    )}

                                    <div>
                                        <InputLabel htmlFor="starter_reply_message" value="First Auto Reply" />
                                        <textarea
                                            id="starter_reply_message"
                                            value={data.starter_reply_message}
                                            onChange={(e) => setData('starter_reply_message', e.target.value)}
                                            className="mt-1 w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-700"
                                            rows={3}
                                        />
                                        <InputError message={errors.starter_reply_message} className="mt-2" />
                                    </div>
                                </>
                            )}
                        </CardContent>
                    </Card>

                    <Card className="border-0 shadow-sm">
                        <CardHeader>
                            <CardTitle className="text-lg">Step 3: Where It Applies</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <label className="flex items-center gap-3">
                                <Checkbox
                                    checked={data.applies_to.all_connections}
                                    onChange={(e) =>
                                        setData('applies_to', {
                                            ...data.applies_to,
                                            all_connections: e.target.checked,
                                        })
                                    }
                                />
                                <span className="text-sm font-medium text-gray-900 dark:text-gray-100">All WhatsApp connections</span>
                            </label>

                            {!data.applies_to.all_connections && (
                                <div className="space-y-2">
                                    {connections.length === 0 ? (
                                        <p className="rounded-md bg-yellow-50 px-3 py-2 text-sm text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-200">
                                            No active connections found. Create a connection first.
                                        </p>
                                    ) : (
                                        connections.map((connection) => (
                                            <label key={connection.id} className="flex items-center gap-3 rounded-md border border-gray-200 p-2 dark:border-gray-700">
                                                <Checkbox
                                                    checked={data.applies_to.connection_ids.includes(connection.id)}
                                                    onChange={() => toggleConnection(connection.id)}
                                                />
                                                <span className="text-sm text-gray-900 dark:text-gray-100">{connection.name}</span>
                                            </label>
                                        ))
                                    )}
                                    <InputError message={errors['applies_to.connection_ids']} className="mt-2" />
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    <Card className="border border-emerald-200 bg-emerald-50 dark:border-emerald-900 dark:bg-emerald-950/20">
                        <CardContent className="pt-6">
                            <div className="flex items-start gap-3">
                                <CheckCircle2 className="mt-0.5 h-5 w-5 text-emerald-600" />
                                <div>
                                    <p className="text-sm font-semibold text-emerald-800 dark:text-emerald-300">What happens after Create</p>
                                    <ul className="mt-1 list-disc pl-5 text-sm text-emerald-800/90 dark:text-emerald-300/90">
                                        <li>Bot is created with your selected scope.</li>
                                        <li>{data.starter_flow_mode === 'guided' ? 'A starter flow is created automatically.' : 'No flow is created yet.'}</li>
                                        <li>You are taken to the bot editor to fine tune behavior.</li>
                                    </ul>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <div className="flex items-center justify-end gap-3">
                        <Link href={route('app.chatbots.index', {})}>
                            <Button type="button" variant="secondary">Cancel</Button>
                        </Link>
                        <Button type="submit" disabled={processing || !canSubmit}>
                            <Bot className="mr-2 h-4 w-4" />
                            {processing ? 'Creating...' : 'Create Bot'}
                        </Button>
                    </div>
                </form>
            </div>
        </AppShell>
    );
}
