import { Link, router, usePage } from '@inertiajs/react';
import { useState } from 'react';
import PlatformShell from '@/Layouts/PlatformShell';
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/UI/Card';
import { Badge } from '@/Components/UI/Badge';
import Button from '@/Components/UI/Button';
import TextInput from '@/Components/TextInput';
import { useNotifications } from '@/hooks/useNotifications';
import { Search, Building2, Eye, Ban, CheckCircle } from 'lucide-react';

interface Workspace {
    id: number;
    name: string;
    slug: string;
    status: string;
    disabled_reason: string | null;
    disabled_at: string | null;
    owner: {
        id: number;
        name: string;
        email: string;
    };
    created_at: string;
}

export default function PlatformWorkspacesIndex({
    workspaces,
    filters,
}: {
    workspaces: {
        data: Workspace[];
        links: any;
        meta: any;
    };
    filters: {
        search: string;
        status: string;
    };
}) {
    const { auth } = usePage().props as any;
    const { confirm, toast } = useNotifications();
    const [localFilters, setLocalFilters] = useState(filters);

    const applyFilters = () => {
        router.get(route('platform.workspaces.index'), localFilters as any, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const handleDisable = async (workspaceId: number, workspaceName: string) => {
        const confirmed = await confirm({
            title: 'Disable Workspace',
            message: `Are you sure you want to disable "${workspaceName}"? Users will not be able to access it.`,
            variant: 'danger',
            confirmText: 'Disable',
            cancelText: 'Cancel',
        });

        if (confirmed) {
            router.post(
                route('platform.workspaces.disable', { workspace: workspaceId }),
                { reason: 'Disabled by platform admin' },
                {
                    onSuccess: () => {
                        toast.success('Workspace disabled successfully');
                    },
                    onError: () => {
                        toast.error('Failed to disable workspace');
                    },
                }
            );
        }
    };

    const handleEnable = async (workspaceId: number, workspaceName: string) => {
        const confirmed = await confirm({
            title: 'Enable Workspace',
            message: `Are you sure you want to enable "${workspaceName}"?`,
            variant: 'info',
            confirmText: 'Enable',
            cancelText: 'Cancel',
        });

        if (confirmed) {
            router.post(
                route('platform.workspaces.enable', { workspace: workspaceId }),
                {},
                {
                    onSuccess: () => {
                        toast.success('Workspace enabled successfully');
                    },
                    onError: () => {
                        toast.error('Failed to enable workspace');
                    },
                }
            );
        }
    };

    const getStatusBadge = (status: string) => {
        const statusMap: Record<string, { variant: 'success' | 'warning' | 'danger' | 'default'; label: string }> = {
            active: { variant: 'success', label: 'Active' },
            suspended: { variant: 'warning', label: 'Suspended' },
            disabled: { variant: 'danger', label: 'Disabled' },
        };

        const config = statusMap[status] || { variant: 'default' as const, label: status };
        return <Badge variant={config.variant}>{config.label}</Badge>;
    };

    return (
        <PlatformShell auth={auth}>
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Workspaces</h1>
                        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                            Manage all workspaces on the platform
                        </p>
                    </div>
                </div>

                {/* Filters */}
                <Card>
                    <CardContent className="pt-6">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Search
                                </label>
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                                    <TextInput
                                        type="text"
                                        value={localFilters.search}
                                        onChange={(e) => setLocalFilters({ ...localFilters, search: e.target.value })}
                                        onKeyDown={(e) => e.key === 'Enter' && applyFilters()}
                                        className="pl-10"
                                        placeholder="Search workspaces..."
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Status
                                </label>
                                <select
                                    value={localFilters.status}
                                    onChange={(e) => setLocalFilters({ ...localFilters, status: e.target.value })}
                                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-800 dark:border-gray-700"
                                >
                                    <option value="">All Statuses</option>
                                    <option value="active">Active</option>
                                    <option value="suspended">Suspended</option>
                                    <option value="disabled">Disabled</option>
                                </select>
                            </div>
                            <div className="flex items-end">
                                <Button onClick={applyFilters} className="w-full">
                                    Apply Filters
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Workspaces Table */}
                <Card>
                    <CardContent className="p-0">
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                            Workspace
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                            Owner
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                            Status
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                            Created
                                        </th>
                                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                            Actions
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-800">
                                    {workspaces.data.map((workspace) => (
                                        <tr
                                            key={workspace.id}
                                            className="hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                                        >
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div>
                                                    <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                                        {workspace.name}
                                                    </div>
                                                    <div className="text-xs text-gray-500 dark:text-gray-400">
                                                        {workspace.slug}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm text-gray-900 dark:text-gray-100">
                                                    {workspace.owner.name}
                                                </div>
                                                <div className="text-xs text-gray-500 dark:text-gray-400">
                                                    {workspace.owner.email}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                {getStatusBadge(workspace.status)}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                                {new Date(workspace.created_at).toLocaleDateString()}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                <div className="flex items-center justify-end gap-2">
                                                    <Link
                                                        href={route('platform.workspaces.show', {
                                                            workspace: workspace.id,
                                                        })}
                                                    >
                                                        <Button variant="ghost" size="sm">
                                                            <Eye className="h-4 w-4 mr-1" />
                                                            View
                                                        </Button>
                                                    </Link>
                                                    {workspace.status === 'active' ? (
                                                        <Button
                                                            variant="danger"
                                                            size="sm"
                                                            onClick={() => handleDisable(workspace.id, workspace.name)}
                                                        >
                                                            <Ban className="h-4 w-4 mr-1" />
                                                            Disable
                                                        </Button>
                                                    ) : (
                                                        <Button
                                                            variant="success"
                                                            size="sm"
                                                            onClick={() => handleEnable(workspace.id, workspace.name)}
                                                        >
                                                            <CheckCircle className="h-4 w-4 mr-1" />
                                                            Enable
                                                        </Button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </CardContent>
                </Card>

                {/* Pagination */}
                {workspaces.links && workspaces.links.length > 3 && (
                    <div className="flex items-center justify-center gap-2">
                        {workspaces.links.map((link: any, index: number) => (
                            <Link
                                key={index}
                                href={link.url || '#'}
                                className={`px-3 py-2 rounded-lg text-sm ${
                                    link.active
                                        ? 'bg-blue-600 text-white'
                                        : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                                } ${!link.url && 'opacity-50 cursor-not-allowed'}`}
                                dangerouslySetInnerHTML={{ __html: link.label }}
                            />
                        ))}
                    </div>
                )}

            </div>
        </PlatformShell>
    );
}

