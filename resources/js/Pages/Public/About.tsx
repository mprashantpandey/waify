import PublicLayout from '@/Layouts/PublicLayout';
import { Target, Users, Award, Zap, Sparkles, ArrowRight } from 'lucide-react';
import { Link } from '@inertiajs/react';
import Button from '@/Components/UI/Button';

export default function About() {
    const values = [
        {
            icon: Target,
            title: 'Mission',
            description: 'To empower businesses of all sizes to communicate effectively with their customers through WhatsApp, making enterprise-grade messaging accessible to everyone.',
            gradient: 'from-blue-500 to-blue-600'},
        {
            icon: Users,
            title: 'Team',
            description: 'We\'re a passionate team of developers, designers, and customer success specialists dedicated to building the best WhatsApp communication platform.',
            gradient: 'from-purple-500 to-purple-600'},
        {
            icon: Award,
            title: 'Quality',
            description: 'We believe in delivering high-quality, reliable services with exceptional customer support. Your success is our success.',
            gradient: 'from-green-500 to-green-600'},
        {
            icon: Zap,
            title: 'Innovation',
            description: 'We continuously innovate and improve our platform based on customer feedback and industry best practices.',
            gradient: 'from-orange-500 to-orange-600'},
    ];

    const stats = [
        { label: 'Active Accounts', value: '1000+', icon: '🚀' },
        { label: 'Messages Sent', value: '10M+', icon: '📨' },
        { label: 'Happy Customers', value: '500+', icon: '😊' },
        { label: 'Uptime', value: '99.9%', icon: '⚡' },
    ];

    return (
        <PublicLayout>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
                {/* Header with attractive design */}
                <div className="text-center mb-16">
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-full mb-6">
                        <Sparkles className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                        <span className="text-sm font-semibold text-blue-600 dark:text-blue-400">
                            Our Story
                        </span>
                    </div>
                    <h1 className="text-5xl md:text-6xl font-bold text-gray-900 dark:text-gray-100 mb-4 bg-gradient-to-r from-gray-900 via-blue-600 to-purple-600 dark:from-gray-100 dark:via-blue-400 dark:to-purple-400 bg-clip-text text-transparent">
                        About Us
                    </h1>
                    <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
                        We're building the future of business communication, one message at a time.
                    </p>
                </div>

                {/* Story Section */}
                <div className="mb-16">
                    <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 md:p-12 shadow-xl border-2 border-gray-200 dark:border-gray-700 hover:shadow-2xl transition-shadow">
                        <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-6">
                            Our Story
                        </h2>
                        <div className="prose prose-lg dark:prose-invert max-w-none">
                            <p className="text-gray-700 dark:text-gray-300 mb-4 text-lg leading-relaxed">
                                WACP was born from a simple observation: businesses were struggling to scale their WhatsApp communication. 
                                While WhatsApp is one of the most popular messaging platforms globally, managing it at scale required 
                                complex integrations, custom development, and significant technical expertise.
                            </p>
                            <p className="text-gray-700 dark:text-gray-300 mb-4 text-lg leading-relaxed">
                                We set out to change that. Our platform makes it easy for businesses of all sizes to leverage the power 
                                of WhatsApp Cloud API without the complexity. Whether you're a startup sending your first message or an 
                                enterprise managing millions of conversations, WACP provides the tools you need.
                            </p>
                            <p className="text-gray-700 dark:text-gray-300 text-lg leading-relaxed">
                                Today, we're proud to serve hundreds of businesses, helping them connect with their customers in more 
                                meaningful ways. But we're just getting started. Our mission is to make WhatsApp the primary channel 
                                for business communication, and we're building the platform to make that happen.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-16">
                    {stats.map((stat, index) => (
                        <div
                            key={index}
                            className="bg-white dark:bg-gray-800 rounded-xl p-6 text-center border-2 border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-700 hover:shadow-xl transition-all"
                        >
                            <div className="text-4xl mb-3">{stat.icon}</div>
                            <div className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400 bg-clip-text text-transparent mb-2">
                                {stat.value}
                            </div>
                            <div className="text-sm text-gray-600 dark:text-gray-400 font-medium">
                                {stat.label}
                            </div>
                        </div>
                    ))}
                </div>

                {/* Values */}
                <div className="mb-16">
                    <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100 text-center mb-12">
                        Our Values
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {values.map((value, index) => {
                            const Icon = value.icon;
                            return (
                                <div
                                    key={index}
                                    className="bg-white dark:bg-gray-800 rounded-xl p-6 border-2 border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-700 hover:shadow-xl transition-all"
                                >
                                    <div className="flex items-start space-x-4">
                                        <div className={`bg-gradient-to-r ${value.gradient} p-3 rounded-lg shadow-lg`}>
                                            <Icon className="h-6 w-6 text-white" />
                                        </div>
                                        <div className="flex-1">
                                            <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
                                                {value.title}
                                            </h3>
                                            <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                                                {value.description}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* CTA */}
                <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 rounded-2xl p-12 text-center text-white shadow-xl relative overflow-hidden">
                    <div className="absolute inset-0 bg-black/10"></div>
                    <div className="relative z-10">
                        <h2 className="text-3xl md:text-4xl font-bold mb-4">Join Us on This Journey</h2>
                        <p className="text-blue-100 mb-8 max-w-2xl mx-auto text-lg">
                            Whether you're a customer, partner, or potential team member, we'd love to hear from you.
                        </p>
                        <div className="flex items-center justify-center gap-4 flex-wrap">
                            <Link href={route('contact')}>
                                <Button variant="secondary" size="lg" className="bg-white text-blue-600 hover:bg-gray-100 shadow-lg">
                                    Get in Touch
                                </Button>
                            </Link>
                            <Link href={route('register')}>
                                <Button variant="secondary" size="lg" className="bg-blue-700 text-white hover:bg-blue-800 border-2 border-white shadow-lg">
                                    Start Free Trial
                                    <ArrowRight className="h-5 w-5 ml-2" />
                                </Button>
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </PublicLayout>
    );
}
