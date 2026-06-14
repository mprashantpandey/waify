import { Head, Link } from '@inertiajs/react';
import { MarketingFaqAccordion, MarketingIntegrationsShowcase, MarketingLayout, marketingFaq, Card, Button } from '@/Components/Public/Marketing';
import { MessageCircle, ShieldCheck, WalletCards } from 'lucide-react';

export default function FAQs({ faqs = [] }: { faqs?: { question?: string; answer?: string; q?: string; a?: string }[] }) {
    const items = faqs.length
        ? faqs.map((item) => ({ q: item.q || item.question || '', a: item.a || item.answer || '' })).filter((item) => item.q && item.a)
        : marketingFaq;

    return (
        <MarketingLayout page="faq">
            <Head title="FAQs" />
            <div className="mb-8 grid gap-3 sm:grid-cols-3">
                {[
                    [MessageCircle, 'Meta setup', 'WABA, phone registration, scopes, and webhooks.'],
                    [WalletCards, 'Billing', 'Trials, renewals, discounts, Razorpay, and invoices.'],
                    [ShieldCheck, 'Workspaces', 'Roles, permissions, diagnostics, and admin separation.'],
                ].map(([Icon, title, body]) => (
                    <Card key={title as string} className="p-4">
                        <Icon className="mb-3 h-5 w-5 text-waify-green-dark" />
                        <h2 className="text-sm font-semibold">{title as string}</h2>
                        <p className="mt-1 text-xs leading-relaxed text-waify-text-muted dark:text-waify-dark-text-muted">{body as string}</p>
                    </Card>
                ))}
            </div>
            <MarketingFaqAccordion items={items} />
            <div className="mt-10">
                <h2 className="mb-3 text-lg font-bold text-waify-text dark:text-waify-dark-text">Available integrations</h2>
                <MarketingIntegrationsShowcase compact />
            </div>
            <div className="mt-8 text-center">
                <Link href={route('contact')}><Button variant="secondary">Still need help?</Button></Link>
            </div>
        </MarketingLayout>
    );
}
