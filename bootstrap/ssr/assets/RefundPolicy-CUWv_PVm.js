import { jsxs, jsx } from "react/jsx-runtime";
import { L as LegalDocumentPage } from "./LegalDocumentPage-DL26LQ4K.js";
import { RotateCcw } from "lucide-react";
import "./PublicLayout-CRYi50tL.js";
import "@inertiajs/react";
import "react";
import "./BrandingWrapper-BZp9WdA-.js";
import "../ssr.js";
import "@inertiajs/react/server";
import "./vendor-BWyHebfG.js";
import "react-dom/server";
import "./Button-ymbdH_NY.js";
import "./utils-B2ZNUmII.js";
import "clsx";
import "tailwind-merge";
import "./CookieConsentBanner-BJ5KL4CC.js";
function RefundPolicy({ content = "" }) {
  return /* @__PURE__ */ jsxs(
    LegalDocumentPage,
    {
      title: "Refund Policy",
      eyebrow: "Billing & Refunds",
      icon: /* @__PURE__ */ jsx(RotateCcw, { className: "h-3.5 w-3.5" }),
      lastUpdated: (/* @__PURE__ */ new Date()).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" }),
      content,
      children: [
        /* @__PURE__ */ jsxs("section", { children: [
          /* @__PURE__ */ jsx("h2", { className: "text-lg font-semibold text-gray-900 dark:text-gray-100", children: "Refund review basis" }),
          /* @__PURE__ */ jsx("p", { className: "mt-2", children: "Refund requests are reviewed according to your active plan terms, billing cycle timing, usage consumed, and payment provider policies." })
        ] }),
        /* @__PURE__ */ jsxs("section", { children: [
          /* @__PURE__ */ jsx("h2", { className: "text-lg font-semibold text-gray-900 dark:text-gray-100", children: "What may affect eligibility" }),
          /* @__PURE__ */ jsxs("ul", { className: "mt-2 list-disc pl-5 space-y-1", children: [
            /* @__PURE__ */ jsx("li", { children: "Subscription type (monthly/annual) and when the request was made." }),
            /* @__PURE__ */ jsx("li", { children: "Successful usage of paid features, messaging, or credits." }),
            /* @__PURE__ */ jsx("li", { children: "Gateway/payment processor settlement status and fees." }),
            /* @__PURE__ */ jsx("li", { children: "Applicable law and consumer protection requirements." })
          ] })
        ] }),
        /* @__PURE__ */ jsxs("section", { children: [
          /* @__PURE__ */ jsx("h2", { className: "text-lg font-semibold text-gray-900 dark:text-gray-100", children: "How to request a refund" }),
          /* @__PURE__ */ jsx("p", { className: "mt-2", children: "Contact support with your account email, transaction reference, and reason for the request. We will review and respond with the next steps." })
        ] })
      ]
    }
  );
}
export {
  RefundPolicy as default
};
