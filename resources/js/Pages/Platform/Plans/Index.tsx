import { Head, Link, router } from '@inertiajs/react';
import PlatformShell from '@/Layouts/PlatformShell';
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/UI/Card';
import Button from '@/Components/UI/Button';
import { Badge } from '@/Components/UI/Badge';
import ConfirmationDialog from '@/Components/UI/ConfirmationDialog';
import { useToast } from '@/hooks/useToast';
import { Plus, Edit, Eye, ToggleLeft, ToggleRight, CreditCard } from 'lucide-react';
import { usePage } from '@inertiajs/react';
import { useState, useEffect } from 'react';

interface Plan {
    id: number;
    key: string;
    name: string;
    description: string | null;
    price_monthly: number | null;
    price_yearly: number | null;
    currency: string;
    is_active: boolean;
    is_public: boolean;
    trial_days: number;
    sort_order: number;
    subscriptions_count: number;
}

export default function PlansIndex({ plans }: { plans: Plan[] }) {
    const { auth, flash } = usePage().props as any;
    const { addToast } = useToast();
    const [confirmToggle, setConfirmToggle] = useState<{ show: boolean; planId: string | null; planName: string; isActive: boolean }>({
        show: false,
        planId: null,
        planName: '',
        isActive: false});

    useEffect(() => {
        if (flash?.success) {
            addToast({
                title: 'Success',
                description: flash.success,
                variant: 'success'});
        }
        if (flash?.error) {
            addToast({
                title: 'Error',
                description: flash.error,
                variant: 'error'});
        }
    }, [flash, addToast]);

    const handleToggle = (planId: string, planName: string, isActive: boolean) => {
        setConfirmToggle({
            show: true,
            planId,
            planName,
            isActive});
    };

    const confirmToggleAction = () => {
        if (confirmToggle.planId) {
            router.post(
                route('platform.plans.toggle', { plan: confirmToggle.planId }),
                {},
                {
                    preserveScroll: true,
                    onSuccess: () => {
                        addToast({
                            title: 'Plan Updated',
                            description: `${confirmToggle.planName} has been ${confirmToggle.isActive ? 'deactivated' : 'activated'}.`,
                            variant: 'success'});
                        setConfirmToggle({ show: false, planId: null, planName: '', isActive: false });
                    },
                    onError: () => {
                        addToast({
                            title: 'Error',
                            description: 'Failed to update plan status.',
                            variant: 'error'});
                    }}
            );
        }
    };

    const formatPrice = (amount: number | null, currency: string) => {
        if (amount === null || amount === 0) return 'Free';
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: currency || 'USD'}).format(amount / 100);
    };

    return (
        <PlatformShell auth={auth}>
            <Head title="Plans" />
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Plans</h1>
                        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                            Manage subscription plans and pricing
                        </p>
                    </div>
                    <Link href={route('platform.plans.create')}>
                        <Button>
                            <Plus className="h-4 w-4 mr-2" />
                            Create Plan
                        </Button>
                    </Link>
                </div>


                {plans.length === 0 ? (
                    <Card>
                        <CardContent className="py-12 text-center">
                            <CreditCard className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                                No plans yet
                            </h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                                Get started by creating your first subscription plan.
                            </p>
                            <Link href={route('platform.plans.create')}>
                                <Button>
                                    <Plus className="h-4 w-4 mr-2" />
                                    Create Plan
                                </Button>
                            </Link>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="grid gap-6">
                        {plans.map((plan) => (
                            <Card key={plan.id}>
                                <CardHeader>
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-3 mb-2">
                                                <CardTitle>{plan.name}</CardTitle>
                                                <Badge variant={plan.is_active ? 'success' : 'default'}>
                                                    {plan.is_active ? 'Active' : 'Inactive'}
                                                </Badge>
                                                {plan.is_public && (
                                                    <Badge variant="info">Public</Badge>
                                                )}
                                            </div>
                                            {plan.description && (
                                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                                    {plan.description}
                                                </p>
                                            )}
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <button
                                                onClick={() => handleToggle(plan.key, plan.name, plan.is_active)}
                                                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
                                                title={plan.is_active ? 'Deactivate' : 'Activate'}
                                            >
                                                {plan.is_active ? (
                                                    <ToggleRight className="h-5 w-5 text-green-600" />
                                                ) : (
                                                    <ToggleLeft className="h-5 w-5 text-gray-400" />
                                                )}
                                            </button>
                                            <Link href={route('platform.plans.show', { plan: plan.key })}>
                                                <Button variant="secondary" size="sm">
                                                    <Eye className="h-4 w-4 mr-2" />
                                                    View
                                                </Button>
                                            </Link>
                                            <Link href={route('platform.plans.edit', { plan: plan.key })}>
                                                <Button variant="secondary" size="sm">
                                                    <Edit className="h-4 w-4 mr-2" />
                                                    Edit
                                                </Button>
                                            </Link>
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                        <div>
                                            <p className="text-sm text-gray-500 dark:text-gray-400">Monthly Price</p>
                                            <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                                                {formatPrice(plan.price_monthly, plan.currency)}
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-500 dark:text-gray-400">Yearly Price</p>
                                            <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                                                {formatPrice(plan.price_yearly, plan.currency)}
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-500 dark:text-gray-400">Trial Days</p>
                                            <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                                                {plan.trial_days || 0}
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-500 dark:text-gray-400">Subscriptions</p>
                                            <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                                                {plan.subscriptions_count}
                                            </p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}

                <ConfirmationDialog
                    show={confirmToggle.show}
                    onClose={() => setConfirmToggle({ show: false, planId: null, planName: '', isActive: false })}
                    onConfirm={confirmToggleAction}
                    title={confirmToggle.isActive ? 'Deactivate Plan' : 'Activate Plan'}
                    message={`Are you sure you want to ${confirmToggle.isActive ? 'deactivate' : 'activate'} "${confirmToggle.planName}"? ${confirmToggle.isActive ? 'Tenants using this plan will not be able to access it.' : 'This plan will become available for selection.'}`}
                    confirmText={confirmToggle.isActive ? 'Deactivate' : 'Activate'}
                    variant={confirmToggle.isActive ? 'warning' : 'info'}
                />
            </div>
        </PlatformShell>
    );
}
