import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/Components/UI/Card';
import { Label } from '@/Components/UI/Label';
import TextInput from '@/Components/TextInput';
import InputError from '@/Components/InputError';
import { MessageSquare, Eye, EyeOff, ExternalLink } from 'lucide-react';
import { useState } from 'react';

interface SmsTabProps {
    data: any;
    setData: (key: string, value: any) => void;
    errors: Record<string, any>;
}

const TWILIO_VERIFY_DOCS = 'https://www.twilio.com/docs/verify/api';
const MSG91_OTP_DOCS = 'https://docs.msg91.com/otp/sendotp';

export default function SmsTab({ data, setData, errors }: SmsTabProps) {
    const sms = data.sms ?? {};
    const [showTwilioToken, setShowTwilioToken] = useState(false);
    const [showMsg91Authkey, setShowMsg91Authkey] = useState(false);
    const provider = sms.provider ?? '';

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <MessageSquare className="h-5 w-5" />
                        SMS provider (2FA & OTP)
                    </CardTitle>
                    <CardDescription>
                        Choose an SMS provider to send verification codes (e.g. phone verification, 2FA OTP). When disabled, OTP may be sent via email fallback only.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div>
                        <Label htmlFor="sms.provider">Provider</Label>
                        <select
                            id="sms.provider"
                            value={provider}
                            onChange={(e) => setData('sms', { ...sms, provider: e.target.value })}
                            className="mt-1 w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100 max-w-xs"
                        >
                            <option value="">None (email fallback only)</option>
                            <option value="twilio_verify">Twilio Verify (2FA / OTP)</option>
                            <option value="msg91">MSG91 (OTP)</option>
                        </select>
                        <InputError message={errors['sms.provider']} />
                    </div>

                    {/* Twilio Verify */}
                    {provider === 'twilio_verify' && (
                        <div className="rounded-xl border border-gray-200 dark:border-gray-700 p-4 space-y-4 bg-gray-50/50 dark:bg-gray-900/30">
                            <div className="flex items-center justify-between">
                                <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">Twilio Verify</h3>
                                <a
                                    href={TWILIO_VERIFY_DOCS}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline inline-flex items-center gap-1"
                                >
                                    API docs <ExternalLink className="h-3 w-3" />
                                </a>
                            </div>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                                Uses Verify API v2: create a Verification Service in Twilio Console, then send SMS via Verifications and check via VerificationCheck. Base URL: <code className="bg-gray-200 dark:bg-gray-700 px-1 rounded">https://verify.twilio.com/v2/</code>
                            </p>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <Label htmlFor="sms.twilio_account_sid">Account SID</Label>
                                    <TextInput
                                        id="sms.twilio_account_sid"
                                        value={sms.twilio_account_sid ?? ''}
                                        onChange={(e) => setData('sms', { ...sms, twilio_account_sid: e.target.value })}
                                        placeholder="ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                                        className="mt-1 font-mono text-sm"
                                    />
                                    <InputError message={errors['sms.twilio_account_sid']} />
                                </div>
                                <div>
                                    <Label htmlFor="sms.twilio_auth_token">Auth Token</Label>
                                    <div className="relative mt-1">
                                        <TextInput
                                            id="sms.twilio_auth_token"
                                            type={showTwilioToken ? 'text' : 'password'}
                                            value={sms.twilio_auth_token ?? ''}
                                            onChange={(e) => setData('sms', { ...sms, twilio_auth_token: e.target.value })}
                                            placeholder="••••••••"
                                            className="pr-10 font-mono text-sm"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowTwilioToken((v) => !v)}
                                            className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-gray-500 hover:text-gray-700 dark:hover:text-gray-400"
                                            aria-label={showTwilioToken ? 'Hide token' : 'Show token'}
                                        >
                                            {showTwilioToken ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                        </button>
                                    </div>
                                    <InputError message={errors['sms.twilio_auth_token']} />
                                </div>
                                <div className="md:col-span-2">
                                    <Label htmlFor="sms.twilio_verify_service_sid">Verify Service SID</Label>
                                    <TextInput
                                        id="sms.twilio_verify_service_sid"
                                        value={sms.twilio_verify_service_sid ?? ''}
                                        onChange={(e) => setData('sms', { ...sms, twilio_verify_service_sid: e.target.value })}
                                        placeholder="VAxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                                        className="mt-1 font-mono text-sm max-w-md"
                                    />
                                    <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                                        Create in Twilio Console → Verify → Services, or via Verify API Create Service.
                                    </p>
                                    <InputError message={errors['sms.twilio_verify_service_sid']} />
                                </div>
                            </div>
                        </div>
                    )}

                    {/* MSG91 */}
                    {provider === 'msg91' && (
                        <div className="rounded-xl border border-gray-200 dark:border-gray-700 p-4 space-y-4 bg-gray-50/50 dark:bg-gray-900/30">
                            <div className="flex items-center justify-between">
                                <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">MSG91</h3>
                                <a
                                    href={MSG91_OTP_DOCS}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline inline-flex items-center gap-1"
                                >
                                    SendOTP docs <ExternalLink className="h-3 w-3" />
                                </a>
                            </div>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                                MSG91 Send OTP API: authkey and mobile (E.164). Optional: sender, otp, otp_expiry, otp_length. Endpoint: <code className="bg-gray-200 dark:bg-gray-700 px-1 rounded">https://api.msg91.com/api/sendotp.php</code> or use the newer POST SendOTP from docs.
                            </p>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <Label htmlFor="sms.msg91_authkey">Auth key</Label>
                                    <div className="relative mt-1">
                                        <TextInput
                                            id="sms.msg91_authkey"
                                            type={showMsg91Authkey ? 'text' : 'password'}
                                            value={sms.msg91_authkey ?? ''}
                                            onChange={(e) => setData('sms', { ...sms, msg91_authkey: e.target.value })}
                                            placeholder="Your MSG91 authentication key"
                                            className="pr-10"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowMsg91Authkey((v) => !v)}
                                            className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-gray-500 hover:text-gray-700 dark:hover:text-gray-400"
                                            aria-label={showMsg91Authkey ? 'Hide' : 'Show'}
                                        >
                                            {showMsg91Authkey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                        </button>
                                    </div>
                                    <InputError message={errors['sms.msg91_authkey']} />
                                </div>
                                <div>
                                    <Label htmlFor="sms.msg91_sender_id">Sender ID</Label>
                                    <TextInput
                                        id="sms.msg91_sender_id"
                                        value={sms.msg91_sender_id ?? 'SMSIND'}
                                        onChange={(e) => setData('sms', { ...sms, msg91_sender_id: e.target.value })}
                                        placeholder="SMSIND"
                                        className="mt-1 max-w-[140px]"
                                    />
                                    <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">Max 11 chars; shown to recipient.</p>
                                    <InputError message={errors['sms.msg91_sender_id']} />
                                </div>
                                <div>
                                    <Label htmlFor="sms.msg91_otp_expiry_minutes">OTP expiry (minutes)</Label>
                                    <TextInput
                                        id="sms.msg91_otp_expiry_minutes"
                                        type="number"
                                        min={1}
                                        max={1440}
                                        value={sms.msg91_otp_expiry_minutes ?? 10}
                                        onChange={(e) => setData('sms', { ...sms, msg91_otp_expiry_minutes: parseInt(e.target.value, 10) || 10 })}
                                        className="mt-1 w-24"
                                    />
                                    <InputError message={errors['sms.msg91_otp_expiry_minutes']} />
                                </div>
                                <div>
                                    <Label htmlFor="sms.msg91_otp_length">OTP length (digits)</Label>
                                    <select
                                        id="sms.msg91_otp_length"
                                        value={sms.msg91_otp_length ?? 6}
                                        onChange={(e) => setData('sms', { ...sms, msg91_otp_length: parseInt(e.target.value, 10) })}
                                        className="mt-1 rounded-md border-gray-300 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100 w-24"
                                    >
                                        {[4, 5, 6, 7, 8, 9].map((n) => (
                                            <option key={n} value={n}>{n}</option>
                                        ))}
                                    </select>
                                    <InputError message={errors['sms.msg91_otp_length']} />
                                </div>
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
