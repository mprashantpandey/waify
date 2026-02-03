import { Link, router, usePage } from '@inertiajs/react';
import { useState } from 'react';
import PlatformShell from '@/Layouts/PlatformShell';
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/UI/Card';
import { Badge } from '@/Components/UI/Badge';
import Button from '@/Components/UI/Button';
import { ArrowLeft, Ban, CheckCircle, Building2, Users, Zap, MessageSquare } from 'lucide-react';

interface Tenant {
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
    members_count: number;
    modules_enabled: number;
    whatsapp_connections_count: number;
    conversations_count: number;
    created_at: string;
}

export default function PlatformTenantsShow({
    account}: {
    account: Tenant;
}) {
    const { auth } = usePage().props as any;
    const [confirmDisable, setConfirmDisable] = useState(false);
    const [confirmEnable, setConfirmEnable] = useState(false);

    const handleDisable = () => {
        router.post(route('platform.accounts.disable', { account: account.id }), {
            reason: 'Disabled by platform admin'});
        setConfirmDisable(false);
    };

    const handleEnable = () => {
        router.post(route('platform.accounts.enable', { account: account.id }));
        setConfirmEnable(false);
    };

    const getStatusBadge = (status: string) => {
        const statusMap: Record<string, { variant: 'success' | 'warning' | 'danger' | 'default'; label: string }> = {
            active: { variant: 'success', label: 'Active' },
            suspended: { variant: 'warning', label: 'Suspended' },
            disabled: { variant: 'danger', label: 'Disabled' }};

        const config = statusMap[status] || { variant: 'default' as const, label: status };
        return <Badge variant={config.variant}>{config.label}</Badge>;
    };

    return (
        <PlatformShell auth={auth}>
            <div className="space-y-6">
                <Link
                    href={route('platform.accounts.index')}
                    className="inline-flex items-center text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100"
                >
                    <ArrowLeft className="h-4 w-4 mr-1" />
                    Back to Tenants
                </Link>

                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-3">
                            {account.name}
                            {getStatusBadge(account.status)}
                        </h1>
                        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                            {account.slug}
                        </p>
                    </div>
                    <div className="flex items-center gap-2">
                        {account.status === 'active' ? (
                            <Button
                                variant="danger"
                                onClick={() => setConfirmDisable(true)}
                            >
                                <Ban className="h-4 w-4 mr-2" />
                                Disable Tenant
                            </Button>
                        ) : (
                            <Button
                                variant="success"
                                onClick={() => setConfirmEnable(true)}
                            >
                                <CheckCircle className="h-4 w-4 mr-2" />
                                Enable Tenant
                            </Button>
                        )}
                    </div>
                </div>

                {account.disabled_reason && (
                    <Card className="border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20">
                        <CardContent className="pt-6">
                            <p className="text-sm text-red-800 dark:text-red-200">
                                <strong>Disabled Reason:</strong> {account.disabled_reason}
                            </p>
                            {account.disabled_at && (
                                <p className="text-xs text-red-600 dark:text-red-400 mt-1">
                                    Disabled at: {new Date(account.disabled_at).toLocaleString()}
                                </p>
                            )}
                        </CardContent>
                    </Card>
                )}

                {/* Tenant Details */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Tenant Information</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <dl className="space-y-4">
                                <div>
                                    <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Name</dt>
                                    <dd className="mt-1 text-sm text-gray-900 dark:text-gray-100">{account.name}</dd>
                                </div>
                                <div>
                                    <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Slug</dt>
                                    <dd className="mt-1 text-sm text-gray-900 dark:text-gray-100">{account.slug}</dd>
                                </div>
                                <div>
                                    <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Status</dt>
                                    <dd className="mt-1">{getStatusBadge(account.status)}</dd>
                                </div>
                                <div>
                                    <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Created</dt>
                                    <dd className="mt-1 text-sm text-gray-900 dark:text-gray-100">
                                        {new Date(account.created_at).toLocaleString()}
                                    </dd>
                                </div>
                            </dl>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Owner</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <dl className="space-y-4">
                                <div>
                                    <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Name</dt>
                                    <dd className="mt-1 text-sm text-gray-900 dark:text-gray-100">{account.owner.name}</dd>
                                </div>
                                <div>
                                    <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Email</dt>
                                    <dd className="mt-1 text-sm text-gray-900 dark:text-gray-100">{account.owner.email}</dd>
                                </div>
                            </dl>
                        </CardContent>
                    </Card>
                </div>

                {/* Statistics */}
                <Card>
                    <CardHeader>
                        <CardTitle>Statistics</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div className="text-center">
                                <Users className="h-8 w-8 text-blue-600 dark:text-blue-400 mx-auto mb-2" />
                                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                                    {account.members_count}
                                </p>
                                <p className="text-xs text-gray-500 dark:text-gray-400">Members</p>
                            </div>
                            <div className="text-center">
                                <Zap className="h-8 w-8 text-purple-600 dark:text-purple-400 mx-auto mb-2" />
                                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                                    {account.modules_enabled}
                                </p>
                                <p className="text-xs text-gray-500 dark:text-gray-400">Modules Enabled</p>
                            </div>
                            <div className="text-center">
                                <Building2 className="h-8 w-8 text-green-600 dark:text-green-400 mx-auto mb-2" />
                                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                                    {account.whatsapp_connections_count}
                                </p>
                                <p className="text-xs text-gray-500 dark:text-gray-400">WhatsApp Connections</p>
                            </div>
                            <div className="text-center">
                                <MessageSquare className="h-8 w-8 text-yellow-600 dark:text-yellow-400 mx-auto mb-2" />
                                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                                    {account.conversations_count}
                                </p>
                                <p className="text-xs text-gray-500 dark:text-gray-400">Conversations</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Confirmation Modals */}
                {confirmDisable && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                        <Card className="w-full max-w-md">
                            <CardHeader>
                                <CardTitle>Disable Tenant</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                                    Are you sure you want to disable this tenant? Users will not be able to access it.
                                </p>
                                <div className="flex items-center gap-2">
                                    <Button variant="danger" onClick={handleDisable}>
                                        Disable
                                    </Button>
                                    <Button variant="secondary" onClick={() => setConfirmDisable(false)}>
                                        Cancel
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                )}

                {confirmEnable && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                        <Card className="w-full max-w-md">
                            <CardHeader>
                                <CardTitle>Enable Tenant</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                                    Are you sure you want to enable this tenant?
                                </p>
                                <div className="flex items-center gap-2">
                                    <Button variant="success" onClick={handleEnable}>
                                        Enable
                                    </Button>
                                    <Button variant="secondary" onClick={() => setConfirmEnable(false)}>
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
