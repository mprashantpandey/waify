import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/Components/UI/Card';
import { Label } from '@/Components/UI/Label';
import TextInput from '@/Components/TextInput';
import { Switch } from '@/Components/UI/Switch';

interface AiTabProps {
    data: any;
    setData: (key: string, value: any) => void;
    errors: Record<string, any>;
}

export default function AiTab({ data, setData, errors }: AiTabProps) {
    const ai = data.ai || {};

    return (
        <Card className="border-0 shadow-lg">
            <CardHeader className="bg-gradient-to-r from-indigo-50 to-indigo-100 dark:from-indigo-900/20 dark:to-indigo-800/20">
                <CardTitle className="text-xl font-bold">AI Settings</CardTitle>
                <CardDescription>Configure OpenAI or Gemini for the support assistant</CardDescription>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <Label className="text-sm font-semibold">Enable AI Assistant</Label>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                            Turn on AI-generated suggestions for support replies.
                        </p>
                    </div>
                    <Switch
                        checked={ai.enabled || false}
                        onCheckedChange={(checked) => setData('ai', { ...ai, enabled: checked })}
                    />
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                    <div>
                        <Label htmlFor="ai.provider">Provider</Label>
                        <select
                            id="ai.provider"
                            value={ai.provider || 'openai'}
                            onChange={(e) => setData('ai', { ...ai, provider: e.target.value })}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100"
                        >
                            <option value="openai">OpenAI</option>
                            <option value="gemini">Gemini</option>
                        </select>
                        {errors?.['ai.provider'] && (
                            <p className="text-sm text-red-600 mt-1">{errors['ai.provider']}</p>
                        )}
                    </div>
                    <div>
                        <Label htmlFor="ai.temperature">Temperature</Label>
                        <TextInput
                            id="ai.temperature"
                            type="number"
                            step="0.1"
                            min="0"
                            max="1"
                            value={ai.temperature ?? 0.2}
                            onChange={(e) => setData('ai', { ...ai, temperature: Number(e.target.value) })}
                            className="mt-1 block w-full"
                        />
                        {errors?.['ai.temperature'] && (
                            <p className="text-sm text-red-600 mt-1">{errors['ai.temperature']}</p>
                        )}
                    </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                    <div>
                        <Label htmlFor="ai.openai_api_key">OpenAI API Key</Label>
                        <TextInput
                            id="ai.openai_api_key"
                            type="password"
                            value={ai.openai_api_key || ''}
                            onChange={(e) => setData('ai', { ...ai, openai_api_key: e.target.value })}
                            className="mt-1 block w-full"
                            placeholder="sk-..."
                        />
                        {errors?.['ai.openai_api_key'] && (
                            <p className="text-sm text-red-600 mt-1">{errors['ai.openai_api_key']}</p>
                        )}
                    </div>
                    <div>
                        <Label htmlFor="ai.openai_model">OpenAI Model</Label>
                        <TextInput
                            id="ai.openai_model"
                            type="text"
                            value={ai.openai_model || 'gpt-4o-mini'}
                            onChange={(e) => setData('ai', { ...ai, openai_model: e.target.value })}
                            className="mt-1 block w-full"
                        />
                        {errors?.['ai.openai_model'] && (
                            <p className="text-sm text-red-600 mt-1">{errors['ai.openai_model']}</p>
                        )}
                    </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                    <div>
                        <Label htmlFor="ai.gemini_api_key">Gemini API Key</Label>
                        <TextInput
                            id="ai.gemini_api_key"
                            type="password"
                            value={ai.gemini_api_key || ''}
                            onChange={(e) => setData('ai', { ...ai, gemini_api_key: e.target.value })}
                            className="mt-1 block w-full"
                            placeholder="AIza..."
                        />
                        {errors?.['ai.gemini_api_key'] && (
                            <p className="text-sm text-red-600 mt-1">{errors['ai.gemini_api_key']}</p>
                        )}
                    </div>
                    <div>
                        <Label htmlFor="ai.gemini_model">Gemini Model</Label>
                        <TextInput
                            id="ai.gemini_model"
                            type="text"
                            value={ai.gemini_model || 'gemini-1.5-flash'}
                            onChange={(e) => setData('ai', { ...ai, gemini_model: e.target.value })}
                            className="mt-1 block w-full"
                        />
                        {errors?.['ai.gemini_model'] && (
                            <p className="text-sm text-red-600 mt-1">{errors['ai.gemini_model']}</p>
                        )}
                    </div>
                </div>

                <div>
                    <Label htmlFor="ai.system_prompt">System Prompt</Label>
                    <textarea
                        id="ai.system_prompt"
                        value={ai.system_prompt || ''}
                        onChange={(e) => setData('ai', { ...ai, system_prompt: e.target.value })}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100"
                        rows={3}
                        placeholder="You are a helpful support assistant..."
                    />
                    {errors?.['ai.system_prompt'] && (
                        <p className="text-sm text-red-600 mt-1">{errors['ai.system_prompt']}</p>
                    )}
                </div>

                <div>
                    <Label htmlFor="ai.max_tokens">Max Output Tokens</Label>
                    <TextInput
                        id="ai.max_tokens"
                        type="number"
                        min="50"
                        max="1000"
                        value={ai.max_tokens ?? 300}
                        onChange={(e) => setData('ai', { ...ai, max_tokens: Number(e.target.value) })}
                        className="mt-1 block w-full"
                    />
                    {errors?.['ai.max_tokens'] && (
                        <p className="text-sm text-red-600 mt-1">{errors['ai.max_tokens']}</p>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}
