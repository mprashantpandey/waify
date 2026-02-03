import { Link } from '@inertiajs/react';
import AppShell from '@/Layouts/AppShell';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/Components/UI/Card';
import { Badge } from '@/Components/UI/Badge';
import Button from '@/Components/UI/Button';
import { Plus, Copy, Check, Link as LinkIcon, Phone, Clock, Sparkles, CheckCircle2, XCircle, Search, Filter, Activity } from 'lucide-react';
import { useMemo, useState } from 'react';
import { Head } from '@inertiajs/react';
import TextInput from '@/Components/TextInput';

interface Connection {
    id: number;
    slug?: string;
    name: string;
    phone_number_id: string;
    business_phone: string | null;
    is_active: boolean;
    webhook_subscribed: boolean;
    webhook_last_received_at: string | null;
    webhook_url: string;
    created_at: string;
}

export default function ConnectionsIndex({
    account,
    connections,
    canCreate}: {
    account: any;
    connections: Connection[];
    canCreate: boolean;
}) {
    const [copiedUrl, setCopiedUrl] = useState<number | null>(null);
    const [query, setQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');

    const filteredConnections = useMemo(() => {
        const normalizedQuery = query.trim().toLowerCase();
        return connections
            .filter((connection) => {
                if (statusFilter === 'active' && !connection.is_active) return false;
                if (statusFilter === 'inactive' && connection.is_active) return false;
                if (!normalizedQuery) return true;
                return (
                    connection.name.toLowerCase().includes(normalizedQuery) ||
                    connection.phone_number_id.toLowerCase().includes(normalizedQuery) ||
                    (connection.business_phone || '').toLowerCase().includes(normalizedQuery)
                );
            })
            .sort((a, b) => a.name.localeCompare(b.name));
    }, [connections, query, statusFilter]);

    const activeCount = connections.filter((connection) => connection.is_active).length;
    const subscribedCount = connections.filter((connection) => connection.webhook_subscribed).length;

    const copyToClipboard = (text: string, connectionId: number) => {
        navigator.clipboard.writeText(text);
        setCopiedUrl(connectionId);
        setTimeout(() => setCopiedUrl(null), 2000);
    };

    return (
        <AppShell>
            <Head title="WhatsApp Connections" />
            <div className="space-y-8">
                <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-gradient-to-br from-white to-blue-50/60 dark:from-gray-900 dark:to-blue-900/20 p-6 shadow-sm">
                    <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
                        <div>
                            <div className="inline-flex items-center gap-2 rounded-full bg-blue-100/80 px-3 py-1 text-xs font-semibold text-blue-700 dark:bg-blue-900/40 dark:text-blue-200">
                                <LinkIcon className="h-3.5 w-3.5" />
                                WhatsApp Cloud API
                            </div>
                            <h1 className="mt-3 text-3xl font-bold text-gray-900 dark:text-gray-100">
                                Connections
                            </h1>
                            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                                Keep your API credentials, webhook, and phone numbers in sync.
                            </p>
                        </div>
                        <div className="flex flex-col gap-3 sm:flex-row">
                            {canCreate && (
                                <Link href={route('app.whatsapp.connections.create', {})}>
                                    <Button className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 shadow-lg shadow-blue-500/40">
                                        <Plus className="h-4 w-4 mr-2" />
                                        Add Connection
                                    </Button>
                                </Link>
                            )}
                            <Link href={route('app.whatsapp.connections.wizard', {})}>
                                <Button variant="secondary" className="border-blue-200/60 text-blue-700 hover:bg-blue-50 dark:border-blue-800/60 dark:text-blue-200 dark:hover:bg-blue-900/30">
                                    <Sparkles className="h-4 w-4 mr-2" />
                                    Guided Setup
                                </Button>
                            </Link>
                        </div>
                    </div>

                    <div className="mt-6 grid gap-4 sm:grid-cols-3">
                        <div className="rounded-xl border border-gray-200/80 bg-white/70 p-4 dark:border-gray-800 dark:bg-gray-900/60">
                            <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                                Total Connections
                            </p>
                            <p className="mt-2 text-2xl font-bold text-gray-900 dark:text-gray-100">
                                {connections.length}
                            </p>
                        </div>
                        <div className="rounded-xl border border-gray-200/80 bg-white/70 p-4 dark:border-gray-800 dark:bg-gray-900/60">
                            <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                                Active
                            </p>
                            <p className="mt-2 text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                                {activeCount}
                            </p>
                        </div>
                        <div className="rounded-xl border border-gray-200/80 bg-white/70 p-4 dark:border-gray-800 dark:bg-gray-900/60">
                            <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                                Webhook Subscribed
                            </p>
                            <p className="mt-2 text-2xl font-bold text-blue-600 dark:text-blue-400">
                                {subscribedCount}
                            </p>
                        </div>
                    </div>
                </div>

                <Card className="border-0 shadow-md">
                    <CardContent className="p-5">
                        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                            <div className="relative w-full md:max-w-md">
                                <Search className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                                <TextInput
                                    value={query}
                                    onChange={(event) => setQuery(event.target.value)}
                                    placeholder="Search by name, phone, or number ID"
                                    className="pl-9"
                                />
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="flex items-center gap-2 text-xs font-semibold text-gray-500 dark:text-gray-400">
                                    <Filter className="h-3.5 w-3.5" />
                                    Status
                                </div>
                                <div className="flex rounded-full border border-gray-200 bg-white p-1 shadow-sm dark:border-gray-800 dark:bg-gray-900">
                                    {(['all', 'active', 'inactive'] as const).map((status) => (
                                        <button
                                            key={status}
                                            type="button"
                                            onClick={() => setStatusFilter(status)}
                                            className={`px-3 py-1 text-xs font-semibold capitalize rounded-full transition-colors ${
                                                statusFilter === status
                                                    ? 'bg-blue-600 text-white'
                                                    : 'text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800'
                                            }`}
                                        >
                                            {status}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {filteredConnections.length === 0 ? (
                    <Card className="border-0 shadow-xl">
                        <CardContent className="py-16 text-center">
                            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-blue-100 to-blue-200 dark:from-blue-900/20 dark:to-blue-800/20 mb-6">
                                <LinkIcon className="h-10 w-10 text-blue-600 dark:text-blue-400" />
                            </div>
                            <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
                                No matching connections
                            </h3>
                            <p className="text-gray-500 dark:text-gray-400 mb-6 max-w-md mx-auto">
                                Try a different search or add a new WhatsApp connection.
                            </p>
                            {canCreate && (
                                <Link href={route('app.whatsapp.connections.create', {})}>
                                    <Button className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 shadow-lg shadow-blue-500/50">
                                        <Plus className="h-4 w-4 mr-2" />
                                        Create Connection
                                    </Button>
                                </Link>
                            )}
                        </CardContent>
                    </Card>
                ) : (
                    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                        {filteredConnections.map((connection) => (
                            <Card key={connection.id} className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 group overflow-hidden">
                                <CardHeader className="bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 pb-4">
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1">
                                            <CardTitle className="text-lg font-bold text-gray-900 dark:text-gray-100">
                                                {connection.name}
                                            </CardTitle>
                                            <CardDescription className="mt-1 flex items-center gap-2">
                                                <Phone className="h-3.5 w-3.5" />
                                                {connection.business_phone || connection.phone_number_id}
                                            </CardDescription>
                                        </div>
                                        <div className="flex flex-col gap-2">
                                            <Badge 
                                                variant={connection.is_active ? 'success' : 'default'} 
                                                className="flex items-center gap-1.5 px-3 py-1"
                                            >
                                                {connection.is_active ? (
                                                    <>
                                                        <CheckCircle2 className="h-3.5 w-3.5" />
                                                        Active
                                                    </>
                                                ) : (
                                                    <>
                                                        <XCircle className="h-3.5 w-3.5" />
                                                        Inactive
                                                    </>
                                                )}
                                            </Badge>
                                            {connection.webhook_subscribed && (
                                                <Badge variant="info" className="flex items-center gap-1.5 px-3 py-1">
                                                    <Sparkles className="h-3.5 w-3.5" />
                                                    Subscribed
                                                </Badge>
                                            )}
                                            {!connection.webhook_subscribed && (
                                                <Badge variant="warning" className="flex items-center gap-1.5 px-3 py-1">
                                                    <Activity className="h-3.5 w-3.5" />
                                                    Webhook idle
                                                </Badge>
                                            )}
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent className="p-6 space-y-4">
                                    <div className="space-y-3">
                                        <div>
                                            <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
                                                Phone Number ID
                                            </p>
                                            <div className="flex items-center gap-2 p-3 bg-gray-50 dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
                                                <code className="text-xs font-mono text-gray-900 dark:text-gray-100 flex-1 truncate">
                                                    {connection.phone_number_id}
                                                </code>
                                                <button
                                                    onClick={() => copyToClipboard(connection.phone_number_id, connection.id)}
                                                    className="p-1.5 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                                                >
                                                    {copiedUrl === connection.id ? (
                                                        <Check className="h-4 w-4 text-green-600 dark:text-green-400" />
                                                    ) : (
                                                        <Copy className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                                                    )}
                                                </button>
                                            </div>
                                        </div>

                                        <div>
                                            <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
                                                Webhook URL
                                            </p>
                                            <div className="flex items-center gap-2 p-3 bg-gray-50 dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
                                                <code className="text-xs font-mono text-gray-900 dark:text-gray-100 flex-1 truncate">
                                                    {connection.webhook_url}
                                                </code>
                                                <button
                                                    onClick={() => copyToClipboard(connection.webhook_url, connection.id)}
                                                    className="p-1.5 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                                                >
                                                    {copiedUrl === connection.id ? (
                                                        <Check className="h-4 w-4 text-green-600 dark:text-green-400" />
                                                    ) : (
                                                        <Copy className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                                                    )}
                                                </button>
                                            </div>
                                        </div>

                                        {connection.webhook_last_received_at && (
                                            <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                                                <Clock className="h-3.5 w-3.5" />
                                                Last webhook: {new Date(connection.webhook_last_received_at).toLocaleString()}
                                            </div>
                                        )}
                                        {!connection.webhook_last_received_at && (
                                            <div className="text-xs text-gray-500 dark:text-gray-400">
                                                No webhook events received yet.
                                            </div>
                                        )}
                                        <div className="text-xs text-gray-500 dark:text-gray-400">
                                            Created: {new Date(connection.created_at).toLocaleDateString()}
                                        </div>
                                    </div>

                                    <div className="grid gap-2 sm:grid-cols-2">
                                        <Link
                                            href={route('app.whatsapp.connections.edit', {
                                                connection: connection.slug ?? connection.id})}
                                            className="block"
                                        >
                                            <Button variant="secondary" className="w-full group-hover:bg-blue-50 dark:group-hover:bg-blue-900/20 group-hover:border-blue-200 dark:group-hover:border-blue-800 transition-colors">
                                                Manage
                                            </Button>
                                        </Link>
                                        <Link
                                            href={route('app.whatsapp.connections.health', {
                                                connection: connection.slug ?? connection.id})}
                                            className="block"
                                        >
                                            <Button variant="ghost" className="w-full border border-transparent hover:border-blue-200 dark:hover:border-blue-800">
                                                Health Check
                                            </Button>
                                        </Link>
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
