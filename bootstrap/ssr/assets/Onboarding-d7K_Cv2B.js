import { jsx, jsxs } from "react/jsx-runtime";
import { usePage, useForm, Link } from "@inertiajs/react";
import { useState, useMemo, useEffect } from "react";
import { G as Guest } from "./GuestLayout-CE_3JqBE.js";
import { B as Button } from "./Button-ymbdH_NY.js";
import { Sparkles, CreditCard, Shield, Check, ArrowRight, Users, Crown, Building2, Zap } from "lucide-react";
import { C as Card, a as CardContent } from "./Card-DLPTnTfC.js";
import { B as Badge } from "./Badge-CHx1ViYT.js";
import "./BrandingWrapper-BZp9WdA-.js";
import "../ssr.js";
import "@inertiajs/react/server";
import "./vendor-BWyHebfG.js";
import "react-dom/server";
import "./utils-B2ZNUmII.js";
import "clsx";
import "tailwind-merge";
function Onboarding({ plans = [], defaultPlanKey = "free" }) {
  const page = usePage();
  const authUser = page.props?.auth?.user;
  const [selectedPlanKey, setSelectedPlanKey] = useState(defaultPlanKey);
  const [step, setStep] = useState(1);
  const [billingCycle, setBillingCycle] = useState("monthly");
  const [autoCreateStarted, setAutoCreateStarted] = useState(false);
  const [autoCreateFailed, setAutoCreateFailed] = useState(false);
  const { data, setData, post, processing, errors } = useForm({
    plan_key: defaultPlanKey
  });
  const handlePlanSelect = (planKey) => {
    setSelectedPlanKey(planKey);
    setData("plan_key", planKey);
    setAutoCreateFailed(false);
  };
  const submit = (e) => {
    e.preventDefault();
    setAutoCreateStarted(true);
    setAutoCreateFailed(false);
    post(route("onboarding.store"), {
      onError: () => {
        setAutoCreateFailed(true);
        setAutoCreateStarted(false);
      }
    });
  };
  const selectedPlan = useMemo(
    () => plans.find((p) => p.key === selectedPlanKey) ?? plans[0] ?? null,
    [plans, selectedPlanKey]
  );
  const formatPrice = (amount, currency = "USD") => {
    if (amount === 0 || amount === null) return "Free";
    const major = amount / 100;
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency,
      minimumFractionDigits: 0
    }).format(major);
  };
  const getPlanIcon = (key) => {
    switch (key.toLowerCase()) {
      case "free":
        return Users;
      case "starter":
        return Zap;
      case "pro":
        return Building2;
      case "enterprise":
        return Crown;
      default:
        return Users;
    }
  };
  const getPlanColor = (key) => {
    switch (key.toLowerCase()) {
      case "free":
        return "from-gray-500 to-gray-600";
      case "starter":
        return "from-blue-500 to-blue-600";
      case "pro":
        return "from-purple-500 to-purple-600";
      case "enterprise":
        return "from-yellow-500 to-orange-600";
      default:
        return "from-blue-500 to-blue-600";
    }
  };
  const currentPlanPrice = (plan) => {
    if (!plan) return 0;
    return billingCycle === "yearly" && plan.price_yearly != null ? plan.price_yearly : plan.price_monthly;
  };
  const selectedPlanRequiresCheckout = useMemo(() => {
    if (!selectedPlan) return false;
    return Number(selectedPlan.price_monthly || 0) > 0 || Number(selectedPlan.price_yearly || 0) > 0;
  }, [selectedPlan]);
  const canGoStep2 = Boolean(selectedPlanKey);
  useEffect(() => {
    if (step !== 2 || autoCreateStarted || autoCreateFailed || processing || !data.plan_key || selectedPlanRequiresCheckout) {
      return;
    }
    const timer = window.setTimeout(() => {
      setAutoCreateStarted(true);
      post(route("onboarding.store"), {
        onError: () => {
          setAutoCreateFailed(true);
          setAutoCreateStarted(false);
        }
      });
    }, 300);
    return () => window.clearTimeout(timer);
  }, [step, autoCreateStarted, autoCreateFailed, processing, data.plan_key, selectedPlanRequiresCheckout]);
  return /* @__PURE__ */ jsx(Guest, { maxWidthClass: "max-w-7xl", children: /* @__PURE__ */ jsxs("div", { className: "w-full max-w-7xl space-y-6 sm:space-y-8", children: [
    /* @__PURE__ */ jsxs("div", { className: "text-center", children: [
      /* @__PURE__ */ jsxs("div", { className: "inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-full mb-4", children: [
        /* @__PURE__ */ jsx(Sparkles, { className: "h-4 w-4 text-blue-600 dark:text-blue-400" }),
        /* @__PURE__ */ jsx("span", { className: "text-sm font-semibold text-blue-600 dark:text-blue-400", children: "Choose Your Plan • Start Free Trial" })
      ] }),
      /* @__PURE__ */ jsxs("h2", { className: "text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight text-gray-900 dark:text-gray-100", children: [
        "Welcome",
        authUser?.name ? `, ${authUser.name}` : "",
        " — Let’s Set Up Your Account"
      ] }),
      /* @__PURE__ */ jsx("p", { className: "mt-2 text-sm text-gray-600 dark:text-gray-400", children: "Professional onboarding in a few guided steps: plan and review." })
    ] }),
    /* @__PURE__ */ jsx(Card, { children: /* @__PURE__ */ jsx(CardContent, { className: "p-4 sm:p-5", children: /* @__PURE__ */ jsx("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-3", children: [
      { id: 1, title: "Choose Plan", icon: CreditCard },
      { id: 2, title: "Review & Create", icon: Shield }
    ].map((item) => {
      const Icon = item.icon;
      const active = step === item.id;
      const done = step > item.id;
      return /* @__PURE__ */ jsxs(
        "button",
        {
          type: "button",
          onClick: () => {
            if (item.id === 1 || item.id === 2 && canGoStep2) {
              setStep(item.id);
            }
          },
          className: `flex min-w-0 items-center gap-3 rounded-xl border px-4 py-3 text-left transition ${active ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20" : done ? "border-emerald-300 bg-emerald-50 dark:bg-emerald-900/10" : "border-gray-200 dark:border-gray-800"}`,
          children: [
            /* @__PURE__ */ jsx("div", { className: `flex h-9 w-9 items-center justify-center rounded-full ${done ? "bg-emerald-600" : active ? "bg-blue-600" : "bg-gray-300 dark:bg-gray-700"}`, children: done ? /* @__PURE__ */ jsx(Check, { className: "h-4 w-4 text-white" }) : /* @__PURE__ */ jsx(Icon, { className: "h-4 w-4 text-white" }) }),
            /* @__PURE__ */ jsxs("div", { className: "min-w-0", children: [
              /* @__PURE__ */ jsxs("p", { className: "text-xs text-gray-500 dark:text-gray-400", children: [
                "Step ",
                item.id
              ] }),
              /* @__PURE__ */ jsx("p", { className: "text-sm font-semibold text-gray-900 dark:text-gray-100 break-words", children: item.title })
            ] })
          ]
        },
        item.id
      );
    }) }) }) }),
    /* @__PURE__ */ jsx("div", { className: "flex justify-center", children: /* @__PURE__ */ jsxs("div", { className: "inline-flex rounded-xl border border-gray-200 dark:border-gray-700 p-1 bg-white dark:bg-gray-900", children: [
      /* @__PURE__ */ jsx(
        "button",
        {
          type: "button",
          onClick: () => setBillingCycle("monthly"),
          className: `px-4 py-2 text-sm rounded-lg ${billingCycle === "monthly" ? "bg-blue-600 text-white" : "text-gray-600 dark:text-gray-300"}`,
          children: "Monthly"
        }
      ),
      /* @__PURE__ */ jsx(
        "button",
        {
          type: "button",
          onClick: () => setBillingCycle("yearly"),
          className: `px-4 py-2 text-sm rounded-lg ${billingCycle === "yearly" ? "bg-blue-600 text-white" : "text-gray-600 dark:text-gray-300"}`,
          children: "Yearly"
        }
      )
    ] }) }),
    plans.length > 0 && step === 1 && /* @__PURE__ */ jsx("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6", children: plans.map((plan) => {
      const Icon = getPlanIcon(plan.key);
      const isSelected = selectedPlanKey === plan.key;
      return /* @__PURE__ */ jsx(
        Card,
        {
          className: `cursor-pointer transition-all duration-200 ${isSelected ? "ring-2 ring-blue-500 shadow-lg scale-105" : "hover:shadow-md"}`,
          onClick: () => handlePlanSelect(plan.key),
          children: /* @__PURE__ */ jsxs(CardContent, { className: "p-6", children: [
            /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between mb-4", children: [
              /* @__PURE__ */ jsx("div", { className: `p-3 rounded-xl bg-gradient-to-r ${getPlanColor(plan.key)}`, children: /* @__PURE__ */ jsx(Icon, { className: "h-6 w-6 text-white" }) }),
              isSelected && /* @__PURE__ */ jsx("div", { className: "h-6 w-6 rounded-full bg-blue-500 flex items-center justify-center", children: /* @__PURE__ */ jsx(Check, { className: "h-4 w-4 text-white" }) })
            ] }),
            /* @__PURE__ */ jsx("h3", { className: "text-xl font-bold text-gray-900 dark:text-gray-100 mb-2", children: plan.name }),
            /* @__PURE__ */ jsxs("div", { className: "mb-4", children: [
              /* @__PURE__ */ jsx("div", { className: "text-3xl font-bold text-gray-900 dark:text-gray-100", children: formatPrice(
                billingCycle === "yearly" && plan.price_yearly != null ? plan.price_yearly : plan.price_monthly,
                plan.currency
              ) }),
              /* @__PURE__ */ jsxs("div", { className: "text-sm text-gray-500 dark:text-gray-400", children: [
                "per ",
                billingCycle === "yearly" ? "year" : "month"
              ] })
            ] }),
            plan.trial_days > 0 && /* @__PURE__ */ jsxs(Badge, { variant: "success", className: "mb-4", children: [
              plan.trial_days,
              "-Day Free Trial"
            ] }),
            plan.key.toLowerCase() === "pro" && /* @__PURE__ */ jsx(Badge, { variant: "info", className: "mb-4 ml-2", children: "Recommended" }),
            plan.description && /* @__PURE__ */ jsx("p", { className: "text-sm text-gray-600 dark:text-gray-400 mb-4", children: plan.description }),
            /* @__PURE__ */ jsxs("div", { className: "space-y-2 text-sm", children: [
              (plan.limits?.whatsapp_connections || plan.limits?.connections) && /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 text-gray-700 dark:text-gray-300", children: [
                /* @__PURE__ */ jsx(Check, { className: "h-4 w-4 text-green-500" }),
                /* @__PURE__ */ jsxs("span", { children: [
                  (plan.limits.whatsapp_connections ?? plan.limits.connections) === -1 ? "Unlimited" : plan.limits.whatsapp_connections ?? plan.limits.connections,
                  " ",
                  "WhatsApp ",
                  (plan.limits.whatsapp_connections ?? plan.limits.connections) === 1 ? "Connection" : "Connections"
                ] })
              ] }),
              plan.limits?.messages_monthly && /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 text-gray-700 dark:text-gray-300", children: [
                /* @__PURE__ */ jsx(Check, { className: "h-4 w-4 text-green-500" }),
                /* @__PURE__ */ jsxs("span", { children: [
                  plan.limits.messages_monthly === -1 ? "Unlimited" : plan.limits.messages_monthly.toLocaleString(),
                  " ",
                  "Messages/Month"
                ] })
              ] }),
              plan.limits?.agents && /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 text-gray-700 dark:text-gray-300", children: [
                /* @__PURE__ */ jsx(Check, { className: "h-4 w-4 text-green-500" }),
                /* @__PURE__ */ jsxs("span", { children: [
                  plan.limits.agents === -1 ? "Unlimited" : plan.limits.agents,
                  " ",
                  plan.limits.agents === 1 ? "Agent" : "Agents"
                ] })
              ] })
            ] })
          ] })
        },
        plan.id
      );
    }) }),
    step === 1 && /* @__PURE__ */ jsx("div", { className: "flex justify-end", children: /* @__PURE__ */ jsxs(Button, { type: "button", onClick: () => setStep(2), disabled: !canGoStep2, children: [
      "Continue to Review ",
      /* @__PURE__ */ jsx(ArrowRight, { className: "h-4 w-4 ml-2" })
    ] }) }),
    step >= 2 && /* @__PURE__ */ jsx("form", { className: "space-y-6", onSubmit: submit, children: /* @__PURE__ */ jsx(Card, { children: /* @__PURE__ */ jsxs(CardContent, { className: "p-6 space-y-4", children: [
      /* @__PURE__ */ jsx("div", { className: "flex items-center justify-between gap-3", children: /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("h3", { className: "text-lg font-semibold text-gray-900 dark:text-gray-100", children: "Review Setup" }),
        /* @__PURE__ */ jsx("p", { className: "text-sm text-gray-500 dark:text-gray-400", children: "Confirm your plan and create your tenant account." })
      ] }) }),
      step === 2 && /* @__PURE__ */ jsxs("div", { className: "rounded-xl border border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-900/15 p-4 space-y-3", children: [
        /* @__PURE__ */ jsx("div", { className: "flex items-center gap-2", children: /* @__PURE__ */ jsx("p", { className: "text-sm font-semibold text-blue-900 dark:text-blue-100", children: "Review Setup" }) }),
        /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 md:grid-cols-3 gap-3 text-sm", children: [
          /* @__PURE__ */ jsxs("div", { className: "rounded-lg bg-white/70 dark:bg-gray-900/40 p-3", children: [
            /* @__PURE__ */ jsx("p", { className: "text-xs text-gray-500 dark:text-gray-400", children: "Selected Plan" }),
            /* @__PURE__ */ jsx("p", { className: "font-semibold text-gray-900 dark:text-gray-100", children: selectedPlan?.name || "—" })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "rounded-lg bg-white/70 dark:bg-gray-900/40 p-3", children: [
            /* @__PURE__ */ jsx("p", { className: "text-xs text-gray-500 dark:text-gray-400", children: "Price" }),
            /* @__PURE__ */ jsxs("p", { className: "font-semibold text-gray-900 dark:text-gray-100", children: [
              selectedPlan ? formatPrice(currentPlanPrice(selectedPlan), selectedPlan.currency) : "—",
              " / ",
              billingCycle === "yearly" ? "year" : "month"
            ] })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "rounded-lg bg-white/70 dark:bg-gray-900/40 p-3", children: [
            /* @__PURE__ */ jsx("p", { className: "text-xs text-gray-500 dark:text-gray-400", children: "Next Step After Create" }),
            /* @__PURE__ */ jsx("p", { className: "font-semibold text-gray-900 dark:text-gray-100", children: "Complete Profile" })
          ] })
        ] }),
        /* @__PURE__ */ jsxs("ul", { className: "space-y-2 text-xs text-blue-800 dark:text-blue-200", children: [
          /* @__PURE__ */ jsxs("li", { className: "flex items-start gap-2", children: [
            /* @__PURE__ */ jsx(Check, { className: "h-3.5 w-3.5 mt-0.5" }),
            "Account and subscription will be created automatically."
          ] }),
          /* @__PURE__ */ jsxs("li", { className: "flex items-start gap-2", children: [
            /* @__PURE__ */ jsx(Check, { className: "h-3.5 w-3.5 mt-0.5" }),
            "Core modules will be enabled by default."
          ] }),
          /* @__PURE__ */ jsxs("li", { className: "flex items-start gap-2", children: [
            /* @__PURE__ */ jsx(Check, { className: "h-3.5 w-3.5 mt-0.5" }),
            "You will be redirected to complete your profile before entering the app."
          ] })
        ] }),
        /* @__PURE__ */ jsxs("p", { className: "text-xs text-blue-800 dark:text-blue-200", children: [
          "Account owner: ",
          authUser?.email || authUser?.name || "Current user"
        ] })
      ] }),
      step === 2 && selectedPlanRequiresCheckout && /* @__PURE__ */ jsxs("div", { className: "rounded-xl border border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-900/20 p-4 space-y-2", children: [
        /* @__PURE__ */ jsx("p", { className: "text-sm font-semibold text-amber-900 dark:text-amber-100", children: "Checkout required for paid plans" }),
        /* @__PURE__ */ jsx("p", { className: "text-xs text-amber-800 dark:text-amber-200", children: "Complete checkout first. After successful payment, account creation will continue automatically." }),
        /* @__PURE__ */ jsx("div", { children: /* @__PURE__ */ jsx(Link, { href: route("pricing"), className: "inline-flex", children: /* @__PURE__ */ jsx(Button, { type: "button", size: "sm", children: "Go to Pricing & Checkout" }) }) })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "flex flex-col gap-3", children: [
        /* @__PURE__ */ jsxs("div", { className: "flex justify-between gap-3", children: [
          /* @__PURE__ */ jsx(Button, { type: "button", variant: "secondary", onClick: () => setStep(1), children: "Back to Plans" }),
          selectedPlanRequiresCheckout ? /* @__PURE__ */ jsx(Button, { type: "button", className: "w-full md:w-auto", disabled: true, children: "Awaiting checkout" }) : autoCreateFailed ? /* @__PURE__ */ jsx(Button, { type: "submit", className: "w-full md:w-auto", disabled: processing || !data.plan_key, children: processing ? "Retrying..." : "Retry Create Account" }) : /* @__PURE__ */ jsx(Button, { type: "button", className: "w-full md:w-auto", disabled: true, children: processing || autoCreateStarted ? "Auto creating account..." : "Preparing..." })
        ] }),
        errors.plan_key && /* @__PURE__ */ jsx("p", { className: "text-sm text-red-600 dark:text-red-400", children: errors.plan_key }),
        selectedPlanKey && (plans.find((p) => p.key === selectedPlanKey)?.trial_days ?? 0) > 0 && /* @__PURE__ */ jsxs("p", { className: "mt-2 text-center text-xs text-gray-500 dark:text-gray-400", children: [
          "You'll start with a ",
          plans.find((p) => p.key === selectedPlanKey)?.trial_days,
          "-day free trial"
        ] })
      ] })
    ] }) }) })
  ] }) });
}
export {
  Onboarding as default
};
