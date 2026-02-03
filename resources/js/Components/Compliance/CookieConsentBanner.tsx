import { useEffect, useState } from 'react';
import { usePage } from '@inertiajs/react';
import Button from '@/Components/UI/Button';

const CONSENT_KEY = 'waify.cookie-consent';

export default function CookieConsentBanner() {
    const { compliance } = usePage().props as any;
    const consentRequired = compliance?.cookie_consent_required ?? false;
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        if (!consentRequired) {
            return;
        }
        const stored = window.localStorage.getItem(CONSENT_KEY);
        setVisible(stored !== 'accepted' && stored !== 'declined');
    }, [consentRequired]);

    const handleChoice = (choice: 'accepted' | 'declined') => {
        window.localStorage.setItem(CONSENT_KEY, choice);
        window.dispatchEvent(new CustomEvent('waify:cookie-consent', { detail: choice }));
        setVisible(false);
    };

    if (!consentRequired || !visible) return null;

    return (
        <div className="fixed bottom-4 left-4 right-4 z-50 max-w-3xl mx-auto bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 shadow-lg rounded-xl p-4 flex flex-col sm:flex-row sm:items-center gap-4">
            <div className="text-sm text-gray-700 dark:text-gray-300">
                We use cookies to improve your experience and measure product performance. You can accept or decline non-essential cookies.
            </div>
            <div className="flex items-center gap-2 sm:ml-auto">
                <Button variant="ghost" size="sm" onClick={() => handleChoice('declined')}>
                    Decline
                </Button>
                <Button size="sm" onClick={() => handleChoice('accepted')}>
                    Accept
                </Button>
            </div>
        </div>
    );
}
