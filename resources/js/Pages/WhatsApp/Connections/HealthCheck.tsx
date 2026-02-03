import { useEffect, useState } from 'react';
import { Link, router } from '@inertiajs/react';
import AppShell from '@/Layouts/AppShell';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/Components/UI/Card';
import { Badge } from '@/Components/UI/Badge';
import Button from '@/Components/UI/Button';
import { ArrowLeft, Activity, CheckCircle2, AlertCircle, AlertTriangle, RefreshCw, Clock, Shield, Zap, Phone, Link as LinkIcon } from 'lucide-react';
import { Head } from '@inertiajs/react';
import { useToast } from '@/hooks/useNotifications';
import axios from 'axios';
import { Progress } from '@/Components/UI/Progress';
import { Alert } from '@/Components/UI/Alert';

interface HealthCheck {
    connection_id: number;
    connection_name: string;
    overall_status: 'healthy' | 'warning' | 'unhealthy' | 'unknown';
    checks: Record<string, {
        status: 'healthy' | 'warning' | 'unhealthy' | 'unknown';
        message: string;
        details?: Record<string, any>;
        error?: string;
    }>;
    summary: {
        total_checks: number;
        healthy: number;
        warnings: number;
        unhealthy: number;
        unknown: number;
    };
    timestamp: string;
}

export default function ConnectionHealthCheck({
    account,
    connection}: {
    account: any;
    connection: {
        id: number;
        slug?: string;
        name: string;
    };
}) {
    const { toast } = useToast();
    const [health, setHealth] = useState<HealthCheck | null>(null);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const fetchHealth = async (showRefreshing = false) => {
        if (showRefreshing) {
            setRefreshing(true);
        } else {
            setLoading(true);
        }

        try {
            const response = await axios.get(
                route('app.whatsapp.connections.health.api', {
                    connection: connection.slug ?? connection.id})
            );
            setHealth(response.data);
        } catch (error: any) {
            toast.error('Failed to fetch health check data');
            console.error('Health check error:', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchHealth();
    }, [connection.slug, connection.id]);

    const getStatusBadge = (status: string) => {
        const variants: Record<string, 'success' | 'warning' | 'danger' | 'default'> = {
            healthy: 'success',
            warning: 'warning',
            unhealthy: 'danger',
            unknown: 'default'};

        return (
            <Badge variant={variants[status] || 'default'} className="px-3 py-1">
                {status.charAt(0).toUpperCase() + status.slice(1)}
            </Badge>
        );
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'healthy':
                return <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400" />;
            case 'warning':
                return <AlertTriangle className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />;
            case 'unhealthy':
                return <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400" />;
            default:
                return <Activity className="h-5 w-5 text-gray-400" />;
        }
    };

    const getCheckIcon = (checkName: string) => {
        const iconMap: Record<string, React.ElementType> = {
            connection_active: Activity,
            webhook_subscription: LinkIcon,
            webhook_activity: Clock,
            access_token: Shield,
            api_connectivity: Zap,
            phone_number: Phone};

        const Icon = iconMap[checkName] || Activity;
        return <Icon className="h-4 w-4" />;
    };

    if (loading) {
        return (
            <AppShell>
                <Head title={`${connection.name} - Health Check`} />
                <div className="space-y-8">
                    <div className="text-center py-16">
                        <Activity className="h-12 w-12 text-gray-400 animate-pulse mx-auto mb-4" />
                        <p className="text-gray-500 dark:text-gray-400">Loading health check...</p>
                    </div>
                </div>
            </AppShell>
        );
    }

    if (!health) {
        return (
            <AppShell>
                <Head title={`${connection.name} - Health Check`} />
                <div className="space-y-8">
                    <Alert variant="error">
                        <AlertCircle className="h-5 w-5" />
                        <div>
                            <p className="font-semibold">Failed to load health check</p>
                            <p className="text-sm mt-1">Please try again or contact support.</p>
                        </div>
                    </Alert>
                </div>
            </AppShell>
        );
    }

    const overallStatusColor = {
        healthy: 'from-green-500 to-green-600',
        warning: 'from-yellow-500 to-yellow-600',
        unhealthy: 'from-red-500 to-red-600',
        unknown: 'from-gray-500 to-gray-600'}[health.overall_status] || 'from-gray-500 to-gray-600';

    return (
        <AppShell>
            <Head title={`${connection.name} - Health Check`} />
            <div className="space-y-8">
                <div className="flex items-center justify-between">
                    <div>
                        <Link
                            href={route('app.whatsapp.connections.edit', {
                                connection: connection.slug ?? connection.id})}
                            className="inline-flex items-center gap-2 text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors mb-4"
                        >
                            <ArrowLeft className="h-4 w-4" />
                            Back to Connection
                        </Link>
                        <div>
                            <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-gray-100 dark:to-gray-300 bg-clip-text text-transparent flex items-center gap-3">
                                <Activity className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                                Health Check
                            </h1>
                            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                                {connection.name}
                            </p>
                        </div>
                    </div>
                    <Button
                        onClick={() => fetchHealth(true)}
                        disabled={refreshing}
                        variant="secondary"
                        className="rounded-xl"
                    >
                        <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
                        {refreshing ? 'Refreshing...' : 'Refresh'}
                    </Button>
                </div>

                {/* Overall Status */}
                <Card className="border-0 shadow-lg">
                    <CardHeader className={`bg-gradient-to-r ${overallStatusColor} text-white`}>
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-white/20 rounded-xl">
                                    {getStatusIcon(health.overall_status)}
                                </div>
                                <div>
                                    <CardTitle className="text-xl font-bold text-white">Overall Status</CardTitle>
                                    <CardDescription className="text-white/90">
                                        Last checked: {new Date(health.timestamp).toLocaleString()}
                                    </CardDescription>
                                </div>
                            </div>
                            {getStatusBadge(health.overall_status)}
                        </div>
                    </CardHeader>
                    <CardContent className="p-6">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div className="p-4 bg-gradient-to-r from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 rounded-xl border border-green-200 dark:border-green-800">
                                <div className="text-2xl font-bold text-green-700 dark:text-green-300">
                                    {health.summary.healthy}
                                </div>
                                <div className="text-xs font-semibold text-green-600 dark:text-green-400 uppercase tracking-wider mt-1">
                                    Healthy
                                </div>
                            </div>
                            <div className="p-4 bg-gradient-to-r from-yellow-50 to-yellow-100 dark:from-yellow-900/20 dark:to-yellow-800/20 rounded-xl border border-yellow-200 dark:border-yellow-800">
                                <div className="text-2xl font-bold text-yellow-700 dark:text-yellow-300">
                                    {health.summary.warnings}
                                </div>
                                <div className="text-xs font-semibold text-yellow-600 dark:text-yellow-400 uppercase tracking-wider mt-1">
                                    Warnings
                                </div>
                            </div>
                            <div className="p-4 bg-gradient-to-r from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-800/20 rounded-xl border border-red-200 dark:border-red-800">
                                <div className="text-2xl font-bold text-red-700 dark:text-red-300">
                                    {health.summary.unhealthy}
                                </div>
                                <div className="text-xs font-semibold text-red-600 dark:text-red-400 uppercase tracking-wider mt-1">
                                    Unhealthy
                                </div>
                            </div>
                            <div className="p-4 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 rounded-xl border border-gray-200 dark:border-gray-700">
                                <div className="text-2xl font-bold text-gray-700 dark:text-gray-300">
                                    {health.summary.total_checks}
                                </div>
                                <div className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider mt-1">
                                    Total Checks
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Individual Checks */}
                <div className="space-y-4">
                    {Object.entries(health.checks).map(([checkName, check]) => {
                        const statusColors = {
                            healthy: 'from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 border-green-200 dark:border-green-800',
                            warning: 'from-yellow-50 to-yellow-100 dark:from-yellow-900/20 dark:to-yellow-800/20 border-yellow-200 dark:border-yellow-800',
                            unhealthy: 'from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-800/20 border-red-200 dark:border-red-800',
                            unknown: 'from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 border-gray-200 dark:border-gray-700'}[check.status] || 'from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 border-gray-200 dark:border-gray-700';

                        return (
                            <Card key={checkName} className={`border-0 shadow-lg ${statusColors.split(' ')[0]} border-2`}>
                                <CardContent className="p-6">
                                    <div className="flex items-start justify-between mb-4">
                                        <div className="flex items-center gap-3">
                                            <div className={`p-2 rounded-xl ${
                                                check.status === 'healthy' ? 'bg-green-500' :
                                                check.status === 'warning' ? 'bg-yellow-500' :
                                                check.status === 'unhealthy' ? 'bg-red-500' :
                                                'bg-gray-500'
                                            }`}>
                                                {getCheckIcon(checkName)}
                                            </div>
                                            <div>
                                                <h3 className="font-semibold text-gray-900 dark:text-gray-100 capitalize">
                                                    {checkName.replace(/_/g, ' ')}
                                                </h3>
                                                <p className="text-sm text-gray-600 dark:text-gray-400 mt-0.5">
                                                    {check.message}
                                                </p>
                                            </div>
                                        </div>
                                        {getStatusBadge(check.status)}
                                    </div>

                                    {check.error && (
                                        <Alert variant="error" className="mb-4">
                                            <AlertCircle className="h-4 w-4" />
                                            <p className="text-sm">{check.error}</p>
                                        </Alert>
                                    )}

                                    {check.details && Object.keys(check.details).length > 0 && (
                                        <div className="mt-4 p-4 bg-white dark:bg-gray-950 rounded-xl border border-gray-200 dark:border-gray-700">
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                                {Object.entries(check.details).map(([key, value]) => (
                                                    <div key={key}>
                                                        <div className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">
                                                            {key.replace(/_/g, ' ')}
                                                        </div>
                                                        <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                                            {value === null || value === '' ? '—' : String(value)}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        );
                    })}
                </div>
            </div>
        </AppShell>
    );
}
