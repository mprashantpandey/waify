import { Head, Link } from '@inertiajs/react';
import { useState } from 'react';
import { ArrowRight, Check, X } from 'lucide-react';
import { Badge, Button, Card, MarketingFaqAccordion, MarketingLayout } from '@/Components/Public/Marketing';

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
}

const planGuidance: Record<string, { bestFor: string; note: string }> = {
    starter: {
        bestFor: 'Small teams starting WhatsApp operations',
        note: 'Good for one number, basic campaigns, shared inbox, contacts, and a measured first month.',
    },
    pro: {
        bestFor: 'Growing teams with automation and AI',
        note: 'Adds larger limits, visual automations, AI assistance, analytics, and longer retention.',
    },
    growth: {
        bestFor: 'Growing teams with automation and AI',
        note: 'Adds larger limits, visual automations, AI assistance, analytics, and longer retention.',
    },
    business: {
        bestFor: 'Teams running high-volume operations',
        note: 'Best for mature inbox, campaign, automation, integration, and reporting workflows.',
    },
};

export default function Pricing({ plans, canRegister }: { plans: Plan[]; canRegister: boolean }) {
    const [billing, setBilling] = useState<'monthly' | 'yearly'>('monthly');
    const visiblePlans = plans.filter((plan) => plan.key !== 'enterprise' && plan.key !== 'free').slice(0, 3);
    const effectiveFeaturesByPlan = visiblePlans.reduce<Record<string, string[]>>((carry, plan, index) => {
        const directFeatures = plan.features.filter((feature) => !feature.toLowerCase().startsWith('everything in '));
        const inheritsPrevious = plan.features.some((feature) => feature.toLowerCase().startsWith('everything in '));
        const previousPlan = visiblePlans[index - 1];
        const inheritedFeatures = inheritsPrevious && previousPlan ? carry[previousPlan.key] ?? [] : [];

        carry[plan.key] = Array.from(new Set([...inheritedFeatures, ...directFeatures]));

        return carry;
    }, {});
    const allFeatures = Array.from(new Set(visiblePlans.flatMap((plan) => effectiveFeaturesByPlan[plan.key] ?? plan.features))).slice(0, 18);

    const fmt = (amount: number, currency = 'INR') =>
        amount === 0 ? '₹0' : new Intl.NumberFormat('en-IN', { style: 'currency', currency, minimumFractionDigits: 0 }).format(amount / 100);

    return (
        <MarketingLayout page="pricing" wide>
            <Head title="Pricing" />
            <div className="text-center">
                <div className="inline-flex items-center gap-2 rounded-xl bg-white p-1 ring-1 ring-gray-200 dark:bg-slate-800 dark:ring-slate-700">
                    <button type="button" onClick={() => setBilling('monthly')} className={`rounded-lg px-4 py-2 text-sm font-medium transition ${billing === 'monthly' ? 'bg-waify-green text-white' : 'text-waify-text-muted'}`}>Monthly</button>
                    <button type="button" onClick={() => setBilling('yearly')} className={`rounded-lg px-4 py-2 text-sm font-medium transition ${billing === 'yearly' ? 'bg-waify-green text-white' : 'text-waify-text-muted'}`}>Annual <span className="text-[10px]">(save more)</span></button>
                </div>
                <p className="mx-auto mt-4 max-w-2xl text-sm leading-relaxed text-waify-text-muted dark:text-waify-dark-text-muted">
                    Plans are billed per workspace. Each workspace connects one WhatsApp Business number; create another workspace for a separate brand, client, or number.
                </p>
                <div className="mx-auto mt-6 grid max-w-4xl gap-3 text-left sm:grid-cols-3">
                    {[
                        ['One workspace, one WABA', 'Keep each brand or client separate with clean contacts, billing, teams, and limits.'],
                        ['Meta charges separate', 'Meta conversation and WABA charges are billed by Meta, not bundled into Zyptos plans.'],
                        ['Enterprise is reviewed', 'Enterprise limits, onboarding, and activation require admin approval before access is granted.'],
                    ].map(([title, body]) => (
                        <div key={title} className="rounded-2xl border border-gray-100 bg-white p-4 text-sm shadow-sm dark:border-waify-dark-border dark:bg-waify-dark-surface">
                            <p className="font-semibold text-waify-text dark:text-waify-dark-text">{title}</p>
                            <p className="mt-1 text-xs leading-relaxed text-waify-text-muted dark:text-waify-dark-text-muted">{body}</p>
                        </div>
                    ))}
                </div>
            </div>

            <div className="mt-10 grid gap-6 lg:grid-cols-4">
                {visiblePlans.map((plan, index) => {
                    const popular = plan.key === 'pro' || plan.key === 'growth' || index === 1;
                    const rawPrice = billing === 'yearly' && plan.price_yearly ? Math.round(plan.price_yearly / 12) : plan.price_monthly;

                    return (
                        <Card key={plan.id} className={`mkt-card-lift relative flex flex-col p-6 ${popular ? 'ring-2 ring-waify-green' : ''}`}>
                            {popular && <Badge variant="success" className="absolute -top-3 left-1/2 -translate-x-1/2">Most popular</Badge>}
                            <h2 className="text-lg font-bold">{plan.name}</h2>
                            <p className="mt-2 min-h-[42px] text-sm leading-relaxed text-waify-text-muted dark:text-waify-dark-text-muted">{plan.description}</p>
                            {(planGuidance[plan.key] || planGuidance[plan.key.toLowerCase()]) && (
                                <div className="mt-4 rounded-xl bg-waify-green/10 p-3 text-xs leading-relaxed text-waify-green-dark dark:bg-waify-green/15 dark:text-emerald-200">
                                    <span className="block font-semibold">{(planGuidance[plan.key] || planGuidance[plan.key.toLowerCase()]).bestFor}</span>
                                    <span className="mt-1 block">{(planGuidance[plan.key] || planGuidance[plan.key.toLowerCase()]).note}</span>
                                </div>
                            )}
                            <div className="mt-5">
                                <span className="text-3xl font-extrabold tabular-nums">{fmt(rawPrice, plan.currency)}</span>
                                {rawPrice > 0 && <span className="text-sm text-waify-text-muted">/mo</span>}
                            </div>
                            {billing === 'yearly' && plan.price_yearly && <p className="mt-1 text-xs font-medium text-waify-green-dark">Billed {fmt(plan.price_yearly, plan.currency)}/year</p>}
                            {plan.trial_days > 0 && <p className="mt-1 text-xs font-medium text-waify-green-dark">{plan.trial_days}-day free trial</p>}
                            <ul className="mt-6 flex-1 space-y-2.5 text-sm text-waify-text-muted dark:text-waify-dark-text-muted">
                                {plan.features.slice(0, 8).map((feature) => <li key={feature} className="flex gap-2"><Check className="mt-0.5 h-4 w-4 flex-shrink-0 text-waify-green" />{feature}</li>)}
                            </ul>
                            <Link href={`${route('register')}?plan=${plan.key}&cycle=${billing}`} className="mt-6">
                                <Button className="w-full" variant={popular ? 'primary' : 'secondary'} disabled={!canRegister}>
                                    Start workspace checkout <ArrowRight className="h-4 w-4" />
                                </Button>
                            </Link>
                        </Card>
                    );
                })}
                <Card className="mkt-card-lift relative flex flex-col overflow-hidden bg-waify-ink p-6 text-white">
                    <div className="marketing-grid-pattern absolute inset-0 opacity-10" />
                    <div className="relative flex h-full flex-col">
                        <Badge variant="success" className="mb-4 w-fit">Custom</Badge>
                        <h2 className="text-lg font-bold">Enterprise</h2>
                        <p className="mt-2 min-h-[42px] text-sm leading-relaxed text-slate-400">Custom usage, onboarding help, compliance needs, and guided Meta readiness for teams running multiple workspaces.</p>
                        <div className="mt-5 text-3xl font-extrabold">Contact sales</div>
                        <p className="mt-1 text-xs font-medium text-waify-green">Admin-reviewed activation only</p>
                        <ul className="mt-6 flex-1 space-y-2.5 text-sm text-slate-300">
                            {['Custom usage limits', 'Dedicated onboarding', 'Meta app review support', 'Priority billing support'].map((feature) => (
                                <li key={feature} className="flex gap-2"><Check className="mt-0.5 h-4 w-4 flex-shrink-0 text-waify-green" />{feature}</li>
                            ))}
                        </ul>
                        <Link href={route('contact')} className="mt-6">
                            <Button className="w-full bg-white text-waify-green-darker hover:bg-white/95">
                                Talk to sales <ArrowRight className="h-4 w-4" />
                            </Button>
                        </Link>
                    </div>
                </Card>
            </div>

            {allFeatures.length > 0 && (
                <Card className="mt-12 overflow-hidden p-0">
                    <div className="grid grid-cols-4 gap-4 border-b border-gray-100 bg-gray-50 px-4 py-3 text-[11px] font-semibold uppercase tracking-wider text-waify-text-muted dark:border-waify-dark-border dark:bg-waify-dark-surface-2">
                        <span>Feature</span>
                        {visiblePlans.map((plan) => <span key={plan.id} className="text-center">{plan.name}</span>)}
                    </div>
                    {allFeatures.map((feature, index) => (
                        <div key={feature} className={`grid grid-cols-4 gap-4 px-4 py-3 text-sm ${index % 2 === 0 ? 'bg-white dark:bg-waify-dark-surface' : 'bg-gray-50/70 dark:bg-waify-dark-surface-2/60'}`}>
                            <span className="text-waify-text-muted">{feature}</span>
                            {visiblePlans.map((plan) => (
                                <span key={plan.id} className="flex justify-center">
                                    {(effectiveFeaturesByPlan[plan.key] ?? plan.features).includes(feature) ? <Check className="h-4 w-4 text-waify-green" /> : <X className="h-4 w-4 text-gray-300" />}
                                </span>
                            ))}
                        </div>
                    ))}
                </Card>
            )}

            <div className="mt-12 grid gap-4 md:grid-cols-3">
                {[
                    ['1. Preview the quote', 'Choose a workspace plan and cycle, then preview discount, GST, and final payable amount before creating an invoice.'],
                    ['2. Pay securely', 'Use Razorpay one-time checkout or create a bank/UPI invoice with payment instructions and proof upload.'],
                    ['3. Activate the workspace', 'Razorpay payments confirm automatically. Manual payments activate after platform admin approval.'],
                ].map(([title, body]) => (
                    <Card key={title} className="p-5">
                        <h2 className="font-semibold text-waify-text dark:text-waify-dark-text">{title}</h2>
                        <p className="mt-2 text-sm leading-relaxed text-waify-text-muted dark:text-waify-dark-text-muted">{body}</p>
                    </Card>
                ))}
            </div>

            <div className="mx-auto mt-12 max-w-3xl">
                <MarketingFaqAccordion />
            </div>
        </MarketingLayout>
    );
}
