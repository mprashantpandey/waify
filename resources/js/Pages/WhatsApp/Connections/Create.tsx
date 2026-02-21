import { useForm } from '@inertiajs/react';
import { FormEventHandler, useEffect, useState } from 'react';
import AppShell from '@/Layouts/AppShell';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/Components/UI/Card';
import Button from '@/Components/UI/Button';
import TextInput from '@/Components/TextInput';
import InputLabel from '@/Components/InputLabel';
import InputError from '@/Components/InputError';
import { ArrowLeft, Eye, EyeOff, Link as LinkIcon, Sparkles, Info, CheckCircle2 } from 'lucide-react';
import { Link, Head } from '@inertiajs/react';
import axios from 'axios';
import { useToast } from '@/hooks/useToast';

declare global {
    interface Window {
        FB?: any;
        fbAsyncInit?: () => void;
    }
}

export default function ConnectionsCreate({
    account,
    embeddedSignup,
    defaultApiVersion}: {
    account: any;
    embeddedSignup: { enabled?: boolean; appId?: string; configId?: string; apiVersion?: string };
    defaultApiVersion: string;
}) {
    const [showToken, setShowToken] = useState(false);
    const [embeddedReady, setEmbeddedReady] = useState(false);
    const [embeddedStatus, setEmbeddedStatus] = useState<string | null>(null);
    const [testing, setTesting] = useState(false);
    const [testResult, setTestResult] = useState<null | { ok: boolean; message: string }>(null);
    const [webhookSetup, setWebhookSetup] = useState<'now' | 'later'>('later');
    const { addToast } = useToast();

    const { data, setData, post, processing, errors } = useForm({
        name: '',
        waba_id: '',
        phone_number_id: '',
        business_phone: '',
        access_token: '',
        throughput_cap_per_minute: 120,
        quiet_hours_start: '',
        quiet_hours_end: '',
        quiet_hours_timezone: 'UTC'});

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route('app.whatsapp.connections.store', {}));
    };

    const testConnection = async () => {
        setTesting(true);
        setTestResult(null);
        try {
            const response = await axios.post(
                route('app.whatsapp.connections.test', {}) as string,
                {
                    phone_number_id: data.phone_number_id,
                    access_token: data.access_token,
                    waba_id: data.waba_id || null}
            );

            const payload = response.data;
            const display = payload.display_phone_number || payload.verified_name || 'Connection looks valid';
            setData('business_phone', payload.display_phone_number || data.business_phone);
            setTestResult({
                ok: true,
                message: `Success: ${display}`});
            addToast({ title: 'Connection verified', variant: 'success' });
        } catch (error: any) {
            const message = error?.response?.data?.error || 'Unable to verify connection';
            setTestResult({
                ok: false,
                message});
            addToast({ title: 'Connection test failed', variant: 'error' });
        } finally {
            setTesting(false);
        }
    };

    const embeddedEnabled = Boolean(embeddedSignup?.enabled && embeddedSignup?.appId && embeddedSignup?.configId);
    const embeddedForm = useForm({
        name: '',
        waba_id: '',
        phone_number_id: '',
        business_phone: '',
        access_token: '',
        code: '',
        pin: '',
        redirect_uri: ''});

    useEffect(() => {
        if (!embeddedEnabled) {
            return;
        }

        const initSdk = () => {
            if (!window.FB) {
                return;
            }

            window.FB.init({
                appId: embeddedSignup.appId,
                cookie: true,
                xfbml: true,
                version: embeddedSignup.apiVersion || 'v21.0'});
            setEmbeddedReady(true);
        };

        if (window.FB) {
            initSdk();
            return;
        }

        window.fbAsyncInit = initSdk;
        const scriptId = 'facebook-jssdk';
        if (!document.getElementById(scriptId)) {
            const script = document.createElement('script');
            script.id = scriptId;
            script.src = 'https://connect.facebook.net/en_US/sdk.js';
            document.body.appendChild(script);
        }
    }, [embeddedEnabled, embeddedSignup?.appId, embeddedSignup?.apiVersion]);

    useEffect(() => {
        if (!embeddedEnabled) {
            return;
        }

        const handler = (event: MessageEvent) => {
            if (!event.origin.includes('facebook.com')) {
                return;
            }

            let payload: any = event.data;
            if (typeof payload === 'string') {
                try {
                    payload = JSON.parse(payload);
                } catch {
                    return;
                }
            }

            const action = payload?.event || payload?.type || payload?.action;
            const data = payload?.data || payload?.payload || payload;

            if (action === 'FINISH' || action === 'COMPLETE' || data?.waba_id || data?.phone_number_id) {
                if (data?.waba_id) {
                    embeddedForm.setData('waba_id', data.waba_id);
                }
                if (data?.phone_number_id) {
                    embeddedForm.setData('phone_number_id', data.phone_number_id);
                }
                if (data?.business_phone || data?.display_phone_number) {
                    embeddedForm.setData('business_phone', data.business_phone || data.display_phone_number);
                }

                setEmbeddedStatus('Embedded signup finished. Ready to create connection.');
            }
        };

        window.addEventListener('message', handler);
        return () => window.removeEventListener('message', handler);
    }, [embeddedEnabled]);

    const startEmbeddedSignup = () => {
        if (!embeddedEnabled || !window.FB) {
            return;
        }

        setEmbeddedStatus('Starting Meta Embedded Signup...');
        embeddedForm.setData('redirect_uri', window.location.href);

        window.FB.login(
            (response: any) => {
                if (response?.authResponse) {
                    if (response.authResponse.code) {
                        embeddedForm.setData('code', response.authResponse.code);
                    }
                    if (response.authResponse.accessToken) {
                        embeddedForm.setData('access_token', response.authResponse.accessToken);
                    }
                    setEmbeddedStatus('Authorization complete. Finish setup to create the connection.');
                } else {
                    setEmbeddedStatus('Login was cancelled or did not fully authorize.');
                }
            },
            {
                config_id: embeddedSignup.configId,
                response_type: 'code',
                override_default_response_type: true,
                scope: 'whatsapp_business_management,whatsapp_business_messaging,business_management'}
        );
    };

    const submitEmbedded: FormEventHandler = (e) => {
        e.preventDefault();
        embeddedForm.post(route('app.whatsapp.connections.store-embedded', {}));
    };

    return (
        <AppShell>
            <Head title="Create WhatsApp Connection" />
            <div className="space-y-8">
                <div>
                    <Link
                        href={route('app.whatsapp.connections.index', {})}
                        className="inline-flex items-center gap-2 text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors mb-4"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        Back to Connections
                    </Link>
                    <div>
                        <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-gray-100 dark:to-gray-300 bg-clip-text text-transparent">
                            Create WhatsApp Connection
                        </h1>
                        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                            Connect your WhatsApp Business Account to start messaging
                        </p>
                    </div>
                </div>

                {embeddedEnabled ? (
                    <Card className="border-0 shadow-xl">
                        <CardHeader className="bg-gradient-to-r from-emerald-50 to-emerald-100 dark:from-emerald-900/20 dark:to-emerald-800/20">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-emerald-600 rounded-xl">
                                        <LinkIcon className="h-5 w-5 text-white" />
                                    </div>
                                    <div>
                                        <CardTitle className="text-xl font-bold">Embedded Signup (Recommended)</CardTitle>
                                        <CardDescription>Connect directly via Meta for a verified, production-ready setup</CardDescription>
                                    </div>
                                </div>
                                <Link href={route('app.whatsapp.connections.wizard', {})}>
                                    <Button variant="secondary" size="sm" className="rounded-xl">
                                        <Sparkles className="h-4 w-4 mr-2" />
                                        Use Wizard
                                    </Button>
                                </Link>
                            </div>
                        </CardHeader>
                        <CardContent className="p-6 space-y-6">
                            <div className="flex flex-wrap items-center gap-3">
                                <Button
                                    type="button"
                                    onClick={startEmbeddedSignup}
                                    disabled={!embeddedReady}
                                    className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl"
                                >
                                    Connect with Meta
                                </Button>
                                {!embeddedReady && (
                                    <span className="text-xs text-gray-500 dark:text-gray-400">
                                        Loading Meta SDK...
                                    </span>
                                )}
                            </div>

                            {embeddedStatus && (
                                <div className="flex items-start gap-2 p-3 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg border border-emerald-200 dark:border-emerald-800">
                                    <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400 mt-0.5" />
                                    <p className="text-xs text-emerald-700 dark:text-emerald-300">{embeddedStatus}</p>
                                </div>
                            )}

                            <form onSubmit={submitEmbedded} className="space-y-4">
                                <div>
                                    <InputLabel htmlFor="embedded_name" value="Connection Name (Optional)" className="text-sm font-semibold mb-2" />
                                    <TextInput
                                        id="embedded_name"
                                        type="text"
                                        value={embeddedForm.data.name}
                                        className="mt-1 block w-full rounded-xl"
                                        onChange={(e) => embeddedForm.setData('name', e.target.value)}
                                        placeholder="My Meta WhatsApp"
                                    />
                                </div>

                                <div className="grid md:grid-cols-2 gap-4">
                                    <div>
                                        <InputLabel htmlFor="embedded_waba" value="WABA ID" className="text-sm font-semibold mb-2" />
                                        <TextInput
                                            id="embedded_waba"
                                            type="text"
                                            value={embeddedForm.data.waba_id}
                                            className="mt-1 block w-full rounded-xl font-mono"
                                            onChange={(e) => embeddedForm.setData('waba_id', e.target.value)}
                                            placeholder="Auto-filled after signup"
                                        />
                                    </div>
                                    <div>
                                        <InputLabel htmlFor="embedded_phone_id" value="Phone Number ID" className="text-sm font-semibold mb-2" />
                                        <TextInput
                                            id="embedded_phone_id"
                                            type="text"
                                            value={embeddedForm.data.phone_number_id}
                                            className="mt-1 block w-full rounded-xl font-mono"
                                            onChange={(e) => embeddedForm.setData('phone_number_id', e.target.value)}
                                            placeholder="Auto-filled after signup"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <InputLabel htmlFor="embedded_business_phone" value="Business Phone (Optional)" className="text-sm font-semibold mb-2" />
                                    <TextInput
                                        id="embedded_business_phone"
                                        type="text"
                                        value={embeddedForm.data.business_phone}
                                        className="mt-1 block w-full rounded-xl"
                                        onChange={(e) => embeddedForm.setData('business_phone', e.target.value)}
                                        placeholder="+1234567890"
                                    />
                                </div>

                                <div>
                                    <InputLabel htmlFor="embedded_pin" value="Registration PIN (Optional)" className="text-sm font-semibold mb-2" />
                                    <TextInput
                                        id="embedded_pin"
                                        type="text"
                                        value={embeddedForm.data.pin}
                                        className="mt-1 block w-full rounded-xl font-mono"
                                        onChange={(e) => embeddedForm.setData('pin', e.target.value)}
                                        placeholder="6-digit PIN"
                                        maxLength={6}
                                    />
                                    <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                                        Provide PIN to register the phone number immediately after signup.
                                    </p>
                                </div>

                                <InputError message={(embeddedForm.errors as any)?.embedded} className="mt-2" />

                                <div className="flex items-center justify-end gap-4 pt-2">
                                    <Button
                                        type="submit"
                                        disabled={embeddedForm.processing}
                                        className="bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 shadow-lg shadow-emerald-500/40 rounded-xl"
                                    >
                                        {embeddedForm.processing ? 'Connecting...' : 'Create Connection'}
                                    </Button>
                                </div>
                            </form>
                        </CardContent>
                    </Card>
                ) : (
                    <Card className="border-0 shadow-xl">
                        <CardHeader className="bg-gradient-to-r from-amber-50 to-amber-100 dark:from-amber-900/20 dark:to-amber-800/20">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-amber-500 rounded-xl">
                                    <Info className="h-5 w-5 text-white" />
                                </div>
                                <div>
                                    <CardTitle className="text-xl font-bold">Embedded Signup</CardTitle>
                                    <CardDescription>
                                        {embeddedSignup?.enabled === false
                                            ? 'Disabled by your platform administrator'
                                            : 'Not configured by your platform administrator'}
                                    </CardDescription>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="p-6">
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                {embeddedSignup?.enabled === false
                                    ? 'Embedded Signup is currently disabled. Please contact support or use the manual setup below.'
                                    : 'Embedded Signup is not fully configured yet. Please contact support or use the manual setup below.'}
                            </p>
                            <div className="mt-4">
                                <Link
                                    href={route('app.support.hub', {})}
                                    className="inline-flex items-center text-sm font-semibold text-amber-700 hover:text-amber-800 dark:text-amber-300 dark:hover:text-amber-200"
                                >
                                    Contact support
                                </Link>
                            </div>
                        </CardContent>
                    </Card>
                )}

                <Card className="border-0 shadow-xl">
                    <CardHeader className="bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-blue-500 rounded-xl">
                                <LinkIcon className="h-5 w-5 text-white" />
                            </div>
                            <div>
                                <CardTitle className="text-xl font-bold">Connection Details</CardTitle>
                                <CardDescription>Enter only the required Meta details</CardDescription>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="p-6">
                        <form onSubmit={submit} className="space-y-6">
                            <div>
                                <InputLabel htmlFor="phone_number_id" value="Phone Number ID *" className="text-sm font-semibold mb-2" />
                                <TextInput
                                    id="phone_number_id"
                                    type="text"
                                    value={data.phone_number_id}
                                    className="mt-1 block w-full rounded-xl font-mono"
                                    onChange={(e) => setData('phone_number_id', e.target.value)}
                                    placeholder="123456789012345"
                                    required
                                    autoFocus
                                />
                                <InputError message={errors.phone_number_id} className="mt-2" />
                                <div className="mt-2 flex items-start gap-2 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                                    <Info className="h-4 w-4 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                                    <p className="text-xs text-blue-700 dark:text-blue-300">
                                        Found in Meta Business Manager → WhatsApp → API Setup
                                    </p>
                                </div>
                            </div>

                            <div>
                                <InputLabel htmlFor="waba_id" value="WhatsApp Business Account ID (Optional)" className="text-sm font-semibold mb-2" />
                                <TextInput
                                    id="waba_id"
                                    type="text"
                                    value={data.waba_id}
                                    className="mt-1 block w-full rounded-xl font-mono"
                                    onChange={(e) => setData('waba_id', e.target.value)}
                                    placeholder="123456789012345"
                                />
                                <InputError message={errors.waba_id} className="mt-2" />
                            </div>

                            <div>
                                <div className="flex items-center justify-between mb-2">
                                    <InputLabel htmlFor="access_token" value="Access Token *" className="text-sm font-semibold" />
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
                                    placeholder="Enter your permanent access token"
                                    required
                                />
                                <InputError message={errors.access_token} className="mt-2" />
                                <div className="mt-2 flex items-start gap-2 p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-200 dark:border-amber-800">
                                    <Info className="h-4 w-4 text-amber-600 dark:text-amber-400 mt-0.5 flex-shrink-0" />
                                    <p className="text-xs text-amber-700 dark:text-amber-300">
                                        Permanent token from Meta Business Manager. Keep this secure.
                                    </p>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <InputLabel htmlFor="throughput_cap_per_minute" value="Campaign Throughput Cap / min" className="text-sm font-semibold mb-2" />
                                    <TextInput
                                        id="throughput_cap_per_minute"
                                        type="number"
                                        min={1}
                                        max={1000}
                                        value={data.throughput_cap_per_minute}
                                        className="mt-1 block w-full rounded-xl"
                                        onChange={(e) => setData('throughput_cap_per_minute', Number(e.target.value) || 120)}
                                    />
                                    <InputError message={errors.throughput_cap_per_minute} className="mt-2" />
                                </div>
                                <div>
                                    <InputLabel htmlFor="quiet_hours_timezone" value="Quiet Hours Timezone" className="text-sm font-semibold mb-2" />
                                    <TextInput
                                        id="quiet_hours_timezone"
                                        type="text"
                                        value={data.quiet_hours_timezone}
                                        className="mt-1 block w-full rounded-xl"
                                        onChange={(e) => setData('quiet_hours_timezone', e.target.value)}
                                        placeholder="Asia/Kolkata"
                                    />
                                    <InputError message={errors.quiet_hours_timezone} className="mt-2" />
                                </div>
                                <div>
                                    <InputLabel htmlFor="quiet_hours_start" value="Quiet Hours Start (HH:MM)" className="text-sm font-semibold mb-2" />
                                    <TextInput
                                        id="quiet_hours_start"
                                        type="time"
                                        value={data.quiet_hours_start}
                                        className="mt-1 block w-full rounded-xl"
                                        onChange={(e) => setData('quiet_hours_start', e.target.value)}
                                    />
                                    <InputError message={errors.quiet_hours_start} className="mt-2" />
                                </div>
                                <div>
                                    <InputLabel htmlFor="quiet_hours_end" value="Quiet Hours End (HH:MM)" className="text-sm font-semibold mb-2" />
                                    <TextInput
                                        id="quiet_hours_end"
                                        type="time"
                                        value={data.quiet_hours_end}
                                        className="mt-1 block w-full rounded-xl"
                                        onChange={(e) => setData('quiet_hours_end', e.target.value)}
                                    />
                                    <InputError message={errors.quiet_hours_end} className="mt-2" />
                                </div>
                            </div>

                            <div className="flex flex-wrap items-center gap-4 pt-2">
                                <Button
                                    type="button"
                                    variant="secondary"
                                    className="rounded-xl"
                                    onClick={testConnection}
                                    disabled={testing || !data.phone_number_id || !data.access_token}
                                >
                                    {testing ? 'Testing...' : 'Test Connection'}
                                </Button>
                                {testResult && (
                                    <span className={testResult.ok ? 'text-xs text-green-600' : 'text-xs text-red-600'}>
                                        {testResult.message}
                                    </span>
                                )}
                            </div>

                            <div className="pt-4 border-t border-gray-200 dark:border-gray-700 space-y-3">
                                <InputLabel value="Webhook Setup" className="text-sm font-semibold" />
                                <div className="flex flex-wrap gap-4">
                                    <label className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                                        <input
                                            type="radio"
                                            name="webhook_setup"
                                            value="now"
                                            checked={webhookSetup === 'now'}
                                            onChange={() => setWebhookSetup('now')}
                                        />
                                        Set up webhook now
                                    </label>
                                    <label className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                                        <input
                                            type="radio"
                                            name="webhook_setup"
                                            value="later"
                                            checked={webhookSetup === 'later'}
                                            onChange={() => setWebhookSetup('later')}
                                        />
                                        I’ll do it later
                                    </label>
                                </div>
                                {webhookSetup === 'now' ? (
                                    <p className="text-xs text-gray-500 dark:text-gray-400">
                                        After creation, we’ll show the webhook URL and verify token.
                                    </p>
                                ) : (
                                    <p className="text-xs text-gray-500 dark:text-gray-400">
                                        You can set it up anytime from the connection page.
                                    </p>
                                )}
                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                    Need assistance? Contact support from the Help menu.
                                </p>
                            </div>

                            <div className="pt-2">
                                <button
                                    type="button"
                                    className="inline-flex items-center gap-2 text-xs font-medium text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300"
                                    onClick={() => addToast({ title: 'Live chat coming soon', variant: 'info' })}
                                >
                                    Open live chat (coming soon)
                                </button>
                            </div>

                            <div className="flex items-center justify-end gap-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                                <Link href={route('app.whatsapp.connections.index', { })}>
                                    <Button type="button" variant="secondary" className="rounded-xl">
                                        Cancel
                                    </Button>
                                </Link>
                                <Button 
                                    type="submit" 
                                    disabled={processing}
                                    className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 shadow-lg shadow-blue-500/50 rounded-xl"
                                >
                                    {processing ? 'Creating...' : (
                                        <>
                                            <Sparkles className="h-4 w-4 mr-2" />
                                            Create Connection
                                        </>
                                    )}
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </AppShell>
    );
}
