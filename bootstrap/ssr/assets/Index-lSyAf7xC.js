import { jsxs, jsx } from "react/jsx-runtime";
import { usePage, Head, router } from "@inertiajs/react";
import { useState, useMemo, useEffect } from "react";
import { P as PlatformShell } from "./PlatformShell-BJ42joc8.js";
import { C as Card, a as CardContent } from "./Card-BtIXZ0GS.js";
import { B as Badge } from "./Badge-C65MHc2S.js";
import { B as Button } from "./Button-BJftGNki.js";
import { T as TextInput } from "./TextInput-CmkZX80k.js";
import { T as ThemedIconTile, D as Drawer } from "./Elements-EbyZDnT_.js";
import { RefreshCw, Layers, PackageCheck, Crown, Users, Gauge, AlertTriangle, XCircle, Puzzle, CheckCircle2, Workflow, ShieldCheck, Boxes, Search, Lock, ToggleRight, ToggleLeft, Edit3 } from "lucide-react";
import { u as useToast } from "./useToast-BN7qsQL3.js";
import { u as useConfirm } from "./useConfirm-gGqxmsEz.js";
import { c as cn } from "./utils-B2ZNUmII.js";
import "axios";
import "./BrandingWrapper-DdVUILzh.js";
import "./BrandLogo-TeztHB0m.js";
import "@headlessui/react";
import "clsx";
import "tailwind-merge";
const categoryMeta = {
  all: { label: "All modules", description: "Everything installed", icon: Boxes, tone: "green" },
  core: { label: "Core", description: "Locked platform base", icon: Crown, tone: "amber" },
  whatsapp: { label: "WhatsApp", description: "Meta messaging stack", icon: ShieldCheck, tone: "green" },
  automation: { label: "Automation", description: "Bots and workflows", icon: Workflow, tone: "purple" },
  audience: { label: "Audience", description: "Contacts and campaigns", icon: Users, tone: "blue" },
  billing: { label: "Billing", description: "Plans and wallet controls", icon: Gauge, tone: "pink" },
  support: { label: "Support", description: "Tickets and helpdesk", icon: CheckCircle2, tone: "blue" },
  platform: { label: "Platform", description: "General capabilities", icon: Puzzle, tone: "gray" },
  disabled: { label: "Disabled", description: "Unavailable modules", icon: XCircle, tone: "red" }
};
function moduleCategory(module) {
  if (module.is_core) return "core";
  if (module.key.includes("whatsapp") || module.key.includes("template")) return "whatsapp";
  if (module.key.includes("automation") || module.key.includes("chatbot")) return "automation";
  if (module.key.includes("contact") || module.key.includes("broadcast")) return "audience";
  if (module.key.includes("billing") || module.key.includes("wallet")) return "billing";
  if (module.key.includes("support")) return "support";
  return "platform";
}
function adoptionPercent(module, maxAccounts) {
  return Math.round(module.account_count / Math.max(1, maxAccounts) * 100);
}
function Meter({ value, tone = "green" }) {
  const colors = {
    green: "bg-waify-green dark:bg-emerald-300",
    amber: "bg-amber-500 dark:bg-amber-300",
    red: "bg-red-500 dark:bg-red-300"
  };
  return /* @__PURE__ */ jsx("div", { className: "h-2 overflow-hidden rounded-full bg-gray-100 dark:bg-waify-dark-surface-2", children: /* @__PURE__ */ jsx("div", { className: cn("h-full rounded-full transition-all", colors[tone]), style: { width: `${Math.max(0, Math.min(100, value))}%` } }) });
}
function ModuleDrawer({ module, maxAccounts, onClose }) {
  const { addToast } = useToast();
  const [form, setForm] = useState({
    name: "",
    description: "",
    is_enabled: true
  });
  useEffect(() => {
    if (!module) return;
    setForm({
      name: module.name,
      description: module.description || "",
      is_enabled: module.is_enabled
    });
  }, [module]);
  if (!module) return null;
  const category = moduleCategory(module);
  const meta = categoryMeta[category];
  const adoption = adoptionPercent(module, maxAccounts);
  const save = () => {
    router.patch(route("platform.modules.update", { module: module.id }), form, {
      preserveScroll: true,
      onSuccess: () => {
        addToast({ title: "Module updated", variant: "success" });
        onClose();
      },
      onError: () => addToast({ title: "Failed to update module", variant: "error" })
    });
  };
  return /* @__PURE__ */ jsx(
    Drawer,
    {
      open: true,
      onClose,
      title: module.name,
      description: module.key,
      className: "sm:max-w-xl",
      footer: /* @__PURE__ */ jsxs("div", { className: "flex justify-end gap-2", children: [
        /* @__PURE__ */ jsx(Button, { type: "button", variant: "secondary", onClick: onClose, children: "Cancel" }),
        /* @__PURE__ */ jsx(Button, { type: "button", onClick: save, children: "Save module" })
      ] }),
      children: /* @__PURE__ */ jsxs("div", { className: "space-y-5", children: [
        /* @__PURE__ */ jsx("div", { className: "rounded-card border border-gray-100 bg-gray-50 p-4 dark:border-waify-dark-border dark:bg-waify-dark-surface-2", children: /* @__PURE__ */ jsxs("div", { className: "flex items-start gap-3", children: [
          /* @__PURE__ */ jsx(ThemedIconTile, { tone: meta.tone, size: "lg", children: /* @__PURE__ */ jsx(meta.icon, { className: "h-5 w-5" }) }),
          /* @__PURE__ */ jsxs("div", { className: "min-w-0 flex-1", children: [
            /* @__PURE__ */ jsxs("div", { className: "flex flex-wrap gap-2", children: [
              /* @__PURE__ */ jsx(Badge, { variant: module.is_enabled ? "success" : "secondary", children: module.is_enabled ? "Enabled" : "Disabled" }),
              /* @__PURE__ */ jsx(Badge, { variant: module.is_core ? "warning" : "info", children: meta.label })
            ] }),
            /* @__PURE__ */ jsxs("p", { className: "mt-2 text-sm text-waify-text-muted dark:text-waify-dark-text-muted", children: [
              module.account_count,
              " workspace entitlement",
              module.account_count === 1 ? "" : "s",
              " use this module."
            ] }),
            /* @__PURE__ */ jsx("div", { className: "mt-3", children: /* @__PURE__ */ jsx(Meter, { value: adoption, tone: module.is_enabled ? "green" : "red" }) })
          ] })
        ] }) }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("label", { className: "mb-1.5 block text-sm font-medium text-waify-text dark:text-waify-dark-text", children: "Module name" }),
          /* @__PURE__ */ jsx(TextInput, { value: form.name, onChange: (event) => setForm((current) => ({ ...current, name: event.target.value })), className: "w-full" })
        ] }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("label", { className: "mb-1.5 block text-sm font-medium text-waify-text dark:text-waify-dark-text", children: "Description" }),
          /* @__PURE__ */ jsx(
            "textarea",
            {
              value: form.description,
              onChange: (event) => setForm((current) => ({ ...current, description: event.target.value })),
              rows: 5,
              className: "w-full rounded-btn border border-gray-200 bg-white px-3 py-2 text-sm text-waify-text outline-none focus:border-waify-green focus:ring-2 focus:ring-waify-green/20 dark:border-waify-dark-border dark:bg-waify-dark-surface dark:text-waify-dark-text"
            }
          )
        ] }),
        /* @__PURE__ */ jsxs("label", { className: "flex items-center justify-between gap-4 rounded-card border border-gray-100 p-4 dark:border-waify-dark-border", children: [
          /* @__PURE__ */ jsxs("span", { children: [
            /* @__PURE__ */ jsx("span", { className: "block text-sm font-semibold text-waify-text dark:text-waify-dark-text", children: "Available platform-wide" }),
            /* @__PURE__ */ jsx("span", { className: "text-xs text-waify-text-muted dark:text-waify-dark-text-muted", children: "Turning this off blocks assignment and access for all workspaces." })
          ] }),
          /* @__PURE__ */ jsx(
            "input",
            {
              type: "checkbox",
              checked: form.is_enabled,
              disabled: module.is_core,
              onChange: (event) => setForm((current) => ({ ...current, is_enabled: event.target.checked })),
              className: "h-4 w-4 rounded border-gray-300 text-waify-green focus:ring-waify-green disabled:opacity-40"
            }
          )
        ] }),
        module.is_core && /* @__PURE__ */ jsx("div", { className: "rounded-card border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900 dark:border-amber-400/25 dark:bg-amber-500/10 dark:text-amber-100", children: "Core modules are part of the platform base and cannot be disabled." })
      ] })
    }
  );
}
function PlatformModulesIndex({ modules }) {
  const { auth } = usePage().props;
  const { addToast } = useToast();
  const confirm = useConfirm();
  const [query, setQuery] = useState("");
  const [scope, setScope] = useState("all");
  const [editing, setEditing] = useState(null);
  const maxAccounts = Math.max(1, ...modules.map((module) => module.account_count));
  const enabledCount = modules.filter((module) => module.is_enabled).length;
  const coreCount = modules.filter((module) => module.is_core).length;
  const disabledCount = modules.filter((module) => !module.is_enabled).length;
  const workspaceLinks = modules.reduce((sum, module) => sum + module.account_count, 0);
  const categories = useMemo(() => {
    const present = Array.from(new Set(modules.map(moduleCategory)));
    return ["all", ...present, "disabled"];
  }, [modules]);
  const categoryCounts = useMemo(() => {
    const counts = { all: modules.length, disabled: disabledCount };
    modules.forEach((module) => {
      const category = moduleCategory(module);
      counts[category] = (counts[category] || 0) + 1;
    });
    return counts;
  }, [modules, disabledCount]);
  const filtered = useMemo(() => modules.filter((module) => {
    const q = query.trim().toLowerCase();
    const matchesQuery = !q || module.name.toLowerCase().includes(q) || module.key.toLowerCase().includes(q) || (module.description || "").toLowerCase().includes(q);
    const matchesScope = scope === "all" || scope === "disabled" && !module.is_enabled || moduleCategory(module) === scope;
    return matchesQuery && matchesScope;
  }), [modules, query, scope]);
  const featured = useMemo(() => [...modules].sort((a, b) => b.account_count - a.account_count).slice(0, 3), [modules]);
  const highestRisk = filtered.filter((module) => !module.is_core && !module.is_enabled).slice(0, 4);
  const handleToggle = async (module) => {
    if (module.is_core) {
      addToast({ title: "Core module locked", description: "Core modules cannot be disabled at platform level.", variant: "error" });
      return;
    }
    const action = module.is_enabled ? "disable" : "enable";
    const confirmed = await confirm({
      title: `${action === "enable" ? "Enable" : "Disable"} module?`,
      message: `${module.name} will be ${action}d for the whole platform.`,
      variant: action === "enable" ? "info" : "warning"
    });
    if (!confirmed) return;
    router.post(route("platform.modules.toggle", { module: module.id }), {}, {
      preserveScroll: true,
      onSuccess: () => addToast({ title: "Module updated", variant: "success" }),
      onError: () => addToast({ title: "Failed to update module", variant: "error" })
    });
  };
  return /* @__PURE__ */ jsxs(PlatformShell, { auth, children: [
    /* @__PURE__ */ jsx(Head, { title: "Modules" }),
    /* @__PURE__ */ jsxs("div", { className: "space-y-6", children: [
      /* @__PURE__ */ jsx("section", { className: "overflow-hidden rounded-card border border-gray-100 bg-white shadow-card dark:border-waify-dark-border dark:bg-waify-dark-surface dark:shadow-none", children: /* @__PURE__ */ jsxs("div", { className: "grid gap-0 lg:grid-cols-[1.15fr_0.85fr]", children: [
        /* @__PURE__ */ jsxs("div", { className: "p-5 sm:p-6", children: [
          /* @__PURE__ */ jsxs("div", { className: "flex flex-wrap items-start justify-between gap-4", children: [
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx("p", { className: "text-xs font-semibold uppercase tracking-[0.18em] text-waify-green dark:text-emerald-300", children: "Capability control" }),
              /* @__PURE__ */ jsx("h1", { className: "mt-2 text-2xl font-bold text-waify-text dark:text-waify-dark-text", children: "Modules" }),
              /* @__PURE__ */ jsx("p", { className: "mt-2 max-w-2xl text-sm text-waify-text-muted dark:text-waify-dark-text-muted", children: "Control platform-wide feature availability, review workspace adoption, and keep core capabilities locked." })
            ] }),
            /* @__PURE__ */ jsxs(Button, { type: "button", variant: "secondary", onClick: () => router.reload(), children: [
              /* @__PURE__ */ jsx(RefreshCw, { className: "h-4 w-4" }),
              "Refresh"
            ] })
          ] }),
          /* @__PURE__ */ jsx("div", { className: "mt-6 grid gap-3 sm:grid-cols-4", children: [
            ["Total", modules.length, Layers, "success"],
            ["Enabled", enabledCount, PackageCheck, "info"],
            ["Core", coreCount, Crown, "warning"],
            ["Links", workspaceLinks, Users, "secondary"]
          ].map(([label, value, Icon, variant]) => /* @__PURE__ */ jsx("div", { className: "rounded-card border border-gray-100 bg-gray-50/80 p-4 dark:border-waify-dark-border dark:bg-waify-dark-surface-2/60", children: /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between gap-3", children: [
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx("div", { className: "text-[11px] font-medium uppercase tracking-[0.12em] text-waify-text-muted dark:text-waify-dark-text-muted", children: label }),
              /* @__PURE__ */ jsx("div", { className: "mt-1 text-2xl font-bold tabular-nums text-waify-text dark:text-waify-dark-text", children: value })
            ] }),
            /* @__PURE__ */ jsx(Badge, { variant, children: label })
          ] }) }, label)) })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "border-t border-gray-100 bg-gray-50/70 p-5 dark:border-waify-dark-border dark:bg-waify-dark-surface-2/60 lg:border-l lg:border-t-0 sm:p-6", children: [
          /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between", children: [
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx("h2", { className: "text-sm font-semibold text-waify-text dark:text-waify-dark-text", children: "Most adopted" }),
              /* @__PURE__ */ jsx("p", { className: "mt-1 text-xs text-waify-text-muted dark:text-waify-dark-text-muted", children: "Top workspace entitlement usage" })
            ] }),
            /* @__PURE__ */ jsx(Gauge, { className: "h-5 w-5 text-waify-green dark:text-emerald-300" })
          ] }),
          /* @__PURE__ */ jsx("div", { className: "mt-4 space-y-3", children: featured.map((module) => /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsxs("div", { className: "mb-1 flex items-center justify-between gap-3 text-xs", children: [
              /* @__PURE__ */ jsx("span", { className: "truncate font-medium text-waify-text dark:text-waify-dark-text", children: module.name }),
              /* @__PURE__ */ jsx("span", { className: "tabular-nums text-waify-text-muted dark:text-waify-dark-text-muted", children: module.account_count })
            ] }),
            /* @__PURE__ */ jsx(Meter, { value: adoptionPercent(module, maxAccounts) })
          ] }, module.id)) }),
          /* @__PURE__ */ jsx("div", { className: "mt-5 rounded-card border border-amber-100 bg-amber-50 p-3 text-xs text-amber-900 dark:border-amber-400/20 dark:bg-amber-500/10 dark:text-amber-100", children: /* @__PURE__ */ jsxs("div", { className: "flex gap-2", children: [
            /* @__PURE__ */ jsx(AlertTriangle, { className: "mt-0.5 h-4 w-4 shrink-0" }),
            /* @__PURE__ */ jsx("span", { children: "Disabling add-on modules affects assignment and access across all workspaces. Core modules stay locked." })
          ] }) })
        ] })
      ] }) }),
      /* @__PURE__ */ jsxs("div", { className: "grid gap-5 lg:grid-cols-[260px_1fr]", children: [
        /* @__PURE__ */ jsxs("aside", { className: "space-y-4", children: [
          /* @__PURE__ */ jsx(Card, { className: "p-2 lg:sticky lg:top-6", children: /* @__PURE__ */ jsx("div", { className: "space-y-1", children: categories.map((category) => {
            const meta = categoryMeta[category] || categoryMeta.platform;
            const Icon = meta.icon;
            const isActive = scope === category;
            return /* @__PURE__ */ jsxs(
              "button",
              {
                type: "button",
                onClick: () => setScope(category),
                className: cn(
                  "flex w-full items-center gap-3 rounded-btn px-3 py-2.5 text-left transition",
                  isActive ? "bg-waify-green-soft text-waify-green-dark dark:bg-emerald-950/40 dark:text-emerald-300" : "text-waify-text-muted hover:bg-gray-50 hover:text-waify-text dark:text-waify-dark-text-muted dark:hover:bg-slate-700/50 dark:hover:text-waify-dark-text"
                ),
                children: [
                  /* @__PURE__ */ jsx("span", { className: cn("flex h-8 w-8 shrink-0 items-center justify-center rounded-lg", isActive ? "bg-white/80 dark:bg-waify-dark-surface" : "bg-gray-100 dark:bg-waify-dark-surface-2"), children: /* @__PURE__ */ jsx(Icon, { className: "h-4 w-4" }) }),
                  /* @__PURE__ */ jsxs("span", { className: "min-w-0 flex-1", children: [
                    /* @__PURE__ */ jsx("span", { className: "block truncate text-sm font-medium", children: meta.label }),
                    /* @__PURE__ */ jsx("span", { className: "block truncate text-[11px] opacity-80", children: meta.description })
                  ] }),
                  /* @__PURE__ */ jsx("span", { className: "rounded-full bg-white px-2 py-0.5 text-[11px] font-semibold text-waify-text-muted ring-1 ring-gray-100 dark:bg-waify-dark-surface dark:text-waify-dark-text-muted dark:ring-waify-dark-border", children: categoryCounts[category] || 0 })
                ]
              },
              category
            );
          }) }) }),
          /* @__PURE__ */ jsx(Card, { children: /* @__PURE__ */ jsxs(CardContent, { className: "p-4", children: [
            /* @__PURE__ */ jsx("h3", { className: "text-sm font-semibold text-waify-text dark:text-waify-dark-text", children: "Needs review" }),
            /* @__PURE__ */ jsx("p", { className: "mt-1 text-xs text-waify-text-muted dark:text-waify-dark-text-muted", children: "Disabled add-ons in current filter" }),
            /* @__PURE__ */ jsx("div", { className: "mt-4 space-y-2", children: highestRisk.length === 0 ? /* @__PURE__ */ jsx("div", { className: "rounded-card bg-emerald-50 p-3 text-xs text-emerald-800 dark:bg-emerald-400/10 dark:text-emerald-100", children: "No disabled add-ons here." }) : highestRisk.map((module) => /* @__PURE__ */ jsxs(
              "button",
              {
                type: "button",
                onClick: () => setEditing(module),
                className: "flex w-full items-center justify-between gap-3 rounded-btn px-2 py-2 text-left hover:bg-gray-50 dark:hover:bg-waify-dark-surface-2",
                children: [
                  /* @__PURE__ */ jsx("span", { className: "truncate text-xs font-medium text-waify-text dark:text-waify-dark-text", children: module.name }),
                  /* @__PURE__ */ jsx(Badge, { variant: "danger", children: "Off" })
                ]
              },
              module.id
            )) })
          ] }) })
        ] }),
        /* @__PURE__ */ jsxs("main", { className: "min-w-0 space-y-4", children: [
          /* @__PURE__ */ jsxs("div", { className: "flex flex-col gap-3 rounded-card border border-gray-100 bg-white p-3 shadow-card dark:border-waify-dark-border dark:bg-waify-dark-surface dark:shadow-none sm:flex-row sm:items-center sm:justify-between", children: [
            /* @__PURE__ */ jsxs("div", { className: "relative w-full sm:max-w-md", children: [
              /* @__PURE__ */ jsx(Search, { className: "absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-waify-text-muted dark:text-waify-dark-text-muted" }),
              /* @__PURE__ */ jsx(
                "input",
                {
                  value: query,
                  onChange: (event) => setQuery(event.target.value),
                  placeholder: "Search module name, key, or description...",
                  className: "h-10 w-full rounded-btn border border-waify-border bg-white pl-10 pr-3 text-sm outline-none focus:ring-2 focus:ring-waify-green/20 dark:border-waify-dark-border dark:bg-waify-dark-surface-2 dark:text-waify-dark-text"
                }
              )
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "text-sm text-waify-text-muted dark:text-waify-dark-text-muted", children: [
              filtered.length,
              " of ",
              modules.length,
              " modules"
            ] })
          ] }),
          /* @__PURE__ */ jsx("div", { className: "grid gap-4 xl:grid-cols-2", children: filtered.map((module) => {
            const category = moduleCategory(module);
            const meta = categoryMeta[category];
            const Icon = meta.icon;
            const adoption = adoptionPercent(module, maxAccounts);
            const meterTone = !module.is_enabled ? "red" : module.is_core ? "amber" : "green";
            return /* @__PURE__ */ jsxs(
              "article",
              {
                className: cn(
                  "group relative overflow-hidden rounded-card border bg-white shadow-card transition dark:bg-waify-dark-surface dark:shadow-none",
                  module.is_enabled ? "border-gray-100 hover:border-waify-green/40 dark:border-waify-dark-border dark:hover:border-emerald-400/40" : "border-red-100 bg-red-50/20 hover:border-red-200 dark:border-red-400/20 dark:bg-red-500/5"
                ),
                children: [
                  /* @__PURE__ */ jsx("div", { className: cn("absolute inset-y-0 left-0 w-1", module.is_enabled ? "bg-waify-green" : "bg-red-500") }),
                  /* @__PURE__ */ jsxs("div", { className: "p-5", children: [
                    /* @__PURE__ */ jsx("div", { className: "flex items-start justify-between gap-4", children: /* @__PURE__ */ jsxs("div", { className: "flex min-w-0 gap-3", children: [
                      /* @__PURE__ */ jsx(ThemedIconTile, { tone: module.is_core ? "amber" : module.is_enabled ? meta.tone : "red", size: "lg", children: /* @__PURE__ */ jsx(Icon, { className: "h-5 w-5" }) }),
                      /* @__PURE__ */ jsxs("div", { className: "min-w-0", children: [
                        /* @__PURE__ */ jsxs("div", { className: "flex flex-wrap items-center gap-2", children: [
                          /* @__PURE__ */ jsx("h3", { className: "truncate text-base font-semibold text-waify-text dark:text-waify-dark-text", children: module.name }),
                          /* @__PURE__ */ jsx(Badge, { variant: module.is_enabled ? "success" : "danger", children: module.is_enabled ? "Enabled" : "Disabled" }),
                          /* @__PURE__ */ jsx(Badge, { variant: module.is_core ? "warning" : "secondary", children: module.is_core ? "Core" : meta.label })
                        ] }),
                        /* @__PURE__ */ jsx("p", { className: "mt-1 font-mono text-xs text-waify-text-muted dark:text-waify-dark-text-muted", children: module.key })
                      ] })
                    ] }) }),
                    /* @__PURE__ */ jsx("p", { className: "mt-4 min-h-[40px] text-sm leading-5 text-waify-text-muted dark:text-waify-dark-text-muted", children: module.description || "No description has been added for this module yet." }),
                    /* @__PURE__ */ jsxs("div", { className: "mt-5 rounded-card border border-gray-100 bg-gray-50/70 p-3 dark:border-waify-dark-border dark:bg-waify-dark-surface-2/60", children: [
                      /* @__PURE__ */ jsxs("div", { className: "mb-2 flex items-center justify-between text-xs", children: [
                        /* @__PURE__ */ jsx("span", { className: "font-medium text-waify-text-muted dark:text-waify-dark-text-muted", children: "Workspace adoption" }),
                        /* @__PURE__ */ jsxs("span", { className: "font-semibold tabular-nums text-waify-text dark:text-waify-dark-text", children: [
                          module.account_count,
                          " workspace",
                          module.account_count === 1 ? "" : "s"
                        ] })
                      ] }),
                      /* @__PURE__ */ jsx(Meter, { value: adoption, tone: meterTone })
                    ] }),
                    /* @__PURE__ */ jsxs("div", { className: "mt-5 flex flex-wrap items-center justify-between gap-3", children: [
                      /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 text-xs text-waify-text-muted dark:text-waify-dark-text-muted", children: [
                        module.is_core ? /* @__PURE__ */ jsx(Lock, { className: "h-4 w-4" }) : module.is_enabled ? /* @__PURE__ */ jsx(ToggleRight, { className: "h-4 w-4 text-waify-green dark:text-emerald-300" }) : /* @__PURE__ */ jsx(ToggleLeft, { className: "h-4 w-4 text-red-500" }),
                        module.is_core ? "Locked platform base" : module.is_enabled ? "Available to workspaces" : "Unavailable platform-wide"
                      ] }),
                      /* @__PURE__ */ jsxs("div", { className: "flex gap-2", children: [
                        /* @__PURE__ */ jsxs(Button, { type: "button", size: "sm", variant: "secondary", onClick: () => setEditing(module), children: [
                          /* @__PURE__ */ jsx(Edit3, { className: "h-4 w-4" }),
                          "Edit"
                        ] }),
                        /* @__PURE__ */ jsxs(
                          Button,
                          {
                            type: "button",
                            size: "sm",
                            variant: module.is_enabled ? "danger" : "primary",
                            disabled: module.is_core,
                            onClick: () => handleToggle(module),
                            children: [
                              module.is_core ? /* @__PURE__ */ jsx(Lock, { className: "h-4 w-4" }) : module.is_enabled ? /* @__PURE__ */ jsx(ToggleRight, { className: "h-4 w-4" }) : /* @__PURE__ */ jsx(ToggleLeft, { className: "h-4 w-4" }),
                              module.is_core ? "Locked" : module.is_enabled ? "Disable" : "Enable"
                            ]
                          }
                        )
                      ] })
                    ] })
                  ] })
                ]
              },
              module.id
            );
          }) }),
          filtered.length === 0 && /* @__PURE__ */ jsx(Card, { children: /* @__PURE__ */ jsxs(CardContent, { className: "p-12 text-center", children: [
            /* @__PURE__ */ jsx(Search, { className: "mx-auto h-10 w-10 text-waify-text-muted dark:text-waify-dark-text-muted" }),
            /* @__PURE__ */ jsx("p", { className: "mt-3 font-semibold text-waify-text dark:text-waify-dark-text", children: "No modules found" }),
            /* @__PURE__ */ jsx("p", { className: "mt-1 text-sm text-waify-text-muted dark:text-waify-dark-text-muted", children: "Try a different category or search term." })
          ] }) })
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsx(ModuleDrawer, { module: editing, maxAccounts, onClose: () => setEditing(null) })
  ] });
}
export {
  PlatformModulesIndex as default
};
