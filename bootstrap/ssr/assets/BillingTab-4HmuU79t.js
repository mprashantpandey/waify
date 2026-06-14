import { jsxs, jsx } from "react/jsx-runtime";
import { Link } from "@inertiajs/react";
import { C as Card } from "./Card-BtIXZ0GS.js";
import { B as Button } from "./Button-BJftGNki.js";
import { CreditCard, ArrowRight, TrendingUp } from "lucide-react";
import "./utils-B2ZNUmII.js";
import "clsx";
import "tailwind-merge";
import "react";
function BillingTab() {
  return /* @__PURE__ */ jsxs("div", { className: "grid gap-4 md:grid-cols-2", children: [
    /* @__PURE__ */ jsxs(Card, { className: "p-5", children: [
      /* @__PURE__ */ jsx("div", { className: "flex h-10 w-10 items-center justify-center rounded-lg bg-waify-green-soft text-waify-green-dark dark:bg-emerald-950/40 dark:text-emerald-300", children: /* @__PURE__ */ jsx(CreditCard, { className: "h-5 w-5" }) }),
      /* @__PURE__ */ jsx("p", { className: "mt-4 text-sm text-waify-text-muted dark:text-waify-dark-text-muted", children: "View your current plan, manage billing, and upgrade or downgrade your subscription." }),
      /* @__PURE__ */ jsx(Link, { href: route("app.billing.index", {}), className: "mt-4 inline-flex", children: /* @__PURE__ */ jsxs(Button, { variant: "secondary", className: "group", children: [
        /* @__PURE__ */ jsx(CreditCard, { className: "h-4 w-4" }),
        "Go to billing",
        /* @__PURE__ */ jsx(ArrowRight, { className: "h-4 w-4 transition-transform group-hover:translate-x-1" })
      ] }) })
    ] }),
    /* @__PURE__ */ jsxs(Card, { className: "p-5", children: [
      /* @__PURE__ */ jsx("div", { className: "flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-300", children: /* @__PURE__ */ jsx(TrendingUp, { className: "h-5 w-5" }) }),
      /* @__PURE__ */ jsx("p", { className: "mt-4 text-sm text-waify-text-muted dark:text-waify-dark-text-muted", children: "Monitor usage across messages, templates, connections, and billing history." }),
      /* @__PURE__ */ jsx(Link, { href: route("app.billing.index", { tab: "usage" }), className: "mt-4 inline-flex", children: /* @__PURE__ */ jsxs(Button, { variant: "secondary", className: "group", children: [
        /* @__PURE__ */ jsx(TrendingUp, { className: "h-4 w-4" }),
        "View usage details",
        /* @__PURE__ */ jsx(ArrowRight, { className: "h-4 w-4 transition-transform group-hover:translate-x-1" })
      ] }) })
    ] })
  ] });
}
export {
  BillingTab as default
};
