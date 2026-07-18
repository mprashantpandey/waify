import { jsxs, jsx } from "react/jsx-runtime";
import { usePage, Head, router } from "@inertiajs/react";
import { useState, useMemo } from "react";
import { Calendar, Download, Send, MailOpen, Reply, MousePointerClick, UserMinus, TrendingUp, Clock, BarChart3 } from "lucide-react";
import { P as PlatformShell } from "./PlatformShell-BJ42joc8.js";
import { C as Card, a as CardContent } from "./Card-BtIXZ0GS.js";
import { B as Badge } from "./Badge-C65MHc2S.js";
import { B as Button } from "./Button-BJftGNki.js";
import { c as cn } from "./utils-B2ZNUmII.js";
import "axios";
import "./BrandingWrapper-DdVUILzh.js";
import "./BrandLogo-TeztHB0m.js";
import "./useToast-BN7qsQL3.js";
import "./Elements-EbyZDnT_.js";
import "@headlessui/react";
import "clsx";
import "tailwind-merge";
function formatNumber(num) {
  return new Intl.NumberFormat("en-IN", {
    maximumFractionDigits: 1,
    notation: num >= 1e3 ? "compact" : "standard"
  }).format(num);
}
function formatDate(date) {
  return new Intl.DateTimeFormat("en-IN", { day: "2-digit", month: "short" }).format(new Date(date));
}
function percent(part, total) {
  return total > 0 ? part / total * 100 : 0;
}
function StatCard({
  label,
  value,
  suffix = "",
  trend,
  icon: Icon,
  tone
}) {
  return /* @__PURE__ */ jsx(Card, { children: /* @__PURE__ */ jsxs(CardContent, { className: "p-4", children: [
    /* @__PURE__ */ jsxs("div", { className: "mb-2 flex items-center justify-between", children: [
      /* @__PURE__ */ jsx("div", { className: cn("flex h-8 w-8 items-center justify-center rounded-md", tone), children: /* @__PURE__ */ jsx(Icon, { className: "h-4 w-4" }) }),
      /* @__PURE__ */ jsx("span", { className: "rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-semibold text-waify-green dark:bg-emerald-400/10 dark:text-emerald-200", children: trend })
    ] }),
    /* @__PURE__ */ jsx("div", { className: "text-[11px] text-waify-text-muted dark:text-waify-dark-text-muted", children: label }),
    /* @__PURE__ */ jsxs("div", { className: "mt-0.5 flex items-baseline gap-0.5", children: [
      /* @__PURE__ */ jsx("span", { className: "text-xl font-bold tabular-nums text-waify-text dark:text-waify-dark-text", children: value }),
      suffix && /* @__PURE__ */ jsx("span", { className: "text-sm font-semibold text-waify-text-muted dark:text-waify-dark-text-muted", children: suffix })
    ] })
  ] }) });
}
function Analytics({
  date_range,
  message_trends,
  message_status_distribution,
  template_performance,
  account_growth,
  subscription_distribution,
  peak_hours,
  top_accounts
}) {
  const { auth } = usePage().props;
  const [selectedRange, setSelectedRange] = useState(date_range);
  const metrics = useMemo(() => {
    const totalMessages = message_trends.reduce((sum, row) => sum + row.total, 0);
    const inbound = message_trends.reduce((sum, row) => sum + row.inbound, 0);
    const outbound = message_trends.reduce((sum, row) => sum + row.outbound, 0);
    const sent = template_performance.reduce((sum, row) => sum + row.send_count, 0);
    const delivered = template_performance.reduce((sum, row) => sum + row.delivered, 0);
    const read = template_performance.reduce((sum, row) => sum + row.read_count, 0);
    const statusTotal = Object.values(message_status_distribution).reduce((sum, count) => sum + count, 0);
    return {
      totalMessages,
      inbound,
      outbound,
      deliveryRate: percent(delivered, sent),
      readRate: percent(read, sent),
      replyShare: percent(inbound, totalMessages),
      optOutRate: percent(message_status_distribution.failed || 0, statusTotal)
    };
  }, [message_trends, message_status_distribution, template_performance]);
  const maxTrend = Math.max(1, ...message_trends.map((trend) => trend.total));
  const maxPeak = Math.max(1, ...peak_hours.map((peak) => peak.count));
  const maxGrowth = Math.max(1, ...account_growth.map((growth) => growth.count));
  const handleRangeChange = (range) => {
    setSelectedRange(range);
    router.get(route("platform.analytics"), { range }, { preserveState: true, preserveScroll: true });
  };
  return /* @__PURE__ */ jsxs(PlatformShell, { auth, children: [
    /* @__PURE__ */ jsx(Head, { title: "Analytics" }),
    /* @__PURE__ */ jsxs("div", { className: "mx-auto max-w-[1600px] space-y-5", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex flex-wrap items-end justify-between gap-3", children: [
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("h1", { className: "text-xl font-bold text-waify-text dark:text-waify-dark-text", children: "Analytics" }),
          /* @__PURE__ */ jsx("p", { className: "mt-1 text-sm text-waify-text-muted dark:text-waify-dark-text-muted", children: "Track delivery, engagement, template performance, and workspace activity." })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex flex-wrap items-center gap-2", children: [
          /* @__PURE__ */ jsxs("div", { className: "flex h-9 items-center gap-2 rounded-btn bg-white px-3 text-sm text-waify-text ring-1 ring-inset ring-gray-200 dark:bg-waify-dark-surface dark:text-waify-dark-text dark:ring-waify-dark-border", children: [
            /* @__PURE__ */ jsx(Calendar, { className: "h-4 w-4 text-waify-text-muted dark:text-waify-dark-text-muted" }),
            /* @__PURE__ */ jsxs(
              "select",
              {
                value: selectedRange,
                onChange: (event) => handleRangeChange(event.target.value),
                className: "border-0 bg-transparent p-0 text-sm focus:ring-0 dark:bg-transparent",
                children: [
                  /* @__PURE__ */ jsx("option", { value: "7", children: "Last 7 days" }),
                  /* @__PURE__ */ jsx("option", { value: "30", children: "Last 30 days" }),
                  /* @__PURE__ */ jsx("option", { value: "90", children: "Last 90 days" }),
                  /* @__PURE__ */ jsx("option", { value: "365", children: "Last year" })
                ]
              }
            )
          ] }),
          /* @__PURE__ */ jsxs(Button, { variant: "secondary", onClick: () => window.print(), children: [
            /* @__PURE__ */ jsx(Download, { className: "h-4 w-4" }),
            "Export"
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-2 gap-3 lg:grid-cols-5", children: [
        /* @__PURE__ */ jsx(
          StatCard,
          {
            label: "Delivery rate",
            value: metrics.deliveryRate.toFixed(1),
            suffix: "%",
            trend: `${formatNumber(metrics.outbound)} sent`,
            icon: Send,
            tone: "bg-emerald-50 text-emerald-600 dark:bg-emerald-400/10 dark:text-emerald-200"
          }
        ),
        /* @__PURE__ */ jsx(
          StatCard,
          {
            label: "Read rate",
            value: metrics.readRate.toFixed(1),
            suffix: "%",
            trend: `${formatNumber(metrics.totalMessages)} total`,
            icon: MailOpen,
            tone: "bg-sky-50 text-sky-600 dark:bg-sky-400/10 dark:text-sky-200"
          }
        ),
        /* @__PURE__ */ jsx(
          StatCard,
          {
            label: "Inbound share",
            value: metrics.replyShare.toFixed(1),
            suffix: "%",
            trend: `${formatNumber(metrics.inbound)} inbound`,
            icon: Reply,
            tone: "bg-pink-50 text-pink-600 dark:bg-pink-400/10 dark:text-pink-200"
          }
        ),
        /* @__PURE__ */ jsx(
          StatCard,
          {
            label: "Template reads",
            value: formatNumber(template_performance.reduce((sum, row) => sum + row.read_count, 0)),
            trend: `${template_performance.length} templates`,
            icon: MousePointerClick,
            tone: "bg-violet-50 text-violet-600 dark:bg-violet-400/10 dark:text-violet-200"
          }
        ),
        /* @__PURE__ */ jsx(
          StatCard,
          {
            label: "Failure share",
            value: metrics.optOutRate.toFixed(1),
            suffix: "%",
            trend: "Status based",
            icon: UserMinus,
            tone: "bg-amber-50 text-amber-600 dark:bg-amber-400/10 dark:text-amber-200"
          }
        )
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 gap-4 lg:grid-cols-3", children: [
        /* @__PURE__ */ jsx(Card, { className: "lg:col-span-2", children: /* @__PURE__ */ jsxs(CardContent, { className: "p-5", children: [
          /* @__PURE__ */ jsxs("div", { className: "mb-3 flex items-start justify-between gap-3", children: [
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx("h3", { className: "text-base font-semibold text-waify-text dark:text-waify-dark-text", children: "Message Volume" }),
              /* @__PURE__ */ jsx("p", { className: "text-xs text-waify-text-muted dark:text-waify-dark-text-muted", children: "Inbound and outbound over time" })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3 text-xs", children: [
              /* @__PURE__ */ jsxs("span", { className: "inline-flex items-center gap-1 text-waify-text-muted dark:text-waify-dark-text-muted", children: [
                /* @__PURE__ */ jsx("span", { className: "h-2.5 w-2.5 rounded bg-sky-400" }),
                "Inbound"
              ] }),
              /* @__PURE__ */ jsxs("span", { className: "inline-flex items-center gap-1 text-waify-text-muted dark:text-waify-dark-text-muted", children: [
                /* @__PURE__ */ jsx("span", { className: "h-2.5 w-2.5 rounded bg-waify-green" }),
                "Outbound"
              ] })
            ] })
          ] }),
          message_trends.length === 0 ? /* @__PURE__ */ jsx("div", { className: "py-12 text-center text-sm text-waify-text-muted dark:text-waify-dark-text-muted", children: "No data available for this period." }) : /* @__PURE__ */ jsx("div", { className: "flex h-64 items-end gap-2 overflow-x-auto pb-2", children: message_trends.map((trend) => /* @__PURE__ */ jsxs("div", { className: "flex min-w-10 flex-1 flex-col items-center gap-2", children: [
            /* @__PURE__ */ jsxs("div", { className: "flex h-48 w-full items-end justify-center gap-1", children: [
              /* @__PURE__ */ jsx(
                "div",
                {
                  className: "w-3 rounded-t bg-sky-400",
                  title: `Inbound: ${trend.inbound}`,
                  style: { height: `${Math.max(3, percent(trend.inbound, maxTrend))}%` }
                }
              ),
              /* @__PURE__ */ jsx(
                "div",
                {
                  className: "w-3 rounded-t bg-waify-green",
                  title: `Outbound: ${trend.outbound}`,
                  style: { height: `${Math.max(3, percent(trend.outbound, maxTrend))}%` }
                }
              )
            ] }),
            /* @__PURE__ */ jsx("span", { className: "text-[10px] text-waify-text-muted dark:text-waify-dark-text-muted", children: formatDate(trend.date) })
          ] }, trend.date)) })
        ] }) }),
        /* @__PURE__ */ jsx(Card, { children: /* @__PURE__ */ jsxs(CardContent, { className: "p-5", children: [
          /* @__PURE__ */ jsx("h3", { className: "text-base font-semibold text-waify-text dark:text-waify-dark-text", children: "Top Workspaces" }),
          /* @__PURE__ */ jsx("p", { className: "mb-3 text-xs text-waify-text-muted dark:text-waify-dark-text-muted", children: "By message activity" }),
          top_accounts.length === 0 ? /* @__PURE__ */ jsx("div", { className: "py-12 text-center text-sm text-waify-text-muted dark:text-waify-dark-text-muted", children: "No workspace activity yet." }) : /* @__PURE__ */ jsx("div", { className: "space-y-3", children: top_accounts.slice(0, 6).map((account, index) => /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3", children: [
            /* @__PURE__ */ jsx("div", { className: "flex h-8 w-8 items-center justify-center rounded-full bg-emerald-50 text-sm font-bold text-waify-green dark:bg-emerald-400/10 dark:text-emerald-200", children: index + 1 }),
            /* @__PURE__ */ jsxs("div", { className: "min-w-0 flex-1", children: [
              /* @__PURE__ */ jsx("div", { className: "truncate text-sm font-medium text-waify-text dark:text-waify-dark-text", children: account.name }),
              /* @__PURE__ */ jsx("div", { className: "text-xs text-waify-text-muted dark:text-waify-dark-text-muted", children: account.slug })
            ] }),
            /* @__PURE__ */ jsx("div", { className: "text-right text-sm font-semibold tabular-nums text-waify-text dark:text-waify-dark-text", children: formatNumber(account.message_count) })
          ] }, account.id)) })
        ] }) })
      ] }),
      /* @__PURE__ */ jsx(Card, { children: /* @__PURE__ */ jsxs(CardContent, { className: "p-5", children: [
        /* @__PURE__ */ jsxs("div", { className: "mb-4 flex items-start justify-between gap-3", children: [
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("h3", { className: "text-base font-semibold text-waify-text dark:text-waify-dark-text", children: "Hourly Activity" }),
            /* @__PURE__ */ jsx("p", { className: "text-xs text-waify-text-muted dark:text-waify-dark-text-muted", children: "Message activity by hour of day." })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 text-[11px] text-waify-text-muted dark:text-waify-dark-text-muted", children: [
            /* @__PURE__ */ jsx("span", { children: "Low" }),
            /* @__PURE__ */ jsx("div", { className: "flex", children: [0.15, 0.3, 0.5, 0.7, 0.9].map((opacity) => /* @__PURE__ */ jsx("span", { className: "h-4 w-4 ring-1 ring-white dark:ring-waify-dark-bg", style: { background: `rgba(0, 165, 72, ${opacity})` } }, opacity)) }),
            /* @__PURE__ */ jsx("span", { children: "High" })
          ] })
        ] }),
        peak_hours.length === 0 ? /* @__PURE__ */ jsx("div", { className: "py-10 text-center text-sm text-waify-text-muted dark:text-waify-dark-text-muted", children: "No hourly data available." }) : /* @__PURE__ */ jsx("div", { className: "grid grid-cols-12 gap-1 sm:grid-cols-24", children: peak_hours.map((peak) => {
          const intensity = 0.12 + percent(peak.count, maxPeak) / 115;
          return /* @__PURE__ */ jsxs("div", { className: "group", children: [
            /* @__PURE__ */ jsx(
              "div",
              {
                className: "aspect-square rounded heat-cell",
                title: `${peak.hour}:00 · ${peak.count} messages`,
                style: { background: `rgba(0, 165, 72, ${intensity})` }
              }
            ),
            /* @__PURE__ */ jsx("div", { className: "mt-1 text-center text-[9px] text-waify-text-muted dark:text-waify-dark-text-muted", children: peak.hour % 3 === 0 ? `${peak.hour}h` : "" })
          ] }, peak.hour);
        }) }),
        /* @__PURE__ */ jsxs("div", { className: "mt-4 flex flex-wrap items-center gap-x-6 gap-y-2 border-t border-gray-100 pt-4 text-xs text-waify-text-muted dark:border-waify-dark-border dark:text-waify-dark-text-muted", children: [
          /* @__PURE__ */ jsxs("span", { className: "flex items-center gap-1.5", children: [
            /* @__PURE__ */ jsx(TrendingUp, { className: "h-3 w-3 text-waify-green dark:text-emerald-300" }),
            "Peak count: ",
            /* @__PURE__ */ jsx("span", { className: "font-semibold text-waify-text dark:text-waify-dark-text", children: formatNumber(maxPeak) })
          ] }),
          /* @__PURE__ */ jsxs("span", { className: "flex items-center gap-1.5", children: [
            /* @__PURE__ */ jsx(Clock, { className: "h-3 w-3" }),
            "Range: ",
            /* @__PURE__ */ jsxs("span", { className: "font-semibold text-waify-text dark:text-waify-dark-text", children: [
              selectedRange,
              " days"
            ] })
          ] })
        ] })
      ] }) }),
      /* @__PURE__ */ jsxs("div", { className: "grid gap-4 lg:grid-cols-2", children: [
        /* @__PURE__ */ jsx(Card, { children: /* @__PURE__ */ jsxs(CardContent, { className: "p-5", children: [
          /* @__PURE__ */ jsx("h3", { className: "text-base font-semibold text-waify-text dark:text-waify-dark-text", children: "Message Status" }),
          /* @__PURE__ */ jsx("p", { className: "mb-4 text-xs text-waify-text-muted dark:text-waify-dark-text-muted", children: "Distribution by delivery state." }),
          Object.keys(message_status_distribution).length === 0 ? /* @__PURE__ */ jsx("div", { className: "py-10 text-center text-sm text-waify-text-muted dark:text-waify-dark-text-muted", children: "No status data available." }) : /* @__PURE__ */ jsx("div", { className: "space-y-3", children: Object.entries(message_status_distribution).map(([status, count]) => {
            const total = Object.values(message_status_distribution).reduce((sum, value2) => sum + value2, 0);
            const value = percent(count, total);
            return /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsxs("div", { className: "mb-1 flex items-center justify-between", children: [
                /* @__PURE__ */ jsx("span", { className: "text-sm font-medium capitalize text-waify-text dark:text-waify-dark-text", children: status }),
                /* @__PURE__ */ jsxs("span", { className: "text-sm tabular-nums text-waify-text-muted dark:text-waify-dark-text-muted", children: [
                  formatNumber(count),
                  " (",
                  value.toFixed(1),
                  "%)"
                ] })
              ] }),
              /* @__PURE__ */ jsx("div", { className: "h-2 rounded-full bg-gray-100 dark:bg-waify-dark-surface-2", children: /* @__PURE__ */ jsx("div", { className: "h-2 rounded-full bg-waify-green", style: { width: `${value}%` } }) })
            ] }, status);
          }) })
        ] }) }),
        /* @__PURE__ */ jsx(Card, { children: /* @__PURE__ */ jsxs(CardContent, { className: "p-5", children: [
          /* @__PURE__ */ jsx("h3", { className: "text-base font-semibold text-waify-text dark:text-waify-dark-text", children: "Workspace Growth" }),
          /* @__PURE__ */ jsx("p", { className: "mb-4 text-xs text-waify-text-muted dark:text-waify-dark-text-muted", children: "New workspace count by date." }),
          account_growth.length === 0 ? /* @__PURE__ */ jsx("div", { className: "py-10 text-center text-sm text-waify-text-muted dark:text-waify-dark-text-muted", children: "No growth data available." }) : /* @__PURE__ */ jsx("div", { className: "flex h-40 items-end gap-2", children: account_growth.map((row) => /* @__PURE__ */ jsxs("div", { className: "flex min-w-6 flex-1 flex-col items-center gap-2", children: [
            /* @__PURE__ */ jsx(
              "div",
              {
                className: "w-full rounded-t bg-sky-400 dark:bg-sky-300",
                title: `${formatDate(row.date)} · ${row.count}`,
                style: { height: `${Math.max(4, percent(row.count, maxGrowth))}%` }
              }
            ),
            /* @__PURE__ */ jsx("span", { className: "text-[10px] text-waify-text-muted dark:text-waify-dark-text-muted", children: formatDate(row.date) })
          ] }, row.date)) })
        ] }) })
      ] }),
      /* @__PURE__ */ jsxs(Card, { className: "overflow-hidden", children: [
        /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between border-b border-gray-100 px-5 py-4 dark:border-waify-dark-border", children: [
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("h3", { className: "text-base font-semibold text-waify-text dark:text-waify-dark-text", children: "Template Performance" }),
            /* @__PURE__ */ jsx("p", { className: "text-xs text-waify-text-muted dark:text-waify-dark-text-muted", children: "Delivery and read rates from real template counters." })
          ] }),
          /* @__PURE__ */ jsx(BarChart3, { className: "h-5 w-5 text-waify-green dark:text-emerald-300" })
        ] }),
        template_performance.length === 0 ? /* @__PURE__ */ jsx(CardContent, { className: "py-12 text-center text-sm text-waify-text-muted dark:text-waify-dark-text-muted", children: "No template data available." }) : /* @__PURE__ */ jsx("div", { className: "overflow-x-auto", children: /* @__PURE__ */ jsxs("table", { className: "w-full text-sm", children: [
          /* @__PURE__ */ jsx("thead", { children: /* @__PURE__ */ jsxs("tr", { className: "bg-gray-50/60 text-left text-[11px] uppercase tracking-wider text-waify-text-muted dark:bg-waify-dark-surface-2/40 dark:text-waify-dark-text-muted", children: [
            /* @__PURE__ */ jsx("th", { className: "px-5 py-3 font-medium", children: "Template" }),
            /* @__PURE__ */ jsx("th", { className: "px-5 py-3 font-medium", children: "Status" }),
            /* @__PURE__ */ jsx("th", { className: "px-5 py-3 font-medium text-right", children: "Sent" }),
            /* @__PURE__ */ jsx("th", { className: "px-5 py-3 font-medium text-right", children: "Delivered" }),
            /* @__PURE__ */ jsx("th", { className: "px-5 py-3 font-medium text-right", children: "Read" }),
            /* @__PURE__ */ jsx("th", { className: "px-5 py-3 font-medium", children: "Delivery" })
          ] }) }),
          /* @__PURE__ */ jsx("tbody", { className: "divide-y divide-gray-100 dark:divide-waify-dark-border", children: template_performance.map((template, index) => {
            const deliveryRate = percent(template.delivered, template.send_count);
            return /* @__PURE__ */ jsxs("tr", { className: "hover:bg-gray-50/60 dark:hover:bg-waify-dark-surface-2/40", children: [
              /* @__PURE__ */ jsx("td", { className: "px-5 py-3", children: /* @__PURE__ */ jsx("div", { className: "font-medium text-waify-text dark:text-waify-dark-text", children: template.name }) }),
              /* @__PURE__ */ jsx("td", { className: "px-5 py-3", children: /* @__PURE__ */ jsx(Badge, { variant: template.status === "APPROVED" ? "success" : "warning", children: template.status }) }),
              /* @__PURE__ */ jsx("td", { className: "px-5 py-3 text-right tabular-nums text-waify-text dark:text-waify-dark-text", children: formatNumber(template.send_count) }),
              /* @__PURE__ */ jsx("td", { className: "px-5 py-3 text-right tabular-nums text-waify-text dark:text-waify-dark-text", children: formatNumber(template.delivered) }),
              /* @__PURE__ */ jsx("td", { className: "px-5 py-3 text-right tabular-nums text-waify-text dark:text-waify-dark-text", children: formatNumber(template.read_count) }),
              /* @__PURE__ */ jsx("td", { className: "px-5 py-3", children: /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
                /* @__PURE__ */ jsx("div", { className: "h-2 w-24 rounded-full bg-gray-100 dark:bg-waify-dark-surface-2", children: /* @__PURE__ */ jsx("div", { className: "h-2 rounded-full bg-waify-green", style: { width: `${deliveryRate}%` } }) }),
                /* @__PURE__ */ jsxs("span", { className: "text-xs tabular-nums text-waify-text-muted dark:text-waify-dark-text-muted", children: [
                  deliveryRate.toFixed(1),
                  "%"
                ] })
              ] }) })
            ] }, `${template.name}-${index}`);
          }) })
        ] }) })
      ] }),
      Object.keys(subscription_distribution).length > 0 && /* @__PURE__ */ jsx(Card, { children: /* @__PURE__ */ jsxs(CardContent, { className: "p-5", children: [
        /* @__PURE__ */ jsx("h3", { className: "text-base font-semibold text-waify-text dark:text-waify-dark-text", children: "Subscription Distribution" }),
        /* @__PURE__ */ jsx("p", { className: "mb-4 text-xs text-waify-text-muted dark:text-waify-dark-text-muted", children: "Current plan spread across workspaces." }),
        /* @__PURE__ */ jsx("div", { className: "space-y-3", children: Object.entries(subscription_distribution).map(([plan, count]) => {
          const total = Object.values(subscription_distribution).reduce((sum, value2) => sum + value2, 0);
          const value = percent(count, total);
          return /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-4", children: [
            /* @__PURE__ */ jsx("span", { className: "w-32 truncate text-sm text-waify-text dark:text-waify-dark-text", children: plan }),
            /* @__PURE__ */ jsx("div", { className: "flex-1", children: /* @__PURE__ */ jsx("div", { className: "h-2 rounded-full bg-gray-100 dark:bg-waify-dark-surface-2", children: /* @__PURE__ */ jsx("div", { className: "h-2 rounded-full bg-waify-green", style: { width: `${value}%` } }) }) }),
            /* @__PURE__ */ jsx("span", { className: "w-16 text-right text-sm tabular-nums text-waify-text-muted dark:text-waify-dark-text-muted", children: count })
          ] }, plan);
        }) })
      ] }) })
    ] })
  ] });
}
export {
  Analytics as default
};
