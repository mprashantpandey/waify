import AppShell from '@/Layouts/AppShell';
import { Card, CardContent } from '@/Components/UI/Card';
import { Tabs, TabsList, TabsTrigger, TabsContent, useTabs } from '@/Components/UI/Tabs';
import { User, CreditCard, Bell, Shield, Inbox, ChevronRight, CheckCircle2, AlertTriangle, Sparkles } from 'lucide-react';
import ProfileTab from './Tabs/ProfileTab';
import BillingTab from './Tabs/BillingTab';
import SecurityTab from './Tabs/SecurityTab';
import NotificationsTab from './Tabs/NotificationsTab';
import InboxTab from './Tabs/InboxTab';
import { Head, usePage } from '@inertiajs/react';
import { useEffect, useMemo } from 'react';

export default function SettingsIndex() {
    const { props } = usePage() as any;
    const { value: activeTab, setValue: setActiveTab } = useTabs('profile');
    const authUser = props.auth?.user;
    const account = props.account;

    const tabs = [
        {
            id: 'profile',
            label: 'Profile',
            icon: User,
            description: 'Identity, contact details, and phone verification',
            component: <ProfileTab />},
        {
            id: 'billing',
            label: 'Billing',
            icon: CreditCard,
            description: 'Plans, usage, invoices, and payment history',
            component: <BillingTab />},
        {
            id: 'security',
            label: 'Security',
            icon: Shield,
            description: 'Password, sessions, 2FA, and security status',
            component: <SecurityTab />},
        {
            id: 'notifications',
            label: 'Notifications',
            icon: Bell,
            description: 'Assignment, mentions, and sound preferences',
            component: <NotificationsTab />},
        {
            id: 'inbox',
            label: 'Inbox',
            icon: Inbox,
            description: 'Routing and auto-assignment behavior',
            component: <InboxTab />},
    ];
    const tabMap = useMemo(() => Object.fromEntries(tabs.map((t) => [t.id, t])), [tabs]);
    const activeTabMeta = tabMap[activeTab] ?? tabs[0];
    const ActiveTabIcon = activeTabMeta.icon;

    useEffect(() => {
        if (typeof window === 'undefined') return;
        const tabFromUrl = new URLSearchParams(window.location.search).get('tab');
        if (tabFromUrl && tabMap[tabFromUrl]) {
            setActiveTab(tabFromUrl);
        }
    }, [setActiveTab, tabMap]);

    useEffect(() => {
        if (typeof window === 'undefined') return;
        const url = new URL(window.location.href);
        url.searchParams.set('tab', activeTab);
        window.history.replaceState({}, '', url.toString());
    }, [activeTab]);

    const quickChecks = [
        {
            label: 'Email verification',
            ok: Boolean(props.emailVerified),
            text: props.emailVerified ? 'Verified' : 'Pending',
        },
        {
            label: 'Phone verification',
            ok: !account?.phone_verification_required || Boolean(authUser?.phone_verified_at),
            text: account?.phone_verification_required
                ? (authUser?.phone_verified_at ? 'Verified (required)' : 'Required')
                : (authUser?.phone_verified_at ? 'Verified' : 'Optional'),
        },
        {
            label: '2FA',
            ok: Boolean(props.twoFactor?.enabled),
            text: props.twoFactor?.enabled ? 'Enabled' : (props.securityPolicy?.require_2fa ? 'Required by policy' : 'Not enabled'),
        },
    ];

    return (
        <AppShell>
            <Head title="Settings" />
            <div className="space-y-8">
                <div className="rounded-2xl border border-gray-200/70 bg-gradient-to-br from-white via-blue-50/30 to-indigo-50/50 p-6 shadow-sm dark:border-gray-700 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800">
                    <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                        <div>
                            <div className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700 dark:border-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
                                <Sparkles className="h-3.5 w-3.5" />
                                Tenant Settings
                            </div>
                            <h1 className="mt-3 text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-gray-100 dark:to-gray-300 bg-clip-text text-transparent">
                                Settings
                            </h1>
                            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                                Manage profile, security, notifications, inbox routing, and billing access for your account.
                            </p>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 min-w-0 lg:min-w-[440px]">
                            {quickChecks.map((item) => (
                                <div key={item.label} className="rounded-xl border border-gray-200 bg-white/80 p-3 dark:border-gray-700 dark:bg-gray-900/60">
                                    <div className="flex items-center gap-2 text-xs font-medium text-gray-600 dark:text-gray-400">
                                        {item.ok ? (
                                            <CheckCircle2 className="h-3.5 w-3.5 text-green-600" />
                                        ) : (
                                            <AlertTriangle className="h-3.5 w-3.5 text-amber-600" />
                                        )}
                                        {item.label}
                                    </div>
                                    <div className={`mt-1 text-sm font-semibold ${item.ok ? 'text-gray-900 dark:text-gray-100' : 'text-amber-700 dark:text-amber-300'}`}>
                                        {item.text}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                <Tabs value={activeTab} onValueChange={setActiveTab}>
                    <div className="grid grid-cols-1 xl:grid-cols-[280px_minmax(0,1fr)] gap-6 items-start">
                        <Card className="border-0 shadow-lg xl:sticky xl:top-20">
                            <CardContent className="p-4">
                                <div className="mb-3 px-2 text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                                    Navigation
                                </div>

                                <div className="xl:hidden">
                                    <TabsList className="w-full justify-start p-2 border border-gray-200 dark:border-gray-700 overflow-x-auto bg-gray-50 dark:bg-gray-900">
                                        {tabs.map((tab) => {
                                            const Icon = tab.icon;
                                            return (
                                                <TabsTrigger
                                                    key={tab.id}
                                                    value={tab.id}
                                                    className="rounded-xl px-3 py-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-blue-600 data-[state=active]:text-white"
                                                >
                                                    <Icon className="h-4 w-4 mr-2" />
                                                    {tab.label}
                                                </TabsTrigger>
                                            );
                                        })}
                                    </TabsList>
                                </div>

                                <div className="hidden xl:flex flex-col gap-2">
                                    {tabs.map((tab) => {
                                        const Icon = tab.icon;
                                        const isActive = activeTab === tab.id;

                                        return (
                                            <button
                                                key={tab.id}
                                                type="button"
                                                onClick={() => setActiveTab(tab.id)}
                                                className={`w-full rounded-xl border p-3 text-left transition ${
                                                    isActive
                                                        ? 'border-blue-200 bg-blue-50 shadow-sm dark:border-blue-800 dark:bg-blue-900/20'
                                                        : 'border-transparent hover:border-gray-200 hover:bg-gray-50 dark:hover:border-gray-700 dark:hover:bg-gray-800/60'
                                                }`}
                                            >
                                                <div className="flex items-start gap-3">
                                                    <div className={`mt-0.5 rounded-lg p-2 ${isActive ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300'}`}>
                                                        <Icon className="h-4 w-4" />
                                                    </div>
                                                    <div className="min-w-0 flex-1">
                                                        <div className="flex items-center justify-between gap-2">
                                                            <p className={`text-sm font-semibold ${isActive ? 'text-blue-900 dark:text-blue-200' : 'text-gray-900 dark:text-gray-100'}`}>
                                                                {tab.label}
                                                            </p>
                                                            <ChevronRight className={`h-4 w-4 ${isActive ? 'text-blue-600' : 'text-gray-400'}`} />
                                                        </div>
                                                        <p className="mt-1 text-xs text-gray-600 dark:text-gray-400">
                                                            {tab.description}
                                                        </p>
                                                    </div>
                                                </div>
                                            </button>
                                        );
                                    })}
                                </div>
                            </CardContent>
                        </Card>

                        <div className="space-y-4">
                            <Card className="border-0 shadow-lg">
                                <CardContent className="p-5">
                                    <div className="flex items-start gap-3">
                                        <div className="rounded-xl bg-blue-500 p-2 text-white">
                                            <ActiveTabIcon className="h-5 w-5" />
                                        </div>
                                        <div>
                                            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                                                {activeTabMeta.label}
                                            </h2>
                                            <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                                                {activeTabMeta.description}
                                            </p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {tabs.map((tab) => (
                                <TabsContent key={tab.id} value={tab.id} className="m-0">
                                    {tab.component}
                                </TabsContent>
                            ))}
                        </div>
                    </div>
                </Tabs>
            </div>
        </AppShell>
    );
}
