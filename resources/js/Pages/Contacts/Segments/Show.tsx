import { Link, router } from '@inertiajs/react';
import AppShell from '@/Layouts/AppShell';
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/UI/Card';
import { Badge } from '@/Components/UI/Badge';
import Button from '@/Components/UI/Button';
import { ArrowLeft, Users, RefreshCw, Pencil, Trash2 } from 'lucide-react';
import { Head } from '@inertiajs/react';
import { useToast } from '@/hooks/useToast';

interface Contact {
    id: number;
    slug: string;
    wa_id: string;
    name: string | null;
    email: string | null;
    company: string | null;
    status: string;
    tags: Array<{ id: number; name: string; color: string }>;
    last_contacted_at: string | null;
    created_at: string;
}

interface Segment {
    id: number;
    name: string;
    description: string | null;
    contact_count: number;
    filters: Array<{ field: string; operator: string; value?: string }> | null;
    last_calculated_at: string | null;
}

export default function SegmentsShow({
    account,
    segment,
    contacts,
}: {
    account: any;
    segment: Segment;
    contacts: {
        data: Contact[];
        links: any;
        meta: any;
    };
}) {
    const { toast } = useToast();

    const handleRecalculate = () => {
        router.post(route('app.contacts.segments.recalculate', { segment: segment.id }), {}, {
            onSuccess: () => toast.success('Count recalculated'),
        });
    };

    const handleDelete = () => {
        if (!confirm(`Delete segment "${segment.name}"?`)) return;
        router.delete(route('app.contacts.segments.destroy', { segment: segment.id }), {
            onSuccess: () => {
                toast.success('Segment deleted');
                router.visit(route('app.contacts.segments.index'));
            },
        });
    };

    return (
        <AppShell>
            <Head title={segment.name} />
            <div className="space-y-6">
                <div>
                    <Link
                        href={route('app.contacts.segments.index')}
                        className="inline-flex items-center gap-2 text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 mb-4"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        Back to Segments
                    </Link>
                    <div className="flex items-start justify-between">
                        <div>
                            <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-gray-100 dark:to-gray-300 bg-clip-text text-transparent">
                                {segment.name}
                            </h1>
                            {segment.description && (
                                <p className="mt-2 text-gray-600 dark:text-gray-400">{segment.description}</p>
                            )}
                            <div className="flex items-center gap-4 mt-2 text-sm text-gray-500 dark:text-gray-400">
                                <span className="inline-flex items-center gap-1">
                                    <Users className="h-4 w-4" />
                                    {segment.contact_count} contacts
                                </span>
                                {segment.last_calculated_at && (
                                    <span>Updated {new Date(segment.last_calculated_at).toLocaleString()}</span>
                                )}
                            </div>
                        </div>
                        <div className="flex gap-2">
                            <Button variant="secondary" size="sm" onClick={handleRecalculate}>
                                <RefreshCw className="h-4 w-4 mr-2" />
                                Recalculate
                            </Button>
                            <Link href={route('app.contacts.segments.edit', { segment: segment.id })}>
                                <Button variant="secondary" size="sm">
                                    <Pencil className="h-4 w-4 mr-2" />
                                    Edit
                                </Button>
                            </Link>
                            <Button variant="secondary" size="sm" onClick={handleDelete}>
                                <Trash2 className="h-4 w-4 mr-2 text-red-600" />
                                Delete
                            </Button>
                        </div>
                    </div>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Contacts in this segment</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {contacts.data.length === 0 ? (
                            <p className="text-gray-500 dark:text-gray-400 py-8 text-center">
                                No contacts match this segment’s filters.
                            </p>
                        ) : (
                            <ul className="divide-y divide-gray-200 dark:divide-gray-700">
                                {contacts.data.map((contact) => (
                                    <li key={contact.id} className="py-4 flex items-center justify-between">
                                        <div>
                                            <Link
                                                href={route('app.contacts.show', { contact: contact.slug })}
                                                className="font-medium text-gray-900 dark:text-gray-100 hover:text-blue-600 dark:hover:text-blue-400"
                                            >
                                                {contact.name || contact.wa_id}
                                            </Link>
                                            <div className="flex flex-wrap gap-2 mt-1 text-sm text-gray-500 dark:text-gray-400">
                                                {contact.wa_id && <span>WhatsApp: {contact.wa_id}</span>}
                                                {contact.email && <span>Email: {contact.email}</span>}
                                                {contact.company && <span>{contact.company}</span>}
                                            </div>
                                            {contact.tags.length > 0 && (
                                                <div className="flex flex-wrap gap-1 mt-2">
                                                    {contact.tags.map((t) => (
                                                        <Badge key={t.id} variant="default" style={{ backgroundColor: t.color + '20', color: t.color }}>
                                                            {t.name}
                                                        </Badge>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                        <Link href={route('app.contacts.show', { contact: contact.slug })}>
                                            <Button variant="secondary" size="sm">View</Button>
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        )}

                        {contacts.links && contacts.links.length > 3 && (
                            <div className="flex justify-center gap-2 mt-6">
                                {contacts.links.map((link: any, index: number) => (
                                    <button
                                        key={index}
                                        onClick={() => link.url && router.visit(link.url)}
                                        disabled={!link.url}
                                        className={`px-4 py-2 rounded-md text-sm font-medium ${
                                            link.active ? 'bg-blue-600 text-white' : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                                        } ${!link.url ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                                        dangerouslySetInnerHTML={{ __html: link.label }}
                                    />
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </AppShell>
    );
}
