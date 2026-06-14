import { Head, Link, router, usePage } from '@inertiajs/react';
import { useMemo, useState } from 'react';
import PlatformShell from '@/Layouts/PlatformShell';
import { Card, CardContent } from '@/Components/UI/Card';
import Button from '@/Components/UI/Button';
import { Drawer, PageHeader, StatusBadge, ThemedIconTile, Toolbar } from '@/Components/UI/Elements';
import { Activity, AlertCircle, Building2, CheckCircle2, Clock, Download, FileWarning, Filter, ServerCrash, ShieldAlert, UserRound, Webhook, XCircle } from 'lucide-react';

interface ActivityLog {
    id: string;
    scope?: string;
    type: string;
    action?: string | null;
    description: string;
    account_id: number | null;
    actor_id?: number | null;
    metadata: Record<string, any>;
    created_at: string;
}

interface PaginatedLogs {
    data: ActivityLog[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
}

type Filters = { scope?: string; type?: string; account_id?: string; actor_id?: string; action?: string; date_from?: string; date_to?: string };

function typeLabel(type: string) {
    return type.replace(/_/g, ' ').replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function typeTone(type: string): 'success' | 'warning' | 'danger' | 'info' | 'default' {
    if (type.includes('error') || type.includes('failed')) return 'danger';
    if (type.includes('success')) return 'success';
    if (type.includes('account')) return 'warning';
    if (type.includes('api') || type.includes('webhook')) return 'info';
    return 'default';
}

function typeIcon(type: string) {
    if (type.includes('webhook')) return Webhook;
    if (type.includes('error') || type.includes('failed')) return XCircle;
    if (type.includes('success')) return CheckCircle2;
    if (type.includes('account')) return Building2;
    return AlertCircle;
}

function StatCard({ label, value, icon: Icon, tone = 'green' }: { label: string; value: string | number; icon: any; tone?: 'green' | 'blue' | 'amber' | 'purple' | 'red' }) {
    return (
        <Card>
            <CardContent className="p-5">
                <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                        <p className="text-sm text-waify-text-muted dark:text-waify-dark-text-muted">{label}</p>
                        <p className="mt-2 text-2xl font-bold text-waify-text dark:text-waify-dark-text">{value}</p>
                    </div>
                    <ThemedIconTile tone={tone}>
                        <Icon className="h-5 w-5" />
                    </ThemedIconTile>
                </div>
            </CardContent>
        </Card>
    );
}

export default function ActivityLogs({
    logs,
    filters,
    filter_options,
    audit_stats,
}: {
    logs: PaginatedLogs;
    filters: Filters;
    filter_options: { types: string[]; actions: string[]; accounts: Array<{ id: number; name: string }>; actors: Array<{ id: number; name: string; email: string }> };
    audit_stats?: { destructive: number; with_actor: number };
}) {
    const { auth } = usePage().props as any;
    const [localFilters, setLocalFilters] = useState<Filters>(filters || {});
    const [selectedLog, setSelectedLog] = useState<ActivityLog | null>(null);

    const stats = useMemo(() => {
        const errors = logs.data.filter((log) => typeTone(log.type) === 'danger').length;
        const webhooks = logs.data.filter((log) => log.type.includes('webhook')).length;
        const accountEvents = logs.data.filter((log) => log.account_id).length;

        return { errors, webhooks, accountEvents };
    }, [logs.data]);

    const applyFilters = () => {
        router.get(route('platform.activity-logs'), localFilters as any, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const clearFilters = () => {
        setLocalFilters({});
        router.get(route('platform.activity-logs'), {}, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const goToPage = (page: number) => {
        router.get(route('platform.activity-logs'), { ...localFilters, page }, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const setScope = (scope: string) => {
        const next = { ...localFilters, scope };
        setLocalFilters(next);
        router.get(route('platform.activity-logs'), next as any, { preserveState: true, preserveScroll: true });
    };

    const exportHref = route('platform.activity-logs', { ...localFilters, export: 'csv' });

    return (
        <PlatformShell auth={auth}>
            <Head title="Activity Logs" />
            <div className="space-y-6">
                <PageHeader
                    title="Activity logs"
                    description="Operational events from workspace connections, failed jobs, and platform account status changes."
                    actions={(
                        <div className="flex flex-wrap gap-2">
                            <a href={exportHref}>
                                <Button type="button" variant="secondary"><Download className="h-4 w-4" />Export CSV</Button>
                            </a>
                            <Button type="button" variant="secondary" onClick={clearFilters}>Reset filters</Button>
                        </div>
                    )}
                />

                <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
                    <StatCard label="Visible events" value={logs.total} icon={Activity} />
                    <StatCard label="Webhook events" value={stats.webhooks} icon={Webhook} tone="blue" />
                    <StatCard label="Destructive actions" value={audit_stats?.destructive ?? 0} icon={ShieldAlert} tone="amber" />
                    <StatCard label="Errors on page" value={stats.errors} icon={ServerCrash} tone="red" />
                </div>

                <div className="flex flex-wrap gap-2">
                    {[
                        ['all', 'All events'],
                        ['destructive', 'Destructive audit'],
                        ['billing', 'Billing'],
                        ['webhook', 'Webhooks'],
                        ['system', 'System'],
                    ].map(([scope, label]) => (
                        <Button key={scope} type="button" size="sm" variant={(localFilters.scope || 'all') === scope ? 'primary' : 'secondary'} onClick={() => setScope(scope)}>
                            {label}
                        </Button>
                    ))}
                </div>

                <Toolbar
                    filters={(
                        <>
                            <select
                                value={localFilters.scope || 'all'}
                                onChange={(event) => setLocalFilters({ ...localFilters, scope: event.target.value || undefined })}
                                className="waify-input min-w-36"
                            >
                                <option value="all">All scopes</option>
                                <option value="destructive">Destructive</option>
                                <option value="billing">Billing</option>
                                <option value="webhook">Webhook</option>
                                <option value="system">System</option>
                            </select>
                            <select
                                value={localFilters.type || ''}
                                onChange={(event) => setLocalFilters({ ...localFilters, type: event.target.value || undefined })}
                                className="waify-input min-w-44"
                            >
                                <option value="">All types</option>
                                {filter_options.types.map((type) => (
                                    <option key={type} value={type}>{typeLabel(type)}</option>
                                ))}
                            </select>
                            <select
                                value={localFilters.action || ''}
                                onChange={(event) => setLocalFilters({ ...localFilters, action: event.target.value || undefined })}
                                className="waify-input min-w-44"
                            >
                                <option value="">All actions</option>
                                {filter_options.actions.map((action) => (
                                    <option key={action} value={action}>{typeLabel(action)}</option>
                                ))}
                            </select>
                            <select
                                value={localFilters.account_id || ''}
                                onChange={(event) => setLocalFilters({ ...localFilters, account_id: event.target.value || undefined })}
                                className="waify-input min-w-44"
                            >
                                <option value="">All workspaces</option>
                                {filter_options.accounts.map((account) => (
                                    <option key={account.id} value={account.id}>{account.name}</option>
                                ))}
                            </select>
                            <select
                                value={localFilters.actor_id || ''}
                                onChange={(event) => setLocalFilters({ ...localFilters, actor_id: event.target.value || undefined })}
                                className="waify-input min-w-44"
                            >
                                <option value="">All actors</option>
                                {filter_options.actors.map((actor) => (
                                    <option key={actor.id} value={actor.id}>{actor.name || actor.email}</option>
                                ))}
                            </select>
                            <input
                                type="date"
                                value={localFilters.date_from || ''}
                                onChange={(event) => setLocalFilters({ ...localFilters, date_from: event.target.value || undefined })}
                                className="waify-input"
                            />
                            <input
                                type="date"
                                value={localFilters.date_to || ''}
                                onChange={(event) => setLocalFilters({ ...localFilters, date_to: event.target.value || undefined })}
                                className="waify-input"
                            />
                        </>
                    )}
                    actions={<Button type="button" onClick={applyFilters}><Filter className="h-4 w-4" />Apply</Button>}
                />

                {logs.data.length === 0 ? (
                    <Card>
                        <CardContent className="flex flex-col items-center justify-center py-16 text-center">
                            <ThemedIconTile tone="gray" size="lg">
                                <Activity className="h-5 w-5" />
                            </ThemedIconTile>
                            <p className="mt-4 text-sm font-semibold text-waify-text dark:text-waify-dark-text">No activity logs found</p>
                            <p className="mt-1 text-sm text-waify-text-muted dark:text-waify-dark-text-muted">Try changing filters or check again after new system events arrive.</p>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="space-y-3">
                        {logs.data.map((log) => {
                            const Icon = typeIcon(log.type);
                            return (
                                <Card key={log.id} className="transition hover:border-waify-green/40">
                                    <CardContent className="p-4">
                                        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                                            <div className="flex min-w-0 items-start gap-3">
                                                <ThemedIconTile tone={typeTone(log.type) === 'danger' ? 'red' : typeTone(log.type) === 'warning' ? 'amber' : typeTone(log.type) === 'success' ? 'green' : 'blue'}>
                                                    <Icon className="h-5 w-5" />
                                                </ThemedIconTile>
                                                <div className="min-w-0">
                                                    <div className="flex flex-wrap items-center gap-2">
                                                        <StatusBadge tone={typeTone(log.type)} dot>{typeLabel(log.type)}</StatusBadge>
                                                        {log.scope === 'destructive' && <StatusBadge tone="warning">Destructive</StatusBadge>}
                                                        <span className="inline-flex items-center gap-1 text-xs text-waify-text-muted dark:text-waify-dark-text-muted">
                                                            <Clock className="h-3.5 w-3.5" />
                                                            {new Date(log.created_at).toLocaleString()}
                                                        </span>
                                                    </div>
                                                    <p className="mt-2 text-sm font-medium text-waify-text dark:text-waify-dark-text">{log.description}</p>
                                                    <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-waify-text-muted dark:text-waify-dark-text-muted">
                                                        {log.account_id ? (
                                                            <Link
                                                                href={route('platform.accounts.show', { account: log.account_id })}
                                                                className="inline-flex items-center gap-1 font-medium text-waify-green-dark hover:underline dark:text-emerald-300"
                                                            >
                                                                <Building2 className="h-3.5 w-3.5" />
                                                                Workspace #{log.account_id}
                                                            </Link>
                                                        ) : (
                                                            <span>Platform event</span>
                                                        )}
                                                        {log.actor_id && (
                                                            <span className="inline-flex items-center gap-1">
                                                                <UserRound className="h-3.5 w-3.5" />
                                                                Actor #{log.actor_id}
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                            <Button type="button" variant="secondary" onClick={() => setSelectedLog(log)}>
                                                <FileWarning className="h-4 w-4" />
                                                Details
                                            </Button>
                                        </div>
                                    </CardContent>
                                </Card>
                            );
                        })}
                    </div>
                )}

                {logs.last_page > 1 && (
                    <div className="flex flex-col gap-3 rounded-card border border-gray-100 bg-white p-3 shadow-card dark:border-waify-dark-border dark:bg-waify-dark-surface dark:shadow-none sm:flex-row sm:items-center sm:justify-between">
                        <p className="text-sm text-waify-text-muted dark:text-waify-dark-text-muted">
                            Showing {logs.per_page * (logs.current_page - 1) + 1} to {Math.min(logs.per_page * logs.current_page, logs.total)} of {logs.total}
                        </p>
                        <div className="flex flex-wrap gap-2">
                            {Array.from({ length: logs.last_page }, (_, index) => index + 1).map((page) => (
                                <button
                                    key={page}
                                    type="button"
                                    onClick={() => goToPage(page)}
                                    className={`h-9 min-w-9 rounded-btn px-3 text-sm font-semibold transition ${
                                        page === logs.current_page
                                            ? 'bg-waify-green text-waify-ink'
                                            : 'border border-gray-200 bg-white text-waify-text hover:bg-gray-50 dark:border-waify-dark-border dark:bg-waify-dark-surface dark:text-waify-dark-text dark:hover:bg-waify-dark-surface-2'
                                    }`}
                                >
                                    {page}
                                </button>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            <Drawer
                open={Boolean(selectedLog)}
                onClose={() => setSelectedLog(null)}
                title={selectedLog ? typeLabel(selectedLog.type) : 'Activity details'}
                description={selectedLog?.description}
                className="sm:max-w-xl"
            >
                <pre className="max-h-[70vh] overflow-auto rounded-card border border-gray-100 bg-gray-950 p-4 text-xs leading-relaxed text-gray-100 dark:border-waify-dark-border">
                    {JSON.stringify(selectedLog?.metadata || {}, null, 2)}
                </pre>
            </Drawer>
        </PlatformShell>
    );
}
