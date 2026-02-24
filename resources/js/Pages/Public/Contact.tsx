import PublicLayout from '@/Layouts/PublicLayout';
import { useForm } from '@inertiajs/react';
import { Mail, MessageSquare, Phone, MapPin, Send, Sparkles } from 'lucide-react';
import Button from '@/Components/UI/Button';
import { Input } from '@/Components/UI/Input';
import { Label } from '@/Components/UI/Label';
import { Link } from '@inertiajs/react';

export default function Contact() {
    const { data, setData, post, processing, errors, recentlySuccessful } = useForm({
        name: '',
        email: '',
        subject: '',
        message: ''});

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('contact.submit'));
    };

    const contactInfo = [
        {
            icon: Mail,
            label: 'Email',
            value: 'support@example.com',
            href: 'mailto:support@example.com',
            gradient: 'from-blue-500 to-blue-600'},
        {
            icon: Phone,
            label: 'Phone',
            value: '+1 (555) 123-4567',
            href: 'tel:+15551234567',
            gradient: 'from-purple-500 to-purple-600'},
        {
            icon: MapPin,
            label: 'Address',
            value: '123 Business St, City, State 12345',
            href: '#',
            gradient: 'from-green-500 to-green-600'},
    ];

    return (
        <PublicLayout>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
                {/* Header with attractive design */}
                <div className="text-center mb-12">
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-full mb-6">
                        <MessageSquare className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                        <span className="text-sm font-semibold text-blue-600 dark:text-blue-400">
                            We&apos;re Here to Help
                        </span>
                    </div>
                    <h1 className="text-5xl md:text-6xl font-bold text-gray-900 dark:text-gray-100 mb-4 gradient-text">
                        Get in Touch
                    </h1>
                    <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
                        Have a question or need help? We're here to assist you. Send us a message and we'll respond as soon as possible.
                    </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Contact Form */}
                    <div className="lg:col-span-2">
                        <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg border border-gray-200 dark:border-gray-700 card-hover">
                            {recentlySuccessful && (
                                <div className="mb-6 p-4 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border-2 border-green-200 dark:border-green-800 rounded-xl">
                                    <p className="text-green-800 dark:text-green-200 font-medium">
                                        ✓ Thank you for contacting us! We'll get back to you soon.
                                    </p>
                                </div>
                            )}

                            <form onSubmit={submit} className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <Label htmlFor="name" className="text-sm font-semibold">Name</Label>
                                        <Input
                                            id="name"
                                            type="text"
                                            value={data.name}
                                            onChange={(e) => setData('name', e.target.value)}
                                            required
                                            className="mt-2 border-2 focus:border-blue-500 focus:ring-blue-500"
                                            placeholder="Your full name"
                                        />
                                        {errors.name && (
                                            <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.name}</p>
                                        )}
                                    </div>

                                    <div>
                                        <Label htmlFor="email" className="text-sm font-semibold">Email</Label>
                                        <Input
                                            id="email"
                                            type="email"
                                            value={data.email}
                                            onChange={(e) => setData('email', e.target.value)}
                                            required
                                            className="mt-2 border-2 focus:border-blue-500 focus:ring-blue-500"
                                            placeholder="your@email.com"
                                        />
                                        {errors.email && (
                                            <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.email}</p>
                                        )}
                                    </div>
                                </div>

                                <div>
                                    <Label htmlFor="subject" className="text-sm font-semibold">Subject</Label>
                                    <Input
                                        id="subject"
                                        type="text"
                                        value={data.subject}
                                        onChange={(e) => setData('subject', e.target.value)}
                                        required
                                        className="mt-2 border-2 focus:border-blue-500 focus:ring-blue-500"
                                        placeholder="What's this about?"
                                    />
                                    {errors.subject && (
                                        <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.subject}</p>
                                    )}
                                </div>

                                <div>
                                    <Label htmlFor="message" className="text-sm font-semibold">Message</Label>
                                    <textarea
                                        id="message"
                                        rows={6}
                                        value={data.message}
                                        onChange={(e) => setData('message', e.target.value)}
                                        required
                                        className="mt-2 block w-full rounded-xl border-2 border-gray-300 dark:border-gray-700 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:text-gray-100 transition-colors"
                                        placeholder="Tell us how we can help..."
                                    />
                                    {errors.message && (
                                        <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.message}</p>
                                    )}
                                </div>

                                <Button 
                                    type="submit" 
                                    disabled={processing} 
                                    size="lg" 
                                    className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg shadow-blue-500/50"
                                >
                                    {processing ? 'Sending...' : (
                                        <>
                                            Send Message
                                            <Send className="h-4 w-4 ml-2" />
                                        </>
                                    )}
                                </Button>
                            </form>
                        </div>
                    </div>

                    {/* Contact Info */}
                    <div className="space-y-6">
                        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-xl border-2 border-gray-200 dark:border-gray-700">
                            <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-6">
                                Contact Information
                            </h3>
                            <div className="space-y-4">
                                {contactInfo.map((info, index) => {
                                    const Icon = info.icon;
                                    return (
                                        <a
                                            key={index}
                                            href={info.href}
                                            className="flex items-start space-x-4 p-4 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-all group border-2 border-transparent hover:border-blue-200 dark:hover:border-blue-800"
                                        >
                                            <div className={`bg-gradient-to-r ${info.gradient} p-3 rounded-lg shadow-md group-hover:scale-110 transition-transform`}>
                                                <Icon className="h-5 w-5 text-white" />
                                            </div>
                                            <div>
                                                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                                                    {info.label}
                                                </p>
                                                <p className="text-gray-900 dark:text-gray-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors font-medium">
                                                    {info.value}
                                                </p>
                                            </div>
                                        </a>
                                    );
                                })}
                            </div>
                        </div>

                        <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 rounded-2xl p-6 text-white shadow-xl relative overflow-hidden">
                            <div className="absolute inset-0 bg-black/10"></div>
                            <div className="relative z-10">
                                <div className="inline-flex items-center justify-center w-12 h-12 rounded-lg bg-white/20 mb-4">
                                    <MessageSquare className="h-6 w-6" />
                                </div>
                                <h3 className="text-xl font-semibold mb-2">Need Immediate Help?</h3>
                                <p className="text-blue-100 text-sm mb-4">
                                    Check out our help center for instant answers to common questions.
                                </p>
                                <Link
                                    href={route('help')}
                                    className="text-white font-medium hover:underline inline-flex items-center gap-1"
                                >
                                    Visit Help Center
                                    <Sparkles className="h-4 w-4" />
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </PublicLayout>
    );
}
