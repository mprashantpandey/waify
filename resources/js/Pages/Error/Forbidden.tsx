import { Link } from '@inertiajs/react';
import { Head } from '@inertiajs/react';
import { Home, ArrowLeft } from 'lucide-react';
import Button from '@/Components/UI/Button';

export default function Forbidden() {
    const path = typeof window !== 'undefined' ? window.location.pathname : '';
    const isApp = path.startsWith('/app');

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4">
            <Head title="Access denied" />
            <div className="text-center">
                <p className="text-6xl font-bold text-gray-200 dark:text-gray-700">403</p>
                <h1 className="mt-4 text-xl font-semibold text-gray-900 dark:text-gray-100">Access denied</h1>
                <p className="mt-2 text-gray-600 dark:text-gray-400">
                    You don’t have permission to view this page.
                </p>
                <div className="mt-8 flex justify-center gap-4 flex-wrap">
                    {isApp && typeof route !== 'undefined' && (
                        <Link href={route('app.dashboard')}>
                            <Button>
                                <Home className="h-4 w-4 mr-2" aria-hidden />
                                Back to Dashboard
                            </Button>
                        </Link>
                    )}
                    <Button onClick={() => window.history.back()} variant="secondary">
                        <ArrowLeft className="h-4 w-4 mr-2" aria-hidden />
                        Go back
                    </Button>
                    {isApp && typeof route !== 'undefined' && (
                        <Link href={route('app.whatsapp.conversations.index')}>
                            <Button variant="secondary">
                                Inbox
                            </Button>
                        </Link>
                    )}
                </div>
            </div>
        </div>
    );
}
