import { Link, router, usePage } from '@inertiajs/react';
import { Moon, Sun, User, LogOut, Shield, Menu, LifeBuoy } from 'lucide-react';
import { useState, useEffect } from 'react';
import Button from '@/Components/UI/Button';
import { Badge } from '@/Components/UI/Badge';

interface TopbarProps {
    user: {
        name: string;
        email: string;
        is_super_admin?: boolean;
    } | null;
    onMenuClick?: () => void;
}

export function Topbar({ user, onMenuClick }: TopbarProps) {
    const { impersonation, accounts, account } = usePage().props as any;
    const [darkMode, setDarkMode] = useState(false);
    const [showUserMenu, setShowUserMenu] = useState(false);
    const [showAccountMenu, setShowAccountMenu] = useState(false);

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
        <header className="sticky top-0 z-20 bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg border-b border-gray-200/50 dark:border-gray-800/50 shadow-sm">
            <div className="flex items-center justify-between h-16 px-4 lg:pl-80">
                <div className="flex items-center gap-4 flex-1">
                    {/* Mobile menu button */}
                    {onMenuClick && (
                        <button
                            onClick={onMenuClick}
                            className="lg:hidden p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300 transition-colors"
                        >
                            <Menu className="h-5 w-5" />
                        </button>
                    )}
                    {account && accounts?.length > 1 && (
                        <div className="relative hidden sm:block">
                            <button
                                onClick={() => setShowAccountMenu(!showAccountMenu)}
                                className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-semibold text-gray-900 dark:text-gray-100 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                            >
                                <div className="h-2 w-2 rounded-full bg-green-500"></div>
                                <span className="max-w-[160px] truncate">Switch Account</span>
                            </button>
                            {showAccountMenu && (
                                <>
                                    <div
                                        className="fixed inset-0 z-10"
                                        onClick={() => setShowAccountMenu(false)}
                                    />
                                    <div className="absolute left-0 mt-2 w-64 bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 py-2 z-20">
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
                                                className="w-full text-left flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                                            >
                                                <div className="h-2 w-2 rounded-full bg-emerald-500"></div>
                                                <span className="flex-1 truncate">{acct.name}</span>
                                                {account?.id === acct.id && (
                                                    <Badge variant="success" className="text-xs px-2 py-0.5">Current</Badge>
                                                )}
                                            </button>
                                        ))}
                                    </div>
                                </>
                            )}
                        </div>
                    )}
                </div>
                <div className="flex items-center gap-2">
                    <button
                        onClick={toggleDarkMode}
                        className="p-2.5 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300 transition-all duration-200 hover:scale-110"
                    >
                        {darkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
                    </button>
                    {user && (
                        <div className="relative">
                            <button
                                onClick={() => setShowUserMenu(!showUserMenu)}
                                className="flex items-center gap-2 px-2 py-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-200"
                            >
                                <div className="h-9 w-9 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-sm font-bold shadow-lg">
                                    {user.name.charAt(0).toUpperCase()}
                                </div>
                            </button>
                            {showUserMenu && (
                                <>
                                    <div
                                        className="fixed inset-0 z-10"
                                        onClick={() => setShowUserMenu(false)}
                                    />
                                    <div className="absolute top-full right-0 mt-2 w-64 bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 py-2 z-20 backdrop-blur-lg">
                                        <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
                                            <div className="flex items-center gap-3">
                                                <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-sm font-bold shadow-lg">
                                                    {user.name.charAt(0).toUpperCase()}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-sm font-semibold text-gray-900 dark:text-gray-100 truncate">
                                                        {user.name}
                                                    </p>
                                                    <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                                                        {user.email}
                                                    </p>
                                                </div>
                                                {user.is_super_admin && (
                                                    <Badge variant="info" className="flex items-center gap-1 text-xs px-2 py-0.5">
                                                        <Shield className="h-3 w-3" />
                                                        Admin
                                                    </Badge>
                                                )}
                                            </div>
                                        </div>
                                        {user.is_super_admin && (
                                            <Link
                                                href={route('platform.dashboard')}
                                                className="flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                                            >
                                                <Shield className="h-4 w-4" />
                                                Platform Panel
                                            </Link>
                                        )}
                                        {user.is_super_admin && (
                                            <Link
                                                href={route('platform.support.hub')}
                                                className="flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                                            >
                                                <LifeBuoy className="h-4 w-4" />
                                                Support Inbox
                                            </Link>
                                        )}
                                        <Link
                                            href={route('app.support.hub', { })}
                                            className="flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                                        >
                                            <LifeBuoy className="h-4 w-4" />
                                            Support
                                        </Link>
                                        {impersonation?.active && (
                                            <Link
                                                href={route('impersonate.leave')}
                                                method="post"
                                                className="flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-amber-700 dark:text-amber-300 hover:bg-amber-50 dark:hover:bg-amber-900/20 transition-colors"
                                            >
                                                <Shield className="h-4 w-4" />
                                                Stop Impersonation
                                            </Link>
                                        )}
                                        <Link
                                            href={route('profile.edit')}
                                            className="flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                                        >
                                            <User className="h-4 w-4" />
                                            Profile
                                        </Link>
                                        <Link
                                            href={route('logout')}
                                            method="post"
                                            className="flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                                        >
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
