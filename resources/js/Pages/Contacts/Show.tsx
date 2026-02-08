import { Link, router, useForm } from '@inertiajs/react';
import AppShell from '@/Layouts/AppShell';
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/UI/Card';
import { Badge } from '@/Components/UI/Badge';
import Button from '@/Components/UI/Button';
import { ArrowLeft, Edit, MessageSquare, Mail, Phone, Building, Tag, Clock, User, Loader2 } from 'lucide-react';
import { Head } from '@inertiajs/react';
import { useToast } from '@/hooks/useToast';
import { useState } from 'react';
import TextInput from '@/Components/TextInput';
import InputLabel from '@/Components/InputLabel';

interface Contact {
    id: number;
    slug: string;
    wa_id: string;
    name: string | null;
    email: string | null;
    phone: string | null;
    company: string | null;
    notes: string | null;
    status: string;
    source: string | null;
    message_count: number;
    last_seen_at: string | null;
    last_contacted_at: string | null;
    tags: Array<{ id: number; name: string; color: string }>;
    segments: Array<{ id: number; name: string }>;
    created_at: string;
}

interface Activity {
    id: number;
    type: string;
    title: string;
    description: string | null;
    user: { id: number; name: string } | null;
    created_at: string;
}

export default function ContactsShow({
    account,
    contact: contactProp,
    activities = [],
    tags: tagsProp = [],
    segments: availableSegments = []}: {
    account: any;
    contact: Contact;
    activities?: Activity[];
    tags?: Array<{ id: number; name: string; color: string }>;
    segments?: Array<{ id: number; name: string }>;
}) {
    const contact = {
        ...contactProp,
        tags: contactProp?.tags ?? [],
        segments: contactProp?.segments ?? [],
    };
    const tags = Array.isArray(tagsProp) ? tagsProp : [];
    const { toast } = useToast();
    const [showNoteForm, setShowNoteForm] = useState(false);
    const [navigatingToConversation, setNavigatingToConversation] = useState(false);

    const { data: noteData, setData: setNoteData, post: postNote, processing: noteProcessing } = useForm({
        note: ''});

    const { data: contactData, setData: setContactData, put, processing } = useForm({
        name: contact.name || '',
        email: contact.email || '',
        phone: contact.phone || '',
        company: contact.company || '',
        notes: contact.notes || '',
        status: contact.status,
        tags: (contact.tags || []).map((t) => t.id),
        segments: (contact.segments || []).map((s) => s.id)});

    const handleUpdate = (e: React.FormEvent) => {
        e.preventDefault();
        put(route('app.contacts.update', { contact: contact.slug || contact.id }), {
            onSuccess: () => {
                toast.success('Contact updated');
            },
            onError: () => {
                toast.error('Failed to update contact');
            }});
    };

    const handleAddNote = (e: React.FormEvent) => {
        e.preventDefault();
        postNote(route('app.contacts.add-note', { contact: contact.slug || contact.id }), {
            onSuccess: () => {
                toast.success('Note added');
                setShowNoteForm(false);
                setNoteData('note', '');
            },
            onError: () => {
                toast.error('Failed to add note');
            }});
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

    const formatDate = (date: string | null) => {
        if (!date) return '—';
        return new Date(date).toLocaleString();
    };

    return (
        <AppShell>
            <Head title={contact.name || contact.wa_id} />
            <div className="space-y-6">
                <div>
                    <Link
                        href={route('app.contacts.index', { })}
                        className="inline-flex items-center gap-2 text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors mb-4"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        Back to Contacts
                    </Link>
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-gray-100 dark:to-gray-300 bg-clip-text text-transparent">
                                {contact.name || contact.wa_id}
                            </h1>
                            <div className="flex flex-wrap items-center gap-2 mt-2">
                                {getStatusBadge(contact.status)}
                                {(contact.tags || []).map((tag) => (
                                    <Badge
                                        key={tag.id}
                                        variant="default"
                                        style={{ backgroundColor: tag.color + '20', color: tag.color }}
                                    >
                                        {tag.name}
                                    </Badge>
                                ))}
                                {(contact.segments || []).length > 0 && (
                                    <>
                                        <span className="text-xs text-gray-500 dark:text-gray-400">Segments:</span>
                                        {(contact.segments || []).map((seg) => (
                                            <Badge key={seg.id} variant="secondary">{seg.name}</Badge>
                                        ))}
                                    </>
                                )}
                            </div>
                        </div>
                        <Button
                            className="bg-[#25D366] hover:bg-[#1DAA57] text-white"
                            disabled={navigatingToConversation}
                            onClick={() => {
                                setNavigatingToConversation(true);
                                router.visit(route('app.whatsapp.conversations.by-contact', { contact: contact.slug || contact.id }), {
                                    onFinish: () => setNavigatingToConversation(false),
                                });
                            }}
                            aria-label="Start conversation in Inbox"
                        >
                            {navigatingToConversation ? (
                                <Loader2 className="h-4 w-4 mr-2 animate-spin" aria-hidden />
                            ) : (
                                <MessageSquare className="h-4 w-4 mr-2" aria-hidden />
                            )}
                            Start conversation
                        </Button>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Contact Details */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Contact Details</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleUpdate} className="space-y-4">
                                <div>
                                    <InputLabel htmlFor="name" value="Name" />
                                    <TextInput
                                        id="name"
                                        type="text"
                                        value={contactData.name}
                                        onChange={(e) => setContactData('name', e.target.value)}
                                        className="mt-1 block w-full"
                                    />
                                </div>

                                <div>
                                    <InputLabel htmlFor="email" value="Email" />
                                    <TextInput
                                        id="email"
                                        type="email"
                                        value={contactData.email}
                                        onChange={(e) => setContactData('email', e.target.value)}
                                        className="mt-1 block w-full"
                                    />
                                </div>

                                <div>
                                    <InputLabel htmlFor="phone" value="Phone" />
                                    <TextInput
                                        id="phone"
                                        type="text"
                                        value={contactData.phone}
                                        onChange={(e) => setContactData('phone', e.target.value)}
                                        className="mt-1 block w-full"
                                    />
                                </div>

                                <div>
                                    <InputLabel htmlFor="company" value="Company" />
                                    <TextInput
                                        id="company"
                                        type="text"
                                        value={contactData.company}
                                        onChange={(e) => setContactData('company', e.target.value)}
                                        className="mt-1 block w-full"
                                    />
                                </div>

                                <div>
                                    <InputLabel htmlFor="status" value="Status" />
                                    <select
                                        id="status"
                                        value={contactData.status}
                                        onChange={(e) => setContactData('status', e.target.value as any)}
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-700"
                                    >
                                        <option value="active">Active</option>
                                        <option value="inactive">Inactive</option>
                                        <option value="blocked">Blocked</option>
                                        <option value="opt_out">Opt Out</option>
                                    </select>
                                </div>

                                <div>
                                    <InputLabel htmlFor="notes" value="Notes" />
                                    <textarea
                                        id="notes"
                                        value={contactData.notes}
                                        onChange={(e) => setContactData('notes', e.target.value)}
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-700"
                                        rows={4}
                                    />
                                </div>

                                <div>
                                        <InputLabel value="Tags" />
                                        {tags.length > 0 ? (
                                            <>
                                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 mb-2">
                                                    Add or remove tags for this contact
                                                </p>
                                                <div className="flex flex-wrap gap-2">
                                                    {tags.map((tag) => (
                                                <button
                                                    key={tag.id}
                                                    type="button"
                                                    onClick={() => {
                                                        const current = contactData.tags as number[];
                                                        setContactData('tags', current.includes(tag.id)
                                                            ? current.filter((id) => id !== tag.id)
                                                            : [...current, tag.id]);
                                                    }}
                                                    className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors border ${
                                                        (contactData.tags as number[]).includes(tag.id)
                                                            ? 'border-blue-500 bg-blue-600 text-white'
                                                            : 'border-gray-200 dark:border-gray-600 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                                                    }`}
                                                    style={
                                                        !(contactData.tags as number[]).includes(tag.id)
                                                            ? { borderColor: tag.color + '80', backgroundColor: tag.color + '20', color: tag.color }
                                                            : undefined
                                                    }
                                                >
                                                    {tag.name}
                                                </button>
                                            ))}
                                                </div>
                                            </>
                                        ) : (
                                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                                                No tags yet.{' '}
                                                <Link
                                                    href={route('app.contacts.tags.index')}
                                                    className="font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400"
                                                >
                                                    Create tags in the Tags section
                                                </Link>
                                            </p>
                                        )}
                                    </div>

                                <div>
                                        <InputLabel value="Segments" />
                                        {availableSegments.length > 0 ? (
                                            <>
                                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 mb-2">
                                                    Add or remove segments for this contact
                                                </p>
                                                <div className="flex flex-wrap gap-2">
                                                    {availableSegments.map((seg) => (
                                                <button
                                                    key={seg.id}
                                                    type="button"
                                                    onClick={() => {
                                                        const current = contactData.segments as number[];
                                                        setContactData('segments', current.includes(seg.id)
                                                            ? current.filter((id) => id !== seg.id)
                                                            : [...current, seg.id]);
                                                    }}
                                                    className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors border ${
                                                        (contactData.segments as number[]).includes(seg.id)
                                                            ? 'border-emerald-500 bg-emerald-600 text-white'
                                                            : 'border-gray-200 dark:border-gray-600 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                                                    }`}
                                                >
                                                    {seg.name}
                                                </button>
                                            ))}
                                                </div>
                                            </>
                                        ) : (
                                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                                                No segments yet.{' '}
                                                <Link
                                                    href={route('app.contacts.segments.index')}
                                                    className="font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400"
                                                >
                                                    Create segments in the Segments section
                                                </Link>
                                            </p>
                                        )}
                                    </div>

                                <Button type="submit" disabled={processing}>
                                    Save Changes
                                </Button>
                            </form>
                        </CardContent>
                    </Card>

                    {/* Activity History */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Activity History</CardTitle>
                        </CardHeader>
                        <CardContent>
                            {!showNoteForm ? (
                                <Button
                                    onClick={() => setShowNoteForm(true)}
                                    variant="secondary"
                                    className="mb-4 w-full"
                                >
                                    Add Note
                                </Button>
                            ) : (
                                <form onSubmit={handleAddNote} className="mb-4 space-y-2">
                                    <TextInput
                                        value={noteData.note}
                                        onChange={(e) => setNoteData('note', e.target.value)}
                                        placeholder="Add a note..."
                                        required
                                    />
                                    <div className="flex gap-2">
                                        <Button type="submit" disabled={noteProcessing} size="sm">
                                            Save
                                        </Button>
                                        <Button
                                            type="button"
                                            variant="secondary"
                                            size="sm"
                                            onClick={() => {
                                                setShowNoteForm(false);
                                                setNoteData('note', '');
                                            }}
                                        >
                                            Cancel
                                        </Button>
                                    </div>
                                </form>
                            )}

                            <div className="space-y-4 max-h-96 overflow-y-auto">
                                {activities.map((activity) => (
                                    <div key={activity.id} className="border-l-2 border-gray-200 dark:border-gray-700 pl-4">
                                        <div className="flex items-start justify-between">
                                            <div>
                                                <p className="font-medium text-gray-900 dark:text-gray-100">
                                                    {activity.title}
                                                </p>
                                                {activity.description && (
                                                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                                        {activity.description}
                                                    </p>
                                                )}
                                                {activity.user && (
                                                    <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                                                        by {activity.user.name}
                                                    </p>
                                                )}
                                            </div>
                                            <span className="text-xs text-gray-500 dark:text-gray-500">
                                                {formatDate(activity.created_at)}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Contact Info Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <Card>
                        <CardContent className="p-4">
                            <div className="flex items-center gap-2">
                                <MessageSquare className="h-5 w-5 text-blue-600" />
                                <div>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">Messages</p>
                                    <p className="text-lg font-bold">{contact.message_count}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-4">
                            <div className="flex items-center gap-2">
                                <Clock className="h-5 w-5 text-green-600" />
                                <div>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">Last Seen</p>
                                    <p className="text-sm font-medium">{formatDate(contact.last_seen_at)}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-4">
                            <div className="flex items-center gap-2">
                                <User className="h-5 w-5 text-purple-600" />
                                <div>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">Source</p>
                                    <p className="text-sm font-medium">{contact.source || 'Manual'}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-4">
                            <div className="flex items-center gap-2">
                                <Clock className="h-5 w-5 text-orange-600" />
                                <div>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">Created</p>
                                    <p className="text-sm font-medium">{formatDate(contact.created_at)}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AppShell>
    );
}
