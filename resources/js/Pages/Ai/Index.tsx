import { useMemo, useState } from 'react';
import { Head, useForm } from '@inertiajs/react';
import AppShell from '@/Layouts/AppShell';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/Components/UI/Card';
import { Switch } from '@/Components/UI/Switch';
import Button from '@/Components/UI/Button';
import TextInput from '@/Components/TextInput';
import { Textarea } from '@/Components/UI/Textarea';
import { Alert } from '@/Components/UI/Alert';
import { Badge } from '@/Components/UI/Badge';
import InputError from '@/Components/InputError';
import { useNotifications } from '@/hooks/useNotifications';
import { Bot, CheckCircle2, ChevronDown, ChevronUp, Database, MessageSquareText, Plus, Sparkles, Trash2, Wand2 } from 'lucide-react';

interface PromptRow {
    purpose: string;
    label: string;
    prompt: string;
    scope?: 'all' | 'owner' | 'admin' | 'member';
    enabled?: boolean;
}

interface PurposeOption {
    value: string;
    label: string;
    description: string;
}

interface UsageStats {
    this_month: number;
    by_feature: Record<string, number>;
    period_start: string;
}

interface AutoReplyMode {
    value: string;
    label: string;
}

interface KnowledgeItem {
    id?: number;
    title: string;
    content: string;
    is_enabled?: boolean;
    sort_order?: number;
}

interface AccountAiSettings {
    enabled: boolean;
    mode: string;
    prompt: string;
    handoff_message: string;
    handoff_keywords: string[];
    stop_when_assigned: boolean;
}

export default function AiIndex({
    ai_suggestions_enabled = false,
    ai_prompts = [],
    prompt_library = [],
    purpose_options = [],
    platform_ai_enabled = false,
    platform_ai_provider = 'openai',
    usage = { this_month: 0, by_feature: {}, period_start: '' },
    can_manage_auto_reply = false,
    account_ai = {
        enabled: false,
        mode: 'suggest_only',
        prompt: '',
        handoff_message: '',
        handoff_keywords: [],
        stop_when_assigned: true,
    },
    knowledge_items = [],
    auto_reply_modes = [],
}: {
    ai_suggestions_enabled: boolean;
    ai_prompts: PromptRow[];
    prompt_library?: (PromptRow & { purpose_description?: string })[];
    purpose_options?: PurposeOption[];
    platform_ai_enabled?: boolean;
    platform_ai_provider?: string;
    usage: UsageStats;
    can_manage_auto_reply?: boolean;
    account_ai?: AccountAiSettings;
    knowledge_items?: KnowledgeItem[];
    auto_reply_modes?: AutoReplyMode[];
}) {
    const { toast } = useNotifications();
    const [showAdvanced, setShowAdvanced] = useState(false);
    const [showKnowledgeBase, setShowKnowledgeBase] = useState((knowledge_items?.length ?? 0) > 0);

    const { data, setData, post, transform, processing, errors, recentlySuccessful } = useForm({
        ai_suggestions_enabled,
        ai_prompts: Array.isArray(ai_prompts) && ai_prompts.length > 0 ? ai_prompts : [],
        account_ai: {
            enabled: Boolean(account_ai?.enabled),
            mode: account_ai?.mode || 'suggest_only',
            prompt: account_ai?.prompt || '',
            handoff_message: account_ai?.handoff_message || '',
            handoff_keywords: Array.isArray(account_ai?.handoff_keywords) ? account_ai.handoff_keywords.join(', ') : '',
            stop_when_assigned: account_ai?.stop_when_assigned ?? true,
        },
        knowledge_items: Array.isArray(knowledge_items) ? knowledge_items : [],
    });

    const conversationPrompts = useMemo(
        () => data.ai_prompts.filter((row) => row.purpose === 'conversation_suggest'),
        [data.ai_prompts],
    );

    const featureLabels: Record<string, string> = {
        conversation_suggest: 'Reply suggestions',
        support_reply: 'Support assistant',
        auto_reply: 'Auto replies',
    };

    const addPrompt = () => {
        setShowAdvanced(true);
        setData('ai_prompts', [
            ...data.ai_prompts,
            { purpose: 'conversation_suggest', label: '', prompt: '', scope: 'all' as const, enabled: true },
        ]);
    };

    const addFromLibrary = (libraryPrompt: PromptRow) => {
        const alreadyExists = data.ai_prompts.some(
            (row) => row.purpose === libraryPrompt.purpose && row.label === libraryPrompt.label && row.prompt === libraryPrompt.prompt,
        );

        if (alreadyExists) {
            toast.info('Already added', 'This reply style is already in your AI setup.');
            return;
        }

        setData('ai_prompts', [
            ...data.ai_prompts,
            {
                purpose: libraryPrompt.purpose,
                label: libraryPrompt.label,
                prompt: libraryPrompt.prompt,
                scope: libraryPrompt.scope ?? 'all',
                enabled: true,
            },
        ]);
        toast.success('Reply style added');
    };

    const updatePrompt = (index: number, field: keyof PromptRow, value: PromptRow[keyof PromptRow]) => {
        setData(
            'ai_prompts',
            data.ai_prompts.map((row, rowIndex) => (rowIndex === index ? { ...row, [field]: value } : row)),
        );
    };

    const removePrompt = (index: number) => {
        setData(
            'ai_prompts',
            data.ai_prompts.filter((_, rowIndex) => rowIndex !== index),
        );
    };

    const addKnowledgeItem = () => {
        setShowKnowledgeBase(true);
        setData('knowledge_items', [
            ...data.knowledge_items,
            { title: '', content: '', is_enabled: true, sort_order: data.knowledge_items.length },
        ]);
    };

    const updateKnowledgeItem = (index: number, field: keyof KnowledgeItem, value: KnowledgeItem[keyof KnowledgeItem]) => {
        setData(
            'knowledge_items',
            data.knowledge_items.map((row, rowIndex) => (rowIndex === index ? { ...row, [field]: value } : row)),
        );
    };

    const removeKnowledgeItem = (index: number) => {
        setData(
            'knowledge_items',
            data.knowledge_items.filter((_, rowIndex) => rowIndex !== index).map((row, rowIndex) => ({ ...row, sort_order: rowIndex })),
        );
    };

    const submit = (event: React.FormEvent) => {
        event.preventDefault();

        const cleanedPrompts = data.ai_prompts
            .map((row) => ({
                purpose: (row.purpose || '').trim(),
                label: (row.label || '').trim(),
                prompt: (row.prompt || '').trim(),
                scope: row.scope || 'all',
                enabled: row.enabled !== false,
            }))
            .filter((row) => row.purpose || row.label || row.prompt);

        const hasIncompletePrompts = cleanedPrompts.some((row) => !row.purpose || !row.label || !row.prompt);
        if (hasIncompletePrompts) {
            toast.warning('Incomplete instructions', 'Finish each custom instruction or remove the empty row.');
            return;
        }

        const cleanedKnowledgeItems = data.knowledge_items
            .map((item, index) => ({
                id: item.id,
                title: (item.title || '').trim(),
                content: (item.content || '').trim(),
                is_enabled: item.is_enabled !== false,
                sort_order: index,
            }))
            .filter((item) => item.title || item.content);

        const hasIncompleteKnowledge = cleanedKnowledgeItems.some((item) => !item.title || !item.content);
        if (hasIncompleteKnowledge) {
            toast.warning('Incomplete knowledge base', 'Each knowledge item needs both a title and the approved answer.');
            return;
        }

        transform(() => ({
            ai_suggestions_enabled: data.ai_suggestions_enabled,
            ai_prompts: cleanedPrompts,
            account_ai: {
                enabled: data.account_ai.enabled,
                mode: data.account_ai.mode,
                prompt: data.account_ai.prompt,
                handoff_message: data.account_ai.handoff_message,
                handoff_keywords: data.account_ai.handoff_keywords,
                stop_when_assigned: data.account_ai.stop_when_assigned,
            },
            knowledge_items: cleanedKnowledgeItems,
        }));

        post(route('app.ai.settings'), { preserveScroll: true });
    };

    return (
        <AppShell>
            <Head title="AI Assistant" />

            <div className="space-y-6">
                <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
                    <div>
                        <h1 className="flex items-center gap-3 text-3xl font-semibold text-gray-900 dark:text-gray-100">
                            <Sparkles className="h-7 w-7 text-[#00a884]" />
                            AI Assistant
                        </h1>
                        <p className="mt-2 max-w-3xl text-sm text-gray-600 dark:text-gray-400">
                            Keep AI easy to use. Turn on reply suggestions for your team, then optionally let AI answer common questions automatically from your approved knowledge base.
                        </p>
                    </div>
                    <div className="flex gap-2">
                        <Badge variant={platform_ai_enabled ? 'success' : 'secondary'}>{platform_ai_enabled ? 'Ready' : 'Unavailable'}</Badge>
                        <Badge variant="secondary">Provider: {platform_ai_provider}</Badge>
                    </div>
                </div>

                <form onSubmit={submit} className="space-y-6">
                    {!platform_ai_enabled ? (
                        <Alert variant="warning">
                            AI is turned off at the platform level. You can still prepare your settings here, but AI replies will stay unavailable until platform AI is enabled.
                        </Alert>
                    ) : null}

                    <div className="grid gap-4 xl:grid-cols-[1.15fr_0.85fr]">
                        <Card>
                            <CardHeader>
                                <CardTitle>Reply suggestions</CardTitle>
                                <CardDescription>
                                    Add a suggest action in chats so teammates can draft faster replies without sending anything automatically.
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-5">
                                <div className="flex items-center justify-between rounded-2xl border border-gray-200 bg-gray-50 p-4 dark:border-gray-800 dark:bg-gray-900/50">
                                    <div>
                                        <p className="font-medium text-gray-900 dark:text-gray-100">Use AI in chats</p>
                                        <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">Shows a suggest button in the conversation composer.</p>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <Badge variant={data.ai_suggestions_enabled ? 'success' : 'secondary'}>{data.ai_suggestions_enabled ? 'On' : 'Off'}</Badge>
                                        <Switch
                                            checked={data.ai_suggestions_enabled}
                                            onCheckedChange={(checked) => setData('ai_suggestions_enabled', checked)}
                                            disabled={!platform_ai_enabled}
                                        />
                                    </div>
                                </div>

                                <div className="grid gap-3 md:grid-cols-3">
                                    <div className="rounded-2xl border border-gray-200 p-4 dark:border-gray-800">
                                        <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-[#e7f7f2] text-[#007f67] dark:bg-[#0f2f28] dark:text-[#4dd4b7]">
                                            <Bot className="h-5 w-5" />
                                        </div>
                                        <p className="font-medium text-gray-900 dark:text-gray-100">1. Turn it on</p>
                                        <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">Enable AI suggestions for your own conversation view.</p>
                                    </div>
                                    <div className="rounded-2xl border border-gray-200 p-4 dark:border-gray-800">
                                        <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-[#e7f7f2] text-[#007f67] dark:bg-[#0f2f28] dark:text-[#4dd4b7]">
                                            <Wand2 className="h-5 w-5" />
                                        </div>
                                        <p className="font-medium text-gray-900 dark:text-gray-100">2. Pick a style</p>
                                        <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">Use a ready-made reply style or create your own.</p>
                                    </div>
                                    <div className="rounded-2xl border border-gray-200 p-4 dark:border-gray-800">
                                        <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-[#e7f7f2] text-[#007f67] dark:bg-[#0f2f28] dark:text-[#4dd4b7]">
                                            <MessageSquareText className="h-5 w-5" />
                                        </div>
                                        <p className="font-medium text-gray-900 dark:text-gray-100">3. Use in chat</p>
                                        <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">Open Inbox and tap the AI button inside a conversation.</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Usage</CardTitle>
                                <CardDescription>Track how much your team used AI this month.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="rounded-2xl border border-gray-200 bg-gray-50 p-4 dark:border-gray-800 dark:bg-gray-900/50">
                                    <p className="text-sm text-gray-500 dark:text-gray-400">This month</p>
                                    <p className="mt-2 text-3xl font-semibold text-gray-900 dark:text-gray-100">{usage?.this_month ?? 0}</p>
                                    <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">Total AI requests linked to your user.</p>
                                </div>

                                <div className="space-y-2">
                                    {Object.keys(usage?.by_feature ?? {}).length > 0 ? (
                                        Object.entries(usage.by_feature).map(([feature, count]) => (
                                            <div key={feature} className="flex items-center justify-between rounded-xl border border-gray-200 px-4 py-3 dark:border-gray-800">
                                                <span className="text-sm text-gray-600 dark:text-gray-400">{featureLabels[feature] ?? feature}</span>
                                                <span className="font-medium text-gray-900 dark:text-gray-100">{count}</span>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="rounded-xl border border-dashed border-gray-300 px-4 py-6 text-sm text-gray-500 dark:border-gray-700 dark:text-gray-400">
                                            No AI usage yet this month.
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    <Card>
                        <CardHeader>
                            <CardTitle>Auto replies</CardTitle>
                            <CardDescription>
                                Let AI answer common questions automatically from your approved business instructions and knowledge base.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-5">
                            {!can_manage_auto_reply ? (
                                <Alert variant="info">Only account owners and admins can change automatic reply settings.</Alert>
                            ) : null}

                            <div className="grid gap-4 lg:grid-cols-[1fr_220px]">
                                <div className="rounded-2xl border border-gray-200 bg-gray-50 p-4 dark:border-gray-800 dark:bg-gray-900/50">
                                    <div className="flex items-center justify-between gap-4">
                                        <div>
                                            <p className="font-medium text-gray-900 dark:text-gray-100">Automatic replies</p>
                                            <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                                                Safe default: only auto reply while the 24-hour WhatsApp reply window is open.
                                            </p>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <Badge variant={data.account_ai.enabled ? 'success' : 'secondary'}>
                                                {data.account_ai.enabled ? 'Enabled' : 'Off'}
                                            </Badge>
                                            <Switch
                                                checked={data.account_ai.enabled}
                                                onCheckedChange={(checked) => setData('account_ai', { ...data.account_ai, enabled: checked })}
                                                disabled={!platform_ai_enabled || !can_manage_auto_reply}
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">Reply mode</label>
                                    <select
                                        value={data.account_ai.mode}
                                        onChange={(event) => setData('account_ai', { ...data.account_ai, mode: event.target.value })}
                                        disabled={!can_manage_auto_reply}
                                        className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100"
                                    >
                                        {(auto_reply_modes.length > 0 ? auto_reply_modes : [{ value: 'suggest_only', label: 'Suggest only' }]).map((mode) => (
                                            <option key={mode.value} value={mode.value}>{mode.label}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div className="grid gap-4 lg:grid-cols-2">
                                <div>
                                    <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">Business instructions</label>
                                    <Textarea
                                        value={data.account_ai.prompt}
                                        onChange={(event) => setData('account_ai', { ...data.account_ai, prompt: event.target.value })}
                                        rows={5}
                                        disabled={!can_manage_auto_reply}
                                        placeholder="Example: Reply as a helpful support team. Keep answers short. Never promise refunds or custom pricing."
                                        className="w-full text-sm"
                                    />
                                    <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                                        These rules are applied before the knowledge base. Keep them short and policy-focused.
                                    </p>
                                </div>

                                <div className="space-y-4">
                                    <div>
                                        <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">Handoff message</label>
                                        <Textarea
                                            value={data.account_ai.handoff_message}
                                            onChange={(event) => setData('account_ai', { ...data.account_ai, handoff_message: event.target.value })}
                                            rows={3}
                                            disabled={!can_manage_auto_reply}
                                            placeholder="Example: A team member will review this and get back to you shortly."
                                            className="w-full text-sm"
                                        />
                                    </div>
                                    <div>
                                        <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">Handoff keywords</label>
                                        <TextInput
                                            value={data.account_ai.handoff_keywords}
                                            onChange={(event) => setData('account_ai', { ...data.account_ai, handoff_keywords: event.target.value })}
                                            disabled={!can_manage_auto_reply}
                                            placeholder="refund, complaint, legal, manager"
                                        />
                                        <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                                            If an incoming message contains one of these words, AI will stay out and the conversation stays for a human.
                                        </p>
                                    </div>
                                    <label className="flex items-center gap-3 rounded-xl border border-gray-200 px-4 py-3 text-sm text-gray-700 dark:border-gray-800 dark:text-gray-300">
                                        <Switch
                                            checked={data.account_ai.stop_when_assigned}
                                            onCheckedChange={(checked) => setData('account_ai', { ...data.account_ai, stop_when_assigned: checked })}
                                            disabled={!can_manage_auto_reply}
                                        />
                                        Stop auto replies after a teammate takes the conversation
                                    </label>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <div className="flex items-center justify-between gap-3">
                                <div>
                                    <CardTitle>Knowledge base</CardTitle>
                                    <CardDescription>
                                        Add approved answers for FAQs. AI uses these to answer common questions automatically.
                                    </CardDescription>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Button type="button" variant="secondary" onClick={addKnowledgeItem} disabled={!can_manage_auto_reply} className="gap-2">
                                        <Plus className="h-4 w-4" />
                                        Add item
                                    </Button>
                                    <Button type="button" variant="ghost" onClick={() => setShowKnowledgeBase((value) => !value)} className="gap-2">
                                        {showKnowledgeBase ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                                        {showKnowledgeBase ? 'Hide' : 'Show'}
                                    </Button>
                                </div>
                            </div>
                        </CardHeader>
                        {showKnowledgeBase ? (
                            <CardContent className="space-y-4">
                                {data.knowledge_items.length === 0 ? (
                                    <div className="rounded-2xl border border-dashed border-gray-300 px-4 py-8 text-sm text-gray-500 dark:border-gray-700 dark:text-gray-400">
                                        Add FAQs, pricing rules, timings, service details, or support policy snippets here.
                                    </div>
                                ) : null}

                                {data.knowledge_items.map((item, index) => (
                                    <div key={item.id ?? index} className="rounded-2xl border border-gray-200 p-4 dark:border-gray-800">
                                        <div className="mb-3 flex items-center justify-between gap-3">
                                            <div className="flex items-center gap-2 text-sm font-medium text-gray-900 dark:text-gray-100">
                                                <Database className="h-4 w-4 text-[#007f67]" />
                                                Knowledge item {index + 1}
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <label className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                                                    <Switch
                                                        checked={item.is_enabled !== false}
                                                        onCheckedChange={(checked) => updateKnowledgeItem(index, 'is_enabled', checked)}
                                                        disabled={!can_manage_auto_reply}
                                                    />
                                                    Enabled
                                                </label>
                                                <Button type="button" variant="ghost" onClick={() => removeKnowledgeItem(index)} disabled={!can_manage_auto_reply} className="px-3">
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </div>
                                        <div className="grid gap-3 lg:grid-cols-[1fr_2fr]">
                                            <TextInput
                                                placeholder="Title, for example Shipping time"
                                                value={item.title}
                                                onChange={(event) => updateKnowledgeItem(index, 'title', event.target.value)}
                                                disabled={!can_manage_auto_reply}
                                            />
                                            <Textarea
                                                placeholder="Approved answer, for example Orders are usually delivered in 2-4 business days."
                                                value={item.content}
                                                onChange={(event) => updateKnowledgeItem(index, 'content', event.target.value)}
                                                rows={3}
                                                disabled={!can_manage_auto_reply}
                                                className="w-full text-sm"
                                            />
                                        </div>
                                    </div>
                                ))}
                                <InputError message={errors.knowledge_items} className="mt-0" />
                            </CardContent>
                        ) : null}
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Reply styles</CardTitle>
                            <CardDescription>
                                Start with a ready-made instruction. These are used for conversation reply suggestions.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <div className="grid gap-3 lg:grid-cols-2">
                                {prompt_library.map((preset, index) => (
                                    <div key={`${preset.purpose}-${index}`} className="rounded-2xl border border-gray-200 p-4 dark:border-gray-800">
                                        <div className="flex items-start justify-between gap-3">
                                            <div>
                                                <p className="font-medium text-gray-900 dark:text-gray-100">{preset.label}</p>
                                                <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                                                    {(preset as { purpose_description?: string }).purpose_description ?? 'Conversation reply suggestions'}
                                                </p>
                                            </div>
                                            <Button type="button" variant="secondary" onClick={() => addFromLibrary(preset)}>
                                                Use
                                            </Button>
                                        </div>
                                        <p className="mt-3 text-sm text-gray-700 dark:text-gray-300">{preset.prompt}</p>
                                    </div>
                                ))}
                            </div>

                            {conversationPrompts.length > 0 ? (
                                <div className="rounded-2xl border border-[#cfeee6] bg-[#f4fbf8] p-4 dark:border-[#17493e] dark:bg-[#0e201b]">
                                    <div className="flex items-center gap-2 text-sm font-medium text-[#0a6b57] dark:text-[#6ce0c1]">
                                        <CheckCircle2 className="h-4 w-4" />
                                        Active reply styles
                                    </div>
                                    <div className="mt-3 flex flex-wrap gap-2">
                                        {conversationPrompts.filter((row) => row.enabled !== false).map((row, index) => (
                                            <Badge key={`${row.label}-${index}`} variant="secondary">{row.label}</Badge>
                                        ))}
                                    </div>
                                </div>
                            ) : null}
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <div className="flex items-center justify-between gap-3">
                                <div>
                                    <CardTitle>Advanced instructions</CardTitle>
                                    <CardDescription>
                                        Add custom instructions only if your team needs something more specific.
                                    </CardDescription>
                                </div>
                                <Button type="button" variant="ghost" onClick={() => setShowAdvanced((value) => !value)} className="gap-2">
                                    {showAdvanced ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                                    {showAdvanced ? 'Hide' : 'Show'}
                                </Button>
                            </div>
                        </CardHeader>
                        {showAdvanced ? (
                            <CardContent className="space-y-4">
                                {Array.isArray(purpose_options) && purpose_options.length > 0 ? (
                                    <div className="rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm text-gray-600 dark:border-gray-800 dark:bg-gray-900/50 dark:text-gray-400">
                                        <p className="font-medium text-gray-900 dark:text-gray-100">Where each instruction is used</p>
                                        <div className="mt-2 space-y-1">
                                            {purpose_options.map((option) => (
                                                <div key={option.value}>
                                                    <span className="font-mono text-xs text-[#007f67] dark:text-[#6ce0c1]">{option.value}</span>
                                                    <span> — {option.description}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ) : null}

                                {data.ai_prompts.map((row, index) => (
                                    <div key={index} className="rounded-2xl border border-gray-200 p-4 dark:border-gray-800">
                                        <div className="grid gap-3 lg:grid-cols-[1.2fr_1fr_180px_auto_auto]">
                                            <TextInput
                                                placeholder="Purpose"
                                                value={row.purpose}
                                                onChange={(event) => updatePrompt(index, 'purpose', event.target.value)}
                                            />
                                            <TextInput
                                                placeholder="Label"
                                                value={row.label}
                                                onChange={(event) => updatePrompt(index, 'label', event.target.value)}
                                            />
                                            <select
                                                value={row.scope || 'all'}
                                                onChange={(event) => updatePrompt(index, 'scope', event.target.value)}
                                                className="rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100"
                                            >
                                                <option value="all">All roles</option>
                                                <option value="owner">Owner</option>
                                                <option value="admin">Admin</option>
                                                <option value="member">Member</option>
                                            </select>
                                            <div className="flex items-center justify-center">
                                                <Switch
                                                    checked={row.enabled !== false}
                                                    onCheckedChange={(checked) => updatePrompt(index, 'enabled', checked)}
                                                />
                                            </div>
                                            <Button type="button" variant="ghost" onClick={() => removePrompt(index)} className="px-3">
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                        <Textarea
                                            placeholder="Prompt text"
                                            value={row.prompt}
                                            onChange={(event) => updatePrompt(index, 'prompt', event.target.value)}
                                            rows={3}
                                            className="mt-3 w-full text-sm"
                                        />
                                    </div>
                                ))}

                                <div className="flex items-center justify-between gap-3">
                                    <Button type="button" variant="secondary" onClick={addPrompt} className="gap-2">
                                        <Plus className="h-4 w-4" />
                                        Add instruction
                                    </Button>
                                    <InputError message={errors?.ai_prompts} className="mt-0" />
                                </div>
                            </CardContent>
                        ) : null}
                    </Card>

                    <div className="flex items-center justify-end gap-4">
                        <Button type="submit" disabled={processing}>
                            {processing ? 'Saving...' : 'Save AI settings'}
                        </Button>
                        {recentlySuccessful ? (
                            <div className="flex items-center gap-2 text-sm text-green-600 dark:text-green-400">
                                <CheckCircle2 className="h-4 w-4" />
                                Saved
                            </div>
                        ) : null}
                    </div>
                </form>
            </div>
        </AppShell>
    );
}
