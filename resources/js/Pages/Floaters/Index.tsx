import AppShell from '@/Layouts/AppShell';
import { Card } from '@/Components/UI/Card';
import Button from '@/Components/UI/Button';
import TextInput from '@/Components/TextInput';
import { Head, Link, router, useForm } from '@inertiajs/react';
import { Check, Copy, Layout, MessageCircle, Plus, Save } from 'lucide-react';
import { useState } from 'react';
import { useToast } from '@/hooks/useToast';
import { cn } from '@/lib/utils';
import { Drawer } from '@/Components/UI/Elements';
import CountryPhoneInput, { splitPhoneNumber } from '@/Components/Profile/CountryPhoneInput';
import { useConfirm } from '@/hooks/useConfirm';

function Toggle({ checked, onChange }: { checked: boolean; onChange: (value: boolean) => void }) {
    return (
        <button
            type="button"
            onClick={() => onChange(!checked)}
            className={cn(
                'relative inline-flex h-6 w-11 items-center rounded-full transition focus:outline-none focus:ring-2 focus:ring-waify-green/25',
                checked ? 'bg-waify-green' : 'bg-gray-200 dark:bg-waify-dark-surface-2'
            )}
            aria-pressed={checked}
        >
            <span className={cn('inline-block h-5 w-5 rounded-full bg-white shadow-sm transition', checked ? 'translate-x-5' : 'translate-x-0.5')} />
        </button>
    );
}

function WidgetPreview({ greeting, position, primaryColor, backgroundColor }: { greeting: string; position: string; primaryColor: string; backgroundColor: string }) {
    const sideClass = position === 'bottom-left' ? 'left-5' : 'right-5';

    return (
        <div className="relative h-64 overflow-hidden rounded-lg bg-gradient-to-br from-slate-100 to-slate-200 ring-1 ring-gray-200 dark:from-slate-800 dark:to-slate-950 dark:ring-waify-dark-border">
            <div className="absolute inset-0 p-4 opacity-40">
                <div className="mb-2 h-3 w-24 rounded bg-gray-300 dark:bg-slate-600" />
                <div className="mb-1 h-2 w-full rounded bg-gray-200 dark:bg-slate-700" />
                <div className="h-2 w-4/5 rounded bg-gray-200 dark:bg-slate-700" />
            </div>
            <div className={cn('anim-scale absolute bottom-4 w-72 overflow-hidden rounded-card bg-white shadow-pop ring-1 ring-gray-100 dark:bg-waify-dark-surface dark:ring-waify-dark-border', sideClass)}>
                <div className="flex items-center gap-2 px-4 py-3 text-white" style={{ background: backgroundColor }}>
                    <MessageCircle className="h-4 w-4" />
                    <span className="text-sm font-semibold">Chat with us</span>
                </div>
                <div className="p-4 text-sm text-waify-text-muted dark:text-waify-dark-text-muted">{greeting}</div>
                <div className="px-4 pb-4">
                    <button type="button" className="w-full rounded-btn py-2 text-sm font-medium text-white" style={{ background: primaryColor }}>Start chat</button>
                </div>
            </div>
        </div>
    );
}

function RealWidgetPreview({ snippet }: { snippet?: string | null }) {
    if (!snippet) {
        return (
            <div className="flex h-64 items-center justify-center rounded-lg border border-dashed border-gray-200 bg-gray-50 p-6 text-center text-sm text-waify-text-muted dark:border-waify-dark-border dark:bg-waify-dark-surface-2 dark:text-waify-dark-text-muted">
                Create or connect a widget to preview the real installed script.
            </div>
        );
    }

    const srcDoc = `<!doctype html>
<html>
<head>
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <style>
    body{margin:0;min-height:256px;font-family:Inter,system-ui,-apple-system,Segoe UI,sans-serif;background:linear-gradient(135deg,#f8fafc,#e2e8f0);overflow:hidden}
    .page{padding:18px;color:#475569}
    .bar{height:12px;border-radius:999px;background:#cbd5e1;margin-bottom:10px}
    .bar.short{width:38%}.bar.med{width:72%}.bar.long{width:88%}
  </style>
</head>
<body>
  <div class="page">
    <div class="bar short"></div>
    <div class="bar long"></div>
    <div class="bar med"></div>
  </div>
  ${snippet}
</body>
</html>`;

    return (
        <iframe
            title="Real widget preview"
            sandbox="allow-scripts allow-same-origin"
            srcDoc={srcDoc}
            className="h-64 w-full rounded-lg border border-gray-200 bg-white dark:border-waify-dark-border"
        />
    );
}

export default function FloatersIndex({
    widgets,
    stats,
    connections,
    default_phone,
}: {
    account: any;
    widgets: Array<{
        id: number;
        slug: string;
        name: string;
        is_active: boolean;
        position: string;
        theme?: { primary?: string; background?: string };
        show_on?: { include?: string[]; exclude?: string[] };
        public_id: string;
        script_url: string;
        snippet: string;
        welcome_message: string | null;
        whatsapp_phone: string | null;
        whatsapp_connection_id?: number | null;
        created_at: string;
    }>;
    stats: { impressions: number; clicks: number; leads: number };
    connections: Array<{ id: number; name: string; business_phone: string | null }>;
    default_phone?: string | null;
}) {
    const { toast } = useToast();
    const confirm = useConfirm();
    const primaryWidget = widgets[0];
    const defaultConnection = connections.find((connection) => connection.business_phone) || connections[0];
    const parsedCreatePhone = splitPhoneNumber(default_phone || defaultConnection?.business_phone || '+91');
    const [greeting, setGreeting] = useState(primaryWidget?.welcome_message || 'Hi! How can we help you today?');
    const [position, setPosition] = useState(primaryWidget?.position || 'bottom-right');
    const [primaryColor, setPrimaryColor] = useState(primaryWidget?.theme?.primary || '#00A548');
    const [backgroundColor, setBackgroundColor] = useState(primaryWidget?.theme?.background || '#075E54');
    const [saving, setSaving] = useState(false);
    const [createOpen, setCreateOpen] = useState(() => new URLSearchParams(window.location.search).get('create') === '1');
    const [createCountryCode, setCreateCountryCode] = useState(parsedCreatePhone.countryCode);
    const [createLocalPhone, setCreateLocalPhone] = useState(parsedCreatePhone.localPhone);
    const createForm = useForm({
        name: 'Website Chat Bubble',
        whatsapp_connection_id: defaultConnection?.id?.toString() || '',
        whatsapp_phone: `${parsedCreatePhone.countryCode}${parsedCreatePhone.localPhone}`.replace(/\D/g, ''),
        position: 'bottom-right',
        welcome_message: 'Hi! How can we help you today?',
        theme: {
            primary: '#00A548',
            background: '#075E54',
        },
        show_on: {
            include: '',
            exclude: '',
        },
        is_active: true,
        _stay_index: true,
    });

    const embedCode = primaryWidget?.snippet || '';
    const scriptUrl = primaryWidget?.script_url || '';

    const copyEmbed = () => {
        if (!embedCode) {
            toast.info('Create a widget first');
            return;
        }
        void navigator.clipboard.writeText(embedCode);
        toast.success('Embed code copied');
    };

    const copyScriptUrl = () => {
        if (!scriptUrl) {
            toast.info('Create a widget first');
            return;
        }
        void navigator.clipboard.writeText(scriptUrl);
        toast.success('Script URL copied');
    };

    const toggleWidget = (widget: typeof widgets[number]) => {
        router.post(route('app.floaters.toggle', { widget: widget.slug || widget.id }) as string, {}, {
            preserveScroll: true,
            onError: () => toast.error('Failed to update widget'),
        });
    };

    const deleteWidget = async (widget: typeof widgets[number]) => {
        const confirmed = await confirm({
            title: 'Delete widget',
            message: `Delete "${widget.name}"? This disables its install code on your website.`,
            confirmText: 'Delete widget',
            variant: 'danger',
        });
        if (!confirmed) return;

        router.delete(route('app.floaters.destroy', { widget: widget.slug || widget.id }) as string, {
            preserveScroll: true,
            onSuccess: () => toast.success('Widget deleted'),
            onError: () => toast.error('Failed to delete widget'),
        });
    };

    const updateCreateConnection = (connectionId: string) => {
        createForm.setData('whatsapp_connection_id', connectionId);
        const match = connections.find((connection) => String(connection.id) === String(connectionId));
        if (match?.business_phone) {
            const parsed = splitPhoneNumber(match.business_phone);
            setCreateCountryCode(parsed.countryCode);
            setCreateLocalPhone(parsed.localPhone);
            createForm.setData('whatsapp_phone', `${parsed.countryCode}${parsed.localPhone}`.replace(/\D/g, ''));
        }
    };

    const createWidget = () => {
        createForm.post(route('app.floaters.store', {}) as string, {
            preserveScroll: true,
            onSuccess: () => {
                toast.success('Widget created');
                setCreateOpen(false);
            },
            onError: (errors) => {
                const firstError = Object.values(errors)[0];
                toast.error((firstError || 'Failed to create widget') as string);
            },
        });
    };

    const saveWidget = () => {
        if (!primaryWidget) {
            toast.info('Create a widget first');
            return;
        }

        setSaving(true);
        router.put(
            route('app.floaters.update', { widget: primaryWidget.slug || primaryWidget.id }) as string,
            {
                name: primaryWidget.name,
                whatsapp_connection_id: primaryWidget.whatsapp_connection_id || '',
                whatsapp_phone: primaryWidget.whatsapp_phone || '',
                position,
                welcome_message: greeting,
                is_active: primaryWidget.is_active,
                theme: {
                    primary: primaryColor,
                    background: backgroundColor,
                },
                show_on: {
                    include: primaryWidget.show_on?.include || [],
                    exclude: primaryWidget.show_on?.exclude || [],
                },
                _stay_index: true,
            },
            {
                preserveScroll: true,
                onSuccess: () => toast.success('Widget settings saved'),
                onError: (errors) => toast.error((errors.whatsapp_phone || errors.welcome_message || errors.position || 'Failed to save widget') as string),
                onFinish: () => setSaving(false),
            }
        );
    };

    return (
        <AppShell>
            <Head title="Widgets" />
            <div className="mx-auto max-w-[1400px] space-y-6">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                        <h1 className="text-2xl font-semibold text-waify-text dark:text-waify-dark-text md:text-3xl">Widgets</h1>
                        <p className="mt-2 text-sm text-waify-text-muted dark:text-waify-dark-text-muted">WhatsApp floaters & on-site embeds</p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        <Button type="button" variant="secondary" onClick={() => setCreateOpen(true)}><Plus className="h-4 w-4" /> Add widget</Button>
                        <Button onClick={saveWidget} disabled={saving || !primaryWidget}><Save className="h-4 w-4" /> Save changes</Button>
                    </div>
                </div>

                {widgets.length === 0 && (
                    <Card className="overflow-hidden p-0">
                        <div className="grid gap-0 lg:grid-cols-[minmax(0,1fr)_360px]">
                            <div className="p-6 sm:p-8">
                                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-waify-green/15 text-waify-green-dark dark:text-emerald-300">
                                    <MessageCircle className="h-6 w-6" />
                                </div>
                                <h2 className="text-xl font-semibold text-waify-text dark:text-waify-dark-text">Create your first website widget</h2>
                                <p className="mt-2 max-w-2xl text-sm text-waify-text-muted dark:text-waify-dark-text-muted">
                                    Add one WhatsApp chat bubble for this workspace, preview it, and copy the real install code after it is created.
                                </p>
                                <div className="mt-5 flex flex-wrap gap-2">
                                    <Button type="button" onClick={() => setCreateOpen(true)}>
                                        <Plus className="h-4 w-4" /> Add widget
                                    </Button>
                                    {connections.length === 0 && (
                                        <Link href={route('app.whatsapp.connections.index', {})}>
                                            <Button type="button" variant="secondary">Connect WABA first</Button>
                                        </Link>
                                    )}
                                </div>
                            </div>
                            <div className="border-t border-gray-100 bg-gray-50 p-5 dark:border-waify-dark-border dark:bg-waify-dark-surface-2 lg:border-l lg:border-t-0">
                                <WidgetPreview greeting={createForm.data.welcome_message} position={createForm.data.position} primaryColor={createForm.data.theme.primary} backgroundColor={createForm.data.theme.background} />
                            </div>
                        </div>
                    </Card>
                )}

                {primaryWidget && (
                    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                        <Card className="space-y-4 p-5">
                            <div className="flex items-center justify-between gap-3">
                                <div>
                                    <h3 className="font-semibold text-waify-text dark:text-waify-dark-text">Selected widget</h3>
                                    <p className="text-xs text-waify-text-muted dark:text-waify-dark-text-muted">{primaryWidget.name}</p>
                                </div>
                                <Toggle checked={primaryWidget.is_active} onChange={() => toggleWidget(primaryWidget)} />
                            </div>
                            <div>
                                <label className="mb-1.5 block text-sm font-medium text-waify-text dark:text-waify-dark-text">Welcome message</label>
                                <TextInput value={greeting} onChange={(event) => setGreeting(event.target.value)} className="w-full" />
                            </div>
                            <div>
                                <label className="mb-1.5 block text-sm font-medium text-waify-text dark:text-waify-dark-text">Position</label>
                                <select value={position} onChange={(event) => setPosition(event.target.value)} className="h-10 w-full rounded-btn border border-gray-200 bg-white px-3 text-sm text-waify-text outline-none focus:border-waify-green focus:ring-2 focus:ring-waify-green/20 dark:border-waify-dark-border dark:bg-waify-dark-surface dark:text-waify-dark-text">
                                    <option value="bottom-right">Bottom right</option>
                                    <option value="bottom-left">Bottom left</option>
                                </select>
                            </div>
                            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                                <div>
                                    <label className="mb-1.5 block text-sm font-medium text-waify-text dark:text-waify-dark-text">Bubble color</label>
                                    <div className="flex items-center gap-2">
                                        <input type="color" value={primaryColor} onChange={(event) => setPrimaryColor(event.target.value)} className="h-10 w-12 rounded border-0 bg-transparent" />
                                        <TextInput value={primaryColor} onChange={(event) => setPrimaryColor(event.target.value)} className="w-full" />
                                    </div>
                                </div>
                                <div>
                                    <label className="mb-1.5 block text-sm font-medium text-waify-text dark:text-waify-dark-text">Header color</label>
                                    <div className="flex items-center gap-2">
                                        <input type="color" value={backgroundColor} onChange={(event) => setBackgroundColor(event.target.value)} className="h-10 w-12 rounded border-0 bg-transparent" />
                                        <TextInput value={backgroundColor} onChange={(event) => setBackgroundColor(event.target.value)} className="w-full" />
                                    </div>
                                </div>
                            </div>
                        </Card>
                        <Card className="p-5">
                            <p className="mb-3 text-sm font-medium text-waify-text dark:text-waify-dark-text">Live preview</p>
                            <RealWidgetPreview snippet={primaryWidget.snippet} />
                        </Card>
                    </div>
                )}

                <Card className="p-5">
                    <h3 className="mb-2 font-semibold text-waify-text dark:text-waify-dark-text">Website install code</h3>
                    {primaryWidget ? (
                        <>
                            <p className="mb-3 text-sm text-waify-text-muted dark:text-waify-dark-text-muted">Use the embed code for normal website installation. The script URL is only the raw JavaScript file, useful for custom loaders or tag managers.</p>
                            <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_minmax(280px,0.55fr)]">
                                <div>
                                    <div className="mb-2 flex items-center justify-between gap-3">
                                        <p className="text-sm font-medium text-waify-text dark:text-waify-dark-text">Embed code</p>
                                        <Button type="button" variant="secondary" size="sm" onClick={copyEmbed}>
                                            <Copy className="h-4 w-4" /> Copy embed
                                        </Button>
                                    </div>
                                    <div className="rounded-btn bg-slate-900 p-4">
                                        <pre className="overflow-x-auto whitespace-pre-wrap break-all font-mono text-xs text-slate-100">{embedCode}</pre>
                                    </div>
                                    <p className="mt-2 text-xs text-waify-text-muted dark:text-waify-dark-text-muted">Paste this before the closing <code className="rounded bg-gray-100 px-1 dark:bg-waify-dark-surface-2">&lt;/body&gt;</code> tag.</p>
                                </div>
                                <div>
                                    <div className="mb-2 flex items-center justify-between gap-3">
                                        <p className="text-sm font-medium text-waify-text dark:text-waify-dark-text">Script URL</p>
                                        <Button type="button" variant="secondary" size="sm" onClick={copyScriptUrl}>
                                            <Copy className="h-4 w-4" /> Copy URL
                                        </Button>
                                    </div>
                                    <div className="rounded-btn border border-gray-200 bg-gray-50 p-4 dark:border-waify-dark-border dark:bg-waify-dark-surface-2">
                                        <p className="break-all font-mono text-xs text-waify-text dark:text-waify-dark-text">{scriptUrl}</p>
                                    </div>
                                    <p className="mt-2 text-xs text-waify-text-muted dark:text-waify-dark-text-muted">Direct JavaScript file for advanced installs.</p>
                                </div>
                            </div>
                        </>
                    ) : (
                        <div className="flex flex-col gap-3 rounded-card border border-dashed border-gray-200 bg-gray-50 p-5 text-sm text-waify-text-muted dark:border-waify-dark-border dark:bg-waify-dark-surface-2 dark:text-waify-dark-text-muted sm:flex-row sm:items-center sm:justify-between">
                            <span>No widget exists yet. Add a widget to generate a real embed code and script URL.</span>
                            <Button type="button" onClick={() => setCreateOpen(true)}>
                                <Plus className="h-4 w-4" /> Add widget
                            </Button>
                        </div>
                    )}
                </Card>

                {widgets.length > 0 && (
                    <Card className="overflow-hidden p-0">
                        <div className="border-b border-gray-100 px-5 py-4 dark:border-waify-dark-border">
                            <h3 className="font-semibold text-waify-text dark:text-waify-dark-text">Existing widgets</h3>
                            <p className="text-sm text-waify-text-muted dark:text-waify-dark-text-muted">{stats.impressions} impressions, {stats.clicks} clicks, {stats.leads} leads in the last 30 days</p>
                        </div>
                        <div className="divide-y divide-gray-100 dark:divide-waify-dark-border">
                            {widgets.map((widget) => (
                                <div key={widget.id} className="flex flex-col gap-3 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
                                    <div className="flex items-center gap-3">
                                        <span className={cn('flex h-10 w-10 items-center justify-center rounded-lg', widget.is_active ? 'bg-waify-green/15 text-waify-green-dark dark:text-emerald-300' : 'bg-gray-100 text-gray-400 dark:bg-waify-dark-surface-2')}>
                                            {widget.is_active ? <Check className="h-5 w-5" /> : <Layout className="h-5 w-5" />}
                                        </span>
                                        <div>
                                            <p className="font-semibold text-waify-text dark:text-waify-dark-text">{widget.name}</p>
                                            <p className="text-xs text-waify-text-muted dark:text-waify-dark-text-muted">{widget.whatsapp_phone || 'No WhatsApp number set'} · {widget.position.replace('-', ' ')}</p>
                                        </div>
                                    </div>
                                    <div className="flex flex-wrap gap-2">
                                        <Link href={route('app.floaters', { widget: widget.slug || widget.id })}>
                                            <Button variant="secondary" size="sm">Manage</Button>
                                        </Link>
                                        <Button variant="secondary" size="sm" onClick={() => { void navigator.clipboard.writeText(widget.snippet); toast.success('Embed code copied'); }}>
                                            <Copy className="h-4 w-4" /> Copy embed
                                        </Button>
                                        <Button variant="secondary" size="sm" onClick={() => { void navigator.clipboard.writeText(widget.script_url); toast.success('Script URL copied'); }}>
                                            <Copy className="h-4 w-4" /> Copy URL
                                        </Button>
                                        <Button variant="danger" size="sm" onClick={() => deleteWidget(widget)}>
                                            Delete
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </Card>
                )}

                <Drawer
                    open={createOpen}
                    onClose={() => setCreateOpen(false)}
                    title="Create widget"
                    description="Create a real website widget using this workspace's WhatsApp number."
                    className="max-w-3xl"
                    footer={
                        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                            <Button type="button" variant="secondary" onClick={() => setCreateOpen(false)}>Cancel</Button>
                            <Button type="button" onClick={createWidget} disabled={createForm.processing}>
                                <Plus className="h-4 w-4" />
                                {createForm.processing ? 'Creating...' : 'Create widget'}
                            </Button>
                        </div>
                    }
                >
                    <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_280px]">
                        <div className="space-y-4">
                            <div>
                                <label className="mb-1.5 block text-sm font-medium text-waify-text dark:text-waify-dark-text">Widget name</label>
                                <TextInput value={createForm.data.name} onChange={(event) => createForm.setData('name', event.target.value)} className="w-full" />
                                {createForm.errors.name && <p className="mt-2 text-xs text-red-600 dark:text-red-300">{createForm.errors.name}</p>}
                            </div>

                            {connections.length > 0 && (
                                <div>
                                    <label className="mb-1.5 block text-sm font-medium text-waify-text dark:text-waify-dark-text">WABA account</label>
                                    <select
                                        value={createForm.data.whatsapp_connection_id}
                                        onChange={(event) => updateCreateConnection(event.target.value)}
                                        className="h-10 w-full rounded-btn border border-gray-200 bg-white px-3 text-sm text-waify-text outline-none focus:border-waify-green focus:ring-2 focus:ring-waify-green/20 dark:border-waify-dark-border dark:bg-waify-dark-surface dark:text-waify-dark-text"
                                    >
                                        <option value="">Manual phone</option>
                                        {connections.map((connection) => (
                                            <option key={connection.id} value={connection.id}>{connection.name}{connection.business_phone ? ` · ${connection.business_phone}` : ''}</option>
                                        ))}
                                    </select>
                                    {createForm.errors.whatsapp_connection_id && <p className="mt-2 text-xs text-red-600 dark:text-red-300">{createForm.errors.whatsapp_connection_id}</p>}
                                </div>
                            )}

                            <CountryPhoneInput
                                countryCode={createCountryCode}
                                phone={createLocalPhone}
                                onCountryCodeChange={(value) => {
                                    setCreateCountryCode(value);
                                    createForm.setData('whatsapp_phone', `${value}${createLocalPhone}`.replace(/\D/g, ''));
                                }}
                                onPhoneChange={(value) => {
                                    setCreateLocalPhone(value);
                                    createForm.setData('whatsapp_phone', `${createCountryCode}${value}`.replace(/\D/g, ''));
                                }}
                                error={createForm.errors.whatsapp_phone}
                            />

                            <div>
                                <label className="mb-1.5 block text-sm font-medium text-waify-text dark:text-waify-dark-text">Welcome message</label>
                                <TextInput value={createForm.data.welcome_message} onChange={(event) => createForm.setData('welcome_message', event.target.value)} className="w-full" />
                                {createForm.errors.welcome_message && <p className="mt-2 text-xs text-red-600 dark:text-red-300">{createForm.errors.welcome_message}</p>}
                            </div>

                            <div className="grid gap-3 sm:grid-cols-2">
                                <div>
                                    <label className="mb-1.5 block text-sm font-medium text-waify-text dark:text-waify-dark-text">Position</label>
                                    <select value={createForm.data.position} onChange={(event) => createForm.setData('position', event.target.value)} className="h-10 w-full rounded-btn border border-gray-200 bg-white px-3 text-sm text-waify-text outline-none focus:border-waify-green focus:ring-2 focus:ring-waify-green/20 dark:border-waify-dark-border dark:bg-waify-dark-surface dark:text-waify-dark-text">
                                        <option value="bottom-right">Bottom right</option>
                                        <option value="bottom-left">Bottom left</option>
                                    </select>
                                </div>
                                <div className="flex items-end justify-between gap-3 rounded-card border border-gray-100 px-3 py-2 dark:border-waify-dark-border">
                                    <span className="text-sm text-waify-text dark:text-waify-dark-text">Active</span>
                                    <Toggle checked={createForm.data.is_active} onChange={(checked) => createForm.setData('is_active', checked)} />
                                </div>
                            </div>

                            <div className="grid gap-3 sm:grid-cols-2">
                                <div>
                                    <label className="mb-1.5 block text-sm font-medium text-waify-text dark:text-waify-dark-text">Bubble color</label>
                                    <input type="color" value={createForm.data.theme.primary} onChange={(event) => createForm.setData('theme', { ...createForm.data.theme, primary: event.target.value })} className="h-10 w-14 rounded border-0 bg-transparent" />
                                </div>
                                <div>
                                    <label className="mb-1.5 block text-sm font-medium text-waify-text dark:text-waify-dark-text">Header color</label>
                                    <input type="color" value={createForm.data.theme.background} onChange={(event) => createForm.setData('theme', { ...createForm.data.theme, background: event.target.value })} className="h-10 w-14 rounded border-0 bg-transparent" />
                                </div>
                            </div>
                        </div>

                        <div className="space-y-3">
                            <WidgetPreview
                                greeting={createForm.data.welcome_message}
                                position={createForm.data.position}
                                primaryColor={createForm.data.theme.primary}
                                backgroundColor={createForm.data.theme.background}
                            />
                            <div className="rounded-card border border-gray-100 bg-gray-50 p-3 text-xs text-waify-text-muted dark:border-waify-dark-border dark:bg-waify-dark-surface-2 dark:text-waify-dark-text-muted">
                                After creating, copy the real install snippet from this page and paste it before <code>&lt;/body&gt;</code>.
                            </div>
                        </div>
                    </div>
                </Drawer>
            </div>
        </AppShell>
    );
}
