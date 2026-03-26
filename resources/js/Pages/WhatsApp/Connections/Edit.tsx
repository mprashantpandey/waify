import { Head, Link, useForm } from '@inertiajs/react';
import { FormEventHandler } from 'react';
import { ArrowLeft, CheckCircle2, MessageCircleMore, XCircle } from 'lucide-react';
import AppShell from '@/Layouts/AppShell';
import { Alert } from '@/Components/UI/Alert';
import { Badge } from '@/Components/UI/Badge';
import Button from '@/Components/UI/Button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/Components/UI/Card';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';

interface Connection {
    id: number;
    slug?: string;
    name: string;
    waba_id: string | null;
    phone_number_id: string;
    business_phone: string | null;
    api_version: string;
    is_active?: boolean;
    webhook_last_received_at: string | null;
    activation_state?: string | null;
    activation_last_error?: string | null;
    provisioning_step?: string | null;
    provisioning_status?: string | null;
    provisioning_last_error?: string | null;
    throughput_cap_per_minute?: number | null;
    quiet_hours_start?: string | null;
    quiet_hours_end?: string | null;
    quiet_hours_timezone?: string | null;
}

function formatProvisioningStep(step?: string | null): string {
    const labels: Record<string, string> = {
        oauth_complete: 'Login confirmed',
        assets_resolved: 'Business details received',
        system_user_assignment: 'Business access being linked',
        credit_line_attachment: 'Billing setup in progress',
        app_subscription: 'Message updates being enabled',
        phone_registration: 'Number being prepared',
        metadata_sync: 'Account details being loaded',
        connection_ready: 'Ready',
    };

    return labels[String(step || '').toLowerCase()] || 'Final checks';
}

function setupLabel(connection: Connection): string {
    if (connection.provisioning_status === 'failed') return 'Needs attention';
    if (connection.provisioning_status && connection.provisioning_status !== 'completed') return 'Getting ready';
    if (connection.activation_state && connection.activation_state !== 'active') return 'Almost ready';
    return connection.is_active ? 'Ready' : 'Inactive';
}

function statusMessage(connection: Connection): string {
    if (connection.provisioning_status === 'failed') {
        return connection.provisioning_last_error || 'Setup needs one more check before this number can be used.';
    }

    if (connection.provisioning_status && connection.provisioning_status !== 'completed') {
        return `We're still finishing setup for this number. Current step: ${formatProvisioningStep(connection.provisioning_step)}.`;
    }

    if (connection.activation_state && connection.activation_state !== 'active') {
        return connection.activation_last_error || 'This number is being activated on WhatsApp.';
    }

    return 'This number is ready for inbox conversations, templates, and broadcasts.';
}

export default function ConnectionsEdit({
    connection,
}: {
    account: unknown;
    connection: Connection;
    embeddedSignupEvents?: unknown[];
}) {
    const { data, setData, put, processing, errors } = useForm({
        name: connection.name,
        waba_id: connection.waba_id || '',
        phone_number_id: connection.phone_number_id,
        business_phone: connection.business_phone || '',
        access_token: '',
        api_version: connection.api_version,
        throughput_cap_per_minute: connection.throughput_cap_per_minute || 120,
        quiet_hours_start: connection.quiet_hours_start || '',
        quiet_hours_end: connection.quiet_hours_end || '',
        quiet_hours_timezone: connection.quiet_hours_timezone || 'UTC',
    });

    const submit: FormEventHandler = (event) => {
        event.preventDefault();
        put(route('app.whatsapp.connections.update', {
            connection: connection.slug ?? connection.id,
        }));
    };

    const label = setupLabel(connection);
    const needsHelp = label !== 'Ready';

    return (
        <AppShell>
            <Head title={connection.name} />

            <div className="space-y-6">
                <div>
                    <Link
                        href={route('app.whatsapp.connections.index')}
                        className="mb-4 inline-flex items-center gap-2 text-sm font-medium text-gray-600 transition-colors hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        Back to Connections
                    </Link>

                    <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                        <div>
                            <h1 className="text-3xl font-semibold text-gray-900 dark:text-gray-100">{connection.name}</h1>
                            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                                Review the number and keep the name clear for your team.
                            </p>
                        </div>

                        <div className="flex gap-3">
                            <Badge variant={label === 'Ready' ? 'success' : 'warning'}>{label}</Badge>
                            <Link href={route('app.support.index')}>
                                <Button variant="secondary">Contact Support</Button>
                            </Link>
                        </div>
                    </div>
                </div>

                {needsHelp && (
                    <Alert variant="warning">
                        {statusMessage(connection)} If this does not clear on its own, open support and share this number.
                    </Alert>
                )}

                <div className="grid gap-5 xl:grid-cols-[1.3fr_0.7fr]">
                    <Card>
                        <CardHeader>
                            <CardTitle>Basic details</CardTitle>
                            <CardDescription>
                                Keep the connection name clear for your team.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={submit} className="space-y-5">
                                <div>
                                    <InputLabel htmlFor="name" value="Connection name" />
                                    <TextInput
                                        id="name"
                                        value={data.name}
                                        onChange={(event) => setData('name', event.target.value)}
                                        className="mt-1 block w-full"
                                        required
                                    />
                                    <InputError message={errors.name} className="mt-2" />
                                </div>

                                <div>
                                    <InputLabel value="Business number" />
                                    <div className="mt-1 rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-900 dark:border-gray-800 dark:bg-gray-900/60 dark:text-gray-100">
                                        {connection.business_phone || 'Not available yet'}
                                    </div>
                                </div>

                                <div className="flex items-center justify-end gap-3 border-t border-gray-200 pt-4 dark:border-gray-800">
                                    <Link
                                        href={route('app.whatsapp.connections.profile.edit', {
                                            connection: connection.slug ?? connection.id,
                                        })}
                                    >
                                        <Button type="button" variant="secondary">Edit WhatsApp profile</Button>
                                    </Link>
                                    <Link href={route('app.whatsapp.connections.index')}>
                                        <Button type="button" variant="ghost">Cancel</Button>
                                    </Link>
                                    <Button type="submit" disabled={processing}>
                                        {processing ? 'Saving...' : 'Save changes'}
                                    </Button>
                                </div>
                            </form>
                        </CardContent>
                    </Card>

                    <div className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Connection status</CardTitle>
                                <CardDescription>
                                    A simple view of whether this number is ready or still being prepared.
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="rounded-xl bg-gray-50 p-4 dark:bg-gray-800/60">
                                    <div className="flex items-center gap-2 text-sm font-medium text-gray-900 dark:text-gray-100">
                                        {label === 'Ready' ? (
                                            <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                                        ) : (
                                            <XCircle className="h-4 w-4 text-amber-500" />
                                        )}
                                        {label}
                                    </div>
                                    <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">{statusMessage(connection)}</p>
                                </div>

                                <dl className="space-y-3 text-sm">
                                    <div className="flex items-start justify-between gap-4">
                                        <dt className="text-gray-500 dark:text-gray-400">Current step</dt>
                                        <dd className="text-right font-medium text-gray-900 dark:text-gray-100">
                                            {connection.provisioning_step ? formatProvisioningStep(connection.provisioning_step) : 'Ready'}
                                        </dd>
                                    </div>
                                    <div className="flex items-start justify-between gap-4">
                                        <dt className="text-gray-500 dark:text-gray-400">Last activity</dt>
                                        <dd className="text-right font-medium text-gray-900 dark:text-gray-100">
                                            {connection.webhook_last_received_at
                                                ? new Date(connection.webhook_last_received_at).toLocaleString()
                                                : 'Not received yet'}
                                        </dd>
                                    </div>
                                </dl>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Need help?</CardTitle>
                                <CardDescription>
                                    Use support if setup is stuck.
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex items-start gap-3 rounded-xl border border-dashed border-gray-200 p-3 dark:border-gray-800">
                                    <MessageCircleMore className="mt-0.5 h-4 w-4 text-blue-500" />
                                    <div>
                                        <p className="text-sm font-medium text-gray-900 dark:text-gray-100">Contact the Zyptos team</p>
                                        <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                                            Share the connection name and business number.
                                        </p>
                                    </div>
                                </div>

                                <div className="flex flex-col gap-3">
                                    <Link href={route('app.support.index')}>
                                        <Button className="w-full">Open support</Button>
                                    </Link>
                                    <Link href={route('app.whatsapp.connections.wizard')}>
                                        <Button variant="secondary" className="w-full">Start guided setup</Button>
                                    </Link>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </AppShell>
    );
}
