import { Head } from '@inertiajs/react';
import { useMemo, useState } from 'react';
import { CheckCircle2, Search } from 'lucide-react';
import { Card, knowledgeBaseGuides, MarketingIntegrationsShowcase, MarketingLayout } from '@/Components/Public/Marketing';

export default function KnowledgeBase() {
    const [query, setQuery] = useState('');
    const guides = useMemo(() => {
        const q = query.trim().toLowerCase();
        if (!q) return knowledgeBaseGuides;

        return knowledgeBaseGuides.filter((guide) => {
            const haystack = `${guide.category} ${guide.title} ${guide.summary} ${guide.bullets.join(' ')}`.toLowerCase();
            return haystack.includes(q);
        });
    }, [query]);

    return (
        <MarketingLayout page="knowledgebase" wide>
            <Head title="Knowledge Base" />
            <div className="relative mb-8">
                <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-waify-text-muted" />
                <input
                    type="search"
                    value={query}
                    onChange={(event) => setQuery(event.target.value)}
                    placeholder="Search setup, billing, campaigns, integrations..."
                    className="h-12 w-full rounded-xl border border-gray-200 bg-white pl-12 pr-4 text-sm outline-none transition focus:border-waify-green focus:ring-4 focus:ring-waify-green/15 dark:border-waify-dark-border dark:bg-waify-dark-surface"
                />
            </div>

            {guides.length === 0 ? (
                <Card className="p-8 text-center text-sm text-waify-text-muted dark:text-waify-dark-text-muted">
                    No guide matched your search. Try WhatsApp, billing, leads, campaign, automation, or security.
                </Card>
            ) : (
                <div className="grid gap-4 md:grid-cols-2">
                    {guides.map((guide) => (
                        <Card key={guide.title} className="mkt-card-lift p-5">
                            <div className="mb-3 inline-flex rounded-full bg-waify-green-soft px-2.5 py-1 text-[11px] font-semibold text-waify-green-dark dark:bg-waify-dark-green-soft dark:text-emerald-200">
                                {guide.category}
                            </div>
                            <h2 className="text-lg font-semibold">{guide.title}</h2>
                            <p className="mt-2 text-sm leading-relaxed text-waify-text-muted dark:text-waify-dark-text-muted">{guide.summary}</p>
                            <ul className="mt-4 space-y-2">
                                {guide.bullets.map((item) => (
                                    <li key={item} className="flex gap-2 text-sm text-waify-text-muted dark:text-waify-dark-text-muted">
                                        <CheckCircle2 className="mt-0.5 h-4 w-4 flex-shrink-0 text-waify-green" />
                                        <span>{item}</span>
                                    </li>
                                ))}
                            </ul>
                            <div className="mt-4 text-xs font-medium text-waify-green-dark">Detailed actions are available inside the relevant workspace screen.</div>
                        </Card>
                    ))}
                </div>
            )}

            <Card className="mt-6 p-5">
                <h2 className="font-semibold">What this knowledge base is for</h2>
                <p className="mt-2 text-sm leading-relaxed text-waify-text-muted dark:text-waify-dark-text-muted">
                    These guides describe the current Zyptos product behavior. For workspace-specific data, open the app screen because permissions, connected WABA state, enabled modules, plan limits, and integration health can differ by workspace.
                </p>
            </Card>

            <div className="mt-10">
                <div className="mb-4">
                    <h2 className="text-xl font-bold text-waify-text dark:text-waify-dark-text">Integration guides by provider</h2>
                    <p className="mt-1 text-sm text-waify-text-muted dark:text-waify-dark-text-muted">
                        These are the real provider integrations currently represented in Zyptos, with workspace setup and troubleshooting available in the app.
                    </p>
                </div>
                <MarketingIntegrationsShowcase />
            </div>
        </MarketingLayout>
    );
}
