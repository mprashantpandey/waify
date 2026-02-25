import { useForm, usePage } from '@inertiajs/react';
import { FormEventHandler, ChangeEvent, useMemo, useState } from 'react';
import GuestLayout from '@/Layouts/GuestLayout';
import Button from '@/Components/UI/Button';
import TextInput from '@/Components/TextInput';
import InputLabel from '@/Components/InputLabel';
import InputError from '@/Components/InputError';
import { Check, Sparkles, Zap, Users, Building2, Crown, ArrowRight, Shield, CreditCard, Settings } from 'lucide-react';
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
    const [step, setStep] = useState<1 | 2 | 3>(1);
    const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');
    
    const { data, setData, post, processing, errors } = useForm({
        name: '',
        plan_key: defaultPlanKey,
    });

    // Update form data when plan selection changes
    const handlePlanSelect = (planKey: string) => {
        setSelectedPlanKey(planKey);
        setData('plan_key', planKey);
    };

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route('onboarding.store'));
    };

    const selectedPlan = useMemo(
        () => plans.find((p) => p.key === selectedPlanKey) ?? plans[0] ?? null,
        [plans, selectedPlanKey]
    );

    const suggestedSlug = useMemo(() => {
        const base = (data.name || '')
            .toLowerCase()
            .trim()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-+|-+$/g, '')
            .slice(0, 40);
        return base || 'your-workspace';
    }, [data.name]);

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
    const canGoStep3 = Boolean(data.name.trim());

    return (
        <GuestLayout>
            <div className="w-full max-w-6xl space-y-8">
                <div className="text-center">
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-full mb-4">
                        <Sparkles className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                        <span className="text-sm font-semibold text-blue-600 dark:text-blue-400">
                            Choose Your Plan • Start Free Trial
                        </span>
                    </div>
                    <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-gray-900 dark:text-gray-100">
                        Welcome{authUser?.name ? `, ${authUser.name}` : ''} — Let’s Set Up Your Workspace
                    </h2>
                    <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                        Professional onboarding in a few guided steps: plan, workspace, and review.
                    </p>
                </div>

                <Card>
                    <CardContent className="p-5">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                            {[
                                { id: 1, title: 'Choose Plan', icon: CreditCard },
                                { id: 2, title: 'Workspace Details', icon: Building2 },
                                { id: 3, title: 'Review & Create', icon: Shield },
                            ].map((item) => {
                                const Icon = item.icon;
                                const active = step === item.id;
                                const done = step > item.id;
                                return (
                                    <button
                                        key={item.id}
                                        type="button"
                                        onClick={() => {
                                            if (item.id === 1 || (item.id === 2 && canGoStep2) || (item.id === 3 && canGoStep3)) {
                                                setStep(item.id as 1 | 2 | 3);
                                            }
                                        }}
                                        className={`flex items-center gap-3 rounded-xl border px-4 py-3 text-left transition ${
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
                                            <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">{item.title}</p>
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
                            Continue to Workspace Details <ArrowRight className="h-4 w-4 ml-2" />
                        </Button>
                    </div>
                )}

                {step >= 2 && (
                <form className="space-y-6" onSubmit={submit}>
                    <Card>
                        <CardContent className="p-6 space-y-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Workspace Details</h3>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">
                                        This creates your tenant workspace for team, inbox, templates, campaigns, and billing.
                                    </p>
                                </div>
                                {step === 2 && (
                                    <Button type="button" variant="secondary" onClick={() => setStep(3)} disabled={!canGoStep3}>
                                        Review <ArrowRight className="h-4 w-4 ml-2" />
                                    </Button>
                                )}
                            </div>

                            <div>
                                <InputLabel htmlFor="name" value="Workspace Name" />
                                <TextInput
                                    id="name"
                                    type="text"
                                    value={data.name}
                                    className="mt-1 block w-full"
                                    onChange={(e: ChangeEvent<HTMLInputElement>) => setData('name', e.target.value)}
                                    required
                                    autoFocus={step === 2}
                                    placeholder="e.g. Metatech Provider"
                                />
                                <InputError message={errors.name} className="mt-2" />
                                <div className="mt-2 grid grid-cols-1 md:grid-cols-2 gap-3">
                                    <div className="rounded-lg border border-gray-200 dark:border-gray-800 p-3">
                                        <p className="text-xs text-gray-500 dark:text-gray-400">Workspace URL (slug preview)</p>
                                        <p className="mt-1 text-sm font-mono text-gray-800 dark:text-gray-200">{suggestedSlug}</p>
                                    </div>
                                    <div className="rounded-lg border border-gray-200 dark:border-gray-800 p-3">
                                        <p className="text-xs text-gray-500 dark:text-gray-400">Owner</p>
                                        <p className="mt-1 text-sm text-gray-800 dark:text-gray-200">
                                            {authUser?.email || authUser?.name || 'Current user'}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {step === 3 && (
                                <div className="rounded-xl border border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-900/15 p-4 space-y-3">
                                    <div className="flex items-center gap-2">
                                        <Settings className="h-4 w-4 text-blue-600 dark:text-blue-400" />
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
                                        <li className="flex items-start gap-2"><Check className="h-3.5 w-3.5 mt-0.5" />Workspace and subscription will be created automatically.</li>
                                        <li className="flex items-start gap-2"><Check className="h-3.5 w-3.5 mt-0.5" />Core modules will be enabled by default.</li>
                                        <li className="flex items-start gap-2"><Check className="h-3.5 w-3.5 mt-0.5" />You will be redirected to complete your profile before entering the app.</li>
                                    </ul>
                                </div>
                            )}

                            <div className="flex flex-col gap-3">
                                {step === 2 && (
                                    <div className="flex justify-between gap-3">
                                        <Button type="button" variant="secondary" onClick={() => setStep(1)}>
                                            Back to Plans
                                        </Button>
                                        <Button type="button" onClick={() => setStep(3)} disabled={!canGoStep3}>
                                            Continue to Review <ArrowRight className="h-4 w-4 ml-2" />
                                        </Button>
                                    </div>
                                )}

                                {step === 3 && (
                                    <div className="flex justify-between gap-3">
                                        <Button type="button" variant="secondary" onClick={() => setStep(2)}>
                                            Back
                                        </Button>
                                        <Button type="submit" className="w-full md:w-auto" disabled={processing || !data.name.trim()}>
                                            {processing ? 'Creating Workspace...' : 'Create Workspace & Continue'}
                                        </Button>
                                    </div>
                                )}

                                {step !== 3 && (
                                    <div>
                                <Button type="submit" className="w-full" disabled={processing || !data.name.trim()}>
                                    {processing ? 'Creating Workspace...' : 'Quick Create (Skip Review)'}
                                </Button>
                                    </div>
                                )}
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
