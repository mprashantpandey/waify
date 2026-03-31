import { Head, Link } from '@inertiajs/react';
import AppShell from '@/Layouts/AppShell';
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/UI/Card';
import Button from '@/Components/UI/Button';
import { Badge } from '@/Components/UI/Badge';
import { CheckCircle2, CircleDashed, Lock, TriangleAlert, Wrench } from 'lucide-react';

type ChecklistItem = {
    key: string;
    label: string;
    done: boolean;
    href: string;
    cta: string;
};

type Feature = {
    key: string;
    label: string;
    description: string;
    available: boolean;
    state: 'ready' | 'setup' | 'attention' | 'blocked' | 'locked';
    summary: string;
    href: string;
    cta: string;
};

type Props = {
    current_plan?: { key: string; name: string } | null;
    checklist: {
        completed: number;
        total: number;
        progress_percent: number;
        items: ChecklistItem[];
    };
    features: Feature[];
};

const stateStyles: Record<Feature['state'], { label: string; className: string; icon: typeof CheckCircle2 }> = {
    ready: {
        label: 'Ready',
        className: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300',
        icon: CheckCircle2,
    },
    setup: {
        label: 'Needs setup',
        className: 'bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
        icon: Wrench,
    },
    attention: {
        label: 'Needs review',
        className: 'bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300',
        icon: TriangleAlert,
    },
    blocked: {
        label: 'Blocked',
        className: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300',
        icon: CircleDashed,
    },
    locked: {
        label: 'Not included',
        className: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300',
        icon: Lock,
    },
};

export default function Setup({ current_plan, checklist, features }: Props) {
    return (
        <AppShell>
            <Head title="Setup" />

            <div className="mx-auto max-w-6xl space-y-6">
                <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
                    <div>
                        <h1 className="text-3xl font-semibold text-gray-900 dark:text-gray-100">Setup</h1>
                        <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                            See what is ready, what still needs setup, and what your current plan includes.
                        </p>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                        {current_plan?.name ? <Badge variant="default">Plan: {current_plan.name}</Badge> : null}
                        <Link href={route('app.billing.plans')}>
                            <Button variant="secondary">View Plans</Button>
                        </Link>
                    </div>
                </div>

                <Card>
                    <CardContent className="p-5">
                        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-900 dark:text-gray-100">Workspace progress</p>
                                <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                                    {checklist.completed} of {checklist.total} setup steps completed
                                </p>
                            </div>
                            <div className="w-full md:max-w-sm">
                                <div className="h-2 rounded-full bg-gray-100 dark:bg-gray-800">
                                    <div
                                        className="h-2 rounded-full bg-[color:var(--brand-primary)]"
                                        style={{ width: `${checklist.progress_percent}%` }}
                                    />
                                </div>
                                <p className="mt-2 text-right text-xs font-medium text-gray-500 dark:text-gray-400">
                                    {checklist.progress_percent}% complete
                                </p>
                            </div>
                        </div>

                        <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                            {checklist.items.map((item) => (
                                <div key={item.key} className="rounded-2xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-950">
                                    <div className="flex items-start justify-between gap-3">
                                        <div>
                                            <p className="font-medium text-gray-900 dark:text-gray-100">{item.label}</p>
                                        </div>
                                        <Badge variant={item.done ? 'success' : 'warning'}>
                                            {item.done ? 'Done' : 'To do'}
                                        </Badge>
                                    </div>
                                    <div className="mt-4">
                                        <Link href={item.href}>
                                            <Button size="sm" variant={item.done ? 'secondary' : 'primary'}>
                                                {item.cta}
                                            </Button>
                                        </Link>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                    {features.map((feature) => {
                        const style = stateStyles[feature.state];
                        const Icon = style.icon;

                        return (
                            <Card key={feature.key} className="h-full">
                                <CardHeader className="space-y-3">
                                    <div className="flex items-start justify-between gap-3">
                                        <div>
                                            <CardTitle className="text-lg">{feature.label}</CardTitle>
                                            <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">{feature.description}</p>
                                        </div>
                                        <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium ${style.className}`}>
                                            <Icon className="h-3.5 w-3.5" />
                                            {style.label}
                                        </span>
                                    </div>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{feature.summary}</p>
                                    <Link href={feature.available ? feature.href : route('app.billing.plans')}>
                                        <Button variant={feature.available ? 'secondary' : 'primary'} className="w-full justify-center">
                                            {feature.cta}
                                        </Button>
                                    </Link>
                                </CardContent>
                            </Card>
                        );
                    })}
                </div>
            </div>
        </AppShell>
    );
}
