import { useForm } from '@inertiajs/react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/Components/UI/Card';
import Button from '@/Components/UI/Button';
import TextInput from '@/Components/TextInput';
import InputLabel from '@/Components/InputLabel';
import InputError from '@/Components/InputError';
import { Shield, Save, Trash2, Lock, CheckCircle2, KeyRound } from 'lucide-react';
import { router } from '@inertiajs/react';
import { useNotifications } from '@/hooks/useNotifications';
import { Transition } from '@headlessui/react';
import { usePage } from '@inertiajs/react';
import { Alert } from '@/Components/UI/Alert';
import { useEffect, useState } from 'react';
import QRCode from 'qrcode';

type SecuritySession = {
    id: string;
    ip_address?: string | null;
    user_agent?: string | null;
    last_activity_at: string;
    is_current: boolean;
};

export default function SecurityTab() {
    const { confirm, toast } = useNotifications();
    const { props } = usePage() as any;
    const mustVerifyEmail = Boolean(props.mustVerifyEmail);
    const emailVerified = Boolean(props.emailVerified);
    const accounts = Array.isArray(props.accounts) ? props.accounts : [];
    const ownedAccounts = accounts.filter((a: any) => String(a?.owner_id ?? '') === String(props.auth?.user?.id ?? ''));
    const securityPolicy = props.securityPolicy;
    const twoFactor = props.twoFactor ?? {};
    const twoFactorEnabled = Boolean(twoFactor.enabled);
    const twoFactorPending = Boolean(twoFactor.pending_setup);
    const recoveryCodes: string[] = Array.isArray(twoFactor.recovery_codes) ? twoFactor.recovery_codes : [];
    const sessions: SecuritySession[] = (props.sessions ?? []) as SecuritySession[];
    const [twoFactorQrDataUrl, setTwoFactorQrDataUrl] = useState<string | null>(null);
    const { data, setData, put, processing, errors, reset, recentlySuccessful } = useForm({
        current_password: '',
        password: '',
        password_confirmation: ''});
    const sessionForm = useForm({
        current_password: '',
    });
    const twoFactorConfirmForm = useForm({
        otp_code: '',
    });
    const twoFactorDisableForm = useForm({
        current_password: '',
    });
    const deleteAccountForm = useForm({
        password: '',
        confirmation_text: '',
    });
    const [showDeleteReview, setShowDeleteReview] = useState(false);

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        put(route('password.update'), {
            preserveScroll: true,
            onSuccess: () => {
                toast.success('Password updated successfully');
                reset();
            },
            onError: () => {
                toast.error('Failed to update password');
            }});
    };

    const deletePrechecks = {
        hasOwnedAccounts: ownedAccounts.length > 0,
        hasMemberAccounts: accounts.length > 0,
        typedConfirmation: deleteAccountForm.data.confirmation_text.trim() === 'DELETE',
        hasPassword: deleteAccountForm.data.password.trim().length > 0,
    };
    const deleteBlockedByMemberships = deletePrechecks.hasOwnedAccounts || deletePrechecks.hasMemberAccounts;

    const deleteAccount = async (e: React.FormEvent) => {
        e.preventDefault();

        if (deleteBlockedByMemberships) {
            toast.error('Resolve tenant ownership/membership before deleting your account');
            return;
        }

        if (!deletePrechecks.typedConfirmation || !deletePrechecks.hasPassword) {
            toast.error('Complete the deletion confirmation checks first');
            return;
        }

        const confirmed = await confirm({
            title: 'Final Delete Confirmation',
            message: 'This will permanently delete your user account. This action cannot be undone.',
            variant: 'danger',
            confirmText: 'Delete',
        });

        if (!confirmed) return;

        router.delete(route('profile.destroy'), {
            data: { password: deleteAccountForm.data.password },
            onSuccess: () => {
                toast.success('Account deleted successfully');
            },
            onError: () => {
                toast.error('Failed to delete account');
            },
        });
    };

    const revokeOtherSessions = (e: React.FormEvent) => {
        e.preventDefault();
        sessionForm.post(route('app.settings.security.revoke-other-sessions'), {
            preserveScroll: true,
            onSuccess: () => {
                toast.success('Other sessions signed out');
                sessionForm.reset();
            },
            onError: () => {
                toast.error('Failed to sign out other sessions');
            },
        });
    };

    const revokeSession = async (sessionId: string) => {
        const confirmed = await confirm({
            title: 'Revoke Session',
            message: 'This device session will be signed out immediately.',
            variant: 'danger',
            confirmText: 'Revoke',
        });
        if (!confirmed) return;

        router.delete(route('app.settings.security.sessions.revoke', { sessionId }), {
            preserveScroll: true,
            onSuccess: () => toast.success('Session revoked'),
            onError: () => toast.error('Failed to revoke session'),
        });
    };

    useEffect(() => {
        let active = true;

        if (!twoFactorPending || !twoFactor.otpauth_uri) {
            setTwoFactorQrDataUrl(null);
            return () => {
                active = false;
            };
        }

        QRCode.toDataURL(twoFactor.otpauth_uri, {
            width: 220,
            margin: 1,
        }).then((url: string) => {
            if (active) setTwoFactorQrDataUrl(url);
        }).catch(() => {
            if (active) setTwoFactorQrDataUrl(null);
        });

        return () => {
            active = false;
        };
    }, [twoFactorPending, twoFactor.otpauth_uri]);

    const startTwoFactorSetup = () => {
        router.post(route('app.settings.security.2fa.setup'), {}, {
            preserveScroll: true,
            onSuccess: () => toast.success('2FA setup started'),
            onError: () => toast.error('Failed to start 2FA setup'),
        });
    };

    const cancelTwoFactorSetup = () => {
        router.post(route('app.settings.security.2fa.cancel'), {}, {
            preserveScroll: true,
            onSuccess: () => toast.info('2FA setup canceled'),
        });
    };

    const confirmTwoFactorSetup = (e: React.FormEvent) => {
        e.preventDefault();
        twoFactorConfirmForm.post(route('app.settings.security.2fa.confirm'), {
            preserveScroll: true,
            onSuccess: () => {
                toast.success('2FA enabled');
                twoFactorConfirmForm.reset();
            },
            onError: () => toast.error('Failed to enable 2FA'),
        });
    };

    const disableTwoFactor = (e: React.FormEvent) => {
        e.preventDefault();
        twoFactorDisableForm.post(route('app.settings.security.2fa.disable'), {
            preserveScroll: true,
            onSuccess: () => {
                toast.success('2FA disabled');
                twoFactorDisableForm.reset();
            },
            onError: () => toast.error('Failed to disable 2FA'),
        });
    };

    const regenerateRecoveryCodes = () => {
        router.post(route('app.settings.security.2fa.recovery-codes.regenerate'), {}, {
            preserveScroll: true,
            onSuccess: () => toast.success('Recovery codes regenerated'),
            onError: () => toast.error('Failed to regenerate recovery codes'),
        });
    };

    return (
        <div className="space-y-6">
            <Card className="border-0 shadow-lg">
                <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-100 dark:from-blue-900/20 dark:to-indigo-800/20">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-500 rounded-xl">
                            <Shield className="h-5 w-5 text-white" />
                        </div>
                        <div>
                            <CardTitle className="text-xl font-bold">Account Security Status</CardTitle>
                            <CardDescription>Email verification, session controls, and enforced platform policy</CardDescription>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="p-6 space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="rounded-xl border border-gray-200 dark:border-gray-700 p-4">
                            <div className="text-sm font-semibold mb-2">Email Verification</div>
                            {emailVerified ? (
                                <Alert variant="success">Your email is verified.</Alert>
                            ) : (
                                <div className="space-y-3">
                                    <Alert variant="warning">Your email is not verified.</Alert>
                                    {mustVerifyEmail && (
                                        <Button
                                            variant="secondary"
                                            onClick={() => router.post(route('app.settings.security.resend-verification'), {}, { preserveScroll: true })}
                                        >
                                            Resend Verification Email
                                        </Button>
                                    )}
                                </div>
                            )}
                        </div>
                        <div className="rounded-xl border border-gray-200 dark:border-gray-700 p-4">
                            <div className="text-sm font-semibold mb-2">Security Summary</div>
                            <div className="space-y-2 text-sm">
                                <div className="flex items-center justify-between gap-2">
                                    <span className="text-gray-600 dark:text-gray-400">Email verification</span>
                                    <span className={emailVerified ? 'text-green-700 dark:text-green-300 font-medium' : 'text-amber-700 dark:text-amber-300 font-medium'}>
                                        {emailVerified ? 'Verified' : 'Pending'}
                                    </span>
                                </div>
                                <div className="flex items-center justify-between gap-2">
                                    <span className="text-gray-600 dark:text-gray-400">Two-factor authentication</span>
                                    <span className={twoFactorEnabled ? 'text-green-700 dark:text-green-300 font-medium' : 'text-gray-700 dark:text-gray-300 font-medium'}>
                                        {twoFactorEnabled ? 'Enabled' : 'Not enabled'}
                                    </span>
                                </div>
                                <div className="flex items-center justify-between gap-2">
                                    <span className="text-gray-600 dark:text-gray-400">Policy requires 2FA</span>
                                    <span className="text-gray-900 dark:text-gray-100 font-medium">
                                        {securityPolicy?.require_2fa ? 'Yes' : 'No'}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Card className="border-0 shadow-lg">
                <CardHeader className="bg-gradient-to-r from-emerald-50 to-teal-100 dark:from-emerald-900/20 dark:to-teal-800/20">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-emerald-500 rounded-xl">
                            <KeyRound className="h-5 w-5 text-white" />
                        </div>
                        <div>
                            <CardTitle className="text-xl font-bold">Two-Factor Authentication (2FA)</CardTitle>
                            <CardDescription>Use an authenticator app (TOTP) for stronger account protection</CardDescription>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="p-6 space-y-4">
                    <Alert variant={twoFactorEnabled ? 'success' : 'warning'}>
                        {twoFactorEnabled ? '2FA is enabled on your account.' : '2FA is not enabled on your account.'}
                    </Alert>

                    {securityPolicy?.require_2fa && !twoFactorEnabled && (
                        <Alert variant="warning">
                            Platform policy requires 2FA. Set it up now to stay compliant.
                        </Alert>
                    )}

                    {!twoFactorEnabled && !twoFactorPending && (
                        <Button onClick={startTwoFactorSetup}>
                            Start 2FA Setup
                        </Button>
                    )}

                    {!twoFactorEnabled && twoFactorPending && (
                        <div className="space-y-4 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
                            <div className="space-y-2">
                                <p className="text-sm font-semibold">Step 1: Add this secret to your authenticator app</p>
                                {twoFactorQrDataUrl && (
                                    <div className="flex justify-center">
                                        <img
                                            src={twoFactorQrDataUrl}
                                            alt="2FA QR Code"
                                            className="h-56 w-56 rounded-lg border border-gray-200 bg-white p-2"
                                            loading="lazy"
                                        />
                                    </div>
                                )}
                                <div className="rounded-lg bg-gray-50 dark:bg-gray-900 p-3 text-sm font-mono break-all">
                                    {twoFactor.pending_secret}
                                </div>
                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                    If your app supports manual entry, use the secret above. OTPAuth URI is shown below for compatibility.
                                </p>
                                <div className="rounded-lg bg-gray-50 dark:bg-gray-900 p-3 text-xs break-all">
                                    {twoFactor.otpauth_uri}
                                </div>
                            </div>

                            <form onSubmit={confirmTwoFactorSetup} className="space-y-3">
                                <div>
                                    <InputLabel htmlFor="two_factor_otp_code" value="Step 2: Enter 6-digit code from authenticator app" className="text-sm font-semibold mb-2" />
                                    <TextInput
                                        id="two_factor_otp_code"
                                        value={twoFactorConfirmForm.data.otp_code}
                                        onChange={(e) => twoFactorConfirmForm.setData('otp_code', e.target.value)}
                                        className="block w-full rounded-xl"
                                        placeholder="123456"
                                    />
                                    <InputError message={(twoFactorConfirmForm.errors as any).otp_code || (twoFactorConfirmForm.errors as any).two_factor_otp_code} className="mt-2" />
                                </div>
                                <div className="flex gap-3">
                                    <Button type="submit" disabled={twoFactorConfirmForm.processing}>
                                        {twoFactorConfirmForm.processing ? 'Confirming...' : 'Enable 2FA'}
                                    </Button>
                                    <Button type="button" variant="secondary" onClick={cancelTwoFactorSetup}>
                                        Cancel Setup
                                    </Button>
                                </div>
                            </form>
                        </div>
                    )}

                    {twoFactorEnabled && (
                        <div className="space-y-4">
                            <div className="flex flex-wrap gap-3">
                                <Button variant="secondary" onClick={regenerateRecoveryCodes}>
                                    Regenerate Recovery Codes
                                </Button>
                            </div>

                            {recoveryCodes.length > 0 && (
                                <div className="rounded-xl border border-amber-200 dark:border-amber-800 p-4">
                                    <p className="text-sm font-semibold text-amber-800 dark:text-amber-200 mb-2">
                                        Save these recovery codes now (shown once after generation)
                                    </p>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                        {recoveryCodes.map((code) => (
                                            <div key={code} className="rounded bg-amber-50 dark:bg-amber-900/20 px-3 py-2 font-mono text-sm">
                                                {code}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            <form onSubmit={disableTwoFactor} className="space-y-3 border-t border-gray-200 dark:border-gray-700 pt-4">
                                <div>
                                    <InputLabel htmlFor="disable_two_factor_password" value="Current Password (to disable 2FA)" className="text-sm font-semibold mb-2" />
                                    <TextInput
                                        id="disable_two_factor_password"
                                        type="password"
                                        value={twoFactorDisableForm.data.current_password}
                                        onChange={(e) => twoFactorDisableForm.setData('current_password', e.target.value)}
                                        className="block w-full rounded-xl"
                                        placeholder="Enter current password"
                                    />
                                    <InputError message={(twoFactorDisableForm.errors as any).current_password || (twoFactorDisableForm.errors as any).disable_two_factor_password} className="mt-2" />
                                </div>
                                <Button type="submit" variant="danger" disabled={twoFactorDisableForm.processing}>
                                    {twoFactorDisableForm.processing ? 'Disabling...' : 'Disable 2FA'}
                                </Button>
                            </form>
                        </div>
                    )}
                </CardContent>
            </Card>

            <Card className="border-0 shadow-lg">
                <CardHeader className="bg-gradient-to-r from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-purple-500 rounded-xl">
                            <Shield className="h-5 w-5 text-white" />
                        </div>
                        <div>
                            <CardTitle className="text-xl font-bold">Update Password</CardTitle>
                            <CardDescription>Ensure your account is using a long, random password to stay secure</CardDescription>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="p-6">
                    <form onSubmit={submit} className="space-y-5">
                        <div>
                            <InputLabel htmlFor="current_password" value="Current Password" className="text-sm font-semibold mb-2" />
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                                <TextInput
                                    id="current_password"
                                    type="password"
                                    value={data.current_password}
                                    onChange={(e) => setData('current_password', e.target.value)}
                                    className="mt-1 block w-full pl-10 rounded-xl"
                                    required
                                    placeholder="Enter current password"
                                />
                            </div>
                            <InputError message={errors.current_password} className="mt-2" />
                        </div>

                        <div>
                            <InputLabel htmlFor="password" value="New Password" className="text-sm font-semibold mb-2" />
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                                <TextInput
                                    id="password"
                                    type="password"
                                    value={data.password}
                                    onChange={(e) => setData('password', e.target.value)}
                                    className="mt-1 block w-full pl-10 rounded-xl"
                                    required
                                    placeholder="Enter new password"
                                />
                            </div>
                            <InputError message={errors.password} className="mt-2" />
                        </div>

                        <div>
                            <InputLabel htmlFor="password_confirmation" value="Confirm Password" className="text-sm font-semibold mb-2" />
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                                <TextInput
                                    id="password_confirmation"
                                    type="password"
                                    value={data.password_confirmation}
                                    onChange={(e) => setData('password_confirmation', e.target.value)}
                                    className="mt-1 block w-full pl-10 rounded-xl"
                                    required
                                    placeholder="Confirm new password"
                                />
                            </div>
                            <InputError message={errors.password_confirmation} className="mt-2" />
                        </div>

                        <div className="flex items-center justify-end gap-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                            <Button 
                                type="submit" 
                                disabled={processing}
                                className="bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 shadow-lg shadow-purple-500/50 rounded-xl"
                            >
                                {processing ? 'Updating...' : (
                                    <>
                                        <Save className="h-4 w-4 mr-2" />
                                        Update Password
                                    </>
                                )}
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
                                    Password updated
                                </div>
                            </Transition>
                        </div>
                    </form>
                </CardContent>
            </Card>

            <Card className="border-0 shadow-lg">
                <CardHeader className="bg-gradient-to-r from-gray-50 to-slate-100 dark:from-gray-800 dark:to-slate-900">
                    <CardTitle className="text-xl font-bold">Sessions & Devices</CardTitle>
                    <CardDescription>Review active sessions and sign out devices you do not recognize</CardDescription>
                </CardHeader>
                <CardContent className="p-6 space-y-5">
                    <form onSubmit={revokeOtherSessions} className="space-y-3">
                        <div>
                            <InputLabel htmlFor="revoke_other_sessions_password" value="Current Password (to sign out other devices)" className="text-sm font-semibold mb-2" />
                            <TextInput
                                id="revoke_other_sessions_password"
                                type="password"
                                value={sessionForm.data.current_password}
                                onChange={(e) => sessionForm.setData('current_password', e.target.value)}
                                className="block w-full rounded-xl"
                                placeholder="Enter current password"
                            />
                            <InputError message={(sessionForm.errors as any).current_password || (sessionForm.errors as any).revoke_other_sessions_password} className="mt-2" />
                        </div>
                        <Button type="submit" variant="secondary" disabled={sessionForm.processing}>
                            {sessionForm.processing ? 'Signing out...' : 'Sign Out Other Devices'}
                        </Button>
                    </form>

                    <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                        <div className="text-sm font-semibold mb-3">Active / Recent Sessions</div>
                        <div className="space-y-3">
                            {sessions.length === 0 && (
                                <p className="text-sm text-gray-500 dark:text-gray-400">No session records available.</p>
                            )}
                            {sessions.map((session) => (
                                <div key={session.id} className="rounded-xl border border-gray-200 dark:border-gray-700 p-4 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                                    <div className="min-w-0">
                                        <div className="flex items-center gap-2 flex-wrap">
                                            <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                                {session.is_current ? 'Current Device' : 'Device Session'}
                                            </span>
                                            {session.is_current && <span className="text-xs px-2 py-0.5 rounded-full bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300">Current</span>}
                                        </div>
                                        <p className="text-xs text-gray-600 dark:text-gray-400 mt-1 break-all">{session.user_agent || 'Unknown browser/device'}</p>
                                        <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                                            IP: {session.ip_address || 'Unknown'} · Last active: {new Date(session.last_activity_at).toLocaleString()}
                                        </p>
                                    </div>
                                    {!session.is_current && (
                                        <Button variant="danger" onClick={() => revokeSession(session.id)}>
                                            Revoke
                                        </Button>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Card className="border-0 shadow-lg border-red-200 dark:border-red-800">
                <CardHeader className="bg-gradient-to-r from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-800/20">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-red-500 rounded-xl">
                            <Trash2 className="h-5 w-5 text-white" />
                        </div>
                        <div>
                            <CardTitle className="text-xl font-bold text-red-900 dark:text-red-100">Delete Account</CardTitle>
                            <CardDescription className="text-red-700 dark:text-red-300">
                                Permanently delete your account and all associated data
                            </CardDescription>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="p-6">
                    <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl mb-4">
                        <p className="text-sm text-red-800 dark:text-red-200">
                            Once your account is deleted, all of its resources and data will be permanently deleted. 
                            Before deleting your account, please download any data or information that you wish to retain.
                        </p>
                    </div>
                    <div className="space-y-4">
                        <Button
                            variant="danger"
                            type="button"
                            onClick={() => setShowDeleteReview((v) => !v)}
                            className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 shadow-lg shadow-red-500/50 rounded-xl"
                        >
                            <Trash2 className="h-4 w-4 mr-2" />
                            {showDeleteReview ? 'Hide Deletion Review' : 'Start Deletion Review'}
                        </Button>

                        {showDeleteReview && (
                            <form onSubmit={deleteAccount} className="rounded-xl border border-red-200 dark:border-red-800 p-4 space-y-4">
                                <div className="space-y-2">
                                    <div className={`rounded-lg px-3 py-2 text-sm ${deletePrechecks.hasOwnedAccounts ? 'bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-300' : 'bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-300'}`}>
                                        {deletePrechecks.hasOwnedAccounts
                                            ? `You still own ${ownedAccounts.length} tenant account(s). Transfer ownership or delete those tenants first.`
                                            : 'No owned tenant accounts detected.'}
                                    </div>
                                    <div className={`rounded-lg px-3 py-2 text-sm ${deletePrechecks.hasMemberAccounts ? 'bg-amber-50 text-amber-700 dark:bg-amber-900/20 dark:text-amber-300' : 'bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-300'}`}>
                                        {deletePrechecks.hasMemberAccounts
                                            ? `You are still linked to ${accounts.length} tenant account(s). Leave/remove yourself from all teams before account deletion.`
                                            : 'No tenant memberships detected.'}
                                    </div>
                                </div>

                                <div>
                                    <InputLabel htmlFor="delete_account_confirmation_text" value='Type "DELETE" to confirm' className="text-sm font-semibold mb-2" />
                                    <TextInput
                                        id="delete_account_confirmation_text"
                                        value={deleteAccountForm.data.confirmation_text}
                                        onChange={(e) => deleteAccountForm.setData('confirmation_text', e.target.value)}
                                        className="block w-full rounded-xl"
                                        placeholder="DELETE"
                                        disabled={deleteBlockedByMemberships}
                                    />
                                </div>

                                <div>
                                    <InputLabel htmlFor="delete_account_password" value="Current Password" className="text-sm font-semibold mb-2" />
                                    <TextInput
                                        id="delete_account_password"
                                        type="password"
                                        value={deleteAccountForm.data.password}
                                        onChange={(e) => deleteAccountForm.setData('password', e.target.value)}
                                        className="block w-full rounded-xl"
                                        placeholder="Enter current password"
                                        disabled={deleteBlockedByMemberships}
                                    />
                                    <InputError message={(errors as any).password} className="mt-2" />
                                </div>

                                <Button
                                    type="submit"
                                    variant="danger"
                                    disabled={deleteAccountForm.processing || deleteBlockedByMemberships || !deletePrechecks.typedConfirmation || !deletePrechecks.hasPassword}
                                >
                                    {deleteAccountForm.processing ? 'Deleting...' : 'Request Account Deletion'}
                                </Button>
                            </form>
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
