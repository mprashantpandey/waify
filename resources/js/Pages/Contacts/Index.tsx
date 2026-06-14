import { Head, Link, router, useForm, usePage } from '@inertiajs/react';
import { FormEventHandler, useEffect, useMemo, useState } from 'react';
import {
    Building2,
    Clock,
    Download,
    Edit3,
    FileText,
    Filter,
    FolderOpen,
    Loader2,
    Mail,
    MessageCircle,
    Phone,
    Plus,
    Search,
    Tag,
    Trash2,
    Upload,
    UserCheck,
    UserMinus,
    UserPlus,
    Users,
} from 'lucide-react';
import AppShell from '@/Layouts/AppShell';
import { Badge } from '@/Components/UI/Badge';
import Button from '@/Components/UI/Button';
import { Card, CardContent } from '@/Components/UI/Card';
import { EmptyState } from '@/Components/UI/EmptyState';
import { Avatar, Drawer, IconButton, ThemedIconTile, TrendBadge } from '@/Components/UI/Elements';
import TextInput from '@/Components/TextInput';
import CountryPhoneInput, { splitPhoneNumber } from '@/Components/Profile/CountryPhoneInput';
import { useConfirm } from '@/hooks/useConfirm';

interface Contact {
    id: number;
    slug: string;
    wa_id: string;
    name: string | null;
    email: string | null;
    phone: string | null;
    company: string | null;
    notes?: string | null;
    status: string;
    message_count: number;
    last_seen_at: string | null;
    tags: Array<{ id: number; name: string; color: string }>;
    segments?: Array<{ id: number; name: string }>;
    created_at: string;
}

interface TagItem {
    id: number;
    name: string;
    color: string;
}

interface Segment {
    id: number;
    name: string;
    contact_count: number;
}

interface ContactImportBatch {
    id: number;
    filename: string | null;
    status: 'queued' | 'processing' | 'completed' | 'failed' | string;
    total_rows: number;
    processed_rows: number;
    progress: number;
    imported_count: number;
    updated_count: number;
    skipped_count: number;
    error_count: number;
    errors: string[];
    created_at: string | null;
    completed_at: string | null;
    failed_at: string | null;
}

function formatNumber(value: number | string | null | undefined) {
    const numeric = Number(value ?? 0);
    return Number.isFinite(numeric) ? new Intl.NumberFormat('en-IN').format(numeric) : '0';
}

function paginationLabel(label: unknown) {
    return String(label ?? '')
        .replace(/&laquo;\s*/g, 'Previous')
        .replace(/\s*&raquo;/g, 'Next')
        .replace(/&amp;/g, '&')
        .replace(/<[^>]*>/g, '')
        .trim();
}

function formatRelative(value: string | null) {
    if (!value) return 'No activity yet';
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

function statusConfig(status: string): { variant: 'success' | 'warning' | 'danger' | 'default'; label: string } {
    const statusMap: Record<string, { variant: 'success' | 'warning' | 'danger' | 'default'; label: string }> = {
        active: { variant: 'success', label: 'Active' },
        inactive: { variant: 'default', label: 'Inactive' },
        blocked: { variant: 'danger', label: 'Blocked' },
        opt_out: { variant: 'warning', label: 'Opt out' },
    };

    return statusMap[status] || { variant: 'default', label: status };
}

function ContactStat({
    icon,
    tone,
    label,
    value,
    trend,
}: {
    icon: React.ReactNode;
    tone: 'green' | 'blue' | 'amber' | 'purple' | 'pink' | 'red' | 'gray';
    label: string;
    value: React.ReactNode;
    trend?: string;
}) {
    return (
        <Card className="border-transparent dark:border-slate-700/80">
            <CardContent className="flex items-center gap-3 p-4">
                <ThemedIconTile tone={tone}>{icon}</ThemedIconTile>
                <div className="min-w-0 flex-1">
                    <p className="text-xs text-waify-text-muted dark:text-waify-dark-text-muted">{label}</p>
                    <div className="mt-0.5 flex items-center gap-2">
                        <p className="text-xl font-bold text-waify-text dark:text-waify-dark-text">{value}</p>
                        {trend && <TrendBadge value={trend} />}
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}

export default function ContactsIndex({
    contacts,
    tags,
    segments,
    importBatches = [],
    filters,
    contactStats,
    selectedContact,
}: {
    account: any;
    contacts: {
        data: Contact[];
        links: any;
        meta: any;
    };
    tags: TagItem[];
    segments: Segment[];
    importBatches?: ContactImportBatch[];
    contactStats?: Record<string, number>;
    selectedContact?: Contact | null;
    filters: {
        search?: string;
        status?: string;
        tags?: number[];
        segments?: number[];
    };
}) {
    const { workspace_permissions } = usePage().props as any;
    const canExportContacts = Boolean(workspace_permissions?.['contacts.export']);
    const confirm = useConfirm();
    const [search, setSearch] = useState(filters.search || '');
    const [showFilters, setShowFilters] = useState(false);
    const [selected, setSelected] = useState<Set<number>>(new Set());
    const [navigatingContactId, setNavigatingContactId] = useState<number | null>(null);
    const [deletingContactId, setDeletingContactId] = useState<number | null>(null);
    const [drawerMode, setDrawerMode] = useState<'create' | 'import' | 'view' | 'edit' | 'bulkTags' | null>(() => {
        const params = new URLSearchParams(window.location.search);
        if (params.get('create') === '1') return 'create';
        if (params.get('contact')) return 'view';
        return null;
    });
    const [activeContactSlug, setActiveContactSlug] = useState<string | null>(() => new URLSearchParams(window.location.search).get('contact'));
    const activeContact = contacts.data.find((contact) => String(contact.slug || contact.id) === String(activeContactSlug) || String(contact.id) === String(activeContactSlug)) || selectedContact || null;
    const parsedPhone = splitPhoneNumber('+91');
    const [createCountryCode, setCreateCountryCode] = useState(parsedPhone.countryCode);
    const [createPhone, setCreatePhone] = useState(parsedPhone.localPhone);
    const [bulkTagMode, setBulkTagMode] = useState<'add' | 'replace' | 'remove'>('add');
    const [bulkTagIds, setBulkTagIds] = useState<number[]>([]);
    const [bulkTagBusy, setBulkTagBusy] = useState(false);
    const createForm = useForm({
        wa_id: '',
        name: '',
        email: '',
        phone: '',
        company: '',
        notes: '',
        status: 'active',
        tags: [] as number[],
    });
    const importForm = useForm({
        file: null as File | null,
        tags: [] as number[],
    });
    const editForm = useForm({
        name: '',
        email: '',
        phone: '',
        company: '',
        notes: '',
        status: 'active',
        tags: [] as number[],
    });

    const pageStatusCounts = useMemo(() => {
        return contacts.data.reduce<Record<string, number>>((acc, contact) => {
            acc[contact.status] = (acc[contact.status] || 0) + 1;
            return acc;
        }, {});
    }, [contacts.data]);

    const statusCounts = contactStats || pageStatusCounts;
    const totalContacts = Number(contactStats?.total ?? contacts.meta?.total ?? contacts.data.length);
    const selectedAll = contacts.data.length > 0 && contacts.data.every((contact) => selected.has(contact.id));
    const activeImports = importBatches.filter((batch) => ['queued', 'processing'].includes(batch.status));

    useEffect(() => {
        setSearch(filters.search || '');
    }, [filters.search]);

    useEffect(() => {
        if (activeImports.length === 0) return;

        const timer = window.setInterval(() => {
            router.reload({
                only: ['contacts', 'importBatches'],
            });
        }, 3000);

        return () => window.clearInterval(timer);
    }, [activeImports.length]);

    useEffect(() => {
        const normalizedSearch = search.trim();
        const currentSearch = filters.search || '';
        if (normalizedSearch === currentSearch) return;

        const timer = window.setTimeout(() => {
            router.get(route('app.contacts.index', {}), { search: normalizedSearch || undefined, status: filters.status || undefined }, {
                preserveState: true,
                preserveScroll: true,
                replace: true,
                only: ['contacts', 'contactStats', 'filters', 'selectedContact'],
            });
        }, 350);

        return () => window.clearTimeout(timer);
    }, [search, filters.search, filters.status]);

    const handleSearch: FormEventHandler = (e) => {
        e.preventDefault();
        router.get(route('app.contacts.index', {}), { search: search.trim() || undefined, status: filters.status || undefined }, {
            preserveState: true,
            preserveScroll: true,
            replace: true,
            only: ['contacts', 'contactStats', 'filters', 'selectedContact'],
        });
    };

    const applyStatus = (status?: string) => {
        router.get(route('app.contacts.index', {}), { search, status }, {
            preserveState: true,
            preserveScroll: true,
            replace: true,
            only: ['contacts', 'contactStats', 'filters', 'selectedContact'],
        });
    };

    const handleDeleteContact = async (contact: Contact) => {
        const confirmed = await confirm({
            title: 'Delete contact',
            message: `Delete contact "${contact.name || contact.wa_id}"? This action cannot be undone.`,
            confirmText: 'Delete contact',
            variant: 'danger',
        });
        if (!confirmed) return;

        setDeletingContactId(contact.id);
        router.delete(route('app.contacts.destroy', { contact: contact.slug || contact.id }), {
            preserveScroll: true,
            onFinish: () => setDeletingContactId(null),
        });
    };

    const handleBulkDelete = async () => {
        const ids = Array.from(selected);
        if (ids.length === 0) return;
        const confirmed = await confirm({
            title: 'Delete selected contacts',
            message: `Delete ${ids.length} selected contact(s)? Contacts with conversation history will be skipped.`,
            confirmText: 'Delete contacts',
            variant: 'danger',
        });
        if (!confirmed) return;

        router.delete(route('app.contacts.bulk-destroy'), {
            data: { ids },
            preserveScroll: true,
            onSuccess: () => setSelected(new Set()),
        });
    };

    const openBulkTags = () => {
        setBulkTagMode('add');
        setBulkTagIds([]);
        setActiveContactSlug(null);
        setDrawerMode('bulkTags');
    };

    const handleBulkTags = () => {
        const ids = Array.from(selected);
        if (ids.length === 0 || bulkTagIds.length === 0) return;

        setBulkTagBusy(true);
        router.post(route('app.contacts.bulk-tags'), {
            ids,
            tags: bulkTagIds,
            mode: bulkTagMode,
        }, {
            preserveScroll: true,
            onSuccess: () => {
                setSelected(new Set());
                closeDrawer();
            },
            onFinish: () => setBulkTagBusy(false),
        });
    };

    const handleMessageSelected = () => {
        const ids = Array.from(selected);
        if (ids.length === 1) {
            const contact = contacts.data.find((item) => item.id === ids[0]);
            if (contact) {
                router.visit(route('app.whatsapp.conversations.by-contact', { contact: contact.slug || contact.id }));
            }

            return;
        }

        router.visit(route('app.broadcasts.index', { contacts: ids.join(',') }));
    };

    const toggleSelected = (id: number) => {
        setSelected((current) => {
            const next = new Set(current);
            next.has(id) ? next.delete(id) : next.add(id);
            return next;
        });
    };

    const toggleAll = () => {
        setSelected(selectedAll ? new Set() : new Set(contacts.data.map((contact) => contact.id)));
    };

    const openCreate = () => {
        createForm.reset();
        setCreateCountryCode('+91');
        setCreatePhone('');
        setActiveContactSlug(null);
        setDrawerMode('create');
    };

    const openImport = () => {
        importForm.reset();
        importForm.clearErrors();
        setActiveContactSlug(null);
        setDrawerMode('import');
    };

    const openContact = (contact: Contact) => {
        setActiveContactSlug(contact.slug || String(contact.id));
        setDrawerMode('view');
    };

    const openEditContact = (contact: Contact) => {
        setActiveContactSlug(contact.slug || String(contact.id));
        editForm.clearErrors();
        editForm.setData({
            name: contact.name || '',
            email: contact.email || '',
            phone: contact.phone || contact.wa_id || '',
            company: contact.company || '',
            notes: contact.notes || '',
            status: contact.status || 'active',
            tags: (contact.tags || []).map((tag) => tag.id),
        });
        setDrawerMode('edit');
    };

    const closeDrawer = () => {
        setDrawerMode(null);
        setActiveContactSlug(null);
        setBulkTagIds([]);
    };

    const submitContact = () => {
        const normalizedPhone = `${createCountryCode}${createPhone}`.replace(/\D/g, '');
        createForm.setData('wa_id', normalizedPhone);
        createForm.setData('phone', normalizedPhone);
        router.post(route('app.contacts.store', {}), {
            ...createForm.data,
            wa_id: normalizedPhone,
            phone: normalizedPhone,
        }, {
            preserveScroll: true,
            preserveState: false,
            onSuccess: closeDrawer,
        });
    };

    const submitImport = () => {
        if (!importForm.data.file) {
            importForm.setError('file', 'Choose a CSV file to upload.');
            return;
        }

        importForm.post(route('app.contacts.import', {}), {
            preserveScroll: true,
            forceFormData: true,
            onSuccess: () => {
                importForm.reset();
                closeDrawer();
            },
        });
    };

    const submitEditContact = () => {
        if (!activeContact) return;

        editForm.put(route('app.contacts.update', { contact: activeContact.slug || activeContact.id }), {
            preserveScroll: true,
            onSuccess: () => setDrawerMode('view'),
        });
    };

    const downloadSampleCsv = () => {
        const rows = [
            ['wa_id', 'name', 'email', 'phone', 'company', 'status', 'tags', 'notes'],
            ['919988776655', 'Aarav Sharma', 'aarav@example.com', '919988776655', 'Zyptos Retail', 'active', 'VIP,Support', 'Imported sample contact'],
        ];
        const csv = rows.map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(',')).join('\n');
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = 'zyptos-contact-import-sample.csv';
        link.click();
        URL.revokeObjectURL(url);
    };

    const tabs = [
        { value: undefined, label: 'All contacts', count: totalContacts },
        { value: 'active', label: 'Active', count: statusCounts.active || 0 },
        { value: 'inactive', label: 'Inactive', count: statusCounts.inactive || 0 },
        { value: 'blocked', label: 'Blocked', count: statusCounts.blocked || 0 },
        { value: 'opt_out', label: 'Opt out', count: statusCounts.opt_out || 0 },
    ];

    return (
        <AppShell>
            <Head title="Contacts" />
            <div className="module-page max-w-[1600px]">
                <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
                    <ContactStat
                        icon={<Users className="h-5 w-5" />}
                        tone="green"
                        label="Total contacts"
                        value={formatNumber(totalContacts)}
                    />
                    <ContactStat
                        icon={<UserCheck className="h-5 w-5" />}
                        tone="blue"
                        label="Active"
                        value={formatNumber(statusCounts.active || 0)}
                    />
                    <ContactStat
                        icon={<UserMinus className="h-5 w-5" />}
                        tone="amber"
                        label="Opted out"
                        value={formatNumber(statusCounts.opt_out || 0)}
                    />
                    <ContactStat
                        icon={<UserPlus className="h-5 w-5" />}
                        tone="purple"
                        label="Tags / segments"
                        value={`${tags.length} / ${segments.length}`}
                    />
                </div>

                <Card className="overflow-hidden border-transparent dark:border-slate-700/80">
                    <div className="border-b border-gray-100 px-4 pt-4 dark:border-waify-dark-border">
                        <div className="flex gap-1 overflow-x-auto">
                            {tabs.map((tab) => {
                                const active = filters.status === tab.value || (!filters.status && !tab.value);
                                return (
                                    <button
                                        key={tab.value || 'all'}
                                        type="button"
                                        onClick={() => applyStatus(tab.value)}
                                        className={`relative flex h-10 items-center gap-2 whitespace-nowrap px-3 text-sm font-medium transition ${
                                            active ? 'text-waify-text dark:text-waify-dark-text' : 'text-waify-text-muted hover:text-waify-text dark:text-waify-dark-text-muted dark:hover:text-waify-dark-text'
                                        }`}
                                    >
                                        {tab.label}
                                        <span className={`rounded-full px-1.5 py-0.5 text-[10px] font-semibold ${
                                            active
                                                ? 'bg-waify-green-soft text-waify-green-dark dark:bg-waify-dark-green-soft dark:text-emerald-200'
                                                : 'bg-gray-100 text-gray-500 dark:bg-waify-dark-surface-2 dark:text-waify-dark-text-muted'
                                        }`}>
                                            {formatNumber(tab.count)}
                                        </span>
                                        {active && <span className="absolute bottom-0 left-2 right-2 h-0.5 rounded-full bg-waify-green" />}
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    <CardContent className="p-3">
                        <form onSubmit={handleSearch} className="flex flex-col gap-2 lg:flex-row lg:items-center">
                            <div className="relative min-w-[240px] flex-1">
                                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-waify-text-muted dark:text-waify-dark-text-muted" />
                                <TextInput
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    placeholder="Search by name, phone, email, or company..."
                                    className="h-9 rounded-btn border-gray-200 pl-10 text-sm focus:border-waify-green focus:ring-waify-green/20 dark:border-waify-dark-border dark:bg-waify-dark-surface-2"
                                />
                            </div>
                            <Button type="button" variant="secondary" onClick={() => setShowFilters((value) => !value)}>
                                <Filter className="h-4 w-4" />
                                More filters
                            </Button>
                            <div className="hidden flex-1 lg:block" />
                            {selected.size > 0 && (
                                <div className="flex flex-wrap items-center gap-2 rounded-btn bg-gray-50 px-2 py-1 dark:bg-waify-dark-surface-2">
                                    <span className="text-xs font-medium text-waify-text-muted dark:text-waify-dark-text-muted">{selected.size} selected</span>
                                    <Button type="button" variant="secondary" size="sm" onClick={openBulkTags}>Tags</Button>
                                    <Button type="button" variant="secondary" size="sm" onClick={handleMessageSelected}>
                                        {selected.size === 1 ? 'Message' : 'Broadcast'}
                                    </Button>
                                    <Button type="button" variant="secondary" size="sm" onClick={handleBulkDelete} className="text-red-600 hover:text-red-700 dark:text-red-300">
                                        <Trash2 className="h-3.5 w-3.5" />
                                        Delete
                                    </Button>
                                </div>
                            )}
                            <Link href={canExportContacts ? route('app.contacts.export', {}) : '#'} onClick={(event) => !canExportContacts && event.preventDefault()}>
                                <Button type="button" variant="secondary" disabled={!canExportContacts} title={canExportContacts ? 'Export contacts' : 'Requires contacts export permission'}>
                                    <Download className="h-4 w-4" />
                                    Export
                                </Button>
                            </Link>
                            <Button type="button" variant="secondary" onClick={openImport}>
                                <Upload className="h-4 w-4" />
                                Bulk upload
                            </Button>
                            <Button type="button" onClick={openCreate}>
                                <Plus className="h-4 w-4" />
                                Add Contact
                            </Button>
                        </form>

                        {showFilters && (
                            <div className="mt-3 grid gap-3 rounded-card border border-gray-100 bg-gray-50/70 p-4 text-sm dark:border-waify-dark-border dark:bg-waify-dark-surface-2/70 md:grid-cols-2">
                                <div>
                                    <div className="mb-2 flex items-center justify-between">
                                        <p className="font-medium text-waify-text dark:text-waify-dark-text">Popular tags</p>
                                        <Link href={route('app.contacts.tags.index')} className="text-xs font-semibold text-waify-green-dark dark:text-emerald-300">Manage tags</Link>
                                    </div>
                                    <div className="flex flex-wrap gap-2">
                                        {tags.slice(0, 8).map((tag) => (
                                            <span key={tag.id} className="rounded-md px-2 py-1 text-xs font-medium ring-1 ring-inset" style={{ backgroundColor: `${tag.color}14`, color: tag.color, borderColor: `${tag.color}33` }}>
                                                {tag.name}
                                            </span>
                                        ))}
                                        {tags.length === 0 && <span className="text-waify-text-muted dark:text-waify-dark-text-muted">No tags yet</span>}
                                    </div>
                                </div>
                                <div>
                                    <div className="mb-2 flex items-center justify-between">
                                        <p className="font-medium text-waify-text dark:text-waify-dark-text">Segments</p>
                                        <Link href={route('app.contacts.segments.index')} className="text-xs font-semibold text-waify-green-dark dark:text-emerald-300">Open segments</Link>
                                    </div>
                                    <div className="flex flex-wrap gap-2">
                                        {segments.slice(0, 8).map((segment) => (
                                            <span key={segment.id} className="rounded-md bg-white px-2 py-1 text-xs font-medium text-waify-text ring-1 ring-gray-200 dark:bg-waify-dark-surface dark:text-waify-dark-text dark:ring-waify-dark-border">
                                                {segment.name} ({formatNumber(segment.contact_count)})
                                            </span>
                                        ))}
                                        {segments.length === 0 && <span className="text-waify-text-muted dark:text-waify-dark-text-muted">No segments yet</span>}
                                    </div>
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {importBatches.length > 0 && (
                    <Card className="border-transparent dark:border-slate-700/80">
                        <CardContent className="p-4">
                            <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                                <div>
                                    <div className="flex items-center gap-2">
                                        <Upload className="h-4 w-4 text-waify-green" />
                                        <h2 className="text-sm font-semibold text-waify-text dark:text-waify-dark-text">Import progress</h2>
                                    </div>
                                    <p className="mt-1 text-xs text-waify-text-muted dark:text-waify-dark-text-muted">
                                        Large CSV uploads continue in the background. Keep working while Zyptos creates or updates contacts.
                                    </p>
                                </div>
                                {activeImports.length > 0 && (
                                    <Badge variant="warning" className="w-fit">
                                        <Loader2 className="mr-1 h-3 w-3 animate-spin" />
                                        {activeImports.length} running
                                    </Badge>
                                )}
                            </div>

                            <div className="mt-4 grid gap-3 xl:grid-cols-2">
                                {importBatches.map((batch) => {
                                    const isActive = ['queued', 'processing'].includes(batch.status);
                                    const isFailed = batch.status === 'failed';
                                    const statusTone = isFailed ? 'text-red-600 dark:text-red-300' : isActive ? 'text-amber-600 dark:text-amber-300' : 'text-waify-green-dark dark:text-emerald-300';

                                    return (
                                        <div key={batch.id} className="rounded-card border border-gray-100 bg-white p-3 dark:border-waify-dark-border dark:bg-waify-dark-surface-2">
                                            <div className="flex items-start justify-between gap-3">
                                                <div className="min-w-0">
                                                    <p className="truncate text-sm font-semibold text-waify-text dark:text-waify-dark-text">{batch.filename || `Import #${batch.id}`}</p>
                                                    <p className={`mt-0.5 text-xs font-semibold capitalize ${statusTone}`}>{batch.status}</p>
                                                </div>
                                                <span className="text-xs font-semibold tabular-nums text-waify-text-muted dark:text-waify-dark-text-muted">{batch.progress}%</span>
                                            </div>
                                            <div className="mt-3 h-2 overflow-hidden rounded-full bg-gray-100 dark:bg-waify-dark-surface">
                                                <div
                                                    className={`h-full rounded-full transition-all ${isFailed ? 'bg-red-500' : 'bg-waify-green'}`}
                                                    style={{ width: `${Math.max(4, batch.progress)}%` }}
                                                />
                                            </div>
                                            <div className="mt-3 grid grid-cols-4 gap-2 text-center text-xs">
                                                <div className="rounded-md bg-gray-50 p-2 dark:bg-waify-dark-surface">
                                                    <p className="font-bold text-waify-text dark:text-waify-dark-text">{formatNumber(batch.processed_rows)}/{formatNumber(batch.total_rows)}</p>
                                                    <p className="text-waify-text-muted dark:text-waify-dark-text-muted">Rows</p>
                                                </div>
                                                <div className="rounded-md bg-gray-50 p-2 dark:bg-waify-dark-surface">
                                                    <p className="font-bold text-waify-text dark:text-waify-dark-text">{formatNumber(batch.imported_count)}</p>
                                                    <p className="text-waify-text-muted dark:text-waify-dark-text-muted">New</p>
                                                </div>
                                                <div className="rounded-md bg-gray-50 p-2 dark:bg-waify-dark-surface">
                                                    <p className="font-bold text-waify-text dark:text-waify-dark-text">{formatNumber(batch.updated_count)}</p>
                                                    <p className="text-waify-text-muted dark:text-waify-dark-text-muted">Updated</p>
                                                </div>
                                                <div className="rounded-md bg-gray-50 p-2 dark:bg-waify-dark-surface">
                                                    <p className={`font-bold ${batch.error_count > 0 ? 'text-red-600 dark:text-red-300' : 'text-waify-text dark:text-waify-dark-text'}`}>{formatNumber(batch.error_count)}</p>
                                                    <p className="text-waify-text-muted dark:text-waify-dark-text-muted">Skipped</p>
                                                </div>
                                            </div>
                                            {batch.errors?.length > 0 && (
                                                <div className="mt-2 flex items-center justify-between gap-2 rounded-md bg-red-50 px-2 py-1.5 text-xs text-red-700 dark:bg-red-500/10 dark:text-red-200">
                                                    <p className="min-w-0 truncate">{batch.errors[0]}</p>
                                                    <a
                                                        href={route('app.contacts.imports.errors', { batch: batch.id })}
                                                        className="shrink-0 font-semibold hover:underline"
                                                    >
                                                        Download errors
                                                    </a>
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        </CardContent>
                    </Card>
                )}

                {contacts.data.length === 0 ? (
                    <Card className="border-transparent dark:border-slate-700/80">
                        <CardContent className="py-16 text-center">
                            <EmptyState
                                icon={Users}
                                title="No contacts found"
                                description="Try adjusting your search or add a WhatsApp contact to start building your audience."
                                action={
                                    <Button onClick={openCreate}>
                                        <Plus className="h-4 w-4" />
                                        Add Contact
                                    </Button>
                                }
                            />
                        </CardContent>
                    </Card>
                ) : (
                    <Card className="overflow-hidden border-transparent dark:border-slate-700/80">
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="bg-gray-50/70 text-left text-[11px] uppercase tracking-wider text-waify-text-muted dark:bg-waify-dark-surface-2/60 dark:text-waify-dark-text-muted">
                                        <th className="w-10 px-5 py-3">
                                            <input type="checkbox" checked={selectedAll} onChange={toggleAll} className="h-4 w-4 rounded accent-waify-green" />
                                        </th>
                                        <th className="px-5 py-3 font-medium">Name</th>
                                        <th className="px-5 py-3 font-medium">Phone</th>
                                        <th className="px-5 py-3 font-medium">Tags</th>
                                        <th className="px-5 py-3 font-medium">Segments</th>
                                        <th className="px-5 py-3 font-medium">Last activity</th>
                                        <th className="px-5 py-3 font-medium">Status</th>
                                        <th className="px-5 py-3 text-right font-medium">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {contacts.data.map((contact) => {
                                        const status = statusConfig(contact.status);
                                        return (
                                            <tr key={contact.id} className="group border-t border-gray-100 transition hover:bg-gray-50/70 dark:border-waify-dark-border dark:hover:bg-waify-dark-surface-2/50">
                                                <td className="px-5 py-3">
                                                    <input
                                                        type="checkbox"
                                                        checked={selected.has(contact.id)}
                                                        onChange={() => toggleSelected(contact.id)}
                                                        className="h-4 w-4 rounded accent-waify-green"
                                                    />
                                                </td>
                                                <td className="px-5 py-3">
                                                    <div className="flex items-center gap-3">
                                                        <Avatar name={contact.name || contact.wa_id} size="md" />
                                                        <div className="min-w-0">
                                                            <button type="button" onClick={() => openContact(contact)} className="font-semibold text-waify-text hover:text-waify-green-dark dark:text-waify-dark-text dark:hover:text-emerald-300">
                                                                {contact.name || contact.wa_id}
                                                            </button>
                                                            <div className="mt-0.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-waify-text-muted dark:text-waify-dark-text-muted">
                                                                {contact.email && <span className="inline-flex items-center gap-1"><Mail className="h-3 w-3" />{contact.email}</span>}
                                                                {contact.company && <span className="inline-flex items-center gap-1"><Building2 className="h-3 w-3" />{contact.company}</span>}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-5 py-3 text-waify-text dark:text-waify-dark-text">
                                                    <div className="space-y-1">
                                                        {contact.wa_id && <span className="flex items-center gap-1.5 tabular-nums"><MessageCircle className="h-3.5 w-3.5 text-waify-text-muted" />{contact.wa_id}</span>}
                                                        {contact.phone && <span className="flex items-center gap-1.5 text-xs tabular-nums text-waify-text-muted dark:text-waify-dark-text-muted"><Phone className="h-3.5 w-3.5" />{contact.phone}</span>}
                                                    </div>
                                                </td>
                                                <td className="px-5 py-3">
                                                    <div className="flex max-w-xs flex-wrap gap-1.5">
                                                        {(contact.tags ?? []).length > 0 ? (
                                                            (contact.tags ?? []).map((tag) => (
                                                                <Badge key={tag.id} variant="default" style={{ backgroundColor: `${tag.color}20`, color: tag.color }}>
                                                                    {tag.name}
                                                                </Badge>
                                                            ))
                                                        ) : (
                                                            <span className="text-xs text-waify-text-muted dark:text-waify-dark-text-muted">None</span>
                                                        )}
                                                    </div>
                                                </td>
                                                <td className="px-5 py-3">
                                                    <div className="flex max-w-xs flex-wrap gap-1.5">
                                                        {(contact.segments ?? []).length > 0 ? (
                                                            (contact.segments ?? []).map((segment) => (
                                                                <Badge key={segment.id} variant="secondary">{segment.name}</Badge>
                                                            ))
                                                        ) : (
                                                            <span className="text-xs text-waify-text-muted dark:text-waify-dark-text-muted">None</span>
                                                        )}
                                                    </div>
                                                </td>
                                                <td className="px-5 py-3 text-xs text-waify-text-muted dark:text-waify-dark-text-muted">
                                                    <span className="inline-flex items-center gap-1.5"><Clock className="h-3.5 w-3.5" />{formatRelative(contact.last_seen_at || contact.created_at)}</span>
                                                    <div className="mt-1 text-waify-text dark:text-waify-dark-text">{formatNumber(contact.message_count)} messages</div>
                                                </td>
                                                <td className="px-5 py-3">
                                                    <Badge variant={status.variant}>{status.label}</Badge>
                                                </td>
                                                <td className="px-5 py-3">
                                                    <div className="flex items-center justify-end gap-1 opacity-70 transition group-hover:opacity-100">
                                                        <IconButton
                                                            size="sm"
                                                            variant="outline"
                                                            disabled={navigatingContactId === contact.id}
                                                            onClick={() => {
                                                                setNavigatingContactId(contact.id);
                                                                router.visit(route('app.whatsapp.conversations.by-contact', { contact: contact.slug || contact.id }), {
                                                                    onFinish: () => setNavigatingContactId(null),
                                                                });
                                                            }}
                                                            aria-label={`Message ${contact.name || contact.wa_id}`}
                                                        >
                                                            {navigatingContactId === contact.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <MessageCircle className="h-3.5 w-3.5" />}
                                                        </IconButton>
                                                        <Button variant="secondary" size="sm" onClick={() => openContact(contact)}>View</Button>
                                                        <IconButton
                                                            size="sm"
                                                            variant="outline"
                                                            onClick={() => openEditContact(contact)}
                                                            aria-label={`Edit ${contact.name || contact.wa_id}`}
                                                        >
                                                            <Edit3 className="h-3.5 w-3.5" />
                                                        </IconButton>
                                                        <IconButton
                                                            size="sm"
                                                            variant="danger"
                                                            disabled={deletingContactId === contact.id}
                                                            onClick={() => handleDeleteContact(contact)}
                                                            aria-label={`Delete ${contact.name || contact.wa_id}`}
                                                        >
                                                            {deletingContactId === contact.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Trash2 className="h-3.5 w-3.5" />}
                                                        </IconButton>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>

                        {contacts.links && contacts.links.length > 3 && (
                            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-gray-100 bg-gray-50/40 px-5 py-3 text-xs text-waify-text-muted dark:border-waify-dark-border dark:bg-waify-dark-surface-2/40 dark:text-waify-dark-text-muted">
                                <div>
                                    Showing <span className="font-semibold text-waify-text dark:text-waify-dark-text">{formatNumber(contacts.data.length)}</span> of <span className="font-semibold text-waify-text dark:text-waify-dark-text">{formatNumber(totalContacts)}</span> contacts
                                </div>
                                <div className="flex flex-wrap gap-1">
                                    {contacts.links.map((link: any, index: number) => (
                                        <button
                                            key={index}
                                            type="button"
                                            onClick={() => link.url && router.visit(link.url)}
                                            disabled={!link.url}
                                            className={`h-8 min-w-8 rounded-md px-2 text-xs font-semibold transition ${
                                                link.active
                                                    ? 'bg-waify-text text-white dark:bg-waify-dark-text dark:text-waify-dark-bg'
                                                    : 'border border-gray-200 bg-white text-waify-text hover:bg-gray-50 dark:border-waify-dark-border dark:bg-waify-dark-surface dark:text-waify-dark-text dark:hover:bg-waify-dark-surface-2'
                                            } ${!link.url ? 'cursor-not-allowed opacity-45' : ''}`}
                                        >
                                            {paginationLabel(link.label)}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}
                    </Card>
                )}
                <Drawer
                    open={drawerMode !== null}
                    onClose={closeDrawer}
                    title={drawerMode === 'create' ? 'Add contact' : drawerMode === 'import' ? 'Bulk upload contacts' : drawerMode === 'edit' ? 'Edit contact' : drawerMode === 'bulkTags' ? 'Update tags' : activeContact?.name || activeContact?.wa_id || 'Contact details'}
                    description={drawerMode === 'create' ? 'Create a contact without leaving the audience table.' : drawerMode === 'import' ? 'Upload a CSV to create and update contacts in this workspace.' : drawerMode === 'edit' ? 'Update contact details, status, and tags.' : drawerMode === 'bulkTags' ? `Apply tag changes to ${selected.size} selected contact(s).` : 'Contact profile and quick actions.'}
                    className="max-w-xl"
                    footer={drawerMode === 'create' ? (
                        <div className="flex justify-end gap-2">
                            <Button variant="secondary" onClick={closeDrawer}>Cancel</Button>
                            <Button onClick={submitContact} disabled={createForm.processing}>Create contact</Button>
                        </div>
                    ) : drawerMode === 'import' ? (
                        <div className="flex justify-end gap-2">
                            <Button variant="secondary" onClick={closeDrawer}>Cancel</Button>
                            <Button onClick={submitImport} disabled={importForm.processing}>
                                {importForm.processing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
                                Upload CSV
                            </Button>
                        </div>
                    ) : drawerMode === 'edit' ? (
                        <div className="flex justify-end gap-2">
                            <Button variant="secondary" onClick={() => setDrawerMode('view')}>Cancel</Button>
                            <Button onClick={submitEditContact} disabled={editForm.processing}>
                                {editForm.processing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Edit3 className="h-4 w-4" />}
                                Save contact
                            </Button>
                        </div>
                    ) : drawerMode === 'bulkTags' ? (
                        <div className="flex justify-end gap-2">
                            <Button variant="secondary" onClick={closeDrawer}>Cancel</Button>
                            <Button onClick={handleBulkTags} disabled={bulkTagBusy || bulkTagIds.length === 0}>
                                {bulkTagBusy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Tag className="h-4 w-4" />}
                                Update tags
                            </Button>
                        </div>
                    ) : (
                        <div className="flex justify-end gap-2">
                            {activeContact && (
                                <Button variant="secondary" onClick={() => openEditContact(activeContact)}>
                                    <Edit3 className="h-4 w-4" /> Edit
                                </Button>
                            )}
                            {activeContact && (
                                <Button onClick={() => router.visit(route('app.whatsapp.conversations.by-contact', { contact: activeContact.slug || activeContact.id }))}>
                                    <MessageCircle className="h-4 w-4" /> Message
                                </Button>
                            )}
                        </div>
                    )}
                >
                    {drawerMode === 'create' ? (
                        <div className="space-y-4">
                            <div>
                                <label className="mb-1.5 block text-sm font-medium text-waify-text dark:text-waify-dark-text">Name</label>
                                <TextInput value={createForm.data.name} onChange={(event) => createForm.setData('name', event.target.value)} className="w-full" />
                            </div>
                            <CountryPhoneInput
                                countryCode={createCountryCode}
                                phone={createPhone}
                                onCountryCodeChange={(value) => {
                                    setCreateCountryCode(value);
                                    const normalized = `${value}${createPhone}`.replace(/\D/g, '');
                                    createForm.setData('wa_id', normalized);
                                    createForm.setData('phone', normalized);
                                }}
                                onPhoneChange={(value) => {
                                    setCreatePhone(value);
                                    const normalized = `${createCountryCode}${value}`.replace(/\D/g, '');
                                    createForm.setData('wa_id', normalized);
                                    createForm.setData('phone', normalized);
                                }}
                                error={createForm.errors.wa_id}
                            />
                            <div className="grid gap-3 sm:grid-cols-2">
                                <div>
                                    <label className="mb-1.5 block text-sm font-medium text-waify-text dark:text-waify-dark-text">Email</label>
                                    <TextInput value={createForm.data.email} onChange={(event) => createForm.setData('email', event.target.value)} className="w-full" />
                                </div>
                                <div>
                                    <label className="mb-1.5 block text-sm font-medium text-waify-text dark:text-waify-dark-text">Company</label>
                                    <TextInput value={createForm.data.company} onChange={(event) => createForm.setData('company', event.target.value)} className="w-full" />
                                </div>
                            </div>
                            <div>
                                <label className="mb-1.5 block text-sm font-medium text-waify-text dark:text-waify-dark-text">Status</label>
                                <select value={createForm.data.status} onChange={(event) => createForm.setData('status', event.target.value)} className="h-10 w-full rounded-btn border border-gray-200 bg-white px-3 text-sm text-waify-text dark:border-waify-dark-border dark:bg-waify-dark-surface dark:text-waify-dark-text">
                                    <option value="active">Active</option>
                                    <option value="inactive">Inactive</option>
                                    <option value="blocked">Blocked</option>
                                    <option value="opt_out">Opt out</option>
                                </select>
                            </div>
                        </div>
                    ) : drawerMode === 'import' ? (
                        <div className="space-y-5">
                            <div className="rounded-card border border-waify-border bg-gray-50 p-4 dark:border-waify-dark-border dark:bg-waify-dark-surface-2">
                                <div className="flex items-start gap-3">
                                    <ThemedIconTile tone="blue"><FileText className="h-5 w-5" /></ThemedIconTile>
                                    <div className="min-w-0">
                                        <p className="text-sm font-semibold text-waify-text dark:text-waify-dark-text">CSV format</p>
                                        <p className="mt-1 text-sm text-waify-text-muted dark:text-waify-dark-text-muted">
                                            Include at least <span className="font-mono">wa_id</span> or <span className="font-mono">phone</span>. Supported columns: name, email, company, status, tags, notes.
                                        </p>
                                        <Button type="button" variant="secondary" size="sm" className="mt-3" onClick={downloadSampleCsv}>
                                            <Download className="h-3.5 w-3.5" />
                                            Sample CSV
                                        </Button>
                                    </div>
                                </div>
                            </div>

                            <label className="flex cursor-pointer flex-col items-center justify-center rounded-card border border-dashed border-gray-300 bg-white px-4 py-8 text-center transition hover:border-waify-green hover:bg-waify-green-soft/30 dark:border-waify-dark-border dark:bg-waify-dark-surface dark:hover:border-emerald-400/60 dark:hover:bg-emerald-400/10">
                                <Upload className="h-8 w-8 text-waify-text-muted dark:text-waify-dark-text-muted" />
                                <span className="mt-3 text-sm font-semibold text-waify-text dark:text-waify-dark-text">
                                    {importForm.data.file ? importForm.data.file.name : 'Choose CSV file'}
                                </span>
                                <span className="mt-1 text-xs text-waify-text-muted dark:text-waify-dark-text-muted">CSV or TXT, up to 10 MB</span>
                                <input
                                    type="file"
                                    accept=".csv,text/csv,text/plain"
                                    className="sr-only"
                                    onChange={(event) => importForm.setData('file', event.target.files?.[0] ?? null)}
                                />
                            </label>
                            {importForm.errors.file && <p className="text-sm text-red-600 dark:text-red-300">{importForm.errors.file}</p>}

                            <div>
                                <label className="mb-2 block text-sm font-medium text-waify-text dark:text-waify-dark-text">Apply tags to all imported contacts</label>
                                <div className="flex flex-wrap gap-2">
                                    {tags.map((tag) => {
                                        const active = importForm.data.tags.includes(tag.id);
                                        return (
                                            <button
                                                key={tag.id}
                                                type="button"
                                                onClick={() => {
                                                    importForm.setData('tags', active
                                                        ? importForm.data.tags.filter((id) => id !== tag.id)
                                                        : [...importForm.data.tags, tag.id]);
                                                }}
                                                className={`rounded-md px-2.5 py-1.5 text-xs font-semibold ring-1 ring-inset transition ${active ? 'bg-waify-green text-white ring-waify-green' : 'bg-white text-waify-text ring-gray-200 hover:bg-gray-50 dark:bg-waify-dark-surface dark:text-waify-dark-text dark:ring-waify-dark-border dark:hover:bg-waify-dark-surface-2'}`}
                                                style={!active ? { color: tag.color } : undefined}
                                            >
                                                {tag.name}
                                            </button>
                                        );
                                    })}
                                    {tags.length === 0 && <span className="text-sm text-waify-text-muted dark:text-waify-dark-text-muted">No tags yet. CSV tag names will be created automatically.</span>}
                                </div>
                            </div>

                            <div className="rounded-card bg-gray-50 p-3 text-xs text-waify-text-muted dark:bg-waify-dark-surface-2 dark:text-waify-dark-text-muted">
                                Existing contacts are matched by WhatsApp ID and updated. New contacts are created. Phone numbers are normalized to digits for WhatsApp delivery.
                            </div>
                        </div>
                    ) : drawerMode === 'bulkTags' ? (
                        <div className="space-y-4">
                            <div>
                                <label className="mb-1.5 block text-sm font-medium text-waify-text dark:text-waify-dark-text">Action</label>
                                <select value={bulkTagMode} onChange={(event) => setBulkTagMode(event.target.value as 'add' | 'replace' | 'remove')} className="h-10 w-full rounded-btn border border-gray-200 bg-white px-3 text-sm text-waify-text dark:border-waify-dark-border dark:bg-waify-dark-surface dark:text-waify-dark-text">
                                    <option value="add">Add selected tags</option>
                                    <option value="replace">Replace existing tags</option>
                                    <option value="remove">Remove selected tags</option>
                                </select>
                            </div>
                            <div>
                                <label className="mb-2 block text-sm font-medium text-waify-text dark:text-waify-dark-text">Tags</label>
                                <div className="flex flex-wrap gap-2">
                                    {tags.map((tag) => {
                                        const active = bulkTagIds.includes(tag.id);
                                        return (
                                            <button
                                                key={tag.id}
                                                type="button"
                                                onClick={() => setBulkTagIds(active ? bulkTagIds.filter((id) => id !== tag.id) : [...bulkTagIds, tag.id])}
                                                className={`rounded-md px-2.5 py-1.5 text-xs font-semibold ring-1 ring-inset transition ${active ? 'bg-waify-green text-white ring-waify-green' : 'bg-white text-waify-text ring-gray-200 hover:bg-gray-50 dark:bg-waify-dark-surface dark:text-waify-dark-text dark:ring-waify-dark-border dark:hover:bg-waify-dark-surface-2'}`}
                                                style={!active ? { color: tag.color } : undefined}
                                            >
                                                {tag.name}
                                            </button>
                                        );
                                    })}
                                    {tags.length === 0 && <span className="text-sm text-waify-text-muted dark:text-waify-dark-text-muted">No tags yet. Create tags from Contacts first.</span>}
                                </div>
                            </div>
                            <div className="rounded-card bg-gray-50 p-3 text-xs text-waify-text-muted dark:bg-waify-dark-surface-2 dark:text-waify-dark-text-muted">
                                Selected contacts: {selected.size}. Replacing tags removes each contact's existing tags before applying the selected set.
                            </div>
                        </div>
                    ) : drawerMode === 'edit' && activeContact ? (
                        <div className="space-y-4">
                            <div>
                                <label className="mb-1.5 block text-sm font-medium text-waify-text dark:text-waify-dark-text">Name</label>
                                <TextInput value={editForm.data.name} onChange={(event) => editForm.setData('name', event.target.value)} className="w-full" />
                                {editForm.errors.name && <p className="mt-1 text-xs text-red-600 dark:text-red-300">{editForm.errors.name}</p>}
                            </div>
                            <div>
                                <label className="mb-1.5 block text-sm font-medium text-waify-text dark:text-waify-dark-text">Phone</label>
                                <TextInput value={editForm.data.phone} onChange={(event) => editForm.setData('phone', event.target.value)} className="w-full" />
                                {editForm.errors.phone && <p className="mt-1 text-xs text-red-600 dark:text-red-300">{editForm.errors.phone}</p>}
                            </div>
                            <div className="grid gap-3 sm:grid-cols-2">
                                <div>
                                    <label className="mb-1.5 block text-sm font-medium text-waify-text dark:text-waify-dark-text">Email</label>
                                    <TextInput value={editForm.data.email} onChange={(event) => editForm.setData('email', event.target.value)} className="w-full" />
                                    {editForm.errors.email && <p className="mt-1 text-xs text-red-600 dark:text-red-300">{editForm.errors.email}</p>}
                                </div>
                                <div>
                                    <label className="mb-1.5 block text-sm font-medium text-waify-text dark:text-waify-dark-text">Company</label>
                                    <TextInput value={editForm.data.company} onChange={(event) => editForm.setData('company', event.target.value)} className="w-full" />
                                </div>
                            </div>
                            <div>
                                <label className="mb-1.5 block text-sm font-medium text-waify-text dark:text-waify-dark-text">Status</label>
                                <select value={editForm.data.status} onChange={(event) => editForm.setData('status', event.target.value)} className="h-10 w-full rounded-btn border border-gray-200 bg-white px-3 text-sm text-waify-text dark:border-waify-dark-border dark:bg-waify-dark-surface dark:text-waify-dark-text">
                                    <option value="active">Active</option>
                                    <option value="inactive">Inactive</option>
                                    <option value="blocked">Blocked</option>
                                    <option value="opt_out">Opt out</option>
                                </select>
                            </div>
                            <div>
                                <label className="mb-2 block text-sm font-medium text-waify-text dark:text-waify-dark-text">Tags</label>
                                <div className="flex flex-wrap gap-2">
                                    {tags.map((tag) => {
                                        const active = editForm.data.tags.includes(tag.id);
                                        return (
                                            <button
                                                key={tag.id}
                                                type="button"
                                                onClick={() => {
                                                    editForm.setData('tags', active
                                                        ? editForm.data.tags.filter((id) => id !== tag.id)
                                                        : [...editForm.data.tags, tag.id]);
                                                }}
                                                className={`rounded-md px-2.5 py-1.5 text-xs font-semibold ring-1 ring-inset transition ${active ? 'bg-waify-green text-white ring-waify-green' : 'bg-white text-waify-text ring-gray-200 hover:bg-gray-50 dark:bg-waify-dark-surface dark:text-waify-dark-text dark:ring-waify-dark-border dark:hover:bg-waify-dark-surface-2'}`}
                                                style={!active ? { color: tag.color } : undefined}
                                            >
                                                {tag.name}
                                            </button>
                                        );
                                    })}
                                    {tags.length === 0 && <span className="text-sm text-waify-text-muted dark:text-waify-dark-text-muted">No tags yet.</span>}
                                </div>
                            </div>
                            <div>
                                <label className="mb-1.5 block text-sm font-medium text-waify-text dark:text-waify-dark-text">Notes</label>
                                <textarea
                                    value={editForm.data.notes}
                                    onChange={(event) => editForm.setData('notes', event.target.value)}
                                    rows={4}
                                    className="w-full resize-none rounded-btn border border-gray-200 bg-white px-3 py-2 text-sm text-waify-text dark:border-waify-dark-border dark:bg-waify-dark-surface dark:text-waify-dark-text"
                                />
                            </div>
                        </div>
                    ) : activeContact ? (
                        <div className="space-y-4">
                            <div className="flex items-center gap-3 rounded-card border border-gray-100 p-4 dark:border-waify-dark-border">
                                <Avatar name={activeContact.name || activeContact.wa_id} size="lg" />
                                <div>
                                    <p className="font-semibold text-waify-text dark:text-waify-dark-text">{activeContact.name || activeContact.wa_id}</p>
                                    <p className="text-sm text-waify-text-muted dark:text-waify-dark-text-muted">{activeContact.wa_id}</p>
                                </div>
                            </div>
                            <div className="grid gap-3 sm:grid-cols-2">
                                <div className="rounded-card bg-gray-50 p-3 dark:bg-waify-dark-surface-2">
                                    <p className="text-xs text-waify-text-muted dark:text-waify-dark-text-muted">Email</p>
                                    <p className="text-sm text-waify-text dark:text-waify-dark-text">{activeContact.email || 'Not set'}</p>
                                </div>
                                <div className="rounded-card bg-gray-50 p-3 dark:bg-waify-dark-surface-2">
                                    <p className="text-xs text-waify-text-muted dark:text-waify-dark-text-muted">Company</p>
                                    <p className="text-sm text-waify-text dark:text-waify-dark-text">{activeContact.company || 'Not set'}</p>
                                </div>
                                <div className="rounded-card bg-gray-50 p-3 dark:bg-waify-dark-surface-2">
                                    <p className="text-xs text-waify-text-muted dark:text-waify-dark-text-muted">Messages</p>
                                    <p className="text-sm text-waify-text dark:text-waify-dark-text">{formatNumber(activeContact.message_count)}</p>
                                </div>
                                <div className="rounded-card bg-gray-50 p-3 dark:bg-waify-dark-surface-2">
                                    <p className="text-xs text-waify-text-muted dark:text-waify-dark-text-muted">Status</p>
                                    <Badge variant={statusConfig(activeContact.status).variant}>{statusConfig(activeContact.status).label}</Badge>
                                </div>
                            </div>
                            <div className="flex flex-wrap gap-2">
                                {(activeContact.tags || []).map((tag) => <Badge key={tag.id} variant="default" style={{ backgroundColor: `${tag.color}20`, color: tag.color }}>{tag.name}</Badge>)}
                                {(activeContact.segments || []).map((segment) => <Badge key={segment.id} variant="secondary">{segment.name}</Badge>)}
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            <div className="flex items-center gap-3 rounded-card border border-gray-100 p-4 dark:border-waify-dark-border">
                                <div className="h-12 w-12 animate-pulse rounded-full bg-gray-100 dark:bg-waify-dark-surface-2" />
                                <div className="flex-1 space-y-2">
                                    <div className="h-4 w-40 animate-pulse rounded bg-gray-100 dark:bg-waify-dark-surface-2" />
                                    <div className="h-3 w-28 animate-pulse rounded bg-gray-100 dark:bg-waify-dark-surface-2" />
                                </div>
                            </div>
                            <div className="rounded-card border border-dashed border-gray-200 p-4 text-sm text-waify-text-muted dark:border-waify-dark-border dark:text-waify-dark-text-muted">
                                Loading contact details. If this continues, return to Contacts and select the contact again.
                            </div>
                        </div>
                    )}
                </Drawer>
            </div>
        </AppShell>
    );
}
