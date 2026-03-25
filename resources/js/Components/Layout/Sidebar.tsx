import { Link, usePage } from '@inertiajs/react';
import {
    Activity,
    BarChart3,
    Bell,
    Bot,
    ChevronDown,
    ChevronRight,
    Code2,
    CreditCard,
    FileText,
    Inbox,
    LayoutDashboard,
    LifeBuoy,
    LucideIcon,
    Megaphone,
    Search,
    Settings,
    Sparkles,
    Users,
    X,
    Zap,
} from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { cn } from '@/lib/utils';
import { getPlatformName, getLogoUrl } from '@/lib/branding';
import { Input } from '@/Components/UI/Input';

const iconMap: Record<string, LucideIcon> = {
    LayoutDashboard,
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
    Bell,
    Megaphone,
    Code2,
};

interface NavItem {
    label: string;
    href: string;
    icon: string;
    group?: string;
}

interface SidebarProps {
    navigation: NavItem[];
    currentRoute: string;
    account: { slug: string; name?: string } | null;
    isOpen?: boolean;
    onClose?: () => void;
}

export function Sidebar({ navigation, currentRoute, account, isOpen = false, onClose }: SidebarProps) {
    const { branding } = usePage().props as any;
    const platformName = getPlatformName(branding);
    const logoUrl = getLogoUrl(branding);
    const [query, setQuery] = useState('');
    const [collapsedGroups, setCollapsedGroups] = useState<Record<string, boolean>>({});

    const groupOrder = ['core', 'messaging', 'automation', 'ai', 'growth', 'billing', 'developer', 'other'] as const;
    const navOrder: string[] = [
        'app.dashboard',
        'app.whatsapp.connections.index',
        'app.whatsapp.connections.create',
        'app.whatsapp.conversations.index',
        'app.whatsapp.templates.index',
        'app.chatbots',
        'app.broadcasts.index',
        'app.contacts.index',
        'app.analytics.index',
        'app.team.index',
        'app.alerts.index',
        'app.ai.index',
        'app.ai',
        'app.billing.index',
        'app.billing.plans',
        'app.billing.history',
        'app.settings',
        'app.activity-logs',
    ];
    const navRank = new Map(navOrder.map((key, index) => [key, index]));

    const groupLabels: Record<string, string> = {
        core: 'Core',
        messaging: 'Messaging',
        automation: 'Automation',
        ai: 'AI',
        growth: 'Growth',
        billing: 'Billing',
        developer: 'Developer',
    };
    const defaultExpandedGroups = new Set(['core', 'messaging', 'growth']);

    const tryRouteHref = (routeName: string): string | null => {
        try {
            return route(routeName, {});
        } catch {
            return null;
        }
    };

    const resolveRouteHref = (routeName: string): string | null => {
        const direct = tryRouteHref(routeName);
        if (direct) return direct;
        if (routeName.endsWith('.index')) {
            return tryRouteHref(routeName.slice(0, -'.index'.length));
        }
        return tryRouteHref(`${routeName}.index`);
    };

    const groupedNav = useMemo(() => {
        const normalizedQuery = query.trim().toLowerCase();
        return navigation.reduce((acc, item) => {
            const haystack = [item.label, item.group, item.href].filter(Boolean).join(' ').toLowerCase();
            if (normalizedQuery !== '' && !haystack.includes(normalizedQuery)) {
                return acc;
            }
            const group = item.group || 'other';
            if (!acc[group]) acc[group] = [];
            acc[group].push(item);
            return acc;
        }, {} as Record<string, NavItem[]>);
    }, [navigation, query]);

    const orderedGroups = [
        ...groupOrder.filter((g) => groupedNav[g]),
        ...Object.keys(groupedNav).filter((g) => !groupOrder.includes(g as any)).sort((a, b) => a.localeCompare(b)),
    ];

    useEffect(() => {
        try {
            const raw = window.localStorage.getItem('tenant-sidebar-groups');
            if (raw) {
                setCollapsedGroups(JSON.parse(raw));
            }
        } catch {
            setCollapsedGroups({});
        }
    }, []);

    const persistGroups = (next: Record<string, boolean>) => {
        setCollapsedGroups(next);
        try {
            window.localStorage.setItem('tenant-sidebar-groups', JSON.stringify(next));
        } catch {
            // no-op
        }
    };

    const toggleGroup = (group: string) => {
        const next = {
            ...collapsedGroups,
            [group]: !isGroupExpanded(group),
        };
        persistGroups(next);
    };

    function isGroupExpanded(group: string): boolean {
        if (query.trim() !== '') return true;
        if (collapsedGroups[group] !== undefined) return collapsedGroups[group];
        return defaultExpandedGroups.has(group);
    }

    const sortNavItems = (items: NavItem[]) => {
        return [...items].sort((a, b) => {
            const aRank = navRank.has(a.href) ? (navRank.get(a.href) as number) : Number.MAX_SAFE_INTEGER;
            const bRank = navRank.has(b.href) ? (navRank.get(b.href) as number) : Number.MAX_SAFE_INTEGER;
            if (aRank !== bRank) return aRank - bRank;
            return a.label.localeCompare(b.label);
        });
    };

    const renderNavItem = (item: NavItem, index: number) => {
        const Icon = iconMap[item.icon] || LayoutDashboard;
        if (!account) return null;
        const href = resolveRouteHref(item.href);
        if (!href) return null;

        const isActive = currentRoute.includes(item.href.replace('app.', ''));

        return (
            <Link
                key={`${item.href}-${item.label}-${index}`}
                href={href}
                className={cn(
                    'group flex items-center gap-3 rounded-2xl px-3 py-2.5 text-sm transition-all duration-150',
                    isActive
                        ? 'border border-blue-100 bg-blue-600 text-white shadow-[0_12px_28px_-18px_rgba(37,99,235,0.9)] dark:border-blue-400/20 dark:bg-blue-500'
                        : 'text-gray-700 hover:bg-gray-100/90 dark:text-gray-300 dark:hover:bg-gray-800'
                )}
            >
                <span
                    className={cn(
                        'flex h-9 w-9 shrink-0 items-center justify-center rounded-xl transition-colors',
                        isActive
                            ? 'bg-white/18 text-white'
                            : 'bg-gray-100 text-gray-500 group-hover:bg-white group-hover:text-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:group-hover:bg-gray-700 dark:group-hover:text-gray-200'
                    )}
                >
                    <Icon className="h-4 w-4" />
                </span>
                <span className="min-w-0 flex-1 truncate font-medium">{item.label}</span>
                {isActive && (
                    <span className="rounded-full bg-white/18 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-white">
                        Live
                    </span>
                )}
            </Link>
        );
    };

    const sidebarContent = (
        <>
            <div className="border-b border-gray-200/80 px-4 py-4 dark:border-gray-800/80">
                <div className="rounded-2xl border border-gray-200 bg-gray-50/80 p-3 dark:border-gray-800 dark:bg-gray-900/70">
                    <div className="mb-2 flex items-center justify-between gap-2">
                        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-gray-500 dark:text-gray-400">
                            Navigation
                        </p>
                        {account?.name && (
                            <span className="truncate text-xs text-gray-500 dark:text-gray-400">{account.name}</span>
                        )}
                    </div>
                    <div className="relative">
                        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                        <Input
                            value={query}
                            onChange={(event) => setQuery(event.target.value)}
                            placeholder="Search pages"
                            className="h-10 rounded-xl border-gray-200 bg-white pl-9 text-sm shadow-sm dark:border-gray-700 dark:bg-gray-950"
                        />
                    </div>
                </div>
            </div>
            <nav className="flex-1 min-h-0 overflow-y-auto overscroll-contain px-3 py-4 space-y-6">
                {orderedGroups.length === 0 && (
                    <div className="rounded-xl border border-dashed border-gray-300 bg-gray-50 px-3 py-4 text-sm text-gray-500 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-400">
                        No pages matched your search.
                    </div>
                )}
                {orderedGroups.map((group) => {
                    const items = sortNavItems(groupedNav[group] || []);
                    const validItems = items.map(renderNavItem).filter((item) => item !== null);
                    if (validItems.length === 0) return null;
                    const expanded = isGroupExpanded(group);

                    return (
                        <div key={group}>
                            <button
                                type="button"
                                onClick={() => toggleGroup(group)}
                                className="mb-2 flex w-full items-center justify-between px-3 text-left"
                            >
                                <span className="text-[11px] font-semibold uppercase tracking-[0.22em] text-gray-400 dark:text-gray-500">
                                    {groupLabels[group] || group}
                                </span>
                                <span className="text-gray-400 dark:text-gray-500">
                                    {expanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                                </span>
                            </button>
                            {expanded && <div className="space-y-1">{validItems}</div>}
                        </div>
                    );
                })}
            </nav>
            <div className="border-t border-gray-200/80 p-3 dark:border-gray-800/80">
                <Link
                    href={resolveRouteHref('app.support.index') ?? '#'}
                    className="flex items-center gap-3 rounded-2xl border border-gray-200 bg-gradient-to-br from-white to-gray-50 px-3 py-3 text-sm font-medium text-gray-700 shadow-sm transition hover:border-blue-200 hover:text-blue-700 dark:border-gray-800 dark:from-gray-950 dark:to-gray-900 dark:text-gray-200 dark:hover:border-gray-700 dark:hover:text-blue-300"
                >
                    <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-300">
                        <LifeBuoy className="h-4 w-4" />
                    </span>
                    <span className="flex-1">
                        <span className="block">Support</span>
                        <span className="block text-xs font-normal text-gray-500 dark:text-gray-400">Get help fast</span>
                    </span>
                </Link>
            </div>
        </>
    );

    return (
        <>
            {isOpen && <div className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden" onClick={onClose} />}

            <aside
                className={cn(
                    'fixed inset-y-0 left-0 z-50 flex h-dvh max-h-screen w-72 flex-col border-r border-gray-200/80 bg-white transition-transform duration-300 ease-in-out dark:border-gray-800 dark:bg-gray-900 lg:z-30 lg:w-72 lg:translate-x-0',
                    isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
                )}
            >
                <div className="flex items-center justify-between border-b border-gray-200/80 px-4 py-4 dark:border-gray-800/80">
                    <div className="flex items-center gap-3">
                        {logoUrl ? (
                            <img src={logoUrl} alt={platformName} className="h-8 w-auto" />
                        ) : (
                            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{platformName}</h2>
                        )}
                    </div>
                    <button
                        onClick={onClose}
                        className="rounded-xl p-2 transition-colors hover:bg-gray-100 dark:hover:bg-gray-800 lg:hidden"
                        aria-label="Close sidebar"
                    >
                        <X className="h-5 w-5 text-gray-700 dark:text-gray-300" />
                    </button>
                </div>
                {sidebarContent}
            </aside>
        </>
    );
}
