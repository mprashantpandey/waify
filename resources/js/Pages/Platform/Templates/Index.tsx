import { Head, Link, router, usePage } from '@inertiajs/react';
import { useMemo, useState } from 'react';
import PlatformShell from '@/Layouts/PlatformShell';
import { Card, CardContent } from '@/Components/UI/Card';
import Button from '@/Components/UI/Button';
import { Badge } from '@/Components/UI/Badge';
import { Drawer } from '@/Components/UI/Elements';
import {
    AlertCircle,
    Building2,
    CheckCircle2,
    Clock,
    Eye,
    FileText,
    Filter,
    Languages,
    MessageSquareText,
    Search,
    ShieldAlert,
    XCircle,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface Template {
    id: number;
    slug: string;
    name: string;
    language: string;
    category: string;
    status: string;
    quality_score: string | null;
    account: {
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
    body_text?: string | null;
    header_type?: string | null;
    header_text?: string | null;
    footer_text?: string | null;
    buttons?: any;
    components?: any;
    is_archived?: boolean;
}

interface PaginatedTemplates {
    data: Template[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    links: Array<{ url: string | null; label: string; active: boolean }>;
}

type Filters = { status?: string; account_id?: string; search?: string };

function normalizeStatus(status: string) {
    return (status || 'UNKNOWN').toUpperCase();
}

function statusVariant(status: string): 'success' | 'warning' | 'danger' | 'info' | 'default' {
    const normalized = normalizeStatus(status);
    if (normalized === 'APPROVED') return 'success';
    if (normalized === 'PENDING' || normalized === 'IN_REVIEW') return 'warning';
    if (normalized === 'REJECTED' || normalized === 'PAUSED' || normalized === 'DISABLED') return 'danger';
    return 'default';
}

function statusIcon(status: string) {
    const normalized = normalizeStatus(status);
    if (normalized === 'APPROVED') return CheckCircle2;
    if (normalized === 'PENDING' || normalized === 'IN_REVIEW') return Clock;
    if (normalized === 'REJECTED' || normalized === 'PAUSED' || normalized === 'DISABLED') return XCircle;
    return AlertCircle;
}

function plainPaginationLabel(label: string) {
    return label.replace('&laquo;', 'Prev').replace('&raquo;', 'Next');
}

function formatDate(value: string | null) {
    if (!value) return 'Never';
    return new Intl.DateTimeFormat('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }).format(new Date(value));
}

function replaceVariables(value?: string | null) {
    return (value || '').replace(/\{\{(\d+)\}\}/g, (_match, number) => `Sample ${number}`);
}

function templateButtons(template: Template): Array<{ text?: string; type?: string }> {
    const rawButtons = template.buttons || template.components?.find?.((component: any) => component.type === 'BUTTONS')?.buttons || [];
    return Array.isArray(rawButtons) ? rawButtons : [];
}

function TemplatePhonePreview({ template }: { template: Template }) {
    const buttons = templateButtons(template);
    const body = replaceVariables(template.body_text) || 'No body text stored.';

    return (
        <div className="rounded-[28px] border border-gray-200 bg-gray-950 p-3 shadow-card dark:border-waify-dark-border">
            <div className="overflow-hidden rounded-[22px] bg-[#e6ddd4]">
                <div className="flex items-center gap-2 bg-[#075e54] px-4 py-3 text-white">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white/20 text-xs font-bold">
                        {template.account.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                        <p className="truncate text-sm font-semibold">{template.account.name}</p>
                        <p className="text-[11px] text-white/75">WhatsApp Business preview</p>
                    </div>
                </div>
                <div className="space-y-2 px-3 py-4">
                    <div className="max-w-[86%] rounded-lg rounded-tl-sm bg-white px-3 py-2 text-sm leading-relaxed text-gray-900 shadow-sm">
                        {template.header_text && <p className="mb-2 font-semibold">{replaceVariables(template.header_text)}</p>}
                        <p className="whitespace-pre-wrap">{body}</p>
                        {template.footer_text && <p className="mt-2 text-xs text-gray-500">{replaceVariables(template.footer_text)}</p>}
                        <p className="mt-2 text-right text-[10px] text-gray-400">10:42</p>
                    </div>
                    {buttons.length > 0 && (
                        <div className="max-w-[86%] space-y-1">
                            {buttons.slice(0, 3).map((button, index) => (
                                <div key={`${button.text || button.type || 'button'}-${index}`} className="rounded-lg bg-white px-3 py-2 text-center text-xs font-semibold text-sky-600 shadow-sm">
                                    {button.text || button.type || `Button ${index + 1}`}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

function InfoBanner() {
    return (
        <div className="rounded-card border border-sky-100 bg-sky-50 px-4 py-3 text-sm text-sky-900 dark:border-sky-400/20 dark:bg-sky-500/10 dark:text-sky-100">
            <div className="flex items-start gap-3">
                <FileText className="mt-0.5 h-5 w-5 shrink-0 text-sky-600 dark:text-sky-200" />
                <div>
                    <p className="font-semibold">Review Meta template submissions across workspaces.</p>
                    <p className="mt-1 text-xs text-sky-700 dark:text-sky-200/80">
                        This admin view is read-only oversight. Creation, sync, and Meta approval still happen from each workspace WABA flow.
                    </p>
                </div>
            </div>
        </div>
    );
}

function StatCard({ label, value, variant }: { label: string; value: number; variant: 'success' | 'warning' | 'danger' | 'info' }) {
    return (
        <Card>
            <CardContent className="p-4">
                <div className="text-xs font-medium uppercase tracking-[0.12em] text-waify-text-muted dark:text-waify-dark-text-muted">{label}</div>
                <div className="mt-2 text-2xl font-bold tabular-nums text-waify-text dark:text-waify-dark-text">{value}</div>
                <Badge variant={variant} className="mt-2">This page</Badge>
            </CardContent>
        </Card>
    );
}

export default function TemplatesIndex({
    templates,
    filters,
    filter_options,
    selectedTemplate,
}: {
    templates: PaginatedTemplates;
    filters: Filters;
    filter_options: { statuses: string[]; accounts: Array<{ id: number; name: string }> };
    selectedTemplate?: Template | null;
}) {
    const { auth } = usePage().props as any;
    const [localFilters, setLocalFilters] = useState<Filters>(filters || {});
    const selected = selectedTemplate || null;

    const stats = useMemo(() => {
        const approved = templates.data.filter((template) => normalizeStatus(template.status) === 'APPROVED').length;
        const pending = templates.data.filter((template) => ['PENDING', 'IN_REVIEW'].includes(normalizeStatus(template.status))).length;
        const rejected = templates.data.filter((template) => ['REJECTED', 'PAUSED', 'DISABLED'].includes(normalizeStatus(template.status))).length;
        return { approved, pending, rejected };
    }, [templates.data]);

    const applyFilters = (next: Filters = localFilters) => {
        router.get(route('platform.templates.index'), next as any, {
            preserveState: true,
            preserveScroll: true,
            replace: true,
        });
    };

    const setStatus = (status?: string) => {
        const next = { ...localFilters, status };
        setLocalFilters(next);
        applyFilters(next);
    };

    const clearFilters = () => {
        setLocalFilters({});
        router.get(route('platform.templates.index'), {}, { preserveState: true, preserveScroll: true, replace: true });
    };

    const openTemplate = (template: Template) => {
        router.get(route('platform.templates.index'), { ...localFilters, template: template.slug }, {
            preserveState: true,
            preserveScroll: true,
            replace: true,
        });
    };

    const closeTemplate = () => {
        router.get(route('platform.templates.index'), localFilters as any, {
            preserveState: true,
            preserveScroll: true,
            replace: true,
        });
    };

    const statusFilters = [
        { id: undefined, label: 'All' },
        { id: 'APPROVED', label: 'Approved' },
        { id: 'PENDING', label: 'Pending' },
        { id: 'REJECTED', label: 'Rejected' },
    ];

    return (
        <PlatformShell auth={auth}>
            <Head title="Templates" />

            <div className="space-y-4">
                <InfoBanner />

                <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="flex flex-wrap gap-2">
                        {statusFilters.map((status) => (
                            <button
                                key={status.label}
                                type="button"
                                onClick={() => setStatus(status.id)}
                                className={cn(
                                    'rounded-full px-3 py-1.5 text-xs font-medium transition',
                                    (localFilters.status || undefined) === status.id
                                        ? 'bg-waify-green text-white shadow-sm'
                                        : 'bg-gray-100 text-waify-text-muted hover:bg-gray-200 dark:bg-waify-dark-surface-2 dark:text-waify-dark-text-muted dark:hover:bg-slate-700'
                                )}
                            >
                                {status.label}
                            </button>
                        ))}
                    </div>
                    <Button type="button" variant="secondary" onClick={clearFilters}>Reset filters</Button>
                </div>

                <div className="relative max-w-md">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-waify-text-muted dark:text-waify-dark-text-muted" />
                    <input
                        value={localFilters.search || ''}
                        onChange={(event) => setLocalFilters({ ...localFilters, search: event.target.value || undefined })}
                        onKeyDown={(event) => {
                            if (event.key === 'Enter') applyFilters();
                        }}
                        placeholder="Search template or workspace..."
                        className="h-10 w-full rounded-btn border border-waify-border bg-white pl-10 pr-3 text-sm outline-none focus:ring-2 focus:ring-waify-green/20 dark:border-waify-dark-border dark:bg-waify-dark-surface dark:text-waify-dark-text"
                    />
                </div>

                <div className="grid gap-4 sm:grid-cols-3">
                    <StatCard label="Pending review" value={stats.pending} variant="warning" />
                    <StatCard label="Approved" value={stats.approved} variant="success" />
                    <StatCard label="Needs attention" value={stats.rejected} variant="danger" />
                </div>

                <div className="flex flex-wrap items-center gap-2">
                    <select
                        value={localFilters.account_id || ''}
                        onChange={(event) => setLocalFilters({ ...localFilters, account_id: event.target.value || undefined })}
                        className="waify-input min-w-48"
                    >
                        <option value="">All workspaces</option>
                        {filter_options.accounts.map((account) => (
                            <option key={account.id} value={account.id}>{account.name}</option>
                        ))}
                    </select>
                    <select
                        value={localFilters.status || ''}
                        onChange={(event) => setLocalFilters({ ...localFilters, status: event.target.value || undefined })}
                        className="waify-input min-w-40"
                    >
                        <option value="">All statuses</option>
                        {filter_options.statuses.map((status) => (
                            <option key={status} value={status}>{normalizeStatus(status)}</option>
                        ))}
                    </select>
                    <Button type="button" onClick={() => applyFilters()}>
                        <Filter className="h-4 w-4" />
                        Apply
                    </Button>
                </div>

                <Card className="overflow-hidden">
                    {templates.data.length === 0 ? (
                        <CardContent className="flex flex-col items-center justify-center py-16 text-center">
                            <div className="flex h-12 w-12 items-center justify-center rounded-card bg-emerald-50 text-waify-green dark:bg-emerald-400/10 dark:text-emerald-200">
                                <MessageSquareText className="h-5 w-5" />
                            </div>
                            <p className="mt-4 text-sm font-semibold text-waify-text dark:text-waify-dark-text">No templates found</p>
                            <p className="mt-1 text-sm text-waify-text-muted dark:text-waify-dark-text-muted">Change filters or sync templates from a workspace WABA account.</p>
                        </CardContent>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b border-gray-100 bg-gray-50/60 text-left text-xs uppercase text-waify-text-muted dark:border-waify-dark-border dark:bg-waify-dark-surface-2/40 dark:text-waify-dark-text-muted">
                                        <th className="px-5 py-3">Template</th>
                                        <th className="px-5 py-3">Workspace</th>
                                        <th className="px-5 py-3">Category</th>
                                        <th className="px-5 py-3">Language</th>
                                        <th className="px-5 py-3">Status</th>
                                        <th className="px-5 py-3">Synced</th>
                                        <th className="px-5 py-3 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100 dark:divide-waify-dark-border">
                                    {templates.data.map((template) => {
                                        const Icon = statusIcon(template.status);
                                        return (
                                            <tr key={template.id} className="text-waify-text hover:bg-gray-50/60 dark:text-waify-dark-text dark:hover:bg-waify-dark-surface-2/40">
                                                <td className="px-5 py-3">
                                                    <div className="flex items-center gap-3">
                                                        <div className="flex h-9 w-9 items-center justify-center rounded-btn bg-emerald-50 text-waify-green dark:bg-emerald-400/10 dark:text-emerald-200">
                                                            <Icon className="h-4 w-4" />
                                                        </div>
                                                        <div className="min-w-0">
                                                            <div className="max-w-[260px] truncate font-mono text-xs font-semibold">{template.name}</div>
                                                            {template.last_meta_error && (
                                                                <div className="mt-1 flex items-center gap-1 text-xs text-red-600 dark:text-red-300">
                                                                    <ShieldAlert className="h-3.5 w-3.5" />
                                                                    Meta error
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-5 py-3">
                                                    <Link href={route('platform.accounts.show', { account: template.account.id })} className="font-medium text-waify-green-dark hover:underline dark:text-emerald-300">
                                                        {template.account.name}
                                                    </Link>
                                                    <div className="text-xs text-waify-text-muted dark:text-waify-dark-text-muted">{template.account.slug}</div>
                                                </td>
                                                <td className="px-5 py-3"><Badge variant="secondary">{template.category}</Badge></td>
                                                <td className="px-5 py-3 uppercase text-waify-text-muted dark:text-waify-dark-text-muted">{template.language}</td>
                                                <td className="px-5 py-3"><Badge variant={statusVariant(template.status)}>{normalizeStatus(template.status)}</Badge></td>
                                                <td className="px-5 py-3 text-waify-text-muted dark:text-waify-dark-text-muted">{formatDate(template.last_synced_at)}</td>
                                                <td className="px-5 py-3">
                                                    <div className="flex justify-end gap-2">
                                                        <Button size="sm" variant="ghost" type="button" onClick={() => openTemplate(template)}>
                                                            <Eye className="h-4 w-4" />
                                                            Inspect
                                                        </Button>
                                                        <Button size="sm" variant="secondary" type="button" onClick={() => openTemplate(template)}>Open</Button>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    )}
                </Card>

                {templates.last_page > 1 && (
                    <div className="flex flex-col gap-3 rounded-card border border-gray-100 bg-white p-3 shadow-card dark:border-waify-dark-border dark:bg-waify-dark-surface dark:shadow-none sm:flex-row sm:items-center sm:justify-between">
                        <p className="text-sm text-waify-text-muted dark:text-waify-dark-text-muted">
                            Showing {templates.per_page * (templates.current_page - 1) + 1} to {Math.min(templates.per_page * templates.current_page, templates.total)} of {templates.total}
                        </p>
                        <div className="flex flex-wrap gap-2">
                            {templates.links.map((link, index) => (
                                link.url ? (
                                    <Link
                                        key={`${link.label}-${index}`}
                                        href={link.url}
                                        className={cn(
                                            'h-9 rounded-btn px-3 py-2 text-sm font-semibold transition',
                                            link.active
                                                ? 'bg-waify-green text-white'
                                                : 'border border-gray-200 bg-white text-waify-text hover:bg-gray-50 dark:border-waify-dark-border dark:bg-waify-dark-surface dark:text-waify-dark-text dark:hover:bg-waify-dark-surface-2'
                                        )}
                                    >
                                        {plainPaginationLabel(link.label)}
                                    </Link>
                                ) : (
                                    <span
                                        key={`${link.label}-${index}`}
                                        className="h-9 rounded-btn border border-gray-100 bg-gray-50 px-3 py-2 text-sm font-semibold text-waify-text-muted opacity-60 dark:border-waify-dark-border dark:bg-waify-dark-surface-2 dark:text-waify-dark-text-muted"
                                    >
                                        {plainPaginationLabel(link.label)}
                                    </span>
                                )
                            ))}
                        </div>
                    </div>
                )}
            </div>

            <Drawer
                open={!!selected}
                onClose={closeTemplate}
                title={selected?.name || 'Template'}
                description={selected ? `${selected.account.name} · ${normalizeStatus(selected.status)}` : undefined}
                footer={
                    <div className="flex justify-end gap-2">
                        <Button variant="secondary" type="button" onClick={closeTemplate}>Close</Button>
                        {selected && <Button type="button" onClick={() => router.visit(route('platform.accounts.show', { account: selected.account.id }))}>Open workspace</Button>}
                    </div>
                }
            >
                {selected && (
                    <div className="space-y-4">
                        <TemplatePhonePreview template={selected} />

                        <div className="rounded-card border border-gray-100 bg-gray-50 p-4 dark:border-waify-dark-border dark:bg-waify-dark-surface-2">
                            <div className="flex items-center justify-between gap-3">
                                <Badge variant={statusVariant(selected.status)}>{normalizeStatus(selected.status)}</Badge>
                                <Badge variant="secondary">{selected.category}</Badge>
                            </div>
                            <div className="mt-3 text-xs text-waify-text-muted dark:text-waify-dark-text-muted">
                                Quality: {selected.quality_score || 'Not reported'} · Synced {formatDate(selected.last_synced_at)}
                            </div>
                        </div>
                        <div className="space-y-3 text-sm">
                            {selected.header_text && (
                                <div className="rounded-card border border-gray-100 bg-white p-3 dark:border-waify-dark-border dark:bg-waify-dark-surface">
                                    <div className="text-xs font-semibold uppercase tracking-wide text-waify-text-muted dark:text-waify-dark-text-muted">Header</div>
                                    <div className="mt-1 whitespace-pre-wrap text-waify-text dark:text-waify-dark-text">{selected.header_text}</div>
                                </div>
                            )}
                            <div className="rounded-card border border-gray-100 bg-white p-3 dark:border-waify-dark-border dark:bg-waify-dark-surface">
                                <div className="text-xs font-semibold uppercase tracking-wide text-waify-text-muted dark:text-waify-dark-text-muted">Body</div>
                                <div className="mt-1 whitespace-pre-wrap text-waify-text dark:text-waify-dark-text">{selected.body_text || 'No body text stored.'}</div>
                            </div>
                            {selected.footer_text && (
                                <div className="rounded-card border border-gray-100 bg-white p-3 dark:border-waify-dark-border dark:bg-waify-dark-surface">
                                    <div className="text-xs font-semibold uppercase tracking-wide text-waify-text-muted dark:text-waify-dark-text-muted">Footer</div>
                                    <div className="mt-1 whitespace-pre-wrap text-waify-text dark:text-waify-dark-text">{selected.footer_text}</div>
                                </div>
                            )}
                            <div className="flex items-center justify-between border-b border-gray-100 pb-3 dark:border-waify-dark-border">
                                <span className="inline-flex items-center gap-2 text-waify-text-muted dark:text-waify-dark-text-muted"><Building2 className="h-4 w-4" /> Workspace</span>
                                <span className="font-medium text-waify-text dark:text-waify-dark-text">{selected.account.name}</span>
                            </div>
                            <div className="flex items-center justify-between border-b border-gray-100 pb-3 dark:border-waify-dark-border">
                                <span className="inline-flex items-center gap-2 text-waify-text-muted dark:text-waify-dark-text-muted"><Languages className="h-4 w-4" /> Language</span>
                                <span className="font-medium uppercase text-waify-text dark:text-waify-dark-text">{selected.language}</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-waify-text-muted dark:text-waify-dark-text-muted">Connection</span>
                                <span className="font-medium text-waify-text dark:text-waify-dark-text">{selected.connection?.name || 'Not linked'}</span>
                            </div>
                        </div>
                        {selected.buttons && Array.isArray(selected.buttons) && selected.buttons.length > 0 && (
                            <div className="rounded-card border border-gray-100 bg-gray-50 p-3 dark:border-waify-dark-border dark:bg-waify-dark-surface-2">
                                <div className="text-xs font-semibold uppercase tracking-wide text-waify-text-muted dark:text-waify-dark-text-muted">Buttons</div>
                                <pre className="mt-2 max-h-48 overflow-auto text-xs text-waify-text dark:text-waify-dark-text">{JSON.stringify(selected.buttons, null, 2)}</pre>
                            </div>
                        )}
                        {selected.last_meta_error && (
                            <div className="rounded-card border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-400/25 dark:bg-red-500/10 dark:text-red-200">
                                {selected.last_meta_error}
                            </div>
                        )}
                    </div>
                )}
            </Drawer>
        </PlatformShell>
    );
}
