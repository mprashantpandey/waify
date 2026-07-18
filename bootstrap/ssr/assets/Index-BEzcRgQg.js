import { jsxs, jsx } from "react/jsx-runtime";
import { usePage, Head, router } from "@inertiajs/react";
import { useState, useMemo, useEffect } from "react";
import { P as PlatformShell } from "./PlatformShell-BJ42joc8.js";
import { C as Card, a as CardContent } from "./Card-BtIXZ0GS.js";
import { B as Button } from "./Button-BJftGNki.js";
import { B as Badge } from "./Badge-C65MHc2S.js";
import { T as TextInput } from "./TextInput-CmkZX80k.js";
import { P as PageHeader, a as Toolbar, T as ThemedIconTile, S as StatusBadge, D as Drawer } from "./Elements-EbyZDnT_.js";
import { Plus, TicketPercent, CheckCircle2, Gift, IndianRupee, BadgePercent, Edit3, ToggleRight, ToggleLeft, Search } from "lucide-react";
import { u as useToast } from "./useToast-BN7qsQL3.js";
import "axios";
import "./BrandingWrapper-DdVUILzh.js";
import "./utils-B2ZNUmII.js";
import "clsx";
import "tailwind-merge";
import "./BrandLogo-TeztHB0m.js";
import "@headlessui/react";
function blankForm(defaultCurrency) {
  return {
    code: "",
    name: "",
    discount_type: "percent",
    percent_off: 10,
    amount_off: 0,
    currency: defaultCurrency || "INR",
    duration: "once",
    duration_cycles: "",
    max_redemptions: "",
    plan_keys: [],
    new_user_only: true,
    is_active: true
  };
}
function formFromDiscount(discount) {
  return {
    code: discount.code,
    name: discount.name,
    discount_type: discount.discount_type,
    percent_off: discount.percent_off || 10,
    amount_off: discount.amount_off || 0,
    currency: discount.currency,
    duration: discount.duration,
    duration_cycles: discount.duration_cycles ? String(discount.duration_cycles) : "",
    max_redemptions: discount.max_redemptions ? String(discount.max_redemptions) : "",
    plan_keys: discount.plan_keys || [],
    new_user_only: Boolean(discount.new_user_only),
    is_active: discount.is_active
  };
}
function formatAmount(discount) {
  if (discount.discount_type === "percent") return `${discount.percent_off || 0}%`;
  return new Intl.NumberFormat("en-IN", { style: "currency", currency: discount.currency || "INR" }).format((discount.amount_off || 0) / 100);
}
function StatCard({ label, value, icon: Icon, tone = "green" }) {
  return /* @__PURE__ */ jsx(Card, { children: /* @__PURE__ */ jsx(CardContent, { className: "p-5", children: /* @__PURE__ */ jsxs("div", { className: "flex items-start justify-between", children: [
    /* @__PURE__ */ jsxs("div", { children: [
      /* @__PURE__ */ jsx("p", { className: "text-sm text-waify-text-muted dark:text-waify-dark-text-muted", children: label }),
      /* @__PURE__ */ jsx("p", { className: "mt-2 text-2xl font-bold text-waify-text dark:text-waify-dark-text", children: value })
    ] }),
    /* @__PURE__ */ jsx(ThemedIconTile, { tone, children: /* @__PURE__ */ jsx(Icon, { className: "h-5 w-5" }) })
  ] }) }) });
}
function DiscountDrawer({
  open,
  discount,
  plans,
  defaultCurrency,
  onClose
}) {
  const { addToast } = useToast();
  const [form, setForm] = useState(() => discount ? formFromDiscount(discount) : blankForm(defaultCurrency));
  useEffect(() => {
    setForm(discount ? formFromDiscount(discount) : blankForm(defaultCurrency));
  }, [discount, defaultCurrency]);
  const submit = () => {
    const payload = {
      ...form,
      code: form.code.toUpperCase().trim(),
      duration_cycles: form.duration_cycles ? Number(form.duration_cycles) : null,
      max_redemptions: form.max_redemptions ? Number(form.max_redemptions) : null,
      amount_off: form.discount_type === "fixed" ? Number(form.amount_off) : null,
      percent_off: form.discount_type === "percent" ? Number(form.percent_off) : null
    };
    const options = {
      preserveScroll: true,
      onSuccess: () => {
        addToast({ title: discount ? "Discount updated" : "Discount created", variant: "success" });
        onClose();
      },
      onError: () => addToast({ title: discount ? "Failed to update discount" : "Failed to create discount", variant: "error" })
    };
    if (discount) {
      router.patch(route("platform.discounts.update", { discount: discount.id }), payload, options);
    } else {
      router.post(route("platform.discounts.store"), payload, options);
    }
  };
  return /* @__PURE__ */ jsx(
    Drawer,
    {
      open,
      onClose,
      title: discount ? `Edit ${discount.code}` : "Create promo",
      description: "Promo code, duration, first-purchase eligibility, and eligible plans.",
      className: "sm:max-w-2xl",
      footer: /* @__PURE__ */ jsxs("div", { className: "flex justify-end gap-2", children: [
        /* @__PURE__ */ jsx(Button, { type: "button", variant: "secondary", onClick: onClose, children: "Cancel" }),
        /* @__PURE__ */ jsx(Button, { type: "button", onClick: submit, children: discount ? "Save discount" : "Create discount" })
      ] }),
      children: /* @__PURE__ */ jsxs("div", { className: "space-y-5", children: [
        /* @__PURE__ */ jsxs("div", { className: "grid gap-4 sm:grid-cols-2", children: [
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("label", { className: "mb-1.5 block text-sm font-medium text-waify-text dark:text-waify-dark-text", children: "Code" }),
            /* @__PURE__ */ jsx(TextInput, { value: form.code, onChange: (event) => setForm({ ...form, code: event.target.value.toUpperCase() }), placeholder: "WELCOME20", className: "w-full font-mono" })
          ] }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("label", { className: "mb-1.5 block text-sm font-medium text-waify-text dark:text-waify-dark-text", children: "Name" }),
            /* @__PURE__ */ jsx(TextInput, { value: form.name, onChange: (event) => setForm({ ...form, name: event.target.value }), placeholder: "Launch offer", className: "w-full" })
          ] }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("label", { className: "mb-1.5 block text-sm font-medium text-waify-text dark:text-waify-dark-text", children: "Type" }),
            /* @__PURE__ */ jsxs("select", { className: "waify-input", value: form.discount_type, onChange: (event) => setForm({ ...form, discount_type: event.target.value }), children: [
              /* @__PURE__ */ jsx("option", { value: "percent", children: "Percent" }),
              /* @__PURE__ */ jsx("option", { value: "fixed", children: "Fixed amount" })
            ] })
          ] }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("label", { className: "mb-1.5 block text-sm font-medium text-waify-text dark:text-waify-dark-text", children: form.discount_type === "percent" ? "Percent off" : "Amount off (minor units)" }),
            /* @__PURE__ */ jsx(
              TextInput,
              {
                type: "number",
                min: "1",
                max: form.discount_type === "percent" ? 100 : void 0,
                value: form.discount_type === "percent" ? form.percent_off : form.amount_off,
                onChange: (event) => setForm(form.discount_type === "percent" ? { ...form, percent_off: Number(event.target.value) } : { ...form, amount_off: Number(event.target.value) }),
                className: "w-full"
              }
            )
          ] }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("label", { className: "mb-1.5 block text-sm font-medium text-waify-text dark:text-waify-dark-text", children: "Duration" }),
            /* @__PURE__ */ jsxs("select", { className: "waify-input", value: form.duration, onChange: (event) => setForm({ ...form, duration: event.target.value }), children: [
              /* @__PURE__ */ jsx("option", { value: "once", children: "One time" }),
              /* @__PURE__ */ jsx("option", { value: "recurring", children: "Recurring cycles" }),
              /* @__PURE__ */ jsx("option", { value: "forever", children: "Forever" })
            ] })
          ] }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("label", { className: "mb-1.5 block text-sm font-medium text-waify-text dark:text-waify-dark-text", children: "Cycles" }),
            /* @__PURE__ */ jsx(TextInput, { disabled: form.duration !== "recurring", value: form.duration_cycles, onChange: (event) => setForm({ ...form, duration_cycles: event.target.value }), placeholder: "Only for recurring", className: "w-full" })
          ] }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("label", { className: "mb-1.5 block text-sm font-medium text-waify-text dark:text-waify-dark-text", children: "Max redemptions" }),
            /* @__PURE__ */ jsx(TextInput, { value: form.max_redemptions, onChange: (event) => setForm({ ...form, max_redemptions: event.target.value }), placeholder: "Unlimited", className: "w-full" })
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("label", { className: "mb-1.5 block text-sm font-medium text-waify-text dark:text-waify-dark-text", children: "Eligible plans" }),
          /* @__PURE__ */ jsx(
            "select",
            {
              multiple: true,
              className: "min-h-32 w-full rounded-btn border border-gray-200 bg-white px-3 py-2 text-sm text-waify-text outline-none focus:border-waify-green focus:ring-2 focus:ring-waify-green/20 dark:border-waify-dark-border dark:bg-waify-dark-surface dark:text-waify-dark-text",
              value: form.plan_keys,
              onChange: (event) => setForm({ ...form, plan_keys: Array.from(event.target.selectedOptions).map((option) => option.value) }),
              children: plans.map((plan) => /* @__PURE__ */ jsx("option", { value: plan.key, children: plan.name }, plan.key))
            }
          ),
          /* @__PURE__ */ jsx("p", { className: "mt-1 text-xs text-waify-text-muted dark:text-waify-dark-text-muted", children: "Leave empty to allow all plans." })
        ] }),
        /* @__PURE__ */ jsxs("label", { className: "flex items-center justify-between rounded-card border border-gray-100 p-4 dark:border-waify-dark-border", children: [
          /* @__PURE__ */ jsxs("span", { children: [
            /* @__PURE__ */ jsx("span", { className: "block text-sm font-semibold text-waify-text dark:text-waify-dark-text", children: "Active" }),
            /* @__PURE__ */ jsx("span", { className: "text-xs text-waify-text-muted dark:text-waify-dark-text-muted", children: "Inactive codes are rejected during checkout preview and checkout." })
          ] }),
          /* @__PURE__ */ jsx("input", { type: "checkbox", checked: form.is_active, onChange: (event) => setForm({ ...form, is_active: event.target.checked }), className: "h-4 w-4 rounded border-gray-300 text-waify-green focus:ring-waify-green" })
        ] }),
        /* @__PURE__ */ jsxs("label", { className: "flex items-center justify-between rounded-card border border-gray-100 p-4 dark:border-waify-dark-border", children: [
          /* @__PURE__ */ jsxs("span", { children: [
            /* @__PURE__ */ jsx("span", { className: "block text-sm font-semibold text-waify-text dark:text-waify-dark-text", children: "New customer only" }),
            /* @__PURE__ */ jsx("span", { className: "text-xs text-waify-text-muted dark:text-waify-dark-text-muted", children: "Apply this promo only when the owner email has no paid Zyptos order yet." })
          ] }),
          /* @__PURE__ */ jsx("input", { type: "checkbox", checked: form.new_user_only, onChange: (event) => setForm({ ...form, new_user_only: event.target.checked }), className: "h-4 w-4 rounded border-gray-300 text-waify-green focus:ring-waify-green" })
        ] })
      ] })
    }
  );
}
function DiscountsIndex({ discounts, plans, default_currency }) {
  const { auth } = usePage().props;
  const { addToast } = useToast();
  const [query, setQuery] = useState("");
  const [scope, setScope] = useState("all");
  const [editing, setEditing] = useState(null);
  const [createOpen, setCreateOpen] = useState(false);
  const filtered = useMemo(() => discounts.filter((discount) => {
    const q = query.trim().toLowerCase();
    const matchesQuery = !q || discount.code.toLowerCase().includes(q) || discount.name.toLowerCase().includes(q);
    const matchesScope = scope === "all" || (scope === "active" ? discount.is_active : !discount.is_active);
    return matchesQuery && matchesScope;
  }), [discounts, query, scope]);
  const toggle = (discount) => {
    router.post(route("platform.discounts.toggle", { discount: discount.id }), {}, {
      preserveScroll: true,
      onSuccess: () => addToast({ title: "Discount status updated", variant: "success" }),
      onError: () => addToast({ title: "Failed to update discount", variant: "error" })
    });
  };
  return /* @__PURE__ */ jsxs(PlatformShell, { auth, children: [
    /* @__PURE__ */ jsx(Head, { title: "Discounts" }),
    /* @__PURE__ */ jsxs("div", { className: "space-y-6", children: [
      /* @__PURE__ */ jsx(
        PageHeader,
        {
          title: "Discounts",
          description: "Manage promo codes, first-purchase offers, duration, and plan eligibility.",
          actions: /* @__PURE__ */ jsxs(Button, { type: "button", onClick: () => setCreateOpen(true), children: [
            /* @__PURE__ */ jsx(Plus, { className: "h-4 w-4" }),
            "Create promo"
          ] })
        }
      ),
      /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 gap-4 md:grid-cols-4", children: [
        /* @__PURE__ */ jsx(StatCard, { label: "Discounts", value: discounts.length, icon: TicketPercent }),
        /* @__PURE__ */ jsx(StatCard, { label: "Active", value: discounts.filter((discount) => discount.is_active).length, icon: CheckCircle2, tone: "blue" }),
        /* @__PURE__ */ jsx(StatCard, { label: "Redemptions", value: discounts.reduce((sum, discount) => sum + discount.redemptions, 0), icon: Gift, tone: "purple" }),
        /* @__PURE__ */ jsx(StatCard, { label: "Fixed amount promos", value: discounts.filter((discount) => discount.discount_type === "fixed").length, icon: IndianRupee, tone: "amber" })
      ] }),
      /* @__PURE__ */ jsx(
        Toolbar,
        {
          search: { value: query, onChange: setQuery, placeholder: "Search discounts" },
          filters: /* @__PURE__ */ jsx("div", { className: "flex gap-1.5", children: [
            ["all", "All"],
            ["active", "Active"],
            ["inactive", "Inactive"]
          ].map(([id, label]) => /* @__PURE__ */ jsx("button", { type: "button", onClick: () => setScope(id), className: `h-8 rounded-btn px-3 text-xs font-semibold ${scope === id ? "bg-waify-text text-white dark:bg-waify-dark-text dark:text-waify-dark-bg" : "bg-gray-100 text-waify-text-muted dark:bg-waify-dark-surface-2 dark:text-waify-dark-text-muted"}`, children: label }, id)) })
        }
      ),
      /* @__PURE__ */ jsx("div", { className: "grid gap-4 xl:grid-cols-2", children: filtered.map((discount) => /* @__PURE__ */ jsx(Card, { className: "transition hover:border-waify-green/40 hover:shadow-card-lg dark:hover:border-emerald-400/30", children: /* @__PURE__ */ jsx(CardContent, { className: "p-5", children: /* @__PURE__ */ jsxs("div", { className: "flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between", children: [
        /* @__PURE__ */ jsxs("div", { className: "flex min-w-0 gap-4", children: [
          /* @__PURE__ */ jsx(ThemedIconTile, { tone: discount.is_active ? "green" : "gray", size: "lg", children: /* @__PURE__ */ jsx(BadgePercent, { className: "h-5 w-5" }) }),
          /* @__PURE__ */ jsxs("div", { className: "min-w-0", children: [
            /* @__PURE__ */ jsxs("div", { className: "flex flex-wrap items-center gap-2", children: [
              /* @__PURE__ */ jsx("h3", { className: "font-mono text-base font-bold text-waify-text dark:text-waify-dark-text", children: discount.code }),
              /* @__PURE__ */ jsx(Badge, { variant: discount.is_active ? "success" : "secondary", children: discount.is_active ? "Active" : "Inactive" }),
              /* @__PURE__ */ jsx(StatusBadge, { tone: "info", children: formatAmount(discount) })
            ] }),
            /* @__PURE__ */ jsx("p", { className: "mt-1 text-sm font-semibold text-waify-text dark:text-waify-dark-text", children: discount.name }),
            /* @__PURE__ */ jsxs("p", { className: "mt-2 text-sm text-waify-text-muted dark:text-waify-dark-text-muted", children: [
              discount.duration,
              discount.duration_cycles ? ` · ${discount.duration_cycles} cycles` : "",
              " · ",
              discount.plan_keys?.length ? discount.plan_keys.join(", ") : "All plans"
            ] }),
            /* @__PURE__ */ jsxs("p", { className: "mt-2 text-xs text-waify-text-muted dark:text-waify-dark-text-muted", children: [
              "Uses: ",
              discount.redemptions,
              discount.max_redemptions ? ` / ${discount.max_redemptions}` : "",
              discount.new_user_only ? " · New customers only" : ""
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex shrink-0 flex-wrap gap-2 sm:justify-end", children: [
          /* @__PURE__ */ jsxs(Button, { type: "button", size: "sm", variant: "secondary", onClick: () => setEditing(discount), children: [
            /* @__PURE__ */ jsx(Edit3, { className: "h-4 w-4" }),
            "Edit"
          ] }),
          /* @__PURE__ */ jsxs(Button, { type: "button", size: "sm", variant: discount.is_active ? "warning" : "primary", onClick: () => toggle(discount), children: [
            discount.is_active ? /* @__PURE__ */ jsx(ToggleRight, { className: "h-4 w-4" }) : /* @__PURE__ */ jsx(ToggleLeft, { className: "h-4 w-4" }),
            discount.is_active ? "Disable" : "Enable"
          ] })
        ] })
      ] }) }) }, discount.id)) }),
      filtered.length === 0 && /* @__PURE__ */ jsx(Card, { children: /* @__PURE__ */ jsxs(CardContent, { className: "p-10 text-center", children: [
        /* @__PURE__ */ jsx(Search, { className: "mx-auto h-10 w-10 text-waify-text-muted dark:text-waify-dark-text-muted" }),
        /* @__PURE__ */ jsx("p", { className: "mt-3 font-semibold text-waify-text dark:text-waify-dark-text", children: "No discounts found" }),
        /* @__PURE__ */ jsx("p", { className: "mt-1 text-sm text-waify-text-muted dark:text-waify-dark-text-muted", children: "Create a promo or adjust your filters." })
      ] }) })
    ] }),
    /* @__PURE__ */ jsx(DiscountDrawer, { open: createOpen, discount: null, plans, defaultCurrency: default_currency, onClose: () => setCreateOpen(false) }),
    /* @__PURE__ */ jsx(DiscountDrawer, { open: !!editing, discount: editing, plans, defaultCurrency: default_currency, onClose: () => setEditing(null) })
  ] });
}
export {
  DiscountsIndex as default
};
