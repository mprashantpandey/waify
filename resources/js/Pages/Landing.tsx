'use client';
import { Link } from '@inertiajs/react';
import { useEffect, useState } from 'react';
import {
    Avatar,
    Badge,
    Button,
    Check,
    formatInr,
    integrations,
    MarketingFaqAccordion,
    MarketingIcon,
    MarketingLogoCloud,
    MarketingSiteFooter,
    MarketingSiteNav,
    MarketingWhatsAppFloater,
    marketingFaq,
    ProductPreview,
} from '@/Components/Public/Marketing';
import ProviderLogo from '@/Components/Integrations/ProviderLogo';
import { BrandingWrapper } from '@/Components/Branding/BrandingWrapper';
import CookieConsentBanner from '@/Components/Compliance/CookieConsentBanner';
import AnalyticsScripts from '@/Components/Analytics/AnalyticsScripts';
import SeoHead from '@/Components/SEO/SeoHead';
import {
    BarChart2,
    Bot,
    CheckCircle,
    Inbox,
    Megaphone,
    MessageCircle,
    Send,
    Sparkles,
    TrendingUp,
    Users,
    Workflow,
    Zap,
} from 'lucide-react';

interface Stats {
    accounts: number;
    active_connections: number;
    templates: number;
    messages_sent: number;
    messages_received: number;
    conversations: number;
}

interface MarketingPlan {
    id: number;
    name: string;
    key: string;
    description?: string | null;
    price_monthly: number;
    price_yearly?: number | null;
    currency?: string;
    trial_days?: number;
    features: string[];
}

interface Props {
    stats?: Stats;
    plans?: MarketingPlan[];
    canRegister?: boolean;
    seo?: any;
}

const features = [
    { icon: 'megaphone', title: 'Broadcast campaigns', desc: 'Segment contacts, schedule template campaigns, retry failed recipients, and track delivery in real time.' },
    { icon: 'workflow', title: 'Automation flows', desc: 'Build deterministic journeys with branches, waits, tags, assignments, webhooks, and AI-agent handoff.' },
    { icon: 'message-circle', title: 'Shared team inbox', desc: 'Assign chats, add notes, quick replies, bot controls, and call history — all from one inbox.' },
    { icon: 'file-text', title: 'Template manager', desc: 'Create, submit, and monitor Meta template approvals directly from your dashboard.' },
    { icon: 'target', title: 'Meta Leads', desc: 'Connect lead forms, map fields, auto-tag contacts, alert your team, and start follow-up flows.' },
    { icon: 'credit-card', title: 'Payments and invoices', desc: 'Create invoices, collect Razorpay or bank/UPI payments, apply discounts, and track payment status.' },
];

export default function Landing({ stats, plans = [], canRegister = true, seo }: Props) {
    const [annual, setAnnual] = useState(false);
    const [productTab, setProductTab] = useState<'campaigns' | 'inbox' | 'automation'>('campaigns');

    useEffect(() => {
        if (!window.location.hash) return;
        const id = window.location.hash.slice(1);
        const timer = window.setTimeout(() => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 120);
        return () => window.clearTimeout(timer);
    }, []);

    const displayPlans = plans.filter((plan) => plan.key !== 'enterprise' && plan.key !== 'free').slice(0, 3);
    const formatPrice = (amount: number, currency = 'INR') =>
        amount === 0 ? '₹0' : new Intl.NumberFormat('en-IN', { style: 'currency', currency, minimumFractionDigits: 0 }).format(amount / 100);

    return (
        <BrandingWrapper>
            <SeoHead seo={seo} />
            <div className="min-h-screen overflow-x-hidden bg-white text-waify-text dark:bg-slate-900 dark:text-waify-dark-text">
                <MarketingSiteNav currentPage="home" />

                {/* ── HERO ── dark themed with coded dashboard mockup */}
                <header className="relative overflow-hidden bg-waify-ink pb-20 pt-28 sm:pb-28 sm:pt-36">
                    {/* Green glow blobs */}
                    <div className="pointer-events-none absolute inset-0">
                        <div className="absolute left-[-10%] top-[-5%] h-[500px] w-[500px] rounded-full bg-waify-green/25 blur-[120px]" />
                        <div className="absolute right-[-5%] top-[20%] h-[400px] w-[400px] rounded-full bg-emerald-500/15 blur-[100px]" />
                        <div className="absolute bottom-[-10%] left-[40%] h-[300px] w-[300px] rounded-full bg-waify-green/10 blur-[80px]" />
                    </div>
                    {/* Grid overlay */}
                    <div
                        className="pointer-events-none absolute inset-0 opacity-20"
                        style={{
                            backgroundImage: 'linear-gradient(rgba(255,255,255,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.06) 1px, transparent 1px)',
                            backgroundSize: '40px 40px',
                        }}
                    />

                    <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                        <div className="grid items-center gap-12 lg:grid-cols-[1fr_1.15fr] lg:gap-10">
                            {/* Left: text */}
                            <div className="text-center lg:text-left">
                                <span className="inline-flex items-center gap-2 rounded-full border border-waify-green/30 bg-waify-green/10 px-3 py-1.5 text-xs font-semibold text-emerald-400">
                                    <Sparkles size={12} /> AI agents · Automations · Team inbox
                                </span>
                                <h1 className="mt-5 text-4xl font-extrabold leading-[1.08] tracking-tight text-white sm:text-5xl xl:text-[3.25rem]">
                                    Run WhatsApp sales,{' '}
                                    <span className="bg-gradient-to-r from-emerald-400 to-waify-green bg-clip-text text-transparent">
                                        support & campaigns
                                    </span>{' '}
                                    from one workspace
                                </h1>
                                <p className="mx-auto mt-5 max-w-xl text-base leading-relaxed text-slate-400 sm:text-lg lg:mx-0">
                                    Connect your WABA, manage contacts and templates, automate replies, assign chats, and collect payments — all from one platform.
                                </p>
                                <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row lg:justify-start">
                                    {canRegister && (
                                        <Link href={route('register')}>
                                            <Button size="xl" className="w-full shadow-lg shadow-waify-green/25 sm:w-auto">
                                                <MarketingIcon name="rocket" size={18} /> Start free — no credit card
                                            </Button>
                                        </Link>
                                    )}
                                    <Link href={route('contact')}>
                                        <Button size="xl" variant="secondary" className="w-full border-white/10 bg-white/8 text-white ring-white/20 hover:bg-white/12 sm:w-auto">
                                            <MarketingIcon name="play-circle" size={18} /> Book a demo
                                        </Button>
                                    </Link>
                                </div>

                                {/* Trust row */}
                                <div className="mt-8 flex flex-wrap justify-center gap-4 text-xs text-slate-500 lg:justify-start">
                                    {['14-day free trial', 'No credit card required', 'Cancel anytime'].map((item) => (
                                        <span key={item} className="flex items-center gap-1.5">
                                            <CheckCircle size={13} className="text-waify-green" /> {item}
                                        </span>
                                    ))}
                                </div>

                            </div>

                            {/* Right: dashboard mockup */}
                            <div className="relative hidden md:block">
                                <HeroDashboard />
                            </div>
                        </div>
                    </div>
                </header>

                <MarketingLogoCloud />

                {/* ── FEATURES ── */}
                <section id="features" className="bg-gray-50/80 py-20 dark:bg-slate-950 sm:py-24">
                    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                        <SectionHeading
                            eyebrow="Platform"
                            title="Everything you need to grow on WhatsApp"
                            body="From first broadcast to automated journeys — built for D2C brands, agencies, and SMBs."
                        />
                        <div className="mt-14 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                            {features.map((feature, i) => (
                                <div
                                    key={feature.title}
                                    className="group mkt-card-lift relative overflow-hidden rounded-2xl border border-gray-100 bg-white p-6 dark:border-slate-800 dark:bg-slate-900"
                                >
                                    <div className="absolute inset-0 bg-gradient-to-br from-waify-green/0 to-waify-green/0 opacity-0 transition duration-300 group-hover:from-waify-green/3 group-hover:to-emerald-500/5 group-hover:opacity-100" />
                                    <div className="relative">
                                        <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-waify-green/10 transition group-hover:bg-waify-green/15">
                                            <MarketingIcon name={feature.icon} size={22} className="text-waify-green-dark" />
                                        </div>
                                        <h3 className="text-base font-semibold text-waify-text dark:text-waify-dark-text">{feature.title}</h3>
                                        <p className="mt-2 text-sm leading-relaxed text-waify-text-muted dark:text-waify-dark-text-muted">{feature.desc}</p>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Quick capability pills */}
                        <div className="mt-10 flex flex-wrap justify-center gap-2">
                            {['WhatsApp Cloud API', 'QR unofficial mode', 'Meta Lead Forms', 'Google Sheets sync', 'Razorpay payments', 'AI agent nodes', 'Broadcast campaigns', 'Team assignments', 'Contact segments'].map((cap) => (
                                <span key={cap} className="inline-flex items-center gap-1.5 rounded-full border border-gray-200 bg-white px-3 py-1 text-xs font-medium text-waify-text-muted dark:border-slate-700 dark:bg-slate-900">
                                    <Check size={11} className="text-waify-green" /> {cap}
                                </span>
                            ))}
                        </div>
                    </div>
                </section>

                {/* ── PRODUCT TOUR ── */}
                <section id="product" className="py-20 sm:py-24">
                    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                        <div className="grid items-center gap-12 lg:grid-cols-2">
                            <div>
                                <p className="text-xs font-bold uppercase tracking-widest text-waify-green-dark">Product tour</p>
                                <h2 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">See Zyptos in action</h2>
                                <p className="mt-4 leading-relaxed text-waify-text-muted dark:text-waify-dark-text-muted">
                                    Campaign analytics, shared team inbox, visual automations, workspace billing, and Meta diagnostics — designed as one operating system for WhatsApp.
                                </p>
                                <div className="mt-6 flex flex-wrap gap-2">
                                    {[
                                        { id: 'campaigns', label: 'Campaigns', icon: 'megaphone' },
                                        { id: 'inbox', label: 'Inbox', icon: 'message-circle' },
                                        { id: 'automation', label: 'Automation', icon: 'workflow' },
                                    ].map((tab) => (
                                        <button
                                            key={tab.id}
                                            type="button"
                                            onClick={() => setProductTab(tab.id as typeof productTab)}
                                            className={`inline-flex h-10 items-center gap-2 rounded-xl px-4 text-sm font-medium ring-1 transition ${
                                                productTab === tab.id
                                                    ? 'bg-waify-green text-white ring-waify-green'
                                                    : 'bg-white text-waify-text-muted ring-gray-200 hover:ring-waify-green/40 dark:bg-slate-800 dark:ring-slate-600'
                                            }`}
                                        >
                                            <MarketingIcon name={tab.icon} size={16} /> {tab.label}
                                        </button>
                                    ))}
                                </div>
                                <Link href={route('app.dashboard')}>
                                    <Button className="mt-8" variant="secondary">
                                        <MarketingIcon name="layout-dashboard" size={18} /> Explore live dashboard
                                    </Button>
                                </Link>
                            </div>
                            <ProductPreview>{renderProductPanel(productTab)}</ProductPreview>
                        </div>
                    </div>
                </section>

                {/* ── HOW IT WORKS ── */}
                <section id="how" className="bg-gray-50/80 py-20 dark:bg-slate-950 sm:py-24">
                    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                        <SectionHeading title="Up and running in minutes" body="Connect a WABA, import contacts, create templates, and launch your first campaign — all from one wizard." />
                        <div className="mt-14 grid gap-0 sm:grid-cols-2 lg:grid-cols-4">
                            {[
                                { icon: <MarketingIcon name="link-2" size={20} className="text-waify-green-dark" />, step: '01', title: 'Connect WhatsApp', desc: 'Meta Cloud API embedded signup, coexistence, or QR mode. Full diagnostic health check included.' },
                                { icon: <MarketingIcon name="users" size={20} className="text-waify-green-dark" />, step: '02', title: 'Import audience', desc: 'CSV import, Meta Leads, form submissions, tags, segments, and full contact profiles.' },
                                { icon: <MarketingIcon name="file-check" size={20} className="text-waify-green-dark" />, step: '03', title: 'Build templates', desc: 'Submit to Meta, monitor approval status, and manage variables and buttons in one place.' },
                                { icon: <MarketingIcon name="send" size={20} className="text-waify-green-dark" />, step: '04', title: 'Launch and measure', desc: 'Track queued, sent, delivered, failed, replies, bot status, and handoff events in real time.' },
                            ].map(({ icon, step, title, desc }, index) => (
                                <div key={title} className="relative flex flex-col items-center px-6 py-8 text-center">
                                    {index < 3 && (
                                        <div className="absolute right-0 top-12 hidden h-px w-1/2 lg:block">
                                            <div className="h-px w-full bg-gradient-to-r from-waify-green/40 to-transparent" />
                                        </div>
                                    )}
                                    <div className="relative mb-4">
                                        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-waify-green text-white shadow-lg shadow-waify-green/25">
                                            {icon}
                                        </div>
                                        <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-waify-ink text-[9px] font-bold text-white ring-2 ring-white dark:ring-slate-950">
                                            {index + 1}
                                        </span>
                                    </div>
                                    <h3 className="font-semibold text-waify-text dark:text-waify-dark-text">{title}</h3>
                                    <p className="mt-2 text-sm leading-relaxed text-waify-text-muted dark:text-waify-dark-text-muted">{desc}</p>
                                </div>
                            ))}
                        </div>
                        <div className="mt-10 text-center">
                            <Link href={route('onboarding')}>
                                <Button><MarketingIcon name="wand-2" size={18} /> Start setup wizard</Button>
                            </Link>
                        </div>
                    </div>
                </section>

                {/* ── INTEGRATIONS ── */}
                <section className="border-y border-gray-100 py-16 dark:border-slate-800">
                    <div className="mx-auto max-w-7xl px-4 text-center sm:px-6 lg:px-8">
                        <h2 className="text-2xl font-bold">Built around the tools you already use</h2>
                        <p className="mx-auto mt-2 max-w-2xl text-sm leading-relaxed text-waify-text-muted dark:text-waify-dark-text-muted">
                            WhatsApp Cloud API, Meta Leads, Razorpay, Google Sheets, Calendar, AI providers, Shopify, WooCommerce, Zapier, Make, Slack, and developer webhooks.
                        </p>
                        <div className="mt-10 grid gap-3 text-left sm:grid-cols-2 lg:grid-cols-3">
                            {integrations.map((item) => (
                                <div key={item.name} className="mkt-card-lift flex items-start gap-3 rounded-xl bg-white p-4 text-sm ring-1 ring-gray-200 dark:bg-slate-800 dark:ring-slate-700">
                                    <ProviderLogo id={item.providerId} name={item.name} className="h-10 w-10 rounded-lg" imageClassName="h-5 w-5" />
                                    <div>
                                        <h3 className="font-semibold text-waify-text dark:text-waify-dark-text">{item.name}</h3>
                                        <p className="mt-1 text-xs leading-relaxed text-waify-text-muted dark:text-waify-dark-text-muted">{item.desc}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* ── WHAT'S AVAILABLE ── */}
                <section className="py-20 sm:py-24">
                    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                        <SectionHeading title="What's live in Zyptos today" body="Production-ready features for WhatsApp operations, billing, and automation." />
                        <div className="mt-12 grid gap-6 md:grid-cols-3">
                            {[
                                {
                                    icon: <Inbox size={20} className="text-waify-green-dark" />,
                                    title: 'Workspace operations',
                                    body: 'One WhatsApp Business connection per workspace, team roles, assignments, notes, activity logs, quick replies, and workspace billing.',
                                    bullets: ['Shared team inbox with assignments', 'Bot controls and handoff rules', 'Conversation audit trail'],
                                },
                                {
                                    icon: <Bot size={20} className="text-waify-green-dark" />,
                                    title: 'Automation and AI',
                                    body: 'Visual flow builder with branches, waits, tags, template sends, webhooks, AI-agent nodes, and run status inside the inbox.',
                                    bullets: ['Deterministic action nodes', 'AI agent handoff and guardrails', 'Anti-spam limits built-in'],
                                },
                                {
                                    icon: <BarChart2 size={20} className="text-waify-green-dark" />,
                                    title: 'Billing and integrations',
                                    body: 'Plan checkout, bank/UPI and Razorpay one-time payments, Meta Leads, Google Sheets, Calendar, and webhooks.',
                                    bullets: ['Bank/UPI payment approval', 'Razorpay one-time checkout', 'Google OAuth integrations'],
                                },
                            ].map(({ icon, title, body, bullets }) => (
                                <div key={title} className="mkt-card-lift rounded-2xl border border-gray-100 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
                                    <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-waify-green/10">
                                        {icon}
                                    </div>
                                    <h3 className="text-lg font-semibold text-waify-text dark:text-waify-dark-text">{title}</h3>
                                    <p className="mt-2 text-sm leading-relaxed text-waify-text-muted dark:text-waify-dark-text-muted">{body}</p>
                                    <ul className="mt-4 space-y-1.5">
                                        {bullets.map((b) => (
                                            <li key={b} className="flex items-center gap-2 text-xs text-waify-text-muted dark:text-waify-dark-text-muted">
                                                <Check size={13} className="flex-shrink-0 text-waify-green" /> {b}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* ── PRICING ── */}
                <section id="pricing" className="bg-gray-50/80 py-20 dark:bg-slate-950 sm:py-24">
                    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                        <SectionHeading
                            title="Simple, transparent pricing"
                            body="Plans are billed per workspace. Each workspace supports one WhatsApp Business connection. Discounts, wallet credits, bank/UPI, and Razorpay one-time payment supported."
                        />
                        <div className="mt-6 text-center">
                            <div className="inline-flex items-center gap-2 rounded-xl bg-white p-1 ring-1 ring-gray-200 dark:bg-slate-800 dark:ring-slate-700">
                                <button type="button" onClick={() => setAnnual(false)} className={`rounded-lg px-4 py-2 text-sm font-medium transition ${!annual ? 'bg-waify-green text-white' : 'text-waify-text-muted'}`}>Monthly</button>
                                <button type="button" onClick={() => setAnnual(true)} className={`rounded-lg px-4 py-2 text-sm font-medium transition ${annual ? 'bg-waify-green text-white' : 'text-waify-text-muted'}`}>
                                    Annual <span className="ml-1 rounded-full bg-emerald-100 px-1.5 py-0.5 text-[10px] font-bold text-emerald-700">Save 17%</span>
                                </button>
                            </div>
                        </div>
                        <div className="mx-auto mt-12 grid max-w-6xl gap-6 lg:grid-cols-4">
                            {displayPlans.map((plan, index) => {
                                const popular = plan.key === 'pro' || plan.key === 'growth' || index === 1;
                                const monthly = annual && plan.price_yearly ? Math.round(plan.price_yearly / 12) : plan.price_monthly;

                                return (
                                    <div key={plan.id} className={`mkt-card-lift relative flex flex-col rounded-2xl border bg-white p-6 dark:bg-slate-900 ${popular ? 'border-waify-green shadow-lg shadow-waify-green/10 dark:border-waify-green/50' : 'border-gray-200 dark:border-slate-700'}`}>
                                        {popular && (
                                            <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                                                <Badge variant="success" className="shadow-sm">Most popular</Badge>
                                            </div>
                                        )}
                                        <h3 className="text-lg font-bold text-waify-text dark:text-waify-dark-text">{plan.name}</h3>
                                        <p className="mt-2 min-h-[44px] text-sm leading-relaxed text-waify-text-muted dark:text-waify-dark-text-muted">{plan.description || 'Everything needed to launch WhatsApp operations.'}</p>
                                        <p className="mt-4">
                                            <span className="text-3xl font-extrabold tabular-nums text-waify-text dark:text-waify-dark-text">{formatPrice(monthly, plan.currency || 'INR')}</span>
                                            {monthly > 0 && <span className="text-sm text-waify-text-muted">/mo</span>}
                                        </p>
                                        {annual && plan.price_yearly && <p className="mt-1 text-xs font-medium text-waify-green-dark">Billed {formatPrice(plan.price_yearly, plan.currency || 'INR')}/year</p>}
                                        {(plan.trial_days ?? 0) > 0 && <p className="mt-1 text-xs font-medium text-waify-green-dark">{plan.trial_days}-day free trial included</p>}
                                        <ul className="mt-5 flex-1 space-y-2.5 text-sm text-waify-text-muted dark:text-waify-dark-text-muted">
                                            {plan.features.slice(0, 5).map((feature) => (
                                                <li key={feature} className="flex gap-2">
                                                    <Check size={15} className="mt-0.5 flex-shrink-0 text-waify-green" />{feature}
                                                </li>
                                            ))}
                                        </ul>
                                        <Link href={`${route('register')}?plan=${plan.key}&cycle=${annual ? 'yearly' : 'monthly'}`}>
                                            <Button className="mt-6 w-full" variant={popular ? 'primary' : 'secondary'}>Get started</Button>
                                        </Link>
                                    </div>
                                );
                            })}
                            {/* Enterprise card */}
                            <div className="mkt-card-lift relative flex flex-col overflow-hidden rounded-2xl bg-waify-ink p-6 text-white">
                                <div
                                    className="pointer-events-none absolute inset-0 opacity-10"
                                    style={{
                                        backgroundImage: 'linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)',
                                        backgroundSize: '24px 24px',
                                    }}
                                />
                                <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-waify-green/60 to-transparent" />
                                <div className="relative flex h-full flex-col">
                                    <Badge variant="success" className="mb-4 w-fit">Custom</Badge>
                                    <h3 className="text-lg font-bold">Enterprise</h3>
                                    <p className="mt-2 min-h-[44px] text-sm leading-relaxed text-slate-400">Custom limits, Meta readiness support, onboarding help, workspace controls, and priority operations.</p>
                                    <p className="mt-4 text-3xl font-extrabold">Talk to us</p>
                                    <ul className="mt-5 flex-1 space-y-2.5 text-sm text-slate-300">
                                        {['Custom workspaces', 'High-volume sending', 'Dedicated onboarding', 'Security and review support'].map((feature) => (
                                            <li key={feature} className="flex gap-2"><Check size={15} className="mt-0.5 flex-shrink-0 text-waify-green" />{feature}</li>
                                        ))}
                                    </ul>
                                    <Link href={route('contact')}>
                                        <Button className="mt-6 w-full bg-white text-waify-green-darker hover:bg-white/95">Contact sales</Button>
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* ── FAQ ── */}
                <section id="faq" className="mx-auto max-w-3xl px-4 py-20 sm:px-6 sm:py-24">
                    <h2 className="text-center text-3xl font-bold">Frequently asked questions</h2>
                    <p className="mt-2 text-center text-sm text-waify-text-muted">
                        Can&apos;t find an answer?{' '}
                        <Link href={route('faqs')} className="font-medium text-waify-green-dark hover:underline">Browse all FAQs</Link>
                    </p>
                    <div className="mt-10"><MarketingFaqAccordion items={marketingFaq.slice(0, 4)} /></div>
                </section>

                {/* ── FINAL CTA ── */}
                <section className="pb-20 pt-4 sm:pb-24">
                    <div className="mx-auto max-w-5xl px-4 sm:px-6">
                        <div className="relative overflow-hidden rounded-3xl bg-waify-ink px-8 py-16 text-center text-white sm:px-14">
                            {/* Glows */}
                            <div className="absolute left-[-10%] top-[-20%] h-72 w-72 rounded-full bg-waify-green/30 blur-[80px]" />
                            <div className="absolute bottom-[-20%] right-[-5%] h-64 w-64 rounded-full bg-emerald-500/20 blur-[70px]" />
                            {/* Grid */}
                            <div
                                className="pointer-events-none absolute inset-0 opacity-10"
                                style={{
                                    backgroundImage: 'linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)',
                                    backgroundSize: '32px 32px',
                                }}
                            />
                            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-waify-green/50 to-transparent" />
                            <div className="relative">
                                <span className="mb-4 inline-flex items-center gap-2 rounded-full border border-waify-green/30 bg-waify-green/10 px-3 py-1 text-xs font-semibold text-emerald-400">
                                    <Zap size={12} /> Ready to get started?
                                </span>
                                <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Turn WhatsApp chats into revenue</h2>
                                <p className="mx-auto mt-4 max-w-xl text-base text-white/75">
                                    Join teams using Zyptos for WhatsApp campaigns, Meta APIs, automations, inbox, and billing.
                                </p>
                                <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
                                    <Link href={route('register')}>
                                        <Button className="h-12 bg-waify-green px-8 text-white shadow-lg shadow-waify-green/30 hover:bg-waify-green-dark">
                                            Start free trial
                                        </Button>
                                    </Link>
                                    <Link href={route('contact')}>
                                        <Button variant="secondary" className="h-12 border-white/20 bg-white/10 px-6 text-white ring-white/20 hover:bg-white/15">
                                            Talk to sales
                                        </Button>
                                    </Link>
                                </div>
                                <p className="mt-4 text-xs text-slate-500">14-day free trial · No credit card required · Cancel anytime</p>
                            </div>
                        </div>
                    </div>
                </section>

                <MarketingSiteFooter />
                <MarketingWhatsAppFloater />
                <CookieConsentBanner />
                <AnalyticsScripts />
            </div>
        </BrandingWrapper>
    );
}

// ── Section heading helper ──
function SectionHeading({ eyebrow, title, body }: { eyebrow?: string; title: string; body: string }) {
    return (
        <div className="mx-auto max-w-2xl text-center">
            {eyebrow && <p className="text-xs font-bold uppercase tracking-widest text-waify-green-dark">{eyebrow}</p>}
            <h2 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">{title}</h2>
            <p className="mt-3 text-waify-text-muted dark:text-waify-dark-text-muted">{body}</p>
        </div>
    );
}

// ── Coded dashboard mockup for hero ──
function HeroDashboard() {
    const campaigns = [
        { name: 'Summer Sale', delivered: '92.1%', responses: '4.3K', conversion: '10.5%' },
        { name: 'New Collection', delivered: '96.3%', responses: '6.1K', conversion: '11.2%' },
        { name: 'Special Offer', delivered: '97.8%', responses: '2.9K', conversion: '8.7%' },
    ];
    const barHeights = [38, 55, 48, 65, 72, 60, 80, 68, 75, 88, 70, 85];

    return (
        <div className="relative mx-auto max-w-[600px] lg:max-w-none">
            {/* Outer glow */}
            <div className="absolute -inset-6 rounded-[3rem] bg-waify-green/20 blur-3xl" />

            {/* Dashboard window */}
            <div className="relative overflow-hidden rounded-2xl bg-[#0d1b2e] shadow-2xl ring-1 ring-white/10">
                {/* Window chrome */}
                <div className="flex items-center gap-1.5 border-b border-white/5 bg-[#09121e] px-4 py-2.5">
                    <span className="h-2.5 w-2.5 rounded-full bg-red-500/70" />
                    <span className="h-2.5 w-2.5 rounded-full bg-amber-500/70" />
                    <span className="h-2.5 w-2.5 rounded-full bg-emerald-500/70" />
                    <span className="ml-3 font-mono text-[10px] text-slate-500">Zyptos — Dashboard</span>
                    <div className="ml-auto flex items-center gap-1">
                        <span className="h-1.5 w-1.5 rounded-full bg-waify-green animate-pulse" />
                        <span className="text-[9px] text-emerald-400">Live</span>
                    </div>
                </div>

                <div className="flex">
                    {/* Sidebar */}
                    <div className="flex w-11 flex-col items-center gap-3.5 border-r border-white/5 bg-[#09121e] py-4">
                        {[
                            { Icon: BarChart2, active: true },
                            { Icon: Megaphone, active: false },
                            { Icon: Users, active: false },
                            { Icon: Workflow, active: false },
                            { Icon: TrendingUp, active: false },
                            { Icon: MessageCircle, active: false },
                        ].map(({ Icon, active }, i) => (
                            <div
                                key={i}
                                className={`flex h-7 w-7 items-center justify-center rounded-lg transition ${active ? 'bg-waify-green text-white' : 'text-slate-600 hover:text-slate-400'}`}
                            >
                                <Icon size={13} />
                            </div>
                        ))}
                    </div>

                    {/* Main content */}
                    <div className="flex-1 p-3">
                        {/* Top metrics */}
                        <div className="mb-3 grid grid-cols-4 gap-2">
                            {[
                                { label: 'Messages Sent', value: '128.6K', change: '+28.5%', up: true },
                                { label: 'Delivered', value: '98.7%', change: '+12.4%', up: true },
                                { label: 'Responses', value: '25.3K', change: '+31.7%', up: true },
                                { label: 'Conversion', value: '9.6%', change: '+18.2%', up: true },
                            ].map(({ label, value, change, up }) => (
                                <div key={label} className="rounded-lg bg-[#0f1f35] p-2.5 ring-1 ring-white/5">
                                    <div className="mb-1 text-[9px] text-slate-500">{label}</div>
                                    <div className="text-sm font-bold text-white">{value}</div>
                                    <div className={`text-[9px] font-semibold ${up ? 'text-emerald-400' : 'text-red-400'}`}>{change}</div>
                                </div>
                            ))}
                        </div>

                        {/* Chart */}
                        <div className="mb-3 rounded-lg bg-[#0f1f35] p-3 ring-1 ring-white/5">
                            <div className="mb-2 flex items-center justify-between">
                                <span className="text-[10px] font-semibold text-slate-400">Performance Overview</span>
                                <span className="text-[9px] text-slate-600">This Month</span>
                            </div>
                            <div className="flex h-14 items-end gap-1">
                                {barHeights.map((h, i) => (
                                    <div
                                        key={i}
                                        className="flex-1 rounded-t-sm"
                                        style={{
                                            height: `${h}%`,
                                            background: i === barHeights.length - 1
                                                ? '#00A548'
                                                : `rgba(0, 165, 72, ${0.25 + (h / 100) * 0.4})`,
                                        }}
                                    />
                                ))}
                            </div>
                        </div>

                        {/* Campaigns table */}
                        <div className="rounded-lg bg-[#0f1f35] ring-1 ring-white/5">
                            <div className="flex items-center justify-between border-b border-white/5 px-3 py-2">
                                <span className="text-[10px] font-semibold text-slate-400">Top Campaigns</span>
                                <span className="rounded-full bg-waify-green/20 px-1.5 py-0.5 text-[9px] font-bold text-emerald-400">3 active</span>
                            </div>
                            <div className="divide-y divide-white/5">
                                {campaigns.map((c, i) => (
                                    <div key={c.name} className="flex items-center gap-2 px-3 py-2">
                                        <div
                                            className="h-1.5 w-1.5 flex-shrink-0 rounded-full"
                                            style={{ background: i === 0 ? '#00A548' : i === 1 ? '#128C7E' : '#4ade80' }}
                                        />
                                        <span className="flex-1 text-[10px] font-medium text-slate-300">{c.name}</span>
                                        <span className="text-[9px] text-slate-500">{c.delivered}</span>
                                        <div className="w-12 overflow-hidden rounded-full bg-slate-700/50">
                                            <div
                                                className="h-1 rounded-full bg-waify-green"
                                                style={{ width: c.delivered }}
                                            />
                                        </div>
                                        <span className="text-[9px] font-semibold text-emerald-400">{c.conversion}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* WhatsApp phone overlay */}
            <div className="absolute -bottom-6 -right-4 w-32 overflow-hidden rounded-[22px] bg-[#1a1a2e] shadow-2xl ring-1 ring-white/10 sm:-right-6 sm:w-36">
                {/* Phone header */}
                <div className="flex items-center gap-1.5 bg-waify-green-darker px-2 py-2">
                    <div className="flex h-5 w-5 items-center justify-center rounded-full bg-white/20 text-[8px] font-bold text-white">Z</div>
                    <div>
                        <div className="text-[8px] font-semibold leading-tight text-white">Zyptos Business</div>
                        <div className="flex items-center gap-0.5 text-[7px] text-white/60">
                            <span className="h-1 w-1 rounded-full bg-emerald-400" /> online
                        </div>
                    </div>
                </div>
                {/* Chat bubbles */}
                <div className="flex flex-col gap-1.5 bg-[#ece5dd] p-2">
                    <div className="max-w-[90%] self-start rounded-xl rounded-tl-sm bg-white px-2 py-1.5 shadow-sm">
                        <p className="text-[7px] leading-tight text-gray-800">Hi! Reply with <strong>pricing</strong> or <strong>demo</strong></p>
                        <p className="mt-0.5 text-right text-[6px] text-gray-400">10:24 ✓✓</p>
                    </div>
                    <div className="max-w-[85%] self-end rounded-xl rounded-tr-sm bg-[#DCF8C6] px-2 py-1.5 shadow-sm">
                        <p className="text-[7px] text-gray-800">pricing</p>
                    </div>
                    <div className="self-center rounded-full bg-emerald-100/90 px-1.5 py-0.5 text-[6px] font-semibold text-emerald-800">
                        Bot replied
                    </div>
                </div>
            </div>

            {/* Floating badge — New Leads */}
            <div className="absolute -left-4 top-6 rounded-xl border border-white/10 bg-[#0d1b2e]/90 px-3 py-2.5 shadow-2xl backdrop-blur-sm sm:-left-8">
                <div className="flex items-center gap-2">
                    <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-waify-green/20">
                        <Users size={13} className="text-emerald-400" />
                    </div>
                    <div>
                        <div className="text-[9px] text-slate-500">New Leads</div>
                        <div className="text-sm font-bold text-emerald-400">+8,342</div>
                    </div>
                </div>
                <p className="mt-0.5 text-[8px] text-slate-600">This month</p>
            </div>

            {/* Floating badge — Growth */}
            <div className="absolute -right-4 top-1/3 rounded-xl border border-white/10 bg-[#0d1b2e]/90 px-3 py-2.5 shadow-2xl backdrop-blur-sm sm:-right-8">
                <div className="flex items-center gap-2">
                    <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-500/20">
                        <TrendingUp size={13} className="text-emerald-400" />
                    </div>
                    <div>
                        <div className="text-[9px] text-slate-500">Growth</div>
                        <div className="text-sm font-bold text-emerald-400">+126%</div>
                    </div>
                </div>
                <p className="mt-0.5 text-[8px] text-slate-600">This month</p>
            </div>

            {/* Floating badge — Delivered */}
            <div className="absolute -left-4 bottom-16 rounded-xl border border-white/10 bg-[#0d1b2e]/90 px-3 py-2 shadow-2xl backdrop-blur-sm sm:-left-8">
                <div className="flex items-center gap-1.5">
                    <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400" />
                    <div className="text-[9px] text-slate-400">Msgs Delivered</div>
                </div>
                <div className="text-sm font-bold text-white">98.7% <span className="text-[9px] font-normal text-emerald-400">↑</span></div>
            </div>
        </div>
    );
}

// ── Product tour panels ──
function renderProductPanel(tab: 'campaigns' | 'inbox' | 'automation') {
    if (tab === 'inbox') {
        return (
            <div className="space-y-2 p-4">
                <p className="mb-2 text-xs font-semibold uppercase text-waify-text-muted">Team Inbox</p>
                {['Prashant Pandey', 'New lead', 'Support request'].map((name, index) => (
                    <div key={name} className={`flex items-center gap-2 rounded-lg p-2 text-xs ${index === 0 ? 'bg-waify-green/10 ring-1 ring-waify-green/20' : 'hover:bg-gray-50 dark:hover:bg-slate-800'}`}>
                        <Avatar name={name} size={28} />
                        <div className="min-w-0 flex-1">
                            <div className="truncate font-medium">{name}</div>
                            <div className="truncate text-waify-text-muted">{index === 0 ? 'Show me Zyptos pricing' : index === 1 ? 'Meta lead captured' : 'Needs human support'}</div>
                        </div>
                        {index === 0 && <span className="flex h-5 w-5 items-center justify-center rounded-full bg-waify-green text-[10px] font-bold text-white">2</span>}
                    </div>
                ))}
            </div>
        );
    }

    if (tab === 'automation') {
        return (
            <div className="p-4">
                <p className="mb-3 text-xs font-semibold uppercase text-waify-text-muted">Automation flow</p>
                <div className="flex flex-col gap-2">
                    {[
                        { label: 'Trigger: Inbound message', color: 'bg-purple-100 text-purple-700 ring-purple-200 dark:bg-purple-900/30 dark:text-purple-400 dark:ring-purple-800' },
                        { label: 'Condition: Contains keyword', color: 'bg-amber-100 text-amber-700 ring-amber-200 dark:bg-amber-900/30 dark:text-amber-400 dark:ring-amber-800' },
                        { label: 'Action: Send template', color: 'bg-waify-green/15 text-waify-green-dark ring-waify-green/25' },
                        { label: 'Delay: Wait 2 hours', color: 'bg-blue-100 text-blue-700 ring-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:ring-blue-800' },
                        { label: 'Handoff: Assign agent', color: 'bg-gray-100 text-gray-700 ring-gray-200 dark:bg-slate-800 dark:text-slate-400 dark:ring-slate-700' },
                    ].map((step, i) => (
                        <div key={step.label} className="flex items-center gap-2">
                            <div className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-waify-green text-[9px] font-bold text-white">{i + 1}</div>
                            <span className={`rounded-lg px-3 py-1.5 text-[11px] font-medium ring-1 ${step.color}`}>{step.label}</span>
                        </div>
                    ))}
                </div>
                <p className="mt-4 text-xs text-waify-text-muted">Lead qualification · test mode · run history</p>
            </div>
        );
    }

    return (
        <div className="space-y-3 p-4">
            <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase text-waify-text-muted">Active campaign</span>
                <Badge variant="success">Live</Badge>
            </div>
            <p className="text-sm font-semibold text-waify-text dark:text-waify-dark-text">Zyptos plan follow-up</p>
            <div className="h-2 overflow-hidden rounded-full bg-gray-100 dark:bg-slate-700">
                <div className="h-full w-[94%] rounded-full bg-waify-green" />
            </div>
            <div className="grid grid-cols-4 gap-2 text-center text-xs">
                {[['12.4K', 'Queued'], ['11.6K', 'Sent'], ['11.4K', 'Delivered'], ['3.2K', 'Replies']].map(([value, label]) => (
                    <div key={label} className="rounded-lg bg-gray-50 p-2 dark:bg-slate-800">
                        <div className="font-bold tabular-nums text-waify-text dark:text-waify-dark-text">{value}</div>
                        <div className="text-waify-text-muted">{label}</div>
                    </div>
                ))}
            </div>
            <div className="rounded-lg bg-waify-green/8 p-2.5 ring-1 ring-waify-green/15">
                <p className="text-[11px] font-medium text-waify-green-dark">98.7% delivery rate · 27.4% reply rate</p>
            </div>
        </div>
    );
}
