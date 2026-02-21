import PublicLayout from '@/Layouts/PublicLayout';
import { Shield, Lock, Eye, FileText, Sparkles } from 'lucide-react';

export default function Privacy({ content = '' }: { content?: string }) {
    if (content && content.trim() !== '') {
        return (
            <PublicLayout>
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
                    <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100 mb-6">Privacy Policy</h1>
                    <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 shadow-sm">
                        <div className="whitespace-pre-wrap text-gray-700 dark:text-gray-300">{content}</div>
                    </div>
                </div>
            </PublicLayout>
        );
    }

    return (
        <PublicLayout>
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
                {/* Header with attractive design */}
                <div className="text-center mb-12">
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-full mb-6">
                        <Shield className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                        <span className="text-sm font-semibold text-blue-600 dark:text-blue-400">
                            Your Privacy Matters
                        </span>
                    </div>
                    <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-r from-blue-100 to-purple-100 dark:from-blue-900/30 dark:to-purple-900/30 mb-6">
                        <Shield className="h-10 w-10 text-blue-600 dark:text-blue-400" />
                    </div>
                    <h1 className="text-5xl md:text-6xl font-bold text-gray-900 dark:text-gray-100 mb-4 bg-gradient-to-r from-gray-900 via-blue-600 to-purple-600 dark:from-gray-100 dark:via-blue-400 dark:to-purple-400 bg-clip-text text-transparent">
                        Privacy Policy
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400">
                        Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                    </p>
                </div>

                {/* Content Sections */}
                <div className="space-y-6">
                    <section className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg border border-gray-200 dark:border-gray-700 hover:shadow-xl transition-shadow">
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4 flex items-center">
                            <div className="bg-blue-50 dark:bg-blue-900/20 p-2 rounded-lg mr-3">
                                <Lock className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                            </div>
                            1. Information We Collect
                        </h2>
                        <p className="text-gray-700 dark:text-gray-300 mb-4">
                            We collect information that you provide directly to us, including:
                        </p>
                        <ul className="list-disc list-inside space-y-2 text-gray-700 dark:text-gray-300 ml-4">
                            <li>Account information (name, email address, phone number)</li>
                            <li>Account and business information</li>
                            <li>Payment and billing information</li>
                            <li>Messages and communications sent through our platform</li>
                            <li>Usage data and analytics</li>
                        </ul>
                    </section>

                    <section className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg border border-gray-200 dark:border-gray-700 hover:shadow-xl transition-shadow">
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4 flex items-center">
                            <div className="bg-blue-50 dark:bg-blue-900/20 p-2 rounded-lg mr-3">
                                <Eye className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                            </div>
                            2. How We Use Your Information
                        </h2>
                        <p className="text-gray-700 dark:text-gray-300 mb-4">
                            We use the information we collect to:
                        </p>
                        <ul className="list-disc list-inside space-y-2 text-gray-700 dark:text-gray-300 ml-4">
                            <li>Provide, maintain, and improve our services</li>
                            <li>Process transactions and send related information</li>
                            <li>Send technical notices and support messages</li>
                            <li>Respond to your comments and questions</li>
                            <li>Monitor and analyze trends and usage</li>
                            <li>Detect, prevent, and address technical issues</li>
                        </ul>
                    </section>

                    <section className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg border border-gray-200 dark:border-gray-700 hover:shadow-xl transition-shadow">
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4 flex items-center">
                            <div className="bg-blue-50 dark:bg-blue-900/20 p-2 rounded-lg mr-3">
                                <Shield className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                            </div>
                            3. Data Security
                        </h2>
                        <p className="text-gray-700 dark:text-gray-300 mb-4">
                            We implement appropriate technical and organizational measures to protect your personal information:
                        </p>
                        <ul className="list-disc list-inside space-y-2 text-gray-700 dark:text-gray-300 ml-4">
                            <li>Encryption of data in transit and at rest</li>
                            <li>Regular security audits and assessments</li>
                            <li>Access controls and authentication mechanisms</li>
                            <li>Secure data centers with physical security measures</li>
                        </ul>
                    </section>

                    <section className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg border border-gray-200 dark:border-gray-700 hover:shadow-xl transition-shadow">
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4 flex items-center">
                            <div className="bg-blue-50 dark:bg-blue-900/20 p-2 rounded-lg mr-3">
                                <FileText className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                            </div>
                            4. Your Rights
                        </h2>
                        <p className="text-gray-700 dark:text-gray-300 mb-4">
                            You have the right to:
                        </p>
                        <ul className="list-disc list-inside space-y-2 text-gray-700 dark:text-gray-300 ml-4">
                            <li>Access and receive a copy of your personal data</li>
                            <li>Rectify inaccurate or incomplete data</li>
                            <li>Request deletion of your personal data</li>
                            <li>Object to processing of your personal data</li>
                            <li>Data portability</li>
                            <li>Withdraw consent at any time</li>
                        </ul>
                    </section>

                    <section className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg border border-gray-200 dark:border-gray-700 hover:shadow-xl transition-shadow">
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">
                            5. Third-Party Services
                        </h2>
                        <p className="text-gray-700 dark:text-gray-300 mb-4">
                            Our services integrate with third-party services, including:
                        </p>
                        <ul className="list-disc list-inside space-y-2 text-gray-700 dark:text-gray-300 ml-4">
                            <li>Meta WhatsApp Cloud API for messaging services</li>
                            <li>Payment processors (Razorpay) for billing</li>
                            <li>Cloud infrastructure providers for hosting</li>
                        </ul>
                        <p className="text-gray-700 dark:text-gray-300 mt-4">
                            These third parties have their own privacy policies, and we encourage you to review them.
                        </p>
                    </section>

                    <section className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg border border-gray-200 dark:border-gray-700 hover:shadow-xl transition-shadow">
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">
                            6. Contact Us
                        </h2>
                        <p className="text-gray-700 dark:text-gray-300 mb-4">
                            If you have any questions about this Privacy Policy, please contact us at:
                        </p>
                        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 border border-blue-200 dark:border-blue-800">
                            <p className="text-gray-900 dark:text-gray-100 font-medium">
                                Email: privacy@example.com<br />
                                Address: [Your Company Address]
                            </p>
                        </div>
                    </section>
                </div>
            </div>
        </PublicLayout>
    );
}
