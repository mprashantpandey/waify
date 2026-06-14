import { Head, useForm, usePage } from '@inertiajs/react';
import { useEffect, useState, type FormEvent } from 'react';
import {
    Bot,
    Building2,
    CreditCard,
    HardDrive,
    Mail,
    Palette,
    Radio,
    Save,
    Shield,
    ToggleLeft,
    Webhook,
    XCircle,
} from 'lucide-react';
import PlatformShell from '@/Layouts/PlatformShell';
import Button from '@/Components/UI/Button';
import { Badge } from '@/Components/UI/Badge';
import { Card, CardContent } from '@/Components/UI/Card';
import MisconfiguredSettingsAlert from '@/Components/Platform/MisconfiguredSettingsAlert';
import { useNotifications } from '@/hooks/useNotifications';
import { cn } from '@/lib/utils';
import GeneralTab from './Settings/Tabs/GeneralTab';
import SecurityTab from './Settings/Tabs/SecurityTab';
import PaymentTab from './Settings/Tabs/PaymentTab';
import IntegrationsTab from './Settings/Tabs/IntegrationsTab';
import FeaturesTab from './Settings/Tabs/FeaturesTab';
import PusherTab from './Settings/Tabs/PusherTab';
import MailTab from './Settings/Tabs/MailTab';
import StorageTab from './Settings/Tabs/StorageTab';
import BrandingTab from './Settings/Tabs/BrandingTab';
import AiTab from './Settings/Tabs/AiTab';

export default function PlatformSettings({
    pusher,
    mail,
    storage,
    general,
    security,
    payment,
    integrations,
    analytics,
    compliance,
    performance,
    features,
    branding,
    ai,
    whatsapp,
    misconfigured_settings,
}: any) {
    const { auth } = usePage().props as any;
    const { confirm, toast } = useNotifications();

    const getInitialTab = () => {
        if (typeof window !== 'undefined') {
            const urlParams = new URLSearchParams(window.location.search);
            return urlParams.get('tab') || 'general';
        }
        return 'general';
    };

    const { data, setData: setFormData, post, processing, errors } = useForm({
        general: general || {},
        security: security || {},
        payment: payment || {},
        integrations: integrations || {},
        analytics: analytics || {},
        compliance: compliance || {},
        performance: performance || {},
        features: features || {},
        pusher: pusher || {},
        mail: mail || {},
        storage: storage || {},
        branding: branding || {},
        ai: ai || {},
        whatsapp: whatsapp || {},
    });

    const [activeTab, setActiveTab] = useState(getInitialTab());

    useEffect(() => {
        if (typeof window === 'undefined') return;
        const urlParams = new URLSearchParams(window.location.search);
        const tabFromUrl = urlParams.get('tab');
        if (tabFromUrl && tabFromUrl !== activeTab) {
            setActiveTab(tabFromUrl);
        }
    }, [activeTab, setActiveTab]);

    const switchTab = (tab: string) => {
        setActiveTab(tab);
        if (typeof window !== 'undefined') {
            const url = new URL(window.location.href);
            url.searchParams.set('tab', tab);
            window.history.replaceState({}, '', url.toString());
        }
    };

    const setData = (key: string, value: any) => {
        if (!key.includes('.')) {
            setFormData(key as any, value);
            return;
        }

        const [group, field] = key.split('.', 2);
        const currentGroup = ((data as any)[group] || {}) as Record<string, any>;
        setFormData(group as any, {
            ...currentGroup,
            [field]: value,
        });
    };

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();

        const currentPayment = payment || {};
        const newPayment = data.payment || {};

        if (currentPayment.razorpay_enabled && !newPayment.razorpay_enabled) {
            const confirmed = await confirm({
                title: 'Disable Razorpay?',
                message: 'You are about to disable Razorpay. This will prevent users from making payments.',
                variant: 'warning',
            });

            if (!confirmed) return;
        }

        post(route('platform.settings.update'), {
            preserveScroll: false,
            forceFormData: true,
            only: ['general', 'security', 'payment', 'integrations', 'analytics', 'compliance', 'performance', 'features', 'pusher', 'mail', 'storage', 'branding', 'ai', 'whatsapp', 'flash'],
            onError: (formErrors) => {
                const errorMessages = Object.values(formErrors).flat();
                toast.error(
                    'Error saving settings',
                    errorMessages.length > 0 ? String(errorMessages[0]) : 'Failed to save settings. Please try again.'
                );
            },
        });
    };

    const tabs = [
        { id: 'general', label: 'General', icon: Building2 },
        { id: 'branding', label: 'Branding', icon: Palette },
        { id: 'security', label: 'Security', icon: Shield },
        { id: 'payment', label: 'Payment', icon: CreditCard },
        { id: 'integrations', label: 'Integrations', icon: Webhook },
        { id: 'features', label: 'Features', icon: ToggleLeft },
        { id: 'mail', label: 'Mail', icon: Mail },
        { id: 'pusher', label: 'Pusher', icon: Radio },
        { id: 'ai', label: 'AI', icon: Bot },
        { id: 'storage', label: 'Storage', icon: HardDrive },
    ];

    const active = tabs.find((tab) => tab.id === activeTab) || tabs[0];

    const renderActiveTab = () => {
        switch (active.id) {
            case 'general':
                return <GeneralTab data={data} setData={setData} errors={errors} />;
            case 'branding':
                return <BrandingTab data={data} setData={setData} errors={errors} />;
            case 'security':
                return <SecurityTab data={data} setData={setData} errors={errors} />;
            case 'payment':
                return <PaymentTab data={data} setData={setData} errors={errors} />;
            case 'integrations':
                return <IntegrationsTab data={data} setData={setData} errors={errors} />;
            case 'features':
                return <FeaturesTab data={data} setData={setData} errors={errors} />;
            case 'pusher':
                return <PusherTab data={data} setData={setData} errors={errors} />;
            case 'ai':
                return <AiTab data={data} setData={setData} errors={errors} />;
            case 'mail':
                return <MailTab data={data} setData={setData} errors={errors} />;
            case 'storage':
                return <StorageTab data={data} setData={setData} errors={errors} />;
            default:
                return null;
        }
    };

    return (
        <PlatformShell auth={auth}>
            <Head title="Platform Settings" />

            <div className="mx-auto w-full max-w-[1400px] space-y-5">
                <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                        <h1 className="mt-2 text-2xl font-bold text-waify-text dark:text-waify-dark-text">Platform settings</h1>
                    </div>
                    <Badge variant="success">Production</Badge>
                </div>

                {misconfigured_settings && misconfigured_settings.length > 0 && (
                    <MisconfiguredSettingsAlert misconfiguredSettings={misconfigured_settings} variant="settings" />
                )}

                {Object.keys(errors).length > 0 && (
                    <div className="rounded-card border border-red-200 bg-red-50 p-4 dark:border-red-400/25 dark:bg-red-500/10">
                        <div className="flex items-start gap-3">
                            <XCircle className="mt-0.5 h-5 w-5 shrink-0 text-red-600 dark:text-red-300" />
                            <div className="min-w-0 flex-1">
                                <h3 className="text-sm font-semibold text-red-800 dark:text-red-100">Validation errors</h3>
                                <ul className="mt-2 list-inside list-disc space-y-1 text-sm text-red-700 dark:text-red-200">
                                    {Object.entries(errors).map(([key, messages]) => (
                                        <li key={key}>{Array.isArray(messages) ? messages.join(', ') : String(messages)}</li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    </div>
                )}

                <div className="grid gap-6 lg:grid-cols-[280px_minmax(0,1fr)]">
                    <nav className="min-w-0">
                        <Card className="p-2 lg:sticky lg:top-6 lg:max-h-[calc(100vh-9rem)] lg:overflow-hidden">
                            <div className="waify-scrollbar flex gap-1 overflow-x-auto pb-1 lg:max-h-[calc(100vh-10rem)] lg:flex-col lg:overflow-y-auto lg:overflow-x-hidden lg:pb-0">
                                {tabs.map((tab) => {
                                    const Icon = tab.icon;
                                    const isActive = active.id === tab.id;
                                    return (
                                        <button
                                            key={tab.id}
                                            type="button"
                                            onClick={() => switchTab(tab.id)}
                                            className={cn(
                                                'flex shrink-0 items-center gap-3 rounded-btn px-3 py-2.5 text-left transition lg:w-full',
                                                isActive
                                                    ? 'bg-waify-green-soft text-waify-green-dark dark:bg-emerald-950/40 dark:text-emerald-300'
                                                    : 'text-waify-text-muted hover:bg-gray-50 hover:text-waify-text dark:text-waify-dark-text-muted dark:hover:bg-slate-700/50 dark:hover:text-waify-dark-text'
                                            )}
                                        >
                                            <span
                                                className={cn(
                                                    'flex h-8 w-8 shrink-0 items-center justify-center rounded-lg',
                                                    isActive ? 'bg-white/80 dark:bg-waify-dark-surface' : 'bg-gray-100 dark:bg-waify-dark-surface-2'
                                                )}
                                            >
                                                <Icon className="h-4 w-4" />
                                            </span>
                                            <span className="hidden min-w-0 sm:block">
                                                <span className="block truncate text-sm font-medium">{tab.label}</span>
                                            </span>
                                        </button>
                                    );
                                })}
                            </div>
                        </Card>
                    </nav>

                    <div className="min-w-0">
                        <Card className="overflow-hidden">
                            <div className="border-b border-gray-100 bg-gray-50/50 px-6 py-4 dark:border-waify-dark-border dark:bg-waify-dark-surface-2/50">
                                <h2 className="text-lg font-semibold text-waify-text dark:text-waify-dark-text">{active.label}</h2>
                            </div>
                            <form onSubmit={handleSubmit}>
                                <CardContent className="p-6">
                                    {renderActiveTab()}
                                </CardContent>
                                <div className="flex justify-end gap-2 border-t border-gray-100 bg-gray-50/60 px-6 py-4 dark:border-waify-dark-border dark:bg-waify-dark-surface-2/60">
                                    <Button type="button" variant="ghost" onClick={() => window.location.reload()}>
                                        Cancel
                                    </Button>
                                    <Button type="submit" disabled={processing}>
                                        <Save className="h-4 w-4" />
                                        {processing ? 'Saving...' : 'Save changes'}
                                    </Button>
                                </div>
                            </form>
                        </Card>
                    </div>
                </div>
            </div>
        </PlatformShell>
    );
}
