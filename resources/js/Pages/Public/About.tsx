import PublicLayout from '@/Layouts/PublicLayout';
import { BadgeCheck, Layers3, ShieldCheck, Users } from 'lucide-react';
import { Head, Link } from '@inertiajs/react';
import Button from '@/Components/UI/Button';
import PublicPageHero from '@/Components/Public/PublicPageHero';

export default function About() {
    const principles = [
        {
            icon: Layers3,
            title: 'Operational clarity',
            description: 'We simplify the work that normally gets spread across setup guides, inbox tools, billing panels, and ad-hoc admin docs.',
        },
        {
            icon: Users,
            title: 'Team-first design',
            description: 'The product is built for owners, support leads, operators, and marketers who all need a version of the same system that stays usable.',
        },
        {
            icon: ShieldCheck,
            title: 'Reliable foundations',
            description: 'We put real effort into provisioning, webhook handling, sync, billing limits, and auditability because those are the parts that usually break trust.',
        },
    ];

    const milestones = [
        'Official Meta Tech Provider setup and centralized onboarding flow',
        'Shared inbox, template operations, AI replies, and automation in one workspace',
        'Plan limits and usage tied closely to real WhatsApp operations',
    ];

    return (
        <PublicLayout>
            <Head title="About" />
            <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
                <PublicPageHero
                    eyebrow="About"
                    icon={<BadgeCheck className="h-4 w-4" />}
                    title="We build the operational layer behind serious WhatsApp teams."
                    description="Zyptos is not just a sender or chatbot wrapper. It is a workspace for companies that need setup, inbox work, templates, automation, AI, and billing to stay in sync."
                    actions={
                        <div className="flex flex-wrap gap-3">
                            <Link href={route('pricing')}>
                                <Button className="rounded-full bg-[#0f766e] px-6 hover:bg-[#115e59]">See pricing</Button>
                            </Link>
                            <Link href={route('contact')}>
                                <Button variant="ghost" className="rounded-full border border-black/10 bg-white px-6">Talk to us</Button>
                            </Link>
                        </div>
                    }
                />

                <section className="grid gap-6 lg:grid-cols-[1.2fr,0.8fr]">
                    <div className="rounded-[2rem] border border-black/10 bg-white p-6 shadow-[0_24px_80px_-52px_rgba(15,23,42,0.45)] sm:p-8">
                        <h2 className="text-3xl font-semibold tracking-tight text-slate-950">What we are building</h2>
                        <div className="mt-5 space-y-5 text-base leading-8 text-slate-600">
                            <p>
                                Most WhatsApp business stacks become hard to trust because the important work lives in too many places: onboarding in one tool, conversations in another, automation somewhere else, and billing in a finance screen that operators never open.
                            </p>
                            <p>
                                We are building one product that keeps those workflows together. That means connection setup that matches Meta’s model, inbox work that stays readable for humans, automation that does not hide ownership, and billing that reflects actual product usage.
                            </p>
                            <p>
                                The goal is not to look busy. The goal is to make the system easier to run every day.
                            </p>
                        </div>
                    </div>

                    <div className="rounded-[2rem] border border-black/10 bg-[#0f172a] p-6 text-white shadow-[0_32px_120px_-48px_rgba(15,23,42,0.85)] sm:p-8">
                        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-emerald-200">Where we focus</p>
                        <ul className="mt-5 space-y-4 text-sm leading-7 text-slate-200">
                            {milestones.map((item) => (
                                <li key={item} className="rounded-2xl border border-white/10 bg-white/5 px-4 py-4">
                                    {item}
                                </li>
                            ))}
                        </ul>
                    </div>
                </section>

                <section className="mt-8 grid gap-4 md:grid-cols-3">
                    {principles.map((item) => (
                        <div key={item.title} className="rounded-[1.75rem] border border-black/10 bg-white p-6 shadow-[0_24px_80px_-56px_rgba(15,23,42,0.55)]">
                            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700">
                                <item.icon className="h-6 w-6" />
                            </div>
                            <h3 className="mt-5 text-xl font-semibold text-slate-950">{item.title}</h3>
                            <p className="mt-3 text-sm leading-7 text-slate-600">{item.description}</p>
                        </div>
                    ))}
                </section>
            </div>
        </PublicLayout>
    );
}
