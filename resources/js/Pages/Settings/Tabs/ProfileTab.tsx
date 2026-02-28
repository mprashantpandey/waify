import { useForm, router } from '@inertiajs/react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/Components/UI/Card';
import Button from '@/Components/UI/Button';
import TextInput from '@/Components/TextInput';
import InputLabel from '@/Components/InputLabel';
import InputError from '@/Components/InputError';
import { User, Save, Mail, Phone, ShieldCheck } from 'lucide-react';
import { usePage } from '@inertiajs/react';
import { Alert } from '@/Components/UI/Alert';
import { useState } from 'react';

export default function ProfileTab() {
    const pageProps = usePage().props as any;
    const { auth, account } = pageProps;
    const user = auth?.user;
    const mustVerifyEmail = Boolean(pageProps.mustVerifyEmail);
    const emailVerified = Boolean(pageProps.emailVerified);
    const phoneVerificationRequired = Boolean(account?.phone_verification_required);
    const phoneVerified = Boolean(user?.phone_verified_at);
    const originalPhone = String(user?.phone || '');

    const { data, setData, patch, processing, errors, reset } = useForm({
        name: user?.name || '',
        email: user?.email || '',
        phone: user?.phone || '',
    });
    const otpForm = useForm({
        otp_code: '',
    });
    const [sendingOtp, setSendingOtp] = useState(false);
    const [resendingVerification, setResendingVerification] = useState(false);

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        patch(route('profile.update'), {
            preserveScroll: true,
            onSuccess: () => reset(),
        });
    };

    const sendOtp = () => {
        router.post(route('app.settings.security.phone.send-code'), {}, {
            preserveScroll: true,
            onStart: () => setSendingOtp(true),
            onError: () => {},
            onFinish: () => setSendingOtp(false),
        });
    };

    const verifyOtp = (e: React.FormEvent) => {
        e.preventDefault();
        otpForm.post(route('app.settings.security.phone.verify-code'), {
            preserveScroll: true,
            onSuccess: () => {
                otpForm.reset('otp_code');
            },
            onError: () => {},
        });
    };

    const resendEmailVerification = () => {
        router.post(route('app.settings.security.resend-verification'), {}, {
            preserveScroll: true,
            onStart: () => setResendingVerification(true),
            onError: () => {},
            onFinish: () => setResendingVerification(false),
        });
    };

    const phoneChanged = String(data.phone || '').trim() !== originalPhone.trim();
    const canRequestOtp = !phoneChanged && !!String(data.phone || '').trim();

    return (
        <div className="space-y-6">
            <Card className="border-0 shadow-lg">
                <CardHeader className="bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-500 rounded-xl">
                            <User className="h-5 w-5 text-white" />
                        </div>
                        <div>
                            <CardTitle className="text-xl font-bold">Profile Information</CardTitle>
                            <CardDescription>Update your account's profile information and email address</CardDescription>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="p-6">
                    {phoneVerificationRequired && (
                        <Alert variant="warning" className="mb-5">
                            Your tenant requires a verified phone number to access app features.
                        </Alert>
                    )}

                    <div className="mb-5 rounded-xl border border-gray-200 dark:border-gray-700 p-4 space-y-3">
                        <div className="flex items-center justify-between gap-3">
                            <div>
                                <div className="text-sm font-semibold">Email Verification</div>
                                <div className="text-xs text-gray-600 dark:text-gray-400">
                                    Required for account security and password recovery trust.
                                </div>
                            </div>
                            <span className={`text-sm font-medium ${emailVerified ? 'text-green-700 dark:text-green-400' : 'text-amber-700 dark:text-amber-400'}`}>
                                {emailVerified ? 'Verified' : (mustVerifyEmail ? 'Not verified' : 'Optional')}
                            </span>
                        </div>
                        {!emailVerified && mustVerifyEmail && (
                            <div className="flex flex-wrap gap-3">
                                <Button type="button" variant="secondary" onClick={resendEmailVerification}>
                                    {resendingVerification ? 'Sending...' : 'Resend Verification Email'}
                                </Button>
                                <p className="text-xs text-gray-500 dark:text-gray-400 self-center">
                                    Check inbox/spam for the verification link.
                                </p>
                            </div>
                        )}
                    </div>

                    <div className="mb-5 rounded-xl border border-gray-200 dark:border-gray-700 p-4 space-y-3">
                        <div className="flex items-center justify-between gap-3">
                            <div>
                                <div className="text-sm font-semibold">Phone Verification</div>
                                <div className="text-xs text-gray-600 dark:text-gray-400">
                                    Verification codes are currently delivered via email fallback until SMS provider setup is enabled.
                                </div>
                            </div>
                            <div className="flex items-center gap-2 text-sm">
                                <ShieldCheck className={`h-4 w-4 ${phoneVerified ? 'text-green-600' : 'text-amber-600'}`} />
                                <span className={phoneVerified ? 'text-green-700 dark:text-green-400' : 'text-amber-700 dark:text-amber-400'}>
                                    {phoneVerified ? 'Verified' : 'Not verified'}
                                </span>
                            </div>
                        </div>

                        {!phoneVerified && (
                            <form onSubmit={verifyOtp} className="space-y-3">
                                {phoneChanged && (
                                    <Alert variant="warning">
                                        You changed the phone number. Save profile changes first, then request a verification code for the new number.
                                    </Alert>
                                )}
                                <div className="flex flex-col sm:flex-row gap-3">
                                    <Button
                                        type="button"
                                        variant="secondary"
                                        onClick={sendOtp}
                                        disabled={processing || sendingOtp || otpForm.processing || !canRequestOtp}
                                    >
                                        {sendingOtp ? 'Sending...' : 'Send Verification Code'}
                                    </Button>
                                    <div className="flex-1">
                                        <TextInput
                                            value={otpForm.data.otp_code}
                                            onChange={(e) => otpForm.setData('otp_code', e.target.value)}
                                            placeholder="Enter OTP code"
                                            className="w-full rounded-xl"
                                        />
                                        <InputError message={otpForm.errors.otp_code} className="mt-2" />
                                    </div>
                                    <Button
                                        type="submit"
                                        disabled={otpForm.processing || !String(otpForm.data.otp_code || '').trim()}
                                    >
                                        {otpForm.processing ? 'Verifying...' : 'Verify Code'}
                                    </Button>
                                </div>
                                {!String(data.phone || '').trim() && (
                                    <p className="text-xs text-amber-600 dark:text-amber-400">
                                        Save a phone number first, then request a verification code.
                                    </p>
                                )}
                            </form>
                        )}
                    </div>

                    <form onSubmit={submit} className="space-y-5">
                        <div>
                            <InputLabel htmlFor="name" value="Full Name" className="text-sm font-semibold mb-2" />
                            <div className="relative">
                                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                                <TextInput
                                    id="name"
                                    type="text"
                                    value={data.name}
                                    onChange={(e) => setData('name', e.target.value)}
                                    className="mt-1 block w-full pl-10 rounded-xl"
                                    required
                                />
                            </div>
                            <InputError message={errors.name} className="mt-2" />
                        </div>

                        <div>
                            <InputLabel htmlFor="email" value="Email Address" className="text-sm font-semibold mb-2" />
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                                <TextInput
                                    id="email"
                                    type="email"
                                    value={data.email}
                                    onChange={(e) => setData('email', e.target.value)}
                                    className="mt-1 block w-full pl-10 rounded-xl"
                                    required
                                />
                            </div>
                            <InputError message={errors.email} className="mt-2" />
                        </div>

                        <div>
                            <InputLabel htmlFor="phone" value="Phone Number" className="text-sm font-semibold mb-2" />
                            <div className="relative">
                                <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                                <TextInput
                                    id="phone"
                                    type="tel"
                                    value={data.phone}
                                    onChange={(e) => setData('phone', e.target.value)}
                                    className="mt-1 block w-full pl-10 rounded-xl"
                                    required={phoneVerificationRequired}
                                    placeholder="+1234567890"
                                />
                            </div>
                            <InputError message={errors.phone} className="mt-2" />
                        </div>

                        <div className="flex items-center justify-end gap-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                            <Button 
                                type="submit" 
                                disabled={processing}
                                className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 shadow-lg shadow-blue-500/50 rounded-xl"
                            >
                                {processing ? 'Saving...' : (
                                    <>
                                        <Save className="h-4 w-4 mr-2" />
                                        Save Changes
                                    </>
                                )}
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
