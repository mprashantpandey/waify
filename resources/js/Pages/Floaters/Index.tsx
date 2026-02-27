import AppShell from '@/Layouts/AppShell';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/Components/UI/Card';
import Button from '@/Components/UI/Button';
import { Badge } from '@/Components/UI/Badge';
import { Head, Link } from '@inertiajs/react';
import { Activity, Plus, Sparkles } from 'lucide-react';

export default function FloatersIndex({
    account,
    widgets,
    stats}: {
    account: any;
    widgets: Array<{
        id: number;
        slug: string;
        name: string;
        widget_type: string;
        is_active: boolean;
        position: string;
        public_id: string;
        welcome_message: string | null;
        whatsapp_phone: string | null;
        created_at: string;
    }>;
    stats: { impressions: number; clicks: number; leads: number };
}) {
    return (
        <AppShell>
            <Head title="Widgets" />
            <div className="space-y-8">
                <div className="flex flex-wrap items-center justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                            Widgets
                        </h1>
                        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                            Create Floater, Banner, Link, or QR widgets for customer conversations.
                        </p>
                    </div>
                    <Link href={route('app.widgets.create', {})}>
                        <Button className="bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 shadow-lg shadow-emerald-500/40">
                            <Plus className="h-4 w-4 mr-2" />
                            New Widget
                        </Button>
                    </Link>
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

                {widgets.length === 0 ? (
                    <Card className="border-0 shadow-xl">
                        <CardContent className="py-14 text-center">
                            <div className="mx-auto mb-4 h-14 w-14 rounded-2xl bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
                                <Sparkles className="h-7 w-7 text-emerald-600 dark:text-emerald-300" />
                            </div>
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                                Create your first widget
                            </h3>
                            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                                Add a WhatsApp bubble to any website and track engagement.
                            </p>
                            <Link href={route('app.widgets.create', {})} className="inline-flex mt-6">
                                <Button className="bg-emerald-600 hover:bg-emerald-700 text-white">
                                    Create Widget
                                </Button>
                            </Link>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="grid gap-6 lg:grid-cols-2">
                        {widgets.map((widget) => (
                            <Card key={widget.id} className="border-0 shadow-lg">
                                <CardHeader className="border-b border-gray-100 dark:border-gray-800">
                                    <div className="flex items-center justify-between gap-3">
                                        <div>
                                            <CardTitle className="text-lg font-semibold">{widget.name}</CardTitle>
                                            <CardDescription>
                                                {widget.whatsapp_phone || 'No WhatsApp number set'}
                                            </CardDescription>
                                            <div className="mt-1 text-xs text-gray-500 uppercase tracking-wide">
                                                {widget.widget_type}
                                            </div>
                                        </div>
                                        <Badge variant={widget.is_active ? 'success' : 'default'}>
                                            {widget.is_active ? 'Active' : 'Paused'}
                                        </Badge>
                                    </div>
                                </CardHeader>
                                <CardContent className="p-6 space-y-4">
                                    <div className="flex items-center gap-3 text-sm text-gray-500">
                                        <Activity className="h-4 w-4" />
                                        Position: {widget.position.replace('-', ' ')}
                                    </div>
                                    {(widget.widget_type === 'floater' || widget.widget_type === 'banner') ? (
                                        <div className="rounded-xl bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 p-3 text-xs text-gray-500">
                                            Embed: <code className="break-all">/widgets/{widget.public_id}.js</code>
                                        </div>
                                    ) : (
                                        <div className="rounded-xl bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 p-3 text-xs text-blue-700 dark:text-blue-300">
                                            Share type widget: use link/QR from Manage page.
                                        </div>
                                    )}
                                    <div className="flex flex-wrap items-center gap-3">
                                        <Link href={route('app.widgets.edit', { widget: widget.slug || widget.id })}>
                                            <Button variant="secondary">Manage</Button>
                                        </Link>
                                        {(widget.widget_type === 'floater' || widget.widget_type === 'banner') && (
                                            <Button
                                                variant="secondary"
                                                onClick={() => navigator.clipboard.writeText(`${window.location.origin}/widgets/${widget.public_id}.js`)}
                                            >
                                                Copy Script URL
                                            </Button>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}
            </div>
        </AppShell>
    );
}
