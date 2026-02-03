import { Head, Link } from '@inertiajs/react';
import PlatformShell from '@/Layouts/PlatformShell';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/Components/UI/Card';
import { Badge } from '@/Components/UI/Badge';
import { 
    ArrowLeft,
    Building2,
    Link as LinkIcon,
    CheckCircle,
    Clock,
    XCircle,
    AlertCircle,
    FileText
} from 'lucide-react';
import { usePage } from '@inertiajs/react';

interface Template {
    id: number;
    slug: string;
    name: string;
    language: string;
    category: string;
    status: string;
    quality_score: string | null;
    body_text: string;
    header_type: string | null;
    header_text: string | null;
    footer_text: string | null;
    buttons: any[] | null;
    components: any[] | null;
    account: {
        id: number;
        name: string;
        slug: string;
    };
    connection: {
        id: number;
        name: string;
    } | null;
    last_synced_at: string | null;
    last_meta_error: string | null;
    is_archived: boolean;
    created_at: string;
}

export default function TemplatesShow({ template }: { template: Template }) {
    const { auth } = usePage().props as any;

    const getStatusBadge = (status: string) => {
        const statusMap: Record<string, { variant: 'success' | 'warning' | 'danger' | 'info' | 'default'; icon: any }> = {
            APPROVED: { variant: 'success', icon: CheckCircle },
            PENDING: { variant: 'warning', icon: Clock },
            REJECTED: { variant: 'danger', icon: XCircle }};

        const config = statusMap[status] || { variant: 'default' as const, icon: AlertCircle };
        const Icon = config.icon;
        
        return (
            <Badge variant={config.variant} className="flex items-center gap-1">
                <Icon className="h-3 w-3" />
                {status}
            </Badge>
        );
    };

    return (
        <PlatformShell auth={auth}>
            <Head title={`Template: ${template.name}`} />
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link href={route('platform.templates.index')}>
                            <button className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100">
                                <ArrowLeft className="h-4 w-4" />
                                Back to Templates
                            </button>
                        </Link>
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">{template.name}</h1>
                            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                                Template details and metadata
                            </p>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2 space-y-6">
                        {/* Template Content */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Template Content</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {template.header_text && (
                                    <div>
                                        <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Header</p>
                                        <p className="text-base text-gray-900 dark:text-gray-100">{template.header_text}</p>
                                    </div>
                                )}
                                
                                <div>
                                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Body</p>
                                    <p className="text-base text-gray-900 dark:text-gray-100 whitespace-pre-wrap">
                                        {template.body_text}
                                    </p>
                                </div>

                                {template.footer_text && (
                                    <div>
                                        <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Footer</p>
                                        <p className="text-base text-gray-900 dark:text-gray-100">{template.footer_text}</p>
                                    </div>
                                )}

                                {template.buttons && template.buttons.length > 0 && (
                                    <div>
                                        <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">Buttons</p>
                                        <div className="space-y-2">
                                            {template.buttons.map((button, index) => (
                                                <div key={index} className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                                                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                                        {button.text || button.title}
                                                    </p>
                                                    <p className="text-xs text-gray-500 dark:text-gray-400">
                                                        Type: {button.type}
                                                    </p>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* Components */}
                        {template.components && template.components.length > 0 && (
                            <Card>
                                <CardHeader>
                                    <CardTitle>Components</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <pre className="text-xs bg-gray-900 text-gray-100 p-4 rounded overflow-auto">
                                        {JSON.stringify(template.components, null, 2)}
                                    </pre>
                                </CardContent>
                            </Card>
                        )}
                    </div>

                    <div className="space-y-6">
                        {/* Template Info */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Template Information</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">Status</p>
                                    <div className="mt-1">
                                        {getStatusBadge(template.status)}
                                    </div>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">Category</p>
                                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100 mt-1">
                                        {template.category}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">Language</p>
                                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100 mt-1">
                                        {template.language}
                                    </p>
                                </div>
                                {template.quality_score && (
                                    <div>
                                        <p className="text-sm text-gray-500 dark:text-gray-400">Quality Score</p>
                                        <p className="text-sm font-medium text-gray-900 dark:text-gray-100 mt-1">
                                            {template.quality_score}
                                        </p>
                                    </div>
                                )}
                                <div>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">Created</p>
                                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100 mt-1">
                                        {new Date(template.created_at).toLocaleString()}
                                    </p>
                                </div>
                                {template.last_synced_at && (
                                    <div>
                                        <p className="text-sm text-gray-500 dark:text-gray-400">Last Synced</p>
                                        <p className="text-sm font-medium text-gray-900 dark:text-gray-100 mt-1">
                                            {new Date(template.last_synced_at).toLocaleString()}
                                        </p>
                                    </div>
                                )}
                                {template.is_archived && (
                                    <div>
                                        <Badge variant="warning">Archived</Badge>
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* Tenant Info */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Tenant</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <Link
                                    href={route('platform.accounts.show', { account: template.account.id })}
                                    className="flex items-center gap-2 text-blue-600 dark:text-blue-400 hover:underline"
                                >
                                    <Building2 className="h-4 w-4" />
                                    {template.account.name}
                                </Link>
                                {template.connection && (
                                    <div className="mt-3">
                                        <p className="text-xs text-gray-500 dark:text-gray-400">Connection</p>
                                        <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                            {template.connection.name}
                                        </p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* Errors */}
                        {template.last_meta_error && (
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2 text-red-600 dark:text-red-400">
                                        <AlertCircle className="h-5 w-5" />
                                        Last Error
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-sm text-red-600 dark:text-red-400">
                                        {template.last_meta_error}
                                    </p>
                                </CardContent>
                            </Card>
                        )}
                    </div>
                </div>
            </div>
        </PlatformShell>
    );
}
