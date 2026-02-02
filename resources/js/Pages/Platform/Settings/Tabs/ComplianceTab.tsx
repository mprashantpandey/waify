import { Card, CardContent, CardHeader, CardTitle } from '@/Components/UI/Card';
import TextInput from '@/Components/TextInput';
import InputLabel from '@/Components/InputLabel';
import InputError from '@/Components/InputError';
import { Scale, FileText, Shield, Database } from 'lucide-react';

interface ComplianceTabProps {
    data: any;
    setData: (key: string, value: any) => void;
    errors: any;
}

export default function ComplianceTab({ data, setData, errors }: ComplianceTabProps) {
    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <FileText className="h-5 w-5" />
                        Legal Documents
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div>
                        <InputLabel htmlFor="compliance.terms_url" value="Terms of Service URL" />
                        <TextInput
                            id="compliance.terms_url"
                            type="url"
                            value={data.compliance?.terms_url || ''}
                            onChange={(e) => setData('compliance.terms_url', e.target.value)}
                            className="mt-1"
                            placeholder="https://example.com/terms"
                        />
                        <InputError message={errors['compliance.terms_url']} />
                    </div>
                    <div>
                        <InputLabel htmlFor="compliance.privacy_url" value="Privacy Policy URL" />
                        <TextInput
                            id="compliance.privacy_url"
                            type="url"
                            value={data.compliance?.privacy_url || ''}
                            onChange={(e) => setData('compliance.privacy_url', e.target.value)}
                            className="mt-1"
                            placeholder="https://example.com/privacy"
                        />
                        <InputError message={errors['compliance.privacy_url']} />
                    </div>
                    <div>
                        <InputLabel htmlFor="compliance.cookie_policy_url" value="Cookie Policy URL" />
                        <TextInput
                            id="compliance.cookie_policy_url"
                            type="url"
                            value={data.compliance?.cookie_policy_url || ''}
                            onChange={(e) => setData('compliance.cookie_policy_url', e.target.value)}
                            className="mt-1"
                            placeholder="https://example.com/cookies"
                        />
                        <InputError message={errors['compliance.cookie_policy_url']} />
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Shield className="h-5 w-5" />
                        GDPR & Data Protection
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <InputLabel value="GDPR Compliance Mode" />
                            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                                Enable GDPR-compliant data handling
                            </p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                            <input
                                type="checkbox"
                                checked={data.compliance?.gdpr_enabled || false}
                                onChange={(e) => setData('compliance.gdpr_enabled', e.target.checked)}
                                className="sr-only peer"
                            />
                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                        </label>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <InputLabel htmlFor="compliance.data_retention_days" value="Data Retention (Days)" />
                            <TextInput
                                id="compliance.data_retention_days"
                                type="number"
                                value={data.compliance?.data_retention_days || 365}
                                onChange={(e) => setData('compliance.data_retention_days', parseInt(e.target.value) || 365)}
                                className="mt-1"
                                min="30"
                                max="2555"
                            />
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Automatically delete data after this period</p>
                            <InputError message={errors['compliance.data_retention_days']} />
                        </div>
                        <div>
                            <InputLabel htmlFor="compliance.data_officer_email" value="Data Protection Officer Email" />
                            <TextInput
                                id="compliance.data_officer_email"
                                type="email"
                                value={data.compliance?.data_officer_email || ''}
                                onChange={(e) => setData('compliance.data_officer_email', e.target.value)}
                                className="mt-1"
                                placeholder="dpo@example.com"
                            />
                            <InputError message={errors['compliance.data_officer_email']} />
                        </div>
                    </div>
                    <div className="flex items-center justify-between">
                        <div>
                            <InputLabel value="Require Cookie Consent" />
                            <p className="text-sm text-gray-500 dark:text-gray-400">Show cookie consent banner</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                            <input
                                type="checkbox"
                                checked={data.compliance?.cookie_consent_required || false}
                                onChange={(e) => setData('compliance.cookie_consent_required', e.target.checked)}
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
                        <Database className="h-5 w-5" />
                        Data Management
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <InputLabel value="Allow Data Export" />
                            <p className="text-sm text-gray-500 dark:text-gray-400">Users can export their data</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                            <input
                                type="checkbox"
                                checked={data.compliance?.allow_data_export || false}
                                onChange={(e) => setData('compliance.allow_data_export', e.target.checked)}
                                className="sr-only peer"
                            />
                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                        </label>
                    </div>
                    <div className="flex items-center justify-between">
                        <div>
                            <InputLabel value="Allow Data Deletion" />
                            <p className="text-sm text-gray-500 dark:text-gray-400">Users can request data deletion</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                            <input
                                type="checkbox"
                                checked={data.compliance?.allow_data_deletion || false}
                                onChange={(e) => setData('compliance.allow_data_deletion', e.target.checked)}
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

