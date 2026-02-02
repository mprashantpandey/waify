import { Link, usePage } from '@inertiajs/react';
import PlatformShell from '@/Layouts/PlatformShell';
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/UI/Card';
import { Badge } from '@/Components/UI/Badge';
import { ArrowLeft, Shield } from 'lucide-react';

interface User {
    id: number;
    name: string;
    email: string;
    is_super_admin: boolean;
    owned_workspaces_count: number;
    member_workspaces_count: number;
    created_at: string;
}

export default function PlatformUsersShow({
    user,
}: {
    user: User;
}) {
    const { auth } = usePage().props as any;
    return (
        <PlatformShell auth={auth}>
            <div className="space-y-6">
                <Link
                    href={route('platform.users.index')}
                    className="inline-flex items-center text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100"
                >
                    <ArrowLeft className="h-4 w-4 mr-1" />
                    Back to Users
                </Link>

                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-3">
                        {user.name}
                        {user.is_super_admin && (
                            <Badge variant="info" className="flex items-center gap-1">
                                <Shield className="h-3 w-3" />
                                Super Admin
                            </Badge>
                        )}
                    </h1>
                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                        {user.email}
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>User Information</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <dl className="space-y-4">
                                <div>
                                    <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Name</dt>
                                    <dd className="mt-1 text-sm text-gray-900 dark:text-gray-100">{user.name}</dd>
                                </div>
                                <div>
                                    <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Email</dt>
                                    <dd className="mt-1 text-sm text-gray-900 dark:text-gray-100">{user.email}</dd>
                                </div>
                                <div>
                                    <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Role</dt>
                                    <dd className="mt-1">
                                        {user.is_super_admin ? (
                                            <Badge variant="info">Super Admin</Badge>
                                        ) : (
                                            <span className="text-sm text-gray-900 dark:text-gray-100">User</span>
                                        )}
                                    </dd>
                                </div>
                                <div>
                                    <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Created</dt>
                                    <dd className="mt-1 text-sm text-gray-900 dark:text-gray-100">
                                        {new Date(user.created_at).toLocaleString()}
                                    </dd>
                                </div>
                            </dl>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Workspace Statistics</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <dl className="space-y-4">
                                <div>
                                    <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Owned Workspaces</dt>
                                    <dd className="mt-1 text-2xl font-bold text-gray-900 dark:text-gray-100">
                                        {user.owned_workspaces_count}
                                    </dd>
                                </div>
                                <div>
                                    <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Member Workspaces</dt>
                                    <dd className="mt-1 text-2xl font-bold text-gray-900 dark:text-gray-100">
                                        {user.member_workspaces_count}
                                    </dd>
                                </div>
                            </dl>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </PlatformShell>
    );
}

