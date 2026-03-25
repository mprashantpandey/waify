import { Link, router, usePage } from '@inertiajs/react';
import { Moon, Sun, User, LogOut, Shield, Menu, HelpCircle } from 'lucide-react';
import { useState, useEffect } from 'react';
import { Badge } from '@/Components/UI/Badge';
import { Tooltip } from '@/Components/UI/Tooltip';

interface TopbarProps {
    user: {
        name: string;
        email: string;
        is_super_admin?: boolean;
    } | null;
    onMenuClick?: () => void;
}

export function Topbar({ user, onMenuClick }: TopbarProps) {
    const page = usePage() as any;
    const { impersonation, accounts, account } = page.props as any;
    const componentName = page.component as string | undefined;
    const [darkMode, setDarkMode] = useState(false);
    const [showUserMenu, setShowUserMenu] = useState(false);
    const [showAccountMenu, setShowAccountMenu] = useState(false);
    const hideAccountSwitch = componentName === 'Platform/Transactions/Index';

    useEffect(() => {
        const isDark = localStorage.getItem('darkMode') === 'true' ||
            (!localStorage.getItem('darkMode') && window.matchMedia('(prefers-color-scheme: dark)').matches);
        setDarkMode(isDark);
        if (isDark) {
            document.documentElement.classList.add('dark');
        }
    }, []);

    const toggleDarkMode = () => {
        const newDarkMode = !darkMode;
        setDarkMode(newDarkMode);
        localStorage.setItem('darkMode', String(newDarkMode));
        if (newDarkMode) {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
    };

    return (
        <header className="sticky top-0 z-20 border-b border-gray-200/70 bg-white/90 backdrop-blur-lg dark:border-gray-800/70 dark:bg-gray-900/90">
            <div className="mx-auto flex h-16 w-full max-w-[1440px] items-center justify-between gap-4 px-4 lg:px-6 lg:pl-[19rem]">
                <div className="flex min-w-0 flex-1 items-center gap-4">
                    {onMenuClick && (
                        <button
                            onClick={onMenuClick}
                            className="rounded-xl p-2 text-gray-700 transition-colors hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800 lg:hidden"
                            aria-label="Open menu"
                        >
                            <Menu className="h-5 w-5" />
                        </button>
                    )}

                    {account && accounts?.length > 1 && !hideAccountSwitch && (
                        <div className="relative hidden xl:block">
                            <button
                                onClick={() => setShowAccountMenu(!showAccountMenu)}
                                className="flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-800 shadow-sm transition-colors hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100 dark:hover:bg-gray-800"
                            >
                                <div className="h-2 w-2 rounded-full bg-green-500"></div>
                                <span className="max-w-[180px] truncate">{account?.name ?? 'Switch Account'}</span>
                            </button>
                            {showAccountMenu && (
                                <>
                                    <div className="fixed inset-0 z-10" onClick={() => setShowAccountMenu(false)} />
                                    <div className="absolute left-0 z-20 mt-2 w-72 rounded-2xl border border-gray-200 bg-white py-2 shadow-xl dark:border-gray-700 dark:bg-gray-800">
                                        <div className="px-4 py-2 text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                                            Switch Account
                                        </div>
                                        {accounts.map((acct: any) => (
                                            <button
                                                key={acct.id}
                                                onClick={() => {
                                                    setShowAccountMenu(false);
                                                    router.post(route('app.accounts.switch', { account: acct.id }));
                                                }}
                                                className="flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm font-medium text-gray-700 transition-colors hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
                                            >
                                                <div className="h-2 w-2 rounded-full bg-emerald-500"></div>
                                                <span className="flex-1 truncate">{acct.name}</span>
                                                {account?.id === acct.id && <Badge variant="success" className="px-2 py-0.5 text-xs">Current</Badge>}
                                            </button>
                                        ))}
                                    </div>
                                </>
                            )}
                        </div>
                    )}
                </div>

                <div className="flex items-center gap-2">
                    <Tooltip content="Open support">
                        <Link
                            href={route('app.support.index')}
                            className="rounded-xl border border-transparent p-2.5 text-gray-700 transition-colors hover:border-gray-200 hover:bg-gray-100 dark:text-gray-300 dark:hover:border-gray-700 dark:hover:bg-gray-800"
                            aria-label="Open support"
                        >
                            <HelpCircle className="h-5 w-5" />
                        </Link>
                    </Tooltip>
                    <Tooltip content={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}>
                        <button
                            onClick={toggleDarkMode}
                            className="rounded-xl border border-transparent p-2.5 text-gray-700 transition-colors hover:border-gray-200 hover:bg-gray-100 dark:text-gray-300 dark:hover:border-gray-700 dark:hover:bg-gray-800"
                            aria-label="Toggle theme"
                        >
                            {darkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
                        </button>
                    </Tooltip>
                    {user && (
                        <div className="relative">
                            <button
                                onClick={() => setShowUserMenu(!showUserMenu)}
                                className="flex items-center gap-2 rounded-xl border border-transparent px-1.5 py-1.5 transition-colors hover:border-gray-200 hover:bg-gray-100 dark:hover:border-gray-700 dark:hover:bg-gray-800"
                            >
                                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-600 text-sm font-semibold text-white">
                                    {user.name.charAt(0).toUpperCase()}
                                </div>
                            </button>
                            {showUserMenu && (
                                <>
                                    <div className="fixed inset-0 z-10" onClick={() => setShowUserMenu(false)} />
                                    <div className="absolute right-0 top-full z-20 mt-2 w-64 rounded-2xl border border-gray-200 bg-white py-2 shadow-xl dark:border-gray-700 dark:bg-gray-800">
                                        <div className="border-b border-gray-200 px-4 py-3 dark:border-gray-700">
                                            <div className="flex items-center gap-3">
                                                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-600 text-sm font-semibold text-white">
                                                    {user.name.charAt(0).toUpperCase()}
                                                </div>
                                                <div className="min-w-0 flex-1">
                                                    <p className="truncate text-sm font-semibold text-gray-900 dark:text-gray-100">{user.name}</p>
                                                    <p className="truncate text-xs text-gray-500 dark:text-gray-400">{user.email}</p>
                                                </div>
                                                {user.is_super_admin && (
                                                    <Badge variant="info" className="flex items-center gap-1 px-2 py-0.5 text-xs">
                                                        <Shield className="h-3 w-3" />
                                                        Admin
                                                    </Badge>
                                                )}
                                            </div>
                                        </div>
                                        {user.is_super_admin && (
                                            <Link href={route('platform.dashboard')} className="flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700">
                                                <Shield className="h-4 w-4" />
                                                Platform Panel
                                            </Link>
                                        )}
                                        {impersonation?.active && (
                                            <Link href={route('impersonate.leave')} method="post" className="flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-amber-700 transition-colors hover:bg-amber-50 dark:text-amber-300 dark:hover:bg-amber-900/20">
                                                <Shield className="h-4 w-4" />
                                                Stop Impersonation
                                            </Link>
                                        )}
                                        <Link href={route('profile.edit')} className="flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700">
                                            <User className="h-4 w-4" />
                                            Profile
                                        </Link>
                                        <Link href={route('logout')} method="post" className="flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-red-600 transition-colors hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20">
                                            <LogOut className="h-4 w-4" />
                                            Logout
                                        </Link>
                                    </div>
                                </>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
}
