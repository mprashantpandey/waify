import { jsxs, jsx } from "react/jsx-runtime";
import { Head, Link, router } from "@inertiajs/react";
import { useState, useMemo } from "react";
import { A as AppShell } from "./AppShell-DvEO1iV9.js";
import { C as Card, a as CardContent } from "./Card-DLPTnTfC.js";
import { B as Badge } from "./Badge-CHx1ViYT.js";
import { B as Button } from "./Button-ymbdH_NY.js";
import { Plus, Megaphone, BarChart3, Play, Clock, XCircle, CheckCircle2, Pause } from "lucide-react";
import { E as EmptyState } from "./EmptyState-B0nbB491.js";
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
function BroadcastsIndex({
  account,
  campaigns,
  filters
}) {
  const [search, setSearch] = useState(filters.search || "");
  const [status, setStatus] = useState(filters.status || "");
  const activeFilters = useMemo(() => {
    const payload = {};
    if (search.trim()) payload.search = search.trim();
    if (status) payload.status = status;
    return payload;
  }, [search, status]);
  const applyFilters = () => {
    router.get(route("app.broadcasts.index", {}), activeFilters, {
      preserveState: true,
      preserveScroll: true,
      replace: true
    });
  };
  const getStatusBadge = (status2) => {
    const statusMap = {
      draft: { variant: "default", label: "Draft", icon: Clock },
      scheduled: { variant: "info", label: "Scheduled", icon: Clock },
      sending: { variant: "info", label: "Sending", icon: Play },
      paused: { variant: "warning", label: "Paused", icon: Pause },
      completed: { variant: "success", label: "Completed", icon: CheckCircle2 },
      cancelled: { variant: "danger", label: "Cancelled", icon: XCircle }
    };
    const config = statusMap[status2] || { variant: "default", label: status2, icon: Clock };
    const Icon = config.icon;
    return /* @__PURE__ */ jsxs(Badge, { variant: config.variant, className: "flex items-center gap-1", children: [
      /* @__PURE__ */ jsx(Icon, { className: "h-3 w-3" }),
      config.label
    ] });
  };
  const formatDate = (date) => {
    if (!date) return "—";
    return new Date(date).toLocaleString();
  };
  return /* @__PURE__ */ jsxs(AppShell, { children: [
    /* @__PURE__ */ jsx(Head, { title: "Campaigns" }),
    /* @__PURE__ */ jsxs("div", { className: "space-y-6", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between", children: [
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("h1", { className: "text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-gray-100 dark:to-gray-300 bg-clip-text text-transparent", children: "Campaigns" }),
          /* @__PURE__ */ jsx("p", { className: "mt-2 text-sm text-gray-600 dark:text-gray-400", children: "Create and manage WhatsApp broadcast campaigns" })
        ] }),
        /* @__PURE__ */ jsx(Link, { href: route("app.broadcasts.create", {}), children: /* @__PURE__ */ jsxs(Button, { className: "bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 shadow-lg shadow-blue-500/50", children: [
          /* @__PURE__ */ jsx(Plus, { className: "h-4 w-4 mr-2" }),
          "Create Campaign"
        ] }) })
      ] }),
      /* @__PURE__ */ jsx(Card, { className: "border-0 shadow-lg", children: /* @__PURE__ */ jsx(CardContent, { className: "p-4", children: /* @__PURE__ */ jsxs("div", { className: "flex flex-col gap-3 md:flex-row", children: [
        /* @__PURE__ */ jsx(
          "input",
          {
            type: "text",
            value: search,
            onChange: (e) => setSearch(e.target.value),
            onKeyDown: (e) => e.key === "Enter" && applyFilters(),
            placeholder: "Search by campaign name or description",
            className: "w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-700 md:flex-1"
          }
        ),
        /* @__PURE__ */ jsxs(
          "select",
          {
            value: status,
            onChange: (e) => setStatus(e.target.value),
            className: "rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-700 md:w-48",
            children: [
              /* @__PURE__ */ jsx("option", { value: "", children: "All statuses" }),
              /* @__PURE__ */ jsx("option", { value: "draft", children: "Draft" }),
              /* @__PURE__ */ jsx("option", { value: "scheduled", children: "Scheduled" }),
              /* @__PURE__ */ jsx("option", { value: "sending", children: "Sending" }),
              /* @__PURE__ */ jsx("option", { value: "paused", children: "Paused" }),
              /* @__PURE__ */ jsx("option", { value: "completed", children: "Completed" }),
              /* @__PURE__ */ jsx("option", { value: "cancelled", children: "Cancelled" })
            ]
          }
        ),
        /* @__PURE__ */ jsxs("div", { className: "flex gap-2", children: [
          /* @__PURE__ */ jsx(Button, { variant: "secondary", onClick: () => {
            setSearch("");
            setStatus("");
            router.get(route("app.broadcasts.index", {}), {}, {
              preserveState: true,
              preserveScroll: true,
              replace: true
            });
          }, children: "Reset" }),
          /* @__PURE__ */ jsx(Button, { onClick: applyFilters, children: "Apply" })
        ] })
      ] }) }) }),
      campaigns.data.length === 0 ? /* @__PURE__ */ jsx(Card, { className: "border-0 shadow-xl", children: /* @__PURE__ */ jsx(CardContent, { className: "py-16 text-center", children: /* @__PURE__ */ jsx(
        EmptyState,
        {
          icon: Megaphone,
          title: "No campaigns yet",
          description: "Create your first broadcast campaign to reach multiple contacts at once",
          action: /* @__PURE__ */ jsx(Link, { href: route("app.broadcasts.create", {}), children: /* @__PURE__ */ jsxs(Button, { className: "bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700", children: [
            /* @__PURE__ */ jsx(Plus, { className: "h-4 w-4 mr-2" }),
            "Create Campaign"
          ] }) })
        }
      ) }) }) : /* @__PURE__ */ jsxs("div", { className: "space-y-4", children: [
        campaigns.data.map((campaign) => /* @__PURE__ */ jsx(Card, { className: "border-0 shadow-lg hover:shadow-xl transition-shadow", children: /* @__PURE__ */ jsxs(CardContent, { className: "p-6", children: [
          /* @__PURE__ */ jsxs("div", { className: "flex items-start justify-between", children: [
            /* @__PURE__ */ jsxs("div", { className: "flex-1", children: [
              /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3 mb-2", children: [
                /* @__PURE__ */ jsx(
                  Link,
                  {
                    href: route("app.broadcasts.show", {
                      campaign: campaign.slug
                    }),
                    className: "text-lg font-semibold text-gray-900 dark:text-gray-100 hover:text-blue-600 dark:hover:text-blue-400",
                    children: campaign.name
                  }
                ),
                getStatusBadge(campaign.status)
              ] }),
              campaign.description && /* @__PURE__ */ jsx("p", { className: "text-sm text-gray-600 dark:text-gray-400 mb-3", children: campaign.description }),
              /* @__PURE__ */ jsxs("div", { className: "flex flex-wrap items-center gap-4 text-sm text-gray-600 dark:text-gray-400", children: [
                /* @__PURE__ */ jsxs("span", { className: "flex items-center gap-1", children: [
                  /* @__PURE__ */ jsx(BarChart3, { className: "h-4 w-4" }),
                  campaign.total_recipients,
                  " recipients"
                ] }),
                campaign.status === "sending" && /* @__PURE__ */ jsxs("span", { className: "flex items-center gap-1", children: [
                  /* @__PURE__ */ jsx(Play, { className: "h-4 w-4" }),
                  campaign.completion_percentage,
                  "% complete"
                ] }),
                campaign.scheduled_at && /* @__PURE__ */ jsxs("span", { className: "flex items-center gap-1", children: [
                  /* @__PURE__ */ jsx(Clock, { className: "h-4 w-4" }),
                  formatDate(campaign.scheduled_at)
                ] }),
                campaign.connection && /* @__PURE__ */ jsxs("span", { children: [
                  "via ",
                  campaign.connection.name
                ] })
              ] })
            ] }),
            /* @__PURE__ */ jsx(
              Link,
              {
                href: route("app.broadcasts.show", {
                  campaign: campaign.slug
                }),
                children: /* @__PURE__ */ jsx(Button, { variant: "secondary", size: "sm", children: "View Details" })
              }
            )
          ] }),
          campaign.status === "sending" && campaign.total_recipients > 0 && /* @__PURE__ */ jsx("div", { className: "mt-4", children: /* @__PURE__ */ jsx("div", { className: "w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2", children: /* @__PURE__ */ jsx(
            "div",
            {
              className: "bg-blue-600 h-2 rounded-full transition-all duration-300",
              style: { width: `${campaign.completion_percentage}%` }
            }
          ) }) })
        ] }) }, campaign.id)),
        campaigns.links && campaigns.links.length > 3 && /* @__PURE__ */ jsx("div", { className: "flex justify-center gap-2 mt-6", children: campaigns.links.map((link, index) => /* @__PURE__ */ jsx(
          "button",
          {
            onClick: () => link.url && router.visit(link.url),
            disabled: !link.url,
            className: `px-4 py-2 rounded-md text-sm font-medium ${link.active ? "bg-blue-600 text-white" : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"} ${!link.url ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`,
            dangerouslySetInnerHTML: { __html: link.label }
          },
          index
        )) })
      ] })
    ] })
  ] });
}
export {
  BroadcastsIndex as default
};
