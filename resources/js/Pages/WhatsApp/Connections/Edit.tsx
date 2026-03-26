import { Head, Link, useForm } from '@inertiajs/react';
import { FormEventHandler } from 'react';
import { ArrowLeft, CheckCircle2, Globe, Mail, MapPin, MessageCircleMore, Phone, XCircle } from 'lucide-react';
import AppShell from '@/Layouts/AppShell';
import { Alert } from '@/Components/UI/Alert';
import { Badge } from '@/Components/UI/Badge';
import Button from '@/Components/UI/Button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/Components/UI/Card';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import { Textarea } from '@/Components/UI/Textarea';

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
    business_profile?: BusinessProfile;
    business_profile_error?: string | null;
}

interface BusinessProfile {
    about: string;
    description: string;
    address: string;
    email: string;
    website: string;
    vertical: string;
    profile_picture_url?: string | null;
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
        profile_about: connection.business_profile?.about || '',
        profile_description: connection.business_profile?.description || '',
        profile_address: connection.business_profile?.address || '',
        profile_email: connection.business_profile?.email || '',
        profile_website: connection.business_profile?.website || '',
        profile_vertical: connection.business_profile?.vertical || '',
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
                                Keep the connection name clear for your team and update the WhatsApp profile customers see.
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

                                <div className="space-y-4 rounded-2xl border border-gray-200 bg-gray-50/70 p-4 dark:border-gray-800 dark:bg-gray-900/40">
                                    <div className="flex items-start justify-between gap-4">
                                        <div>
                                            <h2 className="text-base font-semibold text-gray-900 dark:text-gray-100">WhatsApp profile</h2>
                                            <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                                                These details appear on WhatsApp when customers view this business profile.
                                            </p>
                                        </div>
                                        {connection.business_profile?.profile_picture_url ? (
                                            <img
                                                src={connection.business_profile.profile_picture_url}
                                                alt={connection.name}
                                                className="h-12 w-12 rounded-full border border-gray-200 object-cover dark:border-gray-700"
                                            />
                                        ) : null}
                                    </div>

                                    {connection.business_profile_error ? (
                                        <Alert variant="warning">{connection.business_profile_error}</Alert>
                                    ) : null}

                                    <div className="grid gap-4 md:grid-cols-2">
                                        <div className="md:col-span-2">
                                            <InputLabel htmlFor="profile_about" value="About line" />
                                            <TextInput
                                                id="profile_about"
                                                value={data.profile_about}
                                                onChange={(event) => setData('profile_about', event.target.value)}
                                                className="mt-1 block w-full"
                                                placeholder="Open today until 8 PM"
                                            />
                                            <InputError message={errors.profile_about} className="mt-2" />
                                        </div>

                                        <div className="md:col-span-2">
                                            <InputLabel htmlFor="profile_description" value="Description" />
                                            <Textarea
                                                id="profile_description"
                                                value={data.profile_description}
                                                onChange={(event) => setData('profile_description', event.target.value)}
                                                className="mt-1 min-h-[110px] w-full"
                                                placeholder="Tell customers what this business does."
                                            />
                                            <InputError message={errors.profile_description} className="mt-2" />
                                        </div>

                                        <div>
                                            <InputLabel htmlFor="profile_email" value="Support email" />
                                            <TextInput
                                                id="profile_email"
                                                type="email"
                                                value={data.profile_email}
                                                onChange={(event) => setData('profile_email', event.target.value)}
                                                className="mt-1 block w-full"
                                                placeholder="support@example.com"
                                            />
                                            <InputError message={errors.profile_email} className="mt-2" />
                                        </div>

                                        <div>
                                            <InputLabel htmlFor="profile_website" value="Website" />
                                            <TextInput
                                                id="profile_website"
                                                value={data.profile_website}
                                                onChange={(event) => setData('profile_website', event.target.value)}
                                                className="mt-1 block w-full"
                                                placeholder="https://example.com"
                                            />
                                            <InputError message={errors.profile_website} className="mt-2" />
                                        </div>

                                        <div>
                                            <InputLabel htmlFor="profile_vertical" value="Business category" />
                                            <TextInput
                                                id="profile_vertical"
                                                value={data.profile_vertical}
                                                onChange={(event) => setData('profile_vertical', event.target.value)}
                                                className="mt-1 block w-full"
                                                placeholder="Professional Services"
                                            />
                                            <InputError message={errors.profile_vertical} className="mt-2" />
                                        </div>

                                        <div className="md:col-span-2">
                                            <InputLabel htmlFor="profile_address" value="Address" />
                                            <Textarea
                                                id="profile_address"
                                                value={data.profile_address}
                                                onChange={(event) => setData('profile_address', event.target.value)}
                                                className="mt-1 min-h-[90px] w-full"
                                                placeholder="Business address customers can use"
                                            />
                                            <InputError message={errors.profile_address} className="mt-2" />
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center justify-end gap-3 border-t border-gray-200 pt-4 dark:border-gray-800">
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
                                <CardTitle>Profile preview</CardTitle>
                                <CardDescription>
                                    A simple summary of the business profile that will be sent to WhatsApp.
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-3 text-sm">
                                <div className="flex items-center gap-3 rounded-xl border border-gray-200 bg-gray-50 p-3 dark:border-gray-800 dark:bg-gray-900/60">
                                    <Phone className="h-4 w-4 text-gray-500" />
                                    <span className="text-gray-900 dark:text-gray-100">{connection.business_phone || 'Business number not available yet'}</span>
                                </div>
                                <div className="flex items-start gap-3 rounded-xl border border-gray-200 bg-gray-50 p-3 dark:border-gray-800 dark:bg-gray-900/60">
                                    <MessageCircleMore className="mt-0.5 h-4 w-4 text-gray-500" />
                                    <div>
                                        <p className="font-medium text-gray-900 dark:text-gray-100">{data.profile_about || 'No about line yet'}</p>
                                        <p className="mt-1 text-gray-600 dark:text-gray-400">{data.profile_description || 'Add a short description so customers know what this number is for.'}</p>
                                    </div>
                                </div>
                                <div className="grid gap-3">
                                    <div className="flex items-center gap-3 rounded-xl border border-gray-200 bg-gray-50 p-3 dark:border-gray-800 dark:bg-gray-900/60">
                                        <Mail className="h-4 w-4 text-gray-500" />
                                        <span className="text-gray-900 dark:text-gray-100">{data.profile_email || 'No email added'}</span>
                                    </div>
                                    <div className="flex items-center gap-3 rounded-xl border border-gray-200 bg-gray-50 p-3 dark:border-gray-800 dark:bg-gray-900/60">
                                        <Globe className="h-4 w-4 text-gray-500" />
                                        <span className="text-gray-900 dark:text-gray-100">{data.profile_website || 'No website added'}</span>
                                    </div>
                                    <div className="flex items-start gap-3 rounded-xl border border-gray-200 bg-gray-50 p-3 dark:border-gray-800 dark:bg-gray-900/60">
                                        <MapPin className="mt-0.5 h-4 w-4 text-gray-500" />
                                        <span className="text-gray-900 dark:text-gray-100">{data.profile_address || 'No address added'}</span>
                                    </div>
                                </div>
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
