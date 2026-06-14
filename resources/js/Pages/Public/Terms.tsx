import { Head } from '@inertiajs/react';
import { Card, MarketingLayout } from '@/Components/Public/Marketing';

export default function Terms() {
    return (
        <MarketingLayout page="terms">
            <Head title="Terms of Service" />
            <Card className="space-y-2 p-6 sm:p-8">
                <LegalSection title="Acceptance">
                    By using Zyptos you agree to these terms, workspace policies configured by your organization, and Meta&apos;s WhatsApp Business Platform requirements.
                </LegalSection>
                <LegalSection title="Acceptable use">
                    You are responsible for opt-in consent, lawful messaging, template accuracy, opt-out handling, and avoiding spam, prohibited industries, misleading offers, or policy violations. See the Acceptable Use Policy for practical rules.
                </LegalSection>
                <LegalSection title="Billing">
                    Plans are billed per workspace and renew according to the selected cycle. Bank/UPI payments require proof upload and admin approval. Razorpay is used for one-time Zyptos checkout where enabled. Discounts, trials, cancellations, overdue status, and renewals determine access to paid actions.
                </LegalSection>
                <LegalSection title="Refunds and cancellations">
                    Refund and cancellation requests are reviewed under the Refund and Cancellation Policy. Meta conversation charges, third-party provider costs, consumed usage, and completed custom work are generally separate from Zyptos subscription refunds.
                </LegalSection>
                <LegalSection title="Trials and Enterprise">
                    Self-service trials are limited per email account. Enterprise plans, custom limits, and special activations require platform admin approval and may require additional onboarding or commercial review.
                </LegalSection>
                <LegalSection title="Platform and Meta APIs">
                    Zyptos helps connect Meta APIs, but Meta may independently review, limit, pause, or reject apps, templates, numbers, and WABAs. Your business remains responsible for Meta Business Platform requirements and content compliance.
                </LegalSection>
                <LegalSection title="Unofficial QR connection">
                    QR-based WhatsApp login is marked unofficial. It is not the Meta Cloud API and may carry account limitations or enforcement risk. Use Cloud API for production where possible and read the QR WhatsApp Disclaimer before enabling QR mode.
                </LegalSection>
                <LegalSection title="AI and automation">
                    Automation and AI-agent features must be configured with approved knowledge, reasonable limits, and human handoff rules. Zyptos may throttle or pause automation that creates duplicate replies, policy risk, excessive sending, or support escalation risk.
                </LegalSection>
                <LegalSection title="Suspension">
                    We may restrict sending, billing actions, or admin operations when accounts violate policy, payment fails, or security risk is detected.
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
