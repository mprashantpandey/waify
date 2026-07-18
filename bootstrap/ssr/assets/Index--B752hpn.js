import { jsxs, jsx } from "react/jsx-runtime";
import { Head } from "@inertiajs/react";
import { useState, useMemo } from "react";
import { A as AppShell } from "./AppShell-BMIA1AnI.js";
import { B as Button } from "./Button-BJftGNki.js";
import { T as TextInput } from "./TextInput-CmkZX80k.js";
import { C as Card, a as CardContent } from "./Card-BtIXZ0GS.js";
import { E as EmptyState } from "./EmptyState-DZrNEInH.js";
import { T as ThemedIconTile } from "./Elements-EbyZDnT_.js";
import { Download, Activity, MessageSquare, Wallet, AlertCircle, Search, Clock, Tag, XCircle, CheckCircle2, Megaphone, Users, FileText, Bot } from "lucide-react";
import { u as useToast } from "./useToast-BN7qsQL3.js";
import "./utils-B2ZNUmII.js";
import "clsx";
import "tailwind-merge";
import "./BrandLogo-TeztHB0m.js";
import "axios";
import "./Badge-C65MHc2S.js";
import "./BrandingWrapper-DdVUILzh.js";
import "./CookieConsentBanner-X10ew4Dy.js";
import "./RealtimeProvider-D1qLzQY9.js";
import "laravel-echo";
import "pusher-js";
import "@headlessui/react";
const filters = [
  { id: "all", label: "All" },
  { id: "campaign", label: "Campaigns" },
  { id: "contact", label: "Contacts" },
  { id: "inbox", label: "Inbox" },
  { id: "template", label: "Templates" },
  { id: "automation", label: "Automation" },
  { id: "billing", label: "Billing" }
];
function classify(log) {
  const type = log.type.toLowerCase();
  const text = `${log.description} ${JSON.stringify(log.metadata || {})}`.toLowerCase();
  if (type.includes("message") || text.includes("conversation")) return "inbox";
  if (type.includes("connection")) return "inbox";
  if (text.includes("campaign") || text.includes("broadcast")) return "campaign";
  if (text.includes("contact")) return "contact";
  if (text.includes("template")) return "template";
  if (text.includes("bot") || text.includes("automation")) return "automation";
  if (text.includes("billing") || text.includes("payment") || text.includes("wallet")) return "billing";
  return "all";
}
function iconFor(category, type) {
  if (type.includes("error") || type.includes("failed")) return { icon: XCircle, tone: "red" };
  if (type.includes("success")) return { icon: CheckCircle2, tone: "green" };
  if (category === "campaign") return { icon: Megaphone, tone: "purple" };
  if (category === "contact") return { icon: Users, tone: "blue" };
  if (category === "template") return { icon: FileText, tone: "amber" };
  if (category === "automation") return { icon: Bot, tone: "purple" };
  if (category === "billing") return { icon: Wallet, tone: "green" };
  if (category === "inbox") return { icon: MessageSquare, tone: "blue" };
  return { icon: Activity, tone: "gray" };
}
function formatDate(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString("en-IN", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });
}
function ActivityLogsIndex({
  logs
}) {
  const { toast } = useToast();
  const [filter, setFilter] = useState("all");
  const [range, setRange] = useState("7d");
  const [search, setSearch] = useState("");
  const filtered = useMemo(() => logs.filter((log) => {
    const category = classify(log);
    if (filter !== "all" && category !== filter) return false;
    const createdAt = new Date(log.created_at).getTime();
    if (!Number.isNaN(createdAt)) {
      const days = range === "24h" ? 1 : range === "30d" ? 30 : 7;
      if (createdAt < Date.now() - days * 24 * 60 * 60 * 1e3) return false;
    }
    if (search.trim()) {
      const haystack = `${log.description} ${log.type} ${JSON.stringify(log.metadata || {})}`.toLowerCase();
      if (!haystack.includes(search.toLowerCase())) return false;
    }
    return true;
  }), [filter, logs, range, search]);
  const counts = useMemo(() => ({
    total: logs.length,
    errors: logs.filter((log) => log.type.includes("error") || log.type.includes("failed")).length,
    inbox: logs.filter((log) => classify(log) === "inbox").length,
    billing: logs.filter((log) => classify(log) === "billing").length
  }), [logs]);
  return /* @__PURE__ */ jsxs(AppShell, { children: [
    /* @__PURE__ */ jsx(Head, { title: "Activity" }),
    /* @__PURE__ */ jsxs("div", { className: "module-page max-w-[1100px]", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex flex-wrap items-end justify-between gap-3", children: [
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("p", { className: "text-xs font-semibold uppercase tracking-[0.22em] text-waify-green-dark dark:text-emerald-300", children: "Workspace" }),
          /* @__PURE__ */ jsx("h1", { className: "module-heading", children: "Activity" }),
          /* @__PURE__ */ jsx("p", { className: "module-subheading", children: "Everything that happened in your workspace across inbox, campaigns, automation, billing, and Meta events." })
        ] }),
        /* @__PURE__ */ jsxs(Button, { type: "button", variant: "secondary", onClick: () => toast.success("Export started", "Activity log CSV will be prepared."), children: [
          /* @__PURE__ */ jsx(Download, { className: "h-4 w-4" }),
          "Export log"
        ] })
      ] }),
      /* @__PURE__ */ jsx("div", { className: "grid grid-cols-2 gap-4 lg:grid-cols-4", children: [
        { label: "Total events", value: counts.total, icon: Activity, tone: "blue" },
        { label: "Inbox events", value: counts.inbox, icon: MessageSquare, tone: "green" },
        { label: "Billing events", value: counts.billing, icon: Wallet, tone: "amber" },
        { label: "Errors", value: counts.errors, icon: AlertCircle, tone: counts.errors ? "red" : "gray" }
      ].map((item) => {
        const Icon = item.icon;
        return /* @__PURE__ */ jsx(Card, { className: "border-transparent dark:border-slate-700/80", children: /* @__PURE__ */ jsxs(CardContent, { className: "flex items-center gap-3 p-4", children: [
          /* @__PURE__ */ jsx(ThemedIconTile, { tone: item.tone, children: /* @__PURE__ */ jsx(Icon, { className: "h-5 w-5" }) }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("p", { className: "text-xs text-waify-text-muted dark:text-waify-dark-text-muted", children: item.label }),
            /* @__PURE__ */ jsx("p", { className: "text-xl font-bold text-waify-text dark:text-waify-dark-text", children: item.value.toLocaleString("en-IN") })
          ] })
        ] }) }, item.label);
      }) }),
      /* @__PURE__ */ jsxs("div", { className: "flex flex-wrap items-center gap-3", children: [
        /* @__PURE__ */ jsx("div", { className: "flex rounded-btn bg-gray-100 p-1 dark:bg-waify-dark-surface-2", children: [
          ["24h", "24h"],
          ["7d", "7 days"],
          ["30d", "30 days"]
        ].map(([id, label]) => /* @__PURE__ */ jsx("button", { type: "button", onClick: () => setRange(id), className: `rounded-md px-3 py-1.5 text-xs font-semibold ${range === id ? "bg-white text-waify-text shadow-sm dark:bg-waify-dark-surface dark:text-waify-dark-text" : "text-waify-text-muted dark:text-waify-dark-text-muted"}`, children: label }, id)) }),
        /* @__PURE__ */ jsxs("div", { className: "relative min-w-[220px] flex-1", children: [
          /* @__PURE__ */ jsx(Search, { className: "pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-waify-text-muted" }),
          /* @__PURE__ */ jsx(TextInput, { value: search, onChange: (event) => setSearch(event.target.value), placeholder: "Search activity...", className: "pl-10" })
        ] })
      ] }),
      /* @__PURE__ */ jsxs(Card, { className: "overflow-hidden border-transparent dark:border-slate-700/80", children: [
        /* @__PURE__ */ jsx("div", { className: "border-b border-gray-100 px-4 pt-3 dark:border-waify-dark-border", children: /* @__PURE__ */ jsx("div", { className: "-mx-1 flex gap-1 overflow-x-auto px-1 pb-3", children: filters.map((item) => /* @__PURE__ */ jsx("button", { type: "button", onClick: () => setFilter(item.id), className: `shrink-0 rounded-full px-3 py-1.5 text-xs font-semibold transition ${filter === item.id ? "bg-waify-text text-white dark:bg-waify-dark-text dark:text-waify-dark-bg" : "text-waify-text-muted hover:bg-gray-100 hover:text-waify-text dark:text-waify-dark-text-muted dark:hover:bg-waify-dark-surface-2 dark:hover:text-waify-dark-text"}`, children: item.label }, item.id)) }) }),
        /* @__PURE__ */ jsx(CardContent, { className: "p-5", children: filtered.length === 0 ? /* @__PURE__ */ jsx(EmptyState, { icon: Activity, title: "No activity", description: "Try a different filter or date range." }) : /* @__PURE__ */ jsx("div", { children: filtered.map((log, index) => {
          const category = classify(log);
          const meta = iconFor(category, log.type);
          const Icon = meta.icon;
          return /* @__PURE__ */ jsxs("div", { className: "relative flex gap-4 pb-6 last:pb-0", children: [
            index < filtered.length - 1 && /* @__PURE__ */ jsx("div", { className: "absolute left-5 top-11 h-[calc(100%-44px)] w-px bg-gray-200 dark:bg-waify-dark-border" }),
            /* @__PURE__ */ jsx(ThemedIconTile, { tone: meta.tone, className: "relative z-10", children: /* @__PURE__ */ jsx(Icon, { className: "h-5 w-5" }) }),
            /* @__PURE__ */ jsxs("div", { className: "min-w-0 flex-1 rounded-card border border-gray-100 bg-white p-4 dark:border-waify-dark-border dark:bg-waify-dark-surface", children: [
              /* @__PURE__ */ jsxs("div", { className: "flex flex-wrap items-center gap-2", children: [
                /* @__PURE__ */ jsx("span", { className: "rounded-full bg-gray-100 px-2 py-0.5 text-[11px] font-semibold capitalize text-waify-text-muted dark:bg-waify-dark-surface-2 dark:text-waify-dark-text-muted", children: category === "all" ? log.type.replace(/_/g, " ") : category }),
                /* @__PURE__ */ jsx("p", { className: "font-semibold text-waify-text dark:text-waify-dark-text", children: log.description })
              ] }),
              /* @__PURE__ */ jsxs("div", { className: "mt-2 flex items-center gap-2 text-xs text-waify-text-muted dark:text-waify-dark-text-muted", children: [
                /* @__PURE__ */ jsx(Clock, { className: "h-3.5 w-3.5" }),
                formatDate(log.created_at)
              ] }),
              Object.keys(log.metadata || {}).length > 0 && /* @__PURE__ */ jsxs("details", { className: "mt-3", children: [
                /* @__PURE__ */ jsxs("summary", { className: "inline-flex cursor-pointer items-center gap-1 text-xs font-semibold text-waify-green-dark hover:underline dark:text-emerald-300", children: [
                  /* @__PURE__ */ jsx(Tag, { className: "h-3.5 w-3.5" }),
                  "Details"
                ] }),
                /* @__PURE__ */ jsx("pre", { className: "mt-3 max-h-48 overflow-auto rounded-btn bg-slate-950 p-3 text-xs text-slate-100", children: JSON.stringify(log.metadata, null, 2) })
              ] })
            ] })
          ] }, log.id);
        }) }) })
      ] })
    ] })
  ] });
}
export {
  ActivityLogsIndex as default
};
