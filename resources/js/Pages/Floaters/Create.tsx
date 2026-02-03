import AppShell from '@/Layouts/AppShell';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/Components/UI/Card';
import Button from '@/Components/UI/Button';
import TextInput from '@/Components/TextInput';
import InputLabel from '@/Components/InputLabel';
import InputError from '@/Components/InputError';
import { Head, Link, useForm } from '@inertiajs/react';
import { ArrowLeft, Palette, Sparkles } from 'lucide-react';
import { useEffect } from 'react';

export default function FloatersCreate({
    account,
    connections}: {
    account: any;
    connections: Array<{ id: number; name: string; business_phone: string | null }>;
}) {
    const { data, setData, post, processing, errors } = useForm({
        name: '',
        whatsapp_connection_id: '',
        whatsapp_phone: '',
        position: 'bottom-right',
        welcome_message: 'Hello! How can we help you?',
        theme: {
            primary: '#25D366',
            background: '#075E54'},
        show_on: {
            include: '',
            exclude: ''},
        is_active: true});

    useEffect(() => {
        if (!data.whatsapp_connection_id) return;
        const match = connections.find((c) => String(c.id) === String(data.whatsapp_connection_id));
        if (match?.business_phone && !data.whatsapp_phone) {
            setData('whatsapp_phone', match.business_phone);
        }
    }, [data.whatsapp_connection_id]);

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('app.floaters.store', {}));
    };

    return (
        <AppShell>
            <Head title="Create Widget" />
            <div className="space-y-8">
                <div>
                    <Link
                        href={route('app.floaters', {})}
                        className="inline-flex items-center gap-2 text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors mb-4"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        Back to Widgets
                    </Link>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                        Create WhatsApp Widget
                    </h1>
                    <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                        Configure a floating chat bubble for your website.
                    </p>
                </div>

                <form onSubmit={submit} className="space-y-6">
                    <Card className="border-0 shadow-lg">
                        <CardHeader>
                            <CardTitle>Widget Details</CardTitle>
                            <CardDescription>Basic information for your widget.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-5">
                            <div>
                                <InputLabel htmlFor="name" value="Widget Name" />
                                <TextInput
                                    id="name"
                                    value={data.name}
                                    onChange={(e) => setData('name', e.target.value)}
                                    className="mt-1 w-full"
                                    placeholder="Website Chat Bubble"
                                />
                                <InputError message={errors.name} className="mt-2" />
                            </div>
                            <div className="grid md:grid-cols-2 gap-4">
                                <div>
                                    <InputLabel value="WhatsApp Connection (optional)" />
                                    <select
                                        value={data.whatsapp_connection_id}
                                        onChange={(e) => setData('whatsapp_connection_id', e.target.value)}
                                        className="mt-1 w-full rounded-xl border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-sm"
                                    >
                                        <option value="">Select connection</option>
                                        {connections.map((conn) => (
                                            <option key={conn.id} value={conn.id}>
                                                {conn.name}
                                            </option>
                                        ))}
                                    </select>
                                    <InputError message={errors.whatsapp_connection_id} className="mt-2" />
                                </div>
                                <div>
                                    <InputLabel value="WhatsApp Phone (required)" />
                                    <TextInput
                                        value={data.whatsapp_phone}
                                        onChange={(e) => setData('whatsapp_phone', e.target.value)}
                                        className="mt-1 w-full"
                                        placeholder="+15551234567"
                                    />
                                    <InputError message={errors.whatsapp_phone} className="mt-2" />
                                </div>
                            </div>
                            <div>
                                <InputLabel value="Welcome Message" />
                                <TextInput
                                    value={data.welcome_message}
                                    onChange={(e) => setData('welcome_message', e.target.value)}
                                    className="mt-1 w-full"
                                />
                                <InputError message={errors.welcome_message} className="mt-2" />
                            </div>
                            <div className="grid md:grid-cols-2 gap-4">
                                <div>
                                    <InputLabel value="Position" />
                                    <select
                                        value={data.position}
                                        onChange={(e) => setData('position', e.target.value)}
                                        className="mt-1 w-full rounded-xl border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-sm"
                                    >
                                        <option value="bottom-right">Bottom right</option>
                                        <option value="bottom-left">Bottom left</option>
                                    </select>
                                </div>
                                <div className="flex items-center gap-3 pt-6">
                                    <input
                                        type="checkbox"
                                        checked={data.is_active}
                                        onChange={(e) => setData('is_active', e.target.checked)}
                                    />
                                    <span className="text-sm text-gray-600 dark:text-gray-400">Widget is active</span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-0 shadow-lg">
                        <CardHeader>
                            <div className="flex items-center gap-2">
                                <Palette className="h-4 w-4" />
                                <CardTitle>Theme</CardTitle>
                            </div>
                            <CardDescription>Customize the bubble colors.</CardDescription>
                        </CardHeader>
                        <CardContent className="grid md:grid-cols-2 gap-4">
                            <div>
                                <InputLabel value="Primary Color" />
                                <div className="flex items-center gap-3 mt-1">
                                    <input
                                        type="color"
                                        value={data.theme.primary}
                                        onChange={(e) => setData('theme', { ...data.theme, primary: e.target.value })}
                                        className="h-10 w-14 rounded-lg border border-gray-200"
                                    />
                                    <TextInput
                                        value={data.theme.primary}
                                        onChange={(e) => setData('theme', { ...data.theme, primary: e.target.value })}
                                        className="flex-1"
                                    />
                                </div>
                            </div>
                            <div>
                                <InputLabel value="Header Background" />
                                <div className="flex items-center gap-3 mt-1">
                                    <input
                                        type="color"
                                        value={data.theme.background}
                                        onChange={(e) => setData('theme', { ...data.theme, background: e.target.value })}
                                        className="h-10 w-14 rounded-lg border border-gray-200"
                                    />
                                    <TextInput
                                        value={data.theme.background}
                                        onChange={(e) => setData('theme', { ...data.theme, background: e.target.value })}
                                        className="flex-1"
                                    />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-0 shadow-lg">
                        <CardHeader>
                            <CardTitle>Page Targeting</CardTitle>
                            <CardDescription>
                                Show or hide the widget on specific pages (one per line, supports * wildcard).
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="grid md:grid-cols-2 gap-4">
                            <div>
                                <InputLabel value="Show on" />
                                <textarea
                                    value={data.show_on.include}
                                    onChange={(e) => setData('show_on', { ...data.show_on, include: e.target.value })}
                                    className="mt-1 w-full rounded-xl border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-sm min-h-[120px]"
                                    placeholder="/pricing&#10;/blog/*"
                                />
                            </div>
                            <div>
                                <InputLabel value="Hide on" />
                                <textarea
                                    value={data.show_on.exclude}
                                    onChange={(e) => setData('show_on', { ...data.show_on, exclude: e.target.value })}
                                    className="mt-1 w-full rounded-xl border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-sm min-h-[120px]"
                                    placeholder="/privacy&#10;/terms"
                                />
                            </div>
                        </CardContent>
                    </Card>

                    <div className="flex items-center justify-end gap-3">
                        <Link href={route('app.floaters', { })}>
                            <Button variant="secondary">Cancel</Button>
                        </Link>
                        <Button
                            type="submit"
                            disabled={processing}
                            className="bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700"
                        >
                            <Sparkles className="h-4 w-4 mr-2" />
                            Create Widget
                        </Button>
                    </div>
                </form>
            </div>
        </AppShell>
    );
}
