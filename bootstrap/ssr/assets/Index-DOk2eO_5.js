import { jsxs, jsx, Fragment } from "react/jsx-runtime";
import { usePage, Head, Link, router } from "@inertiajs/react";
import { A as AppShell } from "./AppShell-DvEO1iV9.js";
import { C as Card, b as CardHeader, c as CardTitle, d as CardDescription, a as CardContent } from "./Card-DLPTnTfC.js";
import { B as Badge } from "./Badge-CHx1ViYT.js";
import { B as Button } from "./Button-ymbdH_NY.js";
import { P as Progress } from "./Progress-BMolBmhQ.js";
import { AlertCircle, CreditCard, Clock, TrendingUp, MessageSquare, FileText, Zap, Users, ArrowRight } from "lucide-react";
import { u as useNotifications } from "./useNotifications-CTnw084D.js";
import { A as Alert } from "./Alert-DWa0cnrh.js";
import "react";
import "./utils-B2ZNUmII.js";
import "clsx";
import "tailwind-merge";
import "./RealtimeProvider-Dletx5Ny.js";
import "laravel-echo";
import "pusher-js";
import "./GlobalFlashHandler-gMSPY3wx.js";
import "./useToast-C5ECijgs.js";
import "./BrandingWrapper-B2Mh0bYb.js";
import "./CookieConsentBanner-BJ5KL4CC.js";
import "./useConfirm-BKf7Nv1N.js";
function BillingIndex({
  account,
  subscription,
  plan,
  usage,
  current_connections_count,
  current_agents_count
}) {
  const { auth } = usePage().props;
  const { confirm } = useNotifications();
  const isOwner = Number(account.owner_id) === Number(auth?.user?.id);
  const getStatusBadge = (status) => {
    const statusMap = {
      trialing: { variant: "default", label: "Trial" },
      active: { variant: "success", label: "Active" },
      past_due: { variant: "warning", label: "Past Due" },
      canceled: { variant: "danger", label: "Canceled" }
    };
    const config = statusMap[status] || { variant: "default", label: status };
    return /* @__PURE__ */ jsx(Badge, { variant: config.variant, className: "px-3 py-1", children: config.label });
  };
  const formatPrice = (price, currency) => {
    if (price === null) return "Custom";
    if (price === 0) return "Free";
    const major = price / 100;
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency,
      minimumFractionDigits: 0
    }).format(major);
  };
  const getUsagePercentage = (used, limit) => {
    if (!limit || limit === -1 || limit === 9999 || limit === 9999999) return 0;
    return Math.min(used / limit * 100, 100);
  };
  const getTrialDaysRemaining = (trialEndsAt) => {
    if (!trialEndsAt) return null;
    const now = /* @__PURE__ */ new Date();
    const end = new Date(trialEndsAt);
    const diffTime = end.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1e3 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 0;
  };
  const trialDays = subscription ? getTrialDaysRemaining(subscription.trial_ends_at) : null;
  const renderUsageMeter = (label, icon, used, limit, currentCount) => {
    if (limit === void 0) return null;
    const isUnlimited = limit === -1 || limit === 9999 || limit === 9999999;
    const percentage = isUnlimited ? 0 : getUsagePercentage(used, limit);
    const variant = percentage >= 90 ? "danger" : percentage >= 75 ? "warning" : "default";
    return /* @__PURE__ */ jsxs("div", { className: "p-5 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 space-y-3", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between", children: [
        /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3", children: [
          /* @__PURE__ */ jsx("div", { className: "p-2 bg-blue-500 rounded-lg", children: icon }),
          /* @__PURE__ */ jsx("span", { className: "text-sm font-semibold text-gray-700 dark:text-gray-300", children: label })
        ] }),
        /* @__PURE__ */ jsxs("span", { className: "text-sm font-bold text-gray-900 dark:text-gray-100", children: [
          used.toLocaleString(),
          " / ",
          isUnlimited ? "∞" : limit.toLocaleString(),
          currentCount !== void 0 && /* @__PURE__ */ jsxs("span", { className: "ml-1 text-xs text-gray-500 font-normal", children: [
            "(",
            currentCount,
            " active)"
          ] })
        ] })
      ] }),
      !isUnlimited && /* @__PURE__ */ jsxs(Fragment, { children: [
        /* @__PURE__ */ jsx(Progress, { value: percentage, variant, className: "h-2.5" }),
        percentage >= 90 && /* @__PURE__ */ jsxs("p", { className: "text-xs text-red-600 dark:text-red-400 font-medium", children: [
          "Near limit. ",
          /* @__PURE__ */ jsx(Link, { href: route("app.billing.plans", {}), className: "underline hover:no-underline", children: "Upgrade" })
        ] })
      ] })
    ] });
  };
  return /* @__PURE__ */ jsxs(AppShell, { children: [
    /* @__PURE__ */ jsx(Head, { title: "Billing Overview" }),
    /* @__PURE__ */ jsxs("div", { className: "space-y-8", children: [
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("h1", { className: "text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-gray-100 dark:to-gray-300 bg-clip-text text-transparent", children: "Billing Overview" }),
        /* @__PURE__ */ jsx("p", { className: "mt-2 text-sm text-gray-600 dark:text-gray-400", children: "Manage your subscription and view usage" })
      ] }),
      subscription?.status === "past_due" && /* @__PURE__ */ jsxs(Alert, { variant: "warning", className: "border-yellow-200 dark:border-yellow-800", children: [
        /* @__PURE__ */ jsx(AlertCircle, { className: "h-5 w-5" }),
        /* @__PURE__ */ jsxs("div", { className: "flex-1", children: [
          /* @__PURE__ */ jsx("h3", { className: "font-semibold text-yellow-800 dark:text-yellow-200 mb-1", children: "Payment Past Due" }),
          /* @__PURE__ */ jsx("p", { className: "text-sm text-yellow-700 dark:text-yellow-300 mb-3", children: "Your subscription payment is past due. Please update your payment method to continue using all features." }),
          subscription.last_error && /* @__PURE__ */ jsx("p", { className: "text-xs text-yellow-600 dark:text-yellow-400 italic mb-3", children: subscription.last_error }),
          /* @__PURE__ */ jsx(Link, { href: route("app.billing.plans", {}), children: /* @__PURE__ */ jsx(Button, { variant: "secondary", size: "sm", className: "rounded-xl", children: "Update Payment" }) })
        ] })
      ] }),
      subscription?.status === "canceled" && /* @__PURE__ */ jsxs(Alert, { variant: "error", className: "border-red-200 dark:border-red-800", children: [
        /* @__PURE__ */ jsx(AlertCircle, { className: "h-5 w-5" }),
        /* @__PURE__ */ jsxs("div", { className: "flex-1", children: [
          /* @__PURE__ */ jsx("h3", { className: "font-semibold text-red-800 dark:text-red-200 mb-1", children: "Subscription Canceled" }),
          /* @__PURE__ */ jsxs("p", { className: "text-sm text-red-700 dark:text-red-300 mb-3", children: [
            "Your subscription was canceled on ",
            subscription.canceled_at ? new Date(subscription.canceled_at).toLocaleDateString() : "a previous date",
            ". You can reactivate it or choose a new plan."
          ] }),
          /* @__PURE__ */ jsx(Link, { href: route("app.billing.plans", {}), children: /* @__PURE__ */ jsx(Button, { variant: "secondary", size: "sm", className: "rounded-xl", children: "View Plans" }) })
        ] })
      ] }),
      /* @__PURE__ */ jsxs(Card, { className: "border-0 shadow-lg", children: [
        /* @__PURE__ */ jsx(CardHeader, { className: "bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20", children: /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between", children: [
          /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3", children: [
            /* @__PURE__ */ jsx("div", { className: "p-2 bg-blue-500 rounded-xl", children: /* @__PURE__ */ jsx(CreditCard, { className: "h-5 w-5 text-white" }) }),
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx(CardTitle, { className: "text-xl font-bold", children: "Current Plan" }),
              /* @__PURE__ */ jsx(CardDescription, { children: "Your active subscription details" })
            ] })
          ] }),
          subscription && getStatusBadge(subscription.status)
        ] }) }),
        /* @__PURE__ */ jsx(CardContent, { className: "p-6", children: plan ? /* @__PURE__ */ jsxs("div", { className: "space-y-6", children: [
          /* @__PURE__ */ jsx("div", { children: /* @__PURE__ */ jsx("h3", { className: "text-2xl font-bold text-gray-900 dark:text-gray-100 mb-1", children: plan.name }) }),
          /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-6", children: [
            /* @__PURE__ */ jsxs("div", { className: "p-4 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 rounded-xl flex-1", children: [
              /* @__PURE__ */ jsx("p", { className: "text-sm font-medium text-gray-500 dark:text-gray-400 mb-1", children: "Monthly" }),
              /* @__PURE__ */ jsx("p", { className: "text-2xl font-bold text-gray-900 dark:text-gray-100", children: formatPrice(plan.price_monthly, plan.currency) })
            ] }),
            plan.price_yearly && /* @__PURE__ */ jsxs("div", { className: "p-4 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 rounded-xl flex-1", children: [
              /* @__PURE__ */ jsx("p", { className: "text-sm font-medium text-gray-500 dark:text-gray-400 mb-1", children: "Yearly" }),
              /* @__PURE__ */ jsx("p", { className: "text-2xl font-bold text-gray-900 dark:text-gray-100", children: formatPrice(plan.price_yearly, plan.currency) })
            ] })
          ] }),
          subscription?.status === "trialing" && trialDays !== null && /* @__PURE__ */ jsx("div", { className: "p-4 bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-xl border border-blue-200 dark:border-blue-800", children: /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3", children: [
            /* @__PURE__ */ jsx(Clock, { className: "h-5 w-5 text-blue-600 dark:text-blue-400" }),
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsxs("p", { className: "font-semibold text-blue-800 dark:text-blue-200", children: [
                trialDays,
                " ",
                trialDays === 1 ? "day" : "days",
                " left in trial"
              ] }),
              /* @__PURE__ */ jsxs("p", { className: "text-sm text-blue-700 dark:text-blue-300 mt-1", children: [
                "Trial ends on ",
                subscription.trial_ends_at ? new Date(subscription.trial_ends_at).toLocaleDateString() : "soon"
              ] })
            ] })
          ] }) }),
          subscription?.cancel_at_period_end && /* @__PURE__ */ jsx("div", { className: "p-4 bg-gradient-to-r from-yellow-50 to-yellow-100 dark:from-yellow-900/20 dark:to-yellow-800/20 rounded-xl border border-yellow-200 dark:border-yellow-800", children: /* @__PURE__ */ jsxs("p", { className: "text-sm text-yellow-800 dark:text-yellow-200 font-medium", children: [
            "Subscription will be canceled on",
            " ",
            subscription.current_period_end ? new Date(subscription.current_period_end).toLocaleDateString() : "period end"
          ] }) }),
          /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3 pt-4 border-t border-gray-200 dark:border-gray-700", children: [
            /* @__PURE__ */ jsx(Link, { href: route("app.billing.plans", {}), children: /* @__PURE__ */ jsx(Button, { className: "bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 shadow-lg shadow-blue-500/50 rounded-xl", children: "Change Plan" }) }),
            isOwner && subscription && subscription.status === "active" && !subscription.cancel_at_period_end && /* @__PURE__ */ jsx(
              Button,
              {
                variant: "secondary",
                onClick: async () => {
                  const confirmed = await confirm({
                    title: "Cancel Subscription",
                    message: "Are you sure you want to cancel your subscription?",
                    variant: "warning"
                  });
                  if (confirmed) {
                    router.post(route("app.billing.cancel", {}));
                  }
                },
                className: "rounded-xl",
                children: "Cancel Subscription"
              }
            ),
            isOwner && subscription && subscription.cancel_at_period_end && /* @__PURE__ */ jsx(
              Button,
              {
                variant: "success",
                onClick: () => {
                  router.post(route("app.billing.resume", {}));
                },
                className: "rounded-xl",
                children: "Resume Subscription"
              }
            )
          ] })
        ] }) : /* @__PURE__ */ jsx("p", { className: "text-gray-500 dark:text-gray-400", children: "No plan assigned" }) })
      ] }),
      /* @__PURE__ */ jsxs(Card, { className: "border-0 shadow-lg", children: [
        /* @__PURE__ */ jsx(CardHeader, { className: "bg-gradient-to-r from-gray-50 to-white dark:from-gray-800 dark:to-gray-900", children: /* @__PURE__ */ jsx("div", { className: "flex items-center justify-between", children: /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3", children: [
          /* @__PURE__ */ jsx("div", { className: "p-2 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl", children: /* @__PURE__ */ jsx(TrendingUp, { className: "h-5 w-5 text-white" }) }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx(CardTitle, { className: "text-xl font-bold", children: "Current Usage (This Month)" }),
            /* @__PURE__ */ jsx(CardDescription, { children: "Track your usage against plan limits" })
          ] })
        ] }) }) }),
        /* @__PURE__ */ jsxs(CardContent, { className: "p-6 space-y-4", children: [
          renderUsageMeter(
            "Messages Sent",
            /* @__PURE__ */ jsx(MessageSquare, { className: "h-4 w-4 text-white" }),
            usage.messages_sent,
            plan?.limits.messages_monthly
          ),
          renderUsageMeter(
            "Template Sends",
            /* @__PURE__ */ jsx(FileText, { className: "h-4 w-4 text-white" }),
            usage.template_sends,
            plan?.limits.template_sends_monthly
          ),
          renderUsageMeter(
            "WhatsApp Connections",
            /* @__PURE__ */ jsx(Zap, { className: "h-4 w-4 text-white" }),
            current_connections_count || 0,
            plan?.limits.whatsapp_connections,
            current_connections_count
          ),
          renderUsageMeter(
            "Agents",
            /* @__PURE__ */ jsx(Users, { className: "h-4 w-4 text-white" }),
            current_agents_count || 0,
            plan?.limits.agents,
            current_agents_count
          ),
          /* @__PURE__ */ jsxs("div", { className: "pt-4 border-t border-gray-200 dark:border-gray-700 flex flex-wrap gap-4", children: [
            /* @__PURE__ */ jsxs(
              Link,
              {
                href: route("app.billing.usage", {}),
                className: "inline-flex items-center gap-2 text-sm font-medium text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors",
                children: [
                  "View detailed usage",
                  /* @__PURE__ */ jsx(ArrowRight, { className: "h-4 w-4" })
                ]
              }
            ),
            /* @__PURE__ */ jsxs(
              Link,
              {
                href: route("app.billing.history", {}),
                className: "inline-flex items-center gap-2 text-sm font-medium text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors",
                children: [
                  "View payment history",
                  /* @__PURE__ */ jsx(ArrowRight, { className: "h-4 w-4" })
                ]
              }
            )
          ] })
        ] })
      ] })
    ] })
  ] });
}
export {
  BillingIndex as default
};
