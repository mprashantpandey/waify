import { useState, useCallback, useEffect } from 'react';

export interface Toast {
    id: string;
    title: string;
    description?: string;
    variant?: 'success' | 'error' | 'warning' | 'info';
    duration?: number;
}

let toastIdCounter = 0;
const toastListeners: Set<(toasts: Toast[]) => void> = new Set();
let toasts: Toast[] = [];
const recentToastSignatures: Map<string, { id: string; at: number }> = new Map();
const TOAST_DEDUPE_WINDOW_MS = 1500;

export function useToast() {
    const [localToasts, setLocalToasts] = useState<Toast[]>(toasts);

    const addToast = useCallback((toast: Omit<Toast, 'id'>) => {
        const now = Date.now();
        const signature = `${toast.variant || 'info'}|${toast.title}|${toast.description || ''}`;
        const recent = recentToastSignatures.get(signature);
        if (recent && now - recent.at < TOAST_DEDUPE_WINDOW_MS) {
            return recent.id;
        }

        const id = `toast-${++toastIdCounter}`;
        const newToast: Toast = {
            id,
            duration: 5000,
            ...toast};

        toasts = [...toasts, newToast];
        recentToastSignatures.set(signature, { id, at: now });
        toastListeners.forEach((listener) => listener(toasts));
        setLocalToasts(toasts);

        if (newToast.duration && newToast.duration > 0) {
            setTimeout(() => {
                removeToast(id);
            }, newToast.duration);
        }

        return id;
    }, []);

    const removeToast = useCallback((id: string) => {
        toasts = toasts.filter((t) => t.id !== id);
        toastListeners.forEach((listener) => listener(toasts));
        setLocalToasts(toasts);
    }, []);

    const toast = {
        success: (message: string, description?: string) => {
            addToast({ title: message, description, variant: 'success' });
        },
        error: (message: string, description?: string) => {
            addToast({ title: message, description, variant: 'error' });
        },
        warning: (message: string, description?: string) => {
            addToast({ title: message, description, variant: 'warning' });
        },
        info: (message: string, description?: string) => {
            addToast({ title: message, description, variant: 'info' });
        }};

    // Subscribe to global toast updates
    useEffect(() => {
        const listener = (newToasts: Toast[]) => {
            setLocalToasts(newToasts);
        };
        toastListeners.add(listener);
        setLocalToasts(toasts);
        return () => {
            toastListeners.delete(listener);
        };
    }, []);

    return {
        toasts: localToasts,
        addToast,
        removeToast,
        toast};
}
