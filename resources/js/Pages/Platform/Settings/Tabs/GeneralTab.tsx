import { Globe, Link2, Wrench } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/Components/UI/Card';
import { Input } from '@/Components/UI/Input';
import { Label } from '@/Components/UI/Label';
import { Switch } from '@/Components/UI/Switch';

interface GeneralTabProps {
    data: any;
    setData: (key: string, value: any) => void;
    errors: Record<string, string>;
}

function FieldError({ message }: { message?: string }) {
    if (!message) return null;

    return <p className="mt-1 text-sm text-red-600 dark:text-red-300">{message}</p>;
}

export default function GeneralTab({ data, setData, errors }: GeneralTabProps) {
    const general = data.general || {};
    const updateField = (field: string, value: any) => setData(`general.${field}`, value);

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Link2 className="h-5 w-5" />
                        Platform URL
                    </CardTitle>
                    <CardDescription>Used for callbacks, invoices, hosted widgets, webhook examples, and public links.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Label htmlFor="general.platform_url">Canonical URL</Label>
                    <Input
                        id="general.platform_url"
                        type="url"
                        value={general.platform_url || ''}
                        onChange={(event) => updateField('platform_url', event.target.value)}
                        placeholder="https://app.zyptos.com"
                    />
                    <FieldError message={errors['general.platform_url']} />
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Globe className="h-5 w-5" />
                        Localization
                    </CardTitle>
                    <CardDescription>Default formatting for admin views, billing documents, and workspace fallbacks.</CardDescription>
                </CardHeader>
                <CardContent className="grid gap-4 md:grid-cols-2">
                    <div>
                        <Label htmlFor="general.timezone">Default Timezone</Label>
                        <select
                            id="general.timezone"
                            value={general.timezone || 'Asia/Kolkata'}
                            onChange={(event) => updateField('timezone', event.target.value)}
                            className="mt-1 h-10 w-full rounded-btn border border-gray-200 bg-white px-3 text-sm text-waify-text shadow-sm focus:border-waify-green focus:outline-none focus:ring-2 focus:ring-waify-green/20 dark:border-waify-dark-border dark:bg-waify-dark-surface dark:text-waify-dark-text"
                        >
                            <option value="Asia/Kolkata">Asia/Kolkata (IST)</option>
                            <option value="UTC">UTC</option>
                            <option value="Asia/Dubai">Asia/Dubai (GST)</option>
                            <option value="Europe/London">Europe/London (GMT)</option>
                            <option value="Europe/Paris">Europe/Paris (CET)</option>
                            <option value="America/New_York">America/New_York (ET)</option>
                            <option value="America/Los_Angeles">America/Los_Angeles (PT)</option>
                            <option value="Asia/Singapore">Asia/Singapore (SGT)</option>
                            <option value="Australia/Sydney">Australia/Sydney (AEDT)</option>
                        </select>
                        <FieldError message={errors['general.timezone']} />
                    </div>

                    <div>
                        <Label htmlFor="general.locale">Default Locale</Label>
                        <select
                            id="general.locale"
                            value={general.locale || 'en'}
                            onChange={(event) => updateField('locale', event.target.value)}
                            className="mt-1 h-10 w-full rounded-btn border border-gray-200 bg-white px-3 text-sm text-waify-text shadow-sm focus:border-waify-green focus:outline-none focus:ring-2 focus:ring-waify-green/20 dark:border-waify-dark-border dark:bg-waify-dark-surface dark:text-waify-dark-text"
                        >
                            <option value="en">English</option>
                            <option value="hi">Hindi</option>
                        </select>
                        <FieldError message={errors['general.locale']} />
                    </div>

                    <div>
                        <Label htmlFor="general.date_format">Date Format</Label>
                        <select
                            id="general.date_format"
                            value={general.date_format || 'd/m/Y'}
                            onChange={(event) => updateField('date_format', event.target.value)}
                            className="mt-1 h-10 w-full rounded-btn border border-gray-200 bg-white px-3 text-sm text-waify-text shadow-sm focus:border-waify-green focus:outline-none focus:ring-2 focus:ring-waify-green/20 dark:border-waify-dark-border dark:bg-waify-dark-surface dark:text-waify-dark-text"
                        >
                            <option value="d/m/Y">DD/MM/YYYY (17/05/2026)</option>
                            <option value="Y-m-d">YYYY-MM-DD (2026-05-17)</option>
                            <option value="m/d/Y">MM/DD/YYYY (05/17/2026)</option>
                            <option value="d M Y">DD MMM YYYY (17 May 2026)</option>
                        </select>
                        <FieldError message={errors['general.date_format']} />
                    </div>

                    <div>
                        <Label htmlFor="general.time_format">Time Format</Label>
                        <select
                            id="general.time_format"
                            value={general.time_format || '12'}
                            onChange={(event) => updateField('time_format', event.target.value)}
                            className="mt-1 h-10 w-full rounded-btn border border-gray-200 bg-white px-3 text-sm text-waify-text shadow-sm focus:border-waify-green focus:outline-none focus:ring-2 focus:ring-waify-green/20 dark:border-waify-dark-border dark:bg-waify-dark-surface dark:text-waify-dark-text"
                        >
                            <option value="12">12-hour (2:30 PM)</option>
                            <option value="24">24-hour (14:30)</option>
                        </select>
                        <FieldError message={errors['general.time_format']} />
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Wrench className="h-5 w-5" />
                        Maintenance
                    </CardTitle>
                    <CardDescription>Temporarily restrict platform access while keeping super admin recovery available.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex items-center justify-between gap-4 rounded-card border border-gray-100 p-4 dark:border-waify-dark-border">
                        <div>
                            <p className="text-sm font-semibold text-waify-text dark:text-waify-dark-text">Maintenance Mode</p>
                            <p className="mt-1 text-sm text-waify-text-muted dark:text-waify-dark-text-muted">Only super admins can access the platform when enabled.</p>
                        </div>
                        <Switch checked={general.maintenance_mode || false} onCheckedChange={(checked) => updateField('maintenance_mode', checked)} />
                    </div>

                    {general.maintenance_mode && (
                        <div>
                            <Label htmlFor="general.maintenance_message">Maintenance Message</Label>
                            <Input
                                id="general.maintenance_message"
                                value={general.maintenance_message || ''}
                                onChange={(event) => updateField('maintenance_message', event.target.value)}
                                placeholder="We're performing scheduled maintenance. We'll be back shortly."
                            />
                            <FieldError message={errors['general.maintenance_message']} />
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
