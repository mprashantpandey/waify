import { HTMLAttributes, ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
    children: ReactNode;
}

export function Card({ className, children, ...props }: CardProps) {
    return (
        <div
            className={cn(
                'surface rounded-card border border-transparent bg-white shadow-card dark:border-slate-700/80 dark:bg-slate-800 dark:shadow-none',
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
        <div className={cn('border-b border-gray-100 px-5 py-4 dark:border-waify-dark-border', className)} {...props}>
            {children}
        </div>
    );
}

export function CardTitle({ className, children, ...props }: CardProps) {
    return (
        <h3 className={cn('text-base font-semibold text-waify-text dark:text-waify-dark-text', className)} {...props}>
            {children}
        </h3>
    );
}

export function CardDescription({ className, children, ...props }: CardProps) {
    return (
        <p className={cn('mt-1 text-sm text-waify-text-muted dark:text-waify-dark-text-muted', className)} {...props}>
            {children}
        </p>
    );
}

export function CardContent({ className, children, ...props }: CardProps) {
    return (
        <div className={cn('px-5 py-4', className)} {...props}>
            {children}
        </div>
    );
}
