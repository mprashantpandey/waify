import { useEffect, useState, useRef } from 'react';
import { useForm, router } from '@inertiajs/react';
import AppShell from '@/Layouts/AppShell';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/Components/UI/Card';
import Button from '@/Components/UI/Button';
import TextInput from '@/Components/TextInput';
import InputLabel from '@/Components/InputLabel';
import InputError from '@/Components/InputError';
import { ArrowLeft, CheckCircle2, Loader2, AlertCircle, Link as LinkIcon, Sparkles, Phone, Key, Shield, Zap } from 'lucide-react';
import { Link, Head } from '@inertiajs/react';
import { useToast } from '@/hooks/useNotifications';
import { Progress } from '@/Components/UI/Progress';
import { Badge } from '@/Components/UI/Badge';
import { Alert } from '@/Components/UI/Alert';

declare global {
    interface Window {
        FB?: any;
        fbAsyncInit?: () => void;
    }
}

type WizardStep = 'init' | 'auth' | 'code-exchange' | 'waba-lookup' | 'phone-lookup' | 'subscribe' | 'register' | 'complete' | 'error';

interface WizardState {
    step: WizardStep;
    progress: number;
    message: string;
    error?: string;
    data: {
        code?: string;
        accessToken?: string;
        wabaId?: string;
        phoneNumberId?: string;
        businessPhone?: string;
    };
}

export default function EmbeddedWizard({
    account,
    embeddedSignup,
    defaultApiVersion}: {
    account: any;
    embeddedSignup: { enabled?: boolean; appId?: string; configId?: string; apiVersion?: string; oauthRedirectUri?: string | null };
    defaultApiVersion: string;
}) {
    const { toast } = useToast();
    const [embeddedReady, setEmbeddedReady] = useState(false);
    const [wizardState, setWizardState] = useState<WizardState>({
        step: 'init',
        progress: 0,
        message: 'Ready to start',
        data: {}});
    const messageHandlerRef = useRef<((event: MessageEvent) => void) | null>(null);

    const embeddedForm = useForm({
        name: '',
        waba_id: '',
        phone_number_id: '',
        business_phone: '',
        access_token: '',
        code: '',
        pin: '',
        redirect_uri: ''});

    // Initialize Meta SDK
    useEffect(() => {
        if (embeddedSignup?.enabled === false) {
            setWizardState(prev => ({
                ...prev,
                step: 'error',
                error: 'Embedded Signup is disabled by your platform administrator.'}));
            return;
        }

        if (!embeddedSignup?.appId || !embeddedSignup?.configId) {
            setWizardState(prev => ({
                ...prev,
                step: 'error',
                error: 'Embedded Signup is not configured yet. Please contact support or use manual setup.'}));
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
            setWizardState(prev => ({
                ...prev,
                step: 'init',
                message: 'Meta SDK loaded. Click "Start Setup" to begin.'}));
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
            script.async = true;
            script.defer = true;
            document.body.appendChild(script);
        }
    }, [embeddedSignup?.enabled, embeddedSignup?.appId, embeddedSignup?.configId, embeddedSignup?.apiVersion]);

    // Enhanced postMessage handler with better parsing
    useEffect(() => {
        if (!embeddedSignup?.enabled || !embeddedSignup?.appId) return;

        const handler = (event: MessageEvent) => {
            // Security: Only accept messages from Facebook domains
            const allowedOrigins = [
                'https://www.facebook.com',
                'https://facebook.com',
                'https://web.facebook.com',
                'https://business.facebook.com',
            ];

            if (!allowedOrigins.some(origin => event.origin.includes(origin.replace('https://', '')))) {
                return;
            }

            let payload: any = event.data;
            
            // Handle string payloads
            if (typeof payload === 'string') {
                try {
                    payload = JSON.parse(payload);
                } catch {
                    // Try to extract data from iframe postMessage format
                    if (payload.includes('waba_id') || payload.includes('phone_number_id')) {
                        try {
                            const match = payload.match(/\{.*\}/);
                            if (match) {
                                payload = JSON.parse(match[0]);
                            }
                        } catch {
                            return;
                        }
                    } else {
                        return;
                    }
                }
            }

            // Handle different payload structures
            const action = payload?.event || payload?.type || payload?.action || payload?.status;
            const data = payload?.data || payload?.payload || payload?.result || payload;

            // Handle Embedded Signup completion events
            if (action === 'FINISH' || action === 'COMPLETE' || action === 'SUCCESS' || 
                data?.waba_id || data?.phone_number_id || payload?.waba_id || payload?.phone_number_id) {
                
                const extractedData = {
                    waba_id: data?.waba_id || payload?.waba_id || data?.wabaId || payload?.wabaId,
                    phone_number_id: data?.phone_number_id || payload?.phone_number_id || data?.phoneNumberId || payload?.phoneNumberId,
                    business_phone: data?.business_phone || payload?.business_phone || 
                                  data?.display_phone_number || payload?.display_phone_number ||
                                  data?.businessPhone || payload?.businessPhone};

                if (extractedData.waba_id || extractedData.phone_number_id) {
                    setWizardState(prev => ({
                        ...prev,
                        step: 'waba-lookup',
                        progress: 60,
                        message: 'Received signup data from Meta',
                        data: {
                            ...prev.data,
                            ...extractedData}}));

                    // Auto-fill form
                    if (extractedData.waba_id) {
                        embeddedForm.setData('waba_id', extractedData.waba_id);
                    }
                    if (extractedData.phone_number_id) {
                        embeddedForm.setData('phone_number_id', extractedData.phone_number_id);
                    }
                    if (extractedData.business_phone) {
                        embeddedForm.setData('business_phone', extractedData.business_phone);
                    }

                    toast.success('Signup data received from Meta');
                }
            }

            // Handle OAuth code/access token
            if (data?.code || payload?.code || data?.accessToken || payload?.accessToken) {
                const code = data?.code || payload?.code;
                const accessToken = data?.accessToken || payload?.accessToken || data?.access_token || payload?.access_token;

                if (code) {
                    embeddedForm.setData('code', code);
                    setWizardState(prev => ({
                        ...prev,
                        step: 'code-exchange',
                        progress: 30,
                        message: 'Authorization code received',
                        data: {
                            ...prev.data,
                            code}}));
                }

                if (accessToken) {
                    embeddedForm.setData('access_token', accessToken);
                    setWizardState(prev => ({
                        ...prev,
                        step: 'code-exchange',
                        progress: 40,
                        message: 'Access token received',
                        data: {
                            ...prev.data,
                            accessToken}}));
                }
            }
        };

        messageHandlerRef.current = handler;
        window.addEventListener('message', handler);

        return () => {
            if (messageHandlerRef.current) {
                window.removeEventListener('message', messageHandlerRef.current);
            }
        };
    }, [embeddedSignup?.appId, toast]);

    const startWizard = () => {
        if (!embeddedReady || !window.FB) {
            toast.error('Meta SDK not ready. Please wait...');
            return;
        }

        const oauthRedirectUri = embeddedSignup?.oauthRedirectUri || window.location.origin + window.location.pathname;

        setWizardState({
            step: 'auth',
            progress: 10,
            message: 'Starting Meta authorization...',
            data: {}});

        embeddedForm.setData('redirect_uri', oauthRedirectUri);

        window.FB.login(
            (response: any) => {
                if (response?.authResponse) {
                    const code = response.authResponse.code;
                    const accessToken = response.authResponse.accessToken;

                    if (code) {
                        embeddedForm.setData('code', code);
                        setWizardState(prev => ({
                            ...prev,
                            step: 'code-exchange',
                            progress: 30,
                            message: 'Authorization code received. Exchanging for access token...',
                            data: {
                                ...prev.data,
                                code}}));
                    }

                    if (accessToken) {
                        embeddedForm.setData('access_token', accessToken);
                        setWizardState(prev => ({
                            ...prev,
                            step: 'code-exchange',
                            progress: 40,
                            message: 'Access token received',
                            data: {
                                ...prev.data,
                                accessToken}}));
                    }

                    if (code || accessToken) {
                        toast.success('Authorization successful');
                    } else {
                        setWizardState(prev => ({
                            ...prev,
                            step: 'error',
                            error: 'Authorization response missing code or access token'}));
                    }
                } else {
                    setWizardState(prev => ({
                        ...prev,
                        step: 'error',
                        error: 'Login was cancelled or did not fully authorize'}));
                    toast.error('Authorization cancelled');
                }
            },
            {
                config_id: embeddedSignup.configId,
                redirect_uri: oauthRedirectUri,
                response_type: 'code',
                override_default_response_type: true,
                scope: 'whatsapp_business_management,whatsapp_business_messaging,business_management'}
        );
    };

    const submitEmbedded: React.FormEventHandler = (e) => {
        e.preventDefault();

        if (!embeddedForm.data.code && !embeddedForm.data.access_token) {
            toast.error('Please complete the authorization step first');
            return;
        }

        setWizardState(prev => ({
            ...prev,
            step: 'complete',
            progress: 90,
            message: 'Creating connection...'}));

        embeddedForm.post(route('app.whatsapp.connections.store-embedded', {}), {
            onSuccess: () => {
                setWizardState(prev => ({
                    ...prev,
                    step: 'complete',
                    progress: 100,
                    message: 'Connection created successfully!'}));
            },
            onError: (errors) => {
                setWizardState(prev => ({
                    ...prev,
                    step: 'error',
                    error: (errors as any)?.embedded || 'Failed to create connection'}));
                toast.error('Failed to create connection');
            }});
    };

    const getStepIcon = (step: WizardStep) => {
        switch (step) {
            case 'init':
                return <Sparkles className="h-5 w-5" />;
            case 'auth':
            case 'code-exchange':
                return <Key className="h-5 w-5" />;
            case 'waba-lookup':
            case 'phone-lookup':
                return <Phone className="h-5 w-5" />;
            case 'subscribe':
            case 'register':
                return <Shield className="h-5 w-5" />;
            case 'complete':
                return <CheckCircle2 className="h-5 w-5" />;
            case 'error':
                return <AlertCircle className="h-5 w-5" />;
            default:
                return <Zap className="h-5 w-5" />;
        }
    };

    const getStepColor = (step: WizardStep) => {
        if (step === 'error') return 'from-red-500 to-red-600';
        if (step === 'complete') return 'from-green-500 to-green-600';
        return 'from-blue-500 to-blue-600';
    };

    return (
        <AppShell>
            <Head title="Embedded Signup Wizard" />
            <div className="space-y-8">
                <div>
                    <Link
                        href={route('app.whatsapp.connections.create', {})}
                        className="inline-flex items-center gap-2 text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors mb-4"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        Back to Create Connection
                    </Link>
                    <div>
                        <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-gray-100 dark:to-gray-300 bg-clip-text text-transparent">
                            Embedded Signup Wizard
                        </h1>
                        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                            Guided setup for connecting your WhatsApp Business Account via Meta
                        </p>
                    </div>
                </div>

                {/* Progress Tracker */}
                <Card className="border-0 shadow-lg">
                    <CardHeader className="bg-gradient-to-r from-emerald-50 to-emerald-100 dark:from-emerald-900/20 dark:to-emerald-800/20">
                        <div className="flex items-center gap-3">
                            <div className={`p-2 bg-gradient-to-br ${getStepColor(wizardState.step)} rounded-xl`}>
                                {getStepIcon(wizardState.step)}
                            </div>
                            <div className="flex-1">
                                <CardTitle className="text-xl font-bold">Setup Progress</CardTitle>
                                <CardDescription>{wizardState.message}</CardDescription>
                            </div>
                            <Badge variant={wizardState.step === 'complete' ? 'success' : wizardState.step === 'error' ? 'danger' : 'default'} className="px-3 py-1">
                                {Math.round(wizardState.progress)}%
                            </Badge>
                        </div>
                    </CardHeader>
                    <CardContent className="p-6 space-y-4">
                        <Progress value={wizardState.progress} variant={wizardState.step === 'error' ? 'danger' : 'default'} className="h-3" />
                        
                        {wizardState.error && (
                            <Alert variant="error" className="border-red-200 dark:border-red-800">
                                <AlertCircle className="h-5 w-5" />
                                <div>
                                    <p className="font-semibold text-red-800 dark:text-red-200 mb-1">Error</p>
                                    <p className="text-sm text-red-600 dark:text-red-400">{wizardState.error}</p>
                                </div>
                            </Alert>
                        )}

                        {/* Step Indicators */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-6">
                            {[
                                { key: 'auth', label: 'Authorize', icon: Key },
                                { key: 'code-exchange', label: 'Exchange', icon: Sparkles },
                                { key: 'waba-lookup', label: 'Lookup', icon: Phone },
                                { key: 'complete', label: 'Complete', icon: CheckCircle2 },
                            ].map(({ key, label, icon: Icon }) => {
                                const isActive = wizardState.step === key;
                                const isCompleted = ['waba-lookup', 'phone-lookup', 'subscribe', 'register', 'complete'].includes(wizardState.step) && 
                                                  ['auth', 'code-exchange', 'waba-lookup'].includes(key);
                                const isPending = !isActive && !isCompleted;

                                return (
                                    <div
                                        key={key}
                                        className={`p-4 rounded-xl border-2 transition-all ${
                                            isActive
                                                ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                                                : isCompleted
                                                ? 'border-green-500 bg-green-50 dark:bg-green-900/20'
                                                : 'border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800'
                                        }`}
                                    >
                                        <div className="flex items-center gap-2 mb-1">
                                            {isCompleted ? (
                                                <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" />
                                            ) : isActive ? (
                                                <Loader2 className="h-4 w-4 text-blue-600 dark:text-blue-400 animate-spin" />
                                            ) : (
                                                <Icon className="h-4 w-4 text-gray-400" />
                                            )}
                                            <span className={`text-xs font-semibold ${
                                                isActive ? 'text-blue-700 dark:text-blue-300' :
                                                isCompleted ? 'text-green-700 dark:text-green-300' :
                                                'text-gray-500 dark:text-gray-400'
                                            }`}>
                                                {label}
                                            </span>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </CardContent>
                </Card>

                {/* Main Form */}
                <Card className="border-0 shadow-lg">
                    <CardHeader className="bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-blue-500 rounded-xl">
                                <LinkIcon className="h-5 w-5 text-white" />
                            </div>
                            <div>
                                <CardTitle className="text-xl font-bold">Connection Details</CardTitle>
                                <CardDescription>Complete the setup to create your WhatsApp connection</CardDescription>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="p-6 space-y-6">
                        {/* Step 1: Start Authorization */}
                        {wizardState.step === 'init' && (
                            <div className="text-center py-8">
                                <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-emerald-100 to-emerald-200 dark:from-emerald-900/20 dark:to-emerald-800/20 mb-6">
                                    <Sparkles className="h-10 w-10 text-emerald-600 dark:text-emerald-400" />
                                </div>
                                <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
                                    Ready to Start
                                </h3>
                                <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-md mx-auto">
                                    Click the button below to begin the Meta Embedded Signup process. 
                                    You'll be guided through authorization and connection setup.
                                </p>
                                <Button
                                    onClick={startWizard}
                                    disabled={!embeddedReady}
                                    className="bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 shadow-lg shadow-emerald-500/50 rounded-xl px-8"
                                >
                                    {!embeddedReady ? (
                                        <>
                                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                            Loading Meta SDK...
                                        </>
                                    ) : (
                                        <>
                                            <Sparkles className="h-4 w-4 mr-2" />
                                            Start Setup
                                        </>
                                    )}
                                </Button>
                            </div>
                        )}

                        {/* Step 2: Authorization in progress */}
                        {(wizardState.step === 'auth' || wizardState.step === 'code-exchange') && (
                            <div className="text-center py-8">
                                <Loader2 className="h-12 w-12 text-blue-600 dark:text-blue-400 animate-spin mx-auto mb-4" />
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                                    {wizardState.step === 'auth' ? 'Authorizing with Meta...' : 'Exchanging authorization code...'}
                                </h3>
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                    {wizardState.message}
                                </p>
                            </div>
                        )}

                        {/* Step 3: Form for connection details */}
                        {['waba-lookup', 'phone-lookup', 'subscribe', 'register'].includes(wizardState.step) && (
                            <form onSubmit={submitEmbedded} className="space-y-5">
                                <div>
                                    <InputLabel htmlFor="wizard_name" value="Connection Name" className="text-sm font-semibold mb-2" />
                                    <TextInput
                                        id="wizard_name"
                                        type="text"
                                        value={embeddedForm.data.name}
                                        className="mt-1 block w-full rounded-xl"
                                        onChange={(e) => embeddedForm.setData('name', e.target.value)}
                                        placeholder="My Meta WhatsApp Connection"
                                    />
                                    <InputError message={(embeddedForm.errors as any)?.name} className="mt-2" />
                                </div>

                                <div className="grid md:grid-cols-2 gap-4">
                                    <div>
                                        <InputLabel htmlFor="wizard_waba" value="WABA ID" className="text-sm font-semibold mb-2" />
                                        <TextInput
                                            id="wizard_waba"
                                            type="text"
                                            value={embeddedForm.data.waba_id}
                                            className="mt-1 block w-full rounded-xl font-mono"
                                            onChange={(e) => embeddedForm.setData('waba_id', e.target.value)}
                                            placeholder="Auto-filled after signup"
                                            readOnly={!!wizardState.data.wabaId}
                                        />
                                        {wizardState.data.wabaId && (
                                            <p className="mt-1 text-xs text-green-600 dark:text-green-400 flex items-center gap-1">
                                                <CheckCircle2 className="h-3 w-3" />
                                                Auto-detected from Meta
                                            </p>
                                        )}
                                    </div>
                                    <div>
                                        <InputLabel htmlFor="wizard_phone_id" value="Phone Number ID" className="text-sm font-semibold mb-2" />
                                        <TextInput
                                            id="wizard_phone_id"
                                            type="text"
                                            value={embeddedForm.data.phone_number_id}
                                            className="mt-1 block w-full rounded-xl font-mono"
                                            onChange={(e) => embeddedForm.setData('phone_number_id', e.target.value)}
                                            placeholder="Auto-filled after signup"
                                            readOnly={!!wizardState.data.phoneNumberId}
                                        />
                                        {wizardState.data.phoneNumberId && (
                                            <p className="mt-1 text-xs text-green-600 dark:text-green-400 flex items-center gap-1">
                                                <CheckCircle2 className="h-3 w-3" />
                                                Auto-detected from Meta
                                            </p>
                                        )}
                                    </div>
                                </div>

                                <div>
                                    <InputLabel htmlFor="wizard_business_phone" value="Business Phone (Optional)" className="text-sm font-semibold mb-2" />
                                    <TextInput
                                        id="wizard_business_phone"
                                        type="text"
                                        value={embeddedForm.data.business_phone}
                                        className="mt-1 block w-full rounded-xl"
                                        onChange={(e) => embeddedForm.setData('business_phone', e.target.value)}
                                        placeholder="+1234567890"
                                        readOnly={!!wizardState.data.businessPhone}
                                    />
                                    {wizardState.data.businessPhone && (
                                        <p className="mt-1 text-xs text-green-600 dark:text-green-400 flex items-center gap-1">
                                            <CheckCircle2 className="h-3 w-3" />
                                            Auto-detected from Meta
                                        </p>
                                    )}
                                </div>

                                <div>
                                    <InputLabel htmlFor="wizard_pin" value="Registration PIN (Optional)" className="text-sm font-semibold mb-2" />
                                    <TextInput
                                        id="wizard_pin"
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

                                <div className="flex items-center justify-end gap-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                                    <Button
                                        type="submit"
                                        disabled={embeddedForm.processing || !embeddedForm.data.code && !embeddedForm.data.access_token}
                                        className="bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 shadow-lg shadow-emerald-500/40 rounded-xl"
                                    >
                                        {embeddedForm.processing ? (
                                            <>
                                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                                Creating...
                                            </>
                                        ) : (
                                            <>
                                                <CheckCircle2 className="h-4 w-4 mr-2" />
                                                Create Connection
                                            </>
                                        )}
                                    </Button>
                                </div>
                            </form>
                        )}

                        {/* Step 4: Complete */}
                        {wizardState.step === 'complete' && wizardState.progress === 100 && (
                            <div className="text-center py-8">
                                <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-green-100 to-green-200 dark:from-green-900/20 dark:to-green-800/20 mb-6">
                                    <CheckCircle2 className="h-10 w-10 text-green-600 dark:text-green-400" />
                                </div>
                                <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
                                    Connection Created Successfully!
                                </h3>
                                <p className="text-gray-600 dark:text-gray-400 mb-6">
                                    Your WhatsApp connection has been set up and is ready to use.
                                </p>
                                <Link href={route('app.whatsapp.connections.index', { })}>
                                    <Button className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 shadow-lg shadow-blue-500/50 rounded-xl">
                                        View Connections
                                    </Button>
                                </Link>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </AppShell>
    );
}
