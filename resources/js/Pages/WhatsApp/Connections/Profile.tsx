import { Head, Link, useForm } from '@inertiajs/react';
import { FormEventHandler } from 'react';
import { ArrowLeft, Globe, Mail, MapPin, MessageCircleMore, Phone } from 'lucide-react';
import AppShell from '@/Layouts/AppShell';
import { Alert } from '@/Components/UI/Alert';
import Button from '@/Components/UI/Button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/Components/UI/Card';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import { Textarea } from '@/Components/UI/Textarea';

interface BusinessProfile {
    about: string;
    description: string;
    address: string;
    email: string;
    website: string;
    vertical: string;
    profile_picture_url?: string | null;
}

interface Connection {
    id: number;
    slug?: string;
    name: string;
    business_phone: string | null;
    phone_number_id: string;
    business_profile?: BusinessProfile;
    business_profile_error?: string | null;
}

export default function ConnectionProfileEdit({ connection }: { connection: Connection }) {
    const { data, setData, put, processing, errors } = useForm({
        profile_about: connection.business_profile?.about || '',
        profile_description: connection.business_profile?.description || '',
        profile_address: connection.business_profile?.address || '',
        profile_email: connection.business_profile?.email || '',
        profile_website: connection.business_profile?.website || '',
        profile_vertical: connection.business_profile?.vertical || '',
    });

    const submit: FormEventHandler = (event) => {
        event.preventDefault();
        put(route('app.whatsapp.connections.profile.update', {
            connection: connection.slug ?? connection.id,
        }));
    };

    return (
        <AppShell>
            <Head title={`Edit ${connection.name} profile`} />

            <div className="space-y-6">
                <div>
                    <Link
                        href={route('app.whatsapp.connections.edit', { connection: connection.slug ?? connection.id })}
                        className="mb-4 inline-flex items-center gap-2 text-sm font-medium text-gray-600 transition-colors hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        Back to Connection
                    </Link>

                    <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                        <div>
                            <h1 className="text-3xl font-semibold text-gray-900 dark:text-gray-100">WhatsApp profile</h1>
                            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                                Update the business details customers see when they open this WhatsApp profile.
                            </p>
                        </div>
                    </div>
                </div>

                <div className="grid gap-5 xl:grid-cols-[1.25fr_0.75fr]">
                    <Card>
                        <CardHeader>
                            <CardTitle>Profile details</CardTitle>
                            <CardDescription>
                                These changes are sent directly to WhatsApp for this connected number.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={submit} className="space-y-5">
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
                                            className="mt-1 min-h-[120px] w-full"
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

                                <div className="flex items-center justify-end gap-3 border-t border-gray-200 pt-4 dark:border-gray-800">
                                    <Link href={route('app.whatsapp.connections.edit', { connection: connection.slug ?? connection.id })}>
                                        <Button type="button" variant="ghost">Cancel</Button>
                                    </Link>
                                    <Button type="submit" disabled={processing}>
                                        {processing ? 'Saving...' : 'Save profile'}
                                    </Button>
                                </div>
                            </form>
                        </CardContent>
                    </Card>

                    <div className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Profile preview</CardTitle>
                                <CardDescription>
                                    A simple preview of the details customers can see in WhatsApp.
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-3 text-sm">
                                <div className="flex items-start justify-between gap-4 rounded-xl border border-gray-200 bg-gray-50 p-3 dark:border-gray-800 dark:bg-gray-900/60">
                                    <div>
                                        <p className="font-medium text-gray-900 dark:text-gray-100">{connection.name}</p>
                                        <p className="mt-1 text-gray-600 dark:text-gray-400">{connection.business_phone || 'Business number not available yet'}</p>
                                    </div>
                                    {connection.business_profile?.profile_picture_url ? (
                                        <img
                                            src={connection.business_profile.profile_picture_url}
                                            alt={connection.name}
                                            className="h-12 w-12 rounded-full border border-gray-200 object-cover dark:border-gray-700"
                                        />
                                    ) : null}
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
                                        <Phone className="h-4 w-4 text-gray-500" />
                                        <span className="text-gray-900 dark:text-gray-100">{connection.business_phone || 'No number available'}</span>
                                    </div>
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
                    </div>
                </div>
            </div>
        </AppShell>
    );
}
