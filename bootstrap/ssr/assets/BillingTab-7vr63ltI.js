import { jsx, jsxs } from "react/jsx-runtime";
import { Link } from "@inertiajs/react";
import { C as Card, c as CardContent, a as CardHeader, b as CardTitle, d as CardDescription } from "./Card-8uw03vLH.js";
import { B as Button } from "./Button-BocaoVWt.js";
import { CreditCard, ArrowRight, TrendingUp } from "lucide-react";
import "./utils-H80jjgLf.js";
import "clsx";
import "tailwind-merge";
import "react";
function BillingTab({ workspace }) {
  if (!workspace) {
    return /* @__PURE__ */ jsx(Card, { className: "border-0 shadow-lg", children: /* @__PURE__ */ jsxs(CardContent, { className: "py-12 text-center", children: [
      /* @__PURE__ */ jsx("div", { className: "inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-800 mb-4", children: /* @__PURE__ */ jsx(CreditCard, { className: "h-8 w-8 text-gray-400" }) }),
      /* @__PURE__ */ jsx("p", { className: "text-gray-500 dark:text-gray-400 font-medium", children: "No workspace selected" })
    ] }) });
  }
  return /* @__PURE__ */ jsxs("div", { className: "space-y-6", children: [
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
        /* @__PURE__ */ jsx(Link, { href: route("app.billing.index", { workspace: workspace.slug }), children: /* @__PURE__ */ jsxs(Button, { variant: "secondary", className: "rounded-xl group", children: [
          /* @__PURE__ */ jsx(CreditCard, { className: "h-4 w-4 mr-2" }),
          "Go to Billing",
          /* @__PURE__ */ jsx(ArrowRight, { className: "h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" })
        ] }) })
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
        /* @__PURE__ */ jsx(Link, { href: route("app.billing.usage", { workspace: workspace.slug }), children: /* @__PURE__ */ jsxs(Button, { variant: "secondary", className: "rounded-xl group", children: [
          /* @__PURE__ */ jsx(TrendingUp, { className: "h-4 w-4 mr-2" }),
          "View Usage Details",
          /* @__PURE__ */ jsx(ArrowRight, { className: "h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" })
        ] }) })
      ] })
    ] })
  ] });
}
export {
  BillingTab as default
};
