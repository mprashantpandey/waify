import { jsxs, jsx } from "react/jsx-runtime";
import { usePage, Head, router, useForm, Link } from "@inertiajs/react";
import { useState, useEffect, useMemo } from "react";
import { Plus, Users, IndianRupee, Globe2, CreditCard, Pencil, Eye, Archive, Layers3, Sparkles, Check } from "lucide-react";
import { P as PlatformShell } from "./PlatformShell-BDgjSKtX.js";
import { C as Card, a as CardContent } from "./Card-BtIXZ0GS.js";
import { B as Button } from "./Button-BJftGNki.js";
import { B as Badge } from "./Badge-C65MHc2S.js";
import { D as Drawer } from "./Elements-EbyZDnT_.js";
import { u as useToast } from "./useToast-BN7qsQL3.js";
import { c as cn } from "./utils-B2ZNUmII.js";
import "axios";
import "./BrandingWrapper-CZn0jBQL.js";
import "@headlessui/react";
import "clsx";
import "tailwind-merge";
function formatMoney(amount, currency) {
  if (amount === null || amount === void 0) {
    return "Custom";
  }
  if (amount === 0) {
    return "₹0";
  }
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: currency || "INR",
    maximumFractionDigits: 0
  }).format(amount / 100);
}
function compactNumber(value) {
  return new Intl.NumberFormat("en-IN", { maximumFractionDigits: 1, notation: "compact" }).format(value);
}
function InfoBanner() {
  return /* @__PURE__ */ jsxs("div", { className: "flex items-start gap-3 rounded-card border border-sky-100 bg-sky-50 px-4 py-3 text-sm text-sky-900 dark:border-sky-400/20 dark:bg-sky-500/10 dark:text-sky-100", children: [
    /* @__PURE__ */ jsx("div", { className: "mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-btn bg-white text-sky-600 shadow-sm dark:bg-sky-400/15 dark:text-sky-100", children: /* @__PURE__ */ jsx(Sparkles, { className: "h-4 w-4" }) }),
    /* @__PURE__ */ jsxs("div", { children: [
      /* @__PURE__ */ jsx("p", { className: "font-semibold", children: "Plans control checkout pricing, entitlements, and workspace limits." }),
      /* @__PURE__ */ jsx("p", { className: "mt-1 text-xs text-sky-700 dark:text-sky-200/80", children: "Changes use the existing billing rules and apply wherever the plan is consumed by subscriptions." })
    ] })
  ] });
}
function StatCard({
  label,
  value,
  sub,
  icon: Icon
}) {
  return /* @__PURE__ */ jsx(Card, { children: /* @__PURE__ */ jsxs(CardContent, { className: "flex items-center gap-4 p-4", children: [
    /* @__PURE__ */ jsx("div", { className: "flex h-11 w-11 shrink-0 items-center justify-center rounded-btn bg-emerald-50 text-waify-green dark:bg-emerald-400/10 dark:text-emerald-200", children: /* @__PURE__ */ jsx(Icon, { className: "h-5 w-5" }) }),
    /* @__PURE__ */ jsxs("div", { className: "min-w-0", children: [
      /* @__PURE__ */ jsx("p", { className: "text-xs font-medium uppercase tracking-[0.12em] text-waify-text-muted dark:text-waify-dark-text-muted", children: label }),
      /* @__PURE__ */ jsx("p", { className: "mt-1 text-2xl font-bold tabular-nums text-waify-text dark:text-waify-dark-text", children: value }),
      /* @__PURE__ */ jsx("p", { className: "mt-0.5 truncate text-xs text-waify-text-muted dark:text-waify-dark-text-muted", children: sub })
    ] })
  ] }) });
}
function PlanFeatures({ plan }) {
  const features = [
    `${plan.trial_days || 0} day trial window`,
    plan.price_monthly === null ? "Custom monthly checkout" : `${formatMoney(plan.price_monthly, plan.currency)} monthly checkout`,
    plan.price_yearly === null ? "Custom annual checkout" : `${formatMoney(plan.price_yearly, plan.currency)} annual checkout`,
    plan.is_public ? "Visible on public pricing" : "Private/admin-assigned only"
  ];
  return /* @__PURE__ */ jsx("ul", { className: "min-h-[132px] space-y-2 px-5 py-4 text-sm text-waify-text dark:text-waify-dark-text", children: features.map((feature) => /* @__PURE__ */ jsxs("li", { className: "flex items-start gap-2", children: [
    /* @__PURE__ */ jsx(Check, { className: "mt-0.5 h-4 w-4 shrink-0 text-waify-green dark:text-emerald-300" }),
    /* @__PURE__ */ jsx("span", { children: feature })
  ] }, feature)) });
}
const defaultLimits = {
  agents: 1,
  whatsapp_connections: 1,
  messages_monthly: 500,
  template_sends_monthly: 0,
  ai_credits_monthly: 0,
  retention_days: 30
};
function PlanFormDrawer({
  mode,
  open,
  plan,
  modules,
  defaultCurrency,
  onClose
}) {
  const form = useForm({
    key: plan?.key || "",
    name: plan?.name || "",
    description: plan?.description || "",
    price_monthly: plan?.price_monthly ?? null,
    price_yearly: plan?.price_yearly ?? null,
    is_active: plan?.is_active ?? true,
    is_public: plan?.is_public ?? true,
    trial_days: plan?.trial_days ?? 0,
    sort_order: plan?.sort_order ?? 0,
    limits: { ...defaultLimits, ...plan?.limits || {} },
    modules: plan?.modules || []
  });
  useEffect(() => {
    form.setData({
      key: plan?.key || "",
      name: plan?.name || "",
      description: plan?.description || "",
      price_monthly: plan?.price_monthly ?? null,
      price_yearly: plan?.price_yearly ?? null,
      is_active: plan?.is_active ?? true,
      is_public: plan?.is_public ?? true,
      trial_days: plan?.trial_days ?? 0,
      sort_order: plan?.sort_order ?? 0,
      limits: { ...defaultLimits, ...plan?.limits || {} },
      modules: plan?.modules || []
    });
  }, [plan?.id, open, mode]);
  const toggleModule = (moduleKey) => {
    form.setData("modules", form.data.modules.includes(moduleKey) ? form.data.modules.filter((key) => key !== moduleKey) : [...form.data.modules, moduleKey]);
  };
  const updateLimit = (key, value) => {
    form.setData("limits", {
      ...form.data.limits,
      [key]: value === "" || value === "-1" ? -1 : parseInt(value, 10) || 0
    });
  };
  const submit = (event) => {
    event.preventDefault();
    if (mode === "edit" && plan) {
      form.patch(route("platform.plans.update", { plan: plan.key }), {
        preserveScroll: true,
        onSuccess: onClose
      });
      return;
    }
    form.post(route("platform.plans.store"), {
      preserveScroll: true,
      onSuccess: onClose
    });
  };
  return /* @__PURE__ */ jsx(
    Drawer,
    {
      open,
      onClose,
      title: mode === "edit" ? `Edit ${plan?.name || "plan"}` : "Create plan",
      description: `Prices use ${defaultCurrency}. Enter values in the smallest unit, for example 99900 for 999.`,
      className: "sm:max-w-5xl",
      footer: /* @__PURE__ */ jsxs("div", { className: "flex justify-end gap-2", children: [
        /* @__PURE__ */ jsx(Button, { type: "button", variant: "secondary", onClick: onClose, children: "Cancel" }),
        /* @__PURE__ */ jsx(Button, { type: "submit", form: "platform-plan-form", disabled: form.processing, children: form.processing ? "Saving..." : mode === "edit" ? "Save plan" : "Create plan" })
      ] }),
      children: /* @__PURE__ */ jsxs("form", { id: "platform-plan-form", onSubmit: submit, className: "space-y-5", children: [
        /* @__PURE__ */ jsxs("div", { className: "grid gap-4 md:grid-cols-2", children: [
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("label", { className: "mb-1.5 block text-sm font-medium text-waify-text dark:text-waify-dark-text", children: "Plan key" }),
            /* @__PURE__ */ jsx(
              "input",
              {
                value: form.data.key,
                onChange: (event) => form.setData("key", event.target.value),
                disabled: mode === "edit",
                placeholder: "growth",
                className: "waify-input"
              }
            ),
            form.errors.key && /* @__PURE__ */ jsx("p", { className: "mt-1 text-xs text-red-600 dark:text-red-300", children: form.errors.key })
          ] }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("label", { className: "mb-1.5 block text-sm font-medium text-waify-text dark:text-waify-dark-text", children: "Plan name" }),
            /* @__PURE__ */ jsx("input", { value: form.data.name, onChange: (event) => form.setData("name", event.target.value), placeholder: "Growth", className: "waify-input" }),
            form.errors.name && /* @__PURE__ */ jsx("p", { className: "mt-1 text-xs text-red-600 dark:text-red-300", children: form.errors.name })
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("label", { className: "mb-1.5 block text-sm font-medium text-waify-text dark:text-waify-dark-text", children: "Description" }),
          /* @__PURE__ */ jsx("textarea", { value: form.data.description, onChange: (event) => form.setData("description", event.target.value), rows: 3, className: "waify-input min-h-24 py-2" })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "grid gap-4 md:grid-cols-4", children: [
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("label", { className: "mb-1.5 block text-sm font-medium text-waify-text dark:text-waify-dark-text", children: "Monthly price" }),
            /* @__PURE__ */ jsx("input", { type: "number", min: "0", value: form.data.price_monthly ?? "", onChange: (event) => form.setData("price_monthly", event.target.value ? Number(event.target.value) : null), className: "waify-input" })
          ] }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("label", { className: "mb-1.5 block text-sm font-medium text-waify-text dark:text-waify-dark-text", children: "Yearly price" }),
            /* @__PURE__ */ jsx("input", { type: "number", min: "0", value: form.data.price_yearly ?? "", onChange: (event) => form.setData("price_yearly", event.target.value ? Number(event.target.value) : null), className: "waify-input" })
          ] }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("label", { className: "mb-1.5 block text-sm font-medium text-waify-text dark:text-waify-dark-text", children: "Trial days" }),
            /* @__PURE__ */ jsx("input", { type: "number", min: "0", value: form.data.trial_days, onChange: (event) => form.setData("trial_days", Number(event.target.value) || 0), className: "waify-input" })
          ] }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("label", { className: "mb-1.5 block text-sm font-medium text-waify-text dark:text-waify-dark-text", children: "Sort order" }),
            /* @__PURE__ */ jsx("input", { type: "number", min: "0", value: form.data.sort_order, onChange: (event) => form.setData("sort_order", Number(event.target.value) || 0), className: "waify-input" })
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "grid gap-3 md:grid-cols-2", children: [
          /* @__PURE__ */ jsxs("label", { className: "flex items-center justify-between rounded-card border border-gray-100 p-3 dark:border-waify-dark-border", children: [
            /* @__PURE__ */ jsxs("span", { children: [
              /* @__PURE__ */ jsx("span", { className: "block text-sm font-medium text-waify-text dark:text-waify-dark-text", children: "Active" }),
              /* @__PURE__ */ jsx("span", { className: "text-xs text-waify-text-muted dark:text-waify-dark-text-muted", children: "Available for new and existing subscription operations." })
            ] }),
            /* @__PURE__ */ jsx("input", { type: "checkbox", checked: form.data.is_active, onChange: (event) => form.setData("is_active", event.target.checked), className: "rounded border-gray-300 text-waify-green focus:ring-waify-green/30" })
          ] }),
          /* @__PURE__ */ jsxs("label", { className: "flex items-center justify-between rounded-card border border-gray-100 p-3 dark:border-waify-dark-border", children: [
            /* @__PURE__ */ jsxs("span", { children: [
              /* @__PURE__ */ jsx("span", { className: "block text-sm font-medium text-waify-text dark:text-waify-dark-text", children: "Public" }),
              /* @__PURE__ */ jsx("span", { className: "text-xs text-waify-text-muted dark:text-waify-dark-text-muted", children: "Visible on customer pricing and billing screens." })
            ] }),
            /* @__PURE__ */ jsx("input", { type: "checkbox", checked: form.data.is_public, onChange: (event) => form.setData("is_public", event.target.checked), className: "rounded border-gray-300 text-waify-green focus:ring-waify-green/30" })
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("p", { className: "mb-3 text-sm font-semibold text-waify-text dark:text-waify-dark-text", children: "Limits" }),
          /* @__PURE__ */ jsx("div", { className: "grid gap-3 md:grid-cols-3", children: Object.entries(form.data.limits).map(([key, value]) => /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("label", { className: "mb-1.5 block text-xs font-medium capitalize text-waify-text-muted dark:text-waify-dark-text-muted", children: key.replaceAll("_", " ") }),
            /* @__PURE__ */ jsx("input", { type: "number", value: value === -1 ? "" : value, onChange: (event) => updateLimit(key, event.target.value), placeholder: "-1 for unlimited", className: "waify-input" })
          ] }, key)) }),
          form.errors.limits && /* @__PURE__ */ jsx("p", { className: "mt-2 text-xs text-red-600 dark:text-red-300", children: form.errors.limits })
        ] }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("p", { className: "mb-3 text-sm font-semibold text-waify-text dark:text-waify-dark-text", children: "Included modules" }),
          /* @__PURE__ */ jsx("div", { className: "grid gap-2 md:grid-cols-2 xl:grid-cols-3", children: modules.map((module) => /* @__PURE__ */ jsxs("label", { className: "flex cursor-pointer items-center gap-2 rounded-card border border-gray-100 p-3 transition hover:bg-gray-50 dark:border-waify-dark-border dark:hover:bg-waify-dark-surface-2", children: [
            /* @__PURE__ */ jsx("input", { type: "checkbox", checked: form.data.modules.includes(module.key), onChange: () => toggleModule(module.key), className: "rounded border-gray-300 text-waify-green focus:ring-waify-green/30" }),
            /* @__PURE__ */ jsx("span", { className: "text-sm font-medium text-waify-text dark:text-waify-dark-text", children: module.name })
          ] }, module.id)) }),
          form.errors.modules && /* @__PURE__ */ jsx("p", { className: "mt-2 text-xs text-red-600 dark:text-red-300", children: form.errors.modules })
        ] })
      ] })
    }
  );
}
function PlanDetailDrawer({
  plan,
  moduleNames,
  onClose,
  onEdit
}) {
  if (!plan) return null;
  return /* @__PURE__ */ jsx(Drawer, { open: !!plan, onClose, title: plan.name, description: "Plan pricing, entitlements, limits, and current workspace subscriptions.", className: "sm:max-w-5xl", children: /* @__PURE__ */ jsxs("div", { className: "space-y-5", children: [
    /* @__PURE__ */ jsxs("div", { className: "grid gap-4 sm:grid-cols-4", children: [
      /* @__PURE__ */ jsx(StatCard, { label: "Monthly", value: formatMoney(plan.price_monthly, plan.currency), sub: "Checkout price", icon: CreditCard }),
      /* @__PURE__ */ jsx(StatCard, { label: "Annual", value: formatMoney(plan.price_yearly, plan.currency), sub: "Checkout price", icon: CreditCard }),
      /* @__PURE__ */ jsx(StatCard, { label: "Trial", value: `${plan.trial_days || 0}d`, sub: "Trial window", icon: Sparkles }),
      /* @__PURE__ */ jsx(StatCard, { label: "Subscribers", value: plan.subscriptions_count, sub: "Current workspaces", icon: Users })
    ] }),
    /* @__PURE__ */ jsx(Card, { children: /* @__PURE__ */ jsxs(CardContent, { className: "p-5", children: [
      /* @__PURE__ */ jsxs("div", { className: "mb-3 flex items-center justify-between gap-3", children: [
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("p", { className: "font-semibold text-waify-text dark:text-waify-dark-text", children: "Plan configuration" }),
          /* @__PURE__ */ jsx("p", { className: "text-sm text-waify-text-muted dark:text-waify-dark-text-muted", children: plan.description || "No description added." })
        ] }),
        /* @__PURE__ */ jsxs(Button, { type: "button", onClick: onEdit, children: [
          /* @__PURE__ */ jsx(Pencil, { className: "h-4 w-4" }),
          "Edit"
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "grid gap-3 md:grid-cols-2", children: [
        /* @__PURE__ */ jsxs("div", { className: "rounded-card bg-gray-50 p-3 dark:bg-waify-dark-surface-2", children: [
          /* @__PURE__ */ jsx("p", { className: "text-xs text-waify-text-muted dark:text-waify-dark-text-muted", children: "Visibility" }),
          /* @__PURE__ */ jsxs("div", { className: "mt-2 flex gap-2", children: [
            /* @__PURE__ */ jsx(Badge, { variant: plan.is_active ? "success" : "default", children: plan.is_active ? "Active" : "Archived" }),
            /* @__PURE__ */ jsx(Badge, { variant: plan.is_public ? "info" : "default", children: plan.is_public ? "Public" : "Private" })
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "rounded-card bg-gray-50 p-3 dark:bg-waify-dark-surface-2", children: [
          /* @__PURE__ */ jsx("p", { className: "text-xs text-waify-text-muted dark:text-waify-dark-text-muted", children: "Included modules" }),
          /* @__PURE__ */ jsx("div", { className: "mt-2 flex flex-wrap gap-1.5", children: plan.modules?.length ? plan.modules.map((key) => /* @__PURE__ */ jsx(Badge, { variant: "secondary", children: moduleNames[key] || key }, key)) : /* @__PURE__ */ jsx("span", { className: "text-sm text-waify-text-muted dark:text-waify-dark-text-muted", children: "No modules" }) })
        ] })
      ] })
    ] }) }),
    /* @__PURE__ */ jsxs("div", { className: "grid gap-4 lg:grid-cols-[1fr,360px]", children: [
      /* @__PURE__ */ jsx(Card, { children: /* @__PURE__ */ jsxs(CardContent, { className: "p-5", children: [
        /* @__PURE__ */ jsx("p", { className: "font-semibold text-waify-text dark:text-waify-dark-text", children: "Limits" }),
        /* @__PURE__ */ jsx("div", { className: "mt-4 grid gap-3 sm:grid-cols-2", children: Object.entries(plan.limits || {}).map(([key, value]) => /* @__PURE__ */ jsxs("div", { className: "rounded-card border border-gray-100 bg-gray-50/80 p-3 dark:border-waify-dark-border dark:bg-waify-dark-surface-2", children: [
          /* @__PURE__ */ jsx("p", { className: "text-xs capitalize text-waify-text-muted dark:text-waify-dark-text-muted", children: key.replaceAll("_", " ") }),
          /* @__PURE__ */ jsx("p", { className: "mt-1 font-semibold text-waify-text dark:text-waify-dark-text", children: value === -1 ? "Unlimited" : compactNumber(value) })
        ] }, key)) })
      ] }) }),
      /* @__PURE__ */ jsx(Card, { children: /* @__PURE__ */ jsxs(CardContent, { className: "p-5", children: [
        /* @__PURE__ */ jsx("p", { className: "font-semibold text-waify-text dark:text-waify-dark-text", children: "Subscriptions" }),
        /* @__PURE__ */ jsx("div", { className: "mt-4 space-y-2", children: plan.subscriptions?.length ? plan.subscriptions.map((subscription) => /* @__PURE__ */ jsxs(Link, { href: route("platform.accounts.show", { account: subscription.account.id }), className: "block rounded-card border border-gray-100 p-3 transition hover:bg-gray-50 dark:border-waify-dark-border dark:hover:bg-waify-dark-surface-2", children: [
          /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between gap-2", children: [
            /* @__PURE__ */ jsx("span", { className: "truncate text-sm font-medium text-waify-text dark:text-waify-dark-text", children: subscription.account.name }),
            /* @__PURE__ */ jsx(Badge, { variant: subscription.status === "active" ? "success" : "default", children: subscription.status })
          ] }),
          /* @__PURE__ */ jsx("p", { className: "mt-1 text-xs text-waify-text-muted dark:text-waify-dark-text-muted", children: subscription.account.slug })
        ] }, subscription.id)) : /* @__PURE__ */ jsx("div", { className: "rounded-card bg-gray-50 p-4 text-center text-sm text-waify-text-muted dark:bg-waify-dark-surface-2 dark:text-waify-dark-text-muted", children: "No subscriptions yet." }) })
      ] }) })
    ] })
  ] }) });
}
function PlansIndex({ plans, modules = [], moduleNames = {}, selectedPlan = null, default_currency = "INR" }) {
  const { auth } = usePage().props;
  const { addToast } = useToast();
  const [togglePlan, setTogglePlan] = useState(null);
  const [createOpen, setCreateOpen] = useState(() => new URLSearchParams(window.location.search).get("panel") === "create");
  const [editPlan, setEditPlan] = useState(() => new URLSearchParams(window.location.search).get("panel") === "edit" ? selectedPlan || null : null);
  const [activePlan, setActivePlan] = useState(selectedPlan || null);
  useEffect(() => {
    setActivePlan(selectedPlan || null);
    if (new URLSearchParams(window.location.search).get("panel") === "edit") {
      setEditPlan(selectedPlan || null);
    }
  }, [selectedPlan]);
  const closePlanPanels = () => {
    setCreateOpen(false);
    setEditPlan(null);
    setActivePlan(null);
    router.get(route("platform.plans.index"), {}, { preserveScroll: true, preserveState: true, replace: true });
  };
  const metrics = useMemo(() => {
    const totalSubscribers = plans.reduce((sum, plan) => sum + plan.subscriptions_count, 0);
    const publicPlans = plans.filter((plan) => plan.is_public).length;
    const activePlans = plans.filter((plan) => plan.is_active).length;
    const monthlyEstimate = plans.reduce((sum, plan) => sum + (plan.price_monthly || 0) * plan.subscriptions_count, 0);
    const mostUsedCount = Math.max(0, ...plans.map((plan) => plan.subscriptions_count));
    return { totalSubscribers, publicPlans, activePlans, monthlyEstimate, mostUsedCount };
  }, [plans]);
  const confirmToggle = () => {
    if (!togglePlan) {
      return;
    }
    router.post(
      route("platform.plans.toggle", { plan: togglePlan.key }),
      {},
      {
        preserveScroll: true,
        onSuccess: () => {
          addToast({
            title: "Plan updated",
            description: `${togglePlan.name} is now ${togglePlan.is_active ? "archived" : "active"}.`,
            variant: "success"
          });
          setTogglePlan(null);
        },
        onError: () => {
          addToast({
            title: "Plan update failed",
            description: "The platform could not update this plan status.",
            variant: "error"
          });
        }
      }
    );
  };
  return /* @__PURE__ */ jsxs(PlatformShell, { auth, children: [
    /* @__PURE__ */ jsx(Head, { title: "Plans" }),
    /* @__PURE__ */ jsxs("div", { className: "space-y-6", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex flex-wrap items-center justify-between gap-3", children: [
        /* @__PURE__ */ jsx("div", { className: "min-w-[280px] flex-1", children: /* @__PURE__ */ jsx(InfoBanner, {}) }),
        /* @__PURE__ */ jsxs(Button, { type: "button", onClick: () => setCreateOpen(true), children: [
          /* @__PURE__ */ jsx(Plus, { className: "h-4 w-4" }),
          "Create plan"
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "grid gap-4 sm:grid-cols-3", children: [
        /* @__PURE__ */ jsx(StatCard, { label: "Total subscribers", value: metrics.totalSubscribers.toLocaleString("en-IN"), sub: "Across all plans", icon: Users }),
        /* @__PURE__ */ jsx(
          StatCard,
          {
            label: "Monthly estimate",
            value: formatMoney(metrics.monthlyEstimate, default_currency),
            sub: "Based on current subscriptions",
            icon: IndianRupee
          }
        ),
        /* @__PURE__ */ jsx(StatCard, { label: "Public plans", value: `${metrics.publicPlans}/${plans.length}`, sub: `${metrics.activePlans} active plans`, icon: Globe2 })
      ] }),
      plans.length === 0 ? /* @__PURE__ */ jsx(Card, { children: /* @__PURE__ */ jsxs(CardContent, { className: "py-16 text-center", children: [
        /* @__PURE__ */ jsx("div", { className: "mx-auto flex h-14 w-14 items-center justify-center rounded-card bg-emerald-50 text-waify-green dark:bg-emerald-400/10 dark:text-emerald-200", children: /* @__PURE__ */ jsx(CreditCard, { className: "h-7 w-7" }) }),
        /* @__PURE__ */ jsx("h3", { className: "mt-4 text-lg font-semibold text-waify-text dark:text-waify-dark-text", children: "No plans yet" }),
        /* @__PURE__ */ jsx("p", { className: "mx-auto mt-2 max-w-md text-sm text-waify-text-muted dark:text-waify-dark-text-muted", children: "Create your first plan to power subscriptions, workspace billing, and public checkout." }),
        /* @__PURE__ */ jsxs(Button, { type: "button", className: "mt-5", onClick: () => setCreateOpen(true), children: [
          /* @__PURE__ */ jsx(Plus, { className: "h-4 w-4" }),
          "Create plan"
        ] })
      ] }) }) : /* @__PURE__ */ jsx("div", { className: "grid gap-4 lg:grid-cols-2 xl:grid-cols-4", children: plans.map((plan) => {
        const isMostUsed = metrics.mostUsedCount > 0 && plan.subscriptions_count === metrics.mostUsedCount;
        return /* @__PURE__ */ jsxs(
          Card,
          {
            className: cn("overflow-hidden", isMostUsed && "ring-2 ring-waify-green dark:ring-emerald-300/70"),
            children: [
              /* @__PURE__ */ jsxs("div", { className: "border-b border-gray-100 p-5 dark:border-waify-dark-border", children: [
                /* @__PURE__ */ jsxs("div", { className: "flex items-start justify-between gap-3", children: [
                  /* @__PURE__ */ jsxs("div", { className: "min-w-0", children: [
                    isMostUsed && /* @__PURE__ */ jsx(Badge, { variant: "success", className: "mb-2", children: "Most used" }),
                    /* @__PURE__ */ jsx("h3", { className: "truncate text-lg font-bold text-waify-text dark:text-waify-dark-text", children: plan.name }),
                    /* @__PURE__ */ jsxs("p", { className: "mt-1 text-2xl font-bold tabular-nums text-waify-text dark:text-waify-dark-text", children: [
                      formatMoney(plan.price_monthly, plan.currency),
                      !!plan.price_monthly && /* @__PURE__ */ jsx("span", { className: "text-sm font-normal text-waify-text-muted dark:text-waify-dark-text-muted", children: "/mo" })
                    ] })
                  ] }),
                  /* @__PURE__ */ jsx(Badge, { variant: plan.is_active ? "success" : "default", children: plan.is_active ? "Active" : "Archived" })
                ] }),
                /* @__PURE__ */ jsx("p", { className: "mt-2 line-clamp-2 min-h-[32px] text-xs text-waify-text-muted dark:text-waify-dark-text-muted", children: plan.description || "No public description has been added to this plan." })
              ] }),
              /* @__PURE__ */ jsx(PlanFeatures, { plan }),
              /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-3 gap-2 border-t border-gray-100 bg-gray-50/80 px-5 py-3 text-center text-xs dark:border-waify-dark-border dark:bg-waify-dark-surface-2/60", children: [
                /* @__PURE__ */ jsxs("div", { children: [
                  /* @__PURE__ */ jsx("div", { className: "font-semibold tabular-nums text-waify-text dark:text-waify-dark-text", children: formatMoney(plan.price_monthly, plan.currency) }),
                  /* @__PURE__ */ jsx("div", { className: "text-waify-text-muted dark:text-waify-dark-text-muted", children: "Monthly" })
                ] }),
                /* @__PURE__ */ jsxs("div", { children: [
                  /* @__PURE__ */ jsx("div", { className: "font-semibold tabular-nums text-waify-text dark:text-waify-dark-text", children: formatMoney(plan.price_yearly, plan.currency) }),
                  /* @__PURE__ */ jsx("div", { className: "text-waify-text-muted dark:text-waify-dark-text-muted", children: "Annual" })
                ] }),
                /* @__PURE__ */ jsxs("div", { children: [
                  /* @__PURE__ */ jsx("div", { className: "font-semibold tabular-nums text-waify-text dark:text-waify-dark-text", children: compactNumber(plan.subscriptions_count) }),
                  /* @__PURE__ */ jsx("div", { className: "text-waify-text-muted dark:text-waify-dark-text-muted", children: "Subs" })
                ] })
              ] }),
              /* @__PURE__ */ jsxs("div", { className: "flex flex-wrap gap-2 border-t border-gray-100 p-4 dark:border-waify-dark-border", children: [
                /* @__PURE__ */ jsxs(Button, { size: "sm", variant: "secondary", onClick: () => {
                  router.get(route("platform.plans.index"), { plan: plan.key, panel: "edit" }, { preserveScroll: true, preserveState: true, replace: true });
                }, children: [
                  /* @__PURE__ */ jsx(Pencil, { className: "h-4 w-4" }),
                  "Edit"
                ] }),
                /* @__PURE__ */ jsxs(Button, { size: "sm", variant: "ghost", onClick: () => {
                  router.get(route("platform.plans.index"), { plan: plan.key }, { preserveScroll: true, preserveState: true, replace: true });
                }, children: [
                  /* @__PURE__ */ jsx(Eye, { className: "h-4 w-4" }),
                  "View"
                ] }),
                /* @__PURE__ */ jsxs(Button, { size: "sm", variant: plan.is_active ? "danger" : "secondary", onClick: () => setTogglePlan(plan), children: [
                  /* @__PURE__ */ jsx(Archive, { className: "h-4 w-4" }),
                  plan.is_active ? "Archive" : "Activate"
                ] })
              ] })
            ]
          },
          plan.id
        );
      }) }),
      plans.length > 0 && /* @__PURE__ */ jsxs(Card, { className: "overflow-hidden", children: [
        /* @__PURE__ */ jsx("div", { className: "border-b border-gray-100 px-5 py-4 dark:border-waify-dark-border", children: /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
          /* @__PURE__ */ jsx(Layers3, { className: "h-4 w-4 text-waify-green dark:text-emerald-300" }),
          /* @__PURE__ */ jsx("h3", { className: "text-sm font-semibold text-waify-text dark:text-waify-dark-text", children: "Plan limits matrix" })
        ] }) }),
        /* @__PURE__ */ jsx("div", { className: "overflow-x-auto", children: /* @__PURE__ */ jsxs("table", { className: "w-full text-sm", children: [
          /* @__PURE__ */ jsx("thead", { children: /* @__PURE__ */ jsxs("tr", { className: "border-b border-gray-100 bg-gray-50/60 text-left text-xs uppercase text-waify-text-muted dark:border-waify-dark-border dark:bg-waify-dark-surface-2/40 dark:text-waify-dark-text-muted", children: [
            /* @__PURE__ */ jsx("th", { className: "px-5 py-3", children: "Plan" }),
            /* @__PURE__ */ jsx("th", { className: "px-5 py-3", children: "Monthly" }),
            /* @__PURE__ */ jsx("th", { className: "px-5 py-3", children: "Annual" }),
            /* @__PURE__ */ jsx("th", { className: "px-5 py-3", children: "Trial" }),
            /* @__PURE__ */ jsx("th", { className: "px-5 py-3", children: "Public" }),
            /* @__PURE__ */ jsx("th", { className: "px-5 py-3", children: "Status" }),
            /* @__PURE__ */ jsx("th", { className: "px-5 py-3", children: "Subscribers" }),
            /* @__PURE__ */ jsx("th", { className: "px-5 py-3", children: "Sort" })
          ] }) }),
          /* @__PURE__ */ jsx("tbody", { className: "divide-y divide-gray-100 dark:divide-waify-dark-border", children: plans.map((plan) => /* @__PURE__ */ jsxs("tr", { className: "text-waify-text dark:text-waify-dark-text", children: [
            /* @__PURE__ */ jsx("td", { className: "px-5 py-3 font-medium", children: plan.name }),
            /* @__PURE__ */ jsx("td", { className: "px-5 py-3 tabular-nums", children: formatMoney(plan.price_monthly, plan.currency) }),
            /* @__PURE__ */ jsx("td", { className: "px-5 py-3 tabular-nums", children: formatMoney(plan.price_yearly, plan.currency) }),
            /* @__PURE__ */ jsxs("td", { className: "px-5 py-3", children: [
              plan.trial_days || 0,
              " days"
            ] }),
            /* @__PURE__ */ jsx("td", { className: "px-5 py-3", children: /* @__PURE__ */ jsx(Badge, { variant: plan.is_public ? "success" : "default", children: plan.is_public ? "Yes" : "No" }) }),
            /* @__PURE__ */ jsx("td", { className: "px-5 py-3", children: /* @__PURE__ */ jsx(Badge, { variant: plan.is_active ? "success" : "default", children: plan.is_active ? "Active" : "Archived" }) }),
            /* @__PURE__ */ jsx("td", { className: "px-5 py-3 tabular-nums", children: plan.subscriptions_count.toLocaleString("en-IN") }),
            /* @__PURE__ */ jsx("td", { className: "px-5 py-3 tabular-nums", children: plan.sort_order })
          ] }, plan.id)) })
        ] }) })
      ] })
    ] }),
    /* @__PURE__ */ jsx(
      Drawer,
      {
        open: !!togglePlan,
        onClose: () => setTogglePlan(null),
        title: togglePlan?.is_active ? "Archive plan" : "Activate plan",
        description: togglePlan ? `${togglePlan.name} will be updated across platform billing surfaces.` : void 0,
        footer: /* @__PURE__ */ jsxs("div", { className: "flex justify-end gap-2", children: [
          /* @__PURE__ */ jsx(Button, { variant: "secondary", onClick: () => setTogglePlan(null), children: "Cancel" }),
          /* @__PURE__ */ jsx(Button, { variant: togglePlan?.is_active ? "danger" : "primary", onClick: confirmToggle, children: togglePlan?.is_active ? "Archive plan" : "Activate plan" })
        ] }),
        children: /* @__PURE__ */ jsxs("div", { className: "space-y-4 text-sm text-waify-text dark:text-waify-dark-text", children: [
          /* @__PURE__ */ jsx("p", { children: togglePlan?.is_active ? "Archiving hides this plan from new selection, while existing subscription records remain intact." : "Activating makes this plan available wherever its visibility rules allow it." }),
          togglePlan && /* @__PURE__ */ jsxs("div", { className: "rounded-card border border-gray-100 bg-gray-50 p-4 dark:border-waify-dark-border dark:bg-waify-dark-surface-2", children: [
            /* @__PURE__ */ jsx("div", { className: "font-semibold", children: togglePlan.name }),
            /* @__PURE__ */ jsxs("div", { className: "mt-1 text-waify-text-muted dark:text-waify-dark-text-muted", children: [
              formatMoney(togglePlan.price_monthly, togglePlan.currency),
              " monthly · ",
              togglePlan.subscriptions_count,
              " subscribers"
            ] })
          ] })
        ] })
      }
    ),
    /* @__PURE__ */ jsx(PlanFormDrawer, { mode: "create", open: createOpen, modules, defaultCurrency: default_currency, onClose: closePlanPanels }),
    /* @__PURE__ */ jsx(PlanFormDrawer, { mode: "edit", open: !!editPlan, plan: editPlan, modules, defaultCurrency: default_currency, onClose: closePlanPanels }),
    /* @__PURE__ */ jsx(
      PlanDetailDrawer,
      {
        plan: activePlan && !editPlan ? activePlan : null,
        moduleNames,
        onClose: closePlanPanels,
        onEdit: () => {
          setEditPlan(activePlan);
          router.get(route("platform.plans.index"), { plan: activePlan?.key, panel: "edit" }, { preserveScroll: true, preserveState: true, replace: true });
        }
      }
    )
  ] });
}
export {
  PlansIndex as default
};
