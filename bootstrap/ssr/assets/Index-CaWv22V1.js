import { jsxs, jsx, Fragment } from "react/jsx-runtime";
import { P as PlatformShell } from "./PlatformShell-BJ42joc8.js";
import { usePage, Head, Link, router } from "@inertiajs/react";
import { useState, useMemo } from "react";
import { C as Card, a as CardContent } from "./Card-BtIXZ0GS.js";
import { B as Button } from "./Button-BJftGNki.js";
import { P as PageHeader, a as Toolbar, T as ThemedIconTile, S as StatusBadge } from "./Elements-EbyZDnT_.js";
import { c as cn } from "./utils-B2ZNUmII.js";
import { RotateCcw, AlertCircle, Clock3, ReceiptIndianRupee, XCircle, Filter, Wallet, CreditCard, ArrowDownLeft, ArrowUpRight, Building2, Eye, X, CheckCircle2, Download, FileText, Send } from "lucide-react";
import "axios";
import "./BrandingWrapper-DdVUILzh.js";
import "./BrandLogo-TeztHB0m.js";
import "./useToast-BN7qsQL3.js";
import "./Badge-C65MHc2S.js";
import "@headlessui/react";
import "clsx";
import "tailwind-merge";
function amount(minor, currency) {
  return new Intl.NumberFormat("en-IN", { style: "currency", currency: currency || "INR" }).format((minor || 0) / 100);
}
function statusTone(status) {
  if (["success", "paid", "captured"].includes(status)) return "success";
  if (["failed", "cancelled", "canceled", "rejected"].includes(status)) return "danger";
  if (["void", "voided"].includes(status)) return "default";
  if (["pending", "pending_approval", "created", "authorized"].includes(status)) return "warning";
  if (["refunded"].includes(status)) return "info";
  return "default";
}
function sourceLabel(source) {
  return (source || "unknown").replace(/_/g, " ").replace(/\b\w/g, (letter) => letter.toUpperCase());
}
function dateTime(value) {
  if (!value) return "Not recorded";
  return new Date(value).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" });
}
function StatCard({ label, value, helper, icon: Icon, tone = "green" }) {
  return /* @__PURE__ */ jsx(Card, { children: /* @__PURE__ */ jsx(CardContent, { className: "p-4", children: /* @__PURE__ */ jsxs("div", { className: "flex items-start justify-between gap-3", children: [
    /* @__PURE__ */ jsxs("div", { className: "min-w-0", children: [
      /* @__PURE__ */ jsx("p", { className: "text-xs font-medium uppercase tracking-wide text-waify-text-muted dark:text-waify-dark-text-muted", children: label }),
      /* @__PURE__ */ jsx("p", { className: "mt-2 text-xl font-bold text-waify-text dark:text-waify-dark-text", children: value }),
      helper && /* @__PURE__ */ jsx("p", { className: "mt-1 truncate text-xs text-waify-text-muted dark:text-waify-dark-text-muted", children: helper })
    ] }),
    /* @__PURE__ */ jsx(ThemedIconTile, { tone, size: "sm", children: /* @__PURE__ */ jsx(Icon, { className: "h-4 w-4" }) })
  ] }) }) });
}
function DetailItem({ label, value }) {
  return /* @__PURE__ */ jsxs("div", { className: "rounded-card border border-gray-100 bg-gray-50/70 p-3 dark:border-waify-dark-border dark:bg-waify-dark-surface-2/60", children: [
    /* @__PURE__ */ jsx("div", { className: "text-[11px] font-medium uppercase tracking-wide text-waify-text-muted dark:text-waify-dark-text-muted", children: label }),
    /* @__PURE__ */ jsx("div", { className: "mt-1 break-words text-sm font-semibold text-waify-text dark:text-waify-dark-text", children: value || "-" })
  ] });
}
function PaymentActions({
  tx,
  onApprove,
  onReject,
  onRemind,
  onVoid
}) {
  if (tx.kind !== "payment" || !tx.payment_order_id) return null;
  const canReview = ["created", "pending_approval", "rejected"].includes(tx.status);
  const canVoid = ["created", "pending_approval", "rejected", "failed"].includes(tx.status);
  return /* @__PURE__ */ jsxs("div", { className: "flex flex-wrap items-center gap-2", children: [
    /* @__PURE__ */ jsx("a", { href: route("platform.transactions.payments.invoice", tx.payment_order_id), target: "_blank", rel: "noreferrer", children: /* @__PURE__ */ jsxs(Button, { type: "button", variant: "secondary", size: "sm", children: [
      /* @__PURE__ */ jsx(Download, { className: "h-3.5 w-3.5" }),
      "Invoice"
    ] }) }),
    tx.has_proof && /* @__PURE__ */ jsx("a", { href: route("platform.transactions.payments.proof", tx.payment_order_id), target: "_blank", rel: "noreferrer", children: /* @__PURE__ */ jsxs(Button, { type: "button", variant: "secondary", size: "sm", children: [
      /* @__PURE__ */ jsx(FileText, { className: "h-3.5 w-3.5" }),
      "Proof"
    ] }) }),
    canReview && /* @__PURE__ */ jsxs(Fragment, { children: [
      /* @__PURE__ */ jsxs(Button, { type: "button", variant: "secondary", size: "sm", onClick: () => onRemind(tx), children: [
        /* @__PURE__ */ jsx(Send, { className: "h-3.5 w-3.5" }),
        "Remind"
      ] }),
      /* @__PURE__ */ jsxs(Button, { type: "button", size: "sm", onClick: () => onApprove(tx), children: [
        /* @__PURE__ */ jsx(CheckCircle2, { className: "h-3.5 w-3.5" }),
        "Approve"
      ] }),
      /* @__PURE__ */ jsxs(Button, { type: "button", variant: "secondary", size: "sm", onClick: () => onReject(tx), children: [
        /* @__PURE__ */ jsx(XCircle, { className: "h-3.5 w-3.5" }),
        "Reject"
      ] })
    ] }),
    canVoid && /* @__PURE__ */ jsxs(Button, { type: "button", variant: "secondary", size: "sm", onClick: () => onVoid(tx), children: [
      /* @__PURE__ */ jsx(XCircle, { className: "h-3.5 w-3.5" }),
      "Void"
    ] })
  ] });
}
function PlatformTransactionsIndex({
  transactions = [],
  filters = {},
  accounts = []
}) {
  const { auth } = usePage().props;
  const [localFilters, setLocalFilters] = useState(filters || {});
  const [approvalTx, setApprovalTx] = useState(null);
  const [approvalReference, setApprovalReference] = useState("");
  const [rejectionTx, setRejectionTx] = useState(null);
  const [rejectionReason, setRejectionReason] = useState("");
  const [voidTx, setVoidTx] = useState(null);
  const [voidReason, setVoidReason] = useState("");
  const [selectedTx, setSelectedTx] = useState(transactions[0] || null);
  const stats = useMemo(() => {
    const currency = transactions[0]?.currency || "INR";
    const paymentRows = transactions.filter((tx) => tx.kind === "payment");
    const walletRows = transactions.filter((tx) => tx.kind === "wallet");
    const pendingApprovals = paymentRows.filter((tx) => tx.status === "pending_approval").length;
    const unpaidInvoices = paymentRows.filter((tx) => ["created", "rejected"].includes(tx.status)).length;
    const voidedInvoices = paymentRows.filter((tx) => ["void", "voided"].includes(tx.status)).length;
    const successfulAmount = paymentRows.filter((tx) => ["paid", "success", "captured"].includes(tx.status)).reduce((sum, tx) => sum + (tx.amount_minor || 0), 0);
    const creditAmount = walletRows.filter((tx) => tx.direction === "credit").reduce((sum, tx) => sum + (tx.amount_minor || 0), 0);
    const debitAmount = walletRows.filter((tx) => tx.direction === "debit").reduce((sum, tx) => sum + (tx.amount_minor || 0), 0);
    return {
      pendingApprovals,
      unpaidInvoices,
      voidedInvoices,
      successfulPayments: amount(successfulAmount, currency),
      walletNet: amount(creditAmount - debitAmount, currency)
    };
  }, [transactions]);
  const reviewQueue = useMemo(
    () => transactions.filter((tx) => tx.kind === "payment" && ["pending_approval", "created", "rejected"].includes(tx.status)).slice(0, 5),
    [transactions]
  );
  const sources = useMemo(() => Array.from(new Set(transactions.map((tx) => tx.source).filter(Boolean))).sort(), [transactions]);
  const applyFilters = () => {
    const normalized = Object.fromEntries(Object.entries(localFilters).filter(([, value]) => value !== void 0 && value !== ""));
    router.get(route("platform.transactions.index"), normalized, {
      preserveState: true,
      preserveScroll: true
    });
  };
  const resetFilters = () => {
    setLocalFilters({});
    router.get(route("platform.transactions.index"), {}, {
      preserveState: true,
      preserveScroll: true
    });
  };
  const openApprovePayment = (tx) => {
    setApprovalTx(tx);
    setApprovalReference("");
  };
  const submitApprovePayment = () => {
    if (!approvalTx) return;
    router.post(route("platform.transactions.payments.approve", approvalTx.payment_order_id), {
      payment_reference: approvalReference
    }, {
      preserveScroll: true,
      onSuccess: () => {
        setApprovalTx(null);
        setSelectedTx(null);
      }
    });
  };
  const openRejectPayment = (tx) => {
    setRejectionTx(tx);
    setRejectionReason("");
  };
  const submitRejectPayment = () => {
    if (!rejectionTx || !rejectionReason.trim()) return;
    router.post(route("platform.transactions.payments.reject", rejectionTx.payment_order_id), {
      reason: rejectionReason
    }, {
      preserveScroll: true,
      onSuccess: () => {
        setRejectionTx(null);
        setSelectedTx(null);
      }
    });
  };
  const sendPaymentReminder = (tx) => {
    router.post(route("platform.transactions.payments.remind", tx.payment_order_id), {}, {
      preserveScroll: true
    });
  };
  const openVoidPayment = (tx) => {
    setVoidTx(tx);
    setVoidReason("");
  };
  const submitVoidPayment = () => {
    if (!voidTx || !voidReason.trim()) return;
    router.post(route("platform.transactions.payments.void", voidTx.payment_order_id), {
      reason: voidReason
    }, {
      preserveScroll: true,
      onSuccess: () => {
        setVoidTx(null);
        setSelectedTx(null);
      }
    });
  };
  return /* @__PURE__ */ jsxs(PlatformShell, { auth, children: [
    /* @__PURE__ */ jsx(Head, { title: "Transactions" }),
    /* @__PURE__ */ jsxs("div", { className: "space-y-5", children: [
      /* @__PURE__ */ jsx(
        PageHeader,
        {
          title: "Transactions",
          description: "Review invoices, approve Bank/UPI proofs, trace Razorpay payments, and audit workspace wallet movements.",
          actions: /* @__PURE__ */ jsxs(Button, { type: "button", variant: "secondary", onClick: resetFilters, children: [
            /* @__PURE__ */ jsx(RotateCcw, { className: "h-4 w-4" }),
            "Reset"
          ] })
        }
      ),
      /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4", children: [
        /* @__PURE__ */ jsx(StatCard, { label: "Needs review", value: stats.pendingApprovals, helper: "Uploaded payment proofs", icon: AlertCircle, tone: stats.pendingApprovals > 0 ? "amber" : "green" }),
        /* @__PURE__ */ jsx(StatCard, { label: "Open invoices", value: stats.unpaidInvoices, helper: "Created or rejected", icon: Clock3, tone: stats.unpaidInvoices > 0 ? "red" : "gray" }),
        /* @__PURE__ */ jsx(StatCard, { label: "Paid revenue", value: stats.successfulPayments, helper: "Loaded result set", icon: ReceiptIndianRupee, tone: "green" }),
        /* @__PURE__ */ jsx(StatCard, { label: "Voided invoices", value: stats.voidedInvoices, helper: "Cancelled stale invoices", icon: XCircle, tone: "gray" })
      ] }),
      reviewQueue.length > 0 && /* @__PURE__ */ jsx(Card, { className: "border-amber-200 bg-amber-50/70 dark:border-amber-400/20 dark:bg-amber-500/10", children: /* @__PURE__ */ jsx(CardContent, { className: "p-4", children: /* @__PURE__ */ jsxs("div", { className: "flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between", children: [
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 text-sm font-semibold text-amber-900 dark:text-amber-100", children: [
            /* @__PURE__ */ jsx(AlertCircle, { className: "h-4 w-4" }),
            "Payment review queue"
          ] }),
          /* @__PURE__ */ jsx("p", { className: "mt-1 text-sm text-amber-800/80 dark:text-amber-100/70", children: "Approve valid proofs, reject bad proofs with a clear reason, or send a reminder for unpaid invoices." })
        ] }),
        /* @__PURE__ */ jsx("div", { className: "flex flex-wrap gap-2", children: reviewQueue.map((tx) => /* @__PURE__ */ jsxs(
          "button",
          {
            type: "button",
            onClick: () => setSelectedTx(tx),
            className: "rounded-full bg-white px-3 py-1.5 text-xs font-semibold text-amber-900 ring-1 ring-amber-200 hover:bg-amber-100 dark:bg-waify-dark-surface dark:text-amber-100 dark:ring-amber-400/20",
            children: [
              tx.invoice_number || tx.reference || `Order #${tx.payment_order_id}`,
              " · ",
              amount(tx.amount_minor, tx.currency)
            ]
          },
          tx.id
        )) })
      ] }) }) }),
      /* @__PURE__ */ jsx(
        Toolbar,
        {
          search: {
            value: localFilters.search || "",
            onChange: (value) => setLocalFilters({ ...localFilters, search: value || void 0 }),
            placeholder: "Search invoice, UTR, workspace, plan, discount..."
          },
          filters: /* @__PURE__ */ jsxs(Fragment, { children: [
            /* @__PURE__ */ jsxs("select", { value: localFilters.kind || "", onChange: (event) => setLocalFilters({ ...localFilters, kind: event.target.value || void 0 }), className: "waify-input min-w-32", children: [
              /* @__PURE__ */ jsx("option", { value: "", children: "All types" }),
              /* @__PURE__ */ jsx("option", { value: "payment", children: "Payments" }),
              /* @__PURE__ */ jsx("option", { value: "wallet", children: "Wallet" })
            ] }),
            /* @__PURE__ */ jsxs("select", { value: localFilters.account_id || "", onChange: (event) => setLocalFilters({ ...localFilters, account_id: event.target.value || void 0 }), className: "waify-input min-w-44", children: [
              /* @__PURE__ */ jsx("option", { value: "", children: "All workspaces" }),
              accounts.map((account) => /* @__PURE__ */ jsx("option", { value: account.id, children: account.name }, account.id))
            ] }),
            /* @__PURE__ */ jsxs("select", { value: localFilters.status || "", onChange: (event) => setLocalFilters({ ...localFilters, status: event.target.value || void 0 }), className: "waify-input min-w-40", children: [
              /* @__PURE__ */ jsx("option", { value: "", children: "All statuses" }),
              /* @__PURE__ */ jsx("option", { value: "paid", children: "Paid" }),
              /* @__PURE__ */ jsx("option", { value: "success", children: "Success" }),
              /* @__PURE__ */ jsx("option", { value: "created", children: "Created" }),
              /* @__PURE__ */ jsx("option", { value: "pending_approval", children: "Pending approval" }),
              /* @__PURE__ */ jsx("option", { value: "rejected", children: "Rejected" }),
              /* @__PURE__ */ jsx("option", { value: "void", children: "Void" }),
              /* @__PURE__ */ jsx("option", { value: "failed", children: "Failed" })
            ] }),
            /* @__PURE__ */ jsxs("select", { value: localFilters.source || "", onChange: (event) => setLocalFilters({ ...localFilters, source: event.target.value || void 0 }), className: "waify-input min-w-44", children: [
              /* @__PURE__ */ jsx("option", { value: "", children: "All sources" }),
              sources.map((source) => /* @__PURE__ */ jsx("option", { value: source, children: sourceLabel(source) }, source))
            ] }),
            /* @__PURE__ */ jsx("input", { type: "date", value: localFilters.date_from || "", onChange: (event) => setLocalFilters({ ...localFilters, date_from: event.target.value || void 0 }), className: "waify-input w-40", "aria-label": "From date" }),
            /* @__PURE__ */ jsx("input", { type: "date", value: localFilters.date_to || "", onChange: (event) => setLocalFilters({ ...localFilters, date_to: event.target.value || void 0 }), className: "waify-input w-40", "aria-label": "To date" })
          ] }),
          actions: /* @__PURE__ */ jsxs(Button, { type: "button", onClick: applyFilters, children: [
            /* @__PURE__ */ jsx(Filter, { className: "h-4 w-4" }),
            "Apply"
          ] })
        }
      ),
      /* @__PURE__ */ jsx(Card, { children: /* @__PURE__ */ jsx(CardContent, { className: "p-0", children: transactions.length === 0 ? /* @__PURE__ */ jsxs("div", { className: "flex flex-col items-center justify-center py-16 text-center", children: [
        /* @__PURE__ */ jsx(ThemedIconTile, { tone: "gray", size: "lg", children: /* @__PURE__ */ jsx(Wallet, { className: "h-5 w-5" }) }),
        /* @__PURE__ */ jsx("p", { className: "mt-4 text-sm font-semibold text-waify-text dark:text-waify-dark-text", children: "No transactions found" }),
        /* @__PURE__ */ jsx("p", { className: "mt-1 text-sm text-waify-text-muted dark:text-waify-dark-text-muted", children: "Try changing filters, or wait for wallet and subscription activity." })
      ] }) : /* @__PURE__ */ jsx("div", { className: "overflow-x-auto", children: /* @__PURE__ */ jsxs("table", { className: "min-w-full divide-y divide-gray-100 text-sm dark:divide-waify-dark-border", children: [
        /* @__PURE__ */ jsx("thead", { className: "bg-gray-50 text-left text-xs font-semibold uppercase tracking-wide text-waify-text-muted dark:bg-waify-dark-surface-2 dark:text-waify-dark-text-muted", children: /* @__PURE__ */ jsxs("tr", { children: [
          /* @__PURE__ */ jsx("th", { className: "px-4 py-3", children: "Transaction" }),
          /* @__PURE__ */ jsx("th", { className: "px-4 py-3", children: "Workspace" }),
          /* @__PURE__ */ jsx("th", { className: "px-4 py-3", children: "Amount" }),
          /* @__PURE__ */ jsx("th", { className: "px-4 py-3", children: "Status" }),
          /* @__PURE__ */ jsx("th", { className: "px-4 py-3", children: "Method" }),
          /* @__PURE__ */ jsx("th", { className: "px-4 py-3", children: "Date" }),
          /* @__PURE__ */ jsx("th", { className: "px-4 py-3 text-right", children: "Actions" })
        ] }) }),
        /* @__PURE__ */ jsx("tbody", { className: "divide-y divide-gray-100 dark:divide-waify-dark-border", children: transactions.map((tx) => {
          const isCredit = tx.direction === "credit";
          const DirectionIcon = isCredit ? ArrowDownLeft : ArrowUpRight;
          return /* @__PURE__ */ jsxs("tr", { className: cn("align-top transition hover:bg-gray-50/80 dark:hover:bg-waify-dark-surface-2/70", selectedTx?.id === tx.id && "bg-waify-green-soft/30 dark:bg-waify-dark-green-soft/30"), children: [
            /* @__PURE__ */ jsx("td", { className: "px-4 py-3", children: /* @__PURE__ */ jsxs("div", { className: "flex min-w-64 items-start gap-3", children: [
              /* @__PURE__ */ jsx(ThemedIconTile, { tone: tx.kind === "payment" ? "green" : isCredit ? "blue" : "amber", size: "sm", children: tx.kind === "payment" ? /* @__PURE__ */ jsx(CreditCard, { className: "h-4 w-4" }) : /* @__PURE__ */ jsx(DirectionIcon, { className: "h-4 w-4" }) }),
              /* @__PURE__ */ jsxs("div", { className: "min-w-0", children: [
                /* @__PURE__ */ jsx("button", { type: "button", onClick: () => setSelectedTx(tx), className: "max-w-64 truncate text-left font-semibold text-waify-text hover:text-waify-green-dark dark:text-waify-dark-text dark:hover:text-emerald-300", children: tx.invoice_number || tx.reference || `${sourceLabel(tx.kind)} ${tx.id}` }),
                /* @__PURE__ */ jsxs("div", { className: "mt-1 flex flex-wrap gap-1.5", children: [
                  /* @__PURE__ */ jsx(StatusBadge, { tone: tx.kind === "payment" ? "info" : "muted", children: sourceLabel(tx.kind) }),
                  tx.plan && /* @__PURE__ */ jsx(StatusBadge, { tone: "muted", children: tx.plan }),
                  tx.has_proof && /* @__PURE__ */ jsx(StatusBadge, { tone: "warning", children: "Proof uploaded" })
                ] }),
                tx.notes && /* @__PURE__ */ jsx("p", { className: "mt-1 max-w-64 truncate text-xs text-waify-text-muted dark:text-waify-dark-text-muted", children: tx.notes })
              ] })
            ] }) }),
            /* @__PURE__ */ jsx("td", { className: "px-4 py-3", children: tx.account?.id ? /* @__PURE__ */ jsxs(Link, { href: route("platform.accounts.show", { account: tx.account.id }), className: "inline-flex max-w-48 items-center gap-1 truncate font-medium text-waify-green-dark hover:underline dark:text-emerald-300", children: [
              /* @__PURE__ */ jsx(Building2, { className: "h-3.5 w-3.5 shrink-0" }),
              /* @__PURE__ */ jsx("span", { className: "truncate", children: tx.account.name || `Workspace #${tx.account.id}` })
            ] }) : /* @__PURE__ */ jsx("span", { className: "text-waify-text-muted dark:text-waify-dark-text-muted", children: "Platform" }) }),
            /* @__PURE__ */ jsxs("td", { className: "px-4 py-3", children: [
              /* @__PURE__ */ jsxs("div", { className: cn("font-bold", isCredit ? "text-emerald-700 dark:text-emerald-300" : "text-waify-text dark:text-waify-dark-text"), children: [
                isCredit ? "+" : "-",
                amount(tx.amount_minor, tx.currency)
              ] }),
              tx.kind === "payment" && /* @__PURE__ */ jsxs("div", { className: "mt-1 text-xs text-waify-text-muted dark:text-waify-dark-text-muted", children: [
                "Tax ",
                amount(tx.tax_amount || 0, tx.currency)
              ] })
            ] }),
            /* @__PURE__ */ jsx("td", { className: "px-4 py-3", children: /* @__PURE__ */ jsx(StatusBadge, { tone: statusTone(tx.status), dot: true, children: sourceLabel(tx.status) }) }),
            /* @__PURE__ */ jsxs("td", { className: "px-4 py-3", children: [
              /* @__PURE__ */ jsx("div", { className: "font-medium text-waify-text dark:text-waify-dark-text", children: tx.payment_method_label || sourceLabel(tx.source) }),
              tx.discount_amount ? /* @__PURE__ */ jsxs("div", { className: "mt-1 text-xs text-emerald-700 dark:text-emerald-300", children: [
                "Discount ",
                tx.discount_code || "",
                " ",
                amount(tx.discount_amount, tx.currency)
              ] }) : null
            ] }),
            /* @__PURE__ */ jsx("td", { className: "px-4 py-3 text-waify-text-muted dark:text-waify-dark-text-muted", children: dateTime(tx.created_at) }),
            /* @__PURE__ */ jsx("td", { className: "px-4 py-3", children: /* @__PURE__ */ jsxs("div", { className: "flex justify-end gap-2", children: [
              /* @__PURE__ */ jsxs(Button, { type: "button", variant: "ghost", size: "sm", onClick: () => setSelectedTx(tx), children: [
                /* @__PURE__ */ jsx(Eye, { className: "h-3.5 w-3.5" }),
                "View"
              ] }),
              /* @__PURE__ */ jsx(PaymentActions, { tx, onApprove: openApprovePayment, onReject: openRejectPayment, onRemind: sendPaymentReminder, onVoid: openVoidPayment })
            ] }) })
          ] }, tx.id);
        }) })
      ] }) }) }) })
    ] }),
    selectedTx && /* @__PURE__ */ jsxs("div", { className: "fixed inset-0 z-[190] flex justify-end", children: [
      /* @__PURE__ */ jsx("button", { type: "button", className: "absolute inset-0 bg-black/30", onClick: () => setSelectedTx(null), "aria-label": "Close transaction details" }),
      /* @__PURE__ */ jsxs("aside", { className: "relative flex h-full w-full max-w-xl flex-col overflow-y-auto border-l border-gray-100 bg-white shadow-pop dark:border-waify-dark-border dark:bg-waify-dark-bg", children: [
        /* @__PURE__ */ jsx("div", { className: "sticky top-0 z-10 border-b border-gray-100 bg-white/95 p-5 backdrop-blur dark:border-waify-dark-border dark:bg-waify-dark-bg/95", children: /* @__PURE__ */ jsxs("div", { className: "flex items-start justify-between gap-3", children: [
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsxs("div", { className: "flex flex-wrap items-center gap-2", children: [
              /* @__PURE__ */ jsx(StatusBadge, { tone: statusTone(selectedTx.status), dot: true, children: sourceLabel(selectedTx.status) }),
              /* @__PURE__ */ jsx(StatusBadge, { tone: selectedTx.kind === "payment" ? "info" : "muted", children: sourceLabel(selectedTx.kind) })
            ] }),
            /* @__PURE__ */ jsx("h2", { className: "mt-3 text-lg font-bold text-waify-text dark:text-waify-dark-text", children: selectedTx.invoice_number || selectedTx.reference || selectedTx.id }),
            /* @__PURE__ */ jsx("p", { className: "mt-1 text-sm text-waify-text-muted dark:text-waify-dark-text-muted", children: dateTime(selectedTx.created_at) })
          ] }),
          /* @__PURE__ */ jsx("button", { type: "button", onClick: () => setSelectedTx(null), className: "rounded-btn p-2 text-waify-text-muted hover:bg-gray-100 dark:text-waify-dark-text-muted dark:hover:bg-waify-dark-surface-2", "aria-label": "Close", children: /* @__PURE__ */ jsx(X, { className: "h-4 w-4" }) })
        ] }) }),
        /* @__PURE__ */ jsxs("div", { className: "space-y-5 p-5", children: [
          /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 gap-3 sm:grid-cols-2", children: [
            /* @__PURE__ */ jsx(DetailItem, { label: "Amount", value: amount(selectedTx.amount_minor, selectedTx.currency) }),
            /* @__PURE__ */ jsx(DetailItem, { label: "Workspace", value: selectedTx.account?.name || "Platform" }),
            /* @__PURE__ */ jsx(DetailItem, { label: "Payment method", value: selectedTx.payment_method_label || sourceLabel(selectedTx.source) }),
            /* @__PURE__ */ jsx(DetailItem, { label: "Plan", value: selectedTx.plan || "-" }),
            /* @__PURE__ */ jsx(DetailItem, { label: "Tax", value: amount(selectedTx.tax_amount || 0, selectedTx.currency) }),
            /* @__PURE__ */ jsx(DetailItem, { label: "Discount", value: (selectedTx.discount_amount || 0) > 0 ? `${selectedTx.discount_code || "Discount"} · ${amount(selectedTx.discount_amount || 0, selectedTx.currency)}` : "-" }),
            /* @__PURE__ */ jsx(DetailItem, { label: "Reference", value: selectedTx.reference || "-" }),
            /* @__PURE__ */ jsx(DetailItem, { label: "Actor", value: selectedTx.actor ? `${selectedTx.actor.name} (${selectedTx.actor.email})` : "-" })
          ] }),
          selectedTx.kind === "payment" && /* @__PURE__ */ jsxs("div", { className: "rounded-card border border-gray-100 p-4 dark:border-waify-dark-border", children: [
            /* @__PURE__ */ jsxs("div", { className: "mb-3 flex items-center justify-between gap-3", children: [
              /* @__PURE__ */ jsx("h3", { className: "text-sm font-semibold text-waify-text dark:text-waify-dark-text", children: "Payment review" }),
              selectedTx.has_proof ? /* @__PURE__ */ jsx(StatusBadge, { tone: "warning", children: "Proof uploaded" }) : /* @__PURE__ */ jsx(StatusBadge, { tone: "muted", children: "No proof" })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "space-y-2 text-sm text-waify-text-muted dark:text-waify-dark-text-muted", children: [
              /* @__PURE__ */ jsxs("p", { children: [
                "Proof file: ",
                /* @__PURE__ */ jsx("span", { className: "font-medium text-waify-text dark:text-waify-dark-text", children: selectedTx.proof_original_name || "-" })
              ] }),
              /* @__PURE__ */ jsxs("p", { children: [
                "Uploaded: ",
                /* @__PURE__ */ jsx("span", { className: "font-medium text-waify-text dark:text-waify-dark-text", children: dateTime(selectedTx.proof_uploaded_at) })
              ] }),
              selectedTx.rejection_reason && /* @__PURE__ */ jsxs("p", { children: [
                "Rejection: ",
                /* @__PURE__ */ jsx("span", { className: "font-medium text-red-700 dark:text-red-300", children: selectedTx.rejection_reason })
              ] })
            ] }),
            /* @__PURE__ */ jsx("div", { className: "mt-4", children: /* @__PURE__ */ jsx(PaymentActions, { tx: selectedTx, onApprove: openApprovePayment, onReject: openRejectPayment, onRemind: sendPaymentReminder, onVoid: openVoidPayment }) })
          ] }),
          selectedTx.timeline && selectedTx.timeline.length > 0 && /* @__PURE__ */ jsxs("div", { className: "rounded-card border border-gray-100 p-4 dark:border-waify-dark-border", children: [
            /* @__PURE__ */ jsx("h3", { className: "text-sm font-semibold text-waify-text dark:text-waify-dark-text", children: "Timeline" }),
            /* @__PURE__ */ jsx("div", { className: "mt-3 space-y-3", children: selectedTx.timeline.slice().reverse().map((item, index) => /* @__PURE__ */ jsxs("div", { className: "flex gap-3", children: [
              /* @__PURE__ */ jsx("span", { className: "mt-1 h-2 w-2 rounded-full bg-waify-green" }),
              /* @__PURE__ */ jsxs("div", { children: [
                /* @__PURE__ */ jsx("p", { className: "text-sm font-medium text-waify-text dark:text-waify-dark-text", children: item.label }),
                /* @__PURE__ */ jsxs("p", { className: "text-xs text-waify-text-muted dark:text-waify-dark-text-muted", children: [
                  dateTime(item.at),
                  item.actor_name ? ` · ${item.actor_name}` : ""
                ] })
              ] })
            ] }, `${item.event}-${item.at}-${index}`)) })
          ] })
        ] })
      ] })
    ] }),
    approvalTx && /* @__PURE__ */ jsxs("div", { className: "fixed inset-0 z-[200] flex items-center justify-center p-4", children: [
      /* @__PURE__ */ jsx("button", { type: "button", className: "absolute inset-0 bg-black/50", onClick: () => setApprovalTx(null), "aria-label": "Close" }),
      /* @__PURE__ */ jsxs("div", { className: "relative w-full max-w-md rounded-card border border-gray-100 bg-white p-5 shadow-pop dark:border-waify-dark-border dark:bg-waify-dark-surface", children: [
        /* @__PURE__ */ jsx("h3", { className: "text-base font-semibold text-waify-text dark:text-waify-dark-text", children: "Approve payment" }),
        /* @__PURE__ */ jsxs("p", { className: "mt-1 text-sm text-waify-text-muted dark:text-waify-dark-text-muted", children: [
          approvalTx.invoice_number || approvalTx.reference,
          " · ",
          amount(approvalTx.amount_minor, approvalTx.currency)
        ] }),
        /* @__PURE__ */ jsx("label", { className: "mt-4 block text-xs font-medium uppercase tracking-wide text-waify-text-muted dark:text-waify-dark-text-muted", children: "Payment reference or UTR" }),
        /* @__PURE__ */ jsx("input", { value: approvalReference, onChange: (event) => setApprovalReference(event.target.value), className: "waify-input mt-1 w-full", autoFocus: true, placeholder: "Optional reference from bank/Razorpay" }),
        /* @__PURE__ */ jsxs("div", { className: "mt-5 flex justify-end gap-2", children: [
          /* @__PURE__ */ jsx(Button, { type: "button", variant: "secondary", onClick: () => setApprovalTx(null), children: "Cancel" }),
          /* @__PURE__ */ jsxs(Button, { type: "button", onClick: submitApprovePayment, children: [
            /* @__PURE__ */ jsx(CheckCircle2, { className: "h-4 w-4" }),
            "Approve"
          ] })
        ] })
      ] })
    ] }),
    rejectionTx && /* @__PURE__ */ jsxs("div", { className: "fixed inset-0 z-[200] flex items-center justify-center p-4", children: [
      /* @__PURE__ */ jsx("button", { type: "button", className: "absolute inset-0 bg-black/50", onClick: () => setRejectionTx(null), "aria-label": "Close" }),
      /* @__PURE__ */ jsxs("div", { className: "relative w-full max-w-md rounded-card border border-gray-100 bg-white p-5 shadow-pop dark:border-waify-dark-border dark:bg-waify-dark-surface", children: [
        /* @__PURE__ */ jsx("h3", { className: "text-base font-semibold text-waify-text dark:text-waify-dark-text", children: "Reject payment proof" }),
        /* @__PURE__ */ jsxs("p", { className: "mt-1 text-sm text-waify-text-muted dark:text-waify-dark-text-muted", children: [
          rejectionTx.invoice_number || rejectionTx.reference,
          " · customer will receive this reason."
        ] }),
        /* @__PURE__ */ jsx("label", { className: "mt-4 block text-xs font-medium uppercase tracking-wide text-waify-text-muted dark:text-waify-dark-text-muted", children: "Reason" }),
        /* @__PURE__ */ jsx("textarea", { value: rejectionReason, onChange: (event) => setRejectionReason(event.target.value), className: "waify-input mt-1 min-h-24 w-full", autoFocus: true, placeholder: "Example: UTR not visible or amount does not match invoice." }),
        /* @__PURE__ */ jsxs("div", { className: "mt-5 flex justify-end gap-2", children: [
          /* @__PURE__ */ jsx(Button, { type: "button", variant: "secondary", onClick: () => setRejectionTx(null), children: "Cancel" }),
          /* @__PURE__ */ jsxs(Button, { type: "button", variant: "secondary", disabled: !rejectionReason.trim(), onClick: submitRejectPayment, children: [
            /* @__PURE__ */ jsx(XCircle, { className: "h-4 w-4" }),
            "Reject"
          ] })
        ] })
      ] })
    ] }),
    voidTx && /* @__PURE__ */ jsxs("div", { className: "fixed inset-0 z-[200] flex items-center justify-center p-4", children: [
      /* @__PURE__ */ jsx("button", { type: "button", className: "absolute inset-0 bg-black/50", onClick: () => setVoidTx(null), "aria-label": "Close" }),
      /* @__PURE__ */ jsxs("div", { className: "relative w-full max-w-md rounded-card border border-gray-100 bg-white p-5 shadow-pop dark:border-waify-dark-border dark:bg-waify-dark-surface", children: [
        /* @__PURE__ */ jsx("h3", { className: "text-base font-semibold text-waify-text dark:text-waify-dark-text", children: "Void invoice" }),
        /* @__PURE__ */ jsxs("p", { className: "mt-1 text-sm text-waify-text-muted dark:text-waify-dark-text-muted", children: [
          voidTx.invoice_number || voidTx.reference,
          " will be closed as unpaid and hidden from payment instructions."
        ] }),
        /* @__PURE__ */ jsx("label", { className: "mt-4 block text-xs font-medium uppercase tracking-wide text-waify-text-muted dark:text-waify-dark-text-muted", children: "Reason" }),
        /* @__PURE__ */ jsx("textarea", { value: voidReason, onChange: (event) => setVoidReason(event.target.value), className: "waify-input mt-1 min-h-24 w-full", autoFocus: true, placeholder: "Example: duplicate test invoice or customer created a newer invoice." }),
        /* @__PURE__ */ jsxs("div", { className: "mt-5 flex justify-end gap-2", children: [
          /* @__PURE__ */ jsx(Button, { type: "button", variant: "secondary", onClick: () => setVoidTx(null), children: "Cancel" }),
          /* @__PURE__ */ jsxs(Button, { type: "button", variant: "secondary", disabled: !voidReason.trim(), onClick: submitVoidPayment, children: [
            /* @__PURE__ */ jsx(XCircle, { className: "h-4 w-4" }),
            "Void invoice"
          ] })
        ] })
      ] })
    ] })
  ] });
}
export {
  PlatformTransactionsIndex as default
};
