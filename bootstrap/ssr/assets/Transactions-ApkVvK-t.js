import { jsxs, jsx } from "react/jsx-runtime";
import { useState, useMemo } from "react";
import { Head, Link, router } from "@inertiajs/react";
import { A as AppShell } from "./AppShell-C0ldGEwS.js";
import { C as Card, a as CardContent, b as CardHeader, c as CardTitle, d as CardDescription } from "./Card-DLPTnTfC.js";
import { B as Badge } from "./Badge-CHx1ViYT.js";
import { B as Button } from "./Button-ymbdH_NY.js";
import { u as useNotifications } from "./useNotifications-DZIlU05F.js";
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
import "./useConfirm-BKf7Nv1N.js";
function BillingTransactions({
  wallet,
  transactions
}) {
  const { toast } = useNotifications();
  const [topupAmountMajor, setTopupAmountMajor] = useState("");
  const [topupNotes, setTopupNotes] = useState("");
  const formatMoney = (minor, currency) => new Intl.NumberFormat("en-IN", { style: "currency", currency: currency || "INR" }).format((minor || 0) / 100);
  const groupedCounts = useMemo(() => {
    return transactions.reduce(
      (acc, tx) => {
        acc.total += 1;
        if (tx.status === "failed") acc.failed += 1;
        if (tx.status === "success" || tx.status === "paid") acc.success += 1;
        return acc;
      },
      { total: 0, success: 0, failed: 0 }
    );
  }, [transactions]);
  const loadRazorpayScript = async () => {
    if (window.Razorpay) {
      return true;
    }
    return new Promise((resolve) => {
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.async = true;
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };
  const submitTopup = async (e) => {
    e.preventDefault();
    const major = Number(topupAmountMajor);
    if (!Number.isFinite(major) || major <= 0) {
      toast.error("Invalid amount", "Enter a valid top-up amount.");
      return;
    }
    const scriptLoaded = await loadRazorpayScript();
    if (!scriptLoaded) {
      toast.error("Payment gateway unavailable", "Unable to load Razorpay checkout script.");
      return;
    }
    const amountMinor = Math.round(major * 100);
    try {
      const orderResponse = await window.axios.post(route("app.billing.wallet.topup"), {
        amount_minor: amountMinor,
        notes: topupNotes || void 0
      });
      const order = orderResponse?.data;
      if (!order?.order_id || !order?.key_id) {
        throw new Error("Invalid top-up order response");
      }
      const options = {
        key: order.key_id,
        amount: order.amount,
        currency: order.currency || "INR",
        name: "Wallet Top-up",
        description: "Add credits to wallet",
        order_id: order.order_id,
        handler: async (response) => {
          await window.axios.post(route("app.billing.wallet.topup.confirm"), {
            order_id: response.razorpay_order_id,
            payment_id: response.razorpay_payment_id,
            signature: response.razorpay_signature
          });
          toast.success("Top-up successful", "Wallet balance has been updated.");
          router.reload({ only: ["wallet", "transactions"] });
        },
        modal: {
          ondismiss: () => {
            toast.warning("Top-up cancelled", "Payment was cancelled before completion.");
          }
        }
      };
      const razorpay = new window.Razorpay(options);
      razorpay.on("payment.failed", (response) => {
        toast.error("Top-up failed", response?.error?.description || "Payment failed.");
      });
      razorpay.open();
    } catch (error) {
      toast.error("Top-up failed", error?.response?.data?.message || error?.message || "Could not create top-up order.");
    }
  };
  return /* @__PURE__ */ jsxs(AppShell, { children: [
    /* @__PURE__ */ jsx(Head, { title: "Transactions" }),
    /* @__PURE__ */ jsxs("div", { className: "space-y-6", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between", children: [
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx(Link, { href: route("app.billing.index"), className: "text-sm text-gray-500 hover:text-gray-700", children: "← Back to Billing" }),
          /* @__PURE__ */ jsx("h1", { className: "mt-2 text-2xl font-bold text-gray-900 dark:text-gray-100", children: "Transactions" }),
          /* @__PURE__ */ jsx("p", { className: "text-sm text-gray-500 dark:text-gray-400", children: "Payment and wallet activity (success + failed)" })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "text-right", children: [
          /* @__PURE__ */ jsx("p", { className: "text-xs text-gray-500 dark:text-gray-400", children: "Wallet Balance" }),
          /* @__PURE__ */ jsx("p", { className: "text-xl font-semibold text-gray-900 dark:text-gray-100", children: formatMoney(wallet.balance_minor, wallet.currency) })
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "grid gap-4 md:grid-cols-3", children: [
        /* @__PURE__ */ jsx(Card, { children: /* @__PURE__ */ jsxs(CardContent, { className: "pt-5", children: [
          /* @__PURE__ */ jsx("p", { className: "text-xs text-gray-500", children: "Total" }),
          /* @__PURE__ */ jsx("p", { className: "text-2xl font-semibold", children: groupedCounts.total })
        ] }) }),
        /* @__PURE__ */ jsx(Card, { children: /* @__PURE__ */ jsxs(CardContent, { className: "pt-5", children: [
          /* @__PURE__ */ jsx("p", { className: "text-xs text-gray-500", children: "Success" }),
          /* @__PURE__ */ jsx("p", { className: "text-2xl font-semibold text-emerald-600", children: groupedCounts.success })
        ] }) }),
        /* @__PURE__ */ jsx(Card, { children: /* @__PURE__ */ jsxs(CardContent, { className: "pt-5", children: [
          /* @__PURE__ */ jsx("p", { className: "text-xs text-gray-500", children: "Failed" }),
          /* @__PURE__ */ jsx("p", { className: "text-2xl font-semibold text-red-600", children: groupedCounts.failed })
        ] }) })
      ] }),
      /* @__PURE__ */ jsxs(Card, { children: [
        /* @__PURE__ */ jsxs(CardHeader, { children: [
          /* @__PURE__ */ jsx(CardTitle, { children: "Wallet Top-up" }),
          /* @__PURE__ */ jsx(CardDescription, { children: "Add wallet credits (if enabled by platform admin)" })
        ] }),
        /* @__PURE__ */ jsx(CardContent, { children: /* @__PURE__ */ jsxs("form", { className: "flex flex-wrap items-end gap-3", onSubmit: submitTopup, children: [
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsxs("label", { className: "text-xs text-gray-500", children: [
              "Amount (",
              wallet.currency,
              ")"
            ] }),
            /* @__PURE__ */ jsx(
              "input",
              {
                type: "number",
                min: "0.01",
                step: "0.01",
                value: topupAmountMajor,
                onChange: (e) => setTopupAmountMajor(e.target.value),
                className: "mt-1 w-44 rounded-md border-gray-300 dark:border-gray-700 dark:bg-gray-900"
              }
            )
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "flex-1 min-w-[220px]", children: [
            /* @__PURE__ */ jsx("label", { className: "text-xs text-gray-500", children: "Notes" }),
            /* @__PURE__ */ jsx(
              "input",
              {
                type: "text",
                value: topupNotes,
                onChange: (e) => setTopupNotes(e.target.value),
                className: "mt-1 w-full rounded-md border-gray-300 dark:border-gray-700 dark:bg-gray-900"
              }
            )
          ] }),
          /* @__PURE__ */ jsx(Button, { type: "submit", children: "Add Credits" })
        ] }) })
      ] }),
      /* @__PURE__ */ jsxs(Card, { children: [
        /* @__PURE__ */ jsx(CardHeader, { children: /* @__PURE__ */ jsx(CardTitle, { children: "Transaction History" }) }),
        /* @__PURE__ */ jsx(CardContent, { className: "p-0", children: /* @__PURE__ */ jsx("div", { className: "overflow-x-auto", children: /* @__PURE__ */ jsxs("table", { className: "w-full text-sm", children: [
          /* @__PURE__ */ jsx("thead", { className: "bg-gray-50 dark:bg-gray-900", children: /* @__PURE__ */ jsxs("tr", { children: [
            /* @__PURE__ */ jsx("th", { className: "px-4 py-3 text-left", children: "Type" }),
            /* @__PURE__ */ jsx("th", { className: "px-4 py-3 text-left", children: "Direction" }),
            /* @__PURE__ */ jsx("th", { className: "px-4 py-3 text-left", children: "Amount" }),
            /* @__PURE__ */ jsx("th", { className: "px-4 py-3 text-left", children: "Source" }),
            /* @__PURE__ */ jsx("th", { className: "px-4 py-3 text-left", children: "Status" }),
            /* @__PURE__ */ jsx("th", { className: "px-4 py-3 text-left", children: "Reference" }),
            /* @__PURE__ */ jsx("th", { className: "px-4 py-3 text-left", children: "Date" })
          ] }) }),
          /* @__PURE__ */ jsxs("tbody", { children: [
            transactions.length === 0 && /* @__PURE__ */ jsx("tr", { children: /* @__PURE__ */ jsx("td", { colSpan: 7, className: "px-4 py-6 text-center text-gray-500", children: "No transactions found." }) }),
            transactions.map((tx, idx) => /* @__PURE__ */ jsxs("tr", { className: "border-t border-gray-200 dark:border-gray-800", children: [
              /* @__PURE__ */ jsx("td", { className: "px-4 py-3", children: tx.type }),
              /* @__PURE__ */ jsx("td", { className: "px-4 py-3", children: tx.direction }),
              /* @__PURE__ */ jsx("td", { className: "px-4 py-3 font-medium", children: formatMoney(tx.amount_minor, tx.currency) }),
              /* @__PURE__ */ jsx("td", { className: "px-4 py-3", children: tx.source }),
              /* @__PURE__ */ jsx("td", { className: "px-4 py-3", children: /* @__PURE__ */ jsx(Badge, { variant: tx.status === "failed" ? "danger" : tx.status === "success" || tx.status === "paid" ? "success" : "default", children: tx.status }) }),
              /* @__PURE__ */ jsx("td", { className: "px-4 py-3 text-xs font-mono", children: tx.reference || "—" }),
              /* @__PURE__ */ jsx("td", { className: "px-4 py-3", children: new Date(tx.created_at).toLocaleString() })
            ] }, `${tx.type}-${tx.id}-${idx}`))
          ] })
        ] }) }) })
      ] })
    ] })
  ] });
}
export {
  BillingTransactions as default
};
