import { BarChart3, FileText, MousePointerClick } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/Components/UI/Card';
import { Input } from '@/Components/UI/Input';
import { Label } from '@/Components/UI/Label';
import { Switch } from '@/Components/UI/Switch';

interface AnalyticsTabProps {
    data: any;
    setData: (key: string, value: any) => void;
    errors: Record<string, string>;
}

function FieldError({ message }: { message?: string }) {
    if (!message) return null;

    return <p className="mt-1 text-sm text-red-600 dark:text-red-300">{message}</p>;
}

function ToggleRow({
    label,
    description,
    checked,
    onChange,
}: {
    label: string;
    description: string;
    checked: boolean;
    onChange: (value: boolean) => void;
}) {
    return (
        <div className="flex items-center justify-between gap-4 rounded-card border border-gray-100 bg-white p-4 dark:border-waify-dark-border dark:bg-waify-dark-surface">
            <div className="min-w-0">
                <p className="text-sm font-semibold text-waify-text dark:text-waify-dark-text">{label}</p>
                <p className="mt-1 text-sm text-waify-text-muted dark:text-waify-dark-text-muted">{description}</p>
            </div>
            <Switch checked={checked} onCheckedChange={onChange} />
        </div>
    );
}

export default function AnalyticsTab({ data, setData, errors }: AnalyticsTabProps) {
    const analytics = data.analytics || {};

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <BarChart3 className="h-5 w-5" />
                        Product Analytics
                    </CardTitle>
                    <CardDescription>Connect visitor and product analytics used by public pages and app events.</CardDescription>
                </CardHeader>
                <CardContent className="grid gap-4 xl:grid-cols-2">
                    <div className="space-y-3 rounded-card border border-gray-100 p-4 dark:border-waify-dark-border">
                        <div className="flex items-center gap-2">
                            <MousePointerClick className="h-4 w-4 text-waify-green dark:text-emerald-300" />
                            <h3 className="text-sm font-semibold text-waify-text dark:text-waify-dark-text">Google Analytics</h3>
                        </div>
                        <div>
                            <Label htmlFor="analytics.google_analytics_id">Measurement ID</Label>
                            <Input
                                id="analytics.google_analytics_id"
                                value={analytics.google_analytics_id || ''}
                                onChange={(event) => setData('analytics.google_analytics_id', event.target.value)}
                                placeholder="G-XXXXXXXXXX"
                            />
                            <FieldError message={errors['analytics.google_analytics_id']} />
                        </div>
                        <ToggleRow
                            label="Enable tracking"
                            description="Inject Google Analytics on public pages when a measurement ID is present."
                            checked={analytics.google_analytics_enabled || false}
                            onChange={(checked) => setData('analytics.google_analytics_enabled', checked)}
                        />
                    </div>

                    <div className="space-y-3 rounded-card border border-gray-100 p-4 dark:border-waify-dark-border">
                        <div className="flex items-center gap-2">
                            <BarChart3 className="h-4 w-4 text-waify-green dark:text-emerald-300" />
                            <h3 className="text-sm font-semibold text-waify-text dark:text-waify-dark-text">Mixpanel</h3>
                        </div>
                        <div>
                            <Label htmlFor="analytics.mixpanel_token">Project Token</Label>
                            <Input
                                id="analytics.mixpanel_token"
                                value={analytics.mixpanel_token || ''}
                                onChange={(event) => setData('analytics.mixpanel_token', event.target.value)}
                                placeholder="xxxxxxxxxxxxxxxxxxxxxxxx"
                            />
                            <FieldError message={errors['analytics.mixpanel_token']} />
                        </div>
                        <ToggleRow
                            label="Enable product events"
                            description="Use Mixpanel for app events and funnel analytics when a token is configured."
                            checked={analytics.mixpanel_enabled || false}
                            onChange={(checked) => setData('analytics.mixpanel_enabled', checked)}
                        />
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <FileText className="h-5 w-5" />
                        Application Logging
                    </CardTitle>
                    <CardDescription>Control local application logs without exposing unused third-party error tracking settings.</CardDescription>
                </CardHeader>
                <CardContent className="grid gap-4 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
                    <div>
                        <Label htmlFor="analytics.log_level">Log Level</Label>
                        <select
                            id="analytics.log_level"
                            value={analytics.log_level || 'info'}
                            onChange={(event) => setData('analytics.log_level', event.target.value)}
                            className="mt-1 h-10 w-full rounded-btn border border-gray-200 bg-white px-3 text-sm text-waify-text shadow-sm focus:border-waify-green focus:outline-none focus:ring-2 focus:ring-waify-green/20 dark:border-waify-dark-border dark:bg-waify-dark-surface dark:text-waify-dark-text"
                        >
                            <option value="debug">Debug</option>
                            <option value="info">Info</option>
                            <option value="warning">Warning</option>
                            <option value="error">Error</option>
                        </select>
                        <FieldError message={errors['analytics.log_level']} />
                    </div>

                    <ToggleRow
                        label="Log API requests"
                        description="Record API request metadata for troubleshooting. Avoid enabling this permanently on high traffic installs."
                        checked={analytics.log_api_requests || false}
                        onChange={(checked) => setData('analytics.log_api_requests', checked)}
                    />
                </CardContent>
            </Card>
        </div>
    );
}
