import { ReactNode, useEffect, useMemo, useRef, useState } from 'react';
import { Head, Link, router, usePage } from '@inertiajs/react';
import axios from 'axios';
import {
    Activity,
    ArrowLeft,
    BarChart3,
    Bell,
    Building2,
    ChevronDown,
    ChevronLeft,
    ChevronRight,
    ClipboardList,
    CreditCard,
    FileText,
    History,
    Layers,
    LifeBuoy,
    Loader2,
    LogOut,
    Menu,
    Puzzle,
    Search,
    Send,
    Settings,
    Shield,
    ShieldCheck,
    Tag,
    UserRound,
    Users,
    Wallet,
    X,
    type LucideIcon,
} from 'lucide-react';
import { BrandingWrapper } from '@/Components/Branding/BrandingWrapper';
import BrandLogo from '@/Components/Branding/BrandLogo';
import { Avatar } from '@/Components/UI/Elements';
import { ThemeToggle } from '@/Components/UI/ThemeToggle';
import Button from '@/Components/UI/Button';
import { Badge } from '@/Components/UI/Badge';
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

type AdminItem = {
    label: string;
    routeName: string;
    icon: LucideIcon;
    match?: string[];
};

type AdminSection = {
    label: string;
    items: AdminItem[];
};

const adminSections: AdminSection[] = [
    {
        label: 'Platform',
        items: [
            { label: 'Overview', routeName: 'platform.dashboard', icon: Shield },
            { label: 'Workspaces', routeName: 'platform.accounts.index', icon: Building2, match: ['platform.accounts.show'] },
            { label: 'Users', routeName: 'platform.users.index', icon: Users },
            { label: 'Plans', routeName: 'platform.plans.index', icon: Layers },
            { label: 'Modules', routeName: 'platform.modules.index', icon: Puzzle },
        ],
    },
    {
        label: 'Growth',
        items: [
            { label: 'Subscriptions', routeName: 'platform.subscriptions.index', icon: FileText },
            { label: 'Discounts', routeName: 'platform.discounts.index', icon: Tag },
            { label: 'Email campaigns', routeName: 'platform.email-campaigns.index', icon: Send },
            { label: 'Transactions', routeName: 'platform.transactions.index', icon: Wallet },
            { label: 'Analytics', routeName: 'platform.analytics', icon: BarChart3 },
        ],
    },
    {
        label: 'Operations',
        items: [
            { label: 'Support', routeName: 'platform.support.index', icon: LifeBuoy, match: ['platform.support.show'] },
            { label: 'Notifications', routeName: 'platform.notifications.index', icon: Bell },
            { label: 'Contact requests', routeName: 'platform.contact-requests.index', icon: ClipboardList },
            { label: 'Templates', routeName: 'platform.templates.index', icon: FileText, match: ['platform.templates.show'] },
            { label: 'Audit logs', routeName: 'platform.activity-logs', icon: History },
            { label: 'System health', routeName: 'platform.system-health', icon: ShieldCheck },
        ],
    },
    {
        label: 'System',
        items: [
            { label: 'Settings', routeName: 'platform.settings', icon: Settings },
        ],
    },
];

const routeMeta: Record<string, { title: string; subtitle: string }> = {
    'platform.dashboard': { title: 'Overview', subtitle: 'Platform health, growth, and operational signals' },
    'platform.accounts.index': { title: 'Workspaces', subtitle: 'Tenant accounts, plans, status, and access' },
    'platform.users.index': { title: 'Users', subtitle: 'Platform users, roles, and impersonation access' },
    'platform.plans.index': { title: 'Plans', subtitle: 'Plan catalog, pricing, modules, and limits' },
    'platform.modules.index': { title: 'Modules', subtitle: 'Feature modules and workspace availability' },
    'platform.subscriptions.index': { title: 'Subscriptions', subtitle: 'Customer subscriptions and renewal status' },
    'platform.discounts.index': { title: 'Discounts', subtitle: 'Promo codes, offers, and Razorpay discount mapping' },
    'platform.email-campaigns.index': { title: 'Email campaigns', subtitle: 'Newsletter, promotion, and offer emails' },
    'platform.transactions.index': { title: 'Transactions', subtitle: 'Wallet ledger and billing payment records' },
    'platform.analytics': { title: 'Analytics', subtitle: 'System-wide usage and business reporting' },
    'platform.support.index': { title: 'Support', subtitle: 'Tenant support conversations and ticket operations' },
    'platform.notifications.index': { title: 'Notifications', subtitle: 'Platform alerts for webhooks, payments, automation, and WABA health' },
    'platform.contact-requests.index': { title: 'Contact requests', subtitle: 'Public contact form leads and follow-up status' },
    'platform.templates.index': { title: 'Templates', subtitle: 'Meta template oversight across workspaces' },
    'platform.activity-logs': { title: 'Audit logs', subtitle: 'System events and operational diagnostics' },
    'platform.system-health': { title: 'System health', subtitle: 'Infrastructure, queue, and integration readiness' },
    'platform.settings': { title: 'Settings', subtitle: 'Branding, payments, support, compliance, and infrastructure' },
};

function routeHref(routeName: string): string {
    try {
        return route(routeName);
    } catch (error) {
        return '#';
    }
}

function routePath(routeName: string): string | null {
    const href = routeHref(routeName);
    if (href === '#') return null;

    try {
        return new URL(href, window.location.origin).pathname;
    } catch (error) {
        return href;
    }
}

function isActiveRoute(item: AdminItem, currentPath: string) {
    const paths = [item.routeName, ...(item.match || [])]
        .map(routePath)
        .filter((path): path is string => Boolean(path));

    return paths.some((path) => currentPath === path || currentPath.startsWith(`${path}/`));
}

function currentMeta(currentPath: string) {
    const profilePath = routePath('profile.edit');

    if (profilePath && (currentPath === profilePath || currentPath.startsWith(`${profilePath}/`))) {
        return { title: 'Profile', subtitle: 'Manage your admin login and security' };
    }

    const matched = adminSections
        .flatMap((section) => section.items)
        .find((item) => isActiveRoute(item, currentPath));

    return matched ? (routeMeta[matched.routeName] || { title: matched.label, subtitle: 'Platform operations' }) : routeMeta['platform.dashboard'];
}

function AdminSidebar({
    currentPath,
    collapsed,
    mobileOpen,
    user,
    onClose,
    onToggle,
}: {
    currentPath: string;
    collapsed: boolean;
    mobileOpen: boolean;
    user: { name: string; email: string; is_super_admin?: boolean } | null;
    onClose: () => void;
    onToggle: () => void;
}) {
    const effectiveCollapsed = collapsed;

    return (
        <>
            {mobileOpen && <div className="fixed inset-0 z-40 bg-black/40 lg:hidden" onClick={onClose} />}
            <aside
                className={cn(
                    'fixed inset-y-0 left-0 z-50 flex h-full w-60 flex-shrink-0 flex-col bg-waify-sidebar text-white transition-transform duration-300 ease-out lg:relative lg:translate-x-0',
                    effectiveCollapsed ? 'lg:w-16' : 'lg:w-60',
                    mobileOpen ? 'translate-x-0' : '-translate-x-full'
                )}
            >
                <div className={cn('flex h-16 items-center justify-between border-b border-white/5', effectiveCollapsed ? 'px-3 lg:justify-center' : 'px-5')}>
                    <div className="flex min-w-0 items-center gap-2">
                        <BrandLogo
                            variant="dark"
                            compact={effectiveCollapsed}
                            className={cn(effectiveCollapsed ? 'lg:justify-center' : 'max-w-[150px]')}
                            imageClassName={effectiveCollapsed ? 'h-8 w-8 object-contain' : 'max-h-9 w-auto object-contain'}
                            fallbackTextClassName="text-white"
                        />
                        <div className={cn('min-w-0', effectiveCollapsed && 'lg:hidden')}>
                            <div className="truncate text-[10px] uppercase tracking-wider text-white/45">Platform admin</div>
                        </div>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        className="flex h-8 w-8 items-center justify-center rounded-md text-white/70 hover:bg-white/10 lg:hidden"
                        aria-label="Close menu"
                    >
                        <X className="h-4 w-4" />
                    </button>
                </div>

                <button
                    type="button"
                    onClick={onToggle}
                    aria-label="Toggle sidebar"
                    className="keep-light absolute -right-3 top-20 z-10 hidden h-6 w-6 items-center justify-center rounded-full bg-white text-waify-text shadow-pop ring-1 ring-gray-200 hover:bg-gray-50 lg:flex"
                >
                    {effectiveCollapsed ? <ChevronRight className="h-3.5 w-3.5" /> : <ChevronLeft className="h-3.5 w-3.5" />}
                </button>

                <nav className={cn('sidebar-scroll flex-1 overflow-y-auto py-4', effectiveCollapsed ? 'px-2' : 'px-3')}>
                    {adminSections.map((section) => (
                        <div key={section.label} className={section.label === 'Platform' ? '' : 'mt-4'}>
                            <div className={cn('mb-1.5 px-3 text-[10px] font-bold uppercase tracking-wider text-white/35', effectiveCollapsed && 'lg:hidden')}>
                                {section.label}
                            </div>
                            <ul className="space-y-0.5">
                                {section.items.map((item) => {
                                    const active = isActiveRoute(item, currentPath);
                                    const Icon = item.icon;

                                    return (
                                        <li key={item.routeName}>
                                            <Link
                                                href={routeHref(item.routeName)}
                                                onClick={onClose}
                                                title={effectiveCollapsed ? item.label : undefined}
                                                className={cn(
                                                    'group relative flex h-10 w-full items-center rounded-btn text-sm transition-all',
                                                    effectiveCollapsed ? 'px-2 lg:justify-center' : 'px-3',
                                                    active
                                                        ? 'bg-waify-green/15 font-semibold text-waify-green'
                                                        : 'text-white/70 hover:bg-white/5 hover:text-white'
                                                )}
                                            >
                                                {active && <span className="absolute bottom-2 left-0 top-2 w-0.5 rounded-full bg-waify-green" />}
                                                <Icon className={cn('h-[18px] w-[18px] flex-shrink-0', effectiveCollapsed ? 'lg:mr-0 mr-3' : 'mr-3')} />
                                                <span className={cn('min-w-0 flex-1 truncate text-left', effectiveCollapsed && 'lg:hidden')}>{item.label}</span>
                                            </Link>
                                        </li>
                                    );
                                })}
                            </ul>
                        </div>
                    ))}
                </nav>

                <div className={cn('border-t border-white/5 py-3', effectiveCollapsed ? 'px-2' : 'px-3')}>
                    <Link
                        href={routeHref('app.dashboard')}
                        className={cn('mb-2 flex w-full items-center gap-3 rounded-btn px-1.5 py-2 text-white/60 transition hover:bg-white/5 hover:text-white/90', effectiveCollapsed && 'lg:justify-center')}
                    >
                        <ArrowLeft className="h-4 w-4 flex-shrink-0" />
                        <span className={cn('min-w-0 flex-1 truncate text-left text-xs', effectiveCollapsed && 'lg:hidden')}>Customer app</span>
                    </Link>
                    <Link
                        href={routeHref('profile.edit')}
                        className={cn('flex w-full items-center gap-3 rounded-btn p-1.5 transition hover:bg-white/5', effectiveCollapsed && 'lg:justify-center')}
                        title={effectiveCollapsed ? 'Profile' : undefined}
                    >
                        <Avatar name={user?.name || 'Ops Admin'} size="sm" />
                        <div className={cn('min-w-0 flex-1 text-left', effectiveCollapsed && 'lg:hidden')}>
                            <div className="truncate text-sm font-medium text-white">{user?.name || 'Ops Admin'}</div>
                            <div className="truncate text-[11px] text-white/50">Super admin</div>
                        </div>
                    </Link>
                </div>
            </aside>
        </>
    );
}

function AdminHeader({
    title,
    subtitle,
    user,
    onMobileMenuClick,
}: {
    title: string;
    subtitle?: string;
    user: { name: string; email: string; is_super_admin?: boolean } | null;
    onMobileMenuClick: () => void;
}) {
    const { flash, notification_summary } = usePage().props as any;
    const [notificationsOpen, setNotificationsOpen] = useState(false);
    const [userOpen, setUserOpen] = useState(false);

    const notifications = [
        flash?.success ? { tone: 'success', title: flash.success, time: 'Now' } : null,
        flash?.warning ? { tone: 'warning', title: flash.warning, time: 'Now' } : null,
        flash?.error ? { tone: 'danger', title: flash.error, time: 'Now' } : null,
        flash?.info ? { tone: 'info', title: flash.info, time: 'Now' } : null,
        ...(notification_summary?.latest || []).map((item: any) => ({
            tone: item.severity === 'critical' ? 'danger' : item.severity === 'warning' ? 'warning' : item.severity === 'success' ? 'success' : 'info',
            title: item.title,
            body: item.body,
            time: item.created_at ? new Date(item.created_at).toLocaleString() : '',
            href: item.action_url || routeHref('platform.notifications.index'),
        })),
    ].filter(Boolean) as Array<{ tone: 'success' | 'warning' | 'danger' | 'info'; title: string; body?: string; time: string; href?: string }>;
    const unreadNotifications = Number(notification_summary?.unread || 0);

    const signOutHref = routeHref('logout');

    return (
        <header className="app-header z-30 flex h-16 flex-shrink-0 items-center gap-2 border-b border-waify-border bg-white px-4 dark:border-slate-700 dark:bg-slate-900 sm:gap-4 sm:px-6">
            <button
                type="button"
                onClick={onMobileMenuClick}
                aria-label="Open menu"
                className="flex h-9 w-9 items-center justify-center rounded-md text-waify-text hover:bg-gray-100 dark:text-waify-dark-text dark:hover:bg-slate-800 lg:hidden"
            >
                <Menu className="h-5 w-5" />
            </button>

            <div className="min-w-0 flex-1 lg:flex-none">
                <div className="flex min-w-0 items-center gap-2">
                    <h1 className="truncate text-base font-semibold text-waify-text dark:text-waify-dark-text sm:text-lg">{title}</h1>
                    <Badge variant="info" className="hidden flex-shrink-0 sm:inline-flex">Ops</Badge>
                </div>
                {subtitle && <p className="mt-0.5 hidden truncate text-xs text-waify-text-muted dark:text-waify-dark-text-muted sm:block">{subtitle}</p>}
            </div>

            <div className="mx-auto hidden max-w-xl flex-1 md:block">
                <PlatformGlobalSearch />
            </div>

            <div className="flex-1 md:hidden" />

            <div className="flex flex-shrink-0 items-center gap-1 sm:gap-2">
                <div className="relative" data-popover>
                    <button
                        type="button"
                        onClick={() => {
                            setNotificationsOpen((value) => !value);
                            setUserOpen(false);
                        }}
                        className="relative flex h-10 w-10 items-center justify-center rounded-btn text-gray-600 hover:bg-gray-100 dark:text-slate-300 dark:hover:bg-slate-800"
                        aria-label="Notifications"
                    >
                        <Bell className="h-[18px] w-[18px]" />
                        {unreadNotifications > 0 && (
                            <span className="absolute -right-0.5 -top-0.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold leading-none text-white ring-2 ring-white dark:ring-slate-900">
                                {unreadNotifications > 99 ? '99+' : unreadNotifications}
                            </span>
                        )}
                    </button>
                    {notificationsOpen && (
                        <div className="absolute right-0 top-12 z-50 w-80 overflow-hidden rounded-card bg-white shadow-pop ring-1 ring-gray-100 dark:bg-slate-900 dark:ring-slate-700">
                            <div className="flex items-center justify-between border-b border-gray-100 px-4 py-3 dark:border-slate-700">
                                <div className="text-sm font-semibold text-waify-text dark:text-waify-dark-text">Ops alerts</div>
                                <Link href={routeHref('platform.notifications.index')} className="text-xs font-semibold text-waify-green-dark hover:underline dark:text-emerald-300">View all</Link>
                            </div>
                            <div className="max-h-72 overflow-y-auto">
                                {notifications.length === 0 ? (
                                    <div className="px-4 py-6 text-center text-sm text-waify-text-muted dark:text-waify-dark-text-muted">No new alerts.</div>
                                ) : (
                                    notifications.map((notification, index) => (
                                        <Link href={notification.href || routeHref('platform.notifications.index')} key={`${notification.title}-${index}`} className="flex gap-3 px-4 py-3 hover:bg-gray-50 dark:hover:bg-slate-800">
                                            <Activity className="h-[18px] w-[18px] flex-shrink-0 text-waify-green" />
                                            <div className="min-w-0">
                                                <p className="text-sm text-waify-text dark:text-waify-dark-text">{notification.title}</p>
                                                {notification.body && <p className="mt-0.5 line-clamp-2 text-xs text-waify-text-muted dark:text-waify-dark-text-muted">{notification.body}</p>}
                                                <p className="text-[11px] text-waify-text-muted dark:text-waify-dark-text-muted">{notification.time}</p>
                                            </div>
                                        </Link>
                                    ))
                                )}
                            </div>
                        </div>
                    )}
                </div>

                <ThemeToggle />

                <div className="relative" data-popover>
                    <button
                        type="button"
                        onClick={() => {
                            setUserOpen((value) => !value);
                            setNotificationsOpen(false);
                        }}
                        className="flex items-center gap-2 rounded-btn p-1 hover:bg-gray-100 dark:hover:bg-slate-800 sm:pr-2"
                    >
                        <Avatar name={user?.name || 'Ops Admin'} size="sm" />
                        <ChevronDown className="hidden h-3.5 w-3.5 text-gray-400 sm:block" />
                    </button>
                    {userOpen && (
                        <div className="absolute right-0 top-12 z-50 w-64 overflow-hidden rounded-card bg-white shadow-pop ring-1 ring-gray-100 dark:bg-slate-900 dark:ring-slate-700">
                            <div className="border-b border-gray-100 px-4 py-3 dark:border-slate-700">
                                <div className="text-sm font-semibold text-waify-text dark:text-waify-dark-text">{user?.name || 'Ops Admin'}</div>
                                <div className="text-xs text-waify-text-muted dark:text-waify-dark-text-muted">{user?.email || 'ops@waify.io'}</div>
                            </div>
                            <div className="py-1">
                                <Link href={routeHref('profile.edit')} className="flex w-full items-center gap-3 px-4 py-2 text-sm text-waify-text hover:bg-gray-50 dark:text-waify-dark-text dark:hover:bg-slate-800">
                                    <UserRound className="h-4 w-4" /> Profile & password
                                </Link>
                                <Link href={routeHref('platform.plans.index')} className="flex w-full items-center gap-3 px-4 py-2 text-sm text-waify-text hover:bg-gray-50 dark:text-waify-dark-text dark:hover:bg-slate-800">
                                    <Layers className="h-4 w-4" /> Plans
                                </Link>
                                <Link href={routeHref('platform.settings')} className="flex w-full items-center gap-3 px-4 py-2 text-sm text-waify-text hover:bg-gray-50 dark:text-waify-dark-text dark:hover:bg-slate-800">
                                    <Settings className="h-4 w-4" /> Settings
                                </Link>
                                <Link href={routeHref('app.dashboard')} className="flex w-full items-center gap-3 px-4 py-2 text-sm text-waify-text hover:bg-gray-50 dark:text-waify-dark-text dark:hover:bg-slate-800">
                                    <ArrowLeft className="h-4 w-4" /> Customer app
                                </Link>
                            </div>
                            {signOutHref !== '#' && (
                                <div className="border-t border-gray-100 py-1 dark:border-slate-700">
                                    <Link href={signOutHref} method="post" as="button" className="flex w-full items-center gap-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:text-red-300 dark:hover:bg-red-950/30">
                                        <LogOut className="h-4 w-4" /> Sign out
                                    </Link>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
}

type PlatformSearchResult = {
    id: string;
    type: string;
    label: string;
    description?: string;
    href: string;
};

function PlatformGlobalSearch() {
    const inputRef = useRef<HTMLInputElement>(null);
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<PlatformSearchResult[]>([]);
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') {
                event.preventDefault();
                inputRef.current?.focus();
                setOpen(true);
            }

            if (event.key === 'Escape') {
                setOpen(false);
                inputRef.current?.blur();
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, []);

    useEffect(() => {
        if (!open) {
            return;
        }

        const controller = new AbortController();
        const timer = window.setTimeout(async () => {
            setLoading(true);
            try {
                const response = await axios.get(route('platform.search'), {
                    params: { q: query, limit: 8 },
                    signal: controller.signal,
                    headers: { Accept: 'application/json' },
                });
                setResults(response.data?.results || []);
            } catch (error: any) {
                if (error?.code !== 'ERR_CANCELED' && error?.name !== 'CanceledError') {
                    setResults([]);
                }
            } finally {
                setLoading(false);
            }
        }, query.trim().length >= 2 ? 180 : 0);

        return () => {
            window.clearTimeout(timer);
            controller.abort();
        };
    }, [query, open]);

    const visit = (href: string) => {
        setOpen(false);
        router.visit(href);
    };

    return (
        <div className="relative transition-all focus-within:scale-[1.01]">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
                ref={inputRef}
                value={query}
                placeholder="Search workspaces, users, audit logs..."
                onClick={() => setOpen(true)}
                onChange={(event) => {
                    setQuery(event.target.value);
                    setOpen(true);
                }}
                className="h-10 w-full rounded-btn border border-transparent bg-gray-50 pl-10 pr-16 text-sm outline-none transition placeholder:text-gray-400 focus:border-waify-green focus:bg-white focus:ring-2 focus:ring-waify-green/15 dark:bg-slate-800 dark:text-waify-dark-text dark:focus:bg-slate-900"
            />
            <kbd className="absolute right-3 top-1/2 hidden -translate-y-1/2 items-center rounded border border-gray-200 bg-white px-1.5 py-0.5 text-[10px] font-medium text-gray-400 dark:border-slate-700 dark:bg-slate-900 sm:flex">
                Ctrl K
            </kbd>

            {open && (
                <>
                    <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
                    <div className="absolute left-0 right-0 top-12 z-50 overflow-hidden rounded-card border border-gray-100 bg-white shadow-pop dark:border-slate-700 dark:bg-slate-900">
                        <div className="flex items-center justify-between border-b border-gray-100 px-4 py-2 dark:border-slate-700">
                            <span className="text-[11px] font-semibold uppercase tracking-wider text-waify-text-muted dark:text-waify-dark-text-muted">
                                Platform search
                            </span>
                            {loading && <Loader2 className="h-3.5 w-3.5 animate-spin text-waify-green" />}
                        </div>
                        <div className="max-h-[60vh] overflow-y-auto py-1">
                            {results.length > 0 ? results.map((result) => {
                                const Icon = platformResultIcon(result.type);
                                return (
                                    <button
                                        key={`${result.type}-${result.id}`}
                                        type="button"
                                        onMouseDown={(event) => event.preventDefault()}
                                        onClick={() => visit(result.href)}
                                        className="flex w-full items-start gap-3 px-4 py-3 text-left transition hover:bg-gray-50 dark:hover:bg-slate-800"
                                    >
                                        <span className="mt-0.5 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-waify-green-soft text-waify-green-dark dark:bg-waify-green/10 dark:text-waify-green">
                                            <Icon className="h-4 w-4" />
                                        </span>
                                        <span className="min-w-0 flex-1">
                                            <span className="block truncate text-sm font-semibold text-waify-text dark:text-waify-dark-text">{result.label}</span>
                                            {result.description && <span className="mt-0.5 block truncate text-xs text-waify-text-muted dark:text-waify-dark-text-muted">{result.description}</span>}
                                            <span className="mt-1 block text-[10px] font-medium uppercase tracking-wider text-waify-green-dark dark:text-emerald-300">{result.type.replace('_', ' ')}</span>
                                        </span>
                                    </button>
                                );
                            }) : (
                                <div className="px-4 py-8 text-center">
                                    <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-waify-green-soft text-waify-green-dark dark:bg-waify-green/10 dark:text-waify-green">
                                        <Search className="h-4 w-4" />
                                    </div>
                                    <p className="mt-3 text-sm font-medium text-waify-text dark:text-waify-dark-text">
                                        {query.trim().length >= 2 ? 'No matching results' : 'Search platform data'}
                                    </p>
                                    <p className="mt-1 text-xs text-waify-text-muted dark:text-waify-dark-text-muted">
                                        {query.trim().length >= 2 ? 'Try a workspace, user email, plan, subscription, or ticket.' : 'Type at least two characters, or choose a common page.'}
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}

function platformResultIcon(type: string) {
    switch (type) {
        case 'workspace':
            return Building2;
        case 'user':
            return Users;
        case 'plan':
            return Layers;
        case 'subscription':
            return FileText;
        case 'transaction':
            return Wallet;
        case 'template':
            return FileText;
        case 'support':
            return LifeBuoy;
        case 'module':
            return Puzzle;
        default:
            return Search;
    }
}

export default function PlatformShell({ children, auth: authProp }: PlatformShellProps) {
    const { auth, ziggy } = usePage().props as any;
    const user = authProp?.user || auth?.user || null;
    const currentPath = typeof window !== 'undefined' ? window.location.pathname : '';
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

    useEffect(() => {
        setSidebarOpen(false);
    }, [currentPath]);

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

    const meta = useMemo(() => currentMeta(currentPath), [currentPath]);

    return (
        <BrandingWrapper>
            <Head>
                <link rel="preconnect" href="https://fonts.googleapis.com" />
                <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
                <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet" />
            </Head>
            <div className="flex h-screen overflow-hidden bg-waify-bg text-waify-text dark:bg-slate-950 dark:text-waify-dark-text">
                <AdminSidebar
                    currentPath={currentPath}
                    collapsed={sidebarCollapsed}
                    mobileOpen={sidebarOpen}
                    user={user}
                    onClose={() => setSidebarOpen(false)}
                    onToggle={() => setSidebarCollapsed((value) => !value)}
                />

                <div className="flex min-w-0 flex-1 flex-col">
                    <AdminHeader
                        title={meta.title}
                        subtitle={meta.subtitle}
                        user={user}
                        onMobileMenuClick={() => setSidebarOpen(true)}
                    />
                    <main className="waify-scrollbar flex-1 overflow-y-auto p-4 lg:p-6">{children}</main>
                </div>

            </div>
        </BrandingWrapper>
    );
}
