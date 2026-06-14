import GuestLayout from '@/Layouts/GuestLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { FormEventHandler } from 'react';
import { Mail, ArrowLeft, CheckCircle, Lock, Send } from 'lucide-react';
import { Alert } from '@/Components/UI/Alert';
import Button from '@/Components/UI/Button';
import { AuthCard, AuthField, AuthInput } from '@/Components/Auth/AuthParts';

export default function ForgotPassword({ status }: { status?: string }) {
    const { data, setData, post, processing, errors } = useForm({
        email: ''});

    const submit: FormEventHandler = (e) => {
        e.preventDefault();

        post(route('password.email'));
    };

    return (
        <GuestLayout>
            <Head title="Forgot Password" />

            <AuthCard>
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-waify-green/15">
                    <Lock className="h-7 w-7 text-waify-green-dark" />
                </div>
                <h1 className="mt-6 text-center text-2xl font-bold text-waify-text dark:text-waify-dark-text">Forgot your password?</h1>
                <p className="mt-2 text-center text-sm text-waify-text-muted dark:text-waify-dark-text-muted">
                    Enter your work email and we will send a reset link.
                </p>

                {status && (
                    <Alert variant="success" className="mt-6">
                        <CheckCircle className="h-4 w-4" />
                        {status}
                    </Alert>
                )}

                <form onSubmit={submit} className="mt-7 space-y-4">
                    <AuthField label="Email address" error={errors.email}>
                        <div className="relative">
                            <Mail className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                            <AuthInput
                                id="email"
                                type="email"
                                name="email"
                                value={data.email}
                                className="pl-10"
                                autoFocus
                                required
                                onChange={(e) => setData('email', e.target.value)}
                                placeholder="rohan@company.com"
                            />
                        </div>
                    </AuthField>

                    <Button type="submit" disabled={processing} className="w-full">
                        {processing ? 'Sending...' : <><Send className="h-4 w-4" /> Send reset link</>}
                    </Button>
                </form>

                <div className="mt-7 border-t border-gray-100 pt-6 text-center dark:border-slate-700">
                    <Link href={route('login')} className="inline-flex items-center gap-1 text-sm font-medium text-waify-text hover:text-waify-green-dark dark:text-waify-dark-text">
                        <ArrowLeft className="h-4 w-4" /> Back to sign in
                    </Link>
                </div>
            </AuthCard>
        </GuestLayout>
    );
}
