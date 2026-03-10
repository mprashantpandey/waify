import { Head, Link, router } from '@inertiajs/react';
import AppShell from '@/Layouts/AppShell';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/Components/UI/Card';
import { Badge } from '@/Components/UI/Badge';
import Button from '@/Components/UI/Button';
import { AlertTriangle, ArrowLeft, CheckCircle2, RotateCcw } from 'lucide-react';

interface ConnectionSummary {
    id: number;
    name: string;
    slug: string;
    webhook_last_received_at: string | null;
    webhook_last_processed_at: string | null;
    webhook_consecutive_failures: number;
    webhook_last_lag_seconds: number | null;
    webhook_last_error: string | null;
}

interface WebhookEventRow {
    id: number;
    status: string;
    event_type: string | null;
    object_type: string | null;
    signature_valid: boolean | null;
    retry_count: number;
    payload_size: number;
    error_message: string | null;
    correlation_id: string | null;
    processed_at: string | null;
    failed_at: string | null;
    created_at: string | null;
}

interface PaginatedEvents {
    data: WebhookEventRow[];
    current_page: number;
    last_page: number;
}

export default function WebhookDiagnostics({
    connection,
    events,
}: {
    connection: ConnectionSummary;
    events: PaginatedEvents;
}) {
    const reprocess = (eventId: number) => {
        router.post(route('app.whatsapp.connections.webhook-diagnostics.reprocess', {
            connection: connection.slug ?? connection.id,
            eventId,
        }));
    };

    const statusBadge = (status: string) => {
        const normalized = status.toLowerCase();
        if (normalized === 'processed') return <Badge variant="success">Processed</Badge>;
        if (normalized === 'failed') return <Badge variant="danger">Failed</Badge>;
        if (normalized === 'processing') return <Badge variant="warning">Processing</Badge>;
        if (normalized === 'duplicate') return <Badge variant="secondary">Duplicate</Badge>;
        return <Badge>{status}</Badge>;
    };

    return (
        <AppShell>
            <Head title={`${connection.name} - Webhook Diagnostics`} />
            <div className="space-y-6">
                <div className="flex items-start justify-between gap-4">
                    <div>
                        <Link
                            href={route('app.whatsapp.connections.edit', { connection: connection.slug ?? connection.id })}
                            className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 mb-2"
                        >
                            <ArrowLeft className="h-4 w-4" />
                            Back to Connection
                        </Link>
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Webhook Diagnostics</h1>
                        <p className="text-sm text-gray-500 dark:text-gray-400">{connection.name}</p>
                    </div>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Health Snapshot</CardTitle>
                        <CardDescription>Delivery and processing telemetry for this connection.</CardDescription>
                    </CardHeader>
                    <CardContent className="grid grid-cols-1 gap-3 md:grid-cols-4">
                        <div className="rounded-lg border border-gray-200 p-3">
                            <p className="text-xs text-gray-500">Last Received</p>
                            <p className="text-sm font-medium">{connection.webhook_last_received_at ? new Date(connection.webhook_last_received_at).toLocaleString() : '-'}</p>
                        </div>
                        <div className="rounded-lg border border-gray-200 p-3">
                            <p className="text-xs text-gray-500">Last Processed</p>
                            <p className="text-sm font-medium">{connection.webhook_last_processed_at ? new Date(connection.webhook_last_processed_at).toLocaleString() : '-'}</p>
                        </div>
                        <div className="rounded-lg border border-gray-200 p-3">
                            <p className="text-xs text-gray-500">Consecutive Failures</p>
                            <p className="text-sm font-semibold">{connection.webhook_consecutive_failures}</p>
                        </div>
                        <div className="rounded-lg border border-gray-200 p-3">
                            <p className="text-xs text-gray-500">Webhook Lag</p>
                            <p className="text-sm font-semibold">{connection.webhook_last_lag_seconds !== null ? `${connection.webhook_last_lag_seconds}s` : '-'}</p>
                        </div>
                    </CardContent>
                </Card>

                {connection.webhook_last_error ? (
                    <Card className="border-yellow-300">
                        <CardContent className="pt-6">
                            <div className="flex items-start gap-3">
                                <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5" />
                                <div>
                                    <p className="font-semibold text-yellow-800">Last Webhook Error</p>
                                    <p className="text-sm text-yellow-700 break-words">{connection.webhook_last_error}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ) : null}

                <Card>
                    <CardHeader>
                        <CardTitle>Recent Webhook Events</CardTitle>
                        <CardDescription>
                            Latest inbound events with signature checks, retries, and processing status.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        {events.data.length === 0 ? (
                            <div className="rounded-lg border border-dashed border-gray-300 p-6 text-sm text-gray-500">
                                No webhook events found for this connection.
                            </div>
                        ) : events.data.map((event) => (
                            <div key={event.id} className="rounded-lg border border-gray-200 p-3">
                                <div className="flex items-start justify-between gap-3">
                                    <div className="space-y-1">
                                        <div className="flex items-center gap-2">
                                            <p className="text-sm font-semibold">#{event.id}</p>
                                            {statusBadge(event.status)}
                                            {event.signature_valid === true ? (
                                                <Badge variant="success"><CheckCircle2 className="mr-1 h-3 w-3" />Signed</Badge>
                                            ) : event.signature_valid === false ? (
                                                <Badge variant="danger">Invalid Signature</Badge>
                                            ) : (
                                                <Badge variant="secondary">Signature N/A</Badge>
                                            )}
                                        </div>
                                        <p className="text-xs text-gray-500">
                                            {event.event_type ?? 'unknown'} | {event.object_type ?? 'unknown'} | retry {event.retry_count}
                                        </p>
                                        <p className="text-xs text-gray-500">
                                            received {event.created_at ? new Date(event.created_at).toLocaleString() : '-'}
                                        </p>
                                        {event.error_message ? (
                                            <p className="text-xs text-red-600 break-words">{event.error_message}</p>
                                        ) : null}
                                    </div>
                                    {(event.status === 'failed' || event.status === 'duplicate') ? (
                                        <Button
                                            size="sm"
                                            variant="secondary"
                                            onClick={() => reprocess(event.id)}
                                        >
                                            <RotateCcw className="mr-1 h-3 w-3" />
                                            Reprocess
                                        </Button>
                                    ) : null}
                                </div>
                            </div>
                        ))}
                    </CardContent>
                </Card>
            </div>
        </AppShell>
    );
}

