import { useState, useEffect } from 'react';
import { usePage, Link } from '@inertiajs/react';
import { X, User, AlertCircle, ArrowRight } from 'lucide-react';
import Button from '@/Components/UI/Button';
import { Alert } from '@/Components/UI/Alert';

export default function ProfileIncompleteModal() {
    const { auth } = usePage().props as any;
    const [isOpen, setIsOpen] = useState(false);
    const [dismissed, setDismissed] = useState(false);

    const user = auth?.user;
    const profileComplete = auth?.profile_complete ?? true;

    // Check if dismissed in sessionStorage on mount
    useEffect(() => {
        const wasDismissed = sessionStorage.getItem('profile_incomplete_dismissed') === 'true';
        if (wasDismissed) {
            setDismissed(true);
        }
    }, []);

    // Handle profile completion status and modal visibility
    useEffect(() => {
        // Reset dismissal when profile becomes complete
        if (profileComplete) {
            setDismissed(false);
            sessionStorage.removeItem('profile_incomplete_dismissed');
        }
        
        // Check if profile is incomplete and modal hasn't been dismissed
        if (!profileComplete && !dismissed && user) {
            setIsOpen(true);
        } else {
            setIsOpen(false);
        }
    }, [profileComplete, dismissed, user]);

    const handleDismiss = () => {
        setDismissed(true);
        setIsOpen(false);
        // Store dismissal in sessionStorage (will reset on page reload, but that's okay)
        sessionStorage.setItem('profile_incomplete_dismissed', 'true');
    };

    // Don't show on profile page or platform routes
    const currentPath = typeof window !== 'undefined' ? window.location.pathname : '';
    if (currentPath === '/profile' || 
        currentPath.startsWith('/profile/') || 
        currentPath.startsWith('/platform')) {
        return null;
    }

    if (!isOpen || profileComplete) {
        return null;
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl max-w-md w-full border border-gray-200 dark:border-gray-800 overflow-hidden">
                {/* Header */}
                <div className="bg-gradient-to-r from-amber-500 to-orange-500 px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-white/20 rounded-lg">
                            <AlertCircle className="h-6 w-6 text-white" />
                        </div>
                        <h3 className="text-lg font-bold text-white">Complete Your Profile</h3>
                    </div>
                    <button
                        onClick={handleDismiss}
                        className="p-1.5 rounded-lg hover:bg-white/20 transition-colors text-white"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 space-y-4">
                    <Alert variant="warning">
                        <User className="h-5 w-5" />
                        <div className="flex-1">
                            <p className="font-semibold text-sm mb-1">Profile Incomplete</p>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                Please complete your profile to access all features. The following information is required:
                            </p>
                        </div>
                    </Alert>

                    <div className="space-y-2 pl-6">
                        <div className="flex items-center gap-2 text-sm">
                            <div className={`h-2 w-2 rounded-full ${user?.name ? 'bg-green-500' : 'bg-red-500'}`}></div>
                            <span className={user?.name ? 'text-gray-600 dark:text-gray-400' : 'font-semibold text-gray-900 dark:text-gray-100'}>
                                Full Name {user?.name ? '✓' : '(Required)'}
                            </span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                            <div className={`h-2 w-2 rounded-full ${user?.email ? 'bg-green-500' : 'bg-red-500'}`}></div>
                            <span className={user?.email ? 'text-gray-600 dark:text-gray-400' : 'font-semibold text-gray-900 dark:text-gray-100'}>
                                Email Address {user?.email ? '✓' : '(Required)'}
                            </span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                            <div className={`h-2 w-2 rounded-full ${user?.phone ? 'bg-green-500' : 'bg-red-500'}`}></div>
                            <span className={user?.phone ? 'text-gray-600 dark:text-gray-400' : 'font-semibold text-gray-900 dark:text-gray-100'}>
                                Phone Number {user?.phone ? '✓' : '(Required)'}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="px-6 py-4 bg-gray-50 dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between gap-3">
                    <button
                        onClick={handleDismiss}
                        className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors"
                    >
                        I'll do it later
                    </button>
                    <Link
                        href={route('profile.edit')}
                        className="flex items-center gap-2"
                    >
                        <Button className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white shadow-lg">
                            Complete Profile
                            <ArrowRight className="h-4 w-4 ml-1" />
                        </Button>
                    </Link>
                </div>
            </div>
        </div>
    );
}

