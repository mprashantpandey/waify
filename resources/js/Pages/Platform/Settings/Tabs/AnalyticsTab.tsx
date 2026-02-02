import { Card, CardContent, CardHeader, CardTitle } from '@/Components/UI/Card';
import TextInput from '@/Components/TextInput';
import InputLabel from '@/Components/InputLabel';
import InputError from '@/Components/InputError';
import { BarChart3, Bug, FileText } from 'lucide-react';

interface AnalyticsTabProps {
    data: any;
    setData: (key: string, value: any) => void;
    errors: any;
}

export default function AnalyticsTab({ data, setData, errors }: AnalyticsTabProps) {
    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <BarChart3 className="h-5 w-5" />
                        Analytics Providers
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                    {/* Google Analytics */}
                    <div className="border-b border-gray-200 dark:border-gray-700 pb-4">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Google Analytics</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <InputLabel htmlFor="analytics.google_analytics_id" value="Tracking ID" />
                                <TextInput
                                    id="analytics.google_analytics_id"
                                    type="text"
                                    value={data.analytics?.google_analytics_id || ''}
                                    onChange={(e) => setData('analytics.google_analytics_id', e.target.value)}
                                    className="mt-1"
                                    placeholder="G-XXXXXXXXXX"
                                />
                                <InputError message={errors['analytics.google_analytics_id']} />
                            </div>
                            <div className="flex items-center justify-between">
                                <div>
                                    <InputLabel value="Enable Google Analytics" />
                                    <p className="text-sm text-gray-500 dark:text-gray-400">Track user behavior</p>
                                </div>
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={data.analytics?.google_analytics_enabled || false}
                                        onChange={(e) => setData('analytics.google_analytics_enabled', e.target.checked)}
                                        className="sr-only peer"
                                    />
                                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                                </label>
                            </div>
                        </div>
                    </div>

                    {/* Mixpanel */}
                    <div>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Mixpanel</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <InputLabel htmlFor="analytics.mixpanel_token" value="Project Token" />
                                <TextInput
                                    id="analytics.mixpanel_token"
                                    type="text"
                                    value={data.analytics?.mixpanel_token || ''}
                                    onChange={(e) => setData('analytics.mixpanel_token', e.target.value)}
                                    className="mt-1"
                                    placeholder="xxxxxxxxxxxxxxxxxxxxxxxx"
                                />
                                <InputError message={errors['analytics.mixpanel_token']} />
                            </div>
                            <div className="flex items-center justify-between">
                                <div>
                                    <InputLabel value="Enable Mixpanel" />
                                    <p className="text-sm text-gray-500 dark:text-gray-400">Event tracking and analytics</p>
                                </div>
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={data.analytics?.mixpanel_enabled || false}
                                        onChange={(e) => setData('analytics.mixpanel_enabled', e.target.checked)}
                                        className="sr-only peer"
                                    />
                                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                                </label>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Bug className="h-5 w-5" />
                        Error Tracking
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                    {/* Sentry */}
                    <div>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Sentry</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <InputLabel htmlFor="analytics.sentry_dsn" value="DSN" />
                                <TextInput
                                    id="analytics.sentry_dsn"
                                    type="text"
                                    value={data.analytics?.sentry_dsn || ''}
                                    onChange={(e) => setData('analytics.sentry_dsn', e.target.value)}
                                    className="mt-1"
                                    placeholder="https://xxx@xxx.ingest.sentry.io/xxx"
                                />
                                <InputError message={errors['analytics.sentry_dsn']} />
                            </div>
                            <div>
                                <InputLabel htmlFor="analytics.sentry_environment" value="Environment" />
                                <select
                                    id="analytics.sentry_environment"
                                    value={data.analytics?.sentry_environment || 'production'}
                                    onChange={(e) => setData('analytics.sentry_environment', e.target.value)}
                                    className="mt-1 w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100 dark:focus:border-indigo-500 dark:focus:ring-indigo-500"
                                >
                                    <option value="production">Production</option>
                                    <option value="staging">Staging</option>
                                    <option value="development">Development</option>
                                </select>
                                <InputError message={errors['analytics.sentry_environment']} />
                            </div>
                            <div className="flex items-center justify-between">
                                <div>
                                    <InputLabel value="Enable Sentry" />
                                    <p className="text-sm text-gray-500 dark:text-gray-400">Track and monitor errors</p>
                                </div>
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={data.analytics?.sentry_enabled || false}
                                        onChange={(e) => setData('analytics.sentry_enabled', e.target.checked)}
                                        className="sr-only peer"
                                    />
                                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                                </label>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <FileText className="h-5 w-5" />
                        Logging
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div>
                        <InputLabel htmlFor="analytics.log_level" value="Log Level" />
                        <select
                            id="analytics.log_level"
                            value={data.analytics?.log_level || 'info'}
                            onChange={(e) => setData('analytics.log_level', e.target.value)}
                            className="mt-1 w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100 dark:focus:border-indigo-500 dark:focus:ring-indigo-500"
                        >
                            <option value="debug">Debug</option>
                            <option value="info">Info</option>
                            <option value="warning">Warning</option>
                            <option value="error">Error</option>
                        </select>
                        <InputError message={errors['analytics.log_level']} />
                    </div>
                    <div className="flex items-center justify-between">
                        <div>
                            <InputLabel value="Log API Requests" />
                            <p className="text-sm text-gray-500 dark:text-gray-400">Log all API requests and responses</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                            <input
                                type="checkbox"
                                checked={data.analytics?.log_api_requests || false}
                                onChange={(e) => setData('analytics.log_api_requests', e.target.checked)}
                                className="sr-only peer"
                            />
                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                        </label>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}

