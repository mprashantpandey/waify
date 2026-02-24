import { Link } from '@inertiajs/react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/Components/UI/Card';
import Button from '@/Components/UI/Button';
import { CreditCard, TrendingUp, ArrowRight, Receipt, Wallet, ShieldCheck } from 'lucide-react';

export default function BillingTab() {
    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-900">
                    <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                        <CreditCard className="h-3.5 w-3.5" />
                        Subscription
                    </div>
                    <div className="mt-1 text-sm font-semibold text-gray-900 dark:text-gray-100">Plan and renewal</div>
                </div>
                <div className="rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-900">
                    <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                        <TrendingUp className="h-3.5 w-3.5" />
                        Usage
                    </div>
                    <div className="mt-1 text-sm font-semibold text-gray-900 dark:text-gray-100">Messages, templates, limits</div>
                </div>
                <div className="rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-900">
                    <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                        <ShieldCheck className="h-3.5 w-3.5" />
                        Billing safety
                    </div>
                    <div className="mt-1 text-sm font-semibold text-gray-900 dark:text-gray-100">Transactions and history</div>
                </div>
            </div>

            <Card className="border-0 shadow-lg">
                <CardHeader className="bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-500 rounded-xl">
                            <CreditCard className="h-5 w-5 text-white" />
                        </div>
                        <div>
                            <CardTitle className="text-xl font-bold">Billing & Subscription</CardTitle>
                            <CardDescription>Manage your subscription, view usage, and change plans</CardDescription>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="p-6">
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                        View your current plan, manage billing, and upgrade or downgrade your subscription.
                    </p>
                    <div className="flex flex-wrap gap-3">
                        <Link href={route('app.billing.index', {})}>
                            <Button variant="secondary" className="rounded-xl group">
                                <CreditCard className="h-4 w-4 mr-2" />
                                Open Billing
                                <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
                            </Button>
                        </Link>
                        <Link href={route('app.billing.transactions', {})}>
                            <Button variant="secondary" className="rounded-xl group">
                                <Receipt className="h-4 w-4 mr-2" />
                                Transactions
                            </Button>
                        </Link>
                    </div>
                </CardContent>
            </Card>

            <Card className="border-0 shadow-lg">
                <CardHeader className="bg-gradient-to-r from-gray-50 to-white dark:from-gray-800 dark:to-gray-900">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl">
                            <TrendingUp className="h-5 w-5 text-white" />
                        </div>
                        <div>
                            <CardTitle className="text-xl font-bold">Usage & Limits</CardTitle>
                            <CardDescription>View detailed usage statistics and billing history</CardDescription>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="p-6">
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                        Monitor your usage across messages, templates, connections, and more.
                    </p>
                    <div className="flex flex-wrap gap-3">
                        <Link href={route('app.billing.usage', { })}>
                            <Button variant="secondary" className="rounded-xl group">
                                <TrendingUp className="h-4 w-4 mr-2" />
                                View Usage Details
                                <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
                            </Button>
                        </Link>
                        <Link href={route('app.billing.history', {})}>
                            <Button variant="secondary" className="rounded-xl">
                                <Wallet className="h-4 w-4 mr-2" />
                                Payment History
                            </Button>
                        </Link>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
