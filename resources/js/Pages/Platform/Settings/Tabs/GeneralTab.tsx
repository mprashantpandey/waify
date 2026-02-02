import { Card, CardContent, CardHeader, CardTitle } from '@/Components/UI/Card';
import TextInput from '@/Components/TextInput';
import InputLabel from '@/Components/InputLabel';
import InputError from '@/Components/InputError';
import { Globe, Wrench } from 'lucide-react';

interface GeneralTabProps {
    data: any;
    setData: (key: string, value: any) => void;
    errors: any;
}

export default function GeneralTab({ data, setData, errors }: GeneralTabProps) {
    const updateField = (field: string, value: any) => {
        setData(`general.${field}`, value);
    };

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Globe className="h-5 w-5" />
                        Localization
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <InputLabel htmlFor="general.timezone" value="Default Timezone" />
                            <select
                                id="general.timezone"
                                value={data.general?.timezone || 'UTC'}
                                onChange={(e) => updateField('timezone', e.target.value)}
                                className="mt-1 w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100 dark:focus:border-indigo-500 dark:focus:ring-indigo-500"
                            >
                                <option value="UTC">UTC</option>
                                <option value="America/New_York">America/New_York (EST)</option>
                                <option value="America/Chicago">America/Chicago (CST)</option>
                                <option value="America/Denver">America/Denver (MST)</option>
                                <option value="America/Los_Angeles">America/Los_Angeles (PST)</option>
                                <option value="Europe/London">Europe/London (GMT)</option>
                                <option value="Europe/Paris">Europe/Paris (CET)</option>
                                <option value="Asia/Dubai">Asia/Dubai (GST)</option>
                                <option value="Asia/Kolkata">Asia/Kolkata (IST)</option>
                                <option value="Asia/Tokyo">Asia/Tokyo (JST)</option>
                                <option value="Australia/Sydney">Australia/Sydney (AEDT)</option>
                            </select>
                            <InputError message={errors['general.timezone']} />
                        </div>
                        <div>
                            <InputLabel htmlFor="general.locale" value="Default Locale" />
                            <select
                                id="general.locale"
                                value={data.general?.locale || 'en'}
                                onChange={(e) => updateField('locale', e.target.value)}
                                className="mt-1 w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100 dark:focus:border-indigo-500 dark:focus:ring-indigo-500"
                            >
                                <option value="en">English</option>
                                <option value="es">Spanish</option>
                                <option value="fr">French</option>
                                <option value="de">German</option>
                                <option value="it">Italian</option>
                                <option value="pt">Portuguese</option>
                                <option value="zh">Chinese</option>
                                <option value="ja">Japanese</option>
                                <option value="ko">Korean</option>
                                <option value="ar">Arabic</option>
                                <option value="hi">Hindi</option>
                            </select>
                            <InputError message={errors['general.locale']} />
                        </div>
                        <div>
                            <InputLabel htmlFor="general.date_format" value="Date Format" />
                            <select
                                id="general.date_format"
                                value={data.general?.date_format || 'Y-m-d'}
                                onChange={(e) => updateField('date_format', e.target.value)}
                                className="mt-1 w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100 dark:focus:border-indigo-500 dark:focus:ring-indigo-500"
                            >
                                <option value="Y-m-d">YYYY-MM-DD (2024-01-15)</option>
                                <option value="m/d/Y">MM/DD/YYYY (01/15/2024)</option>
                                <option value="d/m/Y">DD/MM/YYYY (15/01/2024)</option>
                                <option value="M d, Y">MMM DD, YYYY (Jan 15, 2024)</option>
                                <option value="d M Y">DD MMM YYYY (15 Jan 2024)</option>
                            </select>
                            <InputError message={errors['general.date_format']} />
                        </div>
                        <div>
                            <InputLabel htmlFor="general.time_format" value="Time Format" />
                            <select
                                id="general.time_format"
                                value={data.general?.time_format || '24'}
                                onChange={(e) => updateField('time_format', e.target.value)}
                                className="mt-1 w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100 dark:focus:border-indigo-500 dark:focus:ring-indigo-500"
                            >
                                <option value="24">24-hour (14:30)</option>
                                <option value="12">12-hour (2:30 PM)</option>
                            </select>
                            <InputError message={errors['general.time_format']} />
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Wrench className="h-5 w-5" />
                        System Status
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <InputLabel value="Maintenance Mode" />
                            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                                When enabled, only super admins can access the platform
                            </p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                            <input
                                type="checkbox"
                                checked={data.general?.maintenance_mode || false}
                                onChange={(e) => updateField('maintenance_mode', e.target.checked)}
                                className="sr-only peer"
                            />
                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                        </label>
                    </div>
                    {data.general?.maintenance_mode && (
                        <div>
                            <InputLabel htmlFor="general.maintenance_message" value="Maintenance Message" />
                            <TextInput
                                id="general.maintenance_message"
                                type="text"
                                value={data.general?.maintenance_message || ''}
                                onChange={(e) => updateField('maintenance_message', e.target.value)}
                                className="mt-1"
                                placeholder="We're performing scheduled maintenance. We'll be back shortly."
                            />
                            <InputError message={errors['general.maintenance_message']} />
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}

