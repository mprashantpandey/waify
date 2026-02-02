import { jsx, jsxs, Fragment } from "react/jsx-runtime";
import { Link } from "@inertiajs/react";
import { P as PublicLayout } from "./PublicLayout-CgFgjZDl.js";
import { Sparkles, Check, X, Star, Mail, ArrowRight, ChevronUp, ChevronDown, Users, Crown, Building2, Zap } from "lucide-react";
import { B as Button } from "./Button-BocaoVWt.js";
import { useState } from "react";
import "./BrandingWrapper-B2Mh0bYb.js";
import "./utils-H80jjgLf.js";
import "clsx";
import "tailwind-merge";
function Pricing({ plans, canRegister }) {
  const [showCompare, setShowCompare] = useState(false);
  const [expandedPlans, setExpandedPlans] = useState(/* @__PURE__ */ new Set());
  const FEATURES_TO_SHOW = 5;
  const formatPrice = (amount, currency = "INR") => {
    if (amount === 0) return "Free";
    const major = amount / 100;
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency,
      minimumFractionDigits: 0
    }).format(major);
  };
  const getPlanIcon = (key) => {
    switch (key) {
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
    switch (key) {
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
  const togglePlanExpansion = (planId) => {
    const newExpanded = new Set(expandedPlans);
    if (newExpanded.has(planId)) {
      newExpanded.delete(planId);
    } else {
      newExpanded.add(planId);
    }
    setExpandedPlans(newExpanded);
  };
  const allFeatures = Array.from(
    new Set(plans.flatMap((plan) => plan.features))
  ).sort();
  return /* @__PURE__ */ jsx(PublicLayout, { children: /* @__PURE__ */ jsxs("div", { className: "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16", children: [
    /* @__PURE__ */ jsxs("div", { className: "text-center mb-16", children: [
      /* @__PURE__ */ jsxs("div", { className: "inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-full mb-6", children: [
        /* @__PURE__ */ jsx(Sparkles, { className: "h-4 w-4 text-blue-600 dark:text-blue-400" }),
        /* @__PURE__ */ jsx("span", { className: "text-sm font-semibold text-blue-600 dark:text-blue-400", children: "No Credit Card Required • Start Free Trial" })
      ] }),
      /* @__PURE__ */ jsx("h1", { className: "text-5xl md:text-6xl font-bold text-gray-900 dark:text-gray-100 mb-4 bg-gradient-to-r from-gray-900 via-blue-600 to-purple-600 dark:from-gray-100 dark:via-blue-400 dark:to-purple-400 bg-clip-text text-transparent", children: "Simple, Transparent Pricing" }),
      /* @__PURE__ */ jsx("p", { className: "text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto mb-8", children: "Choose the perfect plan for your business. Start with a free trial, no credit card required." }),
      /* @__PURE__ */ jsx("div", { className: "flex items-center justify-center gap-4", children: /* @__PURE__ */ jsx(
        Button,
        {
          variant: showCompare ? "primary" : "secondary",
          onClick: () => setShowCompare(!showCompare),
          size: "lg",
          children: showCompare ? "Hide Comparison" : "Compare Plans"
        }
      ) })
    ] }),
    showCompare && /* @__PURE__ */ jsxs("div", { className: "mb-16 bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden", children: [
      /* @__PURE__ */ jsx("div", { className: "bg-gradient-to-r from-blue-600 to-purple-600 p-4", children: /* @__PURE__ */ jsx("h2", { className: "text-2xl font-bold text-white text-center", children: "Feature Comparison" }) }),
      /* @__PURE__ */ jsx("div", { className: "overflow-x-auto", children: /* @__PURE__ */ jsxs("table", { className: "w-full", children: [
        /* @__PURE__ */ jsx("thead", { className: "bg-gray-50 dark:bg-gray-900", children: /* @__PURE__ */ jsxs("tr", { children: [
          /* @__PURE__ */ jsx("th", { className: "px-6 py-4 text-left text-sm font-semibold text-gray-900 dark:text-gray-100", children: "Features" }),
          plans.map((plan) => /* @__PURE__ */ jsx(
            "th",
            {
              className: "px-6 py-4 text-center text-sm font-semibold text-gray-900 dark:text-gray-100",
              children: plan.name
            },
            plan.id
          ))
        ] }) }),
        /* @__PURE__ */ jsx("tbody", { className: "divide-y divide-gray-200 dark:divide-gray-700", children: allFeatures.map((feature, index) => /* @__PURE__ */ jsxs("tr", { className: "hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors", children: [
          /* @__PURE__ */ jsx("td", { className: "px-6 py-4 text-sm text-gray-700 dark:text-gray-300 font-medium", children: feature }),
          plans.map((plan) => /* @__PURE__ */ jsx("td", { className: "px-6 py-4 text-center", children: plan.features.includes(feature) ? /* @__PURE__ */ jsx(Check, { className: "h-5 w-5 text-green-500 mx-auto" }) : /* @__PURE__ */ jsx(X, { className: "h-5 w-5 text-gray-300 dark:text-gray-600 mx-auto" }) }, plan.id))
        ] }, index)) })
      ] }) })
    ] }),
    /* @__PURE__ */ jsx("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16", children: plans.map((plan) => {
      const Icon = getPlanIcon(plan.key);
      const gradient = getPlanColor(plan.key);
      const isPopular = plan.key === "pro";
      const isEnterprise = plan.key === "enterprise";
      const hasTrial = plan.trial_days > 0;
      const isExpanded = expandedPlans.has(plan.id);
      const visibleFeatures = isExpanded ? plan.features : plan.features.slice(0, FEATURES_TO_SHOW);
      const hasMoreFeatures = plan.features.length > FEATURES_TO_SHOW;
      return /* @__PURE__ */ jsxs(
        "div",
        {
          className: `relative bg-white dark:bg-gray-800 rounded-2xl shadow-xl border-2 transition-all duration-300 hover:shadow-2xl ${isPopular ? "border-purple-500 dark:border-purple-600 scale-105 ring-4 ring-purple-500/20" : "border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-700"} overflow-hidden`,
          children: [
            hasTrial && /* @__PURE__ */ jsxs("div", { className: "absolute top-0 right-0 bg-gradient-to-r from-green-500 to-emerald-600 text-white px-4 py-1 text-xs font-bold rounded-bl-lg shadow-lg flex items-center gap-1", children: [
              /* @__PURE__ */ jsx(Star, { className: "h-3 w-3" }),
              plan.trial_days,
              "-Day Trial"
            ] }),
            isPopular && /* @__PURE__ */ jsx("div", { className: "absolute top-0 left-0 right-0 bg-gradient-to-r from-purple-500 to-purple-600 text-white text-center py-2 text-xs font-semibold", children: "⭐ Most Popular" }),
            /* @__PURE__ */ jsxs("div", { className: `p-8 ${isPopular ? "pt-12" : hasTrial ? "pt-12" : ""}`, children: [
              /* @__PURE__ */ jsx("div", { className: `inline-flex items-center justify-center w-16 h-16 rounded-xl bg-gradient-to-r ${gradient} mb-4 shadow-lg`, children: /* @__PURE__ */ jsx(Icon, { className: "h-8 w-8 text-white" }) }),
              /* @__PURE__ */ jsx("h3", { className: "text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2", children: plan.name }),
              /* @__PURE__ */ jsx("p", { className: "text-gray-600 dark:text-gray-400 mb-6 text-sm min-h-[40px]", children: plan.description }),
              /* @__PURE__ */ jsx("div", { className: "mb-6", children: isEnterprise ? /* @__PURE__ */ jsxs("div", { children: [
                /* @__PURE__ */ jsx("div", { className: "text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2", children: "Custom Pricing" }),
                /* @__PURE__ */ jsx("p", { className: "text-sm text-gray-500 dark:text-gray-400", children: "Contact us for a tailored solution" })
              ] }) : /* @__PURE__ */ jsxs(Fragment, { children: [
                /* @__PURE__ */ jsxs("div", { className: "flex items-baseline", children: [
                  /* @__PURE__ */ jsx("span", { className: "text-4xl font-bold text-gray-900 dark:text-gray-100", children: formatPrice(plan.price_monthly, plan.currency) }),
                  /* @__PURE__ */ jsx("span", { className: "text-gray-600 dark:text-gray-400 ml-2", children: "/month" })
                ] }),
                plan.price_yearly && plan.price_yearly > 0 && /* @__PURE__ */ jsxs("p", { className: "text-sm text-gray-500 dark:text-gray-400 mt-1", children: [
                  formatPrice(plan.price_yearly, plan.currency),
                  "/year",
                  /* @__PURE__ */ jsx("span", { className: "text-green-600 dark:text-green-400 font-semibold ml-1", children: "(save 20%)" })
                ] })
              ] }) }),
              isEnterprise ? /* @__PURE__ */ jsx(Link, { href: route("contact"), children: /* @__PURE__ */ jsxs(
                Button,
                {
                  className: "w-full mb-6 bg-gradient-to-r from-yellow-500 to-orange-600 hover:from-yellow-600 hover:to-orange-700 shadow-lg",
                  variant: "secondary",
                  size: "lg",
                  children: [
                    "Contact for Enterprise",
                    /* @__PURE__ */ jsx(Mail, { className: "h-4 w-4 ml-2" })
                  ]
                }
              ) }) : canRegister ? /* @__PURE__ */ jsx(Link, { href: `${route("register")}?plan=${plan.key}`, children: /* @__PURE__ */ jsx(
                Button,
                {
                  className: `w-full mb-6 ${isPopular ? "bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 shadow-lg shadow-purple-500/50" : "bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 shadow-lg shadow-blue-500/50"}`,
                  variant: "secondary",
                  size: "lg",
                  children: hasTrial ? /* @__PURE__ */ jsxs(Fragment, { children: [
                    "Start ",
                    plan.trial_days,
                    "-Day Trial",
                    /* @__PURE__ */ jsx(Sparkles, { className: "h-4 w-4 ml-2" })
                  ] }) : /* @__PURE__ */ jsxs(Fragment, { children: [
                    "Get Started",
                    /* @__PURE__ */ jsx(ArrowRight, { className: "h-4 w-4 ml-2" })
                  ] })
                }
              ) }) : null,
              /* @__PURE__ */ jsxs("div", { className: "border-t border-gray-200 dark:border-gray-700 pt-4", children: [
                /* @__PURE__ */ jsx("ul", { className: "space-y-3", children: visibleFeatures.length > 0 ? visibleFeatures.map((feature, index) => /* @__PURE__ */ jsxs("li", { className: "flex items-start", children: [
                  /* @__PURE__ */ jsx(Check, { className: "h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" }),
                  /* @__PURE__ */ jsx("span", { className: "text-sm text-gray-700 dark:text-gray-300", children: feature })
                ] }, index)) : /* @__PURE__ */ jsx("li", { className: "text-sm text-gray-500 dark:text-gray-400", children: "All core features included" }) }),
                hasMoreFeatures && /* @__PURE__ */ jsx(
                  "button",
                  {
                    onClick: () => togglePlanExpansion(plan.id),
                    className: "mt-4 w-full text-sm font-medium text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 flex items-center justify-center gap-1 transition-colors",
                    children: isExpanded ? /* @__PURE__ */ jsxs(Fragment, { children: [
                      "Show Less",
                      /* @__PURE__ */ jsx(ChevronUp, { className: "h-4 w-4" })
                    ] }) : /* @__PURE__ */ jsxs(Fragment, { children: [
                      "Show ",
                      plan.features.length - FEATURES_TO_SHOW,
                      " More Features",
                      /* @__PURE__ */ jsx(ChevronDown, { className: "h-4 w-4" })
                    ] })
                  }
                )
              ] })
            ] })
          ]
        },
        plan.id
      );
    }) }),
    /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 md:grid-cols-3 gap-6 mb-16", children: [
      /* @__PURE__ */ jsxs("div", { className: "bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-xl p-6 text-center border border-blue-200 dark:border-blue-800", children: [
        /* @__PURE__ */ jsx("div", { className: "text-3xl mb-2", children: "🔒" }),
        /* @__PURE__ */ jsx("h3", { className: "font-semibold text-gray-900 dark:text-gray-100 mb-1", children: "Secure & Reliable" }),
        /* @__PURE__ */ jsx("p", { className: "text-sm text-gray-600 dark:text-gray-400", children: "Enterprise-grade security" })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "bg-gradient-to-r from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 rounded-xl p-6 text-center border border-green-200 dark:border-green-800", children: [
        /* @__PURE__ */ jsx("div", { className: "text-3xl mb-2", children: "⚡" }),
        /* @__PURE__ */ jsx("h3", { className: "font-semibold text-gray-900 dark:text-gray-100 mb-1", children: "No Credit Card" }),
        /* @__PURE__ */ jsx("p", { className: "text-sm text-gray-600 dark:text-gray-400", children: "Start free trial instantly" })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "bg-gradient-to-r from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 rounded-xl p-6 text-center border border-purple-200 dark:border-purple-800", children: [
        /* @__PURE__ */ jsx("div", { className: "text-3xl mb-2", children: "🔄" }),
        /* @__PURE__ */ jsx("h3", { className: "font-semibold text-gray-900 dark:text-gray-100 mb-1", children: "Cancel Anytime" }),
        /* @__PURE__ */ jsx("p", { className: "text-sm text-gray-600 dark:text-gray-400", children: "No long-term commitments" })
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg border border-gray-200 dark:border-gray-700", children: [
      /* @__PURE__ */ jsx("h2", { className: "text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6", children: "Frequently Asked Questions" }),
      /* @__PURE__ */ jsxs("div", { className: "space-y-4", children: [
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("h3", { className: "font-semibold text-gray-900 dark:text-gray-100 mb-2", children: "Can I change plans later?" }),
          /* @__PURE__ */ jsx("p", { className: "text-gray-600 dark:text-gray-400", children: "Yes, you can upgrade or downgrade your plan at any time. Changes take effect immediately." })
        ] }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("h3", { className: "font-semibold text-gray-900 dark:text-gray-100 mb-2", children: "What payment methods do you accept?" }),
          /* @__PURE__ */ jsx("p", { className: "text-gray-600 dark:text-gray-400", children: "We accept all major credit cards, debit cards, and UPI payments through Razorpay." })
        ] }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("h3", { className: "font-semibold text-gray-900 dark:text-gray-100 mb-2", children: "Is there a free trial?" }),
          /* @__PURE__ */ jsx("p", { className: "text-gray-600 dark:text-gray-400", children: "Yes! Most plans come with a free trial. No credit card required. Start exploring all features risk-free." })
        ] })
      ] }),
      /* @__PURE__ */ jsx("div", { className: "mt-6", children: /* @__PURE__ */ jsxs(
        Link,
        {
          href: route("faqs"),
          className: "text-blue-600 dark:text-blue-400 hover:underline font-medium inline-flex items-center gap-1",
          children: [
            "View all FAQs",
            /* @__PURE__ */ jsx(ArrowRight, { className: "h-4 w-4" })
          ]
        }
      ) })
    ] })
  ] }) });
}
export {
  Pricing as default
};
