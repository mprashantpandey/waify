import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/Components/UI/Card';
import Button from '@/Components/UI/Button';
import { AlertTriangle, CheckCircle2, Clock3, Copy, ServerCog, ShieldAlert } from 'lucide-react';

interface CronCommand {
    id: string;
    title: string;
    schedule: string;
    description: string;
    command: string;
}

interface CronStatus {
    key: string;
    label: string;
    status: 'healthy' | 'warning' | 'critical';
    last_activity_at: string | null;
    metrics: Record<string, string | number | boolean | null>;
}

interface CronTabProps {
    cron: {
        timezone: string;
        commands: CronCommand[];
        statuses: CronStatus[];
        log_files: Record<string, { exists: boolean; path: string; last_modified_at: string | null }>;
    };
}

export default function CronTab({ cron }: CronTabProps) {
    const [copiedId, setCopiedId] = useState<string | null>(null);

    const copy = async (id: string, value: string) => {
        try {
            await navigator.clipboard.writeText(value);
            setCopiedId(id);
            window.setTimeout(() => setCopiedId(null), 1500);
        } catch {
            setCopiedId(null);
        }
    };

    const statusBadge = (status: CronStatus['status']) => {
        if (status === 'healthy') {
            return (
                <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-2 py-0.5 text-xs font-semibold text-green-700 dark:bg-green-900/30 dark:text-green-300">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    Healthy
                </span>
            );
        }

        if (status === 'critical') {
            return (
                <span className="inline-flex items-center gap-1 rounded-full bg-red-100 px-2 py-0.5 text-xs font-semibold text-red-700 dark:bg-red-900/30 dark:text-red-300">
                    <ShieldAlert className="h-3.5 w-3.5" />
                    Critical
                </span>
            );
        }

        return (
            <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 text-xs font-semibold text-amber-700 dark:bg-amber-900/30 dark:text-amber-300">
                <AlertTriangle className="h-3.5 w-3.5" />
                Warning
            </span>
        );
    };

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <ServerCog className="h-5 w-5" />
                        Cron Commands
                    </CardTitle>
                    <CardDescription>
                        Configure these commands in your hosting control panel. Timezone: {cron.timezone}
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    {cron.commands.map((item) => (
                        <div
                            key={item.id}
                            className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-900"
                        >
                            <div className="mb-2 flex items-start justify-between gap-4">
                                <div>
                                    <div className="text-sm font-semibold text-slate-900 dark:text-slate-100">{item.title}</div>
                                    <p className="mt-1 text-xs text-slate-600 dark:text-slate-400">{item.description}</p>
                                </div>
                                <span className="inline-flex items-center gap-1 rounded-md bg-slate-100 px-2 py-1 text-xs font-semibold text-slate-700 dark:bg-slate-800 dark:text-slate-200">
                                    <Clock3 className="h-3.5 w-3.5" />
                                    {item.schedule}
                                </span>
                            </div>
                            <div className="rounded-lg bg-slate-950 p-3 text-xs text-slate-100">
                                <code className="break-all">{item.command}</code>
                            </div>
                            <div className="mt-3">
                                <Button
                                    type="button"
                                    size="sm"
                                    variant="secondary"
                                    onClick={() => copy(item.id, item.command)}
                                >
                                    <Copy className="mr-2 h-4 w-4" />
                                    {copiedId === item.id ? 'Copied' : 'Copy Command'}
                                </Button>
                            </div>
                        </div>
                    ))}
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Background System Status</CardTitle>
                    <CardDescription>Global system health inferred from queue, messages, and execution history.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    {cron.statuses.map((item) => (
                        <div
                            key={item.key}
                            className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-900"
                        >
                            <div className="mb-2 flex items-center justify-between">
                                <div className="text-sm font-semibold text-gray-900 dark:text-gray-100">{item.label}</div>
                                {statusBadge(item.status)}
                            </div>
                            <div className="mb-2 text-xs text-gray-500 dark:text-gray-400">
                                Last activity: {item.last_activity_at ? new Date(item.last_activity_at).toLocaleString() : 'N/A'}
                            </div>
                            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                                {Object.entries(item.metrics).map(([k, v]) => (
                                    <div
                                        key={k}
                                        className="rounded-lg border border-gray-100 bg-gray-50 px-3 py-2 text-xs dark:border-gray-700 dark:bg-gray-800"
                                    >
                                        <span className="font-medium text-gray-600 dark:text-gray-300">{k}</span>:&nbsp;
                                        <span className="text-gray-900 dark:text-gray-100">{String(v)}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </CardContent>
            </Card>
        </div>
    );
}
