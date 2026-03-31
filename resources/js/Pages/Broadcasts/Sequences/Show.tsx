import { Head, Link, router } from '@inertiajs/react';
import AppShell from '@/Layouts/AppShell';
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/UI/Card';
import Button from '@/Components/UI/Button';
import { Badge } from '@/Components/UI/Badge';
import { PauseCircle, PlayCircle } from 'lucide-react';

type Sequence = {
    id: number;
    slug: string;
    name: string;
    description: string | null;
    status: string;
    audience_type: string;
    activated_at: string | null;
    paused_at: string | null;
    enrolled_count: number;
    active_enrollment_count: number;
    completed_enrollment_count: number;
    failed_enrollment_count: number;
    connection: { id: number; name: string } | null;
    steps: Array<{ id: number; step_order: number; delay_minutes: number; type: string; message_text: string | null; template: { id: number; name: string } | null }>;
    enrollments: Array<{ id: number; name: string | null; wa_id: string; status: string; sent_steps_count: number; enrolled_at: string | null; last_step_sent_at: string | null; failure_reason: string | null }>;
};

export default function SequenceShow({ sequence }: { sequence: Sequence }) {
    return (
        <AppShell>
            <Head title={sequence.name} />
            <div className="space-y-6">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                        <div className="flex items-center gap-3">
                            <h1 className="text-3xl font-semibold text-gray-950 dark:text-white">{sequence.name}</h1>
                            <Badge variant={sequence.status === 'active' ? 'success' : sequence.status === 'paused' ? 'warning' : 'default'}>{sequence.status}</Badge>
                        </div>
                        {sequence.description ? <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">{sequence.description}</p> : null}
                    </div>
                    <div className="flex gap-2">
                        <Link href={route('app.broadcasts.sequences.index')}><Button variant="secondary">All sequences</Button></Link>
                        {sequence.status === 'active' ? (
                            <Button onClick={() => router.post(route('app.broadcasts.sequences.pause', { sequence: sequence.slug }))}>
                                <PauseCircle className="mr-2 h-4 w-4" /> Pause
                            </Button>
                        ) : (
                            <Button onClick={() => router.post(route('app.broadcasts.sequences.activate', { sequence: sequence.slug }))}>
                                <PlayCircle className="mr-2 h-4 w-4" /> {sequence.status === 'paused' ? 'Resume' : 'Activate'}
                            </Button>
                        )}
                    </div>
                </div>

                <div className="grid gap-4 md:grid-cols-4">
                    <Metric label="Enrolled" value={sequence.enrolled_count} />
                    <Metric label="Active" value={sequence.active_enrollment_count} />
                    <Metric label="Completed" value={sequence.completed_enrollment_count} />
                    <Metric label="Failed" value={sequence.failed_enrollment_count} />
                </div>

                <Card>
                    <CardHeader><CardTitle>Sequence steps</CardTitle></CardHeader>
                    <CardContent className="space-y-3">
                        {sequence.steps.map((step) => (
                            <div key={step.id} className="rounded-2xl border border-gray-200 p-4 dark:border-gray-800">
                                <div className="flex items-center justify-between gap-3">
                                    <div className="font-medium text-gray-950 dark:text-white">Step {step.step_order}</div>
                                    <div className="text-sm text-gray-500 dark:text-gray-400">After {step.delay_minutes} min</div>
                                </div>
                                <div className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                                    {step.type === 'template' ? `Template: ${step.template?.name || 'Missing template'}` : step.message_text}
                                </div>
                            </div>
                        ))}
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader><CardTitle>Recent enrollments</CardTitle></CardHeader>
                    <CardContent className="space-y-3">
                        {sequence.enrollments.length === 0 ? (
                            <div className="text-sm text-gray-500 dark:text-gray-400">No contacts enrolled yet.</div>
                        ) : sequence.enrollments.map((enrollment) => (
                            <div key={enrollment.id} className="rounded-2xl border border-gray-200 p-4 dark:border-gray-800">
                                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                                    <div>
                                        <div className="font-medium text-gray-950 dark:text-white">{enrollment.name || enrollment.wa_id}</div>
                                        <div className="text-sm text-gray-500 dark:text-gray-400">{enrollment.wa_id}</div>
                                    </div>
                                    <Badge variant={enrollment.status === 'completed' ? 'success' : enrollment.status === 'failed' ? 'danger' : enrollment.status === 'paused' ? 'warning' : 'info'}>{enrollment.status}</Badge>
                                </div>
                                <div className="mt-2 text-sm text-gray-600 dark:text-gray-400">Steps sent: {enrollment.sent_steps_count}</div>
                                {enrollment.failure_reason ? <div className="mt-2 text-sm text-red-600 dark:text-red-400">{enrollment.failure_reason}</div> : null}
                            </div>
                        ))}
                    </CardContent>
                </Card>
            </div>
        </AppShell>
    );
}

function Metric({ label, value }: { label: string; value: number }) {
    return (
        <Card>
            <CardContent className="p-4">
                <div className="text-sm text-gray-500 dark:text-gray-400">{label}</div>
                <div className="mt-1 text-2xl font-semibold text-gray-950 dark:text-white">{value}</div>
            </CardContent>
        </Card>
    );
}
