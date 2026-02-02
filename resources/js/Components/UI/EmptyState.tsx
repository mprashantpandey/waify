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
        <div className="flex flex-col items-center justify-center py-12 px-4">
            <div className="rounded-full bg-gray-100 p-4 dark:bg-gray-800 mb-4">
                <Icon className="h-8 w-8 text-gray-400 dark:text-gray-500" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">{title}</h3>
            {description && (
                <p className="text-sm text-gray-500 dark:text-gray-400 text-center max-w-md mb-4">
                    {description}
                </p>
            )}
            {action && <div className="mt-4">{action}</div>}
        </div>
    );
}

