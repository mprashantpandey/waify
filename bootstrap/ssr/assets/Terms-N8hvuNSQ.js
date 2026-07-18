import { jsxs, jsx } from "react/jsx-runtime";
import { Head } from "@inertiajs/react";
import { f as MarketingLayout } from "./Marketing-DVQdzdv4.js";
import { C as Card } from "./Card-BtIXZ0GS.js";
import "lucide-react";
import "react";
import "./BrandingWrapper-DdVUILzh.js";
import "./utils-B2ZNUmII.js";
import "clsx";
import "tailwind-merge";
import "./BrandLogo-TeztHB0m.js";
import "./useToast-BN7qsQL3.js";
import "./CookieConsentBanner-X10ew4Dy.js";
import "./Button-BJftGNki.js";
import "./ProviderLogo-1eHVtujo.js";
function Terms() {
  return /* @__PURE__ */ jsxs(MarketingLayout, { page: "terms", children: [
    /* @__PURE__ */ jsx(Head, { title: "Terms of Service" }),
    /* @__PURE__ */ jsxs(Card, { className: "space-y-2 p-6 sm:p-8", children: [
      /* @__PURE__ */ jsx(LegalSection, { title: "Acceptance", children: "By using Zyptos you agree to these terms, workspace policies configured by your organization, and Meta's WhatsApp Business Platform requirements." }),
      /* @__PURE__ */ jsx(LegalSection, { title: "Acceptable use", children: "You are responsible for opt-in consent, lawful messaging, template accuracy, opt-out handling, and avoiding spam, prohibited industries, misleading offers, or policy violations. See the Acceptable Use Policy for practical rules." }),
      /* @__PURE__ */ jsx(LegalSection, { title: "Billing", children: "Plans are billed per workspace and renew according to the selected cycle. Bank/UPI payments require proof upload and admin approval. Razorpay is used for one-time Zyptos checkout where enabled. Discounts, trials, cancellations, overdue status, and renewals determine access to paid actions." }),
      /* @__PURE__ */ jsx(LegalSection, { title: "Refunds and cancellations", children: "Refund and cancellation requests are reviewed under the Refund and Cancellation Policy. Meta conversation charges, third-party provider costs, consumed usage, and completed custom work are generally separate from Zyptos subscription refunds." }),
      /* @__PURE__ */ jsx(LegalSection, { title: "Trials and Enterprise", children: "Self-service trials are limited per email account. Enterprise plans, custom limits, and special activations require platform admin approval and may require additional onboarding or commercial review." }),
      /* @__PURE__ */ jsx(LegalSection, { title: "Platform and Meta APIs", children: "Zyptos helps connect Meta APIs, but Meta may independently review, limit, pause, or reject apps, templates, numbers, and WABAs. Your business remains responsible for Meta Business Platform requirements and content compliance." }),
      /* @__PURE__ */ jsx(LegalSection, { title: "Unofficial QR connection", children: "QR-based WhatsApp login is marked unofficial. It is not the Meta Cloud API and may carry account limitations or enforcement risk. Use Cloud API for production where possible and read the QR WhatsApp Disclaimer before enabling QR mode." }),
      /* @__PURE__ */ jsx(LegalSection, { title: "AI and automation", children: "Automation and AI-agent features must be configured with approved knowledge, reasonable limits, and human handoff rules. Zyptos may throttle or pause automation that creates duplicate replies, policy risk, excessive sending, or support escalation risk." }),
      /* @__PURE__ */ jsx(LegalSection, { title: "Suspension", children: "We may restrict sending, billing actions, or admin operations when accounts violate policy, payment fails, or security risk is detected." })
    ] })
  ] });
}
function LegalSection({ title, children }) {
  return /* @__PURE__ */ jsxs("section", { className: "mb-8 last:mb-0", children: [
    /* @__PURE__ */ jsx("h2", { className: "mb-3 text-lg font-semibold text-waify-text dark:text-waify-dark-text", children: title }),
    /* @__PURE__ */ jsx("div", { className: "text-sm leading-relaxed text-waify-text-muted dark:text-waify-dark-text-muted", children })
  ] });
}
export {
  Terms as default
};
