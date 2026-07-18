import { jsxs, jsx, Fragment } from "react/jsx-runtime";
import { router, Head, Link, useForm } from "@inertiajs/react";
import { useState, useEffect, useMemo } from "react";
import { Megaphone, Users, Send, BarChart3, Search, Download, Plus, Calendar, Copy, MoreVertical, Play, Pause, RotateCcw, XCircle, Trash2, CheckCircle2, Clock } from "lucide-react";
import { A as AppShell } from "./AppShell-BMIA1AnI.js";
import { B as Badge } from "./Badge-C65MHc2S.js";
import { B as Button } from "./Button-BJftGNki.js";
import { C as Card, a as CardContent } from "./Card-BtIXZ0GS.js";
import { E as EmptyState } from "./EmptyState-DZrNEInH.js";
import { T as ThemedIconTile, I as IconButton, D as Drawer } from "./Elements-EbyZDnT_.js";
import { P as Progress } from "./Progress-Dq7CiVNZ.js";
import { T as TextInput } from "./TextInput-CmkZX80k.js";
import { I as InputError } from "./InputError-DiSBWiye.js";
import { u as useConfirm } from "./useConfirm-gGqxmsEz.js";
import "./utils-B2ZNUmII.js";
import "clsx";
import "tailwind-merge";
import "./BrandLogo-TeztHB0m.js";
import "axios";
import "./BrandingWrapper-DdVUILzh.js";
import "./useToast-BN7qsQL3.js";
import "./CookieConsentBanner-X10ew4Dy.js";
import "./RealtimeProvider-D1qLzQY9.js";
import "laravel-echo";
import "pusher-js";
import "@headlessui/react";
function paginationLabel(label) {
  return String(label ?? "").replace(/&laquo;\s*/g, "Previous").replace(/\s*&raquo;/g, "Next").replace(/&amp;/g, "&").replace(/<[^>]*>/g, "").trim();
}
function formatNumber(value) {
  const numeric = Number(value ?? 0);
  return Number.isFinite(numeric) ? new Intl.NumberFormat("en-IN").format(numeric) : "0";
}
function clampRate(value) {
  return Math.max(0, Math.min(100, Math.round(Number.isFinite(value) ? value : 0)));
}
function formatDate(date) {
  if (!date) return "Not scheduled";
  const parsed = new Date(date);
  if (Number.isNaN(parsed.getTime())) return date;
  return parsed.toLocaleString("en-IN", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit"
  });
}
function campaignStatus(status) {
  const statusMap = {
    draft: { variant: "default", label: "Draft", icon: Clock },
    scheduled: { variant: "info", label: "Scheduled", icon: Clock },
    sending: { variant: "info", label: "Sending", icon: Play },
    paused: { variant: "warning", label: "Paused", icon: Pause },
    completed: { variant: "success", label: "Completed", icon: CheckCircle2 },
    cancelled: { variant: "danger", label: "Cancelled", icon: XCircle }
  };
  return statusMap[status] || { variant: "default", label: status, icon: Clock };
}
function CampaignCard({ campaign }) {
  const confirm = useConfirm();
  const [menuOpen, setMenuOpen] = useState(false);
  const status = campaignStatus(campaign.status);
  const StatusIcon = status.icon;
  const totalRecipients = Math.max(0, Number(campaign.total_recipients || 0));
  const sentCount = Math.max(0, Number(campaign.sent_count || 0));
  const deliveredCount = Math.min(totalRecipients, Math.max(0, Number(campaign.delivered_count || 0)));
  const readCount = Math.min(deliveredCount, Math.max(0, Number(campaign.read_count || 0)));
  const failedCount = Math.max(0, Number(campaign.failed_count || 0));
  const readRate = deliveredCount > 0 ? clampRate(readCount / deliveredCount * 100) : 0;
  const deliveryRate = totalRecipients > 0 ? clampRate(deliveredCount / totalRecipients * 100) : 0;
  const processed = Math.min(totalRecipients, sentCount + failedCount);
  const processedRate = totalRecipients > 0 ? clampRate(processed / totalRecipients * 100) : 0;
  const date = campaign.scheduled_at || campaign.completed_at || campaign.started_at || campaign.created_at;
  const canStart = ["draft", "scheduled", "paused"].includes(campaign.status) && campaign.total_recipients > 0;
  const canPause = campaign.status === "sending";
  const canCancel = ["draft", "scheduled", "sending", "paused"].includes(campaign.status);
  const canDelete = ["draft", "cancelled", "completed"].includes(campaign.status);
  const canRetry = failedCount > 0 && ["sending", "completed", "paused", "cancelled"].includes(campaign.status);
  const postAction = (routeName) => {
    setMenuOpen(false);
    router.post(route(routeName, { campaign: campaign.slug }), {}, {
      preserveScroll: true
    });
  };
  const duplicate = () => postAction("app.broadcasts.duplicate");
  const deleteCampaign = async () => {
    setMenuOpen(false);
    const confirmed = await confirm({
      title: "Move campaign to recovery bin",
      message: `Move "${campaign.name}" to the recovery bin?`,
      confirmText: "Move campaign",
      variant: "danger"
    });
    if (!confirmed) return;
    router.delete(route("app.broadcasts.destroy", { campaign: campaign.slug }), {
      preserveScroll: true
    });
  };
  const cancelCampaign = async () => {
    setMenuOpen(false);
    const confirmed = await confirm({
      title: "Cancel campaign",
      message: `Cancel "${campaign.name}"? Queued sends for this campaign will stop.`,
      confirmText: "Cancel campaign",
      variant: "warning"
    });
    if (!confirmed) return;
    router.post(route("app.broadcasts.cancel", { campaign: campaign.slug }), {}, {
      preserveScroll: true
    });
  };
  const menuItemClass = "flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-sm font-medium text-waify-text transition hover:bg-gray-100 dark:text-waify-dark-text dark:hover:bg-waify-dark-surface-2 disabled:cursor-not-allowed disabled:opacity-45";
  const dangerMenuItemClass = "flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-sm font-medium text-red-600 transition hover:bg-red-50 dark:text-red-300 dark:hover:bg-red-500/10 disabled:cursor-not-allowed disabled:opacity-45";
  return /* @__PURE__ */ jsx(Card, { className: "group border-transparent transition-all hover:-translate-y-0.5 hover:shadow-card-lg dark:border-slate-700/80", children: /* @__PURE__ */ jsxs(CardContent, { className: "p-5", children: [
    /* @__PURE__ */ jsxs("div", { className: "mb-3 flex items-start justify-between gap-3", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex min-w-0 items-center gap-2", children: [
        /* @__PURE__ */ jsx("div", { className: "flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-waify-green-soft text-waify-green-dark dark:bg-waify-dark-green-soft dark:text-emerald-200", children: /* @__PURE__ */ jsx(Megaphone, { className: "h-4 w-4" }) }),
        /* @__PURE__ */ jsxs("div", { className: "min-w-0", children: [
          /* @__PURE__ */ jsxs("p", { className: "text-[11px] font-semibold uppercase tracking-wide text-waify-text-muted dark:text-waify-dark-text-muted", children: [
            "WhatsApp · ",
            campaign.type
          ] }),
          /* @__PURE__ */ jsx(Link, { href: route("app.broadcasts.index", { campaign: campaign.slug }), className: "line-clamp-2 min-h-10 font-semibold leading-snug text-waify-text hover:text-waify-green-dark dark:text-waify-dark-text dark:hover:text-emerald-300", children: campaign.name })
        ] })
      ] }),
      /* @__PURE__ */ jsxs(Badge, { variant: status.variant, className: "gap-1", children: [
        /* @__PURE__ */ jsx(StatusIcon, { className: "h-3 w-3" }),
        status.label
      ] })
    ] }),
    campaign.description && /* @__PURE__ */ jsx("p", { className: "mb-3 line-clamp-2 text-sm text-waify-text-muted dark:text-waify-dark-text-muted", children: campaign.description }),
    /* @__PURE__ */ jsxs("div", { className: "flex flex-wrap items-center gap-x-3 gap-y-2 text-xs text-waify-text-muted dark:text-waify-dark-text-muted", children: [
      /* @__PURE__ */ jsxs("span", { className: "flex items-center gap-1", children: [
        /* @__PURE__ */ jsx(Users, { className: "h-3.5 w-3.5" }),
        formatNumber(campaign.total_recipients),
        " contacts"
      ] }),
      /* @__PURE__ */ jsxs("span", { className: "flex items-center gap-1", children: [
        /* @__PURE__ */ jsx(Calendar, { className: "h-3.5 w-3.5" }),
        formatDate(date)
      ] }),
      campaign.connection && /* @__PURE__ */ jsxs("span", { className: "truncate", children: [
        "via ",
        campaign.connection.name
      ] })
    ] }),
    campaign.status !== "draft" && campaign.status !== "scheduled" ? /* @__PURE__ */ jsxs("div", { className: "mt-4 space-y-3", children: [
      /* @__PURE__ */ jsxs("div", { className: `rounded-lg border p-3 ${failedCount > 0 ? "border-red-100 bg-red-50 text-red-700 dark:border-red-500/20 dark:bg-red-500/10 dark:text-red-200" : "border-emerald-100 bg-emerald-50 text-emerald-700 dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-200"}`, children: [
        /* @__PURE__ */ jsxs("div", { className: "mb-1.5 flex items-center justify-between text-xs font-semibold", children: [
          /* @__PURE__ */ jsx("span", { children: failedCount > 0 ? `${formatNumber(failedCount)} failed recipient${failedCount === 1 ? "" : "s"}` : "Sending progress" }),
          /* @__PURE__ */ jsx("span", { children: failedCount > 0 ? "Retry available" : `${processedRate}%` })
        ] }),
        /* @__PURE__ */ jsx(Progress, { value: processedRate, variant: failedCount > 0 ? "danger" : "success" }),
        /* @__PURE__ */ jsxs("div", { className: "mt-2 flex items-center justify-between gap-2 text-[11px]", children: [
          /* @__PURE__ */ jsxs("span", { children: [
            formatNumber(processed),
            " of ",
            formatNumber(campaign.total_recipients),
            " processed"
          ] }),
          canRetry && /* @__PURE__ */ jsx("button", { type: "button", onClick: () => postAction("app.broadcasts.retry-failed"), className: "font-semibold hover:underline", children: "Retry failed" })
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsxs("div", { className: "mb-1.5 flex items-center justify-between text-xs", children: [
          /* @__PURE__ */ jsx("span", { className: "text-waify-text-muted dark:text-waify-dark-text-muted", children: "Delivery rate · audience" }),
          /* @__PURE__ */ jsxs("span", { className: "font-semibold text-waify-text tabular-nums dark:text-waify-dark-text", children: [
            deliveryRate,
            "%"
          ] })
        ] }),
        /* @__PURE__ */ jsx(Progress, { value: deliveryRate })
      ] }),
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsxs("div", { className: "mb-1.5 flex items-center justify-between text-xs", children: [
          /* @__PURE__ */ jsx("span", { className: "text-waify-text-muted dark:text-waify-dark-text-muted", children: "Read rate · delivered" }),
          /* @__PURE__ */ jsxs("span", { className: "font-semibold text-waify-text tabular-nums dark:text-waify-dark-text", children: [
            readRate,
            "%"
          ] })
        ] }),
        /* @__PURE__ */ jsx(Progress, { value: readRate, variant: "success" })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-3 gap-2 border-t border-gray-100 pt-3 text-xs dark:border-waify-dark-border", children: [
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("p", { className: "text-waify-text-muted dark:text-waify-dark-text-muted", children: "Sent" }),
          /* @__PURE__ */ jsx("p", { className: "font-semibold text-waify-text dark:text-waify-dark-text", children: formatNumber(sentCount) })
        ] }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("p", { className: "text-waify-text-muted dark:text-waify-dark-text-muted", children: "Read" }),
          /* @__PURE__ */ jsx("p", { className: "font-semibold text-waify-text dark:text-waify-dark-text", children: formatNumber(readCount) })
        ] }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("p", { className: "text-waify-text-muted dark:text-waify-dark-text-muted", children: "Failed" }),
          /* @__PURE__ */ jsx("p", { className: "font-semibold text-waify-text dark:text-waify-dark-text", children: formatNumber(failedCount) })
        ] })
      ] })
    ] }) : /* @__PURE__ */ jsx("div", { className: "mt-4 rounded-md bg-gray-50 px-3 py-2.5 text-xs text-waify-text-muted ring-1 ring-gray-100 dark:bg-waify-dark-surface-2 dark:text-waify-dark-text-muted dark:ring-waify-dark-border", children: campaign.status === "scheduled" ? "Awaiting scheduled send" : "Draft, not yet sent" }),
    /* @__PURE__ */ jsxs("div", { className: "mt-4 flex items-center gap-2 border-t border-gray-100 pt-4 dark:border-waify-dark-border", children: [
      /* @__PURE__ */ jsx(Link, { href: route("app.broadcasts.index", { campaign: campaign.slug }), className: "flex-1", children: /* @__PURE__ */ jsxs(Button, { variant: "secondary", size: "sm", className: "w-full", children: [
        /* @__PURE__ */ jsx(BarChart3, { className: "h-3.5 w-3.5" }),
        "Report"
      ] }) }),
      /* @__PURE__ */ jsxs(Button, { type: "button", variant: "secondary", size: "sm", className: "flex-1", onClick: duplicate, children: [
        /* @__PURE__ */ jsx(Copy, { className: "h-3.5 w-3.5" }),
        "Duplicate"
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "relative", children: [
        /* @__PURE__ */ jsx(
          IconButton,
          {
            size: "sm",
            variant: "ghost",
            "aria-label": "More campaign actions",
            "aria-expanded": menuOpen,
            onClick: () => setMenuOpen((open) => !open),
            children: /* @__PURE__ */ jsx(MoreVertical, { className: "h-4 w-4" })
          }
        ),
        menuOpen && /* @__PURE__ */ jsxs(Fragment, { children: [
          /* @__PURE__ */ jsx(
            "button",
            {
              type: "button",
              "aria-label": "Close campaign menu",
              className: "fixed inset-0 z-30 cursor-default",
              onClick: () => setMenuOpen(false)
            }
          ),
          /* @__PURE__ */ jsxs("div", { className: "absolute bottom-10 right-0 z-40 w-56 rounded-lg border border-gray-200 bg-white p-1.5 shadow-dropdown dark:border-waify-dark-border dark:bg-waify-dark-surface", children: [
            /* @__PURE__ */ jsxs("button", { type: "button", className: menuItemClass, onClick: () => postAction("app.broadcasts.start"), disabled: !canStart, children: [
              /* @__PURE__ */ jsx(Play, { className: "h-4 w-4" }),
              "Start campaign"
            ] }),
            /* @__PURE__ */ jsxs("button", { type: "button", className: menuItemClass, onClick: () => postAction("app.broadcasts.pause"), disabled: !canPause, children: [
              /* @__PURE__ */ jsx(Pause, { className: "h-4 w-4" }),
              "Pause sending"
            ] }),
            /* @__PURE__ */ jsxs("button", { type: "button", className: menuItemClass, onClick: () => postAction("app.broadcasts.retry-failed"), disabled: !canRetry, children: [
              /* @__PURE__ */ jsx(RotateCcw, { className: "h-4 w-4" }),
              "Retry failed"
            ] }),
            /* @__PURE__ */ jsxs("button", { type: "button", className: menuItemClass, onClick: duplicate, children: [
              /* @__PURE__ */ jsx(Copy, { className: "h-4 w-4" }),
              "Duplicate"
            ] }),
            /* @__PURE__ */ jsx("div", { className: "my-1 border-t border-gray-100 dark:border-waify-dark-border" }),
            /* @__PURE__ */ jsxs("button", { type: "button", className: dangerMenuItemClass, onClick: cancelCampaign, disabled: !canCancel, children: [
              /* @__PURE__ */ jsx(XCircle, { className: "h-4 w-4" }),
              "Cancel campaign"
            ] }),
            /* @__PURE__ */ jsxs("button", { type: "button", className: dangerMenuItemClass, onClick: deleteCampaign, disabled: !canDelete, children: [
              /* @__PURE__ */ jsx(Trash2, { className: "h-4 w-4" }),
              "Delete campaign"
            ] })
          ] })
        ] })
      ] })
    ] })
  ] }) });
}
function CampaignCreateDrawer({
  open,
  onClose,
  options
}) {
  const workspaceConnection = options.connections[0] || null;
  const form = useForm({
    name: "",
    description: "",
    type: "template",
    whatsapp_connection_id: workspaceConnection ? String(workspaceConnection.id) : "",
    whatsapp_template_id: "",
    message_text: "",
    media_url: "",
    media_type: "image",
    recipient_type: "contacts",
    recipient_filters: {},
    custom_recipients: [],
    scheduled_at: "",
    send_delay_seconds: 0,
    respect_opt_out: true,
    dry_run: false,
    recipient_sample_size: 0,
    tracking: {
      source: "",
      ctwa_ad_id: "",
      ctwa_post_id: "",
      utm_source: "facebook",
      utm_medium: "whatsapp",
      utm_campaign: "",
      ab_test_enabled: false,
      ab_variant: "",
      retargeting_basis: ""
    }
  });
  const [customText, setCustomText] = useState("");
  const selectedTemplate = options.templates.find((template) => String(template.id) === String(form.data.whatsapp_template_id));
  const submit = (event) => {
    event.preventDefault();
    const customRecipients = customText.split(/\n|,/).map((value) => ({ phone: value.trim() })).filter((item) => item.phone.length > 0);
    form.transform((data) => ({
      ...data,
      whatsapp_template_id: data.type === "template" ? data.whatsapp_template_id : "",
      message_text: data.type === "text" ? data.message_text : "",
      media_url: data.type === "media" ? data.media_url : "",
      custom_recipients: data.recipient_type === "custom" ? customRecipients : []
    }));
    form.post(route("app.broadcasts.store", {}), {
      preserveScroll: true,
      onSuccess: onClose
    });
  };
  return /* @__PURE__ */ jsx(
    Drawer,
    {
      open,
      onClose,
      title: "Create campaign",
      description: "Build a focused WhatsApp campaign without leaving the campaigns page.",
      className: "sm:max-w-3xl",
      footer: /* @__PURE__ */ jsxs("div", { className: "flex justify-end gap-2", children: [
        /* @__PURE__ */ jsx(Button, { type: "button", variant: "secondary", onClick: onClose, children: "Cancel" }),
        /* @__PURE__ */ jsx(Button, { type: "submit", form: "campaign-create-form", disabled: form.processing, children: form.processing ? "Creating..." : "Create campaign" })
      ] }),
      children: /* @__PURE__ */ jsxs("form", { id: "campaign-create-form", onSubmit: submit, className: "space-y-5", children: [
        options.connections.length === 0 && /* @__PURE__ */ jsx("div", { className: "rounded-btn border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-100", children: "Connect a WABA account before creating campaigns." }),
        /* @__PURE__ */ jsxs("div", { className: "grid gap-4 md:grid-cols-2", children: [
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("label", { className: "mb-1.5 block text-sm font-medium text-waify-text dark:text-waify-dark-text", children: "Campaign name" }),
            /* @__PURE__ */ jsx(TextInput, { value: form.data.name, onChange: (event) => form.setData("name", event.target.value), placeholder: "Diwali offer follow-up" }),
            /* @__PURE__ */ jsx(InputError, { message: form.errors.name, className: "mt-2" })
          ] }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("label", { className: "mb-1.5 block text-sm font-medium text-waify-text dark:text-waify-dark-text", children: "Message type" }),
            /* @__PURE__ */ jsxs("select", { value: form.data.type, onChange: (event) => form.setData("type", event.target.value), className: "h-10 w-full rounded-btn border border-gray-200 bg-white px-3 text-sm dark:border-waify-dark-border dark:bg-waify-dark-surface dark:text-waify-dark-text", children: [
              /* @__PURE__ */ jsx("option", { value: "template", children: "Approved template" }),
              /* @__PURE__ */ jsx("option", { value: "text", children: "Session text" }),
              /* @__PURE__ */ jsx("option", { value: "media", children: "Media URL" })
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("label", { className: "mb-1.5 block text-sm font-medium text-waify-text dark:text-waify-dark-text", children: "Description" }),
          /* @__PURE__ */ jsx("textarea", { value: form.data.description, onChange: (event) => form.setData("description", event.target.value), rows: 2, className: "w-full rounded-btn border border-gray-200 bg-white px-3 py-2 text-sm dark:border-waify-dark-border dark:bg-waify-dark-surface dark:text-waify-dark-text" })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "grid gap-4 md:grid-cols-2", children: [
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("label", { className: "mb-1.5 block text-sm font-medium text-waify-text dark:text-waify-dark-text", children: "WABA account" }),
            /* @__PURE__ */ jsx("select", { value: form.data.whatsapp_connection_id, onChange: (event) => form.setData("whatsapp_connection_id", event.target.value), className: "h-10 w-full rounded-btn border border-gray-200 bg-white px-3 text-sm dark:border-waify-dark-border dark:bg-waify-dark-surface dark:text-waify-dark-text", children: options.connections.map((connection) => /* @__PURE__ */ jsx("option", { value: connection.id, children: connection.name }, connection.id)) })
          ] }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("label", { className: "mb-1.5 block text-sm font-medium text-waify-text dark:text-waify-dark-text", children: "Audience" }),
            /* @__PURE__ */ jsxs("select", { value: form.data.recipient_type, onChange: (event) => form.setData("recipient_type", event.target.value), className: "h-10 w-full rounded-btn border border-gray-200 bg-white px-3 text-sm dark:border-waify-dark-border dark:bg-waify-dark-surface dark:text-waify-dark-text", children: [
              /* @__PURE__ */ jsxs("option", { value: "contacts", children: [
                "All eligible contacts (",
                formatNumber(options.contactsCount),
                ")"
              ] }),
              /* @__PURE__ */ jsx("option", { value: "custom", children: "Custom phone numbers" }),
              /* @__PURE__ */ jsx("option", { value: "segment", children: "Segment" })
            ] })
          ] })
        ] }),
        form.data.recipient_type === "custom" && /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("label", { className: "mb-1.5 block text-sm font-medium text-waify-text dark:text-waify-dark-text", children: "Phone numbers" }),
          /* @__PURE__ */ jsx("textarea", { value: customText, onChange: (event) => setCustomText(event.target.value), rows: 4, placeholder: "+919988776655, +919876543210", className: "w-full rounded-btn border border-gray-200 bg-white px-3 py-2 text-sm dark:border-waify-dark-border dark:bg-waify-dark-surface dark:text-waify-dark-text" }),
          /* @__PURE__ */ jsx(InputError, { message: form.errors.custom_recipients, className: "mt-2" })
        ] }),
        form.data.recipient_type === "segment" && /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("label", { className: "mb-1.5 block text-sm font-medium text-waify-text dark:text-waify-dark-text", children: "Segment" }),
          /* @__PURE__ */ jsxs(
            "select",
            {
              value: form.data.recipient_filters.segment_ids?.[0] ?? "",
              onChange: (event) => form.setData("recipient_filters", { segment_ids: event.target.value ? [Number(event.target.value)] : [] }),
              className: "h-10 w-full rounded-btn border border-gray-200 bg-white px-3 text-sm dark:border-waify-dark-border dark:bg-waify-dark-surface dark:text-waify-dark-text",
              children: [
                /* @__PURE__ */ jsx("option", { value: "", children: "Choose segment" }),
                options.segments.map((segment) => /* @__PURE__ */ jsx("option", { value: segment.id, children: segment.name }, segment.id))
              ]
            }
          )
        ] }),
        form.data.type === "template" && /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("label", { className: "mb-1.5 block text-sm font-medium text-waify-text dark:text-waify-dark-text", children: "Template" }),
          /* @__PURE__ */ jsxs("select", { value: form.data.whatsapp_template_id, onChange: (event) => form.setData("whatsapp_template_id", event.target.value), className: "h-10 w-full rounded-btn border border-gray-200 bg-white px-3 text-sm dark:border-waify-dark-border dark:bg-waify-dark-surface dark:text-waify-dark-text", children: [
            /* @__PURE__ */ jsx("option", { value: "", children: "Choose approved template" }),
            options.templates.map((template) => /* @__PURE__ */ jsxs("option", { value: template.id, children: [
              template.name,
              " · ",
              template.language
            ] }, template.id))
          ] }),
          /* @__PURE__ */ jsx(InputError, { message: form.errors.whatsapp_template_id, className: "mt-2" })
        ] }),
        form.data.type === "text" && /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("label", { className: "mb-1.5 block text-sm font-medium text-waify-text dark:text-waify-dark-text", children: "Message" }),
          /* @__PURE__ */ jsx("textarea", { value: form.data.message_text, onChange: (event) => form.setData("message_text", event.target.value), rows: 4, className: "w-full rounded-btn border border-gray-200 bg-white px-3 py-2 text-sm dark:border-waify-dark-border dark:bg-waify-dark-surface dark:text-waify-dark-text" }),
          /* @__PURE__ */ jsx(InputError, { message: form.errors.message_text, className: "mt-2" })
        ] }),
        form.data.type === "media" && /* @__PURE__ */ jsxs("div", { className: "grid gap-4 md:grid-cols-[160px,1fr]", children: [
          /* @__PURE__ */ jsxs("select", { value: form.data.media_type, onChange: (event) => form.setData("media_type", event.target.value), className: "h-10 rounded-btn border border-gray-200 bg-white px-3 text-sm dark:border-waify-dark-border dark:bg-waify-dark-surface dark:text-waify-dark-text", children: [
            /* @__PURE__ */ jsx("option", { value: "image", children: "Image" }),
            /* @__PURE__ */ jsx("option", { value: "video", children: "Video" }),
            /* @__PURE__ */ jsx("option", { value: "document", children: "Document" }),
            /* @__PURE__ */ jsx("option", { value: "audio", children: "Audio" })
          ] }),
          /* @__PURE__ */ jsx(TextInput, { value: form.data.media_url, onChange: (event) => form.setData("media_url", event.target.value), placeholder: "https://example.com/file.jpg" })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "grid gap-4 rounded-card border border-gray-100 bg-gray-50 p-4 dark:border-waify-dark-border dark:bg-waify-dark-surface-2 md:grid-cols-2", children: [
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("label", { className: "mb-1.5 block text-sm font-medium text-waify-text dark:text-waify-dark-text", children: "Schedule send" }),
            /* @__PURE__ */ jsx(
              "input",
              {
                type: "datetime-local",
                value: form.data.scheduled_at,
                onChange: (event) => form.setData("scheduled_at", event.target.value),
                className: "h-10 w-full rounded-btn border border-gray-200 bg-white px-3 text-sm text-waify-text focus:border-waify-green focus:ring-waify-green/20 dark:border-waify-dark-border dark:bg-waify-dark-surface dark:text-waify-dark-text"
              }
            ),
            /* @__PURE__ */ jsx("p", { className: "mt-1 text-xs text-waify-text-muted dark:text-waify-dark-text-muted", children: "Leave blank to keep the campaign as a draft until you start it." }),
            /* @__PURE__ */ jsx(InputError, { message: form.errors.scheduled_at, className: "mt-2" })
          ] }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("label", { className: "mb-1.5 block text-sm font-medium text-waify-text dark:text-waify-dark-text", children: "Send delay / throttle" }),
            /* @__PURE__ */ jsxs(
              "select",
              {
                value: String(form.data.send_delay_seconds),
                onChange: (event) => form.setData("send_delay_seconds", Number(event.target.value)),
                className: "h-10 w-full rounded-btn border border-gray-200 bg-white px-3 text-sm text-waify-text focus:border-waify-green focus:ring-waify-green/20 dark:border-waify-dark-border dark:bg-waify-dark-surface dark:text-waify-dark-text",
                children: [
                  /* @__PURE__ */ jsx("option", { value: "0", children: "Fastest safe send" }),
                  /* @__PURE__ */ jsx("option", { value: "1", children: "1 second between contacts" }),
                  /* @__PURE__ */ jsx("option", { value: "2", children: "2 seconds between contacts" }),
                  /* @__PURE__ */ jsx("option", { value: "5", children: "5 seconds between contacts" }),
                  /* @__PURE__ */ jsx("option", { value: "10", children: "10 seconds between contacts" }),
                  /* @__PURE__ */ jsx("option", { value: "30", children: "30 seconds between contacts" }),
                  /* @__PURE__ */ jsx("option", { value: "60", children: "60 seconds between contacts" })
                ]
              }
            ),
            /* @__PURE__ */ jsx("p", { className: "mt-1 text-xs text-waify-text-muted dark:text-waify-dark-text-muted", children: "Use slower sends when warming up a number or protecting quality rating." }),
            /* @__PURE__ */ jsx(InputError, { message: form.errors.send_delay_seconds, className: "mt-2" })
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "rounded-card border border-gray-100 bg-gray-50 p-4 dark:border-waify-dark-border dark:bg-waify-dark-surface-2", children: [
          /* @__PURE__ */ jsxs("div", { className: "flex flex-col gap-1", children: [
            /* @__PURE__ */ jsx("p", { className: "font-semibold text-waify-text dark:text-waify-dark-text", children: "Acquisition & attribution" }),
            /* @__PURE__ */ jsx("p", { className: "text-xs text-waify-text-muted dark:text-waify-dark-text-muted", children: "Tag campaigns from CTWA ads, retargeting lists, or experiments so reporting can connect replies and conversions back to source." })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "mt-4 grid gap-4 md:grid-cols-2", children: [
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx("label", { className: "mb-1.5 block text-sm font-medium text-waify-text dark:text-waify-dark-text", children: "Source" }),
              /* @__PURE__ */ jsxs(
                "select",
                {
                  value: form.data.tracking.source,
                  onChange: (event) => form.setData("tracking", { ...form.data.tracking, source: event.target.value }),
                  className: "h-10 w-full rounded-btn border border-gray-200 bg-white px-3 text-sm text-waify-text focus:border-waify-green focus:ring-waify-green/20 dark:border-waify-dark-border dark:bg-waify-dark-surface dark:text-waify-dark-text",
                  children: [
                    /* @__PURE__ */ jsx("option", { value: "", children: "No source tag" }),
                    /* @__PURE__ */ jsx("option", { value: "ctwa", children: "Click-to-WhatsApp ad" }),
                    /* @__PURE__ */ jsx("option", { value: "retargeting", children: "Retargeting campaign" }),
                    /* @__PURE__ */ jsx("option", { value: "organic", children: "Organic WhatsApp" }),
                    /* @__PURE__ */ jsx("option", { value: "manual", children: "Manual upload" })
                  ]
                }
              )
            ] }),
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx("label", { className: "mb-1.5 block text-sm font-medium text-waify-text dark:text-waify-dark-text", children: "Retargeting basis" }),
              /* @__PURE__ */ jsx(
                TextInput,
                {
                  value: form.data.tracking.retargeting_basis,
                  onChange: (event) => form.setData("tracking", { ...form.data.tracking, retargeting_basis: event.target.value }),
                  placeholder: "Read last campaign, clicked payment, replied support..."
                }
              )
            ] }),
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx("label", { className: "mb-1.5 block text-sm font-medium text-waify-text dark:text-waify-dark-text", children: "Meta ad ID" }),
              /* @__PURE__ */ jsx(
                TextInput,
                {
                  value: form.data.tracking.ctwa_ad_id,
                  onChange: (event) => form.setData("tracking", { ...form.data.tracking, ctwa_ad_id: event.target.value }),
                  placeholder: "Optional CTWA ad ID"
                }
              )
            ] }),
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx("label", { className: "mb-1.5 block text-sm font-medium text-waify-text dark:text-waify-dark-text", children: "Meta post ID" }),
              /* @__PURE__ */ jsx(
                TextInput,
                {
                  value: form.data.tracking.ctwa_post_id,
                  onChange: (event) => form.setData("tracking", { ...form.data.tracking, ctwa_post_id: event.target.value }),
                  placeholder: "Optional post or creative ID"
                }
              )
            ] }),
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx("label", { className: "mb-1.5 block text-sm font-medium text-waify-text dark:text-waify-dark-text", children: "UTM source" }),
              /* @__PURE__ */ jsx(
                TextInput,
                {
                  value: form.data.tracking.utm_source,
                  onChange: (event) => form.setData("tracking", { ...form.data.tracking, utm_source: event.target.value }),
                  placeholder: "facebook"
                }
              )
            ] }),
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx("label", { className: "mb-1.5 block text-sm font-medium text-waify-text dark:text-waify-dark-text", children: "UTM campaign" }),
              /* @__PURE__ */ jsx(
                TextInput,
                {
                  value: form.data.tracking.utm_campaign,
                  onChange: (event) => form.setData("tracking", { ...form.data.tracking, utm_campaign: event.target.value }),
                  placeholder: "summer_offer_june"
                }
              )
            ] }),
            /* @__PURE__ */ jsxs("label", { className: "flex items-start gap-3 rounded-btn border border-gray-200 bg-white p-3 text-sm dark:border-waify-dark-border dark:bg-waify-dark-surface", children: [
              /* @__PURE__ */ jsx(
                "input",
                {
                  type: "checkbox",
                  checked: Boolean(form.data.tracking.ab_test_enabled),
                  onChange: (event) => form.setData("tracking", { ...form.data.tracking, ab_test_enabled: event.target.checked }),
                  className: "mt-1 h-4 w-4 rounded border-gray-300 text-waify-green focus:ring-waify-green"
                }
              ),
              /* @__PURE__ */ jsxs("span", { children: [
                /* @__PURE__ */ jsx("span", { className: "block font-medium text-waify-text dark:text-waify-dark-text", children: "Mark as A/B test variant" }),
                /* @__PURE__ */ jsx("span", { className: "text-xs text-waify-text-muted dark:text-waify-dark-text-muted", children: "Use this when sending Template A vs B or creative variants." })
              ] })
            ] }),
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx("label", { className: "mb-1.5 block text-sm font-medium text-waify-text dark:text-waify-dark-text", children: "Variant label" }),
              /* @__PURE__ */ jsx(
                TextInput,
                {
                  value: form.data.tracking.ab_variant,
                  onChange: (event) => form.setData("tracking", { ...form.data.tracking, ab_variant: event.target.value }),
                  placeholder: "Variant A, Variant B..."
                }
              )
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "rounded-card border border-gray-100 bg-gray-50 p-4 text-sm dark:border-waify-dark-border dark:bg-waify-dark-surface-2", children: [
          /* @__PURE__ */ jsx("p", { className: "font-semibold text-waify-text dark:text-waify-dark-text", children: "Preview" }),
          /* @__PURE__ */ jsx("p", { className: "mt-2 whitespace-pre-wrap text-waify-text-muted dark:text-waify-dark-text-muted", children: form.data.type === "template" ? selectedTemplate?.body_text || "Select a template to preview content." : form.data.type === "text" ? form.data.message_text || "Write a message." : form.data.media_url || "Add a media URL." })
        ] })
      ] })
    }
  );
}
function CampaignDetailDrawer({
  campaign,
  onClose
}) {
  const testForm = useForm({
    phone: campaign?.testTargetPhone || ""
  });
  useEffect(() => {
    testForm.setData("phone", campaign?.testTargetPhone || "");
  }, [campaign?.id]);
  if (!campaign) return null;
  const status = campaignStatus(campaign.status);
  const StatusIcon = status.icon;
  const canStart = ["draft", "scheduled", "paused"].includes(campaign.status) && campaign.stats.total_recipients > 0;
  const canPause = campaign.status === "sending";
  const canCancel = ["draft", "scheduled", "sending", "paused"].includes(campaign.status);
  const canRetry = campaign.stats.failed_count > 0 && ["sending", "completed", "paused", "cancelled"].includes(campaign.status);
  const close = () => {
    onClose();
    router.get(route("app.broadcasts.index", {}), {}, {
      preserveScroll: true,
      preserveState: true,
      replace: true
    });
  };
  const action = (name) => {
    router.post(route(`app.broadcasts.${name}`, { campaign: campaign.slug }), {}, {
      preserveScroll: true,
      only: ["selectedCampaign", "campaigns", "flash", "errors"]
    });
  };
  const sendTest = (event) => {
    event.preventDefault();
    testForm.post(route("app.broadcasts.send-test", { campaign: campaign.slug }), {
      preserveScroll: true,
      only: ["selectedCampaign", "flash", "errors"]
    });
  };
  const messagePreview = campaign.type === "template" ? campaign.template?.body_text || "Template content will be pulled from Meta." : campaign.type === "media" ? campaign.media_url || "Media URL not set." : campaign.message_text || "Message text not set.";
  return /* @__PURE__ */ jsx(
    Drawer,
    {
      open: Boolean(campaign),
      onClose: close,
      title: campaign.name,
      description: `${campaign.type} campaign · ${campaign.recipient_type} audience`,
      className: "sm:max-w-5xl",
      footer: /* @__PURE__ */ jsxs("div", { className: "flex flex-wrap justify-end gap-2", children: [
        canRetry && /* @__PURE__ */ jsx(Button, { type: "button", variant: "secondary", onClick: () => action("retry-failed"), children: "Retry failed" }),
        canCancel && /* @__PURE__ */ jsx(Button, { type: "button", variant: "secondary", onClick: () => action("cancel"), children: "Cancel campaign" }),
        canPause && /* @__PURE__ */ jsxs(Button, { type: "button", variant: "warning", onClick: () => action("pause"), children: [
          /* @__PURE__ */ jsx(Pause, { className: "h-4 w-4" }),
          "Pause"
        ] }),
        canStart && /* @__PURE__ */ jsxs(Button, { type: "button", onClick: () => action("start"), children: [
          /* @__PURE__ */ jsx(Play, { className: "h-4 w-4" }),
          "Start"
        ] })
      ] }),
      children: /* @__PURE__ */ jsxs("div", { className: "space-y-5", children: [
        /* @__PURE__ */ jsxs("div", { className: "flex flex-wrap items-center justify-between gap-3 rounded-card border border-gray-100 bg-gray-50 p-4 dark:border-waify-dark-border dark:bg-waify-dark-surface-2", children: [
          /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3", children: [
            /* @__PURE__ */ jsx(ThemedIconTile, { tone: "green", size: "lg", children: /* @__PURE__ */ jsx(Megaphone, { className: "h-5 w-5" }) }),
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsxs("div", { className: "flex flex-wrap items-center gap-2", children: [
                /* @__PURE__ */ jsxs(Badge, { variant: status.variant, className: "gap-1", children: [
                  /* @__PURE__ */ jsx(StatusIcon, { className: "h-3 w-3" }),
                  status.label
                ] }),
                campaign.dry_run && /* @__PURE__ */ jsx(Badge, { variant: "warning", children: "Dry run" })
              ] }),
              /* @__PURE__ */ jsxs("p", { className: "mt-1 text-sm text-waify-text-muted dark:text-waify-dark-text-muted", children: [
                campaign.connection?.name || "No WABA account",
                " · Created ",
                formatDate(campaign.created_at)
              ] })
            ] })
          ] }),
          /* @__PURE__ */ jsxs("form", { onSubmit: sendTest, className: "flex w-full gap-2 sm:w-auto", children: [
            /* @__PURE__ */ jsx(
              TextInput,
              {
                value: testForm.data.phone,
                onChange: (event) => testForm.setData("phone", event.target.value),
                placeholder: "+91 test number",
                className: "h-9 min-w-0 flex-1 sm:w-48"
              }
            ),
            /* @__PURE__ */ jsxs(Button, { type: "submit", variant: "secondary", disabled: testForm.processing, children: [
              /* @__PURE__ */ jsx(Send, { className: "h-4 w-4" }),
              "Test"
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsx(InputError, { message: testForm.errors.phone || testForm.errors.error }),
        /* @__PURE__ */ jsx("div", { className: "grid grid-cols-2 gap-3 lg:grid-cols-5", children: [
          { label: "Audience", value: campaign.stats.total_recipients, Icon: Users, tone: "blue" },
          { label: "Sent", value: campaign.stats.sent_count, Icon: Send, tone: "green" },
          { label: "Delivered", value: campaign.stats.delivered_count, Icon: CheckCircle2, tone: "green" },
          { label: "Read", value: campaign.stats.read_count, Icon: BarChart3, tone: "purple" },
          { label: "Failed", value: campaign.stats.failed_count, Icon: XCircle, tone: "red" }
        ].map(({ label, value, Icon, tone }) => /* @__PURE__ */ jsx(Card, { className: "border-transparent dark:border-slate-700/80", children: /* @__PURE__ */ jsxs(CardContent, { className: "flex items-center gap-3 p-4", children: [
          /* @__PURE__ */ jsx(ThemedIconTile, { tone, size: "sm", children: /* @__PURE__ */ jsx(Icon, { className: "h-4 w-4" }) }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("p", { className: "text-xs text-waify-text-muted dark:text-waify-dark-text-muted", children: label }),
            /* @__PURE__ */ jsx("p", { className: "text-lg font-bold text-waify-text dark:text-waify-dark-text", children: formatNumber(value) })
          ] })
        ] }) }, String(label))) }),
        /* @__PURE__ */ jsxs("div", { className: "grid gap-4 lg:grid-cols-[1fr,360px]", children: [
          /* @__PURE__ */ jsx(Card, { className: "border-transparent dark:border-slate-700/80", children: /* @__PURE__ */ jsxs(CardContent, { className: "p-5", children: [
            /* @__PURE__ */ jsxs("div", { className: "mb-4 flex items-center justify-between", children: [
              /* @__PURE__ */ jsxs("div", { children: [
                /* @__PURE__ */ jsx("p", { className: "font-semibold text-waify-text dark:text-waify-dark-text", children: "Delivery progress" }),
                /* @__PURE__ */ jsx("p", { className: "text-sm text-waify-text-muted dark:text-waify-dark-text-muted", children: "Live campaign counts from the campaign recipient ledger." })
              ] }),
              /* @__PURE__ */ jsxs("span", { className: "text-sm font-semibold text-waify-text dark:text-waify-dark-text", children: [
                Math.round(campaign.stats.completion_percentage),
                "%"
              ] })
            ] }),
            /* @__PURE__ */ jsx(Progress, { value: campaign.stats.completion_percentage }),
            /* @__PURE__ */ jsxs("div", { className: "mt-4 grid gap-3 sm:grid-cols-3", children: [
              /* @__PURE__ */ jsxs("div", { className: "rounded-btn bg-gray-50 p-3 dark:bg-waify-dark-surface-2", children: [
                /* @__PURE__ */ jsx("p", { className: "text-xs text-waify-text-muted dark:text-waify-dark-text-muted", children: "Delivery rate · audience" }),
                /* @__PURE__ */ jsxs("p", { className: "text-lg font-semibold text-waify-text dark:text-waify-dark-text", children: [
                  Math.round(campaign.stats.delivery_rate),
                  "%"
                ] })
              ] }),
              /* @__PURE__ */ jsxs("div", { className: "rounded-btn bg-gray-50 p-3 dark:bg-waify-dark-surface-2", children: [
                /* @__PURE__ */ jsx("p", { className: "text-xs text-waify-text-muted dark:text-waify-dark-text-muted", children: "Read rate · delivered" }),
                /* @__PURE__ */ jsxs("p", { className: "text-lg font-semibold text-waify-text dark:text-waify-dark-text", children: [
                  Math.round(campaign.stats.read_rate),
                  "%"
                ] })
              ] }),
              /* @__PURE__ */ jsxs("div", { className: "rounded-btn bg-gray-50 p-3 dark:bg-waify-dark-surface-2", children: [
                /* @__PURE__ */ jsx("p", { className: "text-xs text-waify-text-muted dark:text-waify-dark-text-muted", children: "Pending" }),
                /* @__PURE__ */ jsx("p", { className: "text-lg font-semibold text-waify-text dark:text-waify-dark-text", children: formatNumber(campaign.stats.pending_count) })
              ] })
            ] })
          ] }) }),
          /* @__PURE__ */ jsx(Card, { className: "border-transparent dark:border-slate-700/80", children: /* @__PURE__ */ jsxs(CardContent, { className: "p-5", children: [
            /* @__PURE__ */ jsx("p", { className: "font-semibold text-waify-text dark:text-waify-dark-text", children: "Campaign preview" }),
            /* @__PURE__ */ jsx("div", { className: "mt-3 rounded-2xl bg-[#e7f7e8] p-3 dark:bg-emerald-500/10", children: /* @__PURE__ */ jsxs("div", { className: "rounded-2xl rounded-tr-sm bg-white px-3 py-2 text-sm text-waify-text shadow-sm dark:bg-waify-dark-surface dark:text-waify-dark-text", children: [
              /* @__PURE__ */ jsx("p", { className: "whitespace-pre-wrap", children: messagePreview }),
              campaign.media_url && /* @__PURE__ */ jsxs("a", { href: campaign.media_url, target: "_blank", rel: "noreferrer", className: "mt-2 block truncate text-xs font-semibold text-waify-green-dark dark:text-emerald-300", children: [
                campaign.media_type || "media",
                " · ",
                campaign.media_url
              ] })
            ] }) }),
            /* @__PURE__ */ jsxs("dl", { className: "mt-4 space-y-2 text-sm", children: [
              /* @__PURE__ */ jsxs("div", { className: "flex justify-between gap-4", children: [
                /* @__PURE__ */ jsx("dt", { className: "text-waify-text-muted dark:text-waify-dark-text-muted", children: "Template" }),
                /* @__PURE__ */ jsx("dd", { className: "text-right font-medium text-waify-text dark:text-waify-dark-text", children: campaign.template?.name || "Not used" })
              ] }),
              /* @__PURE__ */ jsxs("div", { className: "flex justify-between gap-4", children: [
                /* @__PURE__ */ jsx("dt", { className: "text-waify-text-muted dark:text-waify-dark-text-muted", children: "Scheduled" }),
                /* @__PURE__ */ jsx("dd", { className: "text-right font-medium text-waify-text dark:text-waify-dark-text", children: formatDate(campaign.scheduled_at) })
              ] }),
              /* @__PURE__ */ jsxs("div", { className: "flex justify-between gap-4", children: [
                /* @__PURE__ */ jsx("dt", { className: "text-waify-text-muted dark:text-waify-dark-text-muted", children: "Send delay" }),
                /* @__PURE__ */ jsxs("dd", { className: "text-right font-medium text-waify-text dark:text-waify-dark-text", children: [
                  campaign.send_delay_seconds,
                  "s"
                ] })
              ] }),
              /* @__PURE__ */ jsxs("div", { className: "flex justify-between gap-4", children: [
                /* @__PURE__ */ jsx("dt", { className: "text-waify-text-muted dark:text-waify-dark-text-muted", children: "Source" }),
                /* @__PURE__ */ jsx("dd", { className: "text-right font-medium capitalize text-waify-text dark:text-waify-dark-text", children: campaign.tracking?.source || "Not tagged" })
              ] }),
              campaign.tracking?.utm_campaign && /* @__PURE__ */ jsxs("div", { className: "flex justify-between gap-4", children: [
                /* @__PURE__ */ jsx("dt", { className: "text-waify-text-muted dark:text-waify-dark-text-muted", children: "UTM campaign" }),
                /* @__PURE__ */ jsx("dd", { className: "text-right font-medium text-waify-text dark:text-waify-dark-text", children: campaign.tracking.utm_campaign })
              ] }),
              campaign.tracking?.ab_test_enabled && /* @__PURE__ */ jsxs("div", { className: "flex justify-between gap-4", children: [
                /* @__PURE__ */ jsx("dt", { className: "text-waify-text-muted dark:text-waify-dark-text-muted", children: "A/B variant" }),
                /* @__PURE__ */ jsx("dd", { className: "text-right font-medium text-waify-text dark:text-waify-dark-text", children: campaign.tracking.ab_variant || "Variant" })
              ] })
            ] })
          ] }) })
        ] }),
        /* @__PURE__ */ jsx(Card, { className: "border-transparent dark:border-slate-700/80", children: /* @__PURE__ */ jsxs(CardContent, { className: "p-5", children: [
          /* @__PURE__ */ jsxs("div", { className: "flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between", children: [
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx("p", { className: "font-semibold text-waify-text dark:text-waify-dark-text", children: "Delivery diagnostics" }),
              /* @__PURE__ */ jsx("p", { className: "mt-1 text-sm text-waify-text-muted dark:text-waify-dark-text-muted", children: "Preflight checks, queue state, and the recipient timeline used by campaign recovery." })
            ] }),
            /* @__PURE__ */ jsx(Badge, { variant: campaign.diagnostics?.preflight?.ok === false ? "danger" : "success", children: campaign.diagnostics?.preflight?.ok === false ? "Needs attention" : "Preflight ready" })
          ] }),
          /* @__PURE__ */ jsx("div", { className: "mt-4 grid gap-3 md:grid-cols-4", children: [
            ["Pending", campaign.diagnostics?.queue?.pending_recipients ?? campaign.stats.pending_count],
            ["Sending", campaign.diagnostics?.queue?.sending_recipients ?? 0],
            ["Failed", campaign.diagnostics?.queue?.failed_recipients ?? campaign.stats.failed_count],
            ["Oldest pending", campaign.diagnostics?.queue?.oldest_pending_at ? formatDate(campaign.diagnostics.queue.oldest_pending_at) : "-"]
          ].map(([label, value]) => /* @__PURE__ */ jsxs("div", { className: "rounded-btn bg-gray-50 p-3 dark:bg-waify-dark-surface-2", children: [
            /* @__PURE__ */ jsx("p", { className: "text-xs text-waify-text-muted dark:text-waify-dark-text-muted", children: label }),
            /* @__PURE__ */ jsx("p", { className: "mt-1 text-sm font-semibold text-waify-text dark:text-waify-dark-text", children: value })
          ] }, String(label))) }),
          campaign.diagnostics?.preflight?.errors?.length ? /* @__PURE__ */ jsx("div", { className: "mt-4 rounded-btn border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-500/20 dark:bg-red-500/10 dark:text-red-200", children: campaign.diagnostics.preflight.errors.map((error) => /* @__PURE__ */ jsx("p", { children: error }, error)) }) : null,
          campaign.diagnostics?.preflight?.warnings?.length ? /* @__PURE__ */ jsx("div", { className: "mt-4 rounded-btn border border-amber-200 bg-amber-50 p-3 text-sm text-amber-700 dark:border-amber-500/20 dark:bg-amber-500/10 dark:text-amber-200", children: campaign.diagnostics.preflight.warnings.map((warning) => /* @__PURE__ */ jsx("p", { children: warning }, warning)) }) : null
        ] }) }),
        /* @__PURE__ */ jsx(Card, { className: "border-transparent dark:border-slate-700/80", children: /* @__PURE__ */ jsxs(CardContent, { className: "p-0", children: [
          /* @__PURE__ */ jsxs("div", { className: "border-b border-gray-100 px-5 py-4 dark:border-waify-dark-border", children: [
            /* @__PURE__ */ jsx("p", { className: "font-semibold text-waify-text dark:text-waify-dark-text", children: "Recipients" }),
            /* @__PURE__ */ jsx("p", { className: "text-sm text-waify-text-muted dark:text-waify-dark-text-muted", children: "Showing latest 100 recipients, with failed and pending first." })
          ] }),
          /* @__PURE__ */ jsx("div", { className: "max-h-80 overflow-auto", children: campaign.recipients.length === 0 ? /* @__PURE__ */ jsx("div", { className: "p-6 text-sm text-waify-text-muted dark:text-waify-dark-text-muted", children: "No recipients prepared yet." }) : campaign.recipients.map((recipient) => /* @__PURE__ */ jsxs("div", { className: "grid gap-2 border-b border-gray-100 px-5 py-3 text-sm last:border-0 dark:border-waify-dark-border md:grid-cols-[1fr,150px,120px,1fr]", children: [
            /* @__PURE__ */ jsxs("div", { className: "min-w-0", children: [
              /* @__PURE__ */ jsx("p", { className: "truncate font-medium text-waify-text dark:text-waify-dark-text", children: recipient.name || recipient.phone_number || "Unknown recipient" }),
              /* @__PURE__ */ jsx("p", { className: "truncate text-xs text-waify-text-muted dark:text-waify-dark-text-muted", children: recipient.phone_number || "No phone" })
            ] }),
            /* @__PURE__ */ jsx(Badge, { variant: recipient.status === "failed" ? "danger" : recipient.status === "read" ? "success" : "default", className: "w-fit", children: recipient.status }),
            /* @__PURE__ */ jsx("span", { className: "text-xs text-waify-text-muted dark:text-waify-dark-text-muted", children: formatDate(recipient.sent_at || recipient.failed_at) }),
            /* @__PURE__ */ jsxs("div", { className: "min-w-0", children: [
              /* @__PURE__ */ jsx("span", { className: "block truncate text-xs text-waify-text-muted dark:text-waify-dark-text-muted", children: recipient.failure_reason || recipient.message_id || "No message event yet" }),
              recipient.timeline?.length ? /* @__PURE__ */ jsx("span", { className: "mt-1 block truncate text-[11px] text-waify-text-muted dark:text-waify-dark-text-muted", children: recipient.timeline.map((event) => `${event.label}${event.at ? ` ${formatDate(event.at)}` : ""}`).join(" · ") }) : null
            ] })
          ] }, recipient.id)) })
        ] }) })
      ] })
    }
  );
}
function BroadcastsIndex({
  campaigns,
  filters,
  createOptions,
  selectedCampaign
}) {
  const [search, setSearch] = useState(filters.search || "");
  const [status, setStatus] = useState(filters.status || "");
  const [createOpen, setCreateOpen] = useState(() => new URLSearchParams(window.location.search).get("panel") === "create");
  const [activeCampaign, setActiveCampaign] = useState(selectedCampaign || null);
  useEffect(() => {
    setActiveCampaign(selectedCampaign || null);
  }, [selectedCampaign]);
  const statusCounts = useMemo(() => {
    return campaigns.data.reduce((acc, campaign) => {
      acc[campaign.status] = (acc[campaign.status] || 0) + 1;
      return acc;
    }, {});
  }, [campaigns.data]);
  const totalCampaigns = campaigns.meta?.total ?? campaigns.data.length;
  const totalRecipients = campaigns.data.reduce((sum, campaign) => sum + Number(campaign.total_recipients || 0), 0);
  const totalDelivered = campaigns.data.reduce((sum, campaign) => sum + Number(campaign.delivered_count || 0), 0);
  const totalRead = campaigns.data.reduce((sum, campaign) => sum + Number(campaign.read_count || 0), 0);
  const hasActiveCampaigns = campaigns.data.some((campaign) => ["sending", "scheduled", "paused"].includes(campaign.status)) || Boolean(activeCampaign && ["sending", "scheduled", "paused"].includes(activeCampaign.status));
  const activeFilters = useMemo(() => {
    const payload = {};
    if (search.trim()) payload.search = search.trim();
    if (status) payload.status = status;
    return payload;
  }, [search, status]);
  const applyFilters = () => {
    router.get(route("app.broadcasts.index", {}), activeFilters, {
      preserveState: true,
      preserveScroll: true,
      replace: true
    });
  };
  useEffect(() => {
    if (!hasActiveCampaigns) return;
    const timer = window.setInterval(() => {
      router.reload({
        only: ["campaigns", "selectedCampaign", "flash", "errors"]
      });
    }, 4e3);
    return () => window.clearInterval(timer);
  }, [hasActiveCampaigns]);
  const tabs = [
    { value: "", label: "All Campaigns", count: totalCampaigns },
    { value: "sending", label: "Active", count: statusCounts.sending || 0 },
    { value: "scheduled", label: "Scheduled", count: statusCounts.scheduled || 0 },
    { value: "completed", label: "Completed", count: statusCounts.completed || 0 },
    { value: "draft", label: "Draft", count: statusCounts.draft || 0 }
  ];
  return /* @__PURE__ */ jsxs(AppShell, { children: [
    /* @__PURE__ */ jsx(Head, { title: "Campaigns" }),
    /* @__PURE__ */ jsxs("div", { className: "module-page max-w-[1600px]", children: [
      /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-2 gap-4 lg:grid-cols-4", children: [
        /* @__PURE__ */ jsx(Card, { className: "border-transparent dark:border-slate-700/80", children: /* @__PURE__ */ jsxs(CardContent, { className: "flex items-center gap-3 p-4", children: [
          /* @__PURE__ */ jsx(ThemedIconTile, { tone: "green", children: /* @__PURE__ */ jsx(Megaphone, { className: "h-5 w-5" }) }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("p", { className: "text-xs text-waify-text-muted dark:text-waify-dark-text-muted", children: "Campaigns" }),
            /* @__PURE__ */ jsx("p", { className: "text-xl font-bold text-waify-text dark:text-waify-dark-text", children: formatNumber(totalCampaigns) })
          ] })
        ] }) }),
        /* @__PURE__ */ jsx(Card, { className: "border-transparent dark:border-slate-700/80", children: /* @__PURE__ */ jsxs(CardContent, { className: "flex items-center gap-3 p-4", children: [
          /* @__PURE__ */ jsx(ThemedIconTile, { tone: "blue", children: /* @__PURE__ */ jsx(Users, { className: "h-5 w-5" }) }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("p", { className: "text-xs text-waify-text-muted dark:text-waify-dark-text-muted", children: "Audience" }),
            /* @__PURE__ */ jsx("p", { className: "text-xl font-bold text-waify-text dark:text-waify-dark-text", children: formatNumber(totalRecipients) })
          ] })
        ] }) }),
        /* @__PURE__ */ jsx(Card, { className: "border-transparent dark:border-slate-700/80", children: /* @__PURE__ */ jsxs(CardContent, { className: "flex items-center gap-3 p-4", children: [
          /* @__PURE__ */ jsx(ThemedIconTile, { tone: "green", children: /* @__PURE__ */ jsx(Send, { className: "h-5 w-5" }) }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("p", { className: "text-xs text-waify-text-muted dark:text-waify-dark-text-muted", children: "Delivered" }),
            /* @__PURE__ */ jsx("p", { className: "text-xl font-bold text-waify-text dark:text-waify-dark-text", children: formatNumber(totalDelivered) })
          ] })
        ] }) }),
        /* @__PURE__ */ jsx(Card, { className: "border-transparent dark:border-slate-700/80", children: /* @__PURE__ */ jsxs(CardContent, { className: "flex items-center gap-3 p-4", children: [
          /* @__PURE__ */ jsx(ThemedIconTile, { tone: "purple", children: /* @__PURE__ */ jsx(BarChart3, { className: "h-5 w-5" }) }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("p", { className: "text-xs text-waify-text-muted dark:text-waify-dark-text-muted", children: "Read" }),
            /* @__PURE__ */ jsx("p", { className: "text-xl font-bold text-waify-text dark:text-waify-dark-text", children: formatNumber(totalRead) })
          ] })
        ] }) })
      ] }),
      /* @__PURE__ */ jsxs(Card, { className: "overflow-hidden border-transparent dark:border-slate-700/80", children: [
        /* @__PURE__ */ jsx("div", { className: "border-b border-gray-100 px-4 pt-4 dark:border-waify-dark-border", children: /* @__PURE__ */ jsx("div", { className: "flex gap-1 overflow-x-auto", children: tabs.map((tab) => {
          const active = status === tab.value;
          return /* @__PURE__ */ jsxs(
            "button",
            {
              type: "button",
              onClick: () => {
                setStatus(tab.value);
                router.get(route("app.broadcasts.index", {}), { ...activeFilters, status: tab.value || void 0 }, {
                  preserveState: true,
                  preserveScroll: true,
                  replace: true
                });
              },
              className: `relative flex h-10 items-center gap-2 whitespace-nowrap px-3 text-sm font-medium transition ${active ? "text-waify-text dark:text-waify-dark-text" : "text-waify-text-muted hover:text-waify-text dark:text-waify-dark-text-muted dark:hover:text-waify-dark-text"}`,
              children: [
                tab.label,
                /* @__PURE__ */ jsx("span", { className: `rounded-full px-1.5 py-0.5 text-[10px] font-semibold ${active ? "bg-waify-green-soft text-waify-green-dark dark:bg-waify-dark-green-soft dark:text-emerald-200" : "bg-gray-100 text-gray-500 dark:bg-waify-dark-surface-2 dark:text-waify-dark-text-muted"}`, children: formatNumber(tab.count) }),
                active && /* @__PURE__ */ jsx("span", { className: "absolute bottom-0 left-2 right-2 h-0.5 rounded-full bg-waify-green" })
              ]
            },
            tab.value || "all"
          );
        }) }) }),
        /* @__PURE__ */ jsxs(CardContent, { className: "flex flex-col gap-2 p-3 lg:flex-row lg:items-center", children: [
          /* @__PURE__ */ jsxs("div", { className: "relative min-w-[220px] flex-1", children: [
            /* @__PURE__ */ jsx(Search, { className: "pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-waify-text-muted dark:text-waify-dark-text-muted" }),
            /* @__PURE__ */ jsx(
              TextInput,
              {
                value: search,
                onChange: (event) => setSearch(event.target.value),
                onKeyDown: (event) => event.key === "Enter" && applyFilters(),
                placeholder: "Search campaigns...",
                className: "h-9 rounded-btn border-gray-200 pl-10 text-sm focus:border-waify-green focus:ring-waify-green/20 dark:border-waify-dark-border dark:bg-waify-dark-surface-2"
              }
            )
          ] }),
          /* @__PURE__ */ jsxs(
            "select",
            {
              value: status,
              onChange: (event) => setStatus(event.target.value),
              className: "h-9 rounded-btn border-gray-200 bg-white px-3 text-sm text-waify-text shadow-sm focus:border-waify-green focus:ring-waify-green/20 dark:border-waify-dark-border dark:bg-waify-dark-surface-2 dark:text-waify-dark-text",
              children: [
                /* @__PURE__ */ jsx("option", { value: "", children: "All statuses" }),
                /* @__PURE__ */ jsx("option", { value: "draft", children: "Draft" }),
                /* @__PURE__ */ jsx("option", { value: "scheduled", children: "Scheduled" }),
                /* @__PURE__ */ jsx("option", { value: "sending", children: "Sending" }),
                /* @__PURE__ */ jsx("option", { value: "paused", children: "Paused" }),
                /* @__PURE__ */ jsx("option", { value: "completed", children: "Completed" }),
                /* @__PURE__ */ jsx("option", { value: "cancelled", children: "Cancelled" })
              ]
            }
          ),
          /* @__PURE__ */ jsx(Button, { type: "button", variant: "secondary", onClick: () => {
            setSearch("");
            setStatus("");
            router.get(route("app.broadcasts.index", {}), {}, {
              preserveState: true,
              preserveScroll: true,
              replace: true
            });
          }, children: "Reset" }),
          /* @__PURE__ */ jsx(Button, { type: "button", onClick: applyFilters, children: "Apply" }),
          /* @__PURE__ */ jsx("div", { className: "hidden flex-1 lg:block" }),
          /* @__PURE__ */ jsxs(Button, { type: "button", variant: "secondary", disabled: true, children: [
            /* @__PURE__ */ jsx(Download, { className: "h-4 w-4" }),
            "Export"
          ] }),
          /* @__PURE__ */ jsxs(Button, { type: "button", onClick: () => setCreateOpen(true), children: [
            /* @__PURE__ */ jsx(Plus, { className: "h-4 w-4" }),
            "New Campaign"
          ] })
        ] })
      ] }),
      campaigns.data.length === 0 ? /* @__PURE__ */ jsx(Card, { className: "border-transparent dark:border-slate-700/80", children: /* @__PURE__ */ jsx(CardContent, { className: "py-16 text-center", children: /* @__PURE__ */ jsx(
        EmptyState,
        {
          icon: Megaphone,
          title: "No campaigns yet",
          description: "Create your first WhatsApp campaign to reach a targeted audience.",
          action: /* @__PURE__ */ jsxs(Button, { onClick: () => setCreateOpen(true), children: [
            /* @__PURE__ */ jsx(Plus, { className: "h-4 w-4" }),
            "Create Campaign"
          ] })
        }
      ) }) }) : /* @__PURE__ */ jsxs(Fragment, { children: [
        /* @__PURE__ */ jsx("div", { className: "grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4", children: campaigns.data.map((campaign) => /* @__PURE__ */ jsx(CampaignCard, { campaign }, campaign.id)) }),
        campaigns.links && campaigns.links.length > 3 && /* @__PURE__ */ jsx("div", { className: "flex flex-wrap justify-center gap-1", children: campaigns.links.map((link, index) => /* @__PURE__ */ jsx(
          "button",
          {
            type: "button",
            onClick: () => link.url && router.visit(link.url),
            disabled: !link.url,
            className: `h-8 min-w-8 rounded-md px-2 text-xs font-semibold transition ${link.active ? "bg-waify-text text-white dark:bg-waify-dark-text dark:text-waify-dark-bg" : "border border-gray-200 bg-white text-waify-text hover:bg-gray-50 dark:border-waify-dark-border dark:bg-waify-dark-surface dark:text-waify-dark-text dark:hover:bg-waify-dark-surface-2"} ${!link.url ? "cursor-not-allowed opacity-45" : ""}`,
            children: paginationLabel(link.label)
          },
          index
        )) })
      ] })
    ] }),
    /* @__PURE__ */ jsx(CampaignCreateDrawer, { open: createOpen, onClose: () => setCreateOpen(false), options: createOptions }),
    /* @__PURE__ */ jsx(CampaignDetailDrawer, { campaign: activeCampaign, onClose: () => setActiveCampaign(null) })
  ] });
}
export {
  BroadcastsIndex as default
};
