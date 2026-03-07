import { jsxs, jsx } from "react/jsx-runtime";
import { Head, Link } from "@inertiajs/react";
import { A as AppShell } from "./AppShell-C0ldGEwS.js";
import { C as Card, b as CardHeader, c as CardTitle, d as CardDescription, a as CardContent } from "./Card-DLPTnTfC.js";
import { B as Badge } from "./Badge-CHx1ViYT.js";
import { B as Button } from "./Button-ymbdH_NY.js";
import "react";
import "lucide-react";
import "./utils-B2ZNUmII.js";
import "clsx";
import "tailwind-merge";
import "../ssr.js";
import "@inertiajs/react/server";
import "./vendor-BWyHebfG.js";
import "react-dom/server";
import "./Topbar-B0L72tZm.js";
import "./GlobalFlashHandler-yL6veGcD.js";
import "./useToast-CwsXrmjR.js";
import "./BrandingWrapper-BZp9WdA-.js";
import "./Alert-C-mQ6HNk.js";
import "./CookieConsentBanner-BJ5KL4CC.js";
function PaymentDetails({ payment }) {
  const formatAmount = (amount, currency) => new Intl.NumberFormat("en-IN", { style: "currency", currency, minimumFractionDigits: 2 }).format(amount / 100);
  const statusVariant = payment.status === "paid" ? "success" : payment.status === "failed" ? "danger" : "default";
  return /* @__PURE__ */ jsxs(AppShell, { children: [
    /* @__PURE__ */ jsx(Head, { title: `Invoice ${payment.invoice_no}` }),
    /* @__PURE__ */ jsxs("div", { className: "space-y-6", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between", children: [
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx(Link, { href: route("app.billing.history", {}), className: "text-sm text-gray-500 hover:text-gray-700", children: "← Back to Payment History" }),
          /* @__PURE__ */ jsxs("h1", { className: "mt-2 text-2xl font-bold text-gray-900 dark:text-gray-100", children: [
            "Invoice ",
            payment.invoice_no
          ] }),
          /* @__PURE__ */ jsx("p", { className: "text-sm text-gray-500 dark:text-gray-400", children: "Payment and invoice details" })
        ] }),
        /* @__PURE__ */ jsx("a", { href: route("app.billing.history.download", { paymentOrder: payment.id }), children: /* @__PURE__ */ jsx(Button, { children: "Download Invoice" }) })
      ] }),
      /* @__PURE__ */ jsxs(Card, { className: "border-0 shadow-lg", children: [
        /* @__PURE__ */ jsxs(CardHeader, { children: [
          /* @__PURE__ */ jsx(CardTitle, { children: "Summary" }),
          /* @__PURE__ */ jsx(CardDescription, { children: "Transaction overview" })
        ] }),
        /* @__PURE__ */ jsxs(CardContent, { className: "space-y-4", children: [
          /* @__PURE__ */ jsxs("div", { className: "grid gap-4 md:grid-cols-3", children: [
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx("p", { className: "text-xs text-gray-500", children: "Amount" }),
              /* @__PURE__ */ jsx("p", { className: "text-lg font-semibold text-gray-900 dark:text-gray-100", children: formatAmount(payment.amount, payment.currency) })
            ] }),
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx("p", { className: "text-xs text-gray-500", children: "Status" }),
              /* @__PURE__ */ jsx("div", { className: "mt-1", children: /* @__PURE__ */ jsx(Badge, { variant: statusVariant, children: payment.status }) })
            ] }),
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx("p", { className: "text-xs text-gray-500", children: "Plan" }),
              /* @__PURE__ */ jsx("p", { className: "text-sm font-medium text-gray-900 dark:text-gray-100", children: payment.plan?.name || "N/A" })
            ] })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "grid gap-4 md:grid-cols-2 pt-2 border-t border-gray-200 dark:border-gray-800", children: [
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx("p", { className: "text-xs text-gray-500", children: "Provider" }),
              /* @__PURE__ */ jsx("p", { className: "text-sm text-gray-800 dark:text-gray-200", children: payment.provider })
            ] }),
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx("p", { className: "text-xs text-gray-500", children: "Provider Order ID" }),
              /* @__PURE__ */ jsx("p", { className: "text-xs font-mono text-gray-800 dark:text-gray-200 break-all", children: payment.provider_order_id || "N/A" })
            ] }),
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx("p", { className: "text-xs text-gray-500", children: "Provider Payment ID" }),
              /* @__PURE__ */ jsx("p", { className: "text-xs font-mono text-gray-800 dark:text-gray-200 break-all", children: payment.provider_payment_id || "N/A" })
            ] }),
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx("p", { className: "text-xs text-gray-500", children: "Created" }),
              /* @__PURE__ */ jsx("p", { className: "text-sm text-gray-800 dark:text-gray-200", children: payment.created_at ? new Date(payment.created_at).toLocaleString() : "N/A" })
            ] }),
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx("p", { className: "text-xs text-gray-500", children: "Paid" }),
              /* @__PURE__ */ jsx("p", { className: "text-sm text-gray-800 dark:text-gray-200", children: payment.paid_at ? new Date(payment.paid_at).toLocaleString() : "N/A" })
            ] }),
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx("p", { className: "text-xs text-gray-500", children: "Failed At" }),
              /* @__PURE__ */ jsx("p", { className: "text-sm text-gray-800 dark:text-gray-200", children: payment.failed_at ? new Date(payment.failed_at).toLocaleString() : "N/A" })
            ] })
          ] })
        ] })
      ] })
    ] })
  ] });
}
export {
  PaymentDetails as default
};
