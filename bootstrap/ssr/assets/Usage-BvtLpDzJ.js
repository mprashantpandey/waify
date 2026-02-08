import { jsxs, jsx } from "react/jsx-runtime";
import { Head, Link } from "@inertiajs/react";
import { A as AppShell } from "./AppShell-Dx9mYfem.js";
import { C as Card, b as CardHeader, c as CardTitle, d as CardDescription, a as CardContent } from "./Card-DLPTnTfC.js";
import { ArrowLeft, TrendingUp, MessageSquare, FileText, Zap, Clock, AlertTriangle } from "lucide-react";
import { B as Badge } from "./Badge-CHx1ViYT.js";
import "react";
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
function BillingUsage({
  account,
  current_usage,
  limits,
  usage_history,
  blocked_events
}) {
  return /* @__PURE__ */ jsxs(AppShell, { children: [
    /* @__PURE__ */ jsx(Head, { title: "Usage Details" }),
    /* @__PURE__ */ jsxs("div", { className: "space-y-8", children: [
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsxs(
          Link,
          {
            href: route("app.billing.index", {}),
            className: "inline-flex items-center gap-2 text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors mb-4",
            children: [
              /* @__PURE__ */ jsx(ArrowLeft, { className: "h-4 w-4" }),
              "Back to Billing"
            ]
          }
        ),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("h1", { className: "text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-gray-100 dark:to-gray-300 bg-clip-text text-transparent", children: "Usage Details" }),
          /* @__PURE__ */ jsx("p", { className: "mt-2 text-sm text-gray-600 dark:text-gray-400", children: "View your usage history and limits" })
        ] })
      ] }),
      /* @__PURE__ */ jsxs(Card, { className: "border-0 shadow-lg", children: [
        /* @__PURE__ */ jsx(CardHeader, { className: "bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20", children: /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3", children: [
          /* @__PURE__ */ jsx("div", { className: "p-2 bg-blue-500 rounded-xl", children: /* @__PURE__ */ jsx(TrendingUp, { className: "h-5 w-5 text-white" }) }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx(CardTitle, { className: "text-xl font-bold", children: "Current Period" }),
            /* @__PURE__ */ jsx(CardDescription, { children: "This month's usage statistics" })
          ] })
        ] }) }),
        /* @__PURE__ */ jsx(CardContent, { className: "p-6", children: /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 md:grid-cols-3 gap-6", children: [
          /* @__PURE__ */ jsxs("div", { className: "p-5 bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-xl border border-blue-200 dark:border-blue-800", children: [
            /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3 mb-3", children: [
              /* @__PURE__ */ jsx("div", { className: "p-2 bg-blue-500 rounded-lg", children: /* @__PURE__ */ jsx(MessageSquare, { className: "h-5 w-5 text-white" }) }),
              /* @__PURE__ */ jsx("span", { className: "text-sm font-semibold text-gray-700 dark:text-gray-300", children: "Messages Sent" })
            ] }),
            /* @__PURE__ */ jsx("div", { className: "text-3xl font-bold text-gray-900 dark:text-gray-100 mb-1", children: current_usage.messages_sent.toLocaleString() }),
            limits.messages_monthly !== void 0 && /* @__PURE__ */ jsxs("div", { className: "text-xs text-gray-500 dark:text-gray-400", children: [
              "Limit: ",
              limits.messages_monthly === -1 ? "Unlimited" : limits.messages_monthly.toLocaleString()
            ] })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "p-5 bg-gradient-to-r from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 rounded-xl border border-purple-200 dark:border-purple-800", children: [
            /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3 mb-3", children: [
              /* @__PURE__ */ jsx("div", { className: "p-2 bg-purple-500 rounded-lg", children: /* @__PURE__ */ jsx(FileText, { className: "h-5 w-5 text-white" }) }),
              /* @__PURE__ */ jsx("span", { className: "text-sm font-semibold text-gray-700 dark:text-gray-300", children: "Template Sends" })
            ] }),
            /* @__PURE__ */ jsx("div", { className: "text-3xl font-bold text-gray-900 dark:text-gray-100 mb-1", children: current_usage.template_sends.toLocaleString() }),
            limits.template_sends_monthly !== void 0 && /* @__PURE__ */ jsxs("div", { className: "text-xs text-gray-500 dark:text-gray-400", children: [
              "Limit: ",
              limits.template_sends_monthly === -1 ? "Unlimited" : limits.template_sends_monthly.toLocaleString()
            ] })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "p-5 bg-gradient-to-r from-amber-50 to-amber-100 dark:from-amber-900/20 dark:to-amber-800/20 rounded-xl border border-amber-200 dark:border-amber-800", children: [
            /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3 mb-3", children: [
              /* @__PURE__ */ jsx("div", { className: "p-2 bg-amber-500 rounded-lg", children: /* @__PURE__ */ jsx(Zap, { className: "h-5 w-5 text-white" }) }),
              /* @__PURE__ */ jsx("span", { className: "text-sm font-semibold text-gray-700 dark:text-gray-300", children: "AI Credits Used" })
            ] }),
            /* @__PURE__ */ jsx("div", { className: "text-3xl font-bold text-gray-900 dark:text-gray-100 mb-1", children: current_usage.ai_credits_used.toLocaleString() }),
            limits.ai_credits_monthly !== void 0 && /* @__PURE__ */ jsxs("div", { className: "text-xs text-gray-500 dark:text-gray-400", children: [
              "Limit: ",
              limits.ai_credits_monthly === -1 ? "Unlimited" : limits.ai_credits_monthly.toLocaleString()
            ] })
          ] })
        ] }) })
      ] }),
      /* @__PURE__ */ jsxs(Card, { className: "border-0 shadow-lg", children: [
        /* @__PURE__ */ jsx(CardHeader, { className: "bg-gradient-to-r from-gray-50 to-white dark:from-gray-800 dark:to-gray-900", children: /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3", children: [
          /* @__PURE__ */ jsx("div", { className: "p-2 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl", children: /* @__PURE__ */ jsx(Clock, { className: "h-5 w-5 text-white" }) }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx(CardTitle, { className: "text-xl font-bold", children: "Usage History" }),
            /* @__PURE__ */ jsx(CardDescription, { children: "Historical usage data by period" })
          ] })
        ] }) }),
        /* @__PURE__ */ jsx(CardContent, { className: "p-0", children: /* @__PURE__ */ jsx("div", { className: "overflow-x-auto", children: /* @__PURE__ */ jsxs("table", { className: "w-full", children: [
          /* @__PURE__ */ jsx("thead", { className: "bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 border-b border-gray-200 dark:border-gray-700", children: /* @__PURE__ */ jsxs("tr", { children: [
            /* @__PURE__ */ jsx("th", { className: "px-6 py-4 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider", children: "Period" }),
            /* @__PURE__ */ jsx("th", { className: "px-6 py-4 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider", children: "Messages" }),
            /* @__PURE__ */ jsx("th", { className: "px-6 py-4 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider", children: "Templates" }),
            /* @__PURE__ */ jsx("th", { className: "px-6 py-4 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider", children: "AI Credits" })
          ] }) }),
          /* @__PURE__ */ jsx("tbody", { className: "divide-y divide-gray-200 dark:divide-gray-800 bg-white dark:bg-gray-900", children: usage_history.length === 0 ? /* @__PURE__ */ jsx("tr", { children: /* @__PURE__ */ jsx("td", { colSpan: 4, className: "px-6 py-12 text-center text-gray-500 dark:text-gray-400", children: "No usage history available" }) }) : usage_history.map((period) => /* @__PURE__ */ jsxs("tr", { className: "hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors", children: [
            /* @__PURE__ */ jsx("td", { className: "px-6 py-4 text-sm font-semibold text-gray-900 dark:text-gray-100", children: period.period }),
            /* @__PURE__ */ jsx("td", { className: "px-6 py-4 text-sm text-gray-700 dark:text-gray-300", children: period.messages_sent.toLocaleString() }),
            /* @__PURE__ */ jsx("td", { className: "px-6 py-4 text-sm text-gray-700 dark:text-gray-300", children: period.template_sends.toLocaleString() }),
            /* @__PURE__ */ jsx("td", { className: "px-6 py-4 text-sm text-gray-700 dark:text-gray-300", children: period.ai_credits_used.toLocaleString() })
          ] }, period.period)) })
        ] }) }) })
      ] }),
      blocked_events.length > 0 && /* @__PURE__ */ jsxs(Card, { className: "border-0 shadow-lg border-red-200 dark:border-red-800", children: [
        /* @__PURE__ */ jsx(CardHeader, { className: "bg-gradient-to-r from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-800/20", children: /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3", children: [
          /* @__PURE__ */ jsx("div", { className: "p-2 bg-red-500 rounded-xl", children: /* @__PURE__ */ jsx(AlertTriangle, { className: "h-5 w-5 text-white" }) }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx(CardTitle, { className: "text-xl font-bold text-red-900 dark:text-red-100", children: "Limit Blocked Events" }),
            /* @__PURE__ */ jsx(CardDescription, { className: "text-red-700 dark:text-red-300", children: "Actions that were blocked due to plan limits" })
          ] })
        ] }) }),
        /* @__PURE__ */ jsx(CardContent, { className: "p-6", children: /* @__PURE__ */ jsx("div", { className: "space-y-3", children: blocked_events.map((event) => /* @__PURE__ */ jsxs(
          "div",
          {
            className: "p-4 bg-gradient-to-r from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-800/20 rounded-xl border border-red-200 dark:border-red-800",
            children: [
              /* @__PURE__ */ jsxs("div", { className: "flex items-start justify-between mb-2", children: [
                /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
                  /* @__PURE__ */ jsx(AlertTriangle, { className: "h-4 w-4 text-red-600 dark:text-red-400" }),
                  /* @__PURE__ */ jsxs("span", { className: "text-sm font-semibold text-red-800 dark:text-red-200", children: [
                    event.data.limit_key,
                    " limit exceeded"
                  ] })
                ] }),
                /* @__PURE__ */ jsx(Badge, { variant: "danger", className: "px-2 py-1 text-xs", children: "Blocked" })
              ] }),
              /* @__PURE__ */ jsxs("div", { className: "text-xs text-red-600 dark:text-red-400 space-y-1", children: [
                /* @__PURE__ */ jsxs("p", { children: [
                  "Usage: ",
                  /* @__PURE__ */ jsx("strong", { children: event.data.current_usage.toLocaleString() }),
                  " / Limit: ",
                  /* @__PURE__ */ jsx("strong", { children: event.data.limit.toLocaleString() }),
                  " (Attempted: +",
                  event.data.intended_increment.toLocaleString(),
                  ")"
                ] }),
                /* @__PURE__ */ jsxs("p", { className: "flex items-center gap-1", children: [
                  /* @__PURE__ */ jsx(Clock, { className: "h-3 w-3" }),
                  new Date(event.created_at).toLocaleString()
                ] })
              ] })
            ]
          },
          event.id
        )) }) })
      ] })
    ] })
  ] });
}
export {
  BillingUsage as default
};
