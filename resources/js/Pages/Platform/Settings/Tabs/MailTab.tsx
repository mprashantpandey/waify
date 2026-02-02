import { Card, CardContent, CardHeader, CardTitle } from '@/Components/UI/Card';
import TextInput from '@/Components/TextInput';
import InputLabel from '@/Components/InputLabel';
import InputError from '@/Components/InputError';
import { Mail, Eye, EyeOff } from 'lucide-react';
import { useState } from 'react';

interface MailTabProps {
    data: any;
    setData: (key: string, value: any) => void;
    errors: any;
}

export default function MailTab({ data, setData, errors }: MailTabProps) {
    const [showPassword, setShowPassword] = useState(false);

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Mail className="h-5 w-5" />
                    Mail Configuration
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <InputLabel htmlFor="mail.driver" value="Driver" />
                        <select
                            id="mail.driver"
                            value={data.mail?.driver || 'smtp'}
                            onChange={(e) => setData('mail.driver', e.target.value)}
                            className="mt-1 w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100 dark:focus:border-indigo-500 dark:focus:ring-indigo-500"
                        >
                            <option value="smtp">SMTP</option>
                            <option value="sendmail">Sendmail</option>
                            <option value="mailgun">Mailgun</option>
                            <option value="ses">Amazon SES</option>
                            <option value="postmark">Postmark</option>
                            <option value="log">Log</option>
                        </select>
                        <InputError message={errors['mail.driver']} />
                    </div>
                    <div>
                        <InputLabel htmlFor="mail.host" value="Host" />
                        <TextInput
                            id="mail.host"
                            type="text"
                            value={data.mail?.host || ''}
                            onChange={(e) => setData('mail.host', e.target.value)}
                            className="mt-1"
                            placeholder="smtp.mailtrap.io"
                        />
                        <InputError message={errors['mail.host']} />
                    </div>
                    <div>
                        <InputLabel htmlFor="mail.port" value="Port" />
                        <TextInput
                            id="mail.port"
                            type="number"
                            value={data.mail?.port || 587}
                            onChange={(e) => setData('mail.port', parseInt(e.target.value) || 587)}
                            className="mt-1"
                        />
                        <InputError message={errors['mail.port']} />
                    </div>
                    <div>
                        <InputLabel htmlFor="mail.encryption" value="Encryption" />
                        <select
                            id="mail.encryption"
                            value={data.mail?.encryption || 'tls'}
                            onChange={(e) => setData('mail.encryption', e.target.value)}
                            className="mt-1 w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100 dark:focus:border-indigo-500 dark:focus:ring-indigo-500"
                        >
                            <option value="tls">TLS</option>
                            <option value="ssl">SSL</option>
                        </select>
                        <InputError message={errors['mail.encryption']} />
                    </div>
                    <div>
                        <InputLabel htmlFor="mail.username" value="Username" />
                        <TextInput
                            id="mail.username"
                            type="text"
                            value={data.mail?.username || ''}
                            onChange={(e) => setData('mail.username', e.target.value)}
                            className="mt-1"
                        />
                        <InputError message={errors['mail.username']} />
                    </div>
                    <div>
                        <InputLabel htmlFor="mail.password" value="Password" />
                        <div className="relative mt-1">
                            <TextInput
                                id="mail.password"
                                type={showPassword ? 'text' : 'password'}
                                value={data.mail?.password || ''}
                                onChange={(e) => setData('mail.password', e.target.value)}
                                className="pr-10"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                            >
                                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </button>
                        </div>
                        <InputError message={errors['mail.password']} />
                    </div>
                    <div>
                        <InputLabel htmlFor="mail.from_address" value="From Address" />
                        <TextInput
                            id="mail.from_address"
                            type="email"
                            value={data.mail?.from_address || ''}
                            onChange={(e) => setData('mail.from_address', e.target.value)}
                            className="mt-1"
                            placeholder="noreply@example.com"
                        />
                        <InputError message={errors['mail.from_address']} />
                    </div>
                    <div>
                        <InputLabel htmlFor="mail.from_name" value="From Name" />
                        <TextInput
                            id="mail.from_name"
                            type="text"
                            value={data.mail?.from_name || ''}
                            onChange={(e) => setData('mail.from_name', e.target.value)}
                            className="mt-1"
                            placeholder="WACP Platform"
                        />
                        <InputError message={errors['mail.from_name']} />
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}

