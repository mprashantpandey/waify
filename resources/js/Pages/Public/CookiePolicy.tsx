import LegalDocumentPage from '@/Components/Public/LegalDocumentPage';
import { Cookie } from 'lucide-react';

export default function CookiePolicy({ content = '' }: { content?: string }) {
    return (
        <LegalDocumentPage
            title="Cookie Policy"
            eyebrow="Cookies & Tracking"
            icon={<Cookie className="h-3.5 w-3.5" />}
            lastUpdated={new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
            content={content}
        >
            <section>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">How we use cookies</h2>
                <p className="mt-2">
                    We use cookies and similar technologies to keep sessions secure, remember preferences, improve performance, and understand product usage.
                </p>
            </section>
            <section>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Cookie categories</h2>
                <ul className="mt-2 list-disc pl-5 space-y-1">
                    <li>Essential cookies for login, session security, and account access.</li>
                    <li>Preference cookies for UI behavior and saved settings.</li>
                    <li>Analytics cookies when enabled by platform configuration.</li>
                </ul>
            </section>
            <section>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Managing cookies</h2>
                <p className="mt-2">
                    You can manage browser cookies from your browser settings. Disabling essential cookies may affect login and core product functionality.
                </p>
            </section>
        </LegalDocumentPage>
    );
}
