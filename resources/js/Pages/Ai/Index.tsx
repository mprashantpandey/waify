import { useState } from 'react';
import { useForm } from '@inertiajs/react';
import AppShell from '@/Layouts/AppShell';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/Components/UI/Card';
import { Label } from '@/Components/UI/Label';
import { Switch } from '@/Components/UI/Switch';
import Button from '@/Components/UI/Button';
import TextInput from '@/Components/TextInput';
import { Textarea } from '@/Components/UI/Textarea';
import { Head } from '@inertiajs/react';
import { Sparkles, Plus, Trash2, BarChart3, CheckCircle2 } from 'lucide-react';
import { Transition } from '@headlessui/react';
import InputError from '@/Components/InputError';
import { useNotifications } from '@/hooks/useNotifications';

interface PromptRow {
    purpose: string;
    label: string;
    prompt: string;
}

interface UsageStats {
    this_month: number;
    by_feature: Record<string, number>;
    period_start: string;
}

export default function AiIndex({
    ai_suggestions_enabled = false,
    ai_prompts = [],
    platform_ai_enabled = false,
    platform_ai_provider = 'openai',
    usage = { this_month: 0, by_feature: {}, period_start: '' },
}: {
    ai_suggestions_enabled: boolean;
    ai_prompts: PromptRow[];
    platform_ai_enabled?: boolean;
    platform_ai_provider?: string;
    usage: UsageStats;
}) {
    const { toast } = useNotifications();

    const { data, setData, post, transform, processing, errors, recentlySuccessful } = useForm({
        ai_suggestions_enabled,
        ai_prompts: Array.isArray(ai_prompts) && ai_prompts.length > 0 ? ai_prompts : [],
    });

    const addPrompt = () => {
        const next = [...data.ai_prompts, { purpose: `custom_${Date.now()}`, label: '', prompt: '' }];
        setData('ai_prompts', next);
    };

    const updatePrompt = (index: number, field: keyof PromptRow, value: string) => {
        const next = data.ai_prompts.map((p, i) => (i === index ? { ...p, [field]: value } : p));
        setData('ai_prompts', next);
    };

    const removePrompt = (index: number) => {
        const next = data.ai_prompts.filter((_, i) => i !== index);
        setData('ai_prompts', next);
    };

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        const cleaned = data.ai_prompts
            .map((row) => ({
                purpose: (row.purpose || '').trim(),
                label: (row.label || '').trim(),
                prompt: (row.prompt || '').trim(),
            }))
            .filter((row) => row.purpose || row.label || row.prompt);

        const hasIncomplete = cleaned.some((row) => !row.purpose || !row.label || !row.prompt);
        if (hasIncomplete) {
            toast.warning('Incomplete prompt rows', 'Fill purpose/label/prompt or remove incomplete rows.');
            return;
        }

        setData('ai_prompts', cleaned);
        transform(() => ({
            ai_suggestions_enabled: data.ai_suggestions_enabled,
            ai_prompts: cleaned,
        }));
        post(route('app.ai.settings'), {
            preserveScroll: true,
        });
    };

    const featureLabels: Record<string, string> = {
        conversation_suggest: 'Conversation reply suggestions',
        support_reply: 'Support assistant',
    };

    return (
        <AppShell>
            <Head title="AI Assistant" />
            <div className="space-y-8">
                <div>
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-gray-100 dark:to-gray-300 bg-clip-text text-transparent flex items-center gap-3">
                        <Sparkles className="h-8 w-8 text-amber-500" />
                        AI Assistant
                    </h1>
                    <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                        Enable AI features, manage prompts for different purposes, and view usage.
                    </p>
                </div>

                <form onSubmit={submit} className="space-y-6">
                    {!platform_ai_enabled && (
                        <Card className="border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-900/20">
                            <CardContent className="p-4 text-sm text-amber-800 dark:text-amber-200">
                                AI is currently disabled in platform settings. Your personal prompts are saved, but AI suggestions will stay unavailable until a super admin enables AI.
                            </CardContent>
                        </Card>
                    )}

                    <Card className="border-0 shadow-lg">
                        <CardHeader className="bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20">
                            <CardTitle className="text-lg font-bold">Conversation AI</CardTitle>
                            <CardDescription>
                                Show an AI suggest button in WhatsApp chats to get reply suggestions (requires AI module on your plan).
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <Label className="text-sm font-semibold">AI suggestions in conversations</Label>
                                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                                        When enabled, you’ll see a suggest button in chat to generate reply ideas.
                                    </p>
                                </div>
                                <Switch
                                    checked={data.ai_suggestions_enabled}
                                    onCheckedChange={(checked) => setData('ai_suggestions_enabled', checked)}
                                    disabled={!platform_ai_enabled}
                                />
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-0 shadow-lg">
                        <CardHeader className="bg-gradient-to-r from-indigo-50 to-blue-50 dark:from-indigo-900/20 dark:to-blue-900/20">
                            <CardTitle className="text-lg font-bold">Your prompts</CardTitle>
                            <CardDescription>
                                Add prompts for different purposes. Use a short key (e.g. reply_suggestion, summary) and a label; the prompt text guides the AI for that use case.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="p-6 space-y-4">
                            {data.ai_prompts.map((row, index) => (
                                <div
                                    key={index}
                                    className="rounded-xl border border-gray-200 dark:border-gray-700 p-4 space-y-3 bg-white dark:bg-gray-800/50"
                                >
                                    <div className="flex items-center justify-between gap-2">
                                        <TextInput
                                            placeholder="Purpose key (e.g. reply_suggestion)"
                                            value={row.purpose}
                                            onChange={(e) => updatePrompt(index, 'purpose', e.target.value)}
                                            className="flex-1 max-w-[200px]"
                                        />
                                        <TextInput
                                            placeholder="Label"
                                            value={row.label}
                                            onChange={(e) => updatePrompt(index, 'label', e.target.value)}
                                            className="flex-1 max-w-[180px]"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => removePrompt(index)}
                                            className="p-2 text-gray-400 hover:text-red-600 rounded-lg"
                                            aria-label="Remove prompt"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </button>
                                    </div>
                                    <Textarea
                                        placeholder="Prompt text for this purpose..."
                                        value={row.prompt}
                                        onChange={(e) => updatePrompt(index, 'prompt', e.target.value)}
                                        rows={2}
                                        className="w-full text-sm"
                                    />
                                </div>
                            ))}
                            <Button type="button" variant="secondary" onClick={addPrompt} className="gap-2">
                                <Plus className="h-4 w-4" />
                                Add prompt
                            </Button>
                            <InputError message={errors?.ai_prompts} className="mt-2" />
                        </CardContent>
                    </Card>

                    <Card className="border-0 shadow-lg">
                        <CardHeader className="bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20">
                            <div className="flex items-center gap-2">
                                <BarChart3 className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                                <CardTitle className="text-lg font-bold">Usage & stats</CardTitle>
                            </div>
                            <CardDescription>
                                AI requests this month for your account.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="p-6">
                            <div className="flex items-baseline gap-2">
                                <span className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                                    {usage?.this_month ?? 0}
                                </span>
                                <span className="text-sm text-gray-500 dark:text-gray-400">requests this month</span>
                            </div>
                            <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                                Active provider: <span className="font-medium">{platform_ai_provider}</span>
                            </p>
                            {usage?.by_feature && Object.keys(usage.by_feature).length > 0 && (
                                <ul className="mt-4 space-y-2">
                                    {Object.entries(usage.by_feature).map(([feature, count]) => (
                                        <li key={feature} className="flex justify-between text-sm">
                                            <span className="text-gray-600 dark:text-gray-400">
                                                {featureLabels[feature] ?? feature}
                                            </span>
                                            <span className="font-medium text-gray-900 dark:text-gray-100">{count}</span>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </CardContent>
                    </Card>

                    <div className="flex items-center justify-end gap-4">
                        <Button type="submit" disabled={processing} className="bg-indigo-600 hover:bg-indigo-700 text-white">
                            {processing ? 'Saving...' : 'Save settings'}
                        </Button>
                        <Transition show={recentlySuccessful} enter="transition ease-out" enterFrom="opacity-0" leave="transition ease-in" leaveTo="opacity-0">
                            <div className="flex items-center gap-2 text-sm text-green-600 dark:text-green-400">
                                <CheckCircle2 className="h-4 w-4" />
                                Saved
                            </div>
                        </Transition>
                    </div>
                </form>
            </div>
        </AppShell>
    );
}
