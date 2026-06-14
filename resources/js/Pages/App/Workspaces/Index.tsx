import { FormEventHandler, useEffect, useState } from 'react';
import { Head, Link, router, useForm } from '@inertiajs/react';
import AppShell from '@/Layouts/AppShell';
import Button from '@/Components/UI/Button';
import { Badge } from '@/Components/UI/Badge';
import { Card } from '@/Components/UI/Card';
import { Drawer } from '@/Components/UI/Elements';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import { useToast } from '@/hooks/useToast';
import { AlertTriangle, Building2, Check, CheckCircle2, Clock, Crown, Plus, Settings, Shield, Trash2, Users, Zap } from 'lucide-react';

interface Workspace {
    id: number;
    name: string;
    slug: string;
    workspace_type_label: string;
    industry: string | null;
    timezone: string | null;
    status: string;
    role: string | null;
    is_current: boolean;
    users_count: number;
    plan: { name: string; key: string } | null;
    subscription: {
        status: string;
        current_period_end: string | null;
        cancel_at_period_end: boolean;
    } | null;
    can_delete?: boolean;
    delete_blocked_reason?: string | null;
}

interface Plan {
    id: number;
    key: string;
    name: string;
    description?: string;
    price_monthly: number | null;
    currency: string;
    trial_days: number;
    limits: Record<string, any>;
}

export default function WorkspaceIndex({
    workspaces,
    canCreateWorkspace = false,
    showCreatePanel = false,
    plans = [],
    defaultPlanKey = 'starter',
    workspaceTypes = {},
}: {
    workspaces: Workspace[];
    canCreateWorkspace?: boolean;
    showCreatePanel?: boolean;
    plans?: Plan[];
    defaultPlanKey?: string;
    workspaceTypes?: Record<string, string>;
}) {
    const current = workspaces.find((workspace) => workspace.is_current) || workspaces[0];
    const [createOpen, setCreateOpen] = useState(showCreatePanel);
    const [deleteTarget, setDeleteTarget] = useState<Workspace | null>(null);
    const [deleteConfirmation, setDeleteConfirmation] = useState('');
    const [deleting, setDeleting] = useState(false);
    const [selectedPlanKey, setSelectedPlanKey] = useState(defaultPlanKey);
    const { toast } = useToast();
    const { data, setData, post, processing, errors, reset } = useForm({
        name: '',
        workspace_type: 'business',
        industry: '',
        plan_key: defaultPlanKey,
    });

    useEffect(() => {
        setCreateOpen(showCreatePanel);
    }, [showCreatePanel]);

    const switchWorkspace = (workspace: Workspace) => {
        if (workspace.is_current) return;
        router.post(route('app.accounts.switch', { account: workspace.id }) as string);
    };

    const formatDate = (value: string | null) => {
        if (!value) return 'No renewal date';
        return new Intl.DateTimeFormat('en-IN', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
        }).format(new Date(value));
    };

    const statusVariant = (status: string) => {
        if (status === 'active') return 'success';
        if (status === 'trialing') return 'info';
        if (status === 'past_due') return 'warning';
        return 'secondary';
    };

    const accent = (workspace: Workspace) => colorFromName(workspace.name);

    const openCreate = () => {
        setCreateOpen(true);
        router.get(route('app.workspaces.index') as string, { panel: 'create' }, {
            preserveState: true,
            preserveScroll: true,
            replace: true,
        });
    };

    const closeCreate = () => {
        setCreateOpen(false);
        router.get(route('app.workspaces.index') as string, {}, {
            preserveState: true,
            preserveScroll: true,
            replace: true,
        });
    };

    const selectPlan = (planKey: string) => {
        setSelectedPlanKey(planKey);
        setData('plan_key', planKey);
    };

    const submit: FormEventHandler = (event) => {
        event.preventDefault();
        post(route('app.workspaces.store') as string, {
            onSuccess: () => {
                reset();
                setSelectedPlanKey(defaultPlanKey);
                setCreateOpen(false);
            },
            onError: (formErrors) => {
                const firstError = Object.values(formErrors)[0];
                toast.error('Workspace was not created', typeof firstError === 'string' ? firstError : 'Please check the highlighted fields and try again.');
            },
        });
    };

    const openDelete = (workspace: Workspace) => {
        setDeleteTarget(workspace);
        setDeleteConfirmation('');
    };

    const closeDelete = () => {
        if (deleting) return;
        setDeleteTarget(null);
        setDeleteConfirmation('');
    };

    const deleteWorkspace = () => {
        if (!deleteTarget || deleteConfirmation !== deleteTarget.name) return;

        setDeleting(true);
        router.visit(route('app.workspaces.destroy', { account: deleteTarget.id }) as string, {
            method: 'delete',
            data: {
                confirmation_name: deleteConfirmation,
            },
            preserveScroll: true,
            onSuccess: () => {
                toast.success('Workspace deleted');
                setDeleteTarget(null);
                setDeleteConfirmation('');
            },
            onError: (formErrors) => {
                const firstError = Object.values(formErrors)[0];
                toast.error('Workspace was not deleted', typeof firstError === 'string' ? firstError : 'Please check the confirmation and try again.');
            },
            onFinish: () => setDeleting(false),
        });
    };

    return (
        <AppShell>
            <Head title="Workspaces" />
            <div className="module-page">
                <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
                    <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-waify-green-dark">Workspace</p>
                        <h1 className="module-heading">Workspaces</h1>
                        <p className="module-subheading">Switch between brands, clients, branches, and teams.</p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        {canCreateWorkspace && (
                            <Button variant="secondary" onClick={openCreate}>
                                <Plus className="h-4 w-4" />
                                New workspace
                            </Button>
                        )}
                        <Link href={route('app.team.index') as string}>
                            <Button>
                                <Users className="h-4 w-4" />
                                Invite member
                            </Button>
                        </Link>
                    </div>
                </div>

                <div className="grid gap-6 lg:grid-cols-3">
                    <Card className="overflow-hidden p-0 lg:col-span-2">
                        <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4 dark:border-waify-dark-border">
                            <h2 className="font-semibold text-waify-text dark:text-waify-dark-text">Your workspaces</h2>
                            <span className="text-xs text-waify-text-muted dark:text-waify-dark-text-muted">{workspaces.length} active</span>
                        </div>
                        <ul className="divide-y divide-gray-100 dark:divide-waify-dark-border">
                            {workspaces.map((workspace) => (
                                <li
                                    key={workspace.id}
                                    className={`flex flex-col gap-4 px-5 py-4 transition sm:flex-row sm:items-center ${
                                        workspace.is_current ? 'bg-waify-green/5' : 'hover:bg-gray-50/80 dark:hover:bg-waify-dark-surface-2/50'
                                    }`}
                                >
                                    <div className="flex min-w-0 flex-1 items-start gap-4">
                                        <span
                                            className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl text-base font-bold text-white"
                                            style={{ background: accent(workspace) }}
                                        >
                                            {workspace.name.charAt(0).toUpperCase()}
                                        </span>
                                        <div className="min-w-0 flex-1">
                                            <div className="flex flex-wrap items-center gap-2">
                                                <span className="font-semibold text-waify-text dark:text-waify-dark-text">{workspace.name}</span>
                                                {workspace.is_current && <Badge variant="success">Current</Badge>}
                                                <Badge variant={workspace.status === 'active' ? 'success' : 'secondary'}>{workspace.status}</Badge>
                                            </div>
                                            <p className="mt-0.5 text-sm text-waify-text-muted dark:text-waify-dark-text-muted">
                                                {workspace.workspace_type_label}
                                                {workspace.industry ? ` · ${workspace.industry}` : ''}
                                                {workspace.timezone ? ` · ${workspace.timezone}` : ''}
                                            </p>
                                            <div className="mt-2 flex flex-wrap gap-2">
                                                <Badge variant="secondary">{workspace.plan?.name ?? 'No plan'}</Badge>
                                                <Badge variant="secondary">{workspace.role ?? 'member'}</Badge>
                                                <Badge variant="secondary">{workspace.users_count} members</Badge>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex flex-shrink-0 flex-wrap justify-end gap-2">
                                        {workspace.is_current && ['owner', 'admin'].includes(workspace.role ?? '') && (
                                            <Link href={route('app.settings') as string}>
                                                <Button variant="secondary" size="sm">
                                                    <Settings className="h-4 w-4" />
                                                    Settings
                                                </Button>
                                            </Link>
                                        )}
                                        <Button
                                            variant="danger"
                                            size="sm"
                                            disabled={!workspace.can_delete}
                                            title={!workspace.can_delete ? workspace.delete_blocked_reason || 'This workspace cannot be deleted.' : undefined}
                                            onClick={() => openDelete(workspace)}
                                        >
                                            <Trash2 className="h-4 w-4" />
                                            Delete
                                        </Button>
                                        <Button
                                            variant={workspace.is_current ? 'secondary' : 'primary'}
                                            size="sm"
                                            disabled={workspace.is_current}
                                            onClick={() => switchWorkspace(workspace)}
                                        >
                                            {workspace.is_current ? 'Active' : 'Switch'}
                                        </Button>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    </Card>

                    {current && (
                        <Card className="h-fit p-5">
                            <h2 className="mb-4 font-semibold text-waify-text dark:text-waify-dark-text">Active workspace</h2>
                            <div className="mb-5 flex items-center gap-3">
                                <span
                                    className="flex h-12 w-12 items-center justify-center rounded-xl text-lg font-bold text-white"
                                    style={{ background: accent(current) }}
                                >
                                    {current.name.charAt(0).toUpperCase()}
                                </span>
                                <div className="min-w-0">
                                    <div className="truncate font-semibold text-waify-text dark:text-waify-dark-text">{current.name}</div>
                                    <div className="truncate text-sm text-waify-text-muted dark:text-waify-dark-text-muted">{current.slug}</div>
                                </div>
                            </div>
                            <dl className="space-y-3 text-sm">
                                {[
                                    ['Plan', current.plan?.name ?? 'No plan'],
                                    ['Your role', current.role ?? 'member'],
                                    ['Team size', `${current.users_count} members`],
                                    ['Workspace type', current.workspace_type_label],
                                ].map(([label, value]) => (
                                    <div key={label} className="flex justify-between gap-4">
                                        <dt className="text-waify-text-muted dark:text-waify-dark-text-muted">{label}</dt>
                                        <dd className="font-medium text-waify-text dark:text-waify-dark-text">{value}</dd>
                                    </div>
                                ))}
                            </dl>
                            {current.subscription && (
                                <div className="mt-5 rounded-card bg-gray-50 p-4 dark:bg-waify-dark-surface-2">
                                    <div className="mb-2 flex items-center justify-between gap-3">
                                        <Badge variant={statusVariant(current.subscription.status)}>{current.subscription.status}</Badge>
                                        <Clock className="h-4 w-4 text-waify-text-muted" />
                                    </div>
                                    <p className="text-xs text-waify-text-muted dark:text-waify-dark-text-muted">
                                        {current.subscription.cancel_at_period_end ? 'Ends' : 'Renews'} {formatDate(current.subscription.current_period_end)}
                                    </p>
                                </div>
                            )}
                            <div className="mt-5 grid gap-2">
                                <Link href={route('app.team.index') as string}>
                                    <Button className="w-full" variant="secondary">
                                        <Shield className="h-4 w-4" />
                                        Roles & permissions
                                    </Button>
                                </Link>
                                <Link href={route('app.billing.index') as string}>
                                    <Button className="w-full" variant="secondary">
                                        Billing overview
                                    </Button>
                                </Link>
                                <div className="rounded-card border border-red-200 bg-red-50 p-3 dark:border-red-900/60 dark:bg-red-950/30">
                                    <div className="mb-2 flex items-start gap-2 text-sm text-red-800 dark:text-red-200">
                                        <AlertTriangle className="mt-0.5 h-4 w-4 flex-shrink-0" />
                                        <div>
                                            <div className="font-semibold">Danger zone</div>
                                            <p className="text-xs opacity-90">Delete this workspace and its data.</p>
                                        </div>
                                    </div>
                                    <Button
                                        className="w-full"
                                        variant="danger"
                                        size="sm"
                                        disabled={!current.can_delete}
                                        title={!current.can_delete ? current.delete_blocked_reason || 'This workspace cannot be deleted.' : undefined}
                                        onClick={() => openDelete(current)}
                                    >
                                        <Trash2 className="h-4 w-4" />
                                        Delete workspace
                                    </Button>
                                    {!current.can_delete && current.delete_blocked_reason && (
                                        <p className="mt-2 text-xs text-red-700 dark:text-red-200">{current.delete_blocked_reason}</p>
                                    )}
                                </div>
                            </div>
                        </Card>
                    )}
                </div>

                <Card className="overflow-hidden p-0">
                    <div className="border-b border-gray-100 px-5 py-4 dark:border-waify-dark-border">
                        <h2 className="font-semibold text-waify-text dark:text-waify-dark-text">Workspace directory</h2>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="bg-gray-50/70 text-left text-[11px] uppercase tracking-wider text-waify-text-muted dark:bg-waify-dark-surface-2/70 dark:text-waify-dark-text-muted">
                                    <th className="px-5 py-3 font-medium">Workspace</th>
                                    <th className="px-5 py-3 font-medium">Role</th>
                                    <th className="px-5 py-3 font-medium">Plan</th>
                                    <th className="px-5 py-3 font-medium">Status</th>
                                    <th className="px-5 py-3 text-right font-medium">Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {workspaces.map((workspace) => (
                                    <tr key={workspace.id} className="border-t border-gray-100 dark:border-waify-dark-border">
                                        <td className="px-5 py-3">
                                            <div className="flex items-center gap-2">
                                                <Building2 className="h-4 w-4 text-waify-text-muted" />
                                                <span className="font-medium text-waify-text dark:text-waify-dark-text">{workspace.name}</span>
                                                {workspace.is_current && <CheckCircle2 className="h-4 w-4 text-waify-green" />}
                                            </div>
                                        </td>
                                        <td className="px-5 py-3 capitalize text-waify-text-muted dark:text-waify-dark-text-muted">{workspace.role ?? 'member'}</td>
                                        <td className="px-5 py-3 text-waify-text-muted dark:text-waify-dark-text-muted">{workspace.plan?.name ?? 'No plan'}</td>
                                        <td className="px-5 py-3"><Badge variant={workspace.status === 'active' ? 'success' : 'secondary'}>{workspace.status}</Badge></td>
                                        <td className="px-5 py-3 text-right">
                                            <div className="flex justify-end gap-2">
                                                <Button
                                                    size="sm"
                                                    variant="danger"
                                                    disabled={!workspace.can_delete}
                                                    title={!workspace.can_delete ? workspace.delete_blocked_reason || 'This workspace cannot be deleted.' : undefined}
                                                    onClick={() => openDelete(workspace)}
                                                >
                                                    Delete
                                                </Button>
                                                <Button size="sm" variant="secondary" disabled={workspace.is_current} onClick={() => switchWorkspace(workspace)}>
                                                    {workspace.is_current ? 'Current' : 'Switch'}
                                                </Button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </Card>
            </div>

            <Drawer
                open={createOpen && canCreateWorkspace}
                onClose={closeCreate}
                title="Create workspace"
                description="Separate WhatsApp numbers, templates, contacts, campaigns, billing, and team access."
                className="sm:max-w-4xl"
                footer={
                    <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                        <Button type="button" variant="secondary" onClick={closeCreate}>
                            Cancel
                        </Button>
                        <Button type="submit" form="workspace-create-form" disabled={processing || !data.name.trim()}>
                            {processing ? 'Creating...' : 'Create workspace'}
                        </Button>
                    </div>
                }
            >
                <form id="workspace-create-form" onSubmit={submit} className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_280px]">
                    <div className="space-y-5">
                        <Card className="p-5">
                            <div className="flex items-center gap-3">
                                <div className="flex h-10 w-10 items-center justify-center rounded-card bg-waify-green-soft text-waify-green-dark dark:bg-waify-dark-green-soft dark:text-emerald-200">
                                    <Building2 className="h-5 w-5" />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-waify-text dark:text-waify-dark-text">Workspace details</h3>
                                    <p className="text-sm text-waify-text-muted dark:text-waify-dark-text-muted">Name this business, client, branch, or project workspace.</p>
                                </div>
                            </div>
                            <div className="mt-5 grid gap-4 md:grid-cols-2">
                                {Object.keys(errors).length > 0 && (
                                    <div className="md:col-span-2 rounded-card border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-900/60 dark:bg-red-950/30 dark:text-red-200">
                                        {Object.values(errors)[0] || 'Please check the highlighted fields and try again.'}
                                    </div>
                                )}
                                <div className="md:col-span-2">
                                    <InputLabel htmlFor="workspace-name" value="Workspace name" />
                                    <TextInput
                                        id="workspace-name"
                                        type="text"
                                        value={data.name}
                                        className="mt-1 block w-full"
                                        onChange={(event) => setData('name', event.target.value)}
                                        required
                                        placeholder="Example: Mumbai Retail Team"
                                    />
                                    <InputError message={errors.name} className="mt-2" />
                                </div>

                                <div>
                                    <InputLabel htmlFor="workspace-type" value="Workspace type" />
                                    <select
                                        id="workspace-type"
                                        value={data.workspace_type}
                                        onChange={(event) => setData('workspace_type', event.target.value)}
                                        className="waify-input mt-1 block w-full"
                                        required
                                    >
                                        {Object.entries(workspaceTypes).map(([value, label]) => (
                                            <option key={value} value={value}>
                                                {label}
                                            </option>
                                        ))}
                                    </select>
                                    <InputError message={errors.workspace_type} className="mt-2" />
                                </div>

                                <div>
                                    <InputLabel htmlFor="workspace-industry" value="Industry" />
                                    <TextInput
                                        id="workspace-industry"
                                        type="text"
                                        value={data.industry}
                                        className="mt-1 block w-full"
                                        onChange={(event) => setData('industry', event.target.value)}
                                        placeholder="Retail, healthcare, education..."
                                    />
                                    <InputError message={errors.industry} className="mt-2" />
                                </div>

                            </div>
                        </Card>

                        {plans.length > 0 && (
                            <Card className="p-5">
                                <h3 className="font-semibold text-waify-text dark:text-waify-dark-text">Starting plan</h3>
                                <p className="mt-1 text-sm text-waify-text-muted dark:text-waify-dark-text-muted">You can change this later from billing.</p>
                                <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                                    {plans.map((plan) => {
                                        const Icon = planIcon(plan.key);
                                        const selected = selectedPlanKey === plan.key;
                                        const connectionLimit = plan.limits?.whatsapp_connections ?? plan.limits?.connections;

                                        return (
                                            <button
                                                key={plan.id}
                                                type="button"
                                                onClick={() => selectPlan(plan.key)}
                                                className={`rounded-card border bg-white p-4 text-left shadow-card transition hover:-translate-y-0.5 hover:shadow-card-lg dark:bg-waify-dark-surface-2 ${
                                                    selected
                                                        ? 'border-waify-green ring-2 ring-waify-green'
                                                        : 'border-gray-200 hover:border-gray-300 dark:border-waify-dark-border'
                                                }`}
                                            >
                                                <div className="flex items-start justify-between gap-3">
                                                    <div className="flex items-center gap-3">
                                                        <span className="flex h-9 w-9 items-center justify-center rounded-md bg-waify-green-soft text-waify-green-dark dark:bg-emerald-900/30 dark:text-emerald-300">
                                                            <Icon className="h-5 w-5" />
                                                        </span>
                                                        <div>
                                                            <div className="font-semibold text-waify-text dark:text-waify-dark-text">{plan.name}</div>
                                                            <div className="text-sm text-waify-text-muted dark:text-waify-dark-text-muted">
                                                                {formatPrice(plan.price_monthly, plan.currency)} / month
                                                            </div>
                                                        </div>
                                                    </div>
                                                    {selected && <Check className="h-4 w-4 text-waify-green" />}
                                                </div>
                                                {plan.description && <p className="mt-3 line-clamp-2 text-sm text-waify-text-muted dark:text-waify-dark-text-muted">{plan.description}</p>}
                                                <div className="mt-3 space-y-1.5 text-xs text-waify-text-muted dark:text-waify-dark-text-muted">
                                                    {connectionLimit !== undefined && <p>{connectionLimit === -1 ? '1' : connectionLimit} WhatsApp connection per workspace</p>}
                                                    {plan.limits?.messages_monthly !== undefined && (
                                                        <p>
                                                            {plan.limits.messages_monthly === -1 ? 'Unlimited' : Number(plan.limits.messages_monthly).toLocaleString()} messages/month
                                                        </p>
                                                    )}
                                                </div>
                                            </button>
                                        );
                                    })}
                                </div>
                            </Card>
                        )}
                    </div>

                    <aside className="space-y-4">
                        <Card className="p-5">
                            <h3 className="font-semibold text-waify-text dark:text-waify-dark-text">Preview</h3>
                            <div className="mt-4 flex items-center gap-3">
                                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-waify-green text-lg font-bold text-white">
                                    {(data.name || 'W').charAt(0).toUpperCase()}
                                </div>
                                <div className="min-w-0">
                                    <div className="truncate font-semibold text-waify-text dark:text-waify-dark-text">{data.name || 'New workspace'}</div>
                                    <div className="truncate text-sm text-waify-text-muted dark:text-waify-dark-text-muted">{data.industry || 'No industry set'}</div>
                                </div>
                            </div>
                            <dl className="mt-5 space-y-3 text-sm">
                                {[
                                    ['Type', workspaceTypes[data.workspace_type] ?? data.workspace_type],
                                    ['Plan', plans.find((plan) => plan.key === data.plan_key)?.name ?? data.plan_key],
                                ].map(([label, value]) => (
                                    <div key={label} className="flex justify-between gap-4">
                                        <dt className="text-waify-text-muted dark:text-waify-dark-text-muted">{label}</dt>
                                        <dd className="text-right font-medium text-waify-text dark:text-waify-dark-text">{value}</dd>
                                    </div>
                                ))}
                            </dl>
                        </Card>
                        <Card className="p-5">
                            <h3 className="font-semibold text-waify-text dark:text-waify-dark-text">Separated by workspace</h3>
                            <ul className="mt-4 space-y-2.5 text-sm text-waify-text-muted dark:text-waify-dark-text-muted">
                                {['WhatsApp numbers', 'Templates and campaigns', 'Contacts and segments', 'Billing and usage'].map((item) => (
                                    <li key={item} className="flex items-center gap-2">
                                        <Check className="h-4 w-4 text-waify-green" />
                                        {item}
                                    </li>
                                ))}
                            </ul>
                        </Card>
                    </aside>
                </form>
            </Drawer>

            <Drawer
                open={Boolean(deleteTarget)}
                onClose={closeDelete}
                title="Delete workspace"
                description="This permanently removes the workspace and its contacts, conversations, campaigns, automations, integrations, billing records, and uploaded assets."
                className="sm:max-w-lg"
                footer={
                    <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                        <Button type="button" variant="secondary" onClick={closeDelete} disabled={deleting}>
                            Cancel
                        </Button>
                        <Button
                            type="button"
                            variant="danger"
                            disabled={deleting || !deleteTarget || deleteConfirmation !== deleteTarget.name}
                            onClick={deleteWorkspace}
                        >
                            {deleting ? 'Deleting...' : 'Delete workspace'}
                        </Button>
                    </div>
                }
            >
                {deleteTarget && (
                    <div className="space-y-5">
                        <div className="rounded-card border border-red-200 bg-red-50 p-4 text-sm text-red-800 dark:border-red-900/60 dark:bg-red-950/30 dark:text-red-200">
                            <div className="flex items-start gap-3">
                                <AlertTriangle className="mt-0.5 h-5 w-5 flex-shrink-0" />
                                <div>
                                    <p className="font-semibold">This action cannot be undone.</p>
                                    <p className="mt-1">
                                        Deleting <strong>{deleteTarget.name}</strong> will remove all workspace data tied to it. Use this only when the workspace is no longer needed.
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div>
                            <InputLabel htmlFor="delete-workspace-confirmation" value={`Type "${deleteTarget.name}" to confirm`} />
                            <TextInput
                                id="delete-workspace-confirmation"
                                type="text"
                                value={deleteConfirmation}
                                className="mt-1 block w-full"
                                onChange={(event) => setDeleteConfirmation(event.target.value)}
                                autoFocus
                            />
                        </div>
                    </div>
                )}
            </Drawer>
        </AppShell>
    );
}

function colorFromName(name: string) {
    const colors = ['#00A548', '#128C7E', '#2563EB', '#7C3AED', '#DB2777', '#EA580C'];
    const sum = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return colors[sum % colors.length];
}

function formatPrice(amount: number | null, currency = 'INR') {
    if (amount === null || amount === undefined) {
        return 'Custom';
    }

    if (amount === 0) {
        return '₹0';
    }

    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: currency || 'INR',
        minimumFractionDigits: 0,
    }).format(amount / 100);
}

function planIcon(key: string) {
    switch (key.toLowerCase()) {
        case 'starter':
            return Zap;
        case 'pro':
            return Building2;
        case 'enterprise':
            return Crown;
        default:
            return Users;
    }
}
