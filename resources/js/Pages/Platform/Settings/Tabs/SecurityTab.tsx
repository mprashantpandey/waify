import { Card, CardContent, CardHeader, CardTitle } from '@/Components/UI/Card';
import TextInput from '@/Components/TextInput';
import InputLabel from '@/Components/InputLabel';
import InputError from '@/Components/InputError';
import { Shield, Lock, Timer, Ban } from 'lucide-react';

interface SecurityTabProps {
    data: any;
    setData: (key: string, value: any) => void;
    errors: any;
}

export default function SecurityTab({ data, setData, errors }: SecurityTabProps) {
    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Lock className="h-5 w-5" />
                        Password Policies
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <InputLabel htmlFor="security.password_min_length" value="Minimum Length" />
                            <TextInput
                                id="security.password_min_length"
                                type="number"
                                value={data.security?.password_min_length || 8}
                                onChange={(e) => setData('security.password_min_length', parseInt(e.target.value) || 8)}
                                className="mt-1"
                                min="6"
                                max="128"
                            />
                            <InputError message={errors['security.password_min_length']} />
                        </div>
                        <div>
                            <InputLabel htmlFor="security.password_max_length" value="Maximum Length" />
                            <TextInput
                                id="security.password_max_length"
                                type="number"
                                value={data.security?.password_max_length || 128}
                                onChange={(e) => setData('security.password_max_length', parseInt(e.target.value) || 128)}
                                className="mt-1"
                                min="8"
                                max="128"
                            />
                            <InputError message={errors['security.password_max_length']} />
                        </div>
                    </div>
                    <div className="space-y-3">
                        <div className="flex items-center justify-between">
                            <div>
                                <InputLabel value="Require Uppercase Letters" />
                                <p className="text-sm text-gray-500 dark:text-gray-400">Passwords must contain at least one uppercase letter</p>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={data.security?.password_require_uppercase || false}
                                    onChange={(e) => setData('security.password_require_uppercase', e.target.checked)}
                                    className="sr-only peer"
                                />
                                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                            </label>
                        </div>
                        <div className="flex items-center justify-between">
                            <div>
                                <InputLabel value="Require Lowercase Letters" />
                                <p className="text-sm text-gray-500 dark:text-gray-400">Passwords must contain at least one lowercase letter</p>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={data.security?.password_require_lowercase || false}
                                    onChange={(e) => setData('security.password_require_lowercase', e.target.checked)}
                                    className="sr-only peer"
                                />
                                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                            </label>
                        </div>
                        <div className="flex items-center justify-between">
                            <div>
                                <InputLabel value="Require Numbers" />
                                <p className="text-sm text-gray-500 dark:text-gray-400">Passwords must contain at least one number</p>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={data.security?.password_require_numbers || false}
                                    onChange={(e) => setData('security.password_require_numbers', e.target.checked)}
                                    className="sr-only peer"
                                />
                                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                            </label>
                        </div>
                        <div className="flex items-center justify-between">
                            <div>
                                <InputLabel value="Require Special Characters" />
                                <p className="text-sm text-gray-500 dark:text-gray-400">Passwords must contain at least one special character</p>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={data.security?.password_require_symbols || false}
                                    onChange={(e) => setData('security.password_require_symbols', e.target.checked)}
                                    className="sr-only peer"
                                />
                                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                            </label>
                        </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <InputLabel htmlFor="security.password_expiry_days" value="Password Expiry (Days)" />
                            <TextInput
                                id="security.password_expiry_days"
                                type="number"
                                value={data.security?.password_expiry_days || 0}
                                onChange={(e) => setData('security.password_expiry_days', parseInt(e.target.value) || 0)}
                                className="mt-1"
                                min="0"
                                placeholder="0 = Never expire"
                            />
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">0 means passwords never expire</p>
                            <InputError message={errors['security.password_expiry_days']} />
                        </div>
                        <div>
                            <InputLabel htmlFor="security.password_history_count" value="Password History Count" />
                            <TextInput
                                id="security.password_history_count"
                                type="number"
                                value={data.security?.password_history_count || 0}
                                onChange={(e) => setData('security.password_history_count', parseInt(e.target.value) || 0)}
                                className="mt-1"
                                min="0"
                                max="10"
                            />
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Prevent reuse of last N passwords</p>
                            <InputError message={errors['security.password_history_count']} />
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Shield className="h-5 w-5" />
                        Authentication & Access
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <InputLabel value="Require Two-Factor Authentication" />
                            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                                Force all users to enable 2FA
                            </p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                            <input
                                type="checkbox"
                                checked={data.security?.require_2fa || false}
                                onChange={(e) => setData('security.require_2fa', e.target.checked)}
                                className="sr-only peer"
                            />
                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                        </label>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <InputLabel htmlFor="security.session_timeout" value="Session Timeout (Minutes)" />
                            <TextInput
                                id="security.session_timeout"
                                type="number"
                                value={data.security?.session_timeout || 120}
                                onChange={(e) => setData('security.session_timeout', parseInt(e.target.value) || 120)}
                                className="mt-1"
                                min="5"
                                max="1440"
                            />
                            <InputError message={errors['security.session_timeout']} />
                        </div>
                        <div>
                            <InputLabel htmlFor="security.max_login_attempts" value="Max Login Attempts" />
                            <TextInput
                                id="security.max_login_attempts"
                                type="number"
                                value={data.security?.max_login_attempts || 5}
                                onChange={(e) => setData('security.max_login_attempts', parseInt(e.target.value) || 5)}
                                className="mt-1"
                                min="3"
                                max="10"
                            />
                            <InputError message={errors['security.max_login_attempts']} />
                        </div>
                        <div>
                            <InputLabel htmlFor="security.lockout_duration" value="Lockout Duration (Minutes)" />
                            <TextInput
                                id="security.lockout_duration"
                                type="number"
                                value={data.security?.lockout_duration || 15}
                                onChange={(e) => setData('security.lockout_duration', parseInt(e.target.value) || 15)}
                                className="mt-1"
                                min="1"
                                max="1440"
                            />
                            <InputError message={errors['security.lockout_duration']} />
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Ban className="h-5 w-5" />
                        Rate Limiting
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <InputLabel htmlFor="security.api_rate_limit" value="API Rate Limit (per minute)" />
                            <TextInput
                                id="security.api_rate_limit"
                                type="number"
                                value={data.security?.api_rate_limit || 60}
                                onChange={(e) => setData('security.api_rate_limit', parseInt(e.target.value) || 60)}
                                className="mt-1"
                                min="10"
                            />
                            <InputError message={errors['security.api_rate_limit']} />
                        </div>
                        <div>
                            <InputLabel htmlFor="security.web_rate_limit" value="Web Rate Limit (per minute)" />
                            <TextInput
                                id="security.web_rate_limit"
                                type="number"
                                value={data.security?.web_rate_limit || 120}
                                onChange={(e) => setData('security.web_rate_limit', parseInt(e.target.value) || 120)}
                                className="mt-1"
                                min="10"
                            />
                            <InputError message={errors['security.web_rate_limit']} />
                        </div>
                    </div>
                    <div>
                        <InputLabel htmlFor="security.ip_whitelist" value="IP Whitelist (comma-separated)" />
                        <TextInput
                            id="security.ip_whitelist"
                            type="text"
                            value={data.security?.ip_whitelist || ''}
                            onChange={(e) => setData('security.ip_whitelist', e.target.value)}
                            className="mt-1"
                            placeholder="192.168.1.1, 10.0.0.0/8"
                        />
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Leave empty to allow all IPs</p>
                        <InputError message={errors['security.ip_whitelist']} />
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}

