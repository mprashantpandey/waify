import { usePage, useForm } from '@inertiajs/react';
import { useState, useEffect } from 'react';
import PlatformShell from '@/Layouts/PlatformShell';
import Button from '@/Components/UI/Button';
import { Tabs, TabsList, TabsTrigger, TabsContent, useTabs } from '@/Components/UI/Tabs';
import { Save, Radio, Mail, HardDrive, Globe, Shield, CreditCard, Webhook, BarChart3, Scale, Zap, ToggleLeft, Palette, Bot, LifeBuoy, AlertCircle, CheckCircle, XCircle, MessageSquare, Clock3 } from 'lucide-react';
import MisconfiguredSettingsAlert from '@/Components/Platform/MisconfiguredSettingsAlert';
import { useToast } from '@/hooks/useToast';
import { useNotifications } from '@/hooks/useNotifications';
import GeneralTab from './Settings/Tabs/GeneralTab';
import SecurityTab from './Settings/Tabs/SecurityTab';
import PaymentTab from './Settings/Tabs/PaymentTab';
import IntegrationsTab from './Settings/Tabs/IntegrationsTab';
import AnalyticsTab from './Settings/Tabs/AnalyticsTab';
import ComplianceTab from './Settings/Tabs/ComplianceTab';
import PerformanceTab from './Settings/Tabs/PerformanceTab';
import FeaturesTab from './Settings/Tabs/FeaturesTab';
import PusherTab from './Settings/Tabs/PusherTab';
import MailTab from './Settings/Tabs/MailTab';
import StorageTab from './Settings/Tabs/StorageTab';
import BrandingTab from './Settings/Tabs/BrandingTab';
import AiTab from './Settings/Tabs/AiTab';
import SupportTab from './Settings/Tabs/SupportTab';
import CronTab from './Settings/Tabs/CronTab';

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
    support,
    cron,
    misconfigured_settings}: any) {
    const { auth, flash } = usePage().props as any;
    
    // Get initial tab from URL query parameter or default to 'general'
    const getInitialTab = () => {
        if (typeof window !== 'undefined') {
            const urlParams = new URLSearchParams(window.location.search);
            return urlParams.get('tab') || 'general';
        }
        return 'general';
    };
    
    const { value: activeTab, setValue: setActiveTab } = useTabs(getInitialTab());
    
    // Update tab when URL query changes
    useEffect(() => {
        if (typeof window !== 'undefined') {
            const urlParams = new URLSearchParams(window.location.search);
            const tabFromUrl = urlParams.get('tab');
            if (tabFromUrl && tabFromUrl !== activeTab) {
                setActiveTab(tabFromUrl);
            }
        }
    }, [activeTab, setActiveTab]);
    const { addToast } = useToast();
    const { confirm } = useNotifications();

    const { data, setData, post, processing, errors } = useForm({
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
        support: support || {}});

    // Show toast notifications for flash messages
    useEffect(() => {
        if (flash?.success) {
            addToast({
                title: 'Success',
                description: flash.success,
                variant: 'success'});
        }
        if (flash?.error) {
            addToast({
                title: 'Error',
                description: flash.error,
                variant: 'error'});
        }
        if (flash?.warning) {
            addToast({
                title: 'Warning',
                description: flash.warning,
                variant: 'warning'});
        }
    }, [flash, addToast]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        // Check if Razorpay is being disabled
        const currentPayment = payment || {};
        const newPayment = data.payment || {};
        
        if (currentPayment.razorpay_enabled && !newPayment.razorpay_enabled) {
            const confirmed = await confirm({
                title: 'Disable Razorpay?',
                message: 'You are about to disable Razorpay. This will prevent users from making payments. Are you sure?',
                variant: 'warning'});
            
            if (!confirmed) {
                return;
            }
        }
        
        post(route('platform.settings.update'), {
            preserveScroll: false,
            forceFormData: true, // Required for file uploads
            only: ['general', 'security', 'payment', 'integrations', 'analytics', 'compliance', 'performance', 'features', 'pusher', 'mail', 'storage', 'branding', 'ai', 'whatsapp', 'support', 'flash'],
            onSuccess: () => {
                addToast({
                    title: 'Settings Saved',
                    description: 'All settings have been updated successfully.',
                    variant: 'success'});
            },
            onError: (errors) => {
                const errorMessages = Object.values(errors).flat();
                addToast({
                    title: 'Error Saving Settings',
                    description: errorMessages.length > 0 ? errorMessages[0] : 'Failed to save settings. Please try again.',
                    variant: 'error'});
            }});
    };

    const tabs = [
        { id: 'general', label: 'General', icon: Globe },
        { id: 'support', label: 'Support', icon: LifeBuoy },
        { id: 'branding', label: 'Branding', icon: Palette },
        { id: 'security', label: 'Security', icon: Shield },
        { id: 'payment', label: 'Payment', icon: CreditCard },
        { id: 'integrations', label: 'Integrations', icon: Webhook },
        { id: 'analytics', label: 'Analytics', icon: BarChart3 },
        { id: 'compliance', label: 'Compliance', icon: Scale },
        { id: 'performance', label: 'Performance', icon: Zap },
        { id: 'cron', label: 'Cron', icon: Clock3 },
        { id: 'features', label: 'Features', icon: ToggleLeft },
        { id: 'ai', label: 'AI', icon: Bot },
        { id: 'pusher', label: 'Pusher', icon: Radio },
        { id: 'mail', label: 'Mail', icon: Mail },
        { id: 'storage', label: 'Storage', icon: HardDrive },
    ];

    return (
        <PlatformShell auth={auth}>
            <div className="space-y-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Platform Settings</h1>
                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                        Configure all platform-wide settings and integrations
                    </p>
                </div>

                {/* Misconfiguration Alerts */}
                {misconfigured_settings && misconfigured_settings.length > 0 && (
                    <MisconfiguredSettingsAlert 
                        misconfiguredSettings={misconfigured_settings}
                        variant="settings"
                    />
                )}

                {/* Error Messages */}
                {Object.keys(errors).length > 0 && (
                    <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                        <div className="flex items-start gap-3">
                            <XCircle className="h-5 w-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
                            <div className="flex-1">
                                <h3 className="text-sm font-semibold text-red-800 dark:text-red-200 mb-1">
                                    Validation Errors
                                </h3>
                                <ul className="list-disc list-inside text-sm text-red-700 dark:text-red-300 space-y-1">
                                    {Object.entries(errors).map(([key, messages]) => (
                                        <li key={key}>
                                            {Array.isArray(messages) ? messages.join(', ') : messages}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    </div>
                )}

                <Tabs value={activeTab} onValueChange={setActiveTab}>
                    <TabsList className="w-full justify-start mb-6 overflow-x-auto">
                        {tabs.map((tab) => {
                            const Icon = tab.icon;
                            return (
                                <TabsTrigger key={tab.id} value={tab.id}>
                                    <Icon className="h-4 w-4 mr-2" />
                                    {tab.label}
                                </TabsTrigger>
                            );
                        })}
                    </TabsList>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <TabsContent value="general">
                            <GeneralTab data={data} setData={setData} errors={errors} />
                        </TabsContent>

                        <TabsContent value="support">
                            <SupportTab data={data} setData={setData} errors={errors} />
                        </TabsContent>

                        <TabsContent value="branding">
                            <BrandingTab data={data} setData={setData} errors={errors} />
                        </TabsContent>

                        <TabsContent value="security">
                            <SecurityTab data={data} setData={setData} errors={errors} />
                        </TabsContent>

                        <TabsContent value="payment">
                            <PaymentTab data={data} setData={setData} errors={errors} />
                        </TabsContent>

                        <TabsContent value="integrations">
                            <IntegrationsTab data={data} setData={setData} errors={errors} />
                        </TabsContent>

                        <TabsContent value="analytics">
                            <AnalyticsTab data={data} setData={setData} errors={errors} />
                        </TabsContent>

                        <TabsContent value="compliance">
                            <ComplianceTab data={data} setData={setData} errors={errors} />
                        </TabsContent>

                        <TabsContent value="performance">
                            <PerformanceTab data={data} setData={setData} errors={errors} />
                        </TabsContent>

                        <TabsContent value="features">
                            <FeaturesTab data={data} setData={setData} errors={errors} />
                        </TabsContent>

                        <TabsContent value="cron">
                            <CronTab cron={cron} />
                        </TabsContent>

                        <TabsContent value="pusher">
                            <PusherTab data={data} setData={setData} errors={errors} />
                        </TabsContent>

                        <TabsContent value="ai">
                            <AiTab data={data} setData={setData} errors={errors} />
                        </TabsContent>

                        <TabsContent value="mail">
                            <MailTab data={data} setData={setData} errors={errors} />
                        </TabsContent>

                        <TabsContent value="storage">
                            <StorageTab data={data} setData={setData} errors={errors} />
                        </TabsContent>

                        <div className="flex items-center justify-end gap-4 pt-6 border-t border-gray-200 dark:border-gray-800">
                            <Button type="submit" disabled={processing}>
                                <Save className="h-4 w-4 mr-2" />
                                {processing ? 'Saving...' : 'Save All Settings'}
                            </Button>
                        </div>
                    </form>
                </Tabs>
            </div>
        </PlatformShell>
    );
}
