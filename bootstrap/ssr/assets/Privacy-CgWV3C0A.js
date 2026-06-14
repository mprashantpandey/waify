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
function Privacy() {
  return /* @__PURE__ */ jsxs(MarketingLayout, { page: "privacy", children: [
    /* @__PURE__ */ jsx(Head, { title: "Privacy Policy" }),
    /* @__PURE__ */ jsxs(Card, { className: "space-y-2 p-6 sm:p-8", children: [
      /* @__PURE__ */ jsx(LegalSection, { title: "Overview", children: "We collect account, billing, workspace, Meta connection, contact, campaign, and support data to operate Zyptos. We do not sell your contact lists." }),
      /* @__PURE__ */ jsx(LegalSection, { title: "Data we process", children: "Business profile data, encrypted WABA credentials, phone registration state, webhook events, contacts you upload or sync, Meta lead records, campaign analytics, call metadata, billing records, integration logs, and audit logs." }),
      /* @__PURE__ */ jsx(LegalSection, { title: "Integrations and providers", children: "When you connect Meta, Google, Razorpay, AI providers, voice providers, or webhooks, Zyptos stores the minimum configuration needed to operate the integration. Secrets are encrypted and access should be restricted to authorized workspace owners or admins." }),
      /* @__PURE__ */ jsx(LegalSection, { title: "Retention and controls", children: "Retention follows your plan, workspace settings, and legal requirements. Workspace owners can export or delete operational data where Meta policy, audit requirements, and law allow it." }),
      /* @__PURE__ */ jsx(LegalSection, { title: "Security", children: "Sensitive credentials are encrypted, access is role controlled, and platform/admin actions are logged for operational review." }),
      /* @__PURE__ */ jsxs(LegalSection, { title: "Contact", children: [
        "Privacy requests can be sent to ",
        /* @__PURE__ */ jsx("a", { href: "mailto:privacy@zyptos.com", className: "text-waify-green-dark hover:underline", children: "privacy@zyptos.com" }),
        "."
      ] })
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
  Privacy as default
};
