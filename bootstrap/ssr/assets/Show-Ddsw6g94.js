import { jsx, jsxs } from "react/jsx-runtime";
import { usePage, Link, router } from "@inertiajs/react";
import { useState } from "react";
import { P as PlatformShell } from "./PlatformShell-Ci7nfKb_.js";
import { C as Card, a as CardContent, b as CardHeader, c as CardTitle } from "./Card-DLPTnTfC.js";
import { B as Badge } from "./Badge-CHx1ViYT.js";
import { B as Button } from "./Button-ymbdH_NY.js";
import { ArrowLeft, Ban, CheckCircle, Users, Zap, Building2, MessageSquare } from "lucide-react";
import "./Topbar-B0L72tZm.js";
import "./BrandingWrapper-BZp9WdA-.js";
import "../ssr.js";
import "@inertiajs/react/server";
import "./vendor-BWyHebfG.js";
import "react-dom/server";
import "./GlobalFlashHandler-yL6veGcD.js";
import "./useToast-CwsXrmjR.js";
import "./utils-B2ZNUmII.js";
import "clsx";
import "tailwind-merge";
function PlatformTenantsShow({
  account
}) {
  const { auth } = usePage().props;
  const [confirmDisable, setConfirmDisable] = useState(false);
  const [confirmEnable, setConfirmEnable] = useState(false);
  const [walletAmount, setWalletAmount] = useState("0");
  const [billingCountryCode, setBillingCountryCode] = useState(account.billing_country_code || "");
  const [billingCurrency, setBillingCurrency] = useState(account.billing_currency || "");
  const [phoneVerificationRequired, setPhoneVerificationRequired] = useState(Boolean(account.phone_verification_required));
  const handleDisable = () => {
    router.post(route("platform.accounts.disable", { account: account.id }), {
      reason: "Disabled by platform admin"
    });
    setConfirmDisable(false);
  };
  const handleEnable = () => {
    router.post(route("platform.accounts.enable", { account: account.id }));
    setConfirmEnable(false);
  };
  const getStatusBadge = (status) => {
    const statusMap = {
      active: { variant: "success", label: "Active" },
      suspended: { variant: "warning", label: "Suspended" },
      disabled: { variant: "danger", label: "Disabled" }
    };
    const config = statusMap[status] || { variant: "default", label: status };
    return /* @__PURE__ */ jsx(Badge, { variant: config.variant, children: config.label });
  };
  return /* @__PURE__ */ jsx(PlatformShell, { auth, children: /* @__PURE__ */ jsxs("div", { className: "space-y-6", children: [
    /* @__PURE__ */ jsxs(
      Link,
      {
        href: route("platform.accounts.index"),
        className: "inline-flex items-center text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100",
        children: [
          /* @__PURE__ */ jsx(ArrowLeft, { className: "h-4 w-4 mr-1" }),
          "Back to Tenants"
        ]
      }
    ),
    /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between", children: [
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsxs("h1", { className: "text-2xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-3", children: [
          account.name,
          getStatusBadge(account.status)
        ] }),
        /* @__PURE__ */ jsx("p", { className: "mt-1 text-sm text-gray-500 dark:text-gray-400", children: account.slug })
      ] }),
      /* @__PURE__ */ jsx("div", { className: "flex items-center gap-2", children: account.status === "active" ? /* @__PURE__ */ jsxs(
        Button,
        {
          variant: "danger",
          onClick: () => setConfirmDisable(true),
          children: [
            /* @__PURE__ */ jsx(Ban, { className: "h-4 w-4 mr-2" }),
            "Disable Tenant"
          ]
        }
      ) : /* @__PURE__ */ jsxs(
        Button,
        {
          variant: "success",
          onClick: () => setConfirmEnable(true),
          children: [
            /* @__PURE__ */ jsx(CheckCircle, { className: "h-4 w-4 mr-2" }),
            "Enable Tenant"
          ]
        }
      ) })
    ] }),
    account.disabled_reason && /* @__PURE__ */ jsx(Card, { className: "border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20", children: /* @__PURE__ */ jsxs(CardContent, { className: "pt-6", children: [
      /* @__PURE__ */ jsxs("p", { className: "text-sm text-red-800 dark:text-red-200", children: [
        /* @__PURE__ */ jsx("strong", { children: "Disabled Reason:" }),
        " ",
        account.disabled_reason
      ] }),
      account.disabled_at && /* @__PURE__ */ jsxs("p", { className: "text-xs text-red-600 dark:text-red-400 mt-1", children: [
        "Disabled at: ",
        new Date(account.disabled_at).toLocaleString()
      ] })
    ] }) }),
    /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-6", children: [
      /* @__PURE__ */ jsxs(Card, { children: [
        /* @__PURE__ */ jsx(CardHeader, { children: /* @__PURE__ */ jsx(CardTitle, { children: "Tenant Information" }) }),
        /* @__PURE__ */ jsx(CardContent, { children: /* @__PURE__ */ jsxs("dl", { className: "space-y-4", children: [
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("dt", { className: "text-sm font-medium text-gray-500 dark:text-gray-400", children: "Name" }),
            /* @__PURE__ */ jsx("dd", { className: "mt-1 text-sm text-gray-900 dark:text-gray-100", children: account.name })
          ] }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("dt", { className: "text-sm font-medium text-gray-500 dark:text-gray-400", children: "Slug" }),
            /* @__PURE__ */ jsx("dd", { className: "mt-1 text-sm text-gray-900 dark:text-gray-100", children: account.slug })
          ] }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("dt", { className: "text-sm font-medium text-gray-500 dark:text-gray-400", children: "Status" }),
            /* @__PURE__ */ jsx("dd", { className: "mt-1", children: getStatusBadge(account.status) })
          ] }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("dt", { className: "text-sm font-medium text-gray-500 dark:text-gray-400", children: "Created" }),
            /* @__PURE__ */ jsx("dd", { className: "mt-1 text-sm text-gray-900 dark:text-gray-100", children: new Date(account.created_at).toLocaleString() })
          ] }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("dt", { className: "text-sm font-medium text-gray-500 dark:text-gray-400", children: "Billing Country / Currency" }),
            /* @__PURE__ */ jsxs("dd", { className: "mt-1 text-sm text-gray-900 dark:text-gray-100", children: [
              account.billing_country_code || "Default",
              " / ",
              account.billing_currency || "Default"
            ] })
          ] })
        ] }) })
      ] }),
      /* @__PURE__ */ jsxs(Card, { children: [
        /* @__PURE__ */ jsx(CardHeader, { children: /* @__PURE__ */ jsx(CardTitle, { children: "Owner" }) }),
        /* @__PURE__ */ jsx(CardContent, { children: /* @__PURE__ */ jsxs("dl", { className: "space-y-4", children: [
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("dt", { className: "text-sm font-medium text-gray-500 dark:text-gray-400", children: "Name" }),
            /* @__PURE__ */ jsx("dd", { className: "mt-1 text-sm text-gray-900 dark:text-gray-100", children: account.owner.name })
          ] }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("dt", { className: "text-sm font-medium text-gray-500 dark:text-gray-400", children: "Email" }),
            /* @__PURE__ */ jsx("dd", { className: "mt-1 text-sm text-gray-900 dark:text-gray-100", children: account.owner.email })
          ] })
        ] }) })
      ] }),
      /* @__PURE__ */ jsxs(Card, { children: [
        /* @__PURE__ */ jsx(CardHeader, { children: /* @__PURE__ */ jsx(CardTitle, { children: "Wallet" }) }),
        /* @__PURE__ */ jsxs(CardContent, { children: [
          /* @__PURE__ */ jsx("p", { className: "text-sm text-gray-500 dark:text-gray-400 mb-2", children: "Current Balance" }),
          /* @__PURE__ */ jsx("p", { className: "text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4", children: new Intl.NumberFormat("en-IN", { style: "currency", currency: account.wallet.currency }).format((account.wallet.balance_minor || 0) / 100) }),
          /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
            /* @__PURE__ */ jsx(
              "input",
              {
                type: "number",
                min: 1,
                value: walletAmount,
                onChange: (e) => setWalletAmount(e.target.value),
                className: "px-3 py-2 border rounded-md bg-white dark:bg-gray-900 text-sm"
              }
            ),
            /* @__PURE__ */ jsx(
              Button,
              {
                variant: "success",
                onClick: () => router.post(route("platform.accounts.wallet.credit", { account: account.id }), { amount_minor: Number(walletAmount), notes: "Platform credit" }),
                children: "Credit"
              }
            ),
            /* @__PURE__ */ jsx(
              Button,
              {
                variant: "danger",
                onClick: () => router.post(route("platform.accounts.wallet.debit", { account: account.id }), { amount_minor: Number(walletAmount), notes: "Platform debit" }),
                children: "Debit"
              }
            )
          ] }),
          /* @__PURE__ */ jsx(Link, { href: route("platform.transactions.index"), className: "mt-3 inline-block text-sm text-blue-600", children: "View all transactions" })
        ] })
      ] }),
      /* @__PURE__ */ jsxs(Card, { children: [
        /* @__PURE__ */ jsx(CardHeader, { children: /* @__PURE__ */ jsx(CardTitle, { children: "Billing Profile (Meta Pricing)" }) }),
        /* @__PURE__ */ jsx(CardContent, { children: /* @__PURE__ */ jsxs("div", { className: "space-y-3", children: [
          /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-2 gap-2", children: [
            /* @__PURE__ */ jsx(
              "input",
              {
                type: "text",
                maxLength: 2,
                value: billingCountryCode,
                onChange: (e) => setBillingCountryCode(e.target.value.toUpperCase()),
                placeholder: "Country (e.g. IN)",
                className: "px-3 py-2 border rounded-md bg-white dark:bg-gray-900 text-sm"
              }
            ),
            /* @__PURE__ */ jsx(
              "input",
              {
                type: "text",
                maxLength: 3,
                value: billingCurrency,
                onChange: (e) => setBillingCurrency(e.target.value.toUpperCase()),
                placeholder: "Currency (e.g. INR)",
                className: "px-3 py-2 border rounded-md bg-white dark:bg-gray-900 text-sm"
              }
            )
          ] }),
          /* @__PURE__ */ jsx("p", { className: "text-xs text-gray-500 dark:text-gray-400", children: "Used to resolve versioned Meta pricing for tenant billing estimates. Leave blank to use platform defaults." }),
          /* @__PURE__ */ jsx("div", { className: "flex items-center gap-2", children: /* @__PURE__ */ jsx(
            Button,
            {
              variant: "primary",
              onClick: () => router.post(route("platform.accounts.billing-profile.update", { account: account.id }), {
                billing_country_code: billingCountryCode || null,
                billing_currency: billingCurrency || null,
                phone_verification_required: phoneVerificationRequired
              }),
              children: "Save Billing Profile"
            }
          ) }),
          /* @__PURE__ */ jsxs("label", { className: "flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300", children: [
            /* @__PURE__ */ jsx(
              "input",
              {
                type: "checkbox",
                checked: phoneVerificationRequired,
                onChange: (e) => setPhoneVerificationRequired(e.target.checked),
                className: "rounded border-gray-300"
              }
            ),
            "Phone verification required (currently enforces phone on profile)"
          ] })
        ] }) })
      ] })
    ] }),
    /* @__PURE__ */ jsxs(Card, { children: [
      /* @__PURE__ */ jsx(CardHeader, { children: /* @__PURE__ */ jsx(CardTitle, { children: "Statistics" }) }),
      /* @__PURE__ */ jsx(CardContent, { children: /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-2 md:grid-cols-4 gap-4", children: [
        /* @__PURE__ */ jsxs("div", { className: "text-center", children: [
          /* @__PURE__ */ jsx(Users, { className: "h-8 w-8 text-blue-600 dark:text-blue-400 mx-auto mb-2" }),
          /* @__PURE__ */ jsx("p", { className: "text-2xl font-bold text-gray-900 dark:text-gray-100", children: account.members_count }),
          /* @__PURE__ */ jsx("p", { className: "text-xs text-gray-500 dark:text-gray-400", children: "Members" })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "text-center", children: [
          /* @__PURE__ */ jsx(Zap, { className: "h-8 w-8 text-purple-600 dark:text-purple-400 mx-auto mb-2" }),
          /* @__PURE__ */ jsx("p", { className: "text-2xl font-bold text-gray-900 dark:text-gray-100", children: account.modules_enabled }),
          /* @__PURE__ */ jsx("p", { className: "text-xs text-gray-500 dark:text-gray-400", children: "Modules Enabled" })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "text-center", children: [
          /* @__PURE__ */ jsx(Building2, { className: "h-8 w-8 text-green-600 dark:text-green-400 mx-auto mb-2" }),
          /* @__PURE__ */ jsx("p", { className: "text-2xl font-bold text-gray-900 dark:text-gray-100", children: account.whatsapp_connections_count }),
          /* @__PURE__ */ jsx("p", { className: "text-xs text-gray-500 dark:text-gray-400", children: "WhatsApp Connections" })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "text-center", children: [
          /* @__PURE__ */ jsx(MessageSquare, { className: "h-8 w-8 text-yellow-600 dark:text-yellow-400 mx-auto mb-2" }),
          /* @__PURE__ */ jsx("p", { className: "text-2xl font-bold text-gray-900 dark:text-gray-100", children: account.conversations_count }),
          /* @__PURE__ */ jsx("p", { className: "text-xs text-gray-500 dark:text-gray-400", children: "Conversations" })
        ] })
      ] }) })
    ] }),
    confirmDisable && /* @__PURE__ */ jsx("div", { className: "fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50", children: /* @__PURE__ */ jsxs(Card, { className: "w-full max-w-md", children: [
      /* @__PURE__ */ jsx(CardHeader, { children: /* @__PURE__ */ jsx(CardTitle, { children: "Disable Tenant" }) }),
      /* @__PURE__ */ jsxs(CardContent, { children: [
        /* @__PURE__ */ jsx("p", { className: "text-sm text-gray-600 dark:text-gray-400 mb-4", children: "Are you sure you want to disable this tenant? Users will not be able to access it." }),
        /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
          /* @__PURE__ */ jsx(Button, { variant: "danger", onClick: handleDisable, children: "Disable" }),
          /* @__PURE__ */ jsx(Button, { variant: "secondary", onClick: () => setConfirmDisable(false), children: "Cancel" })
        ] })
      ] })
    ] }) }),
    confirmEnable && /* @__PURE__ */ jsx("div", { className: "fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50", children: /* @__PURE__ */ jsxs(Card, { className: "w-full max-w-md", children: [
      /* @__PURE__ */ jsx(CardHeader, { children: /* @__PURE__ */ jsx(CardTitle, { children: "Enable Tenant" }) }),
      /* @__PURE__ */ jsxs(CardContent, { children: [
        /* @__PURE__ */ jsx("p", { className: "text-sm text-gray-600 dark:text-gray-400 mb-4", children: "Are you sure you want to enable this tenant?" }),
        /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
          /* @__PURE__ */ jsx(Button, { variant: "success", onClick: handleEnable, children: "Enable" }),
          /* @__PURE__ */ jsx(Button, { variant: "secondary", onClick: () => setConfirmEnable(false), children: "Cancel" })
        ] })
      ] })
    ] }) })
  ] }) });
}
export {
  PlatformTenantsShow as default
};
