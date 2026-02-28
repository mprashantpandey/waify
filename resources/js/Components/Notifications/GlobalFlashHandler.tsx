import { useEffect, useRef } from 'react';
import { usePage } from '@inertiajs/react';
import { hasRecentNonFlashToast, useToast } from '@/hooks/useToast';

/**
 * GlobalFlashHandler Component
 *
 * Automatically converts Laravel flash messages and shared errors to toast notifications.
 * Flash is provided via HandleInertiaRequests shared props; errors come from redirect()->withErrors().
 */
export function GlobalFlashHandler() {
    const { flash, errors } = usePage().props as { flash?: FlashProps; errors?: Record<string, string> };
    const { addToast } = useToast();
    const lastPayloadRef = useRef<string>('');

    useEffect(() => {
        const payloadSignature = JSON.stringify({
            flash: flash ?? null,
            errors: errors ?? null,
        });

        // Inertia can re-render with the same flash payload; avoid duplicate toasts.
        if (lastPayloadRef.current === payloadSignature) {
            return;
        }
        lastPayloadRef.current = payloadSignature;

        const emitted = new Set<string>();
        const emittedSemantic = new Set<string>();
        const normalize = (value: string) => value
            .trim()
            .toLowerCase()
            .replace(/\b(successfully|successful|success)\b/g, '')
            .replace(/\b(done|completed)\b/g, '')
            .replace(/[.!?]+$/g, '')
            .replace(/\s+/g, ' ')
            .trim();
        const emit = (title: string, description: string, variant: 'success' | 'error' | 'warning' | 'info') => {
            const key = `${variant}|${title}|${description}`;
            const semanticKey = `${normalize(title)}|${normalize(description)}`;
            if (emitted.has(key)) {
                return;
            }
            if (semanticKey !== '|' && emittedSemantic.has(semanticKey)) {
                return;
            }
            emitted.add(key);
            emittedSemantic.add(semanticKey);
            addToast({ title, description, variant, source: 'flash' });
        };

        // Flash messages (redirect()->with('success', ...) etc.)
        if (flash) {
            if (flash.success) {
                if (!hasRecentNonFlashToast()) {
                    emit('Success', flash.success, 'success');
                }
            }
            if (flash.error) {
                emit('Error', flash.error, 'error');
            }
            if (flash.warning) {
                if (!hasRecentNonFlashToast()) {
                    emit('Warning', flash.warning, 'warning');
                }
            }
            if (flash.info) {
                if (!hasRecentNonFlashToast()) {
                    emit('Info', flash.info, 'info');
                }
            }
            // Do not auto-toast generic `status` flashes.
            // Many pages (especially auth/profile flows) already render inline status alerts,
            // which creates a duplicate "flash alert + toast" experience.
        }

        // Validation/redirect errors (redirect()->withErrors([...]))
        if (errors && typeof errors === 'object' && Object.keys(errors).length > 0) {
            const messages = Object.entries(errors)
                .map(([key, value]) => (typeof value === 'string' ? value : Array.isArray(value) ? value[0] : String(value)))
                .filter(Boolean);
            const description = messages.length === 1 ? messages[0] : messages.slice(0, 3).join(' • ');
            const flashError = (flash?.error ?? '').trim().toLowerCase();
            if (!flashError || flashError !== description.trim().toLowerCase()) {
                emit('Error', description, 'error');
            }
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
