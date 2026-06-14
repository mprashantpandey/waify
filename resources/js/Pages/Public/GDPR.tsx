import { Head } from '@inertiajs/react';
import { Card, MarketingLayout } from '@/Components/Public/Marketing';

export default function GDPR() {
    return (
        <MarketingLayout page="gdpr">
            <Head title="GDPR" />
            <Card className="space-y-8 p-6 sm:p-8">
                <Section title="Your rights">Customers and data subjects can request access, rectification, erasure, restriction, portability, and objection where applicable.</Section>
                <Section title="Lawful basis">Zyptos processes account and workspace data for contract performance, security logs for legitimate interest, and marketing preferences by consent where required.</Section>
                <Section title="Workspace controls">Workspace owners can export contacts, remove lists, review audit logs, and configure retention according to their operational policy.</Section>
                <Section title="DPO contact">Email <a href="mailto:dpo@zyptos.com" className="text-waify-green-dark hover:underline">dpo@zyptos.com</a>. We respond to valid requests within the required legal window.</Section>
            </Card>
        </MarketingLayout>
    );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
    return <section><h2 className="mb-2 text-lg font-semibold">{title}</h2><p className="text-sm leading-relaxed text-waify-text-muted dark:text-waify-dark-text-muted">{children}</p></section>;
}
