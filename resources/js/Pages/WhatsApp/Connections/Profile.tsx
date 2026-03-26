import { Head, Link, useForm } from '@inertiajs/react';
import { FormEventHandler, useMemo, useState } from 'react';
import { ArrowLeft, Camera, Globe, Mail, MapPin, MessageCircleMore, Phone } from 'lucide-react';
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
    website_secondary?: string;
    vertical: string;
    vertical_label?: string;
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

interface VerticalOption {
    value: string;
    label: string;
}

export default function ConnectionProfileEdit({ connection, verticalOptions }: { connection: Connection; verticalOptions: VerticalOption[] }) {
    const { data, setData, put, processing, errors } = useForm<{
        profile_about: string;
        profile_description: string;
        profile_address: string;
        profile_email: string;
        profile_website: string;
        profile_website_secondary: string;
        profile_vertical: string;
        profile_image: File | null;
    }>({
        profile_about: connection.business_profile?.about || '',
        profile_description: connection.business_profile?.description || '',
        profile_address: connection.business_profile?.address || '',
        profile_email: connection.business_profile?.email || '',
        profile_website: connection.business_profile?.website || '',
        profile_website_secondary: connection.business_profile?.website_secondary || '',
        profile_vertical: connection.business_profile?.vertical || '',
        profile_image: null,
    });
    const [localImagePreview, setLocalImagePreview] = useState<string | null>(null);

    const submit: FormEventHandler = (event) => {
        event.preventDefault();
        put(route('app.whatsapp.connections.profile.update', {
            connection: connection.slug ?? connection.id,
        }), {
            forceFormData: true,
        });
    };

    const selectedVerticalLabel = useMemo(() => {
        return verticalOptions.find((option) => option.value === data.profile_vertical)?.label || 'Not set';
    }, [data.profile_vertical, verticalOptions]);

    const previewImage = localImagePreview || connection.business_profile?.profile_picture_url || null;

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

                <div className="grid gap-5 xl:grid-cols-[1.1fr_0.9fr]">
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

                                <Alert>WhatsApp Cloud API business profiles currently support photo, about, description, address, email, up to two websites, and business category. Business hours are not exposed by Meta on this profile endpoint, so they cannot be synced into WhatsApp from Zyptos.</Alert>

                                <div className="grid gap-4 md:grid-cols-2">
                                    <div className="md:col-span-2">
                                        <InputLabel htmlFor="profile_image" value="Profile photo" />
                                        <label className="mt-1 flex cursor-pointer items-center gap-4 rounded-2xl border border-dashed border-gray-300 bg-gray-50 p-4 transition hover:border-[#00a884] hover:bg-white dark:border-gray-700 dark:bg-gray-900/60 dark:hover:border-[#00a884] dark:hover:bg-gray-900">
                                            <div className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-full bg-[#dcf8c6] text-xl font-semibold text-[#075e54]">
                                                {previewImage ? (
                                                    <img src={previewImage} alt={connection.name} className="h-full w-full object-cover" />
                                                ) : (
                                                    connection.name.charAt(0).toUpperCase()
                                                )}
                                            </div>
                                            <div className="min-w-0 flex-1">
                                                <p className="font-medium text-gray-900 dark:text-gray-100">Upload profile image</p>
                                                <p className="text-sm text-gray-600 dark:text-gray-400">JPG or PNG, up to 5 MB.</p>
                                            </div>
                                            <div className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-2 text-sm font-medium text-gray-700 shadow-sm dark:bg-gray-800 dark:text-gray-200">
                                                <Camera className="h-4 w-4" />
                                                Choose file
                                            </div>
                                            <input
                                                id="profile_image"
                                                type="file"
                                                accept="image/png,image/jpeg,image/jpg"
                                                className="hidden"
                                                onChange={(event) => {
                                                    const file = event.target.files?.[0] || null;
                                                    setData('profile_image', file);
                                                    setLocalImagePreview(file ? URL.createObjectURL(file) : null);
                                                }}
                                            />
                                        </label>
                                        <InputError message={errors.profile_image} className="mt-2" />
                                    </div>

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
                                        <InputLabel htmlFor="profile_website" value="Primary website" />
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
                                        <InputLabel htmlFor="profile_website_secondary" value="Secondary website" />
                                        <TextInput
                                            id="profile_website_secondary"
                                            value={data.profile_website_secondary}
                                            onChange={(event) => setData('profile_website_secondary', event.target.value)}
                                            className="mt-1 block w-full"
                                            placeholder="https://help.example.com"
                                        />
                                        <InputError message={errors.profile_website_secondary} className="mt-2" />
                                    </div>

                                    <div>
                                        <InputLabel htmlFor="profile_vertical" value="Business category" />
                                        <select
                                            id="profile_vertical"
                                            value={data.profile_vertical}
                                            onChange={(event) => setData('profile_vertical', event.target.value)}
                                            className="mt-1 block w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 shadow-sm focus:border-[#00a884] focus:outline-none focus:ring-2 focus:ring-[#00a884]/20 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100"
                                        >
                                            <option value="">Choose a category</option>
                                            {verticalOptions.map((option) => (
                                                <option key={option.value} value={option.value}>{option.label}</option>
                                            ))}
                                        </select>
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
                        <Card className="overflow-hidden border border-[#d1d7db] bg-[#efeae2] shadow-sm dark:border-gray-800 dark:bg-[#0b141a]">
                            <div className="border-b border-[#d1d7db] bg-[#f0f2f5] px-5 py-4 dark:border-gray-800 dark:bg-[#202c33]">
                                <p className="text-sm font-medium text-gray-900 dark:text-gray-100">WhatsApp profile preview</p>
                            </div>
                            <CardContent className="space-y-4 p-5">
                                <div className="rounded-3xl bg-white p-5 shadow-sm dark:bg-[#111b21]">
                                    <div className="flex items-center gap-4">
                                        <div className="flex h-20 w-20 items-center justify-center overflow-hidden rounded-full bg-[#dcf8c6] text-2xl font-semibold text-[#075e54]">
                                            {previewImage ? (
                                                <img src={previewImage} alt={connection.name} className="h-full w-full object-cover" />
                                            ) : (
                                                connection.name.charAt(0).toUpperCase()
                                            )}
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <p className="truncate text-xl font-semibold text-gray-900 dark:text-gray-100">{connection.name}</p>
                                            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{selectedVerticalLabel}</p>
                                            <p className="mt-2 text-sm text-gray-700 dark:text-gray-300">{connection.business_phone || 'Business number not available yet'}</p>
                                        </div>
                                    </div>

                                    <div className="mt-5 rounded-2xl bg-[#f7f5f3] p-4 dark:bg-[#202c33]">
                                        <p className="text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">About</p>
                                        <p className="mt-1 text-sm font-medium text-gray-900 dark:text-gray-100">{data.profile_about || 'No about line yet'}</p>
                                    </div>

                                    <div className="mt-4 space-y-3 text-sm">
                                        <div className="flex items-start gap-3 rounded-2xl bg-[#f7f5f3] p-4 dark:bg-[#202c33]">
                                            <MessageCircleMore className="mt-0.5 h-4 w-4 text-gray-500" />
                                            <div>
                                                <p className="font-medium text-gray-900 dark:text-gray-100">Description</p>
                                                <p className="mt-1 text-gray-600 dark:text-gray-400">{data.profile_description || 'Add a short description so customers know what this number is for.'}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-start gap-3 rounded-2xl bg-[#f7f5f3] p-4 dark:bg-[#202c33]">
                                            <Phone className="mt-0.5 h-4 w-4 text-gray-500" />
                                            <span className="text-gray-900 dark:text-gray-100">{connection.business_phone || 'No number available'}</span>
                                        </div>
                                        <div className="flex items-start gap-3 rounded-2xl bg-[#f7f5f3] p-4 dark:bg-[#202c33]">
                                            <Mail className="mt-0.5 h-4 w-4 text-gray-500" />
                                            <span className="text-gray-900 dark:text-gray-100">{data.profile_email || 'No email added'}</span>
                                        </div>
                                        <div className="flex items-start gap-3 rounded-2xl bg-[#f7f5f3] p-4 dark:bg-[#202c33]">
                                            <Globe className="mt-0.5 h-4 w-4 text-gray-500" />
                                            <div className="space-y-1">
                                                <span className="block text-gray-900 dark:text-gray-100">{data.profile_website || 'No primary website added'}</span>
                                                {data.profile_website_secondary ? (
                                                    <span className="block text-gray-600 dark:text-gray-400">{data.profile_website_secondary}</span>
                                                ) : null}
                                            </div>
                                        </div>
                                        <div className="flex items-start gap-3 rounded-2xl bg-[#f7f5f3] p-4 dark:bg-[#202c33]">
                                            <MapPin className="mt-0.5 h-4 w-4 text-gray-500" />
                                            <span className="text-gray-900 dark:text-gray-100">{data.profile_address || 'No address added'}</span>
                                        </div>
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
