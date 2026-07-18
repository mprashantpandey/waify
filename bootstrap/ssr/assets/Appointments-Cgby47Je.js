import { jsxs, jsx, Fragment } from "react/jsx-runtime";
import { useForm, Head, Link, router } from "@inertiajs/react";
import { useState } from "react";
import { A as AppShell } from "./AppShell-BMIA1AnI.js";
import { C as Card, a as CardContent } from "./Card-BtIXZ0GS.js";
import { AddonPage, StatGrid, ServerListControls, EmptyPanel, MiniStatus } from "./Shared-BnBdIg9m.js";
import { T as ThemedIconTile, M as Modal } from "./Elements-EbyZDnT_.js";
import { B as Button } from "./Button-BJftGNki.js";
import { I as Input } from "./Input-DGMAswN3.js";
import { Calendar, Clock, MessageCircle, UserRound, MapPin, Link2, Send, Edit3, Trash2, Settings2, RefreshCw, Plus } from "lucide-react";
import { u as useConfirm } from "./useConfirm-gGqxmsEz.js";
import "./utils-B2ZNUmII.js";
import "clsx";
import "tailwind-merge";
import "./BrandLogo-TeztHB0m.js";
import "axios";
import "./Badge-C65MHc2S.js";
import "./BrandingWrapper-DdVUILzh.js";
import "./useToast-BN7qsQL3.js";
import "./CookieConsentBanner-X10ew4Dy.js";
import "./RealtimeProvider-D1qLzQY9.js";
import "laravel-echo";
import "pusher-js";
import "@headlessui/react";
function dateLabel(value) {
  return new Date(value).toLocaleString("en-IN", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });
}
function Appointments({ appointments = [], filters = {}, pagination = null, calendarIntegration = null }) {
  const confirm = useConfirm();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const form = useForm({
    title: "",
    contact_name: "",
    contact_phone: "",
    scheduled_at: "",
    duration_minutes: 30,
    staff_name: "",
    status: "scheduled",
    type: "",
    location: "",
    meeting_url: "",
    description: "",
    reminder_enabled: true,
    reminder_minutes_before: 60
  });
  const openCreate = () => {
    setEditing(null);
    form.setData({ title: "", contact_name: "", contact_phone: "", scheduled_at: "", duration_minutes: 30, staff_name: "", status: "scheduled", type: "", location: "", meeting_url: "", description: "", reminder_enabled: true, reminder_minutes_before: 60 });
    setOpen(true);
  };
  const openEdit = (appointment) => {
    setEditing(appointment);
    form.setData({
      title: appointment.title,
      contact_name: appointment.contact,
      contact_phone: appointment.phone || "",
      scheduled_at: appointment.date ? appointment.date.slice(0, 16) : "",
      duration_minutes: appointment.duration,
      staff_name: appointment.staff === "Unassigned" ? "" : appointment.staff,
      status: appointment.status,
      type: appointment.type === "General" ? "" : appointment.type,
      location: appointment.location || "",
      meeting_url: appointment.meetingUrl || "",
      description: appointment.description || "",
      reminder_enabled: appointment.reminderEnabled ?? true,
      reminder_minutes_before: appointment.reminderMinutesBefore ?? 60
    });
    setOpen(true);
  };
  const save = () => {
    const options = { preserveScroll: true, onSuccess: () => setOpen(false) };
    editing ? form.patch(route("app.appointments.update", editing.id), options) : form.post(route("app.appointments.store"), options);
  };
  const remove = async (appointment) => {
    const confirmed = await confirm({
      title: "Delete appointment",
      message: `Delete "${appointment.title}"? This removes the appointment and reminder state.`,
      confirmText: "Delete appointment",
      variant: "danger"
    });
    if (confirmed) router.delete(route("app.appointments.destroy", appointment.id), { preserveScroll: true });
  };
  const sendReminder = (appointment) => {
    router.post(route("app.appointments.reminder", appointment.id), {}, { preserveScroll: true });
  };
  const syncCalendar = () => {
    router.post(route("app.integrations.sync", "google-calendar"), {}, { preserveScroll: true });
  };
  return /* @__PURE__ */ jsxs(AppShell, { children: [
    /* @__PURE__ */ jsx(Head, { title: "Appointments" }),
    /* @__PURE__ */ jsxs(
      AddonPage,
      {
        title: "Appointments",
        description: "Manage Zyptos appointments with optional Google Calendar import/export and WhatsApp reminders.",
        actions: /* @__PURE__ */ jsxs("div", { className: "flex flex-wrap gap-2", children: [
          /* @__PURE__ */ jsx(Link, { href: route("app.integrations.index"), children: /* @__PURE__ */ jsxs(Button, { type: "button", variant: "secondary", children: [
            /* @__PURE__ */ jsx(Settings2, { className: "h-4 w-4" }),
            "Calendar setup"
          ] }) }),
          /* @__PURE__ */ jsxs(Button, { type: "button", variant: "secondary", onClick: syncCalendar, disabled: !calendarIntegration?.connected, children: [
            /* @__PURE__ */ jsx(RefreshCw, { className: "h-4 w-4" }),
            "Sync calendar"
          ] }),
          /* @__PURE__ */ jsxs(Button, { onClick: openCreate, children: [
            /* @__PURE__ */ jsx(Plus, { className: "mr-2 h-4 w-4" }),
            "New appointment"
          ] })
        ] }),
        children: [
          /* @__PURE__ */ jsx(Card, { className: "border-emerald-100 bg-emerald-50/70 dark:border-emerald-500/20 dark:bg-emerald-500/10", children: /* @__PURE__ */ jsxs(CardContent, { className: "flex flex-col gap-3 p-4 lg:flex-row lg:items-center lg:justify-between", children: [
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx("div", { className: "text-sm font-semibold text-waify-text dark:text-waify-dark-text", children: calendarIntegration?.connected ? "Google Calendar connected" : "Google Calendar not connected" }),
              /* @__PURE__ */ jsx("p", { className: "mt-1 text-xs text-waify-text-muted dark:text-waify-dark-text-muted", children: calendarIntegration?.connected ? `Mode: ${(calendarIntegration.syncDirection || "import").replace("_", " ")} · Calendar: ${calendarIntegration.calendarId || "primary"}${calendarIntegration.createGoogleMeet ? " · Meet links enabled" : ""}` : "Connect Google Calendar from Integrations to import real events or create Google events from Zyptos appointments." }),
              calendarIntegration?.lastError && /* @__PURE__ */ jsx("p", { className: "mt-2 text-xs text-red-600 dark:text-red-300", children: calendarIntegration.lastError })
            ] }),
            /* @__PURE__ */ jsx("span", { className: "rounded-full bg-white px-2.5 py-1 text-xs font-semibold text-waify-text-muted dark:bg-waify-dark-surface dark:text-waify-dark-text-muted", children: calendarIntegration?.lastSyncAt ? `Last sync ${new Date(calendarIntegration.lastSyncAt).toLocaleString()}` : "Not synced yet" })
          ] }) }),
          /* @__PURE__ */ jsx(StatGrid, { stats: [
            { label: "Upcoming", value: appointments.filter((item) => !["completed", "cancelled", "no_show"].includes(item.status)).length, icon: Calendar, tone: "green" },
            { label: "Confirmed", value: appointments.filter((item) => item.status === "confirmed").length, icon: Clock, tone: "blue" },
            { label: "WhatsApp reminders", value: appointments.filter((item) => item.reminderEnabled).length, icon: MessageCircle, tone: "purple" },
            { label: "Staff assigned", value: new Set(appointments.map((item) => item.staff)).size, icon: UserRound, tone: "amber" }
          ] }),
          /* @__PURE__ */ jsx(ServerListControls, { routeName: "app.appointments.index", filters, pagination, searchPlaceholder: "Search appointments, contacts, staff" }),
          appointments.length === 0 ? /* @__PURE__ */ jsx(EmptyPanel, { title: "No appointments yet", description: "Create appointment slots and reminders for this workspace.", action: /* @__PURE__ */ jsx(Button, { onClick: openCreate, children: "Create appointment" }) }) : /* @__PURE__ */ jsx("div", { className: "grid gap-4 xl:grid-cols-2", children: appointments.map((item) => /* @__PURE__ */ jsx(Card, { children: /* @__PURE__ */ jsxs(CardContent, { className: "p-5", children: [
            /* @__PURE__ */ jsxs("div", { className: "flex items-start justify-between gap-4", children: [
              /* @__PURE__ */ jsxs("div", { className: "flex min-w-0 gap-4", children: [
                /* @__PURE__ */ jsx(ThemedIconTile, { tone: "green", children: /* @__PURE__ */ jsx(Calendar, { className: "h-5 w-5" }) }),
                /* @__PURE__ */ jsxs("div", { children: [
                  /* @__PURE__ */ jsx("h3", { className: "font-semibold text-waify-text dark:text-waify-dark-text", children: item.title }),
                  /* @__PURE__ */ jsxs("p", { className: "mt-1 text-sm text-waify-text-muted dark:text-waify-dark-text-muted", children: [
                    item.contact,
                    " · ",
                    item.phone || "No phone"
                  ] })
                ] })
              ] }),
              /* @__PURE__ */ jsx(MiniStatus, { status: item.status })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "mt-5 grid grid-cols-2 gap-3 text-sm lg:grid-cols-4", children: [
              /* @__PURE__ */ jsxs("div", { children: [
                /* @__PURE__ */ jsx("span", { className: "text-waify-text-muted dark:text-waify-dark-text-muted", children: "When" }),
                /* @__PURE__ */ jsx("p", { className: "font-semibold", children: dateLabel(item.date) })
              ] }),
              /* @__PURE__ */ jsxs("div", { children: [
                /* @__PURE__ */ jsx("span", { className: "text-waify-text-muted dark:text-waify-dark-text-muted", children: "Duration" }),
                /* @__PURE__ */ jsxs("p", { className: "font-semibold", children: [
                  item.duration,
                  " min"
                ] })
              ] }),
              /* @__PURE__ */ jsxs("div", { children: [
                /* @__PURE__ */ jsx("span", { className: "text-waify-text-muted dark:text-waify-dark-text-muted", children: "Owner" }),
                /* @__PURE__ */ jsx("p", { className: "font-semibold", children: item.staff })
              ] }),
              /* @__PURE__ */ jsxs("div", { children: [
                /* @__PURE__ */ jsx("span", { className: "text-waify-text-muted dark:text-waify-dark-text-muted", children: "Reminder" }),
                /* @__PURE__ */ jsx("p", { className: "font-semibold", children: item.reminderEnabled ? `${item.reminderMinutesBefore || 60} min before` : "Off" })
              ] })
            ] }),
            (item.location || item.meetingUrl || item.source) && /* @__PURE__ */ jsxs("div", { className: "mt-4 flex flex-wrap gap-2 text-xs", children: [
              item.location && /* @__PURE__ */ jsxs("span", { className: "inline-flex items-center gap-1 rounded-full bg-gray-100 px-2.5 py-1 text-waify-text-muted dark:bg-waify-dark-surface-2 dark:text-waify-dark-text-muted", children: [
                /* @__PURE__ */ jsx(MapPin, { className: "h-3.5 w-3.5" }),
                item.location
              ] }),
              item.meetingUrl && /* @__PURE__ */ jsxs("a", { href: item.meetingUrl, target: "_blank", rel: "noreferrer", className: "inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 font-medium text-waify-green-dark dark:bg-emerald-500/10 dark:text-emerald-300", children: [
                /* @__PURE__ */ jsx(Link2, { className: "h-3.5 w-3.5" }),
                "Meeting link"
              ] }),
              item.source && /* @__PURE__ */ jsx("span", { className: "rounded-full bg-blue-50 px-2.5 py-1 text-blue-700 dark:bg-blue-500/10 dark:text-blue-300", children: item.source.replace("_", " ") })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "mt-5 flex flex-wrap gap-2", children: [
              /* @__PURE__ */ jsxs(Button, { size: "sm", variant: "primary", onClick: () => sendReminder(item), disabled: !item.phone, children: [
                /* @__PURE__ */ jsx(Send, { className: "h-3.5 w-3.5" }),
                "Reminder"
              ] }),
              /* @__PURE__ */ jsxs(Button, { size: "sm", variant: "secondary", onClick: () => openEdit(item), children: [
                /* @__PURE__ */ jsx(Edit3, { className: "h-3.5 w-3.5" }),
                "Edit"
              ] }),
              /* @__PURE__ */ jsxs(Button, { size: "sm", variant: "ghost", onClick: () => remove(item), children: [
                /* @__PURE__ */ jsx(Trash2, { className: "h-3.5 w-3.5" }),
                "Delete"
              ] })
            ] })
          ] }) }, item.id)) }),
          /* @__PURE__ */ jsx(Modal, { open, onClose: () => setOpen(false), title: editing ? "Edit appointment" : "New appointment", description: "Saved to this workspace.", footer: /* @__PURE__ */ jsxs(Fragment, { children: [
            /* @__PURE__ */ jsx(Button, { variant: "secondary", onClick: () => setOpen(false), children: "Cancel" }),
            /* @__PURE__ */ jsx(Button, { onClick: save, disabled: form.processing, children: "Save" })
          ] }), children: /* @__PURE__ */ jsxs("div", { className: "grid gap-3 sm:grid-cols-2", children: [
            /* @__PURE__ */ jsxs("label", { className: "sm:col-span-2 text-sm font-medium text-waify-text dark:text-waify-dark-text", children: [
              "Title",
              /* @__PURE__ */ jsx(Input, { className: "mt-1", value: form.data.title, onChange: (e) => form.setData("title", e.target.value) })
            ] }),
            /* @__PURE__ */ jsxs("label", { className: "text-sm font-medium text-waify-text dark:text-waify-dark-text", children: [
              "Contact",
              /* @__PURE__ */ jsx(Input, { className: "mt-1", value: form.data.contact_name, onChange: (e) => form.setData("contact_name", e.target.value) })
            ] }),
            /* @__PURE__ */ jsxs("label", { className: "text-sm font-medium text-waify-text dark:text-waify-dark-text", children: [
              "Phone",
              /* @__PURE__ */ jsx(Input, { className: "mt-1", value: form.data.contact_phone, onChange: (e) => form.setData("contact_phone", e.target.value) })
            ] }),
            /* @__PURE__ */ jsxs("label", { className: "text-sm font-medium text-waify-text dark:text-waify-dark-text", children: [
              "When",
              /* @__PURE__ */ jsx(Input, { className: "mt-1", type: "datetime-local", value: form.data.scheduled_at, onChange: (e) => form.setData("scheduled_at", e.target.value) })
            ] }),
            /* @__PURE__ */ jsxs("label", { className: "text-sm font-medium text-waify-text dark:text-waify-dark-text", children: [
              "Duration",
              /* @__PURE__ */ jsx(Input, { className: "mt-1", type: "number", value: form.data.duration_minutes, onChange: (e) => form.setData("duration_minutes", Number(e.target.value)) })
            ] }),
            /* @__PURE__ */ jsxs("label", { className: "text-sm font-medium text-waify-text dark:text-waify-dark-text", children: [
              "Staff",
              /* @__PURE__ */ jsx(Input, { className: "mt-1", value: form.data.staff_name, onChange: (e) => form.setData("staff_name", e.target.value) })
            ] }),
            /* @__PURE__ */ jsxs("label", { className: "text-sm font-medium text-waify-text dark:text-waify-dark-text", children: [
              "Type",
              /* @__PURE__ */ jsx(Input, { className: "mt-1", value: form.data.type, onChange: (e) => form.setData("type", e.target.value) })
            ] }),
            /* @__PURE__ */ jsxs("label", { className: "text-sm font-medium text-waify-text dark:text-waify-dark-text", children: [
              "Location",
              /* @__PURE__ */ jsx(Input, { className: "mt-1", value: form.data.location, onChange: (e) => form.setData("location", e.target.value) })
            ] }),
            /* @__PURE__ */ jsxs("label", { className: "text-sm font-medium text-waify-text dark:text-waify-dark-text", children: [
              "Meeting URL",
              /* @__PURE__ */ jsx(Input, { className: "mt-1", value: form.data.meeting_url, onChange: (e) => form.setData("meeting_url", e.target.value), placeholder: "https://meet.google.com/..." })
            ] }),
            /* @__PURE__ */ jsxs("label", { className: "text-sm font-medium text-waify-text dark:text-waify-dark-text", children: [
              "Status",
              /* @__PURE__ */ jsxs("select", { className: "waify-input mt-1", value: form.data.status, onChange: (e) => form.setData("status", e.target.value), children: [
                /* @__PURE__ */ jsx("option", { value: "scheduled", children: "Scheduled" }),
                /* @__PURE__ */ jsx("option", { value: "confirmed", children: "Confirmed" }),
                /* @__PURE__ */ jsx("option", { value: "completed", children: "Completed" }),
                /* @__PURE__ */ jsx("option", { value: "cancelled", children: "Cancelled" }),
                /* @__PURE__ */ jsx("option", { value: "no_show", children: "No show" })
              ] })
            ] }),
            /* @__PURE__ */ jsxs("label", { className: "text-sm font-medium text-waify-text dark:text-waify-dark-text", children: [
              "Reminder minutes before",
              /* @__PURE__ */ jsx(Input, { className: "mt-1", type: "number", value: form.data.reminder_minutes_before, onChange: (e) => form.setData("reminder_minutes_before", Number(e.target.value)) })
            ] }),
            /* @__PURE__ */ jsxs("label", { className: "sm:col-span-2 text-sm font-medium text-waify-text dark:text-waify-dark-text", children: [
              "Notes",
              /* @__PURE__ */ jsx("textarea", { className: "waify-input mt-1 min-h-20 py-2", value: form.data.description, onChange: (e) => form.setData("description", e.target.value) })
            ] }),
            /* @__PURE__ */ jsxs("label", { className: "sm:col-span-2 flex items-center gap-2 text-sm font-medium text-waify-text dark:text-waify-dark-text", children: [
              /* @__PURE__ */ jsx("input", { type: "checkbox", checked: form.data.reminder_enabled, onChange: (e) => form.setData("reminder_enabled", e.target.checked) }),
              "Enable WhatsApp reminders for this appointment"
            ] })
          ] }) })
        ]
      }
    )
  ] });
}
export {
  Appointments as default
};
