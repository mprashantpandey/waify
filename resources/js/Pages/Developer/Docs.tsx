import { Head, Link } from '@inertiajs/react';
import AppShell from '@/Layouts/AppShell';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/Components/UI/Card';
import { Code2, BookOpen, ArrowLeft, Key, Terminal } from 'lucide-react';

interface Endpoint {
    method: string;
    path: string;
    summary: string;
    description: string;
    auth: boolean;
    scope?: string;
    example: string;
}

export default function DeveloperDocs({
    account,
    base_url,
    endpoints,
    available_scopes = [],
    webhook_event_keys = [],
    webhook_sample_payloads = {},
    webhook_signature_example = null,
}: {
    account: any;
    base_url: string;
    endpoints: Endpoint[];
    available_scopes?: string[];
    webhook_event_keys?: string[];
    webhook_sample_payloads?: Record<string, any>;
    webhook_signature_example?: {
        timestamp_header: string;
        signature_header: string;
        signature_format: string;
        algorithm: string;
        canonical_input: string;
    } | null;
}) {
    const methodColors: Record<string, string> = {
        GET: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
        POST: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
        PUT: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300',
        PATCH: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300',
        DELETE: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
    };

    return (
        <AppShell>
            <Head title="API documentation" />
            <div className="space-y-6 max-w-4xl">
                <div className="flex items-center gap-4">
                    <Link
                        href={route('app.developer.index')}
                        className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 flex items-center gap-1 text-sm"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        Back to Developer
                    </Link>
                </div>
                <div>
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-gray-100 dark:to-gray-300 bg-clip-text text-transparent flex items-center gap-3">
                        <BookOpen className="h-8 w-8 text-indigo-500" />
                        API documentation
                    </h1>
                    <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                        Reference for the Waify external API. Use your API key to authenticate requests.
                    </p>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Terminal className="h-5 w-5" />
                            Base URL
                        </CardTitle>
                        <CardDescription>
                            All endpoints are relative to this base URL.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <code className="block rounded-lg bg-gray-900 text-gray-100 dark:bg-gray-800 px-4 py-3 font-mono text-sm">
                            {base_url}
                        </code>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Key className="h-5 w-5" />
                            Authentication
                        </CardTitle>
                        <CardDescription>
                            Include your API key in every request. Create and manage keys on the Developer page.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        <p className="text-sm text-gray-700 dark:text-gray-300">
                            <strong>Option 1 – Bearer token (recommended)</strong>
                        </p>
                        <pre className="rounded-lg bg-gray-900 text-gray-100 dark:bg-gray-800 p-4 text-sm overflow-x-auto">
{`Authorization: Bearer wfy_your_api_key_here`}
                        </pre>
                        <p className="text-sm text-gray-700 dark:text-gray-300 mt-4">
                            <strong>Option 2 – X-API-Key header</strong>
                        </p>
                        <pre className="rounded-lg bg-gray-900 text-gray-100 dark:bg-gray-800 p-4 text-sm overflow-x-auto">
{`X-API-Key: wfy_your_api_key_here`}
                        </pre>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                            Unauthenticated requests will receive <code className="rounded bg-gray-200 dark:bg-gray-700 px-1">401 Unauthorized</code>.
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Available Scopes</CardTitle>
                        <CardDescription>Assign only the scopes each integration needs.</CardDescription>
                    </CardHeader>
                    <CardContent className="flex flex-wrap gap-2">
                        {available_scopes.map((scope) => (
                            <code key={scope} className="rounded bg-gray-100 dark:bg-gray-800 px-2 py-1 text-xs">
                                {scope}
                            </code>
                        ))}
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Endpoints</CardTitle>
                        <CardDescription>
                            Available API endpoints for your account.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        {endpoints.map((ep, idx) => (
                            <div key={idx} className="border-b border-gray-200 dark:border-gray-700 pb-6 last:border-0 last:pb-0">
                                <div className="flex items-center gap-2 flex-wrap">
                                    <span
                                        className={`inline-flex items-center rounded px-2 py-0.5 text-xs font-medium ${
                                            methodColors[ep.method] ?? 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
                                        }`}
                                    >
                                        {ep.method}
                                    </span>
                                    <code className="font-mono text-sm bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded">
                                        {ep.path}
                                    </code>
                                </div>
                                <p className="font-medium text-gray-900 dark:text-gray-100 mt-2">{ep.summary}</p>
                                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{ep.description}</p>
                                {ep.auth && (
                                    <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                                        Requires API key{ep.scope ? ` with scope: ${ep.scope}` : ''}.
                                    </p>
                                )}
                                <pre className="mt-3 rounded-lg bg-gray-900 text-gray-100 dark:bg-gray-800 p-4 text-xs overflow-x-auto whitespace-pre-wrap">
                                    {ep.example}
                                </pre>
                            </div>
                        ))}
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Tenant Webhooks</CardTitle>
                        <CardDescription>
                            Configure outbound webhooks from Developer settings to receive near real-time event updates.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <p className="text-sm font-medium text-gray-900 dark:text-gray-100">Headers</p>
                            <div className="rounded-lg bg-gray-50 dark:bg-gray-900/40 p-3 text-xs space-y-1">
                                <p><code>X-Waify-Event</code>: event key</p>
                                <p><code>X-Waify-Event-Id</code>: unique event UUID</p>
                                <p><code>{webhook_signature_example?.timestamp_header ?? 'X-Waify-Timestamp'}</code>: unix timestamp</p>
                                <p><code>{webhook_signature_example?.signature_header ?? 'X-Waify-Signature'}</code>: {webhook_signature_example?.signature_format ?? 'v1=<hex>'}</p>
                                <p><code>X-Waify-Idempotency-Key</code>: deduplication key</p>
                            </div>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                                Signature is computed using {webhook_signature_example?.algorithm ?? 'HMAC SHA256'} over{' '}
                                <code>{webhook_signature_example?.canonical_input ?? 'timestamp.raw_body'}</code>.
                            </p>
                        </div>

                        <div className="space-y-2">
                            <p className="text-sm font-medium text-gray-900 dark:text-gray-100">Supported events</p>
                            <div className="flex flex-wrap gap-2">
                                {webhook_event_keys.map((eventKey) => (
                                    <code key={eventKey} className="rounded bg-gray-100 dark:bg-gray-800 px-2 py-1 text-xs">
                                        {eventKey}
                                    </code>
                                ))}
                            </div>
                        </div>

                        <div className="space-y-2">
                            <p className="text-sm font-medium text-gray-900 dark:text-gray-100">Sample payload</p>
                            <pre className="rounded-lg bg-gray-900 text-gray-100 dark:bg-gray-800 p-4 text-xs overflow-x-auto whitespace-pre-wrap">
{JSON.stringify(webhook_sample_payloads['message.received'] ?? {}, null, 2)}
                            </pre>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="pt-6">
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                            Need an API key? Go to{' '}
                            <Link href={route('app.developer.index')} className="text-indigo-600 dark:text-indigo-400 hover:underline font-medium">
                                Developer → API keys
                            </Link>
                            .
                        </p>
                    </CardContent>
                </Card>
            </div>
        </AppShell>
    );
}
