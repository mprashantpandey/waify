import { jsxs, jsx } from "react/jsx-runtime";
import { Head, Link } from "@inertiajs/react";
import { A as AppShell } from "./AppShell-tmVeunvc.js";
import { C as Card, a as CardHeader, b as CardTitle, d as CardDescription, c as CardContent } from "./Card-8uw03vLH.js";
import { B as Badge } from "./RealtimeProvider-DfTOxbgl.js";
import { ArrowLeft, Info, Bot, Zap, MessageSquare, Activity, XCircle, AlertCircle, Clock, CheckCircle } from "lucide-react";
import "react";
import "./utils-H80jjgLf.js";
import "clsx";
import "tailwind-merge";
import "./GlobalFlashHandler-DdgICiVx.js";
import "./useToast-DNfJQ6ZA.js";
import "./BrandingWrapper-B2Mh0bYb.js";
import "./Button-BocaoVWt.js";
import "axios";
import "laravel-echo";
import "pusher-js";
function ChatbotsExecutionsShow({
  workspace,
  execution
}) {
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
  const getLogResultBadge = (result) => {
    const resultMap = {
      success: { variant: "success", label: "Success" },
      failed: { variant: "danger", label: "Failed" },
      passed: { variant: "success", label: "Passed" },
      skipped: { variant: "default", label: "Skipped" }
    };
    const config = resultMap[result] || { variant: "default", label: result };
    return /* @__PURE__ */ jsx(Badge, { variant: config.variant, className: "px-2 py-1 text-xs", children: config.label });
  };
  return /* @__PURE__ */ jsxs(AppShell, { children: [
    /* @__PURE__ */ jsx(Head, { title: `Execution #${execution.id} - Details` }),
    /* @__PURE__ */ jsxs("div", { className: "space-y-8", children: [
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsxs(
          Link,
          {
            href: route("app.chatbots.executions.index", { workspace: workspace.slug }),
            className: "inline-flex items-center gap-2 text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors mb-4",
            children: [
              /* @__PURE__ */ jsx(ArrowLeft, { className: "h-4 w-4" }),
              "Back to Executions"
            ]
          }
        ),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("h1", { className: "text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-gray-100 dark:to-gray-300 bg-clip-text text-transparent", children: "Execution Details" }),
          /* @__PURE__ */ jsx("p", { className: "mt-2 text-sm text-gray-600 dark:text-gray-400", children: "View detailed execution logs and debug issues" })
        ] })
      ] }),
      /* @__PURE__ */ jsxs(Card, { className: "border-0 shadow-lg", children: [
        /* @__PURE__ */ jsx(CardHeader, { className: "bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20", children: /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3", children: [
          /* @__PURE__ */ jsx("div", { className: "p-2 bg-blue-500 rounded-xl", children: /* @__PURE__ */ jsx(Info, { className: "h-5 w-5 text-white" }) }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx(CardTitle, { className: "text-xl font-bold", children: "Execution Information" }),
            /* @__PURE__ */ jsx(CardDescription, { children: "Basic details about this execution" })
          ] })
        ] }) }),
        /* @__PURE__ */ jsxs(CardContent, { className: "p-6", children: [
          /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-6", children: [
            /* @__PURE__ */ jsxs("div", { className: "p-4 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 rounded-xl", children: [
              /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 mb-2", children: [
                /* @__PURE__ */ jsx(Bot, { className: "h-4 w-4 text-gray-500" }),
                /* @__PURE__ */ jsx("div", { className: "text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider", children: "Bot" })
              ] }),
              /* @__PURE__ */ jsx("div", { className: "font-semibold text-gray-900 dark:text-gray-100", children: execution.bot.name })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "p-4 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 rounded-xl", children: [
              /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 mb-2", children: [
                /* @__PURE__ */ jsx(Zap, { className: "h-4 w-4 text-gray-500" }),
                /* @__PURE__ */ jsx("div", { className: "text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider", children: "Flow" })
              ] }),
              /* @__PURE__ */ jsx("div", { className: "font-semibold text-gray-900 dark:text-gray-100", children: execution.flow.name })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "p-4 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 rounded-xl", children: [
              /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 mb-2", children: [
                /* @__PURE__ */ jsx(MessageSquare, { className: "h-4 w-4 text-gray-500" }),
                /* @__PURE__ */ jsx("div", { className: "text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider", children: "Conversation" })
              ] }),
              /* @__PURE__ */ jsx("div", { className: "font-semibold text-gray-900 dark:text-gray-100", children: execution.conversation ? /* @__PURE__ */ jsxs("div", { children: [
                /* @__PURE__ */ jsx("div", { children: execution.conversation.contact.name || "Unknown" }),
                /* @__PURE__ */ jsx("div", { className: "text-xs text-gray-500 font-normal", children: execution.conversation.contact.wa_id })
              ] }) : "—" })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "p-4 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 rounded-xl", children: [
              /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 mb-2", children: [
                /* @__PURE__ */ jsx(Activity, { className: "h-4 w-4 text-gray-500" }),
                /* @__PURE__ */ jsx("div", { className: "text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider", children: "Status" })
              ] }),
              /* @__PURE__ */ jsx("div", { children: getStatusBadge(execution.status) })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "p-4 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 rounded-xl", children: [
              /* @__PURE__ */ jsx("div", { className: "text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2", children: "Started At" }),
              /* @__PURE__ */ jsx("div", { className: "font-semibold text-gray-900 dark:text-gray-100", children: new Date(execution.started_at).toLocaleString() })
            ] }),
            execution.finished_at && /* @__PURE__ */ jsxs("div", { className: "p-4 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 rounded-xl", children: [
              /* @__PURE__ */ jsx("div", { className: "text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2", children: "Finished At" }),
              /* @__PURE__ */ jsx("div", { className: "font-semibold text-gray-900 dark:text-gray-100", children: new Date(execution.finished_at).toLocaleString() })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "p-4 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 rounded-xl", children: [
              /* @__PURE__ */ jsx("div", { className: "text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2", children: "Trigger Event ID" }),
              /* @__PURE__ */ jsx("div", { className: "font-mono text-sm text-gray-900 dark:text-gray-100 break-all", children: execution.trigger_event_id })
            ] })
          ] }),
          execution.error_message && /* @__PURE__ */ jsx("div", { className: "mt-6 p-4 bg-gradient-to-r from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-800/20 rounded-xl border border-red-200 dark:border-red-800", children: /* @__PURE__ */ jsxs("div", { className: "flex items-start gap-3", children: [
            /* @__PURE__ */ jsx(XCircle, { className: "h-5 w-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" }),
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx("div", { className: "font-semibold text-red-800 dark:text-red-200 mb-1", children: "Error Message" }),
              /* @__PURE__ */ jsx("div", { className: "text-sm text-red-600 dark:text-red-400", children: execution.error_message })
            ] })
          ] }) })
        ] })
      ] }),
      /* @__PURE__ */ jsxs(Card, { className: "border-0 shadow-lg", children: [
        /* @__PURE__ */ jsx(CardHeader, { className: "bg-gradient-to-r from-gray-50 to-white dark:from-gray-800 dark:to-gray-900", children: /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3", children: [
          /* @__PURE__ */ jsx("div", { className: "p-2 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl", children: /* @__PURE__ */ jsx(Activity, { className: "h-5 w-5 text-white" }) }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx(CardTitle, { className: "text-xl font-bold", children: "Execution Logs" }),
            /* @__PURE__ */ jsx(CardDescription, { children: "Step-by-step execution details" })
          ] })
        ] }) }),
        /* @__PURE__ */ jsx(CardContent, { className: "p-6", children: execution.logs.length === 0 ? /* @__PURE__ */ jsxs("div", { className: "text-center py-12", children: [
          /* @__PURE__ */ jsx("div", { className: "inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-800 mb-4", children: /* @__PURE__ */ jsx(Activity, { className: "h-8 w-8 text-gray-400" }) }),
          /* @__PURE__ */ jsx("p", { className: "text-gray-500 dark:text-gray-400 font-medium", children: "No logs available" })
        ] }) : /* @__PURE__ */ jsx("div", { className: "space-y-3", children: execution.logs.map((log, index) => /* @__PURE__ */ jsxs(
          "div",
          {
            className: "p-4 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 rounded-xl border border-gray-200 dark:border-gray-700",
            children: [
              /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between mb-2", children: [
                /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3", children: [
                  /* @__PURE__ */ jsxs("div", { className: "text-xs font-mono text-gray-500 dark:text-gray-400", children: [
                    "Node #",
                    log.node_id
                  ] }),
                  /* @__PURE__ */ jsx(Badge, { variant: "info", className: "px-2 py-1 text-xs", children: log.type })
                ] }),
                getLogResultBadge(log.result)
              ] }),
              log.reason && /* @__PURE__ */ jsxs("div", { className: "text-sm text-gray-600 dark:text-gray-400 mt-2", children: [
                /* @__PURE__ */ jsx("strong", { children: "Reason:" }),
                " ",
                log.reason
              ] }),
              log.data && /* @__PURE__ */ jsx("div", { className: "mt-2 p-2 bg-white dark:bg-gray-950 rounded-lg border border-gray-200 dark:border-gray-700", children: /* @__PURE__ */ jsx("pre", { className: "text-xs text-gray-700 dark:text-gray-300 overflow-x-auto", children: JSON.stringify(log.data, null, 2) }) })
            ]
          },
          index
        )) }) })
      ] })
    ] })
  ] });
}
export {
  ChatbotsExecutionsShow as default
};
