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
function QrDisclaimer() {
  return /* @__PURE__ */ jsxs(MarketingLayout, { page: "qrDisclaimer", children: [
    /* @__PURE__ */ jsx(Head, { title: "QR WhatsApp Disclaimer" }),
    /* @__PURE__ */ jsxs(Card, { className: "space-y-2 p-6 sm:p-8", children: [
      /* @__PURE__ */ jsx(LegalSection, { title: "Unofficial connection type", children: "QR WhatsApp login in Zyptos is marked unofficial. It is not the Meta WhatsApp Cloud API, not an official Meta integration path, and is provided only for limited compatibility scenarios." }),
      /* @__PURE__ */ jsx(LegalSection, { title: "Production recommendation", children: "Use Meta Cloud API embedded signup for production messaging, templates, webhooks, team inboxes, campaigns, and automation wherever possible." }),
      /* @__PURE__ */ jsx(LegalSection, { title: "Account risk", children: "Unofficial automation can carry WhatsApp account limitations or enforcement risk. Zyptos adds conservative controls, but cannot guarantee anti-ban protection, uninterrupted sessions, or full feature parity with Cloud API." }),
      /* @__PURE__ */ jsx(LegalSection, { title: "Safe usage expectations", children: "Keep volume modest, message only opted-in contacts, avoid scraping or cold spam, respect opt-outs, avoid rapid repeated sends, and do not treat QR mode as a replacement for Meta-approved business messaging." }),
      /* @__PURE__ */ jsx(LegalSection, { title: "Feature differences", children: "QR mode may not support the same template, webhook, analytics, calling, delivery status, billing, or compliance behavior as Meta Cloud API. Some features can be delayed, unavailable, or best-effort." })
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
  QrDisclaimer as default
};
