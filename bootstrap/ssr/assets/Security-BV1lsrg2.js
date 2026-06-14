import { jsxs, jsx } from "react/jsx-runtime";
import { Head } from "@inertiajs/react";
import { f as MarketingLayout, a as MarketingIcon } from "./Marketing-xvuXbqSy.js";
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
function Security() {
  return /* @__PURE__ */ jsxs(MarketingLayout, { page: "security", wide: true, children: [
    /* @__PURE__ */ jsx(Head, { title: "Security" }),
    /* @__PURE__ */ jsx("div", { className: "grid gap-4 sm:grid-cols-2", children: [
      ["shield", "Encryption", "TLS in transit and encrypted storage for sensitive credentials."],
      ["key", "Access control", "Workspace roles, admin separation, impersonation logs, and permission checks."],
      ["server", "Infrastructure", "Operational monitoring for app, queues, cron, storage, pusher, and delivery systems."],
      ["bell", "Incident response", "Webhook verification, audit trails, and escalation workflow for confirmed incidents."]
    ].map(([icon, title, body]) => /* @__PURE__ */ jsxs(Card, { className: "mkt-card-lift p-5", children: [
      /* @__PURE__ */ jsx(MarketingIcon, { name: icon, size: 22, className: "mb-3 text-waify-green-dark" }),
      /* @__PURE__ */ jsx("h2", { className: "font-semibold", children: title }),
      /* @__PURE__ */ jsx("p", { className: "mt-1 text-sm leading-relaxed text-waify-text-muted dark:text-waify-dark-text-muted", children: body })
    ] }, title)) }),
    /* @__PURE__ */ jsxs(Card, { className: "mt-6 p-6", children: [
      /* @__PURE__ */ jsx("h2", { className: "font-semibold", children: "Report a vulnerability" }),
      /* @__PURE__ */ jsxs("p", { className: "mt-2 text-sm leading-relaxed text-waify-text-muted dark:text-waify-dark-text-muted", children: [
        "Email ",
        /* @__PURE__ */ jsx("a", { href: "mailto:security@zyptos.com", className: "text-waify-green-dark hover:underline", children: "security@zyptos.com" }),
        " with reproducible details. Please avoid accessing customer data while validating reports."
      ] })
    ] })
  ] });
}
export {
  Security as default
};
