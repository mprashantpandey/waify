import { Head, Link, router, useForm } from '@inertiajs/react';
import { useState } from 'react';
import AppShell from '@/Layouts/AppShell';
import { Card, CardContent } from '@/Components/UI/Card';
import { AddonPage, EmptyPanel, MiniStatus, PaginationMeta, ServerListControls, StatGrid } from './Shared';
import { Modal, ThemedIconTile } from '@/Components/UI/Elements';
import Button from '@/Components/UI/Button';
import { Input } from '@/Components/UI/Input';
import { Calendar, Clock, Edit3, Link2, MapPin, MessageCircle, Plus, RefreshCw, Send, Settings2, Trash2, UserRound } from 'lucide-react';
import { useConfirm } from '@/hooks/useConfirm';

type Appointment = {
    id: number;
    title: string;
    contact: string;
    phone: string | null;
    date: string;
    duration: number;
    staff: string;
    status: string;
    type: string;
    location?: string | null;
    meetingUrl?: string | null;
    description?: string | null;
    source?: string | null;
    externalId?: string | null;
    reminderEnabled?: boolean;
    reminderMinutesBefore?: number;
};
type CalendarIntegration = {
    connected: boolean;
    status: string;
    lastSyncAt?: string | null;
    lastError?: string | null;
    syncDirection?: string;
    calendarId?: string | null;
    createGoogleMeet?: boolean;
} | null;

function dateLabel(value: string) {
    return new Date(value).toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
}

export default function Appointments({ appointments = [], filters = {}, pagination = null, calendarIntegration = null }: { appointments: Appointment[]; filters?: Record<string, any>; pagination?: PaginationMeta | null; calendarIntegration?: CalendarIntegration }) {
    const confirm = useConfirm();
    const [open, setOpen] = useState(false);
    const [editing, setEditing] = useState<Appointment | null>(null);
    const form = useForm({
        title: '',
        contact_name: '',
        contact_phone: '',
        scheduled_at: '',
        duration_minutes: 30,
        staff_name: '',
        status: 'scheduled',
        type: '',
        location: '',
        meeting_url: '',
        description: '',
        reminder_enabled: true,
        reminder_minutes_before: 60,
    });
    const openCreate = () => {
        setEditing(null);
        form.setData({ title: '', contact_name: '', contact_phone: '', scheduled_at: '', duration_minutes: 30, staff_name: '', status: 'scheduled', type: '', location: '', meeting_url: '', description: '', reminder_enabled: true, reminder_minutes_before: 60 });
        setOpen(true);
    };
    const openEdit = (appointment: Appointment) => {
        setEditing(appointment);
        form.setData({
            title: appointment.title,
            contact_name: appointment.contact,
            contact_phone: appointment.phone || '',
            scheduled_at: appointment.date ? appointment.date.slice(0, 16) : '',
            duration_minutes: appointment.duration,
            staff_name: appointment.staff === 'Unassigned' ? '' : appointment.staff,
            status: appointment.status,
            type: appointment.type === 'General' ? '' : appointment.type,
            location: appointment.location || '',
            meeting_url: appointment.meetingUrl || '',
            description: appointment.description || '',
            reminder_enabled: appointment.reminderEnabled ?? true,
            reminder_minutes_before: appointment.reminderMinutesBefore ?? 60,
        });
        setOpen(true);
    };
    const save = () => {
        const options = { preserveScroll: true, onSuccess: () => setOpen(false) };
        editing ? form.patch(route('app.appointments.update', editing.id), options) : form.post(route('app.appointments.store'), options);
    };
    const remove = async (appointment: Appointment) => {
        const confirmed = await confirm({
            title: 'Delete appointment',
            message: `Delete "${appointment.title}"? This removes the appointment and reminder state.`,
            confirmText: 'Delete appointment',
            variant: 'danger',
        });
        if (confirmed) router.delete(route('app.appointments.destroy', appointment.id), { preserveScroll: true });
    };
    const sendReminder = (appointment: Appointment) => {
        router.post(route('app.appointments.reminder', appointment.id), {}, { preserveScroll: true });
    };
    const syncCalendar = () => {
        router.post(route('app.integrations.sync', 'google-calendar'), {}, { preserveScroll: true });
    };

    return (
        <AppShell>
            <Head title="Appointments" />
            <AddonPage
                title="Appointments"
                description="Manage Zyptos appointments with optional Google Calendar import/export and WhatsApp reminders."
                actions={<div className="flex flex-wrap gap-2"><Link href={route('app.integrations.index')}><Button type="button" variant="secondary"><Settings2 className="h-4 w-4" />Calendar setup</Button></Link><Button type="button" variant="secondary" onClick={syncCalendar} disabled={!calendarIntegration?.connected}><RefreshCw className="h-4 w-4" />Sync calendar</Button><Button onClick={openCreate}><Plus className="mr-2 h-4 w-4" />New appointment</Button></div>}
            >
                <Card className="border-emerald-100 bg-emerald-50/70 dark:border-emerald-500/20 dark:bg-emerald-500/10">
                    <CardContent className="flex flex-col gap-3 p-4 lg:flex-row lg:items-center lg:justify-between">
                        <div>
                            <div className="text-sm font-semibold text-waify-text dark:text-waify-dark-text">
                                {calendarIntegration?.connected ? 'Google Calendar connected' : 'Google Calendar not connected'}
                            </div>
                            <p className="mt-1 text-xs text-waify-text-muted dark:text-waify-dark-text-muted">
                                {calendarIntegration?.connected
                                    ? `Mode: ${(calendarIntegration.syncDirection || 'import').replace('_', ' ')} · Calendar: ${calendarIntegration.calendarId || 'primary'}${calendarIntegration.createGoogleMeet ? ' · Meet links enabled' : ''}`
                                    : 'Connect Google Calendar from Integrations to import real events or create Google events from Zyptos appointments.'}
                            </p>
                            {calendarIntegration?.lastError && <p className="mt-2 text-xs text-red-600 dark:text-red-300">{calendarIntegration.lastError}</p>}
                        </div>
                        <span className="rounded-full bg-white px-2.5 py-1 text-xs font-semibold text-waify-text-muted dark:bg-waify-dark-surface dark:text-waify-dark-text-muted">
                            {calendarIntegration?.lastSyncAt ? `Last sync ${new Date(calendarIntegration.lastSyncAt).toLocaleString()}` : 'Not synced yet'}
                        </span>
                    </CardContent>
                </Card>
                <StatGrid stats={[
                    { label: 'Upcoming', value: appointments.filter((item) => !['completed', 'cancelled', 'no_show'].includes(item.status)).length, icon: Calendar, tone: 'green' },
                    { label: 'Confirmed', value: appointments.filter((item) => item.status === 'confirmed').length, icon: Clock, tone: 'blue' },
                    { label: 'WhatsApp reminders', value: appointments.filter((item) => item.reminderEnabled).length, icon: MessageCircle, tone: 'purple' },
                    { label: 'Staff assigned', value: new Set(appointments.map((item) => item.staff)).size, icon: UserRound, tone: 'amber' },
                ]} />
                <ServerListControls routeName="app.appointments.index" filters={filters} pagination={pagination} searchPlaceholder="Search appointments, contacts, staff" />
                {appointments.length === 0 ? <EmptyPanel title="No appointments yet" description="Create appointment slots and reminders for this workspace." action={<Button onClick={openCreate}>Create appointment</Button>} /> : (
                    <div className="grid gap-4 xl:grid-cols-2">
                        {appointments.map((item) => (
                            <Card key={item.id}>
                                <CardContent className="p-5">
                                    <div className="flex items-start justify-between gap-4">
                                        <div className="flex min-w-0 gap-4">
                                            <ThemedIconTile tone="green"><Calendar className="h-5 w-5" /></ThemedIconTile>
                                            <div>
                                                <h3 className="font-semibold text-waify-text dark:text-waify-dark-text">{item.title}</h3>
                                                <p className="mt-1 text-sm text-waify-text-muted dark:text-waify-dark-text-muted">{item.contact} · {item.phone || 'No phone'}</p>
                                            </div>
                                        </div>
                                        <MiniStatus status={item.status} />
                                    </div>
                                    <div className="mt-5 grid grid-cols-2 gap-3 text-sm lg:grid-cols-4">
                                        <div><span className="text-waify-text-muted dark:text-waify-dark-text-muted">When</span><p className="font-semibold">{dateLabel(item.date)}</p></div>
                                        <div><span className="text-waify-text-muted dark:text-waify-dark-text-muted">Duration</span><p className="font-semibold">{item.duration} min</p></div>
                                        <div><span className="text-waify-text-muted dark:text-waify-dark-text-muted">Owner</span><p className="font-semibold">{item.staff}</p></div>
                                        <div><span className="text-waify-text-muted dark:text-waify-dark-text-muted">Reminder</span><p className="font-semibold">{item.reminderEnabled ? `${item.reminderMinutesBefore || 60} min before` : 'Off'}</p></div>
                                    </div>
                                    {(item.location || item.meetingUrl || item.source) && (
                                        <div className="mt-4 flex flex-wrap gap-2 text-xs">
                                            {item.location && <span className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-2.5 py-1 text-waify-text-muted dark:bg-waify-dark-surface-2 dark:text-waify-dark-text-muted"><MapPin className="h-3.5 w-3.5" />{item.location}</span>}
                                            {item.meetingUrl && <a href={item.meetingUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 font-medium text-waify-green-dark dark:bg-emerald-500/10 dark:text-emerald-300"><Link2 className="h-3.5 w-3.5" />Meeting link</a>}
                                            {item.source && <span className="rounded-full bg-blue-50 px-2.5 py-1 text-blue-700 dark:bg-blue-500/10 dark:text-blue-300">{item.source.replace('_', ' ')}</span>}
                                        </div>
                                    )}
                                    <div className="mt-5 flex flex-wrap gap-2">
                                        <Button size="sm" variant="primary" onClick={() => sendReminder(item)} disabled={!item.phone}><Send className="h-3.5 w-3.5" />Reminder</Button>
                                        <Button size="sm" variant="secondary" onClick={() => openEdit(item)}><Edit3 className="h-3.5 w-3.5" />Edit</Button>
                                        <Button size="sm" variant="ghost" onClick={() => remove(item)}><Trash2 className="h-3.5 w-3.5" />Delete</Button>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}
                <Modal open={open} onClose={() => setOpen(false)} title={editing ? 'Edit appointment' : 'New appointment'} description="Saved to this workspace." footer={<><Button variant="secondary" onClick={() => setOpen(false)}>Cancel</Button><Button onClick={save} disabled={form.processing}>Save</Button></>}>
                    <div className="grid gap-3 sm:grid-cols-2">
                        <label className="sm:col-span-2 text-sm font-medium text-waify-text dark:text-waify-dark-text">Title<Input className="mt-1" value={form.data.title} onChange={(e) => form.setData('title', e.target.value)} /></label>
                        <label className="text-sm font-medium text-waify-text dark:text-waify-dark-text">Contact<Input className="mt-1" value={form.data.contact_name} onChange={(e) => form.setData('contact_name', e.target.value)} /></label>
                        <label className="text-sm font-medium text-waify-text dark:text-waify-dark-text">Phone<Input className="mt-1" value={form.data.contact_phone} onChange={(e) => form.setData('contact_phone', e.target.value)} /></label>
                        <label className="text-sm font-medium text-waify-text dark:text-waify-dark-text">When<Input className="mt-1" type="datetime-local" value={form.data.scheduled_at} onChange={(e) => form.setData('scheduled_at', e.target.value)} /></label>
                        <label className="text-sm font-medium text-waify-text dark:text-waify-dark-text">Duration<Input className="mt-1" type="number" value={form.data.duration_minutes} onChange={(e) => form.setData('duration_minutes', Number(e.target.value))} /></label>
                        <label className="text-sm font-medium text-waify-text dark:text-waify-dark-text">Staff<Input className="mt-1" value={form.data.staff_name} onChange={(e) => form.setData('staff_name', e.target.value)} /></label>
                        <label className="text-sm font-medium text-waify-text dark:text-waify-dark-text">Type<Input className="mt-1" value={form.data.type} onChange={(e) => form.setData('type', e.target.value)} /></label>
                        <label className="text-sm font-medium text-waify-text dark:text-waify-dark-text">Location<Input className="mt-1" value={form.data.location} onChange={(e) => form.setData('location', e.target.value)} /></label>
                        <label className="text-sm font-medium text-waify-text dark:text-waify-dark-text">Meeting URL<Input className="mt-1" value={form.data.meeting_url} onChange={(e) => form.setData('meeting_url', e.target.value)} placeholder="https://meet.google.com/..." /></label>
                        <label className="text-sm font-medium text-waify-text dark:text-waify-dark-text">Status<select className="waify-input mt-1" value={form.data.status} onChange={(e) => form.setData('status', e.target.value)}><option value="scheduled">Scheduled</option><option value="confirmed">Confirmed</option><option value="completed">Completed</option><option value="cancelled">Cancelled</option><option value="no_show">No show</option></select></label>
                        <label className="text-sm font-medium text-waify-text dark:text-waify-dark-text">Reminder minutes before<Input className="mt-1" type="number" value={form.data.reminder_minutes_before} onChange={(e) => form.setData('reminder_minutes_before', Number(e.target.value))} /></label>
                        <label className="sm:col-span-2 text-sm font-medium text-waify-text dark:text-waify-dark-text">Notes<textarea className="waify-input mt-1 min-h-20 py-2" value={form.data.description} onChange={(e) => form.setData('description', e.target.value)} /></label>
                        <label className="sm:col-span-2 flex items-center gap-2 text-sm font-medium text-waify-text dark:text-waify-dark-text"><input type="checkbox" checked={form.data.reminder_enabled} onChange={(e) => form.setData('reminder_enabled', e.target.checked)} />Enable WhatsApp reminders for this appointment</label>
                    </div>
                </Modal>
            </AddonPage>
        </AppShell>
    );
}
