import { jsxs, jsx } from "react/jsx-runtime";
import { Head, router } from "@inertiajs/react";
import { useState } from "react";
import { A as AppShell } from "./AppShell-Dx9mYfem.js";
import { C as Card, b as CardHeader, c as CardTitle, a as CardContent, d as CardDescription } from "./Card-DLPTnTfC.js";
import { B as Badge } from "./Badge-CHx1ViYT.js";
import { MessageSquare, FileText, Users, TrendingUp } from "lucide-react";
import "./utils-B2ZNUmII.js";
import "clsx";
import "tailwind-merge";
import "./RealtimeProvider-Dletx5Ny.js";
import "laravel-echo";
import "pusher-js";
import "./GlobalFlashHandler-CNoF0uzm.js";
import "./useToast-DNfJQ6ZA.js";
import "./BrandingWrapper-B2Mh0bYb.js";
import "./Button-ymbdH_NY.js";
import "./Alert-DWa0cnrh.js";
import "./CookieConsentBanner-BJ5KL4CC.js";
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
  const formatNumber = (num) => {
    if (num >= 1e6) return (num / 1e6).toFixed(1) + "M";
    if (num >= 1e3) return (num / 1e3).toFixed(1) + "K";
    return num.toString();
  };
  const getUsagePercentage = (current, limit) => {
    if (limit === -1) return 0;
    if (limit === 0) return 100;
    return Math.min(current / limit * 100, 100);
  };
  return /* @__PURE__ */ jsxs(AppShell, { children: [
    /* @__PURE__ */ jsx(Head, { title: "Analytics" }),
    /* @__PURE__ */ jsxs("div", { className: "space-y-6", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between", children: [
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("h1", { className: "text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-gray-100 dark:to-gray-300 bg-clip-text text-transparent", children: "Analytics" }),
          /* @__PURE__ */ jsx("p", { className: "mt-1 text-sm text-gray-600 dark:text-gray-400", children: "Insights into your WhatsApp messaging activity" })
        ] }),
        /* @__PURE__ */ jsx("div", { className: "flex items-center gap-2", children: /* @__PURE__ */ jsxs(
          "select",
          {
            value: selectedRange,
            onChange: (e) => handleRangeChange(e.target.value),
            className: "px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500",
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
                className: "bg-blue-600 h-2 rounded-full transition-all",
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
            /* @__PURE__ */ jsx(Users, { className: "h-8 w-8 text-blue-500" })
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
              /* @__PURE__ */ jsx("p", { className: "text-2xl font-bold", children: formatNumber(message_trends.reduce((sum, t) => sum + t.total, 0)) })
            ] }),
            /* @__PURE__ */ jsx(MessageSquare, { className: "h-8 w-8 text-green-500" })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "mt-4 flex gap-2 text-xs", children: [
            /* @__PURE__ */ jsxs(Badge, { variant: "info", children: [
              formatNumber(message_trends.reduce((sum, t) => sum + t.inbound, 0)),
              " Inbound"
            ] }),
            /* @__PURE__ */ jsxs(Badge, { variant: "default", children: [
              formatNumber(message_trends.reduce((sum, t) => sum + t.outbound, 0)),
              " Outbound"
            ] })
          ] })
        ] }) }),
        /* @__PURE__ */ jsx(Card, { children: /* @__PURE__ */ jsx(CardContent, { className: "pt-6", children: /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between", children: [
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("p", { className: "text-sm text-gray-600 dark:text-gray-400", children: "Avg Daily Messages" }),
            /* @__PURE__ */ jsx("p", { className: "text-2xl font-bold", children: formatNumber(Math.round(message_trends.reduce((sum, t) => sum + t.total, 0) / Math.max(message_trends.length, 1))) })
          ] }),
          /* @__PURE__ */ jsx(TrendingUp, { className: "h-8 w-8 text-purple-500" })
        ] }) }) }),
        /* @__PURE__ */ jsx(Card, { children: /* @__PURE__ */ jsx(CardContent, { className: "pt-6", children: /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between", children: [
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("p", { className: "text-sm text-gray-600 dark:text-gray-400", children: "Top Templates" }),
            /* @__PURE__ */ jsx("p", { className: "text-2xl font-bold", children: template_performance.length })
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
          const maxValue = Math.max(...message_trends.map((t) => Math.max(t.inbound, t.outbound, 1)));
          return /* @__PURE__ */ jsxs("div", { className: "flex-1 flex flex-col items-center gap-1", children: [
            /* @__PURE__ */ jsxs("div", { className: "w-full flex flex-col-reverse gap-0.5 h-48", children: [
              /* @__PURE__ */ jsx(
                "div",
                {
                  className: "bg-blue-500 rounded-t",
                  style: { height: `${trend.outbound / maxValue * 100}%` },
                  title: `Outbound: ${trend.outbound}`
                }
              ),
              /* @__PURE__ */ jsx(
                "div",
                {
                  className: "bg-green-500 rounded-t",
                  style: { height: `${trend.inbound / maxValue * 100}%` },
                  title: `Inbound: ${trend.inbound}`
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
              template.delivery_rate.toFixed(1),
              "% Delivery"
            ] }),
            /* @__PURE__ */ jsxs("p", { className: "text-xs text-gray-500 dark:text-gray-400 mt-1", children: [
              template.read_rate.toFixed(1),
              "% Read Rate"
            ] })
          ] })
        ] }, template.template_id)) }) })
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
                className: "w-full bg-gradient-to-t from-blue-500 to-blue-400 rounded-t",
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
