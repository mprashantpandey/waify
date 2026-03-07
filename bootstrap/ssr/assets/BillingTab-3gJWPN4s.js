import { jsxs, jsx } from "react/jsx-runtime";
import { Link } from "@inertiajs/react";
import { C as Card, b as CardHeader, c as CardTitle, d as CardDescription, a as CardContent } from "./Card-DLPTnTfC.js";
import { B as Button } from "./Button-ymbdH_NY.js";
import { CreditCard, TrendingUp, ShieldCheck, ArrowRight, Receipt, Wallet } from "lucide-react";
import "./utils-B2ZNUmII.js";
import "clsx";
import "tailwind-merge";
import "react";
function BillingTab() {
  return /* @__PURE__ */ jsxs("div", { className: "space-y-6", children: [
    /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 md:grid-cols-3 gap-3", children: [
      /* @__PURE__ */ jsxs("div", { className: "rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-900", children: [
        /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400", children: [
          /* @__PURE__ */ jsx(CreditCard, { className: "h-3.5 w-3.5" }),
          "Subscription"
        ] }),
        /* @__PURE__ */ jsx("div", { className: "mt-1 text-sm font-semibold text-gray-900 dark:text-gray-100", children: "Plan and renewal" })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-900", children: [
        /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400", children: [
          /* @__PURE__ */ jsx(TrendingUp, { className: "h-3.5 w-3.5" }),
          "Usage"
        ] }),
        /* @__PURE__ */ jsx("div", { className: "mt-1 text-sm font-semibold text-gray-900 dark:text-gray-100", children: "Messages, templates, limits" })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-900", children: [
        /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400", children: [
          /* @__PURE__ */ jsx(ShieldCheck, { className: "h-3.5 w-3.5" }),
          "Billing safety"
        ] }),
        /* @__PURE__ */ jsx("div", { className: "mt-1 text-sm font-semibold text-gray-900 dark:text-gray-100", children: "Transactions and history" })
      ] })
    ] }),
    /* @__PURE__ */ jsxs(Card, { className: "border-0 shadow-lg", children: [
      /* @__PURE__ */ jsx(CardHeader, { className: "bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20", children: /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3", children: [
        /* @__PURE__ */ jsx("div", { className: "p-2 bg-blue-500 rounded-xl", children: /* @__PURE__ */ jsx(CreditCard, { className: "h-5 w-5 text-white" }) }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx(CardTitle, { className: "text-xl font-bold", children: "Billing & Subscription" }),
          /* @__PURE__ */ jsx(CardDescription, { children: "Manage your subscription, view usage, and change plans" })
        ] })
      ] }) }),
      /* @__PURE__ */ jsxs(CardContent, { className: "p-6", children: [
        /* @__PURE__ */ jsx("p", { className: "text-sm text-gray-600 dark:text-gray-400 mb-4", children: "View your current plan, manage billing, and upgrade or downgrade your subscription." }),
        /* @__PURE__ */ jsxs("div", { className: "flex flex-wrap gap-3", children: [
          /* @__PURE__ */ jsx(Link, { href: route("app.billing.index", {}), children: /* @__PURE__ */ jsxs(Button, { variant: "secondary", className: "rounded-xl group", children: [
            /* @__PURE__ */ jsx(CreditCard, { className: "h-4 w-4 mr-2" }),
            "Open Billing",
            /* @__PURE__ */ jsx(ArrowRight, { className: "h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" })
          ] }) }),
          /* @__PURE__ */ jsx(Link, { href: route("app.billing.transactions", {}), children: /* @__PURE__ */ jsxs(Button, { variant: "secondary", className: "rounded-xl group", children: [
            /* @__PURE__ */ jsx(Receipt, { className: "h-4 w-4 mr-2" }),
            "Transactions"
          ] }) })
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxs(Card, { className: "border-0 shadow-lg", children: [
      /* @__PURE__ */ jsx(CardHeader, { className: "bg-gradient-to-r from-gray-50 to-white dark:from-gray-800 dark:to-gray-900", children: /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3", children: [
        /* @__PURE__ */ jsx("div", { className: "p-2 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl", children: /* @__PURE__ */ jsx(TrendingUp, { className: "h-5 w-5 text-white" }) }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx(CardTitle, { className: "text-xl font-bold", children: "Usage & Limits" }),
          /* @__PURE__ */ jsx(CardDescription, { children: "View detailed usage statistics and billing history" })
        ] })
      ] }) }),
      /* @__PURE__ */ jsxs(CardContent, { className: "p-6", children: [
        /* @__PURE__ */ jsx("p", { className: "text-sm text-gray-600 dark:text-gray-400 mb-4", children: "Monitor your usage across messages, templates, connections, and more." }),
        /* @__PURE__ */ jsxs("div", { className: "flex flex-wrap gap-3", children: [
          /* @__PURE__ */ jsx(Link, { href: route("app.billing.usage", {}), children: /* @__PURE__ */ jsxs(Button, { variant: "secondary", className: "rounded-xl group", children: [
            /* @__PURE__ */ jsx(TrendingUp, { className: "h-4 w-4 mr-2" }),
            "View Usage Details",
            /* @__PURE__ */ jsx(ArrowRight, { className: "h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" })
          ] }) }),
          /* @__PURE__ */ jsx(Link, { href: route("app.billing.history", {}), children: /* @__PURE__ */ jsxs(Button, { variant: "secondary", className: "rounded-xl", children: [
            /* @__PURE__ */ jsx(Wallet, { className: "h-4 w-4 mr-2" }),
            "Payment History"
          ] }) })
        ] })
      ] })
    ] })
  ] });
}
export {
  BillingTab as default
};
