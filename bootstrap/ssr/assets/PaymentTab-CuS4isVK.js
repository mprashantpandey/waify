import { jsxs, jsx } from "react/jsx-runtime";
import { C as Card, a as CardHeader, b as CardTitle, c as CardContent } from "./Card-8uw03vLH.js";
import { T as TextInput } from "./TextInput-Dl1_GoEA.js";
import { I as InputLabel } from "./InputLabel-CE_n4Upz.js";
import { I as InputError } from "./InputError-DiSBWiye.js";
import { CreditCard, EyeOff, Eye, DollarSign, Receipt } from "lucide-react";
import { useState } from "react";
import "./utils-H80jjgLf.js";
import "clsx";
import "tailwind-merge";
function PaymentTab({ data, setData, errors }) {
  const [showRazorpaySecret, setShowRazorpaySecret] = useState(false);
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
            /* @__PURE__ */ jsxs("label", { className: "relative inline-flex items-center cursor-pointer", children: [
              /* @__PURE__ */ jsx(
                "input",
                {
                  type: "checkbox",
                  checked: data.payment?.razorpay_enabled || false,
                  onChange: (e) => setData("payment.razorpay_enabled", e.target.checked),
                  className: "sr-only peer"
                }
              ),
              /* @__PURE__ */ jsx("div", { className: "w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600" })
            ] })
          ] })
        ] })
      ] }) })
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
        ] })
      ] }) })
    ] })
  ] });
}
export {
  PaymentTab as default
};
