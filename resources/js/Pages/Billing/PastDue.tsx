import { Link } from '@inertiajs/react';
import AppShell from '@/Layouts/AppShell';
import { Card, CardContent } from '@/Components/UI/Card';
import { AlertCircle, ArrowRight, CreditCard } from 'lucide-react';
import Button from '@/Components/UI/Button';
import { Head } from '@inertiajs/react';

export default function BillingPastDue({
    account,
    subscription}: {
    account: {
        name: string;
        slug: string;
    };
    subscription: {
        status: string;
        last_error: string | null;
    };
}) {
    return (
        <>
            <Head title="Subscription Past Due" />
            <AppShell>
            <div className="mx-auto flex min-h-[calc(100vh-8rem)] max-w-[1400px] items-center justify-center p-4 sm:p-6">
                <Card className="w-full max-w-lg overflow-hidden">
                    <CardContent className="p-8">
                        <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-lg bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300">
                            <AlertCircle className="h-6 w-6" />
                        </div>
                        <h1 className="mb-3 text-2xl font-bold text-gray-900 dark:text-gray-100">
                            Subscription Past Due
                        </h1>
                        <p className="mb-6 text-sm text-gray-600 dark:text-gray-400">
                            Your subscription for <strong className="text-gray-900 dark:text-gray-100">{account.name}</strong> is past due.
                        </p>
                        {subscription.last_error && (
                            <div className="mb-6 rounded-lg border border-amber-200 bg-amber-50 p-4 text-left dark:border-amber-800 dark:bg-amber-900/20">
                                <p className="text-sm text-amber-800 dark:text-amber-200">
                                    <strong>Reason:</strong> {subscription.last_error}
                                </p>
                            </div>
                        )}
                        <p className="mb-6 text-sm text-gray-500 dark:text-gray-400">
                            Please update your payment method or contact support to restore access.
                        </p>
                        <Link href={route('app.billing.index', { })}>
                            <Button className="w-full gap-2">
                                <CreditCard className="h-4 w-4" />
                                Go to Billing
                                <ArrowRight className="h-4 w-4" />
                            </Button>
                        </Link>
                    </CardContent>
                </Card>
            </div>
            </AppShell>
        </>
    );
}
