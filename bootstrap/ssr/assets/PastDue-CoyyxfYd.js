import { jsxs, Fragment, jsx } from "react/jsx-runtime";
import { Head, Link } from "@inertiajs/react";
import { A as AppShell } from "./AppShell-BMIA1AnI.js";
import { C as Card, a as CardContent } from "./Card-BtIXZ0GS.js";
import { AlertCircle, CreditCard, ArrowRight } from "lucide-react";
import { B as Button } from "./Button-BJftGNki.js";
import "react";
import "./utils-B2ZNUmII.js";
import "clsx";
import "tailwind-merge";
import "./BrandLogo-TeztHB0m.js";
import "axios";
import "./Badge-C65MHc2S.js";
import "./Elements-EbyZDnT_.js";
import "@headlessui/react";
import "./BrandingWrapper-DdVUILzh.js";
import "./useToast-BN7qsQL3.js";
import "./CookieConsentBanner-X10ew4Dy.js";
import "./RealtimeProvider-D1qLzQY9.js";
import "laravel-echo";
import "pusher-js";
function BillingPastDue({
  account,
  subscription
}) {
  return /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsx(Head, { title: "Subscription Past Due" }),
    /* @__PURE__ */ jsx(AppShell, { children: /* @__PURE__ */ jsx("div", { className: "mx-auto flex min-h-[calc(100vh-8rem)] max-w-[1400px] items-center justify-center p-4 sm:p-6", children: /* @__PURE__ */ jsx(Card, { className: "w-full max-w-lg overflow-hidden", children: /* @__PURE__ */ jsxs(CardContent, { className: "p-8", children: [
      /* @__PURE__ */ jsx("div", { className: "mb-6 flex h-12 w-12 items-center justify-center rounded-lg bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300", children: /* @__PURE__ */ jsx(AlertCircle, { className: "h-6 w-6" }) }),
      /* @__PURE__ */ jsx("h1", { className: "mb-3 text-2xl font-bold text-gray-900 dark:text-gray-100", children: "Subscription Past Due" }),
      /* @__PURE__ */ jsxs("p", { className: "mb-6 text-sm text-gray-600 dark:text-gray-400", children: [
        "Your subscription for ",
        /* @__PURE__ */ jsx("strong", { className: "text-gray-900 dark:text-gray-100", children: account.name }),
        " is past due."
      ] }),
      subscription.last_error && /* @__PURE__ */ jsx("div", { className: "mb-6 rounded-lg border border-amber-200 bg-amber-50 p-4 text-left dark:border-amber-800 dark:bg-amber-900/20", children: /* @__PURE__ */ jsxs("p", { className: "text-sm text-amber-800 dark:text-amber-200", children: [
        /* @__PURE__ */ jsx("strong", { children: "Reason:" }),
        " ",
        subscription.last_error
      ] }) }),
      /* @__PURE__ */ jsx("p", { className: "mb-6 text-sm text-gray-500 dark:text-gray-400", children: "Please update your payment method or contact support to restore access." }),
      /* @__PURE__ */ jsx(Link, { href: route("app.billing.index", {}), children: /* @__PURE__ */ jsxs(Button, { className: "w-full gap-2", children: [
        /* @__PURE__ */ jsx(CreditCard, { className: "h-4 w-4" }),
        "Go to Billing",
        /* @__PURE__ */ jsx(ArrowRight, { className: "h-4 w-4" })
      ] }) })
    ] }) }) }) })
  ] });
}
export {
  BillingPastDue as default
};
