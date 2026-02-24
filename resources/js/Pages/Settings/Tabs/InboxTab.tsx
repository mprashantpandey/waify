import { useForm, usePage } from '@inertiajs/react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/Components/UI/Card';
import Button from '@/Components/UI/Button';
import InputError from '@/Components/InputError';
import { Inbox, Sparkles, CheckCircle2 } from 'lucide-react';
import { Transition } from '@headlessui/react';

export default function InboxTab() {
    const { account } = usePage().props as any;

    const { data, setData, post, processing, errors, recentlySuccessful } = useForm({
        auto_assign_enabled: Boolean(account?.auto_assign_enabled),
        auto_assign_strategy: account?.auto_assign_strategy || 'round_robin',
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('app.settings.inbox', {}), {
            preserveScroll: true,
        });
    };

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-900">
                    <div className="text-xs text-gray-500 dark:text-gray-400">Auto-assignment</div>
                    <div className="mt-1 text-sm font-semibold text-gray-900 dark:text-gray-100">
                        {data.auto_assign_enabled ? 'Enabled' : 'Disabled'}
                    </div>
                </div>
                <div className="rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-900">
                    <div className="text-xs text-gray-500 dark:text-gray-400">Strategy</div>
                    <div className="mt-1 text-sm font-semibold text-gray-900 dark:text-gray-100 capitalize">
                        {data.auto_assign_enabled ? data.auto_assign_strategy.replace('_', ' ') : 'Manual assignment'}
                    </div>
                </div>
            </div>

            <Card className="border-0 shadow-lg">
                <CardHeader className="bg-gradient-to-r from-emerald-50 to-emerald-100 dark:from-emerald-900/20 dark:to-emerald-800/20">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-emerald-500 rounded-xl">
                            <Inbox className="h-5 w-5 text-white" />
                        </div>
                        <div>
                            <CardTitle className="text-xl font-bold">Inbox Routing</CardTitle>
                            <CardDescription>Control how conversations are assigned to agents</CardDescription>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="p-6">
                    <div className="mb-4 rounded-xl border border-emerald-100 bg-emerald-50/70 p-3 text-sm text-emerald-800 dark:border-emerald-900/50 dark:bg-emerald-900/20 dark:text-emerald-200">
                        Routing changes apply to new incoming conversations. Existing assignments remain unchanged.
                    </div>
                    <form onSubmit={submit} className="space-y-6">
                        <div className="rounded-2xl border border-emerald-200 bg-white p-4 shadow-sm dark:border-emerald-700/50 dark:bg-gray-900">
                            <div className="flex items-start justify-between gap-4">
                                <div>
                                    <div className="flex items-center gap-2 text-sm font-semibold text-gray-900 dark:text-gray-100">
                                        <Sparkles className="h-4 w-4 text-emerald-600" />
                                        Auto-assign incoming chats
                                    </div>
                                    <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                                        Automatically distribute new conversations among your agents.
                                    </p>
                                </div>
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input
                                        type="checkbox"
                                        className="sr-only peer"
                                        checked={data.auto_assign_enabled}
                                        onChange={(e) => setData('auto_assign_enabled', e.target.checked)}
                                    />
                                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-emerald-500/30 rounded-full peer dark:bg-gray-700 peer-checked:bg-emerald-500"></div>
                                    <div className="absolute left-1 top-1 h-4 w-4 rounded-full bg-white transition peer-checked:translate-x-5"></div>
                                </label>
                            </div>
                            <InputError message={errors.auto_assign_enabled} className="mt-2" />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                                Assignment strategy
                            </label>
                            <select
                                value={data.auto_assign_strategy}
                                onChange={(e) => setData('auto_assign_strategy', e.target.value)}
                                className="mt-1 block w-full rounded-xl border-gray-200 bg-white px-3 py-2 text-sm shadow-sm focus:border-emerald-500 focus:ring-emerald-500 dark:border-gray-700 dark:bg-gray-800"
                                disabled={!data.auto_assign_enabled}
                            >
                                <option value="round_robin">Round robin</option>
                            </select>
                            <InputError message={errors.auto_assign_strategy} className="mt-2" />
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                                Round robin rotates assignments evenly across owners, admins, and members.
                            </p>
                        </div>

                        <div className="flex items-center justify-end gap-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                            <Button
                                type="submit"
                                disabled={processing}
                                className="bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 shadow-lg shadow-emerald-500/40 rounded-xl"
                            >
                                {processing ? 'Saving...' : 'Save Settings'}
                            </Button>
                            <Transition
                                show={recentlySuccessful}
                                enter="transition ease-in-out"
                                enterFrom="opacity-0"
                                leave="transition ease-in-out"
                                leaveTo="opacity-0"
                            >
                                <div className="flex items-center gap-2 text-sm text-emerald-600 dark:text-emerald-400">
                                    <CheckCircle2 className="h-4 w-4" />
                                    Saved successfully
                                </div>
                            </Transition>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
