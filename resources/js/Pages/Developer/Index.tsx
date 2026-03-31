import { Head, router, useForm, usePage } from '@inertiajs/react';
import { useMemo, useState } from 'react';
import AppShell from '@/Layouts/AppShell';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/Components/UI/Card';
import Button from '@/Components/UI/Button';
import TextInput from '@/Components/TextInput';
import InputLabel from '@/Components/InputLabel';
import InputError from '@/Components/InputError';
import { Code2, Key, Plus, Trash2, Copy, Check, BookOpen, AlertCircle, Link2, RotateCcw, Send, Webhook, Table2 } from 'lucide-react';
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

interface WebhookDeliveryRow {
    id: number;
    event_key: string;
    event_id: string;
    status: string;
    attempts: number;
    http_status: number | null;
    error_message: string | null;
    created_at: string | null;
    delivered_at: string | null;
    next_retry_at: string | null;
}


interface InboundActionType {
    value: string;
    label: string;
}

interface InboundSequenceRow {
    id: number;
    name: string;
    status: string;
    whatsapp_connection_id: number | null;
}

interface InboundConnectionRow {
    id: number;
    name: string;
}

interface InboundTemplateRow {
    id: number;
    name: string;
    whatsapp_connection_id: number | null;
    variable_count: number;
}

interface InboundCustomFieldRow {
    key: string;
    name: string;
}

interface InboundWebhookLogRow {
    id: number;
    status: string;
    response_summary: string | null;
    created_at: string | null;
    processed_at: string | null;
}

interface InboundWebhookRow {
    id: number;
    name: string;
    public_key: string;
    public_url: string;
    is_active: boolean;
    action_type: string;
    campaign_sequence_id: number | null;
    sequence_name: string | null;
    whatsapp_connection_id: number | null;
    connection_name: string | null;
    whatsapp_template_id: number | null;
    template_name: string | null;
    payload_mappings: Record<string, any>;
    template_variable_paths: string[];
    template_static_params: string[];
    last_received_at: string | null;
    last_triggered_at: string | null;
    last_error: string | null;
    created_at: string | null;
    recent_logs: InboundWebhookLogRow[];
}

interface GoogleSheetsDeliveryRow {
    id: number;
    event_key: string;
    status: string;
    attempts: number;
    response_summary: string | null;
    error_message: string | null;
    created_at: string | null;
    delivered_at: string | null;
}

interface GoogleSheetsIntegrationRow {
    id: number;
    name: string;
    spreadsheet_id: string;
    sheet_name: string;
    spreadsheet_url: string;
    service_account_email: string;
    is_active: boolean;
    event_keys: string[];
    append_headers: boolean;
    include_payload_json: boolean;
    last_delivery_at: string | null;
    last_delivery_error: string | null;
    recent_deliveries: GoogleSheetsDeliveryRow[];
}

interface WebhookEndpointRow {
    id: number;
    name: string;
    url: string;
    is_active: boolean;
    timeout_seconds: number;
    max_retries: number;
    enabled_events: string[];
    last_delivery_at: string | null;
    last_delivery_status_code: number | null;
    last_delivery_error: string | null;
    deliveries: WebhookDeliveryRow[];
}

export default function DeveloperIndex({
    account,
    api_keys,
    base_url,
    available_scopes = [],
    webhook_event_keys = [],
    webhook_endpoints = [],
    inbound_webhook_action_types = [],
    inbound_webhooks = [],
    inbound_sequences = [],
    inbound_connections = [],
    inbound_templates = [],
    inbound_custom_fields = [],
    google_sheets_integrations = [],
}: {
    account: any;
    api_keys: ApiKeyRow[];
    base_url: string;
    available_scopes?: string[];
    webhook_event_keys?: string[];
    webhook_endpoints?: WebhookEndpointRow[];
    inbound_webhook_action_types?: InboundActionType[];
    inbound_webhooks?: InboundWebhookRow[];
    inbound_sequences?: InboundSequenceRow[];
    inbound_connections?: InboundConnectionRow[];
    inbound_templates?: InboundTemplateRow[];
    inbound_custom_fields?: InboundCustomFieldRow[];
    google_sheets_integrations?: GoogleSheetsIntegrationRow[];
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
    const webhookForm = useForm({
        name: '',
        url: '',
        event_keys: webhook_event_keys as string[],
        timeout_seconds: 10,
        max_retries: 5,
    });
    const inboundForm = useForm({
        name: '',
        action_type: inbound_webhook_action_types[0]?.value || 'start_sequence',
        campaign_sequence_id: '',
        whatsapp_connection_id: '',
        whatsapp_template_id: '',
        phone_path: 'phone',
        name_path: 'name',
        email_path: 'email',
        company_path: 'company',
        idempotency_path: 'event_id',
        custom_field_paths: Object.fromEntries((inbound_custom_fields || []).map((field) => [field.key, ''])),
        template_variable_paths: [] as string[],
        template_static_params: [] as string[],
    });
    const newInboundWebhookSecret = flash.new_inbound_webhook_secret as { id: number; secret: string } | undefined;
    const [copiedInboundUrl, setCopiedInboundUrl] = useState<number | null>(null);
    const [copiedInboundSecret, setCopiedInboundSecret] = useState<number | null>(null);
    const googleSheetsForm = useForm({
        name: '',
        spreadsheet_id: '',
        sheet_name: 'Leads',
        service_account_json: '',
        event_keys: ['contact.created', 'conversation.created'] as string[],
        append_headers: true,
        include_payload_json: true,
    });

    const filteredInboundTemplates = useMemo(() => {
        const connectionId = Number(inboundForm.data.whatsapp_connection_id || 0);
        if (!connectionId) return inbound_templates;
        return inbound_templates.filter((template) => Number(template.whatsapp_connection_id || 0) === connectionId);
    }, [inbound_templates, inboundForm.data.whatsapp_connection_id]);

    const selectedInboundTemplate = useMemo(() => {
        const templateId = Number(inboundForm.data.whatsapp_template_id || 0);
        return filteredInboundTemplates.find((template) => template.id === templateId) || null;
    }, [filteredInboundTemplates, inboundForm.data.whatsapp_template_id]);

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

    const createWebhookEndpoint = (e: React.FormEvent) => {
        e.preventDefault();
        webhookForm.post(route('app.developer.webhooks.store'), {
            preserveScroll: true,
            onSuccess: () => webhookForm.reset('name', 'url'),
        });
    };

    const toggleWebhookEndpoint = (endpoint: WebhookEndpointRow) => {
        router.patch(route('app.developer.webhooks.update', { id: endpoint.id }), {
            is_active: !endpoint.is_active,
        }, { preserveScroll: true });
    };

    const deleteWebhookEndpoint = async (endpoint: WebhookEndpointRow) => {
        const ok = await confirm({
            title: 'Delete webhook endpoint',
            message: `Delete "${endpoint.name}"? Delivery logs for this endpoint will be removed.`,
            variant: 'warning',
        });
        if (!ok) return;
        router.delete(route('app.developer.webhooks.destroy', { id: endpoint.id }), { preserveScroll: true });
    };

    const testWebhookEndpoint = (endpoint: WebhookEndpointRow) => {
        router.post(route('app.developer.webhooks.test', { id: endpoint.id }), {
            event_key: endpoint.enabled_events[0] || 'message.sent',
        }, { preserveScroll: true });
    };

    const replayDelivery = (deliveryId: number) => {
        router.post(route('app.developer.webhook-deliveries.replay', { id: deliveryId }), {}, { preserveScroll: true });
    };

    const createInboundWebhook = (e: React.FormEvent) => {
        e.preventDefault();
        inboundForm.post(route('app.developer.inbound-webhooks.store'), {
            preserveScroll: true,
            onSuccess: () => {
                inboundForm.reset('name', 'campaign_sequence_id', 'whatsapp_connection_id', 'whatsapp_template_id', 'template_variable_paths', 'template_static_params');
            },
        });
    };

    const toggleInboundWebhook = (webhook: InboundWebhookRow) => {
        router.patch(route('app.developer.inbound-webhooks.update', { id: webhook.id }), {
            is_active: !webhook.is_active,
        }, { preserveScroll: true });
    };

    const rotateInboundWebhookSecret = (webhook: InboundWebhookRow) => {
        router.patch(route('app.developer.inbound-webhooks.update', { id: webhook.id }), {
            rotate_secret: true,
        }, { preserveScroll: true });
    };

    const deleteInboundWebhook = async (webhook: InboundWebhookRow) => {
        const ok = await confirm({
            title: 'Delete inbound webhook',
            message: `Delete "${webhook.name}"? External calls to this URL will stop immediately.`,
            variant: 'warning',
        });
        if (!ok) return;
        router.delete(route('app.developer.inbound-webhooks.destroy', { id: webhook.id }), { preserveScroll: true });
    };

    const copyInboundUrl = (webhook: InboundWebhookRow) => {
        navigator.clipboard.writeText(webhook.public_url).then(() => {
            setCopiedInboundUrl(webhook.id);
            setTimeout(() => setCopiedInboundUrl((current) => current === webhook.id ? null : current), 2000);
        });
    };

    const copyInboundSecret = (webhookId: number, secret?: string) => {
        if (!secret) return;
        navigator.clipboard.writeText(secret).then(() => {
            setCopiedInboundSecret(webhookId);
            setTimeout(() => setCopiedInboundSecret((current) => current === webhookId ? null : current), 2000);
        });
    };

    const createGoogleSheetsIntegration = (e: React.FormEvent) => {
        e.preventDefault();
        googleSheetsForm.post(route('app.developer.google-sheets.store'), {
            preserveScroll: true,
            onSuccess: () => googleSheetsForm.reset('name', 'spreadsheet_id', 'sheet_name', 'service_account_json'),
        });
    };

    const toggleGoogleSheetsIntegration = (integration: GoogleSheetsIntegrationRow) => {
        router.patch(route('app.developer.google-sheets.update', { id: integration.id }), {
            is_active: !integration.is_active,
        }, { preserveScroll: true });
    };

    const testGoogleSheetsIntegration = (integration: GoogleSheetsIntegrationRow) => {
        router.post(route('app.developer.google-sheets.test', { id: integration.id }), {}, { preserveScroll: true });
    };

    const deleteGoogleSheetsIntegration = async (integration: GoogleSheetsIntegrationRow) => {
        const ok = await confirm({
            title: 'Delete Google Sheets integration',
            message: `Delete "${integration.name}"? Sheets sync will stop immediately.`,
            variant: 'warning',
        });
        if (!ok) return;
        router.delete(route('app.developer.google-sheets.destroy', { id: integration.id }), { preserveScroll: true });
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

                {newInboundWebhookSecret && (
                    <Card className="border-emerald-200 dark:border-emerald-800 bg-emerald-50/50 dark:bg-emerald-900/20">
                        <CardHeader>
                            <CardTitle className="text-emerald-800 dark:text-emerald-200 flex items-center gap-2">
                                <Webhook className="h-5 w-5" />
                                New inbound webhook secret
                            </CardTitle>
                            <CardDescription>
                                Copy this secret now. Zyptos only shows the full secret when you create or rotate it.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <div className="flex items-center gap-2">
                                <code className="flex-1 rounded-lg bg-gray-900 text-emerald-300 px-3 py-2 text-sm font-mono break-all">
                                    {newInboundWebhookSecret.secret}
                                </code>
                                <Button
                                    type="button"
                                    variant="secondary"
                                    size="sm"
                                    onClick={() => copyInboundSecret(newInboundWebhookSecret.id, newInboundWebhookSecret.secret)}
                                    className="gap-1 shrink-0"
                                >
                                    {copiedInboundSecret === newInboundWebhookSecret.id ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                                    {copiedInboundSecret === newInboundWebhookSecret.id ? 'Copied' : 'Copy'}
                                </Button>
                            </div>
                            <p className="text-xs text-gray-600 dark:text-gray-400">
                                Send this secret in <code>X-Zyptos-Secret</code> or use it to sign <code>X-Zyptos-Signature</code> with HMAC SHA256.
                            </p>
                        </CardContent>
                    </Card>
                )}

                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Link2 className="h-5 w-5" />
                            Outbound webhooks
                        </CardTitle>
                        <CardDescription>
                            Send message, conversation, template, and connection health events to your own endpoint.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <form onSubmit={createWebhookEndpoint} className="space-y-3 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
                            <div className="grid gap-3 md:grid-cols-2">
                                <div>
                                    <InputLabel htmlFor="webhook_name" value="Endpoint name" />
                                    <TextInput
                                        id="webhook_name"
                                        value={webhookForm.data.name}
                                        onChange={(e) => webhookForm.setData('name', e.target.value)}
                                        placeholder="CRM webhook"
                                        className="mt-1"
                                    />
                                    <InputError message={webhookForm.errors.name} />
                                </div>
                                <div>
                                    <InputLabel htmlFor="webhook_url" value="Endpoint URL" />
                                    <TextInput
                                        id="webhook_url"
                                        value={webhookForm.data.url}
                                        onChange={(e) => webhookForm.setData('url', e.target.value)}
                                        placeholder="https://example.com/webhooks/waify"
                                        className="mt-1"
                                    />
                                    <InputError message={webhookForm.errors.url} />
                                </div>
                            </div>
                            <div className="grid gap-3 md:grid-cols-2">
                                <div>
                                    <InputLabel htmlFor="webhook_timeout" value="Timeout (seconds)" />
                                    <TextInput
                                        id="webhook_timeout"
                                        type="number"
                                        min="3"
                                        max="30"
                                        value={String(webhookForm.data.timeout_seconds)}
                                        onChange={(e) => webhookForm.setData('timeout_seconds', Number(e.target.value || 10))}
                                        className="mt-1"
                                    />
                                    <InputError message={webhookForm.errors.timeout_seconds} />
                                </div>
                                <div>
                                    <InputLabel htmlFor="webhook_retries" value="Max retries" />
                                    <TextInput
                                        id="webhook_retries"
                                        type="number"
                                        min="1"
                                        max="10"
                                        value={String(webhookForm.data.max_retries)}
                                        onChange={(e) => webhookForm.setData('max_retries', Number(e.target.value || 5))}
                                        className="mt-1"
                                    />
                                    <InputError message={webhookForm.errors.max_retries} />
                                </div>
                            </div>
                            <div>
                                <InputLabel value="Subscribed events" />
                                <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                                    {webhook_event_keys.map((eventKey) => (
                                        <label key={eventKey} className="inline-flex items-center gap-2 rounded-lg border border-gray-200 dark:border-gray-700 px-3 py-2 text-xs">
                                            <input
                                                type="checkbox"
                                                checked={webhookForm.data.event_keys.includes(eventKey)}
                                                onChange={(e) => {
                                                    const current = [...webhookForm.data.event_keys];
                                                    webhookForm.setData(
                                                        'event_keys',
                                                        e.target.checked
                                                            ? Array.from(new Set([...current, eventKey]))
                                                            : current.filter((k) => k !== eventKey),
                                                    );
                                                }}
                                            />
                                            <code>{eventKey}</code>
                                        </label>
                                    ))}
                                </div>
                                <InputError message={webhookForm.errors.event_keys as any} />
                            </div>
                            <Button type="submit" disabled={webhookForm.processing || webhookForm.data.event_keys.length === 0} className="gap-2">
                                <Plus className="h-4 w-4" />
                                Add endpoint
                            </Button>
                        </form>

                        {webhook_endpoints.length === 0 ? (
                            <p className="text-sm text-gray-500 dark:text-gray-400">No webhook endpoints configured.</p>
                        ) : (
                            <div className="space-y-4">
                                {webhook_endpoints.map((endpoint) => (
                                    <div key={endpoint.id} className="rounded-lg border border-gray-200 dark:border-gray-700 p-4 space-y-3">
                                        <div className="flex flex-wrap items-start justify-between gap-3">
                                            <div className="min-w-0">
                                                <p className="font-medium text-gray-900 dark:text-gray-100 flex items-center gap-2">
                                                    {endpoint.name}
                                                    <span className={`inline-flex rounded-full px-2 py-0.5 text-[11px] ${endpoint.is_active ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300' : 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300'}`}>
                                                        {endpoint.is_active ? 'Active' : 'Disabled'}
                                                    </span>
                                                </p>
                                                <p className="text-xs text-gray-500 dark:text-gray-400 break-all">{endpoint.url}</p>
                                                <div className="mt-2 flex flex-wrap gap-1">
                                                    {endpoint.enabled_events.map((eventKey) => (
                                                        <code key={eventKey} className="rounded bg-gray-100 dark:bg-gray-800 px-2 py-0.5 text-[11px]">
                                                            {eventKey}
                                                        </code>
                                                    ))}
                                                </div>
                                                <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                                                    Last delivery: {endpoint.last_delivery_at ? new Date(endpoint.last_delivery_at).toLocaleString() : '—'}
                                                    {endpoint.last_delivery_status_code ? ` · HTTP ${endpoint.last_delivery_status_code}` : ''}
                                                    {endpoint.last_delivery_error ? ` · ${endpoint.last_delivery_error}` : ''}
                                                </p>
                                            </div>
                                            <div className="flex flex-wrap gap-2">
                                                <Button type="button" variant="secondary" size="sm" onClick={() => testWebhookEndpoint(endpoint)} className="gap-1">
                                                    <Send className="h-4 w-4" />
                                                    Test
                                                </Button>
                                                <Button type="button" variant="secondary" size="sm" onClick={() => toggleWebhookEndpoint(endpoint)}>
                                                    {endpoint.is_active ? 'Disable' : 'Enable'}
                                                </Button>
                                                <Button type="button" variant="ghost" size="sm" className="text-red-600 hover:text-red-700 dark:text-red-400" onClick={() => deleteWebhookEndpoint(endpoint)}>
                                                    <Trash2 className="h-4 w-4 mr-1" />
                                                    Delete
                                                </Button>
                                            </div>
                                        </div>
                                        {endpoint.deliveries.length > 0 && (
                                            <div className="overflow-x-auto">
                                                <table className="min-w-full text-xs">
                                                    <thead>
                                                        <tr className="text-left text-gray-500 dark:text-gray-400">
                                                            <th className="py-1 pr-3">Event</th>
                                                            <th className="py-1 pr-3">Status</th>
                                                            <th className="py-1 pr-3">Attempts</th>
                                                            <th className="py-1 pr-3">HTTP</th>
                                                            <th className="py-1 pr-3">When</th>
                                                            <th className="py-1 pr-3">Action</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {endpoint.deliveries.map((delivery) => (
                                                            <tr key={delivery.id} className="border-t border-gray-200 dark:border-gray-700">
                                                                <td className="py-2 pr-3"><code>{delivery.event_key}</code></td>
                                                                <td className="py-2 pr-3">{delivery.status}</td>
                                                                <td className="py-2 pr-3">{delivery.attempts}</td>
                                                                <td className="py-2 pr-3">{delivery.http_status ?? '—'}</td>
                                                                <td className="py-2 pr-3">{delivery.created_at ? new Date(delivery.created_at).toLocaleString() : '—'}</td>
                                                                <td className="py-2 pr-3">
                                                                    {(delivery.status === 'failed' || delivery.status === 'giving_up') ? (
                                                                        <Button type="button" size="sm" variant="secondary" onClick={() => replayDelivery(delivery.id)} className="gap-1">
                                                                            <RotateCcw className="h-3.5 w-3.5" />
                                                                            Replay
                                                                        </Button>
                                                                    ) : (
                                                                        <span className="text-gray-400">—</span>
                                                                    )}
                                                                </td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Table2 className="h-5 w-5" />
                            Google Sheets
                        </CardTitle>
                        <CardDescription>
                            Push contacts, conversations, and campaign events into Google Sheets without writing code. Share the sheet with the service account email after you create the connector.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <form onSubmit={createGoogleSheetsIntegration} className="space-y-3 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
                            <div className="grid gap-3 md:grid-cols-2">
                                <div>
                                    <InputLabel htmlFor="gs_name" value="Integration name" />
                                    <TextInput
                                        id="gs_name"
                                        value={googleSheetsForm.data.name}
                                        onChange={(e) => googleSheetsForm.setData('name', e.target.value)}
                                        placeholder="Leads sheet"
                                        className="mt-1"
                                    />
                                    <InputError message={googleSheetsForm.errors.name} />
                                </div>
                                <div>
                                    <InputLabel htmlFor="gs_sheet_id" value="Spreadsheet ID" />
                                    <TextInput
                                        id="gs_sheet_id"
                                        value={googleSheetsForm.data.spreadsheet_id}
                                        onChange={(e) => googleSheetsForm.setData('spreadsheet_id', e.target.value)}
                                        placeholder="Google Sheet ID"
                                        className="mt-1"
                                    />
                                    <InputError message={googleSheetsForm.errors.spreadsheet_id} />
                                </div>
                            </div>
                            <div className="grid gap-3 md:grid-cols-2">
                                <div>
                                    <InputLabel htmlFor="gs_sheet_name" value="Tab name" />
                                    <TextInput
                                        id="gs_sheet_name"
                                        value={googleSheetsForm.data.sheet_name}
                                        onChange={(e) => googleSheetsForm.setData('sheet_name', e.target.value)}
                                        placeholder="Leads"
                                        className="mt-1"
                                    />
                                    <InputError message={googleSheetsForm.errors.sheet_name} />
                                </div>
                                <div className="rounded-lg bg-gray-50 dark:bg-gray-900/60 p-3 text-xs text-gray-600 dark:text-gray-400">
                                    Use a Google service account JSON key. Share your spreadsheet with the service account email as an editor.
                                </div>
                            </div>
                            <div>
                                <InputLabel htmlFor="gs_service_account" value="Service account JSON" />
                                <textarea
                                    id="gs_service_account"
                                    value={googleSheetsForm.data.service_account_json}
                                    onChange={(e) => googleSheetsForm.setData('service_account_json', e.target.value)}
                                    className="mt-1 block min-h-[160px] w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-900"
                                    placeholder="Paste the full Google service account JSON here"
                                />
                                <InputError message={googleSheetsForm.errors.service_account_json} />
                            </div>
                            <div>
                                <InputLabel value="Sync these events" />
                                <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                                    {webhook_event_keys.map((eventKey) => (
                                        <label key={`sheet-${eventKey}`} className="inline-flex items-center gap-2 rounded-lg border border-gray-200 dark:border-gray-700 px-3 py-2 text-xs">
                                            <input
                                                type="checkbox"
                                                checked={googleSheetsForm.data.event_keys.includes(eventKey)}
                                                onChange={(e) => {
                                                    const current = [...googleSheetsForm.data.event_keys];
                                                    googleSheetsForm.setData(
                                                        'event_keys',
                                                        e.target.checked
                                                            ? Array.from(new Set([...current, eventKey]))
                                                            : current.filter((k) => k !== eventKey),
                                                    );
                                                }}
                                            />
                                            <code>{eventKey}</code>
                                        </label>
                                    ))}
                                </div>
                                <InputError message={googleSheetsForm.errors.event_keys as any} />
                            </div>
                            <div className="flex flex-wrap gap-4 text-sm">
                                <label className="inline-flex items-center gap-2">
                                    <input
                                        type="checkbox"
                                        checked={googleSheetsForm.data.append_headers}
                                        onChange={(e) => googleSheetsForm.setData('append_headers', e.target.checked)}
                                    />
                                    Add header row before the first append
                                </label>
                                <label className="inline-flex items-center gap-2">
                                    <input
                                        type="checkbox"
                                        checked={googleSheetsForm.data.include_payload_json}
                                        onChange={(e) => googleSheetsForm.setData('include_payload_json', e.target.checked)}
                                    />
                                    Include raw payload JSON
                                </label>
                            </div>
                            <Button type="submit" disabled={googleSheetsForm.processing || googleSheetsForm.data.event_keys.length === 0} className="gap-2">
                                <Plus className="h-4 w-4" />
                                Add Google Sheets connector
                            </Button>
                        </form>

                        {google_sheets_integrations.length === 0 ? (
                            <p className="text-sm text-gray-500 dark:text-gray-400">No Google Sheets integrations configured.</p>
                        ) : (
                            <div className="space-y-4">
                                {google_sheets_integrations.map((integration) => (
                                    <div key={integration.id} className="rounded-lg border border-gray-200 dark:border-gray-700 p-4 space-y-3">
                                        <div className="flex flex-wrap items-start justify-between gap-3">
                                            <div className="min-w-0">
                                                <p className="font-medium text-gray-900 dark:text-gray-100 flex items-center gap-2">
                                                    {integration.name}
                                                    <span className={`inline-flex rounded-full px-2 py-0.5 text-[11px] ${integration.is_active ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300' : 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300'}`}>
                                                        {integration.is_active ? 'Active' : 'Disabled'}
                                                    </span>
                                                </p>
                                                <p className="text-xs text-gray-500 dark:text-gray-400 break-all">{integration.spreadsheet_url}</p>
                                                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                                                    Tab: {integration.sheet_name} · Service account: {integration.service_account_email}
                                                </p>
                                                <div className="mt-2 flex flex-wrap gap-1">
                                                    {integration.event_keys.map((eventKey) => (
                                                        <code key={`${integration.id}-${eventKey}`} className="rounded bg-gray-100 dark:bg-gray-800 px-2 py-0.5 text-[11px]">
                                                            {eventKey}
                                                        </code>
                                                    ))}
                                                </div>
                                                <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                                                    Last sync: {integration.last_delivery_at ? new Date(integration.last_delivery_at).toLocaleString() : '—'}
                                                    {integration.last_delivery_error ? ` · ${integration.last_delivery_error}` : ''}
                                                </p>
                                            </div>
                                            <div className="flex flex-wrap gap-2">
                                                <Button type="button" variant="secondary" size="sm" onClick={() => testGoogleSheetsIntegration(integration)} className="gap-1">
                                                    <Send className="h-4 w-4" />
                                                    Test
                                                </Button>
                                                <Button type="button" variant="secondary" size="sm" onClick={() => toggleGoogleSheetsIntegration(integration)}>
                                                    {integration.is_active ? 'Disable' : 'Enable'}
                                                </Button>
                                                <Button type="button" variant="ghost" size="sm" className="text-red-600 hover:text-red-700 dark:text-red-400" onClick={() => deleteGoogleSheetsIntegration(integration)}>
                                                    <Trash2 className="h-4 w-4 mr-1" />
                                                    Delete
                                                </Button>
                                            </div>
                                        </div>
                                        {integration.recent_deliveries.length > 0 && (
                                            <div className="overflow-x-auto">
                                                <table className="min-w-full text-xs">
                                                    <thead>
                                                        <tr className="text-left text-gray-500 dark:text-gray-400">
                                                            <th className="py-1 pr-3">Event</th>
                                                            <th className="py-1 pr-3">Status</th>
                                                            <th className="py-1 pr-3">Summary</th>
                                                            <th className="py-1 pr-3">When</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {integration.recent_deliveries.map((delivery) => (
                                                            <tr key={delivery.id} className="border-t border-gray-200 dark:border-gray-700">
                                                                <td className="py-2 pr-3"><code>{delivery.event_key}</code></td>
                                                                <td className="py-2 pr-3">{delivery.status}</td>
                                                                <td className="py-2 pr-3">{delivery.response_summary || delivery.error_message || '—'}</td>
                                                                <td className="py-2 pr-3">{delivery.created_at ? new Date(delivery.created_at).toLocaleString() : '—'}</td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Webhook className="h-5 w-5" />
                            Inbound automation webhooks
                        </CardTitle>
                        <CardDescription>
                            Receive external JSON from forms, CRMs, or internal tools and trigger a sequence or template automatically.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <form onSubmit={createInboundWebhook} className="space-y-4 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
                            <div className="grid gap-3 md:grid-cols-2">
                                <div>
                                    <InputLabel htmlFor="inbound_name" value="Webhook name" />
                                    <TextInput
                                        id="inbound_name"
                                        value={inboundForm.data.name}
                                        onChange={(e) => inboundForm.setData('name', e.target.value)}
                                        placeholder="Lead form listener"
                                        className="mt-1"
                                    />
                                    <InputError message={inboundForm.errors.name} />
                                </div>
                                <div>
                                    <InputLabel htmlFor="inbound_action_type" value="Action" />
                                    <select
                                        id="inbound_action_type"
                                        value={inboundForm.data.action_type}
                                        onChange={(e) => {
                                            const next = e.target.value;
                                            inboundForm.setData('action_type', next);
                                            if (next !== 'send_template') {
                                                inboundForm.setData('whatsapp_connection_id', '');
                                                inboundForm.setData('whatsapp_template_id', '');
                                                inboundForm.setData('template_variable_paths', []);
                                                inboundForm.setData('template_static_params', []);
                                            }
                                        }}
                                        className="mt-1 block w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-900"
                                    >
                                        {inbound_webhook_action_types.map((action) => (
                                            <option key={action.value} value={action.value}>{action.label}</option>
                                        ))}
                                    </select>
                                    <InputError message={inboundForm.errors.action_type} />
                                </div>
                            </div>

                            {inboundForm.data.action_type === 'start_sequence' ? (
                                <div>
                                    <InputLabel htmlFor="inbound_sequence" value="Sequence" />
                                    <select
                                        id="inbound_sequence"
                                        value={inboundForm.data.campaign_sequence_id}
                                        onChange={(e) => inboundForm.setData('campaign_sequence_id', e.target.value)}
                                        className="mt-1 block w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-900"
                                    >
                                        <option value="">Choose a sequence</option>
                                        {inbound_sequences.map((sequence) => (
                                            <option key={sequence.id} value={sequence.id}>{sequence.name} ({sequence.status})</option>
                                        ))}
                                    </select>
                                    <InputError message={inboundForm.errors.campaign_sequence_id} />
                                </div>
                            ) : (
                                <div className="grid gap-3 md:grid-cols-2">
                                    <div>
                                        <InputLabel htmlFor="inbound_connection" value="WhatsApp connection" />
                                        <select
                                            id="inbound_connection"
                                            value={inboundForm.data.whatsapp_connection_id}
                                            onChange={(e) => {
                                                inboundForm.setData('whatsapp_connection_id', e.target.value);
                                                inboundForm.setData('whatsapp_template_id', '');
                                                inboundForm.setData('template_variable_paths', []);
                                                inboundForm.setData('template_static_params', []);
                                            }}
                                            className="mt-1 block w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-900"
                                        >
                                            <option value="">Choose a connection</option>
                                            {inbound_connections.map((connection) => (
                                                <option key={connection.id} value={connection.id}>{connection.name}</option>
                                            ))}
                                        </select>
                                        <InputError message={inboundForm.errors.whatsapp_connection_id} />
                                    </div>
                                    <div>
                                        <InputLabel htmlFor="inbound_template" value="Template" />
                                        <select
                                            id="inbound_template"
                                            value={inboundForm.data.whatsapp_template_id}
                                            onChange={(e) => {
                                                const nextId = e.target.value;
                                                inboundForm.setData('whatsapp_template_id', nextId);
                                                const template = filteredInboundTemplates.find((entry) => String(entry.id) === nextId);
                                                const variableCount = template?.variable_count || 0;
                                                inboundForm.setData('template_variable_paths', Array.from({ length: variableCount }, (_, index) => inboundForm.data.template_variable_paths[index] || ''));
                                                inboundForm.setData('template_static_params', Array.from({ length: variableCount }, (_, index) => inboundForm.data.template_static_params[index] || ''));
                                            }}
                                            className="mt-1 block w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-900"
                                        >
                                            <option value="">Choose a template</option>
                                            {filteredInboundTemplates.map((template) => (
                                                <option key={template.id} value={template.id}>{template.name}</option>
                                            ))}
                                        </select>
                                        <InputError message={inboundForm.errors.whatsapp_template_id} />
                                    </div>
                                </div>
                            )}

                            <div className="grid gap-3 md:grid-cols-2">
                                <div>
                                    <InputLabel htmlFor="phone_path" value="Phone path" />
                                    <TextInput id="phone_path" value={inboundForm.data.phone_path} onChange={(e) => inboundForm.setData('phone_path', e.target.value)} className="mt-1" />
                                    <InputError message={inboundForm.errors.phone_path} />
                                </div>
                                <div>
                                    <InputLabel htmlFor="idempotency_path" value="Idempotency path" />
                                    <TextInput id="idempotency_path" value={inboundForm.data.idempotency_path} onChange={(e) => inboundForm.setData('idempotency_path', e.target.value)} className="mt-1" />
                                    <InputError message={inboundForm.errors.idempotency_path} />
                                </div>
                                <div>
                                    <InputLabel htmlFor="name_path" value="Name path" />
                                    <TextInput id="name_path" value={inboundForm.data.name_path} onChange={(e) => inboundForm.setData('name_path', e.target.value)} className="mt-1" />
                                    <InputError message={inboundForm.errors.name_path} />
                                </div>
                                <div>
                                    <InputLabel htmlFor="email_path" value="Email path" />
                                    <TextInput id="email_path" value={inboundForm.data.email_path} onChange={(e) => inboundForm.setData('email_path', e.target.value)} className="mt-1" />
                                    <InputError message={inboundForm.errors.email_path} />
                                </div>
                                <div className="md:col-span-2">
                                    <InputLabel htmlFor="company_path" value="Company path" />
                                    <TextInput id="company_path" value={inboundForm.data.company_path} onChange={(e) => inboundForm.setData('company_path', e.target.value)} className="mt-1" />
                                    <InputError message={inboundForm.errors.company_path} />
                                </div>
                            </div>

                            {inbound_custom_fields.length > 0 && (
                                <div>
                                    <InputLabel value="Custom field paths" />
                                    <div className="mt-2 grid gap-3 md:grid-cols-2">
                                        {inbound_custom_fields.map((field) => (
                                            <div key={field.key}>
                                                <InputLabel htmlFor={`field_${field.key}`} value={field.name} />
                                                <TextInput
                                                    id={`field_${field.key}`}
                                                    value={(inboundForm.data.custom_field_paths as Record<string, string>)[field.key] || ''}
                                                    onChange={(e) => inboundForm.setData('custom_field_paths', {
                                                        ...(inboundForm.data.custom_field_paths as Record<string, string>),
                                                        [field.key]: e.target.value,
                                                    })}
                                                    placeholder={`payload path for ${field.name}`}
                                                    className="mt-1"
                                                />
                                                <InputError message={(inboundForm.errors as Record<string, string>)[`custom_field_paths.${field.key}`]} />
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {inboundForm.data.action_type === 'send_template' && selectedInboundTemplate && selectedInboundTemplate.variable_count > 0 && (
                                <div className="space-y-3">
                                    <div>
                                        <InputLabel value="Template variables" />
                                        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">Map each template variable to a JSON path, or leave it blank and set a static value instead.</p>
                                    </div>
                                    <div className="grid gap-3 md:grid-cols-2">
                                        {Array.from({ length: selectedInboundTemplate.variable_count }, (_, index) => (
                                            <div key={index} className="rounded-lg border border-gray-200 dark:border-gray-700 p-3 space-y-2">
                                                <div>
                                                    <InputLabel value={`Variable {{${index + 1}}} path`} />
                                                    <TextInput
                                                        value={inboundForm.data.template_variable_paths[index] || ''}
                                                        onChange={(e) => {
                                                            const next = [...inboundForm.data.template_variable_paths];
                                                            next[index] = e.target.value;
                                                            inboundForm.setData('template_variable_paths', next);
                                                        }}
                                                        placeholder={`e.g. order.customer_name`}
                                                        className="mt-1"
                                                    />
                                                </div>
                                                <div>
                                                    <InputLabel value={`Static fallback {{${index + 1}}}`} />
                                                    <TextInput
                                                        value={inboundForm.data.template_static_params[index] || ''}
                                                        onChange={(e) => {
                                                            const next = [...inboundForm.data.template_static_params];
                                                            next[index] = e.target.value;
                                                            inboundForm.setData('template_static_params', next);
                                                        }}
                                                        placeholder="Optional fixed value"
                                                        className="mt-1"
                                                    />
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            <div className="rounded-lg bg-gray-50 dark:bg-gray-900/60 p-3 text-xs text-gray-600 dark:text-gray-400">
                                External systems should POST JSON to the generated URL and send either <code>X-Zyptos-Secret</code> or <code>X-Zyptos-Signature</code>.
                            </div>

                            <Button type="submit" disabled={inboundForm.processing} className="gap-2">
                                <Plus className="h-4 w-4" />
                                Add inbound webhook
                            </Button>
                        </form>

                        {inbound_webhooks.length === 0 ? (
                            <p className="text-sm text-gray-500 dark:text-gray-400">No inbound automation webhooks configured.</p>
                        ) : (
                            <div className="space-y-4">
                                {inbound_webhooks.map((webhook) => (
                                    <div key={webhook.id} className="rounded-lg border border-gray-200 dark:border-gray-700 p-4 space-y-3">
                                        <div className="flex flex-wrap items-start justify-between gap-3">
                                            <div className="min-w-0">
                                                <p className="font-medium text-gray-900 dark:text-gray-100 flex items-center gap-2">
                                                    {webhook.name}
                                                    <span className={`inline-flex rounded-full px-2 py-0.5 text-[11px] ${webhook.is_active ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300' : 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300'}`}>
                                                        {webhook.is_active ? 'Active' : 'Disabled'}
                                                    </span>
                                                </p>
                                                <p className="text-xs text-gray-500 dark:text-gray-400 break-all">{webhook.public_url}</p>
                                                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                                                    {webhook.action_type === 'start_sequence'
                                                        ? `Starts sequence: ${webhook.sequence_name || 'Unavailable sequence'}`
                                                        : `Sends template: ${webhook.template_name || 'Unavailable template'} via ${webhook.connection_name || 'Unavailable connection'}`}
                                                </p>
                                                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                                                    Last received: {webhook.last_received_at ? new Date(webhook.last_received_at).toLocaleString() : '—'}
                                                    {' · '}Last triggered: {webhook.last_triggered_at ? new Date(webhook.last_triggered_at).toLocaleString() : '—'}
                                                </p>
                                                {webhook.last_error && (
                                                    <p className="mt-1 text-xs text-red-600 dark:text-red-400">{webhook.last_error}</p>
                                                )}
                                            </div>
                                            <div className="flex flex-wrap gap-2">
                                                <Button type="button" variant="secondary" size="sm" onClick={() => copyInboundUrl(webhook)} className="gap-1">
                                                    {copiedInboundUrl === webhook.id ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                                                    {copiedInboundUrl === webhook.id ? 'Copied' : 'Copy URL'}
                                                </Button>
                                                <Button type="button" variant="secondary" size="sm" onClick={() => rotateInboundWebhookSecret(webhook)} className="gap-1">
                                                    <RotateCcw className="h-4 w-4" />
                                                    Rotate secret
                                                </Button>
                                                <Button type="button" variant="secondary" size="sm" onClick={() => toggleInboundWebhook(webhook)}>
                                                    {webhook.is_active ? 'Disable' : 'Enable'}
                                                </Button>
                                                <Button type="button" variant="ghost" size="sm" className="text-red-600 hover:text-red-700 dark:text-red-400" onClick={() => deleteInboundWebhook(webhook)}>
                                                    <Trash2 className="h-4 w-4 mr-1" />
                                                    Delete
                                                </Button>
                                            </div>
                                        </div>
                                        <div className="grid gap-3 md:grid-cols-2 text-xs text-gray-500 dark:text-gray-400">
                                            <div>
                                                <span className="font-medium text-gray-700 dark:text-gray-300">Phone path:</span> {webhook.payload_mappings.phone_path || 'phone'}
                                            </div>
                                            <div>
                                                <span className="font-medium text-gray-700 dark:text-gray-300">Idempotency:</span> {webhook.payload_mappings.idempotency_path || 'event_id'}
                                            </div>
                                        </div>
                                        {webhook.recent_logs.length > 0 && (
                                            <div className="overflow-x-auto">
                                                <table className="min-w-full text-xs">
                                                    <thead>
                                                        <tr className="text-left text-gray-500 dark:text-gray-400">
                                                            <th className="py-1 pr-3">Status</th>
                                                            <th className="py-1 pr-3">Summary</th>
                                                            <th className="py-1 pr-3">When</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {webhook.recent_logs.map((log) => (
                                                            <tr key={log.id} className="border-t border-gray-200 dark:border-gray-700">
                                                                <td className="py-2 pr-3">{log.status}</td>
                                                                <td className="py-2 pr-3">{log.response_summary || '—'}</td>
                                                                <td className="py-2 pr-3">{log.created_at ? new Date(log.created_at).toLocaleString() : '—'}</td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>

            </div>
        </AppShell>
    );
}
