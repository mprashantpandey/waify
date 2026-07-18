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
function RefundPolicy() {
  return /* @__PURE__ */ jsxs(MarketingLayout, { page: "refund", children: [
    /* @__PURE__ */ jsx(Head, { title: "Refund and Cancellation Policy" }),
    /* @__PURE__ */ jsxs(Card, { className: "space-y-2 p-6 sm:p-8", children: [
      /* @__PURE__ */ jsx(LegalSection, { title: "Subscriptions and renewals", children: "Zyptos plans are purchased per workspace. A workspace plan starts or renews when payment is confirmed through Razorpay one-time checkout or when a bank/UPI payment proof is approved by a platform admin." }),
      /* @__PURE__ */ jsx(LegalSection, { title: "Cancellation", children: "You can stop renewing a workspace plan before the next billing cycle. Cancellation does not remove your workspace data immediately, but paid actions may stop when the active period ends or the workspace becomes overdue." }),
      /* @__PURE__ */ jsx(LegalSection, { title: "Refund requests", children: "Refunds are reviewed case by case for duplicate payments, incorrect plan activation, failed service activation, or verified billing errors. Approved refunds are returned to the original payment method where possible." }),
      /* @__PURE__ */ jsx(LegalSection, { title: "Non-refundable items", children: "Meta conversation charges, third-party provider charges, completed onboarding or custom implementation work, and usage already consumed during an active plan period are generally non-refundable." }),
      /* @__PURE__ */ jsx(LegalSection, { title: "Manual payments", children: "Bank and UPI payments are not considered paid until proof is uploaded and approved. If proof is rejected, the invoice remains unpaid and the workspace plan is not activated from that invoice." }),
      /* @__PURE__ */ jsx(LegalSection, { title: "Enterprise", children: "Enterprise activations, custom limits, and custom commercial terms require admin approval and may have separate written terms." }),
      /* @__PURE__ */ jsxs(LegalSection, { title: "Contact", children: [
        "For billing corrections, send the invoice number, workspace name, payment reference, and proof to ",
        /* @__PURE__ */ jsx("a", { href: "mailto:billing@zyptos.com", className: "text-waify-green-dark hover:underline", children: "billing@zyptos.com" }),
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
  RefundPolicy as default
};
