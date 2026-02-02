import { jsxs, jsx } from "react/jsx-runtime";
import { usePage, Head, router } from "@inertiajs/react";
import { P as PlatformShell } from "./PlatformShell-DKXjXK7A.js";
import { C as Card, a as CardHeader, b as CardTitle, d as CardDescription, c as CardContent } from "./Card-8uw03vLH.js";
import { B as Badge } from "./RealtimeProvider-DfTOxbgl.js";
import { L as Label } from "./Label-CbZtQFYj.js";
import { MessageSquare } from "lucide-react";
import { useState } from "react";
import "./BrandingWrapper-B2Mh0bYb.js";
import "./GlobalFlashHandler-DdgICiVx.js";
import "./useToast-DNfJQ6ZA.js";
import "./Button-BocaoVWt.js";
import "./utils-H80jjgLf.js";
import "clsx";
import "tailwind-merge";
import "axios";
import "laravel-echo";
import "pusher-js";
function Analytics({
  date_range,
  message_trends,
  message_status_distribution,
  template_performance,
  workspace_growth,
  subscription_distribution,
  peak_hours,
  top_workspaces
}) {
  const { auth } = usePage().props;
  const [selectedRange, setSelectedRange] = useState(date_range);
  const handleRangeChange = (range) => {
    setSelectedRange(range);
    router.get(route("platform.analytics"), { range }, {
      preserveState: true,
      preserveScroll: true
    });
  };
  const formatNumber = (num) => {
    if (num >= 1e6) return (num / 1e6).toFixed(1) + "M";
    if (num >= 1e3) return (num / 1e3).toFixed(1) + "K";
    return num.toString();
  };
  const getMaxValue = (data) => {
    if (data.length === 0) return 100;
    return Math.max(...data.map((d) => d.count || d.total || 0));
  };
  return /* @__PURE__ */ jsxs(PlatformShell, { auth, children: [
    /* @__PURE__ */ jsx(Head, { title: "Analytics" }),
    /* @__PURE__ */ jsxs("div", { className: "space-y-6", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between", children: [
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("h1", { className: "text-2xl font-bold text-gray-900 dark:text-gray-100", children: "Analytics & Reports" }),
          /* @__PURE__ */ jsx("p", { className: "mt-1 text-sm text-gray-500 dark:text-gray-400", children: "Comprehensive analytics and insights for your platform" })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
          /* @__PURE__ */ jsx(Label, { htmlFor: "date-range", className: "text-sm", children: "Date Range:" }),
          /* @__PURE__ */ jsxs(
            "select",
            {
              id: "date-range",
              value: selectedRange,
              onChange: (e) => handleRangeChange(e.target.value),
              className: "rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100",
              children: [
                /* @__PURE__ */ jsx("option", { value: "7", children: "Last 7 days" }),
                /* @__PURE__ */ jsx("option", { value: "30", children: "Last 30 days" }),
                /* @__PURE__ */ jsx("option", { value: "90", children: "Last 90 days" }),
                /* @__PURE__ */ jsx("option", { value: "365", children: "Last year" })
              ]
            }
          )
        ] })
      ] }),
      /* @__PURE__ */ jsxs(Card, { children: [
        /* @__PURE__ */ jsxs(CardHeader, { children: [
          /* @__PURE__ */ jsx(CardTitle, { children: "Message Trends" }),
          /* @__PURE__ */ jsx(CardDescription, { children: "Message volume over time (inbound vs outbound)" })
        ] }),
        /* @__PURE__ */ jsx(CardContent, { children: message_trends.length === 0 ? /* @__PURE__ */ jsx("p", { className: "text-gray-500 dark:text-gray-400 text-center py-8", children: "No data available for selected period" }) : /* @__PURE__ */ jsxs("div", { className: "space-y-4", children: [
          /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-4 mb-4", children: [
            /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
              /* @__PURE__ */ jsx("div", { className: "w-3 h-3 bg-blue-500 rounded" }),
              /* @__PURE__ */ jsx("span", { className: "text-sm text-gray-600 dark:text-gray-400", children: "Inbound" })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
              /* @__PURE__ */ jsx("div", { className: "w-3 h-3 bg-green-500 rounded" }),
              /* @__PURE__ */ jsx("span", { className: "text-sm text-gray-600 dark:text-gray-400", children: "Outbound" })
            ] })
          ] }),
          /* @__PURE__ */ jsx("div", { className: "space-y-2", children: message_trends.map((trend) => {
            const maxValue = getMaxValue(message_trends);
            const inboundPercent = trend.inbound / maxValue * 100;
            const outboundPercent = trend.outbound / maxValue * 100;
            return /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-4", children: [
              /* @__PURE__ */ jsx("div", { className: "w-24 text-xs text-gray-600 dark:text-gray-400", children: new Date(trend.date).toLocaleDateString("en-US", { month: "short", day: "numeric" }) }),
              /* @__PURE__ */ jsxs("div", { className: "flex-1 flex items-end gap-1 h-8", children: [
                /* @__PURE__ */ jsx(
                  "div",
                  {
                    className: "bg-blue-500 rounded-t",
                    style: { height: `${inboundPercent}%`, width: "48%" },
                    title: `Inbound: ${trend.inbound}`
                  }
                ),
                /* @__PURE__ */ jsx(
                  "div",
                  {
                    className: "bg-green-500 rounded-t",
                    style: { height: `${outboundPercent}%`, width: "48%" },
                    title: `Outbound: ${trend.outbound}`
                  }
                )
              ] }),
              /* @__PURE__ */ jsx("div", { className: "w-20 text-right text-xs font-medium text-gray-900 dark:text-gray-100", children: formatNumber(trend.total) })
            ] }, trend.date);
          }) })
        ] }) })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 lg:grid-cols-2 gap-6", children: [
        /* @__PURE__ */ jsxs(Card, { children: [
          /* @__PURE__ */ jsxs(CardHeader, { children: [
            /* @__PURE__ */ jsx(CardTitle, { children: "Message Status Distribution" }),
            /* @__PURE__ */ jsx(CardDescription, { children: "Breakdown by delivery status" })
          ] }),
          /* @__PURE__ */ jsx(CardContent, { children: Object.keys(message_status_distribution).length === 0 ? /* @__PURE__ */ jsx("p", { className: "text-gray-500 dark:text-gray-400 text-center py-8", children: "No data available" }) : /* @__PURE__ */ jsx("div", { className: "space-y-3", children: Object.entries(message_status_distribution).map(([status, count]) => {
            const total = Object.values(message_status_distribution).reduce((a, b) => a + b, 0);
            const percentage = total > 0 ? count / total * 100 : 0;
            return /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between mb-1", children: [
                /* @__PURE__ */ jsx("span", { className: "text-sm font-medium text-gray-900 dark:text-gray-100 capitalize", children: status }),
                /* @__PURE__ */ jsxs("span", { className: "text-sm text-gray-600 dark:text-gray-400", children: [
                  formatNumber(count),
                  " (",
                  percentage.toFixed(1),
                  "%)"
                ] })
              ] }),
              /* @__PURE__ */ jsx("div", { className: "w-full bg-gray-200 rounded-full h-2 dark:bg-gray-700", children: /* @__PURE__ */ jsx(
                "div",
                {
                  className: "bg-blue-600 h-2 rounded-full",
                  style: { width: `${percentage}%` }
                }
              ) })
            ] }, status);
          }) }) })
        ] }),
        /* @__PURE__ */ jsxs(Card, { children: [
          /* @__PURE__ */ jsxs(CardHeader, { children: [
            /* @__PURE__ */ jsx(CardTitle, { children: "Peak Hours" }),
            /* @__PURE__ */ jsx(CardDescription, { children: "Message activity by hour of day" })
          ] }),
          /* @__PURE__ */ jsx(CardContent, { children: peak_hours.length === 0 ? /* @__PURE__ */ jsx("p", { className: "text-gray-500 dark:text-gray-400 text-center py-8", children: "No data available" }) : /* @__PURE__ */ jsx("div", { className: "space-y-2", children: peak_hours.map((peak) => {
            const maxCount = getMaxValue(peak_hours);
            const percentage = peak.count / maxCount * 100;
            return /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3", children: [
              /* @__PURE__ */ jsxs("div", { className: "w-12 text-sm text-gray-600 dark:text-gray-400", children: [
                peak.hour.toString().padStart(2, "0"),
                ":00"
              ] }),
              /* @__PURE__ */ jsx("div", { className: "flex-1 bg-gray-200 rounded-full h-4 dark:bg-gray-700", children: /* @__PURE__ */ jsx(
                "div",
                {
                  className: "bg-green-600 h-4 rounded-full",
                  style: { width: `${percentage}%` }
                }
              ) }),
              /* @__PURE__ */ jsx("div", { className: "w-16 text-right text-sm font-medium text-gray-900 dark:text-gray-100", children: formatNumber(peak.count) })
            ] }, peak.hour);
          }) }) })
        ] })
      ] }),
      /* @__PURE__ */ jsxs(Card, { children: [
        /* @__PURE__ */ jsxs(CardHeader, { children: [
          /* @__PURE__ */ jsx(CardTitle, { children: "Template Performance" }),
          /* @__PURE__ */ jsx(CardDescription, { children: "Top performing message templates" })
        ] }),
        /* @__PURE__ */ jsx(CardContent, { children: template_performance.length === 0 ? /* @__PURE__ */ jsx("p", { className: "text-gray-500 dark:text-gray-400 text-center py-8", children: "No template data available" }) : /* @__PURE__ */ jsx("div", { className: "overflow-x-auto", children: /* @__PURE__ */ jsxs("table", { className: "min-w-full divide-y divide-gray-200 dark:divide-gray-800", children: [
          /* @__PURE__ */ jsx("thead", { className: "bg-gray-50 dark:bg-gray-900", children: /* @__PURE__ */ jsxs("tr", { children: [
            /* @__PURE__ */ jsx("th", { className: "px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase", children: "Template" }),
            /* @__PURE__ */ jsx("th", { className: "px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase", children: "Status" }),
            /* @__PURE__ */ jsx("th", { className: "px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase", children: "Sent" }),
            /* @__PURE__ */ jsx("th", { className: "px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase", children: "Delivered" }),
            /* @__PURE__ */ jsx("th", { className: "px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase", children: "Read" }),
            /* @__PURE__ */ jsx("th", { className: "px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase", children: "Delivery Rate" })
          ] }) }),
          /* @__PURE__ */ jsx("tbody", { className: "bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700", children: template_performance.map((template, index) => {
            const deliveryRate = template.send_count > 0 ? template.delivered / template.send_count * 100 : 0;
            template.send_count > 0 ? template.read_count / template.send_count * 100 : 0;
            return /* @__PURE__ */ jsxs("tr", { className: "hover:bg-gray-50 dark:hover:bg-gray-700", children: [
              /* @__PURE__ */ jsx("td", { className: "px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-100", children: template.name }),
              /* @__PURE__ */ jsx("td", { className: "px-6 py-4 whitespace-nowrap", children: /* @__PURE__ */ jsx(Badge, { variant: template.status === "APPROVED" ? "success" : "warning", children: template.status }) }),
              /* @__PURE__ */ jsx("td", { className: "px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100", children: formatNumber(template.send_count) }),
              /* @__PURE__ */ jsx("td", { className: "px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100", children: formatNumber(template.delivered) }),
              /* @__PURE__ */ jsx("td", { className: "px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100", children: formatNumber(template.read_count) }),
              /* @__PURE__ */ jsx("td", { className: "px-6 py-4 whitespace-nowrap", children: /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
                /* @__PURE__ */ jsx("div", { className: "w-24 bg-gray-200 rounded-full h-2 dark:bg-gray-700", children: /* @__PURE__ */ jsx(
                  "div",
                  {
                    className: "bg-green-600 h-2 rounded-full",
                    style: { width: `${deliveryRate}%` }
                  }
                ) }),
                /* @__PURE__ */ jsxs("span", { className: "text-xs text-gray-600 dark:text-gray-400", children: [
                  deliveryRate.toFixed(1),
                  "%"
                ] })
              ] }) })
            ] }, index);
          }) })
        ] }) }) })
      ] }),
      /* @__PURE__ */ jsxs(Card, { children: [
        /* @__PURE__ */ jsxs(CardHeader, { children: [
          /* @__PURE__ */ jsx(CardTitle, { children: "Top Workspaces by Activity" }),
          /* @__PURE__ */ jsx(CardDescription, { children: "Most active workspaces in the selected period" })
        ] }),
        /* @__PURE__ */ jsx(CardContent, { children: top_workspaces.length === 0 ? /* @__PURE__ */ jsx("p", { className: "text-gray-500 dark:text-gray-400 text-center py-8", children: "No workspace data available" }) : /* @__PURE__ */ jsx("div", { className: "space-y-3", children: top_workspaces.map((workspace, index) => /* @__PURE__ */ jsxs(
          "div",
          {
            className: "flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg",
            children: [
              /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3", children: [
                /* @__PURE__ */ jsx("div", { className: "flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 font-bold text-sm", children: index + 1 }),
                /* @__PURE__ */ jsxs("div", { children: [
                  /* @__PURE__ */ jsx("p", { className: "text-sm font-medium text-gray-900 dark:text-gray-100", children: workspace.name }),
                  /* @__PURE__ */ jsx("p", { className: "text-xs text-gray-500 dark:text-gray-400", children: workspace.slug })
                ] })
              ] }),
              /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
                /* @__PURE__ */ jsx(MessageSquare, { className: "h-4 w-4 text-gray-400" }),
                /* @__PURE__ */ jsxs("span", { className: "text-sm font-semibold text-gray-900 dark:text-gray-100", children: [
                  formatNumber(workspace.message_count),
                  " messages"
                ] })
              ] })
            ]
          },
          workspace.id
        )) }) })
      ] })
    ] })
  ] });
}
export {
  Analytics as default
};
