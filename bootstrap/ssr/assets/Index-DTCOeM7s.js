import { jsxs, jsx } from "react/jsx-runtime";
import { usePage, Head, Link, router } from "@inertiajs/react";
import { useState, useMemo, useEffect } from "react";
import { P as PlatformShell } from "./PlatformShell-BDgjSKtX.js";
import { C as Card, a as CardContent } from "./Card-BtIXZ0GS.js";
import { B as Badge } from "./Badge-C65MHc2S.js";
import { B as Button } from "./Button-BJftGNki.js";
import { A as Avatar, D as Drawer } from "./Elements-EbyZDnT_.js";
import { UserPlus, Users, Search, Shield, Eye, LogIn, CheckCircle2, KeyRound, RotateCcw } from "lucide-react";
import { u as useNotifications } from "./useNotifications-CWqdQOlf.js";
import "axios";
import "./BrandingWrapper-CZn0jBQL.js";
import "./utils-B2ZNUmII.js";
import "clsx";
import "tailwind-merge";
import "./useToast-BN7qsQL3.js";
import "@headlessui/react";
import "./useConfirm-gGqxmsEz.js";
function plainPaginationLabel(label) {
  return label.replace("&laquo;", "Prev").replace("&raquo;", "Next");
}
function PlatformUsersIndex({
  users,
  accounts = [],
  filters,
  selectedUser: initialSelectedUser
}) {
  const { auth } = usePage().props;
  const { confirm, toast } = useNotifications();
  const [localFilters, setLocalFilters] = useState(filters || {});
  const [confirmToggle, setConfirmToggle] = useState(null);
  const [confirmImpersonate, setConfirmImpersonate] = useState(null);
  const [selectedUser, setSelectedUser] = useState(initialSelectedUser || null);
  const [createOpen, setCreateOpen] = useState(false);
  const [createForm, setCreateForm] = useState({
    name: "",
    email: "",
    password: "",
    is_super_admin: false,
    account_id: "",
    account_role: "member"
  });
  const stats = useMemo(() => ({
    total: users.meta?.total ?? users.data.length,
    visible: users.data.length,
    admins: users.data.filter((user) => user.is_super_admin).length,
    standard: users.data.filter((user) => !user.is_super_admin).length
  }), [users.data, users.meta?.total]);
  const applyFilters = () => {
    router.get(route("platform.users.index"), localFilters, {
      preserveState: true,
      preserveScroll: true
    });
  };
  const clearFilters = () => {
    setLocalFilters({});
    router.get(route("platform.users.index"), {}, {
      preserveState: true,
      preserveScroll: true
    });
  };
  const handleToggleSuperAdmin = () => {
    if (!confirmToggle) return;
    const routeName = confirmToggle.action === "make" ? "platform.users.make-super-admin" : "platform.users.remove-super-admin";
    router.post(route(routeName, { user: confirmToggle.user.id }), {}, {
      preserveScroll: true,
      onSuccess: () => {
        toast.success(confirmToggle.action === "make" ? "User is now a super admin" : "Super admin access removed");
        setConfirmToggle(null);
      },
      onError: () => toast.error("Failed to update user role")
    });
  };
  const handleImpersonate = () => {
    if (!confirmImpersonate) return;
    router.post(route("platform.users.impersonate", { user: confirmImpersonate.id }), {}, {
      onSuccess: () => setConfirmImpersonate(null),
      onError: () => toast.error("Failed to start impersonation")
    });
  };
  const handleCreateUser = () => {
    router.post(route("platform.users.store"), createForm, {
      preserveScroll: true,
      onSuccess: () => {
        toast.success("User created");
        setCreateOpen(false);
        setCreateForm({
          name: "",
          email: "",
          password: "",
          is_super_admin: false,
          account_id: "",
          account_role: "member"
        });
      },
      onError: (errors) => {
        toast.error(errors.name || errors.email || errors.password || errors.account_id || "Failed to create user");
      }
    });
  };
  const forcePasswordReset = async (user) => {
    const confirmed = await confirm({
      title: "Force password reset",
      message: `Require ${user.email} to change their password and revoke active sessions?`,
      variant: "warning",
      confirmText: "Force reset",
      cancelText: "Cancel"
    });
    if (!confirmed) return;
    router.post(route("platform.users.force-password-reset", { user: user.id }), {}, {
      preserveScroll: true,
      onSuccess: () => {
        toast.success("Password reset required");
        router.reload({ only: ["users", "selectedUser", "flash"] });
      },
      onError: () => toast.error("Failed to update user")
    });
  };
  const clearPasswordReset = async (user) => {
    const confirmed = await confirm({
      title: "Clear password reset",
      message: `Allow ${user.email} to continue without changing their password?`,
      variant: "info",
      confirmText: "Clear requirement",
      cancelText: "Cancel"
    });
    if (!confirmed) return;
    router.post(route("platform.users.clear-password-reset", { user: user.id }), {}, {
      preserveScroll: true,
      onSuccess: () => {
        toast.success("Password reset requirement cleared");
        router.reload({ only: ["users", "selectedUser", "flash"] });
      },
      onError: () => toast.error("Failed to clear password reset")
    });
  };
  const revokeSessions = async (user) => {
    const confirmed = await confirm({
      title: "Revoke sessions",
      message: `Sign ${user.email} out of all active browser sessions?`,
      variant: "danger",
      confirmText: "Revoke sessions",
      cancelText: "Cancel"
    });
    if (!confirmed) return;
    router.post(route("platform.users.revoke-sessions", { user: user.id }), {}, {
      preserveScroll: true,
      onSuccess: () => {
        toast.success("Sessions revoked");
        router.reload({ only: ["users", "selectedUser", "flash"] });
      },
      onError: () => toast.error("Failed to revoke sessions")
    });
  };
  useEffect(() => {
    setSelectedUser(initialSelectedUser || null);
  }, [initialSelectedUser]);
  const openUser = (user) => {
    router.get(route("platform.users.index"), { ...filters || {}, user: user.id }, {
      preserveState: true,
      preserveScroll: true,
      replace: true
    });
  };
  const closeUser = () => {
    setSelectedUser(null);
    router.get(route("platform.users.index"), filters, {
      preserveState: true,
      preserveScroll: true,
      replace: true
    });
  };
  return /* @__PURE__ */ jsxs(PlatformShell, { auth, children: [
    /* @__PURE__ */ jsx(Head, { title: "Users" }),
    /* @__PURE__ */ jsxs("div", { className: "space-y-4", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between gap-3", children: [
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("h1", { className: "text-xl font-semibold text-waify-text dark:text-waify-dark-text", children: "Users" }),
          /* @__PURE__ */ jsx("p", { className: "text-sm text-waify-text-muted dark:text-waify-dark-text-muted", children: "Create platform admins, workspace users, and chat agents." })
        ] }),
        /* @__PURE__ */ jsxs(Button, { onClick: () => setCreateOpen(true), children: [
          /* @__PURE__ */ jsx(UserPlus, { className: "h-4 w-4" }),
          "Add user"
        ] })
      ] }),
      /* @__PURE__ */ jsx("div", { className: "grid gap-4 sm:grid-cols-2 xl:grid-cols-4", children: [
        { label: "Users", value: stats.total, icon: Users, tone: "bg-blue-50 text-blue-600 dark:bg-blue-950/40" },
        { label: "Visible", value: stats.visible, icon: Search, tone: "bg-waify-green-soft text-waify-green-dark" },
        { label: "Super admins", value: stats.admins, icon: Shield, tone: "bg-purple-50 text-purple-600 dark:bg-purple-950/40" },
        { label: "Standard users", value: stats.standard, icon: UserPlus, tone: "bg-amber-50 text-amber-600 dark:bg-amber-950/40" }
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
        /* @__PURE__ */ jsxs("div", { className: "ml-auto flex items-center gap-2", children: [
          /* @__PURE__ */ jsx(Button, { size: "sm", variant: "secondary", onClick: clearFilters, children: "Reset" }),
          /* @__PURE__ */ jsx(Button, { size: "sm", onClick: applyFilters, children: "Apply" })
        ] })
      ] }),
      /* @__PURE__ */ jsx(Card, { className: "overflow-hidden", children: /* @__PURE__ */ jsxs(CardContent, { className: "p-0", children: [
        /* @__PURE__ */ jsx("div", { className: "overflow-x-auto", children: /* @__PURE__ */ jsxs("table", { className: "w-full text-sm", children: [
          /* @__PURE__ */ jsx("thead", { children: /* @__PURE__ */ jsxs("tr", { className: "border-b border-gray-100 bg-gray-50/50 text-left text-xs uppercase tracking-wider text-waify-text-muted dark:border-slate-700 dark:bg-slate-800/40", children: [
            /* @__PURE__ */ jsx("th", { className: "px-5 py-3 font-semibold", children: "User" }),
            /* @__PURE__ */ jsx("th", { className: "px-5 py-3 font-semibold", children: "Role" }),
            /* @__PURE__ */ jsx("th", { className: "px-5 py-3 font-semibold", children: "Status" }),
            /* @__PURE__ */ jsx("th", { className: "px-5 py-3 font-semibold", children: "Created" }),
            /* @__PURE__ */ jsx("th", { className: "px-5 py-3 font-semibold" })
          ] }) }),
          /* @__PURE__ */ jsx("tbody", { children: users.data.map((user) => /* @__PURE__ */ jsxs("tr", { className: "border-b border-gray-100 transition hover:bg-gray-50/50 dark:border-slate-700/80 dark:hover:bg-slate-800/30", children: [
            /* @__PURE__ */ jsx("td", { className: "px-5 py-3", children: /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
              /* @__PURE__ */ jsx(Avatar, { name: user.name, size: "sm" }),
              /* @__PURE__ */ jsxs("div", { children: [
                /* @__PURE__ */ jsx("div", { className: "font-medium text-waify-text dark:text-waify-dark-text", children: user.name }),
                /* @__PURE__ */ jsx("div", { className: "text-xs text-waify-text-muted dark:text-waify-dark-text-muted", children: user.email })
              ] })
            ] }) }),
            /* @__PURE__ */ jsxs("td", { className: "px-5 py-3", children: [
              user.is_super_admin ? /* @__PURE__ */ jsxs(Badge, { variant: "info", className: "inline-flex items-center gap-1", children: [
                /* @__PURE__ */ jsx(Shield, { className: "h-3 w-3" }),
                "Super admin"
              ] }) : /* @__PURE__ */ jsx("span", { className: "text-waify-text-muted dark:text-waify-dark-text-muted", children: "User" }),
              user.two_factor_enabled && /* @__PURE__ */ jsx(Badge, { variant: "success", className: "ml-2", children: "2FA" }),
              user.force_password_reset_at && /* @__PURE__ */ jsx(Badge, { variant: "warning", className: "ml-2", children: "Reset required" })
            ] }),
            /* @__PURE__ */ jsx("td", { className: "px-5 py-3", children: /* @__PURE__ */ jsx(Badge, { variant: "success", children: "active" }) }),
            /* @__PURE__ */ jsx("td", { className: "px-5 py-3 text-waify-text-muted dark:text-waify-dark-text-muted", children: new Date(user.created_at).toLocaleDateString() }),
            /* @__PURE__ */ jsx("td", { className: "px-5 py-3 text-right", children: /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-end gap-2", children: [
              /* @__PURE__ */ jsxs(Button, { variant: "ghost", size: "sm", onClick: () => openUser(user), children: [
                /* @__PURE__ */ jsx(Eye, { className: "h-4 w-4" }),
                "View"
              ] }),
              !user.is_super_admin && user.id !== auth?.user?.id && /* @__PURE__ */ jsxs(Button, { variant: "secondary", size: "sm", onClick: () => setConfirmImpersonate(user), children: [
                /* @__PURE__ */ jsx(LogIn, { className: "h-4 w-4" }),
                "Impersonate"
              ] }),
              user.is_super_admin ? /* @__PURE__ */ jsx(Button, { variant: "secondary", size: "sm", onClick: () => setConfirmToggle({ user, action: "remove" }), children: "Remove admin" }) : /* @__PURE__ */ jsxs(Button, { variant: "secondary", size: "sm", onClick: () => setConfirmToggle({ user, action: "make" }), children: [
                /* @__PURE__ */ jsx(Shield, { className: "h-4 w-4" }),
                "Make admin"
              ] })
            ] }) })
          ] }, user.id)) })
        ] }) }),
        users.data.length === 0 && /* @__PURE__ */ jsx("div", { className: "p-8 text-center text-sm text-waify-text-muted dark:text-waify-dark-text-muted", children: "No users match this search." })
      ] }) }),
      users.links && users.links.length > 3 && /* @__PURE__ */ jsx("div", { className: "flex flex-wrap items-center justify-center gap-2", children: users.links.map((link, index) => link.url ? /* @__PURE__ */ jsx(
        Link,
        {
          href: link.url,
          className: `rounded-btn px-3 py-2 text-sm font-semibold ${link.active ? "bg-waify-green text-white" : "surface ring-1 ring-gray-100 hover:bg-gray-50 dark:ring-slate-700"}`,
          children: plainPaginationLabel(link.label)
        },
        `${link.label}-${index}`
      ) : /* @__PURE__ */ jsx("span", { className: "rounded-btn bg-gray-100 px-3 py-2 text-sm text-waify-text-muted opacity-60 dark:bg-slate-800", children: plainPaginationLabel(link.label) }, `${link.label}-${index}`)) })
    ] }),
    /* @__PURE__ */ jsx(
      Drawer,
      {
        open: createOpen,
        onClose: () => setCreateOpen(false),
        title: "Add user",
        description: "Create a platform user or assign a chat agent to a workspace.",
        className: "sm:max-w-lg",
        footer: /* @__PURE__ */ jsxs("div", { className: "flex justify-end gap-2", children: [
          /* @__PURE__ */ jsx(Button, { variant: "secondary", onClick: () => setCreateOpen(false), children: "Cancel" }),
          /* @__PURE__ */ jsxs(Button, { onClick: handleCreateUser, children: [
            /* @__PURE__ */ jsx(UserPlus, { className: "h-4 w-4" }),
            "Create"
          ] })
        ] }),
        children: /* @__PURE__ */ jsxs("div", { className: "space-y-4", children: [
          /* @__PURE__ */ jsxs("div", { className: "grid gap-4 sm:grid-cols-2", children: [
            /* @__PURE__ */ jsxs("label", { className: "space-y-1.5", children: [
              /* @__PURE__ */ jsx("span", { className: "text-xs font-semibold text-waify-text dark:text-waify-dark-text", children: "Name" }),
              /* @__PURE__ */ jsx(
                "input",
                {
                  value: createForm.name,
                  onChange: (event) => setCreateForm((current) => ({ ...current, name: event.target.value })),
                  className: "h-10 w-full rounded-btn border border-waify-border bg-white px-3 text-sm outline-none focus:ring-2 focus:ring-waify-green/20 dark:border-slate-600 dark:bg-slate-900"
                }
              )
            ] }),
            /* @__PURE__ */ jsxs("label", { className: "space-y-1.5", children: [
              /* @__PURE__ */ jsx("span", { className: "text-xs font-semibold text-waify-text dark:text-waify-dark-text", children: "Email" }),
              /* @__PURE__ */ jsx(
                "input",
                {
                  type: "email",
                  value: createForm.email,
                  onChange: (event) => setCreateForm((current) => ({ ...current, email: event.target.value })),
                  className: "h-10 w-full rounded-btn border border-waify-border bg-white px-3 text-sm outline-none focus:ring-2 focus:ring-waify-green/20 dark:border-slate-600 dark:bg-slate-900"
                }
              )
            ] })
          ] }),
          /* @__PURE__ */ jsxs("label", { className: "space-y-1.5", children: [
            /* @__PURE__ */ jsx("span", { className: "text-xs font-semibold text-waify-text dark:text-waify-dark-text", children: "Password" }),
            /* @__PURE__ */ jsx(
              "input",
              {
                type: "password",
                value: createForm.password,
                onChange: (event) => setCreateForm((current) => ({ ...current, password: event.target.value })),
                className: "h-10 w-full rounded-btn border border-waify-border bg-white px-3 text-sm outline-none focus:ring-2 focus:ring-waify-green/20 dark:border-slate-600 dark:bg-slate-900"
              }
            )
          ] }),
          /* @__PURE__ */ jsxs("label", { className: "flex items-center justify-between gap-3 rounded-card border border-gray-100 p-3 dark:border-waify-dark-border", children: [
            /* @__PURE__ */ jsxs("span", { children: [
              /* @__PURE__ */ jsx("span", { className: "block text-sm font-semibold text-waify-text dark:text-waify-dark-text", children: "Platform admin" }),
              /* @__PURE__ */ jsx("span", { className: "block text-xs text-waify-text-muted dark:text-waify-dark-text-muted", children: "Full access to platform admin panel." })
            ] }),
            /* @__PURE__ */ jsx(
              "input",
              {
                type: "checkbox",
                checked: createForm.is_super_admin,
                onChange: (event) => setCreateForm((current) => ({ ...current, is_super_admin: event.target.checked })),
                className: "h-4 w-4 rounded border-gray-300 text-waify-green focus:ring-waify-green"
              }
            )
          ] }),
          !createForm.is_super_admin && /* @__PURE__ */ jsxs("div", { className: "grid gap-4 sm:grid-cols-[minmax(0,1fr)_160px]", children: [
            /* @__PURE__ */ jsxs("label", { className: "space-y-1.5", children: [
              /* @__PURE__ */ jsx("span", { className: "text-xs font-semibold text-waify-text dark:text-waify-dark-text", children: "Workspace" }),
              /* @__PURE__ */ jsxs(
                "select",
                {
                  value: createForm.account_id,
                  onChange: (event) => setCreateForm((current) => ({ ...current, account_id: event.target.value })),
                  className: "h-10 w-full rounded-btn border border-waify-border bg-white px-3 text-sm outline-none focus:ring-2 focus:ring-waify-green/20 dark:border-slate-600 dark:bg-slate-900",
                  children: [
                    /* @__PURE__ */ jsx("option", { value: "", children: "No workspace" }),
                    accounts.map((account) => /* @__PURE__ */ jsx("option", { value: account.id, children: account.name }, account.id))
                  ]
                }
              )
            ] }),
            /* @__PURE__ */ jsxs("label", { className: "space-y-1.5", children: [
              /* @__PURE__ */ jsx("span", { className: "text-xs font-semibold text-waify-text dark:text-waify-dark-text", children: "Role" }),
              /* @__PURE__ */ jsxs(
                "select",
                {
                  value: createForm.account_role,
                  onChange: (event) => setCreateForm((current) => ({ ...current, account_role: event.target.value })),
                  className: "h-10 w-full rounded-btn border border-waify-border bg-white px-3 text-sm outline-none focus:ring-2 focus:ring-waify-green/20 dark:border-slate-600 dark:bg-slate-900",
                  children: [
                    /* @__PURE__ */ jsx("option", { value: "member", children: "Agent" }),
                    /* @__PURE__ */ jsx("option", { value: "admin", children: "Workspace admin" })
                  ]
                }
              )
            ] })
          ] })
        ] })
      }
    ),
    /* @__PURE__ */ jsx(
      Drawer,
      {
        open: Boolean(confirmToggle),
        onClose: () => setConfirmToggle(null),
        title: confirmToggle?.action === "make" ? "Make super admin" : "Remove super admin",
        description: confirmToggle?.user.email,
        className: "sm:max-w-md",
        footer: /* @__PURE__ */ jsxs("div", { className: "flex justify-end gap-2", children: [
          /* @__PURE__ */ jsx(Button, { variant: "secondary", onClick: () => setConfirmToggle(null), children: "Cancel" }),
          /* @__PURE__ */ jsx(Button, { variant: confirmToggle?.action === "remove" ? "warning" : "primary", onClick: handleToggleSuperAdmin, children: "Confirm" })
        ] }),
        children: /* @__PURE__ */ jsx("p", { className: "text-sm leading-6 text-waify-text-muted dark:text-waify-dark-text-muted", children: confirmToggle?.action === "make" ? "This user will have full platform admin access." : "This user will lose platform admin access. Make sure another super admin remains." })
      }
    ),
    /* @__PURE__ */ jsx(
      Drawer,
      {
        open: Boolean(selectedUser),
        onClose: closeUser,
        title: selectedUser?.name || "User details",
        description: selectedUser?.email,
        className: "sm:max-w-md",
        footer: /* @__PURE__ */ jsx("div", { className: "flex justify-end gap-2", children: /* @__PURE__ */ jsx(Button, { variant: "secondary", onClick: closeUser, children: "Close" }) }),
        children: selectedUser && /* @__PURE__ */ jsxs("div", { className: "space-y-4", children: [
          /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3", children: [
            /* @__PURE__ */ jsx(Avatar, { name: selectedUser.name, size: "lg" }),
            /* @__PURE__ */ jsxs("div", { className: "min-w-0", children: [
              /* @__PURE__ */ jsx("p", { className: "truncate font-semibold text-waify-text dark:text-waify-dark-text", children: selectedUser.name }),
              /* @__PURE__ */ jsx("p", { className: "truncate text-sm text-waify-text-muted dark:text-waify-dark-text-muted", children: selectedUser.email })
            ] })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "rounded-card border border-gray-100 bg-gray-50 p-4 dark:border-waify-dark-border dark:bg-waify-dark-surface-2", children: [
            /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between gap-3", children: [
              /* @__PURE__ */ jsx("span", { className: "text-sm text-waify-text-muted dark:text-waify-dark-text-muted", children: "Role" }),
              selectedUser.is_super_admin ? /* @__PURE__ */ jsx(Badge, { variant: "info", children: "Super admin" }) : /* @__PURE__ */ jsx(Badge, { variant: "secondary", children: "User" })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "mt-3 flex items-center justify-between gap-3", children: [
              /* @__PURE__ */ jsx("span", { className: "text-sm text-waify-text-muted dark:text-waify-dark-text-muted", children: "Created" }),
              /* @__PURE__ */ jsx("span", { className: "text-sm font-semibold text-waify-text dark:text-waify-dark-text", children: new Date(selectedUser.created_at).toLocaleDateString() })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "mt-3 flex items-center justify-between gap-3", children: [
              /* @__PURE__ */ jsx("span", { className: "text-sm text-waify-text-muted dark:text-waify-dark-text-muted", children: "2FA" }),
              selectedUser.two_factor_enabled ? /* @__PURE__ */ jsx(Badge, { variant: "success", children: "Enabled" }) : /* @__PURE__ */ jsx(Badge, { variant: "warning", children: "Not enabled" })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "mt-3 flex items-center justify-between gap-3", children: [
              /* @__PURE__ */ jsx("span", { className: "text-sm text-waify-text-muted dark:text-waify-dark-text-muted", children: "Password reset" }),
              selectedUser.force_password_reset_at ? /* @__PURE__ */ jsx(Badge, { variant: "warning", children: "Required" }) : /* @__PURE__ */ jsx(Badge, { variant: "success", children: "Clear" })
            ] })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
            /* @__PURE__ */ jsxs("div", { className: "rounded-card border border-gray-100 p-3 dark:border-waify-dark-border", children: [
              /* @__PURE__ */ jsx("p", { className: "text-xs text-waify-text-muted dark:text-waify-dark-text-muted", children: "Owned workspaces" }),
              /* @__PURE__ */ jsx("p", { className: "mt-1 text-xl font-bold text-waify-text dark:text-waify-dark-text", children: selectedUser.owned_accounts_count ?? 0 })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "rounded-card border border-gray-100 p-3 dark:border-waify-dark-border", children: [
              /* @__PURE__ */ jsx("p", { className: "text-xs text-waify-text-muted dark:text-waify-dark-text-muted", children: "Member workspaces" }),
              /* @__PURE__ */ jsx("p", { className: "mt-1 text-xl font-bold text-waify-text dark:text-waify-dark-text", children: selectedUser.member_accounts_count ?? 0 })
            ] })
          ] }),
          !selectedUser.is_super_admin && selectedUser.id !== auth?.user?.id && /* @__PURE__ */ jsxs(Button, { className: "w-full", onClick: () => setConfirmImpersonate(selectedUser), children: [
            /* @__PURE__ */ jsx(LogIn, { className: "h-4 w-4" }),
            "Impersonate user"
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "grid gap-2 sm:grid-cols-2", children: [
            selectedUser.force_password_reset_at ? /* @__PURE__ */ jsxs(Button, { variant: "secondary", onClick: () => clearPasswordReset(selectedUser), children: [
              /* @__PURE__ */ jsx(CheckCircle2, { className: "h-4 w-4" }),
              "Clear reset"
            ] }) : /* @__PURE__ */ jsxs(Button, { variant: "secondary", onClick: () => forcePasswordReset(selectedUser), children: [
              /* @__PURE__ */ jsx(KeyRound, { className: "h-4 w-4" }),
              "Force reset"
            ] }),
            /* @__PURE__ */ jsxs(Button, { variant: "secondary", onClick: () => revokeSessions(selectedUser), children: [
              /* @__PURE__ */ jsx(RotateCcw, { className: "h-4 w-4" }),
              "Revoke sessions"
            ] })
          ] })
        ] })
      }
    ),
    /* @__PURE__ */ jsx(
      Drawer,
      {
        open: Boolean(confirmImpersonate),
        onClose: () => setConfirmImpersonate(null),
        title: "Impersonate user",
        description: confirmImpersonate?.email,
        className: "sm:max-w-md",
        footer: /* @__PURE__ */ jsxs("div", { className: "flex justify-end gap-2", children: [
          /* @__PURE__ */ jsx(Button, { variant: "secondary", onClick: () => setConfirmImpersonate(null), children: "Cancel" }),
          /* @__PURE__ */ jsxs(Button, { onClick: handleImpersonate, children: [
            /* @__PURE__ */ jsx(LogIn, { className: "h-4 w-4" }),
            "Impersonate"
          ] })
        ] }),
        children: /* @__PURE__ */ jsx("p", { className: "text-sm leading-6 text-waify-text-muted dark:text-waify-dark-text-muted", children: "You will be signed in as this user. Use Stop Impersonation from the user menu to return to the platform panel." })
      }
    )
  ] });
}
export {
  PlatformUsersIndex as default
};
