import { Head, router, usePage } from '@inertiajs/react';
import { useEffect, useMemo, useState } from 'react';
import PlatformShell from '@/Layouts/PlatformShell';
import { Card, CardContent } from '@/Components/UI/Card';
import { Badge } from '@/Components/UI/Badge';
import Button from '@/Components/UI/Button';
import TextInput from '@/Components/TextInput';
import { Drawer, ThemedIconTile } from '@/Components/UI/Elements';
import {
    AlertTriangle,
    Boxes,
    CheckCircle2,
    Crown,
    Edit3,
    Gauge,
    Layers,
    Lock,
    PackageCheck,
    Puzzle,
    RefreshCw,
    Search,
    ShieldCheck,
    ToggleLeft,
    ToggleRight,
    Users,
    Workflow,
    XCircle,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { useToast } from '@/hooks/useToast';
import { useConfirm } from '@/hooks/useConfirm';
import { cn } from '@/lib/utils';

interface Module {
    id: number;
    key: string;
    name: string;
    description: string | null;
    is_core: boolean;
    is_enabled: boolean;
    account_count: number;
}

type BadgeVariant = 'success' | 'warning' | 'info' | 'secondary';
type MetricItem = [string, number, LucideIcon, BadgeVariant];

const categoryMeta: Record<string, { label: string; description: string; icon: typeof Layers; tone: 'green' | 'blue' | 'amber' | 'purple' | 'pink' | 'red' | 'gray' }> = {
    all: { label: 'All modules', description: 'Everything installed', icon: Boxes, tone: 'green' },
    core: { label: 'Core', description: 'Locked platform base', icon: Crown, tone: 'amber' },
    whatsapp: { label: 'WhatsApp', description: 'Meta messaging stack', icon: ShieldCheck, tone: 'green' },
    automation: { label: 'Automation', description: 'Bots and workflows', icon: Workflow, tone: 'purple' },
    audience: { label: 'Audience', description: 'Contacts and campaigns', icon: Users, tone: 'blue' },
    billing: { label: 'Billing', description: 'Plans and wallet controls', icon: Gauge, tone: 'pink' },
    support: { label: 'Support', description: 'Tickets and helpdesk', icon: CheckCircle2, tone: 'blue' },
    platform: { label: 'Platform', description: 'General capabilities', icon: Puzzle, tone: 'gray' },
    disabled: { label: 'Disabled', description: 'Unavailable modules', icon: XCircle, tone: 'red' },
};

function moduleCategory(module: Module) {
    if (module.is_core) return 'core';
    if (module.key.includes('whatsapp') || module.key.includes('template')) return 'whatsapp';
    if (module.key.includes('automation') || module.key.includes('chatbot')) return 'automation';
    if (module.key.includes('contact') || module.key.includes('broadcast')) return 'audience';
    if (module.key.includes('billing') || module.key.includes('wallet')) return 'billing';
    if (module.key.includes('support')) return 'support';
    return 'platform';
}

function adoptionPercent(module: Module, maxAccounts: number) {
    return Math.round((module.account_count / Math.max(1, maxAccounts)) * 100);
}

function Meter({ value, tone = 'green' }: { value: number; tone?: 'green' | 'amber' | 'red' }) {
    const colors = {
        green: 'bg-waify-green dark:bg-emerald-300',
        amber: 'bg-amber-500 dark:bg-amber-300',
        red: 'bg-red-500 dark:bg-red-300',
    };

    return (
        <div className="h-2 overflow-hidden rounded-full bg-gray-100 dark:bg-waify-dark-surface-2">
            <div className={cn('h-full rounded-full transition-all', colors[tone])} style={{ width: `${Math.max(0, Math.min(100, value))}%` }} />
        </div>
    );
}

function ModuleDrawer({ module, maxAccounts, onClose }: { module: Module | null; maxAccounts: number; onClose: () => void }) {
    const { addToast } = useToast();
    const [form, setForm] = useState({
        name: '',
        description: '',
        is_enabled: true,
    });

    useEffect(() => {
        if (!module) return;
        setForm({
            name: module.name,
            description: module.description || '',
            is_enabled: module.is_enabled,
        });
    }, [module]);

    if (!module) return null;

    const category = moduleCategory(module);
    const meta = categoryMeta[category];
    const adoption = adoptionPercent(module, maxAccounts);

    const save = () => {
        router.patch(route('platform.modules.update', { module: module.id }), form, {
            preserveScroll: true,
            onSuccess: () => {
                addToast({ title: 'Module updated', variant: 'success' });
                onClose();
            },
            onError: () => addToast({ title: 'Failed to update module', variant: 'error' }),
        });
    };

    return (
        <Drawer
            open
            onClose={onClose}
            title={module.name}
            description={module.key}
            className="sm:max-w-xl"
            footer={(
                <div className="flex justify-end gap-2">
                    <Button type="button" variant="secondary" onClick={onClose}>Cancel</Button>
                    <Button type="button" onClick={save}>Save module</Button>
                </div>
            )}
        >
            <div className="space-y-5">
                <div className="rounded-card border border-gray-100 bg-gray-50 p-4 dark:border-waify-dark-border dark:bg-waify-dark-surface-2">
                    <div className="flex items-start gap-3">
                        <ThemedIconTile tone={meta.tone} size="lg">
                            <meta.icon className="h-5 w-5" />
                        </ThemedIconTile>
                        <div className="min-w-0 flex-1">
                            <div className="flex flex-wrap gap-2">
                                <Badge variant={module.is_enabled ? 'success' : 'secondary'}>{module.is_enabled ? 'Enabled' : 'Disabled'}</Badge>
                                <Badge variant={module.is_core ? 'warning' : 'info'}>{meta.label}</Badge>
                            </div>
                            <p className="mt-2 text-sm text-waify-text-muted dark:text-waify-dark-text-muted">
                                {module.account_count} workspace entitlement{module.account_count === 1 ? '' : 's'} use this module.
                            </p>
                            <div className="mt-3">
                                <Meter value={adoption} tone={module.is_enabled ? 'green' : 'red'} />
                            </div>
                        </div>
                    </div>
                </div>

                <div>
                    <label className="mb-1.5 block text-sm font-medium text-waify-text dark:text-waify-dark-text">Module name</label>
                    <TextInput value={form.name} onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))} className="w-full" />
                </div>

                <div>
                    <label className="mb-1.5 block text-sm font-medium text-waify-text dark:text-waify-dark-text">Description</label>
                    <textarea
                        value={form.description}
                        onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))}
                        rows={5}
                        className="w-full rounded-btn border border-gray-200 bg-white px-3 py-2 text-sm text-waify-text outline-none focus:border-waify-green focus:ring-2 focus:ring-waify-green/20 dark:border-waify-dark-border dark:bg-waify-dark-surface dark:text-waify-dark-text"
                    />
                </div>

                <label className="flex items-center justify-between gap-4 rounded-card border border-gray-100 p-4 dark:border-waify-dark-border">
                    <span>
                        <span className="block text-sm font-semibold text-waify-text dark:text-waify-dark-text">Available platform-wide</span>
                        <span className="text-xs text-waify-text-muted dark:text-waify-dark-text-muted">Turning this off blocks assignment and access for all workspaces.</span>
                    </span>
                    <input
                        type="checkbox"
                        checked={form.is_enabled}
                        disabled={module.is_core}
                        onChange={(event) => setForm((current) => ({ ...current, is_enabled: event.target.checked }))}
                        className="h-4 w-4 rounded border-gray-300 text-waify-green focus:ring-waify-green disabled:opacity-40"
                    />
                </label>

                {module.is_core && (
                    <div className="rounded-card border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900 dark:border-amber-400/25 dark:bg-amber-500/10 dark:text-amber-100">
                        Core modules are part of the platform base and cannot be disabled.
                    </div>
                )}
            </div>
        </Drawer>
    );
}

export default function PlatformModulesIndex({ modules }: { modules: Module[] }) {
    const { auth } = usePage().props as any;
    const { addToast } = useToast();
    const confirm = useConfirm();
    const [query, setQuery] = useState('');
    const [scope, setScope] = useState('all');
    const [editing, setEditing] = useState<Module | null>(null);

    const maxAccounts = Math.max(1, ...modules.map((module) => module.account_count));
    const enabledCount = modules.filter((module) => module.is_enabled).length;
    const coreCount = modules.filter((module) => module.is_core).length;
    const disabledCount = modules.filter((module) => !module.is_enabled).length;
    const workspaceLinks = modules.reduce((sum, module) => sum + module.account_count, 0);

    const categories = useMemo(() => {
        const present = Array.from(new Set(modules.map(moduleCategory)));
        return ['all', ...present, 'disabled'];
    }, [modules]);

    const categoryCounts = useMemo(() => {
        const counts: Record<string, number> = { all: modules.length, disabled: disabledCount };
        modules.forEach((module) => {
            const category = moduleCategory(module);
            counts[category] = (counts[category] || 0) + 1;
        });
        return counts;
    }, [modules, disabledCount]);

    const filtered = useMemo(() => modules.filter((module) => {
        const q = query.trim().toLowerCase();
        const matchesQuery = !q || module.name.toLowerCase().includes(q) || module.key.toLowerCase().includes(q) || (module.description || '').toLowerCase().includes(q);
        const matchesScope = scope === 'all'
            || (scope === 'disabled' && !module.is_enabled)
            || moduleCategory(module) === scope;

        return matchesQuery && matchesScope;
    }), [modules, query, scope]);

    const featured = useMemo(() => [...modules].sort((a, b) => b.account_count - a.account_count).slice(0, 3), [modules]);
    const highestRisk = filtered.filter((module) => !module.is_core && !module.is_enabled).slice(0, 4);

    const handleToggle = async (module: Module) => {
        if (module.is_core) {
            addToast({ title: 'Core module locked', description: 'Core modules cannot be disabled at platform level.', variant: 'error' });
            return;
        }

        const action = module.is_enabled ? 'disable' : 'enable';
        const confirmed = await confirm({
            title: `${action === 'enable' ? 'Enable' : 'Disable'} module?`,
            message: `${module.name} will be ${action}d for the whole platform.`,
            variant: action === 'enable' ? 'info' : 'warning',
        });

        if (!confirmed) return;

        router.post(route('platform.modules.toggle', { module: module.id }), {}, {
            preserveScroll: true,
            onSuccess: () => addToast({ title: 'Module updated', variant: 'success' }),
            onError: () => addToast({ title: 'Failed to update module', variant: 'error' }),
        });
    };

    return (
        <PlatformShell auth={auth}>
            <Head title="Modules" />
            <div className="space-y-6">
                <section className="overflow-hidden rounded-card border border-gray-100 bg-white shadow-card dark:border-waify-dark-border dark:bg-waify-dark-surface dark:shadow-none">
                    <div className="grid gap-0 lg:grid-cols-[1.15fr_0.85fr]">
                        <div className="p-5 sm:p-6">
                            <div className="flex flex-wrap items-start justify-between gap-4">
                                <div>
                                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-waify-green dark:text-emerald-300">Capability control</p>
                                    <h1 className="mt-2 text-2xl font-bold text-waify-text dark:text-waify-dark-text">Modules</h1>
                                    <p className="mt-2 max-w-2xl text-sm text-waify-text-muted dark:text-waify-dark-text-muted">
                                        Control platform-wide feature availability, review workspace adoption, and keep core capabilities locked.
                                    </p>
                                </div>
                                <Button type="button" variant="secondary" onClick={() => router.reload()}>
                                    <RefreshCw className="h-4 w-4" />
                                    Refresh
                                </Button>
                            </div>

                            <div className="mt-6 grid gap-3 sm:grid-cols-4">
                                {([
                                    ['Total', modules.length, Layers, 'success' as const],
                                    ['Enabled', enabledCount, PackageCheck, 'info' as const],
                                    ['Core', coreCount, Crown, 'warning' as const],
                                    ['Links', workspaceLinks, Users, 'secondary' as const],
                                ] satisfies MetricItem[]).map(([label, value, Icon, variant]) => (
                                    <div key={label} className="rounded-card border border-gray-100 bg-gray-50/80 p-4 dark:border-waify-dark-border dark:bg-waify-dark-surface-2/60">
                                        <div className="flex items-center justify-between gap-3">
                                            <div>
                                                <div className="text-[11px] font-medium uppercase tracking-[0.12em] text-waify-text-muted dark:text-waify-dark-text-muted">{label}</div>
                                                <div className="mt-1 text-2xl font-bold tabular-nums text-waify-text dark:text-waify-dark-text">{value}</div>
                                            </div>
                                            <Badge variant={variant}>{label}</Badge>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="border-t border-gray-100 bg-gray-50/70 p-5 dark:border-waify-dark-border dark:bg-waify-dark-surface-2/60 lg:border-l lg:border-t-0 sm:p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h2 className="text-sm font-semibold text-waify-text dark:text-waify-dark-text">Most adopted</h2>
                                    <p className="mt-1 text-xs text-waify-text-muted dark:text-waify-dark-text-muted">Top workspace entitlement usage</p>
                                </div>
                                <Gauge className="h-5 w-5 text-waify-green dark:text-emerald-300" />
                            </div>
                            <div className="mt-4 space-y-3">
                                {featured.map((module) => (
                                    <div key={module.id}>
                                        <div className="mb-1 flex items-center justify-between gap-3 text-xs">
                                            <span className="truncate font-medium text-waify-text dark:text-waify-dark-text">{module.name}</span>
                                            <span className="tabular-nums text-waify-text-muted dark:text-waify-dark-text-muted">{module.account_count}</span>
                                        </div>
                                        <Meter value={adoptionPercent(module, maxAccounts)} />
                                    </div>
                                ))}
                            </div>
                            <div className="mt-5 rounded-card border border-amber-100 bg-amber-50 p-3 text-xs text-amber-900 dark:border-amber-400/20 dark:bg-amber-500/10 dark:text-amber-100">
                                <div className="flex gap-2">
                                    <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
                                    <span>Disabling add-on modules affects assignment and access across all workspaces. Core modules stay locked.</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                <div className="grid gap-5 lg:grid-cols-[260px_1fr]">
                    <aside className="space-y-4">
                        <Card className="p-2 lg:sticky lg:top-6">
                            <div className="space-y-1">
                                {categories.map((category) => {
                                    const meta = categoryMeta[category] || categoryMeta.platform;
                                    const Icon = meta.icon;
                                    const isActive = scope === category;
                                    return (
                                        <button
                                            key={category}
                                            type="button"
                                            onClick={() => setScope(category)}
                                            className={cn(
                                                'flex w-full items-center gap-3 rounded-btn px-3 py-2.5 text-left transition',
                                                isActive
                                                    ? 'bg-waify-green-soft text-waify-green-dark dark:bg-emerald-950/40 dark:text-emerald-300'
                                                    : 'text-waify-text-muted hover:bg-gray-50 hover:text-waify-text dark:text-waify-dark-text-muted dark:hover:bg-slate-700/50 dark:hover:text-waify-dark-text'
                                            )}
                                        >
                                            <span className={cn('flex h-8 w-8 shrink-0 items-center justify-center rounded-lg', isActive ? 'bg-white/80 dark:bg-waify-dark-surface' : 'bg-gray-100 dark:bg-waify-dark-surface-2')}>
                                                <Icon className="h-4 w-4" />
                                            </span>
                                            <span className="min-w-0 flex-1">
                                                <span className="block truncate text-sm font-medium">{meta.label}</span>
                                                <span className="block truncate text-[11px] opacity-80">{meta.description}</span>
                                            </span>
                                            <span className="rounded-full bg-white px-2 py-0.5 text-[11px] font-semibold text-waify-text-muted ring-1 ring-gray-100 dark:bg-waify-dark-surface dark:text-waify-dark-text-muted dark:ring-waify-dark-border">
                                                {categoryCounts[category] || 0}
                                            </span>
                                        </button>
                                    );
                                })}
                            </div>
                        </Card>

                        <Card>
                            <CardContent className="p-4">
                                <h3 className="text-sm font-semibold text-waify-text dark:text-waify-dark-text">Needs review</h3>
                                <p className="mt-1 text-xs text-waify-text-muted dark:text-waify-dark-text-muted">Disabled add-ons in current filter</p>
                                <div className="mt-4 space-y-2">
                                    {highestRisk.length === 0 ? (
                                        <div className="rounded-card bg-emerald-50 p-3 text-xs text-emerald-800 dark:bg-emerald-400/10 dark:text-emerald-100">
                                            No disabled add-ons here.
                                        </div>
                                    ) : highestRisk.map((module) => (
                                        <button
                                            key={module.id}
                                            type="button"
                                            onClick={() => setEditing(module)}
                                            className="flex w-full items-center justify-between gap-3 rounded-btn px-2 py-2 text-left hover:bg-gray-50 dark:hover:bg-waify-dark-surface-2"
                                        >
                                            <span className="truncate text-xs font-medium text-waify-text dark:text-waify-dark-text">{module.name}</span>
                                            <Badge variant="danger">Off</Badge>
                                        </button>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    </aside>

                    <main className="min-w-0 space-y-4">
                        <div className="flex flex-col gap-3 rounded-card border border-gray-100 bg-white p-3 shadow-card dark:border-waify-dark-border dark:bg-waify-dark-surface dark:shadow-none sm:flex-row sm:items-center sm:justify-between">
                            <div className="relative w-full sm:max-w-md">
                                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-waify-text-muted dark:text-waify-dark-text-muted" />
                                <input
                                    value={query}
                                    onChange={(event) => setQuery(event.target.value)}
                                    placeholder="Search module name, key, or description..."
                                    className="h-10 w-full rounded-btn border border-waify-border bg-white pl-10 pr-3 text-sm outline-none focus:ring-2 focus:ring-waify-green/20 dark:border-waify-dark-border dark:bg-waify-dark-surface-2 dark:text-waify-dark-text"
                                />
                            </div>
                            <div className="text-sm text-waify-text-muted dark:text-waify-dark-text-muted">
                                {filtered.length} of {modules.length} modules
                            </div>
                        </div>

                        <div className="grid gap-4 xl:grid-cols-2">
                            {filtered.map((module) => {
                                const category = moduleCategory(module);
                                const meta = categoryMeta[category];
                                const Icon = meta.icon;
                                const adoption = adoptionPercent(module, maxAccounts);
                                const meterTone = !module.is_enabled ? 'red' : module.is_core ? 'amber' : 'green';

                                return (
                                    <article
                                        key={module.id}
                                        className={cn(
                                            'group relative overflow-hidden rounded-card border bg-white shadow-card transition dark:bg-waify-dark-surface dark:shadow-none',
                                            module.is_enabled
                                                ? 'border-gray-100 hover:border-waify-green/40 dark:border-waify-dark-border dark:hover:border-emerald-400/40'
                                                : 'border-red-100 bg-red-50/20 hover:border-red-200 dark:border-red-400/20 dark:bg-red-500/5'
                                        )}
                                    >
                                        <div className={cn('absolute inset-y-0 left-0 w-1', module.is_enabled ? 'bg-waify-green' : 'bg-red-500')} />
                                        <div className="p-5">
                                            <div className="flex items-start justify-between gap-4">
                                                <div className="flex min-w-0 gap-3">
                                                    <ThemedIconTile tone={module.is_core ? 'amber' : module.is_enabled ? meta.tone : 'red'} size="lg">
                                                        <Icon className="h-5 w-5" />
                                                    </ThemedIconTile>
                                                    <div className="min-w-0">
                                                        <div className="flex flex-wrap items-center gap-2">
                                                            <h3 className="truncate text-base font-semibold text-waify-text dark:text-waify-dark-text">{module.name}</h3>
                                                            <Badge variant={module.is_enabled ? 'success' : 'danger'}>{module.is_enabled ? 'Enabled' : 'Disabled'}</Badge>
                                                            <Badge variant={module.is_core ? 'warning' : 'secondary'}>{module.is_core ? 'Core' : meta.label}</Badge>
                                                        </div>
                                                        <p className="mt-1 font-mono text-xs text-waify-text-muted dark:text-waify-dark-text-muted">{module.key}</p>
                                                    </div>
                                                </div>
                                            </div>

                                            <p className="mt-4 min-h-[40px] text-sm leading-5 text-waify-text-muted dark:text-waify-dark-text-muted">
                                                {module.description || 'No description has been added for this module yet.'}
                                            </p>

                                            <div className="mt-5 rounded-card border border-gray-100 bg-gray-50/70 p-3 dark:border-waify-dark-border dark:bg-waify-dark-surface-2/60">
                                                <div className="mb-2 flex items-center justify-between text-xs">
                                                    <span className="font-medium text-waify-text-muted dark:text-waify-dark-text-muted">Workspace adoption</span>
                                                    <span className="font-semibold tabular-nums text-waify-text dark:text-waify-dark-text">
                                                        {module.account_count} workspace{module.account_count === 1 ? '' : 's'}
                                                    </span>
                                                </div>
                                                <Meter value={adoption} tone={meterTone} />
                                            </div>

                                            <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
                                                <div className="flex items-center gap-2 text-xs text-waify-text-muted dark:text-waify-dark-text-muted">
                                                    {module.is_core ? <Lock className="h-4 w-4" /> : module.is_enabled ? <ToggleRight className="h-4 w-4 text-waify-green dark:text-emerald-300" /> : <ToggleLeft className="h-4 w-4 text-red-500" />}
                                                    {module.is_core ? 'Locked platform base' : module.is_enabled ? 'Available to workspaces' : 'Unavailable platform-wide'}
                                                </div>
                                                <div className="flex gap-2">
                                                    <Button type="button" size="sm" variant="secondary" onClick={() => setEditing(module)}>
                                                        <Edit3 className="h-4 w-4" />
                                                        Edit
                                                    </Button>
                                                    <Button
                                                        type="button"
                                                        size="sm"
                                                        variant={module.is_enabled ? 'danger' : 'primary'}
                                                        disabled={module.is_core}
                                                        onClick={() => handleToggle(module)}
                                                    >
                                                        {module.is_core ? <Lock className="h-4 w-4" /> : module.is_enabled ? <ToggleRight className="h-4 w-4" /> : <ToggleLeft className="h-4 w-4" />}
                                                        {module.is_core ? 'Locked' : module.is_enabled ? 'Disable' : 'Enable'}
                                                    </Button>
                                                </div>
                                            </div>
                                        </div>
                                    </article>
                                );
                            })}
                        </div>

                        {filtered.length === 0 && (
                            <Card>
                                <CardContent className="p-12 text-center">
                                    <Search className="mx-auto h-10 w-10 text-waify-text-muted dark:text-waify-dark-text-muted" />
                                    <p className="mt-3 font-semibold text-waify-text dark:text-waify-dark-text">No modules found</p>
                                    <p className="mt-1 text-sm text-waify-text-muted dark:text-waify-dark-text-muted">Try a different category or search term.</p>
                                </CardContent>
                            </Card>
                        )}
                    </main>
                </div>
            </div>

            <ModuleDrawer module={editing} maxAccounts={maxAccounts} onClose={() => setEditing(null)} />
        </PlatformShell>
    );
}
