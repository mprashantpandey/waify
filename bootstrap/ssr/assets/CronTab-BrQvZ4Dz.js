import { jsxs, jsx } from "react/jsx-runtime";
import { useState } from "react";
import { C as Card, b as CardHeader, c as CardTitle, d as CardDescription, a as CardContent } from "./Card-DLPTnTfC.js";
import { B as Button } from "./Button-ymbdH_NY.js";
import { ServerCog, Clock3, Copy, CheckCircle2, ShieldAlert, AlertTriangle } from "lucide-react";
import "./utils-B2ZNUmII.js";
import "clsx";
import "tailwind-merge";
function CronTab({ cron }) {
  const [copiedId, setCopiedId] = useState(null);
  const copy = async (id, value) => {
    try {
      await navigator.clipboard.writeText(value);
      setCopiedId(id);
      window.setTimeout(() => setCopiedId(null), 1500);
    } catch {
      setCopiedId(null);
    }
  };
  const statusBadge = (status) => {
    if (status === "healthy") {
      return /* @__PURE__ */ jsxs("span", { className: "inline-flex items-center gap-1 rounded-full bg-green-100 px-2 py-0.5 text-xs font-semibold text-green-700 dark:bg-green-900/30 dark:text-green-300", children: [
        /* @__PURE__ */ jsx(CheckCircle2, { className: "h-3.5 w-3.5" }),
        "Healthy"
      ] });
    }
    if (status === "critical") {
      return /* @__PURE__ */ jsxs("span", { className: "inline-flex items-center gap-1 rounded-full bg-red-100 px-2 py-0.5 text-xs font-semibold text-red-700 dark:bg-red-900/30 dark:text-red-300", children: [
        /* @__PURE__ */ jsx(ShieldAlert, { className: "h-3.5 w-3.5" }),
        "Critical"
      ] });
    }
    return /* @__PURE__ */ jsxs("span", { className: "inline-flex items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 text-xs font-semibold text-amber-700 dark:bg-amber-900/30 dark:text-amber-300", children: [
      /* @__PURE__ */ jsx(AlertTriangle, { className: "h-3.5 w-3.5" }),
      "Warning"
    ] });
  };
  return /* @__PURE__ */ jsxs("div", { className: "space-y-6", children: [
    /* @__PURE__ */ jsxs(Card, { children: [
      /* @__PURE__ */ jsxs(CardHeader, { children: [
        /* @__PURE__ */ jsxs(CardTitle, { className: "flex items-center gap-2", children: [
          /* @__PURE__ */ jsx(ServerCog, { className: "h-5 w-5" }),
          "Cron Commands"
        ] }),
        /* @__PURE__ */ jsxs(CardDescription, { children: [
          "Configure these commands in your hosting control panel. Timezone: ",
          cron.timezone
        ] })
      ] }),
      /* @__PURE__ */ jsx(CardContent, { className: "space-y-4", children: cron.commands.map((item) => /* @__PURE__ */ jsxs(
        "div",
        {
          className: "rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-900",
          children: [
            /* @__PURE__ */ jsxs("div", { className: "mb-2 flex items-start justify-between gap-4", children: [
              /* @__PURE__ */ jsxs("div", { children: [
                /* @__PURE__ */ jsx("div", { className: "text-sm font-semibold text-slate-900 dark:text-slate-100", children: item.title }),
                /* @__PURE__ */ jsx("p", { className: "mt-1 text-xs text-slate-600 dark:text-slate-400", children: item.description })
              ] }),
              /* @__PURE__ */ jsxs("span", { className: "inline-flex items-center gap-1 rounded-md bg-slate-100 px-2 py-1 text-xs font-semibold text-slate-700 dark:bg-slate-800 dark:text-slate-200", children: [
                /* @__PURE__ */ jsx(Clock3, { className: "h-3.5 w-3.5" }),
                item.schedule
              ] })
            ] }),
            /* @__PURE__ */ jsx("div", { className: "rounded-lg bg-slate-950 p-3 text-xs text-slate-100", children: /* @__PURE__ */ jsx("code", { className: "break-all", children: item.command }) }),
            /* @__PURE__ */ jsx("div", { className: "mt-3", children: /* @__PURE__ */ jsxs(
              Button,
              {
                type: "button",
                size: "sm",
                variant: "secondary",
                onClick: () => copy(item.id, item.command),
                children: [
                  /* @__PURE__ */ jsx(Copy, { className: "mr-2 h-4 w-4" }),
                  copiedId === item.id ? "Copied" : "Copy Command"
                ]
              }
            ) })
          ]
        },
        item.id
      )) })
    ] }),
    /* @__PURE__ */ jsxs(Card, { children: [
      /* @__PURE__ */ jsxs(CardHeader, { children: [
        /* @__PURE__ */ jsx(CardTitle, { children: "Background System Status" }),
        /* @__PURE__ */ jsx(CardDescription, { children: "Global system health inferred from queue, messages, and execution history." })
      ] }),
      /* @__PURE__ */ jsx(CardContent, { className: "space-y-4", children: cron.statuses.map((item) => /* @__PURE__ */ jsxs(
        "div",
        {
          className: "rounded-xl border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-900",
          children: [
            /* @__PURE__ */ jsxs("div", { className: "mb-2 flex items-center justify-between", children: [
              /* @__PURE__ */ jsx("div", { className: "text-sm font-semibold text-gray-900 dark:text-gray-100", children: item.label }),
              statusBadge(item.status)
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "mb-2 text-xs text-gray-500 dark:text-gray-400", children: [
              "Last activity: ",
              item.last_activity_at ? new Date(item.last_activity_at).toLocaleString() : "N/A"
            ] }),
            /* @__PURE__ */ jsx("div", { className: "grid grid-cols-1 gap-2 sm:grid-cols-2", children: Object.entries(item.metrics).map(([k, v]) => /* @__PURE__ */ jsxs(
              "div",
              {
                className: "rounded-lg border border-gray-100 bg-gray-50 px-3 py-2 text-xs dark:border-gray-700 dark:bg-gray-800",
                children: [
                  /* @__PURE__ */ jsx("span", { className: "font-medium text-gray-600 dark:text-gray-300", children: k }),
                  ": ",
                  /* @__PURE__ */ jsx("span", { className: "text-gray-900 dark:text-gray-100", children: String(v) })
                ]
              },
              k
            )) })
          ]
        },
        item.key
      )) })
    ] })
  ] });
}
export {
  CronTab as default
};
