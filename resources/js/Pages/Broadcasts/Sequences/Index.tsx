import { Head, Link } from '@inertiajs/react';
import type { ReactNode } from 'react';
import AppShell from '@/Layouts/AppShell';
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/UI/Card';
import Button from '@/Components/UI/Button';
import { Badge } from '@/Components/UI/Badge';
import { GitBranch, Plus, ArrowRight, CheckCircle2, AlertTriangle, PlayCircle } from 'lucide-react';

type Sequence = {
    id: number;
    slug: string;
    name: string;
    description: string | null;
    status: string;
    audience_type: string;
    steps_count: number;
    enrolled_count: number;
    active_enrollment_count: number;
    completed_enrollment_count: number;
    failed_enrollment_count: number;
    activated_at: string | null;
    connection: { id: number; name: string } | null;
    created_by: { id: number; name: string } | null;
};

export default function SequenceIndex({ sequences }: { sequences: { data: Sequence[] } }) {
    const badgeVariant = (status: string) => {
        if (status === 'active') return 'success';
        if (status === 'paused') return 'warning';
        return 'default';
    };

    return (
        <AppShell>
            <Head title="Sequences" />
            <div className="space-y-6">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-3xl font-semibold text-gray-950 dark:text-white">Sequences</h1>
                        <p className="mt-2 max-w-2xl text-sm text-gray-600 dark:text-gray-400">
                            Build timed WhatsApp follow-ups for leads and customers instead of one-off broadcasts.
                        </p>
                    </div>
                    <div className="flex gap-2">
                        <Link href={route('app.broadcasts.index')}>
                            <Button variant="secondary">Campaigns</Button>
                        </Link>
                        <Link href={route('app.broadcasts.sequences.create')}>
                            <Button>
                                <Plus className="mr-2 h-4 w-4" />
                                New sequence
                            </Button>
                        </Link>
                    </div>
                </div>

                {sequences.data.length === 0 ? (
                    <Card>
                        <CardContent className="flex flex-col items-center gap-4 py-16 text-center">
                            <div className="rounded-full bg-emerald-50 p-4 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-300">
                                <GitBranch className="h-8 w-8" />
                            </div>
                            <div>
                                <h2 className="text-xl font-semibold text-gray-950 dark:text-white">No sequences yet</h2>
                                <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                                    Start with a simple welcome or follow-up series and enroll contacts automatically over time.
                                </p>
                            </div>
                            <Link href={route('app.broadcasts.sequences.create')}>
                                <Button>Create your first sequence</Button>
                            </Link>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="grid gap-4 lg:grid-cols-2">
                        {sequences.data.map((sequence) => (
                            <Card key={sequence.id}>
                                <CardHeader className="space-y-3">
                                    <div className="flex items-start justify-between gap-3">
                                        <div>
                                            <CardTitle>{sequence.name}</CardTitle>
                                            {sequence.description ? (
                                                <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">{sequence.description}</p>
                                            ) : null}
                                        </div>
                                        <Badge variant={badgeVariant(sequence.status) as any}>{sequence.status}</Badge>
                                    </div>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="grid grid-cols-2 gap-3 text-sm sm:grid-cols-4">
                                        <Stat label="Steps" value={String(sequence.steps_count)} icon={<GitBranch className="h-4 w-4" />} />
                                        <Stat label="Enrolled" value={String(sequence.enrolled_count)} icon={<PlayCircle className="h-4 w-4" />} />
                                        <Stat label="Completed" value={String(sequence.completed_enrollment_count)} icon={<CheckCircle2 className="h-4 w-4" />} />
                                        <Stat label="Failed" value={String(sequence.failed_enrollment_count)} icon={<AlertTriangle className="h-4 w-4" />} />
                                    </div>
                                    <div className="space-y-1 text-sm text-gray-600 dark:text-gray-400">
                                        <div>Audience: <span className="font-medium text-gray-900 dark:text-gray-100">{sequence.audience_type}</span></div>
                                        <div>Connection: <span className="font-medium text-gray-900 dark:text-gray-100">{sequence.connection?.name || '—'}</span></div>
                                    </div>
                                    <Link href={route('app.broadcasts.sequences.show', { sequence: sequence.slug })}>
                                        <Button variant="secondary" className="w-full justify-between">
                                            Open sequence
                                            <ArrowRight className="h-4 w-4" />
                                        </Button>
                                    </Link>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}
            </div>
        </AppShell>
    );
}

function Stat({ label, value, icon }: { label: string; value: string; icon: ReactNode }) {
    return (
        <div className="rounded-2xl border border-gray-200 bg-gray-50 p-3 dark:border-gray-800 dark:bg-gray-900/50">
            <div className="mb-2 flex items-center gap-2 text-gray-500 dark:text-gray-400">{icon}<span>{label}</span></div>
            <div className="text-lg font-semibold text-gray-950 dark:text-white">{value}</div>
        </div>
    );
}
