import { jsxs, jsx } from "react/jsx-runtime";
import { Head, Link, router } from "@inertiajs/react";
import { A as AppShell } from "./AppShell-B4peoZD-.js";
import { C as Card, a as CardContent, b as CardHeader, c as CardTitle } from "./Card-DLPTnTfC.js";
import { B as Badge } from "./Badge-CHx1ViYT.js";
import { B as Button } from "./Button-ymbdH_NY.js";
import { ArrowLeft, Play, Pause, X, Users, Send, CheckCircle2, Eye } from "lucide-react";
import { u as useToast } from "./useToast-DNfJQ6ZA.js";
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
function BroadcastsShow({
  account,
  campaign,
  stats,
  recipients
}) {
  const { toast } = useToast();
  const getStatusBadge = (status) => {
    const statusMap = {
      draft: { variant: "default", label: "Draft" },
      scheduled: { variant: "info", label: "Scheduled" },
      sending: { variant: "info", label: "Sending" },
      paused: { variant: "warning", label: "Paused" },
      completed: { variant: "success", label: "Completed" },
      cancelled: { variant: "danger", label: "Cancelled" },
      pending: { variant: "default", label: "Pending" },
      sent: { variant: "info", label: "Sent" },
      delivered: { variant: "success", label: "Delivered" },
      read: { variant: "success", label: "Read" },
      failed: { variant: "danger", label: "Failed" }
    };
    const config = statusMap[status] || { variant: "default", label: status };
    return /* @__PURE__ */ jsx(Badge, { variant: config.variant, children: config.label });
  };
  const formatDate = (date) => {
    if (!date) return "—";
    return new Date(date).toLocaleString();
  };
  const handleStart = () => {
    router.post(route("app.broadcasts.start", { campaign: campaign.slug }), {}, {
      onSuccess: () => {
        toast.success("Campaign started");
      },
      onError: () => {
        toast.error("Failed to start campaign");
      }
    });
  };
  const handlePause = () => {
    router.post(route("app.broadcasts.pause", { campaign: campaign.slug }), {}, {
      onSuccess: () => {
        toast.success("Campaign paused");
      },
      onError: () => {
        toast.error("Failed to pause campaign");
      }
    });
  };
  const handleCancel = () => {
    if (!confirm("Are you sure you want to cancel this campaign?")) return;
    router.post(route("app.broadcasts.cancel", { campaign: campaign.slug }), {}, {
      onSuccess: () => {
        toast.success("Campaign cancelled");
      },
      onError: () => {
        toast.error("Failed to cancel campaign");
      }
    });
  };
  return /* @__PURE__ */ jsxs(AppShell, { children: [
    /* @__PURE__ */ jsx(Head, { title: campaign.name }),
    /* @__PURE__ */ jsxs("div", { className: "space-y-6", children: [
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsxs(
          Link,
          {
            href: route("app.broadcasts.index", {}),
            className: "inline-flex items-center gap-2 text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors mb-4",
            children: [
              /* @__PURE__ */ jsx(ArrowLeft, { className: "h-4 w-4" }),
              "Back to Campaigns"
            ]
          }
        ),
        /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between", children: [
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("h1", { className: "text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-gray-100 dark:to-gray-300 bg-clip-text text-transparent", children: campaign.name }),
            campaign.description && /* @__PURE__ */ jsx("p", { className: "mt-2 text-sm text-gray-600 dark:text-gray-400", children: campaign.description })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
            getStatusBadge(campaign.status),
            campaign.status === "draft" && /* @__PURE__ */ jsxs(Button, { onClick: handleStart, className: "bg-blue-600 hover:bg-blue-700", children: [
              /* @__PURE__ */ jsx(Play, { className: "h-4 w-4 mr-2" }),
              "Start"
            ] }),
            campaign.status === "sending" && /* @__PURE__ */ jsxs(Button, { onClick: handlePause, variant: "secondary", children: [
              /* @__PURE__ */ jsx(Pause, { className: "h-4 w-4 mr-2" }),
              "Pause"
            ] }),
            campaign.status === "paused" && /* @__PURE__ */ jsxs(Button, { onClick: handleStart, className: "bg-blue-600 hover:bg-blue-700", children: [
              /* @__PURE__ */ jsx(Play, { className: "h-4 w-4 mr-2" }),
              "Resume"
            ] }),
            ["draft", "scheduled", "sending", "paused"].includes(campaign.status) && /* @__PURE__ */ jsxs(Button, { onClick: handleCancel, variant: "secondary", className: "text-red-600 hover:text-red-700", children: [
              /* @__PURE__ */ jsx(X, { className: "h-4 w-4 mr-2" }),
              "Cancel"
            ] })
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 md:grid-cols-4 gap-4", children: [
        /* @__PURE__ */ jsx(Card, { children: /* @__PURE__ */ jsx(CardContent, { className: "p-6", children: /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between", children: [
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("p", { className: "text-sm text-gray-600 dark:text-gray-400", children: "Total Recipients" }),
            /* @__PURE__ */ jsx("p", { className: "text-2xl font-bold text-gray-900 dark:text-gray-100", children: stats.total })
          ] }),
          /* @__PURE__ */ jsx(Users, { className: "h-8 w-8 text-blue-600" })
        ] }) }) }),
        /* @__PURE__ */ jsx(Card, { children: /* @__PURE__ */ jsx(CardContent, { className: "p-6", children: /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between", children: [
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("p", { className: "text-sm text-gray-600 dark:text-gray-400", children: "Sent" }),
            /* @__PURE__ */ jsx("p", { className: "text-2xl font-bold text-gray-900 dark:text-gray-100", children: stats.sent })
          ] }),
          /* @__PURE__ */ jsx(Send, { className: "h-8 w-8 text-green-600" })
        ] }) }) }),
        /* @__PURE__ */ jsx(Card, { children: /* @__PURE__ */ jsx(CardContent, { className: "p-6", children: /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between", children: [
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("p", { className: "text-sm text-gray-600 dark:text-gray-400", children: "Delivered" }),
            /* @__PURE__ */ jsx("p", { className: "text-2xl font-bold text-gray-900 dark:text-gray-100", children: stats.delivered })
          ] }),
          /* @__PURE__ */ jsx(CheckCircle2, { className: "h-8 w-8 text-blue-600" })
        ] }) }) }),
        /* @__PURE__ */ jsx(Card, { children: /* @__PURE__ */ jsx(CardContent, { className: "p-6", children: /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between", children: [
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("p", { className: "text-sm text-gray-600 dark:text-gray-400", children: "Read" }),
            /* @__PURE__ */ jsx("p", { className: "text-2xl font-bold text-gray-900 dark:text-gray-100", children: stats.read })
          ] }),
          /* @__PURE__ */ jsx(Eye, { className: "h-8 w-8 text-purple-600" })
        ] }) }) })
      ] }),
      campaign.status === "sending" && stats.total > 0 && /* @__PURE__ */ jsx(Card, { children: /* @__PURE__ */ jsxs(CardContent, { className: "p-6", children: [
        /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between mb-2", children: [
          /* @__PURE__ */ jsx("span", { className: "text-sm font-medium text-gray-700 dark:text-gray-300", children: "Progress" }),
          /* @__PURE__ */ jsxs("span", { className: "text-sm text-gray-600 dark:text-gray-400", children: [
            stats.completion_percentage,
            "%"
          ] })
        ] }),
        /* @__PURE__ */ jsx("div", { className: "w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3", children: /* @__PURE__ */ jsx(
          "div",
          {
            className: "bg-blue-600 h-3 rounded-full transition-all duration-300",
            style: { width: `${stats.completion_percentage}%` }
          }
        ) })
      ] }) }),
      /* @__PURE__ */ jsxs(Card, { children: [
        /* @__PURE__ */ jsx(CardHeader, { children: /* @__PURE__ */ jsx(CardTitle, { children: "Campaign Details" }) }),
        /* @__PURE__ */ jsxs(CardContent, { className: "space-y-2", children: [
          /* @__PURE__ */ jsxs("div", { className: "flex justify-between", children: [
            /* @__PURE__ */ jsx("span", { className: "text-sm text-gray-600 dark:text-gray-400", children: "Type" }),
            /* @__PURE__ */ jsx("span", { className: "text-sm font-medium", children: campaign.type })
          ] }),
          campaign.connection && /* @__PURE__ */ jsxs("div", { className: "flex justify-between", children: [
            /* @__PURE__ */ jsx("span", { className: "text-sm text-gray-600 dark:text-gray-400", children: "Connection" }),
            /* @__PURE__ */ jsx("span", { className: "text-sm font-medium", children: campaign.connection.name })
          ] }),
          campaign.template && /* @__PURE__ */ jsxs("div", { className: "flex justify-between", children: [
            /* @__PURE__ */ jsx("span", { className: "text-sm text-gray-600 dark:text-gray-400", children: "Template" }),
            /* @__PURE__ */ jsx("span", { className: "text-sm font-medium", children: campaign.template.name })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "flex justify-between", children: [
            /* @__PURE__ */ jsx("span", { className: "text-sm text-gray-600 dark:text-gray-400", children: "Scheduled At" }),
            /* @__PURE__ */ jsx("span", { className: "text-sm font-medium", children: formatDate(campaign.scheduled_at) })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "flex justify-between", children: [
            /* @__PURE__ */ jsx("span", { className: "text-sm text-gray-600 dark:text-gray-400", children: "Started At" }),
            /* @__PURE__ */ jsx("span", { className: "text-sm font-medium", children: formatDate(campaign.started_at) })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "flex justify-between", children: [
            /* @__PURE__ */ jsx("span", { className: "text-sm text-gray-600 dark:text-gray-400", children: "Completed At" }),
            /* @__PURE__ */ jsx("span", { className: "text-sm font-medium", children: formatDate(campaign.completed_at) })
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxs(Card, { children: [
        /* @__PURE__ */ jsx(CardHeader, { children: /* @__PURE__ */ jsx(CardTitle, { children: "Recipients" }) }),
        /* @__PURE__ */ jsx(CardContent, { children: /* @__PURE__ */ jsx("div", { className: "overflow-x-auto", children: /* @__PURE__ */ jsxs("table", { className: "min-w-full divide-y divide-gray-200 dark:divide-gray-700", children: [
          /* @__PURE__ */ jsx("thead", { className: "bg-gray-50 dark:bg-gray-800", children: /* @__PURE__ */ jsxs("tr", { children: [
            /* @__PURE__ */ jsx("th", { className: "px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider", children: "Phone Number" }),
            /* @__PURE__ */ jsx("th", { className: "px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider", children: "Name" }),
            /* @__PURE__ */ jsx("th", { className: "px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider", children: "Status" }),
            /* @__PURE__ */ jsx("th", { className: "px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider", children: "Sent At" }),
            /* @__PURE__ */ jsx("th", { className: "px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider", children: "Delivered At" }),
            /* @__PURE__ */ jsx("th", { className: "px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider", children: "Read At" })
          ] }) }),
          /* @__PURE__ */ jsx("tbody", { className: "bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700", children: recipients.map((recipient) => /* @__PURE__ */ jsxs("tr", { children: [
            /* @__PURE__ */ jsx("td", { className: "px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100", children: recipient.phone_number }),
            /* @__PURE__ */ jsx("td", { className: "px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400", children: recipient.name || "—" }),
            /* @__PURE__ */ jsx("td", { className: "px-6 py-4 whitespace-nowrap", children: getStatusBadge(recipient.status) }),
            /* @__PURE__ */ jsx("td", { className: "px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400", children: formatDate(recipient.sent_at) }),
            /* @__PURE__ */ jsx("td", { className: "px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400", children: formatDate(recipient.delivered_at) }),
            /* @__PURE__ */ jsx("td", { className: "px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400", children: formatDate(recipient.read_at) })
          ] }, recipient.id)) })
        ] }) }) })
      ] })
    ] })
  ] });
}
export {
  BroadcastsShow as default
};
