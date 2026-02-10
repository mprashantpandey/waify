import { jsxs, jsx, Fragment } from "react/jsx-runtime";
import { Head, router } from "@inertiajs/react";
import { A as AppShell } from "./AppShell-B4peoZD-.js";
import { C as Card, b as CardHeader, c as CardTitle, d as CardDescription, a as CardContent } from "./Card-DLPTnTfC.js";
import { B as Badge } from "./Badge-CHx1ViYT.js";
import { B as Button } from "./Button-ymbdH_NY.js";
import { I as Input } from "./Input-B0lHg7LA.js";
import { L as Label } from "./Label-DSCoVIUl.js";
import { u as useNotifications } from "./useNotifications-BFFaoN1-.js";
import { UserPlus, Sparkles, Mail, Calendar, Edit, Trash2, Crown, Shield, User } from "lucide-react";
import { useState } from "react";
import "./utils-B2ZNUmII.js";
import "clsx";
import "tailwind-merge";
import "./RealtimeProvider-Dletx5Ny.js";
import "laravel-echo";
import "pusher-js";
import "./GlobalFlashHandler-CNoF0uzm.js";
import "./useToast-DNfJQ6ZA.js";
import "./BrandingWrapper-B2Mh0bYb.js";
import "./Alert-DWa0cnrh.js";
import "./CookieConsentBanner-BJ5KL4CC.js";
import "./useConfirm-BKf7Nv1N.js";
function TeamIndex({
  account,
  members,
  can_manage,
  current_user_id,
  pending_invites
}) {
  const { confirm, toast } = useNotifications();
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState("member");
  const [showInviteDialog, setShowInviteDialog] = useState(false);
  const [editingMember, setEditingMember] = useState(null);
  const handleInvite = () => {
    if (!inviteEmail || !inviteRole) {
      toast.error("Please fill in all fields");
      return;
    }
    router.post(
      route("app.team.invite", {}),
      {
        email: inviteEmail,
        role: inviteRole
      },
      {
        onSuccess: () => {
          toast.success("Member invited successfully");
          setInviteEmail("");
          setInviteRole("member");
          setShowInviteDialog(false);
        },
        onError: (errors) => {
          if (errors.email) {
            toast.error(errors.email);
          } else {
            toast.error("Failed to invite member");
          }
        }
      }
    );
  };
  const handleUpdateRole = async (member, newRole) => {
    if (member.role === newRole) return;
    const confirmed = await confirm({
      title: "Update Role",
      message: `Change ${member.name}'s role to ${newRole}?`,
      variant: "info"
    });
    if (confirmed) {
      router.post(
        route("app.team.update-role", { user: member.id }),
        { role: newRole },
        {
          onSuccess: () => {
            toast.success("Role updated successfully");
            setEditingMember(null);
          },
          onError: () => {
            toast.error("Failed to update role");
          }
        }
      );
    }
  };
  const handleRemove = async (member) => {
    const confirmed = await confirm({
      title: "Remove Member",
      message: `Are you sure you want to remove ${member.name} from this account?`,
      variant: "danger",
      confirmText: "Remove"
    });
    if (confirmed) {
      router.delete(
        route("app.team.remove", { user: member.id }),
        {
          onSuccess: () => {
            toast.success("Member removed successfully");
            router.reload({ only: ["members"] });
          },
          onError: () => {
            toast.error("Failed to remove member");
          }
        }
      );
    }
  };
  const handleRevokeInvite = async (invite) => {
    const confirmed = await confirm({
      title: "Revoke Invitation",
      message: `Revoke invitation for ${invite.email}?`,
      variant: "danger",
      confirmText: "Revoke"
    });
    if (confirmed) {
      router.delete(
        route("app.team.invites.revoke", { invitation: invite.id }),
        {
          onSuccess: () => {
            toast.success("Invitation revoked successfully");
          },
          onError: () => {
            toast.error("Failed to revoke invitation");
          }
        }
      );
    }
  };
  const handleResendInvite = async (invite) => {
    if (invite.expires_at && new Date(invite.expires_at) > /* @__PURE__ */ new Date()) {
      toast.error("You can resend after the invite expires.");
      return;
    }
    const confirmed = await confirm({
      title: "Resend Invitation",
      message: `Resend invitation to ${invite.email}?`,
      variant: "info",
      confirmText: "Resend"
    });
    if (confirmed) {
      router.post(
        route("app.team.invites.resend", { invitation: invite.id }),
        {},
        {
          onSuccess: () => {
            toast.success("Invitation resent successfully");
          },
          onError: () => {
            toast.error("Failed to resend invitation");
          }
        }
      );
    }
  };
  const getExpiryInfo = (invite) => {
    if (!invite.expires_at) return null;
    const expiresAt = new Date(invite.expires_at);
    const now = /* @__PURE__ */ new Date();
    if (expiresAt <= now) {
      return { label: "Expired", variant: "danger", daysLeft: 0, expired: true };
    }
    const diffMs = expiresAt.getTime() - now.getTime();
    const daysLeft = Math.max(1, Math.ceil(diffMs / (1e3 * 60 * 60 * 24)));
    return { label: `Expires in ${daysLeft} day${daysLeft === 1 ? "" : "s"}`, variant: "warning", daysLeft, expired: false };
  };
  const getRoleBadge = (role, isOwner) => {
    if (isOwner) {
      return /* @__PURE__ */ jsxs(Badge, { variant: "warning", className: "flex items-center gap-1.5 px-3 py-1", children: [
        /* @__PURE__ */ jsx(Crown, { className: "h-3.5 w-3.5" }),
        "Owner"
      ] });
    }
    if (role === "admin") {
      return /* @__PURE__ */ jsxs(Badge, { variant: "info", className: "flex items-center gap-1.5 px-3 py-1", children: [
        /* @__PURE__ */ jsx(Shield, { className: "h-3.5 w-3.5" }),
        "Admin"
      ] });
    }
    return /* @__PURE__ */ jsxs(Badge, { variant: "default", className: "flex items-center gap-1.5 px-3 py-1", children: [
      /* @__PURE__ */ jsx(User, { className: "h-3.5 w-3.5" }),
      "Member"
    ] });
  };
  return /* @__PURE__ */ jsxs(AppShell, { children: [
    /* @__PURE__ */ jsx(Head, { title: "Team" }),
    /* @__PURE__ */ jsxs("div", { className: "space-y-8", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between", children: [
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("h1", { className: "text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-gray-100 dark:to-gray-300 bg-clip-text text-transparent", children: "Team" }),
          /* @__PURE__ */ jsx("p", { className: "mt-2 text-sm text-gray-600 dark:text-gray-400", children: "Manage your team members" })
        ] }),
        can_manage && /* @__PURE__ */ jsxs(
          Button,
          {
            onClick: () => setShowInviteDialog(true),
            className: "bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 shadow-lg shadow-blue-500/50",
            children: [
              /* @__PURE__ */ jsx(UserPlus, { className: "h-4 w-4 mr-2" }),
              "Invite Member"
            ]
          }
        )
      ] }),
      showInviteDialog && /* @__PURE__ */ jsxs(Card, { className: "border-0 shadow-xl", children: [
        /* @__PURE__ */ jsxs(CardHeader, { className: "bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20", children: [
          /* @__PURE__ */ jsxs(CardTitle, { className: "flex items-center gap-2", children: [
            /* @__PURE__ */ jsx(Sparkles, { className: "h-5 w-5 text-blue-600 dark:text-blue-400" }),
            "Invite Team Member"
          ] }),
          /* @__PURE__ */ jsx(CardDescription, { children: "Invite a user to join your account" })
        ] }),
        /* @__PURE__ */ jsxs(CardContent, { className: "space-y-5 pt-6", children: [
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx(Label, { htmlFor: "email", className: "text-sm font-semibold", children: "Email Address" }),
            /* @__PURE__ */ jsx(
              Input,
              {
                id: "email",
                type: "email",
                value: inviteEmail,
                onChange: (e) => setInviteEmail(e.target.value),
                placeholder: "user@example.com",
                className: "mt-2"
              }
            ),
            /* @__PURE__ */ jsxs("p", { className: "text-xs text-gray-500 dark:text-gray-400 mt-2 flex items-center gap-1", children: [
              /* @__PURE__ */ jsx(Mail, { className: "h-3 w-3" }),
              "User must already have an account"
            ] })
          ] }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx(Label, { htmlFor: "role", className: "text-sm font-semibold", children: "Role" }),
            /* @__PURE__ */ jsxs(
              "select",
              {
                id: "role",
                value: inviteRole,
                onChange: (e) => setInviteRole(e.target.value),
                className: "mt-2 w-full rounded-xl border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100 px-4 py-2.5",
                children: [
                  /* @__PURE__ */ jsx("option", { value: "member", children: "Member" }),
                  /* @__PURE__ */ jsx("option", { value: "admin", children: "Admin" })
                ]
              }
            )
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3 pt-2", children: [
            /* @__PURE__ */ jsx(Button, { onClick: handleInvite, className: "flex-1 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700", children: "Send Invitation" }),
            /* @__PURE__ */ jsx(Button, { variant: "secondary", onClick: () => setShowInviteDialog(false), className: "flex-1", children: "Cancel" })
          ] })
        ] })
      ] }),
      can_manage && pending_invites && pending_invites.length > 0 && /* @__PURE__ */ jsxs(Card, { className: "border-0 shadow-xl", children: [
        /* @__PURE__ */ jsxs(CardHeader, { className: "bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20", children: [
          /* @__PURE__ */ jsxs(CardTitle, { className: "flex items-center gap-2", children: [
            /* @__PURE__ */ jsx(Mail, { className: "h-5 w-5 text-amber-600 dark:text-amber-400" }),
            "Pending Invitations"
          ] }),
          /* @__PURE__ */ jsx(CardDescription, { children: "Invitations that are waiting for acceptance" })
        ] }),
        /* @__PURE__ */ jsx(CardContent, { className: "pt-6 space-y-3", children: pending_invites.map((invite) => /* @__PURE__ */ jsxs(
          "div",
          {
            className: "flex items-center justify-between rounded-xl border border-amber-100 dark:border-amber-900/40 bg-white dark:bg-gray-900 px-4 py-3",
            children: [
              /* @__PURE__ */ jsxs("div", { children: [
                /* @__PURE__ */ jsx("div", { className: "font-semibold text-gray-900 dark:text-gray-100", children: invite.email }),
                /* @__PURE__ */ jsxs("div", { className: "text-xs text-gray-500 dark:text-gray-400", children: [
                  "Role: ",
                  invite.role,
                  invite.expires_at ? ` • Expires ${new Date(invite.expires_at).toLocaleDateString()}` : ""
                ] }),
                invite.expires_at && /* @__PURE__ */ jsx("div", { className: "mt-1", children: (() => {
                  const info = getExpiryInfo(invite);
                  if (!info) return null;
                  return /* @__PURE__ */ jsx(Badge, { variant: info.variant, className: "text-xs", children: info.label });
                })() })
              ] }),
              /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
                /* @__PURE__ */ jsx(
                  Button,
                  {
                    variant: "secondary",
                    size: "sm",
                    onClick: () => handleResendInvite(invite),
                    disabled: invite.expires_at ? new Date(invite.expires_at) > /* @__PURE__ */ new Date() : false,
                    children: "Resend"
                  }
                ),
                /* @__PURE__ */ jsx(
                  Button,
                  {
                    variant: "secondary",
                    size: "sm",
                    onClick: () => handleRevokeInvite(invite),
                    children: "Revoke"
                  }
                )
              ] })
            ]
          },
          invite.id
        )) })
      ] }),
      /* @__PURE__ */ jsxs(Card, { className: "border-0 shadow-lg", children: [
        /* @__PURE__ */ jsx(CardHeader, { className: "bg-gradient-to-r from-gray-50 to-white dark:from-gray-800 dark:to-gray-900", children: /* @__PURE__ */ jsx("div", { className: "flex items-center justify-between", children: /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx(CardTitle, { className: "text-xl font-bold", children: "Team Members" }),
          /* @__PURE__ */ jsxs(CardDescription, { className: "mt-1", children: [
            members.length,
            " total members"
          ] })
        ] }) }) }),
        /* @__PURE__ */ jsx(CardContent, { className: "p-6", children: /* @__PURE__ */ jsx("div", { className: "space-y-3", children: members.map((member) => /* @__PURE__ */ jsxs(
          "div",
          {
            className: "flex items-center justify-between p-5 bg-gradient-to-r from-gray-50 to-white dark:from-gray-800 dark:to-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 hover:shadow-md transition-all duration-200 group",
            children: [
              /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-4 flex-1", children: [
                /* @__PURE__ */ jsx("div", { className: "h-12 w-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-lg shadow-lg group-hover:scale-110 transition-transform duration-200", children: member.name.charAt(0).toUpperCase() }),
                /* @__PURE__ */ jsxs("div", { className: "flex-1 min-w-0", children: [
                  /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 mb-1", children: [
                    /* @__PURE__ */ jsx("p", { className: "text-base font-semibold text-gray-900 dark:text-gray-100", children: member.name }),
                    member.id === current_user_id && /* @__PURE__ */ jsx("span", { className: "text-xs px-2 py-0.5 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 rounded-full font-medium", children: "You" })
                  ] }),
                  /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3 text-sm text-gray-500 dark:text-gray-400", children: [
                    /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-1.5", children: [
                      /* @__PURE__ */ jsx(Mail, { className: "h-3.5 w-3.5" }),
                      member.email
                    ] }),
                    /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-1.5", children: [
                      /* @__PURE__ */ jsx(Calendar, { className: "h-3.5 w-3.5" }),
                      "Joined ",
                      new Date(member.joined_at).toLocaleDateString()
                    ] })
                  ] })
                ] })
              ] }),
              /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3", children: [
                getRoleBadge(member.role, member.is_owner),
                can_manage && !member.is_owner && member.id !== current_user_id && /* @__PURE__ */ jsx("div", { className: "flex items-center gap-2", children: editingMember?.id === member.id ? /* @__PURE__ */ jsxs(
                  "select",
                  {
                    value: member.role,
                    onChange: (e) => handleUpdateRole(member, e.target.value),
                    className: "text-sm rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-700 px-3 py-1.5",
                    onBlur: () => setEditingMember(null),
                    autoFocus: true,
                    children: [
                      /* @__PURE__ */ jsx("option", { value: "member", children: "Member" }),
                      /* @__PURE__ */ jsx("option", { value: "admin", children: "Admin" })
                    ]
                  }
                ) : /* @__PURE__ */ jsxs(Fragment, { children: [
                  /* @__PURE__ */ jsx(
                    "button",
                    {
                      onClick: () => setEditingMember(member),
                      className: "p-2 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 text-blue-600 dark:text-blue-400 transition-colors",
                      children: /* @__PURE__ */ jsx(Edit, { className: "h-4 w-4" })
                    }
                  ),
                  /* @__PURE__ */ jsx(
                    "button",
                    {
                      onClick: () => handleRemove(member),
                      className: "p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600 dark:text-red-400 transition-colors",
                      children: /* @__PURE__ */ jsx(Trash2, { className: "h-4 w-4" })
                    }
                  )
                ] }) })
              ] })
            ]
          },
          member.id
        )) }) })
      ] })
    ] })
  ] });
}
export {
  TeamIndex as default
};
