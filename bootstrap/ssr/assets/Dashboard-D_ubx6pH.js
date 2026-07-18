import { jsxs, jsx } from "react/jsx-runtime";
import { usePage, Head, Link as Link$1 } from "@inertiajs/react";
import { useState, useMemo } from "react";
import { P as PlatformShell } from "./PlatformShell-BJ42joc8.js";
import { C as Card, a as CardContent } from "./Card-BtIXZ0GS.js";
import { B as Badge } from "./Badge-C65MHc2S.js";
import { B as Button } from "./Button-BJftGNki.js";
import { M as MisconfiguredSettingsAlert } from "./MisconfiguredSettingsAlert-CD_n8Xs5.js";
import { Link, CreditCard, FileText, Inbox, Send, Activity, Download, Plus, Building2, LifeBuoy, Users, BarChart3, Layers, History, Shield, CheckCircle2, MessageSquare, AlertCircle, TrendingUp } from "lucide-react";
import "axios";
import "./BrandingWrapper-DdVUILzh.js";
import "./utils-B2ZNUmII.js";
import "clsx";
import "tailwind-merge";
import "./BrandLogo-TeztHB0m.js";
import "./useToast-BN7qsQL3.js";
import "./Elements-EbyZDnT_.js";
import "@headlessui/react";
import "./Alert-CEZ-sRON.js";
function formatNumber(num) {
  if (num >= 1e6) return `${(num / 1e6).toFixed(1)}M`;
  if (num >= 1e3) return `${(num / 1e3).toFixed(1)}K`;
  return String(num || 0);
}
function statusVariant(status) {
  if (["active", "approved", "success"].includes(status)) return "success";
  if (["trial", "trialing", "pending"].includes(status)) return "info";
  if (["past_due", "suspended"].includes(status)) return "warning";
  if (["disabled", "rejected", "failed"].includes(status)) return "danger";
  return "default";
}
function SegmentedControl({
  value,
  onChange,
  options
}) {
  return /* @__PURE__ */ jsx("div", { className: "inline-flex rounded-lg bg-gray-100 p-1 dark:bg-slate-800", children: options.map((option) => /* @__PURE__ */ jsx(
    "button",
    {
      type: "button",
      onClick: () => onChange(option.id),
      className: `rounded-md px-3 py-1.5 text-xs font-semibold transition ${value === option.id ? "bg-white text-waify-text shadow-sm dark:bg-slate-700 dark:text-waify-dark-text" : "text-waify-text-muted hover:text-waify-text dark:text-waify-dark-text-muted dark:hover:text-waify-dark-text"}`,
      children: option.label
    },
    option.id
  )) });
}
function TrendBadge({ value, positive = true }) {
  return /* @__PURE__ */ jsxs("span", { className: `inline-flex items-center gap-0.5 rounded-md px-1.5 py-0.5 text-[11px] font-semibold ${positive ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-700"}`, children: [
    /* @__PURE__ */ jsx(TrendingUp, { className: `h-3 w-3 ${positive ? "" : "rotate-180"}` }),
    value
  ] });
}
function ProgressBar({ value, color = "green" }) {
  const colors = {
    green: "bg-waify-green",
    purple: "bg-purple-500",
    amber: "bg-amber-500",
    red: "bg-red-500"
  };
  return /* @__PURE__ */ jsx("div", { className: "progress-track h-2 overflow-hidden rounded-full bg-gray-200", children: /* @__PURE__ */ jsx("div", { className: `${colors[color]} h-full rounded-full`, style: { width: `${Math.max(0, Math.min(value, 100))}%` } }) });
}
function StatCard({
  label,
  value,
  delta,
  icon: Icon,
  bg,
  color
}) {
  return /* @__PURE__ */ jsx(Card, { className: "transition-shadow hover:shadow-card-lg", children: /* @__PURE__ */ jsxs(CardContent, { className: "p-4", children: [
    /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between", children: [
      /* @__PURE__ */ jsx("span", { className: `flex h-9 w-9 items-center justify-center rounded-lg ${bg}`, children: /* @__PURE__ */ jsx(Icon, { className: `h-[18px] w-[18px] ${color}` }) }),
      /* @__PURE__ */ jsx(TrendBadge, { value: delta, positive: !delta.startsWith("-") })
    ] }),
    /* @__PURE__ */ jsx("div", { className: "mt-3 text-2xl font-bold tabular-nums text-waify-text dark:text-waify-dark-text", children: value }),
    /* @__PURE__ */ jsx("div", { className: "mt-1 text-xs text-waify-text-muted dark:text-waify-dark-text-muted", children: label })
  ] }) });
}
function QuickLink({ href, icon: Icon, label }) {
  return /* @__PURE__ */ jsxs(Link$1, { href, className: "surface rounded-card p-4 text-left ring-1 ring-gray-100 transition hover:shadow-card-lg dark:ring-slate-700", children: [
    /* @__PURE__ */ jsx(Icon, { className: "mb-2 h-5 w-5 text-waify-green" }),
    /* @__PURE__ */ jsx("div", { className: "text-sm font-semibold text-waify-text dark:text-waify-dark-text", children: label }),
    /* @__PURE__ */ jsx("div", { className: "mt-0.5 text-xs text-waify-text-muted dark:text-waify-dark-text-muted", children: "Open" })
  ] });
}
function PlatformDashboard({
  stats,
  recent_accounts,
  message_trends,
  top_accounts,
  misconfigured_settings
}) {
  const { auth } = usePage().props;
  const [period, setPeriod] = useState("30d");
  const barHeights = useMemo(() => {
    const values = (message_trends || []).map((trend) => Number(trend.count || 0));
    const max = Math.max(...values, 1);
    return values.length > 0 ? values.map((value) => Math.max(8, Math.round(value / max * 100))) : [8, 8, 8, 8, 8, 8, 8];
  }, [message_trends]);
  const distribution = useMemo(() => {
    const total = Math.max(stats.total_subscriptions, 1);
    return [
      { label: "Active", value: stats.active_subscriptions, pct: Math.round(stats.active_subscriptions / total * 100), color: "green" },
      { label: "Trialing", value: stats.trialing_subscriptions, pct: Math.round(stats.trialing_subscriptions / total * 100), color: "purple" },
      { label: "Past due", value: stats.past_due_subscriptions, pct: Math.round(stats.past_due_subscriptions / total * 100), color: "amber" }
    ];
  }, [stats.active_subscriptions, stats.past_due_subscriptions, stats.total_subscriptions, stats.trialing_subscriptions]);
  const alerts = [
    stats.connections_with_errors > 0 ? {
      title: `${stats.connections_with_errors} WABA connection ${stats.connections_with_errors === 1 ? "error" : "errors"}`,
      message: "Review connection health and webhook status.",
      href: route("platform.system-health"),
      icon: Link,
      color: "text-amber-500"
    } : null,
    stats.past_due_subscriptions > 0 ? {
      title: `${stats.past_due_subscriptions} past due subscription${stats.past_due_subscriptions === 1 ? "" : "s"}`,
      message: "Billing follow-up may be required.",
      href: route("platform.subscriptions.index", { status: "past_due" }),
      icon: CreditCard,
      color: "text-red-500"
    } : null,
    stats.pending_templates > 0 ? {
      title: `${stats.pending_templates} pending template${stats.pending_templates === 1 ? "" : "s"}`,
      message: "Templates are waiting for Meta review or sync.",
      href: route("platform.templates.index", { status: "PENDING" }),
      icon: FileText,
      color: "text-blue-500"
    } : null
  ].filter(Boolean);
  const messageDirections = [
    ["Inbound", stats.inbound_messages, Inbox, "green"],
    ["Outbound", stats.outbound_messages, Send, "purple"],
    ["Today", stats.messages_today, Activity, "amber"]
  ];
  return /* @__PURE__ */ jsxs(PlatformShell, { auth, children: [
    /* @__PURE__ */ jsx(Head, { title: "Platform admin" }),
    /* @__PURE__ */ jsxs("div", { className: "space-y-6", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex flex-wrap items-center justify-between gap-3", children: [
        /* @__PURE__ */ jsx(
          SegmentedControl,
          {
            value: period,
            onChange: setPeriod,
            options: [
              { id: "7d", label: "7d" },
              { id: "30d", label: "30d" },
              { id: "90d", label: "90d" }
            ]
          }
        ),
        /* @__PURE__ */ jsxs("div", { className: "flex gap-2", children: [
          /* @__PURE__ */ jsxs(Button, { variant: "secondary", size: "sm", children: [
            /* @__PURE__ */ jsx(Download, { className: "h-4 w-4" }),
            "Export"
          ] }),
          /* @__PURE__ */ jsx(Link$1, { href: route("platform.accounts.index"), children: /* @__PURE__ */ jsxs(Button, { size: "sm", children: [
            /* @__PURE__ */ jsx(Plus, { className: "h-4 w-4" }),
            "Add workspace"
          ] }) })
        ] })
      ] }),
      misconfigured_settings && misconfigured_settings.length > 0 && /* @__PURE__ */ jsx(MisconfiguredSettingsAlert, { misconfiguredSettings: misconfigured_settings, variant: "dashboard" }),
      /* @__PURE__ */ jsxs("div", { className: "grid gap-4 sm:grid-cols-2 xl:grid-cols-4", children: [
        /* @__PURE__ */ jsx(
          StatCard,
          {
            label: "Active workspaces",
            value: formatNumber(stats.active_accounts),
            delta: `${stats.total_accounts} total`,
            icon: Building2,
            bg: "bg-blue-50 dark:bg-blue-950/40",
            color: "text-blue-600"
          }
        ),
        /* @__PURE__ */ jsx(
          StatCard,
          {
            label: `Messages (${period})`,
            value: formatNumber(period === "7d" ? stats.messages_this_week : stats.messages_this_month),
            delta: `${formatNumber(stats.messages_today)} today`,
            icon: Send,
            bg: "bg-waify-green-soft",
            color: "text-waify-green-dark"
          }
        ),
        /* @__PURE__ */ jsx(
          StatCard,
          {
            label: "Active subscriptions",
            value: formatNumber(stats.active_subscriptions),
            delta: `${stats.trialing_subscriptions} trials`,
            icon: CreditCard,
            bg: "bg-purple-50 dark:bg-purple-950/40",
            color: "text-purple-600"
          }
        ),
        /* @__PURE__ */ jsx(
          StatCard,
          {
            label: "Open operational issues",
            value: formatNumber(stats.connections_with_errors + stats.past_due_subscriptions + stats.rejected_templates),
            delta: stats.connections_with_errors + stats.past_due_subscriptions + stats.rejected_templates > 0 ? "- attention" : "0 issues",
            icon: LifeBuoy,
            bg: "bg-amber-50 dark:bg-amber-950/40",
            color: "text-amber-600"
          }
        )
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "grid gap-4 lg:grid-cols-3", children: [
        /* @__PURE__ */ jsx(Card, { className: "lg:col-span-2", children: /* @__PURE__ */ jsxs(CardContent, { className: "p-5", children: [
          /* @__PURE__ */ jsx("h3", { className: "mb-1 text-sm font-semibold text-waify-text dark:text-waify-dark-text", children: "Message volume" }),
          /* @__PURE__ */ jsx("p", { className: "mb-4 text-xs text-waify-text-muted dark:text-waify-dark-text-muted", children: "Outbound + inbound across all workspaces" }),
          /* @__PURE__ */ jsx("div", { className: "flex h-24 items-end gap-1", children: barHeights.map((height, index) => /* @__PURE__ */ jsx(
            "div",
            {
              className: "flex-1 rounded-sm bg-waify-green",
              style: { height: `${height}%`, opacity: 0.35 + index / Math.max(barHeights.length, 1) * 0.65 }
            },
            `${height}-${index}`
          )) })
        ] }) }),
        /* @__PURE__ */ jsx(Card, { children: /* @__PURE__ */ jsxs(CardContent, { className: "p-5", children: [
          /* @__PURE__ */ jsx("h3", { className: "mb-4 text-sm font-semibold text-waify-text dark:text-waify-dark-text", children: "Subscription distribution" }),
          /* @__PURE__ */ jsx("ul", { className: "space-y-3", children: distribution.map((item) => /* @__PURE__ */ jsxs("li", { children: [
            /* @__PURE__ */ jsxs("div", { className: "mb-1 flex justify-between text-sm", children: [
              /* @__PURE__ */ jsx("span", { className: "text-waify-text dark:text-waify-dark-text", children: item.label }),
              /* @__PURE__ */ jsx("span", { className: "tabular-nums text-waify-text-muted dark:text-waify-dark-text-muted", children: item.value })
            ] }),
            /* @__PURE__ */ jsx(ProgressBar, { value: item.pct, color: item.color })
          ] }, item.label)) })
        ] }) })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "grid gap-4 lg:grid-cols-2", children: [
        /* @__PURE__ */ jsx(Card, { children: /* @__PURE__ */ jsxs(CardContent, { className: "p-5", children: [
          /* @__PURE__ */ jsxs("div", { className: "mb-4 flex items-center justify-between", children: [
            /* @__PURE__ */ jsx("h3", { className: "text-sm font-semibold text-waify-text dark:text-waify-dark-text", children: "Recent workspaces" }),
            /* @__PURE__ */ jsx(Link$1, { href: route("platform.accounts.index"), children: /* @__PURE__ */ jsx(Button, { variant: "ghost", size: "sm", children: "View all" }) })
          ] }),
          /* @__PURE__ */ jsxs("ul", { className: "divide-y divide-gray-100 dark:divide-slate-700", children: [
            recent_accounts.slice(0, 5).map((account) => /* @__PURE__ */ jsxs("li", { className: "flex items-center justify-between py-3 first:pt-0 last:pb-0", children: [
              /* @__PURE__ */ jsxs(Link$1, { href: route("platform.accounts.show", { account: account.id }), className: "flex min-w-0 items-center gap-2", children: [
                /* @__PURE__ */ jsx("span", { className: "flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-waify-green text-xs font-bold text-white", children: account.name.charAt(0).toUpperCase() }),
                /* @__PURE__ */ jsxs("div", { className: "min-w-0", children: [
                  /* @__PURE__ */ jsx("div", { className: "truncate text-sm font-medium text-waify-text dark:text-waify-dark-text", children: account.name }),
                  /* @__PURE__ */ jsx("div", { className: "text-[11px] text-waify-text-muted dark:text-waify-dark-text-muted", children: account.owner.name })
                ] })
              ] }),
              /* @__PURE__ */ jsx(Badge, { variant: statusVariant(account.status), children: account.status })
            ] }, account.id)),
            recent_accounts.length === 0 && /* @__PURE__ */ jsx("li", { className: "py-8 text-center text-sm text-waify-text-muted dark:text-waify-dark-text-muted", children: "No workspaces yet." })
          ] })
        ] }) }),
        /* @__PURE__ */ jsx(Card, { children: /* @__PURE__ */ jsxs(CardContent, { className: "p-5", children: [
          /* @__PURE__ */ jsxs("div", { className: "mb-4 flex items-center justify-between", children: [
            /* @__PURE__ */ jsx("h3", { className: "text-sm font-semibold text-waify-text dark:text-waify-dark-text", children: "System health" }),
            /* @__PURE__ */ jsx(Link$1, { href: route("platform.system-health"), children: /* @__PURE__ */ jsx(Button, { variant: "ghost", size: "sm", children: "Details" }) })
          ] }),
          /* @__PURE__ */ jsx("ul", { className: "space-y-3", children: [
            ["WhatsApp send API", stats.active_connections > 0 ? "Operational" : "No active connection", stats.active_connections > 0 ? "success" : "warning"],
            ["Webhook delivery", stats.connections_with_errors > 0 ? `${stats.connections_with_errors} errors` : "No connection errors", stats.connections_with_errors > 0 ? "warning" : "success"],
            ["Meta templates", stats.rejected_templates > 0 ? `${stats.rejected_templates} rejected` : `${stats.approved_templates} approved`, stats.rejected_templates > 0 ? "warning" : "success"],
            ["Billing status", stats.past_due_subscriptions > 0 ? `${stats.past_due_subscriptions} past due` : "Operational", stats.past_due_subscriptions > 0 ? "warning" : "success"]
          ].map(([name, status, variant]) => /* @__PURE__ */ jsxs("li", { className: "flex items-center justify-between text-sm", children: [
            /* @__PURE__ */ jsx("span", { className: "text-waify-text dark:text-waify-dark-text", children: name }),
            /* @__PURE__ */ jsx(Badge, { variant, children: status })
          ] }, name)) })
        ] }) })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "grid gap-4 lg:grid-cols-3", children: [
        /* @__PURE__ */ jsx(Card, { children: /* @__PURE__ */ jsxs(CardContent, { className: "p-5", children: [
          /* @__PURE__ */ jsx("h3", { className: "mb-4 text-sm font-semibold text-waify-text dark:text-waify-dark-text", children: "Operational alerts" }),
          /* @__PURE__ */ jsx("div", { className: "space-y-3", children: alerts.length === 0 ? /* @__PURE__ */ jsx("div", { className: "rounded-card border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-700 dark:border-emerald-400/30 dark:bg-emerald-950/30 dark:text-emerald-300", children: "No active platform alerts." }) : alerts.map((alert) => {
            const Icon = alert.icon;
            return /* @__PURE__ */ jsxs(Link$1, { href: alert.href, className: "flex gap-3 rounded-card border border-gray-100 p-3 transition hover:bg-gray-50 dark:border-slate-700 dark:hover:bg-slate-800/60", children: [
              /* @__PURE__ */ jsx(Icon, { className: `h-5 w-5 flex-shrink-0 ${alert.color}` }),
              /* @__PURE__ */ jsxs("div", { children: [
                /* @__PURE__ */ jsx("p", { className: "text-sm font-medium text-waify-text dark:text-waify-dark-text", children: alert.title }),
                /* @__PURE__ */ jsx("p", { className: "text-xs text-waify-text-muted dark:text-waify-dark-text-muted", children: alert.message })
              ] })
            ] }, alert.title);
          }) })
        ] }) }),
        /* @__PURE__ */ jsx(Card, { children: /* @__PURE__ */ jsxs(CardContent, { className: "p-5", children: [
          /* @__PURE__ */ jsx("h3", { className: "mb-4 text-sm font-semibold text-waify-text dark:text-waify-dark-text", children: "Top workspaces" }),
          /* @__PURE__ */ jsx("div", { className: "space-y-3", children: top_accounts.length === 0 ? /* @__PURE__ */ jsx("p", { className: "py-6 text-center text-sm text-waify-text-muted dark:text-waify-dark-text-muted", children: "No message data available." }) : top_accounts.map((account, index) => /* @__PURE__ */ jsxs(Link$1, { href: route("platform.accounts.show", { account: account.id }), className: "flex items-center justify-between rounded-card p-2 transition hover:bg-gray-50 dark:hover:bg-slate-800/60", children: [
            /* @__PURE__ */ jsxs("div", { className: "flex min-w-0 items-center gap-2", children: [
              /* @__PURE__ */ jsx("span", { className: "flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50 text-xs font-bold text-blue-600 dark:bg-blue-950/40", children: index + 1 }),
              /* @__PURE__ */ jsxs("div", { className: "min-w-0", children: [
                /* @__PURE__ */ jsx("p", { className: "truncate text-sm font-medium text-waify-text dark:text-waify-dark-text", children: account.name }),
                /* @__PURE__ */ jsx("p", { className: "text-[11px] text-waify-text-muted dark:text-waify-dark-text-muted", children: account.slug })
              ] })
            ] }),
            /* @__PURE__ */ jsx("span", { className: "text-sm font-semibold tabular-nums text-waify-text dark:text-waify-dark-text", children: formatNumber(account.message_count) })
          ] }, account.id)) })
        ] }) }),
        /* @__PURE__ */ jsx(Card, { children: /* @__PURE__ */ jsxs(CardContent, { className: "p-5", children: [
          /* @__PURE__ */ jsx("h3", { className: "mb-4 text-sm font-semibold text-waify-text dark:text-waify-dark-text", children: "Message direction" }),
          /* @__PURE__ */ jsx("ul", { className: "space-y-3", children: messageDirections.map(([label, value, Icon, color]) => /* @__PURE__ */ jsxs("li", { children: [
            /* @__PURE__ */ jsxs("div", { className: "mb-1 flex items-center justify-between text-sm", children: [
              /* @__PURE__ */ jsxs("span", { className: "inline-flex items-center gap-2 text-waify-text dark:text-waify-dark-text", children: [
                /* @__PURE__ */ jsx(Icon, { className: "h-4 w-4 text-waify-green" }),
                label
              ] }),
              /* @__PURE__ */ jsx("span", { className: "tabular-nums text-waify-text-muted dark:text-waify-dark-text-muted", children: formatNumber(Number(value)) })
            ] }),
            /* @__PURE__ */ jsx(ProgressBar, { value: stats.total_messages > 0 ? Math.round(Number(value) / stats.total_messages * 100) : 0, color })
          ] }, String(label))) })
        ] }) })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "grid gap-3 sm:grid-cols-2 lg:grid-cols-4", children: [
        /* @__PURE__ */ jsx(QuickLink, { href: route("platform.accounts.index"), icon: Building2, label: "Workspaces" }),
        /* @__PURE__ */ jsx(QuickLink, { href: route("platform.users.index"), icon: Users, label: "Users" }),
        /* @__PURE__ */ jsx(QuickLink, { href: route("platform.subscriptions.index"), icon: CreditCard, label: "Subscriptions" }),
        /* @__PURE__ */ jsx(QuickLink, { href: route("platform.transactions.index"), icon: BarChart3, label: "Transactions" }),
        /* @__PURE__ */ jsx(QuickLink, { href: route("platform.plans.index"), icon: Layers, label: "Plans" }),
        /* @__PURE__ */ jsx(QuickLink, { href: route("platform.support.index"), icon: LifeBuoy, label: "Support queue" }),
        /* @__PURE__ */ jsx(QuickLink, { href: route("platform.templates.index"), icon: FileText, label: "Templates" }),
        /* @__PURE__ */ jsx(QuickLink, { href: route("platform.activity-logs"), icon: History, label: "Audit logs" }),
        /* @__PURE__ */ jsx(QuickLink, { href: route("platform.modules.index"), icon: Shield, label: "Modules" }),
        /* @__PURE__ */ jsx(QuickLink, { href: route("platform.system-health"), icon: CheckCircle2, label: "System health" }),
        /* @__PURE__ */ jsx(QuickLink, { href: route("platform.analytics"), icon: MessageSquare, label: "Analytics" }),
        /* @__PURE__ */ jsx(QuickLink, { href: route("platform.settings"), icon: AlertCircle, label: "Settings" })
      ] })
    ] })
  ] });
}
export {
  PlatformDashboard as default
};
