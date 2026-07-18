import { Head, Link } from '@inertiajs/react';
import { LogIn, Settings, Wrench } from 'lucide-react';
import ErrorFrame from './ErrorFrame';

interface MaintenanceProps {
    message?: string;
}

export default function Maintenance({ message }: MaintenanceProps) {
    const isPlatform = typeof window !== 'undefined' && window.location.pathname.startsWith('/platform');
    const platformHref = typeof route !== 'undefined' ? route('platform.settings') : '/platform/settings';
    const loginHref = typeof route !== 'undefined' ? route('login') : '/login';

    return (
        <>
            <Head title="Maintenance" />
            <ErrorFrame
                code="503"
                title="We'll be back soon"
                description={message || 'We are currently performing scheduled maintenance. Please check back shortly.'}
                icon={Wrench}
                accent="amber"
                actions={[
                    {
                        label: isPlatform ? 'Platform settings' : 'Admin login',
                        href: isPlatform ? platformHref : loginHref,
                        icon: isPlatform ? Settings : LogIn,
                        primary: true,
                    },
                    {
                        label: 'Refresh',
                        onClick: () => window.location.reload(),
                    },
                ]}
            />

            <div className="sr-only">
                <Link href={platformHref}>Platform settings</Link>
            </div>
        </>
    );
}
