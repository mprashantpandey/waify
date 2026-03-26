import { Head, Link, usePage } from '@inertiajs/react';
import { getPlatformName } from '@/lib/branding';
import { useEffect, useMemo, useState } from 'react';
import {
    ArrowRight,
    CheckCircle2,
    CreditCard,
    Inbox,
    MessageSquare,
    Sparkles,
    Workflow,
} from 'lucide-react';
import Button from '@/Components/UI/Button';
import axios from 'axios';
import PublicLayout from '@/Layouts/PublicLayout';

interface Stats {
    accounts: number;
    active_connections: number;
    templates: number;
    messages_sent: number;
    messages_received: number;
    conversations: number;
}

export default function Landing({
    stats: initialStats,
    canLogin,
    canRegister,
}: {
    stats: Stats;
    canLogin: boolean;
    canRegister: boolean;
}) {
    const { branding } = usePage().props as any;
    const platformName = getPlatformName(branding);
    const [stats, setStats] = useState<Stats>(initialStats);

    useEffect(() => {
        const interval = setInterval(async () => {
            try {
                const response = await axios.get(route('api.stats'));
                setStats(response.data.stats);
            } catch (error: any) {
                if (error?.response?.status !== 403) {
                    console.error('Failed to fetch stats:', error);
                }
            }
        }, 15000);

        return () => clearInterval(interval);
    }, []);

    const statBlocks = useMemo(
        () => [
            { label: 'Active accounts', value: stats.accounts.toLocaleString() },
            { label: 'Live numbers', value: stats.active_connections.toLocaleString() },
            { label: 'Templates managed', value: stats.templates.toLocaleString() },
            { label: 'Messages sent', value: stats.messages_sent.toLocaleString() },
        ],
        [stats],
    );

    const platformCards = [
        {
            icon: MessageSquare,
            title: 'Official WhatsApp setup',
            description: 'Connect business numbers with Embedded Signup, central webhooks, templates, and profile controls from one place.',
        },
        {
            icon: Inbox,
            title: 'Shared inbox for teams',
            description: 'Run assignments, reply windows, notes, tags, and handoffs without losing context between operators.',
        },
        {
            icon: Workflow,
            title: 'Automation that stays usable',
            description: 'Mix chatbots, AI replies, templates, and human takeover rules without building a fragile stack.',
        },
        {
            icon: CreditCard,
            title: 'Billing that matches usage',
            description: 'Track plan limits, wallet balance, Meta pricing, and growth without forcing teams into finance workflows.',
        },
    ];

    const outcomes = [
        'Launch a number without manual webhook setup',
        'Run support, sales, and broadcast work from one workspace',
        'Keep human and AI ownership visible in every conversation',
        'Track templates, profile settings, and billing in one product',
    ];

    return (
        <PublicLayout>
            <Head title={`${platformName} | WhatsApp operations platform`} />

            <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
                <section className="grid gap-8 lg:grid-cols-[1.1fr,0.9fr] lg:items-end">
                    <div className="rounded-[2rem] border border-black/10 bg-white/80 p-6 shadow-[0_24px_80px_-48px_rgba(15,23,42,0.5)] backdrop-blur sm:p-8 lg:p-10">
                        <div className="inline-flex items-center gap-2 rounded-full border border-emerald-900/10 bg-emerald-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.22em] text-emerald-800">
                            <Sparkles className="h-3.5 w-3.5" />
                            Official Meta tech provider
                        </div>
                        <h1 className="mt-5 max-w-4xl text-5xl font-semibold tracking-tight text-slate-950 sm:text-6xl lg:text-7xl">
                            WhatsApp operations without the usual admin mess.
                        </h1>
                        <p className="mt-5 max-w-3xl text-lg leading-8 text-slate-600">
                            {platformName} gives teams one clean system for onboarding, inbox work, templates, automation, AI replies, and billing. It is built for companies that want WhatsApp to run like an operating channel, not a side project.
                        </p>
                        <div className="mt-8 flex flex-wrap items-center gap-3">
                            {canRegister ? (
                                <Link href={route('register')}>
                                    <Button size="lg" className="rounded-full bg-[#0f766e] px-6 hover:bg-[#115e59]">
                                        Start free
                                        <ArrowRight className="ml-2 h-4 w-4" />
                                    </Button>
                                </Link>
                            ) : null}
                            <Link href={route('pricing')}>
                                <Button size="lg" variant="ghost" className="rounded-full border border-black/10 bg-white px-6">
                                    View pricing
                                </Button>
                            </Link>
                            {canLogin ? (
                                <Link href={route('login')} className="text-sm font-medium text-slate-600 hover:text-slate-950">
                                    Already using {platformName}? Sign in.
                                </Link>
                            ) : null}
                        </div>
                    </div>

                    <div className="rounded-[2rem] border border-black/10 bg-[#0f172a] p-6 text-white shadow-[0_32px_120px_-48px_rgba(15,23,42,0.85)] sm:p-8">
                        <div className="grid gap-4 sm:grid-cols-2">
                            {statBlocks.map((item) => (
                                <div key={item.label} className="rounded-3xl border border-white/10 bg-white/5 p-5">
                                    <p className="text-sm text-slate-300">{item.label}</p>
                                    <p className="mt-3 text-3xl font-semibold">{item.value}</p>
                                </div>
                            ))}
                        </div>
                        <div className="mt-6 rounded-3xl border border-emerald-400/15 bg-emerald-400/10 p-5">
                            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-emerald-200">Why teams switch</p>
                            <ul className="mt-4 space-y-3 text-sm text-slate-200">
                                {outcomes.map((item) => (
                                    <li key={item} className="flex items-start gap-3">
                                        <CheckCircle2 className="mt-0.5 h-4 w-4 text-emerald-300" />
                                        <span>{item}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </section>

                <section id="platform" className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                    {platformCards.map((card) => (
                        <div key={card.title} className="rounded-[1.75rem] border border-black/10 bg-white p-6 shadow-[0_24px_80px_-56px_rgba(15,23,42,0.55)]">
                            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700">
                                <card.icon className="h-6 w-6" />
                            </div>
                            <h2 className="mt-5 text-xl font-semibold text-slate-950">{card.title}</h2>
                            <p className="mt-3 text-sm leading-7 text-slate-600">{card.description}</p>
                        </div>
                    ))}
                </section>

                <section className="mt-16 grid gap-8 lg:grid-cols-[0.9fr,1.1fr] lg:items-start">
                    <div className="rounded-[2rem] border border-black/10 bg-white p-6 shadow-[0_24px_80px_-52px_rgba(15,23,42,0.45)] sm:p-8">
                        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-emerald-800">Built for daily operations</p>
                        <h2 className="mt-4 text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">
                            Run WhatsApp like a proper revenue and support system.
                        </h2>
                        <p className="mt-4 text-base leading-8 text-slate-600">
                            The product is designed around the work teams actually do: connect numbers, manage the inbox, keep templates usable, automate repeat questions, and make billing understandable to operators and owners.
                        </p>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                        <MarketingStep
                            number="01"
                            title="Connect your number"
                            description="Use Embedded Signup, sync the WhatsApp profile, and centralize webhook flow without per-number setup work."
                        />
                        <MarketingStep
                            number="02"
                            title="Bring templates under control"
                            description="Create, review, sync, send, and repair templates from the same system your team already uses."
                        />
                        <MarketingStep
                            number="03"
                            title="Handle conversations faster"
                            description="Give your team one inbox with ownership status, reply windows, notes, and clean handoffs between people, AI, and bots."
                        />
                        <MarketingStep
                            number="04"
                            title="Scale without hiding costs"
                            description="Keep plan limits, wallet balance, and Meta message pricing visible so growth does not turn into a billing surprise."
                        />
                    </div>
                </section>
            </div>
        </PublicLayout>
    );
}

function MarketingStep({ number, title, description }: { number: string; title: string; description: string }) {
    return (
        <div className="rounded-[1.75rem] border border-black/10 bg-white p-6 shadow-[0_24px_80px_-56px_rgba(15,23,42,0.55)]">
            <div className="text-sm font-semibold uppercase tracking-[0.22em] text-slate-400">{number}</div>
            <h3 className="mt-4 text-xl font-semibold text-slate-950">{title}</h3>
            <p className="mt-3 text-sm leading-7 text-slate-600">{description}</p>
        </div>
    );
}
