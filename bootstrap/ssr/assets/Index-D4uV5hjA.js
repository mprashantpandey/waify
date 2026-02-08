import { jsxs, jsx } from "react/jsx-runtime";
import { Head } from "@inertiajs/react";
import { A as AppShell } from "./AppShell-Dx9mYfem.js";
import { C as Card, b as CardHeader, c as CardTitle, d as CardDescription, a as CardContent } from "./Card-DLPTnTfC.js";
import { B as Badge } from "./Badge-CHx1ViYT.js";
import { Activity, Clock, Sparkles, XCircle, CheckCircle, MessageSquare, AlertCircle } from "lucide-react";
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
function ActivityLogsIndex({
  account,
  logs
}) {
  const getTypeBadge = (type) => {
    const typeMap = {
      message: { variant: "info", icon: MessageSquare, label: "Message", color: "blue" },
      connection_success: { variant: "success", icon: CheckCircle, label: "Connection", color: "green" },
      connection_error: { variant: "danger", icon: XCircle, label: "Error", color: "red" }
    };
    const config = typeMap[type] || { variant: "default", icon: AlertCircle, label: type };
    const Icon = config.icon;
    return /* @__PURE__ */ jsxs(Badge, { variant: config.variant, className: "flex items-center gap-1.5 px-3 py-1", children: [
      /* @__PURE__ */ jsx(Icon, { className: "h-3.5 w-3.5" }),
      config.label
    ] });
  };
  return /* @__PURE__ */ jsxs(AppShell, { children: [
    /* @__PURE__ */ jsx(Head, { title: "Activity Logs" }),
    /* @__PURE__ */ jsxs("div", { className: "space-y-8", children: [
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("h1", { className: "text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-gray-100 dark:to-gray-300 bg-clip-text text-transparent", children: "Activity Logs" }),
        /* @__PURE__ */ jsx("p", { className: "mt-2 text-sm text-gray-600 dark:text-gray-400", children: "View recent activity and events in your account" })
      ] }),
      /* @__PURE__ */ jsxs(Card, { className: "border-0 shadow-lg", children: [
        /* @__PURE__ */ jsx(CardHeader, { className: "bg-gradient-to-r from-gray-50 to-white dark:from-gray-800 dark:to-gray-900", children: /* @__PURE__ */ jsx("div", { className: "flex items-center justify-between", children: /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsxs(CardTitle, { className: "text-xl font-bold flex items-center gap-2", children: [
            /* @__PURE__ */ jsx(Activity, { className: "h-5 w-5 text-blue-600 dark:text-blue-400" }),
            "Recent Activity"
          ] }),
          /* @__PURE__ */ jsxs(CardDescription, { className: "mt-1", children: [
            logs.length,
            " recent events"
          ] })
        ] }) }) }),
        /* @__PURE__ */ jsx(CardContent, { className: "p-6", children: logs.length === 0 ? /* @__PURE__ */ jsxs("div", { className: "text-center py-16", children: [
          /* @__PURE__ */ jsx("div", { className: "inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-800 mb-4", children: /* @__PURE__ */ jsx(Activity, { className: "h-8 w-8 text-gray-400" }) }),
          /* @__PURE__ */ jsx("p", { className: "text-gray-500 dark:text-gray-400 font-medium", children: "No activity logs found" }),
          /* @__PURE__ */ jsx("p", { className: "text-sm text-gray-400 dark:text-gray-500 mt-1", children: "Activity will appear here as events occur" })
        ] }) : /* @__PURE__ */ jsx("div", { className: "space-y-3", children: logs.map((log, index) => /* @__PURE__ */ jsxs(
          "div",
          {
            className: "flex items-start gap-4 p-5 bg-gradient-to-r from-gray-50 to-white dark:from-gray-800 dark:to-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 hover:shadow-md transition-all duration-200 group",
            children: [
              /* @__PURE__ */ jsxs("div", { className: "flex-shrink-0 mt-1", children: [
                /* @__PURE__ */ jsx("div", { className: "h-2 w-2 rounded-full bg-blue-500" }),
                index < logs.length - 1 && /* @__PURE__ */ jsx("div", { className: "h-full w-0.5 bg-gray-200 dark:bg-gray-700 ml-0.5 mt-1" })
              ] }),
              /* @__PURE__ */ jsxs("div", { className: "flex-1 min-w-0", children: [
                /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3 mb-2", children: [
                  getTypeBadge(log.type),
                  /* @__PURE__ */ jsx("p", { className: "text-sm font-semibold text-gray-900 dark:text-gray-100", children: log.description })
                ] }),
                /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400", children: [
                  /* @__PURE__ */ jsx(Clock, { className: "h-3.5 w-3.5" }),
                  new Date(log.created_at).toLocaleString()
                ] }),
                Object.keys(log.metadata || {}).length > 0 && /* @__PURE__ */ jsxs("details", { className: "mt-3", children: [
                  /* @__PURE__ */ jsxs("summary", { className: "text-xs font-medium text-blue-600 dark:text-blue-400 cursor-pointer hover:text-blue-700 dark:hover:text-blue-300 transition-colors flex items-center gap-1", children: [
                    /* @__PURE__ */ jsx(Sparkles, { className: "h-3 w-3" }),
                    "View Details"
                  ] }),
                  /* @__PURE__ */ jsx("pre", { className: "mt-3 text-xs bg-gray-900 text-gray-100 p-4 rounded-lg overflow-auto max-h-48 border border-gray-700", children: JSON.stringify(log.metadata, null, 2) })
                ] })
              ] })
            ]
          },
          log.id
        )) }) })
      ] })
    ] })
  ] });
}
export {
  ActivityLogsIndex as default
};
