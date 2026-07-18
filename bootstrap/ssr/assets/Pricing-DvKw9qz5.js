import { jsxs, jsx } from "react/jsx-runtime";
import { Head, Link } from "@inertiajs/react";
import { useState } from "react";
import { Check, ArrowRight, X } from "lucide-react";
import { f as MarketingLayout, c as MarketingFaqAccordion } from "./Marketing-DVQdzdv4.js";
import { C as Card } from "./Card-BtIXZ0GS.js";
import { B as Badge } from "./Badge-C65MHc2S.js";
import { B as Button } from "./Button-BJftGNki.js";
import "./BrandingWrapper-DdVUILzh.js";
import "./utils-B2ZNUmII.js";
import "clsx";
import "tailwind-merge";
import "./BrandLogo-TeztHB0m.js";
import "./useToast-BN7qsQL3.js";
import "./CookieConsentBanner-X10ew4Dy.js";
import "./ProviderLogo-1eHVtujo.js";
const planGuidance = {
  starter: {
    bestFor: "Small teams starting WhatsApp operations",
    note: "Good for one number, basic campaigns, shared inbox, contacts, and a measured first month."
  },
  pro: {
    bestFor: "Growing teams with automation and AI",
    note: "Adds larger limits, visual automations, AI assistance, analytics, and longer retention."
  },
  growth: {
    bestFor: "Growing teams with automation and AI",
    note: "Adds larger limits, visual automations, AI assistance, analytics, and longer retention."
  },
  business: {
    bestFor: "Teams running high-volume operations",
    note: "Best for mature inbox, campaign, automation, integration, and reporting workflows."
  }
};
function Pricing({ plans, canRegister }) {
  const [billing, setBilling] = useState("monthly");
  const visiblePlans = plans.filter((plan) => plan.key !== "enterprise" && plan.key !== "free").slice(0, 3);
  const effectiveFeaturesByPlan = visiblePlans.reduce((carry, plan, index) => {
    const directFeatures = plan.features.filter((feature) => !feature.toLowerCase().startsWith("everything in "));
    const inheritsPrevious = plan.features.some((feature) => feature.toLowerCase().startsWith("everything in "));
    const previousPlan = visiblePlans[index - 1];
    const inheritedFeatures = inheritsPrevious && previousPlan ? carry[previousPlan.key] ?? [] : [];
    carry[plan.key] = Array.from(/* @__PURE__ */ new Set([...inheritedFeatures, ...directFeatures]));
    return carry;
  }, {});
  const allFeatures = Array.from(new Set(visiblePlans.flatMap((plan) => effectiveFeaturesByPlan[plan.key] ?? plan.features))).slice(0, 18);
  const fmt = (amount, currency = "INR") => amount === 0 ? "₹0" : new Intl.NumberFormat("en-IN", { style: "currency", currency, minimumFractionDigits: 0 }).format(amount / 100);
  return /* @__PURE__ */ jsxs(MarketingLayout, { page: "pricing", wide: true, children: [
    /* @__PURE__ */ jsx(Head, { title: "Pricing" }),
    /* @__PURE__ */ jsxs("div", { className: "text-center", children: [
      /* @__PURE__ */ jsxs("div", { className: "inline-flex items-center gap-2 rounded-xl bg-white p-1 ring-1 ring-gray-200 dark:bg-slate-800 dark:ring-slate-700", children: [
        /* @__PURE__ */ jsx("button", { type: "button", onClick: () => setBilling("monthly"), className: `rounded-lg px-4 py-2 text-sm font-medium transition ${billing === "monthly" ? "bg-waify-green text-white" : "text-waify-text-muted"}`, children: "Monthly" }),
        /* @__PURE__ */ jsxs("button", { type: "button", onClick: () => setBilling("yearly"), className: `rounded-lg px-4 py-2 text-sm font-medium transition ${billing === "yearly" ? "bg-waify-green text-white" : "text-waify-text-muted"}`, children: [
          "Annual ",
          /* @__PURE__ */ jsx("span", { className: "text-[10px]", children: "(save more)" })
        ] })
      ] }),
      /* @__PURE__ */ jsx("p", { className: "mx-auto mt-4 max-w-2xl text-sm leading-relaxed text-waify-text-muted dark:text-waify-dark-text-muted", children: "Plans are billed per workspace. Each workspace connects one WhatsApp Business number; create another workspace for a separate brand, client, or number." }),
      /* @__PURE__ */ jsx("div", { className: "mx-auto mt-6 grid max-w-4xl gap-3 text-left sm:grid-cols-3", children: [
        ["One workspace, one WABA", "Keep each brand or client separate with clean contacts, billing, teams, and limits."],
        ["Meta charges separate", "Meta conversation and WABA charges are billed by Meta, not bundled into Zyptos plans."],
        ["Enterprise is reviewed", "Enterprise limits, onboarding, and activation require admin approval before access is granted."]
      ].map(([title, body]) => /* @__PURE__ */ jsxs("div", { className: "rounded-2xl border border-gray-100 bg-white p-4 text-sm shadow-sm dark:border-waify-dark-border dark:bg-waify-dark-surface", children: [
        /* @__PURE__ */ jsx("p", { className: "font-semibold text-waify-text dark:text-waify-dark-text", children: title }),
        /* @__PURE__ */ jsx("p", { className: "mt-1 text-xs leading-relaxed text-waify-text-muted dark:text-waify-dark-text-muted", children: body })
      ] }, title)) })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "mt-10 grid gap-6 lg:grid-cols-4", children: [
      visiblePlans.map((plan, index) => {
        const popular = plan.key === "pro" || plan.key === "growth" || index === 1;
        const rawPrice = billing === "yearly" && plan.price_yearly ? Math.round(plan.price_yearly / 12) : plan.price_monthly;
        return /* @__PURE__ */ jsxs(Card, { className: `mkt-card-lift relative flex flex-col p-6 ${popular ? "ring-2 ring-waify-green" : ""}`, children: [
          popular && /* @__PURE__ */ jsx(Badge, { variant: "success", className: "absolute -top-3 left-1/2 -translate-x-1/2", children: "Most popular" }),
          /* @__PURE__ */ jsx("h2", { className: "text-lg font-bold", children: plan.name }),
          /* @__PURE__ */ jsx("p", { className: "mt-2 min-h-[42px] text-sm leading-relaxed text-waify-text-muted dark:text-waify-dark-text-muted", children: plan.description }),
          (planGuidance[plan.key] || planGuidance[plan.key.toLowerCase()]) && /* @__PURE__ */ jsxs("div", { className: "mt-4 rounded-xl bg-waify-green/10 p-3 text-xs leading-relaxed text-waify-green-dark dark:bg-waify-green/15 dark:text-emerald-200", children: [
            /* @__PURE__ */ jsx("span", { className: "block font-semibold", children: (planGuidance[plan.key] || planGuidance[plan.key.toLowerCase()]).bestFor }),
            /* @__PURE__ */ jsx("span", { className: "mt-1 block", children: (planGuidance[plan.key] || planGuidance[plan.key.toLowerCase()]).note })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "mt-5", children: [
            /* @__PURE__ */ jsx("span", { className: "text-3xl font-extrabold tabular-nums", children: fmt(rawPrice, plan.currency) }),
            rawPrice > 0 && /* @__PURE__ */ jsx("span", { className: "text-sm text-waify-text-muted", children: "/mo" })
          ] }),
          billing === "yearly" && plan.price_yearly && /* @__PURE__ */ jsxs("p", { className: "mt-1 text-xs font-medium text-waify-green-dark", children: [
            "Billed ",
            fmt(plan.price_yearly, plan.currency),
            "/year"
          ] }),
          plan.trial_days > 0 && /* @__PURE__ */ jsxs("p", { className: "mt-1 text-xs font-medium text-waify-green-dark", children: [
            plan.trial_days,
            "-day free trial"
          ] }),
          /* @__PURE__ */ jsx("ul", { className: "mt-6 flex-1 space-y-2.5 text-sm text-waify-text-muted dark:text-waify-dark-text-muted", children: plan.features.slice(0, 8).map((feature) => /* @__PURE__ */ jsxs("li", { className: "flex gap-2", children: [
            /* @__PURE__ */ jsx(Check, { className: "mt-0.5 h-4 w-4 flex-shrink-0 text-waify-green" }),
            feature
          ] }, feature)) }),
          /* @__PURE__ */ jsx(Link, { href: `${route("register")}?plan=${plan.key}&cycle=${billing}`, className: "mt-6", children: /* @__PURE__ */ jsxs(Button, { className: "w-full", variant: popular ? "primary" : "secondary", disabled: !canRegister, children: [
            "Start workspace checkout ",
            /* @__PURE__ */ jsx(ArrowRight, { className: "h-4 w-4" })
          ] }) })
        ] }, plan.id);
      }),
      /* @__PURE__ */ jsxs(Card, { className: "mkt-card-lift relative flex flex-col overflow-hidden bg-waify-ink p-6 text-white", children: [
        /* @__PURE__ */ jsx("div", { className: "marketing-grid-pattern absolute inset-0 opacity-10" }),
        /* @__PURE__ */ jsxs("div", { className: "relative flex h-full flex-col", children: [
          /* @__PURE__ */ jsx(Badge, { variant: "success", className: "mb-4 w-fit", children: "Custom" }),
          /* @__PURE__ */ jsx("h2", { className: "text-lg font-bold", children: "Enterprise" }),
          /* @__PURE__ */ jsx("p", { className: "mt-2 min-h-[42px] text-sm leading-relaxed text-slate-400", children: "Custom usage, onboarding help, compliance needs, and guided Meta readiness for teams running multiple workspaces." }),
          /* @__PURE__ */ jsx("div", { className: "mt-5 text-3xl font-extrabold", children: "Contact sales" }),
          /* @__PURE__ */ jsx("p", { className: "mt-1 text-xs font-medium text-waify-green", children: "Admin-reviewed activation only" }),
          /* @__PURE__ */ jsx("ul", { className: "mt-6 flex-1 space-y-2.5 text-sm text-slate-300", children: ["Custom usage limits", "Dedicated onboarding", "Meta app review support", "Priority billing support"].map((feature) => /* @__PURE__ */ jsxs("li", { className: "flex gap-2", children: [
            /* @__PURE__ */ jsx(Check, { className: "mt-0.5 h-4 w-4 flex-shrink-0 text-waify-green" }),
            feature
          ] }, feature)) }),
          /* @__PURE__ */ jsx(Link, { href: route("contact"), className: "mt-6", children: /* @__PURE__ */ jsxs(Button, { className: "w-full bg-white text-waify-green-darker hover:bg-white/95", children: [
            "Talk to sales ",
            /* @__PURE__ */ jsx(ArrowRight, { className: "h-4 w-4" })
          ] }) })
        ] })
      ] })
    ] }),
    allFeatures.length > 0 && /* @__PURE__ */ jsxs(Card, { className: "mt-12 overflow-hidden p-0", children: [
      /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-4 gap-4 border-b border-gray-100 bg-gray-50 px-4 py-3 text-[11px] font-semibold uppercase tracking-wider text-waify-text-muted dark:border-waify-dark-border dark:bg-waify-dark-surface-2", children: [
        /* @__PURE__ */ jsx("span", { children: "Feature" }),
        visiblePlans.map((plan) => /* @__PURE__ */ jsx("span", { className: "text-center", children: plan.name }, plan.id))
      ] }),
      allFeatures.map((feature, index) => /* @__PURE__ */ jsxs("div", { className: `grid grid-cols-4 gap-4 px-4 py-3 text-sm ${index % 2 === 0 ? "bg-white dark:bg-waify-dark-surface" : "bg-gray-50/70 dark:bg-waify-dark-surface-2/60"}`, children: [
        /* @__PURE__ */ jsx("span", { className: "text-waify-text-muted", children: feature }),
        visiblePlans.map((plan) => /* @__PURE__ */ jsx("span", { className: "flex justify-center", children: (effectiveFeaturesByPlan[plan.key] ?? plan.features).includes(feature) ? /* @__PURE__ */ jsx(Check, { className: "h-4 w-4 text-waify-green" }) : /* @__PURE__ */ jsx(X, { className: "h-4 w-4 text-gray-300" }) }, plan.id))
      ] }, feature))
    ] }),
    /* @__PURE__ */ jsx("div", { className: "mt-12 grid gap-4 md:grid-cols-3", children: [
      ["1. Preview the quote", "Choose a workspace plan and cycle, then preview discount, GST, and final payable amount before creating an invoice."],
      ["2. Pay securely", "Use Razorpay one-time checkout or create a bank/UPI invoice with payment instructions and proof upload."],
      ["3. Activate the workspace", "Razorpay payments confirm automatically. Manual payments activate after platform admin approval."]
    ].map(([title, body]) => /* @__PURE__ */ jsxs(Card, { className: "p-5", children: [
      /* @__PURE__ */ jsx("h2", { className: "font-semibold text-waify-text dark:text-waify-dark-text", children: title }),
      /* @__PURE__ */ jsx("p", { className: "mt-2 text-sm leading-relaxed text-waify-text-muted dark:text-waify-dark-text-muted", children: body })
    ] }, title)) }),
    /* @__PURE__ */ jsx("div", { className: "mx-auto mt-12 max-w-3xl", children: /* @__PURE__ */ jsx(MarketingFaqAccordion, {}) })
  ] });
}
export {
  Pricing as default
};
