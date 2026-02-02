import { Link, router, usePage } from '@inertiajs/react';
import { useState } from 'react';
import PlatformShell from '@/Layouts/PlatformShell';
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/UI/Card';
import { Badge } from '@/Components/UI/Badge';
import Button from '@/Components/UI/Button';
import TextInput from '@/Components/TextInput';
import { Search, Shield, Eye } from 'lucide-react';

interface User {
    id: number;
    name: string;
    email: string;
    is_super_admin: boolean;
    created_at: string;
}

export default function PlatformUsersIndex({
    users,
    filters,
}: {
    users: {
        data: User[];
        links: any;
        meta: any;
    };
    filters: {
        search: string;
    };
}) {
    const { auth } = usePage().props as any;
    const [localFilters, setLocalFilters] = useState(filters);
    const [confirmToggle, setConfirmToggle] = useState<{ userId: number; action: 'make' | 'remove' } | null>(null);

    const applyFilters = () => {
        router.get(route('platform.users.index'), localFilters as any, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const handleToggleSuperAdmin = () => {
        if (!confirmToggle) return;

        const routeName = confirmToggle.action === 'make'
            ? 'platform.users.make-super-admin'
            : 'platform.users.remove-super-admin';

        router.post(route(routeName, { user: confirmToggle.userId }), {}, {
            onSuccess: () => {
                setConfirmToggle(null);
            },
        });
    };

    return (
        <PlatformShell auth={auth}>
            <div className="space-y-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Users</h1>
                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                        Manage all users on the platform
                    </p>
                </div>

                {/* Filters */}
                <Card>
                    <CardContent className="pt-6">
                        <div className="flex items-center gap-4">
                            <div className="flex-1">
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                                    <TextInput
                                        type="text"
                                        value={localFilters.search}
                                        onChange={(e) => setLocalFilters({ ...localFilters, search: e.target.value })}
                                        onKeyDown={(e) => e.key === 'Enter' && applyFilters()}
                                        className="pl-10"
                                        placeholder="Search users..."
                                    />
                                </div>
                            </div>
                            <Button onClick={applyFilters}>Apply Filters</Button>
                        </div>
                    </CardContent>
                </Card>

                {/* Users Table */}
                <Card>
                    <CardContent className="p-0">
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                            User
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                            Role
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
                                    {users.data.map((user) => (
                                        <tr
                                            key={user.id}
                                            className="hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                                        >
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div>
                                                    <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                                        {user.name}
                                                    </div>
                                                    <div className="text-xs text-gray-500 dark:text-gray-400">
                                                        {user.email}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                {user.is_super_admin ? (
                                                    <Badge variant="info" className="flex items-center gap-1 w-fit">
                                                        <Shield className="h-3 w-3" />
                                                        Super Admin
                                                    </Badge>
                                                ) : (
                                                    <span className="text-sm text-gray-500 dark:text-gray-400">User</span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                                {new Date(user.created_at).toLocaleDateString()}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                <div className="flex items-center justify-end gap-2">
                                                    <Link
                                                        href={route('platform.users.show', {
                                                            user: user.id,
                                                        })}
                                                    >
                                                        <Button variant="ghost" size="sm">
                                                            <Eye className="h-4 w-4 mr-1" />
                                                            View
                                                        </Button>
                                                    </Link>
                                                    {user.is_super_admin ? (
                                                        <Button
                                                            variant="warning"
                                                            size="sm"
                                                            onClick={() => setConfirmToggle({ userId: user.id, action: 'remove' })}
                                                        >
                                                            Remove Super Admin
                                                        </Button>
                                                    ) : (
                                                        <Button
                                                            variant="info"
                                                            size="sm"
                                                            onClick={() => setConfirmToggle({ userId: user.id, action: 'make' })}
                                                        >
                                                            <Shield className="h-4 w-4 mr-1" />
                                                            Make Super Admin
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
                {users.links && users.links.length > 3 && (
                    <div className="flex items-center justify-center gap-2">
                        {users.links.map((link: any, index: number) => (
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

                {/* Confirmation Modal */}
                {confirmToggle && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                        <Card className="w-full max-w-md">
                            <CardHeader>
                                <CardTitle>
                                    {confirmToggle.action === 'make' ? 'Make Super Admin' : 'Remove Super Admin'}
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                                    {confirmToggle.action === 'make'
                                        ? 'Are you sure you want to make this user a super admin? They will have full platform access.'
                                        : 'Are you sure you want to remove super admin status from this user?'}
                                </p>
                                <div className="flex items-center gap-2">
                                    <Button
                                        variant={confirmToggle.action === 'make' ? 'info' : 'warning'}
                                        onClick={handleToggleSuperAdmin}
                                    >
                                        Confirm
                                    </Button>
                                    <Button variant="secondary" onClick={() => setConfirmToggle(null)}>
                                        Cancel
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                )}
            </div>
        </PlatformShell>
    );
}

