import { jsxs, jsx } from "react/jsx-runtime";
import { Head, Link, router } from "@inertiajs/react";
import axios from "axios";
import { useState } from "react";
import { A as AppShell } from "./AppShell-B4peoZD-.js";
import { C as Card, b as CardHeader, c as CardTitle, d as CardDescription, a as CardContent } from "./Card-DLPTnTfC.js";
import { B as Badge } from "./Badge-CHx1ViYT.js";
import { B as Button } from "./Button-ymbdH_NY.js";
import { AlertTriangle, LayoutGrid, Table2, Crown, Check, X } from "lucide-react";
import { u as useToast } from "./useToast-DNfJQ6ZA.js";
import { u as useNotifications } from "./useNotifications-BFFaoN1-.js";
import "./utils-B2ZNUmII.js";
import "clsx";
import "tailwind-merge";
import "./RealtimeProvider-Dletx5Ny.js";
import "laravel-echo";
import "pusher-js";
import "./GlobalFlashHandler-CNoF0uzm.js";
import "./BrandingWrapper-B2Mh0bYb.js";
import "./Alert-DWa0cnrh.js";
import "./CookieConsentBanner-BJ5KL4CC.js";
import "./useConfirm-BKf7Nv1N.js";
function BillingPlans({
  account,
  plans,
  current_plan_key,
  current_modules = [],
  razorpay_enabled = false,
  razorpay_key_id = null
}) {
  const [switchingPlan, setSwitchingPlan] = useState(null);
  const [viewMode, setViewMode] = useState("cards");
  const { addToast } = useToast();
  const { confirm } = useNotifications();
  const razorpayEnabled = razorpay_enabled && Boolean(razorpay_key_id);
  const formatPrice = (price, currency) => {
    if (price === null) return "Custom Pricing";
    if (price === 0) return "Free";
    const major = price / 100;
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency,
      minimumFractionDigits: 0
    }).format(major);
  };
  const handleSwitchPlan = async (planKey) => {
    const isNewPlan = !current_plan_key;
    const plan = plans.find((p) => p.key === planKey);
    const trialDays = plan?.trial_days ?? 0;
    const confirmed = await confirm({
      title: isNewPlan ? "Select Plan" : "Switch Plan",
      message: isNewPlan ? `Are you sure you want to select the ${plan?.name ?? "this"} plan?${trialDays > 0 ? ` You'll start with a ${trialDays}-day free trial.` : ""}` : "Are you sure you want to switch to this plan?",
      variant: "info"
    });
    if (!confirmed) return;
    setSwitchingPlan(planKey);
    router.post(
      route("app.billing.switch-plan", {
        plan: planKey
      }),
      {},
      {
        onSuccess: () => {
          addToast({
            title: isNewPlan ? "Plan selected successfully" : "Plan changed successfully",
            description: isNewPlan ? "You can now use all features of the platform." : void 0,
            variant: "success"
          });
          router.reload({ only: ["plans", "current_plan_key"] });
        },
        onError: (errors) => {
          const errorMessage = errors?.plan || errors?.error || "Failed to change plan. Please try again.";
          addToast({
            title: isNewPlan ? "Failed to select plan" : "Failed to change plan",
            description: errorMessage,
            variant: "error"
          });
        },
        onFinish: () => setSwitchingPlan(null)
      }
    );
  };
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
    script.onload = () => {
      setTimeout(() => {
        if (window.Razorpay) {
          resolve();
        } else {
          reject(new Error("Razorpay failed to initialize"));
        }
      }, 100);
    };
    script.onerror = () => reject(new Error("Failed to load Razorpay script. Please check your internet connection."));
    document.head.appendChild(script);
  });
  const handleRazorpayCheckout = async (plan) => {
    const confirmed = await confirm({
      title: "Purchase Plan",
      message: `Proceed to pay for ${plan.name}?`,
      variant: "info"
    });
    if (!confirmed) return;
    if (!razorpayEnabled) {
      addToast({ title: "Razorpay is not configured", variant: "error" });
      return;
    }
    setSwitchingPlan(plan.key);
    try {
      await loadRazorpay();
      const orderUrl = route("app.billing.razorpay.order", { plan: plan.key });
      const orderResponse = await axios.post(orderUrl, {}, {
        headers: {
          "X-Requested-With": "XMLHttpRequest",
          "Accept": "application/json"
        }
      });
      if (!orderResponse.data) {
        throw new Error("Invalid response from server");
      }
      const { order_id, amount, currency, key_id } = orderResponse.data;
      if (!order_id || !amount || !key_id) {
        throw new Error("Missing required order data from server");
      }
      if (!window.Razorpay) {
        throw new Error("Razorpay script not loaded");
      }
      if (!order_id || !amount || !key_id) {
        throw new Error("Invalid order data received from server");
      }
      const normalizedKeyId = typeof key_id === "string" ? key_id.trim() : key_id;
      if (!normalizedKeyId) {
        throw new Error("Invalid Razorpay Key ID received from server");
      }
      const keyPattern = /^rzp_(test|live)_[A-Za-z0-9]+$/;
      if (!keyPattern.test(normalizedKeyId)) {
        throw new Error("Razorpay Key ID is invalid. Please verify the Key ID in platform settings.");
      }
      const orderAmount = typeof amount === "string" ? parseInt(amount, 10) : Number(amount);
      const options = {
        key: normalizedKeyId,
        amount: orderAmount,
        currency: currency || "INR",
        order_id,
        name: account.name || "Waify",
        description: plan.description || plan.name,
        handler: async (response) => {
          try {
            const confirmUrl = route("app.billing.razorpay.confirm");
            await axios.post(confirmUrl, {
              order_id: response.razorpay_order_id,
              payment_id: response.razorpay_payment_id,
              signature: response.razorpay_signature
            });
            addToast({ title: "Payment successful. Plan activated.", variant: "success" });
            router.reload({ only: ["plans", "current_plan_key", "flash"] });
          } catch (error) {
            const errorMsg = error?.response?.data?.message || error?.message || "Unknown error";
            addToast({
              title: "Payment captured, but activation failed.",
              description: errorMsg,
              variant: "error"
            });
          }
        },
        prefill: {
          name: account?.owner?.name || "",
          email: account?.owner?.email || ""
        },
        theme: {
          color: "#2563eb"
        },
        modal: {
          ondismiss: () => {
            setSwitchingPlan(null);
          }
        }
      };
      const originalWarn = console.warn;
      const originalError = console.error;
      const suppressRazorpayWarnings = () => {
        console.warn = (...args) => {
          const message = args.join(" ");
          if (message.includes("x-rtb-fingerprint-id") || message.includes("serviceworker") || message.includes("Refused to get unsafe header") || message.includes("Permissions policy violation") || message.includes("devicemotion events are blocked")) {
            return;
          }
          originalWarn.apply(console, args);
        };
        console.error = (...args) => {
          const message = args.join(" ");
          if (message.includes("x-rtb-fingerprint-id") || message.includes("serviceworker") || message.includes("Refused to get unsafe header") || message.includes("Permissions policy violation") || message.includes("devicemotion events are blocked")) {
            return;
          }
          originalError.apply(console, args);
        };
      };
      suppressRazorpayWarnings();
      const razorpay = new window.Razorpay(options);
      razorpay.on("payment.failed", (response) => {
        console.warn = originalWarn;
        console.error = originalError;
        addToast({
          title: "Payment failed",
          description: response.error?.description || response.error?.reason || "Payment could not be processed",
          variant: "error"
        });
        setSwitchingPlan(null);
      });
      razorpay.on("modal.close", () => {
        console.warn = originalWarn;
        console.error = originalError;
        setSwitchingPlan(null);
      });
      razorpay.on("error", (error) => {
        console.warn = originalWarn;
        console.error = originalError;
        console.error("Razorpay error:", error);
        addToast({
          title: "Payment gateway error",
          description: error?.description || error?.message || "An error occurred with the payment gateway. Please verify your Razorpay account configuration in the Razorpay dashboard.",
          variant: "error"
        });
        setSwitchingPlan(null);
      });
      try {
        razorpay.open();
        setTimeout(() => {
          console.warn = originalWarn;
          console.error = originalError;
        }, 2e3);
      } catch (error) {
        console.warn = originalWarn;
        console.error = originalError;
        console.error("Failed to open Razorpay:", error);
        addToast({
          title: "Failed to open payment gateway",
          description: error?.message || "Please check your Razorpay configuration in platform settings. If the issue persists, verify your Razorpay test account is properly configured.",
          variant: "error"
        });
        setSwitchingPlan(null);
      }
    } catch (error) {
      console.error("Razorpay checkout error:", error);
      const errorMessage = error?.response?.data?.message || error?.message || "Failed to start Razorpay checkout. Please try again.";
      addToast({
        title: "Failed to start Razorpay checkout",
        description: errorMessage,
        variant: "error"
      });
      setSwitchingPlan(null);
    }
  };
  const allModules = Array.from(new Set(plans.flatMap((p) => p.modules)));
  const formatLimit = (limit) => {
    if (limit === void 0) return "N/A";
    if (limit === -1 || limit === 9999 || limit === 9999999) return "Unlimited";
    return limit.toLocaleString();
  };
  const hasNoPlan = !current_plan_key;
  return /* @__PURE__ */ jsxs(AppShell, { children: [
    /* @__PURE__ */ jsx(Head, { title: "Available Plans" }),
    /* @__PURE__ */ jsxs("div", { className: "space-y-8", children: [
      hasNoPlan && /* @__PURE__ */ jsx("div", { className: "bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-6", children: /* @__PURE__ */ jsxs("div", { className: "flex items-start gap-4", children: [
        /* @__PURE__ */ jsx("div", { className: "p-2 bg-blue-500 rounded-lg", children: /* @__PURE__ */ jsx(AlertTriangle, { className: "h-6 w-6 text-white" }) }),
        /* @__PURE__ */ jsxs("div", { className: "flex-1", children: [
          /* @__PURE__ */ jsx("h3", { className: "text-lg font-bold text-gray-900 dark:text-gray-100 mb-2", children: "No Plan Selected" }),
          /* @__PURE__ */ jsx("p", { className: "text-sm text-gray-700 dark:text-gray-300 mb-4", children: "Your account doesn't have an active plan. Please select a plan below to continue using the platform. You can start with our free plan or choose a paid plan with a trial." })
        ] })
      ] }) }),
      /* @__PURE__ */ jsxs("div", { children: [
        !hasNoPlan && /* @__PURE__ */ jsx(
          Link,
          {
            href: route("app.billing.index", {}),
            className: "inline-flex items-center gap-2 text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors mb-4",
            children: "← Back to Billing"
          }
        ),
        /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between", children: [
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("h1", { className: "text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-gray-100 dark:to-gray-300 bg-clip-text text-transparent", children: hasNoPlan ? "Select Your Plan" : "Available Plans" }),
            /* @__PURE__ */ jsx("p", { className: "mt-2 text-sm text-gray-600 dark:text-gray-400", children: hasNoPlan ? "Choose a plan to get started with the platform" : "Choose the plan that fits your needs" })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "flex gap-2", children: [
            /* @__PURE__ */ jsxs(
              Button,
              {
                variant: viewMode === "cards" ? "primary" : "secondary",
                size: "sm",
                onClick: () => setViewMode("cards"),
                className: "rounded-xl",
                children: [
                  /* @__PURE__ */ jsx(LayoutGrid, { className: "h-4 w-4 mr-2" }),
                  "Cards"
                ]
              }
            ),
            /* @__PURE__ */ jsxs(
              Button,
              {
                variant: viewMode === "table" ? "primary" : "secondary",
                size: "sm",
                onClick: () => setViewMode("table"),
                className: "rounded-xl",
                children: [
                  /* @__PURE__ */ jsx(Table2, { className: "h-4 w-4 mr-2" }),
                  "Compare"
                ]
              }
            )
          ] })
        ] })
      ] }),
      viewMode === "cards" ? /* @__PURE__ */ jsx("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6", children: plans.map((plan) => /* @__PURE__ */ jsxs(
        Card,
        {
          className: `border-0 shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden ${plan.is_current ? "ring-2 ring-blue-500 dark:ring-blue-400 shadow-blue-500/20" : ""}`,
          children: [
            /* @__PURE__ */ jsx(CardHeader, { className: `pb-4 ${plan.is_current ? "bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20" : "bg-gradient-to-r from-gray-50 to-white dark:from-gray-800 dark:to-gray-900"}`, children: /* @__PURE__ */ jsxs("div", { className: "flex items-start justify-between mb-2", children: [
              /* @__PURE__ */ jsxs("div", { className: "flex-1", children: [
                /* @__PURE__ */ jsx(CardTitle, { className: "text-lg font-bold text-gray-900 dark:text-gray-100", children: plan.name }),
                plan.description && /* @__PURE__ */ jsx(CardDescription, { className: "mt-1 text-xs", children: plan.description })
              ] }),
              plan.is_current && /* @__PURE__ */ jsxs(Badge, { variant: "success", className: "px-3 py-1 flex items-center gap-1", children: [
                /* @__PURE__ */ jsx(Crown, { className: "h-3.5 w-3.5" }),
                "Current"
              ] })
            ] }) }),
            /* @__PURE__ */ jsxs(CardContent, { className: "p-6 space-y-5", children: [
              /* @__PURE__ */ jsxs("div", { children: [
                /* @__PURE__ */ jsx("div", { className: "text-3xl font-bold text-gray-900 dark:text-gray-100 mb-1", children: formatPrice(plan.price_monthly, plan.currency) }),
                /* @__PURE__ */ jsx("div", { className: "text-sm text-gray-500 dark:text-gray-400", children: "per month" }),
                plan.price_yearly && /* @__PURE__ */ jsxs("div", { className: "text-sm text-gray-500 dark:text-gray-400 mt-1", children: [
                  "or ",
                  formatPrice(plan.price_yearly, plan.currency),
                  "/year"
                ] })
              ] }),
              plan.warnings.length > 0 && /* @__PURE__ */ jsx("div", { className: "p-3 bg-gradient-to-r from-yellow-50 to-yellow-100 dark:from-yellow-900/20 dark:to-yellow-800/20 rounded-xl border border-yellow-200 dark:border-yellow-800", children: /* @__PURE__ */ jsxs("div", { className: "flex items-start gap-2", children: [
                /* @__PURE__ */ jsx(AlertTriangle, { className: "h-4 w-4 text-yellow-600 dark:text-yellow-400 mt-0.5 flex-shrink-0" }),
                /* @__PURE__ */ jsx("div", { className: "text-xs text-yellow-800 dark:text-yellow-200", children: plan.warnings.map((warning, idx) => /* @__PURE__ */ jsx("p", { children: warning }, idx)) })
              ] }) }),
              /* @__PURE__ */ jsxs("div", { className: "space-y-3", children: [
                /* @__PURE__ */ jsx("div", { className: "text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider", children: "Limits" }),
                /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
                  plan.limits.messages_monthly !== void 0 && /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between text-sm", children: [
                    /* @__PURE__ */ jsx("span", { className: "text-gray-600 dark:text-gray-400", children: "Messages:" }),
                    /* @__PURE__ */ jsxs("span", { className: "font-semibold text-gray-900 dark:text-gray-100", children: [
                      formatLimit(plan.limits.messages_monthly),
                      "/mo"
                    ] })
                  ] }),
                  plan.limits.template_sends_monthly !== void 0 && /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between text-sm", children: [
                    /* @__PURE__ */ jsx("span", { className: "text-gray-600 dark:text-gray-400", children: "Templates:" }),
                    /* @__PURE__ */ jsxs("span", { className: "font-semibold text-gray-900 dark:text-gray-100", children: [
                      formatLimit(plan.limits.template_sends_monthly),
                      "/mo"
                    ] })
                  ] }),
                  plan.limits.whatsapp_connections !== void 0 && /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between text-sm", children: [
                    /* @__PURE__ */ jsx("span", { className: "text-gray-600 dark:text-gray-400", children: "Connections:" }),
                    /* @__PURE__ */ jsx("span", { className: "font-semibold text-gray-900 dark:text-gray-100", children: formatLimit(plan.limits.whatsapp_connections) })
                  ] }),
                  plan.limits.agents !== void 0 && /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between text-sm", children: [
                    /* @__PURE__ */ jsx("span", { className: "text-gray-600 dark:text-gray-400", children: "Agents:" }),
                    /* @__PURE__ */ jsx("span", { className: "font-semibold text-gray-900 dark:text-gray-100", children: formatLimit(plan.limits.agents) })
                  ] })
                ] })
              ] }),
              /* @__PURE__ */ jsxs("div", { className: "space-y-3 pt-3 border-t border-gray-200 dark:border-gray-700", children: [
                /* @__PURE__ */ jsx("div", { className: "text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider", children: "Modules" }),
                plan.modules.length > 0 ? /* @__PURE__ */ jsx("div", { className: "space-y-1.5", children: plan.modules.map((module) => /* @__PURE__ */ jsxs(
                  "div",
                  {
                    className: "flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300",
                    children: [
                      /* @__PURE__ */ jsx(Check, { className: "h-4 w-4 text-green-600 dark:text-green-400 flex-shrink-0" }),
                      /* @__PURE__ */ jsx("span", { className: "text-xs", children: module.replace("automation.", "").replace(/\./g, " ").split(" ").map((word) => word.charAt(0).toUpperCase() + word.slice(1)).join(" ") })
                    ]
                  },
                  module
                )) }) : /* @__PURE__ */ jsx("p", { className: "text-sm text-gray-500 dark:text-gray-400", children: "No modules" })
              ] }),
              plan.trial_days > 0 && /* @__PURE__ */ jsxs("div", { className: "p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg text-xs text-blue-600 dark:text-blue-400 font-medium text-center", children: [
                plan.trial_days,
                "-day free trial"
              ] }),
              /* @__PURE__ */ jsx(
                Button,
                {
                  variant: plan.is_current ? "secondary" : "primary",
                  className: `w-full rounded-xl ${!plan.is_current ? "bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 shadow-lg shadow-blue-500/50" : ""}`,
                  disabled: plan.is_current || switchingPlan === plan.key || plan.price_monthly === null,
                  onClick: () => {
                    if (plan.price_monthly && plan.price_monthly > 0 && razorpayEnabled) {
                      handleRazorpayCheckout(plan);
                      return;
                    }
                    handleSwitchPlan(plan.key);
                  },
                  children: plan.is_current ? "Current Plan" : switchingPlan === plan.key ? "Switching..." : plan.price_monthly === null ? "Contact Sales" : plan.price_monthly > 0 && razorpayEnabled ? "Pay & Switch" : "Switch to this Plan"
                }
              )
            ] })
          ]
        },
        plan.key
      )) }) : /* @__PURE__ */ jsx(Card, { className: "border-0 shadow-lg", children: /* @__PURE__ */ jsx(CardContent, { className: "p-0", children: /* @__PURE__ */ jsx("div", { className: "overflow-x-auto", children: /* @__PURE__ */ jsxs("table", { className: "w-full", children: [
        /* @__PURE__ */ jsx("thead", { className: "bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 border-b border-gray-200 dark:border-gray-700", children: /* @__PURE__ */ jsxs("tr", { children: [
          /* @__PURE__ */ jsx("th", { className: "px-6 py-4 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider", children: "Feature" }),
          plans.map((plan) => /* @__PURE__ */ jsxs(
            "th",
            {
              className: `px-6 py-4 text-center ${plan.is_current ? "bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20" : ""}`,
              children: [
                /* @__PURE__ */ jsx("div", { className: "font-bold text-gray-900 dark:text-gray-100", children: plan.name }),
                /* @__PURE__ */ jsx("div", { className: "text-2xl font-bold text-gray-900 dark:text-gray-100 mt-2", children: formatPrice(plan.price_monthly, plan.currency) }),
                plan.is_current && /* @__PURE__ */ jsx(Badge, { variant: "success", className: "mt-2 px-3 py-1", children: "Current" })
              ]
            },
            plan.key
          ))
        ] }) }),
        /* @__PURE__ */ jsxs("tbody", { className: "divide-y divide-gray-200 dark:divide-gray-800 bg-white dark:bg-gray-900", children: [
          /* @__PURE__ */ jsxs("tr", { children: [
            /* @__PURE__ */ jsx("td", { className: "px-6 py-4 font-semibold text-gray-900 dark:text-gray-100", children: "Messages/month" }),
            plans.map((plan) => /* @__PURE__ */ jsx(
              "td",
              {
                className: `px-6 py-4 text-center text-sm font-medium ${plan.is_current ? "bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20" : ""}`,
                children: formatLimit(plan.limits.messages_monthly)
              },
              plan.key
            ))
          ] }),
          /* @__PURE__ */ jsxs("tr", { children: [
            /* @__PURE__ */ jsx("td", { className: "px-6 py-4 font-semibold text-gray-900 dark:text-gray-100", children: "Template sends/month" }),
            plans.map((plan) => /* @__PURE__ */ jsx(
              "td",
              {
                className: `px-6 py-4 text-center text-sm font-medium ${plan.is_current ? "bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20" : ""}`,
                children: formatLimit(plan.limits.template_sends_monthly)
              },
              plan.key
            ))
          ] }),
          /* @__PURE__ */ jsxs("tr", { children: [
            /* @__PURE__ */ jsx("td", { className: "px-6 py-4 font-semibold text-gray-900 dark:text-gray-100", children: "WhatsApp Connections" }),
            plans.map((plan) => /* @__PURE__ */ jsx(
              "td",
              {
                className: `px-6 py-4 text-center text-sm font-medium ${plan.is_current ? "bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20" : ""}`,
                children: formatLimit(plan.limits.whatsapp_connections)
              },
              plan.key
            ))
          ] }),
          /* @__PURE__ */ jsxs("tr", { children: [
            /* @__PURE__ */ jsx("td", { className: "px-6 py-4 font-semibold text-gray-900 dark:text-gray-100", children: "Agents" }),
            plans.map((plan) => /* @__PURE__ */ jsx(
              "td",
              {
                className: `px-6 py-4 text-center text-sm font-medium ${plan.is_current ? "bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20" : ""}`,
                children: formatLimit(plan.limits.agents)
              },
              plan.key
            ))
          ] }),
          allModules.map((module) => /* @__PURE__ */ jsxs("tr", { children: [
            /* @__PURE__ */ jsx("td", { className: "px-6 py-4 font-semibold text-gray-900 dark:text-gray-100", children: module.replace("automation.", "").replace(/\./g, " ").split(" ").map((word) => word.charAt(0).toUpperCase() + word.slice(1)).join(" ") }),
            plans.map((plan) => /* @__PURE__ */ jsx(
              "td",
              {
                className: `px-6 py-4 text-center ${plan.is_current ? "bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20" : ""}`,
                children: plan.modules.includes(module) ? /* @__PURE__ */ jsx(Check, { className: "h-5 w-5 text-green-600 dark:text-green-400 mx-auto" }) : /* @__PURE__ */ jsx(X, { className: "h-5 w-5 text-gray-300 dark:text-gray-700 mx-auto" })
              },
              plan.key
            ))
          ] }, module))
        ] })
      ] }) }) }) })
    ] })
  ] });
}
export {
  BillingPlans as default
};
