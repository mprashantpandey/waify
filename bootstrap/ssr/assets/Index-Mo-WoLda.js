import { jsxs, jsx } from "react/jsx-runtime";
import { usePage, Head, Link, router } from "@inertiajs/react";
import { useState, useMemo, useEffect } from "react";
import { P as PlatformShell } from "./PlatformShell-BDgjSKtX.js";
import { C as Card, a as CardContent } from "./Card-BtIXZ0GS.js";
import { B as Badge } from "./Badge-C65MHc2S.js";
import { B as Button } from "./Button-BJftGNki.js";
import { D as Drawer } from "./Elements-EbyZDnT_.js";
import { u as useNotifications } from "./useNotifications-CWqdQOlf.js";
import { Building2, CheckCircle2, Ban, Users, Search, Download, Eye, Zap, MessageSquare, Wallet, CreditCard, LogIn } from "lucide-react";
import "axios";
import "./BrandingWrapper-CZn0jBQL.js";
import "./utils-B2ZNUmII.js";
import "clsx";
import "tailwind-merge";
import "./useToast-BN7qsQL3.js";
import "@headlessui/react";
import "./useConfirm-gGqxmsEz.js";
function WorkspaceStatusBadge({ status }) {
  const map = {
    active: "success",
    trial: "info",
    trialing: "info",
    suspended: "warning",
    disabled: "danger"
  };
  return /* @__PURE__ */ jsx(Badge, { variant: map[status] || "default", children: status.replace("_", " ") });
}
function initials(name) {
  return name.split(" ").filter(Boolean).slice(0, 2).map((part) => part.charAt(0).toUpperCase()).join("");
}
function colorFor(name) {
  const palette = ["#00A548", "#3B82F6", "#8B5CF6", "#EC4899", "#F59E0B", "#14B8A6", "#EF4444", "#6366F1"];
  let hash = 0;
  for (let index = 0; index < name.length; index += 1) {
    hash = name.charCodeAt(index) + ((hash << 5) - hash);
  }
  return palette[Math.abs(hash) % palette.length];
}
function plainPaginationLabel(label) {
  return label.replace("&laquo;", "Prev").replace("&raquo;", "Next");
}
function formatMoney(amount, currency) {
  return new Intl.NumberFormat("en-IN", { style: "currency", currency: currency || "INR" }).format((amount || 0) / 100);
}
function PlatformTenantsIndex({
  accounts,
  plans = [],
  filters,
  selectedAccount
}) {
  const { auth } = usePage().props;
  const { confirm, toast } = useNotifications();
  const [localFilters, setLocalFilters] = useState(filters || {});
  const [selected, setSelected] = useState(selectedAccount || null);
  const [selectedIds, setSelectedIds] = useState([]);
  const [walletAmount, setWalletAmount] = useState("0");
  const [planKey, setPlanKey] = useState("");
  const [planCycle, setPlanCycle] = useState("monthly");
  const [planNotes, setPlanNotes] = useState("");
  const [assigningPlan, setAssigningPlan] = useState(false);
  const [assignPlanError, setAssignPlanError] = useState(null);
  const [assignPlanStatus, setAssignPlanStatus] = useState(null);
  const [walletBusy, setWalletBusy] = useState(false);
  const stats = useMemo(() => ({
    total: accounts.meta?.total ?? accounts.data.length,
    active: accounts.data.filter((account) => account.status === "active").length,
    disabled: accounts.data.filter((account) => account.status === "disabled").length,
    selected: selectedIds.length
  }), [accounts.data, accounts.meta?.total, selectedIds.length]);
  const applyFilters = () => {
    router.get(route("platform.accounts.index"), localFilters, {
      preserveState: true,
      preserveScroll: true
    });
  };
  const clearFilters = () => {
    setLocalFilters({});
    router.get(route("platform.accounts.index"), {}, {
      preserveState: true,
      preserveScroll: true
    });
  };
  const toggleSelect = (id) => {
    setSelectedIds((ids) => ids.includes(id) ? ids.filter((value) => value !== id) : [...ids, id]);
  };
  const handleDisable = async (accountId, accountName) => {
    const confirmed = await confirm({
      title: "Disable workspace",
      message: `Disable "${accountName}"? Users will not be able to access it.`,
      variant: "danger",
      confirmText: "Disable",
      cancelText: "Cancel"
    });
    if (confirmed) {
      router.post(
        route("platform.accounts.disable", { account: accountId }),
        { reason: "Disabled by platform admin" },
        {
          preserveScroll: true,
          onSuccess: () => toast.success("Workspace disabled successfully"),
          onError: () => toast.error("Failed to disable workspace")
        }
      );
    }
  };
  const handleEnable = async (accountId, accountName) => {
    const confirmed = await confirm({
      title: "Enable workspace",
      message: `Enable "${accountName}"?`,
      variant: "info",
      confirmText: "Enable",
      cancelText: "Cancel"
    });
    if (confirmed) {
      router.post(
        route("platform.accounts.enable", { account: accountId }),
        {},
        {
          preserveScroll: true,
          onSuccess: () => toast.success("Workspace enabled successfully"),
          onError: () => toast.error("Failed to enable workspace")
        }
      );
    }
  };
  useEffect(() => {
    setSelected(selectedAccount || null);
    setPlanKey(selectedAccount?.subscription?.plan?.key || plans[0]?.key || "");
    setAssignPlanError(null);
    setAssignPlanStatus(null);
  }, [selectedAccount, plans]);
  const openAccount = (account) => {
    router.get(route("platform.accounts.index"), { ...filters || {}, account: account.id }, {
      preserveState: true,
      preserveScroll: true,
      replace: true
    });
  };
  const closeAccount = () => {
    setSelected(null);
    router.get(route("platform.accounts.index"), filters, {
      preserveState: true,
      preserveScroll: true,
      replace: true
    });
  };
  const assignPlan = async () => {
    if (!selected || !planKey) return;
    const plan = plans.find((candidate) => candidate.key === planKey);
    setAssigningPlan(true);
    setAssignPlanError(null);
    setAssignPlanStatus(`Assigning ${plan?.name || planKey}...`);
    try {
      router.visit(`/platform/accounts/${selected.id}/plan`, {
        method: "post",
        data: {
          plan_key: planKey,
          billing_cycle: planCycle,
          notes: planNotes || void 0
        },
        preserveScroll: true,
        onSuccess: () => {
          const updatedSelected = {
            ...selected,
            subscription: {
              ...selected.subscription || { id: 0, status: "active" },
              status: "active",
              provider: "manual",
              plan: plan ? { id: plan.id, key: plan.key, name: plan.name } : selected.subscription?.plan || null
            }
          };
          setSelected(updatedSelected);
          setAssignPlanStatus(`${plan?.name || planKey} assigned. Refreshing workspace details...`);
          toast.success("Plan assigned successfully");
          router.reload({
            only: ["accounts", "selectedAccount", "plans", "flash"]
          });
        },
        onError: (errors) => {
          const message = String(errors.plan_key || errors.plan || Object.values(errors)[0] || "Failed to assign plan");
          setAssignPlanError(message);
          setAssignPlanStatus(null);
          toast.error("Failed to assign plan", message);
        },
        onFinish: () => setAssigningPlan(false)
      });
    } catch (error) {
      const message = error?.message || "Could not send plan assignment request.";
      setAssignPlanError(message);
      setAssignPlanStatus(null);
      setAssigningPlan(false);
      toast.error("Failed to assign plan", message);
    }
  };
  const adjustWallet = async (direction) => {
    if (!selected) return;
    const amountMinor = Number(walletAmount);
    if (!Number.isFinite(amountMinor) || amountMinor <= 0) {
      toast.error("Enter a valid wallet amount");
      return;
    }
    const label = direction === "credit" ? "Credit wallet" : "Debit wallet";
    const confirmed = await confirm({
      title: label,
      message: `${direction === "credit" ? "Add" : "Remove"} ${formatMoney(amountMinor, selected.wallet?.currency || "INR")} ${direction === "credit" ? "to" : "from"} ${selected.name}?`,
      variant: direction === "credit" ? "info" : "danger",
      confirmText: direction === "credit" ? "Credit" : "Debit",
      cancelText: "Cancel"
    });
    if (!confirmed) return;
    setWalletBusy(true);
    router.post(
      route(direction === "credit" ? "platform.accounts.wallet.credit" : "platform.accounts.wallet.debit", { account: selected.id }),
      { amount_minor: amountMinor, notes: direction === "credit" ? "Platform credit" : "Platform debit" },
      {
        preserveScroll: true,
        onSuccess: () => {
          toast.success(direction === "credit" ? "Wallet credited" : "Wallet debited");
          const delta = direction === "credit" ? amountMinor : -amountMinor;
          setSelected((current) => current?.wallet ? { ...current, wallet: { ...current.wallet, balance_minor: current.wallet.balance_minor + delta } } : current);
          router.reload({ only: ["accounts", "selectedAccount", "flash"] });
        },
        onError: (errors) => {
          toast.error(direction === "credit" ? "Credit failed" : "Debit failed", String(Object.values(errors)[0] || "Could not update wallet balance."));
        },
        onFinish: () => setWalletBusy(false)
      }
    );
  };
  return /* @__PURE__ */ jsxs(PlatformShell, { auth, children: [
    /* @__PURE__ */ jsx(Head, { title: "Workspaces" }),
    /* @__PURE__ */ jsxs("div", { className: "space-y-4", children: [
      selectedIds.length > 0 && /* @__PURE__ */ jsxs("div", { className: "sticky top-0 z-20 flex flex-wrap items-center gap-3 rounded-card border border-waify-green/25 bg-waify-green-soft px-4 py-3 text-sm shadow-card dark:border-waify-green/30 dark:bg-waify-green/10", children: [
        /* @__PURE__ */ jsxs("span", { className: "font-semibold text-waify-text dark:text-waify-dark-text", children: [
          selectedIds.length,
          " selected"
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "ml-auto flex flex-wrap gap-2", children: [
          /* @__PURE__ */ jsx(Button, { size: "sm", variant: "secondary", onClick: () => toast.info("Bulk email is not wired yet"), children: "Email" }),
          /* @__PURE__ */ jsx(Button, { size: "sm", variant: "secondary", onClick: () => toast.info("Bulk plan change is not wired yet"), children: "Change plan" }),
          /* @__PURE__ */ jsx(Button, { size: "sm", variant: "danger", onClick: () => toast.info("Use row actions for now"), children: "Suspend" }),
          /* @__PURE__ */ jsx(Button, { size: "sm", variant: "ghost", onClick: () => setSelectedIds([]), children: "Clear" })
        ] })
      ] }),
      /* @__PURE__ */ jsx("div", { className: "grid gap-4 sm:grid-cols-2 xl:grid-cols-4", children: [
        { label: "Workspaces", value: stats.total, icon: Building2, tone: "bg-blue-50 text-blue-600 dark:bg-blue-950/40" },
        { label: "Active on page", value: stats.active, icon: CheckCircle2, tone: "bg-waify-green-soft text-waify-green-dark" },
        { label: "Disabled on page", value: stats.disabled, icon: Ban, tone: "bg-red-50 text-red-600 dark:bg-red-950/40" },
        { label: "Selected", value: stats.selected, icon: Users, tone: "bg-purple-50 text-purple-600 dark:bg-purple-950/40" }
      ].map((item) => {
        const Icon = item.icon;
        return /* @__PURE__ */ jsx(Card, { className: "transition-shadow hover:shadow-card-lg", children: /* @__PURE__ */ jsxs(CardContent, { className: "p-4", children: [
          /* @__PURE__ */ jsx("span", { className: `flex h-9 w-9 items-center justify-center rounded-lg ${item.tone}`, children: /* @__PURE__ */ jsx(Icon, { className: "h-[18px] w-[18px]" }) }),
          /* @__PURE__ */ jsx("div", { className: "mt-3 text-2xl font-bold tabular-nums text-waify-text dark:text-waify-dark-text", children: item.value }),
          /* @__PURE__ */ jsx("div", { className: "mt-1 text-xs text-waify-text-muted dark:text-waify-dark-text-muted", children: item.label })
        ] }) }, item.label);
      }) }),
      /* @__PURE__ */ jsxs("div", { className: "mb-4 flex flex-wrap items-center gap-3", children: [
        /* @__PURE__ */ jsxs("div", { className: "relative min-w-[200px] flex-1 max-w-md", children: [
          /* @__PURE__ */ jsx(Search, { className: "absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" }),
          /* @__PURE__ */ jsx(
            "input",
            {
              value: localFilters.search || "",
              onChange: (event) => setLocalFilters({ ...localFilters, search: event.target.value }),
              onKeyDown: (event) => event.key === "Enter" && applyFilters(),
              placeholder: "Search...",
              className: "h-10 w-full rounded-btn border border-waify-border bg-white pl-10 pr-3 text-sm outline-none focus:ring-2 focus:ring-waify-green/20 dark:border-slate-600 dark:bg-slate-900"
            }
          )
        ] }),
        /* @__PURE__ */ jsxs(
          "select",
          {
            value: localFilters.status || "",
            onChange: (event) => setLocalFilters({ ...localFilters, status: event.target.value || null }),
            className: "h-10 w-40 rounded-btn border border-waify-border bg-white px-3 text-sm outline-none focus:ring-2 focus:ring-waify-green/20 dark:border-slate-600 dark:bg-slate-900",
            children: [
              /* @__PURE__ */ jsx("option", { value: "", children: "All status" }),
              /* @__PURE__ */ jsx("option", { value: "active", children: "Active" }),
              /* @__PURE__ */ jsx("option", { value: "suspended", children: "Suspended" }),
              /* @__PURE__ */ jsx("option", { value: "disabled", children: "Disabled" })
            ]
          }
        ),
        /* @__PURE__ */ jsxs("div", { className: "ml-auto flex items-center gap-2", children: [
          /* @__PURE__ */ jsx(Button, { size: "sm", variant: "secondary", onClick: clearFilters, children: "Reset" }),
          /* @__PURE__ */ jsxs(Button, { size: "sm", variant: "secondary", onClick: () => toast.info("Export will use filtered workspace data"), children: [
            /* @__PURE__ */ jsx(Download, { className: "h-4 w-4" }),
            "Export"
          ] }),
          /* @__PURE__ */ jsx(Button, { size: "sm", onClick: applyFilters, children: "Apply" })
        ] })
      ] }),
      /* @__PURE__ */ jsx(Card, { className: "overflow-hidden", children: /* @__PURE__ */ jsxs(CardContent, { className: "p-0", children: [
        /* @__PURE__ */ jsx("div", { className: "overflow-x-auto", children: /* @__PURE__ */ jsxs("table", { className: "w-full text-sm", children: [
          /* @__PURE__ */ jsx("thead", { children: /* @__PURE__ */ jsxs("tr", { className: "border-b border-gray-100 bg-gray-50/50 text-left text-xs uppercase tracking-wider text-waify-text-muted dark:border-slate-700 dark:bg-slate-800/40", children: [
            /* @__PURE__ */ jsx("th", { className: "w-10 px-3 py-3", children: /* @__PURE__ */ jsx("span", { className: "sr-only", children: "Select" }) }),
            /* @__PURE__ */ jsx("th", { className: "px-5 py-3 font-semibold", children: "Workspace" }),
            /* @__PURE__ */ jsx("th", { className: "px-5 py-3 font-semibold", children: "Owner" }),
            /* @__PURE__ */ jsx("th", { className: "px-5 py-3 font-semibold", children: "Type" }),
            /* @__PURE__ */ jsx("th", { className: "px-5 py-3 font-semibold", children: "Status" }),
            /* @__PURE__ */ jsx("th", { className: "px-5 py-3 font-semibold", children: "Created" }),
            /* @__PURE__ */ jsx("th", { className: "px-5 py-3 font-semibold" })
          ] }) }),
          /* @__PURE__ */ jsx("tbody", { children: accounts.data.map((account) => /* @__PURE__ */ jsxs(
            "tr",
            {
              className: `border-b border-gray-100 transition hover:bg-gray-50/50 dark:border-slate-700/80 dark:hover:bg-slate-800/30 ${selectedIds.includes(account.id) ? "bg-waify-green/5" : ""}`,
              children: [
                /* @__PURE__ */ jsx("td", { className: "px-3 py-3", children: /* @__PURE__ */ jsx("input", { type: "checkbox", checked: selectedIds.includes(account.id), onChange: () => toggleSelect(account.id), className: "rounded border-gray-300" }) }),
                /* @__PURE__ */ jsx("td", { className: "px-5 py-3", children: /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
                  /* @__PURE__ */ jsx("span", { className: "flex h-8 w-8 items-center justify-center rounded-lg text-xs font-bold text-white", style: { background: colorFor(account.name) }, children: initials(account.name) }),
                  /* @__PURE__ */ jsxs("div", { className: "min-w-0", children: [
                    /* @__PURE__ */ jsx("div", { className: "font-medium text-waify-text dark:text-waify-dark-text", children: account.name }),
                    /* @__PURE__ */ jsx("div", { className: "text-[11px] text-waify-text-muted dark:text-waify-dark-text-muted", children: account.slug })
                  ] })
                ] }) }),
                /* @__PURE__ */ jsxs("td", { className: "px-5 py-3", children: [
                  /* @__PURE__ */ jsx("div", { className: "font-medium text-waify-text dark:text-waify-dark-text", children: account.owner.name }),
                  /* @__PURE__ */ jsx("div", { className: "text-xs text-waify-text-muted dark:text-waify-dark-text-muted", children: account.owner.email })
                ] }),
                /* @__PURE__ */ jsx("td", { className: "px-5 py-3 text-waify-text-muted dark:text-waify-dark-text-muted", children: account.workspace_type_label || account.workspace_type || "-" }),
                /* @__PURE__ */ jsx("td", { className: "px-5 py-3", children: /* @__PURE__ */ jsx(WorkspaceStatusBadge, { status: account.status }) }),
                /* @__PURE__ */ jsx("td", { className: "px-5 py-3 text-waify-text-muted dark:text-waify-dark-text-muted", children: new Date(account.created_at).toLocaleDateString() }),
                /* @__PURE__ */ jsx("td", { className: "px-5 py-3 text-right", children: /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-end gap-2", children: [
                  /* @__PURE__ */ jsx(Button, { size: "sm", variant: "secondary", onClick: () => openAccount(account), children: "Manage" }),
                  /* @__PURE__ */ jsxs(Button, { size: "sm", variant: "ghost", onClick: () => openAccount(account), children: [
                    /* @__PURE__ */ jsx(Eye, { className: "h-4 w-4" }),
                    "View"
                  ] })
                ] }) })
              ]
            },
            account.id
          )) })
        ] }) }),
        accounts.data.length === 0 && /* @__PURE__ */ jsx("div", { className: "p-8 text-center text-sm text-waify-text-muted dark:text-waify-dark-text-muted", children: "No workspaces match these filters." })
      ] }) }),
      accounts.links && accounts.links.length > 3 && /* @__PURE__ */ jsx("div", { className: "flex flex-wrap items-center justify-center gap-2", children: accounts.links.map((link, index) => link.url ? /* @__PURE__ */ jsx(
        Link,
        {
          href: link.url,
          className: `rounded-btn px-3 py-2 text-sm font-semibold ${link.active ? "bg-waify-green text-white" : "surface ring-1 ring-gray-100 hover:bg-gray-50 dark:ring-slate-700"}`,
          children: plainPaginationLabel(link.label)
        },
        `${link.label}-${index}`
      ) : /* @__PURE__ */ jsx("span", { className: "rounded-btn bg-gray-100 px-3 py-2 text-sm text-waify-text-muted opacity-60 dark:bg-slate-800", children: plainPaginationLabel(link.label) }, `${link.label}-${index}`)) })
    ] }),
    /* @__PURE__ */ jsx(Drawer, { open: Boolean(selected), onClose: closeAccount, title: selected?.name, className: "sm:max-w-4xl", children: selected && /* @__PURE__ */ jsxs("div", { className: "space-y-5", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3", children: [
        /* @__PURE__ */ jsx("span", { className: "flex h-12 w-12 items-center justify-center rounded-xl text-base font-bold text-white", style: { background: colorFor(selected.name) }, children: initials(selected.name) }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("div", { className: "font-semibold text-waify-text dark:text-waify-dark-text", children: selected.name }),
          /* @__PURE__ */ jsx("div", { className: "font-mono text-xs text-waify-text-muted dark:text-waify-dark-text-muted", children: selected.slug })
        ] })
      ] }),
      /* @__PURE__ */ jsx("dl", { className: "grid grid-cols-2 gap-3 text-sm", children: [
        ["Owner", selected.owner.name],
        ["Email", selected.owner.email],
        ["Type", selected.workspace_type_label || selected.workspace_type || "-"],
        ["Industry", selected.industry || "-"],
        ["Timezone", selected.timezone || "-"],
        ["Created", new Date(selected.created_at).toLocaleDateString()]
      ].map(([key, value]) => /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("dt", { className: "text-xs text-waify-text-muted dark:text-waify-dark-text-muted", children: key }),
        /* @__PURE__ */ jsx("dd", { className: "mt-0.5 font-medium text-waify-text dark:text-waify-dark-text", children: value })
      ] }, key)) }),
      /* @__PURE__ */ jsxs("div", { className: "flex flex-wrap gap-2", children: [
        /* @__PURE__ */ jsx(WorkspaceStatusBadge, { status: selected.status }),
        selected.disabled_reason && /* @__PURE__ */ jsx(Badge, { variant: "warning", children: selected.disabled_reason }),
        selected.subscription?.plan && /* @__PURE__ */ jsx(Badge, { variant: "info", children: selected.subscription.plan.name }),
        selected.subscription && /* @__PURE__ */ jsx(Badge, { variant: "secondary", children: selected.subscription.status })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "rounded-card border border-gray-100 p-4 dark:border-waify-dark-border", children: [
        /* @__PURE__ */ jsxs("div", { className: "flex flex-wrap items-start justify-between gap-3", children: [
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("p", { className: "text-sm font-semibold text-waify-text dark:text-waify-dark-text", children: "Assign plan" }),
            /* @__PURE__ */ jsx("p", { className: "mt-1 text-xs text-waify-text-muted dark:text-waify-dark-text-muted", children: "Platform admin override. This activates the workspace subscription without payment collection." })
          ] }),
          selected.subscription?.current_period_end && /* @__PURE__ */ jsxs(Badge, { variant: "secondary", children: [
            "Renews ",
            new Date(selected.subscription.current_period_end).toLocaleDateString()
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "mt-4 grid gap-2 md:grid-cols-[minmax(0,1fr)_130px]", children: [
          /* @__PURE__ */ jsx(
            "select",
            {
              value: planKey,
              onChange: (event) => setPlanKey(event.target.value),
              className: "waify-input",
              children: plans.map((plan) => /* @__PURE__ */ jsxs("option", { value: plan.key, children: [
                plan.name,
                " · ",
                formatMoney(plan.price_monthly || 0, plan.currency),
                "/mo"
              ] }, plan.key))
            }
          ),
          /* @__PURE__ */ jsxs(
            "select",
            {
              value: planCycle,
              onChange: (event) => setPlanCycle(event.target.value),
              className: "waify-input",
              children: [
                /* @__PURE__ */ jsx("option", { value: "monthly", children: "Monthly" }),
                /* @__PURE__ */ jsx("option", { value: "yearly", children: "Yearly" })
              ]
            }
          )
        ] }),
        /* @__PURE__ */ jsx(
          "input",
          {
            value: planNotes,
            onChange: (event) => setPlanNotes(event.target.value),
            className: "waify-input mt-2",
            placeholder: "Admin note, optional"
          }
        ),
        assignPlanError && /* @__PURE__ */ jsx("div", { className: "mt-2 rounded-card border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-200", children: assignPlanError }),
        assignPlanStatus && /* @__PURE__ */ jsx("div", { className: "mt-2 rounded-card border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs text-emerald-700 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-200", children: assignPlanStatus }),
        /* @__PURE__ */ jsx(Button, { type: "button", size: "sm", className: "mt-3", onClick: assignPlan, disabled: !planKey || assigningPlan, children: assigningPlan ? "Assigning..." : "Assign plan" })
      ] }),
      selected.wallet && /* @__PURE__ */ jsx("div", { className: "grid gap-3 sm:grid-cols-2 lg:grid-cols-4", children: [
        { label: "Members", value: selected.members_count || 0, icon: Users },
        { label: "Modules", value: selected.modules_enabled || 0, icon: Zap },
        { label: "WABA links", value: selected.whatsapp_connections_count || 0, icon: Building2 },
        { label: "Conversations", value: selected.conversations_count || 0, icon: MessageSquare }
      ].map((item) => {
        const Icon = item.icon;
        return /* @__PURE__ */ jsxs("div", { className: "rounded-card border border-gray-100 p-3 dark:border-waify-dark-border", children: [
          /* @__PURE__ */ jsx(Icon, { className: "h-4 w-4 text-waify-green dark:text-emerald-300" }),
          /* @__PURE__ */ jsx("p", { className: "mt-2 text-lg font-bold text-waify-text dark:text-waify-dark-text", children: item.value }),
          /* @__PURE__ */ jsx("p", { className: "text-xs text-waify-text-muted dark:text-waify-dark-text-muted", children: item.label })
        ] }, item.label);
      }) }),
      selected.wallet && /* @__PURE__ */ jsxs("div", { className: "rounded-card border border-gray-100 p-4 dark:border-waify-dark-border", children: [
        /* @__PURE__ */ jsxs("div", { className: "flex flex-wrap items-center justify-between gap-3", children: [
          /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3", children: [
            /* @__PURE__ */ jsx("span", { className: "flex h-10 w-10 items-center justify-center rounded-btn bg-waify-green-soft text-waify-green-dark dark:bg-emerald-400/10 dark:text-emerald-200", children: /* @__PURE__ */ jsx(Wallet, { className: "h-5 w-5" }) }),
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx("p", { className: "text-sm font-semibold text-waify-text dark:text-waify-dark-text", children: "Wallet balance" }),
              /* @__PURE__ */ jsx("p", { className: "text-2xl font-bold tabular-nums text-waify-text dark:text-waify-dark-text", children: formatMoney(selected.wallet.balance_minor, selected.wallet.currency) })
            ] })
          ] }),
          /* @__PURE__ */ jsx(Link, { href: route("platform.transactions.index"), className: "text-sm font-semibold text-waify-green-dark hover:underline dark:text-emerald-300", children: "Transactions" })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "mt-4 flex flex-col gap-2 sm:flex-row", children: [
          /* @__PURE__ */ jsx(
            "input",
            {
              type: "number",
              min: 1,
              value: walletAmount,
              onChange: (event) => setWalletAmount(event.target.value),
              className: "waify-input",
              placeholder: "Amount in minor units"
            }
          ),
          /* @__PURE__ */ jsxs(Button, { size: "sm", onClick: () => adjustWallet("credit"), disabled: walletBusy, children: [
            /* @__PURE__ */ jsx(CreditCard, { className: "h-4 w-4" }),
            walletBusy ? "Working..." : "Credit"
          ] }),
          /* @__PURE__ */ jsx(Button, { size: "sm", variant: "danger", onClick: () => adjustWallet("debit"), disabled: walletBusy, children: "Debit" })
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "flex flex-col gap-2 border-t border-gray-100 pt-2 dark:border-slate-700", children: [
        /* @__PURE__ */ jsxs(
          Button,
          {
            className: "w-full",
            onClick: () => router.post(
              route("platform.accounts.impersonate", { account: selected.id }),
              {},
              { onError: () => toast.error("Failed to start workspace impersonation") }
            ),
            children: [
              /* @__PURE__ */ jsx(LogIn, { className: "h-4 w-4" }),
              "Impersonate workspace"
            ]
          }
        ),
        selected.status === "active" ? /* @__PURE__ */ jsxs(Button, { className: "w-full", variant: "danger", onClick: () => handleDisable(selected.id, selected.name), children: [
          /* @__PURE__ */ jsx(Ban, { className: "h-4 w-4" }),
          "Disable workspace"
        ] }) : /* @__PURE__ */ jsxs(Button, { className: "w-full", variant: "secondary", onClick: () => handleEnable(selected.id, selected.name), children: [
          /* @__PURE__ */ jsx(CheckCircle2, { className: "h-4 w-4" }),
          "Enable workspace"
        ] })
      ] })
    ] }) })
  ] });
}
export {
  PlatformTenantsIndex as default
};
