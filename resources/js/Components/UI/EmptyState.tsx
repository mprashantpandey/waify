import { ReactNode } from 'react';
import { LucideIcon } from 'lucide-react';

interface EmptyStateProps {
    icon: LucideIcon;
    title: string;
    description?: string;
    action?: ReactNode;
}

export function EmptyState({ icon: Icon, title, description, action }: EmptyStateProps) {
    return (
        <div className="flex flex-col items-center justify-center px-4 py-12">
            <div className="mb-4 rounded-full bg-waify-green-soft p-4 text-waify-green-dark dark:bg-waify-dark-green-soft dark:text-emerald-200">
                <Icon className="h-8 w-8" />
            </div>
            <h3 className="mb-2 text-lg font-semibold text-waify-text dark:text-waify-dark-text">{title}</h3>
            {description && (
                <p className="mb-4 max-w-md text-center text-sm text-waify-text-muted dark:text-waify-dark-text-muted">
                    {description}
                </p>
            )}
            {action && <div className="mt-4">{action}</div>}
        </div>
    );
}
