import { useToast } from '@/hooks/useToast';
import { X, CheckCircle, XCircle, AlertCircle, Info } from 'lucide-react';
import { useEffect } from 'react';

export function Toaster() {
    const { toasts, removeToast } = useToast();

    if (toasts.length === 0) return null;

    return (
        <div className="fixed top-4 right-4 z-50 space-y-2 max-w-md">
            {toasts.map((toast) => (
                <ToastItem key={toast.id} toast={toast} onClose={() => removeToast(toast.id)} />
            ))}
        </div>
    );
}

function ToastItem({ toast, onClose }: { toast: any; onClose: () => void }) {
    useEffect(() => {
        if (toast.duration && toast.duration > 0) {
            const timer = setTimeout(onClose, toast.duration);
            return () => clearTimeout(timer);
        }
    }, [toast.duration, onClose]);

    const variant = toast.variant || 'info';
    const icons: Record<string, typeof CheckCircle> = {
        success: CheckCircle,
        error: XCircle,
        warning: AlertCircle,
        info: Info,
    };

    const colors: Record<string, string> = {
        success: 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800 text-green-800 dark:text-green-200',
        error: 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800 text-red-800 dark:text-red-200',
        warning: 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800 text-yellow-800 dark:text-yellow-200',
        info: 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800 text-blue-800 dark:text-blue-200',
    };

    const Icon = icons[variant] || Info;
    const colorClass = colors[variant] || colors.info;

    return (
        <div
            className={`${colorClass} border rounded-lg shadow-lg p-4 flex items-start gap-3 animate-in slide-in-from-right`}
            role="alert"
        >
            <Icon className="h-5 w-5 flex-shrink-0 mt-0.5" />
            <div className="flex-1 min-w-0">
                <p className="font-medium text-sm">{toast.title}</p>
                {toast.description && (
                    <p className="text-sm mt-1 opacity-90">{toast.description}</p>
                )}
            </div>
            <button
                onClick={onClose}
                className="flex-shrink-0 text-current opacity-70 hover:opacity-100 transition-opacity"
                aria-label="Close"
            >
                <X className="h-4 w-4" />
            </button>
        </div>
    );
}

