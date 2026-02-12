import { Link, usePage } from '@inertiajs/react';
import { 
    LayoutDashboard, 
    Puzzle, 
    MessageCircle, 
    FileText, 
    Inbox, 
    Bot, 
    Sparkles, 
    Zap, 
    BarChart3, 
    CreditCard,
    LifeBuoy,
    Settings,
    Users,
    Activity,
    Megaphone,
    LucideIcon,
    Menu,
    X
} from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/utils';

const iconMap: Record<string, LucideIcon> = {
    LayoutDashboard,
    Puzzle,
    MessageCircle,
    FileText,
    Inbox,
    Bot,
    Sparkles,
    Zap,
    BarChart3,
    CreditCard,
    LifeBuoy,
    Settings,
    Users,
    Activity,
    Megaphone};

interface NavItem {
    label: string;
    href: string;
    icon: string;
    group?: string;
}

interface SidebarProps {
    navigation: NavItem[];
    currentRoute: string;
    account: { slug: string } | null;
    isOpen?: boolean;
    onClose?: () => void;
}

export function Sidebar({ navigation, currentRoute, account, isOpen = false, onClose }: SidebarProps) {
    const { branding } = usePage().props as any;
    const platformName = branding?.platform_name || 'WACP';
    const logoUrl = branding?.logo_url;

    const groupedNav = navigation.reduce((acc, item) => {
        const group = item.group || 'other';
        if (!acc[group]) {
            acc[group] = [];
        }
        acc[group].push(item);
        return acc;
    }, {} as Record<string, NavItem[]>);

    const groupLabels: Record<string, string> = {
        core: 'Core',
        messaging: 'Messaging',
        automation: 'Automation',
        ai: 'AI',
        growth: 'Growth',
        billing: 'Billing'};

    const tryRouteHref = (routeName: string): string | null => {
        try {
            return route(routeName, { });
        } catch (error) {
            return null;
        }
    };

    const resolveRouteHref = (routeName: string): string | null => {
        const direct = tryRouteHref(routeName);
        if (direct) {
            return direct;
        }

        // Backward/forward compatible route-name fallback: app.foo <-> app.foo.index
        if (routeName.endsWith('.index')) {
            return tryRouteHref(routeName.slice(0, -'.index'.length));
        }

        return tryRouteHref(`${routeName}.index`);
    };

    const renderNavItem = (item: NavItem, index: number) => {
        const Icon = iconMap[item.icon] || LayoutDashboard;
        
        // Try to generate the route
        let href = '#';
        if (account) {
            const resolved = resolveRouteHref(item.href);
            if (!resolved) {
                // Route doesn't exist (e.g., stale cached route names)
                return null;
            }
            href = resolved;
        } else {
            // No account, can't generate route - skip this item
            return null;
        }
        
        const isActive = currentRoute.includes(item.href.replace('app.', ''));

        return (
            <Link
                key={`${item.href}-${item.label}-${index}`}
                href={href}
                className={cn(
                    'flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 group',
                    isActive
                        ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg shadow-blue-500/50'
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 hover:translate-x-1'
                )}
            >
                <Icon className={cn(
                    'h-5 w-5 transition-transform duration-200',
                    isActive ? 'text-white' : 'text-gray-500 dark:text-gray-400 group-hover:text-blue-600 dark:group-hover:text-blue-400',
                    !isActive && 'group-hover:scale-110'
                )} />
                <span className={cn(
                    isActive ? 'font-semibold' : 'font-medium'
                )}>{item.label}</span>
            </Link>
        );
    };

    const sidebarContent = (
        <nav className="flex-1 overflow-y-auto p-6 space-y-8">
                {Object.entries(groupedNav).map(([group, items]) => {
                    // Filter out null items and check if group has any valid items
                    const validItems = items.map(renderNavItem).filter((item) => item !== null);
                    
                    // Don't render empty groups
                    if (validItems.length === 0) {
                        return null;
                    }
                    
                    return (
                        <div key={group}>
                            {groupLabels[group] && (
                                <h3 className="px-4 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">
                                    {groupLabels[group]}
                                </h3>
                            )}
                            <div className="space-y-1.5">
                                {validItems}
                            </div>
                        </div>
                    );
                }).filter(Boolean)}
        </nav>
    );

    return (
        <>
            {/* Mobile sidebar overlay */}
            {isOpen && (
                <div
                    className="lg:hidden fixed inset-0 z-40 bg-black/60 backdrop-blur-sm transition-opacity"
                    onClick={onClose}
                />
            )}

            {/* Mobile sidebar */}
            <aside
                className={cn(
                    'lg:hidden fixed inset-y-0 left-0 z-50 w-72 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 transform transition-transform duration-300 ease-in-out shadow-2xl',
                    isOpen ? 'translate-x-0' : '-translate-x-full'
                )}
            >
                <div className="flex items-center justify-between h-16 px-6 border-b border-gray-200 dark:border-gray-800 bg-gradient-to-r from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
                    {logoUrl ? (
                        <img src={logoUrl} alt={platformName} className="h-8 w-auto" />
                    ) : (
                        <h2 className="text-lg font-bold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-gray-100 dark:to-gray-300 bg-clip-text text-transparent">
                            {platformName}
                        </h2>
                    )}
                    <button
                        onClick={onClose}
                        className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                        aria-label="Close sidebar"
                    >
                        <X className="h-5 w-5 text-gray-700 dark:text-gray-300" aria-hidden />
                    </button>
                </div>
                {sidebarContent}
            </aside>

            {/* Desktop sidebar */}
            <aside className="hidden lg:flex lg:flex-col lg:w-72 lg:fixed lg:inset-y-0 lg:z-30 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 shadow-lg">
                <div className="flex items-center h-16 px-6 border-b border-gray-200 dark:border-gray-800 bg-gradient-to-r from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
                    {logoUrl ? (
                        <img src={logoUrl} alt={platformName} className="h-8 w-auto" />
                    ) : (
                        <h2 className="text-lg font-bold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-gray-100 dark:to-gray-300 bg-clip-text text-transparent">
                            {platformName}
                        </h2>
                    )}
                </div>
                {sidebarContent}
            </aside>
        </>
    );
}
