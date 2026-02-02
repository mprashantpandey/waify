import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/Components/UI/Card';
import { Bell, Sparkles } from 'lucide-react';

export default function NotificationsTab() {
    return (
        <div className="space-y-6">
            <Card className="border-0 shadow-lg">
                <CardHeader className="bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-500 rounded-xl">
                            <Bell className="h-5 w-5 text-white" />
                        </div>
                        <div>
                            <CardTitle className="text-xl font-bold">Notification Preferences</CardTitle>
                            <CardDescription>Manage your notification settings</CardDescription>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="p-6">
                    <div className="text-center py-12">
                        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-blue-100 to-blue-200 dark:from-blue-900/20 dark:to-blue-800/20 mb-4">
                            <Sparkles className="h-10 w-10 text-blue-600 dark:text-blue-400" />
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                            Coming Soon
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400 max-w-md mx-auto">
                            Notification settings will be available in a future update. You'll be able to customize email notifications, 
                            in-app alerts, and more.
                        </p>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
