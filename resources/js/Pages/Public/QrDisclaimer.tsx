import { Head } from '@inertiajs/react';
import { Card, MarketingLayout } from '@/Components/Public/Marketing';

export default function QrDisclaimer() {
    return (
        <MarketingLayout page="qrDisclaimer">
            <Head title="QR WhatsApp Disclaimer" />
            <Card className="space-y-2 p-6 sm:p-8">
                <LegalSection title="Unofficial connection type">
                    QR WhatsApp login in Zyptos is marked unofficial. It is not the Meta WhatsApp Cloud API, not an official Meta integration path, and is provided only for limited compatibility scenarios.
                </LegalSection>
                <LegalSection title="Production recommendation">
                    Use Meta Cloud API embedded signup for production messaging, templates, webhooks, team inboxes, campaigns, and automation wherever possible.
                </LegalSection>
                <LegalSection title="Account risk">
                    Unofficial automation can carry WhatsApp account limitations or enforcement risk. Zyptos adds conservative controls, but cannot guarantee anti-ban protection, uninterrupted sessions, or full feature parity with Cloud API.
                </LegalSection>
                <LegalSection title="Safe usage expectations">
                    Keep volume modest, message only opted-in contacts, avoid scraping or cold spam, respect opt-outs, avoid rapid repeated sends, and do not treat QR mode as a replacement for Meta-approved business messaging.
                </LegalSection>
                <LegalSection title="Feature differences">
                    QR mode may not support the same template, webhook, analytics, calling, delivery status, billing, or compliance behavior as Meta Cloud API. Some features can be delayed, unavailable, or best-effort.
                </LegalSection>
            </Card>
        </MarketingLayout>
    );
}

function LegalSection({ title, children }: { title: string; children: React.ReactNode }) {
    return (
        <section className="mb-8 last:mb-0">
            <h2 className="mb-3 text-lg font-semibold text-waify-text dark:text-waify-dark-text">{title}</h2>
            <div className="text-sm leading-relaxed text-waify-text-muted dark:text-waify-dark-text-muted">{children}</div>
        </section>
    );
}
