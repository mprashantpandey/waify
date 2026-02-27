import { Link, router } from '@inertiajs/react';
import AppShell from '@/Layouts/AppShell';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/Components/UI/Card';
import { Badge } from '@/Components/UI/Badge';
import Button from '@/Components/UI/Button';
import { ArrowLeft, Send, AlertCircle, FileText, Globe, Tag, Sparkles, Clock, CheckCircle2, Archive, Trash2, Edit, RefreshCw } from 'lucide-react';
import { Head } from '@inertiajs/react';
import { Alert } from '@/Components/UI/Alert';
import { useToast } from '@/hooks/useToast';
import { useConfirm } from '@/hooks/useConfirm';
import { useEffect, useState } from 'react';
import { useRealtime } from '@/Providers/RealtimeProvider';

interface Template {
    id: number;
    slug: string;
    name: string;
    language: string;
    category: string;
    status: string;
    quality_score: string | null;
    body_text: string | null;
    header_type: string | null;
    header_text: string | null;
    footer_text: string | null;
    buttons: Array<{
        type: string;
        text: string;
        url?: string;
        phone_number?: string;
    }>;
    variable_count: number;
    has_buttons: boolean;
    last_synced_at: string | null;
    last_meta_error: string | null;
    rejection_reason?: string | null;
    meta_template_id?: string | null;
    connection: {
        id: number;
        name: string;
    };
}

export default function TemplatesShow({
    account,
    template}: {
    account: any;
    template: Template;
}) {
    const { toast } = useToast();
    const confirm = useConfirm();
    const { subscribe } = useRealtime();
    const [liveTemplate, setLiveTemplate] = useState<Template>(template);

    useEffect(() => {
        setLiveTemplate(template);
    }, [template]);

    const handleCheckStatus = () => {
        router.post(
            route('app.whatsapp.templates.check-status', {
                template: liveTemplate.slug}),
            {},
            {
                onSuccess: () => {
                    router.reload({ only: ['template'] });
                },
                onError: (errors) => {
                    toast.error(errors?.message || 'Failed to check template status');
                }}
        );
    };

    useEffect(() => {
        if (!account?.id) return;

        const channel = `account.${account.id}.whatsapp.templates`;
        const unsubscribe = subscribe(channel, '.whatsapp.template.status.updated', (data: any) => {
            const incoming = data?.template;
            if (!incoming) return;
            if (incoming.id !== liveTemplate.id && incoming.slug !== liveTemplate.slug) return;

            setLiveTemplate((prev) => ({
                ...prev,
                status: incoming.status ?? prev.status,
                last_meta_error: incoming.last_meta_error ?? prev.last_meta_error,
                rejection_reason: incoming.rejection_reason ?? prev.rejection_reason,
                last_synced_at: incoming.last_synced_at ?? prev.last_synced_at,
            }));
        });

        return unsubscribe;
    }, [account?.id, liveTemplate.id, liveTemplate.slug, subscribe]);

    const handleArchive = async () => {
        const confirmed = await confirm({
            title: 'Archive Template',
            message: `Are you sure you want to archive "${liveTemplate.name}"? You can restore it later.`,
            variant: 'warning'});

        if (!confirmed) return;

        router.post(
            route('app.whatsapp.templates.archive', {
                template: liveTemplate.slug}),
            {},
            {
                onSuccess: () => {
                    router.visit(route('app.whatsapp.templates.index', {}));
                },
                onError: () => {
                    toast.error('Failed to archive template');
                }}
        );
    };

    const handleDelete = async () => {
        const confirmed = await confirm({
            title: 'Delete Template',
            message: `Are you sure you want to permanently delete "${liveTemplate.name}"? This action cannot be undone.`,
            variant: 'danger',
            confirmText: 'Delete'});

        if (!confirmed) return;

        router.delete(
            route('app.whatsapp.templates.destroy', {
                template: liveTemplate.slug}),
            {
                onSuccess: () => {
                    router.visit(route('app.whatsapp.templates.index', {}));
                },
                onError: () => {
                    toast.error('Failed to delete template');
                }}
        );
    };

    const getStatusBadge = (status: string) => {
        const statusMap: Record<string, { variant: 'success' | 'warning' | 'danger' | 'default' | 'info'; label: string }> = {
            approved: { variant: 'success', label: 'Approved' },
            pending: { variant: 'warning', label: 'Pending' },
            rejected: { variant: 'danger', label: 'Rejected' },
            paused: { variant: 'default', label: 'Paused' },
            disabled: { variant: 'default', label: 'Disabled' }};

        const config = statusMap[status.toLowerCase()] || { variant: 'default' as const, label: status };
        return <Badge variant={config.variant} className="px-3 py-1">{config.label}</Badge>;
    };

    return (
        <AppShell>
            <Head title={`${liveTemplate.name} - Template`} />
            <div className="space-y-8">
                <div>
                    <Link
                        href={route('app.whatsapp.templates.index', {})}
                        className="inline-flex items-center gap-2 text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors mb-4"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        Back to Templates
                    </Link>
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-gray-100 dark:to-gray-300 bg-clip-text text-transparent flex items-center gap-3 mb-2">
                                {liveTemplate.name}
                                {getStatusBadge(liveTemplate.status)}
                            </h1>
                            <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                                <div className="flex items-center gap-1.5">
                                    <Globe className="h-4 w-4" />
                                    {liveTemplate.language}
                                </div>
                                <div className="flex items-center gap-1.5">
                                    <Tag className="h-4 w-4" />
                                    {liveTemplate.category}
                                </div>
                                <div className="flex items-center gap-1.5">
                                    <FileText className="h-4 w-4" />
                                    {liveTemplate.connection.name}
                                </div>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <Link
                                href={route('app.whatsapp.templates.edit', {
                                    template: liveTemplate.slug})}
                            >
                                <Button variant="secondary">
                                    <Edit className="h-4 w-4 mr-2" />
                                    Edit
                                </Button>
                            </Link>
                            {liveTemplate.meta_template_id && (
                                <Button
                                    variant="secondary"
                                    onClick={handleCheckStatus}
                                >
                                    <RefreshCw className="h-4 w-4 mr-2" />
                                    Check Status
                                </Button>
                            )}
                            <Link
                                href={route('app.whatsapp.templates.send', {
                                    template: liveTemplate.slug})}
                            >
                                <Button className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 shadow-lg shadow-green-500/50">
                                    <Send className="h-4 w-4 mr-2" />
                                    Send Template
                                </Button>
                            </Link>
                            <Button
                                variant="secondary"
                                onClick={handleArchive}
                                className="text-orange-600 hover:text-orange-700 hover:bg-orange-50 dark:hover:bg-orange-900/20"
                            >
                                <Archive className="h-4 w-4 mr-2" />
                                Archive
                            </Button>
                            <Button
                                variant="secondary"
                                onClick={handleDelete}
                                className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                            >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Delete
                            </Button>
                        </div>
                    </div>
                </div>

                {liveTemplate.rejection_reason && (
                    <Alert variant="error" className="border-red-200 dark:border-red-800">
                        <AlertCircle className="h-5 w-5" />
                        <div>
                            <h3 className="font-semibold text-red-800 dark:text-red-200 mb-1">Rejection Reason</h3>
                            <p className="text-sm text-red-600 dark:text-red-400">{liveTemplate.rejection_reason}</p>
                        </div>
                    </Alert>
                )}

                {liveTemplate.last_meta_error && (
                    <Alert variant="error" className="border-red-200 dark:border-red-800">
                        <AlertCircle className="h-5 w-5" />
                        <div>
                            <h3 className="font-semibold text-red-800 dark:text-red-200 mb-1">Meta Error</h3>
                            <p className="text-sm text-red-600 dark:text-red-400">{liveTemplate.last_meta_error}</p>
                        </div>
                    </Alert>
                )}

                {/* Template Preview */}
                <Card className="border-0 shadow-lg">
                    <CardHeader className="bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-blue-500 rounded-xl">
                                <FileText className="h-5 w-5 text-white" />
                            </div>
                            <div>
                                <CardTitle className="text-xl font-bold">Template Preview</CardTitle>
                                <CardDescription>How your template will appear to recipients</CardDescription>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="p-6 space-y-6">
                        {liveTemplate.header_type && liveTemplate.header_text && (
                            <div className="p-5 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 rounded-xl border border-gray-200 dark:border-gray-700">
                                <div className="flex items-center gap-2 mb-3">
                                    <Badge variant="info" className="px-2 py-1 text-xs">
                                        Header ({liveTemplate.header_type})
                                    </Badge>
                                </div>
                                <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                    {liveTemplate.header_text}
                                </p>
                            </div>
                        )}

                        {liveTemplate.body_text && (
                            <div className="p-5 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 rounded-xl border border-gray-200 dark:border-gray-700">
                                <div className="flex items-center gap-2 mb-3">
                                    <Badge variant="default" className="px-2 py-1 text-xs">
                                        Body
                                    </Badge>
                                    {liveTemplate.variable_count > 0 && (
                                        <Badge variant="info" className="px-2 py-1 text-xs">
                                            {liveTemplate.variable_count} variables
                                        </Badge>
                                    )}
                                </div>
                                <p className="text-sm text-gray-900 dark:text-gray-100 whitespace-pre-wrap leading-relaxed">
                                    {liveTemplate.body_text}
                                </p>
                            </div>
                        )}

                        {liveTemplate.footer_text && (
                            <div className="p-5 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 rounded-xl border border-gray-200 dark:border-gray-700">
                                <div className="flex items-center gap-2 mb-3">
                                    <Badge variant="default" className="px-2 py-1 text-xs">
                                        Footer
                                    </Badge>
                                </div>
                                <p className="text-sm text-gray-900 dark:text-gray-100">
                                    {liveTemplate.footer_text}
                                </p>
                            </div>
                        )}

                        {liveTemplate.has_buttons && liveTemplate.buttons.length > 0 && (
                            <div>
                                <div className="flex items-center gap-2 mb-3">
                                    <Badge variant="default" className="px-2 py-1 text-xs">
                                        Buttons
                                    </Badge>
                                </div>
                                <div className="space-y-2">
                                    {liveTemplate.buttons.map((button, index) => (
                                        <div
                                            key={index}
                                            className="p-4 bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-xl border border-blue-200 dark:border-blue-800 flex items-center justify-between hover:shadow-md transition-shadow"
                                        >
                                            <span className="font-semibold text-gray-900 dark:text-gray-100">{button.text}</span>
                                            <Badge variant="info" className="px-3 py-1">
                                                {button.type}
                                            </Badge>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Template Details */}
                <Card className="border-0 shadow-lg">
                    <CardHeader className="bg-gradient-to-r from-gray-50 to-white dark:from-gray-800 dark:to-gray-900">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl">
                                <Sparkles className="h-5 w-5 text-white" />
                            </div>
                            <div>
                                <CardTitle className="text-xl font-bold">Template Details</CardTitle>
                                <CardDescription>Metadata and sync information</CardDescription>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="p-6">
                        <dl className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="p-4 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 rounded-xl">
                                <dt className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">Name</dt>
                                <dd className="text-sm font-semibold text-gray-900 dark:text-gray-100">{liveTemplate.name}</dd>
                            </div>
                            <div className="p-4 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 rounded-xl">
                                <dt className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">Language</dt>
                                <dd className="text-sm font-semibold text-gray-900 dark:text-gray-100">{liveTemplate.language}</dd>
                            </div>
                            <div className="p-4 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 rounded-xl">
                                <dt className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">Category</dt>
                                <dd className="text-sm font-semibold text-gray-900 dark:text-gray-100">{liveTemplate.category}</dd>
                            </div>
                            <div className="p-4 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 rounded-xl">
                                <dt className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">Status</dt>
                                <dd>{getStatusBadge(liveTemplate.status)}</dd>
                            </div>
                            {liveTemplate.quality_score && (
                                <div className="p-4 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 rounded-xl">
                                    <dt className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">Quality Score</dt>
                                    <dd className="text-sm font-semibold text-gray-900 dark:text-gray-100">{liveTemplate.quality_score}</dd>
                                </div>
                            )}
                            {liveTemplate.last_synced_at && (
                                <div className="p-4 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 rounded-xl">
                                    <dt className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1 flex items-center gap-1">
                                        <Clock className="h-3.5 w-3.5" />
                                        Last Synced
                                    </dt>
                                    <dd className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                                        {new Date(liveTemplate.last_synced_at).toLocaleString()}
                                    </dd>
                                </div>
                            )}
                        </dl>
                    </CardContent>
                </Card>
            </div>
        </AppShell>
    );
}
