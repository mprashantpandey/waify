import { Link } from '@inertiajs/react';
import { ArrowLeft, Home, type LucideIcon } from 'lucide-react';
import BrandLogo from '@/Components/Branding/BrandLogo';
import Button from '@/Components/UI/Button';
import { cn } from '@/lib/utils';

type Accent = 'green' | 'amber' | 'red';

interface ErrorFrameAction {
    label: string;
    href?: string;
    onClick?: () => void;
    icon?: LucideIcon;
    primary?: boolean;
}

interface ErrorFrameProps {
    code: string;
    title: string;
    description: string;
    icon: LucideIcon;
    accent?: Accent;
    actions?: ErrorFrameAction[];
}

const accentClasses: Record<Accent, { chip: string; icon: string; glow: string }> = {
    green: {
        chip: 'text-emerald-300',
        icon: 'bg-emerald-500/12 text-emerald-200 ring-emerald-400/25',
        glow: 'from-emerald-500/20',
    },
    amber: {
        chip: 'text-amber-300',
        icon: 'bg-amber-500/12 text-amber-200 ring-amber-400/25',
        glow: 'from-amber-500/20',
    },
    red: {
        chip: 'text-red-300',
        icon: 'bg-red-500/12 text-red-200 ring-red-400/25',
        glow: 'from-red-500/20',
    },
};

export function appDashboardHref() {
    return typeof route !== 'undefined' ? route('app.dashboard') : '/app/dashboard';
}

export function defaultBackAction(): ErrorFrameAction {
    return {
        label: 'Back',
        icon: ArrowLeft,
        onClick: () => window.history.back(),
    };
}

export function defaultDashboardAction(): ErrorFrameAction {
    return {
        label: 'Dashboard',
        icon: Home,
        href: appDashboardHref(),
    };
}

export default function ErrorFrame({
    code,
    title,
    description,
    icon: Icon,
    accent = 'green',
    actions = [defaultBackAction(), defaultDashboardAction()],
}: ErrorFrameProps) {
    const tone = accentClasses[accent];

    return (
        <main className="min-h-screen overflow-hidden bg-[#07111f] px-4 py-8 text-slate-100">
            <div className={cn('pointer-events-none fixed inset-x-0 top-0 h-72 bg-gradient-to-b to-transparent blur-3xl', tone.glow)} />
            <div className="relative mx-auto flex min-h-[calc(100vh-4rem)] w-full max-w-4xl items-center justify-center">
                <section className="w-full overflow-hidden rounded-2xl border border-slate-700/80 bg-slate-900/95 shadow-2xl shadow-black/30">
                    <div className="flex items-center justify-between border-b border-slate-800 px-6 py-5">
                        <BrandLogo variant="dark" imageClassName="h-8" fallbackTextClassName="text-white" />
                        <span className={cn('rounded-full border border-current/20 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em]', tone.chip)}>
                            {code}
                        </span>
                    </div>

                    <div className="grid gap-8 p-6 sm:p-8 md:grid-cols-[1fr_220px] md:items-center">
                        <div className="min-w-0">
                            <span className={cn('inline-flex h-12 w-12 items-center justify-center rounded-xl ring-1', tone.icon)}>
                                <Icon className="h-5 w-5" />
                            </span>
                            <h1 className="mt-5 text-3xl font-semibold tracking-tight text-white sm:text-4xl">{title}</h1>
                            <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-400 sm:text-base">{description}</p>

                            <div className="mt-7 flex flex-wrap gap-2">
                                {actions.map((action) => {
                                    const ActionIcon = action.icon;
                                    const button = (
                                        <Button
                                            type="button"
                                            variant={action.primary ? 'primary' : 'secondary'}
                                            onClick={action.onClick}
                                            className={!action.primary ? 'border-slate-700 bg-slate-800 text-slate-100 ring-slate-700 hover:bg-slate-700' : undefined}
                                        >
                                            {ActionIcon && <ActionIcon className="h-4 w-4" />}
                                            {action.label}
                                        </Button>
                                    );

                                    return action.href ? (
                                        <Link key={action.label} href={action.href}>
                                            {button}
                                        </Link>
                                    ) : (
                                        <span key={action.label}>{button}</span>
                                    );
                                })}
                            </div>
                        </div>

                        <div className="hidden rounded-2xl border border-slate-800 bg-[#0b1626] p-5 md:block">
                            <div className="space-y-3">
                                <div className="h-2 w-20 rounded-full bg-emerald-400/70" />
                                <div className="h-2 w-32 rounded-full bg-slate-700" />
                                <div className="h-2 w-24 rounded-full bg-slate-700" />
                            </div>
                            <div className="mt-8 grid grid-cols-3 gap-2">
                                {Array.from({ length: 9 }).map((_, index) => (
                                    <span key={index} className={cn('h-10 rounded-lg bg-slate-800', index === 4 && 'bg-emerald-500/20 ring-1 ring-emerald-400/20')} />
                                ))}
                            </div>
                        </div>
                    </div>
                </section>
            </div>
        </main>
    );
}
