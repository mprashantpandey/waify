import { Head, Link, router, usePage } from '@inertiajs/react';
import { useEffect, useMemo, useState } from 'react';
import PlatformShell from '@/Layouts/PlatformShell';
import { Card, CardContent } from '@/Components/UI/Card';
import { Badge } from '@/Components/UI/Badge';
import Button from '@/Components/UI/Button';
import { Avatar, Drawer } from '@/Components/UI/Elements';
import { CheckCircle2, Eye, KeyRound, LogIn, RotateCcw, Search, Shield, UserPlus, Users } from 'lucide-react';
import { useNotifications } from '@/hooks/useNotifications';

interface User {
    id: number;
    name: string;
    email: string;
    is_super_admin: boolean;
    owned_accounts_count?: number;
    member_accounts_count?: number;
    two_factor_enabled?: boolean;
    force_password_reset_at?: string | null;
    created_at: string;
}

interface AccountOption {
    id: number;
    name: string;
    slug?: string | null;
}

function plainPaginationLabel(label: string) {
    return label.replace('&laquo;', 'Prev').replace('&raquo;', 'Next');
}

export default function PlatformUsersIndex({
    users,
    accounts = [],
    filters,
    selectedUser: initialSelectedUser,
}: {
    users: {
        data: User[];
        links: Array<{ url: string | null; label: string; active: boolean }>;
        meta: any;
    };
    accounts?: AccountOption[];
    filters: {
        search?: string | null;
    };
    selectedUser?: User | null;
}) {
    const { auth } = usePage().props as any;
    const { confirm, toast } = useNotifications();
    const [localFilters, setLocalFilters] = useState(filters || {});
    const [confirmToggle, setConfirmToggle] = useState<{ user: User; action: 'make' | 'remove' } | null>(null);
    const [confirmImpersonate, setConfirmImpersonate] = useState<User | null>(null);
    const [selectedUser, setSelectedUser] = useState<User | null>(initialSelectedUser || null);
    const [createOpen, setCreateOpen] = useState(false);
    const [createForm, setCreateForm] = useState({
        name: '',
        email: '',
        password: '',
        is_super_admin: false,
        account_id: '',
        account_role: 'member',
    });

    const stats = useMemo(() => ({
        total: users.meta?.total ?? users.data.length,
        visible: users.data.length,
        admins: users.data.filter((user) => user.is_super_admin).length,
        standard: users.data.filter((user) => !user.is_super_admin).length,
    }), [users.data, users.meta?.total]);

    const applyFilters = () => {
        router.get(route('platform.users.index'), localFilters as any, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const clearFilters = () => {
        setLocalFilters({});
        router.get(route('platform.users.index'), {}, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const handleToggleSuperAdmin = () => {
        if (!confirmToggle) return;

        const routeName = confirmToggle.action === 'make'
            ? 'platform.users.make-super-admin'
            : 'platform.users.remove-super-admin';

        router.post(route(routeName, { user: confirmToggle.user.id }), {}, {
            preserveScroll: true,
            onSuccess: () => {
                toast.success(confirmToggle.action === 'make' ? 'User is now a super admin' : 'Super admin access removed');
                setConfirmToggle(null);
            },
            onError: () => toast.error('Failed to update user role'),
        });
    };

    const handleImpersonate = () => {
        if (!confirmImpersonate) return;

        router.post(route('platform.users.impersonate', { user: confirmImpersonate.id }), {}, {
            onSuccess: () => setConfirmImpersonate(null),
            onError: () => toast.error('Failed to start impersonation'),
        });
    };

    const handleCreateUser = () => {
        router.post(route('platform.users.store'), createForm, {
            preserveScroll: true,
            onSuccess: () => {
                toast.success('User created');
                setCreateOpen(false);
                setCreateForm({
                    name: '',
                    email: '',
                    password: '',
                    is_super_admin: false,
                    account_id: '',
                    account_role: 'member',
                });
            },
            onError: (errors) => {
                toast.error((errors.name || errors.email || errors.password || errors.account_id || 'Failed to create user') as string);
            },
        });
    };

    const forcePasswordReset = async (user: User) => {
        const confirmed = await confirm({
            title: 'Force password reset',
            message: `Require ${user.email} to change their password and revoke active sessions?`,
            variant: 'warning',
            confirmText: 'Force reset',
            cancelText: 'Cancel',
        });
        if (!confirmed) return;

        router.post(route('platform.users.force-password-reset', { user: user.id }), {}, {
            preserveScroll: true,
            onSuccess: () => {
                toast.success('Password reset required');
                router.reload({ only: ['users', 'selectedUser', 'flash'] });
            },
            onError: () => toast.error('Failed to update user'),
        });
    };

    const clearPasswordReset = async (user: User) => {
        const confirmed = await confirm({
            title: 'Clear password reset',
            message: `Allow ${user.email} to continue without changing their password?`,
            variant: 'info',
            confirmText: 'Clear requirement',
            cancelText: 'Cancel',
        });
        if (!confirmed) return;

        router.post(route('platform.users.clear-password-reset', { user: user.id }), {}, {
            preserveScroll: true,
            onSuccess: () => {
                toast.success('Password reset requirement cleared');
                router.reload({ only: ['users', 'selectedUser', 'flash'] });
            },
            onError: () => toast.error('Failed to clear password reset'),
        });
    };

    const revokeSessions = async (user: User) => {
        const confirmed = await confirm({
            title: 'Revoke sessions',
            message: `Sign ${user.email} out of all active browser sessions?`,
            variant: 'danger',
            confirmText: 'Revoke sessions',
            cancelText: 'Cancel',
        });
        if (!confirmed) return;

        router.post(route('platform.users.revoke-sessions', { user: user.id }), {}, {
            preserveScroll: true,
            onSuccess: () => {
                toast.success('Sessions revoked');
                router.reload({ only: ['users', 'selectedUser', 'flash'] });
            },
            onError: () => toast.error('Failed to revoke sessions'),
        });
    };

    useEffect(() => {
        setSelectedUser(initialSelectedUser || null);
    }, [initialSelectedUser]);

    const openUser = (user: User) => {
        router.get(route('platform.users.index'), { ...(filters || {}), user: user.id }, {
            preserveState: true,
            preserveScroll: true,
            replace: true,
        });
    };

    const closeUser = () => {
        setSelectedUser(null);
        router.get(route('platform.users.index'), filters as any, {
            preserveState: true,
            preserveScroll: true,
            replace: true,
        });
    };

    return (
        <PlatformShell auth={auth}>
            <Head title="Users" />
            <div className="space-y-4">
                <div className="flex items-center justify-between gap-3">
                    <div>
                        <h1 className="text-xl font-semibold text-waify-text dark:text-waify-dark-text">Users</h1>
                        <p className="text-sm text-waify-text-muted dark:text-waify-dark-text-muted">Create platform admins, workspace users, and chat agents.</p>
                    </div>
                    <Button onClick={() => setCreateOpen(true)}>
                        <UserPlus className="h-4 w-4" />
                        Add user
                    </Button>
                </div>
                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                    {[
                        { label: 'Users', value: stats.total, icon: Users, tone: 'bg-blue-50 text-blue-600 dark:bg-blue-950/40' },
                        { label: 'Visible', value: stats.visible, icon: Search, tone: 'bg-waify-green-soft text-waify-green-dark' },
                        { label: 'Super admins', value: stats.admins, icon: Shield, tone: 'bg-purple-50 text-purple-600 dark:bg-purple-950/40' },
                        { label: 'Standard users', value: stats.standard, icon: UserPlus, tone: 'bg-amber-50 text-amber-600 dark:bg-amber-950/40' },
                    ].map((item) => {
                        const Icon = item.icon;
                        return (
                            <Card key={item.label} className="transition-shadow hover:shadow-card-lg">
                                <CardContent className="p-4">
                                    <span className={`flex h-9 w-9 items-center justify-center rounded-lg ${item.tone}`}>
                                        <Icon className="h-[18px] w-[18px]" />
                                    </span>
                                    <div className="mt-3 text-2xl font-bold tabular-nums text-waify-text dark:text-waify-dark-text">{item.value}</div>
                                    <div className="mt-1 text-xs text-waify-text-muted dark:text-waify-dark-text-muted">{item.label}</div>
                                </CardContent>
                            </Card>
                        );
                    })}
                </div>

                <div className="mb-4 flex flex-wrap items-center gap-3">
                    <div className="relative min-w-[200px] flex-1 max-w-md">
                        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                        <input
                            value={localFilters.search || ''}
                            onChange={(event) => setLocalFilters({ ...localFilters, search: event.target.value })}
                            onKeyDown={(event) => event.key === 'Enter' && applyFilters()}
                            placeholder="Search..."
                            className="h-10 w-full rounded-btn border border-waify-border bg-white pl-10 pr-3 text-sm outline-none focus:ring-2 focus:ring-waify-green/20 dark:border-slate-600 dark:bg-slate-900"
                        />
                    </div>
                    <div className="ml-auto flex items-center gap-2">
                        <Button size="sm" variant="secondary" onClick={clearFilters}>Reset</Button>
                        <Button size="sm" onClick={applyFilters}>Apply</Button>
                    </div>
                </div>

                <Card className="overflow-hidden">
                    <CardContent className="p-0">
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b border-gray-100 bg-gray-50/50 text-left text-xs uppercase tracking-wider text-waify-text-muted dark:border-slate-700 dark:bg-slate-800/40">
                                        <th className="px-5 py-3 font-semibold">User</th>
                                        <th className="px-5 py-3 font-semibold">Role</th>
                                        <th className="px-5 py-3 font-semibold">Status</th>
                                        <th className="px-5 py-3 font-semibold">Created</th>
                                        <th className="px-5 py-3 font-semibold"></th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {users.data.map((user) => (
                                        <tr key={user.id} className="border-b border-gray-100 transition hover:bg-gray-50/50 dark:border-slate-700/80 dark:hover:bg-slate-800/30">
                                            <td className="px-5 py-3">
                                                <div className="flex items-center gap-2">
                                                    <Avatar name={user.name} size="sm" />
                                                    <div>
                                                        <div className="font-medium text-waify-text dark:text-waify-dark-text">{user.name}</div>
                                                        <div className="text-xs text-waify-text-muted dark:text-waify-dark-text-muted">{user.email}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-5 py-3">
                                                {user.is_super_admin ? (
                                                    <Badge variant="info" className="inline-flex items-center gap-1">
                                                        <Shield className="h-3 w-3" />
                                                        Super admin
                                                    </Badge>
                                                ) : (
                                                    <span className="text-waify-text-muted dark:text-waify-dark-text-muted">User</span>
                                                )}
                                                {user.two_factor_enabled && <Badge variant="success" className="ml-2">2FA</Badge>}
                                                {user.force_password_reset_at && <Badge variant="warning" className="ml-2">Reset required</Badge>}
                                            </td>
                                            <td className="px-5 py-3"><Badge variant="success">active</Badge></td>
                                            <td className="px-5 py-3 text-waify-text-muted dark:text-waify-dark-text-muted">{new Date(user.created_at).toLocaleDateString()}</td>
                                            <td className="px-5 py-3 text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    <Button variant="ghost" size="sm" onClick={() => openUser(user)}><Eye className="h-4 w-4" />View</Button>
                                                    {!user.is_super_admin && user.id !== auth?.user?.id && (
                                                        <Button variant="secondary" size="sm" onClick={() => setConfirmImpersonate(user)}><LogIn className="h-4 w-4" />Impersonate</Button>
                                                    )}
                                                    {user.is_super_admin ? (
                                                        <Button variant="secondary" size="sm" onClick={() => setConfirmToggle({ user, action: 'remove' })}>Remove admin</Button>
                                                    ) : (
                                                        <Button variant="secondary" size="sm" onClick={() => setConfirmToggle({ user, action: 'make' })}><Shield className="h-4 w-4" />Make admin</Button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        {users.data.length === 0 && (
                            <div className="p-8 text-center text-sm text-waify-text-muted dark:text-waify-dark-text-muted">No users match this search.</div>
                        )}
                    </CardContent>
                </Card>

                {users.links && users.links.length > 3 && (
                    <div className="flex flex-wrap items-center justify-center gap-2">
                        {users.links.map((link, index) => (
                            link.url ? (
                                <Link
                                    key={`${link.label}-${index}`}
                                    href={link.url}
                                    className={`rounded-btn px-3 py-2 text-sm font-semibold ${
                                        link.active
                                            ? 'bg-waify-green text-white'
                                            : 'surface ring-1 ring-gray-100 hover:bg-gray-50 dark:ring-slate-700'
                                    }`}
                                >
                                    {plainPaginationLabel(link.label)}
                                </Link>
                            ) : (
                                <span key={`${link.label}-${index}`} className="rounded-btn bg-gray-100 px-3 py-2 text-sm text-waify-text-muted opacity-60 dark:bg-slate-800">
                                    {plainPaginationLabel(link.label)}
                                </span>
                            )
                        ))}
                    </div>
                )}
            </div>

            <Drawer
                open={createOpen}
                onClose={() => setCreateOpen(false)}
                title="Add user"
                description="Create a platform user or assign a chat agent to a workspace."
                className="sm:max-w-lg"
                footer={(
                    <div className="flex justify-end gap-2">
                        <Button variant="secondary" onClick={() => setCreateOpen(false)}>Cancel</Button>
                        <Button onClick={handleCreateUser}><UserPlus className="h-4 w-4" />Create</Button>
                    </div>
                )}
            >
                <div className="space-y-4">
                    <div className="grid gap-4 sm:grid-cols-2">
                        <label className="space-y-1.5">
                            <span className="text-xs font-semibold text-waify-text dark:text-waify-dark-text">Name</span>
                            <input
                                value={createForm.name}
                                onChange={(event) => setCreateForm((current) => ({ ...current, name: event.target.value }))}
                                className="h-10 w-full rounded-btn border border-waify-border bg-white px-3 text-sm outline-none focus:ring-2 focus:ring-waify-green/20 dark:border-slate-600 dark:bg-slate-900"
                            />
                        </label>
                        <label className="space-y-1.5">
                            <span className="text-xs font-semibold text-waify-text dark:text-waify-dark-text">Email</span>
                            <input
                                type="email"
                                value={createForm.email}
                                onChange={(event) => setCreateForm((current) => ({ ...current, email: event.target.value }))}
                                className="h-10 w-full rounded-btn border border-waify-border bg-white px-3 text-sm outline-none focus:ring-2 focus:ring-waify-green/20 dark:border-slate-600 dark:bg-slate-900"
                            />
                        </label>
                    </div>
                    <label className="space-y-1.5">
                        <span className="text-xs font-semibold text-waify-text dark:text-waify-dark-text">Password</span>
                        <input
                            type="password"
                            value={createForm.password}
                            onChange={(event) => setCreateForm((current) => ({ ...current, password: event.target.value }))}
                            className="h-10 w-full rounded-btn border border-waify-border bg-white px-3 text-sm outline-none focus:ring-2 focus:ring-waify-green/20 dark:border-slate-600 dark:bg-slate-900"
                        />
                    </label>
                    <label className="flex items-center justify-between gap-3 rounded-card border border-gray-100 p-3 dark:border-waify-dark-border">
                        <span>
                            <span className="block text-sm font-semibold text-waify-text dark:text-waify-dark-text">Platform admin</span>
                            <span className="block text-xs text-waify-text-muted dark:text-waify-dark-text-muted">Full access to platform admin panel.</span>
                        </span>
                        <input
                            type="checkbox"
                            checked={createForm.is_super_admin}
                            onChange={(event) => setCreateForm((current) => ({ ...current, is_super_admin: event.target.checked }))}
                            className="h-4 w-4 rounded border-gray-300 text-waify-green focus:ring-waify-green"
                        />
                    </label>
                    {!createForm.is_super_admin && (
                        <div className="grid gap-4 sm:grid-cols-[minmax(0,1fr)_160px]">
                            <label className="space-y-1.5">
                                <span className="text-xs font-semibold text-waify-text dark:text-waify-dark-text">Workspace</span>
                                <select
                                    value={createForm.account_id}
                                    onChange={(event) => setCreateForm((current) => ({ ...current, account_id: event.target.value }))}
                                    className="h-10 w-full rounded-btn border border-waify-border bg-white px-3 text-sm outline-none focus:ring-2 focus:ring-waify-green/20 dark:border-slate-600 dark:bg-slate-900"
                                >
                                    <option value="">No workspace</option>
                                    {accounts.map((account) => (
                                        <option key={account.id} value={account.id}>{account.name}</option>
                                    ))}
                                </select>
                            </label>
                            <label className="space-y-1.5">
                                <span className="text-xs font-semibold text-waify-text dark:text-waify-dark-text">Role</span>
                                <select
                                    value={createForm.account_role}
                                    onChange={(event) => setCreateForm((current) => ({ ...current, account_role: event.target.value }))}
                                    className="h-10 w-full rounded-btn border border-waify-border bg-white px-3 text-sm outline-none focus:ring-2 focus:ring-waify-green/20 dark:border-slate-600 dark:bg-slate-900"
                                >
                                    <option value="member">Agent</option>
                                    <option value="admin">Workspace admin</option>
                                </select>
                            </label>
                        </div>
                    )}
                </div>
            </Drawer>

            <Drawer
                open={Boolean(confirmToggle)}
                onClose={() => setConfirmToggle(null)}
                title={confirmToggle?.action === 'make' ? 'Make super admin' : 'Remove super admin'}
                description={confirmToggle?.user.email}
                className="sm:max-w-md"
                footer={(
                    <div className="flex justify-end gap-2">
                        <Button variant="secondary" onClick={() => setConfirmToggle(null)}>Cancel</Button>
                        <Button variant={confirmToggle?.action === 'remove' ? 'warning' : 'primary'} onClick={handleToggleSuperAdmin}>Confirm</Button>
                    </div>
                )}
            >
                <p className="text-sm leading-6 text-waify-text-muted dark:text-waify-dark-text-muted">
                    {confirmToggle?.action === 'make'
                        ? 'This user will have full platform admin access.'
                        : 'This user will lose platform admin access. Make sure another super admin remains.'}
                </p>
            </Drawer>

            <Drawer
                open={Boolean(selectedUser)}
                onClose={closeUser}
                title={selectedUser?.name || 'User details'}
                description={selectedUser?.email}
                className="sm:max-w-md"
                footer={(
                    <div className="flex justify-end gap-2">
                        <Button variant="secondary" onClick={closeUser}>Close</Button>
                    </div>
                )}
            >
                {selectedUser && (
                    <div className="space-y-4">
                        <div className="flex items-center gap-3">
                            <Avatar name={selectedUser.name} size="lg" />
                            <div className="min-w-0">
                                <p className="truncate font-semibold text-waify-text dark:text-waify-dark-text">{selectedUser.name}</p>
                                <p className="truncate text-sm text-waify-text-muted dark:text-waify-dark-text-muted">{selectedUser.email}</p>
                            </div>
                        </div>
                        <div className="rounded-card border border-gray-100 bg-gray-50 p-4 dark:border-waify-dark-border dark:bg-waify-dark-surface-2">
                            <div className="flex items-center justify-between gap-3">
                                <span className="text-sm text-waify-text-muted dark:text-waify-dark-text-muted">Role</span>
                                {selectedUser.is_super_admin ? <Badge variant="info">Super admin</Badge> : <Badge variant="secondary">User</Badge>}
                            </div>
                            <div className="mt-3 flex items-center justify-between gap-3">
                                <span className="text-sm text-waify-text-muted dark:text-waify-dark-text-muted">Created</span>
                                <span className="text-sm font-semibold text-waify-text dark:text-waify-dark-text">{new Date(selectedUser.created_at).toLocaleDateString()}</span>
                            </div>
                            <div className="mt-3 flex items-center justify-between gap-3">
                                <span className="text-sm text-waify-text-muted dark:text-waify-dark-text-muted">2FA</span>
                                {selectedUser.two_factor_enabled ? <Badge variant="success">Enabled</Badge> : <Badge variant="warning">Not enabled</Badge>}
                            </div>
                            <div className="mt-3 flex items-center justify-between gap-3">
                                <span className="text-sm text-waify-text-muted dark:text-waify-dark-text-muted">Password reset</span>
                                {selectedUser.force_password_reset_at ? <Badge variant="warning">Required</Badge> : <Badge variant="success">Clear</Badge>}
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            <div className="rounded-card border border-gray-100 p-3 dark:border-waify-dark-border">
                                <p className="text-xs text-waify-text-muted dark:text-waify-dark-text-muted">Owned workspaces</p>
                                <p className="mt-1 text-xl font-bold text-waify-text dark:text-waify-dark-text">{selectedUser.owned_accounts_count ?? 0}</p>
                            </div>
                            <div className="rounded-card border border-gray-100 p-3 dark:border-waify-dark-border">
                                <p className="text-xs text-waify-text-muted dark:text-waify-dark-text-muted">Member workspaces</p>
                                <p className="mt-1 text-xl font-bold text-waify-text dark:text-waify-dark-text">{selectedUser.member_accounts_count ?? 0}</p>
                            </div>
                        </div>
                        {!selectedUser.is_super_admin && selectedUser.id !== auth?.user?.id && (
                            <Button className="w-full" onClick={() => setConfirmImpersonate(selectedUser)}><LogIn className="h-4 w-4" />Impersonate user</Button>
                        )}
                        <div className="grid gap-2 sm:grid-cols-2">
                            {selectedUser.force_password_reset_at ? (
                                <Button variant="secondary" onClick={() => clearPasswordReset(selectedUser)}>
                                    <CheckCircle2 className="h-4 w-4" />
                                    Clear reset
                                </Button>
                            ) : (
                                <Button variant="secondary" onClick={() => forcePasswordReset(selectedUser)}>
                                    <KeyRound className="h-4 w-4" />
                                    Force reset
                                </Button>
                            )}
                            <Button variant="secondary" onClick={() => revokeSessions(selectedUser)}>
                                <RotateCcw className="h-4 w-4" />
                                Revoke sessions
                            </Button>
                        </div>
                    </div>
                )}
            </Drawer>

            <Drawer
                open={Boolean(confirmImpersonate)}
                onClose={() => setConfirmImpersonate(null)}
                title="Impersonate user"
                description={confirmImpersonate?.email}
                className="sm:max-w-md"
                footer={(
                    <div className="flex justify-end gap-2">
                        <Button variant="secondary" onClick={() => setConfirmImpersonate(null)}>Cancel</Button>
                        <Button onClick={handleImpersonate}><LogIn className="h-4 w-4" />Impersonate</Button>
                    </div>
                )}
            >
                <p className="text-sm leading-6 text-waify-text-muted dark:text-waify-dark-text-muted">
                    You will be signed in as this user. Use Stop Impersonation from the user menu to return to the platform panel.
                </p>
            </Drawer>
        </PlatformShell>
    );
}
