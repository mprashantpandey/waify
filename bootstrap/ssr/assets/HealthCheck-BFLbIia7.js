import { jsxs, jsx } from "react/jsx-runtime";
import { useState, useEffect } from "react";
import { Head, Link } from "@inertiajs/react";
import { A as AppShell } from "./AppShell-Dx9mYfem.js";
import { C as Card, b as CardHeader, c as CardTitle, d as CardDescription, a as CardContent } from "./Card-DLPTnTfC.js";
import { B as Badge } from "./Badge-CHx1ViYT.js";
import { B as Button } from "./Button-ymbdH_NY.js";
import { Activity, AlertCircle, ArrowLeft, RefreshCw, AlertTriangle, CheckCircle2, Phone, Zap, Shield, Clock, Link as Link$1 } from "lucide-react";
import { u as useToast } from "./useToast-DNfJQ6ZA.js";
import "./useConfirm-BKf7Nv1N.js";
import axios from "axios";
import { A as Alert } from "./Alert-DWa0cnrh.js";
import "./utils-B2ZNUmII.js";
import "clsx";
import "tailwind-merge";
import "./RealtimeProvider-Dletx5Ny.js";
import "laravel-echo";
import "pusher-js";
import "./GlobalFlashHandler-CNoF0uzm.js";
import "./BrandingWrapper-B2Mh0bYb.js";
import "./CookieConsentBanner-BJ5KL4CC.js";
function ConnectionHealthCheck({
  account,
  connection
}) {
  const { toast } = useToast();
  const [health, setHealth] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const fetchHealth = async (showRefreshing = false) => {
    if (showRefreshing) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }
    try {
      const response = await axios.get(
        route("app.whatsapp.connections.health.api", {
          connection: connection.slug ?? connection.id
        })
      );
      setHealth(response.data);
    } catch (error) {
      toast.error("Failed to fetch health check data");
      console.error("Health check error:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };
  useEffect(() => {
    fetchHealth();
  }, [connection.slug, connection.id]);
  const getStatusBadge = (status) => {
    const variants = {
      healthy: "success",
      warning: "warning",
      unhealthy: "danger",
      unknown: "default"
    };
    return /* @__PURE__ */ jsx(Badge, { variant: variants[status] || "default", className: "px-3 py-1", children: status.charAt(0).toUpperCase() + status.slice(1) });
  };
  const getStatusIcon = (status) => {
    switch (status) {
      case "healthy":
        return /* @__PURE__ */ jsx(CheckCircle2, { className: "h-5 w-5 text-green-600 dark:text-green-400" });
      case "warning":
        return /* @__PURE__ */ jsx(AlertTriangle, { className: "h-5 w-5 text-yellow-600 dark:text-yellow-400" });
      case "unhealthy":
        return /* @__PURE__ */ jsx(AlertCircle, { className: "h-5 w-5 text-red-600 dark:text-red-400" });
      default:
        return /* @__PURE__ */ jsx(Activity, { className: "h-5 w-5 text-gray-400" });
    }
  };
  const getCheckIcon = (checkName) => {
    const iconMap = {
      connection_active: Activity,
      webhook_subscription: Link$1,
      webhook_activity: Clock,
      access_token: Shield,
      api_connectivity: Zap,
      phone_number: Phone
    };
    const Icon = iconMap[checkName] || Activity;
    return /* @__PURE__ */ jsx(Icon, { className: "h-4 w-4" });
  };
  if (loading) {
    return /* @__PURE__ */ jsxs(AppShell, { children: [
      /* @__PURE__ */ jsx(Head, { title: `${connection.name} - Health Check` }),
      /* @__PURE__ */ jsx("div", { className: "space-y-8", children: /* @__PURE__ */ jsxs("div", { className: "text-center py-16", children: [
        /* @__PURE__ */ jsx(Activity, { className: "h-12 w-12 text-gray-400 animate-pulse mx-auto mb-4" }),
        /* @__PURE__ */ jsx("p", { className: "text-gray-500 dark:text-gray-400", children: "Loading health check..." })
      ] }) })
    ] });
  }
  if (!health) {
    return /* @__PURE__ */ jsxs(AppShell, { children: [
      /* @__PURE__ */ jsx(Head, { title: `${connection.name} - Health Check` }),
      /* @__PURE__ */ jsx("div", { className: "space-y-8", children: /* @__PURE__ */ jsxs(Alert, { variant: "error", children: [
        /* @__PURE__ */ jsx(AlertCircle, { className: "h-5 w-5" }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("p", { className: "font-semibold", children: "Failed to load health check" }),
          /* @__PURE__ */ jsx("p", { className: "text-sm mt-1", children: "Please try again or contact support." })
        ] })
      ] }) })
    ] });
  }
  const overallStatusColor = {
    healthy: "from-green-500 to-green-600",
    warning: "from-yellow-500 to-yellow-600",
    unhealthy: "from-red-500 to-red-600",
    unknown: "from-gray-500 to-gray-600"
  }[health.overall_status] || "from-gray-500 to-gray-600";
  return /* @__PURE__ */ jsxs(AppShell, { children: [
    /* @__PURE__ */ jsx(Head, { title: `${connection.name} - Health Check` }),
    /* @__PURE__ */ jsxs("div", { className: "space-y-8", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between", children: [
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsxs(
            Link,
            {
              href: route("app.whatsapp.connections.edit", {
                connection: connection.slug ?? connection.id
              }),
              className: "inline-flex items-center gap-2 text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors mb-4",
              children: [
                /* @__PURE__ */ jsx(ArrowLeft, { className: "h-4 w-4" }),
                "Back to Connection"
              ]
            }
          ),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsxs("h1", { className: "text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-gray-100 dark:to-gray-300 bg-clip-text text-transparent flex items-center gap-3", children: [
              /* @__PURE__ */ jsx(Activity, { className: "h-8 w-8 text-blue-600 dark:text-blue-400" }),
              "Health Check"
            ] }),
            /* @__PURE__ */ jsx("p", { className: "mt-2 text-sm text-gray-600 dark:text-gray-400", children: connection.name })
          ] })
        ] }),
        /* @__PURE__ */ jsxs(
          Button,
          {
            onClick: () => fetchHealth(true),
            disabled: refreshing,
            variant: "secondary",
            className: "rounded-xl",
            children: [
              /* @__PURE__ */ jsx(RefreshCw, { className: `h-4 w-4 mr-2 ${refreshing ? "animate-spin" : ""}` }),
              refreshing ? "Refreshing..." : "Refresh"
            ]
          }
        )
      ] }),
      /* @__PURE__ */ jsxs(Card, { className: "border-0 shadow-lg", children: [
        /* @__PURE__ */ jsx(CardHeader, { className: `bg-gradient-to-r ${overallStatusColor} text-white`, children: /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between", children: [
          /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3", children: [
            /* @__PURE__ */ jsx("div", { className: "p-2 bg-white/20 rounded-xl", children: getStatusIcon(health.overall_status) }),
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx(CardTitle, { className: "text-xl font-bold text-white", children: "Overall Status" }),
              /* @__PURE__ */ jsxs(CardDescription, { className: "text-white/90", children: [
                "Last checked: ",
                new Date(health.timestamp).toLocaleString()
              ] })
            ] })
          ] }),
          getStatusBadge(health.overall_status)
        ] }) }),
        /* @__PURE__ */ jsx(CardContent, { className: "p-6", children: /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-2 md:grid-cols-4 gap-4", children: [
          /* @__PURE__ */ jsxs("div", { className: "p-4 bg-gradient-to-r from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 rounded-xl border border-green-200 dark:border-green-800", children: [
            /* @__PURE__ */ jsx("div", { className: "text-2xl font-bold text-green-700 dark:text-green-300", children: health.summary.healthy }),
            /* @__PURE__ */ jsx("div", { className: "text-xs font-semibold text-green-600 dark:text-green-400 uppercase tracking-wider mt-1", children: "Healthy" })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "p-4 bg-gradient-to-r from-yellow-50 to-yellow-100 dark:from-yellow-900/20 dark:to-yellow-800/20 rounded-xl border border-yellow-200 dark:border-yellow-800", children: [
            /* @__PURE__ */ jsx("div", { className: "text-2xl font-bold text-yellow-700 dark:text-yellow-300", children: health.summary.warnings }),
            /* @__PURE__ */ jsx("div", { className: "text-xs font-semibold text-yellow-600 dark:text-yellow-400 uppercase tracking-wider mt-1", children: "Warnings" })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "p-4 bg-gradient-to-r from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-800/20 rounded-xl border border-red-200 dark:border-red-800", children: [
            /* @__PURE__ */ jsx("div", { className: "text-2xl font-bold text-red-700 dark:text-red-300", children: health.summary.unhealthy }),
            /* @__PURE__ */ jsx("div", { className: "text-xs font-semibold text-red-600 dark:text-red-400 uppercase tracking-wider mt-1", children: "Unhealthy" })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "p-4 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 rounded-xl border border-gray-200 dark:border-gray-700", children: [
            /* @__PURE__ */ jsx("div", { className: "text-2xl font-bold text-gray-700 dark:text-gray-300", children: health.summary.total_checks }),
            /* @__PURE__ */ jsx("div", { className: "text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider mt-1", children: "Total Checks" })
          ] })
        ] }) })
      ] }),
      /* @__PURE__ */ jsx("div", { className: "space-y-4", children: Object.entries(health.checks).map(([checkName, check]) => {
        const statusColors = {
          healthy: "from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 border-green-200 dark:border-green-800",
          warning: "from-yellow-50 to-yellow-100 dark:from-yellow-900/20 dark:to-yellow-800/20 border-yellow-200 dark:border-yellow-800",
          unhealthy: "from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-800/20 border-red-200 dark:border-red-800",
          unknown: "from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 border-gray-200 dark:border-gray-700"
        }[check.status] || "from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 border-gray-200 dark:border-gray-700";
        return /* @__PURE__ */ jsx(Card, { className: `border-0 shadow-lg ${statusColors.split(" ")[0]} border-2`, children: /* @__PURE__ */ jsxs(CardContent, { className: "p-6", children: [
          /* @__PURE__ */ jsxs("div", { className: "flex items-start justify-between mb-4", children: [
            /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3", children: [
              /* @__PURE__ */ jsx("div", { className: `p-2 rounded-xl ${check.status === "healthy" ? "bg-green-500" : check.status === "warning" ? "bg-yellow-500" : check.status === "unhealthy" ? "bg-red-500" : "bg-gray-500"}`, children: getCheckIcon(checkName) }),
              /* @__PURE__ */ jsxs("div", { children: [
                /* @__PURE__ */ jsx("h3", { className: "font-semibold text-gray-900 dark:text-gray-100 capitalize", children: checkName.replace(/_/g, " ") }),
                /* @__PURE__ */ jsx("p", { className: "text-sm text-gray-600 dark:text-gray-400 mt-0.5", children: check.message })
              ] })
            ] }),
            getStatusBadge(check.status)
          ] }),
          check.error && /* @__PURE__ */ jsxs(Alert, { variant: "error", className: "mb-4", children: [
            /* @__PURE__ */ jsx(AlertCircle, { className: "h-4 w-4" }),
            /* @__PURE__ */ jsx("p", { className: "text-sm", children: check.error })
          ] }),
          check.details && Object.keys(check.details).length > 0 && /* @__PURE__ */ jsx("div", { className: "mt-4 p-4 bg-white dark:bg-gray-950 rounded-xl border border-gray-200 dark:border-gray-700", children: /* @__PURE__ */ jsx("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-3", children: Object.entries(check.details).map(([key, value]) => /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("div", { className: "text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1", children: key.replace(/_/g, " ") }),
            /* @__PURE__ */ jsx("div", { className: "text-sm font-medium text-gray-900 dark:text-gray-100", children: value === null || value === "" ? "—" : String(value) })
          ] }, key)) }) })
        ] }) }, checkName);
      }) })
    ] })
  ] });
}
export {
  ConnectionHealthCheck as default
};
