import AppShell from '@/Layouts/AppShell';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/Components/UI/Card';
import Button from '@/Components/UI/Button';
import { Badge } from '@/Components/UI/Badge';
import TextInput from '@/Components/TextInput';
import InputLabel from '@/Components/InputLabel';
import InputError from '@/Components/InputError';
import { Head, Link, useForm, router } from '@inertiajs/react';
import { ArrowLeft, Copy, Palette, Sparkles, MessageCircle, QrCode } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useNotifications } from '@/hooks/useNotifications';
import QRCode from 'qrcode';

export default function FloatersEdit({
    account,
    widget,
    connections,
    stats,
    embed,
    widget_types = []}: {
    account: any;
    widget: {
        id: number;
        slug: string;
        name: string;
        widget_type: string;
        is_active: boolean;
        position: string;
        theme: { primary?: string; background?: string };
        show_on: { include: string[]; exclude: string[] };
        welcome_message: string | null;
        whatsapp_phone: string | null;
        whatsapp_connection_id: number | null;
        public_id: string;
        created_at: string;
    };
    connections: Array<{ id: number; name: string; business_phone: string | null }>;
    stats: { impressions: number; clicks: number; leads: number; series: Record<string, { impressions: number; clicks: number; leads: number }> };
    embed: { supported?: boolean; script: string | null; snippet: string | null };
    widget_types?: string[];
}) {
    const widgetKey = widget.slug || widget.id;
    const { confirm, toast } = useNotifications();
    const { data, setData, put, processing, errors } = useForm({
        name: widget.name,
        widget_type: widget.widget_type ?? 'floater',
        whatsapp_connection_id: widget.whatsapp_connection_id ?? '',
        whatsapp_phone: widget.whatsapp_phone ?? '',
        position: widget.position,
        welcome_message: widget.welcome_message ?? '',
        theme: {
            primary: widget.theme?.primary ?? '#25D366',
            background: widget.theme?.background ?? '#075E54'},
        show_on: {
            include: (widget.show_on?.include ?? []).join('\n'),
            exclude: (widget.show_on?.exclude ?? []).join('\n')},
        is_active: widget.is_active});
    const isEmbeddable = data.widget_type === 'floater' || data.widget_type === 'banner';
    const isBanner = data.widget_type === 'banner';

    const [copied, setCopied] = useState<string | null>(null);
    const [startChatQr, setStartChatQr] = useState<string | null>(null);

    useEffect(() => {
        if (!data.whatsapp_connection_id) return;
        const match = connections.find((c) => String(c.id) === String(data.whatsapp_connection_id));
        if (match?.business_phone && !data.whatsapp_phone) {
            setData('whatsapp_phone', match.business_phone);
        }
    }, [data.whatsapp_connection_id]);

    useEffect(() => {
        if (data.widget_type === 'banner' && !['top', 'bottom'].includes(data.position)) {
            setData('position', 'bottom');
        }
        if (data.widget_type !== 'banner' && ['top', 'bottom'].includes(data.position)) {
            setData('position', 'bottom-right');
        }
    }, [data.widget_type]);

    const normalizedWhatsAppPhone = (data.whatsapp_phone || '').replace(/\D/g, '');
    const startConversationText = (data.welcome_message || '').trim();
    const startConversationLink = normalizedWhatsAppPhone
        ? `https://wa.me/${normalizedWhatsAppPhone}${startConversationText ? `?text=${encodeURIComponent(startConversationText)}` : ''}`
        : '';

    useEffect(() => {
        let active = true;

        if (!startConversationLink) {
            setStartChatQr(null);
            return () => {
                active = false;
            };
        }

        QRCode.toDataURL(startConversationLink, {
            width: 260,
            margin: 1,
        }).then((url: string) => {
            if (active) {
                setStartChatQr(url);
            }
        }).catch(() => {
            if (active) {
                setStartChatQr(null);
            }
        });

        return () => {
            active = false;
        };
    }, [startConversationLink]);

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        put(route('app.widgets.update', { widget: widgetKey }));
    };

    const toggle = () => {
        router.post(route('app.widgets.toggle', { widget: widgetKey }));
    };

    const remove = async () => {
        const confirmed = await confirm({
            title: 'Delete Widget',
            message: 'Are you sure you want to delete this widget? This action cannot be undone.',
            variant: 'danger'});

        if (!confirmed) return;

        router.delete(route('app.widgets.destroy', { widget: widgetKey }), {
            onError: () => toast.error('Failed to delete widget')});
    };

    const copyText = (text: string, key: string) => {
        navigator.clipboard.writeText(text);
        setCopied(key);
        setTimeout(() => setCopied(null), 2000);
    };

    return (
        <AppShell>
            <Head title={`Widget · ${widget.name}`} />
            <div className="space-y-8">
                <div className="flex flex-wrap items-center justify-between gap-4">
                    <div>
                        <Link
                            href={route('app.widgets', {})}
                            className="inline-flex items-center gap-2 text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors mb-4"
                        >
                            <ArrowLeft className="h-4 w-4" />
                            Back to Widgets
                        </Link>
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">{widget.name}</h1>
                        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                            Manage widget settings and copy the embed snippet.
                        </p>
                    </div>
                    <div className="flex items-center gap-3">
                        <Badge variant={widget.is_active ? 'success' : 'default'}>
                            {widget.is_active ? 'Active' : 'Paused'}
                        </Badge>
                        <Button variant="secondary" onClick={toggle}>
                            {widget.is_active ? 'Pause' : 'Activate'}
                        </Button>
                        <Button variant="danger" onClick={remove}>
                            Delete
                        </Button>
                    </div>
                </div>

                <div className="grid gap-4 md:grid-cols-3">
                    {[
                        { label: 'Impressions', value: stats.impressions },
                        { label: 'Clicks', value: stats.clicks },
                        { label: 'Leads', value: stats.leads },
                    ].map((item) => (
                        <Card key={item.label} className="border-0 shadow-sm">
                            <CardContent className="p-5">
                                <p className="text-xs uppercase tracking-wider text-gray-500">{item.label}</p>
                                <p className="mt-2 text-2xl font-semibold text-gray-900 dark:text-gray-100">
                                    {item.value}
                                </p>
                                <p className="mt-1 text-xs text-gray-400">Last 30 days</p>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                {(embed.supported && embed.snippet && embed.script) && (
                <Card className="border-0 shadow-lg">
                    <CardHeader>
                        <CardTitle>Embed Code</CardTitle>
                        <CardDescription>Paste this script into your website.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                            <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900 p-3 text-xs text-gray-600 dark:text-gray-300">
                                {embed.snippet}
                            </div>
                        <div className="flex flex-wrap items-center gap-3">
                            <Button variant="secondary" onClick={() => copyText(embed.snippet!, 'snippet')}>
                                <Copy className="h-4 w-4 mr-2" />
                                {copied === 'snippet' ? 'Copied' : 'Copy Snippet'}
                            </Button>
                            <Button variant="secondary" onClick={() => copyText(embed.script!, 'script')}>
                                <Copy className="h-4 w-4 mr-2" />
                                {copied === 'script' ? 'Copied' : 'Copy Script URL'}
                            </Button>
                        </div>
                    </CardContent>
                </Card>
                )}

                <Card className="border-0 shadow-lg">
                    <CardHeader>
                        <div className="flex items-center gap-2">
                            <MessageCircle className="h-4 w-4" />
                            <CardTitle>Customer Start Conversation</CardTitle>
                        </div>
                        <CardDescription>
                            Share this link or QR code with customers to start a WhatsApp chat instantly.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {startConversationLink ? (
                            <div className="grid gap-4 md:grid-cols-[1fr,280px]">
                                <div className="space-y-3">
                                    <InputLabel value="Start Conversation Link" />
                                    <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900 p-3 text-xs text-gray-600 dark:text-gray-300 break-all">
                                        {startConversationLink}
                                    </div>
                                    <div className="flex flex-wrap items-center gap-3">
                                        <Button
                                            variant="secondary"
                                            onClick={() => copyText(startConversationLink, 'start-chat-link')}
                                        >
                                            <Copy className="h-4 w-4 mr-2" />
                                            {copied === 'start-chat-link' ? 'Copied' : 'Copy Start Link'}
                                        </Button>
                                    </div>
                                </div>
                                <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900 p-3 flex flex-col items-center justify-center">
                                    <div className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2 flex items-center gap-2">
                                        <QrCode className="h-4 w-4" />
                                        Scan to Chat
                                    </div>
                                    {startChatQr ? (
                                        <img
                                            src={startChatQr}
                                            alt="Start conversation QR code"
                                            className="h-56 w-56 rounded-lg border border-gray-200 dark:border-gray-700 bg-white"
                                        />
                                    ) : (
                                        <div className="h-56 w-56 rounded-lg border border-dashed border-gray-300 dark:border-gray-700 flex items-center justify-center text-xs text-gray-500">
                                            QR not available
                                        </div>
                                    )}
                                </div>
                            </div>
                        ) : (
                            <div className="rounded-xl border border-amber-300/70 bg-amber-50 dark:bg-amber-900/20 dark:border-amber-800 p-3 text-sm text-amber-800 dark:text-amber-300">
                                Add a valid WhatsApp phone number to generate a customer start conversation link and QR.
                            </div>
                        )}
                    </CardContent>
                </Card>

                <form onSubmit={submit} className="space-y-6">
                    <Card className="border-0 shadow-lg">
                        <CardHeader>
                            <CardTitle>Widget Details</CardTitle>
                            <CardDescription>Update widget settings.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-5">
                            <div>
                                <InputLabel value="Widget Name" />
                                <TextInput
                                    value={data.name}
                                    onChange={(e) => setData('name', e.target.value)}
                                    className="mt-1 w-full"
                                />
                                <InputError message={errors.name} className="mt-2" />
                            </div>
                            <div>
                                <InputLabel value="Widget Type" />
                                <select
                                    value={data.widget_type}
                                    onChange={(e) => setData('widget_type', e.target.value)}
                                    className="mt-1 w-full rounded-xl border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-sm"
                                >
                                    {(widget_types.length ? widget_types : ['floater', 'qr', 'link', 'banner']).map((type) => (
                                        <option key={type} value={type}>
                                            {type.toUpperCase()} Widget
                                        </option>
                                    ))}
                                </select>
                                <InputError message={errors.widget_type} className="mt-2" />
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
                                </div>
                                <div>
                                    <InputLabel value="WhatsApp Phone" />
                                    <TextInput
                                        value={data.whatsapp_phone}
                                        onChange={(e) => setData('whatsapp_phone', e.target.value)}
                                        className="mt-1 w-full"
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
                                        {isBanner ? (
                                            <>
                                                <option value="top">Top banner</option>
                                                <option value="bottom">Bottom banner</option>
                                            </>
                                        ) : (
                                            <>
                                                <option value="bottom-right">Bottom right</option>
                                                <option value="bottom-left">Bottom left</option>
                                            </>
                                        )}
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

                    {isEmbeddable && (
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
                    )}

                    {isEmbeddable && (
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
                    )}

                    <div className="flex items-center justify-end gap-3">
                        <Link href={route('app.widgets', { })}>
                            <Button variant="secondary">Cancel</Button>
                        </Link>
                        <Button
                            type="submit"
                            disabled={processing}
                            className="bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700"
                        >
                            <Sparkles className="h-4 w-4 mr-2" />
                            Save Changes
                        </Button>
                    </div>
                </form>
            </div>
        </AppShell>
    );
}
