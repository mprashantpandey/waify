import { useState } from 'react';
import { usePage } from '@inertiajs/react';
import AppShell from '@/Layouts/AppShell';
import { Card, CardContent } from '@/Components/UI/Card';
import { Tabs, TabsList, TabsTrigger, TabsContent, useTabs } from '@/Components/UI/Tabs';
import { User, Building2, CreditCard, Bell, Shield, Settings as SettingsIcon } from 'lucide-react';
import ProfileTab from './Tabs/ProfileTab';
import WorkspaceTab from './Tabs/WorkspaceTab';
import BillingTab from './Tabs/BillingTab';
import SecurityTab from './Tabs/SecurityTab';
import NotificationsTab from './Tabs/NotificationsTab';
import { Head } from '@inertiajs/react';

export default function SettingsIndex() {
    const { workspace, auth } = usePage().props as any;
    const { value: activeTab, setValue: setActiveTab } = useTabs('profile');

    const tabs = [
        {
            id: 'profile',
            label: 'Profile',
            icon: User,
            component: <ProfileTab />,
        },
        {
            id: 'workspace',
            label: 'Workspace',
            icon: Building2,
            component: <WorkspaceTab workspace={workspace} />,
            requiresWorkspace: true,
        },
        {
            id: 'billing',
            label: 'Billing',
            icon: CreditCard,
            component: <BillingTab workspace={workspace} />,
            requiresWorkspace: true,
        },
        {
            id: 'security',
            label: 'Security',
            icon: Shield,
            component: <SecurityTab />,
        },
        {
            id: 'notifications',
            label: 'Notifications',
            icon: Bell,
            component: <NotificationsTab />,
        },
    ].filter((tab) => !tab.requiresWorkspace || workspace);

    return (
        <AppShell>
            <Head title="Settings" />
            <div className="space-y-8">
                <div>
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-gray-100 dark:to-gray-300 bg-clip-text text-transparent">
                        Settings
                    </h1>
                    <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                        Manage your account and workspace settings
                    </p>
                </div>

                <Card className="border-0 shadow-lg">
                    <CardContent className="p-0">
                        <Tabs value={activeTab} onValueChange={setActiveTab}>
                            <TabsList className="w-full justify-start p-4 border-b border-gray-200 dark:border-gray-700 overflow-x-auto bg-gradient-to-r from-gray-50 to-white dark:from-gray-800 dark:to-gray-900">
                                {tabs.map((tab) => {
                                    const Icon = tab.icon;
                                    return (
                                        <TabsTrigger 
                                            key={tab.id} 
                                            value={tab.id}
                                            className="rounded-xl px-4 py-2.5 data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-blue-600 data-[state=active]:text-white"
                                        >
                                            <Icon className="h-4 w-4 mr-2" />
                                            {tab.label}
                                        </TabsTrigger>
                                    );
                                })}
                            </TabsList>

                            {tabs.map((tab) => (
                                <TabsContent key={tab.id} value={tab.id} className="p-6">
                                    {tab.component}
                                </TabsContent>
                            ))}
                        </Tabs>
                    </CardContent>
                </Card>
            </div>
        </AppShell>
    );
}
