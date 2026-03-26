import PublicLayout from '@/Layouts/PublicLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { Mail, MapPin, MessageSquare, Phone } from 'lucide-react';
import Button from '@/Components/UI/Button';
import { Input } from '@/Components/UI/Input';
import { Label } from '@/Components/UI/Label';
import PublicPageHero from '@/Components/Public/PublicPageHero';

export default function Contact() {
    const { data, setData, post, processing, errors, recentlySuccessful } = useForm({
        name: '',
        email: '',
        subject: '',
        message: '',
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('contact.submit'));
    };

    const contactInfo = [
        { icon: Mail, label: 'Email', value: 'support@example.com', href: 'mailto:support@example.com' },
        { icon: Phone, label: 'Phone', value: '+1 (555) 123-4567', href: 'tel:+15551234567' },
        { icon: MapPin, label: 'Address', value: '123 Business St, City, State 12345', href: '#' },
    ];

    return (
        <PublicLayout>
            <Head title="Contact" />
            <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
                <PublicPageHero
                    eyebrow="Contact"
                    icon={<MessageSquare className="h-4 w-4" />}
                    title="Talk to the team behind your WhatsApp setup."
                    description="Use this page when you need help with onboarding, billing, Meta provisioning, or planning the right setup for your team."
                />

                <div className="grid gap-6 lg:grid-cols-[1.15fr,0.85fr]">
                    <section className="rounded-[2rem] border border-black/10 bg-white p-6 shadow-[0_24px_80px_-52px_rgba(15,23,42,0.45)] sm:p-8">
                        {recentlySuccessful ? (
                            <div className="mb-6 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-4 text-sm font-medium text-emerald-900">
                                Your message was sent. We will reply as soon as possible.
                            </div>
                        ) : null}

                        <form onSubmit={submit} className="space-y-6">
                            <div className="grid gap-6 md:grid-cols-2">
                                <div>
                                    <Label htmlFor="name" className="text-sm font-semibold text-slate-800">Name</Label>
                                    <Input id="name" value={data.name} onChange={(e) => setData('name', e.target.value)} className="mt-2 h-12 rounded-2xl border-black/10" />
                                    {errors.name ? <p className="mt-2 text-sm text-red-600">{errors.name}</p> : null}
                                </div>
                                <div>
                                    <Label htmlFor="email" className="text-sm font-semibold text-slate-800">Email</Label>
                                    <Input id="email" type="email" value={data.email} onChange={(e) => setData('email', e.target.value)} className="mt-2 h-12 rounded-2xl border-black/10" />
                                    {errors.email ? <p className="mt-2 text-sm text-red-600">{errors.email}</p> : null}
                                </div>
                            </div>

                            <div>
                                <Label htmlFor="subject" className="text-sm font-semibold text-slate-800">Subject</Label>
                                <Input id="subject" value={data.subject} onChange={(e) => setData('subject', e.target.value)} className="mt-2 h-12 rounded-2xl border-black/10" />
                                {errors.subject ? <p className="mt-2 text-sm text-red-600">{errors.subject}</p> : null}
                            </div>

                            <div>
                                <Label htmlFor="message" className="text-sm font-semibold text-slate-800">Message</Label>
                                <textarea
                                    id="message"
                                    rows={7}
                                    value={data.message}
                                    onChange={(e) => setData('message', e.target.value)}
                                    className="mt-2 block w-full rounded-[1.5rem] border border-black/10 bg-[#fbfaf6] px-4 py-4 text-slate-900 shadow-sm focus:border-emerald-600 focus:ring-emerald-600"
                                    placeholder="Tell us what you are trying to set up or fix."
                                />
                                {errors.message ? <p className="mt-2 text-sm text-red-600">{errors.message}</p> : null}
                            </div>

                            <Button type="submit" disabled={processing} size="lg" className="rounded-full bg-[#0f766e] px-6 hover:bg-[#115e59]">
                                {processing ? 'Sending...' : 'Send message'}
                            </Button>
                        </form>
                    </section>

                    <div className="space-y-6">
                        <section className="rounded-[2rem] border border-black/10 bg-[#0f172a] p-6 text-white shadow-[0_32px_120px_-48px_rgba(15,23,42,0.85)] sm:p-8">
                            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-emerald-200">Best for</p>
                            <ul className="mt-5 space-y-3 text-sm leading-7 text-slate-200">
                                <li className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3">Meta onboarding and connection setup</li>
                                <li className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3">Billing, plans, and volume questions</li>
                                <li className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3">Operational rollout for support or sales teams</li>
                            </ul>
                        </section>

                        <section className="rounded-[2rem] border border-black/10 bg-white p-6 shadow-[0_24px_80px_-52px_rgba(15,23,42,0.45)] sm:p-8">
                            <h2 className="text-xl font-semibold text-slate-950">Contact details</h2>
                            <div className="mt-5 space-y-4">
                                {contactInfo.map((item) => (
                                    <a key={item.label} href={item.href} className="flex items-start gap-4 rounded-2xl border border-black/10 bg-[#fbfaf6] px-4 py-4 transition-colors hover:border-emerald-600/25">
                                        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700">
                                            <item.icon className="h-5 w-5" />
                                        </div>
                                        <div>
                                            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">{item.label}</p>
                                            <p className="mt-1 text-sm font-medium text-slate-700">{item.value}</p>
                                        </div>
                                    </a>
                                ))}
                            </div>
                            <div className="mt-6 border-t border-black/10 pt-6 text-sm text-slate-600">
                                Prefer self-serve first? <Link href={route('help')} className="font-medium text-slate-950 underline-offset-4 hover:underline">Open the help center</Link>.
                            </div>
                        </section>
                    </div>
                </div>
            </div>
        </PublicLayout>
    );
}
