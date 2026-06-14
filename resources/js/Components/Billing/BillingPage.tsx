import { Link } from '@inertiajs/react';
import { ArrowLeft, type LucideIcon } from 'lucide-react';
import type { ReactNode } from 'react';
import { Card } from '@/Components/UI/Card';
import { cn } from '@/lib/utils';

export function BillingHeader({
    title,
    subtitle,
    actions,
}: {
    title: string;
    subtitle: string;
    actions?: ReactNode;
}) {
    return (
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
                <h1 className="text-xl font-bold tracking-tight text-waify-text dark:text-waify-dark-text">{title}</h1>
                <p className="mt-1 text-sm text-waify-text-muted dark:text-waify-dark-text-muted">{subtitle}</p>
            </div>
            {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
        </div>
    );
}

const billingTabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'usage', label: 'Usage' },
    { id: 'plans', label: 'Plans' },
    { id: 'invoices', label: 'Invoices' },
    { id: 'payment', label: 'Payment' },
];

export function BillingNav({ active, onChange }: { active: string; onChange?: (tab: string) => void }) {
    return (
        <div className="border-b border-gray-100 px-4 pt-3 dark:border-slate-700">
            <div className="-mb-px flex min-w-0 items-center gap-1 overflow-x-auto">
                {billingTabs.map((tab) => {
                    const isActive = active === tab.id;
                    const className = cn(
                        'relative inline-flex h-10 shrink-0 items-center whitespace-nowrap px-3 text-sm font-medium transition',
                        isActive
                            ? 'text-waify-text dark:text-waify-dark-text'
                            : 'text-waify-text-muted hover:text-waify-text dark:text-waify-dark-text-muted dark:hover:text-waify-dark-text'
                    );
                    const content = (
                        <>
                            {tab.label}
                            {isActive && <span className="absolute bottom-0 left-2 right-2 h-0.5 rounded-full bg-waify-green" />}
                        </>
                    );

                    if (onChange) {
                        return (
                            <button key={tab.id} type="button" onClick={() => onChange(tab.id)} className={className}>
                                {content}
                            </button>
                        );
                    }

                    return (
                        <Link
                            key={tab.id}
                            href={route('app.billing.index', tab.id === 'overview' ? {} : { tab: tab.id })}
                            className={className}
                        >
                            {content}
                        </Link>
                    );
                })}
            </div>
        </div>
    );
}

export function BillingSurface({ active, children, onTabChange }: { active: string; children: ReactNode; onTabChange?: (tab: string) => void }) {
    return (
        <Card className="overflow-hidden p-0">
            <BillingNav active={active} onChange={onTabChange} />
            <div className="space-y-6 p-6">{children}</div>
        </Card>
    );
}

export function BillingBackLink({ href, label = 'Back to billing' }: { href?: string; label?: string }) {
    return (
        <Link href={href || route('app.billing.index')} className="inline-flex items-center gap-2 text-sm font-medium text-waify-text-muted transition hover:text-waify-text dark:text-waify-dark-text-muted dark:hover:text-waify-dark-text">
            <ArrowLeft className="h-4 w-4" />
            {label}
        </Link>
    );
}

export function BillingStatCard({
    icon: Icon,
    label,
    value,
    sub,
    tone = 'green',
}: {
    icon: LucideIcon;
    label: string;
    value: ReactNode;
    sub?: ReactNode;
    tone?: 'green' | 'blue' | 'amber' | 'red' | 'slate';
}) {
    const tones = {
        green: 'bg-waify-green/10 text-waify-green',
        blue: 'bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-300',
        amber: 'bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-300',
        red: 'bg-red-50 text-red-600 dark:bg-red-500/10 dark:text-red-300',
        slate: 'bg-gray-100 text-waify-text-muted dark:bg-waify-dark-surface-2 dark:text-waify-dark-text-muted',
    };

    return (
        <Card className="flex items-center gap-3 p-4">
            <span className={cn('flex h-10 w-10 shrink-0 items-center justify-center rounded-lg', tones[tone])}>
                <Icon className="h-5 w-5" />
            </span>
            <div className="min-w-0">
                <div className="text-xs text-waify-text-muted dark:text-waify-dark-text-muted">{label}</div>
                <div className="truncate text-lg font-bold text-waify-text dark:text-waify-dark-text">{value}</div>
                {sub && <div className="text-[11px] text-waify-text-muted dark:text-waify-dark-text-muted">{sub}</div>}
            </div>
        </Card>
    );
}

export function BillingInfoBanner({
    variant = 'success',
    title,
    message,
    children,
}: {
    variant?: 'success' | 'info' | 'warning' | 'danger';
    title: ReactNode;
    message?: ReactNode;
    children?: ReactNode;
}) {
    const styles = {
        success: 'border-emerald-200 bg-emerald-50 dark:border-emerald-900/60 dark:bg-emerald-950/30',
        info: 'border-blue-200 bg-blue-50 dark:border-blue-900/60 dark:bg-blue-950/30',
        warning: 'border-amber-200 bg-amber-50 dark:border-amber-900/60 dark:bg-amber-950/30',
        danger: 'border-red-200 bg-red-50 dark:border-red-900/60 dark:bg-red-950/30',
    };

    return (
        <div className={cn('rounded-card border p-4', styles[variant])}>
            <div className="text-sm font-semibold text-waify-text dark:text-waify-dark-text">{title}</div>
            {message && <p className="mt-0.5 text-sm text-waify-text-muted dark:text-waify-dark-text-muted">{message}</p>}
            {children}
        </div>
    );
}

export function BillingTable({ children }: { children: ReactNode }) {
    return (
        <Card className="overflow-hidden p-0">
            <div className="overflow-x-auto">{children}</div>
        </Card>
    );
}

export const billingTableClass = 'w-full text-sm';
export const billingTheadClass = 'bg-gray-50/60 text-left text-[11px] uppercase tracking-wider text-waify-text-muted dark:bg-slate-800/50 dark:text-waify-dark-text-muted';
export const billingThClass = 'px-5 py-3 font-medium';
export const billingTdClass = 'px-5 py-3.5 text-waify-text dark:text-waify-dark-text';
export const billingTrClass = 'border-t border-gray-100 transition hover:bg-gray-50/60 dark:border-slate-700 dark:hover:bg-slate-800/30';
