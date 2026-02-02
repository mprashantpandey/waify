import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import Button from '@/Components/UI/Button';
import TextInput from '@/Components/TextInput';
import GuestLayout from '@/Layouts/GuestLayout';
import { Head, useForm } from '@inertiajs/react';
import { FormEventHandler } from 'react';
import { Mail, Lock, ArrowRight, Shield } from 'lucide-react';

export default function ResetPassword({
    token,
    email,
}: {
    token: string;
    email: string;
}) {
    const { data, setData, post, processing, errors, reset } = useForm({
        token: token,
        email: email,
        password: '',
        password_confirmation: '',
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();

        post(route('password.store'), {
            onFinish: () => reset('password', 'password_confirmation'),
        });
    };

    return (
        <GuestLayout>
            <Head title="Reset Password" />

            <div className="mb-6">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                    Reset your password
                </h2>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                    Enter your new password below
                </p>
            </div>

            <form onSubmit={submit} className="space-y-5">
                <div>
                    <InputLabel htmlFor="email" value="Email Address" className="text-sm font-semibold mb-2" />

                    <div className="relative">
                        <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                        <TextInput
                            id="email"
                            type="email"
                            name="email"
                            value={data.email}
                            className="mt-1 block w-full pl-10 rounded-xl"
                            autoComplete="username"
                            onChange={(e) => setData('email', e.target.value)}
                            disabled
                        />
                    </div>

                    <InputError message={errors.email} className="mt-2" />
                </div>

                <div>
                    <InputLabel htmlFor="password" value="New Password" className="text-sm font-semibold mb-2" />

                    <div className="relative">
                        <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                        <TextInput
                            id="password"
                            type="password"
                            name="password"
                            value={data.password}
                            className="mt-1 block w-full pl-10 rounded-xl"
                            autoComplete="new-password"
                            isFocused={true}
                            onChange={(e) => setData('password', e.target.value)}
                            placeholder="Enter new password"
                        />
                    </div>

                    <InputError message={errors.password} className="mt-2" />
                </div>

                <div>
                    <InputLabel
                        htmlFor="password_confirmation"
                        value="Confirm Password"
                        className="text-sm font-semibold mb-2"
                    />

                    <div className="relative">
                        <Shield className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                        <TextInput
                            type="password"
                            name="password_confirmation"
                            value={data.password_confirmation}
                            className="mt-1 block w-full pl-10 rounded-xl"
                            autoComplete="new-password"
                            onChange={(e) =>
                                setData('password_confirmation', e.target.value)
                            }
                            placeholder="Confirm new password"
                        />
                    </div>

                    <InputError
                        message={errors.password_confirmation}
                        className="mt-2"
                    />
                </div>

                <Button 
                    type="submit" 
                    disabled={processing}
                    className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 shadow-lg shadow-blue-500/50 rounded-xl"
                >
                    {processing ? 'Resetting...' : (
                        <>
                            Reset Password
                            <ArrowRight className="h-4 w-4 ml-2" />
                        </>
                    )}
                </Button>
            </form>
        </GuestLayout>
    );
}
