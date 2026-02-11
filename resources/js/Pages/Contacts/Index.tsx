import { Link, router } from '@inertiajs/react';
import AppShell from '@/Layouts/AppShell';
import { Card, CardContent } from '@/Components/UI/Card';
import { Badge } from '@/Components/UI/Badge';
import Button from '@/Components/UI/Button';
import { Plus, Search, Download, Users, Filter, Tag, FolderOpen, Loader2, Trash2 } from 'lucide-react';
import { Head } from '@inertiajs/react';
import { useState, FormEventHandler } from 'react';
import TextInput from '@/Components/TextInput';
import { EmptyState } from '@/Components/UI/EmptyState';

interface Contact {
    id: number;
    slug: string;
    wa_id: string;
    name: string | null;
    email: string | null;
    phone: string | null;
    company: string | null;
    status: string;
    message_count: number;
    last_seen_at: string | null;
    tags: Array<{ id: number; name: string; color: string }>;
    segments?: Array<{ id: number; name: string }>;
    created_at: string;
}

interface Tag {
    id: number;
    name: string;
    color: string;
}

interface Segment {
    id: number;
    name: string;
    contact_count: number;
}

export default function ContactsIndex({
    account,
    contacts,
    tags,
    segments,
    filters}: {
    account: any;
    contacts: {
        data: Contact[];
        links: any;
        meta: any;
    };
    tags: Tag[];
    segments: Segment[];
    filters: {
        search?: string;
        status?: string;
        tags?: number[];
        segments?: number[];
    };
}) {
    const [search, setSearch] = useState(filters.search || '');
    const [showFilters, setShowFilters] = useState(false);
    const [navigatingContactId, setNavigatingContactId] = useState<number | null>(null);
    const [deletingContactId, setDeletingContactId] = useState<number | null>(null);

    const handleSearch: FormEventHandler = (e) => {
        e.preventDefault();
        router.get(route('app.contacts.index', {}), { search }, {
            preserveState: true,
            preserveScroll: true});
    };

    const getStatusBadge = (status: string) => {
        const statusMap: Record<string, { variant: 'success' | 'warning' | 'danger' | 'default'; label: string }> = {
            active: { variant: 'success', label: 'Active' },
            inactive: { variant: 'default', label: 'Inactive' },
            blocked: { variant: 'danger', label: 'Blocked' },
            opt_out: { variant: 'warning', label: 'Opt Out' }};

        const config = statusMap[status] || { variant: 'default' as const, label: status };
        return <Badge variant={config.variant}>{config.label}</Badge>;
    };

    const handleDeleteContact = (contact: Contact) => {
        if (!confirm(`Delete contact "${contact.name || contact.wa_id}"? This action cannot be undone.`)) {
            return;
        }

        setDeletingContactId(contact.id);
        router.delete(route('app.contacts.destroy', { contact: contact.slug || contact.id }), {
            preserveScroll: true,
            onFinish: () => setDeletingContactId(null),
        });
    };

    return (
        <AppShell>
            <Head title="Contacts" />
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-gray-100 dark:to-gray-300 bg-clip-text text-transparent">
                            Contacts
                        </h1>
                        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                            Manage your contacts and customer relationships
                        </p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        <Link href={route('app.contacts.tags.index')}>
                            <Button variant="secondary">
                                <Tag className="h-4 w-4 mr-2" />
                                Tags
                            </Button>
                        </Link>
                        <Link href={route('app.contacts.segments.index')}>
                            <Button variant="secondary">
                                <FolderOpen className="h-4 w-4 mr-2" />
                                Segments
                            </Button>
                        </Link>
                        <Link href={route('app.contacts.export', {})}>
                            <Button variant="secondary">
                                <Download className="h-4 w-4 mr-2" />
                                Export
                            </Button>
                        </Link>
                        <Link href={route('app.contacts.create', {})}>
                            <Button className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700">
                                <Plus className="h-4 w-4 mr-2" />
                                Add Contact
                            </Button>
                        </Link>
                    </div>
                </div>

                {/* Search and Filters */}
                <Card>
                    <CardContent className="p-4">
                        <form onSubmit={handleSearch} className="flex gap-2">
                            <div className="flex-1 relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                                <TextInput
                                    type="text"
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    placeholder="Search contacts..."
                                    className="pl-10 w-full"
                                />
                            </div>
                            <Button type="submit">Search</Button>
                            <Button
                                type="button"
                                variant="secondary"
                                onClick={() => setShowFilters(!showFilters)}
                            >
                                <Filter className="h-4 w-4 mr-2" />
                                Filters
                            </Button>
                        </form>
                    </CardContent>
                </Card>

                {contacts.data.length === 0 ? (
                    <Card className="border-0 shadow-xl">
                        <CardContent className="py-16 text-center">
                            <EmptyState
                                icon={Users}
                                title="No contacts yet"
                                description="Start building your contact list by adding contacts manually or importing from CSV"
                                action={
                                    <Link href={route('app.contacts.create', {})}>
                                        <Button className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700">
                                            <Plus className="h-4 w-4 mr-2" />
                                            Add Contact
                                        </Button>
                                    </Link>
                                }
                            />
                        </CardContent>
                    </Card>
                ) : (
                    <div className="space-y-4">
                        {contacts.data.map((contact) => (
                            <Card key={contact.id} className="border-0 shadow-lg hover:shadow-xl transition-shadow">
                                <CardContent className="p-6">
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-3 mb-2">
                                                <Link
                                                    href={route('app.contacts.show', {
                                                        contact: contact.slug || contact.id})}
                                                    className="text-lg font-semibold text-gray-900 dark:text-gray-100 hover:text-blue-600 dark:hover:text-blue-400"
                                                >
                                                    {contact.name || contact.wa_id}
                                                </Link>
                                                {getStatusBadge(contact.status)}
                                            </div>
                                            <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 dark:text-gray-400 mb-2">
                                                {contact.wa_id && (
                                                    <span>WhatsApp: {contact.wa_id}</span>
                                                )}
                                                {contact.email && (
                                                    <span>Email: {contact.email}</span>
                                                )}
                                                {contact.phone && (
                                                    <span>Phone: {contact.phone}</span>
                                                )}
                                                {contact.company && (
                                                    <span>Company: {contact.company}</span>
                                                )}
                                            </div>
                                            <div className="flex flex-wrap items-center gap-2 mt-2">
                                                <span className="text-xs font-medium text-gray-500 dark:text-gray-400">Tags:</span>
                                                {(contact.tags ?? []).length > 0 ? (
                                                    (contact.tags ?? []).map((tag) => (
                                                        <Badge
                                                            key={tag.id}
                                                            variant="default"
                                                            style={{ backgroundColor: tag.color + '20', color: tag.color }}
                                                        >
                                                            {tag.name}
                                                        </Badge>
                                                    ))
                                                ) : (
                                                    <span className="text-xs text-gray-400 dark:text-gray-500">None</span>
                                                )}
                                            </div>
                                            <div className="flex flex-wrap items-center gap-2 mt-1">
                                                <span className="text-xs font-medium text-gray-500 dark:text-gray-400">Segments:</span>
                                                {(contact.segments ?? []).length > 0 ? (
                                                    (contact.segments ?? []).map((seg) => (
                                                        <Badge key={seg.id} variant="secondary">
                                                            {seg.name}
                                                        </Badge>
                                                    ))
                                                ) : (
                                                    <span className="text-xs text-gray-400 dark:text-gray-500">None</span>
                                                )}
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                        <Button
                                            size="sm"
                                            className="bg-[#25D366] hover:bg-[#1DAA57] text-white"
                                            disabled={navigatingContactId === contact.id}
                                            onClick={() => {
                                                setNavigatingContactId(contact.id);
                                                router.visit(route('app.whatsapp.conversations.by-contact', { contact: contact.slug || contact.id }), {
                                                    onFinish: () => setNavigatingContactId(null),
                                                });
                                            }}
                                            aria-label={`Message ${contact.name || contact.wa_id}`}
                                        >
                                            {navigatingContactId === contact.id && <Loader2 className="h-3.5 w-3.5 animate-spin mr-1" aria-hidden />}
                                            Message
                                        </Button>
                                        <Link
                                            href={route('app.contacts.show', {
                                                contact: contact.slug || contact.id})}
                                        >
                                            <Button variant="secondary" size="sm">
                                                View
                                            </Button>
                                        </Link>
                                        <Button
                                            variant="secondary"
                                            size="sm"
                                            disabled={deletingContactId === contact.id}
                                            onClick={() => handleDeleteContact(contact)}
                                        >
                                            {deletingContactId === contact.id
                                                ? <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                                : <Trash2 className="h-3.5 w-3.5 text-red-600" />}
                                        </Button>
                                    </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}

                        {/* Pagination */}
                        {contacts.links && contacts.links.length > 3 && (
                            <div className="flex justify-center gap-2 mt-6">
                                {contacts.links.map((link: any, index: number) => (
                                    <button
                                        key={index}
                                        onClick={() => link.url && router.visit(link.url)}
                                        disabled={!link.url}
                                        className={`px-4 py-2 rounded-md text-sm font-medium ${
                                            link.active
                                                ? 'bg-blue-600 text-white'
                                                : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                                        } ${!link.url ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                                        dangerouslySetInnerHTML={{ __html: link.label }}
                                    />
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </div>
        </AppShell>
    );
}
