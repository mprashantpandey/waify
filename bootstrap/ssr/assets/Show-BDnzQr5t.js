import { jsxs, jsx } from "react/jsx-runtime";
import { usePage, Head, Link } from "@inertiajs/react";
import { P as PlatformShell } from "./PlatformShell-DKXjXK7A.js";
import { C as Card, a as CardHeader, b as CardTitle, c as CardContent, d as CardDescription } from "./Card-8uw03vLH.js";
import { B as Button } from "./Button-BocaoVWt.js";
import { B as Badge } from "./RealtimeProvider-DfTOxbgl.js";
import { ArrowLeft, Building2 } from "lucide-react";
import "react";
import "./BrandingWrapper-B2Mh0bYb.js";
import "./GlobalFlashHandler-DdgICiVx.js";
import "./useToast-DNfJQ6ZA.js";
import "axios";
import "./utils-H80jjgLf.js";
import "clsx";
import "tailwind-merge";
import "laravel-echo";
import "pusher-js";
function SubscriptionsShow({ subscription }) {
  const { auth } = usePage().props;
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleString();
  };
  const getStatusBadge = (status) => {
    const variants = {
      active: "success",
      trialing: "info",
      past_due: "warning",
      canceled: "danger"
    };
    return /* @__PURE__ */ jsx(Badge, { variant: variants[status] || "default", children: status });
  };
  const formatLimit = (value) => {
    if (value === -1) return "Unlimited";
    return value.toLocaleString();
  };
  const getUsagePercentage = (used, limit) => {
    if (limit === -1) return 0;
    if (limit === 0) return 100;
    return Math.min(100, used / limit * 100);
  };
  return /* @__PURE__ */ jsxs(PlatformShell, { auth, children: [
    /* @__PURE__ */ jsx(Head, { title: `Subscription: ${subscription.workspace.name}` }),
    /* @__PURE__ */ jsxs("div", { className: "space-y-6", children: [
      /* @__PURE__ */ jsx("div", { className: "flex items-center justify-between", children: /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-4", children: [
        /* @__PURE__ */ jsx(Link, { href: route("platform.subscriptions.index"), children: /* @__PURE__ */ jsxs(Button, { variant: "ghost", size: "sm", children: [
          /* @__PURE__ */ jsx(ArrowLeft, { className: "h-4 w-4 mr-2" }),
          "Back to Subscriptions"
        ] }) }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("h1", { className: "text-2xl font-bold text-gray-900 dark:text-gray-100", children: "Subscription Details" }),
          /* @__PURE__ */ jsx("p", { className: "mt-1 text-sm text-gray-500 dark:text-gray-400", children: subscription.workspace.name })
        ] })
      ] }) }),
      /* @__PURE__ */ jsx("div", { className: "grid grid-cols-1 lg:grid-cols-3 gap-6", children: /* @__PURE__ */ jsxs("div", { className: "lg:col-span-2 space-y-6", children: [
        /* @__PURE__ */ jsxs(Card, { children: [
          /* @__PURE__ */ jsx(CardHeader, { children: /* @__PURE__ */ jsx(CardTitle, { children: "Subscription Information" }) }),
          /* @__PURE__ */ jsx(CardContent, { className: "space-y-4", children: /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-2 gap-4", children: [
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx("p", { className: "text-sm text-gray-500 dark:text-gray-400", children: "Workspace" }),
              /* @__PURE__ */ jsxs(
                Link,
                {
                  href: route("platform.workspaces.show", { workspace: subscription.workspace.id }),
                  className: "flex items-center gap-2 text-sm font-medium text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300",
                  children: [
                    /* @__PURE__ */ jsx(Building2, { className: "h-4 w-4" }),
                    subscription.workspace.name
                  ]
                }
              )
            ] }),
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx("p", { className: "text-sm text-gray-500 dark:text-gray-400", children: "Plan" }),
              /* @__PURE__ */ jsx("p", { className: "text-sm font-medium text-gray-900 dark:text-gray-100", children: subscription.plan.name }),
              /* @__PURE__ */ jsx("p", { className: "text-xs text-gray-500 dark:text-gray-400", children: subscription.plan.key })
            ] }),
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx("p", { className: "text-sm text-gray-500 dark:text-gray-400", children: "Status" }),
              getStatusBadge(subscription.status)
            ] }),
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx("p", { className: "text-sm text-gray-500 dark:text-gray-400", children: "Started" }),
              /* @__PURE__ */ jsx("p", { className: "text-sm font-medium text-gray-900 dark:text-gray-100", children: formatDate(subscription.started_at) })
            ] }),
            subscription.trial_ends_at && /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx("p", { className: "text-sm text-gray-500 dark:text-gray-400", children: "Trial Ends" }),
              /* @__PURE__ */ jsx("p", { className: "text-sm font-medium text-gray-900 dark:text-gray-100", children: formatDate(subscription.trial_ends_at) })
            ] }),
            subscription.current_period_end && /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx("p", { className: "text-sm text-gray-500 dark:text-gray-400", children: "Period End" }),
              /* @__PURE__ */ jsx("p", { className: "text-sm font-medium text-gray-900 dark:text-gray-100", children: formatDate(subscription.current_period_end) })
            ] }),
            subscription.cancel_at_period_end && /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx("p", { className: "text-sm text-gray-500 dark:text-gray-400", children: "Cancellation" }),
              /* @__PURE__ */ jsx("p", { className: "text-sm font-medium text-red-600 dark:text-red-400", children: "Will cancel at period end" })
            ] }),
            subscription.canceled_at && /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx("p", { className: "text-sm text-gray-500 dark:text-gray-400", children: "Canceled At" }),
              /* @__PURE__ */ jsx("p", { className: "text-sm font-medium text-gray-900 dark:text-gray-100", children: formatDate(subscription.canceled_at) })
            ] })
          ] }) })
        ] }),
        /* @__PURE__ */ jsxs(Card, { children: [
          /* @__PURE__ */ jsxs(CardHeader, { children: [
            /* @__PURE__ */ jsx(CardTitle, { children: "Usage & Limits" }),
            /* @__PURE__ */ jsx(CardDescription, { children: "Current usage against plan limits" })
          ] }),
          /* @__PURE__ */ jsxs(CardContent, { className: "space-y-4", children: [
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between mb-2", children: [
                /* @__PURE__ */ jsx("span", { className: "text-sm font-medium text-gray-900 dark:text-gray-100", children: "Messages Sent" }),
                /* @__PURE__ */ jsxs("span", { className: "text-sm text-gray-500 dark:text-gray-400", children: [
                  subscription.usage.messages_sent.toLocaleString(),
                  " / ",
                  formatLimit(subscription.limits.messages_monthly || 0)
                ] })
              ] }),
              /* @__PURE__ */ jsx("div", { className: "w-full bg-gray-200 rounded-full h-2 dark:bg-gray-700", children: /* @__PURE__ */ jsx(
                "div",
                {
                  className: "bg-blue-600 h-2 rounded-full",
                  style: {
                    width: `${getUsagePercentage(
                      subscription.usage.messages_sent,
                      subscription.limits.messages_monthly || 0
                    )}%`
                  }
                }
              ) })
            ] }),
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between mb-2", children: [
                /* @__PURE__ */ jsx("span", { className: "text-sm font-medium text-gray-900 dark:text-gray-100", children: "Template Sends" }),
                /* @__PURE__ */ jsxs("span", { className: "text-sm text-gray-500 dark:text-gray-400", children: [
                  subscription.usage.template_sends.toLocaleString(),
                  " / ",
                  formatLimit(subscription.limits.template_sends_monthly || 0)
                ] })
              ] }),
              /* @__PURE__ */ jsx("div", { className: "w-full bg-gray-200 rounded-full h-2 dark:bg-gray-700", children: /* @__PURE__ */ jsx(
                "div",
                {
                  className: "bg-blue-600 h-2 rounded-full",
                  style: {
                    width: `${getUsagePercentage(
                      subscription.usage.template_sends,
                      subscription.limits.template_sends_monthly || 0
                    )}%`
                  }
                }
              ) })
            ] }),
            subscription.limits.ai_credits_monthly !== void 0 && /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between mb-2", children: [
                /* @__PURE__ */ jsx("span", { className: "text-sm font-medium text-gray-900 dark:text-gray-100", children: "AI Credits Used" }),
                /* @__PURE__ */ jsxs("span", { className: "text-sm text-gray-500 dark:text-gray-400", children: [
                  subscription.usage.ai_credits_used.toLocaleString(),
                  " / ",
                  formatLimit(subscription.limits.ai_credits_monthly || 0)
                ] })
              ] }),
              /* @__PURE__ */ jsx("div", { className: "w-full bg-gray-200 rounded-full h-2 dark:bg-gray-700", children: /* @__PURE__ */ jsx(
                "div",
                {
                  className: "bg-blue-600 h-2 rounded-full",
                  style: {
                    width: `${getUsagePercentage(
                      subscription.usage.ai_credits_used,
                      subscription.limits.ai_credits_monthly || 0
                    )}%`
                  }
                }
              ) })
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxs(Card, { children: [
          /* @__PURE__ */ jsx(CardHeader, { children: /* @__PURE__ */ jsx(CardTitle, { children: "Plan Limits" }) }),
          /* @__PURE__ */ jsx(CardContent, { children: /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-2 gap-4", children: [
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx("p", { className: "text-sm text-gray-500 dark:text-gray-400", children: "Agents" }),
              /* @__PURE__ */ jsx("p", { className: "text-sm font-medium text-gray-900 dark:text-gray-100", children: formatLimit(subscription.limits.agents || 0) })
            ] }),
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx("p", { className: "text-sm text-gray-500 dark:text-gray-400", children: "WhatsApp Connections" }),
              /* @__PURE__ */ jsx("p", { className: "text-sm font-medium text-gray-900 dark:text-gray-100", children: formatLimit(subscription.limits.whatsapp_connections || 0) })
            ] }),
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx("p", { className: "text-sm text-gray-500 dark:text-gray-400", children: "Messages Monthly" }),
              /* @__PURE__ */ jsx("p", { className: "text-sm font-medium text-gray-900 dark:text-gray-100", children: formatLimit(subscription.limits.messages_monthly || 0) })
            ] }),
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx("p", { className: "text-sm text-gray-500 dark:text-gray-400", children: "Template Sends Monthly" }),
              /* @__PURE__ */ jsx("p", { className: "text-sm font-medium text-gray-900 dark:text-gray-100", children: formatLimit(subscription.limits.template_sends_monthly || 0) })
            ] })
          ] }) })
        ] })
      ] }) })
    ] })
  ] });
}
export {
  SubscriptionsShow as default
};
