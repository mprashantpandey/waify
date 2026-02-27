import { Children, isValidElement, ReactNode } from 'react';
import { X, CheckCircle, XCircle, AlertCircle, Info } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AlertProps {
    variant?: 'success' | 'error' | 'warning' | 'info';
    title?: string;
    children: ReactNode;
    onClose?: () => void;
    className?: string;
}

export function Alert({ variant = 'info', title, children, onClose, className }: AlertProps) {
    const variants = {
        success: {
            container: 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800 text-green-800 dark:text-green-200',
            icon: CheckCircle},
        error: {
            container: 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800 text-red-800 dark:text-red-200',
            icon: XCircle},
        warning: {
            container: 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800 text-yellow-800 dark:text-yellow-200',
            icon: AlertCircle},
        info: {
            container: 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800 text-blue-800 dark:text-blue-200',
            icon: Info}};

    const config = variants[variant];
    const Icon = config.icon;
    const childNodes = Children.toArray(children);
    const firstChild = childNodes[0];
    const childHasInlineIcon = isValidElement(firstChild)
        && typeof (firstChild.props as any)?.className === 'string'
        && /\bh-\d+(\.\d+)?\b/.test((firstChild.props as any).className)
        && /\bw-\d+(\.\d+)?\b/.test((firstChild.props as any).className);

    return (
        <div
            className={cn(
                'border rounded-lg p-4 flex items-start gap-3',
                config.container,
                className
            )}
            role="alert"
        >
            {!childHasInlineIcon && <Icon className="h-5 w-5 flex-shrink-0 mt-0.5" />}
            <div className="flex-1 min-w-0">
                {title && (
                    <p className="font-medium text-sm mb-1">{title}</p>
                )}
                <div className="text-sm">{children}</div>
            </div>
            {onClose && (
                <button
                    onClick={onClose}
                    className="flex-shrink-0 text-current opacity-70 hover:opacity-100 transition-opacity"
                    aria-label="Close"
                >
                    <X className="h-4 w-4" />
                </button>
            )}
        </div>
    );
}
