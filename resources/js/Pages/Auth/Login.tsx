import Checkbox from '@/Components/Checkbox';
import GuestLayout from '@/Layouts/GuestLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { FormEventHandler } from 'react';
import { Mail, ArrowRight, AlertCircle } from 'lucide-react';
import { Alert } from '@/Components/UI/Alert';
import Button from '@/Components/UI/Button';
import { AuthDivider, AuthField, AuthInput, PasswordField, SocialAuthButtons } from '@/Components/Auth/AuthParts';

export default function Login({
    status,
    canResetPassword,
    googleOAuthEnabled = false}: {
    status?: string;
    canResetPassword: boolean;
    googleOAuthEnabled?: boolean;
}) {
    const { data, setData, post, processing, errors, reset } = useForm({
        email: '',
        password: '',
        remember: false as boolean});

    const submit: FormEventHandler = (e) => {
        e.preventDefault();

        post(route('login'), {
            onFinish: () => reset('password')});
    };

    return (
        <GuestLayout headerLabel="New here?" headerLinkText="Create account" headerLinkHref={route('register')}>
            <Head title="Log in" />

            <div className="mb-7">
                <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-waify-text dark:text-waify-dark-text">Welcome back</h1>
                <p className="mt-2 text-waify-text-muted dark:text-waify-dark-text-muted">Sign in to continue to your Zyptos workspace.</p>
            </div>

            {status && (
                <Alert variant="success" className="mb-6">
                    <AlertCircle className="h-4 w-4" />
                    {status}
                </Alert>
            )}

            <SocialAuthButtons googleEnabled={googleOAuthEnabled} googleHref={googleOAuthEnabled ? route('auth.google.redirect') : undefined} />
            <AuthDivider label="Or continue with email" />

            <form onSubmit={submit} className="space-y-4">
                <AuthField label="Work email" error={errors.email}>
                    <div className="relative">
                        <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <AuthInput
                            id="email"
                            type="email"
                            name="email"
                            value={data.email}
                            className="pl-10"
                            autoComplete="username"
                            autoFocus
                            required
                            onChange={(e) => setData('email', e.target.value)}
                            placeholder="rohan@company.com"
                        />
                    </div>
                </AuthField>

                <PasswordField
                    id="password"
                    value={data.password}
                    onChange={(e) => setData('password', e.target.value)}
                    autoComplete="current-password"
                    placeholder="Enter your password"
                    forgotHref={canResetPassword ? route('password.request') : undefined}
                    error={errors.password}
                />

                <label className="flex items-center gap-2 text-sm text-waify-text cursor-pointer select-none dark:text-waify-dark-text">
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
                    Keep me signed in for 30 days
                </label>

                <Button
                    type="submit" 
                    disabled={processing}
                    className="w-full h-11"
                >
                    {processing ? 'Signing in...' : (
                        <>
                            Sign In
                            <ArrowRight className="h-4 w-4" />
                        </>
                    )}
                </Button>
            </form>

            <div className="mt-6 text-center">
                <p className="text-sm text-waify-text-muted">
                    Don't have an account?{' '}
                    <Link
                        href={route('register')}
                        className="font-semibold text-waify-green-dark hover:underline"
                    >
                        Sign up
                    </Link>
                </p>
                <p className="mt-6 text-xs text-waify-text-muted dark:text-waify-dark-text-muted">
                    By signing in you agree to our <Link href={route('terms')} className="underline">Terms</Link> and <Link href={route('privacy')} className="underline">Privacy Policy</Link>.
                </p>
            </div>
        </GuestLayout>
    );
}
