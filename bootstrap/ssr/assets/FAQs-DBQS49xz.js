import { jsxs, jsx } from "react/jsx-runtime";
import { Head, Link } from "@inertiajs/react";
import { m as marketingFaq, f as MarketingLayout, c as MarketingFaqAccordion, g as MarketingIntegrationsShowcase } from "./Marketing-xvuXbqSy.js";
import { MessageCircle, WalletCards, ShieldCheck } from "lucide-react";
import { C as Card } from "./Card-BtIXZ0GS.js";
import { B as Button } from "./Button-BJftGNki.js";
import "react";
import "./BrandingWrapper-CZn0jBQL.js";
import "./utils-B2ZNUmII.js";
import "clsx";
import "tailwind-merge";
import "./useToast-BN7qsQL3.js";
import "./CookieConsentBanner-X10ew4Dy.js";
import "./ProviderLogo-DiN8H8HE.js";
function FAQs({ faqs = [] }) {
  const items = faqs.length ? faqs.map((item) => ({ q: item.q || item.question || "", a: item.a || item.answer || "" })).filter((item) => item.q && item.a) : marketingFaq;
  return /* @__PURE__ */ jsxs(MarketingLayout, { page: "faq", children: [
    /* @__PURE__ */ jsx(Head, { title: "FAQs" }),
    /* @__PURE__ */ jsx("div", { className: "mb-8 grid gap-3 sm:grid-cols-3", children: [
      [MessageCircle, "Meta setup", "WABA, phone registration, scopes, and webhooks."],
      [WalletCards, "Billing", "Trials, renewals, discounts, Razorpay, and invoices."],
      [ShieldCheck, "Workspaces", "Roles, permissions, diagnostics, and admin separation."]
    ].map(([Icon, title, body]) => /* @__PURE__ */ jsxs(Card, { className: "p-4", children: [
      /* @__PURE__ */ jsx(Icon, { className: "mb-3 h-5 w-5 text-waify-green-dark" }),
      /* @__PURE__ */ jsx("h2", { className: "text-sm font-semibold", children: title }),
      /* @__PURE__ */ jsx("p", { className: "mt-1 text-xs leading-relaxed text-waify-text-muted dark:text-waify-dark-text-muted", children: body })
    ] }, title)) }),
    /* @__PURE__ */ jsx(MarketingFaqAccordion, { items }),
    /* @__PURE__ */ jsxs("div", { className: "mt-10", children: [
      /* @__PURE__ */ jsx("h2", { className: "mb-3 text-lg font-bold text-waify-text dark:text-waify-dark-text", children: "Available integrations" }),
      /* @__PURE__ */ jsx(MarketingIntegrationsShowcase, { compact: true })
    ] }),
    /* @__PURE__ */ jsx("div", { className: "mt-8 text-center", children: /* @__PURE__ */ jsx(Link, { href: route("contact"), children: /* @__PURE__ */ jsx(Button, { variant: "secondary", children: "Still need help?" }) }) })
  ] });
}
export {
  FAQs as default
};
