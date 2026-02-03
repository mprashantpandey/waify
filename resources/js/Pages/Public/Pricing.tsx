import { Link } from '@inertiajs/react';
import PublicLayout from '@/Layouts/PublicLayout';
import { Check, ArrowRight, Zap, Users, Building2, Crown, X, Mail, Sparkles, ChevronDown, ChevronUp, Star } from 'lucide-react';
import Button from '@/Components/UI/Button';
import { useState } from 'react';

interface Plan {
    id: number;
    name: string;
    key: string;
    description: string;
    price_monthly: number;
    price_yearly: number | null;
    currency: string;
    trial_days: number;
    features: string[];
    modules: string[];
    limits: Record<string, any>;
}

export default function Pricing({ plans, canRegister }: { plans: Plan[]; canRegister: boolean }) {
    const [showCompare, setShowCompare] = useState(false);
    const [expandedPlans, setExpandedPlans] = useState<Set<number>>(new Set());
    const FEATURES_TO_SHOW = 5; // Show first 5 features, rest expandable

    const formatPrice = (amount: number, currency: string = 'INR') => {
        if (amount === 0) return 'Free';
        const major = amount / 100; // Convert paise to rupees
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: currency,
            minimumFractionDigits: 0}).format(major);
    };

    const getPlanIcon = (key: string) => {
        switch (key) {
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
        switch (key) {
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

    const togglePlanExpansion = (planId: number) => {
        const newExpanded = new Set(expandedPlans);
        if (newExpanded.has(planId)) {
            newExpanded.delete(planId);
        } else {
            newExpanded.add(planId);
        }
        setExpandedPlans(newExpanded);
    };

    // Get all unique features across all plans for comparison
    const allFeatures = Array.from(
        new Set(plans.flatMap(plan => plan.features))
    ).sort();

    return (
        <PublicLayout>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
                {/* Header with attractive design */}
                <div className="text-center mb-16">
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-full mb-6">
                        <Sparkles className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                        <span className="text-sm font-semibold text-blue-600 dark:text-blue-400">
                            No Credit Card Required • Start Free Trial
                        </span>
                    </div>
                    <h1 className="text-5xl md:text-6xl font-bold text-gray-900 dark:text-gray-100 mb-4 bg-gradient-to-r from-gray-900 via-blue-600 to-purple-600 dark:from-gray-100 dark:via-blue-400 dark:to-purple-400 bg-clip-text text-transparent">
                        Simple, Transparent Pricing
                    </h1>
                    <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto mb-8">
                        Choose the perfect plan for your business. Start with a free trial, no credit card required.
                    </p>
                    <div className="flex items-center justify-center gap-4">
                        <Button
                            variant={showCompare ? 'primary' : 'secondary'}
                            onClick={() => setShowCompare(!showCompare)}
                            size="lg"
                        >
                            {showCompare ? 'Hide Comparison' : 'Compare Plans'}
                        </Button>
                    </div>
                </div>

                {/* Comparison Table */}
                {showCompare && (
                    <div className="mb-16 bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
                        <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-4">
                            <h2 className="text-2xl font-bold text-white text-center">Feature Comparison</h2>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gray-50 dark:bg-gray-900">
                                    <tr>
                                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 dark:text-gray-100">
                                            Features
                                        </th>
                                        {plans.map((plan) => (
                                            <th
                                                key={plan.id}
                                                className="px-6 py-4 text-center text-sm font-semibold text-gray-900 dark:text-gray-100"
                                            >
                                                {plan.name}
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                                    {allFeatures.map((feature, index) => (
                                        <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                                            <td className="px-6 py-4 text-sm text-gray-700 dark:text-gray-300 font-medium">
                                                {feature}
                                            </td>
                                            {plans.map((plan) => (
                                                <td key={plan.id} className="px-6 py-4 text-center">
                                                    {plan.features.includes(feature) ? (
                                                        <Check className="h-5 w-5 text-green-500 mx-auto" />
                                                    ) : (
                                                        <X className="h-5 w-5 text-gray-300 dark:text-gray-600 mx-auto" />
                                                    )}
                                                </td>
                                            ))}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* Pricing Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
                    {plans.map((plan) => {
                        const Icon = getPlanIcon(plan.key);
                        const gradient = getPlanColor(plan.key);
                        const isPopular = plan.key === 'pro';
                        const isEnterprise = plan.key === 'enterprise';
                        const hasTrial = plan.trial_days > 0;
                        const isExpanded = expandedPlans.has(plan.id);
                        const visibleFeatures = isExpanded 
                            ? plan.features 
                            : plan.features.slice(0, FEATURES_TO_SHOW);
                        const hasMoreFeatures = plan.features.length > FEATURES_TO_SHOW;

                        return (
                            <div
                                key={plan.id}
                                className={`relative bg-white dark:bg-gray-800 rounded-2xl shadow-xl border-2 transition-all duration-300 hover:shadow-2xl ${
                                    isPopular
                                        ? 'border-purple-500 dark:border-purple-600 scale-105 ring-4 ring-purple-500/20'
                                        : 'border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-700'
                                } overflow-hidden`}
                            >
                                {/* Trial Badge */}
                                {hasTrial && (
                                    <div className="absolute top-0 right-0 bg-gradient-to-r from-green-500 to-emerald-600 text-white px-4 py-1 text-xs font-bold rounded-bl-lg shadow-lg flex items-center gap-1">
                                        <Star className="h-3 w-3" />
                                        {plan.trial_days}-Day Trial
                                    </div>
                                )}
                                
                                {isPopular && (
                                    <div className="absolute top-0 left-0 right-0 bg-gradient-to-r from-purple-500 to-purple-600 text-white text-center py-2 text-xs font-semibold">
                                        ⭐ Most Popular
                                    </div>
                                )}
                                
                                <div className={`p-8 ${isPopular ? 'pt-12' : hasTrial ? 'pt-12' : ''}`}>
                                    <div className={`inline-flex items-center justify-center w-16 h-16 rounded-xl bg-gradient-to-r ${gradient} mb-4 shadow-lg`}>
                                        <Icon className="h-8 w-8 text-white" />
                                    </div>
                                    <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                                        {plan.name}
                                    </h3>
                                    <p className="text-gray-600 dark:text-gray-400 mb-6 text-sm min-h-[40px]">
                                        {plan.description}
                                    </p>
                                    <div className="mb-6">
                                        {isEnterprise ? (
                                            <div>
                                                <div className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                                                    Custom Pricing
                                                </div>
                                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                                    Contact us for a tailored solution
                                                </p>
                                            </div>
                                        ) : (
                                            <>
                                                <div className="flex items-baseline">
                                                    <span className="text-4xl font-bold text-gray-900 dark:text-gray-100">
                                                        {formatPrice(plan.price_monthly, plan.currency)}
                                                    </span>
                                                    <span className="text-gray-600 dark:text-gray-400 ml-2">/month</span>
                                                </div>
                                                {plan.price_yearly && plan.price_yearly > 0 && (
                                                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                                                        {formatPrice(plan.price_yearly, plan.currency)}/year
                                                        <span className="text-green-600 dark:text-green-400 font-semibold ml-1">
                                                            (save 20%)
                                                        </span>
                                                    </p>
                                                )}
                                            </>
                                        )}
                                    </div>
                                    
                                    {/* CTA Button */}
                                    {isEnterprise ? (
                                        <Link href={route('contact')}>
                                            <Button
                                                className="w-full mb-6 bg-gradient-to-r from-yellow-500 to-orange-600 hover:from-yellow-600 hover:to-orange-700 shadow-lg"
                                                variant="secondary"
                                                size="lg"
                                            >
                                                Contact for Enterprise
                                                <Mail className="h-4 w-4 ml-2" />
                                            </Button>
                                        </Link>
                                    ) : canRegister ? (
                                        <Link href={`${route('register')}?plan=${plan.key}`}>
                                            <Button
                                                className={`w-full mb-6 ${
                                                    isPopular 
                                                        ? 'bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 shadow-lg shadow-purple-500/50' 
                                                        : 'bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 shadow-lg shadow-blue-500/50'
                                                }`}
                                                variant="secondary"
                                                size="lg"
                                            >
                                                {hasTrial ? (
                                                    <>
                                                        Start {plan.trial_days}-Day Trial
                                                        <Sparkles className="h-4 w-4 ml-2" />
                                                    </>
                                                ) : (
                                                    <>
                                                        Get Started
                                                        <ArrowRight className="h-4 w-4 ml-2" />
                                                    </>
                                                )}
                                            </Button>
                                        </Link>
                                    ) : null}
                                    
                                    {/* Features List */}
                                    <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                                        <ul className="space-y-3">
                                            {visibleFeatures.length > 0 ? (
                                                visibleFeatures.map((feature, index) => (
                                                    <li key={index} className="flex items-start">
                                                        <Check className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                                                        <span className="text-sm text-gray-700 dark:text-gray-300">
                                                            {feature}
                                                        </span>
                                                    </li>
                                                ))
                                            ) : (
                                                <li className="text-sm text-gray-500 dark:text-gray-400">
                                                    All core features included
                                                </li>
                                            )}
                                        </ul>
                                        
                                        {/* Expand/Collapse Button */}
                                        {hasMoreFeatures && (
                                            <button
                                                onClick={() => togglePlanExpansion(plan.id)}
                                                className="mt-4 w-full text-sm font-medium text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 flex items-center justify-center gap-1 transition-colors"
                                            >
                                                {isExpanded ? (
                                                    <>
                                                        Show Less
                                                        <ChevronUp className="h-4 w-4" />
                                                    </>
                                                ) : (
                                                    <>
                                                        Show {plan.features.length - FEATURES_TO_SHOW} More Features
                                                        <ChevronDown className="h-4 w-4" />
                                                    </>
                                                )}
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Trust Badges */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
                    <div className="bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-xl p-6 text-center border border-blue-200 dark:border-blue-800">
                        <div className="text-3xl mb-2">🔒</div>
                        <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-1">Secure & Reliable</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Enterprise-grade security</p>
                    </div>
                    <div className="bg-gradient-to-r from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 rounded-xl p-6 text-center border border-green-200 dark:border-green-800">
                        <div className="text-3xl mb-2">⚡</div>
                        <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-1">No Credit Card</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Start free trial instantly</p>
                    </div>
                    <div className="bg-gradient-to-r from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 rounded-xl p-6 text-center border border-purple-200 dark:border-purple-800">
                        <div className="text-3xl mb-2">🔄</div>
                        <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-1">Cancel Anytime</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">No long-term commitments</p>
                    </div>
                </div>

                {/* FAQ Section */}
                <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg border border-gray-200 dark:border-gray-700">
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6">
                        Frequently Asked Questions
                    </h2>
                    <div className="space-y-4">
                        <div>
                            <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">
                                Can I change plans later?
                            </h3>
                            <p className="text-gray-600 dark:text-gray-400">
                                Yes, you can upgrade or downgrade your plan at any time. Changes take effect immediately.
                            </p>
                        </div>
                        <div>
                            <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">
                                What payment methods do you accept?
                            </h3>
                            <p className="text-gray-600 dark:text-gray-400">
                                We accept all major credit cards, debit cards, and UPI payments through Razorpay.
                            </p>
                        </div>
                        <div>
                            <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">
                                Is there a free trial?
                            </h3>
                            <p className="text-gray-600 dark:text-gray-400">
                                Yes! Most plans come with a free trial. No credit card required. Start exploring all features risk-free.
                            </p>
                        </div>
                    </div>
                    <div className="mt-6">
                        <Link
                            href={route('faqs')}
                            className="text-blue-600 dark:text-blue-400 hover:underline font-medium inline-flex items-center gap-1"
                        >
                            View all FAQs
                            <ArrowRight className="h-4 w-4" />
                        </Link>
                    </div>
                </div>
            </div>
        </PublicLayout>
    );
}
