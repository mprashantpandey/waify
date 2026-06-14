import { Head, router, useForm } from '@inertiajs/react';
import { FormEventHandler, ReactNode, useEffect, useMemo, useRef, useState } from 'react';
import AppShell from '@/Layouts/AppShell';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/Components/UI/Card';
import { Badge } from '@/Components/UI/Badge';
import Button from '@/Components/UI/Button';
import InputError from '@/Components/InputError';
import { Modal } from '@/Components/UI/Elements';
import {
    AlertTriangle,
    BadgeCheck,
    CheckCircle2,
    Building2,
    Globe2,
    Image,
    KeyRound,
    Link as LinkIcon,
    Loader2,
    Mail,
    MapPin,
    Medal,
    MessageCircle,
    Phone,
    QrCode,
    RefreshCw,
    ShieldCheck,
    Smartphone,
    Sparkles,
    Trash2,
    UserCheck,
    Zap,
} from 'lucide-react';
import { useToast } from '@/hooks/useToast';

declare global {
    interface Window {
        FB?: any;
        fbAsyncInit?: () => void;
    }
}

interface Connection {
    id: number;
    slug?: string;
    name: string;
    waba_id: string | null;
    meta_business_id?: string | null;
    meta_waba_name?: string | null;
    meta_account_review_status?: string | null;
    meta_business_verification_status?: string | null;
    meta_timezone_id?: string | null;
    meta_template_namespace?: string | null;
    meta_subscribed_apps?: any[] | null;
    phone_number_id: string;
    business_phone: string | null;
    meta_verified_name?: string | null;
    phone_number_status?: string | null;
    quality_rating?: string | null;
    code_verification_status?: string | null;
    business_category?: string | null;
    business_about?: string | null;
    business_address?: string | null;
    business_description?: string | null;
    business_email?: string | null;
    business_websites?: string[] | null;
    business_vertical?: string | null;
    profile_picture_url?: string | null;
    profile_picture_handle?: string | null;
    profile_synced_at?: string | null;
    profile_sync_error?: string | null;
    setup_method?: string | null;
    connection_mode?: 'cloud_api' | 'coexistence' | string | null;
    qr_status?: string | null;
    qr_last_seen_at?: string | null;
    qr_last_error?: string | null;
    qr_safety_settings?: Record<string, any> | null;
    coexistence_status?: string | null;
    coexistence_metadata?: Record<string, any> | null;
    coexistence_last_checked_at?: string | null;
    coexistence_last_error?: string | null;
    webhook_url?: string | null;
    webhook_verify_token?: string | null;
    webhook_subscribed?: boolean;
    webhook_last_received_at?: string | null;
    webhook_last_error?: string | null;
    is_active: boolean;
    api_version?: string | null;
    throughput_cap_per_minute?: number | null;
    quiet_hours_start?: string | null;
    quiet_hours_end?: string | null;
    quiet_hours_timezone?: string | null;
    meta_event_logs?: Array<{
        id: number;
        field?: string | null;
        event_type?: string | null;
        status?: string | null;
        message?: string | null;
        received_at?: string | null;
    }>;
}

type EmbeddedSignup = {
    enabled?: boolean;
    appId?: string;
    configId?: string;
    coexistenceEnabled?: boolean;
    coexistenceConfigId?: string;
    apiVersion?: string;
};

type CentralWebhook = {
    url: string;
    verify_token: string;
};

type SetupPath = 'new_cloud_api' | 'migrate_api' | 'coexistence';

export default function ConnectionsIndex({
    connections,
    canCreate,
    embeddedSignup,
    centralWebhook,
    defaultApiVersion,
}: {
    account: any;
    connections: Connection[];
    canCreate: boolean;
    embeddedSignup: EmbeddedSignup;
    centralWebhook: CentralWebhook;
    defaultApiVersion: string;
}) {
    const { addToast } = useToast();
    const activeConnections = connections.filter((item) => item.is_active);
    const connection = activeConnections[0] ?? null;
    const [embeddedReady, setEmbeddedReady] = useState(false);
    const [autoStatus, setAutoStatus] = useState<'idle' | 'loading' | 'authorizing' | 'saving' | 'error'>('idle');
    const [autoMessage, setAutoMessage] = useState('Meta embedded signup is ready to connect your WABA account.');
    const [showAutoDialog, setShowAutoDialog] = useState(false);
    const [showManualDialog, setShowManualDialog] = useState(false);
    const [showWebhookDialog, setShowWebhookDialog] = useState(false);
    const [showQrDialog, setShowQrDialog] = useState(false);
    const [showVerificationDialog, setShowVerificationDialog] = useState(false);
    const [showMetaDetails, setShowMetaDetails] = useState(false);
    const [showDisconnectDialog, setShowDisconnectDialog] = useState(false);
    const [signupMode, setSignupMode] = useState<'cloud_api' | 'coexistence'>('cloud_api');
    const [setupPath, setSetupPath] = useState<SetupPath>('new_cloud_api');
    const [refreshingHealth, setRefreshingHealth] = useState(false);
    const [disconnecting, setDisconnecting] = useState(false);
    const embeddedSessionRef = useRef<Record<string, any>>({});

    const embeddedEnabled = Boolean(embeddedSignup?.enabled && embeddedSignup?.appId && (embeddedSignup?.configId || embeddedSignup?.coexistenceConfigId));
    const connectionKey = connection?.id ?? 'new';

    const profileForm = useForm({
        _method: 'put',
        name: connection?.name ?? '',
        waba_id: connection?.waba_id ?? '',
        phone_number_id: connection?.phone_number_id ?? '',
        business_phone: connection?.business_phone ?? '',
        business_category: connection?.business_category ?? 'Retail',
        business_about: connection?.business_about ?? 'Turn conversations into conversions.',
        business_address: connection?.business_address ?? '',
        business_description: connection?.business_description ?? '',
        business_email: connection?.business_email ?? '',
        business_websites: connection?.business_websites?.length ? connection.business_websites : ['', ''],
        business_vertical: connection?.business_vertical ?? 'RETAIL',
        profile_picture_handle: connection?.profile_picture_handle ?? '',
        profile_picture_file: null as File | null,
        access_token: '',
        api_version: connection?.api_version ?? defaultApiVersion,
        throughput_cap_per_minute: connection?.throughput_cap_per_minute ?? 120,
        quiet_hours_start: connection?.quiet_hours_start ?? '',
        quiet_hours_end: connection?.quiet_hours_end ?? '',
        quiet_hours_timezone: connection?.quiet_hours_timezone ?? 'UTC',
    });

    const manualForm = useForm({
        name: '',
        waba_id: '',
        phone_number_id: '',
        business_phone: '',
        business_category: 'Retail',
        business_about: 'Turn conversations into conversions.',
        business_address: '',
        business_description: '',
        business_email: '',
        business_websites: ['', ''],
        business_vertical: 'RETAIL',
        access_token: '',
        api_version: defaultApiVersion,
        throughput_cap_per_minute: 120,
        quiet_hours_start: '',
        quiet_hours_end: '',
        quiet_hours_timezone: 'UTC',
    });

    const qrForm = useForm({
        name: 'WhatsApp QR (Unofficial)',
        throughput_cap_per_minute: 15,
        quiet_hours_start: '',
        quiet_hours_end: '',
        quiet_hours_timezone: 'Asia/Kolkata',
    });

    const [qrState, setQrState] = useState<{ status?: string; qr?: string | null; phone?: string | null; error?: string | null }>({});

    useEffect(() => {
        if (!connection) {
            profileForm.setData({
                _method: 'put',
                name: '',
                waba_id: '',
                phone_number_id: '',
                business_phone: '',
                business_category: 'Retail',
                business_about: 'Turn conversations into conversions.',
                business_address: '',
                business_description: '',
                business_email: '',
                business_websites: ['', ''],
                business_vertical: 'RETAIL',
                profile_picture_handle: '',
                profile_picture_file: null,
                access_token: '',
                api_version: defaultApiVersion,
                throughput_cap_per_minute: 120,
                quiet_hours_start: '',
                quiet_hours_end: '',
                quiet_hours_timezone: 'UTC',
            });
            return;
        }

        profileForm.setData({
            _method: 'put',
            name: connection.name ?? '',
            waba_id: connection.waba_id ?? '',
            phone_number_id: connection.phone_number_id ?? '',
            business_phone: connection.business_phone ?? '',
            business_category: connection.business_category ?? 'Retail',
            business_about: connection.business_about ?? 'Turn conversations into conversions.',
            business_address: connection.business_address ?? '',
            business_description: connection.business_description ?? '',
            business_email: connection.business_email ?? '',
            business_websites: connection.business_websites?.length ? connection.business_websites : ['', ''],
            business_vertical: connection.business_vertical ?? 'RETAIL',
            profile_picture_handle: connection.profile_picture_handle ?? '',
            profile_picture_file: null,
            access_token: '',
            api_version: connection.api_version ?? defaultApiVersion,
            throughput_cap_per_minute: connection.throughput_cap_per_minute ?? 120,
            quiet_hours_start: connection.quiet_hours_start ?? '',
            quiet_hours_end: connection.quiet_hours_end ?? '',
            quiet_hours_timezone: connection.quiet_hours_timezone ?? 'UTC',
        });
    }, [connectionKey]);

    useEffect(() => {
        if (!embeddedEnabled) {
            return;
        }

        const handleEmbeddedMessage = (event: MessageEvent) => {
            if (typeof event.origin !== 'string' || !event.origin.endsWith('facebook.com')) {
                return;
            }

            try {
                const data = typeof event.data === 'string' ? JSON.parse(event.data) : event.data;
                if (data?.type === 'WA_EMBEDDED_SIGNUP') {
                    embeddedSessionRef.current = data || {};

                    if (data.event === 'FINISH') {
                        setAutoMessage('Meta signup completed. Finishing setup in Zyptos...');
                    } else if (data.event === 'CANCEL') {
                        setAutoStatus('error');
                        setAutoMessage('Meta signup was cancelled before completion.');
                    } else if (data.event === 'ERROR') {
                        setAutoStatus('error');
                        setAutoMessage(data?.data?.error_message || 'Meta embedded signup returned an error.');
                    }
                }
            } catch (error) {
                setAutoStatus('error');
                setAutoMessage('Zyptos could not read the Meta embedded signup callback.');
            }
        };

        window.addEventListener('message', handleEmbeddedMessage);

        const initSdk = () => {
            if (!window.FB) {
                return;
            }

            window.FB.init({
                appId: embeddedSignup.appId,
                cookie: true,
                xfbml: true,
                version: embeddedSignup.apiVersion || defaultApiVersion || 'v25.0',
            });
            setEmbeddedReady(true);
            setAutoStatus('idle');
            setAutoMessage('Meta embedded signup is ready to connect your WABA account.');
        };

        if (window.FB) {
            initSdk();
            return;
        }

        setAutoStatus('loading');
        setAutoMessage('Loading Meta embedded signup...');
        window.fbAsyncInit = initSdk;

        if (!document.getElementById('facebook-jssdk')) {
            const script = document.createElement('script');
            script.id = 'facebook-jssdk';
            script.src = 'https://connect.facebook.net/en_US/sdk.js';
            script.async = true;
            script.defer = true;
            document.body.appendChild(script);
        }

        return () => {
            window.removeEventListener('message', handleEmbeddedMessage);
        };
    }, [connectionKey, embeddedEnabled, embeddedSignup?.appId, embeddedSignup?.apiVersion, defaultApiVersion]);

    useEffect(() => {
        if (connection || typeof window === 'undefined') {
            return;
        }

        const setup = new URLSearchParams(window.location.search).get('setup');
        if (setup === 'embedded') {
            setSetupPath('new_cloud_api');
            setSignupMode('cloud_api');
            setShowAutoDialog(true);
            return;
        }

        if (setup === 'migrate_api') {
            setSetupPath('migrate_api');
            setSignupMode('cloud_api');
            setShowAutoDialog(true);
            return;
        }

        if (setup === 'coexistence') {
            setSetupPath('coexistence');
            setSignupMode('coexistence');
            setShowAutoDialog(true);
            return;
        }

        if (setup === 'manual') {
            setShowManualDialog(true);
            return;
        }

        if (setup === 'qr') {
            setShowQrDialog(true);
        }
    }, [connectionKey, connection]);

    const maskBusinessId = (value?: string | null) => {
        if (!value) return 'Not available';
        if (value.length <= 8) return value;
        return `${value.slice(0, 4)}...${value.slice(-4)}`;
    };

    const automaticDisabled = !canCreate
        || !embeddedEnabled
        || !embeddedReady
        || (signupMode === 'cloud_api' && !embeddedSignup?.configId)
        || (signupMode === 'coexistence' && !embeddedSignup?.coexistenceEnabled)
        || autoStatus === 'authorizing'
        || autoStatus === 'saving';
    const automaticButtonLabel = useMemo(() => {
        if (!embeddedEnabled) return 'Meta setup unavailable';
        if (signupMode === 'cloud_api' && !embeddedSignup?.configId) return 'Embedded config missing';
        if (signupMode === 'coexistence' && !embeddedSignup?.coexistenceEnabled) return 'Embedded config missing';
        if (!embeddedReady || autoStatus === 'loading') return 'Loading Meta...';
        if (autoStatus === 'authorizing') return 'Opening Meta...';
        if (autoStatus === 'saving') return 'Finishing setup...';
        if (signupMode === 'coexistence') return 'Connect with co-existence';
        if (setupPath === 'migrate_api') return 'Start migration';
        return 'Connect automatically';
    }, [embeddedEnabled, embeddedReady, autoStatus, signupMode, setupPath, embeddedSignup?.coexistenceEnabled]);

    const submitEmbedded = (payload: Record<string, string>) => {
        setAutoStatus('saving');
        setAutoMessage('Completing setup and linking your WABA account...');

        router.post(route('app.whatsapp.connections.store-embedded', {}), payload, {
            preserveScroll: true,
            onSuccess: () => {
                setAutoStatus('idle');
                setAutoMessage('WABA account connected successfully.');
                setShowAutoDialog(false);
                addToast({ title: 'WABA account connected', variant: 'success' });
            },
            onError: (errors) => {
                setAutoStatus('error');
                setAutoMessage((errors as any)?.embedded || 'Meta embedded signup could not be completed.');
                addToast({ title: 'Embedded signup failed', variant: 'error' });
            },
        });
    };

    const startEmbeddedSignup = () => {
        if (automaticDisabled || !window.FB) {
            return;
        }

        setAutoStatus('authorizing');
        setAutoMessage('Opening Meta embedded signup...');

        window.FB.login(
            (response: any) => {
                if (!response?.authResponse) {
                    setAutoStatus('error');
                    setAutoMessage('Meta signup was cancelled or did not fully authorize.');
                    return;
                }

                const code = response.authResponse.code || '';
                const accessToken = response.authResponse.accessToken || '';

                if (!code && !accessToken) {
                    setAutoStatus('error');
                    setAutoMessage('Meta did not return an authorization code. Please try again.');
                    return;
                }

                window.setTimeout(() => {
                    const session = embeddedSessionRef.current || {};
                    const sessionData = session.data || {};

                    submitEmbedded({
                        name: '',
                        waba_id: sessionData.waba_id || session.waba_id || '',
                        phone_number_id: sessionData.phone_number_id || session.phone_number_id || '',
                        business_id: sessionData.business_id || session.business_id || '',
                        business_phone: sessionData.phone_number || sessionData.display_phone_number || '',
                        session_info: JSON.stringify(session),
                        connection_mode: signupMode,
                        access_token: accessToken,
                        code,
                        pin: '',
                    });
                }, 350);
            },
            {
                config_id: signupMode === 'coexistence' && embeddedSignup.coexistenceConfigId ? embeddedSignup.coexistenceConfigId : embeddedSignup.configId,
                response_type: 'code',
                override_default_response_type: true,
                scope: 'whatsapp_business_management,whatsapp_business_messaging,business_management',
                extras: {
                    version: embeddedSignup.apiVersion || defaultApiVersion || 'v25.0',
                    sessionInfoVersion: '3',
                    setup: {},
                },
            }
        );
    };

    const submitManual: FormEventHandler = (event) => {
        event.preventDefault();
        manualForm.post(route('app.whatsapp.connections.store', {}), {
            preserveScroll: true,
            onSuccess: () => {
                setShowManualDialog(false);
                addToast({ title: 'WABA account connected', variant: 'success' });
            },
        });
    };

    const submitProfile: FormEventHandler = (event) => {
        event.preventDefault();
        if (!connection) return;

        profileForm.post(route('app.whatsapp.connections.update', { connection: connection.slug ?? connection.id }), {
            preserveScroll: true,
            forceFormData: true,
            onSuccess: () => addToast({ title: 'Business profile saved', variant: 'success' }),
        });
    };

    const updateWebsite = (index: number, value: string) => {
        const websites = [...(profileForm.data.business_websites || ['', ''])];
        websites[index] = value;
        profileForm.setData('business_websites', websites);
    };

    const refreshMetaHealth = () => {
        if (!connection) return;
        setRefreshingHealth(true);
        router.post(route('app.whatsapp.connections.sync-meta', { connection: connection.slug ?? connection.id }), {}, {
            preserveScroll: true,
            onFinish: () => setRefreshingHealth(false),
            onSuccess: () => addToast({ title: 'Meta details synced', variant: 'success' }),
        });
    };

    const disconnectWaba = () => {
        if (!connection) return;

        setDisconnecting(true);
        router.delete(route('app.whatsapp.connections.destroy', { connection: connection.slug ?? connection.id }), {
            preserveScroll: true,
            onSuccess: () => {
                setShowDisconnectDialog(false);
                addToast({ title: 'WABA account disconnected', variant: 'success' });
            },
            onFinish: () => setDisconnecting(false),
        });
    };

    useEffect(() => {
        if (!connection || connection.connection_mode !== 'baileys_qr') {
            return;
        }

        let cancelled = false;
        const poll = async () => {
            try {
                const response = await fetch(route('app.whatsapp.connections.qr.status', { connection: connection.slug ?? connection.id }), {
                    headers: { Accept: 'application/json' },
                });
                if (!response.ok) return;
                const data = await response.json();
                if (cancelled) return;
                setQrState({
                    status: data.bridge?.status || data.connection?.status,
                    qr: data.bridge?.qr || null,
                    phone: data.bridge?.phone || data.connection?.business_phone || null,
                    error: data.bridge?.error || data.connection?.last_error || null,
                });
            } catch {
                if (!cancelled) {
                    setQrState((current) => ({ ...current, status: 'bridge_unavailable' }));
                }
            }
        };

        poll();
        const interval = window.setInterval(poll, 5000);

        return () => {
            cancelled = true;
            window.clearInterval(interval);
        };
    }, [connectionKey, connection?.connection_mode]);

    const submitQr: FormEventHandler = (event) => {
        event.preventDefault();
        qrForm.post(route('app.whatsapp.connections.qr.store'), {
            preserveScroll: true,
            onSuccess: () => {
                setShowQrDialog(false);
                addToast({ title: 'QR connection created', variant: 'success' });
            },
        });
    };

    const reconnectQr = () => {
        if (!connection) return;
        router.post(route('app.whatsapp.connections.qr.reconnect', { connection: connection.slug ?? connection.id }), {}, {
            preserveScroll: true,
            onSuccess: () => addToast({ title: 'QR session restarted', variant: 'success' }),
        });
    };

    const disconnectQr = () => {
        if (!connection) return;
        router.delete(route('app.whatsapp.connections.qr.disconnect', { connection: connection.slug ?? connection.id }), {
            preserveScroll: false,
            onSuccess: () => {
                addToast({ title: 'QR session disconnected', variant: 'success' });
                router.visit(route('app.whatsapp.connections.index'), {
                    preserveScroll: false,
                    preserveState: false,
                    replace: true,
                });
            },
        });
    };

    return (
        <AppShell>
            <Head title="WABA Account" />
            <div className="mx-auto max-w-[1100px] space-y-6">
                {!connection ? (
                    <section className="space-y-4">
                        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
                            <Card className="p-5 ring-1 ring-waify-green/35">
                                <div className="flex h-full flex-col gap-4">
                                    <div className="flex items-start gap-4">
                                        <span className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-waify-green text-white">
                                            <Sparkles className="h-5 w-5 text-white" />
                                        </span>
                                        <div className="min-w-0 flex-1">
                                            <div className="flex flex-wrap items-center gap-2">
                                                <h3 className="font-semibold text-waify-text dark:text-waify-dark-text">Embedded / Auto connection</h3>
                                                <Badge variant="success">Recommended</Badge>
                                            </div>
                                            <p className="mt-1 text-sm text-waify-text-muted dark:text-waify-dark-text-muted">
                                                Use Meta embedded signup. Inside this flow users can choose a new number, API migration, or eligible Business App coexistence.
                                            </p>
                                        </div>
                                    </div>
                                    <ol className="mt-2 space-y-1">
                                        {['Sign in with Meta', 'Choose setup path', 'Select WABA and phone', 'Complete setup here'].map((step, index) => (
                                            <li key={step} className="flex items-center gap-2 text-xs text-waify-text-muted dark:text-waify-dark-text-muted">
                                                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-gray-100 text-[10px] font-bold text-waify-text dark:bg-slate-700 dark:text-waify-dark-text">
                                                    {index + 1}
                                                </span>
                                                {step}
                                            </li>
                                        ))}
                                    </ol>
                                    <div className="rounded-card border border-waify-border bg-white p-3 text-xs text-waify-text-muted dark:border-waify-dark-border dark:bg-slate-900 dark:text-waify-dark-text-muted">
                                        {autoStatus === 'loading' || autoStatus === 'authorizing' || autoStatus === 'saving' ? (
                                            <span className="inline-flex items-center gap-2">
                                                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                                {autoMessage}
                                            </span>
                                        ) : (
                                            autoMessage
                                        )}
                                    </div>
                                    <Button onClick={() => { setSetupPath('new_cloud_api'); setSignupMode('cloud_api'); setShowAutoDialog(true); }} disabled={!canCreate} className="mt-auto w-full sm:w-auto">
                                        <UserCheck className="h-3.5 w-3.5" />
                                        Start auto setup
                                    </Button>
                                </div>
                            </Card>

                            <Card className="p-5">
                                <div className="flex h-full flex-col gap-4">
                                    <div className="flex items-start gap-4">
                                        <span className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-blue-600 text-white">
                                            <KeyRound className="h-5 w-5 text-white" />
                                        </span>
                                        <div className="min-w-0 flex-1">
                                            <h3 className="font-semibold text-waify-text dark:text-waify-dark-text">Manual setup</h3>
                                            <p className="mt-1 text-sm text-waify-text-muted dark:text-waify-dark-text-muted">
                                                Use this only when support asks you to add WABA ID, phone number ID, and a permanent token manually.
                                            </p>
                                        </div>
                                    </div>
                                    <Button type="button" variant="secondary" onClick={() => setShowManualDialog(true)} className="mt-auto w-full sm:w-auto">
                                        <KeyRound className="h-3.5 w-3.5" />
                                        Configure manually
                                    </Button>
                                </div>
                            </Card>

                            <Card className="p-5">
                                <div className="flex h-full flex-col gap-4">
                                    <div className="flex items-start gap-4">
                                        <span className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-slate-900 text-white dark:bg-slate-700">
                                            <QrCode className="h-5 w-5 text-white" />
                                        </span>
                                        <div className="min-w-0 flex-1">
                                            <div className="flex flex-wrap items-center gap-2">
                                                <h3 className="font-semibold text-waify-text dark:text-waify-dark-text">WhatsApp QR (Unofficial)</h3>
                                                <Badge variant="warning">No anti-ban guarantee</Badge>
                                            </div>
                                            <p className="mt-1 text-sm text-waify-text-muted dark:text-waify-dark-text-muted">
                                                Link a regular WhatsApp session by QR. Zyptos adds throttling and safety controls, but bans cannot be guaranteed against.
                                            </p>
                                        </div>
                                    </div>
                                    <Button type="button" variant="secondary" onClick={() => setShowQrDialog(true)} disabled={!canCreate} className="mt-auto w-full sm:w-auto">
                                        <QrCode className="h-3.5 w-3.5" />
                                        Connect by QR
                                    </Button>
                                </div>
                            </Card>
                        </div>

                        <Card>
                            <CardContent className="flex items-start gap-3 p-4">
                                <div className="mt-0.5 flex h-9 w-9 items-center justify-center rounded-full bg-waify-green-soft dark:bg-waify-green/10">
                                    <LinkIcon className="h-4 w-4 text-waify-green-dark dark:text-waify-green" />
                                </div>
                                <div>
                                    <h3 className="text-sm font-semibold text-waify-text dark:text-waify-dark-text">One WABA account per workspace</h3>
                                    <p className="mt-1 text-sm text-waify-text-muted dark:text-waify-dark-text-muted">
                                        A workspace uses one WABA account so contacts, templates, and billing references stay aligned.
                                    </p>
                                </div>
                            </CardContent>
                        </Card>
                    </section>
                ) : (
                    <section className="space-y-6">
                        <div>
                            <p className="text-xs font-semibold uppercase tracking-wider text-waify-text-muted dark:text-waify-dark-text-muted">WhatsApp</p>
                            <h2 className="mt-1 text-2xl font-bold text-waify-text dark:text-waify-dark-text">
                                {connection.connection_mode === 'baileys_qr' ? 'WhatsApp QR (Unofficial)' : 'Business API connection'}
                            </h2>
                        </div>

                        {connection.connection_mode === 'baileys_qr' && (
                            <QrConnectionPanel
                                connection={connection}
                                qrState={qrState}
                                onReconnect={reconnectQr}
                                onDisconnect={disconnectQr}
                            />
                        )}

                        {connection.connection_mode !== 'baileys_qr' && <div className="rounded-card bg-gradient-to-br from-waify-green-soft to-emerald-50 p-5 ring-1 ring-emerald-100 dark:from-emerald-950/30 dark:to-slate-800 dark:ring-emerald-900/50 lg:p-6">
                            <div className="flex flex-col gap-4 lg:flex-row lg:items-start">
                                <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-white shadow-card dark:bg-slate-800">
                                    <Phone className="h-6 w-6 text-waify-green-dark dark:text-waify-green" />
                                </div>
                                <div className="min-w-0 flex-1">
                                    <div className="flex flex-wrap items-center gap-2">
                                        <span className="truncate text-lg font-semibold text-waify-text dark:text-waify-dark-text">{connection.meta_verified_name || profileForm.data.name || connection.name}</span>
                                        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500 px-2 py-0.5 text-[11px] font-medium text-white">
                                            <CheckCircle2 className="h-2.5 w-2.5" />
                                            Connected
                                        </span>
                                    </div>
                                            <p className="mt-1 text-sm text-waify-text-muted dark:text-waify-dark-text-muted">
                                                {connection.business_phone || connection.phone_number_id} · {connection.meta_waba_name || profileForm.data.business_vertical || 'RETAIL'} · Business Account ID:{' '}
                                                <span className="font-mono text-waify-text dark:text-waify-dark-text">{maskBusinessId(connection.waba_id)}</span>
                                            </p>
                                    <div className="mt-3 flex flex-wrap gap-3 text-xs">
                                        <StatusPill icon={<Zap className="h-3 w-3 text-emerald-600" />} label="API:" value={connection.phone_number_status || 'Connected'} />
                                        <StatusPill icon={<ShieldCheck className="h-3 w-3 text-blue-600" />} label="Display name:" value={connection.meta_verified_name || 'Not synced'} />
                                        <StatusPill icon={<Medal className="h-3 w-3 text-amber-600" />} label="Quality:" value={connection.quality_rating || 'Not synced'} />
                                        {connection.connection_mode === 'coexistence' && (
                                            <StatusPill icon={<MessageCircle className="h-3 w-3 text-emerald-700" />} label="Co-existence:" value={connection.coexistence_status || 'Connected'} />
                                        )}
                                    </div>
                                </div>
                                <div className="flex flex-shrink-0 flex-col gap-2 sm:items-end">
                                    <div className="flex flex-wrap gap-2">
                                        {connection.setup_method === 'manual' && (
                                            <Button
                                                variant={connection.webhook_subscribed ? 'secondary' : 'warning'}
                                                className={connection.webhook_subscribed ? '' : 'border-amber-300 text-amber-800 hover:bg-amber-50 dark:border-amber-800 dark:text-amber-200 dark:hover:bg-amber-950/30'}
                                                onClick={() => setShowWebhookDialog(true)}
                                            >
                                                <AlertTriangle className="h-4 w-4" />
                                                Attention
                                            </Button>
                                        )}
                                        <Button variant="secondary" onClick={() => { setSetupPath(connection.connection_mode === 'coexistence' ? 'coexistence' : 'new_cloud_api'); setSignupMode(connection.connection_mode === 'coexistence' ? 'coexistence' : 'cloud_api'); setShowAutoDialog(true); }} disabled={autoStatus === 'authorizing' || autoStatus === 'saving'}>
                                            {autoStatus === 'authorizing' || autoStatus === 'saving' ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
                                            Reconnect
                                        </Button>
                                        <Button variant="danger" onClick={() => setShowDisconnectDialog(true)} disabled={disconnecting}>
                                            {disconnecting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                                            Disconnect
                                        </Button>
                                    </div>
                                    <Button type="button" variant="ghost" size="sm" onClick={() => setShowMetaDetails((value) => !value)}>
                                        {showMetaDetails ? 'Hide details' : 'Display details'}
                                    </Button>
                                </div>
                            </div>
                        </div>}

                        {connection.connection_mode !== 'baileys_qr' && showMetaDetails && (
                            <Card>
                                <CardContent className="p-4">
                                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                                        <DetailItem label="WABA ID" value={connection.waba_id || 'Not available'} mono />
                                        <DetailItem label="Business Manager ID" value={connection.meta_business_id || 'Not synced'} mono />
                                        <DetailItem label="WABA name" value={connection.meta_waba_name || 'Not synced'} />
                                        <DetailItem label="Phone Number ID" value={connection.phone_number_id || 'Not available'} mono />
                                        <DetailItem label="WABA number" value={connection.business_phone || 'Not synced'} />
                                        <DetailItem label="Display name" value={connection.meta_verified_name || 'Not synced'} />
                                        <DetailItem label="Phone status" value={connection.phone_number_status || 'Not synced'} />
                                        <DetailItem label="Quality rating" value={connection.quality_rating || 'Not synced'} />
                                        <DetailItem label="Code verification" value={connection.code_verification_status || 'Not synced'} />
                                        <DetailItem label="Account review" value={connection.meta_account_review_status || 'Not synced'} />
                                        <DetailItem label="Business verification" value={connection.meta_business_verification_status || 'Not synced'} />
                                        <DetailItem label="Template namespace" value={connection.meta_template_namespace || 'Not synced'} mono />
                                        <DetailItem label="Meta timezone ID" value={connection.meta_timezone_id || 'Not synced'} />
                                        <DetailItem label="Business vertical" value={connection.business_vertical || 'Not synced'} />
                                        <DetailItem label="Connection mode" value={connection.connection_mode === 'coexistence' ? 'WhatsApp app co-existence' : 'Cloud API'} />
                                        {connection.connection_mode === 'coexistence' && (
                                            <>
                                                <DetailItem label="Co-existence status" value={connection.coexistence_status || 'Not checked'} />
                                                <DetailItem label="Last co-existence check" value={connection.coexistence_last_checked_at ? new Date(connection.coexistence_last_checked_at).toLocaleString() : 'Not checked'} />
                                                <DetailItem label="Co-existence warning" value={connection.coexistence_last_error || 'No warning'} className="sm:col-span-2" />
                                            </>
                                        )}
                                        <DetailItem label="Full address" value={connection.business_address || 'Not synced'} className="sm:col-span-2" />
                                    </div>
                                </CardContent>
                            </Card>
                        )}

                        {showWebhookDialog && (
                            <WebhookSetupDialog
                                connection={connection}
                                centralWebhook={centralWebhook}
                                onClose={() => setShowWebhookDialog(false)}
                            />
                        )}

                        {showVerificationDialog && (
                            <VerificationDialog onClose={() => setShowVerificationDialog(false)} />
                        )}

                        {connection.connection_mode !== 'baileys_qr' && <WabaHealthPanel
                            connection={connection}
                            embeddedEnabled={embeddedEnabled}
                            refreshing={refreshingHealth}
                            onRefresh={refreshMetaHealth}
                            onWebhookSetup={() => setShowWebhookDialog(true)}
                        />}

                        {connection.connection_mode !== 'baileys_qr' && <div className="grid grid-cols-1 gap-5 xl:grid-cols-[minmax(0,1fr)_360px]">
                            <Card>
                                <CardHeader>
                                    <CardTitle>WhatsApp preview</CardTitle>
                                    <CardDescription>How customers see this business profile in WhatsApp.</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <WhatsAppProfilePreview connection={connection} />
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader>
                                    <CardTitle>Verified badge services</CardTitle>
                                    <CardDescription>Guided readiness for Meta Verified or Official Business Account review.</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="rounded-card border border-blue-200 bg-blue-50 p-4 dark:border-blue-900/70 dark:bg-blue-950/20">
                                        <div className="flex items-start gap-3">
                                            <BadgeCheck className="mt-0.5 h-5 w-5 flex-shrink-0 text-blue-700 dark:text-blue-300" />
                                            <div>
                                                <h3 className="text-sm font-semibold text-blue-950 dark:text-blue-100">Blue-tick assistance</h3>
                                                <p className="mt-1 text-sm text-blue-800 dark:text-blue-200">
                                                    We can help prepare business verification, profile completeness, policy readiness, and submission support. Meta makes the final approval or subscription decision.
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                    <ul className="space-y-2 text-sm text-waify-text-muted dark:text-waify-dark-text-muted">
                                        {[
                                            'Business Manager verification readiness',
                                            'Display name and profile review',
                                            'Policy and website/domain checks',
                                            'Meta Verified or OBA guidance',
                                        ].map((item) => (
                                            <li key={item} className="flex items-center gap-2">
                                                <CheckCircle2 className="h-4 w-4 text-waify-green" />
                                                {item}
                                            </li>
                                        ))}
                                    </ul>
                                    <Button type="button" onClick={() => setShowVerificationDialog(true)} className="w-full">
                                        <BadgeCheck className="h-4 w-4" />
                                        View service details
                                    </Button>
                                </CardContent>
                            </Card>
                        </div>}

                        {connection.connection_mode !== 'baileys_qr' && <Card>
                            <CardHeader>
                                <CardTitle>Business profile</CardTitle>
                                <CardDescription>Manage the public WhatsApp profile for this phone number.</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <form onSubmit={submitProfile} className="space-y-5">
                                    <div className="flex flex-col gap-4 rounded-card border border-waify-border bg-gray-50 p-4 dark:border-waify-dark-border dark:bg-slate-900/60 sm:flex-row sm:items-center">
                                        <div className="flex h-20 w-20 flex-shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-waify-border bg-white dark:border-waify-dark-border dark:bg-slate-950">
                                            {connection.profile_picture_url ? (
                                                <img src={connection.profile_picture_url} alt="" className="h-full w-full object-cover" />
                                            ) : (
                                                <Image className="h-8 w-8 text-waify-text-muted dark:text-waify-dark-text-muted" />
                                            )}
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <div className="text-sm font-semibold text-waify-text dark:text-waify-dark-text">Profile photo</div>
                                            <p className="mt-1 text-xs text-waify-text-muted dark:text-waify-dark-text-muted">
                                                Upload a square JPG or PNG. Meta returns the public profile image URL after sync.
                                            </p>
                                            <input
                                                type="file"
                                                accept="image/jpeg,image/png"
                                                onChange={(event) => profileForm.setData('profile_picture_file', event.currentTarget.files?.[0] ?? null)}
                                                className="mt-3 block w-full text-xs text-waify-text-muted file:mr-3 file:rounded-btn file:border-0 file:bg-waify-green file:px-3 file:py-2 file:text-xs file:font-semibold file:text-white dark:text-waify-dark-text-muted"
                                            />
                                            <InputError message={profileForm.errors.profile_picture_file} className="mt-1" />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                        <Field icon={<Building2 className="h-3.5 w-3.5" />} label="Business display name" value={profileForm.data.name} onChange={(value) => profileForm.setData('name', value)} error={profileForm.errors.name} required />
                                        <SelectField label="Business vertical" value={profileForm.data.business_vertical} onChange={(value) => profileForm.setData('business_vertical', value)} error={profileForm.errors.business_vertical} />
                                        <Field icon={<Phone className="h-3.5 w-3.5" />} label="Business phone" value={profileForm.data.business_phone} onChange={(value) => profileForm.setData('business_phone', value)} error={profileForm.errors.business_phone} />
                                        <Field icon={<Mail className="h-3.5 w-3.5" />} label="Contact email" value={profileForm.data.business_email} onChange={(value) => profileForm.setData('business_email', value)} error={profileForm.errors.business_email} type="email" />
                                        <Field icon={<MapPin className="h-3.5 w-3.5" />} label="Business address" value={profileForm.data.business_address} onChange={(value) => profileForm.setData('business_address', value)} error={profileForm.errors.business_address} className="sm:col-span-2" />
                                        <TextAreaField label="About text" value={profileForm.data.business_about} onChange={(value) => profileForm.setData('business_about', value)} error={profileForm.errors.business_about} maxLength={139} className="sm:col-span-2" />
                                        <TextAreaField label="Business description" value={profileForm.data.business_description} onChange={(value) => profileForm.setData('business_description', value)} error={profileForm.errors.business_description} maxLength={512} className="sm:col-span-2" />
                                        <Field icon={<Globe2 className="h-3.5 w-3.5" />} label="Website 1" value={profileForm.data.business_websites?.[0] ?? ''} onChange={(value) => updateWebsite(0, value)} error={(profileForm.errors as any)['business_websites.0']} placeholder="https://example.com" />
                                        <Field icon={<Globe2 className="h-3.5 w-3.5" />} label="Website 2" value={profileForm.data.business_websites?.[1] ?? ''} onChange={(value) => updateWebsite(1, value)} error={(profileForm.errors as any)['business_websites.1']} placeholder="https://instagram.com/yourbrand" />
                                        <Field label="Profile picture handle" value={profileForm.data.profile_picture_handle} onChange={(value) => profileForm.setData('profile_picture_handle', value)} error={profileForm.errors.profile_picture_handle} placeholder="Optional Meta upload handle" className="sm:col-span-2" />
                                    </div>

                                    <div className="flex flex-wrap items-center justify-between gap-3 border-t border-waify-border pt-4 dark:border-waify-dark-border">
                                        <div className="space-y-1 text-xs text-waify-text-muted dark:text-waify-dark-text-muted">
                                            <div>Phone Number ID: <span className="font-mono text-waify-text dark:text-waify-dark-text">{connection.phone_number_id}</span></div>
                                            {connection.profile_synced_at && <div>Last synced with Meta: {new Date(connection.profile_synced_at).toLocaleString()}</div>}
                                            {connection.profile_sync_error && <div className="text-amber-700 dark:text-amber-300">Last sync warning: {connection.profile_sync_error}</div>}
                                        </div>
                                        <Button type="submit" size="sm" disabled={profileForm.processing}>
                                            {profileForm.processing ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
                                            Save profile
                                        </Button>
                                    </div>
                                </form>
                            </CardContent>
                        </Card>}

                        <div className="rounded-card border border-waify-border bg-gray-50 p-4 dark:border-waify-dark-border dark:bg-slate-900/60">
                            <h3 className="text-sm font-semibold text-waify-text dark:text-waify-dark-text">Messaging limits</h3>
                            <p className="mt-1 text-sm text-waify-text-muted dark:text-waify-dark-text-muted">
                                {connection.connection_mode === 'baileys_qr'
                                    ? 'QR sessions can send inbox replies and campaigns with throttling, quiet hours, opt-out filtering, and adaptive backoff. Anti-ban is not guaranteed.'
                                    : 'Messaging limits are managed by Meta and may vary by phone number quality and verification state.'}
                            </p>
                        </div>
                    </section>
                )}
                <SetupWizardDialog
                    open={showAutoDialog}
                    onClose={() => setShowAutoDialog(false)}
                    embeddedEnabled={embeddedEnabled}
                    embeddedReady={embeddedReady}
                    autoStatus={autoStatus}
                    autoMessage={autoMessage}
                    automaticDisabled={automaticDisabled}
                    automaticButtonLabel={automaticButtonLabel}
                    startEmbeddedSignup={startEmbeddedSignup}
                    connection={connection}
                    setupPath={setupPath}
                    signupMode={signupMode}
                    setSignupMode={setSignupMode}
                    setSetupPath={setSetupPath}
                    coexistenceEnabled={Boolean(embeddedSignup?.coexistenceEnabled)}
                />
                <DisconnectWabaDialog
                    open={showDisconnectDialog}
                    onClose={() => setShowDisconnectDialog(false)}
                    onConfirm={disconnectWaba}
                    processing={disconnecting}
                    connection={connection}
                />
                <ManualSetupDialog
                    open={showManualDialog}
                    onClose={() => setShowManualDialog(false)}
                    manualForm={manualForm}
                    submitManual={submitManual}
                />
                <QrSetupDialog
                    open={showQrDialog}
                    onClose={() => setShowQrDialog(false)}
                    qrForm={qrForm}
                    submitQr={submitQr}
                />
            </div>
        </AppShell>
    );
}

function QrConnectionPanel({
    connection,
    qrState,
    onReconnect,
    onDisconnect,
}: {
    connection: Connection;
    qrState: { status?: string; qr?: string | null; phone?: string | null; error?: string | null };
    onReconnect: () => void;
    onDisconnect: () => void;
}) {
    const status = qrState.status || connection.qr_status || 'starting';
    const connected = status === 'connected';

    return (
        <Card>
            <CardContent className="grid gap-5 p-5 lg:grid-cols-[280px_minmax(0,1fr)]">
                <div className="flex min-h-[280px] items-center justify-center rounded-card border border-waify-border bg-white p-4 dark:border-waify-dark-border dark:bg-slate-950">
                    {qrState.qr && !connected ? (
                        <img src={qrState.qr} alt="WhatsApp QR code" className="h-64 w-64 rounded-btn object-contain" />
                    ) : (
                        <div className="text-center">
                            <div className={`mx-auto flex h-16 w-16 items-center justify-center rounded-full ${connected ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-200' : 'bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-200'}`}>
                                {connected ? <CheckCircle2 className="h-7 w-7" /> : <QrCode className="h-7 w-7" />}
                            </div>
                            <p className="mt-3 text-sm font-semibold text-waify-text dark:text-waify-dark-text">
                                {connected ? 'QR session connected' : 'Waiting for QR code'}
                            </p>
                            <p className="mt-1 text-xs text-waify-text-muted dark:text-waify-dark-text-muted">
                                {connected ? (qrState.phone || connection.business_phone || 'Phone linked') : 'Restart the session if the QR does not appear.'}
                            </p>
                        </div>
                    )}
                </div>
                <div className="space-y-4">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                        <div>
                            <div className="flex flex-wrap items-center gap-2">
                                <h3 className="text-lg font-semibold text-waify-text dark:text-waify-dark-text">{connection.name}</h3>
                                <Badge variant={connected ? 'success' : status === 'bridge_unavailable' ? 'danger' : 'warning'}>{status.replace(/_/g, ' ')}</Badge>
                            </div>
                            <p className="mt-1 text-sm text-waify-text-muted dark:text-waify-dark-text-muted">
                                Scan with WhatsApp mobile: Linked devices → Link a device.
                            </p>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            <Button type="button" variant="secondary" size="sm" onClick={onReconnect}>
                                <RefreshCw className="h-4 w-4" />
                                Restart QR
                            </Button>
                            <Button type="button" variant="danger" size="sm" onClick={onDisconnect}>
                                <Trash2 className="h-4 w-4" />
                                Disconnect
                            </Button>
                        </div>
                    </div>

                    {qrState.error && (
                        <div className="rounded-card border border-red-200 bg-red-50 p-3 text-sm text-red-800 dark:border-red-900/70 dark:bg-red-950/20 dark:text-red-200">
                            {qrState.error}
                        </div>
                    )}

                    <div className="grid gap-3 sm:grid-cols-2">
                        <DetailItem label="Linked phone" value={qrState.phone || connection.business_phone || 'Not linked yet'} />
                        <DetailItem label="Last seen" value={connection.qr_last_seen_at ? new Date(connection.qr_last_seen_at).toLocaleString() : 'Not seen yet'} />
                        <DetailItem label="Rate cap" value={`${connection.throughput_cap_per_minute || 15} messages/minute`} />
                        <DetailItem label="Supported use" value="Inbox, automations, and throttled campaigns" />
                    </div>

                    <div className="rounded-card border border-amber-200 bg-amber-50 p-4 dark:border-amber-900/70 dark:bg-amber-950/20">
                        <div className="flex items-start gap-3">
                            <ShieldCheck className="mt-0.5 h-5 w-5 flex-shrink-0 text-amber-700 dark:text-amber-200" />
                            <div>
                                <h4 className="text-sm font-semibold text-amber-950 dark:text-amber-100">Safety rules enabled</h4>
                                <ul className="mt-2 space-y-1 text-sm text-amber-800 dark:text-amber-200">
                                    <li>Groups, WhatsApp broadcast lists, status, and newsletters are blocked.</li>
                                    <li>Campaigns use per-minute throttling, opt-out filtering, quiet hours, and adaptive backoff.</li>
                                    <li>This is unofficial Baileys usage; Zyptos cannot guarantee anti-ban protection.</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}

function QrSetupDialog({
    open,
    onClose,
    qrForm,
    submitQr,
}: {
    open: boolean;
    onClose: () => void;
    qrForm: any;
    submitQr: FormEventHandler;
}) {
    return (
        <Modal
            open={open}
            onClose={onClose}
            title="WhatsApp QR (Unofficial)"
            description="Create a QR session for inbox, automation, and throttled campaigns."
            className="max-w-2xl"
            footer={(
                <>
                    <Button type="button" variant="secondary" onClick={onClose}>Cancel</Button>
                    <Button type="submit" form="qr-login-form" disabled={qrForm.processing}>
                        {qrForm.processing ? <Loader2 className="h-4 w-4 animate-spin" /> : <QrCode className="h-4 w-4" />}
                        Create QR session
                    </Button>
                </>
            )}
        >
            <form id="qr-login-form" onSubmit={submitQr} className="space-y-4">
                <div className="rounded-card border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900 dark:border-amber-900/70 dark:bg-amber-950/20 dark:text-amber-100">
                    This uses unofficial Baileys linked-device login. Zyptos adds throttling, quiet hours, opt-out checks, and adaptive backoff, but anti-ban cannot be guaranteed.
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                    <Field label="Connection name" value={qrForm.data.name} onChange={(value) => qrForm.setData('name', value)} error={qrForm.errors.name} />
                    <Field label="Max messages/minute" type="number" value={String(qrForm.data.throughput_cap_per_minute)} onChange={(value) => qrForm.setData('throughput_cap_per_minute', Number(value))} error={qrForm.errors.throughput_cap_per_minute} />
                    <Field label="Quiet hours start" value={qrForm.data.quiet_hours_start} onChange={(value) => qrForm.setData('quiet_hours_start', value)} error={qrForm.errors.quiet_hours_start} placeholder="22:00" />
                    <Field label="Quiet hours end" value={qrForm.data.quiet_hours_end} onChange={(value) => qrForm.setData('quiet_hours_end', value)} error={qrForm.errors.quiet_hours_end} placeholder="09:00" />
                </div>
            </form>
        </Modal>
    );
}

function WabaHealthPanel({
    connection,
    embeddedEnabled,
    refreshing,
    onRefresh,
    onWebhookSetup,
}: {
    connection: Connection;
    embeddedEnabled: boolean;
    refreshing: boolean;
    onRefresh: () => void;
    onWebhookSetup: () => void;
}) {
    const checks = [
        {
            label: 'Meta app setup',
            desc: embeddedEnabled ? 'Embedded signup config is available.' : 'Platform embedded signup config is missing.',
            ok: embeddedEnabled,
        },
        {
            label: 'WABA identifiers',
            desc: connection.waba_id && connection.phone_number_id ? 'WABA ID and phone number ID are present.' : 'WABA ID or phone number ID is missing.',
            ok: Boolean(connection.waba_id && connection.phone_number_id),
        },
        {
            label: 'Phone registration',
            desc: connection.phone_number_status || connection.code_verification_status || 'Phone status has not been synced from Meta yet.',
            ok: Boolean(connection.phone_number_status || connection.code_verification_status),
        },
        {
            label: 'WABA review',
            desc: connection.meta_account_review_status || connection.meta_business_verification_status || 'WABA review details have not been synced from Meta yet.',
            ok: Boolean(connection.meta_account_review_status || connection.meta_business_verification_status),
        },
        {
            label: 'Business profile',
            desc: connection.profile_sync_error ? connection.profile_sync_error : (connection.profile_synced_at ? 'Profile data synced from Meta.' : 'Profile has local values and can be refreshed from Meta.'),
            ok: Boolean(connection.profile_synced_at && !connection.profile_sync_error),
        },
        {
            label: 'Webhook readiness',
            desc: connection.setup_method !== 'manual'
                ? (connection.webhook_subscribed ? 'Provider-managed central webhook is subscribed.' : 'Provider-managed central webhook needs a Meta subscription sync.')
                : (connection.webhook_subscribed ? 'Manual webhook is subscribed.' : 'Manual connection should verify webhooks to receive inbound messages.'),
            ok: Boolean(connection.webhook_subscribed),
            action: onWebhookSetup,
        },
        {
            label: 'Webhook signature',
            desc: connection.setup_method !== 'manual'
                ? 'Central webhook security is managed at provider level.'
                : (connection.webhook_verify_token ? 'Verify token is configured.' : 'Verify token is missing.'),
            ok: connection.setup_method !== 'manual' || Boolean(connection.webhook_verify_token),
            action: connection.setup_method === 'manual' ? onWebhookSetup : undefined,
        },
        ...(connection.connection_mode === 'coexistence' ? [{
            label: 'Co-existence diagnostics',
            desc: connection.coexistence_last_error
                ? connection.coexistence_last_error
                : (connection.coexistence_status ? `Co-existence status: ${connection.coexistence_status}` : 'Refresh from Meta to check co-existence status.'),
            ok: Boolean(connection.coexistence_status && !connection.coexistence_last_error),
        }] : []),
    ];

    const readyCount = checks.filter((check) => check.ok).length;

    return (
        <Card>
            <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <CardTitle>WABA health checklist</CardTitle>
                    <CardDescription>Live readiness checks for setup, profile sync, phone status, and webhook handling.</CardDescription>
                </div>
                <div className="flex items-center gap-2">
                    <Badge variant={readyCount === checks.length ? 'success' : 'warning'}>{readyCount}/{checks.length} ready</Badge>
                    <Button type="button" size="sm" variant="secondary" onClick={onRefresh} disabled={refreshing}>
                        {refreshing ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
                        Refresh from Meta
                    </Button>
                </div>
            </CardHeader>
            <CardContent>
                <div className="grid gap-3 md:grid-cols-2">
                    {checks.map((check) => (
                        <div key={check.label} className="flex items-start gap-3 rounded-card border border-waify-border bg-gray-50 p-4 dark:border-waify-dark-border dark:bg-slate-900/70">
                            <span className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${check.ok ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-200' : 'bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-200'}`}>
                                {check.ok ? <CheckCircle2 className="h-4 w-4" /> : <AlertTriangle className="h-4 w-4" />}
                            </span>
                            <div className="min-w-0 flex-1">
                                <div className="flex flex-wrap items-center gap-2">
                                    <h3 className="text-sm font-semibold text-waify-text dark:text-waify-dark-text">{check.label}</h3>
                                    <Badge variant={check.ok ? 'success' : 'warning'}>{check.ok ? 'Ready' : 'Needs attention'}</Badge>
                                </div>
                                <p className="mt-1 text-sm text-waify-text-muted dark:text-waify-dark-text-muted">{check.desc}</p>
                                {check.action && (
                                    <Button type="button" variant="link" size="sm" className="mt-2 h-auto p-0" onClick={check.action}>
                                        Open webhook setup
                                    </Button>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}

function StatusPill({ icon, label, value }: { icon: ReactNode; label: string; value: string }) {
    return (
        <span className="inline-flex items-center gap-1.5 rounded-full bg-white/70 px-2.5 py-1 text-waify-text dark:bg-slate-800/80 dark:text-waify-dark-text">
            {icon}
            {label} <strong>{value}</strong>
        </span>
    );
}

function SetupWizardDialog({
    open,
    onClose,
    embeddedEnabled,
    embeddedReady,
    autoStatus,
    autoMessage,
    automaticDisabled,
    automaticButtonLabel,
    startEmbeddedSignup,
    connection,
    setupPath,
    signupMode,
    setSignupMode,
    setSetupPath,
    coexistenceEnabled,
}: {
    open: boolean;
    onClose: () => void;
    embeddedEnabled: boolean;
    embeddedReady: boolean;
    autoStatus: 'idle' | 'loading' | 'authorizing' | 'saving' | 'error';
    autoMessage: string;
    automaticDisabled: boolean;
    automaticButtonLabel: string;
    startEmbeddedSignup: () => void;
    connection: Connection | null;
    setupPath: SetupPath;
    signupMode: 'cloud_api' | 'coexistence';
    setSignupMode: (mode: 'cloud_api' | 'coexistence') => void;
    setSetupPath: (path: SetupPath) => void;
    coexistenceEnabled: boolean;
}) {
    const selectedPath = setupPath === 'coexistence' ? 'coexistence' : setupPath;
    const steps = [
        { title: 'Sign in with Meta', desc: 'Authenticate the business admin who owns the WhatsApp Business Account or existing number.' },
        { title: 'Choose Business Manager', desc: selectedPath === 'migrate_api' ? 'Select the WABA and phone number being migrated or released by the existing provider.' : 'Select the business, WABA, and phone number to connect with this workspace.' },
        { title: 'Authorize Zyptos', desc: 'Grant required WhatsApp Business Management and Messaging permissions.' },
        { title: 'Finish in Zyptos', desc: 'Zyptos stores the phone ID, subscribes provider webhooks, and syncs profile data.' },
    ];

    return (
        <Modal
            open={open}
            onClose={onClose}
            title={connection ? 'Reconnect WABA account' : selectedPath === 'migrate_api' ? 'Migrate existing WhatsApp API number' : selectedPath === 'coexistence' ? 'Connect WhatsApp Business App co-existence' : 'Automatic WABA setup'}
            description={selectedPath === 'migrate_api' ? 'Use Meta embedded signup to connect a number already on WhatsApp Business Platform.' : selectedPath === 'coexistence' ? 'Use Meta embedded signup for eligible Business App numbers that can run app + API together.' : 'Complete Meta embedded signup without leaving this page.'}
            className="max-w-3xl"
            footer={(
                <>
                    <Button type="button" variant="secondary" onClick={onClose}>Cancel</Button>
                    <Button type="button" onClick={startEmbeddedSignup} disabled={automaticDisabled}>
                        {autoStatus === 'authorizing' || autoStatus === 'saving' || autoStatus === 'loading' ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                            <UserCheck className="h-4 w-4" />
                        )}
                        {automaticButtonLabel}
                    </Button>
                </>
            )}
        >
            <div className="space-y-5">
                <div className="grid gap-3 lg:grid-cols-3">
                    <button
                        type="button"
                        onClick={() => { setSetupPath('new_cloud_api'); setSignupMode('cloud_api'); }}
                        className={`rounded-card border p-4 text-left transition ${setupPath === 'new_cloud_api' ? 'border-waify-green bg-waify-green-soft/70 dark:border-waify-green dark:bg-waify-green/10' : 'border-waify-border bg-white hover:border-waify-green/50 dark:border-waify-dark-border dark:bg-slate-900'}`}
                    >
                        <div className="flex items-center gap-2">
                            <Sparkles className="h-4 w-4 text-waify-green-dark dark:text-waify-green" />
                            <span className="text-sm font-semibold text-waify-text dark:text-waify-dark-text">New Cloud API</span>
                        </div>
                        <p className="mt-2 text-xs leading-5 text-waify-text-muted dark:text-waify-dark-text-muted">
                            Standard Meta Embedded Signup for a WABA phone number managed through Cloud API.
                        </p>
                    </button>
                    <button
                        type="button"
                        onClick={() => { setSetupPath('migrate_api'); setSignupMode('cloud_api'); }}
                        className={`rounded-card border p-4 text-left transition ${setupPath === 'migrate_api' ? 'border-waify-green bg-waify-green-soft/70 dark:border-waify-green dark:bg-waify-green/10' : 'border-waify-border bg-white hover:border-waify-green/50 dark:border-waify-dark-border dark:bg-slate-900'}`}
                    >
                        <div className="flex items-center gap-2">
                            <RefreshCw className="h-4 w-4 text-blue-700 dark:text-blue-300" />
                            <span className="text-sm font-semibold text-waify-text dark:text-waify-dark-text">Migrate API number</span>
                        </div>
                        <p className="mt-2 text-xs leading-5 text-waify-text-muted dark:text-waify-dark-text-muted">
                            For existing BSP/API numbers. Templates and quality may transfer; old chat history normally does not.
                        </p>
                    </button>
                    <button
                        type="button"
                        onClick={() => { setSetupPath('coexistence'); setSignupMode('coexistence'); }}
                        className={`rounded-card border p-4 text-left transition ${setupPath === 'coexistence' ? 'border-waify-green bg-waify-green-soft/70 dark:border-waify-green dark:bg-waify-green/10' : 'border-waify-border bg-white hover:border-waify-green/50 dark:border-waify-dark-border dark:bg-slate-900'}`}
                    >
                        <div className="flex flex-wrap items-center gap-2">
                            <MessageCircle className="h-4 w-4 text-emerald-700 dark:text-emerald-300" />
                            <span className="text-sm font-semibold text-waify-text dark:text-waify-dark-text">App co-existence</span>
                            {!coexistenceEnabled && <Badge variant="warning">Signup config missing</Badge>}
                        </div>
                        <p className="mt-2 text-xs leading-5 text-waify-text-muted dark:text-waify-dark-text-muted">
                            For eligible numbers that Meta allows to keep WhatsApp Business app usage alongside API messaging.
                        </p>
                    </button>
                </div>

                <div className="rounded-card border border-waify-border bg-gray-50 p-4 dark:border-waify-dark-border dark:bg-slate-900/70">
                    <div className="flex items-start gap-3">
                        <div className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl ${embeddedEnabled ? 'bg-waify-green-soft dark:bg-waify-green/10' : 'bg-amber-100 dark:bg-amber-500/10'}`}>
                            {embeddedEnabled ? <Sparkles className="h-5 w-5 text-waify-green-dark dark:text-waify-green" /> : <AlertTriangle className="h-5 w-5 text-amber-700 dark:text-amber-300" />}
                        </div>
                        <div>
                            <h4 className="text-sm font-semibold text-waify-text dark:text-waify-dark-text">
                                {embeddedEnabled ? 'Meta embedded signup is configured' : 'Meta embedded signup needs platform settings'}
                            </h4>
                            <p className="mt-1 text-sm text-waify-text-muted dark:text-waify-dark-text-muted">
                                {signupMode === 'coexistence' && !coexistenceEnabled
                                    ? 'Add the Meta Embedded Signup config ID in platform WhatsApp settings before using this mode.'
                                    : embeddedEnabled
                                    ? 'This flow uses your platform Meta app ID and embedded signup configuration.'
                                    : 'Add Meta app ID, app secret, and embedded signup config ID in platform WhatsApp settings.'}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="rounded-card border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900 dark:border-amber-900/70 dark:bg-amber-950/20 dark:text-amber-100">
                    <div className="flex items-start gap-3">
                        <AlertTriangle className="mt-0.5 h-4 w-4 flex-shrink-0" />
                        <div className="space-y-1">
                            <p className="font-semibold">Data migration note</p>
                            <p className="leading-6">
                                Zyptos starts syncing messages after connection and webhook subscription. Existing chat history from WhatsApp Business App or another provider is not imported through the normal Cloud API. Use CSV import for old contacts if needed.
                            </p>
                        </div>
                    </div>
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                    {steps.map((step, index) => (
                        <div key={step.title} className="rounded-card border border-waify-border bg-white p-4 dark:border-waify-dark-border dark:bg-slate-900">
                            <div className="flex items-start gap-3">
                                <span className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-waify-green-soft text-xs font-bold text-waify-green-dark dark:bg-waify-green/10 dark:text-waify-green">
                                    {index + 1}
                                </span>
                                <div>
                                    <h4 className="text-sm font-semibold text-waify-text dark:text-waify-dark-text">{step.title}</h4>
                                    <p className="mt-1 text-xs leading-5 text-waify-text-muted dark:text-waify-dark-text-muted">{step.desc}</p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                <div className={`rounded-card border p-3 text-sm ${autoStatus === 'error' ? 'border-red-200 bg-red-50 text-red-800 dark:border-red-900/70 dark:bg-red-950/20 dark:text-red-200' : 'border-waify-border bg-white text-waify-text-muted dark:border-waify-dark-border dark:bg-slate-900 dark:text-waify-dark-text-muted'}`}>
                    <span className="inline-flex items-center gap-2">
                        {(autoStatus === 'loading' || autoStatus === 'authorizing' || autoStatus === 'saving') && <Loader2 className="h-4 w-4 animate-spin" />}
                        {!embeddedReady && embeddedEnabled && autoStatus !== 'error' ? 'Loading Meta SDK...' : autoMessage}
                    </span>
                </div>
            </div>
        </Modal>
    );
}

function ManualSetupDialog({
    open,
    onClose,
    manualForm,
    submitManual,
}: {
    open: boolean;
    onClose: () => void;
    manualForm: any;
    submitManual: FormEventHandler;
}) {
    return (
        <Modal
            open={open}
            onClose={onClose}
            title="Manual WABA setup"
            description="Use this only when support asks you to add Meta identifiers and a permanent token manually."
            className="max-w-3xl"
            footer={(
                <>
                    <Button type="button" variant="secondary" onClick={onClose}>Cancel</Button>
                    <Button type="submit" form="manual-waba-form" disabled={manualForm.processing}>
                        {manualForm.processing ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
                        Connect manually
                    </Button>
                </>
            )}
        >
            <div className="space-y-4">
                <div className="rounded-card border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900 dark:border-amber-900/70 dark:bg-amber-950/20 dark:text-amber-100">
                    Manual connections can send messages after token validation. To receive inbound messages, verify the webhook from the Attention dialog after setup.
                </div>
                <form id="manual-waba-form" onSubmit={submitManual} className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <Field label="Business display name" value={manualForm.data.name} onChange={(value) => manualForm.setData('name', value)} error={manualForm.errors.name} />
                    <Field label="Business phone" value={manualForm.data.business_phone} onChange={(value) => manualForm.setData('business_phone', value)} error={manualForm.errors.business_phone} />
                    <Field label="WABA ID" value={manualForm.data.waba_id} onChange={(value) => manualForm.setData('waba_id', value)} error={manualForm.errors.waba_id} />
                    <Field label="Phone Number ID" value={manualForm.data.phone_number_id} onChange={(value) => manualForm.setData('phone_number_id', value)} error={manualForm.errors.phone_number_id} required />
                    <Field label="Permanent access token" value={manualForm.data.access_token} onChange={(value) => manualForm.setData('access_token', value)} error={manualForm.errors.access_token} required type="password" className="sm:col-span-2" />
                </form>
            </div>
        </Modal>
    );
}

function DisconnectWabaDialog({
    open,
    onClose,
    onConfirm,
    processing,
    connection,
}: {
    open: boolean;
    onClose: () => void;
    onConfirm: () => void;
    processing: boolean;
    connection: Connection | null;
}) {
    return (
        <Modal
            open={open}
            onClose={processing ? () => undefined : onClose}
            title="Disconnect WABA account"
            description="Remove this WhatsApp Business API connection from the workspace."
            footer={(
                <>
                    <Button type="button" variant="secondary" onClick={onClose} disabled={processing}>Cancel</Button>
                    <Button type="button" variant="danger" onClick={onConfirm} disabled={processing}>
                        {processing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                        Disconnect WABA
                    </Button>
                </>
            )}
        >
            <div className="space-y-4">
                <div className="rounded-card border border-red-200 bg-red-50 p-4 dark:border-red-900/70 dark:bg-red-950/20">
                    <div className="flex items-start gap-3">
                        <div className="mt-0.5 flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl bg-red-100 text-red-700 dark:bg-red-500/15 dark:text-red-200">
                            <AlertTriangle className="h-5 w-5" />
                        </div>
                        <div>
                            <h4 className="text-sm font-semibold text-red-950 dark:text-red-100">This removes the active WABA connection.</h4>
                            <p className="mt-1 text-sm leading-6 text-red-800 dark:text-red-200">
                                Zyptos will try to unsubscribe the Meta webhook first, then remove the local connection so this workspace can connect another WABA.
                            </p>
                        </div>
                    </div>
                </div>

                <div className="grid gap-3 text-sm sm:grid-cols-2">
                    <DetailItem label="Display name" value={connection?.meta_verified_name || connection?.name || 'Current WABA'} />
                    <DetailItem label="Phone" value={connection?.business_phone || connection?.phone_number_id || 'Not synced'} />
                    <DetailItem label="WABA ID" value={connection?.waba_id || 'Not available'} mono />
                    <DetailItem label="Webhook" value={connection?.webhook_subscribed ? 'Subscribed' : 'Not subscribed'} />
                </div>

                <p className="text-sm text-waify-text-muted dark:text-waify-dark-text-muted">
                    Related WhatsApp records linked to this connection, such as conversations, templates, and lists, may also be removed by database cascade.
                </p>
            </div>
        </Modal>
    );
}

function DetailItem({
    label,
    value,
    mono = false,
    className = '',
}: {
    label: string;
    value: string;
    mono?: boolean;
    className?: string;
}) {
    return (
        <div className={`rounded-card border border-waify-border bg-gray-50 p-3 dark:border-waify-dark-border dark:bg-slate-900/70 ${className}`}>
            <div className="text-[11px] font-semibold uppercase tracking-wider text-waify-text-muted dark:text-waify-dark-text-muted">{label}</div>
            <div className={`mt-1 break-words text-sm font-semibold text-waify-text dark:text-waify-dark-text ${mono ? 'font-mono' : ''}`}>
                {value}
            </div>
        </div>
    );
}

function WhatsAppProfilePreview({ connection }: { connection: Connection }) {
    const displayName = connection.meta_verified_name || connection.name || 'Business';
    const phone = connection.business_phone || connection.phone_number_id || '';
    const about = connection.business_about || 'Business account';
    const description = connection.business_description || 'No business description added yet.';
    const address = connection.business_address || 'Address not added';
    const websites = (connection.business_websites || []).filter(Boolean);

    return (
        <div className="mx-auto max-w-sm overflow-hidden rounded-[28px] bg-[#111b21] p-2 shadow-pop">
            <div className="rounded-[22px] bg-[#0b141a] text-[#e9edef]">
                <div className="flex items-center gap-3 bg-[#075e54] px-4 py-3">
                    <div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full bg-white/20">
                        {connection.profile_picture_url ? (
                            <img src={connection.profile_picture_url} alt="" className="h-full w-full object-cover" />
                        ) : (
                            <Building2 className="h-5 w-5 text-white" />
                        )}
                    </div>
                    <div className="min-w-0 flex-1">
                        <div className="flex min-w-0 items-center gap-1">
                            <span className="truncate text-sm font-semibold text-white">{displayName}</span>
                        </div>
                        <div className="truncate text-[11px] text-white/75">{phone}</div>
                    </div>
                </div>

                <div className="space-y-3 p-4">
                    <div className="rounded-xl bg-[#202c33] p-3">
                        <div className="text-xs font-semibold uppercase tracking-wider text-[#8696a0]">About</div>
                        <div className="mt-1 text-sm leading-5 text-[#e9edef]">{about}</div>
                    </div>
                    <div className="rounded-xl bg-[#202c33] p-3">
                        <div className="text-xs font-semibold uppercase tracking-wider text-[#8696a0]">Business details</div>
                        <div className="mt-2 space-y-2 text-sm text-[#d1d7db]">
                            <div className="flex gap-2">
                                <MapPin className="mt-0.5 h-4 w-4 flex-shrink-0 text-[#8696a0]" />
                                <span>{address}</span>
                            </div>
                            <div className="flex gap-2">
                                <MessageCircle className="mt-0.5 h-4 w-4 flex-shrink-0 text-[#8696a0]" />
                                <span>{description}</span>
                            </div>
                            {connection.business_email && (
                                <div className="flex gap-2">
                                    <Mail className="mt-0.5 h-4 w-4 flex-shrink-0 text-[#8696a0]" />
                                    <span>{connection.business_email}</span>
                                </div>
                            )}
                            {websites.map((website) => (
                                <div key={website} className="flex gap-2">
                                    <Globe2 className="mt-0.5 h-4 w-4 flex-shrink-0 text-[#8696a0]" />
                                    <span className="break-all text-[#53bdeb]">{website}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                    <button
                        type="button"
                        className="flex h-10 w-full items-center justify-center gap-2 rounded-full bg-[#00a884] text-sm font-semibold text-[#08130f]"
                    >
                        <MessageCircle className="h-4 w-4" />
                        Message business
                    </button>
                </div>
            </div>
        </div>
    );
}

function VerificationDialog({ onClose }: { onClose: () => void }) {
    return (
        <Modal
            open
            onClose={onClose}
            title="Blue-tick verification services"
            description="Meta controls verified badge eligibility and approval. Zyptos can provide readiness checks and guided submission support."
            className="max-w-xl"
            footer={<Button type="button" variant="secondary" onClick={onClose}>Close</Button>}
        >
            <div className="space-y-4">
                <div className="flex items-start gap-3 rounded-card border border-blue-200 bg-blue-50 p-4 dark:border-blue-900/70 dark:bg-blue-950/20">
                    <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-blue-100 dark:bg-blue-500/10">
                        <BadgeCheck className="h-5 w-5 text-blue-700 dark:text-blue-300" />
                    </div>
                    <div>
                        <h4 className="text-sm font-semibold text-blue-950 dark:text-blue-100">Readiness and guided submission</h4>
                        <p className="mt-1 text-sm text-blue-800 dark:text-blue-200">
                            We can review the workspace profile, business verification assets, website policy pages, and Meta submission readiness.
                        </p>
                    </div>
                </div>
                <div className="rounded-card border border-waify-border bg-gray-50 p-4 dark:border-waify-dark-border dark:bg-slate-900/70">
                    <h4 className="text-sm font-semibold text-waify-text dark:text-waify-dark-text">What we can add</h4>
                    <div className="mt-3 grid grid-cols-1 gap-2 text-sm text-waify-text-muted dark:text-waify-dark-text-muted">
                        <div>Business verification document checklist</div>
                        <div>Display name, website, domain, and policy readiness checks</div>
                        <div>Meta Verified subscription guidance where available</div>
                        <div>Official Business Account readiness and support handoff</div>
                    </div>
                </div>
                <div className="rounded-card border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900 dark:border-amber-900/70 dark:bg-amber-950/20 dark:text-amber-100">
                    Badge approval is not guaranteed. Meta Verified is a Meta product, and Official Business Account approval depends on Meta eligibility, business verification, policy compliance, and brand notability.
                </div>
            </div>
        </Modal>
    );
}

function WebhookSetupDialog({
    connection,
    centralWebhook,
    onClose,
}: {
    connection: Connection;
    centralWebhook: CentralWebhook;
    onClose: () => void;
}) {
    const subscribeWebhook = () => {
        router.post(route('app.whatsapp.connections.subscribe-webhook', { connection: connection.slug ?? connection.id }), {}, {
            preserveScroll: true,
        });
    };

    const unsubscribeWebhook = () => {
        router.delete(route('app.whatsapp.connections.unsubscribe-webhook', { connection: connection.slug ?? connection.id }), {
            preserveScroll: true,
        });
    };

    return (
        <Modal
            open
            onClose={onClose}
            title="Webhook setup"
            description="Sending messages works without webhooks. Receiving inbound messages and delivery/read statuses needs Meta webhook verification."
            className="max-w-2xl"
            footer={(
                <>
                    <Button type="button" variant="secondary" onClick={onClose}>Close</Button>
                    {connection.webhook_subscribed ? (
                        <Button type="button" variant="warning" onClick={unsubscribeWebhook}>Unsubscribe</Button>
                    ) : (
                        <Button type="button" onClick={subscribeWebhook}>Subscribe webhook</Button>
                    )}
                </>
            )}
        >
            <div className="space-y-4">
                <div className="flex items-start gap-3 rounded-card border border-waify-border bg-gray-50 p-4 dark:border-waify-dark-border dark:bg-slate-900/70">
                    <div className={`mt-0.5 flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl ${connection.webhook_subscribed ? 'bg-emerald-100 dark:bg-emerald-500/10' : 'bg-amber-100 dark:bg-amber-500/10'}`}>
                        {connection.webhook_subscribed ? (
                            <CheckCircle2 className="h-5 w-5 text-emerald-700 dark:text-emerald-300" />
                        ) : (
                            <AlertTriangle className="h-5 w-5 text-amber-700 dark:text-amber-300" />
                        )}
                    </div>
                    <div>
                        <Badge variant={connection.webhook_subscribed ? 'success' : 'warning'}>
                            {connection.webhook_subscribed ? 'Receiving enabled' : 'Action needed'}
                        </Badge>
                        <p className="mt-2 text-sm text-waify-text-muted dark:text-waify-dark-text-muted">
                            Manual setup accounts need webhook verification only if this workspace should receive inbound messages or status callbacks.
                        </p>
                    </div>
                </div>

                <div className="rounded-card border border-emerald-200 bg-emerald-50 p-4 dark:border-emerald-900/70 dark:bg-emerald-950/20">
                    <h4 className="text-sm font-semibold text-emerald-900 dark:text-emerald-100">Recommended: central webhook</h4>
                    <p className="mt-1 text-sm text-emerald-800 dark:text-emerald-200">
                        Use this single callback for all connected WABA accounts. Zyptos routes each event internally by the Meta phone number ID in the webhook payload.
                    </p>
                    <div className="mt-3 grid grid-cols-1 gap-3">
                        <ReadOnlyCopyField label="Central callback URL" value={centralWebhook.url} />
                        <ReadOnlyCopyField label="Central verify token" value={centralWebhook.verify_token} />
                    </div>
                </div>

                <div className="rounded-card border border-waify-border bg-gray-50 p-4 dark:border-waify-dark-border dark:bg-slate-900/70">
                    <h4 className="text-sm font-semibold text-waify-text dark:text-waify-dark-text">Connection-specific fallback</h4>
                    <p className="mt-1 text-sm text-waify-text-muted dark:text-waify-dark-text-muted">
                        Keep this only for older manually configured accounts that already use a connection-specific callback.
                    </p>
                    <div className="mt-3 grid grid-cols-1 gap-3">
                        <ReadOnlyCopyField label="Connection callback URL" value={connection.webhook_url || ''} />
                        <ReadOnlyCopyField label="Connection verify token" value={connection.webhook_verify_token || ''} />
                    </div>
                </div>

                <div className="rounded-card border border-waify-border bg-white p-3 text-xs text-waify-text-muted dark:border-waify-dark-border dark:bg-slate-900 dark:text-waify-dark-text-muted">
                    {connection.webhook_last_received_at ? (
                        <span>Last webhook received: {new Date(connection.webhook_last_received_at).toLocaleString()}</span>
                    ) : (
                        <span>No inbound webhook has been received yet.</span>
                    )}
                    {connection.webhook_last_error && (
                        <div className="mt-1 text-red-600 dark:text-red-300">Last webhook error: {connection.webhook_last_error}</div>
                    )}
                </div>

                <div className="rounded-card border border-waify-border bg-white p-4 dark:border-waify-dark-border dark:bg-slate-900">
                    <div className="text-sm font-semibold text-waify-text dark:text-waify-dark-text">Recent Meta events</div>
                    {connection.meta_event_logs?.length ? (
                        <div className="mt-3 divide-y divide-gray-100 dark:divide-waify-dark-border">
                            {connection.meta_event_logs.map((event) => (
                                <div key={event.id} className="py-2 text-xs">
                                    <div className="flex items-center justify-between gap-3">
                                        <span className="font-medium text-waify-text dark:text-waify-dark-text">
                                            {event.field || 'event'}{event.event_type ? ` / ${event.event_type}` : ''}
                                        </span>
                                        <span className="shrink-0 text-[11px] text-waify-text-muted dark:text-waify-dark-text-muted">
                                            {event.received_at ? new Date(event.received_at).toLocaleString() : 'Just now'}
                                        </span>
                                    </div>
                                    {(event.status || event.message) && (
                                        <div className="mt-1 text-waify-text-muted dark:text-waify-dark-text-muted">
                                            {[event.status, event.message].filter(Boolean).join(' - ')}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="mt-2 text-xs text-waify-text-muted dark:text-waify-dark-text-muted">
                            No Meta webhook events have been logged for this connection yet.
                        </p>
                    )}
                </div>
            </div>
        </Modal>
    );
}

function Field({
    icon,
    label,
    value,
    onChange,
    error,
    required = false,
    type = 'text',
    className = '',
    placeholder = '',
}: {
    icon?: ReactNode;
    label: string;
    value: string | number | null | undefined;
    onChange: (value: string) => void;
    error?: string;
    required?: boolean;
    type?: string;
    className?: string;
    placeholder?: string;
}) {
    return (
        <div className={className}>
            <label className="mb-1.5 block text-xs font-medium text-waify-text dark:text-waify-dark-text">
                {label}{required && <span className="text-red-500"> *</span>}
            </label>
            <div className="relative">
                {icon && <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-waify-text-muted dark:text-waify-dark-text-muted">{icon}</span>}
                <input
                    type={type}
                    value={value ?? ''}
                    placeholder={placeholder}
                    onChange={(event) => onChange(event.target.value)}
                    className={`w-full rounded-card border border-waify-border bg-white py-2 text-sm text-waify-text shadow-sm placeholder:text-waify-text-muted/60 dark:border-waify-dark-border dark:bg-slate-900 dark:text-waify-dark-text dark:placeholder:text-waify-dark-text-muted/60 ${icon ? 'pl-9 pr-3' : 'px-3'}`}
                />
            </div>
            <InputError message={error} className="mt-1" />
        </div>
    );
}

function TextAreaField({
    label,
    value,
    onChange,
    error,
    maxLength,
    className = '',
}: {
    label: string;
    value: string | null | undefined;
    onChange: (value: string) => void;
    error?: string;
    maxLength?: number;
    className?: string;
}) {
    const length = String(value ?? '').length;

    return (
        <div className={className}>
            <div className="mb-1.5 flex items-center justify-between gap-3">
                <label className="block text-xs font-medium text-waify-text dark:text-waify-dark-text">{label}</label>
                {maxLength && (
                    <span className="text-[11px] text-waify-text-muted dark:text-waify-dark-text-muted">
                        {length}/{maxLength}
                    </span>
                )}
            </div>
            <textarea
                value={value ?? ''}
                maxLength={maxLength}
                onChange={(event) => onChange(event.target.value)}
                rows={3}
                className="w-full resize-none rounded-card border border-waify-border bg-white px-3 py-2 text-sm text-waify-text shadow-sm placeholder:text-waify-text-muted/60 dark:border-waify-dark-border dark:bg-slate-900 dark:text-waify-dark-text dark:placeholder:text-waify-dark-text-muted/60"
            />
            <InputError message={error} className="mt-1" />
        </div>
    );
}

function ReadOnlyCopyField({ label, value }: { label: string; value: string }) {
    const { addToast } = useToast();

    const copy = () => {
        if (!value) return;
        navigator.clipboard.writeText(value);
        addToast({ title: `${label} copied`, variant: 'success' });
    };

    return (
        <div>
            <label className="mb-1.5 block text-xs font-medium text-waify-text dark:text-waify-dark-text">{label}</label>
            <div className="flex overflow-hidden rounded-card border border-waify-border bg-white shadow-sm dark:border-waify-dark-border dark:bg-slate-900">
                <input
                    readOnly
                    value={value}
                    className="min-w-0 flex-1 border-0 bg-transparent px-3 py-2 font-mono text-xs text-waify-text outline-none dark:text-waify-dark-text"
                />
                <button
                    type="button"
                    onClick={copy}
                    className="border-l border-waify-border px-3 text-xs font-semibold text-waify-green-dark hover:bg-waify-green-soft dark:border-waify-dark-border dark:text-waify-green dark:hover:bg-waify-green/10"
                >
                    Copy
                </button>
            </div>
        </div>
    );
}

function SelectField({
    label,
    value,
    onChange,
    error,
}: {
    label: string;
    value: string | null | undefined;
    onChange: (value: string) => void;
    error?: string;
}) {
    return (
        <div>
            <label className="mb-1.5 block text-xs font-medium text-waify-text dark:text-waify-dark-text">{label}</label>
            <select
                value={value || 'RETAIL'}
                onChange={(event) => onChange(event.target.value)}
                className="w-full rounded-card border border-waify-border bg-white px-3 py-2 text-sm text-waify-text shadow-sm dark:border-waify-dark-border dark:bg-slate-900 dark:text-waify-dark-text"
            >
                {BUSINESS_VERTICALS.map((vertical) => (
                    <option key={vertical.value} value={vertical.value}>
                        {vertical.label}
                    </option>
                ))}
            </select>
            <InputError message={error} className="mt-1" />
        </div>
    );
}

const BUSINESS_VERTICALS = [
    { value: 'AUTO', label: 'Automotive' },
    { value: 'BEAUTY', label: 'Beauty, spa and salon' },
    { value: 'APPAREL', label: 'Clothing and apparel' },
    { value: 'EDU', label: 'Education' },
    { value: 'ENTERTAIN', label: 'Entertainment' },
    { value: 'EVENT_PLAN', label: 'Event planning' },
    { value: 'FINANCE', label: 'Finance and banking' },
    { value: 'GROCERY', label: 'Grocery' },
    { value: 'GOVT', label: 'Government' },
    { value: 'HOTEL', label: 'Hotel and lodging' },
    { value: 'HEALTH', label: 'Healthcare' },
    { value: 'NONPROFIT', label: 'Nonprofit' },
    { value: 'PROF_SERVICES', label: 'Professional services' },
    { value: 'RETAIL', label: 'Retail' },
    { value: 'TRAVEL', label: 'Travel and transportation' },
    { value: 'RESTAURANT', label: 'Restaurant' },
    { value: 'NOT_A_BIZ', label: 'Not a business' },
    { value: 'OTHER', label: 'Other' },
];
