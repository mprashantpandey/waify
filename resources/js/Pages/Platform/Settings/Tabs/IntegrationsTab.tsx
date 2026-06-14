import { useState } from 'react';
import { Check, Copy, Eye, EyeOff, Key, MessageCircle, RotateCcw, Webhook } from 'lucide-react';
import Button from '@/Components/UI/Button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/Components/UI/Card';
import { Input } from '@/Components/UI/Input';
import { Label } from '@/Components/UI/Label';
import { Switch } from '@/Components/UI/Switch';

interface IntegrationsTabProps {
    data: any;
    setData: (key: string, value: any) => void;
    errors: Record<string, string>;
}

function FieldError({ message }: { message?: string }) {
    if (!message) return null;

    return <p className="mt-1 text-sm text-red-600 dark:text-red-300">{message}</p>;
}

function SecretInput({
    id,
    value,
    onChange,
    placeholder,
}: {
    id: string;
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
}) {
    const [visible, setVisible] = useState(false);

    return (
        <div className="relative">
            <Input
                id={id}
                type={visible ? 'text' : 'password'}
                value={value}
                onChange={(event) => onChange(event.target.value)}
                className="pr-10 font-mono"
                placeholder={placeholder}
            />
            <button
                type="button"
                onClick={() => setVisible((current) => !current)}
                className="absolute right-2 top-1/2 rounded-btn p-1 text-waify-text-muted transition hover:bg-gray-100 hover:text-waify-text dark:text-waify-dark-text-muted dark:hover:bg-waify-dark-surface-2 dark:hover:text-waify-dark-text"
                aria-label={visible ? 'Hide secret' : 'Show secret'}
            >
                {visible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
        </div>
    );
}

export default function IntegrationsTab({ data, setData, errors }: IntegrationsTabProps) {
    const integrations = data.integrations || {};
    const whatsapp = data.whatsapp || {};
    const [copied, setCopied] = useState<string | null>(null);

    const generateApiKey = () => {
        const key = `wacp_${Array.from(crypto.getRandomValues(new Uint8Array(32)))
            .map((byte) => byte.toString(16).padStart(2, '0'))
            .join('')}`;
        setData('integrations.api_key', key);
    };

    const generateWebhookVerifyToken = () => {
        const token = `waify_${Array.from(crypto.getRandomValues(new Uint8Array(24)))
            .map((byte) => byte.toString(16).padStart(2, '0'))
            .join('')}`;
        setData('whatsapp.central_webhook_verify_token', token);
    };

    const copyValue = async (key: string, value?: string) => {
        if (!value || typeof navigator === 'undefined' || !navigator.clipboard) return;

        await navigator.clipboard.writeText(value);
        setCopied(key);
        window.setTimeout(() => setCopied((current) => (current === key ? null : current)), 1500);
    };

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Key className="h-5 w-5" />
                        Google OAuth
                    </CardTitle>
                    <CardDescription>Client used for Google login and future Google Calendar, Sheets, and Drive integrations.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex items-center justify-between gap-4 rounded-card border border-gray-100 p-4 dark:border-waify-dark-border">
                        <div>
                            <p className="text-sm font-semibold text-waify-text dark:text-waify-dark-text">Enable Google login</p>
                            <p className="mt-1 text-sm text-waify-text-muted dark:text-waify-dark-text-muted">
                                When enabled, users can sign in or create an account with Google OAuth.
                            </p>
                        </div>
                        <Switch checked={integrations.google_oauth_enabled || false} onCheckedChange={(checked) => setData('integrations.google_oauth_enabled', checked)} />
                    </div>

                    <div className="grid gap-4 md:grid-cols-2">
                        <div>
                            <Label htmlFor="integrations.google_client_id">Google Client ID</Label>
                            <Input
                                id="integrations.google_client_id"
                                value={integrations.google_client_id || ''}
                                onChange={(event) => setData('integrations.google_client_id', event.target.value)}
                                placeholder="000000000000-xxxx.apps.googleusercontent.com"
                            />
                            <FieldError message={errors['integrations.google_client_id']} />
                        </div>
                        <div>
                            <Label htmlFor="integrations.google_client_secret">Google Client Secret</Label>
                            <SecretInput
                                id="integrations.google_client_secret"
                                value={integrations.google_client_secret || ''}
                                onChange={(value) => setData('integrations.google_client_secret', value)}
                                placeholder="Google OAuth client secret"
                            />
                            <FieldError message={errors['integrations.google_client_secret']} />
                        </div>
                    </div>

                        <div className="grid gap-3 rounded-card border border-blue-100 bg-blue-50/70 p-4 dark:border-blue-400/20 dark:bg-blue-400/10">
                            <div className="flex flex-wrap items-start justify-between gap-3">
                                <div>
                                    <p className="text-sm font-semibold text-waify-text dark:text-waify-dark-text">Authorized redirect URIs</p>
                                    <p className="mt-1 text-sm text-waify-text-muted dark:text-waify-dark-text-muted">
                                        Add every URL below in Google Cloud Console for the OAuth web client.
                                    </p>
                                </div>
                                <Button type="button" variant="secondary" size="sm" onClick={() => copyValue('google-redirect', integrations.google_redirect_url)}>
                                {copied === 'google-redirect' ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                                {copied === 'google-redirect' ? 'Copied' : 'Copy'}
                                </Button>
                            </div>
                            <div className="space-y-2">
                                <div className="rounded-btn border border-blue-100 bg-white p-3 dark:border-blue-400/20 dark:bg-waify-dark-surface">
                                    <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-waify-text-muted dark:text-waify-dark-text-muted">Google login</p>
                                    <p className="break-all font-mono text-sm text-waify-text dark:text-waify-dark-text">{integrations.google_redirect_url || 'Save platform URL first'}</p>
                                </div>
                                {Object.entries(integrations.google_integration_redirect_urls || {}).map(([label, url]) => (
                                    <div key={label} className="flex flex-col gap-2 rounded-btn border border-blue-100 bg-white p-3 dark:border-blue-400/20 dark:bg-waify-dark-surface sm:flex-row sm:items-start sm:justify-between">
                                        <div className="min-w-0">
                                            <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-waify-text-muted dark:text-waify-dark-text-muted">{label}</p>
                                            <p className="break-all font-mono text-sm text-waify-text dark:text-waify-dark-text">{String(url)}</p>
                                        </div>
                                        <Button type="button" variant="secondary" size="sm" onClick={() => copyValue(`google-${label}`, String(url))}>
                                            {copied === `google-${label}` ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                                            {copied === `google-${label}` ? 'Copied' : 'Copy'}
                                        </Button>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="grid gap-3 rounded-card border border-blue-100 bg-blue-50/70 p-4 dark:border-blue-400/20 dark:bg-blue-400/10">
                            <div className="flex flex-wrap items-start justify-between gap-3">
                                <div>
                                    <p className="text-sm font-semibold text-waify-text dark:text-waify-dark-text">Facebook Login redirect URI</p>
                                    <p className="mt-1 text-sm text-waify-text-muted dark:text-waify-dark-text-muted">
                                        Add this URL in the Meta app's Facebook Login settings for Meta Leads OAuth.
                                    </p>
                                </div>
                                <Button type="button" variant="secondary" size="sm" onClick={() => copyValue('facebook-redirect', integrations.facebook_redirect_url)}>
                                    {copied === 'facebook-redirect' ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                                    {copied === 'facebook-redirect' ? 'Copied' : 'Copy'}
                                </Button>
                            </div>
                            <div className="break-all rounded-btn border border-blue-100 bg-white px-3 py-2 font-mono text-sm text-waify-text dark:border-blue-400/20 dark:bg-waify-dark-surface dark:text-waify-dark-text">
                                {integrations.facebook_redirect_url || 'Save platform URL first'}
                            </div>
                        </div>

                        <div className="grid gap-3 rounded-card border border-blue-100 bg-blue-50/70 p-4 dark:border-blue-400/20 dark:bg-blue-400/10">
                            <div className="flex flex-wrap items-start justify-between gap-3">
                                <div>
                                    <p className="text-sm font-semibold text-waify-text dark:text-waify-dark-text">Meta Lead Ads webhook callback URL</p>
                                    <p className="mt-1 text-sm text-waify-text-muted dark:text-waify-dark-text-muted">
                                        Configure this once in the Meta app Webhooks product for leadgen events. Workspaces do not need their own callback URL.
                                    </p>
                                </div>
                                <Button type="button" variant="secondary" size="sm" onClick={() => copyValue('meta-leads-webhook', integrations.meta_leads_webhook_url)}>
                                    {copied === 'meta-leads-webhook' ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                                    {copied === 'meta-leads-webhook' ? 'Copied' : 'Copy'}
                                </Button>
                            </div>
                            <div className="break-all rounded-btn border border-blue-100 bg-white px-3 py-2 font-mono text-sm text-waify-text dark:border-blue-400/20 dark:bg-waify-dark-surface dark:text-waify-dark-text">
                                {integrations.meta_leads_webhook_url || 'Save platform URL first'}
                            </div>
                        </div>
                    </CardContent>
                </Card>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Key className="h-5 w-5" />
                        Public API
                    </CardTitle>
                    <CardDescription>Global API access gate used by public API middleware. Workspace keys are managed from Developer tools.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex items-center justify-between gap-4 rounded-card border border-gray-100 p-4 dark:border-waify-dark-border">
                        <div>
                            <p className="text-sm font-semibold text-waify-text dark:text-waify-dark-text">Enable platform API access</p>
                            <p className="mt-1 text-sm text-waify-text-muted dark:text-waify-dark-text-muted">Requests are still validated by API-key middleware.</p>
                        </div>
                        <Switch checked={integrations.api_enabled || false} onCheckedChange={(checked) => setData('integrations.api_enabled', checked)} />
                    </div>

                    <div>
                        <div className="mb-2 flex items-center justify-between gap-3">
                            <Label htmlFor="integrations.api_key">Platform API Key</Label>
                            <Button type="button" variant="secondary" size="sm" onClick={generateApiKey}>
                                <RotateCcw className="h-4 w-4" />
                                Generate
                            </Button>
                        </div>
                        <SecretInput
                            id="integrations.api_key"
                            value={integrations.api_key || ''}
                            onChange={(value) => setData('integrations.api_key', value)}
                            placeholder="wacp_..."
                        />
                        <FieldError message={errors['integrations.api_key']} />
                    </div>

                    <div>
                        <Label htmlFor="integrations.api_rate_limit">API Rate Limit Per Minute</Label>
                        <Input
                            id="integrations.api_rate_limit"
                            type="number"
                            value={integrations.api_rate_limit || 60}
                            onChange={(event) => setData('integrations.api_rate_limit', parseInt(event.target.value, 10) || 60)}
                            min="10"
                        />
                        <FieldError message={errors['integrations.api_rate_limit']} />
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Webhook className="h-5 w-5" />
                        Incoming Webhook Processing
                    </CardTitle>
                    <CardDescription>Controls whether platform webhook endpoints process requests such as Meta callbacks and Razorpay events.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex items-center justify-between gap-4 rounded-card border border-gray-100 p-4 dark:border-waify-dark-border">
                        <div>
                            <p className="text-sm font-semibold text-waify-text dark:text-waify-dark-text">Accept incoming webhooks</p>
                            <p className="mt-1 text-sm text-waify-text-muted dark:text-waify-dark-text-muted">
                                This does not configure customer outbound webhooks. Workspace outbound webhooks live in Developer tools.
                            </p>
                        </div>
                        <Switch checked={integrations.webhooks_enabled ?? true} onCheckedChange={(checked) => setData('integrations.webhooks_enabled', checked)} />
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <MessageCircle className="h-5 w-5" />
                        Meta WhatsApp Provider
                    </CardTitle>
                    <CardDescription>Provider-level Meta configuration used by embedded signup, central webhook verification, and signed event delivery.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid gap-3 rounded-card border border-emerald-100 bg-emerald-50/70 p-4 dark:border-emerald-400/20 dark:bg-emerald-400/10">
                        <div className="flex flex-wrap items-start justify-between gap-3">
                            <div>
                                <p className="text-sm font-semibold text-waify-text dark:text-waify-dark-text">Meta webhook callback URL</p>
                                <p className="mt-1 text-sm text-waify-text-muted dark:text-waify-dark-text-muted">
                                    Use this URL in Meta App Dashboard for WhatsApp provider webhooks. It handles both verification and incoming webhook events.
                                </p>
                            </div>
                            <Button type="button" variant="secondary" size="sm" onClick={() => copyValue('webhook-url', whatsapp.central_webhook_url)}>
                                {copied === 'webhook-url' ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                                {copied === 'webhook-url' ? 'Copied' : 'Copy'}
                            </Button>
                        </div>
                        <div className="break-all rounded-btn border border-emerald-100 bg-white px-3 py-2 font-mono text-sm text-waify-text dark:border-emerald-400/20 dark:bg-waify-dark-surface dark:text-waify-dark-text">
                            {whatsapp.central_webhook_url || 'Save platform URL first'}
                        </div>
                    </div>

                    <div className="grid gap-4 md:grid-cols-[minmax(0,1fr)_auto] md:items-end">
                        <div>
                            <Label htmlFor="whatsapp.central_webhook_verify_token">Meta Webhook Verify Token</Label>
                            <SecretInput
                                id="whatsapp.central_webhook_verify_token"
                                value={whatsapp.central_webhook_verify_token || ''}
                                onChange={(value) => setData('whatsapp.central_webhook_verify_token', value)}
                                placeholder="Custom verify token used in Meta webhook setup"
                            />
                            <p className="mt-1 text-xs text-waify-text-muted dark:text-waify-dark-text-muted">
                                Enter the same value in Meta's Verify Token field. POST signature validation uses the Meta App Secret below.
                            </p>
                            <FieldError message={errors['whatsapp.central_webhook_verify_token']} />
                        </div>
                        <div className="flex gap-2">
                            <Button type="button" variant="secondary" onClick={generateWebhookVerifyToken}>
                                <RotateCcw className="h-4 w-4" />
                                Generate
                            </Button>
                            <Button type="button" variant="secondary" onClick={() => copyValue('verify-token', whatsapp.central_webhook_verify_token)}>
                                {copied === 'verify-token' ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                                {copied === 'verify-token' ? 'Copied' : 'Copy'}
                            </Button>
                        </div>
                    </div>

                    <div className="flex items-center justify-between gap-4 rounded-card border border-gray-100 p-4 dark:border-waify-dark-border">
                        <div>
                            <p className="text-sm font-semibold text-waify-text dark:text-waify-dark-text">Enable Embedded Signup</p>
                            <p className="mt-1 text-sm text-waify-text-muted dark:text-waify-dark-text-muted">
                                Allows workspaces to connect WhatsApp using Meta's embedded signup flow. The OAuth code/token returned by Meta is used for setup; no system user token is required.
                            </p>
                        </div>
                        <Switch checked={whatsapp.embedded_enabled ?? false} onCheckedChange={(checked) => setData('whatsapp.embedded_enabled', checked)} />
                    </div>

                    <div className="rounded-card border border-amber-200 bg-amber-50/80 p-4 dark:border-amber-400/20 dark:bg-amber-400/10">
                        <p className="text-sm font-semibold text-waify-text dark:text-waify-dark-text">Meta app domain requirement</p>
                        <p className="mt-1 text-sm text-waify-text-muted dark:text-waify-dark-text-muted">
                            In Meta App Dashboard, add this domain under App Domains and configure the Website platform URL. Embedded signup opens from the browser origin, so Meta rejects any domain that is missing there.
                        </p>
                        <div className="mt-3 rounded-btn border border-amber-100 bg-white px-3 py-2 font-mono text-sm text-waify-text dark:border-amber-400/20 dark:bg-waify-dark-surface dark:text-waify-dark-text">
                            {whatsapp.app_domain || 'Set General > Platform URL first'}
                        </div>
                        {whatsapp.app_domain && !String(whatsapp.app_domain).startsWith('www.') ? (
                            <p className="mt-2 text-xs text-waify-text-muted dark:text-waify-dark-text-muted">
                                Also add www.{whatsapp.app_domain} if users can open the app on the www subdomain.
                            </p>
                        ) : null}
                    </div>

                    <div className="grid gap-4 md:grid-cols-2">
                        <div>
                            <Label htmlFor="whatsapp.meta_app_id">Meta App ID</Label>
                            <Input
                                id="whatsapp.meta_app_id"
                                value={whatsapp.meta_app_id || ''}
                                onChange={(event) => setData('whatsapp.meta_app_id', event.target.value)}
                                placeholder="123456789012345"
                            />
                            <FieldError message={errors['whatsapp.meta_app_id']} />
                        </div>
                        <div>
                            <Label htmlFor="whatsapp.embedded_signup_config_id">Embedded Signup Config ID</Label>
                            <Input
                                id="whatsapp.embedded_signup_config_id"
                                value={whatsapp.embedded_signup_config_id || ''}
                                onChange={(event) => setData('whatsapp.embedded_signup_config_id', event.target.value)}
                                placeholder="Your config ID"
                            />
                            <FieldError message={errors['whatsapp.embedded_signup_config_id']} />
                        </div>
                        <div>
                            <Label htmlFor="whatsapp.coexistence_signup_config_id">Co-existence Config Override</Label>
                            <Input
                                id="whatsapp.coexistence_signup_config_id"
                                value={whatsapp.coexistence_signup_config_id || ''}
                                onChange={(event) => setData('whatsapp.coexistence_signup_config_id', event.target.value)}
                                placeholder="Leave blank to use Embedded Signup Config ID"
                            />
                            <FieldError message={errors['whatsapp.coexistence_signup_config_id']} />
                        </div>
                        <div>
                            <Label htmlFor="whatsapp.meta_app_secret">Meta App Secret</Label>
                            <SecretInput
                                id="whatsapp.meta_app_secret"
                                value={whatsapp.meta_app_secret || ''}
                                onChange={(value) => setData('whatsapp.meta_app_secret', value)}
                                placeholder="Meta app secret"
                            />
                            <FieldError message={errors['whatsapp.meta_app_secret']} />
                        </div>
                        <div>
                            <Label htmlFor="whatsapp.api_version">Graph API Version</Label>
                            <Input
                                id="whatsapp.api_version"
                                value={whatsapp.api_version || 'v25.0'}
                                onChange={(event) => setData('whatsapp.api_version', event.target.value)}
                                placeholder="v25.0"
                            />
                            <FieldError message={errors['whatsapp.api_version']} />
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
