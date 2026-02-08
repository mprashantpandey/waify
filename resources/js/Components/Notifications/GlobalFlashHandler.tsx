import { useEffect } from 'react';
import { usePage } from '@inertiajs/react';
import { useToast } from '@/hooks/useToast';

/**
 * GlobalFlashHandler Component
 *
 * Automatically converts Laravel flash messages and shared errors to toast notifications.
 * Flash is provided via HandleInertiaRequests shared props; errors come from redirect()->withErrors().
 */
export function GlobalFlashHandler() {
    const { flash, errors } = usePage().props as { flash?: FlashProps; errors?: Record<string, string> };
    const { addToast } = useToast();

    useEffect(() => {
        // Flash messages (redirect()->with('success', ...) etc.)
        if (flash) {
            if (flash.success) {
                addToast({ title: 'Success', description: flash.success, variant: 'success' });
            }
            if (flash.error) {
                addToast({ title: 'Error', description: flash.error, variant: 'error' });
            }
            if (flash.warning) {
                addToast({ title: 'Warning', description: flash.warning, variant: 'warning' });
            }
            if (flash.info) {
                addToast({ title: 'Info', description: flash.info, variant: 'info' });
            }
            if (flash.status) {
                const statusMessages: Record<string, { title: string; variant: 'success' | 'error' | 'warning' | 'info' }> = {
                    'verification-link-sent': { title: 'Verification Link Sent', variant: 'success' },
                    'password-updated': { title: 'Password Updated', variant: 'success' },
                    'profile-updated': { title: 'Profile Updated', variant: 'success' },
                };
                const config = statusMessages[flash.status] || { title: 'Status', variant: 'info' as const };
                addToast({ title: config.title, description: flash.status, variant: config.variant });
            }
        }

        // Validation/redirect errors (redirect()->withErrors([...]))
        if (errors && typeof errors === 'object' && Object.keys(errors).length > 0) {
            const messages = Object.entries(errors)
                .map(([key, value]) => (typeof value === 'string' ? value : Array.isArray(value) ? value[0] : String(value)))
                .filter(Boolean);
            const description = messages.length === 1 ? messages[0] : messages.slice(0, 3).join(' • ');
            addToast({ title: 'Error', description, variant: 'error' });
        }
    }, [flash, errors, addToast]);

    return null;
}

interface FlashProps {
    success?: string;
    error?: string;
    warning?: string;
    info?: string;
    status?: string;
}

