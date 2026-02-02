import Checkbox from '@/Components/Checkbox';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import Button from '@/Components/UI/Button';
import TextInput from '@/Components/TextInput';
import GuestLayout from '@/Layouts/GuestLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { FormEventHandler } from 'react';
import { Mail, Lock, ArrowRight, AlertCircle } from 'lucide-react';
import { Alert } from '@/Components/UI/Alert';

export default function Login({
    status,
    canResetPassword,
}: {
    status?: string;
    canResetPassword: boolean;
}) {
    const { data, setData, post, processing, errors, reset } = useForm({
        email: '',
        password: '',
        remember: false as boolean,
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();

        post(route('login'), {
            onFinish: () => reset('password'),
        });
    };

    return (
        <GuestLayout>
            <Head title="Log in" />

            <div className="mb-6">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                    Welcome back
                </h2>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                    Sign in to your account to continue
                </p>
            </div>

            {status && (
                <Alert variant="success" className="mb-6">
                    <AlertCircle className="h-4 w-4" />
                    {status}
                </Alert>
            )}

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
                            isFocused={true}
                            onChange={(e) => setData('email', e.target.value)}
                            placeholder="you@example.com"
                        />
                    </div>

                    <InputError message={errors.email} className="mt-2" />
                </div>

                <div>
                    <InputLabel htmlFor="password" value="Password" className="text-sm font-semibold mb-2" />

                    <div className="relative">
                        <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                        <TextInput
                            id="password"
                            type="password"
                            name="password"
                            value={data.password}
                            className="mt-1 block w-full pl-10 rounded-xl"
                            autoComplete="current-password"
                            onChange={(e) => setData('password', e.target.value)}
                            placeholder="Enter your password"
                        />
                    </div>

                    <InputError message={errors.password} className="mt-2" />
                </div>

                <div className="flex items-center justify-between">
                    <label className="flex items-center">
                        <Checkbox
                            name="remember"
                            checked={data.remember}
                            onChange={(e) =>
                                setData(
                                    'remember',
                                    (e.target.checked || false) as false,
                                )
                            }
                        />
                        <span className="ms-2 text-sm text-gray-600 dark:text-gray-400">
                            Remember me
                        </span>
                    </label>

                    {canResetPassword && (
                        <Link
                            href={route('password.request')}
                            className="text-sm font-medium text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors"
                        >
                            Forgot password?
                        </Link>
                    )}
                </div>

                <Button 
                    type="submit" 
                    disabled={processing}
                    className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 shadow-lg shadow-blue-500/50 rounded-xl"
                >
                    {processing ? 'Signing in...' : (
                        <>
                            Sign In
                            <ArrowRight className="h-4 w-4 ml-2" />
                        </>
                    )}
                </Button>
            </form>

            <div className="mt-6 text-center">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                    Don't have an account?{' '}
                    <Link
                        href={route('register')}
                        className="font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors"
                    >
                        Sign up
                    </Link>
                </p>
            </div>
        </GuestLayout>
    );
}
