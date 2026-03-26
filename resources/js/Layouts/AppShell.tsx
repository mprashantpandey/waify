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
            <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
                <Sidebar
                    navigation={navigation || []}
                    currentRoute={currentRoute}
                    account={account}
                    isOpen={sidebarOpen}
                    onClose={() => setSidebarOpen(false)}
                />
                <div className="lg:pl-64">
                    <Topbar user={auth?.user} onMenuClick={() => setSidebarOpen(!sidebarOpen)} />
                    <main className="mx-auto w-full max-w-[1320px] px-4 py-4 lg:px-6 lg:py-5">
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
