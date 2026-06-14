import { Head, Link, router } from '@inertiajs/react';
import { useEffect, useMemo, useState } from 'react';
import AppShell from '@/Layouts/AppShell';
import Button from '@/Components/UI/Button';
import { Card, CardContent } from '@/Components/UI/Card';
import { Alert } from '@/Components/UI/Alert';
import { Drawer, StatusBadge } from '@/Components/UI/Elements';
import TextInput from '@/Components/TextInput';
import ProviderLogo from '@/Components/Integrations/ProviderLogo';
import { cn } from '@/lib/utils';
import {
    CheckCircle2,
    Code2,
    Database,
    ExternalLink,
    Link2,
    Loader2,
    Plug,
    RefreshCw,
    Search,
    Settings2,
    Unplug,
} from 'lucide-react';

type Field = {
    name: string;
    label: string;
    placeholder?: string;
    type?: 'select' | 'boolean' | 'textarea' | 'url' | 'number';
    secret?: boolean;
    description?: string;
    options?: Array<{ value: string; label: string }>;
    visible_when?: Record<string, string | boolean>;
};

type Integration = {
    id: string;
    name: string;
    category: string;
    desc: string;
    color: string;
    popular: boolean;
    stage?: 'live' | 'beta' | 'roadmap';
    connected: boolean;
    status: string;
    lastSync: string | null;
    events24h: number;
    health: string | { status?: string | null } | null;
    healthDetails?: Array<{ label: string; value: string | null }>;
    lastError?: string | null;
    features: string[];
    fields: Field[];
    config: Record<string, string | boolean | null>;
    systemManaged?: boolean;
    route?: string;
    oauth?: string | null;
    webhookUrl?: string | null;
    recentLogs?: SyncLog[];
    canManageCredentials?: boolean;
};

type SyncLog = {
    id: number;
    provider: string;
    status: string;
    trigger: string;
    started_at: string | null;
    finished_at: string | null;
    duration_ms: number | null;
    created_count: number;
    updated_count: number;
    skipped_count: number;
    error_count: number;
    summary?: Record<string, unknown> | null;
    error_message?: string | null;
};

type Props = {
    integrations: Integration[];
    summary: {
        connected: number;
        events_today: number;
        healthy: number;
        webhook_url: string;
        api_base_url: string;
    };
    waba: {
        name: string;
        phone: string | null;
        waba_id: string | null;
        phone_number_id: string | null;
        setup_method: string | null;
        webhook_subscribed: boolean;
    } | null;
    sync_logs: SyncLog[];
};

const baseCategories = [
    { id: 'all', label: 'All' },
    { id: 'connected', label: 'Connected' },
];

function formatNumber(value: number) {
    return new Intl.NumberFormat('en-IN').format(Number(value || 0));
}

function healthStatus(health: Integration['health']) {
    if (!health) return null;

    if (typeof health === 'object') {
        return health.status || 'configured';
    }

    return health;
}

function stageLabel(stage?: Integration['stage']) {
    if (stage === 'roadmap') return 'Roadmap';
    if (stage === 'beta') return 'Beta';

    return 'Live';
}

function stageTone(stage?: Integration['stage']): 'success' | 'warning' | 'muted' {
    if (stage === 'roadmap') return 'muted';
    if (stage === 'beta') return 'warning';

    return 'success';
}

function initialForm(item: Integration | null) {
    const values: Record<string, string | boolean> = {
        sync_direction: 'import',
        auto_sync: true,
    };

    item?.fields.forEach((field) => {
        const value = item.config?.[field.name];
        values[field.name] = typeof value === 'boolean'
            ? value
            : String(value ?? (field.type === 'boolean' ? true : field.type === 'select' ? field.options?.[0]?.value || '' : ''));
    });

    return values;
}

function IntegrationDrawer({
    item,
    open,
    onClose,
}: {
    item: Integration | null;
    open: boolean;
    onClose: () => void;
}) {
    const [form, setForm] = useState<Record<string, string | boolean>>({});
    const [processing, setProcessing] = useState<string | null>(null);
    const [resources, setResources] = useState<Array<{ id: string; name: string; meta?: string | null; url?: string | null; defaultSheet?: string | null; businessId?: string | null; businessName?: string | null }>>([]);
    const [resourceError, setResourceError] = useState<string | null>(null);

    useEffect(() => {
        setForm(initialForm(item));
        setProcessing(null);
        setResources([]);
        setResourceError(null);
    }, [item]);

    if (!item) return null;

        const postAction = (routeName: string, method: 'post' | 'patch' | 'delete' = 'post') => {
            setProcessing(routeName);
            const options = {
            preserveScroll: true,
            onFinish: () => setProcessing(null),
            onSuccess: () => {
                if (method === 'delete') onClose();
            },
            };
    
            if (routeName === 'app.integrations.oauth') {
                window.location.assign(route(routeName, item.id));
            } else if (method === 'patch') {
                router.patch(route(routeName, item.id), form, options);
        } else if (method === 'delete') {
            router.delete(route(routeName, item.id), options);
        } else {
            router.post(route(routeName, item.id), {}, options);
        }
    };

    const loadGoogleResources = async () => {
        setProcessing('app.integrations.resources');
        setResourceError(null);
        try {
            const response = await fetch(route('app.integrations.resources', item.id), {
                headers: {
                    Accept: 'application/json',
                    'X-Requested-With': 'XMLHttpRequest',
                },
            });
            const payload = await response.json();
            if (!response.ok) {
                throw new Error(payload.message || 'Unable to load resources.');
            }
            setResources(payload.items || []);
        } catch (error) {
            setResourceError(error instanceof Error ? error.message : 'Unable to load resources.');
        } finally {
            setProcessing(null);
        }
    };

        const chooseResource = (resource: { id: string; name: string; defaultSheet?: string | null; businessId?: string | null; businessName?: string | null }) => {
            if (item.id === 'google-sheets') {
                setForm((current) => ({ ...current, spreadsheet_id: resource.id, sheet_name: resource.defaultSheet || String(current.sheet_name || '') }));
            } else if (item.id === 'google-calendar') {
                setForm((current) => ({ ...current, calendar_id: resource.id }));
            } else if (item.id === 'meta-leads') {
                setForm((current) => ({ ...current, form_id: resource.id, form_name: resource.name }));
            } else if (item.id === 'meta-catalog') {
                setForm((current) => ({ ...current, catalog_id: resource.id, catalog_name: resource.name, business_id: resource.businessId || String(current.business_id || '') }));
            }
        };

    const isSelectedResource = (resource: { id: string }) => {
        if (item.id === 'google-sheets') return String(form.spreadsheet_id || '') === resource.id;
        if (item.id === 'google-calendar') return String(form.calendar_id || '') === resource.id;
        if (item.id === 'meta-leads') return String(form.form_id || '') === resource.id;
        if (item.id === 'meta-catalog') return String(form.catalog_id || '') === resource.id;

        return false;
    };

    const manageHref = item.id === 'google-sheets'
        ? route('app.contacts.index')
        : item.id === 'google-calendar'
            ? route('app.appointments.index')
            : item.id === 'meta-leads'
                ? route('app.meta-leads.index')
                : item.id === 'meta-catalog'
                    ? route('app.catalog.index')
                : null;

    const visibleFields = item.fields.filter((field) => {
        if (!field.visible_when) return true;

        return Object.entries(field.visible_when).every(([key, value]) => form[key] === value);
    });

    const canManage = item.canManageCredentials !== false;
    const itemHealth = healthStatus(item.health);
    const isRoadmap = item.stage === 'roadmap';

    const footer = isRoadmap ? (
        <div className="flex justify-end gap-2">
            <Button type="button" variant="secondary" onClick={onClose}>
                Close
            </Button>
        </div>
    ) : item.systemManaged ? (
        <div className="flex justify-end gap-2">
            <Link href={route((item.route || 'app.whatsapp.connections.index') as any)}>
                <Button type="button" variant="secondary">
                    <Settings2 className="h-4 w-4" />
                    Open settings
                </Button>
            </Link>
        </div>
    ) : (
        <div className="flex flex-wrap justify-end gap-2">
            {item.connected && (
                <>
                    <Button type="button" variant="secondary" onClick={() => postAction('app.integrations.sync')} disabled={!!processing || !canManage}>
                        {processing === 'app.integrations.sync' ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
                        {['workspace-ai', 'razorpay-payments'].includes(item.id) ? 'Test connection' : 'Sync now'}
                    </Button>
                    <Button type="button" variant="danger" onClick={() => postAction('app.integrations.disconnect', 'delete')} disabled={!!processing || !canManage}>
                        <Unplug className="h-4 w-4" />
                        Disconnect
                    </Button>
                    </>
                )}
                {!item.connected && item.oauth && (
                    <Button type="button" variant="secondary" onClick={() => postAction('app.integrations.oauth')} disabled={!!processing}>
                        {processing === 'app.integrations.oauth' ? <Loader2 className="h-4 w-4 animate-spin" /> : <Link2 className="h-4 w-4" />}
                        Connect {item.oauth === 'facebook' ? 'Facebook' : 'Google'}
                    </Button>
                )}
            <Button
                type="button"
                onClick={() => postAction('app.integrations.update', 'patch')}
                disabled={!!processing || !canManage}
            >
                {processing ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
                    {item.connected ? 'Save settings' : item.oauth ? 'Save IDs' : 'Connect'}
                </Button>
        </div>
    );

    return (
        <Drawer open={open} onClose={onClose} title={item.name} description={item.desc} className="sm:max-w-xl" footer={footer}>
            <div className="space-y-5">
                <div className="flex items-center gap-3">
                    <ProviderLogo id={item.id} name={item.name} className="h-12 w-12" />
                    <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                            <StatusBadge tone={stageTone(item.stage)}>{stageLabel(item.stage)}</StatusBadge>
                            {!isRoadmap && <StatusBadge tone={item.connected ? 'success' : 'muted'} dot>{item.connected ? 'Connected' : 'Not connected'}</StatusBadge>}
                            {item.popular && <StatusBadge tone="warning">Popular</StatusBadge>}
                            {itemHealth && <StatusBadge tone={itemHealth === 'healthy' ? 'success' : 'warning'}>{itemHealth}</StatusBadge>}
                        </div>
                        {item.lastSync && <p className="mt-1 text-xs text-waify-text-muted dark:text-waify-dark-text-muted">Last sync {item.lastSync}</p>}
                    </div>
                </div>

                {item.systemManaged && (
                    <Alert variant="info" title="Managed in Zyptos">
                        This integration is already implemented elsewhere in Zyptos. Use its dedicated settings page instead of creating a duplicate connection here.
                    </Alert>
                )}

                {item.stage === 'beta' && (
                    <Alert variant="info" title="Beta capability">
                        This capability is usable, but some advanced workflow or analytics depth is still being expanded.
                    </Alert>
                )}

                {isRoadmap && (
                    <Alert variant="info" title="Planned capability">
                        This is shown as a market gap Zyptos plans to address. It is not available for workspace configuration yet.
                    </Alert>
                )}

                {item.lastError && <Alert variant="error" title="Last error">{item.lastError}</Alert>}
                {!canManage && (
                    <Alert variant="info" title="Restricted credentials">
                        Only workspace owners and admins can change, test, or disconnect integrations with credentials.
                    </Alert>
                )}

                {item.id === 'meta-leads' && (
                    <Alert variant="info" title="Facebook Login">
                        Meta Lead Ads webhooks are handled by the Zyptos provider app. Connect Facebook here, select the page/form, and Zyptos will route incoming leads to this workspace.
                    </Alert>
                )}

                {item.id === 'meta-catalog' && (
                    <Alert variant="info" title="Facebook Login">
                        Connect Facebook to list commerce catalogs from your Meta Business account, select the catalog, then sync products for WhatsApp product messages.
                    </Alert>
                )}

                {item.webhookUrl && (
                    <Alert variant="info" title="Provider webhook URL">
                        Use this URL in {item.name} for real-time sync events: <span className="font-mono">{item.webhookUrl}</span>
                    </Alert>
                )}

                {item.connected && (
                    <Card>
                        <CardContent className="grid grid-cols-3 gap-3 p-4 text-sm">
                            <div>
                                <p className="text-xs text-waify-text-muted dark:text-waify-dark-text-muted">Events 24h</p>
                                <p className="mt-1 font-semibold text-waify-text dark:text-waify-dark-text">{formatNumber(item.events24h)}</p>
                            </div>
                            <div>
                                <p className="text-xs text-waify-text-muted dark:text-waify-dark-text-muted">Status</p>
                                <p className="mt-1 font-semibold capitalize text-waify-text dark:text-waify-dark-text">{item.status}</p>
                            </div>
                            <div>
                                <p className="text-xs text-waify-text-muted dark:text-waify-dark-text-muted">Category</p>
                                <p className="mt-1 font-semibold capitalize text-waify-text dark:text-waify-dark-text">{item.category}</p>
                            </div>
                        </CardContent>
                    </Card>
                )}

                {item.connected && item.healthDetails && item.healthDetails.length > 0 && (
                    <Card>
                        <CardContent className="space-y-2 p-4 text-sm">
                            <h3 className="text-sm font-semibold text-waify-text dark:text-waify-dark-text">Health details</h3>
                            <div className="grid gap-2 sm:grid-cols-2">
                                {item.healthDetails.map((detail) => (
                                    <div key={`${detail.label}-${detail.value}`} className="rounded-btn bg-gray-50 px-3 py-2 dark:bg-waify-dark-surface-2">
                                        <p className="text-[11px] font-medium uppercase tracking-wide text-waify-text-muted dark:text-waify-dark-text-muted">{detail.label}</p>
                                        <p className="mt-1 break-words text-sm font-semibold text-waify-text dark:text-waify-dark-text">{detail.value || 'Not available'}</p>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                )}

                {!isRoadmap && visibleFields.length > 0 && (
                    <div className="space-y-4">
                        <h3 className="text-sm font-semibold text-waify-text dark:text-waify-dark-text">Configuration</h3>
                        {visibleFields.map((field) => (
                            <div key={field.name}>
                                {field.type === 'boolean' ? (
                                    <label className="flex items-center justify-between rounded-btn border border-gray-100 p-3 text-sm dark:border-waify-dark-border">
                                            <span>
                                                <span className="block font-medium text-waify-text dark:text-waify-dark-text">{field.label}</span>
                                            {field.description && (
                                                <span className="text-xs text-waify-text-muted dark:text-waify-dark-text-muted">{field.description}</span>
                                            )}
                                            </span>
                                        <input
                                            type="checkbox"
                                            checked={Boolean(form[field.name])}
                                            onChange={(event) => setForm((current) => ({ ...current, [field.name]: event.target.checked }))}
                                            className="h-4 w-4 rounded border-gray-300 text-waify-green focus:ring-waify-green"
                                        />
                                    </label>
                                ) : field.type === 'select' ? (
                                    <>
                                        <label className="mb-1.5 block text-sm font-medium text-waify-text dark:text-waify-dark-text">{field.label}</label>
                                        <select
                                            value={String(form[field.name] ?? 'import')}
                                            onChange={(event) => setForm((current) => ({ ...current, [field.name]: event.target.value }))}
                                            className="h-10 w-full rounded-btn border border-gray-200 bg-white px-3 text-sm text-waify-text outline-none focus:border-waify-green focus:ring-2 focus:ring-waify-green/20 dark:border-waify-dark-border dark:bg-waify-dark-surface dark:text-waify-dark-text"
                                        >
                                            {(field.options || [
                                                { value: 'import', label: 'Import into Zyptos' },
                                                { value: 'export', label: 'Export from Zyptos' },
                                                { value: 'bidirectional', label: 'Bi-directional' },
                                            ]).map((option) => (
                                                <option key={option.value} value={option.value}>{option.label}</option>
                                            ))}
                                        </select>
                                        {field.description && (
                                            <p className="mt-1 text-xs text-waify-text-muted dark:text-waify-dark-text-muted">{field.description}</p>
                                        )}
                                    </>
                                ) : field.type === 'textarea' ? (
                                    <>
                                        <label className="mb-1.5 block text-sm font-medium text-waify-text dark:text-waify-dark-text">{field.label}</label>
                                        <textarea
                                            value={String(form[field.name] ?? '')}
                                            onChange={(event) => setForm((current) => ({ ...current, [field.name]: event.target.value }))}
                                            rows={3}
                                            className="w-full rounded-btn border border-gray-200 bg-white px-3 py-2 text-sm text-waify-text outline-none focus:border-waify-green focus:ring-2 focus:ring-waify-green/20 dark:border-waify-dark-border dark:bg-waify-dark-surface dark:text-waify-dark-text"
                                        />
                                    </>
                                ) : (
                                    <>
                                        <label className="mb-1.5 block text-sm font-medium text-waify-text dark:text-waify-dark-text">{field.label}</label>
                                        <TextInput
                                            type={field.secret ? 'password' : field.type === 'number' ? 'number' : 'text'}
                                            value={String(form[field.name] ?? '')}
                                            onChange={(event) => setForm((current) => ({ ...current, [field.name]: event.target.value }))}
                                            placeholder={field.placeholder || field.label}
                                            className="w-full"
                                        />
                                    </>
                                )}
                            </div>
                        ))}
                    </div>
                )}

                    {(item.oauth === 'google' || item.oauth === 'facebook') && (
                        <div className="rounded-card border border-gray-100 bg-gray-50 p-4 dark:border-waify-dark-border dark:bg-waify-dark-surface-2">
                            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                                <div>
                                    <h3 className="text-sm font-semibold text-waify-text dark:text-waify-dark-text">
                                        {item.id === 'meta-catalog' ? 'Meta catalogs' : item.oauth === 'facebook' ? 'Facebook lead forms' : 'Google picker helper'}
                                    </h3>
                                    <p className="mt-1 text-xs text-waify-text-muted dark:text-waify-dark-text-muted">
                                        {item.id === 'meta-catalog'
                                            ? 'Connect Facebook, then load available commerce catalogs and pick one without copying IDs manually.'
                                            : item.oauth === 'facebook'
                                            ? 'Connect Facebook, then load available lead forms and pick one without copying IDs manually.'
                                            : `Connect Google, then load available ${item.id === 'google-sheets' ? 'spreadsheets' : 'calendars'} and pick one without copying IDs manually.`}
                                    </p>
                                </div>
                                <Button type="button" variant="secondary" onClick={loadGoogleResources} disabled={!!processing || !item.connected}>
                                    {processing === 'app.integrations.resources' ? <Loader2 className="h-4 w-4 animate-spin" /> : <Database className="h-4 w-4" />}
                                    {item.id === 'meta-catalog' ? 'Load catalogs' : item.oauth === 'facebook' ? 'Load forms' : 'Load'}
                                </Button>
                            </div>
                            {resourceError && <p className="mt-3 text-xs text-red-600 dark:text-red-300">{resourceError}</p>}
                            {resources.length > 0 && (
                                <div className="mt-3 max-h-64 space-y-2 overflow-y-auto pr-1 waify-scrollbar">
                                    {resources.map((resource) => (
                                        <div
                                            key={resource.id}
                                            className={cn(
                                                'rounded-btn border bg-white p-3 transition dark:bg-waify-dark-surface',
                                                isSelectedResource(resource)
                                                    ? 'border-waify-green ring-2 ring-waify-green/15 dark:border-emerald-400'
                                                    : 'border-gray-100 hover:border-waify-green/50 dark:border-waify-dark-border'
                                            )}
                                        >
                                            <div className="flex items-start justify-between gap-3">
                                                <button type="button" onClick={() => chooseResource(resource)} className="min-w-0 flex-1 text-left">
                                                    <span className="block truncate text-sm font-medium text-waify-text dark:text-waify-dark-text">{resource.name}</span>
                                                    <span className="mt-1 block truncate text-xs text-waify-text-muted dark:text-waify-dark-text-muted">{resource.id}{resource.meta ? ` · ${resource.meta}` : ''}</span>
                                                    {resource.defaultSheet && (
                                                        <span className="mt-1 inline-flex rounded-full bg-waify-green/10 px-2 py-0.5 text-[10px] font-semibold text-waify-green-dark dark:text-emerald-300">
                                                            Default tab: {resource.defaultSheet}
                                                        </span>
                                                    )}
                                                </button>
                                                {resource.url && (
                                                    <a
                                                        href={resource.url}
                                                        target="_blank"
                                                        rel="noreferrer"
                                                        onClick={(event) => event.stopPropagation()}
                                                        className="rounded-md p-1.5 text-waify-text-muted transition hover:bg-gray-100 hover:text-waify-text dark:text-waify-dark-text-muted dark:hover:bg-waify-dark-surface-2 dark:hover:text-waify-dark-text"
                                                        title="Open in provider"
                                                    >
                                                        <ExternalLink className="h-4 w-4" />
                                                    </a>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                            {manageHref && (
                                <div className="mt-3 flex justify-end">
                                    <Link href={manageHref}>
                                        <Button type="button" variant="secondary" size="sm">
                                            <ExternalLink className="h-4 w-4" />
                                            Open synced data
                                        </Button>
                                    </Link>
                                </div>
                            )}
                        </div>
                    )}

                {item.recentLogs && item.recentLogs.length > 0 && (
                    <div>
                        <h3 className="text-sm font-semibold text-waify-text dark:text-waify-dark-text">Recent activity</h3>
                        <div className="mt-2 space-y-2">
                            {item.recentLogs.map((log) => (
                                <div key={log.id} className="rounded-btn border border-gray-100 p-3 text-xs dark:border-waify-dark-border">
                                    <div className="flex items-center justify-between gap-3">
                                        <StatusBadge tone={log.status === 'success' ? 'success' : log.status === 'failed' ? 'danger' : 'warning'}>
                                            {log.status}
                                        </StatusBadge>
                                        <span className="text-waify-text-muted dark:text-waify-dark-text-muted">{log.started_at ? new Date(log.started_at).toLocaleString() : 'Queued'}</span>
                                    </div>
                                    <p className="mt-2 text-waify-text-muted dark:text-waify-dark-text-muted">
                                        {log.trigger} · {log.created_count} created · {log.updated_count} updated · {log.skipped_count} skipped
                                    </p>
                                    {log.summary && (
                                        <p className="mt-1 truncate text-waify-text-muted dark:text-waify-dark-text-muted">
                                            {Object.entries(log.summary).slice(0, 3).map(([key, value]) => `${key}: ${String(value)}`).join(' · ')}
                                        </p>
                                    )}
                                    {log.error_message && <p className="mt-1 text-red-600 dark:text-red-300">{log.error_message}</p>}
                                </div>
                            ))}
                        </div>
                    </div>
                )}

            </div>
        </Drawer>
    );
}

export default function Index({ integrations, summary, sync_logs }: Props) {
    const [category, setCategory] = useState('all');
    const [query, setQuery] = useState('');
    const [detail, setDetail] = useState<Integration | null>(null);

    const filtered = useMemo(() => integrations.filter((integration) => {
        const q = query.trim().toLowerCase();
        const matchesCategory = category === 'all'
            || (category === 'connected' ? integration.connected : integration.category === category);
        const matchesSearch = !q
            || integration.name.toLowerCase().includes(q)
            || integration.desc.toLowerCase().includes(q)
            || integration.features.some((feature) => feature.toLowerCase().includes(q));

        return matchesCategory && matchesSearch;
    }), [category, integrations, query]);

    const categories = useMemo(() => {
        const dynamic = Array.from(new Set(integrations.map((integration) => integration.category)))
            .map((id) => ({ id, label: id.replace(/-/g, ' ').replace(/\b\w/g, (char) => char.toUpperCase()) }));

        return [...baseCategories, ...dynamic];
    }, [integrations]);

    const quickConnect = (integration: Integration) => {
        if (integration.systemManaged) {
            router.visit(route((integration.route || 'app.whatsapp.connections.index') as any));
            return;
        }

        setDetail(integration);
    };

    const unhealthy = integrations.filter((integration) => integration.connected && !['healthy', 'configured', 'ok', 'connected'].includes(String(healthStatus(integration.health) || integration.status).toLowerCase()));
    const latestError = integrations.find((integration) => integration.lastError);

    return (
        <AppShell>
            <Head title="Integrations" />
            <div className="mx-auto max-w-[1400px] space-y-6">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                    <div>
                        <h1 className="text-2xl font-semibold text-waify-text dark:text-waify-dark-text md:text-3xl">Integrations</h1>
                        <p className="mt-2 text-sm text-waify-text-muted dark:text-waify-dark-text-muted">
                            Connect workspace-owned tools for payments, AI, commerce, webhooks, and external workflows.
                        </p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        <Link href={route('app.developer.index')}>
                            <Button type="button" variant="secondary">
                                <Code2 className="h-4 w-4" />
                                Developer hub
                            </Button>
                        </Link>
                    </div>
                </div>

                <Card>
                    <CardContent className="p-4">
                        <div className="flex flex-col gap-3 lg:flex-row">
                            <div className="relative flex-1">
                                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-waify-text-muted dark:text-waify-dark-text-muted" />
                                <TextInput
                                    value={query}
                                    onChange={(event) => setQuery(event.target.value)}
                                    placeholder="Search integrations..."
                                    className="w-full pl-9"
                                />
                            </div>
                            <div className="flex gap-1.5 overflow-x-auto waify-scrollbar">
                                {categories.map((item) => (
                                    <button
                                        key={item.id}
                                        type="button"
                                        onClick={() => setCategory(item.id)}
                                        className={cn(
                                            'h-10 whitespace-nowrap rounded-btn px-3 text-xs font-medium transition',
                                            category === item.id
                                                ? 'bg-waify-text text-white dark:bg-waify-dark-text dark:text-waify-dark-bg'
                                                : 'bg-gray-100 text-waify-text-muted hover:text-waify-text dark:bg-waify-dark-surface-2 dark:text-waify-dark-text-muted dark:hover:text-waify-dark-text'
                                        )}
                                    >
                                        {item.label}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                    {[
                        { label: 'Connected', value: summary.connected, note: `${integrations.length} available`, icon: Plug, tone: 'text-waify-green-dark bg-waify-green-soft dark:bg-waify-green/10 dark:text-waify-green' },
                        { label: 'Healthy', value: summary.healthy, note: unhealthy.length ? `${unhealthy.length} need attention` : 'No active issues', icon: CheckCircle2, tone: unhealthy.length ? 'text-amber-700 bg-amber-50 dark:bg-amber-500/10 dark:text-amber-200' : 'text-emerald-700 bg-emerald-50 dark:bg-emerald-500/10 dark:text-emerald-200' },
                        { label: 'Events today', value: summary.events_today, note: 'Across connected apps', icon: Database, tone: 'text-blue-700 bg-blue-50 dark:bg-blue-500/10 dark:text-blue-200' },
                        { label: 'Sync logs', value: sync_logs.length, note: latestError?.lastError ? 'Last error available' : 'Latest activity', icon: RefreshCw, tone: latestError ? 'text-red-700 bg-red-50 dark:bg-red-500/10 dark:text-red-200' : 'text-purple-700 bg-purple-50 dark:bg-purple-500/10 dark:text-purple-200' },
                    ].map((item) => (
                        <Card key={item.label}>
                            <CardContent className="flex items-center gap-3 p-4">
                                <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${item.tone}`}>
                                    <item.icon className="h-5 w-5" />
                                </div>
                                <div className="min-w-0">
                                    <p className="text-xs text-waify-text-muted dark:text-waify-dark-text-muted">{item.label}</p>
                                    <p className="text-xl font-bold text-waify-text dark:text-waify-dark-text">{formatNumber(item.value)}</p>
                                    <p className="truncate text-[11px] text-waify-text-muted dark:text-waify-dark-text-muted">{item.note}</p>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                {unhealthy.length > 0 && (
                    <Alert variant="warning" title="Integration health needs attention">
                        {unhealthy.slice(0, 3).map((integration) => integration.name).join(', ')} {unhealthy.length > 3 ? `and ${unhealthy.length - 3} more ` : ''}reported errors or incomplete health checks. Open a card to inspect credentials, logs, and last error.
                    </Alert>
                )}

                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                    {filtered.map((integration) => (
                        <Card
                            key={integration.id}
                            className="flex cursor-pointer flex-col transition hover:-translate-y-0.5 hover:shadow-card-lg"
                            onClick={() => setDetail(integration)}
                        >
                            <CardContent className="flex h-full flex-col p-5">
                                <div className="flex items-start justify-between gap-3">
                                    <div className="flex min-w-0 items-center gap-3">
                                        <ProviderLogo id={integration.id} name={integration.name} />
                                        <div className="min-w-0">
                                            <div className="truncate text-sm font-semibold text-waify-text dark:text-waify-dark-text">{integration.name}</div>
                                            <div className="mt-1 flex flex-wrap gap-1.5">
                                                <StatusBadge tone={stageTone(integration.stage)}>{stageLabel(integration.stage)}</StatusBadge>
                                                {integration.popular && <StatusBadge tone="warning">Popular</StatusBadge>}
                                                {integration.connected && <StatusBadge tone="success" dot>Connected</StatusBadge>}
                                            </div>
                                        </div>
                                    </div>
                                    <Button
                                        type="button"
                                        size="sm"
                                        variant={integration.connected || integration.stage === 'roadmap' ? 'secondary' : 'primary'}
                                        onClick={(event) => {
                                            event.stopPropagation();
                                            quickConnect(integration);
                                        }}
                                    >
                                        {integration.connected ? <Settings2 className="h-4 w-4" /> : integration.stage === 'roadmap' ? <ExternalLink className="h-4 w-4" /> : <Plug className="h-4 w-4" />}
                                        {integration.connected ? 'Manage' : integration.stage === 'roadmap' ? 'View plan' : 'Configure'}
                                    </Button>
                                </div>
                                <p className="mt-3 flex-1 text-xs leading-5 text-waify-text-muted dark:text-waify-dark-text-muted">{integration.desc}</p>
                                <div className="mt-4 flex flex-wrap gap-2">
                                    {integration.features.slice(0, 3).map((feature) => (
                                        <span key={feature} className="rounded-md bg-gray-50 px-2 py-1 text-[11px] font-medium text-waify-text-muted dark:bg-waify-dark-surface-2 dark:text-waify-dark-text-muted">
                                            {feature}
                                        </span>
                                    ))}
                                </div>
                                {integration.connected && (
                                    <div className="mt-4 flex justify-between border-t border-gray-100 pt-3 text-[11px] text-waify-text-muted dark:border-waify-dark-border dark:text-waify-dark-text-muted">
                                        <span>Sync {integration.lastSync || 'not run'}</span>
                                        <span className="capitalize">{healthStatus(integration.health) || integration.status}</span>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    ))}
                </div>

                <IntegrationDrawer item={detail} open={!!detail} onClose={() => setDetail(null)} />
            </div>
        </AppShell>
    );
}
