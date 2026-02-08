import { jsxs, jsx, Fragment } from "react/jsx-runtime";
import { usePage, Head } from "@inertiajs/react";
import { P as PlatformShell } from "./PlatformShell-COfIDu4w.js";
import { C as Card, b as CardHeader, c as CardTitle, d as CardDescription, a as CardContent } from "./Card-DLPTnTfC.js";
import { B as Badge } from "./Badge-CHx1ViYT.js";
import { CheckCircle, XCircle, Activity, HardDrive, Database, AlertTriangle } from "lucide-react";
import "react";
import "./RealtimeProvider-Dletx5Ny.js";
import "laravel-echo";
import "pusher-js";
import "./BrandingWrapper-B2Mh0bYb.js";
import "./GlobalFlashHandler-CNoF0uzm.js";
import "./useToast-DNfJQ6ZA.js";
import "./Button-ymbdH_NY.js";
import "./utils-B2ZNUmII.js";
import "clsx";
import "tailwind-merge";
import "axios";
function SystemHealth({
  webhook_health,
  connection_details,
  queue_status,
  storage_status,
  database_status,
  recent_errors
}) {
  const { auth } = usePage().props;
  const formatBytes = (bytes) => {
    if (bytes === null || bytes === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + " " + sizes[i];
  };
  const getHealthStatus = (isHealthy) => {
    return isHealthy ? /* @__PURE__ */ jsxs(Badge, { variant: "success", className: "flex items-center gap-1", children: [
      /* @__PURE__ */ jsx(CheckCircle, { className: "h-3 w-3" }),
      "Healthy"
    ] }) : /* @__PURE__ */ jsxs(Badge, { variant: "danger", className: "flex items-center gap-1", children: [
      /* @__PURE__ */ jsx(XCircle, { className: "h-3 w-3" }),
      "Unhealthy"
    ] });
  };
  return /* @__PURE__ */ jsxs(PlatformShell, { auth, children: [
    /* @__PURE__ */ jsx(Head, { title: "System Health" }),
    /* @__PURE__ */ jsxs("div", { className: "space-y-6", children: [
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("h1", { className: "text-2xl font-bold text-gray-900 dark:text-gray-100", children: "System Health" }),
        /* @__PURE__ */ jsx("p", { className: "mt-1 text-sm text-gray-500 dark:text-gray-400", children: "Monitor system components and infrastructure status" })
      ] }),
      /* @__PURE__ */ jsxs(Card, { children: [
        /* @__PURE__ */ jsxs(CardHeader, { children: [
          /* @__PURE__ */ jsx(CardTitle, { children: "Webhook Health" }),
          /* @__PURE__ */ jsx(CardDescription, { children: "WhatsApp webhook subscription and activity status" })
        ] }),
        /* @__PURE__ */ jsxs(CardContent, { children: [
          /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 md:grid-cols-4 gap-4", children: [
            /* @__PURE__ */ jsxs("div", { className: "p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg", children: [
              /* @__PURE__ */ jsx("p", { className: "text-sm font-medium text-gray-600 dark:text-gray-400 mb-1", children: "Total Connections" }),
              /* @__PURE__ */ jsx("p", { className: "text-2xl font-bold text-gray-900 dark:text-gray-100", children: webhook_health.total })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "p-4 bg-green-50 dark:bg-green-900/20 rounded-lg", children: [
              /* @__PURE__ */ jsx("p", { className: "text-sm font-medium text-gray-600 dark:text-gray-400 mb-1", children: "Subscribed" }),
              /* @__PURE__ */ jsx("p", { className: "text-2xl font-bold text-green-600 dark:text-green-400", children: webhook_health.subscribed })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg", children: [
              /* @__PURE__ */ jsx("p", { className: "text-sm font-medium text-gray-600 dark:text-gray-400 mb-1", children: "Recent Activity (24h)" }),
              /* @__PURE__ */ jsx("p", { className: "text-2xl font-bold text-yellow-600 dark:text-yellow-400", children: webhook_health.recent_activity })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "p-4 bg-red-50 dark:bg-red-900/20 rounded-lg", children: [
              /* @__PURE__ */ jsx("p", { className: "text-sm font-medium text-gray-600 dark:text-gray-400 mb-1", children: "With Errors" }),
              /* @__PURE__ */ jsx("p", { className: "text-2xl font-bold text-red-600 dark:text-red-400", children: webhook_health.with_errors })
            ] })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "mt-6", children: [
            /* @__PURE__ */ jsx("h3", { className: "text-sm font-semibold text-gray-900 dark:text-gray-100 mb-3", children: "Connection Details" }),
            /* @__PURE__ */ jsx("div", { className: "space-y-2", children: connection_details.map((conn) => /* @__PURE__ */ jsxs(
              "div",
              {
                className: "flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg",
                children: [
                  /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3", children: [
                    conn.is_healthy ? /* @__PURE__ */ jsx(CheckCircle, { className: "h-5 w-5 text-green-600 dark:text-green-400" }) : /* @__PURE__ */ jsx(XCircle, { className: "h-5 w-5 text-red-600 dark:text-red-400" }),
                    /* @__PURE__ */ jsxs("div", { children: [
                      /* @__PURE__ */ jsx("p", { className: "text-sm font-medium text-gray-900 dark:text-gray-100", children: conn.name }),
                      /* @__PURE__ */ jsxs("p", { className: "text-xs text-gray-500 dark:text-gray-400", children: [
                        "Tenant ID: ",
                        conn.account_id
                      ] })
                    ] })
                  ] }),
                  /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-4", children: [
                    conn.last_received_at && /* @__PURE__ */ jsxs("div", { className: "text-right", children: [
                      /* @__PURE__ */ jsx("p", { className: "text-xs text-gray-500 dark:text-gray-400", children: "Last Activity" }),
                      /* @__PURE__ */ jsx("p", { className: "text-xs font-medium text-gray-900 dark:text-gray-100", children: new Date(conn.last_received_at).toLocaleString() })
                    ] }),
                    getHealthStatus(conn.is_healthy)
                  ] })
                ]
              },
              conn.id
            )) })
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 lg:grid-cols-3 gap-6", children: [
        /* @__PURE__ */ jsxs(Card, { children: [
          /* @__PURE__ */ jsx(CardHeader, { children: /* @__PURE__ */ jsxs(CardTitle, { className: "flex items-center gap-2", children: [
            /* @__PURE__ */ jsx(Activity, { className: "h-5 w-5" }),
            "Queue Status"
          ] }) }),
          /* @__PURE__ */ jsxs(CardContent, { className: "space-y-3", children: [
            /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between", children: [
              /* @__PURE__ */ jsx("span", { className: "text-sm text-gray-600 dark:text-gray-400", children: "Driver" }),
              /* @__PURE__ */ jsx(Badge, { variant: "info", children: queue_status.driver })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between", children: [
              /* @__PURE__ */ jsx("span", { className: "text-sm text-gray-600 dark:text-gray-400", children: "Connection" }),
              /* @__PURE__ */ jsx("span", { className: "text-sm font-medium text-gray-900 dark:text-gray-100", children: queue_status.connection || "N/A" })
            ] }),
            queue_status.pending_jobs !== null && /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between", children: [
              /* @__PURE__ */ jsx("span", { className: "text-sm text-gray-600 dark:text-gray-400", children: "Pending Jobs" }),
              /* @__PURE__ */ jsx("span", { className: "text-sm font-medium text-gray-900 dark:text-gray-100", children: queue_status.pending_jobs })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between", children: [
              /* @__PURE__ */ jsx("span", { className: "text-sm text-gray-600 dark:text-gray-400", children: "Failed Jobs" }),
              /* @__PURE__ */ jsx(Badge, { variant: queue_status.failed_jobs && queue_status.failed_jobs > 0 ? "danger" : "success", children: queue_status.failed_jobs ?? "N/A" })
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxs(Card, { children: [
          /* @__PURE__ */ jsx(CardHeader, { children: /* @__PURE__ */ jsxs(CardTitle, { className: "flex items-center gap-2", children: [
            /* @__PURE__ */ jsx(HardDrive, { className: "h-5 w-5" }),
            "Storage Status"
          ] }) }),
          /* @__PURE__ */ jsxs(CardContent, { className: "space-y-3", children: [
            /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between", children: [
              /* @__PURE__ */ jsx("span", { className: "text-sm text-gray-600 dark:text-gray-400", children: "Public Available" }),
              storage_status.public_available ? /* @__PURE__ */ jsx(CheckCircle, { className: "h-5 w-5 text-green-600 dark:text-green-400" }) : /* @__PURE__ */ jsx(XCircle, { className: "h-5 w-5 text-red-600 dark:text-red-400" })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between", children: [
              /* @__PURE__ */ jsx("span", { className: "text-sm text-gray-600 dark:text-gray-400", children: "Public Writable" }),
              storage_status.public_writable ? /* @__PURE__ */ jsx(CheckCircle, { className: "h-5 w-5 text-green-600 dark:text-green-400" }) : /* @__PURE__ */ jsx(XCircle, { className: "h-5 w-5 text-red-600 dark:text-red-400" })
            ] }),
            storage_status.public_size !== null && /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between", children: [
              /* @__PURE__ */ jsx("span", { className: "text-sm text-gray-600 dark:text-gray-400", children: "Public Size" }),
              /* @__PURE__ */ jsx("span", { className: "text-sm font-medium text-gray-900 dark:text-gray-100", children: formatBytes(storage_status.public_size) })
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxs(Card, { children: [
          /* @__PURE__ */ jsx(CardHeader, { children: /* @__PURE__ */ jsxs(CardTitle, { className: "flex items-center gap-2", children: [
            /* @__PURE__ */ jsx(Database, { className: "h-5 w-5" }),
            "Database Status"
          ] }) }),
          /* @__PURE__ */ jsxs(CardContent, { className: "space-y-3", children: [
            /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between", children: [
              /* @__PURE__ */ jsx("span", { className: "text-sm text-gray-600 dark:text-gray-400", children: "Connection" }),
              database_status.connected ? /* @__PURE__ */ jsx(CheckCircle, { className: "h-5 w-5 text-green-600 dark:text-green-400" }) : /* @__PURE__ */ jsx(XCircle, { className: "h-5 w-5 text-red-600 dark:text-red-400" })
            ] }),
            database_status.connected && /* @__PURE__ */ jsxs(Fragment, { children: [
              /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between", children: [
                /* @__PURE__ */ jsx("span", { className: "text-sm text-gray-600 dark:text-gray-400", children: "Driver" }),
                /* @__PURE__ */ jsx(Badge, { variant: "info", children: database_status.driver })
              ] }),
              /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between", children: [
                /* @__PURE__ */ jsx("span", { className: "text-sm text-gray-600 dark:text-gray-400", children: "Database" }),
                /* @__PURE__ */ jsx("span", { className: "text-sm font-medium text-gray-900 dark:text-gray-100", children: database_status.connection })
              ] })
            ] }),
            database_status.error && /* @__PURE__ */ jsx("div", { className: "p-2 bg-red-50 dark:bg-red-900/20 rounded text-xs text-red-600 dark:text-red-400", children: database_status.error })
          ] })
        ] })
      ] }),
      recent_errors.length > 0 && /* @__PURE__ */ jsxs(Card, { children: [
        /* @__PURE__ */ jsxs(CardHeader, { children: [
          /* @__PURE__ */ jsxs(CardTitle, { className: "flex items-center gap-2", children: [
            /* @__PURE__ */ jsx(AlertTriangle, { className: "h-5 w-5 text-yellow-600 dark:text-yellow-400" }),
            "Recent Errors"
          ] }),
          /* @__PURE__ */ jsx(CardDescription, { children: "Failed jobs and system errors" })
        ] }),
        /* @__PURE__ */ jsx(CardContent, { children: /* @__PURE__ */ jsx("div", { className: "space-y-3", children: recent_errors.map((error) => /* @__PURE__ */ jsxs(
          "div",
          {
            className: "p-4 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800",
            children: [
              /* @__PURE__ */ jsxs("div", { className: "flex items-start justify-between mb-2", children: [
                /* @__PURE__ */ jsxs("div", { children: [
                  /* @__PURE__ */ jsx("p", { className: "text-sm font-medium text-gray-900 dark:text-gray-100", children: error.payload?.displayName || error.payload?.job || "Unknown Job" }),
                  /* @__PURE__ */ jsxs("p", { className: "text-xs text-gray-500 dark:text-gray-400 mt-1", children: [
                    "Queue: ",
                    error.queue,
                    " | Connection: ",
                    error.connection
                  ] })
                ] }),
                /* @__PURE__ */ jsx("span", { className: "text-xs text-gray-500 dark:text-gray-400", children: new Date(error.failed_at).toLocaleString() })
              ] }),
              /* @__PURE__ */ jsxs("details", { className: "mt-2", children: [
                /* @__PURE__ */ jsx("summary", { className: "text-xs text-red-600 dark:text-red-400 cursor-pointer hover:underline", children: "View Error Details" }),
                /* @__PURE__ */ jsx("pre", { className: "mt-2 text-xs bg-gray-900 text-gray-100 p-2 rounded overflow-auto max-h-40", children: error.exception })
              ] })
            ]
          },
          error.id
        )) }) })
      ] })
    ] })
  ] });
}
export {
  SystemHealth as default
};
