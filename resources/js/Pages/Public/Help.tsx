import PublicLayout from '@/Layouts/PublicLayout';
import { Head, Link } from '@inertiajs/react';
import { BookOpen, CreditCard, HelpCircle, MessageSquare, Search, Workflow } from 'lucide-react';
import { useMemo, useState } from 'react';
import PublicPageHero from '@/Components/Public/PublicPageHero';

export default function Help() {
    const [searchQuery, setSearchQuery] = useState('');

    const helpCategories = [
        {
            title: 'Getting started',
            icon: BookOpen,
            description: 'Create an account, connect your first number, and understand the setup flow.',
            articles: ['Create your workspace', 'Connect a WhatsApp number', 'Finish embedded signup', 'Prepare your inbox'],
        },
        {
            title: 'Templates and messaging',
            icon: MessageSquare,
            description: 'Keep template creation, syncing, sending, and delivery workflows clear for your team.',
            articles: ['Create and approve templates', 'Fix template media issues', 'Understand reply windows', 'Use template sends safely'],
        },
        {
            title: 'Automation and AI',
            icon: Workflow,
            description: 'Set up chatbot replies, AI auto-replies, knowledge-base answers, and human handoff rules.',
            articles: ['Build a first chatbot path', 'Enable AI auto-replies', 'Add knowledge items', 'Control handoff to humans'],
        },
        {
            title: 'Billing and plans',
            icon: CreditCard,
            description: 'Understand plan limits, wallet usage, Meta pricing, and plan changes.',
            articles: ['Choose a plan', 'Read usage properly', 'Handle downgrade checks', 'Review invoices and transactions'],
        },
    ];

    const normalizedQuery = searchQuery.trim().toLowerCase();
    const filteredCategories = useMemo(
        () =>
            helpCategories
                .map((category) => ({
                    ...category,
                    articles: category.articles.filter((article) =>
                        normalizedQuery === '' ||
                        category.title.toLowerCase().includes(normalizedQuery) ||
                        category.description.toLowerCase().includes(normalizedQuery) ||
                        article.toLowerCase().includes(normalizedQuery),
                    ),
                }))
                .filter(
                    (category) =>
                        normalizedQuery === '' ||
                        category.title.toLowerCase().includes(normalizedQuery) ||
                        category.description.toLowerCase().includes(normalizedQuery) ||
                        category.articles.length > 0,
                ),
        [normalizedQuery],
    );

    return (
        <PublicLayout>
            <Head title="Help Center" />
            <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
                <PublicPageHero
                    eyebrow="Help center"
                    icon={<HelpCircle className="h-4 w-4" />}
                    title="Find the answer before the issue turns into an ops problem."
                    description="Browse practical help for setup, templates, inbox work, automation, and billing."
                >
                    <div className="relative max-w-2xl">
                        <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Search help topics"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="h-14 w-full rounded-full border border-black/10 bg-[#fbfaf6] pl-12 pr-4 text-slate-900 shadow-sm focus:border-emerald-600 focus:ring-emerald-600"
                        />
                    </div>
                </PublicPageHero>

                <div className="grid gap-6 lg:grid-cols-[0.8fr,1.2fr]">
                    <section className="rounded-[2rem] border border-black/10 bg-[#0f172a] p-6 text-white shadow-[0_32px_120px_-48px_rgba(15,23,42,0.85)] sm:p-8">
                        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-emerald-200">Quick paths</p>
                        <div className="mt-5 grid gap-3">
                            <Link href={route('faqs')} className="rounded-2xl border border-white/10 bg-white/5 px-4 py-4 text-sm font-medium text-slate-100">Open FAQs</Link>
                            <Link href={route('pricing')} className="rounded-2xl border border-white/10 bg-white/5 px-4 py-4 text-sm font-medium text-slate-100">See plans and limits</Link>
                            <Link href={route('contact')} className="rounded-2xl border border-white/10 bg-white/5 px-4 py-4 text-sm font-medium text-slate-100">Contact support</Link>
                        </div>
                    </section>

                    <section className="grid gap-4 md:grid-cols-2">
                        {filteredCategories.map((category) => (
                            <div key={category.title} className="rounded-[1.75rem] border border-black/10 bg-white p-6 shadow-[0_24px_80px_-56px_rgba(15,23,42,0.55)]">
                                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700">
                                    <category.icon className="h-6 w-6" />
                                </div>
                                <h2 className="mt-5 text-xl font-semibold text-slate-950">{category.title}</h2>
                                <p className="mt-3 text-sm leading-7 text-slate-600">{category.description}</p>
                                <ul className="mt-5 space-y-2 text-sm text-slate-700">
                                    {category.articles.map((article) => (
                                        <li key={article} className="rounded-2xl bg-[#fbfaf6] px-4 py-3">{article}</li>
                                    ))}
                                </ul>
                            </div>
                        ))}
                    </section>
                </div>

                {normalizedQuery !== '' && filteredCategories.length === 0 ? (
                    <div className="mt-6 rounded-[1.75rem] border border-dashed border-black/15 bg-white px-6 py-8 text-sm text-slate-600">
                        No results matched <span className="font-semibold text-slate-950">“{searchQuery}”</span>. Try a broader keyword or use the contact page.
                    </div>
                ) : null}
            </div>
        </PublicLayout>
    );
}
