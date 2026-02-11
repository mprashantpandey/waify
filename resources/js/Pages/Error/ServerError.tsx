import { Link } from '@inertiajs/react';
import { Head } from '@inertiajs/react';
import { Home, ArrowLeft, RefreshCw } from 'lucide-react';
import Button from '@/Components/UI/Button';

export default function ServerError() {
    const path = typeof window !== 'undefined' ? window.location.pathname : '';
    const isApp = path.startsWith('/app');

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4">
            <Head title="Something went wrong" />
            <div className="text-center max-w-md">
                <p className="text-6xl font-bold text-gray-200 dark:text-gray-700">500</p>
                <h1 className="mt-4 text-xl font-semibold text-gray-900 dark:text-gray-100">
                    Something went wrong
                </h1>
                <p className="mt-2 text-gray-600 dark:text-gray-400">
                    We’re sorry, we couldn’t complete your request. Our team has been notified. Please try again in a moment.
                </p>
                <div className="mt-8 flex justify-center gap-4 flex-wrap">
                    <Button
                        onClick={() => window.location.reload()}
                        variant="primary"
                    >
                        <RefreshCw className="h-4 w-4 mr-2" aria-hidden />
                        Try again
                    </Button>
                    <Button onClick={() => window.history.back()} variant="secondary">
                        <ArrowLeft className="h-4 w-4 mr-2" aria-hidden />
                        Go back
                    </Button>
                    {isApp && typeof route !== 'undefined' && (
                        <Link href={route('app.dashboard')}>
                            <Button variant="secondary">
                                <Home className="h-4 w-4 mr-2" aria-hidden />
                                Dashboard
                            </Button>
                        </Link>
                    )}
                </div>
            </div>
        </div>
    );
}
