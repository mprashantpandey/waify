import { Head } from '@inertiajs/react';
import { RefreshCw, ServerCrash } from 'lucide-react';
import ErrorFrame, { defaultBackAction, defaultDashboardAction } from './ErrorFrame';

export default function ServerError() {
    const isApp = typeof window !== 'undefined' && window.location.pathname.startsWith('/app');
    const actions = [
        { label: 'Retry', icon: RefreshCw, onClick: () => window.location.reload(), primary: true },
        defaultBackAction(),
        ...(isApp ? [defaultDashboardAction()] : []),
    ];

    return (
        <>
            <Head title="Something went wrong" />
            <ErrorFrame
                code="500"
                title="Something went wrong"
                description="The request failed on the server. Retry once; if it continues, check System Health or recent logs."
                icon={ServerCrash}
                accent="red"
                actions={actions}
            />
        </>
    );
}
