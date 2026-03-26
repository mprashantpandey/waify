import { Head, Link } from '@inertiajs/react';
import PublicLayout from '@/Layouts/PublicLayout';
import { ArrowRight, Check, Crown, Sparkles, Users, Workflow, Zap } from 'lucide-react';
import Button from '@/Components/UI/Button';
import { useState } from 'react';
import PublicPageHero from '@/Components/Public/PublicPageHero';

interface Plan {
    id: number;
    name: string;
    key: string;
    description: string;
    price_monthly: number;
    price_yearly: number | null;
    currency: string;
    trial_days: number;
    features: string[];
    modules: string[];
    limits: Record<string, any>;
}

export default function Pricing({ plans, canRegister }: { plans: Plan[]; canRegister: boolean }) {
    const [showCompare, setShowCompare] = useState(false);

    const formatPrice = (amount: number, currency: string = 'INR') => {
        if (amount === 0) return 'Free';
        const major = amount / 100;
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency,
            minimumFractionDigits: 0,
        }).format(major);
    };

    const getPlanIcon = (key: string) => {
        switch (key) {
            case 'starter':
                return Zap;
            case 'pro':
                return Workflow;
            case 'enterprise':
                return Crown;
            default:
                return Users;
        }
    };

    const allFeatures = Array.from(new Set(plans.flatMap((plan) => plan.features))).sort();

    return (
        <PublicLayout>
            <Head title="Pricing" />
            <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
                <PublicPageHero
                    eyebrow="Pricing"
                    icon={<Sparkles className="h-4 w-4" />}
                    title="Pricing that stays readable when your team grows."
                    description="Choose the plan that fits your current stage, then move up when usage actually demands it."
                    actions={
                        <Button variant={showCompare ? 'primary' : 'ghost'} onClick={() => setShowCompare((value) => !value)} className="rounded-full border border-black/10 bg-white px-5">
                            {showCompare ? 'Hide comparison' : 'Compare plans'}
                        </Button>
                    }
                />

                <section className="grid gap-5 lg:grid-cols-4">
                    {plans.map((plan) => {
                        const Icon = getPlanIcon(plan.key);
                        const isRecommended = plan.key === 'pro';
                        const isEnterprise = plan.key === 'enterprise';
                        const hasTrial = plan.trial_days > 0;

                        return (
                            <div
                                key={plan.id}
                                className={`rounded-[2rem] border bg-white p-6 shadow-[0_24px_80px_-56px_rgba(15,23,42,0.55)] ${
                                    isRecommended ? 'border-emerald-600/35 ring-2 ring-emerald-600/10' : 'border-black/10'
                                }`}
                            >
                                <div className="flex items-start justify-between gap-4">
                                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#fbfaf6] text-slate-700">
                                        <Icon className="h-6 w-6" />
                                    </div>
                                    {hasTrial ? <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-800">{plan.trial_days}-day trial</span> : null}
                                </div>
                                <div className="mt-5">
                                    <div className="flex items-center gap-2">
                                        <h2 className="text-2xl font-semibold text-slate-950">{plan.name}</h2>
                                        {isRecommended ? <span className="rounded-full bg-slate-900 px-2.5 py-1 text-xs font-semibold text-white">Popular</span> : null}
                                    </div>
                                    <p className="mt-3 min-h-[72px] text-sm leading-7 text-slate-600">{plan.description}</p>
                                </div>
                                <div className="mt-5 border-t border-black/10 pt-5">
                                    {isEnterprise ? (
                                        <>
                                            <div className="text-3xl font-semibold text-slate-950">Custom</div>
                                            <p className="mt-2 text-sm text-slate-500">For larger teams and tailored rollout requirements.</p>
                                        </>
                                    ) : (
                                        <>
                                            <div className="text-4xl font-semibold text-slate-950">{formatPrice(plan.price_monthly, plan.currency)}</div>
                                            <p className="mt-2 text-sm text-slate-500">per month</p>
                                        </>
                                    )}
                                </div>
                                <ul className="mt-6 space-y-3 text-sm text-slate-700">
                                    {plan.features.slice(0, 6).map((feature) => (
                                        <li key={feature} className="flex items-start gap-3">
                                            <Check className="mt-0.5 h-4 w-4 text-emerald-700" />
                                            <span>{feature}</span>
                                        </li>
                                    ))}
                                </ul>
                                <div className="mt-8">
                                    {isEnterprise ? (
                                        <Link href={route('contact')}>
                                            <Button className="w-full rounded-full bg-slate-900 px-5 hover:bg-slate-800">Talk to sales</Button>
                                        </Link>
                                    ) : canRegister ? (
                                        <Link href={`${route('register')}?plan=${plan.key}`}>
                                            <Button className={`w-full rounded-full px-5 ${isRecommended ? 'bg-[#0f766e] hover:bg-[#115e59]' : 'bg-slate-900 hover:bg-slate-800'}`}>
                                                {hasTrial ? 'Start plan trial' : 'Choose plan'}
                                                <ArrowRight className="ml-2 h-4 w-4" />
                                            </Button>
                                        </Link>
                                    ) : null}
                                </div>
                            </div>
                        );
                    })}
                </section>

                {showCompare ? (
                    <section className="mt-8 overflow-hidden rounded-[2rem] border border-black/10 bg-white shadow-[0_24px_80px_-52px_rgba(15,23,42,0.45)]">
                        <div className="overflow-x-auto">
                            <table className="min-w-full text-sm">
                                <thead className="bg-[#fbfaf6] text-slate-950">
                                    <tr>
                                        <th className="px-6 py-4 text-left font-semibold">Feature</th>
                                        {plans.map((plan) => (
                                            <th key={plan.id} className="px-6 py-4 text-center font-semibold">{plan.name}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {allFeatures.map((feature) => (
                                        <tr key={feature} className="border-t border-black/10">
                                            <td className="px-6 py-4 text-slate-700">{feature}</td>
                                            {plans.map((plan) => (
                                                <td key={`${plan.id}-${feature}`} className="px-6 py-4 text-center">
                                                    {plan.features.includes(feature) ? <Check className="mx-auto h-4 w-4 text-emerald-700" /> : '—'}
                                                </td>
                                            ))}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </section>
                ) : null}

                <section className="mt-8 grid gap-4 md:grid-cols-3">
                    <InfoCard title="No hidden setup tier" description="Core onboarding, inbox work, and template workflows stay inside the main product instead of separate add-ons." />
                    <InfoCard title="Usage-aware downgrades" description="Plan changes stay practical because the system checks whether your current usage would break on the lower plan." />
                    <InfoCard title="Indian billing context" description="Billing and Meta usage estimates are shown in INR for accounts using the India setup path." />
                </section>
            </div>
        </PublicLayout>
    );
}

function InfoCard({ title, description }: { title: string; description: string }) {
    return (
        <div className="rounded-[1.75rem] border border-black/10 bg-white p-6 shadow-[0_24px_80px_-56px_rgba(15,23,42,0.55)]">
            <h3 className="text-lg font-semibold text-slate-950">{title}</h3>
            <p className="mt-3 text-sm leading-7 text-slate-600">{description}</p>
        </div>
    );
}
