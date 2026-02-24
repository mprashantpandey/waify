import Button from '@/Components/UI/Button';
import GuestLayout from '@/Layouts/GuestLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { FormEventHandler } from 'react';
import { Mail, LogOut, Send } from 'lucide-react';
import { Alert } from '@/Components/UI/Alert';

export default function VerifyEmail({ status }: { status?: string }) {
    const { post, processing } = useForm({});

    const submit: FormEventHandler = (e) => {
        e.preventDefault();

        post(route('verification.send'));
    };

    return (
        <GuestLayout>
            <Head title="Email Verification" />

            <div className="mb-6 text-center">
                <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-blue-100 to-blue-200 dark:from-blue-900/20 dark:to-blue-800/20 mb-4">
                    <Mail className="h-10 w-10 text-blue-600 dark:text-blue-400" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                    Verify your email
                </h2>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                    Thanks for signing up! Before getting started, could you verify your email address by clicking on the link we just emailed to you?
                </p>
            </div>

            {status === 'verification-link-sent' && (
                <Alert variant="success" className="mb-6">
                    <div>
                        <p className="font-medium">Verification link sent!</p>
                        <p className="text-sm mt-1">
                            A new verification link has been sent to the email address you provided during registration.
                        </p>
                    </div>
                </Alert>
            )}

            <form onSubmit={submit} className="space-y-4">
                <Button 
                    type="submit" 
                    disabled={processing}
                    className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 shadow-lg shadow-blue-500/50 rounded-xl"
                >
                    {processing ? (
                        'Sending...'
                    ) : (
                        <>
                            <Send className="h-4 w-4 mr-2" />
                            Resend Verification Email
                        </>
                    )}
                </Button>

                <Link
                    href={route('logout')}
                    method="post"
                    as="button"
                    className="block w-full text-center text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors"
                >
                    <LogOut className="h-4 w-4 inline mr-1" />
                    Log Out
                </Link>
            </form>
        </GuestLayout>
    );
}
