import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import Button from '@/Components/UI/Button';
import TextInput from '@/Components/TextInput';
import { Transition } from '@headlessui/react';
import { Link, useForm, usePage } from '@inertiajs/react';
import { FormEventHandler } from 'react';
import { CheckCircle2, Mail, User, Send } from 'lucide-react';
import { Alert } from '@/Components/UI/Alert';

export default function UpdateProfileInformation({
    mustVerifyEmail,
    status,
    className = '',
}: {
    mustVerifyEmail: boolean;
    status?: string;
    className?: string;
}) {
    const user = usePage().props.auth.user;

    const { data, setData, patch, errors, processing, recentlySuccessful } =
        useForm({
            name: user.name,
            email: user.email,
        });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();

        patch(route('profile.update'));
    };

    return (
        <section className={className}>
            <form onSubmit={submit} className="space-y-6">
                <div>
                    <InputLabel htmlFor="name" value="Full Name" className="text-sm font-semibold mb-2" />

                    <div className="relative">
                        <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                        <TextInput
                            id="name"
                            className="mt-1 block w-full pl-10 rounded-xl"
                            value={data.name}
                            onChange={(e) => setData('name', e.target.value)}
                            required
                            autoComplete="name"
                        />
                    </div>

                    <InputError className="mt-2" message={errors.name} />
                </div>

                <div>
                    <InputLabel htmlFor="email" value="Email Address" className="text-sm font-semibold mb-2" />

                    <div className="relative">
                        <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                        <TextInput
                            id="email"
                            type="email"
                            className="mt-1 block w-full pl-10 rounded-xl"
                            value={data.email}
                            onChange={(e) => setData('email', e.target.value)}
                            required
                            autoComplete="username"
                        />
                    </div>

                    <InputError className="mt-2" message={errors.email} />
                </div>

                {mustVerifyEmail && user.email_verified_at === null && (
                    <Alert variant="warning">
                        <Mail className="h-4 w-4" />
                        <div className="flex-1">
                            <p className="text-sm font-medium">
                                Your email address is unverified.
                            </p>
                            <Link
                                href={route('verification.send')}
                                method="post"
                                as="button"
                                className="mt-1 text-sm underline hover:no-underline flex items-center gap-1"
                            >
                                <Send className="h-3.5 w-3.5" />
                                Click here to re-send the verification email.
                            </Link>

                            {status === 'verification-link-sent' && (
                                <div className="mt-2 text-sm font-medium text-green-600 dark:text-green-400">
                                    A new verification link has been sent to your email address.
                                </div>
                            )}
                        </div>
                    </Alert>
                )}

                <div className="flex items-center gap-4">
                    <Button 
                        type="submit" 
                        disabled={processing}
                        className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 shadow-lg shadow-blue-500/50 rounded-xl"
                    >
                        {processing ? 'Saving...' : 'Save Changes'}
                    </Button>

                    <Transition
                        show={recentlySuccessful}
                        enter="transition ease-in-out"
                        enterFrom="opacity-0"
                        leave="transition ease-in-out"
                        leaveTo="opacity-0"
                    >
                        <div className="flex items-center gap-2 text-sm text-green-600 dark:text-green-400">
                            <CheckCircle2 className="h-4 w-4" />
                            Saved successfully
                        </div>
                    </Transition>
                </div>
            </form>
        </section>
    );
}
