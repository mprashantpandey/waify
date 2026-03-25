import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface TooltipProps {
    content: ReactNode;
    children: ReactNode;
    className?: string;
}

export function Tooltip({ content, children, className }: TooltipProps) {
    return (
        <span className={cn('group relative inline-flex', className)}>
            {children}
            <span className="pointer-events-none absolute left-1/2 top-full z-50 mt-2 hidden w-max max-w-xs -translate-x-1/2 rounded-lg bg-gray-950 px-3 py-2 text-xs font-medium text-white shadow-xl group-hover:block group-focus-within:block dark:bg-gray-100 dark:text-gray-900">
                {content}
            </span>
        </span>
    );
}
