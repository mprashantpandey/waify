import { useForm, Link, router } from '@inertiajs/react';
import { useMemo, useState } from 'react';
import AppShell from '@/Layouts/AppShell';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/Components/UI/Card';
import { Badge } from '@/Components/UI/Badge';
import Button from '@/Components/UI/Button';
import TextInput from '@/Components/TextInput';
import InputLabel from '@/Components/InputLabel';
import InputError from '@/Components/InputError';
import { Bot, ArrowLeft, Plus, Save, Zap, Trash2, Pencil, Settings, Workflow, Link as LinkIcon } from 'lucide-react';
import { Head } from '@inertiajs/react';
import { useToast } from '@/hooks/useNotifications';
import Checkbox from '@/Components/Checkbox';
import FlowBuilder from '@/Pages/Chatbots/FlowBuilder';

interface Node {
    id: number;
    type: string;
    config: any;
    sort_order: number;
    pos_x?: number | null;
    pos_y?: number | null;
}

interface Edge {
    id: number;
    from_node_id: number;
    to_node_id: number;
    label?: string | null;
    sort_order?: number | null;
}

interface Flow {
    id: number;
    name: string;
    trigger: any;
    enabled: boolean;
    priority: number;
    health?: {
        has_nodes: boolean;
        has_executable_node: boolean;
        has_start_node: boolean;
        has_edges: boolean;
        is_runnable: boolean;
    };
    nodes: Node[];
    edges: Edge[];
}

interface BotType {
    id: number;
    name: string;
    description: string | null;
    status: string;
    is_default: boolean;
    applies_to: any;
    stop_on_first_flow?: boolean;
    version: number;
    health?: {
        enabled_flows_count: number;
        runnable_flows_count: number;
    };
    flows: Flow[];
}

interface Connection {
    id: number;
    name: string;
}

interface Template {
    id: number;
    name: string;
    language: string;
    status: string;
}

interface Tag {
    id: number;
    name: string;
    color: string | null;
}

interface Agent {
    id: number;
    name: string;
    email: string;
    role: string;
}

const defaultFlowForm = {
    name: '',
    enabled: true,
    priority: 100,
    triggerType: 'inbound_message',
    triggerConnections: [] as number[],
    firstMessageOnly: false,
    skipIfAssigned: false,
    keywords: '',
    matchType: 'any',
    caseSensitive: false,
    wholeWord: false,
    buttonId: '',
};

const defaultNodeForm = {
    type: 'action',
    sortOrder: '' as '' | number,
    isStart: false,
    conditionType: 'text_contains',
    conditionValue: '',
    conditionCaseSensitive: false,
    regexPattern: '',
    timeWindowTimezone: 'UTC',
    timeWindowStart: '09:00',
    timeWindowEnd: '17:00',
    timeWindowDays: [1, 2, 3, 4, 5],
    conditionConnectionIds: [] as number[],
    conditionStatus: 'open',
    conditionTagId: '' as '' | number,
    conditionTagName: '',
    actionType: 'send_text',
    actionMessage: '',
    actionTemplateId: '' as '' | number,
    actionTemplateVariables: '{}',
    actionListId: '' as '' | number,
    actionButtonsJson: '[]',
    actionButtonBodyText: '',
    actionButtonHeaderText: '',
    actionButtonFooterText: '',
    actionAgentId: '' as '' | number,
    actionTagId: '' as '' | number,
    actionTagName: '',
    actionStatus: 'open',
    actionPriority: 'normal',
    delaySeconds: 60,
    webhookUrl: '',
    webhookMethod: 'POST',
    webhookTimeout: 10,
};

export default function ChatbotsShow({
    account,
    bot,
    connections,
    templates,
    tags,
    agents,
}: {
    account: any;
    bot: BotType;
    connections: Connection[];
    templates: Template[];
    tags: Tag[];
    agents: Agent[];
}) {
    const { toast } = useToast();
    const { data, setData, patch, processing, errors } = useForm({
        name: bot.name,
        description: bot.description || '',
        status: bot.status,
        applies_to: bot.applies_to,
        stop_on_first_flow: bot.stop_on_first_flow ?? true,
    });

    const [flowFormOpen, setFlowFormOpen] = useState(false);
    const [editingFlowId, setEditingFlowId] = useState<number | null>(null);
    const [flowForm, setFlowForm] = useState({ ...defaultFlowForm });

    const [nodeFormOpen, setNodeFormOpen] = useState(false);
    const [nodeFormFlowId, setNodeFormFlowId] = useState<number | null>(null);
    const [editingNodeId, setEditingNodeId] = useState<number | null>(null);
    const [nodeForm, setNodeForm] = useState({ ...defaultNodeForm });

    const [edgeFormOpen, setEdgeFormOpen] = useState(false);
    const [edgeFlowId, setEdgeFlowId] = useState<number | null>(null);
    const [edgeForm, setEdgeForm] = useState({
        id: null as null | number,
        fromNodeId: '' as '' | number,
        toNodeId: '' as '' | number,
        label: 'next',
        sortOrder: '' as '' | number,
    });

    const flowById = useMemo(() => {
        return new Map(bot.flows.map((flow) => [flow.id, flow]));
    }, [bot.flows]);

    const saveGraph = (flowId: number, payload: { nodes: Node[]; edges: Edge[] }) => {
        const flow = flowById.get(flowId);
        if (!flow) {
            return;
        }

        const nextEdges = payload.edges.map((edge, index) => ({
            from_node_id: edge.from_node_id,
            to_node_id: edge.to_node_id,
            label: edge.label ?? 'next',
            sort_order: edge.sort_order ?? index + 1,
        }));

        router.patch(
            route('app.chatbots.flows.update', { flow: flowId }),
            {
                nodes: payload.nodes.map((node, index) => ({
                    id: node.id,
                    type: node.type,
                    config: node.config,
                    sort_order: node.sort_order ?? index + 1,
                    pos_x: node.pos_x ?? null,
                    pos_y: node.pos_y ?? null,
                })),
                edges: nextEdges,
            },
            {
                preserveScroll: true,
                onError: () => toast.error('Failed to save graph'),
            }
        );
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        patch(route('app.chatbots.update', { bot: bot.id }), {
            onSuccess: () => {
            },
            onError: () => {
                toast.error('Failed to update bot');
            },
        });
    };

    const deleteBot = () => {
        if (!confirm(`Delete bot "${bot.name}"? This will also delete flows and execution logs.`)) {
            return;
        }
        router.post(route('app.chatbots.destroy.post', { bot: bot.id }), { _method: 'delete' }, {
            onError: () => toast.error('Failed to delete bot'),
        });
    };

    const getStatusBadge = (status: string) => {
        const statusMap: Record<string, { variant: 'success' | 'warning' | 'default'; label: string }> = {
            active: { variant: 'success', label: 'Active' },
            paused: { variant: 'warning', label: 'Paused' },
            draft: { variant: 'default', label: 'Draft' },
        };

        const config = statusMap[status] || { variant: 'default' as const, label: status };
        return (
            <Badge variant={config.variant} className="px-3 py-1">
                {config.label}
            </Badge>
        );
    };

    const toggleConnection = (connectionId: number) => {
        const ids: number[] = data.applies_to.connection_ids || [];
        if (ids.includes(connectionId)) {
            setData('applies_to', {
                ...data.applies_to,
                connection_ids: ids.filter((id: number) => id !== connectionId),
            });
        } else {
            setData('applies_to', {
                ...data.applies_to,
                connection_ids: [...ids, connectionId],
            });
        }
    };

    const resetFlowForm = () => {
        setFlowForm({ ...defaultFlowForm });
        setEditingFlowId(null);
        setFlowFormOpen(false);
    };

    const openEditFlow = (flow: Flow) => {
        const trigger = flow.trigger || {};
        const triggerType = trigger.type || 'inbound_message';
        setEditingFlowId(flow.id);
        setFlowFormOpen(true);
        setFlowForm({
            name: flow.name,
            enabled: flow.enabled,
            priority: flow.priority,
            triggerType,
            triggerConnections: trigger.connection_ids || [],
            firstMessageOnly: !!trigger.first_message_only,
            skipIfAssigned: !!trigger.skip_if_assigned,
            keywords: Array.isArray(trigger.keywords) ? trigger.keywords.join(', ') : '',
            matchType: trigger.match_type || 'any',
            caseSensitive: !!trigger.case_sensitive,
            wholeWord: !!trigger.whole_word,
            buttonId: trigger.button_id || '',
        });
    };

    const buildTrigger = () => {
        if (flowForm.triggerType === 'keyword') {
            const keywords = flowForm.keywords
                .split(',')
                .map((value) => value.trim())
                .filter((value) => value.length > 0);
            return {
                type: 'keyword',
                keywords,
                match_type: flowForm.matchType,
                case_sensitive: flowForm.caseSensitive,
                whole_word: flowForm.wholeWord,
            };
        }

        if (flowForm.triggerType === 'button_reply') {
            return {
                type: 'button_reply',
                button_id: flowForm.buttonId,
            };
        }

        return {
            type: 'inbound_message',
            connection_ids: flowForm.triggerConnections,
            first_message_only: flowForm.firstMessageOnly,
            skip_if_assigned: flowForm.skipIfAssigned,
        };
    };

    const submitFlow = (e: React.FormEvent) => {
        e.preventDefault();
        const payload = {
            name: flowForm.name,
            enabled: flowForm.enabled,
            priority: flowForm.priority,
            trigger: buildTrigger(),
        };

        if (editingFlowId) {
            router.patch(route('app.chatbots.flows.update', { flow: editingFlowId }), payload, {
                preserveScroll: true,
                onSuccess: () => {
                    resetFlowForm();
                },
                onError: () => {
                    toast.error('Failed to update flow');
                },
            });
        } else {
            router.post(route('app.chatbots.flows.store', { bot: bot.id }), payload, {
                preserveScroll: true,
                onSuccess: () => {
                    resetFlowForm();
                },
                onError: () => {
                    toast.error('Failed to create flow');
                },
            });
        }
    };

    const deleteFlow = (flowId: number) => {
        if (!confirm('Delete this flow?')) {
            return;
        }
        router.delete(route('app.chatbots.flows.destroy', { flow: flowId }), {
            preserveScroll: true,
            onError: () => toast.error('Failed to delete flow'),
        });
    };

    const openNodeForm = (flowId: number) => {
        setNodeFormFlowId(flowId);
        setEditingNodeId(null);
        setNodeForm({ ...defaultNodeForm });
        setNodeFormOpen(true);
    };

    const openEditNode = (flowId: number, node: Node) => {
        const config = node.config || {};
        setNodeFormFlowId(flowId);
        setEditingNodeId(node.id);
        setNodeFormOpen(true);
        setNodeForm({
            ...defaultNodeForm,
            type: node.type || 'action',
            sortOrder: node.sort_order,
            isStart: config.is_start ?? false,
            conditionType: config.type || 'text_contains',
            conditionValue: config.value || '',
            conditionCaseSensitive: !!config.case_sensitive,
            regexPattern: config.pattern || '',
            timeWindowTimezone: config.timezone || 'UTC',
            timeWindowStart: config.start_time || '09:00',
            timeWindowEnd: config.end_time || '17:00',
            timeWindowDays: config.days || [1, 2, 3, 4, 5],
            conditionConnectionIds: config.connection_ids || [],
            conditionStatus: config.status || 'open',
            conditionTagId: config.tag_ids?.[0] || '',
            conditionTagName: config.tags?.[0] || config.tag_names?.[0] || '',
            actionType: config.action_type || 'send_text',
            actionMessage: config.message || '',
            actionTemplateId: config.template_id || '',
            actionTemplateVariables: config.variables ? JSON.stringify(config.variables, null, 2) : '{}',
            actionListId: config.list_id || '',
            actionButtonsJson: config.buttons ? JSON.stringify(config.buttons, null, 2) : '[]',
            actionButtonBodyText: config.body_text || config.message || '',
            actionButtonHeaderText: config.header_text || '',
            actionButtonFooterText: config.footer_text || '',
            actionAgentId: config.agent_id || '',
            actionTagId: config.tag_id || '',
            actionTagName: config.tag || config.tag_name || '',
            actionStatus: config.status || 'open',
            actionPriority: config.priority || 'normal',
            delaySeconds: config.seconds || 60,
            webhookUrl: config.url || '',
            webhookMethod: (config.method || 'POST').toUpperCase(),
            webhookTimeout: config.timeout || 10,
        });
    };

    const closeNodeForm = () => {
        setNodeFormOpen(false);
        setNodeFormFlowId(null);
        setEditingNodeId(null);
        setNodeForm({ ...defaultNodeForm });
    };

    const buildNodeConfig = () => {
        if (nodeForm.type === 'condition') {
            const base: any = {
                type: nodeForm.conditionType,
            };

            if (['text_contains', 'text_equals', 'text_starts_with'].includes(nodeForm.conditionType)) {
                base.value = nodeForm.conditionValue;
                base.case_sensitive = nodeForm.conditionCaseSensitive;
            }

            if (nodeForm.conditionType === 'regex_match') {
                base.pattern = nodeForm.regexPattern;
            }

            if (nodeForm.conditionType === 'time_window') {
                base.timezone = nodeForm.timeWindowTimezone;
                base.start_time = nodeForm.timeWindowStart;
                base.end_time = nodeForm.timeWindowEnd;
                base.days = nodeForm.timeWindowDays;
            }

            if (nodeForm.conditionType === 'connection_is') {
                base.connection_ids = nodeForm.conditionConnectionIds;
            }

            if (nodeForm.conditionType === 'conversation_status') {
                base.status = nodeForm.conditionStatus;
            }

            if (nodeForm.conditionType === 'tags_contains') {
                if (nodeForm.conditionTagId) {
                    base.tag_ids = [nodeForm.conditionTagId];
                } else if (nodeForm.conditionTagName) {
                    base.tag_names = [nodeForm.conditionTagName];
                }
            }

            if (nodeForm.isStart) {
                base.is_start = true;
            }

            return base;
        }

        if (nodeForm.type === 'delay') {
            const config: any = { seconds: Number(nodeForm.delaySeconds) || 1 };
            if (nodeForm.isStart) {
                config.is_start = true;
            }
            return config;
        }

        if (nodeForm.type === 'webhook') {
            const config: any = {
                url: nodeForm.webhookUrl,
                method: nodeForm.webhookMethod,
                timeout: Number(nodeForm.webhookTimeout) || 10,
            };
            if (nodeForm.isStart) {
                config.is_start = true;
            }
            return config;
        }

        const actionConfig: any = {
            action_type: nodeForm.actionType,
        };

        if (nodeForm.actionType === 'send_text') {
            actionConfig.message = nodeForm.actionMessage;
        }

        if (nodeForm.actionType === 'send_template') {
            actionConfig.template_id = nodeForm.actionTemplateId;
            if (nodeForm.actionTemplateVariables) {
                try {
                    actionConfig.variables = JSON.parse(nodeForm.actionTemplateVariables);
                } catch (error) {
                    toast.error('Template variables must be valid JSON');
                    throw error;
                }
            }
        }

        if (nodeForm.actionType === 'send_list') {
            actionConfig.list_id = Number(nodeForm.actionListId);
        }

        if (nodeForm.actionType === 'send_buttons') {
            actionConfig.body_text = nodeForm.actionButtonBodyText;
            actionConfig.header_text = nodeForm.actionButtonHeaderText || null;
            actionConfig.footer_text = nodeForm.actionButtonFooterText || null;
            try {
                actionConfig.buttons = JSON.parse(nodeForm.actionButtonsJson || '[]');
            } catch (error) {
                toast.error('Buttons must be valid JSON');
                throw error;
            }
        }

        if (nodeForm.actionType === 'assign_agent') {
            actionConfig.agent_id = nodeForm.actionAgentId;
        }

        if (nodeForm.actionType === 'add_tag') {
            if (nodeForm.actionTagId) {
                actionConfig.tag_id = nodeForm.actionTagId;
            }
            if (nodeForm.actionTagName) {
                actionConfig.tag = nodeForm.actionTagName;
            }
        }

        if (nodeForm.actionType === 'set_status') {
            actionConfig.status = nodeForm.actionStatus;
        }

        if (nodeForm.actionType === 'set_priority') {
            actionConfig.priority = nodeForm.actionPriority;
        }

        if (nodeForm.isStart) {
            actionConfig.is_start = true;
        }

        return actionConfig;
    };

    const submitNode = (e: React.FormEvent) => {
        e.preventDefault();
        if (!nodeFormFlowId) {
            return;
        }

        let config;
        try {
            config = buildNodeConfig();
        } catch (error) {
            return;
        }

        const payload = {
            type: nodeForm.type,
            config,
            sort_order: nodeForm.sortOrder === '' ? undefined : nodeForm.sortOrder,
        };

        if (editingNodeId) {
            router.patch(route('app.chatbots.nodes.update', { node: editingNodeId }), payload, {
                preserveScroll: true,
                onSuccess: () => {
                    closeNodeForm();
                },
                onError: () => toast.error('Failed to update node'),
            });
        } else {
            router.post(route('app.chatbots.nodes.store', { flow: nodeFormFlowId }), payload, {
                preserveScroll: true,
                onSuccess: () => {
                    closeNodeForm();
                },
                onError: () => toast.error('Failed to add node'),
            });
        }
    };

    const deleteNode = (nodeId: number) => {
        if (!confirm('Delete this node?')) {
            return;
        }
        router.delete(route('app.chatbots.nodes.destroy', { node: nodeId }), {
            preserveScroll: true,
            onError: () => toast.error('Failed to delete node'),
        });
    };

    const openEdgeForm = (flowId: number, edge?: Edge) => {
        const flow = flowById.get(flowId);
        const nodes = flow?.nodes || [];
        setEdgeFlowId(flowId);
        setEdgeFormOpen(true);
        setEdgeForm({
            id: edge?.id ?? null,
            fromNodeId: edge?.from_node_id ?? nodes[0]?.id ?? '',
            toNodeId: edge?.to_node_id ?? nodes[1]?.id ?? '',
            label: edge?.label ?? 'next',
            sortOrder: edge?.sort_order ?? '',
        });
    };

    const closeEdgeForm = () => {
        setEdgeFormOpen(false);
        setEdgeFlowId(null);
        setEdgeForm({ id: null, fromNodeId: '', toNodeId: '', label: 'next', sortOrder: '' });
    };

    const saveEdge = () => {
        if (!edgeFlowId) {
            return;
        }
        const flow = flowById.get(edgeFlowId);
        if (!flow) {
            return;
        }
        const updatedEdges = [...(flow.edges || [])];
        const existingIndex = updatedEdges.findIndex((edge) => edge.id === edgeForm.id);
        const edgePayload = {
            id: edgeForm.id ?? Date.now(),
            from_node_id: edgeForm.fromNodeId,
            to_node_id: edgeForm.toNodeId,
            label: edgeForm.label || 'next',
            sort_order: edgeForm.sortOrder === '' ? undefined : edgeForm.sortOrder,
        } as Edge;

        if (existingIndex >= 0) {
            updatedEdges[existingIndex] = edgePayload;
        } else {
            updatedEdges.push(edgePayload);
        }

        router.patch(
            route('app.chatbots.flows.update', { flow: edgeFlowId }),
            {
                edges: updatedEdges.map((edge, index) => ({
                    from_node_id: edge.from_node_id,
                    to_node_id: edge.to_node_id,
                    label: edge.label,
                    sort_order: edge.sort_order ?? index + 1,
                })),
            },
            {
                preserveScroll: true,
                onSuccess: () => {
                    closeEdgeForm();
                },
                onError: () => toast.error('Failed to save edge'),
            }
        );
    };

    return (
        <AppShell>
            <Head title={`${bot.name} - Chatbot`} />
            <div className="space-y-8">
                <div>
                    <Link
                        href={route('app.chatbots.index', {})}
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
                        <div className="flex items-center gap-3">
                            {getStatusBadge(bot.status)}
                            <Button
                                type="button"
                                variant="danger"
                                className="rounded-xl"
                                onClick={deleteBot}
                            >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Delete Bot
                            </Button>
                        </div>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {data.status === 'active' && (bot.health?.runnable_flows_count ?? 0) === 0 && (
                        <Card className="border border-amber-200 dark:border-amber-700 bg-amber-50 dark:bg-amber-900/20 shadow-none">
                            <CardContent className="p-4">
                                <div className="text-sm font-medium text-amber-800 dark:text-amber-100">
                                    This bot is active but has no runnable flow.
                                </div>
                                <div className="text-xs text-amber-700 dark:text-amber-200 mt-1">
                                    Add an enabled flow with at least one executable node (`action`, `delay`, or `webhook`).
                                </div>
                            </CardContent>
                        </Card>
                    )}

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
                                                        all_connections: e.target.checked,
                                                    })
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

                            <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                                <label className="flex items-center gap-3 cursor-pointer p-4 bg-gray-50 dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
                                    <Checkbox
                                        checked={data.stop_on_first_flow}
                                        onChange={(e) => setData('stop_on_first_flow', e.target.checked)}
                                    />
                                    <div>
                                        <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">Stop on first flow</span>
                                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                                            When a flow’s trigger matches, run only that flow and skip the rest for this message
                                        </p>
                                    </div>
                                </label>
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
                                    <Workflow className="h-5 w-5 text-white" />
                                </div>
                                <div>
                                    <CardTitle className="text-xl font-bold">Flows</CardTitle>
                                    <CardDescription>Define when and how the bot responds</CardDescription>
                                </div>
                            </div>
                            <Button
                                variant="secondary"
                                size="sm"
                                className="rounded-xl"
                                onClick={() => {
                                    setFlowFormOpen(!flowFormOpen);
                                    if (!flowFormOpen) {
                                        setEditingFlowId(null);
                                        setFlowForm({ ...defaultFlowForm });
                                    }
                                }}
                            >
                                <Plus className="h-4 w-4 mr-2" />
                                {flowFormOpen ? 'Close' : 'Add Flow'}
                            </Button>
                        </div>
                    </CardHeader>
                    <CardContent className="p-6 space-y-6">
                        {flowFormOpen && (
                            <form onSubmit={submitFlow} className="space-y-4 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
                                <div className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-300">
                                    <Settings className="h-4 w-4" />
                                    {editingFlowId ? 'Edit Flow' : 'Create Flow'}
                                </div>
                                <div>
                                    <InputLabel value="Flow Name" className="text-sm font-semibold mb-2" />
                                    <TextInput
                                        value={flowForm.name}
                                        onChange={(e) => setFlowForm({ ...flowForm, name: e.target.value })}
                                        className="mt-1 rounded-xl"
                                        required
                                    />
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div>
                                        <InputLabel value="Priority" className="text-sm font-semibold mb-2" />
                                        <TextInput
                                            type="number"
                                            value={flowForm.priority}
                                            onChange={(e) => setFlowForm({ ...flowForm, priority: Number(e.target.value) })}
                                            className="mt-1 rounded-xl"
                                        />
                                    </div>
                                    <div className="flex items-center gap-3 pt-7">
                                        <Checkbox
                                            checked={flowForm.enabled}
                                            onChange={(e) => setFlowForm({ ...flowForm, enabled: e.target.checked })}
                                        />
                                        <span className="text-sm text-gray-700 dark:text-gray-300">Enabled</span>
                                    </div>
                                </div>
                                <div>
                                    <InputLabel value="Trigger Type" className="text-sm font-semibold mb-2" />
                                    <select
                                        value={flowForm.triggerType}
                                        onChange={(e) => setFlowForm({ ...flowForm, triggerType: e.target.value })}
                                        className="mt-1 w-full rounded-xl border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-700 px-4 py-2.5"
                                    >
                                        <option value="inbound_message">Inbound message</option>
                                        <option value="keyword">Keyword match</option>
                                        <option value="button_reply">Button reply</option>
                                    </select>
                                </div>

                                {flowForm.triggerType === 'inbound_message' && (
                                    <div className="space-y-3 rounded-xl border border-gray-200 dark:border-gray-700 p-3">
                                        <div className="flex items-center gap-3">
                                            <Checkbox
                                                checked={flowForm.firstMessageOnly}
                                                onChange={(e) => setFlowForm({ ...flowForm, firstMessageOnly: e.target.checked })}
                                            />
                                            <span className="text-sm text-gray-700 dark:text-gray-300">Only first inbound message</span>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <Checkbox
                                                checked={flowForm.skipIfAssigned}
                                                onChange={(e) => setFlowForm({ ...flowForm, skipIfAssigned: e.target.checked })}
                                            />
                                            <span className="text-sm text-gray-700 dark:text-gray-300">Skip if already assigned</span>
                                        </div>
                                        <div>
                                            <InputLabel value="Connections (optional)" className="text-sm font-semibold mb-2" />
                                            <div className="space-y-2">
                                                {connections.length === 0 && (
                                                    <p className="text-xs text-gray-500">No connections available</p>
                                                )}
                                                {connections.map((connection) => (
                                                    <label key={connection.id} className="flex items-center gap-3 text-sm text-gray-700 dark:text-gray-300">
                                                        <Checkbox
                                                            checked={flowForm.triggerConnections.includes(connection.id)}
                                                            onChange={(e) => {
                                                                const ids = flowForm.triggerConnections.includes(connection.id)
                                                                    ? flowForm.triggerConnections.filter((id) => id !== connection.id)
                                                                    : [...flowForm.triggerConnections, connection.id];
                                                                setFlowForm({ ...flowForm, triggerConnections: ids });
                                                            }}
                                                        />
                                                        {connection.name}
                                                    </label>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {flowForm.triggerType === 'keyword' && (
                                    <div className="space-y-3 rounded-xl border border-gray-200 dark:border-gray-700 p-3">
                                        <div>
                                            <InputLabel value="Keywords (comma separated)" className="text-sm font-semibold mb-2" />
                                            <TextInput
                                                value={flowForm.keywords}
                                                onChange={(e) => setFlowForm({ ...flowForm, keywords: e.target.value })}
                                                className="mt-1 rounded-xl"
                                                placeholder="pricing, demo, help"
                                            />
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div>
                                                <InputLabel value="Match Type" className="text-sm font-semibold mb-2" />
                                                <select
                                                    value={flowForm.matchType}
                                                    onChange={(e) => setFlowForm({ ...flowForm, matchType: e.target.value })}
                                                    className="mt-1 w-full rounded-xl border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-700 px-4 py-2.5"
                                                >
                                                    <option value="any">Any keyword</option>
                                                    <option value="all">All keywords</option>
                                                </select>
                                            </div>
                                            <div className="flex items-center gap-3 pt-7">
                                                <Checkbox
                                                    checked={flowForm.caseSensitive}
                                                    onChange={(e) => setFlowForm({ ...flowForm, caseSensitive: e.target.checked })}
                                                />
                                                <span className="text-sm text-gray-700 dark:text-gray-300">Case sensitive</span>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <Checkbox
                                                    checked={flowForm.wholeWord}
                                                    onChange={(e) => setFlowForm({ ...flowForm, wholeWord: e.target.checked })}
                                                />
                                                <span className="text-sm text-gray-700 dark:text-gray-300">Whole word match</span>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {flowForm.triggerType === 'button_reply' && (
                                    <div className="space-y-3 rounded-xl border border-gray-200 dark:border-gray-700 p-3">
                                        <InputLabel value="Button Reply ID" className="text-sm font-semibold mb-2" />
                                        <TextInput
                                            value={flowForm.buttonId}
                                            onChange={(e) => setFlowForm({ ...flowForm, buttonId: e.target.value })}
                                            className="mt-1 rounded-xl"
                                            placeholder="button_1"
                                        />
                                    </div>
                                )}

                                <div className="flex items-center gap-3">
                                    <Button type="submit" className="rounded-xl">
                                        {editingFlowId ? 'Update Flow' : 'Create Flow'}
                                    </Button>
                                    <Button type="button" variant="secondary" className="rounded-xl" onClick={resetFlowForm}>
                                        Cancel
                                    </Button>
                                </div>
                            </form>
                        )}

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
                            </div>
                        ) : (
                            <div className="space-y-6">
                                {bot.flows.map((flow) => (
                                    <div
                                        key={flow.id}
                                        className="rounded-xl border border-gray-200 dark:border-gray-700 p-4"
                                    >
                                        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                                            <div>
                                                <div className="flex items-center gap-3 mb-1">
                                                    <h3 className="font-semibold text-gray-900 dark:text-gray-100">{flow.name}</h3>
                                                    <Badge variant={flow.enabled ? 'success' : 'default'} className="px-2 py-1 text-xs">
                                                        {flow.enabled ? 'Enabled' : 'Disabled'}
                                                    </Badge>
                                                </div>
                                                <div className="text-xs text-gray-500 dark:text-gray-400">
                                                    Trigger: {flow.trigger?.type || 'inbound_message'} • Priority: {flow.priority}
                                                </div>
                                                {flow.enabled && flow.health && !flow.health.is_runnable && (
                                                    <div className="text-xs text-amber-600 dark:text-amber-300 mt-1">
                                                        Not runnable: add at least one executable node.
                                                    </div>
                                                )}
                                            </div>
                                            <div className="flex flex-wrap gap-2">
                                                <Button
                                                    variant="secondary"
                                                    size="sm"
                                                    className="rounded-xl"
                                                    onClick={() => openEditFlow(flow)}
                                                >
                                                    <Pencil className="h-4 w-4 mr-1" />
                                                    Edit
                                                </Button>
                                                <Button
                                                    variant="secondary"
                                                    size="sm"
                                                    className="rounded-xl"
                                                    onClick={() => openNodeForm(flow.id)}
                                                >
                                                    <Plus className="h-4 w-4 mr-1" />
                                                    Add Node
                                                </Button>
                                                <Button
                                                    variant="secondary"
                                                    size="sm"
                                                    className="rounded-xl"
                                                    onClick={() => openEdgeForm(flow.id)}
                                                >
                                                    <LinkIcon className="h-4 w-4 mr-1" />
                                                    Add Edge
                                                </Button>
                                                <Button
                                                    variant="danger"
                                                    size="sm"
                                                    className="rounded-xl"
                                                    onClick={() => deleteFlow(flow.id)}
                                                >
                                                    <Trash2 className="h-4 w-4 mr-1" />
                                                    Delete
                                                </Button>
                                            </div>
                                        </div>

                                        <div className="mt-4 space-y-2">
                                            <FlowBuilder
                                                flow={flow}
                                                onEditNode={(node) => openEditNode(flow.id, node)}
                                                onAddNode={() => openNodeForm(flow.id)}
                                                onDeleteNode={(nodeId) => deleteNode(nodeId)}
                                                onSelectEdge={(edge) => openEdgeForm(flow.id, edge)}
                                                onSaveGraph={(payload) => saveGraph(flow.id, payload)}
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>

                {nodeFormOpen && nodeFormFlowId && (
                    <Card className="border-0 shadow-lg">
                        <CardHeader className="bg-gradient-to-r from-gray-50 to-white dark:from-gray-800 dark:to-gray-900">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl">
                                    <LinkIcon className="h-5 w-5 text-white" />
                                </div>
                                <div>
                                    <CardTitle className="text-xl font-bold">{editingNodeId ? 'Edit Node' : 'Add Node'}</CardTitle>
                                    <CardDescription>Configure bot behavior step</CardDescription>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="p-6">
                            <form onSubmit={submitNode} className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <InputLabel value="Node Type" className="text-sm font-semibold mb-2" />
                                        <select
                                            value={nodeForm.type}
                                            onChange={(e) => setNodeForm({ ...nodeForm, type: e.target.value })}
                                            className="mt-1 w-full rounded-xl border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-700 px-4 py-2.5"
                                        >
                                            <option value="action">Action</option>
                                            <option value="condition">Condition</option>
                                            <option value="delay">Delay</option>
                                            <option value="webhook">Webhook</option>
                                        </select>
                                    </div>
                                    <div>
                                        <InputLabel value="Sort Order" className="text-sm font-semibold mb-2" />
                                        <TextInput
                                            type="number"
                                            value={nodeForm.sortOrder}
                                            onChange={(e) =>
                                                setNodeForm({
                                                    ...nodeForm,
                                                    sortOrder: e.target.value === '' ? '' : Number(e.target.value),
                                                })
                                            }
                                            className="mt-1 rounded-xl"
                                        />
                                    </div>
                                </div>

                                <label className="flex items-center gap-3 text-sm text-gray-700 dark:text-gray-300">
                                    <Checkbox
                                        checked={nodeForm.isStart}
                                        onChange={(e) => setNodeForm({ ...nodeForm, isStart: e.target.checked })}
                                    />
                                    Mark as start node
                                </label>

                                {nodeForm.type === 'condition' && (
                                    <div className="space-y-4 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
                                        <InputLabel value="Condition Type" className="text-sm font-semibold mb-2" />
                                        <select
                                            value={nodeForm.conditionType}
                                            onChange={(e) => setNodeForm({ ...nodeForm, conditionType: e.target.value })}
                                            className="mt-1 w-full rounded-xl border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-700 px-4 py-2.5"
                                        >
                                            <option value="text_contains">Text contains</option>
                                            <option value="text_equals">Text equals</option>
                                            <option value="text_starts_with">Text starts with</option>
                                            <option value="regex_match">Regex match</option>
                                            <option value="time_window">Time window</option>
                                            <option value="connection_is">Connection is</option>
                                            <option value="conversation_status">Conversation status</option>
                                            <option value="tags_contains">Contact has tag</option>
                                        </select>

                                        {['text_contains', 'text_equals', 'text_starts_with'].includes(nodeForm.conditionType) && (
                                            <div className="space-y-2">
                                                <TextInput
                                                    value={nodeForm.conditionValue}
                                                    onChange={(e) => setNodeForm({ ...nodeForm, conditionValue: e.target.value })}
                                                    className="mt-1 rounded-xl"
                                                    placeholder="Enter value"
                                                />
                                                <label className="flex items-center gap-3 text-sm text-gray-700 dark:text-gray-300">
                                                    <Checkbox
                                                        checked={nodeForm.conditionCaseSensitive}
                                                        onChange={(e) => setNodeForm({ ...nodeForm, conditionCaseSensitive: e.target.checked })}
                                                    />
                                                    Case sensitive
                                                </label>
                                            </div>
                                        )}

                                        {nodeForm.conditionType === 'regex_match' && (
                                            <TextInput
                                                value={nodeForm.regexPattern}
                                                onChange={(e) => setNodeForm({ ...nodeForm, regexPattern: e.target.value })}
                                                className="mt-1 rounded-xl"
                                                placeholder="/pattern/"
                                            />
                                        )}

                                        {nodeForm.conditionType === 'time_window' && (
                                            <div className="space-y-3">
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                    <TextInput
                                                        value={nodeForm.timeWindowTimezone}
                                                        onChange={(e) => setNodeForm({ ...nodeForm, timeWindowTimezone: e.target.value })}
                                                        className="mt-1 rounded-xl"
                                                        placeholder="Timezone (e.g. UTC)"
                                                    />
                                                    <TextInput
                                                        value={nodeForm.timeWindowStart}
                                                        onChange={(e) => setNodeForm({ ...nodeForm, timeWindowStart: e.target.value })}
                                                        className="mt-1 rounded-xl"
                                                        placeholder="Start (HH:MM)"
                                                    />
                                                    <TextInput
                                                        value={nodeForm.timeWindowEnd}
                                                        onChange={(e) => setNodeForm({ ...nodeForm, timeWindowEnd: e.target.value })}
                                                        className="mt-1 rounded-xl"
                                                        placeholder="End (HH:MM)"
                                                    />
                                                </div>
                                                <div className="flex flex-wrap gap-3 text-sm text-gray-700 dark:text-gray-300">
                                                    {[
                                                        { label: 'Sun', value: 0 },
                                                        { label: 'Mon', value: 1 },
                                                        { label: 'Tue', value: 2 },
                                                        { label: 'Wed', value: 3 },
                                                        { label: 'Thu', value: 4 },
                                                        { label: 'Fri', value: 5 },
                                                        { label: 'Sat', value: 6 },
                                                    ].map((day) => (
                                                        <label key={day.value} className="flex items-center gap-2">
                                                            <Checkbox
                                                                checked={nodeForm.timeWindowDays.includes(day.value)}
                                                                onChange={() => {
                                                                    const days = nodeForm.timeWindowDays.includes(day.value)
                                                                        ? nodeForm.timeWindowDays.filter((d) => d !== day.value)
                                                                        : [...nodeForm.timeWindowDays, day.value];
                                                                    setNodeForm({ ...nodeForm, timeWindowDays: days });
                                                                }}
                                                            />
                                                            {day.label}
                                                        </label>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        {nodeForm.conditionType === 'connection_is' && (
                                            <div className="space-y-2">
                                                {connections.map((connection) => (
                                                    <label key={connection.id} className="flex items-center gap-3 text-sm text-gray-700 dark:text-gray-300">
                                                        <Checkbox
                                                            checked={nodeForm.conditionConnectionIds.includes(connection.id)}
                                                            onChange={(e) => {
                                                                const ids = nodeForm.conditionConnectionIds.includes(connection.id)
                                                                    ? nodeForm.conditionConnectionIds.filter((id) => id !== connection.id)
                                                                    : [...nodeForm.conditionConnectionIds, connection.id];
                                                                setNodeForm({ ...nodeForm, conditionConnectionIds: ids });
                                                            }}
                                                        />
                                                        {connection.name}
                                                    </label>
                                                ))}
                                            </div>
                                        )}

                                        {nodeForm.conditionType === 'conversation_status' && (
                                            <select
                                                value={nodeForm.conditionStatus}
                                                onChange={(e) => setNodeForm({ ...nodeForm, conditionStatus: e.target.value })}
                                                className="mt-1 w-full rounded-xl border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-700 px-4 py-2.5"
                                            >
                                                <option value="open">Open</option>
                                                <option value="closed">Closed</option>
                                            </select>
                                        )}

                                        {nodeForm.conditionType === 'tags_contains' && (
                                            <div className="space-y-2">
                                                <select
                                                    value={nodeForm.conditionTagId}
                                                    onChange={(e) => setNodeForm({ ...nodeForm, conditionTagId: e.target.value ? Number(e.target.value) : '' })}
                                                    className="mt-1 w-full rounded-xl border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-700 px-4 py-2.5"
                                                >
                                                    <option value="">Select tag</option>
                                                    {tags.map((tag) => (
                                                        <option key={tag.id} value={tag.id}>
                                                            {tag.name}
                                                        </option>
                                                    ))}
                                                </select>
                                                <TextInput
                                                    value={nodeForm.conditionTagName}
                                                    onChange={(e) => setNodeForm({ ...nodeForm, conditionTagName: e.target.value })}
                                                    className="mt-1 rounded-xl"
                                                    placeholder="Or type tag name"
                                                />
                                            </div>
                                        )}
                                    </div>
                                )}

                                {nodeForm.type === 'action' && (
                                    <div className="space-y-4 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
                                        <InputLabel value="Action Type" className="text-sm font-semibold mb-2" />
                                        <select
                                            value={nodeForm.actionType}
                                            onChange={(e) => setNodeForm({ ...nodeForm, actionType: e.target.value })}
                                            className="mt-1 w-full rounded-xl border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-700 px-4 py-2.5"
                                        >
                                            <option value="send_text">Send text</option>
                                            <option value="send_template">Send template</option>
                                            <option value="send_buttons">Send buttons</option>
                                            <option value="send_list">Send list</option>
                                            <option value="assign_agent">Assign agent</option>
                                            <option value="add_tag">Add tag</option>
                                            <option value="set_status">Set status</option>
                                            <option value="set_priority">Set priority</option>
                                        </select>

                                        {nodeForm.actionType === 'send_text' && (
                                            <textarea
                                                value={nodeForm.actionMessage}
                                                onChange={(e) => setNodeForm({ ...nodeForm, actionMessage: e.target.value })}
                                                className="mt-1 w-full rounded-xl border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-700 px-4 py-2.5"
                                                rows={3}
                                                placeholder="Message text"
                                            />
                                        )}

                                        {nodeForm.actionType === 'send_template' && (
                                            <div className="space-y-2">
                                                <select
                                                    value={nodeForm.actionTemplateId}
                                                    onChange={(e) => setNodeForm({ ...nodeForm, actionTemplateId: e.target.value ? Number(e.target.value) : '' })}
                                                    className="mt-1 w-full rounded-xl border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-700 px-4 py-2.5"
                                                >
                                                    <option value="">Select template</option>
                                                    {templates.map((template) => (
                                                        <option key={template.id} value={template.id}>
                                                            {template.name} ({template.language})
                                                        </option>
                                                    ))}
                                                </select>
                                                <textarea
                                                    value={nodeForm.actionTemplateVariables}
                                                    onChange={(e) => setNodeForm({ ...nodeForm, actionTemplateVariables: e.target.value })}
                                                    className="mt-1 w-full rounded-xl border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-700 px-4 py-2.5"
                                                    rows={3}
                                                    placeholder='{"1": "value"}'
                                                />
                                            </div>
                                        )}

                                        {nodeForm.actionType === 'send_buttons' && (
                                            <div className="space-y-2">
                                                <TextInput
                                                    value={nodeForm.actionButtonBodyText}
                                                    onChange={(e) => setNodeForm({ ...nodeForm, actionButtonBodyText: e.target.value })}
                                                    className="mt-1 rounded-xl"
                                                    placeholder="Body text"
                                                />
                                                <TextInput
                                                    value={nodeForm.actionButtonHeaderText}
                                                    onChange={(e) => setNodeForm({ ...nodeForm, actionButtonHeaderText: e.target.value })}
                                                    className="mt-1 rounded-xl"
                                                    placeholder="Header text (optional)"
                                                />
                                                <TextInput
                                                    value={nodeForm.actionButtonFooterText}
                                                    onChange={(e) => setNodeForm({ ...nodeForm, actionButtonFooterText: e.target.value })}
                                                    className="mt-1 rounded-xl"
                                                    placeholder="Footer text (optional)"
                                                />
                                                <textarea
                                                    value={nodeForm.actionButtonsJson}
                                                    onChange={(e) => setNodeForm({ ...nodeForm, actionButtonsJson: e.target.value })}
                                                    className="mt-1 w-full rounded-xl border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-700 px-4 py-2.5"
                                                    rows={3}
                                                    placeholder='[{"id":"btn_1","text":"Option 1"},{"id":"btn_2","text":"Option 2"}]'
                                                />
                                            </div>
                                        )}

                                        {nodeForm.actionType === 'send_list' && (
                                            <TextInput
                                                type="number"
                                                value={nodeForm.actionListId}
                                                onChange={(e) => setNodeForm({ ...nodeForm, actionListId: e.target.value ? Number(e.target.value) : '' })}
                                                className="mt-1 rounded-xl"
                                                placeholder="WhatsApp list ID"
                                            />
                                        )}

                                        {nodeForm.actionType === 'assign_agent' && (
                                            <select
                                                value={nodeForm.actionAgentId}
                                                onChange={(e) => setNodeForm({ ...nodeForm, actionAgentId: e.target.value ? Number(e.target.value) : '' })}
                                                className="mt-1 w-full rounded-xl border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-700 px-4 py-2.5"
                                            >
                                                <option value="">Select agent</option>
                                                {agents.map((agent) => (
                                                    <option key={agent.id} value={agent.id}>
                                                        {agent.name} ({agent.role})
                                                    </option>
                                                ))}
                                            </select>
                                        )}

                                        {nodeForm.actionType === 'add_tag' && (
                                            <div className="space-y-2">
                                                <select
                                                    value={nodeForm.actionTagId}
                                                    onChange={(e) => setNodeForm({ ...nodeForm, actionTagId: e.target.value ? Number(e.target.value) : '' })}
                                                    className="mt-1 w-full rounded-xl border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-700 px-4 py-2.5"
                                                >
                                                    <option value="">Select tag</option>
                                                    {tags.map((tag) => (
                                                        <option key={tag.id} value={tag.id}>
                                                            {tag.name}
                                                        </option>
                                                    ))}
                                                </select>
                                                <TextInput
                                                    value={nodeForm.actionTagName}
                                                    onChange={(e) => setNodeForm({ ...nodeForm, actionTagName: e.target.value })}
                                                    className="mt-1 rounded-xl"
                                                    placeholder="Or type tag name"
                                                />
                                            </div>
                                        )}

                                        {nodeForm.actionType === 'set_status' && (
                                            <select
                                                value={nodeForm.actionStatus}
                                                onChange={(e) => setNodeForm({ ...nodeForm, actionStatus: e.target.value })}
                                                className="mt-1 w-full rounded-xl border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-700 px-4 py-2.5"
                                            >
                                                <option value="open">Open</option>
                                                <option value="closed">Closed</option>
                                            </select>
                                        )}

                                        {nodeForm.actionType === 'set_priority' && (
                                            <select
                                                value={nodeForm.actionPriority}
                                                onChange={(e) => setNodeForm({ ...nodeForm, actionPriority: e.target.value })}
                                                className="mt-1 w-full rounded-xl border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-700 px-4 py-2.5"
                                            >
                                                <option value="low">Low</option>
                                                <option value="normal">Normal</option>
                                                <option value="high">High</option>
                                                <option value="urgent">Urgent</option>
                                            </select>
                                        )}
                                    </div>
                                )}

                                {nodeForm.type === 'delay' && (
                                    <TextInput
                                        type="number"
                                        value={nodeForm.delaySeconds}
                                        onChange={(e) => setNodeForm({ ...nodeForm, delaySeconds: Number(e.target.value) })}
                                        className="mt-1 rounded-xl"
                                        placeholder="Delay seconds"
                                    />
                                )}

                                {nodeForm.type === 'webhook' && (
                                    <div className="space-y-2">
                                        <TextInput
                                            value={nodeForm.webhookUrl}
                                            onChange={(e) => setNodeForm({ ...nodeForm, webhookUrl: e.target.value })}
                                            className="mt-1 rounded-xl"
                                            placeholder="https://example.com/hook"
                                        />
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <select
                                                value={nodeForm.webhookMethod}
                                                onChange={(e) => setNodeForm({ ...nodeForm, webhookMethod: e.target.value })}
                                                className="mt-1 w-full rounded-xl border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-700 px-4 py-2.5"
                                            >
                                                <option value="POST">POST</option>
                                                <option value="GET">GET</option>
                                            </select>
                                            <TextInput
                                                type="number"
                                                value={nodeForm.webhookTimeout}
                                                onChange={(e) => setNodeForm({ ...nodeForm, webhookTimeout: Number(e.target.value) })}
                                                className="mt-1 rounded-xl"
                                                placeholder="Timeout (seconds)"
                                            />
                                        </div>
                                    </div>
                                )}

                                <div className="flex items-center gap-3">
                                    <Button type="submit" className="rounded-xl">
                                        {editingNodeId ? 'Update Node' : 'Add Node'}
                                    </Button>
                                    <Button type="button" variant="secondary" className="rounded-xl" onClick={closeNodeForm}>
                                        Cancel
                                    </Button>
                                </div>
                            </form>
                        </CardContent>
                    </Card>
                )}

                {edgeFormOpen && edgeFlowId && (
                    <Card className="border-0 shadow-lg">
                        <CardHeader className="bg-gradient-to-r from-gray-50 to-white dark:from-gray-800 dark:to-gray-900">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl">
                                    <LinkIcon className="h-5 w-5 text-white" />
                                </div>
                                <div>
                                    <CardTitle className="text-xl font-bold">{edgeForm.id ? 'Edit Edge' : 'Add Edge'}</CardTitle>
                                    <CardDescription>Connect nodes to define branching</CardDescription>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="p-6 space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <InputLabel value="From Node" className="text-sm font-semibold mb-2" />
                                    <select
                                        value={edgeForm.fromNodeId}
                                        onChange={(e) => setEdgeForm({ ...edgeForm, fromNodeId: Number(e.target.value) })}
                                        className="mt-1 w-full rounded-xl border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-700 px-4 py-2.5"
                                    >
                                        {(flowById.get(edgeFlowId)?.nodes || []).map((node) => (
                                            <option key={node.id} value={node.id}>
                                                Node #{node.id} ({node.type})
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <InputLabel value="To Node" className="text-sm font-semibold mb-2" />
                                    <select
                                        value={edgeForm.toNodeId}
                                        onChange={(e) => setEdgeForm({ ...edgeForm, toNodeId: Number(e.target.value) })}
                                        className="mt-1 w-full rounded-xl border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-700 px-4 py-2.5"
                                    >
                                        {(flowById.get(edgeFlowId)?.nodes || []).map((node) => (
                                            <option key={node.id} value={node.id}>
                                                Node #{node.id} ({node.type})
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <InputLabel value="Label" className="text-sm font-semibold mb-2" />
                                    <TextInput
                                        value={edgeForm.label}
                                        onChange={(e) => setEdgeForm({ ...edgeForm, label: e.target.value })}
                                        className="mt-1 rounded-xl"
                                        placeholder="true / false / next"
                                    />
                                </div>
                                <div>
                                    <InputLabel value="Sort Order" className="text-sm font-semibold mb-2" />
                                    <TextInput
                                        type="number"
                                        value={edgeForm.sortOrder}
                                        onChange={(e) =>
                                            setEdgeForm({
                                                ...edgeForm,
                                                sortOrder: e.target.value === '' ? '' : Number(e.target.value),
                                            })
                                        }
                                        className="mt-1 rounded-xl"
                                    />
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <Button className="rounded-xl" onClick={saveEdge}>
                                    Save Edge
                                </Button>
                                <Button variant="secondary" className="rounded-xl" onClick={closeEdgeForm}>
                                    Cancel
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                )}
            </div>
        </AppShell>
    );
}
