import { ReactNode } from 'react';
import { router } from '@inertiajs/react';
import Button from '@/Components/UI/Button';
import { Card, CardContent } from '@/Components/UI/Card';
import { Input } from '@/Components/UI/Input';
import { PageHeader, StatusBadge, ThemedIconTile } from '@/Components/UI/Elements';
import { LucideIcon } from 'lucide-react';

export type PaginationMeta = {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    from: number | null;
    to: number | null;
    prev_page_url: string | null;
    next_page_url: string | null;
};

export function ServerListControls({
    routeName,
    filters = {},
    pagination,
    searchPlaceholder = 'Search',
    children,
}: {
    routeName: string;
    filters?: Record<string, any>;
    pagination?: PaginationMeta | null;
    searchPlaceholder?: string;
    children?: ReactNode;
}) {
    const apply = (next: Record<string, any>) => {
        router.get(route(routeName), { ...filters, ...next, page: 1 }, { preserveState: true, preserveScroll: true, replace: true });
    };

    return (
        <Card>
            <CardContent className="flex flex-col gap-3 p-4 lg:flex-row lg:items-center lg:justify-between">
                <div className="flex flex-1 flex-col gap-3 sm:flex-row sm:items-center">
                    <Input
                        defaultValue={filters.q || ''}
                        placeholder={searchPlaceholder}
                        className="sm:max-w-sm"
                        onKeyDown={(event) => {
                            if (event.key === 'Enter') {
                                apply({ q: (event.currentTarget as HTMLInputElement).value });
                            }
                        }}
                        onBlur={(event) => apply({ q: event.currentTarget.value })}
                    />
                    {children}
                </div>
                {pagination && (
                    <div className="flex items-center justify-between gap-3 text-sm text-waify-text-muted dark:text-waify-dark-text-muted lg:justify-end">
                        <span>
                            {pagination.total > 0 ? `${pagination.from}-${pagination.to} of ${pagination.total}` : '0 results'}
                        </span>
                        <div className="flex items-center gap-2">
                            <Button
                                type="button"
                                size="sm"
                                variant="secondary"
                                disabled={!pagination.prev_page_url}
                                onClick={() => pagination.prev_page_url && router.visit(pagination.prev_page_url, { preserveState: true, preserveScroll: true })}
                            >
                                Prev
                            </Button>
                            <span className="min-w-16 text-center text-xs font-medium">
                                {pagination.current_page}/{pagination.last_page}
                            </span>
                            <Button
                                type="button"
                                size="sm"
                                variant="secondary"
                                disabled={!pagination.next_page_url}
                                onClick={() => pagination.next_page_url && router.visit(pagination.next_page_url, { preserveState: true, preserveScroll: true })}
                            >
                                Next
                            </Button>
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}

export function AddonPage({
    title,
    description,
    actions,
    children,
}: {
    title: string;
    description: string;
    actions?: ReactNode;
    children: ReactNode;
}) {
    return (
        <div className="space-y-6">
            <PageHeader title={title} description={description} actions={actions} />
            {children}
        </div>
    );
}

export function StatGrid({
    stats,
}: {
    stats: Array<{ label: string; value: ReactNode; icon: LucideIcon; tone?: 'green' | 'blue' | 'amber' | 'purple' | 'pink' | 'red' | 'gray'; hint?: ReactNode }>;
}) {
    return (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {stats.map((stat) => {
                const Icon = stat.icon;
                return (
                    <Card key={stat.label} className="border-gray-200/80 dark:border-waify-dark-border">
                        <CardContent className="p-5">
                            <div className="flex items-start justify-between gap-4">
                                <div className="min-w-0">
                                    <p className="text-sm font-medium text-waify-text-muted dark:text-waify-dark-text-muted">{stat.label}</p>
                                    <div className="mt-2 text-2xl font-bold tracking-tight text-waify-text dark:text-waify-dark-text">{stat.value}</div>
                                    {stat.hint && <div className="mt-3 text-xs text-waify-text-muted dark:text-waify-dark-text-muted">{stat.hint}</div>}
                                </div>
                                <ThemedIconTile tone={stat.tone || 'green'}>
                                    <Icon className="h-5 w-5" />
                                </ThemedIconTile>
                            </div>
                        </CardContent>
                    </Card>
                );
            })}
        </div>
    );
}

export function EmptyPanel({
    title,
    description,
    action,
}: {
    title: string;
    description: string;
    action?: ReactNode;
}) {
    return (
        <div className="rounded-card border border-dashed border-gray-200 bg-white p-8 text-center dark:border-waify-dark-border dark:bg-waify-dark-surface">
            <h3 className="text-base font-semibold text-waify-text dark:text-waify-dark-text">{title}</h3>
            <p className="mx-auto mt-2 max-w-xl text-sm text-waify-text-muted dark:text-waify-dark-text-muted">{description}</p>
            {action && <div className="mt-4 flex justify-center">{action}</div>}
        </div>
    );
}

export function MiniStatus({ status }: { status?: string | boolean | null }) {
    const value = typeof status === 'boolean' ? (status ? 'connected' : 'draft') : String(status || 'draft');
    const tone = value === 'connected' || value === 'active' || value === 'confirmed' || value === 'healthy'
        ? 'success'
        : value === 'pending' || value === 'draft'
            ? 'warning'
            : value === 'lost' || value === 'failed'
                ? 'danger'
                : 'info';

    return <StatusBadge tone={tone} dot>{value.replace(/_/g, ' ')}</StatusBadge>;
}

export function ActionButton({ children, ...props }: React.ComponentProps<typeof Button>) {
    return (
        <Button type="button" variant="secondary" {...props}>
            {children}
        </Button>
    );
}
