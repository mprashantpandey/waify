import { useEffect } from 'react';
import { usePage } from '@inertiajs/react';
import { useToast } from '@/hooks/useToast';

/**
 * GlobalFlashHandler Component
 * 
 * Automatically converts Laravel flash messages to toast notifications.
 * This component should be included in the root layout.
 */
export function GlobalFlashHandler() {
    const { flash } = usePage().props as any;
    const { addToast } = useToast();

    useEffect(() => {
        if (!flash) return;

        // Handle success messages
        if (flash.success) {
            addToast({
                title: 'Success',
                description: flash.success,
                variant: 'success',
            });
        }

        // Handle error messages
        if (flash.error) {
            addToast({
                title: 'Error',
                description: flash.error,
                variant: 'error',
            });
        }

        // Handle warning messages
        if (flash.warning) {
            addToast({
                title: 'Warning',
                description: flash.warning,
                variant: 'warning',
            });
        }

        // Handle info messages
        if (flash.info) {
            addToast({
                title: 'Info',
                description: flash.info,
                variant: 'info',
            });
        }

        // Handle status messages (from Laravel)
        if (flash.status) {
            const statusMessages: Record<string, { title: string; variant: 'success' | 'error' | 'warning' | 'info' }> = {
                'verification-link-sent': {
                    title: 'Verification Link Sent',
                    variant: 'success',
                },
                'password-updated': {
                    title: 'Password Updated',
                    variant: 'success',
                },
                'profile-updated': {
                    title: 'Profile Updated',
                    variant: 'success',
                },
            };

            const config = statusMessages[flash.status] || { title: 'Status', variant: 'info' as const };
            addToast({
                title: config.title,
                description: flash.status,
                variant: config.variant,
            });
        }
    }, [flash, addToast]);

    return null;
}

