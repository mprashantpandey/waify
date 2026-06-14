import { Head, router, usePage } from '@inertiajs/react';
import { useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import AppShell from '@/Layouts/AppShell';
import Button from '@/Components/UI/Button';
import { Card, CardContent } from '@/Components/UI/Card';
import { Badge } from '@/Components/UI/Badge';
import { Alert } from '@/Components/UI/Alert';
import { Modal, ThemedIconTile } from '@/Components/UI/Elements';
import { Activity, ArrowLeftRight, BookOpen, Check, Code2, Copy, Download, ExternalLink, FileText, Gauge, KeyRound, Loader2, Package, Plus, RefreshCw, Terminal, Trash2, Webhook, Zap } from 'lucide-react';
import { useToast } from '@/hooks/useToast';
import { useConfirm } from '@/hooks/useConfirm';

type Endpoint = {
    id: string;
    method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
    path: string;
    summary: string;
    description: string;
    params: Array<{ name: string; type: string; required: boolean; desc: string }>;
    example: string;
    response: string;
};

type Props = {
    stats: {
        api_requests_24h: number;
        credits_remaining: number;
        webhook_success_rate: string;
        avg_latency_ms: number;
        messages_sent: number;
        template_sends: number;
    };
    webhooks: {
        central_url: string;
        verify_url: string;
        events: Array<{ id: string; label: string; desc: string }>;
        deliveries: Array<{ id: string; event: string; url: string; status: number; attempts: number; duration: number; time: string | null; error?: string | null }>;
        endpoints: Array<{ id: number; url: string; events: string[]; is_enabled: boolean; has_secret: boolean; last_tested_at: string | null; last_status: number | null; last_error: string | null; created_at: string | null }>;
    };
    transactions: Array<{ id: string; type: string; category: string; description: string; amount: number; unit: string; balance: number; status: string; createdAt: string | null }>;
    invoices: Array<{ id: string; date: string | null; amount: number; discount_amount: number; currency: string; status: string; plan: string; provider: string; provider_order_id?: string | null; provider_payment_id?: string | null }>;
    requestLogs: Array<{ id: string; method: Endpoint['method']; path: string; status: number; duration: number; ip: string; time: string | null }>;
    api: { base_url: string; rate_limit: string; endpoints: Array<{ id: string; label: string; endpoints: Endpoint[] }> };
    keys: Array<{ id: number; name: string; prefix: string; lastUsed: string | null; lastUsedIp?: string | null; created: string | null; revokedAt?: string | null; scopes: string[] }>;
    newApiKey?: string | null;
    availableScopes: Array<{ id: string; label: string }>;
};

const tabs = [
    { id: 'overview', label: 'Overview', icon: Code2, desc: 'Quick start & status' },
    { id: 'docs', label: 'API Reference', icon: BookOpen, desc: 'Endpoints & examples' },
    { id: 'keys', label: 'API Keys', icon: KeyRound, desc: 'Authentication tokens' },
    { id: 'webhooks', label: 'Webhooks', icon: Webhook, desc: 'Events & deliveries' },
    { id: 'transactions', label: 'Transactions', icon: ArrowLeftRight, desc: 'Credits & usage ledger' },
    { id: 'invoices', label: 'Invoices', icon: FileText, desc: 'Billing documents' },
    { id: 'logs', label: 'Request Logs', icon: Terminal, desc: 'API traffic inspector' },
    { id: 'sdks', label: 'SDKs & Tools', icon: Package, desc: 'Libraries & Postman' },
];

const methodClass: Record<string, string> = {
    GET: 'bg-blue-50 text-blue-700 dark:bg-blue-500/15 dark:text-blue-200',
    POST: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-200',
    PUT: 'bg-amber-50 text-amber-700 dark:bg-amber-500/15 dark:text-amber-200',
    PATCH: 'bg-amber-50 text-amber-700 dark:bg-amber-500/15 dark:text-amber-200',
    DELETE: 'bg-red-50 text-red-700 dark:bg-red-500/15 dark:text-red-200',
};

function formatMoneyMinor(value: number, currency = 'INR') {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency }).format(Number(value || 0) / 100);
}

function formatDate(value: string | null | undefined) {
    if (!value) return 'Never';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return value;
    return date.toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
}

function MethodBadge({ method }: { method: string }) {
    return <span className={`inline-flex min-w-[52px] justify-center rounded px-2 py-0.5 font-mono text-[10px] font-bold ${methodClass[method] || methodClass.GET}`}>{method}</span>;
}

function CodeBlock({ code }: { code: string }) {
    const { toast } = useToast();
    return (
        <div className="overflow-hidden rounded-btn bg-slate-950 ring-1 ring-slate-700">
            <div className="flex items-center justify-between border-b border-slate-800 bg-slate-900 px-3 py-2">
                <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">Example</span>
                <button type="button" onClick={() => {
                    navigator.clipboard?.writeText(code);
                    toast.success('Copied');
                }} className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-400 hover:text-white">
                    <Copy className="h-3 w-3" />
                    Copy
                </button>
            </div>
            <pre className="overflow-x-auto whitespace-pre-wrap p-4 font-mono text-xs leading-6 text-slate-100">{code}</pre>
        </div>
    );
}

function OverviewTab({ stats, setTab, api }: { stats: Props['stats']; setTab: (tab: string) => void; api: Props['api'] }) {
    const items = [
        { label: 'API requests 24h', value: stats.api_requests_24h.toLocaleString('en-IN'), icon: Activity, tone: 'blue' as const },
        { label: 'Credits remaining', value: formatMoneyMinor(stats.credits_remaining), icon: Zap, tone: 'green' as const },
        { label: 'Webhook success', value: stats.webhook_success_rate, icon: Webhook, tone: 'purple' as const },
        { label: 'Avg latency', value: `${stats.avg_latency_ms}ms`, icon: Gauge, tone: 'amber' as const },
    ];

    return (
        <div className="space-y-5">
            <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
                {items.map((item) => {
                    const Icon = item.icon;
                    return (
                        <Card key={item.label} className="border-transparent dark:border-slate-700/80">
                            <CardContent className="p-4">
                                <ThemedIconTile tone={item.tone}><Icon className="h-5 w-5" /></ThemedIconTile>
                                <p className="mt-3 text-xs text-waify-text-muted dark:text-waify-dark-text-muted">{item.label}</p>
                                <p className="mt-1 text-xl font-bold text-waify-text dark:text-waify-dark-text">{item.value}</p>
                            </CardContent>
                        </Card>
                    );
                })}
            </div>

            <div className="rounded-card bg-[#101827] p-5 text-white shadow-card">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                    <div>
                        <h3 className="text-lg font-semibold">Quick start</h3>
                        <p className="mt-1 max-w-2xl text-sm leading-6 text-white/70">Authenticate with a workspace key, send a message, and subscribe to webhooks from the same developer hub.</p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        <Button type="button" variant="secondary" onClick={() => setTab('keys')} className="!bg-white !text-slate-900">Get API key</Button>
                        <Button type="button" variant="ghost" onClick={() => setTab('docs')} className="!text-white hover:!bg-white/10">Read docs</Button>
                    </div>
                </div>
            </div>

            <Alert variant="info" title="Base URL">
                All API requests use <span className="font-mono">{api.base_url}</span>. Current workspace rate limit: {api.rate_limit}.
            </Alert>
        </div>
    );
}

function DocsTab({ api }: { api: Props['api'] }) {
    const [groupId, setGroupId] = useState(api.endpoints[0]?.id || '');
    const group = api.endpoints.find((item) => item.id === groupId) || api.endpoints[0];
    const [endpointId, setEndpointId] = useState(group?.endpoints[0]?.id || '');
    const endpoint = group?.endpoints.find((item) => item.id === endpointId) || group?.endpoints[0];

    if (!endpoint || !group) return null;

    return (
        <div className="flex min-h-[480px] flex-col gap-6 lg:flex-row">
            <aside className="lg:w-64">
                <div className="space-y-4">
                    {api.endpoints.map((endpointGroup) => (
                        <div key={endpointGroup.id}>
                            <div className="mb-1 px-2 text-[10px] font-bold uppercase tracking-wider text-waify-text-muted dark:text-waify-dark-text-muted">{endpointGroup.label}</div>
                            <div className="space-y-1">
                                {endpointGroup.endpoints.map((item) => (
                                    <button key={item.id} type="button" onClick={() => {
                                        setGroupId(endpointGroup.id);
                                        setEndpointId(item.id);
                                    }} className={`flex w-full items-center gap-2 rounded-btn px-2 py-2 text-left text-xs transition ${endpointId === item.id ? 'bg-waify-green-soft text-waify-green-dark dark:bg-emerald-500/10 dark:text-emerald-200' : 'text-waify-text-muted hover:bg-gray-50 dark:text-waify-dark-text-muted dark:hover:bg-waify-dark-surface-2'}`}>
                                        <MethodBadge method={item.method} />
                                        <span className="truncate font-mono">{item.path}</span>
                                    </button>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </aside>
            <div className="min-w-0 flex-1 space-y-5">
                <div>
                    <div className="flex flex-wrap items-center gap-3">
                        <MethodBadge method={endpoint.method} />
                        <code className="rounded bg-gray-100 px-2 py-1 font-mono text-sm text-waify-text dark:bg-waify-dark-surface-2 dark:text-waify-dark-text">{endpoint.path}</code>
                    </div>
                    <h3 className="mt-3 text-lg font-semibold text-waify-text dark:text-waify-dark-text">{endpoint.summary}</h3>
                    <p className="mt-1 text-sm text-waify-text-muted dark:text-waify-dark-text-muted">{endpoint.description}</p>
                </div>
                {endpoint.params.length > 0 && (
                    <div className="overflow-hidden rounded-card border border-gray-100 dark:border-waify-dark-border">
                        <div className="border-b border-gray-100 px-4 py-2 text-xs font-semibold uppercase text-waify-text-muted dark:border-waify-dark-border dark:text-waify-dark-text-muted">Parameters</div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <tbody>
                                    {endpoint.params.map((param) => (
                                        <tr key={param.name} className="border-t border-gray-100 dark:border-waify-dark-border">
                                            <td className="px-4 py-2 font-mono text-xs">{param.name}</td>
                                            <td className="px-4 py-2 text-waify-text-muted dark:text-waify-dark-text-muted">{param.type}</td>
                                            <td className="px-4 py-2">{param.required ? <span className="text-xs font-semibold text-red-600">Required</span> : <span className="text-xs text-waify-text-muted">Optional</span>}</td>
                                            <td className="px-4 py-2 text-waify-text-muted dark:text-waify-dark-text-muted">{param.desc}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
                <CodeBlock code={endpoint.example} />
                <div className="rounded-card border border-gray-100 p-4 dark:border-waify-dark-border">
                    <div className="mb-2 text-xs font-semibold uppercase text-waify-text-muted dark:text-waify-dark-text-muted">Response</div>
                    <pre className="overflow-x-auto rounded-btn bg-gray-50 p-3 font-mono text-xs text-waify-text dark:bg-waify-dark-surface-2 dark:text-waify-dark-text">{endpoint.response}</pre>
                </div>
            </div>
        </div>
    );
}

function KeysTab({ keys, availableScopes, newApiKey, canManageKeys }: { keys: Props['keys']; availableScopes: Props['availableScopes']; newApiKey?: string | null; canManageKeys: boolean }) {
    const { toast } = useToast();
    const confirm = useConfirm();
    const [open, setOpen] = useState(false);
    const [processing, setProcessing] = useState(false);
    const [form, setForm] = useState({ name: 'Workspace API key', scopes: ['connections:read', 'templates:read', 'conversations:read', 'messages:write'] });

    const createKey = () => {
        if (!canManageKeys) return;
        setProcessing(true);
        router.post(route('app.developer.keys.store'), form, {
            preserveScroll: true,
            onSuccess: () => setOpen(false),
            onFinish: () => setProcessing(false),
        });
    };

    const revokeKey = async (id: number) => {
        if (!canManageKeys) return;
        const confirmed = await confirm({
            title: 'Revoke API key',
            message: 'Revoke this API key? Existing integrations using it will stop working.',
            confirmText: 'Revoke key',
            variant: 'danger',
        });
        if (!confirmed) return;
        router.delete(route('app.developer.keys.destroy', id), { preserveScroll: true });
    };

    const toggleScope = (scope: string) => {
        setForm((current) => {
            const hasScope = current.scopes.includes(scope);
            const nextScopes = hasScope ? current.scopes.filter((item) => item !== scope) : [...current.scopes, scope];
            return { ...current, scopes: scope === '*' && !hasScope ? ['*'] : nextScopes.filter((item) => scope === '*' || item !== '*') };
        });
    };

    const copyNewKey = () => {
        if (!newApiKey) return;
        navigator.clipboard?.writeText(newApiKey);
        toast.success('API key copied');
    };

    return (
        <div className="space-y-5">
            {newApiKey && (
                <Alert variant="success" title="Copy your new API key now">
                    <div className="mt-2 flex flex-col gap-2 sm:flex-row sm:items-center">
                        <code className="min-w-0 flex-1 break-all rounded-btn bg-white/80 px-3 py-2 text-xs text-waify-text dark:bg-waify-dark-surface-2 dark:text-waify-dark-text">{newApiKey}</code>
                        <Button type="button" size="sm" onClick={copyNewKey}><Copy className="h-4 w-4" /> Copy</Button>
                    </div>
                </Alert>
            )}
            <Alert variant="warning" title="Keep keys secret">Never expose live keys in client-side code or public repositories. Rotate immediately if compromised.</Alert>
            {!canManageKeys && <Alert variant="info" title="Owner only">Only workspace owners can create, revoke, or view credential controls.</Alert>}
            <div className="flex justify-end">
                <Button type="button" onClick={() => setOpen(true)} disabled={!canManageKeys} title={canManageKeys ? 'Create API key' : 'Requires workspace owner'}>
                    <Plus className="h-4 w-4" /> Create API key
                </Button>
            </div>
            <div className="space-y-3">
                {keys.map((key) => (
                    <Card key={key.name} className="border-transparent dark:border-slate-700/80">
                        <CardContent className="p-4">
                            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                                <div>
                                    <div className="flex flex-wrap items-center gap-2">
                                        <p className="font-semibold text-waify-text dark:text-waify-dark-text">{key.name}</p>
                                        {key.revokedAt && <Badge variant="danger">revoked</Badge>}
                                    </div>
                                    <p className="mt-1 font-mono text-xs text-waify-text-muted dark:text-waify-dark-text-muted">{key.prefix}****************</p>
                                    <div className="mt-2 flex flex-wrap gap-1">
                                        {key.scopes.map((scope) => <span key={scope} className="rounded bg-gray-100 px-1.5 py-0.5 text-[10px] text-waify-text-muted dark:bg-waify-dark-surface-2 dark:text-waify-dark-text-muted">{scope}</span>)}
                                    </div>
                                </div>
                                <div className="space-y-2 text-xs text-waify-text-muted dark:text-waify-dark-text-muted sm:text-right">
                                    <div>Last used {formatDate(key.lastUsed)}</div>
                                    {key.lastUsedIp && <div>IP {key.lastUsedIp}</div>}
                                    <div>Created {formatDate(key.created)}</div>
                                    {!key.revokedAt && (
                                        <Button type="button" size="xs" variant="danger" onClick={() => revokeKey(key.id)} disabled={!canManageKeys} title={canManageKeys ? 'Revoke key' : 'Requires workspace owner'}>
                                            <Trash2 className="h-3.5 w-3.5" /> Revoke
                                        </Button>
                                    )}
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
                {keys.length === 0 && (
                    <Card><CardContent className="p-8 text-center text-sm text-waify-text-muted dark:text-waify-dark-text-muted">No API keys yet. Create one to start using the public API.</CardContent></Card>
                )}
            </div>
            <Modal
                open={open}
                onClose={() => setOpen(false)}
                title="Create API key"
                description="Keys are scoped to this workspace and can be revoked any time."
                footer={(
                    <>
                        <Button type="button" variant="secondary" onClick={() => setOpen(false)}>Cancel</Button>
                        <Button type="button" onClick={createKey} disabled={processing || form.scopes.length === 0}>
                            {processing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                            Create key
                        </Button>
                    </>
                )}
            >
                <div className="space-y-4">
                    <div>
                        <label className="mb-1.5 block text-sm font-medium text-waify-text dark:text-waify-dark-text">Key name</label>
                        <input value={form.name} onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))} className="h-10 w-full rounded-btn border border-gray-200 bg-white px-3 text-sm dark:border-waify-dark-border dark:bg-waify-dark-surface" />
                    </div>
                    <div>
                        <div className="mb-2 text-sm font-medium text-waify-text dark:text-waify-dark-text">Scopes</div>
                        <div className="grid gap-2">
                            {availableScopes.map((scope) => (
                                <label key={scope.id} className="flex items-center gap-3 rounded-btn border border-gray-100 p-3 text-sm dark:border-waify-dark-border">
                                    <input type="checkbox" checked={form.scopes.includes(scope.id)} onChange={() => toggleScope(scope.id)} className="h-4 w-4 rounded border-gray-300 text-waify-green focus:ring-waify-green" />
                                    <span>
                                        <span className="block font-medium text-waify-text dark:text-waify-dark-text">{scope.label}</span>
                                        <span className="font-mono text-[11px] text-waify-text-muted dark:text-waify-dark-text-muted">{scope.id}</span>
                                    </span>
                                </label>
                            ))}
                        </div>
                    </div>
                </div>
            </Modal>
        </div>
    );
}

function WebhooksTab({ webhooks, canManageKeys }: { webhooks: Props['webhooks']; canManageKeys: boolean }) {
    const confirm = useConfirm();
    const [open, setOpen] = useState(false);
    const [editing, setEditing] = useState<Props['webhooks']['endpoints'][number] | null>(null);
    const [processing, setProcessing] = useState(false);
    const [form, setForm] = useState({ url: '', secret: '', events: ['message.received', 'message.delivered'], is_enabled: true });

    const openEditor = (endpoint?: Props['webhooks']['endpoints'][number]) => {
        setEditing(endpoint || null);
        setForm(endpoint ? {
            url: endpoint.url,
            secret: '',
            events: endpoint.events.length ? endpoint.events : ['message.received'],
            is_enabled: endpoint.is_enabled,
        } : { url: '', secret: '', events: ['message.received', 'message.delivered'], is_enabled: true });
        setOpen(true);
    };

    const saveEndpoint = () => {
        if (!canManageKeys) return;
        setProcessing(true);
        const options = {
            preserveScroll: true,
            onSuccess: () => setOpen(false),
            onFinish: () => setProcessing(false),
        };
        editing
            ? router.patch(route('app.developer.webhooks.update', editing.id), form, options)
            : router.post(route('app.developer.webhooks.store'), form, options);
    };

    const deleteEndpoint = async (id: number) => {
        if (!canManageKeys) return;
        const confirmed = await confirm({
            title: 'Remove webhook endpoint',
            message: 'Remove this webhook endpoint? Deliveries to this URL will stop.',
            confirmText: 'Remove endpoint',
            variant: 'danger',
        });
        if (!confirmed) return;
        router.delete(route('app.developer.webhooks.destroy', id), { preserveScroll: true });
    };

    const testEndpoint = (id: number) => {
        router.post(route('app.developer.webhooks.test', id), {}, { preserveScroll: true });
    };

    const toggleEvent = (eventId: string) => {
        setForm((current) => ({
            ...current,
            events: current.events.includes(eventId)
                ? current.events.filter((item) => item !== eventId)
                : [...current.events, eventId],
        }));
    };

    return (
        <div className="space-y-5">
            <Card className="border-transparent dark:border-slate-700/80">
                <CardContent className="space-y-3 p-4">
                    <div>
                        <h3 className="font-semibold text-waify-text dark:text-waify-dark-text">Central webhook endpoint</h3>
                        <p className="mt-1 text-xs text-waify-text-muted dark:text-waify-dark-text-muted">Platform-managed Meta webhook endpoint for embedded signup accounts.</p>
                    </div>
                    <div className="rounded-btn bg-gray-50 p-3 font-mono text-xs text-waify-text dark:bg-waify-dark-surface-2 dark:text-waify-dark-text">{webhooks.central_url}</div>
                    <div className="rounded-btn bg-gray-50 p-3 font-mono text-xs text-waify-text dark:bg-waify-dark-surface-2 dark:text-waify-dark-text">{webhooks.verify_url}</div>
                </CardContent>
            </Card>
            <div className="flex items-center justify-between gap-3">
                <div>
                    <h3 className="font-semibold text-waify-text dark:text-waify-dark-text">Workspace webhook endpoints</h3>
                    <p className="mt-1 text-xs text-waify-text-muted dark:text-waify-dark-text-muted">Send Zyptos events to your CRM, automation tool, or backend.</p>
                </div>
                <Button type="button" onClick={() => openEditor()} disabled={!canManageKeys} title={canManageKeys ? 'Add endpoint' : 'Requires workspace owner'}>
                    <Plus className="h-4 w-4" /> Add endpoint
                </Button>
            </div>
            {!canManageKeys && <Alert variant="info" title="Owner only">Webhook endpoint changes are restricted to workspace owners.</Alert>}
            <div className="space-y-3">
                {webhooks.endpoints.map((endpoint) => (
                    <Card key={endpoint.id} className="border-transparent dark:border-slate-700/80">
                        <CardContent className="p-4">
                            <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                                <div className="min-w-0">
                                    <div className="flex flex-wrap items-center gap-2">
                                        <p className="break-all font-mono text-xs font-semibold text-waify-text dark:text-waify-dark-text">{endpoint.url}</p>
                                        <Badge variant={endpoint.is_enabled ? 'success' : 'secondary'}>{endpoint.is_enabled ? 'enabled' : 'disabled'}</Badge>
                                        {endpoint.has_secret && <Badge variant="info">signed</Badge>}
                                    </div>
                                    <div className="mt-2 flex flex-wrap gap-1">
                                        {endpoint.events.map((event) => <span key={event} className="rounded bg-gray-100 px-1.5 py-0.5 text-[10px] text-waify-text-muted dark:bg-waify-dark-surface-2 dark:text-waify-dark-text-muted">{event}</span>)}
                                    </div>
                                    <p className="mt-2 text-xs text-waify-text-muted dark:text-waify-dark-text-muted">
                                        Last test {formatDate(endpoint.last_tested_at)} {endpoint.last_status ? `· ${endpoint.last_status}` : ''}
                                    </p>
                                    {endpoint.last_error && <p className="mt-1 line-clamp-2 text-xs text-red-600 dark:text-red-300">{endpoint.last_error}</p>}
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    <Button type="button" size="sm" variant="secondary" onClick={() => testEndpoint(endpoint.id)}>Test</Button>
                                    <Button type="button" size="sm" variant="secondary" onClick={() => openEditor(endpoint)} disabled={!canManageKeys}>Edit</Button>
                                    <Button type="button" size="sm" variant="danger" onClick={() => deleteEndpoint(endpoint.id)} disabled={!canManageKeys}>Delete</Button>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
                {webhooks.endpoints.length === 0 && (
                    <Card><CardContent className="p-8 text-center text-sm text-waify-text-muted dark:text-waify-dark-text-muted">No outbound webhook endpoints configured.</CardContent></Card>
                )}
            </div>
            <div className="grid gap-2 sm:grid-cols-2">
                {webhooks.events.map((event) => (
                    <div key={event.id} className="rounded-btn border border-gray-100 p-3 dark:border-waify-dark-border">
                        <p className="font-mono text-xs font-semibold text-waify-text dark:text-waify-dark-text">{event.label}</p>
                        <p className="mt-1 text-[11px] text-waify-text-muted dark:text-waify-dark-text-muted">{event.desc}</p>
                    </div>
                ))}
            </div>
            <div className="overflow-hidden rounded-card border border-gray-100 dark:border-waify-dark-border">
                <div className="flex items-center justify-between border-b border-gray-100 px-4 py-3 dark:border-waify-dark-border">
                    <span className="text-sm font-semibold text-waify-text dark:text-waify-dark-text">Recent deliveries</span>
                    <RefreshCw className="h-4 w-4 text-waify-text-muted" />
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <tbody>
                            {webhooks.deliveries.map((delivery) => (
                                <tr key={delivery.id} className="border-t border-gray-100 dark:border-waify-dark-border">
                                    <td className="px-4 py-3 font-mono text-xs">{delivery.event}</td>
                                    <td className="px-4 py-3">{delivery.status === 200 ? <span className="text-xs font-semibold text-emerald-600">200</span> : <span className="text-xs font-semibold text-red-600">Failed</span>}</td>
                                    <td className="px-4 py-3 text-waify-text-muted">{delivery.attempts} attempts</td>
                                    <td className="px-4 py-3 text-waify-text-muted">{delivery.duration ? `${delivery.duration}ms` : '-'}</td>
                                    <td className="px-4 py-3 text-waify-text-muted">{formatDate(delivery.time)}</td>
                                </tr>
                            ))}
                            {webhooks.deliveries.length === 0 && (
                                <tr><td className="px-4 py-8 text-center text-sm text-waify-text-muted" colSpan={5}>No webhook deliveries yet.</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
            <Modal
                open={open}
                onClose={() => setOpen(false)}
                title={editing ? 'Edit webhook endpoint' : 'Add webhook endpoint'}
                description="Zyptos signs test deliveries with X-Zyptos-Signature when a secret is present."
                footer={(
                    <>
                        <Button type="button" variant="secondary" onClick={() => setOpen(false)}>Cancel</Button>
                        <Button type="button" onClick={saveEndpoint} disabled={!canManageKeys || processing || form.events.length === 0 || !form.url}>
                            {processing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                            Save endpoint
                        </Button>
                    </>
                )}
            >
                <div className="space-y-4">
                    <div>
                        <label className="mb-1.5 block text-sm font-medium text-waify-text dark:text-waify-dark-text">Endpoint URL</label>
                        <input value={form.url} onChange={(event) => setForm((current) => ({ ...current, url: event.target.value }))} placeholder="https://example.com/webhooks/waify" className="h-10 w-full rounded-btn border border-gray-200 bg-white px-3 text-sm dark:border-waify-dark-border dark:bg-waify-dark-surface" />
                    </div>
                    <div>
                        <label className="mb-1.5 block text-sm font-medium text-waify-text dark:text-waify-dark-text">Signing secret</label>
                        <input value={form.secret} onChange={(event) => setForm((current) => ({ ...current, secret: event.target.value }))} placeholder={editing?.has_secret ? 'Leave blank to keep current secret' : 'Optional'} className="h-10 w-full rounded-btn border border-gray-200 bg-white px-3 text-sm dark:border-waify-dark-border dark:bg-waify-dark-surface" />
                    </div>
                    <label className="flex items-center gap-2 text-sm text-waify-text dark:text-waify-dark-text">
                        <input type="checkbox" checked={form.is_enabled} onChange={(event) => setForm((current) => ({ ...current, is_enabled: event.target.checked }))} className="h-4 w-4 rounded border-gray-300 text-waify-green focus:ring-waify-green" />
                        Endpoint enabled
                    </label>
                    <div>
                        <div className="mb-2 text-sm font-medium text-waify-text dark:text-waify-dark-text">Events</div>
                        <div className="grid gap-2">
                            {webhooks.events.map((event) => (
                                <label key={event.id} className="flex items-start gap-3 rounded-btn border border-gray-100 p-3 text-sm dark:border-waify-dark-border">
                                    <input type="checkbox" checked={form.events.includes(event.id)} onChange={() => toggleEvent(event.id)} className="mt-0.5 h-4 w-4 rounded border-gray-300 text-waify-green focus:ring-waify-green" />
                                    <span>
                                        <span className="block font-mono text-xs font-semibold text-waify-text dark:text-waify-dark-text">{event.label}</span>
                                        <span className="text-xs text-waify-text-muted dark:text-waify-dark-text-muted">{event.desc}</span>
                                    </span>
                                </label>
                            ))}
                        </div>
                    </div>
                </div>
            </Modal>
        </div>
    );
}

function TransactionsTab({ transactions }: { transactions: Props['transactions'] }) {
    const [filter, setFilter] = useState('all');
    const filtered = transactions.filter((transaction) => filter === 'all' || transaction.type === filter);
    return (
        <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-2">
                {['all', 'credit', 'debit'].map((item) => (
                    <button key={item} type="button" onClick={() => setFilter(item)} className={`rounded-full px-3 py-1.5 text-xs font-semibold capitalize ${filter === item ? 'bg-waify-text text-white dark:bg-waify-dark-text dark:text-waify-dark-bg' : 'bg-white text-waify-text-muted ring-1 ring-gray-200 dark:bg-waify-dark-surface dark:text-waify-dark-text-muted dark:ring-waify-dark-border'}`}>{item}</button>
                ))}
            </div>
            <DataTable empty="No ledger entries yet.">
                {filtered.map((transaction) => (
                    <tr key={transaction.id} className="border-t border-gray-100 dark:border-waify-dark-border">
                        <td className="px-4 py-3">
                            <p className="font-medium text-waify-text dark:text-waify-dark-text">{transaction.description}</p>
                            <p className="font-mono text-[11px] text-waify-text-muted">{transaction.id}</p>
                        </td>
                        <td className="px-4 py-3 capitalize text-waify-text-muted">{transaction.category}</td>
                        <td className={`px-4 py-3 text-right font-semibold ${transaction.amount > 0 ? 'text-emerald-600' : 'text-waify-text dark:text-waify-dark-text'}`}>{transaction.amount > 0 ? '+' : ''}{formatMoneyMinor(transaction.amount, transaction.unit)}</td>
                        <td className="px-4 py-3 text-right">{formatMoneyMinor(transaction.balance, transaction.unit)}</td>
                        <td className="px-4 py-3">{transaction.status}</td>
                        <td className="px-4 py-3 text-waify-text-muted">{formatDate(transaction.createdAt)}</td>
                    </tr>
                ))}
            </DataTable>
        </div>
    );
}

function DataTable({ children, empty }: { children: ReactNode; empty: string }) {
    const hasChildren = Array.isArray(children) ? children.length > 0 : Boolean(children);
    return (
        <div className="overflow-hidden rounded-card border border-gray-100 dark:border-waify-dark-border">
            <div className="overflow-x-auto">
                <table className="w-full text-sm">
                    <tbody>{hasChildren ? children : <tr><td className="px-4 py-8 text-center text-sm text-waify-text-muted">{empty}</td></tr>}</tbody>
                </table>
            </div>
        </div>
    );
}

function InvoicesTab({ invoices }: { invoices: Props['invoices'] }) {
    const [preview, setPreview] = useState<Props['invoices'][number] | null>(null);
    return (
        <div>
            <DataTable empty="No invoices yet.">
                {invoices.map((invoice) => (
                    <tr key={invoice.id} className="border-t border-gray-100 dark:border-waify-dark-border">
                        <td className="px-4 py-3 font-mono text-xs font-semibold">{invoice.id}</td>
                        <td className="px-4 py-3">{invoice.plan}</td>
                        <td className="px-4 py-3 text-waify-text-muted">{formatDate(invoice.date)}</td>
                        <td className="px-4 py-3 text-right font-semibold">{formatMoneyMinor(invoice.amount, invoice.currency)}</td>
                        <td className="px-4 py-3"><Badge variant={invoice.status === 'paid' ? 'success' : invoice.status === 'failed' ? 'danger' : 'warning'}>{invoice.status}</Badge></td>
                        <td className="px-4 py-3 text-right"><button type="button" onClick={() => setPreview(invoice)} className="text-xs font-semibold text-waify-green-dark hover:underline dark:text-emerald-300">View</button></td>
                    </tr>
                ))}
            </DataTable>
            <Modal open={Boolean(preview)} onClose={() => setPreview(null)} title={preview?.id || 'Invoice'} description="Billing document preview" className="max-w-2xl">
                {preview && (
                    <div className="space-y-4">
                        <div className="rounded-card border border-gray-100 p-4 dark:border-waify-dark-border">
                            <div className="flex justify-between gap-3">
                                <div>
                                    <p className="text-xs text-waify-text-muted">Plan</p>
                                    <p className="font-semibold">{preview.plan}</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-xs text-waify-text-muted">Amount</p>
                                    <p className="font-semibold">{formatMoneyMinor(preview.amount, preview.currency)}</p>
                                </div>
                            </div>
                            <div className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
                                <div>Provider: {preview.provider}</div>
                                <div>Status: {preview.status}</div>
                                <div>Order: {preview.provider_order_id || '-'}</div>
                                <div>Payment: {preview.provider_payment_id || '-'}</div>
                            </div>
                        </div>
                        <Button type="button" variant="secondary"><Download className="h-4 w-4" />Download PDF</Button>
                    </div>
                )}
            </Modal>
        </div>
    );
}

function LogsTab({ logs }: { logs: Props['requestLogs'] }) {
    const [statusFilter, setStatusFilter] = useState('all');
    const filtered = logs.filter((log) => {
        if (statusFilter === '2xx') return log.status >= 200 && log.status < 300;
        if (statusFilter === '4xx') return log.status >= 400 && log.status < 500;
        if (statusFilter === '5xx') return log.status >= 500;
        return true;
    });

    return (
        <div className="space-y-4">
            <div className="flex gap-2">
                {['all', '2xx', '4xx', '5xx'].map((item) => (
                    <button key={item} type="button" onClick={() => setStatusFilter(item)} className={`rounded-full px-3 py-1.5 text-xs font-semibold ${statusFilter === item ? 'bg-waify-text text-white dark:bg-waify-dark-text dark:text-waify-dark-bg' : 'bg-white text-waify-text-muted ring-1 ring-gray-200 dark:bg-waify-dark-surface dark:text-waify-dark-text-muted dark:ring-waify-dark-border'}`}>{item}</button>
                ))}
            </div>
            <DataTable empty="No API request logs yet.">
                {filtered.map((log) => (
                    <tr key={log.id} className="border-t border-gray-100 font-mono text-xs dark:border-waify-dark-border">
                        <td className="px-4 py-3"><MethodBadge method={log.method} /></td>
                        <td className="px-4 py-3">{log.path}</td>
                        <td className={`px-4 py-3 font-bold ${log.status >= 400 ? 'text-red-600' : 'text-emerald-600'}`}>{log.status}</td>
                        <td className="px-4 py-3 text-waify-text-muted">{log.duration}ms</td>
                        <td className="px-4 py-3 text-waify-text-muted">{log.ip}</td>
                        <td className="px-4 py-3 text-waify-text-muted">{formatDate(log.time)}</td>
                    </tr>
                ))}
            </DataTable>
        </div>
    );
}

function SdksTab() {
    const sdks = [
        ['Node.js', 'npm install @waify/sdk'],
        ['Python', 'pip install waify'],
        ['PHP', 'composer require waify/sdk'],
        ['Postman', 'Download OpenAPI collection'],
    ];
    return (
        <div className="grid gap-4 sm:grid-cols-2">
            {sdks.map(([name, command]) => (
                <Card key={name} className="border-transparent dark:border-slate-700/80">
                    <CardContent className="p-4">
                        <p className="font-semibold text-waify-text dark:text-waify-dark-text">{name}</p>
                        <code className="mt-3 block rounded-btn bg-gray-50 p-2 font-mono text-xs dark:bg-waify-dark-surface-2">{command}</code>
                    </CardContent>
                </Card>
            ))}
        </div>
    );
}

export default function DeveloperIndex(props: Props) {
    const { workspace_permissions } = usePage().props as any;
    const [tab, setTab] = useState('overview');
    const active = useMemo(() => tabs.find((item) => item.id === tab) || tabs[0], [tab]);
    const canManageKeys = Boolean(workspace_permissions?.['api_keys.owner']);

    return (
        <AppShell>
            <Head title="Developer" />
            <div className="module-page max-w-[1400px]">
                <div className="flex flex-wrap items-end justify-between gap-3">
                    <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-waify-green-dark dark:text-emerald-300">Developer</p>
                        <h1 className="module-heading">Developer</h1>
                        <p className="module-subheading">API reference, webhooks, usage ledger, and billing documents.</p>
                    </div>
                    <Button type="button" variant="secondary"><ExternalLink className="h-4 w-4" />Full docs site</Button>
                </div>

                <div className="flex flex-col gap-6 lg:flex-row lg:items-start">
                    <nav className="w-full lg:w-[250px]">
                        <Card className="border-transparent dark:border-slate-700/80 lg:sticky lg:top-6">
                            <CardContent className="flex gap-1 overflow-x-auto p-2 lg:max-h-[72vh] lg:flex-col lg:overflow-y-auto">
                                {tabs.map((item) => {
                                    const Icon = item.icon;
                                    const selected = tab === item.id;
                                    return (
                                        <button key={item.id} type="button" onClick={() => setTab(item.id)} className={`flex shrink-0 items-center gap-3 rounded-btn px-3 py-2.5 text-left transition lg:w-full ${selected ? 'bg-waify-green-soft text-waify-green-dark dark:bg-emerald-500/10 dark:text-emerald-200' : 'text-waify-text-muted hover:bg-gray-50 hover:text-waify-text dark:text-waify-dark-text-muted dark:hover:bg-waify-dark-surface-2 dark:hover:text-waify-dark-text'}`}>
                                            <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${selected ? 'bg-white/80 dark:bg-waify-dark-surface' : 'bg-gray-100 dark:bg-waify-dark-surface-2'}`}><Icon className="h-4 w-4" /></span>
                                            <span className="hidden min-w-0 sm:block">
                                                <span className="block truncate text-sm font-semibold">{item.label}</span>
                                                <span className="block truncate text-[11px] opacity-80">{item.desc}</span>
                                            </span>
                                        </button>
                                    );
                                })}
                            </CardContent>
                        </Card>
                    </nav>
                    <Card className="min-w-0 flex-1 overflow-hidden border-transparent dark:border-slate-700/80">
                        <div className="border-b border-gray-100 bg-gray-50/70 px-5 py-4 dark:border-waify-dark-border dark:bg-waify-dark-surface-2/60">
                            <h2 className="text-lg font-semibold text-waify-text dark:text-waify-dark-text">{active.label}</h2>
                            <p className="mt-0.5 text-sm text-waify-text-muted dark:text-waify-dark-text-muted">{active.desc}</p>
                        </div>
                        <CardContent className="p-5">
                            {tab === 'overview' && <OverviewTab stats={props.stats} setTab={setTab} api={props.api} />}
                            {tab === 'docs' && <DocsTab api={props.api} />}
                            {tab === 'keys' && <KeysTab keys={props.keys} availableScopes={props.availableScopes} newApiKey={props.newApiKey} canManageKeys={canManageKeys} />}
                            {tab === 'webhooks' && <WebhooksTab webhooks={props.webhooks} canManageKeys={canManageKeys} />}
                            {tab === 'transactions' && <TransactionsTab transactions={props.transactions} />}
                            {tab === 'invoices' && <InvoicesTab invoices={props.invoices} />}
                            {tab === 'logs' && <LogsTab logs={props.requestLogs} />}
                            {tab === 'sdks' && <SdksTab />}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AppShell>
    );
}
