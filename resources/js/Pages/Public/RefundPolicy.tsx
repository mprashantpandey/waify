import LegalDocumentPage from '@/Components/Public/LegalDocumentPage';
import { RotateCcw } from 'lucide-react';

export default function RefundPolicy({ content = '' }: { content?: string }) {
    return (
        <LegalDocumentPage
            title="Refund Policy"
            eyebrow="Billing & Refunds"
            icon={<RotateCcw className="h-3.5 w-3.5" />}
            lastUpdated={new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
            content={content}
        >
            <section>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Refund review basis</h2>
                <p className="mt-2">
                    Refund requests are reviewed according to your active plan terms, billing cycle timing, usage consumed, and payment provider policies.
                </p>
            </section>
            <section>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">What may affect eligibility</h2>
                <ul className="mt-2 list-disc pl-5 space-y-1">
                    <li>Subscription type (monthly/annual) and when the request was made.</li>
                    <li>Successful usage of paid features, messaging, or credits.</li>
                    <li>Gateway/payment processor settlement status and fees.</li>
                    <li>Applicable law and consumer protection requirements.</li>
                </ul>
            </section>
            <section>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">How to request a refund</h2>
                <p className="mt-2">
                    Contact support with your account email, transaction reference, and reason for the request. We will review and respond with the next steps.
                </p>
            </section>
        </LegalDocumentPage>
    );
}
