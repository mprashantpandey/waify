import { useForm } from '@inertiajs/react';
import { FormEventHandler } from 'react';
import AppShell from '@/Layouts/AppShell';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/Components/UI/Card';
import Button from '@/Components/UI/Button';
import TextInput from '@/Components/TextInput';
import InputLabel from '@/Components/InputLabel';
import InputError from '@/Components/InputError';
import { ArrowLeft } from 'lucide-react';
import { Link, Head } from '@inertiajs/react';
import { useToast } from '@/hooks/useToast';

interface Tag {
    id: number;
    name: string;
    color: string;
}

export default function ContactsCreate({
    account,
    tags}: {
    account: any;
    tags: Tag[];
}) {
    const { toast } = useToast();

    const { data, setData, post, processing, errors } = useForm({
        wa_id: '',
        name: '',
        email: '',
        phone: '',
        company: '',
        notes: '',
        status: 'active' as 'active' | 'inactive' | 'blocked' | 'opt_out',
        tags: [] as number[]});

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route('app.contacts.store', {}), {
            onSuccess: () => {
                toast.success('Contact created successfully');
            },
            onError: () => {
                toast.error('Failed to create contact');
            }});
    };

    const toggleTag = (tagId: number) => {
        if (data.tags.includes(tagId)) {
            setData('tags', data.tags.filter((id) => id !== tagId));
        } else {
            setData('tags', [...data.tags, tagId]);
        }
    };

    return (
        <AppShell>
            <Head title="Create Contact" />
            <div className="space-y-6">
                <div>
                    <Link
                        href={route('app.contacts.index', {})}
                        className="inline-flex items-center gap-2 text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors mb-4"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        Back to Contacts
                    </Link>
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-gray-100 dark:to-gray-300 bg-clip-text text-transparent">
                        Create Contact
                    </h1>
                </div>

                <form onSubmit={submit} className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Contact Information</CardTitle>
                            <CardDescription>Basic information about the contact</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <InputLabel htmlFor="wa_id" value="WhatsApp ID / Phone *" />
                                <TextInput
                                    id="wa_id"
                                    type="text"
                                    value={data.wa_id}
                                    onChange={(e) => setData('wa_id', e.target.value)}
                                    className="mt-1 block w-full"
                                    required
                                />
                                <InputError message={errors.wa_id} className="mt-2" />
                            </div>

                            <div>
                                <InputLabel htmlFor="name" value="Name" />
                                <TextInput
                                    id="name"
                                    type="text"
                                    value={data.name}
                                    onChange={(e) => setData('name', e.target.value)}
                                    className="mt-1 block w-full"
                                />
                                <InputError message={errors.name} className="mt-2" />
                            </div>

                            <div>
                                <InputLabel htmlFor="email" value="Email" />
                                <TextInput
                                    id="email"
                                    type="email"
                                    value={data.email}
                                    onChange={(e) => setData('email', e.target.value)}
                                    className="mt-1 block w-full"
                                />
                                <InputError message={errors.email} className="mt-2" />
                            </div>

                            <div>
                                <InputLabel htmlFor="phone" value="Phone" />
                                <TextInput
                                    id="phone"
                                    type="text"
                                    value={data.phone}
                                    onChange={(e) => setData('phone', e.target.value)}
                                    className="mt-1 block w-full"
                                />
                                <InputError message={errors.phone} className="mt-2" />
                            </div>

                            <div>
                                <InputLabel htmlFor="company" value="Company" />
                                <TextInput
                                    id="company"
                                    type="text"
                                    value={data.company}
                                    onChange={(e) => setData('company', e.target.value)}
                                    className="mt-1 block w-full"
                                />
                                <InputError message={errors.company} className="mt-2" />
                            </div>

                            <div>
                                <InputLabel htmlFor="status" value="Status" />
                                <select
                                    id="status"
                                    value={data.status}
                                    onChange={(e) => setData('status', e.target.value as any)}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-700"
                                >
                                    <option value="active">Active</option>
                                    <option value="inactive">Inactive</option>
                                    <option value="blocked">Blocked</option>
                                    <option value="opt_out">Opt Out</option>
                                </select>
                                <InputError message={errors.status} className="mt-2" />
                            </div>

                            <div>
                                <InputLabel htmlFor="notes" value="Notes" />
                                <textarea
                                    id="notes"
                                    value={data.notes}
                                    onChange={(e) => setData('notes', e.target.value)}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-700"
                                    rows={4}
                                />
                                <InputError message={errors.notes} className="mt-2" />
                            </div>
                        </CardContent>
                    </Card>

                    {tags.length > 0 && (
                        <Card>
                            <CardHeader>
                                <CardTitle>Tags</CardTitle>
                                <CardDescription>Organize contacts with tags</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="flex flex-wrap gap-2">
                                    {tags.map((tag) => (
                                        <button
                                            key={tag.id}
                                            type="button"
                                            onClick={() => toggleTag(tag.id)}
                                            className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                                                data.tags.includes(tag.id)
                                                    ? 'bg-blue-600 text-white'
                                                    : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                                            }`}
                                            style={
                                                data.tags.includes(tag.id)
                                                    ? {}
                                                    : { backgroundColor: tag.color + '20', color: tag.color }
                                            }
                                        >
                                            {tag.name}
                                        </button>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    <div className="flex justify-end gap-4">
                        <Link href={route('app.contacts.index', { })}>
                            <Button type="button" variant="secondary">
                                Cancel
                            </Button>
                        </Link>
                        <Button type="submit" disabled={processing}>
                            Create Contact
                        </Button>
                    </div>
                </form>
            </div>
        </AppShell>
    );
}
