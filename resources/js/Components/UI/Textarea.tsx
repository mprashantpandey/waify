import * as React from 'react';
import { cn } from '@/lib/utils';

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
    ({ className, ...props }, ref) => {
        return (
            <textarea
                className={cn(
                    'flex min-h-[80px] w-full rounded-btn border border-gray-200 bg-white px-3 py-2 text-sm text-waify-text shadow-sm ring-offset-white placeholder:text-gray-400 focus-visible:border-waify-green focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-waify-green/20 focus-visible:ring-offset-0 disabled:cursor-not-allowed disabled:opacity-50 dark:border-waify-dark-border dark:bg-waify-dark-surface dark:text-waify-dark-text dark:ring-offset-waify-dark-bg dark:placeholder:text-waify-dark-text-muted dark:focus-visible:ring-waify-green/30',
                    className
                )}
                ref={ref}
                {...props}
            />
        );
    }
);
Textarea.displayName = 'Textarea';

export { Textarea };
