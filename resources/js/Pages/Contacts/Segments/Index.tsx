import { Head, Link, router, useForm } from '@inertiajs/react';
import { useMemo, useState } from 'react';
import {
    ArrowLeft,
    Copy,
    FolderOpen,
    Megaphone,
    MoreVertical,
    Pencil,
    Plus,
    RefreshCw,
    Search,
    Trash2,
    Users,
} from 'lucide-react';
import AppShell from '@/Layouts/AppShell';
import Button from '@/Components/UI/Button';
import { Card, CardContent } from '@/Components/UI/Card';
import { EmptyState } from '@/Components/UI/EmptyState';
import { Badge } from '@/Components/UI/Badge';
import { IconButton, ThemedIconTile, TrendBadge } from '@/Components/UI/Elements';
import { Drawer } from '@/Components/UI/Elements';
import TextInput from '@/Components/TextInput';
import { useToast } from '@/hooks/useToast';
import { useConfirm } from '@/hooks/useConfirm';

interface Segment {
    id: number;
    name: string;
    description: string | null;
    contact_count: number;
    last_calculated_at: string | null;
    filters: Array<{ field: string; operator: string; value?: string }> | null;
    created_at: string;
}

function formatNumber(value: number | string | null | undefined) {
    const numeric = Number(value ?? 0);
    return Number.isFinite(numeric) ? new Intl.NumberFormat('en-IN').format(numeric) : '0';
}

function formatRelative(value: string | null) {
    if (!value) return 'Not calculated';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return value;
    const diffMs = Date.now() - date.getTime();
    const diffMinutes = Math.max(1, Math.round(diffMs / 60000));
    if (diffMinutes < 60) return `${diffMinutes}m ago`;
    const diffHours = Math.round(diffMinutes / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    const diffDays = Math.round(diffHours / 24);
    if (diffDays < 30) return `${diffDays}d ago`;
    return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

function ruleLabel(rule: { field: string; operator: string; value?: string }) {
    return [rule.field, rule.operator, rule.value].filter(Boolean).join(' ');
}

function StatChip({ label, value, trend }: { label: string; value: string | number; trend?: string }) {
    return (
        <div className="inline-flex items-center gap-2 rounded-card border border-gray-100 bg-white px-3 py-2 shadow-card dark:border-waify-dark-border dark:bg-waify-dark-surface dark:shadow-none">
            <span className="text-xs font-medium text-waify-text-muted dark:text-waify-dark-text-muted">{label}</span>
            <span className="text-sm font-bold text-waify-text dark:text-waify-dark-text">{value}</span>
            {trend && <TrendBadge value={trend} className="py-0" />}
        </div>
    );
}

export default function SegmentsIndex({
    segments,
}: {
    account: any;
    segments: Segment[];
}) {
    const { toast } = useToast();
    const confirm = useConfirm();
    const [search, setSearch] = useState('');
    const [busySegmentId, setBusySegmentId] = useState<number | null>(null);
    const [drawerMode, setDrawerMode] = useState<'create' | 'edit' | 'view' | null>(() => {
        const params = new URLSearchParams(window.location.search);
        if (params.get('create') === '1') return 'create';
        if (params.get('edit') === '1') return 'edit';
        if (params.get('segment')) return 'view';
        return null;
    });
    const [activeSegmentId, setActiveSegmentId] = useState<number | null>(() => {
        const id = Number(new URLSearchParams(window.location.search).get('segment'));
        return Number.isFinite(id) && id > 0 ? id : null;
    });
    const activeSegment = segments.find((segment) => segment.id === activeSegmentId) || null;
    const segmentForm = useForm({
        name: '',
        description: '',
        filters: [{ field: 'status', operator: 'equals', value: 'active' }],
    });

    const filteredSegments = useMemo(() => {
        const query = search.trim().toLowerCase();
        if (!query) return segments;
        return segments.filter((segment) => {
            return (
                segment.name.toLowerCase().includes(query) ||
                (segment.description || '').toLowerCase().includes(query) ||
                (segment.filters || []).some((filter) => ruleLabel(filter).toLowerCase().includes(query))
            );
        });
    }, [search, segments]);

    const totalContacts = segments.reduce((sum, segment) => sum + Number(segment.contact_count || 0), 0);
    const averageContacts = segments.length ? Math.round(totalContacts / segments.length) : 0;

    const handleDelete = async (segment: Segment) => {
        const confirmed = await confirm({
            title: 'Delete segment',
            message: `Delete segment "${segment.name}"? Contacts will remain unchanged.`,
            confirmText: 'Delete segment',
            variant: 'danger',
        });
        if (!confirmed) return;
        setBusySegmentId(segment.id);
        router.delete(route('app.contacts.segments.destroy', { segment: segment.id }), {
            preserveScroll: true,
            onSuccess: () => toast.success('Segment deleted'),
            onError: () => toast.error('Failed to delete segment'),
            onFinish: () => setBusySegmentId(null),
        });
    };

    const handleRecalculate = (segmentId: number) => {
        setBusySegmentId(segmentId);
        router.post(route('app.contacts.segments.recalculate', { segment: segmentId }), {}, {
            preserveScroll: true,
            onSuccess: () => toast.success('Count recalculated'),
            onError: () => toast.error('Failed to recalculate segment'),
            onFinish: () => setBusySegmentId(null),
        });
    };

    const openCreate = () => {
        segmentForm.setData({ name: '', description: '', filters: [{ field: 'status', operator: 'equals', value: 'active' }] });
        setActiveSegmentId(null);
        setDrawerMode('create');
    };

    const openSegment = (segment: Segment, mode: 'view' | 'edit') => {
        setActiveSegmentId(segment.id);
        if (mode === 'edit') {
            const normalizedFilters = (segment.filters?.length ? segment.filters : [{ field: 'status', operator: 'equals', value: 'active' }]).map((filter) => ({
                field: filter.field,
                operator: filter.operator,
                value: filter.value || '',
            }));
            segmentForm.setData({
                name: segment.name,
                description: segment.description || '',
                filters: normalizedFilters,
            });
        }
        setDrawerMode(mode);
    };

    const closeDrawer = () => {
        setDrawerMode(null);
        setActiveSegmentId(null);
    };

    const saveSegment = () => {
        if (drawerMode === 'edit' && activeSegment) {
            segmentForm.put(route('app.contacts.segments.update', { segment: activeSegment.id }), {
                preserveScroll: true,
                onSuccess: closeDrawer,
                onError: () => toast.error('Failed to update segment'),
            });
            return;
        }

        segmentForm.post(route('app.contacts.segments.store', {}), {
            preserveScroll: true,
            onSuccess: closeDrawer,
            onError: () => toast.error('Failed to create segment'),
        });
    };

    return (
        <AppShell>
            <Head title="Audience Segments" />
            <div className="module-page max-w-[1600px]">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                    <div>
                        <Link href={route('app.contacts.index')} className="mb-4 inline-flex items-center gap-2 text-sm font-medium text-waify-text-muted transition hover:text-waify-text dark:text-waify-dark-text-muted dark:hover:text-waify-dark-text">
                            <ArrowLeft className="h-4 w-4" />
                            Back to contacts
                        </Link>
                        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-waify-green-dark dark:text-emerald-300">Audience</p>
                        <h1 className="module-heading">Audience Segments</h1>
                        <p className="module-subheading">Group contacts with rules for targeted campaigns.</p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        <Link href={route('app.broadcasts.index', { panel: 'create' })}>
                            <Button variant="secondary">
                                <Megaphone className="h-4 w-4" />
                                New campaign
                            </Button>
                        </Link>
                        <Button onClick={openCreate}>
                            <Plus className="h-4 w-4" />
                            New segment
                        </Button>
                    </div>
                </div>

                <div className="flex flex-wrap gap-2">
                    <StatChip label="Total segments" value={segments.length} />
                    <StatChip label="Reachable contacts" value={formatNumber(totalContacts)} />
                    <StatChip label="Avg. per segment" value={formatNumber(averageContacts)} />
                </div>

                <div className="rounded-card border border-emerald-100 bg-waify-green-soft/70 p-4 dark:border-emerald-500/20 dark:bg-waify-dark-green-soft">
                    <div className="flex items-start gap-3">
                        <ThemedIconTile tone="green" size="sm">
                            <FolderOpen className="h-4 w-4" />
                        </ThemedIconTile>
                        <div>
                            <p className="text-sm font-semibold text-waify-text dark:text-waify-dark-text">Smart segments are live</p>
                            <p className="mt-1 text-sm text-waify-text-muted dark:text-waify-dark-text-muted">Segments recalculate from your saved rules. Use them when creating campaigns for cleaner targeting.</p>
                        </div>
                    </div>
                </div>

                <Card className="border-transparent dark:border-slate-700/80">
                    <CardContent className="flex flex-col gap-2 p-3 md:flex-row md:items-center">
                        <div className="relative min-w-[220px] flex-1">
                            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-waify-text-muted dark:text-waify-dark-text-muted" />
                            <TextInput
                                value={search}
                                onChange={(event) => setSearch(event.target.value)}
                                placeholder="Search segments..."
                                className="h-9 rounded-btn border-gray-200 pl-10 text-sm focus:border-waify-green focus:ring-waify-green/20 dark:border-waify-dark-border dark:bg-waify-dark-surface-2"
                            />
                        </div>
                        <select className="h-9 rounded-btn border-gray-200 bg-white px-3 text-sm text-waify-text shadow-sm focus:border-waify-green focus:ring-waify-green/20 dark:border-waify-dark-border dark:bg-waify-dark-surface-2 dark:text-waify-dark-text">
                            <option>All types</option>
                            <option>Dynamic</option>
                            <option>Static</option>
                        </select>
                    </CardContent>
                </Card>

                {filteredSegments.length === 0 ? (
                    <Card className="border-transparent dark:border-slate-700/80">
                        <CardContent className="py-16 text-center">
                            <EmptyState
                                icon={FolderOpen}
                                title="No segments found"
                                description="Create a segment to target specific groups of contacts."
                                action={
                                    <Button onClick={openCreate}>
                                        <Plus className="h-4 w-4" />
                                        New segment
                                    </Button>
                                }
                            />
                        </CardContent>
                    </Card>
                ) : (
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
                        {filteredSegments.map((segment, index) => {
                            const rules = segment.filters || [];
                            const iconTones = ['amber', 'blue', 'green', 'purple', 'pink'] as const;

                            return (
                                <Card key={segment.id} className="group border-transparent transition-all hover:-translate-y-0.5 hover:shadow-card-lg dark:border-slate-700/80">
                                    <CardContent className="p-5">
                                        <div className="mb-3 flex items-start justify-between gap-3">
                                            <div className="flex min-w-0 items-center gap-3">
                                                <ThemedIconTile tone={iconTones[index % iconTones.length]} size="lg">
                                                    <FolderOpen className="h-5 w-5" />
                                                </ThemedIconTile>
                                                <div className="min-w-0">
                                                    <button type="button" onClick={() => openSegment(segment, 'view')} className="font-semibold text-waify-text hover:text-waify-green-dark dark:text-waify-dark-text dark:hover:text-emerald-300">
                                                        {segment.name}
                                                    </button>
                                                    <p className="mt-0.5 text-xs text-waify-text-muted dark:text-waify-dark-text-muted">Updated {formatRelative(segment.last_calculated_at || segment.created_at)}</p>
                                                </div>
                                            </div>
                                            <div className="group/menu relative">
                                                <IconButton size="sm" variant="ghost" aria-label="Segment actions">
                                                    <MoreVertical className="h-4 w-4" />
                                                </IconButton>
                                                <div className="invisible absolute right-0 top-9 z-20 w-44 overflow-hidden rounded-card bg-white py-1 opacity-0 shadow-pop ring-1 ring-gray-100 transition group-hover/menu:visible group-hover/menu:opacity-100 dark:bg-waify-dark-surface dark:ring-waify-dark-border">
                                                    <button type="button" onClick={() => openSegment(segment, 'edit')} className="flex w-full items-center gap-2 px-3 py-2 text-left text-xs font-medium text-waify-text hover:bg-gray-50 dark:text-waify-dark-text dark:hover:bg-waify-dark-surface-2">
                                                        <Pencil className="h-3.5 w-3.5" />
                                                        Edit rules
                                                    </button>
                                                    <button type="button" disabled className="flex w-full items-center gap-2 px-3 py-2 text-left text-xs font-medium text-waify-text-muted opacity-70 dark:text-waify-dark-text-muted">
                                                        <Copy className="h-3.5 w-3.5" />
                                                        Duplicate
                                                    </button>
                                                    <Link href={route('app.broadcasts.index', { panel: 'create' })} className="flex items-center gap-2 px-3 py-2 text-xs font-medium text-waify-text hover:bg-gray-50 dark:text-waify-dark-text dark:hover:bg-waify-dark-surface-2">
                                                        <Megaphone className="h-3.5 w-3.5" />
                                                        Use in campaign
                                                    </Link>
                                                </div>
                                            </div>
                                        </div>

                                        {segment.description && <p className="mb-3 line-clamp-2 text-sm text-waify-text-muted dark:text-waify-dark-text-muted">{segment.description}</p>}

                                        <div className="mb-4 flex min-h-7 flex-wrap gap-1.5">
                                            {rules.length > 0 ? (
                                                rules.slice(0, 4).map((rule, ruleIndex) => (
                                                    <Badge key={`${segment.id}-${ruleIndex}`} variant="secondary" className="rounded-md">
                                                        {ruleLabel(rule)}
                                                    </Badge>
                                                ))
                                            ) : (
                                                <Badge variant="outline" className="rounded-md">Manual segment</Badge>
                                            )}
                                            {rules.length > 4 && <Badge variant="outline" className="rounded-md">+{rules.length - 4} more</Badge>}
                                        </div>

                                        <div className="grid grid-cols-3 gap-3 border-t border-gray-100 pt-4 dark:border-waify-dark-border">
                                            <div>
                                                <div className="text-[10px] font-medium uppercase tracking-wide text-waify-text-muted dark:text-waify-dark-text-muted">Contacts</div>
                                                <div className="mt-0.5 text-lg font-bold text-waify-text dark:text-waify-dark-text">{formatNumber(segment.contact_count)}</div>
                                            </div>
                                            <div>
                                                <div className="text-[10px] font-medium uppercase tracking-wide text-waify-text-muted dark:text-waify-dark-text-muted">Growth</div>
                                                <div className="mt-0.5 text-lg font-bold text-emerald-600 dark:text-emerald-300">Live</div>
                                            </div>
                                            <div>
                                                <div className="text-[10px] font-medium uppercase tracking-wide text-waify-text-muted dark:text-waify-dark-text-muted">Rules</div>
                                                <div className="mt-0.5 text-lg font-bold text-waify-text dark:text-waify-dark-text">{rules.length}</div>
                                            </div>
                                        </div>

                                        <div className="mt-4 flex items-center gap-2">
                                            <Link href={route('app.broadcasts.index', { panel: 'create' })} className="flex-1">
                                                <Button size="sm" className="w-full">
                                                    <Megaphone className="h-3.5 w-3.5" />
                                                    Campaign
                                                </Button>
                                            </Link>
                                            <Button variant="secondary" size="sm" className="flex-1" onClick={() => openSegment(segment, 'edit')}>
                                                <Pencil className="h-3.5 w-3.5" />
                                                Edit
                                            </Button>
                                            <IconButton size="sm" variant="outline" disabled={busySegmentId === segment.id} onClick={() => handleRecalculate(segment.id)} aria-label={`Recalculate ${segment.name}`}>
                                                {busySegmentId === segment.id ? <RefreshCw className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
                                            </IconButton>
                                            <IconButton size="sm" variant="danger" disabled={busySegmentId === segment.id} onClick={() => handleDelete(segment)} aria-label={`Delete ${segment.name}`}>
                                                <Trash2 className="h-4 w-4" />
                                            </IconButton>
                                        </div>
                                    </CardContent>
                                </Card>
                            );
                        })}
                    </div>
                )}
                <Drawer
                    open={drawerMode !== null}
                    onClose={closeDrawer}
                    title={drawerMode === 'create' ? 'New segment' : drawerMode === 'edit' ? 'Edit segment' : activeSegment?.name || 'Segment details'}
                    description={drawerMode === 'view' ? 'Rules and audience count for this segment.' : 'Define rules without leaving the segment page.'}
                    className="max-w-xl"
                    footer={drawerMode === 'view' ? (
                        <div className="flex justify-end gap-2">
                            {activeSegment && <Button variant="secondary" onClick={() => openSegment(activeSegment, 'edit')}><Pencil className="h-4 w-4" /> Edit</Button>}
                            <Button onClick={closeDrawer}>Done</Button>
                        </div>
                    ) : (
                        <div className="flex justify-end gap-2">
                            <Button variant="secondary" onClick={closeDrawer}>Cancel</Button>
                            <Button onClick={saveSegment} disabled={segmentForm.processing}>{drawerMode === 'edit' ? 'Save segment' : 'Create segment'}</Button>
                        </div>
                    )}
                >
                    {drawerMode === 'view' && activeSegment ? (
                        <div className="space-y-4">
                            <div className="rounded-card border border-gray-100 p-4 dark:border-waify-dark-border">
                                <p className="text-sm text-waify-text-muted dark:text-waify-dark-text-muted">{activeSegment.description || 'No description'}</p>
                                <div className="mt-3 flex flex-wrap gap-2">
                                    <Badge variant="secondary">{formatNumber(activeSegment.contact_count)} contacts</Badge>
                                    <Badge variant="secondary">Updated {formatRelative(activeSegment.last_calculated_at || activeSegment.created_at)}</Badge>
                                </div>
                            </div>
                            <div className="space-y-2">
                                {(activeSegment.filters || []).map((filter, index) => (
                                    <div key={index} className="rounded-btn bg-gray-50 p-3 text-sm text-waify-text dark:bg-waify-dark-surface-2 dark:text-waify-dark-text">
                                        {ruleLabel(filter)}
                                    </div>
                                ))}
                                {(activeSegment.filters || []).length === 0 && <Badge variant="outline">Manual segment</Badge>}
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            <div>
                                <label className="mb-1.5 block text-sm font-medium text-waify-text dark:text-waify-dark-text">Name</label>
                                <TextInput value={segmentForm.data.name} onChange={(e) => segmentForm.setData('name', e.target.value)} className="w-full" />
                            </div>
                            <div>
                                <label className="mb-1.5 block text-sm font-medium text-waify-text dark:text-waify-dark-text">Description</label>
                                <TextInput value={segmentForm.data.description} onChange={(e) => segmentForm.setData('description', e.target.value)} className="w-full" />
                            </div>
                            <div className="rounded-card border border-gray-100 p-4 dark:border-waify-dark-border">
                                <p className="mb-3 text-sm font-semibold text-waify-text dark:text-waify-dark-text">Rules</p>
                                {segmentForm.data.filters.map((filter, index) => (
                                    <div key={index} className="grid gap-2 sm:grid-cols-3">
                                        <select value={filter.field} onChange={(e) => {
                                            const filters = [...segmentForm.data.filters];
                                            filters[index] = { ...filter, field: e.target.value };
                                            segmentForm.setData('filters', filters);
                                        }} className="h-10 rounded-btn border-gray-200 bg-white px-3 text-sm dark:border-waify-dark-border dark:bg-waify-dark-surface dark:text-waify-dark-text">
                                            {['name', 'wa_id', 'email', 'phone', 'company', 'status', 'source'].map((field) => <option key={field} value={field}>{field}</option>)}
                                        </select>
                                        <select value={filter.operator} onChange={(e) => {
                                            const filters = [...segmentForm.data.filters];
                                            filters[index] = { ...filter, operator: e.target.value };
                                            segmentForm.setData('filters', filters);
                                        }} className="h-10 rounded-btn border-gray-200 bg-white px-3 text-sm dark:border-waify-dark-border dark:bg-waify-dark-surface dark:text-waify-dark-text">
                                            {['equals', 'not_equals', 'contains', 'not_contains', 'starts_with', 'ends_with', 'is_empty', 'is_not_empty'].map((operator) => <option key={operator} value={operator}>{operator}</option>)}
                                        </select>
                                        <TextInput value={filter.value || ''} onChange={(e) => {
                                            const filters = [...segmentForm.data.filters];
                                            filters[index] = { ...filter, value: e.target.value };
                                            segmentForm.setData('filters', filters);
                                        }} placeholder="Value" />
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </Drawer>
            </div>
        </AppShell>
    );
}
