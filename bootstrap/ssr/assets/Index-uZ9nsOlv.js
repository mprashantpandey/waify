import { jsxs, jsx } from "react/jsx-runtime";
import { P as PlatformShell } from "./PlatformShell-BDgjSKtX.js";
import { usePage, Head, router } from "@inertiajs/react";
import { useState, useMemo } from "react";
import { C as Card, a as CardContent } from "./Card-BtIXZ0GS.js";
import { B as Button } from "./Button-BJftGNki.js";
import { P as PageHeader, T as ThemedIconTile, S as StatusBadge } from "./Elements-EbyZDnT_.js";
import { Mail, Clock3, CheckCircle2, XCircle, Send, Users } from "lucide-react";
import "axios";
import "./BrandingWrapper-CZn0jBQL.js";
import "./utils-B2ZNUmII.js";
import "clsx";
import "tailwind-merge";
import "./useToast-BN7qsQL3.js";
import "./Badge-C65MHc2S.js";
import "@headlessui/react";
function statusTone(status) {
  if (status === "sent") return "success";
  if (["queued", "sending"].includes(status)) return "warning";
  if (status === "failed") return "danger";
  if (status === "draft") return "info";
  return "default";
}
function dateTime(value) {
  if (!value) return "-";
  return new Date(value).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" });
}
function StatCard({ label, value, icon: Icon, tone = "green" }) {
  return /* @__PURE__ */ jsx(Card, { children: /* @__PURE__ */ jsx(CardContent, { className: "p-4", children: /* @__PURE__ */ jsxs("div", { className: "flex items-start justify-between gap-3", children: [
    /* @__PURE__ */ jsxs("div", { children: [
      /* @__PURE__ */ jsx("p", { className: "text-xs font-medium uppercase tracking-wide text-waify-text-muted dark:text-waify-dark-text-muted", children: label }),
      /* @__PURE__ */ jsx("p", { className: "mt-2 text-xl font-bold text-waify-text dark:text-waify-dark-text", children: value })
    ] }),
    /* @__PURE__ */ jsx(ThemedIconTile, { tone, size: "sm", children: /* @__PURE__ */ jsx(Icon, { className: "h-4 w-4" }) })
  ] }) }) });
}
function PlatformEmailCampaignsIndex({
  campaigns = [],
  stats = {},
  audiences = []
}) {
  const { auth, errors } = usePage().props;
  const [form, setForm] = useState({
    name: "",
    subject: "",
    audience: "workspace_owners",
    body: "",
    cta_label: "",
    cta_url: "",
    offer_code: "",
    custom_recipients: ""
  });
  const [submitting, setSubmitting] = useState(false);
  const selectedAudience = useMemo(() => audiences.find((audience) => audience.key === form.audience), [audiences, form.audience]);
  const customCount = useMemo(() => {
    if (form.audience !== "custom") return selectedAudience?.count || 0;
    return Array.from(new Set(form.custom_recipients.split(/[\r\n,;]+/).map((email) => email.trim().toLowerCase()).filter(Boolean))).length;
  }, [form.audience, form.custom_recipients, selectedAudience]);
  const submit = (event) => {
    event.preventDefault();
    setSubmitting(true);
    router.post(route("platform.email-campaigns.store"), form, {
      preserveScroll: true,
      onFinish: () => setSubmitting(false),
      onSuccess: () => setForm({
        name: "",
        subject: "",
        audience: "workspace_owners",
        body: "",
        cta_label: "",
        cta_url: "",
        offer_code: "",
        custom_recipients: ""
      })
    });
  };
  return /* @__PURE__ */ jsxs(PlatformShell, { auth, children: [
    /* @__PURE__ */ jsx(Head, { title: "Email campaigns" }),
    /* @__PURE__ */ jsxs("div", { className: "space-y-5", children: [
      /* @__PURE__ */ jsx(
        PageHeader,
        {
          title: "Email campaigns",
          description: "Send newsletters, offers, product updates, and payment-plan promotions from Zyptos admin using the configured platform mail setup."
        }
      ),
      /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 gap-3 md:grid-cols-4", children: [
        /* @__PURE__ */ jsx(StatCard, { label: "Campaigns", value: stats.total || 0, icon: Mail, tone: "blue" }),
        /* @__PURE__ */ jsx(StatCard, { label: "Queued / sending", value: stats.sending || 0, icon: Clock3, tone: "amber" }),
        /* @__PURE__ */ jsx(StatCard, { label: "Sent", value: stats.sent || 0, icon: CheckCircle2, tone: "green" }),
        /* @__PURE__ */ jsx(StatCard, { label: "Failed", value: stats.failed || 0, icon: XCircle, tone: "red" })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 gap-5 xl:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)]", children: [
        /* @__PURE__ */ jsx(Card, { children: /* @__PURE__ */ jsxs(CardContent, { className: "p-5", children: [
          /* @__PURE__ */ jsxs("div", { className: "mb-4 flex items-center gap-3", children: [
            /* @__PURE__ */ jsx(ThemedIconTile, { tone: "green", children: /* @__PURE__ */ jsx(Send, { className: "h-5 w-5" }) }),
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx("h2", { className: "text-base font-semibold text-waify-text dark:text-waify-dark-text", children: "Create bulk email" }),
              /* @__PURE__ */ jsx("p", { className: "text-sm text-waify-text-muted dark:text-waify-dark-text-muted", children: "Messages are queued and sent in batches by the worker." })
            ] })
          ] }),
          /* @__PURE__ */ jsxs("form", { onSubmit: submit, className: "space-y-4", children: [
            /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 gap-3 sm:grid-cols-2", children: [
              /* @__PURE__ */ jsxs("label", { className: "block", children: [
                /* @__PURE__ */ jsx("span", { className: "text-xs font-medium uppercase tracking-wide text-waify-text-muted dark:text-waify-dark-text-muted", children: "Campaign name" }),
                /* @__PURE__ */ jsx("input", { className: "waify-input mt-1 w-full", value: form.name, onChange: (event) => setForm({ ...form, name: event.target.value }), placeholder: "May offer / newsletter", required: true }),
                errors?.name && /* @__PURE__ */ jsx("p", { className: "mt-1 text-xs text-red-600", children: errors.name })
              ] }),
              /* @__PURE__ */ jsxs("label", { className: "block", children: [
                /* @__PURE__ */ jsx("span", { className: "text-xs font-medium uppercase tracking-wide text-waify-text-muted dark:text-waify-dark-text-muted", children: "Audience" }),
                /* @__PURE__ */ jsx("select", { className: "waify-input mt-1 w-full", value: form.audience, onChange: (event) => setForm({ ...form, audience: event.target.value }), children: audiences.map((audience) => /* @__PURE__ */ jsxs("option", { value: audience.key, children: [
                  audience.label,
                  audience.count ? ` (${audience.count})` : ""
                ] }, audience.key)) })
              ] })
            ] }),
            form.audience === "custom" && /* @__PURE__ */ jsxs("label", { className: "block", children: [
              /* @__PURE__ */ jsx("span", { className: "text-xs font-medium uppercase tracking-wide text-waify-text-muted dark:text-waify-dark-text-muted", children: "Custom emails" }),
              /* @__PURE__ */ jsx("textarea", { className: "waify-input mt-1 min-h-24 w-full", value: form.custom_recipients, onChange: (event) => setForm({ ...form, custom_recipients: event.target.value }), placeholder: "one@email.com, two@email.com" }),
              /* @__PURE__ */ jsx("p", { className: "mt-1 text-xs text-waify-text-muted dark:text-waify-dark-text-muted", children: "Separate emails by comma, semicolon, or new line." })
            ] }),
            /* @__PURE__ */ jsxs("label", { className: "block", children: [
              /* @__PURE__ */ jsx("span", { className: "text-xs font-medium uppercase tracking-wide text-waify-text-muted dark:text-waify-dark-text-muted", children: "Subject" }),
              /* @__PURE__ */ jsx("input", { className: "waify-input mt-1 w-full", value: form.subject, onChange: (event) => setForm({ ...form, subject: event.target.value }), placeholder: "Special Zyptos offer for your workspace", required: true }),
              errors?.subject && /* @__PURE__ */ jsx("p", { className: "mt-1 text-xs text-red-600", children: errors.subject })
            ] }),
            /* @__PURE__ */ jsxs("label", { className: "block", children: [
              /* @__PURE__ */ jsx("span", { className: "text-xs font-medium uppercase tracking-wide text-waify-text-muted dark:text-waify-dark-text-muted", children: "Email body" }),
              /* @__PURE__ */ jsx("textarea", { className: "waify-input mt-1 min-h-44 w-full", value: form.body, onChange: (event) => setForm({ ...form, body: event.target.value }), placeholder: "Write the offer or newsletter content...", required: true }),
              errors?.body && /* @__PURE__ */ jsx("p", { className: "mt-1 text-xs text-red-600", children: errors.body })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 gap-3 sm:grid-cols-3", children: [
              /* @__PURE__ */ jsxs("label", { className: "block", children: [
                /* @__PURE__ */ jsx("span", { className: "text-xs font-medium uppercase tracking-wide text-waify-text-muted dark:text-waify-dark-text-muted", children: "Offer code" }),
                /* @__PURE__ */ jsx("input", { className: "waify-input mt-1 w-full", value: form.offer_code, onChange: (event) => setForm({ ...form, offer_code: event.target.value }), placeholder: "ZYPTOS20" })
              ] }),
              /* @__PURE__ */ jsxs("label", { className: "block", children: [
                /* @__PURE__ */ jsx("span", { className: "text-xs font-medium uppercase tracking-wide text-waify-text-muted dark:text-waify-dark-text-muted", children: "CTA label" }),
                /* @__PURE__ */ jsx("input", { className: "waify-input mt-1 w-full", value: form.cta_label, onChange: (event) => setForm({ ...form, cta_label: event.target.value }), placeholder: "View offer" })
              ] }),
              /* @__PURE__ */ jsxs("label", { className: "block", children: [
                /* @__PURE__ */ jsx("span", { className: "text-xs font-medium uppercase tracking-wide text-waify-text-muted dark:text-waify-dark-text-muted", children: "CTA URL" }),
                /* @__PURE__ */ jsx("input", { className: "waify-input mt-1 w-full", value: form.cta_url, onChange: (event) => setForm({ ...form, cta_url: event.target.value }), placeholder: "https://zyptos.com/pricing" }),
                errors?.cta_url && /* @__PURE__ */ jsx("p", { className: "mt-1 text-xs text-red-600", children: errors.cta_url })
              ] })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "rounded-card border border-emerald-100 bg-emerald-50/70 p-3 text-sm text-emerald-900 dark:border-emerald-400/20 dark:bg-emerald-500/10 dark:text-emerald-100", children: [
              /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 font-semibold", children: [
                /* @__PURE__ */ jsx(Users, { className: "h-4 w-4" }),
                " Estimated recipients: ",
                customCount
              ] }),
              /* @__PURE__ */ jsx("p", { className: "mt-1 text-xs opacity-80", children: "Duplicate emails are removed before sending." })
            ] }),
            /* @__PURE__ */ jsx("div", { className: "flex justify-end", children: /* @__PURE__ */ jsxs(Button, { type: "submit", disabled: submitting || customCount < 1, children: [
              /* @__PURE__ */ jsx(Send, { className: "h-4 w-4" }),
              submitting ? "Queueing..." : "Queue campaign"
            ] }) })
          ] })
        ] }) }),
        /* @__PURE__ */ jsx(Card, { children: /* @__PURE__ */ jsxs(CardContent, { className: "p-0", children: [
          /* @__PURE__ */ jsxs("div", { className: "border-b border-gray-100 p-5 dark:border-waify-dark-border", children: [
            /* @__PURE__ */ jsx("h2", { className: "text-base font-semibold text-waify-text dark:text-waify-dark-text", children: "Recent campaigns" }),
            /* @__PURE__ */ jsx("p", { className: "mt-1 text-sm text-waify-text-muted dark:text-waify-dark-text-muted", children: "Delivery counts update as the queue worker sends batches." })
          ] }),
          /* @__PURE__ */ jsx("div", { className: "overflow-x-auto", children: /* @__PURE__ */ jsxs("table", { className: "min-w-full divide-y divide-gray-100 text-sm dark:divide-waify-dark-border", children: [
            /* @__PURE__ */ jsx("thead", { className: "bg-gray-50 text-left text-xs font-semibold uppercase tracking-wide text-waify-text-muted dark:bg-waify-dark-surface-2 dark:text-waify-dark-text-muted", children: /* @__PURE__ */ jsxs("tr", { children: [
              /* @__PURE__ */ jsx("th", { className: "px-4 py-3", children: "Campaign" }),
              /* @__PURE__ */ jsx("th", { className: "px-4 py-3", children: "Audience" }),
              /* @__PURE__ */ jsx("th", { className: "px-4 py-3", children: "Delivery" }),
              /* @__PURE__ */ jsx("th", { className: "px-4 py-3", children: "Status" })
            ] }) }),
            /* @__PURE__ */ jsx("tbody", { className: "divide-y divide-gray-100 dark:divide-waify-dark-border", children: campaigns.length === 0 ? /* @__PURE__ */ jsx("tr", { children: /* @__PURE__ */ jsx("td", { colSpan: 4, className: "px-4 py-12 text-center text-waify-text-muted dark:text-waify-dark-text-muted", children: "No email campaigns yet." }) }) : campaigns.map((campaign) => /* @__PURE__ */ jsxs("tr", { className: "align-top", children: [
              /* @__PURE__ */ jsxs("td", { className: "px-4 py-3", children: [
                /* @__PURE__ */ jsx("div", { className: "max-w-72 font-semibold text-waify-text dark:text-waify-dark-text", children: campaign.name }),
                /* @__PURE__ */ jsx("div", { className: "mt-1 max-w-72 truncate text-xs text-waify-text-muted dark:text-waify-dark-text-muted", children: campaign.subject }),
                campaign.offer_code && /* @__PURE__ */ jsx(StatusBadge, { tone: "success", className: "mt-2", children: campaign.offer_code }),
                campaign.failure_reason && /* @__PURE__ */ jsx("p", { className: "mt-2 max-w-72 text-xs text-red-600 dark:text-red-300", children: campaign.failure_reason })
              ] }),
              /* @__PURE__ */ jsxs("td", { className: "px-4 py-3 text-waify-text-muted dark:text-waify-dark-text-muted", children: [
                campaign.audience.replace(/_/g, " "),
                /* @__PURE__ */ jsxs("div", { className: "mt-1 text-xs", children: [
                  "Created ",
                  dateTime(campaign.created_at)
                ] })
              ] }),
              /* @__PURE__ */ jsxs("td", { className: "px-4 py-3", children: [
                /* @__PURE__ */ jsxs("div", { className: "font-medium text-waify-text dark:text-waify-dark-text", children: [
                  campaign.sent_count,
                  "/",
                  campaign.recipient_count,
                  " sent"
                ] }),
                /* @__PURE__ */ jsxs("div", { className: "mt-1 text-xs text-waify-text-muted dark:text-waify-dark-text-muted", children: [
                  campaign.failed_count,
                  " failed · ",
                  campaign.pending_count,
                  " pending"
                ] })
              ] }),
              /* @__PURE__ */ jsxs("td", { className: "px-4 py-3", children: [
                /* @__PURE__ */ jsx(StatusBadge, { tone: statusTone(campaign.status), dot: true, children: campaign.status }),
                campaign.sent_at && /* @__PURE__ */ jsx("div", { className: "mt-1 text-xs text-waify-text-muted dark:text-waify-dark-text-muted", children: dateTime(campaign.sent_at) })
              ] })
            ] }, campaign.id)) })
          ] }) })
        ] }) })
      ] })
    ] })
  ] });
}
export {
  PlatformEmailCampaignsIndex as default
};
