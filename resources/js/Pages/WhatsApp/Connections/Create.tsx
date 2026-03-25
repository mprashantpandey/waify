import { useForm } from '@inertiajs/react';
import { FormEventHandler, useEffect, useState } from 'react';
import AppShell from '@/Layouts/AppShell';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/Components/UI/Card';
import Button from '@/Components/UI/Button';
import TextInput from '@/Components/TextInput';
import InputLabel from '@/Components/InputLabel';
import InputError from '@/Components/InputError';
import { ArrowLeft, Link as LinkIcon, Info, CheckCircle2 } from 'lucide-react';
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
        session_waba_id: '',
        session_phone_number_id: '',
        business_phone: '',
        access_token: '',
        code: '',
        pin: '',
        redirect_uri: ''
    });
    const hasEmbeddedAuthData = Boolean(embeddedForm.data.code || embeddedForm.data.access_token);
    const hasEmbeddedResolvedIds = Boolean(embeddedForm.data.waba_id && embeddedForm.data.phone_number_id);

    const applyEmbeddedCode = (code: string) => {
        embeddedForm.setData('code', code);
        embeddedForm.setData('redirect_uri', resolveOAuthRedirectUri());
        setEmbeddedStatus('Authorization complete. Finishing Meta setup...');
        setEmbeddedAutoSubmitRequested(true);
    };

    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const code = params.get('code');
        if (!code) {
            return;
        }

        if (window.opener && window.opener !== window) {
            window.opener.postMessage(
                {
                    type: 'zyptos_whatsapp_embedded_signup_code',
                    code,
                },
                window.location.origin,
            );
            window.close();
            return;
        }

        applyEmbeddedCode(code);
    }, []);

    useEffect(() => {
        const handler = (event: MessageEvent) => {
            if (event.origin !== window.location.origin) {
                return;
            }

            if (event.data?.type !== 'zyptos_whatsapp_embedded_signup_code' || !event.data?.code) {
                return;
            }

            applyEmbeddedCode(String(event.data.code));
        };

        window.addEventListener('message', handler);

        return () => {
            window.removeEventListener('message', handler);
        };
    }, []);

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
                autoLogAppEvents: true,
                cookie: true,
                xfbml: true,
                version: 'v25.0'
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
            const isEmbeddedSignupEvent = payload?.type === 'WA_EMBEDDED_SIGNUP';
            const currentStep = String(
                findNestedValue(data, ['current_step', 'currentStep', 'screen'])
                    ?? findNestedValue(payload, ['current_step', 'currentStep', 'screen'])
                    ?? ''
            ) || null;

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
                embeddedForm.setData('session_waba_id', String(extracted.waba_id));
            }
            if (extracted.phone_number_id) {
                embeddedForm.setData('phone_number_id', String(extracted.phone_number_id));
                embeddedForm.setData('session_phone_number_id', String(extracted.phone_number_id));
            }
            if (extracted.business_phone) {
                embeddedForm.setData('business_phone', String(extracted.business_phone));
            }

            const hasSignupData = Boolean(extracted.waba_id || extracted.phone_number_id);
            const hasAuthData = Boolean(extracted.code || extracted.access_token);

            if (isEmbeddedSignupEvent || action === 'FINISH' || action === 'FINISH_ONLY_WABA' || action === 'CANCEL') {
                void fetch(route('app.whatsapp.connections.embedded-telemetry', {}), {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-Requested-With': 'XMLHttpRequest',
                        'X-CSRF-TOKEN': (document.querySelector('meta[name="csrf-token"]') as HTMLMetaElement | null)?.content || '',
                    },
                    body: JSON.stringify({
                        step: 'session_event',
                        status: action === 'CANCEL' ? 'cancelled' : hasSignupData || hasAuthData ? 'success' : 'progress',
                        message: typeof action === 'string' ? `Meta session event: ${action}` : 'Meta session event received',
                        context: {
                            event: action,
                            current_step: currentStep,
                            waba_id: extracted.waba_id || null,
                            phone_number_id: extracted.phone_number_id || null,
                            business_phone: extracted.business_phone || null,
                            has_code: Boolean(extracted.code),
                            has_access_token: Boolean(extracted.access_token),
                        },
                    }),
                    credentials: 'same-origin',
                }).catch(() => {
                    // Silent: telemetry must never block onboarding.
                });
            }

            if (
                action === 'FINISH' ||
                action === 'FINISH_ONLY_WABA' ||
                action === 'COMPLETE' ||
                action === 'SUCCESS' ||
                hasSignupData ||
                hasAuthData ||
                isEmbeddedSignupEvent
            ) {
                setEmbeddedStatus(
                    hasSignupData
                        ? 'Embedded signup data received from Meta. Review and create connection.'
                        : hasAuthData
                            ? 'Authorization complete. Meta IDs not returned in browser event; you can continue and we will resolve them during setup.'
                            : 'Embedded signup finished. Ready to create connection.'
                );

                if ((action === 'FINISH' || action === 'FINISH_ONLY_WABA' || action === 'COMPLETE' || action === 'SUCCESS') && hasAuthData) {
                    setEmbeddedAutoSubmitRequested(true);
                }
            }

            if (action === 'CANCEL') {
                setEmbeddedStatus('Meta signup was cancelled before completion.');
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
        embeddedForm.setData('redirect_uri', oauthRedirectUri);

        window.FB.login(
            (response: any) => {
                if (!response?.authResponse) {
                    setEmbeddedStatus('Meta signup was cancelled or not completed.');
                    return;
                }

                const code = response?.authResponse?.code;
                const accessToken = response?.authResponse?.accessToken;

                if (code) {
                    applyEmbeddedCode(String(code));
                    return;
                }

                if (accessToken) {
                    embeddedForm.setData('access_token', String(accessToken));
                    embeddedForm.setData('redirect_uri', oauthRedirectUri);
                    setEmbeddedStatus('Authorization complete. Finishing Meta setup...');
                    setEmbeddedAutoSubmitRequested(true);
                    return;
                }

                setEmbeddedStatus('Meta signup finished but did not return an authorization code.');
            },
            {
                config_id: embeddedSignup.configId,
                override_default_response_type: true,
                response_type: 'code',
                extras: {
                    feature: 'whatsapp_embedded_signup',
                    sessionInfoVersion: 3,
                    version: '4',
                },
            }
        );

        setEmbeddedStatus('Complete the Meta setup in the popup. We will continue here automatically.');
    };

    const submitEmbedded: FormEventHandler = (e) => {
        e.preventDefault();
        embeddedForm.post(route('app.whatsapp.connections.store-embedded', {}));
    };

    return (
        <AppShell>
            <Head title="Create WhatsApp Connection" />
            <div className="space-y-6">
                <div>
                    <Link
                        href={route('app.whatsapp.connections.index', {})}
                        className="mb-4 inline-flex items-center gap-2 text-sm font-medium text-gray-600 transition-colors hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        Back to Connections
                    </Link>
                    <h1 className="text-3xl font-semibold text-gray-900 dark:text-gray-100">Connect WhatsApp</h1>
                    <p className="mt-2 max-w-2xl text-sm text-gray-600 dark:text-gray-400">
                        Use Meta signup to connect your WhatsApp Business Account. Most details are filled automatically.
                    </p>
                </div>

                <Card className="border border-gray-200 shadow-sm dark:border-gray-800">
                    <CardContent className="p-5">
                        <div className="grid gap-4 md:grid-cols-3">
                            <div>
                                <p className="text-sm font-medium text-gray-900 dark:text-gray-100">1. Connect with Meta</p>
                                <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">Start the official Meta flow.</p>
                            </div>
                            <div>
                                <p className="text-sm font-medium text-gray-900 dark:text-gray-100">2. Check the details</p>
                                <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">Confirm the business account and phone number.</p>
                            </div>
                            <div>
                                <p className="text-sm font-medium text-gray-900 dark:text-gray-100">3. Save and test</p>
                                <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">Create the connection and send one test message.</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {embeddedEnabled ? (
                    <Card className="border border-gray-200 shadow-sm dark:border-gray-800">
                        <CardHeader className="pb-4">
                            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                                <div className="flex items-center gap-3">
                                    <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-200">
                                        <LinkIcon className="h-5 w-5" />
                                    </span>
                                    <div>
                                        <CardTitle className="text-lg font-semibold">Meta signup</CardTitle>
                                        <CardDescription>Use the official setup flow. This is the easiest and safest option.</CardDescription>
                                    </div>
                                </div>
                                <Link href={route('app.whatsapp.connections.wizard', {})}>
                                    <Button variant="secondary" size="sm">Open guided setup</Button>
                                </Link>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-5 p-6">
                            <div className="flex flex-wrap items-center gap-3">
                                <Button
                                    type="button"
                                    onClick={startEmbeddedSignup}
                                    disabled={!embeddedReady}
                                    className="rounded-xl"
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
                                <div className="flex items-start gap-2 rounded-lg border border-gray-200 bg-gray-50 p-3 dark:border-gray-800 dark:bg-gray-900/50">
                                    <CheckCircle2 className="mt-0.5 h-4 w-4 text-gray-600 dark:text-gray-300" />
                                    <p className="text-sm text-gray-700 dark:text-gray-300">{embeddedStatus}</p>
                                </div>
                            )}

                            {hasEmbeddedAuthData && !hasEmbeddedResolvedIds && (
                                <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 dark:border-amber-800 dark:bg-amber-900/20">
                                    <p className="text-sm text-amber-800 dark:text-amber-200">
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
                                            className="mt-1 block w-full rounded-xl font-mono text-sm"
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
                                            className="mt-1 block w-full rounded-xl font-mono text-sm"
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
                                        className="mt-1 block w-full rounded-xl font-mono text-sm"
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
                                        className="rounded-xl"
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
                    <Card className="border border-gray-200 shadow-sm dark:border-gray-800">
                        <CardHeader>
                            <div className="flex items-center gap-3">
                                <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300">
                                    <Info className="h-5 w-5" />
                                </span>
                                <div>
                                    <CardTitle className="text-lg font-semibold">Meta signup unavailable</CardTitle>
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

                <Card className="border border-gray-200 shadow-sm dark:border-gray-800">
                    <CardContent className="p-6">
                        <div className="rounded-xl border border-gray-200 bg-gray-50 p-5 dark:border-gray-800 dark:bg-gray-900/40">
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
