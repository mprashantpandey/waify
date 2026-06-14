import { Fragment, HTMLAttributes, ReactNode, useMemo, useRef, type ButtonHTMLAttributes, type InputHTMLAttributes } from 'react';
import { Transition, TransitionChild } from '@headlessui/react';
import {
    ArrowDown,
    ArrowUp,
    Check,
    CheckCircle2,
    ChevronLeft,
    ChevronRight,
    CloudUpload,
    Copy,
    Download,
    Edit3,
    Eye,
    FileText,
    Info,
    Loader2,
    MoreHorizontal,
    Minus,
    Search,
    Trash2,
    X,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import Button from '@/Components/UI/Button';

type Tone = 'default' | 'success' | 'warning' | 'danger' | 'info' | 'muted';

const toneClasses: Record<Tone, string> = {
    default: 'bg-gray-100 text-gray-800 ring-gray-200 dark:bg-slate-700/70 dark:text-slate-100 dark:ring-slate-500/30',
    success: 'bg-emerald-100 text-emerald-800 ring-emerald-200 dark:bg-emerald-500/20 dark:text-emerald-100 dark:ring-emerald-400/25',
    warning: 'bg-amber-100 text-amber-800 ring-amber-200 dark:bg-amber-500/20 dark:text-amber-100 dark:ring-amber-400/25',
    danger: 'bg-red-100 text-red-800 ring-red-200 dark:bg-red-500/20 dark:text-red-100 dark:ring-red-400/25',
    info: 'bg-sky-100 text-sky-800 ring-sky-200 dark:bg-sky-500/20 dark:text-sky-100 dark:ring-sky-400/25',
    muted: 'bg-gray-50 text-waify-text-muted ring-gray-200 dark:bg-waify-dark-surface-2 dark:text-waify-dark-text-muted dark:ring-waify-dark-border',
};

export function Avatar({
    name,
    src,
    size = 'md',
    status,
    className,
}: {
    name?: string | null;
    src?: string | null;
    size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
    status?: 'online' | 'away' | 'offline';
    className?: string;
}) {
    const sizes = {
        xs: 'h-6 w-6 text-[10px]',
        sm: 'h-8 w-8 text-xs',
        md: 'h-10 w-10 text-sm',
        lg: 'h-12 w-12 text-base',
        xl: 'h-16 w-16 text-xl',
        '2xl': 'h-20 w-20 text-2xl',
    };
    const initials = (name || 'U')
        .split(' ')
        .filter(Boolean)
        .slice(0, 2)
        .map((part) => part.charAt(0).toUpperCase())
        .join('');

    const statusClasses = {
        online: 'bg-emerald-500',
        away: 'bg-amber-500',
        offline: 'bg-gray-300 dark:bg-waify-dark-text-muted',
    };

    return (
        <span className="relative inline-flex shrink-0">
            <span className={cn('inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-waify-green font-semibold text-white ring-2 ring-white dark:ring-waify-dark-bg', sizes[size], className)}>
                {src ? <img src={src} alt={name || 'Avatar'} className="h-full w-full object-cover" /> : initials}
            </span>
            {status && (
                <span className={cn('absolute bottom-0 right-0 h-3 w-3 rounded-full ring-2 ring-white dark:ring-waify-dark-bg', statusClasses[status])} />
            )}
        </span>
    );
}

export function AvatarGroup({
    users,
    max = 4,
    size = 'sm',
    className,
}: {
    users: Array<{ name?: string | null; src?: string | null }>;
    max?: number;
    size?: 'xs' | 'sm' | 'md';
    className?: string;
}) {
    const visible = users.slice(0, max);
    const remaining = Math.max(users.length - visible.length, 0);
    const sizes = {
        xs: 'h-6 w-6 text-[10px]',
        sm: 'h-9 w-9 text-xs',
        md: 'h-10 w-10 text-sm',
    };

    return (
        <div className={cn('flex -space-x-2', className)}>
            {visible.map((user, index) => (
                <Avatar key={`${user.name || 'user'}-${index}`} name={user.name} src={user.src} size={size} />
            ))}
            {remaining > 0 && (
                <span className={cn('inline-flex items-center justify-center rounded-full bg-gray-100 font-semibold text-gray-600 ring-2 ring-white dark:bg-waify-dark-surface-2 dark:text-waify-dark-text-muted dark:ring-waify-dark-bg', sizes[size])}>
                    +{remaining}
                </span>
            )}
        </div>
    );
}

export function IconButton({
    className,
    variant = 'ghost',
    size = 'md',
    ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & {
    variant?: 'ghost' | 'outline' | 'primary' | 'danger';
    size?: 'sm' | 'md' | 'lg';
}) {
    const variants = {
        ghost: 'text-waify-text-muted hover:bg-gray-100 hover:text-waify-text dark:text-waify-dark-text-muted dark:hover:bg-waify-dark-surface-2 dark:hover:text-waify-dark-text',
        outline: 'border border-gray-200 bg-white text-waify-text hover:bg-gray-50 dark:border-waify-dark-border dark:bg-waify-dark-surface dark:text-waify-dark-text dark:hover:bg-waify-dark-surface-2',
        primary: 'bg-waify-green text-waify-ink hover:bg-waify-green-dark hover:text-white',
        danger: 'text-red-600 hover:bg-red-50 dark:text-red-300 dark:hover:bg-red-500/10',
    };
    const sizes = {
        sm: 'h-8 w-8',
        md: 'h-10 w-10',
        lg: 'h-11 w-11',
    };

    return (
        <button
            type="button"
            className={cn('inline-flex items-center justify-center rounded-btn transition focus:outline-none focus:ring-2 focus:ring-waify-green/25 disabled:pointer-events-none disabled:opacity-50', variants[variant], sizes[size], className)}
            {...props}
        />
    );
}

export function StatusBadge({
    tone = 'default',
    dot = false,
    className,
    children,
}: HTMLAttributes<HTMLSpanElement> & { tone?: Tone; dot?: boolean }) {
    return (
        <span className={cn('inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset', toneClasses[tone], className)}>
            {dot && <span className="h-1.5 w-1.5 rounded-full bg-current" />}
            {children}
        </span>
    );
}

export function CounterBadge({
    count,
    tone = 'info',
    className,
}: {
    count: number | string;
    tone?: Extract<Tone, 'success' | 'danger' | 'info' | 'warning' | 'default'>;
    className?: string;
}) {
    const colors = {
        success: 'bg-emerald-600 text-white ring-1 ring-inset ring-emerald-500/20 dark:bg-emerald-500 dark:text-emerald-950 dark:ring-emerald-300/20',
        danger: 'bg-red-600 text-white ring-1 ring-inset ring-red-500/20 dark:bg-red-500 dark:text-red-950 dark:ring-red-300/20',
        info: 'bg-sky-600 text-white ring-1 ring-inset ring-sky-500/20 dark:bg-sky-400 dark:text-sky-950 dark:ring-sky-200/20',
        warning: 'bg-amber-500 text-white ring-1 ring-inset ring-amber-400/20 dark:bg-amber-400 dark:text-amber-950 dark:ring-amber-200/20',
        default: 'bg-waify-text text-white ring-1 ring-inset ring-black/10 dark:bg-waify-dark-text dark:text-waify-dark-bg dark:ring-white/10',
    };

    return (
        <span className={cn('inline-flex h-5 min-w-5 items-center justify-center rounded-full px-1.5 text-[11px] font-bold tabular-nums', colors[tone], className)}>
            {count}
        </span>
    );
}

export function ThemedIconTile({
    tone = 'green',
    size = 'md',
    className,
    children,
}: {
    tone?: 'green' | 'blue' | 'amber' | 'purple' | 'pink' | 'red' | 'gray';
    size?: 'sm' | 'md' | 'lg';
    className?: string;
    children: ReactNode;
}) {
    const tones = {
        green: 'bg-emerald-100 text-emerald-700 ring-1 ring-emerald-200/70 dark:bg-emerald-500/20 dark:text-emerald-100 dark:ring-emerald-400/20',
        blue: 'bg-sky-100 text-sky-700 ring-1 ring-sky-200/70 dark:bg-sky-500/20 dark:text-sky-100 dark:ring-sky-400/20',
        amber: 'bg-amber-100 text-amber-700 ring-1 ring-amber-200/70 dark:bg-amber-500/20 dark:text-amber-100 dark:ring-amber-400/20',
        purple: 'bg-purple-100 text-purple-700 ring-1 ring-purple-200/70 dark:bg-purple-500/20 dark:text-purple-100 dark:ring-purple-400/20',
        pink: 'bg-pink-100 text-pink-700 ring-1 ring-pink-200/70 dark:bg-pink-500/20 dark:text-pink-100 dark:ring-pink-400/20',
        red: 'bg-red-100 text-red-700 ring-1 ring-red-200/70 dark:bg-red-500/20 dark:text-red-100 dark:ring-red-400/20',
        gray: 'bg-gray-100 text-gray-700 dark:bg-waify-dark-surface-2 dark:text-waify-dark-text',
    };
    const sizes = {
        sm: 'h-8 w-8 rounded-md',
        md: 'h-10 w-10 rounded-lg',
        lg: 'h-11 w-11 rounded-xl',
    };

    return (
        <span className={cn('inline-flex shrink-0 items-center justify-center', tones[tone], sizes[size], className)}>
            {children}
        </span>
    );
}

export function TagPill({
    className,
    children,
    onRemove,
    tone = 'default',
}: HTMLAttributes<HTMLSpanElement> & { onRemove?: () => void; tone?: Tone }) {
    const colors = {
        default: 'bg-white text-waify-text ring-gray-200 dark:bg-waify-dark-surface dark:text-waify-dark-text dark:ring-waify-dark-border',
        success: 'bg-emerald-100 text-emerald-800 ring-emerald-200 dark:bg-emerald-500/20 dark:text-emerald-100 dark:ring-emerald-400/25',
        warning: 'bg-amber-100 text-amber-800 ring-amber-200 dark:bg-amber-500/20 dark:text-amber-100 dark:ring-amber-400/25',
        danger: 'bg-red-100 text-red-800 ring-red-200 dark:bg-red-500/20 dark:text-red-100 dark:ring-red-400/25',
        info: 'bg-sky-100 text-sky-800 ring-sky-200 dark:bg-sky-500/20 dark:text-sky-100 dark:ring-sky-400/25',
        muted: 'bg-gray-50 text-waify-text-muted ring-gray-200 dark:bg-waify-dark-surface-2 dark:text-waify-dark-text-muted dark:ring-waify-dark-border',
    };

    return (
        <span className={cn('inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[11px] font-medium ring-1 ring-inset', colors[tone], className)}>
            {children}
            {onRemove && (
                <button type="button" onClick={onRemove} className="rounded-full text-waify-text-muted hover:text-red-500" aria-label="Remove tag">
                    <X className="h-3.5 w-3.5" />
                </button>
            )}
        </span>
    );
}

export function TrendBadge({
    value,
    direction = 'up',
    className,
}: {
    value: string;
    direction?: 'up' | 'down' | 'flat';
    className?: string;
}) {
    const Icon = direction === 'up' ? ArrowUp : direction === 'down' ? ArrowDown : Minus;
    const tone = direction === 'up' ? 'success' : direction === 'down' ? 'danger' : 'muted';

    return (
        <StatusBadge tone={tone} className={cn('gap-1 px-2 py-0.5', className)}>
            <Icon className="h-3.5 w-3.5" />
            {value}
        </StatusBadge>
    );
}

export function MetricCard({
    title,
    value,
    description,
    icon,
    trend,
    className,
}: {
    title: string;
    value: ReactNode;
    description?: ReactNode;
    icon?: ReactNode;
    trend?: ReactNode;
    className?: string;
}) {
    return (
        <section className={cn('waify-surface p-5', className)}>
            <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                    <p className="text-sm font-medium text-waify-text-muted dark:text-waify-dark-text-muted">{title}</p>
                    <div className="mt-2 text-2xl font-bold tracking-tight text-waify-text dark:text-waify-dark-text">{value}</div>
                </div>
                {icon && (
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-btn bg-waify-green-soft text-waify-green-dark dark:bg-waify-dark-green-soft dark:text-emerald-200">
                        {icon}
                    </div>
                )}
            </div>
            {(description || trend) && (
                <div className="mt-4 flex items-center justify-between gap-3 text-sm text-waify-text-muted dark:text-waify-dark-text-muted">
                    <span className="min-w-0 truncate">{description}</span>
                    {trend}
                </div>
            )}
        </section>
    );
}

export function GradientCard({
    title,
    description,
    icon,
    action,
    className,
}: {
    title: ReactNode;
    description?: ReactNode;
    icon?: ReactNode;
    action?: ReactNode;
    className?: string;
}) {
    return (
        <section className={cn('relative overflow-hidden rounded-2xl bg-gradient-to-br from-waify-green to-waify-green-dark p-5 text-white shadow-card', className)}>
            <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-white/10" />
            <div className="relative">
                {icon && <div className="mb-3 flex h-8 w-8 items-center justify-center rounded-md bg-white/15">{icon}</div>}
                <h3 className="font-semibold">{title}</h3>
                {description && <p className="mt-1 text-sm text-white/80">{description}</p>}
                {action && <div className="mt-3">{action}</div>}
            </div>
        </section>
    );
}

export function AddCard({
    children = 'Add new',
    className,
    ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { children?: ReactNode }) {
    return (
        <button
            type="button"
            className={cn('flex min-h-36 flex-col items-center justify-center rounded-2xl border-2 border-dashed border-gray-200 p-5 text-waify-text-muted transition hover:border-waify-green hover:bg-waify-green-soft/30 hover:text-waify-green-dark dark:border-waify-dark-border dark:text-waify-dark-text-muted dark:hover:bg-waify-dark-green-soft dark:hover:text-emerald-200', className)}
            {...props}
        >
            <span className="mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-white shadow-card dark:bg-waify-dark-surface">
                <PlusGlyph />
            </span>
            <span className="text-sm font-semibold">{children}</span>
        </button>
    );
}

function PlusGlyph() {
    return (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
        </svg>
    );
}

export function PageHeader({
    title,
    description,
    eyebrow,
    actions,
    className,
}: {
    title: ReactNode;
    description?: ReactNode;
    eyebrow?: ReactNode;
    actions?: ReactNode;
    className?: string;
}) {
    return (
        <div className={cn('flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between', className)}>
            <div className="min-w-0">
                {eyebrow && <div className="mb-2 text-xs font-semibold uppercase tracking-wider text-waify-green-dark dark:text-emerald-300">{eyebrow}</div>}
                <h1 className="text-2xl font-bold tracking-tight text-waify-text dark:text-waify-dark-text">{title}</h1>
                {description && <p className="mt-1 max-w-3xl text-sm text-waify-text-muted dark:text-waify-dark-text-muted">{description}</p>}
            </div>
            {actions && <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div>}
        </div>
    );
}

export function SectionHeader({
    title,
    description,
    actions,
    className,
}: {
    title: ReactNode;
    description?: ReactNode;
    actions?: ReactNode;
    className?: string;
}) {
    return (
        <div className={cn('flex items-start justify-between gap-4', className)}>
            <div>
                <h2 className="text-base font-semibold text-waify-text dark:text-waify-dark-text">{title}</h2>
                {description && <p className="mt-1 text-sm text-waify-text-muted dark:text-waify-dark-text-muted">{description}</p>}
            </div>
            {actions && <div className="flex shrink-0 items-center gap-2">{actions}</div>}
        </div>
    );
}

export function Toolbar({
    search,
    filters,
    actions,
    className,
}: {
    search?: { value: string; onChange: (value: string) => void; placeholder?: string };
    filters?: ReactNode;
    actions?: ReactNode;
    className?: string;
}) {
    return (
        <div className={cn('flex flex-col gap-3 rounded-card border border-gray-100 bg-white p-3 shadow-card dark:border-waify-dark-border dark:bg-waify-dark-surface dark:shadow-none md:flex-row md:items-center md:justify-between', className)}>
            <div className="flex flex-1 flex-col gap-3 sm:flex-row sm:items-center">
                {search && (
                    <label className="relative block min-w-0 flex-1">
                        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-waify-text-muted dark:text-waify-dark-text-muted" />
                        <input
                            value={search.value}
                            onChange={(event) => search.onChange(event.target.value)}
                            placeholder={search.placeholder || 'Search'}
                            className="waify-input pl-9"
                        />
                    </label>
                )}
                {filters && <div className="flex flex-wrap items-center gap-2">{filters}</div>}
            </div>
            {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
        </div>
    );
}

export function InputGroup({
    label,
    children,
    helper,
    error,
    success,
    className,
}: {
    label?: ReactNode;
    children: ReactNode;
    helper?: ReactNode;
    error?: ReactNode;
    success?: ReactNode;
    className?: string;
}) {
    return (
        <label className={cn('block', className)}>
            {label && <span className="mb-1.5 block text-sm font-medium text-waify-text dark:text-waify-dark-text">{label}</span>}
            {children}
            {error && <span className="mt-1.5 block text-xs text-red-600 dark:text-red-300">{error}</span>}
            {!error && success && <span className="mt-1.5 flex items-center gap-1 text-xs text-emerald-600 dark:text-emerald-300"><Check className="h-3 w-3" />{success}</span>}
            {!error && !success && helper && <span className="mt-1.5 block text-xs text-waify-text-muted dark:text-waify-dark-text-muted">{helper}</span>}
        </label>
    );
}

export function TextInputShell({
    leading,
    trailing,
    prefix,
    suffix,
    children,
    state = 'default',
    className,
}: {
    leading?: ReactNode;
    trailing?: ReactNode;
    prefix?: ReactNode;
    suffix?: ReactNode;
    children: ReactNode;
    state?: 'default' | 'success' | 'error';
    className?: string;
}) {
    const stateClass = {
        default: 'focus-within:border-waify-green focus-within:ring-waify-green/15 dark:focus-within:ring-waify-green/25',
        success: 'border-emerald-400 ring-2 ring-emerald-100 dark:border-emerald-500/60 dark:ring-emerald-500/20',
        error: 'border-red-400 ring-2 ring-red-100 dark:border-red-500/60 dark:ring-red-500/20',
    };

    return (
        <div className={cn('flex min-h-10 items-center overflow-hidden rounded-btn border border-gray-200 bg-white text-sm shadow-sm transition focus-within:ring-2 dark:border-waify-dark-border dark:bg-waify-dark-surface', stateClass[state], className)}>
            {prefix && <span className="inline-flex h-10 items-center border-r border-gray-200 bg-gray-50 px-3 text-gray-500 dark:border-waify-dark-border dark:bg-waify-dark-surface-2 dark:text-waify-dark-text-muted">{prefix}</span>}
            {leading && <span className="ml-3 text-gray-400 dark:text-waify-dark-text-muted">{leading}</span>}
            <div className="min-w-0 flex-1 [&_input]:h-10 [&_input]:w-full [&_input]:border-0 [&_input]:bg-transparent [&_input]:px-3 [&_input]:text-sm [&_input]:shadow-none [&_input]:outline-none [&_input]:ring-0 [&_input]:focus:ring-0">
                {children}
            </div>
            {trailing && <span className="mr-3 text-gray-400 dark:text-waify-dark-text-muted">{trailing}</span>}
            {suffix && <span className="inline-flex h-10 items-center border-l border-gray-200 bg-gray-50 px-3 text-gray-500 dark:border-waify-dark-border dark:bg-waify-dark-surface-2 dark:text-waify-dark-text-muted">{suffix}</span>}
        </div>
    );
}

export function TextareaComposer({
    value,
    onChange,
    count,
    max = 1024,
    className,
}: {
    value: string;
    onChange?: (value: string) => void;
    count?: number;
    max?: number;
    className?: string;
}) {
    const currentCount = count ?? value.length;

    return (
        <div className={cn('overflow-hidden rounded-btn border border-gray-200 bg-white transition focus-within:border-waify-green focus-within:ring-2 focus-within:ring-waify-green/15 dark:border-waify-dark-border dark:bg-waify-dark-surface dark:focus-within:ring-waify-green/25', className)}>
            <textarea
                rows={4}
                value={value}
                onChange={(event) => onChange?.(event.target.value)}
                className="w-full resize-none border-0 bg-transparent p-3 text-sm text-waify-text shadow-none outline-none ring-0 focus:ring-0 dark:text-waify-dark-text"
            />
            <div className="flex items-center justify-between border-t border-gray-100 px-2.5 py-1.5 dark:border-waify-dark-border">
                <div className="flex items-center gap-0.5">
                    {['B', 'I', 'S'].map((item) => (
                        <button key={item} type="button" className="flex h-7 w-7 items-center justify-center rounded-md text-xs text-gray-500 hover:bg-gray-100 dark:text-waify-dark-text-muted dark:hover:bg-waify-dark-surface-2">
                            <span className={cn(item === 'B' && 'font-bold', item === 'I' && 'italic', item === 'S' && 'line-through')}>{item}</span>
                        </button>
                    ))}
                    <div className="mx-1 h-4 w-px bg-gray-200 dark:bg-waify-dark-border" />
                    <button type="button" className="flex h-7 items-center gap-1 rounded-md px-2 text-[11px] font-medium text-gray-600 hover:bg-gray-100 dark:text-waify-dark-text-muted dark:hover:bg-waify-dark-surface-2">
                        <PlusGlyph />
                        Variable
                    </button>
                </div>
                <span className="text-[10px] tabular-nums text-waify-text-muted dark:text-waify-dark-text-muted">{currentCount} / {max}</span>
            </div>
        </div>
    );
}

export function CheckboxField({
    label,
    description,
    className,
    ...props
}: InputHTMLAttributes<HTMLInputElement> & { label: ReactNode; description?: ReactNode }) {
    return (
        <label className={cn('flex cursor-pointer items-start gap-2 text-sm text-waify-text dark:text-waify-dark-text', props.disabled && 'cursor-not-allowed opacity-50', className)}>
            <input type="checkbox" className="mt-0.5 h-4 w-4 rounded border-gray-300 text-waify-green focus:ring-waify-green/25" {...props} />
            <span>
                <span className="block font-medium">{label}</span>
                {description && <span className="mt-0.5 block text-xs text-waify-text-muted dark:text-waify-dark-text-muted">{description}</span>}
            </span>
        </label>
    );
}

export function RadioField({
    label,
    description,
    className,
    ...props
}: InputHTMLAttributes<HTMLInputElement> & { label: ReactNode; description?: ReactNode }) {
    return (
        <label className={cn('flex cursor-pointer items-start gap-2 text-sm text-waify-text dark:text-waify-dark-text', props.disabled && 'cursor-not-allowed opacity-50', className)}>
            <input type="radio" className="mt-0.5 h-4 w-4 border-gray-300 text-waify-green focus:ring-waify-green/25" {...props} />
            <span>
                <span className="block font-medium">{label}</span>
                {description && <span className="mt-0.5 block text-xs text-waify-text-muted dark:text-waify-dark-text-muted">{description}</span>}
            </span>
        </label>
    );
}

export function RadioCard({
    title,
    description,
    children,
    className,
    ...props
}: InputHTMLAttributes<HTMLInputElement> & { title: ReactNode; description?: ReactNode; children?: ReactNode }) {
    return (
        <label className={cn('block cursor-pointer rounded-btn border border-gray-200 bg-white p-3 transition has-[:checked]:border-waify-green has-[:checked]:bg-waify-green-soft/40 has-[:checked]:ring-1 has-[:checked]:ring-waify-green dark:border-waify-dark-border dark:bg-waify-dark-surface dark:has-[:checked]:bg-waify-dark-green-soft', className)}>
            <div className="flex items-start gap-2">
                <input type="radio" className="mt-0.5 h-4 w-4 border-gray-300 text-waify-green focus:ring-waify-green/25" {...props} />
                <span className="min-w-0">
                    <span className="block text-sm font-semibold text-waify-text dark:text-waify-dark-text">{title}</span>
                    {description && <span className="mt-0.5 block text-xs text-waify-text-muted dark:text-waify-dark-text-muted">{description}</span>}
                    {children && <span className="mt-2 block">{children}</span>}
                </span>
            </div>
        </label>
    );
}

export function Breadcrumb({
    items,
    className,
}: {
    items: Array<{ label: ReactNode; href?: string }>;
    className?: string;
}) {
    return (
        <nav className={cn('flex items-center gap-2 text-sm text-waify-text-muted dark:text-waify-dark-text-muted', className)} aria-label="Breadcrumb">
            {items.map((item, index) => (
                <Fragment key={index}>
                    {index > 0 && <ChevronRight className="h-4 w-4" />}
                    {item.href ? (
                        <a href={item.href} className="font-medium hover:text-waify-green-dark dark:hover:text-emerald-300">
                            {item.label}
                        </a>
                    ) : (
                        <span className="font-semibold text-waify-text dark:text-waify-dark-text">{item.label}</span>
                    )}
                </Fragment>
            ))}
        </nav>
    );
}

export function Kbd({ className, ...props }: HTMLAttributes<HTMLElement>) {
    return (
        <kbd
            className={cn('inline-flex min-w-5 items-center justify-center rounded border border-gray-200 bg-gray-50 px-1.5 py-0.5 font-mono text-[11px] font-semibold text-waify-text-muted shadow-sm dark:border-waify-dark-border dark:bg-waify-dark-surface-2 dark:text-waify-dark-text-muted', className)}
            {...props}
        />
    );
}

export function Stepper({
    steps,
    current,
    className,
}: {
    steps: Array<{ title: ReactNode; description?: ReactNode; status?: 'complete' | 'current' | 'pending' | 'error' }>;
    current?: number;
    className?: string;
}) {
    return (
        <ol className={cn('space-y-3', className)}>
            {steps.map((step, index) => {
                const inferred = index < (current || 0) ? 'complete' : index === current ? 'current' : 'pending';
                const status = step.status || inferred;
                const complete = status === 'complete';
                const active = status === 'current';
                const error = status === 'error';

                return (
                    <li key={index} className="flex gap-3">
                        <span
                            className={cn(
                                'mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full border text-xs font-bold',
                                complete && 'border-waify-green bg-waify-green text-waify-ink',
                                active && 'border-waify-green bg-waify-green-soft text-waify-green-dark dark:bg-waify-dark-green-soft dark:text-emerald-200',
                                error && 'border-red-300 bg-red-50 text-red-600 dark:border-red-500/40 dark:bg-red-500/10 dark:text-red-200',
                                status === 'pending' && 'border-gray-200 bg-white text-waify-text-muted dark:border-waify-dark-border dark:bg-waify-dark-surface dark:text-waify-dark-text-muted',
                            )}
                        >
                            {complete ? <Check className="h-4 w-4" /> : index + 1}
                        </span>
                        <span className="min-w-0">
                            <span className="block text-sm font-semibold text-waify-text dark:text-waify-dark-text">{step.title}</span>
                            {step.description && <span className="mt-0.5 block text-sm text-waify-text-muted dark:text-waify-dark-text-muted">{step.description}</span>}
                        </span>
                    </li>
                );
            })}
        </ol>
    );
}

export function HorizontalStepper({
    steps,
    current = 0,
    className,
}: {
    steps: ReactNode[];
    current?: number;
    className?: string;
}) {
    return (
        <ol className={cn('flex items-center overflow-x-auto', className)}>
            {steps.map((step, index) => {
                const complete = index < current;
                const active = index === current;

                return (
                    <li key={index} className="flex min-w-fit flex-1 items-center">
                        <div className="flex shrink-0 items-center gap-2">
                            <span className={cn(
                                'flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold',
                                complete && 'bg-waify-green text-white',
                                active && 'bg-waify-green text-white ring-4 ring-waify-green/20',
                                !complete && !active && 'bg-white text-waify-text-muted ring-1 ring-gray-200 dark:bg-waify-dark-surface dark:text-waify-dark-text-muted dark:ring-waify-dark-border',
                            )}>
                                {complete ? <Check className="h-4 w-4" /> : index + 1}
                            </span>
                            <span className={cn('text-xs font-medium', !complete && !active && 'text-waify-text-muted dark:text-waify-dark-text-muted')}>{step}</span>
                        </div>
                        {index < steps.length - 1 && (
                            <span className={cn('mx-3 h-0.5 min-w-8 flex-1', index < current ? 'bg-waify-green' : 'bg-gray-200 dark:bg-waify-dark-border')} />
                        )}
                    </li>
                );
            })}
        </ol>
    );
}

export function PaginationControl({
    page,
    pages,
    onPageChange,
    total,
    perPage,
    className,
}: {
    page: number;
    pages: number;
    onPageChange?: (page: number) => void;
    total?: number;
    perPage?: number;
    className?: string;
}) {
    const visiblePages = useMemo(() => {
        const base = Array.from({ length: Math.min(pages, 3) }, (_, index) => Math.max(1, Math.min(pages - 2, page - 1)) + index);
        return Array.from(new Set([1, ...base, pages])).filter((item) => item >= 1 && item <= pages);
    }, [page, pages]);
    const start = total && perPage ? (page - 1) * perPage + 1 : null;
    const end = total && perPage ? Math.min(page * perPage, total) : null;

    return (
        <div className={cn('flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between', className)}>
            {start && end && (
                <div className="text-xs text-waify-text-muted dark:text-waify-dark-text-muted">
                    Showing <span className="font-medium text-waify-text dark:text-waify-dark-text">{start}-{end}</span> of <span className="font-medium text-waify-text dark:text-waify-dark-text">{total}</span>
                </div>
            )}
            <div className="flex items-center gap-1">
                <IconButton size="sm" variant="outline" disabled={page <= 1} onClick={() => onPageChange?.(page - 1)} aria-label="Previous page">
                    <ChevronLeft className="h-4 w-4" />
                </IconButton>
                {visiblePages.map((item, index) => (
                    <Fragment key={item}>
                        {index > 0 && item - visiblePages[index - 1] > 1 && <span className="px-1 text-gray-400">...</span>}
                        <button
                            type="button"
                            onClick={() => onPageChange?.(item)}
                            className={cn(
                                'h-8 min-w-8 rounded-md px-2 text-xs transition',
                                item === page
                                    ? 'bg-waify-text font-semibold text-white dark:bg-waify-dark-text dark:text-waify-dark-bg'
                                    : 'font-medium text-waify-text ring-1 ring-inset ring-gray-200 hover:bg-gray-50 dark:text-waify-dark-text dark:ring-waify-dark-border dark:hover:bg-waify-dark-surface-2',
                            )}
                        >
                            {item}
                        </button>
                    </Fragment>
                ))}
                <IconButton size="sm" variant="outline" disabled={page >= pages} onClick={() => onPageChange?.(page + 1)} aria-label="Next page">
                    <ChevronRight className="h-4 w-4" />
                </IconButton>
            </div>
        </div>
    );
}

export function CircularProgress({
    value,
    size = 96,
    label,
    className,
}: {
    value: number;
    size?: number;
    label?: ReactNode;
    className?: string;
}) {
    const clamped = Math.max(0, Math.min(value, 100));

    return (
        <div className={cn('relative inline-flex items-center justify-center', className)} style={{ width: size, height: size }}>
            <svg viewBox="0 0 36 36" className="-rotate-90" width={size} height={size}>
                <circle cx="18" cy="18" r="15.9" fill="none" stroke="currentColor" strokeWidth="3" className="text-gray-200 dark:text-waify-dark-surface-2" />
                <circle cx="18" cy="18" r="15.9" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeDasharray={`${clamped} 100`} className="text-waify-green" />
            </svg>
            <div className="absolute text-center">
                <div className="text-sm font-bold text-waify-text dark:text-waify-dark-text">{clamped}%</div>
                {label && <div className="text-[10px] text-waify-text-muted dark:text-waify-dark-text-muted">{label}</div>}
            </div>
        </div>
    );
}

export function Modal({
    open,
    onClose,
    title,
    description,
    children,
    footer,
    className,
}: {
    open: boolean;
    onClose: () => void;
    title: ReactNode;
    description?: ReactNode;
    children: ReactNode;
    footer?: ReactNode;
    className?: string;
}) {
    return (
        <Transition show={open} as={Fragment}>
            <div className="fixed inset-0 z-[250] overflow-y-auto">
                <TransitionChild as={Fragment} enter="ease-out duration-200" enterFrom="opacity-0" enterTo="opacity-100" leave="ease-in duration-150" leaveFrom="opacity-100" leaveTo="opacity-0">
                    <button type="button" className="fixed inset-0 bg-waify-ink/45 backdrop-blur-sm dark:bg-black/70" onClick={onClose} aria-label="Close modal" />
                </TransitionChild>
                <div className="flex min-h-full items-center justify-center p-4">
                    <TransitionChild as={Fragment} enter="ease-out duration-200" enterFrom="opacity-0 translate-y-3 scale-95" enterTo="opacity-100 translate-y-0 scale-100" leave="ease-in duration-150" leaveFrom="opacity-100 translate-y-0 scale-100" leaveTo="opacity-0 translate-y-3 scale-95">
                        <section className={cn('relative w-full max-w-lg overflow-hidden rounded-card border border-gray-100 bg-white shadow-pop dark:border-waify-dark-border dark:bg-waify-dark-surface', className)}>
                            <div className="flex items-start justify-between gap-4 border-b border-gray-100 px-5 py-4 dark:border-waify-dark-border">
                                <div>
                                    <h2 className="text-base font-semibold text-waify-text dark:text-waify-dark-text">{title}</h2>
                                    {description && <p className="mt-1 text-sm text-waify-text-muted dark:text-waify-dark-text-muted">{description}</p>}
                                </div>
                                <IconButton size="sm" onClick={onClose} aria-label="Close">
                                    <X className="h-4 w-4" />
                                </IconButton>
                            </div>
                            <div className="px-5 py-4">{children}</div>
                            {footer && <div className="flex justify-end gap-2 border-t border-gray-100 bg-gray-50/70 px-5 py-4 dark:border-waify-dark-border dark:bg-waify-dark-surface-2/70">{footer}</div>}
                        </section>
                    </TransitionChild>
                </div>
            </div>
        </Transition>
    );
}

export function Drawer({
    open,
    onClose,
    title,
    description,
    children,
    footer,
    side = 'right',
    className,
}: {
    open: boolean;
    onClose: () => void;
    title: ReactNode;
    description?: ReactNode;
    children: ReactNode;
    footer?: ReactNode;
    side?: 'left' | 'right';
    className?: string;
}) {
    const defaultWidthClass = className ? '' : 'sm:max-w-md';

    return (
        <Transition show={open} as={Fragment}>
            <div className="fixed inset-0 z-[250] overflow-hidden">
                <TransitionChild as={Fragment} enter="ease-out duration-200" enterFrom="opacity-0" enterTo="opacity-100" leave="ease-in duration-150" leaveFrom="opacity-100" leaveTo="opacity-0">
                    <button type="button" className="fixed inset-0 bg-waify-ink/45 backdrop-blur-sm dark:bg-black/70" onClick={onClose} aria-label="Close drawer" />
                </TransitionChild>
                <div className={cn('fixed inset-y-0 flex max-w-full', side === 'right' ? 'right-0 pl-0 sm:pl-10' : 'left-0 pr-0 sm:pr-10')}>
                    <TransitionChild as={Fragment} enter="transform transition ease-out duration-200" enterFrom={side === 'right' ? 'translate-x-full' : '-translate-x-full'} enterTo="translate-x-0" leave="transform transition ease-in duration-150" leaveFrom="translate-x-0" leaveTo={side === 'right' ? 'translate-x-full' : '-translate-x-full'}>
                        <section className={cn('flex h-full w-screen max-w-[100vw] flex-col border-gray-100 bg-white shadow-pop dark:border-waify-dark-border dark:bg-waify-dark-surface', defaultWidthClass, side === 'right' ? 'border-l' : 'border-r', className)}>
                            <div className="flex items-start justify-between gap-4 border-b border-gray-100 px-4 py-4 dark:border-waify-dark-border sm:px-5">
                                <div className="min-w-0">
                                    <h2 className="break-words text-base font-semibold text-waify-text dark:text-waify-dark-text">{title}</h2>
                                    {description && <p className="mt-1 text-sm text-waify-text-muted dark:text-waify-dark-text-muted">{description}</p>}
                                </div>
                                <IconButton size="sm" onClick={onClose} aria-label="Close" className="shrink-0">
                                    <X className="h-4 w-4" />
                                </IconButton>
                            </div>
                            <div className="flex-1 overflow-y-auto px-4 py-4 waify-scrollbar sm:px-5">{children}</div>
                            {footer && <div className="border-t border-gray-100 bg-gray-50/70 px-4 py-4 dark:border-waify-dark-border dark:bg-waify-dark-surface-2/70 sm:px-5">{footer}</div>}
                        </section>
                    </TransitionChild>
                </div>
            </div>
        </Transition>
    );
}

export function FileDropzone({
    label = 'Upload file',
    description = 'Drag and drop a file here, or click to browse.',
    accept,
    onFile,
    className,
}: {
    label?: ReactNode;
    description?: ReactNode;
    accept?: string;
    onFile?: (file: File) => void;
    className?: string;
}) {
    const inputRef = useRef<HTMLInputElement | null>(null);

    return (
        <button
            type="button"
            onClick={() => inputRef.current?.click()}
            onDragOver={(event) => event.preventDefault()}
            onDrop={(event) => {
                event.preventDefault();
                const file = event.dataTransfer.files?.[0];
                if (file) {
                    onFile?.(file);
                }
            }}
            className={cn('flex w-full flex-col items-center justify-center rounded-card border border-dashed border-gray-300 bg-gray-50/70 px-5 py-8 text-center transition hover:border-waify-green hover:bg-waify-green-soft/60 dark:border-waify-dark-border dark:bg-waify-dark-surface-2/50 dark:hover:bg-waify-dark-green-soft', className)}
        >
            <input
                ref={inputRef}
                type="file"
                accept={accept}
                className="hidden"
                onChange={(event) => {
                    const file = event.target.files?.[0];
                    if (file) {
                        onFile?.(file);
                    }
                }}
            />
            <span className="flex h-11 w-11 items-center justify-center rounded-full bg-white text-waify-green-dark shadow-sm dark:bg-waify-dark-surface dark:text-emerald-200">
                <CloudUpload className="h-5 w-5" />
            </span>
            <span className="mt-3 text-sm font-semibold text-waify-text dark:text-waify-dark-text">{label}</span>
            <span className="mt-1 max-w-sm text-sm text-waify-text-muted dark:text-waify-dark-text-muted">{description}</span>
        </button>
    );
}

export function UploadedFileRow({
    name,
    meta,
    progress,
    status = 'uploading',
    onRemove,
    className,
}: {
    name: ReactNode;
    meta?: ReactNode;
    progress?: number;
    status?: 'uploading' | 'done' | 'error';
    onRemove?: () => void;
    className?: string;
}) {
    const done = status === 'done';
    const error = status === 'error';

    return (
        <div className={cn(
            'flex items-center gap-3 rounded-btn p-3',
            done ? 'bg-emerald-50 ring-1 ring-emerald-100 dark:bg-emerald-500/12 dark:ring-emerald-500/20' : error ? 'bg-red-50 ring-1 ring-red-100 dark:bg-red-500/12 dark:ring-red-500/20' : 'bg-gray-50 dark:bg-waify-dark-surface-2',
            className,
        )}>
            <div className={cn('flex h-10 w-10 shrink-0 items-center justify-center rounded-md', done ? 'bg-white text-emerald-500 dark:bg-waify-dark-surface' : error ? 'bg-white text-red-500 dark:bg-waify-dark-surface' : 'bg-blue-50 text-blue-600 dark:bg-blue-500/12 dark:text-blue-200')}>
                {done ? <Check className="h-5 w-5" /> : <FileText className="h-5 w-5" />}
            </div>
            <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-3">
                    <div className="truncate text-sm font-medium text-waify-text dark:text-waify-dark-text">{name}</div>
                    {onRemove && (
                        <button type="button" onClick={onRemove} className="text-gray-400 transition hover:text-red-600 dark:hover:text-red-300" aria-label="Remove file">
                            <X className="h-4 w-4" />
                        </button>
                    )}
                </div>
                {typeof progress === 'number' && !done && (
                    <div className="mt-1 h-1 overflow-hidden rounded-full bg-gray-200 dark:bg-waify-dark-border">
                        <div className="h-full rounded-full bg-waify-green" style={{ width: `${Math.max(0, Math.min(progress, 100))}%` }} />
                    </div>
                )}
                {meta && <div className="mt-1 text-[11px] text-waify-text-muted dark:text-waify-dark-text-muted">{meta}</div>}
            </div>
        </div>
    );
}

export function OtpInput({
    value,
    onChange,
    length = 6,
    className,
}: {
    value: string;
    onChange: (value: string) => void;
    length?: number;
    className?: string;
}) {
    const chars = value.padEnd(length).slice(0, length).split('');

    return (
        <div className={cn('flex gap-2', className)}>
            {chars.map((char, index) => (
                <input
                    key={index}
                    value={char.trim()}
                    onChange={(event) => {
                        const next = value.split('');
                        next[index] = event.target.value.replace(/\D/g, '').slice(-1);
                        onChange(next.join('').slice(0, length));
                    }}
                    inputMode="numeric"
                    className="h-11 w-10 rounded-btn border border-gray-200 bg-white text-center text-base font-bold text-waify-text shadow-sm focus:border-waify-green focus:outline-none focus:ring-2 focus:ring-waify-green/20 dark:border-waify-dark-border dark:bg-waify-dark-surface dark:text-waify-dark-text"
                    maxLength={1}
                />
            ))}
        </div>
    );
}

export function SliderField({
    label,
    value,
    min = 0,
    max = 100,
    suffix,
    onChange,
    className,
}: {
    label: ReactNode;
    value: number;
    min?: number;
    max?: number;
    suffix?: string;
    onChange?: (value: number) => void;
    className?: string;
}) {
    return (
        <label className={cn('block space-y-2', className)}>
            <span className="flex items-center justify-between gap-3 text-sm font-medium text-waify-text dark:text-waify-dark-text">
                {label}
                <span className="text-waify-text-muted dark:text-waify-dark-text-muted">
                    {value}
                    {suffix}
                </span>
            </span>
            <input
                type="range"
                min={min}
                max={max}
                value={value}
                onChange={(event) => onChange?.(Number(event.target.value))}
                className="h-2 w-full cursor-pointer appearance-none rounded-full bg-gray-200 accent-waify-green dark:bg-waify-dark-surface-2"
            />
        </label>
    );
}

export function PhonePreview({
    title = 'WhatsApp',
    subtitle = 'Business account',
    children,
    className,
}: {
    title?: ReactNode;
    subtitle?: ReactNode;
    children: ReactNode;
    className?: string;
}) {
    return (
        <div className={cn('mx-auto w-full max-w-[320px] rounded-[28px] border border-gray-200 bg-waify-ink p-2 shadow-card-lg dark:border-waify-dark-border', className)}>
            <div className="overflow-hidden rounded-[22px] bg-[#e6ddd4] dark:bg-[#111827]">
                <div className="flex items-center gap-3 bg-waify-green-darker px-4 py-3 text-white">
                    <Avatar name={String(title)} size="sm" className="bg-white text-waify-green-darker" />
                    <div className="min-w-0">
                        <p className="truncate text-sm font-semibold">{title}</p>
                        <p className="truncate text-xs text-white/75">{subtitle}</p>
                    </div>
                </div>
                <div className="min-h-[420px] space-y-3 p-3">{children}</div>
            </div>
        </div>
    );
}

export function ChatBubble({
    children,
    inbound = false,
    time,
    status,
    className,
}: {
    children: ReactNode;
    inbound?: boolean;
    time?: ReactNode;
    status?: 'sent' | 'delivered' | 'read' | 'pending';
    className?: string;
}) {
    return (
        <div className={cn('flex', inbound ? 'justify-start' : 'justify-end')}>
            <div className={cn('max-w-[82%] rounded-lg px-3 py-2 text-sm shadow-sm', inbound ? 'bg-white text-waify-text dark:bg-waify-dark-surface dark:text-waify-dark-text' : 'bg-[#dcf8c6] text-waify-text dark:bg-waify-dark-green-soft dark:text-waify-dark-text', className)}>
                <div>{children}</div>
                {(time || status) && (
                    <div className="mt-1 flex items-center justify-end gap-1 text-[10px] text-waify-text-muted dark:text-waify-dark-text-muted">
                        {time}
                        {status === 'pending' && <Loader2 className="h-3 w-3 animate-spin" />}
                        {status === 'sent' && <Check className="h-3 w-3" />}
                        {status === 'delivered' && <CheckCircle2 className="h-3 w-3" />}
                        {status === 'read' && <CheckCircle2 className="h-3 w-3 text-sky-500" />}
                    </div>
                )}
            </div>
        </div>
    );
}

export function TypingBubble({ className }: { className?: string }) {
    return (
        <div className={cn('flex justify-start', className)}>
            <div className="flex items-center gap-1 rounded-2xl bg-white px-3 py-2 shadow-sm dark:bg-waify-dark-surface">
                {[0, 150, 300].map((delay) => (
                    <span key={delay} className="h-1.5 w-1.5 animate-pulse rounded-full bg-gray-400" style={{ animationDelay: `${delay}ms` }} />
                ))}
            </div>
        </div>
    );
}

export function Tooltip({
    content,
    side = 'top',
    children,
    className,
}: {
    content: ReactNode;
    side?: 'top' | 'right' | 'bottom' | 'left';
    children: ReactNode;
    className?: string;
}) {
    const positions = {
        top: 'bottom-full left-1/2 mb-2 -translate-x-1/2',
        right: 'left-full top-1/2 ml-2 -translate-y-1/2',
        bottom: 'left-1/2 top-full mt-2 -translate-x-1/2',
        left: 'right-full top-1/2 mr-2 -translate-y-1/2',
    };

    return (
        <span className={cn('group relative inline-flex', className)}>
            {children}
            <span className={cn('pointer-events-none absolute z-20 whitespace-nowrap rounded bg-waify-text px-2 py-1 text-[11px] font-medium text-white opacity-0 shadow-pop transition group-hover:opacity-100 dark:bg-waify-dark-text dark:text-waify-dark-bg', positions[side])}>
                {content}
            </span>
        </span>
    );
}

export function DropdownMenu({
    trigger,
    items,
    align = 'left',
    className,
}: {
    trigger: ReactNode;
    items: Array<{ label: ReactNode; icon?: ReactNode; danger?: boolean; onClick?: () => void; separatorBefore?: boolean }>;
    align?: 'left' | 'right';
    className?: string;
}) {
    return (
        <div className={cn('group relative inline-block', className)}>
            {trigger}
            <div className={cn('invisible absolute top-11 z-20 w-52 rounded-btn bg-white py-1 opacity-0 shadow-pop ring-1 ring-gray-100 transition group-hover:visible group-hover:opacity-100 dark:bg-waify-dark-surface dark:ring-waify-dark-border', align === 'right' ? 'right-0' : 'left-0')}>
                {items.map((item, index) => (
                    <Fragment key={index}>
                        {item.separatorBefore && <div className="my-1 h-px bg-gray-100 dark:bg-waify-dark-border" />}
                        <button
                            type="button"
                            onClick={item.onClick}
                            className={cn(
                                'flex w-full items-center gap-2 px-3 py-2 text-left text-sm transition',
                                item.danger
                                    ? 'text-red-600 hover:bg-red-50 dark:text-red-300 dark:hover:bg-red-500/10'
                                    : 'text-waify-text hover:bg-gray-50 dark:text-waify-dark-text dark:hover:bg-waify-dark-surface-2',
                            )}
                        >
                            {item.icon && <span className="text-gray-500 dark:text-waify-dark-text-muted">{item.icon}</span>}
                            {item.label}
                        </button>
                    </Fragment>
                ))}
            </div>
        </div>
    );
}

export function DefaultActionMenu({ className }: { className?: string }) {
    return (
        <DropdownMenu
            className={className}
            trigger={
                <IconButton variant="outline" size="sm" aria-label="More actions">
                    <MoreHorizontal className="h-4 w-4" />
                </IconButton>
            }
            items={[
                { label: 'Edit', icon: <Edit3 className="h-3.5 w-3.5" /> },
                { label: 'Duplicate', icon: <Copy className="h-3.5 w-3.5" /> },
                { label: 'View', icon: <Eye className="h-3.5 w-3.5" /> },
                { label: 'Export', icon: <Download className="h-3.5 w-3.5" /> },
                { label: 'Delete', icon: <Trash2 className="h-3.5 w-3.5" />, danger: true, separatorBefore: true },
            ]}
        />
    );
}

export function EmptyPanel({
    icon,
    title,
    description,
    action,
    className,
}: {
    icon?: ReactNode;
    title: ReactNode;
    description?: ReactNode;
    action?: ReactNode;
    className?: string;
}) {
    return (
        <div className={cn('flex min-h-[220px] flex-col items-center justify-center rounded-card border border-dashed border-gray-200 bg-white px-6 py-10 text-center dark:border-waify-dark-border dark:bg-waify-dark-surface', className)}>
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-waify-green-soft text-waify-green-dark dark:bg-waify-dark-green-soft dark:text-emerald-200">
                {icon || <Info className="h-5 w-5" />}
            </div>
            <h3 className="mt-4 text-base font-semibold text-waify-text dark:text-waify-dark-text">{title}</h3>
            {description && <p className="mt-1 max-w-md text-sm text-waify-text-muted dark:text-waify-dark-text-muted">{description}</p>}
            {action && <div className="mt-5">{action}</div>}
        </div>
    );
}

export function ActionBar({
    saving,
    onCancel,
    onSave,
    saveLabel = 'Save changes',
    cancelLabel = 'Cancel',
    className,
}: {
    saving?: boolean;
    onCancel?: () => void;
    onSave?: () => void;
    saveLabel?: string;
    cancelLabel?: string;
    className?: string;
}) {
    return (
        <div className={cn('sticky bottom-0 z-10 flex items-center justify-end gap-2 border-t border-gray-100 bg-white/90 px-4 py-3 backdrop-blur dark:border-waify-dark-border dark:bg-waify-dark-surface/90', className)}>
            <Button type="button" variant="secondary" onClick={onCancel}>
                {cancelLabel}
            </Button>
            <Button type="button" onClick={onSave} disabled={saving}>
                {saving && <Loader2 className="h-4 w-4 animate-spin" />}
                {saveLabel}
            </Button>
        </div>
    );
}
