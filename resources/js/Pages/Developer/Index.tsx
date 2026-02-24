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
    is_active?: boolean;
    scopes?: string[];
    last_used_at: string | null;
    last_used_ip?: string | null;
    expires_at?: string | null;
    revoked_at?: string | null;
    created_at: string;
}

export default function DeveloperIndex({
    account,
    api_keys,
    base_url,
    available_scopes = [],
}: {
    account: any;
    api_keys: ApiKeyRow[];
    base_url: string;
    available_scopes?: string[];
}) {
    const { addToast } = useToast();
    const confirm = useConfirm();
    const page = usePage();
    const flash = (page.props as any).flash || {};
    const newApiKey = flash.new_api_key as { name: string; key: string; key_prefix: string } | undefined;

    const { data, setData, post, processing, errors, reset } = useForm({
        name: '',
        scopes: available_scopes,
        expires_in_days: '',
    });
    const [copied, setCopied] = useState(false);

    const handleCreateKey = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('app.developer.api-keys.store'), {
            preserveScroll: true,
            onSuccess: () => reset(),
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
        navigator.clipboard.writeText(newApiKey.key)
            .then(() => {
                setCopied(true);
                addToast({ title: 'Copied', description: 'API key copied to clipboard.', variant: 'success' });
                setTimeout(() => setCopied(false), 2000);
            })
            .catch(() => {
                addToast({ title: 'Copy failed', description: 'Clipboard access was blocked. Copy the key manually.', variant: 'warning' });
            });
    };

    const toggleKey = (key: ApiKeyRow) => {
        router.patch(route('app.developer.api-keys.update', { id: key.id }), {
            is_active: !key.is_active,
        }, { preserveScroll: true });
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
                            <div className="min-w-[220px]">
                                <InputLabel htmlFor="expires_in_days" value="Expiry (days, optional)" />
                                <TextInput
                                    id="expires_in_days"
                                    type="number"
                                    min="1"
                                    max="3650"
                                    value={data.expires_in_days as any}
                                    onChange={(e) => setData('expires_in_days', e.target.value)}
                                    placeholder="Never expires"
                                    className="mt-1"
                                />
                                <InputError message={errors.expires_in_days} />
                            </div>
                            <div className="w-full">
                                <InputLabel value="Scopes" />
                                <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-2">
                                    {available_scopes.map((scope) => (
                                        <label key={scope} className="inline-flex items-center gap-2 text-sm rounded-lg border border-gray-200 dark:border-gray-700 px-3 py-2">
                                            <input
                                                type="checkbox"
                                                checked={Array.isArray(data.scopes) && (data.scopes as string[]).includes(scope)}
                                                onChange={(e) => {
                                                    const current = Array.isArray(data.scopes) ? [...(data.scopes as string[])] : [];
                                                    const next = e.target.checked
                                                        ? Array.from(new Set([...current, scope]))
                                                        : current.filter((s) => s !== scope);
                                                    setData('scopes', next as any);
                                                }}
                                            />
                                            <code className="text-xs">{scope}</code>
                                        </label>
                                    ))}
                                </div>
                                <InputError message={errors.scopes as any} />
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
                                            <p className="font-medium text-gray-900 dark:text-gray-100 flex items-center gap-2">
                                                {key.name}
                                                <span className={`inline-flex rounded-full px-2 py-0.5 text-[11px] ${
                                                    key.is_active ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300' : 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300'
                                                }`}>
                                                    {key.is_active ? 'Active' : 'Disabled'}
                                                </span>
                                            </p>
                                            <p className="text-sm font-mono text-gray-500 dark:text-gray-400">
                                                {key.key_prefix}
                                            </p>
                                            <div className="mt-1 flex flex-wrap gap-1">
                                                {(key.scopes || []).map((scope) => (
                                                    <span key={scope} className="inline-flex rounded bg-gray-100 dark:bg-gray-800 px-2 py-0.5 text-[11px]">
                                                        {scope}
                                                    </span>
                                                ))}
                                            </div>
                                            <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
                                                Created {new Date(key.created_at).toLocaleDateString()}
                                                {key.last_used_at && (
                                                    <> · Last used {new Date(key.last_used_at).toLocaleString()}</>
                                                )}
                                                {key.last_used_ip && <> · IP {key.last_used_ip}</>}
                                                {key.expires_at && <> · Expires {new Date(key.expires_at).toLocaleDateString()}</>}
                                            </p>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Button
                                                type="button"
                                                variant="secondary"
                                                size="sm"
                                                onClick={() => toggleKey(key)}
                                            >
                                                {key.is_active ? 'Disable' : 'Enable'}
                                            </Button>
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
                                        </div>
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
