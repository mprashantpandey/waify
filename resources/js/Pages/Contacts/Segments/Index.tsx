import { Link, router } from '@inertiajs/react';
import AppShell from '@/Layouts/AppShell';
import { Card, CardContent } from '@/Components/UI/Card';
import Button from '@/Components/UI/Button';
import { ArrowLeft, FolderOpen, Plus, Users, Trash2, RefreshCw } from 'lucide-react';
import { Head } from '@inertiajs/react';
import { useToast } from '@/hooks/useToast';
import { EmptyState } from '@/Components/UI/EmptyState';

interface Segment {
    id: number;
    name: string;
    description: string | null;
    contact_count: number;
    last_calculated_at: string | null;
    filters: Array<{ field: string; operator: string; value?: string }> | null;
    created_at: string;
}

export default function SegmentsIndex({
    account,
    segments,
}: {
    account: any;
    segments: Segment[];
}) {
    const { toast } = useToast();

    const handleDelete = (segment: Segment) => {
        if (!confirm(`Delete segment "${segment.name}"?`)) return;
        router.delete(route('app.contacts.segments.destroy', { segment: segment.id }), {
            onError: () => toast.error('Failed to delete segment'),
        });
    };

    const handleRecalculate = (segmentId: number) => {
        router.post(route('app.contacts.segments.recalculate', { segment: segmentId }), {});
    };

    return (
        <AppShell>
            <Head title="Contact Segments" />
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
                                Contact Segments
                            </h1>
                            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                                Group contacts by rules. Use segments for campaigns and filters.
                            </p>
                        </div>
                        <Link href={route('app.contacts.segments.create')} className="w-full sm:w-auto">
                            <Button className="w-full sm:w-auto">
                                <Plus className="h-4 w-4 mr-2" />
                                New Segment
                            </Button>
                        </Link>
                    </div>
                </div>

                {segments.length === 0 ? (
                    <Card>
                        <CardContent className="py-16 text-center">
                            <EmptyState
                                icon={FolderOpen}
                                title="No segments yet"
                                description="Create segments to group contacts by criteria (e.g. status, tag, company)."
                                action={
                                    <Link href={route('app.contacts.segments.create')} className="w-full sm:w-auto">
                                        <Button className="w-full sm:w-auto"><Plus className="h-4 w-4 mr-2" />New Segment</Button>
                                    </Link>
                                }
                            />
                        </CardContent>
                    </Card>
                ) : (
                    <div className="grid gap-4">
                        {segments.map((seg) => (
                            <Card key={seg.id}>
                                <CardContent className="p-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                                    <div className="min-w-0">
                                        <Link
                                            href={route('app.contacts.segments.show', { segment: seg.id })}
                                            className="text-lg font-semibold text-gray-900 dark:text-gray-100 hover:text-blue-600 dark:hover:text-blue-400 break-words"
                                        >
                                            {seg.name}
                                        </Link>
                                        {seg.description && (
                                            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{seg.description}</p>
                                        )}
                                        <div className="flex items-center gap-4 mt-2 text-sm text-gray-600 dark:text-gray-400">
                                            <span className="inline-flex items-center gap-1">
                                                <Users className="h-4 w-4" />
                                                {seg.contact_count} contacts
                                            </span>
                                            {seg.last_calculated_at && (
                                                <span>Updated {new Date(seg.last_calculated_at).toLocaleDateString()}</span>
                                            )}
                                        </div>
                                    </div>
                                    <div className="flex flex-wrap items-stretch sm:items-center gap-2 lg:shrink-0">
                                        <Button
                                            variant="secondary"
                                            size="sm"
                                            className="w-full sm:w-auto"
                                            onClick={() => handleRecalculate(seg.id)}
                                        >
                                            <RefreshCw className="h-4 w-4" />
                                        </Button>
                                        <Link href={route('app.contacts.segments.edit', { segment: seg.id })} className="w-full sm:w-auto">
                                            <Button variant="secondary" size="sm" className="w-full sm:w-auto">Edit</Button>
                                        </Link>
                                        <Link href={route('app.contacts.segments.show', { segment: seg.id })} className="w-full sm:w-auto">
                                            <Button size="sm" className="w-full sm:w-auto">View</Button>
                                        </Link>
                                        <Button
                                            variant="secondary"
                                            size="sm"
                                            className="w-full sm:w-auto"
                                            onClick={() => handleDelete(seg)}
                                        >
                                            <Trash2 className="h-4 w-4 text-red-600" />
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}
            </div>
        </AppShell>
    );
}
