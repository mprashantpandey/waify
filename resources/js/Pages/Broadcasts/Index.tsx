import { Link, router } from '@inertiajs/react';
import AppShell from '@/Layouts/AppShell';
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/UI/Card';
import { Badge } from '@/Components/UI/Badge';
import Button from '@/Components/UI/Button';
import { Plus, Megaphone, Clock, CheckCircle2, XCircle, Pause, Play, X, BarChart3 } from 'lucide-react';
import { Head } from '@inertiajs/react';
import { EmptyState } from '@/Components/UI/EmptyState';

interface Campaign {
    id: number;
    slug: string;
    name: string;
    description: string | null;
    status: string;
    type: string;
    total_recipients: number;
    sent_count: number;
    delivered_count: number;
    read_count: number;
    failed_count: number;
    completion_percentage: number;
    scheduled_at: string | null;
    started_at: string | null;
    completed_at: string | null;
    connection: { id: number; name: string } | null;
    template: { id: number; name: string } | null;
    created_by: { id: number; name: string } | null;
    created_at: string;
}

export default function BroadcastsIndex({
    account,
    campaigns,
    filters}: {
    account: any;
    campaigns: {
        data: Campaign[];
        links: any;
        meta: any;
    };
    filters: { status?: string };
}) {
    const getStatusBadge = (status: string) => {
        const statusMap: Record<string, { variant: 'success' | 'warning' | 'danger' | 'default' | 'info'; label: string; icon: any }> = {
            draft: { variant: 'default', label: 'Draft', icon: Clock },
            scheduled: { variant: 'info', label: 'Scheduled', icon: Clock },
            sending: { variant: 'info', label: 'Sending', icon: Play },
            paused: { variant: 'warning', label: 'Paused', icon: Pause },
            completed: { variant: 'success', label: 'Completed', icon: CheckCircle2 },
            cancelled: { variant: 'danger', label: 'Cancelled', icon: XCircle }};

        const config = statusMap[status] || { variant: 'default' as const, label: status, icon: Clock };
        const Icon = config.icon;

        return (
            <Badge variant={config.variant} className="flex items-center gap-1">
                <Icon className="h-3 w-3" />
                {config.label}
            </Badge>
        );
    };

    const formatDate = (date: string | null) => {
        if (!date) return '—';
        return new Date(date).toLocaleString();
    };

    return (
        <AppShell>
            <Head title="Campaigns" />
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-gray-100 dark:to-gray-300 bg-clip-text text-transparent">
                            Campaigns
                        </h1>
                        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                            Create and manage WhatsApp broadcast campaigns
                        </p>
                    </div>
                    <Link href={route('app.broadcasts.create', {})}>
                        <Button className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 shadow-lg shadow-blue-500/50">
                            <Plus className="h-4 w-4 mr-2" />
                            Create Campaign
                        </Button>
                    </Link>
                </div>

                {campaigns.data.length === 0 ? (
                    <Card className="border-0 shadow-xl">
                        <CardContent className="py-16 text-center">
                            <EmptyState
                                icon={Megaphone}
                                title="No campaigns yet"
                                description="Create your first broadcast campaign to reach multiple contacts at once"
                                action={
                                    <Link href={route('app.broadcasts.create', {})}>
                                        <Button className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700">
                                            <Plus className="h-4 w-4 mr-2" />
                                            Create Campaign
                                        </Button>
                                    </Link>
                                }
                            />
                        </CardContent>
                    </Card>
                ) : (
                    <div className="space-y-4">
                        {campaigns.data.map((campaign) => (
                            <Card key={campaign.id} className="border-0 shadow-lg hover:shadow-xl transition-shadow">
                                <CardContent className="p-6">
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-3 mb-2">
                                                <Link
                                                    href={route('app.broadcasts.show', {
                                                        campaign: campaign.slug})}
                                                    className="text-lg font-semibold text-gray-900 dark:text-gray-100 hover:text-blue-600 dark:hover:text-blue-400"
                                                >
                                                    {campaign.name}
                                                </Link>
                                                {getStatusBadge(campaign.status)}
                                            </div>
                                            {campaign.description && (
                                                <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                                                    {campaign.description}
                                                </p>
                                            )}
                                            <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                                                <span className="flex items-center gap-1">
                                                    <BarChart3 className="h-4 w-4" />
                                                    {campaign.total_recipients} recipients
                                                </span>
                                                {campaign.status === 'sending' && (
                                                    <span className="flex items-center gap-1">
                                                        <Play className="h-4 w-4" />
                                                        {campaign.completion_percentage}% complete
                                                    </span>
                                                )}
                                                {campaign.scheduled_at && (
                                                    <span className="flex items-center gap-1">
                                                        <Clock className="h-4 w-4" />
                                                        {formatDate(campaign.scheduled_at)}
                                                    </span>
                                                )}
                                                {campaign.connection && (
                                                    <span>via {campaign.connection.name}</span>
                                                )}
                                            </div>
                                        </div>
                                        <Link
                                            href={route('app.broadcasts.show', {
                                                campaign: campaign.slug})}
                                        >
                                            <Button variant="secondary" size="sm">
                                                View Details
                                            </Button>
                                        </Link>
                                    </div>
                                    {campaign.status === 'sending' && campaign.total_recipients > 0 && (
                                        <div className="mt-4">
                                            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                                                <div
                                                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                                                    style={{ width: `${campaign.completion_percentage}%` }}
                                                />
                                            </div>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        ))}

                        {/* Pagination */}
                        {campaigns.links && campaigns.links.length > 3 && (
                            <div className="flex justify-center gap-2 mt-6">
                                {campaigns.links.map((link: any, index: number) => (
                                    <button
                                        key={index}
                                        onClick={() => link.url && router.visit(link.url)}
                                        disabled={!link.url}
                                        className={`px-4 py-2 rounded-md text-sm font-medium ${
                                            link.active
                                                ? 'bg-blue-600 text-white'
                                                : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                                        } ${!link.url ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                                        dangerouslySetInnerHTML={{ __html: link.label }}
                                    />
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </div>
        </AppShell>
    );
}
