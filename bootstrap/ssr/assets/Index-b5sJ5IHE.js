import { jsxs, jsx } from "react/jsx-runtime";
import { Head, Link } from "@inertiajs/react";
import { A as AppShell } from "./AppShell-DvEO1iV9.js";
import { C as Card, b as CardHeader, c as CardTitle, d as CardDescription, a as CardContent } from "./Card-DLPTnTfC.js";
import { B as Badge } from "./Badge-CHx1ViYT.js";
import { B as Button } from "./Button-ymbdH_NY.js";
import { ArrowLeft, Activity, Eye, AlertCircle, Clock, XCircle, CheckCircle } from "lucide-react";
import "react";
import "./utils-B2ZNUmII.js";
import "clsx";
import "tailwind-merge";
import "./RealtimeProvider-Dletx5Ny.js";
import "laravel-echo";
import "pusher-js";
import "./GlobalFlashHandler-gMSPY3wx.js";
import "./useToast-C5ECijgs.js";
import "./BrandingWrapper-B2Mh0bYb.js";
import "./Alert-DWa0cnrh.js";
import "./CookieConsentBanner-BJ5KL4CC.js";
function ChatbotsExecutionsIndex({
  account,
  executions: executionsProp
}) {
  const executions = executionsProp ?? { data: [], links: {}, meta: { current_page: 1, last_page: 1 } };
  const meta = executions.meta ?? { current_page: 1, last_page: 1 };
  const list = Array.isArray(executions.data) ? executions.data : [];
  const getStatusBadge = (status) => {
    const statusMap = {
      success: { variant: "success", icon: CheckCircle, label: "Success" },
      failed: { variant: "danger", icon: XCircle, label: "Failed" },
      running: { variant: "warning", icon: Clock, label: "Running" },
      skipped: { variant: "default", icon: AlertCircle, label: "Skipped" }
    };
    const config = statusMap[status] || { variant: "default", icon: AlertCircle, label: status };
    const Icon = config.icon;
    return /* @__PURE__ */ jsxs(Badge, { variant: config.variant, className: "flex items-center gap-1.5 px-3 py-1", children: [
      /* @__PURE__ */ jsx(Icon, { className: "h-3.5 w-3.5" }),
      config.label
    ] });
  };
  return /* @__PURE__ */ jsxs(AppShell, { children: [
    /* @__PURE__ */ jsx(Head, { title: "Execution Logs" }),
    /* @__PURE__ */ jsxs("div", { className: "space-y-8", children: [
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsxs(
          Link,
          {
            href: route("app.chatbots.index", {}),
            className: "inline-flex items-center gap-2 text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors mb-4",
            children: [
              /* @__PURE__ */ jsx(ArrowLeft, { className: "h-4 w-4" }),
              "Back to Chatbots"
            ]
          }
        ),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("h1", { className: "text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-gray-100 dark:to-gray-300 bg-clip-text text-transparent", children: "Execution Logs" }),
          /* @__PURE__ */ jsx("p", { className: "mt-2 text-sm text-gray-600 dark:text-gray-400", children: "View bot execution history and debug issues" })
        ] })
      ] }),
      /* @__PURE__ */ jsxs(Card, { className: "border-0 shadow-lg", children: [
        /* @__PURE__ */ jsx(CardHeader, { className: "bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20", children: /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3", children: [
          /* @__PURE__ */ jsx("div", { className: "p-2 bg-blue-500 rounded-xl", children: /* @__PURE__ */ jsx(Activity, { className: "h-5 w-5 text-white" }) }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx(CardTitle, { className: "text-xl font-bold", children: "Recent Executions" }),
            /* @__PURE__ */ jsx(CardDescription, { children: "Track bot flow executions and their results" })
          ] })
        ] }) }),
        /* @__PURE__ */ jsxs(CardContent, { className: "p-0", children: [
          /* @__PURE__ */ jsx("div", { className: "overflow-x-auto", children: /* @__PURE__ */ jsxs("table", { className: "w-full", children: [
            /* @__PURE__ */ jsx("thead", { className: "bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 border-b border-gray-200 dark:border-gray-700", children: /* @__PURE__ */ jsxs("tr", { children: [
              /* @__PURE__ */ jsx("th", { className: "px-6 py-4 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider", children: "Time" }),
              /* @__PURE__ */ jsx("th", { className: "px-6 py-4 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider", children: "Bot / Flow" }),
              /* @__PURE__ */ jsx("th", { className: "px-6 py-4 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider", children: "Conversation" }),
              /* @__PURE__ */ jsx("th", { className: "px-6 py-4 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider", children: "Status" }),
              /* @__PURE__ */ jsx("th", { className: "px-6 py-4 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider", children: "Duration" }),
              /* @__PURE__ */ jsx("th", { className: "px-6 py-4 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider", children: "Actions" })
            ] }) }),
            /* @__PURE__ */ jsx("tbody", { className: "divide-y divide-gray-200 dark:divide-gray-800 bg-white dark:bg-gray-900", children: list.length === 0 ? /* @__PURE__ */ jsx("tr", { children: /* @__PURE__ */ jsxs("td", { colSpan: 6, className: "px-6 py-12 text-center", children: [
              /* @__PURE__ */ jsx("div", { className: "inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-800 mb-4", children: /* @__PURE__ */ jsx(Activity, { className: "h-8 w-8 text-gray-400" }) }),
              /* @__PURE__ */ jsx("p", { className: "text-gray-500 dark:text-gray-400 font-medium", children: "No executions yet" }),
              /* @__PURE__ */ jsx("p", { className: "text-sm text-gray-400 dark:text-gray-500 mt-1", children: "Bot executions will appear here" })
            ] }) }) : list.map((execution) => /* @__PURE__ */ jsxs("tr", { className: "hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors", children: [
              /* @__PURE__ */ jsx("td", { className: "px-6 py-4 text-sm font-medium text-gray-900 dark:text-gray-100", children: new Date(execution.started_at).toLocaleString() }),
              /* @__PURE__ */ jsxs("td", { className: "px-6 py-4", children: [
                /* @__PURE__ */ jsx("div", { className: "text-sm font-semibold text-gray-900 dark:text-gray-100", children: execution.bot.name }),
                /* @__PURE__ */ jsx("div", { className: "text-xs text-gray-500 dark:text-gray-400", children: execution.flow.name })
              ] }),
              /* @__PURE__ */ jsx("td", { className: "px-6 py-4 text-sm text-gray-700 dark:text-gray-300", children: execution.conversation ? /* @__PURE__ */ jsxs("div", { children: [
                /* @__PURE__ */ jsx("div", { className: "font-medium", children: execution.conversation.contact.name || "Unknown" }),
                /* @__PURE__ */ jsx("div", { className: "text-xs text-gray-500", children: execution.conversation.contact.wa_id })
              ] }) : /* @__PURE__ */ jsx("span", { className: "text-gray-400", children: "—" }) }),
              /* @__PURE__ */ jsxs("td", { className: "px-6 py-4", children: [
                getStatusBadge(execution.status),
                execution.error_message && /* @__PURE__ */ jsx("div", { className: "text-xs text-red-600 dark:text-red-400 mt-1 truncate max-w-xs", title: execution.error_message, children: execution.error_message })
              ] }),
              /* @__PURE__ */ jsx("td", { className: "px-6 py-4 text-sm text-gray-700 dark:text-gray-300", children: execution.duration !== null ? `${execution.duration}ms` : "—" }),
              /* @__PURE__ */ jsx("td", { className: "px-6 py-4", children: /* @__PURE__ */ jsx(
                Link,
                {
                  href: route("app.chatbots.executions.show", {
                    execution: execution.id
                  }),
                  children: /* @__PURE__ */ jsxs(Button, { variant: "ghost", size: "sm", className: "rounded-xl", children: [
                    /* @__PURE__ */ jsx(Eye, { className: "h-4 w-4 mr-1" }),
                    "View"
                  ] })
                }
              ) })
            ] }, execution.id)) })
          ] }) }),
          meta.last_page > 1 && /* @__PURE__ */ jsxs("div", { className: "flex justify-between items-center p-4 border-t border-gray-200 dark:border-gray-700", children: [
            /* @__PURE__ */ jsx(
              Button,
              {
                onClick: () => window.location.href = executions.links?.prev,
                disabled: !executions.links?.prev,
                variant: "secondary",
                size: "sm",
                className: "rounded-xl",
                children: "Previous"
              }
            ),
            /* @__PURE__ */ jsxs("span", { className: "text-sm text-gray-700 dark:text-gray-300", children: [
              "Page ",
              meta.current_page,
              " of ",
              meta.last_page
            ] }),
            /* @__PURE__ */ jsx(
              Button,
              {
                onClick: () => window.location.href = executions.links?.next,
                disabled: !executions.links?.next,
                variant: "secondary",
                size: "sm",
                className: "rounded-xl",
                children: "Next"
              }
            )
          ] })
        ] })
      ] })
    ] })
  ] });
}
export {
  ChatbotsExecutionsIndex as default
};
