import { FormEvent, useMemo, useState } from 'react';
import { Head, router, useForm } from '@inertiajs/react';
import axios from 'axios';
import {
    AlertTriangle,
    BarChart3,
    Bot,
    CheckCircle2,
    ClipboardList,
    Plus,
    Save,
    Settings2,
    Sparkles,
    Trash2,
    UserRoundCog,
} from 'lucide-react';
import AppShell from '@/Layouts/AppShell';
import Button from '@/Components/UI/Button';
import { Alert } from '@/Components/UI/Alert';
import { Badge } from '@/Components/UI/Badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/Components/UI/Card';
import { Input } from '@/Components/UI/Input';
import { Label } from '@/Components/UI/Label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/Components/UI/Select';
import { Switch } from '@/Components/UI/Switch';
import { Textarea } from '@/Components/UI/Textarea';
import { Drawer, StatusBadge, ThemedIconTile } from '@/Components/UI/Elements';
import { useToast } from '@/hooks/useToast';
import { useConfirm } from '@/hooks/useConfirm';
import { cn } from '@/lib/utils';

interface UsageStats {
    this_month: number;
    by_feature: Record<string, number>;
    period_start: string;
}

interface AiAgent {
    id: number;
    name: string;
    avatar?: string | null;
    role: 'support' | 'sales' | 'sales_support' | 'operations' | 'custom';
    language: string;
    tone: 'professional' | 'friendly' | 'concise' | 'empathetic' | 'bold';
    mode: 'suggest' | 'approval' | 'autopilot';
    is_active: boolean;
    instructions?: string | null;
    goal?: string | null;
    knowledge_sources?: string[];
    allowed_actions?: string[];
    qualification_fields?: string[];
    guardrails?: string[];
    escalation_rules?: { keywords?: string[] };
    handoff_rules?: { keywords?: string[]; after_invalid_replies?: number };
    fallback_reply?: string | null;
    max_auto_replies_per_conversation?: number;
    max_reply_chars?: number;
    confidence_threshold?: number;
    last_used_at?: string | null;
}

interface AiAgentRun {
    id: number;
    status: 'sent' | 'skipped' | 'failed' | string;
    reason?: string | null;
    agent?: { id: number; name: string; avatar?: string | null } | null;
    conversation_id: number;
    created_at?: string | null;
}

interface AiIndexProps {
    ai_suggestions_enabled: boolean;
    ai_agents?: AiAgent[];
    ai_agent_runs?: AiAgentRun[];
    platform_ai_enabled?: boolean;
    platform_ai_provider?: string;
    usage: UsageStats;
}

const normalizeStringArray = (value: unknown): string[] => {
    if (Array.isArray(value)) {
        return value.filter((item): item is string => typeof item === 'string' && item.trim().length > 0);
    }

    if (typeof value === 'string' && value.trim()) {
        return value
            .split(/[\n,]+/)
            .map((item) => item.trim())
            .filter(Boolean);
    }

    if (value && typeof value === 'object') {
        return Object.keys(value).filter((key) => key.trim().length > 0);
    }

    return [];
};

const featureLabels: Record<string, string> = {
    conversation_suggest: 'Conversation reply suggestions',
    support_reply: 'Support assistant',
};

const roleLabels: Record<AiAgent['role'], string> = {
    support: 'Support',
    sales: 'Sales',
    sales_support: 'Sales + Support',
    operations: 'Operations',
    custom: 'Custom',
};

const toneLabels: Record<AiAgent['tone'], string> = {
    professional: 'Professional',
    friendly: 'Friendly',
    concise: 'Concise',
    empathetic: 'Empathetic',
    bold: 'Bold',
};

const modeLabels: Record<AiAgent['mode'], string> = {
    suggest: 'Manual suggestions only',
    approval: 'Draft for approval',
    autopilot: 'Auto-reply to customers',
};

const knowledgeOptions = [
    { value: 'recent_conversation', label: 'Recent conversation' },
    { value: 'contact_profile', label: 'Contact profile' },
    { value: 'quick_replies', label: 'Quick replies' },
    { value: 'templates', label: 'Approved templates' },
    { value: 'catalog', label: 'Catalog' },
    { value: 'workspace_profile', label: 'Workspace profile' },
];

const guardrailOptions = [
    { value: 'handoff_when_unsure', label: 'Hand off when unsure' },
    { value: 'no_policy_promises', label: 'No policy promises' },
    { value: 'no_pricing_promises', label: 'No pricing promises' },
    { value: 'ask_before_discount', label: 'Ask before discounts' },
];

const allowedActionOptions = [
    { value: 'answer_questions', label: 'Answer questions' },
    { value: 'qualify_lead', label: 'Qualify lead' },
    { value: 'send_pricing', label: 'Share pricing' },
    { value: 'book_demo', label: 'Book demo' },
    { value: 'create_deal', label: 'Create deal' },
    { value: 'handoff', label: 'Handoff' },
];

const blankAgent = {
    name: '',
    avatar: '🤖',
    role: 'support' as AiAgent['role'],
    language: 'en',
    tone: 'professional' as AiAgent['tone'],
    mode: 'suggest' as AiAgent['mode'],
    is_active: true,
    goal: 'Understand the customer need, qualify the lead, and move them to the next useful step.',
    instructions: '',
    knowledge_sources: ['recent_conversation', 'contact_profile', 'quick_replies'],
    allowed_actions: ['answer_questions', 'qualify_lead', 'send_pricing', 'book_demo', 'handoff'],
    qualification_fields: 'business name\nuse case\nteam size\nmonthly message volume\npreferred plan',
    guardrails: ['handoff_when_unsure', 'no_policy_promises'],
    escalation_keywords: 'refund\nlegal\ncomplaint\nangry\ncancel',
    handoff_keywords: 'human\nagent\ncall me\ncomplaint\nlegal\nrefund',
    handoff_after_invalid_replies: 2,
    fallback_reply: 'I want to answer this correctly. Let me connect you with a team member for the next step.',
    max_auto_replies_per_conversation: 3,
    max_reply_chars: 3500,
    confidence_threshold: 0.7,
};

function FieldError({ message }: { message?: string }) {
    if (!message) return null;

    return <p className="mt-1 text-xs text-red-600 dark:text-red-300">{message}</p>;
}

function MetricCard({
    title,
    value,
    description,
    icon: Icon,
    tone = 'green',
}: {
    title: string;
    value: string | number;
    description: string;
    icon: typeof Sparkles;
    tone?: 'green' | 'blue' | 'amber';
}) {
    const tones = {
        green: 'bg-emerald-50 text-emerald-700 ring-emerald-100 dark:bg-emerald-500/10 dark:text-emerald-200 dark:ring-emerald-400/15',
        blue: 'bg-blue-50 text-blue-700 ring-blue-100 dark:bg-blue-500/10 dark:text-blue-200 dark:ring-blue-400/15',
        amber: 'bg-amber-50 text-amber-700 ring-amber-100 dark:bg-amber-500/10 dark:text-amber-200 dark:ring-amber-400/15',
    };

    return (
        <Card className="p-4">
            <div className="flex items-start justify-between gap-3">
                <div>
                    <p className="text-sm text-waify-text-muted dark:text-waify-dark-text-muted">{title}</p>
                    <p className="mt-2 text-2xl font-bold text-waify-text dark:text-waify-dark-text">{value}</p>
                    <p className="mt-1 text-xs text-waify-text-muted dark:text-waify-dark-text-muted">{description}</p>
                </div>
                <span className={cn('flex h-10 w-10 shrink-0 items-center justify-center rounded-card ring-1', tones[tone])}>
                    <Icon className="h-5 w-5" />
                </span>
            </div>
        </Card>
    );
}

export default function AiIndex({
    ai_suggestions_enabled = false,
    ai_agents = [],
    ai_agent_runs = [],
    platform_ai_enabled = false,
    platform_ai_provider = 'openai',
    usage = { this_month: 0, by_feature: {}, period_start: '' },
}: AiIndexProps) {
    const { toast } = useToast();
    const confirm = useConfirm();
    const [agentDrawerOpen, setAgentDrawerOpen] = useState(false);
    const [editingAgent, setEditingAgent] = useState<AiAgent | null>(null);
    const [simulationMessage, setSimulationMessage] = useState('Hi, I need pricing and want a discount.');
    const [simulationContext, setSimulationContext] = useState('');
    const [simulationResult, setSimulationResult] = useState<{
        status: string;
        reply: string | null;
        safety: Array<{ label: string; severity: 'pass' | 'warn' | 'block'; message: string }>;
        mode: string;
    } | null>(null);
    const [simulationLoading, setSimulationLoading] = useState(false);
    const form = useForm<{
        ai_suggestions_enabled: boolean;
    }>({
        ai_suggestions_enabled,
    });
    const agentForm = useForm({
        ...blankAgent,
    });

    const usageEntries = Object.entries(usage?.by_feature || {});
    const activeAgents = useMemo(() => ai_agents.filter((agent) => agent.is_active), [ai_agents]);
    const autopilotAgents = useMemo(() => ai_agents.filter((agent) => agent.mode === 'autopilot' && agent.is_active), [ai_agents]);

    const submit = (event: FormEvent) => {
        event.preventDefault();

        form.transform(() => ({
            ai_suggestions_enabled: form.data.ai_suggestions_enabled,
        }));

        form.post(route('app.ai.settings'), {
            preserveScroll: true,
            onSuccess: () => toast.success('AI settings saved'),
        });
    };

    const openCreateAgent = () => {
        setEditingAgent(null);
        agentForm.reset();
        agentForm.setData({ ...blankAgent });
        setAgentDrawerOpen(true);
    };

    const openEditAgent = (agent: AiAgent) => {
        setEditingAgent(agent);
        setSimulationResult(null);
        const knowledgeSources = normalizeStringArray(agent.knowledge_sources);
        const guardrails = normalizeStringArray(agent.guardrails);
        agentForm.setData({
            name: agent.name,
            avatar: agent.avatar || '🤖',
            role: agent.role,
            language: agent.language || 'en',
            tone: agent.tone,
            mode: agent.mode,
            is_active: agent.is_active,
            goal: agent.goal || '',
            instructions: agent.instructions || '',
            knowledge_sources: knowledgeSources,
            allowed_actions: normalizeStringArray(agent.allowed_actions),
            qualification_fields: normalizeStringArray(agent.qualification_fields).join('\n'),
            guardrails,
            escalation_keywords: (agent.escalation_rules?.keywords || []).join('\n'),
            handoff_keywords: (agent.handoff_rules?.keywords || []).join('\n'),
            handoff_after_invalid_replies: agent.handoff_rules?.after_invalid_replies ?? 2,
            fallback_reply: agent.fallback_reply || '',
            max_auto_replies_per_conversation: agent.max_auto_replies_per_conversation ?? 3,
            max_reply_chars: agent.max_reply_chars ?? 3500,
            confidence_threshold: agent.confidence_threshold ?? 0.7,
        });
        setAgentDrawerOpen(true);
    };

    const toggleArrayValue = (field: 'knowledge_sources' | 'guardrails' | 'allowed_actions', value: string) => {
        const current = normalizeStringArray(agentForm.data[field]);
        agentForm.setData(field, current.includes(value) ? current.filter((item) => item !== value) : [...current, value]);
    };

    const submitAgent = (event: FormEvent) => {
        event.preventDefault();

        const payload = {
            ...agentForm.data,
            qualification_fields: normalizeStringArray(agentForm.data.qualification_fields),
            escalation_rules: {
                keywords: agentForm.data.escalation_keywords
                    .split('\n')
                    .map((keyword) => keyword.trim())
                    .filter(Boolean),
            },
            handoff_rules: {
                keywords: agentForm.data.handoff_keywords
                    .split('\n')
                    .map((keyword) => keyword.trim())
                    .filter(Boolean),
                after_invalid_replies: Number(agentForm.data.handoff_after_invalid_replies) || 2,
            },
        };

        const options = {
            preserveScroll: true,
            onSuccess: () => {
                toast.success(editingAgent ? 'AI agent updated' : 'AI agent created');
                setAgentDrawerOpen(false);
                setEditingAgent(null);
                agentForm.reset();
            },
        };

        agentForm.transform(() => payload);

        if (editingAgent) {
            agentForm.patch(route('app.ai.agents.update', { agent: editingAgent.id }), options);
        } else {
            agentForm.post(route('app.ai.agents.store'), options);
        }
    };

    const simulateAgent = async () => {
        if (!editingAgent) {
            toast.warning('Save the agent first', 'Simulator is available after the agent is created.');
            return;
        }

        setSimulationLoading(true);
        try {
            const response = await axios.post(route('app.ai.agents.simulate', { agent: editingAgent.id }), {
                message: simulationMessage,
                context: simulationContext,
            });
            setSimulationResult(response.data);
        } catch (error: any) {
            toast.error('Simulation failed', error?.response?.data?.message || 'Server error');
        } finally {
            setSimulationLoading(false);
        }
    };

    const deleteAgent = async (agent: AiAgent) => {
        const confirmed = await confirm({
            title: 'Delete AI agent',
            message: `Delete "${agent.name}"? Inbox suggestions using this agent will stop.`,
            confirmText: 'Delete agent',
            variant: 'danger',
        });
        if (!confirmed) return;

        router.delete(route('app.ai.agents.destroy', { agent: agent.id }), {
            preserveScroll: true,
            onSuccess: () => toast.success('AI agent deleted'),
        });
    };

    return (
        <AppShell>
            <Head title="AI Assistant" />

            <div className="mx-auto w-full max-w-[1400px] space-y-6">
                <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-waify-green dark:text-emerald-300">Workspace intelligence</p>
                        <h1 className="mt-2 text-2xl font-bold tracking-tight text-waify-text dark:text-waify-dark-text md:text-3xl">AI Agents</h1>
                        <p className="mt-1 max-w-2xl text-sm text-waify-text-muted dark:text-waify-dark-text-muted">
                            Create role-based agents for inbox reply suggestions, approval workflows, and guarded autopilot.
                        </p>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                        <Badge variant={platform_ai_enabled ? 'success' : 'warning'}>
                            {platform_ai_enabled ? 'Platform enabled' : 'Platform disabled'}
                        </Badge>
                        <Badge variant="secondary">{platform_ai_provider}</Badge>
                        <Button type="button" onClick={openCreateAgent}>
                            <Plus className="h-4 w-4" />
                            Create agent
                        </Button>
                    </div>
                </div>

                {!platform_ai_enabled && (
                    <Alert variant="warning" title="AI provider is disabled">
                        Agents can be configured, but replies will stay unavailable until an AI provider is enabled.
                    </Alert>
                )}

                <div className="grid gap-4 md:grid-cols-3">
                    <MetricCard
                        title="Requests this month"
                        value={usage?.this_month ?? 0}
                        description="Generated by your account in this workspace."
                        icon={BarChart3}
                        tone="green"
                    />
                    <MetricCard
                        title="Active agents"
                        value={activeAgents.length}
                        description={`${ai_agents.length} workspace AI agent${ai_agents.length === 1 ? '' : 's'} configured.`}
                        icon={ClipboardList}
                        tone="blue"
                    />
                    <MetricCard
                        title="Conversation assist"
                        value={form.data.ai_suggestions_enabled && platform_ai_enabled ? 'On' : 'Off'}
                        description={autopilotAgents.length > 0 ? `${autopilotAgents.length} autopilot agent${autopilotAgents.length === 1 ? '' : 's'} active.` : 'Inbox suggestions use selected active agents.'}
                        icon={Sparkles}
                        tone="amber"
                    />
                </div>

                <form onSubmit={submit} className="grid gap-6 lg:grid-cols-[300px_minmax(0,1fr)]">
                    <aside className="space-y-4 lg:sticky lg:top-24 lg:h-fit">
                        <Card className="p-2">
                            <button
                                type="button"
                                className="flex w-full items-center gap-3 rounded-btn bg-waify-green-soft px-3 py-2.5 text-left text-waify-green-dark dark:bg-emerald-950/40 dark:text-emerald-300"
                            >
                                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/80 dark:bg-waify-dark-surface">
                                    <Settings2 className="h-4 w-4" />
                                </span>
                                <span>
                                    <span className="block text-sm font-semibold">Agent setup</span>
                                    <span className="block text-[11px] opacity-80">Agents and activity</span>
                                </span>
                            </button>
                        </Card>

                        <Card className="p-4">
                            <div className="flex items-start gap-3">
                                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-card bg-blue-50 text-blue-700 ring-1 ring-blue-100 dark:bg-blue-500/10 dark:text-blue-200 dark:ring-blue-400/15">
                                    <Bot className="h-5 w-5" />
                                </span>
                                <div>
                                    <p className="text-sm font-semibold text-waify-text dark:text-waify-dark-text">Agent behavior</p>
                                    <p className="mt-1 text-xs leading-5 text-waify-text-muted dark:text-waify-dark-text-muted">
                                        Instructions, knowledge sources, guardrails, and escalation rules now live inside each agent.
                                    </p>
                                </div>
                            </div>
                        </Card>

                        {usageEntries.length > 0 && (
                            <Card className="p-4">
                                <p className="text-sm font-semibold text-waify-text dark:text-waify-dark-text">Usage by feature</p>
                                <div className="mt-3 space-y-2">
                                    {usageEntries.map(([feature, count]) => (
                                        <div key={feature} className="flex items-center justify-between gap-3 rounded-btn bg-gray-50 px-3 py-2 text-sm dark:bg-waify-dark-surface-2">
                                            <span className="truncate text-waify-text-muted dark:text-waify-dark-text-muted">{featureLabels[feature] ?? feature}</span>
                                            <span className="font-semibold text-waify-text dark:text-waify-dark-text">{count}</span>
                                        </div>
                                    ))}
                                </div>
                            </Card>
                        )}

                        {ai_agent_runs.length > 0 && (
                            <Card className="p-4">
                                <p className="text-sm font-semibold text-waify-text dark:text-waify-dark-text">Agent activity</p>
                                <div className="mt-3 space-y-2">
                                    {ai_agent_runs.slice(0, 6).map((run) => (
                                        <div key={run.id} className="rounded-btn bg-gray-50 px-3 py-2 dark:bg-waify-dark-surface-2">
                                            <div className="flex items-center justify-between gap-2">
                                                <span className="truncate text-xs font-semibold text-waify-text dark:text-waify-dark-text">{run.agent?.name || 'AI agent'}</span>
                                                <StatusBadge tone={run.status === 'sent' ? 'success' : run.status === 'failed' ? 'danger' : 'muted'}>{run.status}</StatusBadge>
                                            </div>
                                            {run.reason && <p className="mt-1 truncate text-[11px] text-waify-text-muted dark:text-waify-dark-text-muted">{run.reason}</p>}
                                        </div>
                                    ))}
                                </div>
                            </Card>
                        )}
                    </aside>

                    <div className="min-w-0 space-y-6">
                        <Card>
                            <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                                <div>
                                    <CardTitle className="flex items-center gap-2">
                                        <UserRoundCog className="h-5 w-5 text-waify-green-dark dark:text-emerald-300" />
                                        AI agents
                                    </CardTitle>
                                    <CardDescription>
                                        Create role-based assistants that draft customer replies from Inbox.
                                    </CardDescription>
                                </div>
                                <Button type="button" onClick={openCreateAgent}>
                                    <Plus className="h-4 w-4" />
                                    Create agent
                                </Button>
                            </CardHeader>
                            <CardContent>
                                {ai_agents.length === 0 ? (
                                    <div className="rounded-card border border-dashed border-gray-200 p-6 text-center dark:border-waify-dark-border">
                                        <Bot className="mx-auto h-9 w-9 text-waify-text-muted dark:text-waify-dark-text-muted" />
                                        <p className="mt-3 text-sm font-semibold text-waify-text dark:text-waify-dark-text">No AI agents yet</p>
                                        <p className="mt-1 text-sm text-waify-text-muted dark:text-waify-dark-text-muted">Create a support or sales assistant and choose it from the Inbox composer.</p>
                                        <Button type="button" className="mt-4" onClick={openCreateAgent}>
                                            <Plus className="h-4 w-4" />
                                            Create first agent
                                        </Button>
                                    </div>
                                ) : (
                                    <div className="grid gap-3 xl:grid-cols-2">
                                        {ai_agents.map((agent) => (
                                            <div key={agent.id} className="rounded-card border border-gray-100 bg-white p-4 dark:border-waify-dark-border dark:bg-waify-dark-surface">
                                                <div className="flex items-start justify-between gap-3">
                                                    <div className="flex min-w-0 items-start gap-3">
                                                        <ThemedIconTile tone={agent.is_active ? 'green' : 'gray'} size="lg">
                                                            <span className="text-lg">{agent.avatar || '🤖'}</span>
                                                        </ThemedIconTile>
                                                        <div className="min-w-0">
                                                            <p className="truncate text-sm font-semibold text-waify-text dark:text-waify-dark-text">{agent.name}</p>
                                                            <p className="mt-1 text-xs text-waify-text-muted dark:text-waify-dark-text-muted">{roleLabels[agent.role]} · {toneLabels[agent.tone]}</p>
                                                        </div>
                                                    </div>
                                                    <div className="flex shrink-0 items-center gap-2">
                                                        <StatusBadge tone={agent.is_active ? 'success' : 'muted'}>{agent.is_active ? 'Active' : 'Paused'}</StatusBadge>
                                                        <StatusBadge tone={agent.mode === 'autopilot' ? 'warning' : agent.mode === 'approval' ? 'info' : 'default'}>{modeLabels[agent.mode]}</StatusBadge>
                                                    </div>
                                                </div>
                                                {agent.instructions && (
                                                    <p className="mt-3 line-clamp-2 text-sm leading-6 text-waify-text-muted dark:text-waify-dark-text-muted">{agent.instructions}</p>
                                                )}
                                                <div className="mt-4 flex flex-wrap items-center justify-between gap-2">
                                                    <div className="flex flex-wrap gap-1.5">
                                                        {normalizeStringArray(agent.knowledge_sources).slice(0, 3).map((source) => (
                                                            <Badge key={source} variant="secondary">{knowledgeOptions.find((item) => item.value === source)?.label || source}</Badge>
                                                        ))}
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <Button type="button" variant="secondary" size="sm" onClick={() => openEditAgent(agent)}>Edit</Button>
                                                        <Button type="button" variant="ghost" size="sm" onClick={() => deleteAgent(agent)} aria-label="Delete agent">
                                                            <Trash2 className="h-4 w-4" />
                                                        </Button>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Sparkles className="h-5 w-5 text-waify-green-dark dark:text-emerald-300" />
                                    Conversation AI
                                </CardTitle>
                                <CardDescription>
                                    Show the AI suggest action in Inbox conversations for reply ideas.
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="flex flex-col gap-4 rounded-card border border-gray-100 p-4 dark:border-waify-dark-border sm:flex-row sm:items-center sm:justify-between">
                                    <div>
                                        <p className="text-sm font-semibold text-waify-text dark:text-waify-dark-text">Enable reply suggestions</p>
                                        <p className="mt-1 text-sm text-waify-text-muted dark:text-waify-dark-text-muted">
                                            Agents can generate draft replies without leaving the conversation page.
                                        </p>
                                    </div>
                                    <Switch
                                        checked={form.data.ai_suggestions_enabled}
                                        onCheckedChange={(checked) => form.setData('ai_suggestions_enabled', checked)}
                                        disabled={!platform_ai_enabled}
                                    />
                                </div>
                            </CardContent>
                        </Card>

                        {!platform_ai_enabled && (
                            <Alert variant="warning" title="Admin action required">
                                <span className="inline-flex items-center gap-2">
                                    <AlertTriangle className="h-4 w-4" />
                                    Enable a provider in Platform Settings before agents can generate suggestions.
                                </span>
                            </Alert>
                        )}

                        <div className="flex flex-col gap-3 border-t border-gray-100 pt-4 dark:border-waify-dark-border sm:flex-row sm:items-center sm:justify-end">
                            {form.recentlySuccessful && (
                                <span className="inline-flex items-center gap-2 text-sm font-medium text-emerald-700 dark:text-emerald-300">
                                    <CheckCircle2 className="h-4 w-4" />
                                    Saved
                                </span>
                            )}
                            <Button type="submit" disabled={form.processing}>
                                <Save className="h-4 w-4" />
                                {form.processing ? 'Saving...' : 'Save settings'}
                            </Button>
                        </div>
                    </div>
                </form>
            </div>

            <Drawer
                open={agentDrawerOpen}
                onClose={() => setAgentDrawerOpen(false)}
                title={editingAgent ? 'Edit AI agent' : 'Create AI agent'}
                description="Agents are workspace-scoped and can be selected from Inbox suggestions."
                className="sm:max-w-3xl"
                footer={(
                    <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                        <Button type="button" variant="secondary" onClick={() => setAgentDrawerOpen(false)}>Cancel</Button>
                        <Button type="submit" form="ai-agent-form" disabled={agentForm.processing}>
                            {agentForm.processing ? 'Saving...' : (editingAgent ? 'Save agent' : 'Create agent')}
                        </Button>
                    </div>
                )}
            >
                <form id="ai-agent-form" onSubmit={submitAgent} className="space-y-5">
                    <div className="grid gap-4 sm:grid-cols-[90px_minmax(0,1fr)]">
                        <div>
                            <Label htmlFor="agent-avatar">Avatar</Label>
                            <Input id="agent-avatar" value={agentForm.data.avatar} onChange={(event) => agentForm.setData('avatar', event.target.value)} placeholder="🤖" maxLength={12} />
                        </div>
                        <div>
                            <Label htmlFor="agent-name">Agent name</Label>
                            <Input id="agent-name" value={agentForm.data.name} onChange={(event) => agentForm.setData('name', event.target.value)} placeholder="Sales concierge" />
                            <FieldError message={agentForm.errors.name} />
                        </div>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                        <div>
                            <Label>Role</Label>
                            <Select value={agentForm.data.role} onValueChange={(value) => agentForm.setData('role', value as AiAgent['role'])}>
                                <SelectTrigger><SelectValue>{roleLabels[agentForm.data.role]}</SelectValue></SelectTrigger>
                                <SelectContent>
                                    {Object.entries(roleLabels).map(([value, label]) => <SelectItem key={value} value={value}>{label}</SelectItem>)}
                                </SelectContent>
                            </Select>
                        </div>
                        <div>
                            <Label>Tone</Label>
                            <Select value={agentForm.data.tone} onValueChange={(value) => agentForm.setData('tone', value as AiAgent['tone'])}>
                                <SelectTrigger><SelectValue>{toneLabels[agentForm.data.tone]}</SelectValue></SelectTrigger>
                                <SelectContent>
                                    {Object.entries(toneLabels).map(([value, label]) => <SelectItem key={value} value={value}>{label}</SelectItem>)}
                                </SelectContent>
                            </Select>
                        </div>
                        <div>
                            <Label htmlFor="agent-language">Language</Label>
                            <Input id="agent-language" value={agentForm.data.language} onChange={(event) => agentForm.setData('language', event.target.value)} placeholder="en" />
                        </div>
                    </div>

                    <div className="grid gap-4 rounded-card border border-gray-100 p-4 dark:border-waify-dark-border sm:grid-cols-[minmax(0,1fr)_220px]">
                        <div className="flex items-start gap-3">
                            <Switch
                                checked={agentForm.data.mode === 'autopilot'}
                                onCheckedChange={(checked) => agentForm.setData('mode', checked ? 'autopilot' : 'suggest')}
                            />
                            <div>
                                <p className="text-sm font-semibold text-waify-text dark:text-waify-dark-text">Auto-reply in WhatsApp</p>
                                <p className="mt-1 text-xs text-waify-text-muted dark:text-waify-dark-text-muted">
                                    When off, this agent only creates suggestions or drafts. Automatic chat replies run only for active agents with this enabled.
                                </p>
                            </div>
                        </div>
                        <div>
                            <Label>Manual mode</Label>
                            <Select
                                value={agentForm.data.mode === 'autopilot' ? 'suggest' : agentForm.data.mode}
                                onValueChange={(value) => agentForm.setData('mode', value as AiAgent['mode'])}
                            >
                                <SelectTrigger disabled={agentForm.data.mode === 'autopilot'}><SelectValue>{agentForm.data.mode === 'autopilot' ? 'Auto-reply enabled' : modeLabels[agentForm.data.mode]}</SelectValue></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="suggest">{modeLabels.suggest}</SelectItem>
                                    <SelectItem value="approval">{modeLabels.approval}</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    {agentForm.data.mode === 'autopilot' && (
                        <Alert variant="warning" title="Autopilot sends replies">
                            Active autopilot agents can reply to inbound text messages automatically. Escalation keywords, reply caps, recent human replies, billing limits, and platform AI settings are checked before sending.
                        </Alert>
                    )}

                    <div>
                        <Label htmlFor="agent-goal">Goal</Label>
                        <Textarea
                            id="agent-goal"
                            value={agentForm.data.goal}
                            onChange={(event) => agentForm.setData('goal', event.target.value)}
                            rows={3}
                            placeholder="Define the business outcome this agent should move toward."
                        />
                    </div>

                    <div>
                        <Label htmlFor="agent-instructions">Instructions</Label>
                        <Textarea
                            id="agent-instructions"
                            value={agentForm.data.instructions}
                            onChange={(event) => agentForm.setData('instructions', event.target.value)}
                            rows={6}
                            placeholder="Describe what this agent can answer, when it should ask questions, and when it should hand off."
                        />
                        <FieldError message={agentForm.errors.instructions} />
                    </div>

                    <div>
                        <Label>Knowledge sources</Label>
                        <div className="mt-2 grid gap-2 sm:grid-cols-2">
                            {knowledgeOptions.map((option) => (
                                <label key={option.value} className="flex items-center gap-2 rounded-card border border-gray-100 px-3 py-2 text-sm dark:border-waify-dark-border">
                                    <input type="checkbox" checked={normalizeStringArray(agentForm.data.knowledge_sources).includes(option.value)} onChange={() => toggleArrayValue('knowledge_sources', option.value)} className="rounded border-gray-300 text-waify-green focus:ring-waify-green" />
                                    <span className="text-waify-text dark:text-waify-dark-text">{option.label}</span>
                                </label>
                            ))}
                        </div>
                    </div>

                    <div>
                        <Label>Allowed actions</Label>
                        <div className="mt-2 grid gap-2 sm:grid-cols-2">
                            {allowedActionOptions.map((option) => (
                                <label key={option.value} className="flex items-center gap-2 rounded-card border border-gray-100 px-3 py-2 text-sm dark:border-waify-dark-border">
                                    <input type="checkbox" checked={normalizeStringArray(agentForm.data.allowed_actions).includes(option.value)} onChange={() => toggleArrayValue('allowed_actions', option.value)} className="rounded border-gray-300 text-waify-green focus:ring-waify-green" />
                                    <span className="text-waify-text dark:text-waify-dark-text">{option.label}</span>
                                </label>
                            ))}
                        </div>
                    </div>

                    <div>
                        <Label htmlFor="agent-qualification">Qualification fields</Label>
                        <Textarea
                            id="agent-qualification"
                            value={Array.isArray(agentForm.data.qualification_fields) ? agentForm.data.qualification_fields.join('\n') : agentForm.data.qualification_fields}
                            onChange={(event) => agentForm.setData('qualification_fields', event.target.value)}
                            rows={4}
                            placeholder="business name&#10;use case&#10;monthly message volume"
                        />
                    </div>

                    <div>
                        <Label>Guardrails</Label>
                        <div className="mt-2 grid gap-2 sm:grid-cols-2">
                            {guardrailOptions.map((option) => (
                                <label key={option.value} className="flex items-center gap-2 rounded-card border border-gray-100 px-3 py-2 text-sm dark:border-waify-dark-border">
                                    <input type="checkbox" checked={normalizeStringArray(agentForm.data.guardrails).includes(option.value)} onChange={() => toggleArrayValue('guardrails', option.value)} className="rounded border-gray-300 text-waify-green focus:ring-waify-green" />
                                    <span className="text-waify-text dark:text-waify-dark-text">{option.label}</span>
                                </label>
                            ))}
                        </div>
                    </div>

                    <Card className="border-gray-100 dark:border-waify-dark-border">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-base">
                                <AlertTriangle className="h-4 w-4 text-amber-500" />
                                Safety controls
                            </CardTitle>
                            <CardDescription>These checks decide whether an agent can suggest, request approval, or auto-send.</CardDescription>
                        </CardHeader>
                        <CardContent className="grid gap-3 sm:grid-cols-2">
                            <div className="rounded-btn bg-gray-50 p-3 dark:bg-waify-dark-surface-2">
                                <p className="text-xs font-semibold text-waify-text dark:text-waify-dark-text">Escalation keywords</p>
                                <p className="mt-1 text-xs text-waify-text-muted dark:text-waify-dark-text-muted">Matched keywords block autopilot and force human handling.</p>
                            </div>
                            <div className="rounded-btn bg-gray-50 p-3 dark:bg-waify-dark-surface-2">
                                <p className="text-xs font-semibold text-waify-text dark:text-waify-dark-text">Auto reply cap</p>
                                <p className="mt-1 text-xs text-waify-text-muted dark:text-waify-dark-text-muted">Caps repeated replies in one conversation and prevents loops.</p>
                            </div>
                            <div className="rounded-btn bg-gray-50 p-3 dark:bg-waify-dark-surface-2">
                                <p className="text-xs font-semibold text-waify-text dark:text-waify-dark-text">Recent human reply</p>
                                <p className="mt-1 text-xs text-waify-text-muted dark:text-waify-dark-text-muted">Runtime autopilot skips if a team member replied recently.</p>
                            </div>
                            <div className="rounded-btn bg-gray-50 p-3 dark:bg-waify-dark-surface-2">
                                <p className="text-xs font-semibold text-waify-text dark:text-waify-dark-text">Confidence threshold</p>
                                <p className="mt-1 text-xs text-waify-text-muted dark:text-waify-dark-text-muted">Lower thresholds stay visible as warnings in simulator and review.</p>
                            </div>
                        </CardContent>
                    </Card>

                    <div>
                        <Label htmlFor="agent-escalation">Escalation keywords</Label>
                        <Textarea
                            id="agent-escalation"
                            value={agentForm.data.escalation_keywords}
                            onChange={(event) => agentForm.setData('escalation_keywords', event.target.value)}
                            rows={4}
                            placeholder="refund&#10;legal&#10;complaint"
                        />
                    </div>

                    <div className="grid gap-4 sm:grid-cols-[minmax(0,1fr)_160px]">
                        <div>
                            <Label htmlFor="agent-handoff">Handoff keywords</Label>
                            <Textarea
                                id="agent-handoff"
                                value={agentForm.data.handoff_keywords}
                                onChange={(event) => agentForm.setData('handoff_keywords', event.target.value)}
                                rows={4}
                                placeholder="human&#10;agent&#10;call me"
                            />
                        </div>
                        <div>
                            <Label htmlFor="agent-handoff-invalid">Invalid replies</Label>
                            <Input id="agent-handoff-invalid" type="number" min={1} max={10} value={agentForm.data.handoff_after_invalid_replies} onChange={(event) => agentForm.setData('handoff_after_invalid_replies', Number(event.target.value))} />
                            <p className="mt-1 text-xs text-waify-text-muted dark:text-waify-dark-text-muted">Pause or handoff after this many unmatched replies.</p>
                        </div>
                    </div>

                    <div>
                        <Label htmlFor="agent-fallback">Fallback when unsure</Label>
                        <Textarea
                            id="agent-fallback"
                            value={agentForm.data.fallback_reply}
                            onChange={(event) => agentForm.setData('fallback_reply', event.target.value)}
                            rows={3}
                            placeholder="I want to answer this correctly. Let me connect you with a team member."
                        />
                    </div>

                    <div className="grid gap-4 sm:grid-cols-3">
                        <label className="flex items-center gap-2 rounded-card border border-gray-100 px-3 py-2 text-sm dark:border-waify-dark-border sm:col-span-1">
                            <input type="checkbox" checked={agentForm.data.is_active} onChange={(event) => agentForm.setData('is_active', event.target.checked)} className="rounded border-gray-300 text-waify-green focus:ring-waify-green" />
                            <span className="text-waify-text dark:text-waify-dark-text">Active</span>
                        </label>
                        <div>
                            <Label htmlFor="agent-max-replies">Auto reply cap</Label>
                            <Input id="agent-max-replies" type="number" min={0} max={20} value={agentForm.data.max_auto_replies_per_conversation} onChange={(event) => agentForm.setData('max_auto_replies_per_conversation', Number(event.target.value))} />
                        </div>
                        <div>
                            <Label htmlFor="agent-confidence">Confidence</Label>
                            <Input id="agent-confidence" type="number" min={0} max={1} step={0.05} value={agentForm.data.confidence_threshold} onChange={(event) => agentForm.setData('confidence_threshold', Number(event.target.value))} />
                        </div>
                        <div>
                            <Label htmlFor="agent-max-chars">Max reply length</Label>
                            <Input id="agent-max-chars" type="number" min={120} max={4000} value={agentForm.data.max_reply_chars} onChange={(event) => agentForm.setData('max_reply_chars', Number(event.target.value))} />
                            <p className="mt-1 text-xs text-waify-text-muted dark:text-waify-dark-text-muted">Use 1800-2500 for pricing and sales replies.</p>
                        </div>
                    </div>

                    <Card className="border-gray-100 dark:border-waify-dark-border">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-base">
                                <Bot className="h-4 w-4 text-waify-green-dark dark:text-emerald-300" />
                                Agent simulator
                            </CardTitle>
                            <CardDescription>Test replies and safety decisions before using the agent in Inbox.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <div>
                                <Label htmlFor="agent-sim-message">Customer message</Label>
                                <Textarea id="agent-sim-message" value={simulationMessage} onChange={(event) => setSimulationMessage(event.target.value)} rows={3} />
                            </div>
                            <div>
                                <Label htmlFor="agent-sim-context">Optional context</Label>
                                <Textarea id="agent-sim-context" value={simulationContext} onChange={(event) => setSimulationContext(event.target.value)} rows={3} placeholder="Recent order, product, or policy context..." />
                            </div>
                            <Button type="button" variant="secondary" onClick={simulateAgent} disabled={simulationLoading || !editingAgent}>
                                <Sparkles className="h-4 w-4" />
                                {simulationLoading ? 'Running...' : 'Run simulation'}
                            </Button>
                            {!editingAgent && (
                                <p className="text-xs text-waify-text-muted dark:text-waify-dark-text-muted">Create the agent once, then reopen it to run simulations against saved safety rules.</p>
                            )}
                            {simulationResult && (
                                <div className="space-y-3 rounded-card border border-gray-100 bg-gray-50 p-4 dark:border-waify-dark-border dark:bg-waify-dark-surface-2">
                                    <div className="flex items-center justify-between gap-3">
                                        <p className="text-sm font-semibold text-waify-text dark:text-waify-dark-text">Simulation result</p>
                                        <StatusBadge tone={simulationResult.status === 'blocked' ? 'danger' : 'success'}>{simulationResult.status}</StatusBadge>
                                    </div>
                                    {simulationResult.reply && (
                                        <p className="rounded-btn bg-white p-3 text-sm text-waify-text dark:bg-waify-dark-surface dark:text-waify-dark-text">{simulationResult.reply}</p>
                                    )}
                                    <div className="grid gap-2">
                                        {simulationResult.safety.map((check) => (
                                            <div key={check.label} className="flex items-start justify-between gap-3 rounded-btn bg-white p-3 text-xs dark:bg-waify-dark-surface">
                                                <div>
                                                    <p className="font-semibold text-waify-text dark:text-waify-dark-text">{check.label}</p>
                                                    <p className="mt-1 text-waify-text-muted dark:text-waify-dark-text-muted">{check.message}</p>
                                                </div>
                                                <StatusBadge tone={check.severity === 'block' ? 'danger' : check.severity === 'warn' ? 'warning' : 'success'}>{check.severity}</StatusBadge>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </form>
            </Drawer>
        </AppShell>
    );
}
