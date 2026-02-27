import { Link, router } from '@inertiajs/react';
import AppShell from '@/Layouts/AppShell';
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/UI/Card';
import { Badge } from '@/Components/UI/Badge';
import Button from '@/Components/UI/Button';
import { EmptyState } from '@/Components/UI/EmptyState';
import { List, Plus, Edit, Trash2, Eye, ToggleLeft, ToggleRight } from 'lucide-react';
import { useState } from 'react';
import { useToast } from '@/hooks/useToast';
import { useConfirm } from '@/hooks/useConfirm';
import { Head } from '@inertiajs/react';

interface ListItem {
    id: number;
    name: string;
    button_text: string;
    description: string | null;
    footer_text: string | null;
    sections_count: number;
    total_rows: number;
    is_active: boolean;
    connection: {
        id: number;
        name: string;
    };
    created_at: string;
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

    const handleToggle = async (list: ListItem) => {
        setToggling(list.id);
        try {
            await router.post(route('app.whatsapp.lists.toggle', { list: list.id }), {}, {
                preserveScroll: true,
                onSuccess: () => {
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

    return (
        <AppShell>
            <Head title="WhatsApp Lists" />
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">WhatsApp Lists</h1>
                        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                            Create and manage interactive list messages for WhatsApp
                        </p>
                    </div>
                    <Link href={route('app.whatsapp.lists.create', {})}>
                        <Button className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 shadow-lg shadow-green-500/50">
                            <Plus className="h-4 w-4 mr-2" />
                            Create List
                        </Button>
                    </Link>
                </div>

                {lists.length === 0 ? (
                    <Card className="border-0 shadow-xl">
                        <CardContent className="py-16">
                            <EmptyState
                                icon={List}
                                title="No lists found"
                                description="Create your first interactive list message to send to contacts."
                                action={
                                    <Link href={route('app.whatsapp.lists.create', {})}>
                                        <Button className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 shadow-lg shadow-green-500/50">
                                            <Plus className="h-4 w-4 mr-2" />
                                            Create List
                                        </Button>
                                    </Link>
                                }
                            />
                        </CardContent>
                    </Card>
                ) : (
                    <Card className="border-0 shadow-lg">
                        <CardContent className="p-0">
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 border-b border-gray-200 dark:border-gray-700">
                                        <tr>
                                            <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                                List Name
                                            </th>
                                            <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                                Button Text
                                            </th>
                                            <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                                Sections
                                            </th>
                                            <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                                Rows
                                            </th>
                                            <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                                Connection
                                            </th>
                                            <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                                Status
                                            </th>
                                            <th className="px-6 py-4 text-right text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                                Actions
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-800">
                                        {lists.map((list) => (
                                            <tr
                                                key={list.id}
                                                className="hover:bg-gradient-to-r hover:from-blue-50 hover:to-blue-100 dark:hover:from-blue-900/10 dark:hover:to-blue-800/10 transition-all duration-200"
                                            >
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                                                        {list.name}
                                                    </div>
                                                    {list.description && (
                                                        <div className="text-xs text-gray-500 dark:text-gray-400 mt-1 truncate max-w-xs">
                                                            {list.description}
                                                        </div>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <Badge variant="secondary" className="text-xs">
                                                        {list.button_text}
                                                    </Badge>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                                    {list.sections_count}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                                    {list.total_rows}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                                    {list.connection.name}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
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
                                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                    <div className="flex items-center justify-end gap-2">
                                                        <Link href={route('app.whatsapp.lists.show', { list: list.id })}>
                                                            <Button variant="ghost" size="sm">
                                                                <Eye className="h-4 w-4" />
                                                            </Button>
                                                        </Link>
                                                        <Link href={route('app.whatsapp.lists.edit', { list: list.id })}>
                                                            <Button variant="ghost" size="sm">
                                                                <Edit className="h-4 w-4" />
                                                            </Button>
                                                        </Link>
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() => handleDelete(list)}
                                                            disabled={deleting === list.id}
                                                        >
                                                            <Trash2 className="h-4 w-4 text-red-500" />
                                                        </Button>
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
            </div>
        </AppShell>
    );
}

