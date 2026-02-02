import { jsxs, jsx, Fragment } from "react/jsx-runtime";
import { usePage, Head, Link } from "@inertiajs/react";
import { P as PlatformShell } from "./PlatformShell-DKXjXK7A.js";
import { C as Card, a as CardHeader, b as CardTitle, c as CardContent } from "./Card-8uw03vLH.js";
import { B as Badge } from "./RealtimeProvider-DfTOxbgl.js";
import { L as Label } from "./Label-CbZtQFYj.js";
import { u as useToast } from "./useToast-DNfJQ6ZA.js";
import { FileText, Building2 } from "lucide-react";
import { useEffect } from "react";
import "./BrandingWrapper-B2Mh0bYb.js";
import "./GlobalFlashHandler-DdgICiVx.js";
import "./Button-BocaoVWt.js";
import "./utils-H80jjgLf.js";
import "clsx";
import "tailwind-merge";
import "axios";
import "laravel-echo";
import "pusher-js";
function SubscriptionsIndex({
  subscriptions,
  filters
}) {
  const { auth, flash } = usePage().props;
  const { addToast } = useToast();
  useEffect(() => {
    if (flash?.success) {
      addToast({
        title: "Success",
        description: flash.success,
        variant: "success"
      });
    }
    if (flash?.error) {
      addToast({
        title: "Error",
        description: flash.error,
        variant: "error"
      });
    }
  }, [flash, addToast]);
  const getStatusBadge = (status) => {
    const variants = {
      active: "success",
      trialing: "info",
      past_due: "warning",
      canceled: "danger"
    };
    return /* @__PURE__ */ jsx(Badge, { variant: variants[status] || "default", children: status });
  };
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString();
  };
  return /* @__PURE__ */ jsxs(PlatformShell, { auth, children: [
    /* @__PURE__ */ jsx(Head, { title: "Subscriptions" }),
    /* @__PURE__ */ jsxs("div", { className: "space-y-6", children: [
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("h1", { className: "text-2xl font-bold text-gray-900 dark:text-gray-100", children: "Subscriptions" }),
        /* @__PURE__ */ jsx("p", { className: "mt-1 text-sm text-gray-500 dark:text-gray-400", children: "View and manage all workspace subscriptions" })
      ] }),
      /* @__PURE__ */ jsxs(Card, { children: [
        /* @__PURE__ */ jsx(CardHeader, { children: /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between", children: [
          /* @__PURE__ */ jsx(CardTitle, { children: "All Subscriptions" }),
          /* @__PURE__ */ jsx("div", { className: "flex items-center gap-4", children: /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
            /* @__PURE__ */ jsx(Label, { htmlFor: "status-filter", className: "text-sm", children: "Status:" }),
            /* @__PURE__ */ jsxs(
              "select",
              {
                id: "status-filter",
                value: filters?.status || "",
                onChange: (e) => {
                  const url = new URL(window.location.href);
                  if (e.target.value) {
                    url.searchParams.set("status", e.target.value);
                  } else {
                    url.searchParams.delete("status");
                  }
                  window.location.href = url.toString();
                },
                className: "rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100",
                children: [
                  /* @__PURE__ */ jsx("option", { value: "", children: "All" }),
                  /* @__PURE__ */ jsx("option", { value: "active", children: "Active" }),
                  /* @__PURE__ */ jsx("option", { value: "trialing", children: "Trialing" }),
                  /* @__PURE__ */ jsx("option", { value: "past_due", children: "Past Due" }),
                  /* @__PURE__ */ jsx("option", { value: "canceled", children: "Canceled" })
                ]
              }
            )
          ] }) })
        ] }) }),
        /* @__PURE__ */ jsx(CardContent, { children: subscriptions.data.length === 0 ? /* @__PURE__ */ jsxs("div", { className: "py-12 text-center", children: [
          /* @__PURE__ */ jsx(FileText, { className: "h-12 w-12 mx-auto text-gray-400 mb-4" }),
          /* @__PURE__ */ jsx("h3", { className: "text-lg font-medium text-gray-900 dark:text-gray-100 mb-2", children: "No subscriptions found" }),
          /* @__PURE__ */ jsx("p", { className: "text-sm text-gray-500 dark:text-gray-400", children: filters?.status ? `No subscriptions with status "${filters.status}"` : "No subscriptions have been created yet." })
        ] }) : /* @__PURE__ */ jsxs(Fragment, { children: [
          /* @__PURE__ */ jsx("div", { className: "overflow-x-auto", children: /* @__PURE__ */ jsxs("table", { className: "min-w-full divide-y divide-gray-200 dark:divide-gray-800", children: [
            /* @__PURE__ */ jsx("thead", { className: "bg-gray-50 dark:bg-gray-900", children: /* @__PURE__ */ jsxs("tr", { children: [
              /* @__PURE__ */ jsx("th", { className: "px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider", children: "Workspace" }),
              /* @__PURE__ */ jsx("th", { className: "px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider", children: "Plan" }),
              /* @__PURE__ */ jsx("th", { className: "px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider", children: "Status" }),
              /* @__PURE__ */ jsx("th", { className: "px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider", children: "Usage" }),
              /* @__PURE__ */ jsx("th", { className: "px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider", children: "Period End" }),
              /* @__PURE__ */ jsx("th", { className: "px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider", children: "Started" }),
              /* @__PURE__ */ jsx("th", { className: "px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider", children: "Actions" })
            ] }) }),
            /* @__PURE__ */ jsx("tbody", { className: "bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700", children: subscriptions.data.map((subscription) => /* @__PURE__ */ jsxs("tr", { className: "hover:bg-gray-50 dark:hover:bg-gray-700", children: [
              /* @__PURE__ */ jsx("td", { className: "px-6 py-4 whitespace-nowrap", children: /* @__PURE__ */ jsxs(
                Link,
                {
                  href: route("platform.subscriptions.show", { subscription: subscription.slug }),
                  className: "flex items-center gap-2 text-sm font-medium text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300",
                  children: [
                    /* @__PURE__ */ jsx(Building2, { className: "h-4 w-4" }),
                    subscription.workspace.name
                  ]
                }
              ) }),
              /* @__PURE__ */ jsxs("td", { className: "px-6 py-4 whitespace-nowrap", children: [
                /* @__PURE__ */ jsx("div", { className: "text-sm text-gray-900 dark:text-gray-100", children: subscription.plan.name }),
                /* @__PURE__ */ jsx("div", { className: "text-xs text-gray-500 dark:text-gray-400", children: subscription.plan.key })
              ] }),
              /* @__PURE__ */ jsx("td", { className: "px-6 py-4 whitespace-nowrap", children: getStatusBadge(subscription.status) }),
              /* @__PURE__ */ jsxs("td", { className: "px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100", children: [
                /* @__PURE__ */ jsxs("div", { children: [
                  "Messages: ",
                  subscription.usage.messages_sent
                ] }),
                /* @__PURE__ */ jsxs("div", { children: [
                  "Templates: ",
                  subscription.usage.template_sends
                ] })
              ] }),
              /* @__PURE__ */ jsx("td", { className: "px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400", children: formatDate(subscription.current_period_end) }),
              /* @__PURE__ */ jsx("td", { className: "px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400", children: formatDate(subscription.started_at) }),
              /* @__PURE__ */ jsx("td", { className: "px-6 py-4 whitespace-nowrap text-sm", children: /* @__PURE__ */ jsx(
                Link,
                {
                  href: route("platform.subscriptions.show", { subscription: subscription.slug }),
                  className: "text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300",
                  children: "View Details"
                }
              ) })
            ] }, subscription.id)) })
          ] }) }),
          subscriptions.meta && subscriptions.meta.last_page > 1 && /* @__PURE__ */ jsxs("div", { className: "mt-4 flex items-center justify-between", children: [
            /* @__PURE__ */ jsxs("div", { className: "text-sm text-gray-700 dark:text-gray-300", children: [
              "Showing ",
              subscriptions.meta.per_page * (subscriptions.meta.current_page - 1) + 1,
              " to",
              " ",
              Math.min(subscriptions.meta.per_page * subscriptions.meta.current_page, subscriptions.meta.total),
              " of",
              " ",
              subscriptions.meta.total,
              " results"
            ] }),
            /* @__PURE__ */ jsx("div", { className: "flex gap-2", children: subscriptions.links && subscriptions.links.map((link, index) => link.url ? /* @__PURE__ */ jsx(
              Link,
              {
                href: link.url,
                className: `px-3 py-2 rounded-md text-sm ${link.active ? "bg-blue-600 text-white" : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"}`,
                dangerouslySetInnerHTML: { __html: link.label }
              },
              index
            ) : /* @__PURE__ */ jsx(
              "span",
              {
                className: "px-3 py-2 rounded-md text-sm opacity-50 cursor-not-allowed bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300",
                dangerouslySetInnerHTML: { __html: link.label }
              },
              index
            )) })
          ] })
        ] }) })
      ] })
    ] })
  ] });
}
export {
  SubscriptionsIndex as default
};
