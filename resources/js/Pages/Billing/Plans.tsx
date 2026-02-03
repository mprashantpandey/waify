import { Link, router } from '@inertiajs/react';
import axios from 'axios';
import { useState } from 'react';
import AppShell from '@/Layouts/AppShell';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/Components/UI/Card';
import { Badge } from '@/Components/UI/Badge';
import Button from '@/Components/UI/Button';
import { Check, X, AlertTriangle, Lock, Sparkles, Zap, LayoutGrid, Table2, Crown } from 'lucide-react';
import { useToast } from '@/hooks/useToast';
import { useNotifications } from '@/hooks/useNotifications';
import { Head } from '@inertiajs/react';

declare global {
    interface Window {
        Razorpay?: any;
    }
}

interface Plan {
    id: number;
    key: string;
    name: string;
    description: string | null;
    price_monthly: number | null;
    price_yearly: number | null;
    currency: string;
    trial_days: number;
    limits: Record<string, number>;
    modules: string[];
    is_current: boolean;
    warnings: string[];
}

export default function BillingPlans({
    account,
    plans,
    current_plan_key,
    current_modules = [],
    razorpay_enabled = false,
    razorpay_key_id = null}: {
    account: any;
    plans: Plan[];
    current_plan_key: string | null;
    current_modules?: string[];
    razorpay_enabled?: boolean;
    razorpay_key_id?: string | null;
}) {
    const [switchingPlan, setSwitchingPlan] = useState<string | null>(null);
    const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards');
    const { addToast } = useToast();
    const { confirm } = useNotifications();
    const razorpayEnabled = razorpay_enabled && Boolean(razorpay_key_id);

    const formatPrice = (price: number | null, currency: string) => {
        if (price === null) return 'Custom Pricing';
        if (price === 0) return 'Free';
        const major = price / 100;
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: currency,
            minimumFractionDigits: 0}).format(major);
    };

    const handleSwitchPlan = async (planKey: string) => {
        const isNewPlan = !current_plan_key;
        const plan = plans.find(p => p.key === planKey);
        
        const confirmed = await confirm({
            title: isNewPlan ? 'Select Plan' : 'Switch Plan',
            message: isNewPlan 
                ? `Are you sure you want to select the ${plan?.name} plan?${plan?.trial_days > 0 ? ` You'll start with a ${plan.trial_days}-day free trial.` : ''}`
                : 'Are you sure you want to switch to this plan?',
            variant: 'info'});

        if (!confirmed) return;

        setSwitchingPlan(planKey);
        router.post(
            route('app.billing.switch-plan', {
                plan: planKey}) as string,
            {},
            {
                onSuccess: () => {
                    addToast({
                        title: isNewPlan ? 'Plan selected successfully' : 'Plan changed successfully',
                        description: isNewPlan ? 'You can now use all features of the platform.' : undefined,
                        variant: 'success'});
                    router.reload({ only: ['plans', 'current_plan_key'] });
                },
                onError: (errors) => {
                    const errorMessage = errors?.plan || errors?.error || 'Failed to change plan. Please try again.';
                    addToast({
                        title: isNewPlan ? 'Failed to select plan' : 'Failed to change plan',
                        description: errorMessage,
                        variant: 'error'});
                },
                onFinish: () => setSwitchingPlan(null)}
        );
    };

    const loadRazorpay = () =>
        new Promise<void>((resolve, reject) => {
            if (typeof window !== 'undefined' && (window as any).Razorpay) {
                resolve();
                return;
            }
            // Check if script is already being loaded
            const existingScript = document.querySelector('script[src="https://checkout.razorpay.com/v1/checkout.js"]');
            if (existingScript) {
                existingScript.addEventListener('load', () => resolve());
                existingScript.addEventListener('error', () => reject(new Error('Failed to load Razorpay script')));
                return;
            }
            const script = document.createElement('script');
            script.src = 'https://checkout.razorpay.com/v1/checkout.js';
            script.async = true;
            script.crossOrigin = 'anonymous';
            script.onload = () => {
                // Wait a bit for Razorpay to fully initialize
                setTimeout(() => {
                    if ((window as any).Razorpay) {
                        resolve();
                    } else {
                        reject(new Error('Razorpay failed to initialize'));
                    }
                }, 100);
            };
            script.onerror = () => reject(new Error('Failed to load Razorpay script. Please check your internet connection.'));
            document.head.appendChild(script);
        });

    const handleRazorpayCheckout = async (plan: Plan) => {
        const confirmed = await confirm({
            title: 'Purchase Plan',
            message: `Proceed to pay for ${plan.name}?`,
            variant: 'info'});
        if (!confirmed) return;

        if (!razorpayEnabled) {
            addToast({ title: 'Razorpay is not configured', variant: 'error' });
            return;
        }

        setSwitchingPlan(plan.key);
        try {
            // Load Razorpay script
            await loadRazorpay();
            
            // Create order
            // Axios will automatically include CSRF token from bootstrap.ts defaults
            const orderUrl = route('app.billing.razorpay.order', { plan: plan.key });
            const orderResponse = await axios.post(orderUrl, {}, {
                headers: {
                    'X-Requested-With': 'XMLHttpRequest',
                    'Accept': 'application/json'}});

            if (!orderResponse.data) {
                throw new Error('Invalid response from server');
            }

            const { order_id, amount, currency, key_id } = orderResponse.data;
            
            if (!order_id || !amount || !key_id) {
                throw new Error('Missing required order data from server');
            }

            if (!(window as any).Razorpay) {
                throw new Error('Razorpay script not loaded');
            }

            // Validate order data before opening Razorpay
            if (!order_id || !amount || !key_id) {
                throw new Error('Invalid order data received from server');
            }

            const normalizedKeyId = typeof key_id === 'string' ? key_id.trim() : key_id;
            if (!normalizedKeyId) {
                throw new Error('Invalid Razorpay Key ID received from server');
            }

            const keyPattern = /^rzp_(test|live)_[A-Za-z0-9]+$/;
            if (!keyPattern.test(normalizedKeyId)) {
                throw new Error('Razorpay Key ID is invalid. Please verify the Key ID in platform settings.');
            }

            // Ensure amount is a number (Razorpay expects integer in paise)
            const orderAmount = typeof amount === 'string' ? parseInt(amount, 10) : Number(amount);

            // Build Razorpay options according to latest documentation
            const options: any = {
                key: normalizedKeyId,
                amount: orderAmount,
                currency: currency || 'INR',
                order_id: order_id,
                name: account.name || 'Waify',
                description: plan.description || plan.name,
                handler: async (response: any) => {
                    try {
                        const confirmUrl = route('app.billing.razorpay.confirm');
                        await axios.post(confirmUrl, {
                            order_id: response.razorpay_order_id,
                            payment_id: response.razorpay_payment_id,
                            signature: response.razorpay_signature});
                        addToast({ title: 'Payment successful. Plan activated.', variant: 'success' });
                        router.reload({ only: ['plans', 'current_plan_key', 'flash'] });
                    } catch (error: any) {
                        const errorMsg = error?.response?.data?.message || error?.message || 'Unknown error';
                        addToast({ 
                            title: 'Payment captured, but activation failed.', 
                            description: errorMsg,
                            variant: 'error' 
                        });
                    }
                },
                prefill: {
                    name: account?.owner?.name || '',
                    email: account?.owner?.email || ''},
                theme: {
                    color: '#2563eb'},
                modal: {
                    ondismiss: () => {
                        setSwitchingPlan(null);
                    }}};

            // Suppress console warnings/errors for Razorpay (harmless browser security warnings)
            const originalWarn = console.warn;
            const originalError = console.error;
            const suppressRazorpayWarnings = () => {
                console.warn = (...args: any[]) => {
                    const message = args.join(' ');
                    // Suppress known harmless Razorpay warnings
                    if (message.includes('x-rtb-fingerprint-id') || 
                        message.includes('serviceworker') ||
                        message.includes('Refused to get unsafe header') ||
                        message.includes('Permissions policy violation') ||
                        message.includes('devicemotion events are blocked')) {
                        return;
                    }
                    originalWarn.apply(console, args);
                };
                console.error = (...args: any[]) => {
                    const message = args.join(' ');
                    if (message.includes('x-rtb-fingerprint-id') || 
                        message.includes('serviceworker') ||
                        message.includes('Refused to get unsafe header') ||
                        message.includes('Permissions policy violation') ||
                        message.includes('devicemotion events are blocked')) {
                        return;
                    }
                    originalError.apply(console, args);
                };
            };
            suppressRazorpayWarnings();

            const razorpay = new (window as any).Razorpay(options);
            
            // Handle payment failures
            razorpay.on('payment.failed', (response: any) => {
                console.warn = originalWarn;
                console.error = originalError;
                addToast({ 
                    title: 'Payment failed', 
                    description: response.error?.description || response.error?.reason || 'Payment could not be processed',
                    variant: 'error' 
                });
                setSwitchingPlan(null);
            });
            
            // Handle modal close
            razorpay.on('modal.close', () => {
                console.warn = originalWarn;
                console.error = originalError;
                setSwitchingPlan(null);
            });
            
            // Handle errors during initialization or validation
            razorpay.on('error', (error: any) => {
                console.warn = originalWarn;
                console.error = originalError;
                console.error('Razorpay error:', error);
                addToast({ 
                    title: 'Payment gateway error', 
                    description: error?.description || error?.message || 'An error occurred with the payment gateway. Please verify your Razorpay account configuration in the Razorpay dashboard.',
                    variant: 'error' 
                });
                setSwitchingPlan(null);
            });
            
            try {
                razorpay.open();
                // Restore console after a delay (in case modal opens successfully)
                setTimeout(() => {
                    console.warn = originalWarn;
                    console.error = originalError;
                }, 2000);
            } catch (error: any) {
                console.warn = originalWarn;
                console.error = originalError;
                console.error('Failed to open Razorpay:', error);
                addToast({ 
                    title: 'Failed to open payment gateway', 
                    description: error?.message || 'Please check your Razorpay configuration in platform settings. If the issue persists, verify your Razorpay test account is properly configured.',
                    variant: 'error' 
                });
                setSwitchingPlan(null);
            }
        } catch (error: any) {
            console.error('Razorpay checkout error:', error);
            const errorMessage = error?.response?.data?.message 
                || error?.message 
                || 'Failed to start Razorpay checkout. Please try again.';
            addToast({ 
                title: 'Failed to start Razorpay checkout', 
                description: errorMessage,
                variant: 'error' 
            });
            setSwitchingPlan(null);
        }
    };

    const allModules = Array.from(new Set(plans.flatMap((p) => p.modules)));

    const formatLimit = (limit: number | undefined) => {
        if (limit === undefined) return 'N/A';
        if (limit === -1 || limit === 9999 || limit === 9999999) return 'Unlimited';
        return limit.toLocaleString();
    };

    const hasNoPlan = !current_plan_key;

    return (
        <AppShell>
            <Head title="Available Plans" />
            <div className="space-y-8">
                {hasNoPlan && (
                    <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-6">
                        <div className="flex items-start gap-4">
                            <div className="p-2 bg-blue-500 rounded-lg">
                                <AlertTriangle className="h-6 w-6 text-white" />
                            </div>
                            <div className="flex-1">
                                <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-2">
                                    No Plan Selected
                                </h3>
                                <p className="text-sm text-gray-700 dark:text-gray-300 mb-4">
                                    Your account doesn't have an active plan. Please select a plan below to continue using the platform. 
                                    You can start with our free plan or choose a paid plan with a trial.
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                <div>
                    {!hasNoPlan && (
                        <Link
                            href={route('app.billing.index', { })}
                            className="inline-flex items-center gap-2 text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors mb-4"
                        >
                            ← Back to Billing
                        </Link>
                    )}
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-gray-100 dark:to-gray-300 bg-clip-text text-transparent">
                                {hasNoPlan ? 'Select Your Plan' : 'Available Plans'}
                            </h1>
                            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                                {hasNoPlan 
                                    ? 'Choose a plan to get started with the platform' 
                                    : 'Choose the plan that fits your needs'}
                            </p>
                        </div>
                        <div className="flex gap-2">
                            <Button
                                variant={viewMode === 'cards' ? 'primary' : 'secondary'}
                                size="sm"
                                onClick={() => setViewMode('cards')}
                                className="rounded-xl"
                            >
                                <LayoutGrid className="h-4 w-4 mr-2" />
                                Cards
                            </Button>
                            <Button
                                variant={viewMode === 'table' ? 'primary' : 'secondary'}
                                size="sm"
                                onClick={() => setViewMode('table')}
                                className="rounded-xl"
                            >
                                <Table2 className="h-4 w-4 mr-2" />
                                Compare
                            </Button>
                        </div>
                    </div>
                </div>

                {viewMode === 'cards' ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {plans.map((plan) => (
                            <Card
                                key={plan.key}
                                className={`border-0 shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden ${
                                    plan.is_current ? 'ring-2 ring-blue-500 dark:ring-blue-400 shadow-blue-500/20' : ''
                                }`}
                            >
                                <CardHeader className={`pb-4 ${
                                    plan.is_current 
                                        ? 'bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20' 
                                        : 'bg-gradient-to-r from-gray-50 to-white dark:from-gray-800 dark:to-gray-900'
                                }`}>
                                    <div className="flex items-start justify-between mb-2">
                                        <div className="flex-1">
                                            <CardTitle className="text-lg font-bold text-gray-900 dark:text-gray-100">
                                                {plan.name}
                                            </CardTitle>
                                            {plan.description && (
                                                <CardDescription className="mt-1 text-xs">
                                                    {plan.description}
                                                </CardDescription>
                                            )}
                                        </div>
                                        {plan.is_current && (
                                            <Badge variant="success" className="px-3 py-1 flex items-center gap-1">
                                                <Crown className="h-3.5 w-3.5" />
                                                Current
                                            </Badge>
                                        )}
                                    </div>
                                </CardHeader>
                                <CardContent className="p-6 space-y-5">
                                    <div>
                                        <div className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-1">
                                            {formatPrice(plan.price_monthly, plan.currency)}
                                        </div>
                                        <div className="text-sm text-gray-500 dark:text-gray-400">per month</div>
                                        {plan.price_yearly && (
                                            <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                                                or {formatPrice(plan.price_yearly, plan.currency)}/year
                                            </div>
                                        )}
                                    </div>

                                    {plan.warnings.length > 0 && (
                                        <div className="p-3 bg-gradient-to-r from-yellow-50 to-yellow-100 dark:from-yellow-900/20 dark:to-yellow-800/20 rounded-xl border border-yellow-200 dark:border-yellow-800">
                                            <div className="flex items-start gap-2">
                                                <AlertTriangle className="h-4 w-4 text-yellow-600 dark:text-yellow-400 mt-0.5 flex-shrink-0" />
                                                <div className="text-xs text-yellow-800 dark:text-yellow-200">
                                                    {plan.warnings.map((warning, idx) => (
                                                        <p key={idx}>{warning}</p>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    <div className="space-y-3">
                                        <div className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                            Limits
                                        </div>
                                        <div className="space-y-2">
                                            {plan.limits.messages_monthly !== undefined && (
                                                <div className="flex items-center justify-between text-sm">
                                                    <span className="text-gray-600 dark:text-gray-400">Messages:</span>
                                                    <span className="font-semibold text-gray-900 dark:text-gray-100">
                                                        {formatLimit(plan.limits.messages_monthly)}/mo
                                                    </span>
                                                </div>
                                            )}
                                            {plan.limits.template_sends_monthly !== undefined && (
                                                <div className="flex items-center justify-between text-sm">
                                                    <span className="text-gray-600 dark:text-gray-400">Templates:</span>
                                                    <span className="font-semibold text-gray-900 dark:text-gray-100">
                                                        {formatLimit(plan.limits.template_sends_monthly)}/mo
                                                    </span>
                                                </div>
                                            )}
                                            {plan.limits.whatsapp_connections !== undefined && (
                                                <div className="flex items-center justify-between text-sm">
                                                    <span className="text-gray-600 dark:text-gray-400">Connections:</span>
                                                    <span className="font-semibold text-gray-900 dark:text-gray-100">
                                                        {formatLimit(plan.limits.whatsapp_connections)}
                                                    </span>
                                                </div>
                                            )}
                                            {plan.limits.agents !== undefined && (
                                                <div className="flex items-center justify-between text-sm">
                                                    <span className="text-gray-600 dark:text-gray-400">Agents:</span>
                                                    <span className="font-semibold text-gray-900 dark:text-gray-100">
                                                        {formatLimit(plan.limits.agents)}
                                                    </span>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    <div className="space-y-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                                        <div className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                            Modules
                                        </div>
                                        {plan.modules.length > 0 ? (
                                            <div className="space-y-1.5">
                                                {plan.modules.map((module) => (
                                                    <div
                                                        key={module}
                                                        className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300"
                                                    >
                                                        <Check className="h-4 w-4 text-green-600 dark:text-green-400 flex-shrink-0" />
                                                        <span className="text-xs">
                                                            {module
                                                                .replace('automation.', '')
                                                                .replace(/\./g, ' ')
                                                                .split(' ')
                                                                .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
                                                                .join(' ')}
                                                        </span>
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <p className="text-sm text-gray-500 dark:text-gray-400">No modules</p>
                                        )}
                                    </div>

                                    {plan.trial_days > 0 && (
                                        <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg text-xs text-blue-600 dark:text-blue-400 font-medium text-center">
                                            {plan.trial_days}-day free trial
                                        </div>
                                    )}

                                    <Button
                                        variant={plan.is_current ? 'secondary' : 'primary'}
                                        className={`w-full rounded-xl ${
                                            !plan.is_current 
                                                ? 'bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 shadow-lg shadow-blue-500/50' 
                                                : ''
                                        }`}
                                        disabled={plan.is_current || switchingPlan === plan.key || plan.price_monthly === null}
                                        onClick={() => {
                                            if (plan.price_monthly && plan.price_monthly > 0 && razorpayEnabled) {
                                                handleRazorpayCheckout(plan);
                                                return;
                                            }
                                            handleSwitchPlan(plan.key);
                                        }}
                                    >
                                        {plan.is_current
                                            ? 'Current Plan'
                                            : switchingPlan === plan.key
                                            ? 'Switching...'
                                            : plan.price_monthly === null
                                            ? 'Contact Sales'
                                            : plan.price_monthly > 0 && razorpayEnabled
                                            ? 'Pay & Switch'
                                            : 'Switch to this Plan'}
                                    </Button>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                ) : (
                    <Card className="border-0 shadow-lg">
                        <CardContent className="p-0">
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 border-b border-gray-200 dark:border-gray-700">
                                        <tr>
                                            <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                                Feature
                                            </th>
                                            {plans.map((plan) => (
                                                <th
                                                    key={plan.key}
                                                    className={`px-6 py-4 text-center ${
                                                        plan.is_current ? 'bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20' : ''
                                                    }`}
                                                >
                                                    <div className="font-bold text-gray-900 dark:text-gray-100">{plan.name}</div>
                                                    <div className="text-2xl font-bold text-gray-900 dark:text-gray-100 mt-2">
                                                        {formatPrice(plan.price_monthly, plan.currency)}
                                                    </div>
                                                    {plan.is_current && (
                                                        <Badge variant="success" className="mt-2 px-3 py-1">
                                                            Current
                                                        </Badge>
                                                    )}
                                                </th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200 dark:divide-gray-800 bg-white dark:bg-gray-900">
                                        {/* Limits */}
                                        <tr>
                                            <td className="px-6 py-4 font-semibold text-gray-900 dark:text-gray-100">
                                                Messages/month
                                            </td>
                                            {plans.map((plan) => (
                                                <td
                                                    key={plan.key}
                                                    className={`px-6 py-4 text-center text-sm font-medium ${
                                                        plan.is_current ? 'bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20' : ''
                                                    }`}
                                                >
                                                    {formatLimit(plan.limits.messages_monthly)}
                                                </td>
                                            ))}
                                        </tr>
                                        <tr>
                                            <td className="px-6 py-4 font-semibold text-gray-900 dark:text-gray-100">
                                                Template sends/month
                                            </td>
                                            {plans.map((plan) => (
                                                <td
                                                    key={plan.key}
                                                    className={`px-6 py-4 text-center text-sm font-medium ${
                                                        plan.is_current ? 'bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20' : ''
                                                    }`}
                                                >
                                                    {formatLimit(plan.limits.template_sends_monthly)}
                                                </td>
                                            ))}
                                        </tr>
                                        <tr>
                                            <td className="px-6 py-4 font-semibold text-gray-900 dark:text-gray-100">
                                                WhatsApp Connections
                                            </td>
                                            {plans.map((plan) => (
                                                <td
                                                    key={plan.key}
                                                    className={`px-6 py-4 text-center text-sm font-medium ${
                                                        plan.is_current ? 'bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20' : ''
                                                    }`}
                                                >
                                                    {formatLimit(plan.limits.whatsapp_connections)}
                                                </td>
                                            ))}
                                        </tr>
                                        <tr>
                                            <td className="px-6 py-4 font-semibold text-gray-900 dark:text-gray-100">
                                                Agents
                                            </td>
                                            {plans.map((plan) => (
                                                <td
                                                    key={plan.key}
                                                    className={`px-6 py-4 text-center text-sm font-medium ${
                                                        plan.is_current ? 'bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20' : ''
                                                    }`}
                                                >
                                                    {formatLimit(plan.limits.agents)}
                                                </td>
                                            ))}
                                        </tr>

                                        {/* Modules */}
                                        {allModules.map((module) => (
                                            <tr key={module}>
                                                <td className="px-6 py-4 font-semibold text-gray-900 dark:text-gray-100">
                                                    {module
                                                        .replace('automation.', '')
                                                        .replace(/\./g, ' ')
                                                        .split(' ')
                                                        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
                                                        .join(' ')}
                                                </td>
                                                {plans.map((plan) => (
                                                    <td
                                                        key={plan.key}
                                                        className={`px-6 py-4 text-center ${
                                                            plan.is_current ? 'bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20' : ''
                                                        }`}
                                                    >
                                                        {plan.modules.includes(module) ? (
                                                            <Check className="h-5 w-5 text-green-600 dark:text-green-400 mx-auto" />
                                                        ) : (
                                                            <X className="h-5 w-5 text-gray-300 dark:text-gray-700 mx-auto" />
                                                        )}
                                                    </td>
                                                ))}
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </CardContent>
                    </Card>
                )}
            </div>
        </AppShell>
    );
}
