import PublicLayout from '@/Layouts/PublicLayout';
import { Head, Link } from '@inertiajs/react';
import { 
    BookOpen, 
    Video, 
    MessageSquare, 
    FileText, 
    Search,
    HelpCircle,
    ArrowRight,
    ExternalLink,
    Sparkles
} from 'lucide-react';
import Button from '@/Components/UI/Button';
import { useState } from 'react';
import PublicPageHero from '@/Components/Public/PublicPageHero';

export default function Help() {
    const [searchQuery, setSearchQuery] = useState('');

    const helpCategories = [
        {
            title: 'Getting Started',
            icon: BookOpen,
            description: 'Learn the basics and get up and running quickly',
            articles: [
                'Creating your first account',
                'Connecting WhatsApp Business Account',
                'Setting up your first template',
                'Sending your first message',
            ]},
        {
            title: 'Templates & Messages',
            icon: FileText,
            description: 'Manage templates and send messages effectively',
            articles: [
                'Creating message templates',
                'Template approval process',
                'Sending template messages',
                'Message delivery tracking',
            ]},
        {
            title: 'Chatbots & Automation',
            icon: MessageSquare,
            description: 'Build and manage automated conversations',
            articles: [
                'Creating your first chatbot',
                'Setting up flow nodes',
                'Configuring triggers',
                'Testing chatbots',
            ]},
        {
            title: 'Billing & Plans',
            icon: FileText,
            description: 'Manage your subscription and billing',
            articles: [
                'Understanding pricing plans',
                'Upgrading or downgrading',
                'Payment methods',
                'Billing history',
            ]},
    ];

    const quickLinks = [
        { title: 'FAQs', href: route('faqs'), icon: HelpCircle },
        { title: 'Video Tutorials', href: '#', icon: Video },
        { title: 'Contact Support', href: route('contact'), icon: MessageSquare },
    ];
    const normalizedQuery = searchQuery.trim().toLowerCase();
    const filteredCategories = helpCategories
        .map((category) => ({
            ...category,
            articles: category.articles.filter((article) => (
                normalizedQuery === '' ||
                category.title.toLowerCase().includes(normalizedQuery) ||
                category.description.toLowerCase().includes(normalizedQuery) ||
                article.toLowerCase().includes(normalizedQuery)
            )),
        }))
        .filter((category) => normalizedQuery === '' || category.articles.length > 0 || category.title.toLowerCase().includes(normalizedQuery));

    return (
        <PublicLayout>
            <Head title="Help Center" />
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
                <PublicPageHero
                    eyebrow="Help Center"
                    icon={<Sparkles className="h-4 w-4" />}
                    title="How can we help you?"
                    description="Find setup guides, billing help, and operational best practices for WhatsApp messaging."
                >
                    <div className="max-w-2xl">
                        <div className="relative">
                            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search for help articles..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-12 pr-4 py-4 border-2 border-gray-300 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-lg transition-all"
                            />
                        </div>
                    </div>
                </PublicPageHero>

                {/* Quick Links */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
                    {quickLinks.map((link) => (
                        <Link
                            key={link.title}
                            href={link.href}
                            className="bg-white dark:bg-gray-800 rounded-xl p-6 border-2 border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-700 hover:shadow-xl transition-all group"
                        >
                            <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-4">
                                    <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 p-3 rounded-lg group-hover:from-blue-100 group-hover:to-purple-100 dark:group-hover:from-blue-900/30 dark:group-hover:to-purple-900/30 transition-all">
                                        <link.icon className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-gray-900 dark:text-gray-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                                            {link.title}
                                        </h3>
                                    </div>
                                </div>
                                <ArrowRight className="h-5 w-5 text-gray-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors" />
                            </div>
                        </Link>
                    ))}
                </div>

                {/* Help Categories */}
                <div className="mb-12">
                    <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-8">
                        Browse by Category
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {filteredCategories.map((category) => {
                            const Icon = category.icon;
                            return (
                                <div
                                    key={category.title}
                                    className="bg-white dark:bg-gray-800 rounded-xl p-6 border-2 border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-700 hover:shadow-xl transition-all"
                                >
                                    <div className="flex items-start space-x-4 mb-4">
                                        <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 p-3 rounded-lg">
                                            <Icon className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                                        </div>
                                        <div className="flex-1">
                                            <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
                                                {category.title}
                                            </h3>
                                            <p className="text-gray-600 dark:text-gray-400 text-sm">
                                                {category.description}
                                            </p>
                                        </div>
                                    </div>
                                    <ul className="space-y-2">
                                        {category.articles.map((article, index) => (
                                            <li key={index}>
                                                <a
                                                    href="#"
                                                    className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 hover:underline flex items-center transition-colors"
                                                >
                                                    {article}
                                                    <ExternalLink className="h-3 w-3 ml-1" />
                                                </a>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            );
                        })}
                    </div>
                    {normalizedQuery !== '' && filteredCategories.length === 0 && (
                        <div className="mt-6 rounded-xl border border-dashed border-gray-300 dark:border-gray-700 p-6 text-sm text-gray-600 dark:text-gray-400">
                            No help content matched <span className="font-medium text-gray-900 dark:text-gray-100">&quot;{searchQuery}&quot;</span>. Try a broader keyword or use Contact Support.
                        </div>
                    )}
                </div>

                {/* Contact Support CTA */}
                <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 rounded-2xl p-8 text-center text-white shadow-xl relative overflow-hidden">
                    <div className="absolute inset-0 bg-black/10"></div>
                    <div className="relative z-10">
                        <h2 className="text-3xl font-bold mb-4">Still need help?</h2>
                        <p className="text-blue-100 mb-6 max-w-2xl mx-auto">
                            Our support team is here to help you. Get in touch and we'll respond as soon as possible.
                        </p>
                        <Link href={route('contact')}>
                            <Button variant="secondary" size="lg" className="bg-white text-blue-600 hover:bg-gray-100 shadow-lg">
                                Contact Support
                                <ArrowRight className="h-5 w-5 ml-2" />
                            </Button>
                        </Link>
                    </div>
                </div>
            </div>
        </PublicLayout>
    );
}
