import { jsxs, jsx, Fragment } from "react/jsx-runtime";
import { useState } from "react";
import { usePage, useForm, router } from "@inertiajs/react";
import { Transition } from "@headlessui/react";
import { Lock, EyeOff, Eye, Save, CheckCircle2, ShieldCheck, Smartphone, KeyRound, Trash2 } from "lucide-react";
import { C as Card } from "./Card-BtIXZ0GS.js";
import { A as Alert } from "./Alert-CEZ-sRON.js";
import { M as Modal } from "./Elements-EbyZDnT_.js";
import { B as Button } from "./Button-BJftGNki.js";
import { T as TextInput } from "./TextInput-CmkZX80k.js";
import { I as InputLabel } from "./InputLabel-BMzefKC8.js";
import { I as InputError } from "./InputError-DiSBWiye.js";
import { u as useNotifications } from "./useNotifications-CWqdQOlf.js";
import { T as TwoFactorSetupPanel } from "./TwoFactorSetupPanel-D-GRENr8.js";
import "./utils-B2ZNUmII.js";
import "clsx";
import "tailwind-merge";
import "./useToast-BN7qsQL3.js";
import "./useConfirm-gGqxmsEz.js";
import "qrcode";
function SecurityTab() {
  const { auth, security } = usePage().props;
  const user = auth?.user;
  const { confirm, toast } = useNotifications();
  const [visiblePasswords, setVisiblePasswords] = useState({});
  const [deletePasswordOpen, setDeletePasswordOpen] = useState(false);
  const [deletePassword, setDeletePassword] = useState("");
  const { data, setData, put, processing, errors, reset, recentlySuccessful } = useForm({
    current_password: "",
    password: "",
    password_confirmation: ""
  });
  const twoFactorForm = useForm({ code: "", password: "" });
  const sessionForm = useForm({ password: "" });
  const submit = (e) => {
    e.preventDefault();
    put(route("password.update"), {
      preserveScroll: true,
      onSuccess: () => {
        toast.success("Password updated successfully");
        reset();
      },
      onError: () => {
        toast.error("Failed to update password");
      }
    });
  };
  const deleteAccount = async () => {
    const confirmed = await confirm({
      title: "Delete Account",
      message: "Are you sure you want to delete your account? This action cannot be undone. All of your data will be permanently deleted.",
      variant: "danger",
      confirmText: "Delete Account"
    });
    if (!confirmed) return;
    setDeletePassword("");
    setDeletePasswordOpen(true);
  };
  const confirmDeleteAccount = () => {
    if (!deletePassword) return;
    router.delete(route("profile.destroy"), {
      data: { password: deletePassword },
      onSuccess: () => toast.success("Account deleted successfully"),
      onError: () => toast.error("Failed to delete account")
    });
  };
  return /* @__PURE__ */ jsxs("div", { className: "space-y-6", children: [
    /* @__PURE__ */ jsx(Card, { className: "p-5", children: /* @__PURE__ */ jsxs("form", { onSubmit: submit, className: "space-y-5", children: [
      /* @__PURE__ */ jsxs("div", { className: "mb-1 flex items-start gap-3", children: [
        /* @__PURE__ */ jsx("span", { className: "flex h-9 w-9 items-center justify-center rounded-lg bg-gray-100 text-waify-text-muted dark:bg-slate-700 dark:text-waify-dark-text-muted", children: /* @__PURE__ */ jsx(Lock, { className: "h-4 w-4" }) }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("div", { className: "text-sm font-semibold text-waify-text dark:text-waify-dark-text", children: "Password" }),
          /* @__PURE__ */ jsx("p", { className: "mt-0.5 text-xs text-waify-text-muted dark:text-waify-dark-text-muted", children: "Change the password used to sign in to this account." })
        ] })
      ] }),
      [
        ["current_password", "Current password", "current-password", "Enter current password"],
        ["password", "New password", "new-password", "Enter new password"],
        ["password_confirmation", "Confirm password", "new-password", "Confirm new password"]
      ].map(([field, label, autocomplete, placeholder]) => /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx(InputLabel, { htmlFor: field, value: label, className: "mb-1 text-xs font-medium text-waify-text dark:text-waify-dark-text" }),
        /* @__PURE__ */ jsxs("div", { className: "relative", children: [
          /* @__PURE__ */ jsx(Lock, { className: "absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" }),
          /* @__PURE__ */ jsx(
            TextInput,
            {
              id: field,
              type: visiblePasswords[field] ? "text" : "password",
              value: data[field],
              onChange: (e) => setData(field, e.target.value),
              className: "block h-9 w-full rounded-btn border-gray-200 pl-9 pr-10 text-sm focus:border-waify-green focus:ring-waify-green/15 dark:border-slate-600 dark:bg-slate-900",
              autoComplete: autocomplete,
              placeholder
            }
          ),
          /* @__PURE__ */ jsx(
            "button",
            {
              type: "button",
              onClick: () => setVisiblePasswords((current) => ({ ...current, [field]: !current[field] })),
              className: "absolute right-2 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-md text-gray-400 transition hover:bg-gray-100 hover:text-waify-text dark:hover:bg-slate-800 dark:hover:text-waify-dark-text",
              "aria-label": visiblePasswords[field] ? `Hide ${label}` : `Show ${label}`,
              children: visiblePasswords[field] ? /* @__PURE__ */ jsx(EyeOff, { className: "h-4 w-4" }) : /* @__PURE__ */ jsx(Eye, { className: "h-4 w-4" })
            }
          )
        ] }),
        /* @__PURE__ */ jsx(InputError, { message: errors[field], className: "mt-2 text-xs" })
      ] }, field)),
      /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-end gap-4 border-t border-gray-100 pt-4 dark:border-slate-700", children: [
        /* @__PURE__ */ jsx(Button, { type: "submit", disabled: processing, children: processing ? "Updating..." : /* @__PURE__ */ jsxs(Fragment, { children: [
          /* @__PURE__ */ jsx(Save, { className: "h-4 w-4" }),
          "Update password"
        ] }) }),
        /* @__PURE__ */ jsx(Transition, { show: recentlySuccessful, enter: "transition ease-in-out", enterFrom: "opacity-0", leave: "transition ease-in-out", leaveTo: "opacity-0", children: /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 text-sm text-emerald-600 dark:text-emerald-300", children: [
          /* @__PURE__ */ jsx(CheckCircle2, { className: "h-4 w-4" }),
          "Updated"
        ] }) })
      ] })
    ] }) }),
    /* @__PURE__ */ jsxs(Card, { className: "p-5", children: [
      /* @__PURE__ */ jsxs("div", { className: "mb-4 flex items-start gap-3", children: [
        /* @__PURE__ */ jsx("span", { className: "flex h-9 w-9 items-center justify-center rounded-lg bg-waify-green-soft text-waify-green-dark dark:bg-waify-green/10 dark:text-waify-green", children: /* @__PURE__ */ jsx(ShieldCheck, { className: "h-4 w-4" }) }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("div", { className: "text-sm font-semibold text-waify-text dark:text-waify-dark-text", children: "Two-factor authentication" }),
          /* @__PURE__ */ jsx("p", { className: "mt-0.5 text-xs text-waify-text-muted dark:text-waify-dark-text-muted", children: "Use an authenticator app for owner and admin account protection." })
        ] })
      ] }),
      user?.two_factor_enabled ? /* @__PURE__ */ jsxs("div", { className: "space-y-3", children: [
        /* @__PURE__ */ jsx("div", { className: "rounded-card border border-emerald-100 bg-emerald-50 p-3 text-sm text-emerald-800 dark:border-emerald-900/60 dark:bg-emerald-950/30 dark:text-emerald-200", children: "2FA is enabled." }),
        /* @__PURE__ */ jsxs("div", { className: "flex flex-col gap-2 sm:flex-row", children: [
          /* @__PURE__ */ jsx("input", { type: "password", value: twoFactorForm.data.password, onChange: (event) => twoFactorForm.setData("password", event.target.value), placeholder: "Current password", className: "waify-input flex-1" }),
          /* @__PURE__ */ jsx(Button, { type: "button", variant: "danger", onClick: () => twoFactorForm.delete(route("two-factor.disable"), { preserveScroll: true }), disabled: !twoFactorForm.data.password || twoFactorForm.processing, children: "Disable 2FA" })
        ] }),
        /* @__PURE__ */ jsx(InputError, { message: twoFactorForm.errors.password, className: "text-xs" })
      ] }) : security?.two_factor_setup ? /* @__PURE__ */ jsxs("div", { className: "space-y-3", children: [
        /* @__PURE__ */ jsx(TwoFactorSetupPanel, { setup: security.two_factor_setup }),
        /* @__PURE__ */ jsxs("div", { className: "flex flex-col gap-2 sm:flex-row", children: [
          /* @__PURE__ */ jsx("input", { value: twoFactorForm.data.code, onChange: (event) => twoFactorForm.setData("code", event.target.value), placeholder: "6-digit code", className: "waify-input flex-1 font-mono", inputMode: "numeric" }),
          /* @__PURE__ */ jsx(Button, { type: "button", onClick: () => twoFactorForm.post(route("two-factor.enable"), { preserveScroll: true }), disabled: twoFactorForm.data.code.length < 6 || twoFactorForm.processing, children: "Verify & enable" })
        ] }),
        /* @__PURE__ */ jsx(InputError, { message: twoFactorForm.errors.code, className: "text-xs" })
      ] }) : /* @__PURE__ */ jsxs(Button, { type: "button", variant: "secondary", onClick: () => twoFactorForm.post(route("two-factor.prepare"), { preserveScroll: true }), children: [
        /* @__PURE__ */ jsx(Smartphone, { className: "h-4 w-4" }),
        "Start 2FA setup"
      ] })
    ] }),
    /* @__PURE__ */ jsxs(Card, { className: "p-5", children: [
      /* @__PURE__ */ jsxs("div", { className: "mb-4 flex items-start gap-3", children: [
        /* @__PURE__ */ jsx("span", { className: "flex h-9 w-9 items-center justify-center rounded-lg bg-gray-100 text-waify-text-muted dark:bg-slate-700 dark:text-waify-dark-text-muted", children: /* @__PURE__ */ jsx(KeyRound, { className: "h-4 w-4" }) }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("div", { className: "text-sm font-semibold text-waify-text dark:text-waify-dark-text", children: "Sessions" }),
          /* @__PURE__ */ jsx("p", { className: "mt-0.5 text-xs text-waify-text-muted dark:text-waify-dark-text-muted", children: "Review active browser sessions and revoke old devices." })
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
        (security?.sessions || []).map((session) => /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between gap-3 rounded-card border border-gray-100 p-3 text-sm dark:border-waify-dark-border", children: [
          /* @__PURE__ */ jsxs("div", { className: "min-w-0", children: [
            /* @__PURE__ */ jsxs("div", { className: "font-medium text-waify-text dark:text-waify-dark-text", children: [
              session.ip_address || "Unknown IP",
              " ",
              session.is_current ? "(current)" : ""
            ] }),
            /* @__PURE__ */ jsx("div", { className: "truncate text-xs text-waify-text-muted dark:text-waify-dark-text-muted", children: session.user_agent || "Unknown device" })
          ] }),
          /* @__PURE__ */ jsx("div", { className: "shrink-0 text-xs text-waify-text-muted dark:text-waify-dark-text-muted", children: new Date(session.last_activity).toLocaleString() })
        ] }, session.id)),
        (security?.sessions || []).length === 0 && /* @__PURE__ */ jsx("div", { className: "rounded-card border border-gray-100 p-3 text-sm text-waify-text-muted dark:border-waify-dark-border dark:text-waify-dark-text-muted", children: "No active sessions found." })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "mt-4 flex flex-col gap-2 sm:flex-row", children: [
        /* @__PURE__ */ jsx("input", { type: "password", value: sessionForm.data.password, onChange: (event) => sessionForm.setData("password", event.target.value), placeholder: "Current password", className: "waify-input flex-1" }),
        /* @__PURE__ */ jsx(Button, { type: "button", variant: "secondary", onClick: () => sessionForm.delete(route("profile.sessions.destroy-others"), { preserveScroll: true }), disabled: !sessionForm.data.password || sessionForm.processing, children: "Revoke other sessions" })
      ] }),
      /* @__PURE__ */ jsx(InputError, { message: sessionForm.errors.password, className: "mt-2 text-xs" })
    ] }),
    /* @__PURE__ */ jsxs(Card, { className: "border-red-200 p-5 dark:border-red-500/30", children: [
      /* @__PURE__ */ jsx(Alert, { variant: "error", title: "Delete account", children: "Once your account is deleted, all of its resources and data will be permanently deleted." }),
      /* @__PURE__ */ jsxs(Button, { variant: "danger", onClick: deleteAccount, className: "mt-4", children: [
        /* @__PURE__ */ jsx(Trash2, { className: "h-4 w-4" }),
        "Delete account"
      ] })
    ] }),
    /* @__PURE__ */ jsxs(
      Modal,
      {
        open: deletePasswordOpen,
        onClose: () => setDeletePasswordOpen(false),
        title: "Confirm account deletion",
        description: "Enter your current password to permanently delete your account.",
        footer: /* @__PURE__ */ jsxs(Fragment, { children: [
          /* @__PURE__ */ jsx(Button, { type: "button", variant: "secondary", onClick: () => setDeletePasswordOpen(false), children: "Cancel" }),
          /* @__PURE__ */ jsxs(Button, { type: "button", variant: "danger", onClick: confirmDeleteAccount, disabled: !deletePassword, children: [
            /* @__PURE__ */ jsx(Trash2, { className: "h-4 w-4" }),
            "Delete account"
          ] })
        ] }),
        children: [
          /* @__PURE__ */ jsx(InputLabel, { htmlFor: "delete-password", value: "Current password", className: "mb-1 text-xs font-medium text-waify-text dark:text-waify-dark-text" }),
          /* @__PURE__ */ jsx(
            TextInput,
            {
              id: "delete-password",
              type: "password",
              value: deletePassword,
              onChange: (event) => setDeletePassword(event.target.value),
              className: "block h-9 w-full rounded-btn border-gray-200 text-sm focus:border-waify-green focus:ring-waify-green/15 dark:border-slate-600 dark:bg-slate-900",
              autoComplete: "current-password",
              placeholder: "Enter current password"
            }
          )
        ]
      }
    )
  ] });
}
export {
  SecurityTab as default
};
