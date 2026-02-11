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
        const emitted = new Set<string>();
        const emit = (title: string, description: string, variant: 'success' | 'error' | 'warning' | 'info') => {
            const key = `${variant}|${title}|${description}`;
            if (emitted.has(key)) {
                return;
            }
            emitted.add(key);
            addToast({ title, description, variant });
        };

        // Flash messages (redirect()->with('success', ...) etc.)
        if (flash) {
            if (flash.success) {
                emit('Success', flash.success, 'success');
            }
            if (flash.error) {
                emit('Error', flash.error, 'error');
            }
            if (flash.warning) {
                emit('Warning', flash.warning, 'warning');
            }
            if (flash.info) {
                emit('Info', flash.info, 'info');
            }
            if (flash.status) {
                const statusMessages: Record<string, { title: string; variant: 'success' | 'error' | 'warning' | 'info' }> = {
                    'verification-link-sent': { title: 'Verification Link Sent', variant: 'success' },
                    'password-updated': { title: 'Password Updated', variant: 'success' },
                    'profile-updated': { title: 'Profile Updated', variant: 'success' },
                };
                const config = statusMessages[flash.status] || { title: 'Status', variant: 'info' as const };
                emit(config.title, flash.status, config.variant);
            }
        }

        // Validation/redirect errors (redirect()->withErrors([...]))
        if (errors && typeof errors === 'object' && Object.keys(errors).length > 0) {
            const messages = Object.entries(errors)
                .map(([key, value]) => (typeof value === 'string' ? value : Array.isArray(value) ? value[0] : String(value)))
                .filter(Boolean);
            const description = messages.length === 1 ? messages[0] : messages.slice(0, 3).join(' • ');
            emit('Error', description, 'error');
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
