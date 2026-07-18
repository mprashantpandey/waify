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
function GDPR() {
  return /* @__PURE__ */ jsxs(MarketingLayout, { page: "gdpr", children: [
    /* @__PURE__ */ jsx(Head, { title: "GDPR" }),
    /* @__PURE__ */ jsxs(Card, { className: "space-y-8 p-6 sm:p-8", children: [
      /* @__PURE__ */ jsx(Section, { title: "Your rights", children: "Customers and data subjects can request access, rectification, erasure, restriction, portability, and objection where applicable." }),
      /* @__PURE__ */ jsx(Section, { title: "Lawful basis", children: "Zyptos processes account and workspace data for contract performance, security logs for legitimate interest, and marketing preferences by consent where required." }),
      /* @__PURE__ */ jsx(Section, { title: "Workspace controls", children: "Workspace owners can export contacts, remove lists, review audit logs, and configure retention according to their operational policy." }),
      /* @__PURE__ */ jsxs(Section, { title: "DPO contact", children: [
        "Email ",
        /* @__PURE__ */ jsx("a", { href: "mailto:dpo@zyptos.com", className: "text-waify-green-dark hover:underline", children: "dpo@zyptos.com" }),
        ". We respond to valid requests within the required legal window."
      ] })
    ] })
  ] });
}
function Section({ title, children }) {
  return /* @__PURE__ */ jsxs("section", { children: [
    /* @__PURE__ */ jsx("h2", { className: "mb-2 text-lg font-semibold", children: title }),
    /* @__PURE__ */ jsx("p", { className: "text-sm leading-relaxed text-waify-text-muted dark:text-waify-dark-text-muted", children })
  ] });
}
export {
  GDPR as default
};
