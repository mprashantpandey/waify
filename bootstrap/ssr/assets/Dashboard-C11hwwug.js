import { jsx, jsxs } from "react/jsx-runtime";
import { P as PlatformShell } from "./PlatformShell-DKXjXK7A.js";
import { C as Card, c as CardContent, a as CardHeader, b as CardTitle, d as CardDescription } from "./Card-8uw03vLH.js";
import { B as Badge } from "./RealtimeProvider-DfTOxbgl.js";
import { Building2, MessageSquare, Link, CreditCard, Inbox, Send, CheckCircle, Clock, XCircle, AlertCircle, BarChart3 } from "lucide-react";
import { usePage, Link as Link$1 } from "@inertiajs/react";
import "react";
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
function PlatformDashboard({
  stats,
  recent_workspaces,
  message_trends,
  top_workspaces
}) {
  const { auth } = usePage().props;
  const getStatusBadge = (status) => {
    const statusMap = {
      active: { variant: "success", label: "Active" },
      suspended: { variant: "warning", label: "Suspended" },
      disabled: { variant: "danger", label: "Disabled" }
    };
    const config = statusMap[status] || { variant: "default", label: status };
    return /* @__PURE__ */ jsx(Badge, { variant: config.variant, children: config.label });
  };
  const formatNumber = (num) => {
    if (num >= 1e6) return (num / 1e6).toFixed(1) + "M";
    if (num >= 1e3) return (num / 1e3).toFixed(1) + "K";
    return num.toString();
  };
  return /* @__PURE__ */ jsx(PlatformShell, { auth, children: /* @__PURE__ */ jsxs("div", { className: "space-y-6", children: [
    /* @__PURE__ */ jsxs("div", { children: [
      /* @__PURE__ */ jsx("h1", { className: "text-2xl font-bold text-gray-900 dark:text-gray-100", children: "Platform Dashboard" }),
      /* @__PURE__ */ jsx("p", { className: "mt-1 text-sm text-gray-500 dark:text-gray-400", children: "Comprehensive overview of your WhatsApp Cloud Platform" })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6", children: [
      /* @__PURE__ */ jsx(Card, { children: /* @__PURE__ */ jsx(CardContent, { className: "pt-6", children: /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between", children: [
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("p", { className: "text-sm font-medium text-gray-600 dark:text-gray-400", children: "Total Workspaces" }),
          /* @__PURE__ */ jsx("p", { className: "text-3xl font-bold text-gray-900 dark:text-gray-100 mt-2", children: formatNumber(stats.total_workspaces) }),
          /* @__PURE__ */ jsxs("p", { className: "text-xs text-green-600 dark:text-green-400 mt-1", children: [
            stats.active_workspaces,
            " active"
          ] })
        ] }),
        /* @__PURE__ */ jsx("div", { className: "bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg", children: /* @__PURE__ */ jsx(Building2, { className: "h-8 w-8 text-blue-600 dark:text-blue-400" }) })
      ] }) }) }),
      /* @__PURE__ */ jsx(Card, { children: /* @__PURE__ */ jsx(CardContent, { className: "pt-6", children: /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between", children: [
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("p", { className: "text-sm font-medium text-gray-600 dark:text-gray-400", children: "Total Messages" }),
          /* @__PURE__ */ jsx("p", { className: "text-3xl font-bold text-gray-900 dark:text-gray-100 mt-2", children: formatNumber(stats.total_messages) }),
          /* @__PURE__ */ jsxs("p", { className: "text-xs text-blue-600 dark:text-blue-400 mt-1", children: [
            stats.messages_today,
            " today"
          ] })
        ] }),
        /* @__PURE__ */ jsx("div", { className: "bg-green-50 dark:bg-green-900/20 p-3 rounded-lg", children: /* @__PURE__ */ jsx(MessageSquare, { className: "h-8 w-8 text-green-600 dark:text-green-400" }) })
      ] }) }) }),
      /* @__PURE__ */ jsx(Card, { children: /* @__PURE__ */ jsx(CardContent, { className: "pt-6", children: /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between", children: [
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("p", { className: "text-sm font-medium text-gray-600 dark:text-gray-400", children: "Active Connections" }),
          /* @__PURE__ */ jsx("p", { className: "text-3xl font-bold text-gray-900 dark:text-gray-100 mt-2", children: stats.active_connections }),
          /* @__PURE__ */ jsxs("p", { className: "text-xs text-gray-500 dark:text-gray-400 mt-1", children: [
            stats.total_connections,
            " total"
          ] })
        ] }),
        /* @__PURE__ */ jsx("div", { className: "bg-purple-50 dark:bg-purple-900/20 p-3 rounded-lg", children: /* @__PURE__ */ jsx(Link, { className: "h-8 w-8 text-purple-600 dark:text-purple-400" }) })
      ] }) }) }),
      /* @__PURE__ */ jsx(Card, { children: /* @__PURE__ */ jsx(CardContent, { className: "pt-6", children: /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between", children: [
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("p", { className: "text-sm font-medium text-gray-600 dark:text-gray-400", children: "Active Subscriptions" }),
          /* @__PURE__ */ jsx("p", { className: "text-3xl font-bold text-gray-900 dark:text-gray-100 mt-2", children: stats.active_subscriptions }),
          /* @__PURE__ */ jsxs("p", { className: "text-xs text-green-600 dark:text-green-400 mt-1", children: [
            stats.trialing_subscriptions,
            " trialing"
          ] })
        ] }),
        /* @__PURE__ */ jsx("div", { className: "bg-yellow-50 dark:bg-yellow-900/20 p-3 rounded-lg", children: /* @__PURE__ */ jsx(CreditCard, { className: "h-8 w-8 text-yellow-600 dark:text-yellow-400" }) })
      ] }) }) })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 lg:grid-cols-2 gap-6", children: [
      /* @__PURE__ */ jsxs(Card, { children: [
        /* @__PURE__ */ jsxs(CardHeader, { children: [
          /* @__PURE__ */ jsx(CardTitle, { children: "Message Statistics" }),
          /* @__PURE__ */ jsx(CardDescription, { children: "Message volume and direction breakdown" })
        ] }),
        /* @__PURE__ */ jsxs(CardContent, { children: [
          /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-2 gap-4", children: [
            /* @__PURE__ */ jsxs("div", { className: "p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg", children: [
              /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 mb-2", children: [
                /* @__PURE__ */ jsx(Inbox, { className: "h-5 w-5 text-blue-600 dark:text-blue-400" }),
                /* @__PURE__ */ jsx("p", { className: "text-sm font-medium text-gray-600 dark:text-gray-400", children: "Inbound" })
              ] }),
              /* @__PURE__ */ jsx("p", { className: "text-2xl font-bold text-gray-900 dark:text-gray-100", children: formatNumber(stats.inbound_messages) })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "p-4 bg-green-50 dark:bg-green-900/20 rounded-lg", children: [
              /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 mb-2", children: [
                /* @__PURE__ */ jsx(Send, { className: "h-5 w-5 text-green-600 dark:text-green-400" }),
                /* @__PURE__ */ jsx("p", { className: "text-sm font-medium text-gray-600 dark:text-gray-400", children: "Outbound" })
              ] }),
              /* @__PURE__ */ jsx("p", { className: "text-2xl font-bold text-gray-900 dark:text-gray-100", children: formatNumber(stats.outbound_messages) })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "p-4 bg-gray-50 dark:bg-gray-800 rounded-lg", children: [
              /* @__PURE__ */ jsx("p", { className: "text-sm font-medium text-gray-600 dark:text-gray-400 mb-2", children: "This Week" }),
              /* @__PURE__ */ jsx("p", { className: "text-2xl font-bold text-gray-900 dark:text-gray-100", children: formatNumber(stats.messages_this_week) })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "p-4 bg-gray-50 dark:bg-gray-800 rounded-lg", children: [
              /* @__PURE__ */ jsx("p", { className: "text-sm font-medium text-gray-600 dark:text-gray-400 mb-2", children: "This Month" }),
              /* @__PURE__ */ jsx("p", { className: "text-2xl font-bold text-gray-900 dark:text-gray-100", children: formatNumber(stats.messages_this_month) })
            ] })
          ] }),
          Object.keys(stats.message_statuses).length > 0 && /* @__PURE__ */ jsxs("div", { className: "mt-4 pt-4 border-t border-gray-200 dark:border-gray-800", children: [
            /* @__PURE__ */ jsx("p", { className: "text-sm font-medium text-gray-700 dark:text-gray-300 mb-2", children: "Status Breakdown" }),
            /* @__PURE__ */ jsx("div", { className: "space-y-2", children: Object.entries(stats.message_statuses).map(([status, count]) => /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between", children: [
              /* @__PURE__ */ jsx("span", { className: "text-sm text-gray-600 dark:text-gray-400 capitalize", children: status }),
              /* @__PURE__ */ jsx("span", { className: "text-sm font-medium text-gray-900 dark:text-gray-100", children: formatNumber(count) })
            ] }, status)) })
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxs(Card, { children: [
        /* @__PURE__ */ jsxs(CardHeader, { children: [
          /* @__PURE__ */ jsx(CardTitle, { children: "Template Statistics" }),
          /* @__PURE__ */ jsx(CardDescription, { children: "Template approval and status overview" })
        ] }),
        /* @__PURE__ */ jsx(CardContent, { children: /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-2 gap-4", children: [
          /* @__PURE__ */ jsxs("div", { className: "p-4 bg-green-50 dark:bg-green-900/20 rounded-lg", children: [
            /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 mb-2", children: [
              /* @__PURE__ */ jsx(CheckCircle, { className: "h-5 w-5 text-green-600 dark:text-green-400" }),
              /* @__PURE__ */ jsx("p", { className: "text-sm font-medium text-gray-600 dark:text-gray-400", children: "Approved" })
            ] }),
            /* @__PURE__ */ jsx("p", { className: "text-2xl font-bold text-gray-900 dark:text-gray-100", children: formatNumber(stats.approved_templates) })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg", children: [
            /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 mb-2", children: [
              /* @__PURE__ */ jsx(Clock, { className: "h-5 w-5 text-yellow-600 dark:text-yellow-400" }),
              /* @__PURE__ */ jsx("p", { className: "text-sm font-medium text-gray-600 dark:text-gray-400", children: "Pending" })
            ] }),
            /* @__PURE__ */ jsx("p", { className: "text-2xl font-bold text-gray-900 dark:text-gray-100", children: formatNumber(stats.pending_templates) })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "p-4 bg-red-50 dark:bg-red-900/20 rounded-lg", children: [
            /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 mb-2", children: [
              /* @__PURE__ */ jsx(XCircle, { className: "h-5 w-5 text-red-600 dark:text-red-400" }),
              /* @__PURE__ */ jsx("p", { className: "text-sm font-medium text-gray-600 dark:text-gray-400", children: "Rejected" })
            ] }),
            /* @__PURE__ */ jsx("p", { className: "text-2xl font-bold text-gray-900 dark:text-gray-100", children: formatNumber(stats.rejected_templates) })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "p-4 bg-gray-50 dark:bg-gray-800 rounded-lg", children: [
            /* @__PURE__ */ jsx("p", { className: "text-sm font-medium text-gray-600 dark:text-gray-400 mb-2", children: "Total" }),
            /* @__PURE__ */ jsx("p", { className: "text-2xl font-bold text-gray-900 dark:text-gray-100", children: formatNumber(stats.total_templates) })
          ] })
        ] }) })
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 lg:grid-cols-2 gap-6", children: [
      /* @__PURE__ */ jsxs(Card, { children: [
        /* @__PURE__ */ jsxs(CardHeader, { children: [
          /* @__PURE__ */ jsx(CardTitle, { children: "Connection Health" }),
          /* @__PURE__ */ jsx(CardDescription, { children: "WhatsApp connection status monitoring" })
        ] }),
        /* @__PURE__ */ jsx(CardContent, { children: /* @__PURE__ */ jsxs("div", { className: "space-y-4", children: [
          /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between p-4 bg-green-50 dark:bg-green-900/20 rounded-lg", children: [
            /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3", children: [
              /* @__PURE__ */ jsx(CheckCircle, { className: "h-6 w-6 text-green-600 dark:text-green-400" }),
              /* @__PURE__ */ jsxs("div", { children: [
                /* @__PURE__ */ jsx("p", { className: "font-medium text-gray-900 dark:text-gray-100", children: "Active Connections" }),
                /* @__PURE__ */ jsxs("p", { className: "text-sm text-gray-600 dark:text-gray-400", children: [
                  stats.active_connections,
                  " of ",
                  stats.total_connections,
                  " connections"
                ] })
              ] })
            ] }),
            /* @__PURE__ */ jsxs("p", { className: "text-2xl font-bold text-green-600 dark:text-green-400", children: [
              stats.total_connections > 0 ? Math.round(stats.active_connections / stats.total_connections * 100) : 0,
              "%"
            ] })
          ] }),
          stats.connections_with_errors > 0 && /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between p-4 bg-red-50 dark:bg-red-900/20 rounded-lg", children: [
            /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3", children: [
              /* @__PURE__ */ jsx(AlertCircle, { className: "h-6 w-6 text-red-600 dark:text-red-400" }),
              /* @__PURE__ */ jsxs("div", { children: [
                /* @__PURE__ */ jsx("p", { className: "font-medium text-gray-900 dark:text-gray-100", children: "Connections with Errors" }),
                /* @__PURE__ */ jsx("p", { className: "text-sm text-gray-600 dark:text-gray-400", children: "Requires attention" })
              ] })
            ] }),
            /* @__PURE__ */ jsx("p", { className: "text-2xl font-bold text-red-600 dark:text-red-400", children: stats.connections_with_errors })
          ] }),
          stats.past_due_subscriptions > 0 && /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg", children: [
            /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3", children: [
              /* @__PURE__ */ jsx(AlertCircle, { className: "h-6 w-6 text-yellow-600 dark:text-yellow-400" }),
              /* @__PURE__ */ jsxs("div", { children: [
                /* @__PURE__ */ jsx("p", { className: "font-medium text-gray-900 dark:text-gray-100", children: "Past Due Subscriptions" }),
                /* @__PURE__ */ jsx("p", { className: "text-sm text-gray-600 dark:text-gray-400", children: "Payment required" })
              ] })
            ] }),
            /* @__PURE__ */ jsx("p", { className: "text-2xl font-bold text-yellow-600 dark:text-yellow-400", children: stats.past_due_subscriptions })
          ] })
        ] }) })
      ] }),
      /* @__PURE__ */ jsxs(Card, { children: [
        /* @__PURE__ */ jsxs(CardHeader, { children: [
          /* @__PURE__ */ jsx(CardTitle, { children: "Top Workspaces by Volume" }),
          /* @__PURE__ */ jsx(CardDescription, { children: "Most active workspaces (last 30 days)" })
        ] }),
        /* @__PURE__ */ jsx(CardContent, { children: top_workspaces.length === 0 ? /* @__PURE__ */ jsx("p", { className: "text-gray-500 dark:text-gray-400 text-center py-8", children: "No message data available" }) : /* @__PURE__ */ jsx("div", { className: "space-y-3", children: top_workspaces.map((workspace, index) => /* @__PURE__ */ jsxs(
          Link$1,
          {
            href: route("platform.workspaces.show", { workspace: workspace.id }),
            className: "flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors",
            children: [
              /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3", children: [
                /* @__PURE__ */ jsx("div", { className: "flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 font-bold text-sm", children: index + 1 }),
                /* @__PURE__ */ jsxs("div", { children: [
                  /* @__PURE__ */ jsx("p", { className: "text-sm font-medium text-gray-900 dark:text-gray-100", children: workspace.name }),
                  /* @__PURE__ */ jsx("p", { className: "text-xs text-gray-500 dark:text-gray-400", children: workspace.slug })
                ] })
              ] }),
              /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
                /* @__PURE__ */ jsx(BarChart3, { className: "h-4 w-4 text-gray-400" }),
                /* @__PURE__ */ jsx("span", { className: "text-sm font-semibold text-gray-900 dark:text-gray-100", children: formatNumber(workspace.message_count) })
              ] })
            ]
          },
          workspace.id
        )) }) })
      ] })
    ] }),
    /* @__PURE__ */ jsxs(Card, { children: [
      /* @__PURE__ */ jsx(CardHeader, { children: /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between", children: [
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx(CardTitle, { children: "Recent Workspaces" }),
          /* @__PURE__ */ jsx(CardDescription, { children: "Newly created workspaces" })
        ] }),
        /* @__PURE__ */ jsx(
          Link$1,
          {
            href: route("platform.workspaces.index"),
            className: "text-sm text-blue-600 dark:text-blue-400 hover:underline",
            children: "View All"
          }
        )
      ] }) }),
      /* @__PURE__ */ jsx(CardContent, { children: recent_workspaces.length === 0 ? /* @__PURE__ */ jsx("p", { className: "text-gray-500 dark:text-gray-400 text-center py-8", children: "No workspaces yet" }) : /* @__PURE__ */ jsx("div", { className: "divide-y divide-gray-200 dark:divide-gray-800", children: recent_workspaces.map((workspace) => /* @__PURE__ */ jsx(
        Link$1,
        {
          href: route("platform.workspaces.show", { workspace: workspace.id }),
          className: "block p-4 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors",
          children: /* @__PURE__ */ jsx("div", { className: "flex items-center justify-between", children: /* @__PURE__ */ jsxs("div", { className: "flex-1 min-w-0", children: [
            /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 mb-1", children: [
              /* @__PURE__ */ jsx("p", { className: "text-sm font-medium text-gray-900 dark:text-gray-100", children: workspace.name }),
              getStatusBadge(workspace.status)
            ] }),
            /* @__PURE__ */ jsxs("p", { className: "text-xs text-gray-500 dark:text-gray-400", children: [
              "Owner: ",
              workspace.owner.name,
              " (",
              workspace.owner.email,
              ")"
            ] }),
            /* @__PURE__ */ jsxs("p", { className: "text-xs text-gray-500 dark:text-gray-400 mt-1", children: [
              "Created: ",
              new Date(workspace.created_at).toLocaleString()
            ] })
          ] }) })
        },
        workspace.id
      )) }) })
    ] })
  ] }) });
}
export {
  PlatformDashboard as default
};
