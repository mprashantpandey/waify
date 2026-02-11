import { jsxs, jsx } from "react/jsx-runtime";
import { Head, Link, router } from "@inertiajs/react";
import { A as AppShell } from "./AppShell-B4peoZD-.js";
import { C as Card, a as CardContent, b as CardHeader, c as CardTitle, d as CardDescription } from "./Card-DLPTnTfC.js";
import { B as Badge } from "./Badge-CHx1ViYT.js";
import { B as Button } from "./Button-ymbdH_NY.js";
import { Activity, Plus, Bot, Zap, AlertCircle, Edit, Trash2 } from "lucide-react";
import { u as useToast } from "./useToast-DNfJQ6ZA.js";
import "./useConfirm-BKf7Nv1N.js";
import "react";
import "./utils-B2ZNUmII.js";
import "clsx";
import "tailwind-merge";
import "./RealtimeProvider-Dletx5Ny.js";
import "laravel-echo";
import "pusher-js";
import "./GlobalFlashHandler-CNoF0uzm.js";
import "./BrandingWrapper-B2Mh0bYb.js";
import "./Alert-DWa0cnrh.js";
import "./CookieConsentBanner-BJ5KL4CC.js";
function ChatbotsIndex({
  account,
  bots
}) {
  const { toast } = useToast();
  const getStatusBadge = (status) => {
    const statusMap = {
      active: { variant: "success", label: "Active" },
      paused: { variant: "warning", label: "Paused" },
      draft: { variant: "default", label: "Draft" }
    };
    const config = statusMap[status] || { variant: "default", label: status };
    return /* @__PURE__ */ jsx(Badge, { variant: config.variant, className: "px-3 py-1", children: config.label });
  };
  const deleteBot = (botId, botName) => {
    if (!confirm(`Delete bot "${botName}"? This will also delete flows and execution logs.`)) {
      return;
    }
    router.delete(route("app.chatbots.destroy", { bot: botId }), {
      preserveScroll: true,
      onSuccess: () => toast.success("Bot deleted"),
      onError: () => toast.error("Failed to delete bot")
    });
  };
  return /* @__PURE__ */ jsxs(AppShell, { children: [
    /* @__PURE__ */ jsx(Head, { title: "Chatbots" }),
    /* @__PURE__ */ jsxs("div", { className: "space-y-8", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between", children: [
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("h1", { className: "text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-gray-100 dark:to-gray-300 bg-clip-text text-transparent", children: "Chatbots" }),
          /* @__PURE__ */ jsx("p", { className: "mt-2 text-sm text-gray-600 dark:text-gray-400", children: "Build automation bots for WhatsApp conversations" })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
          /* @__PURE__ */ jsx(Link, { href: route("app.chatbots.executions.index", {}), children: /* @__PURE__ */ jsxs(Button, { variant: "secondary", className: "rounded-xl", children: [
            /* @__PURE__ */ jsx(Activity, { className: "h-4 w-4 mr-2" }),
            "Execution Logs"
          ] }) }),
          /* @__PURE__ */ jsx(Link, { href: route("app.chatbots.create", {}), children: /* @__PURE__ */ jsxs(Button, { className: "bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 shadow-lg shadow-purple-500/50", children: [
            /* @__PURE__ */ jsx(Plus, { className: "h-4 w-4 mr-2" }),
            "Create Bot"
          ] }) })
        ] })
      ] }),
      bots.length === 0 ? /* @__PURE__ */ jsx(Card, { className: "border-0 shadow-xl", children: /* @__PURE__ */ jsxs(CardContent, { className: "py-16 text-center", children: [
        /* @__PURE__ */ jsx("div", { className: "inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-purple-100 to-purple-200 dark:from-purple-900/20 dark:to-purple-800/20 mb-6", children: /* @__PURE__ */ jsx(Bot, { className: "h-10 w-10 text-purple-600 dark:text-purple-400" }) }),
        /* @__PURE__ */ jsx("h3", { className: "text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2", children: "No chatbots yet" }),
        /* @__PURE__ */ jsx("p", { className: "text-gray-500 dark:text-gray-400 mb-6 max-w-md mx-auto", children: "Create your first chatbot to automate WhatsApp conversations and improve customer engagement." }),
        /* @__PURE__ */ jsx(Link, { href: route("app.chatbots.create", {}), children: /* @__PURE__ */ jsxs(Button, { className: "bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 shadow-lg shadow-purple-500/50", children: [
          /* @__PURE__ */ jsx(Plus, { className: "h-4 w-4 mr-2" }),
          "Create Your First Bot"
        ] }) })
      ] }) }) : /* @__PURE__ */ jsx("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6", children: bots.map((bot) => /* @__PURE__ */ jsxs(Card, { className: "border-0 shadow-lg hover:shadow-xl transition-all duration-300 group overflow-hidden", children: [
        /* @__PURE__ */ jsx(CardHeader, { className: "bg-gradient-to-r from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 pb-4", children: /* @__PURE__ */ jsxs("div", { className: "flex items-start justify-between", children: [
          /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3 flex-1", children: [
            /* @__PURE__ */ jsx("div", { className: "p-2 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl group-hover:scale-110 transition-transform duration-200", children: /* @__PURE__ */ jsx(Bot, { className: "h-5 w-5 text-white" }) }),
            /* @__PURE__ */ jsxs("div", { className: "flex-1 min-w-0", children: [
              /* @__PURE__ */ jsx(CardTitle, { className: "text-lg font-bold text-gray-900 dark:text-gray-100 truncate", children: bot.name }),
              bot.description && /* @__PURE__ */ jsx(CardDescription, { className: "mt-1 text-xs line-clamp-2", children: bot.description })
            ] })
          ] }),
          getStatusBadge(bot.status)
        ] }) }),
        /* @__PURE__ */ jsxs(CardContent, { className: "p-6 space-y-4", children: [
          /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
            /* @__PURE__ */ jsxs("div", { className: "p-3 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 rounded-xl", children: [
              /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 mb-1", children: [
                /* @__PURE__ */ jsx(Zap, { className: "h-3.5 w-3.5 text-purple-600 dark:text-purple-400" }),
                /* @__PURE__ */ jsx("span", { className: "text-xs font-semibold text-gray-500 dark:text-gray-400", children: "Flows" })
              ] }),
              /* @__PURE__ */ jsx("p", { className: "text-lg font-bold text-gray-900 dark:text-gray-100", children: bot.flows_count })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "p-3 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 rounded-xl", children: [
              /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 mb-1", children: [
                /* @__PURE__ */ jsx(Activity, { className: "h-3.5 w-3.5 text-blue-600 dark:text-blue-400" }),
                /* @__PURE__ */ jsx("span", { className: "text-xs font-semibold text-gray-500 dark:text-gray-400", children: "Executions" })
              ] }),
              /* @__PURE__ */ jsx("p", { className: "text-lg font-bold text-gray-900 dark:text-gray-100", children: bot.executions_count })
            ] })
          ] }),
          bot.status === "active" && bot.is_runnable === false && /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 p-2 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-200 dark:border-amber-700", children: [
            /* @__PURE__ */ jsx(AlertCircle, { className: "h-4 w-4 text-amber-600 dark:text-amber-400" }),
            /* @__PURE__ */ jsx("span", { className: "text-xs font-medium text-amber-800 dark:text-amber-200", children: "Active but no runnable flow" })
          ] }),
          bot.errors_count > 0 && /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 p-2 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800", children: [
            /* @__PURE__ */ jsx(AlertCircle, { className: "h-4 w-4 text-red-600 dark:text-red-400" }),
            /* @__PURE__ */ jsxs("span", { className: "text-xs font-medium text-red-800 dark:text-red-200", children: [
              bot.errors_count,
              " error",
              bot.errors_count !== 1 ? "s" : ""
            ] })
          ] }),
          bot.last_run_at && /* @__PURE__ */ jsxs("div", { className: "text-xs text-gray-500 dark:text-gray-400", children: [
            "Last run: ",
            new Date(bot.last_run_at).toLocaleString()
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 pt-4 border-t border-gray-200 dark:border-gray-700", children: [
            /* @__PURE__ */ jsx(
              Link,
              {
                href: route("app.chatbots.show", { bot: bot.id }),
                className: "flex-1",
                children: /* @__PURE__ */ jsxs(Button, { variant: "secondary", className: "w-full rounded-xl group-hover:bg-purple-50 dark:group-hover:bg-purple-900/20 transition-colors", children: [
                  /* @__PURE__ */ jsx(Edit, { className: "h-4 w-4 mr-2" }),
                  "Edit"
                ] })
              }
            ),
            /* @__PURE__ */ jsx(
              Button,
              {
                type: "button",
                variant: "danger",
                className: "rounded-xl",
                onClick: () => deleteBot(bot.id, bot.name),
                children: /* @__PURE__ */ jsx(Trash2, { className: "h-4 w-4" })
              }
            )
          ] })
        ] })
      ] }, bot.id)) })
    ] })
  ] });
}
export {
  ChatbotsIndex as default
};
