import AppShell from '@/Layouts/AppShell';
import { EmptyState } from '@/Components/UI/EmptyState';
import { Badge } from '@/Components/UI/Badge';
import { FileText, Sparkles } from 'lucide-react';
import { Head } from '@inertiajs/react';

export default function ModulePlaceholder({ module }: { module: any }) {
    return (
        <AppShell>
            <Head title={module.name} />
            <div className="space-y-8">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-gray-100 dark:to-gray-300 bg-clip-text text-transparent flex items-center gap-3 mb-2">
                            {module.name}
                            <Badge variant={module.enabled ? 'success' : 'default'} className="px-3 py-1">
                                {module.enabled ? 'Enabled' : 'Disabled'}
                            </Badge>
                        </h1>
                        {module.description && (
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                {module.description}
                            </p>
                        )}
                    </div>
                </div>
                <div className="text-center py-16">
                    <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-gradient-to-br from-blue-100 to-blue-200 dark:from-blue-900/20 dark:to-blue-800/20 mb-6">
                        <Sparkles className="h-12 w-12 text-blue-600 dark:text-blue-400" />
                    </div>
                    <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
                        {module.name} - Coming Soon
                    </h2>
                    <p className="text-gray-500 dark:text-gray-400 max-w-md mx-auto">
                        This module is currently in development and will be available in a future phase.
                    </p>
                </div>
            </div>
        </AppShell>
    );
}
