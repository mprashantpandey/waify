import { Link } from '@inertiajs/react';
import { Card } from '@/Components/UI/Card';
import Button from '@/Components/UI/Button';
import { ArrowRight, CreditCard, TrendingUp } from 'lucide-react';

export default function BillingTab() {
    return (
        <div className="grid gap-4 md:grid-cols-2">
            <Card className="p-5">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-waify-green-soft text-waify-green-dark dark:bg-emerald-950/40 dark:text-emerald-300">
                    <CreditCard className="h-5 w-5" />
                </div>
                <p className="mt-4 text-sm text-waify-text-muted dark:text-waify-dark-text-muted">
                    View your current plan, manage billing, and upgrade or downgrade your subscription.
                </p>
                <Link href={route('app.billing.index', {})} className="mt-4 inline-flex">
                    <Button variant="secondary" className="group">
                        <CreditCard className="h-4 w-4" />
                        Go to billing
                        <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </Button>
                </Link>
            </Card>

            <Card className="p-5">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-300">
                    <TrendingUp className="h-5 w-5" />
                </div>
                <p className="mt-4 text-sm text-waify-text-muted dark:text-waify-dark-text-muted">
                    Monitor usage across messages, templates, connections, and billing history.
                </p>
                <Link href={route('app.billing.index', { tab: 'usage' })} className="mt-4 inline-flex">
                    <Button variant="secondary" className="group">
                        <TrendingUp className="h-4 w-4" />
                        View usage details
                        <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </Button>
                </Link>
            </Card>
        </div>
    );
}
