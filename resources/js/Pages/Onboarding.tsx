import { useForm, usePage } from '@inertiajs/react';
import { FormEventHandler, useEffect, useMemo, useState } from 'react';
import GuestLayout from '@/Layouts/GuestLayout';
import Button from '@/Components/UI/Button';
import { Check, Sparkles, Zap, Users, Building2, Crown, ArrowRight, Shield, CreditCard } from 'lucide-react';
import { Card, CardContent } from '@/Components/UI/Card';
import { Badge } from '@/Components/UI/Badge';

interface Plan {
    id: number;
    key: string;
    name: string;
    description: string;
    price_monthly: number;
    price_yearly: number | null;
    currency: string;
    trial_days: number;
    limits: Record<string, any>;
    modules: string[];
}

export default function Onboarding({ plans = [], defaultPlanKey = 'free' }: { plans?: Plan[]; defaultPlanKey?: string }) {
    const page = usePage() as any;
    const authUser = page.props?.auth?.user;
    const [selectedPlanKey, setSelectedPlanKey] = useState<string>(defaultPlanKey);
    const [step, setStep] = useState<1 | 2>(1);
    const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');
    const [autoCreateStarted, setAutoCreateStarted] = useState(false);
    const [autoCreateFailed, setAutoCreateFailed] = useState(false);
    
    const { data, setData, post, processing, errors } = useForm({
        plan_key: defaultPlanKey,
    });

    // Update form data when plan selection changes
    const handlePlanSelect = (planKey: string) => {
        setSelectedPlanKey(planKey);
        setData('plan_key', planKey);
        setAutoCreateFailed(false);
    };

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        setAutoCreateStarted(true);
        setAutoCreateFailed(false);
        post(route('onboarding.store'), {
            onError: () => {
                setAutoCreateFailed(true);
                setAutoCreateStarted(false);
            },
        });
    };

    const selectedPlan = useMemo(
        () => plans.find((p) => p.key === selectedPlanKey) ?? plans[0] ?? null,
        [plans, selectedPlanKey]
    );

    const formatPrice = (amount: number, currency: string = 'USD') => {
        if (amount === 0 || amount === null) return 'Free';
        const major = amount / 100; // Convert minor units to major
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: currency,
            minimumFractionDigits: 0,
        }).format(major);
    };

    const getPlanIcon = (key: string) => {
        switch (key.toLowerCase()) {
            case 'free':
                return Users;
            case 'starter':
                return Zap;
            case 'pro':
                return Building2;
            case 'enterprise':
                return Crown;
            default:
                return Users;
        }
    };

    const getPlanColor = (key: string) => {
        switch (key.toLowerCase()) {
            case 'free':
                return 'from-gray-500 to-gray-600';
            case 'starter':
                return 'from-blue-500 to-blue-600';
            case 'pro':
                return 'from-purple-500 to-purple-600';
            case 'enterprise':
                return 'from-yellow-500 to-orange-600';
            default:
                return 'from-blue-500 to-blue-600';
        }
    };

    const currentPlanPrice = (plan: Plan | null) => {
        if (!plan) return 0;
        return billingCycle === 'yearly' && plan.price_yearly != null ? plan.price_yearly : plan.price_monthly;
    };

    const canGoStep2 = Boolean(selectedPlanKey);

    useEffect(() => {
        if (step !== 2 || autoCreateStarted || autoCreateFailed || processing || !data.plan_key) {
            return;
        }
        const timer = window.setTimeout(() => {
            setAutoCreateStarted(true);
            post(route('onboarding.store'), {
                onError: () => {
                    setAutoCreateFailed(true);
                    setAutoCreateStarted(false);
                },
            });
        }, 300);
        return () => window.clearTimeout(timer);
    }, [step, autoCreateStarted, autoCreateFailed, processing, data.plan_key]);

    return (
        <GuestLayout maxWidthClass="max-w-6xl">
            <div className="w-full max-w-6xl space-y-8">
                <div className="text-center">
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-full mb-4">
                        <Sparkles className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                        <span className="text-sm font-semibold text-blue-600 dark:text-blue-400">
                            Choose Your Plan • Start Free Trial
                        </span>
                    </div>
                    <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-gray-900 dark:text-gray-100">
                        Welcome{authUser?.name ? `, ${authUser.name}` : ''} — Let’s Set Up Your Account
                    </h2>
                    <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                        Professional onboarding in a few guided steps: plan and review.
                    </p>
                </div>

                <Card>
                    <CardContent className="p-5">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {[
                                { id: 1, title: 'Choose Plan', icon: CreditCard },
                                { id: 2, title: 'Review & Create', icon: Shield },
                            ].map((item) => {
                                const Icon = item.icon;
                                const active = step === item.id;
                                const done = step > item.id;
                                return (
                                    <button
                                        key={item.id}
                                        type="button"
                                        onClick={() => {
                                            if (item.id === 1 || (item.id === 2 && canGoStep2)) {
                                                setStep(item.id as 1 | 2);
                                            }
                                        }}
                                        className={`flex min-w-0 items-center gap-3 rounded-xl border px-4 py-3 text-left transition ${
                                            active
                                                ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                                                : done
                                                  ? 'border-emerald-300 bg-emerald-50 dark:bg-emerald-900/10'
                                                  : 'border-gray-200 dark:border-gray-800'
                                        }`}
                                    >
                                        <div className={`flex h-9 w-9 items-center justify-center rounded-full ${done ? 'bg-emerald-600' : active ? 'bg-blue-600' : 'bg-gray-300 dark:bg-gray-700'}`}>
                                            {done ? <Check className="h-4 w-4 text-white" /> : <Icon className="h-4 w-4 text-white" />}
                                        </div>
                                        <div>
                                            <p className="text-xs text-gray-500 dark:text-gray-400">Step {item.id}</p>
                                            <p className="text-sm font-semibold text-gray-900 dark:text-gray-100 break-words">{item.title}</p>
                                        </div>
                                    </button>
                                );
                            })}
                        </div>
                    </CardContent>
                </Card>

                <div className="flex justify-center">
                    <div className="inline-flex rounded-xl border border-gray-200 dark:border-gray-700 p-1 bg-white dark:bg-gray-900">
                        <button
                            type="button"
                            onClick={() => setBillingCycle('monthly')}
                            className={`px-4 py-2 text-sm rounded-lg ${billingCycle === 'monthly' ? 'bg-blue-600 text-white' : 'text-gray-600 dark:text-gray-300'}`}
                        >
                            Monthly
                        </button>
                        <button
                            type="button"
                            onClick={() => setBillingCycle('yearly')}
                            className={`px-4 py-2 text-sm rounded-lg ${billingCycle === 'yearly' ? 'bg-blue-600 text-white' : 'text-gray-600 dark:text-gray-300'}`}
                        >
                            Yearly
                        </button>
                    </div>
                </div>

                {/* Plan Selection */}
                {plans.length > 0 && step === 1 && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {plans.map((plan) => {
                            const Icon = getPlanIcon(plan.key);
                            const isSelected = selectedPlanKey === plan.key;
                            
                            return (
                                <Card
                                    key={plan.id}
                                    className={`cursor-pointer transition-all duration-200 ${
                                        isSelected
                                            ? 'ring-2 ring-blue-500 shadow-lg scale-105'
                                            : 'hover:shadow-md'
                                    }`}
                                    onClick={() => handlePlanSelect(plan.key)}
                                >
                                    <CardContent className="p-6">
                                        <div className="flex items-center justify-between mb-4">
                                            <div className={`p-3 rounded-xl bg-gradient-to-r ${getPlanColor(plan.key)}`}>
                                                <Icon className="h-6 w-6 text-white" />
                                            </div>
                                            {isSelected && (
                                                <div className="h-6 w-6 rounded-full bg-blue-500 flex items-center justify-center">
                                                    <Check className="h-4 w-4 text-white" />
                                                </div>
                                            )}
                                        </div>
                                        
                                        <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                                            {plan.name}
                                        </h3>
                                        
                                        <div className="mb-4">
                                            <div className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                                                {formatPrice(
                                                    billingCycle === 'yearly' && plan.price_yearly != null ? plan.price_yearly : plan.price_monthly,
                                                    plan.currency
                                                )}
                                            </div>
                                            <div className="text-sm text-gray-500 dark:text-gray-400">
                                                per {billingCycle === 'yearly' ? 'year' : 'month'}
                                            </div>
                                        </div>

                                        {plan.trial_days > 0 && (
                                            <Badge variant="success" className="mb-4">
                                                {plan.trial_days}-Day Free Trial
                                            </Badge>
                                        )}
                                        {plan.key.toLowerCase() === 'pro' && (
                                            <Badge variant="info" className="mb-4 ml-2">Recommended</Badge>
                                        )}

                                        {plan.description && (
                                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                                                {plan.description}
                                            </p>
                                        )}

                                        {/* Key Limits Preview */}
                                        <div className="space-y-2 text-sm">
                                            {(plan.limits?.whatsapp_connections || plan.limits?.connections) && (
                                                <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                                                    <Check className="h-4 w-4 text-green-500" />
                                                    <span>
                                                        {(plan.limits.whatsapp_connections ?? plan.limits.connections) === -1
                                                            ? 'Unlimited'
                                                            : (plan.limits.whatsapp_connections ?? plan.limits.connections)}{' '}
                                                        WhatsApp {(plan.limits.whatsapp_connections ?? plan.limits.connections) === 1 ? 'Connection' : 'Connections'}
                                                    </span>
                                                </div>
                                            )}
                                            {plan.limits?.messages_monthly && (
                                                <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                                                    <Check className="h-4 w-4 text-green-500" />
                                                    <span>
                                                        {plan.limits.messages_monthly === -1
                                                            ? 'Unlimited'
                                                            : plan.limits.messages_monthly.toLocaleString()}{' '}
                                                        Messages/Month
                                                    </span>
                                                </div>
                                            )}
                                            {plan.limits?.agents && (
                                                <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                                                    <Check className="h-4 w-4 text-green-500" />
                                                    <span>
                                                        {plan.limits.agents === -1
                                                            ? 'Unlimited'
                                                            : plan.limits.agents}{' '}
                                                        {plan.limits.agents === 1 ? 'Agent' : 'Agents'}
                                                    </span>
                                                </div>
                                            )}
                                        </div>
                                    </CardContent>
                                </Card>
                            );
                        })}
                    </div>
                )}

                {step === 1 && (
                    <div className="flex justify-end">
                        <Button type="button" onClick={() => setStep(2)} disabled={!canGoStep2}>
                            Continue to Review <ArrowRight className="h-4 w-4 ml-2" />
                        </Button>
                    </div>
                )}

                {step >= 2 && (
                <form className="space-y-6" onSubmit={submit}>
                    <Card>
                        <CardContent className="p-6 space-y-4">
                            <div className="flex items-center justify-between gap-3">
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Review Setup</h3>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">
                                        Confirm your plan and create your tenant account.
                                    </p>
                                </div>
                            </div>

                            {step === 2 && (
                                <div className="rounded-xl border border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-900/15 p-4 space-y-3">
                                    <div className="flex items-center gap-2">
                                        <p className="text-sm font-semibold text-blue-900 dark:text-blue-100">Review Setup</p>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
                                        <div className="rounded-lg bg-white/70 dark:bg-gray-900/40 p-3">
                                            <p className="text-xs text-gray-500 dark:text-gray-400">Selected Plan</p>
                                            <p className="font-semibold text-gray-900 dark:text-gray-100">{selectedPlan?.name || '—'}</p>
                                        </div>
                                        <div className="rounded-lg bg-white/70 dark:bg-gray-900/40 p-3">
                                            <p className="text-xs text-gray-500 dark:text-gray-400">Price</p>
                                            <p className="font-semibold text-gray-900 dark:text-gray-100">
                                                {selectedPlan ? formatPrice(currentPlanPrice(selectedPlan), selectedPlan.currency) : '—'} / {billingCycle === 'yearly' ? 'year' : 'month'}
                                            </p>
                                        </div>
                                        <div className="rounded-lg bg-white/70 dark:bg-gray-900/40 p-3">
                                            <p className="text-xs text-gray-500 dark:text-gray-400">Next Step After Create</p>
                                            <p className="font-semibold text-gray-900 dark:text-gray-100">Complete Profile</p>
                                        </div>
                                    </div>
                                    <ul className="space-y-2 text-xs text-blue-800 dark:text-blue-200">
                                        <li className="flex items-start gap-2"><Check className="h-3.5 w-3.5 mt-0.5" />Account and subscription will be created automatically.</li>
                                        <li className="flex items-start gap-2"><Check className="h-3.5 w-3.5 mt-0.5" />Core modules will be enabled by default.</li>
                                        <li className="flex items-start gap-2"><Check className="h-3.5 w-3.5 mt-0.5" />You will be redirected to complete your profile before entering the app.</li>
                                    </ul>
                                    <p className="text-xs text-blue-800 dark:text-blue-200">
                                        Account owner: {authUser?.email || authUser?.name || 'Current user'}
                                    </p>
                                </div>
                            )}

                            <div className="flex flex-col gap-3">
                                <div className="flex justify-between gap-3">
                                    <Button type="button" variant="secondary" onClick={() => setStep(1)}>
                                        Back to Plans
                                    </Button>
                                    {autoCreateFailed ? (
                                        <Button type="submit" className="w-full md:w-auto" disabled={processing || !data.plan_key}>
                                            {processing ? 'Retrying...' : 'Retry Create Account'}
                                        </Button>
                                    ) : (
                                        <Button type="button" className="w-full md:w-auto" disabled>
                                            {processing || autoCreateStarted ? 'Auto creating account...' : 'Preparing...'}
                                        </Button>
                                    )}
                                </div>
                                {errors.plan_key && <p className="text-sm text-red-600 dark:text-red-400">{errors.plan_key}</p>}
                                {selectedPlanKey && (plans.find((p) => p.key === selectedPlanKey)?.trial_days ?? 0) > 0 && (
                                    <p className="mt-2 text-center text-xs text-gray-500 dark:text-gray-400">
                                        You'll start with a {plans.find((p) => p.key === selectedPlanKey)?.trial_days}-day free trial
                                    </p>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </form>
                )}
            </div>
        </GuestLayout>
    );
}
