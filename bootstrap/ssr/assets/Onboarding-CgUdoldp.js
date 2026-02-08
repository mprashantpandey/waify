import { jsx, jsxs } from "react/jsx-runtime";
import { useForm } from "@inertiajs/react";
import { useState } from "react";
import { G as Guest } from "./GuestLayout-D8lrkWRg.js";
import { B as Button } from "./Button-ymbdH_NY.js";
import { T as TextInput } from "./TextInput-Dl1_GoEA.js";
import { I as InputLabel } from "./InputLabel-CE_n4Upz.js";
import { I as InputError } from "./InputError-DiSBWiye.js";
import { Sparkles, Check, Users, Crown, Building2, Zap } from "lucide-react";
import { C as Card, a as CardContent } from "./Card-DLPTnTfC.js";
import { B as Badge } from "./Badge-CHx1ViYT.js";
import "./BrandingWrapper-B2Mh0bYb.js";
import "./utils-B2ZNUmII.js";
import "clsx";
import "tailwind-merge";
function Onboarding({ plans = [], defaultPlanKey = "free" }) {
  const [selectedPlanKey, setSelectedPlanKey] = useState(defaultPlanKey);
  const { data, setData, post, processing, errors } = useForm({
    name: "",
    plan_key: defaultPlanKey
  });
  const handlePlanSelect = (planKey) => {
    setSelectedPlanKey(planKey);
    setData("plan_key", planKey);
  };
  const submit = (e) => {
    e.preventDefault();
    post(route("onboarding.store"));
  };
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
  return /* @__PURE__ */ jsx(Guest, { children: /* @__PURE__ */ jsxs("div", { className: "w-full max-w-6xl space-y-8", children: [
    /* @__PURE__ */ jsxs("div", { className: "text-center", children: [
      /* @__PURE__ */ jsxs("div", { className: "inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-full mb-4", children: [
        /* @__PURE__ */ jsx(Sparkles, { className: "h-4 w-4 text-blue-600 dark:text-blue-400" }),
        /* @__PURE__ */ jsx("span", { className: "text-sm font-semibold text-blue-600 dark:text-blue-400", children: "Choose Your Plan • Start Free Trial" })
      ] }),
      /* @__PURE__ */ jsx("h2", { className: "text-3xl md:text-4xl font-bold tracking-tight text-gray-900 dark:text-gray-100", children: "Create Your Account" }),
      /* @__PURE__ */ jsx("p", { className: "mt-2 text-sm text-gray-600 dark:text-gray-400", children: "Get started by creating your account and selecting a plan" })
    ] }),
    plans.length > 0 && /* @__PURE__ */ jsx("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6", children: plans.map((plan) => {
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
              /* @__PURE__ */ jsx("div", { className: "text-3xl font-bold text-gray-900 dark:text-gray-100", children: formatPrice(plan.price_monthly, plan.currency) }),
              /* @__PURE__ */ jsx("div", { className: "text-sm text-gray-500 dark:text-gray-400", children: "per month" })
            ] }),
            plan.trial_days > 0 && /* @__PURE__ */ jsxs(Badge, { variant: "success", className: "mb-4", children: [
              plan.trial_days,
              "-Day Free Trial"
            ] }),
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
    /* @__PURE__ */ jsx("form", { className: "space-y-6", onSubmit: submit, children: /* @__PURE__ */ jsx(Card, { children: /* @__PURE__ */ jsxs(CardContent, { className: "p-6 space-y-4", children: [
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx(InputLabel, { htmlFor: "name", value: "Account Name" }),
        /* @__PURE__ */ jsx(
          TextInput,
          {
            id: "name",
            type: "text",
            value: data.name,
            className: "mt-1 block w-full",
            onChange: (e) => setData("name", e.target.value),
            required: true,
            autoFocus: true,
            placeholder: "Enter your account name"
          }
        ),
        /* @__PURE__ */ jsx(InputError, { message: errors.name, className: "mt-2" })
      ] }),
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx(Button, { type: "submit", className: "w-full", disabled: processing || !data.name.trim(), children: processing ? "Creating Account..." : "Create Account & Start Trial" }),
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
