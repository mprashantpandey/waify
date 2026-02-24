import { Head, router, useForm, usePage } from '@inertiajs/react';
import { useState } from 'react';
import AppShell from '@/Layouts/AppShell';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/Components/UI/Card';
import Button from '@/Components/UI/Button';
import TextInput from '@/Components/TextInput';
import InputLabel from '@/Components/InputLabel';
import InputError from '@/Components/InputError';
import { Code2, Key, Plus, Trash2, Copy, Check, BookOpen, AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/useToast';
import { useConfirm } from '@/hooks/useConfirm';

interface ApiKeyRow {
    id: number;
    name: string;
    key_prefix: string;
    last_used_at: string | null;
    created_at: string;
}

export default function DeveloperIndex({
    account,
    api_keys,
    base_url,
}: {
    account: any;
    api_keys: ApiKeyRow[];
    base_url: string;
}) {
    const { addToast } = useToast();
    const confirm = useConfirm();
    const page = usePage();
    const flash = (page.props as any).flash || {};
    const newApiKey = flash.new_api_key as { name: string; key: string; key_prefix: string } | undefined;

    const { data, setData, post, processing, errors, reset } = useForm({ name: '' });
    const [copied, setCopied] = useState(false);

    const handleCreateKey = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('app.developer.api-keys.store'), {
            preserveScroll: true,
            onSuccess: () => reset('name'),
        });
    };

    const handleRevoke = async (id: number, name: string) => {
        const ok = await confirm({
            title: 'Revoke API key',
            message: `Revoke "${name}"? This cannot be undone. Any apps using this key will stop working.`,
            variant: 'warning',
        });
        if (!ok) return;
        router.delete(route('app.developer.api-keys.destroy', { id }), { preserveScroll: true });
    };

    const copyKey = () => {
        if (!newApiKey?.key) return;
        navigator.clipboard.writeText(newApiKey.key);
        setCopied(true);
        addToast({ title: 'Copied', description: 'API key copied to clipboard.', variant: 'success' });
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <AppShell>
            <Head title="Developer - API keys" />
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-gray-100 dark:to-gray-300 bg-clip-text text-transparent flex items-center gap-3">
                            <Code2 className="h-8 w-8 text-indigo-500" />
                            Developer
                        </h1>
                        <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                            Manage API keys and integrate with Waify via the external API.
                        </p>
                    </div>
                    <Button
                        variant="secondary"
                        onClick={() => router.visit(route('app.developer.docs'))}
                        className="gap-2"
                    >
                        <BookOpen className="h-4 w-4" />
                        API documentation
                    </Button>
                </div>

                {newApiKey && (
                    <Card className="border-green-200 dark:border-green-800 bg-green-50/50 dark:bg-green-900/20">
                        <CardHeader>
                            <CardTitle className="text-green-800 dark:text-green-200 flex items-center gap-2">
                                <Key className="h-5 w-5" />
                                New API key created
                            </CardTitle>
                            <CardDescription>
                                Copy this key now. You won&apos;t be able to see it again.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <div className="flex items-center gap-2">
                                <code className="flex-1 rounded-lg bg-gray-900 text-green-300 px-3 py-2 text-sm font-mono break-all">
                                    {newApiKey.key}
                                </code>
                                <Button
                                    type="button"
                                    variant="secondary"
                                    size="sm"
                                    onClick={copyKey}
                                    className="gap-1 shrink-0"
                                >
                                    {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                                    {copied ? 'Copied' : 'Copy'}
                                </Button>
                            </div>
                            <p className="text-xs text-amber-700 dark:text-amber-300 flex items-center gap-1">
                                <AlertCircle className="h-4 w-4 shrink-0" />
                                Store it securely. If you lose it, create a new key and revoke this one.
                            </p>
                        </CardContent>
                    </Card>
                )}

                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Key className="h-5 w-5" />
                            API keys
                        </CardTitle>
                        <CardDescription>
                            Create keys to authenticate with the Waify API. Use each key in one place (e.g. production, CI) so you can revoke it without affecting others.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <form onSubmit={handleCreateKey} className="flex flex-wrap items-end gap-3">
                            <div className="min-w-[200px]">
                                <InputLabel htmlFor="name" value="Key name" />
                                <TextInput
                                    id="name"
                                    value={data.name}
                                    onChange={(e) => setData('name', e.target.value)}
                                    placeholder="e.g. Production, CI"
                                    className="mt-1"
                                />
                                <InputError message={errors.name} />
                            </div>
                            <Button type="submit" disabled={processing} className="gap-2">
                                <Plus className="h-4 w-4" />
                                Create key
                            </Button>
                        </form>

                        {api_keys.length === 0 ? (
                            <p className="text-sm text-gray-500 dark:text-gray-400 py-4">
                                No API keys yet. Create one to start using the API.
                            </p>
                        ) : (
                            <ul className="divide-y divide-gray-200 dark:divide-gray-700">
                                {api_keys.map((key) => (
                                    <li key={key.id} className="py-3 flex items-center justify-between gap-4">
                                        <div>
                                            <p className="font-medium text-gray-900 dark:text-gray-100">{key.name}</p>
                                            <p className="text-sm font-mono text-gray-500 dark:text-gray-400">
                                                {key.key_prefix}
                                            </p>
                                            <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
                                                Created {new Date(key.created_at).toLocaleDateString()}
                                                {key.last_used_at && (
                                                    <> · Last used {new Date(key.last_used_at).toLocaleString()}</>
                                                )}
                                            </p>
                                        </div>
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="sm"
                                            className="text-red-600 hover:text-red-700 dark:text-red-400"
                                            onClick={() => handleRevoke(key.id, key.name)}
                                        >
                                            <Trash2 className="h-4 w-4 mr-1" />
                                            Revoke
                                        </Button>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="pt-6">
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                            <strong>Base URL:</strong>{' '}
                            <code className="rounded bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5">{base_url}</code>
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                            Authenticate with <code className="rounded bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5">Authorization: Bearer YOUR_API_KEY</code> or{' '}
                            <code className="rounded bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5">X-API-Key: YOUR_API_KEY</code>. See the API documentation for endpoints.
                        </p>
                    </CardContent>
                </Card>
            </div>
        </AppShell>
    );
}
