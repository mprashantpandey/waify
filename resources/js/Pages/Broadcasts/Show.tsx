import { Link, router } from '@inertiajs/react';
import AppShell from '@/Layouts/AppShell';
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/UI/Card';
import { Badge } from '@/Components/UI/Badge';
import Button from '@/Components/UI/Button';
import { ArrowLeft, Play, Pause, X, BarChart3, Users, Send, CheckCircle2, Eye, XCircle } from 'lucide-react';
import { Head } from '@inertiajs/react';
import { useToast } from '@/hooks/useToast';

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
    recipients}: {
    account: any;
    campaign: Campaign;
    stats: Stats;
    recipients: Recipient[];
}) {
    const { toast } = useToast();

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
                toast.success('Campaign started');
            },
            onError: () => {
                toast.error('Failed to start campaign');
            }});
    };

    const handlePause = () => {
        router.post(route('app.broadcasts.pause', { campaign: campaign.slug }), {}, {
            onSuccess: () => {
                toast.success('Campaign paused');
            },
            onError: () => {
                toast.error('Failed to pause campaign');
            }});
    };

    const handleCancel = () => {
        if (!confirm('Are you sure you want to cancel this campaign?')) return;

        router.post(route('app.broadcasts.cancel', { campaign: campaign.slug }), {}, {
            onSuccess: () => {
                toast.success('Campaign cancelled');
            },
            onError: () => {
                toast.error('Failed to cancel campaign');
            }});
    };

    const handleDuplicate = () => {
        router.post(route('app.broadcasts.duplicate', { campaign: campaign.slug }), {}, {
            onSuccess: () => toast.success('Campaign duplicated'),
            onError: () => toast.error('Failed to duplicate campaign'),
        });
    };

    const handleRetryFailed = () => {
        router.post(route('app.broadcasts.retry-failed', { campaign: campaign.slug }), {}, {
            onSuccess: () => toast.success('Retry queued for failed recipients'),
            onError: () => toast.error('Failed to retry failed recipients'),
        });
    };

    const handleDelete = () => {
        if (!confirm('Delete this campaign permanently?')) return;
        router.delete(route('app.broadcasts.destroy', { campaign: campaign.slug }), {
            onSuccess: () => toast.success('Campaign deleted'),
            onError: () => toast.error('Failed to delete campaign'),
        });
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
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-gray-100 dark:to-gray-300 bg-clip-text text-transparent">
                                {campaign.name}
                            </h1>
                            {campaign.description && (
                                <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">{campaign.description}</p>
                            )}
                        </div>
                        <div className="flex items-center gap-2">
                            {getStatusBadge(campaign.status)}
                            {campaign.status === 'draft' && (
                                <Button onClick={handleStart} className="bg-blue-600 hover:bg-blue-700">
                                    <Play className="h-4 w-4 mr-2" />
                                    Start
                                </Button>
                            )}
                            {campaign.status === 'sending' && (
                                <Button onClick={handlePause} variant="secondary">
                                    <Pause className="h-4 w-4 mr-2" />
                                    Pause
                                </Button>
                            )}
                            {campaign.status === 'paused' && (
                                <Button onClick={handleStart} className="bg-blue-600 hover:bg-blue-700">
                                    <Play className="h-4 w-4 mr-2" />
                                    Resume
                                </Button>
                            )}
                            {['draft', 'scheduled', 'sending', 'paused'].includes(campaign.status) && (
                                <Button onClick={handleCancel} variant="secondary" className="text-red-600 hover:text-red-700">
                                    <X className="h-4 w-4 mr-2" />
                                    Cancel
                                </Button>
                            )}
                            {stats.failed > 0 && (
                                <Button onClick={handleRetryFailed} variant="secondary">
                                    Retry Failed
                                </Button>
                            )}
                            <Button onClick={handleDuplicate} variant="secondary">
                                Duplicate
                            </Button>
                            {['draft', 'cancelled', 'completed'].includes(campaign.status) && (
                                <Button onClick={handleDelete} variant="secondary" className="text-red-600 hover:text-red-700">
                                    Delete
                                </Button>
                            )}
                        </div>
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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
                        <CardTitle>Campaign Details</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                        <div className="flex justify-between">
                            <span className="text-sm text-gray-600 dark:text-gray-400">Type</span>
                            <span className="text-sm font-medium">{campaign.type}</span>
                        </div>
                        {campaign.connection && (
                            <div className="flex justify-between">
                                <span className="text-sm text-gray-600 dark:text-gray-400">Connection</span>
                                <span className="text-sm font-medium">{campaign.connection.name}</span>
                            </div>
                        )}
                        {campaign.template && (
                            <div className="flex justify-between">
                                <span className="text-sm text-gray-600 dark:text-gray-400">Template</span>
                                <span className="text-sm font-medium">{campaign.template.name}</span>
                            </div>
                        )}
                        <div className="flex justify-between">
                            <span className="text-sm text-gray-600 dark:text-gray-400">Scheduled At</span>
                            <span className="text-sm font-medium">{formatDate(campaign.scheduled_at)}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-sm text-gray-600 dark:text-gray-400">Started At</span>
                            <span className="text-sm font-medium">{formatDate(campaign.started_at)}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-sm text-gray-600 dark:text-gray-400">Completed At</span>
                            <span className="text-sm font-medium">{formatDate(campaign.completed_at)}</span>
                        </div>
                    </CardContent>
                </Card>

                {/* Recipients List */}
                <Card>
                    <CardHeader>
                        <CardTitle>Recipients</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                                <thead className="bg-gray-50 dark:bg-gray-800">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                            Phone Number
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                            Name
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                            Status
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                            Sent At
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                            Delivered At
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                            Read At
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
                                    {recipients.map((recipient) => (
                                        <tr key={recipient.id}>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                                                {recipient.phone_number}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
                                                {recipient.name || '—'}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">{getStatusBadge(recipient.status)}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
                                                {formatDate(recipient.sent_at)}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
                                                {formatDate(recipient.delivered_at)}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
                                                {formatDate(recipient.read_at)}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </AppShell>
    );
}
