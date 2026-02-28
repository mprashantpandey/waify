import { Link, router, useForm } from '@inertiajs/react';
import AppShell from '@/Layouts/AppShell';
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/UI/Card';
import { Badge } from '@/Components/UI/Badge';
import Button from '@/Components/UI/Button';
import TextInput from '@/Components/TextInput';
import InputLabel from '@/Components/InputLabel';
import InputError from '@/Components/InputError';
import { ArrowLeft, Tag, Plus, Pencil, Trash2 } from 'lucide-react';
import { Head } from '@inertiajs/react';
import { useState } from 'react';
import { useToast } from '@/hooks/useToast';
import { EmptyState } from '@/Components/UI/EmptyState';

interface TagRow {
    id: number;
    name: string;
    color: string;
    description: string | null;
    contacts_count: number;
    created_at: string;
}

export default function TagsIndex({
    account,
    tags,
}: {
    account: any;
    tags: TagRow[];
}) {
    const { toast } = useToast();
    const [editingId, setEditingId] = useState<number | null>(null);
    const [showCreate, setShowCreate] = useState(false);

    const { data: createData, setData: setCreateData, post: postCreate, processing: creating, errors: createErrors, reset: resetCreate } = useForm({
        name: '',
        color: '#3B82F6',
        description: '',
    });

    const handleCreate = (e: React.FormEvent) => {
        e.preventDefault();
        postCreate(route('app.contacts.tags.store'), {
            onSuccess: () => {
                setShowCreate(false);
                resetCreate();
            },
            onError: () => toast.error('Failed to create tag'),
        });
    };

    const handleDelete = (tag: TagRow) => {
        if (!confirm(`Delete tag "${tag.name}"? Contacts will keep their data but this tag will be removed.`)) return;
        router.delete(route('app.contacts.tags.destroy', { tag: tag.id }), {
            onError: () => toast.error('Failed to delete tag'),
        });
    };

    const EditTagForm = ({ tag }: { tag: TagRow }) => {
        const { data, setData, put, processing, errors, reset } = useForm({
            name: tag.name,
            color: tag.color,
            description: tag.description || '',
        });
        const handleSubmit = (e: React.FormEvent) => {
            e.preventDefault();
            put(route('app.contacts.tags.update', { tag: tag.id }), {
                onSuccess: () => { setEditingId(null); },
                onError: () => toast.error('Failed to update tag'),
            });
        };
        return (
            <form onSubmit={handleSubmit} className="flex flex-wrap items-end gap-2 mt-2">
                <TextInput value={data.name} onChange={(e) => setData('name', e.target.value)} className="w-40" required />
                <input type="color" value={data.color} onChange={(e) => setData('color', e.target.value)} className="h-8 w-12 rounded border" />
                <TextInput value={data.description} onChange={(e) => setData('description', e.target.value)} className="w-48" placeholder="Description" />
                <Button type="submit" size="sm" disabled={processing}>Save</Button>
                <Button type="button" size="sm" variant="secondary" onClick={() => setEditingId(null)}>Cancel</Button>
                <InputError message={errors.name} />
            </form>
        );
    };

    return (
        <AppShell>
            <Head title="Contact Tags" />
            <div className="space-y-6">
                <div>
                    <Link
                        href={route('app.contacts.index')}
                        className="inline-flex items-center gap-2 text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 mb-4"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        Back to Contacts
                    </Link>
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                            <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-gray-100 dark:to-gray-300 bg-clip-text text-transparent">
                                Contact Tags
                            </h1>
                            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                                Organize contacts with tags. Use tags in filters and segments.
                            </p>
                        </div>
                        <Button onClick={() => setShowCreate(!showCreate)} className="w-full sm:w-auto">
                            <Plus className="h-4 w-4 mr-2" />
                            Add Tag
                        </Button>
                    </div>
                </div>

                {showCreate && (
                    <Card>
                        <CardHeader>
                            <CardTitle>New tag</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleCreate} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-[12rem_8rem_minmax(0,1fr)_auto] gap-4 items-end">
                                <div className="w-full">
                                    <InputLabel value="Name" />
                                    <TextInput
                                        value={createData.name}
                                        onChange={(e) => setCreateData('name', e.target.value)}
                                        className="mt-1"
                                        required
                                    />
                                    <InputError message={createErrors.name} />
                                </div>
                                <div className="w-full">
                                    <InputLabel value="Color" />
                                    <input
                                        type="color"
                                        value={createData.color}
                                        onChange={(e) => setCreateData('color', e.target.value)}
                                        className="mt-1 h-10 w-full rounded border border-gray-300 dark:border-gray-700"
                                    />
                                </div>
                                <div className="w-full">
                                    <InputLabel value="Description (optional)" />
                                    <TextInput
                                        value={createData.description}
                                        onChange={(e) => setCreateData('description', e.target.value)}
                                        className="mt-1"
                                    />
                                </div>
                                <div className="grid grid-cols-2 sm:flex gap-2">
                                    <Button type="submit" disabled={creating} className="w-full sm:w-auto">Create</Button>
                                    <Button type="button" variant="secondary" className="w-full sm:w-auto" onClick={() => { setShowCreate(false); resetCreate(); }}>Cancel</Button>
                                </div>
                            </form>
                        </CardContent>
                    </Card>
                )}

                {tags.length === 0 && !showCreate ? (
                    <Card>
                        <CardContent className="py-16 text-center">
                            <EmptyState
                                icon={Tag}
                                title="No tags yet"
                                description="Create tags to organize your contacts (e.g. VIP, Lead, Customer)."
                                action={<Button onClick={() => setShowCreate(true)}><Plus className="h-4 w-4 mr-2" />Add Tag</Button>}
                            />
                        </CardContent>
                    </Card>
                ) : (
                    <Card>
                        <CardContent className="p-0">
                            <ul className="divide-y divide-gray-200 dark:divide-gray-700">
                                {tags.map((tag) => (
                                    <li key={tag.id} className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between px-6 py-4">
                                        <div className="flex items-center gap-3 min-w-0">
                                            <span
                                                className="h-4 w-4 rounded-full shrink-0"
                                                style={{ backgroundColor: tag.color }}
                                            />
                                            <div className="min-w-0">
                                                <span className="font-medium text-gray-900 dark:text-gray-100 break-words">{tag.name}</span>
                                                {tag.description && (
                                                    <p className="text-sm text-gray-500 dark:text-gray-400">{tag.description}</p>
                                                )}
                                            </div>
                                            <Badge variant="default" className="ml-2">
                                                {tag.contacts_count} contact{tag.contacts_count !== 1 ? 's' : ''}
                                            </Badge>
                                        </div>
                                        <div className="flex flex-wrap items-stretch sm:items-center gap-2 sm:shrink-0">
                                            {editingId === tag.id ? (
                                                <EditTagForm key={tag.id} tag={tag} />
                                            ) : (
                                                <>
                                                    <Button variant="secondary" size="sm" className="w-full sm:w-auto" onClick={() => setEditingId(tag.id)}>
                                                        <Pencil className="h-4 w-4" />
                                                    </Button>
                                                    <Link href={route('app.contacts.index', { tags: [tag.id] })} className="w-full sm:w-auto">
                                                        <Button variant="secondary" size="sm" className="w-full sm:w-auto">View contacts</Button>
                                                    </Link>
                                                    <Button variant="secondary" size="sm" className="w-full sm:w-auto" onClick={() => handleDelete(tag)}>
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </>
                                            )}
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        </CardContent>
                    </Card>
                )}
            </div>
        </AppShell>
    );
}
