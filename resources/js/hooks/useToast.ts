import { useState, useCallback } from 'react';

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

export function useToast() {
    const [localToasts, setLocalToasts] = useState<Toast[]>(toasts);

    const addToast = useCallback((toast: Omit<Toast, 'id'>) => {
        const id = `toast-${++toastIdCounter}`;
        const newToast: Toast = {
            id,
            duration: 5000,
            ...toast};

        toasts = [...toasts, newToast];
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
    useState(() => {
        const listener = (newToasts: Toast[]) => {
            setLocalToasts(newToasts);
        };
        toastListeners.add(listener);
        return () => {
            toastListeners.delete(listener);
        };
    });

    return {
        toasts: localToasts,
        addToast,
        removeToast,
        toast};
}
