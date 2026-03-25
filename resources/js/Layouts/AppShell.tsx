import { ReactNode, useState, useEffect } from 'react';
import { usePage } from '@inertiajs/react';
import { Sidebar } from '@/Components/Layout/Sidebar';
import { Topbar } from '@/Components/Layout/Topbar';
import { Toaster } from '@/Components/UI/Toaster';
import { BrandingWrapper } from '@/Components/Branding/BrandingWrapper';
import { GlobalFlashHandler } from '@/Components/Notifications/GlobalFlashHandler';
import ProfileIncompleteModal from '@/Components/Profile/ProfileIncompleteModal';
import AnalyticsScripts from '@/Components/Analytics/AnalyticsScripts';
import CookieConsentBanner from '@/Components/Compliance/CookieConsentBanner';
import { ContextualGuide } from '@/Components/Layout/ContextualGuide';

interface AppShellProps {
    children: ReactNode;
}

export default function AppShell({ children }: AppShellProps) {
    const { account, navigation, auth, ziggy } = usePage().props as any;
    const currentRoute = window.location.pathname;
    const [sidebarOpen, setSidebarOpen] = useState(false);

    useEffect(() => {
        setSidebarOpen(false);
    }, [currentRoute]);

    useEffect(() => {
        if (ziggy) {
            (window as any).Ziggy = ziggy;
        }
    }, [ziggy]);

    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth >= 1024) {
                setSidebarOpen(false);
            }
        };
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    return (
        <BrandingWrapper>
            <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950">
                <Sidebar
                    navigation={navigation || []}
                    currentRoute={currentRoute}
                    account={account}
                    isOpen={sidebarOpen}
                    onClose={() => setSidebarOpen(false)}
                />
                <div className="lg:pl-80">
                    <Topbar user={auth?.user} onMenuClick={() => setSidebarOpen(!sidebarOpen)} />
                    <ContextualGuide />
                    <main className="mx-auto w-full max-w-[1600px] px-4 py-5 lg:px-8 lg:py-8">
                        {children}
                    </main>
                </div>
                <Toaster />
                <GlobalFlashHandler />
                <ProfileIncompleteModal />
                <CookieConsentBanner />
                <AnalyticsScripts />
            </div>
        </BrandingWrapper>
    );
}
