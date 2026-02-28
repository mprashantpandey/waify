import { useForm, usePage } from '@inertiajs/react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/Components/UI/Card';
import Button from '@/Components/UI/Button';
import InputError from '@/Components/InputError';
import { Bell, Sparkles } from 'lucide-react';

export default function NotificationsTab() {
    const { auth } = usePage().props as any;
    const user = auth?.user;

    const { data, setData, post, processing, errors } = useForm({
        notify_assignment_enabled: Boolean(user?.notify_assignment_enabled ?? true),
        notify_mention_enabled: Boolean(user?.notify_mention_enabled ?? true),
        notify_sound_enabled: Boolean(user?.notify_sound_enabled ?? true),
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('app.settings.notifications', {}), {
            preserveScroll: true,
        });
    };

    const enabledCount = [
        data.notify_assignment_enabled,
        data.notify_mention_enabled,
        data.notify_sound_enabled,
    ].filter(Boolean).length;

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-900">
                    <div className="text-xs text-gray-500 dark:text-gray-400">Enabled preferences</div>
                    <div className="mt-1 text-lg font-semibold text-gray-900 dark:text-gray-100">{enabledCount}/3</div>
                </div>
                <div className="rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-900">
                    <div className="text-xs text-gray-500 dark:text-gray-400">Assignments</div>
                    <div className="mt-1 text-sm font-semibold text-gray-900 dark:text-gray-100">{data.notify_assignment_enabled ? 'On' : 'Off'}</div>
                </div>
                <div className="rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-900">
                    <div className="text-xs text-gray-500 dark:text-gray-400">Mentions + sound</div>
                    <div className="mt-1 text-sm font-semibold text-gray-900 dark:text-gray-100">
                        {data.notify_mention_enabled ? 'Mentions on' : 'Mentions off'} · {data.notify_sound_enabled ? 'Sound on' : 'Sound off'}
                    </div>
                </div>
            </div>

            <Card className="border-0 shadow-lg">
                <CardHeader className="bg-gradient-to-r from-indigo-50 to-blue-100 dark:from-indigo-900/20 dark:to-blue-800/20">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-500 rounded-xl">
                            <Bell className="h-5 w-5 text-white" />
                        </div>
                        <div>
                            <CardTitle className="text-xl font-bold">Notification Preferences</CardTitle>
                            <CardDescription>Control pings and sounds for the inbox</CardDescription>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="p-6">
                    <div className="mb-4 rounded-xl border border-blue-100 bg-blue-50/60 p-3 text-sm text-blue-800 dark:border-blue-900/60 dark:bg-blue-900/20 dark:text-blue-200">
                        These preferences affect your personal in-app alerts only. They do not change tenant-wide routing or campaign behavior.
                    </div>
                    <form onSubmit={submit} className="space-y-5">
                        <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-900">
                            <div className="flex items-start justify-between gap-4">
                                <div>
                                    <div className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                                        Assignment pings
                                    </div>
                                    <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                                        Notify me when a conversation is assigned to me.
                                    </p>
                                </div>
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input
                                        type="checkbox"
                                        className="sr-only peer"
                                        checked={data.notify_assignment_enabled}
                                        onChange={(e) => setData('notify_assignment_enabled', e.target.checked)}
                                    />
                                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-500/30 rounded-full peer dark:bg-gray-700 peer-checked:bg-blue-500"></div>
                                    <div className="absolute left-1 top-1 h-4 w-4 rounded-full bg-white transition peer-checked:translate-x-5"></div>
                                </label>
                            </div>
                            <InputError message={errors.notify_assignment_enabled} className="mt-2" />
                        </div>

                        <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-900">
                            <div className="flex items-start justify-between gap-4">
                                <div>
                                    <div className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                                        Mention pings
                                    </div>
                                    <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                                        Notify me when I’m mentioned in internal notes.
                                    </p>
                                </div>
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input
                                        type="checkbox"
                                        className="sr-only peer"
                                        checked={data.notify_mention_enabled}
                                        onChange={(e) => setData('notify_mention_enabled', e.target.checked)}
                                    />
                                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-500/30 rounded-full peer dark:bg-gray-700 peer-checked:bg-blue-500"></div>
                                    <div className="absolute left-1 top-1 h-4 w-4 rounded-full bg-white transition peer-checked:translate-x-5"></div>
                                </label>
                            </div>
                            <InputError message={errors.notify_mention_enabled} className="mt-2" />
                        </div>

                        <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-900">
                            <div className="flex items-start justify-between gap-4">
                                <div>
                                    <div className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                                        Notification sound
                                    </div>
                                    <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                                        Play a short sound on mentions or assignments.
                                    </p>
                                </div>
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input
                                        type="checkbox"
                                        className="sr-only peer"
                                        checked={data.notify_sound_enabled}
                                        onChange={(e) => setData('notify_sound_enabled', e.target.checked)}
                                    />
                                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-500/30 rounded-full peer dark:bg-gray-700 peer-checked:bg-blue-500"></div>
                                    <div className="absolute left-1 top-1 h-4 w-4 rounded-full bg-white transition peer-checked:translate-x-5"></div>
                                </label>
                            </div>
                            <InputError message={errors.notify_sound_enabled} className="mt-2" />
                        </div>

                        <div className="flex items-center justify-end gap-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                            <Button
                                type="submit"
                                disabled={processing}
                                className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 shadow-lg shadow-blue-500/40 rounded-xl"
                            >
                                {processing ? 'Saving...' : 'Save Preferences'}
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
            <div className="flex items-center gap-2 text-xs text-gray-500">
                <Sparkles className="h-3.5 w-3.5" />
                Mentions support @yourname or @youremail in internal notes.
            </div>
        </div>
    );
}
