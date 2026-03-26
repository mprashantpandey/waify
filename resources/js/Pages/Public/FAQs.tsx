import PublicLayout from '@/Layouts/PublicLayout';
import { ChevronDown, ChevronUp, HelpCircle } from 'lucide-react';
import { useState } from 'react';
import { Head, Link, usePage } from '@inertiajs/react';
import { getPlatformName } from '@/lib/branding';
import PublicPageHero from '@/Components/Public/PublicPageHero';

interface FAQ {
    question: string;
    answer: string;
}

export default function FAQs({ faqs: initialFaqs }: { faqs: FAQ[] }) {
    const { branding } = usePage().props as any;
    const platformName = getPlatformName(branding);
    const [openIndex, setOpenIndex] = useState<number | null>(0);

    const defaultFaqs: FAQ[] = [
        {
            question: `What is ${platformName}?`,
            answer: `${platformName} is a WhatsApp operations platform for teams that need setup, templates, inbox work, automation, AI replies, and billing to stay in one system.`,
        },
        {
            question: 'Are you a Meta Tech Provider?',
            answer: 'Yes. The platform is built around official Meta onboarding and WhatsApp Cloud API workflows.',
        },
        {
            question: 'How do I get started?',
            answer: 'Create an account, choose a plan, connect your WhatsApp Business number, and start using the inbox, templates, and automation tools from the same workspace.',
        },
        {
            question: 'Can I change plans later?',
            answer: 'Yes. You can move between plans from billing, subject to usage-based downgrade checks so your current setup does not break.',
        },
        {
            question: 'Is there a free trial?',
            answer: 'Eligible accounts can start on a trial-enabled plan. Trials are not re-offered once an account has already converted beyond trial.',
        },
        {
            question: 'What payment methods do you accept?',
            answer: 'Payments are processed through Razorpay using supported cards, UPI, and other available methods.',
        },
        {
            question: 'How do I connect my WhatsApp Business Account?',
            answer: 'Use the Embedded Signup flow in the product. The platform handles the central webhook model and related provisioning steps for you.',
        },
        {
            question: 'Do you support AI replies and chatbots together?',
            answer: 'Yes. The inbox can show whether a conversation is currently handled by AI, a chatbot, or a human so your team can see ownership clearly.',
        },
    ];

    const faqs = initialFaqs && initialFaqs.length > 0 ? initialFaqs : defaultFaqs;

    return (
        <PublicLayout>
            <Head title="FAQs" />
            <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
                <PublicPageHero
                    eyebrow="FAQs"
                    icon={<HelpCircle className="h-4 w-4" />}
                    title="The questions teams ask before they roll WhatsApp out properly."
                    description={`These answers cover how ${platformName} handles setup, plans, automation, billing, and day-to-day operations.`}
                />

                <div className="space-y-4">
                    {faqs.map((faq, index) => {
                        const isOpen = openIndex === index;
                        return (
                            <div key={faq.question} className="overflow-hidden rounded-[1.75rem] border border-black/10 bg-white shadow-[0_24px_80px_-56px_rgba(15,23,42,0.55)]">
                                <button
                                    type="button"
                                    onClick={() => setOpenIndex(isOpen ? null : index)}
                                    className="flex w-full items-center justify-between gap-4 px-6 py-5 text-left sm:px-7"
                                >
                                    <span className="text-lg font-semibold text-slate-950">{faq.question}</span>
                                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-[#fbfaf6] text-slate-600">
                                        {isOpen ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
                                    </span>
                                </button>
                                {isOpen ? (
                                    <div className="border-t border-black/10 px-6 py-5 text-sm leading-7 text-slate-600 sm:px-7">
                                        {faq.answer}
                                    </div>
                                ) : null}
                            </div>
                        );
                    })}
                </div>

                <div className="mt-8 rounded-[2rem] border border-black/10 bg-[#0f172a] px-6 py-8 text-white shadow-[0_32px_120px_-48px_rgba(15,23,42,0.85)] sm:px-8">
                    <h2 className="text-2xl font-semibold">Still need a direct answer?</h2>
                    <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-300">
                        Use the contact page if your question depends on your rollout, billing history, or WhatsApp account setup.
                    </p>
                    <div className="mt-6">
                        <Link href={route('contact')} className="inline-flex items-center rounded-full bg-[#14b8a6] px-5 py-3 text-sm font-semibold text-slate-950">
                            Contact the team
                        </Link>
                    </div>
                </div>
            </div>
        </PublicLayout>
    );
}
