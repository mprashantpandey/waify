import { FileText, Scale, AlertCircle, CheckCircle, Sparkles } from 'lucide-react';
import LegalDocumentPage from '@/Components/Public/LegalDocumentPage';

export default function Terms({ content = '' }: { content?: string }) {
    return (
        <LegalDocumentPage
            title="Terms of Service"
            eyebrow="Legal Information"
            icon={<Scale className="h-3.5 w-3.5" />}
            lastUpdated={new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
            content={content}
        >
                {!content?.trim() && <div className="space-y-6">
                    <section className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg border border-gray-200 dark:border-gray-700 hover:shadow-xl transition-shadow">
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4 flex items-center">
                            <div className="bg-blue-50 dark:bg-blue-900/20 p-2 rounded-lg mr-3">
                                <FileText className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                            </div>
                            1. Acceptance of Terms
                        </h2>
                        <p className="text-gray-700 dark:text-gray-300 mb-4">
                            By accessing and using our services, you accept and agree to be bound by the terms and provision of this agreement.
                        </p>
                    </section>

                    <section className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg border border-gray-200 dark:border-gray-700 hover:shadow-xl transition-shadow">
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4 flex items-center">
                            <div className="bg-green-50 dark:bg-green-900/20 p-2 rounded-lg mr-3">
                                <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-400" />
                            </div>
                            2. Use License
                        </h2>
                        <p className="text-gray-700 dark:text-gray-300 mb-4">
                            Permission is granted to temporarily use our services for personal or commercial purposes. This is the grant of a license, not a transfer of title, and under this license you may not:
                        </p>
                        <ul className="list-disc list-inside space-y-2 text-gray-700 dark:text-gray-300 ml-4">
                            <li>Modify or copy the materials</li>
                            <li>Use the materials for any commercial purpose or for any public display</li>
                            <li>Attempt to reverse engineer any software contained in our services</li>
                            <li>Remove any copyright or other proprietary notations from the materials</li>
                        </ul>
                    </section>

                    <section className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg border border-gray-200 dark:border-gray-700 hover:shadow-xl transition-shadow">
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4 flex items-center">
                            <div className="bg-red-50 dark:bg-red-900/20 p-2 rounded-lg mr-3">
                                <AlertCircle className="h-6 w-6 text-red-600 dark:text-red-400" />
                            </div>
                            3. Acceptable Use
                        </h2>
                        <p className="text-gray-700 dark:text-gray-300 mb-4">
                            You agree not to use our services to:
                        </p>
                        <ul className="list-disc list-inside space-y-2 text-gray-700 dark:text-gray-300 ml-4">
                            <li>Send spam, unsolicited messages, or engage in any form of harassment</li>
                            <li>Violate any applicable laws or regulations</li>
                            <li>Infringe upon the rights of others</li>
                            <li>Transmit any malicious code or viruses</li>
                            <li>Interfere with or disrupt the services</li>
                        </ul>
                    </section>

                    <section className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg border border-gray-200 dark:border-gray-700 hover:shadow-xl transition-shadow">
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">
                            4. Payment Terms
                        </h2>
                        <p className="text-gray-700 dark:text-gray-300 mb-4">
                            Subscription fees are billed in advance on a monthly or annual basis. All fees are non-refundable except as required by law. You are responsible for any taxes applicable to your use of our services.
                        </p>
                    </section>

                    <section className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg border border-gray-200 dark:border-gray-700 hover:shadow-xl transition-shadow">
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">
                            5. Service Availability
                        </h2>
                        <p className="text-gray-700 dark:text-gray-300 mb-4">
                            We strive to maintain high availability of our services but do not guarantee uninterrupted access. We reserve the right to modify, suspend, or discontinue any part of our services at any time.
                        </p>
                    </section>

                    <section className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg border border-gray-200 dark:border-gray-700 hover:shadow-xl transition-shadow">
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">
                            6. Limitation of Liability
                        </h2>
                        <p className="text-gray-700 dark:text-gray-300 mb-4">
                            In no event shall we be liable for any indirect, incidental, special, consequential, or punitive damages, including without limitation, loss of profits, data, use, goodwill, or other intangible losses.
                        </p>
                    </section>

                    <section className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg border border-gray-200 dark:border-gray-700 hover:shadow-xl transition-shadow">
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">
                            7. Termination
                        </h2>
                        <p className="text-gray-700 dark:text-gray-300 mb-4">
                            We may terminate or suspend your account and access to our services immediately, without prior notice, for any breach of these Terms of Service.
                        </p>
                    </section>

                    <section className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg border border-gray-200 dark:border-gray-700 hover:shadow-xl transition-shadow">
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">
                            8. Contact Information
                        </h2>
                        <p className="text-gray-700 dark:text-gray-300 mb-4">
                            If you have any questions about these Terms of Service, please contact us at:
                        </p>
                        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 border border-blue-200 dark:border-blue-800">
                            <p className="text-gray-900 dark:text-gray-100 font-medium">
                                Email: legal@example.com<br />
                                Address: [Your Company Address]
                            </p>
                        </div>
                    </section>
                </div>}
        </LegalDocumentPage>
    );
}
