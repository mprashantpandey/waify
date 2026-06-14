import { Head, router, useForm } from '@inertiajs/react';
import { useState } from 'react';
import { GitBranch, RefreshCw, Rocket, Archive, Plus, AlertTriangle } from 'lucide-react';
import AppShell from '@/Layouts/AppShell';
import Button from '@/Components/UI/Button';
import { Card, CardContent } from '@/Components/UI/Card';
import { Badge } from '@/Components/UI/Badge';
import { EmptyState } from '@/Components/UI/EmptyState';
import TextInput from '@/Components/TextInput';
import { Drawer } from '@/Components/UI/Elements';
import { useToast } from '@/hooks/useToast';

interface FlowRecord {
    id: number;
    meta_flow_id?: string | null;
    name: string;
    status: string;
    category?: string | null;
    data_channel_uri?: string | null;
    validation_errors?: any[];
    last_synced_at?: string | null;
    last_meta_error?: string | null;
    connection?: { id: number; name: string; slug?: string | null } | null;
}

interface ConnectionOption {
    id: number;
    name: string;
    slug?: string | null;
    waba_id?: string | null;
}

function statusVariant(status: string) {
    const normalized = status.toLowerCase();
    if (['published', 'approved'].includes(normalized)) return 'success';
    if (['draft'].includes(normalized)) return 'warning';
    if (['deprecated', 'blocked', 'rejected'].includes(normalized)) return 'danger';
    return 'secondary';
}

export default function WhatsAppFlowsIndex({
    flows = [],
    connections = [],
}: {
    flows: FlowRecord[];
    connections: ConnectionOption[];
}) {
    const { toast } = useToast();
    const [drawerOpen, setDrawerOpen] = useState(false);
    const form = useForm({
        whatsapp_connection_id: connections[0]?.id ?? '',
        name: '',
        category: 'OTHER',
        data_channel_uri: '',
        flow_json: '',
    });

    const openCreate = () => {
        form.reset();
        form.setData({
            whatsapp_connection_id: connections[0]?.id ?? '',
            name: '',
            category: 'OTHER',
            data_channel_uri: '',
            flow_json: '',
        });
        setDrawerOpen(true);
    };

    const submit = () => {
        form.post(route('app.whatsapp.flows.store'), {
            preserveScroll: true,
            onSuccess: () => {
                toast.success('Flow created');
                setDrawerOpen(false);
            },
            onError: () => toast.error('Flow could not be created'),
        });
    };

    const syncFlows = () => {
        router.post(route('app.whatsapp.flows.sync'), {}, {
            preserveScroll: true,
            onSuccess: () => toast.success('Flows synced from Meta'),
        });
    };

    const action = (flow: FlowRecord, type: 'publish' | 'deprecate') => {
        router.post(route(`app.whatsapp.flows.${type}`, { flow: flow.id }), {}, {
            preserveScroll: true,
            onSuccess: () => toast.success(type === 'publish' ? 'Flow published' : 'Flow deprecated'),
            onError: () => toast.error(`Flow ${type} failed`),
        });
    };

    return (
        <AppShell>
            <Head title="WhatsApp Flows" />
            <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-6 sm:px-6 lg:px-8">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-2xl font-semibold text-waify-text dark:text-waify-dark-text">WhatsApp Flows</h1>
                        <p className="mt-1 text-sm text-waify-text-muted dark:text-waify-dark-text-muted">
                            Manage official Meta Flow lifecycle records, sync validation status, and publish structured WhatsApp forms.
                        </p>
                    </div>
                    <div className="flex gap-2">
                        <Button type="button" variant="secondary" onClick={syncFlows}>
                            <RefreshCw className="h-4 w-4" />
                            Sync Meta
                        </Button>
                        <Button type="button" onClick={openCreate}>
                            <Plus className="h-4 w-4" />
                            New Flow
                        </Button>
                    </div>
                </div>

                {flows.length === 0 ? (
                    <Card>
                        <CardContent className="py-10">
                            <EmptyState icon={GitBranch} title="No WhatsApp Flows yet" description="Sync from Meta or create a structured form for lead capture, quotes, onboarding, or purchase intent." />
                        </CardContent>
                    </Card>
                ) : (
                    <div className="grid gap-4">
                        {flows.map((flow) => (
                            <Card key={flow.id}>
                                <CardContent className="p-4">
                                    <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                                        <div className="min-w-0">
                                            <div className="flex flex-wrap items-center gap-2">
                                                <h2 className="truncate text-base font-semibold text-waify-text dark:text-waify-dark-text">{flow.name}</h2>
                                                <Badge variant={statusVariant(flow.status) as any}>{flow.status}</Badge>
                                                {flow.category && <Badge variant="secondary">{flow.category}</Badge>}
                                            </div>
                                            <div className="mt-2 grid gap-1 text-xs text-waify-text-muted dark:text-waify-dark-text-muted">
                                                <span>Connection: {flow.connection?.name || 'Unknown'}</span>
                                                <span>Meta Flow ID: {flow.meta_flow_id || 'Local draft'}</span>
                                                <span>Data endpoint: {flow.data_channel_uri || 'Not configured'}</span>
                                                <span>Last sync: {flow.last_synced_at ? new Date(flow.last_synced_at).toLocaleString() : 'Never'}</span>
                                            </div>
                                            {flow.last_meta_error && (
                                                <div className="mt-3 flex gap-2 rounded-md border border-red-100 bg-red-50 p-2 text-xs text-red-700 dark:border-red-500/20 dark:bg-red-500/10 dark:text-red-200">
                                                    <AlertTriangle className="h-4 w-4 flex-shrink-0" />
                                                    <span>{flow.last_meta_error}</span>
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex flex-wrap gap-2">
                                            <Button type="button" size="sm" variant="secondary" onClick={() => action(flow, 'publish')} disabled={!flow.meta_flow_id || flow.status === 'published'}>
                                                <Rocket className="h-4 w-4" />
                                                Publish
                                            </Button>
                                            <Button type="button" size="sm" variant="ghost" onClick={() => action(flow, 'deprecate')} disabled={!flow.meta_flow_id || flow.status === 'deprecated'}>
                                                <Archive className="h-4 w-4" />
                                                Deprecate
                                            </Button>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}
            </div>

            <Drawer
                open={drawerOpen}
                onClose={() => setDrawerOpen(false)}
                title="Create Meta Flow"
                description="Create the Flow shell in Meta, optionally upload Flow JSON, then publish when validation passes."
                footer={(
                    <div className="flex justify-end gap-2">
                        <Button type="button" variant="secondary" onClick={() => setDrawerOpen(false)}>Cancel</Button>
                        <Button type="button" onClick={submit} disabled={form.processing || !form.data.name || !form.data.whatsapp_connection_id}>
                            {form.processing ? 'Creating...' : 'Create Flow'}
                        </Button>
                    </div>
                )}
            >
                <div className="space-y-4">
                    <label className="block space-y-1.5">
                        <span className="text-xs font-semibold text-waify-text dark:text-waify-dark-text">Connection</span>
                        <select
                            value={form.data.whatsapp_connection_id}
                            onChange={(event) => form.setData('whatsapp_connection_id', Number(event.target.value))}
                            className="h-10 w-full rounded-btn border border-waify-border bg-white px-3 text-sm dark:border-waify-dark-border dark:bg-slate-800"
                        >
                            {connections.map((connection) => (
                                <option key={connection.id} value={connection.id}>{connection.name}</option>
                            ))}
                        </select>
                    </label>
                    <label className="block space-y-1.5">
                        <span className="text-xs font-semibold text-waify-text dark:text-waify-dark-text">Name</span>
                        <TextInput value={form.data.name} onChange={(event) => form.setData('name', event.target.value)} className="w-full" />
                    </label>
                    <label className="block space-y-1.5">
                        <span className="text-xs font-semibold text-waify-text dark:text-waify-dark-text">Category</span>
                        <TextInput value={form.data.category} onChange={(event) => form.setData('category', event.target.value)} className="w-full" />
                    </label>
                    <label className="block space-y-1.5">
                        <span className="text-xs font-semibold text-waify-text dark:text-waify-dark-text">Data endpoint URL</span>
                        <TextInput value={form.data.data_channel_uri} onChange={(event) => form.setData('data_channel_uri', event.target.value)} className="w-full" placeholder="https://example.com/whatsapp/flow-data" />
                    </label>
                    <label className="block space-y-1.5">
                        <span className="text-xs font-semibold text-waify-text dark:text-waify-dark-text">Flow JSON</span>
                        <textarea
                            value={form.data.flow_json}
                            onChange={(event) => form.setData('flow_json', event.target.value)}
                            rows={10}
                            className="w-full resize-y rounded-btn border border-waify-border bg-white px-3 py-2 font-mono text-xs dark:border-waify-dark-border dark:bg-slate-800"
                            placeholder='{"version":"7.1","screens":[]}'
                        />
                    </label>
                </div>
            </Drawer>
        </AppShell>
    );
}
