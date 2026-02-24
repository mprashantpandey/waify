import { jsxs, jsx } from "react/jsx-runtime";
import { Head, Link } from "@inertiajs/react";
import { A as AppShell } from "./AppShell-DvEO1iV9.js";
import { C as Card, b as CardHeader, c as CardTitle, d as CardDescription, a as CardContent } from "./Card-DLPTnTfC.js";
import { B as Badge } from "./Badge-CHx1ViYT.js";
import "react";
import "lucide-react";
import "./utils-B2ZNUmII.js";
import "clsx";
import "tailwind-merge";
import "./RealtimeProvider-Dletx5Ny.js";
import "laravel-echo";
import "pusher-js";
import "./GlobalFlashHandler-gMSPY3wx.js";
import "./useToast-C5ECijgs.js";
import "./BrandingWrapper-B2Mh0bYb.js";
import "./Button-ymbdH_NY.js";
import "./Alert-DWa0cnrh.js";
import "./CookieConsentBanner-BJ5KL4CC.js";
function BillingHistory({
  account,
  payments
}) {
  const formatAmount = (amount, currency) => {
    const major = amount / 100;
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency,
      minimumFractionDigits: 0
    }).format(major);
  };
  const statusBadge = (status) => {
    const map = {
      created: { label: "Created", variant: "default" },
      paid: { label: "Paid", variant: "success" },
      failed: { label: "Failed", variant: "danger" }
    };
    const config = map[status] || { label: status, variant: "default" };
    return /* @__PURE__ */ jsx(Badge, { variant: config.variant, children: config.label });
  };
  return /* @__PURE__ */ jsxs(AppShell, { children: [
    /* @__PURE__ */ jsx(Head, { title: "Payment History" }),
    /* @__PURE__ */ jsxs("div", { className: "space-y-8", children: [
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx(
          Link,
          {
            href: route("app.billing.index", {}),
            className: "inline-flex items-center gap-2 text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors mb-4",
            children: "← Back to Billing"
          }
        ),
        /* @__PURE__ */ jsx("h1", { className: "text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-gray-100 dark:to-gray-300 bg-clip-text text-transparent", children: "Payment History" }),
        /* @__PURE__ */ jsx("p", { className: "mt-2 text-sm text-gray-600 dark:text-gray-400", children: "Recent payment orders and status updates" })
      ] }),
      /* @__PURE__ */ jsxs(Card, { className: "border-0 shadow-lg", children: [
        /* @__PURE__ */ jsxs(CardHeader, { className: "bg-gradient-to-r from-gray-50 to-white dark:from-gray-800 dark:to-gray-900", children: [
          /* @__PURE__ */ jsx(CardTitle, { className: "text-xl font-bold", children: "Recent Payments" }),
          /* @__PURE__ */ jsx(CardDescription, { children: "Last 50 payment orders" })
        ] }),
        /* @__PURE__ */ jsx(CardContent, { className: "p-0", children: /* @__PURE__ */ jsx("div", { className: "overflow-x-auto", children: /* @__PURE__ */ jsxs("table", { className: "w-full", children: [
          /* @__PURE__ */ jsx("thead", { className: "bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700", children: /* @__PURE__ */ jsxs("tr", { children: [
            /* @__PURE__ */ jsx("th", { className: "px-6 py-3 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider", children: "Plan" }),
            /* @__PURE__ */ jsx("th", { className: "px-6 py-3 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider", children: "Amount" }),
            /* @__PURE__ */ jsx("th", { className: "px-6 py-3 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider", children: "Status" }),
            /* @__PURE__ */ jsx("th", { className: "px-6 py-3 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider", children: "Provider" }),
            /* @__PURE__ */ jsx("th", { className: "px-6 py-3 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider", children: "Order ID" }),
            /* @__PURE__ */ jsx("th", { className: "px-6 py-3 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider", children: "Paid At" })
          ] }) }),
          /* @__PURE__ */ jsxs("tbody", { className: "divide-y divide-gray-200 dark:divide-gray-800 bg-white dark:bg-gray-900", children: [
            payments.length === 0 && /* @__PURE__ */ jsx("tr", { children: /* @__PURE__ */ jsx("td", { colSpan: 6, className: "px-6 py-8 text-center text-sm text-gray-500 dark:text-gray-400", children: "No payments recorded yet." }) }),
            payments.map((payment) => /* @__PURE__ */ jsxs("tr", { children: [
              /* @__PURE__ */ jsx("td", { className: "px-6 py-4 text-sm font-medium text-gray-900 dark:text-gray-100", children: payment.plan?.name ?? "Unknown" }),
              /* @__PURE__ */ jsx("td", { className: "px-6 py-4 text-sm text-gray-700 dark:text-gray-300", children: formatAmount(payment.amount, payment.currency) }),
              /* @__PURE__ */ jsx("td", { className: "px-6 py-4 text-sm", children: statusBadge(payment.status) }),
              /* @__PURE__ */ jsx("td", { className: "px-6 py-4 text-sm text-gray-700 dark:text-gray-300", children: payment.provider }),
              /* @__PURE__ */ jsx("td", { className: "px-6 py-4 text-xs font-mono text-gray-600 dark:text-gray-400", children: payment.provider_order_id }),
              /* @__PURE__ */ jsx("td", { className: "px-6 py-4 text-sm text-gray-700 dark:text-gray-300", children: payment.paid_at ? new Date(payment.paid_at).toLocaleString() : "—" })
            ] }, payment.id))
          ] })
        ] }) }) })
      ] })
    ] })
  ] });
}
export {
  BillingHistory as default
};
