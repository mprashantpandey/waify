import { useForm } from '@inertiajs/react';
import { FormEventHandler, ChangeEvent, useState } from 'react';
import GuestLayout from '@/Layouts/GuestLayout';
import Button from '@/Components/UI/Button';
import TextInput from '@/Components/TextInput';
import InputLabel from '@/Components/InputLabel';
import InputError from '@/Components/InputError';
import { Check, Sparkles, Zap, Users, Building2, Crown } from 'lucide-react';
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
    const [selectedPlanKey, setSelectedPlanKey] = useState<string>(defaultPlanKey);
    
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
                        Create Your Account
                    </h2>
                    <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                        Get started by creating your account and selecting a plan
                    </p>
                </div>

                {/* Plan Selection */}
                {plans.length > 0 && (
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
                                                {formatPrice(plan.price_monthly, plan.currency)}
                                            </div>
                                            <div className="text-sm text-gray-500 dark:text-gray-400">
                                                per month
                                            </div>
                                        </div>

                                        {plan.trial_days > 0 && (
                                            <Badge variant="success" className="mb-4">
                                                {plan.trial_days}-Day Free Trial
                                            </Badge>
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

                {/* Account Name Form */}
                <form className="space-y-6" onSubmit={submit}>
                    <Card>
                        <CardContent className="p-6 space-y-4">
                            <div>
                                <InputLabel htmlFor="name" value="Account Name" />
                                <TextInput
                                    id="name"
                                    type="text"
                                    value={data.name}
                                    className="mt-1 block w-full"
                                    onChange={(e: ChangeEvent<HTMLInputElement>) => setData('name', e.target.value)}
                                    required
                                    autoFocus
                                    placeholder="Enter your account name"
                                />
                                <InputError message={errors.name} className="mt-2" />
                            </div>


                            <div>
                                <Button type="submit" className="w-full" disabled={processing || !data.name.trim()}>
                                    {processing ? 'Creating Account...' : 'Create Account & Start Trial'}
                                </Button>
                                {selectedPlanKey && plans.find((p) => p.key === selectedPlanKey)?.trial_days > 0 && (
                                    <p className="mt-2 text-center text-xs text-gray-500 dark:text-gray-400">
                                        You'll start with a {plans.find((p) => p.key === selectedPlanKey)?.trial_days}-day free trial
                                    </p>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </form>
            </div>
        </GuestLayout>
    );
}
