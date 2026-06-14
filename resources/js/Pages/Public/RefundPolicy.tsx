import { Head } from '@inertiajs/react';
import { Card, MarketingLayout } from '@/Components/Public/Marketing';

export default function RefundPolicy() {
    return (
        <MarketingLayout page="refund">
            <Head title="Refund and Cancellation Policy" />
            <Card className="space-y-2 p-6 sm:p-8">
                <LegalSection title="Subscriptions and renewals">
                    Zyptos plans are purchased per workspace. A workspace plan starts or renews when payment is confirmed through Razorpay one-time checkout or when a bank/UPI payment proof is approved by a platform admin.
                </LegalSection>
                <LegalSection title="Cancellation">
                    You can stop renewing a workspace plan before the next billing cycle. Cancellation does not remove your workspace data immediately, but paid actions may stop when the active period ends or the workspace becomes overdue.
                </LegalSection>
                <LegalSection title="Refund requests">
                    Refunds are reviewed case by case for duplicate payments, incorrect plan activation, failed service activation, or verified billing errors. Approved refunds are returned to the original payment method where possible.
                </LegalSection>
                <LegalSection title="Non-refundable items">
                    Meta conversation charges, third-party provider charges, completed onboarding or custom implementation work, and usage already consumed during an active plan period are generally non-refundable.
                </LegalSection>
                <LegalSection title="Manual payments">
                    Bank and UPI payments are not considered paid until proof is uploaded and approved. If proof is rejected, the invoice remains unpaid and the workspace plan is not activated from that invoice.
                </LegalSection>
                <LegalSection title="Enterprise">
                    Enterprise activations, custom limits, and custom commercial terms require admin approval and may have separate written terms.
                </LegalSection>
                <LegalSection title="Contact">
                    For billing corrections, send the invoice number, workspace name, payment reference, and proof to <a href="mailto:billing@zyptos.com" className="text-waify-green-dark hover:underline">billing@zyptos.com</a>.
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
