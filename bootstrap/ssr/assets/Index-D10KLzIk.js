import { jsxs, jsx, Fragment } from "react/jsx-runtime";
import { Link, usePage, router, Head } from "@inertiajs/react";
import axios from "axios";
import { useState, useEffect } from "react";
import { A as AppShell } from "./AppShell-Kl-OcWqz.js";
import { C as Card } from "./Card-BtIXZ0GS.js";
import { B as Badge } from "./Badge-C65MHc2S.js";
import { B as Button } from "./Button-BJftGNki.js";
import { P as Progress } from "./Progress-Dq7CiVNZ.js";
import { Send, FileText, Zap, Users, MessageSquare, Check, Eye, Download, Upload, WalletCards, CheckCircle, XCircle, Plus, ExternalLink, CreditCard, Calendar, Receipt, X, Printer } from "lucide-react";
import { c as cn } from "./utils-B2ZNUmII.js";
import { u as useNotifications } from "./useNotifications-CWqdQOlf.js";
import { u as useToast } from "./useToast-BN7qsQL3.js";
import "./BrandingWrapper-CZn0jBQL.js";
import "./Elements-EbyZDnT_.js";
import "@headlessui/react";
import "./CookieConsentBanner-X10ew4Dy.js";
import "./RealtimeProvider-D1qLzQY9.js";
import "laravel-echo";
import "pusher-js";
import "clsx";
import "tailwind-merge";
import "./useConfirm-gGqxmsEz.js";
const billingTabs = [
  { id: "overview", label: "Overview" },
  { id: "usage", label: "Usage" },
  { id: "plans", label: "Plans" },
  { id: "invoices", label: "Invoices" },
  { id: "payment", label: "Payment" }
];
function BillingNav({ active, onChange }) {
  return /* @__PURE__ */ jsx("div", { className: "border-b border-gray-100 px-4 pt-3 dark:border-slate-700", children: /* @__PURE__ */ jsx("div", { className: "-mb-px flex min-w-0 items-center gap-1 overflow-x-auto", children: billingTabs.map((tab) => {
    const isActive = active === tab.id;
    const className = cn(
      "relative inline-flex h-10 shrink-0 items-center whitespace-nowrap px-3 text-sm font-medium transition",
      isActive ? "text-waify-text dark:text-waify-dark-text" : "text-waify-text-muted hover:text-waify-text dark:text-waify-dark-text-muted dark:hover:text-waify-dark-text"
    );
    const content = /* @__PURE__ */ jsxs(Fragment, { children: [
      tab.label,
      isActive && /* @__PURE__ */ jsx("span", { className: "absolute bottom-0 left-2 right-2 h-0.5 rounded-full bg-waify-green" })
    ] });
    if (onChange) {
      return /* @__PURE__ */ jsx("button", { type: "button", onClick: () => onChange(tab.id), className, children: content }, tab.id);
    }
    return /* @__PURE__ */ jsx(
      Link,
      {
        href: route("app.billing.index", tab.id === "overview" ? {} : { tab: tab.id }),
        className,
        children: content
      },
      tab.id
    );
  }) }) });
}
function BillingSurface({ active, children, onTabChange }) {
  return /* @__PURE__ */ jsxs(Card, { className: "overflow-hidden p-0", children: [
    /* @__PURE__ */ jsx(BillingNav, { active, onChange: onTabChange }),
    /* @__PURE__ */ jsx("div", { className: "space-y-6 p-6", children })
  ] });
}
function BillingInfoBanner({
  variant = "success",
  title,
  message,
  children
}) {
  const styles = {
    success: "border-emerald-200 bg-emerald-50 dark:border-emerald-900/60 dark:bg-emerald-950/30",
    info: "border-blue-200 bg-blue-50 dark:border-blue-900/60 dark:bg-blue-950/30",
    warning: "border-amber-200 bg-amber-50 dark:border-amber-900/60 dark:bg-amber-950/30",
    danger: "border-red-200 bg-red-50 dark:border-red-900/60 dark:bg-red-950/30"
  };
  return /* @__PURE__ */ jsxs("div", { className: cn("rounded-card border p-4", styles[variant]), children: [
    /* @__PURE__ */ jsx("div", { className: "text-sm font-semibold text-waify-text dark:text-waify-dark-text", children: title }),
    message && /* @__PURE__ */ jsx("p", { className: "mt-0.5 text-sm text-waify-text-muted dark:text-waify-dark-text-muted", children: message }),
    children
  ] });
}
function BillingTable({ children }) {
  return /* @__PURE__ */ jsx(Card, { className: "overflow-hidden p-0", children: /* @__PURE__ */ jsx("div", { className: "overflow-x-auto", children }) });
}
const billingTableClass = "w-full text-sm";
const billingTheadClass = "bg-gray-50/60 text-left text-[11px] uppercase tracking-wider text-waify-text-muted dark:bg-slate-800/50 dark:text-waify-dark-text-muted";
const billingThClass = "px-5 py-3 font-medium";
const billingTdClass = "px-5 py-3.5 text-waify-text dark:text-waify-dark-text";
const billingTrClass = "border-t border-gray-100 transition hover:bg-gray-50/60 dark:border-slate-700 dark:hover:bg-slate-800/30";
function BillingIndex({
  active_tab = "overview",
  auto_checkout_plan_key = null,
  account,
  subscription,
  plan,
  usage,
  current_usage,
  limits = {},
  usage_history = [],
  blocked_events = [],
  wallet,
  payments = [],
  transactions = [],
  plans = [],
  current_plan_key,
  razorpay_enabled = false,
  razorpay_key_id = null,
  payment_methods = [],
  current_connections_count = 0,
  current_agents_count = 0,
  billing_profile,
  supplier_tax_profile
}) {
  const { auth, branding } = usePage().props;
  const { confirm } = useNotifications();
  const checkoutBrandName = branding?.platform_name || "Zyptos";
  const { addToast } = useToast();
  const [activeTab, setActiveTab] = useState(active_tab);
  const [billingCycle, setBillingCycle] = useState("monthly");
  const [paymentMethod, setPaymentMethod] = useState("razorpay");
  const [promoCode, setPromoCode] = useState("");
  const [switchingPlan, setSwitchingPlan] = useState(null);
  const [checkoutPlan, setCheckoutPlan] = useState(null);
  const [checkoutPreview, setCheckoutPreview] = useState(null);
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [checkoutError, setCheckoutError] = useState(null);
  const [autoCheckoutOpened, setAutoCheckoutOpened] = useState(false);
  const [uploadingProof, setUploadingProof] = useState(null);
  const [showTopupDialog, setShowTopupDialog] = useState(false);
  const [previewInvoice, setPreviewInvoice] = useState(null);
  const [topupAmountMajor, setTopupAmountMajor] = useState("");
  const [topupNotes, setTopupNotes] = useState("");
  const isOwner = Number(account.owner_id) === Number(auth?.user?.id);
  const currentUsage = current_usage ?? usage;
  const nextBillingDate = subscription?.current_period_end || subscription?.trial_ends_at;
  const enabledPaymentMethods = payment_methods.filter((method) => method.enabled);
  const effectivePaymentMethod = enabledPaymentMethods.length === 1 ? enabledPaymentMethods[0].key : paymentMethod;
  const hasPaidCheckout = enabledPaymentMethods.length > 0;
  useEffect(() => {
    if (enabledPaymentMethods.length === 0) {
      return;
    }
    if (!enabledPaymentMethods.some((method) => method.key === paymentMethod)) {
      setPaymentMethod((enabledPaymentMethods.find((method) => method.key === "razorpay") ?? enabledPaymentMethods[0]).key);
    }
  }, [enabledPaymentMethods, paymentMethod]);
  useEffect(() => {
    if (autoCheckoutOpened || !auto_checkout_plan_key || plans.length === 0) {
      return;
    }
    const candidate = plans.find((item) => item.key === auto_checkout_plan_key);
    if (!candidate || candidate.requires_admin_approval) {
      return;
    }
    setActiveTab("plans");
    setCheckoutPlan(candidate);
    setAutoCheckoutOpened(true);
  }, [autoCheckoutOpened, auto_checkout_plan_key, plans]);
  useEffect(() => {
    if (!checkoutPlan) {
      setCheckoutPreview(null);
      setCheckoutError(null);
      return;
    }
    const timeout = window.setTimeout(() => {
      setCheckoutLoading(true);
      setCheckoutError(null);
      axios.post(route("app.billing.preview", { plan: checkoutPlan.key }), {
        billing_cycle: billingCycle,
        promo_code: promoCode.trim() || void 0
      }).then((response) => {
        setCheckoutPreview(response.data);
      }).catch((error) => {
        setCheckoutError(error?.response?.data?.message || error?.message || "Could not preview checkout.");
        setCheckoutPreview(null);
      }).finally(() => setCheckoutLoading(false));
    }, 250);
    return () => window.clearTimeout(timeout);
  }, [checkoutPlan, billingCycle, promoCode]);
  const formatMoney = (minor, currency = "INR", fractionDigits = 0) => {
    if (minor === null || minor === void 0) return "Custom";
    if (minor === 0) return "₹0";
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency,
      minimumFractionDigits: fractionDigits
    }).format(minor / 100);
  };
  const formatLimit = (limit) => {
    if (limit === void 0) return "N/A";
    if (limit === -1 || limit === 9999 || limit === 9999999) return "Unlimited";
    return limit.toLocaleString("en-IN");
  };
  const percentage = (used, limit) => {
    if (!limit || limit === -1 || limit === 9999 || limit === 9999999) return 0;
    return Math.min(used / limit * 100, 100);
  };
  const selectedPrice = (candidate) => billingCycle === "yearly" ? candidate.price_yearly : candidate.price_monthly;
  const currentPlan = plans.find((candidate) => candidate.key === current_plan_key) ?? plan;
  const walletMayCoverPlan = (candidate) => {
    const price = selectedPrice(candidate);
    return Boolean(price && price > 0 && wallet.currency === candidate.currency && wallet.balance_minor >= price);
  };
  const usageMeter = (label, icon, used, limit, currentCount) => {
    if (limit === void 0) return null;
    const pct = percentage(used, limit);
    const warn = pct >= 85;
    return /* @__PURE__ */ jsxs("div", { className: "rounded-card bg-gray-50/80 p-4 ring-1 ring-gray-100 dark:bg-slate-800/50 dark:ring-slate-700", children: [
      /* @__PURE__ */ jsxs("div", { className: "mb-3 flex items-center gap-3", children: [
        /* @__PURE__ */ jsx("span", { className: `flex h-9 w-9 items-center justify-center rounded-lg ${warn ? "bg-amber-50 text-amber-600 dark:bg-amber-950/40 dark:text-amber-300" : "bg-waify-green/10 text-waify-green"}`, children: icon }),
        /* @__PURE__ */ jsxs("div", { className: "min-w-0 flex-1", children: [
          /* @__PURE__ */ jsx("div", { className: "text-sm font-medium text-waify-text dark:text-waify-dark-text", children: label }),
          /* @__PURE__ */ jsxs("div", { className: "mt-0.5 text-xs tabular-nums text-waify-text-muted dark:text-waify-dark-text-muted", children: [
            used.toLocaleString("en-IN"),
            " / ",
            formatLimit(limit),
            currentCount !== void 0 && /* @__PURE__ */ jsxs("span", { children: [
              " (",
              currentCount,
              " active)"
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxs("span", { className: `text-sm font-bold tabular-nums ${warn ? "text-amber-600 dark:text-amber-300" : "text-waify-text dark:text-waify-dark-text"}`, children: [
          Math.round(pct),
          "%"
        ] })
      ] }),
      /* @__PURE__ */ jsx(Progress, { value: pct, variant: warn ? "warning" : "default", className: "h-2" }),
      warn && /* @__PURE__ */ jsx("p", { className: "mt-2 text-[11px] text-amber-600 dark:text-amber-300", children: "Approaching limit. Consider upgrading or buying credits." })
    ] });
  };
  const loadRazorpay = () => new Promise((resolve, reject) => {
    if (typeof window !== "undefined" && window.Razorpay) return resolve();
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
  const handleSwitchPlan = async (candidate) => {
    if (candidate.requires_admin_approval) {
      addToast({
        title: "Admin approval required",
        description: "Enterprise plans can only be activated by a platform admin.",
        variant: "info"
      });
      return;
    }
    const price = selectedPrice(candidate);
    const isRenewal = Boolean(candidate.is_current && candidate.can_renew);
    if (price && price > 0) {
      setCheckoutPlan(candidate);
      return;
    }
    const confirmed = await confirm({
      title: isRenewal ? "Renew Plan" : "Switch Plan",
      message: isRenewal ? `Start ${candidate.name} again?` : `Switch to ${candidate.name}?`,
      variant: "info"
    });
    if (!confirmed) return;
    setSwitchingPlan(candidate.key);
    router.post(route("app.billing.switch-plan", { plan: candidate.key }), {}, {
      onFinish: () => setSwitchingPlan(null),
      onSuccess: () => router.reload()
    });
  };
  const closeCheckout = () => {
    if (switchingPlan) return;
    setCheckoutPlan(null);
    setCheckoutPreview(null);
    setCheckoutError(null);
  };
  const purchaseWithCredits = () => {
    if (!checkoutPlan || !checkoutPreview) return;
    setSwitchingPlan(checkoutPlan.key);
    router.post(route("app.billing.credits.purchase", { plan: checkoutPlan.key }), {
      billing_cycle: billingCycle,
      promo_code: promoCode.trim() || void 0
    }, {
      onSuccess: () => {
        addToast({ title: "Plan activated", description: "Wallet credits were applied to this purchase.", variant: "success" });
        setCheckoutPlan(null);
        router.reload({ only: ["subscription", "plan", "wallet", "transactions", "payments", "plans"] });
      },
      onError: (errors) => {
        addToast({ title: "Credit purchase failed", description: Object.values(errors)[0] || "Could not apply wallet credits.", variant: "error" });
      },
      onFinish: () => setSwitchingPlan(null)
    });
  };
  const submitCheckout = async () => {
    if (!checkoutPlan || !checkoutPreview) return;
    if (!hasPaidCheckout) {
      addToast({ title: "Checkout unavailable", description: "No self-hosted payment method is enabled.", variant: "error" });
      return;
    }
    setSwitchingPlan(checkoutPlan.key);
    try {
      const method = effectivePaymentMethod;
      const order = await axios.post(route("app.billing.orders.store", { plan: checkoutPlan.key }), {
        billing_cycle: billingCycle,
        promo_code: promoCode.trim() || void 0,
        payment_method: method
      });
      if (method === "razorpay") {
        const razorpay = order.data.razorpay;
        const checkoutBrand = razorpay?.checkout_brand || order.data.checkout_brand || {};
        await loadRazorpay();
        const options = {
          key: razorpay?.key_id,
          amount: razorpay?.amount,
          currency: razorpay?.currency || "INR",
          name: checkoutBrand.name || checkoutBrandName,
          image: checkoutBrand.image || void 0,
          description: checkoutPlan.name,
          prefill: {
            name: account.owner?.name || "",
            email: account.owner?.email || ""
          },
          theme: { color: branding?.primary_color || "#00A548" },
          handler: async (response) => {
            await axios.post(route("app.billing.razorpay.confirm"), {
              order_id: response.razorpay_order_id,
              payment_id: response.razorpay_payment_id,
              signature: response.razorpay_signature
            });
            addToast({ title: "Payment successful. Plan activated.", variant: "success" });
            setCheckoutPlan(null);
            router.reload();
          },
          modal: { ondismiss: () => setSwitchingPlan(null) }
        };
        options.order_id = razorpay?.order_id;
        new window.Razorpay(options).open();
        setSwitchingPlan(null);
      } else {
        addToast({ title: "Invoice created", description: "Complete payment and upload proof from the invoices tab.", variant: "success" });
        setActiveTab("invoices");
        setCheckoutPlan(null);
        router.reload({ only: ["payments", "transactions", "subscription", "plan"] });
      }
    } catch (error) {
      addToast({ title: "Checkout failed", description: error?.response?.data?.message || error?.message, variant: "error" });
      setSwitchingPlan(null);
    }
  };
  const submitTopup = async (event) => {
    event.preventDefault();
    const amountMinor = Math.round(Number(topupAmountMajor) * 100);
    if (!amountMinor || amountMinor < 100) {
      addToast({ title: "Enter a valid amount", variant: "error" });
      return;
    }
    try {
      await loadRazorpay();
      const order = await axios.post(route("app.billing.wallet.topup"), {
        amount_minor: amountMinor,
        notes: topupNotes || void 0
      });
      const options = {
        key: order.data.key_id,
        amount: order.data.amount,
        currency: order.data.currency,
        name: "Zyptos Wallet",
        description: "Wallet top-up",
        theme: { color: "#00A548" },
        handler: async (response) => {
          await axios.post(route("app.billing.wallet.topup.confirm"), {
            order_id: response.razorpay_order_id,
            payment_id: response.razorpay_payment_id,
            signature: response.razorpay_signature
          });
          setShowTopupDialog(false);
          setTopupAmountMajor("");
          setTopupNotes("");
          addToast({ title: "Wallet balance updated", variant: "success" });
          router.reload();
        }
      };
      new window.Razorpay(options).open();
    } catch (error) {
      addToast({ title: "Top-up failed", description: error?.response?.data?.message || error?.message, variant: "error" });
    }
  };
  const invoiceId = (payment) => payment.invoice_number || payment.provider_order_id || `INV-${payment.id}`;
  const taxProfileLine = (profile) => [profile?.address_line1, profile?.address_line2, profile?.city, profile?.state, profile?.postal_code, profile?.country].filter(Boolean).join(", ") || "-";
  const invoiceSupplier = (payment) => payment.tax_snapshot?.supplier ?? supplier_tax_profile;
  const invoiceCustomer = (payment) => payment.tax_snapshot?.customer ?? billing_profile;
  const invoiceBaseAmount = (payment) => payment.base_amount ?? Math.max((payment.amount ?? 0) - (payment.tax_amount ?? 0), 0);
  const invoiceTaxableAmount = (payment) => payment.taxable_amount ?? Math.max((payment.amount ?? 0) - (payment.tax_amount ?? 0), 0);
  const taxRateLabel = (payment) => Number(payment.tax_rate ?? 0).toLocaleString("en-IN", { maximumFractionDigits: 2 });
  const splitTaxRateLabel = (payment) => (Number(payment.tax_rate ?? 0) / 2).toLocaleString("en-IN", { maximumFractionDigits: 2 });
  const downloadInvoice = (payment) => {
    window.location.href = route("app.billing.invoices.download", payment.id);
    addToast({ title: "Invoice download started", description: `${invoiceId(payment)}.pdf`, variant: "success" });
  };
  const uploadProof = async (payment, file) => {
    if (!file) return;
    const formData = new FormData();
    formData.append("proof", file);
    setUploadingProof(payment.id);
    try {
      await axios.post(route("app.billing.orders.proof", payment.id), formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });
      addToast({ title: "Payment proof uploaded", description: "Zyptos admin will review and activate the plan.", variant: "success" });
      router.reload({ only: ["payments", "transactions"] });
    } catch (error) {
      addToast({ title: "Upload failed", description: error?.response?.data?.message || error?.message, variant: "error" });
    } finally {
      setUploadingProof(null);
    }
  };
  const printInvoice = () => {
    window.print();
  };
  const overview = /* @__PURE__ */ jsxs(Fragment, { children: [
    subscription?.status === "past_due" && /* @__PURE__ */ jsx(BillingInfoBanner, { variant: "warning", title: "Payment past due", message: subscription.last_error || "Update payment or choose an active plan to keep features available." }),
    subscription?.status === "canceled" && /* @__PURE__ */ jsx(BillingInfoBanner, { variant: "danger", title: "Subscription canceled", message: "Reactivate it or choose a new plan." }),
    subscription?.status === "paused" && /* @__PURE__ */ jsx(BillingInfoBanner, { variant: "warning", title: "Subscription paused", message: "Contact support or choose a plan to reactivate access." }),
    currentPlan && subscription?.status === "active" && /* @__PURE__ */ jsx(
      BillingInfoBanner,
      {
        title: `${currentPlan.name} plan active`,
        message: `${nextBillingDate ? `Renews ${new Date(nextBillingDate).toLocaleDateString("en-IN")}. ` : ""}${(wallet.balance_minor / 100).toLocaleString("en-IN")} ${wallet.currency} wallet balance available.`
      }
    ),
    /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 gap-6 lg:grid-cols-3", children: [
      /* @__PURE__ */ jsxs(Card, { className: "p-5 lg:col-span-2", children: [
        /* @__PURE__ */ jsxs("div", { className: "mb-4 flex items-center justify-between gap-3", children: [
          /* @__PURE__ */ jsx("h3", { className: "font-semibold text-waify-text dark:text-waify-dark-text", children: "Usage this billing period" }),
          /* @__PURE__ */ jsx(Button, { variant: "secondary", size: "sm", onClick: () => setActiveTab("usage"), children: "View detailed usage" })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 gap-3 sm:grid-cols-2", children: [
          usageMeter("Messages Sent", /* @__PURE__ */ jsx(Send, { className: "h-4 w-4" }), usage.messages_sent, currentPlan?.limits.messages_monthly),
          usageMeter("Template Sends", /* @__PURE__ */ jsx(FileText, { className: "h-4 w-4" }), usage.template_sends, currentPlan?.limits.template_sends_monthly),
          usageMeter("WhatsApp connection", /* @__PURE__ */ jsx(Zap, { className: "h-4 w-4" }), current_connections_count, currentPlan?.limits.whatsapp_connections, current_connections_count),
          usageMeter("Agents", /* @__PURE__ */ jsx(Users, { className: "h-4 w-4" }), current_agents_count, currentPlan?.limits.agents, current_agents_count)
        ] })
      ] }),
      /* @__PURE__ */ jsxs(Card, { className: "p-5", children: [
        /* @__PURE__ */ jsx("h3", { className: "mb-3 font-semibold text-waify-text dark:text-waify-dark-text", children: "Current plan" }),
        currentPlan ? /* @__PURE__ */ jsxs("div", { className: "space-y-4", children: [
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("div", { className: "text-2xl font-bold text-waify-text dark:text-waify-dark-text", children: currentPlan.name }),
            /* @__PURE__ */ jsxs("p", { className: "text-sm text-waify-text-muted dark:text-waify-dark-text-muted", children: [
              formatMoney(currentPlan.price_monthly, currentPlan.currency),
              " / month"
            ] }),
            subscription?.provider === "razorpay" && /* @__PURE__ */ jsxs("div", { className: "mt-2 flex flex-wrap gap-2", children: [
              /* @__PURE__ */ jsx(Badge, { variant: "secondary", children: "Razorpay one-time payment" }),
              subscription.provider_status && /* @__PURE__ */ jsx(Badge, { variant: "secondary", children: subscription.provider_status }),
              subscription.provider_ref && /* @__PURE__ */ jsx(Badge, { variant: "secondary", children: subscription.provider_ref })
            ] })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "flex flex-wrap gap-2 border-t border-gray-100 pt-4 dark:border-slate-700", children: [
            /* @__PURE__ */ jsx(Button, { size: "sm", onClick: () => setActiveTab("plans"), children: "Change plan" }),
            isOwner && subscription?.status === "active" && !subscription.cancel_at_period_end && /* @__PURE__ */ jsx(
              Button,
              {
                variant: "secondary",
                size: "sm",
                onClick: async () => {
                  if (await confirm({ title: "Cancel Subscription", message: "Cancel at the end of the current period?", variant: "warning" })) {
                    router.post(route("app.billing.cancel"));
                  }
                },
                children: "Cancel"
              }
            ),
            subscription?.cancel_at_period_end && /* @__PURE__ */ jsx(Badge, { variant: "warning", children: "Cancels at period end" })
          ] })
        ] }) : /* @__PURE__ */ jsxs("div", { className: "space-y-4", children: [
          /* @__PURE__ */ jsx("p", { className: "text-sm text-waify-text-muted dark:text-waify-dark-text-muted", children: "No plan assigned." }),
          /* @__PURE__ */ jsx(Button, { onClick: () => setActiveTab("plans"), children: "Select plan" })
        ] })
      ] })
    ] })
  ] });
  const usageTab = /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 gap-3 md:grid-cols-3", children: [
      usageMeter("Messages", /* @__PURE__ */ jsx(MessageSquare, { className: "h-4 w-4" }), currentUsage.messages_sent, limits.messages_monthly),
      usageMeter("Templates", /* @__PURE__ */ jsx(FileText, { className: "h-4 w-4" }), currentUsage.template_sends, limits.template_sends_monthly),
      usageMeter("AI credits", /* @__PURE__ */ jsx(Zap, { className: "h-4 w-4" }), currentUsage.ai_credits_used, limits.ai_credits_monthly)
    ] }),
    /* @__PURE__ */ jsx(BillingTable, { children: /* @__PURE__ */ jsxs("table", { className: billingTableClass, children: [
      /* @__PURE__ */ jsx("thead", { className: billingTheadClass, children: /* @__PURE__ */ jsxs("tr", { children: [
        /* @__PURE__ */ jsx("th", { className: billingThClass, children: "Period" }),
        /* @__PURE__ */ jsx("th", { className: billingThClass, children: "Messages" }),
        /* @__PURE__ */ jsx("th", { className: billingThClass, children: "Templates" }),
        /* @__PURE__ */ jsx("th", { className: billingThClass, children: "AI Credits" })
      ] }) }),
      /* @__PURE__ */ jsx("tbody", { children: usage_history.length === 0 ? /* @__PURE__ */ jsx("tr", { children: /* @__PURE__ */ jsx("td", { colSpan: 4, className: "px-5 py-12 text-center text-waify-text-muted dark:text-waify-dark-text-muted", children: "No usage history available." }) }) : usage_history.map((period) => /* @__PURE__ */ jsxs("tr", { className: billingTrClass, children: [
        /* @__PURE__ */ jsx("td", { className: `${billingTdClass} font-semibold`, children: period.period }),
        /* @__PURE__ */ jsx("td", { className: billingTdClass, children: period.messages_sent.toLocaleString("en-IN") }),
        /* @__PURE__ */ jsx("td", { className: billingTdClass, children: period.template_sends.toLocaleString("en-IN") }),
        /* @__PURE__ */ jsx("td", { className: billingTdClass, children: period.ai_credits_used.toLocaleString("en-IN") })
      ] }, period.period)) })
    ] }) }),
    blocked_events.length > 0 && /* @__PURE__ */ jsxs(Card, { className: "border-red-200 p-5 dark:border-red-500/30", children: [
      /* @__PURE__ */ jsx("h3", { className: "mb-3 font-semibold text-red-900 dark:text-red-100", children: "Limit blocked events" }),
      /* @__PURE__ */ jsx("div", { className: "space-y-3", children: blocked_events.map((event) => /* @__PURE__ */ jsxs("div", { className: "rounded-card border border-red-200 bg-red-50 p-4 text-sm dark:border-red-500/30 dark:bg-red-500/10", children: [
        /* @__PURE__ */ jsxs("div", { className: "font-semibold text-red-800 dark:text-red-200", children: [
          event.data.limit_key,
          " limit exceeded"
        ] }),
        /* @__PURE__ */ jsxs("p", { className: "mt-1 text-red-700 dark:text-red-300", children: [
          "Usage ",
          event.data.current_usage.toLocaleString("en-IN"),
          " / ",
          event.data.limit.toLocaleString("en-IN"),
          " on ",
          new Date(event.created_at).toLocaleString(),
          "."
        ] })
      ] }, event.id)) })
    ] })
  ] });
  const plansTab = /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsxs("div", { className: "flex flex-wrap items-center justify-between gap-3", children: [
      /* @__PURE__ */ jsx("p", { className: "text-sm text-waify-text-muted dark:text-waify-dark-text-muted", children: "Compare plans and upgrade anytime. Checkout opens a full invoice preview before payment." }),
      /* @__PURE__ */ jsx("div", { className: "flex flex-wrap items-center gap-2", children: /* @__PURE__ */ jsx("div", { className: "inline-flex h-9 rounded-card border border-gray-200 bg-white p-1 dark:border-slate-700 dark:bg-slate-900", children: ["monthly", "yearly"].map((cycle) => /* @__PURE__ */ jsx(
        "button",
        {
          type: "button",
          onClick: () => setBillingCycle(cycle),
          className: `rounded-md px-3 text-xs font-semibold capitalize transition-colors ${billingCycle === cycle ? "bg-waify-green text-waify-ink" : "text-waify-text-muted hover:text-waify-text dark:text-waify-dark-text-muted dark:hover:text-waify-dark-text"}`,
          children: cycle
        },
        cycle
      )) }) })
    ] }),
    !hasPaidCheckout && /* @__PURE__ */ jsx(BillingInfoBanner, { variant: "warning", title: "Checkout disabled", message: "No self-hosted payment method is enabled. Paid plans can still be purchased with wallet credits when the balance covers the invoice total." }),
    /* @__PURE__ */ jsx("div", { className: "grid grid-cols-1 gap-4 md:grid-cols-3", children: plans.map((candidate) => {
      const price = selectedPrice(candidate);
      const canAttemptCreditPurchase = walletMayCoverPlan(candidate);
      return /* @__PURE__ */ jsxs(Card, { className: `relative flex h-full flex-col p-6 ${candidate.is_current ? "ring-2 ring-waify-green" : ""}`, children: [
        candidate.is_current && /* @__PURE__ */ jsx("span", { className: "absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-waify-green px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-waify-ink", children: "Current plan" }),
        /* @__PURE__ */ jsx("h3", { className: "text-lg font-bold text-waify-text dark:text-waify-dark-text", children: candidate.name }),
        candidate.description && /* @__PURE__ */ jsx("p", { className: "mt-1 text-sm text-waify-text-muted dark:text-waify-dark-text-muted", children: candidate.description }),
        /* @__PURE__ */ jsxs("div", { className: "mt-4", children: [
          /* @__PURE__ */ jsx("span", { className: "text-3xl font-bold text-waify-text dark:text-waify-dark-text", children: formatMoney(price, candidate.currency) }),
          price !== null && /* @__PURE__ */ jsxs("span", { className: "text-sm text-waify-text-muted dark:text-waify-dark-text-muted", children: [
            " / ",
            billingCycle === "yearly" ? "year" : "month"
          ] })
        ] }),
        price !== null && price > 0 && canAttemptCreditPurchase && /* @__PURE__ */ jsx(Badge, { variant: "success", className: "mt-3 w-fit", children: "Wallet credits available" }),
        candidate.requires_admin_approval && /* @__PURE__ */ jsx(Badge, { variant: "warning", className: "mt-3 w-fit", children: "Admin approval required" }),
        /* @__PURE__ */ jsxs("div", { className: "mt-4 grid grid-cols-2 gap-2 text-xs text-waify-text-muted dark:text-waify-dark-text-muted", children: [
          /* @__PURE__ */ jsxs("span", { children: [
            /* @__PURE__ */ jsx("strong", { className: "text-waify-text dark:text-waify-dark-text", children: formatLimit(candidate.limits.messages_monthly) }),
            " msgs"
          ] }),
          /* @__PURE__ */ jsxs("span", { children: [
            /* @__PURE__ */ jsx("strong", { className: "text-waify-text dark:text-waify-dark-text", children: formatLimit(candidate.limits.agents) }),
            " agents"
          ] })
        ] }),
        candidate.warnings && candidate.warnings.length > 0 && /* @__PURE__ */ jsx("div", { className: "mt-4 rounded-card border border-amber-200 bg-amber-50 p-3 text-xs text-amber-800 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-200", children: candidate.warnings.map((warning) => /* @__PURE__ */ jsx("p", { children: warning }, warning)) }),
        /* @__PURE__ */ jsx("ul", { className: "mt-5 flex-1 space-y-2", children: ((candidate.features?.length ? candidate.features : candidate.modules) ?? []).slice(0, 8).map((feature) => /* @__PURE__ */ jsxs("li", { className: "flex items-start gap-2 text-sm text-waify-text dark:text-waify-dark-text", children: [
          /* @__PURE__ */ jsx(Check, { className: "mt-0.5 h-4 w-4 shrink-0 text-waify-green" }),
          feature.replace("automation.", "").replace(/\./g, " ")
        ] }, feature)) }),
        /* @__PURE__ */ jsx(
          Button,
          {
            variant: candidate.is_current && !candidate.can_renew ? "secondary" : "primary",
            className: "mt-6 w-full",
            disabled: candidate.is_current && !candidate.can_renew || candidate.requires_admin_approval || switchingPlan === candidate.key || price === null || price > 0 && !hasPaidCheckout && !canAttemptCreditPurchase || billingCycle === "yearly" && !candidate.price_yearly,
            onClick: () => handleSwitchPlan(candidate),
            children: switchingPlan === candidate.key ? "Processing..." : candidate.is_current && !candidate.can_renew ? "Current plan" : candidate.requires_admin_approval ? "Contact admin" : candidate.can_renew ? "Renew plan" : price === null ? "Contact sales" : "Choose plan"
          }
        )
      ] }, candidate.key);
    }) })
  ] });
  const invoicesTab = /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 gap-6 xl:grid-cols-3", children: [
    /* @__PURE__ */ jsx("div", { className: "min-w-0 xl:col-span-2", children: /* @__PURE__ */ jsx(BillingTable, { children: /* @__PURE__ */ jsxs("table", { className: `${billingTableClass} min-w-[840px]`, children: [
      /* @__PURE__ */ jsx("thead", { className: billingTheadClass, children: /* @__PURE__ */ jsxs("tr", { children: [
        /* @__PURE__ */ jsx("th", { className: billingThClass, children: "Plan" }),
        /* @__PURE__ */ jsx("th", { className: billingThClass, children: "Amount" }),
        /* @__PURE__ */ jsx("th", { className: billingThClass, children: "Status" }),
        /* @__PURE__ */ jsx("th", { className: billingThClass, children: "Provider" }),
        /* @__PURE__ */ jsx("th", { className: billingThClass, children: "Order ID" }),
        /* @__PURE__ */ jsx("th", { className: billingThClass, children: "Paid At" }),
        /* @__PURE__ */ jsx("th", { className: `${billingThClass} text-right`, children: "Actions" })
      ] }) }),
      /* @__PURE__ */ jsx("tbody", { children: payments.length === 0 ? /* @__PURE__ */ jsx("tr", { children: /* @__PURE__ */ jsx("td", { colSpan: 7, className: "px-5 py-12 text-center text-sm text-waify-text-muted dark:text-waify-dark-text-muted", children: "No payments recorded yet." }) }) : payments.map((payment) => /* @__PURE__ */ jsxs("tr", { className: billingTrClass, children: [
        /* @__PURE__ */ jsx("td", { className: `${billingTdClass} font-medium`, children: payment.plan?.name ?? "Unknown" }),
        /* @__PURE__ */ jsx("td", { className: `${billingTdClass} font-semibold tabular-nums`, children: formatMoney(payment.amount, payment.currency) }),
        /* @__PURE__ */ jsx("td", { className: billingTdClass, children: /* @__PURE__ */ jsx(Badge, { variant: payment.status === "paid" ? "success" : ["failed", "void", "voided"].includes(payment.status) ? "danger" : "default", children: payment.status }) }),
        /* @__PURE__ */ jsx("td", { className: billingTdClass, children: payment.metadata?.payment_method_label || payment.payment_method || payment.provider }),
        /* @__PURE__ */ jsx("td", { className: "px-5 py-3.5 font-mono text-xs text-waify-text-muted dark:text-waify-dark-text-muted", children: payment.provider_order_id }),
        /* @__PURE__ */ jsx("td", { className: billingTdClass, children: payment.paid_at ? new Date(payment.paid_at).toLocaleString() : "-" }),
        /* @__PURE__ */ jsx("td", { className: "px-5 py-3.5", children: /* @__PURE__ */ jsxs("div", { className: "flex flex-wrap justify-end gap-1", children: [
          /* @__PURE__ */ jsxs(Button, { variant: "ghost", size: "sm", onClick: () => setPreviewInvoice(payment), children: [
            /* @__PURE__ */ jsx(Eye, { className: "h-4 w-4" }),
            "Preview"
          ] }),
          /* @__PURE__ */ jsxs(Button, { variant: "ghost", size: "sm", onClick: () => downloadInvoice(payment), children: [
            /* @__PURE__ */ jsx(Download, { className: "h-4 w-4" }),
            "Download"
          ] }),
          !["paid", "void", "voided", "cancelled", "canceled"].includes(payment.status) && payment.payment_method !== "razorpay" && /* @__PURE__ */ jsxs("label", { className: "inline-flex h-8 cursor-pointer items-center gap-1 rounded-btn px-2 text-sm font-medium text-waify-text-muted transition hover:bg-gray-100 hover:text-waify-text dark:text-waify-dark-text-muted dark:hover:bg-slate-800 dark:hover:text-waify-dark-text", children: [
            /* @__PURE__ */ jsx(Upload, { className: "h-4 w-4" }),
            uploadingProof === payment.id ? "Uploading..." : payment.has_proof ? "Replace proof" : "Upload proof",
            /* @__PURE__ */ jsx(
              "input",
              {
                type: "file",
                accept: "image/*,.pdf",
                className: "hidden",
                disabled: uploadingProof === payment.id,
                onChange: (event) => uploadProof(payment, event.target.files?.[0] ?? null)
              }
            )
          ] })
        ] }) })
      ] }, payment.id)) })
    ] }) }) }),
    /* @__PURE__ */ jsxs(Card, { className: "h-fit p-5", children: [
      /* @__PURE__ */ jsx("h3", { className: "mb-3 font-semibold text-waify-text dark:text-waify-dark-text", children: "Billing profile" }),
      /* @__PURE__ */ jsxs("dl", { className: "space-y-3 text-sm", children: [
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("dt", { className: "text-xs text-waify-text-muted dark:text-waify-dark-text-muted", children: "Billing name" }),
          /* @__PURE__ */ jsx("dd", { className: "mt-0.5 font-medium text-waify-text dark:text-waify-dark-text", children: billing_profile?.legal_name || account.name || account.slug })
        ] }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("dt", { className: "text-xs text-waify-text-muted dark:text-waify-dark-text-muted", children: "Billing email" }),
          /* @__PURE__ */ jsx("dd", { className: "mt-0.5 text-waify-text dark:text-waify-dark-text", children: billing_profile?.email || account.owner?.email || "-" })
        ] }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("dt", { className: "text-xs text-waify-text-muted dark:text-waify-dark-text-muted", children: "GSTIN" }),
          /* @__PURE__ */ jsx("dd", { className: "mt-0.5 font-mono text-waify-text dark:text-waify-dark-text", children: billing_profile?.gstin || "-" })
        ] }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("dt", { className: "text-xs text-waify-text-muted dark:text-waify-dark-text-muted", children: "Place of supply" }),
          /* @__PURE__ */ jsx("dd", { className: "mt-0.5 text-waify-text dark:text-waify-dark-text", children: [billing_profile?.state_code, billing_profile?.state].filter(Boolean).join(" - ") || "-" })
        ] }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("dt", { className: "text-xs text-waify-text-muted dark:text-waify-dark-text-muted", children: "Address" }),
          /* @__PURE__ */ jsx("dd", { className: "mt-0.5 text-waify-text dark:text-waify-dark-text", children: taxProfileLine(billing_profile) })
        ] }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("dt", { className: "text-xs text-waify-text-muted dark:text-waify-dark-text-muted", children: "Currency" }),
          /* @__PURE__ */ jsx("dd", { className: "mt-0.5 font-mono text-waify-text dark:text-waify-dark-text", children: wallet.currency })
        ] })
      ] })
    ] })
  ] });
  const paymentTab = /* @__PURE__ */ jsxs("div", { className: "space-y-4 overflow-hidden", children: [
    /* @__PURE__ */ jsxs("div", { className: "grid gap-4 md:grid-cols-3", children: [
      /* @__PURE__ */ jsxs(Card, { className: "flex items-center gap-3 p-4", children: [
        /* @__PURE__ */ jsx(WalletCards, { className: "h-9 w-9 rounded-lg bg-waify-green/10 p-2 text-waify-green" }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("div", { className: "text-xs text-waify-text-muted", children: "Wallet balance" }),
          /* @__PURE__ */ jsx("div", { className: "text-lg font-bold", children: formatMoney(wallet.balance_minor, wallet.currency) })
        ] })
      ] }),
      /* @__PURE__ */ jsxs(Card, { className: "flex items-center gap-3 p-4", children: [
        /* @__PURE__ */ jsx(CheckCircle, { className: "h-9 w-9 rounded-lg bg-blue-50 p-2 text-blue-600" }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("div", { className: "text-xs text-waify-text-muted", children: "Successful" }),
          /* @__PURE__ */ jsx("div", { className: "text-lg font-bold", children: transactions.filter((tx) => ["success", "paid"].includes(tx.status)).length })
        ] })
      ] }),
      /* @__PURE__ */ jsxs(Card, { className: "flex items-center gap-3 p-4", children: [
        /* @__PURE__ */ jsx(XCircle, { className: "h-9 w-9 rounded-lg bg-red-50 p-2 text-red-600" }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("div", { className: "text-xs text-waify-text-muted", children: "Failed" }),
          /* @__PURE__ */ jsx("div", { className: "text-lg font-bold", children: transactions.filter((tx) => tx.status === "failed").length })
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsx("div", { className: "flex justify-end", children: /* @__PURE__ */ jsxs(Button, { onClick: () => setShowTopupDialog(true), children: [
      /* @__PURE__ */ jsx(Plus, { className: "h-4 w-4" }),
      "Add credits"
    ] }) }),
    /* @__PURE__ */ jsx(BillingTable, { children: /* @__PURE__ */ jsxs("table", { className: `${billingTableClass} min-w-[860px]`, children: [
      /* @__PURE__ */ jsx("thead", { className: billingTheadClass, children: /* @__PURE__ */ jsxs("tr", { children: [
        /* @__PURE__ */ jsx("th", { className: billingThClass, children: "Type" }),
        /* @__PURE__ */ jsx("th", { className: billingThClass, children: "Direction" }),
        /* @__PURE__ */ jsx("th", { className: billingThClass, children: "Amount" }),
        /* @__PURE__ */ jsx("th", { className: billingThClass, children: "Status" }),
        /* @__PURE__ */ jsx("th", { className: billingThClass, children: "Reference" }),
        /* @__PURE__ */ jsx("th", { className: billingThClass, children: "Date" })
      ] }) }),
      /* @__PURE__ */ jsx("tbody", { children: transactions.length === 0 ? /* @__PURE__ */ jsx("tr", { children: /* @__PURE__ */ jsx("td", { colSpan: 6, className: "px-5 py-12 text-center text-waify-text-muted dark:text-waify-dark-text-muted", children: "No transactions found." }) }) : transactions.map((tx, index) => /* @__PURE__ */ jsxs("tr", { className: billingTrClass, children: [
        /* @__PURE__ */ jsx("td", { className: `${billingTdClass} capitalize`, children: tx.type }),
        /* @__PURE__ */ jsx("td", { className: `${billingTdClass} capitalize`, children: tx.direction }),
        /* @__PURE__ */ jsx("td", { className: `${billingTdClass} font-semibold tabular-nums`, children: formatMoney(tx.amount_minor, tx.currency) }),
        /* @__PURE__ */ jsx("td", { className: billingTdClass, children: /* @__PURE__ */ jsx(Badge, { variant: tx.status === "failed" ? "danger" : tx.status === "success" || tx.status === "paid" ? "success" : "default", children: tx.status }) }),
        /* @__PURE__ */ jsx("td", { className: "px-5 py-3.5 font-mono text-xs text-waify-text-muted dark:text-waify-dark-text-muted", children: tx.reference || "-" }),
        /* @__PURE__ */ jsx("td", { className: billingTdClass, children: new Date(tx.created_at).toLocaleString() })
      ] }, `${tx.type}-${tx.id}-${index}`)) })
    ] }) })
  ] });
  const tabContent = {
    overview,
    usage: usageTab,
    plans: plansTab,
    invoices: invoicesTab,
    payment: paymentTab
  }[activeTab];
  return /* @__PURE__ */ jsxs(AppShell, { children: [
    /* @__PURE__ */ jsx(Head, { title: "Billing" }),
    /* @__PURE__ */ jsxs("div", { className: "mx-auto max-w-[1400px] space-y-6 p-4 sm:p-6", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex flex-wrap items-end justify-between gap-3", children: [
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("h1", { className: "text-xl font-bold tracking-tight text-waify-text dark:text-waify-dark-text", children: "Billing" }),
          /* @__PURE__ */ jsx("p", { className: "mt-1 text-sm text-waify-text-muted dark:text-waify-dark-text-muted", children: "Plan, usage, invoices and payment methods." })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex flex-wrap gap-2", children: [
          /* @__PURE__ */ jsxs(Button, { variant: "secondary", onClick: () => setShowTopupDialog(true), children: [
            /* @__PURE__ */ jsx(Zap, { className: "h-4 w-4" }),
            " Buy credits"
          ] }),
          /* @__PURE__ */ jsxs(Button, { variant: "secondary", onClick: () => setActiveTab("plans"), children: [
            /* @__PURE__ */ jsx(ExternalLink, { className: "h-4 w-4" }),
            " Billing portal"
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsx("div", { className: "grid grid-cols-2 gap-3 lg:grid-cols-4", children: [
        { label: "Current plan", value: currentPlan?.name ?? "No plan", sub: currentPlan ? `${formatMoney(currentPlan.price_monthly, currentPlan.currency)}/mo` : "Choose a plan", icon: CreditCard },
        { label: "Wallet balance", value: formatMoney(wallet.balance_minor, wallet.currency), sub: "available credits", icon: WalletCards },
        { label: "Period end", value: nextBillingDate ? new Date(nextBillingDate).toLocaleDateString("en-IN", { day: "2-digit", month: "short" }) : "Not set", sub: subscription?.status === "paused" ? "Paused" : subscription?.cancel_at_period_end ? "Cancels at period end" : "Active", icon: Calendar },
        { label: "Payments", value: payments.length.toLocaleString("en-IN"), sub: "recorded invoices", icon: Receipt }
      ].map((item) => {
        const Icon = item.icon;
        return /* @__PURE__ */ jsxs(Card, { className: "flex items-center gap-3 p-4", children: [
          /* @__PURE__ */ jsx("span", { className: "flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-waify-green/10 text-waify-green", children: /* @__PURE__ */ jsx(Icon, { className: "h-5 w-5" }) }),
          /* @__PURE__ */ jsxs("div", { className: "min-w-0", children: [
            /* @__PURE__ */ jsx("div", { className: "text-xs text-waify-text-muted dark:text-waify-dark-text-muted", children: item.label }),
            /* @__PURE__ */ jsx("div", { className: "truncate text-lg font-bold text-waify-text dark:text-waify-dark-text", children: item.value }),
            /* @__PURE__ */ jsx("div", { className: "text-[11px] text-waify-text-muted dark:text-waify-dark-text-muted", children: item.sub })
          ] })
        ] }, item.label);
      }) }),
      /* @__PURE__ */ jsx(BillingSurface, { active: activeTab, onTabChange: (tab) => setActiveTab(tab), children: tabContent })
    ] }),
    checkoutPlan && /* @__PURE__ */ jsxs("div", { className: "fixed inset-0 z-[210] flex items-center justify-center p-4", children: [
      /* @__PURE__ */ jsx("button", { type: "button", className: "absolute inset-0 bg-waify-ink/50 backdrop-blur-sm dark:bg-black/70", onClick: closeCheckout, "aria-label": "Close checkout" }),
      /* @__PURE__ */ jsxs("section", { className: "relative flex max-h-[92vh] w-full max-w-2xl flex-col overflow-hidden rounded-card border border-gray-100 bg-white shadow-pop dark:border-slate-700 dark:bg-slate-900", children: [
        /* @__PURE__ */ jsxs("div", { className: "flex shrink-0 items-start justify-between gap-4 border-b border-gray-100 px-6 py-5 dark:border-slate-700", children: [
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("h2", { className: "text-lg font-semibold text-waify-text dark:text-waify-dark-text", children: checkoutPlan.can_renew ? "Renew plan" : "Checkout" }),
            /* @__PURE__ */ jsxs("p", { className: "mt-1 text-sm text-waify-text-muted dark:text-waify-dark-text-muted", children: [
              checkoutPlan.name,
              " invoice preview and payment method."
            ] })
          ] }),
          /* @__PURE__ */ jsx(Button, { variant: "ghost", size: "sm", onClick: closeCheckout, "aria-label": "Close", children: /* @__PURE__ */ jsx(X, { className: "h-4 w-4" }) })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "min-h-0 flex-1 space-y-5 overflow-y-auto px-6 py-5", children: [
          /* @__PURE__ */ jsxs("div", { className: "grid gap-3 sm:grid-cols-3", children: [
            /* @__PURE__ */ jsxs("div", { className: "sm:col-span-2 rounded-card border border-gray-100 bg-gray-50 p-4 dark:border-slate-700 dark:bg-slate-800/60", children: [
              /* @__PURE__ */ jsx("div", { className: "text-xs font-semibold uppercase tracking-wider text-waify-text-muted dark:text-waify-dark-text-muted", children: "Selected plan" }),
              /* @__PURE__ */ jsx("div", { className: "mt-1 text-xl font-bold text-waify-text dark:text-waify-dark-text", children: checkoutPlan.name }),
              /* @__PURE__ */ jsx("p", { className: "mt-1 text-sm text-waify-text-muted dark:text-waify-dark-text-muted", children: checkoutPlan.description || "Zyptos workspace subscription" })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "rounded-card border border-gray-100 bg-gray-50 p-4 dark:border-slate-700 dark:bg-slate-800/60", children: [
              /* @__PURE__ */ jsx("div", { className: "text-xs font-semibold uppercase tracking-wider text-waify-text-muted dark:text-waify-dark-text-muted", children: "Cycle" }),
              /* @__PURE__ */ jsx("div", { className: "mt-3 inline-flex h-9 rounded-card border border-gray-200 bg-white p-1 dark:border-slate-700 dark:bg-slate-900", children: ["monthly", "yearly"].map((cycle) => /* @__PURE__ */ jsx(
                "button",
                {
                  type: "button",
                  disabled: cycle === "yearly" && !checkoutPlan.price_yearly,
                  onClick: () => setBillingCycle(cycle),
                  className: `rounded-md px-2 text-xs font-semibold capitalize transition-colors disabled:opacity-40 ${billingCycle === cycle ? "bg-waify-green text-waify-ink" : "text-waify-text-muted hover:text-waify-text dark:text-waify-dark-text-muted dark:hover:text-waify-dark-text"}`,
                  children: cycle
                },
                cycle
              )) })
            ] })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "grid gap-3 sm:grid-cols-[1fr_auto]", children: [
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx("label", { className: "text-xs font-medium text-waify-text-muted dark:text-waify-dark-text-muted", children: "Promo code" }),
              /* @__PURE__ */ jsx(
                "input",
                {
                  value: promoCode,
                  onChange: (event) => setPromoCode(event.target.value.toUpperCase()),
                  placeholder: "Enter promo code",
                  className: "mt-1 h-10 w-full rounded-btn border border-gray-200 bg-white px-3 text-sm font-semibold uppercase text-waify-text outline-none placeholder:normal-case placeholder:font-normal placeholder:text-gray-400 focus:border-waify-green focus:ring-2 focus:ring-waify-green/15 dark:border-slate-700 dark:bg-slate-950 dark:text-waify-dark-text"
                }
              )
            ] }),
            checkoutPreview?.discount ? /* @__PURE__ */ jsx("div", { className: "flex items-end", children: /* @__PURE__ */ jsxs(Badge, { variant: "success", className: "h-10 px-3", children: [
              checkoutPreview.discount.code,
              ": save ",
              formatMoney(checkoutPreview.discount_amount, checkoutPreview.currency)
            ] }) }) : promoCode.trim() && !checkoutLoading ? /* @__PURE__ */ jsx("div", { className: "flex items-end", children: /* @__PURE__ */ jsx(Badge, { variant: "danger", className: "h-10 px-3", children: "Not applicable" }) }) : null
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "rounded-card border border-gray-100 p-4 dark:border-slate-700", children: [
            /* @__PURE__ */ jsxs("div", { className: "mb-3 flex items-center justify-between", children: [
              /* @__PURE__ */ jsx("h3", { className: "text-sm font-semibold text-waify-text dark:text-waify-dark-text", children: "Invoice total" }),
              checkoutLoading && /* @__PURE__ */ jsx("span", { className: "text-xs text-waify-text-muted dark:text-waify-dark-text-muted", children: "Updating..." })
            ] }),
            checkoutError && /* @__PURE__ */ jsx(BillingInfoBanner, { variant: "danger", title: "Preview failed", message: checkoutError }),
            checkoutPreview && /* @__PURE__ */ jsxs("div", { className: "space-y-2 text-sm", children: [
              /* @__PURE__ */ jsxs("div", { className: "flex justify-between", children: [
                /* @__PURE__ */ jsx("span", { children: "Base amount" }),
                /* @__PURE__ */ jsx("span", { className: "tabular-nums", children: formatMoney(checkoutPreview.base_amount, checkoutPreview.currency, 2) })
              ] }),
              checkoutPreview.discount_amount > 0 && /* @__PURE__ */ jsxs("div", { className: "flex justify-between text-emerald-700 dark:text-emerald-300", children: [
                /* @__PURE__ */ jsxs("span", { children: [
                  "Discount ",
                  checkoutPreview.discount?.code ? `(${checkoutPreview.discount.code})` : ""
                ] }),
                /* @__PURE__ */ jsxs("span", { className: "tabular-nums", children: [
                  "-",
                  formatMoney(checkoutPreview.discount_amount, checkoutPreview.currency, 2)
                ] })
              ] }),
              /* @__PURE__ */ jsxs("div", { className: "flex justify-between", children: [
                /* @__PURE__ */ jsx("span", { children: "Taxable value" }),
                /* @__PURE__ */ jsx("span", { className: "tabular-nums", children: formatMoney(checkoutPreview.taxable_amount, checkoutPreview.currency, 2) })
              ] }),
              checkoutPreview.cgst_amount > 0 && /* @__PURE__ */ jsxs("div", { className: "flex justify-between", children: [
                /* @__PURE__ */ jsx("span", { children: "CGST" }),
                /* @__PURE__ */ jsx("span", { className: "tabular-nums", children: formatMoney(checkoutPreview.cgst_amount, checkoutPreview.currency, 2) })
              ] }),
              checkoutPreview.sgst_amount > 0 && /* @__PURE__ */ jsxs("div", { className: "flex justify-between", children: [
                /* @__PURE__ */ jsx("span", { children: "SGST" }),
                /* @__PURE__ */ jsx("span", { className: "tabular-nums", children: formatMoney(checkoutPreview.sgst_amount, checkoutPreview.currency, 2) })
              ] }),
              checkoutPreview.igst_amount > 0 && /* @__PURE__ */ jsxs("div", { className: "flex justify-between", children: [
                /* @__PURE__ */ jsx("span", { children: "IGST" }),
                /* @__PURE__ */ jsx("span", { className: "tabular-nums", children: formatMoney(checkoutPreview.igst_amount, checkoutPreview.currency, 2) })
              ] }),
              /* @__PURE__ */ jsxs("div", { className: "flex justify-between border-t border-gray-100 pt-3 text-base font-bold dark:border-slate-700", children: [
                /* @__PURE__ */ jsx("span", { children: "Total due" }),
                /* @__PURE__ */ jsx("span", { className: "tabular-nums", children: formatMoney(checkoutPreview.amount_due, checkoutPreview.currency, 2) })
              ] })
            ] })
          ] }),
          checkoutPreview && wallet.currency === checkoutPreview.currency && wallet.balance_minor >= checkoutPreview.amount_due && /* @__PURE__ */ jsx("div", { className: "rounded-card border border-emerald-200 bg-emerald-50 p-4 dark:border-emerald-500/30 dark:bg-emerald-500/10", children: /* @__PURE__ */ jsxs("div", { className: "flex flex-wrap items-center justify-between gap-3", children: [
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx("div", { className: "text-sm font-semibold text-emerald-900 dark:text-emerald-100", children: "Wallet credits can cover this invoice" }),
              /* @__PURE__ */ jsxs("p", { className: "mt-0.5 text-xs text-emerald-700 dark:text-emerald-200", children: [
                "Balance: ",
                formatMoney(wallet.balance_minor, wallet.currency, 2)
              ] })
            ] }),
            /* @__PURE__ */ jsx(Button, { type: "button", variant: "secondary", onClick: purchaseWithCredits, disabled: switchingPlan === checkoutPlan.key, children: "Use credits" })
          ] }) }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("h3", { className: "mb-3 text-sm font-semibold text-waify-text dark:text-waify-dark-text", children: "Payment method" }),
            enabledPaymentMethods.length === 0 ? /* @__PURE__ */ jsx(BillingInfoBanner, { variant: "warning", title: "No payment method enabled", message: "Ask platform admin to enable Bank Transfer / UPI or Razorpay payments." }) : /* @__PURE__ */ jsx("div", { className: "grid gap-2 sm:grid-cols-2", children: enabledPaymentMethods.map((method) => {
              const active = effectivePaymentMethod === method.key;
              return /* @__PURE__ */ jsxs(
                "button",
                {
                  type: "button",
                  onClick: () => setPaymentMethod(method.key),
                  className: `rounded-card border p-4 text-left transition ${active ? "border-waify-green bg-waify-green/10 ring-2 ring-waify-green/20 dark:border-emerald-400" : "border-gray-200 bg-white hover:border-waify-green/40 dark:border-slate-700 dark:bg-slate-950"}`,
                  children: [
                    /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between gap-2", children: [
                      /* @__PURE__ */ jsx("span", { className: "font-semibold text-waify-text dark:text-waify-dark-text", children: method.label }),
                      active && /* @__PURE__ */ jsx(CheckCircle, { className: "h-4 w-4 text-waify-green" })
                    ] }),
                    /* @__PURE__ */ jsx("p", { className: "mt-1 text-xs text-waify-text-muted dark:text-waify-dark-text-muted", children: method.key === "razorpay" ? "Pay instantly by card, UPI, or netbanking." : "Create invoice with Bank/UPI instructions and upload payment proof." })
                  ]
                },
                method.key
              );
            }) })
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex shrink-0 flex-wrap justify-end gap-2 border-t border-gray-100 bg-gray-50/70 px-6 py-4 dark:border-slate-700 dark:bg-slate-800/60", children: [
          /* @__PURE__ */ jsx(Button, { type: "button", variant: "secondary", onClick: closeCheckout, disabled: Boolean(switchingPlan), children: "Cancel" }),
          /* @__PURE__ */ jsx(Button, { type: "button", onClick: submitCheckout, disabled: !checkoutPreview || checkoutLoading || !hasPaidCheckout || switchingPlan === checkoutPlan.key, children: switchingPlan === checkoutPlan.key ? "Processing..." : effectivePaymentMethod === "razorpay" ? "Pay now" : "Create invoice" })
        ] })
      ] })
    ] }),
    showTopupDialog && /* @__PURE__ */ jsxs("div", { className: "fixed inset-0 z-[200] flex items-center justify-center p-4", children: [
      /* @__PURE__ */ jsx("button", { type: "button", className: "absolute inset-0 bg-waify-ink/50 backdrop-blur-sm dark:bg-black/70", onClick: () => setShowTopupDialog(false), "aria-label": "Close top-up dialog" }),
      /* @__PURE__ */ jsxs("section", { className: "relative flex max-h-[90vh] w-full max-w-md flex-col overflow-hidden rounded-card border border-gray-100 bg-white shadow-pop dark:border-slate-700 dark:bg-slate-900", children: [
        /* @__PURE__ */ jsxs("div", { className: "flex shrink-0 items-start justify-between gap-4 border-b border-gray-100 px-5 py-4 dark:border-slate-700", children: [
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("h2", { className: "text-base font-semibold text-waify-text dark:text-waify-dark-text", children: "Add wallet credits" }),
            /* @__PURE__ */ jsx("p", { className: "mt-1 text-sm text-waify-text-muted dark:text-waify-dark-text-muted", children: "Credits are added after Razorpay payment confirmation." })
          ] }),
          /* @__PURE__ */ jsx(Button, { variant: "ghost", size: "sm", onClick: () => setShowTopupDialog(false), "aria-label": "Close", children: /* @__PURE__ */ jsx(X, { className: "h-4 w-4" }) })
        ] }),
        /* @__PURE__ */ jsxs("form", { className: "flex min-h-0 flex-1 flex-col", onSubmit: submitTopup, children: [
          /* @__PURE__ */ jsxs("div", { className: "min-h-0 flex-1 space-y-4 overflow-y-auto px-5 py-4", children: [
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsxs("label", { className: "text-xs text-waify-text-muted dark:text-waify-dark-text-muted", children: [
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
                  onChange: (event) => setTopupAmountMajor(event.target.value),
                  className: "mt-1 h-10 w-full rounded-btn border border-gray-200 bg-white px-3 text-sm text-waify-text outline-none focus:border-waify-green focus:ring-2 focus:ring-waify-green/15 dark:border-slate-700 dark:bg-slate-950 dark:text-waify-dark-text",
                  autoFocus: true
                }
              )
            ] }),
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx("label", { className: "text-xs text-waify-text-muted dark:text-waify-dark-text-muted", children: "Notes" }),
              /* @__PURE__ */ jsx(
                "input",
                {
                  type: "text",
                  value: topupNotes,
                  onChange: (event) => setTopupNotes(event.target.value),
                  placeholder: "Optional",
                  className: "mt-1 h-10 w-full rounded-btn border border-gray-200 bg-white px-3 text-sm text-waify-text outline-none focus:border-waify-green focus:ring-2 focus:ring-waify-green/15 dark:border-slate-700 dark:bg-slate-950 dark:text-waify-dark-text"
                }
              )
            ] })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "flex shrink-0 justify-end gap-2 border-t border-gray-100 bg-gray-50/70 px-5 py-4 dark:border-slate-700 dark:bg-slate-800/60", children: [
            /* @__PURE__ */ jsx(Button, { type: "button", variant: "secondary", onClick: () => setShowTopupDialog(false), children: "Cancel" }),
            /* @__PURE__ */ jsxs(Button, { type: "submit", children: [
              /* @__PURE__ */ jsx(Plus, { className: "h-4 w-4" }),
              " Add credits"
            ] })
          ] })
        ] })
      ] })
    ] }),
    previewInvoice && /* @__PURE__ */ jsxs("div", { className: "fixed inset-0 z-[200] flex items-center justify-center p-4", children: [
      /* @__PURE__ */ jsx("button", { type: "button", className: "absolute inset-0 bg-waify-ink/50 backdrop-blur-sm dark:bg-black/70", onClick: () => setPreviewInvoice(null), "aria-label": "Close invoice preview" }),
      /* @__PURE__ */ jsxs("section", { className: "relative flex max-h-[90vh] w-full max-w-3xl flex-col overflow-hidden rounded-card border border-gray-100 bg-white shadow-pop dark:border-slate-700 dark:bg-slate-900", children: [
        /* @__PURE__ */ jsxs("div", { className: "flex shrink-0 items-center justify-between gap-4 border-b border-gray-100 px-6 py-4 dark:border-slate-700", children: [
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsxs("h2", { className: "text-lg font-semibold text-waify-text dark:text-waify-dark-text", children: [
              "Invoice ",
              invoiceId(previewInvoice)
            ] }),
            /* @__PURE__ */ jsxs("p", { className: "mt-0.5 text-xs text-waify-text-muted dark:text-waify-dark-text-muted", children: [
              previewInvoice.plan?.name || "Subscription",
              " · ",
              new Date(previewInvoice.created_at).toLocaleDateString("en-IN")
            ] })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
            /* @__PURE__ */ jsxs(Button, { variant: "secondary", size: "sm", onClick: printInvoice, children: [
              /* @__PURE__ */ jsx(Printer, { className: "h-4 w-4" }),
              " Print"
            ] }),
            /* @__PURE__ */ jsxs(Button, { variant: "secondary", size: "sm", onClick: () => downloadInvoice(previewInvoice), children: [
              /* @__PURE__ */ jsx(Download, { className: "h-4 w-4" }),
              " Download"
            ] }),
            /* @__PURE__ */ jsx(Button, { variant: "ghost", size: "sm", onClick: () => setPreviewInvoice(null), "aria-label": "Close", children: /* @__PURE__ */ jsx(X, { className: "h-4 w-4" }) })
          ] })
        ] }),
        /* @__PURE__ */ jsx("div", { className: "min-h-0 flex-1 overflow-y-auto p-6", children: /* @__PURE__ */ jsxs("div", { className: "rounded-card border border-gray-200 bg-white p-8 text-waify-text shadow-sm dark:border-slate-600 dark:bg-slate-800 dark:text-waify-dark-text", children: [
          /* @__PURE__ */ jsxs("div", { className: "flex items-start justify-between gap-6 border-b border-gray-200 pb-6 dark:border-slate-600", children: [
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx("div", { className: "mb-4 flex items-center gap-2", children: branding?.logo_url ? /* @__PURE__ */ jsx("img", { src: branding.logo_url, alt: checkoutBrandName, className: "max-h-10 w-auto" }) : /* @__PURE__ */ jsxs(Fragment, { children: [
                /* @__PURE__ */ jsx("div", { className: "flex h-10 w-10 items-center justify-center rounded-lg bg-waify-green text-waify-ink", children: /* @__PURE__ */ jsx(MessageSquare, { className: "h-5 w-5" }) }),
                /* @__PURE__ */ jsx("span", { className: "text-xl font-bold", children: checkoutBrandName })
              ] }) }),
              /* @__PURE__ */ jsx("div", { className: "text-sm font-semibold", children: invoiceSupplier(previewInvoice)?.legal_name || "Zyptos" }),
              /* @__PURE__ */ jsx("div", { className: "mt-1 max-w-sm text-xs leading-5 text-waify-text-muted dark:text-waify-dark-text-muted", children: taxProfileLine(invoiceSupplier(previewInvoice)) }),
              /* @__PURE__ */ jsxs("div", { className: "mt-1 text-xs text-waify-text-muted dark:text-waify-dark-text-muted", children: [
                "GSTIN: ",
                /* @__PURE__ */ jsx("span", { className: "font-mono", children: invoiceSupplier(previewInvoice)?.gstin || "-" })
              ] })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "text-right", children: [
              /* @__PURE__ */ jsx("div", { className: "text-2xl font-bold", children: "TAX INVOICE" }),
              /* @__PURE__ */ jsx("div", { className: "mt-1 font-mono text-sm text-waify-text-muted dark:text-waify-dark-text-muted", children: invoiceId(previewInvoice) }),
              /* @__PURE__ */ jsx(Badge, { variant: previewInvoice.status === "paid" ? "success" : previewInvoice.status === "failed" ? "danger" : "warning", className: "mt-3", children: previewInvoice.status })
            ] })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "grid gap-4 border-b border-gray-200 py-6 text-sm dark:border-slate-600 sm:grid-cols-2", children: [
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx("div", { className: "text-xs font-semibold uppercase tracking-wider text-waify-text-muted dark:text-waify-dark-text-muted", children: "Bill to" }),
              /* @__PURE__ */ jsx("div", { className: "mt-1 font-semibold", children: invoiceCustomer(previewInvoice)?.legal_name || account.name || account.slug }),
              /* @__PURE__ */ jsx("div", { className: "mt-1 text-xs text-waify-text-muted dark:text-waify-dark-text-muted", children: invoiceCustomer(previewInvoice)?.email || account.owner?.email || "-" }),
              /* @__PURE__ */ jsx("div", { className: "mt-1 text-xs text-waify-text-muted dark:text-waify-dark-text-muted", children: taxProfileLine(invoiceCustomer(previewInvoice)) }),
              /* @__PURE__ */ jsxs("div", { className: "mt-1 text-xs text-waify-text-muted dark:text-waify-dark-text-muted", children: [
                "GSTIN: ",
                /* @__PURE__ */ jsx("span", { className: "font-mono", children: invoiceCustomer(previewInvoice)?.gstin || "-" })
              ] })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "grid gap-3 text-sm sm:grid-cols-2", children: [
              /* @__PURE__ */ jsxs("div", { children: [
                /* @__PURE__ */ jsx("div", { className: "text-xs text-waify-text-muted", children: "Issued" }),
                /* @__PURE__ */ jsx("div", { className: "mt-1 font-medium", children: new Date(previewInvoice.created_at).toLocaleDateString("en-IN") })
              ] }),
              /* @__PURE__ */ jsxs("div", { children: [
                /* @__PURE__ */ jsx("div", { className: "text-xs text-waify-text-muted", children: "Paid" }),
                /* @__PURE__ */ jsx("div", { className: "mt-1 font-medium", children: previewInvoice.paid_at ? new Date(previewInvoice.paid_at).toLocaleDateString("en-IN") : "-" })
              ] }),
              /* @__PURE__ */ jsxs("div", { children: [
                /* @__PURE__ */ jsx("div", { className: "text-xs text-waify-text-muted", children: "Provider" }),
                /* @__PURE__ */ jsx("div", { className: "mt-1 font-medium capitalize", children: previewInvoice.provider })
              ] }),
              /* @__PURE__ */ jsxs("div", { children: [
                /* @__PURE__ */ jsx("div", { className: "text-xs text-waify-text-muted", children: "SAC" }),
                /* @__PURE__ */ jsx("div", { className: "mt-1 font-mono font-medium", children: previewInvoice.tax_snapshot?.sac_code || "-" })
              ] })
            ] })
          ] }),
          /* @__PURE__ */ jsxs("table", { className: "mt-6 w-full text-sm", children: [
            /* @__PURE__ */ jsx("thead", { children: /* @__PURE__ */ jsxs("tr", { className: "border-b-2 border-gray-200 text-left text-xs uppercase tracking-wider text-waify-text-muted dark:border-slate-600", children: [
              /* @__PURE__ */ jsx("th", { className: "py-2 font-semibold", children: "Description" }),
              /* @__PURE__ */ jsx("th", { className: "py-2 text-right font-semibold", children: "Amount" })
            ] }) }),
            /* @__PURE__ */ jsxs("tbody", { children: [
              /* @__PURE__ */ jsxs("tr", { className: "border-b border-gray-100 dark:border-slate-700", children: [
                /* @__PURE__ */ jsxs("td", { className: "py-3", children: [
                  previewInvoice.plan?.name || "Subscription",
                  " plan"
                ] }),
                /* @__PURE__ */ jsx("td", { className: "py-3 text-right tabular-nums", children: formatMoney(invoiceBaseAmount(previewInvoice), previewInvoice.currency, 2) })
              ] }),
              (previewInvoice.discount_amount ?? 0) > 0 && /* @__PURE__ */ jsxs("tr", { className: "border-b border-gray-100 dark:border-slate-700", children: [
                /* @__PURE__ */ jsxs("td", { className: "py-3", children: [
                  "Discount ",
                  previewInvoice.discount_code ? `(${previewInvoice.discount_code})` : ""
                ] }),
                /* @__PURE__ */ jsxs("td", { className: "py-3 text-right tabular-nums", children: [
                  "-",
                  formatMoney(previewInvoice.discount_amount, previewInvoice.currency, 2)
                ] })
              ] }),
              /* @__PURE__ */ jsxs("tr", { className: "border-b border-gray-100 dark:border-slate-700", children: [
                /* @__PURE__ */ jsx("td", { className: "py-3", children: "Taxable value" }),
                /* @__PURE__ */ jsx("td", { className: "py-3 text-right tabular-nums", children: formatMoney(invoiceTaxableAmount(previewInvoice), previewInvoice.currency, 2) })
              ] }),
              (previewInvoice.cgst_amount ?? 0) > 0 && /* @__PURE__ */ jsxs("tr", { className: "border-b border-gray-100 dark:border-slate-700", children: [
                /* @__PURE__ */ jsxs("td", { className: "py-3", children: [
                  "CGST @ ",
                  splitTaxRateLabel(previewInvoice),
                  "%"
                ] }),
                /* @__PURE__ */ jsx("td", { className: "py-3 text-right tabular-nums", children: formatMoney(previewInvoice.cgst_amount, previewInvoice.currency, 2) })
              ] }),
              (previewInvoice.sgst_amount ?? 0) > 0 && /* @__PURE__ */ jsxs("tr", { className: "border-b border-gray-100 dark:border-slate-700", children: [
                /* @__PURE__ */ jsxs("td", { className: "py-3", children: [
                  "SGST @ ",
                  splitTaxRateLabel(previewInvoice),
                  "%"
                ] }),
                /* @__PURE__ */ jsx("td", { className: "py-3 text-right tabular-nums", children: formatMoney(previewInvoice.sgst_amount, previewInvoice.currency, 2) })
              ] }),
              (previewInvoice.igst_amount ?? 0) > 0 && /* @__PURE__ */ jsxs("tr", { className: "border-b border-gray-100 dark:border-slate-700", children: [
                /* @__PURE__ */ jsxs("td", { className: "py-3", children: [
                  "IGST @ ",
                  taxRateLabel(previewInvoice),
                  "%"
                ] }),
                /* @__PURE__ */ jsx("td", { className: "py-3 text-right tabular-nums", children: formatMoney(previewInvoice.igst_amount, previewInvoice.currency, 2) })
              ] })
            ] })
          ] }),
          /* @__PURE__ */ jsx("div", { className: "mt-6 flex justify-end", children: /* @__PURE__ */ jsx("div", { className: "w-64 border-t border-gray-200 pt-3 text-lg font-bold dark:border-slate-600", children: /* @__PURE__ */ jsxs("div", { className: "flex justify-between", children: [
            /* @__PURE__ */ jsx("span", { children: "Total" }),
            /* @__PURE__ */ jsx("span", { className: "tabular-nums", children: formatMoney(previewInvoice.amount, previewInvoice.currency, 2) })
          ] }) }) }),
          /* @__PURE__ */ jsxs("p", { className: "mt-6 border-t border-gray-100 pt-4 text-xs text-waify-text-muted dark:border-slate-700 dark:text-waify-dark-text-muted", children: [
            "Payment reference: ",
            previewInvoice.provider_payment_id || previewInvoice.provider_order_id,
            ". This is a computer-generated invoice."
          ] }),
          !["paid", "cancelled", "canceled", "void", "voided"].includes(previewInvoice.status) && previewInvoice.metadata?.payment_instructions && /* @__PURE__ */ jsxs("div", { className: "mt-4 rounded-card border border-emerald-200 bg-emerald-50 p-4 text-xs text-emerald-950 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-100", children: [
            /* @__PURE__ */ jsx("div", { className: "font-semibold", children: "Bank Transfer / UPI details" }),
            /* @__PURE__ */ jsx("div", { className: "mt-2 grid gap-1", children: Object.entries(previewInvoice.metadata.payment_instructions).map(([key, value]) => value ? /* @__PURE__ */ jsxs("div", { className: "flex justify-between gap-3", children: [
              /* @__PURE__ */ jsx("span", { className: "capitalize", children: key.replace(/_/g, " ") }),
              /* @__PURE__ */ jsx("span", { className: "font-mono text-right", children: value })
            ] }, key) : null) })
          ] }),
          (previewInvoice.timeline || []).length > 0 && /* @__PURE__ */ jsxs("div", { className: "mt-4 rounded-card border border-gray-100 bg-gray-50 p-4 dark:border-slate-700 dark:bg-slate-900/60", children: [
            /* @__PURE__ */ jsx("div", { className: "text-xs font-semibold uppercase tracking-wider text-waify-text-muted dark:text-waify-dark-text-muted", children: "Payment timeline" }),
            /* @__PURE__ */ jsx("div", { className: "mt-3 space-y-3", children: (previewInvoice.timeline || []).slice().reverse().map((entry, index) => /* @__PURE__ */ jsxs("div", { className: "flex gap-3 text-xs", children: [
              /* @__PURE__ */ jsx("span", { className: "mt-1 h-2 w-2 shrink-0 rounded-full bg-waify-green" }),
              /* @__PURE__ */ jsxs("div", { className: "min-w-0", children: [
                /* @__PURE__ */ jsx("p", { className: "font-semibold text-waify-text dark:text-waify-dark-text", children: entry.label }),
                /* @__PURE__ */ jsxs("p", { className: "mt-0.5 text-waify-text-muted dark:text-waify-dark-text-muted", children: [
                  new Date(entry.at).toLocaleString("en-IN"),
                  entry.actor_name ? ` by ${entry.actor_name}` : ""
                ] })
              ] })
            ] }, `${entry.event}-${entry.at}-${index}`)) })
          ] })
        ] }) })
      ] })
    ] })
  ] });
}
export {
  BillingIndex as default
};
