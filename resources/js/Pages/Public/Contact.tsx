import { Head, useForm } from '@inertiajs/react';
import { Clock, Mail, MapPin, Send, ShieldCheck } from 'lucide-react';
import { Button, Card, MarketingLayout } from '@/Components/Public/Marketing';
import { Input } from '@/Components/UI/Input';
import { Label } from '@/Components/UI/Label';

const contactReasons = [
    'Sales and pricing',
    'Meta/WABA setup',
    'Billing or invoice',
    'Migration help',
    'Technical support',
    'Enterprise review',
];

export default function Contact() {
    const { data, setData, post, processing, errors, recentlySuccessful } = useForm({
        name: '',
        email: '',
        subject: '',
        message: '',
    });

    const submit = (event: React.FormEvent) => {
        event.preventDefault();
        post(route('contact.submit'));
    };

    return (
        <MarketingLayout page="contact" wide>
            <Head title="Contact" />
            <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
                <Card className="p-6">
                    {recentlySuccessful && (
                        <div className="mb-6 rounded-xl border border-waify-green/30 bg-waify-green/10 p-4 text-sm font-semibold text-waify-green-dark">
                            Thank you. We received your message and will get back to you soon.
                        </div>
                    )}

                    <form onSubmit={submit} className="space-y-5">
                        <div className="grid gap-5 md:grid-cols-2">
                            <Field label="Name" error={errors.name}>
                                <Input value={data.name} onChange={(event) => setData('name', event.target.value)} required placeholder="Your full name" />
                            </Field>
                            <Field label="Work email" error={errors.email}>
                                <Input type="email" value={data.email} onChange={(event) => setData('email', event.target.value)} required placeholder="you@company.com" />
                            </Field>
                        </div>
                        <div>
                            <Label className="text-sm font-semibold">What do you need help with?</Label>
                            <div className="mt-2 flex flex-wrap gap-2">
                                {contactReasons.map((reason) => (
                                    <button
                                        key={reason}
                                        type="button"
                                        onClick={() => setData('subject', reason)}
                                        className={`rounded-full border px-3 py-1.5 text-xs font-medium transition ${
                                            data.subject === reason
                                                ? 'border-waify-green bg-waify-green text-white'
                                                : 'border-gray-200 bg-white text-waify-text-muted hover:border-waify-green/50 hover:text-waify-green-dark dark:border-waify-dark-border dark:bg-waify-dark-surface dark:text-waify-dark-text-muted'
                                        }`}
                                    >
                                        {reason}
                                    </button>
                                ))}
                            </div>
                        </div>
                        <Field label="Topic" error={errors.subject}>
                            <Input value={data.subject} onChange={(event) => setData('subject', event.target.value)} required placeholder="Sales, support, billing, Meta setup..." />
                        </Field>
                        <Field label="Message" error={errors.message}>
                            <textarea
                                rows={6}
                                value={data.message}
                                onChange={(event) => setData('message', event.target.value)}
                                required
                                placeholder="Tell us about your use case, workspace, Meta app, billing question, or timeline."
                                className="block w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm text-waify-text focus:border-waify-green focus:outline-none focus:ring-2 focus:ring-waify-green/20 dark:border-waify-dark-border dark:bg-waify-dark-surface dark:text-waify-dark-text"
                            />
                        </Field>
                        <Button type="submit" disabled={processing} size="lg" className="w-full">
                            {processing ? 'Sending...' : <><Send className="h-4 w-4" /> Send message</>}
                        </Button>
                        <p className="text-center text-xs leading-relaxed text-waify-text-muted dark:text-waify-dark-text-muted">
                            For faster routing, include your workspace name, connected WhatsApp number, invoice number, Meta app ID, or error screenshot details where relevant.
                        </p>
                    </form>
                </Card>

                <aside className="space-y-4">
                    {[
                        [Mail, 'Email', 'hello@zyptos.com · support@zyptos.com'],
                        [MapPin, 'Office', 'Ghanshyam Colony, Pilibhit, Uttar Pradesh'],
                        [Clock, 'Hours', 'Mon-Sat, 9:00-19:00 IST'],
                        [ShieldCheck, 'Phone', '+91 81769 91383 for sales and onboarding.'],
                        [Clock, 'Response time', 'Billing and setup queries are usually reviewed within one business day. Urgent production issues should include workspace and WABA details.'],
                    ].map(([Icon, title, body]) => (
                        <Card key={title as string} className="p-5">
                            <Icon className="mb-3 h-5 w-5 text-waify-green-dark" />
                            <h2 className="font-semibold">{title as string}</h2>
                            <p className="mt-1 text-sm leading-relaxed text-waify-text-muted dark:text-waify-dark-text-muted">{body as string}</p>
                        </Card>
                    ))}
                </aside>
            </div>
        </MarketingLayout>
    );
}

function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
    return (
        <div>
            <Label className="text-sm font-semibold">{label}</Label>
            <div className="mt-2">{children}</div>
            {error && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{error}</p>}
        </div>
    );
}
