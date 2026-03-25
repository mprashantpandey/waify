import { Link, router, usePage } from '@inertiajs/react';
import AppShell from '@/Layouts/AppShell';
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/UI/Card';
import { Badge } from '@/Components/UI/Badge';
import Button from '@/Components/UI/Button';
import { ArrowLeft, Play, Pause, X, BarChart3, Users, Send, CheckCircle2, Eye, XCircle } from 'lucide-react';
import { Head } from '@inertiajs/react';
import { useToast } from '@/hooks/useToast';
import { useState } from 'react';

interface Campaign {
    id: number;
    slug: string;
    name: string;
    description: string | null;
    status: string;
    type: string;
    scheduled_at: string | null;
    started_at: string | null;
    completed_at: string | null;
    connection: { id: number; name: string } | null;
    template: { id: number; name: string } | null;
    created_by: { id: number; name: string } | null;
    created_at: string;
}

interface Recipient {
    id: number;
    phone_number: string;
    name: string | null;
    status: string;
    sent_at: string | null;
    delivered_at: string | null;
    read_at: string | null;
    failed_at: string | null;
    failure_reason: string | null;
}

interface Stats {
    total: number;
    sent: number;
    delivered: number;
    read: number;
    failed: number;
    pending: number;
    completion_percentage: number;
    delivery_rate: number;
    read_rate: number;
}

export default function BroadcastsShow({
    account,
    campaign,
    stats,
    recipients,
    testTargetPhone}: {
    account: any;
    campaign: Campaign;
    stats: Stats;
    recipients: Recipient[];
    testTargetPhone?: string | null;
}) {
    const { toast } = useToast();
    const { support_access: supportAccess = false } = usePage<any>().props;
    const [testPhone, setTestPhone] = useState(testTargetPhone || '');

    const getStatusBadge = (status: string) => {
        const statusMap: Record<string, { variant: 'success' | 'warning' | 'danger' | 'default' | 'info'; label: string }> = {
            draft: { variant: 'default', label: 'Draft' },
            scheduled: { variant: 'info', label: 'Scheduled' },
            sending: { variant: 'info', label: 'Sending' },
            paused: { variant: 'warning', label: 'Paused' },
            completed: { variant: 'success', label: 'Completed' },
            cancelled: { variant: 'danger', label: 'Cancelled' },
            pending: { variant: 'default', label: 'Pending' },
            sent: { variant: 'info', label: 'Sent' },
            delivered: { variant: 'success', label: 'Delivered' },
            read: { variant: 'success', label: 'Read' },
            failed: { variant: 'danger', label: 'Failed' }};

        const config = statusMap[status] || { variant: 'default' as const, label: status };
        return <Badge variant={config.variant}>{config.label}</Badge>;
    };

    const formatDate = (date: string | null) => {
        if (!date) return '—';
        return new Date(date).toLocaleString();
    };

    const handleStart = () => {
        router.post(route('app.broadcasts.start', { campaign: campaign.slug }), {}, {
            onSuccess: () => {
            },
            onError: () => {
                toast.error('Failed to start campaign');
            }});
    };

    const handlePause = () => {
        router.post(route('app.broadcasts.pause', { campaign: campaign.slug }), {}, {
            onSuccess: () => {
            },
            onError: () => {
                toast.error('Failed to pause campaign');
            }});
    };

    const handleCancel = () => {
        if (!confirm('Are you sure you want to cancel this campaign?')) return;

        router.post(route('app.broadcasts.cancel', { campaign: campaign.slug }), {}, {
            onSuccess: () => {
            },
            onError: () => {
                toast.error('Failed to cancel campaign');
            }});
    };

    const handleDuplicate = () => {
        router.post(route('app.broadcasts.duplicate', { campaign: campaign.slug }), {}, {
            onError: () => toast.error('Failed to duplicate campaign'),
        });
    };

    const handleRetryFailed = () => {
        router.post(route('app.broadcasts.retry-failed', { campaign: campaign.slug }), {}, {
            onError: () => toast.error('Failed to retry failed recipients'),
        });
    };

    const handleDelete = () => {
        if (!confirm('Delete this campaign permanently?')) return;
        router.delete(route('app.broadcasts.destroy', { campaign: campaign.slug }), {
            onError: () => toast.error('Failed to delete campaign'),
        });
    };

    const handleSendTest = () => {
        router.post(route('app.broadcasts.send-test', { campaign: campaign.slug }), {
            phone: testPhone,
        }, {
            onError: () => toast.error('Failed to send test message'),
        });
    };

    const downloadDiagnosticsBundle = () => {
        const query = new URLSearchParams({
            campaign_id: String(campaign.id),
            scope: `campaign:${campaign.id}`,
        });
        window.location.href = `${route('app.alerts.bundle')}?${query.toString()}`;
    };

    return (
        <AppShell>
            <Head title={campaign.name} />
            <div className="space-y-6">
                <div>
                    <Link
                        href={route('app.broadcasts.index', { })}
                        className="inline-flex items-center gap-2 text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors mb-4"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        Back to Campaigns
                    </Link>
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                                {campaign.name}
                            </h1>
                            {campaign.description && (
                                <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">{campaign.description}</p>
                            )}
                        </div>
                        <div className="flex flex-wrap items-stretch sm:items-center gap-2">
                            {getStatusBadge(campaign.status)}
                            {campaign.status === 'draft' && (
                                <Button onClick={handleStart} className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700">
                                    <Play className="h-4 w-4 mr-2" />
                                    Start
                                </Button>
                            )}
                            {campaign.status === 'sending' && (
                                <Button onClick={handlePause} variant="secondary" className="w-full sm:w-auto">
                                    <Pause className="h-4 w-4 mr-2" />
                                    Pause
                                </Button>
                            )}
                            {campaign.status === 'paused' && (
                                <Button onClick={handleStart} className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700">
                                    <Play className="h-4 w-4 mr-2" />
                                    Resume
                                </Button>
                            )}
                            {['draft', 'scheduled', 'sending', 'paused'].includes(campaign.status) && (
                                <Button onClick={handleCancel} variant="secondary" className="w-full sm:w-auto text-red-600 hover:text-red-700">
                                    <X className="h-4 w-4 mr-2" />
                                    Cancel
                                </Button>
                            )}
                            {stats.failed > 0 && (
                                <Button onClick={handleRetryFailed} variant="secondary" className="w-full sm:w-auto">
                                    Retry Failed
                                </Button>
                            )}
                            <Button onClick={handleDuplicate} variant="secondary" className="w-full sm:w-auto">
                                Duplicate
                            </Button>
                            {supportAccess && (
                                <Button onClick={downloadDiagnosticsBundle} variant="secondary" className="w-full sm:w-auto">
                                    Support bundle
                                </Button>
                            )}
                            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full sm:w-auto">
                                <input
                                    value={testPhone}
                                    onChange={(e) => setTestPhone(e.target.value)}
                                    placeholder="Send a quick test"
                                    className="w-full sm:w-44 rounded-md border border-gray-300 px-2 py-1 text-sm dark:border-gray-700 dark:bg-gray-800"
                                />
                                <Button onClick={handleSendTest} variant="secondary" className="w-full sm:w-auto">
                                    Send test
                                </Button>
                            </div>
                            {['draft', 'cancelled', 'completed'].includes(campaign.status) && (
                                <Button onClick={handleDelete} variant="secondary" className="w-full sm:w-auto text-red-600 hover:text-red-700">
                                    Delete
                                </Button>
                            )}
                        </div>
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                    <Card>
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">Total Recipients</p>
                                    <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{stats.total}</p>
                                </div>
                                <Users className="h-8 w-8 text-blue-600" />
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">Sent</p>
                                    <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{stats.sent}</p>
                                </div>
                                <Send className="h-8 w-8 text-green-600" />
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">Delivered</p>
                                    <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{stats.delivered}</p>
                                </div>
                                <CheckCircle2 className="h-8 w-8 text-blue-600" />
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">Read</p>
                                    <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{stats.read}</p>
                                </div>
                                <Eye className="h-8 w-8 text-purple-600" />
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Progress Bar */}
                {campaign.status === 'sending' && stats.total > 0 && (
                    <Card>
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Progress</span>
                                <span className="text-sm text-gray-600 dark:text-gray-400">
                                    {stats.completion_percentage}%
                                </span>
                            </div>
                            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                                <div
                                    className="bg-blue-600 h-3 rounded-full transition-all duration-300"
                                    style={{ width: `${stats.completion_percentage}%` }}
                                />
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Campaign Details */}
                <Card>
                    <CardHeader>
                        <CardTitle>Campaign summary</CardTitle>
                    </CardHeader>
                    <CardContent className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                        <div className="rounded-xl border border-gray-200 dark:border-gray-700 px-4 py-3">
                            <span className="block text-xs font-medium text-gray-500 dark:text-gray-400">Type</span>
                            <span className="mt-1 block text-sm font-medium">{campaign.type}</span>
                        </div>
                        {campaign.connection && (
                            <div className="rounded-xl border border-gray-200 dark:border-gray-700 px-4 py-3">
                                <span className="block text-xs font-medium text-gray-500 dark:text-gray-400">Connection</span>
                                <span className="mt-1 block text-sm font-medium">{campaign.connection.name}</span>
                            </div>
                        )}
                        {campaign.template && (
                            <div className="rounded-xl border border-gray-200 dark:border-gray-700 px-4 py-3">
                                <span className="block text-xs font-medium text-gray-500 dark:text-gray-400">Template</span>
                                <span className="mt-1 block text-sm font-medium">{campaign.template.name}</span>
                            </div>
                        )}
                        <div className="rounded-xl border border-gray-200 dark:border-gray-700 px-4 py-3">
                            <span className="block text-xs font-medium text-gray-500 dark:text-gray-400">Scheduled At</span>
                            <span className="mt-1 block text-sm font-medium">{formatDate(campaign.scheduled_at)}</span>
                        </div>
                        <div className="rounded-xl border border-gray-200 dark:border-gray-700 px-4 py-3">
                            <span className="block text-xs font-medium text-gray-500 dark:text-gray-400">Started At</span>
                            <span className="mt-1 block text-sm font-medium">{formatDate(campaign.started_at)}</span>
                        </div>
                        <div className="rounded-xl border border-gray-200 dark:border-gray-700 px-4 py-3">
                            <span className="block text-xs font-medium text-gray-500 dark:text-gray-400">Completed At</span>
                            <span className="mt-1 block text-sm font-medium">{formatDate(campaign.completed_at)}</span>
                        </div>
                    </CardContent>
                </Card>

                {/* Recipients List */}
                <Card>
                    <CardHeader>
                        <CardTitle>Recent recipients</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        {recipients.map((recipient) => (
                            <div key={recipient.id} className="rounded-xl border border-gray-200 p-4 dark:border-gray-700">
                                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                                    <div className="space-y-1">
                                        <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{recipient.phone_number}</p>
                                        <p className="text-sm text-gray-500 dark:text-gray-400">{recipient.name || 'No name saved'}</p>
                                    </div>
                                    <div>{getStatusBadge(recipient.status)}</div>
                                </div>
                                <div className="mt-4 grid gap-3 text-sm sm:grid-cols-3">
                                    <div>
                                        <p className="text-xs font-medium text-gray-500 dark:text-gray-400">Sent</p>
                                        <p className="mt-1 text-gray-900 dark:text-gray-100">{formatDate(recipient.sent_at)}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs font-medium text-gray-500 dark:text-gray-400">Delivered</p>
                                        <p className="mt-1 text-gray-900 dark:text-gray-100">{formatDate(recipient.delivered_at)}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs font-medium text-gray-500 dark:text-gray-400">Read</p>
                                        <p className="mt-1 text-gray-900 dark:text-gray-100">{formatDate(recipient.read_at)}</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                        {recipients.length === 0 && (
                            <div className="rounded-xl border border-dashed border-gray-300 p-6 text-sm text-gray-500 dark:border-gray-700 dark:text-gray-400">
                                No recipients yet.
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </AppShell>
    );
}
