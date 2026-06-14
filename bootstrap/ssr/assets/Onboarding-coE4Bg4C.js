import { jsxs, jsx } from "react/jsx-runtime";
import { useState, useMemo, useEffect } from "react";
import { useForm, Head, Link } from "@inertiajs/react";
import { ChevronLeft, Sparkles, Building2, Zap, MessageCircle, KeyRound, RefreshCw, ShieldCheck, AlertTriangle, ArrowRight, Check } from "lucide-react";
import { B as Button } from "./Button-BJftGNki.js";
import { I as InputError } from "./InputError-DiSBWiye.js";
import { B as Badge } from "./Badge-C65MHc2S.js";
import { B as BrandingWrapper, a as BrandLogo, T as ThemeToggle } from "./BrandingWrapper-CZn0jBQL.js";
import { u as useToast } from "./useToast-BN7qsQL3.js";
import "./utils-B2ZNUmII.js";
import "clsx";
import "tailwind-merge";
function formatPrice(amount, currency = "INR") {
  if (amount === null) return "Custom";
  if (amount === 0) return "₹0";
  return new Intl.NumberFormat("en-IN", { style: "currency", currency, maximumFractionDigits: 0 }).format(amount / 100);
}
function formatLimit(value, label) {
  if (value === void 0 || value === null) return null;
  if (Number(value) === -1) return `Unlimited ${label}`;
  return `${Number(value).toLocaleString("en-IN")} ${label}`;
}
function highlights(plan) {
  if (!plan) return [];
  return [
    formatLimit(plan.limits?.messages_monthly, "messages/month"),
    formatLimit(plan.limits?.template_sends_monthly, "template sends/month"),
    formatLimit(plan.limits?.agents, Number(plan.limits?.agents) === 1 ? "agent" : "agents")
  ].filter(Boolean);
}
function Onboarding({
  plans = [],
  defaultPlanKey = "",
  workspaceTypes = {},
  embeddedSignup = {}
}) {
  const fallbackPlan = plans.find((plan) => plan.key === defaultPlanKey) ?? plans[0];
  const [selectedPlanKey, setSelectedPlanKey] = useState(fallbackPlan?.key ?? defaultPlanKey);
  const { toast } = useToast();
  const { data, setData, post, processing, errors } = useForm({
    name: "",
    workspace_type: "business",
    industry: "",
    plan_key: fallbackPlan?.key ?? defaultPlanKey,
    connection_method: embeddedSignup.enabled ? "embedded" : "manual"
  });
  const selectedPlan = useMemo(() => plans.find((plan) => plan.key === selectedPlanKey), [plans, selectedPlanKey]);
  useEffect(() => {
    if (plans.length === 0 || selectedPlan) return;
    setSelectedPlanKey(plans[0].key);
    setData("plan_key", plans[0].key);
  }, [plans, selectedPlan, setData]);
  const selectPlan = (plan) => {
    setSelectedPlanKey(plan.key);
    setData("plan_key", plan.key);
  };
  const submit = (event) => {
    event.preventDefault();
    post(route("onboarding.store"), {
      onError: (formErrors) => {
        const firstError = Object.values(formErrors)[0];
        toast.error("Workspace was not created", typeof firstError === "string" ? firstError : "Please check the highlighted fields and try again.");
      }
    });
  };
  return /* @__PURE__ */ jsxs(BrandingWrapper, { children: [
    /* @__PURE__ */ jsx(Head, { title: "Set up workspace" }),
    /* @__PURE__ */ jsxs("div", { className: "min-h-screen bg-waify-bg text-waify-text antialiased dark:bg-waify-dark-bg dark:text-waify-dark-text", children: [
      /* @__PURE__ */ jsxs("header", { className: "flex h-16 items-center justify-between border-b border-gray-100 bg-white px-5 dark:border-waify-dark-border dark:bg-waify-dark-surface sm:px-8", children: [
        /* @__PURE__ */ jsx(Link, { href: route("landing"), className: "flex items-center gap-2", children: /* @__PURE__ */ jsx(BrandLogo, { variant: "auto" }) }),
        /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3", children: [
          /* @__PURE__ */ jsx(ThemeToggle, {}),
          /* @__PURE__ */ jsx(Link, { href: route("dashboard"), className: "hidden text-sm font-semibold text-waify-green-dark hover:underline dark:text-emerald-300 sm:inline", children: "Dashboard" })
        ] })
      ] }),
      /* @__PURE__ */ jsxs("main", { className: "mx-auto grid min-h-[calc(100vh-64px)] w-full max-w-[1180px] gap-6 px-4 py-6 lg:grid-cols-[minmax(0,1fr)_360px] lg:px-6", children: [
        /* @__PURE__ */ jsxs("form", { onSubmit: submit, className: "space-y-5", children: [
          /* @__PURE__ */ jsxs("div", { className: "flex items-start gap-3", children: [
            /* @__PURE__ */ jsx(Link, { href: route("dashboard"), className: "mt-0.5 flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-btn text-waify-text-muted transition hover:bg-gray-100 hover:text-waify-text dark:text-waify-dark-text-muted dark:hover:bg-slate-800 dark:hover:text-waify-dark-text", children: /* @__PURE__ */ jsx(ChevronLeft, { className: "h-5 w-5" }) }),
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsxs(Badge, { variant: "success", children: [
                /* @__PURE__ */ jsx(Sparkles, { className: "h-3.5 w-3.5" }),
                "Minimal setup"
              ] }),
              /* @__PURE__ */ jsx("h1", { className: "mt-3 text-2xl font-bold tracking-tight text-waify-text dark:text-waify-dark-text", children: "Create your workspace" }),
              /* @__PURE__ */ jsx("p", { className: "mt-1 max-w-2xl text-sm text-waify-text-muted dark:text-waify-dark-text-muted", children: "Add workspace details, choose a plan, and pick how you want to connect your WhatsApp Business account." })
            ] })
          ] }),
          Object.keys(errors).length > 0 && /* @__PURE__ */ jsx("div", { className: "rounded-card border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-900/60 dark:bg-red-950/30 dark:text-red-200", children: Object.values(errors)[0] || "Please check the highlighted fields and try again." }),
          /* @__PURE__ */ jsxs("section", { className: "rounded-card border border-waify-border bg-white p-5 shadow-card dark:border-waify-dark-border dark:bg-waify-dark-surface", children: [
            /* @__PURE__ */ jsxs("div", { className: "mb-4 flex items-center gap-3", children: [
              /* @__PURE__ */ jsx(StepIcon, { icon: Building2 }),
              /* @__PURE__ */ jsxs("div", { children: [
                /* @__PURE__ */ jsx("h2", { className: "font-semibold text-waify-text dark:text-waify-dark-text", children: "Workspace details" }),
                /* @__PURE__ */ jsx("p", { className: "text-sm text-waify-text-muted dark:text-waify-dark-text-muted", children: "Used for billing, users, WABA setup, and routing." })
              ] })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "grid gap-4 sm:grid-cols-2", children: [
              /* @__PURE__ */ jsx(Field, { label: "Workspace name", value: data.name, onChange: (value) => setData("name", value), error: errors.name, required: true, placeholder: "Zyptos Business", className: "sm:col-span-2", autoFocus: true }),
              /* @__PURE__ */ jsxs("div", { children: [
                /* @__PURE__ */ jsx("label", { className: "mb-1.5 block text-xs font-semibold text-waify-text dark:text-waify-dark-text", children: "Workspace type" }),
                /* @__PURE__ */ jsx(
                  "select",
                  {
                    value: data.workspace_type,
                    onChange: (event) => setData("workspace_type", event.target.value),
                    className: "h-10 w-full rounded-btn border border-waify-border bg-white px-3 text-sm text-waify-text shadow-sm focus:border-waify-green focus:ring-waify-green/20 dark:border-waify-dark-border dark:bg-slate-900 dark:text-waify-dark-text",
                    children: Object.entries(workspaceTypes).map(([value, label]) => /* @__PURE__ */ jsx("option", { value, children: label }, value))
                  }
                ),
                /* @__PURE__ */ jsx(InputError, { message: errors.workspace_type, className: "mt-1" })
              ] }),
              /* @__PURE__ */ jsx(Field, { label: "Industry", value: data.industry, onChange: (value) => setData("industry", value), error: errors.industry, placeholder: "Retail, education, healthcare..." })
            ] })
          ] }),
          /* @__PURE__ */ jsxs("section", { className: "rounded-card border border-waify-border bg-white p-5 shadow-card dark:border-waify-dark-border dark:bg-waify-dark-surface", children: [
            /* @__PURE__ */ jsxs("div", { className: "mb-4 flex items-center justify-between gap-3", children: [
              /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3", children: [
                /* @__PURE__ */ jsx(StepIcon, { icon: Zap }),
                /* @__PURE__ */ jsxs("div", { children: [
                  /* @__PURE__ */ jsx("h2", { className: "font-semibold text-waify-text dark:text-waify-dark-text", children: "Choose plan" }),
                  /* @__PURE__ */ jsx("p", { className: "text-sm text-waify-text-muted dark:text-waify-dark-text-muted", children: "You can change this later from Billing." })
                ] })
              ] }),
              selectedPlan?.trial_days ? /* @__PURE__ */ jsxs(Badge, { variant: "success", children: [
                selectedPlan.trial_days,
                "-day trial"
              ] }) : null
            ] }),
            /* @__PURE__ */ jsx("div", { className: "grid gap-3 md:grid-cols-3", children: plans.map((plan) => /* @__PURE__ */ jsx(PlanCard, { plan, selected: plan.key === selectedPlanKey, onSelect: () => selectPlan(plan) }, plan.id)) }),
            plans.length === 0 && /* @__PURE__ */ jsx("div", { className: "rounded-card border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900 dark:border-amber-900/70 dark:bg-amber-950/20 dark:text-amber-100", children: "No public plans are configured. Zyptos will use the platform default plan." }),
            /* @__PURE__ */ jsx(InputError, { message: errors.plan_key, className: "mt-2" })
          ] }),
          /* @__PURE__ */ jsxs("section", { className: "rounded-card border border-waify-border bg-white p-5 shadow-card dark:border-waify-dark-border dark:bg-waify-dark-surface", children: [
            /* @__PURE__ */ jsxs("div", { className: "mb-4 flex items-center gap-3", children: [
              /* @__PURE__ */ jsx(StepIcon, { icon: MessageCircle }),
              /* @__PURE__ */ jsxs("div", { children: [
                /* @__PURE__ */ jsx("h2", { className: "font-semibold text-waify-text dark:text-waify-dark-text", children: "Connect WhatsApp" }),
                /* @__PURE__ */ jsx("p", { className: "text-sm text-waify-text-muted dark:text-waify-dark-text-muted", children: "Choose the setup path to open immediately after workspace creation." })
              ] })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "grid gap-3 md:grid-cols-2 xl:grid-cols-4", children: [
              /* @__PURE__ */ jsx(
                ConnectionCard,
                {
                  id: "embedded",
                  selected: data.connection_method === "embedded",
                  disabled: !embeddedSignup.enabled,
                  title: "Embedded / Auto",
                  badge: "Recommended",
                  icon: Sparkles,
                  description: embeddedSignup.enabled ? "Use Meta embedded signup. Choose new number, migration, or coexistence on the WABA setup page." : "Needs Meta app ID and Embedded Signup Config ID in admin settings.",
                  onSelect: () => setData("connection_method", "embedded")
                }
              ),
              /* @__PURE__ */ jsx(
                ConnectionCard,
                {
                  id: "manual",
                  selected: data.connection_method === "manual",
                  title: "Manual setup",
                  icon: KeyRound,
                  description: "Paste WABA ID, Phone Number ID, and permanent token. Verify webhook only if receiving messages.",
                  onSelect: () => setData("connection_method", "manual")
                }
              ),
              /* @__PURE__ */ jsx(
                ConnectionCard,
                {
                  id: "qr",
                  selected: data.connection_method === "qr",
                  title: "QR connection",
                  icon: RefreshCw,
                  description: "Unofficial WhatsApp QR login with throttling and safety controls. Anti-ban is not guaranteed.",
                  onSelect: () => setData("connection_method", "qr")
                }
              ),
              /* @__PURE__ */ jsx(
                ConnectionCard,
                {
                  id: "later",
                  selected: data.connection_method === "later",
                  title: "Do it later",
                  icon: ShieldCheck,
                  description: "Create the workspace now and connect WhatsApp from WABA Account when ready.",
                  onSelect: () => setData("connection_method", "later")
                }
              )
            ] }),
            /* @__PURE__ */ jsx(InputError, { message: errors.connection_method, className: "mt-2" }),
            /* @__PURE__ */ jsx("div", { className: "mt-4 rounded-card border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900 dark:border-amber-900/70 dark:bg-amber-950/20 dark:text-amber-100", children: /* @__PURE__ */ jsxs("div", { className: "flex items-start gap-3", children: [
              /* @__PURE__ */ jsx(AlertTriangle, { className: "mt-0.5 h-4 w-4 flex-shrink-0" }),
              /* @__PURE__ */ jsx("p", { className: "leading-6", children: "Existing WhatsApp chat history is not imported into Zyptos by the normal Cloud API. New conversations sync after webhooks are active. Contacts can be rebuilt from new messages or imported by CSV." })
            ] }) })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "flex flex-col gap-3 rounded-card border border-waify-border bg-white p-4 shadow-card dark:border-waify-dark-border dark:bg-waify-dark-surface sm:flex-row sm:items-center sm:justify-between", children: [
            /* @__PURE__ */ jsx("div", { className: "text-sm text-waify-text-muted dark:text-waify-dark-text-muted", children: "Workspace timezone is selected automatically from platform defaults. You do not need to enter it." }),
            /* @__PURE__ */ jsxs(Button, { type: "submit", disabled: processing || !data.name.trim(), className: "sm:min-w-[220px]", children: [
              processing ? "Creating workspace..." : "Create workspace",
              /* @__PURE__ */ jsx(ArrowRight, { className: "h-4 w-4" })
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxs("aside", { className: "space-y-4 lg:sticky lg:top-6 lg:self-start", children: [
          /* @__PURE__ */ jsxs("div", { className: "rounded-card border border-waify-border bg-white p-5 shadow-card dark:border-waify-dark-border dark:bg-waify-dark-surface", children: [
            /* @__PURE__ */ jsx("div", { className: "text-xs font-semibold uppercase tracking-wider text-waify-text-muted dark:text-waify-dark-text-muted", children: "Summary" }),
            /* @__PURE__ */ jsxs("div", { className: "mt-4 space-y-4", children: [
              /* @__PURE__ */ jsx(SummaryRow, { label: "Workspace", value: data.name || "Not named yet" }),
              /* @__PURE__ */ jsx(SummaryRow, { label: "Plan", value: selectedPlan ? `${selectedPlan.name} - ${formatPrice(selectedPlan.price_monthly, selectedPlan.currency)}/mo` : "Default plan" }),
              /* @__PURE__ */ jsx(SummaryRow, { label: "Connection", value: connectionLabel(data.connection_method) })
            ] }),
            selectedPlan && /* @__PURE__ */ jsxs("div", { className: "mt-5 rounded-card bg-waify-green/5 p-4 dark:bg-waify-green/10", children: [
              /* @__PURE__ */ jsxs("div", { className: "text-sm font-semibold text-waify-text dark:text-waify-dark-text", children: [
                selectedPlan.name,
                " includes"
              ] }),
              /* @__PURE__ */ jsxs("div", { className: "mt-3 space-y-2 text-sm text-waify-text-muted dark:text-waify-dark-text-muted", children: [
                highlights(selectedPlan).map((item) => /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
                  /* @__PURE__ */ jsx(Check, { className: "h-4 w-4 text-waify-green" }),
                  /* @__PURE__ */ jsx("span", { children: item })
                ] }, item)),
                /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
                  /* @__PURE__ */ jsx(Check, { className: "h-4 w-4 text-waify-green" }),
                  /* @__PURE__ */ jsxs("span", { children: [
                    selectedPlan.modules.length,
                    " enabled features"
                  ] })
                ] })
              ] })
            ] })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "rounded-card border border-blue-200 bg-blue-50 p-4 text-sm text-blue-900 dark:border-blue-900/70 dark:bg-blue-950/20 dark:text-blue-100", children: [
            /* @__PURE__ */ jsx("div", { className: "font-semibold", children: "Real setup flow" }),
            /* @__PURE__ */ jsx("p", { className: "mt-1 leading-6", children: "Embedded / Auto opens Meta setup where users can choose a new Cloud API number, API migration, or eligible coexistence. Manual setup opens the credential form." })
          ] })
        ] })
      ] })
    ] })
  ] });
}
function StepIcon({ icon: Icon }) {
  return /* @__PURE__ */ jsx("span", { className: "flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-waify-green-soft text-waify-green-dark dark:bg-waify-green/10 dark:text-waify-green", children: /* @__PURE__ */ jsx(Icon, { className: "h-5 w-5" }) });
}
function Field({
  label,
  value,
  onChange,
  error,
  placeholder,
  required = false,
  autoFocus = false,
  className = ""
}) {
  return /* @__PURE__ */ jsxs("div", { className, children: [
    /* @__PURE__ */ jsxs("label", { className: "mb-1.5 block text-xs font-semibold text-waify-text dark:text-waify-dark-text", children: [
      label,
      required && /* @__PURE__ */ jsx("span", { className: "text-red-500", children: " *" })
    ] }),
    /* @__PURE__ */ jsx(
      "input",
      {
        value,
        onChange: (event) => onChange(event.target.value),
        required,
        autoFocus,
        placeholder,
        className: "h-10 w-full rounded-btn border border-waify-border bg-white px-3 text-sm text-waify-text shadow-sm placeholder:text-waify-text-muted/60 focus:border-waify-green focus:ring-waify-green/20 dark:border-waify-dark-border dark:bg-slate-900 dark:text-waify-dark-text dark:placeholder:text-waify-dark-text-muted/60"
      }
    ),
    /* @__PURE__ */ jsx(InputError, { message: error, className: "mt-1" })
  ] });
}
function PlanCard({ plan, selected, onSelect }) {
  return /* @__PURE__ */ jsxs(
    "button",
    {
      type: "button",
      onClick: onSelect,
      className: `rounded-card border p-4 text-left transition hover:-translate-y-0.5 hover:shadow-card-lg ${selected ? "border-waify-green bg-waify-green/5 ring-2 ring-waify-green/25 dark:bg-waify-green/10" : "border-waify-border bg-gray-50 hover:border-waify-green/50 dark:border-waify-dark-border dark:bg-slate-900"}`,
      children: [
        /* @__PURE__ */ jsxs("div", { className: "flex items-start justify-between gap-3", children: [
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("div", { className: "font-semibold text-waify-text dark:text-waify-dark-text", children: plan.name }),
            /* @__PURE__ */ jsx("div", { className: "mt-1 text-xs text-waify-text-muted dark:text-waify-dark-text-muted", children: plan.description })
          ] }),
          /* @__PURE__ */ jsx(SelectionDot, { selected })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "mt-4", children: [
          /* @__PURE__ */ jsx("span", { className: "text-2xl font-bold text-waify-text dark:text-waify-dark-text", children: formatPrice(plan.price_monthly, plan.currency) }),
          plan.price_monthly !== null && plan.price_monthly > 0 && /* @__PURE__ */ jsx("span", { className: "text-xs text-waify-text-muted dark:text-waify-dark-text-muted", children: " / month" })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "mt-3 flex flex-wrap gap-2", children: [
          plan.trial_days > 0 && /* @__PURE__ */ jsxs(Badge, { variant: "success", children: [
            plan.trial_days,
            " day trial"
          ] }),
          /* @__PURE__ */ jsxs(Badge, { variant: "secondary", children: [
            plan.modules.length,
            " features"
          ] })
        ] })
      ]
    }
  );
}
function ConnectionCard({
  selected,
  disabled = false,
  title,
  badge,
  description,
  icon: Icon,
  onSelect
}) {
  return /* @__PURE__ */ jsxs(
    "button",
    {
      type: "button",
      disabled,
      onClick: onSelect,
      className: `rounded-card border p-4 text-left transition ${selected ? "border-waify-green bg-waify-green/5 ring-2 ring-waify-green/25 dark:bg-waify-green/10" : "border-waify-border bg-gray-50 hover:border-waify-green/50 dark:border-waify-dark-border dark:bg-slate-900"} ${disabled ? "cursor-not-allowed opacity-60" : "hover:-translate-y-0.5 hover:shadow-card-lg"}`,
      children: [
        /* @__PURE__ */ jsxs("div", { className: "flex items-start justify-between gap-3", children: [
          /* @__PURE__ */ jsx("span", { className: "flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-white text-waify-green shadow-sm dark:bg-slate-800", children: /* @__PURE__ */ jsx(Icon, { className: "h-5 w-5" }) }),
          /* @__PURE__ */ jsx(SelectionDot, { selected })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "mt-4 flex flex-wrap items-center gap-2", children: [
          /* @__PURE__ */ jsx("div", { className: "font-semibold text-waify-text dark:text-waify-dark-text", children: title }),
          badge && /* @__PURE__ */ jsx(Badge, { variant: "success", children: badge })
        ] }),
        /* @__PURE__ */ jsx("p", { className: "mt-2 text-sm leading-6 text-waify-text-muted dark:text-waify-dark-text-muted", children: description })
      ]
    }
  );
}
function SelectionDot({ selected }) {
  return /* @__PURE__ */ jsx("span", { className: `flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full border ${selected ? "border-waify-green bg-waify-green text-white" : "border-gray-300 dark:border-slate-600"}`, children: selected && /* @__PURE__ */ jsx(Check, { className: "h-3.5 w-3.5" }) });
}
function SummaryRow({ label, value }) {
  return /* @__PURE__ */ jsxs("div", { children: [
    /* @__PURE__ */ jsx("div", { className: "text-xs font-semibold uppercase tracking-wider text-waify-text-muted dark:text-waify-dark-text-muted", children: label }),
    /* @__PURE__ */ jsx("div", { className: "mt-1 text-sm font-semibold text-waify-text dark:text-waify-dark-text", children: value })
  ] });
}
function connectionLabel(value) {
  if (value === "embedded") return "Embedded / Auto connection";
  if (value === "manual") return "Manual WABA setup";
  if (value === "qr") return "QR connection";
  return "Connect later";
}
export {
  Onboarding as default
};
