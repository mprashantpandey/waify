import { jsxs, jsx, Fragment } from "react/jsx-runtime";
import { usePage, Head, Link as Link$1 } from "@inertiajs/react";
import { A as AppShell } from "./AppShell-BMIA1AnI.js";
import { MousePointerClick, Workflow, FileText, Clock, MessageCircle, Sparkles, Megaphone, UploadCloud, BarChart3, Calendar, Send, MailOpen, Link, Users, ArrowRight, Inbox } from "lucide-react";
import { useState, useMemo } from "react";
import "./utils-B2ZNUmII.js";
import "clsx";
import "tailwind-merge";
import "./BrandLogo-TeztHB0m.js";
import "axios";
import "./Badge-C65MHc2S.js";
import "./Elements-EbyZDnT_.js";
import "@headlessui/react";
import "./Button-BJftGNki.js";
import "./BrandingWrapper-DdVUILzh.js";
import "./useToast-BN7qsQL3.js";
import "./CookieConsentBanner-X10ew4Dy.js";
import "./RealtimeProvider-D1qLzQY9.js";
import "laravel-echo";
import "pusher-js";
function formatNumber(num) {
  if (num >= 1e7) return `${(num / 1e7).toFixed(1)}Cr`;
  if (num >= 1e5) return `${(num / 1e5).toFixed(1)}L`;
  if (num >= 1e3) return `${(num / 1e3).toFixed(1)}K`;
  return String(num ?? 0);
}
function clampRate(value) {
  return Math.max(0, Math.min(100, Math.round(Number.isFinite(value) ? value : 0)));
}
function formatDate(date) {
  if (!date) return "No activity";
  return new Date(date).toLocaleString("en-IN", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" });
}
function Card({ children, className = "" }) {
  return /* @__PURE__ */ jsx("div", { className: `rounded-card border border-transparent bg-white shadow-card dark:border-slate-700/80 dark:bg-slate-800 dark:shadow-none ${className}`, children });
}
function MetricChip({ value }) {
  return /* @__PURE__ */ jsx("span", { className: "inline-flex items-center rounded-md bg-gray-100 px-1.5 py-0.5 text-[11px] font-semibold text-waify-text-muted dark:bg-waify-dark-surface-2 dark:text-waify-dark-text-muted", children: value });
}
function ProgressBar({ value, color = "green" }) {
  const colors = {
    green: "bg-waify-green",
    blue: "bg-blue-500",
    purple: "bg-purple-500",
    amber: "bg-amber-500"
  };
  return /* @__PURE__ */ jsx("div", { className: "h-1.5 w-full overflow-hidden rounded-full bg-gray-100 dark:bg-waify-dark-surface-2", children: /* @__PURE__ */ jsx("div", { className: `h-full rounded-full ${colors[color]} transition-all duration-500`, style: { width: `${Math.max(0, Math.min(100, value))}%` } }) });
}
function KpiCard({
  icon: Icon,
  iconBg,
  label,
  value,
  trend,
  trendNote = "current workspace",
  suffix,
  footer
}) {
  return /* @__PURE__ */ jsxs(Card, { className: "p-5 transition-shadow hover:shadow-card-lg", children: [
    /* @__PURE__ */ jsxs("div", { className: "flex items-start justify-between", children: [
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("div", { className: "text-[11px] font-medium uppercase tracking-wide text-waify-text-muted dark:text-waify-dark-text-muted", children: label }),
        /* @__PURE__ */ jsxs("div", { className: "mt-1.5 flex items-baseline gap-1", children: [
          /* @__PURE__ */ jsx("span", { className: "text-2xl font-bold tracking-tight text-waify-text tabular-nums dark:text-waify-dark-text", children: value }),
          suffix && /* @__PURE__ */ jsx("span", { className: "text-lg font-semibold text-waify-text-muted dark:text-waify-dark-text-muted", children: suffix })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "mt-1.5 flex items-center gap-1", children: [
          /* @__PURE__ */ jsx(MetricChip, { value: trend }),
          /* @__PURE__ */ jsx("span", { className: "text-xs text-waify-text-muted dark:text-waify-dark-text-muted", children: trendNote })
        ] })
      ] }),
      /* @__PURE__ */ jsx("div", { className: `flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl ${iconBg}`, children: /* @__PURE__ */ jsx(Icon, { className: "h-[18px] w-[18px]" }) })
    ] }),
    footer
  ] });
}
function PeriodToggle({ value, onChange }) {
  const options = ["7d", "30d"];
  return /* @__PURE__ */ jsx("div", { className: "flex items-center gap-1 rounded-lg bg-gray-100 p-0.5 text-xs font-medium dark:bg-waify-dark-surface-2", children: options.map((option) => /* @__PURE__ */ jsx(
    "button",
    {
      type: "button",
      onClick: () => onChange(option),
      className: `rounded-md px-2.5 py-1.5 transition ${value === option ? "bg-white text-waify-text shadow-sm dark:bg-waify-dark-surface dark:text-waify-dark-text" : "text-waify-text-muted hover:text-waify-text dark:text-waify-dark-text-muted dark:hover:text-waify-dark-text"}`,
      children: option
    },
    option
  )) });
}
function AreaTrendChart({ data }) {
  const width = 760;
  const height = 260;
  const max = Math.max(...data.flatMap((item) => [item.sent, item.delivered]), 1);
  const makePath = (key) => data.map((item, index) => {
    const x = index / Math.max(data.length - 1, 1) * width;
    const y = height - item[key] / max * (height - 26) - 14;
    return `${index === 0 ? "M" : "L"}${x},${y}`;
  }).join(" ");
  const sentPath = makePath("sent");
  const deliveredPath = makePath("delivered");
  return /* @__PURE__ */ jsx("div", { className: "h-[260px] w-full overflow-hidden", children: /* @__PURE__ */ jsxs("svg", { viewBox: `0 0 ${width} ${height}`, className: "h-full w-full", preserveAspectRatio: "none", children: [
    /* @__PURE__ */ jsxs("defs", { children: [
      /* @__PURE__ */ jsxs("linearGradient", { id: "dashboardSent", x1: "0", y1: "0", x2: "0", y2: "1", children: [
        /* @__PURE__ */ jsx("stop", { offset: "0%", stopColor: "#00A548", stopOpacity: "0.25" }),
        /* @__PURE__ */ jsx("stop", { offset: "100%", stopColor: "#00A548", stopOpacity: "0" })
      ] }),
      /* @__PURE__ */ jsxs("linearGradient", { id: "dashboardDelivered", x1: "0", y1: "0", x2: "0", y2: "1", children: [
        /* @__PURE__ */ jsx("stop", { offset: "0%", stopColor: "#60A5FA", stopOpacity: "0.2" }),
        /* @__PURE__ */ jsx("stop", { offset: "100%", stopColor: "#60A5FA", stopOpacity: "0" })
      ] })
    ] }),
    [0, 1, 2, 3].map((line) => /* @__PURE__ */ jsx("line", { x1: "0", x2: width, y1: height / 4 * line + 12, y2: height / 4 * line + 12, stroke: "currentColor", className: "text-gray-100 dark:text-slate-700", strokeDasharray: "4 4" }, line)),
    /* @__PURE__ */ jsx("path", { d: `${sentPath} L${width},${height} L0,${height} Z`, fill: "url(#dashboardSent)" }),
    /* @__PURE__ */ jsx("path", { d: `${deliveredPath} L${width},${height} L0,${height} Z`, fill: "url(#dashboardDelivered)" }),
    /* @__PURE__ */ jsx("path", { d: sentPath, stroke: "#00A548", strokeWidth: "3", fill: "none", strokeLinecap: "round", strokeLinejoin: "round" }),
    /* @__PURE__ */ jsx("path", { d: deliveredPath, stroke: "#60A5FA", strokeWidth: "3", fill: "none", strokeLinecap: "round", strokeLinejoin: "round" })
  ] }) });
}
function StatusBadge({ status }) {
  const normalized = status?.toLowerCase() || "open";
  const map = {
    open: { label: "Open", className: "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300", dot: "bg-emerald-500" },
    assigned: { label: "Assigned", className: "bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-300", dot: "bg-blue-500" },
    closed: { label: "Closed", className: "bg-purple-50 text-purple-700 dark:bg-purple-500/10 dark:text-purple-300", dot: "bg-purple-500" },
    pending: { label: "Pending", className: "bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-300", dot: "bg-amber-500" }
  };
  const item = map[normalized] || { label: normalized, className: "bg-gray-100 text-gray-700 dark:bg-slate-700 dark:text-slate-200", dot: "bg-gray-400" };
  return /* @__PURE__ */ jsxs("span", { className: `inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[11px] font-medium capitalize ${item.className}`, children: [
    /* @__PURE__ */ jsx("span", { className: `h-1.5 w-1.5 rounded-full ${item.dot}` }),
    item.label
  ] });
}
function routeExists(navigation, routeName) {
  return navigation?.some((nav) => nav.href === routeName || nav.route === routeName || nav.name === routeName) ?? true;
}
function safeRoute(routeName, fallback = "#", params) {
  try {
    return params ? route(routeName, params) : route(routeName);
  } catch {
    return fallback;
  }
}
function Dashboard({
  account,
  stats,
  message_trends,
  recent_conversations
}) {
  const { navigation, auth } = usePage().props;
  const [period, setPeriod] = useState("30d");
  const visibleTrends = useMemo(() => (message_trends || []).slice(period === "7d" ? -7 : -30), [period, message_trends]);
  const chartData = visibleTrends.map((item) => ({
    label: item.date ? new Date(item.date).toLocaleDateString("en-IN", { day: "2-digit", month: "short" }) : "-",
    sent: Number(item.outbound || 0),
    delivered: Number(item.delivered || 0)
  }));
  const chartTotal = chartData.reduce((sum, item) => sum + item.sent, 0);
  const totalMessages = Math.max(Number(stats.messages.total || 0), 1);
  const outboundThisMonth = Math.max(0, Number(stats.messages.outbound_this_month ?? stats.usage?.messages_sent ?? stats.messages.outbound ?? 0));
  const deliveredThisMonth = Math.max(0, Number(stats.messages.delivered_this_month ?? stats.messages.delivered ?? 0));
  const readThisMonth = Math.max(0, Number(stats.messages.read_this_month ?? stats.messages.read ?? 0));
  const outboundTotal = Math.max(outboundThisMonth, 1);
  const deliveredTotal = Math.min(outboundTotal, deliveredThisMonth);
  const readTotal = Math.min(deliveredTotal, readThisMonth);
  const deliveryRate = outboundThisMonth > 0 ? clampRate(deliveredTotal / outboundTotal * 100) : 0;
  const readRate = deliveredTotal > 0 ? clampRate(readTotal / deliveredTotal * 100) : 0;
  const quickStats = [
    { icon: MousePointerClick, color: "bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-300", label: "Inbound mix", sub: "Share of total messages", value: `${Math.round(stats.messages.inbound / totalMessages * 100)}%` },
    { icon: Workflow, color: "bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-300", label: "Connections", sub: "Active channels", value: `${stats.connections.active}/${stats.connections.total}` },
    { icon: FileText, color: "bg-purple-50 text-purple-600 dark:bg-purple-500/10 dark:text-purple-300", label: "Approved templates", sub: "Ready to use", value: stats.templates.approved },
    { icon: Clock, color: "bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-300", label: "Assigned chats", sub: "Team workload", value: stats.conversations.assigned },
    { icon: MessageCircle, color: "bg-red-50 text-red-600 dark:bg-red-500/10 dark:text-red-300", label: "Open inbox", sub: "Needs attention", value: stats.conversations.open, highlight: true }
  ];
  const quickActions = [
    { label: "Get started", subtitle: "Complete setup wizard", icon: Sparkles, href: safeRoute("onboarding"), color: "bg-waify-green-soft text-waify-green-dark dark:bg-waify-green/10 dark:text-waify-green" },
    { label: "Create Campaign", subtitle: "Launch a broadcast", icon: Megaphone, href: `${safeRoute("app.broadcasts.index")}?panel=create`, color: "bg-emerald-50 text-waify-green-dark dark:bg-emerald-500/10 dark:text-emerald-300" },
    { label: "Import Contacts", subtitle: "Bulk add from CSV", icon: UploadCloud, href: safeRoute("app.contacts.index"), color: "bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-300" },
    { label: "Build Template", subtitle: "Design a message", icon: FileText, href: safeRoute("app.whatsapp.templates.index"), color: "bg-purple-50 text-purple-600 dark:bg-purple-500/10 dark:text-purple-300" },
    { label: "View Reports", subtitle: "Open analytics", icon: BarChart3, href: safeRoute("app.analytics.index"), color: "bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-300" }
  ].filter((action) => action.href !== "#" || routeExists(navigation, action.label));
  return /* @__PURE__ */ jsxs(AppShell, { children: [
    /* @__PURE__ */ jsx(Head, { title: "Dashboard" }),
    /* @__PURE__ */ jsxs("div", { className: "mx-auto max-w-[1600px] space-y-6 p-2 sm:p-4 lg:p-0", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex flex-col justify-between gap-4 sm:flex-row sm:items-start", children: [
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsxs("h1", { className: "text-2xl font-bold tracking-tight text-waify-text dark:text-waify-dark-text", children: [
            "Good morning",
            auth?.user?.name ? `, ${auth.user.name.split(" ")[0]}` : account?.name ? `, ${account.name}` : ""
          ] }),
          /* @__PURE__ */ jsx("p", { className: "mt-1 text-sm text-waify-text-muted dark:text-waify-dark-text-muted", children: "Here is what is happening with your WhatsApp operations today." })
        ] }),
        /* @__PURE__ */ jsxs("button", { type: "button", className: "inline-flex h-9 items-center gap-2 self-start rounded-btn bg-white px-3 text-sm text-waify-text ring-1 ring-gray-200 dark:bg-waify-dark-surface dark:text-waify-dark-text dark:ring-waify-dark-border", disabled: true, children: [
          /* @__PURE__ */ jsx(Calendar, { className: "h-3.5 w-3.5" }),
          "Live workspace data"
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4", children: [
        /* @__PURE__ */ jsx(
          KpiCard,
          {
            icon: Send,
            iconBg: "bg-emerald-50 text-waify-green-dark dark:bg-emerald-500/10 dark:text-emerald-300",
            label: "Messages Sent",
            value: formatNumber(outboundThisMonth),
            trend: `${stats.messages.today} today`,
            footer: /* @__PURE__ */ jsxs("div", { className: "mt-4 text-xs text-waify-text-muted dark:text-waify-dark-text-muted", children: [
              formatNumber(stats.messages.this_month),
              " total messages this month"
            ] })
          }
        ),
        /* @__PURE__ */ jsx(
          KpiCard,
          {
            icon: MailOpen,
            iconBg: "bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-300",
            label: "Delivery Rate",
            value: deliveryRate,
            suffix: "%",
            trend: `${formatNumber(deliveredTotal)} delivered`,
            footer: /* @__PURE__ */ jsxs(Fragment, { children: [
              /* @__PURE__ */ jsx("div", { className: "mt-4", children: /* @__PURE__ */ jsx(ProgressBar, { value: deliveryRate, color: "blue" }) }),
              /* @__PURE__ */ jsxs("div", { className: "mt-1.5 flex items-center justify-between text-[11px] text-waify-text-muted dark:text-waify-dark-text-muted", children: [
                /* @__PURE__ */ jsx("span", { children: "Read rate" }),
                /* @__PURE__ */ jsxs("span", { className: "font-medium text-blue-600 dark:text-blue-300", children: [
                  readRate,
                  "% of delivered"
                ] })
              ] })
            ] })
          }
        ),
        /* @__PURE__ */ jsx(
          KpiCard,
          {
            icon: Link,
            iconBg: "bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-300",
            label: "Active Connections",
            value: stats.connections.active,
            trend: `${stats.connections.total} total`,
            footer: /* @__PURE__ */ jsx("div", { className: "mt-4", children: /* @__PURE__ */ jsx(ProgressBar, { value: stats.connections.total > 0 ? stats.connections.active / stats.connections.total * 100 : 0 }) })
          }
        ),
        /* @__PURE__ */ jsx(
          KpiCard,
          {
            icon: Users,
            iconBg: "bg-purple-50 text-purple-600 dark:bg-purple-500/10 dark:text-purple-300",
            label: "Team Members",
            value: stats.team.total_members,
            trend: `${stats.team.admins} admins`,
            trendNote: "active workspace",
            footer: /* @__PURE__ */ jsxs("div", { className: "mt-4 text-xs text-waify-text-muted dark:text-waify-dark-text-muted", children: [
              stats.conversations.assigned,
              " conversations assigned"
            ] })
          }
        )
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 gap-4 lg:grid-cols-3", children: [
        /* @__PURE__ */ jsxs(Card, { className: "p-5 lg:col-span-2", children: [
          /* @__PURE__ */ jsxs("div", { className: "mb-4 flex flex-wrap items-start justify-between gap-3", children: [
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx("h2", { className: "text-base font-semibold text-waify-text dark:text-waify-dark-text", children: "Outbound Sent vs Delivered" }),
              /* @__PURE__ */ jsxs("p", { className: "mt-0.5 text-xs text-waify-text-muted dark:text-waify-dark-text-muted", children: [
                "Last ",
                period === "7d" ? "7" : "30",
                " days · ",
                formatNumber(chartTotal),
                " outbound messages"
              ] })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "flex flex-wrap items-center gap-3", children: [
              /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-4 text-xs text-waify-text dark:text-waify-dark-text", children: [
                /* @__PURE__ */ jsxs("span", { className: "flex items-center gap-1.5", children: [
                  /* @__PURE__ */ jsx("span", { className: "h-2.5 w-2.5 rounded-full bg-waify-green" }),
                  " Sent"
                ] }),
                /* @__PURE__ */ jsxs("span", { className: "flex items-center gap-1.5", children: [
                  /* @__PURE__ */ jsx("span", { className: "h-2.5 w-2.5 rounded-full bg-blue-400" }),
                  " Delivered"
                ] })
              ] }),
              /* @__PURE__ */ jsx(PeriodToggle, { value: period, onChange: setPeriod })
            ] })
          ] }),
          /* @__PURE__ */ jsx(AreaTrendChart, { data: chartData })
        ] }),
        /* @__PURE__ */ jsxs(Card, { className: "flex h-full flex-col p-5", children: [
          /* @__PURE__ */ jsx("h2", { className: "text-base font-semibold text-waify-text dark:text-waify-dark-text", children: "Quick stats" }),
          /* @__PURE__ */ jsx("div", { className: "mt-4 flex-1 space-y-3", children: quickStats.map(({ icon: Icon, color, label, sub, value, highlight }) => /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between", children: [
            /* @__PURE__ */ jsxs("div", { className: "flex min-w-0 items-center gap-3", children: [
              /* @__PURE__ */ jsx("div", { className: `flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg ${color}`, children: /* @__PURE__ */ jsx(Icon, { className: "h-4 w-4" }) }),
              /* @__PURE__ */ jsxs("div", { className: "min-w-0", children: [
                /* @__PURE__ */ jsx("div", { className: "text-sm font-medium text-waify-text dark:text-waify-dark-text", children: label }),
                /* @__PURE__ */ jsx("div", { className: "text-xs text-waify-text-muted dark:text-waify-dark-text-muted", children: sub })
              ] })
            ] }),
            /* @__PURE__ */ jsx("span", { className: `ml-2 flex-shrink-0 text-sm font-bold tabular-nums ${highlight ? "text-red-600 dark:text-red-300" : "text-waify-text dark:text-waify-dark-text"}`, children: value })
          ] }, label)) }),
          /* @__PURE__ */ jsxs(Link$1, { href: safeRoute("app.whatsapp.conversations.index"), className: "mt-4 flex h-9 w-full items-center justify-center gap-1.5 rounded-btn bg-waify-green-soft text-sm font-medium text-waify-green-dark transition hover:bg-emerald-100 dark:bg-waify-green/10 dark:text-waify-green dark:hover:bg-waify-green/15", children: [
            "Open inbox ",
            /* @__PURE__ */ jsx(ArrowRight, { className: "h-3.5 w-3.5" })
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxs(Card, { className: "overflow-hidden p-0", children: [
        /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between border-b border-gray-100 px-5 py-4 dark:border-waify-dark-border", children: [
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("h2", { className: "text-base font-semibold text-waify-text dark:text-waify-dark-text", children: "Recent Conversations" }),
            /* @__PURE__ */ jsx("p", { className: "mt-0.5 text-xs text-waify-text-muted dark:text-waify-dark-text-muted", children: "Latest customer activity" })
          ] }),
          /* @__PURE__ */ jsxs(Link$1, { href: safeRoute("app.whatsapp.conversations.index"), className: "flex items-center gap-1 text-sm font-medium text-waify-green-dark hover:underline dark:text-waify-green", children: [
            "View all ",
            /* @__PURE__ */ jsx(ArrowRight, { className: "h-3.5 w-3.5" })
          ] })
        ] }),
        /* @__PURE__ */ jsx("div", { className: "overflow-x-auto", children: /* @__PURE__ */ jsxs("table", { className: "w-full min-w-[760px] text-sm", children: [
          /* @__PURE__ */ jsx("thead", { children: /* @__PURE__ */ jsxs("tr", { className: "bg-gray-50/60 text-left text-[11px] uppercase tracking-wider text-waify-text-muted dark:bg-waify-dark-surface-2/70 dark:text-waify-dark-text-muted", children: [
            /* @__PURE__ */ jsx("th", { className: "px-5 py-3 font-medium", children: "Contact" }),
            /* @__PURE__ */ jsx("th", { className: "px-4 py-3 font-medium", children: "Status" }),
            /* @__PURE__ */ jsx("th", { className: "px-4 py-3 font-medium", children: "Last message" }),
            /* @__PURE__ */ jsx("th", { className: "px-4 py-3 font-medium text-right", children: "Activity" })
          ] }) }),
          /* @__PURE__ */ jsx("tbody", { children: recent_conversations.length === 0 ? /* @__PURE__ */ jsx("tr", { children: /* @__PURE__ */ jsxs("td", { colSpan: 4, className: "px-5 py-14 text-center", children: [
            /* @__PURE__ */ jsx(Inbox, { className: "mx-auto mb-3 h-10 w-10 text-gray-300 dark:text-waify-dark-text-muted" }),
            /* @__PURE__ */ jsx("p", { className: "text-sm font-medium text-waify-text dark:text-waify-dark-text", children: "No conversations yet" }),
            /* @__PURE__ */ jsx("p", { className: "mt-1 text-xs text-waify-text-muted dark:text-waify-dark-text-muted", children: "New WhatsApp conversations will appear here." })
          ] }) }) : recent_conversations.slice(0, 6).map((conversation) => {
            const href = safeRoute("app.whatsapp.conversations.index", safeRoute("app.whatsapp.conversations.index"), { conversation: conversation.id });
            return /* @__PURE__ */ jsxs("tr", { className: "cursor-pointer border-t border-gray-100 transition hover:bg-gray-50/60 dark:border-waify-dark-border dark:hover:bg-waify-dark-surface-2/60", children: [
              /* @__PURE__ */ jsx("td", { className: "px-5 py-3.5", children: /* @__PURE__ */ jsxs(Link$1, { href, className: "flex items-center gap-3", children: [
                /* @__PURE__ */ jsx("div", { className: "flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-waify-green text-sm font-bold text-waify-ink", children: conversation.contact_name?.charAt(0) || "C" }),
                /* @__PURE__ */ jsxs("div", { children: [
                  /* @__PURE__ */ jsx("div", { className: "font-medium text-waify-text dark:text-waify-dark-text", children: conversation.contact_name || "Unknown contact" }),
                  /* @__PURE__ */ jsx("div", { className: "mt-0.5 text-[11px] text-waify-text-muted dark:text-waify-dark-text-muted", children: "WhatsApp conversation" })
                ] })
              ] }) }),
              /* @__PURE__ */ jsx("td", { className: "px-4 py-3.5", children: /* @__PURE__ */ jsx(StatusBadge, { status: conversation.status }) }),
              /* @__PURE__ */ jsx("td", { className: "max-w-sm truncate px-4 py-3.5 text-waify-text-muted dark:text-waify-dark-text-muted", children: conversation.last_message || "No message preview" }),
              /* @__PURE__ */ jsx("td", { className: "px-4 py-3.5 text-right text-xs text-waify-text-muted dark:text-waify-dark-text-muted", children: formatDate(conversation.last_activity_at) })
            ] }, conversation.id);
          }) })
        ] }) })
      ] }),
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("h2", { className: "mb-3 text-sm font-semibold uppercase tracking-wider text-waify-text dark:text-waify-dark-text", children: "Quick Actions" }),
        /* @__PURE__ */ jsx("div", { className: "grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-5", children: quickActions.map(({ label, subtitle, icon: Icon, href, color }) => /* @__PURE__ */ jsxs(Link$1, { href, className: "group rounded-card border border-transparent bg-white p-4 text-left shadow-card transition-all hover:-translate-y-0.5 hover:shadow-card-lg dark:border-slate-700/80 dark:bg-slate-800 dark:shadow-none", children: [
          /* @__PURE__ */ jsx("div", { className: `mb-3 flex h-10 w-10 items-center justify-center rounded-lg transition-transform group-hover:scale-110 ${color}`, children: /* @__PURE__ */ jsx(Icon, { className: "h-5 w-5" }) }),
          /* @__PURE__ */ jsx("div", { className: "text-sm font-semibold text-waify-text dark:text-waify-dark-text", children: label }),
          /* @__PURE__ */ jsx("div", { className: "mt-0.5 text-xs text-waify-text-muted dark:text-waify-dark-text-muted", children: subtitle })
        ] }, label)) })
      ] })
    ] })
  ] });
}
export {
  Dashboard as default
};
