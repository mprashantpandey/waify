import { jsxs, jsx, Fragment } from "react/jsx-runtime";
import { usePage, Head, Link, router } from "@inertiajs/react";
import { P as PlatformShell } from "./PlatformShell-DKXjXK7A.js";
import { C as Card, a as CardHeader, b as CardTitle, c as CardContent, d as CardDescription } from "./Card-8uw03vLH.js";
import { B as Badge } from "./RealtimeProvider-DfTOxbgl.js";
import { L as Label } from "./Label-CbZtQFYj.js";
import { Filter, Activity, Building2, XCircle, CheckCircle, AlertCircle } from "lucide-react";
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
function ActivityLogs({
  logs,
  filters,
  filter_options
}) {
  const { auth } = usePage().props;
  const [localFilters, setLocalFilters] = useState(filters);
  const applyFilters = () => {
    router.get(route("platform.activity-logs"), localFilters, {
      preserveState: true,
      preserveScroll: true
    });
  };
  const getTypeBadge = (type) => {
    const typeMap = {
      webhook_success: { variant: "success", label: "Webhook" },
      webhook_error: { variant: "danger", label: "Webhook Error" },
      system_error: { variant: "danger", label: "System Error" },
      workspace_status_change: { variant: "warning", label: "Workspace" },
      user_action: { variant: "info", label: "User Action" },
      api_call: { variant: "info", label: "API Call" }
    };
    const config = typeMap[type] || { variant: "default", label: type };
    return /* @__PURE__ */ jsx(Badge, { variant: config.variant, children: config.label });
  };
  const getTypeIcon = (type) => {
    if (type.includes("error")) return /* @__PURE__ */ jsx(XCircle, { className: "h-4 w-4 text-red-600 dark:text-red-400" });
    if (type.includes("success")) return /* @__PURE__ */ jsx(CheckCircle, { className: "h-4 w-4 text-green-600 dark:text-green-400" });
    return /* @__PURE__ */ jsx(AlertCircle, { className: "h-4 w-4 text-yellow-600 dark:text-yellow-400" });
  };
  return /* @__PURE__ */ jsxs(PlatformShell, { auth, children: [
    /* @__PURE__ */ jsx(Head, { title: "Activity Logs" }),
    /* @__PURE__ */ jsxs("div", { className: "space-y-6", children: [
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("h1", { className: "text-2xl font-bold text-gray-900 dark:text-gray-100", children: "Activity Logs" }),
        /* @__PURE__ */ jsx("p", { className: "mt-1 text-sm text-gray-500 dark:text-gray-400", children: "Audit trail and system activity monitoring" })
      ] }),
      /* @__PURE__ */ jsxs(Card, { children: [
        /* @__PURE__ */ jsx(CardHeader, { children: /* @__PURE__ */ jsxs(CardTitle, { className: "flex items-center gap-2", children: [
          /* @__PURE__ */ jsx(Filter, { className: "h-5 w-5" }),
          "Filters"
        ] }) }),
        /* @__PURE__ */ jsx(CardContent, { children: /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 md:grid-cols-3 gap-4", children: [
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx(Label, { htmlFor: "filter-type", children: "Type" }),
            /* @__PURE__ */ jsxs(
              "select",
              {
                id: "filter-type",
                value: localFilters.type || "",
                onChange: (e) => setLocalFilters({ ...localFilters, type: e.target.value || void 0 }),
                className: "w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100",
                children: [
                  /* @__PURE__ */ jsx("option", { value: "", children: "All Types" }),
                  filter_options.types.map((type) => /* @__PURE__ */ jsx("option", { value: type, children: type.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase()) }, type))
                ]
              }
            )
          ] }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx(Label, { htmlFor: "filter-workspace", children: "Workspace" }),
            /* @__PURE__ */ jsxs(
              "select",
              {
                id: "filter-workspace",
                value: localFilters.workspace_id || "",
                onChange: (e) => setLocalFilters({ ...localFilters, workspace_id: e.target.value || void 0 }),
                className: "w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100",
                children: [
                  /* @__PURE__ */ jsx("option", { value: "", children: "All Workspaces" }),
                  filter_options.workspaces.map((workspace) => /* @__PURE__ */ jsx("option", { value: workspace.id, children: workspace.name }, workspace.id))
                ]
              }
            )
          ] }),
          /* @__PURE__ */ jsx("div", { className: "flex items-end", children: /* @__PURE__ */ jsx(
            "button",
            {
              onClick: applyFilters,
              className: "w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors",
              children: "Apply Filters"
            }
          ) })
        ] }) })
      ] }),
      /* @__PURE__ */ jsxs(Card, { children: [
        /* @__PURE__ */ jsx(CardHeader, { children: /* @__PURE__ */ jsx("div", { className: "flex items-center justify-between", children: /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx(CardTitle, { children: "Activity Logs" }),
          /* @__PURE__ */ jsxs(CardDescription, { children: [
            logs.total,
            " total log entries"
          ] })
        ] }) }) }),
        /* @__PURE__ */ jsx(CardContent, { children: logs.data.length === 0 ? /* @__PURE__ */ jsxs("div", { className: "text-center py-12", children: [
          /* @__PURE__ */ jsx(Activity, { className: "h-12 w-12 mx-auto text-gray-400 mb-4" }),
          /* @__PURE__ */ jsx("p", { className: "text-gray-500 dark:text-gray-400", children: "No activity logs found" })
        ] }) : /* @__PURE__ */ jsxs(Fragment, { children: [
          /* @__PURE__ */ jsx("div", { className: "overflow-x-auto", children: /* @__PURE__ */ jsxs("table", { className: "min-w-full divide-y divide-gray-200 dark:divide-gray-800", children: [
            /* @__PURE__ */ jsx("thead", { className: "bg-gray-50 dark:bg-gray-900", children: /* @__PURE__ */ jsxs("tr", { children: [
              /* @__PURE__ */ jsx("th", { className: "px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase", children: "Type" }),
              /* @__PURE__ */ jsx("th", { className: "px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase", children: "Description" }),
              /* @__PURE__ */ jsx("th", { className: "px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase", children: "Workspace" }),
              /* @__PURE__ */ jsx("th", { className: "px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase", children: "Time" }),
              /* @__PURE__ */ jsx("th", { className: "px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase", children: "Details" })
            ] }) }),
            /* @__PURE__ */ jsx("tbody", { className: "bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700", children: logs.data.map((log) => /* @__PURE__ */ jsxs("tr", { className: "hover:bg-gray-50 dark:hover:bg-gray-700", children: [
              /* @__PURE__ */ jsx("td", { className: "px-6 py-4 whitespace-nowrap", children: /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
                getTypeIcon(log.type),
                getTypeBadge(log.type)
              ] }) }),
              /* @__PURE__ */ jsx("td", { className: "px-6 py-4", children: /* @__PURE__ */ jsx("p", { className: "text-sm text-gray-900 dark:text-gray-100", children: log.description }) }),
              /* @__PURE__ */ jsx("td", { className: "px-6 py-4 whitespace-nowrap", children: log.workspace_id ? /* @__PURE__ */ jsxs(
                Link,
                {
                  href: route("platform.workspaces.show", { workspace: log.workspace_id }),
                  className: "flex items-center gap-1 text-sm text-blue-600 dark:text-blue-400 hover:underline",
                  children: [
                    /* @__PURE__ */ jsx(Building2, { className: "h-3 w-3" }),
                    "Workspace #",
                    log.workspace_id
                  ]
                }
              ) : /* @__PURE__ */ jsx("span", { className: "text-sm text-gray-400", children: "N/A" }) }),
              /* @__PURE__ */ jsx("td", { className: "px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400", children: new Date(log.created_at).toLocaleString() }),
              /* @__PURE__ */ jsx("td", { className: "px-6 py-4 whitespace-nowrap", children: Object.keys(log.metadata || {}).length > 0 && /* @__PURE__ */ jsxs("details", { className: "cursor-pointer", children: [
                /* @__PURE__ */ jsx("summary", { className: "text-xs text-blue-600 dark:text-blue-400 hover:underline", children: "View Details" }),
                /* @__PURE__ */ jsx("pre", { className: "mt-2 text-xs bg-gray-900 text-gray-100 p-2 rounded overflow-auto max-h-40", children: JSON.stringify(log.metadata, null, 2) })
              ] }) })
            ] }, log.id)) })
          ] }) }),
          logs.last_page > 1 && /* @__PURE__ */ jsxs("div", { className: "mt-4 flex items-center justify-between", children: [
            /* @__PURE__ */ jsxs("div", { className: "text-sm text-gray-700 dark:text-gray-300", children: [
              "Showing ",
              logs.per_page * (logs.current_page - 1) + 1,
              " to",
              " ",
              Math.min(logs.per_page * logs.current_page, logs.total),
              " of",
              " ",
              logs.total,
              " results"
            ] }),
            /* @__PURE__ */ jsx("div", { className: "flex gap-2", children: Array.from({ length: logs.last_page }, (_, i) => i + 1).map((page) => /* @__PURE__ */ jsx(
              "button",
              {
                onClick: () => {
                  router.get(route("platform.activity-logs"), { ...localFilters, page }, {
                    preserveState: true,
                    preserveScroll: true
                  });
                },
                className: `px-3 py-2 rounded-md text-sm ${page === logs.current_page ? "bg-blue-600 text-white" : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"}`,
                children: page
              },
              page
            )) })
          ] })
        ] }) })
      ] })
    ] })
  ] });
}
export {
  ActivityLogs as default
};
