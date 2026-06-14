import { Head } from '@inertiajs/react';
import { ShieldAlert } from 'lucide-react';
import ErrorFrame, { defaultBackAction, defaultDashboardAction } from './ErrorFrame';

export default function Forbidden() {
    const path = typeof window !== 'undefined' ? window.location.pathname : '';
    const isApp = path.startsWith('/app');
    const actions = [
        defaultBackAction(),
        ...(isApp ? [defaultDashboardAction()] : []),
        ...(isApp && typeof route !== 'undefined'
            ? [{ label: 'Inbox', href: route('app.whatsapp.conversations.index') }]
            : []),
    ];

    return (
        <>
            <Head title="Access denied" />
            <ErrorFrame
                code="403"
                title="Access denied"
                description="You do not have permission to view this page in the current workspace."
                icon={ShieldAlert}
                accent="amber"
                actions={actions}
            />
        </>
    );
}
