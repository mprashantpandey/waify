import { jsxs, jsx } from "react/jsx-runtime";
import { C as Card, b as CardHeader, c as CardTitle, a as CardContent } from "./Card-BtIXZ0GS.js";
import { T as TextInput } from "./TextInput-CmkZX80k.js";
import { I as InputLabel } from "./InputLabel-BMzefKC8.js";
import { I as InputError } from "./InputError-DiSBWiye.js";
import { CreditCard, EyeOff, Eye, CalendarClock, Banknote, DollarSign, Receipt } from "lucide-react";
import { useState } from "react";
import "./utils-B2ZNUmII.js";
import "clsx";
import "tailwind-merge";
function PaymentTab({ data, setData, errors }) {
  const [showRazorpaySecret, setShowRazorpaySecret] = useState(false);
  const selfHostedEnabled = data.payment?.self_hosted_payments_enabled ?? true;
  const toggle = (checked, onChange) => /* @__PURE__ */ jsxs("label", { className: "relative inline-flex cursor-pointer items-center", children: [
    /* @__PURE__ */ jsx(
      "input",
      {
        type: "checkbox",
        checked,
        onChange: (e) => onChange(e.target.checked),
        className: "peer sr-only"
      }
    ),
    /* @__PURE__ */ jsx("div", { className: "h-6 w-11 rounded-full bg-gray-200 after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-gray-300 after:bg-white after:transition-all after:content-[''] peer-checked:bg-blue-600 peer-checked:after:translate-x-full peer-checked:after:border-white peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:bg-gray-700 dark:peer-focus:ring-blue-800" })
  ] });
  return /* @__PURE__ */ jsxs("div", { className: "space-y-6", children: [
    /* @__PURE__ */ jsxs(Card, { children: [
      /* @__PURE__ */ jsx(CardHeader, { children: /* @__PURE__ */ jsxs(CardTitle, { className: "flex items-center gap-2", children: [
        /* @__PURE__ */ jsx(CreditCard, { className: "h-5 w-5" }),
        "Razorpay Payment Gateway"
      ] }) }),
      /* @__PURE__ */ jsx(CardContent, { className: "space-y-6", children: /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("h3", { className: "text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4", children: "Razorpay" }),
        /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4", children: [
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx(InputLabel, { htmlFor: "payment.razorpay_key_id", value: "Key ID" }),
            /* @__PURE__ */ jsx(
              TextInput,
              {
                id: "payment.razorpay_key_id",
                type: "text",
                value: data.payment?.razorpay_key_id || "",
                onChange: (e) => setData("payment.razorpay_key_id", e.target.value),
                className: "mt-1",
                placeholder: "rzp_test_..."
              }
            ),
            /* @__PURE__ */ jsx(InputError, { message: errors["payment.razorpay_key_id"] })
          ] }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx(InputLabel, { htmlFor: "payment.razorpay_key_secret", value: "Key Secret" }),
            /* @__PURE__ */ jsxs("div", { className: "relative mt-1", children: [
              /* @__PURE__ */ jsx(
                TextInput,
                {
                  id: "payment.razorpay_key_secret",
                  type: showRazorpaySecret ? "text" : "password",
                  value: data.payment?.razorpay_key_secret || "",
                  onChange: (e) => setData("payment.razorpay_key_secret", e.target.value),
                  className: "pr-10"
                }
              ),
              /* @__PURE__ */ jsx(
                "button",
                {
                  type: "button",
                  onClick: () => setShowRazorpaySecret(!showRazorpaySecret),
                  className: "absolute right-2 top-1/2 -translate-y-1/2 p-1 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200",
                  children: showRazorpaySecret ? /* @__PURE__ */ jsx(EyeOff, { className: "h-4 w-4" }) : /* @__PURE__ */ jsx(Eye, { className: "h-4 w-4" })
                }
              )
            ] }),
            /* @__PURE__ */ jsx(InputError, { message: errors["payment.razorpay_key_secret"] })
          ] }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx(InputLabel, { htmlFor: "payment.razorpay_webhook_secret", value: "Webhook Secret" }),
            /* @__PURE__ */ jsx(
              TextInput,
              {
                id: "payment.razorpay_webhook_secret",
                type: "password",
                value: data.payment?.razorpay_webhook_secret || "",
                onChange: (e) => setData("payment.razorpay_webhook_secret", e.target.value),
                className: "mt-1"
              }
            ),
            /* @__PURE__ */ jsx(InputError, { message: errors["payment.razorpay_webhook_secret"] })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between", children: [
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx(InputLabel, { value: "Enable Razorpay" }),
              /* @__PURE__ */ jsx("p", { className: "text-sm text-gray-500 dark:text-gray-400", children: "Accept INR payments via Razorpay" })
            ] }),
            toggle(data.payment?.razorpay_enabled || false, (checked) => setData("payment.razorpay_enabled", checked))
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between", children: [
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx(InputLabel, { value: "Allow Wallet Self Top-up" }),
              /* @__PURE__ */ jsx("p", { className: "text-sm text-gray-500 dark:text-gray-400", children: "Let account owners add wallet credits from billing settings" })
            ] }),
            toggle(data.payment?.wallet_self_topup_enabled || false, (checked) => setData("payment.wallet_self_topup_enabled", checked))
          ] })
        ] })
      ] }) })
    ] }),
    /* @__PURE__ */ jsxs(Card, { children: [
      /* @__PURE__ */ jsx(CardHeader, { children: /* @__PURE__ */ jsxs(CardTitle, { className: "flex items-center gap-2", children: [
        /* @__PURE__ */ jsx(CalendarClock, { className: "h-5 w-5" }),
        "Subscription Recovery Controls"
      ] }) }),
      /* @__PURE__ */ jsx(CardContent, { className: "space-y-4", children: /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 gap-4 md:grid-cols-2", children: [
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx(InputLabel, { htmlFor: "payment.subscription_grace_days", value: "Grace Period After Renewal Date" }),
          /* @__PURE__ */ jsx(
            TextInput,
            {
              id: "payment.subscription_grace_days",
              type: "number",
              value: data.payment?.subscription_grace_days ?? 3,
              onChange: (e) => setData("payment.subscription_grace_days", parseInt(e.target.value) || 0),
              className: "mt-1",
              min: "0",
              max: "90"
            }
          ),
          /* @__PURE__ */ jsx("p", { className: "mt-1 text-xs text-gray-500 dark:text-gray-400", children: "Workspace remains active during this many overdue days." }),
          /* @__PURE__ */ jsx(InputError, { message: errors["payment.subscription_grace_days"] })
        ] }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx(InputLabel, { htmlFor: "payment.renewal_reminder_days", value: "Renewal Reminder Lead Time" }),
          /* @__PURE__ */ jsx(
            TextInput,
            {
              id: "payment.renewal_reminder_days",
              type: "number",
              value: data.payment?.renewal_reminder_days ?? 7,
              onChange: (e) => setData("payment.renewal_reminder_days", parseInt(e.target.value) || 0),
              className: "mt-1",
              min: "0",
              max: "90"
            }
          ),
          /* @__PURE__ */ jsx("p", { className: "mt-1 text-xs text-gray-500 dark:text-gray-400", children: "Send reminder this many days before period end." }),
          /* @__PURE__ */ jsx(InputError, { message: errors["payment.renewal_reminder_days"] })
        ] }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx(InputLabel, { htmlFor: "payment.renewal_reminder_time", value: "Reminder Time" }),
          /* @__PURE__ */ jsx(
            TextInput,
            {
              id: "payment.renewal_reminder_time",
              type: "time",
              value: data.payment?.renewal_reminder_time || "09:00",
              onChange: (e) => setData("payment.renewal_reminder_time", e.target.value),
              className: "mt-1"
            }
          ),
          /* @__PURE__ */ jsx(InputError, { message: errors["payment.renewal_reminder_time"] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between rounded-md border border-gray-200 p-4 dark:border-slate-700", children: [
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx(InputLabel, { value: "Auto-disable Overdue Workspaces" }),
            /* @__PURE__ */ jsx("p", { className: "text-sm text-gray-500 dark:text-gray-400", children: "Disable workspace access after the overdue threshold." })
          ] }),
          toggle(data.payment?.auto_disable_overdue_enabled || false, (checked) => setData("payment.auto_disable_overdue_enabled", checked))
        ] }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx(InputLabel, { htmlFor: "payment.auto_disable_overdue_days", value: "Auto-disable After Days" }),
          /* @__PURE__ */ jsx(
            TextInput,
            {
              id: "payment.auto_disable_overdue_days",
              type: "number",
              value: data.payment?.auto_disable_overdue_days ?? 7,
              onChange: (e) => setData("payment.auto_disable_overdue_days", parseInt(e.target.value) || 1),
              className: "mt-1",
              min: "1",
              max: "180"
            }
          ),
          /* @__PURE__ */ jsx(InputError, { message: errors["payment.auto_disable_overdue_days"] })
        ] })
      ] }) })
    ] }),
    /* @__PURE__ */ jsxs(Card, { children: [
      /* @__PURE__ */ jsx(CardHeader, { children: /* @__PURE__ */ jsxs(CardTitle, { className: "flex items-center gap-2", children: [
        /* @__PURE__ */ jsx(CreditCard, { className: "h-5 w-5" }),
        "Self-Hosted Payment Methods"
      ] }) }),
      /* @__PURE__ */ jsxs(CardContent, { className: "space-y-4", children: [
        /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between rounded-md border border-gray-200 p-4 dark:border-slate-700", children: [
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx(InputLabel, { value: "Enable Self-Hosted Payments" }),
            /* @__PURE__ */ jsx("p", { className: "text-sm text-gray-500 dark:text-gray-400", children: "Allow workspace owners to create Zyptos invoices/orders from billing." })
          ] }),
          toggle(selfHostedEnabled, (checked) => setData("payment.self_hosted_payments_enabled", checked))
        ] }),
        /* @__PURE__ */ jsx("div", { className: `grid grid-cols-1 gap-3 md:grid-cols-2 ${selfHostedEnabled ? "" : "opacity-50"}`, children: [
          ["payment.method_bank_enabled", "Bank Transfer / UPI"],
          ["payment.method_razorpay_enabled", "Razorpay one-time"]
        ].map(([key, label]) => /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between rounded-md border border-gray-200 p-3 dark:border-slate-700", children: [
          /* @__PURE__ */ jsx(InputLabel, { value: label }),
          toggle(data.payment?.[key.replace("payment.", "")] ?? true, (checked) => setData(key, checked))
        ] }, key)) }),
        /* @__PURE__ */ jsx("div", { className: "rounded-md border border-emerald-100 bg-emerald-50 p-4 text-sm text-emerald-900 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-100", children: /* @__PURE__ */ jsxs("div", { className: "flex items-start gap-3", children: [
          /* @__PURE__ */ jsx(Banknote, { className: "mt-0.5 h-4 w-4 shrink-0" }),
          /* @__PURE__ */ jsxs("p", { children: [
            "Offline checkout now uses one customer-facing option: ",
            /* @__PURE__ */ jsx("strong", { children: "Bank Transfer / UPI" }),
            ". These details appear on unpaid invoices and invoice emails."
          ] })
        ] }) }),
        /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4", children: [
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx(InputLabel, { htmlFor: "payment.upi_id", value: "UPI ID" }),
            /* @__PURE__ */ jsx(TextInput, { id: "payment.upi_id", value: data.payment?.upi_id || "", onChange: (e) => setData("payment.upi_id", e.target.value), className: "mt-1", placeholder: "billing@upi" }),
            /* @__PURE__ */ jsx(InputError, { message: errors["payment.upi_id"] })
          ] }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx(InputLabel, { htmlFor: "payment.upi_payee_name", value: "UPI Payee Name" }),
            /* @__PURE__ */ jsx(TextInput, { id: "payment.upi_payee_name", value: data.payment?.upi_payee_name || "", onChange: (e) => setData("payment.upi_payee_name", e.target.value), className: "mt-1" }),
            /* @__PURE__ */ jsx(InputError, { message: errors["payment.upi_payee_name"] })
          ] }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx(InputLabel, { htmlFor: "payment.bank_account_name", value: "Bank Account Name" }),
            /* @__PURE__ */ jsx(TextInput, { id: "payment.bank_account_name", value: data.payment?.bank_account_name || "", onChange: (e) => setData("payment.bank_account_name", e.target.value), className: "mt-1" }),
            /* @__PURE__ */ jsx(InputError, { message: errors["payment.bank_account_name"] })
          ] }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx(InputLabel, { htmlFor: "payment.bank_account_number", value: "Bank Account Number" }),
            /* @__PURE__ */ jsx(TextInput, { id: "payment.bank_account_number", value: data.payment?.bank_account_number || "", onChange: (e) => setData("payment.bank_account_number", e.target.value), className: "mt-1" }),
            /* @__PURE__ */ jsx(InputError, { message: errors["payment.bank_account_number"] })
          ] }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx(InputLabel, { htmlFor: "payment.bank_ifsc", value: "IFSC" }),
            /* @__PURE__ */ jsx(TextInput, { id: "payment.bank_ifsc", value: data.payment?.bank_ifsc || "", onChange: (e) => setData("payment.bank_ifsc", e.target.value.toUpperCase()), className: "mt-1" }),
            /* @__PURE__ */ jsx(InputError, { message: errors["payment.bank_ifsc"] })
          ] }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx(InputLabel, { htmlFor: "payment.bank_name", value: "Bank Name" }),
            /* @__PURE__ */ jsx(TextInput, { id: "payment.bank_name", value: data.payment?.bank_name || "", onChange: (e) => setData("payment.bank_name", e.target.value), className: "mt-1" }),
            /* @__PURE__ */ jsx(InputError, { message: errors["payment.bank_name"] })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "md:col-span-2", children: [
            /* @__PURE__ */ jsx(InputLabel, { htmlFor: "payment.manual_payment_note", value: "Additional Payment Instructions" }),
            /* @__PURE__ */ jsx(
              "textarea",
              {
                id: "payment.manual_payment_note",
                value: data.payment?.manual_payment_note || "",
                onChange: (e) => setData("payment.manual_payment_note", e.target.value),
                className: "mt-1 min-h-24 w-full rounded-md border-gray-300 shadow-sm focus:border-waify-green focus:ring-waify-green dark:border-slate-700 dark:bg-slate-900 dark:text-waify-dark-text"
              }
            ),
            /* @__PURE__ */ jsx(InputError, { message: errors["payment.manual_payment_note"] })
          ] })
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxs(Card, { children: [
      /* @__PURE__ */ jsx(CardHeader, { children: /* @__PURE__ */ jsxs(CardTitle, { className: "flex items-center gap-2", children: [
        /* @__PURE__ */ jsx(DollarSign, { className: "h-5 w-5" }),
        "Currency & Pricing"
      ] }) }),
      /* @__PURE__ */ jsx(CardContent, { className: "space-y-4", children: /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4", children: [
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx(InputLabel, { htmlFor: "payment.default_currency", value: "Default Currency" }),
          /* @__PURE__ */ jsxs(
            "select",
            {
              id: "payment.default_currency",
              value: data.payment?.default_currency || "USD",
              onChange: (e) => setData("payment.default_currency", e.target.value),
              className: "mt-1 w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100 dark:focus:border-indigo-500 dark:focus:ring-indigo-500",
              children: [
                /* @__PURE__ */ jsx("option", { value: "USD", children: "USD - US Dollar" }),
                /* @__PURE__ */ jsx("option", { value: "EUR", children: "EUR - Euro" }),
                /* @__PURE__ */ jsx("option", { value: "GBP", children: "GBP - British Pound" }),
                /* @__PURE__ */ jsx("option", { value: "INR", children: "INR - Indian Rupee" }),
                /* @__PURE__ */ jsx("option", { value: "JPY", children: "JPY - Japanese Yen" }),
                /* @__PURE__ */ jsx("option", { value: "AUD", children: "AUD - Australian Dollar" }),
                /* @__PURE__ */ jsx("option", { value: "CAD", children: "CAD - Canadian Dollar" }),
                /* @__PURE__ */ jsx("option", { value: "SGD", children: "SGD - Singapore Dollar" }),
                /* @__PURE__ */ jsx("option", { value: "AED", children: "AED - UAE Dirham" })
              ]
            }
          ),
          /* @__PURE__ */ jsx(InputError, { message: errors["payment.default_currency"] })
        ] }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx(InputLabel, { htmlFor: "payment.currency_symbol_position", value: "Symbol Position" }),
          /* @__PURE__ */ jsxs(
            "select",
            {
              id: "payment.currency_symbol_position",
              value: data.payment?.currency_symbol_position || "before",
              onChange: (e) => setData("payment.currency_symbol_position", e.target.value),
              className: "mt-1 w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100 dark:focus:border-indigo-500 dark:focus:ring-indigo-500",
              children: [
                /* @__PURE__ */ jsx("option", { value: "before", children: "Before ($100)" }),
                /* @__PURE__ */ jsx("option", { value: "after", children: "After (100$)" })
              ]
            }
          ),
          /* @__PURE__ */ jsx(InputError, { message: errors["payment.currency_symbol_position"] })
        ] })
      ] }) })
    ] }),
    /* @__PURE__ */ jsxs(Card, { children: [
      /* @__PURE__ */ jsx(CardHeader, { children: /* @__PURE__ */ jsxs(CardTitle, { className: "flex items-center gap-2", children: [
        /* @__PURE__ */ jsx(Receipt, { className: "h-5 w-5" }),
        "Invoice & Tax"
      ] }) }),
      /* @__PURE__ */ jsx(CardContent, { className: "space-y-4", children: /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4", children: [
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx(InputLabel, { htmlFor: "payment.legal_name", value: "Legal Business Name" }),
          /* @__PURE__ */ jsx(TextInput, { id: "payment.legal_name", value: data.payment?.legal_name || "", onChange: (e) => setData("payment.legal_name", e.target.value), className: "mt-1" }),
          /* @__PURE__ */ jsx(InputError, { message: errors["payment.legal_name"] })
        ] }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx(InputLabel, { htmlFor: "payment.gstin", value: "Supplier GSTIN" }),
          /* @__PURE__ */ jsx(TextInput, { id: "payment.gstin", value: data.payment?.gstin || "", onChange: (e) => setData("payment.gstin", e.target.value.toUpperCase()), className: "mt-1" }),
          /* @__PURE__ */ jsx(InputError, { message: errors["payment.gstin"] })
        ] }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx(InputLabel, { htmlFor: "payment.tax_rate", value: "Default Tax Rate (%)" }),
          /* @__PURE__ */ jsx(
            TextInput,
            {
              id: "payment.tax_rate",
              type: "number",
              value: data.payment?.tax_rate || 0,
              onChange: (e) => setData("payment.tax_rate", parseFloat(e.target.value) || 0),
              className: "mt-1",
              min: "0",
              max: "100",
              step: "0.01"
            }
          ),
          /* @__PURE__ */ jsx(InputError, { message: errors["payment.tax_rate"] })
        ] }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx(InputLabel, { htmlFor: "payment.sac_code", value: "SAC Code" }),
          /* @__PURE__ */ jsx(TextInput, { id: "payment.sac_code", type: "text", value: data.payment?.sac_code || "998313", onChange: (e) => setData("payment.sac_code", e.target.value), className: "mt-1" }),
          /* @__PURE__ */ jsx(InputError, { message: errors["payment.sac_code"] })
        ] }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx(InputLabel, { htmlFor: "payment.invoice_prefix", value: "Invoice Prefix" }),
          /* @__PURE__ */ jsx(
            TextInput,
            {
              id: "payment.invoice_prefix",
              type: "text",
              value: data.payment?.invoice_prefix || "INV-",
              onChange: (e) => setData("payment.invoice_prefix", e.target.value),
              className: "mt-1",
              placeholder: "INV-"
            }
          ),
          /* @__PURE__ */ jsx(InputError, { message: errors["payment.invoice_prefix"] })
        ] }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx(InputLabel, { htmlFor: "payment.invoice_number_start", value: "Invoice Number Start" }),
          /* @__PURE__ */ jsx(
            TextInput,
            {
              id: "payment.invoice_number_start",
              type: "number",
              value: data.payment?.invoice_number_start || 1,
              onChange: (e) => setData("payment.invoice_number_start", parseInt(e.target.value) || 1),
              className: "mt-1",
              min: "1"
            }
          ),
          /* @__PURE__ */ jsx(InputError, { message: errors["payment.invoice_number_start"] })
        ] }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx(InputLabel, { htmlFor: "payment.state_code", value: "Supplier State Code" }),
          /* @__PURE__ */ jsx(TextInput, { id: "payment.state_code", value: data.payment?.state_code || "", onChange: (e) => setData("payment.state_code", e.target.value.toUpperCase()), className: "mt-1", placeholder: "MH, DL, KA" }),
          /* @__PURE__ */ jsx(InputError, { message: errors["payment.state_code"] })
        ] }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx(InputLabel, { htmlFor: "payment.state", value: "Supplier State" }),
          /* @__PURE__ */ jsx(TextInput, { id: "payment.state", value: data.payment?.state || "", onChange: (e) => setData("payment.state", e.target.value), className: "mt-1" }),
          /* @__PURE__ */ jsx(InputError, { message: errors["payment.state"] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "md:col-span-2", children: [
          /* @__PURE__ */ jsx(InputLabel, { htmlFor: "payment.address_line1", value: "Registered Address" }),
          /* @__PURE__ */ jsx(TextInput, { id: "payment.address_line1", value: data.payment?.address_line1 || "", onChange: (e) => setData("payment.address_line1", e.target.value), className: "mt-1" }),
          /* @__PURE__ */ jsx(InputError, { message: errors["payment.address_line1"] })
        ] }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx(InputLabel, { htmlFor: "payment.city", value: "City" }),
          /* @__PURE__ */ jsx(TextInput, { id: "payment.city", value: data.payment?.city || "", onChange: (e) => setData("payment.city", e.target.value), className: "mt-1" }),
          /* @__PURE__ */ jsx(InputError, { message: errors["payment.city"] })
        ] }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx(InputLabel, { htmlFor: "payment.postal_code", value: "Postal Code" }),
          /* @__PURE__ */ jsx(TextInput, { id: "payment.postal_code", value: data.payment?.postal_code || "", onChange: (e) => setData("payment.postal_code", e.target.value), className: "mt-1" }),
          /* @__PURE__ */ jsx(InputError, { message: errors["payment.postal_code"] })
        ] })
      ] }) })
    ] })
  ] });
}
export {
  PaymentTab as default
};
