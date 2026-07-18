import { jsxs, jsx, Fragment } from "react/jsx-runtime";
import { Head, router } from "@inertiajs/react";
import { useState, useMemo } from "react";
import { Shield, Plus, Users, User, Crown, MoreHorizontal, Trash2, RefreshCw, Mail, Send, Save, X } from "lucide-react";
import { A as AppShell } from "./AppShell-BMIA1AnI.js";
import { B as Button } from "./Button-BJftGNki.js";
import { T as TextInput } from "./TextInput-CmkZX80k.js";
import { C as Card, b as CardHeader, c as CardTitle, d as CardDescription } from "./Card-BtIXZ0GS.js";
import { T as ThemedIconTile, A as Avatar, b as TagPill, S as StatusBadge, I as IconButton } from "./Elements-EbyZDnT_.js";
import { u as useNotifications } from "./useNotifications-CWqdQOlf.js";
import "./utils-B2ZNUmII.js";
import "clsx";
import "tailwind-merge";
import "./BrandLogo-TeztHB0m.js";
import "axios";
import "./Badge-C65MHc2S.js";
import "./BrandingWrapper-DdVUILzh.js";
import "./useToast-BN7qsQL3.js";
import "./CookieConsentBanner-X10ew4Dy.js";
import "./RealtimeProvider-D1qLzQY9.js";
import "laravel-echo";
import "pusher-js";
import "@headlessui/react";
import "./useConfirm-gGqxmsEz.js";
const roleTone = (role, isOwner = false) => {
  if (isOwner || role === "owner") return "warning";
  if (role === "admin") return "info";
  if (role === "member") return "muted";
  return "success";
};
function formatDate(value) {
  if (!value) return "Recently";
  return new Date(value).toLocaleDateString(void 0, { month: "short", day: "numeric", year: "numeric" });
}
function roleName(roles, role, isOwner = false) {
  if (isOwner) return "Owner";
  return roles.find((item) => item.key === role)?.name ?? role;
}
function permissionGroup(permission) {
  if (permission.group) return permission.group;
  if (permission.key.includes(".")) return permission.key.split(".")[0].replace(/_/g, " ");
  return "core";
}
function permissionTone(permission) {
  if (permission.endsWith(".owner") || permission === "payments.approve") return "warning";
  if (permission === "chats.delete" || permission.includes("delete")) return "danger";
  if (permission.includes("export")) return "info";
  return "muted";
}
function Drawer({
  title,
  description,
  open,
  onClose,
  children
}) {
  if (!open) return null;
  return /* @__PURE__ */ jsxs("div", { className: "fixed inset-0 z-[250] flex justify-end bg-black/45 backdrop-blur-sm", role: "dialog", "aria-modal": "true", children: [
    /* @__PURE__ */ jsx("button", { type: "button", className: "absolute inset-0", "aria-label": "Close", onClick: onClose }),
    /* @__PURE__ */ jsxs("aside", { className: "relative flex h-full w-full max-w-xl flex-col overflow-hidden border-l border-gray-200 bg-white shadow-pop dark:border-waify-dark-border dark:bg-waify-dark-surface", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex items-start justify-between gap-4 border-b border-gray-100 px-6 py-5 dark:border-waify-dark-border", children: [
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("h2", { className: "text-lg font-semibold text-waify-text dark:text-waify-dark-text", children: title }),
          description && /* @__PURE__ */ jsx("p", { className: "mt-1 text-sm text-waify-text-muted dark:text-waify-dark-text-muted", children: description })
        ] }),
        /* @__PURE__ */ jsx(IconButton, { "aria-label": "Close", onClick: onClose, children: /* @__PURE__ */ jsx(X, { className: "h-4 w-4" }) })
      ] }),
      /* @__PURE__ */ jsx("div", { className: "flex-1 overflow-y-auto px-6 py-5", children })
    ] })
  ] });
}
function TeamIndex({
  members,
  can_manage,
  can_manage_roles,
  current_user_id,
  pending_invites,
  roles,
  permissions
}) {
  const { confirm, toast } = useNotifications();
  const [inviteOpen, setInviteOpen] = useState(false);
  const [roleOpen, setRoleOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState("member");
  const [processingInvite, setProcessingInvite] = useState(false);
  const [openMenu, setOpenMenu] = useState(null);
  const [roleForm, setRoleForm] = useState({ id: null, name: "", description: "", permissions: ["inbox"] });
  const assignableRoles = useMemo(() => roles.filter((role) => !role.is_owner), [roles]);
  const groupedPermissions = useMemo(() => {
    return permissions.reduce((groups, permission) => {
      const group = permissionGroup(permission);
      groups[group] = [...groups[group] || [], permission];
      return groups;
    }, {});
  }, [permissions]);
  const activeMembers = members.length;
  const agents = members.filter((member) => !member.is_owner).length;
  const resetRoleForm = () => setRoleForm({ id: null, name: "", description: "", permissions: ["inbox"] });
  const togglePermission = (permission) => {
    setRoleForm((current) => ({
      ...current,
      permissions: current.permissions.includes(permission) ? current.permissions.filter((item) => item !== permission) : [...current.permissions, permission]
    }));
  };
  const handleInvite = () => {
    if (!inviteEmail.trim()) {
      toast.error("Please enter an email");
      return;
    }
    setProcessingInvite(true);
    router.post(
      route("app.team.invite", {}),
      { email: inviteEmail.trim(), role: inviteRole },
      {
        preserveScroll: true,
        onSuccess: () => {
          setInviteEmail("");
          setInviteRole("member");
          setInviteOpen(false);
        },
        onError: (errors) => toast.error(errors.email || errors.role || errors.error || "Failed to invite agent"),
        onFinish: () => setProcessingInvite(false)
      }
    );
  };
  const updateMemberRole = (member, role) => {
    router.post(route("app.team.update-role", { user: member.id }), { role }, {
      preserveScroll: true,
      onError: () => toast.error("Failed to update role")
    });
  };
  const handleRemove = async (member) => {
    const confirmed = await confirm({
      title: "Remove agent",
      message: `Remove ${member.name} from this workspace?`,
      variant: "danger",
      confirmText: "Remove"
    });
    if (!confirmed) return;
    router.delete(route("app.team.remove", { user: member.id }), {
      preserveScroll: true,
      onError: () => toast.error("Failed to remove member")
    });
  };
  const handleRevokeInvite = async (invite) => {
    const confirmed = await confirm({
      title: "Revoke invitation",
      message: `Revoke invitation for ${invite.email}?`,
      variant: "danger",
      confirmText: "Revoke"
    });
    if (!confirmed) return;
    router.delete(route("app.team.invites.revoke", { invitation: invite.id }), {
      preserveScroll: true,
      onError: () => toast.error("Failed to revoke invitation")
    });
  };
  const handleResendInvite = async (invite) => {
    const confirmed = await confirm({
      title: "Resend invitation",
      message: `Resend invitation to ${invite.email}?`,
      variant: "info",
      confirmText: "Resend"
    });
    if (!confirmed) return;
    router.post(route("app.team.invites.resend", { invitation: invite.id }), {}, {
      preserveScroll: true,
      onError: () => toast.error("Failed to resend invitation")
    });
  };
  const openCreateRole = () => {
    resetRoleForm();
    setRoleOpen(true);
  };
  const openEditRole = (role) => {
    if (role.is_system || typeof role.id !== "number") return;
    setRoleForm({
      id: role.id,
      name: role.name,
      description: role.description ?? "",
      permissions: role.permissions.length ? role.permissions : ["inbox"]
    });
    setRoleOpen(true);
  };
  const saveRole = () => {
    if (!roleForm.name.trim()) {
      toast.error("Role name is required");
      return;
    }
    const payload = {
      name: roleForm.name.trim(),
      description: roleForm.description.trim() || null,
      permissions: roleForm.permissions.length ? roleForm.permissions : ["inbox"]
    };
    const options = {
      preserveScroll: true,
      onSuccess: () => {
        setRoleOpen(false);
        resetRoleForm();
      },
      onError: () => toast.error("Failed to save role")
    };
    if (roleForm.id) {
      router.patch(route("app.team.roles.update", { role: roleForm.id }), payload, options);
    } else {
      router.post(route("app.team.roles.store", {}), payload, options);
    }
  };
  const deleteRole = async (role) => {
    if (role.is_system || typeof role.id !== "number") return;
    const confirmed = await confirm({
      title: "Delete role",
      message: `Delete ${role.name}? Members must be moved before a role can be deleted.`,
      variant: "danger",
      confirmText: "Delete"
    });
    if (!confirmed) return;
    router.delete(route("app.team.roles.delete", { role: role.id }), {
      preserveScroll: true,
      onError: () => toast.error("Failed to delete role")
    });
  };
  return /* @__PURE__ */ jsxs(AppShell, { children: [
    /* @__PURE__ */ jsx(Head, { title: "Agents & roles" }),
    /* @__PURE__ */ jsxs("div", { className: "mx-auto max-w-[1220px] space-y-5", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex flex-col gap-3 md:flex-row md:items-center md:justify-between", children: [
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("p", { className: "text-sm font-medium uppercase tracking-wide text-waify-text-muted dark:text-waify-dark-text-muted", children: "Workspace access" }),
          /* @__PURE__ */ jsx("h1", { className: "mt-1 text-2xl font-semibold text-waify-text dark:text-waify-dark-text", children: "Agents & roles" })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex flex-wrap gap-2", children: [
          can_manage_roles && /* @__PURE__ */ jsxs(Button, { variant: "secondary", onClick: openCreateRole, children: [
            /* @__PURE__ */ jsx(Shield, { className: "h-4 w-4" }),
            " Create role"
          ] }),
          can_manage && /* @__PURE__ */ jsxs(Button, { onClick: () => setInviteOpen(true), children: [
            /* @__PURE__ */ jsx(Plus, { className: "h-4 w-4" }),
            " Create agent"
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "grid gap-3 md:grid-cols-3", children: [
        /* @__PURE__ */ jsx(Card, { className: "p-4", children: /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3", children: [
          /* @__PURE__ */ jsx(ThemedIconTile, { tone: "green", children: /* @__PURE__ */ jsx(Users, { className: "h-5 w-5" }) }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("p", { className: "text-sm text-waify-text-muted dark:text-waify-dark-text-muted", children: "Active members" }),
            /* @__PURE__ */ jsx("p", { className: "text-2xl font-semibold text-waify-text dark:text-waify-dark-text", children: activeMembers })
          ] })
        ] }) }),
        /* @__PURE__ */ jsx(Card, { className: "p-4", children: /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3", children: [
          /* @__PURE__ */ jsx(ThemedIconTile, { tone: "blue", children: /* @__PURE__ */ jsx(User, { className: "h-5 w-5" }) }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("p", { className: "text-sm text-waify-text-muted dark:text-waify-dark-text-muted", children: "Agents" }),
            /* @__PURE__ */ jsx("p", { className: "text-2xl font-semibold text-waify-text dark:text-waify-dark-text", children: agents })
          ] })
        ] }) }),
        /* @__PURE__ */ jsx(Card, { className: "p-4", children: /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3", children: [
          /* @__PURE__ */ jsx(ThemedIconTile, { tone: "purple", children: /* @__PURE__ */ jsx(Shield, { className: "h-5 w-5" }) }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("p", { className: "text-sm text-waify-text-muted dark:text-waify-dark-text-muted", children: "Roles" }),
            /* @__PURE__ */ jsx("p", { className: "text-2xl font-semibold text-waify-text dark:text-waify-dark-text", children: roles.length })
          ] })
        ] }) })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "grid gap-5 xl:grid-cols-[minmax(0,1fr)_380px]", children: [
        /* @__PURE__ */ jsxs(Card, { className: "overflow-hidden p-0", children: [
          /* @__PURE__ */ jsxs(CardHeader, { children: [
            /* @__PURE__ */ jsx(CardTitle, { children: "Agents" }),
            /* @__PURE__ */ jsx(CardDescription, { children: "Invite staff, assign roles, and keep owners separate from workspace agents." })
          ] }),
          /* @__PURE__ */ jsx("div", { className: "overflow-x-auto", children: /* @__PURE__ */ jsxs("table", { className: "w-full text-sm", children: [
            /* @__PURE__ */ jsx("thead", { children: /* @__PURE__ */ jsxs("tr", { className: "bg-gray-50/60 text-left text-[11px] uppercase tracking-wider text-waify-text-muted dark:bg-waify-dark-surface-2 dark:text-waify-dark-text-muted", children: [
              /* @__PURE__ */ jsx("th", { className: "px-5 py-3 font-medium", children: "Member" }),
              /* @__PURE__ */ jsx("th", { className: "px-5 py-3 font-medium", children: "Role" }),
              /* @__PURE__ */ jsx("th", { className: "px-5 py-3 font-medium", children: "Status" }),
              /* @__PURE__ */ jsx("th", { className: "w-12 px-5 py-3 font-medium" })
            ] }) }),
            /* @__PURE__ */ jsxs("tbody", { children: [
              members.map((member) => /* @__PURE__ */ jsxs("tr", { className: "border-t border-gray-100 transition hover:bg-gray-50/60 dark:border-waify-dark-border dark:hover:bg-waify-dark-surface-2/70", children: [
                /* @__PURE__ */ jsx("td", { className: "px-5 py-3.5", children: /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3", children: [
                  /* @__PURE__ */ jsx(Avatar, { name: member.name, size: "md", status: member.id === current_user_id ? "online" : void 0 }),
                  /* @__PURE__ */ jsxs("div", { className: "min-w-0", children: [
                    /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
                      /* @__PURE__ */ jsx("p", { className: "font-medium text-waify-text dark:text-waify-dark-text", children: member.name }),
                      member.id === current_user_id && /* @__PURE__ */ jsx(TagPill, { tone: "success", className: "py-0.5 text-[10px]", children: "You" })
                    ] }),
                    /* @__PURE__ */ jsx("p", { className: "truncate text-xs text-waify-text-muted dark:text-waify-dark-text-muted", children: member.email })
                  ] })
                ] }) }),
                /* @__PURE__ */ jsx("td", { className: "px-5 py-3.5", children: can_manage && !member.is_owner ? /* @__PURE__ */ jsx(
                  "select",
                  {
                    value: member.role,
                    onChange: (event) => updateMemberRole(member, event.target.value),
                    className: "h-9 rounded-btn border border-gray-200 bg-white px-3 text-sm text-waify-text outline-none dark:border-waify-dark-border dark:bg-waify-dark-surface dark:text-waify-dark-text",
                    children: assignableRoles.map((role) => /* @__PURE__ */ jsx("option", { value: role.key, children: role.name }, role.key))
                  }
                ) : /* @__PURE__ */ jsxs(StatusBadge, { tone: roleTone(member.role, member.is_owner), children: [
                  member.is_owner ? /* @__PURE__ */ jsx(Crown, { className: "h-3.5 w-3.5" }) : member.role === "admin" ? /* @__PURE__ */ jsx(Shield, { className: "h-3.5 w-3.5" }) : /* @__PURE__ */ jsx(User, { className: "h-3.5 w-3.5" }),
                  roleName(roles, member.role, member.is_owner)
                ] }) }),
                /* @__PURE__ */ jsx("td", { className: "px-5 py-3.5", children: /* @__PURE__ */ jsx(StatusBadge, { tone: "success", dot: true, children: "Active" }) }),
                /* @__PURE__ */ jsx("td", { className: "relative px-5 py-3.5 text-right", children: can_manage && !member.is_owner && member.id !== current_user_id ? /* @__PURE__ */ jsxs(Fragment, { children: [
                  /* @__PURE__ */ jsx(IconButton, { size: "sm", "aria-label": "Member actions", onClick: () => setOpenMenu(openMenu === `member-${member.id}` ? null : `member-${member.id}`), children: /* @__PURE__ */ jsx(MoreHorizontal, { className: "h-4 w-4" }) }),
                  openMenu === `member-${member.id}` && /* @__PURE__ */ jsx("div", { className: "absolute right-4 z-20 mt-2 w-40 overflow-hidden rounded-card border border-gray-200 bg-white py-1 text-left shadow-pop dark:border-waify-dark-border dark:bg-waify-dark-surface", children: /* @__PURE__ */ jsxs(
                    "button",
                    {
                      type: "button",
                      onClick: () => {
                        setOpenMenu(null);
                        void handleRemove(member);
                      },
                      className: "flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50 dark:text-red-300 dark:hover:bg-red-500/10",
                      children: [
                        /* @__PURE__ */ jsx(Trash2, { className: "h-4 w-4" }),
                        " Remove"
                      ]
                    }
                  ) })
                ] }) : null })
              ] }, member.id)),
              can_manage && pending_invites?.map((invite) => /* @__PURE__ */ jsxs("tr", { className: "border-t border-gray-100 transition hover:bg-gray-50/60 dark:border-waify-dark-border dark:hover:bg-waify-dark-surface-2/70", children: [
                /* @__PURE__ */ jsx("td", { className: "px-5 py-3.5", children: /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3", children: [
                  /* @__PURE__ */ jsx(Avatar, { name: invite.email, size: "md" }),
                  /* @__PURE__ */ jsxs("div", { className: "min-w-0", children: [
                    /* @__PURE__ */ jsx("p", { className: "font-medium text-waify-text dark:text-waify-dark-text", children: invite.email }),
                    /* @__PURE__ */ jsxs("p", { className: "truncate text-xs text-waify-text-muted dark:text-waify-dark-text-muted", children: [
                      "Invited ",
                      formatDate(invite.invited_at)
                    ] })
                  ] })
                ] }) }),
                /* @__PURE__ */ jsx("td", { className: "px-5 py-3.5", children: /* @__PURE__ */ jsx(TagPill, { tone: "muted", children: roleName(roles, invite.role) }) }),
                /* @__PURE__ */ jsx("td", { className: "px-5 py-3.5", children: /* @__PURE__ */ jsx(StatusBadge, { tone: "warning", dot: true, children: "Pending" }) }),
                /* @__PURE__ */ jsxs("td", { className: "relative px-5 py-3.5 text-right", children: [
                  /* @__PURE__ */ jsx(IconButton, { size: "sm", "aria-label": "Invite actions", onClick: () => setOpenMenu(openMenu === `invite-${invite.id}` ? null : `invite-${invite.id}`), children: /* @__PURE__ */ jsx(MoreHorizontal, { className: "h-4 w-4" }) }),
                  openMenu === `invite-${invite.id}` && /* @__PURE__ */ jsxs("div", { className: "absolute right-4 z-20 mt-2 w-40 overflow-hidden rounded-card border border-gray-200 bg-white py-1 text-left shadow-pop dark:border-waify-dark-border dark:bg-waify-dark-surface", children: [
                    /* @__PURE__ */ jsxs("button", { type: "button", onClick: () => {
                      setOpenMenu(null);
                      void handleResendInvite(invite);
                    }, className: "flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-waify-text hover:bg-gray-50 dark:text-waify-dark-text dark:hover:bg-waify-dark-surface-2", children: [
                      /* @__PURE__ */ jsx(RefreshCw, { className: "h-4 w-4" }),
                      " Resend"
                    ] }),
                    /* @__PURE__ */ jsxs("button", { type: "button", onClick: () => {
                      setOpenMenu(null);
                      void handleRevokeInvite(invite);
                    }, className: "flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50 dark:text-red-300 dark:hover:bg-red-500/10", children: [
                      /* @__PURE__ */ jsx(Trash2, { className: "h-4 w-4" }),
                      " Revoke"
                    ] })
                  ] })
                ] })
              ] }, `invite-${invite.id}`))
            ] })
          ] }) })
        ] }),
        /* @__PURE__ */ jsx("div", { className: "space-y-3", children: roles.map((role) => /* @__PURE__ */ jsxs(Card, { className: "p-4", children: [
          /* @__PURE__ */ jsxs("div", { className: "flex items-start justify-between gap-3", children: [
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsxs("div", { className: "flex flex-wrap items-center gap-2", children: [
                /* @__PURE__ */ jsx("h3", { className: "font-semibold text-waify-text dark:text-waify-dark-text", children: role.name }),
                /* @__PURE__ */ jsx(StatusBadge, { tone: roleTone(role.key, role.is_owner), children: role.is_system ? "System" : "Custom" })
              ] }),
              /* @__PURE__ */ jsx("p", { className: "mt-1 text-sm text-waify-text-muted dark:text-waify-dark-text-muted", children: role.description || "Custom workspace access profile." })
            ] }),
            can_manage_roles && !role.is_system && /* @__PURE__ */ jsxs("div", { className: "flex gap-1", children: [
              /* @__PURE__ */ jsx(Button, { size: "xs", variant: "secondary", onClick: () => openEditRole(role), children: "Edit" }),
              /* @__PURE__ */ jsx(IconButton, { size: "sm", variant: "danger", "aria-label": "Delete role", onClick: () => void deleteRole(role), children: /* @__PURE__ */ jsx(Trash2, { className: "h-4 w-4" }) })
            ] })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "mt-3 flex flex-wrap gap-1.5", children: [
            role.permissions.slice(0, 5).map((permission) => /* @__PURE__ */ jsx(TagPill, { tone: permissionTone(permission), children: permissions.find((item) => item.key === permission)?.label ?? permission }, permission)),
            role.permissions.length > 5 && /* @__PURE__ */ jsxs(TagPill, { tone: "info", children: [
              "+",
              role.permissions.length - 5
            ] })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "mt-3 text-xs text-waify-text-muted dark:text-waify-dark-text-muted", children: [
            role.members_count ?? 0,
            " active · ",
            role.pending_invites_count ?? 0,
            " invited"
          ] })
        ] }, role.key)) })
      ] })
    ] }),
    /* @__PURE__ */ jsx(Drawer, { title: "Create agent", description: "Invite a staff member and assign their workspace role.", open: inviteOpen, onClose: () => setInviteOpen(false), children: /* @__PURE__ */ jsxs("div", { className: "space-y-4", children: [
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("label", { className: "text-sm font-medium text-waify-text dark:text-waify-dark-text", children: "Email address" }),
        /* @__PURE__ */ jsxs("div", { className: "relative mt-2", children: [
          /* @__PURE__ */ jsx(Mail, { className: "absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-waify-text-muted dark:text-waify-dark-text-muted" }),
          /* @__PURE__ */ jsx(
            TextInput,
            {
              type: "email",
              value: inviteEmail,
              onChange: (event) => setInviteEmail(event.target.value),
              onKeyDown: (event) => {
                if (event.key === "Enter") handleInvite();
              },
              placeholder: "agent@company.com",
              className: "h-11 w-full pl-9"
            }
          )
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("label", { className: "text-sm font-medium text-waify-text dark:text-waify-dark-text", children: "Role" }),
        /* @__PURE__ */ jsx(
          "select",
          {
            value: inviteRole,
            onChange: (event) => setInviteRole(event.target.value),
            className: "mt-2 h-11 w-full rounded-btn border border-gray-200 bg-white px-3 text-sm text-waify-text outline-none dark:border-waify-dark-border dark:bg-waify-dark-surface dark:text-waify-dark-text",
            children: assignableRoles.map((role) => /* @__PURE__ */ jsx("option", { value: role.key, children: role.name }, role.key))
          }
        )
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "flex justify-end gap-2 pt-2", children: [
        /* @__PURE__ */ jsx(Button, { variant: "secondary", onClick: () => setInviteOpen(false), children: "Cancel" }),
        /* @__PURE__ */ jsxs(Button, { onClick: handleInvite, disabled: processingInvite, children: [
          /* @__PURE__ */ jsx(Send, { className: "h-4 w-4" }),
          " Send invite"
        ] })
      ] })
    ] }) }),
    /* @__PURE__ */ jsx(Drawer, { title: roleForm.id ? "Edit role" : "Create role", description: "Choose exactly what staff can access in this workspace.", open: roleOpen, onClose: () => setRoleOpen(false), children: /* @__PURE__ */ jsxs("div", { className: "space-y-4", children: [
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("label", { className: "text-sm font-medium text-waify-text dark:text-waify-dark-text", children: "Role name" }),
        /* @__PURE__ */ jsx(TextInput, { value: roleForm.name, onChange: (event) => setRoleForm({ ...roleForm, name: event.target.value }), placeholder: "Sales agent", className: "mt-2 h-11 w-full" })
      ] }),
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("label", { className: "text-sm font-medium text-waify-text dark:text-waify-dark-text", children: "Description" }),
        /* @__PURE__ */ jsx(
          "textarea",
          {
            value: roleForm.description,
            onChange: (event) => setRoleForm({ ...roleForm, description: event.target.value }),
            placeholder: "What this role is used for",
            className: "mt-2 min-h-24 w-full rounded-btn border border-gray-200 bg-white px-3 py-2 text-sm text-waify-text outline-none dark:border-waify-dark-border dark:bg-waify-dark-surface dark:text-waify-dark-text"
          }
        )
      ] }),
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("p", { className: "text-sm font-medium text-waify-text dark:text-waify-dark-text", children: "Permissions" }),
        /* @__PURE__ */ jsx("div", { className: "mt-3 space-y-4", children: Object.entries(groupedPermissions).map(([group, items]) => /* @__PURE__ */ jsxs("div", { className: "rounded-card border border-gray-100 p-3 dark:border-waify-dark-border", children: [
          /* @__PURE__ */ jsx("div", { className: "mb-2 text-[11px] font-semibold uppercase tracking-wide text-waify-text-muted dark:text-waify-dark-text-muted", children: group }),
          /* @__PURE__ */ jsx("div", { className: "grid gap-2 sm:grid-cols-2", children: items.map((permission) => /* @__PURE__ */ jsxs("label", { className: "flex cursor-pointer items-start gap-2 rounded-card border border-gray-200 px-3 py-2 text-sm text-waify-text dark:border-waify-dark-border dark:text-waify-dark-text", children: [
            /* @__PURE__ */ jsx(
              "input",
              {
                type: "checkbox",
                checked: roleForm.permissions.includes(permission.key),
                onChange: () => togglePermission(permission.key),
                className: "mt-0.5 h-4 w-4 rounded border-gray-300 text-waify-green focus:ring-waify-green"
              }
            ),
            /* @__PURE__ */ jsxs("span", { className: "min-w-0 flex-1", children: [
              /* @__PURE__ */ jsx("span", { className: "block font-medium", children: permission.label }),
              /* @__PURE__ */ jsxs("span", { className: "mt-1 flex flex-wrap gap-1", children: [
                (permission.owner_only || permission.key.endsWith(".owner")) && /* @__PURE__ */ jsx(TagPill, { tone: "warning", children: "Owner only" }),
                (permission.sensitive || permissionTone(permission.key) === "danger") && /* @__PURE__ */ jsx(TagPill, { tone: "danger", children: "Sensitive" }),
                permission.key.includes("export") && /* @__PURE__ */ jsx(TagPill, { tone: "info", children: "Export" })
              ] })
            ] })
          ] }, permission.key)) })
        ] }, group)) })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "flex justify-end gap-2 pt-2", children: [
        /* @__PURE__ */ jsx(Button, { variant: "secondary", onClick: () => setRoleOpen(false), children: "Cancel" }),
        /* @__PURE__ */ jsxs(Button, { onClick: saveRole, children: [
          /* @__PURE__ */ jsx(Save, { className: "h-4 w-4" }),
          " Save role"
        ] })
      ] })
    ] }) })
  ] });
}
export {
  TeamIndex as default
};
