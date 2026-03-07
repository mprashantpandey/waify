import { jsxs, jsx, Fragment } from "react/jsx-runtime";
import { usePage, Head, Link, router } from "@inertiajs/react";
import axios from "axios";
import { useState } from "react";
import { A as AppShell } from "./AppShell-C0ldGEwS.js";
import { C as Card, b as CardHeader, c as CardTitle, d as CardDescription, a as CardContent } from "./Card-DLPTnTfC.js";
import { B as Badge } from "./Badge-CHx1ViYT.js";
import { B as Button } from "./Button-ymbdH_NY.js";
import { P as Progress } from "./Progress-BMolBmhQ.js";
import { AlertCircle, CreditCard, Clock, TrendingUp, MessageSquare, FileText, Zap, Users, ArrowRight } from "lucide-react";
import { u as useNotifications } from "./useNotifications-DZIlU05F.js";
import { A as Alert } from "./Alert-C-mQ6HNk.js";
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
import "./CookieConsentBanner-BJ5KL4CC.js";
import "./useConfirm-BKf7Nv1N.js";
function BillingIndex({
  account,
  subscription,
  plan,
  usage,
  meta_billing,
  wallet,
  recent_payments = [],
  current_connections_count,
  current_agents_count,
  razorpay_enabled = false,
  razorpay_key_id = null
}) {
  const { auth } = usePage().props;
  const { confirm } = useNotifications();
  const [renewing, setRenewing] = useState(false);
  const isOwner = Number(account.owner_id) === Number(auth?.user?.id);
  const razorpayEnabled = razorpay_enabled && Boolean(razorpay_key_id);
  const getStatusBadge = (status) => {
    const statusMap = {
      trialing: { variant: "default", label: "Trial" },
      active: { variant: "success", label: "Active" },
      past_due: { variant: "warning", label: "Past Due" },
      canceled: { variant: "danger", label: "Canceled" }
    };
    const config = statusMap[status] || { variant: "default", label: status };
    return /* @__PURE__ */ jsx(Badge, { variant: config.variant, className: "px-3 py-1", children: config.label });
  };
  const formatPrice = (price, currency) => {
    if (price === null) return "Custom";
    if (price === 0) return "Free";
    const major = price / 100;
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency,
      minimumFractionDigits: 0
    }).format(major);
  };
  const getUsagePercentage = (used, limit) => {
    if (!limit || limit === -1 || limit === 9999 || limit === 9999999) return 0;
    return Math.min(used / limit * 100, 100);
  };
  const getTrialDaysRemaining = (trialEndsAt) => {
    if (!trialEndsAt) return null;
    const now = /* @__PURE__ */ new Date();
    const end = new Date(trialEndsAt);
    const diffTime = end.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1e3 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 0;
  };
  const trialDays = subscription ? getTrialDaysRemaining(subscription.trial_ends_at) : null;
  const estimatedMetaCost = (meta_billing?.estimated_cost_minor ?? usage.meta_estimated_cost_minor ?? 0) / 100;
  const walletBalance = (wallet?.balance_minor ?? 0) / 100;
  const canRenewNow = Boolean(
    isOwner && subscription?.status === "past_due" && plan && (plan.price_monthly ?? 0) > 0 && razorpayEnabled
  );
  const loadRazorpay = () => new Promise((resolve, reject) => {
    if (typeof window !== "undefined" && window.Razorpay) {
      resolve();
      return;
    }
    const existingScript = document.querySelector('script[src="https://checkout.razorpay.com/v1/checkout.js"]');
    if (existingScript) {
      existingScript.addEventListener("load", () => resolve());
      existingScript.addEventListener("error", () => reject(new Error("Failed to load Razorpay script")));
      return;
    }
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    script.crossOrigin = "anonymous";
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Failed to load Razorpay script"));
    document.head.appendChild(script);
  });
  const handleRenewNow = async () => {
    if (!plan || !canRenewNow) return;
    const confirmed = await confirm({
      title: "Renew Subscription",
      message: `Proceed to renew ${plan.name}?`,
      variant: "info"
    });
    if (!confirmed) return;
    setRenewing(true);
    try {
      await loadRazorpay();
      const orderUrl = route("app.billing.razorpay.order", { plan: plan.key });
      const orderResponse = await axios.post(orderUrl, {}, {
        headers: { "X-Requested-With": "XMLHttpRequest", Accept: "application/json" }
      });
      const { order_id, amount, currency, key_id } = orderResponse.data || {};
      if (!order_id || !amount || !key_id || !window.Razorpay) {
        throw new Error("Invalid payment order response");
      }
      const razorpay = new window.Razorpay({
        key: key_id,
        amount: Number(amount),
        currency: currency || "INR",
        order_id,
        name: account.slug,
        description: `Renew ${plan.name}`,
        handler: async (response) => {
          await axios.post(route("app.billing.razorpay.confirm", {}), {
            order_id: response.razorpay_order_id,
            payment_id: response.razorpay_payment_id,
            signature: response.razorpay_signature
          });
          router.reload({ only: ["subscription", "plan", "recent_payments", "flash"] });
        },
        modal: {
          ondismiss: () => setRenewing(false)
        }
      });
      razorpay.on("payment.failed", () => setRenewing(false));
      razorpay.open();
    } catch {
      setRenewing(false);
      router.reload({ only: ["flash"] });
    }
  };
  const renderUsageMeter = (label, icon, used, limit, currentCount) => {
    if (limit === void 0) return null;
    const isUnlimited = limit === -1 || limit === 9999 || limit === 9999999;
    const percentage = isUnlimited ? 0 : getUsagePercentage(used, limit);
    const variant = percentage >= 90 ? "danger" : percentage >= 75 ? "warning" : "default";
    return /* @__PURE__ */ jsxs("div", { className: "p-5 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 space-y-3", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between", children: [
        /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3", children: [
          /* @__PURE__ */ jsx("div", { className: "p-2 bg-blue-500 rounded-lg", children: icon }),
          /* @__PURE__ */ jsx("span", { className: "text-sm font-semibold text-gray-700 dark:text-gray-300", children: label })
        ] }),
        /* @__PURE__ */ jsxs("span", { className: "text-sm font-bold text-gray-900 dark:text-gray-100", children: [
          used.toLocaleString(),
          " / ",
          isUnlimited ? "∞" : limit.toLocaleString(),
          currentCount !== void 0 && /* @__PURE__ */ jsxs("span", { className: "ml-1 text-xs text-gray-500 font-normal", children: [
            "(",
            currentCount,
            " active)"
          ] })
        ] })
      ] }),
      !isUnlimited && /* @__PURE__ */ jsxs(Fragment, { children: [
        /* @__PURE__ */ jsx(Progress, { value: percentage, variant, className: "h-2.5" }),
        percentage >= 90 && /* @__PURE__ */ jsxs("p", { className: "text-xs text-red-600 dark:text-red-400 font-medium", children: [
          "Near limit. ",
          /* @__PURE__ */ jsx(Link, { href: route("app.billing.plans", {}), className: "underline hover:no-underline", children: "Upgrade" })
        ] })
      ] })
    ] });
  };
  return /* @__PURE__ */ jsxs(AppShell, { children: [
    /* @__PURE__ */ jsx(Head, { title: "Billing Overview" }),
    /* @__PURE__ */ jsxs("div", { className: "space-y-8", children: [
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("h1", { className: "text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-gray-100 dark:to-gray-300 bg-clip-text text-transparent", children: "Billing Overview" }),
        /* @__PURE__ */ jsx("p", { className: "mt-2 text-sm text-gray-600 dark:text-gray-400", children: "Manage your subscription and view usage" })
      ] }),
      subscription?.status === "past_due" && /* @__PURE__ */ jsxs(Alert, { variant: "warning", className: "border-yellow-200 dark:border-yellow-800", children: [
        /* @__PURE__ */ jsx(AlertCircle, { className: "h-5 w-5" }),
        /* @__PURE__ */ jsxs("div", { className: "flex-1", children: [
          /* @__PURE__ */ jsx("h3", { className: "font-semibold text-yellow-800 dark:text-yellow-200 mb-1", children: "Subscription Payment Required" }),
          /* @__PURE__ */ jsx("p", { className: "text-sm text-yellow-700 dark:text-yellow-300 mb-3", children: "Your current billing cycle has ended and renewal payment is pending." }),
          subscription.last_error && /* @__PURE__ */ jsx("p", { className: "text-xs text-yellow-600 dark:text-yellow-400 italic mb-3", children: subscription.last_error }),
          /* @__PURE__ */ jsx("p", { className: "text-xs text-yellow-700 dark:text-yellow-300 mb-3", children: "Renew now to restore full access immediately and prevent workflow interruption." }),
          canRenewNow ? /* @__PURE__ */ jsx(Button, { variant: "secondary", size: "sm", className: "rounded-xl", onClick: handleRenewNow, disabled: renewing, children: renewing ? "Opening Checkout..." : "Renew Now" }) : /* @__PURE__ */ jsx(Link, { href: route("app.billing.plans", {}), children: /* @__PURE__ */ jsx(Button, { variant: "secondary", size: "sm", className: "rounded-xl", children: "Open Renewal Options" }) })
        ] })
      ] }),
      subscription?.status === "canceled" && /* @__PURE__ */ jsxs(Alert, { variant: "error", className: "border-red-200 dark:border-red-800", children: [
        /* @__PURE__ */ jsx(AlertCircle, { className: "h-5 w-5" }),
        /* @__PURE__ */ jsxs("div", { className: "flex-1", children: [
          /* @__PURE__ */ jsx("h3", { className: "font-semibold text-red-800 dark:text-red-200 mb-1", children: "Subscription Canceled" }),
          /* @__PURE__ */ jsxs("p", { className: "text-sm text-red-700 dark:text-red-300 mb-3", children: [
            "Your subscription was canceled on ",
            subscription.canceled_at ? new Date(subscription.canceled_at).toLocaleDateString() : "a previous date",
            ". You can reactivate it or choose a new plan."
          ] }),
          /* @__PURE__ */ jsx(Link, { href: route("app.billing.plans", {}), children: /* @__PURE__ */ jsx(Button, { variant: "secondary", size: "sm", className: "rounded-xl", children: "View Plans" }) })
        ] })
      ] }),
      /* @__PURE__ */ jsxs(Card, { className: "border-0 shadow-lg", children: [
        /* @__PURE__ */ jsx(CardHeader, { className: "bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20", children: /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between", children: [
          /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3", children: [
            /* @__PURE__ */ jsx("div", { className: "p-2 bg-blue-500 rounded-xl", children: /* @__PURE__ */ jsx(CreditCard, { className: "h-5 w-5 text-white" }) }),
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx(CardTitle, { className: "text-xl font-bold", children: "Current Plan" }),
              /* @__PURE__ */ jsx(CardDescription, { children: "Your active subscription details" })
            ] })
          ] }),
          subscription && getStatusBadge(subscription.status)
        ] }) }),
        /* @__PURE__ */ jsx(CardContent, { className: "p-6", children: plan ? /* @__PURE__ */ jsxs("div", { className: "space-y-6", children: [
          /* @__PURE__ */ jsx("div", { children: /* @__PURE__ */ jsx("h3", { className: "text-2xl font-bold text-gray-900 dark:text-gray-100 mb-1", children: plan.name }) }),
          /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-6", children: [
            /* @__PURE__ */ jsxs("div", { className: "p-4 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 rounded-xl flex-1", children: [
              /* @__PURE__ */ jsx("p", { className: "text-sm font-medium text-gray-500 dark:text-gray-400 mb-1", children: "Monthly" }),
              /* @__PURE__ */ jsx("p", { className: "text-2xl font-bold text-gray-900 dark:text-gray-100", children: formatPrice(plan.price_monthly, plan.currency) })
            ] }),
            plan.price_yearly && /* @__PURE__ */ jsxs("div", { className: "p-4 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 rounded-xl flex-1", children: [
              /* @__PURE__ */ jsx("p", { className: "text-sm font-medium text-gray-500 dark:text-gray-400 mb-1", children: "Yearly" }),
              /* @__PURE__ */ jsx("p", { className: "text-2xl font-bold text-gray-900 dark:text-gray-100", children: formatPrice(plan.price_yearly, plan.currency) })
            ] })
          ] }),
          subscription?.status === "trialing" && trialDays !== null && /* @__PURE__ */ jsx("div", { className: "p-4 bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-xl border border-blue-200 dark:border-blue-800", children: /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3", children: [
            /* @__PURE__ */ jsx(Clock, { className: "h-5 w-5 text-blue-600 dark:text-blue-400" }),
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsxs("p", { className: "font-semibold text-blue-800 dark:text-blue-200", children: [
                trialDays,
                " ",
                trialDays === 1 ? "day" : "days",
                " left in trial"
              ] }),
              /* @__PURE__ */ jsxs("p", { className: "text-sm text-blue-700 dark:text-blue-300 mt-1", children: [
                "Trial ends on ",
                subscription.trial_ends_at ? new Date(subscription.trial_ends_at).toLocaleDateString() : "soon"
              ] })
            ] })
          ] }) }),
          subscription?.cancel_at_period_end && /* @__PURE__ */ jsx("div", { className: "p-4 bg-gradient-to-r from-yellow-50 to-yellow-100 dark:from-yellow-900/20 dark:to-yellow-800/20 rounded-xl border border-yellow-200 dark:border-yellow-800", children: /* @__PURE__ */ jsxs("p", { className: "text-sm text-yellow-800 dark:text-yellow-200 font-medium", children: [
            "Subscription will be canceled on",
            " ",
            subscription.current_period_end ? new Date(subscription.current_period_end).toLocaleDateString() : "period end"
          ] }) }),
          /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3 pt-4 border-t border-gray-200 dark:border-gray-700", children: [
            subscription?.status === "past_due" && (canRenewNow ? /* @__PURE__ */ jsx(
              Button,
              {
                className: "bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 shadow-lg shadow-amber-500/40 rounded-xl",
                onClick: handleRenewNow,
                disabled: renewing,
                children: renewing ? "Opening Checkout..." : "Renew Now"
              }
            ) : /* @__PURE__ */ jsx(Link, { href: route("app.billing.plans", {}), children: /* @__PURE__ */ jsx(Button, { className: "bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 shadow-lg shadow-amber-500/40 rounded-xl", children: "Renew Now" }) })),
            /* @__PURE__ */ jsx(Link, { href: route("app.billing.plans", {}), children: /* @__PURE__ */ jsx(Button, { className: "bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 shadow-lg shadow-blue-500/50 rounded-xl", children: "Change Plan" }) }),
            isOwner && subscription && subscription.status === "active" && !subscription.cancel_at_period_end && /* @__PURE__ */ jsx(
              Button,
              {
                variant: "secondary",
                onClick: async () => {
                  const confirmed = await confirm({
                    title: "Cancel Subscription",
                    message: "Are you sure you want to cancel your subscription?",
                    variant: "warning"
                  });
                  if (confirmed) {
                    router.post(route("app.billing.cancel", {}));
                  }
                },
                className: "rounded-xl",
                children: "Cancel Subscription"
              }
            ),
            isOwner && subscription && subscription.cancel_at_period_end && /* @__PURE__ */ jsx(
              Button,
              {
                variant: "success",
                onClick: () => {
                  router.post(route("app.billing.resume", {}));
                },
                className: "rounded-xl",
                children: "Resume Subscription"
              }
            )
          ] })
        ] }) : /* @__PURE__ */ jsx("p", { className: "text-gray-500 dark:text-gray-400", children: "No plan assigned" }) })
      ] }),
      /* @__PURE__ */ jsxs(Card, { className: "border-0 shadow-lg", children: [
        /* @__PURE__ */ jsx(CardHeader, { className: "bg-gradient-to-r from-gray-50 to-white dark:from-gray-800 dark:to-gray-900", children: /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between gap-3", children: [
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx(CardTitle, { className: "text-xl font-bold", children: "Invoices & Transactions" }),
            /* @__PURE__ */ jsx(CardDescription, { children: "Latest billing activity with quick access" })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
            /* @__PURE__ */ jsx(Link, { href: route("app.billing.history", {}), children: /* @__PURE__ */ jsx(Button, { variant: "secondary", size: "sm", className: "rounded-xl", children: "Invoices" }) }),
            /* @__PURE__ */ jsx(Link, { href: route("app.billing.transactions", {}), children: /* @__PURE__ */ jsx(Button, { variant: "secondary", size: "sm", className: "rounded-xl", children: "Transactions" }) })
          ] })
        ] }) }),
        /* @__PURE__ */ jsx(CardContent, { className: "p-0", children: /* @__PURE__ */ jsx("div", { className: "overflow-x-auto", children: /* @__PURE__ */ jsxs("table", { className: "w-full", children: [
          /* @__PURE__ */ jsx("thead", { className: "bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700", children: /* @__PURE__ */ jsxs("tr", { children: [
            /* @__PURE__ */ jsx("th", { className: "px-6 py-3 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider", children: "Invoice" }),
            /* @__PURE__ */ jsx("th", { className: "px-6 py-3 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider", children: "Plan" }),
            /* @__PURE__ */ jsx("th", { className: "px-6 py-3 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider", children: "Amount" }),
            /* @__PURE__ */ jsx("th", { className: "px-6 py-3 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider", children: "Status" }),
            /* @__PURE__ */ jsx("th", { className: "px-6 py-3 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider", children: "Date" })
          ] }) }),
          /* @__PURE__ */ jsx("tbody", { className: "divide-y divide-gray-200 dark:divide-gray-800 bg-white dark:bg-gray-900", children: recent_payments.length === 0 ? /* @__PURE__ */ jsx("tr", { children: /* @__PURE__ */ jsx("td", { colSpan: 5, className: "px-6 py-8 text-center text-sm text-gray-500 dark:text-gray-400", children: "No invoice records yet." }) }) : recent_payments.map((payment) => /* @__PURE__ */ jsxs("tr", { children: [
            /* @__PURE__ */ jsx("td", { className: "px-6 py-4 text-xs font-mono text-gray-700 dark:text-gray-300", children: payment.invoice_no }),
            /* @__PURE__ */ jsx("td", { className: "px-6 py-4 text-sm text-gray-700 dark:text-gray-300", children: payment.plan_name || "—" }),
            /* @__PURE__ */ jsx("td", { className: "px-6 py-4 text-sm font-semibold text-gray-900 dark:text-gray-100", children: formatPrice(payment.amount, payment.currency) }),
            /* @__PURE__ */ jsx("td", { className: "px-6 py-4 text-sm", children: getStatusBadge(payment.status) }),
            /* @__PURE__ */ jsx("td", { className: "px-6 py-4 text-sm text-gray-700 dark:text-gray-300", children: new Date(payment.created_at).toLocaleString() })
          ] }, payment.id)) })
        ] }) }) })
      ] }),
      /* @__PURE__ */ jsxs(Card, { className: "border-0 shadow-lg", children: [
        /* @__PURE__ */ jsx(CardHeader, { className: "bg-gradient-to-r from-gray-50 to-white dark:from-gray-800 dark:to-gray-900", children: /* @__PURE__ */ jsx("div", { className: "flex items-center justify-between", children: /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3", children: [
          /* @__PURE__ */ jsx("div", { className: "p-2 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl", children: /* @__PURE__ */ jsx(TrendingUp, { className: "h-5 w-5 text-white" }) }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx(CardTitle, { className: "text-xl font-bold", children: "Current Usage (This Month)" }),
            /* @__PURE__ */ jsx(CardDescription, { children: "Track your usage against plan limits" })
          ] })
        ] }) }) }),
        /* @__PURE__ */ jsxs(CardContent, { className: "p-6 space-y-4", children: [
          renderUsageMeter(
            "Messages Sent",
            /* @__PURE__ */ jsx(MessageSquare, { className: "h-4 w-4 text-white" }),
            usage.messages_sent,
            plan?.limits.messages_monthly
          ),
          renderUsageMeter(
            "Template Sends",
            /* @__PURE__ */ jsx(FileText, { className: "h-4 w-4 text-white" }),
            usage.template_sends,
            plan?.limits.template_sends_monthly
          ),
          renderUsageMeter(
            "WhatsApp Connections",
            /* @__PURE__ */ jsx(Zap, { className: "h-4 w-4 text-white" }),
            current_connections_count || 0,
            plan?.limits.whatsapp_connections,
            current_connections_count
          ),
          renderUsageMeter(
            "Agents",
            /* @__PURE__ */ jsx(Users, { className: "h-4 w-4 text-white" }),
            current_agents_count || 0,
            plan?.limits.agents,
            current_agents_count
          ),
          /* @__PURE__ */ jsxs("div", { className: "p-5 bg-gradient-to-r from-emerald-50 to-emerald-100 dark:from-emerald-900/20 dark:to-emerald-800/20 rounded-xl border border-emerald-200 dark:border-emerald-800 space-y-3", children: [
            /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between", children: [
              /* @__PURE__ */ jsx("span", { className: "text-sm font-semibold text-gray-700 dark:text-gray-300", children: "Meta Conversation Billing (Estimate)" }),
              /* @__PURE__ */ jsx("span", { className: "text-sm font-bold text-gray-900 dark:text-gray-100", children: new Intl.NumberFormat("en-IN", { style: "currency", currency: meta_billing?.currency || "INR", minimumFractionDigits: 2 }).format(estimatedMetaCost) })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "text-xs text-gray-600 dark:text-gray-400 space-y-1", children: [
              /* @__PURE__ */ jsxs("p", { children: [
                "Free tier used: ",
                (meta_billing?.free_tier_used ?? usage.meta_conversations_free_used ?? 0).toLocaleString(),
                " / ",
                (meta_billing?.free_tier_limit ?? 1e3).toLocaleString()
              ] }),
              /* @__PURE__ */ jsxs("p", { children: [
                "Paid conversations: ",
                (usage.meta_conversations_paid ?? 0).toLocaleString()
              ] }),
              /* @__PURE__ */ jsx("p", { children: meta_billing?.note ?? "Meta charges are separate from your app plan. These values are usage estimates based on webhook data." })
            ] })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "pt-4 border-t border-gray-200 dark:border-gray-700 flex flex-wrap gap-4", children: [
            /* @__PURE__ */ jsxs(
              Link,
              {
                href: route("app.billing.usage", {}),
                className: "inline-flex items-center gap-2 text-sm font-medium text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors",
                children: [
                  "View detailed usage",
                  /* @__PURE__ */ jsx(ArrowRight, { className: "h-4 w-4" })
                ]
              }
            ),
            /* @__PURE__ */ jsxs(
              Link,
              {
                href: route("app.billing.history", {}),
                className: "inline-flex items-center gap-2 text-sm font-medium text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors",
                children: [
                  "View payment history",
                  /* @__PURE__ */ jsx(ArrowRight, { className: "h-4 w-4" })
                ]
              }
            ),
            /* @__PURE__ */ jsxs(
              Link,
              {
                href: route("app.billing.transactions", {}),
                className: "inline-flex items-center gap-2 text-sm font-medium text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors",
                children: [
                  "View transactions & wallet",
                  /* @__PURE__ */ jsx(ArrowRight, { className: "h-4 w-4" })
                ]
              }
            ),
            /* @__PURE__ */ jsxs("span", { className: "inline-flex items-center text-sm text-gray-600 dark:text-gray-400", children: [
              "Wallet: ",
              new Intl.NumberFormat("en-IN", { style: "currency", currency: wallet?.currency || "INR" }).format(walletBalance)
            ] })
          ] })
        ] })
      ] })
    ] })
  ] });
}
export {
  BillingIndex as default
};
