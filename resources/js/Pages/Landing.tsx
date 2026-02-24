import { Link, usePage } from '@inertiajs/react';
import { getPlatformName } from '@/lib/branding';
import { useEffect, useState } from 'react';
import { 
    MessageSquare, 
    Users, 
    FileText, 
    Send, 
    Inbox, 
    Zap, 
    CheckCircle2,
    ArrowRight,
    TrendingUp,
    Shield,
    Globe,
    Sparkles,
    BadgeCheck,
    Rocket,
    Gem,
    Target
} from 'lucide-react';
import Button from '@/Components/UI/Button';
import axios from 'axios';
import PublicLayout from '@/Layouts/PublicLayout';

interface Stats {
    accounts: number;
    active_connections: number;
    templates: number;
    messages_sent: number;
    messages_received: number;
    conversations: number;
}

export default function Landing({
    stats: initialStats,
    canLogin,
    canRegister}: {
    stats: Stats;
    canLogin: boolean;
    canRegister: boolean;
}) {
    const { branding } = usePage().props as any;
    const platformName = getPlatformName(branding);
    const [stats, setStats] = useState<Stats>(initialStats);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        // Poll for real-time stats every 5 seconds
        const interval = setInterval(async () => {
            try {
                setIsLoading(true);
                const response = await axios.get(route('api.stats'));
                setStats(response.data.stats);
            } catch (error) {
                const status = (error as any)?.response?.status;
                if (status !== 403) {
                    console.error('Failed to fetch stats:', error);
                }
            } finally {
                setIsLoading(false);
            }
        }, 5000);

        return () => clearInterval(interval);
    }, []);

    const StatCard = ({ icon: Icon, label, value, trend }: { icon: any; label: string; value: number; trend?: string }) => (
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-600 card-hover">
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{label}</p>
                    <p className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400 bg-clip-text text-transparent mt-2">{value.toLocaleString()}</p>
                    {trend && (
                        <p className="text-xs text-green-600 dark:text-green-400 mt-1 flex items-center font-semibold">
                            <TrendingUp className="h-3 w-3 mr-1" />
                            {trend}
                        </p>
                    )}
                </div>
                <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 p-3 rounded-lg">
                    <Icon className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                </div>
            </div>
        </div>
    );

    return (
        <PublicLayout>

            {/* Hero Section */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
                <div className="text-center">
                    <div className="flex flex-wrap items-center justify-center gap-3 mb-6">
                        <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-full">
                            <Sparkles className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                            <span className="text-sm font-semibold text-blue-600 dark:text-blue-400">
                                No Credit Card Required • Start Free Trial
                            </span>
                        </div>
                        <div className="inline-flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 border-2 border-emerald-500/50 dark:border-emerald-400/50 rounded-full shadow-sm">
                            <BadgeCheck className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                            <span className="text-sm font-semibold text-emerald-700 dark:text-emerald-300">
                                Official Meta Tech Provider
                            </span>
                        </div>
                    </div>
                    <h1 className="text-5xl md:text-7xl font-bold text-gray-900 dark:text-gray-100 mb-6 gradient-text leading-tight">
                        WhatsApp Cloud Platform
                        <br />
                        <span className="gradient-text-accent">
                            Built for Scale
                        </span>
                    </h1>
                    <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto mb-8 leading-relaxed">
                        As an official Meta Tech Provider, we help you connect Meta WhatsApp Cloud API, manage templates, run chatbots, automate messages,
                        and scale your customer communication with enterprise-grade features.
                    </p>
                    <div className="flex items-center justify-center gap-4 flex-wrap">
                        {canRegister && (
                            <>
                                <Link href={route('register')}>
                                    <Button size="lg" className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-xl shadow-blue-500/50 text-lg px-8 py-6">
                                        Start Free Trial
                                        <ArrowRight className="h-5 w-5 ml-2" />
                                    </Button>
                                </Link>
                                <Link href={route('pricing')}>
                                    <Button size="lg" variant="secondary" className="border-2 text-lg px-8 py-6 hover:bg-gray-50 dark:hover:bg-gray-800">
                                        View Pricing
                                    </Button>
                                </Link>
                            </>
                        )}
                        <a href="#features" className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 font-medium text-lg">
                            Learn More ↓
                        </a>
                    </div>
                </div>
            </div>

            {/* Real-time Stats */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="text-center mb-12">
                    <h2 className="text-4xl font-bold text-gray-900 dark:text-gray-100 mb-2 gradient-text">
                        Platform Activity
                    </h2>
                    <p className="text-gray-600 dark:text-gray-400 text-lg">Real-time statistics from our platform</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <StatCard
                        icon={Users}
                        label="Active Accounts"
                        value={stats.accounts}
                        trend="Live"
                    />
                    <StatCard
                        icon={Zap}
                        label="WhatsApp Connections"
                        value={stats.active_connections}
                        trend="Active"
                    />
                    <StatCard
                        icon={FileText}
                        label="Approved Templates"
                        value={stats.templates}
                    />
                    <StatCard
                        icon={Send}
                        label="Messages Sent"
                        value={stats.messages_sent}
                        trend="Today"
                    />
                    <StatCard
                        icon={Inbox}
                        label="Messages Received"
                        value={stats.messages_received}
                        trend="Today"
                    />
                    <StatCard
                        icon={MessageSquare}
                        label="Active Conversations"
                        value={stats.conversations}
                        trend="Open"
                    />
                </div>
                {isLoading && (
                    <div className="text-center mt-4">
                        <p className="text-sm text-gray-500 dark:text-gray-400">Updating stats...</p>
                    </div>
                )}
            </div>

            {/* Features Section */}
            <div id="features" className="bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 py-20">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-full mb-6">
                            <Zap className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                            <span className="text-sm font-semibold text-blue-600 dark:text-blue-400">
                                Powerful Features
                            </span>
                        </div>
                        <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-gray-100 mb-4 gradient-text">
                            Everything You Need
                        </h2>
                        <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
                            Powerful features to manage your WhatsApp communication at scale
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        <FeatureCard
                            icon={MessageSquare}
                            title="WhatsApp Cloud API"
                            description="Connect and manage Meta WhatsApp Cloud API with encrypted credentials and webhook management."
                        />
                        <FeatureCard
                            icon={FileText}
                            title="Template Management"
                            description="Sync, manage, and send WhatsApp message templates with variable substitution and approval tracking."
                        />
                        <FeatureCard
                            icon={Inbox}
                            title="Team Inbox"
                            description="Collaborative inbox for managing conversations with assignment, tags, and internal notes."
                        />
                        <FeatureCard
                            icon={Zap}
                            title="Chatbots & Automation"
                            description="Build powerful chatbots with flow nodes, triggers, and automated responses."
                        />
                        <FeatureCard
                            icon={Globe}
                            title="AI Integration"
                            description="AI-powered auto-replies, variable auto-fill, sentiment analysis, and smart routing."
                        />
                        <FeatureCard
                            icon={Shield}
                            title="Enterprise Security"
                            description="Account isolation, role-based access, encrypted tokens, and audit logs."
                        />
                    </div>
                </div>
            </div>

            {/* Trial Benefits Section */}
            <div className="bg-gradient-to-br from-green-50 via-blue-50 to-purple-50 dark:from-green-900/20 dark:via-blue-900/20 dark:to-purple-900/20 py-16 border-t border-gray-200 dark:border-gray-800">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-12">
                        <div className="inline-flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 rounded-full shadow-md mb-4">
                            <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400" />
                            <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                                Start Free Trial • No Credit Card Required
                            </span>
                        </div>
                        <h2 className="text-4xl font-bold text-gray-900 dark:text-gray-100 mb-4 gradient-text">
                            Why Choose {platformName}?
                        </h2>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 text-center card-hover">
                            <div className="inline-flex items-center justify-center w-14 h-14 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 text-white mb-4">
                                <Rocket className="h-7 w-7" />
                            </div>
                            <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">Quick Setup</h3>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                Get started in minutes with our guided setup wizard
                            </p>
                        </div>
                        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 text-center card-hover">
                            <div className="inline-flex items-center justify-center w-14 h-14 rounded-xl bg-gradient-to-br from-purple-500 to-purple-600 text-white mb-4">
                                <Gem className="h-7 w-7" />
                            </div>
                            <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">Full Access</h3>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                Try all features during your free trial period
                            </p>
                        </div>
                        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 text-center card-hover">
                            <div className="inline-flex items-center justify-center w-14 h-14 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600 text-white mb-4">
                                <Target className="h-7 w-7" />
                            </div>
                            <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">Cancel Anytime</h3>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                No commitments, cancel your subscription anytime
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* CTA Section */}
            <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 py-20 relative overflow-hidden">
                <div className="absolute inset-0 bg-black/10" aria-hidden="true" />
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,rgba(0,0,0,0.08)_100%)]" aria-hidden="true" />
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
                    <h2 className="text-4xl md:text-5xl font-bold text-white mb-4 text-balance">
                        Ready to Transform Your Business Communication?
                    </h2>
                    <p className="text-xl text-blue-100 mb-8">
                        As an official Meta Tech Provider, we help thousands of businesses scale their WhatsApp communication.
                        <br />
                        <span className="font-semibold text-white/95">Start your free trial today — no credit card required.</span>
                    </p>
                    <div className="flex items-center justify-center gap-4 flex-wrap">
                        {canRegister && (
                            <>
                                <Link href={route('register')}>
                                    <Button size="lg" variant="secondary" className="bg-white text-blue-600 hover:bg-gray-100 shadow-xl">
                                        Start Free Trial
                                        <ArrowRight className="h-5 w-5 ml-2" />
                                    </Button>
                                </Link>
                                <Link href={route('pricing')}>
                                    <Button size="lg" variant="secondary" className="bg-transparent border-2 border-white text-white hover:bg-white/10">
                                        View Pricing Plans
                                    </Button>
                                </Link>
                            </>
                        )}
                    </div>
                    <p className="text-sm text-blue-100 mt-6">
                        ✓ 14-day free trial • ✓ No credit card required • ✓ Cancel anytime
                    </p>
                </div>
            </div>

        </PublicLayout>
    );
}

function FeatureCard({ icon: Icon, title, description }: { icon: any; title: string; description: string }) {
    return (
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-600 card-hover">
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 w-12 h-12 rounded-xl flex items-center justify-center mb-4">
                <Icon className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">{title}</h3>
            <p className="text-gray-600 dark:text-gray-400 leading-relaxed">{description}</p>
        </div>
    );
}
