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
import { Bot, CheckCircle2, ChevronDown, ChevronUp, MessageSquareText, Plus, Sparkles, Trash2, Wand2 } from 'lucide-react';

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

export default function AiIndex({
    ai_suggestions_enabled = false,
    ai_prompts = [],
    prompt_library = [],
    purpose_options = [],
    platform_ai_enabled = false,
    platform_ai_provider = 'openai',
    usage = { this_month: 0, by_feature: {}, period_start: '' },
}: {
    ai_suggestions_enabled: boolean;
    ai_prompts: PromptRow[];
    prompt_library?: (PromptRow & { purpose_description?: string })[];
    purpose_options?: PurposeOption[];
    platform_ai_enabled?: boolean;
    platform_ai_provider?: string;
    usage: UsageStats;
}) {
    const { toast } = useNotifications();
    const [showAdvanced, setShowAdvanced] = useState(false);

    const { data, setData, post, transform, processing, errors, recentlySuccessful } = useForm({
        ai_suggestions_enabled,
        ai_prompts: Array.isArray(ai_prompts) && ai_prompts.length > 0 ? ai_prompts : [],
    });

    const conversationPrompts = useMemo(
        () => data.ai_prompts.filter((row) => row.purpose === 'conversation_suggest'),
        [data.ai_prompts],
    );

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

    const submit = (event: React.FormEvent) => {
        event.preventDefault();

        const cleaned = data.ai_prompts
            .map((row) => ({
                purpose: (row.purpose || '').trim(),
                label: (row.label || '').trim(),
                prompt: (row.prompt || '').trim(),
                scope: row.scope || 'all',
                enabled: row.enabled !== false,
            }))
            .filter((row) => row.purpose || row.label || row.prompt);

        const hasIncomplete = cleaned.some((row) => !row.purpose || !row.label || !row.prompt);
        if (hasIncomplete) {
            toast.warning('Incomplete instructions', 'Finish each custom instruction or remove the empty row.');
            return;
        }

        transform(() => ({
            ai_suggestions_enabled: data.ai_suggestions_enabled,
            ai_prompts: cleaned,
        }));

        post(route('app.ai.settings'), { preserveScroll: true });
    };

    const featureLabels: Record<string, string> = {
        conversation_suggest: 'Reply suggestions',
        support_reply: 'Support assistant',
    };

    const platformStatus = platform_ai_enabled ? 'Ready' : 'Unavailable';
    const toggleLabel = data.ai_suggestions_enabled ? 'On' : 'Off';

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
                        <p className="mt-2 max-w-2xl text-sm text-gray-600 dark:text-gray-400">
                            Keep AI simple: turn it on for chat replies, pick a reply style, and save any custom instructions your team needs.
                        </p>
                    </div>
                    <div className="flex gap-2">
                        <Badge variant={platform_ai_enabled ? 'success' : 'secondary'}>{platformStatus}</Badge>
                        <Badge variant="secondary">Provider: {platform_ai_provider}</Badge>
                    </div>
                </div>

                <form onSubmit={submit} className="space-y-6">
                    {!platform_ai_enabled ? (
                        <Alert variant="warning">
                            AI is turned off at the platform level. You can still prepare your settings here, but suggestions will stay unavailable until AI is enabled for the platform.
                        </Alert>
                    ) : null}

                    <div className="grid gap-4 xl:grid-cols-[1.1fr_0.9fr]">
                        <Card>
                            <CardHeader>
                                <CardTitle>Reply suggestions</CardTitle>
                                <CardDescription>
                                    Show an AI helper in WhatsApp conversations so your team can draft replies faster.
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-5">
                                <div className="flex items-center justify-between rounded-2xl border border-gray-200 bg-gray-50 p-4 dark:border-gray-800 dark:bg-gray-900/50">
                                    <div>
                                        <p className="font-medium text-gray-900 dark:text-gray-100">Use AI in chats</p>
                                        <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                                            Adds a suggest action in the conversation composer.
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <Badge variant={data.ai_suggestions_enabled ? 'success' : 'secondary'}>{toggleLabel}</Badge>
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
                                        <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">Open Inbox and tap the suggest action inside a conversation.</p>
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
                                    <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">Total AI requests in this account.</p>
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
                                <Button
                                    type="button"
                                    variant="ghost"
                                    onClick={() => setShowAdvanced((value) => !value)}
                                    className="gap-2"
                                >
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
