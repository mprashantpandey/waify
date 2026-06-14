import { Head } from '@inertiajs/react';
import { Card, MarketingLayout } from '@/Components/Public/Marketing';

export default function Cookies() {
    return (
        <MarketingLayout page="cookies">
            <Head title="Cookie Policy" />
            <Card className="space-y-8 p-6 sm:p-8">
                <Section title="Essential cookies">Zyptos uses essential cookies for login sessions, CSRF protection, workspace context, theme preference, and security controls.</Section>
                <Section title="Analytics cookies">Optional analytics help us understand page usage and product friction. These should respect the cookie consent preference configured for the platform.</Section>
                <Section title="Managing cookies">You can disable non-essential cookies in your browser. The application cannot operate correctly without secure session cookies.</Section>
            </Card>
        </MarketingLayout>
    );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
    return <section><h2 className="mb-2 text-lg font-semibold">{title}</h2><p className="text-sm leading-relaxed text-waify-text-muted dark:text-waify-dark-text-muted">{children}</p></section>;
}
