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
function Cookies() {
  return /* @__PURE__ */ jsxs(MarketingLayout, { page: "cookies", children: [
    /* @__PURE__ */ jsx(Head, { title: "Cookie Policy" }),
    /* @__PURE__ */ jsxs(Card, { className: "space-y-8 p-6 sm:p-8", children: [
      /* @__PURE__ */ jsx(Section, { title: "Essential cookies", children: "Zyptos uses essential cookies for login sessions, CSRF protection, workspace context, theme preference, and security controls." }),
      /* @__PURE__ */ jsx(Section, { title: "Analytics cookies", children: "Optional analytics help us understand page usage and product friction. These should respect the cookie consent preference configured for the platform." }),
      /* @__PURE__ */ jsx(Section, { title: "Managing cookies", children: "You can disable non-essential cookies in your browser. The application cannot operate correctly without secure session cookies." })
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
  Cookies as default
};
