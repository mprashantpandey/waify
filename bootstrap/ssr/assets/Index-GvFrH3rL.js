import { jsxs, jsx } from "react/jsx-runtime";
import { Head, router } from "@inertiajs/react";
import { useState } from "react";
import { A as AppShell } from "./AppShell-BMIA1AnI.js";
import { C as Card, b as CardHeader, c as CardTitle, a as CardContent, d as CardDescription } from "./Card-BtIXZ0GS.js";
import { B as Badge } from "./Badge-C65MHc2S.js";
import { MessageSquare, FileText, Users, TrendingUp } from "lucide-react";
import "./utils-B2ZNUmII.js";
import "clsx";
import "tailwind-merge";
import "./BrandLogo-TeztHB0m.js";
import "axios";
import "./Elements-EbyZDnT_.js";
import "@headlessui/react";
import "./Button-BJftGNki.js";
import "./BrandingWrapper-DdVUILzh.js";
import "./useToast-BN7qsQL3.js";
import "./CookieConsentBanner-X10ew4Dy.js";
import "./RealtimeProvider-D1qLzQY9.js";
import "laravel-echo";
import "pusher-js";
const toNumber = (value) => {
  const numeric = Number(value);
  return Number.isFinite(numeric) ? numeric : 0;
};
const clampRate = (value) => {
  const numeric = toNumber(value);
  return Math.max(0, Math.min(100, numeric));
};
function AnalyticsIndex({
  account,
  date_range,
  message_trends,
  message_status_distribution,
  template_performance,
  conversation_stats,
  peak_hours,
  daily_activity,
  usage
}) {
  const [selectedRange, setSelectedRange] = useState(date_range);
  const handleRangeChange = (range) => {
    setSelectedRange(range);
    router.get(route("app.analytics.index", {}), { range }, {
      preserveState: true,
      preserveScroll: true
    });
  };
  const formatNumber = (value) => {
    const num = toNumber(value);
    if (num >= 1e6) return `${(num / 1e6).toFixed(1)}M`;
    if (num >= 1e3) return `${(num / 1e3).toFixed(1)}K`;
    return num.toLocaleString("en-IN");
  };
  const messageTotals = message_trends.reduce(
    (totals, trend) => ({
      total: totals.total + toNumber(trend.total),
      inbound: totals.inbound + toNumber(trend.inbound),
      outbound: totals.outbound + toNumber(trend.outbound)
    }),
    { total: 0, inbound: 0, outbound: 0 }
  );
  const averageDailyMessages = Math.round(messageTotals.total / Math.max(message_trends.length, 1));
  const getUsagePercentage = (current, limit) => {
    if (limit === -1) return 0;
    if (limit === 0) return 100;
    return Math.min(current / limit * 100, 100);
  };
  return /* @__PURE__ */ jsxs(AppShell, { children: [
    /* @__PURE__ */ jsx(Head, { title: "Analytics" }),
    /* @__PURE__ */ jsxs("div", { className: "module-page", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between", children: [
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("p", { className: "text-xs font-semibold uppercase tracking-[0.22em] text-waify-green-dark", children: "Insights" }),
          /* @__PURE__ */ jsx("h1", { className: "module-heading", children: "Analytics" }),
          /* @__PURE__ */ jsx("p", { className: "module-subheading", children: "Track conversations, templates, usage, and messaging performance." })
        ] }),
        /* @__PURE__ */ jsx("div", { className: "flex items-center gap-2", children: /* @__PURE__ */ jsxs(
          "select",
          {
            value: selectedRange,
            onChange: (e) => handleRangeChange(e.target.value),
            className: "rounded-btn border border-gray-200 bg-white px-3 py-2 text-sm shadow-sm focus:border-waify-green focus:outline-none focus:ring-2 focus:ring-waify-green/20 dark:border-gray-600 dark:bg-gray-800",
            children: [
              /* @__PURE__ */ jsx("option", { value: "7", children: "Last 7 days" }),
              /* @__PURE__ */ jsx("option", { value: "30", children: "Last 30 days" }),
              /* @__PURE__ */ jsx("option", { value: "90", children: "Last 90 days" }),
              /* @__PURE__ */ jsx("option", { value: "365", children: "Last year" })
            ]
          }
        ) })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4", children: [
        /* @__PURE__ */ jsxs(Card, { children: [
          /* @__PURE__ */ jsx(CardHeader, { children: /* @__PURE__ */ jsxs(CardTitle, { className: "flex items-center gap-2", children: [
            /* @__PURE__ */ jsx(MessageSquare, { className: "h-5 w-5" }),
            "Messages Usage"
          ] }) }),
          /* @__PURE__ */ jsx(CardContent, { children: /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
            /* @__PURE__ */ jsxs("div", { className: "flex justify-between text-sm", children: [
              /* @__PURE__ */ jsx("span", { className: "text-gray-600 dark:text-gray-400", children: "Sent" }),
              /* @__PURE__ */ jsxs("span", { className: "font-semibold", children: [
                formatNumber(usage.messages_sent),
                " / ",
                usage.messages_limit === -1 ? "∞" : formatNumber(usage.messages_limit)
              ] })
            ] }),
            usage.messages_limit !== -1 && /* @__PURE__ */ jsx("div", { className: "w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2", children: /* @__PURE__ */ jsx(
              "div",
              {
                className: "h-2 rounded-full bg-waify-green transition-all",
                style: { width: `${getUsagePercentage(usage.messages_sent, usage.messages_limit)}%` }
              }
            ) })
          ] }) })
        ] }),
        /* @__PURE__ */ jsxs(Card, { children: [
          /* @__PURE__ */ jsx(CardHeader, { children: /* @__PURE__ */ jsxs(CardTitle, { className: "flex items-center gap-2", children: [
            /* @__PURE__ */ jsx(FileText, { className: "h-5 w-5" }),
            "Template Sends"
          ] }) }),
          /* @__PURE__ */ jsx(CardContent, { children: /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
            /* @__PURE__ */ jsxs("div", { className: "flex justify-between text-sm", children: [
              /* @__PURE__ */ jsx("span", { className: "text-gray-600 dark:text-gray-400", children: "Sent" }),
              /* @__PURE__ */ jsxs("span", { className: "font-semibold", children: [
                formatNumber(usage.template_sends),
                " / ",
                usage.template_sends_limit === -1 ? "∞" : formatNumber(usage.template_sends_limit)
              ] })
            ] }),
            usage.template_sends_limit !== -1 && /* @__PURE__ */ jsx("div", { className: "w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2", children: /* @__PURE__ */ jsx(
              "div",
              {
                className: "bg-green-600 h-2 rounded-full transition-all",
                style: { width: `${getUsagePercentage(usage.template_sends, usage.template_sends_limit)}%` }
              }
            ) })
          ] }) })
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 md:grid-cols-4 gap-4", children: [
        /* @__PURE__ */ jsx(Card, { children: /* @__PURE__ */ jsxs(CardContent, { className: "pt-6", children: [
          /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between", children: [
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx("p", { className: "text-sm text-gray-600 dark:text-gray-400", children: "Total Conversations" }),
              /* @__PURE__ */ jsx("p", { className: "text-2xl font-bold", children: conversation_stats.total })
            ] }),
            /* @__PURE__ */ jsx(Users, { className: "h-8 w-8 text-waify-green-dark" })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "mt-4 flex gap-2 text-xs", children: [
            /* @__PURE__ */ jsxs(Badge, { variant: "success", children: [
              conversation_stats.open,
              " Open"
            ] }),
            /* @__PURE__ */ jsxs(Badge, { variant: "default", children: [
              conversation_stats.closed,
              " Closed"
            ] })
          ] })
        ] }) }),
        /* @__PURE__ */ jsx(Card, { children: /* @__PURE__ */ jsxs(CardContent, { className: "pt-6", children: [
          /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between", children: [
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx("p", { className: "text-sm text-gray-600 dark:text-gray-400", children: "Total Messages" }),
              /* @__PURE__ */ jsx("p", { className: "text-2xl font-bold", children: formatNumber(messageTotals.total) })
            ] }),
            /* @__PURE__ */ jsx(MessageSquare, { className: "h-8 w-8 text-green-500" })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "mt-4 grid grid-cols-2 gap-2 text-xs", children: [
            /* @__PURE__ */ jsxs("div", { className: "rounded-lg bg-blue-50 px-2.5 py-2 text-blue-700 ring-1 ring-blue-100 dark:bg-blue-500/10 dark:text-blue-200 dark:ring-blue-500/20", children: [
              /* @__PURE__ */ jsx("span", { className: "block text-[10px] font-medium uppercase tracking-wide opacity-75", children: "Inbound" }),
              /* @__PURE__ */ jsx("span", { className: "mt-0.5 block font-semibold tabular-nums", children: formatNumber(messageTotals.inbound) })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "rounded-lg bg-slate-100 px-2.5 py-2 text-slate-700 ring-1 ring-slate-200 dark:bg-slate-800 dark:text-slate-200 dark:ring-slate-700", children: [
              /* @__PURE__ */ jsx("span", { className: "block text-[10px] font-medium uppercase tracking-wide opacity-75", children: "Outbound" }),
              /* @__PURE__ */ jsx("span", { className: "mt-0.5 block font-semibold tabular-nums", children: formatNumber(messageTotals.outbound) })
            ] })
          ] })
        ] }) }),
        /* @__PURE__ */ jsx(Card, { children: /* @__PURE__ */ jsx(CardContent, { className: "pt-6", children: /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between", children: [
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("p", { className: "text-sm text-gray-600 dark:text-gray-400", children: "Avg Daily Messages" }),
            /* @__PURE__ */ jsx("p", { className: "text-2xl font-bold", children: formatNumber(averageDailyMessages) })
          ] }),
          /* @__PURE__ */ jsx(TrendingUp, { className: "h-8 w-8 text-purple-500" })
        ] }) }) }),
        /* @__PURE__ */ jsx(Card, { children: /* @__PURE__ */ jsx(CardContent, { className: "pt-6", children: /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between", children: [
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("p", { className: "text-sm text-gray-600 dark:text-gray-400", children: "Template Activity" }),
            /* @__PURE__ */ jsx("p", { className: "text-2xl font-bold", children: template_performance.length > 0 ? template_performance.length : "No sends" })
          ] }),
          /* @__PURE__ */ jsx(FileText, { className: "h-8 w-8 text-orange-500" })
        ] }) }) })
      ] }),
      /* @__PURE__ */ jsxs(Card, { children: [
        /* @__PURE__ */ jsxs(CardHeader, { children: [
          /* @__PURE__ */ jsx(CardTitle, { children: "Message Trends" }),
          /* @__PURE__ */ jsx(CardDescription, { children: "Inbound vs Outbound messages over time" })
        ] }),
        /* @__PURE__ */ jsx(CardContent, { children: /* @__PURE__ */ jsx("div", { className: "h-64 flex items-end justify-between gap-1", children: message_trends.length > 0 ? message_trends.map((trend, index) => {
          const inbound = toNumber(trend.inbound);
          const outbound = toNumber(trend.outbound);
          const maxValue = Math.max(...message_trends.map((t) => Math.max(toNumber(t.inbound), toNumber(t.outbound), 1)));
          return /* @__PURE__ */ jsxs("div", { className: "flex-1 flex flex-col items-center gap-1", children: [
            /* @__PURE__ */ jsxs("div", { className: "w-full flex flex-col-reverse gap-0.5 h-48", children: [
              /* @__PURE__ */ jsx(
                "div",
                {
                  className: "rounded-t bg-waify-green-dark",
                  style: { height: `${outbound / maxValue * 100}%` },
                  title: `Outbound: ${outbound}`
                }
              ),
              /* @__PURE__ */ jsx(
                "div",
                {
                  className: "bg-green-500 rounded-t",
                  style: { height: `${inbound / maxValue * 100}%` },
                  title: `Inbound: ${inbound}`
                }
              )
            ] }),
            /* @__PURE__ */ jsx("span", { className: "text-xs text-gray-500 dark:text-gray-400", children: new Date(trend.date).toLocaleDateString("en-US", { month: "short", day: "numeric" }) })
          ] }, index);
        }) : /* @__PURE__ */ jsx("div", { className: "w-full text-center text-gray-500 dark:text-gray-400 py-16", children: "No message data available for this period" }) }) })
      ] }),
      template_performance.length > 0 && /* @__PURE__ */ jsxs(Card, { children: [
        /* @__PURE__ */ jsxs(CardHeader, { children: [
          /* @__PURE__ */ jsx(CardTitle, { children: "Top Performing Templates" }),
          /* @__PURE__ */ jsx(CardDescription, { children: "Template send performance metrics" })
        ] }),
        /* @__PURE__ */ jsx(CardContent, { children: /* @__PURE__ */ jsx("div", { className: "space-y-4", children: template_performance.map((template) => /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between p-4 border rounded-lg", children: [
          /* @__PURE__ */ jsxs("div", { className: "flex-1", children: [
            /* @__PURE__ */ jsx("p", { className: "font-semibold", children: template.template_name }),
            /* @__PURE__ */ jsxs("div", { className: "flex gap-4 mt-2 text-sm text-gray-600 dark:text-gray-400", children: [
              /* @__PURE__ */ jsxs("span", { children: [
                "Sent: ",
                template.total_sends
              ] }),
              /* @__PURE__ */ jsxs("span", { children: [
                "Delivered: ",
                template.delivered
              ] }),
              /* @__PURE__ */ jsxs("span", { children: [
                "Read: ",
                template.read
              ] })
            ] })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "text-right", children: [
            /* @__PURE__ */ jsxs(Badge, { variant: "success", children: [
              clampRate(template.delivery_rate).toFixed(1),
              "% Delivery"
            ] }),
            /* @__PURE__ */ jsxs("p", { className: "text-xs text-gray-500 dark:text-gray-400 mt-1", children: [
              clampRate(template.read_rate).toFixed(1),
              "% Read Rate"
            ] })
          ] })
        ] }, template.template_id)) }) })
      ] }),
      template_performance.length === 0 && /* @__PURE__ */ jsxs(Card, { children: [
        /* @__PURE__ */ jsxs(CardHeader, { children: [
          /* @__PURE__ */ jsx(CardTitle, { children: "Template Performance" }),
          /* @__PURE__ */ jsx(CardDescription, { children: "Delivery and read rates will appear after approved templates are sent." })
        ] }),
        /* @__PURE__ */ jsx(CardContent, { children: /* @__PURE__ */ jsx("div", { className: "rounded-lg border border-dashed border-gray-200 px-4 py-10 text-center text-sm text-gray-500 dark:border-gray-700 dark:text-gray-400", children: "No template sends in this period. Try a wider date range or send a campaign with an approved template." }) })
      ] }),
      peak_hours.length > 0 && /* @__PURE__ */ jsxs(Card, { children: [
        /* @__PURE__ */ jsxs(CardHeader, { children: [
          /* @__PURE__ */ jsx(CardTitle, { children: "Peak Activity Hours" }),
          /* @__PURE__ */ jsx(CardDescription, { children: "Most active hours of the day" })
        ] }),
        /* @__PURE__ */ jsx(CardContent, { children: /* @__PURE__ */ jsx("div", { className: "h-48 flex items-end justify-between gap-1", children: Array.from({ length: 24 }, (_, hour) => {
          const hourData = peak_hours.find((h) => h.hour === hour);
          const maxCount = Math.max(...peak_hours.map((h) => h.count), 1);
          return /* @__PURE__ */ jsxs("div", { className: "flex-1 flex flex-col items-center gap-1", children: [
            /* @__PURE__ */ jsx(
              "div",
              {
                className: "w-full rounded-t bg-waify-green",
                style: { height: `${(hourData?.count || 0) / maxCount * 100}%` },
                title: `${hour}:00 - ${hourData?.count || 0} messages`
              }
            ),
            /* @__PURE__ */ jsxs("span", { className: "text-xs text-gray-500 dark:text-gray-400", children: [
              hour % 12 || 12,
              hour >= 12 ? "p" : "a"
            ] })
          ] }, hour);
        }) }) })
      ] })
    ] })
  ] });
}
export {
  AnalyticsIndex as default
};
