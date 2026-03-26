import { Head, Link, usePage } from '@inertiajs/react';
import { getPlatformName } from '@/lib/branding';
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
import PublicLayout from '@/Layouts/PublicLayout';

export default function Landing({
    canLogin: _canLogin,
    canRegister}: {
    stats: unknown;
    canLogin: boolean;
    canRegister: boolean;
}) {
    const { branding } = usePage().props as any;
    const platformName = getPlatformName(branding);

    return (
        <PublicLayout>
            <Head title={`${platformName} | WhatsApp Cloud Platform`} />

            {/* Hero Section */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
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
                    <h1 className="text-5xl md:text-7xl font-bold text-gray-900 dark:text-gray-100 mb-6 gradient-text leading-tight text-balance">
                        Revenue-ready WhatsApp Cloud Platform
                        <br />
                        <span className="gradient-text-accent">
                            built for speed and scale
                        </span>
                    </h1>
                    <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto mb-8 leading-relaxed">
                        As an official Meta Tech Provider, we help you connect Meta WhatsApp Cloud API, manage templates, run chatbots, automate messages,
                        and scale customer communication with enterprise-grade automation, analytics, and governance.
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
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-10">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white/80 dark:bg-gray-900/80 p-4 text-sm text-gray-600 dark:text-gray-300">
                        <span className="font-semibold text-gray-900 dark:text-gray-100">Fast onboarding:</span> Embedded signup and connection checks in one flow.
                    </div>
                    <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white/80 dark:bg-gray-900/80 p-4 text-sm text-gray-600 dark:text-gray-300">
                        <span className="font-semibold text-gray-900 dark:text-gray-100">Team productivity:</span> Shared inbox, campaign tools, and role controls.
                    </div>
                    <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white/80 dark:bg-gray-900/80 p-4 text-sm text-gray-600 dark:text-gray-300">
                        <span className="font-semibold text-gray-900 dark:text-gray-100">Automation at scale:</span> Chatbots and AI replies with guardrails.
                    </div>
                </div>
            </div>

            {/* Outcomes Section */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="text-center mb-12">
                    <h2 className="text-4xl font-bold text-gray-900 dark:text-gray-100 mb-2 gradient-text">
                        Built for measurable outcomes
                    </h2>
                    <p className="text-gray-600 dark:text-gray-400 text-lg">Everything your team needs to improve speed, quality, and consistency.</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 card-hover">
                        <div className="bg-blue-50 dark:bg-blue-900/20 w-12 h-12 rounded-xl flex items-center justify-center mb-4">
                            <Zap className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                        </div>
                        <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">Faster response operations</h3>
                        <p className="text-gray-600 dark:text-gray-400">Route conversations, assign ownership, and keep SLAs under control from one workspace.</p>
                    </div>
                    <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 card-hover">
                        <div className="bg-purple-50 dark:bg-purple-900/20 w-12 h-12 rounded-xl flex items-center justify-center mb-4">
                            <MessageSquare className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                        </div>
                        <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">Consistent customer journeys</h3>
                        <p className="text-gray-600 dark:text-gray-400">Use approved templates, automation flows, and bot logic to standardize every touchpoint.</p>
                    </div>
                    <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 card-hover">
                        <div className="bg-emerald-50 dark:bg-emerald-900/20 w-12 h-12 rounded-xl flex items-center justify-center mb-4">
                            <TrendingUp className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
                        </div>
                        <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">Scalable growth foundation</h3>
                        <p className="text-gray-600 dark:text-gray-400">Add users, channels, and campaigns without rebuilding your WhatsApp stack each quarter.</p>
                    </div>
                </div>
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

            {/* Workflow Section */}
            <div className="bg-white dark:bg-gray-950 border-t border-gray-200 dark:border-gray-800 py-16">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="mb-10 text-center">
                        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-gray-100">How teams ship faster with {platformName}</h2>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900 p-6">
                            <p className="text-xs font-semibold uppercase tracking-widest text-blue-600 dark:text-blue-400 mb-3">Step 1</p>
                            <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">Connect Meta assets</h3>
                            <p className="text-gray-600 dark:text-gray-400">Bring your business account online with guided setup and instant health checks.</p>
                        </div>
                        <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900 p-6">
                            <p className="text-xs font-semibold uppercase tracking-widest text-purple-600 dark:text-purple-400 mb-3">Step 2</p>
                            <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">Deploy journeys</h3>
                            <p className="text-gray-600 dark:text-gray-400">Launch templates, bot flows, and team workflows without custom plumbing.</p>
                        </div>
                        <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900 p-6">
                            <p className="text-xs font-semibold uppercase tracking-widest text-emerald-600 dark:text-emerald-400 mb-3">Step 3</p>
                            <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">Measure and optimize</h3>
                            <p className="text-gray-600 dark:text-gray-400">Track conversation outcomes and improve response quality over time.</p>
                        </div>
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
