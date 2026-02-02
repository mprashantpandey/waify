import { Link, useForm, usePage } from '@inertiajs/react';
import AppShell from '@/Layouts/AppShell';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/Components/UI/Card';
import Button from '@/Components/UI/Button';
import TextInput from '@/Components/TextInput';
import InputLabel from '@/Components/InputLabel';
import InputError from '@/Components/InputError';
import { Head } from '@inertiajs/react';
import { useMemo } from 'react';

interface Thread {
    id: number;
    slug: string;
    subject: string;
    status: string;
    last_message_at: string | null;
    created_at: string;
}

export default function SupportIndex({
    workspace,
    threads,
}: {
    workspace: any;
    threads: Thread[];
}) {
    const { flash, branding } = usePage().props as any;
    const { data, setData, post, processing, errors, reset } = useForm({
        subject: '',
        message: '',
        category: '',
        tags: '',
        attachments: [] as File[],
    });

    const supportContacts = useMemo(() => {
        return {
            email: branding?.support_email as string | undefined,
            phone: branding?.support_phone as string | undefined,
        };
    }, [branding?.support_email, branding?.support_phone]);

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('app.support.store', { workspace: workspace.slug }) as string, {
            forceFormData: true,
            onSuccess: () => reset(),
        });
    };

    return (
        <AppShell>
            <Head title="Support" />
            <div className="space-y-8">
                <div>
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-gray-100 dark:to-gray-300 bg-clip-text text-transparent">
                        Support
                    </h1>
                    <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                        Create a support request or follow up on existing tickets
                    </p>
                </div>

                <Card className="border-0 shadow-lg">
                    <CardHeader className="bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20">
                        <CardTitle className="text-xl font-bold">Live Chat Access</CardTitle>
                        <CardDescription>Pick the fastest way to reach us</CardDescription>
                    </CardHeader>
                    <CardContent className="p-6">
                        <div className="grid gap-4 md:grid-cols-3">
                            <div className="rounded-lg border border-gray-200 dark:border-gray-800 p-4">
                                <div className="text-sm font-semibold text-gray-900 dark:text-gray-100">Support Inbox</div>
                                <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                    Start a ticket right here and keep the full history.
                                </div>
                            </div>
                            <div className="rounded-lg border border-gray-200 dark:border-gray-800 p-4">
                                <div className="text-sm font-semibold text-gray-900 dark:text-gray-100">Email & Phone</div>
                                <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                    {supportContacts.email || supportContacts.phone
                                        ? `${supportContacts.email ?? '—'} ${supportContacts.phone ? `· ${supportContacts.phone}` : ''}`
                                        : 'Ask your admin to add support email/phone.'}
                                </div>
                            </div>
                            <div className="rounded-lg border border-gray-200 dark:border-gray-800 p-4">
                                <div className="text-sm font-semibold text-gray-900 dark:text-gray-100">Live Chat Widget</div>
                                <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                    Use the live chat bubble at the bottom-right of your screen.
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-0 shadow-lg">
                    <CardHeader className="bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20">
                        <CardTitle className="text-xl font-bold">New Request</CardTitle>
                        <CardDescription>Tell us how we can help</CardDescription>
                    </CardHeader>
                    <CardContent className="p-6">
                        <form onSubmit={submit} className="space-y-4">
                            <div>
                                <InputLabel htmlFor="subject" value="Subject" />
                                <TextInput
                                    id="subject"
                                    type="text"
                                    value={data.subject}
                                    onChange={(e) => setData('subject', e.target.value)}
                                    className="mt-1 block w-full"
                                    placeholder="Issue with webhook setup"
                                />
                                <InputError message={errors.subject} className="mt-2" />
                            </div>
                            <div className="grid gap-4 md:grid-cols-2">
                                <div>
                                    <InputLabel htmlFor="category" value="Category" />
                                    <TextInput
                                        id="category"
                                        type="text"
                                        value={data.category}
                                        onChange={(e) => setData('category', e.target.value)}
                                        className="mt-1 block w-full"
                                        placeholder="Billing, WhatsApp, Templates..."
                                    />
                                    <InputError message={errors.category} className="mt-2" />
                                </div>
                                <div>
                                    <InputLabel htmlFor="tags" value="Tags (comma separated)" />
                                    <TextInput
                                        id="tags"
                                        type="text"
                                        value={data.tags}
                                        onChange={(e) => setData('tags', e.target.value)}
                                        className="mt-1 block w-full"
                                        placeholder="urgent, webhook, api"
                                    />
                                    <InputError message={errors.tags} className="mt-2" />
                                </div>
                            </div>
                            <div>
                                <InputLabel htmlFor="message" value="Message" />
                                <textarea
                                    id="message"
                                    value={data.message}
                                    onChange={(e) => setData('message', e.target.value)}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100"
                                    rows={4}
                                    placeholder="Describe your issue..."
                                />
                                <InputError message={errors.message} className="mt-2" />
                            </div>
                            <div>
                                <InputLabel htmlFor="attachments" value="Attachments" />
                                <input
                                    id="attachments"
                                    type="file"
                                    multiple
                                    onChange={(e) => setData('attachments', Array.from(e.target.files || []))}
                                    className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:rounded-md file:border-0 file:bg-gray-100 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-gray-700 hover:file:bg-gray-200 dark:file:bg-gray-800 dark:file:text-gray-200 dark:hover:file:bg-gray-700"
                                />
                                <InputError message={errors.attachments} className="mt-2" />
                            </div>
                            <div className="flex justify-end">
                                <Button type="submit" disabled={processing}>
                                    {processing ? 'Sending...' : 'Submit'}
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>

                <Card className="border-0 shadow-lg">
                    <CardHeader className="bg-gradient-to-r from-gray-50 to-white dark:from-gray-800 dark:to-gray-900">
                        <CardTitle className="text-xl font-bold">Your Requests</CardTitle>
                        <CardDescription>Recent conversations with support</CardDescription>
                    </CardHeader>
                    <CardContent className="p-0">
                        <div className="divide-y divide-gray-200 dark:divide-gray-800">
                            {threads.length === 0 && (
                                <div className="p-6 text-sm text-gray-500 dark:text-gray-400">
                                    No support requests yet.
                                </div>
                            )}
                            {threads.map((thread) => (
                                <Link
                                    key={thread.id}
                                    href={route('app.support.show', { workspace: workspace.slug, thread: thread.slug ?? thread.id })}
                                    className="block px-6 py-4 hover:bg-gray-50 dark:hover:bg-gray-800/40 transition"
                                >
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <div className="font-medium text-gray-900 dark:text-gray-100">
                                                {thread.subject}
                                            </div>
                                            <div className="text-xs text-gray-500 dark:text-gray-400">
                                                Last message: {thread.last_message_at ? new Date(thread.last_message_at).toLocaleString() : '—'}
                                            </div>
                                        </div>
                                        <span className="text-xs uppercase tracking-wider text-gray-500 dark:text-gray-400">
                                            {thread.status}
                                        </span>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </AppShell>
    );
}
