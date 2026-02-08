import { Link } from '@inertiajs/react';
import { AlertCircle, X, Settings, AlertTriangle, XCircle } from 'lucide-react';
import { Alert } from '@/Components/UI/Alert';
import { Card, CardContent } from '@/Components/UI/Card';
import Button from '@/Components/UI/Button';

interface MisconfiguredSetting {
    group: string;
    name: string;
    required: boolean;
    issues: string[];
    impact: string;
    route: string;
    tab: string;
}

interface MisconfiguredSettingsAlertProps {
    misconfiguredSettings: MisconfiguredSetting[];
    onDismiss?: () => void;
    variant?: 'dashboard' | 'settings';
}

export default function MisconfiguredSettingsAlert({
    misconfiguredSettings,
    onDismiss,
    variant = 'dashboard'
}: MisconfiguredSettingsAlertProps) {
    if (!misconfiguredSettings || misconfiguredSettings.length === 0) {
        return null;
    }

    // Separate critical (required) and non-critical issues
    const criticalIssues = misconfiguredSettings.filter(s => s.required);
    const nonCriticalIssues = misconfiguredSettings.filter(s => !s.required);

    if (variant === 'settings') {
        // In settings page, show a compact alert at the top
        return (
            <div className="mb-6 space-y-3">
                {criticalIssues.length > 0 && (
                    <Alert variant="error">
                        <AlertCircle className="h-5 w-5" />
                        <div className="flex-1">
                            <p className="font-semibold text-sm mb-1">
                                {criticalIssues.length} Critical Configuration Issue{criticalIssues.length > 1 ? 's' : ''} Found
                            </p>
                            <ul className="text-sm space-y-1 list-disc list-inside">
                                {criticalIssues.map((setting, index) => (
                                    <li key={index}>
                                        <strong>{setting.name}:</strong> {setting.issues.join(', ')}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </Alert>
                )}
                {nonCriticalIssues.length > 0 && (
                    <Alert variant="warning">
                        <AlertTriangle className="h-5 w-5" />
                        <div className="flex-1">
                            <p className="font-semibold text-sm mb-1">
                                {nonCriticalIssues.length} Optional Configuration Issue{nonCriticalIssues.length > 1 ? 's' : ''} Found
                            </p>
                            <ul className="text-sm space-y-1 list-disc list-inside">
                                {nonCriticalIssues.map((setting, index) => (
                                    <li key={index}>
                                        <strong>{setting.name}:</strong> {setting.issues.join(', ')}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </Alert>
                )}
            </div>
        );
    }

    // Dashboard variant - show as a prominent card
    return (
        <Card className="border-amber-200 dark:border-amber-800 bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 mb-6">
            <CardContent className="p-6">
                <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3 flex-1">
                        <div className="p-2 bg-amber-500 rounded-lg">
                            <AlertCircle className="h-6 w-6 text-white" />
                        </div>
                        <div className="flex-1">
                            <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-2">
                                Platform Configuration Issues Detected
                            </h3>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                                Some required settings are not properly configured. This may affect platform functionality.
                            </p>
                            
                            <div className="space-y-3">
                                {criticalIssues.map((setting, index) => (
                                    <div key={index} className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-amber-200 dark:border-amber-800">
                                        <div className="flex items-start justify-between gap-3">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <XCircle className="h-4 w-4 text-red-500" />
                                                    <span className="font-semibold text-sm text-gray-900 dark:text-gray-100">
                                                        {setting.name}
                                                    </span>
                                                    <span className="px-2 py-0.5 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 text-xs font-semibold rounded">
                                                        Critical
                                                    </span>
                                                </div>
                                                <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">
                                                    {setting.impact}
                                                </p>
                                                <ul className="text-xs text-gray-700 dark:text-gray-300 space-y-1 list-disc list-inside">
                                                    {setting.issues.map((issue, issueIndex) => (
                                                        <li key={issueIndex}>{issue}</li>
                                                    ))}
                                                </ul>
                                            </div>
                                            <Link href={route('platform.settings') + `?tab=${setting.tab}`}>
                                                <Button size="sm" variant="primary">
                                                    <Settings className="h-3.5 w-3.5 mr-1" />
                                                    Configure
                                                </Button>
                                            </Link>
                                        </div>
                                    </div>
                                ))}
                                
                                {nonCriticalIssues.map((setting, index) => (
                                    <div key={index} className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-amber-200 dark:border-amber-800">
                                        <div className="flex items-start justify-between gap-3">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <AlertTriangle className="h-4 w-4 text-amber-500" />
                                                    <span className="font-semibold text-sm text-gray-900 dark:text-gray-100">
                                                        {setting.name}
                                                    </span>
                                                    <span className="px-2 py-0.5 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 text-xs font-semibold rounded">
                                                        Optional
                                                    </span>
                                                </div>
                                                <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">
                                                    {setting.impact}
                                                </p>
                                                <ul className="text-xs text-gray-700 dark:text-gray-300 space-y-1 list-disc list-inside">
                                                    {setting.issues.map((issue, issueIndex) => (
                                                        <li key={issueIndex}>{issue}</li>
                                                    ))}
                                                </ul>
                                            </div>
                                            <Link href={route('platform.settings') + `?tab=${setting.tab}`}>
                                                <Button size="sm" variant="secondary">
                                                    <Settings className="h-3.5 w-3.5 mr-1" />
                                                    Configure
                                                </Button>
                                            </Link>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                    {onDismiss && (
                        <button
                            onClick={onDismiss}
                            className="p-1.5 rounded-lg hover:bg-amber-100 dark:hover:bg-amber-900/30 transition-colors text-gray-500 dark:text-gray-400"
                            aria-label="Dismiss"
                        >
                            <X className="h-5 w-5" aria-hidden />
                        </button>
                    )}
                </div>
                <div className="mt-4 pt-4 border-t border-amber-200 dark:border-amber-800">
                    <Link href={route('platform.settings')}>
                        <Button variant="primary" className="w-full sm:w-auto">
                            <Settings className="h-4 w-4 mr-2" />
                            Go to Settings
                        </Button>
                    </Link>
                </div>
            </CardContent>
        </Card>
    );
}

