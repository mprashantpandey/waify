import { useForm, usePage } from '@inertiajs/react';
import { Transition } from '@headlessui/react';
import { Bell, CheckCircle2, Clock, Mail, Monitor, Sparkles } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Card } from '@/Components/UI/Card';
import Button from '@/Components/UI/Button';
import InputError from '@/Components/InputError';

function Toggle({ checked, onChange }: { checked: boolean; onChange: (checked: boolean) => void }) {
    return (
        <label className="relative inline-flex cursor-pointer items-center">
            <input type="checkbox" className="peer sr-only" checked={checked} onChange={(e) => onChange(e.target.checked)} />
            <div className="h-6 w-11 rounded-full bg-gray-200 transition peer-checked:bg-waify-green peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-waify-green/20 dark:bg-slate-700" />
            <div className="absolute left-1 top-1 h-4 w-4 rounded-full bg-white transition peer-checked:translate-x-5" />
        </label>
    );
}

export default function NotificationsTab() {
    const { auth } = usePage().props as any;
    const user = auth?.user;
    const [browserPermission, setBrowserPermission] = useState<'default' | 'granted' | 'denied' | 'unsupported'>('unsupported');

    const { data, setData, post, processing, errors, recentlySuccessful } = useForm({
        notify_assignment_enabled: Boolean(user?.notify_assignment_enabled ?? true),
        notify_mention_enabled: Boolean(user?.notify_mention_enabled ?? true),
        notify_sound_enabled: Boolean(user?.notify_sound_enabled ?? true),
        notify_billing_enabled: Boolean(user?.notify_billing_enabled ?? true),
        notify_waba_enabled: Boolean(user?.notify_waba_enabled ?? true),
        notify_automation_enabled: Boolean(user?.notify_automation_enabled ?? true),
        notify_leads_enabled: Boolean(user?.notify_leads_enabled ?? true),
        notify_templates_enabled: Boolean(user?.notify_templates_enabled ?? true),
        notify_email_enabled: Boolean(user?.notify_email_enabled ?? true),
        notify_in_app_enabled: Boolean(user?.notify_in_app_enabled ?? true),
        quiet_hours_enabled: Boolean(user?.quiet_hours_enabled ?? false),
        quiet_hours_start: user?.quiet_hours_start || '22:00',
        quiet_hours_end: user?.quiet_hours_end || '08:00',
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('app.settings.notifications', {}), {
            preserveScroll: true,
        });
    };

    useEffect(() => {
        if (typeof window !== 'undefined' && 'Notification' in window) {
            setBrowserPermission(Notification.permission);
        }
    }, []);

    const requestBrowserPermission = async () => {
        if (typeof window === 'undefined' || !('Notification' in window)) {
            setBrowserPermission('unsupported');
            return;
        }
        const permission = await Notification.requestPermission();
        setBrowserPermission(permission);
        if (permission === 'granted') {
            new Notification('Zyptos notifications enabled', {
                body: 'New inbox messages can now alert you when Zyptos is in the background.',
                icon: '/favicon.ico',
                tag: 'waify-notifications-enabled',
            });
        }
    };

    const items = [
        ['notify_assignment_enabled', 'Assignment pings', 'Notify me when a conversation is assigned to me.'],
        ['notify_mention_enabled', 'Mention pings', 'Notify me when I am mentioned in internal notes.'],
        ['notify_sound_enabled', 'Notification sound', 'Play a short sound on mentions or assignments.'],
        ['notify_email_enabled', 'Email notifications', 'Send important alerts to my email address.'],
        ['notify_in_app_enabled', 'In-app notifications', 'Show alerts in the Zyptos notification center.'],
    ] as const;
    const categories = [
        ['notify_billing_enabled', 'Billing', 'Invoices, failed payments, renewals, and overdue alerts.'],
        ['notify_waba_enabled', 'WABA health', 'Webhook, token, and WhatsApp account health alerts.'],
        ['notify_automation_enabled', 'Automation', 'Failed automation runs and handoff alerts.'],
        ['notify_leads_enabled', 'Leads', 'New leads, assignments, and conversion alerts.'],
        ['notify_templates_enabled', 'Templates', 'Template approval, rejection, and quality alerts.'],
    ] as const;

    return (
        <form onSubmit={submit} className="space-y-5">
            <Card className="p-4">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div className="flex min-w-0 gap-3">
                        <span className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-gray-100 text-waify-text-muted dark:bg-slate-700 dark:text-waify-dark-text-muted">
                            <Monitor className="h-4 w-4" />
                        </span>
                        <div>
                            <div className="text-sm font-medium text-waify-text dark:text-waify-dark-text">Browser inbox alerts</div>
                            <p className="mt-0.5 text-xs text-waify-text-muted dark:text-waify-dark-text-muted">
                                Show desktop browser notifications for new WhatsApp messages when the inbox is in the background.
                            </p>
                            <p className="mt-2 text-xs text-waify-text-muted dark:text-waify-dark-text-muted">
                                Status: <span className="font-semibold capitalize text-waify-text dark:text-waify-dark-text">{browserPermission}</span>
                            </p>
                        </div>
                    </div>
                    <Button
                        type="button"
                        variant={browserPermission === 'granted' ? 'secondary' : 'primary'}
                        onClick={requestBrowserPermission}
                        disabled={browserPermission === 'unsupported' || browserPermission === 'denied'}
                    >
                        {browserPermission === 'granted' ? 'Enabled' : browserPermission === 'denied' ? 'Blocked in browser' : 'Enable alerts'}
                    </Button>
                </div>
            </Card>

            {items.map(([key, title, description]) => (
                <Card key={key} className="p-4">
                    <div className="flex items-start justify-between gap-4">
                        <div className="flex min-w-0 gap-3">
                            <span className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-gray-100 text-waify-text-muted dark:bg-slate-700 dark:text-waify-dark-text-muted">
                                <Bell className="h-4 w-4" />
                            </span>
                            <div>
                                <div className="text-sm font-medium text-waify-text dark:text-waify-dark-text">{title}</div>
                                <p className="mt-0.5 text-xs text-waify-text-muted dark:text-waify-dark-text-muted">{description}</p>
                            </div>
                        </div>
                        <Toggle checked={data[key]} onChange={(checked) => setData(key, checked)} />
                    </div>
                    <InputError message={errors[key]} className="mt-2 text-xs" />
                </Card>
            ))}

            <Card className="p-4">
                <div className="mb-3 flex items-center gap-2">
                    <Mail className="h-4 w-4 text-waify-green-dark dark:text-emerald-300" />
                    <div className="text-sm font-semibold text-waify-text dark:text-waify-dark-text">Alert categories</div>
                </div>
                <div className="grid gap-3 md:grid-cols-2">
                    {categories.map(([key, title, description]) => (
                        <div key={key} className="flex items-start justify-between gap-3 rounded-card border border-gray-100 p-3 dark:border-waify-dark-border">
                            <div>
                                <div className="text-sm font-medium text-waify-text dark:text-waify-dark-text">{title}</div>
                                <p className="mt-0.5 text-xs text-waify-text-muted dark:text-waify-dark-text-muted">{description}</p>
                            </div>
                            <Toggle checked={data[key]} onChange={(checked) => setData(key, checked)} />
                        </div>
                    ))}
                </div>
            </Card>

            <Card className="p-4">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div className="flex gap-3">
                        <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-gray-100 text-waify-text-muted dark:bg-slate-700 dark:text-waify-dark-text-muted">
                            <Clock className="h-4 w-4" />
                        </span>
                        <div>
                            <div className="text-sm font-medium text-waify-text dark:text-waify-dark-text">Quiet hours</div>
                            <p className="mt-0.5 text-xs text-waify-text-muted dark:text-waify-dark-text-muted">Mute non-critical sound and email notifications during off-hours.</p>
                        </div>
                    </div>
                    <Toggle checked={data.quiet_hours_enabled} onChange={(checked) => setData('quiet_hours_enabled', checked)} />
                </div>
                {data.quiet_hours_enabled && (
                    <div className="mt-4 grid gap-3 sm:grid-cols-2">
                        <label className="space-y-1.5">
                            <span className="text-xs font-medium text-waify-text dark:text-waify-dark-text">Start</span>
                            <input type="time" value={data.quiet_hours_start} onChange={(event) => setData('quiet_hours_start', event.target.value)} className="waify-input w-full" />
                        </label>
                        <label className="space-y-1.5">
                            <span className="text-xs font-medium text-waify-text dark:text-waify-dark-text">End</span>
                            <input type="time" value={data.quiet_hours_end} onChange={(event) => setData('quiet_hours_end', event.target.value)} className="waify-input w-full" />
                        </label>
                    </div>
                )}
            </Card>

            <div className="flex items-center justify-between gap-4 border-t border-gray-100 pt-4 dark:border-slate-700">
                <div className="flex items-center gap-2 text-xs text-waify-text-muted dark:text-waify-dark-text-muted">
                    <Sparkles className="h-3.5 w-3.5" />
                    Mentions support @yourname or @youremail in internal notes.
                </div>
                <div className="flex items-center gap-4">
                    <Button type="submit" disabled={processing}>
                        {processing ? 'Saving...' : 'Save preferences'}
                    </Button>
                    <Transition show={recentlySuccessful} enter="transition ease-in-out" enterFrom="opacity-0" leave="transition ease-in-out" leaveTo="opacity-0">
                        <div className="flex items-center gap-2 text-sm text-emerald-600 dark:text-emerald-300">
                            <CheckCircle2 className="h-4 w-4" />
                            Saved
                        </div>
                    </Transition>
                </div>
            </div>
        </form>
    );
}
