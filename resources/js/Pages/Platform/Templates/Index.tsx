import { Head, Link, router } from '@inertiajs/react';
import PlatformShell from '@/Layouts/PlatformShell';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/Components/UI/Card';
import { Badge } from '@/Components/UI/Badge';
import { Input } from '@/Components/UI/Input';
import { Label } from '@/Components/UI/Label';
import { 
    FileText, 
    Search,
    Eye,
    Building2,
    Link as LinkIcon,
    CheckCircle,
    Clock,
    XCircle,
    AlertCircle
} from 'lucide-react';
import { usePage } from '@inertiajs/react';
import { useState } from 'react';

interface Template {
    id: number;
    slug: string;
    name: string;
    language: string;
    category: string;
    status: string;
    quality_score: string | null;
    workspace: {
        id: number;
        name: string;
        slug: string;
    };
    connection: {
        id: number;
        name: string;
    } | null;
    last_synced_at: string | null;
    last_meta_error: string | null;
    created_at: string;
}

interface PaginatedTemplates {
    data: Template[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    links: any[];
}

export default function TemplatesIndex({
    templates,
    filters,
    filter_options,
}: {
    templates: PaginatedTemplates;
    filters: { status?: string; workspace_id?: string; search?: string };
    filter_options: { statuses: string[]; workspaces: Array<{ id: number; name: string }> };
}) {
    const { auth } = usePage().props as any;
    const [localFilters, setLocalFilters] = useState(filters);

    const applyFilters = () => {
        router.get(route('platform.templates.index'), localFilters as any, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const getStatusBadge = (status: string) => {
        const statusMap: Record<string, { variant: 'success' | 'warning' | 'danger' | 'info' | 'default'; icon: any }> = {
            APPROVED: { variant: 'success', icon: CheckCircle },
            PENDING: { variant: 'warning', icon: Clock },
            REJECTED: { variant: 'danger', icon: XCircle },
        };

        const config = statusMap[status] || { variant: 'default' as const, icon: AlertCircle };
        const Icon = config.icon;
        
        return (
            <Badge variant={config.variant} className="flex items-center gap-1">
                <Icon className="h-3 w-3" />
                {status}
            </Badge>
        );
    };

    return (
        <PlatformShell auth={auth}>
            <Head title="Templates" />
            <div className="space-y-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Message Templates</h1>
                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                        Manage and monitor templates across all workspaces
                    </p>
                </div>

                {/* Filters */}
                <Card>
                    <CardHeader>
                        <CardTitle>Filters</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            <div>
                                <Label htmlFor="search">Search</Label>
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                                    <Input
                                        id="search"
                                        type="text"
                                        placeholder="Search templates..."
                                        value={localFilters.search || ''}
                                        onChange={(e) => setLocalFilters({ ...localFilters, search: e.target.value })}
                                        className="pl-10"
                                    />
                                </div>
                            </div>
                            <div>
                                <Label htmlFor="filter-status">Status</Label>
                                <select
                                    id="filter-status"
                                    value={localFilters.status || ''}
                                    onChange={(e) => setLocalFilters({ ...localFilters, status: e.target.value || undefined })}
                                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100"
                                >
                                    <option value="">All Statuses</option>
                                    {filter_options.statuses.map((status) => (
                                        <option key={status} value={status}>
                                            {status}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <Label htmlFor="filter-workspace">Workspace</Label>
                                <select
                                    id="filter-workspace"
                                    value={localFilters.workspace_id || ''}
                                    onChange={(e) => setLocalFilters({ ...localFilters, workspace_id: e.target.value || undefined })}
                                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100"
                                >
                                    <option value="">All Workspaces</option>
                                    {filter_options.workspaces.map((workspace) => (
                                        <option key={workspace.id} value={workspace.id}>
                                            {workspace.name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div className="flex items-end">
                                <button
                                    onClick={applyFilters}
                                    className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                                >
                                    Apply Filters
                                </button>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Templates Table */}
                <Card>
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <div>
                                <CardTitle>Templates</CardTitle>
                                <CardDescription>
                                    {templates.total} total templates
                                </CardDescription>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        {templates.data.length === 0 ? (
                            <div className="text-center py-12">
                                <FileText className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                                <p className="text-gray-500 dark:text-gray-400">No templates found</p>
                            </div>
                        ) : (
                            <>
                                <div className="overflow-x-auto">
                                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-800">
                                        <thead className="bg-gray-50 dark:bg-gray-900">
                                            <tr>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Template</th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Workspace</th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Status</th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Category</th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Language</th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Last Synced</th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                                            {templates.data.map((template) => (
                                                <tr key={template.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                                                    <td className="px-6 py-4">
                                                        <div>
                                                            <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                                                {template.name}
                                                            </p>
                                                            {template.last_meta_error && (
                                                                <p className="text-xs text-red-600 dark:text-red-400 mt-1">
                                                                    Error: {template.last_meta_error}
                                                                </p>
                                                            )}
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <Link
                                                            href={route('platform.workspaces.show', { workspace: template.workspace.id })}
                                                            className="flex items-center gap-1 text-sm text-blue-600 dark:text-blue-400 hover:underline"
                                                        >
                                                            <Building2 className="h-3 w-3" />
                                                            {template.workspace.name}
                                                        </Link>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        {getStatusBadge(template.status)}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <Badge variant="info">{template.category}</Badge>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                                        {template.language}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                                        {template.last_synced_at 
                                                            ? new Date(template.last_synced_at).toLocaleDateString()
                                                            : 'Never'}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                                                        <Link
                                                            href={route('platform.templates.show', { template: template.slug })}
                                                            className="text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
                                                        >
                                                            <Eye className="h-4 w-4" />
                                                            View
                                                        </Link>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>

                                {/* Pagination */}
                                {templates.last_page > 1 && (
                                    <div className="mt-4 flex items-center justify-between">
                                        <div className="text-sm text-gray-700 dark:text-gray-300">
                                            Showing {templates.per_page * (templates.current_page - 1) + 1} to{' '}
                                            {Math.min(templates.per_page * templates.current_page, templates.total)} of{' '}
                                            {templates.total} results
                                        </div>
                                        <div className="flex gap-2">
                                            {templates.links.map((link, index) => (
                                                link.url ? (
                                                    <Link
                                                        key={index}
                                                        href={link.url}
                                                        className={`px-3 py-2 rounded-md text-sm ${
                                                            link.active
                                                                ? 'bg-blue-600 text-white'
                                                                : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                                                        }`}
                                                        dangerouslySetInnerHTML={{ __html: link.label }}
                                                    />
                                                ) : (
                                                    <span
                                                        key={index}
                                                        className="px-3 py-2 rounded-md text-sm opacity-50 cursor-not-allowed bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300"
                                                        dangerouslySetInnerHTML={{ __html: link.label }}
                                                    />
                                                )
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </>
                        )}
                    </CardContent>
                </Card>
            </div>
        </PlatformShell>
    );
}
