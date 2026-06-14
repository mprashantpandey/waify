import { ReactNode, useMemo, useState } from 'react';
import { Head, useForm } from '@inertiajs/react';
import { CheckCircle2, PhoneCall, RefreshCw, Save, XCircle } from 'lucide-react';
import AppShell from '@/Layouts/AppShell';
import Button from '@/Components/UI/Button';
import { Alert } from '@/Components/UI/Alert';
import { Badge } from '@/Components/UI/Badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/Components/UI/Card';
import { Input } from '@/Components/UI/Input';
import { Label } from '@/Components/UI/Label';
import { Switch } from '@/Components/UI/Switch';

interface VoiceSettings {
    enabled: boolean;
    inbound_enabled: boolean;
    outbound_enabled: boolean;
    record_calls: boolean;
    human_handoff_enabled: boolean;
    business_hours_only: boolean;
    outbound_requires_consent: boolean;
    whatsapp_connection_id: number | null;
    whatsapp_call_button_enabled: boolean;
    calling_eligibility_status: 'unknown' | 'eligible' | 'not_eligible';
    routing_mode: 'ai_first' | 'human_first' | 'ai_only' | 'human_only';
    phone_number_id: string;
    business_phone: string;
    transfer_number: string;
    default_agent_id: number | null;
    voice_name: string;
    language: string;
    greeting: string;
    fallback_message: string;
    max_call_minutes: number;
    silence_timeout_seconds: number;
}

interface VoiceAgent {
    id: number;
    name: string;
    role: string;
    language: string;
    tone: string;
    mode: string;
}

interface WhatsAppConnection {
    id: number;
    name: string;
    slug: string;
    waba_id?: string | null;
    phone_number_id?: string | null;
    business_phone?: string | null;
    meta_verified_name?: string | null;
    phone_number_status?: string | null;
    webhook_subscribed: boolean;
    calling_status?: string | null;
    calling_enabled?: boolean;
    calling_webhook_subscribed?: boolean;
    calling_last_checked_at?: string | null;
    calling_last_error?: string | null;
    is_active: boolean;
}

interface VoiceCall {
    id: number;
    direction: string;
    phone_number?: string | null;
    contact_name?: string | null;
    status: string;
    route_mode?: string | null;
    routed_to?: string | null;
    duration_seconds: number;
    summary?: string | null;
    transcript?: string | null;
    metadata?: Record<string, any> | null;
    agent?: { id: number; name: string } | null;
    created_at?: string | null;
}

interface DiagnosticCheck {
    key: string;
    label: string;
    ok: boolean;
    message: string;
}

interface Diagnostics {
    eligible: boolean;
    label: string;
    checks: DiagnosticCheck[];
}

interface Props {
    settings: VoiceSettings;
    agents: VoiceAgent[];
    connections: WhatsAppConnection[];
    diagnostics: Diagnostics;
    calls: VoiceCall[];
    canManage: boolean;
    webhookUrl: string;
}

type BadgeVariant = 'default' | 'success' | 'warning' | 'danger' | 'info' | 'secondary' | 'outline';

const statusVariant = (status?: string | null): BadgeVariant => {
    if (['completed', 'answered', 'granted', 'eligible', 'enabled'].includes(status || '')) return 'success';
    if (['failed', 'missed', 'rejected', 'revoked', 'not_eligible'].includes(status || '')) return 'danger';
    if (['ringing', 'in_progress', 'queued', 'received', 'expired', 'not_enabled'].includes(status || '')) return 'warning';

    return 'secondary';
};

const formatDate = (value?: string | null) => {
    if (!value) return 'Not checked';

    return new Intl.DateTimeFormat(undefined, {
        dateStyle: 'medium',
        timeStyle: 'short',
    }).format(new Date(value));
};

const formatDuration = (seconds: number) => {
    if (!seconds) return '0 sec';

    const minutes = Math.floor(seconds / 60);
    const remaining = seconds % 60;

    return minutes > 0 ? `${minutes}m ${remaining}s` : `${remaining}s`;
};

function FieldSelect({
    id,
    value,
    disabled,
    children,
    onChange,
}: {
    id: string;
    value: string | number;
    disabled?: boolean;
    children: ReactNode;
    onChange: (value: string) => void;
}) {
    return (
        <select
            id={id}
            value={value}
            disabled={disabled}
            onChange={(event) => onChange(event.target.value)}
            className="mt-1 h-10 w-full rounded-btn border border-gray-200 bg-white px-3 text-sm text-waify-text shadow-sm focus:border-waify-green focus:outline-none focus:ring-2 focus:ring-waify-green/20 disabled:opacity-60 dark:border-waify-dark-border dark:bg-waify-dark-surface dark:text-waify-dark-text"
        >
            {children}
        </select>
    );
}

export default function WhatsAppCallingIndex({
    settings,
    agents = [],
    connections = [],
    diagnostics,
    calls = [],
    canManage,
    webhookUrl,
}: Props) {
    const form = useForm<VoiceSettings>({
        ...settings,
        whatsapp_connection_id: settings.whatsapp_connection_id ? Number(settings.whatsapp_connection_id) : (connections[0]?.id ?? null),
        default_agent_id: settings.default_agent_id ? Number(settings.default_agent_id) : null,
        phone_number_id: settings.phone_number_id || connections[0]?.phone_number_id || '',
        business_phone: settings.business_phone || connections[0]?.business_phone || '',
        outbound_enabled: Boolean(settings.outbound_enabled ?? true),
        outbound_requires_consent: false,
        record_calls: Boolean(settings.record_calls),
        business_hours_only: Boolean(settings.business_hours_only),
        whatsapp_call_button_enabled: Boolean(settings.whatsapp_call_button_enabled),
        max_call_minutes: Number(settings.max_call_minutes || 10),
        silence_timeout_seconds: Number(settings.silence_timeout_seconds || 20),
    });
    const actionForm = useForm({});
    const selectedConnection = connections.find((connection) => connection.id === form.data.whatsapp_connection_id) || connections[0];
    const [callSearch, setCallSearch] = useState('');
    const [callStatusFilter, setCallStatusFilter] = useState('all');
    const [callDirectionFilter, setCallDirectionFilter] = useState('all');
    const [callPage, setCallPage] = useState(1);
    const callPageSize = 10;

    const runConnectionAction = (action: 'check' | 'enable' | 'subscribe-calls') => {
        if (!selectedConnection) return;

        actionForm.post(route(`app.whatsapp-calls.connections.${action}`, selectedConnection.slug), {
            preserveScroll: true,
        });
    };

    const saveSettings = () => {
        form.post(route('app.whatsapp-calls.settings'), {
            preserveScroll: true,
        });
    };

    const connectionStatus = selectedConnection?.calling_enabled
        ? 'enabled'
        : selectedConnection?.calling_status || form.data.calling_eligibility_status || 'unknown';
    const metaCallingReady = Boolean(selectedConnection?.calling_enabled || form.data.calling_eligibility_status === 'eligible');
    const webhookReady = Boolean(selectedConnection?.calling_webhook_subscribed);
    const routingReady = Boolean(diagnostics?.eligible);
    const callStatuses = useMemo(() => Array.from(new Set(calls.map((call) => call.status).filter(Boolean))).sort(), [calls]);
    const callDirections = useMemo(() => Array.from(new Set(calls.map((call) => call.direction).filter(Boolean))).sort(), [calls]);
    const filteredCalls = useMemo(() => {
        const query = callSearch.trim().toLowerCase();

        return calls.filter((call) => {
            const matchesSearch = !query || [
                call.contact_name,
                call.phone_number,
                call.status,
                call.direction,
                call.route_mode,
                call.routed_to,
                call.agent?.name,
            ].some((value) => String(value || '').toLowerCase().includes(query));
            const matchesStatus = callStatusFilter === 'all' || call.status === callStatusFilter;
            const matchesDirection = callDirectionFilter === 'all' || call.direction === callDirectionFilter;

            return matchesSearch && matchesStatus && matchesDirection;
        });
    }, [calls, callDirectionFilter, callSearch, callStatusFilter]);
    const totalCallPages = Math.max(1, Math.ceil(filteredCalls.length / callPageSize));
    const currentCallPage = Math.min(callPage, totalCallPages);
    const paginatedCalls = filteredCalls.slice((currentCallPage - 1) * callPageSize, currentCallPage * callPageSize);
    const resetCallPage = () => setCallPage(1);

    return (
        <AppShell>
            <Head title="WhatsApp Calling" />

            <div className="space-y-6">
                <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-semibold text-waify-text dark:text-waify-dark-text">WhatsApp Calling</h1>
                        <p className="mt-1 text-sm text-waify-text-muted dark:text-waify-dark-text-muted">
                            Enable calling on a connected WABA number and route inbound calls to an AI agent or human team.
                        </p>
                    </div>
                    <Badge variant={diagnostics?.eligible ? 'success' : 'warning'}>{diagnostics?.label || 'Not ready'}</Badge>
                </div>

                {!canManage && (
                    <Alert variant="warning" title="Read-only access">
                        Only workspace owners and admins can change WhatsApp calling settings.
                    </Alert>
                )}

                <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
                    <div className="space-y-6">
                        <Card>
                            <CardHeader>
                                <div className="flex flex-wrap items-start justify-between gap-3">
                                    <div>
                                        <CardTitle>Connected Number</CardTitle>
                                        <CardDescription>WhatsApp Calling uses the WABA number connected to this workspace.</CardDescription>
                                    </div>
                                    <Badge variant={statusVariant(connectionStatus)}>{connectionStatus.replaceAll('_', ' ')}</Badge>
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-5">
                                {selectedConnection ? (
                                    <div className="space-y-4 rounded-card border border-gray-100 bg-gray-50 p-4 text-sm dark:border-waify-dark-border dark:bg-waify-dark-surface-2">
                                        <div className="flex flex-wrap items-center justify-between gap-3">
                                            <div>
                                                <p className="font-medium text-waify-text dark:text-waify-dark-text">
                                                    {selectedConnection.meta_verified_name || selectedConnection.name}
                                                </p>
                                                <p className="mt-1 text-xs text-waify-text-muted dark:text-waify-dark-text-muted">
                                                    {selectedConnection.business_phone || 'Business phone not synced'}
                                                </p>
                                            </div>
                                            <div className="flex flex-wrap gap-2">
                                                <Badge variant={metaCallingReady ? 'success' : 'warning'}>
                                                    {metaCallingReady ? 'Meta enabled' : 'Meta pending'}
                                                </Badge>
                                                <Badge variant={webhookReady ? 'success' : 'warning'}>
                                                    {webhookReady ? 'Webhook ready' : 'Webhook pending'}
                                                </Badge>
                                                <Badge variant={routingReady ? 'success' : 'warning'}>
                                                    {routingReady ? 'Routing ready' : 'Routing setup needed'}
                                                </Badge>
                                            </div>
                                        </div>

                                        {selectedConnection.calling_last_error && (
                                            <Alert variant="error" title="Meta check failed">
                                                {selectedConnection.calling_last_error}
                                            </Alert>
                                        )}

                                        {canManage && (
                                            <div className="flex flex-wrap gap-2">
                                                <Button type="button" variant="secondary" size="sm" disabled={actionForm.processing} onClick={() => runConnectionAction('check')}>
                                                    <RefreshCw className="h-4 w-4" />
                                                    Refresh status
                                                </Button>
                                                {!webhookReady && (
                                                    <Button type="button" variant="secondary" size="sm" disabled={actionForm.processing} onClick={() => runConnectionAction('subscribe-calls')}>
                                                        Fix webhook
                                                    </Button>
                                                )}
                                                {!metaCallingReady && (
                                                    <Button type="button" variant="success" size="sm" disabled={actionForm.processing} onClick={() => runConnectionAction('enable')}>
                                                        Enable calling
                                                    </Button>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                ) : (
                                    <div className="rounded-card border border-dashed border-gray-200 p-5 text-sm text-waify-text-muted dark:border-waify-dark-border dark:text-waify-dark-text-muted">
                                        Connect a WhatsApp Business number first, then select it here.
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Call Routing</CardTitle>
                                <CardDescription>Choose who answers inbound calls and whether agents can place outbound calls.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-5">
                                <div className="flex items-center justify-between gap-4 rounded-card border border-gray-100 p-4 dark:border-waify-dark-border">
                                    <div>
                                        <p className="text-sm font-medium text-waify-text dark:text-waify-dark-text">Use WhatsApp Calling</p>
                                        <p className="mt-1 text-xs text-waify-text-muted dark:text-waify-dark-text-muted">Turn on routing for inbound WhatsApp calls.</p>
                                    </div>
                                    <Switch checked={form.data.enabled} disabled={!canManage} onCheckedChange={(checked) => form.setData('enabled', checked)} />
                                </div>
                                <div className="flex items-center justify-between gap-4 rounded-card border border-gray-100 p-4 dark:border-waify-dark-border">
                                    <div>
                                        <p className="text-sm font-medium text-waify-text dark:text-waify-dark-text">Allow outbound WhatsApp calls</p>
                                        <p className="mt-1 text-xs text-waify-text-muted dark:text-waify-dark-text-muted">Show call controls in inbox when Meta calling is ready.</p>
                                    </div>
                                    <Switch checked={form.data.outbound_enabled} disabled={!canManage} onCheckedChange={(checked) => form.setData('outbound_enabled', checked)} />
                                </div>

                                <div className="grid gap-4 md:grid-cols-2">
                                    <div>
                                        <Label htmlFor="routing_mode">Route inbound calls</Label>
                                        <FieldSelect
                                            id="routing_mode"
                                            value={form.data.routing_mode}
                                            disabled={!canManage}
                                            onChange={(value) => form.setData('routing_mode', value as VoiceSettings['routing_mode'])}
                                        >
                                            <option value="ai_first">AI first, human fallback</option>
                                            <option value="human_first">Human first, AI fallback</option>
                                            <option value="ai_only">AI only</option>
                                            <option value="human_only">Human only</option>
                                        </FieldSelect>
                                    </div>
                                    <div>
                                        <Label htmlFor="agent">AI agent</Label>
                                        <FieldSelect
                                            id="agent"
                                            value={form.data.default_agent_id ?? ''}
                                            disabled={!canManage}
                                            onChange={(value) => form.setData('default_agent_id', value ? Number(value) : null)}
                                        >
                                            <option value="">No agent selected</option>
                                            {agents.map((agent) => (
                                                <option key={agent.id} value={agent.id}>
                                                    {agent.name}
                                                </option>
                                            ))}
                                        </FieldSelect>
                                    </div>
                                    <div>
                                        <Label htmlFor="transfer_number">Human handoff number</Label>
                                        <Input
                                            id="transfer_number"
                                            value={form.data.transfer_number || ''}
                                            disabled={!canManage}
                                            onChange={(event) => form.setData('transfer_number', event.target.value)}
                                            placeholder="+91..."
                                            className="mt-1"
                                        />
                                    </div>
                                </div>

                                {canManage && (
                                    <div className="flex justify-end">
                                        <Button type="button" onClick={saveSettings} disabled={form.processing}>
                                            <Save className="h-4 w-4" />
                                            Save settings
                                        </Button>
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Call History</CardTitle>
                                <CardDescription>Latest WhatsApp call webhook events recorded in Zyptos.</CardDescription>
                            </CardHeader>
                            <CardContent>
                                {calls.length === 0 ? (
                                    <div className="rounded-card border border-dashed border-gray-200 p-6 text-center dark:border-waify-dark-border">
                                        <PhoneCall className="mx-auto h-8 w-8 text-waify-text-muted dark:text-waify-dark-text-muted" />
                                        <p className="mt-3 text-sm font-medium text-waify-text dark:text-waify-dark-text">No calls received yet</p>
                                        <p className="mt-1 text-xs text-waify-text-muted dark:text-waify-dark-text-muted">
                                            Call events will appear after Meta sends WhatsApp calling webhooks.
                                        </p>
                                    </div>
                                ) : (
                                    <div className="overflow-hidden rounded-card border border-gray-100 dark:border-waify-dark-border">
                                        <div className="grid gap-3 border-b border-gray-100 bg-gray-50 p-3 dark:border-waify-dark-border dark:bg-waify-dark-surface-2 md:grid-cols-[minmax(0,1fr)_160px_160px]">
                                            <Input
                                                value={callSearch}
                                                onChange={(event) => {
                                                    setCallSearch(event.target.value);
                                                    resetCallPage();
                                                }}
                                                placeholder="Search contact, number, route..."
                                                className="h-9 bg-white dark:bg-waify-dark-surface"
                                            />
                                            <select
                                                value={callStatusFilter}
                                                onChange={(event) => {
                                                    setCallStatusFilter(event.target.value);
                                                    resetCallPage();
                                                }}
                                                className="h-9 rounded-btn border border-gray-200 bg-white px-3 text-sm text-waify-text dark:border-waify-dark-border dark:bg-waify-dark-surface dark:text-waify-dark-text"
                                            >
                                                <option value="all">All statuses</option>
                                                {callStatuses.map((status) => <option key={status} value={status}>{status.replaceAll('_', ' ')}</option>)}
                                            </select>
                                            <select
                                                value={callDirectionFilter}
                                                onChange={(event) => {
                                                    setCallDirectionFilter(event.target.value);
                                                    resetCallPage();
                                                }}
                                                className="h-9 rounded-btn border border-gray-200 bg-white px-3 text-sm text-waify-text dark:border-waify-dark-border dark:bg-waify-dark-surface dark:text-waify-dark-text"
                                            >
                                                <option value="all">All directions</option>
                                                {callDirections.map((direction) => <option key={direction} value={direction}>{direction}</option>)}
                                            </select>
                                        </div>
                                        <div className="max-h-[420px] overflow-auto">
                                            <table className="min-w-full table-fixed text-left">
                                                <thead className="sticky top-0 z-10 border-b border-gray-100 bg-gray-50 text-xs font-medium uppercase text-waify-text-muted dark:border-waify-dark-border dark:bg-waify-dark-surface-2 dark:text-waify-dark-text-muted">
                                                    <tr>
                                                        <th className="w-[30%] px-4 py-2">Contact</th>
                                                        <th className="w-[18%] px-4 py-2">Direction</th>
                                                        <th className="w-[22%] px-4 py-2">Route</th>
                                                        <th className="w-[18%] px-4 py-2">Status</th>
                                                        <th className="w-[12%] px-4 py-2 text-right">Time</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-gray-100 dark:divide-waify-dark-border">
                                                    {paginatedCalls.length === 0 && (
                                                        <tr>
                                                            <td colSpan={5} className="px-4 py-8 text-center text-sm text-waify-text-muted dark:text-waify-dark-text-muted">
                                                                No calls match the selected filters.
                                                            </td>
                                                        </tr>
                                                    )}
                                                    {paginatedCalls.map((call) => (
                                                        <tr key={call.id} className="align-top">
                                                            <td className="px-4 py-3">
                                                                <p className="truncate text-sm font-medium text-waify-text dark:text-waify-dark-text">{call.contact_name || call.phone_number || 'Unknown caller'}</p>
                                                                <p className="mt-0.5 truncate text-xs text-waify-text-muted dark:text-waify-dark-text-muted">{call.created_at ? formatDate(call.created_at) : '-'}</p>
                                                            </td>
                                                            <td className="px-4 py-3 text-sm capitalize text-waify-text-muted dark:text-waify-dark-text-muted">{call.direction || '-'}</td>
                                                            <td className="px-4 py-3">
                                                                <p className="truncate text-sm text-waify-text-muted dark:text-waify-dark-text-muted" title={call.agent?.name || call.routed_to || call.route_mode || 'Not routed'}>
                                                                    {call.agent?.name || call.routed_to || call.route_mode || 'Not routed'}
                                                                </p>
                                                            </td>
                                                            <td className="px-4 py-3">
                                                                <div className="flex flex-wrap gap-1">
                                                                    <Badge variant={statusVariant(call.status)}>{call.status}</Badge>
                                                                    {call.route_mode?.includes('ai') && call.status === 'completed' && !call.transcript && (
                                                                        <Badge variant="warning">No transcript</Badge>
                                                                    )}
                                                                </div>
                                                                {call.summary && <p className="mt-1 line-clamp-2 text-xs text-waify-text-muted dark:text-waify-dark-text-muted">{call.summary}</p>}
                                                            </td>
                                                            <td className="px-4 py-3 text-right text-sm text-waify-text-muted dark:text-waify-dark-text-muted">{formatDuration(call.duration_seconds || 0)}</td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-gray-100 bg-gray-50 px-4 py-2 text-xs text-waify-text-muted dark:border-waify-dark-border dark:bg-waify-dark-surface-2 dark:text-waify-dark-text-muted">
                                            <span>
                                                Showing {filteredCalls.length === 0 ? 0 : ((currentCallPage - 1) * callPageSize) + 1}-{Math.min(currentCallPage * callPageSize, filteredCalls.length)} of {filteredCalls.length} call{filteredCalls.length === 1 ? '' : 's'}.
                                            </span>
                                            <div className="flex items-center gap-1">
                                                <Button type="button" size="sm" variant="secondary" disabled={currentCallPage <= 1} onClick={() => setCallPage((page) => Math.max(1, page - 1))}>
                                                    Prev
                                                </Button>
                                                <span className="px-2 font-medium text-waify-text dark:text-waify-dark-text">{currentCallPage} / {totalCallPages}</span>
                                                <Button type="button" size="sm" variant="secondary" disabled={currentCallPage >= totalCallPages} onClick={() => setCallPage((page) => Math.min(totalCallPages, page + 1))}>
                                                    Next
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>

                    <div className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Readiness</CardTitle>
                                <CardDescription>Only the checks that affect real calls.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                {(diagnostics?.checks || [])
                                    .filter((check) => ['module_enabled', 'connection', 'webhook', 'meta_calling', 'routing'].includes(check.key))
                                    .map((check) => (
                                    <div key={check.key} className="flex items-start gap-3 rounded-card border border-gray-100 p-3 dark:border-waify-dark-border">
                                        {check.ok ? (
                                            <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-waify-green" />
                                        ) : (
                                            <XCircle className="mt-0.5 h-4 w-4 shrink-0 text-red-500" />
                                        )}
                                        <div className="min-w-0">
                                            <p className="text-sm font-medium text-waify-text dark:text-waify-dark-text">{check.label}</p>
                                            <p className="mt-1 text-xs text-waify-text-muted dark:text-waify-dark-text-muted">{check.message}</p>
                                        </div>
                                    </div>
                                ))}
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </AppShell>
    );
}
