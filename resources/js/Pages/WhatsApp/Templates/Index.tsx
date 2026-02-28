import { Link, router } from '@inertiajs/react';
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
    body_text: string | null;
    has_buttons: boolean;
    variable_count: number;
    connection: {
        id: number;
        name: string;
    };
    last_synced_at: string | null;
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
    connections,
    filters,
    sync_report}: {
    account: any;
    templates: {
        data: Template[];
        links: any;
        meta: any;
    };
    connections: Array<{ id: number; name: string; last_synced_at?: string | null; last_sync_error?: string | null }>;
    filters: Filters;
    sync_report?: {
        total: number;
        created: number;
        updated: number;
        errors_count: number;
        errors?: Array<{ template: string; error: string }>;
    } | null;
}) {
    const { toast } = useToast();
    const confirm = useConfirm();
    const [localFilters, setLocalFilters] = useState<Filters>(filters);
    const [showFilters, setShowFilters] = useState(false);
    const [copied, setCopied] = useState<string | null>(null);
    const [archiving, setArchiving] = useState<string | null>(null);
    const [deleting, setDeleting] = useState<string | null>(null);
    const [syncing, setSyncing] = useState(false);
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
            toast.error('No connections found', 'Create a WhatsApp connection first, then sync templates.');
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
            pending: { variant: 'warning', label: 'Pending' },
            rejected: { variant: 'danger', label: 'Rejected' },
            paused: { variant: 'default', label: 'Paused' },
            disabled: { variant: 'default', label: 'Disabled' }};

        const config = statusMap[status.toLowerCase()] || { variant: 'default' as const, label: status };
        return <Badge variant={config.variant} className="px-3 py-1">{config.label}</Badge>;
    };

    return (
        <AppShell>
            <Head title="Message Templates" />
            <div className="space-y-8">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-gray-100 dark:to-gray-300 bg-clip-text text-transparent">
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
                            <Button className="w-full sm:w-auto bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 shadow-lg shadow-blue-500/50">
                                <FileText className="h-4 w-4 mr-2" />
                                Create Template
                            </Button>
                        </Link>
                        <Button
                            onClick={syncTemplates}
                            variant="secondary"
                            disabled={syncing || !hasConnections}
                            className="w-full sm:w-auto bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 shadow-lg shadow-green-500/50"
                        >
                            {syncing ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <RefreshCw className="h-4 w-4 mr-2" />}
                            {syncing ? 'Syncing...' : 'Sync from Meta'}
                        </Button>
                    </div>
                </div>

                {/* Filters */}
                <Card className="border-0 shadow-lg">
                    <CardHeader className="bg-gradient-to-r from-gray-50 to-white dark:from-gray-800 dark:to-gray-900">
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
                                <Button onClick={applyFilters} className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 shadow-lg shadow-blue-500/50 rounded-xl">
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
                    <Card className="border-0 shadow-lg">
                        <CardHeader>
                            <CardTitle>Sync Status Report</CardTitle>
                            <CardDescription>Latest sync summary and per-connection status</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-3 text-sm">
                            {sync_report && (
                                <div className="rounded-lg border border-gray-200 dark:border-gray-700 p-3">
                                    <p>
                                        Last run: {sync_report.total} total, {sync_report.created} created, {sync_report.updated} updated, {sync_report.errors_count} errors.
                                    </p>
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
                                            Last sync: {connection.last_synced_at ? new Date(connection.last_synced_at).toLocaleString() : 'Never'}
                                        </p>
                                        {connection.last_sync_error && (
                                            <p className="mt-1 text-xs text-red-600 dark:text-red-400 truncate">
                                                Last error: {connection.last_sync_error}
                                            </p>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Templates List */}
                {templates.data.length === 0 ? (
                    <Card className="border-0 shadow-xl">
                        <CardContent className="py-16">
                            <EmptyState
                                icon={FileText}
                                title="No templates found"
                                description="Sync templates from Meta to import your WhatsApp message templates."
                                action={
                                    <Button
                                        onClick={syncTemplates}
                                        disabled={syncing || !hasConnections}
                                        className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 shadow-lg shadow-green-500/50"
                                    >
                                        {syncing ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <RefreshCw className="h-4 w-4 mr-2" />}
                                        {syncing ? 'Syncing...' : 'Sync Templates'}
                                    </Button>
                                }
                            />
                        </CardContent>
                    </Card>
                ) : (
                    <Card className="border-0 shadow-lg">
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
                                            <th className="px-6 py-4 text-right text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                                Actions
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-800">
                                        {templates.data.map((template) => (
                                            <tr
                                                key={template.id}
                                                className="hover:bg-gradient-to-r hover:from-blue-50 hover:to-blue-100 dark:hover:from-blue-900/10 dark:hover:to-blue-800/10 transition-all duration-200"
                                            >
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="flex items-center gap-3">
                                                        <div className="p-2 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg">
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
                                                            <Button size="sm" className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 rounded-lg">
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
