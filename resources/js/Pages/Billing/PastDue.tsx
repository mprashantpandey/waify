import { Link, usePage } from '@inertiajs/react';
import { Card, CardContent } from '@/Components/UI/Card';
import { AlertCircle } from 'lucide-react';
import Button from '@/Components/UI/Button';
import { Head } from '@inertiajs/react';

export default function BillingPastDue({
    account,
    subscription,
    gate}: {
    account: {
        name: string;
        slug: string;
        owner_id?: number | string;
    };
    subscription: {
        status: string;
        last_error: string | null;
    };
    gate?: {
        state?: string;
        reason?: string | null;
        recovery_actions?: string[];
    };
}) {
    const { auth } = usePage().props as any;
    const recoveryActions = new Set(gate?.recovery_actions ?? []);
    const canResume = gate?.state === 'canceled_grace' || recoveryActions.has('resume_plan');
    const isOwner = Number(account?.owner_id) === Number(auth?.user?.id);

    return (
        <>
            <Head title="Subscription Past Due" />
            <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 flex items-center justify-center p-4 sm:p-6">
                <Card className="w-full max-w-2xl border-0 shadow-2xl">
                    <CardContent className="pt-8 pb-8 px-5 sm:px-8">
                        <div className="text-center">
                        <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-gradient-to-br from-yellow-100 to-yellow-200 dark:from-yellow-900/20 dark:to-yellow-800/20 mb-6">
                            <AlertCircle className="h-12 w-12 text-yellow-600 dark:text-yellow-400" />
                        </div>
                        <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-gray-100 dark:to-gray-300 bg-clip-text text-transparent mb-3">
                            Renewal Needed
                        </h1>
                        <p className="text-gray-600 dark:text-gray-400 mb-6">
                            The current billing cycle for <strong className="text-gray-900 dark:text-gray-100">{account.name}</strong> has ended.
                        </p>
                        {(subscription.last_error || gate?.reason) && (
                            <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-xl p-4 mb-6 text-left">
                                <p className="text-sm text-yellow-800 dark:text-yellow-200">
                                    <strong>Reason:</strong> {subscription.last_error || gate?.reason}
                                </p>
                            </div>
                        )}
                        <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
                            Complete renewal to restore full access immediately.
                        </p>
                        {!isOwner && (
                            <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-xl p-4 mb-6 text-left">
                                <p className="text-sm text-yellow-800 dark:text-yellow-200">
                                    Only the account owner can renew, resume, or update billing details.
                                </p>
                            </div>
                        )}

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <Link href={route('app.billing.index', { })}>
                                <Button className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 shadow-lg shadow-blue-500/50 rounded-xl w-full">
                                    {isOwner ? 'Open Billing Recovery' : 'View Billing Recovery'}
                                </Button>
                            </Link>
                            <Link href={route('app.billing.plans', { })}>
                                <Button variant="secondary" className="rounded-xl w-full">
                                    {isOwner ? 'Review Plans' : 'View Plans'}
                                </Button>
                            </Link>
                            <Link href={route('app.billing.transactions', { })}>
                                <Button variant="secondary" className="rounded-xl w-full">
                                    Open Transactions
                                </Button>
                            </Link>
                            {canResume && (
                                <Link href={route('app.billing.index', { })}>
                                    <Button variant="secondary" className="rounded-xl w-full">
                                        Resume Plan
                                    </Button>
                                </Link>
                            )}
                            <Link href={route('app.support.hub', { })}>
                                <Button variant="secondary" className="rounded-xl w-full">
                                    Contact Support
                                </Button>
                            </Link>
                        </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </>
    );
}
