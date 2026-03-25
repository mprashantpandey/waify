import { useForm } from '@inertiajs/react';
import { FormEventHandler, useEffect, useState } from 'react';
import AppShell from '@/Layouts/AppShell';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/Components/UI/Card';
import Button from '@/Components/UI/Button';
import TextInput from '@/Components/TextInput';
import InputLabel from '@/Components/InputLabel';
import InputError from '@/Components/InputError';
import { ArrowLeft, Link as LinkIcon, Sparkles, Info, CheckCircle2 } from 'lucide-react';
import { Link, Head } from '@inertiajs/react';

declare global {
    interface Window {
        FB?: any;
        fbAsyncInit?: () => void;
    }
}

export default function ConnectionsCreate({
    account,
    embeddedSignup,
    defaultApiVersion }: {
        account: any;
        embeddedSignup: { enabled?: boolean; appId?: string; configId?: string; apiVersion?: string; oauthRedirectUri?: string | null };
        defaultApiVersion: string;
    }) {
    const [embeddedReady, setEmbeddedReady] = useState(false);
    const [embeddedStatus, setEmbeddedStatus] = useState<string | null>(null);
    const [embeddedAutoSubmitRequested, setEmbeddedAutoSubmitRequested] = useState(false);
    const [embeddedAutoSubmitAttempted, setEmbeddedAutoSubmitAttempted] = useState(false);

    const embeddedEnabled = Boolean(embeddedSignup?.enabled && embeddedSignup?.appId && embeddedSignup?.configId);
    const resolveOAuthRedirectUri = () => {
        const raw = embeddedSignup?.oauthRedirectUri || route('app.whatsapp.connections.create', {});
        try {
            return new URL(raw, window.location.origin).toString();
        } catch {
            return `${window.location.origin}/app/connections/create`;
        }
    };
    const embeddedForm = useForm({
        name: '',
        waba_id: '',
        phone_number_id: '',
        business_phone: '',
        access_token: '',
        code: '',
        pin: '',
        redirect_uri: ''
    });
    const hasEmbeddedAuthData = Boolean(embeddedForm.data.code || embeddedForm.data.access_token);
    const hasEmbeddedResolvedIds = Boolean(embeddedForm.data.waba_id && embeddedForm.data.phone_number_id);

    useEffect(() => {
        if (!embeddedEnabled || !embeddedAutoSubmitRequested || embeddedAutoSubmitAttempted || !hasEmbeddedAuthData || embeddedForm.processing) {
            return;
        }

        setEmbeddedAutoSubmitAttempted(true);
        setEmbeddedStatus('Finalizing connection setup with Meta...');

        embeddedForm.post(route('app.whatsapp.connections.store-embedded', {}), {
            preserveScroll: true,
            onError: () => {
                setEmbeddedStatus('Auto-setup needs your review. Fix the error below and click Create Connection.');
            },
        });
    }, [
        embeddedEnabled,
        embeddedAutoSubmitRequested,
        embeddedAutoSubmitAttempted,
        hasEmbeddedAuthData,
        embeddedForm,
        embeddedForm.processing,
    ]);

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
                version: embeddedSignup.apiVersion || 'v21.0'
            });
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

        const allowedOrigins = [
            'facebook.com',
            'web.facebook.com',
            'business.facebook.com',
        ];

        const findNestedValue = (input: any, keys: string[], depth = 0): any => {
            if (!input || depth > 4) {
                return undefined;
            }

            if (typeof input !== 'object') {
                return undefined;
            }

            for (const key of keys) {
                if (input[key] != null && input[key] !== '') {
                    return input[key];
                }
            }

            for (const value of Object.values(input)) {
                const nested = findNestedValue(value, keys, depth + 1);
                if (nested != null && nested !== '') {
                    return nested;
                }
            }

            return undefined;
        };

        const handler = (event: MessageEvent) => {
            if (!allowedOrigins.some((origin) => event.origin.includes(origin))) {
                return;
            }

            let payload: any = event.data;
            if (typeof payload === 'string') {
                try {
                    payload = JSON.parse(payload);
                } catch {
                    if (payload.includes('waba_id') || payload.includes('phone_number_id')) {
                        try {
                            const match = payload.match(/\{.*\}/);
                            if (match) {
                                payload = JSON.parse(match[0]);
                            } else {
                                return;
                            }
                        } catch {
                            return;
                        }
                    } else {
                        return;
                    }
                }
            }

            const action = payload?.event || payload?.type || payload?.action || payload?.status;
            const data = payload?.data || payload?.payload || payload?.result || payload;

            const extracted = {
                waba_id: findNestedValue(data, ['waba_id', 'wabaId', 'business_account_id', 'businessAccountId'])
                    ?? findNestedValue(payload, ['waba_id', 'wabaId', 'business_account_id', 'businessAccountId']),
                phone_number_id: findNestedValue(data, ['phone_number_id', 'phoneNumberId'])
                    ?? findNestedValue(payload, ['phone_number_id', 'phoneNumberId']),
                business_phone: findNestedValue(data, ['business_phone', 'display_phone_number', 'businessPhone', 'displayPhoneNumber'])
                    ?? findNestedValue(payload, ['business_phone', 'display_phone_number', 'businessPhone', 'displayPhoneNumber']),
                code: findNestedValue(data, ['code']) ?? findNestedValue(payload, ['code']),
                access_token: findNestedValue(data, ['accessToken', 'access_token']) ?? findNestedValue(payload, ['accessToken', 'access_token']),
            };

            if (extracted.code) {
                embeddedForm.setData('code', String(extracted.code));
            }
            if (extracted.access_token) {
                embeddedForm.setData('access_token', String(extracted.access_token));
            }
            if (extracted.waba_id) {
                embeddedForm.setData('waba_id', String(extracted.waba_id));
            }
            if (extracted.phone_number_id) {
                embeddedForm.setData('phone_number_id', String(extracted.phone_number_id));
            }
            if (extracted.business_phone) {
                embeddedForm.setData('business_phone', String(extracted.business_phone));
            }

            const hasSignupData = Boolean(extracted.waba_id || extracted.phone_number_id);
            const hasAuthData = Boolean(extracted.code || extracted.access_token);

            if (
                action === 'FINISH' ||
                action === 'COMPLETE' ||
                action === 'SUCCESS' ||
                hasSignupData ||
                hasAuthData
            ) {
                setEmbeddedStatus(
                    hasSignupData
                        ? 'Embedded signup data received from Meta. Review and create connection.'
                        : hasAuthData
                            ? 'Authorization complete. Meta IDs not returned in browser event; you can continue and we will resolve them during setup.'
                            : 'Embedded signup finished. Ready to create connection.'
                );

                if ((action === 'FINISH' || action === 'COMPLETE' || action === 'SUCCESS') && hasAuthData) {
                    setEmbeddedAutoSubmitRequested(true);
                }
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
        setEmbeddedAutoSubmitRequested(false);
        setEmbeddedAutoSubmitAttempted(false);
        const oauthRedirectUri = resolveOAuthRedirectUri();
        // Use a stable canonical redirect URI (no query/hash) to match Meta allowlist exactly.
        embeddedForm.setData('redirect_uri', oauthRedirectUri);

        window.FB.login(
            (response: any) => {
                if (response?.authResponse) {
                    const code = response?.code || response?.authResponse?.code;
                    const accessToken = response?.accessToken || response?.authResponse?.accessToken;
                    if (code && !accessToken) {
                        embeddedForm.setData('code', code);
                    }
                    if (accessToken) {
                        embeddedForm.setData('access_token', accessToken);
                        // Prefer token path to avoid code/redirect mismatch issues in popup flow.
                        embeddedForm.setData('code', '');
                    }
                    setEmbeddedStatus((prev) => {
                        if (prev && (prev.includes('Embedded signup data received') || prev.includes('Meta IDs not returned'))) {
                            return prev;
                        }

                        return 'Authorization complete. Waiting for Meta signup details from browser callback. If IDs are not auto-filled, continue and we will resolve them during setup.';
                    });
                } else {
                    setEmbeddedStatus('Login was cancelled or did not fully authorize.');
                }
            },
            {
                config_id: embeddedSignup.configId,
                override_default_response_type: true,
                response_type: 'code',
                redirect_uri: oauthRedirectUri,
                scope: 'whatsapp_business_management,whatsapp_business_messaging,business_management',
                extras: {
                    feature: 'whatsapp_embedded_signup',
                    sessionInfoVersion: 3,
                },
            }
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

                <Card className="border-0 shadow-sm">
                    <CardContent className="grid gap-4 p-5 md:grid-cols-3">
                        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 dark:border-emerald-900/60 dark:bg-emerald-900/10">
                            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-700 dark:text-emerald-300">Step 1</p>
                            <h3 className="mt-2 font-semibold text-gray-900 dark:text-gray-100">Connect with Meta</h3>
                            <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">Use the direct Meta flow first. It fills most details automatically.</p>
                        </div>
                        <div className="rounded-2xl border border-blue-200 bg-blue-50 p-4 dark:border-blue-900/60 dark:bg-blue-900/10">
                            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-blue-700 dark:text-blue-300">Step 2</p>
                            <h3 className="mt-2 font-semibold text-gray-900 dark:text-gray-100">Review the connection</h3>
                            <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">Confirm the phone number and business account before saving.</p>
                        </div>
                        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 dark:border-amber-900/60 dark:bg-amber-900/10">
                            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-amber-700 dark:text-amber-300">Step 3</p>
                            <h3 className="mt-2 font-semibold text-gray-900 dark:text-gray-100">Test and go live</h3>
                            <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">After saving, test webhook health and send a message to verify the setup.</p>
                        </div>
                    </CardContent>
                </Card>

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

                            {hasEmbeddedAuthData && !hasEmbeddedResolvedIds && (
                                <div className="p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-200 dark:border-amber-800">
                                    <p className="text-xs text-amber-800 dark:text-amber-200">
                                        Meta authorization is complete. If WhatsApp Business Account ID / Phone Number ID stay empty, click <strong>Create Connection</strong> and the server will auto-resolve them using your Meta authorization.
                                    </p>
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
                                        <InputLabel htmlFor="embedded_waba" value="WhatsApp Business Account ID" className="text-sm font-semibold mb-2" />
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
                                        {embeddedForm.processing
                                            ? 'Connecting...'
                                            : (hasEmbeddedAuthData && !hasEmbeddedResolvedIds ? 'Create Connection (Auto-resolve IDs)' : 'Create Connection')}
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
                                    ? 'Embedded Signup is currently disabled. Please contact support to connect your WhatsApp account.'
                                    : 'Embedded Signup is not fully configured yet. Please contact support to complete WhatsApp setup.'}
                            </p>
                            <div className="mt-4">
                                <Link
                                    href={route('contact')}
                                    className="inline-flex items-center text-sm font-semibold text-amber-700 hover:text-amber-800 dark:text-amber-300 dark:hover:text-amber-200"
                                >
                                    Contact us
                                </Link>
                            </div>
                        </CardContent>
                    </Card>
                )}

                <Card className="border-0 shadow-sm">
                    <CardContent className="p-6">
                        <div className="rounded-2xl border border-gray-200 bg-gray-50 p-5 dark:border-gray-800 dark:bg-gray-900/40">
                            <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">Only Meta direct connection is available</p>
                            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                                Manual token-based connection setup has been removed from the user panel. This keeps setup simpler and avoids invalid or partially configured WhatsApp connections.
                            </p>
                            <p className="mt-3 text-xs text-gray-500 dark:text-gray-400">
                                If Meta Embedded Signup is unavailable for your account, contact support and we will help you complete the connection.
                            </p>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </AppShell>
    );
}
