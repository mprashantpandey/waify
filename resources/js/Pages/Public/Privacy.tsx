import { Head } from '@inertiajs/react';
import { Card, MarketingLayout } from '@/Components/Public/Marketing';

export default function Privacy() {
    return (
        <MarketingLayout page="privacy">
            <Head title="Privacy Policy" />
            <Card className="space-y-2 p-6 sm:p-8">
                <LegalSection title="Overview">
                    We collect account, billing, workspace, Meta connection, contact, campaign, and support data to operate Zyptos. We do not sell your contact lists.
                </LegalSection>
                <LegalSection title="Data we process">
                    Business profile data, encrypted WABA credentials, phone registration state, webhook events, contacts you upload or sync, Meta lead records, campaign analytics, call metadata, billing records, integration logs, and audit logs.
                </LegalSection>
                <LegalSection title="Integrations and providers">
                    When you connect Meta, Google, Razorpay, AI providers, voice providers, or webhooks, Zyptos stores the minimum configuration needed to operate the integration. Secrets are encrypted and access should be restricted to authorized workspace owners or admins.
                </LegalSection>
                <LegalSection title="Retention and controls">
                    Retention follows your plan, workspace settings, and legal requirements. Workspace owners can export or delete operational data where Meta policy, audit requirements, and law allow it.
                </LegalSection>
                <LegalSection title="Security">
                    Sensitive credentials are encrypted, access is role controlled, and platform/admin actions are logged for operational review.
                </LegalSection>
                <LegalSection title="Contact">
                    Privacy requests can be sent to <a href="mailto:privacy@zyptos.com" className="text-waify-green-dark hover:underline">privacy@zyptos.com</a>.
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
