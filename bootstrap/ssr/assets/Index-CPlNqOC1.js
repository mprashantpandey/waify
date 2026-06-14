import { jsxs, jsx } from "react/jsx-runtime";
import { useState, useEffect } from "react";
import { useForm, Head, Link, router } from "@inertiajs/react";
import { A as AppShell } from "./AppShell-Kl-OcWqz.js";
import { B as Button } from "./Button-BJftGNki.js";
import { B as Badge } from "./Badge-C65MHc2S.js";
import { C as Card } from "./Card-BtIXZ0GS.js";
import { D as Drawer } from "./Elements-EbyZDnT_.js";
import { I as InputError } from "./InputError-DiSBWiye.js";
import { I as InputLabel } from "./InputLabel-BMzefKC8.js";
import { T as TextInput } from "./TextInput-CmkZX80k.js";
import { u as useToast } from "./useToast-BN7qsQL3.js";
import { Plus, Users, Settings, Trash2, Clock, Shield, AlertTriangle, Building2, CheckCircle2, Check, Crown, Zap } from "lucide-react";
import "./utils-B2ZNUmII.js";
import "clsx";
import "tailwind-merge";
import "./BrandingWrapper-CZn0jBQL.js";
import "axios";
import "./CookieConsentBanner-X10ew4Dy.js";
import "./RealtimeProvider-D1qLzQY9.js";
import "laravel-echo";
import "pusher-js";
import "@headlessui/react";
function WorkspaceIndex({
  workspaces,
  canCreateWorkspace = false,
  showCreatePanel = false,
  plans = [],
  defaultPlanKey = "starter",
  workspaceTypes = {}
}) {
  const current = workspaces.find((workspace) => workspace.is_current) || workspaces[0];
  const [createOpen, setCreateOpen] = useState(showCreatePanel);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleteConfirmation, setDeleteConfirmation] = useState("");
  const [deleting, setDeleting] = useState(false);
  const [selectedPlanKey, setSelectedPlanKey] = useState(defaultPlanKey);
  const { toast } = useToast();
  const { data, setData, post, processing, errors, reset } = useForm({
    name: "",
    workspace_type: "business",
    industry: "",
    plan_key: defaultPlanKey
  });
  useEffect(() => {
    setCreateOpen(showCreatePanel);
  }, [showCreatePanel]);
  const switchWorkspace = (workspace) => {
    if (workspace.is_current) return;
    router.post(route("app.accounts.switch", { account: workspace.id }));
  };
  const formatDate = (value) => {
    if (!value) return "No renewal date";
    return new Intl.DateTimeFormat("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric"
    }).format(new Date(value));
  };
  const statusVariant = (status) => {
    if (status === "active") return "success";
    if (status === "trialing") return "info";
    if (status === "past_due") return "warning";
    return "secondary";
  };
  const accent = (workspace) => colorFromName(workspace.name);
  const openCreate = () => {
    setCreateOpen(true);
    router.get(route("app.workspaces.index"), { panel: "create" }, {
      preserveState: true,
      preserveScroll: true,
      replace: true
    });
  };
  const closeCreate = () => {
    setCreateOpen(false);
    router.get(route("app.workspaces.index"), {}, {
      preserveState: true,
      preserveScroll: true,
      replace: true
    });
  };
  const selectPlan = (planKey) => {
    setSelectedPlanKey(planKey);
    setData("plan_key", planKey);
  };
  const submit = (event) => {
    event.preventDefault();
    post(route("app.workspaces.store"), {
      onSuccess: () => {
        reset();
        setSelectedPlanKey(defaultPlanKey);
        setCreateOpen(false);
      },
      onError: (formErrors) => {
        const firstError = Object.values(formErrors)[0];
        toast.error("Workspace was not created", typeof firstError === "string" ? firstError : "Please check the highlighted fields and try again.");
      }
    });
  };
  const openDelete = (workspace) => {
    setDeleteTarget(workspace);
    setDeleteConfirmation("");
  };
  const closeDelete = () => {
    if (deleting) return;
    setDeleteTarget(null);
    setDeleteConfirmation("");
  };
  const deleteWorkspace = () => {
    if (!deleteTarget || deleteConfirmation !== deleteTarget.name) return;
    setDeleting(true);
    router.visit(route("app.workspaces.destroy", { account: deleteTarget.id }), {
      method: "delete",
      data: {
        confirmation_name: deleteConfirmation
      },
      preserveScroll: true,
      onSuccess: () => {
        toast.success("Workspace deleted");
        setDeleteTarget(null);
        setDeleteConfirmation("");
      },
      onError: (formErrors) => {
        const firstError = Object.values(formErrors)[0];
        toast.error("Workspace was not deleted", typeof firstError === "string" ? firstError : "Please check the confirmation and try again.");
      },
      onFinish: () => setDeleting(false)
    });
  };
  return /* @__PURE__ */ jsxs(AppShell, { children: [
    /* @__PURE__ */ jsx(Head, { title: "Workspaces" }),
    /* @__PURE__ */ jsxs("div", { className: "module-page", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex flex-col gap-4 md:flex-row md:items-end md:justify-between", children: [
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("p", { className: "text-xs font-semibold uppercase tracking-[0.22em] text-waify-green-dark", children: "Workspace" }),
          /* @__PURE__ */ jsx("h1", { className: "module-heading", children: "Workspaces" }),
          /* @__PURE__ */ jsx("p", { className: "module-subheading", children: "Switch between brands, clients, branches, and teams." })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex flex-wrap gap-2", children: [
          canCreateWorkspace && /* @__PURE__ */ jsxs(Button, { variant: "secondary", onClick: openCreate, children: [
            /* @__PURE__ */ jsx(Plus, { className: "h-4 w-4" }),
            "New workspace"
          ] }),
          /* @__PURE__ */ jsx(Link, { href: route("app.team.index"), children: /* @__PURE__ */ jsxs(Button, { children: [
            /* @__PURE__ */ jsx(Users, { className: "h-4 w-4" }),
            "Invite member"
          ] }) })
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "grid gap-6 lg:grid-cols-3", children: [
        /* @__PURE__ */ jsxs(Card, { className: "overflow-hidden p-0 lg:col-span-2", children: [
          /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between border-b border-gray-100 px-5 py-4 dark:border-waify-dark-border", children: [
            /* @__PURE__ */ jsx("h2", { className: "font-semibold text-waify-text dark:text-waify-dark-text", children: "Your workspaces" }),
            /* @__PURE__ */ jsxs("span", { className: "text-xs text-waify-text-muted dark:text-waify-dark-text-muted", children: [
              workspaces.length,
              " active"
            ] })
          ] }),
          /* @__PURE__ */ jsx("ul", { className: "divide-y divide-gray-100 dark:divide-waify-dark-border", children: workspaces.map((workspace) => /* @__PURE__ */ jsxs(
            "li",
            {
              className: `flex flex-col gap-4 px-5 py-4 transition sm:flex-row sm:items-center ${workspace.is_current ? "bg-waify-green/5" : "hover:bg-gray-50/80 dark:hover:bg-waify-dark-surface-2/50"}`,
              children: [
                /* @__PURE__ */ jsxs("div", { className: "flex min-w-0 flex-1 items-start gap-4", children: [
                  /* @__PURE__ */ jsx(
                    "span",
                    {
                      className: "flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl text-base font-bold text-white",
                      style: { background: accent(workspace) },
                      children: workspace.name.charAt(0).toUpperCase()
                    }
                  ),
                  /* @__PURE__ */ jsxs("div", { className: "min-w-0 flex-1", children: [
                    /* @__PURE__ */ jsxs("div", { className: "flex flex-wrap items-center gap-2", children: [
                      /* @__PURE__ */ jsx("span", { className: "font-semibold text-waify-text dark:text-waify-dark-text", children: workspace.name }),
                      workspace.is_current && /* @__PURE__ */ jsx(Badge, { variant: "success", children: "Current" }),
                      /* @__PURE__ */ jsx(Badge, { variant: workspace.status === "active" ? "success" : "secondary", children: workspace.status })
                    ] }),
                    /* @__PURE__ */ jsxs("p", { className: "mt-0.5 text-sm text-waify-text-muted dark:text-waify-dark-text-muted", children: [
                      workspace.workspace_type_label,
                      workspace.industry ? ` · ${workspace.industry}` : "",
                      workspace.timezone ? ` · ${workspace.timezone}` : ""
                    ] }),
                    /* @__PURE__ */ jsxs("div", { className: "mt-2 flex flex-wrap gap-2", children: [
                      /* @__PURE__ */ jsx(Badge, { variant: "secondary", children: workspace.plan?.name ?? "No plan" }),
                      /* @__PURE__ */ jsx(Badge, { variant: "secondary", children: workspace.role ?? "member" }),
                      /* @__PURE__ */ jsxs(Badge, { variant: "secondary", children: [
                        workspace.users_count,
                        " members"
                      ] })
                    ] })
                  ] })
                ] }),
                /* @__PURE__ */ jsxs("div", { className: "flex flex-shrink-0 flex-wrap justify-end gap-2", children: [
                  workspace.is_current && ["owner", "admin"].includes(workspace.role ?? "") && /* @__PURE__ */ jsx(Link, { href: route("app.settings"), children: /* @__PURE__ */ jsxs(Button, { variant: "secondary", size: "sm", children: [
                    /* @__PURE__ */ jsx(Settings, { className: "h-4 w-4" }),
                    "Settings"
                  ] }) }),
                  /* @__PURE__ */ jsxs(
                    Button,
                    {
                      variant: "danger",
                      size: "sm",
                      disabled: !workspace.can_delete,
                      title: !workspace.can_delete ? workspace.delete_blocked_reason || "This workspace cannot be deleted." : void 0,
                      onClick: () => openDelete(workspace),
                      children: [
                        /* @__PURE__ */ jsx(Trash2, { className: "h-4 w-4" }),
                        "Delete"
                      ]
                    }
                  ),
                  /* @__PURE__ */ jsx(
                    Button,
                    {
                      variant: workspace.is_current ? "secondary" : "primary",
                      size: "sm",
                      disabled: workspace.is_current,
                      onClick: () => switchWorkspace(workspace),
                      children: workspace.is_current ? "Active" : "Switch"
                    }
                  )
                ] })
              ]
            },
            workspace.id
          )) })
        ] }),
        current && /* @__PURE__ */ jsxs(Card, { className: "h-fit p-5", children: [
          /* @__PURE__ */ jsx("h2", { className: "mb-4 font-semibold text-waify-text dark:text-waify-dark-text", children: "Active workspace" }),
          /* @__PURE__ */ jsxs("div", { className: "mb-5 flex items-center gap-3", children: [
            /* @__PURE__ */ jsx(
              "span",
              {
                className: "flex h-12 w-12 items-center justify-center rounded-xl text-lg font-bold text-white",
                style: { background: accent(current) },
                children: current.name.charAt(0).toUpperCase()
              }
            ),
            /* @__PURE__ */ jsxs("div", { className: "min-w-0", children: [
              /* @__PURE__ */ jsx("div", { className: "truncate font-semibold text-waify-text dark:text-waify-dark-text", children: current.name }),
              /* @__PURE__ */ jsx("div", { className: "truncate text-sm text-waify-text-muted dark:text-waify-dark-text-muted", children: current.slug })
            ] })
          ] }),
          /* @__PURE__ */ jsx("dl", { className: "space-y-3 text-sm", children: [
            ["Plan", current.plan?.name ?? "No plan"],
            ["Your role", current.role ?? "member"],
            ["Team size", `${current.users_count} members`],
            ["Workspace type", current.workspace_type_label]
          ].map(([label, value]) => /* @__PURE__ */ jsxs("div", { className: "flex justify-between gap-4", children: [
            /* @__PURE__ */ jsx("dt", { className: "text-waify-text-muted dark:text-waify-dark-text-muted", children: label }),
            /* @__PURE__ */ jsx("dd", { className: "font-medium text-waify-text dark:text-waify-dark-text", children: value })
          ] }, label)) }),
          current.subscription && /* @__PURE__ */ jsxs("div", { className: "mt-5 rounded-card bg-gray-50 p-4 dark:bg-waify-dark-surface-2", children: [
            /* @__PURE__ */ jsxs("div", { className: "mb-2 flex items-center justify-between gap-3", children: [
              /* @__PURE__ */ jsx(Badge, { variant: statusVariant(current.subscription.status), children: current.subscription.status }),
              /* @__PURE__ */ jsx(Clock, { className: "h-4 w-4 text-waify-text-muted" })
            ] }),
            /* @__PURE__ */ jsxs("p", { className: "text-xs text-waify-text-muted dark:text-waify-dark-text-muted", children: [
              current.subscription.cancel_at_period_end ? "Ends" : "Renews",
              " ",
              formatDate(current.subscription.current_period_end)
            ] })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "mt-5 grid gap-2", children: [
            /* @__PURE__ */ jsx(Link, { href: route("app.team.index"), children: /* @__PURE__ */ jsxs(Button, { className: "w-full", variant: "secondary", children: [
              /* @__PURE__ */ jsx(Shield, { className: "h-4 w-4" }),
              "Roles & permissions"
            ] }) }),
            /* @__PURE__ */ jsx(Link, { href: route("app.billing.index"), children: /* @__PURE__ */ jsx(Button, { className: "w-full", variant: "secondary", children: "Billing overview" }) }),
            /* @__PURE__ */ jsxs("div", { className: "rounded-card border border-red-200 bg-red-50 p-3 dark:border-red-900/60 dark:bg-red-950/30", children: [
              /* @__PURE__ */ jsxs("div", { className: "mb-2 flex items-start gap-2 text-sm text-red-800 dark:text-red-200", children: [
                /* @__PURE__ */ jsx(AlertTriangle, { className: "mt-0.5 h-4 w-4 flex-shrink-0" }),
                /* @__PURE__ */ jsxs("div", { children: [
                  /* @__PURE__ */ jsx("div", { className: "font-semibold", children: "Danger zone" }),
                  /* @__PURE__ */ jsx("p", { className: "text-xs opacity-90", children: "Delete this workspace and its data." })
                ] })
              ] }),
              /* @__PURE__ */ jsxs(
                Button,
                {
                  className: "w-full",
                  variant: "danger",
                  size: "sm",
                  disabled: !current.can_delete,
                  title: !current.can_delete ? current.delete_blocked_reason || "This workspace cannot be deleted." : void 0,
                  onClick: () => openDelete(current),
                  children: [
                    /* @__PURE__ */ jsx(Trash2, { className: "h-4 w-4" }),
                    "Delete workspace"
                  ]
                }
              ),
              !current.can_delete && current.delete_blocked_reason && /* @__PURE__ */ jsx("p", { className: "mt-2 text-xs text-red-700 dark:text-red-200", children: current.delete_blocked_reason })
            ] })
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxs(Card, { className: "overflow-hidden p-0", children: [
        /* @__PURE__ */ jsx("div", { className: "border-b border-gray-100 px-5 py-4 dark:border-waify-dark-border", children: /* @__PURE__ */ jsx("h2", { className: "font-semibold text-waify-text dark:text-waify-dark-text", children: "Workspace directory" }) }),
        /* @__PURE__ */ jsx("div", { className: "overflow-x-auto", children: /* @__PURE__ */ jsxs("table", { className: "w-full text-sm", children: [
          /* @__PURE__ */ jsx("thead", { children: /* @__PURE__ */ jsxs("tr", { className: "bg-gray-50/70 text-left text-[11px] uppercase tracking-wider text-waify-text-muted dark:bg-waify-dark-surface-2/70 dark:text-waify-dark-text-muted", children: [
            /* @__PURE__ */ jsx("th", { className: "px-5 py-3 font-medium", children: "Workspace" }),
            /* @__PURE__ */ jsx("th", { className: "px-5 py-3 font-medium", children: "Role" }),
            /* @__PURE__ */ jsx("th", { className: "px-5 py-3 font-medium", children: "Plan" }),
            /* @__PURE__ */ jsx("th", { className: "px-5 py-3 font-medium", children: "Status" }),
            /* @__PURE__ */ jsx("th", { className: "px-5 py-3 text-right font-medium", children: "Action" })
          ] }) }),
          /* @__PURE__ */ jsx("tbody", { children: workspaces.map((workspace) => /* @__PURE__ */ jsxs("tr", { className: "border-t border-gray-100 dark:border-waify-dark-border", children: [
            /* @__PURE__ */ jsx("td", { className: "px-5 py-3", children: /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
              /* @__PURE__ */ jsx(Building2, { className: "h-4 w-4 text-waify-text-muted" }),
              /* @__PURE__ */ jsx("span", { className: "font-medium text-waify-text dark:text-waify-dark-text", children: workspace.name }),
              workspace.is_current && /* @__PURE__ */ jsx(CheckCircle2, { className: "h-4 w-4 text-waify-green" })
            ] }) }),
            /* @__PURE__ */ jsx("td", { className: "px-5 py-3 capitalize text-waify-text-muted dark:text-waify-dark-text-muted", children: workspace.role ?? "member" }),
            /* @__PURE__ */ jsx("td", { className: "px-5 py-3 text-waify-text-muted dark:text-waify-dark-text-muted", children: workspace.plan?.name ?? "No plan" }),
            /* @__PURE__ */ jsx("td", { className: "px-5 py-3", children: /* @__PURE__ */ jsx(Badge, { variant: workspace.status === "active" ? "success" : "secondary", children: workspace.status }) }),
            /* @__PURE__ */ jsx("td", { className: "px-5 py-3 text-right", children: /* @__PURE__ */ jsxs("div", { className: "flex justify-end gap-2", children: [
              /* @__PURE__ */ jsx(
                Button,
                {
                  size: "sm",
                  variant: "danger",
                  disabled: !workspace.can_delete,
                  title: !workspace.can_delete ? workspace.delete_blocked_reason || "This workspace cannot be deleted." : void 0,
                  onClick: () => openDelete(workspace),
                  children: "Delete"
                }
              ),
              /* @__PURE__ */ jsx(Button, { size: "sm", variant: "secondary", disabled: workspace.is_current, onClick: () => switchWorkspace(workspace), children: workspace.is_current ? "Current" : "Switch" })
            ] }) })
          ] }, workspace.id)) })
        ] }) })
      ] })
    ] }),
    /* @__PURE__ */ jsx(
      Drawer,
      {
        open: createOpen && canCreateWorkspace,
        onClose: closeCreate,
        title: "Create workspace",
        description: "Separate WhatsApp numbers, templates, contacts, campaigns, billing, and team access.",
        className: "sm:max-w-4xl",
        footer: /* @__PURE__ */ jsxs("div", { className: "flex flex-col-reverse gap-2 sm:flex-row sm:justify-end", children: [
          /* @__PURE__ */ jsx(Button, { type: "button", variant: "secondary", onClick: closeCreate, children: "Cancel" }),
          /* @__PURE__ */ jsx(Button, { type: "submit", form: "workspace-create-form", disabled: processing || !data.name.trim(), children: processing ? "Creating..." : "Create workspace" })
        ] }),
        children: /* @__PURE__ */ jsxs("form", { id: "workspace-create-form", onSubmit: submit, className: "grid gap-5 lg:grid-cols-[minmax(0,1fr)_280px]", children: [
          /* @__PURE__ */ jsxs("div", { className: "space-y-5", children: [
            /* @__PURE__ */ jsxs(Card, { className: "p-5", children: [
              /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3", children: [
                /* @__PURE__ */ jsx("div", { className: "flex h-10 w-10 items-center justify-center rounded-card bg-waify-green-soft text-waify-green-dark dark:bg-waify-dark-green-soft dark:text-emerald-200", children: /* @__PURE__ */ jsx(Building2, { className: "h-5 w-5" }) }),
                /* @__PURE__ */ jsxs("div", { children: [
                  /* @__PURE__ */ jsx("h3", { className: "font-semibold text-waify-text dark:text-waify-dark-text", children: "Workspace details" }),
                  /* @__PURE__ */ jsx("p", { className: "text-sm text-waify-text-muted dark:text-waify-dark-text-muted", children: "Name this business, client, branch, or project workspace." })
                ] })
              ] }),
              /* @__PURE__ */ jsxs("div", { className: "mt-5 grid gap-4 md:grid-cols-2", children: [
                Object.keys(errors).length > 0 && /* @__PURE__ */ jsx("div", { className: "md:col-span-2 rounded-card border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-900/60 dark:bg-red-950/30 dark:text-red-200", children: Object.values(errors)[0] || "Please check the highlighted fields and try again." }),
                /* @__PURE__ */ jsxs("div", { className: "md:col-span-2", children: [
                  /* @__PURE__ */ jsx(InputLabel, { htmlFor: "workspace-name", value: "Workspace name" }),
                  /* @__PURE__ */ jsx(
                    TextInput,
                    {
                      id: "workspace-name",
                      type: "text",
                      value: data.name,
                      className: "mt-1 block w-full",
                      onChange: (event) => setData("name", event.target.value),
                      required: true,
                      placeholder: "Example: Mumbai Retail Team"
                    }
                  ),
                  /* @__PURE__ */ jsx(InputError, { message: errors.name, className: "mt-2" })
                ] }),
                /* @__PURE__ */ jsxs("div", { children: [
                  /* @__PURE__ */ jsx(InputLabel, { htmlFor: "workspace-type", value: "Workspace type" }),
                  /* @__PURE__ */ jsx(
                    "select",
                    {
                      id: "workspace-type",
                      value: data.workspace_type,
                      onChange: (event) => setData("workspace_type", event.target.value),
                      className: "waify-input mt-1 block w-full",
                      required: true,
                      children: Object.entries(workspaceTypes).map(([value, label]) => /* @__PURE__ */ jsx("option", { value, children: label }, value))
                    }
                  ),
                  /* @__PURE__ */ jsx(InputError, { message: errors.workspace_type, className: "mt-2" })
                ] }),
                /* @__PURE__ */ jsxs("div", { children: [
                  /* @__PURE__ */ jsx(InputLabel, { htmlFor: "workspace-industry", value: "Industry" }),
                  /* @__PURE__ */ jsx(
                    TextInput,
                    {
                      id: "workspace-industry",
                      type: "text",
                      value: data.industry,
                      className: "mt-1 block w-full",
                      onChange: (event) => setData("industry", event.target.value),
                      placeholder: "Retail, healthcare, education..."
                    }
                  ),
                  /* @__PURE__ */ jsx(InputError, { message: errors.industry, className: "mt-2" })
                ] })
              ] })
            ] }),
            plans.length > 0 && /* @__PURE__ */ jsxs(Card, { className: "p-5", children: [
              /* @__PURE__ */ jsx("h3", { className: "font-semibold text-waify-text dark:text-waify-dark-text", children: "Starting plan" }),
              /* @__PURE__ */ jsx("p", { className: "mt-1 text-sm text-waify-text-muted dark:text-waify-dark-text-muted", children: "You can change this later from billing." }),
              /* @__PURE__ */ jsx("div", { className: "mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-3", children: plans.map((plan) => {
                const Icon = planIcon(plan.key);
                const selected = selectedPlanKey === plan.key;
                const connectionLimit = plan.limits?.whatsapp_connections ?? plan.limits?.connections;
                return /* @__PURE__ */ jsxs(
                  "button",
                  {
                    type: "button",
                    onClick: () => selectPlan(plan.key),
                    className: `rounded-card border bg-white p-4 text-left shadow-card transition hover:-translate-y-0.5 hover:shadow-card-lg dark:bg-waify-dark-surface-2 ${selected ? "border-waify-green ring-2 ring-waify-green" : "border-gray-200 hover:border-gray-300 dark:border-waify-dark-border"}`,
                    children: [
                      /* @__PURE__ */ jsxs("div", { className: "flex items-start justify-between gap-3", children: [
                        /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3", children: [
                          /* @__PURE__ */ jsx("span", { className: "flex h-9 w-9 items-center justify-center rounded-md bg-waify-green-soft text-waify-green-dark dark:bg-emerald-900/30 dark:text-emerald-300", children: /* @__PURE__ */ jsx(Icon, { className: "h-5 w-5" }) }),
                          /* @__PURE__ */ jsxs("div", { children: [
                            /* @__PURE__ */ jsx("div", { className: "font-semibold text-waify-text dark:text-waify-dark-text", children: plan.name }),
                            /* @__PURE__ */ jsxs("div", { className: "text-sm text-waify-text-muted dark:text-waify-dark-text-muted", children: [
                              formatPrice(plan.price_monthly, plan.currency),
                              " / month"
                            ] })
                          ] })
                        ] }),
                        selected && /* @__PURE__ */ jsx(Check, { className: "h-4 w-4 text-waify-green" })
                      ] }),
                      plan.description && /* @__PURE__ */ jsx("p", { className: "mt-3 line-clamp-2 text-sm text-waify-text-muted dark:text-waify-dark-text-muted", children: plan.description }),
                      /* @__PURE__ */ jsxs("div", { className: "mt-3 space-y-1.5 text-xs text-waify-text-muted dark:text-waify-dark-text-muted", children: [
                        connectionLimit !== void 0 && /* @__PURE__ */ jsxs("p", { children: [
                          connectionLimit === -1 ? "1" : connectionLimit,
                          " WhatsApp connection per workspace"
                        ] }),
                        plan.limits?.messages_monthly !== void 0 && /* @__PURE__ */ jsxs("p", { children: [
                          plan.limits.messages_monthly === -1 ? "Unlimited" : Number(plan.limits.messages_monthly).toLocaleString(),
                          " messages/month"
                        ] })
                      ] })
                    ]
                  },
                  plan.id
                );
              }) })
            ] })
          ] }),
          /* @__PURE__ */ jsxs("aside", { className: "space-y-4", children: [
            /* @__PURE__ */ jsxs(Card, { className: "p-5", children: [
              /* @__PURE__ */ jsx("h3", { className: "font-semibold text-waify-text dark:text-waify-dark-text", children: "Preview" }),
              /* @__PURE__ */ jsxs("div", { className: "mt-4 flex items-center gap-3", children: [
                /* @__PURE__ */ jsx("div", { className: "flex h-12 w-12 items-center justify-center rounded-xl bg-waify-green text-lg font-bold text-white", children: (data.name || "W").charAt(0).toUpperCase() }),
                /* @__PURE__ */ jsxs("div", { className: "min-w-0", children: [
                  /* @__PURE__ */ jsx("div", { className: "truncate font-semibold text-waify-text dark:text-waify-dark-text", children: data.name || "New workspace" }),
                  /* @__PURE__ */ jsx("div", { className: "truncate text-sm text-waify-text-muted dark:text-waify-dark-text-muted", children: data.industry || "No industry set" })
                ] })
              ] }),
              /* @__PURE__ */ jsx("dl", { className: "mt-5 space-y-3 text-sm", children: [
                ["Type", workspaceTypes[data.workspace_type] ?? data.workspace_type],
                ["Plan", plans.find((plan) => plan.key === data.plan_key)?.name ?? data.plan_key]
              ].map(([label, value]) => /* @__PURE__ */ jsxs("div", { className: "flex justify-between gap-4", children: [
                /* @__PURE__ */ jsx("dt", { className: "text-waify-text-muted dark:text-waify-dark-text-muted", children: label }),
                /* @__PURE__ */ jsx("dd", { className: "text-right font-medium text-waify-text dark:text-waify-dark-text", children: value })
              ] }, label)) })
            ] }),
            /* @__PURE__ */ jsxs(Card, { className: "p-5", children: [
              /* @__PURE__ */ jsx("h3", { className: "font-semibold text-waify-text dark:text-waify-dark-text", children: "Separated by workspace" }),
              /* @__PURE__ */ jsx("ul", { className: "mt-4 space-y-2.5 text-sm text-waify-text-muted dark:text-waify-dark-text-muted", children: ["WhatsApp numbers", "Templates and campaigns", "Contacts and segments", "Billing and usage"].map((item) => /* @__PURE__ */ jsxs("li", { className: "flex items-center gap-2", children: [
                /* @__PURE__ */ jsx(Check, { className: "h-4 w-4 text-waify-green" }),
                item
              ] }, item)) })
            ] })
          ] })
        ] })
      }
    ),
    /* @__PURE__ */ jsx(
      Drawer,
      {
        open: Boolean(deleteTarget),
        onClose: closeDelete,
        title: "Delete workspace",
        description: "This permanently removes the workspace and its contacts, conversations, campaigns, automations, integrations, billing records, and uploaded assets.",
        className: "sm:max-w-lg",
        footer: /* @__PURE__ */ jsxs("div", { className: "flex flex-col-reverse gap-2 sm:flex-row sm:justify-end", children: [
          /* @__PURE__ */ jsx(Button, { type: "button", variant: "secondary", onClick: closeDelete, disabled: deleting, children: "Cancel" }),
          /* @__PURE__ */ jsx(
            Button,
            {
              type: "button",
              variant: "danger",
              disabled: deleting || !deleteTarget || deleteConfirmation !== deleteTarget.name,
              onClick: deleteWorkspace,
              children: deleting ? "Deleting..." : "Delete workspace"
            }
          )
        ] }),
        children: deleteTarget && /* @__PURE__ */ jsxs("div", { className: "space-y-5", children: [
          /* @__PURE__ */ jsx("div", { className: "rounded-card border border-red-200 bg-red-50 p-4 text-sm text-red-800 dark:border-red-900/60 dark:bg-red-950/30 dark:text-red-200", children: /* @__PURE__ */ jsxs("div", { className: "flex items-start gap-3", children: [
            /* @__PURE__ */ jsx(AlertTriangle, { className: "mt-0.5 h-5 w-5 flex-shrink-0" }),
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx("p", { className: "font-semibold", children: "This action cannot be undone." }),
              /* @__PURE__ */ jsxs("p", { className: "mt-1", children: [
                "Deleting ",
                /* @__PURE__ */ jsx("strong", { children: deleteTarget.name }),
                " will remove all workspace data tied to it. Use this only when the workspace is no longer needed."
              ] })
            ] })
          ] }) }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx(InputLabel, { htmlFor: "delete-workspace-confirmation", value: `Type "${deleteTarget.name}" to confirm` }),
            /* @__PURE__ */ jsx(
              TextInput,
              {
                id: "delete-workspace-confirmation",
                type: "text",
                value: deleteConfirmation,
                className: "mt-1 block w-full",
                onChange: (event) => setDeleteConfirmation(event.target.value),
                autoFocus: true
              }
            )
          ] })
        ] })
      }
    )
  ] });
}
function colorFromName(name) {
  const colors = ["#00A548", "#128C7E", "#2563EB", "#7C3AED", "#DB2777", "#EA580C"];
  const sum = name.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return colors[sum % colors.length];
}
function formatPrice(amount, currency = "INR") {
  if (amount === null || amount === void 0) {
    return "Custom";
  }
  if (amount === 0) {
    return "₹0";
  }
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: currency || "INR",
    minimumFractionDigits: 0
  }).format(amount / 100);
}
function planIcon(key) {
  switch (key.toLowerCase()) {
    case "starter":
      return Zap;
    case "pro":
      return Building2;
    case "enterprise":
      return Crown;
    default:
      return Users;
  }
}
export {
  WorkspaceIndex as default
};
