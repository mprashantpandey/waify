import { jsxs, jsx } from "react/jsx-runtime";
import { Head } from "@inertiajs/react";
import { f as MarketingLayout } from "./Marketing-xvuXbqSy.js";
import { C as Card } from "./Card-BtIXZ0GS.js";
import "lucide-react";
import "react";
import "./BrandingWrapper-CZn0jBQL.js";
import "./utils-B2ZNUmII.js";
import "clsx";
import "tailwind-merge";
import "./useToast-BN7qsQL3.js";
import "./CookieConsentBanner-X10ew4Dy.js";
import "./Button-BJftGNki.js";
import "./ProviderLogo-DiN8H8HE.js";
const rules = [
  ["Consent first", "Only message people who gave clear consent or where you have a lawful, policy-compliant reason to contact them. Do not upload purchased, scraped, or harvested lists."],
  ["Respect opt-outs", "Honor stop, unsubscribe, and opt-out requests quickly. Do not re-add opted-out contacts to campaigns without renewed consent."],
  ["Use accurate templates", "Template names, categories, variables, examples, buttons, offers, and claims must match the actual message purpose and landing page."],
  ["Avoid spam patterns", "Do not send repetitive, misleading, high-frequency, or irrelevant broadcasts. Use segments, source tags, and retry only failed recipients when needed."],
  ["Follow Meta policy", "Your business remains responsible for WhatsApp Business Platform, Commerce, Business, and Messaging policy compliance. Meta may reject templates, restrict numbers, or pause WABAs independently."],
  ["Use AI responsibly", "AI agents should be supervised, bounded by business-approved knowledge, and configured to hand off when unsure, when a user asks for a human, or when policy-sensitive topics appear."],
  ["Protect credentials", "Do not share WABA tokens, app secrets, API keys, AI provider keys, or payment keys with unauthorized people. Use owner/admin-only access for integrations."]
];
function AcceptableUse() {
  return /* @__PURE__ */ jsxs(MarketingLayout, { page: "acceptableUse", children: [
    /* @__PURE__ */ jsx(Head, { title: "Acceptable Use Policy" }),
    /* @__PURE__ */ jsxs("div", { className: "space-y-4", children: [
      rules.map(([title, body]) => /* @__PURE__ */ jsxs(Card, { className: "p-5", children: [
        /* @__PURE__ */ jsx("h2", { className: "font-semibold text-waify-text dark:text-waify-dark-text", children: title }),
        /* @__PURE__ */ jsx("p", { className: "mt-2 text-sm leading-relaxed text-waify-text-muted dark:text-waify-dark-text-muted", children: body })
      ] }, title)),
      /* @__PURE__ */ jsxs(Card, { className: "border-red-200 bg-red-50 p-5 dark:border-red-500/30 dark:bg-red-500/10", children: [
        /* @__PURE__ */ jsx("h2", { className: "font-semibold text-red-700 dark:text-red-200", children: "Restricted activity" }),
        /* @__PURE__ */ jsx("p", { className: "mt-2 text-sm leading-relaxed text-red-700/85 dark:text-red-100/85", children: "Zyptos may pause sending, automation, integrations, or workspace access when activity creates deliverability risk, security risk, payment risk, legal risk, or a likely Meta policy violation." })
      ] })
    ] })
  ] });
}
export {
  AcceptableUse as default
};
