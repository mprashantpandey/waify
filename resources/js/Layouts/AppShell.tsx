import { ReactNode, useState, useEffect } from 'react';
import { usePage } from '@inertiajs/react';
import { Sidebar } from '@/Components/Layout/Sidebar';
import { Topbar } from '@/Components/Layout/Topbar';
import { BrandingWrapper } from '@/Components/Branding/BrandingWrapper';
import AnalyticsScripts from '@/Components/Analytics/AnalyticsScripts';
import CookieConsentBanner from '@/Components/Compliance/CookieConsentBanner';
import RealtimeInboxAlerts from '@/Components/Notifications/RealtimeInboxAlerts';

interface AppShellProps {
    children: ReactNode;
    fullscreen?: boolean;
}

export default function AppShell({ children, fullscreen = false }: AppShellProps) {
    const { account, navigation, auth, ziggy } = usePage().props as any;
    const currentRoute = window.location.pathname;
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

    // Close sidebar when route changes on mobile
    useEffect(() => {
        setSidebarOpen(false);
    }, [currentRoute]);

    useEffect(() => {
        if (ziggy) {
            (window as any).Ziggy = ziggy;
        }
    }, [ziggy]);

    // Close sidebar on window resize to desktop
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
            <div className="flex h-[100dvh] overflow-hidden bg-waify-bg text-waify-text dark:bg-waify-dark-bg dark:text-waify-dark-text">
                {!fullscreen && (
                    <Sidebar
                        navigation={navigation || []}
                        currentRoute={currentRoute}
                        account={account}
                        isOpen={sidebarOpen}
                        onClose={() => setSidebarOpen(false)}
                        onCollapseChange={setSidebarCollapsed}
                    />
                )}
                <div className={`flex-1 flex flex-col min-w-0 transition-[padding] duration-300 ${fullscreen ? '' : (sidebarCollapsed ? 'lg:pl-16' : 'lg:pl-60')}`}>
                    {!fullscreen && (
                        <Topbar
                            user={auth?.user}
                            onMenuClick={() => setSidebarOpen(!sidebarOpen)}
                        />
                    )}
                    <main className={fullscreen ? 'flex-1 overflow-hidden' : 'waify-scrollbar flex-1 overflow-y-auto p-4 lg:p-6'}>{children}</main>
                </div>
                <CookieConsentBanner />
                <AnalyticsScripts />
                <RealtimeInboxAlerts />
            </div>
        </BrandingWrapper>
    );
}
