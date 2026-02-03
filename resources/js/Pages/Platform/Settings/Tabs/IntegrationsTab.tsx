import { Card, CardContent, CardHeader, CardTitle } from '@/Components/UI/Card';
import TextInput from '@/Components/TextInput';
import InputLabel from '@/Components/InputLabel';
import InputError from '@/Components/InputError';
import { Webhook, Key, Link as LinkIcon, Eye, EyeOff, MessageCircle } from 'lucide-react';
import { useState } from 'react';
import Button from '@/Components/UI/Button';

interface IntegrationsTabProps {
    data: any;
    setData: (key: string, value: any) => void;
    errors: any;
}

export default function IntegrationsTab({ data, setData, errors }: IntegrationsTabProps) {
    const [showApiKey, setShowApiKey] = useState(false);
    const [showMetaSecret, setShowMetaSecret] = useState(false);
    const [showSystemToken, setShowSystemToken] = useState(false);

    const generateApiKey = () => {
        const key = 'wacp_' + Array.from(crypto.getRandomValues(new Uint8Array(32)))
            .map(b => b.toString(16).padStart(2, '0'))
            .join('');
        setData('integrations.api_key', key);
    };

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Key className="h-5 w-5" />
                        API Configuration
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div>
                        <div className="flex items-center justify-between mb-2">
                            <InputLabel htmlFor="integrations.api_key" value="API Key" />
                            <Button type="button" variant="secondary" size="sm" onClick={generateApiKey}>
                                Generate New Key
                            </Button>
                        </div>
                        <div className="relative">
                            <TextInput
                                id="integrations.api_key"
                                type={showApiKey ? 'text' : 'password'}
                                value={data.integrations?.api_key || ''}
                                onChange={(e) => setData('integrations.api_key', e.target.value)}
                                className="pr-10 font-mono text-sm"
                                placeholder="wacp_..."
                            />
                            <button
                                type="button"
                                onClick={() => setShowApiKey(!showApiKey)}
                                className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                            >
                                {showApiKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </button>
                        </div>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            Use this key to authenticate API requests
                        </p>
                        <InputError message={errors['integrations.api_key']} />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <InputLabel htmlFor="integrations.api_rate_limit" value="API Rate Limit (per minute)" />
                            <TextInput
                                id="integrations.api_rate_limit"
                                type="number"
                                value={data.integrations?.api_rate_limit || 60}
                                onChange={(e) => setData('integrations.api_rate_limit', parseInt(e.target.value) || 60)}
                                className="mt-1"
                                min="10"
                            />
                            <InputError message={errors['integrations.api_rate_limit']} />
                        </div>
                        <div className="flex items-center justify-between">
                            <div>
                                <InputLabel value="Enable API" />
                                <p className="text-sm text-gray-500 dark:text-gray-400">Allow API access</p>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={data.integrations?.api_enabled || false}
                                    onChange={(e) => setData('integrations.api_enabled', e.target.checked)}
                                    className="sr-only peer"
                                />
                                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                            </label>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Webhook className="h-5 w-5" />
                        Webhook Configuration
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div>
                        <InputLabel htmlFor="integrations.webhook_url" value="Webhook Base URL" />
                        <TextInput
                            id="integrations.webhook_url"
                            type="url"
                            value={data.integrations?.webhook_url || ''}
                            onChange={(e) => setData('integrations.webhook_url', e.target.value)}
                            className="mt-1"
                            placeholder="https://api.example.com/webhooks"
                        />
                        <InputError message={errors['integrations.webhook_url']} />
                    </div>
                    <div>
                        <InputLabel htmlFor="integrations.webhook_secret" value="Webhook Secret" />
                        <TextInput
                            id="integrations.webhook_secret"
                            type="password"
                            value={data.integrations?.webhook_secret || ''}
                            onChange={(e) => setData('integrations.webhook_secret', e.target.value)}
                            className="mt-1"
                            placeholder="Secret for webhook signature verification"
                        />
                        <InputError message={errors['integrations.webhook_secret']} />
                    </div>
                    <div className="flex items-center justify-between">
                        <div>
                            <InputLabel value="Enable Webhooks" />
                            <p className="text-sm text-gray-500 dark:text-gray-400">Send webhook events to external URLs</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                            <input
                                type="checkbox"
                                checked={data.integrations?.webhooks_enabled || false}
                                onChange={(e) => setData('integrations.webhooks_enabled', e.target.checked)}
                                className="sr-only peer"
                            />
                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                        </label>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <MessageCircle className="h-5 w-5" />
                        Meta Embedded Signup
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <InputLabel value="Enable Embedded Signup" />
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                Allow tenants to connect WhatsApp using Meta's Embedded Signup flow.
                            </p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                            <input
                                type="checkbox"
                                checked={data.whatsapp?.embedded_enabled ?? false}
                                onChange={(e) => setData('whatsapp.embedded_enabled', e.target.checked)}
                                className="sr-only peer"
                            />
                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                        </label>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <InputLabel htmlFor="whatsapp.meta_app_id" value="Meta App ID" />
                            <TextInput
                                id="whatsapp.meta_app_id"
                                type="text"
                                value={data.whatsapp?.meta_app_id || ''}
                                onChange={(e) => setData('whatsapp.meta_app_id', e.target.value)}
                                className="mt-1"
                                placeholder="123456789012345"
                            />
                            <InputError message={errors['whatsapp.meta_app_id']} />
                        </div>
                        <div>
                            <InputLabel htmlFor="whatsapp.embedded_signup_config_id" value="Embedded Signup Config ID" />
                            <TextInput
                                id="whatsapp.embedded_signup_config_id"
                                type="text"
                                value={data.whatsapp?.embedded_signup_config_id || ''}
                                onChange={(e) => setData('whatsapp.embedded_signup_config_id', e.target.value)}
                                className="mt-1"
                                placeholder="Your config ID"
                            />
                            <InputError message={errors['whatsapp.embedded_signup_config_id']} />
                        </div>
                        <div>
                            <InputLabel htmlFor="whatsapp.meta_app_secret" value="Meta App Secret" />
                            <div className="relative mt-1">
                                <TextInput
                                    id="whatsapp.meta_app_secret"
                                    type={showMetaSecret ? 'text' : 'password'}
                                    value={data.whatsapp?.meta_app_secret || ''}
                                    onChange={(e) => setData('whatsapp.meta_app_secret', e.target.value)}
                                    className="pr-10"
                                    placeholder="••••••••••"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowMetaSecret(!showMetaSecret)}
                                    className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                                >
                                    {showMetaSecret ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                </button>
                            </div>
                            <InputError message={errors['whatsapp.meta_app_secret']} />
                        </div>
                        <div>
                            <InputLabel htmlFor="whatsapp.system_user_token" value="System User Token" />
                            <div className="relative mt-1">
                                <TextInput
                                    id="whatsapp.system_user_token"
                                    type={showSystemToken ? 'text' : 'password'}
                                    value={data.whatsapp?.system_user_token || ''}
                                    onChange={(e) => setData('whatsapp.system_user_token', e.target.value)}
                                    className="pr-10"
                                    placeholder="EAAB..."
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowSystemToken(!showSystemToken)}
                                    className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                                >
                                    {showSystemToken ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                </button>
                            </div>
                            <InputError message={errors['whatsapp.system_user_token']} />
                        </div>
                        <div>
                            <InputLabel htmlFor="whatsapp.api_version" value="Graph API Version" />
                            <TextInput
                                id="whatsapp.api_version"
                                type="text"
                                value={data.whatsapp?.api_version || 'v21.0'}
                                onChange={(e) => setData('whatsapp.api_version', e.target.value)}
                                className="mt-1"
                                placeholder="v21.0"
                            />
                            <InputError message={errors['whatsapp.api_version']} />
                        </div>
                    </div>
                </CardContent>
            </Card>

        </div>
    );
}
