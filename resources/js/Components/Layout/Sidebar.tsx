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
    Building2,
    List,
    Tag,
    FolderOpen,
    Layers,
    Workflow,
    Wrench,
    Layout,
    Link2,
    CalendarRange,
    Plug,
    HelpCircle,
    Shield,
    Code2,
    History,
    ShoppingBag,
    Target,
    Calendar,
    ClipboardList,
    ExternalLink,
    Image,
    ChevronsUpDown,
    LucideIcon,
    Radio,
    Bell,
    Store,
    PhoneCall,
    GitBranch,
    X,
    ChevronLeft,
    ChevronRight
} from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/utils';
import BrandLogo from '@/Components/Branding/BrandLogo';

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
    Megaphone,
    Building2,
    List,
    Tag,
    FolderOpen,
    Layers,
    Workflow,
    Wrench,
    Layout,
    Link2,
    CalendarRange,
    Plug,
    HelpCircle,
    Shield,
    Code2,
    History,
    ShoppingBag,
    Target,
    Calendar,
    ClipboardList,
    ExternalLink,
    Image,
    Radio,
    Bell,
    Store,
    PhoneCall,
    GitBranch,
    ChevronsUpDown};

interface NavItem {
    label: string;
    href: string;
    icon: string;
    group?: string;
}

interface SidebarProps {
    navigation: NavItem[];
    currentRoute: string;
    account: {
        slug?: string;
        name?: string;
        plan?: { name?: string } | null;
        subscription?: { plan?: { name?: string } | null } | null;
        workspace_type_label?: string | null;
        workspace_type?: string | null;
    } | null;
    isOpen?: boolean;
    onClose?: () => void;
    onCollapseChange?: (collapsed: boolean) => void;
}

interface NavSection {
    label: string;
    items: NavItem[];
}

const sectionOrder = [
    'Main',
    'CRM & Sales',
    'Grow',
    'Tools & Widgets',
    'Connect',
    'Inbox tools',
    'Support',
    'Platform',
    'Workspace',
];

const navPlacement: Record<string, { section: string; order: number; icon?: string; label?: string }> = {
    'app.dashboard': { section: 'Main', order: 10, icon: 'LayoutDashboard', label: 'Dashboard' },
    'app.whatsapp.conversations.index': { section: 'Main', order: 20, icon: 'MessageCircle', label: 'Inbox' },
    'app.whatsapp.templates.index': { section: 'Main', order: 30, icon: 'FileText', label: 'Templates' },
    'app.broadcasts.index': { section: 'Main', order: 40, icon: 'Megaphone', label: 'Campaigns' },
    'app.billing.index': { section: 'Main', order: 50, icon: 'CreditCard', label: 'Billing' },
    'app.whatsapp.connections.index': { section: 'Main', order: 60, icon: 'Link2', label: 'WABA Account' },
    'app.contacts.index': { section: 'Main', order: 70, icon: 'Users', label: 'Contacts' },
    'app.contacts.segments.index': { section: 'Main', order: 80, icon: 'Layers', label: 'Segments' },

    'app.chatbots.index': { section: 'Grow', order: 10, icon: 'Workflow', label: 'Automation' },
    'app.analytics.index': { section: 'Grow', order: 30, icon: 'BarChart3', label: 'Analytics' },
    'app.ai.index': { section: 'Grow', order: 40, icon: 'Sparkles', label: 'AI Assistant' },
    'app.whatsapp-calls.index': { section: 'Grow', order: 45, icon: 'PhoneCall', label: 'WhatsApp Calls' },

    'app.modules': { section: 'Tools & Widgets', order: 10, icon: 'Wrench', label: 'Tools' },
    'app.floaters': { section: 'Tools & Widgets', order: 20, icon: 'Layout', label: 'Widgets' },
    'app.channels.index': { section: 'Tools & Widgets', order: 30, icon: 'Radio', label: 'Channels' },
    'app.media-library.index': { section: 'Tools & Widgets', order: 40, icon: 'Image', label: 'Media Library' },
    'app.catalog.index': { section: 'Tools & Widgets', order: 50, icon: 'Store', label: 'Catalog' },
    'app.ecommerce.index': { section: 'Tools & Widgets', order: 60, icon: 'ShoppingBag', label: 'Ecommerce' },
    'app.meta-leads.index': { section: 'Tools & Widgets', order: 70, icon: 'Target', label: 'Meta Leads' },
    'app.appointments.index': { section: 'Tools & Widgets', order: 80, icon: 'Calendar', label: 'Appointments' },
    'app.surveys.index': { section: 'Tools & Widgets', order: 90, icon: 'ClipboardList', label: 'Surveys' },
    'app.integrations.index': { section: 'Tools & Widgets', order: 100, icon: 'Plug', label: 'Integrations' },
    'app.developer.index': { section: 'Tools & Widgets', order: 110, icon: 'Code2', label: 'Developer' },
    'app.notifications.index': { section: 'Tools & Widgets', order: 120, icon: 'Bell', label: 'Notifications' },

    'app.quick-replies.index': { section: 'Inbox tools', order: 10, icon: 'Zap', label: 'Quick Replies' },
    'app.whatsapp.lists.index': { section: 'Inbox tools', order: 20, icon: 'List', label: 'Interactive Lists' },
    'app.whatsapp.flows.index': { section: 'Inbox tools', order: 30, icon: 'GitBranch', label: 'WhatsApp Flows' },

    'app.support.index': { section: 'Support', order: 10, icon: 'LifeBuoy', label: 'Support' },

    'platform.dashboard': { section: 'Platform', order: 10, icon: 'Shield', label: 'Platform admin' },
    'platform.accounts.index': { section: 'Platform', order: 20, icon: 'Building2', label: 'Tenants' },
    'platform.users.index': { section: 'Platform', order: 30, icon: 'Users', label: 'Users' },
    'platform.plans.index': { section: 'Platform', order: 40, icon: 'CreditCard', label: 'Plans' },
    'platform.modules.index': { section: 'Platform', order: 50, icon: 'Puzzle', label: 'Modules' },
    'platform.subscriptions.index': { section: 'Platform', order: 60, icon: 'FileText', label: 'Subscriptions' },
    'platform.discounts.index': { section: 'Platform', order: 70, icon: 'Tag', label: 'Discounts' },
    'platform.transactions.index': { section: 'Platform', order: 80, icon: 'CreditCard', label: 'Transactions' },
    'platform.analytics': { section: 'Platform', order: 90, icon: 'BarChart3', label: 'Analytics' },
    'platform.templates.index': { section: 'Platform', order: 100, icon: 'FileText', label: 'Templates' },
    'platform.support.index': { section: 'Platform', order: 110, icon: 'LifeBuoy', label: 'Support' },
    'platform.activity-logs': { section: 'Platform', order: 120, icon: 'History', label: 'Audit logs' },
    'platform.system-health': { section: 'Platform', order: 130, icon: 'Shield', label: 'System health' },
    'platform.settings': { section: 'Platform', order: 140, icon: 'Settings', label: 'Settings' },

    'app.workspaces.index': { section: 'Workspace', order: 10, icon: 'Building2', label: 'Workspaces' },
    'app.team.index': { section: 'Workspace', order: 20, icon: 'Users', label: 'Team' },
    'app.activity-logs': { section: 'Workspace', order: 30, icon: 'History', label: 'Activity' },
    'app.settings': { section: 'Workspace', order: 50, icon: 'Settings', label: 'Settings' },
};

const hiddenUntilRealImplementation = new Set([
    'app.catalog.index',
    'app.ecommerce.index',
    'app.surveys.index',
]);

export function Sidebar({ navigation, currentRoute, account, isOpen = false, onClose, onCollapseChange }: SidebarProps) {
    const { auth, inbox_summary } = usePage().props as any;
    const user = auth?.user;
    const inboxUnread = Number(inbox_summary?.unread || 0);
    const [collapsed, setCollapsed] = useState(false);

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

    const marketingHref = tryRouteHref('landing') || '/';
    const profileHref = tryRouteHref('app.settings') ? `${tryRouteHref('app.settings')}?tab=profile` : '#';
    const billingHref = resolveRouteHref('app.billing.index') || '#';
    const accountDescriptor = account?.subscription?.plan?.name
        || account?.plan?.name
        || account?.workspace_type_label
        || account?.workspace_type
        || 'Workspace';

    const safeNavigation = navigation.reduce<NavItem[]>((items, item) => {
        if (hiddenUntilRealImplementation.has(item.href)) {
            return items;
        }

        if (!item.href || items.some((existing) => existing.href === item.href)) {
            return items;
        }

        items.push(item);
        return items;
    }, []);

    if (auth?.user?.is_super_admin) {
        [
            'platform.dashboard',
            'platform.accounts.index',
            'platform.users.index',
            'platform.plans.index',
            'platform.modules.index',
            'platform.subscriptions.index',
            'platform.discounts.index',
            'platform.transactions.index',
            'platform.analytics',
            'platform.templates.index',
            'platform.support.index',
            'platform.notifications.index',
            'platform.activity-logs',
            'platform.system-health',
            'platform.settings',
        ].forEach((href) => {
            const placement = navPlacement[href];
            if (placement && !safeNavigation.some((item) => item.href === href)) {
                safeNavigation.push({
                    label: placement.label || href,
                    href,
                    icon: placement.icon || 'Shield',
                    group: 'Platform',
                });
            }
        });
    }

    const sections = safeNavigation.reduce<Record<string, Array<NavItem & { order: number }>>>((acc, item) => {
        const placement = navPlacement[item.href] ?? {
            section: item.group || 'Workspace',
            order: 100,
        };

        if (!acc[placement.section]) {
            acc[placement.section] = [];
        }

        acc[placement.section].push({
            ...item,
            label: placement.label ?? item.label,
            icon: placement.icon ?? item.icon,
            order: placement.order,
        });

        return acc;
    }, {});

    const orderedSections: NavSection[] = sectionOrder
        .map((label) => ({
            label,
            items: (sections[label] || []).sort((a, b) => a.order - b.order),
        }))
        .filter((section) => section.items.length > 0);

    const isCurrentPath = (href: string): boolean => {
        try {
            const pathname = new URL(href, window.location.origin).pathname;
            return currentRoute === pathname || currentRoute.startsWith(`${pathname}/`);
        } catch (error) {
            return false;
        }
    };

    const renderNavItem = (item: NavItem, index: number) => {
        const Icon = iconMap[item.icon] || LayoutDashboard;
        const resolved = resolveRouteHref(item.href);
        const unreadCount = item.href === 'app.whatsapp.conversations.index' ? inboxUnread : 0;

        if (!resolved) {
            return null;
        }

        const isActive = isCurrentPath(resolved);

        return (
            <Link
                key={`${item.href}-${item.label}-${index}`}
                href={resolved}
                className={cn(
                    'relative flex items-center h-10 rounded-btn text-sm transition-all group',
                    collapsed ? 'lg:justify-center lg:px-2 px-3' : 'px-3',
                    isActive
                        ? 'bg-waify-green/15 text-waify-green font-semibold'
                        : 'text-white/70 hover:bg-white/5 hover:text-white'
                )}
                title={collapsed ? item.label : undefined}
            >
                {isActive && <span className="absolute left-0 top-2 bottom-2 w-0.5 bg-waify-green rounded-full" />}
                <Icon className={cn(
                    'h-[18px] w-[18px] transition-transform duration-200',
                    collapsed ? 'lg:mr-0 mr-3' : 'mr-3',
                    isActive ? 'text-waify-green' : 'text-white/60 group-hover:text-white'
                )} />
                <span className={cn(
                    'flex-1 text-left',
                    collapsed ? 'lg:hidden' : '',
                    isActive ? 'font-semibold' : 'font-medium'
                )}>{item.label}</span>
                {unreadCount > 0 && (
                    <span
                        className={cn(
                            'ml-2 flex h-5 min-w-5 items-center justify-center rounded-full bg-waify-green px-1.5 text-[10px] font-bold leading-none text-white shadow-sm shadow-black/20',
                            collapsed ? 'lg:absolute lg:right-1 lg:top-1 lg:h-4 lg:min-w-4 lg:px-1 lg:text-[9px]' : ''
                        )}
                    >
                        {unreadCount > 99 ? '99+' : unreadCount}
                    </span>
                )}
            </Link>
        );
    };

    const sidebarContent = (
        <nav className={cn('min-h-0 flex-1 overflow-y-auto py-4 space-y-4 waify-scrollbar', collapsed ? 'lg:px-2 px-3' : 'px-3')}>
            {orderedSections.map((section) => {
                const validItems = section.items.map(renderNavItem).filter((item) => item !== null);

                if (validItems.length === 0) {
                    return null;
                }

                return (
                    <div key={section.label}>
                        <h3 className={cn('px-3 text-[10px] font-bold text-white/35 uppercase tracking-wider mb-1.5', collapsed ? 'lg:hidden' : '')}>
                            {section.label}
                        </h3>
                        <div className="space-y-0.5">
                            {validItems}
                        </div>
                    </div>
                );
            }).filter(Boolean)}
        </nav>
    );

    const sidebarFooter = (
        <div className={cn('flex-shrink-0 border-t border-white/5 py-3', collapsed ? 'lg:px-2 px-3' : 'px-3')}>
            <Link
                href={marketingHref}
                className={cn(
                    'mb-2 flex w-full items-center gap-3 rounded-btn px-1.5 py-2 text-white/60 transition hover:bg-white/5 hover:text-white/90',
                    collapsed ? 'lg:justify-center' : '',
                )}
                title="View marketing site"
            >
                <ExternalLink className={cn('h-4 w-4 shrink-0', collapsed ? 'lg:mx-auto' : '')} />
                <span className={cn('flex-1 text-xs', collapsed ? 'lg:hidden' : '')}>Marketing site</span>
            </Link>

            {user && (
                <Link
                    href={profileHref}
                    className={cn(
                        'flex w-full items-center gap-3 rounded-btn p-1.5 transition hover:bg-white/5',
                        collapsed ? 'lg:justify-center' : '',
                    )}
                    title={collapsed ? user.name : undefined}
                >
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-waify-green text-sm font-bold text-white ring-2 ring-white/10">
                        {(user.name || 'U')
                            .split(' ')
                            .filter(Boolean)
                            .slice(0, 2)
                            .map((part: string) => part.charAt(0).toUpperCase())
                            .join('')}
                    </span>
                    <span className={cn('min-w-0 flex-1 text-left', collapsed ? 'lg:hidden' : '')}>
                        <span className="block truncate text-sm font-medium text-white">{user.name}</span>
                        <span className="block truncate text-[11px] text-white/50">{accountDescriptor}</span>
                    </span>
                    <ChevronsUpDown className={cn('h-3.5 w-3.5 shrink-0 text-white/50', collapsed ? 'lg:hidden' : '')} />
                </Link>
            )}

        </div>
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
                    'lg:hidden fixed inset-y-0 left-0 z-50 flex w-60 flex-col bg-waify-sidebar text-white transform transition-transform duration-300 ease-in-out shadow-2xl',
                    isOpen ? 'translate-x-0' : '-translate-x-full'
                )}
            >
                <div className="flex h-16 flex-shrink-0 items-center justify-between px-5 border-b border-white/5">
                    <BrandLogo variant="dark" fallbackTextClassName="text-white" />
                    <button
                        onClick={onClose}
                        className="p-2 rounded-lg hover:bg-white/10 transition-colors"
                        aria-label="Close sidebar"
                    >
                        <X className="h-5 w-5 text-white/70" aria-hidden />
                    </button>
                </div>
                {sidebarContent}
                {sidebarFooter}
            </aside>

            {/* Desktop sidebar */}
            <aside className={cn('hidden min-h-0 lg:flex lg:flex-col lg:fixed lg:inset-y-0 lg:z-30 bg-waify-sidebar text-white transition-all duration-300', collapsed ? 'lg:w-16' : 'lg:w-60')}>
                <div className={cn('h-16 flex flex-shrink-0 items-center border-b border-white/5', collapsed ? 'justify-center px-2' : 'px-5')}>
                    <BrandLogo
                        variant="dark"
                        compact={collapsed}
                        fallbackTextClassName="text-white"
                    />
                </div>
                <button
                    onClick={() => {
                        const nextCollapsed = !collapsed;
                        setCollapsed(nextCollapsed);
                        onCollapseChange?.(nextCollapsed);
                    }}
                    aria-label="Toggle sidebar"
                    className="hidden lg:flex absolute -right-3 top-20 w-6 h-6 rounded-full bg-white shadow-pop ring-1 ring-gray-200 items-center justify-center hover:bg-gray-50 text-waify-text z-10"
                >
                    {collapsed ? <ChevronRight className="h-3.5 w-3.5" /> : <ChevronLeft className="h-3.5 w-3.5" />}
                </button>
                {sidebarContent}
                {sidebarFooter}
            </aside>
        </>
    );
}
