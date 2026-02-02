import { Link } from '@inertiajs/react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/Components/UI/Card';
import Button from '@/Components/UI/Button';
import { CreditCard, TrendingUp, ArrowRight } from 'lucide-react';

export default function BillingTab({ workspace }: { workspace: any }) {
    if (!workspace) {
        return (
            <Card className="border-0 shadow-lg">
                <CardContent className="py-12 text-center">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-800 mb-4">
                        <CreditCard className="h-8 w-8 text-gray-400" />
                    </div>
                    <p className="text-gray-500 dark:text-gray-400 font-medium">No workspace selected</p>
                </CardContent>
            </Card>
        );
    }

    return (
        <div className="space-y-6">
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
                    <Link href={route('app.billing.index', { workspace: workspace.slug })}>
                        <Button variant="secondary" className="rounded-xl group">
                            <CreditCard className="h-4 w-4 mr-2" />
                            Go to Billing
                            <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
                        </Button>
                    </Link>
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
                    <Link href={route('app.billing.usage', { workspace: workspace.slug })}>
                        <Button variant="secondary" className="rounded-xl group">
                            <TrendingUp className="h-4 w-4 mr-2" />
                            View Usage Details
                            <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
                        </Button>
                    </Link>
                </CardContent>
            </Card>
        </div>
    );
}
