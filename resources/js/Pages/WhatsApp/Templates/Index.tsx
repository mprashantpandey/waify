import { Link, router, usePage } from '@inertiajs/react';
import AppShell from '@/Layouts/AppShell';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/Components/UI/Card';
import { Badge } from '@/Components/UI/Badge';
import Button from '@/Components/UI/Button';
import { EmptyState } from '@/Components/UI/EmptyState';
import { FileText, Search, Filter, RefreshCw, Send, Copy, Check, Sparkles, X, Tag, Globe, Zap, Archive, Trash2, Loader2 } from 'lucide-react';
import { useState } from 'react';
import TextInput from '@/Components/TextInput';
import { Head } from '@inertiajs/react';
import { useToast } from '@/hooks/useToast';
import { useConfirm } from '@/hooks/useConfirm';

interface Template {
    id: number;
    slug: string;
    name: string;
    language: string;
    category: string;
    status: string;
    sync_state?: string;
    is_remote_deleted?: boolean;
    body_text: string | null;
    has_buttons: boolean;
    variable_count: number;
    connection: {
        id: number;
        name: string;
    };
    last_synced_at: string | null;
    last_meta_sync_at?: string | null;
    last_meta_error?: string | null;
    meta_rejection_reason?: string | null;
    is_stale?: boolean;
    sendability?: {
        ok: boolean;
        reason?: string | null;
        code?: string | null;
    };
    sends_failed_count?: number;
    latest_failed_send?: {
        id: number;
        status?: string | null;
        error_message?: string | null;
        meta_message_id?: string | null;
        timeline?: string[];
        payload?: Record<string, any> | null;
        provider_error?: {
            message?: string | null;
            title?: string | null;
            details?: string | null;
            code?: string | number | null;
        } | null;
        created_at?: string | null;
    } | null;
}

interface ArchivedTemplate {
    id: number;
    slug: string;
    name: string;
    language: string;
    status: string;
    sync_state?: string | null;
    is_archived?: boolean;
    is_remote_deleted?: boolean;
    last_meta_error?: string | null;
    meta_rejection_reason?: string | null;
    last_meta_sync_at?: string | null;
    updated_at?: string | null;
    connection?: {
        id: number;
        name: string;
    } | null;
}

interface Filters {
    connection: string;
    status: string;
    category: string;
    language: string;
    search: string;
}

export default function TemplatesIndex({
    account,
    templates,
    archived_templates,
    connections,
    filters,
    sync_report}: {
    account: any;
    templates: {
        data: Template[];
        links: any;
        meta: any;
    };
    archived_templates: ArchivedTemplate[];
    connections: Array<{ id: number; name: string; last_synced_at?: string | null; last_sync_error?: string | null }>;
    filters: Filters;
    sync_report?: {
        total: number;
        created: number;
        updated: number;
        missing_remote?: number;
        missing_remote_templates?: Array<{
            id: number;
            name: string;
            language: string;
            status: string;
        }>;
        errors_count: number;
        errors?: Array<{ template: string; error: string }>;
    } | null;
}) {
    const { toast } = useToast();
    const confirm = useConfirm();
    const { support_access: supportAccess = false } = usePage<any>().props;
    const [localFilters, setLocalFilters] = useState<Filters>(filters);
    const [showFilters, setShowFilters] = useState(false);
    const [copied, setCopied] = useState<string | null>(null);
    const [archiving, setArchiving] = useState<string | null>(null);
    const [deleting, setDeleting] = useState<string | null>(null);
    const [syncing, setSyncing] = useState(false);
    const [showArchivedTemplates, setShowArchivedTemplates] = useState(false);
    const hasConnections = connections.length > 0;

    const applyFilters = () => {
        router.get(route('app.whatsapp.templates.index', {}), localFilters as any, {
            preserveState: true,
            preserveScroll: true});
    };

    const clearFilters = () => {
        const emptyFilters = {
            connection: '',
            status: '',
            category: '',
            language: '',
            search: ''};
        setLocalFilters(emptyFilters);
        router.get(route('app.whatsapp.templates.index', {}), emptyFilters);
    };

    const copyTemplateName = (name: string, language: string) => {
        const fullName = `${name}:${language}`;
        navigator.clipboard.writeText(fullName);
        setCopied(fullName);
        toast.success('Template name copied');
        setTimeout(() => setCopied(null), 2000);
    };

    const syncTemplates = () => {
        if (!hasConnections) {
            toast.error('No connections found', 'Create a WhatsApp number first, then refresh your templates.');
            return;
        }
        router.post(route('app.whatsapp.templates.sync', {}), {
            connection_id: localFilters.connection || connections[0]?.id}, {
            onStart: () => setSyncing(true),
            onSuccess: () => {
                router.reload({ only: ['templates'] });
            },
            onError: () => {},
            onFinish: () => setSyncing(false),
        });
    };

    const handleArchive = async (template: Template) => {
        const confirmed = await confirm({
            title: 'Archive Template',
            message: `Are you sure you want to archive "${template.name}"? You can restore it later.`,
            variant: 'warning'});

        if (!confirmed) return;

        setArchiving(template.slug);
        router.post(
            route('app.whatsapp.templates.archive', {
                template: template.slug}),
            {},
            {
                onSuccess: () => {
                    router.reload({ only: ['templates'] });
                },
                onError: () => {},
                onFinish: () => setArchiving(null)}
        );
    };

    const handleDelete = async (template: Template) => {
        const confirmed = await confirm({
            title: 'Delete Template',
            message: `Are you sure you want to permanently delete "${template.name}"? This action cannot be undone.`,
            variant: 'danger',
            confirmText: 'Delete'});

        if (!confirmed) return;

        setDeleting(template.slug);
        router.delete(
            route('app.whatsapp.templates.destroy', {
                template: template.slug}),
            {
                onSuccess: () => {
                    router.reload({ only: ['templates'] });
                },
                onError: () => {},
                onFinish: () => setDeleting(null)}
        );
    };

    const getStatusBadge = (status: string) => {
        const statusMap: Record<string, { variant: 'success' | 'warning' | 'danger' | 'default' | 'info'; label: string }> = {
            approved: { variant: 'success', label: 'Approved' },
            active: { variant: 'success', label: 'Active' },
            pending: { variant: 'warning', label: 'Pending' },
            rejected: { variant: 'danger', label: 'Rejected' },
            paused: { variant: 'default', label: 'Paused' },
            disabled: { variant: 'default', label: 'Disabled' }};

        const config = statusMap[status.toLowerCase()] || { variant: 'default' as const, label: status };
        return <Badge variant={config.variant} className="px-3 py-1">{config.label}</Badge>;
    };

    const getSyncStateBadge = (syncState?: string) => {
        const state = String(syncState || 'unknown').toLowerCase();
        const stateMap: Record<string, { variant: 'success' | 'warning' | 'danger' | 'default' | 'info'; label: string }> = {
            synced: { variant: 'success', label: 'Up to date' },
            stale: { variant: 'warning', label: 'Needs refresh' },
            pending_review: { variant: 'info', label: 'Under review' },
            missing_remote: { variant: 'danger', label: 'Not available on WhatsApp' },
            sync_error: { variant: 'danger', label: 'Needs review' },
        };

        const fallbackLabel = state === 'unknown' ? 'Checking status' : state.replaceAll('_', ' ');
        const config = stateMap[state] || { variant: 'default' as const, label: fallbackLabel };
        return <Badge variant={config.variant} className="px-2 py-0.5 text-[10px]">{config.label}</Badge>;
    };

    return (
        <AppShell>
            <Head title="Message Templates" />
            <div className="space-y-8">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                            Message Templates
                        </h1>
                        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                            Manage your WhatsApp message templates
                        </p>
                    </div>
                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                        <Link
                            href={route('app.whatsapp.templates.create', {})}
                            className="w-full sm:w-auto"
                        >
                            <Button className="w-full sm:w-auto">
                                <FileText className="h-4 w-4 mr-2" />
                                Create Template
                            </Button>
                        </Link>
                        <Button
                            onClick={syncTemplates}
                            variant="secondary"
                            disabled={syncing || !hasConnections}
                            className="w-full sm:w-auto"
                        >
                            {syncing ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <RefreshCw className="h-4 w-4 mr-2" />}
                            {syncing ? 'Refreshing...' : 'Refresh templates'}
                        </Button>
                    </div>
                </div>

                {/* Filters */}
                <Card className="shadow-sm">
                    <CardHeader className="border-b border-gray-100 dark:border-gray-800">
                        <div className="flex items-center justify-between">
                            <CardTitle className="flex items-center gap-2 text-lg font-bold">
                                <Filter className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                                Filters
                            </CardTitle>
                            <button
                                onClick={() => setShowFilters(!showFilters)}
                                className="text-sm font-medium text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors"
                            >
                                {showFilters ? 'Hide' : 'Show'} Filters
                            </button>
                        </div>
                    </CardHeader>
                    {showFilters && (
                        <CardContent className="pt-6">
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                                        Search
                                    </label>
                                    <div className="relative">
                                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                                        <TextInput
                                            type="text"
                                            value={localFilters.search}
                                            onChange={(e) =>
                                                setLocalFilters({ ...localFilters, search: e.target.value })
                                            }
                                            onKeyDown={(e) => e.key === 'Enter' && applyFilters()}
                                            className="pl-10 rounded-xl"
                                            placeholder="Search templates..."
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                                        Connection
                                    </label>
                                    <select
                                        value={localFilters.connection}
                                        onChange={(e) => setLocalFilters({ ...localFilters, connection: e.target.value })}
                                        className="w-full rounded-xl border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-700 px-4 py-2.5"
                                    >
                                        <option value="">All Connections</option>
                                        {connections.map((conn) => (
                                            <option key={conn.id} value={conn.id.toString()}>
                                                {conn.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                                        Status
                                    </label>
                                    <select
                                        value={localFilters.status}
                                        onChange={(e) => setLocalFilters({ ...localFilters, status: e.target.value })}
                                        className="w-full rounded-xl border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-700 px-4 py-2.5"
                                    >
                                        <option value="">All Statuses</option>
                                        <option value="approved">Approved</option>
                                        <option value="pending">Pending</option>
                                        <option value="rejected">Rejected</option>
                                        <option value="paused">Paused</option>
                                        <option value="disabled">Disabled</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                                        Category
                                    </label>
                                    <select
                                        value={localFilters.category}
                                        onChange={(e) => setLocalFilters({ ...localFilters, category: e.target.value })}
                                        className="w-full rounded-xl border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-700 px-4 py-2.5"
                                    >
                                        <option value="">All Categories</option>
                                        <option value="MARKETING">Marketing</option>
                                        <option value="UTILITY">Utility</option>
                                        <option value="AUTHENTICATION">Authentication</option>
                                    </select>
                                </div>
                            </div>
                            <div className="flex items-center gap-3 mt-6">
                                <Button onClick={applyFilters} className="rounded-xl">
                                    Apply Filters
                                </Button>
                                <Button onClick={clearFilters} variant="secondary" className="rounded-xl">
                                    <X className="h-4 w-4 mr-2" />
                                    Clear
                                </Button>
                            </div>
                        </CardContent>
                    )}
                </Card>

                {(sync_report || connections.some((c) => c.last_synced_at || c.last_sync_error)) && (
                    <Card className="shadow-sm">
                        <CardHeader>
                            <CardTitle>Template update summary</CardTitle>
                            <CardDescription>Latest refresh results for each connected number</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-3 text-sm">
                            {sync_report && (
                                <div className="rounded-lg border border-gray-200 dark:border-gray-700 p-3">
                                    <p>
                                        Last refresh: {sync_report.total} checked, {sync_report.created} added, {sync_report.updated} updated, {sync_report.missing_remote ?? 0} no longer available on WhatsApp, {sync_report.errors_count} issues.
                                    </p>
                                    {Array.isArray(sync_report.missing_remote_templates) && sync_report.missing_remote_templates.length > 0 && (
                                        <ul className="mt-2 space-y-1 text-amber-700 dark:text-amber-300">
                                            {sync_report.missing_remote_templates.map((template) => (
                                                <li key={template.id}>
                                                    No longer available on WhatsApp: {template.name} ({template.language}) — local status {template.status}
                                                </li>
                                            ))}
                                        </ul>
                                    )}
                                    {Array.isArray(sync_report.errors) && sync_report.errors.length > 0 && (
                                        <ul className="mt-2 space-y-1 text-red-600 dark:text-red-400">
                                            {sync_report.errors.map((err, idx) => (
                                                <li key={idx}>{err.template}: {err.error}</li>
                                            ))}
                                        </ul>
                                    )}
                                </div>
                            )}
                            <div className="grid gap-2 md:grid-cols-2">
                                {connections.map((connection) => (
                                    <div key={connection.id} className="rounded-lg border border-gray-200 dark:border-gray-700 p-3">
                                        <p className="font-medium">{connection.name}</p>
                                        <p className="text-xs text-gray-500 dark:text-gray-400">
                                            Last updated: {connection.last_synced_at ? new Date(connection.last_synced_at).toLocaleString() : 'Never'}
                                        </p>
                                        {connection.last_sync_error && (
                                            <p className="mt-1 text-xs text-red-600 dark:text-red-400 truncate">
                                                Last issue: {connection.last_sync_error}
                                            </p>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                )}

                {archived_templates.length > 0 && (
                    <Card className="shadow-sm">
                        <CardHeader className="border-b border-gray-100 dark:border-gray-800">
                            <div className="flex items-center justify-between gap-4">
                                <div>
                                    <CardTitle>Recovery Visibility</CardTitle>
                                    <CardDescription>
                                        Templates hidden from the main list because they were archived locally, are no longer available on WhatsApp, or both.
                                    </CardDescription>
                                </div>
                                <Button
                                    type="button"
                                    variant="secondary"
                                    onClick={() => setShowArchivedTemplates((value) => !value)}
                                    className="rounded-xl"
                                >
                                    {showArchivedTemplates ? 'Hide Hidden Templates' : `Show Hidden Templates (${archived_templates.length})`}
                                </Button>
                            </div>
                        </CardHeader>
                        {showArchivedTemplates && (
                            <CardContent className="space-y-3">
                                {archived_templates.map((template) => (
                                    <div key={template.id} className="rounded-xl border border-gray-200 dark:border-gray-700 p-4">
                                        <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                                            <div className="space-y-1">
                                                <div className="flex flex-wrap items-center gap-2">
                                                    <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                                                        {template.name}
                                                    </span>
                                                    <span className="text-xs text-gray-500 dark:text-gray-400">
                                                        {template.language}
                                                    </span>
                                                    {getStatusBadge(template.status)}
                                                    {getSyncStateBadge(template.sync_state || undefined)}
                                                    {template.is_archived && (
                                                        <Badge variant="default" className="px-2 py-0.5 text-[10px]">
                                                            Archived
                                                        </Badge>
                                                    )}
                                                    {template.is_remote_deleted && (
                                                        <Badge variant="danger" className="px-2 py-0.5 text-[10px]">
                                                            Not on WhatsApp
                                                        </Badge>
                                                    )}
                                                </div>
                                                {template.connection?.name && (
                                                    <p className="text-xs text-gray-500 dark:text-gray-400">
                                                        Connection: {template.connection.name}
                                                    </p>
                                                )}
                                                {template.last_meta_sync_at && (
                                                    <p className="text-xs text-gray-500 dark:text-gray-400">
                                                        Last checked: {new Date(template.last_meta_sync_at).toLocaleString()}
                                                    </p>
                                                )}
                                                {template.last_meta_error && (
                                                    <p className="text-xs text-red-600 dark:text-red-400">
                                                        Error: {template.last_meta_error}
                                                    </p>
                                                )}
                                                {template.meta_rejection_reason && template.meta_rejection_reason !== template.last_meta_error && (
                                                    <p className="text-xs text-red-600 dark:text-red-400">
                                                        Rejection: {template.meta_rejection_reason}
                                                    </p>
                                                )}
                                            </div>
                                            <div className="flex flex-wrap gap-2">
                                                <Link
                                                    href={route('app.whatsapp.templates.show', { template: template.slug })}
                                                >
                                                    <Button variant="secondary" size="sm" className="rounded-lg">
                                                        View
                                                    </Button>
                                                </Link>
                                                {template.is_archived && (
                                                    <Button
                                                        variant="secondary"
                                                        size="sm"
                                                        className="rounded-lg"
                                                        onClick={() => router.post(route('app.whatsapp.templates.restore', { template: template.slug }))}
                                                    >
                                                        Restore
                                                    </Button>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </CardContent>
                        )}
                    </Card>
                )}

                {/* Templates List */}
                {templates.data.length === 0 ? (
                    <Card className="shadow-sm">
                        <CardContent className="py-16">
                            <EmptyState
                                icon={FileText}
                                title="No templates found"
                                description="Refresh your templates to bring in the latest WhatsApp message templates."
                                action={
                                    <Button
                                        onClick={syncTemplates}
                                        disabled={syncing || !hasConnections}
                                        className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 shadow-lg shadow-green-500/50"
                                    >
                                        {syncing ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <RefreshCw className="h-4 w-4 mr-2" />}
                                        {syncing ? 'Refreshing...' : 'Refresh templates'}
                                    </Button>
                                }
                            />
                        </CardContent>
                    </Card>
                ) : (
                    <Card className="shadow-sm">
                        <CardContent className="p-0">
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 border-b border-gray-200 dark:border-gray-700">
                                        <tr>
                                            <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                                Template
                                            </th>
                                            <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                                Language
                                            </th>
                                            <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                                Category
                                            </th>
                                            <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                                Status
                                            </th>
                                            <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                                Variables
                                            </th>
                                            <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                                Connection
                                            </th>
                                            <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                                Notes
                                            </th>
                                            <th className="px-6 py-4 text-right text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                                Actions
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-800">
                                        {templates.data.map((template) => (
                                            <tr
                                                key={template.id}
                                                className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                                            >
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="flex items-center gap-3">
                                                        <div className="p-2 rounded-lg bg-blue-600">
                                                            <FileText className="h-4 w-4 text-white" />
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <div className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                                                                {template.name}
                                                            </div>
                                                            {template.body_text && (
                                                                <div className="text-xs text-gray-500 dark:text-gray-400 truncate max-w-xs mt-0.5">
                                                                    {template.body_text.substring(0, 60)}
                                                                    {template.body_text.length > 60 ? '...' : ''}
                                                                </div>
                                                            )}
                                                        </div>
                                                        <button
                                                            onClick={() => copyTemplateName(template.name, template.language)}
                                                            className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                                                        >
                                                            {copied === `${template.name}:${template.language}` ? (
                                                                <Check className="h-4 w-4 text-green-600 dark:text-green-400" />
                                                            ) : (
                                                                <Copy className="h-4 w-4 text-gray-400" />
                                                            )}
                                                        </button>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="flex items-center gap-1.5">
                                                        <Globe className="h-3.5 w-3.5 text-gray-400" />
                                                        <span className="text-sm text-gray-700 dark:text-gray-300 font-medium">
                                                            {template.language}
                                                        </span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <Badge variant="default" className="px-3 py-1">
                                                        <Tag className="h-3 w-3 mr-1" />
                                                        {template.category}
                                                    </Badge>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">{getStatusBadge(template.status)}</td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    {template.variable_count > 0 ? (
                                                        <Badge variant="info" className="px-3 py-1">
                                                            <Zap className="h-3 w-3 mr-1" />
                                                            {template.variable_count}
                                                        </Badge>
                                                    ) : (
                                                        <span className="text-gray-400 text-sm">—</span>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
                                                    {template.connection.name}
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="max-w-[220px] space-y-1">
                                                        <div className="flex flex-wrap items-center gap-1">
                                                            {getSyncStateBadge(template.sync_state)}
                                                            {template.is_stale ? (
                                                                <Badge variant="warning" className="px-2 py-0.5 text-[10px]">
                                                                    Stale
                                                                </Badge>
                                                            ) : null}
                                                            {template.is_remote_deleted ? (
                                                                <Badge variant="danger" className="px-2 py-0.5 text-[10px]">
                                                                    Not on WhatsApp
                                                                </Badge>
                                                            ) : null}
                                                        </div>
                                                        {template.last_meta_sync_at && (
                                                            <p className="text-[11px] text-gray-500 dark:text-gray-400">
                                                                Last checked: {new Date(template.last_meta_sync_at).toLocaleString()}
                                                            </p>
                                                        )}
                                                        {template.sendability && !template.sendability.ok && (
                                                            <p className="text-[11px] text-amber-600 dark:text-amber-400 truncate" title={template.sendability.reason || ''}>
                                                                Send blocked: {template.sendability.reason}
                                                            </p>
                                                        )}
                                                        {(template.sends_failed_count ?? 0) > 0 ? (
                                                            <div className="space-y-1">
                                                                <Badge variant="danger" className="px-2 py-1 text-[10px]">
                                                                    {(template.sends_failed_count ?? 0)} failed send{(template.sends_failed_count ?? 0) === 1 ? '' : 's'}
                                                                </Badge>
                                                                {template.latest_failed_send?.status && (
                                                                    <p className="text-[11px] text-gray-500 dark:text-gray-400">
                                                                        Final status: {template.latest_failed_send.status}
                                                                        {template.latest_failed_send.timeline && template.latest_failed_send.timeline.length > 0
                                                                            ? ` (${template.latest_failed_send.timeline.join(' -> ')})`
                                                                            : ''}
                                                                    </p>
                                                                )}
                                                                {template.latest_failed_send?.error_message && (
                                                                    <p
                                                                        className="text-[11px] text-red-600 dark:text-red-400 truncate"
                                                                        title={template.latest_failed_send.error_message}
                                                                    >
                                                                        Last failure: {template.latest_failed_send.error_message}
                                                                    </p>
                                                                )}
                                                                {template.latest_failed_send?.meta_message_id && (
                                                                    <p
                                                                        className="text-[11px] font-mono text-gray-500 dark:text-gray-400 truncate"
                                                                        title={template.latest_failed_send.meta_message_id}
                                                                    >
                                                                        Reference: {template.latest_failed_send.meta_message_id}
                                                                    </p>
                                                                )}
                                                                {template.latest_failed_send?.payload?.error?.message && (
                                                                    <p
                                                                        className="text-[11px] text-red-600 dark:text-red-400 truncate"
                                                                        title={template.latest_failed_send.payload.error.message}
                                                                    >
                                                                        WhatsApp says: {template.latest_failed_send.payload.error.message}
                                                                    </p>
                                                                )}
                                                                {template.latest_failed_send?.provider_error?.details && (
                                                                    <p
                                                                        className="text-[11px] text-red-600 dark:text-red-400 truncate"
                                                                        title={template.latest_failed_send.provider_error.details}
                                                                    >
                                                                        More detail: {template.latest_failed_send.provider_error.details}
                                                                    </p>
                                                                )}
                                                                {template.latest_failed_send?.provider_error?.code && (
                                                                    <p className="text-[11px] text-red-600 dark:text-red-400">
                                                                        Issue code: {template.latest_failed_send.provider_error.code}
                                                                    </p>
                                                                )}
                                                                {template.latest_failed_send?.created_at && (
                                                                    <p className="text-[11px] text-gray-500 dark:text-gray-400">
                                                                        Failed: {new Date(template.latest_failed_send.created_at).toLocaleString()}
                                                                    </p>
                                                                )}
                                                                {template.latest_failed_send?.id && (
                                                                    <div className="flex flex-wrap gap-2 pt-1">
                                                                        <Link
                                                                            href={`${route('app.whatsapp.templates.show', {
                                                                                template: template.slug,
                                                                            })}#recent-send-${template.latest_failed_send.id}`}
                                                                            className="text-[11px] font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                                                                        >
                                                                            Open template
                                                                        </Link>
                                                                        <Link
                                                                            href={`${route('app.whatsapp.templates.send', {
                                                                                template: template.slug,
                                                                            })}#recent-send-${template.latest_failed_send.id}`}
                                                                            className="text-[11px] font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                                                                        >
                                                                            Try send again
                                                                        </Link>
                                                                        {supportAccess && (
                                                                            <span className="text-[11px] text-gray-500 dark:text-gray-400">
                                                                                Support can review full delivery details.
                                                                            </span>
                                                                        )}
                                                                    </div>
                                                                )}
                                                            </div>
                                                        ) : (
                                                            <Badge variant="success" className="px-2 py-1 text-[10px]">
                                                                No recent issues
                                                            </Badge>
                                                        )}
                                                        {template.last_meta_error && (
                                                            <p className="text-[11px] text-red-600 dark:text-red-400 truncate" title={template.last_meta_error}>
                                                                {template.last_meta_error}
                                                            </p>
                                                        )}
                                                        {template.meta_rejection_reason && template.meta_rejection_reason !== template.last_meta_error && (
                                                            <p className="text-[11px] text-red-600 dark:text-red-400 truncate" title={template.meta_rejection_reason}>
                                                                Rejection: {template.meta_rejection_reason}
                                                            </p>
                                                        )}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-right">
                                                    <div className="flex items-center justify-end gap-2">
                                                        <Link
                                                            href={route('app.whatsapp.templates.show', {
                                                                template: template.slug})}
                                                        >
                                                            <Button variant="ghost" size="sm" className="rounded-lg">
                                                                View
                                                            </Button>
                                                        </Link>
                                                        <Link
                                                            href={route('app.whatsapp.templates.send', {
                                                                template: template.slug})}
                                                        >
                                                            <Button size="sm" className="rounded-lg">
                                                                <Send className="h-4 w-4 mr-1" />
                                                                Send
                                                            </Button>
                                                        </Link>
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            className="rounded-lg text-orange-600 hover:text-orange-700 hover:bg-orange-50 dark:hover:bg-orange-900/20"
                                                            onClick={() => handleArchive(template)}
                                                            disabled={archiving === template.slug}
                                                        >
                                                            <Archive className="h-4 w-4" />
                                                        </Button>
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            className="rounded-lg text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                                                            onClick={() => handleDelete(template)}
                                                            disabled={deleting === template.slug}
                                                        >
                                                            <Trash2 className="h-4 w-4" />
                                                        </Button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </CardContent>
                    </Card>
                )}
            </div>
        </AppShell>
    );
}
