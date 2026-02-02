import { Link, router, usePage } from '@inertiajs/react';
import { Moon, Sun, User, LogOut, ChevronDown, Shield, Menu, Bell, Search, LifeBuoy } from 'lucide-react';
import { useState, useEffect } from 'react';
import Button from '@/Components/UI/Button';
import { Badge } from '@/Components/UI/Badge';

interface Workspace {
    id: number;
    name: string;
    slug: string;
}

interface TopbarProps {
    workspace: Workspace | null;
    workspaces: Workspace[];
    user: {
        name: string;
        email: string;
        is_super_admin?: boolean;
    } | null;
    onMenuClick?: () => void;
}

export function Topbar({ workspace, workspaces, user, onMenuClick }: TopbarProps) {
    const { impersonation } = usePage().props as any;
    const [darkMode, setDarkMode] = useState(false);
    const [showWorkspaceMenu, setShowWorkspaceMenu] = useState(false);
    const [showUserMenu, setShowUserMenu] = useState(false);

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

    const switchWorkspace = (workspaceSlug: string) => {
        router.post(route('workspaces.switch', { workspace: workspaceSlug }));
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
                    {workspace && (
                        <div className="relative">
                            <button
                                onClick={() => setShowWorkspaceMenu(!showWorkspaceMenu)}
                                className="flex items-center gap-2 px-4 py-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 text-sm font-semibold text-gray-900 dark:text-gray-100 transition-all duration-200 border border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600"
                            >
                                <div className="h-2 w-2 rounded-full bg-green-500"></div>
                                <span>{workspace.name}</span>
                                <ChevronDown className="h-4 w-4" />
                            </button>
                            {showWorkspaceMenu && (
                                <>
                                    <div
                                        className="fixed inset-0 z-10"
                                        onClick={() => setShowWorkspaceMenu(false)}
                                    />
                                    <div className="absolute top-full left-0 mt-2 w-72 bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 py-2 z-20 backdrop-blur-lg">
                                        <div className="px-4 py-2 border-b border-gray-200 dark:border-gray-700">
                                            <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Workspaces</p>
                                        </div>
                                        {workspaces.map((ws) => (
                                            <button
                                                key={ws.id}
                                                onClick={() => {
                                                    switchWorkspace(ws.slug);
                                                    setShowWorkspaceMenu(false);
                                                }}
                                                className={`w-full text-left px-4 py-3 text-sm font-medium transition-colors ${
                                                    ws.id === workspace.id
                                                        ? 'bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 text-blue-700 dark:text-blue-400'
                                                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                                                }`}
                                            >
                                                <div className="flex items-center gap-2">
                                                    <div className={`h-2 w-2 rounded-full ${ws.id === workspace.id ? 'bg-blue-500' : 'bg-gray-400'}`}></div>
                                                    {ws.name}
                                                </div>
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
                                        {workspace && (
                                            <Link
                                                href={route('app.support.hub', { workspace: workspace.slug })}
                                                className="flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                                            >
                                                <LifeBuoy className="h-4 w-4" />
                                                Support
                                            </Link>
                                        )}
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
