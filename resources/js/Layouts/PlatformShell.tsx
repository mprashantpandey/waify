import { ReactNode, useState, useEffect } from 'react';
import { Link, usePage } from '@inertiajs/react';
import { Topbar } from '@/Components/Layout/Topbar';
import { BrandingWrapper } from '@/Components/Branding/BrandingWrapper';
import { Toaster } from '@/Components/UI/Toaster';
import { GlobalFlashHandler } from '@/Components/Notifications/GlobalFlashHandler';
import PlatformLiveChatWidget from '@/Components/Support/PlatformLiveChatWidget';
import { 
    LayoutDashboard, 
    Building2, 
    Users, 
    Settings,
    Shield,
    Menu,
    X,
    CreditCard,
    FileText,
    BarChart3,
    Activity,
    LifeBuoy,
    Puzzle
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface PlatformShellProps {
    children: ReactNode;
    auth?: {
        user?: {
            name: string;
            email: string;
            is_super_admin?: boolean;
        } | null;
    };
}

export default function PlatformShell({ children, auth }: PlatformShellProps) {
    const { branding, ziggy } = usePage().props as any;
    const platformName = branding?.platform_name || 'Platform';
    const logoUrl = branding?.logo_url;
    const currentRoute = window.location.pathname;
    const [sidebarOpen, setSidebarOpen] = useState(false);

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

    const navigation = [
        {
            name: 'Dashboard',
            href: route('platform.dashboard'),
            icon: LayoutDashboard,
        },
        {
            name: 'Workspaces',
            href: route('platform.workspaces.index'),
            icon: Building2,
        },
        {
            name: 'Users',
            href: route('platform.users.index'),
            icon: Users,
        },
        {
            name: 'Plans',
            href: route('platform.plans.index'),
            icon: CreditCard,
        },
        {
            name: 'Modules',
            href: route('platform.modules.index'),
            icon: Puzzle,
        },
        {
            name: 'Subscriptions',
            href: route('platform.subscriptions.index'),
            icon: FileText,
        },
        {
            name: 'Analytics',
            href: route('platform.analytics'),
            icon: BarChart3,
        },
        {
            name: 'Templates',
            href: route('platform.templates.index'),
            icon: FileText,
        },
        {
            name: 'Support',
            href: route('platform.support.hub'),
            icon: LifeBuoy,
        },
        {
            name: 'Activity Logs',
            href: route('platform.activity-logs'),
            icon: Activity,
        },
        {
            name: 'System Health',
            href: route('platform.system-health'),
            icon: Shield,
        },
        {
            name: 'Settings',
            href: route('platform.settings'),
            icon: Settings,
        },
    ];

    const sidebarContent = (
        <div className="flex flex-col h-full">
            {/* Logo */}
            <div className="flex items-center justify-between h-16 px-6 border-b border-gray-200 dark:border-gray-800">
                {logoUrl ? (
                    <img src={logoUrl} alt={platformName} className="h-8 w-auto" />
                ) : (
                    <div className="flex items-center gap-2">
                        <Shield className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                        <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                            {platformName}
                        </h1>
                    </div>
                )}
                {/* Mobile close button */}
                <button
                    onClick={() => setSidebarOpen(false)}
                    className="lg:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
                >
                    <X className="h-5 w-5 text-gray-700 dark:text-gray-300" />
                </button>
            </div>

                    {/* Navigation */}
                    <nav className="flex-1 px-4 py-4 space-y-1">
                        {navigation.map((item) => {
                            const Icon = item.icon;
                            const isActive = currentRoute.startsWith(item.href);
                            
                            return (
                                <Link
                                    key={item.name}
                                    href={item.href}
                                    className={cn(
                                        'flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                                        isActive
                                            ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'
                                            : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                                    )}
                                >
                                    <Icon className="h-5 w-5" />
                                    {item.name}
                                </Link>
                            );
                        })}
                    </nav>

                    {/* User info */}
                    <div className="p-4 border-t border-gray-200 dark:border-gray-800">
                        <div className="flex items-center gap-3">
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                                    {auth?.user?.name}
                                </p>
                                <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                                    {auth?.user?.email}
                                </p>
                            </div>
                        </div>
                        <Link
                            href={route('profile.edit')}
                            className="mt-2 block text-xs text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100"
                        >
                            Profile Settings
                        </Link>
                    </div>
                </div>
    );

    return (
        <BrandingWrapper>
            <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
                {/* Mobile sidebar overlay */}
                {sidebarOpen && (
                    <div
                        className="lg:hidden fixed inset-0 z-40 bg-black/50 transition-opacity"
                        onClick={() => setSidebarOpen(false)}
                    />
                )}

                {/* Mobile sidebar */}
                <aside
                    className={cn(
                        'lg:hidden fixed inset-y-0 left-0 z-50 w-64 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 transform transition-transform duration-300 ease-in-out',
                        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
                    )}
                >
                    {sidebarContent}
                </aside>

                {/* Desktop sidebar */}
                <aside className="hidden lg:flex lg:flex-col lg:w-64 lg:fixed lg:inset-y-0 lg:z-30 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800">
                    {sidebarContent}
                </aside>

                {/* Main content */}
                <div className="lg:pl-64">
                    <Topbar
                        workspace={null}
                        workspaces={[]}
                        user={auth?.user || null}
                        onMenuClick={() => setSidebarOpen(!sidebarOpen)}
                    />
                    <main className="p-4 lg:p-6">{children}</main>
                </div>
            </div>
            <Toaster />
            <GlobalFlashHandler />
            <PlatformLiveChatWidget />
        </BrandingWrapper>
    );
}
