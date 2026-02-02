import { useForm } from '@inertiajs/react';
import { FormEventHandler, useState } from 'react';
import AppShell from '@/Layouts/AppShell';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/Components/UI/Card';
import Button from '@/Components/UI/Button';
import TextInput from '@/Components/TextInput';
import InputLabel from '@/Components/InputLabel';
import InputError from '@/Components/InputError';
import { Badge } from '@/Components/UI/Badge';
import { Alert } from '@/Components/UI/Alert';
import { ArrowLeft, Copy, Check, Eye, EyeOff, RotateCcw, Link as LinkIcon, Shield, Info, Sparkles, AlertTriangle, Activity } from 'lucide-react';
import { Link, router, Head } from '@inertiajs/react';
import { useNotifications } from '@/hooks/useNotifications';
import axios from 'axios';
import Modal from '@/Components/Modal';

interface Connection {
    id: number;
    slug?: string;
    name: string;
    waba_id: string | null;
    phone_number_id: string;
    business_phone: string | null;
    api_version: string;
    webhook_verify_token: string; // Masked
    webhook_verify_token_full?: string; // Full token (only if canViewSecrets)
    webhook_url: string;
    webhook_subscribed: boolean;
    webhook_last_received_at: string | null;
    webhook_last_error: string | null;
}

export default function ConnectionsEdit({
    workspace,
    connection,
    canViewSecrets = false,
}: {
    workspace: any;
    connection: Connection;
    canViewSecrets?: boolean;
}) {
    const { confirm, toast } = useNotifications();
    const [showToken, setShowToken] = useState(false);
    const [showVerifyToken, setShowVerifyToken] = useState(false);
    const [copied, setCopied] = useState<string | null>(null);
    const [testLoading, setTestLoading] = useState(false);
    const [testResult, setTestResult] = useState<{ ok: boolean; message: string } | null>(null);
    const [webhookLoading, setWebhookLoading] = useState(false);
    const [webhookResult, setWebhookResult] = useState<{ ok: boolean; message: string } | null>(null);
    const [alertOpen, setAlertOpen] = useState(false);
    const [alertTitle, setAlertTitle] = useState('');
    const [alertMessage, setAlertMessage] = useState('');
    const [alertVariant, setAlertVariant] = useState<'success' | 'error'>('success');

    const { data, setData, put, processing, errors } = useForm({
        name: connection.name,
        waba_id: connection.waba_id || '',
        phone_number_id: connection.phone_number_id,
        business_phone: connection.business_phone || '',
        access_token: '', // Optional on update
        api_version: connection.api_version,
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        put(route('app.whatsapp.connections.update', {
            workspace: workspace.slug,
            connection: connection.slug ?? connection.id,
        }));
    };

    const copyToClipboard = (text: string, key: string) => {
        navigator.clipboard.writeText(text);
        setCopied(key);
        toast.success('Copied to clipboard');
        setTimeout(() => setCopied(null), 2000);
    };

    const rotateToken = async () => {
        const confirmed = await confirm({
            title: 'Rotate Verify Token',
            message: 'Are you sure you want to rotate the verify token? You will need to update your webhook settings in Meta Business Manager.',
            variant: 'warning',
        });

        if (confirmed) {
            router.post(route('app.whatsapp.connections.rotate-verify-token', {
                workspace: workspace.slug,
                connection: connection.slug ?? connection.id,
            }), {}, {
                onSuccess: () => {
                    toast.success('Verify token rotated successfully');
                },
                onError: () => {
                    toast.error('Failed to rotate token');
                },
            });
        }
    };

    const showAlert = (title: string, message: string, variant: 'success' | 'error') => {
        setAlertTitle(title);
        setAlertMessage(message);
        setAlertVariant(variant);
        setAlertOpen(true);
    };

    const runConnectionTest = async () => {
        setTestLoading(true);
        setTestResult(null);
        try {
            const { data } = await axios.post(
                route('app.whatsapp.connections.test-saved', {
                    workspace: workspace.slug,
                    connection: connection.slug ?? connection.id,
                }) as string
            );
            const summary = [
                data.display_phone_number ? `Phone: ${data.display_phone_number}` : null,
                data.verified_name ? `Verified: ${data.verified_name}` : null,
                data.waba_match === false ? 'WABA mismatch' : null,
            ]
                .filter(Boolean)
                .join(' · ');
            setTestResult({ ok: true, message: summary || 'Connection looks valid.' });
            showAlert('Connection Test Successful', summary || 'Connection looks valid.', 'success');
        } catch (error: any) {
            const message = error?.response?.data?.error || 'Connection test failed';
            setTestResult({ ok: false, message });
            showAlert('Connection Test Failed', message, 'error');
        } finally {
            setTestLoading(false);
        }
    };

    const runWebhookTest = async () => {
        setWebhookLoading(true);
        setWebhookResult(null);
        try {
            const { data } = await axios.post(
                route('app.whatsapp.connections.webhook.test', {
                    workspace: workspace.slug,
                    connection: connection.slug ?? connection.id,
                }) as string
            );
            const message = data?.message || 'Webhook verified successfully.';
            setWebhookResult({ ok: true, message });
            showAlert('Webhook Test Successful', message, 'success');
        } catch (error: any) {
            const message =
                error?.response?.data?.error ||
                error?.response?.data?.message ||
                'Webhook test failed. Please check your webhook settings and try again.';
            setWebhookResult({ ok: false, message });
            showAlert('Webhook Test Failed', message, 'error');
        } finally {
            setWebhookLoading(false);
        }
    };

    return (
        <AppShell>
            <Head title={`Edit ${connection.name}`} />
            <Modal show={alertOpen} onClose={() => setAlertOpen(false)} maxWidth="sm">
                <div className="p-6">
                    <div className="flex items-start gap-3">
                        <div className={`h-10 w-10 rounded-full flex items-center justify-center ${alertVariant === 'success' ? 'bg-emerald-100 text-emerald-600' : 'bg-red-100 text-red-600'}`}>
                            {alertVariant === 'success' ? <Check className="h-5 w-5" /> : <AlertTriangle className="h-5 w-5" />}
                        </div>
                        <div className="flex-1">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{alertTitle}</h3>
                            <p className="mt-2 text-sm text-gray-600 dark:text-gray-300 whitespace-pre-wrap">{alertMessage}</p>
                        </div>
                    </div>
                    <div className="mt-6 flex justify-end">
                        <Button onClick={() => setAlertOpen(false)} variant="secondary">
                            Close
                        </Button>
                    </div>
                </div>
            </Modal>
            <div className="space-y-8">
                <div>
                    <Link
                        href={route('app.whatsapp.connections.index', { workspace: workspace.slug })}
                        className="inline-flex items-center gap-2 text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors mb-4"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        Back to Connections
                    </Link>
                    <div>
                        <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-gray-100 dark:to-gray-300 bg-clip-text text-transparent">
                            Edit Connection
                        </h1>
                        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                            Update your WhatsApp connection settings
                        </p>
                    </div>
                </div>

                <Card className="border-0 shadow-xl">
                    <CardHeader className="bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-blue-500 rounded-xl">
                                <LinkIcon className="h-5 w-5 text-white" />
                            </div>
                            <div>
                                <CardTitle className="text-xl font-bold">Connection Settings</CardTitle>
                                <CardDescription>Update your connection details</CardDescription>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="p-6">
                        <form onSubmit={submit} className="space-y-6">
                            <div>
                                <InputLabel htmlFor="name" value="Connection Name" className="text-sm font-semibold mb-2" />
                                <TextInput
                                    id="name"
                                    type="text"
                                    value={data.name}
                                    className="mt-1 block w-full rounded-xl"
                                    onChange={(e) => setData('name', e.target.value)}
                                    required
                                />
                                <InputError message={errors.name} className="mt-2" />
                            </div>

                            <div>
                                <InputLabel htmlFor="phone_number_id" value="Phone Number ID *" className="text-sm font-semibold mb-2" />
                                <TextInput
                                    id="phone_number_id"
                                    type="text"
                                    value={data.phone_number_id}
                                    className="mt-1 block w-full rounded-xl font-mono"
                                    onChange={(e) => setData('phone_number_id', e.target.value)}
                                    required
                                />
                                <InputError message={errors.phone_number_id} className="mt-2" />
                            </div>

                            <div>
                                <InputLabel htmlFor="waba_id" value="WhatsApp Business Account ID (Optional)" className="text-sm font-semibold mb-2" />
                                <TextInput
                                    id="waba_id"
                                    type="text"
                                    value={data.waba_id}
                                    className="mt-1 block w-full rounded-xl font-mono"
                                    onChange={(e) => setData('waba_id', e.target.value)}
                                />
                                <InputError message={errors.waba_id} className="mt-2" />
                            </div>

                            <div>
                                <InputLabel htmlFor="business_phone" value="Business Phone (Optional)" className="text-sm font-semibold mb-2" />
                                <TextInput
                                    id="business_phone"
                                    type="text"
                                    value={data.business_phone}
                                    className="mt-1 block w-full rounded-xl"
                                    onChange={(e) => setData('business_phone', e.target.value)}
                                />
                                <InputError message={errors.business_phone} className="mt-2" />
                            </div>

                            <div>
                                <div className="flex items-center justify-between mb-2">
                                    <InputLabel htmlFor="access_token" value="Access Token (Leave blank to keep current)" className="text-sm font-semibold" />
                                    <button
                                        type="button"
                                        onClick={() => setShowToken(!showToken)}
                                        className="text-sm font-medium text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors flex items-center gap-1"
                                    >
                                        {showToken ? (
                                            <>
                                                <EyeOff className="h-4 w-4" />
                                                Hide
                                            </>
                                        ) : (
                                            <>
                                                <Eye className="h-4 w-4" />
                                                Show
                                            </>
                                        )}
                                    </button>
                                </div>
                                <TextInput
                                    id="access_token"
                                    type={showToken ? 'text' : 'password'}
                                    value={data.access_token}
                                    className="mt-1 block w-full rounded-xl font-mono text-sm"
                                    onChange={(e) => setData('access_token', e.target.value)}
                                    placeholder="Leave blank to keep current token"
                                />
                                <InputError message={errors.access_token} className="mt-2" />
                            </div>

                            <div>
                                <InputLabel htmlFor="api_version" value="API Version" className="text-sm font-semibold mb-2" />
                                <TextInput
                                    id="api_version"
                                    type="text"
                                    value={data.api_version}
                                    className="mt-1 block w-full rounded-xl font-mono"
                                    onChange={(e) => setData('api_version', e.target.value)}
                                />
                                <InputError message={errors.api_version} className="mt-2" />
                            </div>

                            <div className="border-t border-gray-200 dark:border-gray-700 pt-6 space-y-6">
                                <div>
                                    <div className="flex items-center justify-between mb-3">
                                        <div className="flex items-center gap-2">
                                            <Shield className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                                            <InputLabel value="Webhook Configuration" className="text-base font-bold" />
                                        </div>
                                    </div>
                                    
                                    <div className="space-y-4">
                                        <div className="p-4 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 rounded-xl border border-gray-200 dark:border-gray-700">
                                            <div className="flex items-center justify-between mb-2">
                                                <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">Webhook URL</p>
                                                <button
                                                    type="button"
                                                    onClick={() => copyToClipboard(connection.webhook_url, 'url')}
                                                    className="text-sm font-medium text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors flex items-center gap-1"
                                                >
                                                    {copied === 'url' ? (
                                                        <>
                                                            <Check className="h-4 w-4" />
                                                            Copied!
                                                        </>
                                                    ) : (
                                                        <>
                                                            <Copy className="h-4 w-4" />
                                                            Copy
                                                        </>
                                                    )}
                                                </button>
                                            </div>
                                            <code className="block text-xs font-mono bg-white dark:bg-gray-950 px-3 py-2 rounded-lg break-all border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100">
                                                {connection.webhook_url}
                                            </code>
                                            <p className="mt-2 text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                                                <Info className="h-3.5 w-3.5" />
                                                Paste this URL in Meta Business Manager → WhatsApp → Configuration → Webhook
                                            </p>
                                        </div>

                                        <div className="p-4 bg-gradient-to-r from-amber-50 to-amber-100 dark:from-amber-900/20 dark:to-amber-800/20 rounded-xl border border-amber-200 dark:border-amber-800">
                                            <div className="flex items-center justify-between mb-2">
                                                <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">Verify Token</p>
                                                <div className="flex items-center gap-2">
                                                    <button
                                                        type="button"
                                                        onClick={() => setShowVerifyToken(!showVerifyToken)}
                                                        className="text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors flex items-center gap-1"
                                                    >
                                                        {showVerifyToken ? (
                                                            <>
                                                                <EyeOff className="h-4 w-4" />
                                                                Hide
                                                            </>
                                                        ) : (
                                                            <>
                                                                <Eye className="h-4 w-4" />
                                                                Show
                                                            </>
                                                        )}
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() => copyToClipboard(
                                                            canViewSecrets && connection.webhook_verify_token_full 
                                                                ? connection.webhook_verify_token_full 
                                                                : connection.webhook_verify_token,
                                                            'verify'
                                                        )}
                                                        className="text-sm font-medium text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors flex items-center gap-1"
                                                        disabled={!canViewSecrets && !showVerifyToken}
                                                        title={!canViewSecrets && !showVerifyToken ? 'You need owner/admin access to copy the full token' : 'Copy token'}
                                                    >
                                                        {copied === 'verify' ? (
                                                            <Check className="h-4 w-4" />
                                                        ) : (
                                                            <Copy className="h-4 w-4" />
                                                        )}
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={rotateToken}
                                                        className="text-sm font-medium text-orange-600 dark:text-orange-400 hover:text-orange-700 dark:hover:text-orange-300 transition-colors flex items-center gap-1"
                                                    >
                                                        <RotateCcw className="h-4 w-4" />
                                                        Rotate
                                                    </button>
                                                </div>
                                            </div>
                                            <code className="block text-xs font-mono bg-white dark:bg-gray-950 px-3 py-2 rounded-lg border border-amber-200 dark:border-amber-800 text-gray-900 dark:text-gray-100">
                                                {showVerifyToken && canViewSecrets && connection.webhook_verify_token_full
                                                    ? connection.webhook_verify_token_full
                                                    : showVerifyToken
                                                        ? connection.webhook_verify_token
                                                        : '••••••••••••••••'}
                                            </code>
                                            {!canViewSecrets && (
                                                <p className="mt-2 text-xs text-amber-600 dark:text-amber-400 flex items-center gap-1">
                                                    <AlertTriangle className="h-3.5 w-3.5" />
                                                    Only workspace owners/admins can view the full token
                                                </p>
                                            )}
                                            <p className="mt-2 text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                                                <Info className="h-3.5 w-3.5" />
                                                Use this token when verifying the webhook in Meta
                                            </p>
                                        </div>

                                        <div className="flex items-center gap-3">
                                            <Badge variant={connection.webhook_subscribed ? 'success' : 'default'} className="flex items-center gap-1.5 px-3 py-1">
                                                {connection.webhook_subscribed ? (
                                                    <>
                                                        <Sparkles className="h-3.5 w-3.5" />
                                                        Webhook Subscribed
                                                    </>
                                                ) : (
                                                    'Not Subscribed'
                                                )}
                                            </Badge>
                                            {connection.webhook_last_received_at && (
                                                <span className="text-xs text-gray-500 dark:text-gray-400">
                                                    Last received: {new Date(connection.webhook_last_received_at).toLocaleString()}
                                                </span>
                                            )}
                                        </div>

                                        {connection.webhook_last_error && (
                                            <Alert variant="error" className="border-red-200 dark:border-red-800">
                                                <div className="flex items-start gap-2">
                                                    <AlertTriangle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                                                    <div>
                                                        <p className="text-sm font-semibold text-red-800 dark:text-red-200">Last Error:</p>
                                                        <p className="text-xs text-red-600 dark:text-red-400 mt-1">
                                                            {connection.webhook_last_error}
                                                        </p>
                                                    </div>
                                                </div>
                                            </Alert>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
                                <Link href={route('app.whatsapp.connections.health', { workspace: workspace.slug, connection: connection.slug ?? connection.id })}>
                                    <Button type="button" variant="secondary" className="rounded-xl bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 hover:bg-green-100 dark:hover:bg-green-900/30">
                                        <Activity className="h-4 w-4 mr-2" />
                                        Health Check
                                    </Button>
                                </Link>
                                <div className="flex items-center gap-4">
                                    <Link href={route('app.whatsapp.connections.index', { workspace: workspace.slug })}>
                                        <Button type="button" variant="secondary" className="rounded-xl">
                                            Cancel
                                        </Button>
                                    </Link>
                                    <Button 
                                        type="submit" 
                                        disabled={processing}
                                        className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 shadow-lg shadow-blue-500/50 rounded-xl"
                                    >
                                        {processing ? 'Saving...' : 'Save Changes'}
                                    </Button>
                                </div>
                            </div>
                        </form>
                    </CardContent>
                </Card>

                <Card className="border-0 shadow-xl">
                    <CardHeader className="bg-gradient-to-r from-emerald-50 to-teal-100 dark:from-emerald-900/20 dark:to-teal-800/20">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-emerald-500 rounded-xl">
                                <Activity className="h-5 w-5 text-white" />
                            </div>
                            <div>
                                <CardTitle className="text-xl font-bold">Connection Tests</CardTitle>
                                <CardDescription>Validate your Meta connection and webhook from here.</CardDescription>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="p-6 space-y-6">
                        <div className="grid gap-6 lg:grid-cols-2">
                            <div className="space-y-4">
                                <div className="text-sm text-gray-600 dark:text-gray-300">
                                    Uses the credentials saved with this connection.
                                </div>
                                <Button onClick={runConnectionTest} disabled={testLoading}>
                                    {testLoading ? 'Testing...' : 'Test Connection'}
                                </Button>
                                {testResult && (
                                    <Alert variant={testResult.ok ? 'success' : 'error'}>
                                        {testResult.message}
                                    </Alert>
                                )}
                            </div>
                            <div className="space-y-4">
                                <div className="text-sm text-gray-600 dark:text-gray-300">
                                    Webhook URL: <span className="font-mono break-all">{connection.webhook_url}</span>
                                </div>
                                <div className="text-xs text-gray-500">
                                    This sends an internal verification request to the webhook endpoint.
                                </div>
                                <Button variant="secondary" onClick={runWebhookTest} disabled={webhookLoading}>
                                    {webhookLoading ? 'Testing...' : 'Test Webhook'}
                                </Button>
                                {webhookResult && (
                                    <Alert variant={webhookResult.ok ? 'success' : 'error'}>
                                        {webhookResult.message}
                                    </Alert>
                                )}
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </AppShell>
    );
}
