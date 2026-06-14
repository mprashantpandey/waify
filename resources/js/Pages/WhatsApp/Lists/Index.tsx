import { router, useForm } from '@inertiajs/react';
import AppShell from '@/Layouts/AppShell';
import { Card, CardContent } from '@/Components/UI/Card';
import { Badge } from '@/Components/UI/Badge';
import Button from '@/Components/UI/Button';
import { EmptyState } from '@/Components/UI/EmptyState';
import { CheckCircle2, Edit, Eye, List, ListChecks, MessageSquareText, Plus, Rows3, ToggleLeft, ToggleRight, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { useToast } from '@/hooks/useToast';
import { useConfirm } from '@/hooks/useConfirm';
import { Head } from '@inertiajs/react';
import { IconButton, ThemedIconTile } from '@/Components/UI/Elements';
import { Drawer } from '@/Components/UI/Elements';
import TextInput from '@/Components/TextInput';

interface ListItem {
    id: number;
    name: string;
    button_text: string;
    description: string | null;
    footer_text: string | null;
    sections: Array<{ title: string; rows: Array<{ id: string; title: string; description?: string | null }> }>;
    sections_count: number;
    total_rows: number;
    is_active: boolean;
    connection: {
        id: number;
        name: string;
    };
    created_at: string;
}

function formatNumber(value: number | string | null | undefined) {
    const numeric = Number(value ?? 0);
    return Number.isFinite(numeric) ? new Intl.NumberFormat('en-IN').format(numeric) : '0';
}

function formatDate(value: string | null | undefined) {
    if (!value) return 'Never';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return value;
    return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

export default function ListsIndex({
    account,
    lists,
    connections}: {
    account: any;
    lists: ListItem[];
    connections: Array<{ id: number; name: string }>;
}) {
    const { toast } = useToast();
    const confirm = useConfirm();
    const [toggling, setToggling] = useState<number | null>(null);
    const [deleting, setDeleting] = useState<number | null>(null);
    const [drawerMode, setDrawerMode] = useState<'create' | 'edit' | 'view' | null>(() => {
        const params = new URLSearchParams(window.location.search);
        if (params.get('create') === '1') return 'create';
        if (params.get('edit') === '1') return 'edit';
        if (params.get('list')) return 'view';
        return null;
    });
    const [activeListId, setActiveListId] = useState<number | null>(() => {
        const value = Number(new URLSearchParams(window.location.search).get('list'));
        return Number.isFinite(value) && value > 0 ? value : null;
    });
    const activeList = lists.find((list) => list.id === activeListId) || null;
    const defaultConnectionId = connections[0]?.id ?? '';
    const listForm = useForm({
        whatsapp_connection_id: defaultConnectionId,
        name: '',
        button_text: 'View options',
        description: '',
        footer_text: '',
        sections: [{ title: 'Options', rows: [{ id: 'option_1', title: 'Option 1', description: '' }] }],
    });
    const activeCount = lists.filter((list) => list.is_active).length;
    const totalSections = lists.reduce((sum, list) => sum + Number(list.sections_count || 0), 0);
    const totalRows = lists.reduce((sum, list) => sum + Number(list.total_rows || 0), 0);

    const handleToggle = async (list: ListItem) => {
        setToggling(list.id);
        try {
            await router.post(route('app.whatsapp.lists.toggle', { list: list.id }), {}, {
                preserveScroll: true,
                onSuccess: () => {
                    toast.success(`List ${list.is_active ? 'deactivated' : 'activated'}`);
                },
                onError: () => {
                    toast.error('Failed to update list status');
                },
                onFinish: () => setToggling(null),
            });
        } catch (error) {
            setToggling(null);
        }
    };

    const handleDelete = async (list: ListItem) => {
        const confirmed = await confirm({
            title: 'Delete List',
            message: `Are you sure you want to delete "${list.name}"? This action cannot be undone.`,
            confirmText: 'Delete',
            cancelText: 'Cancel',
        });

        if (!confirmed) return;

        setDeleting(list.id);
        try {
            await router.delete(route('app.whatsapp.lists.destroy', { list: list.id }), {
                preserveScroll: true,
                onSuccess: () => {
                    toast.success('List deleted successfully');
                },
                onError: () => {
                    toast.error('Failed to delete list');
                },
                onFinish: () => setDeleting(null),
            });
        } catch (error) {
            setDeleting(null);
        }
    };

    const openCreate = () => {
        listForm.reset();
        listForm.setData({
            whatsapp_connection_id: defaultConnectionId,
            name: '',
            button_text: 'View options',
            description: '',
            footer_text: '',
            sections: [{ title: 'Options', rows: [{ id: 'option_1', title: 'Option 1', description: '' }] }],
        });
        setActiveListId(null);
        setDrawerMode('create');
    };

    const openList = (list: ListItem, mode: 'view' | 'edit') => {
        setActiveListId(list.id);
        if (mode === 'edit') {
            const normalizedSections = (list.sections?.length ? list.sections : [{ title: 'Options', rows: [{ id: 'option_1', title: 'Option 1', description: '' }] }]).map((section) => ({
                title: section.title,
                rows: (section.rows || []).map((row) => ({
                    id: row.id,
                    title: row.title,
                    description: row.description || '',
                })),
            }));
            listForm.setData({
                whatsapp_connection_id: list.connection.id,
                name: list.name,
                button_text: list.button_text,
                description: list.description || '',
                footer_text: list.footer_text || '',
                sections: normalizedSections,
            });
        }
        setDrawerMode(mode);
    };

    const closeDrawer = () => {
        setDrawerMode(null);
        setActiveListId(null);
    };

    const addRow = () => {
        const sections = [...listForm.data.sections];
        const first = sections[0] || { title: 'Options', rows: [] };
        first.rows = [...(first.rows || []), { id: `option_${(first.rows || []).length + 1}`, title: `Option ${(first.rows || []).length + 1}`, description: '' }];
        sections[0] = first;
        listForm.setData('sections', sections);
    };

    const submitList = () => {
        if (drawerMode === 'edit' && activeList) {
            listForm.put(route('app.whatsapp.lists.update', { list: activeList.id }), {
                preserveScroll: true,
                onSuccess: closeDrawer,
                onError: () => toast.error('Failed to update list'),
            });
            return;
        }

        listForm.post(route('app.whatsapp.lists.store', {}), {
            preserveScroll: true,
            onSuccess: closeDrawer,
            onError: () => toast.error('Failed to create list'),
        });
    };

    return (
        <AppShell>
            <Head title="WhatsApp Lists" />
            <div className="module-page max-w-[1600px]">
                <div className="flex flex-wrap items-end justify-between gap-3">
                    <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-waify-green-dark dark:text-emerald-300">WhatsApp</p>
                        <h1 className="module-heading">Interactive Lists</h1>
                        <p className="module-subheading">Reusable WhatsApp list messages with sections, rows, and quick selection flows.</p>
                    </div>
                    <Button onClick={openCreate}>
                        <Plus className="h-4 w-4" />
                        Create List
                    </Button>
                </div>

                <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
                    <Card className="border-transparent dark:border-slate-700/80">
                        <CardContent className="flex items-center gap-3 p-4">
                            <ThemedIconTile tone="green"><ListChecks className="h-5 w-5" /></ThemedIconTile>
                            <div className="min-w-0">
                                <p className="text-xs text-waify-text-muted dark:text-waify-dark-text-muted">Lists</p>
                                <p className="text-xl font-bold text-waify-text dark:text-waify-dark-text">{formatNumber(lists.length)}</p>
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="border-transparent dark:border-slate-700/80">
                        <CardContent className="flex items-center gap-3 p-4">
                            <ThemedIconTile tone="blue"><CheckCircle2 className="h-5 w-5" /></ThemedIconTile>
                            <div className="min-w-0">
                                <p className="text-xs text-waify-text-muted dark:text-waify-dark-text-muted">Active</p>
                                <p className="text-xl font-bold text-waify-text dark:text-waify-dark-text">{formatNumber(activeCount)}</p>
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="border-transparent dark:border-slate-700/80">
                        <CardContent className="flex items-center gap-3 p-4">
                            <ThemedIconTile tone="purple"><Rows3 className="h-5 w-5" /></ThemedIconTile>
                            <div className="min-w-0">
                                <p className="text-xs text-waify-text-muted dark:text-waify-dark-text-muted">Sections</p>
                                <p className="text-xl font-bold text-waify-text dark:text-waify-dark-text">{formatNumber(totalSections)}</p>
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="border-transparent dark:border-slate-700/80">
                        <CardContent className="flex items-center gap-3 p-4">
                            <ThemedIconTile tone="amber"><MessageSquareText className="h-5 w-5" /></ThemedIconTile>
                            <div className="min-w-0">
                                <p className="text-xs text-waify-text-muted dark:text-waify-dark-text-muted">Rows</p>
                                <p className="text-xl font-bold text-waify-text dark:text-waify-dark-text">{formatNumber(totalRows)}</p>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {lists.length === 0 ? (
                    <Card className="border-transparent dark:border-slate-700/80">
                        <CardContent className="py-16">
                            <EmptyState
                                icon={List}
                                title="No lists found"
                                description="Create your first interactive list message to send to contacts."
                                action={
                                    <Button onClick={openCreate}>
                                        <Plus className="h-4 w-4" />
                                        Create List
                                    </Button>
                                }
                            />
                        </CardContent>
                    </Card>
                ) : (
                    <Card className="overflow-hidden border-transparent dark:border-slate-700/80">
                        <CardContent className="p-0">
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="bg-gray-50/70 text-left text-[11px] uppercase tracking-wider text-waify-text-muted dark:bg-waify-dark-surface-2/60 dark:text-waify-dark-text-muted">
                                            <th className="px-5 py-3 font-medium">List</th>
                                            <th className="px-5 py-3 font-medium">Button</th>
                                            <th className="px-5 py-3 font-medium">Structure</th>
                                            <th className="px-5 py-3 font-medium">WABA</th>
                                            <th className="px-5 py-3 font-medium">Status</th>
                                            <th className="px-5 py-3 text-right font-medium">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {lists.map((list) => (
                                            <tr
                                                key={list.id}
                                                className="border-t border-gray-100 transition hover:bg-gray-50/70 dark:border-waify-dark-border dark:hover:bg-waify-dark-surface-2/50"
                                            >
                                                <td className="px-5 py-3">
                                                    <button type="button" onClick={() => openList(list, 'view')} className="font-semibold text-waify-text hover:text-waify-green-dark dark:text-waify-dark-text dark:hover:text-emerald-300">
                                                        {list.name}
                                                    </button>
                                                    {list.description && (
                                                        <div className="mt-1 max-w-xs truncate text-xs text-waify-text-muted dark:text-waify-dark-text-muted">
                                                            {list.description}
                                                        </div>
                                                    )}
                                                    <div className="mt-1 text-xs text-waify-text-muted dark:text-waify-dark-text-muted">Created {formatDate(list.created_at)}</div>
                                                </td>
                                                <td className="whitespace-nowrap px-5 py-3">
                                                    <Badge variant="secondary" className="text-xs">
                                                        {list.button_text}
                                                    </Badge>
                                                </td>
                                                <td className="whitespace-nowrap px-5 py-3 text-sm text-waify-text-muted dark:text-waify-dark-text-muted">
                                                    {formatNumber(list.sections_count)} sections · {formatNumber(list.total_rows)} rows
                                                </td>
                                                <td className="whitespace-nowrap px-5 py-3 text-sm text-waify-text-muted dark:text-waify-dark-text-muted">
                                                    {list.connection.name}
                                                </td>
                                                <td className="whitespace-nowrap px-5 py-3">
                                                    <button
                                                        onClick={() => handleToggle(list)}
                                                        disabled={toggling === list.id}
                                                        className="flex items-center gap-2"
                                                    >
                                                        {list.is_active ? (
                                                            <Badge variant="success" className="flex items-center gap-1">
                                                                <ToggleRight className="h-3 w-3" />
                                                                Active
                                                            </Badge>
                                                        ) : (
                                                            <Badge variant="secondary" className="flex items-center gap-1">
                                                                <ToggleLeft className="h-3 w-3" />
                                                                Inactive
                                                            </Badge>
                                                        )}
                                                    </button>
                                                </td>
                                                <td className="whitespace-nowrap px-5 py-3 text-right text-sm font-medium">
                                                    <div className="flex items-center justify-end gap-2">
                                                        <IconButton size="sm" aria-label="View list" onClick={() => openList(list, 'view')}>
                                                            <Eye className="h-4 w-4" />
                                                        </IconButton>
                                                        <IconButton size="sm" aria-label="Edit list" onClick={() => openList(list, 'edit')}>
                                                            <Edit className="h-4 w-4" />
                                                        </IconButton>
                                                        <IconButton
                                                            size="sm"
                                                            variant="danger"
                                                            onClick={() => handleDelete(list)}
                                                            disabled={deleting === list.id}
                                                            aria-label="Delete list"
                                                        >
                                                            <Trash2 className="h-4 w-4" />
                                                        </IconButton>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </CardContent>
                    </Card>
                )}

                <Drawer
                    open={drawerMode !== null}
                    onClose={closeDrawer}
                    title={drawerMode === 'create' ? 'Create list' : drawerMode === 'edit' ? 'Edit list' : activeList?.name || 'List details'}
                    description={drawerMode === 'view' ? 'Preview sections and rows without leaving this page.' : 'Build a WhatsApp interactive list with one compact drawer.'}
                    className="max-w-2xl"
                    footer={drawerMode === 'view' ? (
                        <div className="flex justify-end gap-2">
                            {activeList && <Button variant="secondary" onClick={() => openList(activeList, 'edit')}><Edit className="h-4 w-4" /> Edit</Button>}
                            <Button onClick={closeDrawer}>Done</Button>
                        </div>
                    ) : (
                        <div className="flex justify-end gap-2">
                            <Button variant="secondary" onClick={closeDrawer}>Cancel</Button>
                            <Button onClick={submitList} disabled={listForm.processing}>{drawerMode === 'edit' ? 'Save list' : 'Create list'}</Button>
                        </div>
                    )}
                >
                    {drawerMode === 'view' && activeList ? (
                        <div className="space-y-4">
                            <div className="rounded-card border border-gray-100 p-4 dark:border-waify-dark-border">
                                <p className="text-sm text-waify-text-muted dark:text-waify-dark-text-muted">{activeList.description || 'No description'}</p>
                                <div className="mt-3 flex flex-wrap gap-2">
                                    <Badge variant={activeList.is_active ? 'success' : 'secondary'}>{activeList.is_active ? 'Active' : 'Inactive'}</Badge>
                                    <Badge variant="secondary">{activeList.button_text}</Badge>
                                    <Badge variant="secondary">{activeList.connection.name}</Badge>
                                </div>
                            </div>
                            {(activeList.sections || []).map((section, sectionIndex) => (
                                <div key={sectionIndex} className="rounded-card border border-gray-100 p-4 dark:border-waify-dark-border">
                                    <p className="font-semibold text-waify-text dark:text-waify-dark-text">{section.title}</p>
                                    <div className="mt-3 space-y-2">
                                        {(section.rows || []).map((row) => (
                                            <div key={row.id} className="rounded-btn bg-gray-50 p-3 dark:bg-waify-dark-surface-2">
                                                <p className="text-sm font-medium text-waify-text dark:text-waify-dark-text">{row.title}</p>
                                                {row.description && <p className="text-xs text-waify-text-muted dark:text-waify-dark-text-muted">{row.description}</p>}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="space-y-4">
                            <div className="grid gap-3 sm:grid-cols-2">
                                <div>
                                    <label className="mb-1.5 block text-sm font-medium text-waify-text dark:text-waify-dark-text">List name</label>
                                    <TextInput value={listForm.data.name} onChange={(e) => listForm.setData('name', e.target.value)} className="w-full" />
                                </div>
                                <div>
                                    <label className="mb-1.5 block text-sm font-medium text-waify-text dark:text-waify-dark-text">Button text</label>
                                    <TextInput value={listForm.data.button_text} onChange={(e) => listForm.setData('button_text', e.target.value)} className="w-full" />
                                </div>
                            </div>
                            <div>
                                <label className="mb-1.5 block text-sm font-medium text-waify-text dark:text-waify-dark-text">WABA account</label>
                                <select value={listForm.data.whatsapp_connection_id} onChange={(e) => listForm.setData('whatsapp_connection_id', Number(e.target.value))} className="h-10 w-full rounded-btn border border-gray-200 bg-white px-3 text-sm text-waify-text dark:border-waify-dark-border dark:bg-waify-dark-surface dark:text-waify-dark-text">
                                    {connections.map((connection) => <option key={connection.id} value={connection.id}>{connection.name}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="mb-1.5 block text-sm font-medium text-waify-text dark:text-waify-dark-text">Description</label>
                                <TextInput value={listForm.data.description} onChange={(e) => listForm.setData('description', e.target.value)} className="w-full" />
                            </div>
                            <div className="rounded-card border border-gray-100 p-4 dark:border-waify-dark-border">
                                <label className="mb-1.5 block text-sm font-medium text-waify-text dark:text-waify-dark-text">Section title</label>
                                <TextInput value={listForm.data.sections[0]?.title || ''} onChange={(e) => {
                                    const sections = [...listForm.data.sections];
                                    sections[0] = { ...(sections[0] || { rows: [] }), title: e.target.value };
                                    listForm.setData('sections', sections);
                                }} className="w-full" />
                                <div className="mt-3 space-y-2">
                                    {(listForm.data.sections[0]?.rows || []).map((row, rowIndex) => (
                                        <div key={rowIndex} className="grid gap-2 rounded-btn bg-gray-50 p-3 dark:bg-waify-dark-surface-2 sm:grid-cols-2">
                                            <TextInput value={row.title} onChange={(e) => {
                                                const sections = [...listForm.data.sections];
                                                sections[0].rows[rowIndex] = { ...row, title: e.target.value, id: row.id || `option_${rowIndex + 1}` };
                                                listForm.setData('sections', sections);
                                            }} placeholder="Row title" />
                                            <TextInput value={row.description || ''} onChange={(e) => {
                                                const sections = [...listForm.data.sections];
                                                sections[0].rows[rowIndex] = { ...row, description: e.target.value };
                                                listForm.setData('sections', sections);
                                            }} placeholder="Row description" />
                                        </div>
                                    ))}
                                </div>
                                <Button type="button" variant="secondary" size="sm" className="mt-3" onClick={addRow}>Add row</Button>
                            </div>
                        </div>
                    )}
                </Drawer>
            </div>
        </AppShell>
    );
}
