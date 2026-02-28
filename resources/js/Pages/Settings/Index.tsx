import AppShell from '@/Layouts/AppShell';
import { Card, CardContent } from '@/Components/UI/Card';
import { Tabs, TabsList, TabsTrigger, TabsContent, useTabs } from '@/Components/UI/Tabs';
import { User, CreditCard, Bell, Shield, Inbox, CheckCircle2, AlertTriangle } from 'lucide-react';
import ProfileTab from './Tabs/ProfileTab';
import BillingTab from './Tabs/BillingTab';
import SecurityTab from './Tabs/SecurityTab';
import NotificationsTab from './Tabs/NotificationsTab';
import InboxTab from './Tabs/InboxTab';
import { Head, usePage } from '@inertiajs/react';
import { useEffect, useMemo } from 'react';

type TabDef = {
    id: string;
    label: string;
    icon: any;
    description: string;
    component: JSX.Element;
};

function getInitialTab(validIds: string[], fallback: string): string {
    if (typeof window === 'undefined') return fallback;
    const fromQuery = new URLSearchParams(window.location.search).get('tab') || '';
    return validIds.includes(fromQuery) ? fromQuery : fallback;
}

export default function SettingsIndex() {
    const { props } = usePage() as any;

    const tabs: TabDef[] = [
        { id: 'profile', label: 'Profile', icon: User, description: 'Account identity, email, phone, and phone verification.', component: <ProfileTab /> },
        { id: 'security', label: 'Security', icon: Shield, description: 'Password, sessions, email verification, and 2FA.', component: <SecurityTab /> },
        { id: 'notifications', label: 'Notifications', icon: Bell, description: 'Personal alerts for assignments, mentions, and sounds.', component: <NotificationsTab /> },
        { id: 'inbox', label: 'Inbox', icon: Inbox, description: 'Tenant inbox routing and auto-assignment settings.', component: <InboxTab /> },
        { id: 'billing', label: 'Billing', icon: CreditCard, description: 'Subscription, usage, payment history, and transactions.', component: <BillingTab /> },
    ];

    const tabIds = tabs.map((t) => t.id);
    const { value: activeTab, setValue: setActiveTab } = useTabs(getInitialTab(tabIds, 'profile'));
    const activeTabDef = tabs.find((t) => t.id === activeTab) ?? tabs[0];
    const ActiveIcon = activeTabDef.icon;

    useEffect(() => {
        if (typeof window === 'undefined') return;
        const url = new URL(window.location.href);
        if (url.searchParams.get('tab') === activeTab) return;
        url.searchParams.set('tab', activeTab);
        window.history.replaceState({}, '', url.toString());
    }, [activeTab]);

    const quickChecks = useMemo(() => {
        const authUser = props.auth?.user;
        const account = props.account;

        return [
            {
                label: 'Email',
                ok: Boolean(props.emailVerified),
                value: props.emailVerified ? 'Verified' : 'Pending verification',
            },
            {
                label: 'Phone',
                ok: !account?.phone_verification_required || Boolean(authUser?.phone_verified_at),
                value: account?.phone_verification_required
                    ? (authUser?.phone_verified_at ? 'Verified (required)' : 'Verification required')
                    : (authUser?.phone_verified_at ? 'Verified' : 'Optional'),
            },
            {
                label: '2FA',
                ok: Boolean(props.twoFactor?.enabled),
                value: props.twoFactor?.enabled
                    ? 'Enabled'
                    : (props.securityPolicy?.require_2fa ? 'Required by policy' : 'Not enabled'),
            },
        ];
    }, [props]);

    return (
        <AppShell>
            <Head title="Settings" />

            <div className="space-y-6">
                <Card className="border-0 shadow-sm">
                    <CardContent className="p-5 sm:p-6">
                        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                            <div>
                                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-100">
                                    Settings
                                </h1>
                                <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                                    Manage your account profile, security, notifications, inbox routing, and billing access.
                                </p>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 w-full lg:w-auto lg:min-w-0 lg:max-w-[560px]">
                                {quickChecks.map((item) => (
                                    <div key={item.label} className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-2.5">
                                        <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                                            {item.ok ? (
                                                <CheckCircle2 className="h-3.5 w-3.5 text-green-600" />
                                            ) : (
                                                <AlertTriangle className="h-3.5 w-3.5 text-amber-600" />
                                            )}
                                            {item.label}
                                        </div>
                                        <div className={`mt-1 text-sm font-semibold ${item.ok ? 'text-gray-900 dark:text-gray-100' : 'text-amber-700 dark:text-amber-300'}`}>
                                            {item.value}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Tabs value={activeTab} onValueChange={setActiveTab}>
                    <div className="grid grid-cols-1 xl:grid-cols-[260px_minmax(0,1fr)] gap-6 items-start">
                        <Card className="border-0 shadow-sm xl:sticky xl:top-20">
                            <CardContent className="p-3">
                                <div className="xl:hidden">
                                    <TabsList className="w-full h-auto justify-start gap-2 p-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 overflow-x-auto whitespace-nowrap">
                                        {tabs.map((tab) => {
                                            const Icon = tab.icon;
                                            return (
                                                <TabsTrigger
                                                    key={tab.id}
                                                    value={tab.id}
                                                    className="shrink-0 rounded-lg px-3 py-2 text-sm data-[state=active]:bg-blue-600 data-[state=active]:text-white"
                                                >
                                                    <Icon className="h-4 w-4 mr-2" />
                                                    {tab.label}
                                                </TabsTrigger>
                                            );
                                        })}
                                    </TabsList>
                                </div>

                                <div className="hidden xl:block space-y-1">
                                    {tabs.map((tab) => {
                                        const Icon = tab.icon;
                                        const isActive = tab.id === activeTab;
                                        return (
                                            <button
                                                key={tab.id}
                                                type="button"
                                                onClick={() => setActiveTab(tab.id)}
                                                className={`w-full rounded-xl px-3 py-3 text-left transition border ${
                                                    isActive
                                                        ? 'border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-900/20'
                                                        : 'border-transparent hover:border-gray-200 hover:bg-gray-50 dark:hover:border-gray-700 dark:hover:bg-gray-800/60'
                                                }`}
                                            >
                                                <div className="flex items-start gap-3">
                                                    <div className={`rounded-lg p-2 ${isActive ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300'}`}>
                                                        <Icon className="h-4 w-4" />
                                                    </div>
                                                    <div className="min-w-0">
                                                        <div className={`text-sm font-semibold ${isActive ? 'text-blue-900 dark:text-blue-200' : 'text-gray-900 dark:text-gray-100'}`}>
                                                            {tab.label}
                                                        </div>
                                                        <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400 leading-5">
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
                            <Card className="border-0 shadow-sm">
                                <CardContent className="p-4 sm:p-5">
                                    <div className="flex items-center gap-3">
                                        <div className="rounded-lg bg-blue-600 p-2 text-white">
                                            <ActiveIcon className="h-4 w-4" />
                                        </div>
                                        <div>
                                            <div className="text-base font-semibold text-gray-900 dark:text-gray-100">
                                                {activeTabDef.label}
                                            </div>
                                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                                {activeTabDef.description}
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
