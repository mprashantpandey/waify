import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/Components/UI/Card';
import { Activity, AlertTriangle, CheckCircle2, Mail, MessageSquare, Radio, ServerCog } from 'lucide-react';

interface DeliveryProps {
    delivery: {
        generated_at: string;
        health_score: number;
        queue: {
            pending_total: number;
            pending_by_queue: Record<string, number>;
            failed_last_hour: number;
            failed_last_24h: number;
            oldest_pending_at: string | null;
        };
        mail: {
            driver: string;
            mail_related_failures_last_24h: number;
            notification_failures_last_24h: number;
            fallback_enabled: boolean;
            fallback_last_triggered_at: string | null;
            fallback_last_error: string | null;
        };
        triggers: {
            chatbots_24h: Record<string, number>;
            campaigns_24h: Record<string, number>;
        };
        webhooks: {
            active_connections: number;
            healthy_connections: number;
            stale_connections: number;
            connections_with_errors: number;
            last_webhook_at: string | null;
        };
        recent_failures: Array<{
            id: string;
            queue: string;
            error: string;
            failed_at: string | null;
        }>;
    };
}

function statusTone(score: number): { label: string; cls: string } {
    if (score >= 85) {
        return { label: 'Healthy', cls: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300' };
    }
    if (score >= 60) {
        return { label: 'Warning', cls: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300' };
    }
    return { label: 'Critical', cls: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300' };
}

const fmt = (value: string | null) => (value ? new Date(value).toLocaleString() : 'N/A');

export default function DeliveryTab({ delivery }: DeliveryProps) {
    const tone = statusTone(delivery.health_score);

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Activity className="h-5 w-5" />
                        Delivery & Trigger Health
                    </CardTitle>
                    <CardDescription>Generated at {fmt(delivery.generated_at)}</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-900">
                        <div>
                            <div className="text-sm text-slate-600 dark:text-slate-400">Overall health score</div>
                            <div className="text-3xl font-bold text-slate-900 dark:text-slate-100">{delivery.health_score}</div>
                        </div>
                        <span className={`inline-flex items-center rounded-full px-3 py-1 text-sm font-semibold ${tone.cls}`}>
                            {tone.label}
                        </span>
                    </div>
                </CardContent>
            </Card>

            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-base">
                            <ServerCog className="h-4 w-4" />
                            Queue
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2 text-sm">
                        <div>Pending total: <strong>{delivery.queue.pending_total}</strong></div>
                        <div>Failed (1h): <strong>{delivery.queue.failed_last_hour}</strong></div>
                        <div>Failed (24h): <strong>{delivery.queue.failed_last_24h}</strong></div>
                        <div>Oldest pending: <strong>{fmt(delivery.queue.oldest_pending_at)}</strong></div>
                        <div className="pt-2">
                            {Object.entries(delivery.queue.pending_by_queue).map(([queue, count]) => (
                                <div key={queue} className="flex items-center justify-between rounded-md bg-gray-50 px-2 py-1 dark:bg-gray-800">
                                    <span>{queue}</span>
                                    <strong>{count}</strong>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-base">
                            <Mail className="h-4 w-4" />
                            Email
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2 text-sm">
                        <div>Driver: <strong>{delivery.mail.driver}</strong></div>
                        <div>Mail-related failures (24h): <strong>{delivery.mail.mail_related_failures_last_24h}</strong></div>
                        <div>Notification failures (24h): <strong>{delivery.mail.notification_failures_last_24h}</strong></div>
                        <div>Failover enabled: <strong>{delivery.mail.fallback_enabled ? 'Yes' : 'No'}</strong></div>
                        <div>Last fallback: <strong>{fmt(delivery.mail.fallback_last_triggered_at)}</strong></div>
                        {delivery.mail.fallback_last_error && (
                            <div className="rounded-md border border-amber-200 bg-amber-50 p-2 text-xs text-amber-700 dark:border-amber-900/40 dark:bg-amber-900/20 dark:text-amber-200">
                                Last fallback error: {delivery.mail.fallback_last_error}
                            </div>
                        )}
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-base">
                            <MessageSquare className="h-4 w-4" />
                            Triggers
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3 text-sm">
                        <div>
                            <div className="mb-1 font-semibold">Chatbots (24h)</div>
                            <div className="grid grid-cols-2 gap-2">
                                {Object.entries(delivery.triggers.chatbots_24h).map(([k, v]) => (
                                    <div key={k} className="rounded-md bg-gray-50 px-2 py-1 dark:bg-gray-800">
                                        {k}: <strong>{v}</strong>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div>
                            <div className="mb-1 font-semibold">Campaigns (24h)</div>
                            <div className="grid grid-cols-2 gap-2">
                                {Object.entries(delivery.triggers.campaigns_24h).map(([k, v]) => (
                                    <div key={k} className="rounded-md bg-gray-50 px-2 py-1 dark:bg-gray-800">
                                        {k}: <strong>{v}</strong>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-base">
                            <Radio className="h-4 w-4" />
                            Webhooks
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2 text-sm">
                        <div>Active connections: <strong>{delivery.webhooks.active_connections}</strong></div>
                        <div>Healthy: <strong>{delivery.webhooks.healthy_connections}</strong></div>
                        <div>Stale: <strong>{delivery.webhooks.stale_connections}</strong></div>
                        <div>With errors: <strong>{delivery.webhooks.connections_with_errors}</strong></div>
                        <div>Last webhook: <strong>{fmt(delivery.webhooks.last_webhook_at)}</strong></div>
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle className="text-base">Recent Failures</CardTitle>
                    <CardDescription>Latest failed jobs from queue workers.</CardDescription>
                </CardHeader>
                <CardContent>
                    {delivery.recent_failures.length === 0 ? (
                        <div className="flex items-center gap-2 rounded-lg bg-green-50 p-3 text-sm text-green-700 dark:bg-green-900/20 dark:text-green-300">
                            <CheckCircle2 className="h-4 w-4" />
                            No recent failures.
                        </div>
                    ) : (
                        <div className="space-y-2">
                            {delivery.recent_failures.map((failure) => (
                                <div key={failure.id} className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm dark:border-red-900/40 dark:bg-red-900/20">
                                    <div className="mb-1 flex items-center justify-between gap-3">
                                        <span className="inline-flex items-center gap-1 font-semibold text-red-700 dark:text-red-300">
                                            <AlertTriangle className="h-4 w-4" />
                                            Queue: {failure.queue}
                                        </span>
                                        <span className="text-xs text-red-700/80 dark:text-red-300/80">{fmt(failure.failed_at)}</span>
                                    </div>
                                    <div className="text-xs text-red-800 dark:text-red-200">{failure.error}</div>
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
