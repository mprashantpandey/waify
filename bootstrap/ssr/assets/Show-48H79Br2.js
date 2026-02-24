import { jsxs, jsx } from "react/jsx-runtime";
import { usePage, Head, Link } from "@inertiajs/react";
import { P as PlatformShell } from "./PlatformShell-BVTGgi5j.js";
import { C as Card, b as CardHeader, c as CardTitle, a as CardContent, d as CardDescription } from "./Card-DLPTnTfC.js";
import { B as Button } from "./Button-ymbdH_NY.js";
import { B as Badge } from "./Badge-CHx1ViYT.js";
import { ArrowLeft, Edit, Building2, Infinity } from "lucide-react";
import "react";
import "./RealtimeProvider-Dletx5Ny.js";
import "laravel-echo";
import "pusher-js";
import "./BrandingWrapper-B2Mh0bYb.js";
import "./GlobalFlashHandler-gMSPY3wx.js";
import "./useToast-C5ECijgs.js";
import "axios";
import "./utils-B2ZNUmII.js";
import "clsx";
import "tailwind-merge";
function PlansShow({ plan, moduleNames = {} }) {
  const { auth } = usePage().props;
  const formatPrice = (amount, currency) => {
    if (amount === null || amount === 0) return "Free";
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency || "USD"
    }).format(amount / 100);
  };
  const formatLimit = (value) => {
    if (value === -1) return /* @__PURE__ */ jsxs("span", { className: "flex items-center gap-1", children: [
      /* @__PURE__ */ jsx(Infinity, { className: "h-4 w-4" }),
      " Unlimited"
    ] });
    return value.toLocaleString();
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
  return /* @__PURE__ */ jsxs(PlatformShell, { auth, children: [
    /* @__PURE__ */ jsx(Head, { title: `Plan: ${plan.name}` }),
    /* @__PURE__ */ jsxs("div", { className: "space-y-6", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between", children: [
        /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-4", children: [
          /* @__PURE__ */ jsx(Link, { href: route("platform.plans.index"), children: /* @__PURE__ */ jsxs(Button, { variant: "ghost", size: "sm", children: [
            /* @__PURE__ */ jsx(ArrowLeft, { className: "h-4 w-4 mr-2" }),
            "Back to Plans"
          ] }) }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("h1", { className: "text-2xl font-bold text-gray-900 dark:text-gray-100", children: plan.name }),
            /* @__PURE__ */ jsx("p", { className: "mt-1 text-sm text-gray-500 dark:text-gray-400", children: plan.description || "No description" })
          ] })
        ] }),
        /* @__PURE__ */ jsx(Link, { href: route("platform.plans.edit", { plan: plan.key }), children: /* @__PURE__ */ jsxs(Button, { children: [
          /* @__PURE__ */ jsx(Edit, { className: "h-4 w-4 mr-2" }),
          "Edit Plan"
        ] }) })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 lg:grid-cols-3 gap-6", children: [
        /* @__PURE__ */ jsxs("div", { className: "lg:col-span-2 space-y-6", children: [
          /* @__PURE__ */ jsxs(Card, { children: [
            /* @__PURE__ */ jsx(CardHeader, { children: /* @__PURE__ */ jsx(CardTitle, { children: "Plan Details" }) }),
            /* @__PURE__ */ jsx(CardContent, { className: "space-y-4", children: /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-2 gap-4", children: [
              /* @__PURE__ */ jsxs("div", { children: [
                /* @__PURE__ */ jsx("p", { className: "text-sm text-gray-500 dark:text-gray-400", children: "Plan Key" }),
                /* @__PURE__ */ jsx("p", { className: "text-sm font-medium text-gray-900 dark:text-gray-100", children: plan.key })
              ] }),
              /* @__PURE__ */ jsxs("div", { children: [
                /* @__PURE__ */ jsx("p", { className: "text-sm text-gray-500 dark:text-gray-400", children: "Status" }),
                /* @__PURE__ */ jsx(Badge, { variant: plan.is_active ? "success" : "default", children: plan.is_active ? "Active" : "Inactive" }),
                plan.is_public && /* @__PURE__ */ jsx(Badge, { variant: "info", className: "ml-2", children: "Public" })
              ] }),
              /* @__PURE__ */ jsxs("div", { children: [
                /* @__PURE__ */ jsx("p", { className: "text-sm text-gray-500 dark:text-gray-400", children: "Trial Days" }),
                /* @__PURE__ */ jsx("p", { className: "text-sm font-medium text-gray-900 dark:text-gray-100", children: plan.trial_days })
              ] }),
              /* @__PURE__ */ jsxs("div", { children: [
                /* @__PURE__ */ jsx("p", { className: "text-sm text-gray-500 dark:text-gray-400", children: "Sort Order" }),
                /* @__PURE__ */ jsx("p", { className: "text-sm font-medium text-gray-900 dark:text-gray-100", children: plan.sort_order })
              ] })
            ] }) })
          ] }),
          /* @__PURE__ */ jsxs(Card, { children: [
            /* @__PURE__ */ jsx(CardHeader, { children: /* @__PURE__ */ jsx(CardTitle, { children: "Pricing" }) }),
            /* @__PURE__ */ jsx(CardContent, { children: /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-2 gap-4", children: [
              /* @__PURE__ */ jsxs("div", { children: [
                /* @__PURE__ */ jsx("p", { className: "text-sm text-gray-500 dark:text-gray-400", children: "Monthly" }),
                /* @__PURE__ */ jsx("p", { className: "text-lg font-semibold text-gray-900 dark:text-gray-100", children: formatPrice(plan.price_monthly, plan.currency) })
              ] }),
              /* @__PURE__ */ jsxs("div", { children: [
                /* @__PURE__ */ jsx("p", { className: "text-sm text-gray-500 dark:text-gray-400", children: "Yearly" }),
                /* @__PURE__ */ jsx("p", { className: "text-lg font-semibold text-gray-900 dark:text-gray-100", children: formatPrice(plan.price_yearly, plan.currency) })
              ] })
            ] }) })
          ] }),
          /* @__PURE__ */ jsxs(Card, { children: [
            /* @__PURE__ */ jsx(CardHeader, { children: /* @__PURE__ */ jsx(CardTitle, { children: "Limits" }) }),
            /* @__PURE__ */ jsx(CardContent, { children: /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-2 gap-4", children: [
              /* @__PURE__ */ jsxs("div", { children: [
                /* @__PURE__ */ jsx("p", { className: "text-sm text-gray-500 dark:text-gray-400", children: "Agents" }),
                /* @__PURE__ */ jsx("p", { className: "text-sm font-medium text-gray-900 dark:text-gray-100", children: formatLimit(plan.limits.agents || 0) })
              ] }),
              /* @__PURE__ */ jsxs("div", { children: [
                /* @__PURE__ */ jsx("p", { className: "text-sm text-gray-500 dark:text-gray-400", children: "WhatsApp Connections" }),
                /* @__PURE__ */ jsx("p", { className: "text-sm font-medium text-gray-900 dark:text-gray-100", children: formatLimit(plan.limits.whatsapp_connections || 0) })
              ] }),
              /* @__PURE__ */ jsxs("div", { children: [
                /* @__PURE__ */ jsx("p", { className: "text-sm text-gray-500 dark:text-gray-400", children: "Messages Monthly" }),
                /* @__PURE__ */ jsx("p", { className: "text-sm font-medium text-gray-900 dark:text-gray-100", children: formatLimit(plan.limits.messages_monthly || 0) })
              ] }),
              /* @__PURE__ */ jsxs("div", { children: [
                /* @__PURE__ */ jsx("p", { className: "text-sm text-gray-500 dark:text-gray-400", children: "Template Sends Monthly" }),
                /* @__PURE__ */ jsx("p", { className: "text-sm font-medium text-gray-900 dark:text-gray-100", children: formatLimit(plan.limits.template_sends_monthly || 0) })
              ] }),
              /* @__PURE__ */ jsxs("div", { children: [
                /* @__PURE__ */ jsx("p", { className: "text-sm text-gray-500 dark:text-gray-400", children: "AI Credits Monthly" }),
                /* @__PURE__ */ jsx("p", { className: "text-sm font-medium text-gray-900 dark:text-gray-100", children: formatLimit(plan.limits.ai_credits_monthly || 0) })
              ] }),
              /* @__PURE__ */ jsxs("div", { children: [
                /* @__PURE__ */ jsx("p", { className: "text-sm text-gray-500 dark:text-gray-400", children: "Data Retention (Days)" }),
                /* @__PURE__ */ jsx("p", { className: "text-sm font-medium text-gray-900 dark:text-gray-100", children: formatLimit(plan.limits.retention_days || 0) })
              ] })
            ] }) })
          ] }),
          /* @__PURE__ */ jsxs(Card, { children: [
            /* @__PURE__ */ jsx(CardHeader, { children: /* @__PURE__ */ jsx(CardTitle, { children: "Modules" }) }),
            /* @__PURE__ */ jsx(CardContent, { children: plan.modules && plan.modules.length > 0 ? /* @__PURE__ */ jsx("div", { className: "flex flex-wrap gap-2", children: plan.modules.map((moduleKey) => /* @__PURE__ */ jsx(Badge, { variant: "info", children: moduleNames[moduleKey] || moduleKey }, moduleKey)) }) : /* @__PURE__ */ jsx("p", { className: "text-sm text-gray-500 dark:text-gray-400", children: "No modules included" }) })
          ] })
        ] }),
        /* @__PURE__ */ jsx("div", { children: /* @__PURE__ */ jsxs(Card, { children: [
          /* @__PURE__ */ jsxs(CardHeader, { children: [
            /* @__PURE__ */ jsx(CardTitle, { children: "Subscriptions" }),
            /* @__PURE__ */ jsxs(CardDescription, { children: [
              plan.subscriptions.length,
              " tenant",
              plan.subscriptions.length !== 1 ? "s" : "",
              " using this plan"
            ] })
          ] }),
          /* @__PURE__ */ jsx(CardContent, { children: plan.subscriptions.length === 0 ? /* @__PURE__ */ jsx("p", { className: "text-sm text-gray-500 dark:text-gray-400 text-center py-4", children: "No subscriptions yet" }) : /* @__PURE__ */ jsx("div", { className: "space-y-3", children: plan.subscriptions.map((subscription) => /* @__PURE__ */ jsxs(
            Link,
            {
              href: route("platform.accounts.show", { account: subscription.account.id }),
              className: "block p-3 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors",
              children: [
                /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between mb-2", children: [
                  /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
                    /* @__PURE__ */ jsx(Building2, { className: "h-4 w-4 text-gray-400" }),
                    /* @__PURE__ */ jsx("span", { className: "text-sm font-medium text-gray-900 dark:text-gray-100", children: subscription.account.name })
                  ] }),
                  getStatusBadge(subscription.status)
                ] }),
                /* @__PURE__ */ jsxs("p", { className: "text-xs text-gray-500 dark:text-gray-400", children: [
                  "Started ",
                  new Date(subscription.started_at).toLocaleDateString()
                ] })
              ]
            },
            subscription.id
          )) }) })
        ] }) })
      ] })
    ] })
  ] });
}
export {
  PlansShow as default
};
