import { Head, Link } from '@inertiajs/react';
import { useMemo, useState } from 'react';
import { CheckCircle2, Link as LinkIcon, Phone, Plus, Search, Sparkles, XCircle } from 'lucide-react';
import AppShell from '@/Layouts/AppShell';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/Components/UI/Card';
import { Badge } from '@/Components/UI/Badge';
import Button from '@/Components/UI/Button';
import TextInput from '@/Components/TextInput';

interface Connection {
    id: number;
    slug?: string;
    name: string;
    phone_number_id: string;
    business_phone: string | null;
    is_active: boolean;
    webhook_last_received_at: string | null;
    provisioning_step?: string | null;
    provisioning_status?: string | null;
    provisioning_last_error?: string | null;
    activation_state?: string | null;
    created_at: string;
    business_profile?: {
        profile_picture_url?: string | null;
    } | null;
}

function formatProvisioningStep(step?: string | null): string {
    const labels: Record<string, string> = {
        oauth_complete: 'Login confirmed',
        assets_resolved: 'Business details received',
        system_user_assignment: 'Business access being linked',
        credit_line_attachment: 'Billing setup in progress',
        app_subscription: 'Message updates being enabled',
        phone_registration: 'Number being prepared',
        metadata_sync: 'Account details being loaded',
        connection_ready: 'Ready',
    };

    return labels[String(step || '').toLowerCase()] || 'Final checks';
}

function formatSetupLabel(connection: Connection): string {
    if (connection.provisioning_status === 'failed') return 'Needs attention';
    if (connection.provisioning_status && connection.provisioning_status !== 'completed') return 'Getting ready';
    if (connection.activation_state && connection.activation_state !== 'active') return 'Almost ready';
    if (connection.activation_state === 'active' || connection.is_active) return 'Ready';
    return 'Inactive';
}

function formatSetupTone(connection: Connection): 'success' | 'warning' | 'default' {
    if (connection.provisioning_status === 'failed') return 'warning';
    if (connection.provisioning_status && connection.provisioning_status !== 'completed') return 'default';
    if (connection.is_active) return 'success';
    return 'default';
}

export default function ConnectionsIndex({
    connections,
    canCreate,
}: {
    account: unknown;
    connections: Connection[];
    canCreate: boolean;
}) {
    const [query, setQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState<'all' | 'ready' | 'attention'>('all');

    const filteredConnections = useMemo(() => {
        const normalizedQuery = query.trim().toLowerCase();

        return connections
            .filter((connection) => {
                const setupLabel = formatSetupLabel(connection);

                if (statusFilter === 'ready' && setupLabel !== 'Ready') return false;
                if (statusFilter === 'attention' && setupLabel === 'Ready') return false;

                if (!normalizedQuery) return true;

                return (
                    connection.name.toLowerCase().includes(normalizedQuery) ||
                    connection.phone_number_id.toLowerCase().includes(normalizedQuery) ||
                    (connection.business_phone || '').toLowerCase().includes(normalizedQuery)
                );
            })
            .sort((a, b) => a.name.localeCompare(b.name));
    }, [connections, query, statusFilter]);

    const readyCount = connections.filter((connection) => formatSetupLabel(connection) === 'Ready').length;
    const setupCount = connections.filter((connection) => formatSetupLabel(connection) === 'Getting ready' || formatSetupLabel(connection) === 'Almost ready').length;
    const attentionCount = connections.filter((connection) => formatSetupLabel(connection) === 'Needs attention').length;

    return (
        <AppShell>
            <Head title="WhatsApp Connections" />

            <div className="space-y-6">
                <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900">
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                        <div>
                            <div className="inline-flex items-center gap-2 rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700 dark:bg-blue-900/30 dark:text-blue-200">
                                <LinkIcon className="h-3.5 w-3.5" />
                                WhatsApp
                            </div>
                            <h1 className="mt-3 text-3xl font-semibold text-gray-900 dark:text-gray-100">Connections</h1>
                            <p className="mt-2 max-w-xl text-sm text-gray-600 dark:text-gray-400">
                                Add your WhatsApp number and keep setup moving from one place.
                            </p>
                        </div>

                        <div className="flex flex-col gap-3 sm:flex-row">
                            {canCreate && (
                                <Link href={route('app.whatsapp.connections.create')}>
                                    <Button>
                                        <Plus className="mr-2 h-4 w-4" />
                                        Add WhatsApp Number
                                    </Button>
                                </Link>
                            )}
                            <Link href={route('app.whatsapp.connections.wizard')}>
                                <Button variant="secondary">
                                    <Sparkles className="mr-2 h-4 w-4" />
                                    Guided Setup
                                </Button>
                            </Link>
                        </div>
                    </div>

                    <div className="mt-5 grid gap-3 sm:grid-cols-3">
                        <div className="rounded-xl border border-gray-200 p-3 dark:border-gray-800">
                            <div className="text-sm text-gray-500 dark:text-gray-400">Ready</div>
                            <div className="mt-2 text-2xl font-semibold text-gray-900 dark:text-gray-100">{readyCount}</div>
                        </div>
                        <div className="rounded-xl border border-gray-200 p-3 dark:border-gray-800">
                            <div className="text-sm text-gray-500 dark:text-gray-400">Getting ready</div>
                            <div className="mt-2 text-2xl font-semibold text-gray-900 dark:text-gray-100">{setupCount}</div>
                        </div>
                        <div className="rounded-xl border border-gray-200 p-3 dark:border-gray-800">
                            <div className="text-sm text-gray-500 dark:text-gray-400">Needs attention</div>
                            <div className="mt-2 text-2xl font-semibold text-gray-900 dark:text-gray-100">{attentionCount}</div>
                        </div>
                    </div>
                </div>

                <Card>
                    <CardContent className="p-5">
                        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                            <div className="relative w-full md:max-w-md">
                                <Search className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                                <TextInput
                                    value={query}
                                    onChange={(event) => setQuery(event.target.value)}
                                    placeholder="Search by name or number"
                                    className="pl-9"
                                />
                            </div>

                            <div className="flex rounded-full border border-gray-200 bg-white p-1 dark:border-gray-800 dark:bg-gray-900">
                                {([
                                    ['all', 'All'],
                                    ['ready', 'Ready'],
                                    ['attention', 'Needs attention'],
                                ] as const).map(([value, label]) => (
                                    <button
                                        key={value}
                                        type="button"
                                        onClick={() => setStatusFilter(value)}
                                        className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                                            statusFilter === value
                                                ? 'bg-blue-600 text-white'
                                                : 'text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800'
                                        }`}
                                    >
                                        {label}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {filteredConnections.length === 0 ? (
                    <Card>
                        <CardContent className="py-16 text-center">
                            <div className="mx-auto inline-flex h-16 w-16 items-center justify-center rounded-full bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-300">
                                <LinkIcon className="h-8 w-8" />
                            </div>
                            <h3 className="mt-5 text-lg font-semibold text-gray-900 dark:text-gray-100">No connections found</h3>
                            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                                Try a different search or connect another number.
                            </p>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="grid gap-5 lg:grid-cols-2 xl:grid-cols-3">
                        {filteredConnections.map((connection) => {
                            const setupLabel = formatSetupLabel(connection);
                            const lastActivity = connection.webhook_last_received_at
                                ? new Date(connection.webhook_last_received_at).toLocaleString()
                                : null;

                            return (
                                <Card key={connection.id} className="border-gray-200 shadow-sm dark:border-gray-800">
                                    <CardHeader className="space-y-4">
                                        <div className="flex items-start justify-between gap-3">
                                            <div className="flex items-start gap-3">
                                                {connection.business_profile?.profile_picture_url ? (
                                                    <img
                                                        src={connection.business_profile.profile_picture_url}
                                                        alt={connection.name}
                                                        className="h-12 w-12 rounded-full border border-gray-200 object-cover dark:border-gray-700"
                                                    />
                                                ) : null}
                                                <div>
                                                    <CardTitle className="text-lg text-gray-900 dark:text-gray-100">{connection.name}</CardTitle>
                                                    <CardDescription className="mt-1 flex items-center gap-2 text-sm">
                                                        <Phone className="h-3.5 w-3.5" />
                                                        {connection.business_phone || 'Number added'}
                                                    </CardDescription>
                                                </div>
                                            </div>
                                            <Badge variant={formatSetupTone(connection)}>{setupLabel}</Badge>
                                        </div>
                                    </CardHeader>

                                    <CardContent className="space-y-4">
                                        <div className="rounded-xl bg-gray-50 p-4 dark:bg-gray-800/60">
                                            <div className="flex items-center gap-2 text-sm font-medium text-gray-900 dark:text-gray-100">
                                                {connection.is_active ? (
                                                    <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                                                ) : (
                                                    <XCircle className="h-4 w-4 text-amber-500" />
                                                )}
                                                {connection.is_active ? 'Ready to use' : 'Getting this number ready'}
                                            </div>
                                            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                                                {connection.provisioning_status === 'failed'
                                                    ? (connection.provisioning_last_error || 'Setup needs one more check before this number can be used.')
                                                    : connection.provisioning_status && connection.provisioning_status !== 'completed'
                                                        ? `We're still finishing setup for this number. Current step: ${formatProvisioningStep(connection.provisioning_step)}.`
                                                        : 'You can use this number for templates, campaigns, and inbox conversations.'}
                                            </p>
                                        </div>

                                        <dl className="space-y-3 text-sm">
                                            <div className="flex items-start justify-between gap-4">
                                                <dt className="text-gray-500 dark:text-gray-400">Added on</dt>
                                                <dd className="text-right font-medium text-gray-900 dark:text-gray-100">{new Date(connection.created_at).toLocaleDateString()}</dd>
                                            </div>
                                            <div className="flex items-start justify-between gap-4">
                                                <dt className="text-gray-500 dark:text-gray-400">Last activity</dt>
                                                <dd className="text-right font-medium text-gray-900 dark:text-gray-100">{lastActivity || 'Not received yet'}</dd>
                                            </div>
                                        </dl>

                                        <div className="grid gap-2 sm:grid-cols-2">
                                            <Link
                                                href={route('app.whatsapp.connections.edit', {
                                                    connection: connection.slug ?? connection.id,
                                                })}
                                                className="block"
                                            >
                                                <Button variant="secondary" className="w-full">Open</Button>
                                            </Link>
                                            <Link href={route('app.support.index')} className="block">
                                                <Button variant="ghost" className="w-full">Get help</Button>
                                            </Link>
                                        </div>
                                    </CardContent>
                                </Card>
                            );
                        })}
                    </div>
                )}
            </div>
        </AppShell>
    );
}
