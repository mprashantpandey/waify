import { jsxs, Fragment, jsx } from "react/jsx-runtime";
import { Head, Link } from "@inertiajs/react";
import { C as Card, c as CardContent } from "./Card-8uw03vLH.js";
import { AlertCircle } from "lucide-react";
import { B as Button } from "./Button-BocaoVWt.js";
import "./utils-H80jjgLf.js";
import "clsx";
import "tailwind-merge";
import "react";
function BillingPastDue({
  workspace,
  subscription
}) {
  return /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsx(Head, { title: "Subscription Past Due" }),
    /* @__PURE__ */ jsx("div", { className: "min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 flex items-center justify-center p-4", children: /* @__PURE__ */ jsx(Card, { className: "w-full max-w-md border-0 shadow-2xl", children: /* @__PURE__ */ jsxs(CardContent, { className: "pt-12 pb-8 text-center", children: [
      /* @__PURE__ */ jsx("div", { className: "inline-flex items-center justify-center w-24 h-24 rounded-full bg-gradient-to-br from-yellow-100 to-yellow-200 dark:from-yellow-900/20 dark:to-yellow-800/20 mb-6", children: /* @__PURE__ */ jsx(AlertCircle, { className: "h-12 w-12 text-yellow-600 dark:text-yellow-400" }) }),
      /* @__PURE__ */ jsx("h1", { className: "text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-gray-100 dark:to-gray-300 bg-clip-text text-transparent mb-3", children: "Subscription Past Due" }),
      /* @__PURE__ */ jsxs("p", { className: "text-gray-600 dark:text-gray-400 mb-6", children: [
        "Your subscription for ",
        /* @__PURE__ */ jsx("strong", { className: "text-gray-900 dark:text-gray-100", children: workspace.name }),
        " is past due."
      ] }),
      subscription.last_error && /* @__PURE__ */ jsx("div", { className: "bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-xl p-4 mb-6 text-left", children: /* @__PURE__ */ jsxs("p", { className: "text-sm text-yellow-800 dark:text-yellow-200", children: [
        /* @__PURE__ */ jsx("strong", { children: "Reason:" }),
        " ",
        subscription.last_error
      ] }) }),
      /* @__PURE__ */ jsx("p", { className: "text-sm text-gray-500 dark:text-gray-400 mb-6", children: "Please update your payment method or contact support to restore access." }),
      /* @__PURE__ */ jsx(Link, { href: route("app.billing.index", { workspace: workspace.slug }), children: /* @__PURE__ */ jsx(Button, { className: "bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 shadow-lg shadow-blue-500/50 rounded-xl w-full", children: "Go to Billing" }) })
    ] }) }) })
  ] });
}
export {
  BillingPastDue as default
};
