import { Card, CardContent } from '@/Components/UI/Card';
import { AlertCircle } from 'lucide-react';
import { Head } from '@inertiajs/react';

export default function AccountSuspended({
    account}: {
    account: {
        name: string;
        status: string;
        disabled_reason: string | null;
    };
}) {
    return (
        <>
            <Head title="Account Disabled" />
            <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 flex items-center justify-center p-4">
                <Card className="w-full max-w-md border-0 shadow-2xl">
                    <CardContent className="pt-12 pb-8 text-center">
                        <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-gradient-to-br from-yellow-100 to-yellow-200 dark:from-yellow-900/20 dark:to-yellow-800/20 mb-6">
                            <AlertCircle className="h-12 w-12 text-yellow-600 dark:text-yellow-400" />
                        </div>
                        <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-gray-100 dark:to-gray-300 bg-clip-text text-transparent mb-3">
                            Account Disabled
                        </h1>
                        <p className="text-gray-600 dark:text-gray-400 mb-6">
                            The account <strong className="text-gray-900 dark:text-gray-100">{account.name}</strong> has been disabled.
                        </p>
                        {account.disabled_reason && (
                            <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-xl p-4 mb-6 text-left">
                                <p className="text-sm text-yellow-800 dark:text-yellow-200">
                                    <strong>Reason:</strong> {account.disabled_reason}
                                </p>
                            </div>
                        )}
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                            Please contact support if you believe this is an error.
                        </p>
                    </CardContent>
                </Card>
            </div>
        </>
    );
}
