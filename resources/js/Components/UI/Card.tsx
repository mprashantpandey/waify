import { HTMLAttributes, ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
    children: ReactNode;
}

export function Card({ className, children, ...props }: CardProps) {
    return (
        <div
            className={cn(
                'rounded-lg border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900',
                className
            )}
            {...props}
        >
            {children}
        </div>
    );
}

export function CardHeader({ className, children, ...props }: CardProps) {
    return (
        <div className={cn('px-6 py-4 border-b border-gray-200 dark:border-gray-800', className)} {...props}>
            {children}
        </div>
    );
}

export function CardTitle({ className, children, ...props }: CardProps) {
    return (
        <h3 className={cn('text-lg font-semibold text-gray-900 dark:text-gray-100', className)} {...props}>
            {children}
        </h3>
    );
}

export function CardDescription({ className, children, ...props }: CardProps) {
    return (
        <p className={cn('text-sm text-gray-500 dark:text-gray-400 mt-1', className)} {...props}>
            {children}
        </p>
    );
}

export function CardContent({ className, children, ...props }: CardProps) {
    return (
        <div className={cn('px-6 py-4', className)} {...props}>
            {children}
        </div>
    );
}

