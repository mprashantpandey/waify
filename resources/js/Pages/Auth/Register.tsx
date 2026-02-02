import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import Button from '@/Components/UI/Button';
import TextInput from '@/Components/TextInput';
import GuestLayout from '@/Layouts/GuestLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { FormEventHandler } from 'react';
import { User, Mail, Lock, ArrowRight, CheckCircle, Sparkles, Star } from 'lucide-react';

interface SelectedPlan {
    id: number;
    key: string;
    name: string;
    description: string;
    price_monthly: number;
    trial_days: number;
}

interface InviteInfo {
    token: string;
    email: string;
    workspace_name?: string | null;
    role?: string | null;
}

export default function Register({ selectedPlan, invite }: { selectedPlan?: SelectedPlan | null; invite?: InviteInfo | null }) {
    const { data, setData, post, processing, errors, reset } = useForm({
        name: '',
        email: invite?.email || '',
        password: '',
        password_confirmation: '',
        plan_key: selectedPlan?.key || '',
        invite_token: invite?.token || '',
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();

        post(route('register'), {
            onFinish: () => reset('password', 'password_confirmation'),
        });
    };

    const formatPrice = (amount: number) => {
        if (amount === 0) return 'Free';
        const major = amount / 100;
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            minimumFractionDigits: 0,
        }).format(major);
    };

    return (
        <GuestLayout>
            <Head title="Create Your Account" />

            <div className="mb-6">
                <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                    {invite?.workspace_name
                        ? `Join ${invite.workspace_name}`
                        : selectedPlan
                            ? `Start Your ${selectedPlan.trial_days > 0 ? selectedPlan.trial_days + '-Day ' : ''}Trial`
                            : 'Create your account'}
                </h2>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                    {invite?.workspace_name
                        ? `You've been invited as a ${invite.role || 'member'}. Create your account to join the workspace.`
                        : selectedPlan 
                            ? `Get started with ${selectedPlan.name} plan. ${selectedPlan.trial_days > 0 ? 'No credit card required!' : ''}`
                            : 'Get started with your free account today'
                    }
                </p>
            </div>

            {/* Selected Plan Badge */}
            {selectedPlan && (
                <div className="mb-6 p-4 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-xl border border-blue-200 dark:border-blue-800">
                    <div className="flex items-center justify-between">
                        <div>
                            <div className="flex items-center gap-2 mb-1">
                                <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                                    {selectedPlan.name} Plan
                                </h3>
                                {selectedPlan.trial_days > 0 && (
                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-xs font-bold rounded-full">
                                        <Star className="h-3 w-3" />
                                        {selectedPlan.trial_days}-Day Trial
                                    </span>
                                )}
                            </div>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                {selectedPlan.description}
                            </p>
                            <p className="text-sm font-semibold text-gray-900 dark:text-gray-100 mt-1">
                                {formatPrice(selectedPlan.price_monthly)}/month
                                {selectedPlan.trial_days > 0 && (
                                    <span className="text-green-600 dark:text-green-400 ml-2">
                                        • Free for {selectedPlan.trial_days} days
                                    </span>
                                )}
                            </p>
                        </div>
                        <Link
                            href={route('pricing')}
                            className="text-xs text-blue-600 dark:text-blue-400 hover:underline"
                        >
                            Change Plan
                        </Link>
                    </div>
                </div>
            )}

            <form onSubmit={submit} className="space-y-5">
                <div>
                    <InputLabel htmlFor="name" value="Full Name" className="text-sm font-semibold mb-2" />

                    <div className="relative">
                        <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                        <TextInput
                            id="name"
                            name="name"
                            value={data.name}
                            className="mt-1 block w-full pl-10 rounded-xl"
                            autoComplete="name"
                            isFocused={true}
                            onChange={(e) => setData('name', e.target.value)}
                            placeholder="John Doe"
                            required
                        />
                    </div>

                    <InputError message={errors.name} className="mt-2" />
                </div>

                <div>
                    <InputLabel htmlFor="email" value="Email Address" className="text-sm font-semibold mb-2" />

                    <div className="relative">
                        <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                            <TextInput
                                id="email"
                                type="email"
                                name="email"
                                value={data.email}
                                className="mt-1 block w-full pl-10 rounded-xl"
                                autoComplete="username"
                                onChange={(e) => setData('email', e.target.value)}
                                placeholder="you@example.com"
                                required
                                readOnly={Boolean(invite?.email)}
                            />
                    </div>

                    <InputError message={errors.email} className="mt-2" />
                </div>

                <div>
                    <InputLabel htmlFor="password" value="Password" className="text-sm font-semibold mb-2" />

                    <div className="relative">
                        <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                        <TextInput
                            id="password"
                            type="password"
                            name="password"
                            value={data.password}
                            className="mt-1 block w-full pl-10 rounded-xl"
                            autoComplete="new-password"
                            onChange={(e) => setData('password', e.target.value)}
                            placeholder="Create a strong password"
                            required
                        />
                    </div>

                    <InputError message={errors.password} className="mt-2" />
                </div>

                <div>
                    <InputLabel
                        htmlFor="password_confirmation"
                        value="Confirm Password"
                        className="text-sm font-semibold mb-2"
                    />

                    <div className="relative">
                        <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                        <TextInput
                            id="password_confirmation"
                            type="password"
                            name="password_confirmation"
                            value={data.password_confirmation}
                            className="mt-1 block w-full pl-10 rounded-xl"
                            autoComplete="new-password"
                            onChange={(e) =>
                                setData('password_confirmation', e.target.value)
                            }
                            placeholder="Confirm your password"
                            required
                        />
                    </div>

                    <InputError
                        message={errors.password_confirmation}
                        className="mt-2"
                    />
                </div>

                <Button 
                    type="submit" 
                    disabled={processing}
                    className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 shadow-lg shadow-blue-500/50 rounded-xl"
                >
                    {processing ? 'Creating account...' : (
                        <>
                            {(selectedPlan?.trial_days ?? 0) > 0 ? (
                                <>
                                    Start Free Trial
                                    <Sparkles className="h-4 w-4 ml-2" />
                                </>
                            ) : (
                                <>
                                    Create Account
                                    <ArrowRight className="h-4 w-4 ml-2" />
                                </>
                            )}
                        </>
                    )}
                </Button>
            </form>

            <div className="mt-6 text-center space-y-2">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                    Already have an account?{' '}
                    <Link
                        href={route('login')}
                        className="font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors"
                    >
                        Sign in
                    </Link>
                </p>
                {selectedPlan && (
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                        By signing up, you agree to our{' '}
                        <Link href={route('terms')} className="underline">Terms of Service</Link>
                        {' '}and{' '}
                        <Link href={route('privacy')} className="underline">Privacy Policy</Link>
                    </p>
                )}
            </div>
        </GuestLayout>
    );
}
